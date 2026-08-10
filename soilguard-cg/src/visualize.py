"""
SoilGuard-CG: Visualization Module (Phase 2)
Generates publication-quality PNG maps for Sentinel-2 composites, BSI, and NDVI.
"""

import os
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.colors import Normalize

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
OUTPUT_DIR = os.path.join(PROJECT_ROOT, "outputs", "phase2")

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
    fig.patch.set_facecolor('#0f172a')
    ax.set_facecolor('#0f172a')

    im = ax.imshow(rgb)

    ax.set_title("Raipur AOI – SoilGuard-SOC\nFalse-Color Composite (SWIR1 - NIR - Red)",
                 fontsize=15, fontweight='bold', color='white', pad=12)
    ax.tick_params(colors='white', labelsize=9)
    for spine in ax.spines.values():
        spine.set_color('#334155')

    # Subtitle / metadata annotation
    ax.text(0.02, 0.02, "Sentinel-2 L2A (10m) | SWIR1: Red, NIR: Green, Red: Blue",
            transform=ax.transAxes, color='#94a3b8', fontsize=9,
            bbox=dict(boxstyle='round,pad=0.4', facecolor='#1e293b', edgecolor='#475569', alpha=0.8))

    plt.tight_layout()
    plt.savefig(out_path, dpi=300, facecolor=fig.get_facecolor(), bbox_inches='tight')
    plt.close()

    print(f"[OK] Saved False-Color Composite Map to: {out_path}")
    return out_path

def plot_bsi_map(bsi, mask, output_dir=OUTPUT_DIR):
    """Generates Bare Soil Index (BSI) Map for candidate bare soil pixels."""
    os.makedirs(output_dir, exist_ok=True)
    out_path = os.path.join(output_dir, "bsi_map.png")

    fig, ax = plt.subplots(figsize=(10, 9), dpi=300)
    fig.patch.set_facecolor('#0f172a')
    ax.set_facecolor('#0f172a')

    # Display BSI with YlOrBr colormap
    masked_bsi = np.where(mask, bsi, np.nan)
    cmap = plt.cm.YlOrBr.copy()
    cmap.set_bad(color='#1e293b')  # Dark blue-gray for masked non-bare-soil pixels

    vmin, vmax = np.nanpercentile(masked_bsi, 2), np.nanpercentile(masked_bsi, 98)
    im = ax.imshow(masked_bsi, cmap=cmap, vmin=vmin, vmax=vmax)

    cbar = plt.colorbar(im, ax=ax, fraction=0.046, pad=0.04)
    cbar.set_label('Bare Soil Index (BSI)', color='white', fontsize=11, labelpad=10)
    cbar.ax.yaxis.set_tick_params(color='white')
    plt.setp(plt.getp(cbar.ax, 'yticklabels'), color='white')

    ax.set_title("Raipur AOI – SoilGuard-SOC\nBare Soil Index (BSI) Map (Bare Soil Candidates)",
                 fontsize=15, fontweight='bold', color='white', pad=12)
    ax.tick_params(colors='white', labelsize=9)
    for spine in ax.spines.values():
        spine.set_color('#334155')

    ax.text(0.02, 0.02, f"Masked NDVI > 0.30 | Valid Soil Pixels: {np.sum(mask):,} ({np.mean(mask)*100:.1f}%)",
            transform=ax.transAxes, color='#94a3b8', fontsize=9,
            bbox=dict(boxstyle='round,pad=0.4', facecolor='#1e293b', edgecolor='#475569', alpha=0.8))

    plt.tight_layout()
    plt.savefig(out_path, dpi=300, facecolor=fig.get_facecolor(), bbox_inches='tight')
    plt.close()

    print(f"[OK] Saved BSI Map to: {out_path}")
    return out_path

def plot_ndvi_map(ndvi, output_dir=OUTPUT_DIR):
    """Generates Full Scene NDVI Map."""
    os.makedirs(output_dir, exist_ok=True)
    out_path = os.path.join(output_dir, "ndvi_map.png")

    fig, ax = plt.subplots(figsize=(10, 9), dpi=300)
    fig.patch.set_facecolor('#0f172a')
    ax.set_facecolor('#0f172a')

    cmap = plt.cm.YlGn.copy()
    cmap.set_bad(color='#020617')

    im = ax.imshow(ndvi, cmap=cmap, vmin=-0.1, vmax=0.7)

    cbar = plt.colorbar(im, ax=ax, fraction=0.046, pad=0.04)
    cbar.set_label('Normalized Difference Vegetation Index (NDVI)', color='white', fontsize=11, labelpad=10)
    cbar.ax.yaxis.set_tick_params(color='white')
    plt.setp(plt.getp(cbar.ax, 'yticklabels'), color='white')

    ax.set_title("Raipur AOI – SoilGuard-SOC\nNDVI Vegetation Map",
                 fontsize=15, fontweight='bold', color='white', pad=12)
    ax.tick_params(colors='white', labelsize=9)
    for spine in ax.spines.values():
        spine.set_color('#334155')

    ax.text(0.02, 0.02, f"Sentinel-2 L2A (10m) | NDVI Threshold for Bare Soil: <= 0.30",
            transform=ax.transAxes, color='#94a3b8', fontsize=9,
            bbox=dict(boxstyle='round,pad=0.4', facecolor='#1e293b', edgecolor='#475569', alpha=0.8))

    plt.tight_layout()
    plt.savefig(out_path, dpi=300, facecolor=fig.get_facecolor(), bbox_inches='tight')
    plt.close()

    print(f"[OK] Saved NDVI Map to: {out_path}")
    return out_path
