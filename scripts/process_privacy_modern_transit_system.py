#!/usr/bin/env python3
"""Build privacy 1950-2026 modern transit-system data for the chart 01C design."""

from __future__ import annotations

import json
import math
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
RESEARCH_DIR = ROOT / "docs" / "research" / "privacy"
RAW_PATH = RESEARCH_DIR / "raw" / "privacy_modern_transit_system_raw.json"
FREQUENCY_PATH = RESEARCH_DIR / "processed" / "privacy_frequency_terms_processed.json"
COLLOCATIONS_PATH = RESEARCH_DIR / "processed" / "privacy_collocations_semantic_field_processed.json"
ATTENTION_PATH = RESEARCH_DIR / "processed" / "privacy_attention_metrics_processed.json"
TIMELINE_PATH = RESEARCH_DIR / "processed" / "privacy_timeline_source_index_processed.json"
PROCESSED_DIR = RESEARCH_DIR / "processed"
REPORTS_DIR = RESEARCH_DIR / "reports"
PROCESSED_PATH = PROCESSED_DIR / "privacy_modern_transit_system_processed.json"
REPORT_JSON_PATH = REPORTS_DIR / "privacy_modern_transit_system_data_report.json"
REPORT_MD_PATH = REPORTS_DIR / "privacy_modern_transit_system_data_report.md"
GENERATED_PATH = ROOT / "src" / "data" / "generated" / "privacy_modern_transit_system.json"
INDEX_PATH = RESEARCH_DIR / "privacy_research_index.json"
PREVIEW_PATH = ROOT / "src" / "data" / "generated" / "privacy_chart_data_preview.json"

PERIODS = [
    {"period_id": "1950_1974", "label": "1950-1974", "start_year": 1950, "end_year": 1974},
    {"period_id": "1974_1995", "label": "1974-1995", "start_year": 1974, "end_year": 1995},
    {"period_id": "1995_2001", "label": "1995-2001", "start_year": 1995, "end_year": 2001},
    {"period_id": "2001_2013", "label": "2001-2013", "start_year": 2001, "end_year": 2013},
    {"period_id": "2013_2018", "label": "2013-2018", "start_year": 2013, "end_year": 2018},
    {"period_id": "2018_2026", "label": "2018-2026", "start_year": 2018, "end_year": 2026},
]

ATTENTION_ROUTE_PAGES = {
    "rights_personhood": ["Privacy", "Right_to_privacy"],
    "information_data_protection": ["Information_privacy", "Data_privacy", "General_data_protection_regulation"],
    "internet_platform_interface": ["Internet_privacy", "Privacy_policy"],
    "surveillance_security_tension": ["Surveillance"],
    "breach_risk_compliance": ["Data_breach", "California_Consumer_Privacy_Act"],
    "identity_consent_advertising": ["Digital_rights"],
    "ai_biometrics_sensitive_data": [],
}

CONFIDENCE_SCORE = {"high": 3, "medium": 2, "low": 1}


def load_json(path: Path, required: bool = True) -> Any:
    if not path.exists():
        if required:
            raise FileNotFoundError(f"Required file missing: {path}")
        return None
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")


def normalize_text(value: str | None) -> str:
    return (value or "").strip().lower()


def value_for_year(values: list[dict[str, Any]], year: int) -> float:
    for item in values:
        item_year = item.get("year", item.get("date"))
        if str(item_year) == str(year):
            return float(item.get("value", item.get("views", 0)) or 0)
    return 0.0


def frequency_series_for_terms(frequency: dict[str, Any], terms: list[str]) -> list[dict[str, Any]]:
    wanted = {normalize_text(term) for term in terms}
    return [
        row
        for row in frequency.get("series", [])
        if normalize_text(row.get("term")) in wanted and row.get("status") == "collected"
    ]


def frequency_signal(series: list[dict[str, Any]], start_year: int, end_year: int) -> float:
    values: list[float] = []
    for row in series:
        row_values = row.get("values", [])
        for year in range(start_year, min(end_year, 2022) + 1):
            values.append(value_for_year(row_values, year))
    return sum(values) / len(values) if values else 0.0


