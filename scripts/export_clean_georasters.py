"""
Export Pure, Borderless, Transparent RGBA Geospatial Rasters
Aligns 1:1 with Sentinel-2 UTM Grid & WGS84 Geographic Coordinates for Leaflet Overlays.
Zero Matplotlib margins, zero axis ticks, zero titles, zero baked-in legends.
Alpha channel = 0 for masked non-bare pixels; Alpha > 0 for agricultural soil.
"""

import os
import sys
import numpy as np
import rasterio
from PIL import Image
import matplotlib.cm as cm
import joblib

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SG_DIR = os.path.join(BASE_DIR, "soilguard-cg")
S2_PATH = os.path.join(SG_DIR, "data", "golden", "sentinel2_raipur_golden.tif")
SOIL_PATH = os.path.join(SG_DIR, "data", "golden", "soilgrids_raipur_golden.tif")
MODEL_PATH = os.path.join(SG_DIR, "models", "soil_soc_rf.joblib")
OUTPUT_DIR = os.path.join(BASE_DIR, "soilguard-nextjs", "public", "maps")

os.makedirs(OUTPUT_DIR, exist_ok=True)

print(f"[+] Loading Sentinel-2 L2A stack: {S2_PATH}")
with rasterio.open(S2_PATH) as src:
    profile = src.profile
    b02 = src.read(1).astype(np.float32)  # Blue
    b04 = src.read(2).astype(np.float32)  # Red
    b08 = src.read(3).astype(np.float32)  # NIR
    b11 = src.read(4).astype(np.float32)  # SWIR1

height, width = b02.shape
print(f"[+] Grid dimensions: {height} rows x {width} cols ({profile['crs']})")

# 1. Compute Indices
print("[+] Computing NDVI & BSI...")
denom_ndvi = b08 + b04
with np.errstate(divide='ignore', invalid='ignore'):
    ndvi = np.where(denom_ndvi > 0, (b08 - b04) / denom_ndvi, np.nan).astype(np.float32)

denom_bsi = (b11 + b04) + (b08 + b02)
num_bsi = (b11 + b04) - (b08 + b02)
with np.errstate(divide='ignore', invalid='ignore'):
    bsi = np.where(denom_bsi > 0, num_bsi / denom_bsi, np.nan).astype(np.float32)

# Bare Soil Mask: NDVI <= 0.30, NIR >= 300, valid data
valid_data = ~np.isnan(ndvi) & ~np.isnan(bsi)
not_dense_veg = (ndvi <= 0.30)
not_water = (b08 >= 300.0) & (ndvi >= -0.20)
bare_soil_mask = valid_data & not_dense_veg & not_water

total_px = bare_soil_mask.size
bare_px = np.sum(bare_soil_mask)
print(f"[+] Bare soil candidate pixels: {bare_px:,} / {total_px:,} ({bare_px/total_px*100:.2f}%)")

# 2. Build Feature Matrix for RF Prediction
print("[+] Building feature matrix for Random Forest SOC Model...")
rows, cols = np.where(bare_soil_mask)

with np.errstate(divide='ignore', invalid='ignore'):
    swir1_red_ratio = np.where(b04 > 0, b11 / b04, 0.0)
    swir1_nir_ratio = np.where(b08 > 0, b11 / b08, 0.0)
    bsi_ndvi_ratio = np.where(np.abs(ndvi) > 1e-4, bsi / ndvi, 0.0)

swir1_red_ratio = np.clip(swir1_red_ratio, 0.0, 10.0)
swir1_nir_ratio = np.clip(swir1_nir_ratio, 0.0, 10.0)
bsi_ndvi_ratio = np.clip(bsi_ndvi_ratio, -10.0, 10.0)

import pandas as pd
df_features = pd.DataFrame({
    'bsi': bsi[bare_soil_mask],
    'ndvi': ndvi[bare_soil_mask],
    'swir1_red_ratio': swir1_red_ratio[bare_soil_mask],
    'swir1_nir_ratio': swir1_nir_ratio[bare_soil_mask],
    'bsi_ndvi_ratio': bsi_ndvi_ratio[bare_soil_mask],
    'blue_reflectance': b02[bare_soil_mask],
    'red_reflectance': b04[bare_soil_mask],
    'nir_reflectance': b08[bare_soil_mask],
    'swir1_reflectance': b11[bare_soil_mask],
})

print(f"[+] Loading RF SOC Model: {MODEL_PATH}")
rf = joblib.load(MODEL_PATH)

