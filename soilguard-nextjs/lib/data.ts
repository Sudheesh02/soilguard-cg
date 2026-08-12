/**
 * Canonical dataset surface for SoilGuard Full-Stack Platform.
 */
import { SECTORS, MAPS, METRICS } from './site-data';

export const ALL_SECTORS = SECTORS;
export { SECTORS, MAPS, METRICS };

export const STATS = {
  totalAreaHa: METRICS.bareSoilHa,
  criticalHa: 1685.2,
  moderateHa: 1420.5,
  stableHa: 890.3,
  meanRisk: METRICS.meanRisk,
  modelR2: METRICS.r2,
  modelRMSE: METRICS.rmse,
  r2: METRICS.r2,
  rmse: METRICS.rmse,
  totalSectors: 25,
  criticalSectors: 2,
  moderateSectors: 15,
  stableSectors: 8,
  criticalCount: 2,
  moderateCount: 15,
  stableCount: 8,
  avgSOC: 11.8,
  totalHighRiskHa: 1685.2,
  runtimeSec: METRICS.runtimeSec,
  processingTimeSec: METRICS.runtimeSec,
  bareSoilHa: METRICS.bareSoilHa,
  totalBareHa: METRICS.bareSoilHa,
  resolution: '10m',
};

export type { Sector, Urgency, Tier } from './site-data';
export { urgencyColor, URGENCY_COLORS, TIER_COLORS, TIER_NAMES, PHASE_COLORS } from './theme';

export const BLOCKS = ['All', 'Abhanpur', 'Arang', 'Raipur Rural', 'Dharsiwa'];
