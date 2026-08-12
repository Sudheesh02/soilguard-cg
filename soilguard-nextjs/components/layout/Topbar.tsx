'use client';
import { useState, useEffect } from 'react';
import { Clock, Satellite, Bell, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { AnimatedThemeToggler } from '@/components/AnimatedThemeToggler';

interface TopbarProps {
  title: string;
  subtitle?: string;
}

export default function Topbar({ title, subtitle }: TopbarProps) {
  const [time, setTime] = useState<string>('');
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    // Theme sync
    const saved = (localStorage.getItem('soilguard-theme') as 'dark' | 'light') || 'dark';
    setTheme(saved);
    document.documentElement.classList.toggle('light', saved === 'light');

    // Clock
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);

    // Scroll handler
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('soilguard-theme', next);
    document.documentElement.classList.toggle('light', next === 'light');
  };

  return (
    <header className={`sticky top-0 z-40 transition-all duration-300 ${
      scrolled 
        ? 'bg-[rgba(6,10,15,0.85)] backdrop-blur-xl border-b border-[#00d4ff]/20 shadow-[0_4px_30px_rgba(0,0,0,0.5),0_1px_15px_rgba(0,212,255,0.05)]' 
        : 'bg-[#060a0f]/90 backdrop-blur-md border-b border-white/[0.06]'
    } px-8 py-4`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Breadcrumb-style navigation */}
          <Link href="/dashboard" className="text-[#5e7aa8] hover:text-[#00d4ff] transition-colors">
            <span className="font-mono-data text-xs font-semibold tracking-wide">SOILGUARD</span>
          </Link>
          <ChevronRight className="w-4 h-4 text-[#3d5a80]" />
          <div>
            <h1 className="font-display text-[19px] font-bold text-white tracking-tight leading-none">{title}</h1>
            {subtitle && <p className="text-[11px] text-[#5e7aa8] mt-1 font-medium">{subtitle}</p>}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="group relative flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[rgba(0,212,255,0.04)] border border-[rgba(0,212,255,0.14)] hover:bg-[rgba(0,212,255,0.08)] hover:border-[rgba(0,212,255,0.3)] transition-all cursor-help">
              <Satellite className="w-3.5 h-3.5 text-[#00d4ff] group-hover:animate-pulse" />
              <span className="font-mono-data text-[10px] text-[#00a8cc] font-semibold group-hover:text-[#00d4ff]">Sentinel-2 L2A · 10m</span>
              {/* Tooltip */}
              <div className="absolute top-full right-0 mt-2 w-48 p-2 rounded-lg bg-[#0c1018] border border-white/[0.1] shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 text-[10px] text-[#8ba3cc]">
                Live multispectral satellite feed with 10m spatial resolution.
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.05] transition-colors">
              <Clock className="w-3.5 h-3.5 text-[#4a6890]" />
              <span className="font-mono-data text-[10px] text-[#8ba3cc]">{time || '...'}</span>
              <span className="font-mono-data text-[10px] text-[#4a6890] ml-1 pl-2 border-l border-white/[0.1]">Kharif 2025</span>
            </div>
          </div>
          
          <div className="w-[1px] h-6 bg-white/[0.1] mx-1" />
          
          {/* Theme Toggle (Light / Dark) */}
          <AnimatedThemeToggler />
          
          {/* Notification Bell */}
          <button className="relative p-2 rounded-full hover:bg-white/[0.05] text-[#5e7aa8] hover:text-white transition-colors">
            <Bell className="w-4.5 h-4.5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#ef4444] border-2 border-[#060a0f]" />
          </button>
        </div>
      </div>
    </header>
  );
}
