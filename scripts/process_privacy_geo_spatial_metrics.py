#!/usr/bin/env python3
"""Process exploratory geo-spatial metrics for privacy."""

from __future__ import annotations

import json
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
RESEARCH_DIR = ROOT / "docs" / "research" / "privacy"
RAW_DIR = RESEARCH_DIR / "raw"
PROCESSED_DIR = RESEARCH_DIR / "processed"
REPORTS_DIR = RESEARCH_DIR / "reports"
INDEX_PATH = RESEARCH_DIR / "privacy_research_index.json"
GENERATED_PREVIEW_PATH = ROOT / "src" / "data" / "generated" / "privacy_chart_data_preview.json"

WORD = "privacy"
LAYER_ID = "geo_spatial_metrics"
RAW_PATH = RAW_DIR / "privacy_geo_spatial_metrics_raw.json"
PROCESSED_PATH = PROCESSED_DIR / "privacy_geo_spatial_metrics_processed.json"
JSON_REPORT_PATH = REPORTS_DIR / "privacy_geo_spatial_metrics_data_report.json"
MD_REPORT_PATH = REPORTS_DIR / "privacy_geo_spatial_metrics_data_report.md"

ELEVATION_BANDS = [
    {"band_id": "below_0m", "min_m": None, "max_m": 0},
    {"band_id": "0_100m", "min_m": 0, "max_m": 100},
    {"band_id": "100_500m", "min_m": 100, "max_m": 500},
    {"band_id": "500_1000m", "min_m": 500, "max_m": 1000},
    {"band_id": "1000_2000m", "min_m": 1000, "max_m": 2000},
    {"band_id": "above_2000m", "min_m": 2000, "max_m": None},
]


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def read_json(path: Path, fallback: Any | None = None) -> Any:
    if not path.exists():
        return fallback
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def prune_chart_keys(payload: dict[str, Any]) -> None:
    for key in list(payload.keys()):
        if isinstance(key, str) and key.startswith("chart") and key.endswith("_layer"):
            payload.pop(key, None)


def normalize_record(row: dict[str, Any]) -> dict[str, Any]:
    payload = dict(row)
    if payload.get("country") == payload.get("source_country"):
        payload["country_level_basis"] = "source_country"
    elif payload.get("country"):
        payload["country_level_basis"] = "institution_or_metadata"
    else:
        payload["country_level_basis"] = None
    return payload


def flatten_records(raw: dict[str, Any]) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for key in ["corpus_region_records", "trends_region_records", "gdelt_records", "openalex_records"]:
        for row in raw.get(key, []):
            rows.append(normalize_record(row))
    return rows


def elevation_band(value: float | int | None) -> str | None:
    if value is None:
        return None
    value = float(value)
    for band in ELEVATION_BANDS:
        min_m = band["min_m"]
        max_m = band["max_m"]
        if min_m is None and value < max_m:
            return band["band_id"]
        if max_m is None and value >= min_m:
            return band["band_id"]
        if min_m is not None and max_m is not None and min_m <= value < max_m:
            return band["band_id"]
    return None


def aggregate_counts(records: list[dict[str, Any]], field: str) -> list[dict[str, Any]]:
    counts: Counter[str] = Counter()
    for row in records:
        value = row.get(field)
        if value in (None, "", []):
            continue
        counts[str(value)] += 1
    return [{"key": key, "count": int(count)} for key, count in counts.most_common()]


def aggregate_year(records: list[dict[str, Any]]) -> list[dict[str, Any]]:
    counts: Counter[int] = Counter()
    for row in records:
        year = row.get("year")
        if isinstance(year, int):
            counts[year] += 1
    return [{"year": int(year), "count": int(count)} for year, count in sorted(counts.items())]


def aggregate_source_type(records: list[dict[str, Any]]) -> list[dict[str, Any]]:
    counts = Counter(row.get("source_type") for row in records if row.get("source_type"))
    return [{"source_type": str(key), "count": int(count)} for key, count in counts.most_common()]


def aggregate_query(records: list[dict[str, Any]]) -> list[dict[str, Any]]:
    counts = Counter(row.get("query") for row in records if row.get("query"))
    return [{"query": str(key), "count": int(count)} for key, count in counts.most_common()]


