#!/usr/bin/env python3
"""Process early usage and etymology evidence for privacy.

The process stage keeps candidates and uncertainty explicit and separates:
- term/spelling-level evidence
- relation-to-root notes
- earliest candidate vs earliest reliable observations
"""

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
LAYER_ID = "etymology_early_usage"
RAW_PATH = RAW_DIR / "privacy_etymology_early_usage_raw.json"
PROCESSED_PATH = PROCESSED_DIR / "privacy_etymology_early_usage_processed.json"
JSON_REPORT_PATH = REPORTS_DIR / "privacy_etymology_early_usage_data_report.json"
MD_REPORT_PATH = REPORTS_DIR / "privacy_etymology_early_usage_data_report.md"


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


def year_value(item: dict[str, Any]) -> int | None:
    value = item.get("year")
    if value is None:
        return None
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


def normalize_category(value: str) -> str:
    if value in {
        "private_public_distinction",
        "secrecy_confidentiality",
        "seclusion_withdrawal",
        "domestic_private_life",
        "freedom_from_observation",
        "freedom_from_intrusion",
        "legal_right",
        "information_control",
        "data_platform_governance",
        "surveillance_visibility",
        "uncertain",
    }:
        return value
    return "uncertain"


def infer_evidence_type(item: dict[str, Any]) -> dict[str, str]:
    term = str(item.get("term", ""))
    date_label = str(item.get("date_label", "")).lower()
    evidence = str(item.get("evidence_excerpt", "")).lower()
    if "unfetched" in item.get("id", "") or "source_unfetched" in item.get("evidence_type", ""):
        return {"basis": "unfetched_source", "confidence": "low"}
    if "first known" in evidence and "known use" in evidence:
        return {"basis": "dictionary_claim", "confidence": "medium"}
    if date_label not in {"", "uncertain", "none"} and year_value(item) is not None:
        return {"basis": "extractable_year_candidate", "confidence": "low" if item.get("year") in {None, ""} else "medium"}
    return {"basis": "unverified_claim", "confidence": "low"}


