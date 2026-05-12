#!/usr/bin/env python3
"""Build chart-readiness audit outputs for the hub dataset.

This is a local consolidation pass only. It reads existing hub data layers and
adds a separated chart_readiness_layer to chart-facing previews.
"""

from __future__ import annotations

import json
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
RESEARCH_DIR = ROOT / "docs" / "research" / "hub"
PROCESSED_DIR = RESEARCH_DIR / "processed"
REPORTS_DIR = RESEARCH_DIR / "reports"
GENERATED_PREVIEW = ROOT / "src" / "data" / "generated" / "hub_chart_data_preview.json"
RESEARCH_PREVIEW = PROCESSED_DIR / "hub_chart_data_preview.json"


TARGET_PHRASES = [
    "wheel hub",
    "transport hub",
    "airport hub",
    "network hub",
    "innovation hub",
    "business hub",
    "digital hub",
    "content hub",
    "data hub",
    "learning hub",
    "resource hub",
]


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def phrase_by_name(phrase_series: dict[str, Any]) -> dict[str, dict[str, Any]]:
    return {item.get("phrase", ""): item for item in phrase_series.get("phrases", [])}


def frequency_signal_strength(phrase: dict[str, Any] | None) -> str:
    if not phrase:
        return "missing"
    signal = phrase.get("approximate_frequency_signal", {})
    status = signal.get("status")
    peak = signal.get("peak_frequency_per_million") or 0
    nonzero = signal.get("nonzero_year_count") or 0
    reliability = phrase.get("reliability_level")
    if status == "too_sparse" or peak < 0.005:
        return "weak"
    if reliability == "high" and (peak >= 0.05 or nonzero >= 100):
        return "strong"
    if peak >= 0.015 or nonzero >= 40:
        return "medium"
    return "weak"


def earliest_evidence_quality(term: str, phrase: dict[str, Any] | None, strengthened: list[dict[str, Any]]) -> str:
    direct = [
        item
        for item in strengthened
        if item.get("term") in {term, term + "s"}
        or (term == "wheel hub" and item.get("sense_id") == "mechanical_core" and item.get("year_type") == "direct_text")
    ]
    if any(item.get("confidence") == "high" and item.get("year_type") == "direct_text" for item in direct):
        return "high"
    if any(item.get("year_type") in {"direct_text", "historical_dictionary"} for item in direct):
        return "medium"
    if phrase and phrase.get("reliability_level") == "high" and not phrase.get("notes"):
        return "medium"
    if phrase:
        return "low"
    return "not_found"


def visual_usefulness(term: str, signal_strength: str, evidence_quality: str) -> str:
    priority_terms = {"wheel hub", "transport hub", "network hub", "innovation hub", "digital hub", "data hub"}
    if term in priority_terms and signal_strength in {"strong", "medium"}:
        return "high"
    if evidence_quality == "high":
        return "high"
    if signal_strength == "medium":
        return "medium"
    if signal_strength == "weak":
        return "low"
    return "low"


def should_appear(term: str, signal_strength: str, evidence_quality: str) -> bool:
    if term in {"content hub", "learning hub", "resource hub"}:
        return signal_strength != "missing"
    return signal_strength in {"strong", "medium"} or evidence_quality in {"high", "medium"}


def build_phrase_readiness(phrase_series: dict[str, Any], strengthened: list[dict[str, Any]]) -> list[dict[str, Any]]:
    by_phrase = phrase_by_name(phrase_series)
    phrase_models = []
    for term in TARGET_PHRASES:
        phrase = by_phrase.get(term)
        signal_strength = frequency_signal_strength(phrase)
        evidence_quality = earliest_evidence_quality(term, phrase, strengthened)
        usefulness = visual_usefulness(term, signal_strength, evidence_quality)
        include = should_appear(term, signal_strength, evidence_quality)
        signal = phrase.get("approximate_frequency_signal", {}) if phrase else {}
        phrase_models.append(
            {
                "phrase": term,
                "semantic_category": phrase.get("category") if phrase else None,
                "frequency_signal_strength": signal_strength,
                "earliest_evidence_quality": evidence_quality,
                "earliest_found_year": phrase.get("earliest_found_year") if phrase else None,
                "peak_year": signal.get("peak_year"),
                "peak_frequency_per_million": signal.get("peak_frequency_per_million"),
                "data_quality_status": signal.get("status"),
                "visual_usefulness": usefulness,
                "should_appear_in_chart": include,
                "notes": phrase.get("notes", "") if phrase else "Phrase is not present in the current phrase series.",
            }
        )
    return phrase_models


