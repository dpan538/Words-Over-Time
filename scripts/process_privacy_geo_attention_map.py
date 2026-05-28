#!/usr/bin/env python3
"""Build map-ready global geo-attention data for privacy 02A.

This script consumes the broad geo_spatial_metrics layer and produces a
smaller visualization-facing layer:
- country hotspot density
- city/institution point signals
- high-probability radiation links from concentrated privacy hubs

The layer is intentionally source-aware. It does not treat Google Trends as
available, and it does not treat radiation arcs as causal diffusion evidence.
"""

from __future__ import annotations

import json
import math
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
RESEARCH_DIR = ROOT / "docs" / "research" / "privacy"
PROCESSED_DIR = RESEARCH_DIR / "processed"
REPORTS_DIR = RESEARCH_DIR / "reports"
INDEX_PATH = RESEARCH_DIR / "privacy_research_index.json"
GENERATED_PREVIEW_PATH = ROOT / "src" / "data" / "generated" / "privacy_chart_data_preview.json"

SOURCE_PATH = PROCESSED_DIR / "privacy_geo_spatial_metrics_processed.json"
PROCESSED_PATH = PROCESSED_DIR / "privacy_geo_attention_map_processed.json"
GENERATED_PATH = ROOT / "src" / "data" / "generated" / "privacy_geo_attention_map.json"
JSON_REPORT_PATH = REPORTS_DIR / "privacy_geo_attention_map_data_report.json"
MD_REPORT_PATH = REPORTS_DIR / "privacy_geo_attention_map_data_report.md"

WORD = "privacy"
LAYER_ID = "geo_attention_map"

COUNTRY_FIXES = {
    "United States": "United States",
    "US": "United States",
    "USA": "United States",
    "United Kingdom": "United Kingdom",
    "UK": "United Kingdom",
    "GB": "United Kingdom",
    "The Netherlands": "Netherlands",
    "Netherlands": "Netherlands",
    "CN": "China",
    "DE": "Germany",
    "CA": "Canada",
    "AU": "Australia",
    "IN": "India",
    "IT": "Italy",
    "CH": "Switzerland",
    "PH": "Philippines",
    "ES": "Spain",
    "FR": "France",
    "SG": "Singapore",
    "HK": "China Hong Kong",
    "Hong Kong": "China Hong Kong",
    "JP": "Japan",
    "TW": "China Taiwan",
    "Taiwan": "China Taiwan",
    "Taiwan, Province of China": "China Taiwan",
    "KR": "South Korea",
    "NO": "Norway",
    "AT": "Austria",
    "SE": "Sweden",
    "FI": "Finland",
    "DK": "Denmark",
    "BE": "Belgium",
    "IL": "Israel",
    "MY": "Malaysia",
    "NZ": "New Zealand",
    "GR": "Greece",
    "ZA": "South Africa",
    "TR": "Turkey",
    "LU": "Luxembourg",
    "PT": "Portugal",
    "PL": "Poland",
    "BR": "Brazil",
    "JO": "Jordan",
    "SA": "Saudi Arabia",
    "MO": "China Macao",
    "Macao": "China Macao",
    "Macau": "China Macao",
    "HR": "Croatia",
    "AE": "United Arab Emirates",
    "RU": "Russia",
    "VN": "Vietnam",
    "LT": "Lithuania",
    "CZ": "Czechia",
    "NG": "Nigeria",
    "PK": "Pakistan",
    "CY": "Cyprus",
    "RO": "Romania",
    "KE": "Kenya",
    "LB": "Lebanon",
    "HU": "Hungary",
    "AR": "Argentina",
    "QA": "Qatar",
    "BD": "Bangladesh",
    "TH": "Thailand",
    "MT": "Malta",
    "FJ": "Fiji",
}

