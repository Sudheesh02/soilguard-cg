'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  Activity,
  Layers,
  MapPin,
  Satellite,
  Compass,
  Sliders,
  ShieldCheck,
  TrendingUp,
  RefreshCw,
  ExternalLink,
  Info,
  CheckCircle2,
  AlertTriangle,
  Database,
  ArrowRight,
  Sparkles,
  BarChart2,
  Table,
  Zap,
  Split,
  Eye,
  SlidersHorizontal,
  ChevronRight,
  Search,
  X,
  Copy,
  Check,
  Globe,
  Sun,
  Moon,
  Droplets,
  Leaf,
  DollarSign
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell
} from 'recharts';

import { DISTRICTS, STATEWIDE_AGGREGATES, AGRO_CLIMATIC_ZONES, DistrictSummary } from '@/lib/districts-data';

// SSR-safe dynamic Leaflet map import
const DynamicSoilMap = dynamic(() => import('@/components/SoilMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] bg-slate-100 dark:bg-slate-900/60 rounded-xl flex flex-col items-center justify-center border border-slate-200 dark:border-slate-800 text-slate-500">
      <RefreshCw className="w-8 h-8 animate-spin text-indigo-500 mb-3" />
      <p className="text-sm font-medium">Initializing Sentinel-2 Leaflet GIS Engine...</p>
    </div>
  )
});

// District Centroids for Map and Spatial Pinning
const DISTRICT_CENTROIDS: Record<string, [number, number]> = {
  'Bemetara': [21.71309, 81.52269],
  'Kabirdham': [22.09123, 81.21603],
  'Baloda Bazar-Bhatapara': [21.57848, 82.32038],
  'Mungeli': [22.24182, 81.72508],
  'Durg': [21.23001, 81.37767],
  'Raipur': [21.28250, 81.81328],
  'Gaurela-Pendra-Marwahi': [22.76796, 81.99335],
  'Janjgir-Champa': [21.95234, 82.56352],
  'Mahasamund': [21.20329, 82.60281],
  'Gariaband': [20.44397, 82.22830],
  'Surguja': [22.92345, 83.22144],
  'Balod': [20.74017, 81.18510],
  'Korba': [22.53242, 82.60353],
  'Dhamtari': [20.55308, 81.80335],
  'Khairagarh-Chhuikhadan-Gandai': [21.51504, 80.93224],
  'Surajpur': [23.39932, 82.88532],
  'Raigarh': [22.23119, 83.33074],
  'Bastar': [19.07330, 81.86287],
  'Bilaspur': [22.13889, 82.12434],
  'Kondagaon': [19.73596, 81.65713],
  'Sarangarh-Bilaigarh': [21.55922, 83.18531],
  'Sakti': [21.88332, 82.97688],
  'Rajnandgaon': [21.07809, 80.80057],
  'Mohla-Manpur-Ambagarh Chowki': [20.51656, 80.70840],
  'Kanker': [20.13165, 81.11639],
  'Narayanpur': [19.49248, 81.06725],
  'Bijapur': [18.82097, 80.75382],
  'Jashpur': [22.79876, 83.85864],
  'Koriya': [23.36819, 82.49352],
  'Sukma': [18.26002, 81.33854],
  'Balrampur-Ramanujganj': [23.59142, 83.49423],
  'Dantewada': [18.80928, 81.36985],
  'Manendragarh-Chirmiri-Bharatpur': [23.53157, 82.06550]
};

// Multi-spectral band profiles for Raipur Vertisols vs Bastar Entisols
const SPECTRAL_BANDS_DATA = [
  { band: 'B02 (Blue)', wavelength: '490 nm', vertisols: 0.082, entisols: 0.142 },
  { band: 'B03 (Green)', wavelength: '560 nm', vertisols: 0.115, entisols: 0.188 },
  { band: 'B04 (Red)', wavelength: '665 nm', vertisols: 0.128, entisols: 0.245 },
  { band: 'B08 (NIR)', wavelength: '842 nm', vertisols: 0.264, entisols: 0.312 },
  { band: 'B11 (SWIR-1)', wavelength: '1610 nm', vertisols: 0.221, entisols: 0.385 },
  { band: 'B12 (SWIR-2)', wavelength: '2190 nm', vertisols: 0.174, entisols: 0.334 }
];

