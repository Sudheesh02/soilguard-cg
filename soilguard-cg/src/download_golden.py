"""
SoilGuard-CG: Data Downloading & Golden Cache Generator
Downloads windowed Sentinel-2 L2A imagery (B2, B4, B8, B11) and aligned SoilGrids (SOC, Clay, pH)
for the Raipur/Durg agricultural belt in Chhattisgarh.
"""

import os
import io
import sys
import requests
import numpy as np
import rasterio
from rasterio.windows import from_bounds
from rasterio.warp import transform_bounds, reproject, Resampling
from pystac_client import Client

# Base Paths
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
GOLDEN_DIR = os.path.join(PROJECT_ROOT, "data", "golden")

# Default & Fallback AOIs (WGS84 Bounding Box: [min_lon, min_lat, max_lon, max_lat])
AOI_RAIPUR = [81.60, 21.10, 81.80, 21.30]  # Raipur / Abhanpur / Arang
AOI_DURG = [81.25, 21.10, 81.45, 21.30]    # Durg / Bhilai / Patan

STAC_API_URL = "https://earth-search.aws.element84.com/v1"
SOILGRIDS_WCS_URL = "https://maps.isric.org/mapserv"

def download_sentinel2_window(aoi_bounds=AOI_RAIPUR, output_dir=GOLDEN_DIR):
    os.makedirs(output_dir, exist_ok=True)
    out_file = os.path.join(output_dir, "sentinel2_raipur_golden.tif")

    print(f"[+] Querying Earth-Search STAC for low-cloud Sentinel-2 L2A scene over AOI {aoi_bounds}...")
    catalog = Client.open(STAC_API_URL)
    search = catalog.search(
        collections=["sentinel-2-l2a"],
        bbox=aoi_bounds,
        datetime="2024-10-01/2024-12-31",
        query={"eo:cloud_cover": {"lt": 5}}
    )
    items = list(search.items())
    if not items:
        raise RuntimeError("No low-cloud Sentinel-2 scene found for specified AOI and date range.")

    selected_item = items[0]
    print(f"[✓] Found Scene: {selected_item.id} (Acquisition: {selected_item.datetime})")

    # First open B02 (10m) to establish target grid in UTM
    b02_href = selected_item.assets["blue"].href
    with rasterio.open(b02_href) as src_b02:
        crs = src_b02.crs
        bounds_utm = transform_bounds("EPSG:4326", crs, *aoi_bounds)
        window = from_bounds(*bounds_utm, transform=src_b02.transform)

        # Read B02 window
        b02_data = src_b02.read(1, window=window)
        win_transform = src_b02.window_transform(window)
        height, width = b02_data.shape

        print(f"[+] Extracted window grid: shape=({height}, {width}), CRS={crs}")

    # Initialize 4-band stack
    stacked_bands = np.zeros((4, height, width), dtype=np.uint16)
    stacked_bands[0] = b02_data

    # Read Red (B04)
    print("[+] Reading B04 (Red 10m)...")
    with rasterio.open(selected_item.assets["red"].href) as src_b04:
        stacked_bands[1] = src_b04.read(1, window=window)

    # Read NIR (B08)
    print("[+] Reading B08 (NIR 10m)...")
    with rasterio.open(selected_item.assets["nir"].href) as src_b08:
        stacked_bands[2] = src_b08.read(1, window=window)

    # Read SWIR1 (B11 20m) and resample to 10m grid
    print("[+] Reading B11 (SWIR-1 20m) and resampling to 10m...")
    with rasterio.open(selected_item.assets["swir16"].href) as src_b11:
        bounds_utm_b11 = transform_bounds("EPSG:4326", src_b11.crs, *aoi_bounds)
        win_b11 = from_bounds(*bounds_utm_b11, transform=src_b11.transform)

        b11_data_native = src_b11.read(1, window=win_b11)
        win_b11_transform = src_b11.window_transform(win_b11)

        b11_resampled = np.zeros((height, width), dtype=np.uint16)
        reproject(
            source=b11_data_native,
            destination=b11_resampled,
            src_transform=win_b11_transform,
            src_crs=src_b11.crs,
            dst_transform=win_transform,
            dst_crs=crs,
            resampling=Resampling.bilinear
        )
        stacked_bands[3] = b11_resampled

    # Write multi-band GeoTIFF
    profile = {
        'driver': 'GTiff',
        'dtype': 'uint16',
        'nodata': 0,
        'width': width,
        'height': height,
        'count': 4,
        'crs': crs,
        'transform': win_transform,
        'compress': 'lzw'
    }

    with rasterio.open(out_file, 'w', **profile) as dst:
        for i in range(4):
            dst.write(stacked_bands[i], i + 1)
        dst.set_band_description(1, 'B02_Blue_10m')
        dst.set_band_description(2, 'B04_Red_10m')
        dst.set_band_description(3, 'B08_NIR_10m')
        dst.set_band_description(4, 'B11_SWIR1_10m')

    print(f"[✓] Saved Golden Sentinel-2 stack to {out_file} ({os.path.getsize(out_file)/1e6:.2f} MB)")
    return out_file, profile


