"""
SoilGuard-SOC: Centralized paths, constants & import bootstrap.

Every pipeline module should import from this module FIRST so that:
  - The ``src/`` and project-root directories are on ``sys.path`` (works from any CWD).
  - Golden raster paths, model paths, output directories and domain constants
    live in exactly ONE place instead of being re-declared in every module.
"""

import os
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))  # .../soilguard-cg/src
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)               # .../soilguard-cg

for _path in (SCRIPT_DIR, PROJECT_ROOT):
    if _path not in sys.path:
        sys.path.insert(0, _path)

# --- Data paths -------------------------------------------------------------
GOLDEN_DIR = os.path.join(PROJECT_ROOT, "data", "golden")
GOLDEN_S2_PATH = os.path.join(GOLDEN_DIR, "sentinel2_raipur_golden.tif")
GOLDEN_SOIL_PATH = os.path.join(GOLDEN_DIR, "soilgrids_raipur_golden.tif")

# --- Model paths ------------------------------------------------------------
MODEL_DIR = os.path.join(PROJECT_ROOT, "models")
MODEL_SAVE_PATH = os.path.join(MODEL_DIR, "soil_soc_rf.joblib")
MODEL_METRICS_PATH = os.path.join(MODEL_DIR, "soil_soc_metrics.json")

# --- Output paths -----------------------------------------------------------
OUTPUTS_DIR = os.path.join(PROJECT_ROOT, "outputs")
PHASE2_OUTPUT_DIR = os.path.join(OUTPUTS_DIR, "phase2")
PHASE3_OUTPUT_DIR = os.path.join(OUTPUTS_DIR, "phase3")
PHASE4_OUTPUT_DIR = os.path.join(OUTPUTS_DIR, "phase4")

# --- Domain constants -------------------------------------------------------
# 10m x 10m pixel = 100 m^2 = 0.01 ha
PIXEL_AREA_HA = 0.01

# Re-calibrated SOC Deficiency thresholds (shared by Phase 3 & Phase 4)
LOW_RISK_CUTOFF = 0.45
HIGH_RISK_CUTOFF = 0.58

# Fallback model metrics used when models/soil_soc_metrics.json is absent
# (last recorded values from outputs/golden_backup/risk_summary_stats.csv)
FALLBACK_METRICS = {"r2": 0.4486, "rmse": 0.1132}
