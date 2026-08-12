'use client';

import MapCard from '@/components/MapCard';
import StatCard from '@/components/StatCard';
import { METRICS } from '@/lib/site-data';
import { useEffect, useState } from 'react';

interface LightboxData { src: string; caption: string; tag: string; }
interface Props { onOpenLightbox: (d: LightboxData) => void; }

const KPI = [
  {
    value: METRICS.bareSoilHa.toLocaleString('en-IN', { maximumFractionDigits: 0 }),
    unit: 'ha',   label: 'Agricultural Soil Area Mapped',
    color: 'text-[#00d4ff]', glow: 'rgba(0,212,255,0.22)',
    border: 'rgba(0,212,255,0.18)', bg: 'rgba(0,212,255,0.05)',
    icon: '🗺️',
  },
  {
    value: METRICS.runtimeSec.toFixed(2),
    unit: 'sec',  label: 'Full Offline Pipeline Runtime',
    color: 'text-[#818cf8]', glow: 'rgba(129,140,248,0.22)',
    border: 'rgba(129,140,248,0.18)', bg: 'rgba(129,140,248,0.05)',
    icon: '⚡',
  },
  {
    value: METRICS.highRiskPct.toFixed(1),
    unit: '%',    label: 'High SOC Deficiency Area',
    color: 'text-[#ef4444]', glow: 'rgba(239,68,68,0.22)',
    border: 'rgba(239,68,68,0.18)', bg: 'rgba(239,68,68,0.05)',
    icon: '⚠️',
  },
  {
    value: METRICS.r2.toFixed(4),
    unit: 'R²',   label: 'SOC Model Test Accuracy',
    color: 'text-[#10b981]', glow: 'rgba(16,185,129,0.22)',
    border: 'rgba(16,185,129,0.18)', bg: 'rgba(16,185,129,0.05)',
    icon: '🤖',
  },
];