def group_root_family(raw_root: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return sorted(
        [
            {
                "term": item.get("term"),
                "relation_to_privacy": item.get("relation_to_privacy"),
                "spelling": item.get("spelling"),
                "category": item.get("category"),
                "notes": item.get("notes", ""),
            }
            for item in raw_root
        ],
        key=lambda item: item.get("term", ""),
    )


def build_entries(raw_records: list[dict[str, Any]]) -> list[dict[str, Any]]:
    rows = []
    for index, item in enumerate(raw_records, start=1):
        inferred = infer_evidence_type(item)
        rows.append(
            {
                "id": item.get("id", f"privacy_etym_unscoped_{index:04d}"),
                "term": item.get("term"),
                "spelling": item.get("spelling"),
                "year": year_value(item),
                "date_label": item.get("date_label"),
                "meaning_category": normalize_category(str(item.get("meaning_category", "uncertain"))),
                "definition_or_gloss": item.get("definition_or_gloss", ""),
                "evidence_excerpt": item.get("evidence_excerpt", ""),
                "source_title": item.get("source_title"),
                "source_author": item.get("source_author"),
                "source_url": item.get("source_url"),
                "source_type": item.get("source_type"),
                "evidence_basis": inferred["basis"],
                "confidence": item.get("confidence", inferred["confidence"]),
                "notes": item.get("notes", ""),
            }
        )
    return rows


def earliest_year_summary(entries: list[dict[str, Any]], min_confidence: str = "medium") -> int | None:
    confidence_order = {"high": 3, "medium": 2, "low": 1}
    target = confidence_order.get(min_confidence, 2)
    valid = [
        entry
        for entry in entries
        if isinstance(entry.get("year"), int) and confidence_order.get(str(entry.get("confidence", "low")), 1) >= target
    ]
    if not valid:
        return None
    return min(int(entry["year"]) for entry in valid)


def reliable_candidates(entries: list[dict[str, Any]]) -> list[dict[str, Any]]:
    reliable = []
    for entry in entries:
        if str(entry.get("confidence", "low")) in {"high", "medium"} and isinstance(entry.get("year"), int):
            reliable.append(entry)
    return sorted(reliable, key=lambda item: item["year"])


def count_by_field(items: list[dict[str, Any]], field: str) -> dict[str, int]:
    counts = Counter(item.get(field) for item in items)
    return {str(key): int(count) for key, count in counts.items() if key}


def build_processed(raw: dict[str, Any]) -> dict[str, Any]:
    raw_entries = raw.get("attestation_records", [])
    entries = build_entries(raw_entries)
    root_family = group_root_family(raw.get("root_family", []))
    earliest_candidates = sorted(
        (
            {
                "term": entry["term"],
                "year": entry["year"],
                "date_label": entry["date_label"],
                "source_title": entry["source_title"],
                "meaning_category": entry["meaning_category"],
                "confidence": entry["confidence"],
                "evidence_basis": entry["evidence_basis"],
            }
            for entry in entries
            if entry.get("year") is not None
        ),
        key=lambda item: item["year"] if isinstance(item["year"], int) else 9999,
    )
    reliable = reliable_candidates(entries)
    unreliable = [entry for entry in entries if entry not in reliable]

    return {
        "word": WORD,
        "layer_id": LAYER_ID,
        "title": "Etymology and early usage evidence for privacy",
        "entries": entries,
        "root_family": root_family,
        "earliest_candidates": earliest_candidates,
        "earliest_reliable": reliable[0]["year"] if reliable else None,
        "uncertain_items": [
            {
                "term": item["term"],
                "spelling": item["spelling"],
                "date_label": item["date_label"],
                "source": item["source_title"],
                "notes": item["notes"],
                "confidence": item["confidence"],
                "evidence_basis": item["evidence_basis"],
            }
            for item in unreliable
            if item.get("confidence") in {"low", "uncertain"}
        ],
        "notes": [
            "Entries are candidates, not final attestations.",
            "Source claims and extracted hints remain un-normalized for legal sense and OCR ambiguity.",
            "Use direct primary quotations to upgrade confidence where possible.",
        ],
        "source_notes": [
            "Many dictionary pages are not API-friendly and sometimes hide full historical notes behind scripts or scripts/ads.",
            "Subscription sources (OED-like records) were included for follow-up, but may remain inaccessible in this pass.",
            "Early date candidates are marked as candidates unless supported by direct primary source snippets.",
        ],
        "source_checks": raw.get("source_status", raw.get("source_checks", [])),
        "statistics": {
            "entry_count": len(entries),
            "root_family_count": len(root_family),
            "earliest_candidate_year": earliest_candidates[0]["year"] if earliest_candidates else None,
            "earliest_reliable_year": reliable[0]["year"] if reliable else None,
            "evidence_by_confidence": count_by_field(entries, "confidence"),
            "evidence_by_basis": count_by_field(entries, "evidence_basis"),
            "evidence_by_term": count_by_field(entries, "term"),
            "evidence_by_category": count_by_field(entries, "meaning_category"),
        },
    }


def build_report_json(processed: dict[str, Any], report_paths: dict[str, str]) -> dict[str, Any]:
    entries = processed.get("entries", [])
    return {
        "metadata": {
            "word": WORD,
            "layer_id": LAYER_ID,
            "generated_at": utc_now(),
            "generated_by_script": "scripts/process_privacy_etymology_early_usage.py",
            "raw_source": str(RAW_PATH.relative_to(ROOT)),
            "outputs": report_paths,
        },
        "summary": {
            "earliest_candidate_year": next(
                (entry["year"] for entry in processed["earliest_candidates"] if entry.get("year") is not None),
                None,
            ),
            "earliest_reliable_year": processed["earliest_reliable"],
            "entries": len(entries),
            "root_family_count": processed["statistics"]["root_family_count"],
            "uncertain_items": len(processed["uncertain_items"]),
            "high_confidence_terms": len([entry for entry in entries if entry["confidence"] == "high"]),
            "medium_confidence_terms": len([entry for entry in entries if entry["confidence"] == "medium"]),
            "low_confidence_terms": len([entry for entry in entries if entry["confidence"] == "low"]),
        },
        "evidence_category_counts": processed["statistics"]["evidence_by_category"],
        "evidence_term_counts": processed["statistics"]["evidence_by_term"],
        "earliest_candidates": processed["earliest_candidates"],
        "uncertain_candidates": processed["uncertain_items"],
        "recommendations": {
            "immediate_followups": [
                "Cross-check historical dictionary citations directly for private/privy earliest printed usage.",
                "Prioritize direct dated examples where privacy appears with privacy rights or intrusion language.",
                "Separate direct attestations (date + quotation context) from dictionary 'first known use' claims.",
            ],
            "high_value_uncertainties": [
                "Whether privacy should anchor as a noun before or after legal-meaning consolidation (19th vs 20th c. records).",
                "Whether privy/private forms function as direct historical ancestors or adjacent semantic neighbors.",
            ],
        },
        "next_research_questions": [
            "Can we find one primary 17th-18th century dictionary or text citation for the earliest private/privacy family split?",
            "Do legal sources shift from private life/seclusion to rights/intrusion before formal n-gram signal appears?",
            "Which candidate sources remain reliable after anti-bot or script-rendered page barriers are bypassed?",
        ],
    }


def build_markdown_report(processed: dict[str, Any], report: dict[str, Any]) -> str:
    candidates = "\n".join(
        f"- {item['term']} ({item['year']}, {item['source_title']}, confidence: {item['confidence']})"
        for item in processed["entries"][:25]
    ) or "- None."
    root_lines = "\n".join(f"- {item['term']} → {item['relation_to_privacy']} ({item.get('notes', '')})" for item in processed["root_family"])
    return f"""# Privacy Etymology and Early Usage Report

Generated: {report['metadata']['generated_at']}

## What Was Collected

- Evidence records: {report['summary']['entries']}
- Root-family rows: {report['summary']['root_family_count']}
- High-confidence records: {report['summary']['high_confidence_terms']}
- Medium-confidence records: {report['summary']['medium_confidence_terms']}
- Low-confidence/uncertain records: {report['summary']['low_confidence_terms']}

## Candidate earliest dates

- Earliest candidate: {report['summary']['earliest_candidate_year']}
- Earliest reliable: {report['summary']['earliest_reliable_year']}

## Evidence rows (preview)

{candidates}

## Root-family notes

{root_lines if root_lines else "- None."}

## Source checks / follow-ups

- Source checks run: {len(processed.get('source_checks', []))}
- Reported unknown or blocked sources appear in source check details in raw output.

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
    payload["etymology_early_usage_layer"] = {
        "layer_id": processed["layer_id"],
        "title": processed["title"],
        "generated_at": utc_now(),
        "generated_by_script": "scripts/process_privacy_etymology_early_usage.py",
        "entry_count": len(processed["entries"]),
        "earliest_candidate_year": processed["statistics"]["earliest_candidate_year"],
        "earliest_reliable_year": processed["earliest_reliable"],
    }
    write_json(GENERATED_PREVIEW_PATH, payload)


def main() -> None:
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)

    raw = read_json(RAW_PATH, {"attestation_records": [], "root_family": [], "source_status": []})
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

    print("Privacy etymology and early usage processing summary")
    print(f"- Entries: {report['summary']['entries']}")
    print(f"- Earliest candidate year: {report['summary']['earliest_candidate_year']}")
    print(f"- Earliest reliable year: {report['summary']['earliest_reliable_year']}")
    print(f"- Uncertain items: {report['summary']['uncertain_items']}")


if __name__ == "__main__":
    main()