def aggregate_elevation(records: list[dict[str, Any]]) -> list[dict[str, Any]]:
    counts: Counter[str] = Counter()
    for row in records:
        band = elevation_band(row.get("elevation_meters"))
        if band:
            counts[band] += 1
    return [{"band_id": key, "count": int(count)} for key, count in counts.most_common()]


def unique_geo_points(records: list[dict[str, Any]]) -> list[dict[str, Any]]:
    points: dict[tuple[float, float, str | None, str | None], dict[str, Any]] = {}
    for row in records:
        lat = row.get("latitude")
        lon = row.get("longitude")
        if lat is None or lon is None:
            continue
        key = (round(float(lat), 6), round(float(lon), 6), row.get("city"), row.get("institution_name"))
        if key in points:
            continue
        points[key] = {
            "latitude": float(lat),
            "longitude": float(lon),
            "city": row.get("city"),
            "region": row.get("region"),
            "country": row.get("country"),
            "country_code": row.get("country_code"),
            "institution_name": row.get("institution_name"),
            "query": row.get("query"),
            "source_type": row.get("source_type"),
            "elevation_meters": row.get("elevation_meters"),
            "elevation_source": row.get("elevation_source"),
            "elevation_confidence": row.get("elevation_confidence"),
            "coordinate_precision": row.get("coordinate_precision"),
            "notes": row.get("notes"),
        }
    return list(points.values())


def build_processed(raw: dict[str, Any]) -> dict[str, Any]:
    records = flatten_records(raw)
    geo_points = unique_geo_points(records)
    country_level_records = [row for row in records if row.get("country")]
    point_level_records = [row for row in records if row.get("latitude") is not None and row.get("longitude") is not None]
    elevation_records = [row for row in records if row.get("elevation_meters") is not None]
    city_level_records = [row for row in records if row.get("city")]

    strong_signals = []
    if len([row for row in records if row.get("source_type") == "corpus_region_frequency"]) > 0:
        strong_signals.append("Corpus-region frequency is the most stable long-run regional comparison source in this layer.")
    if len([row for row in records if row.get("source_type") == "academic_geo_distribution" and row.get("country")]) > 0:
        strong_signals.append("Academic geography has usable country-level coverage and a real institution-coordinate subset.")
    if len([row for row in records if row.get("source_type") == "news_geo_discourse" and row.get("country")]) > 0:
        strong_signals.append("GDELT source-country records support country-level privacy news attention/discourse mapping.")
    if elevation_records:
        strong_signals.append("Elevation enrichment is technically usable for the coordinate subset, but should remain a visual attribute only.")

    weak_signals = []
    if not raw.get("trends_region_records"):
        weak_signals.append("Search-interest by region is unavailable in this environment and should not be inferred from other sources.")
    if not any(row.get("source_type") == "news_geo_discourse" and row.get("latitude") is not None for row in records):
        weak_signals.append("GDELT did not yield reliable point-level mentioned-location coordinates in this pass.")
    if not elevation_records:
        weak_signals.append("Elevation enrichment is still provisional because no coordinate-level subset was enrichable.")

    return {
        "word": WORD,
        "layer_id": LAYER_ID,
        "status": "exploratory_research",
        "intended_use": "available_for_later_map_or_spatial_table_design",
        "sources": raw.get("sources", []),
        "queries": raw.get("metadata", {}).get("queries", []),
        "records": records,
        "aggregates": {
            "by_source_type": aggregate_source_type(records),
            "by_country": aggregate_counts(country_level_records, "country"),
            "by_region": aggregate_counts(records, "region"),
            "by_city": aggregate_counts(city_level_records, "city"),
            "by_year": aggregate_year(records),
            "by_query": aggregate_query(records),
            "by_elevation_band": aggregate_elevation(elevation_records),
        },
        "geo_points": geo_points,
        "elevation_bands": ELEVATION_BANDS,
        "strong_signals": strong_signals,
        "weak_signals": weak_signals,
        "failed_sources": raw.get("failed_sources", []),
        "limitations": [
            "Corpus-region frequency is a region-tagged corpus comparison, not exact geography.",
            "GDELT article geography in this pass is strongest at source-country level rather than mentioned-location point level.",
            "OpenAlex geography reflects academic production and affiliation geography, not public attention.",
            "Elevation is a spatial attribute only and must not be interpreted as causal evidence.",
        ],
        "statistics": {
            "total_records": len(records),
            "country_level_record_count": len(country_level_records),
            "city_level_record_count": len(city_level_records),
            "point_level_record_count": len(point_level_records),
            "elevation_enriched_record_count": len(elevation_records),
            "failed_source_count": len(raw.get("failed_sources", [])),
        },
    }