def build_chart_models(phrase_readiness: list[dict[str, Any]]) -> dict[str, Any]:
    return {
        "metadata": {
            "word": "hub",
            "generated_at": utc_now(),
            "generated_by_script": "scripts/process_hub_chart_readiness.py",
        },
        "chart_candidates": [
            {
                "chart_id": "chart_01",
                "working_title": "From Wheel Center to World Center",
                "core_question": "How did hub move from a physical wheel part to a general metaphor for centrality?",
                "main_data_inputs": [
                    "hub_etymology_summary.json",
                    "hub_evidence_quality_upgrade.json",
                    "hub_strengthened_attestations.json",
                    "hub_nave_relation_summary.json",
                    "hub_semantic_shift_attestations.json",
                ],
                "supported_claims": [
                    "Hub has a foundational mechanical wheel-center sense.",
                    "The 1828 evidence is historical dictionary evidence, not direct corpus prose.",
                    "Nave is a supported contextual relation for the wheel-center sense.",
                    "The 1858 Holmes text supports an early metaphorical central-place use.",
                    "Readable direct mechanical text exists before 1908, with strengthened evidence from 1878 and 1881/1884.",
                ],
                "careful_claims": [
                    "The 1640s/1649 dates can be shown as dictionary claims only.",
                    "Do not imply the 1828 dictionary entry is the earliest known real-world usage.",
                ],
                "unsupported_claims_to_avoid": [
                    "Avoid claiming a verified 1640s primary quotation.",
                    "Avoid claiming that hub definitely derives from nave.",
                ],
                "recommended_visual_structure": "Layered chronology: dictionary claim, historical dictionary support, direct mechanical text, direct metaphorical text, with confidence badges.",
                "data_confidence": "high",
                "notes": "This is the strongest chart candidate because the third pass directly strengthened its evidence base.",
            },
            {
                "chart_id": "chart_02",
                "working_title": "The Transfer Model",
                "core_question": "How did hub become a model for routing movement, people, goods, messages, and information?",
                "main_data_inputs": [
                    "hub_phrase_series.json",
                    "hub_timeline_events.json",
                    "hub_semantic_categories.json",
                    "hub_semantic_shift_attestations.json",
                    "hub_evidence_quality_upgrade.json",
                ],
                "supported_claims": [
                    "The wheel/spoke structure is well supported as the physical model.",
                    "Transport and logistics phrases have broad Ngram support and category support.",
                    "Network and hub-and-spoke phrases show strong modern frequency signals.",
                    "Digital/platform phrases appear as later extensions but with weaker snippet support.",
                ],
                "careful_claims": [
                    "Railroad/railway/airport earliest years should be treated as frequency signals until verified by direct snippets.",
                    "Hub-and-spoke early Ngram years are noisy and should not be used as first-use dates.",
                    "Digital/platform extension can be visualized as modern growth, not as a securely dated origin sequence.",
                ],
                "unsupported_claims_to_avoid": [
                    "Avoid claiming a precise first transport hub date from Ngram alone.",
                    "Avoid claiming the digital platform sense is strongly attested in snippets.",
                ],
                "recommended_visual_structure": "Sankey or stepped transfer map from wheel/spoke to transport routing to networks to platforms, using confidence-coded nodes.",
                "data_confidence": "medium",
                "notes": "Good conceptual chart, but it must separate frequency signals from direct attestation.",
            },
            {
                "chart_id": "chart_03",
                "working_title": "Compound Explosion",
                "core_question": "Which compound phrases made hub expand across transport, business, knowledge, and digital systems?",
                "main_data_inputs": [
                    "hub_phrase_series.json",
                    "hub_frequency_series.json",
                    "hub_semantic_categories.json",
                    "hub_chart_readiness_audit.json",
                ],
                "supported_claims": [
                    "The data supports comparing compound phrase signal strength across mechanical, transport, institutional, network, and digital categories.",
                    "Wheel hub, transport hub, network hub, innovation hub, digital hub, and data hub are useful chart anchors.",
                ],
                "careful_claims": [
                    "Some early dates for business, innovation, data, learning, and platform hub are likely noisy Ngram signals.",
                    "Phrase growth can be shown as frequency visibility rather than earliest semantic proof.",
                ],
                "unsupported_claims_to_avoid": [
                    "Avoid interpreting every first_nonzero_year as a confirmed attestation.",
                    "Avoid over-weighting sparse phrases such as platform hub and server hub.",
                ],
                "recommended_visual_structure": "Small multiples or ranked term cards showing first visible Ngram signal, peak year, peak frequency, category, and evidence confidence.",
                "data_confidence": "medium",
                "notes": "Ready for visual planning if labels stay analytical and confidence-aware.",
            },
            {
                "chart_id": "chart_04",
                "working_title": "The Politics of Centrality",
                "core_question": "What does calling something a hub imply about access, concentration, circulation, and control?",
                "main_data_inputs": [
                    "hub_semantic_categories.json",
                    "hub_phrase_series.json",
                    "hub_timeline_events.json",
                    "hub_snippet_samples.json",
                ],
                "supported_claims": [
                    "Hub language consistently organizes around centrality, connection, circulation, and access.",
                    "Transport, network, institutional, and digital categories show hub as a central node in systems.",
                ],
                "careful_claims": [
                    "Dependence, control, gatekeeping, and platform power are interpretive implications, not directly lexical facts in the dataset.",
                    "Use examples as prompts for interpretation, not proof of political intent.",
                ],
                "unsupported_claims_to_avoid": [
                    "Avoid claiming the dataset proves hub always implies control or gatekeeping.",
                    "Avoid making platform-centrality claims without newer direct examples.",
                ],
                "recommended_visual_structure": "Concept matrix or annotated semantic field map separating directly supported meanings from interpretive implications.",
                "data_confidence": "low",
                "notes": "Interesting but should follow the evidence-led charts, not lead the story.",
            },
        ],
        "phrase_readiness_for_chart_03": phrase_readiness,
    }


