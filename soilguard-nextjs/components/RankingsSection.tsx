'use client';
import { useState, Fragment } from 'react';

const ALL_SECTORS = [
  { rank: 1,  name: 'Arang (B-1)',         risk: 0.6143, bare: 1154.2, highRisk: 869.2,  pct: 75.31, soc: 12.02,  bsi: 0.1017, ph: 0.64,  urgency: 'CRITICAL',  tier: 1 },
  { rank: 2,  name: 'Abhanpur (A-1)',       risk: 0.6106, bare: 1136.8, highRisk: 816.0,  pct: 71.78, soc: 22.74,  bsi: 0.1250, ph: 1.24,  urgency: 'CRITICAL',  tier: 1 },
  { rank: 3,  name: 'Arang (B-2)',          risk: 0.5925, bare: 1108.7, highRisk: 711.2,  pct: 64.14, soc: 7.94,   bsi: 0.1078, ph: 0.43,  urgency: 'MODERATE',  tier: 2 },
  { rank: 4,  name: 'Abhanpur (A-2)',       risk: 0.5717, bare: 576.8,  highRisk: 316.3,  pct: 54.83, soc: 67.95,  bsi: 0.0567, ph: 3.69,  urgency: 'MODERATE',  tier: 2 },
  { rank: 5,  name: 'Raipur Rural (C-1)',   risk: 0.5068, bare: 780.6,  highRisk: 202.9,  pct: 25.99, soc: 99.76,  bsi: 0.1093, ph: 4.83,  urgency: 'MODERATE',  tier: 2 },
  { rank: 6,  name: 'Abhanpur (A-3)',       risk: 0.4997, bare: 743.8,  highRisk: 136.5,  pct: 18.35, soc: 115.18, bsi: 0.1394, ph: 5.91,  urgency: 'MODERATE',  tier: 2 },
  { rank: 7,  name: 'Raipur Rural (C-2)',   risk: 0.4981, bare: 931.2,  highRisk: 196.8,  pct: 21.13, soc: 113.82, bsi: 0.1513, ph: 5.31,  urgency: 'MODERATE',  tier: 2 },
  { rank: 8,  name: 'Arang (B-3)',          risk: 0.4886, bare: 617.8,  highRisk: 85.2,   pct: 13.78, soc: 120.32, bsi: 0.1428, ph: 6.35,  urgency: 'MODERATE',  tier: 2 },
  { rank: 9,  name: 'Arang (B-4)',          risk: 0.4862, bare: 581.9,  highRisk: 54.5,   pct: 9.36,  soc: 143.46, bsi: 0.2050, ph: 6.57,  urgency: 'MODERATE',  tier: 2 },
  { rank: 10, name: 'Arang (B-5)',          risk: 0.4835, bare: 949.6,  highRisk: 68.8,   pct: 7.24,  soc: 113.67, bsi: 0.2468, ph: 5.90,  urgency: 'MODERATE',  tier: 2 },
  { rank: 11, name: 'Raipur Rural (C-4)',   risk: 0.4822, bare: 819.6,  highRisk: 31.1,   pct: 3.79,  soc: 130.63, bsi: 0.2319, ph: 6.89,  urgency: 'MODERATE',  tier: 2 },
  { rank: 12, name: 'Raipur Rural (C-3)',   risk: 0.4819, bare: 635.7,  highRisk: 50.5,   pct: 7.94,  soc: 129.10, bsi: 0.1680, ph: 6.57,  urgency: 'MODERATE',  tier: 2 },
  { rank: 13, name: 'Abhanpur (A-4)',       risk: 0.4783, bare: 821.3,  highRisk: 45.0,   pct: 5.48,  soc: 122.18, bsi: 0.2123, ph: 6.84,  urgency: 'MODERATE',  tier: 2 },
  { rank: 14, name: 'Dharsiwa (D-5)',       risk: 0.4739, bare: 771.5,  highRisk: 36.0,   pct: 4.67,  soc: 134.98, bsi: 0.1988, ph: 6.83,  urgency: 'MODERATE',  tier: 2 },
  { rank: 15, name: 'Abhanpur (A-5)',       risk: 0.4719, bare: 1086.9, highRisk: 58.4,   pct: 5.37,  soc: 117.94, bsi: 0.2373, ph: 6.30,  urgency: 'MODERATE',  tier: 2 },
  { rank: 16, name: 'Tilda (E-5)',          risk: 0.4679, bare: 950.9,  highRisk: 27.2,   pct: 2.86,  soc: 120.48, bsi: 0.2197, ph: 6.71,  urgency: 'MODERATE',  tier: 2 },
  { rank: 17, name: 'Raipur Rural (C-5)',   risk: 0.4662, bare: 977.6,  highRisk: 45.6,   pct: 4.67,  soc: 130.84, bsi: 0.2411, ph: 6.98,  urgency: 'MODERATE',  tier: 2 },
  { rank: 18, name: 'Dharsiwa (D-4)',       risk: 0.4594, bare: 861.9,  highRisk: 23.5,   pct: 2.73,  soc: 139.13, bsi: 0.2149, ph: 7.03,  urgency: 'STABLE',    tier: 3 },
  { rank: 19, name: 'Tilda (E-4)',          risk: 0.4470, bare: 1142.3, highRisk: 20.0,   pct: 1.75,  soc: 148.99, bsi: 0.2273, ph: 6.90,  urgency: 'STABLE',    tier: 3 },
  { rank: 20, name: 'Dharsiwa (D-2)',       risk: 0.4440, bare: 706.2,  highRisk: 18.6,   pct: 2.63,  soc: 152.46, bsi: 0.1524, ph: 7.13,  urgency: 'STABLE',    tier: 3 },
  { rank: 21, name: 'Dharsiwa (D-1)',       risk: 0.4428, bare: 824.7,  highRisk: 70.8,   pct: 8.58,  soc: 153.68, bsi: 0.1202, ph: 6.97,  urgency: 'STABLE',    tier: 3 },
  { rank: 22, name: 'Dharsiwa (D-3)',       risk: 0.4421, bare: 949.3,  highRisk: 23.3,   pct: 2.45,  soc: 151.27, bsi: 0.2064, ph: 7.05,  urgency: 'STABLE',    tier: 3 },
  { rank: 23, name: 'Tilda (E-1)',          risk: 0.4395, bare: 1242.2, highRisk: 48.7,   pct: 3.92,  soc: 148.69, bsi: 0.1799, ph: 6.99,  urgency: 'STABLE',    tier: 3 },
  { rank: 24, name: 'Tilda (E-3)',          risk: 0.4381, bare: 1280.7, highRisk: 20.1,   pct: 1.57,  soc: 172.42, bsi: 0.2385, ph: 7.01,  urgency: 'STABLE',    tier: 3 },
  { rank: 25, name: 'Tilda (E-2)',          risk: 0.4287, bare: 1050.4, highRisk: 13.5,   pct: 1.29,  soc: 160.79, bsi: 0.1915, ph: 7.12,  urgency: 'STABLE',    tier: 3 },
];

