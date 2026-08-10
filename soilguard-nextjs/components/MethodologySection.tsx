const FEATURES = [
  { name: 'swir1_reflectance', label: 'SWIR-1 Reflectance',   pct: 100, note: 'Soil moisture & mineral composition — dominant predictor' },
  { name: 'swir1_nir_ratio',   label: 'SWIR-1 / NIR Ratio',   pct: 82,  note: 'Soil moisture & mineral index (B11/B08)' },
  { name: 'bsi',               label: 'Bare Soil Index (BSI)', pct: 68,  note: '(SWIR-1+Red−NIR−Blue)/(SWIR-1+Red+NIR+Blue)' },
  { name: 'swir1_red_ratio',   label: 'SWIR-1 / Red Ratio',   pct: 57,  note: 'Bare soil spectral slope indicator' },
  { name: 'nir_reflectance',   label: 'NIR Reflectance',       pct: 45,  note: 'B08 — vegetation and soil structure' },
  { name: 'bsi_ndvi_ratio',    label: 'BSI / NDVI Ratio',      pct: 38,  note: 'Soil–vegetation transition metric' },
  { name: 'red_reflectance',   label: 'Red Reflectance',       pct: 27,  note: 'B04 — soil color and iron oxides' },
  { name: 'ndvi',              label: 'NDVI',                  pct: 19,  note: '(NIR−Red)/(NIR+Red) — vegetation density' },
  { name: 'blue_reflectance',  label: 'Blue Reflectance',      pct: 11,  note: 'B02 — atmospheric baseline' },
];

const HONESTY_NOTES = [
  {
    icon: '📊',
    title: 'Model R² = 0.4481',
    body: 'The test R² reflects a moderately predictive spectral-to-soil risk mapping. This is expected for a proxy-driven model without field-collected ground truth — it should not be compared to direct SOC regression benchmarks.',
    color: '#f59e0b',
    border: 'rgba(245,158,11,0.20)',
  },
  {
    icon: '🧪',
    title: 'Target Is a Proxy',
    body: 'The target variable y = 0.50×(1−SOC_norm) + 0.50×BSI_norm is a composite proxy for soil degradation risk — not a direct measurement. SoilGrids SOC was used as a proxy grounding signal only, not as an input feature.',
    color: '#00d4ff',
    border: 'rgba(0,212,255,0.20)',
  },
  {
    icon: '🏛️',
    title: 'Grid Is Regular',
    body: 'The 5×5 zonal grid is a regular spatial overlay for administrative convenience. Sector boundaries do not follow natural landform or cadastral boundaries. Sector names reflect the dominant settlement in each grid cell.',
    color: '#818cf8',
    border: 'rgba(129,140,248,0.20)',
  },
  {
    icon: '✅',
    title: 'Zero Target Leakage',
    body: 'Raw SoilGrids SOC values are explicitly excluded from the feature matrix X. The model learns entirely from satellite spectral signals. The SOC contribution is only in the proxy target formulation, never in prediction input.',
    color: '#10b981',
    border: 'rgba(16,185,129,0.20)',
  },
];

const THRESHOLDS = [
  { label: 'Low Risk',         range: 'Risk < 0.45',      color: '#10b981', desc: 'Stable SOC. Routine monitoring + preventive INM.' },
  { label: 'Moderate Risk',    range: '0.45 ≤ Risk < 0.58', color: '#f59e0b', desc: 'Mild carbon vulnerability. INM + organic matter replenishment.' },
  { label: 'High Risk',        range: 'Risk ≥ 0.58',      color: '#ef4444', desc: 'Severe degradation. URGENT — FYM/Biochar + Lime + rotation.' },
  { label: 'NDVI Mask',        range: 'NDVI ≤ 0.30',      color: '#818cf8', desc: 'Bare soil candidate pixels. Vegetation pixels excluded from model.' },
];

