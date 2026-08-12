'use client';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import Sidebar from './Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-screen bg-[#060a0f] relative overflow-hidden">
      {/* Subtle animated background pattern */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.02]" 
           style={{ backgroundImage: 'radial-gradient(#00d4ff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      
      {/* Mobile Menu Toggle (Visible only on mobile) */}
      <button 
        className="md:hidden fixed bottom-6 right-6 z-50 p-4 rounded-full bg-[#00d4ff] text-black shadow-[0_0_20px_rgba(0,212,255,0.4)]"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fade-in"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Wrapper */}
      <div className={`fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar />
      </div>

      <main className="flex-1 min-w-0 overflow-x-hidden relative z-10 w-full">
        {/* Key wrapper for page transitions */}
        <div key={pathname} className="animate-fade-in w-full min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