COUNTRY_CODES = {
    "United States": "US",
    "China": "CN",
    "United Kingdom": "GB",
    "Germany": "DE",
    "Canada": "CA",
    "Australia": "AU",
    "India": "IN",
    "Italy": "IT",
    "Switzerland": "CH",
    "Philippines": "PH",
    "Spain": "ES",
    "France": "FR",
    "Singapore": "SG",
    "China Hong Kong": "HK",
    "Japan": "JP",
    "China Taiwan": "TW",
    "Netherlands": "NL",
    "South Korea": "KR",
    "Norway": "NO",
    "Austria": "AT",
    "Sweden": "SE",
    "Finland": "FI",
    "Denmark": "DK",
    "Belgium": "BE",
    "Israel": "IL",
    "Malaysia": "MY",
    "New Zealand": "NZ",
    "Greece": "GR",
    "South Africa": "ZA",
    "Turkey": "TR",
    "Luxembourg": "LU",
    "Ireland": "IE",
    "Slovenia": "SI",
    "Portugal": "PT",
    "Poland": "PL",
    "Brazil": "BR",
    "Jordan": "JO",
    "Mauritania": "MR",
    "Saudi Arabia": "SA",
    "China Macao": "MO",
    "Croatia": "HR",
    "United Arab Emirates": "AE",
    "Russia": "RU",
    "Vietnam": "VN",
    "Lithuania": "LT",
    "Czechia": "CZ",
    "Nigeria": "NG",
    "Pakistan": "PK",
    "Cyprus": "CY",
    "Romania": "RO",
    "Kenya": "KE",
    "Lebanon": "LB",
    "Hungary": "HU",
    "Argentina": "AR",
    "Qatar": "QA",
    "Bangladesh": "BD",
    "Thailand": "TH",
    "Malta": "MT",
    "Fiji": "FJ",
}

COUNTRY_CENTROIDS = {
    "United States": {"lat": 38.9, "lon": -77.04},
    "China": {"lat": 39.9, "lon": 116.4},
    "United Kingdom": {"lat": 51.5, "lon": -0.12},
    "Germany": {"lat": 52.52, "lon": 13.4},
    "Canada": {"lat": 45.42, "lon": -75.69},
    "Australia": {"lat": -35.28, "lon": 149.13},
    "India": {"lat": 28.61, "lon": 77.21},
    "Italy": {"lat": 41.9, "lon": 12.5},
    "Switzerland": {"lat": 46.95, "lon": 7.45},
    "Philippines": {"lat": 14.6, "lon": 120.98},
    "Spain": {"lat": 40.42, "lon": -3.7},
    "France": {"lat": 48.86, "lon": 2.35},
    "Singapore": {"lat": 1.35, "lon": 103.82},
    "China Hong Kong": {"lat": 22.32, "lon": 114.17},
    "Japan": {"lat": 35.68, "lon": 139.76},
    "China Taiwan": {"lat": 25.04, "lon": 121.56},
    "Netherlands": {"lat": 52.37, "lon": 4.9},
    "South Korea": {"lat": 37.57, "lon": 126.98},
    "Norway": {"lat": 59.91, "lon": 10.75},
    "Austria": {"lat": 48.21, "lon": 16.37},
    "Sweden": {"lat": 59.33, "lon": 18.07},
    "Finland": {"lat": 60.17, "lon": 24.94},
    "Denmark": {"lat": 55.68, "lon": 12.57},
    "Belgium": {"lat": 50.85, "lon": 4.35},
    "Israel": {"lat": 31.77, "lon": 35.21},
    "Malaysia": {"lat": 3.14, "lon": 101.69},
    "New Zealand": {"lat": -41.29, "lon": 174.78},
    "Greece": {"lat": 37.98, "lon": 23.73},
    "South Africa": {"lat": -26.2, "lon": 28.04},
    "Turkey": {"lat": 39.93, "lon": 32.86},
    "Luxembourg": {"lat": 49.8, "lon": 6.1},
    "Ireland": {"lat": 53.4, "lon": -8.2},
    "Slovenia": {"lat": 46.1, "lon": 14.8},
    "Portugal": {"lat": 39.4, "lon": -8.2},
    "Poland": {"lat": 52.23, "lon": 21.01},
    "Brazil": {"lat": -23.55, "lon": -46.63},
    "Jordan": {"lat": 31.95, "lon": 35.93},
    "Mauritania": {"lat": 21.0, "lon": -10.9},
    "Saudi Arabia": {"lat": 24.71, "lon": 46.67},
    "China Macao": {"lat": 22.2, "lon": 113.5},
    "Croatia": {"lat": 45.1, "lon": 15.2},
    "United Arab Emirates": {"lat": 24.45, "lon": 54.38},
    "Russia": {"lat": 55.76, "lon": 37.62},
    "Vietnam": {"lat": 21.03, "lon": 105.85},
    "Lithuania": {"lat": 55.2, "lon": 23.9},
    "Czechia": {"lat": 49.8, "lon": 15.5},
    "Nigeria": {"lat": 9.08, "lon": 7.49},
    "Pakistan": {"lat": 33.68, "lon": 73.05},
    "Cyprus": {"lat": 35.1, "lon": 33.4},
    "Romania": {"lat": 44.43, "lon": 26.1},
    "Kenya": {"lat": -1.29, "lon": 36.82},
    "Lebanon": {"lat": 33.9, "lon": 35.9},
    "Hungary": {"lat": 47.2, "lon": 19.5},
    "Argentina": {"lat": -34.6, "lon": -58.38},
    "Qatar": {"lat": 25.4, "lon": 51.2},
    "Bangladesh": {"lat": 23.81, "lon": 90.41},
    "Thailand": {"lat": 13.76, "lon": 100.5},
    "Malta": {"lat": 35.9, "lon": 14.4},
    "Fiji": {"lat": -17.7, "lon": 178.1},
}

