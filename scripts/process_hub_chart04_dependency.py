#!/usr/bin/env python3
"""Process hub Chart 04 semantic-dependency evidence.

The output is a cautious data layer for a narrative where hub becomes a
modifier-dependent naming operator: useful as a form, but increasingly
specified by the domain word attached to it.
"""

from __future__ import annotations

import json
from collections import Counter, defaultdict
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

DEPENDENCY_WEIGHTS = {
    "standalone": 0.12,
    "relational_phrase": 0.48,
    "specified_object": 0.56,
    "hub_as_modifier": 0.64,
    "modifier_defined": 0.82,
    "institutional_modifier_defined": 0.88,
    "brand_compound": 0.94,
}

FORM_LABELS = {
    "standalone_headword": "standalone hub",
    "hub_of_x": "hub of X",
    "modifier_plus_hub": "X + hub",
    "suffix_phrase": "X + hub",
    "prefix_phrase": "hub + X",
    "closed_compound": "closed compound",
    "hyphenated_compound": "hyphenated compound",
    "prefix_brand": "HubX brand form",
    "suffix_phrase_brand": "X Hub brand form",
}


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def load_json(path: Path, fallback: Any | None = None) -> Any:
    if not path.exists():
        return fallback
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def normalize_term(term: str) -> str:
    return term.lower().replace("-", " ").strip()


def score_record(record: dict[str, Any]) -> dict[str, Any]:
    dependency_class = record.get("dependency_class", "")
    base = DEPENDENCY_WEIGHTS.get(dependency_class, 0.5)
    frequency_status = record.get("frequency_record_status", "")
    chart03_meta = record.get("chart03_metadata", {})
    support = chart03_meta.get("frequency_signal_strength", record.get("frequency_signal_strength", ""))
    object_type = record.get("object_type", "")

    if frequency_status == "found_existing":
        base += 0.03
    if support == "strong":
        base += 0.04
    elif support == "usable":
        base += 0.02
    if object_type in {"platform_content_access", "student_service", "service_portal", "equipment_room", "resource_center"}:
        base += 0.03
    if record.get("form_type") in {"closed_compound", "hyphenated_compound", "prefix_brand"}:
        base += 0.02

    score = max(0.0, min(base, 1.0))
    if score >= 0.82:
        tier = "high_dependency"
    elif score >= 0.58:
        tier = "medium_dependency"
    elif score >= 0.35:
        tier = "contextual_dependency"
    else:
        tier = "low_dependency"
    return {"modifier_dependency_score": round(score, 3), "dependency_tier": tier}


def frequency_summary(record: dict[str, Any]) -> dict[str, Any]:
    freq = record.get("frequency_record") or {}
    stats = freq.get("stats", {})
    periods = freq.get("average_frequency_by_period", [])
    return {
        "frequency_record_status": record.get("frequency_record_status", ""),
        "first_nonzero_year": stats.get("first_nonzero_year"),
        "peak_year": stats.get("peak_year"),
        "peak_frequency_per_million": stats.get("peak_frequency_per_million"),
        "nonzero_year_count": stats.get("nonzero_year_count"),
        "period_count": len(periods),
    }


def build_dependency_index(inventory_raw: dict[str, Any], frequency_raw: dict[str, Any]) -> dict[str, Any]:
    frequency_lookup = {normalize_term(row["term"]): row for row in frequency_raw.get("records", [])}
    records = []
    for raw in inventory_raw.get("records", []):
        term = raw["term"]
        frequency = frequency_lookup.get(normalize_term(term), {})
        merged = {**raw, **frequency}
        score = score_record(merged)
        records.append(
            {
                "term": term,
                "form_type": raw.get("form_type", ""),
                "form_label": FORM_LABELS.get(raw.get("form_type", ""), raw.get("form_type", "")),
                "dependency_class": raw.get("dependency_class", ""),
                "modifier_or_domain": raw.get("modifier_or_domain", ""),
                "object_type": raw.get("object_type", ""),
                **score,
                "frequency_summary": frequency_summary(frequency),
                "evidence_sources": raw.get("source_basis", []),
                "notes": raw.get("notes", ""),
            }
        )
    records.sort(key=lambda row: (-row["modifier_dependency_score"], row["term"].lower()))

    class_counts = Counter(row["dependency_class"] for row in records)
    tier_counts = Counter(row["dependency_tier"] for row in records)
    object_type_counts = Counter(row["object_type"] or "unknown" for row in records)
    return {
        "metadata": metadata(),
        "summary": {
            "record_count": len(records),
            "dependency_class_counts": dict(class_counts),
            "dependency_tier_counts": dict(tier_counts),
            "object_type_count": len(object_type_counts),
            "object_type_counts": dict(object_type_counts),
            "interpretive_note": "High dependency means the attached domain/modifier does much of the work of specifying what kind of object or access point hub names.",
        },
        "records": records,
    }


