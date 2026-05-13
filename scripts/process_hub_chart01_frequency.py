#!/usr/bin/env python3
"""Process hub Chart 01 semantic-frequency proxy data."""

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

GROUP_ORDER = [
    "total_background",
    "mechanical_core",
    "central_place",
    "transport_routing",
    "network_system",
    "institutional_cluster",
    "digital_platform",
]

AMBIGUOUS_QUERIES = {"regional hub", "global hub", "community hub", "cultural hub"}
RELATED_MECHANICAL = {"hubcap", "hub cap", "hub assembly"}
BACKGROUND_GROUP = "total_background"


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def mean(values: list[float]) -> float:
    return sum(values) / len(values) if values else 0.0


def round_float(value: float, digits: int = 10) -> float:
    return round(float(value), digits)


def query_stats(record: dict[str, Any]) -> dict[str, Any]:
    points = record.get("raw_series", [])
    values = [float(point.get("frequency_per_million", 0.0)) for point in points]
    nonzero_years = [point.get("year") for point in points if float(point.get("frequency_per_million", 0.0)) > 0]
    peak_value = max(values) if values else 0.0
    peak_year = None
    if points:
        peak_point = max(points, key=lambda point: float(point.get("frequency_per_million", 0.0)))
        peak_year = peak_point.get("year")
    return {
        "first_nonzero_year": nonzero_years[0] if nonzero_years else None,
        "last_nonzero_year": nonzero_years[-1] if nonzero_years else None,
        "peak_year": peak_year,
        "peak_frequency_per_million": round_float(peak_value, 8),
        "nonzero_year_count": len(nonzero_years),
        "mean_frequency_per_million": round_float(mean(values), 8),
    }


def quality_flag_for(record: dict[str, Any]) -> tuple[str, str, str]:
    query = record["query"]
    status = record["status"]
    stats = query_stats(record)
    peak = stats["peak_frequency_per_million"]
    nonzero = stats["nonzero_year_count"]

    if status in {"failed", "skipped"}:
        return "failed", "Query failed or was skipped.", "exclude_from_chart"
    if query in {"hub", "hubs"}:
        return "usable_trend", "Background denominator only, not a semantic sense.", "supporting_series"
    if query in AMBIGUOUS_QUERIES:
        return "ambiguous_sense", "Phrase can belong to multiple semantic contexts without snippet filtering.", "supporting_series"
    if query in RELATED_MECHANICAL:
        return "noisy_query", "Mechanical-adjacent compound; useful but should not dominate the core hub score.", "annotation_only"
    if nonzero == 0:
        return "sparse_presence", "No nonzero Ngram signal in the available corpus.", "annotation_only"
    if peak < 0.005 or nonzero < 25:
        return "sparse_presence", "Too sparse for a reliable trend; useful only as a presence signal.", "annotation_only"
    if peak >= 0.05 and nonzero >= 80:
        return "strong_trend", "Sustained frequency signal suitable for a main trend layer.", "main_series"
    if peak >= 0.01 and nonzero >= 40:
        return "usable_trend", "Usable trend proxy with caution about semantic ambiguity.", "supporting_series"
    return "sparse_presence", "Low signal; avoid trend claims.", "annotation_only"


def build_quality_flags(raw: dict[str, Any]) -> dict[str, Any]:
    flags = []
    for record in raw["query_results"]:
        flag, reason, recommended_use = quality_flag_for(record)
        flags.append(
            {
                "query_id": record["query_id"],
                "query": record["query"],
                "semantic_group": record["semantic_group"],
                "quality_flag": flag,
                "reason": reason,
                "recommended_use": recommended_use,
                "stats": query_stats(record),
                "notes": record.get("notes", ""),
            }
        )
    counts = Counter(item["quality_flag"] for item in flags)
    return {
        "metadata": {
            "word": "hub",
            "chart": "chart01",
            "generated_at": utc_now(),
            "generated_by_script": "scripts/process_hub_chart01_frequency.py",
        },
        "flag_counts": dict(counts),
        "flags": flags,
    }


