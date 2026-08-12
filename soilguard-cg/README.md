# SoilGuard-CG (Sentinel-2 & SoilGrids Soil Health Risk Mapper)
**National Space Day Ideathon 2026 – COSINE NIT Raipur + NRSC/ISRO**

SoilGuard-CG is a terminal-native geospatial Machine Learning platform designed to produce high-resolution **Soil Health Risk Score maps** for the **Raipur and Durg agricultural belts in Chhattisgarh**.

---

## 📁 Project Structure

```
soilguard-cg/
├── data/
│   ├── raw/                 # Raw downloaded tiles / shapes
│   ├── processed/           # Processed rasters and vectors
│   └── golden/              # Cached offline datasets (Sentinel-2 + SoilGrids)
├── src/
│   ├── config.py            # Shared paths, constants & sys.path bootstrap (single source)
│   ├── download_golden.py   # Query STAC & WCS and create windowed golden rasters
│   ├── verify_golden.py     # Verification script for golden datasets
│   ├── spectral.py          # NDVI, BSI, and bare soil candidate masking
│   ├── visualize.py         # Matplotlib PPT-ready map generation
│   ├── plot_utils.py        # Dark-theme plot helpers shared across map functions
│   ├── ml_risk.py           # Pure Satellite-Driven Random Forest Soil Risk Regressor
│   ├── zonal.py             # Zonal analytics & priority sector ranking
│   ├── recommendations.py   # Actionable agronomic recommendation package engine
│   ├── confidence.py        # Ensemble prediction uncertainty & confidence mapping
│   ├── report.py            # Executive Summary report generator
│   ├── tables.py            # Shared Rich table builders (feature importance, sectors)
│   ├── run_phase2.py        # Phase 2 spectral runner script
│   ├── run_phase3.py        # Phase 3 ML risk runner script
│   ├── run_phase4.py        # Phase 4 zonal, recommendations & report runner
│   └── run_full_demo.py     # End-to-end orchestrator driving Phases 2 → 4
├── outputs/
│   ├── phase2/              # Generated high-res PNG maps (False-color, BSI, NDVI)
│   ├── phase3/              # Risk Score map PNG, Histogram PNG, and Summary Stats CSV
│   └── phase4/              # Zonal map PNG, Confidence map PNG, Priority CSVs, and Executive Summary
├── models/
│   ├── soil_soc_rf.joblib   # Trained Satellite-Driven Random Forest Model
│   ├── soil_soc_metrics.json# Real test metrics (R²/RMSE) written by Phase 3
│   └── soil_risk_rf.joblib  # Legacy model (kept for compatibility)
├── notebooks/               # Analysis and prototyping notebooks
├── environment.yml          # Conda environment definition
├── requirements.txt         # Pip dependency file
└── README.md                # Project documentation
```

---

## ⚙️ Environment Setup

### Option 1: Conda (Recommended)
```bash
conda env create -f environment.yml
conda activate soilguard
```

### Option 2: Virtualenv + Pip
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

---

## 🗺️ Locked Area of Interest (AOI)

- **Default AOI (Raipur Agricultural Belt)**: `[81.60, 21.10, 81.80, 21.30]` (WGS84 Bounding Box)
  - Covers Raipur / Abhanpur / Arang agricultural plain.
- **Fallback AOI (Durg Agricultural Belt)**: `[81.25, 21.10, 81.45, 21.30]` (WGS84 Bounding Box)
  - Covers Durg / Bhilai / Patan agricultural region.

---

## 🚀 Execution Guide

### Phase 1: Recreating Golden Data (Offline Cache)

```bash
python src/download_golden.py
python src/verify_golden.py
```

### Phase 2: Core Spectral & Masking Pipeline

```bash
python src/run_phase2.py
```

### Phase 3: Satellite-Driven ML Soil Health Risk Pipeline

```bash
python src/run_phase3.py
```

### Phase 4: Zonal Analytics, Recommendations & Executive Report

To execute sector partitioning, compute priority rankings, generate agronomic recommendation packages, render model uncertainty confidence maps, and auto-generate the executive report:

```bash
python src/run_phase4.py
```

Generated Phase 4 Outputs (`outputs/phase4/`):
- `zonal_risk_map.png` (Zonal Priority Sector Map)
- `model_confidence_map.png` (Model Uncertainty / Ensemble Confidence Map)
- `zonal_priority_ranking.csv` (Ranked CSV of agricultural sectors by intervention urgency)
- `agronomic_recommendations.csv` (Targeted agronomic intervention packages)
- `SoilGuard_CG_Executive_Summary.md` (Executive Summary Report)

> **Metrics**: Phase 3 writes the trained model's real test metrics to `models/soil_soc_metrics.json`. Phase 4 loads this file instead of hard-coding R²/RMSE, so every report reflects the actual trained model.

### Orchestrated Run (Recommended)

```bash
python src/run_full_demo.py
```

Runs Phases 2 → 4 back-to-back. Spectral indices (NDVI/BSI) and the bare-soil mask are computed **once** and passed straight into model training — no duplicate raster I/O.

---

## 🔬 Scientific Methodology & Target Proxy Formulation

To ensure high scientific credibility and avoid target leakage, **raw SoilGrids SOC values are explicitly EXCLUDED from input feature matrix $X$**. The Random Forest model is trained strictly on **100% Sentinel-2 satellite spectral channels and indices**:

### 1. Input Features ($X$)
- `swir1_reflectance`, `nir_reflectance`, `red_reflectance`, `blue_reflectance` (10m BOA Surface Reflectance)
- `bsi` (Bare Soil Index)
- `ndvi` (Normalized Difference Vegetation Index)
- `swir1_nir_ratio` (Soil moisture & mineral composition indicator)
- `swir1_red_ratio` (Bare soil spectral slope)
- `bsi_ndvi_ratio` (Soil-vegetation transition metric)

### 2. Ground Truth Target Proxy ($y_{\text{target}}$)
The target proxy ($y_{\text{risk}} \in [0.0, 1.0]$) represents ground-truth soil degradation risk:

$$y_{\text{proxy}} = 0.50 \times (1 - \text{SOC}_{\text{norm}}) + 0.50 \times \text{BSI}_{\text{norm}}$$

Where:
- **Soil Organic Carbon (SOC) Deficiency (50% weight)**: Normalized SOC inverted $(1 - \text{SOC}_{\text{norm}})$, grounding target in organic carbon vulnerability.
- **Bare Soil Exposure Index (50% weight)**: Normalized BSI ($\text{BSI}_{\text{norm}}$), capturing topsoil exposure to erosion.