def metadata() -> dict[str, Any]:
    return {
        "word": "hub",
        "chart_id": "chart_04",
        "generated_at": utc_now(),
        "generated_by_script": "scripts/process_hub_chart04_dependency.py",
        "purpose": "semantic dependency and modifier-dominance layer for Chart 04 planning",
    }


def build_modifier_terms(index: dict[str, Any], examples_raw: dict[str, Any]) -> dict[str, Any]:
    records = index["records"]
    by_form: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for row in records:
        by_form[row["form_type"]].append(row)

    strongest = [row for row in records if row["dependency_tier"] == "high_dependency"]
    medium = [row for row in records if row["dependency_tier"] == "medium_dependency"]
    visibility = {
        normalize_term(row["term"]): row for row in examples_raw.get("visibility_records", [])
    }
    terms = []
    for row in strongest + medium[:15]:
        visible = visibility.get(normalize_term(row["term"]), {})
        terms.append(
            {
                "term": row["term"],
                "form_type": row["form_type"],
                "dependency_class": row["dependency_class"],
                "modifier_or_domain": row["modifier_or_domain"],
                "object_type": row["object_type"],
                "modifier_dependency_score": row["modifier_dependency_score"],
                "dependency_tier": row["dependency_tier"],
                "visibility_status": visible.get("visibility_status", ""),
                "recommended_use": "main_example" if row["dependency_tier"] == "high_dependency" else "supporting_example",
                "caution": caution_for_term(row),
            }
        )

    return {
        "metadata": metadata(),
        "form_groups": [
            {
                "form_type": form_type,
                "label": FORM_LABELS.get(form_type, form_type),
                "term_count": len(rows),
                "mean_dependency_score": round(sum(row["modifier_dependency_score"] for row in rows) / len(rows), 3) if rows else 0,
                "terms": [row["term"] for row in rows[:12]],
            }
            for form_type, rows in sorted(by_form.items())
        ],
        "modifier_dominance_terms": terms,
    }


def caution_for_term(row: dict[str, Any]) -> str:
    if row["form_type"] in {"closed_compound", "hyphenated_compound", "prefix_brand"}:
        return "Brand/platform form; do not treat as ordinary lexical frequency."
    if row["term"].lower() == "pornhub":
        return "Adult-brand example; keep optional and neutral."
    if row["dependency_tier"] == "high_dependency":
        return "Useful for showing domain/modifier-driven hub naming."
    return "Use as supporting evidence, not a central claim."


def build_subject_object_tension(index: dict[str, Any]) -> dict[str, Any]:
    records = index["records"]
    object_types = sorted({row["object_type"] for row in records if row["object_type"]})
    by_tier = defaultdict(list)
    for row in records:
        by_tier[row["dependency_tier"]].append(row["term"])

    return {
        "metadata": metadata(),
        "concept": "hub becomes stable as a naming operator but unstable as a single object category",
        "object_type_diversity": {
            "count": len(object_types),
            "object_types": object_types,
            "interpretation": "The same hub form names platforms, rooms, service portals, technical nodes, content access points, and lexical background uses.",
        },
        "dependency_distribution": {tier: terms[:18] for tier, terms in by_tier.items()},
        "standalone_comparison": [
            row for row in records if row["dependency_class"] in {"standalone", "relational_phrase", "specified_object"}
        ],
        "cautions": [
            "This layer can support modifier-driven naming, but it cannot directly measure reader cognition.",
            "Do not claim hub becomes meaningless; the stronger claim is that hub becomes relational and underspecified without a modifier.",
            "Brand examples are recognition anchors and naming evidence, not corpus-frequency evidence.",
        ],
    }