const TOP_ACTIONS: Record<string, string[]> = {
  'Arang (B-1)':       ['Apply 8–10 t/ha FYM or 3 t/ha Biochar', 'Green manuring: Dhaincha/Sunnhemp pre-Kharif', 'Agricultural Lime @ 2.5 t/ha (pH < 1)'],
  'Abhanpur (A-1)':    ['Apply 8–10 t/ha FYM or 3 t/ha Biochar', 'Green manuring: Dhaincha/Sunnhemp pre-Kharif', 'Rotate with Pigeonpea for N-fixation'],
  'Arang (B-2)':       ['Apply 5 t/ha FYM + crop residue incorporation', 'Agricultural Lime @ 2.0 t/ha', 'INM: 75% RDF + 25% organic manure'],
  'Abhanpur (A-2)':    ['INM: 75% RDF + 25% organic manure', 'Zero-tillage + paddy straw mulching (3–4 t/ha)', 'Legume cover crop rotation'],
  'Raipur Rural (C-1)': ['Moderate: 5 t/ha FYM + balanced NPK', 'Surface mulching to preserve topsoil moisture', 'INM stewardship package'],
};

type FilterType = 'all' | 'critical' | 'moderate' | 'stable';
const FILTERS: { key: FilterType; label: string; color: string }[] = [
  { key: 'all',      label: 'All Sectors (25)', color: 'badge-ghost' },
  { key: 'critical', label: 'Critical Tier 1',  color: 'badge-red' },
  { key: 'moderate', label: 'Moderate Tier 2',  color: 'badge-amber' },
  { key: 'stable',   label: 'Stable Tier 3',    color: 'badge-emerald' },
];

