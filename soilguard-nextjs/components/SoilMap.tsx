'use client';
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export interface SectorProperties {
  rank: number;
  name: string;
  gridId: string;
  block: string;
  urgency: 'CRITICAL' | 'MODERATE' | 'STABLE';
  tier: 1 | 2 | 3;
  risk: number;
  bare: number;
  highRisk: number;
  pct: number;
  soc: number;
  bsi: number;
  ph: number;
  recommendations: string[];
  bounds?: [[number, number], [number, number]];
  centroid?: [number, number];
}

export type BasemapMode = 'satellite' | 'dark' | 'osm';
export type EntityLevel = 'sectors' | 'districts';
export type RasterOverlayMode = 'none' | 'soc_risk' | 'ndvi' | 'bsi' | 'false_color' | 'confidence' | 'zonal_grid';

interface SoilMapProps {
  entityLevel: EntityLevel;
  basemap: BasemapMode;
  rasterOverlay: RasterOverlayMode;
  rasterOpacity: number;
  selectedSectorId?: string | null;
  onSelectSector?: (sector: SectorProperties | null) => void;
  onSelectDistrict?: (districtName: string) => void;
  mapboxToken?: string;
}

// 10m Sentinel-2 / SoilGuard Golden AOI WGS84 Geographic Bounds
export const RAIPUR_AOI_BOUNDS: L.LatLngBoundsExpression = [
  [21.099157, 81.599193],
  [21.300832, 81.801108]
];

const RASTER_URLS: Record<RasterOverlayMode, string | null> = {
  none: null,
  soc_risk: '/maps/risk_score_map.png',
  ndvi: '/maps/ndvi_map.png',
  bsi: '/maps/bsi_map.png',
  false_color: '/maps/false_color_composite.png',
  confidence: '/maps/model_confidence_map.png',
  zonal_grid: '/maps/zonal_risk_map.png'
};

function sectorColor(risk: number): string {
  if (risk >= 0.58) return '#ef4444'; // CRITICAL
  if (risk >= 0.46) return '#f59e0b'; // MODERATE
  return '#10b981'; // STABLE
}

