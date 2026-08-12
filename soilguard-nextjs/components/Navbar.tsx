'use client';
import { useState, useEffect, useRef } from 'react';

const NAV_ITEMS = [
  { label: 'Problem',    href: '#problem' },
  { label: 'Pipeline',   href: '#pipeline' },
  { label: 'Results',    href: '#results' },
  { label: 'Rankings',   href: '#rankings' },
  { label: 'Methodology', href: '#methodology' },
  { label: 'Terminal',   href: '#terminal' },
  { label: 'Roadmap',    href: '#roadmap' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen]         = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const handler = () => {
      setScrolled(window.scrollY > 24);
      
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      setScrollProgress((winScroll / height) * 100);
    };
    window.addEventListener('scroll', handler, { passive: true });
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(`#${entry.target.id}`);
          }
        });
      },
      { rootMargin: '-20% 0px -80% 0px' }
    );
    
    NAV_ITEMS.forEach(item => {
      const el = document.querySelector(item.href);
      if (el) observer.observe(el);
    });

    return () => {
      window.removeEventListener('scroll', handler);
      observer.disconnect();
    };
  }, []);

  const scrollTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setOpen(false);
    const el = document.querySelector(href);
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <div 
        className="fixed top-0 left-0 h-[2px] bg-gradient-to-r from-[#00d4ff] to-[#10b981] z-[100] transition-all duration-75 ease-out shadow-[0_0_10px_rgba(0,212,255,0.8)]"
        style={{ width: `${scrollProgress}%` }}
      />
      <nav
        className={`fixed top-[2px] inset-x-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-[rgba(6,9,15,0.7)] backdrop-blur-2xl border-b border-[rgba(255,255,255,0.05)] shadow-[0_4px_30px_rgba(0,0,0,0.5),inset_0_-1px_0_rgba(0,212,255,0.1)]'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[60px] flex items-center justify-between">

          {/* Logo */}
          <a href="#overview" onClick={e => scrollTo(e, '#overview')} className="flex items-center gap-2.5 no-underline group">
            <div className="w-8 h-8 rounded-xl bg-[rgba(0,212,255,0.1)] border border-[rgba(0,212,255,0.25)] flex items-center justify-center group-hover:shadow-[0_0_15px_rgba(0,212,255,0.4)] group-hover:border-[rgba(0,212,255,0.4)] transition-all duration-300 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-[rgba(0,212,255,0.2)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="relative z-10">
                <path d="M7 1L12.5 4.5V9.5L7 13L1.5 9.5V4.5L7 1Z" stroke="#00d4ff" strokeWidth="1.2" fill="rgba(0,212,255,0.1)"/>
                <circle cx="7" cy="7" r="2" fill="#00d4ff" className="animate-pulse"/>
              </svg>
            </div>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif" }} className="font-bold text-[16px] text-[#e2ecff] tracking-tight group-hover:text-white transition-colors">
              Soil<span className="text-[#00d4ff]">Guard</span>
              <span className="text-[#10b981]">-SOC</span>
            </span>
          </a>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6 relative">
            {NAV_ITEMS.map(item => (
              <a
                key={item.href}
                href={item.href}
                onClick={e => scrollTo(e, item.href)}
                className={`nav-link ${activeSection === item.href ? 'text-[#e2ecff]' : ''}`}
              >
                {item.label}
                {activeSection === item.href && (
                  <span className="absolute -bottom-[12px] left-1/2 -translate-x-1/2 w-4 h-[2px] bg-[#00d4ff] rounded-t-md shadow-[0_-2px_10px_rgba(0,212,255,0.8)]" />
                )}
              </a>
            ))}
          </div>

          {/* Dashboard Link + mobile toggle */}
          <div className="flex items-center gap-3">
            <a
              href="http://localhost:3001"
              target="_blank"
              rel="noopener noreferrer"
              className="badge badge-cyan px-3.5 py-1.5 text-[11px] font-bold flex items-center gap-1.5 hover:bg-[rgba(0,212,255,0.2)] transition-all shadow-lg text-[#00d4ff]"
            >
              <span>Dashboard ↗</span>
            </a>
            <button
              onClick={() => setOpen(o => !o)}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg border border-[rgba(255,255,255,0.10)] bg-[rgba(255,255,255,0.04)] text-[#8ba3cc] hover:text-[#e2ecff] hover:bg-[rgba(255,255,255,0.07)] transition-all"
              aria-label="Toggle menu"
            >
              {open ? (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <div 
        className={`fixed top-[62px] right-0 bottom-0 w-64 bg-[rgba(6,9,15,0.98)] backdrop-blur-3xl border-l border-[rgba(255,255,255,0.07)] z-40 p-6 transform transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1) ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col gap-2 mt-4">
          {NAV_ITEMS.map((item, i) => (
            <a
              key={item.href}
              href={item.href}
              onClick={e => scrollTo(e, item.href)}
              style={{ transitionDelay: `${i * 50}ms` }}
              className={`block px-4 py-3 text-[15px] font-medium rounded-xl transition-all duration-300 ${
                activeSection === item.href 
                  ? 'text-[#e2ecff] bg-[rgba(0,212,255,0.1)] border border-[rgba(0,212,255,0.2)]'
                  : 'text-[#8ba3cc] hover:text-[#e2ecff] hover:bg-[rgba(255,255,255,0.04)] border border-transparent'
              } ${open ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>
    </>
  );
}
