'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Activity,
  Layers,
  MapPin,
  Satellite,
  Compass,
  Sliders,
  ShieldCheck,
  TrendingUp,
  Cpu,
  RefreshCw,
  ExternalLink,
  Info,
  CheckCircle2,
  AlertCircle,
  Database,
  ArrowRight,
  Sparkles,
  BarChart2,
  Table,
  Zap,
  Split,
  Eye,
  Maximize2,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell
} from 'recharts';

// --- Static Data Fallbacks & 33-District Registry ---
export interface DistrictData {
  id: string;
  name: string;
  zone: string;
  zone_code: 'plains' | 'hills' | 'plateau';
  lat: number;
  lon: number;
  soil: string;
  order: string;
  vernacular: string;
  soc: number;
  clay: number;
  ph: number;
  vulnerability: number;
  threat: string;
  interventions: string[];
  areaHa: number;
  rank: number;
}

const DISTRICTS_33: DistrictData[] = [
  { id: 'raipur', name: 'Raipur', zone: 'Central Chhattisgarh Plains', zone_code: 'plains', lat: 21.25, lon: 81.63, soil: 'Kanhar (Deep Black Clay)', order: 'Vertisols', vernacular: 'Kanhar', soc: 0.62, clay: 42.5, ph: 7.4, vulnerability: 0.614, threat: 'Intensive paddy monoculture, low organic recycling', interventions: ['FYM @ 8-10 t/ha', 'Sesbania green manuring', 'Gypsum @ 2.5 t/ha'], areaHa: 289200, rank: 1 },
  { id: 'durg', name: 'Durg', zone: 'Central Chhattisgarh Plains', zone_code: 'plains', lat: 21.19, lon: 81.28, soil: 'Kanhar & Dorsa Loam', order: 'Vertisols', vernacular: 'Kanhar', soc: 0.58, clay: 38.0, ph: 7.2, vulnerability: 0.598, threat: 'High fertilizer runoff, urban expansion', interventions: ['Biochar @ 3 t/ha', 'Dhaincha pre-Kharif', 'Zinc micronutrient enrichment'], areaHa: 223800, rank: 2 },
  { id: 'bilaspur', name: 'Bilaspur', zone: 'Central Chhattisgarh Plains', zone_code: 'plains', lat: 22.08, lon: 82.14, soil: 'Dorsa & Matasi Loam', order: 'Inceptisols', vernacular: 'Dorsa', soc: 0.54, clay: 32.0, ph: 6.8, vulnerability: 0.582, threat: 'Soil compaction, topsoil loss in uplands', interventions: ['FYM @ 10 t/ha', 'Sunn hemp cover crop', 'Subsoil chisel ploughing'], areaHa: 345600, rank: 3 },
  { id: 'bemetara', name: 'Bemetara', zone: 'Central Chhattisgarh Plains', zone_code: 'plains', lat: 21.70, lon: 81.54, soil: 'Deep Kanhar Clay', order: 'Vertisols', vernacular: 'Kanhar', soc: 0.51, clay: 45.0, ph: 7.6, vulnerability: 0.605, threat: 'Severe cracking & carbon oxidation during summer', interventions: ['Crop residue mulch retention', 'FYM @ 10 t/ha', 'Gypsum application'], areaHa: 285500, rank: 4 },
  { id: 'rajnandgaon', name: 'Rajnandgaon', zone: 'Central Chhattisgarh Plains', zone_code: 'plains', lat: 21.10, lon: 81.03, soil: 'Dorsa & Bhata Laterite', order: 'Alfisols', vernacular: 'Dorsa', soc: 0.49, clay: 28.5, ph: 6.5, vulnerability: 0.575, threat: 'Sheet erosion on undulating terrain', interventions: ['Contour bunding', 'FYM @ 12 t/ha', 'Sunn hemp green manure'], areaHa: 324100, rank: 5 },
  { id: 'dhamtari', name: 'Dhamtari', zone: 'Central Chhattisgarh Plains', zone_code: 'plains', lat: 20.71, lon: 81.55, soil: 'Matasi Sandy Loam', order: 'Inceptisols', vernacular: 'Matasi', soc: 0.47, clay: 22.0, ph: 6.2, vulnerability: 0.562, threat: 'Leaching of nutrients, low organic retention', interventions: ['Agricultural Lime @ 1.8 t/ha', 'Compost @ 12 t/ha', 'Biochar addition'], areaHa: 202900, rank: 6 },
  { id: 'balod', name: 'Balod', zone: 'Central Chhattisgarh Plains', zone_code: 'plains', lat: 20.73, lon: 81.20, soil: 'Dorsa & Kanhar Mix', order: 'Inceptisols', vernacular: 'Dorsa', soc: 0.53, clay: 34.0, ph: 6.9, vulnerability: 0.554, threat: 'Monoculture rice fallow degradation', interventions: ['Paira cropping with Lathyrus', 'FYM @ 8 t/ha', 'Dhaincha'], areaHa: 352700, rank: 7 },
  { id: 'balodabazar', name: 'Baloda Bazar', zone: 'Central Chhattisgarh Plains', zone_code: 'plains', lat: 21.66, lon: 82.16, soil: 'Kanhar Vertisols', order: 'Vertisols', vernacular: 'Kanhar', soc: 0.52, clay: 43.0, ph: 7.5, vulnerability: 0.591, threat: 'Alkalinity stress in lowlands', interventions: ['Gypsum @ 2.5 t/ha', 'Organic compost @ 10 t/ha', 'Green manuring'], areaHa: 373400, rank: 8 },
  { id: 'janjgir', name: 'Janjgir-Champa', zone: 'Central Chhattisgarh Plains', zone_code: 'plains', lat: 22.01, lon: 82.57, soil: 'Rich Alluvial Kanhar', order: 'Vertisols', vernacular: 'Kanhar', soc: 0.59, clay: 44.0, ph: 7.3, vulnerability: 0.548, threat: 'Canal waterlogging, micronutrient imbalance', interventions: ['Subsurface drainage', 'FYM @ 8 t/ha', 'Zinc sulphate application'], areaHa: 260300, rank: 9 },
  { id: 'korba', name: 'Korba', zone: 'Central Chhattisgarh Plains', zone_code: 'plains', lat: 22.35, lon: 82.68, soil: 'Bhata & Sandy Loam', order: 'Entisols', vernacular: 'Bhata', soc: 0.44, clay: 20.0, ph: 5.8, vulnerability: 0.632, threat: 'Industrial ash drift, topsoil acidification', interventions: ['Lime @ 2.5 t/ha', 'Heavy organic mulching', 'Sesbania rostrata'], areaHa: 714500, rank: 10 },
  { id: 'raigarh', name: 'Raigarh', zone: 'Central Chhattisgarh Plains', zone_code: 'plains', lat: 21.89, lon: 83.39, soil: 'Matasi & Dorsa Loam', order: 'Alfisols', vernacular: 'Matasi', soc: 0.48, clay: 26.0, ph: 6.4, vulnerability: 0.589, threat: 'Mining runoff & topsoil erosion', interventions: ['Agroforestry buffer strips', 'FYM @ 10 t/ha', 'Sunn hemp'], areaHa: 708600, rank: 11 },
  { id: 'mahasamund', name: 'Mahasamund', zone: 'Central Chhattisgarh Plains', zone_code: 'plains', lat: 21.11, lon: 82.10, soil: 'Dorsa & Matasi', order: 'Inceptisols', vernacular: 'Dorsa', soc: 0.50, clay: 30.0, ph: 6.7, vulnerability: 0.567, threat: 'Summer drought & carbon loss', interventions: ['Farm ponds integration', 'FYM @ 10 t/ha', 'Biochar amendment'], areaHa: 479000, rank: 12 },
  { id: 'gariaband', name: 'Gariaband', zone: 'Central Chhattisgarh Plains', zone_code: 'plains', lat: 20.96, lon: 82.08, soil: 'Matasi & Hill Skeletal', order: 'Alfisols', vernacular: 'Matasi', soc: 0.46, clay: 24.0, ph: 6.1, vulnerability: 0.612, threat: 'Upland gully erosion', interventions: ['Check dams', 'Lime @ 1.8 t/ha', 'Dhaincha green manuring'], areaHa: 582300, rank: 13 },
  { id: 'mungeli', name: 'Mungeli', zone: 'Central Chhattisgarh Plains', zone_code: 'plains', lat: 22.07, lon: 81.69, soil: 'Deep Kanhar Clay', order: 'Vertisols', vernacular: 'Kanhar', soc: 0.52, clay: 42.0, ph: 7.4, vulnerability: 0.579, threat: 'Intensive tillage carbon burn-off', interventions: ['Reduced tillage', 'FYM @ 8 t/ha', 'Gypsum application'], areaHa: 275000, rank: 14 },
  { id: 'kabirdham', name: 'Kabirdham', zone: 'Central Chhattisgarh Plains', zone_code: 'plains', lat: 22.01, lon: 81.25, soil: 'Kanhar in valleys, Bhata on hills', order: 'Vertisols', vernacular: 'Kanhar', soc: 0.50, clay: 36.0, ph: 7.1, vulnerability: 0.584, threat: 'Rainfed slope degradation', interventions: ['Contour vegetative barriers', 'FYM @ 10 t/ha', 'Cover crops'], areaHa: 444700, rank: 15 },
  { id: 'sakti', name: 'Sakti', zone: 'Central Chhattisgarh Plains', zone_code: 'plains', lat: 22.02, lon: 82.96, soil: 'Dorsa Clay Loam', order: 'Inceptisols', vernacular: 'Dorsa', soc: 0.53, clay: 35.0, ph: 7.0, vulnerability: 0.551, threat: 'Intensive cropping depletion', interventions: ['INM package', 'FYM @ 8 t/ha', 'Pulse crop rotation'], areaHa: 215000, rank: 16 },
  { id: 'sarangarh', name: 'Sarangarh-Bilaigarh', zone: 'Central Chhattisgarh Plains', zone_code: 'plains', lat: 21.60, lon: 83.08, soil: 'Dorsa & Kanhar', order: 'Inceptisols', vernacular: 'Dorsa', soc: 0.51, clay: 36.0, ph: 6.9, vulnerability: 0.560, threat: 'Mahanadi riverine bank erosion', interventions: ['Riverine riparian vegetative buffers', 'FYM @ 10 t/ha'], areaHa: 245000, rank: 17 },
  { id: 'khairagarh', name: 'Khairagarh-Chhuikhadan', zone: 'Central Chhattisgarh Plains', zone_code: 'plains', lat: 21.42, lon: 80.98, soil: 'Matasi & Dorsa', order: 'Alfisols', vernacular: 'Matasi', soc: 0.48, clay: 27.0, ph: 6.6, vulnerability: 0.573, threat: 'Soil erosion in foothills', interventions: ['Terracing', 'Sunn hemp', 'FYM @ 10 t/ha'], areaHa: 210000, rank: 18 },
  { id: 'mohla', name: 'Mohla-Manpur-Ambagarh', zone: 'Central Chhattisgarh Plains', zone_code: 'plains', lat: 20.65, lon: 80.74, soil: 'Bhata & Red Sandy', order: 'Entisols', vernacular: 'Bhata', soc: 0.45, clay: 22.0, ph: 6.0, vulnerability: 0.620, threat: 'Heavy leaching & low CEC', interventions: ['Lime @ 2.0 t/ha', 'FYM @ 12 t/ha', 'Biochar @ 4 t/ha'], areaHa: 215000, rank: 19 },
  // Northern Hills Zone (7 districts)
  { id: 'surguja', name: 'Surguja', zone: 'Northern Hills Zone', zone_code: 'hills', lat: 23.12, lon: 83.20, soil: 'Matasi & Hill Skeletal', order: 'Alfisols', vernacular: 'Matasi', soc: 0.46, clay: 23.0, ph: 5.9, vulnerability: 0.684, threat: 'Severe water erosion on 15% slope (RUSLE > 18 t/ha)', interventions: ['Bench terracing', 'Agri-Lime @ 2.2 t/ha', 'FYM @ 12 t/ha'], areaHa: 573200, rank: 20 },
  { id: 'jashpur', name: 'Jashpur', zone: 'Northern Hills Zone', zone_code: 'hills', lat: 22.88, lon: 84.14, soil: 'Red Lateritic & Skeletal', order: 'Entisols', vernacular: 'Bhata', soc: 0.43, clay: 19.0, ph: 5.6, vulnerability: 0.702, threat: 'High rainfall erosion, acid laterite crusting', interventions: ['Agri-Lime @ 2.5 t/ha', 'Horticulture intercropping', 'FYM @ 14 t/ha'], areaHa: 645700, rank: 21 },
  { id: 'koriya', name: 'Koriya', zone: 'Northern Hills Zone', zone_code: 'hills', lat: 23.25, lon: 82.55, soil: 'Matasi Sandy Clay', order: 'Alfisols', vernacular: 'Matasi', soc: 0.47, clay: 25.0, ph: 6.0, vulnerability: 0.665, threat: 'Coal basin acid drainage & slope wash', interventions: ['Neutral buffering', 'FYM @ 10 t/ha', 'Dhaincha green manure'], areaHa: 597800, rank: 22 },
  { id: 'surajpur', name: 'Surajpur', zone: 'Northern Hills Zone', zone_code: 'hills', lat: 23.22, lon: 82.86, soil: 'Matasi & Dorsa Loam', order: 'Inceptisols', vernacular: 'Matasi', soc: 0.48, clay: 26.5, ph: 6.1, vulnerability: 0.651, threat: 'Rill erosion in upland millet fields', interventions: ['Contour vegetative strips', 'FYM @ 10 t/ha', 'Biochar'], areaHa: 278700, rank: 23 },
  { id: 'balrampur', name: 'Balrampur-Ramanujganj', zone: 'Northern Hills Zone', zone_code: 'hills', lat: 23.61, lon: 83.61, soil: 'Gravelly Matasi & Red Soil', order: 'Entisols', vernacular: 'Bhata', soc: 0.42, clay: 21.0, ph: 5.7, vulnerability: 0.710, threat: 'Steep hill slopes, flash flood scouring', interventions: ['Agri-Lime @ 2.5 t/ha', 'Agroforestry integration', 'FYM @ 15 t/ha'], areaHa: 601600, rank: 24 },
  { id: 'mcb', name: 'Manendragarh-Chirmiri', zone: 'Northern Hills Zone', zone_code: 'hills', lat: 23.18, lon: 82.20, soil: 'Hill Skeletal Laterite', order: 'Entisols', vernacular: 'Bhata', soc: 0.44, clay: 20.5, ph: 5.8, vulnerability: 0.692, threat: 'Rapid topsoil oxidation under heat and slope', interventions: ['Stone bunding', 'Compost @ 12 t/ha', 'Cover cropping'], areaHa: 225000, rank: 25 },
  { id: 'gpm', name: 'Gaurela-Pendra-Marwahi', zone: 'Northern Hills Zone', zone_code: 'hills', lat: 22.75, lon: 81.92, soil: 'Matasi & Forest Red Clay', order: 'Alfisols', vernacular: 'Matasi', soc: 0.50, clay: 27.0, ph: 6.2, vulnerability: 0.638, threat: 'Forest margin degradation', interventions: ['Community biochar kilns', 'FYM @ 10 t/ha', 'Sunn hemp'], areaHa: 230700, rank: 26 },
  // Bastar Plateau / Southern Zone (7 districts)
  { id: 'bastar', name: 'Bastar', zone: 'Bastar Plateau / Southern Zone', zone_code: 'plateau', lat: 19.07, lon: 82.03, soil: 'Bhata Lateritic & Tikra', order: 'Entisols', vernacular: 'Bhata', soc: 0.39, clay: 18.0, ph: 5.4, vulnerability: 0.745, threat: 'Severe acidity, iron-aluminum toxicity, low SOC', interventions: ['Agri-Lime @ 3.0 t/ha', 'Biochar @ 4.0 t/ha', 'Sesbania rostrata green manuring', 'FYM @ 15 t/ha'], areaHa: 659700, rank: 27 },
  { id: 'dantewada', name: 'Dantewada', zone: 'Bastar Plateau / Southern Zone', zone_code: 'plateau', lat: 18.90, lon: 81.35, soil: 'Red Sandy Tikra & Bhata', order: 'Entisols', vernacular: 'Bhata', soc: 0.38, clay: 17.5, ph: 5.3, vulnerability: 0.760, threat: 'High rainfall leaching, iron crusting', interventions: ['Lime @ 3.0 t/ha', 'Organic agroforestry (Mahua/Tamarind)', 'FYM @ 15 t/ha'], areaHa: 341000, rank: 28 },
  { id: 'kanker', name: 'Kanker', zone: 'Bastar Plateau / Southern Zone', zone_code: 'plateau', lat: 20.27, lon: 81.49, soil: 'Matasi & Red Loam', order: 'Alfisols', vernacular: 'Matasi', soc: 0.42, clay: 22.0, ph: 5.8, vulnerability: 0.715, threat: 'Gully erosion in Dudhawa catchment', interventions: ['Gully plugging', 'Agri-Lime @ 2.0 t/ha', 'FYM @ 12 t/ha'], areaHa: 642400, rank: 29 },
  { id: 'kondagaon', name: 'Kondagaon', zone: 'Bastar Plateau / Southern Zone', zone_code: 'plateau', lat: 19.60, lon: 81.67, soil: 'Bhata & Tikra Red Soils', order: 'Entisols', vernacular: 'Bhata', soc: 0.39, clay: 18.5, ph: 5.5, vulnerability: 0.738, threat: 'Low cation exchange capacity (CEC)', interventions: ['Biochar @ 4 t/ha', 'FYM @ 14 t/ha', 'Lime @ 2.5 t/ha'], areaHa: 776800, rank: 30 },
  { id: 'narayanpur', name: 'Narayanpur', zone: 'Bastar Plateau / Southern Zone', zone_code: 'plateau', lat: 19.72, lon: 81.25, soil: 'Abujhmad Skeletal Red Clay', order: 'Entisols', vernacular: 'Bhata', soc: 0.36, clay: 16.0, ph: 5.2, vulnerability: 0.785, threat: 'Extreme slope run-off, slash-and-burn recovery', interventions: ['Permanent vegetative canopy', 'Agri-Lime @ 3.0 t/ha', 'Heavy organic mulch'], areaHa: 664000, rank: 31 },
  { id: 'bijapur', name: 'Bijapur', zone: 'Bastar Plateau / Southern Zone', zone_code: 'plateau', lat: 18.80, lon: 80.82, soil: 'Red Sandy & Laterite Gravel', order: 'Entisols', vernacular: 'Bhata', soc: 0.37, clay: 17.0, ph: 5.3, vulnerability: 0.772, threat: 'Laterite hardpan formation', interventions: ['Deep subsoiling', 'Lime @ 2.8 t/ha', 'FYM @ 15 t/ha'], areaHa: 655500, rank: 32 },
  { id: 'sukma', name: 'Sukma', zone: 'Bastar Plateau / Southern Zone', zone_code: 'plateau', lat: 18.40, lon: 81.66, soil: 'Tikra & Alluvial Sabari Silt', order: 'Entisols', vernacular: 'Bhata', soc: 0.35, clay: 16.5, ph: 5.2, vulnerability: 0.798, threat: 'Extreme heat topsoil baking, lowest regional SOC', interventions: ['Agri-Lime @ 3.5 t/ha', 'Sesbania green manuring', 'FYM @ 16 t/ha', 'Solar biochar injection'], areaHa: 563600, rank: 33 },
];

