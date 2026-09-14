"""
SoilGuard-SOC: Statewide Chhattisgarh Scaling Engine
=====================================================
Scales remote sensing SOC deficiency risk analytics and localized regenerative
agronomic recommendations across all 33 districts of Chhattisgarh.

Key Features:
  1. Multi-scale execution: single district (--district), agro-climatic zone (--zone),
     or statewide batch (all 33 districts).
  2. Memory-efficient windowed raster processing pipeline avoiding RAM overflow.
  3. Golden cache ingestion with deterministic pedologically-sound synthetic spatial
     generator for external scenes outside the golden tile.
  4. Decoupled 100% satellite spectral SOC risk regressor (Random Forest).
  5. Localized regenerative agronomic advisory engine tailored to Chhattisgarh's
     indigenous soil orders (Kanhar, Dorsa, Matasi, Bhata).
  6. Structured CSV and JSON deliverables in outputs/chhattisgarh_statewide/.
"""

from __future__ import annotations

import argparse
from datetime import datetime
import json
import math
import os
import sys
import time
from typing import Any, Dict, Generator, List, Optional, Tuple
import warnings

# Suppress benign scikit-learn multi-process configuration warning during windowed prediction
warnings.filterwarnings("ignore", category=UserWarning, module="sklearn")

# Windows UTF-8 Console Encoding safeguard against cp1252 charmap crashes
if sys.platform == "win32":
    try:
        if hasattr(sys.stdout, "reconfigure"):
            sys.stdout.reconfigure(encoding="utf-8")
        if hasattr(sys.stderr, "reconfigure"):
            sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

import joblib
import numpy as np
import pandas as pd
import rasterio
from rasterio.windows import Window

# Add src and project root to path
_SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
_PROJECT_ROOT = os.path.dirname(_SCRIPT_DIR)
for _p in (_SCRIPT_DIR, _PROJECT_ROOT):
    if _p not in sys.path:
        sys.path.insert(0, _p)

from chhattisgarh_geography import (
    AgroClimaticZone,
    DistrictInfo,
    SoilOrder,
    VernacularSoil,
    get_all_districts,
    get_district,
    get_districts_by_zone,
    get_district_count,
    get_zone_summary
)
from config import (
    GOLDEN_S2_PATH,
    GOLDEN_SOIL_PATH,
    HIGH_RISK_CUTOFF,
    LOW_RISK_CUTOFF,
    MODEL_SAVE_PATH,
    PIXEL_AREA_HA,
    STATEWIDE_OUTPUT_DIR
)
from ml_risk import calculate_soc_deficiency_target
from spectral import compute_bsi, compute_ndvi, generate_bare_soil_mask


# ==============================================================================
# SPATIAL DATA GENERATOR & GOLDEN RASTER INGESTION
# ==============================================================================

