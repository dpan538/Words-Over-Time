#!/usr/bin/env python3
"""Process broad frequency raw outputs for privacy baseline.

The output keeps a machine-readable baseline for future chart layers.
"""

from __future__ import annotations

import json
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
LAYER_ID = "frequency_terms"
RAW_PATH = RAW_DIR / "privacy_frequency_terms_raw.json"
PROCESSED_PATH = PROCESSED_DIR / "privacy_frequency_terms_processed.json"
JSON_REPORT_PATH = REPORTS_DIR / "privacy_frequency_terms_data_report.json"
MD_REPORT_PATH = REPORTS_DIR / "privacy_frequency_terms_data_report.md"


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


def read_series(raw: dict[str, Any], start_year: int, end_year: int) -> dict[str, list[dict[str, Any]]]:
    rows = {}
    for item in raw.get("query_results", []):
        term = str(item.get("query", "")).strip()
        source = str(item.get("source_corpus", item.get("source", "")))
        key = f"{term}::{source}"
        series = {int(point["year"]): float(point.get("frequency_per_million", point.get("value", 0.0))) for point in item.get("raw_series", [])}
        rows[key] = [{"year": year, "value": round(series.get(year, 0.0), 10)} for year in range(start_year, end_year + 1)]
    return rows


def stats_for_series(values: list[dict[str, Any]]) -> dict[str, Any]:
    nonzero = [point for point in values if float(point["value"]) > 0]
    if not values:
        return {
            "first_nonzero_year": None,
            "last_nonzero_year": None,
            "peak_year": None,
            "peak_value": 0.0,
            "nonzero_year_count": 0,
        }
    peak = max(values, key=lambda point: float(point["value"]))
    return {
        "first_nonzero_year": nonzero[0]["year"] if nonzero else None,
        "last_nonzero_year": nonzero[-1]["year"] if nonzero else None,
        "peak_year": peak["year"] if nonzero else None,
        "peak_value": round(float(peak["value"]), 10),
        "nonzero_year_count": len(nonzero),
    }


def build_series(raw: dict[str, Any]) -> list[dict[str, Any]]:
    start_year = int(raw.get("start_year", 1500))
    end_year = int(raw.get("end_year", 2022))
    entries = []
    source_by_corpus = {}
    for row in raw.get("query_results", []):
        term = str(row.get("query", "")).strip()
        source = str(row.get("source_corpus", "en"))
        source_by_corpus[source] = {
            "name": "Google Books Ngram Viewer",
            "corpus": source,
            "corpus_label": row.get("source_corpus_label", source),
            "start_year": start_year,
            "end_year": end_year,
            "smoothing": int(raw.get("smoothing", 0)),
            "url": row.get("request_url", ""),
        }

        points = {int(point["year"]): float(point.get("frequency_per_million", point.get("value", 0.0))) for point in row.get("raw_series", [])}
        values = [{"year": year, "value": round(points.get(year, 0.0), 10)} for year in range(start_year, end_year + 1)]
        entries.append(
            {
                "term": term,
                "source": source,
                "query_id": row.get("query_id"),
                "query_group": row.get("query_group"),
                "term_family": row.get("term_family"),
                "values": values,
                "status": row.get("status", "missing"),
                "stats": stats_for_series(values),
                "data_quality": row.get("status", "missing"),
                "notes": row.get("notes", ""),
            }
        )

    # Keep a stable order for readability and deterministic diffs.
    return sorted(entries, key=lambda item: (item["term"], item["source"]))


def combine_by_term_by_year(raw_series: list[dict[str, Any]], start_year: int, end_year: int) -> list[dict[str, Any]]:
    values = {year: 0.0 for year in range(start_year, end_year + 1)}
    for row in raw_series:
        if row.get("status") not in {"collected", "sparse"}:
            continue
        for point in row.get("values", []):
            values[int(point["year"])] += float(point["value"])
    return [{"year": year, "value": round(values[year], 10)} for year in range(start_year, end_year + 1)]


