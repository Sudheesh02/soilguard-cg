'use client';
import { useState, useEffect } from 'react';
import { METRICS } from '@/lib/site-data';

interface TerminalLine {
  text: string;
  type: 'command' | 'success' | 'info' | 'dim' | 'accent' | 'highlight' | 'blank';
  delay: number;
}

const LOGS: TerminalLine[] = [
  { delay: 200,  type: 'command',   text: '> python soilguard-cg/src/run_full_demo.py' },
  { delay: 600,  type: 'info',      text: 'ℹ [Preflight] Initializing SoilGuard-CG Geospatial Pipeline v1.0' },
  { delay: 1000, type: 'success',   text: '✔ [Phase 1/4] Verifying offline raster datasets... 22,702.47 ha isolated.' },
  { delay: 1400, type: 'success',   text: '✔ [Phase 1/4] Sentinel-2 L2A raster stack validated @ 10m spatial resolution.' },
  { delay: 1800, type: 'success',   text: '✔ [Phase 2/4] Computing BSI & NDVI spectral indices... Bare soil mask applied (NDVI ≤ 0.30).' },
  { delay: 2200, type: 'accent',    text: '✔ [Phase 2/4] Spectral maps generated: bsi_map.png · ndvi_map.png · false_color.png' },
  { delay: 2600, type: 'success',   text: `✔ [Phase 3/4] Executing Random Forest regressor (150 trees)... R² = ${METRICS.r2.toFixed(4)}, RMSE = ${METRICS.rmse.toFixed(4)}` },
  { delay: 3000, type: 'success',   text: '✔ [Phase 3/4] Wall-to-wall risk map written: risk_score_map.png (SOC Deficiency Heatmap).' },
  { delay: 3400, type: 'success',   text: '✔ [Phase 4/4] Aggregating 5×5 spatial zonal priority grid... 25 sectors classified.' },
  { delay: 3800, type: 'success',   text: '✔ [Phase 4/4] Sector #1 Priority: Arang (B-1) — 869.2 ha High Deficient (75.3%).' },
  { delay: 4200, type: 'accent',    text: '✔ [Phase 4/4] Village agronomic prescriptions & executive report auto-generated.' },
  { delay: 4600, type: 'blank',     text: '' },
  { delay: 4800, type: 'info',      text: `ℹ [Pipeline Summary] Wall-to-wall processing completed cleanly in ${METRICS.runtimeSec.toFixed(1)} seconds.` },
  { delay: 5200, type: 'highlight', text: 'Success! SoilGuard-CG telemetry execution completed (100% Offline Cache).' },
  { delay: 5600, type: 'dim',       text: 'You may now inspect generated rasters in outputs/ or launch Next.js Dashboard.' },
];

export default function TerminalSection() {
  const [visibleCount, setVisibleCount] = useState<number>(0);
  const [running, setRunning] = useState<boolean>(false);
  const [copied, setCopied]   = useState<boolean>(false);
  const CMD = 'python soilguard-cg/src/run_full_demo.py';

  useEffect(() => {
    // Auto-run animation on mount
    runDemo();
  }, []);

  const runDemo = () => {
    setRunning(true);
    setVisibleCount(0);

    LOGS.forEach((line, index) => {
      setTimeout(() => {
        setVisibleCount(index + 1);
        if (index === LOGS.length - 1) {
          setRunning(false);
        }
      }, line.delay);
    });
  };

  const copy = () => {
    navigator.clipboard.writeText(CMD).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <section id="terminal" className="py-16 bg-[#06090f] section-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="max-w-2xl">
            <p className="eyebrow eyebrow-emerald mb-3">Terminal-Native Reproducibility</p>
            <h2 className="section-title mb-4">
              Single Command.<br className="hidden md:block"/>
              <span className="text-[#10b981]"> Full Pipeline. Offline.</span>
            </h2>
            <p className="section-body">
              The entire SoilGuard-CG pipeline (data loading, spectral index computation, ML training, risk mapping, zonal analytics, and executive report generation) executes from a single terminal command in ~41 seconds with zero internet connectivity.
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

        {/* Real CLI Animated Terminal Window */}
        <div className="terminal-window relative overflow-hidden bg-[#040810] border border-emerald-500/20 rounded-2xl shadow-2xl">
          
          {/* Terminal Bar */}
          <div className="px-4 py-3 bg-[#080e1a] border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              <span className="font-mono text-xs text-[#8ba3cc]">
                bash — soilguard@COSINE-RAIPUR:~/soilguard-cg
              </span>
            </div>
            <div className="flex items-center gap-3">
              {running && <span className="live-dot" />}
              <span className="badge badge-emerald">100% OFFLINE</span>
            </div>
          </div>

          {/* Terminal Content Body */}
          <div className="p-6 font-mono text-xs sm:text-[13px] leading-relaxed min-h-[380px] bg-[#040810] space-y-2">
            {LOGS.slice(0, visibleCount).map((log, index) => {
              if (log.type === 'blank') return <div key={index} className="h-2" />;

              return (
                <div key={index} className="flex items-start gap-2 animate-fade-in">
                  {log.type === 'command' && (
                    <span className="text-[#00d4ff] font-bold">{log.text}</span>
                  )}
                  {log.type === 'success' && (
                    <span className="text-emerald-400 font-medium">{log.text}</span>
                  )}
                  {log.type === 'info' && (
                    <span className="text-sky-400 font-semibold">{log.text}</span>
                  )}
                  {log.type === 'accent' && (
                    <span className="text-cyan-300">{log.text}</span>
                  )}
                  {log.type === 'highlight' && (
                    <span className="text-emerald-300 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      {log.text}
                    </span>
                  )}
                  {log.type === 'dim' && (
                    <span className="text-slate-400">{log.text}</span>
                  )}
                </div>
              );
            })}

            {/* Blinking Cursor at the end */}
            <div className="flex items-center gap-1.5 pt-1">
              <span className="text-emerald-400 font-bold">$</span>
              <span className="w-2 h-4 bg-emerald-400 animate-pulse inline-block align-middle" />
            </div>
          </div>

          {/* Terminal Footer Info */}
          <div className="px-6 py-3 bg-[#080e1a] border-t border-white/10 flex items-center justify-between text-xs font-mono text-[#5e7aa8]">
            <span>Python 3.10+ · scikit-learn · rasterio · STAC</span>
            <span>{visibleCount > 0 ? `${visibleCount}/${LOGS.length} CLI Steps` : 'Click ▶ RUN DEMO'}</span>
          </div>
        </div>

        {/* Command shortcut cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: 'Phase 2 — Spectral Maps',     cmd: 'python soilguard-cg/src/run_phase2.py' },
            { label: 'Phase 3 — Risk Score Map',    cmd: 'python soilguard-cg/src/run_phase3.py' },
            { label: 'Phase 4 — Zonal + Report',    cmd: 'python soilguard-cg/src/run_phase4.py' },
            { label: 'Full Pipeline (All Phases)',   cmd: 'python soilguard-cg/src/run_full_demo.py' },
          ].map(item => (
            <div
              key={item.label}
              className="rounded-xl p-4 flex items-center gap-4 bg-[#0a0f1a] border border-white/10"
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