export default function MethodologySection() {
  return (
    <section id="methodology" className="py-24 bg-[#0a0f1a] section-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="max-w-3xl mb-16">
          <p className="eyebrow eyebrow-violet mb-4">Scientific Credibility</p>
          <h2 className="section-title mb-5">
            Methodology &amp; <br className="hidden md:block"/>
            <span className="text-[#818cf8]"> Analytical Rigour</span>
          </h2>
          <p className="section-body max-w-xl">
            Full transparency on feature engineering, model performance, thresholds, and the scientific assumptions underlying SoilGuard-CG.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Feature importance */}
          <div className="lg:col-span-7">
            <div
              className="rounded-2xl p-7"
              style={{ background: '#0e1522', border: '1px solid rgba(255,255,255,0.09)' }}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="eyebrow mb-2">Feature Importance</p>
                  <h3 style={{ fontFamily: "'Space Grotesk', sans-serif" }} className="text-[18px] font-bold text-[#e2ecff]">
                    Random Forest Spectral Feature Ranking
                  </h3>
                </div>
                <span className="badge badge-violet">9 Features</span>
              </div>

              <div className="space-y-4">
                {FEATURES.map((f, i) => (
                  <div key={f.name}>
                    <div className="flex items-start justify-between mb-1.5 gap-3">
                      <div className="flex-1 min-w-0">
                        <span style={{ fontFamily: "'Space Grotesk', sans-serif" }} className="text-[13.5px] font-semibold text-[#e2ecff]">{f.label}</span>
                        <span className="text-[11px] text-[#4a6890] ml-2">{f.note}</span>
                      </div>
                      <span className="font-mono text-[12px] font-bold text-[#00d4ff] shrink-0">{f.pct}%</span>
                    </div>
                    <div className="progress-track">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${f.pct}%`,
                          background: i === 0
                            ? 'linear-gradient(90deg, #00d4ff, #00a8cc)'
                            : i < 4
                              ? 'linear-gradient(90deg, #818cf8, #6366f1)'
                              : 'linear-gradient(90deg, #4a6890, #3a5070)',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div
                className="mt-6 p-4 rounded-xl text-[13px] text-[#8ba3cc]"
                style={{ background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.14)' }}
              >
                <strong className="text-[#00d4ff]">SWIR-1 dominance confirmed:</strong> Short-wave infrared reflectance (B11) emerges as the most informative band for detecting soil moisture deficits and mineral composition changes associated with organic carbon depletion.
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="lg:col-span-5 space-y-5">

            {/* Thresholds */}
            <div
              className="rounded-2xl p-6"
              style={{ background: '#0e1522', border: '1px solid rgba(255,255,255,0.09)' }}
            >
              <p className="eyebrow mb-5">Classification Thresholds</p>
              <div className="space-y-3.5">
                {THRESHOLDS.map(t => (
                  <div
                    key={t.label}
                    className="flex gap-4 p-3.5 rounded-xl"
                    style={{ background: `${t.color}0d`, border: `1px solid ${t.color}26` }}
                  >
                    <div className="w-2 rounded-full shrink-0" style={{ background: t.color, minHeight: 40 }} />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[13.5px] font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: t.color }}>{t.label}</span>
                        <span className="font-mono text-[10.5px] text-[#8ba3cc]">{t.range}</span>
                      </div>
                      <p className="text-[12.5px] text-[#4a6890] leading-relaxed">{t.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Model stats mini */}
            <div
              className="rounded-2xl p-6"
              style={{ background: '#0e1522', border: '1px solid rgba(255,255,255,0.09)' }}
            >
              <p className="eyebrow mb-4">Model Architecture</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Algorithm',     value: 'Random Forest' },
                  { label: 'Trees',         value: '150 estimators' },
                  { label: 'Train split',   value: '80 / 20' },
                  { label: 'Features',      value: '9 spectral' },
                  { label: 'Test R²',       value: '0.4568' },
                  { label: 'Test RMSE',     value: '0.0929' },
                ].map(m => (
                  <div key={m.label} className="rounded-xl p-3.5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <p className="eyebrow text-[9px] mb-1.5">{m.label}</p>
                    <p className="font-mono text-[13px] font-bold text-[#e2ecff]">{m.value}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Honesty notes */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-5">
          {HONESTY_NOTES.map((n, i) => (
            <div
              key={i}
              className="rounded-2xl p-6"
              style={{
                background: `radial-gradient(ellipse 100% 60% at 0% 0%, ${n.color}0a, transparent), #0e1522`,
                border: `1px solid ${n.border}`,
              }}
            >
              <div className="flex items-start gap-4">
                <span className="text-2xl shrink-0">{n.icon}</span>
                <div>
                  <h4 className="text-[14px] font-bold mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif", color: n.color }}>{n.title}</h4>
                  <p className="text-[13px] text-[#4a6890] leading-relaxed">{n.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
