#!/usr/bin/env python3
"""Process hub Chart 02 routing/transfer data."""

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

PERIODS = [
    {"period_id": "p1_pre_1850", "label": "Before 1850", "start_year": 1500, "end_year": 1849},
    {"period_id": "p2_1850_1899", "label": "1850-1899", "start_year": 1850, "end_year": 1899},
    {"period_id": "p3_1900_1945", "label": "1900-1945", "start_year": 1900, "end_year": 1945},
    {"period_id": "p4_1946_1979", "label": "1946-1979", "start_year": 1946, "end_year": 1979},
    {"period_id": "p5_1980_1999", "label": "1980-1999", "start_year": 1980, "end_year": 1999},
    {"period_id": "p6_2000_2009", "label": "2000-2009", "start_year": 2000, "end_year": 2009},
    {"period_id": "p7_2010_2019", "label": "2010-2019", "start_year": 2010, "end_year": 2019},
    {"period_id": "p8_2020_2022", "label": "2020-2022", "start_year": 2020, "end_year": 2022},
]

LAYER_ORDER = [
    "rail_transit_route",
    "air_logistics_route",
    "hub_and_spoke_model",
    "network_communication_route",
    "institutional_route_language",
]

CORE_MODEL_TERMS = {
    "hub and spoke",
    "hub-and-spoke",
    "hub-and-spoke system",
    "hub and spoke system",
    "hub-and-spoke network",
    "hub and spoke network",
    "hub-and-spoke model",
    "hub and spoke model",
}
AMBIGUOUS_TERMS = {"regional hub", "global hub", "international hub", "business hub", "digital hub", "platform hub", "data hub"}
DEVICE_ADJACENT_TERMS = {"USB hub", "Ethernet hub", "switching hub", "network switch hub"}
BOUNDARY_TERMS = {"service hub", "resource hub", "knowledge hub", "learning hub", "business hub"}
VISIBLE_PERIOD_THRESHOLD = 0.002


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def load_json(path: Path, fallback: Any | None = None) -> Any:
    if not path.exists():
        return fallback
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def round_float(value: float, digits: int = 10) -> float:
    return round(float(value), digits)


def mean(values: list[float]) -> float:
    return sum(values) / len(values) if values else 0.0


def list_from_payload(payload: Any, key: str) -> list[dict[str, Any]]:
    if isinstance(payload, list):
        return payload
    if isinstance(payload, dict) and isinstance(payload.get(key), list):
        return payload[key]
    return []


def value_by_year(record: dict[str, Any]) -> dict[int, float]:
    return {
        int(point["year"]): float(point.get("frequency_per_million", point.get("value", 0.0)))
        for point in record.get("raw_series", [])
    }


def all_years(records: list[dict[str, Any]]) -> list[int]:
    years = sorted({int(point["year"]) for record in records for point in record.get("raw_series", [])})
    return list(range(min(years), max(years) + 1)) if years else []


def period_years(period: dict[str, Any], available_years: list[int]) -> list[int]:
    return [year for year in available_years if period["start_year"] <= year <= period["end_year"]]


def period_note(period_id: str) -> str:
    if period_id == "p1_pre_1850":
        return "Available Ngram data begins at 1800, so this bucket is effectively 1800-1849."
    if period_id == "p8_2020_2022":
        return "Final bucket is limited to 2020-2022 because the current Ngram corpus ends at 2022."
    return ""


def query_stats(record: dict[str, Any]) -> dict[str, Any]:
    points = record.get("raw_series", [])
    values = [float(point.get("frequency_per_million", point.get("value", 0.0))) for point in points]
    nonzero_points = [
        point for point in points if float(point.get("frequency_per_million", point.get("value", 0.0))) > 0
    ]
    peak_point = max(points, key=lambda point: float(point.get("frequency_per_million", point.get("value", 0.0)))) if points else None
    return {
        "first_nonzero_year": int(nonzero_points[0]["year"]) if nonzero_points else None,
        "last_nonzero_year": int(nonzero_points[-1]["year"]) if nonzero_points else None,
        "peak_year": int(peak_point["year"]) if peak_point else None,
        "peak_frequency_per_million": round_float(float(peak_point.get("frequency_per_million", peak_point.get("value", 0.0))) if peak_point else 0.0, 8),
        "mean_frequency_per_million": round_float(mean(values), 8),
        "nonzero_year_count": len(nonzero_points),
    }


def period_mean_for_record(record: dict[str, Any], period: dict[str, Any], available_years: list[int]) -> float:
    values = value_by_year(record)
    years = period_years(period, available_years)
    return mean([values.get(year, 0.0) for year in years]) if years else 0.0


def peak_period_for_record(record: dict[str, Any], available_years: list[int]) -> str:
    period_means = [(period["period_id"], period_mean_for_record(record, period, available_years)) for period in PERIODS]
    peak = max(period_means, key=lambda item: item[1]) if period_means else ("", 0.0)
    return peak[0] if peak[1] > 0 else ""


def first_visible_period_for_record(record: dict[str, Any], available_years: list[int]) -> str:
    for period in PERIODS:
        if period_mean_for_record(record, period, available_years) >= VISIBLE_PERIOD_THRESHOLD:
            return period["period_id"]
    return ""


