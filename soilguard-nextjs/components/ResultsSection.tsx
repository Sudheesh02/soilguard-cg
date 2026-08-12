'use client';
import { useState } from 'react';

import MapCard from '@/components/MapCard';
import StatCard from '@/components/StatCard';
import { MAPS as MAP_CATALOG, METRICS, ALL_SECTORS } from '@/lib/site-data';

interface LightboxData { src: string; caption: string; tag: string; }
interface Props { onOpenLightbox: (d: LightboxData) => void; }

const fmtHa = (v: number) => v.toLocaleString('en-IN', { maximumFractionDigits: 0 });
const imgSrc = (m: { file: string }) => `/assets/images/${m.file}`;

// Captions derived from the canonical metrics (shared/metrics.json)
const METRIC_STATS: Record<string, string> = {
  risk: `Mean SOC Def: ${(METRICS?.meanRisk ?? 0.4902).toFixed(3)} · RMSE: ${(METRICS?.rmse ?? 0.1132).toFixed(4)}`,
  zonal: `Top sector: ${ALL_SECTORS?.[0]?.name ?? 'Arang (B-1)'} · SOC Def: ${(ALL_SECTORS?.[0]?.risk ?? 0.6143).toFixed(4)}`,
  bsi: `Bare area: ${fmtHa(METRICS?.bareSoilHa ?? 22702)} ha (${METRICS?.bareSoilPct ?? 48.96}%)`,
};

const RISK_BREAKDOWN = [
  { label: 'Low Risk',      range: `< ${METRICS.lowCutoff}`,      ha: fmtHa(METRICS.lowRiskHa),      pct: METRICS.lowRiskPct,      color: '#10b981', bg: 'rgba(16,185,129,0.14)', border: 'rgba(16,185,129,0.3)' },
  { label: 'Moderate Risk', range: `${METRICS.lowCutoff} – ${METRICS.highCutoff}`, ha: fmtHa(METRICS.moderateRiskHa), pct: METRICS.moderateRiskPct, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.28)' },
  { label: 'High Risk',     range: `> ${METRICS.highCutoff}`,      ha: fmtHa(METRICS.highRiskHa),      pct: METRICS.highRiskPct,      color: '#ef4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.28)' },
];

const SUMMARY_STATS = [
  { label: 'Total AOI Area',    value: `${fmtHa(METRICS.totalAoiHa)} ha`, color: '#8ba3cc' },
  { label: 'Bare Soil Area',    value: `${fmtHa(METRICS.bareSoilHa)} ha`, color: '#00d4ff' },
  { label: 'Mean Risk Score',   value: METRICS.meanRisk.toFixed(3),       color: '#f59e0b' },
  { label: 'Median Risk Score', value: METRICS.medianRisk.toFixed(3),     color: '#f59e0b' },
  { label: 'Risk Std Deviation', value: METRICS.stdRisk.toFixed(3),       color: '#8ba3cc' },
  { label: 'Model Test R²',     value: METRICS.r2.toFixed(4),             color: '#10b981' },
  { label: 'Model Test RMSE',   value: METRICS.rmse.toFixed(4),           color: '#10b981' },
];

