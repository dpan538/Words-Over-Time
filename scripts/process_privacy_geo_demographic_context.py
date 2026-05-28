#!/usr/bin/env python3
"""Process privacy geo signal with population and life expectancy context."""

from __future__ import annotations

import json
import math
import csv
from io import StringIO
from datetime import datetime, timezone
from pathlib import Path
from statistics import median
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
RAW_PATH = ROOT / "docs" / "research" / "privacy" / "raw" / "privacy_geo_demographic_context_raw.json"
GEO_ATTENTION_PATH = ROOT / "src" / "data" / "generated" / "privacy_geo_attention_map.json"
PROCESSED_DIR = ROOT / "docs" / "research" / "privacy" / "processed"
REPORTS_DIR = ROOT / "docs" / "research" / "privacy" / "reports"
GENERATED_DIR = ROOT / "src" / "data" / "generated"
INDEX_PATH = ROOT / "docs" / "research" / "privacy" / "privacy_research_index.json"
PREVIEW_PATH = GENERATED_DIR / "privacy_chart_data_preview.json"

PROCESSED_PATH = PROCESSED_DIR / "privacy_geo_demographic_context_processed.json"
GENERATED_PATH = GENERATED_DIR / "privacy_geo_demographic_context.json"
JSON_REPORT_PATH = REPORTS_DIR / "privacy_geo_demographic_context_data_report.json"
MD_REPORT_PATH = REPORTS_DIR / "privacy_geo_demographic_context_data_report.md"

WORD = "privacy"
LAYER_ID = "geo_demographic_context"

INDICATOR_KEYS = [
    "population_total",
    "life_expectancy_total",
    "internet_users_percent",
    "urban_population_percent",
]
OWID_ISO2_TO_ISO3 = {
    "TW": "TWN",
}


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def read_json(path: Path, fallback: Any = None) -> Any:
    if not path.exists():
        if fallback is not None:
            return fallback
        raise FileNotFoundError(f"Missing required input: {path}")
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def response_rows(raw: dict[str, Any], source_id: str) -> list[dict[str, Any]]:
    response = raw.get("responses", {}).get(source_id, {}).get("response")
    if not isinstance(response, list) or len(response) < 2 or not isinstance(response[1], list):
        return []
    return [row for row in response[1] if isinstance(row, dict)]


def latest_values(rows: list[dict[str, Any]]) -> dict[str, dict[str, Any]]:
    latest: dict[str, dict[str, Any]] = {}
    for row in rows:
        value = row.get("value")
        country = row.get("country") or {}
        code = str(country.get("id") or "").upper()
        if not code or value is None:
            continue
        try:
            year = int(row.get("date"))
            numeric = float(value)
        except (TypeError, ValueError):
            continue
        previous = latest.get(code)
        if previous is None or year > previous["year"]:
            latest[code] = {
                "value": numeric,
                "year": year,
                "country": country.get("value"),
                "country_code": code,
            }
    return latest


def latest_owid_values(raw: dict[str, Any], source_id: str, value_field: str) -> dict[str, dict[str, Any]]:
    text = raw.get("responses", {}).get(source_id, {}).get("response")
    if not isinstance(text, str) or not text.strip():
        return {}
    latest: dict[str, dict[str, Any]] = {}
    for row in csv.DictReader(StringIO(text)):
        code = str(row.get("Code") or "").upper()
        value = row.get(value_field)
        if not code or value in (None, ""):
            continue
        try:
            year = int(row.get("Year"))
            numeric = float(value)
        except (TypeError, ValueError):
            continue
        previous = latest.get(code)
        if previous is None or year > previous["year"]:
            latest[code] = {
                "value": numeric,
                "year": year,
                "country": row.get("Entity"),
                "country_code": code,
                "source": source_id,
            }
    return latest


def country_metadata(raw: dict[str, Any]) -> dict[str, dict[str, Any]]:
    rows = response_rows(raw, "world_bank_country_metadata")
    metadata: dict[str, dict[str, Any]] = {}
    for row in rows:
        code = str(row.get("iso2Code") or "").upper()
        region = row.get("region") or {}
        income = row.get("incomeLevel") or {}
        if not code or region.get("id") == "NA":
            continue
        metadata[code] = {
            "country": row.get("name"),
            "iso2": code,
            "iso3": row.get("id"),
            "region": region.get("value"),
            "income_level": income.get("value"),
            "capital_city": row.get("capitalCity"),
            "longitude": float(row["longitude"]) if row.get("longitude") not in (None, "") else None,
            "latitude": float(row["latitude"]) if row.get("latitude") not in (None, "") else None,
        }
    return metadata


