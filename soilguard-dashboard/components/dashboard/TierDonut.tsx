'use client';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { STATS } from '@/lib/data';
import { TIER_COLORS } from '@/lib/theme';

const DATA = [
  { name: 'Critical', value: STATS.criticalCount, color: TIER_COLORS[1] },
  { name: 'Moderate', value: STATS.moderateCount, color: TIER_COLORS[2] },
  { name: 'Stable',   value: STATS.stableCount,   color: TIER_COLORS[3] },
];

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="card px-3 py-2 text-xs">
      <p className="font-mono-data" style={{ color: d.payload.color }}>{d.name}: {d.value} sectors</p>
    </div>
  );
}

export default function TierDonut() {
  return (
    <div className="card p-5 h-full">
      <h3 className="font-display font-semibold text-white text-[15px] mb-0.5">Tier Distribution</h3>
      <p className="text-[11px] text-[#4a6890] mb-4">25 sectors by urgency classification</p>
      <div className="flex items-center gap-4">
        <ResponsiveContainer width={120} height={120}>
          <PieChart>
            <Pie data={DATA} cx={55} cy={55} innerRadius={32} outerRadius={52}
              paddingAngle={3} dataKey="value" startAngle={90} endAngle={-270}>
              {DATA.map((d, i) => <Cell key={i} fill={d.color} fillOpacity={0.85} />)}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="space-y-3 flex-1">
          {DATA.map(d => (
            <div key={d.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                <span className="text-[12px] text-[#8ba3cc]">{d.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-20 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(d.value / 25) * 100}%`, background: d.color }} />
                </div>
                <span className="font-mono-data text-[12px] font-bold" style={{ color: d.color }}>{d.value}</span>
              </div>
            </div>
          ))}
          <div className="pt-2 border-t border-white/[0.06]">
            <p className="text-[10px] text-[#3d5a80] font-mono-data">RF Model · R² {STATS.r2.toFixed(4)} · {STATS.processingTimeSec}s runtime</p>
          </div>
        </div>
      </div>
    </div>
  );
}