RADIATION_HUBS = [
    {
        "hub_id": "us_policy_platform",
        "label": "United States policy + platform",
        "country": "United States",
        "lat": 38.9,
        "lon": -77.04,
        "region": "north_america",
        "source_basis": "largest recovered country-level signal; mixed academic, policy, and news attention",
        "confidence": "high",
    },
    {
        "hub_id": "eu_data_governance",
        "label": "EU data governance",
        "country": "Belgium",
        "lat": 50.85,
        "lon": 4.35,
        "region": "europe",
        "source_basis": "GDPR, data-protection, and regulatory concentration around EU institutions",
        "confidence": "high",
    },
    {
        "hub_id": "uk_common_law_research",
        "label": "UK research + rights",
        "country": "United Kingdom",
        "lat": 51.5,
        "lon": -0.12,
        "region": "europe",
        "source_basis": "strong country-level and institution-level signal with legal/research continuity",
        "confidence": "medium",
    },
    {
        "hub_id": "china_platform_governance",
        "label": "China platform governance",
        "country": "China",
        "lat": 39.9,
        "lon": 116.4,
        "region": "asia",
        "source_basis": "large recovered country-level academic and policy-adjacent signal",
        "confidence": "medium",
    },
    {
        "hub_id": "apac_data_interface",
        "label": "Asia-Pacific data interface",
        "country": "Singapore",
        "lat": 1.35,
        "lon": 103.82,
        "region": "asia_pacific",
        "source_basis": "regional bridge visible in city and country-level academic/institutional records",
        "confidence": "medium",
    },
]

EUROPE = {
    "Germany",
    "Italy",
    "Switzerland",
    "Spain",
    "France",
    "Netherlands",
    "Norway",
    "Austria",
    "Sweden",
    "Finland",
    "Denmark",
    "Belgium",
    "Greece",
    "Luxembourg",
    "Ireland",
    "Slovenia",
    "Portugal",
    "Poland",
    "Croatia",
    "Lithuania",
    "Czechia",
    "Cyprus",
    "Romania",
    "Hungary",
    "Malta",
}
ASIA = {
    "China",
    "India",
    "Philippines",
    "Singapore",
    "China Taiwan",
    "China Hong Kong",
    "Japan",
    "South Korea",
    "Malaysia",
    "Israel",
    "Turkey",
    "Jordan",
    "Saudi Arabia",
    "China Macao",
    "United Arab Emirates",
    "Vietnam",
    "Pakistan",
    "Lebanon",
    "Qatar",
    "Bangladesh",
    "Thailand",
}


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def read_json(path: Path, fallback: Any | None = None) -> Any:
    if not path.exists():
        return fallback
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def normalize_country(country: str | None) -> str | None:
    if not country:
        return None
    clean = str(country).strip()
    return COUNTRY_FIXES.get(clean, clean)


