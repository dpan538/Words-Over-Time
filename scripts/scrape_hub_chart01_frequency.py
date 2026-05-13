#!/usr/bin/env python3
"""Collect targeted semantic-frequency inputs for hub Chart 01.

This is not a broad scraping pass. It reuses the existing first-pass hub Ngram
outputs where possible and only attempts small cached Ngram requests for Chart
01 query gaps.
"""

from __future__ import annotations

import hashlib
import json
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
RESEARCH_DIR = ROOT / "docs" / "research" / "hub"
RAW_DIR = RESEARCH_DIR / "raw"
PROCESSED_DIR = RESEARCH_DIR / "processed"
CACHE_DIR = RAW_DIR / "chart01_frequency_cache"

START_YEAR = 1800
END_YEAR = 2022
CORPUS = "en"
CORPUS_LABEL = "English"
SMOOTHING = 0
CASE_INSENSITIVE = True
BATCH_SIZE = 8
REQUEST_DELAY_SECONDS = 0.35
NGRAM_ENDPOINT = "https://books.google.com/ngrams/json"
USER_AGENT = "WordsOverTime/0.1 hub chart01 frequency pass; contact: local research script"
CACHE_ONLY = "--cache-only" in sys.argv


SEMANTIC_GROUPS = {
    "total_background": {
        "label": "Total Background",
        "description": "General hub word-family background denominator, not a sense.",
        "queries": ["hub", "hubs"],
    },
    "mechanical_core": {
        "label": "Mechanical Core",
        "description": "Original or adjacent wheel/mechanical uses.",
        "queries": [
            "wheel hub",
            "hub of a wheel",
            "hub of the wheel",
            "wheel-hub",
            "axle hub",
            "front hub",
            "rear hub",
            "bicycle hub",
            "hubcap",
            "hub cap",
            "hub assembly",
        ],
    },
    "central_place": {
        "label": "Central Place",
        "description": "Metaphorical central-place usage.",
        "queries": [
            "hub of activity",
            "hub of commerce",
            "hub of trade",
            "hub of industry",
            "commercial hub",
            "social hub",
            "city hub",
            "urban hub",
        ],
    },
    "transport_routing": {
        "label": "Transport Routing",
        "description": "Transport, logistics, route transfer, and hub-and-spoke usage.",
        "queries": [
            "transport hub",
            "transit hub",
            "railway hub",
            "railroad hub",
            "airport hub",
            "airline hub",
            "shipping hub",
            "logistics hub",
            "regional hub",
            "global hub",
            "hub and spoke",
            "hub-and-spoke",
            "hub spoke",
            "hub spoke system",
        ],
    },
    "network_system": {
        "label": "Network System",
        "description": "Communication, computing, and network-node usage.",
        "queries": [
            "network hub",
            "communication hub",
            "hub node",
            "Ethernet hub",
            "internet hub",
            "telecom hub",
            "server hub",
            "USB hub",
            "switching hub",
        ],
    },
    "institutional_cluster": {
        "label": "Institutional Cluster",
        "description": "Business, knowledge, education, research, finance, innovation, and cultural concentration.",
        "queries": [
            "business hub",
            "financial hub",
            "education hub",
            "research hub",
            "knowledge hub",
            "innovation hub",
            "startup hub",
            "creative hub",
            "cultural hub",
        ],
    },
    "digital_platform": {
        "label": "Digital Platform",
        "description": "Web, platform, content, data, resource, and learning access-point usage.",
        "queries": [
            "digital hub",
            "content hub",
            "data hub",
            "resource hub",
            "learning hub",
            "media hub",
            "platform hub",
            "community hub",
            "online hub",
        ],
    },
}

RELATED_MECHANICAL_QUERIES = {"hubcap", "hub cap", "hub assembly"}
AMBIGUOUS_QUERIES = {
    "regional hub": "May be transport, economic, institutional, or broad-center.",
    "global hub": "May be transport, economic, institutional, or broad-center.",
    "community hub": "May be institutional, digital, or social-place.",
    "cultural hub": "May be central_place or institutional_cluster; assigned to institutional_cluster for this pass.",
}
SPECIAL_QUERY_NOTES = {
    "hub": "Background only, not a sense.",
    "hubs": "Background only, not a sense.",
    "hubcap": "Related mechanical compound; separated from core hub itself in quality flags.",
    "hub cap": "Related mechanical compound; separated from core hub itself in quality flags.",
    "USB hub": "Modern technical device/network-adjacent sense.",
    "data hub": "Digital/platform proxy; likely late and potentially noisy before modern usage.",
    "content hub": "Digital/content proxy; likely sparse before modern usage.",
}


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def slug(value: str) -> str:
    return re.sub(r"_+", "_", re.sub(r"[^a-z0-9]+", "_", value.lower())).strip("_")


