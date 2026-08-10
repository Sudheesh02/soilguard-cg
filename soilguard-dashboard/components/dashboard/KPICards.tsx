import { STATS } from '@/lib/data';
import { Globe, AlertTriangle, Leaf, Flame } from 'lucide-react';

const CARDS = [
  {
    label: 'Total AOI Area',
    value: '22,702',
    unit: 'ha',
    sub: 'Raipur–Durg agricultural belt',
    icon: Globe,
    color: '#00d4ff',
    bg: 'rgba(0,212,255,0.07)',
    border: 'rgba(0,212,255,0.18)',
    glow: '0 0 24px rgba(0,212,255,0.10)',
  },
  {
    label: 'Critical Sectors',
    value: String(STATS.criticalCount),
    unit: `/ ${STATS.totalSectors}`,
    sub: `${STATS.moderateCount} moderate · ${STATS.stableCount} stable`,
    icon: AlertTriangle,
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.07)',
    border: 'rgba(239,68,68,0.18)',
    glow: '0 0 24px rgba(239,68,68,0.10)',
  },
  {
    label: 'Mean SOC (bare soil)',
    value: STATS.avgSOC.toFixed(1),
    unit: 'dg/kg',
    sub: 'Critical threshold: 100 dg/kg',
    icon: Leaf,
    color: '#10b981',
    bg: 'rgba(16,185,129,0.07)',
    border: 'rgba(16,185,129,0.18)',
    glow: '0 0 24px rgba(16,185,129,0.10)',
  },
  {
    label: 'High-Risk Area',
    value: STATS.totalHighRiskHa.toLocaleString('en-IN', { maximumFractionDigits: 0 }),
    unit: 'ha',
    sub: `${((STATS.totalHighRiskHa / STATS.totalBareHa) * 100).toFixed(1)}% of bare soil pixels`,
    icon: Flame,
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.07)',
    border: 'rgba(245,158,11,0.18)',
    glow: '0 0 24px rgba(245,158,11,0.10)',
  },
];

export default function KPICards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {CARDS.map((c) => (
        <div key={c.label} className="card p-5 relative overflow-hidden group hover:scale-[1.01] transition-transform duration-200"
          style={{ boxShadow: c.glow }}>
          <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10 blur-2xl"
            style={{ background: c.color, transform: 'translate(30%,-30%)' }} />
          <div className="flex items-start justify-between mb-3">
            <div className="p-2.5 rounded-xl" style={{ background: c.bg, border: `1px solid ${c.border}` }}>
              <c.icon className="w-4 h-4" style={{ color: c.color }} strokeWidth={2} />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 mb-1">
            <span className="font-display text-3xl font-bold text-white tracking-tight">{c.value}</span>
            <span className="font-mono-data text-sm font-medium" style={{ color: c.color }}>{c.unit}</span>
          </div>
          <p className="text-[13px] font-semibold text-[#8ba3cc] mb-1">{c.label}</p>
          <p className="text-[11px] text-[#4a6890]">{c.sub}</p>
        </div>
      ))}
    </div>
  );
}