def normalize_country_from_record(row: dict[str, Any]) -> str | None:
    code = row.get("country_code")
    if isinstance(code, str):
        normalized_code = code.strip().upper()
        if normalized_code == "TW":
            return "China Taiwan"
        if normalized_code == "HK":
            return "China Hong Kong"
        if normalized_code == "MO":
            return "China Macao"
    return normalize_country(row.get("country"))


def density_class(score: float, max_score: float) -> str:
    if max_score <= 0:
        return "none"
    pct = score / max_score
    if pct >= 0.72:
        return "very_high"
    if pct >= 0.34:
        return "high"
    if pct >= 0.16:
        return "medium"
    if pct >= 0.06:
        return "low"
    return "trace"


def dot_count(score: float, max_score: float) -> int:
    if max_score <= 0:
        return 0
    return max(3, min(48, round(3 + 45 * math.sqrt(score / max_score))))


def build_country_hotspots(records: list[dict[str, Any]]) -> list[dict[str, Any]]:
    rows: dict[str, dict[str, Any]] = defaultdict(
        lambda: {
            "record_count": 0,
            "academic_records": 0,
            "news_records": 0,
            "queries": Counter(),
            "years": Counter(),
        }
    )

    for row in records:
        source_type = row.get("source_type")
        if source_type not in {"academic_geo_distribution", "news_geo_discourse"}:
            continue
        country = normalize_country_from_record(row)
        if not country or country not in COUNTRY_CENTROIDS:
            continue
        rows[country]["record_count"] += 1
        if source_type == "academic_geo_distribution":
            rows[country]["academic_records"] += 1
        if source_type == "news_geo_discourse":
            rows[country]["news_records"] += 1
        if row.get("query"):
            rows[country]["queries"][str(row.get("query"))] += 1
        if isinstance(row.get("year"), int):
            rows[country]["years"][int(row.get("year"))] += 1

    scored = []
    for country, stats in rows.items():
        score = stats["academic_records"] * 1.0 + stats["news_records"] * 1.35
        top_queries = [
            {"query": query, "count": int(count)}
            for query, count in stats["queries"].most_common(5)
        ]
        peak_year = None
        if stats["years"]:
            peak_year = stats["years"].most_common(1)[0][0]
        centroid = COUNTRY_CENTROIDS[country]
        scored.append(
            {
                "country": country,
                "country_code": COUNTRY_CODES.get(country),
                "latitude": centroid["lat"],
                "longitude": centroid["lon"],
                "record_count": int(stats["record_count"]),
                "academic_records": int(stats["academic_records"]),
                "news_records": int(stats["news_records"]),
                "weighted_score": round(score, 3),
                "top_queries": top_queries,
                "peak_year": peak_year,
            }
        )

    max_score = max((row["weighted_score"] for row in scored), default=0)
    for row in scored:
        row["density_score"] = round(row["weighted_score"] / max_score, 4) if max_score else 0
        row["density_class"] = density_class(row["weighted_score"], max_score)
        row["dot_count"] = dot_count(row["weighted_score"], max_score)
    return sorted(scored, key=lambda item: item["weighted_score"], reverse=True)