def build_support_matrix(index: dict[str, Any], examples_raw: dict[str, Any]) -> dict[str, Any]:
    summary = index["summary"]
    high_count = summary["dependency_tier_counts"].get("high_dependency", 0)
    medium_count = summary["dependency_tier_counts"].get("medium_dependency", 0)
    object_count = summary["object_type_count"]
    brand_count = sum(1 for row in index["records"] if row["dependency_class"] == "brand_compound")
    institutional_count = len(examples_raw.get("institutional_access_examples", []))

    claims = [
        {
            "claim_id": "chart04_claim_001",
            "claim": "Modern hub naming is often modifier-defined: the X before hub determines the object or domain.",
            "support_status": "supported" if high_count >= 10 else "partially_supported",
            "evidence_basis": [f"{high_count} high-dependency terms", "Chart 03 suffix_phrase pattern supported"],
            "confidence": "high" if high_count >= 10 else "medium",
            "caution": "This supports naming behavior, not every speaker's interpretation.",
        },
        {
            "claim_id": "chart04_claim_002",
            "claim": "Hub is stable as a format but unstable as a single object category.",
            "support_status": "supported" if object_count >= 8 else "partially_supported",
            "evidence_basis": [f"{object_count} object types across retained hub forms"],
            "confidence": "high" if object_count >= 8 else "medium",
            "caution": "Object-type diversity comes from curated terms and source metadata, not a full language census.",
        },
        {
            "claim_id": "chart04_claim_003",
            "claim": "Brand/platform forms show hub as a naming material rather than ordinary lexical frequency.",
            "support_status": "supported" if brand_count >= 5 else "partially_supported",
            "evidence_basis": [f"{brand_count} retained brand/platform examples"],
            "confidence": "medium",
            "caution": "Brand recognition must not be equated with lexical frequency or semantic dominance.",
        },
        {
            "claim_id": "chart04_claim_004",
            "claim": "The narrative can frame hub as semantically bleached only cautiously.",
            "support_status": "partially_supported",
            "evidence_basis": ["High modifier dependency", "Chart 01 confirms older senses survive", "Chart 03 confirms X + hub pattern"],
            "confidence": "medium",
            "caution": "Use 'relational / underspecified / naming operator' rather than 'meaningless' or 'disappeared'.",
        },
        {
            "claim_id": "chart04_claim_005",
            "claim": "The data cannot prove that many people first know hub through one brand example such as Pornhub.",
            "support_status": "not_supported",
            "evidence_basis": ["No audience-recognition survey in the dataset"],
            "confidence": "high",
            "caution": "Pornhub can be a neutral recognition anchor if used sparingly, but not proof of general cognition.",
        },
    ]

    return {
        "metadata": metadata(),
        "summary": {
            "overall_verdict": "supported_with_caution",
            "high_dependency_terms": high_count,
            "medium_dependency_terms": medium_count,
            "brand_platform_examples": brand_count,
            "institutional_examples": institutional_count,
            "object_type_diversity_count": object_count,
        },
        "claims": claims,
        "recommended_chart04_focus": "Show hub as a center-word whose object is increasingly supplied by its modifier: X carries the domain, hub supplies the access/centrality format.",
        "do_not_claim": [
            "Do not claim hub has lost all meaning.",
            "Do not claim brand popularity equals lexical meaning.",
            "Do not claim corpus data can prove individual recognition or first exposure.",
            "Do not claim every X + hub phrase means the same thing.",
        ],
    }


def build_chart_preview(
    index: dict[str, Any],
    modifier_terms: dict[str, Any],
    subject_object: dict[str, Any],
    matrix: dict[str, Any],
) -> dict[str, Any]:
    return {
        "metadata": {
            **metadata(),
            "working_title": "Centrality Rebuilt",
            "narrative_direction": "hub as modifier-dependent naming operator",
            "source_summary": [
                "Reuses Chart 03 naming data, institutional examples, and brand/platform inventory.",
                "Reuses first-pass frequency/phrase records where local series exist.",
                "No new broad scraping or UI work in this pass.",
            ],
            "limitations": matrix["do_not_claim"],
        },
        "semantic_dependency_index": index["summary"],
        "modifier_dominance_terms": modifier_terms["modifier_dominance_terms"],
        "subject_object_tension": subject_object,
        "narrative_support_matrix": matrix,
        "recommended_visual_inputs": {
            "main_terms": [row["term"] for row in modifier_terms["modifier_dominance_terms"][:12]],
            "comparison_terms": [
                row["term"]
                for row in index["records"]
                if row["dependency_class"] in {"standalone", "relational_phrase", "specified_object"}
            ],
            "brand_or_platform_examples": [
                row["term"] for row in index["records"] if row["dependency_class"] == "brand_compound"
            ],
            "cautions": matrix["do_not_claim"],
        },
    }


