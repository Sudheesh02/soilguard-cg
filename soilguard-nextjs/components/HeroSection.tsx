'use client';

interface LightboxData { src: string; caption: string; tag: string; }
interface Props { onOpenLightbox: (d: LightboxData) => void; }

const KPI = [
  {
    value: '22,702', unit: 'ha',   label: 'Agricultural Soil Area Mapped',
    color: 'text-[#00d4ff]', glow: 'rgba(0,212,255,0.22)',
    border: 'rgba(0,212,255,0.18)', bg: 'rgba(0,212,255,0.05)',
    icon: '🗺️',
  },
  {
    value: '41.03',  unit: 'sec',  label: 'Full Offline Pipeline Runtime',
    color: 'text-[#818cf8]', glow: 'rgba(129,140,248,0.22)',
    border: 'rgba(129,140,248,0.18)', bg: 'rgba(129,140,248,0.05)',
    icon: '⚡',
  },
  {
    value: '17.6',   unit: '%',    label: 'High SOC Deficiency Area',
    color: 'text-[#ef4444]', glow: 'rgba(239,68,68,0.22)',
    border: 'rgba(239,68,68,0.18)', bg: 'rgba(239,68,68,0.05)',
    icon: '⚠️',
  },
  {
    value: '0.4481', unit: 'R²',   label: 'SOC Model Test Accuracy',
    color: 'text-[#10b981]', glow: 'rgba(16,185,129,0.22)',
    border: 'rgba(16,185,129,0.18)', bg: 'rgba(16,185,129,0.05)',
    icon: '🤖',
  },
];