def download_soilgrids_aligned(target_profile, aoi_bounds=AOI_RAIPUR, output_dir=GOLDEN_DIR):
    out_file = os.path.join(output_dir, "soilgrids_raipur_golden.tif")

    layers = [
        ("soc", "soc_0-5cm_mean", "SOC_dg_kg"),
        ("clay", "clay_0-5cm_mean", "Clay_g_kg"),
        ("phh2o", "phh2o_0-5cm_mean", "pH_h2o_x10")
    ]

    height = target_profile['height']
    width = target_profile['width']
    target_crs = target_profile['crs']
    target_transform = target_profile['transform']

    stacked_soil = np.zeros((3, height, width), dtype=np.float32)

    for idx, (name, cov_id, desc) in enumerate(layers):
        print(f"[+] Fetching SoilGrids layer '{cov_id}' via WCS...")
        url = f"{SOILGRIDS_WCS_URL}?map=/map/{name}.map&SERVICE=WCS&VERSION=2.0.1&REQUEST=GetCoverage&COVERAGEID={cov_id}&SUBSET=long({aoi_bounds[0]},{aoi_bounds[2]})&SUBSET=lat({aoi_bounds[1]},{aoi_bounds[3]})&SUBSETTINGCRS=http://www.opengis.net/def/crs/EPSG/0/4326&FORMAT=image/tiff"

        resp = requests.get(url, timeout=40)
        if resp.status_code != 200 or not (resp.content[:4] in (b"II*\x00", b"MM\x00*")):
            raise RuntimeError(f"Failed to fetch SoilGrids {cov_id}: HTTP {resp.status_code}")

        with rasterio.open(io.BytesIO(resp.content)) as src_soil:
            soil_data = src_soil.read(1).astype(np.float32)
            soil_crs = src_soil.crs
            soil_transform = src_soil.transform

            reproject(
                source=soil_data,
                destination=stacked_soil[idx],
                src_transform=soil_transform,
                src_crs=soil_crs,
                dst_transform=target_transform,
                dst_crs=target_crs,
                resampling=Resampling.bilinear
            )

    soil_profile = target_profile.copy()
    soil_profile.update({
        'dtype': 'float32',
        'count': 3,
        'nodata': -9999.0,
        'compress': 'lzw'
    })

    with rasterio.open(out_file, 'w', **soil_profile) as dst:
        for i in range(3):
            dst.write(stacked_soil[i], i + 1)
            dst.set_band_description(i + 1, layers[i][2])

    print(f"[✓] Saved Golden Aligned SoilGrids stack to {out_file} ({os.path.getsize(out_file)/1e6:.2f} MB)")
    return out_file


if __name__ == "__main__":
    print("=== SoilGuard-CG Phase 1 Golden Data Extractor ===")
    s2_file, s2_prof = download_sentinel2_window(AOI_RAIPUR)
    soil_file = download_soilgrids_aligned(s2_prof, AOI_RAIPUR)
    print("\n[✓] Phase 1 Golden Data Download complete!")