def write_report(report: dict[str, Any], matrix: dict[str, Any], index: dict[str, Any], modifier_terms: dict[str, Any]) -> None:
    md = f"""# Hub Chart 04 Semantic Dependency Data Report

Generated: {report['metadata']['generated_at']}

## Purpose

This pass tests a Chart 04 direction where **hub** is not simply treated as a stable center noun. The working question is whether modern hub forms increasingly rely on the attached domain word: `student hub`, `data hub`, `GitHub`, `Pornhub`, `resource hub`, and similar forms.

## Source Base

- Existing Chart 03 naming data, brand/platform inventory, institutional examples, and search visibility.
- Existing first-pass frequency and phrase series where available.
- Existing Chart 01 and Chart 02 conclusions as context.
- No new external web or Ngram requests were made in this pass.

## Main Finding

Verdict: **{matrix['summary']['overall_verdict']}**

The strongest supported formulation is:

> Hub remains meaningful, but in many modern names it becomes relational and underspecified; the modifier supplies the object/domain while hub supplies an access, aggregation, or centrality format.

## Counts

| Measure | Count |
|---|---:|
| Dependency records | {index['summary']['record_count']} |
| High-dependency terms | {matrix['summary']['high_dependency_terms']} |
| Medium-dependency terms | {matrix['summary']['medium_dependency_terms']} |
| Brand/platform examples | {matrix['summary']['brand_platform_examples']} |
| Institutional examples reused | {matrix['summary']['institutional_examples']} |
| Object-type diversity | {matrix['summary']['object_type_diversity_count']} |

## Claim Support

| Claim | Status | Confidence | Caution |
|---|---|---|---|
"""
    for claim in matrix["claims"]:
        md += f"| {claim['claim']} | {claim['support_status']} | {claim['confidence']} | {claim['caution']} |\n"

    md += """
## Strongest Modifier-Dependent Examples

"""
    for row in modifier_terms["modifier_dominance_terms"][:16]:
        md += f"- **{row['term']}** — {row['form_type']}, {row['object_type']}, score {row['modifier_dependency_score']}\n"

    md += """
## Data Cautions

- Do not claim hub has become meaningless.
- Do not claim brand popularity equals lexical frequency.
- Do not claim individual recognition or first exposure without survey evidence.
- Do not use Pornhub as a sensational example; if used, treat it neutrally as one platform-era compound.
- Do not collapse all X + hub forms into the same sense.

## Recommendation

Chart 04 is ready for visual planning if it is framed as a narrative of modifier dependency and object-type instability, not as proof that hub has lost all meaning.
"""
    write_json(REPORTS_DIR / "hub_chart04_dependency_data_report.json", report)
    (REPORTS_DIR / "hub_chart04_dependency_data_report.md").write_text(md, encoding="utf-8")


def append_preview(layer: dict[str, Any]) -> None:
    for path in [GENERATED_PREVIEW, RESEARCH_PREVIEW]:
        preview = load_json(path, {})
        preview["chart04_dependency_layer"] = layer
        write_json(path, preview)


def main() -> None:
    inventory_raw = load_json(RAW_DIR / "hub_chart04_dependency_inventory_raw.json", {})
    frequency_raw = load_json(RAW_DIR / "hub_chart04_dependency_frequency_raw.json", {})
    examples_raw = load_json(RAW_DIR / "hub_chart04_dependency_examples_raw.json", {})

    index = build_dependency_index(inventory_raw, frequency_raw)
    modifier_terms = build_modifier_terms(index, examples_raw)
    subject_object = build_subject_object_tension(index)
    matrix = build_support_matrix(index, examples_raw)
    preview = build_chart_preview(index, modifier_terms, subject_object, matrix)

    write_json(PROCESSED_DIR / "hub_chart04_semantic_dependency_index.json", index)
    write_json(PROCESSED_DIR / "hub_chart04_modifier_dominance_terms.json", modifier_terms)
    write_json(PROCESSED_DIR / "hub_chart04_subject_object_tension.json", subject_object)
    write_json(PROCESSED_DIR / "hub_chart04_narrative_support_matrix.json", matrix)
    write_json(PROCESSED_DIR / "hub_chart04_chart_data_preview.json", preview)

    report = {
        "metadata": metadata(),
        "summary": matrix["summary"],
        "dependency_class_counts": index["summary"]["dependency_class_counts"],
        "dependency_tier_counts": index["summary"]["dependency_tier_counts"],
        "object_type_counts": index["summary"]["object_type_counts"],
        "claim_support": matrix["claims"],
        "recommended_chart04_focus": matrix["recommended_chart04_focus"],
        "output_paths": {
            "semantic_dependency_index": "docs/research/hub/processed/hub_chart04_semantic_dependency_index.json",
            "modifier_dominance_terms": "docs/research/hub/processed/hub_chart04_modifier_dominance_terms.json",
            "subject_object_tension": "docs/research/hub/processed/hub_chart04_subject_object_tension.json",
            "narrative_support_matrix": "docs/research/hub/processed/hub_chart04_narrative_support_matrix.json",
            "chart_data_preview": "docs/research/hub/processed/hub_chart04_chart_data_preview.json",
            "markdown_report": "docs/research/hub/reports/hub_chart04_dependency_data_report.md",
        },
    }
    write_report(report, matrix, index, modifier_terms)
    append_preview(preview)

    print("Chart 04 semantic dependency processing complete")
    print(f"dependency records: {index['summary']['record_count']}")
    print(f"high / medium dependency: {matrix['summary']['high_dependency_terms']} / {matrix['summary']['medium_dependency_terms']}")
    print(f"object-type diversity: {matrix['summary']['object_type_diversity_count']}")
    print(f"overall verdict: {matrix['summary']['overall_verdict']}")
    print("outputs:")
    for output in report["output_paths"].values():
        print(f"- {output}")


if __name__ == "__main__":
    main()
