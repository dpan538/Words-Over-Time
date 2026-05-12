#!/usr/bin/env python3
"""Process third-pass hub evidence-strengthening raw files."""

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
SECOND_PASS_REPORT = REPORTS_DIR / "hub_etymology_attestation_report.json"

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


def year_key(item: dict[str, Any]) -> tuple[int, str]:
    year = item.get("evidence_year")
    return (int(year) if isinstance(year, int) else 9999, item.get("id", ""))


def normalize_attestations(raw: dict[str, Any]) -> dict[str, Any]:
    normalized = []
    for index, item in enumerate(raw.get("strengthened_attestation_candidates_raw", []), start=1):
        normalized.append(
            {
                "id": f"hub_strengthened_attestation_{index:03d}",
                "raw_id": item.get("raw_id"),
                "term": item.get("term"),
                "sense_id": item.get("sense_id"),
                "sense_label": item.get("sense_label") or SENSE_LABELS.get(item.get("sense_id"), ""),
                "evidence_year": item.get("evidence_year"),
                "year_type": item.get("year_type"),
                "source_title": item.get("source_title"),
                "source_author": item.get("source_author"),
                "source_publication_year": item.get("source_publication_year"),
                "source_page": item.get("source_page", ""),
                "source_url": item.get("source_url"),
                "source_type": item.get("source_type"),
                "evidence_text_short": item.get("evidence_text_short", ""),
                "context_summary": item.get("context_summary", ""),
                "is_direct_attestation": bool(item.get("is_direct_attestation")),
                "is_dictionary_claim": bool(item.get("is_dictionary_claim")),
                "sense_is_clear": bool(item.get("sense_is_clear")),
                "confidence": item.get("confidence", "low"),
                "why_this_is_stronger": item.get("why_this_is_stronger", ""),
                "limitations": item.get("limitations", ""),
                "copyright_notes": item.get("copyright_notes", ""),
            }
        )
    normalized.sort(key=year_key)
    return {
        "metadata": {
            "word": "hub",
            "generated_at": utc_now(),
            "generated_by_script": "scripts/process_hub_evidence_strengthening.py",
            "notes": [
                "Third-pass file only; previous second-pass attestation files are preserved.",
                "dictionary_claim, historical_dictionary, and direct_text are intentionally distinct year types.",
            ],
        },
        "strengthened_attestations": normalized,
    }


def count_confidence(attestations: list[dict[str, Any]]) -> dict[str, int]:
    counts = Counter(item.get("confidence", "low") for item in attestations)
    return {"high": counts.get("high", 0), "medium": counts.get("medium", 0), "low": counts.get("low", 0)}


def earliest_year(
    attestations: list[dict[str, Any]],
    *,
    year_type: str | None = None,
    sense_id: str | None = None,
    direct_only: bool = False,
    include_dictionary_claims: bool = False,
) -> int | None:
    years = []
    for item in attestations:
        if item.get("evidence_year") is None:
            continue
        if year_type and item.get("year_type") != year_type:
            continue
        if sense_id and item.get("sense_id") != sense_id:
            continue
        if direct_only and not item.get("is_direct_attestation"):
            continue
        if not include_dictionary_claims and item.get("is_dictionary_claim"):
            continue
        years.append(int(item["evidence_year"]))
    return min(years) if years else None


