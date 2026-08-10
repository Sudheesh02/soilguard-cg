"""
SoilGuard-CG: Verification Script for Golden Datasets (Phase 1)
Inspects shape, CRS, bounds, data types, and statistics for cached Sentinel-2 and SoilGrids layers.
"""

import os
import rasterio
import numpy as np
from rich.console import Console
from rich.table import Table

console = Console()

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
GOLDEN_DIR = os.path.join(PROJECT_ROOT, "data", "golden")

def verify_dataset(filepath, name):
    if not os.path.exists(filepath):
        console.print(f"[bold red]FAIL: File {filepath} does not exist![/bold red]")
        return False

    console.print(f"\n[bold cyan]=== Verifying {name} ({filepath}) ===[/bold cyan]")
    size_mb = os.path.getsize(filepath) / (1024 * 1024)

    with rasterio.open(filepath) as src:
        console.print(f"• File Size : [bold green]{size_mb:.2f} MB[/bold green]")
        console.print(f"• Dimensions: Width = {src.width}, Height = {src.height}, Bands = {src.count}")
        console.print(f"• CRS       : {src.crs}")
        console.print(f"• Bounds    : MinX={src.bounds.left:.2f}, MinY={src.bounds.bottom:.2f}, MaxX={src.bounds.right:.2f}, MaxY={src.bounds.top:.2f}")

        table = Table(title=f"Band Summary: {name}")
        table.add_column("Band Index", justify="right", style="cyan")
        table.add_column("Description", style="bold")
        table.add_column("Dtype", style="magenta")
        table.add_column("Min", justify="right")
        table.add_column("Max", justify="right")
        table.add_column("Mean", justify="right")
        table.add_column("Std", justify="right")

        for b in range(1, src.count + 1):
            desc = src.descriptions[b - 1] if src.descriptions and src.descriptions[b - 1] else f"Band_{b}"
            arr = src.read(b)
            valid_arr = arr[arr != src.nodata] if src.nodata is not None else arr
            min_val = np.nanmin(valid_arr) if len(valid_arr) > 0 else np.nan
            max_val = np.nanmax(valid_arr) if len(valid_arr) > 0 else np.nan
            mean_val = np.nanmean(valid_arr) if len(valid_arr) > 0 else np.nan
            std_val = np.nanstd(valid_arr) if len(valid_arr) > 0 else np.nan

            table.add_row(
                str(b),
                desc,
                str(arr.dtype),
                f"{min_val:.2f}",
                f"{max_val:.2f}",
                f"{mean_val:.2f}",
                f"{std_val:.2f}"
            )

        console.print(table)
    return True

if __name__ == "__main__":
    s2_path = os.path.join(GOLDEN_DIR, "sentinel2_raipur_golden.tif")
    soil_path = os.path.join(GOLDEN_DIR, "soilgrids_raipur_golden.tif")

    res_s2 = verify_dataset(s2_path, "Golden Sentinel-2 L2A Stack")
    res_soil = verify_dataset(soil_path, "Golden SoilGrids Stack")

    if res_s2 and res_soil:
        with rasterio.open(s2_path) as s2_ds, rasterio.open(soil_path) as soil_ds:
            same_shape = (s2_ds.shape == soil_ds.shape)
            same_crs = (s2_ds.crs == soil_ds.crs)
            same_transform = (s2_ds.transform == soil_ds.transform)

            console.print("\n[bold yellow]=== Spatial Alignment Check ===[/bold yellow]")
            console.print(f"• Matching Dimensions : [{'bold green}PASS{/' if same_shape else 'bold red}FAIL'}] ({s2_ds.shape})")
            console.print(f"• Matching CRS        : [{'bold green}PASS{/' if same_crs else 'bold red}FAIL'}] ({s2_ds.crs})")
            console.print(f"• Matching Transform  : [{'bold green}PASS{/' if same_transform else 'bold red}FAIL'}]")

            if same_shape and same_crs and same_transform:
                console.print("\n[bold green]✓ SUCCESS: All Golden Data files exist and are perfectly spatially aligned![/bold green]\n")
            else:
                console.print("\n[bold red]✖ FAIL: Spatial mismatch detected between Sentinel-2 and SoilGrids datasets![/bold red]\n")
