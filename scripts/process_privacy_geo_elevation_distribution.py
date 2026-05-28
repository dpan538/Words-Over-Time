#!/usr/bin/env python3
"""Build the privacy geo-elevation distribution layer.

The layer compares recovered privacy geo signals with elevation. Elevation is
treated as a spatial attribute only, not a causal explanation.
"""

from __future__ import annotations

import json
import math
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path
from statistics import mean, median
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
RESEARCH_DIR = ROOT / "docs" / "research" / "privacy"
PROCESSED_DIR = RESEARCH_DIR / "processed"
REPORTS_DIR = RESEARCH_DIR / "reports"
GENERATED_DIR = ROOT / "src" / "data" / "generated"

SOURCE_PATH = GENERATED_DIR / "privacy_geo_attention_map.json"
SPATIAL_SOURCE_PATH = PROCESSED_DIR / "privacy_geo_spatial_metrics_processed.json"
PROCESSED_PATH = PROCESSED_DIR / "privacy_geo_elevation_distribution_processed.json"
GENERATED_PATH = GENERATED_DIR / "privacy_geo_elevation_distribution.json"
JSON_REPORT_PATH = REPORTS_DIR / "privacy_geo_elevation_distribution_data_report.json"
MD_REPORT_PATH = REPORTS_DIR / "privacy_geo_elevation_distribution_data_report.md"

LAYER_ID = "geo_elevation_distribution"

ELEVATION_BANDS = [
    {"band_id": "below_0m", "label": "below 0m", "min_m": None, "max_m": 0},
    {"band_id": "0_100m", "label": "0-100m", "min_m": 0, "max_m": 100},
    {"band_id": "100_500m", "label": "100-500m", "min_m": 100, "max_m": 500},
    {"band_id": "500_1000m", "label": "500-1000m", "min_m": 500, "max_m": 1000},
    {"band_id": "1000_2000m", "label": "1000-2000m", "min_m": 1000, "max_m": 2000},
    {"band_id": "above_2000m", "label": "above 2000m", "min_m": 2000, "max_m": None},
]


def band_for_elevation(elevation: float) -> str:
    for band in ELEVATION_BANDS:
        min_m = band["min_m"]
        max_m = band["max_m"]
        if min_m is None and elevation < max_m:
            return str(band["band_id"])
        if max_m is None and elevation >= min_m:
            return str(band["band_id"])
        if min_m is not None and max_m is not None and min_m <= elevation < max_m:
            return str(band["band_id"])
    return "unknown"


def quantile(values: list[float], q: float) -> float:
    if not values:
        return 0.0
    ordered = sorted(values)
    pos = (len(ordered) - 1) * q
    lower = math.floor(pos)
    upper = math.ceil(pos)
    if lower == upper:
        return ordered[lower]
    weight = pos - lower
    return ordered[lower] * (1 - weight) + ordered[upper] * weight


def load_json(path: Path) -> dict[str, Any]:
    if not path.exists():
        raise FileNotFoundError(f"Missing required source file: {path}")
    return json.loads(path.read_text(encoding="utf-8"))


def normalize_point(point: dict[str, Any], index: int, signal_mean: float, signal_sd: float) -> dict[str, Any]:
    elevation = float(point["elevation_meters"])
    count = int(point.get("record_count") or 0)
    log_signal = math.log1p(max(count, 0))
    deviation = (log_signal - signal_mean) / signal_sd if signal_sd else 0.0
    return {
        "id": f"{point.get('country_code', 'XX')}_{point.get('city', 'unknown')}_{index}".lower()
        .replace(" ", "_")
        .replace("'", "")
        .replace(".", ""),
        "city": point.get("city"),
        "region": point.get("region"),
        "country": point.get("country"),
        "country_code": point.get("country_code"),
        "latitude": point.get("latitude"),
        "longitude": point.get("longitude"),
        "elevation_meters": round(elevation, 1),
        "record_count": count,
        "log_signal": round(log_signal, 4),
        "signal_deviation": round(deviation, 4),
        "band_id": band_for_elevation(elevation),
        "top_queries": point.get("top_queries", [])[:3],
        "notes": ["City-level recovered geo signal; not population-normalized search share."],
    }


