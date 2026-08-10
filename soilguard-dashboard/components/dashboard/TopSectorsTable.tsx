import { SECTORS } from '@/lib/data';
import Badge from '@/components/ui/Badge';

export default function TopSectorsTable() {
  const top = SECTORS.slice(0, 8);
  return (
    <div className="card p-5 h-full">
      <div className="mb-4">
        <h3 className="font-display font-semibold text-white text-[15px]">Priority Sectors</h3>
        <p className="text-[11px] text-[#4a6890] mt-0.5">Top 8 sectors ranked by SOC deficiency risk</p>
      </div>
      <div className="overflow-hidden rounded-xl border border-white/[0.06]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06] bg-white/[0.02]">
              <th className="text-left px-3 py-2.5 font-mono-data text-[10px] text-[#3d5a80] tracking-widest font-medium">#</th>
              <th className="text-left px-3 py-2.5 font-mono-data text-[10px] text-[#3d5a80] tracking-widest font-medium">SECTOR</th>
              <th className="text-left px-3 py-2.5 font-mono-data text-[10px] text-[#3d5a80] tracking-widest font-medium">URGENCY</th>
              <th className="text-right px-3 py-2.5 font-mono-data text-[10px] text-[#3d5a80] tracking-widest font-medium">RISK</th>
              <th className="text-right px-3 py-2.5 font-mono-data text-[10px] text-[#3d5a80] tracking-widest font-medium hidden md:table-cell">SOC</th>
            </tr>
          </thead>
          <tbody>
            {top.map((s, i) => (
              <tr key={s.rank}
                className={`border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors ${i === top.length - 1 ? 'border-b-0' : ''}`}>
                <td className="px-3 py-2.5">
                  <span className="font-mono-data text-[11px] font-bold text-[#3d5a80]">#{s.rank}</span>
                </td>
                <td className="px-3 py-2.5">
                  <span className="text-[12px] font-semibold text-[#dce8ff] font-display">{s.name}</span>
                </td>
                <td className="px-3 py-2.5">
                  <Badge urgency={s.urgency} />
                </td>
                <td className="px-3 py-2.5 text-right">
                  <span className="font-mono-data text-[12px] font-bold"
                    style={{ color: s.tier === 1 ? '#ef4444' : s.tier === 2 ? '#f59e0b' : '#10b981' }}>
                    {s.risk.toFixed(4)}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-right hidden md:table-cell">
                  <span className="font-mono-data text-[11px] text-[#5e7aa8]">{s.soc.toFixed(1)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
