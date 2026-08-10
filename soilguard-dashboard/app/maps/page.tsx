'use client';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Topbar from '@/components/layout/Topbar';
import { MAPS } from '@/lib/data';
import { Image as ImageIcon, Info } from 'lucide-react';

const PHASE_COLOR: Record<string, string> = {
  'Phase 2': '#00d4ff',
  'Phase 3': '#f59e0b',
  'Phase 4': '#10b981',
};

export default function MapsPage() {
  return (
    <DashboardLayout>
      <Topbar title="Analysis Maps" subtitle="Satellite-derived geospatial outputs · 10m resolution · Sentinel-2 L2A" />
      <div className="p-6 animate-fade-in">

        <div className="card px-5 py-3 flex items-start gap-3 mb-6 border-[rgba(0,212,255,0.15)] bg-[rgba(0,212,255,0.04)]">
          <Info className="w-4 h-4 text-[#00d4ff] shrink-0 mt-0.5" />
          <p className="text-[12px] text-[#8ba3cc] leading-relaxed">
            Place PNG map files from <code className="font-mono-data text-[#00d4ff] text-[11px] bg-[rgba(0,212,255,0.08)] px-1.5 py-0.5 rounded">soilguard-cg/outputs/</code> into{' '}
            <code className="font-mono-data text-[#00d4ff] text-[11px] bg-[rgba(0,212,255,0.08)] px-1.5 py-0.5 rounded">soilguard-dashboard/public/maps/</code> to display them here.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {MAPS.map(m => {
            const phaseColor = PHASE_COLOR[m.phase] ?? '#818cf8';
            return (
              <div key={m.id} className="card overflow-hidden group hover:scale-[1.01] transition-transform duration-200"
                style={{ boxShadow: `0 4px 24px rgba(0,0,0,0.3)` }}>
                <div className="aspect-video bg-[#0a0f18] border-b border-white/[0.06] flex items-center justify-center relative overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/maps/${m.file}`}
                    alt={m.title}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center flex-col gap-2 opacity-100 group-[img:not([style*='none'])]:opacity-0">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                      style={{ background: `${phaseColor}18`, border: `1px solid ${phaseColor}30` }}>
                      <ImageIcon className="w-5 h-5" style={{ color: phaseColor }} />
                    </div>
                    <p className="font-mono-data text-[10px] text-[#3d5a80]">{m.file}</p>
                  </div>
                  <div className="absolute top-3 left-3">
                    <span className="font-mono-data text-[9px] font-semibold px-2 py-1 rounded-lg tracking-widest"
                      style={{ background: `${phaseColor}20`, color: phaseColor, border: `1px solid ${phaseColor}35` }}>
                      {m.phase}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-display font-semibold text-white text-[14px] mb-1.5">{m.title}</h3>
                  <p className="text-[12px] text-[#5e7aa8] leading-relaxed">{m.desc}</p>
                  <p className="font-mono-data text-[10px] text-[#3d5a80] mt-2">{m.file}</p>
                </div>
              </div>
            );
          })}
        </div>

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
    </DashboardLayout>
  );
}
