"""
SoilGuard-CG: Spectral Index Computation & Bare Soil Masking Module
Computes NDVI, Bare Soil Index (BSI), and applies soil-selective masking.
"""

import os

import rasterio
import numpy as np

from config import GOLDEN_S2_PATH

def load_sentinel2_stack(filepath=GOLDEN_S2_PATH):
    """
    Loads 4-band Sentinel-2 stack:
    Band 1: B02 (Blue)
    Band 2: B04 (Red)
    Band 3: B08 (NIR)
    Band 4: B11 (SWIR1)
    Returns dictionary of float32 arrays and raster profile.
    """
    if not os.path.exists(filepath):
        raise FileNotFoundError(f"Golden Sentinel-2 raster not found at: {filepath}")

    with rasterio.open(filepath) as src:
        profile = src.profile
        b02 = src.read(1).astype(np.float32)
        b04 = src.read(2).astype(np.float32)
        b08 = src.read(3).astype(np.float32)
        b11 = src.read(4).astype(np.float32)

    bands = {
        'blue': b02,
        'red': b04,
        'nir': b08,
        'swir1': b11
    }
    return bands, profile

def compute_ndvi(nir, red):
    """
    Computes Normalized Difference Vegetation Index:
    NDVI = (NIR - Red) / (NIR + Red)
    """
    denom = nir + red
    with np.errstate(divide='ignore', invalid='ignore'):
        ndvi = np.where(denom > 0, (nir - red) / denom, np.nan)
    return ndvi.astype(np.float32)

def compute_bsi(swir1, red, nir, blue):
    """
    Computes Bare Soil Index:
    BSI = ((SWIR1 + Red) - (NIR + Blue)) / ((SWIR1 + Red) + (NIR + Blue))
    """
    num = (swir1 + red) - (nir + blue)
    denom = (swir1 + red) + (nir + blue)
    with np.errstate(divide='ignore', invalid='ignore'):
        bsi = np.where(denom > 0, num / denom, np.nan)
    return bsi.astype(np.float32)

def generate_bare_soil_mask(ndvi, nir, bsi, ndvi_threshold=0.30, min_nir_reflectance=300.0):
    """
    Generates a boolean mask identifying candidate bare soil / sparse vegetation pixels.
    Criteria:
    - NDVI <= ndvi_threshold (excludes dense green vegetation)
    - NIR >= min_nir_reflectance (excludes water bodies & deep shadow/dark noise)
    - Valid non-NaN values for both NDVI and BSI
    Returns:
    - bare_soil_mask (bool array: True where candidate bare soil)
    - masked_bsi (array with NaN outside bare soil)
    - masked_ndvi (array with NaN outside bare soil)
    """
    valid_data = ~np.isnan(ndvi) & ~np.isnan(bsi)
    not_dense_veg = (ndvi <= ndvi_threshold)
    not_water = (nir >= min_nir_reflectance) & (ndvi >= -0.20)

    bare_soil_mask = valid_data & not_dense_veg & not_water

    masked_bsi = np.where(bare_soil_mask, bsi, np.nan)
    masked_ndvi = np.where(bare_soil_mask, ndvi, np.nan)

    return bare_soil_mask, masked_bsi, masked_ndvi

if __name__ == "__main__":
    bands, prof = load_sentinel2_stack()
    ndvi = compute_ndvi(bands['nir'], bands['red'])
    bsi = compute_bsi(bands['swir1'], bands['red'], bands['nir'], bands['blue'])
    mask, masked_bsi, masked_ndvi = generate_bare_soil_mask(ndvi, bands['nir'], bsi)

    total_px = mask.size
    bare_px = np.sum(mask)
    pct_bare = (bare_px / total_px) * 100.0

    print(f"NDVI shape: {ndvi.shape}, range: [{np.nanmin(ndvi):.3f}, {np.nanmax(ndvi):.3f}]")
    print(f"BSI shape: {bsi.shape}, range: [{np.nanmin(bsi):.3f}, {np.nanmax(bsi):.3f}]")
    print(f"Bare soil candidate pixels: {bare_px} / {total_px} ({pct_bare:.2f}%)")
