#!/usr/bin/env python3
"""Process hub Chart 02 recovery and evidence-hardening outputs."""

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

LAYER_ORDER = [
    "rail_transit_route",
    "air_logistics_route",
    "hub_and_spoke_model",
    "network_communication_route",
    "institutional_route_language",
]
MAIN_MODEL_TERMS = {"hub and spoke", "hub-and-spoke", "hub-and-spoke system", "hub and spoke system", "hub-and-spoke network", "hub and spoke network", "hub-and-spoke model", "hub and spoke model"}
CORE_MAIN_MODEL_TERMS = {"hub and spoke", "hub-and-spoke"}
AMBIGUOUS_TERMS = {"regional hub", "global hub", "international hub", "service hub", "resource hub", "digital hub", "platform hub", "server hub"}


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def load_json(path: Path, fallback: Any | None = None) -> Any:
    if not path.exists():
        return fallback
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def confidence_rank(value: str) -> int:
    return {"low": 0, "medium": 1, "high": 2}.get(value, 0)


def normalize_support(item: dict[str, Any]) -> str:
    term = str(item.get("term", "")).lower()
    text = " ".join(
        str(item.get(key, ""))
        for key in ["supports_claim", "evidence_text_short", "context_summary", "source_title"]
    ).lower()
    if "spoke" in term or "spoke" in text:
        return "explicit_hub_and_spoke_model"
    if any(word in term for word in ["logistics", "distribution", "shipping", "cargo", "freight", "supply chain"]):
        return "logistics_distribution"
    if any(word in term for word in ["transport", "transit", "railway", "railroad", "airport", "airline", "bus", "metro", "intermodal"]):
        return "transport_node"
    if any(word in term for word in ["ethernet", "usb", "switching"]):
        return "device_connection"
    if any(word in term for word in ["network", "communication", "telecom", "internet", "data", "server", "digital", "platform"]):
        return "network_communication_node"
    if "central_place_only" in text:
        return "central_place_only"
    if any(word in text for word in ["route", "traffic", "transfer", "redistribution", "connection"]):
        return "routing_transfer"
    return "ambiguous"


def harden_evidence(raw_evidence: dict[str, Any]) -> dict[str, Any]:
    previous = raw_evidence.get("previous_evidence", [])
    hardened = []
    seen: set[tuple[str, str, str]] = set()

    def add(item: dict[str, Any]) -> None:
        key = (str(item.get("term", "")).lower(), str(item.get("year", "")), str(item.get("source_title", item.get("source_path", ""))))
        if key in seen:
            return
        seen.add(key)
        hardened.append(item)

    for old in previous:
        support = normalize_support(old)
        confidence = old.get("confidence", "medium")
        status = "carried_forward"
        reason = "Carried forward from previous Chart 02 evidence layer."
        limitations = old.get("limitations", "")

        if old.get("term") == "railway hub" and old.get("year") == 1943 and old.get("is_direct_attestation"):
            confidence = "high"
            status = "upgraded"
            reason = "Readable dated direct text gives clear railway routing context."
        elif old.get("confidence") == "low":
            status = "retained_low"
            reason = "Retained as low-confidence Ngram/corpus visibility signal, not direct evidence."
        elif old.get("source_type") == "corpus" and not old.get("is_direct_attestation"):
            status = "carried_forward"
            limitations = (limitations + " Frequency signal only; not a first attestation.").strip()

        add(
            {
                "evidence_id": f"hub_chart02_recovered_evidence_{len(hardened) + 1:03d}",
                "previous_evidence_id": old.get("evidence_id"),
                "term": old.get("term", ""),
                "routing_layer": old.get("routing_layer", ""),
                "year": old.get("year"),
                "source_title": old.get("source_title", ""),
                "source_author": old.get("source_author", ""),
                "source_date": old.get("source_date", ""),
                "source_url": old.get("source_url", ""),
                "source_type": old.get("source_type", "other"),
                "evidence_text_short": old.get("evidence_text_short", ""),
                "context_summary": old.get("context_summary", ""),
                "supports_claim": support,
                "is_direct_attestation": bool(old.get("is_direct_attestation")),
                "confidence": confidence,
                "status": status,
                "upgrade_reason": reason,
                "limitations": limitations,
                "copyright_notes": old.get("copyright_notes", "Short paraphrase or short snippet retained for research planning only."),
            }
        )

    counts = Counter(item["confidence"] for item in hardened)
    status_counts = Counter(item["status"] for item in hardened)
    return {
        "metadata": {
            "word": "hub",
            "chart_id": "chart_02",
            "pass": "data_recovery",
            "generated_at": utc_now(),
            "generated_by_script": "scripts/process_hub_chart02_recovery.py",
        },
        "confidence_counts": dict(counts),
        "status_counts": dict(status_counts),
        "evidence_items": hardened,
    }


