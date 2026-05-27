#!/usr/bin/env python3
"""Build privacy chart 01B legal-injury matrix data from source attempts and phrase series."""

from __future__ import annotations

import json
import math
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
RESEARCH_DIR = ROOT / "docs" / "research" / "privacy"
RAW_PATH = RESEARCH_DIR / "raw" / "privacy_legal_injury_matrix_raw.json"
FREQUENCY_PATH = RESEARCH_DIR / "processed" / "privacy_frequency_terms_processed.json"
PROCESSED_DIR = RESEARCH_DIR / "processed"
REPORTS_DIR = RESEARCH_DIR / "reports"
PROCESSED_PATH = PROCESSED_DIR / "privacy_legal_injury_matrix_processed.json"
REPORT_JSON_PATH = REPORTS_DIR / "privacy_legal_injury_matrix_data_report.json"
REPORT_MD_PATH = REPORTS_DIR / "privacy_legal_injury_matrix_data_report.md"
GENERATED_PATH = ROOT / "src" / "data" / "generated" / "privacy_legal_injury_matrix.json"
INDEX_PATH = RESEARCH_DIR / "privacy_research_index.json"
PREVIEW_PATH = ROOT / "src" / "data" / "generated" / "privacy_chart_data_preview.json"

LEGAL_PHRASES = [
    "right to privacy",
    "invasion of privacy",
    "privacy rights",
    "privacy law",
    "breach of privacy",
    "violation of privacy",
    "expectation of privacy",
    "reasonable expectation of privacy",
]

BRANCHES = [
    {
        "branch_id": "right_articulated",
        "label": "Right articulated",
        "description": "Privacy becomes a legal claim rather than only a condition of seclusion.",
        "color": "#7E42B8",
    },
    {
        "branch_id": "publicity_press",
        "label": "Publicity and press",
        "description": "The injury is often exposure: press, publicity, image, name, and reputation.",
        "color": "#DDBE24",
    },
    {
        "branch_id": "name_likeness",
        "label": "Name / likeness",
        "description": "Early statutory and case-law forms treat unauthorized commercial identity use as privacy harm.",
        "color": "#C7663D",
    },
    {
        "branch_id": "tort_injury",
        "label": "Tort injury",
        "description": "Privacy becomes a civil injury vocabulary: invasion, disclosure, intrusion, appropriation.",
        "color": "#2F9F5F",
    },
    {
        "branch_id": "constitutional_surveillance",
        "label": "Constitutional edge",
        "description": "Surveillance and home/correspondence concerns begin to pull privacy toward constitutional language.",
        "color": "#2E8FAF",
    },
    {
        "branch_id": "human_rights",
        "label": "Human-rights language",
        "description": "Privacy enters international rights language around family, home, correspondence, and interference.",
        "color": "#1F6678",
    },
]


def load_json(path: Path) -> Any:
    if not path.exists():
        raise FileNotFoundError(f"Required file missing: {path}")
    return json.loads(path.read_text(encoding="utf-8"))


def value_for_year(values: list[dict[str, Any]], year: int) -> float:
    for item in values:
        if item.get("year") == year:
            return float(item.get("value") or 0)
    return 0.0


def phrase_records(frequency: dict[str, Any]) -> list[dict[str, Any]]:
    records: list[dict[str, Any]] = []
    for row in frequency.get("series", []):
        term = row.get("term")
        if term not in LEGAL_PHRASES or row.get("status") != "collected":
            continue
        values = row.get("values", [])
        window_values = [value_for_year(values, year) for year in range(1890, 1951)]
        nonzero = [(1890 + index, value) for index, value in enumerate(window_values) if value > 0]
        records.append(
            {
                "term": term,
                "source": row.get("source"),
                "query_id": row.get("query_id"),
                "mean_1890_1950": sum(window_values) / len(window_values),
                "max_1890_1950": max(window_values) if window_values else 0,
                "peak_year_1890_1950": 1890 + max(range(len(window_values)), key=lambda i: window_values[i])
                if window_values
                else None,
                "nonzero_years_1890_1950": len(nonzero),
                "first_nonzero_1890_1950": nonzero[0][0] if nonzero else None,
                "values": [{"year": 1890 + index, "value": value} for index, value in enumerate(window_values)],
            }
        )
    return records


