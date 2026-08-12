'use client';
import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Topbar from '@/components/layout/Topbar';
import { MAPS } from '@/lib/data';
import { PHASE_COLORS } from '@/lib/theme';
import { Image as ImageIcon, Download, X, Maximize2 } from 'lucide-react';

interface MapItem {
  id: string;
  title: string;
  desc: string;
  phase: string;
  file: string;
  subtitle?: string;
  badge?: string;
  badgeText?: string;
  caption?: string;
  crs?: string;
}

export default function MapsPage() {
  const [selectedMap, setSelectedMap] = useState<MapItem | null>(null);

  return (
    <DashboardLayout>
      <Topbar title="Analysis Maps" subtitle="Satellite-derived geospatial outputs · 10m resolution · Sentinel-2 L2A" />
      <div className="p-6 animate-fade-in">

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {MAPS.map((m: any) => {
            const phaseColor = PHASE_COLORS[m.phase] ?? '#818cf8';
            return (
              <div 
                key={m.id} 
                onClick={() => setSelectedMap(m)}
                className="card overflow-hidden group hover:scale-[1.01] transition-transform duration-200 cursor-pointer relative"
                style={{ boxShadow: `0 4px 24px rgba(0,0,0,0.3)` }}
              >
                <div className="aspect-video bg-[#0a0f18] border-b border-white/[0.06] flex items-center justify-center relative overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/maps/${m.file}`}
                    alt={m.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Hover Lightbox Indicator */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-mono-data text-xs">
                    <Maximize2 className="w-5 h-5 text-[#00d4ff]" />
                    <span>View Map Lightbox</span>
                  </div>

                  <div className="absolute top-3 left-3">
                    <span className="font-mono-data text-[9px] font-semibold px-2 py-1 rounded-lg tracking-widest"
                      style={{ background: `${phaseColor}20`, color: phaseColor, border: `1px solid ${phaseColor}35` }}>
                      {m.phase}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-display font-semibold text-white text-[14px] mb-1.5 flex items-center justify-between">
                    <span>{m.title}</span>
                    <span className="text-[10px] text-[#00d4ff] font-mono-data opacity-0 group-hover:opacity-100 transition-opacity">Expand ↗</span>
                  </h3>
                  <p className="text-[12px] text-[#5e7aa8] leading-relaxed line-clamp-2">{m.desc}</p>
                  <p className="font-mono-data text-[10px] text-[#3d5a80] mt-2">{m.file}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pipeline Phases Reference */}
        <div className="mt-8 card p-5">
          <h3 className="font-display font-semibold text-white text-[15px] mb-4">Pipeline Phases</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { phase: '01', title: 'Data Acquisition', desc: 'Download Sentinel-2 L2A + SoilGrids GeoTIFF rasters. Verify band integrity.', color: '#818cf8' },
              { phase: '02', title: 'Spectral Analysis', desc: 'Compute NDVI, BSI. Apply bare-soil mask (NDVI ≤ 0.30). Generate false-color composite.', color: '#00d4ff' },
              { phase: '03', title: 'ML Risk Scoring', desc: 'Random Forest (150 trees) predicts SOC deficiency per pixel. Generate risk map + histogram.', color: '#f59e0b' },
              { phase: '04', title: 'Zonal Advisory', desc: '5×5 grid aggregation. Village-level recommendations. Confidence mapping. CSV export.', color: '#10b981' },
            ].map(p => (
              <div key={p.phase} className="rounded-xl p-4"
                style={{ background: `${p.color}08`, border: `1px solid ${p.color}20` }}>
                <div className="font-mono-data text-[10px] font-bold mb-2" style={{ color: `${p.color}99` }}>PHASE {p.phase}</div>
                <div className="font-display font-semibold text-white text-[13px] mb-1.5">{p.title}</div>
                <p className="text-[11px] text-[#5e7aa8] leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* FULLSCREEN LIGHTBOX MODAL */}
      {selectedMap && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8 animate-fade-in"
          onClick={() => setSelectedMap(null)}
        >
          <div 
            className="card max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden bg-[#0c1018] border-white/10 shadow-2xl relative"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#080d14]">
              <div>
                <span className="font-mono-data text-[10px] text-[#00d4ff] font-semibold tracking-wider uppercase">
                  {selectedMap.phase} · {selectedMap.crs || 'EPSG:32644'}
                </span>
                <h2 className="font-display text-lg font-bold text-white leading-tight mt-0.5">{selectedMap.title}</h2>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href={`/maps/${selectedMap.file}`}
                  download={selectedMap.file}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00d4ff]/10 border border-[#00d4ff]/20 text-[#00d4ff] hover:bg-[#00d4ff]/20 transition-all font-mono-data text-xs font-semibold"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PNG</span>
                </a>
                <button
                  onClick={() => setSelectedMap(null)}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Image Area */}
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-[#04070c] relative min-h-[400px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/maps/${selectedMap.file}`}
                alt={selectedMap.title}
                className="max-w-full max-h-[65vh] object-contain rounded-lg shadow-2xl border border-white/10"
              />
            </div>

            {/* Modal Footer Description */}
            <div className="px-6 py-4 border-t border-white/10 bg-[#080d14]">
              <p className="text-sm text-[#8ba3cc] leading-relaxed">{selectedMap.desc}</p>
              <div className="flex flex-wrap items-center gap-4 mt-2 font-mono-data text-xs text-[#4a6890]">
                <span>File: {selectedMap.file}</span>
                <span>Resolution: 10m Sentinel-2</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