def layer_for_term(term: str) -> str:
    lower = term.lower()
    if "spoke" in lower:
        return "hub_and_spoke_model"
    if any(word in lower for word in ["rail", "transit", "transport", "bus", "metro", "intermodal", "passenger"]):
        return "rail_transit_route"
    if any(word in lower for word in ["airport", "airline", "shipping", "logistics", "distribution", "cargo", "freight", "supply chain"]):
        return "air_logistics_route"
    if any(word in lower for word in ["network", "communication", "ethernet", "switching", "telecom", "internet", "data", "server", "usb", "digital", "platform"]):
        return "network_communication_route"
    return "institutional_route_language"


def query_stats(series: list[dict[str, Any]]) -> dict[str, Any]:
    values = [float(point.get("frequency_per_million", point.get("value", 0.0))) for point in series]
    nonzero = [point for point in series if float(point.get("frequency_per_million", point.get("value", 0.0))) > 0]
    peak = max(values) if values else 0.0
    return {
        "nonzero_year_count": len(nonzero),
        "first_nonzero_year": int(nonzero[0]["year"]) if nonzero else None,
        "peak_frequency_per_million": round(peak, 8),
    }


def signal_strength(series: list[dict[str, Any]], status: str) -> str:
    if status in {"failed_again", "dropped", "evidence_only"}:
        return "failed" if status in {"failed_again", "dropped"} else "sparse"
    stats = query_stats(series)
    if stats["nonzero_year_count"] == 0:
        return "failed"
    if stats["peak_frequency_per_million"] >= 0.05 and stats["nonzero_year_count"] >= 60:
        return "strong"
    if stats["peak_frequency_per_million"] >= 0.01 and stats["nonzero_year_count"] >= 30:
        return "usable"
    return "sparse"


def build_failed_triage(raw_inventory: dict[str, Any]) -> dict[str, Any]:
    failed = []
    recovery_log = load_json(RAW_DIR / "hub_chart02_recovery_log.json", {})
    triage_lookup = {
        row["query"]: row
        for row in load_json(RAW_DIR / "hub_chart02_recovery_query_inventory_raw.json", {}).get("inventory", [])
        if row["previous_status"] == "failed"
    }
    # The raw inventory carries classification in prose; rebuild compact triage
    # from the recovery log categories and inventory reasons.
    for item in triage_lookup.values():
        reason = item["recovery_reason"]
        if "Recover frequency" in reason:
            category = "recover_from_existing_data"
        elif "retry" in reason.lower():
            category = "retry_frequency"
        elif "Malformed" in reason or "Dropped" in reason:
            category = "drop_or_exclude"
        elif "Ambiguous" in reason:
            category = "ambiguous_or_noisy"
        else:
            category = "evidence_only"
        failed.append(
            {
                "query": item["query"],
                "routing_layer": item["routing_layer"],
                "previous_failure_reason": item["failure_reason"],
                "triage_category": category,
                "recovery_priority": item["recovery_priority"],
                "recommended_action": reason,
                "notes": "Transparent recovery triage; no missing frequency values were invented.",
            }
        )
    return {
        "metadata": {
            "word": "hub",
            "chart_id": "chart_02",
            "generated_at": utc_now(),
            "generated_by_script": "scripts/process_hub_chart02_recovery.py",
        },
        "triage_counts": dict(Counter(row["triage_category"] for row in failed)),
        "failed_queries": failed,
        "raw_recovery_log_summary": recovery_log,
    }