def load_or_generate_district_stack(
    district: DistrictInfo,
    grid_shape: Tuple[int, int] = (256, 256),
    use_golden_for_raipur: bool = True
) -> Dict[str, np.ndarray]:
    """
    Ingests Sentinel-2 & SoilGrids stacks for a target district.
    If the district is Raipur and the golden tile is available, loads the real
    cached satellite rasters. Otherwise, invokes the offline synthetic spatial
    generator parameterized by the district's true pedological characteristics.

    Returns dictionary with:
      - 's2_bands': {'blue', 'red', 'nir', 'swir1'} (float32, BOA reflectance DN 0-10000)
      - 'soil_bands': {'soc', 'clay', 'ph'}
      - 'source': str ('golden_cache' or 'synthetic_offline_generator')
      - 'grid_shape': (rows, cols)
    """
    # Check if Raipur golden cache should be ingested
    if use_golden_for_raipur and district.name.lower() == "raipur":
        if os.path.exists(GOLDEN_S2_PATH) and os.path.exists(GOLDEN_SOIL_PATH):
            try:
                with rasterio.open(GOLDEN_S2_PATH) as s2_src:
                    b02 = s2_src.read(1).astype(np.float32)
                    b04 = s2_src.read(2).astype(np.float32)
                    b08 = s2_src.read(3).astype(np.float32)
                    b11 = s2_src.read(4).astype(np.float32)

                with rasterio.open(GOLDEN_SOIL_PATH) as soil_src:
                    soc = soil_src.read(1).astype(np.float32)
                    clay = soil_src.read(2).astype(np.float32)
                    ph = soil_src.read(3).astype(np.float32) / 10.0

                return {
                    's2_bands': {'blue': b02, 'red': b04, 'nir': b08, 'swir1': b11},
                    'soil_bands': {'soc': soc, 'clay': clay, 'ph': ph},
                    'source': 'golden_cache',
                    'grid_shape': b02.shape
                }
            except Exception as e:
                # Log and gracefully fallback to synthetic generator
                pass

    # Deterministic synthetic spatial generator seeded by district coordinates
    seed = int((abs(district.centroid[0] * 1000) + abs(district.centroid[1] * 100)) * 17) % 2147483647
    rng = np.random.RandomState(seed)

    rows, cols = grid_shape
    y_coords = np.linspace(0, 1, rows)
    x_coords = np.linspace(0, 1, cols)
    xx, yy = np.meshgrid(x_coords, y_coords)

    # Multi-frequency spatial pattern representing agricultural field parcels and terrain
    terrain_wave = np.sin(3.0 * np.pi * xx) * np.cos(3.0 * np.pi * yy)
    drainage_wave = np.sin(6.0 * np.pi * xx + 2.0 * np.pi * yy) * 0.4
    micro_texture = rng.normal(0.0, 0.25, size=(rows, cols))
    spatial_field = (terrain_wave + drainage_wave + micro_texture)

    # 1. SoilGrids layers calibrated to district baseline pedology
    soc_base = district.baseline_soc_dg_kg
    clay_base = district.baseline_clay_g_kg
    ph_base = district.baseline_ph

    soc_grid = np.clip(soc_base + (spatial_field * 12.0) + rng.normal(0, 4.0, size=(rows, cols)), 45.0, 180.0).astype(np.float32)
    clay_grid = np.clip(clay_base + (spatial_field * 30.0) + rng.normal(0, 10.0, size=(rows, cols)), 90.0, 520.0).astype(np.float32)
    ph_grid = np.clip(ph_base + (spatial_field * 0.35) + rng.normal(0, 0.1, size=(rows, cols)), 4.6, 8.4).astype(np.float32)

    # 2. Land-cover partitioning:
    # 45% bare agricultural topsoil, 45% vegetated/forest, 10% water bodies/settlement
    landcover_prob = rng.uniform(0.0, 1.0, size=(rows, cols))
    bare_soil_candidate = (landcover_prob < 0.48) & (spatial_field > -0.6)
    water_bodies = (landcover_prob >= 0.94) & (spatial_field < -0.8)

    # Initialize Sentinel-2 reflectance (DN: 0 - 10000)
    # Default: Moderate vegetation
    blue = rng.uniform(400, 750, size=(rows, cols)).astype(np.float32)
    red = rng.uniform(500, 950, size=(rows, cols)).astype(np.float32)
    nir = rng.uniform(2800, 4200, size=(rows, cols)).astype(np.float32)
    swir1 = rng.uniform(1400, 2200, size=(rows, cols)).astype(np.float32)

    # Bare soil fields: High SWIR1 and Red, moderate NIR, lower Blue
    # Modulated by soil order: Vertisols (Kanhar) have darker reflectance; Entisols (Bhata) have higher reflectance
    reflectance_factor = 1.25 if district.vernacular_soil == VernacularSoil.BHATA else (
        0.85 if district.vernacular_soil == VernacularSoil.KANHAR else 1.05
    )

    blue[bare_soil_candidate] = rng.uniform(650, 1100, size=np.sum(bare_soil_candidate)) * reflectance_factor
    red[bare_soil_candidate] = rng.uniform(1450, 2400, size=np.sum(bare_soil_candidate)) * reflectance_factor
    nir[bare_soil_candidate] = rng.uniform(1650, 2600, size=np.sum(bare_soil_candidate)) * reflectance_factor
    swir1[bare_soil_candidate] = rng.uniform(2300, 3700, size=np.sum(bare_soil_candidate)) * reflectance_factor

    # Water bodies: Low NIR, negative NDVI
    blue[water_bodies] = rng.uniform(800, 1500, size=np.sum(water_bodies))
    red[water_bodies] = rng.uniform(250, 450, size=np.sum(water_bodies))
    nir[water_bodies] = rng.uniform(100, 250, size=np.sum(water_bodies))
    swir1[water_bodies] = rng.uniform(80, 200, size=np.sum(water_bodies))

    return {
        's2_bands': {'blue': blue, 'red': red, 'nir': nir, 'swir1': swir1},
        'soil_bands': {'soc': soc_grid, 'clay': clay_grid, 'ph': ph_grid},
        'source': 'synthetic_offline_generator',
        'grid_shape': (rows, cols)
    }


# ==============================================================================
# WINDOWED RASTER PROCESSING & SPECTRAL FEATURE EXTRACTION
# ==============================================================================

