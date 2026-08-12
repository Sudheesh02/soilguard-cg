import DashboardLayout from '@/components/layout/DashboardLayout';
import Topbar from '@/components/layout/Topbar';
import { SECTORS, urgencyColor } from '@/lib/data';
import { TIER_COLORS } from '@/lib/theme';
import Badge from '@/components/ui/Badge';

export default function RecommendationsPage() {
  const critical = SECTORS.filter(s => s.tier === 1);
  const moderate = SECTORS.filter(s => s.tier === 2);
  const stable   = SECTORS.filter(s => s.tier === 3);

  return (
    <DashboardLayout>
      <Topbar title="Agronomic Recommendations" subtitle="Village-level intervention packages ranked by urgency" />
      <div className="p-6 animate-fade-in space-y-8">

        {/* Global packages reference */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { tier: 'CRITICAL', color: TIER_COLORS[1], label: 'Tier 1: Immediate Action', count: critical.length,
              actions: ['8-10 t/ha FYM / 3 t/ha Biochar', 'Agricultural Lime @ 2.5 t/ha', 'Green manuring: Dhaincha/Sunnhemp', 'INM: 75% RDF + 25% organic'] },
            { tier: 'MODERATE', color: TIER_COLORS[2], label: 'Tier 2: Seasonal Action', count: moderate.length,
              actions: ['3-5 t/ha FYM or vermicompost', 'Zero-tillage + straw mulching', 'Crop rotation with legumes', 'Balanced NPK + ZnSO4'] },
            { tier: 'STABLE',   color: TIER_COLORS[3], label: 'Tier 3: Preventive Care', count: stable.length,
              actions: ['1.5-2 t/ha compost maintenance', 'Soil test-based fertilisation', 'Crop residue incorporation', 'Biodiversity monitoring'] },
          ].map(g => (
            <div key={g.tier} className="card p-5"
              style={{ boxShadow: `0 0 20px ${g.color}15` }}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-mono-data text-[9px] tracking-widest mb-1" style={{ color: `${g.color}99` }}>STANDARD PACKAGE</p>
                  <p className="font-display font-semibold text-white text-[14px]">{g.label}</p>
                </div>
                <span className="font-mono-data text-2xl font-bold" style={{ color: g.color }}>{g.count}</span>
              </div>
              <div className="space-y-2 mt-3">
                {g.actions.map((a, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <span className="w-4 h-4 shrink-0 rounded-full flex items-center justify-center text-[8px] font-bold mt-0.5"
                      style={{ background: `${g.color}20`, color: g.color }}>{i + 1}</span>
                    <span className="text-[12px] text-[#8ba3cc] leading-relaxed">{a}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Per-sector cards: critical first */}
        {[
          { label: 'Critical Sectors: Immediate Intervention Required', sectors: critical, color: TIER_COLORS[1] },
          { label: 'Moderate Sectors: Seasonal Action Required', sectors: moderate, color: TIER_COLORS[2] },
          { label: 'Stable Sectors: Preventive Monitoring', sectors: stable, color: TIER_COLORS[3] },
        ].map(group => (
          <section key={group.label}>
            <h2 className="font-display font-bold text-white text-[16px] mb-4 flex items-center gap-3">
              <span className="w-2 h-6 rounded-sm inline-block" style={{ background: group.color }} />
              {group.label}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {group.sectors.map(s => {
                const c = urgencyColor(s.urgency);
                return (
                  <div key={s.rank} className="card p-5 hover:scale-[1.01] transition-transform duration-150"
                    style={{ boxShadow: `0 0 16px ${c.text}10` }}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <span className="font-mono-data text-[9px] tracking-widest" style={{ color: `${c.text}80` }}>RANK #{s.rank} · {s.gridId}</span>
                        <h3 className="font-display font-bold text-white text-[15px] mt-0.5">{s.name}</h3>
                      </div>
                      <Badge urgency={s.urgency} />
                    </div>
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {[
                        { label: 'RISK', val: s.risk.toFixed(3), col: c.text },
                        { label: 'SOC', val: `${s.soc.toFixed(1)} dg/kg`, col: '#8ba3cc' },
                        { label: '% HIGH', val: `${s.pct.toFixed(1)}%`, col: c.text },
                      ].map(stat => (
                        <div key={stat.label} className="rounded-lg px-2.5 py-2 bg-white/[0.03] border border-white/[0.05]">
                          <p className="font-mono-data text-[8px] text-[#3d5a80] tracking-widest">{stat.label}</p>
                          <p className="font-mono-data text-[12px] font-bold mt-0.5" style={{ color: stat.col }}>{stat.val}</p>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2">
                      {s.recommendations.map((r, i) => (
                        <div key={i} className="flex gap-2 items-start">
                          <span className="font-mono-data text-[9px] font-bold shrink-0 mt-1" style={{ color: c.text }}>{i + 1}.</span>
                          <span className="text-[11px] text-[#5e7aa8] leading-snug">{r}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}

      </div>
    </DashboardLayout>
  );
}