def build_recovered_terms(recovered_frequency: dict[str, Any], hardened_evidence: dict[str, Any]) -> dict[str, Any]:
    evidence_by_term = defaultdict(list)
    max_conf_by_term: dict[str, str] = {}
    for item in hardened_evidence["evidence_items"]:
        term = item["term"].lower()
        evidence_by_term[term].append(item["evidence_id"])
        if confidence_rank(item["confidence"]) > confidence_rank(max_conf_by_term.get(term, "low")):
            max_conf_by_term[term] = item["confidence"]

    terms = []
    for item in recovered_frequency.get("recovered_frequency_items", []):
        strength = signal_strength(item["series"], item["status"])
        evidence_conf = max_conf_by_term.get(item["query"].lower(), "low")
        query_lower = item["query"].lower()
        if query_lower in CORE_MAIN_MODEL_TERMS and item["status"] not in {"dropped", "failed_again"}:
            role = "main_model"
        elif item["routing_layer"] == "institutional_route_language":
            role = "exclude" if item["status"] in {"dropped", "failed_again"} else "annotation"
        elif query_lower in AMBIGUOUS_TERMS:
            role = "exclude" if item["status"] in {"dropped", "failed_again"} else "annotation"
        elif query_lower in MAIN_MODEL_TERMS:
            role = "annotation" if item["status"] not in {"dropped", "failed_again"} else "exclude"
        elif strength == "strong":
            role = "main_series"
        elif strength == "usable":
            role = "supporting"
        elif item["status"] == "dropped":
            role = "exclude"
        elif item["status"] in {"failed_again"}:
            role = "exclude"
        else:
            role = "annotation"
        terms.append(
            {
                "term": item["query"],
                "routing_layer": item["routing_layer"],
                "recovery_status": item["status"],
                "frequency_support": strength,
                "evidence_ids": evidence_by_term[item["query"].lower()],
                "evidence_confidence": evidence_conf,
                "recommended_role_after_recovery": role,
                "notes": item["notes"],
            }
        )
    return {
        "metadata": {
            "word": "hub",
            "chart_id": "chart_02",
            "generated_at": utc_now(),
            "generated_by_script": "scripts/process_hub_chart02_recovery.py",
        },
        "terms": terms,
    }