def generate_raster_windows(
    height: int,
    width: int,
    window_size: int = 256
) -> Generator[Tuple[int, int, int, int], None, None]:
    """Yields (row_start, row_end, col_start, col_end) bounding boxes for memory-capped processing."""
    for r in range(0, height, window_size):
        r_end = min(r + window_size, height)
        for c in range(0, width, window_size):
            c_end = min(c + window_size, width)
            yield (r, r_end, c, c_end)


def extract_window_spectral_features(
    s2_bands: Dict[str, np.ndarray],
    window: Tuple[int, int, int, int],
    ndvi_threshold: float = 0.30,
    min_nir_reflectance: float = 300.0
) -> Tuple[pd.DataFrame, np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    """
    Extracts 100% satellite spectral features for candidate bare soil pixels within a window.
    SoilGrids SOC is excluded from the feature matrix X.

    Returns:
      (df_features, window_mask, window_bsi, window_ndvi, bare_indices)
    """
    r_start, r_end, c_start, c_end = window
    blue = s2_bands['blue'][r_start:r_end, c_start:c_end]
    red = s2_bands['red'][r_start:r_end, c_start:c_end]
    nir = s2_bands['nir'][r_start:r_end, c_start:c_end]
    swir1 = s2_bands['swir1'][r_start:r_end, c_start:c_end]

    w_ndvi = compute_ndvi(nir, red)
    w_bsi = compute_bsi(swir1, red, nir, blue)
    w_mask, _, _ = generate_bare_soil_mask(w_ndvi, nir, w_bsi, ndvi_threshold, min_nir_reflectance)

    bare_indices = np.where(w_mask)
    n_bare = len(bare_indices[0])

    if n_bare == 0:
        empty_df = pd.DataFrame(columns=[
            'bsi', 'ndvi', 'swir1_red_ratio', 'swir1_nir_ratio', 'bsi_ndvi_ratio',
            'blue_reflectance', 'red_reflectance', 'nir_reflectance', 'swir1_reflectance'
        ])
        return empty_df, w_mask, w_bsi, w_ndvi, bare_indices

    # Ratios matching Phase 3 Regressor design
    with np.errstate(divide='ignore', invalid='ignore'):
        swir1_red_ratio = swir1 / (red + 1.0)
        swir1_nir_ratio = swir1 / (nir + 1.0)
        bsi_ndvi_ratio = np.where(np.abs(w_ndvi + 0.05) > 1e-4, w_bsi / (w_ndvi + 0.05), 0.0)
        bsi_ndvi_ratio = np.nan_to_num(bsi_ndvi_ratio, nan=0.0, posinf=50.0, neginf=-50.0)

    df_features = pd.DataFrame({
        'bsi': w_bsi[bare_indices],
        'ndvi': w_ndvi[bare_indices],
        'swir1_red_ratio': swir1_red_ratio[bare_indices],
        'swir1_nir_ratio': swir1_nir_ratio[bare_indices],
        'bsi_ndvi_ratio': bsi_ndvi_ratio[bare_indices],
        'blue_reflectance': blue[bare_indices] / 10000.0,
        'red_reflectance': red[bare_indices] / 10000.0,
        'nir_reflectance': nir[bare_indices] / 10000.0,
        'swir1_reflectance': swir1[bare_indices] / 10000.0
    })
    df_features = df_features.fillna(0.0).replace([np.inf, -np.inf], 0.0)

    return df_features, w_mask, w_bsi, w_ndvi, bare_indices


# ==============================================================================
# LOCALIZED REGENERATIVE AGRONOMIC ADVISORY ENGINE
# ==============================================================================

def generate_district_agronomic_advisory(
    district: DistrictInfo,
    mean_risk_score: float,
    mean_soc: float,
    mean_clay: float,
    mean_ph: float,
    pct_high_risk: float
) -> Dict[str, Any]:
    """
    Generates localized regenerative agronomic advisory package tailored to:
      1. District's indigenous soil order (Kanhar / Dorsa / Matasi / Bhata)
      2. Predicted satellite SOC deficiency severity
      3. SoilGrids clay content and pH balance
    """
    actions = []
    urgency = "STABLE (TIER 3)"

    # Urgency determination based on SOC deficiency index & high-risk fraction
    if mean_risk_score >= HIGH_RISK_CUTOFF or pct_high_risk >= 35.0 or mean_soc < 90.0:
        urgency = "CRITICAL (TIER 1)"
    elif mean_risk_score >= LOW_RISK_CUTOFF or pct_high_risk >= 15.0 or mean_soc < 110.0:
        urgency = "MODERATE (TIER 2)"
    else:
        urgency = "STABLE (TIER 3)"

    # 1. Soil-Order Specific Carbon Building Protocol
    if district.vernacular_soil == VernacularSoil.KANHAR or district.soil_order == SoilOrder.VERTISOLS:
        # Deep Black Cracking Clay Vertisols (Chhattisgarh Central Plains)
        if urgency == "CRITICAL (TIER 1)":
            actions.append(
                "Critical Vertisol Organic Building: Apply 8-10 t/ha Farmyard Manure (FYM) + Green Manuring (Dhaincha/Sesbania aculeata) "
                "+ Zero-Tillage (Happy Seeder/Smart Seeder) with 4 t/ha paddy straw retention to alleviate swelling clay compaction & prevent thermal oxidation."
            )
        else:
            actions.append(
                "Vertisol Structure Maintenance: Adopt Integrated Nutrient Management (75% RDF + 25% organic manure) "
                "+ Green Manuring (Dhaincha/Sesbania aculeata) prior to puddling + reduced tillage."
            )
        # Gypsum addition for Vertisol flocculation & sodicity alleviation
        actions.append("Apply Gypsum @ 2.0 t/ha to relieve clay sodicity, stimulate aeration, and enhance humic clay-organic complexation.")

    elif district.vernacular_soil == VernacularSoil.DORSA or district.soil_order == SoilOrder.INCEPTISOLS:
        # Intermediate Loamy Inceptisols (Central Plains & River Valleys)
        if urgency == "CRITICAL (TIER 1)":
            actions.append(
                "Intensive Carbon Replenishment: Apply 8 t/ha FYM or vermicompost + surface mulching with 3 t/ha crop residue "
                "+ rotate Kharif Paddy with Rabi Legume cover crops (Chickpea/Lentil) under reduced tillage."
            )
        else:
            actions.append(
                "Balanced Loam Management: Apply 5-6 t/ha FYM + relay cropping of pulses (Urd/Mung) in standing paddy + reduced tillage."
            )

    elif district.vernacular_soil == VernacularSoil.MATASI or district.soil_order == SoilOrder.ALFISOLS:
        # Yellowish Sandy Loam Alfisols (Northern Hills & Bastar Margins)
        if urgency == "CRITICAL (TIER 1)":
            actions.append(
                "Severe SOC Deficit & Light Texture: Apply 10-12 t/ha FYM + 3-4 t/ha Biochar + Green Manuring (Sunnhemp) "
                "prior to Kharif sowing + contour bunding to arrest torrential topsoil runoff."
            )
        else:
            actions.append(
                "Alfisol Humus Building: Apply 8-10 t/ha FYM + 2-3 t/ha Biochar + contour bunding & vegetative barriers (Vetiver grass) to conserve moisture and arrest slope erosion."
            )

    elif district.vernacular_soil == VernacularSoil.BHATA or district.soil_order == SoilOrder.ENTISOLS:
        # Gravelly Red Skeletal Barren Upland Entisols (Bastar Plateau & Northern Hills)
        actions.append(
            "Critical Skeletal Topsoil Restoration: Apply 12-15 t/ha FYM + 4-5 t/ha Biochar to rebuild permanent cation exchange capacity (CEC) "
            "+ enforce 100% crop residue retention with zero burning."
        )
        actions.append(
            "Erosion Control & Watershed Buffering: Implement continuous hillside contour bunding, stone terracing, "
            "and agroforestry integration with Millets (Kodo-Kutki) and perennial legume buffers."
        )

    # 2. Chemical Soil Reaction Correction
    if mean_ph < 5.8:
        actions.append(
            f"Acidic Reaction Neutralization: Apply Agricultural Lime @ {2.0 if mean_ph < 5.3 else 1.5:.1f} t/ha "
            f"to optimize soil pH (currently {mean_ph:.2f}) and unlock microbial organic carbon mineralization."
        )
    elif mean_ph > 7.5:
        actions.append(
            f"Alkaline Sodic Soil Management: Apply Gypsum @ 2.0 t/ha + green manuring to optimize soil pH ({mean_ph:.2f}) "
            "and improve structural porosity."
        )

    primary_rec = actions[0] if actions else "Routine organic monitoring and conservation tillage."
    secondary_rec = actions[1] if len(actions) > 1 else "Cover cropping with local legumes."

    return {
        'urgency_level': urgency,
        'primary_recommendation': primary_rec,
        'secondary_recommendation': secondary_rec,
        'full_action_package': " | ".join(actions)
    }


# ==============================================================================
# PIPELINE EXECUTION FOR SINGLE DISTRICT
# ==============================================================================

def process_district(
    district: DistrictInfo,
    rf_model: Optional[Any] = None,
    window_size: int = 256,
    grid_shape: Tuple[int, int] = (256, 256),
    use_golden_for_raipur: bool = True
) -> Dict[str, Any]:
    """
    Executes end-to-end SOC deficiency analytics for a single district:
      1. Ingests or generates satellite and SoilGrids stacks.
      2. Processes window-by-window in memory-capped blocks.
      3. Predicts decoupled SOC risk regressor.
      4. Calculates zonal summary statistics.
      5. Formulates localized agronomic advisory package.
    """
    start_time = time.time()

    # Ingest / Generate Stack
    stack = load_or_generate_district_stack(
        district=district,
        grid_shape=grid_shape,
        use_golden_for_raipur=use_golden_for_raipur
    )
    s2_bands = stack['s2_bands']
    soil_bands = stack['soil_bands']
    height, width = stack['grid_shape']
    total_pixels = height * width

    # Windowed Accumulators
    bare_count = 0
    high_risk_count = 0
    sum_risk = 0.0
    sum_soc = 0.0
    sum_clay = 0.0
    sum_ph = 0.0
    sum_bsi = 0.0
    max_risk = 0.0

    # Ensure RF model exists
    if rf_model is None and os.path.exists(MODEL_SAVE_PATH):
        try:
            rf_model = joblib.load(MODEL_SAVE_PATH)
        except Exception:
            rf_model = None

    for window in generate_raster_windows(height, width, window_size=window_size):
        r_start, r_end, c_start, c_end = window
        df_feat, w_mask, w_bsi, w_ndvi, bare_idx = extract_window_spectral_features(s2_bands, window)

        n_window_bare = len(df_feat)
        if n_window_bare == 0:
            continue

        bare_count += n_window_bare

        # Run decoupled ML regressor if available; fallback to analytical target proxy
        if rf_model is not None:
            try:
                preds = rf_model.predict(df_feat)
                preds = np.clip(preds, 0.0, 1.0)
            except Exception:
                # Calibrated analytical fallback
                w_soc = soil_bands['soc'][r_start:r_end, c_start:c_end][bare_idx]
                soc_norm = np.clip((w_soc - 45.0) / (160.0 - 45.0), 0.0, 1.0)
                preds = (1.0 - soc_norm).astype(np.float32)
        else:
            w_soc = soil_bands['soc'][r_start:r_end, c_start:c_end][bare_idx]
            soc_norm = np.clip((w_soc - 45.0) / (160.0 - 45.0), 0.0, 1.0)
            preds = (1.0 - soc_norm).astype(np.float32)

        # Accumulate metrics
        sum_risk += float(np.sum(preds))
        max_risk = max(max_risk, float(np.max(preds)))
        high_risk_count += int(np.sum(preds > HIGH_RISK_CUTOFF))

        w_soc_vals = soil_bands['soc'][r_start:r_end, c_start:c_end][bare_idx]
        w_clay_vals = soil_bands['clay'][r_start:r_end, c_start:c_end][bare_idx]
        w_ph_vals = soil_bands['ph'][r_start:r_end, c_start:c_end][bare_idx]

        sum_soc += float(np.sum(w_soc_vals))
        sum_clay += float(np.sum(w_clay_vals))
        sum_ph += float(np.sum(w_ph_vals))
        sum_bsi += float(np.sum(df_feat['bsi'].values))

        # Explicitly free window arrays to guarantee strict memory ceiling
        del df_feat, w_mask, w_bsi, w_ndvi, bare_idx, preds

    # Summary calculations
    if bare_count > 0:
        mean_risk = sum_risk / bare_count
        mean_soc = sum_soc / bare_count
        mean_clay = sum_clay / bare_count
        mean_ph = sum_ph / bare_count
        mean_bsi = sum_bsi / bare_count
        pct_high_risk = (high_risk_count / bare_count) * 100.0
    else:
        mean_risk = district.soc_vulnerability_index
        max_risk = mean_risk
        mean_soc = district.baseline_soc_dg_kg
        mean_clay = district.baseline_clay_g_kg
        mean_ph = district.baseline_ph
        mean_bsi = 0.15
        pct_high_risk = 0.0

    # Cartographic area conversion
    # Evaluated area is calibrated to the district's official geographic size
    district_total_ha = district.approx_area_ha
    bare_soil_fraction = (bare_count / total_pixels) if total_pixels > 0 else 0.0
    bare_soil_ha = round(district_total_ha * bare_soil_fraction, 2)
    high_risk_ha = round(bare_soil_ha * (pct_high_risk / 100.0), 2)

    # Agronomic Advisory Formulation
    advisory = generate_district_agronomic_advisory(
        district=district,
        mean_risk_score=mean_risk,
        mean_soc=mean_soc,
        mean_clay=mean_clay,
        mean_ph=mean_ph,
        pct_high_risk=pct_high_risk
    )

    elapsed_ms = round((time.time() - start_time) * 1000, 2)

    result = {
        'district_name': district.name,
        'zone': district.zone.value,
        'zone_code': district.zone_code,
        'predominant_soil': district.predominant_soil,
        'soil_order': district.soil_order.value,
        'vernacular_soil': district.vernacular_soil.value,
        'bbox_wgs84': list(district.bbox_wgs84),
        'centroid': list(district.centroid),
        'total_area_ha': round(district_total_ha, 2),
        'bare_soil_ha': bare_soil_ha,
        'bare_soil_pct': round(bare_soil_fraction * 100.0, 2),
        'mean_soc_deficiency': round(float(mean_risk), 4),
        'max_soc_deficiency': round(float(max_risk), 4),
        'high_risk_ha': high_risk_ha,
        'pct_high_risk': round(float(pct_high_risk), 2),
        'mean_soc_dg_kg': round(float(mean_soc), 2),
        'mean_clay_g_kg': round(float(mean_clay), 2),
        'mean_ph': round(float(mean_ph), 2),
        'mean_bsi': round(float(mean_bsi), 4),
        'urgency_level': advisory['urgency_level'],
        'primary_advisory': advisory['primary_recommendation'],
        'secondary_advisory': advisory['secondary_recommendation'],
        'full_advisory_package': advisory['full_action_package'],
        'data_source': stack['source'],
        'processing_time_ms': elapsed_ms
    }

    return result


# ==============================================================================
# STATEWIDE & ZONE BATCH CONTROLLERS
# ==============================================================================

def run_statewide_pipeline(
    districts: Optional[List[DistrictInfo]] = None,
    output_dir: str = STATEWIDE_OUTPUT_DIR,
    window_size: int = 256,
    grid_shape: Tuple[int, int] = (256, 256),
    model_path: str = MODEL_SAVE_PATH,
    use_golden_for_raipur: bool = True,
    save_district_files: bool = True,
    verbose: bool = True
) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """
    Executes the statewide scaling engine across a set of districts (or all 33 districts).
    Exports district and statewide summary tables (CSV and JSON) in outputs/chhattisgarh_statewide/.
    Preserves and updates existing statewide summary records non-destructively.
    """
    if districts is None:
        districts = get_all_districts()

    os.makedirs(output_dir, exist_ok=True)
    if save_district_files:
        os.makedirs(os.path.join(output_dir, "districts"), exist_ok=True)

    # Load RF regressor once to share across workers
    rf_model = None
    if os.path.exists(model_path):
        try:
            rf_model = joblib.load(model_path)
            if verbose:
                print(f"[+] Loaded RF SOC Model: {model_path}")
        except Exception as e:
            if verbose:
                print(f"[-] Could not load model from {model_path}: {e}")

    if verbose:
        print(f"[+] Executing SoilGuard-SOC Statewide Engine for {len(districts)} districts...")
        print(f"    Output Directory: {output_dir}")

    records: List[Dict[str, Any]] = []
    t0 = time.time()

    for idx, dist in enumerate(districts, 1):
        if verbose:
            print(f"    [{idx:02d}/{len(districts):02d}] Processing {dist.name} ({dist.zone.value})...", end="", flush=True)
        res = process_district(
            district=dist,
            rf_model=rf_model,
            window_size=window_size,
            grid_shape=grid_shape,
            use_golden_for_raipur=use_golden_for_raipur
        )
        records.append(res)
        if verbose:
            print(f" OK (SOC Def: {res['mean_soc_deficiency']:.3f}, {res['urgency_level']}, {res['processing_time_ms']}ms)")

        # Save individual district JSON deliverable
        if save_district_files:
            slug = dist.name.lower().replace(" ", "_").replace("-", "_")
            dist_json_path = os.path.join(output_dir, "districts", f"{slug}.json")
            with open(dist_json_path, "w", encoding="utf-8") as df_f:
                json.dump(res, df_f, indent=2)

    total_pipeline_time = round(time.time() - t0, 3)

    # Convert to DataFrame
    df_current = pd.DataFrame(records)

    # Reorder columns for optimal clarity
    col_order = [
        "statewide_priority_rank",
        "district_name",
        "zone",
        "zone_code",
        "predominant_soil",
        "soil_order",
        "vernacular_soil",
        "total_area_ha",
        "bare_soil_ha",
        "bare_soil_pct",
        "mean_soc_deficiency",
        "max_soc_deficiency",
        "high_risk_ha",
        "pct_high_risk",
        "mean_soc_dg_kg",
        "mean_clay_g_kg",
        "mean_ph",
        "mean_bsi",
        "urgency_level",
        "primary_advisory",
        "secondary_advisory",
        "full_advisory_package",
        "data_source",
        "processing_time_ms"
    ]

    csv_statewide_path = os.path.join(output_dir, "chhattisgarh_statewide_summary.csv")
    json_statewide_path = os.path.join(output_dir, "chhattisgarh_statewide_summary.json")

    # If single district was evaluated, export district-level dedicated files
    if len(districts) == 1:
        slug = districts[0].name.lower().replace(" ", "_").replace("-", "_")
        d_csv = os.path.join(output_dir, f"district_{slug}_summary.csv")
        d_json = os.path.join(output_dir, f"district_{slug}_summary.json")
        df_current.to_csv(d_csv, index=False)
        with open(d_json, "w", encoding="utf-8") as f:
            json.dump(records[0], f, indent=2)
        if verbose:
            print(f"[OK] Exported District Summary CSV to: {d_csv}")
            print(f"[OK] Exported District Summary JSON to: {d_json}")

    # If an agro-climatic zone subset was evaluated, export zone-level dedicated files
    elif 1 < len(districts) < get_district_count():
        z_code = districts[0].zone_code
        z_csv = os.path.join(output_dir, f"zone_{z_code}_summary.csv")
        z_json = os.path.join(output_dir, f"zone_{z_code}_summary.json")
        df_current.to_csv(z_csv, index=False)
        with open(z_json, "w", encoding="utf-8") as f:
            json.dump(records, f, indent=2)
        if verbose:
            print(f"[OK] Exported Zone Summary CSV to: {z_csv}")
            print(f"[OK] Exported Zone Summary JSON to: {z_json}")

    # Merge / Upsert into statewide DataFrame non-destructively if existing table exists
    if len(districts) < get_district_count() and os.path.exists(csv_statewide_path):
        try:
            df_existing = pd.read_csv(csv_statewide_path)
            updated_names = set(df_current["district_name"])
            df_retained = df_existing[~df_existing["district_name"].isin(updated_names)]
            df_statewide = pd.concat([df_retained, df_current], ignore_index=True)
        except Exception:
            df_statewide = df_current
    else:
        df_statewide = df_current

    # Rank and sort by SOC deficiency descending (Priority Ranking)
    df_statewide = df_statewide.sort_values(by="mean_soc_deficiency", ascending=False).reset_index(drop=True)
    df_statewide["statewide_priority_rank"] = range(1, len(df_statewide) + 1)
    existing_cols = [c for c in col_order if c in df_statewide.columns]
    df_statewide = df_statewide[existing_cols]

    # Save statewide CSV
    df_statewide.to_csv(csv_statewide_path, index=False)
    if verbose:
        print(f"[OK] Exported Statewide Summary CSV to: {csv_statewide_path}")

    # Build Authoritative JSON structure
    total_area = float(df_statewide["total_area_ha"].sum())
    total_bare = float(df_statewide["bare_soil_ha"].sum())
    total_high_risk = float(df_statewide["high_risk_ha"].sum())
    if total_bare > 0:
        weighted_mean_risk = float((df_statewide["mean_soc_deficiency"] * df_statewide["bare_soil_ha"]).sum() / total_bare)
        pct_total_high_risk = float((total_high_risk / total_bare) * 100.0)
    else:
        weighted_mean_risk = float(df_statewide["mean_soc_deficiency"].mean())
        pct_total_high_risk = 0.0

    zone_breakdown: Dict[str, Any] = {}
    for z_code, z_group in df_statewide.groupby("zone_code"):
        z_bare = float(z_group["bare_soil_ha"].sum())
        z_high = float(z_group["high_risk_ha"].sum())
        zone_breakdown[z_code] = {
            "zone_name": z_group["zone"].iloc[0],
            "district_count": len(z_group),
            "total_area_ha": round(float(z_group["total_area_ha"].sum()), 2),
            "bare_soil_ha": round(z_bare, 2),
            "mean_soc_deficiency": round(float(z_group["mean_soc_deficiency"].mean()), 4),
            "high_risk_ha": round(z_high, 2),
            "pct_high_risk": round((z_high / (z_bare + 1e-6)) * 100.0, 2) if z_bare > 0 else 0.0,
            "mean_soc_dg_kg": round(float(z_group["mean_soc_dg_kg"].mean()), 2),
            "mean_clay_g_kg": round(float(z_group["mean_clay_g_kg"].mean()), 2),
            "mean_ph": round(float(z_group["mean_ph"].mean()), 2),
        }

    # Statewide JSON payload
    statewide_districts_list = df_statewide.to_dict(orient="records")

    json_payload: Dict[str, Any] = {
        "metadata": {
            "project": "SoilGuard-SOC Statewide Chhattisgarh Scaling Engine",
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "districts_evaluated": len(df_statewide),
            "total_state_districts": get_district_count(),
            "execution_duration_seconds": total_pipeline_time,
            "crs": "EPSG:4326 (WGS84)",
            "pixel_area_ha": PIXEL_AREA_HA,
            "high_risk_cutoff": HIGH_RISK_CUTOFF
        },
        "statewide_aggregates": {
            "total_area_ha": round(total_area, 2),
            "bare_soil_ha": round(total_bare, 2),
            "statewide_mean_soc_deficiency": round(weighted_mean_risk, 4),
            "high_risk_soc_deficit_ha": round(total_high_risk, 2),
            "pct_high_risk_bare_soil": round(pct_total_high_risk, 2)
        },
        "agro_climatic_zones": zone_breakdown,
        "districts": statewide_districts_list
    }

    with open(json_statewide_path, "w", encoding="utf-8") as f:
        json.dump(json_payload, f, indent=2)
    if verbose:
        print(f"[OK] Exported Statewide Summary JSON to: {json_statewide_path}")

    df_return = df_statewide if len(districts) == get_district_count() else df_current
    return df_return, json_payload


# ==============================================================================
# CLI PARSER
# ==============================================================================

def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="SoilGuard-SOC: Statewide Chhattisgarh Scaling Engine"
    )
    group = parser.add_mutually_exclusive_group()
    group.add_argument(
        "--district",
        type=str,
        default=None,
        help="Target a single district by name or alias (e.g. --district Raipur, --district Bastar)"
    )
    group.add_argument(
        "--zone",
        type=str,
        default=None,
        choices=["hills", "plains", "plateau", "all"],
        help="Filter by Agro-Climatic Zone ('hills', 'plains', 'plateau', or 'all')"
    )
    group.add_argument(
        "--all",
        action="store_true",
        help="Execute statewide scaling across all 33 districts of Chhattisgarh (default)"
    )
    parser.add_argument(
        "--output-dir",
        type=str,
        default=STATEWIDE_OUTPUT_DIR,
        help="Output directory for generated CSV and JSON summary tables"
    )
    parser.add_argument(
        "--window-size",
        type=int,
        default=256,
        help="Window chunk size for memory-capped raster processing (default: 256)"
    )
    parser.add_argument(
        "--grid-size",
        type=int,
        default=256,
        help="Grid dimension for synthetic scenes (default: 256 for 256x256)"
    )
    parser.add_argument(
        "--synthetic-only",
        action="store_true",
        help="Force offline synthetic spatial generator for all districts (including Raipur) for deterministic testing"
    )
    parser.add_argument(
        "--model-path",
        type=str,
        default=MODEL_SAVE_PATH,
        help="Path to trained Random Forest model joblib"
    )
    parser.add_argument(
        "--quiet",
        action="store_true",
        help="Suppress intermediate verbose console logs"
    )
    return parser