// Spectral Data by Soil Type (Calibrated Sentinel-2 Reflectance %)
const SOIL_SPECTRAL_PROFILES: Record<string, {
  name: string;
  wrb: string;
  sam: number;
  data: Array<{ band: string; cloudy: number; reconstructed: number; groundTruth: number }>;
}> = {
  kanhar: {
    name: 'Kanhar Deep Black Clay (Vertisols)',
    wrb: 'Pellic Vertisols',
    sam: 2.14,
    data: [
      { band: 'B02 (Blue 490nm)', cloudy: 36.2, reconstructed: 8.1, groundTruth: 7.8 },
      { band: 'B03 (Green 560nm)', cloudy: 38.5, reconstructed: 10.4, groundTruth: 10.2 },
      { band: 'B04 (Red 665nm)', cloudy: 37.1, reconstructed: 12.7, groundTruth: 12.5 },
      { band: 'B08 (NIR 842nm)', cloudy: 41.2, reconstructed: 18.6, groundTruth: 18.4 },
      { band: 'B11 (SWIR1 1610nm)', cloudy: 32.4, reconstructed: 23.8, groundTruth: 23.6 },
      { band: 'B12 (SWIR2 2190nm)', cloudy: 26.5, reconstructed: 17.9, groundTruth: 17.8 },
    ],
  },
  matasi: {
    name: 'Matasi Yellow-Brown Loam (Alfisols / Inceptisols)',
    wrb: 'Haplic Alfisols',
    sam: 2.26,
    data: [
      { band: 'B02 (Blue 490nm)', cloudy: 38.4, reconstructed: 11.5, groundTruth: 11.2 },
      { band: 'B03 (Green 560nm)', cloudy: 40.2, reconstructed: 15.8, groundTruth: 15.6 },
      { band: 'B04 (Red 665nm)', cloudy: 42.1, reconstructed: 21.6, groundTruth: 21.4 },
      { band: 'B08 (NIR 842nm)', cloudy: 44.5, reconstructed: 28.9, groundTruth: 28.6 },
      { band: 'B11 (SWIR1 1610nm)', cloudy: 39.1, reconstructed: 36.4, groundTruth: 36.2 },
      { band: 'B12 (SWIR2 2190nm)', cloudy: 33.2, reconstructed: 28.7, groundTruth: 28.4 },
    ],
  },
  bhata: {
    name: 'Bhata Lateritic Gravelly Red (Entisols / Laterites)',
    wrb: 'Rhodic Ferralsols / Entisols',
    sam: 2.38,
    data: [
      { band: 'B02 (Blue 490nm)', cloudy: 41.2, reconstructed: 14.8, groundTruth: 14.5 },
      { band: 'B03 (Green 560nm)', cloudy: 43.1, reconstructed: 20.0, groundTruth: 19.8 },
      { band: 'B04 (Red 665nm)', cloudy: 45.6, reconstructed: 26.8, groundTruth: 26.5 },
      { band: 'B08 (NIR 842nm)', cloudy: 48.0, reconstructed: 34.5, groundTruth: 34.2 },
      { band: 'B11 (SWIR1 1610nm)', cloudy: 44.2, reconstructed: 42.4, groundTruth: 42.1 },
      { band: 'B12 (SWIR2 2190nm)', cloudy: 38.5, reconstructed: 34.3, groundTruth: 34.0 },
    ],
  },
};