def latest_status(record: dict[str, Any], available_years: list[int]) -> str:
    p7 = period_mean_for_record(record, PERIODS[-2], available_years)
    p8 = period_mean_for_record(record, PERIODS[-1], available_years)
    if p8 == 0:
        return "absent"
    if p8 < 0.002:
        return "sparse"
    if p7 == 0:
        return "rising"
    if p8 >= p7 * 1.15:
        return "rising"
    if p8 <= p7 * 0.75:
        return "declining"
    return "stable"


def signal_strength(stats: dict[str, Any]) -> str:
    peak = stats["peak_frequency_per_million"]
    nonzero = stats["nonzero_year_count"]
    if nonzero == 0:
        return "failed"
    if peak >= 0.05 and nonzero >= 60:
        return "strong"
    if peak >= 0.01 and nonzero >= 30:
        return "usable"
    return "sparse"


def quality_flag_for(record: dict[str, Any], stats: dict[str, Any]) -> tuple[str, str, str]:
    query = record["query"]
    query_lower = query.lower()
    strength = signal_strength(stats)

    if record.get("status") in {"failed", "skipped"}:
        return "failed", "Query failed or was skipped; no trend should be inferred.", "exclude"
    if query_lower in {"hub spoke system", "network switch hub"} and strength in {"failed", "sparse"}:
        return "noisy_query", "Variant is too sparse or malformed for Chart 02 use.", "exclude"
    if query in CORE_MODEL_TERMS and stats["nonzero_year_count"] > 0:
        return "core_model", "Explicit hub-and-spoke model language; useful as Chart 02 conceptual anchor.", "main_model"
    if query in DEVICE_ADJACENT_TERMS:
        if strength in {"strong", "usable"}:
            return "usable_trend", "Technical device/network term; useful as later technical extension, not the whole routing model.", "supporting_series"
        return "sparse_presence", "Technical device term is sparse in this corpus.", "annotation_only"
    if query_lower in AMBIGUOUS_TERMS:
        return "ambiguous_sense", "Phrase can mean routing, institutional centrality, or broad importance without context.", "annotation_only"
    if query in BOUNDARY_TERMS:
        return "ambiguous_sense", "Boundary institutional-access term; useful only if the chart needs a late access bridge.", "annotation_only"
    if strength == "strong":
        return "strong_trend", "Sustained routing-frequency signal suitable for a main series.", "main_series"
    if strength == "usable":
        return "usable_trend", "Usable routing-frequency proxy with caution.", "supporting_series"
    if strength == "sparse":
        return "sparse_presence", "Sparse signal; useful only as a presence or annotation term.", "annotation_only"
    return "failed", "No usable signal.", "exclude"


def build_quality_flags(records: list[dict[str, Any]], available_years: list[int]) -> dict[str, Any]:
    flags = []
    for record in records:
        stats = query_stats(record)
        flag, reason, recommended_use = quality_flag_for(record, stats)
        flags.append(
            {
                "query_id": record["query_id"],
                "query": record["query"],
                "routing_layer": record["routing_layer"],
                "quality_flag": flag,
                "reason": reason,
                "recommended_use": recommended_use,
                "stats": {
                    **stats,
                    "first_visible_period": first_visible_period_for_record(record, available_years),
                    "peak_period": peak_period_for_record(record, available_years),
                    "latest_period_status": latest_status(record, available_years),
                },
                "notes": record.get("notes", ""),
            }
        )
    return {
        "metadata": {
            "word": "hub",
            "chart_id": "chart_02",
            "generated_at": utc_now(),
            "generated_by_script": "scripts/process_hub_chart02_routing.py",
        },
        "flag_counts": dict(Counter(item["quality_flag"] for item in flags)),
        "flags": flags,
    }


def records_by_layer(records: list[dict[str, Any]]) -> dict[str, list[dict[str, Any]]]:
    grouped: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for record in records:
        grouped[record["routing_layer"]].append(record)
    return grouped


def build_routing_terms(records: list[dict[str, Any]], flags: dict[str, Any], available_years: list[int]) -> dict[str, Any]:
    flags_by_query = {item["query"]: item for item in flags["flags"]}
    terms = []
    for record in records:
        stats = query_stats(record)
        flag = flags_by_query[record["query"]]
        strength = signal_strength(stats)
        recommended_role = {
            "main_model": "main",
            "main_series": "main",
            "supporting_series": "supporting",
            "annotation_only": "annotation",
            "exclude": "exclude",
        }[flag["recommended_use"]]
        ambiguity = "high" if record["query"].lower() in AMBIGUOUS_TERMS else "medium" if record["query"] in BOUNDARY_TERMS else "low"
        terms.append(
            {
                "term": record["query"],
                "routing_layer": record["routing_layer"],
                "semantic_function": record["semantic_function"],
                "recommended_role": recommended_role,
                "frequency_signal_strength": strength,
                "first_nonzero_year_ngram": stats["first_nonzero_year"],
                "first_visible_period": first_visible_period_for_record(record, available_years),
                "peak_period": peak_period_for_record(record, available_years),
                "latest_period_status": latest_status(record, available_years),
                "ambiguity_level": ambiguity,
                "sense_notes": flag["reason"],
                "evidence_ids": [],
                "data_quality": "high" if flag["quality_flag"] in {"core_model", "strong_trend"} else "medium" if flag["quality_flag"] in {"usable_trend", "ambiguous_sense"} else "low",
                "notes": record.get("notes", ""),
            }
        )
    return {
        "metadata": {
            "word": "hub",
            "chart_id": "chart_02",
            "generated_at": utc_now(),
            "generated_by_script": "scripts/process_hub_chart02_routing.py",
        },
        "terms": terms,
    }


