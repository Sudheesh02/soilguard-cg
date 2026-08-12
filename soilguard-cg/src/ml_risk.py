"""
SoilGuard-SOC: Machine Learning Soil Organic Carbon (SOC) Deficiency Model (Phase 3)
Trains a Random Forest Regressor using 100% Sentinel-2 satellite spectral features
(BSI, NDVI, SWIR1, NIR, Red, Blue, and spectral ratios) to predict SOC Deficiency Index (0.0 to 1.0).

Scientific Design:
- Ground Truth Target (y): Soil Organic Carbon (SOC) Deficiency Index combining SoilGrids SOC deficit (60%)
  and satellite Bare Soil Index (BSI) topsoil exposure & oxidation risk (40%).
- Input Features (X): 100% Sentinel-2 satellite spectral observations:
  1. BSI (Bare Soil Index)
  2. NDVI (Normalized Difference Vegetation Index)
  3. SWIR1/NIR Ratio (Soil moisture & mineral composition indicator)
  4. SWIR1/Red Ratio (Bare soil spectral slope)
  5. BSI/NDVI Ratio (Soil-vegetation transition metric)
  6. Band Reflectances: Blue, Red, NIR, SWIR1
- Note: SoilGrids SOC is EXCLUDED from feature matrix X to ensure the model learns true satellite spectral response patterns.
"""

import json
import os

import joblib
import numpy as np
import pandas as pd
import rasterio
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import r2_score, mean_squared_error
from sklearn.model_selection import train_test_split

from config import (
    GOLDEN_SOIL_PATH,
    MODEL_METRICS_PATH,
    MODEL_SAVE_PATH,
    FALLBACK_METRICS,
)
from spectral import load_sentinel2_stack, compute_ndvi, compute_bsi, generate_bare_soil_mask


def load_soilgrids_stack(filepath=GOLDEN_SOIL_PATH):
    """
    Loads 3-band SoilGrids stack:
    Band 1: SOC (Soil Organic Carbon in dg/kg)
    Band 2: Clay (Clay content in g/kg)
    Band 3: pH (pH in H2O x 10)
    """
    if not os.path.exists(filepath):
        raise FileNotFoundError(f"Golden SoilGrids raster not found at: {filepath}")

    with rasterio.open(filepath) as src:
        soc = src.read(1).astype(np.float32)
        clay = src.read(2).astype(np.float32)
        ph = src.read(3).astype(np.float32) / 10.0

    return {'soc': soc, 'clay': clay, 'ph': ph}


def calculate_soc_deficiency_target(soc, bsi):
    """
    Computes a continuous domain-sound Soil Organic Carbon (SOC) Deficiency Index (y_soc_def in [0, 1]):
    Formulation:
    - 60% weight on Soil Organic Carbon deficiency: (1 - SOC_norm)
      (Lower SOC = higher deficiency / vulnerability)
    - 40% weight on Bare Soil Exposure Index: BSI_norm
      (Higher BSI = greater topsoil exposure & thermal oxidation of organic matter)
    """
    p1_soc, p99_soc = np.nanpercentile(soc, [1, 99])
    soc_norm = np.clip((soc - p1_soc) / (p99_soc - p1_soc + 1e-6), 0.0, 1.0)

    p1_bsi, p99_bsi = np.nanpercentile(bsi, [1, 99])
    bsi_norm = np.clip((bsi - p1_bsi) / (p99_bsi - p1_bsi + 1e-6), 0.0, 1.0)

    soc_deficiency = (0.60 * (1.0 - soc_norm)) + (0.40 * bsi_norm)
    soc_deficiency = np.clip(soc_deficiency, 0.0, 1.0)

    return soc_deficiency