def records_by_group(raw: dict[str, Any]) -> dict[str, list[dict[str, Any]]]:
    grouped: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for record in raw["query_results"]:
        grouped[record["semantic_group"]].append(record)
    return grouped


def year_range(raw: dict[str, Any]) -> list[int]:
    years = set()
    for record in raw["query_results"]:
        years.update(int(point["year"]) for point in record.get("raw_series", []))
    return list(range(min(years), max(years) + 1)) if years else []


def value_by_year(record: dict[str, Any]) -> dict[int, float]:
    return {
        int(point["year"]): float(point.get("frequency_per_million", 0.0))
        for point in record.get("raw_series", [])
    }


def group_quality(records: list[dict[str, Any]], flags_by_query: dict[str, dict[str, Any]]) -> str:
    flags = [flags_by_query[record["query"]]["quality_flag"] for record in records if record["query"] in flags_by_query]
    if any(flag == "strong_trend" for flag in flags):
        return "high"
    if any(flag in {"usable_trend", "ambiguous_sense"} for flag in flags):
        return "medium"
    return "low"


def build_semantic_frequency_series(raw: dict[str, Any], quality_flags: dict[str, Any]) -> dict[str, Any]:
    grouped = records_by_group(raw)
    years = year_range(raw)
    flags_by_query = {item["query"]: item for item in quality_flags["flags"]}
    background_values: dict[int, float] = {}
    for record in grouped.get(BACKGROUND_GROUP, []):
        by_year = value_by_year(record)
        for year in years:
            background_values[year] = background_values.get(year, 0.0) + by_year.get(year, 0.0)

    groups = []
    for group_id in GROUP_ORDER:
        records = grouped.get(group_id, [])
        group_info = raw.get("semantic_groups", {}).get(group_id, {})
        record_values = {record["query"]: value_by_year(record) for record in records}
        yearly_rows = []
        max_sum = 0.0
        for year in years:
            query_values = {query: record_values[query].get(year, 0.0) for query in record_values}
            active_values = [value for value in query_values.values() if value > 0]
            combined_sum = sum(query_values.values())
            max_query_value = max(query_values.values()) if query_values else 0.0
            max_sum = max(max_sum, combined_sum)
            background = background_values.get(year, 0.0)
            yearly_rows.append(
                {
                    "year": year,
                    "combined_value_sum": round_float(combined_sum, 10),
                    "combined_value_mean": round_float(mean(list(query_values.values())), 10),
                    "max_query_value": round_float(max_query_value, 10),
                    "active_query_count": len(active_values),
                    "normalized_group_value": 0.0,
                    "share_against_total_hub_family": round_float(combined_sum / background, 10) if background > 0 and group_id != BACKGROUND_GROUP else None,
                    "query_values": {query: round_float(value, 10) for query, value in query_values.items()},
                    "data_quality": group_quality(records, flags_by_query),
                    "notes": "Values are frequency per million from Google Books Ngram or existing cache.",
                }
            )
        for row in yearly_rows:
            row["normalized_group_value"] = round_float(row["combined_value_sum"] / max_sum, 10) if max_sum > 0 else 0.0
        groups.append(
            {
                "semantic_group": group_id,
                "label": group_info.get("label", group_id),
                "description": group_info.get("description", ""),
                "queries": [record["query"] for record in records],
                "yearly_series": yearly_rows,
            }
        )

    return {
        "metadata": {
            "word": "hub",
            "purpose": "chart01_semantic_frequency_layer",
            "generated_at": utc_now(),
            "generated_by_script": "scripts/process_hub_chart01_frequency.py",
            "source_summary": raw["metadata"]["source_summary"],
            "value_unit": "frequency_per_million",
            "limitations": raw["metadata"]["limitations"]
            + [
                "The available Ngram series begins at 1800; the pre-1850 bucket is effectively 1800-1849.",
                "Group sums are proxy aggregates, not direct sense counts.",
                "Mechanical-adjacent compounds are retained at query level and flagged separately.",
            ],
        },
        "groups": groups,
    }


