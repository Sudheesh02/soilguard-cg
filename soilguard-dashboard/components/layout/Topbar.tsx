import { Clock, Satellite } from 'lucide-react';

interface TopbarProps {
  title: string;
  subtitle?: string;
}

export default function Topbar({ title, subtitle }: TopbarProps) {
  return (
    <header className="sticky top-0 z-10 bg-[#060a0f]/90 backdrop-blur-md border-b border-white/[0.06] px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold text-white tracking-tight">{title}</h1>
          {subtitle && <p className="text-[12px] text-[#5e7aa8] mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[rgba(0,212,255,0.06)] border border-[rgba(0,212,255,0.14)]">
            <Satellite className="w-3.5 h-3.5 text-[#00d4ff]" />
            <span className="font-mono-data text-[10px] text-[#00a8cc] font-semibold">Sentinel-2 L2A · 10m</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
            <Clock className="w-3.5 h-3.5 text-[#4a6890]" />
            <span className="font-mono-data text-[10px] text-[#4a6890]">Kharif Season · 2025</span>
          </div>
        </div>
      </div>
    </header>
  );
}