def yearly_phrase_signal(records: list[dict[str, Any]]) -> list[dict[str, Any]]:
    output = []
    for year in range(1890, 1951):
        values = []
        by_phrase: dict[str, float] = {}
        for record in records:
            value = value_for_year(record.get("values", []), year)
            values.append(value)
            by_phrase[record["term"]] = by_phrase.get(record["term"], 0) + value
        output.append(
            {
                "year": year,
                "value": sum(values) / len(records) if records else 0,
                "raw_total": sum(values),
                "active_phrase_count": sum(1 for value in values if value > 0),
                "top_phrase": max(by_phrase.items(), key=lambda item: item[1])[0] if by_phrase else None,
            }
        )
    return output


def strength_to_radius(strength: float) -> float:
    return round(7 + math.sqrt(max(strength, 0)) * 8.2, 2)


def build_matrix_nodes(anchors: list[dict[str, Any]], source_attempts: list[dict[str, Any]]) -> list[dict[str, Any]]:
    attempt_by_anchor = {attempt.get("anchor_id"): attempt for attempt in source_attempts}
    nodes = []
    for anchor in anchors:
        attempt = attempt_by_anchor.get(anchor.get("anchor_id"), {})
        nodes.append(
            {
                **anchor,
                "x_year": anchor["year"],
                "branch_id": anchor["branch_id"],
                "radius": strength_to_radius(anchor.get("strength", 1)),
                "source_reachable": bool(attempt.get("reachable")),
                "source_status": attempt.get("status"),
                "source_checked_at": attempt.get("checked_at"),
            }
        )
    return sorted(nodes, key=lambda item: (item["year"], item["branch_id"]))


def update_index() -> None:
    if not INDEX_PATH.exists():
        return
    index = load_json(INDEX_PATH)
    layers = index.setdefault("layers", [])
    layer = {
        "layer_id": "legal_injury_matrix",
        "processed_path": "docs/research/privacy/processed/privacy_legal_injury_matrix_processed.json",
        "report_path": "docs/research/privacy/reports/privacy_legal_injury_matrix_data_report.md",
        "status": "derived_for_chart01b",
        "notes": "1890-1950 legal-injury matrix for privacy chart 01B; not a separate chart number.",
    }
    layers[:] = [item for item in layers if item.get("layer_id") != "legal_injury_matrix"]
    layers.append(layer)
    index["updated_at"] = datetime.now(timezone.utc).isoformat()
    INDEX_PATH.write_text(json.dumps(index, indent=2, ensure_ascii=False), encoding="utf-8")


def update_preview() -> None:
    if not PREVIEW_PATH.exists():
        return
    preview = load_json(PREVIEW_PATH)
    preview["legal_injury_matrix_layer"] = {
        "layer_id": "legal_injury_matrix",
        "title": "From privacy to legal injury",
        "status": "derived_for_chart01b",
        "processed_path": "docs/research/privacy/processed/privacy_legal_injury_matrix_processed.json",
        "generated_path": "src/data/generated/privacy_legal_injury_matrix.json",
        "generated_by_script": "scripts/process_privacy_legal_injury_matrix.py",
        "note": "Privacy chart 01B layer; intentionally not chart02.",
    }
    PREVIEW_PATH.write_text(json.dumps(preview, indent=2, ensure_ascii=False), encoding="utf-8")