def build_upgrade(
    second_pass: dict[str, Any],
    strengthened: dict[str, Any],
    raw: dict[str, Any],
) -> dict[str, Any]:
    attestations = strengthened["strengthened_attestations"]
    counts = count_confidence(attestations)
    previous = second_pass.get("summary", {})
    previous_counts = previous.get("confidence_counts", {})
    new_supported = earliest_year(attestations)
    new_direct_text = earliest_year(attestations, year_type="direct_text", direct_only=True)
    mechanical_direct = earliest_year(attestations, year_type="direct_text", sense_id="mechanical_core", direct_only=True)
    central_direct = earliest_year(attestations, year_type="direct_text", sense_id="central_place", direct_only=True)
    claim_rows = raw.get("claim_investigation", [])
    claim_1640 = next((item for item in claim_rows if item.get("claim") == "1640s"), {})
    evidence_1828 = next((item for item in claim_rows if item.get("claim") == "1828 supported evidence"), {})

    return {
        "metadata": {
            "word": "hub",
            "generated_at": utc_now(),
            "generated_by_script": "scripts/process_hub_evidence_strengthening.py",
        },
        "previous_earliest_claimed_year": previous.get("earliest_claimed_year", "1640s"),
        "previous_earliest_supported_year": previous.get("earliest_supported_year", 1828),
        "previous_earliest_direct_corpus_snippet_year": previous.get("earliest_direct_corpus_year", 1908),
        "new_earliest_claimed_year": previous.get("earliest_claimed_year", "1640s"),
        "new_earliest_supported_year": new_supported,
        "new_earliest_direct_text_year": new_direct_text,
        "new_earliest_mechanical_direct_text_year": mechanical_direct,
        "new_earliest_metaphorical_direct_text_year": central_direct,
        "confidence_change_summary": {
            "previous_high": previous_counts.get("high", 0),
            "previous_medium": previous_counts.get("medium", 0),
            "previous_low": previous_counts.get("low", 0),
            "new_high": counts["high"],
            "new_medium": counts["medium"],
            "new_low": counts["low"],
        },
        "upgraded_senses": [
            {
                "sense_id": "mechanical_core",
                "previous_status": "Earliest direct corpus snippet was 1938 in the second-pass semantic group; 1828 was historical dictionary evidence.",
                "new_status": f"Readable direct-text mechanical evidence now appears in {mechanical_direct}." if mechanical_direct else "No improved direct text found.",
                "evidence_ids": [
                    item["id"]
                    for item in attestations
                    if item.get("sense_id") == "mechanical_core" and item.get("year_type") == "direct_text"
                ],
            },
            {
                "sense_id": "central_place",
                "previous_status": "1858 was present as a secondary dictionary/etymology claim; earliest direct corpus snippet was 1910.",
                "new_status": f"Public-domain direct text verifies the Holmes metaphor in {central_direct}." if central_direct else "No improved direct text found.",
                "evidence_ids": [
                    item["id"]
                    for item in attestations
                    if item.get("sense_id") == "central_place" and item.get("year_type") == "direct_text"
                ],
            },
        ],
        "unchanged_senses": [
            {
                "sense_id": "transport_logistics",
                "status": "No stronger pre-1908 transport/logistics attestation was found in this pass; second-pass 1908 OCR candidate remains separate and needs image verification.",
            },
            {
                "sense_id": "network_system",
                "status": "No early network/computing attestation was targeted or improved in this pass.",
            },
            {
                "sense_id": "institutional_cluster",
                "status": "No stronger pre-1908 institutional/economic attestation was found in this pass.",
            },
            {
                "sense_id": "digital_platform",
                "status": "Digital/platform senses remain later and outside this pre-1908 evidence-strengthening focus.",
            },
        ],
        "claim_1640s_resolved": False,
        "claim_1640s_resolution_notes": claim_1640.get("notes", "No visible quotation found."),
        "evidence_1828_clarified": True,
        "evidence_1828_classification": evidence_1828.get("classification", "historical_dictionary"),
        "notes": (
            "The 1640s/1649 dates remain reference claims. The earliest supported year remains 1828, "
            "now clarified as historical dictionary evidence. The earliest direct text found in this pass "
            "is the 1858 Holmes metaphor; the earliest mechanical direct text found is 1878."
        ),
    }