def build_report_json(processed: dict[str, Any], output_paths: dict[str, str]) -> dict[str, Any]:
    source_rows = []
    for source in processed.get("sources", []):
        source_rows.append(
            {
                "source_id": source.get("source_id"),
                "source_type": source.get("source_type"),
                "source_name": source.get("source_name"),
                "available": source.get("available"),
                "records": source.get("records", 0),
                "notes": source.get("notes"),
            }
        )
    return {
        "metadata": {
            "word": WORD,
            "layer_id": LAYER_ID,
            "generated_at": utc_now(),
            "generated_by_script": "scripts/process_privacy_geo_spatial_metrics.py",
            "raw_source": str(RAW_PATH.relative_to(ROOT)),
            "outputs": output_paths,
        },
        "source_success_failure_table": source_rows,
        "counts": processed.get("statistics", {}),
        "records_by_source_type": processed.get("aggregates", {}).get("by_source_type", []),
        "records_by_country_top20": processed.get("aggregates", {}).get("by_country", [])[:20],
        "records_by_city_top20": processed.get("aggregates", {}).get("by_city", [])[:20],
        "records_by_elevation_band": processed.get("aggregates", {}).get("by_elevation_band", []),
        "strong_signals": processed.get("strong_signals", []),
        "weak_signals": processed.get("weak_signals", []),
        "failed_sources": processed.get("failed_sources", []),
    }


def build_markdown_report(processed: dict[str, Any], report: dict[str, Any]) -> str:
    worked = "\n".join(
        f"- {row['source_name']} ({row['source_type']}): {'available' if row['available'] else 'unavailable'}, {row['records']} records"
        for row in report["source_success_failure_table"]
    )
    failed = "\n".join(
        f"- {row.get('source_id')} ({row.get('source_type')}): {row.get('reason')}"
        for row in report["failed_sources"]
    )
    by_source = "\n".join(
        f"- {row['source_type']}: {row['count']}" for row in report["records_by_source_type"]
    )
    strong = "\n".join(f"- {row}" for row in report["strong_signals"])
    weak = "\n".join(f"- {row}" for row in report["weak_signals"])

    strongest_geo_level = "country-level"
    if processed["statistics"]["point_level_record_count"] > processed["statistics"]["country_level_record_count"]:
        strongest_geo_level = "point-level"
    elif processed["statistics"]["city_level_record_count"] > 0:
        strongest_geo_level = "mixed country/city-level"

    elevation_note = (
        "Elevation enrichment is usable for a real coordinate subset and should be kept as an experimental spatial attribute."
        if processed["statistics"]["elevation_enriched_record_count"] > 0
        else "Elevation enrichment did not recover enough records to support visual design yet."
    )

    return f"""# Privacy Geo-Spatial Metrics Report

Generated: {report['metadata']['generated_at']}

## Which Geo-Capable Sources Worked

{worked if worked else "- None."}

## Which Sources Failed

{failed if failed else "- None."}

## Record Counts

- Total records: {processed['statistics']['total_records']}
- Country-level records: {processed['statistics']['country_level_record_count']}
- City-level records: {processed['statistics']['city_level_record_count']}
- Point-level records: {processed['statistics']['point_level_record_count']}
- Latitude/longitude records: {processed['statistics']['point_level_record_count']}
- Elevation-enriched records: {processed['statistics']['elevation_enriched_record_count']}

## Records By Source Type

{by_source if by_source else "- None."}

## Strongest Current Geo Level

- Strongest usable geography level: {strongest_geo_level}
- Elevation assessment: {elevation_note}

## Strong Signals

{strong if strong else "- None."}

## Weak Signals

{weak if weak else "- None."}

## Visualization Readiness

- Country-level maps are supported by real data.
- City/point-level mapping is supported mainly by OpenAlex institution geography.
- Elevation can be carried forward as a visual enrichment field only; it does not imply causation.

## Outputs

- Raw: `{RAW_PATH.relative_to(ROOT)}`
- Processed: `{PROCESSED_PATH.relative_to(ROOT)}`
- JSON report: `{JSON_REPORT_PATH.relative_to(ROOT)}`
- Markdown report: `{MD_REPORT_PATH.relative_to(ROOT)}`
"""