def build_confidence_matrix(recovered_terms: dict[str, Any], hardened_evidence: dict[str, Any]) -> dict[str, Any]:
    terms = recovered_terms["terms"]
    terms_by_layer = defaultdict(list)
    for term in terms:
        terms_by_layer[term["routing_layer"]].append(term)

    evidence_by_layer = defaultdict(list)
    for item in hardened_evidence["evidence_items"]:
        evidence_by_layer[item["routing_layer"]].append(item)

    role_buckets = {
        "main_model": [],
        "main_series": [],
        "supporting": [],
        "annotation": [],
        "exclude": [],
    }
    for term in terms:
        role_buckets[term["recommended_role_after_recovery"]].append(term["term"])

    layer_rows = []
    for layer in LAYER_ORDER:
        layer_terms = terms_by_layer[layer]
        layer_evidence = evidence_by_layer[layer]
        strengths = [term["frequency_support"] for term in layer_terms]
        if "strong" in strengths:
            frequency_support = "strong"
        elif "usable" in strengths:
            frequency_support = "usable"
        elif "sparse" in strengths:
            frequency_support = "sparse"
        else:
            frequency_support = "failed"

        high_evidence = sum(1 for item in layer_evidence if item["confidence"] == "high")
        medium_evidence = sum(1 for item in layer_evidence if item["confidence"] == "medium")
        if high_evidence >= 1:
            evidence_support = "strong"
        elif medium_evidence >= 1:
            evidence_support = "usable"
        elif layer_evidence:
            evidence_support = "weak"
        else:
            evidence_support = "absent"

        if layer == "hub_and_spoke_model":
            recommended_role = "core_model"
        elif layer == "institutional_route_language":
            recommended_role = "annotation"
        elif frequency_support in {"strong", "usable"} and evidence_support in {"strong", "usable"}:
            recommended_role = "main_series" if frequency_support == "strong" else "supporting"
        elif evidence_support != "absent":
            recommended_role = "annotation"
        else:
            recommended_role = "exclude"

        confidence = "low" if layer == "institutional_route_language" else "high" if frequency_support == "strong" and evidence_support in {"strong", "usable"} else "medium" if frequency_support in {"strong", "usable"} or evidence_support in {"strong", "usable"} else "low"
        layer_rows.append(
            {
                "routing_layer": layer,
                "frequency_support": frequency_support,
                "evidence_support": evidence_support,
                "recommended_role": recommended_role,
                "confidence": confidence,
                "notes": "Use failed or ambiguous query variants only as cautions." if layer == "institutional_route_language" else "",
            }
        )

    main_model_terms = [term for term in role_buckets["main_model"] if term in {"hub and spoke", "hub-and-spoke"}]
    remaining_gaps = []
    failed_variants = [
        term["term"]
        for term in terms
        if term["routing_layer"] == "hub_and_spoke_model" and term["recovery_status"] == "failed_again"
    ]
    if failed_variants:
        remaining_gaps.append(
            {
                "gap": "Expanded hub-and-spoke variants still lack recovered frequency series.",
                "affected_terms": failed_variants,
                "severity": "low",
                "notes": "Core terms hub and spoke / hub-and-spoke remain available and strong enough for the model.",
            }
        )
    distribution_gaps = [
        term["term"]
        for term in terms
        if term["term"] in {"distribution hub", "cargo hub", "freight hub", "supply chain hub"} and term["recovery_status"] == "failed_again"
    ]
    if distribution_gaps:
        remaining_gaps.append(
            {
                "gap": "Some logistics/distribution subterms were not recovered as frequency series.",
                "affected_terms": distribution_gaps,
                "severity": "medium",
                "notes": "Logistics hub itself remains usable; these subterms are optional.",
            }
        )

    return {
        "chart_id": "chart_02",
        "working_title": "The Transfer Model",
        "core_model_status": {
            "hub_and_spoke_strong_enough": bool(main_model_terms),
            "main_model_terms": main_model_terms,
            "confidence": "high" if bool(main_model_terms) else "medium",
            "notes": "Core model remains supported by the two existing hub-and-spoke frequency terms; expanded variants remain gap-limited.",
        },
        "routing_layers": layer_rows,
        "terms_to_use": role_buckets,
        "remaining_gaps": remaining_gaps,
    }


