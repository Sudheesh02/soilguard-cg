/**
 * Re-exports the canonical dataset (generated from shared/*.json) plus the
 * shared color theme. Components should keep importing from '@/lib/data' so
 * this file acts as the stable public surface.
 */
export { SECTORS, MAPS, METRICS, ALL_SECTORS } from './site-data';
export type { Sector, Urgency, Tier } from './site-data';
export { urgencyColor, URGENCY_COLORS, TIER_COLORS, TIER_NAMES, PHASE_COLORS } from './theme';

export const BLOCKS = ['All', 'Abhanpur', 'Arang', 'Raipur Rural', 'Dharsiwa'];
