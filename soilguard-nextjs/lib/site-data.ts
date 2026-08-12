// AUTO-GENERATED from shared/sectors.json + shared/metrics.json + shared/maps.json by scripts/sync-site-data.mjs — DO NOT EDIT BY HAND.
// Update the shared JSON source and re-run:  npm run sync-data

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
  {
    "rank": 1,
    "name": "Arang (B-1)",
    "gridId": "B-1",
    "block": "Arang",
    "urgency": "CRITICAL",
    "tier": 1,
    "risk": 0.6143,
    "bare": 1154.2,
    "highRisk": 869.2,
    "pct": 75.31,
    "soc": 12.02,
    "bsi": 0.1017,
    "ph": 0.64,
    "recommendations": [
      "Apply 8–10 t/ha FYM or 3 t/ha Biochar",
      "Green manuring: Dhaincha/Sunnhemp pre-Kharif",
      "Agricultural Lime @ 2.5 t/ha (pH < 1)"
    ]
  },
  {
    "rank": 2,
    "name": "Abhanpur (A-1)",
    "gridId": "A-1",
    "block": "Abhanpur",
    "urgency": "CRITICAL",
    "tier": 1,
    "risk": 0.6106,
    "bare": 1136.8,
    "highRisk": 816,
    "pct": 71.78,
    "soc": 22.74,
    "bsi": 0.125,
    "ph": 1.24,
    "recommendations": [
      "Apply 8–10 t/ha FYM or 3 t/ha Biochar",
      "Green manuring: Dhaincha/Sunnhemp pre-Kharif",
      "Rotate with Pigeonpea for N-fixation"
    ]
  },
  {
    "rank": 3,
    "name": "Arang (B-2)",
    "gridId": "B-2",
    "block": "Arang",
    "urgency": "MODERATE",
    "tier": 2,
    "risk": 0.5925,
    "bare": 1108.7,
    "highRisk": 711.2,
    "pct": 64.14,
    "soc": 7.94,
    "bsi": 0.1078,
    "ph": 0.43,
    "recommendations": [
      "Apply 5 t/ha FYM + crop residue incorporation",
      "Agricultural Lime @ 2.0 t/ha",
      "INM: 75% RDF + 25% organic manure"
    ]
  },
  {
    "rank": 4,
    "name": "Abhanpur (A-2)",
    "gridId": "A-2",
    "block": "Abhanpur",
    "urgency": "MODERATE",
    "tier": 2,
    "risk": 0.5717,
    "bare": 576.8,
    "highRisk": 316.3,
    "pct": 54.83,
    "soc": 67.95,
    "bsi": 0.0567,
    "ph": 3.69,
    "recommendations": [
      "INM: 75% RDF + 25% organic manure",
      "Zero-tillage + paddy straw mulching (3–4 t/ha)",
      "Legume cover crop rotation"
    ]
  },
  {
    "rank": 5,
    "name": "Raipur Rural (C-1)",
    "gridId": "C-1",
    "block": "Raipur Rural",
    "urgency": "MODERATE",
    "tier": 2,
    "risk": 0.5068,
    "bare": 780.6,
    "highRisk": 202.9,
    "pct": 25.99,
    "soc": 99.76,
    "bsi": 0.1093,
    "ph": 4.83,
    "recommendations": [
      "Moderate: 5 t/ha FYM + balanced NPK",
      "Surface mulching to preserve topsoil moisture",
      "INM stewardship package"
    ]
  },
  {
    "rank": 6,
    "name": "Abhanpur (A-3)",
    "gridId": "A-3",
    "block": "Abhanpur",
    "urgency": "MODERATE",
    "tier": 2,
    "risk": 0.4997,
    "bare": 743.8,
    "highRisk": 136.5,
    "pct": 18.35,
    "soc": 115.18,
    "bsi": 0.1394,
    "ph": 5.91,
    "recommendations": [
      "5 t/ha FYM + balanced NPK (120:60:60)",
      "Zero-tillage with paddy straw retention",
      "Gypsum @ 250 kg/ha for sub-soil compaction"
    ]
  },
  {
    "rank": 7,
    "name": "Raipur Rural (C-2)",
    "gridId": "C-2",
    "block": "Raipur Rural",
    "urgency": "MODERATE",
    "tier": 2,
    "risk": 0.4981,
    "bare": 931.2,
    "highRisk": 196.8,
    "pct": 21.13,
    "soc": 113.82,
    "bsi": 0.1513,
    "ph": 5.31,
    "recommendations": [
      "Moderate organic input: 5 t/ha compost",
      "Micro-nutrient: ZnSO4 @ 25 kg/ha",
      "Soil moisture conservation by contour bunding"
    ]
  },
  {
    "rank": 8,
    "name": "Arang (B-3)",
    "gridId": "B-3",
    "block": "Arang",
    "urgency": "MODERATE",
    "tier": 2,
    "risk": 0.4886,
    "bare": 617.8,
    "highRisk": 85.2,
    "pct": 13.78,
    "soc": 120.32,
    "bsi": 0.1428,
    "ph": 6.35,
    "recommendations": [
      "4 t/ha FYM + crop residue mulching",
      "INM package: 50% NPK + 50% organic",
      "Soybean/Pigeonpea intercropping rotation"
    ]
  },
  {
    "rank": 9,
    "name": "Arang (B-4)",
    "gridId": "B-4",
    "block": "Arang",
    "urgency": "MODERATE",
    "tier": 2,
    "risk": 0.4862,
    "bare": 581.9,
    "highRisk": 54.5,
    "pct": 9.36,
    "soc": 143.46,
    "bsi": 0.205,
    "ph": 6.57,
    "recommendations": [
      "Maintain current SOC with crop residue retention",
      "Green manure: Sesbania incorporation",
      "Balanced NPK with micronutrient management"
    ]
  },
  {
    "rank": 10,
    "name": "Arang (B-5)",
    "gridId": "B-5",
    "block": "Arang",
    "urgency": "MODERATE",
    "tier": 2,
    "risk": 0.4835,
    "bare": 949.6,
    "highRisk": 68.8,
    "pct": 7.24,
    "soc": 113.67,
    "bsi": 0.2468,
    "ph": 5.9,
    "recommendations": [
      "3 t/ha FYM + residue incorporation",
      "Zinc sulphate @ 25 kg/ha",
      "SRI method for paddy to reduce water stress"
    ]
  },
  {
    "rank": 11,
    "name": "Raipur Rural (C-4)",
    "gridId": "C-4",
    "block": "Raipur Rural",
    "urgency": "MODERATE",
    "tier": 2,
    "risk": 0.4822,
    "bare": 819.6,
    "highRisk": 31.1,
    "pct": 3.79,
    "soc": 130.63,
    "bsi": 0.2319,
    "ph": 6.89,
    "recommendations": [
      "Maintenance dose: 3 t/ha vermicompost",
      "Crop diversification from paddy monoculture",
      "Precision irrigation to limit soil crusting"
    ]
  },
  {
    "rank": 12,
    "name": "Raipur Rural (C-3)",
    "gridId": "C-3",
    "block": "Raipur Rural",
    "urgency": "MODERATE",
    "tier": 2,
    "risk": 0.4819,
    "bare": 635.7,
    "highRisk": 50.5,
    "pct": 7.94,
    "soc": 129.1,
    "bsi": 0.168,
    "ph": 6.57,
    "recommendations": [
      "3 t/ha FYM compost application",
      "Multi-cropping: Kharif paddy + Rabi mustard/gram",
      "Organic carbon enrichment via coirpith compost"
    ]
  },
  {
    "rank": 13,
    "name": "Abhanpur (A-4)",
    "gridId": "A-4",
    "block": "Abhanpur",
    "urgency": "MODERATE",
    "tier": 2,
    "risk": 0.4783,
    "bare": 821.3,
    "highRisk": 45,
    "pct": 5.48,
    "soc": 122.18,
    "bsi": 0.2123,
    "ph": 6.84,
    "recommendations": [
      "3 t/ha compost + micro-nutrient mixture",
      "Cover crops during fallow: Cowpea/Horsegram",
      "Weed management to reduce bare soil exposure"
    ]
  },
  {
    "rank": 14,
    "name": "Dharsiwa (D-5)",
    "gridId": "D-5",
    "block": "Dharsiwa",
    "urgency": "MODERATE",
    "tier": 2,
    "risk": 0.4739,
    "bare": 771.5,
    "highRisk": 36,
    "pct": 4.67,
    "soc": 134.98,
    "bsi": 0.1988,
    "ph": 6.83,
    "recommendations": [
      "2.5 t/ha vermicompost maintenance dose",
      "Soil test-based fertiliser application",
      "Zero-till direct seeded rice to conserve SOC"
    ]
  },
  {
    "rank": 15,
    "name": "Abhanpur (A-5)",
    "gridId": "A-5",
    "block": "Abhanpur",
    "urgency": "MODERATE",
    "tier": 2,
    "risk": 0.4719,
    "bare": 1086.9,
    "highRisk": 58.4,
    "pct": 5.37,
    "soc": 117.94,
    "bsi": 0.2373,
    "ph": 6.3,
    "recommendations": [
      "3 t/ha FYM + neem cake application",
      "Alternate wetting and drying (AWD) irrigation",
      "Crop rotation with N-fixing legumes"
    ]
  },
  {
    "rank": 16,
    "name": "Tilda (E-5)",
    "gridId": "E-5",
    "block": "Tilda",
    "urgency": "MODERATE",
    "tier": 2,
    "risk": 0.4679,
    "bare": 950.9,
    "highRisk": 27.2,
    "pct": 2.86,
    "soc": 120.48,
    "bsi": 0.2197,
    "ph": 6.71,
    "recommendations": [
      "Maintenance: 2 t/ha compost annually",
      "Balanced NPK: 100:50:50 kg/ha",
      "Crop residue incorporation instead of burning"
    ]
  },
  {
    "rank": 17,
    "name": "Raipur Rural (C-5)",
    "gridId": "C-5",
    "block": "Raipur Rural",
    "urgency": "MODERATE",
    "tier": 2,
    "risk": 0.4662,
    "bare": 977.6,
    "highRisk": 45.6,
    "pct": 4.67,
    "soc": 130.84,
    "bsi": 0.2411,
    "ph": 6.98,
    "recommendations": [
      "Preventive: 2 t/ha FYM annually",
      "Promote SRI cultivation method",
      "Agroforestry boundaries to check wind erosion"
    ]
  },
  {
    "rank": 18,
    "name": "Dharsiwa (D-4)",
    "gridId": "D-4",
    "block": "Dharsiwa",
    "urgency": "STABLE",
    "tier": 3,
    "risk": 0.4594,
    "bare": 861.9,
    "highRisk": 23.5,
    "pct": 2.73,
    "soc": 139.13,
    "bsi": 0.2149,
    "ph": 7.03,
    "recommendations": [
      "Continue current practices",
      "Annual soil health monitoring",
      "Crop residue management for SOC maintenance"
    ]
  },
  {
    "rank": 19,
    "name": "Tilda (E-4)",
    "gridId": "E-4",
    "block": "Tilda",
    "urgency": "STABLE",
    "tier": 3,
    "risk": 0.447,
    "bare": 1142.3,
    "highRisk": 20,
    "pct": 1.75,
    "soc": 148.99,
    "bsi": 0.2273,
    "ph": 6.9,
    "recommendations": [
      "Preventive maintenance: 1.5 t/ha compost",
      "Monitor for pest/disease stress",
      "Precision fertiliser application"
    ]
  },
  {
    "rank": 20,
    "name": "Dharsiwa (D-2)",
    "gridId": "D-2",
    "block": "Dharsiwa",
    "urgency": "STABLE",
    "tier": 3,
    "risk": 0.444,
    "bare": 706.2,
    "highRisk": 18.6,
    "pct": 2.63,
    "soc": 152.46,
    "bsi": 0.1524,
    "ph": 7.13,
    "recommendations": [
      "Stable zone: routine monitoring",
      "Balanced NPK with soil test basis",
      "Biodiversity conservation in field margins"
    ]
  },
  {
    "rank": 21,
    "name": "Dharsiwa (D-1)",
    "gridId": "D-1",
    "block": "Dharsiwa",
    "urgency": "STABLE",
    "tier": 3,
    "risk": 0.4428,
    "bare": 824.7,
    "highRisk": 70.8,
    "pct": 8.58,
    "soc": 153.68,
    "bsi": 0.1202,
    "ph": 6.97,
    "recommendations": [
      "Stable zone: maintain organic inputs",
      "Water harvesting structures for drought resilience",
      "Monitor BSI quarterly for early warning"
    ]
  },
  {
    "rank": 22,
    "name": "Dharsiwa (D-3)",
    "gridId": "D-3",
    "block": "Dharsiwa",
    "urgency": "STABLE",
    "tier": 3,
    "risk": 0.4421,
    "bare": 949.3,
    "highRisk": 23.3,
    "pct": 2.45,
    "soc": 151.27,
    "bsi": 0.2064,
    "ph": 7.05,
    "recommendations": [
      "Stable: Continue good agronomic practices",
      "Micronutrient monitoring: Zn, Fe, Mn",
      "Contour farming to prevent runoff"
    ]
  },
  {
    "rank": 23,
    "name": "Tilda (E-1)",
    "gridId": "E-1",
    "block": "Tilda",
    "urgency": "STABLE",
    "tier": 3,
    "risk": 0.4395,
    "bare": 1242.2,
    "highRisk": 48.7,
    "pct": 3.92,
    "soc": 148.69,
    "bsi": 0.1799,
    "ph": 6.99,
    "recommendations": [
      "Stable: Annual organic matter replenishment",
      "Soil biological activity promotion",
      "Conservation agriculture principles"
    ]
  },
  {
    "rank": 24,
    "name": "Tilda (E-3)",
    "gridId": "E-3",
    "block": "Tilda",
    "urgency": "STABLE",
    "tier": 3,
    "risk": 0.4381,
    "bare": 1280.7,
    "highRisk": 20.1,
    "pct": 1.57,
    "soc": 172.42,
    "bsi": 0.2385,
    "ph": 7.01,
    "recommendations": [
      "Best-performing zone: document practices",
      "Share practices with adjacent high-risk sectors",
      "Long-term agroforestry integration"
    ]
  },
  {
    "rank": 25,
    "name": "Tilda (E-2)",
    "gridId": "E-2",
    "block": "Tilda",
    "urgency": "STABLE",
    "tier": 3,
    "risk": 0.4287,
    "bare": 1050.4,
    "highRisk": 13.5,
    "pct": 1.29,
    "soc": 160.79,
    "bsi": 0.1915,
    "ph": 7.12,
    "recommendations": [
      "Lowest risk: Model farm potential",
      "Carbon sequestration monitoring",
      "Demonstrate regenerative practices"
    ]
  }
];