def update_research_index(processed: dict[str, Any]) -> None:
    index = read_json(INDEX_PATH, {"word": WORD, "layers": []})
    index["word"] = WORD
    index["updated_at"] = utc_now()
    index.setdefault("layers", [])

    layer_entry = {
        "layer_id": LAYER_ID,
        "processed_path": str(PROCESSED_PATH.relative_to(ROOT)),
        "report_path": str(MD_REPORT_PATH.relative_to(ROOT)),
        "status": "usable_partial" if processed["statistics"]["country_level_record_count"] > 0 else "partial",
        "notes": (
            f"{processed['statistics']['total_records']} total records; "
            f"{processed['statistics']['country_level_record_count']} country-level, "
            f"{processed['statistics']['point_level_record_count']} point-level, "
            f"{processed['statistics']['elevation_enriched_record_count']} elevation-enriched."
        ),
    }

    replaced = False
    for index_row, row in enumerate(index["layers"]):
        if row.get("layer_id") == LAYER_ID:
            index["layers"][index_row] = layer_entry
            replaced = True
            break
    if not replaced:
        index["layers"].append(layer_entry)

    write_json(INDEX_PATH, index)


def update_generated_preview(processed: dict[str, Any]) -> None:
    preview = read_json(GENERATED_PREVIEW_PATH, {})
    metadata = preview.get("metadata", {})
    metadata.update(
        {
            "word": WORD,
            "updated_at": utc_now(),
            "note": metadata.get("note", "Research baseline for privacy first pass."),
        }
    )
    preview["metadata"] = metadata
    prune_chart_keys(preview)
    preview["geo_spatial_metrics_layer"] = {
        "layer_id": LAYER_ID,
        "title": "Privacy geo-spatial metrics",
        "generated_at": utc_now(),
        "generated_by_script": "scripts/process_privacy_geo_spatial_metrics.py",
        "total_records": processed["statistics"]["total_records"],
        "country_level_record_count": processed["statistics"]["country_level_record_count"],
        "point_level_record_count": processed["statistics"]["point_level_record_count"],
        "elevation_enriched_record_count": processed["statistics"]["elevation_enriched_record_count"],
    }
    write_json(GENERATED_PREVIEW_PATH, preview)


def main() -> None:
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)

    raw = read_json(RAW_PATH, {})
    processed = build_processed(raw)
    output_paths = {
        "processed": str(PROCESSED_PATH.relative_to(ROOT)),
        "report_json": str(JSON_REPORT_PATH.relative_to(ROOT)),
        "report_md": str(MD_REPORT_PATH.relative_to(ROOT)),
        "raw": str(RAW_PATH.relative_to(ROOT)),
    }
    report = build_report_json(processed, output_paths)

    write_json(PROCESSED_PATH, processed)
    write_json(JSON_REPORT_PATH, report)
    MD_REPORT_PATH.write_text(build_markdown_report(processed, report), encoding="utf-8")
    update_research_index(processed)
    update_generated_preview(processed)

    print("Privacy geo-spatial metrics processing summary")
    print(f"- Total records: {processed['statistics']['total_records']}")
    print(f"- Country-level records: {processed['statistics']['country_level_record_count']}")
    print(f"- Point-level records: {processed['statistics']['point_level_record_count']}")
    print(f"- Elevation-enriched records: {processed['statistics']['elevation_enriched_record_count']}")
    print(f"- Failed sources: {processed['statistics']['failed_source_count']}")
    print(f"- Processed output: {PROCESSED_PATH}")


if __name__ == "__main__":
    main()
