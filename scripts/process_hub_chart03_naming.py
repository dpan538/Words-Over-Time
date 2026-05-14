#!/usr/bin/env python3
"""Process hub Chart 03 naming-pattern data.

This pass prepares a chart-facing naming layer only. It keeps Ngram-style
frequency separate from web/search/brand evidence so brand recognition is not
mistaken for corpus frequency.
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

PATTERN_LABELS = {
    "suffix_phrase": "X + hub",
    "prefix_phrase": "hub + X",
    "closed_compound_or_brand": "XHub / X-hub / HubX",
    "institutional_access_point": "Institutional Access Point",
    "platform_content_access": "Platform / Content Access",
    "technical_system": "Technical System",
}

PATTERN_DESCRIPTIONS = {
    "suffix_phrase": "A domain, audience, resource, service, or institution is named as a centralized access point.",
    "prefix_phrase": "Hub acts as a modifier meaning hub-like, central, systemic, or node-based.",
    "closed_compound_or_brand": "Hub is incorporated into a brand, platform, website, product, or service name.",
    "institutional_access_point": "Hub names a campus, service, office, room, portal, or resource access point.",
    "platform_content_access": "Hub names a digital, informational, content, data, documentation, or community access point.",
    "technical_system": "Hub names a node, connector, integration point, or technical routing object.",
}

PATTERN_FUNCTIONS = {
    "suffix_phrase": [
        "access point",
        "resource aggregation",
        "service portal",
        "community gathering point",
        "knowledge organization",
        "institutional branding",
    ],
    "prefix_phrase": ["technical connection", "system model", "node classification"],
    "closed_compound_or_brand": [
        "platform access",
        "content aggregation",
        "repository/distribution point",
        "service portal",
    ],
    "institutional_access_point": ["access point", "resource aggregation", "service portal", "institutional branding"],
    "platform_content_access": ["content platform", "data access", "repository/distribution point", "knowledge organization"],
    "technical_system": ["technical connection", "integration point", "repository/distribution point"],
}

BRAND_NAMES = {"github", "pornhub", "sci-hub", "hubspot", "hubpages", "docker hub", "hugging face hub", "hubstaff"}
AMBIGUOUS_TERMS = {"community hub", "service hub", "business hub", "financial hub", "hub city", "hub location"}


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def load_json(path: Path, fallback: Any | None = None) -> Any:
    if not path.exists():
        return fallback
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def frequency_value(point: dict[str, Any]) -> float:
    return float(point.get("frequency_per_million", point.get("value", 0.0)) or 0.0)


def normalize_series(points: list[dict[str, Any]]) -> list[dict[str, Any]]:
    normalized = []
    for point in points:
        year = int(point["year"])
        value = frequency_value(point)
        normalized.append({"year": year, "value": round(value, 8), "frequency_per_million": round(value, 8)})
    return normalized


def stats_for_points(points: list[dict[str, Any]]) -> dict[str, Any]:
    series = normalize_series(points)
    nonzero = [point for point in series if point["frequency_per_million"] > 0]
    peak = max(series, key=lambda point: point["frequency_per_million"], default={"year": None, "frequency_per_million": 0.0})
    recent = [point for point in series if 2020 <= point["year"] <= 2022]
    return {
        "first_nonzero_year": nonzero[0]["year"] if nonzero else None,
        "last_nonzero_year": nonzero[-1]["year"] if nonzero else None,
        "peak_year": peak["year"],
        "peak_frequency_per_million": round(peak["frequency_per_million"], 8),
        "nonzero_year_count": len(nonzero),
        "recent_mean_frequency_per_million": round(mean([point["frequency_per_million"] for point in recent]), 8),
    }


def mean(values: list[float]) -> float:
    return sum(values) / len(values) if values else 0.0


def period_points(points: list[dict[str, Any]], period: dict[str, Any]) -> list[dict[str, Any]]:
    start = max(int(period["start_year"]), 1800)
    end = int(period["end_year"])
    return [point for point in normalize_series(points) if start <= int(point["year"]) <= end]


def first_visible_period(points: list[dict[str, Any]]) -> str:
    first = stats_for_points(points)["first_nonzero_year"]
    if first is None:
        return ""
    for period in PERIODS:
        if int(period["start_year"]) <= first <= int(period["end_year"]):
            return period["period_id"]
    return ""


def peak_period(points: list[dict[str, Any]]) -> str:
    peak = stats_for_points(points)["peak_year"]
    if peak is None:
        return ""
    for period in PERIODS:
        if int(period["start_year"]) <= peak <= int(period["end_year"]):
            return period["period_id"]
    return ""


def series_status(row: dict[str, Any]) -> str:
    return str(row.get("status", "failed"))


def frequency_support(points: list[dict[str, Any]], status: str) -> str:
    if status in {"failed", "skipped"}:
        return "unavailable"
    stats = stats_for_points(points)
    if stats["nonzero_year_count"] == 0:
        return "sparse"
    if stats["peak_frequency_per_million"] >= 0.04 and stats["nonzero_year_count"] >= 35:
        return "strong"
    if stats["peak_frequency_per_million"] >= 0.006 and stats["nonzero_year_count"] >= 10:
        return "usable"
    return "sparse"


def data_quality_from_support(support: str, status: str) -> str:
    if support == "strong" and status in {"success", "reused_existing"}:
        return "high"
    if support in {"usable", "sparse"} and status in {"success", "reused_existing"}:
        return "medium"
    return "low"


def pattern_membership(row: dict[str, Any]) -> set[str]:
    memberships = {row.get("naming_pattern", "")}
    object_type = row.get("object_type", "")
    if object_type in PATTERN_LABELS:
        memberships.add(object_type)
    if row.get("naming_pattern") == "closed_compound_or_brand":
        memberships.add("closed_compound_or_brand")
    return {item for item in memberships if item}


def source_summary(query_log: dict[str, Any]) -> list[str]:
    counts = query_log.get("frequency_status_counts", {})
    search_counts = query_log.get("search_visibility_status_counts", {})
    return [
        "Existing Chart 01 / first-pass / Chart 02 caches were reused before new Ngram requests.",
        f"Frequency statuses: {counts}.",
        f"Search visibility statuses: {search_counts}.",
        "Curated public brand and institutional URLs were checked where network access allowed.",
    ]


def build_frequency_series(frequency_raw: dict[str, Any]) -> dict[str, Any]:
    query_rows = []
    by_pattern: dict[str, list[dict[str, Any]]] = defaultdict(list)
    all_years = sorted(
        {
            int(point["year"])
            for row in frequency_raw.get("query_results", [])
            for point in row.get("raw_series", [])
        }
    )
    if not all_years:
        all_years = list(range(1800, 2023))

    for row in frequency_raw.get("query_results", []):
        points = normalize_series(row.get("raw_series", []))
        support = frequency_support(points, series_status(row))
        stats = stats_for_points(points)
        item = {
            "query_id": row.get("query_id", ""),
            "query": row.get("query", ""),
            "naming_pattern": row.get("naming_pattern", ""),
            "object_type": row.get("object_type", ""),
            "semantic_function": row.get("semantic_function", ""),
            "source": row.get("source", ""),
            "source_type": row.get("source_type", ""),
            "status": series_status(row),
            "start_year": row.get("start_year", 1800),
            "end_year": row.get("end_year", 2022),
            "yearly_series": points,
            "stats": stats,
            "frequency_signal_strength": support,
            "first_visible_period": first_visible_period(points),
            "peak_period": peak_period(points),
            "data_quality": data_quality_from_support(support, series_status(row)),
            "notes": row.get("notes", ""),
        }
        query_rows.append(item)
        for pattern_id in pattern_membership(row):
            by_pattern[pattern_id].append(item)

    pattern_groups = []
    for pattern_id in PATTERN_LABELS:
        rows = by_pattern.get(pattern_id, [])
        yearly = []
        max_sum = 0.0
        for year in all_years:
            query_values = {
                row["query"]: next(
                    (point["frequency_per_million"] for point in row["yearly_series"] if point["year"] == year),
                    0.0,
                )
                for row in rows
            }
            active_values = [value for value in query_values.values() if value > 0]
            combined_sum = sum(query_values.values())
            max_sum = max(max_sum, combined_sum)
            yearly.append(
                {
                    "year": year,
                    "combined_value_sum": round(combined_sum, 8),
                    "combined_value_mean": round(mean(list(query_values.values())), 8),
                    "max_query_value": round(max(query_values.values(), default=0.0), 8),
                    "active_query_count": len(active_values),
                    "query_values": query_values,
                    "data_quality": "medium" if rows else "low",
                    "notes": "Pattern aggregate is a proxy sum/mean, not an exact naming-count measure.",
                }
            )
        for point in yearly:
            point["normalized_pattern_value"] = round(point["combined_value_sum"] / max_sum, 8) if max_sum else 0.0
        pattern_groups.append(
            {
                "pattern_id": pattern_id,
                "label": PATTERN_LABELS[pattern_id],
                "queries": [row["query"] for row in rows],
                "yearly_series": yearly,
            }
        )

    return {
        "metadata": {
            "word": "hub",
            "chart_id": "chart_03",
            "purpose": "naming-pattern frequency layer",
            "generated_at": utc_now(),
            "generated_by_script": "scripts/process_hub_chart03_naming.py",
            "value_unit": "frequency_per_million",
            "limitations": [
                "Ngram values are printed-book frequency signals, not proof that a phrase functions as a naming format.",
                "Pattern sums are proxy aggregates and may double-count terms that belong to both phrase pattern and object-type groups.",
                "Brand/platform names are kept outside ordinary phrase-frequency interpretation.",
                "The corpus starts at 1800 and ends at 2022.",
            ],
        },
        "terms": query_rows,
        "pattern_groups": pattern_groups,
    }


def build_search_visibility_index(search_raw: dict[str, Any], institutional_raw: dict[str, Any], brand_raw: dict[str, Any]) -> dict[str, Any]:
    records = []
    for row in search_raw.get("records", []):
        records.append(
            {
                "query": row.get("query", ""),
                "naming_pattern": row.get("naming_pattern", ""),
                "object_type": row.get("object_type", ""),
                "source": row.get("source", ""),
                "search_query": row.get("search_query", ""),
                "approx_result_count": row.get("approx_result_count"),
                "top_result_domains": row.get("top_result_domains", []),
                "example_urls": row.get("example_urls", []),
                "example_titles": row.get("example_titles", []),
                "visibility_status": row.get("visibility_status", "failed"),
                "evidence_quality": row.get("evidence_quality", "low"),
                "notes": row.get("notes", ""),
            }
        )

    pattern_counts: dict[str, Counter[str]] = defaultdict(Counter)
    for row in records:
        pattern_counts[row["naming_pattern"]][row["visibility_status"]] += 1
        object_type = row.get("object_type")
        if object_type in PATTERN_LABELS:
            pattern_counts[object_type][row["visibility_status"]] += 1

    for item in brand_raw.get("brands", []):
        status = "visible" if item.get("source_status") == "success" else "ambiguous"
        pattern_counts["closed_compound_or_brand"][status] += 1
        if item.get("naming_function") in {"content_aggregation", "repository_center", "technical_distribution", "platform_access"}:
            pattern_counts["platform_content_access"][status] += 1

    for item in institutional_raw.get("examples", []):
        status = "visible" if item.get("source_status") == "success" else "ambiguous"
        pattern_counts["institutional_access_point"][status] += 1

    pattern_summary = []
    for pattern_id in PATTERN_LABELS:
        counts = dict(pattern_counts[pattern_id])
        strongish = counts.get("strong_presence", 0) + counts.get("visible", 0)
        if counts.get("strong_presence", 0) >= 3 or strongish >= 8:
            support = "strong"
        elif strongish >= 2:
            support = "visible"
        elif counts:
            support = "ambiguous"
        else:
            support = "unavailable"
        pattern_summary.append(
            {
                "pattern_id": pattern_id,
                "label": PATTERN_LABELS[pattern_id],
                "visibility_support": support,
                "status_counts": counts,
                "notes": "Visibility is presence evidence only; result counts are not used as exact frequency.",
            }
        )

    return {
        "metadata": {
            "word": "hub",
            "chart_id": "chart_03",
            "generated_at": utc_now(),
            "generated_by_script": "scripts/process_hub_chart03_naming.py",
            "limitations": [
                "Search visibility is approximate presence evidence.",
                "Source verification may be incomplete under restricted network access.",
                "Search examples are not a complete census of institutional or platform naming.",
            ],
        },
        "records": records,
        "pattern_summary": pattern_summary,
    }


def build_brand_platform_inventory(brand_raw: dict[str, Any]) -> dict[str, Any]:
    items = []
    for item in brand_raw.get("brands", []):
        status = item.get("source_status", "failed")
        caution = item.get("sensitivity_or_caution", "")
        include = bool(item.get("include_in_chart")) and status in {"success", "failed", "skipped"}
        if status != "success" and not caution:
            caution = "Source URL was not verified in this run; keep as lower-confidence naming inventory item."
        items.append(
            {
                "name": item.get("name", ""),
                "normalized_form": item.get("normalized_form", ""),
                "hub_position": item.get("hub_position", ""),
                "object_type": item.get("object_type", ""),
                "domain_or_category": item.get("domain_or_category", ""),
                "first_known_or_launch_year": item.get("first_known_or_launch_year", ""),
                "year_source": item.get("year_source", ""),
                "official_or_reference_url": item.get("official_or_reference_url", ""),
                "naming_function": item.get("naming_function", ""),
                "include_in_chart": include,
                "sensitivity_or_caution": caution,
                "source_status": status,
                "page_title_observed": item.get("page_title_observed", ""),
                "notes": item.get("notes", ""),
            }
        )
    return {
        "metadata": {
            "word": "hub",
            "chart_id": "chart_03",
            "generated_at": utc_now(),
            "generated_by_script": "scripts/process_hub_chart03_naming.py",
            "note": "Brand/platform forms are naming-pattern evidence, not ordinary lexical frequency.",
        },
        "brand_platform_inventory": items,
    }


def build_institutional_access_examples(institutional_raw: dict[str, Any]) -> dict[str, Any]:
    examples = []
    for item in institutional_raw.get("examples", []):
        confidence = item.get("confidence", "medium")
        if item.get("source_status") != "success" and confidence == "high":
            confidence = "medium"
        examples.append(
            {
                "term": item.get("term", ""),
                "institution_or_source": item.get("institution_or_source", ""),
                "source_url": item.get("source_url", ""),
                "source_title": item.get("source_title", ""),
                "country_or_region": item.get("country_or_region", ""),
                "object_type": item.get("object_type", ""),
                "context_summary": item.get("context_summary", ""),
                "supports_naming_claim": bool(item.get("supports_naming_claim")),
                "confidence": confidence,
                "source_status": item.get("source_status", "failed"),
                "page_title_observed": item.get("page_title_observed", ""),
                "notes": item.get("source_failure_reason", "") or item.get("notes", ""),
            }
        )
    return {
        "metadata": {
            "word": "hub",
            "chart_id": "chart_03",
            "generated_at": utc_now(),
            "generated_by_script": "scripts/process_hub_chart03_naming.py",
            "note": "The user's personal school example is design context only and is not stored as public evidence.",
        },
        "institutional_access_examples": examples,
    }


def search_support_for_pattern(search_index: dict[str, Any], pattern_id: str) -> str:
    lookup = {row["pattern_id"]: row for row in search_index.get("pattern_summary", [])}
    return lookup.get(pattern_id, {}).get("visibility_support", "unavailable")


def build_naming_patterns(
    frequency_series: dict[str, Any],
    search_index: dict[str, Any],
    brand_inventory: dict[str, Any],
    institutional_examples: dict[str, Any],
) -> dict[str, Any]:
    terms = frequency_series["terms"]
    pattern_items = []
    brand_examples = [item for item in brand_inventory["brand_platform_inventory"] if item.get("include_in_chart")]
    institutional_terms = Counter(item["term"] for item in institutional_examples["institutional_access_examples"] if item.get("supports_naming_claim"))

    for pattern_id in PATTERN_LABELS:
        matched_terms = [
            row
            for row in terms
            if pattern_id in pattern_membership(
                {
                    "naming_pattern": row.get("naming_pattern", ""),
                    "object_type": row.get("object_type", ""),
                }
            )
        ]
        supports = [row["frequency_signal_strength"] for row in matched_terms]
        if "strong" in supports:
            freq_support = "strong"
        elif "usable" in supports:
            freq_support = "usable"
        elif "sparse" in supports:
            freq_support = "sparse"
        else:
            freq_support = "unavailable"

        visibility = search_support_for_pattern(search_index, pattern_id)
        if pattern_id == "closed_compound_or_brand":
            representatives = [item["name"] for item in brand_examples[:8]]
            object_types = sorted({item["object_type"] for item in brand_examples})
        elif pattern_id == "institutional_access_point":
            representatives = [term for term, _count in institutional_terms.most_common(10)]
            object_types = sorted({row["object_type"] for row in matched_terms} | {item["object_type"] for item in institutional_examples["institutional_access_examples"]})
        else:
            representatives = [row["query"] for row in sorted(matched_terms, key=lambda item: item["stats"]["peak_frequency_per_million"], reverse=True)[:10]]
            object_types = sorted({row["object_type"] for row in matched_terms})

        if pattern_id in {"suffix_phrase", "institutional_access_point"}:
            role = "main"
        elif pattern_id in {"closed_compound_or_brand", "platform_content_access"}:
            role = "supporting"
        elif pattern_id == "technical_system":
            role = "supporting"
        else:
            role = "annotation"

        confidence = "high" if visibility in {"strong", "visible"} and freq_support in {"strong", "usable", "sparse"} else "medium" if visibility != "unavailable" or freq_support != "unavailable" else "low"
        pattern_items.append(
            {
                "pattern_id": pattern_id,
                "label": PATTERN_LABELS[pattern_id],
                "description": PATTERN_DESCRIPTIONS[pattern_id],
                "example_terms": representatives,
                "object_types": object_types,
                "semantic_functions": PATTERN_FUNCTIONS[pattern_id],
                "frequency_support": freq_support,
                "search_visibility_support": visibility,
                "representative_examples": representatives,
                "recommended_chart_role": role,
                "confidence": confidence,
                "notes": "Keep brand/platform examples separate from ordinary phrase-frequency terms."
                if pattern_id == "closed_compound_or_brand"
                else "",
            }
        )

    return {
        "metadata": {
            "word": "hub",
            "chart_id": "chart_03",
            "generated_at": utc_now(),
            "generated_by_script": "scripts/process_hub_chart03_naming.py",
        },
        "patterns": pattern_items,
    }


def build_naming_by_period(frequency_series: dict[str, Any], search_index: dict[str, Any]) -> dict[str, Any]:
    terms = frequency_series["terms"]
    rows = []
    for period in PERIODS:
        period_totals: dict[str, float] = {}
        pattern_values: dict[str, dict[str, Any]] = {}
        for pattern_id in PATTERN_LABELS:
            matched = [
                term
                for term in terms
                if pattern_id in pattern_membership(
                    {
                        "naming_pattern": term.get("naming_pattern", ""),
                        "object_type": term.get("object_type", ""),
                    }
                )
            ]
            term_means = []
            active_terms = []
            new_terms = []
            dominant_types = Counter()
            max_term = 0.0
            for term in matched:
                ppoints = period_points(term["yearly_series"], period)
                values = [point["frequency_per_million"] for point in ppoints]
                term_mean = mean(values)
                if any(value > 0 for value in values):
                    active_terms.append(term["query"])
                    dominant_types[term["object_type"]] += 1
                if term["stats"]["first_nonzero_year"] and int(period["start_year"]) <= term["stats"]["first_nonzero_year"] <= int(period["end_year"]):
                    new_terms.append(term["query"])
                if values:
                    max_term = max(max_term, max(values))
                    term_means.append(term_mean)
            pattern_mean = mean(term_means)
            period_totals[pattern_id] = pattern_mean
            pattern_values[pattern_id] = {
                "active_terms": active_terms,
                "new_or_emerging_terms": new_terms,
                "mean_frequency_per_million": round(pattern_mean, 8),
                "max_term_frequency_per_million": round(max_term, 8),
                "dominant_object_types": [item for item, _count in dominant_types.most_common(5)],
            }

        ranked = {
            pattern_id: rank + 1
            for rank, (pattern_id, _value) in enumerate(sorted(period_totals.items(), key=lambda item: item[1], reverse=True))
        }
        for pattern_id, values in pattern_values.items():
            support = search_support_for_pattern(search_index, pattern_id)
            quality = "high" if values["active_terms"] and support in {"strong", "visible"} else "medium" if values["active_terms"] else "low"
            rows.append(
                {
                    "period_id": period["period_id"],
                    "period_label": period["label"],
                    "naming_pattern": pattern_id,
                    "active_terms": values["active_terms"],
                    "new_or_emerging_terms": values["new_or_emerging_terms"],
                    "mean_frequency_per_million": values["mean_frequency_per_million"],
                    "max_term_frequency_per_million": values["max_term_frequency_per_million"],
                    "search_visibility_status": support,
                    "dominant_object_types": values["dominant_object_types"],
                    "visibility_rank_within_period": ranked[pattern_id],
                    "data_quality": quality,
                    "notes": "Before 1850 is effectively 1800-1849 for available Ngram data."
                    if period["period_id"] == "p1_pre_1850"
                    else "",
                }
            )

    return {
        "metadata": {
            "word": "hub",
            "chart_id": "chart_03",
            "generated_at": utc_now(),
            "generated_by_script": "scripts/process_hub_chart03_naming.py",
            "periods": PERIODS,
        },
        "periods": rows,
    }


def build_quality_flags(
    frequency_series: dict[str, Any],
    search_index: dict[str, Any],
    brand_inventory: dict[str, Any],
) -> dict[str, Any]:
    search_by_query = {row["query"].lower(): row for row in search_index["records"]}
    flags = []
    for term in frequency_series["terms"]:
        support = term["frequency_signal_strength"]
        search_status = search_by_query.get(term["query"].lower(), {}).get("visibility_status", "")
        lower = term["query"].lower()
        if term["status"] in {"failed", "skipped"}:
            flag = "failed"
            use = "exclude"
            reason = "No usable frequency series was recovered."
        elif lower in AMBIGUOUS_TERMS:
            flag = "ambiguous_sense"
            use = "annotation_only"
            reason = "The phrase can name a place, institution, service, or broad center without enough context."
        elif support == "strong":
            flag = "strong_trend"
            use = "main_series"
            reason = "Printed-book series has a strong enough trend signal for chart planning."
        elif support == "usable":
            flag = "usable_trend"
            use = "supporting_series"
            reason = "Frequency series is usable but should remain a proxy."
        elif search_status in {"strong_presence", "visible"}:
            flag = "search_visible"
            use = "naming_example"
            reason = "Modern public web examples support naming-pattern presence more clearly than Ngram."
        else:
            flag = "sparse_presence"
            use = "annotation_only"
            reason = "Sparse frequency signal; useful as presence or annotation only."
        flags.append(
            {
                "term": term["query"],
                "naming_pattern": term["naming_pattern"],
                "object_type": term["object_type"],
                "quality_flag": flag,
                "reason": reason,
                "recommended_use": use,
                "notes": term["notes"],
            }
        )

    for brand in brand_inventory["brand_platform_inventory"]:
        flags.append(
            {
                "term": brand["name"],
                "naming_pattern": "closed_compound_or_brand",
                "object_type": brand["object_type"],
                "quality_flag": "brand_only",
                "reason": "Brand/platform example supports naming structure but is not ordinary lexical frequency.",
                "recommended_use": "naming_example" if brand.get("include_in_chart") else "annotation_only",
                "notes": brand.get("sensitivity_or_caution", ""),
            }
        )

    return {
        "metadata": {
            "word": "hub",
            "chart_id": "chart_03",
            "generated_at": utc_now(),
            "generated_by_script": "scripts/process_hub_chart03_naming.py",
        },
        "quality_flags": flags,
    }


def build_hypothesis_evaluation(
    naming_patterns: dict[str, Any],
    frequency_series: dict[str, Any],
    search_index: dict[str, Any],
    brand_inventory: dict[str, Any],
    institutional_examples: dict[str, Any],
) -> dict[str, Any]:
    pattern_lookup = {row["pattern_id"]: row for row in naming_patterns["patterns"]}
    visible_patterns = [
        row["pattern_id"]
        for row in naming_patterns["patterns"]
        if row["search_visibility_support"] in {"strong", "visible"} or row["frequency_support"] in {"strong", "usable"}
    ]
    verified_institutional = [
        item
        for item in institutional_examples["institutional_access_examples"]
        if item.get("supports_naming_claim") and item.get("confidence") in {"high", "medium"}
    ]
    included_brands = [item for item in brand_inventory["brand_platform_inventory"] if item.get("include_in_chart")]
    suffix_support = pattern_lookup["suffix_phrase"]["frequency_support"] in {"strong", "usable"} or pattern_lookup["suffix_phrase"]["search_visibility_support"] in {"strong", "visible"}
    institutional_support = len(verified_institutional) >= 8
    brand_support = len(included_brands) >= 5

    if suffix_support and institutional_support and brand_support:
        verdict = "supported"
    elif suffix_support and (institutional_support or brand_support):
        verdict = "partially_supported"
    elif visible_patterns:
        verdict = "weakly_supported"
    else:
        verdict = "not_supported"

    suffix_terms = [
        term
        for term in frequency_series["terms"]
        if term["naming_pattern"] == "suffix_phrase" and term["frequency_signal_strength"] in {"strong", "usable"}
    ]
    strongest_pattern = "suffix_phrase"
    weakest_pattern = min(
        naming_patterns["patterns"],
        key=lambda item: (
            {"strong": 3, "usable": 2, "sparse": 1, "unavailable": 0}.get(item["frequency_support"], 0)
            + {"strong": 3, "visible": 2, "ambiguous": 1, "unavailable": 0}.get(item["search_visibility_support"], 0)
        ),
    )["pattern_id"]

    return {
        "hypothesis": "Hub has become a reusable naming component for platforms, rooms, services, resources, communities, and access points.",
        "verdict": verdict,
        "supporting_findings": [
            f"X + hub has {pattern_lookup['suffix_phrase']['frequency_support']} frequency support and {pattern_lookup['suffix_phrase']['search_visibility_support']} search visibility support.",
            f"{len(verified_institutional)} public institutional/campus/service examples were retained as naming evidence.",
            f"{len(included_brands)} brand/platform examples were retained as platform-era naming forms.",
            "Platform/content terms and technical terms remain separate from ordinary phrase-frequency interpretation.",
        ],
        "findings_requiring_caution": [
            "Ngram underrepresents very recent web-native naming patterns.",
            "Search visibility shows public presence, not exact frequency.",
            "Brand names are recognition anchors and naming examples, not lexical-frequency evidence.",
            "Some broad terms such as community hub and service hub are semantically mixed without local context.",
        ],
        "counter_evidence_or_limitations": [
            "Hub + X appears less dominant and more technical/systemic than X + hub.",
            "Some candidate terms are sparse or failed in Ngram despite visible modern web usage.",
        ],
        "strongest_pattern": strongest_pattern,
        "weakest_pattern": weakest_pattern,
        "most_modern_pattern": "platform_content_access",
        "most_institutional_pattern": "institutional_access_point",
        "most_platform_like_pattern": "closed_compound_or_brand",
        "recommended_chart03_focus": "Focus on X + hub as the main naming format for access points, with brand/platform compounds as recognition anchors and hub + X as a smaller technical-system modifier pattern.",
        "do_not_claim": [
            "Do not claim brand popularity equals lexical frequency.",
            "Do not claim Pornhub defines the modern meaning of hub; it is only one neutral platform-era naming example.",
            "Do not claim Ngram first nonzero year is a first attestation.",
            "Do not claim all X + hub phrases are post-2000.",
            "Do not claim every hub name has the same access-point meaning without context.",
        ],
        "strongest_suffix_terms_by_frequency": [term["query"] for term in sorted(suffix_terms, key=lambda item: item["stats"]["peak_frequency_per_million"], reverse=True)[:8]],
    }


def recommended_inputs(
    naming_patterns: dict[str, Any],
    quality_flags: dict[str, Any],
    brand_inventory: dict[str, Any],
    institutional_examples: dict[str, Any],
) -> dict[str, Any]:
    flags = quality_flags["quality_flags"]
    return {
        "main_patterns": [
            row["pattern_id"]
            for row in naming_patterns["patterns"]
            if row["recommended_chart_role"] == "main"
        ],
        "main_terms": [row["term"] for row in flags if row["recommended_use"] == "main_series"],
        "supporting_terms": [row["term"] for row in flags if row["recommended_use"] == "supporting_series"],
        "brand_examples": [row["name"] for row in brand_inventory["brand_platform_inventory"] if row.get("include_in_chart")],
        "institutional_examples": [
            {
                "term": row["term"],
                "institution_or_source": row["institution_or_source"],
                "object_type": row["object_type"],
            }
            for row in institutional_examples["institutional_access_examples"]
            if row.get("supports_naming_claim")
        ][:10],
        "annotation_terms": [row["term"] for row in flags if row["recommended_use"] == "annotation_only"],
        "exclude_terms": [row["term"] for row in flags if row["recommended_use"] == "exclude"],
    }


def build_chart_preview(
    query_log: dict[str, Any],
    naming_patterns: dict[str, Any],
    frequency_series: dict[str, Any],
    search_index: dict[str, Any],
    brand_inventory: dict[str, Any],
    institutional_examples: dict[str, Any],
    naming_by_period: dict[str, Any],
    quality_flags: dict[str, Any],
    hypothesis: dict[str, Any],
) -> dict[str, Any]:
    inputs = recommended_inputs(naming_patterns, quality_flags, brand_inventory, institutional_examples)
    representative_terms = []
    for term in frequency_series["terms"]:
        if term["frequency_signal_strength"] in {"strong", "usable"} or term["query"] in inputs["annotation_terms"]:
            representative_terms.append(
                {
                    "term": term["query"],
                    "naming_pattern": term["naming_pattern"],
                    "object_type": term["object_type"],
                    "frequency_signal_strength": term["frequency_signal_strength"],
                    "first_visible_period": term["first_visible_period"],
                    "peak_period": term["peak_period"],
                }
            )
    return {
        "metadata": {
            "word": "hub",
            "chart_id": "chart_03",
            "working_title": "What Goes Around Hub",
            "generated_at": utc_now(),
            "generated_by_script": "scripts/process_hub_chart03_naming.py",
            "purpose": "naming-pattern frequency and search-visibility layer",
            "source_summary": source_summary(query_log),
            "limitations": [
                "Frequency and web visibility are separate evidence types.",
                "Search counts are not used as precise frequency.",
                "Brand/platform examples are naming evidence, not corpus-frequency evidence.",
                "Public institutional examples are illustrative, not exhaustive.",
                "The final Ngram bucket ends at 2022.",
            ],
        },
        "naming_patterns": naming_patterns["patterns"],
        "representative_terms": representative_terms,
        "brand_platform_inventory": brand_inventory["brand_platform_inventory"],
        "institutional_access_examples": institutional_examples["institutional_access_examples"],
        "naming_by_period": naming_by_period["periods"],
        "quality_flags": quality_flags["quality_flags"],
        "hypothesis_evaluation": hypothesis,
        "recommended_chart_inputs": inputs,
        "data_cautions": [
            "Do not read search visibility as exact frequency.",
            "Do not treat brands as ordinary phrase-frequency terms.",
            "Adult-brand examples should remain neutral and optional.",
            "Modern naming patterns may be undercounted in printed-book corpora.",
            "Ambiguous broad phrases need context before making semantic claims.",
        ],
    }


def update_combined_previews(chart_preview: dict[str, Any]) -> None:
    layer = {
        "metadata": chart_preview["metadata"],
        "naming_patterns": chart_preview["naming_patterns"],
        "representative_terms": chart_preview["representative_terms"],
        "brand_platform_inventory": chart_preview["brand_platform_inventory"],
        "institutional_access_examples": chart_preview["institutional_access_examples"],
        "hypothesis_evaluation": chart_preview["hypothesis_evaluation"],
        "recommended_chart_inputs": chart_preview["recommended_chart_inputs"],
        "data_cautions": chart_preview["data_cautions"],
    }
    for path in [GENERATED_PREVIEW, RESEARCH_PREVIEW]:
        payload = load_json(path, {})
        if isinstance(payload, dict):
            payload["chart03_naming_layer"] = layer
            write_json(path, payload)


def build_report_json(
    query_log: dict[str, Any],
    naming_patterns: dict[str, Any],
    frequency_series: dict[str, Any],
    search_index: dict[str, Any],
    brand_inventory: dict[str, Any],
    institutional_examples: dict[str, Any],
    hypothesis: dict[str, Any],
    chart_preview: dict[str, Any],
) -> dict[str, Any]:
    pattern_counts = {
        row["pattern_id"]: {
            "frequency_support": row["frequency_support"],
            "search_visibility_support": row["search_visibility_support"],
            "recommended_chart_role": row["recommended_chart_role"],
            "confidence": row["confidence"],
        }
        for row in naming_patterns["patterns"]
    }
    frequency_counts = Counter(row["status"] for row in frequency_series["terms"])
    quality_counts = Counter(row["quality_flag"] for row in chart_preview["quality_flags"])
    brand_count = len(brand_inventory["brand_platform_inventory"])
    institutional_count = len(institutional_examples["institutional_access_examples"])
    return {
        "metadata": {
            "word": "hub",
            "chart_id": "chart_03",
            "generated_at": utc_now(),
            "generated_by_script": "scripts/process_hub_chart03_naming.py",
        },
        "summary_counts": {
            "naming_patterns": len(naming_patterns["patterns"]),
            "frequency_queries_attempted": len(frequency_series["terms"]),
            "frequency_status_counts": dict(frequency_counts),
            "search_visibility_items": len(search_index["records"]),
            "brand_platform_examples": brand_count,
            "institutional_examples": institutional_count,
            "quality_flag_counts": dict(quality_counts),
        },
        "pattern_counts": pattern_counts,
        "frequency_query_counts": dict(frequency_counts),
        "search_visibility_counts": query_log.get("search_visibility_status_counts", {}),
        "brand_platform_inventory_counts": dict(Counter(row["object_type"] for row in brand_inventory["brand_platform_inventory"])),
        "institutional_example_counts": dict(Counter(row["object_type"] for row in institutional_examples["institutional_access_examples"])),
        "hypothesis_verdict": hypothesis["verdict"],
        "recommended_chart_focus": hypothesis["recommended_chart03_focus"],
        "output_paths": {
            "naming_patterns": str((PROCESSED_DIR / "hub_chart03_naming_patterns.json").relative_to(ROOT)),
            "naming_frequency_series": str((PROCESSED_DIR / "hub_chart03_naming_frequency_series.json").relative_to(ROOT)),
            "search_visibility_index": str((PROCESSED_DIR / "hub_chart03_search_visibility_index.json").relative_to(ROOT)),
            "brand_platform_inventory": str((PROCESSED_DIR / "hub_chart03_brand_platform_inventory.json").relative_to(ROOT)),
            "institutional_access_examples": str((PROCESSED_DIR / "hub_chart03_institutional_access_examples.json").relative_to(ROOT)),
            "naming_by_period": str((PROCESSED_DIR / "hub_chart03_naming_by_period.json").relative_to(ROOT)),
            "naming_quality_flags": str((PROCESSED_DIR / "hub_chart03_naming_quality_flags.json").relative_to(ROOT)),
            "hypothesis_evaluation": str((PROCESSED_DIR / "hub_chart03_hypothesis_evaluation.json").relative_to(ROOT)),
            "chart_data_preview": str((PROCESSED_DIR / "hub_chart03_chart_data_preview.json").relative_to(ROOT)),
            "report_md": str((REPORTS_DIR / "hub_chart03_naming_data_report.md").relative_to(ROOT)),
            "report_json": str((REPORTS_DIR / "hub_chart03_naming_data_report.json").relative_to(ROOT)),
        },
    }


def build_report_md(report: dict[str, Any], naming_patterns: dict[str, Any], hypothesis: dict[str, Any], chart_preview: dict[str, Any]) -> str:
    pattern_rows = "\n".join(
        f"| {row['label']} | {row['frequency_support']} | {row['search_visibility_support']} | {row['recommended_chart_role']} | {row['confidence']} |"
        for row in naming_patterns["patterns"]
    )
    inputs = chart_preview["recommended_chart_inputs"]
    cautions = "\n".join(f"- {item}" for item in chart_preview["data_cautions"])
    do_not_claim = "\n".join(f"- {item}" for item in hypothesis["do_not_claim"])
    main_terms = ", ".join(inputs["main_terms"]) or "None"
    supporting_terms = ", ".join(inputs["supporting_terms"]) or "None"
    brand_examples = ", ".join(inputs["brand_examples"]) or "None"
    institutional_examples = ", ".join(f"{item['term']} ({item['institution_or_source']})" for item in inputs["institutional_examples"]) or "None"
    counts = report["summary_counts"]
    return f"""# Hub Chart 03 Naming Data Report

