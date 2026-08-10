'use client';
import { useState, useEffect } from 'react';

const LINES = [
  { delay: 0,    color: '#00d4ff', text: '# SoilGuard-SOC — Single Offline Demo Entry Point', type: 'comment' },
  { delay: 400,  color: '#e2ecff', text: '$ python soilguard-cg/src/run_full_demo.py', type: 'cmd', bold: true },
  { delay: 900,  color: '#10b981', text: '', type: 'gap' },
  { delay: 950,  color: '#10b981', text: '🌱  SoilGuard-SOC | Chhattisgarh Soil Carbon Sentinel v1.0', type: 'info' },
  { delay: 1100, color: '#8ba3cc', text: '    National Space Day Ideathon 2026 — COSINE NIT Raipur × NRSC/ISRO', type: 'info' },
  { delay: 1200, color: '#8ba3cc', text: '    Target Region : Raipur–Durg Rice Belt, Chhattisgarh (Offline Cache)', type: 'info' },
  { delay: 1350, color: '#4a6890', text: '    AOI           : [81.60°–81.80°E, 21.10°–21.30°N] · EPSG:32644', type: 'dim' },
  { delay: 1500, color: '#e2ecff', text: '', type: 'gap' },
  { delay: 1550, color: '#00d4ff', text: '📡  [Phase 1/4] Loading Cached Golden Datasets (100% Offline)...', type: 'phase' },
  { delay: 1700, color: '#4a6890', text: '    Sentinel-2 L2A Stack  : 2086 × 2223 px @ 10m (EPSG:32644)', type: 'dim' },
  { delay: 1800, color: '#4a6890', text: '    SoilGrids SOC/Clay/pH : Aligned to 10m Sentinel-2 grid', type: 'dim' },
  { delay: 1950, color: '#10b981', text: '    ✓ Golden cache loaded in 1.41s', type: 'ok' },
  { delay: 2100, color: '#e2ecff', text: '', type: 'gap' },
  { delay: 2150, color: '#00d4ff', text: '🔬  [Phase 2/4] Computing Spectral Indices & Bare Soil Mask...', type: 'phase' },
  { delay: 2300, color: '#4a6890', text: '    BSI + NDVI computed for 4,637,178 pixels', type: 'dim' },
  { delay: 2400, color: '#4a6890', text: '    Bare Soil Candidates : 2,270,247 px (48.96%) [NDVI ≤ 0.30]', type: 'dim' },
  { delay: 2550, color: '#10b981', text: '    ✓ Maps saved: bsi_map.png · ndvi_map.png · false_color_composite.png', type: 'ok' },
  { delay: 2700, color: '#e2ecff', text: '', type: 'gap' },
  { delay: 2750, color: '#00d4ff', text: '🤖  [Phase 3/4] Training Satellite-Driven RF SOC Deficiency Model...', type: 'phase' },
  { delay: 2900, color: '#4a6890', text: '    Features : swir1 · nir · red · blue · bsi · ndvi · 3 ratios (9 total)', type: 'dim' },
  { delay: 3000, color: '#4a6890', text: '    Target   : y = 0.60×(1−SOC_norm) + 0.40×BSI_norm', type: 'dim' },
  { delay: 3100, color: '#4a6890', text: '    Leakage  : Raw SOC EXCLUDED from feature matrix X ✓', type: 'dim' },
  { delay: 3250, color: '#10b981', text: '    ✓ RF Model Trained | Test R²: 0.4481 | Test RMSE: 0.0940', type: 'ok', bold: true },
  { delay: 3400, color: '#10b981', text: '    ✓ Maps saved: risk_score_map.png (SOC Def Map) · model_confidence.png', type: 'ok' },
  { delay: 3550, color: '#e2ecff', text: '', type: 'gap' },
  { delay: 3600, color: '#00d4ff', text: '📊  [Phase 4/4] Zonal Analytics, Regenerative Packages & Report...', type: 'phase' },
  { delay: 3750, color: '#4a6890', text: '    Grid    : 5×5 regular spatial overlay → 25 sectors', type: 'dim' },
  { delay: 3850, color: '#4a6890', text: '    #1 Rank : Arang (B-1) — Mean SOC Def 0.6143 · 869.2 ha HIGH DEFICIENT', type: 'dim' },
  { delay: 3950, color: '#4a6890', text: '    #2 Rank : Abhanpur (A-1) — Mean SOC Def 0.6106 · 816.0 ha HIGH DEFICIENT', type: 'dim' },
  { delay: 4050, color: '#10b981', text: '    ✓ CSVs saved: zonal_priority_ranking.csv · agronomic_recommendations.csv', type: 'ok' },
  { delay: 4200, color: '#10b981', text: '    ✓ Report: SoilGuard_SOC_Executive_Summary.md', type: 'ok' },
  { delay: 4350, color: '#e2ecff', text: '', type: 'gap' },
  { delay: 4400, color: '#8ba3cc', text: '╭─────────── SoilGuard-SOC Execution Summary ─────────────╮', type: 'box' },
  { delay: 4500, color: '#e2ecff', text: '│  ✓ Full Pipeline Completed in  41.03  seconds            │', type: 'box', bold: true },
  { delay: 4600, color: '#8ba3cc', text: '│  • SOC Def Score Map   → outputs/phase3/risk_score_map.png │', type: 'box' },
  { delay: 4700, color: '#8ba3cc', text: '│  • Zonal SOC Priority  → outputs/phase4/zonal_risk_map.png │', type: 'box' },
  { delay: 4800, color: '#8ba3cc', text: '│  • Confidence Map      → outputs/phase4/model_confidence.png│', type: 'box' },
  { delay: 4900, color: '#8ba3cc', text: '╰─────────────────────────────────────────────────────────╯', type: 'box' },
];

