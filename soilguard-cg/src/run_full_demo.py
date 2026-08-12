"""
SoilGuard-CG: Single Offline Full Demo Runner (Phase 5 Final Deliverable)
National Space Day Ideathon 2026 – COSINE NIT Raipur + NRSC/ISRO

Executes the complete SoilGuard-CG pipeline 100% offline using golden cached datasets:
1. Spectral Index Computation (NDVI, BSI) & Bare Soil Masking
2. Satellite-Driven Random Forest Soil Health Risk Regressor Training & Inference
3. Zonal Analytics & Priority Sector Ranking (5x5 Grid Overlay)
4. Actionable Agronomic Recommendation Engine
5. Model Uncertainty & Ensemble Confidence Mapping
6. Presentation-Ready Map Rendering & Executive Summary Report Generation

This runner orchestrates the shared phase modules (spectral / visualize / ml_risk /
zonal / recommendations / confidence / report) rather than re-implementing them.
"""

import os
import sys
import time

import numpy as np
from rich.console import Console
from rich.panel import Panel
from rich.text import Text

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))  # make `src/` importable under any invocation

from config import PHASE2_OUTPUT_DIR, PHASE3_OUTPUT_DIR, PHASE4_OUTPUT_DIR, MODEL_SAVE_PATH
from spectral import load_sentinel2_stack, compute_ndvi, compute_bsi, generate_bare_soil_mask
from ml_risk import load_soilgrids_stack, prepare_feature_matrix, train_soil_risk_model, predict_full_risk_map
from visualize import plot_false_color_composite, plot_bsi_map, plot_ndvi_map
from run_phase3 import plot_risk_score_map, plot_risk_histogram
from zonal import compute_zonal_statistics, plot_zonal_risk_map, summarize_area_breakdown
from recommendations import generate_sector_recommendations
from confidence import compute_ensemble_uncertainty, plot_confidence_map
from report import generate_executive_report
from tables import feature_importance_table, priority_sectors_table

console = Console()


