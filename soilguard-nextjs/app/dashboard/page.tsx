'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Topbar from '@/components/layout/Topbar';
import KPICards from '@/components/dashboard/KPICards';
import RiskChart from '@/components/dashboard/RiskChart';
import TierDonut from '@/components/dashboard/TierDonut';
import TopSectorsTable from '@/components/dashboard/TopSectorsTable';
import { STATS } from '@/lib/data';
import { DISTRICTS, STATEWIDE_AGGREGATES, AGRO_CLIMATIC_ZONES } from '@/lib/districts-data';
import { 
  Sun, 
  Sunrise, 
  Sunset, 
  Moon, 
  Sparkles, 
  Map as MapIcon, 
  Database, 
  TerminalSquare, 
  Globe, 
  Layers, 
  ExternalLink,
  AlertTriangle,
  Flame,
  Leaf,
  ArrowRight
} from 'lucide-react';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return { text: 'Good Morning', icon: Sunrise };
  if (hour < 17) return { text: 'Good Afternoon', icon: Sun };
  if (hour < 20) return { text: 'Good Evening', icon: Sunset };
  return { text: 'Good Night', icon: Moon };
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState({ text: 'Welcome', icon: Sun });
  const [viewScope, setViewScope] = useState<'statewide' | 'sectors'>('statewide');

  useEffect(() => {
    setGreeting(getGreeting());
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  const topDistricts = DISTRICTS.slice(0, 8);

  return (
    <DashboardLayout>
      <Topbar 
        title="Mission Overview" 
        subtitle={viewScope === 'statewide' 
          ? "Full 33-District Chhattisgarh Statewide Intelligence · 13.85M ha · 3 Agro-Climatic Zones"
          : "Raipur-Durg Agricultural Belt · 22,702 ha · 25 Micro-Sectors 10m Ground Truth"} 
      />
      
      <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
        
        {/* Welcome Header with Scope Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-4 animate-fade-in">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <greeting.icon className="w-5 h-5 text-emerald-400" />
              <h2 className="text-2xl font-display font-bold text-white tracking-tight">{greeting.text}, Command.</h2>
            </div>
            <p className="text-[#5e7aa8] text-sm">
              Statewide remote sensing telemetry online. 33 administrative districts & 25 micro-sectors evaluated.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-[#0e1522] p-1 rounded-xl border border-white/[0.08]">
              <button
                onClick={() => setViewScope('statewide')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-mono-data text-xs font-semibold transition-all ${
                  viewScope === 'statewide'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                    : 'text-[#5e7aa8] hover:text-white'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                Statewide (33 Districts)
              </button>
              <button
                onClick={() => setViewScope('sectors')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-mono-data text-xs font-semibold transition-all ${
                  viewScope === 'sectors'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                    : 'text-[#5e7aa8] hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                Raipur AOI (25 Sectors)
              </button>
            </div>

            <Link
              href="/interactive-map"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono-data text-[11px] hover:bg-emerald-500/20 transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              GIS Satellite Map
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="space-y-8 animate-pulse">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="card p-5 h-32 bg-white/[0.02]" />
              ))}
            </div>
            <div className="card h-16 bg-white/[0.02]" />
            <div className="card h-64 bg-white/[0.02]" />
          </div>
        ) : viewScope === 'statewide' ? (
          <div className="space-y-8 animate-slide-up">
            
            {/* Statewide KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <div className="card p-5 border border-cyan-500/20 bg-gradient-to-br from-cyan-950/20 to-[#0e1522]">
                <div className="flex items-center justify-between text-[#5e7aa8] mb-2">
                  <span className="font-mono-data text-[10px] uppercase tracking-wider">Total Evaluated Territory</span>
                  <Globe className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-3xl font-display font-bold text-white">13.85M <span className="text-sm font-mono-data text-cyan-400">ha</span></div>
                <div className="text-xs text-[#8ba3cc] mt-1 font-mono-data">All 33 Administrative Districts of CG</div>
              </div>

              <div className="card p-5 border border-emerald-500/20 bg-gradient-to-br from-emerald-950/20 to-[#0e1522]">
                <div className="flex items-center justify-between text-[#5e7aa8] mb-2">
                  <span className="font-mono-data text-[10px] uppercase tracking-wider">Agricultural Bare Cropland</span>
                  <Leaf className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-3xl font-display font-bold text-emerald-300">5.48M <span className="text-sm font-mono-data text-emerald-400">ha</span></div>
                <div className="text-xs text-[#8ba3cc] mt-1 font-mono-data">39.59% Cropland · Sentinel-2 Spectral Mask</div>
              </div>

              <div className="card p-5 border border-rose-500/20 bg-gradient-to-br from-rose-950/20 to-[#0e1522]">
                <div className="flex items-center justify-between text-[#5e7aa8] mb-2">
                  <span className="font-mono-data text-[10px] uppercase tracking-wider">Critical Carbon Deficit</span>
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                </div>
                <div className="text-3xl font-display font-bold text-rose-400">243,242 <span className="text-sm font-mono-data text-rose-300">ha</span></div>
                <div className="text-xs text-rose-300/80 mt-1 font-mono-data">4.43% of Cropland Requires Urgent Intervention</div>
              </div>

              <div className="card p-5 border border-amber-500/20 bg-gradient-to-br from-amber-950/20 to-[#0e1522]">
                <div className="flex items-center justify-between text-[#5e7aa8] mb-2">
                  <span className="font-mono-data text-[10px] uppercase tracking-wider">Statewide Mean Deficiency</span>
                  <Flame className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-3xl font-display font-bold text-amber-300">46.16%</div>
                <div className="text-xs text-[#8ba3cc] mt-1 font-mono-data">Spatial Block CV Validated · R² 0.4076</div>
              </div>
            </div>

            {/* Pipeline stats strip */}
            <div className="card relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-emerald-500/5 opacity-50" />
              <div className="px-6 py-4 flex flex-wrap gap-x-12 gap-y-6 relative z-10">
                {[
                  { label: 'Coverage Scale', value: '33 Districts', sub: '100% Official CG Geography', color: 'text-cyan-400' },
                  { label: 'Agro-Climatic Zones', value: '3 Strata', sub: 'Plains, Hills, Bastar Plateau', color: 'text-white' },
                  { label: 'Validation Engine', value: 'SBCV 5×5 Blocks', sub: 'Tobler-compliant zero leakage', color: 'text-white' },
                  { label: 'Top Priority District', value: 'Bemetara (#1)', sub: '52.2% mean deficiency', color: 'text-rose-400' },
                  { label: 'Native Soil Classes', value: '4 Orders', sub: 'Kanhar, Dorsa, Matasi, Bhata', color: 'text-amber-400' },
                  { label: 'Inference Velocity', value: '< 9.2s', sub: 'Full state batch execution', color: 'text-emerald-400' },
                  { label: 'Primary Sensor', value: 'Sentinel-2 + S1 SAR', sub: 'ST-DIP Cloud Inpainting', color: 'text-cyan-400' },
                ].map((s, i) => (
                  <div key={s.label} className="relative group/stat">
                    {i !== 0 && (
                      <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-[1px] h-8 bg-white/[0.06] hidden sm:block" />
                    )}
                    <p className="font-mono-data text-[9px] text-[#4a6890] tracking-widest mb-1">{s.label}</p>
                    <p className={`font-display text-[16px] font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-[10px] text-[#5e7aa8] mt-0.5">{s.sub}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Agro-Climatic Zones Breakdown */}
            <div>
              <h3 className="font-display font-semibold text-white text-[15px] mb-3 flex items-center gap-2">
                Agro-Climatic Zone Strata Breakdown
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    key: 'plains',
                    name: 'Central Chhattisgarh Plains',
                    count: 19,
                    color: '#4ade80',
                    deficit: '47.58%',
                    highRisk: '217,981 ha (8.17%)',
                    bareSoil: '2.67M ha',
                    soils: 'Kanhar (Vertisols) & Dorsa (Inceptisols)',
                    districts: 'Raipur, Durg, Bemetara, Bilaspur, Baloda Bazar...'
                  },
                  {
                    key: 'hills',
                    name: 'Northern Hills Zone',
                    count: 7,
                    color: '#38bdf8',
                    deficit: '44.99%',
                    highRisk: '8,964 ha (0.77%)',
                    bareSoil: '1.17M ha',
                    soils: 'Matasi (Alfisols) & Mountain Loams',
                    districts: 'Surguja, Balrampur, Surajpur, Jashpur, Koriya, MCB...'
                  },
                  {
                    key: 'plateau',
                    name: 'Bastar Plateau / Southern Zone',
                    count: 7,
                    color: '#a78bfa',
                    deficit: '44.97%',
                    highRisk: '16,296 ha (0.99%)',
                    bareSoil: '1.65M ha',
                    soils: 'Bhata (Entisols) & Red Laterites',
                    districts: 'Bastar, Dantewada, Sukma, Bijapur, Narayanpur...'
                  }
                ].map(z => (
                  <div key={z.key} className="card p-5 border" style={{ borderColor: `${z.color}30` }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono-data text-[10px] tracking-widest font-bold" style={{ color: z.color }}>
                        {z.count} DISTRICTS
                      </span>
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: z.color }} />
                    </div>
                    <h4 className="font-display font-bold text-white text-base mb-3">{z.name}</h4>
                    <div className="space-y-1.5 text-xs text-[#cbd5e1]">
                      <div className="flex justify-between">
                        <span className="text-[#5e7aa8]">Mean SOC Deficiency:</span>
                        <span className="font-mono-data font-bold" style={{ color: z.color }}>{z.deficit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#5e7aa8]">Critical High-Risk Deficit:</span>
                        <span className="font-mono-data text-white">{z.highRisk}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#5e7aa8]">Bare Cropland Mapped:</span>
                        <span className="font-mono-data text-[#8ba3cc]">{z.bareSoil}</span>
                      </div>
                      <div className="pt-2 border-t border-white/[0.06] text-[11px] text-[#8ba3cc]">
                        <span className="text-[#5e7aa8] block">Primary Soils:</span>
                        {z.soils}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Priority High-Deficiency Districts Table */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-display font-semibold text-white text-[15px] flex items-center gap-2">
                    Top Priority High-Deficiency Districts
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                    </span>
                  </h3>
                  <p className="text-[11px] text-[#5e7aa8] mt-0.5">Top 8 administrative districts ranked by statewide carbon deficit</p>
                </div>
                <Link
                  href="/sectors"
                  className="flex items-center gap-1 font-mono-data text-xs text-cyan-400 hover:underline"
                >
                  View All 33 Districts <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="overflow-x-auto rounded-xl border border-white/[0.06] bg-[#080d14]">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                      {['#','District','Agro-Climatic Zone','Soil Order','SOC Deficiency','Critical Area (ha)','Bare Cropland','Primary Intervention'].map(h => (
                        <th key={h} className="px-3.5 py-3 text-left font-mono-data text-[9px] text-[#3d5a80] tracking-widest font-medium whitespace-nowrap">{h}</th>
                      ))}
                      <th className="px-3 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {topDistricts.map(d => {
                      const isHigh = d.mean_soc_deficiency >= 0.50;
                      const statusCol = isHigh ? '#ef4444' : '#f59e0b';

                      return (
                        <tr key={d.rank} className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors">
                          <td className="px-3.5 py-3">
                            <span
                              className="font-mono-data text-[11px] font-bold px-2 py-0.5 rounded"
                              style={{ background: `${statusCol}20`, color: statusCol, border: `1px solid ${statusCol}40` }}
                            >
                              #{d.rank}
                            </span>
                          </td>
                          <td className="px-3.5 py-3 font-display font-semibold text-white">
                            {d.name}
                          </td>
                          <td className="px-3.5 py-3 font-mono-data text-xs text-[#8ba3cc]">
                            {d.zone}
                          </td>
                          <td className="px-3.5 py-3">
                            <span className="font-mono-data text-[11px] px-2 py-0.5 rounded bg-white/[0.04] text-amber-300">
                              {d.vernacular_soil}
                            </span>
                          </td>
                          <td className="px-3.5 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                                <div
                                  className="h-full rounded-full"
                                  style={{
                                    width: `${Math.min((d.mean_soc_deficiency / 0.60) * 100, 100)}%`,
                                    background: statusCol
                                  }}
                                />
                              </div>
                              <span className="font-mono-data text-[11px] font-bold" style={{ color: statusCol }}>
                                {(d.mean_soc_deficiency * 100).toFixed(1)}%
                              </span>
                            </div>
                          </td>
                          <td className="px-3.5 py-3 font-mono-data text-xs font-semibold" style={{ color: statusCol }}>
                            {Math.round(d.high_risk_ha).toLocaleString()} ha
                          </td>
                          <td className="px-3.5 py-3 font-mono-data text-xs text-[#8ba3cc]">
                            {Math.round(d.bare_soil_ha).toLocaleString()} ha
                          </td>
                          <td className="px-3.5 py-3 text-xs text-[#cbd5e1] max-w-[320px] truncate">
                            {d.primary_advisory}
                          </td>
                          <td className="px-3 py-3 text-right">
                            <Link
                              href="/interactive-map"
                              className="font-mono-data text-[10px] text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1"
                            >
                              Map <ExternalLink className="w-3 h-3" />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom Meta info */}
            <div className="card bg-[#080d14] border-white/[0.04]">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-white/[0.04]">
                <div className="p-5 flex gap-4 items-start">
                  <div className="p-2 rounded-lg bg-[#00d4ff]/10 text-[#00d4ff]">
                    <MapIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-mono-data text-[9px] text-[#3d5a80] tracking-widest mb-1.5">STATE BOUNDING EXTENT</p>
                    <p className="font-mono-data text-[11px] text-[#8ba3cc] leading-relaxed">80.20°E–84.40°E<br/>17.75°N–24.15°N<br/><span className="text-[#4a6890]">EPSG:4326 (WGS84)</span></p>
                  </div>
                </div>

                <div className="p-5 flex gap-4 items-start">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-mono-data text-[9px] text-[#3d5a80] tracking-widest mb-1.5">DATA INGESTION</p>
                    <p className="font-mono-data text-[11px] text-[#8ba3cc] leading-relaxed">Sentinel-2 L2A Multispectral<br/>Sentinel-1 C-Band SAR<br/><span className="text-[#4a6890]">ISRO Bhuvan Integration</span></p>
                  </div>
                </div>

                <div className="p-5 flex gap-4 items-start">
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                    <TerminalSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-mono-data text-[9px] text-[#3d5a80] tracking-widest mb-1.5">SCIENTIFIC HARDENING</p>
                    <p className="font-mono-data text-[11px] text-[#8ba3cc] leading-relaxed">Spatial Block CV Certified<br/>34.56 dB PSNR Inpainting<br/><span className="text-[#4a6890]">146 Automated Tests</span></p>
                  </div>
                </div>

                <div className="p-5 flex gap-4 items-start bg-gradient-to-br from-[#00d4ff]/[0.02] to-transparent">
                  <div className="p-2 rounded-lg bg-white/5 text-white">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-mono-data text-[9px] text-[#3d5a80] tracking-widest mb-1.5">DEVELOPED FOR</p>
                    <p className="font-mono-data text-[12px] text-[#00d4ff] font-bold mt-1">COSINE NIT Raipur<br/>× NRSC ISRO 2026</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        ) : (
          <div className="space-y-8 animate-slide-up">
            <KPICards />
            <RiskChart />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <TopSectorsTable />
              </div>
              <TierDonut />
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