def dominant_terms(records: list[dict[str, Any]], period: dict[str, Any], available_years: list[int], limit: int = 4) -> list[dict[str, Any]]:
    ranked = []
    for record in records:
        value = period_mean_for_record(record, period, available_years)
        if value > 0:
            ranked.append({"term": record["query"], "mean_frequency_per_million": round_float(value, 8)})
    return sorted(ranked, key=lambda item: item["mean_frequency_per_million"], reverse=True)[:limit]


def layer_period_rows(records: list[dict[str, Any]], raw: dict[str, Any], flags: dict[str, Any], available_years: list[int]) -> list[dict[str, Any]]:
    grouped = records_by_layer(records)
    flags_by_query = {item["query"]: item for item in flags["flags"]}
    rows = []

    for period in PERIODS:
        period_layer_rows = []
        for layer_id in LAYER_ORDER:
            layer_records = grouped.get(layer_id, [])
            query_means = [period_mean_for_record(record, period, available_years) for record in layer_records]
            active_query_count = sum(1 for value in query_means if value > 0)
            sum_value = sum(query_means)
            max_value = max(query_means) if query_means else 0.0
            layer_flags = [flags_by_query[record["query"]]["quality_flag"] for record in layer_records if record["query"] in flags_by_query]
            data_quality = "high" if any(flag in {"core_model", "strong_trend"} for flag in layer_flags) else "medium" if any(flag in {"usable_trend", "ambiguous_sense"} for flag in layer_flags) else "low"
            period_layer_rows.append(
                {
                    "period_id": period["period_id"],
                    "period_label": period["label"],
                    "routing_layer": layer_id,
                    "routing_layer_label": raw["routing_layers"][layer_id]["label"],
                    "mean_frequency_per_million": round_float(mean(query_means), 10),
                    "sum_frequency_per_million": round_float(sum_value, 10),
                    "max_query_frequency_per_million": round_float(max_value, 10),
                    "active_query_count": active_query_count,
                    "dominant_terms": dominant_terms(layer_records, period, available_years),
                    "visibility_rank_within_period": 0,
                    "routing_visibility_status": "absent",
                    "data_quality": data_quality,
                    "notes": period_note(period["period_id"]),
                }
            )

        ranked = sorted(period_layer_rows, key=lambda row: row["sum_frequency_per_million"], reverse=True)
        max_sum = ranked[0]["sum_frequency_per_million"] if ranked else 0.0
        ranks = {row["routing_layer"]: index + 1 for index, row in enumerate(ranked)}
        for row in period_layer_rows:
            row["visibility_rank_within_period"] = ranks[row["routing_layer"]]
            value = row["sum_frequency_per_million"]
            if value == 0:
                row["routing_visibility_status"] = "absent"
            elif value < VISIBLE_PERIOD_THRESHOLD:
                row["routing_visibility_status"] = "sparse"
            elif max_sum > 0 and row["visibility_rank_within_period"] == 1 and value >= 0.005:
                row["routing_visibility_status"] = "dominant"
            elif max_sum > 0 and value >= max_sum * 0.35:
                row["routing_visibility_status"] = "visible"
            elif value >= VISIBLE_PERIOD_THRESHOLD:
                row["routing_visibility_status"] = "emerging"
            else:
                row["routing_visibility_status"] = "sparse"
        rows.extend(period_layer_rows)

    return rows


