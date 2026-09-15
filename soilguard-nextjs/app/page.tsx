'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Satellite,
  Layers,
  Globe,
  Sparkles,
  ShieldCheck,
  Activity,
  AlertTriangle,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  Database,
  Search,
  Split,
  SlidersHorizontal,
  Terminal,
  Cpu,
  Award,
  Zap,
  Copy,
  Check,
  Sun,
  Moon,
  ChevronRight,
  BarChart2,
  Leaf,
  DollarSign,
  Droplets,
  HelpCircle,
  FileText
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
  Line
} from 'recharts';

import { DISTRICTS, STATEWIDE_AGGREGATES, DistrictSummary } from '@/lib/districts-data';

// Feature Importance for Pure-SOC Model
const FEATURE_IMPORTANCE_DATA = [
  { feature: 'B11 (SWIR-1)', importance: 28.4, desc: 'Carbon Absorption' },
  { feature: 'BSI (Bare Soil)', importance: 21.2, desc: 'Soil Fraction' },
  { feature: 'NDVI (Vegetation)', importance: 16.8, desc: 'Biomass Mask' },
  { feature: 'B08 (NIR)', importance: 14.1, desc: 'Cellular Scattering' },
  { feature: 'B12 (SWIR-2)', importance: 11.5, desc: 'Clay Mineral Absorption' },
  { feature: 'Clay Index', importance: 8.0, desc: 'Texture Proxy' }
];

