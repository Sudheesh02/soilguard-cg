'use client';
import { useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Topbar from '@/components/layout/Topbar';
import { SECTORS, urgencyColor } from '@/lib/data';
import { DISTRICTS } from '@/lib/districts-data';
import { TIER_COLORS } from '@/lib/theme';
import Badge from '@/components/ui/Badge';
import { Globe, Layers, ExternalLink, Leaf, Sprout, ShieldAlert, Sparkles, Filter } from 'lucide-react';

type Tab = 'districts' | 'sectors';
type ZoneFilter = 'all' | 'plains' | 'hills' | 'plateau';
type SoilFilter = 'all' | 'Kanhar' | 'Dorsa' | 'Matasi' | 'Bhata';

const SOIL_STANDARDS = [
  {
    soil: 'Kanhar',
    order: 'Vertisols (Deep Black Clay)',
    color: '#E9C46A',
    fym: '8–10 t/ha FYM or 3.0 t/ha Biochar',
    green: 'Dhaincha (Sesbania aculeata) pre-Kharif',
    buffer: 'Gypsum @ 2.0–2.5 t/ha for sodicity & clay aeration',
    tillage: 'Reduced tillage to preserve macro-aggregate carbon'
  },
  {
    soil: 'Dorsa',
    order: 'Inceptisols / Alfisols (Clay Loam)',
    color: '#F4A261',
    fym: '6–8 t/ha FYM or enriched compost',
    green: 'Sunn hemp (Crotalaria juncea) 45 days pre-paddy',
    buffer: 'Neutral buffering + balanced NPK + ZnSO4',
    tillage: 'Zero-tillage + 30% crop residue retention'
  },
  {
    soil: 'Matasi',
    order: 'Alfisols (Yellowish Sandy Loam)',
    color: '#2A9D8F',
    fym: '10–12 t/ha FYM or 4.0 t/ha Biochar',
    green: 'Crotalaria juncea green manuring',
    buffer: 'Agricultural Lime @ 1.8 t/ha for acidic correction (pH < 6.0)',
    tillage: 'Mulch cover to reduce thermal carbon oxidation'
  },
  {
    soil: 'Bhata',
    order: 'Entisols (Red Gravelly Laterite)',
    color: '#E76F51',
    fym: '12–15 t/ha FYM / organic matter',
    green: 'Sesbania rostrata & drought-hardy legumes',
    buffer: 'Agricultural Lime @ 2.5–3.0 t/ha + rock phosphate',
    tillage: 'Permanent groundcover & vegetative bunding against runoff'
  }
];

export default function RecommendationsPage() {
  const [tab, setTab] = useState<Tab>('districts');
  const [zoneFilter, setZoneFilter] = useState<ZoneFilter>('all');
  const [soilFilter, setSoilFilter] = useState<SoilFilter>('all');

  const criticalSectors = SECTORS.filter((s: any) => s.tier === 1);
  const moderateSectors = SECTORS.filter((s: any) => s.tier === 2);
  const stableSectors   = SECTORS.filter((s: any) => s.tier === 3);

  const filteredDistricts = DISTRICTS.filter(d => {
    if (zoneFilter !== 'all' && d.zone_code !== zoneFilter) return false;
    if (soilFilter !== 'all' && d.vernacular_soil !== soilFilter) return false;
    return true;
  });

  return (
    <DashboardLayout>
      <Topbar 
        title={tab === 'districts' ? 'Statewide Regenerative Agronomic Packages' : 'Micro-Sector Recommendations'} 
        subtitle={tab === 'districts' ? 'Tailored to 33 Districts & 4 Indigenous Soil Orders · Chhattisgarh' : 'Village-level intervention packages ranked by urgency · Raipur AOI'} 
      />
      <div className="p-6 animate-fade-in space-y-8">

        {/* Scope Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-[#0e1522] border border-white/[0.08] p-3 rounded-2xl">
          <div className="flex items-center gap-2 bg-[#080d14] p-1 rounded-xl border border-white/[0.06]">
            <button
              onClick={() => setTab('districts')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono-data text-xs font-semibold transition-all ${
                tab === 'districts'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                  : 'text-[#5e7aa8] hover:text-white'
              }`}
            >
              <Globe className="w-4 h-4" />
              Statewide (33 Districts Packages)
            </button>
            <button
              onClick={() => setTab('sectors')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono-data text-xs font-semibold transition-all ${
                tab === 'sectors'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                  : 'text-[#5e7aa8] hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              Micro-Sectors (25 Raipur Grid)
            </button>
          </div>

          <Link
            href="/interactive-map"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono-data text-[11px] hover:bg-cyan-500/20 transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Inspect on Interactive GIS Map
          </Link>
        </div>

        {tab === 'districts' ? (
          <>
            {/* Indigenous Soil Classification Standards */}
            <div>
              <h2 className="font-display font-bold text-white text-[16px] mb-3 flex items-center gap-2">
                <Leaf className="w-5 h-5 text-emerald-400" />
                Chhattisgarh Indigenous Soil Orders: Standard Regenerative Packages
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {SOIL_STANDARDS.map(s => (
                  <div
                    key={s.soil}
                    className="card p-5 border"
                    style={{
                      borderColor: `${s.color}30`,
                      background: `linear-gradient(180deg, ${s.color}08 0%, rgba(14, 21, 34, 0.6) 100%)`
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono-data text-[10px] tracking-widest uppercase font-bold" style={{ color: s.color }}>
                        {s.soil} SOIL
                      </span>
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                    </div>
                    <div className="font-display font-semibold text-white text-sm mb-3">{s.order}</div>
                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-[#5e7aa8] font-mono-data text-[10px] block">Organic Amendment:</span>
                        <span className="text-[#e2ecff]">{s.fym}</span>
                      </div>
                      <div>
                        <span className="text-[#5e7aa8] font-mono-data text-[10px] block">Green Manure:</span>
                        <span className="text-emerald-300">{s.green}</span>
                      </div>
                      <div>
                        <span className="text-[#5e7aa8] font-mono-data text-[10px] block">Mineral & pH Buffering:</span>
                        <span className="text-cyan-300">{s.buffer}</span>
                      </div>
                      <div>
                        <span className="text-[#5e7aa8] font-mono-data text-[10px] block">Tillage Strategy:</span>
                        <span className="text-[#8ba3cc]">{s.tillage}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Zone & Soil Filters */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <div className="flex flex-wrap gap-2">
                {(['all', 'plains', 'hills', 'plateau'] as ZoneFilter[]).map(z => {
                  const active = zoneFilter === z;
                  const label = z === 'all' ? 'All Zones (33)' : z === 'plains' ? 'Central Plains (19)' : z === 'hills' ? 'Northern Hills (7)' : 'Bastar Plateau (7)';
                  return (
                    <button
                      key={z}
                      onClick={() => setZoneFilter(z)}
                      className={`px-3 py-1.5 rounded-xl font-mono-data text-[11px] font-semibold border transition-all ${
                        active
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                          : 'bg-white/[0.03] border-white/[0.08] text-[#5e7aa8] hover:text-white'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono-data text-[#5e7aa8]">Filter Soil:</span>
                {(['all', 'Kanhar', 'Dorsa', 'Matasi', 'Bhata'] as SoilFilter[]).map(s => {
                  const active = soilFilter === s;
                  return (
                    <button
                      key={s}
                      onClick={() => setSoilFilter(s)}
                      className={`px-2.5 py-1 rounded-lg font-mono-data text-[10px] font-semibold border transition-all ${
                        active
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-white/[0.02] border-white/[0.06] text-[#5e7aa8] hover:text-white'
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Districts Prescriptions Grid */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-white text-[15px] flex items-center gap-2">
                  <Sprout className="w-4 h-4 text-emerald-400" />
                  District-Specific Prescriptions ({filteredDistricts.length} Districts)
                </h3>
                <span className="font-mono-data text-[11px] text-[#5e7aa8]">
                  Sorted by Statewide Deficiency Rank (#1 to #33)
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredDistricts.map(d => {
                  const isHigh = d.mean_soc_deficiency >= 0.50;
                  const isMed = d.mean_soc_deficiency >= 0.46;
                  const borderCol = isHigh ? 'border-rose-500/30' : isMed ? 'border-amber-500/30' : 'border-emerald-500/30';
                  const badgeCol = isHigh ? '#ef4444' : isMed ? '#f59e0b' : '#10b981';

                  return (
                    <div
                      key={d.rank}
                      className={`card p-5 border ${borderCol} hover:scale-[1.01] transition-all bg-[#0e1522] flex flex-col justify-between`}
                    >
                      <div>
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <span className="font-mono-data text-[9px] tracking-widest text-[#5e7aa8] uppercase">
                              RANK #{d.rank} · {d.zone}
                            </span>
                            <h4 className="font-display font-bold text-white text-base mt-0.5">{d.name}</h4>
                          </div>
                          <span
                            className="font-mono-data text-[10px] font-bold px-2 py-0.5 rounded-md"
                            style={{ background: `${badgeCol}20`, color: badgeCol, border: `1px solid ${badgeCol}40` }}
                          >
                            {(d.mean_soc_deficiency * 100).toFixed(1)}% DEFICIT
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 mb-4">
                          <div className="rounded-lg p-2 bg-white/[0.02] border border-white/[0.05]">
                            <p className="font-mono-data text-[8px] text-[#5e7aa8]">SOIL ORDER</p>
                            <p className="font-mono-data text-[11px] font-semibold text-amber-300 truncate">{d.vernacular_soil}</p>
                          </div>
                          <div className="rounded-lg p-2 bg-white/[0.02] border border-white/[0.05]">
                            <p className="font-mono-data text-[8px] text-[#5e7aa8]">HIGH RISK</p>
                            <p className="font-mono-data text-[11px] font-bold" style={{ color: badgeCol }}>
                              {Math.round(d.high_risk_ha).toLocaleString()} ha
                            </p>
                          </div>
                          <div className="rounded-lg p-2 bg-white/[0.02] border border-white/[0.05]">
                            <p className="font-mono-data text-[8px] text-[#5e7aa8]">TOPSOIL pH</p>
                            <p className="font-mono-data text-[11px] font-semibold text-cyan-300">{d.mean_ph.toFixed(2)}</p>
                          </div>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                            <span className="font-mono-data text-[9px] text-cyan-400 font-bold block mb-1">
                              PRIMARY AGRONOMIC DIRECTIVE
                            </span>
                            <p className="text-xs text-[#cbd5e1] leading-relaxed">{d.primary_advisory}</p>
                          </div>
                          <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                            <span className="font-mono-data text-[9px] text-emerald-400 font-bold block mb-1">
                              MINERAL & RESIDUE MANAGEMENT
                            </span>
                            <p className="text-xs text-[#a0aec0] leading-relaxed">{d.secondary_advisory}</p>
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
                        <span className="font-mono-data text-[10px] text-[#5e7aa8]">
                          Bare Cropland: {Math.round(d.bare_soil_ha).toLocaleString()} ha
                        </span>
                        <Link
                          href="/interactive-map"
                          className="flex items-center gap-1 font-mono-data text-[10px] text-cyan-400 hover:text-cyan-300"
                        >
                          View GIS Map <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Micro-Sectors Global packages reference */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { tier: 'CRITICAL', color: TIER_COLORS[1], label: 'Tier 1: Immediate Action', count: criticalSectors.length,
                  actions: ['8-10 t/ha FYM / 3 t/ha Biochar', 'Agricultural Lime @ 2.5 t/ha', 'Green manuring: Dhaincha/Sunnhemp', 'INM: 75% RDF + 25% organic'] },
                { tier: 'MODERATE', color: TIER_COLORS[2], label: 'Tier 2: Seasonal Action', count: moderateSectors.length,
                  actions: ['3-5 t/ha FYM or vermicompost', 'Zero-tillage + straw mulching', 'Crop rotation with legumes', 'Balanced NPK + ZnSO4'] },
                { tier: 'STABLE',   color: TIER_COLORS[3], label: 'Tier 3: Preventive Care', count: stableSectors.length,
                  actions: ['1.5-2 t/ha compost maintenance', 'Soil test-based fertilisation', 'Crop residue incorporation', 'Biodiversity monitoring'] },
              ].map(g => (
                <div key={g.tier} className="card p-5" style={{ boxShadow: `0 0 20px ${g.color}15` }}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-mono-data text-[9px] tracking-widest mb-1" style={{ color: `${g.color}99` }}>STANDARD PACKAGE</p>
                      <p className="font-display font-semibold text-white text-[14px]">{g.label}</p>
                    </div>
                    <span className="font-mono-data text-2xl font-bold" style={{ color: g.color }}>{g.count}</span>
                  </div>
                  <div className="space-y-2 mt-3">
                    {g.actions.map((a, i) => (
                      <div key={i} className="flex gap-2 items-start">
                        <span className="w-4 h-4 shrink-0 rounded-full flex items-center justify-center text-[8px] font-bold mt-0.5"
                          style={{ background: `${g.color}20`, color: g.color }}>{i + 1}</span>
                        <span className="text-[12px] text-[#8ba3cc] leading-relaxed">{a}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Per-sector cards */}
            {[
              { label: 'Critical Sectors: Immediate Intervention Required', sectors: criticalSectors, color: TIER_COLORS[1] },
              { label: 'Moderate Sectors: Seasonal Action Required', sectors: moderateSectors, color: TIER_COLORS[2] },
              { label: 'Stable Sectors: Preventive Monitoring', sectors: stableSectors, color: TIER_COLORS[3] },
            ].map(group => (
              <section key={group.label}>
                <h2 className="font-display font-bold text-white text-[16px] mb-4 flex items-center gap-3">
                  <span className="w-2 h-6 rounded-sm inline-block" style={{ background: group.color }} />
                  {group.label}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {group.sectors.map((s: any) => {
                    const c = urgencyColor(s.urgency);
                    return (
                      <div key={s.rank} className="card p-5 hover:scale-[1.01] transition-transform duration-150"
                        style={{ boxShadow: `0 0 16px ${c.text}10` }}>
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <span className="font-mono-data text-[9px] tracking-widest" style={{ color: `${c.text}80` }}>RANK #{s.rank} · {s.gridId}</span>
                            <h3 className="font-display font-bold text-white text-[15px] mt-0.5">{s.name}</h3>
                          </div>
                          <Badge urgency={s.urgency} />
                        </div>
                        <div className="grid grid-cols-3 gap-2 mb-4">
                          {[
                            { label: 'RISK', val: s.risk.toFixed(3), col: c.text },
                            { label: 'SOC', val: `${s.soc.toFixed(1)} dg/kg`, col: '#8ba3cc' },
                            { label: '% HIGH', val: `${s.pct.toFixed(1)}%`, col: c.text },
                          ].map(stat => (
                            <div key={stat.label} className="rounded-lg px-2.5 py-2 bg-white/[0.03] border border-white/[0.05]">
                              <p className="font-mono-data text-[8px] text-[#3d5a80] tracking-widest">{stat.label}</p>
                              <p className="font-mono-data text-[12px] font-bold mt-0.5" style={{ color: stat.col }}>{stat.val}</p>
                            </div>
                          ))}
                        </div>
                        <div className="space-y-2">
                          {(s.recommendations || []).map((r: any, i: number) => (
                            <div key={i} className="flex gap-2 items-start">
                              <span className="font-mono-data text-[9px] font-bold shrink-0 mt-1" style={{ color: c.text }}>{i + 1}.</span>
                              <span className="text-[11px] text-[#5e7aa8] leading-snug">{r}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </>
        )}

      </div>
    </DashboardLayout>
  );
}