def build_summary(previous_report: dict[str, Any], triage: dict[str, Any], recovered_frequency: dict[str, Any], hardened_evidence: dict[str, Any], matrix: dict[str, Any]) -> dict[str, Any]:
    status_counts = Counter(item["status"] for item in recovered_frequency.get("recovered_frequency_items", []))
    previous_counts = previous_report.get("summary_counts", {})
    previous_evidence = previous_report.get("evidence_confidence_counts", {})
    recovered_from_existing = sum(
        1
        for item in recovered_frequency.get("recovered_frequency_items", [])
        if item["status"] == "recovered" and item["source"] not in {"ngram_retry"}
    )
    recovered_from_retry = sum(
        1
        for item in recovered_frequency.get("recovered_frequency_items", [])
        if item["status"] == "recovered" and item["source"] == "ngram_retry"
    )
    readiness = "ready" if matrix["core_model_status"]["hub_and_spoke_strong_enough"] and not any(gap["severity"] == "high" for gap in matrix["remaining_gaps"]) else "mostly_ready"
    return {
        "previous_summary": {
            "queries_attempted": previous_counts.get("queries_attempted", 54),
            "successful": previous_counts.get("successful_queries", 28),
            "failed": previous_counts.get("failed_queries", 26),
            "evidence_items": previous_counts.get("evidence_items", 21),
            "high_confidence_evidence": previous_evidence.get("high", 3),
            "medium_confidence_evidence": previous_evidence.get("medium", 15),
            "low_confidence_evidence": previous_evidence.get("low", 3),
        },
        "recovery_summary": {
            "failed_queries_retriaged": len(triage["failed_queries"]),
            "frequency_series_recovered": status_counts.get("recovered", 0),
            "recovered_from_existing_cache": recovered_from_existing,
            "recovered_from_ngram_retry": recovered_from_retry,
            "failed_again": status_counts.get("failed_again", 0),
            "marked_evidence_only": status_counts.get("evidence_only", 0),
            "dropped_or_excluded": status_counts.get("dropped", 0),
            "hardened_evidence_items": len(hardened_evidence["evidence_items"]),
            "high_confidence_evidence": hardened_evidence["confidence_counts"].get("high", 0),
            "medium_confidence_evidence": hardened_evidence["confidence_counts"].get("medium", 0),
            "low_confidence_evidence": hardened_evidence["confidence_counts"].get("low", 0),
        },
        "chart02_readiness_after_recovery": readiness,
        "main_model_status": matrix["core_model_status"]["notes"],
        "notes": "Network-dependent frequency recovery remained transparent; no absent series were invented.",
    }


def update_preview(triage: dict[str, Any], recovered_terms: dict[str, Any], hardened_evidence: dict[str, Any], matrix: dict[str, Any], summary: dict[str, Any]) -> None:
    layer = {
        "metadata": {
            "word": "hub",
            "chart_id": "chart_02",
            "pass": "data_recovery",
            "generated_at": utc_now(),
            "purpose": "recover failed Chart 02 routing queries and harden evidence",
        },
        "failed_query_triage": triage["failed_queries"],
        "recovered_terms": recovered_terms["terms"],
        "hardened_evidence": hardened_evidence["evidence_items"],
        "model_confidence": matrix,
        "recovery_summary": summary,
        "remaining_gaps": matrix["remaining_gaps"],
        "recommended_chart02_inputs_after_recovery": matrix["terms_to_use"],
    }
    for path in [PROCESSED_DIR / "hub_chart02_chart_data_preview.json", GENERATED_PREVIEW, RESEARCH_PREVIEW]:
        payload = load_json(path, {})
        if isinstance(payload, dict):
            payload["chart02_recovery_layer"] = layer
            write_json(path, payload)


