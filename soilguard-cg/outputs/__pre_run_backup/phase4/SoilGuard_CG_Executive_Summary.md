# SoilGuard-CG: Soil Health Risk Mapping & Action Plan
**National Space Day Ideathon 2026 – COSINE NIT Raipur + NRSC/ISRO**
*Raipur & Durg Agricultural Belt, Chhattisgarh (AOI: 81.60°E–81.80°E, 21.10°N–21.30°N)*

---

## 📌 Problem Snapshot
Agricultural soils in the Chhattisgarh plains (Vertisols/Inceptisols) face increasing soil organic carbon (SOC) depletion, topsoil erosion risk, and structural degradation during dry post-harvest periods. **SoilGuard-CG** provides a terminal-native, satellite-driven ML tool to automatically quantify, map, and prioritize soil health risks at 10-meter spatial resolution.

---

## 🔬 Scientific Methodology
- **Remote Sensing Inputs**: Sentinel-2 L2A BOA Reflectance (B02, B04, B08, B11) windowed COG data.
- **Spectral Indicators**: Bare Soil Index (BSI), NDVI, SWIR-1/NIR moisture ratio, and spectral slope ratios.
- **Machine Learning Architecture**: Satellite-driven **Random Forest Regressor** trained on ground-truth soil degradation proxy ($R^2 = 0.4481, 	ext{RMSE} = 0.0940$). Raw SOC was explicitly excluded from model features $X$ to eliminate target leakage and force true spectral learning.

---

## 📊 Key Findings & Spatial Area Breakdown

- **Total Evaluated Agricultural Soil Area**: `22,702.47 Hectares`
- **Low Risk Area (< 0.45)**: `9,405.21 ha (41.43%)` – Stable soil organic matter; routine monitoring.
- **Moderate Risk Area (0.45–0.58)**: `9,226.15 ha (40.64%)` – Mild carbon vulnerability; INM recommended.
- **High Risk Priority Area (> 0.58)**: `3,989.47 Hectares (17.6%)` – Severe degradation & topsoil exposure; **URGENT INTERVENTION REQUIRED**.

*Note: Analysis sectors represent a 5x5 regular spatial grid overlay covering the Raipur AOI (22km x 22km extent).*

---

## 🔝 Top Priority Sectors Requiring Urgent Intervention

| Priority Rank | Sector Name | Mean Risk Score | Bare Soil Area (ha) | High Risk Area (ha) | Key Agronomic Action Package |
| :---: | :--- | :---: | :---: | :---: | :--- |
| **Rank #1** | `Arang (B-1)` | `0.6143` | `1,154.2 ha` | `869.2 ha` | Critical Carbon Deficit: Apply 8-10 tonnes/ha Farmyard Manure (FYM) or 3 tonnes/ha Biochar + Green Manuring (Dhaincha/Sunnhemp) prior to Kharif sowing. |
| **Rank #2** | `Abhanpur (A-1)` | `0.6106` | `1,136.8 ha` | `816.0 ha` | Critical Carbon Deficit: Apply 8-10 tonnes/ha Farmyard Manure (FYM) or 3 tonnes/ha Biochar + Green Manuring (Dhaincha/Sunnhemp) prior to Kharif sowing. |
| **Rank #3** | `Arang (B-2)` | `0.5925` | `1,108.7 ha` | `711.1 ha` | Critical Carbon Deficit: Apply 8-10 tonnes/ha Farmyard Manure (FYM) or 3 tonnes/ha Biochar + Green Manuring (Dhaincha/Sunnhemp) prior to Kharif sowing. |
| **Rank #4** | `Abhanpur (A-2)` | `0.5717` | `576.8 ha` | `316.3 ha` | Critical Carbon Deficit: Apply 8-10 tonnes/ha Farmyard Manure (FYM) or 3 tonnes/ha Biochar + Green Manuring (Dhaincha/Sunnhemp) prior to Kharif sowing. |
| **Rank #5** | `Raipur Rural (C-1)` | `0.5068` | `780.6 ha` | `202.9 ha` | Critical Carbon Deficit: Apply 8-10 tonnes/ha Farmyard Manure (FYM) or 3 tonnes/ha Biochar + Green Manuring (Dhaincha/Sunnhemp) prior to Kharif sowing. |


---

## 💡 Target Agronomic Recommendations for Chhattisgarh Vertisols

1. **Carbon Deficit Management**:
   - Apply 8–10 tonnes/ha Farm Yard Manure (FYM) or 3 t/ha Biochar in Tier 1 high-risk zones (< 1.0% Organic Carbon).
   - Incorporate legumes (*Sunnhemp* or *Dhaincha*) as green manure prior to Kharif paddy sowing.

2. **Topsoil Erosion Control**:
   - Implement Zero-Tillage / Minimum Tillage + 3–4 t/ha paddy straw surface mulching to preserve topsoil moisture and reduce thermal degradation.

3. **Soil Reaction Correction**:
   - Apply Agricultural Lime / Dolomite @ 2.0–2.5 t/ha in acidic patches (pH < 5.8) to unblock phosphorus fixation.

---

## 🖼️ Delivered Presentation-Ready Maps & Data Artifacts

- **Soil Health Risk Score Map**: [`outputs/phase3/risk_score_map.png`](../phase3/risk_score_map.png)
- **Zonal Priority Sector Map**: [`outputs/phase4/zonal_risk_map.png`](zonal_risk_map.png)
- **Model Ensemble Confidence Map**: [`outputs/phase4/model_confidence_map.png`](model_confidence_map.png)
- **Bare Soil Index (BSI) Map**: [`outputs/phase2/bsi_map.png`](../phase2/bsi_map.png)
- **Zonal Priority Ranking CSV**: [`outputs/phase4/zonal_priority_ranking.csv`](zonal_priority_ranking.csv)
- **Actionable Recommendations CSV**: [`outputs/phase4/agronomic_recommendations.csv`](agronomic_recommendations.csv)
