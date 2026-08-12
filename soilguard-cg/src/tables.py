"""
SoilGuard-SOC: Shared Rich terminal table builders.

The feature-importance and priority-sector tables were previously built inline in
both run_phase3/run_phase4 and run_full_demo. Centralizing them here keeps the
terminal output identical across runners while removing the duplication.
"""

import pandas as pd
from rich.table import Table


def feature_importance_table(rf, df_features, title="Random Forest Feature Importances"):
    """Builds the sorted Random Forest feature-importance table."""
    df_imp = pd.DataFrame({
        "Feature": df_features.columns,
        "Importance": rf.feature_importances_,
    }).sort_values("Importance", ascending=False)

    table = Table(title=title, border_style="cyan")
    table.add_column("Feature Name", style="bold white")
    table.add_column("Importance Weight", justify="right", style="bold green")

    for _, row in df_imp.iterrows():
        table.add_row(row["Feature"], f"{row['Importance'] * 100:.2f}%")
    return table


def priority_sectors_table(df_zonal, title="Top 5 Critical Sectors for Soil Organic Carbon Building",
                           include_pct=False):
    """Builds the top-5 priority sectors table from zonal analytics."""
    table = Table(title=title, border_style="red")
    table.add_column("Rank", justify="center", style="bold red")
    table.add_column("Sector Name", style="bold white")
    table.add_column("Mean SOC Def", justify="right", style="bold yellow")
    table.add_column("Bare Area (ha)", justify="right")
    table.add_column("High Def Area (ha)", justify="right", style="bold red")
    if include_pct:
        table.add_column("High Def %", justify="right", style="magenta")

    for _, row in df_zonal.head(5).iterrows():
        cols = [
            f"#{row['priority_rank']}",
            row["sector_name"],
            f"{row['mean_risk_score']:.4f}",
            f"{row['bare_soil_ha']:,.1f}",
            f"{row['high_risk_ha']:,.1f}",
        ]
        if include_pct:
            cols.append(f"{row['pct_high_risk']:.1f}%")
        table.add_row(*cols)
    return table
