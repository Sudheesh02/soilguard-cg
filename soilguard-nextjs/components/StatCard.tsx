'use client';

interface StatCardProps {
  /** Full CSS background value (radial-gradient + base color). */
  background?: string;
  /** Full CSS border shorthand (e.g. '1px solid rgba(0,212,255,0.18)'). */
  border?: string;
  /** Full CSS box-shadow value; default keeps cards flat on dark background. */
  shadow?: string;
  hover?: boolean;
  className?: string;
  children: React.ReactNode;
}

/**
 * The recurring "glowing glass" card shell used across the landing sections
 * (Hero KPIs, Problem stats, Pipeline stages, Methodology notes, Roadmap).
 * Centralizes the rounded-2xl + radial-gradient + border + hover-lift pattern.
 */
export default function StatCard({
  background = 'radial-gradient(ellipse 120% 60% at 50% -10%, rgba(0,212,255,0.06), transparent), #0e1522',
  border = '1px solid rgba(255,255,255,0.08)',
  shadow = 'none',
  hover = false,
  className = '',
  children,
}: StatCardProps) {
  return (
    <div
      className={`rounded-2xl transition-all duration-300 ${hover ? 'hover:-translate-y-1' : ''} ${className}`}
      style={{ background, border, boxShadow: shadow }}
    >
      {children}
    </div>
  );
}
