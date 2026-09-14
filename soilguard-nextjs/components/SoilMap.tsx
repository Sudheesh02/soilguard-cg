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

export type BasemapMode = 
  | 'google_hybrid' 
  | 'google_satellite' 
  | 'google_terrain' 
  | 'google_streets'
  | 'esri_satellite' 
  | 'dark' 
  | 'osm';

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
  onMouseMoveCoords?: (coords: { lat: number; lng: number; zoom: number } | null) => void;
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
  onMouseMoveCoords,
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

  const onMouseMoveCoordsRef = useRef(onMouseMoveCoords);
  useEffect(() => { onMouseMoveCoordsRef.current = onMouseMoveCoords; }, [onMouseMoveCoords]);

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
      maxZoom: 22,
      zoomControl: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);
    L.control.scale({ imperial: false, position: 'bottomleft' }).addTo(map);

    // Track mouse coordinates for Google Earth readout
    map.on('mousemove', (e: L.LeafletMouseEvent) => {
      onMouseMoveCoordsRef.current?.({
        lat: Number(e.latlng.lat.toFixed(5)),
        lng: Number(e.latlng.lng.toFixed(5)),
        zoom: map.getZoom()
      });
    });

    map.on('mouseout', () => {
      onMouseMoveCoordsRef.current?.(null);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update Basemap Layer (Google Earth / Google Maps / ESRI / CartoDB / OSM)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      tileLayerRef.current.remove();
      tileLayerRef.current = null;
    }

    let url = 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}';
    let attribution = '&copy; Google Maps / Google Earth Satellite';
    let maxZoom = 22;
    let subdomains: string[] | string = ['mt0', 'mt1', 'mt2', 'mt3'];

    if (basemap === 'google_hybrid') {
      url = 'https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}';
      attribution = '&copy; Google Earth &mdash; High-Resolution Satellite & Roads';
      subdomains = ['0', '1', '2', '3'];
      maxZoom = 22;
    } else if (basemap === 'google_satellite') {
      url = 'https://mt{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}';
      attribution = '&copy; Google Earth &mdash; Optical Satellite Imagery';
      subdomains = ['0', '1', '2', '3'];
      maxZoom = 22;
    } else if (basemap === 'google_terrain') {
      url = 'https://mt{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}';
      attribution = '&copy; Google Maps &mdash; Topographic Terrain';
      subdomains = ['0', '1', '2', '3'];
      maxZoom = 20;
    } else if (basemap === 'google_streets') {
      url = 'https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';
      attribution = '&copy; Google Maps &mdash; Detailed Cartography';
      subdomains = ['0', '1', '2', '3'];
      maxZoom = 22;
    } else if (basemap === 'esri_satellite') {
      url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      attribution = 'Tiles &copy; Esri &mdash; World Imagery';
      subdomains = 'abc';
      maxZoom = 19;
    } else if (basemap === 'dark') {
      url = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
      attribution = '&copy; CARTO &copy; OpenStreetMap';
      subdomains = 'abcd';
      maxZoom = 20;
    } else if (basemap === 'osm') {
      url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      attribution = '&copy; OpenStreetMap contributors';
      subdomains = 'abc';
      maxZoom = 19;
    }

    tileLayerRef.current = L.tileLayer(url, {
      attribution,
      subdomains,
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
            fillOpacity: isSelected ? 0.60 : rasterOverlay !== 'none' ? 0.15 : 0.35,
            color: isSelected ? '#00ffff' : color,
            weight: isSelected ? 3.5 : 1.5,
            dashArray: isSelected ? '' : '3, 3'
          };
        },
        onEachFeature: (feature, lyr) => {
          const props: SectorProperties = feature?.properties;
          const tooltipContent = `
            <div style="font-family: monospace; font-size: 11px; padding: 3px; line-height: 1.4;">
              <strong style="color: #00d4ff;">${props.name}</strong> (${props.gridId})<br/>
              <span style="color: #e2ecff;">Block: ${props.block} | Rank #${props.rank}</span><br/>
              <span style="color: ${sectorColor(props.risk)}; font-weight: bold;">SOC Risk: ${(props.risk * 100).toFixed(1)}%</span><br/>
              <span style="color: #cbd5e1;">Bare Soil: ${props.bare.toFixed(0)} ha | High Risk: ${props.highRisk.toFixed(0)} ha</span>
            </div>
          `;
          lyr.bindTooltip(tooltipContent, { sticky: true, className: 'leaflet-tooltip-dark' });

          lyr.on({
            mouseover: (e: L.LeafletMouseEvent) => {
              const target = e.target;
              target.setStyle({ fillOpacity: 0.70, weight: 3 });
              target.bringToFront();
            },
            mouseout: (e: L.LeafletMouseEvent) => {
              const isSelected = props.gridId === selectedSectorId;
              e.target.setStyle({
                fillOpacity: isSelected ? 0.60 : rasterOverlay !== 'none' ? 0.15 : 0.35,
                weight: isSelected ? 3.5 : 1.5
              });
            },
            click: () => {
              onSelectSectorRef.current?.(props);
              if (props.bounds) {
                map.flyToBounds(props.bounds, { padding: [60, 60], maxZoom: 14, duration: 1.0 });
              }
            }
          });
        }
      }).addTo(map);

      geojsonLayerRef.current = layer;
    } else if (entityLevel === 'districts' && districtsGeojson) {
      const layer = L.geoJSON(districtsGeojson, {
        style: () => ({
          fillColor: '#0f172a',
          fillOpacity: 0.30,
          color: 'rgba(0, 212, 255, 0.5)',
          weight: 1.5
        }),
        onEachFeature: (feature, lyr) => {
          const distName = feature?.properties?.Dist_Name || 'Unknown District';
          lyr.bindTooltip(`<strong>${distName}</strong>`, { sticky: true, className: 'leaflet-tooltip-dark' });
          lyr.on({
            mouseover: (e: L.LeafletMouseEvent) => {
              e.target.setStyle({ fillOpacity: 0.60, weight: 2.5 });
            },
            mouseout: (e: L.LeafletMouseEvent) => {
              e.target.setStyle({ fillOpacity: 0.30, weight: 1.5 });
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
        style={{ minHeight: 480, background: '#070b14' }}
      />
    </div>
  );
}
