#!/usr/bin/env python3
"""Build the pre-modern semantic-weather layer for privacy chart 01.

This is a derived visualization-planning layer, not a new source scrape. It
compresses existing privacy research into broad pre-1890 semantic periods so a
radial "weather" chart can show slow early semantic pressure without claiming
precision that the early sources do not support.
"""

from __future__ import annotations

import json
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
RESEARCH_DIR = ROOT / "docs" / "research" / "privacy"
PROCESSED_DIR = RESEARCH_DIR / "processed"
REPORTS_DIR = RESEARCH_DIR / "reports"
INDEX_PATH = RESEARCH_DIR / "privacy_research_index.json"
PREVIEW_PATH = ROOT / "src" / "data" / "generated" / "privacy_chart_data_preview.json"
GENERATED_PATH = ROOT / "src" / "data" / "generated" / "privacy_pre_modern_semantic_weather.json"

WORD = "privacy"
LAYER_ID = "pre_modern_semantic_weather"

FREQUENCY_PATH = PROCESSED_DIR / "privacy_frequency_terms_processed.json"
ETYMOLOGY_PATH = PROCESSED_DIR / "privacy_etymology_early_usage_processed.json"
TIMELINE_PATH = PROCESSED_DIR / "privacy_timeline_source_index_processed.json"
OUTPUT_PATH = PROCESSED_DIR / "privacy_pre_modern_semantic_weather_processed.json"
REPORT_JSON_PATH = REPORTS_DIR / "privacy_pre_modern_semantic_weather_data_report.json"
REPORT_MD_PATH = REPORTS_DIR / "privacy_pre_modern_semantic_weather_data_report.md"

PERIODS = [
    {
        "period_id": "root_field",
        "label": "Root Field",
        "start_year": 1200,
        "end_year": 1400,
        "angle_start_degrees": -92,
        "angle_end_degrees": -18,
        "interpretation": "Root-family evidence around private and privy before privacy is treated as a stable modern noun.",
        "data_basis": "etymology_only",
    },
    {
        "period_id": "seclusion_secret",
        "label": "Seclusion / Secret",
        "start_year": 1400,
        "end_year": 1600,
        "angle_start_degrees": -18,
        "angle_end_degrees": 72,
        "interpretation": "Privacy sits near private matter, privy knowledge, secrecy, and withdrawal from common view.",
        "data_basis": "etymology_plus_ngram",
    },
    {
        "period_id": "public_private",
        "label": "Public / Private",
        "start_year": 1600,
        "end_year": 1750,
        "angle_start_degrees": 72,
        "angle_end_degrees": 178,
        "interpretation": "The public/private contrast becomes a stronger organizing field than privacy as an independent legal word.",
        "data_basis": "ngram_with_caution",
    },
    {
        "period_id": "intrusion_threshold",
        "label": "Intrusion Begins",
        "start_year": 1750,
        "end_year": 1890,
        "angle_start_degrees": 178,
        "angle_end_degrees": 268,
        "interpretation": "Publicity, observation, and interference pressure rise toward the later legal-rights threshold.",
        "data_basis": "ngram_plus_timeline_anchor",
    },
]

TRACKS = [
    {
        "track_id": "seclusion_private_life",
        "label": "Seclusion and private life",
        "visual_role": "large_translucent_yellow_circles",
        "color": "#DDBE24",
        "terms": ["privacy", "private", "private life", "seclusion", "solitude", "isolation", "domestic privacy"],
    },
    {
        "track_id": "secrecy_confidentiality",
        "label": "Secrecy and confidential knowledge",
        "visual_role": "small_green_inner_circles",
        "color": "#5FA66B",
        "terms": ["privy", "secrecy", "secret", "confidentiality", "privately"],
    },
    {
        "track_id": "publicity_observation_pressure",
        "label": "Publicity and observation pressure",
        "visual_role": "purple_pressure_spikes",
        "color": "#6C4FA3",
        "terms": ["publicity", "surveillance", "right to privacy", "invasion of privacy", "privacy rights"],
        "context_terms": ["public"],
    },
]

TERM_MIN_YEAR = {
    "surveillance": 1750,
    "right to privacy": 1750,
    "invasion of privacy": 1750,
    "privacy rights": 1750,
}


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def read_json(path: Path, fallback: Any | None = None) -> Any:
    if not path.exists():
        return fallback
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def series_lookup(frequency: dict[str, Any]) -> dict[tuple[str, str], list[dict[str, Any]]]:
    lookup: dict[tuple[str, str], list[dict[str, Any]]] = {}
    for row in frequency.get("series", []):
        lookup[(str(row.get("term", "")).lower(), str(row.get("source", "")))] = row.get("values", [])
    return lookup


