const CURRENT = [
  { icon: '✅', label: 'Sentinel-2 L2A Spectral Pipeline',      note: 'Operational · Phase 2' },
  { icon: '✅', label: 'Random Forest Soil Risk Regressor',      note: 'Operational · Phase 3' },
  { icon: '✅', label: '5×5 Zonal Priority Grid Analytics',      note: 'Operational · Phase 4' },
  { icon: '✅', label: 'Sector Agronomic Recommendation Engine', note: 'Operational · Phase 4' },
  { icon: '✅', label: 'Executive Summary Report Generator',     note: 'Operational · Phase 4' },
  { icon: '✅', label: 'Ensemble Confidence Uncertainty Maps',   note: 'Operational · Phase 4' },
];

const ROADMAP = [
  {
    phase: 'v1.1',
    title: 'Multi-Temporal Monitoring',
    items: [
      'Monthly Sentinel-2 time-series ingestion via STAC API',
      'SOC depletion trend velocity mapping (Δ risk/month)',
      'Seasonal dry/wet period comparative risk analysis',
    ],
    color: '#00d4ff',
    icon: '📅',
    status: 'Planned',
  },
  {
    phase: 'v1.2',
    title: 'SAR Data Fusion',
    items: [
      'Sentinel-1 SAR C-band backscatter soil moisture proxy',
      'Optical + SAR feature fusion for all-weather coverage',
      'Monsoon-period topsoil saturation risk mapping',
    ],
    color: '#818cf8',
    icon: '📻',
    status: 'Proposed',
  },
  {
    phase: 'v2.0',
    title: 'State-Scale Deployment',
    items: [
      'Full Chhattisgarh coverage (1.36 lakh km² agricultural area)',
      'Integration with Soil Health Card scheme district APIs',
      'GIS portal with downloadable block-level risk PDFs',
    ],
    color: '#10b981',
    icon: '🚀',
    status: 'Vision',
  },
  {
    phase: 'v2.1',
    title: 'Hyperspectral Upgrade',
    items: [
      'PRISMA / DESIS hyperspectral soil mineral mapping',
      'Clay mineral composition mapping (Kaolinite, Smectite)',
      'Direct SOC% prediction at ±0.1% accuracy target',
    ],
    color: '#f59e0b',
    icon: '🔭',
    status: 'Research',
  },
];

const IMPACT = [
  {
    metric: '3.5M+',
    label: 'Farmers in Chhattisgarh',
    desc: 'Potential beneficiaries of precision soil intervention advisory at district scale.',
    color: '#00d4ff',
  },
  {
    metric: '22,702',
    label: 'Hectares Analyzed',
    desc: 'Wall-to-wall 10m risk coverage of the Raipur agricultural belt in a single run.',
    color: '#10b981',
  },
  {
    metric: '3,989',
    label: 'High-Risk Hectares',
    desc: 'Immediately actionable area requiring Tier-1 FYM/Biochar soil carbon intervention.',
    color: '#ef4444',
  },
  {
    metric: '41 sec',
    label: 'Full Pipeline Runtime',
    desc: 'From raw satellite data to executive report — fully offline, no cloud dependency.',
    color: '#818cf8',
  },
];

export default function RoadmapSection() {
  return (
    <section id="roadmap" className="py-24 bg-[#0a0f1a] section-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="max-w-3xl mb-16">
          <p className="eyebrow eyebrow-cyan mb-4">Impact & Development Roadmap</p>
          <h2 className="section-title mb-5">
            From Pilot to<br className="hidden md:block"/>
            <span className="text-[#00d4ff]"> State-Scale Intelligence</span>
          </h2>
          <p className="section-body max-w-xl">
            SoilGuard-CG v1.0 demonstrates technical feasibility for satellite-driven soil risk mapping at district scale. The roadmap targets full Chhattisgarh coverage and integration with national agricultural monitoring programmes.
          </p>
        </div>

        {/* Impact metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {IMPACT.map((m, i) => (
            <div
              key={i}
              className="rounded-2xl p-6 text-center transition-all duration-300 hover:-translate-y-1"
              style={{
                background: `radial-gradient(ellipse at 50% -10%, ${m.color}0e, transparent), #0e1522`,
                border: `1px solid ${m.color}28`,
              }}
            >
              <div
                className="stat-num text-[clamp(1.8rem,4vw,2.8rem)] font-extrabold mb-2"
                style={{ color: m.color, textShadow: `0 0 24px ${m.color}44` }}
              >
                {m.metric}
              </div>
              <p style={{ fontFamily: "'Space Grotesk', sans-serif" }} className="text-[13.5px] font-bold text-[#e2ecff] mb-2">{m.label}</p>
              <p className="text-[12px] text-[#4a6890] leading-relaxed">{m.desc}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Current capabilities */}
          <div className="lg:col-span-5">
            <div
              className="rounded-2xl p-7 h-full"
              style={{ background: '#0e1522', border: '1px solid rgba(255,255,255,0.09)' }}
            >
              <div className="flex items-center gap-2.5 mb-6">
                <span className="live-dot" />
                <p className="eyebrow eyebrow-emerald">v1.0 — Operational Now</p>
              </div>
              <h3 style={{ fontFamily: "'Space Grotesk', sans-serif" }} className="text-[18px] font-bold text-[#e2ecff] mb-6">Current Capabilities</h3>
              <div className="space-y-3.5">
                {CURRENT.map((c, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-[15px] shrink-0 mt-0.5">{c.icon}</span>
                    <div>
                      <span className="text-[13.5px] text-[#e2ecff] font-medium">{c.label}</span>
                      <span className="text-[11px] text-[#4a6890] font-mono ml-2">{c.note}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Roadmap */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {ROADMAP.map((r, i) => (
              <div
                key={i}
                className="rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1"
                style={{
                  background: `radial-gradient(ellipse 120% 60% at 0% 0%, ${r.color}0a, transparent), #0e1522`,
                  border: `1px solid ${r.color}22`,
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{r.icon}</span>
                    <span className="font-mono text-[11px] font-bold" style={{ color: r.color }}>{r.phase}</span>
                  </div>
                  <span
                    className="font-mono text-[9.5px] font-semibold px-2.5 py-1 rounded-lg"
                    style={{
                      background: `${r.color}12`,
                      border: `1px solid ${r.color}28`,
                      color: r.color,
                    }}
                  >
                    {r.status}
                  </span>
                </div>
                <h4 style={{ fontFamily: "'Space Grotesk', sans-serif" }} className="text-[15px] font-bold text-[#e2ecff] mb-3">
                  {r.title}
                </h4>
                <ul className="space-y-2">
                  {r.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-2">
                      <span className="text-[10px] mt-1.5 shrink-0" style={{ color: r.color }}>▹</span>
                      <span className="text-[12.5px] text-[#4a6890] leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