def prepare_feature_matrix(s2_bands=None, soil_bands=None, profile=None, ndvi=None, bsi=None, mask=None):
    """
    Extracts 100% satellite spectral features for candidate bare-soil pixels.
    NOTE: SoilGrids SOC is EXCLUDED from input features X.

    Pre-computed arrays (ndvi / bsi / mask) may be passed in to avoid recomputing
    spectral indices that an upstream phase already calculated (e.g. run_full_demo).
    """
    if s2_bands is None:
        s2_bands, profile = load_sentinel2_stack()
    if soil_bands is None:
        soil_bands = load_soilgrids_stack()

    blue = s2_bands['blue']
    red = s2_bands['red']
    nir = s2_bands['nir']
    swir1 = s2_bands['swir1']

    if ndvi is None:
        ndvi = compute_ndvi(nir, red)
    if bsi is None:
        bsi = compute_bsi(swir1, red, nir, blue)
    if mask is None:
        mask, _, _ = generate_bare_soil_mask(ndvi, nir, bsi)

    soc = soil_bands['soc']

    # Satellite Spectral Features & Ratios
    with np.errstate(divide='ignore', invalid='ignore'):
        swir1_red_ratio = swir1 / (red + 1.0)
        swir1_nir_ratio = swir1 / (nir + 1.0)

        bsi_ndvi_ratio = np.where(np.abs(ndvi + 0.05) > 1e-4, bsi / (ndvi + 0.05), 0.0)
        bsi_ndvi_ratio = np.nan_to_num(bsi_ndvi_ratio, nan=0.0, posinf=50.0, neginf=-50.0)

    target_proxy = calculate_soc_deficiency_target(soc, bsi)

    bare_indices = np.where(mask)

    df_features = pd.DataFrame({
        'bsi': bsi[bare_indices],
        'ndvi': ndvi[bare_indices],
        'swir1_red_ratio': swir1_red_ratio[bare_indices],
        'swir1_nir_ratio': swir1_nir_ratio[bare_indices],
        'bsi_ndvi_ratio': bsi_ndvi_ratio[bare_indices],
        'blue_reflectance': blue[bare_indices] / 10000.0,
        'red_reflectance': red[bare_indices] / 10000.0,
        'nir_reflectance': nir[bare_indices] / 10000.0,
        'swir1_reflectance': swir1[bare_indices] / 10000.0
    })

    # Clean residual inf/nan
    df_features = df_features.fillna(0.0).replace([np.inf, -np.inf], 0.0)

    y = target_proxy[bare_indices]

    metadata = {
        'profile': profile,
        'shape': mask.shape,
        'mask': mask,
        'bare_indices': bare_indices,
        'bsi': bsi
    }

    return df_features, y, metadata


def train_soil_risk_model(df_features, y, sample_size=100000, model_save_path=MODEL_SAVE_PATH):
    """
    Trains Random Forest Regressor on satellite spectral features to predict SOC Deficiency Index.
    Persists the model AND its test metrics (R2/RMSE) so downstream phases never hard-code them.
    """
    os.makedirs(os.path.dirname(model_save_path), exist_ok=True)

    if len(df_features) > sample_size:
        idx_sample = np.random.choice(len(df_features), size=sample_size, replace=False)
        X_train_full = df_features.iloc[idx_sample]
        y_train_full = y[idx_sample]
    else:
        X_train_full = df_features
        y_train_full = y

    X_train, X_test, y_train, y_test = train_test_split(
        X_train_full, y_train_full, test_size=0.20, random_state=42
    )

    print(f"[+] Training Satellite-Driven Random Forest Regressor for SOC Deficiency on {len(X_train):,} samples...")
    print(f"    Features in X: {list(X_train.columns)}")
    rf = RandomForestRegressor(
        n_estimators=150,
        max_depth=14,
        min_samples_leaf=5,
        random_state=42,
        n_jobs=-1
    )
    rf.fit(X_train, y_train)

    y_pred = rf.predict(X_test)
    metrics = {
        'r2': float(r2_score(y_test, y_pred)),
        'rmse': float(np.sqrt(mean_squared_error(y_test, y_pred))),
    }

    print(f"[OK] Model Trained Successfully | Test R²: {metrics['r2']:.4f} | Test RMSE: {metrics['rmse']:.4f}")

    joblib.dump(rf, model_save_path)
    print(f"[OK] Saved updated SOC model to: {model_save_path}")

    # Persist metrics for downstream phases (run_phase4 / report) and site data export
    os.makedirs(os.path.dirname(MODEL_METRICS_PATH), exist_ok=True)
    with open(MODEL_METRICS_PATH, "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2)
    print(f"[OK] Saved model metrics to: {MODEL_METRICS_PATH}")

    return rf, metrics


def load_model_metrics(metrics_path=MODEL_METRICS_PATH):
    """
    Loads the last recorded model metrics (written at training time).
    Falls back to the golden-recorded values if the file is missing or corrupt.
    """
    if os.path.exists(metrics_path):
        try:
            with open(metrics_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return dict(FALLBACK_METRICS)


def predict_full_risk_map(rf, df_features, metadata):
    """
    Predicts SOC Deficiency Index (0-1) for all bare soil candidate pixels and reconstructs 2D raster map.
    """
    shape = metadata['shape']
    bare_indices = metadata['bare_indices']

    print(f"[+] Predicting SOC Deficiency Index for all {len(df_features):,} bare soil pixels...")
    predictions = rf.predict(df_features)
    predictions = np.clip(predictions, 0.0, 1.0)

    risk_map = np.full(shape, np.nan, dtype=np.float32)
    risk_map[bare_indices] = predictions

    return risk_map


if __name__ == "__main__":
    df_feat, y, meta = prepare_feature_matrix()
    rf, metrics = train_soil_risk_model(df_feat, y)
    risk_map = predict_full_risk_map(rf, df_feat, meta)
    print(f"SOC Deficiency Map reconstructed: shape={risk_map.shape}, valid_count={np.sum(~np.isnan(risk_map)):,}")