def write_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def load_json(path: Path, fallback: Any | None = None) -> Any:
    if not path.exists():
        return fallback
    return json.loads(path.read_text(encoding="utf-8"))


def cache_path(prefix: str, url: str) -> Path:
    digest = hashlib.sha1(url.encode("utf-8")).hexdigest()[:16]
    return CACHE_DIR / f"{prefix}_{digest}.json"


def fetch_json(url: str, prefix: str, timeout: int = 25) -> dict[str, Any]:
    path = cache_path(prefix, url)
    log = {
        "url": url,
        "cache_path": str(path.relative_to(ROOT)),
        "from_cache": path.exists(),
        "ok": False,
        "status_code": None,
        "error": None,
    }
    if path.exists():
        try:
            payload = json.loads(path.read_text(encoding="utf-8"))
            log["ok"] = True
            return {"log": log, "payload": payload}
        except (OSError, json.JSONDecodeError) as exc:
            log["error"] = f"Cache read failed: {exc}"

    if CACHE_ONLY:
        log["error"] = "Cache-only mode: no cached response for this URL."
        return {"log": log, "payload": None}

    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT, "Accept": "application/json"})
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            data = response.read().decode("utf-8", errors="replace")
            payload = json.loads(data)
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(json.dumps(payload, ensure_ascii=False), encoding="utf-8")
            log.update({"ok": True, "status_code": getattr(response, "status", None), "from_cache": False})
            return {"log": log, "payload": payload}
    except urllib.error.HTTPError as exc:
        log.update({"status_code": exc.code, "error": f"HTTPError: {exc.code} {exc.reason}"})
    except urllib.error.URLError as exc:
        log["error"] = f"URLError: {exc.reason}"
    except TimeoutError as exc:
        log["error"] = f"TimeoutError: {exc}"
    except (OSError, json.JSONDecodeError) as exc:
        log["error"] = f"{type(exc).__name__}: {exc}"
    return {"log": log, "payload": None}


def all_query_specs() -> list[dict[str, Any]]:
    specs: list[dict[str, Any]] = []
    index = 1
    seen: set[tuple[str, str]] = set()
    for group, group_info in SEMANTIC_GROUPS.items():
        for query in group_info["queries"]:
            key = (group, query.lower())
            if key in seen:
                continue
            seen.add(key)
            specs.append(
                {
                    "query_id": f"hub_chart01_query_{index:03d}",
                    "query": query,
                    "semantic_group": group,
                    "semantic_group_label": group_info["label"],
                    "notes": query_note(query, group),
                }
            )
            index += 1
    return specs


def query_note(query: str, group: str) -> str:
    notes = []
    if query in SPECIAL_QUERY_NOTES:
        notes.append(SPECIAL_QUERY_NOTES[query])
    if query in AMBIGUOUS_QUERIES:
        notes.append(AMBIGUOUS_QUERIES[query])
    if group == "mechanical_core" and query in RELATED_MECHANICAL_QUERIES:
        notes.append("Mechanical-adjacent; do not let this dominate the core hub score.")
    return " ".join(notes)


def points_from_existing(series: dict[str, Any]) -> list[dict[str, Any]]:
    return [
        {
            "year": int(point["year"]),
            "value": float(point.get("value", 0.0)),
            "frequency_per_million": float(point.get("frequency_per_million", 0.0)),
        }
        for point in series.get("points", [])
    ]


def stats_for_points(points: list[dict[str, Any]]) -> dict[str, Any]:
    nonzero = [point for point in points if point["frequency_per_million"] > 0]
    if not points:
        return {
            "first_nonzero_year": None,
            "last_nonzero_year": None,
            "peak_year": None,
            "peak_frequency_per_million": 0.0,
            "nonzero_year_count": 0,
        }
    peak = max(points, key=lambda point: point["frequency_per_million"])
    return {
        "first_nonzero_year": nonzero[0]["year"] if nonzero else None,
        "last_nonzero_year": nonzero[-1]["year"] if nonzero else None,
        "peak_year": peak["year"],
        "peak_frequency_per_million": round(peak["frequency_per_million"], 8),
        "nonzero_year_count": len(nonzero),
    }


