"""
SoilGuard-SOC: Phase 4 Pipeline Runner
Executes zonal analytics, priority ranking, recommendation package generation,
model confidence mapping, executive report rendering, and rich terminal output.
"""

import os
import sys

import joblib
from rich.console import Console
from rich.table import Table
from rich.panel import Panel

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))  # make `src/` importable under any invocation

from config import PHASE4_OUTPUT_DIR, MODEL_SAVE_PATH
from ml_risk import (
    prepare_feature_matrix,
    predict_full_risk_map,
    load_soilgrids_stack,
    load_model_metrics,
)
from spectral import load_sentinel2_stack
from zonal import compute_zonal_statistics, plot_zonal_risk_map
from recommendations import generate_sector_recommendations
from confidence import compute_ensemble_uncertainty, plot_confidence_map
from report import generate_executive_report
from tables import priority_sectors_table

console = Console()
OUTPUT_DIR = PHASE4_OUTPUT_DIR


def run_phase4():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    console.print("\n[bold cyan]=== SoilGuard-SOC: Phase 4 - Zonal SOC Analytics, Regenerative Packages & Executive Report ===[/bold cyan]\n")

    # 1. Load Data & Trained Model
    console.print("[bold yellow][1/5] Loading Golden Rasters & Trained RF SOC Model...[/bold yellow]")
    s2_bands, prof = load_sentinel2_stack()
    soil_bands = load_soilgrids_stack()
    df_features, y_target, metadata = prepare_feature_matrix(s2_bands=s2_bands, soil_bands=soil_bands, profile=prof)

    if not os.path.exists(MODEL_SAVE_PATH):
        raise FileNotFoundError(f"Model file not found at: {MODEL_SAVE_PATH}. Please run Phase 3 first.")

    rf = joblib.load(MODEL_SAVE_PATH)
    console.print(f"  • Loaded RF SOC Model: {rf.n_estimators} trees (Features: {rf.n_features_in_})")

    # Reconstruct 2D SOC Deficiency Map (BSI 2D map comes from the feature metadata)
    risk_map = predict_full_risk_map(rf, df_features, metadata)
    bsi_map_2d = metadata['bsi']

    # 2. Zonal Analytics & Priority Ranking
    console.print("\n[bold yellow][2/5] Partitioning AOI into Agricultural Sectors & Ranking SOC Deficiency Priorities...[/bold yellow]")
    df_zonal = compute_zonal_statistics(
        risk_map=risk_map,
        soc_map=soil_bands['soc'],
        bsi_map=bsi_map_2d,
        ph_map=soil_bands['ph'],
        clay_map=soil_bands['clay'],
        grid_size=(5, 5)
    )

    zonal_csv_path = os.path.join(OUTPUT_DIR, "zonal_priority_ranking.csv")
    df_zonal.to_csv(zonal_csv_path, index=False)
    console.print(f"[OK] Saved Zonal SOC Priority Ranking to: {zonal_csv_path}")

    # Rich Terminal Table for Top 5 Priority Sectors
    console.print(priority_sectors_table(
        df_zonal,
        title="Top 5 Critical Sectors Requiring Soil Organic Carbon (SOC) Building",
        include_pct=True,
    ))

    # 3. Actionable Recommendation Engine
    console.print("\n[bold yellow][3/5] Generating Regenerative Carbon Recommendation Packages for Sectors...[/bold yellow]")
    df_rec = generate_sector_recommendations(df_zonal)

    rec_csv_path = os.path.join(OUTPUT_DIR, "agronomic_recommendations.csv")
    df_rec.to_csv(rec_csv_path, index=False)
    console.print(f"[OK] Saved Actionable Regenerative Recommendations CSV to: {rec_csv_path}")

    table_rec = Table(title="Regenerative Organic Carbon Packages for Top 3 Critical Sectors", border_style="green")
    table_rec.add_column("Rank", justify="center", style="bold red")
    table_rec.add_column("Sector Name", style="bold white")
    table_rec.add_column("Urgency", style="bold magenta")
    table_rec.add_column("Primary Regenerative Organic Carbon Package", style="cyan")

    for _, row in df_rec.head(3).iterrows():
        table_rec.add_row(
            f"#{row['priority_rank']}",
            row['sector_name'],
            row['urgency_level'],
            row['primary_recommendation']
        )

    console.print(table_rec)

    # 4. Compute Model Uncertainty / Confidence Map
    console.print("\n[bold yellow][4/5] Computing Model Uncertainty & Rendering Confidence Map...[/bold yellow]")
    uncertainty_map = compute_ensemble_uncertainty(rf, df_features, metadata)
    conf_map_path = plot_confidence_map(uncertainty_map, output_dir=OUTPUT_DIR)
    zonal_map_path = plot_zonal_risk_map(risk_map, df_zonal, grid_size=(5, 5), output_dir=OUTPUT_DIR)

    # 5. Generate Executive Summary Report (uses the metrics recorded at training time)
    console.print("\n[bold yellow][5/5] Auto-Generating Executive Summary Report...[/bold yellow]")
    metrics = load_model_metrics()
    report_path = generate_executive_report(df_zonal, df_rec, metrics, output_dir=OUTPUT_DIR)

    console.print(Panel.fit(
        f"[bold green][OK] SoilGuard-SOC Phase 4 Deliverables Generated Successfully![/bold green]\n"
        f"• Zonal Priority Map      : {zonal_map_path}\n"
        f"• Model Confidence Map    : {conf_map_path}\n"
        f"• Priority Ranking CSV    : {zonal_csv_path}\n"
        f"• Recommendations CSV     : {rec_csv_path}\n"
        f"• Executive Summary Report: {report_path}",
        title="SoilGuard-SOC Phase 4 Complete", border_style="green"
    ))


if __name__ == "__main__":
    run_phase4()
