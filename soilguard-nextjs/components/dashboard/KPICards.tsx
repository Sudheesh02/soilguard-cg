'use client';
import { useEffect, useState } from 'react';
import { STATS } from '@/lib/data';
import { Globe, AlertTriangle, Leaf, Flame, TrendingUp, TrendingDown } from 'lucide-react';

// Simple count up hook
function useCountUp(end: number, duration: number = 1000) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // easeOutQuart
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      setCount(end * easeProgress);
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [end, duration]);

  return count;
}

const CARDS = [
  {
    label: 'Total AOI Area',
    rawValue: STATS.totalAreaHa,
    format: (v: number) => v.toLocaleString('en-IN', { maximumFractionDigits: 0 }),
    unit: 'ha',
    sub: 'Raipur-Durg agricultural belt',
    icon: Globe,
    color: '#00d4ff',
    bg: 'rgba(0,212,255,0.07)',
    border: 'rgba(0,212,255,0.18)',
    glow: '0 0 24px rgba(0,212,255,0.10)',
    hoverGlow: 'hover-glow-cyan',
    trend: +2.4,
    progress: 100,
    sparkline: 'M0,15 Q10,12 20,15 T40,10 T60,12 T80,5 T100,2'
  },
  {
    label: 'Critical Sectors',
    rawValue: STATS.criticalCount,
    format: (v: number) => Math.round(v).toString(),
    unit: `/ ${STATS.totalSectors}`,
    sub: `${STATS.moderateCount} moderate · ${STATS.stableCount} stable`,
    icon: AlertTriangle,
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.07)',
    border: 'rgba(239,68,68,0.18)',
    glow: '0 0 24px rgba(239,68,68,0.10)',
    hoverGlow: 'hover-glow-rose',
    trend: +12,
    progress: (STATS.criticalCount / STATS.totalSectors) * 100,
    sparkline: 'M0,15 Q10,15 20,12 T40,14 T60,8 T80,5 T100,0'
  },
  {
    label: 'Mean SOC (bare soil)',
    rawValue: STATS.avgSOC,
    format: (v: number) => v.toFixed(1),
    unit: 'dg/kg',
    sub: 'Critical threshold: 100 dg/kg',
    icon: Leaf,
    color: '#10b981',
    bg: 'rgba(16,185,129,0.07)',
    border: 'rgba(16,185,129,0.18)',
    glow: '0 0 24px rgba(16,185,129,0.10)',
    hoverGlow: 'hover-glow-emerald',
    trend: -1.2,
    progress: Math.min((STATS.avgSOC / 150) * 100, 100), // assuming 150 is good
    sparkline: 'M0,2 Q10,5 20,4 T40,8 T60,10 T80,12 T100,15'
  },
  {
    label: 'High-Risk Area',
    rawValue: STATS.totalHighRiskHa,
    format: (v: number) => v.toLocaleString('en-IN', { maximumFractionDigits: 0 }),
    unit: 'ha',
    sub: `${((STATS.totalHighRiskHa / STATS.totalBareHa) * 100).toFixed(1)}% of bare soil pixels`,
    icon: Flame,
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.07)',
    border: 'rgba(245,158,11,0.18)',
    glow: '0 0 24px rgba(245,158,11,0.10)',
    hoverGlow: 'hover-glow-amber',
    trend: +5.7,
    progress: (STATS.totalHighRiskHa / STATS.totalBareHa) * 100,
    sparkline: 'M0,15 Q10,14 20,10 T40,12 T60,6 T80,4 T100,2'
  },
];

export default function KPICards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {CARDS.map((c, i) => (
        <CardItem key={c.label} c={c} index={i} />
      ))}
    </div>
  );
}

function CardItem({ c, index }: { c: any, index: number }) {
  const animatedValue = useCountUp(c.rawValue, 1500 + index * 200);
  const displayValue = c.format(animatedValue);

  return (
    <div 
      className={`card p-5 relative overflow-hidden group animate-slide-up ${c.hoverGlow}`}
      style={{ boxShadow: c.glow, animationDelay: `${index * 100}ms` }}
    >
      {/* Animated gradient shine sweep */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
      </div>

      {/* Top right color bloom */}
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 blur-3xl transition-transform duration-500 group-hover:scale-150"
        style={{ background: c.color, transform: 'translate(20%,-30%)' }} />
        
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className="p-2.5 rounded-xl shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3" style={{ background: c.bg, border: `1px solid ${c.border}` }}>
          <c.icon className="w-4.5 h-4.5" style={{ color: c.color }} strokeWidth={2.5} />
        </div>
        
        {/* Trend Indicator */}
        <div className={`flex items-center gap-1 text-[10px] font-mono-data font-bold px-2 py-1 rounded-md bg-white/[0.03] border border-white/[0.05]`}>
          {c.trend > 0 ? <TrendingUp className="w-3 h-3 text-rose-400" /> : <TrendingDown className="w-3 h-3 text-emerald-400" />}
          <span className={c.trend > 0 ? (c.color === '#ef4444' || c.color === '#f59e0b' ? 'text-rose-400' : 'text-emerald-400') : 'text-emerald-400'}>
            {Math.abs(c.trend)}%
          </span>
        </div>
      </div>
      
      <div className="flex items-end gap-1.5 mb-1.5 relative z-10">
        <span className="font-display text-[32px] leading-none font-bold text-white tracking-tight">{displayValue}</span>
        <span className="font-mono-data text-xs font-semibold mb-1" style={{ color: c.color }}>{c.unit}</span>
      </div>
      
      <p className="text-[13px] font-semibold text-[#8ba3cc] mb-1.5 relative z-10">{c.label}</p>
      
      {/* Micro Progress Bar */}
      <div className="w-full h-1 bg-[#1a2332] rounded-full overflow-hidden mb-2 relative z-10">
        <div 
          className="h-full rounded-full transition-all duration-1000 ease-out" 
          style={{ width: `${c.progress}%`, backgroundColor: c.color, boxShadow: `0 0 10px ${c.color}` }}
        />
      </div>

      <div className="flex items-end justify-between relative z-10">
        <p className="text-[10px] text-[#4a6890] w-2/3 leading-snug">{c.sub}</p>
        
        {/* SVG Sparkline */}
        <div className="w-16 h-6 opacity-60 group-hover:opacity-100 transition-opacity">
          <svg viewBox="0 0 100 20" preserveAspectRatio="none" className="w-full h-full overflow-visible">
            <path 
              d={c.sparkline} 
              fill="none" 
              stroke={c.color} 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="drop-shadow-lg"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
