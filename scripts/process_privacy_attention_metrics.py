#!/usr/bin/env python3
"""Process attention/click proxy raw outputs for privacy."""

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
LAYER_ID = "attention_metrics"
RAW_PATH = RAW_DIR / "privacy_attention_metrics_raw.json"
PROCESSED_PATH = PROCESSED_DIR / "privacy_attention_metrics_processed.json"
JSON_REPORT_PATH = REPORTS_DIR / "privacy_attention_metrics_data_report.json"
MD_REPORT_PATH = REPORTS_DIR / "privacy_attention_metrics_data_report.md"


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


def round_float(value: float, digits: int = 2) -> float:
    return round(float(value), digits)


def build_series_rows(raw_rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    rows = []
    for row in raw_rows:
        rows.append(
            {
                "label": row.get("label"),
                "page": row.get("page"),
                "source": "wikipedia_pageviews",
                "values": row.get("series", []),
                "total_views": row.get("total_views", 0),
                "available": bool(row.get("available")),
                "notes": row.get("notes"),
            }
        )
    return rows


def build_processed(raw: dict[str, Any]) -> dict[str, Any]:
    source_rows = raw.get("series_rows", [])
    series = build_series_rows(source_rows)

    available = [row for row in series if row["available"]]
    unavailable = [row for row in series if not row["available"]]
    available_years = []
    for row in available:
        for point in row["values"]:
            if point.get("date"):
                available_years.append(int(point["date"]))
    min_year = min(available_years) if available_years else None
    max_year = max(available_years) if available_years else None

    sources = [
        {
            "source_id": "wikipedia_pageviews",
            "description": "Wikimedia Pageviews API (monthly, aggregated to yearly totals).",
            "available": len(available) > 0,
            "page_count": len(source_rows),
        }
    ]

    unavailable_sources = []
    for source in raw.get("source_audit", {}).get("additional_unavailable", []):
        unavailable_sources.append(
            {
                "source_id": source.get("source_id"),
                "source": source.get("source"),
                "availability": source.get("availability"),
                "reason": source.get("reason"),
            }
        )

    # Include source-level fetch failures from primary pageview rows.
    for row in source_rows:
        source_log = row.get("source_log", {})
        if source_log.get("status") != "ok":
            unavailable_sources.append(
                {
                    "source_id": "wikipedia_pageviews",
                    "source": "Wikimedia Pageviews API",
                    "availability": "failed",
                    "reason": source_log.get("error"),
                    "page": row.get("page"),
                }
            )

    events = []
    for item in raw.get("events", []):
        events.append(
            {
                "date": item.get("date"),
                "label": item.get("label"),
                "category": item.get("category", "policy"),
                "confidence": item.get("confidence", "low"),
            }
        )

    total_views = sum(row["total_views"] for row in available)
    return {
        "word": WORD,
        "layer_id": LAYER_ID,
        "title": "Privacy attention/click proxy layer",
        "description": (
            "Yearly public-attention proxy from Wikimedia pageviews "
            "plus event annotations where attention is likely policy-driven."
        ),
        "sources": sources,
        "series": series,
        "events": events,
        "unavailable_sources": unavailable_sources,
        "notes": [
            "Pageviews are a proxy for public attention and should not be interpreted as usage frequency.",
            "Google Trends and NOW/COCA were intentionally not collected in this pass.",
            "Failures and fetch gaps are preserved as part of the source audit.",
        ],
        "source_notes": [
            "Wikimedia pageviews are available for many concept pages, but data shifts with media cycles and coverage quality.",
            "The source is user-activity based and not a replacement for linguistic or policy-document frequency.",
        ],
        "analysis": {
            "series_count": len(series),
            "available_series_count": len(available),
            "unavailable_series_count": len(unavailable),
            "total_views": int(total_views),
            "earliest_year": min_year,
            "latest_year": max_year,
            "years_covered": [min_year, max_year] if available_years else [],
        },
        "events_summary": events,
    }


def build_report_json(processed: dict[str, Any], report_paths: dict[str, str]) -> dict[str, Any]:
    unavailable = processed["analysis"]["unavailable_series_count"]
    high_events = [event for event in processed["events"] if event["confidence"] in {"high", "medium"}]
    return {
        "metadata": {
            "word": WORD,
            "layer_id": LAYER_ID,
            "generated_at": utc_now(),
            "generated_by_script": "scripts/process_privacy_attention_metrics.py",
            "raw_source": str(RAW_PATH.relative_to(ROOT)),
            "outputs": report_paths,
        },
        "counts": {
            "series_count": processed["analysis"]["series_count"],
            "available_series_count": processed["analysis"]["available_series_count"],
            "unavailable_series_count": unavailable,
            "total_views": processed["analysis"]["total_views"],
            "source_count": len(processed["sources"]),
        },
        "events": processed["events_summary"],
        "high_confidence_events": [
            {
                "date": item["date"],
                "label": item["label"],
                "confidence": item["confidence"],
            }
            for item in high_events
        ],
        "unavailable_sources": processed["unavailable_sources"],
        "source_health": {
            "available": processed["analysis"]["available_series_count"] > 0,
            "unavailable_count": unavailable,
        },
        "next_research_questions": [
            "Can these pageview spikes be cross-checked against registry-level publication events or release dates?",
            "Would platform policy pages and legal text access logs provide a stronger attention proxy than concept pages alone?",
            "If Google Trends remains unavailable, can a stable academic-news source be added in a follow-up pass?",
        ],
    }


def build_markdown_report(processed: dict[str, Any], report: dict[str, Any]) -> str:
    lines = [
        f"- {item['label']} ({item['confidence']}) on {item['date']}" for item in report["events"]
    ]
    top_series = [item["label"] for item in processed["series"][:15]]
    unavailable = report["unavailable_sources"]
    unavailable_lines = [
        f"- {item.get('source')} ({item.get('source_id')}){': ' + str(item.get('reason')) if item.get('reason') else ''}"
        for item in unavailable
    ]
    return f"""# Privacy Attention and Click Proxy Report

Generated: {report['metadata']['generated_at']}

## What Was Collected

- Series rows: {report['counts']['series_count']}
- Available rows: {report['counts']['available_series_count']}
- Unavailable rows: {report['counts']['unavailable_series_count']}
- Total pageviews (sum): {report['counts']['total_views']}
- Source rows: {report['counts']['source_count']}

## Event Layer

{chr(10).join(lines) if lines else "- None."}

## Representative Series

{chr(10).join(f"- {name}" for name in top_series) if top_series else "- None."}

## Unavailable or Not-Fetched Sources

{chr(10).join(unavailable_lines) if unavailable_lines else "- None."}

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
    existing["attention_metrics_layer"] = {
        "layer_id": processed["layer_id"],
        "title": processed["title"],
        "generated_at": utc_now(),
        "generated_by_script": "scripts/process_privacy_attention_metrics.py",
        "sources_available": processed["analysis"]["available_series_count"],
        "sources_total": processed["analysis"]["series_count"],
        "event_count": len(processed["events"]),
        "unavailable_sources_count": len(processed["unavailable_sources"]),
    }
    write_json(GENERATED_PREVIEW_PATH, existing)


def main() -> None:
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)

    raw = read_json(RAW_PATH, {"series_rows": [], "events": [], "source_audit": {}})
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

    print("Privacy attention metrics processing summary")
    print(f"- Series rows: {report['counts']['series_count']}")
    print(f"- Available rows: {report['counts']['available_series_count']}")
    print(f"- Unavailable rows: {report['counts']['unavailable_series_count']}")
    print(f"- Total views: {report['counts']['total_views']}")


if __name__ == "__main__":
    main()