def build_frequency_series(raw: dict[str, Any], records: list[dict[str, Any]], flags: dict[str, Any], period_rows: list[dict[str, Any]], available_years: list[int]) -> dict[str, Any]:
    grouped = records_by_layer(records)
    layer_period_index = defaultdict(list)
    for row in period_rows:
        layer_period_index[row["routing_layer"]].append(row)

    layers = []
    for layer_id in LAYER_ORDER:
        layer_records = grouped.get(layer_id, [])
        value_maps = {record["query"]: value_by_year(record) for record in layer_records}
        max_sum = 0.0
        yearly_rows = []
        for year in available_years:
            query_values = {query: values.get(year, 0.0) for query, values in value_maps.items()}
            active_values = [value for value in query_values.values() if value > 0]
            combined_sum = sum(query_values.values())
            max_sum = max(max_sum, combined_sum)
            yearly_rows.append(
                {
                    "year": year,
                    "combined_value_sum": round_float(combined_sum, 10),
                    "combined_value_mean": round_float(mean(list(query_values.values())), 10),
                    "max_query_value": round_float(max(query_values.values()) if query_values else 0.0, 10),
                    "active_query_count": len(active_values),
                    "normalized_layer_value": 0.0,
                    "query_values": {query: round_float(value, 10) for query, value in query_values.items()},
                    "data_quality": "medium",
                    "notes": "Values are frequency per million from Ngram or reused local cache.",
                }
            )
        for row in yearly_rows:
            row["normalized_layer_value"] = round_float(row["combined_value_sum"] / max_sum, 10) if max_sum > 0 else 0.0
        layers.append(
            {
                "routing_layer": layer_id,
                "label": raw["routing_layers"][layer_id]["label"],
                "summary": raw["routing_layers"][layer_id]["summary"],
                "queries": [record["query"] for record in layer_records],
                "yearly_series": yearly_rows,
                "period_summaries": layer_period_index[layer_id],
            }
        )

    return {
        "metadata": {
            "word": "hub",
            "chart_id": "chart_02",
            "purpose": "chart02_routing_frequency_layer",
            "generated_at": utc_now(),
            "generated_by_script": "scripts/process_hub_chart02_routing.py",
            "source_summary": raw["metadata"]["source_summary"],
            "value_unit": "frequency_per_million",
            "limitations": raw["metadata"]["limitations"]
            + [
                "Group sums are routing proxy aggregates, not exact sense counts.",
                "First nonzero Ngram year is not a historical first attestation.",
                "Regional/global/institutional terms are kept separate because routing sense can be ambiguous.",
            ],
        },
        "routing_layers": layers,
        "query_series": [
            {
                "query_id": record["query_id"],
                "query": record["query"],
                "routing_layer": record["routing_layer"],
                "semantic_function": record["semantic_function"],
                "source_type": record["source_type"],
                "status": record["status"],
                "series": record["raw_series"],
            }
            for record in records
        ],
    }


def supports_claim_from_candidate(candidate: dict[str, Any]) -> str:
    text = " ".join(
        str(candidate.get(key, ""))
        for key in ["term", "evidence_text_short", "context_summary", "semantic_category"]
    ).lower()
    term = str(candidate.get("term", "")).lower()
    if "spoke" in text:
        return "routing"
    if any(word in term for word in ["transport", "transit", "railway", "railroad", "rail hub", "airport", "airline"]):
        return "routing"
    if any(word in term for word in ["shipping", "logistics", "distribution", "cargo", "freight", "supply chain"]):
        return "distribution"
    if any(word in term for word in ["network", "communication", "ethernet", "switching", "telecom", "internet", "data", "server", "usb", "digital", "platform"]):
        return "network_node"
    if any(word in text for word in ["network", "communication", "ethernet", "internet", "signal", "connection"]):
        return "network_node"
    if any(word in text for word in ["route", "traffic", "transit", "railway", "railroad", "airport", "airline", "shipping", "logistics", "transport"]):
        return "routing"
    if any(word in text for word in ["distribution", "distributed", "redistribution", "cargo", "freight"]):
        return "distribution"
    if candidate.get("semantic_category") == "central_place":
        return "central_place_only"
    return "ambiguous"


def layer_for_term(term: str, records: list[dict[str, Any]]) -> str:
    lower = term.lower()
    for record in records:
        if record["query"].lower() == lower:
            return record["routing_layer"]
    if "spoke" in lower:
        return "hub_and_spoke_model"
    if any(word in lower for word in ["rail", "transit", "transport", "bus", "metro"]):
        return "rail_transit_route"
    if any(word in lower for word in ["airport", "airline", "shipping", "logistics", "distribution", "cargo", "freight"]):
        return "air_logistics_route"
    if any(word in lower for word in ["network", "communication", "ethernet", "data", "digital", "usb", "server"]):
        return "network_communication_route"
    return "institutional_route_language"


