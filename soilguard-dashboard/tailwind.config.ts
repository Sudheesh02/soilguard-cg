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
        bg: { DEFAULT: '#060a0f', card: '#0c1018', border: '#1a2332' },
        cyan: { DEFAULT: '#00d4ff', dim: '#00d4ff33', muted: '#00a8cc' },
        emerald: { DEFAULT: '#10b981', dim: '#10b98133', muted: '#0d9669' },
        amber: { DEFAULT: '#f59e0b', dim: '#f59e0b33', muted: '#d97706' },
        rose: { DEFAULT: '#ef4444', dim: '#ef444433', muted: '#dc2626' },
        violet: { DEFAULT: '#818cf8', dim: '#818cf833' },
        slate: {
          50: '#f0f5ff', 100: '#dce8ff', 200: '#b8d0f0',
          300: '#8ba3cc', 400: '#5e7aa8', 500: '#3d5a80',
          600: '#2a3f5c', 700: '#1e2e44', 800: '#14202f', 900: '#0c1520',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Menlo', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'grid-pattern': `linear-gradient(rgba(0,212,255,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,212,255,0.04) 1px, transparent 1px)`,
      },
      backgroundSize: { grid: '40px 40px' },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        glow: { '0%': { opacity: '0.6' }, '100%': { opacity: '1' } },
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(12px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
      },
      boxShadow: {
        card: '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)',
        glow: '0 0 20px rgba(0,212,255,0.15)',
        'glow-amber': '0 0 20px rgba(245,158,11,0.15)',
        'glow-rose': '0 0 20px rgba(239,68,68,0.15)',
        'glow-emerald': '0 0 20px rgba(16,185,129,0.15)',
      },
    },
  },
  plugins: [],
};

export default config;
