const STAGES = [
  {
    num: '01',
    phase: 'PHASE 1',
    label: 'DATA INGEST',
    title: 'Sentinel-2 L2A COG',
    desc: 'Windowed read of B02 (Blue), B04 (Red), B08 (NIR), B11 (SWIR-1) from Earth-Search Cloud-Optimized GeoTIFF. 2086 × 2223 pixel stack cached offline at EPSG:32644.',
    color: '#00d4ff',
    icon: '📡',
    inputs: ['B02 Blue', 'B04 Red', 'B08 NIR', 'B11 SWIR-1'],
    output: 'Sentinel-2 Stack',
  },
  {
    num: '02',
    phase: 'PHASE 2',
    label: 'SPECTRAL INDICES',
    title: 'BSI + NDVI Masking',
    desc: 'Computes Bare Soil Index (BSI) and NDVI. Applies NDVI ≤ 0.30 bare soil candidate mask. Identifies 2,270,247 bare soil pixels (48.96% of AOI).',
    color: '#10b981',
    icon: '🔬',
    inputs: ['BSI formula', 'NDVI ≤ 0.30', 'Bare mask'],
    output: 'Spectral Features',
  },
  {
    num: '03',
    phase: 'PHASE 3',
    label: 'ML TRAINING',
    title: 'Random Forest Model',
    desc: '150-tree Random Forest Regressor trained on 9 spectral features. Target proxy: y = 0.50×(1−SOC) + 0.50×BSI. Raw SOC excluded from X to prevent leakage.',
    color: '#818cf8',
    icon: '🤖',
    inputs: ['9 spectral features', '150 RF trees', 'y proxy'],
    output: 'R² = 0.4481',
  },
  {
    num: '04',
    phase: 'PHASE 3',
    label: 'RISK MAPPING',
    title: '10m Risk Score Map',
    desc: 'Reconstructs 2D risk score array from bare-soil pixel predictions. Fills masked pixels (vegetation/water). Outputs ensemble prediction uncertainty map.',
    color: '#ef4444',
    icon: '🗺️',
    inputs: ['Risk scores', 'Uncertainty', 'Confidence'],
    output: 'Risk Score Map',
  },
  {
    num: '05',
    phase: 'PHASE 4',
    label: 'ZONAL ANALYTICS',
    title: '5×5 Sector Grid',
    desc: 'Regular 5×5 spatial grid overlay partitions AOI into 25 sectors. Each sector is ranked by mean risk score, high-risk area, and bare soil exposure.',
    color: '#f59e0b',
    icon: '📊',
    inputs: ['25 sectors', 'Mean risk', 'Area stats'],
    output: 'Priority Ranking',
  },
  {
    num: '06',
    phase: 'PHASE 4',
    label: 'ADVISORY',
    title: 'Agronomic Package',
    desc: 'Generates sector-specific intervention packages: FYM application rates, Biochar dosing, Lime correction, zero-tillage protocols, and crop rotation strategies.',
    color: '#10b981',
    icon: '🌱',
    inputs: ['Risk tier', 'SOC level', 'pH data'],
    output: 'Action Package',
  },
];

export default function PipelineSection() {
  return (
    <section id="pipeline" className="py-24 bg-[#06090f] section-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="max-w-3xl mb-16">
          <p className="eyebrow eyebrow-emerald mb-4">System Architecture</p>
          <h2 className="section-title mb-5">
            6-Stage Geospatial<br className="hidden md:block"/>
            <span className="text-[#10b981]"> Processing Pipeline</span>
          </h2>
          <p className="section-body max-w-xl">
            Automated end-to-end telemetry pipeline converting Sentinel-2 Cloud-Optimized GeoTIFFs into actionable, sector-level agronomic advisories — all within a single terminal environment.
          </p>
        </div>

        {/* Pipeline grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          {STAGES.map((s, i) => (
            <div
              key={i}
              className="rounded-2xl p-6 group transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
              style={{
                background: `radial-gradient(ellipse 120% 60% at 50% -10%, ${s.color}0d, transparent), #0e1522`,
                border: `1px solid ${s.color}2e`,
                boxShadow: `0 4px 24px rgba(0,0,0,0.25)`,
              }}
            >
              {/* Corner phase tag */}
              <span className="absolute top-4 right-4 eyebrow text-[9px]" style={{ color: `${s.color}99` }}>{s.phase}</span>

              {/* Icon + step */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                  style={{ background: `${s.color}14`, border: `1px solid ${s.color}30` }}
                >
                  {s.icon}
                </div>
                <div>
                  <span
                    className="font-mono text-[22px] font-bold block leading-none"
                    style={{ color: s.color, textShadow: `0 0 16px ${s.color}66` }}
                  >
                    {s.num}
                  </span>
                  <span className="eyebrow text-[9px]">{s.label}</span>
                </div>
              </div>

              <h3 style={{ fontFamily: "'Space Grotesk', sans-serif" }} className="text-[16px] font-bold text-[#e2ecff] mb-2.5">
                {s.title}
              </h3>
              <p className="text-[13px] text-[#4a6890] leading-relaxed mb-4">{s.desc}</p>

              {/* Inputs → Output */}
              <div className="flex items-start gap-3 text-[11.5px]">
                <div className="flex flex-wrap gap-1">
                  {s.inputs.map(inp => (
                    <span key={inp} className="font-mono px-2 py-0.5 rounded bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] text-[#8ba3cc]">{inp}</span>
                  ))}
                </div>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0 mt-0.5">
                  <path d="M2 7h10M8 3l4 4-4 4" stroke={s.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="font-mono font-bold whitespace-nowrap" style={{ color: s.color }}>{s.output}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Leakage prevention callout */}
        <div
          className="rounded-2xl p-7 flex flex-col md:flex-row gap-6 items-start md:items-center"
          style={{
            background: 'radial-gradient(ellipse 100% 80% at 50% -10%, rgba(0,212,255,0.06), transparent), #0e1522',
            border: '1px solid rgba(0,212,255,0.20)',
          }}
        >
          <div className="flex-1">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-2 h-2 rounded-full bg-[#00d4ff] flex-shrink-0" style={{ boxShadow: '0 0 8px rgba(0,212,255,0.8)' }} />
              <p className="eyebrow eyebrow-cyan">Scientific Integrity — Target Leakage Prevention</p>
            </div>
            <p className="text-[14px] text-[#8ba3cc] leading-relaxed">
              To ensure genuine satellite spectral learning, <strong className="text-[#e2ecff]">raw SoilGrids SOC values are 100% excluded from the feature matrix X</strong>. SOC is used only in the target proxy formulation and never seen by the model during inference.
            </p>
          </div>
          <div
            className="shrink-0 font-mono text-[12.5px] text-[#10b981] px-5 py-3 rounded-xl whitespace-nowrap"
            style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.22)' }}
          >
            y = 0.50×(1−SOC_norm) + 0.50×BSI_norm
          </div>
        </div>

      </div>
    </section>
  );
}