def build_gaps() -> dict[str, Any]:
    gaps = [
        {
            "gap_id": "gap_001",
            "gap_description": "1640s/1649 first-use claims lack a visible primary quotation.",
            "affected_chart": "chart_01",
            "severity": "medium",
            "can_proceed_without_fixing": True,
            "recommended_action": "Label 1640s/1649 as dictionary claims only; do not use as confirmed text dates.",
            "requires_new_scraping": False,
        },
        {
            "gap_id": "gap_002",
            "gap_description": "Transport hub earliest evidence relies heavily on Ngram/OCR signals rather than high-confidence direct early attestations.",
            "affected_chart": "chart_02",
            "severity": "medium",
            "can_proceed_without_fixing": True,
            "recommended_action": "Use transport phrases as frequency/category evidence; avoid precise earliest-date claims unless doing a later targeted scrape.",
            "requires_new_scraping": False,
        },
        {
            "gap_id": "gap_003",
            "gap_description": "Hub-and-spoke has strong modern signal but noisy early Ngram years.",
            "affected_chart": "chart_02",
            "severity": "medium",
            "can_proceed_without_fixing": True,
            "recommended_action": "Anchor hub-and-spoke to modern system architecture rather than early first_nonzero_year.",
            "requires_new_scraping": False,
        },
        {
            "gap_id": "gap_004",
            "gap_description": "Digital/platform hub phrases have sparse or low-confidence snippet evidence.",
            "affected_chart": "chart_02, chart_03, chart_04",
            "severity": "medium",
            "can_proceed_without_fixing": True,
            "recommended_action": "Show digital/platform terms as later Ngram-supported extensions; avoid origin or dominance claims.",
            "requires_new_scraping": False,
        },
        {
            "gap_id": "gap_005",
            "gap_description": "Server hub and platform hub are sparse and should not carry major chart weight.",
            "affected_chart": "chart_03",
            "severity": "low",
            "can_proceed_without_fixing": True,
            "recommended_action": "Exclude from primary compound comparison or place in a low-signal appendix group.",
            "requires_new_scraping": False,
        },
        {
            "gap_id": "gap_006",
            "gap_description": "Snippet sample count remains below the original broad target and uneven across categories.",
            "affected_chart": "chart_02, chart_04",
            "severity": "low",
            "can_proceed_without_fixing": True,
            "recommended_action": "Use snippets selectively for examples; do not make snippet-density charts.",
            "requires_new_scraping": False,
        },
        {
            "gap_id": "gap_007",
            "gap_description": "Nave relation is supported for context but not enough for a standalone origin argument.",
            "affected_chart": "chart_01",
            "severity": "low",
            "can_proceed_without_fixing": True,
            "recommended_action": "Use nave as a small contextual note beside wheel terminology.",
            "requires_new_scraping": False,
        },
    ]
    counts = Counter(item["severity"] for item in gaps)
    return {
        "metadata": {
            "word": "hub",
            "generated_at": utc_now(),
            "generated_by_script": "scripts/process_hub_chart_readiness.py",
        },
        "gap_summary": {
            "total_gaps": len(gaps),
            "high": counts.get("high", 0),
            "medium": counts.get("medium", 0),
            "low": counts.get("low", 0),
            "blocking_gaps": 0,
            "new_scraping_recommended": False,
            "notes": "No blocking gap requires new scraping before chart planning. Later targeted checks may improve precision but are not required.",
        },
        "gaps": gaps,
    }