def build_nave_summary(nave_raw: dict[str, Any]) -> dict[str, Any]:
    sources = nave_raw.get("nave_relation_sources", [])
    return {
        "metadata": {
            "word": "hub",
            "generated_at": utc_now(),
            "generated_by_script": "scripts/process_hub_evidence_strengthening.py",
        },
        "relationship_supported": True,
        "nave_historical_relevance": "Supported",
        "summary": (
            "Nave is historically relevant as an older/formal wheel-center term. Hub appears in early "
            "dictionary evidence as a synonym or near-synonym for the nave, and Webster 1828 defines it "
            "through the wheel structure that receives spokes."
        ),
        "nave_as_older_or_formal": {
            "status": "supported",
            "confidence": "medium",
            "notes": "Merriam-Webster gives nave a before-12th-century first-use claim, while 1828 dictionaries define hub through nave.",
        },
        "hub_as_later_common_or_provincial": {
            "status": "partially_supported",
            "confidence": "medium",
            "notes": "Johnson/Todd/Chalmers 1828 says hub/hob is also an English provincial word; this supports caution, not a full dialect-origin claim.",
        },
        "source_ids": [item.get("id") for item in sources],
        "sources": sources,
        "chart_planning_note": "Nave can be used as a careful contextual comparison for early wheel terminology, but should not be overbuilt into a full origin story without OED or primary early-modern quotations.",
    }


def markdown_report(report: dict[str, Any]) -> str:
    summary = report["summary"]
    table_rows = []
    for item in report["pre_1908_direct_evidence"]:
        table_rows.append(
            "| {year} | {term} | {sense} | {source} | {etype} | {confidence} | {notes} |".format(
                year=item.get("evidence_year", ""),
                term=item.get("term", ""),
                sense=item.get("sense_label", ""),
                source=item.get("source_title", ""),
                etype=item.get("year_type", ""),
                confidence=item.get("confidence", ""),
                notes=item.get("limitations", ""),
            )
        )
    if not table_rows:
        table_rows.append("|  |  |  |  |  |  | No pre-1908 direct evidence found. |")

    limitations = "\n".join(f"- {item}" for item in report["remaining_limitations"])
    implications = "\n".join(f"- {item}" for item in report["chart_implications"])
    outputs = "\n".join(f"- `{path}`" for path in report["outputs"].values())

    return f"""# Hub Evidence Strengthening Report

Generated: {report['metadata']['generated_at']}

## Summary

- Third pass focus: strengthen early evidence quality for `hub`, especially before 1908.
- New strengthened attestations: {summary['new_strengthened_attestations']}
- Confidence counts: high {summary['confidence_counts']['high']}, medium {summary['confidence_counts']['medium']}, low {summary['confidence_counts']['low']}
- Previous direct corpus/text year: {summary['previous_direct_text_year']}
- New earliest direct text year: {summary['new_earliest_direct_text_year']}
- 1640s claim resolved to primary quotation: {summary['claim_1640s_resolved']}
- 1828 evidence clarified: {summary['evidence_1828_clarified']}
- Nave relation supported: {summary['nave_relation_supported']}

## 1640s Claim Investigation

The 1640s date is visible in the Online Etymology Dictionary, and Merriam-Webster lists 1649 as first known use. In this pass, neither public page exposed a primary quotation, author/title, or dated source for the 1640s/1649 claim. The date should remain labelled as `dictionary_claim`.

## 1828 Evidence Investigation

The 1828 evidence is a historical dictionary entry in Noah Webster's *An American Dictionary of the English Language*. The source is dated and readable, and it supports the mechanical wheel-center sense, but it is not direct non-dictionary corpus evidence.

## Pre-1908 Direct Evidence

| Year | Term/Phrase | Sense | Source | Evidence Type | Confidence | Notes |
|---:|---|---|---|---|---|---|
{chr(10).join(table_rows)}

## Mechanical Vs Metaphorical Evidence

Mechanical evidence is now stronger before 1908: this pass found direct-text cycling sources in 1878, 1881, and 1884, with the 1881 and 1884 examples especially readable. Metaphorical evidence is also stronger: the Holmes `hub of the solar system` passage was verified in a public-domain Project Gutenberg text for the 1858 work.

## Nave Relationship

Nave is historically relevant as the older/formal wheel-center term. The useful cautious claim is that early dictionary sources explain hub through nave; Johnson/Todd/Chalmers 1828 also notes provincial usage for hub/hob. This supports a later chart note, but not a broad origin story without stronger OED or early-modern primary quotations.

## Remaining Limitations

{limitations}

## Chart Implications

{implications}

## Outputs

{outputs}
"""