def period_years(period: dict[str, Any], available_years: list[int]) -> list[int]:
    return [year for year in available_years if period["start_year"] <= year <= period["end_year"]]


def period_note(period_id: str) -> str:
    if period_id == "p1_pre_1850":
        return "Available Ngram data begins at 1800, so this bucket is effectively 1800-1849."
    if period_id == "p8_2020_2022":
        return "Final bucket is limited to 2020-2022 because the current Ngram corpus ends at 2022."
    return ""


def dominant_queries_for_period(group: dict[str, Any], years: list[int], limit: int = 3) -> list[dict[str, Any]]:
    totals: dict[str, list[float]] = defaultdict(list)
    for row in group["yearly_series"]:
        if row["year"] not in years:
            continue
        for query, value in row["query_values"].items():
            totals[query].append(value)
    ranked = sorted(
        (
            {"query": query, "mean_value": round_float(mean(values), 8)}
            for query, values in totals.items()
            if mean(values) > 0
        ),
        key=lambda item: item["mean_value"],
        reverse=True,
    )
    return ranked[:limit]


def build_period_aggregation(series: dict[str, Any]) -> dict[str, Any]:
    available_years = [row["year"] for group in series["groups"] for row in group["yearly_series"]]
    available_years = sorted(set(available_years))
    rows = []
    for period in PERIODS:
        years = period_years(period, available_years)
        semantic_period_totals = {}
        for group in series["groups"]:
            if group["semantic_group"] == BACKGROUND_GROUP:
                continue
            selected = [row for row in group["yearly_series"] if row["year"] in years]
            semantic_period_totals[group["semantic_group"]] = mean([row["combined_value_mean"] for row in selected]) if selected else 0.0
        total_semantic = sum(semantic_period_totals.values())
        period_rows = []
        for group in series["groups"]:
            selected = [row for row in group["yearly_series"] if row["year"] in years]
            sum_values = [row["combined_value_sum"] for row in selected]
            mean_values = [row["combined_value_mean"] for row in selected]
            max_values = [row["max_query_value"] for row in selected]
            active_query_count = max([row["active_query_count"] for row in selected], default=0)
            period_rows.append(
                {
                    "period_id": period["period_id"],
                    "period_label": period["label"],
                    "semantic_group": group["semantic_group"],
                    "queries": group["queries"],
                    "mean_value": round_float(mean(mean_values), 10),
                    "sum_value": round_float(mean(sum_values), 10),
                    "max_value": round_float(max(max_values) if max_values else 0.0, 10),
                    "active_query_count": active_query_count,
                    "dominant_queries": dominant_queries_for_period(group, years),
                    "visibility_rank_within_period": None,
                    "share_against_all_semantic_groups": None
                    if group["semantic_group"] == BACKGROUND_GROUP or total_semantic == 0
                    else round_float(semantic_period_totals[group["semantic_group"]] / total_semantic, 10),
                    "data_quality": selected[0]["data_quality"] if selected else "low",
                    "notes": period_note(period["period_id"]),
                }
            )
        ranked = sorted(
            [row for row in period_rows if row["semantic_group"] != BACKGROUND_GROUP],
            key=lambda row: row["mean_value"],
            reverse=True,
        )
        for rank, row in enumerate(ranked, start=1):
            row["visibility_rank_within_period"] = rank
        rows.extend(period_rows)
    return {
        "metadata": {
            "word": "hub",
            "chart": "chart01",
            "generated_at": utc_now(),
            "generated_by_script": "scripts/process_hub_chart01_frequency.py",
            "periods": PERIODS,
        },
        "periods": rows,
    }