function urgencyColor(u: string) {
  if (u === 'CRITICAL') return { badge: 'badge-red',     text: '#ef4444' };
  if (u === 'MODERATE') return { badge: 'badge-amber',   text: '#f59e0b' };
  return                        { badge: 'badge-emerald', text: '#10b981' };
}

export default function RankingsSection() {
  const [filter, setFilter] = useState<FilterType>('all');
  const [expanded, setExpanded] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);

  const filtered = ALL_SECTORS.filter(s => {
    if (filter === 'all') return true;
    if (filter === 'critical') return s.tier === 1;
    if (filter === 'moderate') return s.tier === 2;
    if (filter === 'stable')   return s.tier === 3;
    return true;
  });
  const visible = showAll ? filtered : filtered.slice(0, 10);

  return (
    <section id="rankings" className="py-24 bg-[#06090f] section-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <p className="eyebrow eyebrow-amber mb-4">Zonal Priority Ranking</p>
            <h2 className="section-title mb-4">
              Sector Priority Matrix &amp;<br className="hidden md:block"/>
              <span className="text-[#f59e0b]"> Agronomic Advisory</span>
            </h2>
            <p className="section-body">
              All 25 agricultural sectors ranked by mean zonal risk score. Grid represents a regular 5×5 spatial overlay covering the Raipur AOI (22km × 22km). Click a row to view the intervention package.
            </p>
          </div>
          {/* Filter buttons */}
          <div className="flex flex-wrap gap-2 shrink-0">
            {FILTERS.map(f => (
              <button
                key={f.key}
                onClick={() => { setFilter(f.key); setShowAll(false); }}
                className={`px-4 py-2 rounded-xl font-mono text-[11px] font-semibold border transition-all ${
                  filter === f.key
                    ? f.key === 'all'      ? 'bg-[rgba(255,255,255,0.08)] border-[rgba(255,255,255,0.20)] text-[#e2ecff]'
                    : f.key === 'critical' ? 'bg-[rgba(239,68,68,0.12)] border-[rgba(239,68,68,0.28)] text-[#ef4444]'
                    : f.key === 'moderate' ? 'bg-[rgba(245,158,11,0.12)] border-[rgba(245,158,11,0.28)] text-[#f59e0b]'
                    :                        'bg-[rgba(16,185,129,0.12)] border-[rgba(16,185,129,0.28)] text-[#10b981]'
                    : 'bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.09)] text-[#8ba3cc] hover:text-[#e2ecff] hover:bg-[rgba(255,255,255,0.06)]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 4px 32px rgba(0,0,0,0.3)' }}>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: 60 }}>Rank</th>
                  <th>Sector</th>
                  <th>Urgency</th>
                  <th>Mean Risk</th>
                  <th>Bare Area</th>
                  <th>High Risk Area</th>
                  <th>% High</th>
                  <th>Mean SOC</th>
                  <th>Mean BSI</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((s) => {
                  const uc = urgencyColor(s.urgency);
                  const isExpanded = expanded === s.rank;
                  const actions = TOP_ACTIONS[s.name];

                  return (
                    <Fragment key={s.rank}>
                      <tr
                        onClick={() => setExpanded(isExpanded ? null : s.rank)}
                        className="cursor-pointer"
                        style={{ borderBottom: isExpanded ? 'none' : undefined }}
                      >
                        <td>
                          <span
                            className="font-mono text-[12px] font-bold px-2.5 py-1 rounded-lg"
                            style={{
                              background: s.tier === 1 ? 'rgba(239,68,68,0.12)' : s.tier === 2 ? 'rgba(245,158,11,0.10)' : 'rgba(255,255,255,0.05)',
                              color: s.tier === 1 ? '#ef4444' : s.tier === 2 ? '#f59e0b' : '#4a6890',
                              border: `1px solid ${s.tier === 1 ? 'rgba(239,68,68,0.28)' : s.tier === 2 ? 'rgba(245,158,11,0.25)' : 'rgba(255,255,255,0.09)'}`,
                            }}
                          >
                            #{s.rank}
                          </span>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <span style={{ fontFamily: "'Space Grotesk', sans-serif" }} className="text-[13.5px] font-bold text-[#e2ecff]">{s.name}</span>
                            {actions && <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d={isExpanded ? 'M2 8l4-4 4 4' : 'M2 4l4 4 4-4'} stroke="#4a6890" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                          </div>
                        </td>
                        <td><span className={`badge ${uc.badge}`}>{s.urgency}</span></td>
                        <td>
                          <span
                            className="font-mono font-bold text-[13px]"
                            style={{ color: uc.text }}
                          >
                            {s.risk.toFixed(4)}
                          </span>
                        </td>
                        <td><span className="font-mono text-[12.5px] text-[#8ba3cc]">{s.bare.toLocaleString('en-IN', {maximumFractionDigits:1})} ha</span></td>
                        <td><span className="font-mono text-[12.5px] font-bold" style={{ color: uc.text }}>{s.highRisk.toLocaleString('en-IN', {maximumFractionDigits:1})} ha</span></td>
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${Math.min(s.pct, 100)}%`, background: uc.text }} />
                            </div>
                            <span className="font-mono text-[11px]" style={{ color: uc.text }}>{s.pct.toFixed(1)}%</span>
                          </div>
                        </td>
                        <td><span className="font-mono text-[12px] text-[#8ba3cc]">{s.soc.toFixed(1)}</span></td>
                        <td><span className="font-mono text-[12px] text-[#8ba3cc]">{s.bsi.toFixed(4)}</span></td>
                      </tr>
                      {isExpanded && actions && (
                        <tr key={`${s.rank}-exp`}>
                          <td colSpan={9} className="!pt-0">
                            <div
                              className="mx-2 mb-3 rounded-xl p-4"
                              style={{
                                background: `radial-gradient(ellipse at 0% 0%, ${uc.text}0d, transparent), rgba(6,9,15,0.6)`,
                                border: `1px solid ${uc.text}28`,
                              }}
                            >
                              <p className="eyebrow mb-3" style={{ color: `${uc.text}bb` }}>AGRONOMIC INTERVENTION PACKAGE — {s.name}</p>
                              <div className="space-y-2">
                                {actions.map((a, ai) => (
                                  <div key={ai} className="flex items-start gap-3">
                                    <span className="font-mono text-[11px] font-bold mt-0.5 shrink-0" style={{ color: uc.text }}>{ai + 1}.</span>
                                    <span className="text-[13px] text-[#8ba3cc] leading-relaxed">{a}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filtered.length > 10 && (
            <div className="px-4 py-4 border-t border-[rgba(255,255,255,0.06)] flex justify-center bg-[#0a0f1a]">
              <button
                onClick={() => setShowAll(s => !s)}
                className="px-6 py-2.5 rounded-xl font-mono text-[12px] font-semibold border border-[rgba(255,255,255,0.10)] text-[#8ba3cc] bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.07)] hover:text-[#e2ecff] transition-all"
              >
                {showAll ? '▲ Show Top 10' : `▼ Show All ${filtered.length} Sectors`}
              </button>
            </div>
          )}
        </div>

        <p className="text-[11.5px] text-[#4a6890] font-mono mt-4 pl-1">
          * Sectors represent a regular 5×5 spatial grid overlay covering the Raipur AOI (22km × 22km). Mean SOC in dg/kg. Click row to expand agronomic package.
        </p>

      </div>
    </section>
  );
}
