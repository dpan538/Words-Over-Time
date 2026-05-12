#!/usr/bin/env python3
"""Process hub etymology and attestation raw files into second-pass outputs."""

from __future__ import annotations

import json
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
RESEARCH_DIR = ROOT / "docs" / "research" / "hub"
RAW_DIR = RESEARCH_DIR / "raw"
PROCESSED_DIR = RESEARCH_DIR / "processed"
REPORTS_DIR = RESEARCH_DIR / "reports"
GENERATED_PREVIEW = ROOT / "src" / "data" / "generated" / "hub_chart_data_preview.json"
RESEARCH_PREVIEW = PROCESSED_DIR / "hub_chart_data_preview.json"


SENSE_ORDER = [
    "mechanical_core",
    "central_place",
    "transport_logistics",
    "network_system",
    "institutional_cluster",
    "digital_platform",
]

SENSE_LABELS = {
    "mechanical_core": "Mechanical wheel center",
    "central_place": "Central place or focus",
    "transport_logistics": "Transport and logistics node",
    "network_system": "Communication, computing, or network node",
    "institutional_cluster": "Institutional, economic, cultural, or knowledge cluster",
    "digital_platform": "Digital, content, data, or resource platform",
}


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def sorted_candidates(candidates: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return sorted(
        candidates,
        key=lambda item: (
            item.get("evidence_year") is None and item.get("claimed_year") is None,
            item.get("evidence_year") or item.get("claimed_year") or 9999,
            item.get("id", ""),
        ),
    )


def is_hub_attestation(item: dict[str, Any]) -> bool:
    return str(item.get("term", "")).lower() != "nave"


def claimed_years(candidates: list[dict[str, Any]], sense_id: str | None = None, include_related: bool = False) -> list[int]:
    return sorted(
        int(item["claimed_year"])
        for item in candidates
        if item.get("claimed_year") is not None
        and item.get("is_dictionary_claim")
        and (include_related or is_hub_attestation(item))
        and (sense_id is None or item.get("sense_id") == sense_id)
    )


def supported_years(candidates: list[dict[str, Any]], sense_id: str | None = None, include_related: bool = False) -> list[int]:
    return sorted(
        int(item["evidence_year"])
        for item in candidates
        if item.get("evidence_year") is not None
        and item.get("is_direct_attestation")
        and not item.get("is_dictionary_claim")
        and (include_related or is_hub_attestation(item))
        and (sense_id is None or item.get("sense_id") == sense_id)
    )


def direct_corpus_years(candidates: list[dict[str, Any]], sense_id: str | None = None, include_related: bool = False) -> list[int]:
    corpus_types = {"book", "newspaper", "article", "corpus"}
    return sorted(
        int(item["evidence_year"])
        for item in candidates
        if item.get("evidence_year") is not None
        and item.get("is_direct_attestation")
        and item.get("source_type") in corpus_types
        and (include_related or is_hub_attestation(item))
        and (sense_id is None or item.get("sense_id") == sense_id)
    )


def min_or_none(values: list[int]) -> int | None:
    return min(values) if values else None


def confidence_for_group(items: list[dict[str, Any]]) -> str:
    if any(item.get("confidence") == "high" for item in items):
        return "high"
    if any(item.get("confidence") == "medium" for item in items):
        return "medium"
    return "low" if items else "low"


def evidence_quality_for_group(items: list[dict[str, Any]]) -> str:
    if any(item.get("is_direct_attestation") and item.get("confidence") == "high" for item in items):
        return "direct_high"
    if any(item.get("is_direct_attestation") for item in items):
        return "direct_needs_review"
    if any(item.get("is_dictionary_claim") for item in items):
        return "dictionary_claim_only"
    return "not_found"


def build_earliest_attestations(attestations_raw: dict[str, Any]) -> dict[str, Any]:
    candidates = sorted_candidates(attestations_raw.get("attestation_candidates", []))
    normalized = []
    for item in candidates:
        normalized.append(
            {
                "id": item.get("id"),
                "term": item.get("term"),
                "sense_id": item.get("sense_id"),
                "sense_label": item.get("sense_label") or SENSE_LABELS.get(item.get("sense_id"), ""),
                "claimed_year": item.get("claimed_year"),
                "evidence_year": item.get("evidence_year"),
                "year_type": item.get("year_type"),
                "source_title": item.get("source_title"),
                "source_author": item.get("source_author"),
                "source_date": item.get("source_date"),
                "source_url": item.get("source_url"),
                "source_type": item.get("source_type"),
                "evidence_text_short": item.get("evidence_text_short", ""),
                "definition_or_context_summary": item.get("definition_or_context_summary", ""),
                "is_direct_attestation": bool(item.get("is_direct_attestation")),
                "is_dictionary_claim": bool(item.get("is_dictionary_claim")),
                "confidence": item.get("confidence", "low"),
                "reliability_notes": item.get("reliability_notes", ""),
                "copyright_notes": item.get("copyright_notes", ""),
            }
        )
    return {
        "metadata": {
            "word": "hub",
            "generated_at": utc_now(),
            "generated_by_script": "scripts/process_hub_etymology.py",
            "notes": [
                "claimed_year and evidence_year are intentionally separated.",
                "dictionary_claim rows are not treated as confirmed corpus attestations.",
            ],
        },
        "attestations": normalized,
    }


def build_etymology_summary(etymology_raw: dict[str, Any], attestations: list[dict[str, Any]]) -> dict[str, Any]:
    earliest_claimed = min_or_none(claimed_years(attestations))
    earliest_supported = min_or_none(supported_years(attestations))
    earliest_corpus = min_or_none(direct_corpus_years(attestations))
    source_limitations = []
    for source in etymology_raw.get("etymology_source_status", []):
        if source.get("access_status") != "collected":
            source_limitations.append(
                {
                    "source": source.get("source_name"),
                    "url": source.get("url"),
                    "status": source.get("access_status"),
                    "error": source.get("known_live_issue") or source.get("error"),
                }
            )
    source_limitations.extend(
        [
            {
                "source": "Google Books API",
                "status": "skipped",
                "error": "First pass hit HTTP 429; second pass did not retry aggressively.",
            },
            {
                "source": "OCR/search result snippets",
                "status": "limited",
                "error": "LOC and Internet Archive evidence needs page/image verification before final chart copy.",
            },
        ]
    )

    return {
        "word": "hub",
        "generated_at": utc_now(),
        "generated_by_script": "scripts/process_hub_etymology.py",
        "etymology_status": "uncertain",
        "earliest_claimed_year": "1640s" if earliest_claimed == 1640 else earliest_claimed,
        "earliest_supported_attestation_year": earliest_supported,
        "earliest_direct_corpus_year": earliest_corpus,
        "earliest_sense": "Mechanical wheel center",
        "origin_notes": (
            "Public etymology sources agree that the earliest sense is the solid center of a wheel, "
            "but they frame the ultimate origin as uncertain or only probably connected with hob/hubbe."
        ),
        "possible_origin_theories": etymology_raw.get("possible_origin_theories", []),
        "related_terms": etymology_raw.get("related_terms", []),
        "semantic_shift_summary": [
            {
                "from_sense": "mechanical_core",
                "to_sense": "central_place",
                "approximate_period": "1850s",
                "evidence_status": "partial",
                "notes": "Etymonline dates the center-of-interest/activity sense to Holmes in 1858; primary text should be independently checked.",
            },
            {
                "from_sense": "central_place",
                "to_sense": "transport_logistics",
                "approximate_period": "early 20th century in current evidence",
                "evidence_status": "partial",
                "notes": "Current direct snippets include transit hub in 1908, railway hub in 1943, and transportation hub in 1955; earlier Ngram signals remain unverified.",
            },
            {
                "from_sense": "transport_logistics",
                "to_sense": "network_system",
                "approximate_period": "late 20th century",
                "evidence_status": "uncertain",
                "notes": "Hub-and-spoke has a Merriam-Webster 1980 dictionary claim; network/computing direct attestations still need better corpus evidence.",
            },
            {
                "from_sense": "network_system",
                "to_sense": "digital_platform",
                "approximate_period": "web/platform era",
                "evidence_status": "uncertain",
                "notes": "First-pass Ngram signals exist for digital/content/data hub, but this pass did not find strong direct early snippets.",
            },
        ],
        "source_limitations": source_limitations,
    }


def build_semantic_shift_attestations(attestations: list[dict[str, Any]]) -> dict[str, Any]:
    groups = []
    for sense_id in SENSE_ORDER:
        items = [item for item in attestations if item.get("sense_id") == sense_id and is_hub_attestation(item)]
        earliest_claimed = min_or_none(claimed_years(items))
        earliest_supported = min_or_none(supported_years(items))
        earliest_corpus = min_or_none(direct_corpus_years(items))
        notes = []
        if earliest_supported and earliest_corpus and earliest_supported != earliest_corpus:
            notes.append(f"Earliest supported dated source is {earliest_supported}; earliest direct corpus snippet is {earliest_corpus}.")
        elif earliest_supported:
            notes.append(f"Earliest supported dated evidence in this layer is {earliest_supported}.")
        elif earliest_claimed:
            notes.append("Only dictionary/reference year claims were found in this pass.")
        else:
            notes.append("No usable earliest attestation found in this pass.")
        if sense_id == "digital_platform":
            notes.append("Digital/platform senses need contemporary corpus validation beyond Ngram.")
        groups.append(
            {
                "sense_id": sense_id,
                "sense_label": SENSE_LABELS[sense_id],
                "earliest_claimed_year": "1640s" if earliest_claimed == 1640 else earliest_claimed,
                "earliest_supported_year": earliest_supported,
                "earliest_direct_corpus_year": earliest_corpus,
                "attestation_ids": [item.get("id") for item in items],
                "confidence": confidence_for_group(items),
                "evidence_quality": evidence_quality_for_group(items),
                "notes": " ".join(notes),
            }
        )
    return {
        "metadata": {
            "word": "hub",
            "generated_at": utc_now(),
            "generated_by_script": "scripts/process_hub_etymology.py",
        },
        "semantic_shift_attestations": groups,
    }


def build_confidence_matrix(attestations: list[dict[str, Any]], search_log: dict[str, Any], etymology_raw: dict[str, Any]) -> dict[str, Any]:
    confidence_counts = Counter(item.get("confidence", "low") for item in attestations)
    failed_sources = [
        {
            "source": source.get("source_name"),
            "url": source.get("url"),
            "error": source.get("known_live_issue") or source.get("error"),
        }
        for source in etymology_raw.get("etymology_source_status", [])
        if source.get("access_status") != "collected"
    ]
    blocked_or_failed_searches = [
        {
            "source": item.get("source"),
            "query": item.get("query"),
            "status": item.get("status"),
            "notes": item.get("notes"),
        }
        for item in search_log.get("searches", [])
        if item.get("status") in {"failed", "skipped"}
    ]
    rows = []
    for item in attestations:
        if item.get("confidence") == "high":
            reason = "Readable dated primary-source evidence or historical dictionary with strong citation."
        elif item.get("confidence") == "medium":
            reason = "Reliable dictionary/reference claim or dated source that needs quotation/image verification."
        else:
            reason = "OCR, metadata, or sense ambiguity keeps this as a lead only."
        rows.append(
            {
                "attestation_id": item.get("id"),
                "term": item.get("term"),
                "sense_id": item.get("sense_id"),
                "year_basis": item.get("year_type"),
                "claimed_year": item.get("claimed_year"),
                "evidence_year": item.get("evidence_year"),
                "confidence": item.get("confidence"),
                "is_dictionary_claim": item.get("is_dictionary_claim"),
                "is_direct_attestation": item.get("is_direct_attestation"),
                "quality_reason": reason,
                "reliability_notes": item.get("reliability_notes"),
            }
        )
    return {
        "metadata": {
            "word": "hub",
            "generated_at": utc_now(),
            "generated_by_script": "scripts/process_hub_etymology.py",
        },
        "confidence_counts": {
            "high": confidence_counts.get("high", 0),
            "medium": confidence_counts.get("medium", 0),
            "low": confidence_counts.get("low", 0),
        },
        "rules": {
            "high": "Dated historical dictionary with cited quotation, or readable dated primary-source text in the target sense.",
            "medium": "Reliable dictionary/reference first-use year without visible quotation, or readable dated snippet with caution.",
            "low": "Poor OCR, ambiguous sense, metadata-only evidence, secondary uncited source, or search lead only.",
        },
        "attestation_confidence": rows,
        "failed_or_blocked_reference_sources": failed_sources,
        "failed_or_blocked_searches": blocked_or_failed_searches,
    }


def year_display(value: Any) -> str:
    return "" if value is None else str(value)


def build_report(
    etymology_summary: dict[str, Any],
    earliest_attestations: dict[str, Any],
    semantic_groups: dict[str, Any],
    confidence_matrix: dict[str, Any],
    historical_raw: dict[str, Any],
    search_log: dict[str, Any],
    outputs: dict[str, str],
) -> dict[str, Any]:
    attestations = earliest_attestations["attestations"]
    confidence_counts = confidence_matrix["confidence_counts"]
    return {
        "metadata": {
            "word": "hub",
            "generated_at": utc_now(),
            "generated_by_script": "scripts/process_hub_etymology.py",
        },
        "summary": {
            "attestation_candidates": len(attestations),
            "etymology_sources_collected": sum(
                1 for source in load_json(RAW_DIR / "hub_etymology_sources_raw.json")["etymology_source_status"] if source.get("access_status") == "collected"
            ),
            "etymology_sources_attempted": len(load_json(RAW_DIR / "hub_etymology_sources_raw.json")["etymology_source_status"]),
            "earliest_claimed_year": etymology_summary["earliest_claimed_year"],
            "earliest_supported_year": etymology_summary["earliest_supported_attestation_year"],
            "earliest_direct_corpus_year": etymology_summary["earliest_direct_corpus_year"],
            "earliest_sense": etymology_summary["earliest_sense"],
            "confidence_counts": confidence_counts,
            "semantic_shift_groups": len(semantic_groups["semantic_shift_attestations"]),
            "failed_or_blocked_sources": len(confidence_matrix["failed_or_blocked_reference_sources"]),
            "failed_or_blocked_searches": len(confidence_matrix["failed_or_blocked_searches"]),
        },
        "etymology": etymology_summary,
        "sense_by_sense": semantic_groups["semantic_shift_attestations"],
        "historical_dictionary_entries": historical_raw.get("historical_dictionary_entries", []),
        "source_limitations": etymology_summary.get("source_limitations", []),
        "search_summary": {
            "search_entries": len(search_log.get("searches", [])),
            "usable_search_evidence_entries": sum(1 for item in search_log.get("searches", []) if item.get("usable_evidence")),
        },
        "recommended_next_chart_implications": [
            "A first chart can anchor hub in the physical wheel center before any platform or tech use.",
            "A transfer-model chart can show wheel to city to transport to network to platform.",
            "Compound growth can compare wheel hub, transport hub, network hub, innovation hub, and data hub.",
            "A centrality chart can separate movement/access from control/concentration.",
        ],
        "outputs": outputs,
    }


def markdown_report(report: dict[str, Any]) -> str:
    summary = report["summary"]
    etymology = report["etymology"]
    table_rows = [
        "| Sense | Earliest claimed year | Earliest supported year | Evidence quality | Notes |",
        "|---|---:|---:|---|---|",
    ]
    for row in report["sense_by_sense"]:
        table_rows.append(
            f"| {row['sense_label']} | {year_display(row['earliest_claimed_year'])} | {year_display(row['earliest_supported_year'])} | {row['evidence_quality']} | {row['notes']} |"
        )
    limitation_lines = [
        f"- {item.get('source')}: {item.get('status')} ({item.get('error')})"
        for item in report["source_limitations"]
    ]
    output_lines = [f"- `{path}`" for path in report["outputs"].values()]
    theory_lines = [
        f"- {item['theory']} Source: {item['source']}; confidence: {item['confidence']}."
        for item in etymology["possible_origin_theories"]
    ]
    related_lines = [
        f"- {item['term']}: {item['relationship']} {item['notes']}"
        for item in etymology["related_terms"]
    ]
    shift_lines = [
        f"- {item['from_sense']} -> {item['to_sense']} ({item['approximate_period']}): {item['evidence_status']}. {item['notes']}"
        for item in etymology["semantic_shift_summary"]
    ]
    implication_lines = [f"- {item}" for item in report["recommended_next_chart_implications"]]

    return f"""# Hub Etymology And Attestation Report

Generated: {report['metadata']['generated_at']}

## Summary

- Added a separate etymology/attestation layer for `hub`.
- Attestation candidates: {summary['attestation_candidates']}
- Confidence counts: high {summary['confidence_counts']['high']}, medium {summary['confidence_counts']['medium']}, low {summary['confidence_counts']['low']}
- Etymology/reference sources collected: {summary['etymology_sources_collected']}/{summary['etymology_sources_attempted']}
- Semantic shift groups: {summary['semantic_shift_groups']}

## Earliest Overall Evidence

- Earliest claimed year: {summary['earliest_claimed_year']}
- Earliest directly supported year in this layer: {summary['earliest_supported_year']}
- Earliest direct corpus snippet year in this layer: {summary['earliest_direct_corpus_year']}
- Earliest sense: {summary['earliest_sense']}

Dictionary dates and reference dates remain labelled as claims unless backed by visible dated text.

## Etymology

Status: {etymology['etymology_status']}

{etymology['origin_notes']}

Possible origin theories:

{chr(10).join(theory_lines)}

Related terms:

{chr(10).join(related_lines)}

## Sense-By-Sense Earliest Evidence

{chr(10).join(table_rows)}

## Important Semantic Shifts

{chr(10).join(shift_lines)}

## Source Limitations

{chr(10).join(limitation_lines)}

## Recommended Next Chart Implications

{chr(10).join(implication_lines)}

## Outputs

{chr(10).join(output_lines)}
"""


def update_preview(
    etymology_summary: dict[str, Any],
    earliest_attestations: dict[str, Any],
    semantic_groups: dict[str, Any],
    confidence_matrix: dict[str, Any],
) -> None:
    layer = {
        "metadata": {
            "generated_at": utc_now(),
            "generated_by_script": "scripts/process_hub_etymology.py",
            "note": "Second-pass etymology and attestation layer; first-pass frequency/phrase data is preserved.",
        },
        "etymology_summary": etymology_summary,
        "earliest_attestations": earliest_attestations["attestations"],
        "semantic_shift_attestations": semantic_groups["semantic_shift_attestations"],
        "confidence_counts": confidence_matrix["confidence_counts"],
        "source_limitations": etymology_summary.get("source_limitations", []),
    }
    for preview_path in [GENERATED_PREVIEW, RESEARCH_PREVIEW]:
        if not preview_path.exists():
            continue
        preview = load_json(preview_path)
        preview["etymology_layer"] = layer
        write_json(preview_path, preview)


def validate_json_files(paths: list[Path]) -> None:
    errors = []
    for path in paths:
        if not path.exists():
            errors.append(f"Missing expected file: {path}")
            continue
        try:
            json.loads(path.read_text(encoding="utf-8"))
        except json.JSONDecodeError as exc:
            errors.append(f"Invalid JSON {path}: {exc}")
    if errors:
        raise SystemExit("\n".join(errors))


def main() -> None:
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)

    etymology_raw = load_json(RAW_DIR / "hub_etymology_sources_raw.json")
    attestations_raw = load_json(RAW_DIR / "hub_earliest_attestations_raw.json")
    historical_raw = load_json(RAW_DIR / "hub_historical_dictionary_raw.json")
    search_log = load_json(RAW_DIR / "hub_attestation_search_log.json")

    earliest_attestations = build_earliest_attestations(attestations_raw)
    attestations = earliest_attestations["attestations"]
    etymology_summary = build_etymology_summary(etymology_raw, attestations)
    semantic_groups = build_semantic_shift_attestations(attestations)
    confidence_matrix = build_confidence_matrix(attestations, search_log, etymology_raw)

    outputs = {
        "etymology_summary": str((PROCESSED_DIR / "hub_etymology_summary.json").relative_to(ROOT)),
        "earliest_attestations": str((PROCESSED_DIR / "hub_earliest_attestations.json").relative_to(ROOT)),
        "semantic_shift_attestations": str((PROCESSED_DIR / "hub_semantic_shift_attestations.json").relative_to(ROOT)),
        "attestation_confidence_matrix": str((PROCESSED_DIR / "hub_attestation_confidence_matrix.json").relative_to(ROOT)),
        "report_md": str((REPORTS_DIR / "hub_etymology_attestation_report.md").relative_to(ROOT)),
        "report_json": str((REPORTS_DIR / "hub_etymology_attestation_report.json").relative_to(ROOT)),
        "generated_preview": str(GENERATED_PREVIEW.relative_to(ROOT)),
    }

    report = build_report(etymology_summary, earliest_attestations, semantic_groups, confidence_matrix, historical_raw, search_log, outputs)

    write_json(PROCESSED_DIR / "hub_etymology_summary.json", etymology_summary)
    write_json(PROCESSED_DIR / "hub_earliest_attestations.json", earliest_attestations)
    write_json(PROCESSED_DIR / "hub_semantic_shift_attestations.json", semantic_groups)
    write_json(PROCESSED_DIR / "hub_attestation_confidence_matrix.json", confidence_matrix)
    write_json(REPORTS_DIR / "hub_etymology_attestation_report.json", report)
    (REPORTS_DIR / "hub_etymology_attestation_report.md").write_text(markdown_report(report), encoding="utf-8")
    update_preview(etymology_summary, earliest_attestations, semantic_groups, confidence_matrix)

    expected = [
        RAW_DIR / "hub_etymology_sources_raw.json",
        RAW_DIR / "hub_earliest_attestations_raw.json",
        RAW_DIR / "hub_historical_dictionary_raw.json",
        RAW_DIR / "hub_attestation_search_log.json",
        PROCESSED_DIR / "hub_etymology_summary.json",
        PROCESSED_DIR / "hub_earliest_attestations.json",
        PROCESSED_DIR / "hub_semantic_shift_attestations.json",
        PROCESSED_DIR / "hub_attestation_confidence_matrix.json",
        REPORTS_DIR / "hub_etymology_attestation_report.json",
        GENERATED_PREVIEW,
    ]
    validate_json_files(expected)

    summary = report["summary"]
    failed_sources = confidence_matrix["failed_or_blocked_reference_sources"]
    print("Hub etymology processing summary")
    print(f"- Etymology sources collected: {summary['etymology_sources_collected']}/{summary['etymology_sources_attempted']}")
    print(f"- Attestation candidates: {summary['attestation_candidates']}")
    print(f"- Earliest claimed year: {summary['earliest_claimed_year']}")
    print(f"- Earliest supported year: {summary['earliest_supported_year']}")
    print(
        f"- Confidence counts: high={summary['confidence_counts']['high']}, medium={summary['confidence_counts']['medium']}, low={summary['confidence_counts']['low']}"
    )
    print(f"- Semantic shift groups: {summary['semantic_shift_groups']}")
    print(f"- Failed or blocked reference sources: {len(failed_sources)}")
    print("- Output file paths:")
    for path in outputs.values():
        print(f"  - {path}")


if __name__ == "__main__":
    main()