def build_report(
    strengthened: dict[str, Any],
    upgrade: dict[str, Any],
    nave_summary: dict[str, Any],
    evidence_raw: dict[str, Any],
    search_log: dict[str, Any],
    outputs: dict[str, str],
) -> dict[str, Any]:
    attestations = strengthened["strengthened_attestations"]
    direct_pre_1908 = [
        item
        for item in attestations
        if item.get("year_type") == "direct_text"
        and item.get("evidence_year") is not None
        and int(item["evidence_year"]) < 1908
    ]
    counts = count_confidence(attestations)
    failed_sources = [
        status
        for status in evidence_raw.get("source_statuses", [])
        if not status.get("usable")
        and status.get("id") not in {"etymonline_hub_claim_check", "merriam_webster_hub_claim_check"}
    ]
    failed_searches = [
        item
        for item in search_log.get("searches", [])
        if item.get("status") == "failed"
    ]
    report = {
        "metadata": {
            "word": "hub",
            "generated_at": utc_now(),
            "generated_by_script": "scripts/process_hub_evidence_strengthening.py",
        },
        "summary": {
            "new_strengthened_attestations": len(attestations),
            "confidence_counts": counts,
            "previous_direct_text_year": upgrade.get("previous_earliest_direct_corpus_snippet_year"),
            "new_earliest_direct_text_year": upgrade.get("new_earliest_direct_text_year"),
            "new_earliest_mechanical_direct_text_year": upgrade.get("new_earliest_mechanical_direct_text_year"),
            "claim_1640s_resolved": upgrade.get("claim_1640s_resolved"),
            "evidence_1828_clarified": upgrade.get("evidence_1828_clarified"),
            "nave_relation_supported": nave_summary.get("relationship_supported"),
            "failed_source_fetches": len(failed_sources),
            "failed_searches": len(failed_searches),
        },
        "claim_1640s_investigation": [
            item
            for item in evidence_raw.get("claim_investigation", [])
            if item.get("claim") in {"1640s", "1649"}
        ],
        "evidence_1828_investigation": next(
            (item for item in evidence_raw.get("claim_investigation", []) if item.get("claim") == "1828 supported evidence"),
            {},
        ),
        "pre_1908_direct_evidence": direct_pre_1908,
        "mechanical_vs_metaphorical": {
            "mechanical": "Direct mechanical evidence is now supported by readable cycling texts before 1908; earliest candidate is 1878, with a stronger book example in 1881.",
            "metaphorical": "The 1858 Holmes passage is verified in public-domain text and supports the central-place metaphor earlier than the second-pass 1910 snippet.",
        },
        "nave_relationship": nave_summary,
        "remaining_limitations": [
            "The 1640s/1649 first-use dates still lack visible public quotations.",
            "OED or paywalled historical dictionary quotation evidence was not accessible in the local environment.",
            "LOC newspaper search can produce useful leads, but OCR/page access remained unreliable and was not promoted into strengthened evidence.",
            "Google Books API was not retried because earlier passes encountered rate limiting.",
            "Internet Archive OCR is useful but should be checked against page images before final chart copy.",
        ],
        "chart_implications": [
            "Chart 1 can safely begin with the physical wheel/mechanical hub, but 1640s should be displayed as a claim rather than confirmed text date.",
            "The early metaphor layer is now better supported by Holmes 1858 direct text.",
            "Nave vs hub is worth a small contextual note, not a standalone origin argument.",
            "Mechanical direct-text evidence before 1908 is now available for later chart planning.",
        ],
        "outputs": outputs,
    }
    return report


def update_preview(strengthened: dict[str, Any], upgrade: dict[str, Any], nave_summary: dict[str, Any]) -> None:
    layer = {
        "metadata": {
            "generated_at": utc_now(),
            "generated_by_script": "scripts/process_hub_evidence_strengthening.py",
            "note": "Third-pass evidence quality layer; first-pass and second-pass data are preserved.",
        },
        "evidence_quality_upgrade": upgrade,
        "strengthened_attestations": strengthened["strengthened_attestations"],
        "nave_relation_summary": {
            "relationship_supported": nave_summary.get("relationship_supported"),
            "summary": nave_summary.get("summary"),
            "chart_planning_note": nave_summary.get("chart_planning_note"),
        },
    }
    for path in [GENERATED_PREVIEW, RESEARCH_PREVIEW]:
        if not path.exists():
            continue
        preview = load_json(path)
        preview["evidence_strengthening_layer"] = layer
        write_json(path, preview)