export default function ModernLandingPage() {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [activeDistrictId, setActiveDistrictId] = useState<string>('raipur');
  const [splitPos, setSplitPos] = useState<number>(50);
  const [copiedCurl, setCopiedCurl] = useState<boolean>(false);

  // Quick Landing Page Simulator State
  const [simFym, setSimFym] = useState<number>(8);
  const [simBiochar, setSimBiochar] = useState<number>(2);

  // Active Selected District
  const activeDistrict = useMemo(() => {
    return DISTRICTS.find(d => d.name.toLowerCase() === activeDistrictId.toLowerCase()) || DISTRICTS[0];
  }, [activeDistrictId]);

  // Reactive Mini-Simulator Trajectory
  const miniTrajectory = useMemo(() => {
    const baseSOC = activeDistrict.mean_soc_dg_kg / 100;
    const gain = (simFym * 0.024) + (simBiochar * 0.048) + 0.032;
    const data = [];
    let current = baseSOC;
    let bau = baseSOC;
    for (let y = 0; y <= 5; y++) {
      data.push({
        year: `Yr ${y}`,
        soc: parseFloat(current.toFixed(3)),
        bau: parseFloat(Math.max(0.20, bau).toFixed(3))
      });
      current += gain * Math.pow(0.92, y);
      bau -= 0.012;
    }
    return data;
  }, [activeDistrict, simFym, simBiochar]);

  const copyCurl = () => {
    navigator.clipboard.writeText('curl -X GET "http://localhost:8000/api/v1/districts/raipur/advisory" -H "accept: application/json"');
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${isDarkMode ? 'bg-slate-950 text-slate-100 dark' : 'bg-slate-50 text-slate-900'}`}>
      {/* ── TOP STICKY NAVBAR ── */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-sm">
              <Satellite className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">SoilGuard-CG</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  ISRO NRSC × COSINE
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                Sentinel-2 &amp; CloudGap Soil Organic Carbon Intelligence Platform
              </p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-600 dark:text-slate-300">
            <a href="#overview" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">Overview</a>
            <a href="#problem" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">The Problem</a>
            <a href="#pillars" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">Core Pillars</a>
            <a href="#benchmark" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">Benchmark</a>
            <a href="#pipeline" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">Methodology</a>
          </nav>

          <div className="flex items-center gap-3">
            {/* Theme Switcher */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Toggle theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>

            {/* Direct Link to Workbench */}
            <Link
              href="/alternative"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition active:scale-[0.98]"
            >
              <span>Launch Workbench</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO SECTION (ABOVE THE FOLD) ── */}
      <section id="overview" className="relative overflow-hidden pt-12 pb-20 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Eyebrow + Headlines */}
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              <Award className="w-3.5 h-3.5 text-indigo-500" />
              <span>National Space Day 2026 Finalist · COSINE NIT Raipur × NRSC / ISRO</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.12]">
              Sentinel-2 &amp; SAR Satellite Intelligence for Topsoil Health
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
              Mapping Soil Organic Carbon (SOC) degradation at 10-meter ground resolution across all 33 districts of Chhattisgarh. Eliminating Kharif monsoon cloud blindness with deep SAR-guided inpainting and certified machine learning.
            </p>

            {/* Dual CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/alternative"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md hover:shadow-indigo-500/20 transition active:scale-[0.98]"
              >
                <span>Launch Statewide Workbench</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <a
                href="http://localhost:8000/docs"
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-medium rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-700 dark:text-slate-200"
              >
                <Database className="w-4 h-4 text-indigo-500" />
                <span>FastAPI Swagger Docs</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </a>
            </div>

            {/* Authority & Credibility Bar */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200/60 dark:border-slate-800/80">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>10m Sentinel-2 MSI BOA Resolution</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>100% Kharif Cloud Penetration (Sentinel-1 SAR)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>5×5 Spatial Block CV Certified (R² = 0.4076)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>All 33 Chhattisgarh Districts Calibrated</span>
              </div>
            </div>
          </div>

          {/* Hero Interactive Preview Card */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl">
            <div className="bg-slate-100 dark:bg-slate-800/80 px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                <span className="ml-2 text-xs font-mono text-slate-500">soilguard-cg · operational_workbench_v2.5</span>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                ● Live 10m Ground Observation
              </span>
            </div>

            <div className="p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-500 uppercase">Statewide Coverage</span>
                <div className="text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">135,192 km²</div>
                <p className="text-xs text-slate-500">13.85M ha total land across 33 districts</p>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-500 uppercase">Cloud Penetration</span>
                <div className="text-2xl font-extrabold text-emerald-500 tabular-nums">100.0%</div>
                <p className="text-xs text-slate-500">CloudGap ST-DIP SAR-Guided Reconstruction</p>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-500 uppercase">Mean Topsoil SOC</span>
                <div className="text-2xl font-extrabold text-amber-500 tabular-nums">0.49% Deficit</div>
                <p className="text-xs text-slate-500">Target threshold &ge; 0.75% for organic resilience</p>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-500 uppercase">Critical Hotspots</span>
                <div className="text-2xl font-extrabold text-rose-500 tabular-nums">5,487.1 ha</div>
                <p className="text-xs text-slate-500">Tier-1 urgent biochar &amp; green manure dosing</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 1: THE PROBLEM ("WHY TRADITIONAL METHODS FAIL") ── */}
      <section id="problem" className="py-20 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              The Agronomic Crisis
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Why Indian Topsoil Health is Blind to Traditional Monitoring
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
              India's breadbaskets face chronic carbon loss. Traditional laboratory sampling is too slow and sparse, while standard optical satellites fail when farmers need them most.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Crisis Card 1 */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/60 flex items-center justify-center text-rose-600 dark:text-rose-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">The Kharif Cloud Blindspot</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                During the critical Kharif monsoon season, optical satellites (Sentinel-2, Landsat) are blocked by <strong>80–90% cloud cover</strong> for 4 consecutive months. Farmers apply chemical fertilizers without knowing their real topsoil capacity.
              </p>
              <div className="pt-2 text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                <span>SoilGuard Solution:</span>
                <span className="text-slate-700 dark:text-slate-300">Sentinel-1 C-band SAR dual-polarization penetrates 100% of clouds.</span>
              </div>
            </div>

            {/* Crisis Card 2 */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Extreme Sampling Sparsity</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Physical Soil Health Cards collect <strong>1 sample per 10 hectares once every 3 years</strong>. Soil organic carbon varies by up to 300% across a single 2-hectare field, rendering coarse recommendations inaccurate.
              </p>
              <div className="pt-2 text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <span>SoilGuard Solution:</span>
                <span className="text-slate-700 dark:text-slate-300">Continuous 10-meter ground pixel resolution across 13.85M hectares.</span>
              </div>
            </div>

            {/* Crisis Card 3 */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Severe Carbon Oxidation</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Intensive paddy monoculture and summer soil baking have depleted statewide SOC to <strong>0.49%</strong> (below the 0.75% resilience threshold), collapsing cation exchange capacity and microbial diversity.
              </p>
              <div className="pt-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                <span>SoilGuard Solution:</span>
                <span className="text-slate-700 dark:text-slate-300">Targeted FYM, Biochar, and Sesbania green-manure dosing algorithms.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: THE 4 CORE INNOVATION PILLARS (BENTO GRID) ── */}
      <section id="pillars" className="py-20 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Technological Breakthroughs
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Engineered for Scientific Rigor &amp; Operational Scale
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
              Combining Deep Image Prior (DIP), radar-optical fusion, and spatial block cross-validation to establish the new benchmark for Earth Observation.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Bento Card 1: CloudGap Inpainting (7 cols) */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                    <Sparkles className="w-4 h-4" />
                    Pillar 1: Deep Inpainting
                  </div>
                  <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                    PSNR: 34.56 dB · SSIM: 0.942
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  CloudGap ST-DIP: 100% Kharif Cloud Penetration
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-1">
                  Using Sentinel-1 VV/VH synthetic aperture radar as structural priors, our unsupervised Spatial-Temporal Deep Image Prior inlays occluded Sentinel-2 bands without hallucinating synthetic artifacts.
                </p>
              </div>

              {/* Interactive Split Curtain Viewer right on the Landing Page */}
              <div className="relative w-full h-72 rounded-xl overflow-hidden select-none border border-slate-200 dark:border-slate-800">
                {/* Clean Inpainted Base */}
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: "url('/maps/clean_false_color.png')" }}
                >
                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-slate-900/80 text-white text-[11px] font-semibold backdrop-blur-sm">
                    Inpainted Surface (CloudGap)
                  </div>
                </div>

                {/* Occluded Overlayer */}
                <div
                  className="absolute inset-y-0 left-0 overflow-hidden bg-cover bg-center border-r-2 border-indigo-500 shadow-2xl"
                  style={{
                    width: `${splitPos}%`,
                    backgroundImage: "url('/maps/false_color_composite.png')"
                  }}
                >
                  <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-slate-900/80 text-white text-[11px] font-semibold backdrop-blur-sm">
                    80% Kharif Cloud Occlusion
                  </div>
                </div>

                {/* Split Drag Range */}
                <input
                  type="range"
                  min="5"
                  max="95"
                  value={splitPos}
                  onChange={e => setSplitPos(parseInt(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-slate-900 shadow-lg flex items-center justify-center pointer-events-none z-10 text-xs font-bold"
                  style={{ left: `${splitPos}%` }}
                >
                  <Split className="w-4 h-4" />
                </div>
              </div>

              <div className="flex justify-between text-[11px] text-slate-500">
                <span>← Drag to inspect raw monsoon cloud vs. SAR-inpainted 10m surface →</span>
                <span className="font-mono">{splitPos}% Split</span>
              </div>
            </div>

            {/* Bento Card 2: Pure-SOC ML (5 cols) */}
            <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                    <Cpu className="w-4 h-4" />
                    Pillar 2: Decoupled ML
                  </div>
                  <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                    SBCV R² = 0.4076
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Pure-SOC Spatial Model
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-1">
                  Decoupled pure Soil Organic Carbon regressor trained with 5×5 Spatial Block Cross-Validation to eliminate spatial autocorrelation leakage.
                </p>
              </div>

              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={FEATURE_IMPORTANCE_DATA} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                    <XAxis type="number" unit="%" tick={{ fontSize: 10 }} domain={[0, 35]} />
                    <YAxis dataKey="feature" type="category" tick={{ fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
                        borderColor: isDarkMode ? '#334155' : '#e2e8f0',
                        borderRadius: '8px',
                        fontSize: '11px'
                      }}
                    />
                    <Bar dataKey="importance" fill="#6366f1" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg text-xs text-slate-600 dark:text-slate-400">
                <strong>Physics-Grounded Feature Dominance:</strong> SWIR-1 (28.4%) and BSI (21.2%) capture true organic carbon absorption troughs, ignoring surface moisture noise.
              </div>
            </div>

            {/* Bento Card 3: 33-District Quick Explorer (7 cols) */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  <Globe className="w-4 h-4" />
                  Pillar 3: Statewide Calibration
                </div>
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  33 Districts
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Vernacular Agro-Climatic Intelligence
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Tailored to Chhattisgarh's 4 indigenous soil classes: <strong>Kanhar</strong> (Vertisols), <strong>Dorsa</strong> (Inceptisols), <strong>Matasi</strong> (Alfisols), and <strong>Bhata</strong> (Entisols). Test any district below:
              </p>

              {/* District Switcher Tabs */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {['Raipur', 'Bemetara', 'Durg', 'Bastar', 'Bilaspur', 'Dantewada'].map(name => (
                  <button
                    key={name}
                    onClick={() => setActiveDistrictId(name)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                      activeDistrictId.toLowerCase() === name.toLowerCase()
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>

              {/* Active District Quick Dossier Card */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div>
                  <span className="text-[11px] text-slate-500 uppercase font-semibold">Vernacular Soil</span>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">{activeDistrict.vernacular_soil}</div>
                  <span className="text-[10px] text-slate-400">({activeDistrict.soil_order})</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 uppercase font-semibold">Baseline SOC</span>
                  <div className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">
                    {(activeDistrict.mean_soc_dg_kg / 100).toFixed(2)}%
                  </div>
                  <span className="text-[10px] text-rose-500">Deficit</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 uppercase font-semibold">Clay Content</span>
                  <div className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">
                    {(activeDistrict.mean_clay_g_kg / 10).toFixed(1)}%
                  </div>
                  <span className="text-[10px] text-slate-400">Texture Proxy</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 uppercase font-semibold">Urgency Tier</span>
                  <div className="text-xs font-bold text-rose-500 mt-0.5">{activeDistrict.urgency_level}</div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-900/60 text-xs text-indigo-900 dark:text-indigo-200">
                <strong>Certified Intervention:</strong> {activeDistrict.secondary_advisory}
              </div>
            </div>

            {/* Bento Card 4: REST API & Microservice (5 cols) */}
            <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                    <Zap className="w-4 h-4" />
                    Pillar 4: Production REST API
                  </div>
                  <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                    &lt; 50ms Latency
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  FastAPI Operational Gateway
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mt-1">
                  Zero-configuration microservice architecture with auto-generated OpenAPI documentation and ready-to-integrate endpoints for national farmer advisory applications.
                </p>
              </div>

              {/* cURL Snippet Box */}
              <div className="rounded-xl bg-slate-950 p-3.5 border border-slate-800 font-mono text-xs text-slate-300 relative">
                <div className="flex items-center justify-between text-[11px] text-slate-500 pb-2 mb-2 border-b border-slate-800">
                  <span>GET /api/v1/districts/raipur/advisory</span>
                  <button
                    onClick={copyCurl}
                    className="inline-flex items-center gap-1 text-slate-400 hover:text-white transition"
                  >
                    {copiedCurl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCurl ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="overflow-x-auto text-[11px] text-emerald-400">
{`{
  "district": "Raipur",
  "baseline_soc_pct": 0.62,
  "status": "CRITICAL_DEFICIT",
  "certified_dosing": {
    "fym_t_ha": 8.0,
    "biochar_t_ha": 2.0,
    "green_manuring": "Sesbania"
  }
}`}
                </pre>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-500">Includes 19/19 passing automated API tests</span>
                <Link
                  href="/alternative"
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
                >
                  Live Telemetry Cockpit
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 3: HEAD-TO-HEAD COMPARISON BENCHMARK ── */}
      <section id="benchmark" className="py-20 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Comparative Superiority
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Why SoilGuard-CG Outperforms Existing Alternatives
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
              Side-by-side benchmark contrasting traditional Soil Health Cards, generic vegetation indices, and SoilGuard-CG.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="py-4 px-5">Capability / Benchmark</th>
                    <th className="py-4 px-5">Traditional Soil Health Cards</th>
                    <th className="py-4 px-5">Standard Satellite NDVI</th>
                    <th className="py-4 px-5 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400">
                      SoilGuard-CG + CloudGap
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  <tr>
                    <td className="py-4 px-5 font-semibold text-slate-900 dark:text-white">Spatial Resolution</td>
                    <td className="py-4 px-5 text-slate-500">1 point per 10 ha (Very Coarse)</td>
                    <td className="py-4 px-5 text-slate-500">250m – 1km (Regional)</td>
                    <td className="py-4 px-5 font-bold text-emerald-600 dark:text-emerald-400 bg-indigo-50/30 dark:bg-indigo-950/20">
                      10-Meter Ground Truth
                    </td>
                  </tr>

                  <tr>
                    <td className="py-4 px-5 font-semibold text-slate-900 dark:text-white">Monsoon Cloud Resilience</td>
                    <td className="py-4 px-5 text-slate-500">N/A (Field Visits Halted)</td>
                    <td className="py-4 px-5 text-rose-500">0% (Blinded by 80% Clouds)</td>
                    <td className="py-4 px-5 font-bold text-emerald-600 dark:text-emerald-400 bg-indigo-50/30 dark:bg-indigo-950/20">
                      100.0% (SAR-Guided ST-DIP)
                    </td>
                  </tr>

                  <tr>
                    <td className="py-4 px-5 font-semibold text-slate-900 dark:text-white">Carbon Isolation Purity</td>
                    <td className="py-4 px-5 text-slate-500">Walkley-Black Lab (Aggregated)</td>
                    <td className="py-4 px-5 text-rose-500">Confounded by Crop Canopy</td>
                    <td className="py-4 px-5 font-bold text-emerald-600 dark:text-emerald-400 bg-indigo-50/30 dark:bg-indigo-950/20">
                      Pure-SOC Decoupled SBCV
                    </td>
                  </tr>

                  <tr>
                    <td className="py-4 px-5 font-semibold text-slate-900 dark:text-white">Advisory Turnaround Time</td>
                    <td className="py-4 px-5 text-slate-500">90 – 180 Days</td>
                    <td className="py-4 px-5 text-slate-500">Uncalibrated Imagery</td>
                    <td className="py-4 px-5 font-bold text-emerald-600 dark:text-emerald-400 bg-indigo-50/30 dark:bg-indigo-950/20">
                      Real-Time REST API (&lt; 50 ms)
                    </td>
                  </tr>

                  <tr>
                    <td className="py-4 px-5 font-semibold text-slate-900 dark:text-white">Indigenous Soil Classification</td>
                    <td className="py-4 px-5 text-slate-500">Generic Macro-Formulas</td>
                    <td className="py-4 px-5 text-slate-500">None</td>
                    <td className="py-4 px-5 font-bold text-emerald-600 dark:text-emerald-400 bg-indigo-50/30 dark:bg-indigo-950/20">
                      Kanhar, Dorsa, Matasi &amp; Bhata
                    </td>
                  </tr>

                  <tr>
                    <td className="py-4 px-5 font-semibold text-slate-900 dark:text-white">Cost per 1,000 Hectares</td>
                    <td className="py-4 px-5 text-slate-500">₹85,000+ (Sampling + Lab)</td>
                    <td className="py-4 px-5 text-slate-500">Commercial Subscriptions</td>
                    <td className="py-4 px-5 font-bold text-emerald-600 dark:text-emerald-400 bg-indigo-50/30 dark:bg-indigo-950/20">
                      ₹0 (Open Sentinel-1/2 Pipeline)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 4: SCIENTIFIC PIPELINE & ARCHITECTURE ── */}
      <section id="pipeline" className="py-20 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              End-to-End Methodology
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              From Satellite Constellation to Farmer Action
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
              A 4-stage pipeline integrating European Space Agency constellations with Indian Council of Agricultural Research (ICAR) ground truth.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold font-mono text-sm">
                01
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Constellation Ingestion</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Automated fetching of Sentinel-2 Bottom-of-Atmosphere (BOA) L2A multispectral tiles + Sentinel-1 C-band SAR dual-polarization (VV/VH).
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold font-mono text-sm">
                02
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">CloudGap DIP Inpainting</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                SAR structural priors guide unsupervised deep convolution to reconstruct cloud-occluded pixels with 34.56 dB peak signal-to-noise ratio.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold font-mono text-sm">
                03
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Pure-SOC Inference</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Random Forest calibrated via 5×5 Spatial Block Cross-Validation predicts topsoil organic carbon without spatial overfitting.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold font-mono text-sm">
                04
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Zonal Advisory Dispatch</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Calculates precise FYM, biochar, and green manuring dosing calibrated to the district's indigenous soil texture (Kanhar, Dorsa, etc.).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 5: LIVE REGENERATIVE SIMULATOR TEASER ── */}
      <section className="py-20 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Interactive Impact Calculator
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Simulate 5-Year Carbon Recovery in Real Time
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
              Adjust organic dosing sliders to project topsoil carbon trajectory and carbon credit revenue for {activeDistrict.name}.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span>Farmyard Manure (FYM)</span>
                  <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">{simFym} t/ha</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="15"
                  value={simFym}
                  onChange={e => setSimFym(parseInt(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span>Pyrogenic Biochar Enrichment</span>
                  <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">{simBiochar} t/ha</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="5"
                  value={simBiochar}
                  onChange={e => setSimBiochar(parseInt(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
                <div className="text-xs text-slate-500 font-medium">Estimated 5-Year Sequestration:</div>
                <div className="text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                  +{((miniTrajectory[5].soc - miniTrajectory[0].soc) * 36.7).toFixed(1)} t CO₂e / ha
                </div>
                <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  Potential Carbon Value: ₹{Math.round((miniTrajectory[5].soc - miniTrajectory[0].soc) * 36.7 * 1850).toLocaleString('en-IN')} / ha
                </div>
              </div>

              <Link
                href="/alternative"
                className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                <span>Open Full Agri-Dosing Lab in Workbench</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="lg:col-span-7 h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={miniTrajectory} margin={{ top: 10, right: 20, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                  <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0.2, 0.9]} tick={{ fontSize: 11 }} unit="%" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
                      borderColor: isDarkMode ? '#334155' : '#e2e8f0',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Area type="monotone" dataKey="soc" name="Projected SOC (%)" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} strokeWidth={2.5} />
                  <Line type="monotone" dataKey="bau" name="Business As Usual" stroke="#ef4444" strokeWidth={1.5} strokeDasharray="3 3" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 6: HIGH-CONVERTING CLOSING CTA ── */}
      <section className="py-20 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl p-8 sm:p-12 text-center text-white space-y-6 shadow-2xl relative overflow-hidden border border-indigo-800">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Experience the Future of Indian Earth Observation
            </h2>
            <p className="text-indigo-200 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
              Explore the interactive 33-district geospatial explorer, test the regenerative dosing simulator, and inspect live REST telemetry.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/alternative"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold rounded-xl bg-white text-indigo-950 hover:bg-slate-100 shadow-lg transition active:scale-[0.98]"
              >
                <span>Launch Operational Workbench</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-medium rounded-xl border border-indigo-400/30 hover:bg-indigo-800/40 transition text-indigo-100"
              >
                <span>Main Overview Dashboard</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-12 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Satellite className="w-4 h-4 text-indigo-500" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">SoilGuard-CG</span>
            <span>· National Space Day 2026 Ideathon · COSINE NIT Raipur × NRSC / ISRO</span>
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <Link href="/alternative" className="hover:text-indigo-600">Workbench</Link>
            <Link href="/dashboard" className="hover:text-indigo-600">Dashboard</Link>
            <a href="http://localhost:8000/docs" target="_blank" rel="noreferrer" className="hover:text-indigo-600">
              API Docs
            </a>
            <span>MIT License</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