def build_city_points(records: list[dict[str, Any]]) -> list[dict[str, Any]]:
    grouped: dict[tuple[str, str, float, float], dict[str, Any]] = {}
    for row in records:
        if row.get("source_type") != "academic_geo_distribution":
            continue
        lat = row.get("latitude")
        lon = row.get("longitude")
        city = row.get("city")
        country = normalize_country_from_record(row)
        if lat is None or lon is None or not city or not country:
            continue
        key = (str(city), country, round(float(lat), 4), round(float(lon), 4))
        if key not in grouped:
            grouped[key] = {
                "city": city,
                "region": row.get("region"),
                "country": country,
                "country_code": COUNTRY_CODES.get(country),
                "latitude": float(lat),
                "longitude": float(lon),
                "record_count": 0,
                "elevation_meters": row.get("elevation_meters"),
                "top_queries": Counter(),
            }
        grouped[key]["record_count"] += 1
        if row.get("query"):
            grouped[key]["top_queries"][str(row.get("query"))] += 1

    rows = []
    for item in grouped.values():
        rows.append(
            {
                **{key: value for key, value in item.items() if key != "top_queries"},
                "top_queries": [
                    {"query": query, "count": int(count)}
                    for query, count in item["top_queries"].most_common(3)
                ],
            }
        )
    return sorted(rows, key=lambda item: item["record_count"], reverse=True)[:90]


def hub_for_country(country: str) -> str:
    if country == "United States" or country in {"Canada", "Brazil", "Argentina"}:
        return "us_policy_platform"
    if country == "United Kingdom":
        return "uk_common_law_research"
    if country in EUROPE:
        return "eu_data_governance"
    if country in {"China", "China Taiwan", "China Hong Kong", "China Macao"}:
        return "china_platform_governance"
    if country in {"Australia", "New Zealand", "Singapore", "Malaysia", "Philippines"}:
        return "apac_data_interface"
    if country in ASIA:
        return "china_platform_governance"
    return "us_policy_platform"


def build_radiation_links(country_hotspots: list[dict[str, Any]]) -> list[dict[str, Any]]:
    hubs_by_id = {hub["hub_id"]: hub for hub in RADIATION_HUBS}
    links = []
    for row in country_hotspots:
        country = row["country"]
        if row["record_count"] < 10:
            continue
        hub_id = hub_for_country(country)
        hub = hubs_by_id[hub_id]
        if country == hub["country"]:
            continue
        confidence = "high" if row["record_count"] >= 150 else "medium" if row["record_count"] >= 40 else "low"
        links.append(
            {
                "link_id": f"{hub_id}_to_{row['country_code'] or country.lower().replace(' ', '_')}",
                "from_hub_id": hub_id,
                "from_label": hub["label"],
                "from_latitude": hub["lat"],
                "from_longitude": hub["lon"],
                "to_country": country,
                "to_country_code": row.get("country_code"),
                "to_latitude": row["latitude"],
                "to_longitude": row["longitude"],
                "weighted_score": row["weighted_score"],
                "density_score": row["density_score"],
                "route_basis": "high-probability concentration path from recovered country-level signal",
                "confidence": confidence,
                "notes": "Radiation links are visual attention/discourse paths, not proof of causal diffusion.",
            }
        )
    return sorted(links, key=lambda item: item["weighted_score"], reverse=True)[:34]