def attention_signal(attention: dict[str, Any], route_id: str, start_year: int, end_year: int) -> int:
    pages = set(ATTENTION_ROUTE_PAGES.get(route_id, []))
    total = 0
    for series in attention.get("series", []):
        if series.get("page") not in pages:
            continue
        for year in range(max(start_year, 2016), end_year + 1):
            total += int(value_for_year(series.get("values", []), year))
    return total


def collocation_hits(collocations: dict[str, Any], terms: list[str]) -> list[dict[str, str]]:
    wanted = {normalize_text(term) for term in terms}
    hits: list[dict[str, str]] = []
    for bucket in collocations.get("buckets", []):
        for phrase in bucket.get("phrases", []):
            phrase_text = normalize_text(phrase.get("phrase"))
            if phrase_text in wanted:
                hits.append({"phrase": phrase.get("phrase"), "bucket_id": bucket.get("bucket_id")})
    return hits


def station_source_attempts(raw: dict[str, Any]) -> dict[str, dict[str, Any]]:
    return {attempt.get("station_id"): attempt for attempt in raw.get("source_attempts", [])}


def evidence_strength(station: dict[str, Any], attempt: dict[str, Any] | None) -> int:
    score = CONFIDENCE_SCORE.get(station.get("confidence"), 1)
    if attempt and attempt.get("reachable"):
        score += 2
    if station.get("manual_review"):
        score -= 1
    if len(station.get("route_ids", [])) > 1:
        score += 1
    return max(1, min(score, 6))


def station_radius(strength: int) -> float:
    return round(8 + math.sqrt(strength) * 9.5, 2)


def build_stations(raw: dict[str, Any]) -> list[dict[str, Any]]:
    attempts = station_source_attempts(raw)
    output: list[dict[str, Any]] = []
    for station in raw.get("stations", []):
        attempt = attempts.get(station.get("station_id"), {})
        strength = evidence_strength(station, attempt)
        output.append(
            {
                **station,
                "evidence_strength": strength,
                "radius": station_radius(strength),
                "source_reachable": bool(attempt.get("reachable")),
                "source_status": attempt.get("status"),
                "source_checked_at": attempt.get("checked_at"),
                "needs_manual_review": bool(station.get("manual_review")),
                "transfer": len(station.get("route_ids", [])) > 1,
            }
        )
    return sorted(output, key=lambda item: (item["year"], item["station_id"]))


def build_route_segments(routes: list[dict[str, Any]], stations: list[dict[str, Any]]) -> list[dict[str, Any]]:
    segments: list[dict[str, Any]] = []
    for route in routes:
        route_stations = [station for station in stations if route["route_id"] in station.get("route_ids", [])]
        route_stations = sorted(route_stations, key=lambda item: (item["year"], item["station_id"]))
        for index in range(len(route_stations) - 1):
            start = route_stations[index]
            end = route_stations[index + 1]
            segments.append(
                {
                    "route_id": route["route_id"],
                    "from_station_id": start["station_id"],
                    "to_station_id": end["station_id"],
                    "start_year": start["year"],
                    "end_year": end["year"],
                    "duration_years": end["year"] - start["year"],
                    "suggested_motion": "continuous_particles",
                }
            )
    return segments


