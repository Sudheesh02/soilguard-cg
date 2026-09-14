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


def calculate_soc_deficiency_target(soc, bsi=None, mode='pure_soc'):
    """
    Computes Soil Organic Carbon (SOC) Deficiency Index (y_soc_def in [0, 1]):

    Scientific Modes:
    - 'pure_soc' (default):
        y = 1.0 - soc_norm
        Completely decouples the target proxy from satellite spectral indices,
        eliminating the BSI target self-coupling leak.
    - 'compound_vulnerability':
        y = 0.60 * (1.0 - soc_norm) + 0.40 * bsi_norm
        Compound vulnerability index combining SoilGrids SOC deficit (60%)
        and Bare Soil Index exposure (40%).
    """
    soc_arr = np.asarray(soc, dtype=np.float32)
    # Mask SoilGrids nodata (e.g. -9999.0 or negative values) and non-finite numbers
    valid_soc = np.isfinite(soc_arr) & (soc_arr >= 0.0)
    if np.any(valid_soc):
        p1_soc, p99_soc = np.nanpercentile(soc_arr[valid_soc], [1, 99])
        soc_norm = np.clip((soc_arr - p1_soc) / (p99_soc - p1_soc + 1e-6), 0.0, 1.0)
    else:
        soc_norm = np.zeros_like(soc_arr, dtype=np.float32)

    if mode == 'pure_soc':
        soc_deficiency = 1.0 - soc_norm
    elif mode == 'compound_vulnerability':
        if bsi is None:
            raise ValueError("bsi must be provided when mode='compound_vulnerability'")
        bsi_arr = np.asarray(bsi, dtype=np.float32)
        valid_bsi = np.isfinite(bsi_arr)
        if np.any(valid_bsi):
            p1_bsi, p99_bsi = np.nanpercentile(bsi_arr[valid_bsi], [1, 99])
            bsi_norm = np.clip((bsi_arr - p1_bsi) / (p99_bsi - p1_bsi + 1e-6), 0.0, 1.0)
        else:
            bsi_norm = np.zeros_like(bsi_arr, dtype=np.float32)
        soc_deficiency = (0.60 * (1.0 - soc_norm)) + (0.40 * bsi_norm)
    else:
        raise ValueError(
            f"Unsupported mode '{mode}'. Valid modes are 'pure_soc' and 'compound_vulnerability'."
        )

    # Re-apply NaN to invalid nodata locations
    if not np.all(valid_soc):
        soc_deficiency = np.where(valid_soc, soc_deficiency, np.nan)

    soc_deficiency = np.clip(soc_deficiency, 0.0, 1.0).astype(np.float32)
    return soc_deficiency