def build_payload(source: dict[str, Any]) -> dict[str, Any]:
    records = source.get("records", [])
    country_hotspots = build_country_hotspots(records)
    city_points = build_city_points(records)
    radiation_links = build_radiation_links(country_hotspots)
    elevation_points = [row for row in city_points if row.get("elevation_meters") is not None]

    top_country = country_hotspots[0] if country_hotspots else None
    return {
        "word": WORD,
        "layer_id": LAYER_ID,
        "status": "source_supported_for_chart02a",
        "intended_use": "chart02a_global_hotspot_and_radiation_map",
        "title": "Privacy geographic attention map",
        "description": "Map-ready global layer for privacy attention, discourse, and research geography.",
        "generated_at": utc_now(),
        "generated_by_script": "scripts/process_privacy_geo_attention_map.py",
        "source_layer": str(SOURCE_PATH.relative_to(ROOT)),
        "map_projection": {
            "projection": "equirectangular",
            "scope": "global_horizontal_map",
            "notes": [
                "The map is a flat world projection, not a globe.",
                "Country hotspots are density signals from recovered country-level records.",
                "Radiation links are high-probability visual paths from concentrated hubs, not causal claims.",
            ],
        },
        "statistics": {
            "source_total_records": source.get("statistics", {}).get("total_records", 0),
            "map_country_count": len(country_hotspots),
            "map_city_point_count": len(city_points),
            "radiation_link_count": len(radiation_links),
            "elevation_point_count": len(elevation_points),
            "top_country": top_country["country"] if top_country else None,
            "top_country_record_count": top_country["record_count"] if top_country else 0,
            "google_trends_available": False,
        },
        "sources": [
            {
                "source_id": "openalex_works_institutions",
                "source_type": "academic_geo_distribution",
                "role_in_map": "country and city/institution density",
                "status": "usable",
            },
            {
                "source_id": "gdelt_doc_2",
                "source_type": "news_geo_discourse",
                "role_in_map": "country-level news/source attention",
                "status": "usable_partial",
            },
            {
                "source_id": "google_trends",
                "source_type": "search_interest_by_region",
                "role_in_map": "not used",
                "status": "unavailable",
            },
            {
                "source_id": "open_elevation",
                "source_type": "elevation_enrichment",
                "role_in_map": "stored for later 02B only",
                "status": "usable_for_coordinate_subset",
            },
        ],
        "country_hotspots": country_hotspots,
        "city_points": city_points,
        "radiation_hubs": RADIATION_HUBS,
        "radiation_links": radiation_links,
        "density_palette": [
            {"class": "trace", "label": "Trace", "color": "#ded7c4"},
            {"class": "low", "label": "Low", "color": "#b8b09c"},
            {"class": "medium", "label": "Medium", "color": "#7c6d8f"},
            {"class": "high", "label": "High", "color": "#7e42b8"},
            {"class": "very_high", "label": "Very high", "color": "#30104f"},
        ],
        "strong_signals": [
            "Global country-level hotspot map is supported by recovered OpenAlex and GDELT records.",
            "City-level points are strongest for academic and institutional geography.",
            "Radiation can be shown as high-probability concentration paths from major recovered hubs.",
        ],
        "limitations": [
            "This is not a pure Google search-interest map because Google Trends region data was unavailable.",
            "Country hotspots combine academic production and news/source geography; they approximate attention/discourse, not population-normalized search demand.",
            "Radiation paths are visual and probabilistic; they should not be described as proven diffusion routes.",
            "Elevation is carried forward for the coordinate subset but belongs to a later 02B layer.",
        ],
    }


def build_report(payload: dict[str, Any]) -> dict[str, Any]:
    return {
        "metadata": {
            "word": WORD,
            "layer_id": LAYER_ID,
            "generated_at": utc_now(),
            "generated_by_script": "scripts/process_privacy_geo_attention_map.py",
            "outputs": {
                "processed": str(PROCESSED_PATH.relative_to(ROOT)),
                "generated": str(GENERATED_PATH.relative_to(ROOT)),
                "report_json": str(JSON_REPORT_PATH.relative_to(ROOT)),
                "report_md": str(MD_REPORT_PATH.relative_to(ROOT)),
            },
        },
        "counts": payload["statistics"],
        "top_countries": payload["country_hotspots"][:20],
        "top_cities": payload["city_points"][:20],
        "radiation_hubs": payload["radiation_hubs"],
        "radiation_links_top": payload["radiation_links"][:16],
        "sources": payload["sources"],
        "limitations": payload["limitations"],
    }


