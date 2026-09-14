'use client';
import { useState, Fragment } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Topbar from '@/components/layout/Topbar';
import Badge from '@/components/ui/Badge';
import { SECTORS, urgencyColor } from '@/lib/data';
import { DISTRICTS, STATEWIDE_AGGREGATES } from '@/lib/districts-data';
import { TIER_COLORS } from '@/lib/theme';
import { ChevronDown, ChevronUp, Globe, Layers, Search, ExternalLink, Sparkles, MapPin } from 'lucide-react';

type EntityTab = 'districts' | 'sectors';
type SectorFilter = 'all' | 'critical' | 'moderate' | 'stable';
type ZoneFilter = 'all' | 'plains' | 'hills' | 'plateau';

const SECTOR_FILTERS: { key: SectorFilter; label: string; count: number }[] = [
  { key: 'all',      label: 'All Sectors', count: 25 },
  { key: 'critical', label: 'Critical',    count: SECTORS.filter((s: any) => s.tier === 1).length },
  { key: 'moderate', label: 'Moderate',    count: SECTORS.filter((s: any) => s.tier === 2).length },
  { key: 'stable',   label: 'Stable',      count: SECTORS.filter((s: any) => s.tier === 3).length },
];

const ZONE_FILTERS: { key: ZoneFilter; label: string; count: number }[] = [
  { key: 'all',     label: 'All 33 Districts', count: 33 },
  { key: 'plains',  label: 'Central Plains',   count: DISTRICTS.filter(d => d.zone_code === 'plains').length },
  { key: 'hills',   label: 'Northern Hills',   count: DISTRICTS.filter(d => d.zone_code === 'hills').length },
  { key: 'plateau', label: 'Bastar Plateau',   count: DISTRICTS.filter(d => d.zone_code === 'plateau').length },
];

