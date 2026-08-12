"""
SoilGuard-SOC: Phase 3 Pipeline Runner
Trains Random Forest Soil Organic Carbon (SOC) Deficiency Model, generates SOC deficiency maps,
histograms, saves summary statistics CSV, and prints rich terminal analysis.
"""

import os
import sys

import numpy as np
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from rich.console import Console
from rich.table import Table
from rich.panel import Panel

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))  # make `src/` importable under any invocation

from config import (
    PHASE3_OUTPUT_DIR,
    MODEL_SAVE_PATH,
    PIXEL_AREA_HA,
    LOW_RISK_CUTOFF,
    HIGH_RISK_CUTOFF,
)
from ml_risk import prepare_feature_matrix, train_soil_risk_model, predict_full_risk_map
from plot_utils import style_dark_axes, style_dark_colorbar, add_footnote, save_dark_figure
from tables import feature_importance_table

console = Console()
OUTPUT_DIR = PHASE3_OUTPUT_DIR


def plot_risk_score_map(risk_map, output_dir=OUTPUT_DIR):
    """Generates high-resolution Soil Organic Carbon (SOC) Deficiency Map."""
    os.makedirs(output_dir, exist_ok=True)
    out_path = os.path.join(output_dir, "risk_score_map.png")

    fig, ax = plt.subplots(figsize=(10, 9), dpi=300)
    style_dark_axes(ax, fig)

    # RdYlGn_r: Red = High SOC Deficiency, Yellow = Moderate, Green = Low Deficiency
    cmap = plt.cm.RdYlGn_r.copy()
    cmap.set_bad(color='#1e293b')  # Dark blue-gray for masked non-bare-soil pixels

    im = ax.imshow(risk_map, cmap=cmap, vmin=0.25, vmax=0.75)

    style_dark_colorbar(ax, im, 'SOC Deficiency Index (0.0: High Carbon → 1.0: Severe Deficiency)')

    ax.set_title("Raipur AOI – SoilGuard-SOC\nSoil Organic Carbon (SOC) Deficiency Index Map",
                 fontsize=15, fontweight='bold', color='white', pad=12)

    valid_risk = risk_map[~np.isnan(risk_map)]
    mean_risk = np.mean(valid_risk) if len(valid_risk) > 0 else 0
    high_risk_pct = (np.sum(valid_risk > HIGH_RISK_CUTOFF) / len(valid_risk)) * 100.0 if len(valid_risk) > 0 else 0

    add_footnote(ax, f"Satellite RF SOC Model | Mean SOC Def: {mean_risk:.3f} | High Def Area (>{HIGH_RISK_CUTOFF}): {high_risk_pct:.1f}%")

    return save_dark_figure(fig, out_path, log_message=f"[OK] Saved SOC Deficiency Index Map to: {out_path}")


def plot_risk_histogram(valid_risk, output_dir=OUTPUT_DIR):
    """Generates Soil Organic Carbon (SOC) Deficiency distribution histogram."""
    os.makedirs(output_dir, exist_ok=True)
    out_path = os.path.join(output_dir, "risk_histogram.png")

    fig, ax = plt.subplots(figsize=(8, 5), dpi=300)
    style_dark_axes(ax, fig)

    # Histogram with color-coded risk bands
    n, bins, patches = ax.hist(valid_risk, bins=50, edgecolor='#0f172a', alpha=0.9)

    for i in range(len(patches)):
        b_center = (bins[i] + bins[i + 1]) / 2.0
        if b_center < LOW_RISK_CUTOFF:
            patches[i].set_facecolor('#22c55e')  # Green (Low Risk)
        elif b_center < HIGH_RISK_CUTOFF:
            patches[i].set_facecolor('#eab308')  # Yellow (Moderate Risk)
        else:
            patches[i].set_facecolor('#ef4444')  # Red (High Risk)

    ax.axvline(LOW_RISK_CUTOFF, color='#eab308', linestyle='--', linewidth=1.5,
               label=f'Moderate Cutoff ({LOW_RISK_CUTOFF})')
    ax.axvline(HIGH_RISK_CUTOFF, color='#ef4444', linestyle='--', linewidth=1.5,
               label=f'High Risk Cutoff ({HIGH_RISK_CUTOFF})')

    ax.set_title("Raipur AOI – Re-calibrated Soil Health Risk Score Distribution",
                 fontsize=13, fontweight='bold', color='white', pad=10)
    ax.set_xlabel("Soil Health Risk Score", color='white', fontsize=10)
    ax.set_ylabel("Pixel Count", color='white', fontsize=10)

    legend = ax.legend(facecolor='#1e293b', edgecolor='#475569', fontsize=9)
    plt.setp(legend.get_texts(), color='white')

    return save_dark_figure(fig, out_path, log_message=f"[OK] Saved Risk Histogram to: {out_path}")