export default function HeroSection({ onOpenLightbox }: Props) {
  const scrollTo = (id: string) =>
    document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section id="overview" className="relative overflow-hidden bg-[#06090f] min-h-screen flex flex-col justify-center pt-[60px]">

      {/* Gradient mesh background */}
      <div className="hero-mesh" />

      {/* Dot grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-60"
        style={{ backgroundImage: 'radial-gradient(rgba(0,212,255,0.055) 1px, transparent 1px)', backgroundSize: '30px 30px' }}
      />

      {/* Ambient orbs */}
      <div className="pointer-events-none absolute -left-48 top-1/4 w-[500px] h-[500px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(0,212,255,0.05), transparent 70%)', filter: 'blur(40px)' }} />
      <div className="pointer-events-none absolute -right-48 bottom-1/4 w-[400px] h-[400px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.05), transparent 70%)', filter: 'blur(40px)' }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">

        {/* Top header row */}
        <div className="flex flex-wrap items-center gap-3 mb-10">
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-[rgba(245,158,11,0.08)] border border-[rgba(245,158,11,0.22)]">
            <span className="text-[#f59e0b] text-[11px] font-mono font-bold tracking-wider">NATIONAL SPACE DAY IDEATHON 2026</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.09)]">
            <span className="text-[11px] text-[#8ba3cc] font-mono">COSINE NIT Raipur × NRSC / ISRO</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[rgba(16,185,129,0.07)] border border-[rgba(16,185,129,0.18)]">
            <span className="live-dot" />
            <span className="text-[10.5px] text-[#10b981] font-mono font-semibold tracking-wide">SENTINEL-2 L2A</span>
          </div>
        </div>

        {/* Two-col layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-16">

          {/* Left: Text */}
          <div className="lg:col-span-6">
            <div className="eyebrow eyebrow-cyan mb-4">Chhattisgarh Soil Carbon Sentinel</div>

            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif" }} className="text-[clamp(3rem,7vw,5rem)] font-extrabold text-[#e2ecff] leading-[1.05] tracking-tight mb-5">
              Soil<span className="text-[#00d4ff]" style={{ textShadow: '0 0 40px rgba(0,212,255,0.35)' }}>Guard</span>
              <span className="text-[#10b981]">-SOC</span>
            </h1>

            <p style={{ fontFamily: "'Space Grotesk', sans-serif" }} className="text-[clamp(1rem,2.5vw,1.25rem)] font-semibold text-[#8ba3cc] mb-5 leading-snug">
              High-Resolution Soil Organic Carbon (SOC) Deficiency Mapping<br className="hidden sm:block"/>
              for the Chhattisgarh Rice Belt
            </p>

            <p className="text-[15px] text-[#4a6890] leading-relaxed max-w-lg mb-7">
              A satellite-driven geospatial ML platform converting Sentinel-2 imagery into 10m-resolution Soil Organic Carbon deficiency maps, 5×5 zonal carbon priority rankings, and concrete regenerative intervention packages (FYM dosage, green manuring, residue retention, zero-till).
            </p>

            <div className="flex flex-wrap gap-2 mb-8">
              {[
                { text: 'SOC Deficiency Target', color: 'badge-emerald' },
                { text: '22,702 ha Mapped', color: 'badge-cyan' },
                { text: 'Raipur–Durg Rice Plains', color: 'badge-amber' },
                { text: '10m Sentinel-2 Resolution', color: 'badge-violet' },
              ].map(b => (
                <span key={b.text} className={`badge ${b.color}`}>{b.text}</span>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => scrollTo('#results')}
                className="btn-primary"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 1.5C4.41 1.5 1.5 4.41 1.5 8S4.41 14.5 8 14.5 14.5 11.59 14.5 8 11.59 1.5 8 1.5Z" stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M5 8h6M8 5v6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
                Explore Spatial Results
              </button>
              <button
                onClick={() => scrollTo('#rankings')}
                className="btn-ghost"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2 12h12M2 8h9M2 4h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
                Priority Rankings
              </button>
            </div>
          </div>

          {/* Right: Primary Map */}
          <div className="lg:col-span-6">
            <div
              className="map-card group"
              onClick={() => onOpenLightbox({
                src: '/assets/images/risk_score_map.png',
                caption: 'Soil Health Risk Score Map — Raipur AOI (10m Spatial Resolution, Sentinel-2 L2A)',
                tag: 'EPSG:32644 · UTM Zone 44N',
              })}
              role="button"
              tabIndex={0}
              aria-label="View full resolution risk map"
            >
              <img
                src="/assets/images/risk_score_map.png"
                alt="Soil Health Risk Score Map — Raipur AOI"
                className="aspect-[4/3] object-cover"
              />
              <div className="map-overlay" />

              {/* Top badges */}
              <div className="absolute top-4 left-4 flex items-center gap-1.5 glass px-3 py-1.5">
                <span className="live-dot" />
                <span className="font-mono text-[10px] text-[#10b981] font-semibold">SENTINEL-2 L2A</span>
              </div>
              <span className="absolute top-4 right-4 badge badge-cyan">EPSG:32644</span>

              {/* Bottom overlay */}
              <div className="absolute bottom-4 left-4 right-4">
                <div className="glass px-4 py-3">
                  <p className="eyebrow mb-1">Primary Risk Intelligence Layer</p>
                  <p style={{ fontFamily: "'Space Grotesk', sans-serif" }} className="text-[13.5px] font-bold text-[#e2ecff]">
                    10m Soil Health Risk Score Map · Raipur Agricultural Belt
                  </p>
                </div>
              </div>

              {/* Expand hint */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="glass px-4 py-2 flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M1 1h4M1 1v4M13 13h-4M13 13v-4M1 13h4M1 13v-4M13 1h-4M13 1v4" stroke="#00d4ff" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <span className="text-[11px] font-mono text-[#00d4ff] font-semibold">CLICK TO EXPAND</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-8 border-t border-[rgba(255,255,255,0.06)]">
          {KPI.map((k, i) => (
            <div
              key={i}
              className="rounded-2xl p-5 transition-all duration-300 hover:-translate-y-0.5"
              style={{
                background: `radial-gradient(ellipse 100% 70% at 50% -10%, ${k.bg}, transparent), #0e1522`,
                border: `1px solid ${k.border}`,
                boxShadow: `0 4px 20px rgba(0,0,0,0.25), 0 0 20px ${k.bg}`,
              }}
            >
              <div className="text-xl mb-3">{k.icon}</div>
              <p className="eyebrow mb-2 text-[9.5px]">{k.label}</p>
              <div className="flex items-baseline gap-1.5">
                <span
                  className={`stat-num text-[2.1rem] font-extrabold ${k.color}`}
                  style={{ textShadow: `0 0 24px ${k.glow}` }}
                >
                  {k.value}
                </span>
                <span className="text-[10px] text-[#4a6890] font-mono uppercase tracking-widest">{k.unit}</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
