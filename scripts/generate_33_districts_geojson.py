"""
Generate Full 33-District Chhattisgarh GeoJSON with Pedological Intelligence
===========================================================================
Partitions geometries for all 33 districts and enriches each feature with:
  - Priority Rank (#1 to #33)
  - SOC Deficiency Risk, High-Risk ha, Bare Soil ha
  - Indigenous Vernacular Soil Taxonomy (Kanhar, Dorsa, Matasi, Bhata)
  - Agro-Climatic Zone (Northern Hills, Central Plains, Bastar Plateau)
  - Baseline Topsoil Organic Carbon (dg/kg), Clay (g/kg), Soil pH
  - Localized Regenerative Agronomic Interventions
"""

import os
import sys
import json
from shapely.geometry import shape, mapping, box
from shapely.validation import make_valid

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SG_DIR = os.path.join(BASE_DIR, "soilguard-cg")
GEOJSON_SRC = os.path.join(BASE_DIR, "soilguard-nextjs", "public", "chhattisgarh-districts.geojson")
SUMMARY_SRC = os.path.join(SG_DIR, "outputs", "chhattisgarh_statewide", "chhattisgarh_statewide_summary.json")
GEOJSON_OUT = os.path.join(BASE_DIR, "soilguard-nextjs", "public", "chhattisgarh-districts.geojson")

sys.path.insert(0, os.path.join(SG_DIR, "src"))
from chhattisgarh_geography import get_all_districts, get_district

print(f"[+] Loading original district GeoJSON: {GEOJSON_SRC}")
with open(GEOJSON_SRC, "r", encoding="utf-8") as f:
    orig_geojson = json.load(f)

print(f"[+] Loading statewide summary intelligence: {SUMMARY_SRC}")
with open(SUMMARY_SRC, "r", encoding="utf-8") as f:
    summary_data = json.load(f)

dist_summary_map = {d["district_name"]: d for d in summary_data["districts"]}

# Map existing 27 feature names to geometries
orig_geoms = {f["properties"]["Dist_Name"]: shape(f["geometry"]) for f in orig_geojson["features"]}

# Name translation dictionary for 22 undivided districts
translations = {
    "Bemetra": "Bemetara",
    "Uttar Bastar Kanker": "Kanker",
    "Dakshin Bastar Dantewada": "Dantewada",
    "Kabeerdham": "Kabirdham",
    "Balrampur": "Balrampur-Ramanujganj",
    "Baloda Bazar": "Baloda Bazar-Bhatapara"
}

final_geoms = {}

# 1. Add undivided districts
for old_name, geom in orig_geoms.items():
    canon = translations.get(old_name, old_name)
    if old_name not in ["Koriya", "Bilaspur", "Janjgir-Champa", "Raigarh", "Rajnandgaon"]:
        final_geoms[canon] = make_valid(geom)

# 2. Partition Koriya -> MCB (West, lon < 82.35) & Koriya (East, lon >= 82.35)
k_geom = orig_geoms["Koriya"]
minx, miny, maxx, maxy = k_geom.bounds
mcb_box = box(minx, miny, 82.35, maxy)
k_box = box(82.35, miny, maxx, maxy)
final_geoms["Manendragarh-Chirmiri-Bharatpur"] = make_valid(k_geom.intersection(mcb_box))
final_geoms["Koriya"] = make_valid(k_geom.intersection(k_box))

# 3. Partition Bilaspur -> GPM (North, lat > 22.50) & Bilaspur (South, lat <= 22.50)
b_geom = orig_geoms["Bilaspur"]
minx, miny, maxx, maxy = b_geom.bounds
gpm_box = box(minx, 22.50, maxx, maxy)
bil_box = box(minx, miny, maxx, 22.50)
final_geoms["Gaurela-Pendra-Marwahi"] = make_valid(b_geom.intersection(gpm_box))
final_geoms["Bilaspur"] = make_valid(b_geom.intersection(bil_box))

# 4. Partition Janjgir-Champa -> Sakti (East, lon > 82.80) & Janjgir-Champa (West, lon <= 82.80)
jc_geom = orig_geoms["Janjgir-Champa"]
minx, miny, maxx, maxy = jc_geom.bounds
sakti_box = box(82.80, miny, maxx, maxy)
jc_box = box(minx, miny, 82.80, maxy)
final_geoms["Sakti"] = make_valid(jc_geom.intersection(sakti_box))
final_geoms["Janjgir-Champa"] = make_valid(jc_geom.intersection(jc_box))

# 5. Partition Raigarh -> Sarangarh-Bilaigarh (South, lat < 21.72) & Raigarh (North, lat >= 21.72)
rg_geom = orig_geoms["Raigarh"]
minx, miny, maxx, maxy = rg_geom.bounds
saran_box = box(minx, miny, maxx, 21.72)
rg_box = box(minx, 21.72, maxx, maxy)
final_geoms["Sarangarh-Bilaigarh"] = make_valid(rg_geom.intersection(saran_box))
final_geoms["Raigarh"] = make_valid(rg_geom.intersection(rg_box))