def run_full_demo():
    start_time = time.time()
    console.clear()

    # Title Banner
    banner = Text()
    banner.append("SoilGuard-SOC ", style="bold lime")
    banner.append("| Chhattisgarh Soil Carbon Sentinel v1.0\n", style="bold white")
    banner.append("National Space Day Ideathon 2026 – COSINE NIT Raipur + NRSC/ISRO\n", style="cyan")
    banner.append("Target Region: Raipur/Durg Agricultural Belt, Chhattisgarh (100% Offline Cache)", style="italic yellow")

    console.print(Panel(banner, border_style="green", expand=False))

    # 1. Load Golden Datasets (Offline)
    console.print("\n[bold yellow][Step 1/5] Loading Cached Golden Datasets (100% Offline)...[/bold yellow]")
    s2_bands, s2_prof = load_sentinel2_stack()
    soil_bands = load_soilgrids_stack()

    console.print(f"  • Sentinel-2 L2A Stack : {s2_prof['width']} x {s2_prof['height']} pixels ({s2_prof['crs']})")
    console.print(f"  • SoilGrids Stack      : SOC, Clay, pH aligned to 10m grid")

    # 2. Spectral Calculations & Masking
    console.print("\n[bold yellow][Step 2/5] Computing Spectral Indices (NDVI, BSI) & Bare Soil Mask...[/bold yellow]")
    ndvi = compute_ndvi(s2_bands['nir'], s2_bands['red'])
    bsi = compute_bsi(s2_bands['swir1'], s2_bands['red'], s2_bands['nir'], s2_bands['blue'])
    mask, masked_bsi, masked_ndvi = generate_bare_soil_mask(ndvi, s2_bands['nir'], bsi)

    total_px = mask.size
    bare_px = np.sum(mask)
    pct_bare = (bare_px / total_px) * 100.0
    console.print(f"  • Bare Soil Candidate Pixels: {bare_px:,} / {total_px:,} ({pct_bare:.2f}%)")

    # Render Phase 2 Maps
    plot_false_color_composite(s2_bands, output_dir=PHASE2_OUTPUT_DIR)
    plot_bsi_map(bsi, mask, output_dir=PHASE2_OUTPUT_DIR)
    plot_ndvi_map(ndvi, output_dir=PHASE2_OUTPUT_DIR)

    # 3. Train & Predict Satellite ML Risk Model
    console.print("\n[bold yellow][Step 3/5] Training Satellite-Driven RF SOC Model...[/bold yellow]")
    # Reuse the already-computed spectral layers (no duplicate raster I/O / index math)
    df_features, y_target, metadata = prepare_feature_matrix(
        s2_bands=s2_bands, soil_bands=soil_bands, profile=s2_prof,
        ndvi=ndvi, bsi=bsi, mask=mask,
    )

    rf, metrics = train_soil_risk_model(df_features, y_target, sample_size=100000, model_save_path=MODEL_SAVE_PATH)
    risk_map = predict_full_risk_map(rf, df_features, metadata)

    valid_risk = risk_map[~np.isnan(risk_map)]

    # Feature Importance Breakdown
    console.print(feature_importance_table(rf, df_features,
                                           title="Random Forest Feature Importances (100% Satellite Spectral Driven)"))

    # Render Phase 3 Maps & Stats
    plot_risk_score_map(risk_map, output_dir=PHASE3_OUTPUT_DIR)
    plot_risk_histogram(valid_risk, output_dir=PHASE3_OUTPUT_DIR)

    # 4. Zonal Analytics & Agronomic Recommendations
    console.print("\n[bold yellow][Step 4/5] Computing Zonal Priority Ranking & Regenerative Packages...[/bold yellow]")
    df_zonal = compute_zonal_statistics(
        risk_map=risk_map,
        soc_map=soil_bands['soc'],
        bsi_map=bsi,
        ph_map=soil_bands['ph'],
        clay_map=soil_bands['clay'],
        grid_size=(5, 5)
    )

    df_rec = generate_sector_recommendations(df_zonal)

    zonal_csv_path = os.path.join(PHASE4_OUTPUT_DIR, "zonal_priority_ranking.csv")
    rec_csv_path = os.path.join(PHASE4_OUTPUT_DIR, "agronomic_recommendations.csv")

    df_zonal.to_csv(zonal_csv_path, index=False)
    df_rec.to_csv(rec_csv_path, index=False)

    # Priority Sectors Table
    console.print(priority_sectors_table(df_zonal))

    # Render Phase 4 Maps
    uncertainty_map = compute_ensemble_uncertainty(rf, df_features, metadata, n_sample_trees=30)
    conf_map_path = plot_confidence_map(uncertainty_map, output_dir=PHASE4_OUTPUT_DIR)
    zonal_map_path = plot_zonal_risk_map(risk_map, df_zonal, grid_size=(5, 5), output_dir=PHASE4_OUTPUT_DIR)

    # 5. Executive Summary Report
    console.print("\n[bold yellow][Step 5/5] Generating Presentation-Ready Executive Summary Report...[/bold yellow]")
    report_path = generate_executive_report(df_zonal, df_rec, metrics, output_dir=PHASE4_OUTPUT_DIR)

    elapsed = time.time() - start_time

    total_soil_ha, high_risk_ha, pct_high_risk = summarize_area_breakdown(df_zonal)
    top_3_sectors = ", ".join([f"#{r['priority_rank']} {r['sector_name']}" for _, r in df_zonal.head(3).iterrows()])

    # Final Judge Dashboard Summary Panel
    dashboard_text = f"""[bold green][SUCCESS] SoilGuard-SOC Pipeline Executed in {elapsed:.2f} seconds![/bold green]

[bold yellow]--- KEY AUDIT METRICS ---[/bold yellow]
• [bold white]Total Evaluated Area[/bold white]       : [cyan]{total_soil_ha:,.2f} ha[/cyan]
• [bold white]High SOC Deficiency Area[/bold white]   : [bold red]{high_risk_ha:,.2f} ha ({pct_high_risk:.1f}%)[/bold red]
• [bold white]Top 3 Priority Sectors[/bold white]     : [magenta]{top_3_sectors}[/magenta]
• [bold white]Model Test Accuracy[/bold white]        : [green]R² = {metrics['r2']:.4f} | RMSE = {metrics['rmse']:.4f}[/green]

[bold cyan]--- GENERATED PRESENTATION ARTIFACTS ---[/bold cyan]
1. [bold white]SOC Deficiency Score Map[/bold white]   : outputs/phase3/risk_score_map.png
2. [bold white]Zonal SOC Priority Map[/bold white]    : outputs/phase4/zonal_risk_map.png
3. [bold white]Model Confidence Map[/bold white]       : outputs/phase4/model_confidence_map.png
4. [bold white]Bare Soil Index (BSI) Map[/bold white]   : outputs/phase2/bsi_map.png
5. [bold white]Zonal Priority CSV[/bold white]         : outputs/phase4/zonal_priority_ranking.csv
6. [bold white]Actionable Package CSV[/bold white]     : outputs/phase4/agronomic_recommendations.csv
7. [bold white]Executive Summary Report[/bold white]   : outputs/phase4/SoilGuard_SOC_Executive_Summary.md

[bold yellow]NATIONAL SPACE DAY IDEATHON 2026 -- READY FOR LIVE DEMONSTRATION[/bold yellow]"""

    console.print(Panel(dashboard_text, title="SoilGuard-SOC Executive Terminal Summary", border_style="cyan"))


if __name__ == "__main__":
    run_full_demo()
