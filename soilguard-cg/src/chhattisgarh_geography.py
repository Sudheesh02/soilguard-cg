"""
SoilGuard-SOC: Geographic & Pedological Database for Chhattisgarh State
========================================================================
Comprehensive geographic, pedological, and agro-climatic registry for all 33 districts
of Chhattisgarh categorized across the 3 official Agro-Climatic Zones:
  1. Northern Hills Zone (7 districts: Surguja, Jashpur, Koriya, Balrampur-Ramanujganj,
     Surajpur, Manendragarh-Chirmiri-Bharatpur, Gaurela-Pendra-Marwahi)
  2. Central Chhattisgarh Plains (19 districts: Raipur, Durg, Bilaspur, Bemetara, Balod,
     Baloda Bazar-Bhatapara, Janjgir-Champa, Sakti, Mahasamund, Dhamtari, Rajnandgaon,
     Mohla-Manpur-Ambagarh Chowki, Khairagarh-Chhuikhadan-Gandai, Mungeli, Gariaband,
     Korba, Raigarh, Sarangarh-Bilaigarh, Kabirdham)
  3. Bastar Plateau / Southern Zone (7 districts: Bastar, Dantewada, Kanker, Kondagaon,
     Sukma, Bijapur, Narayanpur)

Total Districts: 33

Pedological Schema:
  - Vernacular Soil Types: Kanhar (Vertisols), Dorsa (Inceptisols), Matasi (Alfisols), Bhata (Entisols)
  - WGS84 Bounding Boxes [min_lon, min_lat, max_lon, max_lat]
  - Centroid Coordinates (lon, lat)
  - Baseline Soil Organic Carbon (SOC in dg/kg), Clay content (g/kg), pH, and Vulnerability Index
"""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
import re
from typing import Dict, List, Optional, Tuple


class AgroClimaticZone(str, Enum):
    NORTHERN_HILLS = "Northern Hills Zone"
    CENTRAL_PLAINS = "Central Chhattisgarh Plains"
    BASTAR_PLATEAU = "Bastar Plateau / Southern Zone"


class SoilOrder(str, Enum):
    VERTISOLS = "Vertisols"
    INCEPTISOLS = "Inceptisols"
    ALFISOLS = "Alfisols"
    ENTISOLS = "Entisols"


class VernacularSoil(str, Enum):
    KANHAR = "Kanhar"  # Deep black clay (Vertisol)
    DORSA = "Dorsa"    # Medium brown loam / clay-loam (Inceptisol)
    MATASI = "Matasi"  # Yellowish sandy loam (Alfisol)
    BHATA = "Bhata"    # Gravelly red barren/upland soil (Entisol)


@dataclass(frozen=True)
class DistrictInfo:
    """Canonical registry entry for an administrative district in Chhattisgarh."""
    name: str
    zone: AgroClimaticZone
    zone_code: str  # 'hills', 'plains', 'plateau'
    bbox_wgs84: Tuple[float, float, float, float]  # [min_lon, min_lat, max_lon, max_lat]
    centroid: Tuple[float, float]                  # (lon, lat)
    predominant_soil: str                          # Full descriptive name
    soil_order: SoilOrder
    vernacular_soil: VernacularSoil
    baseline_soc_dg_kg: float                      # Soil Organic Carbon in dg/kg (e.g. 100 dg/kg = 1.0% SOC)
    baseline_clay_g_kg: float                      # Clay content in g/kg (e.g. 380 g/kg = 38% clay)
    baseline_ph: float                             # Soil pH (H2O)
    soc_vulnerability_index: float                 # Prior baseline vulnerability [0.0 - 1.0]
    topsoil_threat: str                            # Key risk factor
    recommended_interventions: List[str]          # Targeted agronomic interventions
    approx_area_ha: float                          # Geographic footprint in hectares
    aliases: List[str] = field(default_factory=list)

    @property
    def min_lon(self) -> float:
        return self.bbox_wgs84[0]

    @property
    def min_lat(self) -> float:
        return self.bbox_wgs84[1]

    @property
    def max_lon(self) -> float:
        return self.bbox_wgs84[2]

    @property
    def max_lat(self) -> float:
        return self.bbox_wgs84[3]

    def to_dict(self) -> Dict:
        return {
            "name": self.name,
            "zone": self.zone.value,
            "zone_code": self.zone_code,
            "bbox_wgs84": list(self.bbox_wgs84),
            "centroid": list(self.centroid),
            "predominant_soil": self.predominant_soil,
            "soil_order": self.soil_order.value,
            "vernacular_soil": self.vernacular_soil.value,
            "baseline_soc_dg_kg": self.baseline_soc_dg_kg,
            "baseline_clay_g_kg": self.baseline_clay_g_kg,
            "baseline_ph": self.baseline_ph,
            "soc_vulnerability_index": self.soc_vulnerability_index,
            "topsoil_threat": self.topsoil_threat,
            "recommended_interventions": list(self.recommended_interventions),
            "approx_area_ha": self.approx_area_ha,
            "aliases": list(self.aliases)
        }


# ==============================================================================
# AUTHORITATIVE 33 DISTRICTS OF CHHATTISGARH STATE
# ==============================================================================