def build_evidence_items(raw_evidence: dict[str, Any], records: list[dict[str, Any]], routing_terms: dict[str, Any]) -> dict[str, Any]:
    candidates = raw_evidence.get("candidate_evidence", [])
    final: list[dict[str, Any]] = []
    seen: set[tuple[str, str, str]] = set()

    priority_terms = [
        "hub-and-spoke",
        "hub and spoke",
        "transport hub",
        "transit hub",
        "railway hub",
        "airport hub",
        "airline hub",
        "shipping hub",
        "logistics hub",
        "network hub",
        "communication hub",
        "Ethernet hub",
        "switching hub",
        "data hub",
    ]

    def add_item(term: str, year: Any, source_title: str, source_type: str, text: str, summary: str, confidence: str, is_direct: bool, limitations: str, source_url: str = "", source_author: str = "") -> None:
        if len(final) >= 25:
            return
        key = (term.lower(), str(year), source_title)
        if key in seen:
            return
        seen.add(key)
        support = supports_claim_from_candidate(
            {
                "term": term,
                "evidence_text_short": text,
                "context_summary": summary,
                "semantic_category": layer_for_term(term, records),
            }
        )
        final.append(
            {
                "evidence_id": f"hub_chart02_evidence_{len(final) + 1:03d}",
                "term": term,
                "routing_layer": layer_for_term(term, records),
                "year": year,
                "source_title": source_title,
                "source_author": source_author,
                "source_date": str(year) if year not in {None, ""} else "",
                "source_url": source_url,
                "source_type": source_type,
                "evidence_text_short": text[:260],
                "context_summary": summary,
                "supports_claim": support,
                "is_direct_attestation": is_direct,
                "confidence": confidence,
                "limitations": limitations,
                "copyright_notes": "Short paraphrase or short snippet retained for research planning only.",
            }
        )

    for term in priority_terms:
        for candidate in candidates:
            if str(candidate.get("term", "")).lower() != term.lower():
                continue
            support = supports_claim_from_candidate(candidate)
            if support in {"routing", "distribution", "network_node", "central_place_only"}:
                add_item(
                    term=term,
                    year=candidate.get("year"),
                    source_title=candidate.get("source_title") or candidate.get("source_layer", ""),
                    source_type=candidate.get("source_type") or "other",
                    text=candidate.get("evidence_text_short", ""),
                    summary=candidate.get("context_summary", ""),
                    confidence=candidate.get("confidence", "medium"),
                    is_direct=candidate.get("source_type") not in {"reference", "dictionary", "corpus"},
                    limitations=candidate.get("limitations", ""),
                    source_url=candidate.get("source_url", ""),
                    source_author=candidate.get("source_author", "") or "",
                )

    term_records = {item["term"].lower(): item for item in routing_terms["terms"]}
    for term in priority_terms:
        record = term_records.get(term.lower())
        if not record or record["frequency_signal_strength"] == "failed":
            continue
        add_item(
            term=term,
            year=record["first_nonzero_year_ngram"],
            source_title="Google Books Ngram frequency signal",
            source_type="corpus",
            text=f"Ngram signal first appears in {record['first_visible_period'] or 'the available series'}; peak period is {record['peak_period'] or 'not established'}.",
            summary="Frequency signal only; useful for routing-term visibility but not a first-use claim.",
            confidence="medium" if record["frequency_signal_strength"] in {"strong", "usable"} else "low",
            is_direct=False,
            limitations="Ngram signal is not a direct attestation and does not prove sense without context.",
        )

    confidence_counts = Counter(item["confidence"] for item in final)
    return {
        "metadata": {
            "word": "hub",
            "chart_id": "chart_02",
            "generated_at": utc_now(),
            "generated_by_script": "scripts/process_hub_chart02_routing.py",
            "selection_note": "Evidence is filtered toward transfer, routing, distribution, and network-node contexts.",
        },
        "confidence_counts": dict(confidence_counts),
        "evidence_items": final,
    }


def build_timeline(evidence: dict[str, Any], routing_terms: dict[str, Any]) -> dict[str, Any]:
    terms = {item["term"].lower(): item for item in routing_terms["terms"]}
    events: list[dict[str, Any]] = []
    period_start = {
        period["period_id"]: max(1800, period["start_year"])
        for period in PERIODS
    }

    def add_event(year: Any, year_type: str, label: str, layer: str, term: str, description: str, evidence_ids: list[str], confidence: str, notes: str) -> None:
        events.append(
            {
                "event_id": f"hub_chart02_event_{len(events) + 1:03d}",
                "year": year,
                "year_type": year_type,
                "label": label,
                "routing_layer": layer,
                "term": term,
                "description": description,
                "evidence_ids": evidence_ids,
                "confidence": confidence,
                "notes": notes,
            }
        )

    evidence_by_term = defaultdict(list)
    direct_year_by_term: dict[str, Any] = {}
    for item in evidence["evidence_items"]:
        evidence_by_term[item["term"].lower()].append(item["evidence_id"])
        if item["is_direct_attestation"] and item.get("year") not in {None, ""}:
            direct_year_by_term.setdefault(item["term"].lower(), item["year"])

    for term, label, layer in [
        ("transit hub", "Transit hub direct evidence", "rail_transit_route"),
        ("railway hub", "Railway hub route evidence", "rail_transit_route"),
        ("airport hub", "Airport hub visibility", "air_logistics_route"),
        ("airline hub", "Airline hub route definition", "air_logistics_route"),
        ("logistics hub", "Logistics hub visibility", "air_logistics_route"),
        ("hub-and-spoke", "Hub-and-spoke model visibility", "hub_and_spoke_model"),
        ("network hub", "Network hub technical extension", "network_communication_route"),
        ("communication hub", "Communication hub visibility", "network_communication_route"),
        ("data hub", "Data hub late access/routing extension", "network_communication_route"),
    ]:
        record = terms.get(term)
        if not record:
            continue
        visible_period = record["first_visible_period"]
        year = period_start.get(visible_period, record["first_nonzero_year_ngram"])
        confidence = "medium" if record["frequency_signal_strength"] in {"strong", "usable"} else "low"
        year_type = "first_visible_period" if visible_period else "ngram_signal"
        if term in direct_year_by_term:
            year = direct_year_by_term[term]
            year_type = "direct_evidence"
        add_event(
            year=year,
            year_type=year_type,
            label=label,
            layer=layer,
            term=term,
            description=f"{term} is tracked as a {record['semantic_function']} term for Chart 02.",
            evidence_ids=evidence_by_term[term],
            confidence=confidence,
            notes="Ngram timing is a visibility signal, not a first attestation.",
        )

    return {
        "metadata": {
            "word": "hub",
            "chart_id": "chart_02",
            "generated_at": utc_now(),
            "generated_by_script": "scripts/process_hub_chart02_routing.py",
        },
        "events": events,
    }


