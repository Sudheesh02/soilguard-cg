'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, BarChart3, Map, Leaf, Satellite, Activity } from 'lucide-react';

const NAV = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, count: null },
  { href: '/sectors', label: 'Sectors', icon: BarChart3, count: 142 },
  { href: '/maps', label: 'Maps', icon: Map, count: 4 },
  { href: '/recommendations', label: 'Recommendations', icon: Leaf, count: 12 },
];

export default function Sidebar() {
  const path = usePathname();
  return (
    <aside className="w-60 shrink-0 flex flex-col h-screen sticky top-0 bg-[#080d14] relative border-r border-white/[0.02]">
      {/* Animated right border gradient */}
      <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-[#00d4ff]/20 to-transparent" />
      
      <div className="px-5 py-6 border-b border-white/[0.04] flex items-center gap-3 relative overflow-hidden group cursor-pointer">
        {/* Subtle shine effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
        
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00d4ff] to-[#10b981] flex items-center justify-center shadow-[0_0_15px_rgba(0,212,255,0.3)] group-hover:scale-105 transition-transform duration-300">
          <Satellite className="w-4.5 h-4.5 text-black" strokeWidth={2.5} />
        </div>
        <div>
          <div className="font-display text-[15px] font-bold text-white tracking-tight group-hover:text-[#00d4ff] transition-colors">SoilGuard</div>
          <div className="font-mono-data text-[9px] text-[#4a6890] tracking-widest mt-0.5">SOC SENTINEL v2</div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        <p className="font-mono-data text-[10px] text-[#3d5a80] tracking-widest px-3 pb-3">NAVIGATION</p>
        
        {NAV.map(({ href, label, icon: Icon, count }) => {
          const active = path === href || path.startsWith(href + '/');
          return (
            <Link key={href} href={href}
              className={`relative flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-300 group ${
                active
                  ? 'bg-gradient-to-r from-[rgba(0,212,255,0.1)] to-transparent text-[#00d4ff]'
                  : 'text-[#5e7aa8] hover:text-[#dce8ff] hover:bg-white/[0.04]'
              }`}>
              
              {/* Active left glowing bar */}
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-3/5 bg-[#00d4ff] rounded-r-full shadow-[0_0_10px_#00d4ff]" />
              )}
              
              <div className="flex items-center gap-3 z-10">
                <Icon className={`w-4 h-4 transition-all duration-300 ${active ? 'text-[#00d4ff] scale-110' : 'text-[#3d5a80] group-hover:text-[#8ba3cc] group-hover:scale-110'}`} strokeWidth={active ? 2.5 : 2} />
                <span className={active ? 'tracking-wide' : ''}>{label}</span>
              </div>
              
              {/* Badge */}
              {count && (
                <div className={`px-2 py-0.5 rounded-full text-[10px] font-mono-data transition-colors ${
                  active 
                    ? 'bg-[#00d4ff]/20 text-[#00d4ff] border border-[#00d4ff]/30' 
                    : 'bg-[#1a2332] text-[#4a6890] group-hover:bg-[#2a3f5c] group-hover:text-[#8ba3cc]'
                }`}>
                  {count}
                </div>
              )}
            </Link>
          );
        })}
        
        <div className="my-4 border-t border-white/[0.04] mx-3" />
        <Link
          href="/"
          className="flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] font-medium text-[#8ba3cc] hover:text-[#00d4ff] hover:bg-[rgba(0,212,255,0.06)] transition-all group border border-transparent hover:border-[rgba(0,212,255,0.15)]"
        >
          <div className="flex items-center gap-3">
            <span className="text-sm">🌐</span>
            <span>Landing Page</span>
          </div>
          <span className="text-xs text-[#00d4ff] group-hover:translate-x-0.5 transition-transform">↗</span>
        </Link>
      </nav>

      <div className="px-4 pb-6 pt-3">
        <div className="rounded-xl bg-gradient-to-b from-[rgba(16,185,129,0.08)] to-[rgba(16,185,129,0.02)] border border-[rgba(16,185,129,0.2)] px-4 py-3.5 relative overflow-hidden group">
          {/* Subtle pulse background */}
          <div className="absolute inset-0 bg-[#10b981]/5 animate-pulse" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10b981] shadow-[0_0_8px_#10b981]"></span>
              </div>
              <span className="font-mono-data text-[9px] text-[#10b981] font-bold tracking-widest">PIPELINE ACTIVE</span>
            </div>
            <p className="text-[11px] text-[#8ba3cc] leading-relaxed font-medium">22,702 ha mapped · 4 phases</p>
            <p className="font-mono-data text-[10px] text-[#4a6890] mt-1.5">Raipur–Durg AOI · CG</p>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 px-2 hover:text-white transition-colors cursor-pointer group">
          <Activity className="w-3.5 h-3.5 text-[#3d5a80] group-hover:text-[#00d4ff] transition-colors" />
          <span className="font-mono-data text-[9px] text-[#3d5a80] group-hover:text-[#5e7aa8] transition-colors">ISRO NRSC · Sentinel-2 L2A</span>
        </div>
      </div>
    </aside>
  );
}
