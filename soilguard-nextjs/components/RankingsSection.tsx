'use client';
import { useState, Fragment, useEffect, useRef } from 'react';

import { ALL_SECTORS, TOP_ACTIONS } from '@/lib/site-data';

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
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const filtered = ALL_SECTORS.filter(s => {
    if (filter === 'all') return true;
    if (filter === 'critical') return s.tier === 1;
    if (filter === 'moderate') return s.tier === 2;
    if (filter === 'stable')   return s.tier === 3;
    return true;
  });
  const visible = showAll ? filtered : filtered.slice(0, 10);

  return (
    <section id="rankings" ref={sectionRef} className="py-16 bg-[#06090f] section-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
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
                {visible.map((s, index) => {
                  const uc = urgencyColor(s.urgency);
                  const isExpanded = expanded === s.rank;
                  const actions = (TOP_ACTIONS as any)?.[s.name] || (TOP_ACTIONS as any)?.[s.rank] || [];
                  
                  // For background bar
                  const riskPercent = (s.risk / 0.8) * 100; // max risk approx 0.8
                  
                  // Medal logic
                  const medal = s.rank === 1 ? '🥇' : s.rank === 2 ? '🥈' : s.rank === 3 ? '🥉' : null;

                  return (
                    <Fragment key={s.rank}>
                      <tr
                        onClick={() => setExpanded(isExpanded ? null : s.rank)}
                        className={`cursor-pointer relative group transition-all duration-300 ease-out hover:bg-[rgba(255,255,255,0.03)] ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                        style={{ borderBottom: isExpanded ? 'none' : undefined, transitionDelay: `${index * 30}ms` }}
                      >
                        {/* Background Risk Bar */}
                        <td className="absolute inset-0 z-0 pointer-events-none opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                          <div className="h-full rounded-r-xl" style={{ width: `${riskPercent}%`, background: `linear-gradient(90deg, transparent, ${uc.text})` }} />
                        </td>
                        
                        <td className="relative z-10">
                          <span
                            className="font-mono text-[12px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 w-fit"
                            style={{
                              background: s.tier === 1 ? 'rgba(239,68,68,0.12)' : s.tier === 2 ? 'rgba(245,158,11,0.10)' : 'rgba(255,255,255,0.05)',
                              color: s.tier === 1 ? '#ef4444' : s.tier === 2 ? '#f59e0b' : '#4a6890',
                              border: `1px solid ${s.tier === 1 ? 'rgba(239,68,68,0.28)' : s.tier === 2 ? 'rgba(245,158,11,0.25)' : 'rgba(255,255,255,0.09)'}`,
                            }}
                          >
                            {medal && <span>{medal}</span>}
                            #{s.rank}
                          </span>
                        </td>
                        <td className="relative z-10">
                          <div className="flex items-center gap-2 group/tooltip">
                            <span style={{ fontFamily: "'Space Grotesk', sans-serif" }} className="text-[13.5px] font-bold text-[#e2ecff]">{s.name}</span>
                            {actions && <svg className="transition-transform group-hover:translate-x-1" width="12" height="12" viewBox="0 0 12 12" fill="none"><path d={isExpanded ? 'M2 8l4-4 4 4' : 'M2 4l4 4 4-4'} stroke="#4a6890" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                            
                            {/* Hover tooltip */}
                            <div className="absolute left-1/2 -top-8 -translate-x-1/2 bg-[#0e1522] border border-[rgba(255,255,255,0.1)] px-3 py-1.5 rounded-lg opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all whitespace-nowrap z-50 shadow-xl shadow-black/50 pointer-events-none">
                              <span className="text-[11px] font-mono text-[#8ba3cc]">Grid: {s.name} ({s.bare} ha bare soil)</span>
                            </div>
                          </div>
                        </td>
                        <td className="relative z-10"><span className={`badge ${uc.badge}`}>{s.urgency}</span></td>
                        <td className="relative z-10">
                          <span
                            className="font-mono font-bold text-[13px]"
                            style={{ color: uc.text }}
                          >
                            {s.risk.toFixed(4)}
                          </span>
                        </td>
                        <td className="relative z-10"><span className="font-mono text-[12.5px] text-[#8ba3cc]">{s.bare.toLocaleString('en-IN', {maximumFractionDigits:1})} ha</span></td>
                        <td className="relative z-10"><span className="font-mono text-[12.5px] font-bold" style={{ color: uc.text }}>{s.highRisk.toLocaleString('en-IN', {maximumFractionDigits:1})} ha</span></td>
                        <td className="relative z-10">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
                              <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ width: isVisible ? `${Math.min(s.pct, 100)}%` : '0%', background: uc.text }} />
                            </div>
                            <span className="font-mono text-[11px]" style={{ color: uc.text }}>{s.pct.toFixed(1)}%</span>
                          </div>
                        </td>
                        <td className="relative z-10"><span className="font-mono text-[12px] text-[#8ba3cc]">{s.soc.toFixed(1)}</span></td>
                        <td className="relative z-10"><span className="font-mono text-[12px] text-[#8ba3cc]">{s.bsi.toFixed(4)}</span></td>
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
                                {actions.map((a: any, ai: number) => (
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
