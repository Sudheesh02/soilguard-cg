# SoilGuard-CG Institutional Project Showcase Web Platform
**National Space Day Ideathon 2026 – COSINE NIT Raipur + NRSC/ISRO**

This directory contains the upgraded, research-grade showcase website for **SoilGuard-CG**, styled as an institutional satellite ground-station data console for NRSC/ISRO judges.

---

## 📁 Directory Structure & Map Artifacts

```
soilguard-cg/website/
├── index.html            # Main institutional showcase HTML document (Single-page App)
├── styles.css            # Custom Ground-Station Console Theme (Dark Obsidian, Cyan, Emerald)
├── script.js             # Interactive scripts (Lightbox Modal, Lat/Long Telemetry, Dynamic Cutoff Simulator)
├── README.md             # Local viewing and server guide
└── assets/
    └── images/           # Embedded 300 DPI High-Resolution PNG Maps
        ├── risk_score_map.png         (10m Soil Health Risk Score Map)
        ├── zonal_risk_map.png          (5×5 Sector Grid Priority Map)
        ├── model_confidence_map.png    (Model Ensemble Prediction Uncertainty Map)
        ├── bsi_map.png                 (Bare Soil Index Map)
        ├── false_color_composite.png   (SWIR1-NIR-Red Composite)
        ├── ndvi_map.png                (Full-Scene NDVI Map)
        └── risk_histogram.png          (Re-calibrated Risk Score Histogram)
```

---

## 🌐 How to View / Serve the Website Locally

### Option 1: Direct Browser Opening (Zero-Dependency Offline)
Simply open `index.html` directly in any web browser:
```bash
# In Linux / WSL terminal:
wslview soilguard-cg/website/index.html
# or
xdg-open soilguard-cg/website/index.html
```

### Option 2: Local Python HTTP Server
To serve via a lightweight HTTP server:
```bash
python3 -m http.server 8000 --directory soilguard-cg/website
```
Then navigate to `http://localhost:8000/` in your browser.

---

## 🏆 Key Features & Interactive Innovations

1. **Synchronized Spatial Map Console**: Interactive tabbed map switcher for Risk Score, Zonal Grid, Model Confidence, BSI, and False Color maps with a 300 DPI Lightbox modal.
2. **Real-time Lat/Long Cursor Telemetry Bar**: Dynamic coordinate tracker (`LAT: 21.145° N | LON: 81.732° E | PROJ: EPSG:32644`) when hovering over raster map containers.
3. **Dynamic Risk Cutoff Simulator**: Drag the threshold slider from `0.35` to `0.65` to dynamically simulate custom intervention policies and recalculate high-risk hectares in real-time.
4. **Target Leakage Prevention Callout**: Highlighted callout explaining that raw SoilGrids SOC was 100% EXCLUDED from feature matrix $X$.
5. **Terminal-Native CLI Showcase**: Styled terminal block featuring the single offline demo command `python soilguard-cg/src/run_full_demo.py` (41.03s execution time).