export default function SectorsPage() {
  const [tab, setTab] = useState<EntityTab>('districts');
  const [sectorFilter, setSectorFilter] = useState<SectorFilter>('all');
  const [zoneFilter, setZoneFilter] = useState<ZoneFilter>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expanded, setExpanded] = useState<number | null>(null);

  const visibleSectors = SECTORS.filter(s => {
    if (sectorFilter === 'critical') return s.tier === 1;
    if (sectorFilter === 'moderate') return s.tier === 2;
    if (sectorFilter === 'stable')   return s.tier === 3;
    return true;
  });

  const visibleDistricts = DISTRICTS.filter(d => {
    if (zoneFilter !== 'all' && d.zone_code !== zoneFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        d.name.toLowerCase().includes(q) ||
        d.zone.toLowerCase().includes(q) ||
        d.vernacular_soil.toLowerCase().includes(q) ||
        d.soil_order.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <DashboardLayout>
      <Topbar 
        title={tab === 'districts' ? 'Statewide District Analysis' : 'Micro-Sector Analysis'} 
        subtitle={tab === 'districts' ? 'All 33 Administrative Districts · Pedological Profiling & Priorities · Chhattisgarh' : 'All 25 Agricultural Zones · 5×5 Grid Overlay · Raipur AOI'} 
      />
      <div className="p-6 animate-fade-in space-y-6">

        {/* Dual-Scale Scope Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-[#0e1522] border border-white/[0.08] p-3 rounded-2xl">
          <div className="flex items-center gap-2 bg-[#080d14] p-1 rounded-xl border border-white/[0.06]">
            <button
              onClick={() => { setTab('districts'); setExpanded(null); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono-data text-xs font-semibold transition-all ${
                tab === 'districts'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                  : 'text-[#5e7aa8] hover:text-white'
              }`}
            >
              <Globe className="w-4 h-4" />
              Statewide (33 Districts)
            </button>
            <button
              onClick={() => { setTab('sectors'); setExpanded(null); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono-data text-xs font-semibold transition-all ${
                tab === 'sectors'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                  : 'text-[#5e7aa8] hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              Micro-Sectors (25 Grid AOI)
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs text-[#8ba3cc]">
            <Link
              href="/interactive-map"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono-data text-[11px] hover:bg-emerald-500/20 transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open Interactive GIS Map
            </Link>
          </div>
        </div>

        {tab === 'districts' ? (
          <>
            {/* Statewide Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="card p-4 border border-cyan-500/20 bg-cyan-950/10">
                <div className="text-[#5e7aa8] text-[11px] font-mono-data uppercase">Total Evaluated</div>
                <div className="text-2xl font-bold font-display text-white mt-1">33 Districts</div>
                <div className="text-[11px] text-cyan-400 font-mono-data mt-0.5">13.85M ha Statewide Area</div>
              </div>
              <div className="card p-4 border border-emerald-500/20 bg-emerald-950/10">
                <div className="text-[#5e7aa8] text-[11px] font-mono-data uppercase">Cropland Bare Soil</div>
                <div className="text-2xl font-bold font-display text-emerald-300 mt-1">5.48M ha</div>
                <div className="text-[11px] text-[#8ba3cc] font-mono-data mt-0.5">39.59% Cropland Fraction</div>
              </div>
              <div className="card p-4 border border-rose-500/20 bg-rose-950/10">
                <div className="text-[#5e7aa8] text-[11px] font-mono-data uppercase">Critical Carbon Deficit</div>
                <div className="text-2xl font-bold font-display text-rose-400 mt-1">243,242 ha</div>
                <div className="text-[11px] text-rose-300 font-mono-data mt-0.5">4.43% High-Risk Cropland</div>
              </div>
              <div className="card p-4 border border-amber-500/20 bg-amber-950/10">
                <div className="text-[#5e7aa8] text-[11px] font-mono-data uppercase">Mean Statewide Deficiency</div>
                <div className="text-2xl font-bold font-display text-amber-300 mt-1">46.16%</div>
                <div className="text-[11px] text-[#8ba3cc] font-mono-data mt-0.5">Random Forest Model SBCV</div>
              </div>
            </div>

            {/* Zone Filter Bar & Search */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                {ZONE_FILTERS.map(f => {
                  const active = zoneFilter === f.key;
                  const col = f.key === 'plains' ? '#4ade80' : f.key === 'hills' ? '#38bdf8' : f.key === 'plateau' ? '#a78bfa' : '#00d4ff';
                  return (
                    <button
                      key={f.key}
                      onClick={() => { setZoneFilter(f.key); setExpanded(null); }}
                      className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-mono-data text-[11px] font-semibold border transition-all"
                      style={active
                        ? { background: `${col}18`, border: `1px solid ${col}40`, color: col }
                        : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#5e7aa8' }}
                    >
                      {f.label}
                      <span
                        className="px-1.5 py-0.5 rounded-md text-[9px]"
                        style={active ? { background: `${col}25` } : { background: 'rgba(255,255,255,0.06)' }}
                      >
                        {f.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="relative min-w-[240px]">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#4a6890]" />
                <input
                  type="text"
                  placeholder="Search district or soil type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#080d14] border border-white/[0.08] text-xs text-white placeholder-[#4a6890] focus:outline-none focus:border-cyan-500/50"
                />
              </div>
            </div>

            {/* Districts Table */}
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                      {['#','District','Agro-Climatic Zone','Indigenous Soil','Mean SOC Deficiency','High Risk (ha)','Bare Cropland (ha)','Topsoil SOC','Clay','pH'].map(h => (
                        <th key={h} className="px-4 py-3 text-left font-mono-data text-[9px] text-[#3d5a80] tracking-widest font-medium whitespace-nowrap">{h}</th>
                      ))}
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {visibleDistricts.map(d => {
                      const isHigh = d.mean_soc_deficiency >= 0.50;
                      const isMed = d.mean_soc_deficiency >= 0.46;
                      const statusCol = isHigh ? '#ef4444' : isMed ? '#f59e0b' : '#10b981';
                      const open = expanded === d.rank;

                      return (
                        <Fragment key={d.rank}>
                          <tr
                            onClick={() => setExpanded(open ? null : d.rank)}
                            className="border-b border-white/[0.04] hover:bg-white/[0.03] cursor-pointer transition-colors"
                          >
                            <td className="px-4 py-3">
                              <span
                                className="font-mono-data text-[11px] font-bold px-2 py-1 rounded-lg"
                                style={{
                                  background: `${statusCol}15`,
                                  color: statusCol,
                                  border: `1px solid ${statusCol}35`
                                }}
                              >
                                #{d.rank}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-display text-[13px] font-semibold text-[#dce8ff]">{d.name}</div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-[11px] font-mono-data text-[#8ba3cc]">{d.zone}</span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-[11px] font-mono-data px-2 py-0.5 rounded bg-white/[0.04] text-amber-300 border border-amber-500/20">
                                {d.vernacular_soil}
                              </span>
                            </td>
                            <td className="px-4 py-3">
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
                            <td className="px-4 py-3">
                              <span className="font-mono-data text-[12px] font-semibold" style={{ color: statusCol }}>
                                {Math.round(d.high_risk_ha).toLocaleString()} ha
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="font-mono-data text-[12px] text-[#8ba3cc]">
                                {Math.round(d.bare_soil_ha).toLocaleString()} ha
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="font-mono-data text-[12px] text-[#8ba3cc]">
                                {d.mean_soc_dg_kg.toFixed(1)} dg/kg
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="font-mono-data text-[12px] text-[#8ba3cc]">
                                {d.mean_clay_g_kg.toFixed(0)} g/kg
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="font-mono-data text-[12px] text-cyan-300">
                                {d.mean_ph.toFixed(2)}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-[#4a6890]">
                              {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </td>
                          </tr>

                          {open && (
                            <tr key={`${d.rank}-exp`} className="border-b border-white/[0.04]">
                              <td colSpan={11} className="px-4 pb-4 pt-0">
                                <div
                                  className="rounded-xl p-4 mt-1 bg-[#0c121d] border border-cyan-500/20"
                                >
                                  <div className="flex items-center justify-between gap-4 mb-2">
                                    <p className="font-mono-data text-[10px] tracking-widest text-cyan-400 font-bold uppercase">
                                      REGENERATIVE AGRONOMIC PRESCRIPTION · {d.name} (Rank #{d.rank})
                                    </p>
                                    <Link
                                      href={`/interactive-map`}
                                      className="flex items-center gap-1 font-mono-data text-[10px] text-emerald-400 hover:underline"
                                    >
                                      Inspect on Map <ExternalLink className="w-3 h-3" />
                                    </Link>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                    <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                                      <span className="text-cyan-300 font-semibold font-mono-data text-[11px] block mb-1">
                                        Primary Soil Intervention
                                      </span>
                                      <p className="text-[#a0aec0] leading-relaxed">{d.primary_advisory}</p>
                                    </div>
                                    <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                                      <span className="text-emerald-300 font-semibold font-mono-data text-[11px] block mb-1">
                                        Soil Chemistry & Mineral Buffering
                                      </span>
                                      <p className="text-[#a0aec0] leading-relaxed">{d.secondary_advisory}</p>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Micro-Sectors Filters */}
            <div className="flex flex-wrap gap-2">
              {SECTOR_FILTERS.map(f => {
                const active = sectorFilter === f.key;
                const col = f.key === 'critical' ? TIER_COLORS[1] : f.key === 'moderate' ? TIER_COLORS[2] : f.key === 'stable' ? TIER_COLORS[3] : '#00d4ff';
                return (
                  <button
                    key={f.key}
                    onClick={() => { setSectorFilter(f.key); setExpanded(null); }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl font-mono-data text-[11px] font-semibold border transition-all"
                    style={active
                      ? { background: `${col}18`, border: `1px solid ${col}40`, color: col }
                      : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#5e7aa8' }}
                  >
                    {f.label}
                    <span
                      className="px-1.5 py-0.5 rounded-md text-[9px]"
                      style={active ? { background: `${col}25` } : { background: 'rgba(255,255,255,0.06)' }}
                    >
                      {f.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Micro-Sectors Table */}
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                      {['#','Sector','Urgency','Risk Score','Bare Area (ha)','High Risk (ha)','% High','SOC (dg/kg)','BSI'].map(h => (
                        <th key={h} className="px-4 py-3 text-left font-mono-data text-[9px] text-[#3d5a80] tracking-widest font-medium whitespace-nowrap">{h}</th>
                      ))}
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {visibleSectors.map(s => {
                      const c = urgencyColor(s.urgency);
                      const open = expanded === s.rank;
                      return (
                        <Fragment key={s.rank}>
                          <tr
                            onClick={() => setExpanded(open ? null : s.rank)}
                            className="border-b border-white/[0.04] hover:bg-white/[0.03] cursor-pointer transition-colors"
                          >
                            <td className="px-4 py-3">
                              <span
                                className="font-mono-data text-[11px] font-bold px-2 py-1 rounded-lg"
                                style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}
                              >
                                #{s.rank}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="font-display text-[13px] font-semibold text-[#dce8ff]">{s.name}</span>
                            </td>
                            <td className="px-4 py-3"><Badge urgency={s.urgency} /></td>
                            <td className="px-4 py-3">
                              <span className="font-mono-data text-[13px] font-bold" style={{ color: c.text }}>{s.risk.toFixed(4)}</span>
                            </td>
                            <td className="px-4 py-3"><span className="font-mono-data text-[12px] text-[#8ba3cc]">{s.bare.toLocaleString('en-IN', { maximumFractionDigits: 1 })}</span></td>
                            <td className="px-4 py-3"><span className="font-mono-data text-[12px] font-semibold" style={{ color: c.text }}>{s.highRisk.toLocaleString('en-IN', { maximumFractionDigits: 1 })}</span></td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-12 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                                  <div className="h-full rounded-full" style={{ width: `${Math.min(s.pct, 100)}%`, background: c.text }} />
                                </div>
                                <span className="font-mono-data text-[11px]" style={{ color: c.text }}>{s.pct.toFixed(1)}%</span>
                              </div>
                            </td>
                            <td className="px-4 py-3"><span className="font-mono-data text-[12px] text-[#8ba3cc]">{s.soc.toFixed(1)}</span></td>
                            <td className="px-4 py-3"><span className="font-mono-data text-[11px] text-[#5e7aa8]">{s.bsi.toFixed(4)}</span></td>
                            <td className="px-4 py-3 text-[#4a6890]">
                              {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </td>
                          </tr>
                          {open && (
                            <tr key={`${s.rank}-exp`} className="border-b border-white/[0.04]">
                              <td colSpan={10} className="px-4 pb-4 pt-0">
                                <div
                                  className="rounded-xl p-4 mt-1"
                                  style={{ background: `${c.bg}`, border: `1px solid ${c.border}` }}
                                >
                                  <p className="font-mono-data text-[9px] tracking-widest mb-2.5" style={{ color: `${c.text}99` }}>
                                    AGRONOMIC INTERVENTION · {s.name} ({s.gridId})
                                  </p>
                                  <div className="space-y-2">
                                    {s.recommendations.map((r, i) => (
                                      <div key={i} className="flex gap-3 items-start">
                                        <span className="font-mono-data text-[10px] font-bold shrink-0 mt-0.5" style={{ color: c.text }}>{i + 1}.</span>
                                        <span className="text-[12px] text-[#8ba3cc] leading-relaxed">{r}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        <p className="font-mono-data text-[10px] text-[#3d5a80] mt-3 px-1">
          {tab === 'districts' 
            ? 'Statewide Chhattisgarh Scale · 33 Administrative Districts · Pedologically classified by Kanhar/Dorsa/Matasi/Bhata · Click any district to expand agronomic prescription'
            : 'Grid: 5×5 regular spatial overlay · Raipur AOI · SOC in dg/kg · Click row to expand intervention package'}
        </p>
      </div>
    </DashboardLayout>
  );
}
