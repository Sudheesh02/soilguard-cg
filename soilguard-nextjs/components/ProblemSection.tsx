'use client';
import { useEffect, useState, useRef } from 'react';
import StatCard from '@/components/StatCard';

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
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const [counts, setCounts] = useState(STATS.map(() => 0));

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;
    const duration = 2000;
    const steps = 60;
    const stepTime = duration / steps;
    let currentStep = 0;
    
    const timer = setInterval(() => {
      currentStep++;
      setCounts(STATS.map(s => {
        const val = parseFloat(s.value);
        if(isNaN(val)) return 0; // Handle '1/10ha' manually
        return Math.min((val / steps) * currentStep, val);
      }));
      if (currentStep >= steps) clearInterval(timer);
    }, stepTime);
    return () => clearInterval(timer);
  }, [isVisible]);

  return (
    <section id="problem" ref={sectionRef} className="py-16 bg-[#0a0f1a] section-border overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[rgba(239,68,68,0.03)] rounded-full blur-[100px] pointer-events-none" />

        {/* Header */}
        <div className="max-w-3xl mb-10 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[rgba(0,212,255,0.05)] border border-[rgba(0,212,255,0.15)] mb-4">
            <span className="w-2 h-2 rounded-full bg-[#00d4ff] animate-pulse" />
            <p className="eyebrow eyebrow-cyan mb-0">The Agronomic Emergency</p>
          </div>
          <h2 className="section-title mb-4 whitespace-nowrap text-[clamp(1.5rem,3.5vw,2.5rem)]">
            The Chhattisgarh Topsoil <span className="text-[#ef4444] relative inline-block">
               Degradation Crisis
               <svg className="absolute w-full h-3 -bottom-2 left-0 text-[#ef4444] opacity-50" viewBox="0 0 100 10" preserveAspectRatio="none">
                 <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="2" fill="none"/>
               </svg>
            </span>
          </h2>
          <p className="section-body max-w-2xl text-[1.05rem] text-balance">
            The Raipur-Durg agricultural plain supports over 3.5 million smallholder farmers. Accelerating soil organic carbon depletion, unchecked topsoil erosion, and nutrient exhaustion threaten food security at scale, yet existing monitoring is too coarse and too infrequent to act on.
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {STATS.map((s, i) => {
            const isCounter = !isNaN(parseFloat(s.value));
            const displayValue = isVisible && isCounter ? Math.floor(counts[i]) + (s.value.includes('%') ? '%' : '') : (isVisible ? s.value : '0');
            
            return (
              <StatCard
                key={i}
                hover
                className="p-8 group transition-all duration-500 ease-out hover:scale-[1.02] hover:-translate-y-2 bg-[#0e1522] animated-border"
                background={`radial-gradient(ellipse 120% 70% at 50% -15%, ${s.glow}, transparent)`}
                border={`1px solid ${s.border}`}
                shadow="0 10px 40px rgba(0,0,0,0.4)"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-lg" style={{ background: s.glow, border: `1px solid ${s.border}` }}>
                    {s.icon}
                  </div>
                  <span className="eyebrow text-[11px] font-bold">{s.label}</span>
                </div>

                <div
                  className="font-extrabold mb-5 stat-num tracking-tighter"
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: 'clamp(3.5rem,8vw,5rem)',
                    color: s.color,
                    textShadow: `0 0 50px ${s.glow.replace('0.07','0.6').replace('0.06','0.6')}`,
                    lineHeight: 1,
                  }}
                >
                  {displayValue}
                </div>

                <h3 style={{ fontFamily: "'Space Grotesk', sans-serif" }} className="text-[18px] font-bold text-[#e2ecff] mb-3 group-hover:text-white transition-colors">
                  {s.title}
                </h3>
                <p className="text-[14px] text-[#4a6890] leading-relaxed group-hover:text-[#8ba3cc] transition-colors">{s.body}</p>
              </StatCard>
            );
          })}
        </div>

        {/* Solution bridge */}
        <StatCard
          className="p-8 flex flex-col lg:flex-row gap-8 items-center relative overflow-hidden"
          background="radial-gradient(ellipse 100% 80% at 50% -10%, rgba(0,212,255,0.08), transparent), #0e1522"
          border="1px solid rgba(0,212,255,0.2)"
        >
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-[#00d4ff] opacity-[0.03] rounded-full blur-3xl pointer-events-none" />
          <div className="flex-1 relative z-10">
            <p className="eyebrow eyebrow-cyan mb-2 flex items-center gap-2">
              <span className="w-4 h-[1px] bg-[#00d4ff]"></span>
              The SoilGuard-CG Answer
            </p>
            <h3 style={{ fontFamily: "'Space Grotesk', sans-serif" }} className="text-[1.5rem] font-bold text-[#e2ecff] mb-3 leading-tight text-balance">
              Continuous 10m Satellite Monitoring (No Field Teams Required)
            </h3>
            <p className="text-[15px] text-[#4a6890] leading-relaxed max-w-2xl text-balance">
              By combining Sentinel-2 L2A surface reflectance with a trained Random Forest regressor, SoilGuard-CG produces wall-to-wall soil health risk maps at 10-meter resolution across an entire 22km × 22km district block: from a single terminal command, fully offline, in ~41 seconds.
            </p>
          </div>

          <div className="shrink-0 flex flex-wrap gap-3 lg:flex-col relative z-10">
            {SOLUTION_BADGES.map(b => (
              <span key={b.text} className={`badge ${b.color} text-[12px] px-3 py-1.5 shadow-lg`}>{b.text}</span>
            ))}
          </div>
        </StatCard>

      </div>
    </section>
  );
}