DISTRICTS_DATA: List[DistrictInfo] = [
    # --------------------------------------------------------------------------
    # ZONE 1: NORTHERN HILLS ZONE (7 Districts)
    # --------------------------------------------------------------------------
    DistrictInfo(
        name="Surguja",
        zone=AgroClimaticZone.NORTHERN_HILLS,
        zone_code="hills",
        bbox_wgs84=(82.65, 22.58, 83.80, 23.45),
        centroid=(83.20, 23.05),
        predominant_soil="Matasi (Sandy Loam Alfisols) & Bhata (Entisols)",
        soil_order=SoilOrder.ALFISOLS,
        vernacular_soil=VernacularSoil.MATASI,
        baseline_soc_dg_kg=94.0,
        baseline_clay_g_kg=195.0,
        baseline_ph=5.6,
        soc_vulnerability_index=0.58,
        topsoil_threat="Hilly slope runoff, forest clearing margins, high seasonal temperature oxidation",
        recommended_interventions=[
            "Apply 10-12 t/ha FYM or 3-4 t/ha Biochar prior to Kharif paddy",
            "Green manuring (Sunnhemp) to arrest nitrogen leaching",
            "Contour bunding to retard topsoil slope displacement",
            "Agricultural Lime @ 1.5 t/ha to neutralize acidic stress (pH < 5.8)"
        ],
        approx_area_ha=573200.0,
        aliases=["surguja", "ambikapur", "surguja district"]
    ),
    DistrictInfo(
        name="Jashpur",
        zone=AgroClimaticZone.NORTHERN_HILLS,
        zone_code="hills",
        bbox_wgs84=(83.50, 22.28, 84.40, 23.25),
        centroid=(84.00, 22.75),
        predominant_soil="Bhata (Gravelly Red Entisols) & Lateritic Alfisols",
        soil_order=SoilOrder.ENTISOLS,
        vernacular_soil=VernacularSoil.BHATA,
        baseline_soc_dg_kg=88.0,
        baseline_clay_g_kg=170.0,
        baseline_ph=5.3,
        soc_vulnerability_index=0.62,
        topsoil_threat="Undulating plateau erosion, acidic nutrient leaching, thin skeletal topsoil",
        recommended_interventions=[
            "Biochar @ 4 t/ha + 12 t/ha FYM to enhance cation exchange capacity",
            "Stone terracing and vegetative barriers on steep sloping uplands",
            "Agricultural Lime @ 2.0 t/ha to correct strong soil acidity",
            "Agroforestry integration with Millets (Kodo-Kutki) and cover legumes"
        ],
        approx_area_ha=620500.0,
        aliases=["jashpur", "jashpurnagar", "jashpur nagar"]
    ),
    DistrictInfo(
        name="Koriya",
        zone=AgroClimaticZone.NORTHERN_HILLS,
        zone_code="hills",
        bbox_wgs84=(82.15, 23.05, 82.85, 23.65),
        centroid=(82.55, 23.30),
        predominant_soil="Bhata (Gravelly Red Entisols) & Matasi (Alfisols)",
        soil_order=SoilOrder.ENTISOLS,
        vernacular_soil=VernacularSoil.BHATA,
        baseline_soc_dg_kg=85.0,
        baseline_clay_g_kg=165.0,
        baseline_ph=5.4,
        soc_vulnerability_index=0.64,
        topsoil_threat="Coal belt overburden stress, steep slope runoff, low organic carbon replenishment",
        recommended_interventions=[
            "High-rate organic amendment (12 t/ha FYM + leaf litter compost)",
            "Cover cropping with Cowpea and Horsegram during post-monsoon window",
            "Contour trenching to arrest torrential sheet erosion",
            "Lime application @ 1.8 t/ha to enhance microbial mineralization"
        ],
        approx_area_ha=237800.0,
        aliases=["koriya", "korea", "baikunthpur"]
    ),
    DistrictInfo(
        name="Balrampur-Ramanujganj",
        zone=AgroClimaticZone.NORTHERN_HILLS,
        zone_code="hills",
        bbox_wgs84=(82.95, 23.25, 84.15, 24.10),
        centroid=(83.55, 23.65),
        predominant_soil="Bhata (Gravelly Red Entisols)",
        soil_order=SoilOrder.ENTISOLS,
        vernacular_soil=VernacularSoil.BHATA,
        baseline_soc_dg_kg=80.0,
        baseline_clay_g_kg=155.0,
        baseline_ph=5.2,
        soc_vulnerability_index=0.68,
        topsoil_threat="Extreme Northern frontier gully erosion, acidic leached soils, low biomass return",
        recommended_interventions=[
            "Severe SOC Deficit: Apply 12-15 t/ha FYM + 4-5 t/ha Biochar",
            "Contour bunding and check-dams in upland micro-watersheds",
            "Agricultural Lime @ 2.5 t/ha to neutralize intense acidity",
            "100% crop residue retention; zero burning enforcement"
        ],
        approx_area_ha=601600.0,
        aliases=["balrampur-ramanujganj", "balrampur", "ramanujganj"]
    ),
    DistrictInfo(
        name="Surajpur",
        zone=AgroClimaticZone.NORTHERN_HILLS,
        zone_code="hills",
        bbox_wgs84=(82.50, 22.90, 83.30, 23.70),
        centroid=(82.85, 23.25),
        predominant_soil="Matasi (Sandy Loam Alfisols) & Dorsa (Inceptisols)",
        soil_order=SoilOrder.ALFISOLS,
        vernacular_soil=VernacularSoil.MATASI,
        baseline_soc_dg_kg=92.0,
        baseline_clay_g_kg=210.0,
        baseline_ph=5.7,
        soc_vulnerability_index=0.57,
        topsoil_threat="Surface soil crusting, moderate erosion, post-harvest fallow exposure",
        recommended_interventions=[
            "Apply 8-10 t/ha FYM + surface mulching with 3 t/ha paddy straw",
            "Green manuring (Dhaincha/Sesbania aculeata) before Kharif paddy",
            "Lime application @ 1.5 t/ha for sub-optimal pH correction",
            "Reduced tillage with multi-crop seeder"
        ],
        approx_area_ha=278700.0,
        aliases=["surajpur"]
    ),
    DistrictInfo(
        name="Manendragarh-Chirmiri-Bharatpur",
        zone=AgroClimaticZone.NORTHERN_HILLS,
        zone_code="hills",
        bbox_wgs84=(81.65, 23.10, 82.45, 24.00),
        centroid=(82.05, 23.50),
        predominant_soil="Bhata (Gravelly Red Entisols)",
        soil_order=SoilOrder.ENTISOLS,
        vernacular_soil=VernacularSoil.BHATA,
        baseline_soc_dg_kg=82.0,
        baseline_clay_g_kg=160.0,
        baseline_ph=5.5,
        soc_vulnerability_index=0.66,
        topsoil_threat="Mining fringe land degradation, high runoff velocity on hilly terrain",
        recommended_interventions=[
            "Apply 12 t/ha FYM + 4 t/ha Biochar to restore degraded topsoil",
            "Gully plugging, peripheral contour bunding, and silvopastoral buffers",
            "Agricultural Lime @ 1.8 t/ha to correct low pH",
            "Legume cover cropping (Stylosanthes hamata / Horsegram)"
        ],
        approx_area_ha=422600.0,
        aliases=["manendragarh-chirmiri-bharatpur", "mcb", "manendragarh", "chirmiri", "bharatpur"]
    ),
    DistrictInfo(
        name="Gaurela-Pendra-Marwahi",
        zone=AgroClimaticZone.NORTHERN_HILLS,
        zone_code="hills",
        bbox_wgs84=(81.60, 22.50, 82.25, 23.05),
        centroid=(81.90, 22.75),
        predominant_soil="Matasi (Sandy Loam Alfisols) & Bhata (Entisols)",
        soil_order=SoilOrder.ALFISOLS,
        vernacular_soil=VernacularSoil.MATASI,
        baseline_soc_dg_kg=90.0,
        baseline_clay_g_kg=190.0,
        baseline_ph=5.7,
        soc_vulnerability_index=0.59,
        topsoil_threat="Maikal hill watershed degradation, topsoil depletion on sloping crop lands",
        recommended_interventions=[
            "Apply 10 t/ha FYM + 3 t/ha Biochar to improve soil water holding capacity",
            "Contour bunding and staggered contour trenches along hill slopes",
            "Green manuring with Sunnhemp / Cowpea in pre-Kharif",
            "Lime @ 1.5 t/ha to optimize pH and microbial nitrogen fixation"
        ],
        approx_area_ha=230700.0,
        aliases=["gaurela-pendra-marwahi", "gpm", "gaurela", "pendra", "marwahi"]
    ),

    # --------------------------------------------------------------------------
    # ZONE 2: CENTRAL CHHATTISGARH PLAINS (19 Districts)
    # --------------------------------------------------------------------------
    DistrictInfo(
        name="Raipur",
        zone=AgroClimaticZone.CENTRAL_PLAINS,
        zone_code="plains",
        bbox_wgs84=(81.50, 20.95, 82.00, 21.50),
        centroid=(81.70, 21.20),
        predominant_soil="Kanhar (Clay Vertisols) & Dorsa (Inceptisols)",
        soil_order=SoilOrder.VERTISOLS,
        vernacular_soil=VernacularSoil.KANHAR,
        baseline_soc_dg_kg=110.0,
        baseline_clay_g_kg=380.0,
        baseline_ph=7.1,
        soc_vulnerability_index=0.52,
        topsoil_threat="Intensive paddy monoculture, stubble burning, summer topsoil baking & cracking",
        recommended_interventions=[
            "Zero-Tillage (Happy Seeder/Smart Seeder) with 4 t/ha paddy residue retention",
            "Apply 8-10 t/ha FYM + Green Manuring (Dhaincha) prior to puddling",
            "Gypsum application @ 2.0 t/ha to relieve Vertisol compaction & sodicity",
            "Paddy-Pulse rotation (Chickpea/Lathyrus) to rebuild biologically fixed nitrogen"
        ],
        approx_area_ha=289200.0,
        aliases=["raipur", "raipur rural", "raipur urban"]
    ),
    DistrictInfo(
        name="Durg",
        zone=AgroClimaticZone.CENTRAL_PLAINS,
        zone_code="plains",
        bbox_wgs84=(81.10, 21.00, 81.50, 21.45),
        centroid=(81.30, 21.20),
        predominant_soil="Kanhar (Clay Vertisols)",
        soil_order=SoilOrder.VERTISOLS,
        vernacular_soil=VernacularSoil.KANHAR,
        baseline_soc_dg_kg=115.0,
        baseline_clay_g_kg=420.0,
        baseline_ph=7.3,
        soc_vulnerability_index=0.50,
        topsoil_threat="Heavy clay compaction, intensive mechanization, subsoil hardpan development",
        recommended_interventions=[
            "Deep summer chiseling followed by Zero-Tillage direct seeding",
            "Apply 8 t/ha FYM + 2.0 t/ha Gypsum to maintain flocculated structure",
            "Green manuring with Sesbania aculeata (45-day pre-Kharif)",
            "100% crop residue retention to curb post-harvest thermal oxidation"
        ],
        approx_area_ha=223800.0,
        aliases=["durg", "bhilai"]
    ),
    DistrictInfo(
        name="Bilaspur",
        zone=AgroClimaticZone.CENTRAL_PLAINS,
        zone_code="plains",
        bbox_wgs84=(81.90, 21.80, 82.55, 22.45),
        centroid=(82.15, 22.10),
        predominant_soil="Dorsa (Loam Inceptisols) & Kanhar (Vertisols)",
        soil_order=SoilOrder.INCEPTISOLS,
        vernacular_soil=VernacularSoil.DORSA,
        baseline_soc_dg_kg=105.0,
        baseline_clay_g_kg=320.0,
        baseline_ph=6.9,
        soc_vulnerability_index=0.53,
        topsoil_threat="Arpa river basin sediment loss, uneven organic replenishment, crop fallow exposure",
        recommended_interventions=[
            "Apply 6-8 t/ha FYM or vermicompost + surface mulching with crop straw",
            "Relay cropping of pulses (Urd/Mung) in standing paddy",
            "Minimum tillage with laser land leveling for uniform moisture retention",
            "Integrated Nutrient Management (75% RDF + 25% organic manure)"
        ],
        approx_area_ha=351800.0,
        aliases=["bilaspur"]
    ),
    DistrictInfo(
        name="Bemetara",
        zone=AgroClimaticZone.CENTRAL_PLAINS,
        zone_code="plains",
        bbox_wgs84=(81.25, 21.45, 81.85, 22.00),
        centroid=(81.55, 21.70),
        predominant_soil="Kanhar (Clay Vertisols)",
        soil_order=SoilOrder.VERTISOLS,
        vernacular_soil=VernacularSoil.KANHAR,
        baseline_soc_dg_kg=108.0,
        baseline_clay_g_kg=410.0,
        baseline_ph=7.4,
        soc_vulnerability_index=0.51,
        topsoil_threat="Intensive pulse and paddy rotation without sufficient residue return, deep cracking",
        recommended_interventions=[
            "Zero-Tillage sowing of Rabi Chickpea into standing paddy residue",
            "Apply 8 t/ha FYM + Gypsum @ 2.0 t/ha to prevent crusting",
            "Green manuring before paddy transplantation",
            "Organic mulch to suppress moisture evaporation during summer"
        ],
        approx_area_ha=285500.0,
        aliases=["bemetara", "bemetra"]
    ),
    DistrictInfo(
        name="Balod",
        zone=AgroClimaticZone.CENTRAL_PLAINS,
        zone_code="plains",
        bbox_wgs84=(81.00, 20.60, 81.45, 21.00),
        centroid=(81.25, 20.80),
        predominant_soil="Dorsa (Loam Inceptisols) & Matasi (Alfisols)",
        soil_order=SoilOrder.INCEPTISOLS,
        vernacular_soil=VernacularSoil.DORSA,
        baseline_soc_dg_kg=102.0,
        baseline_clay_g_kg=270.0,
        baseline_ph=6.6,
        soc_vulnerability_index=0.54,
        topsoil_threat="Tandula basin topsoil runoff, light texture patches prone to organic leaching",
        recommended_interventions=[
            "Apply 6-8 t/ha FYM + green manuring with Sunnhemp",
            "Contour bunding on undulating plots along irrigation canals",
            "Legume cover crops (Cowpea/Lathyrus) post-Kharif",
            "Reduced tillage to maintain crumb structure"
        ],
        approx_area_ha=352700.0,
        aliases=["balod"]
    ),
    DistrictInfo(
        name="Baloda Bazar-Bhatapara",
        zone=AgroClimaticZone.CENTRAL_PLAINS,
        zone_code="plains",
        bbox_wgs84=(81.80, 21.40, 82.60, 22.00),
        centroid=(82.20, 21.70),
        predominant_soil="Kanhar (Clay Vertisols) & Matasi (Alfisols)",
        soil_order=SoilOrder.VERTISOLS,
        vernacular_soil=VernacularSoil.KANHAR,
        baseline_soc_dg_kg=104.0,
        baseline_clay_g_kg=350.0,
        baseline_ph=7.2,
        soc_vulnerability_index=0.53,
        topsoil_threat="Cement industrial zone dust deposition, post-harvest high summer thermal oxidation",
        recommended_interventions=[
            "Zero-tillage + 4 t/ha paddy straw mulch to buffer thermal oxidation",
            "Apply 8-10 t/ha FYM + 2 t/ha Gypsum for clay loosening",
            "Green manuring (Dhaincha) in early June showers",
            "Shelterbelt planting of subabul and neem along field borders"
        ],
        approx_area_ha=373400.0,
        aliases=["baloda bazar-bhatapara", "baloda bazar", "balodabazar", "bhatapara"]
    ),
    DistrictInfo(
        name="Janjgir-Champa",
        zone=AgroClimaticZone.CENTRAL_PLAINS,
        zone_code="plains",
        bbox_wgs84=(82.30, 21.75, 82.85, 22.25),
        centroid=(82.60, 22.00),
        predominant_soil="Dorsa (Loam Inceptisols) & Kanhar (Vertisols)",
        soil_order=SoilOrder.INCEPTISOLS,
        vernacular_soil=VernacularSoil.DORSA,
        baseline_soc_dg_kg=112.0,
        baseline_clay_g_kg=330.0,
        baseline_ph=6.8,
        soc_vulnerability_index=0.49,
        topsoil_threat="Canal-irrigated continuous waterlogging risk, declining active carbon fraction",
        recommended_interventions=[
            "Sub-surface drainage management + bio-drainage",
            "Apply 6 t/ha FYM + 2 t/ha Biochar to enhance humic fraction",
            "Alternate wetting and drying (AWD) water management in paddy",
            "Crop diversification with Rabi oilseeds (Mustard) and legumes"
        ],
        approx_area_ha=242200.0,
        aliases=["janjgir-champa", "janjgir", "champa"]
    ),
    DistrictInfo(
        name="Sakti",
        zone=AgroClimaticZone.CENTRAL_PLAINS,
        zone_code="plains",
        bbox_wgs84=(82.75, 21.70, 83.25, 22.20),
        centroid=(82.95, 21.95),
        predominant_soil="Dorsa (Loam Inceptisols)",
        soil_order=SoilOrder.INCEPTISOLS,
        vernacular_soil=VernacularSoil.DORSA,
        baseline_soc_dg_kg=106.0,
        baseline_clay_g_kg=300.0,
        baseline_ph=6.7,
        soc_vulnerability_index=0.52,
        topsoil_threat="High intensity multi-cropping, organic matter deficit during rabi season",
        recommended_interventions=[
            "Apply 6-8 t/ha FYM + vermicompost in seed furrows",
            "Retain 100% paddy straw via Happy Seeder sowing",
            "Intercrop Pigeonpea / Green gram in upland fields",
            "Reduced tillage with disc harrow optimization"
        ],
        approx_area_ha=144700.0,
        aliases=["sakti", "shakti"]
    ),
    DistrictInfo(
        name="Mahasamund",
        zone=AgroClimaticZone.CENTRAL_PLAINS,
        zone_code="plains",
        bbox_wgs84=(81.95, 20.90, 82.75, 21.50),
        centroid=(82.35, 21.20),
        predominant_soil="Matasi (Sandy Loam Alfisols) & Dorsa (Inceptisols)",
        soil_order=SoilOrder.ALFISOLS,
        vernacular_soil=VernacularSoil.MATASI,
        baseline_soc_dg_kg=98.0,
        baseline_clay_g_kg=230.0,
        baseline_ph=6.4,
        soc_vulnerability_index=0.56,
        topsoil_threat="Coarse textured soil moisture stress, seasonal bare fallow organic matter burnout",
        recommended_interventions=[
            "Apply 10 t/ha FYM or 3 t/ha Biochar for water retention",
            "Pre-monsoon Green Manuring with Sunnhemp",
            "Surface mulching with crop straw (3-4 t/ha) during summer",
            "Contour bunding and farm pond (Dabari) rainwater harvesting"
        ],
        approx_area_ha=479000.0,
        aliases=["mahasamund"]
    ),
    DistrictInfo(
        name="Dhamtari",
        zone=AgroClimaticZone.CENTRAL_PLAINS,
        zone_code="plains",
        bbox_wgs84=(81.40, 20.40, 81.75, 21.00),
        centroid=(81.55, 20.70),
        predominant_soil="Dorsa (Loam Inceptisols) & Matasi (Alfisols)",
        soil_order=SoilOrder.INCEPTISOLS,
        vernacular_soil=VernacularSoil.DORSA,
        baseline_soc_dg_kg=105.0,
        baseline_clay_g_kg=260.0,
        baseline_ph=6.5,
        soc_vulnerability_index=0.53,
        topsoil_threat="Triple-cropping nutrient drawdown, micro-nutrient imbalance, soil fatigue",
        recommended_interventions=[
            "Mandatory organic manure cycle: 8 t/ha FYM annually",
            "Zinc and Boron fortified Integrated Nutrient Management",
            "Crop residue incorporation in place of summer burning",
            "Crop rotation with Groundnut and Blackgram"
        ],
        approx_area_ha=408100.0,
        aliases=["dhamtari"]
    ),
    DistrictInfo(
        name="Rajnandgaon",
        zone=AgroClimaticZone.CENTRAL_PLAINS,
        zone_code="plains",
        bbox_wgs84=(80.75, 20.90, 81.20, 21.35),
        centroid=(81.00, 21.10),
        predominant_soil="Dorsa (Loam Inceptisols) & Matasi (Alfisols)",
        soil_order=SoilOrder.INCEPTISOLS,
        vernacular_soil=VernacularSoil.DORSA,
        baseline_soc_dg_kg=100.0,
        baseline_clay_g_kg=280.0,
        baseline_ph=6.7,
        soc_vulnerability_index=0.55,
        topsoil_threat="Undulating transition zone, sheet erosion, low organic carbon in upland plots",
        recommended_interventions=[
            "Apply 6-8 t/ha FYM + Green Manuring (Dhaincha)",
            "Contour bunding and vegetative barriers (Vetiver grass)",
            "Zero-tillage Chickpea after Kharif paddy",
            "Farmyard manure / bio-compost enriched with PSB & Rhizobium"
        ],
        approx_area_ha=306200.0,
        aliases=["rajnandgaon"]
    ),
    DistrictInfo(
        name="Mohla-Manpur-Ambagarh Chowki",
        zone=AgroClimaticZone.CENTRAL_PLAINS,
        zone_code="plains",
        bbox_wgs84=(80.50, 20.40, 81.00, 20.90),
        centroid=(80.75, 20.65),
        predominant_soil="Matasi (Sandy Loam Alfisols) & Bhata (Entisols)",
        soil_order=SoilOrder.ALFISOLS,
        vernacular_soil=VernacularSoil.MATASI,
        baseline_soc_dg_kg=94.0,
        baseline_clay_g_kg=200.0,
        baseline_ph=6.2,
        soc_vulnerability_index=0.58,
        topsoil_threat="Forest fringe erosion, sloping upland topsoil loss, low fertilizer retention",
        recommended_interventions=[
            "Apply 10-12 t/ha FYM or 3 t/ha Biochar to build topsoil depth",
            "Contour bunding and terracing on forest-margin plots",
            "Cover cropping with Niger and Horsegram",
            "Lime application @ 1.2 t/ha where pH falls below 5.8"
        ],
        approx_area_ha=214600.0,
        aliases=["mohla-manpur-ambagarh chowki", "mohla-manpur", "ambagarh chowki", "mma"]
    ),
    DistrictInfo(
        name="Khairagarh-Chhuikhadan-Gandai",
        zone=AgroClimaticZone.CENTRAL_PLAINS,
        zone_code="plains",
        bbox_wgs84=(80.75, 21.20, 81.25, 21.70),
        centroid=(81.00, 21.45),
        predominant_soil="Dorsa (Loam Inceptisols) & Kanhar (Vertisols)",
        soil_order=SoilOrder.INCEPTISOLS,
        vernacular_soil=VernacularSoil.DORSA,
        baseline_soc_dg_kg=103.0,
        baseline_clay_g_kg=310.0,
        baseline_ph=6.8,
        soc_vulnerability_index=0.54,
        topsoil_threat="Foothill gully formation, seasonal drought stress on unbunded uplands",
        recommended_interventions=[
            "Apply 8 t/ha FYM + reduced tillage",
            "Field bund strengthening and gully plugging at hill base",
            "Green manuring prior to paddy transplanting",
            "Rabi pulse rotation (Lentil/Gram) under Zero-Till"
        ],
        approx_area_ha=300400.0,
        aliases=["khairagarh-chhuikhadan-gandai", "khairagarh", "chhuikhadan", "gandai", "kcg"]
    ),
    DistrictInfo(
        name="Mungeli",
        zone=AgroClimaticZone.CENTRAL_PLAINS,
        zone_code="plains",
        bbox_wgs84=(81.40, 21.80, 82.00, 22.40),
        centroid=(81.70, 22.10),
        predominant_soil="Kanhar (Clay Vertisols) & Dorsa (Inceptisols)",
        soil_order=SoilOrder.VERTISOLS,
        vernacular_soil=VernacularSoil.KANHAR,
        baseline_soc_dg_kg=107.0,
        baseline_clay_g_kg=360.0,
        baseline_ph=7.2,
        soc_vulnerability_index=0.52,
        topsoil_threat="Heavy clay water stagnation followed by severe crusting and soil cracking",
        recommended_interventions=[
            "Gypsum @ 2.0 t/ha + 8 t/ha FYM to improve drainage and crumb stability",
            "Zero-tillage Happy Seeder technology for wheat/gram",
            "Green manuring with Dhaincha (40-45 days)",
            "Residue retention to avoid rapid clay desiccation"
        ],
        approx_area_ha=275000.0,
        aliases=["mungeli"]
    ),
    DistrictInfo(
        name="Gariaband",
        zone=AgroClimaticZone.CENTRAL_PLAINS,
        zone_code="plains",
        bbox_wgs84=(81.90, 20.40, 82.60, 21.05),
        centroid=(82.25, 20.75),
        predominant_soil="Matasi (Sandy Loam Alfisols) & Bhata (Entisols)",
        soil_order=SoilOrder.ALFISOLS,
        vernacular_soil=VernacularSoil.MATASI,
        baseline_soc_dg_kg=96.0,
        baseline_clay_g_kg=210.0,
        baseline_ph=6.1,
        soc_vulnerability_index=0.57,
        topsoil_threat="Coarse sand dominance, high nutrient leaching under monsoon downpours",
        recommended_interventions=[
            "Apply 10 t/ha FYM + 3 t/ha Biochar to bind sand particles",
            "Contour bunding in Tel / Pairi river catchment",
            "Incorporate Green Manure (Sunnhemp) at onset of monsoon",
            "Lime application @ 1.4 t/ha if soil reaction pH < 5.8"
        ],
        approx_area_ha=582300.0,
        aliases=["gariaband"]
    ),
    DistrictInfo(
        name="Korba",
        zone=AgroClimaticZone.CENTRAL_PLAINS,
        zone_code="plains",
        bbox_wgs84=(82.30, 22.10, 83.15, 22.85),
        centroid=(82.70, 22.40),
        predominant_soil="Matasi (Sandy Loam Alfisols) & Dorsa (Inceptisols)",
        soil_order=SoilOrder.ALFISOLS,
        vernacular_soil=VernacularSoil.MATASI,
        baseline_soc_dg_kg=99.0,
        baseline_clay_g_kg=240.0,
        baseline_ph=6.3,
        soc_vulnerability_index=0.55,
        topsoil_threat="Industrial corridor air/water deposition, erosion on undulating coal basin",
        recommended_interventions=[
            "Apply 8-10 t/ha FYM + vermicompost to stimulate microbial detoxification",
            "Vegetative filter strips along Hasdeo river streams",
            "Green manuring prior to paddy cultivation",
            "Cover cropping with Pigeonpea and Cowpea"
        ],
        approx_area_ha=714500.0,
        aliases=["korba"]
    ),
    DistrictInfo(
        name="Raigarh",
        zone=AgroClimaticZone.CENTRAL_PLAINS,
        zone_code="plains",
        bbox_wgs84=(83.00, 21.60, 83.75, 22.40),
        centroid=(83.40, 21.90),
        predominant_soil="Dorsa (Loam Inceptisols) & Matasi (Alfisols)",
        soil_order=SoilOrder.INCEPTISOLS,
        vernacular_soil=VernacularSoil.DORSA,
        baseline_soc_dg_kg=101.0,
        baseline_clay_g_kg=270.0,
        baseline_ph=6.5,
        soc_vulnerability_index=0.54,
        topsoil_threat="Mand-Kelo basin erosion, unbalanced NPK usage, post-paddy bare soil degradation",
        recommended_interventions=[
            "Apply 6-8 t/ha FYM + balanced organic fertilization (INM)",
            "Cover cropping with Lathyrus (Utera cropping)",
            "Contour bunding and farm bund vegetative stabilization",
            "Reduced tillage to arrest carbon mineralization"
        ],
        approx_area_ha=468900.0,
        aliases=["raigarh"]
    ),
    DistrictInfo(
        name="Sarangarh-Bilaigarh",
        zone=AgroClimaticZone.CENTRAL_PLAINS,
        zone_code="plains",
        bbox_wgs84=(82.80, 21.35, 83.40, 21.85),
        centroid=(83.10, 21.60),
        predominant_soil="Dorsa (Loam Inceptisols) & Kanhar (Vertisols)",
        soil_order=SoilOrder.INCEPTISOLS,
        vernacular_soil=VernacularSoil.DORSA,
        baseline_soc_dg_kg=108.0,
        baseline_clay_g_kg=320.0,
        baseline_ph=6.9,
        soc_vulnerability_index=0.51,
        topsoil_threat="Mahanadi floodplain erosion, low residue recycling after rabi harvesting",
        recommended_interventions=[
            "Apply 8 t/ha FYM + incorporate 100% crop residue",
            "Green manuring with Dhaincha before Kharif paddy",
            "Zero-tillage sowing of pulses (Chickpea/Moong)",
            "Strengthen river bank vegetative buffers"
        ],
        approx_area_ha=245800.0,
        aliases=["sarangarh-bilaigarh", "sarangarh", "bilaigarh"]
    ),
    DistrictInfo(
        name="Kabirdham",
        zone=AgroClimaticZone.CENTRAL_PLAINS,
        zone_code="plains",
        bbox_wgs84=(80.95, 21.70, 81.60, 22.40),
        centroid=(81.25, 22.05),
        predominant_soil="Kanhar (Clay Vertisols) & Dorsa (Inceptisols)",
        soil_order=SoilOrder.VERTISOLS,
        vernacular_soil=VernacularSoil.KANHAR,
        baseline_soc_dg_kg=109.0,
        baseline_clay_g_kg=370.0,
        baseline_ph=7.1,
        soc_vulnerability_index=0.51,
        topsoil_threat="Intensive sugarcane and paddy cropping, heavy tillage, deep desiccation cracks",
        recommended_interventions=[
            "Sugarcane trash in-situ mulching + Trichoderma decomposer",
            "Apply 8-10 t/ha FYM + Gypsum @ 2.0 t/ha to maintain soil tilth",
            "Green manuring (Sesbania) prior to Kharif sowing",
            "Subsoiling every 3 years to break plough pan"
        ],
        approx_area_ha=444700.0,
        aliases=["kabirdham", "kawardha"]
    ),

    # --------------------------------------------------------------------------
    # ZONE 3: BASTAR PLATEAU / SOUTHERN ZONE (7 Districts)
    # --------------------------------------------------------------------------
    DistrictInfo(
        name="Bastar",
        zone=AgroClimaticZone.BASTAR_PLATEAU,
        zone_code="plateau",
        bbox_wgs84=(81.60, 18.90, 82.30, 19.45),
        centroid=(81.95, 19.15),
        predominant_soil="Matasi (Sandy Loam Alfisols) & Bhata (Entisols)",
        soil_order=SoilOrder.ALFISOLS,
        vernacular_soil=VernacularSoil.MATASI,
        baseline_soc_dg_kg=92.0,
        baseline_clay_g_kg=190.0,
        baseline_ph=5.5,
        soc_vulnerability_index=0.61,
        topsoil_threat="Indravati plateau leaching, acidic phosphorus fixation, rapid humus oxidation",
        recommended_interventions=[
            "Severe SOC Deficit: Apply 10-12 t/ha FYM or 3-4 t/ha Biochar",
            "Agricultural Lime @ 2.0 t/ha to neutralize acidic stress and stimulate SOC fixation",
            "Contour bunding and stone pitching across sloping undulating fields",
            "Green manuring with Sunnhemp / Cowpea + residue mulching"
        ],
        approx_area_ha=659700.0,
        aliases=["bastar", "jagdalpur"]
    ),
    DistrictInfo(
        name="Dantewada",
        zone=AgroClimaticZone.BASTAR_PLATEAU,
        zone_code="plateau",
        bbox_wgs84=(81.10, 18.60, 81.65, 19.15),
        centroid=(81.35, 18.90),
        predominant_soil="Bhata (Gravelly Red Entisols) & Lateritic Alfisols",
        soil_order=SoilOrder.ENTISOLS,
        vernacular_soil=VernacularSoil.BHATA,
        baseline_soc_dg_kg=86.0,
        baseline_clay_g_kg=170.0,
        baseline_ph=5.2,
        soc_vulnerability_index=0.65,
        topsoil_threat="Iron-rich lateritic crusting, severe slope erosion in Bailadila foothills",
        recommended_interventions=[
            "Biochar @ 4-5 t/ha + 12 t/ha FYM to stabilize organic fractions in coarse matrix",
            "Agricultural Lime @ 2.2 t/ha to correct strong acidity",
            "Terracing and vegetative barriers with Vetiver along hill foot slopes",
            "Agroforestry with Minor Forest Produce (Mahua, Harra, Baheda) + cover crops"
        ],
        approx_area_ha=341100.0,
        aliases=["dantewada", "dakshin bastar", "dakshin bastar dantewada"]
    ),
    DistrictInfo(
        name="Kanker",
        zone=AgroClimaticZone.BASTAR_PLATEAU,
        zone_code="plateau",
        bbox_wgs84=(81.10, 20.00, 81.85, 20.60),
        centroid=(81.50, 20.30),
        predominant_soil="Matasi (Sandy Loam Alfisols) & Dorsa (Inceptisols)",
        soil_order=SoilOrder.ALFISOLS,
        vernacular_soil=VernacularSoil.MATASI,
        baseline_soc_dg_kg=97.0,
        baseline_clay_g_kg=220.0,
        baseline_ph=5.9,
        soc_vulnerability_index=0.57,
        topsoil_threat="Plateau-entry slope erosion, acidic soil stress, seasonal drought in upland sandy soils",
        recommended_interventions=[
            "Apply 8-10 t/ha FYM + 3 t/ha Biochar for soil moisture retention",
            "Contour bunding and farm pond construction for micro-catchment water conservation",
            "Green manuring (Dhaincha/Sunnhemp) before Kharif paddy",
            "Agricultural Lime @ 1.5 t/ha where pH falls below 5.8"
        ],
        approx_area_ha=528500.0,
        aliases=["kanker", "uttar bastar", "uttar bastar kanker"]
    ),
    DistrictInfo(
        name="Kondagaon",
        zone=AgroClimaticZone.BASTAR_PLATEAU,
        zone_code="plateau",
        bbox_wgs84=(81.30, 19.35, 82.05, 19.95),
        centroid=(81.65, 19.65),
        predominant_soil="Matasi (Sandy Loam Alfisols) & Bhata (Entisols)",
        soil_order=SoilOrder.ALFISOLS,
        vernacular_soil=VernacularSoil.MATASI,
        baseline_soc_dg_kg=90.0,
        baseline_clay_g_kg=180.0,
        baseline_ph=5.6,
        soc_vulnerability_index=0.62,
        topsoil_threat="High rainfall runoff on undulating plateau, rapid depletion of topsoil carbon",
        recommended_interventions=[
            "Apply 10-12 t/ha FYM or 3 t/ha Biochar + 100% residue incorporation",
            "Agricultural Lime @ 1.8 t/ha to correct low pH and unlock bound phosphorus",
            "Continuous contour trenches (CCT) and vegetative field boundaries",
            "Intercrop millets (Ragi/Kodo) with Redgram in uplands"
        ],
        approx_area_ha=776900.0,
        aliases=["kondagaon"]
    ),
    DistrictInfo(
        name="Sukma",
        zone=AgroClimaticZone.BASTAR_PLATEAU,
        zone_code="plateau",
        bbox_wgs84=(81.20, 17.80, 81.90, 18.65),
        centroid=(81.65, 18.35),
        predominant_soil="Bhata (Gravelly Red Entisols) & Red Sandy Alfisols",
        soil_order=SoilOrder.ENTISOLS,
        vernacular_soil=VernacularSoil.BHATA,
        baseline_soc_dg_kg=84.0,
        baseline_clay_g_kg=160.0,
        baseline_ph=5.1,
        soc_vulnerability_index=0.67,
        topsoil_threat="Sabari river catchment sheet erosion, high acidity, critical deficiency of organic matter",
        recommended_interventions=[
            "Critical Intervention: Apply 12-15 t/ha FYM + 4 t/ha Biochar",
            "Agricultural Lime @ 2.5 t/ha for intensive soil acidity neutralization",
            "Contour stone bunds and live hedges (Gliricidia sepium) to arrest sheet wash",
            "Zero-tillage mixed cropping of small millets + pulses"
        ],
        approx_area_ha=563600.0,
        aliases=["sukma"]
    ),
    DistrictInfo(
        name="Bijapur",
        zone=AgroClimaticZone.BASTAR_PLATEAU,
        zone_code="plateau",
        bbox_wgs84=(80.40, 18.50, 81.10, 19.15),
        centroid=(80.80, 18.80),
        predominant_soil="Bhata (Gravelly Red Entisols) & Red Sandy Alfisols",
        soil_order=SoilOrder.ENTISOLS,
        vernacular_soil=VernacularSoil.BHATA,
        baseline_soc_dg_kg=85.0,
        baseline_clay_g_kg=165.0,
        baseline_ph=5.3,
        soc_vulnerability_index=0.66,
        topsoil_threat="Remote forest terrain erosion, low soil depth, intense monsoon washing of topsoil",
        recommended_interventions=[
            "Apply 12 t/ha FYM + 4 t/ha Biochar to replenish degraded topsoil",
            "Agricultural Lime @ 2.0 t/ha to correct acidic reaction",
            "Watershed micro-bunding and gully plugs in catchment zones",
            "Cover cropping with Horsegram (Kulthi) and Cowpea"
        ],
        approx_area_ha=655300.0,
        aliases=["bijapur"]
    ),
    DistrictInfo(
        name="Narayanpur",
        zone=AgroClimaticZone.BASTAR_PLATEAU,
        zone_code="plateau",
        bbox_wgs84=(80.75, 19.35, 81.40, 20.00),
        centroid=(81.10, 19.70),
        predominant_soil="Bhata (Gravelly Red Entisols) & Forest Inceptisols",
        soil_order=SoilOrder.ENTISOLS,
        vernacular_soil=VernacularSoil.BHATA,
        baseline_soc_dg_kg=89.0,
        baseline_clay_g_kg=175.0,
        baseline_ph=5.4,
        soc_vulnerability_index=0.63,
        topsoil_threat="Abujhmad mountainous terrain, severe slope runoff, shifting cultivation legacy",
        recommended_interventions=[
            "Apply 10-12 t/ha FYM + bio-fertilizers (Rhizobium + PSB)",
            "Hillside contour terracing and vegetative filter strips",
            "Agricultural Lime @ 1.8 t/ha to stimulate organic matter stabilization",
            "Agro-silvopastoral systems and perennial grass cover"
        ],
        approx_area_ha=664000.0,
        aliases=["narayanpur"]
    ),
]


