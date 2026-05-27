#!/usr/bin/env python3
"""Process broad privacy collocation raw outputs for modular semantic discovery."""

from __future__ import annotations

import json
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
RESEARCH_DIR = ROOT / "docs" / "research" / "privacy"
RAW_DIR = RESEARCH_DIR / "raw"
PROCESSED_DIR = RESEARCH_DIR / "processed"
REPORTS_DIR = RESEARCH_DIR / "reports"
GENERATED_PREVIEW_PATH = ROOT / "src" / "data" / "generated" / "privacy_chart_data_preview.json"

WORD = "privacy"
LAYER_ID = "collocations_semantic_field"
RAW_PATH = RAW_DIR / "privacy_collocations_semantic_field_raw.json"
PROCESSED_PATH = PROCESSED_DIR / "privacy_collocations_semantic_field_processed.json"
JSON_REPORT_PATH = REPORTS_DIR / "privacy_collocations_semantic_field_data_report.json"
MD_REPORT_PATH = REPORTS_DIR / "privacy_collocations_semantic_field_data_report.md"


TIME_BUCKETS = [
    {"bucket_id": "pre_1800", "label": "Pre-1800", "start_year": 1500, "end_year": 1799},
    {"bucket_id": "1800_1890", "label": "1800-1890", "start_year": 1800, "end_year": 1890},
    {"bucket_id": "1890_1950", "label": "1890-1950", "start_year": 1890, "end_year": 1950},
    {"bucket_id": "1950_1980", "label": "1950-1980", "start_year": 1950, "end_year": 1980},
    {"bucket_id": "1980_2000", "label": "1980-2000", "start_year": 1980, "end_year": 2000},
    {"bucket_id": "2000_2010", "label": "2000-2010", "start_year": 2000, "end_year": 2010},
    {"bucket_id": "2010_present", "label": "2010-present", "start_year": 2010, "end_year": 2022},
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


def round_float(value: float, digits: int = 8) -> float:
    return round(float(value), digits)


def points_for_row(row: dict[str, Any], start_year: int, end_year: int) -> list[dict[str, Any]]:
    points = {
        int(point["year"]): float(point.get("frequency_per_million", point.get("value", 0.0)))
        for point in row.get("raw_series", [])
    }
    return [{"year": year, "value": round_float(points.get(year, 0.0))} for year in range(start_year, end_year + 1)]


def row_stats(values: list[dict[str, Any]]) -> dict[str, Any]:
    nonzero = [point for point in values if float(point["value"]) > 0]
    if not nonzero:
        return {
            "first_nonzero_year": None,
            "last_nonzero_year": None,
            "peak_year": None,
            "peak_value": 0.0,
            "nonzero_year_count": 0,
        }
    peak = max(nonzero, key=lambda item: float(item["value"]))
    return {
        "first_nonzero_year": nonzero[0]["year"],
        "last_nonzero_year": nonzero[-1]["year"],
        "peak_year": peak["year"],
        "peak_value": round_float(peak["value"]),
        "nonzero_year_count": len(nonzero),
    }


def row_strength(values: list[dict[str, Any]], status: str) -> str:
    if status not in {"collected", "sparse"}:
        return "missing"
    nonzero = [point for point in values if float(point["value"]) > 0]
    if not nonzero:
        return "weak"
    max_value = max(float(point["value"]) for point in values)
    nonzero_count = len(nonzero)
    if max_value >= 0.05 and nonzero_count >= 40:
        return "strong"
    if max_value >= 0.01 and nonzero_count >= 20:
        return "usable"
    if max_value > 0:
        return "weak"
    return "missing"


def bucket_for_year(year: int | None) -> str:
    if year is None:
        return "unknown"
    for bucket in TIME_BUCKETS:
        if bucket["start_year"] <= int(year) <= bucket["end_year"]:
            return bucket["bucket_id"]
    return TIME_BUCKETS[-1]["bucket_id"]


def build_bucket_sections(raw: dict[str, Any], start_year: int, end_year: int) -> tuple[list[dict[str, Any]], list[dict[str, Any]], list[str]]:
    grouped: dict[str, list[dict[str, Any]]] = {}
    discovered: list[str] = []

    definitions = raw.get("bucket_definitions", {})
    for row in raw.get("query_results", []):
        phrase = str(row.get("query", "")).strip()
        status = row.get("status", "missing")
        values = points_for_row(row, start_year, end_year)
        stats = row_stats(values)
        strength = row_strength(values, status)
        peak_bucket = bucket_for_year(stats["peak_year"])
        bucket_id = str(row.get("bucket_id", "uncertain_other"))

        grouped.setdefault(bucket_id, []).append(
            {
                "phrase": phrase,
                "values": values,
                "status": status,
                "stats": stats,
                "strength": strength,
                "source": row.get("source", ""),
                "bucket_definition_label": definitions.get(bucket_id, {}).get("label", bucket_id),
                "notes": row.get("notes", ""),
                "peak_period": peak_bucket,
                "interpretation": (
                    "Strong and reusable if it appears post-1900."
                    if strength in {"strong", "usable"}
                    else "Weak signal; likely register-noise or lexical filler."
                ),
            }
        )

        if bucket_id == "uncertain_other":
            discovered.append(phrase)

    sections: list[dict[str, Any]] = []
    for bucket in definitions:
        phrases = sorted(grouped.get(bucket, []), key=lambda item: item["stats"]["peak_value"], reverse=True)
        phrase_count = len(phrases)
        usable_count = len([item for item in phrases if item["strength"] in {"strong", "usable"}])
        sections.append(
            {
                "bucket_id": bucket,
                "label": definitions.get(bucket, {}).get("label", bucket),
                "description": definitions.get(bucket, {}).get("description", ""),
                "phrases": phrases,
                "interpretation": f"{usable_count}/{phrase_count} phrases are currently usable for this bucket.",
                "statistics": {
                    "phrase_count": phrase_count,
                    "usable_or_stronger_count": usable_count,
                    "strong_count": len([item for item in phrases if item["strength"] == "strong"]),
                    "weak_count": len([item for item in phrases if item["strength"] == "weak"]),
                },
            }
        )
    # ensure deterministic order even if raw omitted unknown bucket definitions
    remaining = sorted(set(grouped.keys()) - set(definitions.keys()))
    for bucket_id in remaining:
        phrases = sorted(grouped.get(bucket_id, []), key=lambda item: item["stats"]["peak_value"], reverse=True)
        sections.append(
            {
                "bucket_id": bucket_id,
                "label": definitions.get(bucket_id, {}).get("label", bucket_id),
                "description": definitions.get(bucket_id, {}).get("description", ""),
                "phrases": phrases,
                "interpretation": f"{len(phrases)} phrases collected for an unknown bucket.",
                "statistics": {
                    "phrase_count": len(phrases),
                    "usable_or_stronger_count": len([item for item in phrases if item["strength"] in {"strong", "usable"}]),
                    "strong_count": len([item for item in phrases if item["strength"] == "strong"]),
                    "weak_count": len([item for item in phrases if item["strength"] == "weak"]),
                },
            }
        )

    weak_or_missing = [
        {"phrase": item["phrase"], "bucket_id": bucket_id, "status": item["status"]}
        for bucket_id, bucket_rows in grouped.items()
        for item in bucket_rows
        if item["strength"] in {"weak", "missing"} or item["status"] in {"missing", "failed"}
    ]
    return sections, weak_or_missing, sorted(set(discovered))


def build_processed(raw: dict[str, Any]) -> dict[str, Any]:
    start_year = int(raw.get("start_year", 1500))
    end_year = int(raw.get("end_year", 2022))
    buckets, weak_or_missing, discovered_terms = build_bucket_sections(raw, start_year, end_year)
    query_count = len(raw.get("query_results", []))
    term_count = query_count
    collected = len([row for row in raw.get("query_results", []) if row.get("status") == "collected"])

    return {
        "word": WORD,
        "layer_id": LAYER_ID,
        "title": "Privacy broad collocation and semantic field layer",
        "description": (
            "Broad phrase evidence designed to preserve exploratory candidates. "
            "Bucketing is provisional and includes weak/uncertain phrases."
        ),
        "time_buckets": TIME_BUCKETS,
        "buckets": buckets,
        "discovered_terms": discovered_terms,
        "weak_or_missing": weak_or_missing[:250],
        "notes": [
            "This layer keeps low-signal phrases so that later passes can reclassify them.",
            "No automatic semantic disambiguation is applied beyond the seed bucket definitions.",
            "Seed and discovered lists are intentionally broad for research flexibility.",
        ],
        "source_notes": [
            "Data from Google Books Ngram is print-corpus visibility, not web, legal, or social-media language.",
            "Phrase-level noise is common in older years and with short terms.",
            "Some weak phrases may still become useful when paired with dated legal or policy anchors.",
        ],
        "statistics": {
            "query_count": query_count,
            "term_count": term_count,
            "collected_count": collected,
            "missing_or_failed_count": query_count - collected,
            "weak_or_missing_count": len(weak_or_missing),
            "discovered_term_count": len(discovered_terms),
            "bucket_count": len(buckets),
        },
        "start_year": start_year,
        "end_year": end_year,
    }


def build_report_json(processed: dict[str, Any], report_paths: dict[str, str]) -> dict[str, Any]:
    buckets = processed["buckets"]
    summary = processed["statistics"]
    rows = []
    for bucket in buckets:
        for phrase in bucket["phrases"]:
            rows.append(
                {
                    "bucket_id": bucket["bucket_id"],
                    "phrase": phrase["phrase"],
                    "peak_year": phrase["stats"]["peak_year"],
                    "strength": phrase["strength"],
                    "status": phrase["status"],
                }
            )
    discovered_rows = processed.get("discovered_terms", [])
    return {
        "metadata": {
            "word": WORD,
            "layer_id": LAYER_ID,
            "generated_at": utc_now(),
            "generated_by_script": "scripts/process_privacy_collocations_semantic_field.py",
            "raw_source": str(RAW_PATH.relative_to(ROOT)),
            "outputs": report_paths,
        },
        "counts": summary,
        "strong_or_usable": [
            {
                "bucket_id": item["bucket_id"],
                "phrase": item["phrase"],
                "strength": item["strength"],
            }
            for item in rows
            if item["strength"] in {"strong", "usable"}
        ],
        "weak_or_missing_phrases": [
            {
                "bucket_id": item["bucket_id"],
                "phrase": item["phrase"],
                "status": item["status"],
            }
            for item in rows
            if item["status"] in {"sparse", "missing", "failed"} or item["strength"] == "weak"
        ],
        "discovered_terms": discovered_rows,
        "bucket_summary": [
            {
                "bucket_id": bucket["bucket_id"],
                "phrase_count": bucket["statistics"]["phrase_count"],
                "usable_or_stronger_count": bucket["statistics"]["usable_or_stronger_count"],
            }
            for bucket in buckets
        ],
        "next_research_questions": [
            "Which weak phrases should be dropped versus promoted into dedicated modern registers?",
            "Can legal and platform-era anchors raise confidence for selected semantic buckets?",
            "Which phrases should be re-queried with explicit alternatives (hyphenation/plurals) if data is sparse?",
        ],
    }


def build_markdown_report(processed: dict[str, Any], report: dict[str, Any]) -> str:
    bucket_lines = []
    for bucket in processed["buckets"]:
        bucket_lines.append(f"### {bucket['label']}")
        if not bucket["phrases"]:
            bucket_lines.append("- No phrases for this bucket.")
            continue
        for phrase in bucket["phrases"]:
            stats = phrase["stats"]
            bucket_lines.append(
                f"- `{phrase['phrase']}` ({phrase['strength']}, peak {stats['peak_year']}, bucket {phrase['peak_period']})"
            )
    bucket_text = "\n".join(bucket_lines)

    discovered = ", ".join(processed["discovered_terms"]) if processed["discovered_terms"] else "- None."
    return f"""# Privacy Collocations and Semantic Field Data Report

Generated: {report['metadata']['generated_at']}

## What Was Collected

- Query phrases: {report['counts']['query_count']}
- Collected phrases: {report['counts']['collected_count']}
- Weak or missing phrases: {report['counts']['weak_or_missing_count']}
- Discovered terms list size: {report['counts']['discovered_term_count']}

## Bucket Overview

{bucket_text}

## Discovered bucket candidates

{discovered}

## Strong or usable candidates

{chr(10).join(f"- {item['bucket_id']}: {item['phrase']} ({item['strength']})" for item in report['strong_or_usable']) if report['strong_or_usable'] else '- None yet.'}

## Outputs

- Raw: `{RAW_PATH.relative_to(ROOT)}`
- Processed: `{PROCESSED_PATH.relative_to(ROOT)}`
- JSON report: `{JSON_REPORT_PATH.relative_to(ROOT)}`
- Markdown report: `{MD_REPORT_PATH.relative_to(ROOT)}`
"""


def update_generated_preview(processed: dict[str, Any]) -> None:
    existing = read_json(GENERATED_PREVIEW_PATH, {})
    metadata = existing.get("metadata", {})
    metadata.update(
        {
            "word": WORD,
            "updated_at": utc_now(),
            "note": metadata.get("note", "Research baseline for privacy first pass."),
        }
    )
    existing["metadata"] = metadata
    prune_chart_keys(existing)
    existing["collocations_semantic_field_layer"] = {
        "layer_id": processed["layer_id"],
        "title": processed["title"],
        "generated_at": utc_now(),
        "generated_by_script": "scripts/process_privacy_collocations_semantic_field.py",
        "bucket_count": processed["statistics"]["bucket_count"],
        "strong_or_usable_count": len(
            [item for item in processed["buckets"] for row in item["phrases"] if row["strength"] in {"strong", "usable"}]
        ),
        "term_count": processed["statistics"]["term_count"],
    }
    write_json(GENERATED_PREVIEW_PATH, existing)


def main() -> None:
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)

    raw = read_json(RAW_PATH, {"query_results": [], "bucket_definitions": {}})
    processed = build_processed(raw)
    report_paths = {
        "processed": str(PROCESSED_PATH.relative_to(ROOT)),
        "report_json": str(JSON_REPORT_PATH.relative_to(ROOT)),
        "report_md": str(MD_REPORT_PATH.relative_to(ROOT)),
        "raw": str(RAW_PATH.relative_to(ROOT)),
    }
    report = build_report_json(processed, report_paths)

    write_json(PROCESSED_PATH, processed)
    write_json(JSON_REPORT_PATH, report)
    MD_REPORT_PATH.write_text(build_markdown_report(processed, report), encoding="utf-8")
    update_generated_preview(processed)

    print("Privacy collocations and semantic-field processing summary")
    print(f"- Phrases: {report['counts']['query_count']}")
    print(f"- Collected phrases: {report['counts']['collected_count']}")
    print(f"- Strong/usable phrases: {len(report['strong_or_usable'])}")
    print(f"- Processed output: {PROCESSED_PATH}")


if __name__ == "__main__":
    main()
