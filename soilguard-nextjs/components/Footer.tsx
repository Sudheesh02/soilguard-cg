'use client';

import { METRICS } from '@/lib/site-data';

const LINKS = [
  {
    title: 'Platform',
    items: [
      { label: 'Overview',        href: '#overview' },
      { label: 'Problem',         href: '#problem' },
      { label: 'Pipeline',        href: '#pipeline' },
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
      { label: 'Sentinel-2 L2A',    href: '#pipeline' },
      { label: 'SoilGrids WCS',     href: '#methodology' },
      { label: 'Random Forest ML',   href: '#pipeline' },
      { label: 'Team BioXtreme',    href: '#team' },
    ],
  },
];

export default function Footer() {
  const scrollTo = (href: string) => {
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-[#06090f] relative overflow-hidden">
      {/* Top divider */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#00d4ff] to-transparent opacity-50" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">

        <div className="grid grid-cols-1 md:grid-cols-12 gap-y-12 gap-x-8 mb-16">

          {/* Brand & Mission */}
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
                <span className="text-[#10b981]">-SOC</span>
              </span>
            </div>

            <p className="text-[14px] text-[#8ba3cc] leading-relaxed mb-6 max-w-md text-balance">
              Terminal-native geospatial ML platform for satellite-driven soil health risk mapping. {METRICS.bareSoilHa.toLocaleString('en-IN', { maximumFractionDigits: 0 })} ha evaluated at 10m resolution. Developed by Team BioXtreme.
            </p>

            <div className="flex flex-wrap gap-2 mb-6">
              <span className="badge badge-cyan shadow-lg">TEAM BIOXTREME</span>
              <span className="badge badge-emerald shadow-lg">10m SATELLITE ENGINE</span>
              <span className="badge badge-amber shadow-lg">100% OFFLINE CACHE</span>
            </div>

            {/* Direct Email Contact */}
            <div className="flex items-center gap-3 text-xs font-mono text-[#8ba3cc]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00d4ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              <span>Contact:</span>
              <a href="mailto:sudheesh.singh02@gmail.com" className="text-[#00d4ff] hover:underline font-bold">
                sudheesh.singh02@gmail.com
              </a>
            </div>
          </div>

          {/* Link columns */}
          {LINKS.map(col => (
            <div key={col.title} className="md:col-span-2 lg:col-span-2">
              <p className="eyebrow mb-5">{col.title}</p>
              <ul className="space-y-3">
                {col.items.map(item => (
                  <li key={item.label}>
                    <button
                      type="button"
                      onClick={() => scrollTo(item.href)}
                      className="text-[13px] text-[#4a6890] hover:text-[#00d4ff] transition-colors text-left cursor-pointer flex items-center gap-1 group"
                    >
                      <span>{item.label}</span>
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px]">›</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* AOI Details in 1 line strip */}
          <div className="md:col-span-12 border-t border-white/10 pt-6 mt-4">
            <div className="flex flex-wrap items-center justify-between gap-4 font-mono text-xs text-[#8ba3cc] bg-white/[0.02] p-3.5 px-5 rounded-xl border border-white/[0.06]">
              <div className="flex items-center gap-2">
                <span className="text-[#00d4ff] font-bold">AOI DETAILS:</span>
                <span className="text-[#e2ecff]">Raipur–Durg Agricultural Belt, Chhattisgarh</span>
              </div>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-[11.5px]">
                <span>BBox: <strong className="text-white">81.60°–81.80°E, 21.10°–21.30°N</strong></span>
                <span>CRS: <strong className="text-white">EPSG:32644</strong></span>
                <span>Resolution: <strong className="text-white">10m / px</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[rgba(255,255,255,0.06)] pt-8 flex flex-col md:flex-row items-center justify-between gap-6 relative">
          <button 
            onClick={() => scrollTo('#overview')} 
            className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 bg-[#0e1522] border border-[rgba(255,255,255,0.1)] rounded-full flex items-center justify-center text-[#8ba3cc] hover:text-[#00d4ff] hover:border-[#00d4ff] hover:shadow-[0_0_15px_rgba(0,212,255,0.3)] transition-all group"
            aria-label="Back to top"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-y-0.5 transition-transform"><path d="M18 15l-6-6-6 6"/></svg>
          </button>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full">
            <p className="text-[12px] text-[#4a6890] font-mono text-center md:text-left">
              SoilGuard-CG v1.0 · Team BioXtreme (<a href="mailto:sudheesh.singh02@gmail.com" className="text-[#00d4ff] hover:underline">sudheesh.singh02@gmail.com</a>)<br/>
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
