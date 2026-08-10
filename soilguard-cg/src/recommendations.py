"""
SoilGuard-SOC: Actionable Regenerative Carbon Recommendation Engine (Phase 4)
Generates site-specific, targeted Soil Organic Carbon (SOC) restoration packages based on
satellite SOC deficiency scores, SoilGrids SOC & Clay content, Bare Soil Index (BSI), and pH.
"""

import pandas as pd

def generate_sector_recommendations(df_zonal):
    """
    Evaluates zonal metrics and attaches tailored agronomic intervention plans.
    """
    rec_list = []

    for _, row in df_zonal.iterrows():
        sector = row['sector_name']
        rank = row['priority_rank']
        soc_def = row['mean_risk_score']  # SOC Deficiency Index (0-1)
        soc = row['mean_soc_dg_kg']  # dg/kg (e.g. 110 dg/kg = 1.1% organic carbon)
        clay = row.get('mean_clay_g_kg', 240.0)  # Clay content in g/kg
        bsi = row['mean_bsi']
        ph = row['mean_ph']

        actions = []
        urgency = "LOW"

        # 1. Carbon & Soil Organic Matter Building (Clay-sensitive FYM & Organic Guidance)
        if soc_def >= 0.58 or soc < 100.0:
            urgency = "CRITICAL (TIER 1)"
            if clay < 250.0:  # Coarse/Light Sandy Soils
                actions.append("Severe SOC Deficit & Low Clay: Apply 10-12 t/ha Farmyard Manure (FYM) or 3-4 t/ha Biochar + Green Manuring (Dhaincha/Sunnhemp) prior to Kharif paddy + 100% crop residue incorporation.")
            else:  # Vertisol / High Clay Soils
                actions.append("Critical Organic Carbon Building: Apply 8-10 t/ha FYM + Zero-Tillage (Happy Seeder/Smart Seeder) + retain 4 t/ha paddy straw to prevent clay compaction & carbon oxidation.")
        elif soc_def >= 0.45 or soc < 130.0:
            urgency = "MODERATE (TIER 2)"
            actions.append("Moderate Carbon Replenishment: Apply 5-6 t/ha FYM + surface mulching (3-4 t/ha paddy straw) + rotate Kharif Paddy with Rabi Legume cover crops (Pigeonpea/Chickpea).")
        else:
            urgency = "STABLE (TIER 3)"
            actions.append("Carbon Maintenance Package: Adopt Integrated Nutrient Management (75% RDF + 25% organic manure) with reduced tillage to preserve topsoil carbon stock.")

        # 2. Topsoil Exposure & Carbon Oxidation Mitigation
        if bsi > 0.25:
            actions.append("Topsoil Exposure & Moisture Shield: Implement minimum tillage, cover cropping, and contour bunding to arrest thermal carbon decomposition.")

        # 3. Soil Reaction Correction for Biological Carbon Fixation
        if ph < 5.8:
            actions.append("Acidic Stress Neutralization: Apply Agricultural Lime @ 2.0-2.5 t/ha to optimize soil pH and stimulate microbial SOC turnover.")
        elif ph > 7.5:
            actions.append("Alkaline Sodic Soil Management: Apply Gypsum @ 2.0 t/ha + green manuring to improve soil structure and microbial carbon immobilization.")

        rec_list.append({
            'priority_rank': rank,
            'sector_name': sector,
            'urgency_level': urgency,
            'mean_risk_score': soc_def,
            'primary_recommendation': actions[0] if actions else "Routine organic monitoring.",
            'secondary_recommendation': actions[1] if len(actions) > 1 else "N/A",
            'full_action_package': " | ".join(actions)
        })

    df_rec = pd.DataFrame(rec_list)
    return df_rec