// Map Layers with Actual Raster Asset Paths
interface RasterLayerSpec {
  id: string;
  label: string;
  desc: string;
  assetPath: string;
  legendType: 'continuous_risk' | 'ndvi' | 'bsi' | 'composite' | 'confidence' | 'zonal';
}

const RASTER_LAYERS: RasterLayerSpec[] = [
  { id: 'soc', label: 'SOC Deficiency Risk Heatmap', desc: 'Spatial Block Cross-Validated Random Forest (0.0 to 1.0)', assetPath: '/maps/clean_soc_risk.png', legendType: 'continuous_risk' },
  { id: 'ndvi', label: 'NDVI Vegetation Canopy Index', desc: 'Normalized Difference Vegetation Index [(NIR - Red) / (NIR + Red)]', assetPath: '/maps/clean_ndvi.png', legendType: 'ndvi' },
  { id: 'bsi', label: 'Bare Soil Index (BSI)', desc: 'Physically separated agricultural topsoil reflectance signature', assetPath: '/maps/clean_bsi.png', legendType: 'bsi' },
  { id: 'cir', label: 'Color Infrared False Composite', desc: 'B8 (NIR) / B4 (Red) / B3 (Green) 10m Multi-spectral false color', assetPath: '/maps/clean_false_color.png', legendType: 'composite' },
  { id: 'confidence', label: 'Pixel Provenance & QA Flag', desc: 'Flag 0 (Clear), Flag 1 (ST-DIP Reconstructed), Flag 2 (Temporal Donor)', assetPath: '/maps/clean_confidence.png', legendType: 'confidence' },
  { id: 'zonal', label: '25-Sector Agricultural Grid', desc: 'Spatial partitioning aligned with Bhuvan cadastral boundaries', assetPath: '/maps/clean_zonal_grid.png', legendType: 'zonal' },
];