# ==============================================================================
# INDEXES & LOOKUP CACHES
# ==============================================================================

_NAME_INDEX: Dict[str, DistrictInfo] = {}
_ALIAS_INDEX: Dict[str, DistrictInfo] = {}
_ZONE_INDEX: Dict[str, List[DistrictInfo]] = {
    "hills": [],
    "plains": [],
    "plateau": []
}

def _normalize_name(name: str) -> str:
    """Normalize string for robust, case-insensitive, whitespace/punctuation-tolerant matching."""
    return re.sub(r"[^a-z0-9]", "", name.lower().strip())

for _district in DISTRICTS_DATA:
    _NAME_INDEX[_normalize_name(_district.name)] = _district
    _ZONE_INDEX[_district.zone_code].append(_district)
    for _alias in _district.aliases:
        _ALIAS_INDEX[_normalize_name(_alias)] = _district


# ==============================================================================
# PUBLIC ACCESSORS & UTILITIES
# ==============================================================================

def get_all_districts() -> List[DistrictInfo]:
    """Returns the full list of all 33 districts of Chhattisgarh."""
    return list(DISTRICTS_DATA)


def get_district_count() -> int:
    """Returns total district count (strictly 33)."""
    return len(DISTRICTS_DATA)


def get_district(name_or_alias: str) -> Optional[DistrictInfo]:
    """
    Retrieves DistrictInfo by district name or common alias (case/punctuation insensitive).
    Returns None if not found.
    """
    key = _normalize_name(name_or_alias)
    if key in _NAME_INDEX:
        return _NAME_INDEX[key]
    if key in _ALIAS_INDEX:
        return _ALIAS_INDEX[key]
    return None