def mechanical_status(row: dict[str, Any], ranked_groups: list[dict[str, Any]]) -> dict[str, Any]:
    rank = next((item["rank"] for item in ranked_groups if item["semantic_group"] == "mechanical_core"), None)
    total = sum(item["visibility_score"] for item in ranked_groups)
    relative = row["mean_value"] / total if total > 0 else 0.0
    if row["active_query_count"] == 0 or row["mean_value"] == 0:
        status = "absent"
    elif rank == 1:
        status = "dominant"
    elif rank and rank <= 3 and relative >= 0.08:
        status = "visible"
    elif relative > 0:
        status = "backgrounded"
    else:
        status = "sparse"
    return {
        "present": row["active_query_count"] > 0,
        "visibility_rank": rank,
        "absolute_signal": round_float(row["mean_value"], 10),
        "relative_signal": round_float(relative, 10),
        "status": status,
        "notes": "Status is a preprocessing aid. It distinguishes survival/presence from semantic dominance.",
    }


def build_visibility_index(periods: dict[str, Any]) -> dict[str, Any]:
    by_period: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for row in periods["periods"]:
        if row["semantic_group"] != BACKGROUND_GROUP:
            by_period[row["period_id"]].append(row)
    period_lookup = {period["period_id"]: period for period in PERIODS}
    output = []
    for period_id, rows in by_period.items():
        ranked = []
        for rank, row in enumerate(sorted(rows, key=lambda item: item["mean_value"], reverse=True), start=1):
            ranked.append(
                {
                    "semantic_group": row["semantic_group"],
                    "visibility_score": round_float(row["mean_value"], 10),
                    "rank": rank,
                    "main_contributing_queries": row["dominant_queries"],
                    "confidence": row["data_quality"],
                    "interpretation_note": "Visibility score is a proxy based on grouped phrase frequency, not a final semantic claim.",
                }
            )
        mechanical_row = next(row for row in rows if row["semantic_group"] == "mechanical_core")
        output.append(
            {
                "period_id": period_id,
                "period_label": period_lookup[period_id]["label"],
                "ranked_groups": ranked,
                "mechanical_core_status": mechanical_status(mechanical_row, ranked),
            }
        )
    output.sort(key=lambda item: list(period_lookup).index(item["period_id"]))
    return {
        "metadata": {
            "word": "hub",
            "chart": "chart01",
            "generated_at": utc_now(),
            "generated_by_script": "scripts/process_hub_chart01_frequency.py",
            "purpose": "preprocessing aid for semantic visibility by period",
        },
        "periods": output,
    }


def build_frequency_summary(visibility: dict[str, Any], quality_flags: dict[str, Any]) -> dict[str, Any]:
    modern = next(item for item in visibility["periods"] if item["period_id"] == "p8_2020_2022")
    early = next(item for item in visibility["periods"] if item["period_id"] == "p1_pre_1850")
    dominant_modern = [item["semantic_group"] for item in modern["ranked_groups"][:3]]
    mechanical_status_modern = modern["mechanical_core_status"]["status"]
    mechanical_survives = modern["mechanical_core_status"]["present"]
    return {
        "word": "hub",
        "chart": "chart01",
        "generated_at": utc_now(),
        "generated_by_script": "scripts/process_hub_chart01_frequency.py",
        "main_question": "Did hub lose its original mechanical sense or become semantically backgrounded by later meanings?",
        "data_answer_preliminary": {
            "mechanical_core_survives": mechanical_survives,
            "mechanical_core_status": mechanical_status_modern,
            "later_semantic_groups_expand": True,
            "dominant_modern_groups": dominant_modern,
            "important_caution": "This is a proxy-frequency answer, not final chart interpretation. Mechanical survival and semantic dominance are different questions.",
        },
        "strongest_supported_observations": [
            f"Mechanical-core queries remain present in the modern bucket with status '{mechanical_status_modern}'.",
            f"The strongest early-period group is {early['ranked_groups'][0]['semantic_group']} in the visibility index.",
            f"The strongest modern-period groups are {', '.join(dominant_modern)}.",
        ],
        "observations_requiring_caution": [
            "Group sums combine semantic proxies and should not be read as exact sense counts.",
            "Regional hub, global hub, cultural hub, and community hub are ambiguous without context.",
            "Hubcap and hub cap are related mechanical compounds, not identical to hub itself.",
            "Modern digital/platform terms are often sparse before 2000.",
        ],
        "not_supported_by_data": [
            "The data does not support saying the mechanical sense disappeared.",
            "The data does not support treating raw Ngram first appearance as a first attestation.",
            "The data does not prove that all centrality/control interpretations are lexical facts.",
        ],
        "recommended_chart01_data_inputs": [
            "hub_chart01_semantic_frequency_series.json",
            "hub_chart01_frequency_by_period.json",
            "hub_chart01_semantic_visibility_index.json",
            "hub_chart01_query_quality_flags.json",
            "hub_evidence_quality_upgrade.json",
            "hub_strengthened_attestations.json",
        ],
        "quality_flag_counts": quality_flags["flag_counts"],
    }


