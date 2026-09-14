"""
SoilGuard-SOC: Automated Test Runner for Chhattisgarh Statewide Scaling
========================================================================
Comprehensive automated test suite validating:
  1. All 33 districts of Chhattisgarh are properly indexed with valid
     bounding boxes, centroids, and pedological classifications.
  2. The scaling pipeline executes smoothly across all 3 official Agro-Climatic
     Zones (Northern Hills, Central Plains, Bastar Plateau) without memory overflow.
  3. Generated statewide summary CSV and JSON deliverables contain mathematically
     sound values strictly bounded within their domain ranges (e.g. [0.0, 1.0]).
  4. Localized regenerative agronomic recommendations align with each district's
     indigenous soil order (Kanhar, Dorsa, Matasi, Bhata).
"""

from __future__ import annotations

import json
import os
import sys
import time
import unittest

# Ensure src and project root are importable
_TEST_DIR = os.path.dirname(os.path.abspath(__file__))
_SRC_DIR = os.path.join(_TEST_DIR, "src")
for _p in (_TEST_DIR, _SRC_DIR):
    if _p not in sys.path:
        sys.path.insert(0, _p)

import numpy as np
import pandas as pd

from src.chhattisgarh_geography import (
    AgroClimaticZone,
    DistrictInfo,
    SoilOrder,
    VernacularSoil,
    get_all_districts,
    get_district,
    get_district_count,
    get_districts_by_zone,
    get_zone_summary,
    validate_geographic_database
)
from src.config import (
    GOLDEN_S2_PATH,
    GOLDEN_SOIL_PATH,
    HIGH_RISK_CUTOFF,
    LOW_RISK_CUTOFF,
    MODEL_SAVE_PATH,
    STATEWIDE_OUTPUT_DIR
)
from src.scale_chhattisgarh import (
    extract_window_spectral_features,
    generate_district_agronomic_advisory,
    generate_raster_windows,
    load_or_generate_district_stack,
    main as cli_main,
    process_district,
    run_statewide_pipeline
)