def recommended_inputs(flags: dict[str, Any]) -> dict[str, list[str]]:
    buckets = {
        "main_model_terms": [],
        "main_series_terms": [],
        "supporting_terms": [],
        "annotation_terms": [],
        "exclude_terms": [],
    }
    for item in flags["flags"]:
        target = {
            "main_model": "main_model_terms",
            "main_series": "main_series_terms",
            "supporting_series": "supporting_terms",
            "annotation_only": "annotation_terms",
            "exclude": "exclude_terms",
        }[item["recommended_use"]]
        buckets[target].append(item["query"])
    return buckets


def strongest_layer(period_rows: list[dict[str, Any]], period_id: str) -> str:
    rows = [row for row in period_rows if row["period_id"] == period_id]
    if not rows:
        return ""
    top = max(rows, key=lambda row: row["sum_frequency_per_million"])
    if top["sum_frequency_per_million"] < VISIBLE_PERIOD_THRESHOLD:
        return f"{top['routing_layer']} (sparse signal only)"
    return top["routing_layer"]


def build_chart_preview(raw: dict[str, Any], terms: dict[str, Any], frequency: dict[str, Any], period_rows: list[dict[str, Any]], timeline: dict[str, Any], evidence: dict[str, Any], flags: dict[str, Any]) -> dict[str, Any]:
    evidence_ids_by_layer = defaultdict(list)
    for item in evidence["evidence_items"]:
        evidence_ids_by_layer[item["routing_layer"]].append(item["evidence_id"])

    terms_by_layer = defaultdict(list)
    for term in terms["terms"]:
        if term["recommended_role"] != "exclude":
            terms_by_layer[term["routing_layer"]].append(term)

    return {
        "metadata": {
            "word": "hub",
            "chart_id": "chart_02",
            "working_title": "The Transfer Model",
            "generated_at": utc_now(),
            "generated_by_script": "scripts/process_hub_chart02_routing.py",
            "source_summary": raw["metadata"]["source_summary"],
            "limitations": frequency["metadata"]["limitations"],
        },
        "routing_layers": [
            {
                "layer_id": layer_id,
                "label": raw["routing_layers"][layer_id]["label"],
                "summary": raw["routing_layers"][layer_id]["summary"],
                "main_terms": [term["term"] for term in terms_by_layer[layer_id] if term["recommended_role"] in {"main", "supporting"}][:6],
                "period_visibility": [row for row in period_rows if row["routing_layer"] == layer_id],
                "evidence_ids": evidence_ids_by_layer[layer_id],
                "data_quality": "high" if any(term["data_quality"] == "high" for term in terms_by_layer[layer_id]) else "medium" if terms_by_layer[layer_id] else "low",
            }
            for layer_id in LAYER_ORDER
        ],
        "core_model_terms": [term for term in terms["terms"] if term["routing_layer"] == "hub_and_spoke_model" and term["recommended_role"] != "exclude"],
        "routing_terms": terms["terms"],
        "transfer_model_timeline": timeline["events"],
        "evidence_items": evidence["evidence_items"],
        "quality_flags": flags["flags"],
        "data_cautions": [
            "Ngram is printed-book frequency, not semantic proof.",
            "Group sums are routing proxy aggregates, not exact sense counts.",
            "Regional, global, international, business, digital, and platform hub terms can be ambiguous without context.",
            "The latest Ngram bucket ends at 2022.",
            "First Ngram appearance is not first historical attestation.",
        ],
        "recommended_chart_inputs": recommended_inputs(flags),
    }


def update_combined_preview(chart_preview: dict[str, Any]) -> None:
    layer = {
        "metadata": chart_preview["metadata"],
        "routing_layers": chart_preview["routing_layers"],
        "core_model_terms": chart_preview["core_model_terms"],
        "transfer_model_timeline": chart_preview["transfer_model_timeline"],
        "evidence_items": chart_preview["evidence_items"],
        "quality_flags": chart_preview["quality_flags"],
        "data_cautions": chart_preview["data_cautions"],
        "recommended_chart_inputs": chart_preview["recommended_chart_inputs"],
    }
    for path in [GENERATED_PREVIEW, RESEARCH_PREVIEW]:
        payload = load_json(path, {})
        if not isinstance(payload, dict):
            continue
        payload["chart02_routing_layer"] = layer
        write_json(path, payload)


