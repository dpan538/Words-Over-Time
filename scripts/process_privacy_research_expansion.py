#!/usr/bin/env python3
"""Process a deep supplemental research expansion for privacy."""

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
INDEX_PATH = RESEARCH_DIR / "privacy_research_index.json"
GENERATED_PREVIEW_PATH = ROOT / "src" / "data" / "generated" / "privacy_chart_data_preview.json"

WORD = "privacy"
LAYER_ID = "research_expansion"
RAW_PATH = RAW_DIR / "privacy_research_expansion_raw.json"
PROCESSED_PATH = PROCESSED_DIR / "privacy_research_expansion_processed.json"
JSON_REPORT_PATH = REPORTS_DIR / "privacy_research_expansion_data_report.json"
MD_REPORT_PATH = REPORTS_DIR / "privacy_research_expansion_data_report.md"


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


def aggregate_counts(records: list[dict[str, Any]], field: str, top: int | None = None) -> list[dict[str, Any]]:
    counter: Counter[str] = Counter()
    for row in records:
        value = row.get(field)
        if value in (None, "", []):
            continue
        counter[str(value)] += 1
    items = [{"key": key, "count": int(count)} for key, count in counter.most_common()]
    return items[:top] if top is not None else items


def aggregate_years(records: list[dict[str, Any]], year_field: str) -> list[dict[str, Any]]:
    counter: Counter[int] = Counter()
    for row in records:
        year = row.get(year_field)
        if isinstance(year, int):
            counter[year] += 1
    return [{"year": year, "count": int(counter[year])} for year in sorted(counter)]


