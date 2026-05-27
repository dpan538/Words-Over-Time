#!/usr/bin/env python3
"""Process broad timeline source metadata for privacy."""

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
LAYER_ID = "timeline_source_index"
RAW_PATH = RAW_DIR / "privacy_timeline_source_index_raw.json"
PROCESSED_PATH = PROCESSED_DIR / "privacy_timeline_source_index_processed.json"
JSON_REPORT_PATH = REPORTS_DIR / "privacy_timeline_source_index_data_report.json"
MD_REPORT_PATH = REPORTS_DIR / "privacy_timeline_source_index_data_report.md"


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


def normalize_anchor(item: dict[str, Any]) -> dict[str, Any]:
    return {
        "year": int(item.get("year", 0)),
        "label": item.get("label", ""),
        "category": item.get("category", "uncertain"),
        "description": item.get("description", ""),
        "source": item.get("source", ""),
        "source_url": item.get("source_url", ""),
        "confidence": item.get("confidence", "low"),
        "notes": item.get("notes", ""),
        "date_label": item.get("date_label"),
        "source_status": item.get("source_status", {}),
        "anchor_id": item.get("anchor_id"),
    }


def build_processed(raw: dict[str, Any]) -> dict[str, Any]:
    raw_anchors = [normalize_anchor(item) for item in raw.get("anchors", []) if isinstance(item, dict)]
    anchors = sorted(raw_anchors, key=lambda item: item["year"])

    category_counts = Counter(item["category"] for item in anchors)
    confidence_counts = Counter(item["confidence"] for item in anchors)
    source_status_counts = Counter(
        "reachable" if item.get("source_status", {}).get("reachable") else "unreachable" for item in anchors
    )

    high_confidence = [anchor for anchor in anchors if anchor["confidence"] == "high"]
    medium_confidence = [anchor for anchor in anchors if anchor["confidence"] == "medium"]
    low_confidence = [anchor for anchor in anchors if anchor["confidence"] == "low"]
    uncertain = [anchor for anchor in anchors if anchor["confidence"] == "low" or anchor["confidence"] == "uncertain"]
    source_records = raw.get("metadata", {}).get("source_records", [])

    category_labels = raw.get("metadata", {}).get("categories", {})
    return {
        "word": WORD,
        "layer_id": LAYER_ID,
        "title": "Privacy timeline source index",
        "anchors": anchors,
        "categories": list(category_labels.keys()) if category_labels else [],
        "category_labels": category_labels,
        "source_index": source_records,
        "uncertain_anchors": [
            {
                "year": item["year"],
                "label": item["label"],
                "category": item["category"],
                "confidence": item["confidence"],
                "notes": item["notes"],
            }
            for item in uncertain
            if item["year"]
        ],
        "notes": [
            "Anchors are modular and should be treated as source-planning points.",
            "Low-confidence items include directional markers and placeholders where year precision is weak.",
            "Source reachability checks are preliminary and do not certify semantic claims.",
        ],
        "source_notes": [
            "Some anchors intentionally include event-level placeholders for future follow-up.",
            "Early lexical origin anchors remain date-uncertain due sparse direct dictionary digitization in this pass.",
            "This file is meant to support later chart annotation layers.",
        ],
        "statistics": {
            "anchor_count": len(anchors),
            "high_confidence_count": len(high_confidence),
            "medium_confidence_count": len(medium_confidence),
            "low_confidence_count": len(low_confidence),
            "category_counts": dict(category_counts),
            "confidence_counts": dict(confidence_counts),
            "source_status_counts": dict(source_status_counts),
            "reachable_sources": len([item for item in source_records if item.get("reachable")]),
            "source_total": len(source_records),
        },
        "metadata_summary": {
            "year_range": [anchors[0]["year"], anchors[-1]["year"]] if anchors else [],
            "uncertain_anchor_count": len(uncertain),
        },
    }


def build_report_json(processed: dict[str, Any], report_paths: dict[str, str]) -> dict[str, Any]:
    anchors = processed["anchors"]
    return {
        "metadata": {
            "word": WORD,
            "layer_id": LAYER_ID,
            "generated_at": utc_now(),
            "generated_by_script": "scripts/process_privacy_timeline_source_index.py",
            "raw_source": str(RAW_PATH.relative_to(ROOT)),
            "outputs": report_paths,
        },
        "counts": {
            "anchor_count": processed["statistics"]["anchor_count"],
            "high_confidence": processed["statistics"]["high_confidence_count"],
            "medium_confidence": processed["statistics"]["medium_confidence_count"],
            "low_confidence": processed["statistics"]["low_confidence_count"],
            "source_count": processed["statistics"]["source_total"],
            "reachable_sources": processed["statistics"]["reachable_sources"],
        },
        "earliest_anchor": anchors[0] if anchors else None,
        "latest_anchor": anchors[-1] if anchors else None,
        "category_counts": processed["statistics"]["category_counts"],
        "confidence_counts": processed["statistics"]["confidence_counts"],
        "uncertain_anchors": processed["uncertain_anchors"],
        "source_status_counts": processed["statistics"]["source_status_counts"],
        "next_research_questions": [
            "Can we assign direct primary-source citations to low-confidence origin and early-usage rows?",
            "Which event anchors should move to higher confidence after legal text verification?",
            "Can category labels split into separate digital-era and policy-era buckets for clearer chart annotation.",
        ],
    }


def build_markdown_report(processed: dict[str, Any], report: dict[str, Any]) -> str:
    anchors = "\n".join(
        f"- **{anchor['year']}** {anchor['label']} ({anchor['category']}, {anchor['confidence']})"
        for anchor in processed["anchors"]
    )
    uncertain = "\n".join(f"- {item['year']}: {item['label']}" for item in processed["uncertain_anchors"])

    return f"""# Privacy Timeline Source Index Report

Generated: {report['metadata']['generated_at']}

## What Was Collected

- Anchors: {report['counts']['anchor_count']}
- High-confidence anchors: {report['counts']['high_confidence']}
- Medium-confidence anchors: {report['counts']['medium_confidence']}
- Low-confidence anchors: {report['counts']['low_confidence']}
- Source checks with reachability: {report['counts']['reachable_sources']} / {report['counts']['source_count']}

## Anchor Timeline

{anchors if anchors else "- None."}

## Uncertain / Follow-up Anchors

{uncertain if uncertain else "- None."}

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
    existing["timeline_source_index_layer"] = {
        "layer_id": processed["layer_id"],
        "title": processed["title"],
        "generated_at": utc_now(),
        "generated_by_script": "scripts/process_privacy_timeline_source_index.py",
        "anchor_count": len(processed["anchors"]),
        "high_confidence_count": processed["statistics"]["high_confidence_count"],
        "year_range": processed["metadata_summary"]["year_range"],
    }
    write_json(GENERATED_PREVIEW_PATH, existing)


def main() -> None:
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)

    raw = read_json(RAW_PATH, {"anchors": []})
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

    print("Privacy timeline source index processing summary")
    print(f"- Anchors: {report['counts']['anchor_count']}")
    print(f"- High confidence: {report['counts']['high_confidence']}")
    print(f"- Medium confidence: {report['counts']['medium_confidence']}")
    print(f"- Low confidence: {report['counts']['low_confidence']}")
    print(f"- Source checks: {report['counts']['reachable_sources']} reachable / {report['counts']['source_count']} total")
    print(f"- Processed output: {PROCESSED_PATH}")


if __name__ == "__main__":
    main()
