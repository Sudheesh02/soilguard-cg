'use client';
import { useState } from 'react';

interface LightboxData { src: string; caption: string; tag: string; }
interface Props { onOpenLightbox: (d: LightboxData) => void; }

const MAPS = [
  {
    key: 'risk',
    src: '/assets/images/risk_score_map.png',
    title: 'SOC Deficiency Score Map',
    subtitle: '10m resolution · Sentinel-2 spectral features',
    tag: 'PHASE 3',
    badge: 'badge-red',
    badgeText: 'PRIMARY LAYER',
    caption: 'Soil Organic Carbon (SOC) Deficiency Map — Raipur–Durg Belt (10m Resolution, Sentinel-2 L2A)',
    crs: 'EPSG:32644',
    stats: 'Mean SOC Def: 0.489 · RMSE: 0.0929',
  },
  {
    key: 'zonal',
    src: '/assets/images/zonal_risk_map.png',
    title: 'Zonal Organic Carbon Priority Map',
    subtitle: '5×5 regular grid · 25 agricultural sectors',
    tag: 'PHASE 4',
    badge: 'badge-amber',
    badgeText: 'ZONAL GRID',
    caption: 'Zonal Organic Carbon Priority Sector Map — 5×5 Grid (Raipur–Durg Rice Belt)',
    crs: 'EPSG:32644',
    stats: 'Top sector: Arang B-1 · SOC Def: 0.6143',
  },
  {
    key: 'confidence',
    src: '/assets/images/model_confidence_map.png',
    title: 'Model Ensemble Confidence Map',
    subtitle: 'Prediction uncertainty · Ensemble spread',
    tag: 'PHASE 4',
    badge: 'badge-violet',
    badgeText: 'CONFIDENCE',
    caption: 'Model Ensemble Confidence / Uncertainty Map',
    crs: 'EPSG:32644',
    stats: 'Ensemble trees: 150 · OOB uncertainty',
  },
  {
    key: 'bsi',
    src: '/assets/images/bsi_map.png',
    title: 'Bare Soil Index (BSI) Map',
    subtitle: 'Topsoil exposure · NDVI ≤ 0.30 masked',
    tag: 'PHASE 2',
    badge: 'badge-amber',
    badgeText: 'SPECTRAL',
    caption: 'Bare Soil Index (BSI) Map — Raipur AOI',
    crs: 'EPSG:32644',
    stats: 'Bare area: 22,702 ha (48.96%)',
  },
  {
    key: 'ndvi',
    src: '/assets/images/ndvi_map.png',
    title: 'NDVI Vegetation Map',
    subtitle: 'Normalized Difference Vegetation Index',
    tag: 'PHASE 2',
    badge: 'badge-emerald',
    badgeText: 'VEGETATION',
    caption: 'NDVI Vegetation Index Map — Raipur AOI',
    crs: 'EPSG:32644',
    stats: 'Threshold: NDVI ≤ 0.30 for bare soil',
  },
  {
    key: 'falsecolor',
    src: '/assets/images/false_color_composite.png',
    title: 'False Color Composite',
    subtitle: 'NIR-Red-Green · Vegetation and bare soil',
    tag: 'PHASE 2',
    badge: 'badge-cyan',
    badgeText: 'FALSE COLOR',
    caption: 'Sentinel-2 False Color Composite (NIR-R-G)',
    crs: 'EPSG:32644',
    stats: 'B08/B04/B03 composite',
  },
];

const RISK_BREAKDOWN = [
  { label: 'Low Risk',      range: '< 0.45',      ha: '9,405', pct: 41.43, color: '#10b981', bg: 'rgba(16,185,129,0.14)', border: 'rgba(16,185,129,0.3)' },
  { label: 'Moderate Risk', range: '0.45 – 0.58', ha: '9,226', pct: 40.64, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.28)' },
  { label: 'High Risk',     range: '> 0.58',      ha: '4,071', pct: 17.93, color: '#ef4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.28)' },
];