def bucket_by_quantiles(value: float | None, values: list[float], labels: tuple[str, str, str, str]) -> str | None:
    if value is None or not values:
        return None
    sorted_values = sorted(values)
    q1 = sorted_values[int((len(sorted_values) - 1) * 0.25)]
    q2 = sorted_values[int((len(sorted_values) - 1) * 0.50)]
    q3 = sorted_values[int((len(sorted_values) - 1) * 0.75)]
    if value <= q1:
        return labels[0]
    if value <= q2:
        return labels[1]
    if value <= q3:
        return labels[2]
    return labels[3]


def safe_log10(value: float | None) -> float | None:
    if value is None or value <= 0:
        return None
    return math.log10(value)


def build_edges(records: list[dict[str, Any]]) -> list[dict[str, Any]]:
    candidates = [
        row
        for row in records
        if row["derived"].get("log_population") is not None
        and row["demographics"].get("life_expectancy") is not None
        and row["privacy_signal"].get("weighted_score") is not None
    ]
    if len(candidates) < 2:
        return []

    log_values = [row["derived"]["log_population"] for row in candidates]
    life_values = [row["demographics"]["life_expectancy"] for row in candidates]
    signal_values = [math.log1p(row["privacy_signal"]["weighted_score"]) for row in candidates]
    log_range = max(log_values) - min(log_values) or 1
    life_range = max(life_values) - min(life_values) or 1
    signal_range = max(signal_values) - min(signal_values) or 1

    anchors = sorted(candidates, key=lambda row: row["privacy_signal"]["weighted_score"], reverse=True)[:18]
    seen: set[tuple[str, str]] = set()
    edges: list[dict[str, Any]] = []
    for source in anchors:
        distances = []
        for target in candidates:
            if source["country_code"] == target["country_code"]:
                continue
            distance = (
                abs(source["derived"]["log_population"] - target["derived"]["log_population"]) / log_range
                + abs(source["demographics"]["life_expectancy"] - target["demographics"]["life_expectancy"]) / life_range
                + abs(math.log1p(source["privacy_signal"]["weighted_score"]) - math.log1p(target["privacy_signal"]["weighted_score"]))
                / signal_range
            )
            if source.get("region") == target.get("region"):
                distance *= 0.82
            distances.append((distance, target))
        for distance, target in sorted(distances, key=lambda item: item[0])[:3]:
            key = tuple(sorted((source["country_code"], target["country_code"])))
            if key in seen:
                continue
            seen.add(key)
            edges.append(
                {
                    "source_country_code": source["country_code"],
                    "source_country": source["country"],
                    "target_country_code": target["country_code"],
                    "target_country": target["country"],
                    "edge_type": "demographic_context_similarity",
                    "distance": round(distance, 4),
                    "confidence": "medium",
                    "notes": [
                        "Edge links nearby countries in population, life expectancy, and recovered privacy signal space.",
                        "This is a visual context relation, not a causal or migration path.",
                    ],
                }
            )
    return edges


