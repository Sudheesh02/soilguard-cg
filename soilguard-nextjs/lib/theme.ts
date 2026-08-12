/**
 * SoilGuard dashboard color theme.
 * Single source of truth for urgency / tier / phase colors so components
 * never re-declare the same hex triplets.
 */

export type Urgency = 'CRITICAL' | 'MODERATE' | 'STABLE';
export type Tier = 1 | 2 | 3;

export const TIER_COLORS = {
  1: '#ef4444',
  2: '#f59e0b',
  3: '#10b981',
} as const;

export const TIER_NAMES: Record<Tier, Urgency> = {
  1: 'CRITICAL',
  2: 'MODERATE',
  3: 'STABLE',
};

export const URGENCY_COLORS: Record<Urgency, { text: string; bg: string; border: string }> = {
  CRITICAL: { text: '#ef4444', bg: 'rgba(239,68,68,0.10)', border: 'rgba(239,68,68,0.25)' },
  MODERATE: { text: '#f59e0b', bg: 'rgba(245,158,11,0.10)', border: 'rgba(245,158,11,0.25)' },
  STABLE: { text: '#10b981', bg: 'rgba(16,185,129,0.10)', border: 'rgba(16,185,129,0.25)' },
};

export const PHASE_COLORS: Record<string, string> = {
  'Phase 2': '#00d4ff',
  'Phase 3': '#f59e0b',
  'Phase 4': '#10b981',
};

export function urgencyColor(u: Urgency) {
  return URGENCY_COLORS[u];
}