def ngram_url(terms: list[str]) -> str:
    params = {
        "content": ",".join(terms),
        "year_start": str(START_YEAR),
        "year_end": str(END_YEAR),
        "corpus": CORPUS,
        "smoothing": str(SMOOTHING),
        "case_insensitive": "true" if CASE_INSENSITIVE else "false",
    }
    return NGRAM_ENDPOINT + "?" + urllib.parse.urlencode(params)


def normalize_ngram_rows(rows: list[dict[str, Any]]) -> dict[str, list[dict[str, Any]]]:
    by_query: dict[str, list[dict[str, Any]]] = {}
    for row in rows:
        ngram = row.get("ngram", "")
        if CASE_INSENSITIVE and not ngram.endswith(" (All)"):
            continue
        query = ngram.removesuffix(" (All)")
        points = []
        for offset, value in enumerate(row.get("timeseries", [])):
            year = START_YEAR + offset
            points.append(
                {
                    "year": year,
                    "value": float(value),
                    "frequency_per_million": round(float(value) * 1_000_000, 8),
                }
            )
        by_query[query.lower()] = points
    return by_query


def collect_missing_ngram(missing_terms: list[str]) -> tuple[dict[str, list[dict[str, Any]]], list[dict[str, Any]]]:
    collected: dict[str, list[dict[str, Any]]] = {}
    logs: list[dict[str, Any]] = []
    for start in range(0, len(missing_terms), BATCH_SIZE):
        batch = missing_terms[start : start + BATCH_SIZE]
        url = ngram_url(batch)
        response = fetch_json(url, f"ngram_{slug('_'.join(batch))}")
        log = {
            "source": "Google Books Ngram Viewer",
            "source_type": "ngram",
            "queries": batch,
            "url": url,
            "status": "success" if response["log"]["ok"] else "failed",
            "failure_reason": response["log"].get("error") or "",
            "retrieved_at": utc_now(),
            "from_cache": response["log"].get("from_cache"),
        }
        if response["log"]["ok"] and isinstance(response["payload"], list):
            by_query = normalize_ngram_rows(response["payload"])
            collected.update(by_query)
            log["returned_queries"] = sorted(by_query.keys())
        logs.append(log)
        time.sleep(REQUEST_DELAY_SECONDS)
    return collected, logs


def build_search_visibility(query_specs: list[dict[str, Any]]) -> dict[str, Any]:
    phrase_series = load_json(PROCESSED_DIR / "hub_phrase_series.json", {"phrases": []})
    snippets = load_json(PROCESSED_DIR / "hub_snippet_samples.json", {"snippets": []})
    phrases_by_term = {item.get("phrase", "").lower(): item for item in phrase_series.get("phrases", [])}
    snippet_counts: Counter[str] = Counter(str(item.get("term_or_phrase", "")).lower() for item in snippets.get("snippets", []))
    records = []
    for spec in query_specs:
        key = spec["query"].lower()
        phrase = phrases_by_term.get(key)
        records.append(
            {
                "query_id": spec["query_id"],
                "query": spec["query"],
                "semantic_group": spec["semantic_group"],
                "source": "existing hub phrase/snippet cache",
                "source_type": "existing_cache",
                "search_result_count": None,
                "phrase_series_found": bool(phrase),
                "snippet_count": snippet_counts.get(key, 0),
                "approximate_frequency_signal": phrase.get("approximate_frequency_signal") if phrase else None,
                "status": "success" if phrase else "partial",
                "notes": "Supplementary visibility only; not a search-result count and not a corpus-frequency replacement.",
            }
        )
    return {
        "metadata": {
            "word": "hub",
            "generated_at": utc_now(),
            "generated_by_script": "scripts/scrape_hub_chart01_frequency.py",
            "purpose": "supplementary search visibility from existing local caches",
        },
        "records": records,
    }