def build_report_json(
    raw: dict[str, Any],
    search_raw: dict[str, Any],
    series: dict[str, Any],
    periods: dict[str, Any],
    visibility: dict[str, Any],
    flags: dict[str, Any],
    summary: dict[str, Any],
) -> dict[str, Any]:
    statuses = Counter(item["status"] for item in raw["query_results"])
    return {
        "metadata": {
            "word": "hub",
            "chart": "chart01",
            "generated_at": utc_now(),
            "generated_by_script": "scripts/process_hub_chart01_frequency.py",
        },
        "summary": {
            "semantic_groups": len(series["groups"]),
            "queries_attempted": len(raw["query_results"]),
            "successful_queries": statuses.get("success", 0),
            "partial_queries": statuses.get("partial", 0),
            "failed_queries": statuses.get("failed", 0),
            "skipped_queries": statuses.get("skipped", 0),
            "period_buckets": len(PERIODS),
            "strongest_group_early_period": visibility["periods"][0]["ranked_groups"][0]["semantic_group"],
            "strongest_group_modern_period": visibility["periods"][-1]["ranked_groups"][0]["semantic_group"],
            "mechanical_core_modern_status": visibility["periods"][-1]["mechanical_core_status"]["status"],
            "quality_flag_counts": flags["flag_counts"],
        },
        "sources_used": [
            "docs/research/hub/processed/hub_frequency_series.json",
            "docs/research/hub/processed/hub_phrase_series.json",
            "docs/research/hub/processed/hub_snippet_samples.json",
            "Targeted Google Books Ngram gap queries cached under docs/research/hub/raw/chart01_frequency_cache",
        ],
        "query_groups": raw["semantic_groups"],
        "periods": PERIODS,
        "processing_method": {
            "query_level_series": "Each query keeps a yearly frequency_per_million series.",
            "group_aggregation": "Group rows store combined_value_sum, combined_value_mean, max_query_value, active_query_count, normalized_group_value, and share_against_total_hub_family where possible.",
            "normalization": "normalized_group_value divides each group-year sum by that group's own maximum sum.",
            "visibility_index": "Period visibility ranks use mean grouped frequency per million as a proxy, excluding total_background.",
            "quality_flags": "Queries are classified as strong_trend, usable_trend, sparse_presence, ambiguous_sense, noisy_query, or failed.",
        },
        "preliminary_data_observations": summary["strongest_supported_observations"],
        "limitations": series["metadata"]["limitations"]
        + [
            "Search visibility records are existing-cache signals, not stable search counts.",
            "The Ngram corpus currently ends at 2022, so the final bucket is 2020-2022.",
        ],
        "recommended_use": recommended_use(flags),
        "outputs": output_paths(),
    }


def recommended_use(flags: dict[str, Any]) -> dict[str, list[str]]:
    buckets: dict[str, list[str]] = {
        "main_trend_layer": [],
        "supporting_layer": [],
        "annotation_only": [],
        "exclude": [],
    }
    mapping = {
        "main_series": "main_trend_layer",
        "supporting_series": "supporting_layer",
        "annotation_only": "annotation_only",
        "exclude_from_chart": "exclude",
    }
    for item in flags["flags"]:
        buckets[mapping[item["recommended_use"]]].append(item["query"])
    return buckets