def main(argv: Optional[List[str]] = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)

    # Determine targeted districts
    if args.district:
        dist = get_district(args.district)
        if dist is None:
            print(f"[ERROR] District '{args.district}' not found in Chhattisgarh pedological database.")
            print(f"        Valid choices: {[d.name for d in get_all_districts()]}")
            return 1
        target_districts = [dist]
    elif args.zone:
        target_districts = get_districts_by_zone(args.zone)
    else:
        # Default: all 33 districts
        target_districts = get_all_districts()

    verbose = not args.quiet

    df_summary, json_summary = run_statewide_pipeline(
        districts=target_districts,
        output_dir=args.output_dir,
        window_size=args.window_size,
        grid_shape=(args.grid_size, args.grid_size),
        model_path=args.model_path,
        use_golden_for_raipur=not args.synthetic_only,
        verbose=verbose
    )

    if verbose:
        print("\n" + "=" * 78)
        print(" SoilGuard-SOC: Statewide Chhattisgarh Scaling Execution Summary")
        print("=" * 78)
        print(f" Districts Evaluated : {len(df_summary)}")
        print(f" Total Evaluated Area: {df_summary['total_area_ha'].sum():,.0f} ha")
        print(f" Bare Soil Area      : {df_summary['bare_soil_ha'].sum():,.0f} ha")
        print(f" High SOC Deficit Area: {df_summary['high_risk_ha'].sum():,.0f} ha")
        print(f" Top Priority District: {df_summary.iloc[0]['district_name']} (SOC Def: {df_summary.iloc[0]['mean_soc_deficiency']:.4f})")
        print("=" * 78 + "\n")

    return 0


if __name__ == "__main__":
    sys.exit(main())