def build_readiness_audit(
    chart_models: dict[str, Any],
    gaps: dict[str, Any],
    phrase_readiness: list[dict[str, Any]],
    evidence_upgrade: dict[str, Any],
    nave_summary: dict[str, Any],
    snippet_samples: dict[str, Any],
) -> dict[str, Any]:
    chart_readiness = [
        {
            "chart_id": "chart_01",
            "working_title": "From Wheel Center to World Center",
            "readiness": "strong",
            "evidence_classification": {
                "mechanical_wheel_center": "strong",
                "hub_nave_relation": "usable but needs careful wording",
                "early_dictionary_evidence": "usable but needs careful wording",
                "direct_text_evidence": "strong",
                "metaphorical_expansion": "strong",
            },
            "why": "Third-pass evidence gives high-confidence direct metaphor evidence in 1858 and direct mechanical text from 1878, while 1828 is clarified as historical dictionary support.",
            "main_risk": "1640s/1649 remain dictionary claims, not confirmed primary-text dates.",
        },
        {
            "chart_id": "chart_02",
            "working_title": "The Transfer Model",
            "readiness": "usable but needs careful wording",
            "evidence_classification": {
                "wheel_spoke_structure": "strong",
                "city_commerce_center": "usable but needs careful wording",
                "railway_transport_airport_hub": "usable but needs careful wording",
                "hub_and_spoke_system": "usable but needs careful wording",
                "communication_network_hub": "usable but needs careful wording",
                "digital_platform_hub": "weak",
            },
            "why": "Frequency, phrase, and category data support the transfer-model arc, but many earliest dates are Ngram signals or OCR candidates.",
            "main_risk": "Treating frequency first appearances as confirmed semantic first uses.",
        },
        {
            "chart_id": "chart_03",
            "working_title": "Compound Explosion",
            "readiness": "usable but needs careful wording",
            "evidence_classification": {
                "phrase_growth": "strong",
                "compound_formation": "usable but needs careful wording",
                "late_digital_compounds": "weak",
            },
            "why": "The phrase series covers enough compounds for comparison, but several modern terms need confidence coding.",
            "main_risk": "Over-interpreting sparse or noisy compounds such as platform hub, server hub, and early data hub.",
        },
        {
            "chart_id": "chart_04",
            "working_title": "The Politics of Centrality",
            "readiness": "weak",
            "evidence_classification": {
                "connection": "strong",
                "access": "usable but needs careful wording",
                "concentration": "usable but needs careful wording",
                "coordination": "usable but needs careful wording",
                "dependence": "interpretive",
                "control": "interpretive",
                "gatekeeping": "interpretive",
                "circulation": "strong",
                "platform_centrality": "weak",
            },
            "why": "The dataset supports centrality and circulation, but political implications require interpretation beyond direct lexical evidence.",
            "main_risk": "Letting an interpretive theme sound more directly evidenced than it is.",
        },
    ]

    return {
        "metadata": {
            "word": "hub",
            "generated_at": utc_now(),
            "generated_by_script": "scripts/process_hub_chart_readiness.py",
            "scope": "Chart-readiness audit and consolidation; no new scraping.",
        },
        "summary_verdict": "mostly ready",
        "final_recommendation": "proceed to chart planning",
        "new_scraping_recommended": False,
        "optional_research_note": "A later small targeted scrape could improve transport/hub-and-spoke earliest attestations, but it is not required before planning.",
        "evidence_state": {
            "earliest_claimed_year": evidence_upgrade.get("new_earliest_claimed_year"),
            "claim_1640s_resolved_to_primary_quotation": evidence_upgrade.get("claim_1640s_resolved"),
            "evidence_1828_classification": evidence_upgrade.get("evidence_1828_classification"),
            "new_earliest_direct_text_year": evidence_upgrade.get("new_earliest_direct_text_year"),
            "new_earliest_mechanical_direct_text_year": evidence_upgrade.get("new_earliest_mechanical_direct_text_year"),
            "strengthened_attestations": evidence_upgrade.get("confidence_change_summary", {}),
            "nave_relation_supported": nave_summary.get("relationship_supported"),
            "snippet_samples": len(snippet_samples.get("snippets", [])),
        },
        "chart_readiness": chart_readiness,
        "phrase_readiness": phrase_readiness,
        "gap_summary": gaps["gap_summary"],
        "data_strengths": [
            "Strong evidence path for mechanical wheel center to metaphorical center.",
            "Clear distinction between dictionary claims, historical dictionary evidence, and direct text evidence.",
            "Good broad phrase/frequency coverage across mechanical, transport, institutional, network, and digital categories.",
            "Nave relation is supported enough for contextual use.",
        ],
        "data_weaknesses": [
            "1640s/1649 first-use dates lack visible primary quotations.",
            "Transport and hub-and-spoke earliest claims need caution because many are Ngram or OCR leads.",
            "Digital/platform phrase evidence is comparatively sparse and low-confidence.",
            "Political/control/gatekeeping themes are interpretive, not directly proved by the lexical dataset.",
        ],
    }