print(f"[+] Running inference for all {len(df_features):,} bare soil pixels...")
preds = rf.predict(df_features)
preds = np.clip(preds, 0.0, 1.0)

risk_map = np.full((height, width), np.nan, dtype=np.float32)
risk_map[rows, cols] = preds
print(f"[+] Mean Predicted SOC Deficiency: {np.nanmean(risk_map):.4f}")


# ---------------------------------------------------------
# Helper function to convert 2D array to pure transparent RGBA PNG
# ---------------------------------------------------------
def save_clean_rgba_raster(arr, mask, colormap, vmin, vmax, out_path, alpha_val=225):
    """
    Directly converts a 2D float array into a pure RGBA PNG with ZERO margins,
    zero borders, zero labels, zero colorbars.
    Pixels where mask is False have alpha = 0 (100% transparent).
    """
    if isinstance(colormap, str):
        try:
            import matplotlib as mpl
            cmap = mpl.colormaps[colormap]
        except Exception:
            import matplotlib.pyplot as plt
            cmap = plt.get_cmap(colormap)
    else:
        cmap = colormap

    # Normalize values to 0.0 - 1.0
    norm_val = np.clip((arr - vmin) / (vmax - vmin + 1e-6), 0.0, 1.0)
    rgba = cmap(norm_val)  # returns (H, W, 4) in [0.0, 1.0]

    rgba_uint8 = (rgba * 255.0).astype(np.uint8)
    # Set Alpha channel:
    rgba_uint8[:, :, 3] = np.where(mask, alpha_val, 0)

    img = Image.fromarray(rgba_uint8, mode='RGBA')
    img.save(out_path, format='PNG', optimize=True)
    size_mb = os.path.getsize(out_path) / (1024 * 1024)
    print(f"[OK] Saved pure RGBA raster: {out_path} ({size_mb:.2f} MB, shape: {rgba_uint8.shape[:2]})")


# 1. Clean SOC Risk Raster (RdYlGn_r: Green = Low Defic, Yellow = Mod, Red = Critical Defic)
soc_path = os.path.join(OUTPUT_DIR, "clean_soc_risk.png")
save_clean_rgba_raster(risk_map, bare_soil_mask, 'RdYlGn_r', 0.25, 0.75, soc_path, alpha_val=225)
# Also overwrite default risk_score_map.png for direct backward compatibility
save_clean_rgba_raster(risk_map, bare_soil_mask, 'RdYlGn_r', 0.25, 0.75, os.path.join(OUTPUT_DIR, "risk_score_map.png"), alpha_val=225)

# 2. Clean NDVI Raster (YlGn colormap: Yellow = Sparse, Green = Lush Canopy)
ndvi_path = os.path.join(OUTPUT_DIR, "clean_ndvi.png")
valid_ndvi_mask = ~np.isnan(ndvi) & (ndvi >= -0.1) & (b08 >= 200.0)
save_clean_rgba_raster(ndvi, valid_ndvi_mask, 'YlGn', 0.0, 0.7, ndvi_path, alpha_val=210)
save_clean_rgba_raster(ndvi, valid_ndvi_mask, 'YlGn', 0.0, 0.7, os.path.join(OUTPUT_DIR, "ndvi_map.png"), alpha_val=210)

# 3. Clean BSI Raster (copper / YlOrBr: High BSI = Bright Copper/Orange bare soil)
bsi_path = os.path.join(OUTPUT_DIR, "clean_bsi.png")
save_clean_rgba_raster(bsi, bare_soil_mask, 'copper', -0.15, 0.35, bsi_path, alpha_val=220)
save_clean_rgba_raster(bsi, bare_soil_mask, 'copper', -0.15, 0.35, os.path.join(OUTPUT_DIR, "bsi_map.png"), alpha_val=220)

# 4. Clean Model Confidence Raster (viridis: High agreement = Yellow/Green, Lower = Purple)
print("[+] Computing tree ensemble uncertainty...")
sub_trees = rf.estimators_[:25]
tree_preds = np.array([tree.predict(df_features) for tree in sub_trees])
uncertainty = np.std(tree_preds, axis=0)
max_unc = np.max(uncertainty) if np.max(uncertainty) > 0 else 1.0
confidence = 1.0 - (uncertainty / max_unc)

conf_map = np.full((height, width), np.nan, dtype=np.float32)
conf_map[rows, cols] = confidence