def output_paths() -> dict[str, str]:
    paths = {
        "semantic_frequency_series": PROCESSED_DIR / "hub_chart01_semantic_frequency_series.json",
        "frequency_by_period": PROCESSED_DIR / "hub_chart01_frequency_by_period.json",
        "semantic_visibility_index": PROCESSED_DIR / "hub_chart01_semantic_visibility_index.json",
        "query_quality_flags": PROCESSED_DIR / "hub_chart01_query_quality_flags.json",
        "frequency_summary": PROCESSED_DIR / "hub_chart01_frequency_summary.json",
        "report_md": REPORTS_DIR / "hub_chart01_frequency_data_report.md",
        "report_json": REPORTS_DIR / "hub_chart01_frequency_data_report.json",
        "generated_preview": GENERATED_PREVIEW,
    }
    return {key: str(path.relative_to(ROOT)) for key, path in paths.items()}


def markdown_report(report: dict[str, Any], summary: dict[str, Any]) -> str:
    group_lines = []
    for group_id, group in report["query_groups"].items():
        group_lines.append(f"- `{group_id}`: {', '.join(group['queries'])}")
    flag_lines = []
    for key, values in report["recommended_use"].items():
        flag_lines.append(f"- `{key}`: {', '.join(values) if values else 'none'}")
    observations = "\n".join(f"- {item}" for item in report["preliminary_data_observations"])
    cautions = "\n".join(f"- {item}" for item in summary["observations_requiring_caution"])
    unsupported = "\n".join(f"- {item}" for item in summary["not_supported_by_data"])
    limitations = "\n".join(f"- {item}" for item in report["limitations"])
    outputs = "\n".join(f"- `{path}`" for path in report["outputs"].values())
    periods = "\n".join(
        f"- `{item['period_id']}`: {item['label']} ({item['start_year']}-{item['end_year']})"
        for item in report["periods"]
    )
    return f"""# Hub Chart 01 Frequency Data Report

Generated: {report['metadata']['generated_at']}

## Purpose

This pass only collected and preprocessed semantic-frequency proxies for Chart 01. It does not produce visualisation, layout, or final chart copy.

## Sources Used

{chr(10).join(f"- {source}" for source in report['sources_used'])}

## Query Groups

{chr(10).join(group_lines)}

## Period Filtering

{periods}

The available Ngram series begins at 1800, so `p1_pre_1850` is effectively 1800-1849 for this layer. The current Ngram corpus available in this dataset ends at 2022, so the final bucket is limited to 2020-2022 rather than 2020-present.

## Processing Method

- Query-level series are preserved for every query.
- Group-level aggregation stores sum, mean, max query value, active query count, normalized group value, and share against total hub/hubs where possible.
- Normalization is within each semantic group, not across all meanings.
- The visibility index ranks semantic groups by period as a preprocessing aid only.
- Quality flags separate trend-ready queries from sparse, ambiguous, noisy, or failed queries.

## Preliminary Data Observations

{observations}

## Observations Requiring Caution

{cautions}

## Not Supported By Data

{unsupported}

## Limitations

{limitations}

## Recommended Use For Chart 01

{chr(10).join(flag_lines)}

## Outputs

{outputs}
"""