export default function ResultsSection({ onOpenLightbox }: Props) {
  const [active, setActive] = useState('risk');
  const current = MAP_CATALOG.find(m => m.id === active)!;

  return (
    <section id="results" className="py-16 bg-[#0a0f1a] section-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="max-w-3xl mb-12">
          <p className="eyebrow eyebrow-cyan mb-4">Spatial Results</p>
          <h2 className="section-title mb-5">
            Presentation-Ready<br className="hidden md:block"/>
            <span className="text-[#00d4ff]"> Geospatial Maps</span>
          </h2>
          <p className="section-body">
            Seven high-resolution output maps covering the full Raipur AOI (22km × 22km). All rendered at 10m spatial resolution from Sentinel-2 L2A BOA reflectance data, projected in EPSG:32644 (UTM Zone 44N).
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* Main map viewer */}
          <div className="lg:col-span-8 space-y-4">

            {/* Layer selector */}
            <div className="flex flex-wrap gap-2">
              {MAP_CATALOG.map(m => (
                <button
                  key={m.id}
                  onClick={() => setActive(m.id)}
                  className={`px-4 py-2 rounded-xl font-mono text-[11px] font-semibold border transition-all duration-200 ${
                    active === m.id
                      ? 'bg-[rgba(0,212,255,0.12)] border-[rgba(0,212,255,0.28)] text-[#00d4ff] shadow-[0_0_16px_rgba(0,212,255,0.15)]'
                      : 'bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.09)] text-[#8ba3cc] hover:bg-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.14)] hover:text-[#e2ecff]'
                  }`}
                >
                  {m.title.split(' ').slice(0, 3).join(' ')}
                </button>
              ))}
            </div>

            {/* Map card */}
            <MapCard
              src={imgSrc(current)}
              alt={current.title}
              bottomEyebrow={METRIC_STATS[current.id] ?? current.stats}
              bottomTitle={current.title}
              topRight={<span className={`badge ${current.badge}`}>{current.badgeText}</span>}
              onClick={() => onOpenLightbox({ src: imgSrc(current), caption: current.caption, tag: current.crs })}
            />

            <p className="text-[12px] text-[#4a6890] font-mono px-1">
              {current.subtitle} · Projection: {current.crs} (UTM Zone 44N)
            </p>
          </div>

          {/* Sidebar stats */}
          <div className="lg:col-span-4 space-y-4">

            {/* Risk breakdown */}
            <StatCard className="p-7 relative overflow-hidden" background="#0e1522" border="1px solid rgba(255,255,255,0.08)">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[rgba(255,255,255,0.02)] rounded-bl-full pointer-events-none" />
              <p className="eyebrow mb-6">Risk Area Breakdown</p>
              <div className="space-y-6">
                {RISK_BREAKDOWN.map((r, i) => {
                  const strokeDasharray = 2 * Math.PI * 18;
                  const strokeDashoffset = strokeDasharray - (r.pct / 100) * strokeDasharray;
                  
                  return (
                    <div key={r.label} className="flex items-center gap-4 group">
                      <div className="relative w-12 h-12 shrink-0">
                        <svg className="w-12 h-12 transform -rotate-90">
                          <circle cx="24" cy="24" r="18" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
                          <circle 
                            cx="24" cy="24" r="18" fill="none" stroke={r.color} strokeWidth="4"
                            strokeDasharray={strokeDasharray}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            className="transition-all duration-1000 ease-out group-hover:filter group-hover:drop-shadow-[0_0_8px_currentColor]"
                            style={{ color: r.color }}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center font-mono text-[9px] font-bold" style={{ color: r.color }}>
                          {r.pct.toFixed(0)}%
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[14px] font-semibold tracking-tight group-hover:text-white transition-colors" style={{ color: r.color }}>{r.label}</span>
                          <span className="font-mono text-[14px] font-bold text-[#e2ecff]">{r.ha}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[11px] text-[#4a6890] font-mono">{r.range}</span>
                          <span className="text-[11px] text-[#4a6890] font-mono">ha</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </StatCard>

            {/* Summary stats */}
            <StatCard className="p-6" background="#0e1522" border="1px solid rgba(255,255,255,0.08)">
              <p className="eyebrow mb-4">AOI Summary Statistics</p>
              <div className="space-y-3">
                {SUMMARY_STATS.map(stat => (
                  <div key={stat.label} className="flex justify-between items-center py-2 border-b border-[rgba(255,255,255,0.04)] last:border-none">
                    <span className="text-[12px] text-[#4a6890]">{stat.label}</span>
                    <span className="font-mono text-[12.5px] font-bold" style={{ color: stat.color }}>{stat.value}</span>
                  </div>
                ))}
              </div>
            </StatCard>

            {/* Histogram */}
            <StatCard className="overflow-hidden" background="#0e1522" border="1px solid rgba(255,255,255,0.08)">
              <div className="bg-[#0a0f1a] px-4 py-3 border-b border-[rgba(255,255,255,0.06)]">
                <p className="eyebrow text-[9.5px]">Risk Score Distribution Histogram</p>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/images/risk_histogram.png"
                alt="Risk Score Distribution"
                className="w-full bg-[#06090f]"
              />
            </StatCard>

          </div>
        </div>

      </div>
    </section>
  );
}