def build_markdown_report(payload: dict[str, Any]) -> str:
    stats = payload["statistics"]
    top_countries = "\n".join(
        f"- {row['country']}: {row['record_count']} records, density {row['density_class']}"
        for row in payload["country_hotspots"][:12]
    )
    top_cities = "\n".join(
        f"- {row['city']}, {row['country']}: {row['record_count']} records"
        for row in payload["city_points"][:12]
    )
    links = "\n".join(
        f"- {row['from_label']} -> {row['to_country']} ({row['confidence']})"
        for row in payload["radiation_links"][:12]
    )
    limitations = "\n".join(f"- {item}" for item in payload["limitations"])
    return f"""# Privacy Geo Attention Map Report

Generated: {payload['generated_at']}

## What This Layer Supports

- 02A global horizontal hotspot map.
- Optional radiation mode from concentrated privacy hubs.
- Elevation metadata is retained only for the later 02B direction.

## Counts

- Source records inspected: {stats['source_total_records']}
- Countries mapped: {stats['map_country_count']}
- City/institution points mapped: {stats['map_city_point_count']}
- Radiation links: {stats['radiation_link_count']}
- Elevation-ready city points: {stats['elevation_point_count']}
- Google Trends region data available: {stats['google_trends_available']}

## Strongest Country Hotspots

{top_countries if top_countries else "- None."}

## Strongest City Points

{top_cities if top_cities else "- None."}

## Radiation Logic

{links if links else "- No radiation links generated."}

## Limitations

{limitations}

## Outputs

- Processed: `{PROCESSED_PATH.relative_to(ROOT)}`
- Generated: `{GENERATED_PATH.relative_to(ROOT)}`
- JSON report: `{JSON_REPORT_PATH.relative_to(ROOT)}`
"""


def update_index(payload: dict[str, Any]) -> None:
    index_payload = read_json(INDEX_PATH, {"word": WORD, "layers": []})
    index_payload["word"] = WORD
    index_payload["updated_at"] = utc_now()
    index_payload.setdefault("layers", [])
    entry = {
        "layer_id": LAYER_ID,
        "processed_path": str(PROCESSED_PATH.relative_to(ROOT)),
        "generated_path": str(GENERATED_PATH.relative_to(ROOT)),
        "report_path": str(MD_REPORT_PATH.relative_to(ROOT)),
        "status": payload["status"],
        "notes": (
            f"{payload['statistics']['map_country_count']} countries, "
            f"{payload['statistics']['map_city_point_count']} city points, "
            f"{payload['statistics']['radiation_link_count']} radiation links for chart02A."
        ),
    }
    for row_index, row in enumerate(index_payload["layers"]):
        if row.get("layer_id") == LAYER_ID:
            index_payload["layers"][row_index] = entry
            break
    else:
        index_payload["layers"].append(entry)
    write_json(INDEX_PATH, index_payload)


def update_preview(payload: dict[str, Any]) -> None:
    preview = read_json(GENERATED_PREVIEW_PATH, {})
    preview.setdefault("metadata", {})
    preview["metadata"]["updated_at"] = utc_now()
    preview["geo_attention_map_layer"] = {
        "layer_id": LAYER_ID,
        "title": payload["title"],
        "generated_path": str(GENERATED_PATH.relative_to(ROOT)),
        "generated_by_script": "scripts/process_privacy_geo_attention_map.py",
        **payload["statistics"],
    }
    write_json(GENERATED_PREVIEW_PATH, preview)


def main() -> None:
    source = read_json(SOURCE_PATH, {})
    payload = build_payload(source)
    report = build_report(payload)
    write_json(PROCESSED_PATH, payload)
    write_json(GENERATED_PATH, payload)
    write_json(JSON_REPORT_PATH, report)
    MD_REPORT_PATH.write_text(build_markdown_report(payload), encoding="utf-8")
    update_index(payload)
    update_preview(payload)

    print("Privacy geo attention map processing summary")
    print(f"- Countries mapped: {payload['statistics']['map_country_count']}")
    print(f"- City points mapped: {payload['statistics']['map_city_point_count']}")
    print(f"- Radiation links: {payload['statistics']['radiation_link_count']}")
    print(f"- Elevation-ready points: {payload['statistics']['elevation_point_count']}")
    print(f"- Generated output: {GENERATED_PATH}")


if __name__ == "__main__":
    main()
