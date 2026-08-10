"""
SoilGuard-CG: Phase 2 Pipeline Runner
Executes spectral calculations, bare soil masking, prints rich terminal stats,
and outputs high-quality visualization maps.
"""

import os
import sys
import numpy as np
from rich.console import Console
from rich.table import Table
from rich.panel import Panel

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
sys.path.append(PROJECT_ROOT)

from src.spectral import load_sentinel2_stack, compute_ndvi, compute_bsi, generate_bare_soil_mask
from src.visualize import plot_false_color_composite, plot_bsi_map, plot_ndvi_map

console = Console()

def run_phase2():
    console.print("\n[bold cyan]=== SoilGuard-CG: Phase 2 - Core Spectral & Masking Pipeline ===[/bold cyan]\n")

    # 1. Load Golden Data
    console.print("[bold yellow][1/4] Loading Golden Sentinel-2 stack...[/bold yellow]")
    bands, profile = load_sentinel2_stack()
    console.print(f"  • Grid Shape: {profile['width']} x {profile['height']} ({profile['crs']})")

    # 2. Compute Spectral Indices
    console.print("\n[bold yellow][2/4] Computing NDVI and Bare Soil Index (BSI)...[/bold yellow]")
    ndvi = compute_ndvi(bands['nir'], bands['red'])
    bsi = compute_bsi(bands['swir1'], bands['red'], bands['nir'], bands['blue'])

    # 3. Apply Bare Soil Masking
    console.print("\n[bold yellow][3/4] Generating Bare Soil Candidate Mask (NDVI <= 0.30)...[/bold yellow]")
    mask, masked_bsi, masked_ndvi = generate_bare_soil_mask(ndvi, bands['nir'], bsi, ndvi_threshold=0.30)

    # Compute Statistics
    total_px = mask.size
    valid_px = np.sum(~np.isnan(ndvi) & ~np.isnan(bsi))
    bare_px = np.sum(mask)
    pct_bare = (bare_px / total_px) * 100.0
    pct_valid_bare = (bare_px / valid_px) * 100.0 if valid_px > 0 else 0.0

    valid_bsi_bare = bsi[mask]
    valid_ndvi_bare = ndvi[mask]

    # Print Summary Table using Rich
    table = Table(title="Phase 2: Spectral & Masking Statistics Summary", border_style="cyan")
    table.add_column("Metric", style="bold white")
    table.add_column("Value", justify="right", style="bold green")

    table.add_row("Total AOI Pixels", f"{total_px:,}")
    table.add_row("Valid Spectral Pixels", f"{valid_px:,}")
    table.add_row("Bare Soil Candidate Pixels", f"{bare_px:,}")
    table.add_row("Retained Bare Soil % (of Total)", f"{pct_bare:.2f}%")
    table.add_row("Retained Bare Soil % (of Valid)", f"{pct_valid_bare:.2f}%")

    table.add_section()
    table.add_row("Mean BSI (Bare Soil)", f"{np.mean(valid_bsi_bare):.4f}")
    table.add_row("Median BSI (Bare Soil)", f"{np.median(valid_bsi_bare):.4f}")
    table.add_row("Std Dev BSI (Bare Soil)", f"{np.std(valid_bsi_bare):.4f}")
    table.add_row("Min / Max BSI (Bare Soil)", f"{np.min(valid_bsi_bare):.4f} / {np.max(valid_bsi_bare):.4f}")

    table.add_section()
    table.add_row("Mean NDVI (Bare Soil)", f"{np.mean(valid_ndvi_bare):.4f}")
    table.add_row("Median NDVI (Bare Soil)", f"{np.median(valid_ndvi_bare):.4f}")
    table.add_row("Std Dev NDVI (Bare Soil)", f"{np.std(valid_ndvi_bare):.4f}")
    table.add_row("Min / Max NDVI (Bare Soil)", f"{np.min(valid_ndvi_bare):.4f} / {np.max(valid_ndvi_bare):.4f}")

    console.print(table)

    # 4. Generate Visualization Maps
    console.print("\n[bold yellow][4/4] Generating high-resolution PNG maps in outputs/phase2/...[/bold yellow]")
    out_dir = os.path.join(PROJECT_ROOT, "outputs", "phase2")

    path_fc = plot_false_color_composite(bands, output_dir=out_dir)
    path_bsi = plot_bsi_map(bsi, mask, output_dir=out_dir)
    path_ndvi = plot_ndvi_map(ndvi, output_dir=out_dir)

    console.print(Panel.fit(
        f"[bold green]✓ Phase 2 Execution Completed Successfully![/bold green]\n"
        f"• False-Color Composite Map : {path_fc}\n"
        f"• Bare Soil Index (BSI) Map  : {path_bsi}\n"
        f"• NDVI Vegetation Map       : {path_ndvi}",
        title="SoilGuard-CG Phase 2 Output", border_style="green"
    ))

if __name__ == "__main__":
    run_phase2()