def build_flow_metrics(
    routes: list[dict[str, Any]],
    stations: list[dict[str, Any]],
    frequency: dict[str, Any],
    attention: dict[str, Any],
    collocations: dict[str, Any],
) -> list[dict[str, Any]]:
    raw_rows: list[dict[str, Any]] = []
    for route in routes:
        freq_series = frequency_series_for_terms(frequency, route.get("terms", []))
        route_collocations = collocation_hits(collocations, route.get("terms", []))
        for period in PERIODS:
            anchors = [
                station
                for station in stations
                if route["route_id"] in station.get("route_ids", [])
                and period["start_year"] <= station["year"] <= period["end_year"]
            ]
            freq = frequency_signal(freq_series, period["start_year"], period["end_year"])
            attention_total = attention_signal(attention, route["route_id"], period["start_year"], period["end_year"])
            raw = math.log1p(freq * 12) + math.log1p(attention_total / 120_000) + len(anchors) * 0.55
            raw_rows.append(
                {
                    "route_id": route["route_id"],
                    "period_id": period["period_id"],
                    "period_label": period["label"],
                    "frequency_signal": round(freq, 6),
                    "attention_views": attention_total,
                    "anchor_count": len(anchors),
                    "collocation_hit_count": len(route_collocations),
                    "station_ids": [station["station_id"] for station in anchors],
                    "raw_flow_score": raw,
                }
            )
    max_raw = max((row["raw_flow_score"] for row in raw_rows), default=1)
    for row in raw_rows:
        row["particle_density"] = round(0.2 + 0.8 * (row["raw_flow_score"] / max_raw), 3) if max_raw else 0.2
        row["particle_speed_hint"] = "fast" if row["particle_density"] >= 0.72 else "medium" if row["particle_density"] >= 0.45 else "slow"
    return raw_rows


def build_route_summaries(
    routes: list[dict[str, Any]],
    stations: list[dict[str, Any]],
    flow_metrics: list[dict[str, Any]],
    frequency: dict[str, Any],
    collocations: dict[str, Any],
) -> list[dict[str, Any]]:
    summaries: list[dict[str, Any]] = []
    for row_index, route in enumerate(routes):
        route_stations = [station for station in stations if route["route_id"] in station.get("route_ids", [])]
        route_flows = [item for item in flow_metrics if item["route_id"] == route["route_id"]]
        freq_series = frequency_series_for_terms(frequency, route.get("terms", []))
        hits = collocation_hits(collocations, route.get("terms", []))
        summaries.append(
            {
                **route,
                "suggested_row": row_index,
                "station_count": len(route_stations),
                "transfer_count": sum(1 for station in route_stations if station.get("transfer")),
                "frequency_series_count": len(freq_series),
                "collocation_hit_count": len(hits),
                "first_station_year": min((station["year"] for station in route_stations), default=None),
                "latest_station_year": max((station["year"] for station in route_stations), default=None),
                "max_particle_density": max((item["particle_density"] for item in route_flows), default=0),
            }
        )
    return summaries