export default function SoilMap({
  entityLevel,
  basemap,
  rasterOverlay,
  rasterOpacity,
  selectedSectorId,
  onSelectSector,
  onSelectDistrict,
  mapboxToken
}: SoilMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const geojsonLayerRef = useRef<L.GeoJSON | null>(null);
  const imageOverlayRef = useRef<L.ImageOverlay | null>(null);

  const [districtsGeojson, setDistrictsGeojson] = useState<any>(null);
  const [sectorsGeojson, setSectorsGeojson] = useState<any>(null);

  const onSelectSectorRef = useRef(onSelectSector);
  useEffect(() => { onSelectSectorRef.current = onSelectSector; }, [onSelectSector]);

  const onSelectDistrictRef = useRef(onSelectDistrict);
  useEffect(() => { onSelectDistrictRef.current = onSelectDistrict; }, [onSelectDistrict]);

  // Load GeoJSON data files
  useEffect(() => {
    fetch('/chhattisgarh-districts.geojson')
      .then(r => r.json())
      .then(setDistrictsGeojson)
      .catch(e => console.error('Districts GeoJSON load error:', e));

    fetch('/chhattisgarh-sectors.geojson')
      .then(r => r.json())
      .then(setSectorsGeojson)
      .catch(e => console.error('Sectors GeoJSON load error:', e));
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!containerRef.current) return;
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const initialCenter: L.LatLngExpression = entityLevel === 'sectors'
      ? [21.200, 81.700]
      : [21.278, 81.866];
    const initialZoom = entityLevel === 'sectors' ? 11 : 7;

    const map = L.map(containerRef.current, {
      center: initialCenter,
      zoom: initialZoom,
      zoomControl: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update Basemap Layer
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      tileLayerRef.current.remove();
      tileLayerRef.current = null;
    }

    let url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    let attribution = 'Tiles &copy; Esri &mdash; High-Resolution Satellite';
    let maxZoom = 19;

    if (basemap === 'satellite') {
      if (mapboxToken) {
        url = `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/tiles/256/{z}/{x}/{y}@2x?access_token=${mapboxToken}`;
        attribution = '&copy; Mapbox &copy; OpenStreetMap';
      } else {
        url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
        attribution = 'Tiles &copy; Esri (High-Resolution Satellite)';
      }
    } else if (basemap === 'dark') {
      url = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
      attribution = '&copy; <a href="https://carto.com/">CARTO</a>';
    } else if (basemap === 'osm') {
      url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      attribution = '&copy; OpenStreetMap contributors';
    }

    tileLayerRef.current = L.tileLayer(url, {
      attribution,
      maxZoom
    }).addTo(map);
  }, [basemap, mapboxToken]);

  // Update Remote Sensing 10m Raster Overlay
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (imageOverlayRef.current) {
      imageOverlayRef.current.remove();
      imageOverlayRef.current = null;
    }

    const rasterUrl = RASTER_URLS[rasterOverlay];
    if (rasterUrl) {
      const overlay = L.imageOverlay(rasterUrl, RAIPUR_AOI_BOUNDS, {
        opacity: rasterOpacity,
        interactive: false
      }).addTo(map);
      imageOverlayRef.current = overlay;
    }
  }, [rasterOverlay, rasterOpacity]);

  // Render Vector Polygons (Sectors or Districts)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (geojsonLayerRef.current) {
      geojsonLayerRef.current.remove();
      geojsonLayerRef.current = null;
    }

    if (entityLevel === 'sectors' && sectorsGeojson) {
      const layer = L.geoJSON(sectorsGeojson, {
        style: (feature) => {
          const props: SectorProperties = feature?.properties;
          const isSelected = props.gridId === selectedSectorId;
          const color = sectorColor(props.risk);

          return {
            fillColor: color,
            fillOpacity: isSelected ? 0.65 : rasterOverlay !== 'none' ? 0.20 : 0.45,
            color: isSelected ? '#00d4ff' : color,
            weight: isSelected ? 3 : 1.5,
            dashArray: isSelected ? '' : '3, 3'
          };
        },
        onEachFeature: (feature, lyr) => {
          const props: SectorProperties = feature?.properties;
          const tooltipContent = `
            <div style="font-family: monospace; font-size: 11px; padding: 2px;">
              <strong style="color: #00d4ff;">${props.name}</strong> (${props.gridId})<br/>
              <span style="color: #e2ecff;">Block: ${props.block}</span><br/>
              <span style="color: ${sectorColor(props.risk)}; font-weight: bold;">SOC Risk: ${(props.risk * 100).toFixed(1)}%</span><br/>
              <span style="color: #94a3b8;">Bare Soil: ${props.bare.toFixed(0)} ha | High Risk: ${props.highRisk.toFixed(0)} ha</span>
            </div>
          `;
          lyr.bindTooltip(tooltipContent, { sticky: true, className: 'leaflet-tooltip-dark' });

          lyr.on({
            mouseover: (e: L.LeafletMouseEvent) => {
              const target = e.target;
              target.setStyle({ fillOpacity: 0.75, weight: 2.5 });
              target.bringToFront();
            },
            mouseout: (e: L.LeafletMouseEvent) => {
              const isSelected = props.gridId === selectedSectorId;
              e.target.setStyle({
                fillOpacity: isSelected ? 0.65 : rasterOverlay !== 'none' ? 0.20 : 0.45,
                weight: isSelected ? 3 : 1.5
              });
            },
            click: () => {
              onSelectSectorRef.current?.(props);
              if (props.bounds) {
                map.flyToBounds(props.bounds, { padding: [40, 40], duration: 0.8 });
              }
            }
          });
        }
      }).addTo(map);

      geojsonLayerRef.current = layer;
    } else if (entityLevel === 'districts' && districtsGeojson) {
      const layer = L.geoJSON(districtsGeojson, {
        style: () => ({
          fillColor: '#1e293b',
          fillOpacity: 0.35,
          color: 'rgba(0, 212, 255, 0.4)',
          weight: 1.2
        }),
        onEachFeature: (feature, lyr) => {
          const distName = feature?.properties?.Dist_Name || 'Unknown District';
          lyr.bindTooltip(`<strong>${distName}</strong>`, { sticky: true, className: 'leaflet-tooltip-dark' });
          lyr.on({
            mouseover: (e: L.LeafletMouseEvent) => {
              e.target.setStyle({ fillOpacity: 0.65, weight: 2 });
            },
            mouseout: (e: L.LeafletMouseEvent) => {
              e.target.setStyle({ fillOpacity: 0.35, weight: 1.2 });
            },
            click: () => {
              onSelectDistrictRef.current?.(distName);
            }
          });
        }
      }).addTo(map);

      geojsonLayerRef.current = layer;
    }
  }, [entityLevel, sectorsGeojson, districtsGeojson, selectedSectorId, rasterOverlay]);

  // Center on Raipur AOI when switching to sectors
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (entityLevel === 'sectors') {
      map.flyToBounds(RAIPUR_AOI_BOUNDS, { padding: [30, 30], duration: 1.2 });
    }
  }, [entityLevel]);

  return (
    <div className="w-full h-full relative overflow-hidden">
      <div
        ref={containerRef}
        className="w-full h-full"
        style={{ minHeight: 480, background: '#0a0f1d' }}
      />
    </div>
  );
}