def build_payload(raw: dict[str, Any], geo: dict[str, Any]) -> dict[str, Any]:
    meta = country_metadata(raw)
    indicators = {
        key: latest_values(response_rows(raw, f"world_bank_{key}"))
        for key in INDICATOR_KEYS
    }
    owid_population = latest_owid_values(raw, "owid_population", "Population")
    owid_life_expectancy = latest_owid_values(raw, "owid_life_expectancy", "Life expectancy")

    records: list[dict[str, Any]] = []
    missing: list[dict[str, str]] = []
    for hotspot in geo.get("country_hotspots", []):
        code = str(hotspot.get("country_code") or "").upper()
        if not code:
            continue
        owid_code = OWID_ISO2_TO_ISO3.get(code)
        population_source = "world_bank"
        life_expectancy_source = "world_bank"
        population = indicators["population_total"].get(code, {}).get("value")
        population_year = indicators["population_total"].get(code, {}).get("year")
        life_expectancy = indicators["life_expectancy_total"].get(code, {}).get("value")
        life_expectancy_year = indicators["life_expectancy_total"].get(code, {}).get("year")
        if population is None and owid_code and owid_code in owid_population:
            population = owid_population[owid_code]["value"]
            population_year = owid_population[owid_code]["year"]
            population_source = "owid_fallback"
        if life_expectancy is None and owid_code and owid_code in owid_life_expectancy:
            life_expectancy = owid_life_expectancy[owid_code]["value"]
            life_expectancy_year = owid_life_expectancy[owid_code]["year"]
            life_expectancy_source = "owid_fallback"

        demog = {
            "population": population,
            "population_year": population_year,
            "population_source": population_source,
            "life_expectancy": life_expectancy,
            "life_expectancy_year": life_expectancy_year,
            "life_expectancy_source": life_expectancy_source,
            "internet_users_percent": indicators["internet_users_percent"].get(code, {}).get("value"),
            "internet_users_year": indicators["internet_users_percent"].get(code, {}).get("year"),
            "urban_population_percent": indicators["urban_population_percent"].get(code, {}).get("value"),
            "urban_population_year": indicators["urban_population_percent"].get(code, {}).get("year"),
        }
        if demog["population"] is None or demog["life_expectancy"] is None:
            missing.append({"country": hotspot.get("country"), "country_code": code})

        population = demog["population"]
        record_count = float(hotspot.get("record_count") or 0)
        weighted = float(hotspot.get("weighted_score") or 0)
        population_millions = (population / 1_000_000) if population else None
        per_million = (record_count / population_millions) if population_millions else None
        weighted_per_million = (weighted / population_millions) if population_millions else None
        row_meta = meta.get(code, {})

        records.append(
            {
                "country": hotspot.get("country"),
                "country_code": code,
                "region": row_meta.get("region"),
                "income_level": row_meta.get("income_level"),
                "map_position": {
                    "latitude": hotspot.get("latitude"),
                    "longitude": hotspot.get("longitude"),
                },
                "privacy_signal": {
                    "record_count": hotspot.get("record_count"),
                    "academic_records": hotspot.get("academic_records"),
                    "news_records": hotspot.get("news_records"),
                    "weighted_score": hotspot.get("weighted_score"),
                    "density_score": hotspot.get("density_score"),
                    "density_class": hotspot.get("density_class"),
                    "peak_year": hotspot.get("peak_year"),
                    "top_queries": hotspot.get("top_queries", []),
                },
                "demographics": demog,
                "derived": {
                    "population_millions": round(population_millions, 4) if population_millions is not None else None,
                    "log_population": safe_log10(population),
                    "privacy_records_per_million": round(per_million, 4) if per_million is not None else None,
                    "weighted_score_per_million": round(weighted_per_million, 4) if weighted_per_million is not None else None,
                },
                "visual_role": "country_node",
                "notes": [
                    "Privacy values are recovered source signals from the geo attention layer.",
                    "Population and life expectancy are contextual variables for 02C, not normalizing truth claims.",
                ],
            }
        )

    population_values = [row["demographics"]["population"] for row in records if row["demographics"]["population"] is not None]
    life_values = [row["demographics"]["life_expectancy"] for row in records if row["demographics"]["life_expectancy"] is not None]
    signal_values = [row["privacy_signal"]["weighted_score"] for row in records if row["privacy_signal"]["weighted_score"] is not None]
    per_million_values = [
        row["derived"]["privacy_records_per_million"]
        for row in records
        if row["derived"]["privacy_records_per_million"] is not None
    ]
    life_mean = sum(life_values) / len(life_values) if life_values else None

    for row in records:
        row["derived"]["population_bucket"] = bucket_by_quantiles(
            row["demographics"]["population"],
            population_values,
            ("small_population", "mid_population", "large_population", "very_large_population"),
        )
        row["derived"]["life_expectancy_bucket"] = bucket_by_quantiles(
            row["demographics"]["life_expectancy"],
            life_values,
            ("lower_life_expectancy", "mid_life_expectancy", "high_life_expectancy", "very_high_life_expectancy"),
        )
        row["derived"]["signal_bucket"] = bucket_by_quantiles(
            row["privacy_signal"]["weighted_score"],
            signal_values,
            ("trace_signal", "modest_signal", "strong_signal", "very_strong_signal"),
        )
        row["derived"]["per_million_signal_bucket"] = bucket_by_quantiles(
            row["derived"]["privacy_records_per_million"],
            per_million_values,
            ("low_per_million", "moderate_per_million", "high_per_million", "very_high_per_million"),
        )
        row["derived"]["life_expectancy_deviation_from_joined_mean"] = (
            round(row["demographics"]["life_expectancy"] - life_mean, 4)
            if row["demographics"]["life_expectancy"] is not None and life_mean is not None
            else None
        )

    records.sort(key=lambda row: row["privacy_signal"].get("weighted_score") or 0, reverse=True)
    edges = build_edges(records)
    joined = [
        row for row in records
        if row["demographics"]["population"] is not None and row["demographics"]["life_expectancy"] is not None
    ]

    return {
        "word": WORD,
        "layer_id": LAYER_ID,
        "status": "source_supported_for_chart02c",
        "intended_use": "available_for_macro_network_or_scatter_design",
        "title": "Privacy demographic context layer",
        "description": (
            "Country-level privacy signal joined with population, life expectancy, internet access, and urbanization. "
            "This is a broad conceptual comparison layer, not a causal model."
        ),
        "generated_at": utc_now(),
        "generated_by_script": "scripts/process_privacy_geo_demographic_context.py",
        "sources": [
            {
                "source_id": "privacy_geo_attention_map",
                "status": "usable",
                "role": "Recovered privacy country signal.",
            },
            {
                "source_id": "world_bank_population_life_expectancy_internet_urban",
                "status": "usable_partial" if missing else "usable",
                "role": "Population, life expectancy, internet use, and urbanization context.",
            },
            {
                "source_id": "owid_population_life_expectancy_fallback",
                "status": "usable_for_missing_entities",
                "role": "Fallback population and life expectancy values for Taiwan where World Bank coverage is absent.",
            },
        ],
        "statistics": {
            "country_signal_count": len(records),
            "countries_with_population": sum(1 for row in records if row["demographics"]["population"] is not None),
            "countries_with_life_expectancy": sum(1 for row in records if row["demographics"]["life_expectancy"] is not None),
            "countries_joined_for_02c": len(joined),
            "network_node_count": len(joined),
            "context_edge_count": len(edges),
            "median_population": round(median(population_values), 2) if population_values else None,
            "mean_life_expectancy": round(life_mean, 3) if life_mean is not None else None,
            "median_privacy_records_per_million": round(median(per_million_values), 4) if per_million_values else None,
        },
        "records": records,
        "scatter_points": [
            {
                "country": row["country"],
                "country_code": row["country_code"],
                "region": row["region"],
                "x_population_log": row["derived"]["log_population"],
                "y_life_expectancy": row["demographics"]["life_expectancy"],
                "privacy_signal": row["privacy_signal"]["weighted_score"],
                "privacy_records_per_million": row["derived"]["privacy_records_per_million"],
                "population_bucket": row["derived"]["population_bucket"],
                "life_expectancy_bucket": row["derived"]["life_expectancy_bucket"],
                "signal_bucket": row["derived"]["signal_bucket"],
            }
            for row in joined
        ],
        "network_nodes": [
            {
                "id": row["country_code"],
                "label": row["country"],
                "region": row["region"],
                "population": row["demographics"]["population"],
                "life_expectancy": row["demographics"]["life_expectancy"],
                "privacy_signal": row["privacy_signal"]["weighted_score"],
                "privacy_records_per_million": row["derived"]["privacy_records_per_million"],
                "visual_weight": row["privacy_signal"]["density_score"],
            }
            for row in joined
        ],
        "network_edges": edges,
        "missing_demographic_context": missing,
        "strong_signals": [
            f"{row['country']}: {row['privacy_signal']['record_count']} recovered privacy records"
            for row in records[:8]
        ],
        "limitations": [
            "This layer compares recovered source signals with demographic context; it does not measure population-normalized search interest.",
            "Life expectancy and population are country-level context variables and should not be read as causes of privacy attention.",
            "World Bank coverage can omit or differently classify some places, especially special administrative or contested entities.",
            "The 02C visual should emphasize complexity and distribution rather than a fitted answer.",
        ],
    }