def build_transfer_stations(stations: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return [
        {
            "station_id": station["station_id"],
            "label": station["label"],
            "year": station["year"],
            "route_ids": station["route_ids"],
            "evidence_strength": station["evidence_strength"],
        }
        for station in stations
        if len(station.get("route_ids", [])) > 1
    ]


def source_success_table(raw: dict[str, Any]) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    attempts = station_source_attempts(raw)
    for station in raw.get("stations", []):
        attempt = attempts.get(station.get("station_id"), {})
        rows.append(
            {
                "station_id": station["station_id"],
                "year": station["year"],
                "label": station["label"],
                "source_title": station["source_title"],
                "source_url": station["source_url"],
                "reachable": bool(attempt.get("reachable")),
                "status": attempt.get("status"),
                "manual_review": bool(station.get("manual_review")),
            }
        )
    return rows


def update_index(generated_at: str, station_count: int, route_count: int) -> None:
    if not INDEX_PATH.exists():
        return
    index = load_json(INDEX_PATH)
    layers = index.setdefault("layers", [])
    layer = {
        "layer_id": "modern_transit_system",
        "processed_path": "docs/research/privacy/processed/privacy_modern_transit_system_processed.json",
        "report_path": "docs/research/privacy/reports/privacy_modern_transit_system_data_report.md",
        "status": "source_supported_for_chart01c",
        "notes": f"1950-2026 metro-map data layer with {route_count} routes and {station_count} supported stations.",
    }
    layers[:] = [item for item in layers if item.get("layer_id") != "modern_transit_system"]
    layers.append(layer)
    index["updated_at"] = generated_at
    INDEX_PATH.write_text(json.dumps(index, indent=2, ensure_ascii=False), encoding="utf-8")


def update_preview(generated_at: str, route_count: int, station_count: int, transfer_count: int) -> None:
    if not PREVIEW_PATH.exists():
        return
    preview = load_json(PREVIEW_PATH)
    preview["modern_transit_system_layer"] = {
        "layer_id": "modern_transit_system",
        "title": "Privacy modern semantic transit system",
        "status": "source_supported_for_chart01c",
        "processed_path": "docs/research/privacy/processed/privacy_modern_transit_system_processed.json",
        "generated_path": "src/data/generated/privacy_modern_transit_system.json",
        "generated_by_script": "scripts/process_privacy_modern_transit_system.py",
        "generated_at": generated_at,
        "route_count": route_count,
        "station_count": station_count,
        "transfer_station_count": transfer_count,
        "note": "Privacy chart 01C layer inside chart01; intentionally not chart02.",
    }
    PREVIEW_PATH.write_text(json.dumps(preview, indent=2, ensure_ascii=False), encoding="utf-8")


def main() -> int:
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    GENERATED_PATH.parent.mkdir(parents=True, exist_ok=True)

    raw = load_json(RAW_PATH)
    frequency = load_json(FREQUENCY_PATH)
    collocations = load_json(COLLOCATIONS_PATH)
    attention = load_json(ATTENTION_PATH)
    timeline = load_json(TIMELINE_PATH, required=False) or {}

    generated_at = datetime.now(timezone.utc).isoformat()
    routes = raw.get("routes", [])
    stations = build_stations(raw)
    route_segments = build_route_segments(routes, stations)
    flow_metrics = build_flow_metrics(routes, stations, frequency, attention, collocations)
    route_summaries = build_route_summaries(routes, stations, flow_metrics, frequency, collocations)
    transfer_stations = build_transfer_stations(stations)
    source_rows = source_success_table(raw)
    reachable_count = sum(1 for row in source_rows if row["reachable"])
    manual_review_count = sum(1 for row in source_rows if row["manual_review"])

    payload = {
        "word": "privacy",
        "layer_id": "modern_transit_system",
        "status": "source_supported_for_chart01c",
        "intended_use": "privacy_chart01_third_phase_metro_map",
        "title": "Privacy modern semantic transit system",
        "subtitle": "1950-2026 routes from rights to data, platforms, surveillance, and AI-era privacy",
        "generated_at": generated_at,
        "generated_by_script": "scripts/process_privacy_modern_transit_system.py",
        "year_range": [1950, 2026],
        "routes": route_summaries,
        "stations": stations,
        "route_segments": route_segments,
        "transfer_stations": transfer_stations,
        "flow_metrics": {"periods": PERIODS, "by_route_period": flow_metrics},
        "animated_particles": [
            {
                "route_id": route["route_id"],
                "color": route["color"],
                "motion_rule": "particles follow route segments from older to newer stations",
                "density_source": "particle_density from frequency, attention, and anchor density",
            }
            for route in routes
        ],
        "small_support_charts": {
            "route_scale": "Station radius encodes source support and transfer importance.",
            "modern_phrase_signal": "Route flow uses frequency_terms phrase series and Wikimedia attention where available.",
            "anchor_strip": "Station bars can show legal, technical, and cultural anchors by year without implying all transitions are legal events.",
        },
        "source_support": {
            "source_rows": source_rows,
            "reachable_source_count": reachable_count,
            "source_count": len(source_rows),
            "manual_review_count": manual_review_count,
            "failed_sources": raw.get("failed_sources", []),
        },
        "source_inputs": [
            {
                "source_id": "curated_modern_station_sources",
                "record_count": len(stations),
                "reachable_count": reachable_count,
                "manual_review_count": manual_review_count,
            },
            {
                "source_id": "frequency_terms",
                "record_count": len(frequency.get("series", [])),
                "year_range": frequency.get("year_range"),
            },
            {
                "source_id": "collocations_semantic_field",
                "record_count": sum(len(bucket.get("phrases", [])) for bucket in collocations.get("buckets", [])),
            },
            {
                "source_id": "attention_metrics",
                "record_count": len(attention.get("series", [])),
                "note": "Wikimedia pageviews support attention intensity after 2015 only.",
            },
            {
                "source_id": "timeline_source_index",
                "record_count": len(timeline.get("anchors", [])),
            },
        ],
        "visual_plan": {
            "map_type": "metro_map",
            "recommended_height_px": 1250,
            "route_layout": "Use separate horizontal/diagonal route corridors with transfer stations at GDPR, consent, data breach, surveillance, and AI/biometrics.",
            "animation": "Use small moving dots along routes; do not animate station labels. Particle density can increase after 1995, 2013, and 2018 where data supports it.",
            "interaction": "Hover should resolve to fixed side-panel station details, not floating labels over the route map.",
        },
        "limitations": [
            "This is a chart-support data layer, not a complete global privacy-law database.",
            "Google Books data ends at 2022, while the visual range runs to 2026; post-2022 flow should lean on anchors and attention metrics, not Ngram values.",
            "Wikimedia pageviews are public attention proxies only and do not equal social importance.",
            "Manual-review stations are useful for layout continuity but should be visually marked lighter until source-grade verification is complete.",
            "Some legal sources are jurisdiction-specific; the metro metaphor should show branching semantic routes, not a single universal legal timeline.",
        ],
    }

    write_json(PROCESSED_PATH, payload)
    write_json(GENERATED_PATH, payload)

    report = {
        "word": "privacy",
        "layer_id": "modern_transit_system",
        "generated_at": generated_at,
        "route_count": len(routes),
        "station_count": len(stations),
        "transfer_station_count": len(transfer_stations),
        "route_segment_count": len(route_segments),
        "flow_metric_count": len(flow_metrics),
        "reachable_source_count": reachable_count,
        "source_count": len(source_rows),
        "manual_review_count": manual_review_count,
        "failed_sources": raw.get("failed_sources", []),
        "routes": [
            {
                "route_id": route["route_id"],
                "station_count": route["station_count"],
                "frequency_series_count": route["frequency_series_count"],
                "collocation_hit_count": route["collocation_hit_count"],
                "max_particle_density": route["max_particle_density"],
            }
            for route in route_summaries
        ],
    }
    write_json(REPORT_JSON_PATH, report)
    REPORT_MD_PATH.write_text(
        "\n".join(
            [
                "# Privacy modern transit system",
                "",
                "Layer ID: `modern_transit_system`",
                "",
                "This layer supports the 1950-2026 privacy metro-map direction inside chart 01C. It is a source-supported data layer, not a finished chart.",
                "",
                f"- Routes: {len(routes)}",
                f"- Stations: {len(stations)}",
                f"- Transfer stations: {len(transfer_stations)}",
                f"- Route segments: {len(route_segments)}",
                f"- Route-period flow rows: {len(flow_metrics)}",
                f"- Reachable station sources: {reachable_count} / {len(source_rows)}",
                f"- Manual-review stations: {manual_review_count}",
                "",
                "## Strongest Supported Routes",
                "",
                *[
                    f"- `{route['route_id']}`: {route['station_count']} stations, {route['frequency_series_count']} frequency series, {route['collocation_hit_count']} collocation hits"
                    for route in route_summaries
                ],
                "",
                "## Design Use",
                "",
                "- Use routes as semantic branches, stations as source-supported anchors, and transfer stations where privacy meanings cross.",
                "- Particle density can follow `flow_metrics.by_route_period[].particle_density`.",
                "- Hover details should use fixed side-panel copy; avoid floating labels over the map.",
                "",
                "## Limitations",
                "",
                *[f"- {item}" for item in payload["limitations"]],
                "",
            ]
        ),
        encoding="utf-8",
    )

    update_index(generated_at, len(stations), len(routes))
    update_preview(generated_at, len(routes), len(stations), len(transfer_stations))

    print(f"Wrote {PROCESSED_PATH}")
    print(f"Wrote {GENERATED_PATH}")
    print(f"Routes: {len(routes)}")
    print(f"Stations: {len(stations)}")
    print(f"Transfer stations: {len(transfer_stations)}")
    print(f"Reachable sources: {reachable_count}/{len(source_rows)}")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:  # noqa: BLE001
        print(f"privacy modern transit processing failed: {exc}", file=sys.stderr)
        raise SystemExit(1)