def validate_json(paths: list[Path]) -> None:
    errors = []
    for path in paths:
        if not path.exists():
            errors.append(f"missing: {path}")
            continue
        try:
            load_json(path)
        except json.JSONDecodeError as exc:
            errors.append(f"invalid json: {path}: {exc}")
    if errors:
        raise SystemExit("\n".join(errors))


def main() -> None:
    evidence_raw = load_json(RAW_DIR / "hub_evidence_strengthening_raw.json")
    search_log = load_json(RAW_DIR / "hub_pre_1908_search_log.json")
    nave_raw = load_json(RAW_DIR / "hub_nave_relation_sources_raw.json")
    second_pass = load_json(SECOND_PASS_REPORT)

    strengthened = normalize_attestations(evidence_raw)
    upgrade = build_upgrade(second_pass, strengthened, evidence_raw)
    nave_summary = build_nave_summary(nave_raw)

    outputs = {
        "strengthened_attestations": str((PROCESSED_DIR / "hub_strengthened_attestations.json").relative_to(ROOT)),
        "evidence_quality_upgrade": str((PROCESSED_DIR / "hub_evidence_quality_upgrade.json").relative_to(ROOT)),
        "nave_relation_summary": str((PROCESSED_DIR / "hub_nave_relation_summary.json").relative_to(ROOT)),
        "report_md": str((REPORTS_DIR / "hub_evidence_strengthening_report.md").relative_to(ROOT)),
        "report_json": str((REPORTS_DIR / "hub_evidence_strengthening_report.json").relative_to(ROOT)),
        "generated_preview": str(GENERATED_PREVIEW.relative_to(ROOT)),
    }

    report = build_report(strengthened, upgrade, nave_summary, evidence_raw, search_log, outputs)

    write_json(PROCESSED_DIR / "hub_strengthened_attestations.json", strengthened)
    write_json(PROCESSED_DIR / "hub_evidence_quality_upgrade.json", upgrade)
    write_json(PROCESSED_DIR / "hub_nave_relation_summary.json", nave_summary)
    write_json(REPORTS_DIR / "hub_evidence_strengthening_report.json", report)
    (REPORTS_DIR / "hub_evidence_strengthening_report.md").write_text(markdown_report(report), encoding="utf-8")
    update_preview(strengthened, upgrade, nave_summary)

    expected = [
        RAW_DIR / "hub_evidence_strengthening_raw.json",
        RAW_DIR / "hub_pre_1908_search_log.json",
        RAW_DIR / "hub_nave_relation_sources_raw.json",
        PROCESSED_DIR / "hub_strengthened_attestations.json",
        PROCESSED_DIR / "hub_evidence_quality_upgrade.json",
        PROCESSED_DIR / "hub_nave_relation_summary.json",
        REPORTS_DIR / "hub_evidence_strengthening_report.json",
        GENERATED_PREVIEW,
        RESEARCH_PREVIEW,
    ]
    validate_json(expected)

    summary = report["summary"]
    counts = summary["confidence_counts"]
    print("Hub evidence strengthening processing summary")
    print(f"- New strengthened attestations: {summary['new_strengthened_attestations']}")
    print(f"- Confidence counts: high={counts['high']}, medium={counts['medium']}, low={counts['low']}")
    print(f"- Previous direct text year: {summary['previous_direct_text_year']}")
    print(f"- New earliest direct text year: {summary['new_earliest_direct_text_year']}")
    print(f"- 1640s claim resolved: {summary['claim_1640s_resolved']}")
    print(f"- 1828 evidence clarified: {summary['evidence_1828_clarified']}")
    print(f"- Nave relation supported: {summary['nave_relation_supported']}")
    print("- Output paths:")
    for path in outputs.values():
        print(f"  - {path}")


if __name__ == "__main__":
    main()
