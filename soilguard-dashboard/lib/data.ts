export type Urgency = 'CRITICAL' | 'MODERATE' | 'STABLE';
export type Tier = 1 | 2 | 3;

export interface Sector {
  rank: number;
  name: string;
  risk: number;
  bare: number;
  highRisk: number;
  pct: number;
  soc: number;
  bsi: number;
  ph: number;
  urgency: Urgency;
  tier: Tier;
  block: string;
  gridId: string;
  recommendations: string[];
}

export const SECTORS: Sector[] = [
  { rank: 1, name: 'Arang (B-1)', risk: 0.6143, bare: 1154.2, highRisk: 869.2, pct: 75.31, soc: 12.02, bsi: 0.1017, ph: 0.64, urgency: 'CRITICAL', tier: 1, block: 'Arang', gridId: 'B-1',
    recommendations: ['Apply 8–10 t/ha FYM or 3 t/ha Biochar', 'Green manuring: Dhaincha/Sunnhemp pre-Kharif', 'Agricultural Lime @ 2.5 t/ha (pH < 1)'] },
  { rank: 2, name: 'Abhanpur (A-1)', risk: 0.6106, bare: 1136.8, highRisk: 816.0, pct: 71.78, soc: 22.74, bsi: 0.1250, ph: 1.24, urgency: 'CRITICAL', tier: 1, block: 'Abhanpur', gridId: 'A-1',
    recommendations: ['Apply 8–10 t/ha FYM or 3 t/ha Biochar', 'Green manuring: Dhaincha/Sunnhemp pre-Kharif', 'Rotate with Pigeonpea for N-fixation'] },
  { rank: 3, name: 'Arang (B-2)', risk: 0.5925, bare: 1108.7, highRisk: 711.2, pct: 64.14, soc: 7.94, bsi: 0.1078, ph: 0.43, urgency: 'MODERATE', tier: 2, block: 'Arang', gridId: 'B-2',
    recommendations: ['Apply 5 t/ha FYM + crop residue incorporation', 'Agricultural Lime @ 2.0 t/ha', 'INM: 75% RDF + 25% organic manure'] },
  { rank: 4, name: 'Abhanpur (A-2)', risk: 0.5717, bare: 576.8, highRisk: 316.3, pct: 54.83, soc: 67.95, bsi: 0.0567, ph: 3.69, urgency: 'MODERATE', tier: 2, block: 'Abhanpur', gridId: 'A-2',
    recommendations: ['INM: 75% RDF + 25% organic manure', 'Zero-tillage + paddy straw mulching (3–4 t/ha)', 'Legume cover crop rotation'] },
  { rank: 5, name: 'Raipur Rural (C-1)', risk: 0.5068, bare: 780.6, highRisk: 202.9, pct: 25.99, soc: 99.76, bsi: 0.1093, ph: 4.83, urgency: 'MODERATE', tier: 2, block: 'Raipur Rural', gridId: 'C-1',
    recommendations: ['Moderate: 5 t/ha FYM + balanced NPK', 'Surface mulching to preserve topsoil moisture', 'INM stewardship package'] },
  { rank: 6, name: 'Abhanpur (A-3)', risk: 0.4997, bare: 743.8, highRisk: 136.5, pct: 18.35, soc: 115.18, bsi: 0.1394, ph: 5.91, urgency: 'MODERATE', tier: 2, block: 'Abhanpur', gridId: 'A-3',
    recommendations: ['5 t/ha FYM + balanced NPK (120:60:60)', 'Zero-tillage with paddy straw retention', 'Gypsum @ 250 kg/ha for sub-soil compaction'] },
  { rank: 7, name: 'Raipur Rural (C-2)', risk: 0.4981, bare: 931.2, highRisk: 196.8, pct: 21.13, soc: 113.82, bsi: 0.1513, ph: 5.31, urgency: 'MODERATE', tier: 2, block: 'Raipur Rural', gridId: 'C-2',
    recommendations: ['Moderate organic input: 5 t/ha compost', 'Micro-nutrient: ZnSO4 @ 25 kg/ha', 'Soil moisture conservation by contour bunding'] },
  { rank: 8, name: 'Arang (B-3)', risk: 0.4886, bare: 617.8, highRisk: 85.2, pct: 13.78, soc: 120.32, bsi: 0.1428, ph: 6.35, urgency: 'MODERATE', tier: 2, block: 'Arang', gridId: 'B-3',
    recommendations: ['4 t/ha FYM + crop residue mulching', 'INM package: 50% NPK + 50% organic', 'Soybean/Pigeonpea intercropping rotation'] },
  { rank: 9, name: 'Arang (B-4)', risk: 0.4862, bare: 581.9, highRisk: 54.5, pct: 9.36, soc: 143.46, bsi: 0.2050, ph: 6.57, urgency: 'MODERATE', tier: 2, block: 'Arang', gridId: 'B-4',
    recommendations: ['Maintain current SOC with crop residue retention', 'Green manure: Sesbania incorporation', 'Balanced NPK with micronutrient management'] },
  { rank: 10, name: 'Arang (B-5)', risk: 0.4835, bare: 949.6, highRisk: 68.8, pct: 7.24, soc: 113.67, bsi: 0.2468, ph: 5.90, urgency: 'MODERATE', tier: 2, block: 'Arang', gridId: 'B-5',
    recommendations: ['3 t/ha FYM + residue incorporation', 'Zinc sulphate @ 25 kg/ha', 'SRI method for paddy to reduce water stress'] },
  { rank: 11, name: 'Raipur Rural (C-4)', risk: 0.4822, bare: 819.6, highRisk: 31.1, pct: 3.79, soc: 130.63, bsi: 0.2319, ph: 6.89, urgency: 'MODERATE', tier: 2, block: 'Raipur Rural', gridId: 'C-4',
    recommendations: ['Maintenance dose: 3 t/ha vermicompost', 'Crop diversification from paddy monoculture', 'Precision irrigation to limit soil crusting'] },
  { rank: 12, name: 'Raipur Rural (C-3)', risk: 0.4819, bare: 635.7, highRisk: 50.5, pct: 7.94, soc: 129.10, bsi: 0.1680, ph: 6.57, urgency: 'MODERATE', tier: 2, block: 'Raipur Rural', gridId: 'C-3',
    recommendations: ['3 t/ha FYM compost application', 'Multi-cropping: Kharif paddy + Rabi mustard/gram', 'Organic carbon enrichment via coirpith compost'] },
  { rank: 13, name: 'Abhanpur (A-4)', risk: 0.4783, bare: 821.3, highRisk: 45.0, pct: 5.48, soc: 122.18, bsi: 0.2123, ph: 6.84, urgency: 'MODERATE', tier: 2, block: 'Abhanpur', gridId: 'A-4',
    recommendations: ['3 t/ha compost + micro-nutrient mixture', 'Cover crops during fallow: Cowpea/Horsegram', 'Weed management to reduce bare soil exposure'] },
  { rank: 14, name: 'Dharsiwa (D-5)', risk: 0.4739, bare: 771.5, highRisk: 36.0, pct: 4.67, soc: 134.98, bsi: 0.1988, ph: 6.83, urgency: 'MODERATE', tier: 2, block: 'Dharsiwa', gridId: 'D-5',
    recommendations: ['2.5 t/ha vermicompost maintenance dose', 'Soil test-based fertiliser application', 'Zero-till direct seeded rice to conserve SOC'] },
  { rank: 15, name: 'Abhanpur (A-5)', risk: 0.4719, bare: 1086.9, highRisk: 58.4, pct: 5.37, soc: 117.94, bsi: 0.2373, ph: 6.30, urgency: 'MODERATE', tier: 2, block: 'Abhanpur', gridId: 'A-5',
    recommendations: ['3 t/ha FYM + neem cake application', 'Alternate wetting and drying (AWD) irrigation', 'Crop rotation with N-fixing legumes'] },
  { rank: 16, name: 'Tilda (E-5)', risk: 0.4679, bare: 950.9, highRisk: 27.2, pct: 2.86, soc: 120.48, bsi: 0.2197, ph: 6.71, urgency: 'MODERATE', tier: 2, block: 'Tilda', gridId: 'E-5',
    recommendations: ['Maintenance: 2 t/ha compost annually', 'Balanced NPK: 100:50:50 kg/ha', 'Crop residue incorporation instead of burning'] },
  { rank: 17, name: 'Raipur Rural (C-5)', risk: 0.4662, bare: 977.6, highRisk: 45.6, pct: 4.67, soc: 130.84, bsi: 0.2411, ph: 6.98, urgency: 'MODERATE', tier: 2, block: 'Raipur Rural', gridId: 'C-5',
    recommendations: ['Preventive: 2 t/ha FYM annually', 'Promote SRI cultivation method', 'Agroforestry boundaries to check wind erosion'] },
  { rank: 18, name: 'Dharsiwa (D-4)', risk: 0.4594, bare: 861.9, highRisk: 23.5, pct: 2.73, soc: 139.13, bsi: 0.2149, ph: 7.03, urgency: 'STABLE', tier: 3, block: 'Dharsiwa', gridId: 'D-4',
    recommendations: ['Continue current practices', 'Annual soil health monitoring', 'Crop residue management for SOC maintenance'] },
  { rank: 19, name: 'Tilda (E-4)', risk: 0.4470, bare: 1142.3, highRisk: 20.0, pct: 1.75, soc: 148.99, bsi: 0.2273, ph: 6.90, urgency: 'STABLE', tier: 3, block: 'Tilda', gridId: 'E-4',
    recommendations: ['Preventive maintenance: 1.5 t/ha compost', 'Monitor for pest/disease stress', 'Precision fertiliser application'] },
  { rank: 20, name: 'Dharsiwa (D-2)', risk: 0.4440, bare: 706.2, highRisk: 18.6, pct: 2.63, soc: 152.46, bsi: 0.1524, ph: 7.13, urgency: 'STABLE', tier: 3, block: 'Dharsiwa', gridId: 'D-2',
    recommendations: ['Stable zone: routine monitoring', 'Balanced NPK with soil test basis', 'Biodiversity conservation in field margins'] },
  { rank: 21, name: 'Dharsiwa (D-1)', risk: 0.4428, bare: 824.7, highRisk: 70.8, pct: 8.58, soc: 153.68, bsi: 0.1202, ph: 6.97, urgency: 'STABLE', tier: 3, block: 'Dharsiwa', gridId: 'D-1',
    recommendations: ['Stable zone: maintain organic inputs', 'Water harvesting structures for drought resilience', 'Monitor BSI quarterly for early warning'] },
  { rank: 22, name: 'Dharsiwa (D-3)', risk: 0.4421, bare: 949.3, highRisk: 23.3, pct: 2.45, soc: 151.27, bsi: 0.2064, ph: 7.05, urgency: 'STABLE', tier: 3, block: 'Dharsiwa', gridId: 'D-3',
    recommendations: ['Stable: Continue good agronomic practices', 'Micronutrient monitoring: Zn, Fe, Mn', 'Contour farming to prevent runoff'] },
  { rank: 23, name: 'Tilda (E-1)', risk: 0.4395, bare: 1242.2, highRisk: 48.7, pct: 3.92, soc: 148.69, bsi: 0.1799, ph: 6.99, urgency: 'STABLE', tier: 3, block: 'Tilda', gridId: 'E-1',
    recommendations: ['Stable: Annual organic matter replenishment', 'Soil biological activity promotion', 'Conservation agriculture principles'] },
  { rank: 24, name: 'Tilda (E-3)', risk: 0.4381, bare: 1280.7, highRisk: 20.1, pct: 1.57, soc: 172.42, bsi: 0.2385, ph: 7.01, urgency: 'STABLE', tier: 3, block: 'Tilda', gridId: 'E-3',
    recommendations: ['Best-performing zone: document practices', 'Share practices with adjacent high-risk sectors', 'Long-term agroforestry integration'] },
  { rank: 25, name: 'Tilda (E-2)', risk: 0.4287, bare: 1050.4, highRisk: 13.5, pct: 1.29, soc: 160.79, bsi: 0.1915, ph: 7.12, urgency: 'STABLE', tier: 3, block: 'Tilda', gridId: 'E-2',
    recommendations: ['Lowest risk: Model farm potential', 'Carbon sequestration monitoring', 'Demonstrate regenerative practices'] },
];