def mean_for_range(values: list[dict[str, Any]], start_year: int, end_year: int) -> float | None:
    points = [float(item.get("value") or 0.0) for item in values if start_year <= int(item.get("year", 0)) <= end_year]
    if not points:
        return None
    return sum(points) / len(points)


def etymology_counts(etymology: dict[str, Any], start_year: int, end_year: int, terms: list[str]) -> int:
    wanted = {term.lower() for term in terms}
    count = 0
    for item in etymology.get("earliest_candidates", []):
        year = item.get("year")
        term = str(item.get("term", "")).lower()
        if isinstance(year, int) and start_year <= year <= end_year and term in wanted:
            count += 1
    return count


def normalize_scores(period_track_rows: list[dict[str, Any]]) -> None:
    by_track: dict[str, float] = {}
    for row in period_track_rows:
        track_id = row["track_id"]
        by_track[track_id] = max(by_track.get(track_id, 0.0), row["raw_score"])
    for row in period_track_rows:
        max_score = by_track.get(row["track_id"], 0.0)
        row["normalized_score"] = round(row["raw_score"] / max_score, 6) if max_score > 0 else 0.0


def build_period_track_rows(frequency: dict[str, Any], etymology: dict[str, Any]) -> list[dict[str, Any]]:
    lookup = series_lookup(frequency)
    rows: list[dict[str, Any]] = []
    for period in PERIODS:
        for track in TRACKS:
            term_rows = []
            raw_score = 0.0
            evidence_count = etymology_counts(etymology, period["start_year"], period["end_year"], track["terms"])
            for term in track["terms"]:
                if period["end_year"] < TERM_MIN_YEAR.get(term, period["start_year"]):
                    continue
                values = lookup.get((term.lower(), "en"), [])
                mean_value = mean_for_range(values, max(period["start_year"], 1500), period["end_year"])
                if mean_value is None:
                    continue
                raw_score += mean_value
                term_rows.append(
                    {
                        "term": term,
                        "mean_frequency_per_million": round(mean_value, 8),
                    }
                )
            if period["data_basis"] == "etymology_only":
                raw_score = evidence_count
            else:
                raw_score += evidence_count * 0.25
            term_rows.sort(key=lambda item: item["mean_frequency_per_million"], reverse=True)
            rows.append(
                {
                    "period_id": period["period_id"],
                    "track_id": track["track_id"],
                    "raw_score": round(raw_score, 8),
                    "normalized_score": 0.0,
                    "evidence_count": evidence_count,
                    "top_terms": term_rows[:5],
                    "data_quality": "directional" if period["start_year"] < 1800 else "usable_with_caution",
                    "notes": (
                        "Pre-1800 Google Books Ngram values can be sparse or noisy; this score is for visual staging, not first-attestation proof."
                    ),
                }
            )
    normalize_scores(rows)
    return rows


