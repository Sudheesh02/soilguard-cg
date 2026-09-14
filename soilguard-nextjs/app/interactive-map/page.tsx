'use client';
import { useState, useMemo } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Topbar from '@/components/layout/Topbar';
import dynamic from 'next/dynamic';
import { SECTORS } from '@/lib/site-data';
import type { SectorProperties, BasemapMode, EntityLevel, RasterOverlayMode } from '@/components/SoilMap';
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
  Map
} from 'lucide-react';

const SoilMap = dynamic(() => import('@/components/SoilMap'), { ssr: false });

export default function InteractiveMapPage() {
  const [entityLevel, setEntityLevel] = useState<EntityLevel>('sectors');
  const [basemap, setBasemap] = useState<BasemapMode>('google_hybrid');
  const [rasterOverlay, setRasterOverlay] = useState<RasterOverlayMode>('soc_risk');
  const [rasterOpacity, setRasterOpacity] = useState<number>(0.75);
  const [selectedSector, setSelectedSector] = useState<SectorProperties | null>(() => {
    const s = SECTORS[0];
    return s ? (s as unknown as SectorProperties) : null;
  });
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number; zoom: number } | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [showKeyModal, setShowKeyModal] = useState<boolean>(false);

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

          {/* 10m Remote Sensing Overlay Switcher */}
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

          {/* API Key Modal Button */}
          <button
            onClick={() => setShowKeyModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.1] text-xs text-[#8ba3cc] hover:text-white hover:border-[#00d4ff]/40 transition-all ml-auto"
          >
            <Key className="w-3.5 h-3.5 text-amber-400" />
            <span>Mapbox / Custom API Key</span>
          </button>
        </div>

        {/* Quick Critical Sector Jump Chips */}
        {entityLevel === 'sectors' && (
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
              onSelectSector={(sec) => setSelectedSector(sec)}
              onSelectDistrict={(dist) => setSelectedDistrict(dist)}
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

            {/* Floating Live Legend */}
            <div className="absolute bottom-5 left-5 z-[500] bg-[#06090f]/90 backdrop-blur-md border border-white/[0.12] rounded-xl p-3 shadow-2xl max-w-xs">
              <p className="text-[10px] font-mono text-[#00d4ff] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#00d4ff] animate-pulse" />
                {entityLevel === 'sectors' ? '25 Zonal Sector Risk Scale' : 'Statewide District Pedology'}
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
              ) : (
                <div className="space-y-1.5 text-[11px] font-mono">
                  <div className="flex items-center gap-1.5 text-emerald-300">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#2A9D8F]" /> Matasi (Alfisols - Yellow Loam)
                  </div>
                  <div className="flex items-center gap-1.5 text-amber-300">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#E9C46A]" /> Kanhar (Vertisols - Black Clay)
                  </div>
                  <div className="flex items-center gap-1.5 text-orange-300">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#F4A261]" /> Dorsa (Inceptisols - Clay Loam)
                  </div>
                  <div className="flex items-center gap-1.5 text-red-300">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#E76F51]" /> Bhata (Entisols - Gravelly Red)
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sector / District Inspector Panel */}
          <div className="lg:col-span-4 bg-[#0e1522] border border-white/[0.08] rounded-2xl p-5 flex flex-col justify-between shadow-2xl">
            {selectedSector ? (
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
            ) : selectedDistrict ? (
              <div className="space-y-4">
                <span className="font-mono text-xs text-[#00d4ff] bg-[#00d4ff]/10 px-2 py-0.5 rounded border border-[#00d4ff]/30">
                  Statewide District Mode
                </span>
                <h3 className="text-xl font-bold text-white tracking-tight">{selectedDistrict}</h3>
                <p className="text-xs text-[#8ba3cc]">
                  Click on <strong>Micro-Sectors (25 Grid)</strong> in the top toolbar to inspect high-resolution agricultural plots and 10m remote sensing rasters across the Raipur-Durg plain.
                </p>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#4a6890]">
                <MapPin className="w-10 h-10 mb-3 opacity-40 text-[#00d4ff]" />
                <p className="text-sm font-medium text-white mb-1">Select Any Agricultural Sector</p>
                <p className="text-xs">Click any sector polygon on the map to inspect high-resolution SOC deficiency, soil metrics, and localized regenerative prescriptions.</p>
              </div>
            )}

            {/* Bottom Status / Engine Bar */}
            <div className="pt-4 border-t border-white/[0.06] text-[11px] font-mono text-[#4a6890] flex items-center justify-between">
              <span>Google Earth + Sentinel-2 L2A</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                ISRO Pipeline Certified
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
