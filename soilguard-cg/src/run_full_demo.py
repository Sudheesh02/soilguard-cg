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
"""

import os
import sys
import time
import numpy as np
import pandas as pd
import joblib
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.layout import Layout
from rich.text import Text

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
if PROJECT_ROOT not in sys.path:
    sys.path.append(PROJECT_ROOT)

from src.spectral import load_sentinel2_stack, compute_ndvi, compute_bsi, generate_bare_soil_mask
from src.visualize import plot_false_color_composite, plot_bsi_map, plot_ndvi_map
from src.ml_risk import load_soilgrids_stack, prepare_feature_matrix, train_soil_risk_model, predict_full_risk_map, MODEL_SAVE_PATH
from src.zonal import compute_zonal_statistics, plot_zonal_risk_map, LOW_RISK_CUTOFF, HIGH_RISK_CUTOFF
from src.recommendations import generate_sector_recommendations
from src.confidence import compute_ensemble_uncertainty, plot_confidence_map
from src.report import generate_executive_report

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
    out_p2 = os.path.join(PROJECT_ROOT, "outputs", "phase2")
    plot_false_color_composite(s2_bands, output_dir=out_p2)
    plot_bsi_map(bsi, mask, output_dir=out_p2)
    plot_ndvi_map(ndvi, output_dir=out_p2)

    # 3. Train & Predict Satellite ML Risk Model
    console.print("\n[bold yellow][Step 3/5] Training Satellite-Driven RF SOC Model...[/bold yellow]")
    df_features, y_target, metadata = prepare_feature_matrix()

    rf, metrics = train_soil_risk_model(df_features, y_target, sample_size=100000, model_save_path=MODEL_SAVE_PATH)
    risk_map = predict_full_risk_map(rf, df_features, metadata)

    valid_risk = risk_map[~np.isnan(risk_map)]

    # Feature Importance Breakdown
    df_imp = pd.DataFrame({'Feature': df_features.columns, 'Importance': rf.feature_importances_}).sort_values('Importance', ascending=False)

    table_imp = Table(title="Random Forest Feature Importances (100% Satellite Spectral Driven)", border_style="cyan")
    table_imp.add_column("Feature Name", style="bold white")
    table_imp.add_column("Importance Weight", justify="right", style="bold green")

    for _, row in df_imp.iterrows():
        table_imp.add_row(row['Feature'], f"{row['Importance']*100:.2f}%")

    console.print(table_imp)

    # Render Phase 3 Maps & Stats
    out_p3 = os.path.join(PROJECT_ROOT, "outputs", "phase3")
    os.makedirs(out_p3, exist_ok=True)
    from src.run_phase3 import plot_risk_score_map, plot_risk_histogram
    plot_risk_score_map(risk_map, output_dir=out_p3)
    plot_risk_histogram(valid_risk, output_dir=out_p3)

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

    out_p4 = os.path.join(PROJECT_ROOT, "outputs", "phase4")
    zonal_csv_path = os.path.join(out_p4, "zonal_priority_ranking.csv")
    rec_csv_path = os.path.join(out_p4, "agronomic_recommendations.csv")

    df_zonal.to_csv(zonal_csv_path, index=False)
    df_rec.to_csv(rec_csv_path, index=False)

    # Priority Sectors Table
    table_zonal = Table(title="Top 5 Critical Priority Sectors for Soil Organic Carbon Building", border_style="red")
    table_zonal.add_column("Rank", justify="center", style="bold red")
    table_zonal.add_column("Sector Name", style="bold white")
    table_zonal.add_column("Mean SOC Def", justify="right", style="bold yellow")
    table_zonal.add_column("Bare Area (ha)", justify="right")
    table_zonal.add_column("High Def Area (ha)", justify="right", style="bold red")

    for _, row in df_zonal.head(5).iterrows():
        table_zonal.add_row(
            f"#{row['priority_rank']}",
            row['sector_name'],
            f"{row['mean_risk_score']:.4f}",
            f"{row['bare_soil_ha']:,.1f}",
            f"{row['high_risk_ha']:,.1f}"
        )

    console.print(table_zonal)

    # Render Phase 4 Maps
    uncertainty_map = compute_ensemble_uncertainty(rf, df_features, metadata, n_sample_trees=30)
    conf_map_path = plot_confidence_map(uncertainty_map, output_dir=out_p4)
    zonal_map_path = plot_zonal_risk_map(risk_map, df_zonal, grid_size=(5, 5), output_dir=out_p4)

    # 5. Executive Summary Report
    console.print("\n[bold yellow][Step 5/5] Generating Presentation-Ready Executive Summary Report...[/bold yellow]")
    report_path = generate_executive_report(df_zonal, df_rec, metrics, output_dir=out_p4)

    elapsed = time.time() - start_time

    total_soil_ha = df_zonal['bare_soil_ha'].sum()
    high_risk_ha = df_zonal['high_risk_ha'].sum()
    pct_high_risk = (high_risk_ha / total_soil_ha) * 100.0 if total_soil_ha > 0 else 0
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