def phrase_group_summary(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    summary = []
    for group_id in sorted(set(row.get("group_id") for row in rows if row.get("group_id"))):
        group_rows = [row for row in rows if row.get("group_id") == group_id]
        collected = [row for row in group_rows if row.get("status") == "collected"]
        strongest = []
        for row in collected:
            points = row.get("values", [])
            peak = max((point.get("value", 0.0) for point in points), default=0.0)
            strongest.append({"query": row.get("query"), "corpus": row.get("corpus"), "peak_value": peak})
        strongest.sort(key=lambda item: item["peak_value"], reverse=True)
        summary.append(
            {
                "group_id": group_id,
                "row_count": len(group_rows),
                "collected_count": len(collected),
                "strongest_examples": strongest[:10],
            }
        )
    return summary


def policy_term_summary(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    counts: Counter[str] = Counter()
    for row in rows:
        for item in row.get("matched_terms", []):
            counts[str(item.get("term"))] += int(item.get("count", 0))
    return [{"term": key, "count": int(count)} for key, count in counts.most_common()]


def build_processed(raw: dict[str, Any]) -> dict[str, Any]:
    public_rows = raw.get("public_dated_evidence", [])
    phrase_rows = raw.get("supplemental_phrase_frequency", [])
    policy_rows = raw.get("platform_policy_corpus", [])
    wikipedia_rows = raw.get("wikipedia_reference_corpus", [])
    legal_rows = raw.get("legal_institutional_corpus", [])
    discourse_rows = raw.get("news_discourse_expansion", [])
    attention_rows = raw.get("news_attention_proxy", [])
    court_rows = raw.get("court_opinion_metadata", [])
    archive_rows = raw.get("archive_metadata", [])
    publication_rows = raw.get("publication_metadata", [])
    academic_rows = raw.get("academic_transition_expansion", [])
    institution_rows = raw.get("academic_transition_institutions", [])
    failed_sources = raw.get("failed_sources", [])

    strong_signals = []
    if public_rows:
        strong_signals.append("Public dated evidence now includes collection-level historical publication metadata across multiple windows and terms.")
    if any(row.get("status") == "collected" for row in phrase_rows):
        strong_signals.append("Supplemental phrase-frequency rows recovered legal, informational, and tension vocabulary beyond the first collocation pass.")
    if policy_rows:
        strong_signals.append("Real platform and regulator documents now contribute modern compliance and interface-language evidence.")
    if wikipedia_rows:
        strong_signals.append("Wikipedia concept summaries now widen topical coverage across privacy, surveillance, policy, and data-governance branches.")
    if legal_rows:
        strong_signals.append("Public legal and institutional explanation pages now add doctrinal and governance vocabulary outside platform policies.")
    if attention_rows:
        strong_signals.append("A second attention-like proxy exists via GDELT news volume intensity.")
    if court_rows:
        strong_signals.append("Court opinion search metadata adds a case-law discovery layer for privacy doctrines and legal phrases.")
    if archive_rows:
        strong_signals.append("Internet Archive discovery metadata adds bibliographic and collection-level leads outside the standard word-frequency stack.")
    if publication_rows:
        strong_signals.append("Crossref publication metadata adds article-, chapter-, and book-title discovery for privacy branches beyond dictionaries and news.")
    if any(row.get("latitude") is not None for row in academic_rows):
        strong_signals.append("Academic transition queries recovered additional institution geography with coordinates.")

    weak_signals = []
    if public_rows:
        weak_signals.append("LOC collection-search evidence is useful for dated-publication presence but is too noisy to treat as exact first-attestation proof.")
    if not attention_rows:
        weak_signals.append("Second attention-source recovery remains weak if GDELT timeline requests fail or stay too short-range.")
    if not any(row.get("source_country") for row in discourse_rows):
        weak_signals.append("News discourse geography is still thin if source-country metadata drops out.")
    if failed_sources:
        weak_signals.append("Some requested source windows or query variants still failed and remain candidates for targeted reruns.")

    return {
        "word": WORD,
        "layer_id": LAYER_ID,
        "status": "exploratory_research",
        "intended_use": "available_for_later_story_and_chart selection without locking the narrative yet",
        "sources": raw.get("sources", []),
        "sections": {
            "public_dated_evidence": public_rows,
            "supplemental_phrase_frequency": phrase_rows,
            "platform_policy_corpus": policy_rows,
            "wikipedia_reference_corpus": wikipedia_rows,
            "legal_institutional_corpus": legal_rows,
            "news_discourse_expansion": discourse_rows,
            "news_attention_proxy": attention_rows,
            "court_opinion_metadata": court_rows,
            "archive_metadata": archive_rows,
            "publication_metadata": publication_rows,
            "academic_transition_expansion": academic_rows,
            "academic_transition_institutions": institution_rows,
        },
        "aggregates": {
            "public_evidence_by_query": aggregate_counts(public_rows, "query"),
            "public_evidence_by_year": aggregate_years(public_rows, "year"),
            "phrase_group_summary": phrase_group_summary(phrase_rows),
            "policy_term_summary": policy_term_summary(policy_rows),
            "wikipedia_page_summary": aggregate_counts(wikipedia_rows, "page_title"),
            "legal_reference_summary": aggregate_counts(legal_rows, "label"),
            "gdelt_discourse_by_query": aggregate_counts(discourse_rows, "query"),
            "gdelt_discourse_by_country": aggregate_counts(discourse_rows, "source_country", top=20),
            "gdelt_attention_by_query": aggregate_counts(attention_rows, "query"),
            "court_by_query": aggregate_counts(court_rows, "query"),
            "court_by_year": aggregate_years(court_rows, "year"),
            "archive_by_query": aggregate_counts(archive_rows, "query"),
            "archive_by_year": aggregate_years(archive_rows, "year"),
            "publication_by_query": aggregate_counts(publication_rows, "query"),
            "publication_by_year": aggregate_years(publication_rows, "publication_year"),
            "academic_by_query": aggregate_counts(academic_rows, "query"),
            "academic_by_country": aggregate_counts(academic_rows, "country", top=20),
            "academic_by_year": aggregate_years(academic_rows, "publication_year"),
        },
        "strong_signals": strong_signals,
        "weak_signals": weak_signals,
        "failed_sources": failed_sources,
        "limitations": [
            "LOC collection search metadata is not a substitute for full OCR-text quotation verification.",
            "GDELT attention values are news-volume proxies and do not equal public opinion or semantic importance.",
            "Platform and regulator document term counts are text-scan counts, not discourse parsing.",
            "OpenAlex geography reflects academic production and institutional affiliation rather than general public usage.",
        ],
        "statistics": {
            "public_dated_evidence_count": len(public_rows),
            "supplemental_phrase_frequency_count": len(phrase_rows),
            "platform_policy_document_count": len(policy_rows),
            "wikipedia_reference_count": len(wikipedia_rows),
            "legal_institutional_count": len(legal_rows),
            "news_discourse_count": len(discourse_rows),
            "news_attention_count": len(attention_rows),
            "court_opinion_count": len(court_rows),
            "archive_metadata_count": len(archive_rows),
            "publication_metadata_count": len(publication_rows),
            "academic_transition_count": len(academic_rows),
            "academic_institution_count": len(institution_rows),
            "failed_source_count": len(failed_sources),
            "total_record_count": len(public_rows) + len(phrase_rows) + len(policy_rows) + len(wikipedia_rows) + len(legal_rows) + len(discourse_rows) + len(attention_rows) + len(court_rows) + len(archive_rows) + len(publication_rows) + len(academic_rows) + len(institution_rows),
        },
    }


def build_report_json(processed: dict[str, Any], output_paths: dict[str, str]) -> dict[str, Any]:
    return {
        "metadata": {
            "word": WORD,
            "layer_id": LAYER_ID,
            "generated_at": utc_now(),
            "generated_by_script": "scripts/process_privacy_research_expansion.py",
            "raw_source": str(RAW_PATH.relative_to(ROOT)),
            "outputs": output_paths,
        },
        "counts": processed["statistics"],
        "sources": processed.get("sources", []),
        "aggregates": processed.get("aggregates", {}),
        "strong_signals": processed.get("strong_signals", []),
        "weak_signals": processed.get("weak_signals", []),
        "failed_sources": processed.get("failed_sources", []),
    }


def build_markdown_report(processed: dict[str, Any], report: dict[str, Any]) -> str:
    counts = report["counts"]
    sources = "\n".join(
        f"- {row.get('source_name')} ({row.get('source_type')}): {'available' if row.get('available') else 'unavailable'}, {row.get('records', 0)} records"
        for row in report["sources"]
    )
    strong = "\n".join(f"- {row}" for row in report["strong_signals"])
    weak = "\n".join(f"- {row}" for row in report["weak_signals"])
    failed = "\n".join(
        f"- {row.get('source_id')} ({row.get('source_type')}): {row.get('reason')}"
        for row in report["failed_sources"][:40]
    )
    return f"""# Privacy Research Expansion Report

Generated: {report['metadata']['generated_at']}

## What Was Collected

- Public dated evidence records: {counts['public_dated_evidence_count']}
- Supplemental phrase-frequency rows: {counts['supplemental_phrase_frequency_count']}
- Platform/policy documents: {counts['platform_policy_document_count']}
- Wikipedia reference records: {counts['wikipedia_reference_count']}
- Legal/institutional records: {counts['legal_institutional_count']}
- News discourse rows: {counts['news_discourse_count']}
- News attention rows: {counts['news_attention_count']}
- Court opinion rows: {counts['court_opinion_count']}
- Archive metadata rows: {counts['archive_metadata_count']}
- Publication metadata rows: {counts['publication_metadata_count']}
- Academic transition rows: {counts['academic_transition_count']}
- Academic institution rows: {counts['academic_institution_count']}
- Failed source rows: {counts['failed_source_count']}
- Total rows across sections: {counts['total_record_count']}

## Source Health

{sources if sources else "- None."}

## Strong Signals

{strong if strong else "- None."}

## Weak Signals

{weak if weak else "- None."}

## Failed Sources

{failed if failed else "- None."}

## Outputs

- Raw: `{RAW_PATH.relative_to(ROOT)}`
- Processed: `{PROCESSED_PATH.relative_to(ROOT)}`
- JSON report: `{JSON_REPORT_PATH.relative_to(ROOT)}`
- Markdown report: `{MD_REPORT_PATH.relative_to(ROOT)}`
"""


def update_index(processed: dict[str, Any]) -> None:
    index = read_json(INDEX_PATH, {"word": WORD, "layers": []})
    index["word"] = WORD
    index["updated_at"] = utc_now()
    index.setdefault("layers", [])
    layer_entry = {
        "layer_id": LAYER_ID,
        "processed_path": str(PROCESSED_PATH.relative_to(ROOT)),
        "report_path": str(MD_REPORT_PATH.relative_to(ROOT)),
        "status": "usable_partial" if processed["statistics"]["total_record_count"] > 0 else "partial",
        "notes": (
            f"{processed['statistics']['total_record_count']} rows across dated evidence, phrase growth, policy texts, news proxies, and academic transition data."
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


def update_preview(processed: dict[str, Any]) -> None:
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
    preview["research_expansion_layer"] = {
        "layer_id": LAYER_ID,
        "title": "Privacy research expansion",
        "generated_at": utc_now(),
        "generated_by_script": "scripts/process_privacy_research_expansion.py",
        "total_record_count": processed["statistics"]["total_record_count"],
        "public_dated_evidence_count": processed["statistics"]["public_dated_evidence_count"],
        "news_attention_count": processed["statistics"]["news_attention_count"],
        "academic_transition_count": processed["statistics"]["academic_transition_count"],
        "failed_source_count": processed["statistics"]["failed_source_count"],
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
    update_index(processed)
    update_preview(processed)

    print("Privacy research expansion processing summary")
    print(f"- Total records: {processed['statistics']['total_record_count']}")
    print(f"- Public dated evidence: {processed['statistics']['public_dated_evidence_count']}")
    print(f"- Phrase rows: {processed['statistics']['supplemental_phrase_frequency_count']}")
    print(f"- Policy documents: {processed['statistics']['platform_policy_document_count']}")
    print(f"- Wikipedia reference records: {processed['statistics']['wikipedia_reference_count']}")
    print(f"- Legal/institutional records: {processed['statistics']['legal_institutional_count']}")
    print(f"- News attention rows: {processed['statistics']['news_attention_count']}")
    print(f"- Court opinion rows: {processed['statistics']['court_opinion_count']}")
    print(f"- Archive metadata rows: {processed['statistics']['archive_metadata_count']}")
    print(f"- Publication metadata rows: {processed['statistics']['publication_metadata_count']}")
    print(f"- Academic transition rows: {processed['statistics']['academic_transition_count']}")
    print(f"- Failed sources: {processed['statistics']['failed_source_count']}")


if __name__ == "__main__":
    main()
