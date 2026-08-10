'use client';
import { useState, useEffect } from 'react';

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

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const scrollTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setOpen(false);
    const el = document.querySelector(href);
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <nav
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-[rgba(6,9,15,0.92)] backdrop-blur-xl border-b border-[rgba(255,255,255,0.07)] shadow-[0_4px_24px_rgba(0,0,0,0.3)]'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[60px] flex items-center justify-between">

          {/* Logo */}
          <a href="#overview" onClick={e => scrollTo(e as any, '#overview')} className="flex items-center gap-2.5 no-underline">
            <div className="w-7 h-7 rounded-lg bg-[rgba(0,212,255,0.12)] border border-[rgba(0,212,255,0.25)] flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1L12.5 4.5V9.5L7 13L1.5 9.5V4.5L7 1Z" stroke="#00d4ff" strokeWidth="1.2" fill="rgba(0,212,255,0.1)"/>
                <circle cx="7" cy="7" r="2" fill="#00d4ff"/>
              </svg>
            </div>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif" }} className="font-bold text-[15px] text-[#e2ecff] tracking-tight">
              Soil<span className="text-[#00d4ff]">Guard</span>
              <span className="text-[#10b981]">-SOC</span>
            </span>
          </a>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {NAV_ITEMS.map(item => (
              <a
                key={item.href}
                href={item.href}
                onClick={e => scrollTo(e, item.href)}
                className="nav-link"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Badge + mobile toggle */}
          <div className="flex items-center gap-3">
            <span className="hidden sm:flex badge badge-amber items-center gap-1.5">
              <span className="live-dot" style={{ width: 5, height: 5, background: '#f59e0b', animationName: 'none' }} />
              IDEATHON 2026
            </span>
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
      {open && (
        <div className="fixed top-[60px] inset-x-0 z-40 bg-[rgba(6,9,15,0.97)] backdrop-blur-xl border-b border-[rgba(255,255,255,0.07)] py-4 px-4">
          {NAV_ITEMS.map(item => (
            <a
              key={item.href}
              href={item.href}
              onClick={e => scrollTo(e, item.href)}
              className="block px-4 py-3 text-[14px] font-medium text-[#8ba3cc] hover:text-[#e2ecff] hover:bg-[rgba(255,255,255,0.04)] rounded-lg transition-all"
            >
              {item.label}
            </a>
          ))}
        </div>
      )}
    </>
  );
}