## Purpose

This is a Chart 03 naming-pattern data pass. It does not implement UI, React, visualisation, or final chart copy.

## Hypothesis

Hub may have become a reusable naming component for platforms, rooms, services, resources, communities, and access points.

## Previous Chart Context

Chart 01 handled semantic survival and backgrounding: the wheel sense survives, but modern visibility shifts elsewhere. Chart 02 handled routing and transfer logic. Chart 03 tests whether hub has become a naming machine.

## Sources Used

- Existing local hub frequency and phrase data.
- Existing Chart 01 and Chart 02 frequency caches where terms overlapped.
- Targeted Google Books Ngram gap queries where not already cached.
- Public web/search visibility checks for modern naming presence.
- Curated public brand/platform references.
- Curated public institutional/campus/service examples.

## Naming Taxonomy

| Pattern | Frequency support | Search visibility | Recommended role | Confidence |
|---|---|---|---|---|
{pattern_rows}

## Frequency Findings

The strongest ordinary phrase-frequency support sits in X + hub terms. Some institutional and platform/content terms are too modern or web-native to be represented cleanly by printed-book Ngram data, so they are treated as presence or naming examples rather than strong frequency trends.

Frequency queries attempted: {counts['frequency_queries_attempted']}. Status counts: {counts['frequency_status_counts']}.

