'use client';
import { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Topbar from '@/components/layout/Topbar';
import dynamic from 'next/dynamic';
import { SECTORS } from '@/lib/site-data';
import type { 
  SectorProperties, 
  DistrictProperties, 
  DistrictColorMode, 
  BasemapMode, 
  EntityLevel, 
  RasterOverlayMode 
} from '@/components/SoilMap';
import { 
  Globe,
  Satellite, 
  Layers, 
  Sliders, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  Sparkles, 
  Key,
  Flame,
  Compass,
  Mountain,
  Map,
  Eye,
  EyeOff,
  Zap
} from 'lucide-react';

const SoilMap = dynamic(() => import('@/components/SoilMap'), { ssr: false });

export default function InteractiveMapPage() {
  const [entityLevel, setEntityLevel] = useState<EntityLevel>('sectors');
  const [basemap, setBasemap] = useState<BasemapMode>('google_hybrid');
  const [rasterOverlay, setRasterOverlay] = useState<RasterOverlayMode>('soc_risk');
  const [rasterOpacity, setRasterOpacity] = useState<number>(0.75);
  const [showSectorBoundaries, setShowSectorBoundaries] = useState<boolean>(true);
  const [districtColorMode, setDistrictColorMode] = useState<DistrictColorMode>('soc_risk');
  
  const [selectedSector, setSelectedSector] = useState<SectorProperties | null>(() => {
    const s = SECTORS[0];
    return s ? (s as unknown as SectorProperties) : null;
  });
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>('Bemetara');
  const [selectedDistrictData, setSelectedDistrictData] = useState<DistrictProperties | null>(null);
  const [allDistricts, setAllDistricts] = useState<DistrictProperties[]>([]);

  const [coords, setCoords] = useState<{ lat: number; lng: number; zoom: number } | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [showKeyModal, setShowKeyModal] = useState<boolean>(false);

  // Load all 33 districts from GeoJSON
  useEffect(() => {
    fetch('/chhattisgarh-districts.geojson')
      .then((r) => r.json())
      .then((data) => {
        if (data?.features) {
          const dists: DistrictProperties[] = data.features.map((f: any) => f.properties);
          setAllDistricts(dists);
          if (!selectedDistrictData && dists.length > 0) {
            setSelectedDistrictData(dists[0]);
            setSelectedDistrict(dists[0].Dist_Name);
          }
        }
      })
      .catch((e) => console.error('Error loading districts:', e));
  }, []);

  return (
    <DashboardLayout>
      <Topbar 
        title="Google Earth Level GIS & Remote Sensing Platform" 
        subtitle="Sub-Meter Satellite Earth Observation & 25 Agricultural Sectors · Raipur-Durg Plain" 
      />

      <div className="p-4 lg:p-6 flex flex-col gap-4 min-h-[calc(100vh-80px)]">
        
        {/* Top Control Toolbar */}
        <div className="bg-[#0e1522] border border-white/[0.08] rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xl">
          
          {/* Level Switcher: Micro-Sectors vs Districts */}
          <div className="flex items-center gap-2 bg-[#06090f] p-1.5 rounded-xl border border-white/[0.06]">
            <button
              onClick={() => setEntityLevel('sectors')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                entityLevel === 'sectors'
                  ? 'bg-[#00d4ff] text-black shadow-lg shadow-[#00d4ff]/20'
                  : 'text-[#8ba3cc] hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Micro-Sectors (25 Grid)</span>
            </button>
            <button
              onClick={() => setEntityLevel('districts')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                entityLevel === 'districts'
                  ? 'bg-[#00d4ff] text-black shadow-lg shadow-[#00d4ff]/20'
                  : 'text-[#8ba3cc] hover:text-white'
              }`}
            >
              <Mountain className="w-3.5 h-3.5" />
              <span>Statewide (33 Districts)</span>
            </button>
          </div>

          {/* Google Earth / Satellite Basemap Switcher */}
          <div className="flex items-center gap-1.5 bg-[#06090f] p-1.5 rounded-xl border border-white/[0.06]">
            <span className="text-[10px] font-mono text-[#4a6890] uppercase tracking-wider px-2 flex items-center gap-1">
              <Globe className="w-3 h-3 text-[#00d4ff]" /> Basemap
            </span>
            <button
              onClick={() => setBasemap('google_hybrid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                basemap === 'google_hybrid'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                  : 'text-[#8ba3cc] hover:text-white'
              }`}
            >
              <Satellite className="w-3.5 h-3.5" />
              <span>Google Earth (Hybrid)</span>
            </button>
            <button
              onClick={() => setBasemap('google_satellite')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                basemap === 'google_satellite'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-[#8ba3cc] hover:text-white'
              }`}
            >
              Google Clean Sat
            </button>
            <button
              onClick={() => setBasemap('google_terrain')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                basemap === 'google_terrain'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-[#8ba3cc] hover:text-white'
              }`}
            >
              Google Terrain
            </button>
            <button
              onClick={() => setBasemap('esri_satellite')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                basemap === 'esri_satellite'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-[#8ba3cc] hover:text-white'
              }`}
            >
              ESRI Sat
            </button>
            <button
              onClick={() => setBasemap('dark')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                basemap === 'dark'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                  : 'text-[#8ba3cc] hover:text-white'
              }`}
            >
              Dark Matter
            </button>
          </div>

          {/* 10m Remote Sensing Overlay Switcher (Sectors Mode) OR Statewide Thematic Mode (Districts Mode) */}
          {entityLevel === 'sectors' ? (
            <div className="flex items-center gap-2 bg-[#06090f] p-1.5 rounded-xl border border-white/[0.06]">
              <span className="text-[10px] font-mono text-[#4a6890] uppercase tracking-wider px-2">10m RS Raster</span>
              <select
                value={rasterOverlay}
                onChange={(e) => setRasterOverlay(e.target.value as RasterOverlayMode)}
                className="bg-[#0e1522] border border-white/[0.12] rounded-lg px-2.5 py-1 text-xs text-[#e2ecff] focus:outline-none focus:border-[#00d4ff]"
              >
                <option value="none">None (Vector Ground Truth)</option>
                <option value="soc_risk">10m SOC Deficiency Risk Heatmap</option>
                <option value="ndvi">10m NDVI Vegetation Index</option>
                <option value="bsi">10m Bare Soil Index (BSI)</option>
                <option value="false_color">10m False Color Composite (NIR/R/G)</option>
                <option value="confidence">10m Prediction Uncertainty Map</option>
                <option value="zonal_grid">5x5 Sector Classification Map</option>
              </select>

              {rasterOverlay !== 'none' && (
                <div className="flex items-center gap-2 pl-2 border-l border-white/[0.1]">
                  <Sliders className="w-3.5 h-3.5 text-[#00d4ff]" />
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={rasterOpacity}
                    onChange={(e) => setRasterOpacity(parseFloat(e.target.value))}
                    className="w-16 accent-[#00d4ff] cursor-pointer"
                    title={`Raster Opacity: ${Math.round(rasterOpacity * 100)}%`}
                  />
                  <span className="text-[11px] font-mono text-[#8ba3cc] w-7">
                    {Math.round(rasterOpacity * 100)}%
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-[#06090f] p-1.5 rounded-xl border border-white/[0.06]">
              <span className="text-[10px] font-mono text-[#4a6890] uppercase tracking-wider px-2">
                Statewide Layer
              </span>
              <button
                onClick={() => setDistrictColorMode('soc_risk')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  districtColorMode === 'soc_risk'
                    ? 'bg-red-500/20 text-red-300 border border-red-500/40 shadow-sm'
                    : 'text-[#8ba3cc] hover:text-white'
                }`}
              >
                SOC Deficiency Risk
              </button>
              <button
                onClick={() => setDistrictColorMode('vernacular_soil')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  districtColorMode === 'vernacular_soil'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-[#8ba3cc] hover:text-white'
                }`}
              >
                Indigenous Soils (Kanhar/Matasi)
              </button>
              <button
                onClick={() => setDistrictColorMode('agro_zone')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  districtColorMode === 'agro_zone'
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm'
                    : 'text-[#8ba3cc] hover:text-white'
                }`}
              >
                Agro-Climatic Zones
              </button>
            </div>
          )}

          {/* Sector Boundary Toggle (Sectors Mode) */}
          {entityLevel === 'sectors' && (
            <button
              onClick={() => setShowSectorBoundaries((v) => !v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                showSectorBoundaries
                  ? 'bg-blue-500/20 text-blue-300 border-blue-500/40 shadow-sm'
                  : 'bg-white/[0.04] text-[#8ba3cc] border-white/[0.08] hover:text-white'
              }`}
              title="Toggle 25 Sector Outlines to inspect pure satellite imagery"
            >
              {showSectorBoundaries ? (
                <Eye className="w-3.5 h-3.5 text-[#00d4ff]" />
              ) : (
                <EyeOff className="w-3.5 h-3.5 text-zinc-400" />
              )}
              <span>Sector Outlines: {showSectorBoundaries ? 'ON' : 'OFF'}</span>
            </button>
          )}

          {/* API Key Modal Button */}
          <button
            onClick={() => setShowKeyModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs text-[#8ba3cc] hover:text-white hover:border-[#00d4ff]/40 transition-all ml-auto"
          >
            <Key className="w-3.5 h-3.5 text-amber-400" />
            <span>Mapbox / Custom API Key</span>
          </button>
        </div>

        {/* Quick Jump Chips: Sectors vs Statewide 33 Districts */}
        {entityLevel === 'sectors' ? (
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-[11px] font-mono text-[#4a6890] whitespace-nowrap flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-red-400" /> Critical High-Deficiency Sectors:
            </span>
            {SECTORS.slice(0, 6).map((sec) => {
              const isSelected = selectedSector?.gridId === sec.gridId;
              const isCritical = sec.urgency === 'CRITICAL';
              return (
                <button
                  key={sec.gridId}
                  onClick={() => setSelectedSector(sec as unknown as SectorProperties)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono whitespace-nowrap transition-all border ${
                    isSelected
                      ? 'bg-[#00d4ff]/20 text-[#00d4ff] border-[#00d4ff] shadow-md'
                      : isCritical
                      ? 'bg-red-500/10 text-red-300 border-red-500/20 hover:border-red-500/40'
                      : 'bg-amber-500/10 text-amber-300 border-amber-500/20 hover:border-amber-500/40'
                  }`}
                >
                  {sec.name} ({(sec.risk * 100).toFixed(1)}% Risk)
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-[11px] font-mono text-[#4a6890] whitespace-nowrap flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-red-400" /> Top Priority High-Deficiency Districts:
            </span>
            {allDistricts.slice(0, 8).map((dist) => {
              const isSelected = selectedDistrict === dist.Dist_Name;
              return (
                <button
                  key={dist.Dist_Name}
                  onClick={() => {
                    setSelectedDistrict(dist.Dist_Name);
                    setSelectedDistrictData(dist);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono whitespace-nowrap transition-all border ${
                    isSelected
                      ? 'bg-[#00d4ff]/20 text-[#00d4ff] border-[#00d4ff] shadow-md'
                      : 'bg-red-500/10 text-red-300 border-red-500/20 hover:border-red-500/40'
                  }`}
                >
                  #{dist.rank} {dist.Dist_Name} ({(dist.risk * 100).toFixed(1)}%)
                </button>
              );
            })}
          </div>
        )}

        {/* Main Map View & Inspector Grid */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-[580px]">
          
          {/* Map Viewport Container */}
          <div className="lg:col-span-8 rounded-2xl overflow-hidden border border-white/[0.1] shadow-2xl relative">
            <SoilMap
              entityLevel={entityLevel}
              basemap={basemap}
              rasterOverlay={rasterOverlay}
              rasterOpacity={rasterOpacity}
              selectedSectorId={selectedSector?.gridId}
              selectedDistrictName={selectedDistrict}
              districtColorMode={districtColorMode}
              showSectorBoundaries={showSectorBoundaries}
              onSelectSector={(sec) => setSelectedSector(sec)}
              onSelectDistrict={(dist) => setSelectedDistrict(dist)}
              onSelectDistrictData={(data) => {
                setSelectedDistrictData(data);
                setSelectedDistrict(data?.Dist_Name || null);
              }}
              onMouseMoveCoords={(c) => setCoords(c)}
              mapboxToken={mapboxToken}
            />

            {/* Google Earth HUD Telemetry (Coordinates, Zoom, Imagery Specs) */}
            <div className="absolute top-4 left-4 z-[500] bg-[#06090f]/85 backdrop-blur-md border border-white/[0.12] rounded-xl px-3 py-2 shadow-2xl flex items-center gap-3 text-[11px] font-mono">
              <div className="flex items-center gap-1.5 text-blue-400 font-semibold">
                <Globe className="w-3.5 h-3.5 animate-spin-slow" />
                <span>Google Earth Engine</span>
              </div>
              <span className="text-white/20">|</span>
              <div className="text-[#8ba3cc]">
                {coords ? (
                  <span>{coords.lat}&deg; N, {coords.lng}&deg; E &middot; Zoom {coords.zoom}</span>
                ) : (
                  <span>21.20000&deg; N, 81.70000&deg; E &middot; Hover map</span>
                )}
              </div>
              <span className="text-white/20">|</span>
              <div className="text-emerald-400 font-medium">
                Res: &lt; 0.3m Optical
              </div>
            </div>

            {/* Floating Live GIS Legend & Color Ramp */}
            <div className="absolute bottom-5 left-5 z-[500] bg-[#06090f]/92 backdrop-blur-md border border-white/[0.12] rounded-xl p-3.5 shadow-2xl max-w-sm">
              {/* Dynamic 10m RS Raster Color Ramp */}
              {rasterOverlay !== 'none' && (
                <div className="mb-3 pb-3 border-b border-white/[0.1]">
                  {rasterOverlay === 'soc_risk' && (
                    <div className="space-y-1.5 font-mono text-[11px]">
                      <div className="flex items-center justify-between">
                        <span className="text-[#00d4ff] font-bold text-[10px] uppercase tracking-wider">
                          10m SOC Deficiency Index
                        </span>
                        <span className="text-emerald-400 text-[10px] font-semibold">RF Model</span>
                      </div>
                      <div className="h-3 w-full rounded-sm bg-gradient-to-r from-[#22c55e] via-[#eab308] to-[#ef4444] border border-white/20 relative">
                        <div
                          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-sm"
                          style={{ left: '58%' }}
                          title="High-Deficiency Cutoff (0.58)"
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-[#8ba3cc]">
                        <span className="text-emerald-400 font-medium">0.0 High SOC</span>
                        <span className="text-amber-400 font-semibold">0.58 Cutoff</span>
                        <span className="text-red-400 font-medium">1.0 Severe Def</span>
                      </div>
                    </div>
                  )}

                  {rasterOverlay === 'ndvi' && (
                    <div className="space-y-1.5 font-mono text-[11px]">
                      <div className="flex items-center justify-between">
                        <span className="text-[#00d4ff] font-bold text-[10px] uppercase tracking-wider">
                          10m NDVI Canopy Index
                        </span>
                        <span className="text-emerald-400 text-[10px]">Sentinel-2</span>
                      </div>
                      <div className="h-3 w-full rounded-sm bg-gradient-to-r from-[#ffffcc] via-[#78c679] to-[#006837] border border-white/20" />
                      <div className="flex justify-between text-[10px] text-[#8ba3cc]">
                        <span>0.0 Bare/Sparse</span>
                        <span className="text-emerald-400">0.30 Crop Limit</span>
                        <span className="text-green-300">0.70+ Dense</span>
                      </div>
                    </div>
                  )}

                  {rasterOverlay === 'bsi' && (
                    <div className="space-y-1.5 font-mono text-[11px]">
                      <div className="flex items-center justify-between">
                        <span className="text-[#00d4ff] font-bold text-[10px] uppercase tracking-wider">
                          10m Bare Soil Index (BSI)
                        </span>
                        <span className="text-amber-400 text-[10px]">Topsoil Mineral</span>
                      </div>
                      <div className="h-3 w-full rounded-sm bg-gradient-to-r from-[#1f1105] via-[#b45309] to-[#fde047] border border-white/20" />
                      <div className="flex justify-between text-[10px] text-[#8ba3cc]">
                        <span>-0.15 Vegetated</span>
                        <span>0.0 Neutral</span>
                        <span className="text-amber-300">+0.35 Exposed Soil</span>
                      </div>
                    </div>
                  )}

                  {rasterOverlay === 'confidence' && (
                    <div className="space-y-1.5 font-mono text-[11px]">
                      <div className="flex items-center justify-between">
                        <span className="text-[#00d4ff] font-bold text-[10px] uppercase tracking-wider">
                          10m Ensemble Confidence
                        </span>
                        <span className="text-cyan-400 text-[10px]">30 RF Trees</span>
                      </div>
                      <div className="h-3 w-full rounded-sm bg-gradient-to-r from-[#440154] via-[#21918c] to-[#fde725] border border-white/20" />
                      <div className="flex justify-between text-[10px] text-[#8ba3cc]">
                        <span>50% Variance</span>
                        <span className="text-cyan-300">80% Mod</span>
                        <span className="text-yellow-300">95%+ High</span>
                      </div>
                    </div>
                  )}

                  {rasterOverlay === 'false_color' && (
                    <div className="space-y-1 font-mono text-[10px]">
                      <span className="text-[#00d4ff] font-bold uppercase tracking-wider block">
                        False Color NIR Composite
                      </span>
                      <div className="flex items-center gap-2 text-zinc-300">
                        <span className="text-red-400 font-bold">R: NIR (B8)</span>
                        <span>&middot;</span>
                        <span className="text-green-400 font-bold">G: Red (B4)</span>
                        <span>&middot;</span>
                        <span className="text-blue-400 font-bold">B: Blue (B2)</span>
                      </div>
                    </div>
                  )}

                  {rasterOverlay === 'zonal_grid' && (
                    <div className="space-y-1 font-mono text-[10px]">
                      <span className="text-[#00d4ff] font-bold uppercase tracking-wider block">
                        5x5 Sector Classification Map
                      </span>
                      <p className="text-zinc-400">Mean SOC deficiency aggregated per agricultural zone</p>
                    </div>
                  )}
                </div>
              )}

              {/* Vector Layer Legend */}
              <p className="text-[10px] font-mono text-[#00d4ff] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#00d4ff] animate-pulse" />
                {entityLevel === 'sectors' 
                  ? '25 Zonal Sector Risk Scale' 
                  : districtColorMode === 'soc_risk'
                  ? 'Statewide SOC Deficiency Scale'
                  : districtColorMode === 'vernacular_soil'
                  ? 'Indigenous Vernacular Soil Taxonomy'
                  : 'Agro-Climatic Zones of Chhattisgarh'}
              </p>
              {entityLevel === 'sectors' ? (
                <div className="space-y-1.5 text-[11px] font-mono">
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-1.5 text-red-400">
                      <span className="w-2.5 h-2.5 rounded-sm bg-[#ef4444]" /> Critical (Tier 1)
                    </span>
                    <span className="text-[#8ba3cc]">&gt; 58% Deficiency</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-1.5 text-amber-400">
                      <span className="w-2.5 h-2.5 rounded-sm bg-[#f59e0b]" /> Moderate (Tier 2)
                    </span>
                    <span className="text-[#8ba3cc]">46% to 58%</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <span className="w-2.5 h-2.5 rounded-sm bg-[#10b981]" /> Stable (Tier 3)
                    </span>
                    <span className="text-[#8ba3cc]">&lt; 46% Low Risk</span>
                  </div>
                </div>
              ) : districtColorMode === 'soc_risk' ? (
                <div className="space-y-1.5 text-[11px] font-mono">
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-1.5 text-red-400">
                      <span className="w-2.5 h-2.5 rounded-sm bg-[#ef4444]" /> High Deficit (Tier 1)
                    </span>
                    <span className="text-[#8ba3cc]">&gt; 50% SOC Deficit</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-1.5 text-amber-400">
                      <span className="w-2.5 h-2.5 rounded-sm bg-[#f59e0b]" /> Moderate (Tier 2)
                    </span>
                    <span className="text-[#8ba3cc]">46% to 50%</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <span className="w-2.5 h-2.5 rounded-sm bg-[#10b981]" /> Stable / Low Deficit
                    </span>
                    <span className="text-[#8ba3cc]">&lt; 46% Low Risk</span>
                  </div>
                </div>
              ) : districtColorMode === 'vernacular_soil' ? (
                <div className="space-y-1.5 text-[11px] font-mono">
                  <div className="flex items-center gap-1.5 text-amber-300">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#E9C46A]" /> Kanhar (Vertisols - Deep Black Clay)
                  </div>
                  <div className="flex items-center gap-1.5 text-orange-300">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#F4A261]" /> Dorsa (Inceptisols - Medium Clay Loam)
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-300">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#2A9D8F]" /> Matasi (Alfisols - Yellow Sandy Loam)
                  </div>
                  <div className="flex items-center gap-1.5 text-red-300">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#E76F51]" /> Bhata (Entisols - Gravelly Red Upland)
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5 text-[11px] font-mono">
                  <div className="flex items-center gap-1.5 text-sky-300">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#38bdf8]" /> Northern Hills Zone (7 Districts)
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-300">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#4ade80]" /> Central Chhattisgarh Plains (19 Districts)
                  </div>
                  <div className="flex items-center gap-1.5 text-purple-300">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#a78bfa]" /> Bastar Plateau / Southern Zone (7 Districts)
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sector / District Inspector Panel */}
          <div className="lg:col-span-4 bg-[#0e1522] border border-white/[0.08] rounded-2xl p-5 flex flex-col justify-between shadow-2xl">
            {entityLevel === 'sectors' && selectedSector ? (
              <div className="space-y-5">
                
                {/* Sector Header */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs text-[#00d4ff] bg-[#00d4ff]/10 px-2 py-0.5 rounded border border-[#00d4ff]/30">
                      Sector Grid: {selectedSector.gridId}
                    </span>
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                      selectedSector.urgency === 'CRITICAL'
                        ? 'bg-red-500/15 text-red-400 border-red-500/30'
                        : selectedSector.urgency === 'MODERATE'
                        ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                        : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    }`}>
                      {selectedSector.urgency} (Tier {selectedSector.tier})
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white tracking-tight">
                    {selectedSector.name}
                  </h3>
                  <p className="text-xs text-[#8ba3cc]">
                    Administrative Block: <strong className="text-white">{selectedSector.block}</strong> · Priority Rank: #{selectedSector.rank}
                  </p>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="bg-[#06090f] p-3 rounded-xl border border-white/[0.06]">
                    <span className="text-[10px] font-mono text-[#4a6890] uppercase block">SOC Risk Score</span>
                    <span className="text-lg font-bold text-[#ef4444]">
                      {(selectedSector.risk * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="bg-[#06090f] p-3 rounded-xl border border-white/[0.06]">
                    <span className="text-[10px] font-mono text-[#4a6890] uppercase block">High-Risk Area</span>
                    <span className="text-lg font-bold text-amber-400">
                      {selectedSector.highRisk.toFixed(0)} <span className="text-xs text-[#8ba3cc]">ha</span>
                    </span>
                  </div>
                  <div className="bg-[#06090f] p-3 rounded-xl border border-white/[0.06]">
                    <span className="text-[10px] font-mono text-[#4a6890] uppercase block">Bare Soil Mapped</span>
                    <span className="text-lg font-bold text-[#00d4ff]">
                      {selectedSector.bare.toFixed(0)} <span className="text-xs text-[#8ba3cc]">ha</span>
                    </span>
                  </div>
                  <div className="bg-[#06090f] p-3 rounded-xl border border-white/[0.06]">
                    <span className="text-[10px] font-mono text-[#4a6890] uppercase block">Baseline SOC Level</span>
                    <span className="text-lg font-bold text-emerald-400">
                      {selectedSector.soc.toFixed(1)} <span className="text-xs text-[#8ba3cc]">dg/kg</span>
                    </span>
                  </div>
                </div>

                {/* Topsoil Chemistry Indicators */}
                <div className="bg-[#06090f] p-3.5 rounded-xl border border-white/[0.06] space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#8ba3cc]">Bare Soil Index (BSI):</span>
                    <span className="font-mono text-[#00d4ff] font-bold">+{selectedSector.bsi.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-[#8ba3cc]">Topsoil Reaction (pH):</span>
                    <span className="font-mono text-amber-400 font-bold">{selectedSector.ph.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-[#8ba3cc]">Bare Soil Critical Ratio:</span>
                    <span className="font-mono text-red-400 font-bold">{selectedSector.pct.toFixed(1)}%</span>
                  </div>
                </div>

                {/* Regenerative Agronomic Prescriptions */}
                <div className="space-y-2">
                  <span className="text-xs font-mono text-[#00d4ff] uppercase tracking-wider block flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#00d4ff]" /> Prescribed Agronomic Interventions
                  </span>
                  <div className="space-y-2">
                    {selectedSector.recommendations.map((rec, idx) => (
                      <div key={idx} className="bg-[#06090f] p-2.5 rounded-lg border border-white/[0.05] flex items-start gap-2 text-xs text-[#e2ecff]">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ) : entityLevel === 'districts' && selectedDistrictData ? (
              <div className="space-y-5">
                {/* District Header */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs text-[#00d4ff] bg-[#00d4ff]/10 px-2 py-0.5 rounded border border-[#00d4ff]/30">
                      District Rank: #{selectedDistrictData.rank} of 33
                    </span>
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                      selectedDistrictData.risk >= 0.50
                        ? 'bg-red-500/15 text-red-400 border-red-500/30'
                        : selectedDistrictData.risk >= 0.46
                        ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                        : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    }`}>
                      {selectedDistrictData.urgency}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-white tracking-tight">
                    {selectedDistrictData.Dist_Name}
                  </h3>
                  <p className="text-xs text-[#8ba3cc]">
                    Agro-Climatic Zone: <strong className="text-white">{selectedDistrictData.zone}</strong>
                  </p>
                </div>

                {/* District Key Metrics */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="bg-[#06090f] p-3 rounded-xl border border-white/[0.06]">
                    <span className="text-[10px] font-mono text-[#4a6890] uppercase block">Mean SOC Deficit</span>
                    <span className="text-lg font-bold text-[#ef4444]">
                      {(selectedDistrictData.risk * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="bg-[#06090f] p-3 rounded-xl border border-white/[0.06]">
                    <span className="text-[10px] font-mono text-[#4a6890] uppercase block">High-Risk Area</span>
                    <span className="text-lg font-bold text-amber-400">
                      {selectedDistrictData.highRisk?.toLocaleString()} <span className="text-xs text-[#8ba3cc]">ha</span>
                    </span>
                  </div>
                  <div className="bg-[#06090f] p-3 rounded-xl border border-white/[0.06]">
                    <span className="text-[10px] font-mono text-[#4a6890] uppercase block">Bare Topsoil</span>
                    <span className="text-lg font-bold text-[#00d4ff]">
                      {selectedDistrictData.bare?.toLocaleString()} <span className="text-xs text-[#8ba3cc]">ha</span>
                    </span>
                  </div>
                  <div className="bg-[#06090f] p-3 rounded-xl border border-white/[0.06]">
                    <span className="text-[10px] font-mono text-[#4a6890] uppercase block">Baseline SOC</span>
                    <span className="text-lg font-bold text-emerald-400">
                      {selectedDistrictData.soc?.toFixed(1)} <span className="text-xs text-[#8ba3cc]">dg/kg</span>
                    </span>
                  </div>
                </div>

                {/* Indigenous Pedology & Taxonomy */}
                <div className="bg-[#06090f] p-3.5 rounded-xl border border-white/[0.06] space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#8ba3cc]">Vernacular Soil Type:</span>
                    <span className="font-mono text-amber-300 font-bold">
                      {selectedDistrictData.vernacular_soil} ({selectedDistrictData.soil_order})
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-[#8ba3cc]">Clay Fraction:</span>
                    <span className="font-mono text-[#00d4ff] font-bold">{selectedDistrictData.clay?.toFixed(1)} g/kg</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-[#8ba3cc]">Topsoil Reaction:</span>
                    <span className="font-mono text-emerald-400 font-bold">pH {selectedDistrictData.ph?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-[#8ba3cc]">Total Geographic Footprint:</span>
                    <span className="font-mono text-white font-medium">{selectedDistrictData.total?.toLocaleString()} ha</span>
                  </div>
                </div>

                {/* Tailored Regenerative Package */}
                <div className="space-y-2">
                  <span className="text-xs font-mono text-[#00d4ff] uppercase tracking-wider block flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#00d4ff]" /> Localized Regenerative Prescriptions
                  </span>
                  <div className="space-y-2">
                    {selectedDistrictData.recommendations?.map((rec, idx) => (
                      <div key={idx} className="bg-[#06090f] p-2.5 rounded-lg border border-white/[0.05] flex items-start gap-2 text-xs text-[#e2ecff]">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Action: Drill down to micro-sectors */}
                <button
                  onClick={() => setEntityLevel('sectors')}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600/30 to-cyan-600/30 hover:from-blue-600/40 hover:to-cyan-600/40 border border-blue-500/40 text-white font-medium text-xs flex items-center justify-center gap-2 transition-all shadow-lg"
                >
                  <Zap className="w-4 h-4 text-[#00d4ff]" />
                  <span>Drill Down to 10m Micro-Sectors (Raipur-Durg Plain)</span>
                </button>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#4a6890]">
                <MapPin className="w-10 h-10 mb-3 opacity-40 text-[#00d4ff]" />
                <p className="text-sm font-medium text-white mb-1">Select Any District or Sector</p>
                <p className="text-xs">
                  Click any district polygon on the map or choose from the top chips to inspect statewide pedological parameters and localized regenerative agronomic packages.
                </p>
              </div>
            )}

            {/* Bottom Status / Engine Bar */}
            <div className="pt-4 border-t border-white/[0.06] text-[11px] font-mono text-[#4a6890] flex items-center justify-between">
              <span>Google Earth + Sentinel-2 L2A</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                33 Districts &middot; ISRO Certified
              </span>
            </div>

          </div>

        </div>

      </div>

      {/* API Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-[1000] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0e1522] border border-white/[0.15] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-400" />
                GIS & Remote Sensing API Keys
              </h3>
              <button 
                onClick={() => setShowKeyModal(false)}
                className="text-[#8ba3cc] hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="bg-[#06090f] p-3.5 rounded-xl border border-white/[0.06] text-xs text-[#8ba3cc] space-y-2">
              <p className="text-white font-medium">
                ✅ <strong>Zero API Keys are required</strong> for the high-resolution features currently active:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-1 text-[11px]">
                <li><strong>Google Earth & Maps Basemaps</strong>: Sub-15cm optical satellite and terrain tiles are active directly without requiring an API key.</li>
                <li><strong>ESRI World Imagery</strong>: Sub-meter optical satellite imagery is bundled directly with zero authentication needed.</li>
                <li><strong>10m Sentinel-2 Rasters</strong>: SOC deficiency, NDVI, BSI, and false color rasters are served directly from our high-speed geospatial cache.</li>
              </ul>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono text-white block">
                Optional: Mapbox Access Token (for Mapbox Satellite Streets v12)
              </label>
              <input
                type="password"
                placeholder="pk.eyJ1Ijo..."
                value={mapboxToken}
                onChange={(e) => setMapboxToken(e.target.value)}
                className="w-full bg-[#06090f] border border-white/[0.12] rounded-xl px-3 py-2 text-xs text-white placeholder:text-[#4a6890] focus:outline-none focus:border-[#00d4ff]"
              />
              <p className="text-[10px] text-[#4a6890]">
                If provided, Mapbox will be used as the primary satellite basemap layer instead of Google Earth.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowKeyModal(false)}
                className="px-4 py-2 rounded-xl bg-[#00d4ff] text-black font-semibold text-xs hover:bg-[#00b8df] transition-all"
              >
                Apply Settings
              </button>
            </div>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}