def get_districts_by_zone(zone_key: str) -> List[DistrictInfo]:
    """
    Retrieves districts matching an agro-climatic zone key:
      - 'hills' | 'northern' -> Northern Hills Zone (7 districts)
      - 'plains' | 'central' -> Central Chhattisgarh Plains (19 districts)
      - 'plateau' | 'bastar' | 'southern' -> Bastar Plateau / Southern Zone (7 districts)
      - 'all' | 'statewide' -> All 33 districts
    """
    zk = zone_key.lower().strip()
    if zk in ("all", "statewide", "cg", "chhattisgarh"):
        return get_all_districts()
    if zk in ("hills", "northern", "north", "northern hills"):
        return list(_ZONE_INDEX["hills"])
    if zk in ("plains", "central", "cg plains", "central plains"):
        return list(_ZONE_INDEX["plains"])
    if zk in ("plateau", "bastar", "southern", "south", "bastar plateau"):
        return list(_ZONE_INDEX["plateau"])
    raise ValueError(f"Unknown zone key '{zone_key}'. Valid choices: 'hills', 'plains', 'plateau', 'all'.")


def get_zone_summary() -> Dict[str, Dict]:
    """Returns high-level statistics for each agro-climatic zone."""
    summary = {}
    for code, name in [
        ("hills", AgroClimaticZone.NORTHERN_HILLS.value),
        ("plains", AgroClimaticZone.CENTRAL_PLAINS.value),
        ("plateau", AgroClimaticZone.BASTAR_PLATEAU.value)
    ]:
        dists = _ZONE_INDEX[code]
        summary[code] = {
            "zone_name": name,
            "district_count": len(dists),
            "district_names": [d.name for d in dists],
            "total_area_ha": sum(d.approx_area_ha for d in dists),
            "mean_baseline_soc": round(sum(d.baseline_soc_dg_kg for d in dists) / len(dists), 2),
            "mean_baseline_clay": round(sum(d.baseline_clay_g_kg for d in dists) / len(dists), 2),
            "mean_baseline_ph": round(sum(d.baseline_ph for d in dists) / len(dists), 2),
        }
    return summary