def update_preview(series: dict[str, Any], periods: dict[str, Any], visibility: dict[str, Any], flags: dict[str, Any], summary: dict[str, Any]) -> None:
    layer = {
        "metadata": {
            "generated_at": utc_now(),
            "generated_by_script": "scripts/process_hub_chart01_frequency.py",
            "note": "Chart 01 semantic-frequency preprocessing layer; previous layers are preserved.",
        },
        "frequency_summary": summary,
        "semantic_visibility_index": visibility,
        "quality_flag_counts": flags["flag_counts"],
        "data_files": output_paths(),
    }
    for path in [GENERATED_PREVIEW, RESEARCH_PREVIEW]:
        if path.exists():
            preview = load_json(path)
            preview["chart01_frequency_layer"] = layer
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
    raw = load_json(RAW_DIR / "hub_chart01_frequency_raw.json")
    search_raw = load_json(RAW_DIR / "hub_chart01_search_results_raw.json")
    quality_flags = build_quality_flags(raw)
    series = build_semantic_frequency_series(raw, quality_flags)
    periods = build_period_aggregation(series)
    visibility = build_visibility_index(periods)
    summary = build_frequency_summary(visibility, quality_flags)
    report = build_report_json(raw, search_raw, series, periods, visibility, quality_flags, summary)

    write_json(PROCESSED_DIR / "hub_chart01_semantic_frequency_series.json", series)
    write_json(PROCESSED_DIR / "hub_chart01_frequency_by_period.json", periods)
    write_json(PROCESSED_DIR / "hub_chart01_semantic_visibility_index.json", visibility)
    write_json(PROCESSED_DIR / "hub_chart01_query_quality_flags.json", quality_flags)
    write_json(PROCESSED_DIR / "hub_chart01_frequency_summary.json", summary)
    write_json(REPORTS_DIR / "hub_chart01_frequency_data_report.json", report)
    (REPORTS_DIR / "hub_chart01_frequency_data_report.md").write_text(markdown_report(report, summary), encoding="utf-8")
    update_preview(series, periods, visibility, quality_flags, summary)

    expected = [
        RAW_DIR / "hub_chart01_frequency_raw.json",
        RAW_DIR / "hub_chart01_search_results_raw.json",
        RAW_DIR / "hub_chart01_query_log.json",
        PROCESSED_DIR / "hub_chart01_semantic_frequency_series.json",
        PROCESSED_DIR / "hub_chart01_frequency_by_period.json",
        PROCESSED_DIR / "hub_chart01_semantic_visibility_index.json",
        PROCESSED_DIR / "hub_chart01_query_quality_flags.json",
        PROCESSED_DIR / "hub_chart01_frequency_summary.json",
        REPORTS_DIR / "hub_chart01_frequency_data_report.json",
        GENERATED_PREVIEW,
        RESEARCH_PREVIEW,
    ]
    validate(expected)

    raw_statuses = Counter(item["status"] for item in raw["query_results"])
    flag_counts = Counter(item["quality_flag"] for item in quality_flags["flags"])
    early = visibility["periods"][0]
    modern = visibility["periods"][-1]
    print("Hub Chart 01 frequency processing summary")
    print(f"- Semantic groups: {len(series['groups'])}")
    print(f"- Queries attempted: {len(raw['query_results'])}")
    print(f"- Successful / partial / failed queries: {raw_statuses.get('success', 0)} / {raw_statuses.get('partial', 0)} / {raw_statuses.get('failed', 0)}")
    print(f"- Period buckets generated: {len(PERIODS)}")
    print(f"- Strongest group by early period: {early['ranked_groups'][0]['semantic_group']}")
    print(f"- Strongest group by modern period: {modern['ranked_groups'][0]['semantic_group']}")
    print(f"- mechanical_core status in modern period: {modern['mechanical_core_status']['status']}")
    print(
        "- Quality flags: "
        f"strong_trend={flag_counts.get('strong_trend', 0)}, "
        f"usable_trend={flag_counts.get('usable_trend', 0)}, "
        f"sparse_presence={flag_counts.get('sparse_presence', 0)}, "
        f"ambiguous_sense={flag_counts.get('ambiguous_sense', 0)}, "
        f"noisy_query={flag_counts.get('noisy_query', 0)}, "
        f"failed={flag_counts.get('failed', 0)}"
    )
    print("- Output paths:")
    for key, path in output_paths().items():
        print(f"  - {path}")


if __name__ == "__main__":
    main()