export default function TerminalSection() {
  const [visibleCount, setVisibleCount] = useState(0);
  const [running, setRunning] = useState(false);
  const [copied, setCopied]   = useState(false);
  const CMD = 'python soilguard-cg/src/run_full_demo.py';

  const runDemo = () => {
    setRunning(true);
    setVisibleCount(0);
    LINES.forEach((line, i) => {
      setTimeout(() => {
        setVisibleCount(i + 1);
      }, line.delay);
    });
    setTimeout(() => setRunning(false), 5200);
  };

  const copy = () => {
    navigator.clipboard.writeText(CMD).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <section id="terminal" className="py-24 bg-[#06090f] section-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <p className="eyebrow eyebrow-emerald mb-4">Terminal-Native Reproducibility</p>
            <h2 className="section-title mb-4">
              Single Command.<br className="hidden md:block"/>
              <span className="text-[#10b981]"> Full Pipeline. Offline.</span>
            </h2>
            <p className="section-body">
              The entire SoilGuard-CG pipeline — data loading, spectral index computation, ML training, risk mapping, zonal analytics, and executive report generation — executes from a single terminal command in ~41 seconds with zero internet connectivity.
            </p>
          </div>

          <div className="flex gap-3 shrink-0">
            <button
              onClick={copy}
              className="px-4 py-2.5 rounded-xl font-mono text-[11.5px] font-bold border transition-all"
              style={{
                background: 'rgba(16,185,129,0.08)',
                border: '1px solid rgba(16,185,129,0.22)',
                color: '#10b981',
              }}
            >
              {copied ? '✓ COPIED' : '📋 COPY CMD'}
            </button>
            <button
              onClick={runDemo}
              disabled={running}
              className="px-5 py-2.5 rounded-xl font-mono text-[11.5px] font-bold transition-all disabled:opacity-60"
              style={{
                background: running ? 'rgba(0,212,255,0.06)' : 'rgba(0,212,255,0.12)',
                border: '1px solid rgba(0,212,255,0.28)',
                color: '#00d4ff',
                boxShadow: running ? 'none' : '0 0 16px rgba(0,212,255,0.15)',
              }}
            >
              {running ? '⏳ RUNNING...' : '▶ RUN DEMO'}
            </button>
          </div>
        </div>

        {/* Terminal window */}
        <div className="terminal-window">

          {/* Title bar */}
          <div className="terminal-bar justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex gap-1.5">
                <div className="terminal-dot bg-[#ef4444]" />
                <div className="terminal-dot bg-[#f59e0b]" />
                <div className="terminal-dot bg-[#10b981]" />
              </div>
              <span className="font-mono text-[11.5px] text-[#4a6890]">
                soilguard@COSINE-RAIPUR:~/GEOSPATIAL_SOIL$ bash
              </span>
            </div>
            <div className="flex items-center gap-2">
              {running && <span className="live-dot" />}
              <span className="badge badge-emerald">100% OFFLINE</span>
            </div>
          </div>

          {/* Body */}
          <div className="terminal-body" style={{ minHeight: 420 }}>
            {(visibleCount === 0 ? LINES.slice(0, 2) : LINES.slice(0, visibleCount)).map((line, i) => (
              <div
                key={i}
                className="leading-[1.9]"
                style={{
                  color: line.color,
                  fontWeight: line.bold ? 700 : 400,
                  opacity: visibleCount === 0 && i > 0 ? 0.4 : 1,
                }}
              >
                {line.text || <span>&nbsp;</span>}
                {i === (visibleCount === 0 ? 1 : visibleCount - 1) && (
                  <span className="animate-blink ml-0.5">▋</span>
                )}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div
            className="px-6 py-3 flex items-center justify-between border-t"
            style={{ borderColor: 'rgba(255,255,255,0.06)', background: '#080d18' }}
          >
            <div className="font-mono text-[11px] text-[#4a6890] flex items-center gap-4">
              <span>Python 3.10+ · scikit-learn · rasterio · STAC</span>
              <span className="text-[#10b981]">WSL / Linux Terminal</span>
            </div>
            <span className="font-mono text-[11px] text-[#4a6890]">
              {visibleCount > 0 ? `${visibleCount}/${LINES.length} lines` : 'Click ▶ RUN DEMO'}
            </span>
          </div>
        </div>

        {/* Quick start commands */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: 'Phase 2 — Spectral Maps',     cmd: 'python soilguard-cg/src/run_phase2.py' },
            { label: 'Phase 3 — Risk Score Map',    cmd: 'python soilguard-cg/src/run_phase3.py' },
            { label: 'Phase 4 — Zonal + Report',    cmd: 'python soilguard-cg/src/run_phase4.py' },
            { label: 'Full Pipeline (All Phases)',   cmd: 'python soilguard-cg/src/run_full_demo.py' },
          ].map(item => (
            <div
              key={item.label}
              className="rounded-xl p-4 flex items-center gap-4"
              style={{ background: '#0a0f1a', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div className="w-2 h-2 rounded-full bg-[#10b981] shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="eyebrow text-[9.5px] mb-1">{item.label}</p>
                <code className="text-[12.5px] text-[#00d4ff] font-mono truncate block">{item.cmd}</code>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