class TestChhattisgarhGeography(unittest.TestCase):
    """Verifies geographic and pedological database integrity for all 33 districts."""

    def test_all_33_districts_indexed(self):
        districts = get_all_districts()
        self.assertEqual(len(districts), 33, f"Expected 33 districts, got {len(districts)}")
        self.assertEqual(get_district_count(), 33)

        # Check uniqueness of names
        names = [d.name for d in districts]
        self.assertEqual(len(names), len(set(names)), "Duplicate district names detected")

    def test_database_validation_routine(self):
        is_valid = validate_geographic_database()
        self.assertTrue(is_valid, "Database validation routine failed")

    def test_agro_climatic_zone_distribution(self):
        hills = get_districts_by_zone("hills")
        plains = get_districts_by_zone("plains")
        plateau = get_districts_by_zone("plateau")

        self.assertEqual(len(hills), 7, f"Expected 7 districts in Northern Hills, got {len(hills)}")
        self.assertEqual(len(plains), 19, f"Expected 19 districts in Central Plains, got {len(plains)}")
        self.assertEqual(len(plateau), 7, f"Expected 7 districts in Bastar Plateau, got {len(plateau)}")

        # Total matches 33
        self.assertEqual(len(hills) + len(plains) + len(plateau), 33)

        # 'all' matches all 33
        all_dists = get_districts_by_zone("all")
        self.assertEqual(len(all_dists), 33)

    def test_bounding_boxes_and_centroids(self):
        # Chhattisgarh state geographic envelope: Lon [80.0, 84.8], Lat [17.5, 24.5]
        for d in get_all_districts():
            min_lon, min_lat, max_lon, max_lat = d.bbox_wgs84
            c_lon, c_lat = d.centroid

            self.assertLess(min_lon, max_lon, f"{d.name}: min_lon must be < max_lon")
            self.assertLess(min_lat, max_lat, f"{d.name}: min_lat must be < max_lat")

            self.assertTrue(80.0 <= min_lon <= 84.8, f"{d.name}: min_lon {min_lon} out of CG bounds")
            self.assertTrue(80.0 <= max_lon <= 84.8, f"{d.name}: max_lon {max_lon} out of CG bounds")
            self.assertTrue(17.5 <= min_lat <= 24.5, f"{d.name}: min_lat {min_lat} out of CG bounds")
            self.assertTrue(17.5 <= max_lat <= 24.5, f"{d.name}: max_lat {max_lat} out of CG bounds")

            # Centroid strictly inside bounding box
            self.assertTrue(min_lon <= c_lon <= max_lon, f"{d.name}: centroid lon {c_lon} outside bbox")
            self.assertTrue(min_lat <= c_lat <= max_lat, f"{d.name}: centroid lat {c_lat} outside bbox")

            # Area must be reasonable
            self.assertGreater(d.approx_area_ha, 50000.0, f"{d.name}: area unexpectedly low")
            self.assertLess(d.approx_area_ha, 1500000.0, f"{d.name}: area unexpectedly high")

    def test_pedological_properties(self):
        valid_orders = {SoilOrder.VERTISOLS, SoilOrder.INCEPTISOLS, SoilOrder.ALFISOLS, SoilOrder.ENTISOLS}
        valid_vernacular = {VernacularSoil.KANHAR, VernacularSoil.DORSA, VernacularSoil.MATASI, VernacularSoil.BHATA}

        for d in get_all_districts():
            self.assertIn(d.soil_order, valid_orders, f"{d.name}: invalid soil order")
            self.assertIn(d.vernacular_soil, valid_vernacular, f"{d.name}: invalid vernacular soil")

            self.assertTrue(50.0 <= d.baseline_soc_dg_kg <= 180.0, f"{d.name}: baseline SOC out of range")
            self.assertTrue(100.0 <= d.baseline_clay_g_kg <= 550.0, f"{d.name}: baseline clay out of range")
            self.assertTrue(4.5 <= d.baseline_ph <= 8.5, f"{d.name}: baseline pH out of range")
            self.assertTrue(0.0 <= d.soc_vulnerability_index <= 1.0, f"{d.name}: vulnerability out of range")
            self.assertGreater(len(d.recommended_interventions), 0, f"{d.name}: interventions list empty")

    def test_alias_resolution(self):
        test_cases = [
            ("Raipur", "Raipur"),
            ("raipur", "Raipur"),
            ("RAIPUR", "Raipur"),
            ("kawardha", "Kabirdham"),
            ("Kawardha", "Kabirdham"),
            ("gpm", "Gaurela-Pendra-Marwahi"),
            ("pendra", "Gaurela-Pendra-Marwahi"),
            ("mcb", "Manendragarh-Chirmiri-Bharatpur"),
            ("manendragarh", "Manendragarh-Chirmiri-Bharatpur"),
            ("jagdalpur", "Bastar"),
            ("ambikapur", "Surguja"),
            ("bemetra", "Bemetara"),
            ("uttar bastar", "Kanker"),
            ("dakshin bastar", "Dantewada"),
            ("durg", "Durg")
        ]
        for query, expected_name in test_cases:
            res = get_district(query)
            self.assertIsNotNone(res, f"Failed to resolve alias '{query}'")
            self.assertEqual(res.name, expected_name, f"Query '{query}' resolved to '{res.name}', expected '{expected_name}'")