# 6. Partition Rajnandgaon -> Khairagarh (lat >= 21.28), Rajnandgaon (20.85 to 21.28), Mohla-Manpur (lat < 20.85)
raj_geom = orig_geoms["Rajnandgaon"]
minx, miny, maxx, maxy = raj_geom.bounds
kg_box = box(minx, 21.28, maxx, maxy)
raj_box = box(minx, 20.85, maxx, 21.28)
mm_box = box(minx, miny, maxx, 20.85)
final_geoms["Khairagarh-Chhuikhadan-Gandai"] = make_valid(raj_geom.intersection(kg_box))
final_geoms["Rajnandgaon"] = make_valid(raj_geom.intersection(raj_box))
final_geoms["Mohla-Manpur-Ambagarh Chowki"] = make_valid(raj_geom.intersection(mm_box))

print(f"[+] Successfully constructed {len(final_geoms)} distinct district geometries.")

# Build 33-district GeoJSON FeatureCollection
features = []

for dist_name, geom in final_geoms.items():
    data = dist_summary_map.get(dist_name)
    reg_info = get_district(dist_name)

    if not data:
        print(f"[WARN] No summary data found for district: {dist_name}")
        continue

    bounds_xy = geom.bounds  # (minx, miny, maxx, maxy) -> (min_lon, min_lat, max_lon, max_lat)
    centroid_pt = geom.centroid

    # Recommendations list
    recs = []
    if data.get("primary_advisory"):
        recs.append(data["primary_advisory"])
    if data.get("secondary_advisory"):
        recs.append(data["secondary_advisory"])
    if reg_info and reg_info.recommended_interventions:
        for rec in reg_info.recommended_interventions:
            if rec not in recs:
                recs.append(rec)

    props = {
        "Dist_Name": dist_name,
        "name": dist_name,
        "rank": data.get("statewide_priority_rank", 99),
        "zone": data.get("zone", "Central Chhattisgarh Plains"),
        "zone_code": data.get("zone_code", "plains"),
        "predominant_soil": data.get("predominant_soil", "Matasi"),
        "soil_order": data.get("soil_order", "Alfisols"),
        "vernacular_soil": data.get("vernacular_soil", "Matasi"),
        "risk": round(data.get("mean_soc_deficiency", 0.45), 4),
        "max_risk": round(data.get("max_soc_deficiency", 0.75), 4),
        "urgency": data.get("urgency_level", "MODERATE (TIER 2)"),
        "highRisk": round(data.get("high_risk_ha", 0.0), 1),
        "bare": round(data.get("bare_soil_ha", 0.0), 1),
        "total": round(data.get("total_area_ha", 0.0), 1),
        "pct": round(data.get("pct_high_risk", 0.0), 1),
        "soc": round(data.get("mean_soc_dg_kg", 100.0), 1),
        "clay": round(data.get("mean_clay_g_kg", 250.0), 1),
        "ph": round(data.get("mean_ph", 6.5), 2),
        "bsi": round(data.get("mean_bsi", 0.15), 4),
        "primary_advisory": data.get("primary_advisory", ""),
        "secondary_advisory": data.get("secondary_advisory", ""),
        "recommendations": recs[:4],
        "bounds": [
            [round(bounds_xy[1], 5), round(bounds_xy[0], 5)],
            [round(bounds_xy[3], 5), round(bounds_xy[2], 5)]
        ],
        "centroid": [round(centroid_pt.y, 5), round(centroid_pt.x, 5)]
    }

    feature = {
        "type": "Feature",
        "id": dist_name,
        "properties": props,
        "geometry": mapping(geom)
    }
    features.append(feature)

# Sort features by priority rank
features.sort(key=lambda f: f["properties"]["rank"])

output_geojson = {
    "type": "FeatureCollection",
    "crs": {"type": "name", "properties": {"name": "urn:ogc:def:crs:OGC:1.3:CRS84"}},
    "features": features
}

with open(GEOJSON_OUT, "w", encoding="utf-8") as f:
    json.dump(output_geojson, f, indent=2)

out_dir = os.path.join(BASE_DIR, "soilguard-nextjs", "out", "chhattisgarh-districts.geojson")
if os.path.exists(os.path.dirname(out_dir)):
    with open(out_dir, "w", encoding="utf-8") as f:
        json.dump(output_geojson, f, indent=2)

print(f"[SUCCESS] Exported {len(features)} districts to {GEOJSON_OUT} ({os.path.getsize(GEOJSON_OUT)/1024:.1f} KB)")
