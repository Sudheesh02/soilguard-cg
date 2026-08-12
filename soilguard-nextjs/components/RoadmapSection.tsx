'use client';
import { useEffect, useRef, useState } from 'react';
import StatCard from '@/components/StatCard';
import { METRICS } from '@/lib/site-data';

const fmtHa = (v: number) => v.toLocaleString('en-IN', { maximumFractionDigits: 0 });

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
    metric: fmtHa(METRICS.bareSoilHa),
    label: 'Hectares Analyzed',
    desc: 'Wall-to-wall 10m risk coverage of the Raipur agricultural belt in a single run.',
    color: '#10b981',
  },
  {
    metric: fmtHa(METRICS.highRiskHa),
    label: 'High-Risk Hectares',
    desc: 'Immediately actionable area requiring Tier-1 FYM/Biochar soil carbon intervention.',
    color: '#ef4444',
  },
  {
    metric: `${Math.round(METRICS.runtimeSec)} sec`,
    label: 'Full Pipeline Runtime',
    desc: 'From raw satellite data to executive report: fully offline, no cloud dependency.',
    color: '#818cf8',
  },
];

export default function RoadmapSection() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate progress based on how far the container has scrolled through the viewport
      const totalDist = rect.height + windowHeight;
      const traveled = windowHeight - rect.top;
      const progress = Math.max(0, Math.min(100, (traveled / totalDist) * 100 * 1.5)); // 1.5 multiplier to finish early
      setScrollProgress(progress);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // init
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section id="roadmap" className="py-16 bg-[#0a0f1a] section-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="max-w-3xl mb-16 relative">
          <div className="absolute -left-10 top-0 w-[500px] h-[300px] bg-[#00d4ff] opacity-[0.02] rounded-full blur-[100px] pointer-events-none" />
          <p className="eyebrow eyebrow-cyan mb-4">Impact & Development Roadmap</p>
          <h2 className="section-title mb-5">
            From Pilot to<br className="hidden md:block"/>
            <span className="text-[#00d4ff]"> State-Scale Intelligence</span>
          </h2>
          <p className="section-body max-w-xl text-balance">
            SoilGuard-CG v1.0 demonstrates technical feasibility for satellite-driven soil risk mapping at district scale. The roadmap targets full Chhattisgarh coverage and integration with national agricultural monitoring programmes.
          </p>
        </div>

        {/* Impact metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {IMPACT.map((m, i) => (
            <StatCard
              key={i}
              hover
              className="p-6 text-center"
              background={`radial-gradient(ellipse at 50% -10%, ${m.color}0e, transparent), #0e1522`}
              border={`1px solid ${m.color}28`}
            >
              <div
                className="stat-num text-[clamp(1.8rem,4vw,2.8rem)] font-extrabold mb-2"
                style={{ color: m.color, textShadow: `0 0 24px ${m.color}44` }}
              >
                {m.metric}
              </div>
              <p style={{ fontFamily: "'Space Grotesk', sans-serif" }} className="text-[13.5px] font-bold text-[#e2ecff] mb-2">{m.label}</p>
              <p className="text-[12px] text-[#4a6890] leading-relaxed">{m.desc}</p>
            </StatCard>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" ref={containerRef}>
          {/* Current capabilities */}
          <div className="lg:col-span-5 relative">
            <StatCard className="p-7 h-full relative z-10" background="#0e1522" border="1px solid rgba(255,255,255,0.09)">
              <div className="flex items-center gap-2.5 mb-6">
                <span className="live-dot" />
                <p className="eyebrow eyebrow-emerald">v1.0 — Operational Now</p>
              </div>
              <h3 style={{ fontFamily: "'Space Grotesk', sans-serif" }} className="text-[18px] font-bold text-[#e2ecff] mb-6">Current Capabilities</h3>
              <div className="space-y-3.5 relative">
                {/* Timeline line for current */}
                <div className="absolute left-2.5 top-2 bottom-4 w-px bg-[rgba(16,185,129,0.3)] -z-10" />
                
                {CURRENT.map((c, i) => (
                  <div key={i} className="flex items-start gap-3 bg-[rgba(6,9,15,0.5)] p-2 rounded-lg border border-[rgba(255,255,255,0.02)]">
                    <span className="text-[15px] shrink-0 mt-0.5 bg-[#10b981] w-5 h-5 flex items-center justify-center rounded-full shadow-[0_0_10px_rgba(16,185,129,0.4)]">
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </span>
                    <div>
                      <span className="text-[13.5px] text-[#e2ecff] font-medium">{c.label}</span>
                      <span className="text-[11px] text-[#4a6890] font-mono ml-2">{c.note}</span>
                    </div>
                  </div>
                ))}
              </div>
            </StatCard>
          </div>

          {/* Roadmap */}
          <div className="lg:col-span-7 relative">
            {/* Main connecting timeline line */}
            <div className="absolute left-[24px] sm:left-1/2 sm:-translate-x-1/2 top-4 bottom-4 w-1 bg-[rgba(255,255,255,0.03)] hidden sm:block rounded-full" />
            <div 
              className="absolute left-[24px] sm:left-1/2 sm:-translate-x-1/2 top-4 w-1 bg-gradient-to-b from-[#00d4ff] via-[#818cf8] to-[#f59e0b] hidden sm:block rounded-full transition-all duration-300 ease-out shadow-[0_0_15px_rgba(0,212,255,0.5)]" 
              style={{ height: `${scrollProgress}%`, maxHeight: 'calc(100% - 2rem)' }}
            />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
              {ROADMAP.map((r, i) => {
                const isEven = i % 2 === 0;
                const isFirst = i === 0;
                
                return (
                  <div key={i} className={`relative ${isEven ? 'sm:mt-0' : 'sm:mt-16'}`}>
                    {/* Node on the timeline */}
                    <div 
                      className={`hidden sm:block absolute top-6 w-3 h-3 rounded-full border-2 border-[#0e1522] z-10 transition-colors duration-500
                        ${isEven ? '-right-[1.125rem]' : '-left-[1.125rem]'}`}
                      style={{ 
                        background: scrollProgress > (i * 25) ? r.color : '#192035',
                        boxShadow: scrollProgress > (i * 25) ? `0 0 10px ${r.color}` : 'none'
                      }}
                    />
                    
                    <StatCard
                      hover
                      className={`p-6 relative transition-all duration-500 ${isFirst ? 'scale-[1.02] -translate-y-1 z-10' : ''}`}
                      background={`radial-gradient(ellipse 120% 60% at 0% 0%, ${r.color}0a, transparent), #0e1522`}
                      border={`1px solid ${isFirst ? r.color : `${r.color}22`}`}
                      shadow={isFirst ? `0 10px 40px ${r.color}20` : undefined}
                    >
                      {isFirst && <div className="absolute -inset-1 rounded-2xl opacity-20 pointer-events-none animate-pulse" style={{ background: `radial-gradient(circle at 50% 50%, ${r.color}, transparent 60%)` }} />}
                      
                      <div className="flex items-center justify-between mb-4 relative z-10">
                        <div className="flex items-center gap-3">
                          <span className="text-xl bg-[rgba(255,255,255,0.05)] w-10 h-10 flex items-center justify-center rounded-lg shadow-inner">{r.icon}</span>
                          <span className="font-mono text-[12px] font-bold" style={{ color: r.color }}>{r.phase}</span>
                        </div>
                        <span
                          className={`font-mono text-[9.5px] font-semibold px-2.5 py-1 rounded-lg ${isFirst ? 'animate-pulse' : ''}`}
                          style={{
                            background: `${r.color}12`,
                            border: `1px solid ${r.color}28`,
                            color: r.color,
                          }}
                        >
                          {r.status}
                        </span>
                      </div>
                      <h4 style={{ fontFamily: "'Space Grotesk', sans-serif" }} className="text-[16px] font-bold text-[#e2ecff] mb-3 relative z-10">
                        {r.title}
                      </h4>
                      <ul className="space-y-2 relative z-10">
                        {r.items.map((item, j) => (
                          <li key={j} className="flex items-start gap-2">
                            <span className="text-[10px] mt-1.5 shrink-0" style={{ color: r.color }}>▹</span>
                            <span className="text-[12.5px] text-[#4a6890] leading-relaxed">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </StatCard>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
