# SoilGuard-SOC: Chhattisgarh Soil Carbon Sentinel & Action Plan
**National Space Day Ideathon 2026 – COSINE NIT Raipur + NRSC/ISRO**
*Raipur & Durg Agricultural Belt, Chhattisgarh (AOI: 81.60°E–81.80°E, 21.10°N–21.30°N)*

---

## 📌 Problem Snapshot
Agricultural soils in the Chhattisgarh plains (*Dhan ka Katora*) face severe Soil Organic Carbon (SOC) depletion due to mono-cropping paddy systems, intense summer topsoil heat, and stubble burning. **SoilGuard-SOC** provides a satellite-driven ML tool to automatically quantify, map, and prioritize Soil Organic Carbon deficiency hotspots at 10-meter spatial resolution.

---

## 🔬 Scientific Methodology
- **Remote Sensing Inputs**: Sentinel-2 L2A BOA Reflectance (B02, B04, B08, B11) windowed COG data.
- **Spectral Indicators**: Bare Soil Index (BSI), NDVI, SWIR-1/NIR moisture ratio, and spectral slope ratios.
- **Machine Learning Architecture**: Satellite-driven **Random Forest Regressor** trained on ground-truth SOC Deficiency target ($R^2 = 0.4588, 	ext{RMSE} = 0.1113$). Raw SoilGrids SOC was explicitly excluded from model features $X$ to eliminate target leakage and force true spectral learning.

---

## 📊 Key Findings & Spatial Area Breakdown

- **Total Evaluated Agricultural Soil Area**: `22,702.47 Hectares`
- **Low SOC Deficiency Area (< 0.45)**: `9,405.21 ha (41.43%)` – Stable organic carbon matter; maintenance tillage.
- **Moderate SOC Deficiency Area (0.45–0.58)**: `9,226.15 ha (40.64%)` – Moderate carbon replenishment needed; INM & cover crop rotation.
- **High SOC Deficiency Priority Area (> 0.58)**: `4,480.87 Hectares (19.7%)` – Severe carbon depletion & topsoil exposure; **URGENT REGENERATIVE INTERVENTION REQUIRED**.

*Note: Analysis sectors represent a 5x5 regular spatial grid overlay covering the Raipur AOI (22km x 22km extent).*

---

## 🔝 Top Priority Sectors Requiring Urgent Regenerative Intervention

| Priority Rank | Sector Name | Mean SOC Deficiency Score | Bare Soil Area (ha) | High Deficiency Area (ha) | Key Regenerative Action Package |
| :---: | :--- | :---: | :---: | :---: | :--- |
| **Rank #1** | `Arang (B-1)` | `0.6584` | `1,154.2 ha` | `946.3 ha` | Severe SOC Deficit & Low Clay: Apply 10-12 t/ha Farmyard Manure (FYM) or 3-4 t/ha Biochar + Green Manuring (Dhaincha/Sunnhemp) prior to Kharif paddy + 100% crop residue incorporation. |
| **Rank #2** | `Abhanpur (A-1)` | `0.6511` | `1,136.8 ha` | `901.0 ha` | Severe SOC Deficit & Low Clay: Apply 10-12 t/ha Farmyard Manure (FYM) or 3-4 t/ha Biochar + Green Manuring (Dhaincha/Sunnhemp) prior to Kharif paddy + 100% crop residue incorporation. |
| **Rank #3** | `Arang (B-2)` | `0.6330` | `1,108.7 ha` | `816.7 ha` | Severe SOC Deficit & Low Clay: Apply 10-12 t/ha Farmyard Manure (FYM) or 3-4 t/ha Biochar + Green Manuring (Dhaincha/Sunnhemp) prior to Kharif paddy + 100% crop residue incorporation. |
| **Rank #4** | `Abhanpur (A-2)` | `0.6063` | `576.8 ha` | `363.4 ha` | Severe SOC Deficit & Low Clay: Apply 10-12 t/ha Farmyard Manure (FYM) or 3-4 t/ha Biochar + Green Manuring (Dhaincha/Sunnhemp) prior to Kharif paddy + 100% crop residue incorporation. |
| **Rank #5** | `Raipur Rural (C-1)` | `0.5236` | `780.6 ha` | `243.9 ha` | Severe SOC Deficit & Low Clay: Apply 10-12 t/ha Farmyard Manure (FYM) or 3-4 t/ha Biochar + Green Manuring (Dhaincha/Sunnhemp) prior to Kharif paddy + 100% crop residue incorporation. |


---

## 💡 Target Regenerative Carbon Recommendations for Chhattisgarh Paddy Soils

1. **Carbon Deficit Management & FYM Application**:
   - Apply 8–12 tonnes/ha Farmyard Manure (FYM) or 3 t/ha Biochar in Tier 1 high SOC deficiency zones (< 1.0% Organic Carbon).
   - Incorporate leguminous green manuring (*Sunnhemp* or *Dhaincha*) prior to Kharif paddy transplantation.

2. **Crop Residue Retention & Tillage Optimization**:
   - Implement Zero-Tillage (Happy Seeder / Smart Seeder) + 3–4 t/ha paddy straw surface mulching to halt thermal topsoil carbon oxidation.

3. **Soil Reaction Correction**:
   - Apply Agricultural Lime @ 2.0–2.5 t/ha in acidic patches (pH < 5.8) or Gypsum @ 2.0 t/ha in sodic patches to optimize microbial carbon stabilization.

---

## 🖼️ Delivered Presentation-Ready Maps & Data Artifacts

- **SOC Deficiency Index Map**: [`outputs/phase3/risk_score_map.png`](../phase3/risk_score_map.png)
- **Zonal Organic Carbon Priority Map**: [`outputs/phase4/zonal_risk_map.png`](zonal_risk_map.png)
- **Model Ensemble Confidence Map**: [`outputs/phase4/model_confidence_map.png`](model_confidence_map.png)
- **Bare Soil Index (BSI) Map**: [`outputs/phase2/bsi_map.png`](../phase2/bsi_map.png)
- **Zonal Priority Ranking CSV**: [`outputs/phase4/zonal_priority_ranking.csv`](zonal_priority_ranking.csv)
- **Actionable Recommendations CSV**: [`outputs/phase4/agronomic_recommendations.csv`](agronomic_recommendations.csv)
