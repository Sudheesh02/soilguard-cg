# 🛡️ SoilGuard-CG: High-Resolution Soil Organic Carbon Risk & Regenerative Advisory Platform

> **National Space Day Ideathon 2026 – COSINE NIT Raipur × NRSC / ISRO**  
> **Target Region:** Raipur & Durg Agricultural Belts (*Dhan ka Katora*), Chhattisgarh, India

---

## 📌 Executive Summary

**SoilGuard-CG** is a terminal-native, 100% offline-capable geospatial Machine Learning platform and multi-app visual analytics suite. It processes 10m Sentinel-2 multispectral imagery and SoilGrids topsoil properties to compute high-resolution **Soil Health & Soil Organic Carbon (SOC) Deficiency Risk Maps**, sector priority rankings, and village-level agronomic advisory packages for the agricultural plain of Chhattisgarh.

By eliminating expensive physical soil sampling latency, SoilGuard-CG provides real-time, micro-spatial risk assessment across 2.27 million bare-soil pixels ($22,702.47\text{ hectares}$) with an empirical Random Forest regressor ($R^2 = 0.4486$, $\text{RMSE} = 0.1132$).

---

## 📁 Repository Structure

```
soilguard-cg-full-deliverable/
├── README.md                           # Main Repository Documentation (this file)
├── SOILGUARD_SOC_IDEATHON_BRIEF.md     # Master Ideathon Brief & Pitch Deck Content
├── SOILGUARD_SOC_MASTER_STUDY_GUIDE.md # Technical Architecture & Agronomic Reference Guide
├── demo.bat                            # One-Click Live Demonstration Launcher (Windows CMD)
├── run_demo.ps1                        # One-Click Live Demonstration Launcher (PowerShell)
├── demo.sh                             # One-Click Live Demonstration Launcher (Linux/macOS)
├── test_ai.py                          # DeepSeek Terminal AI Chatbot Integration
│
├── shared/                             # 🔗 Single source of truth for cross-app data
│   ├── sectors.json                    # Canonical 25-sector dataset (risk, SOC, advisory)
│   ├── metrics.json                    # Model / area metrics (sourced from pipeline outputs)
│   └── maps.json                       # Map catalog for both Next.js apps
│
├── scripts/
│   └── sync-site-data.mjs              # Regenerates lib/site-data.ts into both apps from shared/
│
├── soilguard-cg/                       # 🐍 Python Geospatial ML Core Engine
│   ├── data/                           # Raw, processed, and windowed golden rasters
│   ├── models/                         # Trained RF models (.joblib) + soil_soc_metrics.json
│   ├── notebooks/                      # Exploratory Data Analysis & Model Prototyping
│   ├── outputs/                        # High-resolution PNG maps, CSV priority rankings & MD reports
│   │   ├── phase2/                     # False-color, BSI, and NDVI raster maps
│   │   ├── phase3/                     # SOC Risk Score map & Histogram PNG
│   │   └── phase4/                     # Zonal priority map, Model confidence map, CSVs & Summaries
│   ├── src/                            # Modular pipeline scripts
│   │   ├── config.py                   # Shared paths, thresholds, sys.path bootstrap
│   │   ├── download_golden.py          # STAC & WCS Golden Dataset sampler
│   │   ├── verify_golden.py            # Raster integrity & resolution verifier
│   │   ├── spectral.py                 # NDVI, BSI & Bare Soil candidate mask engine
│   │   ├── visualize.py                # Matplotlib publication-grade map renderer
│   │   ├── plot_utils.py               # Dark-theme plot helpers (axes, colorbar, footnote, save)
│   │   ├── ml_risk.py                  # Leakage-free Random Forest Soil Risk Regressor
│   │   ├── zonal.py                    # 5x5 Zonal grid partitioning & priority sector ranking
│   │   ├── recommendations.py          # Regenerative Agronomic Package generator
│   │   ├── confidence.py               # Model uncertainty & ensemble variance estimator
│   │   ├── report.py                   # Executive summary report auto-generator
│   │   ├── tables.py                   # Shared Rich table builders (feature importance, sectors)
│   │   ├── bhuvan_integration.py       # ISRO Bhuvan LULC cropland cross-validation
│   │   ├── run_phase2.py               # Phase 2 spectral runner
│   │   ├── run_phase3.py               # Phase 3 ML risk runner
│   │   ├── run_phase4.py               # Phase 4 analytics & report runner
│   │   └── run_full_demo.py            # End-to-end orchestrator driving Phases 2→4
│   ├── environment.yml                 # Conda environment manifest
│   ├── requirements.txt                # Pip dependency specifications
│   └── README.md                       # Python Engine documentation
│
├── soilguard-dashboard/                # ⚛️ Next.js 14 Executive Analytics Dashboard
│   ├── app/                            # Next.js App Router pages & API routes
│   ├── components/                     # Reusable UI widgets & Recharts analytics components
│   ├── lib/                            # site-data.ts (generated), data.ts, theme.ts
│   ├── public/                         # Static assets & map overlays
│   └── package.json                    # Dashboard dependencies (Runs on http://localhost:3001)
│
└── soilguard-nextjs/                   # 🗺️ Next.js 14 Interactive Spatial Map Visualizer
    ├── app/                            # Interactive Leaflet map viewer routes
    ├── components/                     # Sections + shared MapCard / StatCard components
    ├── lib/                            # site-data.ts (generated)
    └── package.json                    # Visualizer dependencies (Runs on http://localhost:5000)
```

---

## ⚡ Quick Start & Demonstration

### 1. Run Full Machine Learning Pipeline (Python Core)

You can launch the complete end-to-end pipeline with a single command:

**Windows (PowerShell):**
```powershell
.\run_demo.ps1
```

**Windows (Command Prompt):**
```cmd
demo.bat
```

**Linux / macOS:**
```bash
chmod +x demo.sh
./demo.sh
```

---

### 2. Manual Environment Setup (Python)

```bash
cd soilguard-cg

# Using Conda (Recommended)
conda env create -f environment.yml
conda activate soilguard

# Or using Pip
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

#### Run the Full Pipeline (Orchestrated):

```bash
python src/run_full_demo.py
```

`run_full_demo.py` orchestrates Phases 2 → 4 end-to-end (computing spectral indices once, reusing them for training, and producing all maps, rankings, and reports).

#### Or Run Phases Separately:

```bash
# Phase 1: Verification of Offline Golden Datasets
python src/verify_golden.py

# Phase 2: Compute Spectral Indices (NDVI, BSI) & Bare Soil Masking
python src/run_phase2.py

# Phase 3: Train & Predict ML Soil Carbon Deficiency Risk
python src/run_phase3.py

# Phase 4: Zonal Sector Analytics, Agronomic Prescriptions & Executive Reports
python src/run_phase4.py
```

Phase 3 persists the real test metrics to `soilguard-cg/models/soil_soc_metrics.json`; Phase 4 reads them back instead of hard-coding values, so reported R²/RMSE always match the trained model.

---

### 3. Launch Next.js Dashboards

#### A. Executive Risk Analytics Dashboard (Port 3001)
```bash
cd soilguard-dashboard
npm install
npm run dev
```
Access at: `http://localhost:3001`

#### B. Interactive Spatial Map Visualizer (Port 5000)
```bash
cd soilguard-nextjs
npm install
npm run dev
```
Access at: `http://localhost:5000`

### 4. Shared Site Data (Single Source of Truth)

The 25-sector dataset, model/area metrics, and map catalog live in `shared/*.json` at the repo root (metrics are sourced from the pipeline's `outputs/phase4/risk_summary_stats.csv`). Both Next.js apps consume generated TypeScript modules (`lib/site-data.ts`) built from them — no more copy-pasted datasets or conflicting metric values across components:

```bash
node scripts/sync-site-data.mjs   # from repo root, or `npm run sync-data` inside either app
```

Update the JSON files (e.g. after re-running the pipeline) and re-run the sync script — both apps rebuild automatically.

---

## 🔬 Core Technical Architecture

1. **Multispectral Bare Soil Masking:**
   - Filters non-bare soil targets (dense green canopy, water bodies, urban built-up) using Normalized Difference Vegetation Index ($\text{NDVI} \le 0.30$) and Bare Soil Index ($\text{BSI} \ge 0.05$, $\text{NIR} \ge 300$).
   - Successfully isolates **2,270,247 bare topsoil pixels** ($22,702.47\text{ ha}$) across the Raipur/Durg agricultural boundary.

2. **Machine Learning Soil Risk Regressor:**
   - Pure Satellite-Driven Random Forest Model ($R^2 = 0.4486$, $\text{RMSE} = 0.1132$).
   - Trained on 5-band spectral inputs (B02 Blue, B03 Green, B04 Red, B08 NIR, B11 SWIR-1) plus spectral indices (NDVI, BSI, NDWI).
   - Generates continuous $0.0\text{--}1.0$ Soil Risk Scores ($0.0 = \text{Low Risk/Optimal SOC}$, $1.0 = \text{Critical SOC Deficiency}$).

3. **Spatial Zonal Grid & ISRO Bhuvan Validation:**
   - Partitions target AOI into a $5 \times 5$ grid of 25 spatial sectors ($3.6\text{km} \times 3.6\text{km}$ per sector).
   - Cross-validates priority cropland zones against **ISRO Bhuvan LULC 10k** Land Use / Land Cover baselines.

4. **Regenerative Agronomic Advisory Package:**
   - Automatically computes localized prescriptions:
     - **Farmyard Manure (FYM):** $8.0\text{--}12.0\text{ tonnes/ha}$
     - **Green Manuring:** *Sunn hemp* / *Dhaincha* crop incorporation
     - **Tillage Strategy:** Reduced / Zero-Tillage & residue retention
     - **Gypsum / Lime Amendment:** Clay-texture sensitive soil buffering

---

## 📊 Key Deliverables & Generated Artifacts

| Artifact | File Location | Description |
| :--- | :--- | :--- |
| **SOC Risk Score Map** | `soilguard-cg/outputs/phase3/soil_risk_score_map.png` | 10m spatial resolution topsoil SOC deficiency heatmap |
| **Zonal Priority Map** | `soilguard-cg/outputs/phase4/zonal_risk_map.png` | $5\times 5$ priority sector classification map |
| **Model Confidence Map**| `soilguard-cg/outputs/phase4/model_confidence_map.png` | Ensemble variance and uncertainty estimation map |
| **Agronomic Prescriptions** | `soilguard-cg/outputs/phase4/agronomic_recommendations.csv` | Sector-by-sector regenerative farming packages |
| **Bhuvan Priority CSV** | `soilguard-cg/outputs/phase4/bhuvan_village_priority_ranking.csv` | Village-level priority ranking cross-referenced with Bhuvan LULC |
| **Executive Summary Report** | `soilguard-cg/outputs/phase4/SoilGuard_SOC_Executive_Summary.md` | Comprehensive Markdown / PDF-ready executive briefing |

---

## 🏆 Ideathon Information & Credits

* **Event:** National Space Day Ideathon 2026
* **Organizers:** COSINE NIT Raipur × NRSC / ISRO (National Remote Sensing Centre)
* **Team:** SoilGuard Innovation Team
* **License:** MIT License