export const METRICS = {
  "source": "soilguard-cg/outputs/golden_backup/risk_summary_stats.csv",
  "r2": 0.4486,
  "rmse": 0.1132,
  "runtimeSec": 41.03,
  "totalAoiHa": 46371.78,
  "bareSoilHa": 22702.47,
  "bareSoilPct": 48.96,
  "meanRisk": 0.4902,
  "medianRisk": 0.4568,
  "stdRisk": 0.1046,
  "lowRiskHa": 10468.73,
  "moderateRiskHa": 7792.74,
  "highRiskHa": 4441,
  "lowRiskPct": 46.11,
  "moderateRiskPct": 34.33,
  "highRiskPct": 19.56,
  "lowCutoff": 0.45,
  "highCutoff": 0.58,
  "resolution": "10m",
  "model": "Random Forest (150 trees)",
  "aoi": "Raipur–Durg Agricultural Belt",
  "totalSectors": 25
};

export const STATS = {
  totalAreaHa: METRICS.totalAoiHa,
  totalSectors: SECTORS.length,
  criticalCount: SECTORS.filter((s) => s.tier === 1).length,
  moderateCount: SECTORS.filter((s) => s.tier === 2).length,
  stableCount: SECTORS.filter((s) => s.tier === 3).length,
  avgRisk: +(SECTORS.reduce((a, s) => a + s.risk, 0) / SECTORS.length).toFixed(4),
  avgSOC: +(SECTORS.reduce((a, s) => a + s.soc, 0) / SECTORS.length).toFixed(1),
  totalBareHa: +22702.6,
  totalHighRiskHa: +3989.7,
  r2: METRICS.r2,
  rmse: METRICS.rmse,
  processingTimeSec: METRICS.runtimeSec,
  resolution: METRICS.resolution,
  aoi: METRICS.aoi,
};

