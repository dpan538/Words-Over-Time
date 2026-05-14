#!/usr/bin/env python3
"""Collect targeted routing/transfer inputs for hub Chart 02.

This is not a broad hub scrape. The script reuses existing hub frequency,
Chart 01 frequency, snippet, attestation, and timeline files first. It only
attempts small Google Books Ngram requests for routing-query gaps, and it
logs any unavailable source instead of failing the whole pass.
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
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
RESEARCH_DIR = ROOT / "docs" / "research" / "hub"
RAW_DIR = RESEARCH_DIR / "raw"
PROCESSED_DIR = RESEARCH_DIR / "processed"
CACHE_DIR = RAW_DIR / "chart02_routing_cache"

START_YEAR = 1800
END_YEAR = 2022
CORPUS = "en"
SMOOTHING = 0
CASE_INSENSITIVE = True
BATCH_SIZE = 8
REQUEST_DELAY_SECONDS = 0.35
NGRAM_ENDPOINT = "https://books.google.com/ngrams/json"
USER_AGENT = "WordsOverTime/0.1 hub chart02 routing pass; contact: local research script"
CACHE_ONLY = "--cache-only" in sys.argv


ROUTING_LAYERS: dict[str, dict[str, Any]] = {
    "rail_transit_route": {
        "label": "Rail / Transit Route",
        "summary": "Hub as a node in rail, transit, passenger, and urban route systems.",
        "queries": [
            {"query": "transport hub", "semantic_function": "transport routing node", "priority": "primary"},
            {"query": "transit hub", "semantic_function": "transit routing node", "priority": "primary"},
            {"query": "railway hub", "semantic_function": "rail route node", "priority": "primary"},
            {"query": "railroad hub", "semantic_function": "rail route node", "priority": "primary"},
            {"query": "rail hub", "semantic_function": "rail route node", "priority": "primary"},
            {"query": "bus hub", "semantic_function": "bus transfer node", "priority": "primary"},
            {"query": "metro hub", "semantic_function": "metro transfer node", "priority": "primary"},
            {"query": "urban transit hub", "semantic_function": "urban transit transfer node", "priority": "primary"},
            {"query": "route hub", "semantic_function": "route transfer node", "priority": "secondary"},
            {"query": "passenger hub", "semantic_function": "passenger transfer node", "priority": "secondary"},
            {"query": "intermodal hub", "semantic_function": "intermodal transfer node", "priority": "secondary"},
            {"query": "central station hub", "semantic_function": "station transfer node", "priority": "secondary"},
        ],
    },
    "air_logistics_route": {
        "label": "Air / Logistics Route",
        "summary": "Hub as a node in aviation, shipping, logistics, distribution, and supply-chain movement.",
        "queries": [
            {"query": "airport hub", "semantic_function": "air route node", "priority": "primary"},
            {"query": "airline hub", "semantic_function": "airline route node", "priority": "primary"},
            {"query": "air hub", "semantic_function": "air route node", "priority": "primary"},
            {"query": "shipping hub", "semantic_function": "shipping distribution node", "priority": "primary"},
            {"query": "logistics hub", "semantic_function": "logistics distribution node", "priority": "primary"},
            {"query": "distribution hub", "semantic_function": "distribution node", "priority": "primary"},
            {"query": "cargo hub", "semantic_function": "cargo transfer node", "priority": "primary"},
            {"query": "freight hub", "semantic_function": "freight transfer node", "priority": "primary"},
            {"query": "supply chain hub", "semantic_function": "supply-chain distribution node", "priority": "primary"},
            {"query": "regional hub", "semantic_function": "ambiguous regional routing or centrality term", "priority": "secondary"},
            {"query": "global hub", "semantic_function": "ambiguous global routing or centrality term", "priority": "secondary"},
            {"query": "international hub", "semantic_function": "ambiguous international routing or centrality term", "priority": "secondary"},
        ],
    },
    "hub_and_spoke_model": {
        "label": "Hub-and-Spoke Model",
        "summary": "Explicit model language that turns hub/spoke geometry into routing architecture.",
        "queries": [
            {"query": "hub and spoke", "semantic_function": "explicit routing model", "priority": "primary"},
            {"query": "hub-and-spoke", "semantic_function": "explicit routing model", "priority": "primary"},
            {"query": "hub and spokes", "semantic_function": "explicit routing model variant", "priority": "primary"},
            {"query": "hub-spoke", "semantic_function": "explicit routing model variant", "priority": "primary"},
            {"query": "spoke and hub", "semantic_function": "explicit routing model variant", "priority": "primary"},
            {"query": "spoke-hub", "semantic_function": "explicit routing model variant", "priority": "primary"},
            {"query": "hub-and-spoke system", "semantic_function": "explicit routing system", "priority": "primary"},
            {"query": "hub and spoke system", "semantic_function": "explicit routing system", "priority": "primary"},
            {"query": "hub-and-spoke network", "semantic_function": "explicit routing network", "priority": "primary"},
            {"query": "hub and spoke network", "semantic_function": "explicit routing network", "priority": "primary"},
            {"query": "hub-and-spoke model", "semantic_function": "explicit routing model", "priority": "primary"},
            {"query": "hub and spoke model", "semantic_function": "explicit routing model", "priority": "primary"},
        ],
    },
    "network_communication_route": {
        "label": "Network / Communication Route",
        "summary": "Hub as a node for signal, communication, computer-network, and data routing.",
        "queries": [
            {"query": "network hub", "semantic_function": "network node", "priority": "primary"},
            {"query": "communication hub", "semantic_function": "communication node", "priority": "primary"},
            {"query": "hub node", "semantic_function": "technical node", "priority": "primary"},
            {"query": "Ethernet hub", "semantic_function": "network device node", "priority": "primary"},
            {"query": "switching hub", "semantic_function": "network switching node", "priority": "primary"},
            {"query": "network switch hub", "semantic_function": "network switching node", "priority": "primary"},
            {"query": "telecom hub", "semantic_function": "telecommunication node", "priority": "primary"},
            {"query": "internet hub", "semantic_function": "internet routing or access node", "priority": "primary"},
            {"query": "data hub", "semantic_function": "data access or routing node", "priority": "primary"},
            {"query": "server hub", "semantic_function": "server access node", "priority": "secondary"},
            {"query": "USB hub", "semantic_function": "technical device adjacent to routing", "priority": "secondary"},
            {"query": "digital hub", "semantic_function": "digital access node", "priority": "secondary"},
            {"query": "platform hub", "semantic_function": "platform access node", "priority": "secondary"},
        ],
    },
    "institutional_route_language": {
        "label": "Institutional Route Language",
        "summary": "Access/distribution hub language in institutions and services; kept as a boundary layer.",
        "queries": [
            {"query": "service hub", "semantic_function": "service access or distribution node", "priority": "boundary"},
            {"query": "resource hub", "semantic_function": "resource access node", "priority": "boundary"},
            {"query": "knowledge hub", "semantic_function": "knowledge distribution node", "priority": "boundary"},
            {"query": "learning hub", "semantic_function": "learning access node", "priority": "boundary"},
            {"query": "business hub", "semantic_function": "business centrality or access node", "priority": "boundary"},
        ],
    },
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


def ngram_url(queries: list[str]) -> str:
    params = {
        "content": ",".join(queries),
        "year_start": START_YEAR,
        "year_end": END_YEAR,
        "corpus": CORPUS,
        "smoothing": SMOOTHING,
        "case_insensitive": "true" if CASE_INSENSITIVE else "false",
    }
    return f"{NGRAM_ENDPOINT}?{urllib.parse.urlencode(params)}"


def fetch_json(url: str, prefix: str, timeout: int = 18) -> dict[str, Any]:
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
    seen: set[str] = set()
    for layer_id, layer in ROUTING_LAYERS.items():
        for item in layer["queries"]:
            query = item["query"]
            if query.lower() in seen:
                continue
            seen.add(query.lower())
            specs.append(
                {
                    "query_id": f"hub_chart02_query_{index:03d}",
                    "query": query,
                    "routing_layer": layer_id,
                    "routing_layer_label": layer["label"],
                    "semantic_function": item["semantic_function"],
                    "priority": item["priority"],
                    "case_sensitive": False,
                }
            )
            index += 1
    return specs


def normalize_points(points: list[dict[str, Any]]) -> list[dict[str, Any]]:
    normalized = []
    for point in points:
        year = int(point["year"])
        value = float(point.get("frequency_per_million", point.get("value", 0.0)))
        normalized.append({"year": year, "value": value, "frequency_per_million": value})
    return normalized


def list_from_payload(payload: Any, key: str) -> list[dict[str, Any]]:
    if isinstance(payload, list):
        return payload
    if isinstance(payload, dict) and isinstance(payload.get(key), list):
        return payload[key]
    return []


def existing_frequency_index() -> dict[str, list[dict[str, Any]]]:
    index: dict[str, list[dict[str, Any]]] = {}

    first_pass = list_from_payload(load_json(PROCESSED_DIR / "hub_frequency_series.json", {}), "series")
    for row in first_pass:
        term = str(row.get("term", "")).lower()
        if term:
            index[term] = normalize_points(row.get("points", row.get("series", row.get("yearly_series", []))))

    chart01_raw = load_json(RAW_DIR / "hub_chart01_frequency_raw.json", {})
    for row in chart01_raw.get("query_results", []):
        term = str(row.get("query", "")).lower()
        if term and row.get("status") == "success":
            index.setdefault(term, normalize_points(row.get("raw_series", [])))

    return index


def normalize_ngram_rows(payload: Any, queries: list[str]) -> dict[str, list[dict[str, Any]]]:
    by_term: dict[str, list[dict[str, Any]]] = {query.lower(): [] for query in queries}
    if not isinstance(payload, list):
        return by_term
    for row in payload:
        ngram = str(row.get("ngram", ""))
        base = re.sub(r"\s+\(All\)$", "", ngram).lower()
        if base not in by_term:
            continue
        series = row.get("timeseries", [])
        by_term[base] = [
            {
                "year": START_YEAR + index,
                "value": float(value) * 1_000_000,
                "frequency_per_million": float(value) * 1_000_000,
            }
            for index, value in enumerate(series)
        ]
    return by_term


def empty_points() -> list[dict[str, Any]]:
    return [{"year": year, "value": 0.0, "frequency_per_million": 0.0} for year in range(START_YEAR, END_YEAR + 1)]


def collect_frequency_results() -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    specs = all_query_specs()
    existing = existing_frequency_index()
    first_pass_terms = {
        str(row.get("term", "")).lower()
        for row in list_from_payload(load_json(PROCESSED_DIR / "hub_frequency_series.json", {}), "series")
    }
    query_results: list[dict[str, Any]] = []
    logs: list[dict[str, Any]] = []
    missing: list[dict[str, Any]] = []
    retrieved_at = utc_now()

    for spec in specs:
        points = existing.get(spec["query"].lower())
        if points:
            source = "existing hub processed frequency" if spec["query"].lower() in first_pass_terms else "existing chart01 frequency cache"
            query_results.append(
                {
                    **spec,
                    "source": source,
                    "source_type": "existing_cache",
                    "start_year": START_YEAR,
                    "end_year": END_YEAR,
                    "raw_series": points,
                    "retrieved_at": retrieved_at,
                    "status": "success",
                    "failure_reason": "",
                    "notes": "Reused local hub frequency data; no new request made.",
                }
            )
        else:
            missing.append(spec)

    for start in range(0, len(missing), BATCH_SIZE):
        batch = missing[start : start + BATCH_SIZE]
        queries = [item["query"] for item in batch]
        url = ngram_url(queries)
        fetched = fetch_json(url, f"ngram_{slug('_'.join(queries))}")
        logs.append({"source": "google_books_ngram", "queries": queries, **fetched["log"]})
        series_by_query = normalize_ngram_rows(fetched["payload"], queries) if fetched["payload"] is not None else {}
        for spec in batch:
            points = series_by_query.get(spec["query"].lower(), [])
            status = "success" if points else "failed"
            query_results.append(
                {
                    **spec,
                    "source": "Google Books Ngram Viewer",
                    "source_type": "ngram",
                    "start_year": START_YEAR,
                    "end_year": END_YEAR,
                    "raw_series": points if points else empty_points(),
                    "retrieved_at": utc_now(),
                    "status": status,
                    "failure_reason": "" if points else (fetched["log"].get("error") or "No Ngram row returned for query."),
                    "notes": "Targeted Chart 02 Ngram gap request." if points else "No usable Ngram row; preserve as failed/sparse query.",
                }
            )
        if start + BATCH_SIZE < len(missing):
            time.sleep(REQUEST_DELAY_SECONDS)

    query_results.sort(key=lambda row: row["query_id"])
    return query_results, logs


def phrase_index() -> dict[str, dict[str, Any]]:
    rows = list_from_payload(load_json(PROCESSED_DIR / "hub_phrase_series.json", {}), "phrases")
    return {str(row.get("phrase", "")).lower(): row for row in rows}


def collect_existing_evidence() -> dict[str, Any]:
    snippets = list_from_payload(load_json(PROCESSED_DIR / "hub_snippet_samples.json", {}), "snippets")
    attestations = list_from_payload(load_json(PROCESSED_DIR / "hub_earliest_attestations.json", {}), "attestations")
    timeline = list_from_payload(load_json(PROCESSED_DIR / "hub_timeline_events.json", {}), "events")
    phrases = phrase_index()

    routing_terms = {spec["query"].lower() for spec in all_query_specs()}
    useful_supports = {"transport_logistics", "network_system", "digital_platform", "central_place"}
    evidence_candidates: list[dict[str, Any]] = []

    for row in snippets:
        term = str(row.get("term_or_phrase", "")).lower()
        category = row.get("semantic_category")
        text = row.get("text_snippet", "")
        supports_routing = any(word in text.lower() for word in ["route", "routed", "traffic", "transport", "network", "connection", "distribution", "flows"])
        if term in routing_terms or category in useful_supports:
            evidence_candidates.append(
                {
                    "source_layer": "first_pass_snippet_samples",
                    "source_id": row.get("snippet_id"),
                    "term": row.get("term_or_phrase"),
                    "year": row.get("year"),
                    "source_title": row.get("source_title"),
                    "source_author": row.get("source_author"),
                    "source_date": row.get("year"),
                    "source_url": row.get("source_url"),
                    "source_type": row.get("source_type"),
                    "evidence_text_short": text,
                    "context_summary": row.get("notes", ""),
                    "semantic_category": category,
                    "supports_routing_context": supports_routing,
                    "confidence": row.get("confidence", "medium"),
                    "limitations": "Existing first-pass snippet; not newly scraped for Chart 02.",
                }
            )

    for row in attestations:
        term = str(row.get("term", "")).lower()
        if term in routing_terms or row.get("sense_id") in {"transport_logistics", "network_system", "digital_platform"}:
            evidence_candidates.append(
                {
                    "source_layer": "second_pass_attestation_layer",
                    "source_id": row.get("id"),
                    "term": row.get("term"),
                    "year": row.get("evidence_year") or row.get("claimed_year"),
                    "source_title": row.get("source_title"),
                    "source_author": row.get("source_author"),
                    "source_date": row.get("source_date"),
                    "source_url": row.get("source_url"),
                    "source_type": row.get("source_type"),
                    "evidence_text_short": row.get("evidence_text_short", ""),
                    "context_summary": row.get("definition_or_context_summary", ""),
                    "semantic_category": row.get("sense_id"),
                    "supports_routing_context": row.get("sense_id") in {"transport_logistics", "network_system"},
                    "confidence": row.get("confidence", "medium"),
                    "limitations": row.get("reliability_notes", ""),
                }
            )

    for row in timeline:
        term = str(row.get("term", "")).lower()
        if term in routing_terms or row.get("semantic_category") in {"transport_logistics", "network_system", "digital_platform"}:
            evidence_candidates.append(
                {
                    "source_layer": "first_pass_timeline_scaffold",
                    "source_id": row.get("id"),
                    "term": row.get("term"),
                    "year": row.get("year") or row.get("approximate_year"),
                    "source_title": row.get("label"),
                    "source_author": "",
                    "source_date": row.get("year") or row.get("approximate_year"),
                    "source_url": "",
                    "source_type": "corpus",
                    "evidence_text_short": row.get("description", ""),
                    "context_summary": row.get("notes", ""),
                    "semantic_category": row.get("semantic_category"),
                    "supports_routing_context": row.get("semantic_category") in {"transport_logistics", "network_system"},
                    "confidence": row.get("confidence", "medium"),
                    "limitations": "Timeline event is a scaffold; Ngram signals are not first attestations.",
                }
            )

    source_statuses = [
        {
            "source": "existing hub_frequency_series.json",
            "status": "used",
            "notes": "Primary local frequency source for already collected terms.",
        },
        {
            "source": "existing Chart 01 frequency raw",
            "status": "used",
            "notes": "Secondary local cache for network/device and digital query terms.",
        },
        {
            "source": "Google Books Ngram Viewer",
            "status": "targeted_gap_attempted",
            "notes": "Only queried missing routing terms in small batches; failures are logged.",
        },
        {
            "source": "Internet Archive / LOC / dictionary raw layers",
            "status": "reused_from_previous_passes",
            "notes": "No broad new archive scrape was performed.",
        },
    ]

    return {
        "metadata": {
            "word": "hub",
            "purpose": "chart02_transfer_model_evidence_raw",
            "generated_at": utc_now(),
            "generated_by_script": "scripts/scrape_hub_chart02_routing.py",
        },
        "source_statuses": source_statuses,
        "candidate_evidence": evidence_candidates,
        "phrase_candidates_available": [
            {"term": term, "phrase_record": phrases[term]}
            for term in sorted(routing_terms)
            if term in phrases
        ],
        "notes": [
            "Evidence candidates are intentionally filtered toward transfer/routing contexts.",
            "Ngram and phrase records are frequency signals, not historical first attestations.",
        ],
    }


def main() -> None:
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    CACHE_DIR.mkdir(parents=True, exist_ok=True)

    query_results, request_logs = collect_frequency_results()
    raw_frequency = {
        "metadata": {
            "word": "hub",
            "chart_id": "chart_02",
            "working_title": "The Transfer Model",
            "generated_at": utc_now(),
            "generated_by_script": "scripts/scrape_hub_chart02_routing.py",
            "source_summary": [
                "Existing first-pass hub Ngram frequency series.",
                "Existing Chart 01 semantic-frequency raw data.",
                "Targeted Google Books Ngram requests for missing routing terms where available.",
            ],
            "limitations": [
                "Google Books Ngram series begins at 1800 and ends at 2022.",
                "Ngram values are printed-book frequency proxies, not direct semantic proof.",
                "Search-result counts are not used as exact frequency.",
                "Missing or failed query terms are retained with status and failure notes.",
            ],
        },
        "routing_layers": ROUTING_LAYERS,
        "query_results": query_results,
    }

    evidence_raw = collect_existing_evidence()
    source_raw = {
        "metadata": {
            "word": "hub",
            "chart_id": "chart_02",
            "generated_at": utc_now(),
            "generated_by_script": "scripts/scrape_hub_chart02_routing.py",
        },
        "routing_layers": ROUTING_LAYERS,
        "local_sources_used": [
            "docs/research/hub/processed/hub_frequency_series.json",
            "docs/research/hub/raw/hub_chart01_frequency_raw.json",
            "docs/research/hub/processed/hub_snippet_samples.json",
            "docs/research/hub/processed/hub_earliest_attestations.json",
            "docs/research/hub/processed/hub_timeline_events.json",
            "docs/research/hub/processed/hub_phrase_series.json",
        ],
        "external_source_policy": [
            "Only small targeted Ngram gap requests were attempted.",
            "No broad Internet Archive, LOC, or Google Books scraping was performed in this pass.",
        ],
        "source_statuses": evidence_raw["source_statuses"],
    }

    query_log = {
        "metadata": {
            "word": "hub",
            "chart_id": "chart_02",
            "generated_at": utc_now(),
            "generated_by_script": "scripts/scrape_hub_chart02_routing.py",
        },
        "query_count": len(query_results),
        "status_counts": {
            status: sum(1 for row in query_results if row["status"] == status)
            for status in sorted({row["status"] for row in query_results})
        },
        "request_logs": request_logs,
        "query_statuses": [
            {
                "query_id": row["query_id"],
                "query": row["query"],
                "routing_layer": row["routing_layer"],
                "status": row["status"],
                "source_type": row["source_type"],
                "failure_reason": row["failure_reason"],
                "notes": row["notes"],
            }
            for row in query_results
        ],
    }

    write_json(RAW_DIR / "hub_chart02_routing_frequency_raw.json", raw_frequency)
    write_json(RAW_DIR / "hub_chart02_routing_evidence_raw.json", evidence_raw)
    write_json(RAW_DIR / "hub_chart02_transfer_model_sources_raw.json", source_raw)
    write_json(RAW_DIR / "hub_chart02_query_log.json", query_log)

    print("hub chart02 routing scrape complete")
    print(f"routing layers: {len(ROUTING_LAYERS)}")
    print(f"queries attempted: {len(query_results)}")
    print(f"status counts: {query_log['status_counts']}")
    print(f"evidence candidates: {len(evidence_raw['candidate_evidence'])}")
    print("outputs:")
    for path in [
        RAW_DIR / "hub_chart02_routing_frequency_raw.json",
        RAW_DIR / "hub_chart02_routing_evidence_raw.json",
        RAW_DIR / "hub_chart02_transfer_model_sources_raw.json",
        RAW_DIR / "hub_chart02_query_log.json",
    ]:
        print(f"- {path.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
