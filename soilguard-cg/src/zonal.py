"""
SoilGuard-SOC: Zonal Analytics & SOC Deficiency Priority Module (Phase 4)
Partitions the Raipur agricultural belt AOI into 25 spatial sectors (5x5 regular grid),
computes zonal statistics, and ranks sectors by Soil Organic Carbon (SOC) deficiency intervention priority.
"""

import os
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

import rasterio
from rasterio.windows import from_bounds, Window

from config import PHASE4_OUTPUT_DIR, PIXEL_AREA_HA, HIGH_RISK_CUTOFF, GOLDEN_SOIL_PATH
from plot_utils import style_dark_axes, style_dark_colorbar, add_footnote, save_dark_figure

OUTPUT_DIR = PHASE4_OUTPUT_DIR

# Representative agricultural sector grid over Raipur District, Chhattisgarh
SECTOR_NAMES = [
    ["Abhanpur (A-1)", "Abhanpur (A-2)", "Abhanpur (A-3)", "Abhanpur (A-4)", "Abhanpur (A-5)"],
    ["Arang (B-1)", "Arang (B-2)", "Arang (B-3)", "Arang (B-4)", "Arang (B-5)"],
    ["Raipur Rural (C-1)", "Raipur Rural (C-2)", "Raipur Rural (C-3)", "Raipur Rural (C-4)", "Raipur Rural (C-5)"],
    ["Dharsiwa (D-1)", "Dharsiwa (D-2)", "Dharsiwa (D-3)", "Dharsiwa (D-4)", "Dharsiwa (D-5)"],
    ["Tilda (E-1)", "Tilda (E-2)", "Tilda (E-3)", "Tilda (E-4)", "Tilda (E-5)"]
]


def dynamic_window_from_bounds(bounds, transform, height=None, width=None):
    """
    Computes a rasterio Window from geographic bounding box (left, bottom, right, top) and transform.
    Clamps offsets and lengths to raster dimensions if height/width are provided.
    """
    left, bottom, right, top = bounds
    win = from_bounds(left, bottom, right, top, transform=transform).round_offsets().round_lengths()
    row_off = max(0, int(win.row_off))
    col_off = max(0, int(win.col_off))
    win_h = max(1, int(win.height))
    win_w = max(1, int(win.width))
    if height is not None:
        if row_off >= height:
            row_off = max(0, height - 1)
            win_h = 1
        else:
            win_h = max(1, min(win_h, height - row_off))
    if width is not None:
        if col_off >= width:
            col_off = max(0, width - 1)
            win_w = 1
        else:
            win_w = max(1, min(win_w, width - col_off))
    return Window(col_off=col_off, row_off=row_off, width=win_w, height=win_h)


def align_layer_to_target(
    layer,
    target_shape,
    bounds=None,
    source_transform=None,
    target_transform=None,
):
    """
    Aligns a 2D raster layer (or filepath) to strictly match target_shape (H, W).
    If layer is None, returns None.
    If layer.shape == target_shape, returns layer directly.
    If dimensions differ and geographic bounds & transform are available:
      Uses rasterio.windows.from_bounds to dynamically slice the matching geographic window,
      and resamples if necessary to fully cover the target dimensions without NaN padding collapse.
    Ensures the output array strictly matches target_shape without broadcasting crashes.
    """
    if layer is None:
        return None

    # Handle string filepath
    if isinstance(layer, str):
        if not os.path.exists(layer):
            raise FileNotFoundError(f"Layer raster path does not exist: {layer}")
        with rasterio.open(layer) as src:
            if bounds is not None:
                win = dynamic_window_from_bounds(bounds, src.transform, src.height, src.width)
                data = src.read(1, window=win).astype(np.float32)
            else:
                data = src.read(1).astype(np.float32)
            layer = data

    if not isinstance(layer, np.ndarray):
        layer = np.asarray(layer, dtype=np.float32)

    if layer.ndim > 2:
        layer = np.squeeze(layer)

    if layer.shape == target_shape:
        return layer.astype(np.float32)

    target_h, target_w = target_shape

    # If geographic bounds and source transform are known, slice via from_bounds
    if bounds is not None and source_transform is not None:
        win = dynamic_window_from_bounds(bounds, source_transform, layer.shape[0], layer.shape[1])
        r_start = int(win.row_off)
        r_end = r_start + int(win.height)
        c_start = int(win.col_off)
        c_end = c_start + int(win.width)
        sliced = layer[r_start:r_end, c_start:c_end]
    elif bounds is None and target_transform is not None and source_transform is not None:
        bounds = rasterio.transform.array_bounds(target_h, target_w, target_transform)
        win = dynamic_window_from_bounds(bounds, source_transform, layer.shape[0], layer.shape[1])
        r_start = int(win.row_off)
        r_end = r_start + int(win.height)
        c_start = int(win.col_off)
        c_end = c_start + int(win.width)
        sliced = layer[r_start:r_end, c_start:c_end]
    else:
        # Fallback without spatial metadata: slice top-left matching window
        r_end = min(layer.shape[0], target_h)
        c_end = min(layer.shape[1], target_w)
        sliced = layer[:r_end, :c_end]

    if sliced.shape == target_shape:
        return sliced.astype(np.float32)

    # Harmonize exact target_shape using spatial resampling rather than zero-padding
    if sliced.size > 0 and sliced.ndim == 2:
        from scipy import ndimage
        zoom_factors = (target_h / float(sliced.shape[0]), target_w / float(sliced.shape[1]))
        resampled = ndimage.zoom(sliced.astype(np.float32), zoom_factors, order=0)
        if resampled.shape == target_shape:
            return resampled.astype(np.float32)
        aligned = np.full(target_shape, np.nan, dtype=np.float32)
        h_copy = min(target_h, resampled.shape[0])
        w_copy = min(target_w, resampled.shape[1])
        aligned[:h_copy, :w_copy] = resampled[:h_copy, :w_copy]
        return aligned

    aligned = np.full(target_shape, np.nan, dtype=np.float32)
    h_copy = min(target_h, sliced.shape[0])
    w_copy = min(target_w, sliced.shape[1])
    aligned[:h_copy, :w_copy] = sliced[:h_copy, :w_copy]
    return aligned