def build_weather_points(period_track_rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    points = []
    radius_by_track = {
        "seclusion_private_life": 0.72,
        "secrecy_confidentiality": 0.54,
        "publicity_observation_pressure": 0.66,
    }
    jitter_offsets = [-0.16, -0.08, 0.0, 0.08, 0.16]
    periods_by_id = {period["period_id"]: period for period in PERIODS}
    for row in period_track_rows:
        period = periods_by_id[row["period_id"]]
        angle_mid = (period["angle_start_degrees"] + period["angle_end_degrees"]) / 2
        top_terms = row["top_terms"] or [{"term": row["track_id"], "mean_frequency_per_million": row["raw_score"]}]
        for index, term in enumerate(top_terms[:5]):
            points.append(
                {
                    "point_id": f"{row['period_id']}_{row['track_id']}_{index + 1}",
                    "period_id": row["period_id"],
                    "track_id": row["track_id"],
                    "term": term["term"],
                    "angle_degrees": round(angle_mid + jitter_offsets[index] * (period["angle_end_degrees"] - period["angle_start_degrees"]), 3),
                    "radius": round(radius_by_track[row["track_id"]] + (index % 2) * 0.035, 3),
                    "size": round(0.08 + row["normalized_score"] * 0.18 + index * 0.012, 4),
                    "opacity": round(0.28 + row["normalized_score"] * 0.42, 4),
                    "value": term.get("mean_frequency_per_million"),
                }
            )
    return points


def build_thresholds(timeline: dict[str, Any]) -> list[dict[str, Any]]:
    thresholds = []
    for anchor in timeline.get("anchors", []):
        if anchor.get("year") == 1890 or "Warren" in str(anchor.get("label", "")):
            thresholds.append(
                {
                    "year": anchor.get("year"),
                    "label": anchor.get("label"),
                    "category": anchor.get("category"),
                    "angle_degrees": 268,
                    "description": anchor.get("description"),
                    "confidence": anchor.get("confidence"),
                    "source": anchor.get("source"),
                    "source_url": anchor.get("source_url"),
                    "visual_role": "thin_threshold_mark",
                }
            )
    return thresholds


def build_phase_reading(period_track_rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    rows = []
    for period in PERIODS:
        period_rows = [row for row in period_track_rows if row["period_id"] == period["period_id"]]
        strongest = max(period_rows, key=lambda item: item["normalized_score"], default=None)
        rows.append(
            {
                "period_id": period["period_id"],
                "dominant_track_id": strongest["track_id"] if strongest else None,
                "dominant_score": strongest["normalized_score"] if strongest else 0,
                "reading": period["interpretation"],
            }
        )
    return rows


def build_processed() -> dict[str, Any]:
    frequency = read_json(FREQUENCY_PATH, {})
    etymology = read_json(ETYMOLOGY_PATH, {})
    timeline = read_json(TIMELINE_PATH, {})
    period_track_rows = build_period_track_rows(frequency, etymology)
    evidence_terms = Counter()
    for row in etymology.get("earliest_candidates", []):
        year = row.get("year")
        if isinstance(year, int) and year <= 1890:
            evidence_terms[str(row.get("term"))] += 1
    return {
        "word": WORD,
        "layer_id": LAYER_ID,
        "title": "Pre-modern semantic weather for privacy",
        "status": "derived_for_chart01_planning",
        "intended_use": "radial semantic-weather chart for privacy before strong legal and digital acceleration",
        "generated_at": utc_now(),
        "source_layers": [
            str(FREQUENCY_PATH.relative_to(ROOT)),
            str(ETYMOLOGY_PATH.relative_to(ROOT)),
            str(TIMELINE_PATH.relative_to(ROOT)),
        ],
        "visual_reference_interpretation": {
            "reference_logic": "circular time field with multiple simultaneous pressure variables",
            "privacy_translation": "early privacy is shown as a slow semantic climate: seclusion/private life, secrecy/confidentiality, and publicity/observation pressure.",
            "style_independence": "Use the site's poster structure but give privacy its own paper-like, translucent, radial field language.",
        },
        "periods": PERIODS,
        "tracks": TRACKS,
        "period_track_scores": period_track_rows,
        "weather_points": build_weather_points(period_track_rows),
        "thresholds": build_thresholds(timeline),
        "phase_reading": build_phase_reading(period_track_rows),
        "content_plan": {
            "hero_title": "privacy",
            "hero_tagline": "A word that moved from seclusion to rights, then into information.",
            "hero_terms": ["private life", "secrecy", "observation", "intrusion", "right to privacy"],
            "chart01_title": "Before Privacy Became a Right",
            "chart01_intro": "Before privacy became a legal or digital issue, it moved through older fields of seclusion, secrecy, private life, and freedom from observation.",
            "homepage_hover_label": "semantic weather",
            "recommended_hover_color": "hub-teal",
        },
        "evidence_summary": {
            "pre_1890_candidate_terms": [{"term": term, "count": count} for term, count in evidence_terms.most_common()],
            "earliest_privacy_candidate": next(
                (
                    item
                    for item in etymology.get("earliest_candidates", [])
                    if item.get("term") == "privacy" and isinstance(item.get("year"), int)
                ),
                None,
            ),
            "threshold_year": 1890,
        },
        "limitations": [
            "This layer is not a first-attestation layer.",
            "Pre-1800 Ngram values are treated as visual-directional signals because sparse early book data can create spikes.",
            "The 1890 marker is a legal-semantic threshold, not the origin of privacy as a word.",
            "The visual should show weak pre-modern change rather than claiming a sharp pre-industrial rupture.",
        ],
    }


def build_report(processed: dict[str, Any]) -> dict[str, Any]:
    return {
        "metadata": {
            "word": WORD,
            "layer_id": LAYER_ID,
            "generated_at": utc_now(),
            "generated_by_script": "scripts/process_privacy_pre_modern_semantic_weather.py",
        },
        "counts": {
            "period_count": len(processed["periods"]),
            "track_count": len(processed["tracks"]),
            "period_track_score_count": len(processed["period_track_scores"]),
            "weather_point_count": len(processed["weather_points"]),
            "threshold_count": len(processed["thresholds"]),
        },
        "content_plan": processed["content_plan"],
        "limitations": processed["limitations"],
    }


def build_markdown(processed: dict[str, Any], report: dict[str, Any]) -> str:
    period_lines = "\n".join(
        f"- {period['label']} ({period['start_year']}-{period['end_year']}): {period['interpretation']}"
        for period in processed["periods"]
    )
    track_lines = "\n".join(
        f"- {track['label']}: {', '.join(track['terms'])}"
        for track in processed["tracks"]
    )
    limitations = "\n".join(f"- {item}" for item in processed["limitations"])
    return f"""# Privacy Pre-Modern Semantic Weather Report

Generated: {report['metadata']['generated_at']}

## Purpose

This derived layer prepares Chart 01 for privacy. It translates the reference image into a privacy-specific structure: circular historical time, translucent semantic fields, and pressure spikes that show early change before the strong legal and digital accelerations.

## Periods

{period_lines}

## Tracks

{track_lines}

## Counts

- Periods: {report['counts']['period_count']}
- Tracks: {report['counts']['track_count']}
- Period-track scores: {report['counts']['period_track_score_count']}
- Weather points: {report['counts']['weather_point_count']}
- Threshold markers: {report['counts']['threshold_count']}

## Visual Direction

Use existing page structure, not existing page personality. Privacy should feel quieter, more translucent, and more atmospheric than the other word pages. The page can share the poster shell, nav, heading hierarchy, and section rhythm while giving Chart 01 its own radial paper-field language.

## Limitations

{limitations}
"""


def update_index(processed: dict[str, Any]) -> None:
    index = read_json(INDEX_PATH, {"word": WORD, "layers": []})
    index["word"] = WORD
    index["updated_at"] = utc_now()
    index.setdefault("layers", [])
    entry = {
        "layer_id": LAYER_ID,
        "processed_path": str(OUTPUT_PATH.relative_to(ROOT)),
        "report_path": str(REPORT_MD_PATH.relative_to(ROOT)),
        "status": "derived_for_chart01",
        "notes": f"{len(processed['periods'])} periods, {len(processed['tracks'])} semantic tracks, {len(processed['weather_points'])} radial weather points.",
    }
    for idx, row in enumerate(index["layers"]):
        if row.get("layer_id") == LAYER_ID:
            index["layers"][idx] = entry
            break
    else:
        index["layers"].append(entry)
    write_json(INDEX_PATH, index)


def update_preview(processed: dict[str, Any]) -> None:
    preview = read_json(PREVIEW_PATH, {})
    preview.setdefault("metadata", {})
    preview["metadata"].update({"word": WORD, "updated_at": utc_now()})
    preview["pre_modern_semantic_weather_layer"] = {
        "layer_id": LAYER_ID,
        "title": processed["title"],
        "generated_at": processed["generated_at"],
        "generated_by_script": "scripts/process_privacy_pre_modern_semantic_weather.py",
        "period_count": len(processed["periods"]),
        "track_count": len(processed["tracks"]),
        "weather_point_count": len(processed["weather_points"]),
        "threshold_count": len(processed["thresholds"]),
    }
    write_json(PREVIEW_PATH, preview)


def main() -> None:
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    processed = build_processed()
    report = build_report(processed)
    write_json(OUTPUT_PATH, processed)
    write_json(GENERATED_PATH, processed)
    write_json(REPORT_JSON_PATH, report)
    REPORT_MD_PATH.write_text(build_markdown(processed, report), encoding="utf-8")
    update_index(processed)
    update_preview(processed)
    print("Privacy pre-modern semantic weather summary")
    print(f"- Periods: {len(processed['periods'])}")
    print(f"- Tracks: {len(processed['tracks'])}")
    print(f"- Weather points: {len(processed['weather_points'])}")
    print(f"- Thresholds: {len(processed['thresholds'])}")
    print(f"- Output: {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