def main() -> None:
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    CACHE_DIR.mkdir(parents=True, exist_ok=True)

    query_specs = all_query_specs()
    existing_frequency = load_json(PROCESSED_DIR / "hub_frequency_series.json", {"series": []})
    existing_by_term = {item.get("term", "").lower(): item for item in existing_frequency.get("series", [])}

    raw_records: list[dict[str, Any]] = []
    missing_terms: list[str] = []
    query_log: list[dict[str, Any]] = []

    for spec in query_specs:
        term_key = spec["query"].lower()
        existing = existing_by_term.get(term_key)
        if existing:
            points = points_from_existing(existing)
            raw_records.append(
                {
                    "query_id": spec["query_id"],
                    "query": spec["query"],
                    "semantic_group": spec["semantic_group"],
                    "source": "existing hub frequency cache",
                    "source_type": "existing_cache",
                    "case_sensitive": False,
                    "start_year": existing.get("year_start", START_YEAR),
                    "end_year": existing.get("year_end", END_YEAR),
                    "raw_series": points,
                    "raw_count": None,
                    "search_result_count": None,
                    "retrieved_at": existing_frequency.get("metadata", {}).get("generated_at"),
                    "status": "success" if points else "partial",
                    "failure_reason": "",
                    "stats": existing.get("stats") or stats_for_points(points),
                    "notes": (spec.get("notes") or existing.get("notes") or "").strip(),
                }
            )
            query_log.append(
                {
                    "query_id": spec["query_id"],
                    "query": spec["query"],
                    "semantic_group": spec["semantic_group"],
                    "action": "used_existing_cache",
                    "status": "success",
                    "source": "docs/research/hub/processed/hub_frequency_series.json",
                }
            )
        else:
            missing_terms.append(spec["query"])

    fetched, fetch_logs = collect_missing_ngram(missing_terms)
    query_log.extend(fetch_logs)
    spec_by_term = {spec["query"].lower(): spec for spec in query_specs}
    for term in missing_terms:
        spec = spec_by_term[term.lower()]
        points = fetched.get(term.lower(), [])
        status = "success" if points else ("skipped" if CACHE_ONLY else "failed")
        raw_records.append(
            {
                "query_id": spec["query_id"],
                "query": spec["query"],
                "semantic_group": spec["semantic_group"],
                "source": "Google Books Ngram Viewer",
                "source_type": "ngram",
                "case_sensitive": False,
                "start_year": START_YEAR,
                "end_year": END_YEAR,
                "raw_series": points,
                "raw_count": None,
                "search_result_count": None,
                "retrieved_at": utc_now(),
                "status": status,
                "failure_reason": "" if points else "No returned Ngram aggregate row for query or request failed.",
                "stats": stats_for_points(points),
                "notes": spec.get("notes", ""),
            }
        )

    search_visibility = build_search_visibility(query_specs)
    frequency_raw = {
        "metadata": {
            "word": "hub",
            "purpose": "chart01_semantic_frequency_layer",
            "generated_at": utc_now(),
            "generated_by_script": "scripts/scrape_hub_chart01_frequency.py",
            "source_summary": "Existing first-pass Google Books Ngram cache plus targeted gap Ngram queries.",
            "query_settings": {
                "year_start": START_YEAR,
                "year_end": END_YEAR,
                "corpus": CORPUS,
                "corpus_label": CORPUS_LABEL,
                "smoothing": SMOOTHING,
                "case_insensitive": CASE_INSENSITIVE,
                "batch_size": BATCH_SIZE,
            },
            "limitations": [
                "Ngram values are printed-book frequency signals, not semantic proof.",
                "Queries are semantic proxies and may contain ambiguous or mixed senses.",
                "Missing or sparse query rows are preserved with explicit status flags.",
            ],
        },
        "semantic_groups": SEMANTIC_GROUPS,
        "query_results": sorted(raw_records, key=lambda item: item["query_id"]),
    }
    query_log_payload = {
        "metadata": {
            "word": "hub",
            "generated_at": utc_now(),
            "generated_by_script": "scripts/scrape_hub_chart01_frequency.py",
            "cache_only": CACHE_ONLY,
        },
        "queries_attempted": len(query_specs),
        "existing_cache_hits": len(query_specs) - len(missing_terms),
        "targeted_ngram_queries": len(missing_terms),
        "log": query_log,
    }

    write_json(RAW_DIR / "hub_chart01_frequency_raw.json", frequency_raw)
    write_json(RAW_DIR / "hub_chart01_search_results_raw.json", search_visibility)
    write_json(RAW_DIR / "hub_chart01_query_log.json", query_log_payload)

    statuses = Counter(item["status"] for item in raw_records)
    print("Hub Chart 01 frequency scrape summary")
    print(f"- Semantic groups: {len(SEMANTIC_GROUPS)}")
    print(f"- Queries attempted: {len(query_specs)}")
    print(f"- Existing cache hits: {len(query_specs) - len(missing_terms)}")
    print(f"- Targeted Ngram gap queries: {len(missing_terms)}")
    print(f"- Successful / partial / failed / skipped: {statuses.get('success', 0)} / {statuses.get('partial', 0)} / {statuses.get('failed', 0)} / {statuses.get('skipped', 0)}")
    print(f"- Output paths: {RAW_DIR / 'hub_chart01_frequency_raw.json'}, {RAW_DIR / 'hub_chart01_search_results_raw.json'}, {RAW_DIR / 'hub_chart01_query_log.json'}")


if __name__ == "__main__":
    main()