def markdown_report(audit: dict[str, Any], candidate_models: dict[str, Any], gaps: dict[str, Any]) -> str:
    chart_rows = []
    for item in audit["chart_readiness"]:
        chart_rows.append(
            f"| {item['chart_id']} | {item['working_title']} | {item['readiness']} | {item['main_risk']} |"
        )

    gap_rows = []
    for item in gaps["gaps"]:
        gap_rows.append(
            f"| {item['gap_id']} | {item['affected_chart']} | {item['severity']} | {str(item['can_proceed_without_fixing']).lower()} | {item['gap_description']} |"
        )

    strengths = "\n".join(f"- {item}" for item in audit["data_strengths"])
    weaknesses = "\n".join(f"- {item}" for item in audit["data_weaknesses"])

    candidate_notes = []
    for item in candidate_models["chart_candidates"]:
        candidate_notes.append(f"- `{item['chart_id']}` {item['working_title']}: {item['data_confidence']} confidence. {item['notes']}")

    return f"""# Hub Chart Readiness Audit

Generated: {audit['metadata']['generated_at']}

## Summary Verdict

Verdict: **{audit['summary_verdict']}**

Final recommendation: **{audit['final_recommendation']}**.

No blocking new scraping is recommended before chart planning. A small later targeted check could improve transport and hub-and-spoke dating, but the current dataset is sufficient to plan charts if confidence boundaries are preserved.

## Evidence Strengths

{strengths}

## Evidence Weaknesses

{weaknesses}

## Chart-By-Chart Readiness

| Chart | Working title | Readiness | Main risk |
|---|---|---|---|
{chr(10).join(chart_rows)}

## Candidate Model Notes

{chr(10).join(candidate_notes)}

## Remaining Gaps

| Gap | Affected chart | Severity | Can proceed | Description |
|---|---|---|---|---|
{chr(10).join(gap_rows)}

## More Scraping?

Recommended before chart planning: **no**.

Optional later scraping: one small targeted scrape for transport hub, railway/railroad hub, and hub-and-spoke if the final charts need precise earliest-attestation labels.

## Recommended Next Step

Proceed to chart planning. Lead with Chart 1, treat Chart 2 and Chart 3 as confidence-coded data visuals, and keep Chart 4 as a later interpretive/conceptual chart unless more direct modern/platform evidence is gathered.
"""