conf_path = os.path.join(OUTPUT_DIR, "clean_confidence.png")
save_clean_rgba_raster(conf_map, bare_soil_mask, 'viridis', 0.50, 0.95, conf_path, alpha_val=220)
save_clean_rgba_raster(conf_map, bare_soil_mask, 'viridis', 0.50, 0.95, os.path.join(OUTPUT_DIR, "model_confidence_map.png"), alpha_val=220)

# 5. Clean False Color Composite (NIR=R, Red=G, Blue=B) with 2-98% percentile stretch
print("[+] Generating clean False-Color NIR composite...")
p2_nir, p98_nir = np.percentile(b08[valid_data], [2, 98])
p2_red, p98_red = np.percentile(b04[valid_data], [2, 98])
p2_blue, p98_blue = np.percentile(b02[valid_data], [2, 98])

r_chan = np.clip((b08 - p2_nir) / (p98_nir - p2_nir + 1e-6), 0.0, 1.0)
g_chan = np.clip((b04 - p2_red) / (p98_red - p2_red + 1e-6), 0.0, 1.0)
b_chan = np.clip((b02 - p2_blue) / (p98_blue - p2_blue + 1e-6), 0.0, 1.0)

fc_rgba = np.zeros((height, width, 4), dtype=np.uint8)
fc_rgba[:, :, 0] = (r_chan * 255.0).astype(np.uint8)
fc_rgba[:, :, 1] = (g_chan * 255.0).astype(np.uint8)
fc_rgba[:, :, 2] = (b_chan * 255.0).astype(np.uint8)
fc_rgba[:, :, 3] = np.where(valid_data, 240, 0).astype(np.uint8)

fc_img = Image.fromarray(fc_rgba, mode='RGBA')
fc_path = os.path.join(OUTPUT_DIR, "clean_false_color.png")
fc_img.save(fc_path, format='PNG', optimize=True)
fc_img.save(os.path.join(OUTPUT_DIR, "false_color_composite.png"), format='PNG', optimize=True)
print(f"[OK] Saved clean False Color: {fc_path} ({os.path.getsize(fc_path)/(1024*1024):.2f} MB)")

# 6. Clean 5x5 Zonal Sector Grid Map
print("[+] Generating clean 5x5 Zonal Sector Grid overlay...")
r_step = height // 5
c_step = width // 5
zonal_rgba = np.zeros((height, width, 4), dtype=np.uint8)

import matplotlib as mpl
cmap = mpl.colormaps['RdYlGn_r']

for r in range(5):
    for c in range(5):
        r_start = r * r_step
        r_end = height if r == 4 else (r + 1) * r_step
        c_start = c * c_step
        c_end = width if c == 4 else (c + 1) * c_step

        cell_data = risk_map[r_start:r_end, c_start:c_end]
        valid_cell = cell_data[~np.isnan(cell_data)]
        cell_mean = np.mean(valid_cell) if len(valid_cell) > 0 else 0.50

        # Normalize 0.25 to 0.75
        norm_mean = np.clip((cell_mean - 0.25) / (0.75 - 0.25), 0.0, 1.0)
        color = np.array(cmap(norm_mean)[:3]) * 255.0

        # Fill cell with semi-transparent color (alpha = 110)
        zonal_rgba[r_start:r_end, c_start:c_end, 0] = int(color[0])
        zonal_rgba[r_start:r_end, c_start:c_end, 1] = int(color[1])
        zonal_rgba[r_start:r_end, c_start:c_end, 2] = int(color[2])
        zonal_rgba[r_start:r_end, c_start:c_end, 3] = 115

        # Draw 2-pixel grid border with alpha = 200
        zonal_rgba[r_start:r_start+2, c_start:c_end, :3] = [0, 212, 255]
        zonal_rgba[r_start:r_start+2, c_start:c_end, 3] = 200
        zonal_rgba[r_start:r_end, c_start:c_start+2, :3] = [0, 212, 255]
        zonal_rgba[r_start:r_end, c_start:c_start+2, 3] = 200

z_img = Image.fromarray(zonal_rgba, mode='RGBA')
z_path = os.path.join(OUTPUT_DIR, "clean_zonal_grid.png")
z_img.save(z_path, format='PNG', optimize=True)
z_img.save(os.path.join(OUTPUT_DIR, "zonal_risk_map.png"), format='PNG', optimize=True)
print(f"[OK] Saved clean Zonal Grid: {z_path} ({os.path.getsize(z_path)/(1024*1024):.2f} MB)")

print("\n[SUCCESS] All clean borderless geospatial rasters exported successfully!")