export default function ResultsSection({ onOpenLightbox }: Props) {
  const [active, setActive] = useState('risk');
  const current = MAPS.find(m => m.key === active)!;

  return (
    <section id="results" className="py-24 bg-[#0a0f1a] section-border">
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
              {MAPS.map(m => (
                <button
                  key={m.key}
                  onClick={() => setActive(m.key)}
                  className={`px-4 py-2 rounded-xl font-mono text-[11px] font-semibold border transition-all duration-200 ${
                    active === m.key
                      ? 'bg-[rgba(0,212,255,0.12)] border-[rgba(0,212,255,0.28)] text-[#00d4ff] shadow-[0_0_16px_rgba(0,212,255,0.15)]'
                      : 'bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.09)] text-[#8ba3cc] hover:bg-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.14)] hover:text-[#e2ecff]'
                  }`}
                >
                  {m.title.split(' ').slice(0, 3).join(' ')}
                </button>
              ))}
            </div>

            {/* Map card */}
            <div
              className="map-card group"
              onClick={() => onOpenLightbox({ src: current.src, caption: current.caption, tag: current.crs })}
              role="button"
              tabIndex={0}
              aria-label={`View full resolution ${current.title}`}
            >
              <img
                src={current.src}
                alt={current.title}
                className="w-full aspect-[4/3] object-cover"
              />
              <div className="map-overlay" />

              {/* Badges */}
              <div className="absolute top-4 left-4 flex items-center gap-1.5 glass px-3 py-1.5">
                <span className="live-dot" />
                <span className="font-mono text-[10px] text-[#10b981] font-semibold">SENTINEL-2 L2A</span>
              </div>
              <span className={`absolute top-4 right-4 badge ${current.badge}`}>{current.badgeText}</span>

              {/* Bottom info */}
              <div className="absolute bottom-4 left-4 right-4">
                <div className="glass px-4 py-3">
                  <p className="eyebrow mb-1">{current.stats}</p>
                  <p style={{ fontFamily: "'Space Grotesk', sans-serif" }} className="text-[13.5px] font-bold text-[#e2ecff]">
                    {current.title}
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

            <p className="text-[12px] text-[#4a6890] font-mono px-1">
              {current.subtitle} · Projection: {current.crs} (UTM Zone 44N)
            </p>
          </div>

          {/* Sidebar stats */}
          <div className="lg:col-span-4 space-y-4">

            {/* Risk breakdown */}
            <div
              className="rounded-2xl p-6"
              style={{ background: '#0e1522', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <p className="eyebrow mb-5">Risk Area Breakdown</p>
              <div className="space-y-5">
                {RISK_BREAKDOWN.map(r => (
                  <div key={r.label}>
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <span className="text-[13px] font-semibold" style={{ color: r.color }}>{r.label}</span>
                        <span className="text-[11px] text-[#4a6890] font-mono ml-2">{r.range}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-[13px] font-bold text-[#e2ecff]">{r.ha}</span>
                        <span className="text-[11px] text-[#4a6890] font-mono ml-1">ha</span>
                      </div>
                    </div>
                    <div className="progress-track">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${r.pct}%`,
                          background: `linear-gradient(90deg, ${r.color}, ${r.color}99)`,
                        }}
                      />
                    </div>
                    <div className="text-right mt-1">
                      <span className="font-mono text-[11px]" style={{ color: r.color }}>{r.pct.toFixed(1)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary stats */}
            <div
              className="rounded-2xl p-6"
              style={{ background: '#0e1522', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <p className="eyebrow mb-4">AOI Summary Statistics</p>
              <div className="space-y-3">
                {[
                  { label: 'Total AOI Area',    value: '46,372 ha',  color: '#8ba3cc' },
                  { label: 'Bare Soil Area',     value: '22,702 ha',  color: '#00d4ff' },
                  { label: 'Mean Risk Score',    value: '0.489',      color: '#f59e0b' },
                  { label: 'Median Risk Score',  value: '0.466',      color: '#f59e0b' },
                  { label: 'Risk Std Deviation', value: '0.086',      color: '#8ba3cc' },
                  { label: 'Model Test R²',      value: '0.4568',     color: '#10b981' },
                  { label: 'Model Test RMSE',    value: '0.0929',     color: '#10b981' },
                ].map(stat => (
                  <div key={stat.label} className="flex justify-between items-center py-2 border-b border-[rgba(255,255,255,0.04)] last:border-none">
                    <span className="text-[12px] text-[#4a6890]">{stat.label}</span>
                    <span className="font-mono text-[12.5px] font-bold" style={{ color: stat.color }}>{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Histogram */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{ border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div className="bg-[#0a0f1a] px-4 py-3 border-b border-[rgba(255,255,255,0.06)]">
                <p className="eyebrow text-[9.5px]">Risk Score Distribution Histogram</p>
              </div>
              <img
                src="/assets/images/risk_histogram.png"
                alt="Risk Score Distribution"
                className="w-full bg-[#06090f]"
              />
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