def detect_turning_points(values: list[dict[str, Any]]) -> list[dict[str, Any]]:
    if len(values) < 3:
        return []
    points = values
    turning: list[dict[str, Any]] = []
    for index in range(1, len(points) - 1):
        prev_v = float(points[index - 1]["value"])
        this_v = float(points[index]["value"])
        next_v = float(points[index + 1]["value"])
        prev_delta = 1 if this_v > prev_v else -1 if this_v < prev_v else 0
        next_delta = 1 if next_v > this_v else -1 if next_v < this_v else 0
        if prev_delta and next_delta and prev_delta != next_delta:
            turning.append(
                {
                    "year": points[index]["year"],
                    "value": round(float(points[index]["value"]), 10),
                    "kind": "peak" if prev_delta > 0 else "trough",
                }
            )
    return sorted(turning, key=lambda item: abs(float(item["value"])), reverse=True)


def build_processed(raw: dict[str, Any]) -> dict[str, Any]:
    start_year = int(raw.get("start_year", 1500))
    end_year = int(raw.get("end_year", 2022))
    series = build_series(raw)

    source_metadata = {}
    for row in raw.get("query_results", []):
        source = str(row.get("source_corpus", "en"))
        source_metadata[source] = {
            "name": row.get("source", "Google Books Ngram Viewer"),
            "source": row.get("source"),
            "corpus": source,
            "corpus_label": row.get("source_corpus_label", source),
            "start_year": start_year,
            "end_year": end_year,
            "smoothing": int(raw.get("smoothing", 0)),
            "case_insensitive": bool(raw.get("case_insensitive", True)),
            "url": str(raw.get("metadata", {}).get("source", {}).get("url", "https://books.google.com/ngrams/json")),
        }

    combined_family = combine_by_term_by_year(series, start_year, end_year)
    turning_points = detect_turning_points(combined_family)
    sources = [{"source_id": key, **value} for key, value in sorted(source_metadata.items(), key=lambda item: item[0])]

    earliest_observations = []
    for row in series:
        term = str(row["term"])
        first_year = row["stats"]["first_nonzero_year"]
        if first_year is not None:
            earliest_observations.append(
                {"term": term, "source": row["source"], "first_nonzero_year": first_year, "peak_year": row["stats"]["peak_year"]}
            )
    earliest_observations = sorted(earliest_observations, key=lambda item: item["first_nonzero_year"])

    rising: list[tuple[int, float]] = []
    falling: list[tuple[int, float]] = []
    for index in range(1, len(combined_family)):
        previous = float(combined_family[index - 1]["value"])
        current = float(combined_family[index]["value"])
        delta = round(current - previous, 10)
        if delta > 0:
            rising.append((combined_family[index]["year"], delta))
        elif delta < 0:
            falling.append((combined_family[index]["year"], delta))
    rising.sort(key=lambda item: item[1], reverse=True)
    falling.sort(key=lambda item: item[1])

    return {
        "word": WORD,
        "layer_id": LAYER_ID,
        "title": "Privacy broad frequency baseline",
        "description": "First-pass broad frequency baseline from Google Books Ngram across multiple English corpora.",
        "terms": sorted(set(str(row.get("query", "")) for row in raw.get("query_results", []))),
        "sources": sources,
        "year_range": [start_year, end_year],
        "series": series,
        "combined_family": combined_family,
        "turning_points": turning_points[:24],
        "earliest_observations": earliest_observations,
        "analysis": {
            "query_status": {
                "collected": len([row for row in raw.get("query_results", []) if row.get("status") == "collected"]),
                "sparse": len([row for row in raw.get("query_results", []) if row.get("status") == "sparse"]),
                "missing_or_failed": len(
                    [row for row in raw.get("query_results", []) if row.get("status") in {"missing", "failed"}]
                ),
            },
            "raw_source_summary": {
                "name": "Google Books Ngram Viewer",
                "corpora": list(source_metadata.keys()),
                "request_count": len(raw.get("query_results", [])),
            },
            "rise_candidates": [f"{year} (+{round(delta, 8)})" for year, delta in rising[:10]],
            "fall_candidates": [f"{year} ({round(delta, 8)})" for year, delta in falling[:10]],
        },
        "notes": [
            "Frequency values are raw ngram frequency-per-million estimates and are not sense-separated.",
            "Terms are preserved broadly (including related, possibly non-priority lexical neighbors) to keep future options open.",
            "Early-century OCR/metadata stability is uneven; treat ancient tails as low confidence.",
        ],
        "source_notes": [
            "Printed-book corpus does not directly represent web, legislative, social media, or news registers.",
            "Phrase visibility can collapse if variant spellings or punctuation change over time.",
            "Corpus source failures are normal for narrow/rare queries and should be treated as partial data.",
        ],
        "limitations": [
            "No attempt is made to disambiguate private (social), private (property/legal) and private (opposite of public) senses in this layer.",
            "Sparse windows in the earliest decades often reflect corpus and OCR issues.",
        ],
        "rising_periods": rising[:16],
        "falling_periods": falling[:16],
    }