def compute_zonal_statistics(
    risk_map,
    soc_map=None,
    bsi_map=None,
    ph_map=None,
    clay_map=None,
    grid_size=(5, 5),
    bounds=None,
    transform=None,
    source_transform=None,
):
    """
    Partitions the 2D raster into grid_size[0] x grid_size[1] agricultural sectors
    and computes mean SOC deficiency risk, area, high-risk fraction, clay content, and priority ranking.
    Dynamically slices covariate layers via rasterio.windows.from_bounds when input dimensions
    differ (e.g. 1024x1024 crop vs 2223x2086 full scene), completely preventing broadcasting crashes.
    """
    # If source_transform is not provided, retrieve from GOLDEN_SOIL_PATH if available
    if source_transform is None and os.path.exists(GOLDEN_SOIL_PATH):
        try:
            with rasterio.open(GOLDEN_SOIL_PATH) as _src:
                source_transform = _src.transform
        except Exception:
            pass

    target_shape = risk_map.shape

    # Dynamically align all covariate layers to risk_map dimensions using from_bounds
    soc_aligned = align_layer_to_target(soc_map, target_shape, bounds, source_transform, transform)
    bsi_aligned = align_layer_to_target(bsi_map, target_shape, bounds, source_transform, transform)
    ph_aligned = align_layer_to_target(ph_map, target_shape, bounds, source_transform, transform)
    clay_aligned = align_layer_to_target(clay_map, target_shape, bounds, source_transform, transform)

    height, width = target_shape
    r_step = max(height // grid_size[0], 1)
    c_step = max(width // grid_size[1], 1)

    zonal_rows = []

    for r_idx in range(grid_size[0]):
        for c_idx in range(grid_size[1]):
            r_start = r_idx * r_step
            r_end = (r_idx + 1) * r_step if r_idx < grid_size[0] - 1 else height
            c_start = c_idx * c_step
            c_end = (c_idx + 1) * c_step if c_idx < grid_size[1] - 1 else width

            if r_idx < len(SECTOR_NAMES) and c_idx < len(SECTOR_NAMES[r_idx]):
                sector_name = SECTOR_NAMES[r_idx][c_idx]
            else:
                sector_name = f"Sector ({r_idx+1},{c_idx+1})"

            sub_risk = risk_map[r_start:r_end, c_start:c_end]
            valid_risk = sub_risk[~np.isnan(sub_risk)]

            total_px = sub_risk.size
            bare_px = len(valid_risk)

            if bare_px == 0:
                continue

            sector_area_ha = total_px * PIXEL_AREA_HA
            bare_area_ha = bare_px * PIXEL_AREA_HA

            mean_risk = np.mean(valid_risk)
            max_risk = np.max(valid_risk)
            high_risk_px = np.sum(valid_risk > HIGH_RISK_CUTOFF)
            high_risk_ha = high_risk_px * PIXEL_AREA_HA
            pct_high_risk = (high_risk_px / bare_px) * 100.0

            sub_soc = soc_aligned[r_start:r_end, c_start:c_end] if soc_aligned is not None else None
            sub_bsi = bsi_aligned[r_start:r_end, c_start:c_end] if bsi_aligned is not None else None
            sub_ph = ph_aligned[r_start:r_end, c_start:c_end] if ph_aligned is not None else None
            sub_clay = clay_aligned[r_start:r_end, c_start:c_end] if clay_aligned is not None else None

            valid_soc = sub_soc[~np.isnan(sub_soc)] if sub_soc is not None else []
            valid_bsi = sub_bsi[~np.isnan(sub_bsi)] if sub_bsi is not None else []
            valid_ph = sub_ph[~np.isnan(sub_ph)] if sub_ph is not None else []
            valid_clay = sub_clay[~np.isnan(sub_clay)] if sub_clay is not None else []

            mean_soc = np.mean(valid_soc) if len(valid_soc) > 0 else np.nan
            mean_bsi = np.mean(valid_bsi) if len(valid_bsi) > 0 else np.nan
            mean_ph = np.mean(valid_ph) if len(valid_ph) > 0 else np.nan
            mean_clay = np.mean(valid_clay) if len(valid_clay) > 0 else 240.0

            zonal_rows.append({
                'sector_name': sector_name,
                'grid_row': r_idx,
                'grid_col': c_idx,
                'total_area_ha': round(sector_area_ha, 2),
                'bare_soil_ha': round(bare_area_ha, 2),
                'mean_risk_score': round(float(mean_risk), 4),
                'max_risk_score': round(float(max_risk), 4),
                'high_risk_ha': round(high_risk_ha, 2),
                'pct_high_risk': round(pct_high_risk, 2),
                'mean_soc_dg_kg': round(float(mean_soc), 2) if not np.isnan(mean_soc) else 115.0,
                'mean_bsi': round(float(mean_bsi), 4) if not np.isnan(mean_bsi) else 0.0,
                'mean_ph': round(float(mean_ph), 2) if not np.isnan(mean_ph) else 6.5,
                'mean_clay_g_kg': round(float(mean_clay), 2)
            })

    df_zonal = pd.DataFrame(zonal_rows)
    # Sort by Mean SOC Deficiency Score descending to determine Priority Rank
    df_zonal = df_zonal.sort_values(by='mean_risk_score', ascending=False).reset_index(drop=True)
    df_zonal['priority_rank'] = range(1, len(df_zonal) + 1)

    return df_zonal


def summarize_area_breakdown(df_zonal):
    """
    Computes the audit metrics used by the demo dashboard and the executive report:
    total evaluated soil area (ha), high-deficiency area (ha), and % high risk.
    """
    total_soil_ha = df_zonal['bare_soil_ha'].sum()
    high_risk_ha = df_zonal['high_risk_ha'].sum()
    pct_high_risk = (high_risk_ha / total_soil_ha) * 100.0 if total_soil_ha > 0 else 0.0
    return total_soil_ha, high_risk_ha, pct_high_risk


def plot_zonal_risk_map(risk_map, df_zonal, grid_size=(5, 5), output_dir=OUTPUT_DIR):
    """Generates 2D Zonal SOC Priority Map with Sector Grid Overlays."""
    os.makedirs(output_dir, exist_ok=True)
    out_path = os.path.join(output_dir, "zonal_risk_map.png")

    height, width = risk_map.shape
    r_step = max(height // grid_size[0], 1)
    c_step = max(width // grid_size[1], 1)

    fig, ax = plt.subplots(figsize=(11, 10), dpi=300)
    style_dark_axes(ax, fig)

    cmap = plt.cm.RdYlGn_r.copy()
    cmap.set_bad(color='#1e293b')

    im = ax.imshow(risk_map, cmap=cmap, vmin=0.25, vmax=0.75)

    # Sector Grid Overlay
    for r_idx in range(1, grid_size[0]):
        ax.axhline(r_idx * r_step, color='#38bdf8', linestyle='--', linewidth=1.2, alpha=0.7)
    for c_idx in range(1, grid_size[1]):
        ax.axvline(c_idx * c_step, color='#38bdf8', linestyle='--', linewidth=1.2, alpha=0.7)

    # Annotate Top Priority Sectors
    for _, row in df_zonal.head(8).iterrows():
        r_center = (row['grid_row'] + 0.5) * r_step
        c_center = (row['grid_col'] + 0.5) * c_step
        rank = row['priority_rank']
        name = row['sector_name']
        risk = row['mean_risk_score']

        ax.text(c_center, r_center, f"Rank #{rank}\n{name}\n({risk:.2f})",
                color='white', fontsize=8, fontweight='bold', ha='center', va='center',
                bbox=dict(boxstyle='round,pad=0.35', facecolor='#7f1d1d', edgecolor='#ef4444', alpha=0.88))

    style_dark_colorbar(ax, im, 'Zonal SOC Deficiency Index (0-1)')

    ax.set_title("Raipur AOI – SoilGuard-SOC\nZonal Organic Carbon Priority Map (5x5 Sector Grid)",
                 fontsize=15, fontweight='bold', color='white', pad=12)

    add_footnote(ax, "Note: Sectors represent 5x5 regular analysis grid blocks over Raipur AOI (22km x 22km)")

    return save_dark_figure(fig, out_path, log_message=f"[OK] Saved Zonal SOC Priority Map to: {out_path}")