## Search Visibility Findings

Search visibility items collected: {counts['search_visibility_items']}. These results are presence signals only; no search-result count is treated as exact frequency.

## Brand / Platform Findings

Brand/platform examples collected: {counts['brand_platform_examples']}. They are useful as closed, hyphenated, or platform-era hub naming forms, but they are not ordinary lexical frequency evidence. Adult-platform examples are retained only as neutral, optional naming-pattern evidence.

## Institutional Access Findings

Institutional examples collected: {counts['institutional_examples']}. Public examples support the idea that student services, learning support, resource portals, media/equipment services, wellbeing services, career services, and maker spaces can be named as hubs.

## Hypothesis Evaluation

Verdict: **{hypothesis['verdict']}**.

Recommended focus: {hypothesis['recommended_chart03_focus']}

Strongest pattern: {hypothesis['strongest_pattern']}

Weakest pattern: {hypothesis['weakest_pattern']}

Most modern pattern: {hypothesis['most_modern_pattern']}

## Recommended Use

- Main terms: {main_terms}
- Supporting terms: {supporting_terms}
- Brand/platform examples: {brand_examples}
- Institutional examples: {institutional_examples}

## Data Cautions

{cautions}

## Do Not Claim

{do_not_claim}

## Recommendation

Chart 03 is ready for visual planning as a naming-pattern chart, provided the visual separates phrase-frequency evidence from brand/platform and public-web naming examples.
"""


def main() -> None:
    frequency_raw = load_json(RAW_DIR / "hub_chart03_naming_frequency_raw.json")
    search_raw = load_json(RAW_DIR / "hub_chart03_search_visibility_raw.json")
    brand_raw = load_json(RAW_DIR / "hub_chart03_platform_brand_sources_raw.json")
    institutional_raw = load_json(RAW_DIR / "hub_chart03_institutional_examples_raw.json")
    query_log = load_json(RAW_DIR / "hub_chart03_query_log.json")
    if not all([frequency_raw, search_raw, brand_raw, institutional_raw, query_log]):
        raise SystemExit("Run scripts/scrape_hub_chart03_naming.py before processing Chart 03 naming data.")

    frequency_series = build_frequency_series(frequency_raw)
    search_index = build_search_visibility_index(search_raw, institutional_raw, brand_raw)
    brand_inventory = build_brand_platform_inventory(brand_raw)
    institutional_examples = build_institutional_access_examples(institutional_raw)
    naming_patterns = build_naming_patterns(frequency_series, search_index, brand_inventory, institutional_examples)
    naming_by_period = build_naming_by_period(frequency_series, search_index)
    quality_flags = build_quality_flags(frequency_series, search_index, brand_inventory)
    hypothesis = build_hypothesis_evaluation(
        naming_patterns,
        frequency_series,
        search_index,
        brand_inventory,
        institutional_examples,
    )
    chart_preview = build_chart_preview(
        query_log,
        naming_patterns,
        frequency_series,
        search_index,
        brand_inventory,
        institutional_examples,
        naming_by_period,
        quality_flags,
        hypothesis,
    )
    report_json = build_report_json(
        query_log,
        naming_patterns,
        frequency_series,
        search_index,
        brand_inventory,
        institutional_examples,
        hypothesis,
        chart_preview,
    )
    report_md = build_report_md(report_json, naming_patterns, hypothesis, chart_preview)

    write_json(PROCESSED_DIR / "hub_chart03_naming_patterns.json", naming_patterns)
    write_json(PROCESSED_DIR / "hub_chart03_naming_frequency_series.json", frequency_series)
    write_json(PROCESSED_DIR / "hub_chart03_search_visibility_index.json", search_index)
    write_json(PROCESSED_DIR / "hub_chart03_brand_platform_inventory.json", brand_inventory)
    write_json(PROCESSED_DIR / "hub_chart03_institutional_access_examples.json", institutional_examples)
    write_json(PROCESSED_DIR / "hub_chart03_naming_by_period.json", naming_by_period)
    write_json(PROCESSED_DIR / "hub_chart03_naming_quality_flags.json", quality_flags)
    write_json(PROCESSED_DIR / "hub_chart03_hypothesis_evaluation.json", hypothesis)
    write_json(PROCESSED_DIR / "hub_chart03_chart_data_preview.json", chart_preview)
    write_json(REPORTS_DIR / "hub_chart03_naming_data_report.json", report_json)
    (REPORTS_DIR / "hub_chart03_naming_data_report.md").write_text(report_md, encoding="utf-8")
    update_combined_previews(chart_preview)

    counts = report_json["summary_counts"]
    frequency_counts = Counter(row["status"] for row in frequency_series["terms"])
    quality_counts = Counter(row["quality_flag"] for row in quality_flags["quality_flags"])
    print("Hub Chart 03 naming processing complete")
    print(f"- Naming patterns created: {counts['naming_patterns']}")
    print(f"- Frequency queries attempted: {counts['frequency_queries_attempted']}")
    print(
        "- Successful / reused / failed frequency queries: "
        f"{frequency_counts.get('success', 0)} / {frequency_counts.get('reused_existing', 0)} / {frequency_counts.get('failed', 0) + frequency_counts.get('skipped', 0)}"
    )
    print(f"- Search visibility items collected: {counts['search_visibility_items']}")
    print(f"- Brand/platform examples collected: {counts['brand_platform_examples']}")
    print(f"- Institutional examples collected: {counts['institutional_examples']}")
    print(f"- Hypothesis verdict: {hypothesis['verdict']}")
    print(f"- Strongest naming pattern: {hypothesis['strongest_pattern']}")
    print(f"- Recommended Chart 03 focus: {hypothesis['recommended_chart03_focus']}")
    print(f"- Quality flags: {dict(quality_counts)}")
    print("- Output paths:")
    for path in report_json["output_paths"].values():
        print(f"  - {path}")


if __name__ == "__main__":
    main()