def run_phase3():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    console.print("\n[bold cyan]=== SoilGuard-CG: Phase 3 - ML Soil Health Risk Model Pipeline ===[/bold cyan]\n")

    # 1. Prepare Feature Matrix & Target Proxy
    console.print("[bold yellow][1/4] Preparing feature matrix and target proxy from Golden layers...[/bold yellow]")
    df_features, y, metadata = prepare_feature_matrix()
    console.print(f"  • Feature Matrix: {df_features.shape[0]:,} samples x {df_features.shape[1]} features")

    # 2. Train Random Forest Model
    console.print("\n[bold yellow][2/4] Training Random Forest Regressor model...[/bold yellow]")
    rf, metrics = train_soil_risk_model(df_features, y, sample_size=100000, model_save_path=MODEL_SAVE_PATH)

    # Feature Importance Breakdown
    console.print(feature_importance_table(rf, df_features))

    # 3. Predict Full Risk Map
    console.print("\n[bold yellow][3/4] Reconstructing 2D Soil Health Risk Map...[/bold yellow]")
    risk_map = predict_full_risk_map(rf, df_features, metadata)

    valid_risk = risk_map[~np.isnan(risk_map)]
    total_pixels = metadata['shape'][0] * metadata['shape'][1]
    bare_pixels = len(valid_risk)

    # Spatial Area Calculations
    total_aoi_ha = total_pixels * PIXEL_AREA_HA
    bare_soil_ha = bare_pixels * PIXEL_AREA_HA

    low_risk_ha = np.sum(valid_risk < LOW_RISK_CUTOFF) * PIXEL_AREA_HA
    mod_risk_ha = np.sum((valid_risk >= LOW_RISK_CUTOFF) & (valid_risk <= HIGH_RISK_CUTOFF)) * PIXEL_AREA_HA
    high_risk_ha = np.sum(valid_risk > HIGH_RISK_CUTOFF) * PIXEL_AREA_HA

    # 4. Save Summary Statistics CSV
    stats_data = [
        {'Metric': 'Total AOI Area (ha)', 'Value': round(total_aoi_ha, 2)},
        {'Metric': 'Bare Soil Area (ha)', 'Value': round(bare_soil_ha, 2)},
        {'Metric': 'Bare Soil Area (%)', 'Value': round((bare_soil_ha / total_aoi_ha) * 100, 2)},
        {'Metric': f'Low Risk Area (<{LOW_RISK_CUTOFF}, ha)', 'Value': round(low_risk_ha, 2)},
        {'Metric': 'Low Risk Area (%)', 'Value': round((low_risk_ha / bare_soil_ha) * 100, 2)},
        {'Metric': f'Moderate Risk Area ({LOW_RISK_CUTOFF}-{HIGH_RISK_CUTOFF}, ha)', 'Value': round(mod_risk_ha, 2)},
        {'Metric': 'Moderate Risk Area (%)', 'Value': round((mod_risk_ha / bare_soil_ha) * 100, 2)},
        {'Metric': f'High Risk Area (>{HIGH_RISK_CUTOFF}, ha)', 'Value': round(high_risk_ha, 2)},
        {'Metric': 'High Risk Area (%)', 'Value': round((high_risk_ha / bare_soil_ha) * 100, 2)},
        {'Metric': 'Mean Risk Score', 'Value': round(float(np.mean(valid_risk)), 4)},
        {'Metric': 'Median Risk Score', 'Value': round(float(np.median(valid_risk)), 4)},
        {'Metric': 'Std Dev Risk Score', 'Value': round(float(np.std(valid_risk)), 4)},
        {'Metric': 'Model Test R2 Score', 'Value': round(metrics['r2'], 4)},
        {'Metric': 'Model Test RMSE', 'Value': round(metrics['rmse'], 4)}
    ]
    df_stats = pd.DataFrame(stats_data)
    csv_path = os.path.join(OUTPUT_DIR, "risk_summary_stats.csv")
    df_stats.to_csv(csv_path, index=False)
    console.print(f"\n[OK] Saved Summary Statistics CSV to: {csv_path}")

    # Summary Table Display
    table_summary = Table(title="Phase 3 & 5: Re-calibrated Soil Health Risk Area Breakdown", border_style="cyan")
    table_summary.add_column("Risk Category", style="bold white")
    table_summary.add_column("Area (Hectares)", justify="right", style="bold yellow")
    table_summary.add_column("Percentage of Soil Area", justify="right", style="bold green")

    table_summary.add_row(f"Low Risk (< {LOW_RISK_CUTOFF})", f"{low_risk_ha:,.2f} ha", f"{(low_risk_ha / bare_soil_ha) * 100:.2f}%")
    table_summary.add_row(f"Moderate Risk ({LOW_RISK_CUTOFF} - {HIGH_RISK_CUTOFF})", f"{mod_risk_ha:,.2f} ha", f"{(mod_risk_ha / bare_soil_ha) * 100:.2f}%")
    table_summary.add_row(f"High Risk (> {HIGH_RISK_CUTOFF})", f"{high_risk_ha:,.2f} ha", f"{(high_risk_ha / bare_soil_ha) * 100:.2f}%")
    table_summary.add_section()
    table_summary.add_row("Total Evaluated Soil Area", f"{bare_soil_ha:,.2f} ha", "100.00%")

    console.print(table_summary)

    # 5. Generate Outputs
    console.print("\n[bold yellow][4/4] Generating Risk Map and Histogram PNG outputs...[/bold yellow]")
    map_path = plot_risk_score_map(risk_map, output_dir=OUTPUT_DIR)
    hist_path = plot_risk_histogram(valid_risk, output_dir=OUTPUT_DIR)

    console.print(Panel.fit(
        f"[bold green][OK] Phase 3 Re-calibrated Execution Completed![/bold green]\n"
        f"• Trained RF Model File : {MODEL_SAVE_PATH}\n"
        f"• Risk Score Map PNG    : {map_path}\n"
        f"• Risk Histogram PNG    : {hist_path}\n"
        f"• Summary Stats CSV     : {csv_path}",
        title="SoilGuard-CG Phase 3 Polish Output", border_style="green"
    ))


if __name__ == "__main__":
    run_phase3()
