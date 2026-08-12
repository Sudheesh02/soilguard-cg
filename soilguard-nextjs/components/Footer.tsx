'use client';

import { METRICS } from '@/lib/site-data';

const LINKS = [
  {
    title: 'Platform',
    items: [
      { label: 'Overview',      href: '#overview' },
      { label: 'Problem',       href: '#problem' },
      { label: 'Pipeline',      href: '#pipeline' },
      { label: 'Spatial Results', href: '#results' },
    ],
  },
  {
    title: 'Analysis',
    items: [
      { label: 'Priority Rankings', href: '#rankings' },
      { label: 'Methodology',       href: '#methodology' },
      { label: 'Terminal Demo',     href: '#terminal' },
      { label: 'Roadmap',           href: '#roadmap' },
    ],
  },
  {
    title: 'Data & Tools',
    items: [
      { label: 'Sentinel-2 L2A',  href: '#' },
      { label: 'SoilGrids WCS',   href: '#' },
      { label: 'STAC Earth-Search', href: '#' },
      { label: 'Random Forest ML', href: '#' },
    ],
  },
];

export default function Footer() {
  const scrollTo = (href: string) =>
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <footer className="bg-[#06090f] relative overflow-hidden">
      {/* Animated top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#00d4ff] to-transparent opacity-50" />
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#10b981] to-transparent opacity-30 animate-[shimmer_3s_infinite]" />
      
      {/* Background glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-[#00d4ff] opacity-[0.02] rounded-[100%] blur-[80px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">

        <div className="grid grid-cols-1 md:grid-cols-12 gap-y-12 gap-x-8 mb-16">

          {/* Brand & Mission (Asymmetric wide column) */}
          <div className="md:col-span-5 lg:col-span-6 pr-4">
            <div className="flex items-center gap-3 mb-5 group">
              <div className="w-10 h-10 rounded-xl bg-[rgba(0,212,255,0.10)] border border-[rgba(0,212,255,0.22)] flex items-center justify-center group-hover:shadow-[0_0_20px_rgba(0,212,255,0.3)] transition-all">
                <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                  <path d="M8 1L14 4.5v7L8 15l-6-3.5v-7L8 1Z" stroke="#00d4ff" strokeWidth="1.3" fill="rgba(0,212,255,0.1)"/>
                  <circle cx="8" cy="8" r="2.5" fill="#00d4ff" className="animate-pulse"/>
                </svg>
              </div>
              <span style={{ fontFamily: "'Space Grotesk', sans-serif" }} className="text-[20px] font-extrabold text-[#e2ecff] tracking-tight">
                Soil<span className="text-[#00d4ff]">Guard</span>
                <span className="text-[#10b981]">-CG</span>
              </span>
            </div>

            <p className="text-[14px] text-[#8ba3cc] leading-relaxed mb-6 max-w-md text-balance">
              Terminal-native geospatial ML platform for satellite-driven soil health risk mapping. {METRICS.bareSoilHa.toLocaleString('en-IN', { maximumFractionDigits: 0 })} ha evaluated at 10m resolution. Built for National Space Day Ideathon 2026.
            </p>

            <div className="flex flex-wrap gap-2 mb-6">
              <span className="badge badge-cyan shadow-lg">10m SATELLITE ENGINE</span>
              <span className="badge badge-emerald shadow-lg">RANDOM FOREST ML</span>
              <span className="badge badge-amber shadow-lg">100% OFFLINE CACHE</span>
            </div>

            {/* Social / Contact */}
            <div className="flex items-center gap-4">
              {['GitHub', 'Twitter', 'LinkedIn'].map(s => (
                <a key={s} href="#" className="text-[13px] text-[#4a6890] hover:text-[#00d4ff] hover:drop-shadow-[0_0_8px_rgba(0,212,255,0.8)] transition-all flex items-center gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                  {s}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {LINKS.map(col => (
            <div key={col.title} className="md:col-span-2 lg:col-span-2">
              <p className="eyebrow mb-5">{col.title}</p>
              <ul className="space-y-3">
                {col.items.map(item => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      onClick={e => { if (item.href.startsWith('#')) { e.preventDefault(); scrollTo(item.href); } }}
                      className="text-[13px] text-[#4a6890] hover:text-[#8ba3cc] transition-colors cursor-pointer"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* AOI */}
          <div className="md:col-span-3 lg:col-span-2">
            <p className="eyebrow mb-5">AOI Details</p>
            <div className="space-y-3 font-mono text-[11px] bg-[rgba(255,255,255,0.02)] p-4 rounded-xl border border-[rgba(255,255,255,0.04)]">
              {[
                { label: 'BBox', value: '81.60°E, 21.10°N' },
                { label: '    ', value: '81.80°E, 21.30°N' },
                { label: 'CRS ', value: 'EPSG:32644' },
                { label: 'Res ', value: '10m / px' },
              ].map((d, idx) => (
                <div key={idx} className="flex justify-between items-center border-b border-[rgba(255,255,255,0.02)] last:border-0 pb-1 last:pb-0">
                  <span className="text-[#4a6890]">{d.label}</span>
                  <span className="text-[#e2ecff] font-semibold">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Divider & Bottom bar */}
        <div className="border-t border-[rgba(255,255,255,0.06)] pt-8 flex flex-col md:flex-row items-center justify-between gap-6 relative">
          <button 
            onClick={() => scrollTo('body')} 
            className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 bg-[#0e1522] border border-[rgba(255,255,255,0.1)] rounded-full flex items-center justify-center text-[#8ba3cc] hover:text-[#00d4ff] hover:border-[#00d4ff] hover:shadow-[0_0_15px_rgba(0,212,255,0.3)] transition-all group"
            aria-label="Back to top"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-y-0.5 transition-transform"><path d="M18 15l-6-6-6 6"/></svg>
          </button>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[12px] text-[#2d4060] font-mono text-center md:text-left">
              SoilGuard-CG v1.0 · National Space Day Ideathon 2026 · COSINE NIT Raipur × NRSC/ISRO<br/>
              Built with Sentinel-2 L2A · Random Forest ML · STAC Earth-Search · rasterio · scikit-learn
            </p>
            <div className="flex items-center gap-2">
              <div className="live-dot" />
              <span className="font-mono text-[11px] text-[#4a6890]">Sentinel-2 L2A · 100% Offline</span>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}