def validate_geographic_database() -> bool:
    """
    Validates internal pedological and cartographic consistency:
      - Exactly 33 districts.
      - WGS84 bounding box invariants: min_lon < max_lon, min_lat < max_lat.
      - All bounds inside Chhattisgarh envelope (lon in [80.0, 84.8], lat in [17.5, 24.5]).
      - Centroid falls strictly within bounding box.
      - Soil classifications are valid enums.
      - Baseline values are physically sound.
    """
    if len(DISTRICTS_DATA) != 33:
        raise AssertionError(f"Expected 33 districts, found {len(DISTRICTS_DATA)}")

    names_seen = set()
    for d in DISTRICTS_DATA:
        if d.name in names_seen:
            raise AssertionError(f"Duplicate district name: {d.name}")
        names_seen.add(d.name)

        min_lon, min_lat, max_lon, max_lat = d.bbox_wgs84
        c_lon, c_lat = d.centroid

        if not (min_lon < max_lon):
            raise AssertionError(f"{d.name}: min_lon {min_lon} >= max_lon {max_lon}")
        if not (min_lat < max_lat):
            raise AssertionError(f"{d.name}: min_lat {min_lat} >= max_lat {max_lat}")

        # Check CG state bounds envelope
        if not (80.0 <= min_lon <= 84.8 and 80.0 <= max_lon <= 84.8):
            raise AssertionError(f"{d.name}: longitude bounds [{min_lon}, {max_lon}] out of CG envelope")
        if not (17.5 <= min_lat <= 24.5 and 17.5 <= max_lat <= 24.5):
            raise AssertionError(f"{d.name}: latitude bounds [{min_lat}, {max_lat}] out of CG envelope")

        # Centroid containment
        if not (min_lon <= c_lon <= max_lon and min_lat <= c_lat <= max_lat):
            raise AssertionError(f"{d.name}: centroid {d.centroid} outside bbox {d.bbox_wgs84}")

        # Pedological sanity
        if not (50.0 <= d.baseline_soc_dg_kg <= 200.0):
            raise AssertionError(f"{d.name}: baseline SOC {d.baseline_soc_dg_kg} outside domain [50, 200]")
        if not (100.0 <= d.baseline_clay_g_kg <= 550.0):
            raise AssertionError(f"{d.name}: baseline clay {d.baseline_clay_g_kg} outside domain [100, 550]")
        if not (4.5 <= d.baseline_ph <= 8.5):
            raise AssertionError(f"{d.name}: baseline pH {d.baseline_ph} outside domain [4.5, 8.5]")
        if not (0.0 <= d.soc_vulnerability_index <= 1.0):
            raise AssertionError(f"{d.name}: vulnerability index {d.soc_vulnerability_index} not in [0, 1]")

    return True


if __name__ == "__main__":
    validate_geographic_database()
    print(f"[OK] Chhattisgarh Geographic & Pedological Database: All {len(DISTRICTS_DATA)} districts verified.")
    summary = get_zone_summary()
    for z_code, z_info in summary.items():
        print(f"  • {z_info['zone_name']} ({z_info['district_count']} districts) – Area: {z_info['total_area_ha']:,.0f} ha | Avg SOC: {z_info['mean_baseline_soc']} dg/kg")