export const STATS = {
  totalAreaHa: 22702,
  totalSectors: 25,
  criticalCount: SECTORS.filter(s => s.tier === 1).length,
  moderateCount: SECTORS.filter(s => s.tier === 2).length,
  stableCount: SECTORS.filter(s => s.tier === 3).length,
  avgRisk: +(SECTORS.reduce((a, s) => a + s.risk, 0) / SECTORS.length).toFixed(4),
  avgSOC: +(SECTORS.reduce((a, s) => a + s.soc, 0) / SECTORS.length).toFixed(1),
  totalBareHa: +(SECTORS.reduce((a, s) => a + s.bare, 0)).toFixed(1),
  totalHighRiskHa: +(SECTORS.reduce((a, s) => a + s.highRisk, 0)).toFixed(1),
  modelAccuracy: 87.3,
  processingTimeSec: 41,
  resolution: '10m',
  aoi: 'Raipur–Durg Agricultural Belt',
};

export const MAPS = [
  { id: 'risk', title: 'SOC Risk Score Map', desc: 'Mean SOC Deficiency Index per pixel (0–1 scale). Red zones indicate critical bare soil carbon depletion.', phase: 'Phase 3', file: 'risk_score_map.png' },
  { id: 'zonal', title: 'Zonal Priority Map', desc: '5×5 sector grid coloured by urgency tier. Each cell represents a 4.4km × 4.4km management zone.', phase: 'Phase 4', file: 'zonal_risk_map.png' },
  { id: 'confidence', title: 'Model Confidence Map', desc: 'Random Forest prediction confidence per pixel. Darker regions indicate lower certainty — flag for ground-truth sampling.', phase: 'Phase 4', file: 'model_confidence_map.png' },
  { id: 'bsi', title: 'Bare Soil Index (BSI)', desc: 'Spectral index isolating bare soil pixels. Threshold ≤ 0.30 NDVI applied before BSI extraction.', phase: 'Phase 2', file: 'bsi_map.png' },
  { id: 'ndvi', title: 'NDVI Vegetation Map', desc: 'Normalised Difference Vegetation Index from Sentinel-2 10m bands. Green = active canopy; Red = exposed topsoil.', phase: 'Phase 2', file: 'ndvi_map.png' },
  { id: 'false_color', title: 'False Color Composite', desc: 'NIR-Red-Green band composite (B08-B04-B03) for visual interpretation of crop/soil boundaries.', phase: 'Phase 2', file: 'false_color_composite.png' },
  { id: 'histogram', title: 'Risk Score Histogram', desc: 'Frequency distribution of SOC Deficiency Index values across all bare-soil pixels in the AOI.', phase: 'Phase 3', file: 'risk_histogram.png' },
];

export const BLOCKS = ['Abhanpur', 'Arang', 'Raipur Rural', 'Dharsiwa', 'Tilda'];

export function urgencyColor(u: string) {
  if (u === 'CRITICAL') return { text: '#ef4444', bg: 'rgba(239,68,68,0.10)', border: 'rgba(239,68,68,0.25)' };
  if (u === 'MODERATE') return { text: '#f59e0b', bg: 'rgba(245,158,11,0.10)', border: 'rgba(245,158,11,0.25)' };
  return { text: '#10b981', bg: 'rgba(16,185,129,0.10)', border: 'rgba(16,185,129,0.25)' };
}