def update_preview(audit: dict[str, Any], candidate_models: dict[str, Any], gaps: dict[str, Any]) -> None:
    layer = {
        "metadata": {
            "generated_at": utc_now(),
            "generated_by_script": "scripts/process_hub_chart_readiness.py",
            "note": "Chart-readiness audit layer; existing etymology_layer and evidence_strengthening_layer are preserved.",
        },
        "summary_verdict": audit["summary_verdict"],
        "final_recommendation": audit["final_recommendation"],
        "new_scraping_recommended": audit["new_scraping_recommended"],
        "chart_readiness": audit["chart_readiness"],
        "gap_summary": gaps["gap_summary"],
        "chart_candidate_summaries": [
            {
                "chart_id": item["chart_id"],
                "working_title": item["working_title"],
                "data_confidence": item["data_confidence"],
                "recommended_visual_structure": item["recommended_visual_structure"],
            }
            for item in candidate_models["chart_candidates"]
        ],
    }
    for path in [GENERATED_PREVIEW, RESEARCH_PREVIEW]:
        if path.exists():
            preview = load_json(path)
            preview["chart_readiness_layer"] = layer
            write_json(path, preview)


def validate(paths: list[Path]) -> None:
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
    phrase_series = load_json(PROCESSED_DIR / "hub_phrase_series.json")
    snippet_samples = load_json(PROCESSED_DIR / "hub_snippet_samples.json")
    evidence_upgrade = load_json(PROCESSED_DIR / "hub_evidence_quality_upgrade.json")
    nave_summary = load_json(PROCESSED_DIR / "hub_nave_relation_summary.json")
    strengthened = load_json(PROCESSED_DIR / "hub_strengthened_attestations.json")

    phrase_readiness = build_phrase_readiness(phrase_series, strengthened.get("strengthened_attestations", []))
    candidate_models = build_chart_models(phrase_readiness)
    gaps = build_gaps()
    audit = build_readiness_audit(candidate_models, gaps, phrase_readiness, evidence_upgrade, nave_summary, snippet_samples)

    report = {
        "metadata": audit["metadata"],
        "summary": {
            "chart_readiness_verdict": audit["summary_verdict"],
            "candidate_charts": len(candidate_models["chart_candidates"]),
            "gap_counts": gaps["gap_summary"],
            "new_scraping_recommended": audit["new_scraping_recommended"],
            "final_recommendation": audit["final_recommendation"],
        },
        "audit": audit,
        "chart_candidate_models": candidate_models["chart_candidates"],
        "data_gaps": gaps["gaps"],
    }

    write_json(PROCESSED_DIR / "hub_chart_readiness_audit.json", audit)
    write_json(PROCESSED_DIR / "hub_chart_candidate_models.json", candidate_models)
    write_json(PROCESSED_DIR / "hub_data_gaps_for_visualisation.json", gaps)
    write_json(REPORTS_DIR / "hub_chart_readiness_audit.json", report)
    (REPORTS_DIR / "hub_chart_readiness_audit.md").write_text(
        markdown_report(audit, candidate_models, gaps),
        encoding="utf-8",
    )
    update_preview(audit, candidate_models, gaps)

    expected = [
        PROCESSED_DIR / "hub_chart_readiness_audit.json",
        PROCESSED_DIR / "hub_chart_candidate_models.json",
        PROCESSED_DIR / "hub_data_gaps_for_visualisation.json",
        REPORTS_DIR / "hub_chart_readiness_audit.json",
        GENERATED_PREVIEW,
        RESEARCH_PREVIEW,
    ]
    validate(expected)

    counts = gaps["gap_summary"]
    print("Hub chart readiness audit summary")
    print(f"- Chart readiness verdict: {audit['summary_verdict']}")
    print(f"- Candidate charts: {len(candidate_models['chart_candidates'])}")
    print(f"- Gap counts: high={counts['high']}, medium={counts['medium']}, low={counts['low']}")
    print(f"- New scraping recommended: {audit['new_scraping_recommended']}")
    print("- Output paths:")
    for path in expected[:4] + [REPORTS_DIR / "hub_chart_readiness_audit.md", GENERATED_PREVIEW]:
        print(f"  - {path.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
