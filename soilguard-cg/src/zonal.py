"""
SoilGuard-SOC: Zonal Analytics & SOC Deficiency Priority Module (Phase 4)
Partitions the Raipur agricultural belt AOI into 25 spatial sectors (5x5 regular grid),
computes zonal statistics, and ranks sectors by Soil Organic Carbon (SOC) deficiency intervention priority.
"""

import os
import sys
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
if PROJECT_ROOT not in sys.path:
    sys.path.append(PROJECT_ROOT)

OUTPUT_DIR = os.path.join(PROJECT_ROOT, "outputs", "phase4")

# Representative agricultural sector grid over Raipur District, Chhattisgarh
SECTOR_NAMES = [
    ["Abhanpur (A-1)", "Abhanpur (A-2)", "Abhanpur (A-3)", "Abhanpur (A-4)", "Abhanpur (A-5)"],
    ["Arang (B-1)", "Arang (B-2)", "Arang (B-3)", "Arang (B-4)", "Arang (B-5)"],
    ["Raipur Rural (C-1)", "Raipur Rural (C-2)", "Raipur Rural (C-3)", "Raipur Rural (C-4)", "Raipur Rural (C-5)"],
    ["Dharsiwa (D-1)", "Dharsiwa (D-2)", "Dharsiwa (D-3)", "Dharsiwa (D-4)", "Dharsiwa (D-5)"],
    ["Tilda (E-1)", "Tilda (E-2)", "Tilda (E-3)", "Tilda (E-4)", "Tilda (E-5)"]
]

# Re-calibrated SOC Deficiency Thresholds
LOW_RISK_CUTOFF = 0.45
HIGH_RISK_CUTOFF = 0.58

def compute_zonal_statistics(risk_map, soc_map, bsi_map, ph_map, clay_map=None, grid_size=(5, 5)):
    """
    Partitions the 2D raster into grid_size[0] x grid_size[1] agricultural sectors
    and computes mean SOC deficiency risk, area, high-risk fraction, clay content, and priority ranking.
    """
    height, width = risk_map.shape
    r_step = height // grid_size[0]
    c_step = width // grid_size[1]

    zonal_rows = []

    for r_idx in range(grid_size[0]):
        for c_idx in range(grid_size[1]):
            r_start = r_idx * r_step
            r_end = (r_idx + 1) * r_step if r_idx < grid_size[0] - 1 else height
            c_start = c_idx * c_step
            c_end = (c_idx + 1) * c_step if c_idx < grid_size[1] - 1 else width

            sector_name = SECTOR_NAMES[r_idx][c_idx]

            sub_risk = risk_map[r_start:r_end, c_start:c_end]
            sub_soc = soc_map[r_start:r_end, c_start:c_end]
            sub_bsi = bsi_map[r_start:r_end, c_start:c_end]
            sub_ph = ph_map[r_start:r_end, c_start:c_end]
            sub_clay = clay_map[r_start:r_end, c_start:c_end] if clay_map is not None else None

            valid_risk = sub_risk[~np.isnan(sub_risk)]

            total_px = sub_risk.size
            bare_px = len(valid_risk)

            if bare_px == 0:
                continue

            pixel_area_ha = 0.01  # 10m x 10m = 100 m^2 = 0.01 ha
            sector_area_ha = total_px * pixel_area_ha
            bare_area_ha = bare_px * pixel_area_ha

            mean_risk = np.mean(valid_risk)
            max_risk = np.max(valid_risk)
            high_risk_px = np.sum(valid_risk > HIGH_RISK_CUTOFF)
            high_risk_ha = high_risk_px * pixel_area_ha
            pct_high_risk = (high_risk_px / bare_px) * 100.0

            valid_soc = sub_soc[~np.isnan(sub_soc)]
            valid_bsi = sub_bsi[~np.isnan(sub_bsi)]
            valid_ph = sub_ph[~np.isnan(sub_ph)]
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
                'mean_soc_dg_kg': round(float(mean_soc), 2),
                'mean_bsi': round(float(mean_bsi), 4),
                'mean_ph': round(float(mean_ph), 2),
                'mean_clay_g_kg': round(float(mean_clay), 2)
            })

    df_zonal = pd.DataFrame(zonal_rows)
    # Sort by Mean SOC Deficiency Score descending to determine Priority Rank
    df_zonal = df_zonal.sort_values(by='mean_risk_score', ascending=False).reset_index(drop=True)
    df_zonal['priority_rank'] = range(1, len(df_zonal) + 1)

    return df_zonal

def plot_zonal_risk_map(risk_map, df_zonal, grid_size=(5, 5), output_dir=OUTPUT_DIR):
    """Generates 2D Zonal SOC Priority Map with Sector Grid Overlays."""
    os.makedirs(output_dir, exist_ok=True)
    out_path = os.path.join(output_dir, "zonal_risk_map.png")

    height, width = risk_map.shape
    r_step = height // grid_size[0]
    c_step = width // grid_size[1]

    fig, ax = plt.subplots(figsize=(11, 10), dpi=300)
    fig.patch.set_facecolor('#0f172a')
    ax.set_facecolor('#0f172a')

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

    cbar = plt.colorbar(im, ax=ax, fraction=0.046, pad=0.04)
    cbar.set_label('Zonal SOC Deficiency Index (0-1)', color='white', fontsize=11, labelpad=10)
    cbar.ax.yaxis.set_tick_params(color='white')
    plt.setp(plt.getp(cbar.ax, 'yticklabels'), color='white')

    ax.set_title("Raipur AOI – SoilGuard-SOC\nZonal Organic Carbon Priority Map (5x5 Sector Grid)",
                 fontsize=15, fontweight='bold', color='white', pad=12)
    ax.tick_params(colors='white', labelsize=9)
    for spine in ax.spines.values():
        spine.set_color('#334155')

    ax.text(0.02, 0.02, "Note: Sectors represent 5x5 regular analysis grid blocks over Raipur AOI (22km x 22km)",
            transform=ax.transAxes, color='#94a3b8', fontsize=8.5,
            bbox=dict(boxstyle='round,pad=0.4', facecolor='#1e293b', edgecolor='#475569', alpha=0.85))

    plt.tight_layout()
    plt.savefig(out_path, dpi=300, facecolor=fig.get_facecolor(), bbox_inches='tight')
    plt.close()

    print(f"[OK] Saved Zonal SOC Priority Map to: {out_path}")
    return out_path