def report_markdown(report: dict[str, Any], triage: dict[str, Any], matrix: dict[str, Any]) -> str:
    triage_rows = "\n".join(
        f"| {row['query']} | {row['routing_layer']} | {row['previous_failure_reason']} | {row['triage_category']} | {row['recommended_action']} | {row.get('recovery_result', row['recovery_priority'])} |"
        for row in triage["failed_queries"]
    )
    layer_rows = "\n".join(
        f"| {row['routing_layer']} | {row['frequency_support']} | {row['evidence_support']} | {row['recommended_role']} | {row['confidence']} | {row['notes']} |"
        for row in matrix["routing_layers"]
    )
    gaps = "\n".join(f"- {gap['gap']} ({gap['severity']}): {gap['notes']}" for gap in matrix["remaining_gaps"]) or "- No high-severity remaining gaps."
    s = report["summary"]
    return f"""# Hub Chart 02 Data Recovery Report

## Purpose

This is a recovery and evidence-hardening pass only. It does not implement UI, React, Three.js, visualisation, layout, or final chart copy.

## Starting Point

The previous Chart 02 pass attempted {s['previous_summary']['queries_attempted']} queries: {s['previous_summary']['successful']} succeeded and {s['previous_summary']['failed']} failed because network/DNS access was unavailable for uncached Ngram gap requests. It produced {s['previous_summary']['evidence_items']} evidence items and already found hub-and-spoke strong enough for the main model.

## Failed Query Triage

| Query | Layer | Previous failure | Triage | Action | Result |
|---|---|---|---|---|---|
{triage_rows}

## Frequency Recovery

- Frequency series recovered: {s['recovery_summary']['frequency_series_recovered']}
- Recovered from existing cache: {s['recovery_summary']['recovered_from_existing_cache']}
- Recovered by Ngram retry: {s['recovery_summary']['recovered_from_ngram_retry']}
- Failed again: {s['recovery_summary']['failed_again']}
- Marked evidence-only: {s['recovery_summary']['marked_evidence_only']}
- Dropped/excluded: {s['recovery_summary']['dropped_or_excluded']}

No missing frequency values were invented.

## Evidence Hardening

- Previous confidence: high={s['previous_summary']['high_confidence_evidence']}, medium={s['previous_summary']['medium_confidence_evidence']}, low={s['previous_summary']['low_confidence_evidence']}
- Hardened confidence: high={s['recovery_summary']['high_confidence_evidence']}, medium={s['recovery_summary']['medium_confidence_evidence']}, low={s['recovery_summary']['low_confidence_evidence']}
- Hardened evidence items: {s['recovery_summary']['hardened_evidence_items']}

The 1943 railway hub direct evidence was upgraded because the dated text clearly supports a route-control sense. Low-confidence Ngram-only signals were retained as visibility signals, not as attestations.

## Routing Model Confidence

| Layer | Frequency support | Evidence support | Recommended role | Confidence | Notes |
|---|---|---|---|---|---|
{layer_rows}

## Remaining Gaps

{gaps}

## Final Recommendation

Chart 02 readiness after recovery: **{s['chart02_readiness_after_recovery']}**. The core transfer model can proceed to visual planning with careful wording. Extra scraping is optional only if the chart needs primary-source quotations for expanded hub-and-spoke variants or distribution/cargo subterms.
"""


def report_json(summary: dict[str, Any], triage: dict[str, Any], recovered_terms: dict[str, Any], hardened_evidence: dict[str, Any], matrix: dict[str, Any]) -> dict[str, Any]:
    return {
        "metadata": {
            "word": "hub",
            "chart_id": "chart_02",
            "pass": "data_recovery",
            "generated_at": utc_now(),
            "generated_by_script": "scripts/process_hub_chart02_recovery.py",
        },
        "summary": summary,
        "failed_query_triage_summary": triage["triage_counts"],
        "recovered_frequency_summary": summary["recovery_summary"],
        "hardened_evidence_summary": {
            "confidence_counts": hardened_evidence["confidence_counts"],
            "status_counts": hardened_evidence["status_counts"],
        },
        "model_confidence_matrix_summary": {
            "core_model_status": matrix["core_model_status"],
            "routing_layers": matrix["routing_layers"],
        },
        "remaining_gaps": matrix["remaining_gaps"],
        "output_paths": {
            "failed_query_triage": str((PROCESSED_DIR / "hub_chart02_failed_query_triage.json").relative_to(ROOT)),
            "recovered_routing_terms": str((PROCESSED_DIR / "hub_chart02_recovered_routing_terms.json").relative_to(ROOT)),
            "recovered_frequency_series": str((PROCESSED_DIR / "hub_chart02_recovered_frequency_series.json").relative_to(ROOT)),
            "hardened_evidence": str((PROCESSED_DIR / "hub_chart02_hardened_evidence.json").relative_to(ROOT)),
            "model_confidence_matrix": str((PROCESSED_DIR / "hub_chart02_model_confidence_matrix.json").relative_to(ROOT)),
            "recovery_summary": str((PROCESSED_DIR / "hub_chart02_recovery_summary.json").relative_to(ROOT)),
            "report_md": str((REPORTS_DIR / "hub_chart02_data_recovery_report.md").relative_to(ROOT)),
            "report_json": str((REPORTS_DIR / "hub_chart02_data_recovery_report.json").relative_to(ROOT)),
        },
    }


