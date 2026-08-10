import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        base: '#06090f',
        surface: {
          1: '#0a0f1a',
          2: '#0e1522',
          3: '#12192c',
          4: '#192035',
          5: '#1f2a42',
        },
        accent: {
          cyan: '#00d4ff',
          'cyan-dim': '#00a8cc',
          emerald: '#10b981',
          'emerald-dim': '#059669',
          amber: '#f59e0b',
          'amber-dim': '#d97706',
          violet: '#818cf8',
          red: '#ef4444',
        },
        txt: {
          primary: '#e2ecff',
          secondary: '#8ba3cc',
          tertiary: '#4a6890',
          dim: '#2d4060',
        },
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'dot-grid': 'radial-gradient(rgba(0,212,255,0.06) 1px, transparent 1px)',
        'hero-glow': 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(0,212,255,0.12), transparent)',
        'hero-glow-emerald': 'radial-gradient(ellipse 60% 40% at 80% 60%, rgba(16,185,129,0.07), transparent)',
        'vignette': 'radial-gradient(ellipse at center, transparent 50%, rgba(6,9,15,0.85) 100%)',
        'card-glow-cyan': 'radial-gradient(ellipse 100% 80% at 50% -20%, rgba(0,212,255,0.08), transparent)',
        'card-glow-emerald': 'radial-gradient(ellipse 100% 80% at 50% -20%, rgba(16,185,129,0.07), transparent)',
        'card-glow-amber': 'radial-gradient(ellipse 100% 80% at 50% -20%, rgba(245,158,11,0.07), transparent)',
        'card-glow-red': 'radial-gradient(ellipse 100% 80% at 50% -20%, rgba(239,68,68,0.07), transparent)',
        'pipe-line': 'linear-gradient(90deg, rgba(0,212,255,0.4), rgba(16,185,129,0.4))',
      },
      backgroundSize: {
        'dot-grid': '30px 30px',
      },
      animation: {
        'live-pulse': 'livePulse 2.5s ease infinite',
        'fade-up': 'fadeUp 600ms cubic-bezier(0.16,1,0.3,1) both',
        'fade-in': 'fadeIn 400ms ease both',
        'scan-line': 'scanLine 6s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow-breathe': 'glowBreathe 4s ease infinite',
        'counter': 'counterUp 1200ms cubic-bezier(0.16,1,0.3,1) both',
        'blink': 'blink 1s step-end infinite',
        'slide-right': 'slideRight 800ms cubic-bezier(0.16,1,0.3,1) both',
      },
      keyframes: {
        livePulse: {
          '0%,100%': { boxShadow: '0 0 0 0 rgba(16,185,129,0.5)' },
          '50%': { boxShadow: '0 0 0 6px rgba(16,185,129,0)' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        scanLine: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        glowBreathe: {
          '0%,100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
        counterUp: {
          from: { opacity: '0', transform: 'translateY(20px) scale(0.95)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        blink: {
          '0%,100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        slideRight: {
          from: { opacity: '0', transform: 'translateX(-12px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
      },
      boxShadow: {
        'glow-cyan': '0 0 30px rgba(0,212,255,0.2), 0 0 60px rgba(0,212,255,0.1)',
        'glow-emerald': '0 0 30px rgba(16,185,129,0.2), 0 0 60px rgba(16,185,129,0.1)',
        'glow-amber': '0 0 20px rgba(245,158,11,0.25)',
        'glow-red': '0 0 20px rgba(239,68,68,0.25)',
        'card': '0 4px 24px rgba(0,0,0,0.3), 0 1px 4px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.04)',
        'card-hover': '0 8px 40px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)',
      },
    },
  },
  plugins: [],
};

export default config;