export const MAPS = [
  {
    "id": "risk",
    "title": "SOC Risk Score Map",
    "desc": "Mean SOC Deficiency Index per pixel (0–1 scale). Red zones indicate critical bare soil carbon depletion.",
    "phase": "Phase 3",
    "file": "risk_score_map.png",
    "subtitle": "10m resolution · Sentinel-2 spectral features",
    "badge": "badge-red",
    "badgeText": "PRIMARY LAYER",
    "caption": "Soil Organic Carbon (SOC) Deficiency Map — Raipur–Durg Belt (10m Resolution, Sentinel-2 L2A)",
    "crs": "EPSG:32644",
    "stats": "Satellite RF SOC Model · SOC Deficiency Index (0–1)"
  },
  {
    "id": "zonal",
    "title": "Zonal Priority Map",
    "desc": "5×5 sector grid coloured by urgency tier. Each cell represents a 4.4km × 4.4km management zone.",
    "phase": "Phase 4",
    "file": "zonal_risk_map.png",
    "subtitle": "5×5 regular grid · 25 agricultural sectors",
    "badge": "badge-amber",
    "badgeText": "ZONAL GRID",
    "caption": "Zonal Organic Carbon Priority Sector Map — 5×5 Grid (Raipur–Durg Rice Belt)",
    "crs": "EPSG:32644",
    "stats": "Ranked by mean SOC deficiency · Top sector listed"
  },
  {
    "id": "confidence",
    "title": "Model Confidence Map",
    "desc": "Random Forest prediction confidence per pixel. Darker regions indicate lower certainty — flag for ground-truth sampling.",
    "phase": "Phase 4",
    "file": "model_confidence_map.png",
    "subtitle": "Prediction uncertainty · Ensemble spread",
    "badge": "badge-violet",
    "badgeText": "CONFIDENCE",
    "caption": "Model Ensemble Confidence / Uncertainty Map",
    "crs": "EPSG:32644",
    "stats": "Ensemble trees: 150 · Tree std-dev uncertainty"
  },
  {
    "id": "bsi",
    "title": "Bare Soil Index (BSI)",
    "desc": "Spectral index isolating bare soil pixels. Threshold ≤ 0.30 NDVI applied before BSI extraction.",
    "phase": "Phase 2",
    "file": "bsi_map.png",
    "subtitle": "Topsoil exposure · NDVI ≤ 0.30 masked",
    "badge": "badge-amber",
    "badgeText": "SPECTRAL",
    "caption": "Bare Soil Index (BSI) Map — Raipur AOI",
    "crs": "EPSG:32644",
    "stats": "Bare soil candidate pixels · NDVI ≤ 0.30"
  },
  {
    "id": "ndvi",
    "title": "NDVI Vegetation Map",
    "desc": "Normalised Difference Vegetation Index from Sentinel-2 10m bands. Green = active canopy; Red = exposed topsoil.",
    "phase": "Phase 2",
    "file": "ndvi_map.png",
    "subtitle": "Normalized Difference Vegetation Index",
    "badge": "badge-emerald",
    "badgeText": "VEGETATION",
    "caption": "NDVI Vegetation Index Map — Raipur AOI",
    "crs": "EPSG:32644",
    "stats": "Threshold: NDVI ≤ 0.30 for bare soil"
  },
  {
    "id": "false_color",
    "title": "False Color Composite",
    "desc": "NIR-Red-Green band composite (B08-B04-B03) for visual interpretation of crop/soil boundaries.",
    "phase": "Phase 2",
    "file": "false_color_composite.png",
    "subtitle": "NIR-Red-Green · Vegetation and bare soil",
    "badge": "badge-cyan",
    "badgeText": "FALSE COLOR",
    "caption": "Sentinel-2 False Color Composite (NIR-R-G)",
    "crs": "EPSG:32644",
    "stats": "B08/B04/B03 composite"
  },
  {
    "id": "histogram",
    "title": "Risk Score Histogram",
    "desc": "Frequency distribution of SOC Deficiency Index values across all bare-soil pixels in the AOI.",
    "phase": "Phase 3",
    "file": "risk_histogram.png",
    "subtitle": "SOC Deficiency Index distribution across bare-soil pixels",
    "badge": "badge-violet",
    "badgeText": "DISTRIBUTION",
    "caption": "SOC Deficiency Risk Score Distribution Histogram — Raipur AOI",
    "crs": "EPSG:32644",
    "stats": "50 bins · color-coded risk bands (green/amber/red)"
  }
];

export const BLOCKS = ['Abhanpur', 'Arang', 'Raipur Rural', 'Dharsiwa', 'Tilda'];
export const ALL_SECTORS = SECTORS;
export const TOP_ACTIONS = [
  { rank: 1, gridId: 'B-1', block: 'Arang', urgency: 'CRITICAL', action: 'Apply 8–10 t/ha FYM or 3 t/ha Biochar + Lime @ 2.5 t/ha' },
  { rank: 2, gridId: 'A-1', block: 'Abhanpur', urgency: 'CRITICAL', action: 'Green manuring: Dhaincha pre-Kharif + Deep tillage' },
  { rank: 3, gridId: 'B-2', block: 'Arang', urgency: 'MODERATE', action: 'Residue retention + Crop rotation with legumes' },
];