def prepare_feature_matrix(
    s2_bands=None,
    soil_bands=None,
    profile=None,
    ndvi=None,
    bsi=None,
    mask=None,
    target_mode='pure_soc',
):
    """
    Extracts 100% satellite spectral features for candidate bare-soil pixels.
    NOTE: SoilGrids SOC is EXCLUDED from input features X.

    Pre-computed arrays (ndvi / bsi / mask) may be passed in to avoid recomputing
    spectral indices that an upstream phase already calculated (e.g. run_full_demo).
    Pixel spatial coordinates (rows, cols, coords) are recorded to enable
    rigorous Spatial Block Cross-Validation (SBCV).
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
    if soc.shape != mask.shape:
        from zonal import align_layer_to_target
        bounds = None
        transform = None
        if profile is not None and "transform" in profile:
            transform = profile["transform"]
            bounds = rasterio.transform.array_bounds(mask.shape[0], mask.shape[1], transform)
        soc = align_layer_to_target(soc, mask.shape, bounds=bounds, target_transform=transform)

    # Satellite Spectral Features & Ratios
    with np.errstate(divide='ignore', invalid='ignore'):
        swir1_red_ratio = swir1 / (red + 1.0)
        swir1_nir_ratio = swir1 / (nir + 1.0)

        bsi_ndvi_ratio = np.where(np.abs(ndvi + 0.05) > 1e-4, bsi / (ndvi + 0.05), 0.0)
        bsi_ndvi_ratio = np.nan_to_num(bsi_ndvi_ratio, nan=0.0, posinf=50.0, neginf=-50.0)

    target_proxy = calculate_soc_deficiency_target(soc, bsi, mode=target_mode)

    bare_indices = np.where(mask)
    rows = bare_indices[0].astype(np.int32)
    cols = bare_indices[1].astype(np.int32)
    coords = np.column_stack((rows, cols))

    geo_coords = None
    if profile is not None and "transform" in profile:
        xs, ys = rasterio.transform.xy(profile["transform"], rows, cols)
        geo_coords = np.column_stack((xs, ys))

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

    # Attach spatial coordinates as metadata attributes on DataFrame
    df_features.attrs['coords'] = coords
    df_features.attrs['rows'] = rows
    df_features.attrs['cols'] = cols
    if geo_coords is not None:
        df_features.attrs['geo_coords'] = geo_coords

    y = target_proxy[bare_indices]

    # Exclude any bare pixels that fall on nodata/NaN ground-truth SOC
    valid_y = np.isfinite(y)
    if not np.all(valid_y):
        df_features = df_features[valid_y].reset_index(drop=True)
        y = y[valid_y]
        rows = rows[valid_y]
        cols = cols[valid_y]
        coords = coords[valid_y]
        if geo_coords is not None:
            geo_coords = geo_coords[valid_y]
        bare_indices = (rows, cols)
        df_features.attrs['coords'] = coords
        df_features.attrs['rows'] = rows
        df_features.attrs['cols'] = cols
        if geo_coords is not None:
            df_features.attrs['geo_coords'] = geo_coords

    metadata = {
        'profile': profile,
        'shape': mask.shape,
        'mask': mask,
        'bare_indices': bare_indices,
        'rows': rows,
        'cols': cols,
        'coords': coords,
        'geo_coords': geo_coords,
        'bsi': bsi,
        'target_mode': target_mode,
    }

    return df_features, y, metadata


def train_soil_risk_model(
    df_features,
    y,
    sample_size=100000,
    model_save_path=MODEL_SAVE_PATH,
    coords=None,
    grid_size=(5, 5),
    target_mode='pure_soc',
    persist_metrics=True,
):
    """
    Trains Random Forest Regressor on satellite spectral features to predict SOC Deficiency Index.
    Implements Spatial Block Cross-Validation (SBCV) using spatial sector partitioning
    to strictly isolate training and testing pixels in geographic space (preventing Tobler's law autocorrelation leak).
    Computes and outputs both Spatial Block R²/RMSE and standard random R²/RMSE.
    Persists the model AND its metrics so downstream phases never hard-code them.
    """
    os.makedirs(os.path.dirname(model_save_path), exist_ok=True)

    if len(df_features) == 0:
        rf = RandomForestRegressor(n_estimators=10, max_depth=2, random_state=42)
        metrics = {
            'r2': 0.0,
            'rmse': 0.0,
            'spatial_block_r2': 0.0,
            'spatial_block_rmse': 0.0,
            'random_r2': 0.0,
            'random_rmse': 0.0,
            'spatial_test_blocks': [],
            'n_train': 0,
            'n_test': 0,
            'target_mode': target_mode,
        }
        return rf, metrics

    # Retrieve spatial coordinates
    if coords is None:
        coords = getattr(df_features, "attrs", {}).get("coords", None)
    if coords is None or len(coords) != len(df_features):
        coords = np.column_stack((
            np.arange(len(df_features), dtype=np.int32),
            np.zeros(len(df_features), dtype=np.int32),
        ))
    else:
        coords = np.asarray(coords)

    if len(df_features) > sample_size:
        np.random.seed(42)
        idx_sample = np.random.choice(len(df_features), size=sample_size, replace=False)
        X_sample = df_features.iloc[idx_sample].reset_index(drop=True)
        y_sample = np.asarray(y)[idx_sample]
        coords_sample = coords[idx_sample]
    else:
        X_sample = df_features.reset_index(drop=True)
        y_sample = np.asarray(y)
        coords_sample = coords

    # Sanitize non-finite values in X and y
    finite_mask = np.isfinite(y_sample) & np.all(np.isfinite(X_sample.values), axis=1)
    if not np.all(finite_mask):
        X_sample = X_sample[finite_mask].reset_index(drop=True)
        y_sample = y_sample[finite_mask]
        coords_sample = coords_sample[finite_mask]

    if len(X_sample) == 0:
        rf = RandomForestRegressor(n_estimators=10, max_depth=2, random_state=42)
        metrics = {
            'r2': 0.0,
            'rmse': 0.0,
            'spatial_block_r2': 0.0,
            'spatial_block_rmse': 0.0,
            'random_r2': 0.0,
            'random_rmse': 0.0,
            'spatial_test_blocks': [],
            'n_train': 0,
            'n_test': 0,
            'target_mode': target_mode,
        }
        return rf, metrics

    # Micro-sample guard (e.g. 1 to 4 samples)
    if len(X_sample) < 5:
        rf = RandomForestRegressor(n_estimators=20, max_depth=3, random_state=42)
        rf.fit(X_sample, y_sample)
        y_pred = rf.predict(X_sample)
        sb_r2 = float(r2_score(y_sample, y_pred)) if len(y_sample) > 1 else 1.0
        sb_rmse = float(np.sqrt(mean_squared_error(y_sample, y_pred)))
        metrics = {
            'r2': sb_r2,
            'rmse': sb_rmse,
            'spatial_block_r2': sb_r2,
            'spatial_block_rmse': sb_rmse,
            'random_r2': sb_r2,
            'random_rmse': sb_rmse,
            'spatial_test_blocks': [0],
            'n_train': int(len(X_sample)),
            'n_test': int(len(X_sample)),
            'target_mode': target_mode,
        }
        if persist_metrics:
            joblib.dump(rf, model_save_path)
            with open(MODEL_METRICS_PATH, "w", encoding="utf-8") as f:
                json.dump(metrics, f, indent=2)
        return rf, metrics

    # Spatial Block Cross-Validation Partitioning
    r_coords = coords_sample[:, 0].astype(np.float64)
    c_coords = coords_sample[:, 1].astype(np.float64)
    r_min, r_max = np.min(r_coords), np.max(r_coords)
    c_min, c_max = np.min(c_coords), np.max(c_coords)
    r_span = max(r_max - r_min, 1e-5)
    c_span = max(c_max - c_min, 1e-5)

    n_r_blocks, n_c_blocks = grid_size
    b_r = np.clip(np.floor((r_coords - r_min) / (r_span + 1e-6) * n_r_blocks).astype(int), 0, n_r_blocks - 1)
    b_c = np.clip(np.floor((c_coords - c_min) / (c_span + 1e-6) * n_c_blocks).astype(int), 0, n_c_blocks - 1)
    block_ids = b_r * n_c_blocks + b_c

    # Select 20% of spatial blocks for test holdout (dispersed knight's pattern across sectors)
    ideal_test_blocks = set(r * n_c_blocks + ((2 * r + 1) % n_c_blocks) for r in range(n_r_blocks))
    unique_present_blocks = np.unique(block_ids)

    test_block_set = ideal_test_blocks.intersection(unique_present_blocks)
    train_block_set = set(unique_present_blocks) - test_block_set

    # Fallback to alternating blocks if sector dispersion has zero samples
    if len(test_block_set) == 0 or len(train_block_set) == 0:
        test_block_set = set(b for b in unique_present_blocks if b % 2 == 1)
        train_block_set = set(unique_present_blocks) - test_block_set

    if len(test_block_set) == 0 or len(train_block_set) == 0:
        n_test_blks = max(1, int(len(unique_present_blocks) * 0.20))
        test_block_set = set(unique_present_blocks[:n_test_blks])
        train_block_set = set(unique_present_blocks[n_test_blks:])

    test_mask_sb = np.isin(block_ids, list(test_block_set))
    train_mask_sb = ~test_mask_sb

    if np.sum(test_mask_sb) == 0 or np.sum(train_mask_sb) == 0:
        X_train_sb, X_test_sb, y_train_sb, y_test_sb = train_test_split(
            X_sample, y_sample, test_size=0.20, random_state=42
        )
    else:
        X_train_sb = X_sample[train_mask_sb].reset_index(drop=True)
        y_train_sb = y_sample[train_mask_sb]
        X_test_sb = X_sample[test_mask_sb].reset_index(drop=True)
        y_test_sb = y_sample[test_mask_sb]

    # Standard random split for comparison against Tobler's law autocorrelation leak
    X_train_rand, X_test_rand, y_train_rand, y_test_rand = train_test_split(
        X_sample, y_sample, test_size=0.20, random_state=42
    )

    print(f"[+] Spatial Block Cross-Validation (SBCV) Partitioning ({n_r_blocks}x{n_c_blocks} grid):")
    print(f"    Held-out test blocks : {sorted(list(test_block_set))} ({len(test_block_set)}/{len(unique_present_blocks)} sectors)")
    print(f"    Spatial Block Train  : {len(X_train_sb):,} samples | Spatial Block Test: {len(X_test_sb):,} samples")
    print(f"    Standard Random Train: {len(X_train_rand):,} samples | Random Test       : {len(X_test_rand):,} samples")
    print(f"    Features in X: {list(X_sample.columns)}")

    # 1. Train primary model strictly under Spatial Block holdout
    rf = RandomForestRegressor(
        n_estimators=150,
        max_depth=14,
        min_samples_leaf=5,
        random_state=42,
        n_jobs=-1
    )
    rf.fit(X_train_sb, y_train_sb)
    y_pred_sb = rf.predict(X_test_sb)
    sb_r2 = float(r2_score(y_test_sb, y_pred_sb))
    sb_rmse = float(np.sqrt(mean_squared_error(y_test_sb, y_pred_sb)))

    # 2. Train baseline random-split model to document spatial autocorrelation gain
    rf_rand = RandomForestRegressor(
        n_estimators=150,
        max_depth=14,
        min_samples_leaf=5,
        random_state=42,
        n_jobs=-1
    )
    rf_rand.fit(X_train_rand, y_train_rand)
    y_pred_rand = rf_rand.predict(X_test_rand)
    rand_r2 = float(r2_score(y_test_rand, y_pred_rand))
    rand_rmse = float(np.sqrt(mean_squared_error(y_test_rand, y_pred_rand)))

    metrics = {
        'r2': sb_r2,
        'rmse': sb_rmse,
        'spatial_block_r2': sb_r2,
        'spatial_block_rmse': sb_rmse,
        'random_r2': rand_r2,
        'random_rmse': rand_rmse,
        'spatial_test_blocks': [int(b) for b in sorted(list(test_block_set))],
        'n_train': int(len(X_train_sb)),
        'n_test': int(len(X_test_sb)),
        'target_mode': target_mode,
    }

    print(f"[OK] Model Evaluated Successfully:")
    print(f"     • Spatial Block CV (SBCV) R²: {sb_r2:.4f} | RMSE: {sb_rmse:.4f}")
    print(f"     • Standard Random Split   R²: {rand_r2:.4f} | RMSE: {rand_rmse:.4f}")

    if persist_metrics:
        joblib.dump(rf, model_save_path)
        print(f"[OK] Saved updated SOC model to: {model_save_path}")

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
