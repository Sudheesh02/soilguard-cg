'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, BarChart3, Map, Leaf, Satellite, Activity } from 'lucide-react';

const NAV = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/sectors', label: 'Sectors', icon: BarChart3 },
  { href: '/maps', label: 'Maps', icon: Map },
  { href: '/recommendations', label: 'Recommendations', icon: Leaf },
];

export default function Sidebar() {
  const path = usePathname();
  return (
    <aside className="w-60 shrink-0 flex flex-col h-screen sticky top-0 bg-[#080d14] border-r border-white/[0.06]">
      <div className="px-5 py-5 border-b border-white/[0.06] flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00d4ff] to-[#10b981] flex items-center justify-center shadow-lg">
          <Satellite className="w-4 h-4 text-black" strokeWidth={2.5} />
        </div>
        <div>
          <div className="font-display text-sm font-bold text-white tracking-tight">SoilGuard</div>
          <div className="font-mono-data text-[9px] text-[#4a6890] tracking-widest">SOC SENTINEL v2</div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
        <p className="font-mono-data text-[9px] text-[#3d5a80] tracking-widest px-3 pb-3">NAVIGATION</p>
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = path === href || path.startsWith(href + '/');
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 group ${
                active
                  ? 'bg-[rgba(0,212,255,0.08)] text-[#00d4ff] border border-[rgba(0,212,255,0.18)]'
                  : 'text-[#5e7aa8] hover:text-[#dce8ff] hover:bg-white/[0.04] border border-transparent'
              }`}>
              <Icon className={`w-4 h-4 transition-colors ${active ? 'text-[#00d4ff]' : 'text-[#3d5a80] group-hover:text-[#8ba3cc]'}`} strokeWidth={active ? 2.5 : 2} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 pb-5 pt-3 border-t border-white/[0.06]">
        <div className="rounded-xl bg-[rgba(16,185,129,0.05)] border border-[rgba(16,185,129,0.14)] px-3 py-3">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
            <span className="font-mono-data text-[9px] text-[#10b981] font-semibold tracking-widest">PIPELINE COMPLETE</span>
          </div>
          <p className="text-[11px] text-[#4a6890] leading-relaxed">22,702 ha mapped · 4 phases</p>
          <p className="font-mono-data text-[10px] text-[#3d5a80] mt-1">Raipur–Durg AOI · CG</p>
        </div>
        <div className="mt-3 flex items-center gap-2 px-1">
          <Activity className="w-3 h-3 text-[#3d5a80]" />
          <span className="font-mono-data text-[9px] text-[#3d5a80]">ISRO NRSC · Sentinel-2 L2A</span>
        </div>
      </div>
    </aside>
  );
}