def build_report_json(raw: dict[str, Any], processed: dict[str, Any], output_map: dict[str, str]) -> dict[str, Any]:
    rows = raw.get("query_results", [])
    combined = processed["combined_family"]
    highest = max((point["value"] for point in combined), default=0.0)
    peak_year = next((point["year"] for point in combined if point["value"] == highest), None)
    rise_candidates = processed["analysis"]["rise_candidates"]
    fall_candidates = processed["analysis"]["fall_candidates"]
    return {
        "metadata": {
            "word": WORD,
            "layer_id": LAYER_ID,
            "generated_at": utc_now(),
            "generated_by_script": "scripts/process_privacy_frequency_terms.py",
            "raw_source": str(RAW_PATH.relative_to(ROOT)),
            "outputs": output_map,
        },
        "counts": {
            "term_count": len(processed["terms"]),
            "source_count": len(processed["sources"]),
            "year_range": processed["year_range"],
            "query_status": {
                "collected": len([row for row in rows if row.get("status") == "collected"]),
                "sparse": len([row for row in rows if row.get("status") == "sparse"]),
                "missing_or_failed": len([row for row in rows if row.get("status") in {"missing", "failed"}]),
            },
            "query_rows": len(rows),
            "inflection_point_count": len(processed["turning_points"]),
        },
        "raw_source": {
            "name": "Google Books Ngram Viewer",
            "corpora": [item["corpus"] for item in processed["sources"]],
            "start_year": processed["year_range"][0],
            "end_year": processed["year_range"][1],
            "smoothing": raw.get("smoothing", 0),
        },
        "combined_series_summary": {
            "highest_value": round(float(highest), 10),
            "peak_year": peak_year,
            "earliest_reliable_year": next((point["year"] for point in combined if point["value"] > 0), None),
            "rise_candidates": rise_candidates,
            "fall_candidates": fall_candidates,
        },
        "query_status": [
            {
                "term": item.get("query"),
                "source": item.get("source_corpus"),
                "status": item.get("status"),
                "nonzero_points": item.get("nonzero_points", 0),
                "notes": item.get("notes", ""),
            }
            for item in rows
        ],
        "most_robust_terms": [entry["term"] for entry in processed["series"] if entry["stats"]["nonzero_year_count"] > 100],
        "earliest_observations": processed["earliest_observations"],
        "rising_period_candidates": [entry.split(" ")[0] for entry in rise_candidates],
        "falling_period_candidates": [entry.split(" ")[0] for entry in fall_candidates],
        "output_files": output_map,
        "next_research_questions": [
            "Can later passes validate high-confidence modern rises against contemporary corpora or pageview proxies?",
            "Which root-family terms (private/privy/confidentiality) behave as noise versus signal for this project?",
            "Which time windows should be normalized against total corpus volume rather than raw per-million counts?",
        ],
    }


