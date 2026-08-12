'use client';
import { useEffect, useState, useRef } from 'react';
import { METRICS } from '@/lib/site-data';
import StatCard from '@/components/StatCard';

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
    output: `R² = ${METRICS.r2.toFixed(4)}`,
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
  const [activeStep, setActiveStep] = useState<number>(-1);
  const sectionRef = useRef<HTMLElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute('data-index'));
            setActiveStep(prev => Math.max(prev, index));
          }
        });
      },
      { threshold: 0.5, rootMargin: '-10% 0px -10% 0px' }
    );

    cardRefs.current.forEach(ref => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section id="pipeline" ref={sectionRef} className="py-16 bg-[#06090f] section-border relative overflow-hidden">
      {/* Background animated line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-[1px] -translate-x-1/2 bg-gradient-to-b from-transparent via-[rgba(0,212,255,0.2)] to-transparent hidden lg:block" />
      <div 
        className="absolute left-1/2 top-0 w-[2px] -translate-x-1/2 bg-gradient-to-b from-[#00d4ff] to-[#10b981] hidden lg:block transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(0,212,255,0.8)]"
        style={{ height: activeStep >= 0 ? `${(activeStep / (STAGES.length - 1)) * 100}%` : '0%' }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Header */}
        <div className="max-w-3xl mb-10">
          <p className="eyebrow eyebrow-emerald mb-3">System Architecture</p>
          <h2 className="section-title mb-4">
            6-Stage Geospatial<br className="hidden md:block"/>
            <span className="text-[#10b981]"> Processing Pipeline</span>
          </h2>
          <p className="section-body max-w-xl">
            Automated end-to-end telemetry pipeline converting Sentinel-2 Cloud-Optimized GeoTIFFs into actionable, sector-level agronomic advisories: all within a single terminal environment.
          </p>
        </div>

        {/* Pipeline grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10 relative">
          {STAGES.map((s, i) => {
            const isVisible = activeStep >= i;
            const isEven = i % 2 === 0;
            const isActive = activeStep === i;
            
            return (
              <div 
                key={i} 
                ref={el => { cardRefs.current[i] = el; }}
                data-index={i}
                className={`transition-all duration-700 ease-out flex ${isEven ? 'lg:justify-end' : 'lg:justify-start lg:col-start-2'} 
                  ${isVisible ? 'opacity-100 translate-x-0 translate-y-0' : `opacity-0 translate-y-10 lg:translate-y-0 ${isEven ? 'lg:-translate-x-20' : 'lg:translate-x-20'}`}`}
              >
                <div className="w-full max-w-lg relative group">
                  
                  {/* Connection Node (Desktop) */}
                  <div className={`hidden lg:block absolute top-1/2 -translate-y-1/2 ${isEven ? '-right-[2.65rem]' : '-left-[2.65rem]'} w-4 h-4 rounded-full transition-all duration-500 z-20
                    ${isVisible ? 'bg-[#00d4ff] shadow-[0_0_15px_rgba(0,212,255,0.8)]' : 'bg-[#192035] border-2 border-[rgba(255,255,255,0.1)]'}`} 
                  />
                  
                  {/* Connector Line (Desktop) */}
                  <div className={`hidden lg:block absolute top-1/2 -translate-y-1/2 ${isEven ? '-right-10' : '-left-10'} w-10 h-[2px] transition-all duration-700 delay-300 origin-${isEven ? 'left' : 'right'}
                    ${isVisible ? 'bg-gradient-to-r from-[rgba(0,212,255,0.5)] to-[rgba(16,185,129,0.5)] scale-x-100' : 'bg-transparent scale-x-0'}`} 
                  />

                  <StatCard
                    hover
                    className={`p-7 relative overflow-hidden transition-all duration-500 ${isActive ? 'scale-[1.02] -translate-y-1' : ''}`}
                    background={`radial-gradient(ellipse 120% 60% at 50% -10%, ${s.color}15, transparent), #0e1522`}
                    border={`1px solid ${isActive ? s.color : `${s.color}2e`}`}
                    shadow={isActive ? `0 10px 40px ${s.color}30` : "0 4px 24px rgba(0,0,0,0.25)"}
                  >
                    {/* Corner phase tag */}
                    <span className="absolute top-5 right-5 eyebrow text-[10px] tracking-widest" style={{ color: `${s.color}99` }}>{s.phase}</span>

                    {/* Icon + step */}
                    <div className="flex items-center gap-4 mb-5 relative">
                      <div className={`absolute -inset-2 bg-[${s.color}] opacity-20 rounded-full blur-xl transition-opacity duration-500 ${isActive ? 'opacity-40' : 'opacity-0 group-hover:opacity-20'}`} />
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 relative z-10 transition-transform duration-500 ${isActive ? 'scale-110' : ''}`}
                        style={{ background: `${s.color}1a`, border: `1px solid ${s.color}40`, boxShadow: isActive ? `0 0 20px ${s.color}40` : 'none' }}
                      >
                        {s.icon}
                      </div>
                      <div>
                        <span
                          className="font-mono text-[26px] font-bold block leading-none tracking-tight"
                          style={{ color: s.color, textShadow: `0 0 20px ${s.color}80` }}
                        >
                          {s.num}
                        </span>
                        <span className="eyebrow text-[10px] opacity-80">{s.label}</span>
                      </div>
                    </div>

                    <h3 style={{ fontFamily: "'Space Grotesk', sans-serif" }} className="text-[18px] font-bold text-[#e2ecff] mb-3">
                      {s.title}
                    </h3>
                    <p className="text-[14px] text-[#4a6890] leading-relaxed mb-6">{s.desc}</p>

                    {/* Inputs → Output */}
                    <div className="flex items-start gap-3 text-[12px] bg-[rgba(6,9,15,0.4)] p-3 rounded-lg border border-[rgba(255,255,255,0.03)]">
                      <div className="flex flex-wrap gap-1.5">
                        {s.inputs.map(inp => (
                          <span key={inp} className="font-mono px-2 py-0.5 rounded bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-[#8ba3cc]">{inp}</span>
                        ))}
                      </div>
                      <svg width="16" height="16" viewBox="0 0 14 14" fill="none" className="shrink-0 mt-0.5">
                        <path d="M2 7h10M8 3l4 4-4 4" stroke={s.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="font-mono font-bold whitespace-nowrap px-2 py-0.5 rounded" style={{ color: s.color, background: `${s.color}10`, border: `1px solid ${s.color}30` }}>{s.output}</span>
                    </div>
                  </StatCard>
                </div>
              </div>
            );
          })}
        </div>

        {/* Leakage prevention callout */}
        <StatCard
          className="p-7 flex flex-col md:flex-row gap-6 items-start md:items-center"
          background="radial-gradient(ellipse 100% 80% at 50% -10%, rgba(0,212,255,0.06), transparent), #0e1522"
          border="1px solid rgba(0,212,255,0.20)"
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
        </StatCard>

      </div>
    </section>
  );
}
