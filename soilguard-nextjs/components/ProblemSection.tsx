const STATS = [
  {
    value: '52%',
    label: 'CARBON DEFICIENT',
    title: 'SOC Below Critical Threshold',
    body: 'Over half the Chhattisgarh plains have soil organic carbon < 0.5%, causing severe structural aggregate breakdown and topsoil baking during dry post-harvest periods.',
    color: '#ef4444',
    border: 'rgba(239,68,68,0.20)',
    glow: 'rgba(239,68,68,0.07)',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 2L18 16H2L10 2Z" stroke="#ef4444" strokeWidth="1.5" fill="rgba(239,68,68,0.12)"/>
        <path d="M10 8v4M10 14h.01" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    value: '77%',
    label: 'NITROGEN DEPLETED',
    title: 'Near-Zero Available Nitrogen',
    body: 'Soil Health Card assays reveal near-zero available nitrogen in ~77% of sample grids across Raipur and Durg, forcing chemical over-application and groundwater vulnerability.',
    color: '#f59e0b',
    border: 'rgba(245,158,11,0.20)',
    glow: 'rgba(245,158,11,0.06)',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 18C14.42 18 18 14.42 18 10S14.42 2 10 2 2 5.58 2 10s3.58 8 8 8Z" stroke="#f59e0b" strokeWidth="1.5" fill="rgba(245,158,11,0.10)"/>
        <path d="M7 10h6M10 7v6" stroke="#f59e0b" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    value: '1/10ha',
    label: 'SAMPLING RESOLUTION',
    title: 'Coarse Physical Soil Cards',
    body: 'Traditional Soil Health Cards sample 1 point per 10 hectares once every 3 years — completely missing intra-field spatial variability at dry-season scale. Satellite data fills this gap at 10m.',
    color: '#00d4ff',
    border: 'rgba(0,212,255,0.20)',
    glow: 'rgba(0,212,255,0.06)',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="3" y="3" width="14" height="14" rx="2" stroke="#00d4ff" strokeWidth="1.5" fill="rgba(0,212,255,0.10)"/>
        <path d="M10 3v14M3 10h14" stroke="#00d4ff" strokeWidth="1" strokeDasharray="2 2"/>
        <circle cx="10" cy="10" r="2" fill="#00d4ff"/>
      </svg>
    ),
  },
];

const SOLUTION_BADGES = [
  { text: 'Sentinel-2 BOA 10m', color: 'badge-cyan' },
  { text: 'Random Forest ML', color: 'badge-violet' },
  { text: '100% Offline', color: 'badge-emerald' },
  { text: 'No Field Surveys', color: 'badge-amber' },
];

export default function ProblemSection() {
  return (
    <section id="problem" className="py-24 bg-[#0a0f1a] section-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="max-w-3xl mb-16">
          <p className="eyebrow eyebrow-cyan mb-4">The Agronomic Emergency</p>
          <h2 className="section-title mb-5">
            The Chhattisgarh Topsoil<br className="hidden md:block" />
            <span className="text-[#ef4444]"> Degradation Crisis</span>
          </h2>
          <p className="section-body max-w-xl">
            The Raipur–Durg agricultural plain supports over 3.5 million smallholder farmers. Accelerating soil organic carbon depletion, unchecked topsoil erosion, and nutrient exhaustion threaten food security at scale — yet existing monitoring is too coarse and too infrequent to act on.
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-14">
          {STATS.map((s, i) => (
            <div
              key={i}
              className="rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1 group"
              style={{
                background: `radial-gradient(ellipse 120% 70% at 50% -15%, ${s.glow}, transparent), #0e1522`,
                border: `1px solid ${s.border}`,
                boxShadow: `0 4px 24px rgba(0,0,0,0.3)`,
              }}
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: s.glow, border: `1px solid ${s.border}` }}>
                  {s.icon}
                </div>
                <span className="eyebrow">{s.label}</span>
              </div>

              <div
                className="font-extrabold mb-4 stat-num"
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 'clamp(3rem,8vw,4.5rem)',
                  color: s.color,
                  textShadow: `0 0 40px ${s.glow.replace('0.07','0.5').replace('0.06','0.4')}`,
                  lineHeight: 1,
                }}
              >
                {s.value}
              </div>

              <h3 style={{ fontFamily: "'Space Grotesk', sans-serif" }} className="text-[17px] font-bold text-[#e2ecff] mb-2.5">
                {s.title}
              </h3>
              <p className="text-[13.5px] text-[#4a6890] leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>

        {/* Solution bridge */}
        <div
          className="rounded-2xl p-8 flex flex-col lg:flex-row gap-8 items-center"
          style={{
            background: 'radial-gradient(ellipse 100% 80% at 50% -10%, rgba(0,212,255,0.06), transparent), #0e1522',
            border: '1px solid rgba(0,212,255,0.16)',
          }}
        >
          <div className="flex-1">
            <p className="eyebrow eyebrow-cyan mb-3">The SoilGuard-CG Answer</p>
            <h3 style={{ fontFamily: "'Space Grotesk', sans-serif" }} className="text-[1.4rem] font-bold text-[#e2ecff] mb-3 leading-tight">
              Continuous 10m Satellite Monitoring — No Field Teams Required
            </h3>
            <p className="text-[14px] text-[#4a6890] leading-relaxed max-w-2xl">
              By combining Sentinel-2 L2A surface reflectance with a trained Random Forest regressor, SoilGuard-CG produces wall-to-wall soil health risk maps at 10-meter resolution across an entire 22km × 22km district block — from a single terminal command, fully offline, in ~41 seconds.
            </p>
          </div>

          <div className="shrink-0 flex flex-wrap gap-2 lg:flex-col">
            {SOLUTION_BADGES.map(b => (
              <span key={b.text} className={`badge ${b.color} text-[11px]`}>{b.text}</span>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
