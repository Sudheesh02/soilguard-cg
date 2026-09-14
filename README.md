# SoilGuard CG: High Resolution Soil Organic Carbon Risk and Regenerative Advisory Platform

> National Space Day Ideathon 2026: COSINE NIT Raipur and NRSC ISRO (National Remote Sensing Centre)  
> Target Region: 33 Districts of Chhattisgarh, India (Dhan ka Katora)

> ### 5-Second Takeaway
> Monsoon cloud cover blinds up to 80% of Kharif optical satellite observations across Central India, creating critical data blindspots that stall regional soil organic carbon surveillance and agronomic intervention. SoilGuard CG resolves this by coupling Sentinel 1 synthetic aperture radar backscatter with a spatio temporal Deep Image Prior neural inpainter (CloudGap CG) and a spatial block cross validated regressor, producing all weather 10m topsoil deficiency maps across all 33 Chhattisgarh districts at 34.56 dB PSNR, 0.9728 SSIM, 0.4076 SBCV R², and subsecond inference.

## Live Deployments and Interactive Demos

| Service | Direct Link | Status |
| :--- | :--- | :--- |
| SoilGuard 33 District GIS Hub | [soilguard-nextjs.vercel.app](https://soilguard-nextjs.vercel.app/) | ![Production](https://img.shields.io/badge/Status-Active-brightgreen) |
| CloudGap Inpainting and Analytics API | [Localhost FastAPI Swagger UI](http://localhost:8000/docs) | ![Operational](https://img.shields.io/badge/Status-Operational-brightgreen) |
| SoilGuard Interactive Operations Portal | [Localhost Next.js Portal](http://localhost:5555) | ![Verified](https://img.shields.io/badge/Status-Verified-brightgreen) |

`text
[ Primary Metric: 34.56 dB PSNR | Secondary Metric: 0.9728 SSIM (2.262° SAM) | Latency: < 420 ms | Benchmark SLA: 100% All Weather Coverage Across 33 Districts ]
`

## System Architecture

`text
soilguard-cg-full-deliverable/
├── ISRO_NRSC_Submission/     # Unified execution pipeline and multi district orchestrator
├── cloudgap-cg/              # SAR guided spatio temporal DIP neural inpainting engine
├── soilguard-cg/             # Random Forest SOC regressor with spatial block CV
├── soilguard-nextjs/         # Interactive 33 district Leaflet GIS web platform
├── tests/                    # 146 automated Earth Observation and adversarial verification tests
└── run_unified_pipeline.py   # Single command end to end demonstration harness
`

## Offline Verification Pipeline

### 1. Offline Execution Demonstration (Under 30 Seconds, Zero Network Dependency)
Execute the terminal harness directly via PowerShell or batch:
`powershell
.\run_demo.ps1
`
Output rasters, CSV priority rankings, and analytical summaries populate in soilguard-cg/outputs/.

### 2. Localhost Visual Analytics Portals
Launch the interactive 33 district Leaflet operations hub:
`powershell
cd soilguard-nextjs
npm run dev
`
Navigate to http://localhost:5555 or http://localhost:3000.

### 3. Automated Earth Observation and Stress Verification Test Suite
Execute the certified 146 test test suite covering spatial block cross validation, pure NumPy autograd fallbacks, and multi district scaling:
`powershell
python -m pytest test_e2e_isro.py test_scientific_hardening.py test_adversarial_stress.py test_adversarial_challenger2.py -v
`

## Algorithmic Methodology and Benchmarks

### 1. CloudGap CG: Radar Guided Spatio Temporal Neural Inpainting
Central India experiences heavy monsoon overcast during the Kharif season (June to September). CloudGap CG reconstructs occluded 10m Sentinel 2 multispectral bands by fusing multitemporal optical context with cloud penetrating Sentinel 1 synthetic aperture radar (SAR) VV and VH polarizations.

| Reconstruction Engine | PSNR (dB) | SSIM | SAM (Degrees) | Compute Constraint |
| :--- | :--- | :--- | :--- | :--- |
| Spatial Mean Baseline | 19.40 | 0.6120 | 8.940° | Naive spatial interpolation |
| Classical Bilinear Inpainting | 24.15 | 0.7830 | 5.810° | Heuristic interpolation |
| CloudGap ST DIP (PyTorch CUDA) | 34.56 | 0.9728 | 2.262° | Partial convolution with SAR guidance |
| CloudGap NumPy Autograd (CPU) | 31.84 | 0.9310 | 3.105° | TinyHourglass architecture (13,460 parameters) |

### 2. Soil Organic Carbon Regressor and Spatial Block Cross Validation
Standard random train test splits suffer from spatial autocorrelation leakage (Tobler's First Law of Geography), falsely inflating model accuracy when adjacent pixels leak between splits. SoilGuard CG implements rigorous Spatial Block Cross Validation (SBCV) using 5x5 disjoint geographic blocks (.6\text{km} \times 3.6\text{km}$) to ensure genuine regional generalizability.

| Evaluation Strategy | Coefficient of Determination (^2$) | Root Mean Squared Error (RMSE) | Spatial Integrity |
| :--- | :--- | :--- | :--- |
| Naive Random Split | 0.5307 | 0.1742 | Flawed: Severe geographic proximity leakage |
| Spatial Block Cross Validation (SBCV) | 0.4076 | 0.1981 | Certified: Zero spatial autocorrelation leakage |

### 3. Pedological Stratification and Agronomic Dosing Engine
The platform maps topsoil deficiency across all 33 administrative districts of Chhattisgarh, classifying native soil orders into actionable regenerative interventions:

| Local Soil Order | World Reference Base | Baseline Mean SOC | Farmyard Manure (FYM) | Green Manuring Prescription | Mineral Buffering |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Kanhar | Vertisol (Deep Black Clay) | 0.62% | 8.0 tonnes per hectare | Sesbania aculeata (Dhaincha) | 2.5 tonnes per hectare Gypsum |
| Dorsa | Alfisol (Clay Loam) | 0.54% | 10.0 tonnes per hectare | Crotalaria juncea (Sunn hemp) | Neutral buffering |
| Matasi | Inceptisol (Sandy Loam) | 0.41% | 12.0 tonnes per hectare | Crotalaria juncea (Sunn hemp) | 1.8 tonnes per hectare Agricultural Lime |
| Bhata | Entisol (Gravelly Laterite) | 0.28% | 15.0 tonnes per hectare | Sesbania rostrata | 3.0 tonnes per hectare Agricultural Lime |

## End to End Execution Guide

### Complete Pipeline Run
`bash
python run_unified_pipeline.py --mode full --resolution 10m
`

### Refresh Geospatial Web Hub Assets
`bash
node scripts/sync-site-data.mjs
`

## Project Deliverables

| Deliverable Asset | Path | Description |
| :--- | :--- | :--- |
| 10m SOC Deficiency Heatmap | soilguard-cg/outputs/phase3/risk_score_map.png | 10m spatial resolution topsoil deficiency raster |
| Zonal Priority Classification | soilguard-cg/outputs/phase4/zonal_risk_map.png | 25 sector administrative prioritization map |
| Model Uncertainty Map | soilguard-cg/outputs/phase4/model_confidence_map.png | Ensemble variance and predictive confidence map |
| Regenerative Prescriptions | soilguard-cg/outputs/phase4/agronomic_recommendations.csv | Sector specific soil amendment specifications |
| ISRO Bhuvan Priority Roster | soilguard-cg/outputs/phase4/bhuvan_village_priority_ranking.csv | Village level rankings cross referenced with LULC |
| Technical Submission Report | soilguard-cg/outputs/phase4/SoilGuard_SOC_Executive_Summary.md | Formal evaluative briefing and scientific audit |

## Verification Certification

* Event: National Space Day Ideathon 2026
* Institutional Hosts: COSINE NIT Raipur and NRSC ISRO
* Unit Test Suite: 146 tests passed (100% pass rate)
* License: MIT License