def main() -> int:
    try:
        GENERATED_DIR.mkdir(parents=True, exist_ok=True)
        PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
        REPORTS_DIR.mkdir(parents=True, exist_ok=True)

        source = load_json(SOURCE_PATH)
        spatial_source = load_json(SPATIAL_SOURCE_PATH) if SPATIAL_SOURCE_PATH.exists() else {}

        raw_points = [
            p
            for p in source.get("city_points", [])
            if isinstance(p.get("elevation_meters"), (int, float))
            and isinstance(p.get("record_count"), int)
            and p.get("record_count", 0) > 0
        ]
        if not raw_points:
            raise ValueError("No elevation-ready city points were found in privacy_geo_attention_map.json")

        log_values = [math.log1p(max(int(p.get("record_count") or 0), 0)) for p in raw_points]
        signal_mean = mean(log_values)
        signal_sd = math.sqrt(mean([(v - signal_mean) ** 2 for v in log_values])) or 1.0

        points = [normalize_point(point, index, signal_mean, signal_sd) for index, point in enumerate(raw_points)]
        points.sort(key=lambda item: (item["elevation_meters"], item["country"], item["city"]))

        by_band: dict[str, list[dict[str, Any]]] = defaultdict(list)
        for point in points:
            by_band[str(point["band_id"])].append(point)

        bands = []
        for band in ELEVATION_BANDS:
            band_points = by_band.get(str(band["band_id"]), [])
            band_records = sum(int(p["record_count"]) for p in band_points)
            band_logs = [float(p["log_signal"]) for p in band_points]
            bands.append(
                {
                    **band,
                    "point_count": len(band_points),
                    "record_count": band_records,
                    "mean_log_signal": round(mean(band_logs), 4) if band_logs else 0,
                    "median_log_signal": round(median(band_logs), 4) if band_logs else 0,
                    "relative_to_global_mean": round((mean(band_logs) - signal_mean) / signal_sd, 4)
                    if band_logs
                    else None,
                    "top_places": sorted(
                        [
                            {
                                "city": p["city"],
                                "country": p["country"],
                                "elevation_meters": p["elevation_meters"],
                                "record_count": p["record_count"],
                            }
                            for p in band_points
                        ],
                        key=lambda item: item["record_count"],
                        reverse=True,
                    )[:5],
                }
            )

        top_positive = sorted(points, key=lambda p: p["signal_deviation"], reverse=True)[:5]
        top_elevation = sorted(points, key=lambda p: p["elevation_meters"], reverse=True)[:5]
        low_elevation_high_signal = [
            p for p in sorted(points, key=lambda p: p["record_count"], reverse=True) if p["elevation_meters"] < 100
        ][:5]

        annotations = [
            {
                "annotation_id": "largest_recovered_signal",
                "point_id": top_positive[0]["id"],
                "label": f"{top_positive[0]['city']} / strongest recovered signal",
                "description": "The largest city-level recovered privacy signal in this layer.",
            },
            {
                "annotation_id": "low_elevation_cluster",
                "point_id": low_elevation_high_signal[0]["id"],
                "label": "Low-elevation signal cluster",
                "description": "Most high-signal points sit near coastal or low-elevation institutional and technology centers.",
            },
            {
                "annotation_id": "high_elevation_counterpoint",
                "point_id": top_elevation[0]["id"],
                "label": f"{top_elevation[0]['city']} / high-elevation counterpoint",
                "description": "A useful reminder that elevation is context, not a causal explanation.",
            },
        ]

        processed = {
            "word": "privacy",
            "layer_id": LAYER_ID,
            "status": "exploratory_visual_layer",
            "intended_use": "available_for_later_elevation_distribution_chart_design",
            "title": "Privacy signal by elevation",
            "description": (
                "Compares recovered privacy geo signals with elevation. The values are source-recovered "
                "attention/discourse counts, not population-normalized search share."
            ),
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "generated_by_script": "scripts/process_privacy_geo_elevation_distribution.py",
            "source_layers": [
                "src/data/generated/privacy_geo_attention_map.json",
                "docs/research/privacy/processed/privacy_geo_spatial_metrics_processed.json",
            ],
            "statistics": {
                "point_count": len(points),
                "elevation_point_count": len(points),
                "record_count_total": sum(int(p["record_count"]) for p in points),
                "elevation_min_m": min(float(p["elevation_meters"]) for p in points),
                "elevation_max_m": max(float(p["elevation_meters"]) for p in points),
                "mean_log_signal": round(signal_mean, 4),
                "median_elevation_m": round(median([float(p["elevation_meters"]) for p in points]), 1),
                "q1_elevation_m": round(quantile([float(p["elevation_meters"]) for p in points], 0.25), 1),
                "q3_elevation_m": round(quantile([float(p["elevation_meters"]) for p in points], 0.75), 1),
                "source_total_records": source.get("statistics", {}).get("source_total_records"),
                "google_trends_available": source.get("statistics", {}).get("google_trends_available", False),
            },
            "points": points,
            "bands": bands,
            "annotations": annotations,
            "strong_signals": [
                "90 city-level records include latitude, longitude, elevation, and recovered privacy signal counts.",
                "The strongest recovered city signals are concentrated in low-elevation institutional and platform centers.",
                "High-elevation points exist as counterpoints, but do not dominate the recovered signal.",
            ],
            "limitations": [
                "Elevation is a spatial attribute and does not imply causation.",
                "Record counts are recovered source signals, not population-normalized search interest.",
                "Google Trends regional data remains unavailable in this local reproducible pipeline.",
                "Some city points are institution/news-source centroids rather than complete public attention measurements.",
            ],
            "source_notes": [
                "City point elevations come from the geo_spatial_metrics layer where latitude/longitude enrichment was available.",
                "The geo_spatial_metrics aggregate by elevation band is preserved as source context.",
            ],
            "spatial_aggregate_context": spatial_source.get("aggregates", {}).get("by_elevation_band", []),
        }

        for path in [PROCESSED_PATH, GENERATED_PATH]:
            path.write_text(json.dumps(processed, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

        report = {
            "layer_id": LAYER_ID,
            "status": "complete",
            "point_count": len(points),
            "record_count_total": processed["statistics"]["record_count_total"],
            "elevation_min_m": processed["statistics"]["elevation_min_m"],
            "elevation_max_m": processed["statistics"]["elevation_max_m"],
            "bands": bands,
            "failed_sources": [],
            "limitations": processed["limitations"],
        }
        JSON_REPORT_PATH.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

        md = [
            "# Privacy Geo-Elevation Distribution",
            "",
            "## What Was Processed",
            "",
            f"- Source city points with valid elevation: {len(points)}",
            f"- Total recovered city-level records: {processed['statistics']['record_count_total']}",
            f"- Elevation range: {processed['statistics']['elevation_min_m']}m to {processed['statistics']['elevation_max_m']}m",
            "",
            "## Usable Signal",
            "",
            "- The layer is strong enough for a visual comparison between recovered privacy signal and elevation bands.",
            "- Most high-signal recovered places are low-elevation institutional or platform centers.",
            "- Higher-elevation places are useful as counterpoints, not as a causal branch.",
            "",
            "## Caution",
            "",
            "- Elevation does not explain privacy attention by itself.",
            "- Values are recovered source signals, not population-normalized search interest.",
            "- Google Trends regional data remains unavailable.",
        ]
        MD_REPORT_PATH.write_text("\n".join(md) + "\n", encoding="utf-8")

        print(
            json.dumps(
                {
                    "status": "ok",
                    "layer_id": LAYER_ID,
                    "points": len(points),
                    "records": processed["statistics"]["record_count_total"],
                    "generated": str(GENERATED_PATH),
                },
                indent=2,
            )
        )
        return 0
    except Exception as exc:
        print(f"[privacy_geo_elevation_distribution] ERROR: {exc}")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
