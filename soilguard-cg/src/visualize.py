"""
SoilGuard-CG: Visualization Module (Phase 2)
Generates publication-quality PNG maps for Sentinel-2 composites, BSI, and NDVI.
"""

import os
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

from config import PHASE2_OUTPUT_DIR
from plot_utils import style_dark_axes, style_dark_colorbar, add_footnote, save_dark_figure

OUTPUT_DIR = PHASE2_OUTPUT_DIR

def apply_percentile_stretch(band, p_min=2, p_max=98):
    """Applies robust 2-98% percentile linear stretch to raster band for RGB display."""
    valid_vals = band[~np.isnan(band) & (band > 0)]
    if len(valid_vals) == 0:
        return np.zeros_like(band, dtype=np.float32)
    v_min, v_max = np.percentile(valid_vals, (p_min, p_max))
    if v_max == v_min:
        return np.zeros_like(band, dtype=np.float32)
    stretched = (band - v_min) / (v_max - v_min)
    return np.clip(stretched, 0, 1)

def plot_false_color_composite(bands, output_dir=OUTPUT_DIR):
    """Generates SWIR1-NIR-Red False Color Composite Map."""
    os.makedirs(output_dir, exist_ok=True)
    out_path = os.path.join(output_dir, "false_color_composite.png")

    r = apply_percentile_stretch(bands['swir1'])
    g = apply_percentile_stretch(bands['nir'])
    b = apply_percentile_stretch(bands['red'])

    rgb = np.dstack((r, g, b))

    fig, ax = plt.subplots(figsize=(10, 9), dpi=300)
    style_dark_axes(ax, fig)

    ax.imshow(rgb)

    ax.set_title("Raipur AOI – SoilGuard-SOC\nFalse-Color Composite (SWIR1 - NIR - Red)",
                 fontsize=15, fontweight='bold', color='white', pad=12)

    add_footnote(ax, "Sentinel-2 L2A (10m) | SWIR1: Red, NIR: Green, Red: Blue")

    return save_dark_figure(fig, out_path, log_message=f"[OK] Saved False-Color Composite Map to: {out_path}")

def plot_bsi_map(bsi, mask, output_dir=OUTPUT_DIR):
    """Generates Bare Soil Index (BSI) Map for candidate bare soil pixels."""
    os.makedirs(output_dir, exist_ok=True)
    out_path = os.path.join(output_dir, "bsi_map.png")

    fig, ax = plt.subplots(figsize=(10, 9), dpi=300)
    style_dark_axes(ax, fig)

    # Display BSI with YlOrBr colormap
    masked_bsi = np.where(mask, bsi, np.nan)
    cmap = plt.cm.YlOrBr.copy()
    cmap.set_bad(color='#1e293b')  # Dark blue-gray for masked non-bare-soil pixels

    vmin, vmax = np.nanpercentile(masked_bsi, 2), np.nanpercentile(masked_bsi, 98)
    im = ax.imshow(masked_bsi, cmap=cmap, vmin=vmin, vmax=vmax)

    style_dark_colorbar(ax, im, 'Bare Soil Index (BSI)')

    ax.set_title("Raipur AOI – SoilGuard-SOC\nBare Soil Index (BSI) Map (Bare Soil Candidates)",
                 fontsize=15, fontweight='bold', color='white', pad=12)

    add_footnote(ax, f"Masked NDVI > 0.30 | Valid Soil Pixels: {np.sum(mask):,} ({np.mean(mask)*100:.1f}%)")

    return save_dark_figure(fig, out_path, log_message=f"[OK] Saved BSI Map to: {out_path}")

def plot_ndvi_map(ndvi, output_dir=OUTPUT_DIR):
    """Generates Full Scene NDVI Map."""
    os.makedirs(output_dir, exist_ok=True)
    out_path = os.path.join(output_dir, "ndvi_map.png")

    fig, ax = plt.subplots(figsize=(10, 9), dpi=300)
    style_dark_axes(ax, fig)

    cmap = plt.cm.YlGn.copy()
    cmap.set_bad(color='#020617')

    im = ax.imshow(ndvi, cmap=cmap, vmin=-0.1, vmax=0.7)

    style_dark_colorbar(ax, im, 'Normalized Difference Vegetation Index (NDVI)')

    ax.set_title("Raipur AOI – SoilGuard-SOC\nNDVI Vegetation Map",
                 fontsize=15, fontweight='bold', color='white', pad=12)

    add_footnote(ax, "Sentinel-2 L2A (10m) | NDVI Threshold for Bare Soil: <= 0.30")

    return save_dark_figure(fig, out_path, log_message=f"[OK] Saved NDVI Map to: {out_path}")
