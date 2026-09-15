"""
==============================================================================
FastAPI REST Microservice Verification Test Suite
Subsystems: SoilGuard-CG & CloudGap-CG
==============================================================================
Validates:
1. Telemetry and Readiness contracts (/health, /readiness)
2. Benchmark SLA metrics (/api/v1/metrics)
3. 33-District registry queries and zonal filtering (/api/v1/districts)
4. Model inference for bare soil SOC deficiency risk (/api/v1/soc/predict)
5. CloudGap ST-DIP reconstruction simulation (/api/v1/inpainting/reconstruct)
6. Dynamic agronomic dosing & carbon credit math (/api/v1/advisory/calculate)
7. Multi-spectral reflectance profile curves (/api/v1/spectral/profiles)
==============================================================================
"""

import os
import sys
import unittest

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SG_API = os.path.join(PROJECT_ROOT, "soilguard-cg", "api")
for p in (PROJECT_ROOT, SG_API):
    if p not in sys.path:
        sys.path.insert(0, p)

from fastapi.testclient import TestClient
from server import app


class TestFastAPIEndpoints(unittest.TestCase):
    """Test suite for SoilGuard & CloudGap FastAPI microservice."""

    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_01_health_check(self):
        resp = self.client.get("/health")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["status"], "healthy")
        self.assertEqual(data["version"], "2.5.0-ISRO-Production")
        self.assertTrue(data["model_loaded"])

    def test_02_readiness_check(self):
        resp = self.client.get("/readiness")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertTrue(data["ready"])
        self.assertEqual(data["districts_registered"], 33)
        self.assertTrue(data["model_available"])

    def test_03_benchmark_metrics(self):
        resp = self.client.get("/api/v1/metrics")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertAlmostEqual(data["inpainting_psnr_db"], 34.56, places=2)
        self.assertAlmostEqual(data["inpainting_ssim"], 0.9728, places=4)
        self.assertAlmostEqual(data["inpainting_sam_deg"], 2.262, places=3)
        self.assertAlmostEqual(data["sbcv_r2"], 0.4076, places=4)
        self.assertAlmostEqual(data["random_split_r2"], 0.5307, places=4)
        self.assertEqual(data["districts_covered"], 33)

    def test_04_list_all_33_districts(self):
        resp = self.client.get("/api/v1/districts")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(len(data), 33, f"Expected 33 districts, found {len(data)}")
        first = data[0]
        self.assertIn("name", first)
        self.assertIn("zone", first)
        self.assertIn("vernacular_soil", first)
        self.assertIn("baseline_soc_pct", first)
        self.assertIn("priority_rank", first)

    def test_05_zone_filtering(self):
        resp = self.client.get("/api/v1/districts?zone=Northern+Hills")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(len(data), 7, f"Expected 7 Northern Hills districts, got {len(data)}")
        for d in data:
            self.assertIn("Northern Hills", d["zone"])

        resp_plateau = self.client.get("/api/v1/districts?zone=Bastar")
        self.assertEqual(resp_plateau.status_code, 200)
        data_p = resp_plateau.json()
        self.assertEqual(len(data_p), 7, f"Expected 7 Bastar Plateau districts, got {len(data_p)}")

    def test_06_get_district_detail_valid(self):
        for d_name in ["Raipur", "Durg", "Bastar", "Surguja"]:
            resp = self.client.get(f"/api/v1/districts/{d_name}")
            self.assertEqual(resp.status_code, 200)
            data = resp.json()
            self.assertEqual(data["name"].lower(), d_name.lower())
            self.assertGreater(data["baseline_soc_pct"], 0.1)

    def test_07_get_district_detail_not_found(self):
        resp = self.client.get("/api/v1/districts/Atlantis")
        self.assertEqual(resp.status_code, 404)
        self.assertIn("not found", resp.json()["detail"].lower())

    def test_08_soc_prediction_bare_soil(self):
        payload = {
            "blue": 1050.0,
            "green": 1200.0,
            "red": 1450.0,
            "nir": 1850.0,
            "swir1": 2400.0,
            "swir2": 1900.0,
            "district": "Raipur",
        }
        resp = self.client.post("/api/v1/soc/predict", json=payload)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertTrue(data["is_bare_soil"])
        self.assertGreaterEqual(data["soc_deficiency_score"], 0.0)
        self.assertLessEqual(data["soc_deficiency_score"], 1.0)
        self.assertIn(data["risk_category"], ["CRITICAL", "HIGH", "MODERATE", "STABLE"])
        self.assertGreater(len(data["actionable_advisory"]), 0)

    def test_09_soc_prediction_dense_vegetation(self):
        payload = {
            "blue": 250.0,
            "green": 550.0,
            "red": 320.0,
            "nir": 4800.0,
            "swir1": 1500.0,
        }
        resp = self.client.post("/api/v1/soc/predict", json=payload)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        # High NDVI (> 0.8) should NOT be classified as bare soil
        self.assertFalse(data["is_bare_soil"])
        self.assertGreater(data["ndvi"], 0.6)

    def test_10_cloudgap_inpainting_reconstruction(self):
        payload = {
            "scene_id": "Raipur-Kharif-2024",
            "cloud_fraction_pct": 74.5,
            "sar_vv_db": -12.5,
            "sar_vh_db": -18.2,
        }
        resp = self.client.post("/api/v1/inpainting/reconstruct", json=payload)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["status"], "RECONSTRUCTED_SUCCESS")
        self.assertGreater(data["cloud_removed_ha"], 10000.0)
        self.assertGreater(data["agricultural_land_recovered_ha"], 5000.0)
        self.assertEqual(len(data["reconstructed_bands"]), 5)

    def test_11_advisory_calculation(self):
        payload = {
            "district": "Raipur",
            "soil_order": "Kanhar",
            "farm_area_ha": 25.0,
            "current_soc_pct": 0.55,
            "target_soc_pct": 0.90,
        }
        resp = self.client.post("/api/v1/advisory/calculate", json=payload)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["district"], "Raipur")
        self.assertGreater(data["fym_tonnes"], 100.0)
        self.assertGreater(data["green_manure_seed_kg"], 500.0)
        self.assertGreater(data["co2_sequestration_5yr_tonnes"], 100.0)
        self.assertIn("Sesbania", data["green_manure_crop"])

    def test_12_spectral_profiles(self):
        resp = self.client.get("/api/v1/spectral/profiles")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(len(data["spectral_bands"]), 6)
        self.assertIn("Kanhar_Vertisol", data["profiles"])
        self.assertIn("Matasi_Alfisol", data["profiles"])
        self.assertIn("Bhata_Entisol", data["profiles"])

    def test_13_zones_summary(self):
        resp = self.client.get("/api/v1/zones/summary")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(len(data), 3)
        codes = [z["zone_code"] for z in data]
        self.assertIn("plains", codes)
        self.assertIn("hills", codes)
        self.assertIn("plateau", codes)

    def test_14_negative_dn_reflectance_overcorrection(self):
        # Atmospheric overcorrection can produce negative DN values (e.g. in shadow/blue band)
        payload = {
            "blue": -50.0,
            "green": 1200.0,
            "red": 1450.0,
            "nir": 1850.0,
            "swir1": 2400.0,
        }
        resp = self.client.post("/api/v1/soc/predict", json=payload)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertTrue(data["is_bare_soil"])
        self.assertGreaterEqual(data["soc_deficiency_score"], 0.0)
        self.assertLessEqual(data["soc_deficiency_score"], 1.0)

    def test_15_advisory_invalid_district_404(self):
        payload = {
            "district": "UnknownDistrictX",
            "farm_area_ha": 10.0,
        }
        resp = self.client.post("/api/v1/advisory/calculate", json=payload)
        self.assertEqual(resp.status_code, 404)
        self.assertIn("not recognized", resp.json()["detail"].lower())

    def test_16_district_standard_advisory_endpoint(self):
        resp = self.client.get("/api/v1/districts/Bastar/advisory?farm_area_ha=15.0")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["district"].lower(), "bastar")
        self.assertIn("Bastar", data["zone"])
        self.assertGreater(data["fym_tonnes"], 100.0)

    def test_17_spectral_profile_soil_filtering(self):
        resp = self.client.get("/api/v1/spectral/profiles/kanhar")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["soil_key"], "Kanhar_Vertisol")
        self.assertEqual(len(data["soil_profile"]["ground_truth"]), 6)

        # Invalid soil key -> 404
        resp_404 = self.client.get("/api/v1/spectral/profiles/martian_regolith")
        self.assertEqual(resp_404.status_code, 404)

    def test_18_active_model_name_reported(self):
        resp = self.client.get("/health")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertTrue(data["model_loaded"])
        self.assertIsNotNone(data["active_model"])
        self.assertIn("soil_soc_rf", data["active_model"].lower())

    def test_19_prediction_district_context(self):
        payload = {
            "blue": 1050.0,
            "green": 1200.0,
            "red": 1450.0,
            "nir": 1850.0,
            "swir1": 2400.0,
            "district": "Bastar",
        }
        resp = self.client.post("/api/v1/soc/predict", json=payload)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIsNotNone(data["district_context"])
        self.assertIn("Bastar", data["district_context"])
        # Should include localized package advisory
        advisories_text = " ".join(data["actionable_advisory"])
        self.assertIn("Bastar", advisories_text)


if __name__ == "__main__":
    unittest.main(verbosity=2)