export default function AlternativeWorkbenchPage() {
  const [activeTab, setActiveTab] = useState<'explorer' | 'dosing' | 'spectral' | 'telemetry'>('explorer');
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictData>(DISTRICTS_33[0]);
  const [activeLayer, setActiveLayer] = useState<string>('soc');
  const [layerOpacity, setLayerOpacity] = useState<number>(85);
  const [activeSoilKey, setActiveSoilKey] = useState<string>('kanhar');

  // Interactive Split Curtain Mode
  const [splitCurtainPos, setSplitCurtainPos] = useState<number>(50);
  const [isComparingInpainting, setIsComparingInpainting] = useState<boolean>(false);

  // Dosing Lab State
  const [dosingAcreage, setDosingAcreage] = useState<number>(10.0);
  const [dosingCurrentSoc, setDosingCurrentSoc] = useState<number>(0.62);
  const [dosingTargetSoc, setDosingTargetSoc] = useState<number>(1.0);

  // Live API Telemetry state
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [apiLatency, setApiLatency] = useState<number>(418);
  const [liveMetrics, setLiveMetrics] = useState<any>(null);
  const [activeModelReported, setActiveModelReported] = useState<string>('soil_soc_rf.joblib (Decoupled SBCV)');
  const [testEndpointResult, setTestEndpointResult] = useState<string>('');
  const [isQueryingApi, setIsQueryingApi] = useState<boolean>(false);

  // Check backend availability on load
  useEffect(() => {
    let isMounted = true;
    const checkApi = async () => {
      const t0 = performance.now();
      try {
        const res = await fetch('http://127.0.0.1:8000/health', { method: 'GET' });
        if (res.ok && isMounted) {
          const data = await res.json();
          setApiLatency(Math.round(performance.now() - t0));
          setApiStatus('online');
          if (data.active_model) setActiveModelReported(data.active_model);

          // Preload certified metrics
          try {
            const mRes = await fetch('http://127.0.0.1:8000/api/v1/metrics');
            if (mRes.ok && isMounted) {
              setLiveMetrics(await mRes.json());
            }
          } catch (mErr) {
            // silent fallback
          }
        } else if (isMounted) {
          setApiStatus('offline');
        }
      } catch (err) {
        if (isMounted) setApiStatus('offline');
      }
    };
    checkApi();
    return () => { isMounted = false; };
  }, []);

  // Update dosing lab baseline whenever selected district changes
  useEffect(() => {
    setDosingCurrentSoc(selectedDistrict.soc);
    setDosingTargetSoc(Math.min(1.5, Number((selectedDistrict.soc + 0.35).toFixed(2))));
    // Set appropriate soil spectral key
    if (selectedDistrict.order === 'Vertisols') {
      setActiveSoilKey('kanhar');
    } else if (selectedDistrict.order === 'Alfisols' || selectedDistrict.order === 'Inceptisols') {
      setActiveSoilKey('matasi');
    } else {
      setActiveSoilKey('bhata');
    }
  }, [selectedDistrict]);

  // Filtered districts list
  const filteredDistricts = useMemo(() => {
    return DISTRICTS_33.filter(d => {
      const matchesZone = selectedZone === 'all' || d.zone_code === selectedZone;
      const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            d.vernacular.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            d.order.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesZone && matchesSearch;
    });
  }, [selectedZone, searchQuery]);

  // Dynamic Dosing Calculations
  const dosingCalculations = useMemo(() => {
    const deficit = Math.max(0, Number((dosingTargetSoc - dosingCurrentSoc).toFixed(2)));
    const area = dosingAcreage;
    const soilOrder = selectedDistrict.order;

    let fymPerHa = 8.0;
    let seedPerHa = 25.0;
    let cropName = 'Sesbania aculeata (Dhaincha)';
    let bufferPerHa = 2.5;
    let bufferType = 'Gypsum (Alkaline Vertisol Buffer)';
    let biocharPerHa = 3.0;

    if (soilOrder === 'Vertisols') {
      fymPerHa = 8.0;
      seedPerHa = 25.0;
      cropName = 'Sesbania aculeata (Dhaincha)';
      bufferPerHa = 2.5;
      bufferType = 'Gypsum @ 2.5 t/ha';
      biocharPerHa = 3.0;
    } else if (soilOrder === 'Inceptisols') {
      fymPerHa = 10.0;
      seedPerHa = 30.0;
      cropName = 'Crotalaria juncea (Sunn hemp)';
      bufferPerHa = 1.2;
      bufferType = 'Dolomitic Agricultural Lime @ 1.2 t/ha';
      biocharPerHa = 3.5;
    } else if (soilOrder === 'Alfisols') {
      fymPerHa = 12.0;
      seedPerHa = 35.0;
      cropName = 'Crotalaria juncea (Sunn hemp)';
      bufferPerHa = 1.8;
      bufferType = 'Agricultural Lime @ 1.8 t/ha';
      biocharPerHa = 4.0;
    } else {
      fymPerHa = 15.0;
      seedPerHa = 40.0;
      cropName = 'Sesbania rostrata';
      bufferPerHa = 3.0;
      bufferType = 'Agricultural Lime @ 3.0 t/ha';
      biocharPerHa = 5.0;
    }

    const totalFym = (fymPerHa * area * (1.0 + deficit)).toFixed(1);
    const totalSeed = (seedPerHa * area).toFixed(0);
    const totalBuffer = (bufferPerHa * area).toFixed(1);
    const totalBiochar = (biocharPerHa * area).toFixed(1);

    // 1 ha 10cm depth = ~1300t soil. 0.1% SOC = 1.3t carbon = ~4.77t CO2e
    const co2Tonnes = (area * (deficit * 10.0) * 1.3 * (44.0 / 12.0)).toFixed(1);
    const costInr = Math.round((Number(totalFym) * 800) + (Number(totalSeed) * 80) + (Number(totalBuffer) * 1200));
    const creditInr = Math.round(Number(co2Tonnes) * 1250);

    // Generate 5-year Trajectory Curve
    const trajectoryData = [
      { year: 'Year 0 (Base)', soc: dosingCurrentSoc, co2: 0, cost: costInr, revenue: 0 },
      { year: 'Year 1', soc: Number((dosingCurrentSoc + deficit * 0.20).toFixed(2)), co2: Math.round(Number(co2Tonnes) * 0.20), cost: costInr, revenue: Math.round(creditInr * 0.20) },
      { year: 'Year 2', soc: Number((dosingCurrentSoc + deficit * 0.45).toFixed(2)), co2: Math.round(Number(co2Tonnes) * 0.45), cost: costInr, revenue: Math.round(creditInr * 0.45) },
      { year: 'Year 3', soc: Number((dosingCurrentSoc + deficit * 0.70).toFixed(2)), co2: Math.round(Number(co2Tonnes) * 0.70), cost: costInr, revenue: Math.round(creditInr * 0.70) },
      { year: 'Year 4', soc: Number((dosingCurrentSoc + deficit * 0.88).toFixed(2)), co2: Math.round(Number(co2Tonnes) * 0.88), cost: costInr, revenue: Math.round(creditInr * 0.88) },
      { year: 'Year 5 (Target)', soc: dosingTargetSoc, co2: Math.round(Number(co2Tonnes)), cost: costInr, revenue: creditInr },
    ];

    return {
      deficit,
      totalFym,
      totalSeed,
      cropName,
      totalBuffer,
      bufferType,
      totalBiochar,
      co2Tonnes,
      costInr,
      creditInr,
      trajectoryData,
    };
  }, [dosingAcreage, dosingCurrentSoc, dosingTargetSoc, selectedDistrict]);

  // Execute Live API Query
  const testApi = async (endpoint: string, method: string = 'GET', body?: any) => {
    setIsQueryingApi(true);
    setTestEndpointResult(`[HTTP REQUEST] ${method} http://127.0.0.1:8000${endpoint} ...`);
    const t0 = performance.now();
    try {
      const opts: RequestInit = { method };
      if (body) {
        opts.headers = { 'Content-Type': 'application/json' };
        opts.body = JSON.stringify(body);
      }
      const res = await fetch(`http://127.0.0.1:8000${endpoint}`, opts);
      const elapsed = Math.round(performance.now() - t0);
      if (res.ok) {
        const json = await res.json();
        setTestEndpointResult(`// HTTP 200 OK (${elapsed}ms latency)\n` + JSON.stringify(json, null, 2));
      } else {
        const errJson = await res.json().catch(() => ({ detail: res.statusText }));
        setTestEndpointResult(`// HTTP ${res.status} ${res.statusText} (${elapsed}ms latency)\n` + JSON.stringify(errJson, null, 2));
      }
    } catch (err: any) {
      setTestEndpointResult(`// Backend server not currently running at 127.0.0.1:8000\n// To launch it:\n//   python run_api.py\n// (Certified offline fallback data remains fully active in workbench)`);
    } finally {
      setIsQueryingApi(false);
    }
  };

  const currentLayerSpec = RASTER_LAYERS.find(l => l.id === activeLayer) || RASTER_LAYERS[0];
  const currentSpectralProfile = SOIL_SPECTRAL_PROFILES[activeSoilKey] || SOIL_SPECTRAL_PROFILES.kanhar;

  return (
    <div className="min-h-screen bg-[#070B14] text-[#E2E8F0] font-sans antialiased selection:bg-[#E07A5F]/30 selection:text-white pb-20">
      
      {/* Top Telemetry Header */}
      <header className="border-b border-white/10 bg-[#0A101D]/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-[#131E35] border border-white/15 flex items-center justify-center text-[#E07A5F]">
              <Satellite className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono tracking-widest text-[#E07A5F] font-bold uppercase">ISRO NRSC • COSINE</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400">STATEWIDE 33-DISTRICT</span>
              </div>
              <h1 className="text-base font-bold text-white tracking-tight">SoilGuard-CG • Earth Observation Workbench</h1>
            </div>
          </div>

          {/* Telemetry readouts */}
          <div className="flex items-center gap-5 text-xs font-mono">
            <div className="hidden sm:block">
              <span className="text-slate-500 block text-[10px]">SENSORS</span>
              <span className="text-slate-300 font-semibold">S2-MSI + S1-SAR</span>
            </div>
            <div className="hidden sm:block">
              <span className="text-slate-500 block text-[10px]">COV / PSNR</span>
              <span className="text-[#22C55E] font-semibold">100% / 34.56 dB</span>
            </div>
            <div className="hidden md:block">
              <span className="text-slate-500 block text-[10px]">ACTIVE MODEL</span>
              <span className="text-[#38BDF8] font-semibold">{activeModelReported.split(' ')[0]}</span>
            </div>
            <div className="flex items-center gap-2 pl-3 border-l border-white/10">
              <span className={`w-2 h-2 rounded-full ${apiStatus === 'online' ? 'bg-[#22C55E] animate-pulse' : 'bg-[#E07A5F]'}`} />
              <span className="text-[11px] text-slate-300">
                {apiStatus === 'online' ? `API 8000 (${apiLatency}ms)` : 'OFFLINE AIRGAP'}
              </span>
            </div>
            <Link
              href="/"
              className="text-xs font-mono text-slate-400 hover:text-white px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 transition flex items-center gap-1 border border-white/10"
            >
              <span>Classic Portal</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Workbench Subnav Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 overflow-x-auto text-xs font-mono pt-1">
          <button
            onClick={() => setActiveTab('explorer')}
            className={`px-3 py-2 border-b-2 font-medium transition flex items-center gap-1.5 ${
              activeTab === 'explorer'
                ? 'border-[#E07A5F] text-white bg-white/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>33-DISTRICT GIS & RASTER EXPLORER</span>
          </button>
          <button
            onClick={() => setActiveTab('dosing')}
            className={`px-3 py-2 border-b-2 font-medium transition flex items-center gap-1.5 ${
              activeTab === 'dosing'
                ? 'border-[#E07A5F] text-white bg-white/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>REGENERATIVE AGRI-DOSING LAB</span>
          </button>
          <button
            onClick={() => setActiveTab('spectral')}
            className={`px-3 py-2 border-b-2 font-medium transition flex items-center gap-1.5 ${
              activeTab === 'spectral'
                ? 'border-[#E07A5F] text-white bg-white/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>SPECTRAL SIGNATURES & RECONSTRUCTION</span>
          </button>
          <button
            onClick={() => setActiveTab('telemetry')}
            className={`px-3 py-2 border-b-2 font-medium transition flex items-center gap-1.5 ${
              activeTab === 'telemetry'
                ? 'border-[#E07A5F] text-white bg-white/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>FASTAPI REST TELEMETRY COCKPIT</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">

        {/* ========================================================================= */}
        {/* TAB 1: 33-DISTRICT GIS & RASTER EXPLORER                                  */}
        {/* ========================================================================= */}
        {activeTab === 'explorer' && (
          <div className="space-y-6">
            
            {/* Top Stat Ribbon */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs">
              <div className="p-3.5 rounded-lg bg-[#0E1526] border border-white/10">
                <span className="text-slate-500 block text-[11px] mb-1">TOTAL SCENE COVERAGE</span>
                <span className="text-lg font-bold text-white">135,192 km²</span>
                <span className="text-slate-400 block mt-0.5 text-[10px]">All 33 Districts of Chhattisgarh</span>
              </div>
              <div className="p-3.5 rounded-lg bg-[#0E1526] border border-white/10">
                <span className="text-slate-500 block text-[11px] mb-1">KHARIF CLOUD PENETRATION</span>
                <span className="text-lg font-bold text-[#22C55E]">100.0%</span>
                <span className="text-slate-400 block mt-0.5 text-[10px]">CloudGap ST-DIP (SAR Guided)</span>
              </div>
              <div className="p-3.5 rounded-lg bg-[#0E1526] border border-white/10">
                <span className="text-slate-500 block text-[11px] mb-1">MEAN STATEWIDE SOC</span>
                <span className="text-lg font-bold text-[#E07A5F]">0.49%</span>
                <span className="text-slate-400 block mt-0.5 text-[10px]">Critical Deficit (&lt; 0.75% optimal)</span>
              </div>
              <div className="p-3.5 rounded-lg bg-[#0E1526] border border-white/10">
                <span className="text-slate-500 block text-[11px] mb-1">CRITICAL RISK AREA</span>
                <span className="text-lg font-bold text-[#EF4444]">5,487.1 ha</span>
                <span className="text-slate-400 block mt-0.5 text-[10px]">Tier-1 Immediate Dosing</span>
              </div>
            </div>

            {/* Interactive Grid & Selected Detail Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: District Selector & Table */}
              <div className="lg:col-span-7 space-y-4">
                <div className="p-4 rounded-lg bg-[#0E1526] border border-white/10 space-y-3">
                  
                  {/* Filter & Search Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5 font-mono text-xs">
                      <span className="text-slate-400 mr-1">Zone:</span>
                      <button
                        onClick={() => setSelectedZone('all')}
                        className={`px-2.5 py-1 rounded text-[11px] transition ${
                          selectedZone === 'all'
                            ? 'bg-[#E07A5F] text-white font-bold'
                            : 'bg-white/5 text-slate-400 hover:text-white'
                        }`}
                      >
                        All (33)
                      </button>
                      <button
                        onClick={() => setSelectedZone('plains')}
                        className={`px-2.5 py-1 rounded text-[11px] transition ${
                          selectedZone === 'plains'
                            ? 'bg-[#E07A5F] text-white font-bold'
                            : 'bg-white/5 text-slate-400 hover:text-white'
                        }`}
                      >
                        Plains (19)
                      </button>
                      <button
                        onClick={() => setSelectedZone('hills')}
                        className={`px-2.5 py-1 rounded text-[11px] transition ${
                          selectedZone === 'hills'
                            ? 'bg-[#E07A5F] text-white font-bold'
                            : 'bg-white/5 text-slate-400 hover:text-white'
                        }`}
                      >
                        Hills (7)
                      </button>
                      <button
                        onClick={() => setSelectedZone('plateau')}
                        className={`px-2.5 py-1 rounded text-[11px] transition ${
                          selectedZone === 'plateau'
                            ? 'bg-[#E07A5F] text-white font-bold'
                            : 'bg-white/5 text-slate-400 hover:text-white'
                        }`}
                      >
                        Bastar (7)
                      </button>
                    </div>

                    <input
                      type="text"
                      placeholder="Search district, soil order..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="px-3 py-1.5 rounded bg-black/40 border border-white/15 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-[#E07A5F] w-full sm:w-52"
                    />
                  </div>

                  {/* District Scrollable List */}
                  <div className="max-h-[460px] overflow-y-auto border border-white/10 rounded divide-y divide-white/5 font-mono text-xs">
                    {filteredDistricts.map(d => {
                      const isSelected = d.id === selectedDistrict.id;
                      return (
                        <div
                          key={d.id}
                          onClick={() => setSelectedDistrict(d)}
                          className={`p-3 cursor-pointer transition flex items-center justify-between gap-3 ${
                            isSelected
                              ? 'bg-[#1E293B] border-l-4 border-l-[#E07A5F]'
                              : 'hover:bg-white/[0.03]'
                          }`}
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="text-slate-500 text-[10px]">#{d.rank}</span>
                              <span className="font-semibold text-white text-sm">{d.name}</span>
                              <span className={`text-[10px] px-1.5 py-0.2 rounded ${
                                d.order === 'Vertisols' ? 'bg-amber-950/60 text-amber-300 border border-amber-800/40' :
                                d.order === 'Inceptisols' ? 'bg-blue-950/60 text-blue-300 border border-blue-800/40' :
                                d.order === 'Alfisols' ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40' :
                                'bg-rose-950/60 text-rose-300 border border-rose-800/40'
                              }`}>
                                {d.vernacular} ({d.order})
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {d.zone} • Area: {(d.areaHa / 1000).toFixed(0)}k ha
                            </div>
                          </div>

                          <div className="text-right space-y-0.5">
                            <div className="flex items-center justify-end gap-1.5">
                              <span className="text-slate-400 text-[10px]">Baseline SOC:</span>
                              <span className={`font-bold ${d.soc < 0.45 ? 'text-[#EF4444]' : d.soc < 0.55 ? 'text-amber-400' : 'text-[#22C55E]'}`}>
                                {d.soc.toFixed(2)}%
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-500">
                              Vuln: {d.vulnerability.toFixed(3)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column: Active District Dossier */}
              <div className="lg:col-span-5 space-y-4">
                <div className="p-5 rounded-lg bg-[#0E1526] border border-white/10 space-y-4 font-mono">
                  
                  {/* District Header */}
                  <div className="flex items-start justify-between border-b border-white/10 pb-4">
                    <div>
                      <div className="text-xs text-[#E07A5F] tracking-wider uppercase font-semibold">
                        AGRO-CLIMATIC DOSSIER
                      </div>
                      <h2 className="text-2xl font-bold text-white tracking-tight">{selectedDistrict.name}</h2>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {selectedDistrict.zone} • Lat {selectedDistrict.lat.toFixed(2)}°, Lon {selectedDistrict.lon.toFixed(2)}°
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-500 text-[10px] block">PRIORITY</span>
                      <span className="text-lg font-bold text-white">#{selectedDistrict.rank} / 33</span>
                    </div>
                  </div>

                  {/* Soil Properties Grid */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2.5 rounded bg-black/40 border border-white/5">
                      <span className="text-slate-500 block text-[10px]">BASELINE SOC</span>
                      <span className="text-base font-bold text-white">{selectedDistrict.soc}%</span>
                    </div>
                    <div className="p-2.5 rounded bg-black/40 border border-white/5">
                      <span className="text-slate-500 block text-[10px]">CLAY CONTENT</span>
                      <span className="text-base font-bold text-white">{selectedDistrict.clay}%</span>
                    </div>
                    <div className="p-2.5 rounded bg-black/40 border border-white/5">
                      <span className="text-slate-500 block text-[10px]">SOIL pH (H₂O)</span>
                      <span className="text-base font-bold text-white">{selectedDistrict.ph}</span>
                    </div>
                  </div>

                  {/* Predominant Soil Order Classification */}
                  <div className="p-3 rounded bg-black/40 border border-white/5 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Vernacular Soil:</span>
                      <span className="font-bold text-white">{selectedDistrict.vernacular}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">WRB Soil Order:</span>
                      <span className="font-bold text-[#E07A5F]">{selectedDistrict.order}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Deficiency Vulnerability:</span>
                      <span className="font-bold text-[#EF4444]">{selectedDistrict.vulnerability.toFixed(3)}</span>
                    </div>
                  </div>

                  {/* Specific Topsoil Threat */}
                  <div className="space-y-1 text-xs">
                    <span className="text-slate-400 font-semibold block">Identified Topsoil Degradation Threat:</span>
                    <p className="text-slate-300 bg-black/30 p-2.5 rounded border border-white/10 font-sans text-xs leading-relaxed">
                      {selectedDistrict.threat}
                    </p>
                  </div>

                  {/* Targeted Regenerative Agronomic Package */}
                  <div className="space-y-2 text-xs">
                    <span className="text-[#22C55E] font-semibold block uppercase tracking-wider text-[11px]">
                      Targeted Interventions (ISRO-Certified):
                    </span>
                    <ul className="space-y-1.5 font-sans">
                      {selectedDistrict.interventions.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-slate-300">
                          <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action Link to Dosing Lab & Map */}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button
                      onClick={() => setActiveTab('dosing')}
                      className="py-2.5 px-3 rounded bg-[#E07A5F] hover:bg-[#C25E2E] text-white font-bold transition flex items-center justify-center gap-1.5 text-xs"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Simulate Dosing</span>
                    </button>
                    <Link
                      href={`/interactive-map?district=${selectedDistrict.name}`}
                      className="py-2.5 px-3 rounded bg-[#1E293B] hover:bg-[#334155] text-white border border-white/10 font-bold transition flex items-center justify-center gap-1.5 text-xs text-center"
                    >
                      <MapPin className="w-3.5 h-3.5 text-[#38BDF8]" />
                      <span>Statewide Map ↗</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* HIGH-FIDELITY CARTOGRAPHIC RASTER VIEWPORT */}
            <div className="p-5 rounded-lg bg-[#0E1526] border border-white/10 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
                <div>
                  <div className="text-xs font-mono text-[#E07A5F] font-semibold uppercase tracking-wider">
                    OPTICAL & RADAR EARTH OBSERVATION ENGINE
                  </div>
                  <h3 className="text-base font-mono font-bold text-white tracking-tight flex items-center gap-2 mt-0.5">
                    <Layers className="w-4 h-4 text-[#E07A5F]" />
                    <span>Cartographic Multi-Spectral Raster Viewport</span>
                  </h3>
                </div>

                {/* Layer Selector Buttons */}
                <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
                  {RASTER_LAYERS.map(l => (
                    <button
                      key={l.id}
                      onClick={() => setActiveLayer(l.id)}
                      className={`px-2.5 py-1 rounded transition text-[11px] ${
                        activeLayer === l.id
                          ? 'bg-[#E07A5F] text-white font-bold shadow'
                          : 'bg-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      {l.label.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Viewport Control Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-3 rounded bg-black/40 border border-white/5 font-mono text-xs">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-[11px]">Layer:</span>
                    <span className="text-white font-bold">{currentLayerSpec.label}</span>
                  </div>
                  <div className="hidden sm:flex items-center gap-2 text-slate-400 text-[11px]">
                    <span>Resolution:</span>
                    <span className="text-[#38BDF8]">10.0m GSD (EPSG:32644)</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-[11px]">Opacity:</span>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      step="5"
                      value={layerOpacity}
                      onChange={e => setLayerOpacity(Number(e.target.value))}
                      className="w-24 accent-[#E07A5F] cursor-pointer"
                    />
                    <span className="text-white text-[11px] w-8">{layerOpacity}%</span>
                  </div>

                  <button
                    onClick={() => setIsComparingInpainting(!isComparingInpainting)}
                    className={`px-2.5 py-1 rounded border text-[11px] transition flex items-center gap-1.5 ${
                      isComparingInpainting
                        ? 'bg-[#38BDF8] text-black border-[#38BDF8] font-bold'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:text-white'
                    }`}
                  >
                    <Split className="w-3 h-3" />
                    <span>Compare Inpainting Curtain</span>
                  </button>
                </div>
              </div>

              {/* Visual Raster Display Canvas */}
              <div className="relative rounded-lg overflow-hidden border border-white/10 bg-black/80 aspect-[16/9] max-h-[460px] flex items-center justify-center select-none">
                
                {/* Basemap / Background Image */}
                <div className="absolute inset-0 z-0">
                  <img
                    src="/maps/clean_false_color.png"
                    alt="Satellite Basemap"
                    className="w-full h-full object-cover brightness-75 contrast-125"
                  />
                  {/* Subtle Grid Lines */}
                  <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
                </div>

                {/* Overlaid Active Raster Layer */}
                <div
                  className="absolute inset-0 z-10 transition-opacity duration-300 pointer-events-none"
                  style={{ opacity: layerOpacity / 100 }}
                >
                  <img
                    src={currentLayerSpec.assetPath}
                    alt={currentLayerSpec.label}
                    className="w-full h-full object-cover mix-blend-screen"
                  />
                </div>

                {/* Split Curtain Mode (Before vs After CloudGap Inpainting) */}
                {isComparingInpainting && (
                  <div className="absolute inset-0 z-20 pointer-events-none">
                    {/* Left side: Simulated Cloud Occluded Scene */}
                    <div
                      className="absolute inset-y-0 left-0 overflow-hidden border-r-2 border-[#E07A5F]"
                      style={{ width: `${splitCurtainPos}%` }}
                    >
                      <div className="absolute inset-0 w-full h-full bg-[#E2E8F0]/30 backdrop-blur-[2px] flex items-center justify-center">
                        <span className="absolute top-4 left-4 px-2 py-1 rounded bg-black/75 border border-rose-500/50 text-rose-400 font-mono text-[10px] font-bold">
                          ORIGINAL KHARIF: 80% CLOUD OCCLUDED
                        </span>
                      </div>
                    </div>

                    {/* Right side label */}
                    <span className="absolute top-4 right-4 px-2 py-1 rounded bg-black/75 border border-emerald-500/50 text-emerald-400 font-mono text-[10px] font-bold">
                      CLOUDGAP ST-DIP: 100% RECONSTRUCTED
                    </span>
                  </div>
                )}

                {/* Slider Thumb for Compare Mode */}
                {isComparingInpainting && (
                  <input
                    type="range"
                    min="5"
                    max="95"
                    value={splitCurtainPos}
                    onChange={e => setSplitCurtainPos(Number(e.target.value))}
                    className="absolute inset-x-4 bottom-4 z-30 accent-[#E07A5F] cursor-ew-resize opacity-80 hover:opacity-100"
                  />
                )}

                {/* Viewport Floating HUD Badge */}
                <div className="absolute bottom-4 left-4 z-20 p-2.5 rounded bg-black/85 backdrop-blur border border-white/15 font-mono text-[10px] space-y-1">
                  <div className="flex items-center gap-2 text-white font-semibold">
                    <span className="w-2 h-2 rounded-full bg-[#E07A5F]" />
                    <span>AOI: {selectedDistrict.name} Agricultural Sector</span>
                  </div>
                  <div className="text-slate-400 flex items-center gap-3">
                    <span>Lat: {selectedDistrict.lat.toFixed(3)}°N</span>
                    <span>Lon: {selectedDistrict.lon.toFixed(3)}°E</span>
                    <span>Bands: B2/B3/B4/B8/B11</span>
                  </div>
                </div>

                {/* Legend Overlay */}
                <div className="absolute top-4 right-4 z-20 p-2.5 rounded bg-black/85 backdrop-blur border border-white/15 font-mono text-[10px] space-y-1.5 hidden sm:block">
                  <span className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider">
                    {currentLayerSpec.label.split(' ')[0]} RAMPS
                  </span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-24 h-2.5 rounded bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-600" />
                  </div>
                  <div className="flex justify-between text-slate-400 text-[9px]">
                    <span>Low (0.0)</span>
                    <span>High (1.0)</span>
                  </div>
                </div>
              </div>

              {/* Raster Telemetry Footnote */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs pt-1">
                <div className="p-2.5 rounded bg-black/30 border border-white/5">
                  <span className="text-slate-500 block text-[10px]">SCENE PROVENANCE</span>
                  <span className="text-slate-200 font-semibold text-xs">Sentinel-2 10m L2A (18 Jun 2024)</span>
                </div>
                <div className="p-2.5 rounded bg-black/30 border border-white/5">
                  <span className="text-slate-500 block text-[10px]">SAR CORE REGISTRATION</span>
                  <span className="text-[#22C55E] font-semibold text-xs">Sentinel-1 C-Band (VV/VH 5.4GHz)</span>
                </div>
                <div className="p-2.5 rounded bg-black/30 border border-white/5">
                  <span className="text-slate-500 block text-[10px]">NEURAL RECONSTRUCTION</span>
                  <span className="text-[#38BDF8] font-semibold text-xs">ST-DIP 34.56 dB PSNR / 0.9728 SSIM</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: REGENERATIVE AGRI-DOSING LAB                                       */}
        {/* ========================================================================= */}
        {activeTab === 'dosing' && (
          <div className="space-y-6">
            <div className="p-5 rounded-lg bg-[#0E1526] border border-white/10 space-y-6 font-mono">
              
              <div className="border-b border-white/10 pb-4">
                <div className="text-xs text-[#E07A5F] tracking-wider uppercase font-semibold">
                  QUANTITATIVE PEDOLOGICAL SIMULATOR
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Regenerative Agronomic Dosing & Carbon Sequestration Engine
                </h2>
                <p className="text-xs font-sans text-slate-400 mt-1">
                  Calculates organic amendment volumes, nitrogen-fixing legume dosages, and mineral buffering required to achieve target topsoil carbon levels across all 33 Chhattisgarh districts.
                </p>
              </div>

              {/* Interactive Controls */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 rounded bg-black/40 border border-white/5 text-xs">
                
                {/* District Selection */}
                <div className="space-y-2">
                  <label className="text-slate-400 block font-semibold">Target District & Soil Order:</label>
                  <select
                    value={selectedDistrict.id}
                    onChange={e => {
                      const d = DISTRICTS_33.find(x => x.id === e.target.value);
                      if (d) setSelectedDistrict(d);
                    }}
                    className="w-full px-3 py-2 rounded bg-[#1E293B] border border-white/15 text-white focus:outline-none focus:border-[#E07A5F]"
                  >
                    {DISTRICTS_33.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.vernacular} - {d.order})
                      </option>
                    ))}
                  </select>
                  <span className="text-[11px] text-slate-500 block">
                    Agro-Climatic Zone: {selectedDistrict.zone}
                  </span>
                </div>

                {/* Farm Acreage Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-slate-400 font-semibold">Farm / Watershed Area:</label>
                    <span className="text-white font-bold text-sm">{dosingAcreage} ha</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    step="1"
                    value={dosingAcreage}
                    onChange={e => setDosingAcreage(Number(e.target.value))}
                    className="w-full accent-[#E07A5F] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>1 ha (Smallholder)</span>
                    <span>50 ha</span>
                    <span>100 ha (Watershed)</span>
                  </div>
                </div>

                {/* Target SOC % Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-slate-400 font-semibold">Target SOC Concentration:</label>
                    <span className="text-[#22C55E] font-bold text-sm">{dosingTargetSoc.toFixed(2)}%</span>
                  </div>
                  <input
                    type="range"
                    min={selectedDistrict.soc}
                    max={1.50}
                    step={0.05}
                    value={dosingTargetSoc}
                    onChange={e => setDosingTargetSoc(Number(e.target.value))}
                    className="w-full accent-[#22C55E] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>Baseline ({selectedDistrict.soc}%)</span>
                    <span>Target (+{dosingCalculations.deficit}%)</span>
                    <span>Optimal (1.50%)</span>
                  </div>
                </div>
              </div>

              {/* Prescribed Dosage Output Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                
                {/* FYM */}
                <div className="p-4 rounded-lg bg-[#111A2E] border border-white/10 space-y-1">
                  <span className="text-slate-400 block text-[11px]">FARMYARD MANURE (FYM)</span>
                  <div className="text-2xl font-bold text-white">{dosingCalculations.totalFym} <span className="text-sm font-normal text-slate-400">tonnes</span></div>
                  <span className="text-[11px] text-slate-400 block font-sans">
                    Composted cattle manure / biogas digestate
                  </span>
                </div>

                {/* Green Manure */}
                <div className="p-4 rounded-lg bg-[#111A2E] border border-white/10 space-y-1">
                  <span className="text-slate-400 block text-[11px]">GREEN MANURE SEEDS</span>
                  <div className="text-2xl font-bold text-[#22C55E]">{dosingCalculations.totalSeed} <span className="text-sm font-normal text-slate-400">kg</span></div>
                  <span className="text-[11px] text-emerald-300/80 block font-sans">
                    {dosingCalculations.cropName} (Sow 45 days pre-Kharif)
                  </span>
                </div>

                {/* Mineral Buffer */}
                <div className="p-4 rounded-lg bg-[#111A2E] border border-white/10 space-y-1">
                  <span className="text-slate-400 block text-[11px]">MINERAL BUFFERING</span>
                  <div className="text-2xl font-bold text-[#38BDF8]">{dosingCalculations.totalBuffer} <span className="text-sm font-normal text-slate-400">tonnes</span></div>
                  <span className="text-[11px] text-sky-300/80 block font-sans">
                    {dosingCalculations.bufferType}
                  </span>
                </div>

                {/* Carbon Sequestration */}
                <div className="p-4 rounded-lg bg-[#111A2E] border border-white/10 space-y-1">
                  <span className="text-slate-400 block text-[11px]">5-YR CO₂e SEQUESTRATION</span>
                  <div className="text-2xl font-bold text-[#E07A5F]">{dosingCalculations.co2Tonnes} <span className="text-sm font-normal text-slate-400">tCO₂e</span></div>
                  <span className="text-[11px] text-amber-300/80 block font-sans">
                    Recalcitrant soil organic carbon sink
                  </span>
                </div>
              </div>

              {/* 5-Year Carbon Stock & Economic Trajectory Visualization */}
              <div className="p-4 rounded-lg bg-black/40 border border-white/10 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2">
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      5-YEAR CARBON ACCUMULATION & CASH FLOW BREAK-EVEN TRAJECTORY
                    </h4>
                    <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                      Modeled topsoil organic carbon buildup and voluntary carbon registry payouts ($15/t CO₂e) against initial investment.
                    </p>
                  </div>
                  <span className="text-[11px] text-[#22C55E] font-bold">
                    Net 5-Yr Benefit: ₹{(dosingCalculations.creditInr - dosingCalculations.costInr).toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="h-64 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dosingCalculations.trajectoryData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22C55E" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#22C55E" stopOpacity={0.0}/>
                        </linearGradient>
                        <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#E07A5F" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#E07A5F" stopOpacity={0.0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                      <XAxis dataKey="year" stroke="#94A3B8" fontSize={11} />
                      <YAxis stroke="#94A3B8" fontSize={11} unit="₹" />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0A101D', borderColor: '#334155', borderRadius: '6px', fontSize: '11px' }}
                      />
                      <Legend verticalAlign="top" height={32} />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        name="Cumulative Carbon Revenue (₹)"
                        stroke="#22C55E"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                      />
                      <Area
                        type="monotone"
                        dataKey="cost"
                        name="Amortized Intervention Outlay (₹)"
                        stroke="#E07A5F"
                        strokeWidth={2}
                        strokeDasharray="4 4"
                        fillOpacity={1}
                        fill="url(#colorCost)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Economic Breakdown Details */}
              <div className="p-4 rounded-lg bg-black/40 border border-white/10 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div className="space-y-2 font-sans">
                  <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                    UPFRONT AMENDMENT EXPENDITURE
                  </h4>
                  <div className="space-y-1.5 text-slate-300">
                    <div className="flex justify-between py-1 border-b border-white/5 font-mono">
                      <span>Organic Amendments (FYM @ ₹800/t):</span>
                      <span className="text-white">₹{(Number(dosingCalculations.totalFym) * 800).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/5 font-mono">
                      <span>Legume Cover Seed (@ ₹80/kg):</span>
                      <span className="text-white">₹{(Number(dosingCalculations.totalSeed) * 80).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/5 font-mono">
                      <span>Mineral Buffer (@ ₹1200/t):</span>
                      <span className="text-white">₹{(Number(dosingCalculations.totalBuffer) * 1200).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between pt-1 font-mono font-bold text-sm text-[#E07A5F]">
                      <span>Estimated Total Outlay:</span>
                      <span>₹{dosingCalculations.costInr.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 font-sans">
                  <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                    CARBON ACCRUAL & ROI OUTLOOK
                  </h4>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    Under Article 6 of the Paris Agreement and voluntary agricultural carbon registries, sequestering {dosingCalculations.co2Tonnes} tonnes of permanent topsoil CO₂e yields:
                  </p>
                  <div className="p-3 rounded bg-white/5 border border-white/10 font-mono">
                    <span className="text-slate-400 text-[11px] block">CARBON CREDIT VALUE ($15 / tCO₂e):</span>
                    <span className="text-xl font-bold text-[#22C55E]">
                      ₹{dosingCalculations.creditInr.toLocaleString('en-IN')}
                    </span>
                    <span className="text-slate-400 text-[10px] block mt-0.5">
                      Subsidizes {(Math.min(100, (dosingCalculations.creditInr / (dosingCalculations.costInr || 1)) * 100)).toFixed(0)}% of upfront soil restoration capital.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: SPECTRAL SIGNATURES & RECONSTRUCTION                               */}
        {/* ========================================================================= */}
        {activeTab === 'spectral' && (
          <div className="space-y-6">
            <div className="p-5 rounded-lg bg-[#0E1526] border border-white/10 space-y-6 font-mono">
              
              <div className="border-b border-white/10 pb-4">
                <div className="text-xs text-[#E07A5F] tracking-wider uppercase font-semibold">
                  HIGH-RESOLUTION MULTI-SPECTRAL SPECTROSCOPY
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Sentinel-2 Multi-Spectral Reflectance: Occluded vs Reconstructed vs Ground Truth
                </h2>
                <p className="text-xs font-sans text-slate-400 mt-1">
                  Empirical verification of the CloudGap Deep Image Prior neural inpainter across the visible, near-infrared, and shortwave-infrared spectra.
                </p>
              </div>

              {/* Soil Type Filter Row */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded bg-black/40 border border-white/5 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Pedological Profile:</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setActiveSoilKey('kanhar')}
                      className={`px-3 py-1.5 rounded transition text-xs ${
                        activeSoilKey === 'kanhar'
                          ? 'bg-[#E07A5F] text-white font-bold'
                          : 'bg-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      Kanhar (Vertisols)
                    </button>
                    <button
                      onClick={() => setActiveSoilKey('matasi')}
                      className={`px-3 py-1.5 rounded transition text-xs ${
                        activeSoilKey === 'matasi'
                          ? 'bg-[#E07A5F] text-white font-bold'
                          : 'bg-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      Matasi (Alfisols)
                    </button>
                    <button
                      onClick={() => setActiveSoilKey('bhata')}
                      className={`px-3 py-1.5 rounded transition text-xs ${
                        activeSoilKey === 'bhata'
                          ? 'bg-[#E07A5F] text-white font-bold'
                          : 'bg-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      Bhata (Entisols)
                    </button>
                  </div>
                </div>

                <div className="text-right text-xs">
                  <span className="text-slate-400">Active WRB Order: </span>
                  <span className="text-[#38BDF8] font-bold">{currentSpectralProfile.wrb}</span>
                </div>
              </div>

              {/* Spectral Chart */}
              <div className="p-4 rounded-lg bg-black/40 border border-white/5">
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={currentSpectralProfile.data} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                      <XAxis dataKey="band" stroke="#94A3B8" fontSize={11} />
                      <YAxis stroke="#94A3B8" fontSize={11} domain={[0, 55]} unit="%" />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0A101D', borderColor: '#334155', borderRadius: '6px', fontSize: '12px' }}
                      />
                      <Legend verticalAlign="top" height={36} />
                      <Line
                        type="monotone"
                        dataKey="cloudy"
                        name="Cloudy Occluded (Pre-Inpainting)"
                        stroke="#EF4444"
                        strokeWidth={2}
                        strokeDasharray="4 4"
                        dot={{ r: 4 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="reconstructed"
                        name="CloudGap ST-DIP Reconstructed"
                        stroke="#22C55E"
                        strokeWidth={3}
                        dot={{ r: 5 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="groundTruth"
                        name="Ground Truth Clear Sky"
                        stroke="#38BDF8"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Metrics Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-3.5 rounded bg-black/40 border border-white/5 space-y-1">
                  <span className="text-slate-500 block text-[10px]">SPECTRAL ANGLE MAPPER (SAM)</span>
                  <span className="text-lg font-bold text-[#22C55E]">{currentSpectralProfile.sam}°</span>
                  <p className="text-slate-400 font-sans text-xs">Preserves authentic mineral absorption dips across 490-2190nm</p>
                </div>
                <div className="p-3.5 rounded bg-black/40 border border-white/5 space-y-1">
                  <span className="text-slate-500 block text-[10px]">PEAK SIGNAL-TO-NOISE RATIO</span>
                  <span className="text-lg font-bold text-white">34.56 dB</span>
                  <p className="text-slate-400 font-sans text-xs">Exceeds conventional bilinear inpainting (24.15 dB) by +10.4 dB</p>
                </div>
                <div className="p-3.5 rounded bg-black/40 border border-white/5 space-y-1">
                  <span className="text-slate-500 block text-[10px]">STRUCTURAL SIMILARITY (SSIM)</span>
                  <span className="text-lg font-bold text-[#38BDF8]">0.9728</span>
                  <p className="text-slate-400 font-sans text-xs">Preserves cadastral field boundaries and stream drainages</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: FASTAPI REST TELEMETRY                                             */}
        {/* ========================================================================= */}
        {activeTab === 'telemetry' && (
          <div className="space-y-6">
            <div className="p-5 rounded-lg bg-[#0E1526] border border-white/10 space-y-6 font-mono">
              
              <div className="border-b border-white/10 pb-4">
                <div className="text-xs text-[#E07A5F] tracking-wider uppercase font-semibold">
                  OPERATIONAL RESTFUL MICROSERVICES
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  FastAPI Live Query & Telemetry Cockpit
                </h2>
                <p className="text-xs font-sans text-slate-400 mt-1">
                  Direct HTTP interface to the SoilGuard-CG & CloudGap-CG microservices running on <code className="text-[#38BDF8]">http://127.0.0.1:8000</code>.
                </p>
              </div>

              {/* Endpoint Runner Buttons */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <button
                  onClick={() => testApi('/health')}
                  disabled={isQueryingApi}
                  className="px-3 py-2 rounded bg-[#1E293B] hover:bg-[#334155] text-white border border-white/10 transition"
                >
                  GET /health
                </button>
                <button
                  onClick={() => testApi('/readiness')}
                  disabled={isQueryingApi}
                  className="px-3 py-2 rounded bg-[#1E293B] hover:bg-[#334155] text-white border border-white/10 transition"
                >
                  GET /readiness
                </button>
                <button
                  onClick={() => testApi('/api/v1/metrics')}
                  disabled={isQueryingApi}
                  className="px-3 py-2 rounded bg-[#1E293B] hover:bg-[#334155] text-white border border-white/10 transition"
                >
                  GET /api/v1/metrics
                </button>
                <button
                  onClick={() => testApi('/api/v1/districts?zone=Bastar')}
                  disabled={isQueryingApi}
                  className="px-3 py-2 rounded bg-[#1E293B] hover:bg-[#334155] text-white border border-white/10 transition"
                >
                  GET /api/v1/districts (Bastar)
                </button>
                <button
                  onClick={() => testApi(`/api/v1/districts/${selectedDistrict.name}/advisory?farm_area_ha=25`)}
                  disabled={isQueryingApi}
                  className="px-3 py-2 rounded bg-[#1E293B] hover:bg-[#334155] text-white border border-white/10 transition"
                >
                  GET /api/v1/districts/{selectedDistrict.name}/advisory
                </button>
                <button
                  onClick={() => testApi('/api/v1/spectral/profiles/kanhar')}
                  disabled={isQueryingApi}
                  className="px-3 py-2 rounded bg-[#1E293B] hover:bg-[#334155] text-white border border-white/10 transition"
                >
                  GET /api/v1/spectral/profiles/kanhar
                </button>
                <button
                  onClick={() => testApi('/api/v1/soc/predict', 'POST', {
                    blue: 1050.0,
                    green: 1200.0,
                    red: 1450.0,
                    nir: 1850.0,
                    swir1: 2400.0,
                    district: selectedDistrict.name,
                  })}
                  disabled={isQueryingApi}
                  className="px-3 py-2 rounded bg-[#E07A5F] hover:bg-[#C25E2E] text-white font-bold transition"
                >
                  POST /api/v1/soc/predict (Bare Soil)
                </button>
                <button
                  onClick={() => testApi('/api/v1/inpainting/reconstruct', 'POST', {
                    scene_id: `${selectedDistrict.name}-Kharif-2024`,
                    cloud_fraction_pct: 74.5,
                    sar_vv_db: -12.4,
                    sar_vh_db: -18.6,
                  })}
                  disabled={isQueryingApi}
                  className="px-3 py-2 rounded bg-[#38BDF8]/20 hover:bg-[#38BDF8]/30 text-[#38BDF8] border border-[#38BDF8]/40 font-bold transition"
                >
                  POST /api/v1/inpainting/reconstruct
                </button>
              </div>

              {/* API Terminal Response */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>LIVE RESPONSE STREAM:</span>
                  <button
                    onClick={() => setTestEndpointResult('')}
                    className="hover:text-white"
                  >
                    Clear Stream
                  </button>
                </div>
                <pre className="p-4 rounded-lg bg-black/80 border border-white/10 text-xs font-mono text-emerald-400 overflow-x-auto max-h-96 min-h-48 whitespace-pre-wrap leading-relaxed">
                  {testEndpointResult || `// Click any endpoint button above to test live microservice queries.\n// API server entrypoint: python run_api.py (hosts on port 8000)\n// Interactive OpenAPI Swagger UI: http://127.0.0.1:8000/docs\n// Active Machine Learning Model: ${activeModelReported}`}
                </pre>
              </div>

              {/* Certified Invariant Proof Matrix */}
              <div className="p-4 rounded-lg bg-black/40 border border-white/10 space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  EARTH OBSERVATION CERTIFIED BENCHMARK INVARIANTS
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="border-b border-white/10 text-slate-400">
                        <th className="pb-2">EVALUATION METRIC</th>
                        <th className="pb-2">BENCHMARK VALUE</th>
                        <th className="pb-2">BASELINE / COMPARISON</th>
                        <th className="pb-2">SCIENTIFIC RIGOR</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-slate-300">
                      <tr>
                        <td className="py-2 text-white font-semibold">CloudGap PSNR</td>
                        <td className="py-2 text-[#22C55E]">34.56 dB</td>
                        <td className="py-2 text-slate-500">24.15 dB (Bilinear)</td>
                        <td className="py-2 text-slate-400">+10.41 dB restoration gain</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-white font-semibold">Structural Similarity</td>
                        <td className="py-2 text-[#22C55E]">0.9728 SSIM</td>
                        <td className="py-2 text-slate-500">0.7830 (Spatial Mean)</td>
                        <td className="py-2 text-slate-400">Structural integrity preserved</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-white font-semibold">Spatial Block CV R²</td>
                        <td className="py-2 text-[#38BDF8]">0.4076</td>
                        <td className="py-2 text-rose-400">0.5307 (Naive Split)</td>
                        <td className="py-2 text-slate-400">Certified zero spatial leakage</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-white font-semibold">Inference Latency</td>
                        <td className="py-2 text-[#22C55E]">&lt; 420 ms</td>
                        <td className="py-2 text-slate-500">SLA: 2000 ms</td>
                        <td className="py-2 text-slate-400">High-throughput subsecond tile execution</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-white/10 pt-6 text-center text-xs font-mono text-slate-500">
        <p>National Space Day Ideathon 2026 • COSINE NIT Raipur & National Remote Sensing Centre (NRSC) ISRO</p>
        <p className="mt-1">All 33 Administrative Districts of Chhattisgarh • All-Weather Sentinel-1/2 Remote Sensing</p>
      </footer>
    </div>
  );
}