class TestStatewideScalingEngine(unittest.TestCase):
    """Validates the execution, memory efficiency, and sound mathematical bounds of the scaling engine."""

    def test_synthetic_stack_generator(self):
        d_bastar = get_district("Bastar")
        stack = load_or_generate_district_stack(d_bastar, grid_shape=(128, 128), use_golden_for_raipur=False)

        self.assertEqual(stack['grid_shape'], (128, 128))
        self.assertIn('blue', stack['s2_bands'])
        self.assertIn('red', stack['s2_bands'])
        self.assertIn('nir', stack['s2_bands'])
        self.assertIn('swir1', stack['s2_bands'])
        self.assertIn('soc', stack['soil_bands'])
        self.assertIn('clay', stack['soil_bands'])
        self.assertIn('ph', stack['soil_bands'])

        # Values must be physically plausible
        self.assertTrue(np.all(stack['s2_bands']['blue'] >= 0))
        self.assertTrue(np.all(stack['s2_bands']['nir'] >= 0))
        self.assertTrue(np.all(stack['soil_bands']['soc'] > 0))
        self.assertTrue(np.all(stack['soil_bands']['clay'] > 0))
        self.assertTrue(np.all(stack['soil_bands']['ph'] > 0))

    def test_windowed_raster_memory_safety(self):
        # Generate windows over a large virtual grid (1024 x 1024)
        windows = list(generate_raster_windows(1024, 1024, window_size=256))
        self.assertEqual(len(windows), 16, "Expected 16 windows for 1024x1024 with 256 chunk size")

        # Verify windows tile the entire area without gaps or overlaps
        covered_pixels = sum((r1 - r0) * (c1 - c0) for (r0, r1, c0, c1) in windows)
        self.assertEqual(covered_pixels, 1024 * 1024)

    def test_single_district_execution_raipur(self):
        d_raipur = get_district("Raipur")
        res = process_district(d_raipur, window_size=256)

        self.assertEqual(res['district_name'], "Raipur")
        self.assertEqual(res['zone_code'], "plains")
        self.assertEqual(res['vernacular_soil'], "Kanhar")

        # Mathematical bounds checks
        self.assertTrue(0.0 <= res['mean_soc_deficiency'] <= 1.0, f"Mean risk {res['mean_soc_deficiency']} out of [0, 1]")
        self.assertTrue(0.0 <= res['max_soc_deficiency'] <= 1.0, f"Max risk {res['max_soc_deficiency']} out of [0, 1]")
        self.assertTrue(0.0 <= res['pct_high_risk'] <= 100.0, f"Pct high risk {res['pct_high_risk']} out of [0, 100]")
        self.assertTrue(0.0 <= res['bare_soil_ha'] <= res['total_area_ha'])
        self.assertTrue(0.0 <= res['high_risk_ha'] <= res['bare_soil_ha'] + 1.0)

        # Soils
        self.assertTrue(50.0 <= res['mean_soc_dg_kg'] <= 200.0)
        self.assertTrue(100.0 <= res['mean_clay_g_kg'] <= 550.0)
        self.assertTrue(4.5 <= res['mean_ph'] <= 8.5)

    def test_execution_all_three_zones(self):
        for zone_key in ("hills", "plains", "plateau"):
            dists = get_districts_by_zone(zone_key)
            self.assertGreater(len(dists), 0)

            # Process first 2 districts in each zone
            for dist in dists[:2]:
                res = process_district(dist, grid_shape=(128, 128), window_size=128)
                self.assertIsNotNone(res)
                self.assertTrue(0.0 <= res['mean_soc_deficiency'] <= 1.0)
                self.assertIn(res['urgency_level'], ["CRITICAL (TIER 1)", "MODERATE (TIER 2)", "STABLE (TIER 3)"])

    def test_statewide_batch_execution_and_deliverables(self):
        # Run statewide pipeline across all 33 districts
        output_dir = os.path.join(_TEST_DIR, "outputs", "test_statewide")
        df_summary, json_summary = run_statewide_pipeline(
            districts=get_all_districts(),
            output_dir=output_dir,
            window_size=256,
            grid_shape=(128, 128),
            verbose=False
        )

        # Check DataFrame
        self.assertEqual(len(df_summary), 33, f"Expected 33 rows in summary DataFrame, got {len(df_summary)}")
        self.assertEqual(df_summary['statewide_priority_rank'].tolist(), list(range(1, 34)))

        # Invariant checks across all 33 districts
        self.assertTrue((df_summary['mean_soc_deficiency'] >= 0.0).all())
        self.assertTrue((df_summary['mean_soc_deficiency'] <= 1.0).all())
        self.assertTrue((df_summary['pct_high_risk'] >= 0.0).all())
        self.assertTrue((df_summary['pct_high_risk'] <= 100.0).all())
        self.assertTrue((df_summary['bare_soil_ha'] >= 0.0).all())
        self.assertTrue((df_summary['bare_soil_ha'] <= df_summary['total_area_ha']).all())

        # Check CSV output
        csv_file = os.path.join(output_dir, "chhattisgarh_statewide_summary.csv")
        self.assertTrue(os.path.exists(csv_file), f"CSV not found: {csv_file}")
        df_disk = pd.read_csv(csv_file)
        self.assertEqual(len(df_disk), 33)

        # Check JSON output
        json_file = os.path.join(output_dir, "chhattisgarh_statewide_summary.json")
        self.assertTrue(os.path.exists(json_file), f"JSON not found: {json_file}")
        with open(json_file, "r", encoding="utf-8") as f:
            data = json.load(f)

        self.assertIn("metadata", data)
        self.assertIn("statewide_aggregates", data)
        self.assertIn("agro_climatic_zones", data)
        self.assertIn("districts", data)
        self.assertEqual(len(data['districts']), 33)

        # Check Zone Aggregates
        zones = data['agro_climatic_zones']
        self.assertIn("hills", zones)
        self.assertIn("plains", zones)
        self.assertIn("plateau", zones)
        self.assertEqual(zones['hills']['district_count'], 7)
        self.assertEqual(zones['plains']['district_count'], 19)
        self.assertEqual(zones['plateau']['district_count'], 7)

        statewide_risk = data['statewide_aggregates']['statewide_mean_soc_deficiency']
        self.assertTrue(0.0 <= statewide_risk <= 1.0)

    def test_localized_agronomic_advisory_rules(self):
        # 1. Test Vertisol (Kanhar - e.g. Durg / Raipur)
        d_durg = get_district("Durg")
        adv_vertisol = generate_district_agronomic_advisory(
            district=d_durg,
            mean_risk_score=0.62,
            mean_soc=95.0,
            mean_clay=420.0,
            mean_ph=7.4,
            pct_high_risk=40.0
        )
        self.assertIn("Happy Seeder", adv_vertisol['primary_recommendation'])
        self.assertIn("Gypsum", adv_vertisol['full_action_package'])

        # 2. Test Entisol (Bhata - e.g. Sukma / Dantewada in Bastar)
        d_sukma = get_district("Sukma")
        adv_entisol = generate_district_agronomic_advisory(
            district=d_sukma,
            mean_risk_score=0.68,
            mean_soc=80.0,
            mean_clay=150.0,
            mean_ph=5.1,
            pct_high_risk=50.0
        )
        self.assertIn("Biochar", adv_entisol['primary_recommendation'])
        self.assertIn("Lime", adv_entisol['full_action_package'])
        self.assertIn("bunding", adv_entisol['full_action_package'])

        # 3. Test Inceptisol (Dorsa - e.g. Bilaspur / Janjgir)
        d_bilaspur = get_district("Bilaspur")
        adv_inceptisol = generate_district_agronomic_advisory(
            district=d_bilaspur,
            mean_risk_score=0.48,
            mean_soc=108.0,
            mean_clay=310.0,
            mean_ph=6.9,
            pct_high_risk=10.0
        )
        self.assertIn("reduced tillage", adv_inceptisol['primary_recommendation'].lower())

    def test_bastar_red_soil_advisory_package(self):
        """Verifies Bastar red soils (Alfisols/Entisols) explicitly receive FYM, Biochar, and contour bunding."""
        d_bastar = get_district("Bastar")
        for risk, pct in [(0.65, 40.0), (0.46, 12.0), (0.35, 2.0)]:
            adv = generate_district_agronomic_advisory(
                district=d_bastar,
                mean_risk_score=risk,
                mean_soc=90.0,
                mean_clay=180.0,
                mean_ph=5.5,
                pct_high_risk=pct
            )
            full_text = adv['full_action_package']
            self.assertIn("FYM", full_text)
            self.assertIn("Biochar", full_text)
            self.assertIn("contour bunding", full_text.lower())

    def test_central_plains_vertisol_advisory_package(self):
        """Verifies Central Plains clay Vertisols receive Green Manuring, Gypsum, and reduced/zero tillage."""
        d_raipur = get_district("Raipur")
        for risk, pct in [(0.62, 38.0), (0.49, 15.0)]:
            adv = generate_district_agronomic_advisory(
                district=d_raipur,
                mean_risk_score=risk,
                mean_soc=105.0,
                mean_clay=390.0,
                mean_ph=7.2,
                pct_high_risk=pct
            )
            full_text = adv['full_action_package']
            self.assertIn("Gypsum", full_text)
            self.assertTrue("Green Manuring" in full_text or "Dhaincha" in full_text)
            self.assertTrue("tillage" in full_text.lower() or "seeder" in full_text.lower())

    def test_all_33_districts_advisory_generation(self):
        """Verifies advisory generation executes without errors for all 33 districts."""
        all_dists = get_all_districts()
        self.assertEqual(len(all_dists), 33)
        valid_urgencies = {"CRITICAL (TIER 1)", "MODERATE (TIER 2)", "STABLE (TIER 3)"}

        for dist in all_dists:
            adv = generate_district_agronomic_advisory(
                district=dist,
                mean_risk_score=dist.soc_vulnerability_index,
                mean_soc=dist.baseline_soc_dg_kg,
                mean_clay=dist.baseline_clay_g_kg,
                mean_ph=dist.baseline_ph,
                pct_high_risk=20.0
            )
            self.assertIn(adv['urgency_level'], valid_urgencies)
            self.assertTrue(len(adv['primary_recommendation']) > 15)
            self.assertTrue(len(adv['secondary_recommendation']) > 10)
            self.assertTrue(len(adv['full_action_package']) > 30)

    def test_zero_bare_soil_edge_case(self):
        """Verifies graceful handling when zero bare soil pixels are detected."""
        d_kanker = get_district("Kanker")
        # Generate all-water stack where NIR < 300 so bare soil mask is 100% False
        rows, cols = 64, 64
        s2_bands = {
            'blue': np.full((rows, cols), 1000.0, dtype=np.float32),
            'red': np.full((rows, cols), 300.0, dtype=np.float32),
            'nir': np.full((rows, cols), 150.0, dtype=np.float32),   # Under water threshold (300.0)
            'swir1': np.full((rows, cols), 100.0, dtype=np.float32)
        }
        soil_bands = {
            'soc': np.full((rows, cols), 95.0, dtype=np.float32),
            'clay': np.full((rows, cols), 220.0, dtype=np.float32),
            'ph': np.full((rows, cols), 6.0, dtype=np.float32)
        }

        # Mock load_or_generate_district_stack
        import unittest.mock as mock
        with mock.patch('src.scale_chhattisgarh.load_or_generate_district_stack', return_value={
            's2_bands': s2_bands,
            'soil_bands': soil_bands,
            'source': 'test_mock_water',
            'grid_shape': (rows, cols)
        }):
            res = process_district(d_kanker, grid_shape=(rows, cols), window_size=64)
            self.assertEqual(res['bare_soil_ha'], 0.0)
            self.assertEqual(res['pct_high_risk'], 0.0)
            self.assertGreaterEqual(res['max_soc_deficiency'], res['mean_soc_deficiency'])
            self.assertEqual(res['mean_soc_deficiency'], d_kanker.soc_vulnerability_index)

    def test_missing_model_fallback(self):
        """Verifies that process_district falls back cleanly to analytical target proxy when RF model is missing."""
        d_jashpur = get_district("Jashpur")
        res = process_district(
            district=d_jashpur,
            rf_model=None,
            grid_shape=(64, 64),
            window_size=64,
            use_golden_for_raipur=False
        )
        self.assertIsNotNone(res)
        self.assertTrue(0.0 <= res['mean_soc_deficiency'] <= 1.0)
        self.assertTrue(0.0 <= res['max_soc_deficiency'] <= 1.0)

    def test_single_district_deliverables_and_nondestructive_upsert(self):
        """Verifies dedicated single district files are created and existing statewide tables are non-destructively upserted."""
        output_dir = os.path.join(_TEST_DIR, "outputs", "test_upsert")
        os.makedirs(output_dir, exist_ok=True)

        # 1. Run for small batch of 3 districts
        dists = [get_district("Raipur"), get_district("Durg"), get_district("Bastar")]
        df_init, json_init = run_statewide_pipeline(
            districts=dists,
            output_dir=output_dir,
            grid_shape=(64, 64),
            use_golden_for_raipur=False,
            verbose=False
        )
        csv_path = os.path.join(output_dir, "chhattisgarh_statewide_summary.csv")
        self.assertTrue(os.path.exists(csv_path))
        df_read = pd.read_csv(csv_path)
        self.assertEqual(len(df_read), 3)

        # 2. Run single district pipeline for Bastar
        df_single, _ = run_statewide_pipeline(
            districts=[get_district("Bastar")],
            output_dir=output_dir,
            grid_shape=(64, 64),
            use_golden_for_raipur=False,
            verbose=False
        )
        # Dedicated district files exist
        self.assertTrue(os.path.exists(os.path.join(output_dir, "district_bastar_summary.csv")))
        self.assertTrue(os.path.exists(os.path.join(output_dir, "district_bastar_summary.json")))
        self.assertTrue(os.path.exists(os.path.join(output_dir, "districts", "bastar.json")))

        # Statewide CSV was non-destructively updated and still contains 3 districts
        df_updated = pd.read_csv(csv_path)
        self.assertEqual(len(df_updated), 3)
        self.assertIn("Bastar", df_updated['district_name'].values)

    def test_zone_summary_metadata(self):
        """Verifies get_zone_summary outputs valid metadata across all 3 zones."""
        summary = get_zone_summary()
        self.assertIn("hills", summary)
        self.assertIn("plains", summary)
        self.assertIn("plateau", summary)
        self.assertEqual(summary['hills']['district_count'], 7)
        self.assertEqual(summary['plains']['district_count'], 19)
        self.assertEqual(summary['plateau']['district_count'], 7)
        for z_code in ("hills", "plains", "plateau"):
            self.assertGreater(summary[z_code]['total_area_ha'], 1000000.0)
            self.assertTrue(50.0 <= summary[z_code]['mean_baseline_soc'] <= 150.0)

    def test_cli_execution(self):
        """Verifies CLI entrypoints execute cleanly with programmatic arguments."""
        output_dir = os.path.join(_TEST_DIR, "outputs", "test_cli")
        os.makedirs(output_dir, exist_ok=True)

        # CLI: Single district
        code = cli_main(["--district", "Bastar", "--output-dir", output_dir, "--grid-size", "64", "--synthetic-only", "--quiet"])
        self.assertEqual(code, 0)
        self.assertTrue(os.path.exists(os.path.join(output_dir, "district_bastar_summary.csv")))

        # CLI: Zone
        code_zone = cli_main(["--zone", "plateau", "--output-dir", output_dir, "--grid-size", "64", "--synthetic-only", "--quiet"])
        self.assertEqual(code_zone, 0)
        self.assertTrue(os.path.exists(os.path.join(output_dir, "zone_plateau_summary.csv")))

        # CLI: Invalid district
        code_invalid = cli_main(["--district", "AtlantisNonExistent", "--output-dir", output_dir, "--quiet"])
        self.assertEqual(code_invalid, 1)


def run_full_suite() -> bool:
    """Executes the test suite and returns True if 100% tests pass."""
    loader = unittest.TestLoader()
    suite = unittest.TestSuite()
    suite.addTests(loader.loadTestsFromTestCase(TestChhattisgarhGeography))
    suite.addTests(loader.loadTestsFromTestCase(TestStatewideScalingEngine))

    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    return result.wasSuccessful()


if __name__ == "__main__":
    success = run_full_suite()
    sys.exit(0 if success else 1)