def build_markdown_report(processed: dict[str, Any], report: dict[str, Any]) -> str:
    terms = ", ".join(processed["terms"])
    source_lines = "\n".join(f"- {source['corpus']} ({source['start_year']}-{source['end_year']})" for source in processed["sources"])
    rises = "\n".join(f"- {item}" for item in report["combined_series_summary"]["rise_candidates"]) or "- Not enough data for robust rise calls."
    falls = "\n".join(f"- {item}" for item in report["combined_series_summary"]["fall_candidates"]) or "- Not enough data for robust fall calls."
    return f"""# Privacy Frequency Terms Data Report

Generated: {report['metadata']['generated_at']}

## What Was Collected

- Unique terms requested: {report['counts']['term_count']}
- Source corpora: {len(processed['sources'])}
- Query rows (term × corpus): {report['counts']['query_rows']}
- Collected rows: {report['counts']['query_status']['collected']}
- Missing or failed rows: {report['counts']['query_status']['missing_or_failed']}

## Terms Included

{terms}

## Source coverage

{source_lines}

## Earliest non-zero appearances

- Total earliest observations logged: {len(processed['earliest_observations'])}
- Earliest reliable combined year: {report['combined_series_summary']['earliest_reliable_year']}

## Combined rises and falls (raw)

### Largest rises

{rises}

### Largest falls

{falls}

## Notes

- This is a broad intake layer; signals should still be sorted by semantic relevance in later processing.
- Missing entries from one corpus are preserved and do not block future chart use.
- Query quality varies by term family and historical period.

## Outputs

- Raw: `{RAW_PATH.relative_to(ROOT)}`
- Processed: `{PROCESSED_PATH.relative_to(ROOT)}`
- JSON report: `{JSON_REPORT_PATH.relative_to(ROOT)}`
- Markdown report: `{MD_REPORT_PATH.relative_to(ROOT)}`
"""


def update_generated_preview(processed: dict[str, Any]) -> None:
    payload = read_json(GENERATED_PREVIEW_PATH, {})
    metadata = payload.get("metadata", {})
    metadata.update(
        {
            "word": WORD,
            "updated_at": utc_now(),
            "note": metadata.get("note", "Research baseline for privacy first pass."),
        }
    )
    payload["metadata"] = metadata
    prune_chart_keys(payload)
    payload["frequency_terms_layer"] = {
        "layer_id": processed["layer_id"],
        "title": processed["title"],
        "generated_at": utc_now(),
        "generated_by_script": "scripts/process_privacy_frequency_terms.py",
        "source_count": len(processed["sources"]),
        "term_count": len(processed["terms"]),
        "year_range": processed["year_range"],
    }
    write_json(GENERATED_PREVIEW_PATH, payload)


def main() -> None:
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)

    raw = read_json(RAW_PATH, {"query_results": []})
    processed = build_processed(raw)
    report_paths = {
        "processed": str(PROCESSED_PATH.relative_to(ROOT)),
        "report_json": str(JSON_REPORT_PATH.relative_to(ROOT)),
        "report_md": str(MD_REPORT_PATH.relative_to(ROOT)),
        "raw": str(RAW_PATH.relative_to(ROOT)),
    }
    report = build_report_json(raw, processed, report_paths)

    write_json(PROCESSED_PATH, processed)
    write_json(JSON_REPORT_PATH, report)
    MD_REPORT_PATH.write_text(build_markdown_report(processed, report), encoding="utf-8")
    update_generated_preview(processed)

    print("Privacy frequency terms processing summary")
    print(f"- Query rows: {report['counts']['query_rows']}")
    print(f"- Collected: {report['counts']['query_status']['collected']}")
    print(f"- Missing/failed: {report['counts']['query_status']['missing_or_failed']}")
    print(f"- Turning points: {report['counts']['inflection_point_count']}")


if __name__ == "__main__":
    main()
