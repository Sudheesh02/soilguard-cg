'use client';
import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Topbar from '@/components/layout/Topbar';
import Badge from '@/components/ui/Badge';
import { SECTORS, urgencyColor, type Urgency } from '@/lib/data';
import { ChevronDown, ChevronUp } from 'lucide-react';

type Filter = 'all' | 'critical' | 'moderate' | 'stable';

const FILTERS: { key: Filter; label: string; count: number }[] = [
  { key: 'all',      label: 'All Sectors', count: 25 },
  { key: 'critical', label: 'Critical',    count: SECTORS.filter(s => s.tier === 1).length },
  { key: 'moderate', label: 'Moderate',    count: SECTORS.filter(s => s.tier === 2).length },
  { key: 'stable',   label: 'Stable',      count: SECTORS.filter(s => s.tier === 3).length },
];

export default function SectorsPage() {
  const [filter, setFilter] = useState<Filter>('all');
  const [expanded, setExpanded] = useState<number | null>(null);

  const visible = SECTORS.filter(s => {
    if (filter === 'critical') return s.tier === 1;
    if (filter === 'moderate') return s.tier === 2;
    if (filter === 'stable')   return s.tier === 3;
    return true;
  });

  return (
    <DashboardLayout>
      <Topbar title="Sector Analysis" subtitle="All 25 agricultural zones · 5×5 grid overlay · Raipur AOI" />
      <div className="p-6 animate-fade-in">

        {/* Filter bar */}
        <div className="flex flex-wrap gap-2 mb-6">
          {FILTERS.map(f => {
            const active = filter === f.key;
            const col = f.key === 'critical' ? '#ef4444' : f.key === 'moderate' ? '#f59e0b' : f.key === 'stable' ? '#10b981' : '#00d4ff';
            return (
              <button key={f.key} onClick={() => { setFilter(f.key); setExpanded(null); }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-mono-data text-[11px] font-semibold border transition-all"
                style={active
                  ? { background: `${col}18`, border: `1px solid ${col}40`, color: col }
                  : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#5e7aa8' }}>
                {f.label}
                <span className="px-1.5 py-0.5 rounded-md text-[9px]"
                  style={active ? { background: `${col}25` } : { background: 'rgba(255,255,255,0.06)' }}>
                  {f.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                  {['#','Sector','Urgency','Risk Score','Bare Area (ha)','High Risk (ha)','% High','SOC (dg/kg)','BSI'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-mono-data text-[9px] text-[#3d5a80] tracking-widest font-medium whitespace-nowrap">{h}</th>
                  ))}
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {visible.map(s => {
                  const c = urgencyColor(s.urgency);
                  const open = expanded === s.rank;
                  return (
                    <>
                      <tr key={s.rank}
                        onClick={() => setExpanded(open ? null : s.rank)}
                        className="border-b border-white/[0.04] hover:bg-white/[0.03] cursor-pointer transition-colors">
                        <td className="px-4 py-3">
                          <span className="font-mono-data text-[11px] font-bold px-2 py-1 rounded-lg"
                            style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}>#{s.rank}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-display text-[13px] font-semibold text-[#dce8ff]">{s.name}</span>
                        </td>
                        <td className="px-4 py-3"><Badge urgency={s.urgency} /></td>
                        <td className="px-4 py-3">
                          <span className="font-mono-data text-[13px] font-bold" style={{ color: c.text }}>{s.risk.toFixed(4)}</span>
                        </td>
                        <td className="px-4 py-3"><span className="font-mono-data text-[12px] text-[#8ba3cc]">{s.bare.toLocaleString('en-IN', { maximumFractionDigits: 1 })}</span></td>
                        <td className="px-4 py-3"><span className="font-mono-data text-[12px] font-semibold" style={{ color: c.text }}>{s.highRisk.toLocaleString('en-IN', { maximumFractionDigits: 1 })}</span></td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-12 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${Math.min(s.pct, 100)}%`, background: c.text }} />
                            </div>
                            <span className="font-mono-data text-[11px]" style={{ color: c.text }}>{s.pct.toFixed(1)}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3"><span className="font-mono-data text-[12px] text-[#8ba3cc]">{s.soc.toFixed(1)}</span></td>
                        <td className="px-4 py-3"><span className="font-mono-data text-[11px] text-[#5e7aa8]">{s.bsi.toFixed(4)}</span></td>
                        <td className="px-4 py-3 text-[#4a6890]">
                          {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </td>
                      </tr>
                      {open && (
                        <tr key={`${s.rank}-exp`} className="border-b border-white/[0.04]">
                          <td colSpan={10} className="px-4 pb-4 pt-0">
                            <div className="rounded-xl p-4 mt-1"
                              style={{ background: `${c.bg}`, border: `1px solid ${c.border}` }}>
                              <p className="font-mono-data text-[9px] tracking-widest mb-2.5" style={{ color: `${c.text}99` }}>
                                AGRONOMIC INTERVENTION · {s.name} ({s.gridId})
                              </p>
                              <div className="space-y-2">
                                {s.recommendations.map((r, i) => (
                                  <div key={i} className="flex gap-3 items-start">
                                    <span className="font-mono-data text-[10px] font-bold shrink-0 mt-0.5" style={{ color: c.text }}>{i + 1}.</span>
                                    <span className="text-[12px] text-[#8ba3cc] leading-relaxed">{r}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <p className="font-mono-data text-[10px] text-[#3d5a80] mt-3 px-1">
          Grid: 5×5 regular spatial overlay · Raipur AOI · SOC in dg/kg · Click row to expand intervention package
        </p>
      </div>
    </DashboardLayout>
  );
}
