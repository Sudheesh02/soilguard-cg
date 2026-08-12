'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Topbar from '@/components/layout/Topbar';
import KPICards from '@/components/dashboard/KPICards';
import RiskChart from '@/components/dashboard/RiskChart';
import TierDonut from '@/components/dashboard/TierDonut';
import TopSectorsTable from '@/components/dashboard/TopSectorsTable';
import { STATS } from '@/lib/data';
import { Sun, Sunrise, Sunset, Moon, Sparkles, Map as MapIcon, Database, TerminalSquare } from 'lucide-react';

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

  useEffect(() => {
    setGreeting(getGreeting());
    const timer = setTimeout(() => setLoading(false), 800); // simulate fast initial data load
    return () => clearTimeout(timer);
  }, []);

  return (
    <DashboardLayout>
      <Topbar title="Mission Overview" subtitle="Chhattisgarh SOC Deficiency Analysis · 22,702 ha · 25 Sectors" />
      
      <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
        
        {/* Welcome Header */}
        <div className="flex items-end justify-between animate-fade-in">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <greeting.icon className="w-5 h-5 text-emerald-400" />
              <h2 className="text-2xl font-display font-bold text-white tracking-tight">{greeting.text}, Command.</h2>
            </div>
            <p className="text-[#5e7aa8] text-sm">System metrics are optimal. Sentinel-2 processing completed successfully.</p>
          </div>
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="font-mono-data text-[10px] font-bold">ALL SYSTEMS GREEN</span>
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 card h-96 bg-white/[0.02]" />
              <div className="card h-96 bg-white/[0.02]" />
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-slide-up">
            
            {/* KPI row */}
            <KPICards />

            {/* Pipeline stats strip */}
            <div className="card relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-[#00d4ff]/5 via-transparent to-[#10b981]/5 opacity-50" />
              <div className="px-6 py-4 flex flex-wrap gap-x-12 gap-y-6 relative z-10">
                {[
                  { label: 'Model Engine', value: 'Random Forest', sub: '150 trees · depth 14', color: 'text-[#00d4ff]' },
                  { label: 'Test R² Score', value: STATS.r2.toFixed(4), sub: 'Satellite RF model', color: 'text-white' },
                  { label: 'Test RMSE', value: STATS.rmse.toFixed(4), sub: 'SOC Deficiency Index', color: 'text-white' },
                  { label: 'Spatial Res', value: STATS.resolution, sub: 'Sentinel-2 pixel', color: 'text-white' },
                  { label: 'Pipeline Runtime', value: `${STATS.processingTimeSec}s`, sub: 'Full execution', color: 'text-emerald-400' },
                  { label: 'Bare Soil Extent', value: `${(STATS.totalBareHa / 1000).toFixed(1)}k ha`, sub: 'NDVI ≤ 0.30 mask', color: 'text-amber-400' },
                  { label: 'Primary Sensor', value: 'Sentinel-2 L2A', sub: 'B02 B04 B08 B11', color: 'text-[#00d4ff]' },
                ].map((s, i) => (
                  <div key={s.label} className="relative group/stat">
                    {/* Divider for non-first items */}
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

            {/* Risk chart full width */}
            <RiskChart />

            {/* Priority table + donut */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <TopSectorsTable />
              </div>
              <TierDonut />
            </div>

            <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/[0.05] to-transparent my-4" />

            {/* AOI info footer */}
            <div className="card bg-[#080d14] border-white/[0.04]">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-white/[0.04]">
                
                <div className="p-5 flex gap-4 items-start group hover:bg-white/[0.01] transition-colors">
                  <div className="p-2 rounded-lg bg-[#00d4ff]/10 text-[#00d4ff]">
                    <MapIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-mono-data text-[9px] text-[#3d5a80] tracking-widest mb-1.5">AOI BOUNDING BOX</p>
                    <p className="font-mono-data text-[11px] text-[#8ba3cc] leading-relaxed">81.60°E–81.80°E<br/>21.10°N–21.30°N<br/><span className="text-[#4a6890]">EPSG:32644</span></p>
                  </div>
                </div>

                <div className="p-5 flex gap-4 items-start group hover:bg-white/[0.01] transition-colors">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-mono-data text-[9px] text-[#3d5a80] tracking-widest mb-1.5">DATA SOURCES</p>
                    <p className="font-mono-data text-[11px] text-[#8ba3cc] leading-relaxed">Sentinel-2 L2A API<br/>SoilGrids 250m Base<br/><span className="text-[#4a6890]">ISRO Bhuvan Integration</span></p>
                  </div>
                </div>

                <div className="p-5 flex gap-4 items-start group hover:bg-white/[0.01] transition-colors">
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                    <TerminalSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-mono-data text-[9px] text-[#3d5a80] tracking-widest mb-1.5">GRID TOPOLOGY</p>
                    <p className="font-mono-data text-[11px] text-[#8ba3cc] leading-relaxed">5×5 Spatial Zones<br/>4.4 km × 4.4 km each<br/><span className="text-[#4a6890]">A–E rows · 1–5 cols</span></p>
                  </div>
                </div>

                <div className="p-5 flex gap-4 items-start group hover:bg-white/[0.01] transition-colors bg-gradient-to-br from-[#00d4ff]/[0.02] to-transparent">
                  <div className="p-2 rounded-lg bg-white/5 text-white">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-mono-data text-[9px] text-[#3d5a80] tracking-widest mb-1.5">BUILT FOR</p>
                    <p className="font-mono-data text-[12px] text-[#00d4ff] font-bold mt-1">COSINE NIT Raipur<br/>× NRSC Ideathon 2026</p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