export default function HeroSection({ onOpenLightbox }: Props) {
  const [scrollY, setScrollY] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [counts, setCounts] = useState(KPI.map(() => 0));

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Animate counts
    const duration = 2000;
    const steps = 60;
    const stepTime = duration / steps;
    let currentStep = 0;
    
    const timer = setInterval(() => {
      currentStep++;
      setCounts(KPI.map(k => {
        const target = parseFloat(k.value.replace(/,/g, ''));
        const isInt = !k.value.includes('.');
        const val = (target / steps) * currentStep;
        return isInt ? Math.min(Math.floor(val), target) : Math.min(val, target);
      }));
      if (currentStep >= steps) clearInterval(timer);
    }, stepTime);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(timer);
    };
  }, []);

  const scrollTo = (id: string) =>
    document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' });

  // Generate particles
  const particles = Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    size: Math.random() * 4 + 1,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    duration: `${Math.random() * 10 + 10}s`,
    delay: `-${Math.random() * 10}s`
  }));

  return (
    <section id="overview" className="relative overflow-hidden bg-[#06090f] min-h-screen flex flex-col justify-center pt-[80px]">

      {/* Gradient mesh background */}
      <div className="hero-mesh opacity-70" />

      {/* Particles */}
      {mounted && particles.map(p => (
        <div 
          key={p.id}
          className="particle"
          style={{
            width: p.size, height: p.size,
            left: p.left, top: p.top,
            animationDuration: p.duration,
            animationDelay: p.delay,
          }}
        />
      ))}

      {/* Dot grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{ backgroundImage: 'radial-gradient(rgba(0,212,255,0.08) 1px, transparent 1px)', backgroundSize: '40px 40px' }}
      />

      {/* Ambient orbs with parallax */}
      <div 
        className="pointer-events-none absolute -left-48 top-1/4 w-[600px] h-[600px] rounded-full transition-transform duration-300 ease-out" 
        style={{ 
          background: 'radial-gradient(circle, rgba(0,212,255,0.06), transparent 70%)', 
          filter: 'blur(50px)',
          transform: `translateY(${scrollY * 0.2}px)`
        }} 
      />
      <div 
        className="pointer-events-none absolute -right-48 bottom-1/4 w-[500px] h-[500px] rounded-full transition-transform duration-300 ease-out" 
        style={{ 
          background: 'radial-gradient(circle, rgba(16,185,129,0.06), transparent 70%)', 
          filter: 'blur(50px)',
          transform: `translateY(${scrollY * -0.1}px)`
        }} 
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">

        {/* Top header row */}
        <div className="flex flex-wrap items-center gap-3 mb-10">
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-[rgba(245,158,11,0.08)] border border-[rgba(245,158,11,0.22)]">
            <span className="text-[#f59e0b] text-[11px] font-mono font-bold tracking-wider">⚡ AI-POWERED CARBON INTELLIGENCE</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[rgba(0,212,255,0.06)] border border-[rgba(0,212,255,0.18)]">
            <span className="text-[11px] text-[#00d4ff] font-mono font-semibold">🛰️ 10m SATELLITE GEOSPATIAL ENGINE</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[rgba(16,185,129,0.07)] border border-[rgba(16,185,129,0.18)]">
            <span className="live-dot" />
            <span className="text-[10.5px] text-[#10b981] font-mono font-semibold tracking-wide">SENTINEL-2 REAL-TIME INFRASTRUCTURE</span>
          </div>
        </div>

        {/* Two-col layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">

          {/* Left: Text */}
          <div className="lg:col-span-6 z-10">
            <div className="eyebrow eyebrow-cyan mb-4 stagger-1">Chhattisgarh Soil Carbon Sentinel</div>

            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif" }} className="text-[clamp(2.2rem,5vw,4.5rem)] font-extrabold text-[#e2ecff] leading-[1.05] tracking-tight mb-5 stagger-2 whitespace-nowrap">
              Soil<span className="text-[#00d4ff]" style={{ textShadow: '0 0 50px rgba(0,212,255,0.4)' }}>Guard</span><span className="text-[#10b981]">-SOC</span>
            </h1>

            <p style={{ fontFamily: "'Space Grotesk', sans-serif" }} className="text-[clamp(1.1rem,2.5vw,1.35rem)] font-semibold text-[#8ba3cc] mb-5 leading-snug stagger-3 text-balance">
              High-Resolution Soil Organic Carbon (SOC) Deficiency Mapping<br className="hidden sm:block"/>
              for the Chhattisgarh Rice Belt
            </p>

            <p className="text-[16px] text-[#4a6890] leading-relaxed max-w-lg mb-7 stagger-4 text-balance">
              A satellite-driven geospatial ML platform converting Sentinel-2 imagery into 10m-resolution Soil Organic Carbon deficiency maps, 5×5 zonal carbon priority rankings, and concrete regenerative intervention packages (FYM dosage, green manuring, residue retention, zero-till).
            </p>

            <div className="flex flex-wrap gap-2 mb-8 stagger-4" style={{ animationDelay: '0.5s' }}>
              {[
                { text: 'SOC Deficiency Target', color: 'badge-emerald' },
                { text: '22,702 ha Mapped', color: 'badge-cyan' },
                { text: 'Raipur-Durg Rice Plains', color: 'badge-amber' },
                { text: '10m Sentinel-2 Resolution', color: 'badge-violet' },
              ].map(b => (
                <span key={b.text} className={`badge ${b.color}`}>{b.text}</span>
              ))}
            </div>

            <div className="flex flex-wrap gap-4 stagger-4" style={{ animationDelay: '0.6s' }}>
              <a
                href="http://localhost:3001"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary shimmer"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
                Launch Dashboard
              </a>
              <button
                onClick={() => scrollTo('#results')}
                className="btn-ghost group"
              >
                <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                  <path d="M8 1.5C4.41 1.5 1.5 4.41 1.5 8S4.41 14.5 8 14.5 14.5 11.59 14.5 8 11.59 1.5 8 1.5Z" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M5 8h6M8 5v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                Spatial Maps
              </button>
            </div>
          </div>

          {/* Right: Primary Map */}
          <div className="lg:col-span-6 stagger-4 relative" style={{ animationDelay: '0.7s' }}>
            <div className="absolute -inset-4 bg-gradient-to-tr from-[rgba(0,212,255,0.1)] to-[rgba(16,185,129,0.1)] rounded-3xl blur-2xl z-0" />
            <MapCard
              src="/assets/images/risk_score_map.png"
              alt="Soil Health Risk Score Map — Raipur AOI"
              bottomEyebrow="Primary Risk Intelligence Layer"
              bottomTitle="10m Soil Health Risk Score Map · Raipur Agricultural Belt"
              topRight={<span className="badge badge-cyan">EPSG:32644</span>}
              onClick={() => onOpenLightbox({
                src: '/assets/images/risk_score_map.png',
                caption: 'Soil Health Risk Score Map — Raipur AOI (10m Spatial Resolution, Sentinel-2 L2A)',
                tag: 'EPSG:32644 · UTM Zone 44N',
              })}
            />
          </div>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 pt-12 border-t border-[rgba(255,255,255,0.06)] stagger-4 relative" style={{ animationDelay: '0.8s' }}>
          <div className="absolute top-[-1px] left-1/4 right-1/4 height-[1px] bg-gradient-to-r from-transparent via-[rgba(0,212,255,0.5)] to-transparent" />
          {KPI.map((k, i) => {
            const isInt = !k.value.includes('.');
            const displayValue = counts[i] > 0 ? (isInt ? counts[i].toLocaleString('en-IN') : counts[i].toFixed(k.value.includes('4') ? 4 : (k.value.includes('2') ? 2 : 1))) : k.value;
            
            return (
              <StatCard
                key={i}
                hover={true}
                className="p-6 hover:-translate-y-1 transition-all duration-300"
                background={`radial-gradient(ellipse 100% 70% at 50% -10%, ${k.bg}, transparent), #0e1522`}
                border={`1px solid ${k.border}`}
                shadow={`0 8px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)`}
              >
                <div className="text-2xl mb-3">{k.icon}</div>
                <p className="eyebrow mb-2 text-[10px] opacity-80">{k.label}</p>
                <div className="flex items-baseline gap-1.5">
                  <span
                    className={`stat-num text-[2.4rem] font-extrabold ${k.color}`}
                    style={{ textShadow: `0 0 30px ${k.glow}` }}
                  >
                    {displayValue}
                  </span>
                  <span className="text-[11px] text-[#4a6890] font-mono uppercase tracking-widest">{k.unit}</span>
                </div>
              </StatCard>
            );
          })}
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce cursor-pointer opacity-70 hover:opacity-100 transition-opacity" onClick={() => scrollTo('#problem')}>
          <span className="eyebrow text-[9px] tracking-[0.2em]">SCROLL</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#8ba3cc]">
            <path d="M12 5v14M19 12l-7 7-7-7"/>
          </svg>
        </div>

      </div>
    </section>
  );
}