def main() -> None:
    inventory_raw = load_json(RAW_DIR / "hub_chart02_recovery_query_inventory_raw.json")
    recovered_frequency = load_json(RAW_DIR / "hub_chart02_recovered_frequency_raw.json")
    raw_evidence = load_json(RAW_DIR / "hub_chart02_recovered_evidence_raw.json")
    previous_report = load_json(REPORTS_DIR / "hub_chart02_routing_data_report.json")
    if not inventory_raw or not recovered_frequency or not raw_evidence or not previous_report:
        raise SystemExit("Run scripts/recover_hub_chart02_routing_data.py before processing recovery.")

    triage = build_failed_triage(inventory_raw)
    hardened = harden_evidence(raw_evidence)
    recovered_terms = build_recovered_terms(recovered_frequency, hardened)
    recovery_status_by_query = {term["term"]: term["recovery_status"] for term in recovered_terms["terms"]}
    for row in triage["failed_queries"]:
        row["recovery_result"] = recovery_status_by_query.get(row["query"], "unknown")
    matrix = build_confidence_matrix(recovered_terms, hardened)
    summary = build_summary(previous_report, triage, recovered_frequency, hardened, matrix)
    report = report_json(summary, triage, recovered_terms, hardened, matrix)
    md = report_markdown(report, triage, matrix)

    write_json(PROCESSED_DIR / "hub_chart02_failed_query_triage.json", triage)
    write_json(PROCESSED_DIR / "hub_chart02_recovered_routing_terms.json", recovered_terms)
    write_json(PROCESSED_DIR / "hub_chart02_recovered_frequency_series.json", recovered_frequency)
    write_json(PROCESSED_DIR / "hub_chart02_hardened_evidence.json", hardened)
    write_json(PROCESSED_DIR / "hub_chart02_model_confidence_matrix.json", matrix)
    write_json(PROCESSED_DIR / "hub_chart02_recovery_summary.json", summary)
    write_json(REPORTS_DIR / "hub_chart02_data_recovery_report.json", report)
    (REPORTS_DIR / "hub_chart02_data_recovery_report.md").write_text(md, encoding="utf-8")
    update_preview(triage, recovered_terms, hardened, matrix, summary)

    rs = summary["recovery_summary"]
    print("hub chart02 recovery processing complete")
    print(f"previous failed queries: {summary['previous_summary']['failed']}")
    print(f"failed queries triaged: {rs['failed_queries_retriaged']}")
    print(f"frequency series recovered: {rs['frequency_series_recovered']}")
    print(f"recovered from existing cache: {rs['recovered_from_existing_cache']}")
    print(f"recovered by Ngram retry: {rs['recovered_from_ngram_retry']}")
    print(f"failed again: {rs['failed_again']}")
    print(f"marked evidence-only: {rs['marked_evidence_only']}")
    print(f"dropped/excluded: {rs['dropped_or_excluded']}")
    print(f"hardened evidence items: {rs['hardened_evidence_items']}")
    print(
        "evidence confidence high / medium / low: "
        f"{rs['high_confidence_evidence']} / {rs['medium_confidence_evidence']} / {rs['low_confidence_evidence']}"
    )
    print(f"hub-and-spoke main model status: {matrix['core_model_status']['confidence']} confidence")
    print(f"Chart 02 readiness after recovery: {summary['chart02_readiness_after_recovery']}")
    print("outputs:")
    for path in report["output_paths"].values():
        print(f"- {path}")


if __name__ == "__main__":
    main()
