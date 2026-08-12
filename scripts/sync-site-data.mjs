#!/usr/bin/env node
/**
 * Syncs the canonical shared/*.json data into both Next.js apps as generated TS modules.
 *
 * The shared JSON files are the single source of truth for:
 *   - the 25-sector dataset (shared/sectors.json)
 *   - model & area metrics  (shared/metrics.json)
 *   - the map catalog       (shared/maps.json)
 *
 * Run from the repo root:   node scripts/sync-site-data.mjs
 * Or from either app:       npm run sync-data
 */

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (p) => JSON.parse(readFileSync(join(ROOT, p), 'utf8'));

const SECTORS = readJson('shared/sectors.json');
const METRICS = readJson('shared/metrics.json');
const MAPS = readJson('shared/maps.json');

const HEADER = (sourceFile) =>
  `// AUTO-GENERATED from ${sourceFile} by scripts/sync-site-data.mjs — DO NOT EDIT BY HAND.\n// Update the shared JSON source and re-run:  npm run sync-data\n\n`;

const sum = (key) => SECTORS.reduce((acc, s) => acc + s[key], 0);

/* ------------------------------------------------------------------ */
/* soilguard-dashboard/lib/site-data.ts                                */
/* ------------------------------------------------------------------ */
const dashboardTs =
  HEADER('shared/sectors.json + shared/metrics.json + shared/maps.json') +
  `export type Urgency = 'CRITICAL' | 'MODERATE' | 'STABLE';\nexport type Tier = 1 | 2 | 3;\n\n` +
  `export interface Sector {\n` +
  `  rank: number;\n  name: string;\n  risk: number;\n  bare: number;\n  highRisk: number;\n` +
  `  pct: number;\n  soc: number;\n  bsi: number;\n  ph: number;\n  urgency: Urgency;\n` +
  `  tier: Tier;\n  block: string;\n  gridId: string;\n  recommendations: string[];\n}\n\n` +
  `export const SECTORS: Sector[] = ${JSON.stringify(SECTORS, null, 2)};\n\n` +
  `export const METRICS = ${JSON.stringify(METRICS, null, 2)};\n\n` +
  `export const STATS = {\n` +
  `  totalAreaHa: METRICS.totalAoiHa,\n` +
  `  totalSectors: SECTORS.length,\n` +
  `  criticalCount: SECTORS.filter((s) => s.tier === 1).length,\n` +
  `  moderateCount: SECTORS.filter((s) => s.tier === 2).length,\n` +
  `  stableCount: SECTORS.filter((s) => s.tier === 3).length,\n` +
  `  avgRisk: +(SECTORS.reduce((a, s) => a + s.risk, 0) / SECTORS.length).toFixed(4),\n` +
  `  avgSOC: +(SECTORS.reduce((a, s) => a + s.soc, 0) / SECTORS.length).toFixed(1),\n` +
  `  totalBareHa: +${sum('bare').toFixed(1)},\n` +
  `  totalHighRiskHa: +${sum('highRisk').toFixed(1)},\n` +
  `  r2: METRICS.r2,\n` +
  `  rmse: METRICS.rmse,\n` +
  `  processingTimeSec: METRICS.runtimeSec,\n` +
  `  resolution: METRICS.resolution,\n` +
  `  aoi: METRICS.aoi,\n};\n\n` +
  `export const MAPS = ${JSON.stringify(MAPS, null, 2)};\n\n` +
  `export const BLOCKS = ['Abhanpur', 'Arang', 'Raipur Rural', 'Dharsiwa', 'Tilda'];\n`;

/* ------------------------------------------------------------------ */
/* soilguard-nextjs/lib/site-data.ts                                   */
/* ------------------------------------------------------------------ */
const TOP_ACTIONS = {};
for (const s of SECTORS) {
  TOP_ACTIONS[s.name] = s.recommendations.slice(0, 3);
}

const landingTs =
  HEADER('shared/sectors.json + shared/metrics.json + shared/maps.json') +
  `export type Urgency = 'CRITICAL' | 'MODERATE' | 'STABLE';\nexport type Tier = 1 | 2 | 3;\n\n` +
  `export interface Sector {\n` +
  `  rank: number;\n  name: string;\n  risk: number;\n  bare: number;\n  highRisk: number;\n` +
  `  pct: number;\n  soc: number;\n  bsi: number;\n  ph: number;\n  urgency: Urgency;\n  tier: Tier;\n` +
  `  gridId: string;\n  block: string;\n}\n\n` +
  `export const ALL_SECTORS: Sector[] = ${JSON.stringify(
    SECTORS.map(({ recommendations, ...rest }) => rest), null, 2)};\n\n` +
  `export const TOP_ACTIONS: Record<string, string[]> = ${JSON.stringify(TOP_ACTIONS, null, 2)};\n\n` +
  `export const MAPS = ${JSON.stringify(MAPS, null, 2)};\n\n` +
  `export const METRICS = ${JSON.stringify(METRICS, null, 2)};\n`;

/* ------------------------------------------------------------------ */
const dashboardTarget = join(ROOT, 'soilguard-dashboard', 'lib', 'site-data.ts');
const landingTarget = join(ROOT, 'soilguard-nextjs', 'lib', 'site-data.ts');

mkdirSync(dirname(dashboardTarget), { recursive: true });
mkdirSync(dirname(landingTarget), { recursive: true });
writeFileSync(dashboardTarget, dashboardTs);
writeFileSync(landingTarget, landingTs);

console.log('[OK] Regenerated:');
console.log('  - soilguard-dashboard/lib/site-data.ts');
console.log('  - soilguard-nextjs/lib/site-data.ts');