def build_report_md(report: dict[str, Any], preview: dict[str, Any]) -> str:
    recommended = preview["recommended_chart_inputs"]
    layer_counts = report["routing_layer_counts"]
    flag_counts = report["quality_flag_counts"]
    evidence_counts = report["evidence_confidence_counts"]
    return f"""# Hub Chart 02 Routing Data Report

## Purpose

This pass supports Chart 02 data planning only. It consolidates routing, transfer, hub-and-spoke, transport, logistics, communication, and network terms for the working direction "The Transfer Model." It does not implement visualisation or final chart copy.

## Chart 02 Context

Chart 01 already handled semantic survival and backgrounding. Chart 02 instead asks how "hub" becomes a structure for collecting, redirecting, and redistributing flows. The data distinguishes simple central-place language from routing, transfer, distribution, and network-node language.

## Sources Used

- `docs/research/hub/processed/hub_frequency_series.json`
- `docs/research/hub/raw/hub_chart01_frequency_raw.json`
- `docs/research/hub/processed/hub_snippet_samples.json`
- `docs/research/hub/processed/hub_earliest_attestations.json`
- `docs/research/hub/processed/hub_timeline_events.json`
- Targeted Google Books Ngram gap requests where local cache did not already contain a routing query.

## Routing Layers

| Layer | Query count |
|---|---:|
{chr(10).join(f"| {layer} | {count} |" for layer, count in layer_counts.items())}

## Frequency Preprocessing

Query-level yearly series are preserved. Routing-layer summaries aggregate query means, sums, max query values, active query counts, period ranks, and quality flags. Period buckets match Chart 01, with the first bucket effectively 1800-1849 and the final bucket 2020-2022.

Query status counts: {report['query_status_counts']}. Missing gap requests are kept as failed rows; no replacement data was fabricated.

## Evidence Collection

Evidence items collected: {report['evidence_items_collected']}.

Confidence counts: {evidence_counts}.

Evidence was filtered toward routing, transfer, distribution, and network-node contexts. Ngram-only evidence is labelled as a frequency signal, not a first attestation.

## Preliminary Findings

- Hub-and-spoke status: {report['hub_and_spoke_status']}.
- Strongest early routing layer: `{report['strongest_early_routing_layer']}`.
- Strongest modern routing layer: `{report['strongest_modern_routing_layer']}`.
- Transport/logistics terms provide usable trend signals, but some older rail terms remain sparse or OCR-dependent.
- Network/communication terms appear as later technical extensions and should be separated from general institutional centrality.
- Regional/global/international hub remain ambiguous without context.

## Quality Flags

{flag_counts}

## Recommended Use For Chart 02

- Main model terms: {', '.join(recommended['main_model_terms']) or 'none'}
- Main series terms: {', '.join(recommended['main_series_terms']) or 'none'}
- Supporting terms: {', '.join(recommended['supporting_terms']) or 'none'}
- Annotation terms: {', '.join(recommended['annotation_terms']) or 'none'}
- Exclude terms: {', '.join(recommended['exclude_terms']) or 'none'}

## Data Cautions

- Ngram is printed-book frequency, not semantic proof.
- Group sums are proxies, not exact sense counts.
- Search visibility is not treated as exact frequency.
- Ambiguous terms need context before supporting a routing claim.
- The final Ngram bucket ends at 2022.
- First Ngram appearance is not first historical attestation.

## Next Step

Chart 02 is ready for visual planning with careful wording. The strongest anchor is hub-and-spoke as explicit model language, supported by transport/logistics and network/communication frequency proxies. Further scraping is optional, not required, unless the chart needs earlier direct textual quotations for specific routing terms.
"""


def build_report_json(raw: dict[str, Any], records: list[dict[str, Any]], flags: dict[str, Any], period_rows: list[dict[str, Any]], evidence: dict[str, Any], preview: dict[str, Any]) -> dict[str, Any]:
    layer_counts = Counter(record["routing_layer"] for record in records)
    status_counts = Counter(record["status"] for record in records)
    recommended = preview["recommended_chart_inputs"]
    hub_spoke_flags = [
        item for item in flags["flags"] if item["query"] in {"hub and spoke", "hub-and-spoke"}
    ]
    hub_spoke_status = "strong enough for main model" if any(item["recommended_use"] == "main_model" for item in hub_spoke_flags) else "not strong enough for main model"
    return {
        "metadata": {
            "word": "hub",
            "chart_id": "chart_02",
            "generated_at": utc_now(),
            "generated_by_script": "scripts/process_hub_chart02_routing.py",
        },
        "summary_counts": {
            "routing_layers": len(layer_counts),
            "queries_attempted": len(records),
            "successful_queries": status_counts.get("success", 0),
            "partial_queries": status_counts.get("partial", 0),
            "failed_queries": status_counts.get("failed", 0),
            "evidence_items": len(evidence["evidence_items"]),
        },
        "routing_layer_counts": dict(layer_counts),
        "query_status_counts": dict(status_counts),
        "quality_flag_counts": flags["flag_counts"],
        "evidence_confidence_counts": evidence["confidence_counts"],
        "evidence_items_collected": len(evidence["evidence_items"]),
        "strongest_early_routing_layer": strongest_layer(period_rows, "p1_pre_1850"),
        "strongest_modern_routing_layer": strongest_layer(period_rows, "p8_2020_2022"),
        "hub_and_spoke_status": hub_spoke_status,
        "recommended_main_terms": {
            "main_model_terms": recommended["main_model_terms"],
            "main_series_terms": recommended["main_series_terms"],
        },
        "recommended_inputs": recommended,
        "cautions": preview["data_cautions"],
        "output_paths": {
            "routing_terms": str((PROCESSED_DIR / "hub_chart02_routing_terms.json").relative_to(ROOT)),
            "routing_frequency_series": str((PROCESSED_DIR / "hub_chart02_routing_frequency_series.json").relative_to(ROOT)),
            "routing_by_period": str((PROCESSED_DIR / "hub_chart02_routing_by_period.json").relative_to(ROOT)),
            "transfer_model_timeline": str((PROCESSED_DIR / "hub_chart02_transfer_model_timeline.json").relative_to(ROOT)),
            "transfer_model_evidence": str((PROCESSED_DIR / "hub_chart02_transfer_model_evidence.json").relative_to(ROOT)),
            "routing_quality_flags": str((PROCESSED_DIR / "hub_chart02_routing_quality_flags.json").relative_to(ROOT)),
            "chart_data_preview": str((PROCESSED_DIR / "hub_chart02_chart_data_preview.json").relative_to(ROOT)),
            "report_md": str((REPORTS_DIR / "hub_chart02_routing_data_report.md").relative_to(ROOT)),
            "report_json": str((REPORTS_DIR / "hub_chart02_routing_data_report.json").relative_to(ROOT)),
        },
    }


