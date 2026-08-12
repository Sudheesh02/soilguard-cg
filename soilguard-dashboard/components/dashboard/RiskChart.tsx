'use client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer, ReferenceLine } from 'recharts';
import { SECTORS } from '@/lib/data';
import { TIER_COLORS } from '@/lib/theme';

const DATA = SECTORS.map(s => ({
  name: s.gridId,
  risk: +s.risk.toFixed(4),
  tier: s.tier,
  fullName: s.name,
}));

const COLORS = TIER_COLORS;

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const color = COLORS[d.tier as 1 | 2 | 3];
  return (
    <div className="card px-3 py-2.5 text-xs">
      <p className="font-display font-semibold text-white mb-1">{d.fullName}</p>
      <p className="font-mono-data" style={{ color }}>Risk Score: {d.risk}</p>
    </div>
  );
}

export default function RiskChart() {
  return (
    <div className="card p-5 h-full">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="font-display font-semibold text-white text-[15px]">SOC Risk Score: All 25 Sectors</h3>
          <p className="text-[11px] text-[#4a6890] mt-0.5">Mean SOC Deficiency Index by sector grid cell</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {[['#ef4444', 'Critical'], ['#f59e0b', 'Moderate'], ['#10b981', 'Stable']].map(([c, l]) => (
            <div key={l} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ background: c as string }} />
              <span className="text-[10px] font-mono-data text-[#5e7aa8]">{l}</span>
            </div>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={DATA} margin={{ top: 5, right: 5, left: -20, bottom: 30 }}>
          <XAxis dataKey="name" tick={{ fill: '#4a6890', fontSize: 9, fontFamily: 'JetBrains Mono' }}
            angle={-45} textAnchor="end" interval={0} />
          <YAxis tick={{ fill: '#4a6890', fontSize: 10, fontFamily: 'JetBrains Mono' }} domain={[0.38, 0.65]} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <ReferenceLine y={0.58} stroke="#ef444460" strokeDasharray="4 3"
            label={{ value: 'CRITICAL', fill: '#ef444480', fontSize: 9, fontFamily: 'JetBrains Mono' }} />
          <ReferenceLine y={0.45} stroke="#f59e0b50" strokeDasharray="4 3"
            label={{ value: 'MODERATE', fill: '#f59e0b70', fontSize: 9, fontFamily: 'JetBrains Mono' }} />
          <Bar dataKey="risk" radius={[3, 3, 0, 0]}>
            {DATA.map((d, i) => (
              <Cell key={i} fill={COLORS[d.tier as 1 | 2 | 3]} fillOpacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