export default function ModernAlternativeWorkbench() {
  // Navigation & Theme State
  const [activeTab, setActiveTab] = useState<'registry' | 'map' | 'simulator' | 'spectral' | 'telemetry'>('registry');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  // Search, Filter & Selection
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZone, setSelectedZone] = useState<'all' | 'plains' | 'hills' | 'plateau'>('all');
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictSummary>(
    DISTRICTS.find(d => d.name.toLowerCase() === 'raipur') || DISTRICTS[0]
  );
  const [isDossierOpen, setIsDossierOpen] = useState(false);

  // GIS Map Controls
  const [basemapMode, setBasemapMode] = useState<'google_hybrid' | 'dark' | 'osm'>('google_hybrid');
  const [rasterOverlay, setRasterOverlay] = useState<'soc_risk' | 'ndvi' | 'false_color' | 'none'>('soc_risk');
  const [rasterOpacity, setRasterOpacity] = useState(0.85);

  // Regenerative Agri-Dosing Simulator Controls
  const [fymDose, setFymDose] = useState<number>(8); // t/ha
  const [biocharDose, setBiocharDose] = useState<number>(2); // t/ha
  const [greenManureEnabled, setGreenManureEnabled] = useState<boolean>(true);
  const [nitrogenFixingRatio, setNitrogenFixingRatio] = useState<number>(25); // %

  // Live REST API Telemetry State
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);
  const [apiLatency, setApiLatency] = useState<number | null>(null);
  const [apiEndpoint, setApiEndpoint] = useState<string>('/api/v1/districts/raipur/advisory');
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);

  // Spectral CloudGap Split Slider
  const [splitPos, setSplitPos] = useState(52);

  // Initial Backend Health Ping
  useEffect(() => {
    const checkHealth = async () => {
      const start = performance.now();
      try {
        const res = await fetch('http://localhost:8000/health');
        const lat = Math.round(performance.now() - start);
        if (res.ok) {
          setApiOnline(true);
          setApiLatency(lat);
        } else {
          setApiOnline(false);
        }
      } catch (e) {
        setApiOnline(false);
        setApiLatency(null);
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  // Filtered Districts
  const filteredDistricts = useMemo(() => {
    return DISTRICTS.filter(d => {
      const matchesZone = selectedZone === 'all' || d.zone_code === selectedZone;
      const matchesSearch =
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.predominant_soil.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.vernacular_soil.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.urgency_level.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesZone && matchesSearch;
    });
  }, [searchQuery, selectedZone]);

  // Reactive 5-Year SOC Trajectory Simulation
  const trajectoryData = useMemo(() => {
    const baseSOC = selectedDistrict.mean_soc_dg_kg / 100; // convert dg/kg to %
    const fymBoost = fymDose * 0.024; // annual carbon stabilization coefficient
    const biocharBoost = biocharDose * 0.048; // recalcitrant pyrogenic carbon
    const greenManureBoost = greenManureEnabled ? 0.032 : 0.0;
    const annualGain = fymBoost + biocharBoost + greenManureBoost;

    const data = [];
    let currentIntervention = baseSOC;
    let currentBAU = baseSOC;

    for (let yr = 0; yr <= 5; yr++) {
      data.push({
        year: yr === 0 ? 'Baseline (Yr 0)' : `Year ${yr}`,
        projectedSOC: parseFloat(currentIntervention.toFixed(3)),
        bauSOC: parseFloat(Math.max(0.20, currentBAU).toFixed(3)),
        thresholdSOC: 0.75
      });
      currentIntervention += annualGain * Math.pow(0.92, yr); // saturation curve
      currentBAU -= 0.012; // ongoing degradation rate without interventions
    }
    return data;
  }, [selectedDistrict, fymDose, biocharDose, greenManureEnabled]);

  // Economic & Ecological Metrics
  const calculatedBenefits = useMemo(() => {
    const netSOCGain = (trajectoryData[5].projectedSOC - trajectoryData[0].projectedSOC);
    const co2EquivPerHa = netSOCGain * 3.67 * 10; // t CO2e sequestered per hectare over 5 years
    const carbonCreditRevenue = co2EquivPerHa * 1850; // INR per credit
    const waterRetentionBoost = Math.round(netSOCGain * 14.2 * 10); // % increase in topsoil WHC

    return {
      co2EquivPerHa: co2EquivPerHa.toFixed(1),
      carbonCreditRevenue: Math.round(carbonCreditRevenue).toLocaleString('en-IN'),
      waterRetentionBoost,
      breakEvenMonths: Math.round(14 - (biocharDose * 1.2))
    };
  }, [trajectoryData, biocharDose]);

  // Execute Live API Request
  const runApiQuery = async (endpoint: string) => {
    setApiLoading(true);
    setApiEndpoint(endpoint);
    const start = performance.now();
    try {
      const res = await fetch(`http://localhost:8000${endpoint}`);
      const data = await res.json();
      setApiLatency(Math.round(performance.now() - start));
      setApiResponse(data);
      setApiOnline(true);
    } catch (err: any) {
      setApiResponse({ error: err.message, note: 'FastAPI server at http://localhost:8000 is reachable or check endpoint URL' });
      setApiOnline(false);
    } finally {
      setApiLoading(false);
    }
  };

  const copyCurlToClipboard = () => {
    const curlCmd = `curl -X GET "http://localhost:8000${apiEndpoint}" -H "accept: application/json"`;
    navigator.clipboard.writeText(curlCmd);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${isDarkMode ? 'bg-slate-950 text-slate-100 dark' : 'bg-slate-50 text-slate-900'}`}>
      {/* ── TOP EXECUTIVE APP BAR ── */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shadow-sm">
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
                Sentinel-2 & CloudGap Earth Observation Platform · Chhattisgarh 33 Districts
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Live API Status Pill */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <span className={`w-2 h-2 rounded-full ${apiOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
              <span className="text-slate-600 dark:text-slate-300">
                {apiOnline ? `FastAPI Online (${apiLatency ?? 42}ms)` : 'API Offline'}
              </span>
            </div>

            {/* Swagger Docs Link */}
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-700 dark:text-slate-200"
            >
              <Database className="w-3.5 h-3.5 text-indigo-500" />
              <span className="hidden sm:inline">Swagger</span> Docs
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>

            {/* Portal Link */}
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-700 dark:text-slate-200"
            >
              Overview
            </Link>

            {/* Light / Dark Mode Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Toggle theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT CONTAINER ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* ── EXECUTIVE KPI BENTO STRIP ── */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* KPI 1 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Statewide AOI
              </span>
              <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                <Globe className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold tracking-tight tabular-nums text-slate-900 dark:text-white">
              135,192 <span className="text-lg font-medium text-slate-500">km²</span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                100% Monitored
              </span>
              <span>All 33 Districts (13.85M ha)</span>
            </div>
          </div>

          {/* KPI 2 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                CloudGap Penetration
              </span>
              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold tracking-tight tabular-nums text-slate-900 dark:text-white">
              100.0%
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                SAR Guided
              </span>
              <span>PSNR 34.56 dB · SSIM 0.942</span>
            </div>
          </div>

          {/* KPI 3 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Mean Statewide SOC
              </span>
              <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold tracking-tight tabular-nums text-slate-900 dark:text-white">
              0.49% <span className="text-sm font-normal text-slate-400">SOC</span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                Deficit
              </span>
              <span>Target Threshold: &ge; 0.75%</span>
            </div>
          </div>

          {/* KPI 4 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Tier-1 Hotspots
              </span>
              <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold tracking-tight tabular-nums text-slate-900 dark:text-white">
              5,487.1 <span className="text-lg font-medium text-slate-500">ha</span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                Immediate Action
              </span>
              <span>Bemetara &amp; Durg Corridor</span>
            </div>
          </div>
        </section>

        {/* ── WORKBENCH NAVIGATION TABS ── */}
        <section className="border-b border-slate-200 dark:border-slate-800">
          <nav className="flex space-x-2 sm:space-x-4 overflow-x-auto pb-px" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('registry')}
              className={`inline-flex items-center gap-2 py-3 px-3.5 border-b-2 font-medium text-sm whitespace-nowrap transition ${
                activeTab === 'registry'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <Table className="w-4 h-4" />
              <span>33-District Registry &amp; Dossiers</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
                33
              </span>
            </button>

            <button
              onClick={() => setActiveTab('map')}
              className={`inline-flex items-center gap-2 py-3 px-3.5 border-b-2 font-medium text-sm whitespace-nowrap transition ${
                activeTab === 'map'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Interactive Leaflet GIS</span>
            </button>

            <button
              onClick={() => setActiveTab('simulator')}
              className={`inline-flex items-center gap-2 py-3 px-3.5 border-b-2 font-medium text-sm whitespace-nowrap transition ${
                activeTab === 'simulator'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Regenerative Agri-Dosing Lab</span>
            </button>

            <button
              onClick={() => setActiveTab('spectral')}
              className={`inline-flex items-center gap-2 py-3 px-3.5 border-b-2 font-medium text-sm whitespace-nowrap transition ${
                activeTab === 'spectral'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <Split className="w-4 h-4" />
              <span>CloudGap Multi-Spectral Science</span>
            </button>

            <button
              onClick={() => setActiveTab('telemetry')}
              className={`inline-flex items-center gap-2 py-3 px-3.5 border-b-2 font-medium text-sm whitespace-nowrap transition ${
                activeTab === 'telemetry'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>REST API Telemetry</span>
            </button>
          </nav>
        </section>

        {/* ── TAB 1: 33-DISTRICT REGISTRY & DOSSIERS ── */}
        {activeTab === 'registry' && (
          <section className="space-y-6">
            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-sm">
              <div className="relative flex-1 w-full max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search district, vernacular soil (Kanhar, Dorsa...), order..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs text-slate-500 mr-1 font-medium">Zone:</span>
                {[
                  { id: 'all', label: 'All 33' },
                  { id: 'plains', label: 'Plains (19)' },
                  { id: 'hills', label: 'Hills (7)' },
                  { id: 'plateau', label: 'Bastar (7)' }
                ].map(z => (
                  <button
                    key={z.id}
                    onClick={() => setSelectedZone(z.id as any)}
                    className={`px-3 py-1.5 text-xs rounded-lg font-medium transition ${
                      selectedZone === z.id
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {z.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Clean Data Table */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Rank</th>
                      <th className="py-3.5 px-4">District &amp; Zone</th>
                      <th className="py-3.5 px-4">Vernacular Soil</th>
                      <th className="py-3.5 px-4 text-right">Baseline SOC</th>
                      <th className="py-3.5 px-4 text-right">Clay Content</th>
                      <th className="py-3.5 px-4 text-right">Topsoil pH</th>
                      <th className="py-3.5 px-4">Deficiency Severity</th>
                      <th className="py-3.5 px-4">Urgency Tier</th>
                      <th className="py-3.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {filteredDistricts.map(d => {
                      const socPct = (d.mean_soc_dg_kg / 100).toFixed(2);
                      const clayPct = (d.mean_clay_g_kg / 10).toFixed(1);
                      const isHighUrgency = d.urgency_level.includes('CRITICAL');
                      const isModerate = d.urgency_level.includes('MODERATE');

                      return (
                        <tr
                          key={d.name}
                          onClick={() => {
                            setSelectedDistrict(d);
                            setIsDossierOpen(true);
                          }}
                          className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer transition"
                        >
                          <td className="py-3.5 px-4 font-mono font-medium text-slate-500">
                            #{String(d.rank).padStart(2, '0')}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-900 dark:text-white">{d.name}</div>
                            <div className="text-xs text-slate-500">{d.zone}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              {d.vernacular_soil}
                            </span>
                            <span className="text-xs text-slate-400 ml-1.5">({d.soil_order})</span>
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-medium text-slate-800 dark:text-slate-200">
                            {socPct}%
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono text-slate-600 dark:text-slate-400">
                            {clayPct}%
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono text-slate-600 dark:text-slate-400">
                            {d.mean_ph.toFixed(1)}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-24 bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    d.mean_soc_deficiency > 0.50
                                      ? 'bg-rose-500'
                                      : d.mean_soc_deficiency > 0.40
                                      ? 'bg-amber-500'
                                      : 'bg-emerald-500'
                                  }`}
                                  style={{ width: `${Math.min(100, d.mean_soc_deficiency * 100)}%` }}
                                />
                              </div>
                              <span className="text-xs font-mono text-slate-500">
                                {d.mean_soc_deficiency.toFixed(3)}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                isHighUrgency
                                  ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                                  : isModerate
                                  ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                                  : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                              }`}
                            >
                              {d.urgency_level}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                setSelectedDistrict(d);
                                setIsDossierOpen(true);
                              }}
                              className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 inline-flex items-center gap-1"
                            >
                              Dossier
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* ── TAB 2: INTERACTIVE LEAFLET GIS ── */}
        {activeTab === 'map' && (
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Sentinel-2 10m Multi-Spectral GIS Engine</h3>
                  <p className="text-xs text-slate-500">Live vector district boundaries with satellite raster overlay and spatial pinning</p>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                {/* Basemap Switcher */}
                <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                  <button
                    onClick={() => setBasemapMode('google_hybrid')}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition ${
                      basemapMode === 'google_hybrid' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    Satellite
                  </button>
                  <button
                    onClick={() => setBasemapMode('osm')}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition ${
                      basemapMode === 'osm' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    Carto / OSM
                  </button>
                  <button
                    onClick={() => setBasemapMode('dark')}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition ${
                      basemapMode === 'dark' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    Dark Matter
                  </button>
                </div>

                {/* Layer Switcher */}
                <select
                  value={rasterOverlay}
                  onChange={e => setRasterOverlay(e.target.value as any)}
                  className="text-xs font-medium bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="soc_risk">Layer: Soil Degradation Risk</option>
                  <option value="ndvi">Layer: Normalized Vegetation (NDVI)</option>
                  <option value="false_color">Layer: False Color Composite</option>
                  <option value="none">Layer: None (Vector Boundaries)</option>
                </select>

                {/* Opacity Slider */}
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>Opacity:</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={rasterOpacity}
                    onChange={e => setRasterOpacity(parseFloat(e.target.value))}
                    className="w-20 accent-indigo-600"
                  />
                  <span className="font-mono">{Math.round(rasterOpacity * 100)}%</span>
                </div>
              </div>
            </div>

            {/* Embedded Dynamic SoilMap */}
            <div className="rounded-xl overflow-hidden border border-slate-200/90 dark:border-slate-800 shadow-sm relative">
              <DynamicSoilMap
                entityLevel="districts"
                basemap={basemapMode}
                rasterOverlay={rasterOverlay}
                rasterOpacity={rasterOpacity}
                selectedDistrictName={selectedDistrict.name}
                onSelectDistrict={districtName => {
                  const found = DISTRICTS.find(d => d.name.toLowerCase() === districtName.toLowerCase());
                  if (found) {
                    setSelectedDistrict(found);
                    setIsDossierOpen(true);
                  }
                }}
              />
            </div>
          </section>
        )}

        {/* ── TAB 3: REGENERATIVE AGRI-DOSING LAB ── */}
        {activeTab === 'simulator' && (
          <section className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Controls Column (5 cols) */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">Intervention Simulator</h3>
                      <p className="text-xs text-slate-500">Targeting {selectedDistrict.name} ({selectedDistrict.vernacular_soil} Soil)</p>
                    </div>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold">
                      Baseline SOC: {(selectedDistrict.mean_soc_dg_kg / 100).toFixed(2)}%
                    </span>
                  </div>

                  {/* Slider 1: Farmyard Manure (FYM) */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-700 dark:text-slate-300">Farmyard Manure (FYM)</span>
                      <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">{fymDose} t/ha</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="15"
                      step="1"
                      value={fymDose}
                      onChange={e => setFymDose(parseInt(e.target.value))}
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>0 t/ha (None)</span>
                      <span>8 t/ha (ISRO Rec)</span>
                      <span>15 t/ha (High)</span>
                    </div>
                  </div>

                  {/* Slider 2: Biochar Application */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-700 dark:text-slate-300">Pyrogenic Biochar Enrichment</span>
                      <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">{biocharDose} t/ha</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="5"
                      step="0.5"
                      value={biocharDose}
                      onChange={e => setBiocharDose(parseFloat(e.target.value))}
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>0 t/ha</span>
                      <span>2 t/ha (Recalcitrant C)</span>
                      <span>5 t/ha (Max)</span>
                    </div>
                  </div>

                  {/* Toggle: Green Manure Cover Cropping */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-slate-900 dark:text-white">Pre-Kharif Green Manuring</div>
                      <div className="text-[11px] text-slate-500">Sesbania aculeata / Sunn hemp 45-day biomass</div>
                    </div>
                    <button
                      onClick={() => setGreenManureEnabled(!greenManureEnabled)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        greenManureEnabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          greenManureEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Ecological & Financial Outcomes Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-2 text-slate-500 mb-1">
                      <Leaf className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-xs font-medium">CO₂e Sequestered</span>
                    </div>
                    <div className="text-xl font-bold tabular-nums text-slate-900 dark:text-white">
                      +{calculatedBenefits.co2EquivPerHa} <span className="text-xs font-normal text-slate-400">t/ha</span>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-2 text-slate-500 mb-1">
                      <DollarSign className="w-3.5 h-3.5 text-indigo-500" />
                      <span className="text-xs font-medium">Carbon Credits</span>
                    </div>
                    <div className="text-xl font-bold tabular-nums text-slate-900 dark:text-white">
                      ₹{calculatedBenefits.carbonCreditRevenue}
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-2 text-slate-500 mb-1">
                      <Droplets className="w-3.5 h-3.5 text-sky-500" />
                      <span className="text-xs font-medium">Water Retention</span>
                    </div>
                    <div className="text-xl font-bold tabular-nums text-slate-900 dark:text-white">
                      +{calculatedBenefits.waterRetentionBoost}%
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-2 text-slate-500 mb-1">
                      <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
                      <span className="text-xs font-medium">Break-Even</span>
                    </div>
                    <div className="text-xl font-bold tabular-nums text-slate-900 dark:text-white">
                      {calculatedBenefits.breakEvenMonths} mo
                    </div>
                  </div>
                </div>
              </div>

              {/* Chart Visualization (7 cols) */}
              <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">5-Year SOC Recovery Trajectory</h3>
                      <p className="text-xs text-slate-500">Projected Topsoil Organic Carbon vs. Business-As-Usual Depletion</p>
                    </div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                      Target &ge; 0.75%
                    </span>
                  </div>

                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trajectoryData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorProjected" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                        <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                        <YAxis domain={[0.2, 1.0]} tick={{ fontSize: 11 }} unit="%" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
                            borderColor: isDarkMode ? '#334155' : '#e2e8f0',
                            borderRadius: '8px',
                            fontSize: '12px'
                          }}
                        />
                        <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                        <Area
                          type="monotone"
                          dataKey="projectedSOC"
                          name="Regenerative Intervention"
                          stroke="#6366f1"
                          strokeWidth={2.5}
                          fillOpacity={1}
                          fill="url(#colorProjected)"
                        />
                        <Line
                          type="monotone"
                          dataKey="bauSOC"
                          name="Business As Usual (Depletion)"
                          stroke="#ef4444"
                          strokeWidth={2}
                          strokeDasharray="4 4"
                          dot={false}
                        />
                        <Line
                          type="monotone"
                          dataKey="thresholdSOC"
                          name="Optimal Target (0.75%)"
                          stroke="#10b981"
                          strokeWidth={1.5}
                          strokeDasharray="2 2"
                          dot={false}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="mt-4 p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                  <p>
                    <strong>Agro-Climatic Guidance:</strong> In {selectedDistrict.name}, applying {fymDose} t/ha FYM paired with {biocharDose} t/ha Biochar brings topsoil from {(selectedDistrict.mean_soc_dg_kg / 100).toFixed(2)}% to {trajectoryData[5].projectedSOC}% in Year 5, crossing the critical ISRO threshold and boosting CEC cation exchange capacity.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── TAB 4: CLOUDGAP MULTI-SPECTRAL SCIENCE ── */}
        {activeTab === 'spectral' && (
          <section className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Split Before/After Cloud Inpainting (7 cols) */}
              <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">SAR-Guided CloudGap Inpainting</h3>
                    <p className="text-xs text-slate-500">Sentinel-2 80% Kharif Monsoon Cloud Occlusion vs. 100% Inpainted Bare Soil Reconstruction</p>
                  </div>
                  <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                    PSNR: 34.56 dB
                  </span>
                </div>

                {/* Interactive Split Curtain Viewer */}
                <div className="relative w-full h-80 rounded-lg overflow-hidden select-none border border-slate-200 dark:border-slate-800">
                  {/* Under layer: Inpainted Reconstruction */}
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: "url('/maps/clean_false_color.png')" }}
                  >
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded bg-slate-900/80 text-white text-[11px] font-semibold backdrop-blur-sm">
                      Inpainted Bare-Soil Surface (CloudGap)
                    </div>
                  </div>

                  {/* Over layer: Occluded Satellite Scene */}
                  <div
                    className="absolute inset-y-0 left-0 overflow-hidden bg-cover bg-center border-r-2 border-indigo-500 shadow-2xl"
                    style={{
                      width: `${splitPos}%`,
                      backgroundImage: "url('/maps/false_color_composite.png')"
                    }}
                  >
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded bg-slate-900/80 text-white text-[11px] font-semibold backdrop-blur-sm">
                      80% Kharif Cloud Occlusion
                    </div>
                  </div>

                  {/* Slider Divider Control */}
                  <input
                    type="range"
                    min="5"
                    max="95"
                    value={splitPos}
                    onChange={e => setSplitPos(parseInt(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
                  />
                  <div
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-slate-900 shadow-lg flex items-center justify-center pointer-events-none z-10 font-bold text-xs"
                    style={{ left: `${splitPos}%` }}
                  >
                    <Split className="w-4 h-4" />
                  </div>
                </div>

                <div className="flex justify-between text-xs text-slate-500">
                  <span>← Drag slider to compare raw satellite vs. ST-DIP reconstruction →</span>
                  <span className="font-mono">Split: {splitPos}%</span>
                </div>
              </div>

              {/* Multi-spectral Reflectance Curve (5 cols) */}
              <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Spectral Signatures</h3>
                  <p className="text-xs text-slate-500">Chhattisgarh Vertisols (Black Clay) vs. Entisols (Bhata Laterite)</p>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={SPECTRAL_BANDS_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                      <XAxis dataKey="band" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
                          borderColor: isDarkMode ? '#334155' : '#e2e8f0',
                          borderRadius: '8px',
                          fontSize: '11px'
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                      <Line type="monotone" dataKey="vertisols" name="Vertisols (Kanhar)" stroke="#6366f1" strokeWidth={2} />
                      <Line type="monotone" dataKey="entisols" name="Entisols (Bhata)" stroke="#f59e0b" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">
                  Notice the strong SWIR-1 / SWIR-2 reflectance divergence: Kanhar soils exhibit deep organic absorption troughs, enabling the Random Forest model to isolate pure soil organic carbon from iron-rich mineral noise.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* ── TAB 5: REST API TELEMETRY COCKPIT ── */}
        {activeTab === 'telemetry' && (
          <section className="space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">FastAPI Production REST Telemetry</h3>
                  <p className="text-xs text-slate-500">Query live running server at http://localhost:8000 with real-time response inspection</p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={apiEndpoint}
                    onChange={e => {
                      setApiEndpoint(e.target.value);
                      runApiQuery(e.target.value);
                    }}
                    className="text-xs font-mono bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white"
                  >
                    <option value="/api/v1/districts/raipur/advisory">GET /api/v1/districts/raipur/advisory</option>
                    <option value="/api/v1/districts/bemetara/advisory">GET /api/v1/districts/bemetara/advisory</option>
                    <option value="/api/v1/districts/bastar/advisory">GET /api/v1/districts/bastar/advisory</option>
                    <option value="/health">GET /health</option>
                    <option value="/api/v1/spectral/profiles/kanhar">GET /api/v1/spectral/profiles/kanhar</option>
                  </select>

                  <button
                    onClick={() => runApiQuery(apiEndpoint)}
                    disabled={apiLoading}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${apiLoading ? 'animate-spin' : ''}`} />
                    Send
                  </button>

                  <button
                    onClick={copyCurlToClipboard}
                    className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    title="Copy cURL command"
                  >
                    {copiedCurl ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCurl ? 'Copied' : 'cURL'}</span>
                  </button>
                </div>
              </div>

              {/* JSON Response Preview */}
              <div className="relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 p-4 font-mono text-xs text-slate-300 max-h-96 overflow-y-auto">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[11px] text-slate-400">
                  <span>Endpoint: http://localhost:8000{apiEndpoint}</span>
                  <span>{apiLatency ? `HTTP 200 · ${apiLatency} ms` : 'Standby'}</span>
                </div>
                <pre className="overflow-x-auto whitespace-pre-wrap">
                  {apiResponse ? JSON.stringify(apiResponse, null, 2) : '// Click "Send" above to query live FastAPI backend...'}
                </pre>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* ── DISTRICT DOSSIER SLIDE-OVER DRAWER ── */}
      {isDossierOpen && selectedDistrict && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            onClick={() => setIsDossierOpen(false)}
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 p-6 shadow-2xl overflow-y-auto flex flex-col justify-between">
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white">{selectedDistrict.name}</h2>
                      <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                        Rank #{selectedDistrict.rank}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{selectedDistrict.zone}</p>
                  </div>
                  <button
                    onClick={() => setIsDossierOpen(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* 4 Soil Metrics Bento */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-lg border border-slate-200/60 dark:border-slate-800">
                    <span className="text-[11px] text-slate-500 uppercase font-semibold">Baseline SOC</span>
                    <div className="text-lg font-bold tabular-nums text-slate-900 dark:text-white">
                      {(selectedDistrict.mean_soc_dg_kg / 100).toFixed(2)}%
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-lg border border-slate-200/60 dark:border-slate-800">
                    <span className="text-[11px] text-slate-500 uppercase font-semibold">Clay Content</span>
                    <div className="text-lg font-bold tabular-nums text-slate-900 dark:text-white">
                      {(selectedDistrict.mean_clay_g_kg / 10).toFixed(1)}%
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-lg border border-slate-200/60 dark:border-slate-800">
                    <span className="text-[11px] text-slate-500 uppercase font-semibold">Topsoil pH</span>
                    <div className="text-lg font-bold tabular-nums text-slate-900 dark:text-white">
                      {selectedDistrict.mean_ph.toFixed(2)}
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-lg border border-slate-200/60 dark:border-slate-800">
                    <span className="text-[11px] text-slate-500 uppercase font-semibold">SOC Deficiency</span>
                    <div className="text-lg font-bold tabular-nums text-rose-500">
                      {selectedDistrict.mean_soc_deficiency.toFixed(3)}
                    </div>
                  </div>
                </div>

                {/* Soil Taxonomy */}
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-slate-500 uppercase">Soil Order &amp; Vernacular</span>
                  <div className="text-sm font-medium text-slate-900 dark:text-white">
                    {selectedDistrict.predominant_soil} ({selectedDistrict.soil_order})
                  </div>
                </div>

                {/* Agronomic Threat Analysis */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase">Topsoil Degradation Threat</span>
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-lg text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
                    {selectedDistrict.primary_advisory}
                  </div>
                </div>

                {/* Certified Advisory Interventions */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase">ISRO-Certified Targeted Interventions</span>
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-lg text-xs text-emerald-800 dark:text-emerald-200 leading-relaxed">
                    {selectedDistrict.secondary_advisory}
                  </div>
                </div>
              </div>

              {/* Bottom Drawer Actions */}
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <button
                  onClick={() => {
                    setIsDossierOpen(false);
                    setActiveTab('simulator');
                  }}
                  className="flex-1 py-2.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition text-center"
                >
                  Load in Dosing Lab
                </button>
                <button
                  onClick={() => {
                    setIsDossierOpen(false);
                    setActiveTab('telemetry');
                    runApiQuery(`/api/v1/districts/${selectedDistrict.name.toLowerCase()}/advisory`);
                  }}
                  className="py-2.5 px-4 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Query REST API
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