def main() -> None:
    raw = load_json(RAW_DIR / "hub_chart02_routing_frequency_raw.json")
    raw_evidence = load_json(RAW_DIR / "hub_chart02_routing_evidence_raw.json")
    if not raw or not raw_evidence:
        raise SystemExit("Run scripts/scrape_hub_chart02_routing.py before processing.")

    records = raw["query_results"]
    available_years = all_years(records)
    flags = build_quality_flags(records, available_years)
    period_rows = layer_period_rows(records, raw, flags, available_years)
    terms = build_routing_terms(records, flags, available_years)
    evidence = build_evidence_items(raw_evidence, records, terms)
    timeline = build_timeline(evidence, terms)
    frequency = build_frequency_series(raw, records, flags, period_rows, available_years)
    preview = build_chart_preview(raw, terms, frequency, period_rows, timeline, evidence, flags)
    report_json = build_report_json(raw, records, flags, period_rows, evidence, preview)
    report_md = build_report_md(report_json, preview)

    # Attach evidence ids back onto term rows after evidence selection.
    evidence_ids_by_term = defaultdict(list)
    for item in evidence["evidence_items"]:
        evidence_ids_by_term[item["term"].lower()].append(item["evidence_id"])
    for term in terms["terms"]:
        term["evidence_ids"] = evidence_ids_by_term[term["term"].lower()]
    preview = build_chart_preview(raw, terms, frequency, period_rows, timeline, evidence, flags)
    report_json = build_report_json(raw, records, flags, period_rows, evidence, preview)
    report_md = build_report_md(report_json, preview)

    write_json(PROCESSED_DIR / "hub_chart02_routing_terms.json", terms)
    write_json(PROCESSED_DIR / "hub_chart02_routing_frequency_series.json", frequency)
    write_json(PROCESSED_DIR / "hub_chart02_routing_by_period.json", {"metadata": frequency["metadata"], "periods": PERIODS, "rows": period_rows})
    write_json(PROCESSED_DIR / "hub_chart02_transfer_model_timeline.json", timeline)
    write_json(PROCESSED_DIR / "hub_chart02_transfer_model_evidence.json", evidence)
    write_json(PROCESSED_DIR / "hub_chart02_routing_quality_flags.json", flags)
    write_json(PROCESSED_DIR / "hub_chart02_chart_data_preview.json", preview)
    write_json(REPORTS_DIR / "hub_chart02_routing_data_report.json", report_json)
    (REPORTS_DIR / "hub_chart02_routing_data_report.md").write_text(report_md, encoding="utf-8")
    update_combined_preview(preview)

    recommended = preview["recommended_chart_inputs"]
    print("hub chart02 routing processing complete")
    print(f"routing layers: {len(report_json['routing_layer_counts'])}")
    print(f"queries attempted: {len(records)}")
    print(
        "successful / partial / failed queries: "
        f"{report_json['summary_counts']['successful_queries']} / "
        f"{report_json['summary_counts']['partial_queries']} / "
        f"{report_json['summary_counts']['failed_queries']}"
    )
    print(f"evidence items collected: {len(evidence['evidence_items'])}")
    print(f"evidence confidence counts: {evidence['confidence_counts']}")
    print(f"strongest early routing layer: {report_json['strongest_early_routing_layer']}")
    print(f"strongest modern routing layer: {report_json['strongest_modern_routing_layer']}")
    print(f"hub-and-spoke status: {report_json['hub_and_spoke_status']}")
    print(
        "recommended terms main_model / main_series / supporting / annotation / exclude: "
        f"{len(recommended['main_model_terms'])} / {len(recommended['main_series_terms'])} / "
        f"{len(recommended['supporting_terms'])} / {len(recommended['annotation_terms'])} / "
        f"{len(recommended['exclude_terms'])}"
    )
    print("outputs:")
    for path in report_json["output_paths"].values():
        print(f"- {path}")


if __name__ == "__main__":
    main()
