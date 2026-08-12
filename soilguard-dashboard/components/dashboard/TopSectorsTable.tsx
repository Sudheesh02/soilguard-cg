'use client';
import { SECTORS } from '@/lib/data';
import { TIER_COLORS } from '@/lib/theme';
import Badge from '@/components/ui/Badge';
import { ArrowDown, ChevronDown } from 'lucide-react';

const RANK_COLORS = ['#fbbf24', '#94a3b8', '#b45309']; // Gold, Silver, Bronze

export default function TopSectorsTable() {
  const top = SECTORS.slice(0, 8);
  return (
    <div className="card p-5 h-full relative overflow-hidden group">
      {/* Subtle shine background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
      
      <div className="mb-5 flex items-center justify-between relative z-10">
        <div>
          <h3 className="font-display font-semibold text-white text-[15px] flex items-center gap-2">
            Priority Sectors
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
          </h3>
          <p className="text-[11px] text-[#4a6890] mt-0.5">Top 8 sectors ranked by SOC deficiency risk</p>
        </div>
      </div>
      
      <div className="overflow-hidden rounded-xl border border-white/[0.06] relative z-10 bg-[#080d14]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06] bg-white/[0.02]">
              <th className="text-left px-3 py-3 font-mono-data text-[10px] text-[#3d5a80] tracking-widest font-medium">
                <div className="flex items-center gap-1">#</div>
              </th>
              <th className="text-left px-3 py-3 font-mono-data text-[10px] text-[#3d5a80] tracking-widest font-medium">
                <div className="flex items-center gap-1">SECTOR</div>
              </th>
              <th className="text-left px-3 py-3 font-mono-data text-[10px] text-[#3d5a80] tracking-widest font-medium">
                <div className="flex items-center gap-1">URGENCY</div>
              </th>
              <th className="text-right px-3 py-3 font-mono-data text-[10px] text-[#3d5a80] tracking-widest font-medium">
                <div className="flex items-center justify-end gap-1">
                  RISK SCORE <ArrowDown className="w-3 h-3 text-[#00d4ff]" />
                </div>
              </th>
              <th className="text-right px-3 py-3 font-mono-data text-[10px] text-[#3d5a80] tracking-widest font-medium hidden md:table-cell">
                <div className="flex items-center justify-end gap-1">
                  SOC <ChevronDown className="w-3 h-3 opacity-40" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {top.map((s, i) => {
              const riskPercent = Math.min((s.risk / 0.8) * 100, 100);
              
              return (
                <tr key={s.rank}
                  className={`group/row border-b border-white/[0.04] bg-transparent hover:bg-white/[0.03] transition-all duration-300 ${i === top.length - 1 ? 'border-b-0' : ''} ${i % 2 === 1 ? 'bg-white/[0.01]' : ''}`}
                  style={{ animationDelay: `${i * 100}ms` }}>
                  
                  <td className="px-3 py-3 relative pl-4">
                    {/* Left hover border */}
                    <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-transparent transition-all duration-300 group-hover/row:w-[3px]"
                      style={{ '--glow-color': TIER_COLORS[s.tier] } as React.CSSProperties} />
                    {i < 3 ? (
                      <span className="flex items-center justify-center w-5 h-5 rounded-full font-mono-data text-[10px] font-bold text-[#060a0f] shadow-lg"
                            style={{ background: RANK_COLORS[i], boxShadow: `0 0 10px ${RANK_COLORS[i]}80` }}>
                        {s.rank}
                      </span>
                    ) : (
                      <span className="font-mono-data text-[11px] font-bold text-[#3d5a80]">#{s.rank}</span>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <span className="text-[12px] font-semibold text-[#dce8ff] font-display group-hover/row:text-white transition-colors">{s.name}</span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="group-hover/row:scale-105 transition-transform origin-left">
                      <Badge urgency={s.urgency} />
                    </div>
                  </td>
                  <td className="px-3 py-3 text-right">
                    <div className="flex flex-col items-end gap-1.5">
                      <span className="font-mono-data text-[12px] font-bold"
                        style={{ color: TIER_COLORS[s.tier] }}>
                        {s.risk.toFixed(4)}
                      </span>
                      {/* Risk Bar */}
                      <div className="w-16 h-1 bg-[#1a2332] rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-1000 ease-out"
                             style={{ width: `${riskPercent}%`, backgroundColor: TIER_COLORS[s.tier] }} />
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-right hidden md:table-cell align-top">
                    <span className="font-mono-data text-[11px] text-[#5e7aa8]">{s.soc.toFixed(1)}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