def build_report(payload: dict[str, Any], raw: dict[str, Any]) -> dict[str, Any]:
    return {
        "word": WORD,
        "layer_id": LAYER_ID,
        "generated_at": payload["generated_at"],
        "status": payload["status"],
        "source_failures": raw.get("failures", []),
        "statistics": payload["statistics"],
        "missing_demographic_context_count": len(payload["missing_demographic_context"]),
        "outputs": {
            "processed": str(PROCESSED_PATH.relative_to(ROOT)),
            "generated": str(GENERATED_PATH.relative_to(ROOT)),
            "report_json": str(JSON_REPORT_PATH.relative_to(ROOT)),
            "report_md": str(MD_REPORT_PATH.relative_to(ROOT)),
        },
        "recommended_visual_direction": [
            "Use a macro scatter or network field: privacy signal as node weight/color, population as horizontal spread, life expectancy as vertical context.",
            "Avoid regression language; show density, clusters, and outliers as data aesthetics.",
            "Pair this with 02A and 02B as a geographic-complexity group rather than a ranking system.",
        ],
    }


def build_markdown_report(payload: dict[str, Any], raw: dict[str, Any]) -> str:
    stats = payload["statistics"]
    failures = raw.get("failures", [])
    failure_lines = "\n".join(
        f"- {failure.get('source_id')}: {failure.get('error')}" for failure in failures
    ) or "- None"
    missing = payload["missing_demographic_context"][:12]
    missing_lines = "\n".join(
        f"- {item['country']} ({item['country_code']})" for item in missing
    ) or "- None in joined country signal set"
    return f"""# Privacy Geo Demographic Context

Layer: `{LAYER_ID}`

## What Was Collected

- World Bank country metadata.
- World Bank total population.
- World Bank life expectancy at birth.
- World Bank internet-use percentage.
- World Bank urban-population percentage.
- Existing recovered privacy geo attention signal from `src/data/generated/privacy_geo_attention_map.json`.

## What Was Processed

- Country-level privacy records were joined to demographic context by ISO-2 country code.
- Derived values include log population, privacy records per million residents, life-expectancy deviation from the joined mean, and quantile buckets.
- A small context network was generated by linking nearby countries in population, life expectancy, and privacy-signal space.

## Counts

- Country privacy signals: {stats['country_signal_count']}
- Countries with population: {stats['countries_with_population']}
- Countries with life expectancy: {stats['countries_with_life_expectancy']}
- Countries joined for 02C: {stats['countries_joined_for_02c']}
- Network nodes: {stats['network_node_count']}
- Context edges: {stats['context_edge_count']}

## Weak Or Missing

{missing_lines}

## Failed Sources

{failure_lines}

## Visual Use

This layer is for a macro comparison of privacy source signal, population scale, and life expectancy context. It should not claim causation, fit a trend as an answer, or imply that life expectancy explains privacy interest. The useful direction is a complex scatter/network field where clusters, outliers, and uncertainty remain visible.

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
            f"{payload['statistics']['countries_joined_for_02c']} countries joined with population/life expectancy; "
            f"{payload['statistics']['context_edge_count']} context edges for chart02C planning."
        ),
    }
    for index, row in enumerate(index_payload["layers"]):
        if row.get("layer_id") == LAYER_ID:
            index_payload["layers"][index] = entry
            break
    else:
        index_payload["layers"].append(entry)
    write_json(INDEX_PATH, index_payload)


def update_preview(payload: dict[str, Any]) -> None:
    preview = read_json(PREVIEW_PATH, {})
    preview.setdefault("metadata", {})
    preview["metadata"]["updated_at"] = utc_now()
    preview["geo_demographic_context_layer"] = {
        "layer_id": LAYER_ID,
        "title": payload["title"],
        "generated_path": str(GENERATED_PATH.relative_to(ROOT)),
        "generated_by_script": "scripts/process_privacy_geo_demographic_context.py",
        **payload["statistics"],
        "note": "Conceptual 02C layer: privacy signal plus population and life expectancy context, not causal fitting.",
    }
    write_json(PREVIEW_PATH, preview)


def main() -> None:
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    GENERATED_DIR.mkdir(parents=True, exist_ok=True)

    raw = read_json(RAW_PATH)
    geo = read_json(GEO_ATTENTION_PATH)
    payload = build_payload(raw, geo)
    report = build_report(payload, raw)

    write_json(PROCESSED_PATH, payload)
    write_json(GENERATED_PATH, payload)
    write_json(JSON_REPORT_PATH, report)
    MD_REPORT_PATH.write_text(build_markdown_report(payload, raw), encoding="utf-8")
    update_index(payload)
    update_preview(payload)

    print("Privacy geo demographic context processing summary")
    print(f"- Countries joined for 02C: {payload['statistics']['countries_joined_for_02c']}")
    print(f"- Network nodes: {payload['statistics']['network_node_count']}")
    print(f"- Context edges: {payload['statistics']['context_edge_count']}")
    print(f"- Missing demographic context: {len(payload['missing_demographic_context'])}")
    print(f"- Generated output: {GENERATED_PATH}")


if __name__ == "__main__":
    main()