def main() -> int:
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    GENERATED_PATH.parent.mkdir(parents=True, exist_ok=True)

    raw = load_json(RAW_PATH)
    frequency = load_json(FREQUENCY_PATH)
    phrases = phrase_records(frequency)
    yearly_signal = yearly_phrase_signal(phrases)
    matrix_nodes = build_matrix_nodes(raw.get("anchors", []), raw.get("source_attempts", []))

    sources = [
        {
            "source_id": "source_verified_legal_anchors",
            "description": "Curated legal and human-rights anchors with source reachability attempts.",
            "record_count": len(matrix_nodes),
            "reachable_count": sum(1 for node in matrix_nodes if node.get("source_reachable")),
        },
        {
            "source_id": "google_books_ngram_legal_phrases",
            "description": "Existing privacy frequency_terms phrase series filtered to legal-rights vocabulary.",
            "record_count": len(phrases),
            "year_range": [1890, 1950],
        },
    ]

    payload = {
        "word": "privacy",
        "layer_id": "legal_injury_matrix",
        "status": "derived_for_chart01b",
        "intended_use": "privacy_chart01_second_phase_panel",
        "title": "From Privacy to Legal Injury",
        "subtitle": "1890-1950 legal-rights and privacy-injury formation",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "generated_by_script": "scripts/process_privacy_legal_injury_matrix.py",
        "year_range": [1890, 1950],
        "branches": BRANCHES,
        "matrix_nodes": matrix_nodes,
        "phrase_series": phrases,
        "yearly_phrase_signal": yearly_signal,
        "scale": [
            {"label": "minor citation", "strength": 2, "radius": strength_to_radius(2)},
            {"label": "doctrinal marker", "strength": 3, "radius": strength_to_radius(3)},
            {"label": "major threshold", "strength": 5, "radius": strength_to_radius(5)},
        ],
        "small_charts": {
            "size_scale": "Bubble size encodes curated source strength, not objective legal importance.",
            "legal_phrase_line": "Line uses averaged Ngram phrase signal across selected legal phrases, 1890-1950.",
        },
        "sources": sources,
        "source_attempts": raw.get("source_attempts", []),
        "failed_sources": raw.get("failed_sources", []),
        "limitations": [
            "This is a design-ready legal-history scaffold, not an exhaustive legal history.",
            "Ngram phrase hits before modern legal consolidation can include false positives and OCR noise.",
            "Several case-law anchors are source-backed through public summaries or public opinion repositories; final legal copy should verify quotation-level text.",
            "This is chart01B within privacy, not chart02.",
        ],
    }

    PROCESSED_PATH.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")
    GENERATED_PATH.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")

    report = {
        "word": "privacy",
        "layer_id": "legal_injury_matrix",
        "generated_at": payload["generated_at"],
        "node_count": len(matrix_nodes),
        "branch_count": len(BRANCHES),
        "phrase_series_count": len(phrases),
        "yearly_signal_points": len(yearly_signal),
        "reachable_sources": sources[0]["reachable_count"],
        "failed_sources": payload["failed_sources"],
    }
    REPORT_JSON_PATH.write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")
    REPORT_MD_PATH.write_text(
        "\n".join(
            [
                "# Privacy legal injury matrix",
                "",
                "Layer ID: `legal_injury_matrix`",
                "",
                "This layer supports privacy chart 01B, `From Privacy to Legal Injury`, covering 1890-1950.",
                "",
                f"- Matrix nodes: {len(matrix_nodes)}",
                f"- Legal branches: {len(BRANCHES)}",
                f"- Phrase series: {len(phrases)}",
                f"- Yearly phrase points: {len(yearly_signal)}",
                f"- Reachable legal sources: {sources[0]['reachable_count']} / {len(matrix_nodes)}",
                "",
                "## Use",
                "",
                "Use as a legal evidence matrix plus a bubble-size scale and a small legal phrase line chart. Do not treat this as chart02.",
                "",
                "## Limitations",
                "",
                *[f"- {item}" for item in payload["limitations"]],
                "",
            ]
        ),
        encoding="utf-8",
    )

    update_index()
    update_preview()
    print(f"Wrote {PROCESSED_PATH}")
    print(f"Wrote {GENERATED_PATH}")
    print(f"Nodes: {len(matrix_nodes)}")
    print(f"Phrase series: {len(phrases)}")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:  # noqa: BLE001
        print(f"privacy legal injury processing failed: {exc}", file=sys.stderr)
        raise SystemExit(1)
