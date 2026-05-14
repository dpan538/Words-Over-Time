#!/usr/bin/env python3
"""Recover and triage hub Chart 02 routing data gaps.

This pass does not replace the first Chart 02 routing layer. It inspects the
previous outputs, searches local project data first, then makes small targeted
retry attempts for failed high/medium priority Ngram gaps and public archive
searches when network access is available.
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
CACHE_DIR = RAW_DIR / "chart02_recovery_cache"

START_YEAR = 1800
END_YEAR = 2022
NGRAM_ENDPOINT = "https://books.google.com/ngrams/json"
IA_ADVANCED_SEARCH = "https://archive.org/advancedsearch.php"
USER_AGENT = "WordsOverTime/0.1 hub chart02 recovery pass; contact: local research script"
BATCH_SIZE = 8
REQUEST_DELAY_SECONDS = 0.4
CACHE_ONLY = "--cache-only" in sys.argv

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

HIGH_PRIORITY = {
    "hub-and-spoke system",
    "hub and spoke system",
    "hub-and-spoke network",
    "hub and spoke network",
    "hub-and-spoke model",
    "hub and spoke model",
    "transport hub",
    "transit hub",
    "logistics hub",
    "distribution hub",
    "network hub",
    "communication hub",
    "switching hub",
    "Ethernet hub",
}
MEDIUM_PRIORITY = {
    "railway hub",
    "railroad hub",
    "airport hub",
    "airline hub",
    "cargo hub",
    "freight hub",
    "supply chain hub",
    "intermodal hub",
    "hub node",
    "telecom hub",
    "data hub",
}
LOW_PRIORITY = {
    "regional hub",
    "global hub",
    "international hub",
    "service hub",
    "resource hub",
    "digital hub",
    "platform hub",
    "USB hub",
    "server hub",
}
DROP_TERMS = {"hub spoke system", "hub-spoke", "spoke-hub", "spoke and hub", "hub and spokes", "network switch hub"}
ARCHIVE_TARGETS = [
    "hub and spoke system",
    "hub-and-spoke",
    "hub and spoke network",
    "hub-and-spoke network",
    "hub and spoke model",
    "transport hub",
    "logistics hub",
    "distribution hub",
    "network hub",
    "communication hub",
    "switching hub",
    "Ethernet hub",
    "airline hub",
    "airport hub",
]


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def write_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def load_json(path: Path, fallback: Any | None = None) -> Any:
    if not path.exists():
        return fallback
    return json.loads(path.read_text(encoding="utf-8"))


def list_from_payload(payload: Any, key: str) -> list[dict[str, Any]]:
    if isinstance(payload, list):
        return payload
    if isinstance(payload, dict) and isinstance(payload.get(key), list):
        return payload[key]
    return []


def slug(value: str) -> str:
    return re.sub(r"_+", "_", re.sub(r"[^a-z0-9]+", "_", value.lower())).strip("_")


def cache_path(prefix: str, url: str) -> Path:
    digest = hashlib.sha1(url.encode("utf-8")).hexdigest()[:16]
    return CACHE_DIR / f"{prefix}_{digest}.json"


def fetch_json(url: str, prefix: str, timeout: int = 16) -> dict[str, Any]:
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
            payload = json.loads(response.read().decode("utf-8", errors="replace"))
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


def empty_series() -> list[dict[str, Any]]:
    return [{"year": year, "value": 0.0, "frequency_per_million": 0.0} for year in range(START_YEAR, END_YEAR + 1)]


def normalize_points(points: list[dict[str, Any]]) -> list[dict[str, Any]]:
    normalized = []
    for point in points:
        year = int(point["year"])
        value = float(point.get("frequency_per_million", point.get("value", 0.0)))
        normalized.append({"year": year, "value": value, "frequency_per_million": value})
    return normalized


def normalize_ngram_payload(payload: Any, year_start: int = START_YEAR) -> dict[str, list[dict[str, Any]]]:
    output: dict[str, list[dict[str, Any]]] = {}
    if not isinstance(payload, list):
        return output
    for row in payload:
        ngram = str(row.get("ngram", ""))
        term = re.sub(r"\s+\(All\)$", "", ngram).lower()
        series = row.get("timeseries", [])
        if term and isinstance(series, list):
            output[term] = [
                {"year": year_start + index, "value": float(value) * 1_000_000, "frequency_per_million": float(value) * 1_000_000}
                for index, value in enumerate(series)
            ]
    return output


def ngram_url(queries: list[str]) -> str:
    params = {
        "content": ",".join(queries),
        "year_start": START_YEAR,
        "year_end": END_YEAR,
        "corpus": "en",
        "smoothing": 0,
        "case_insensitive": "true",
    }
    return f"{NGRAM_ENDPOINT}?{urllib.parse.urlencode(params)}"


def ia_search_url(query: str) -> str:
    params = {
        "q": f'title:("{query}") OR "{query}"',
        "fl[]": ["identifier", "title", "date", "creator", "mediatype", "year"],
        "rows": 5,
        "page": 1,
        "output": "json",
    }
    return f"{IA_ADVANCED_SEARCH}?{urllib.parse.urlencode(params, doseq=True)}"


def period_summary(series: list[dict[str, Any]]) -> list[dict[str, Any]]:
    by_year = {int(point["year"]): float(point.get("frequency_per_million", 0.0)) for point in series}
    rows = []
    for period in PERIODS:
        years = [year for year in by_year if period["start_year"] <= year <= period["end_year"]]
        values = [by_year[year] for year in years]
        rows.append(
            {
                "period_id": period["period_id"],
                "period_label": period["label"],
                "mean_frequency_per_million": round(sum(values) / len(values), 10) if values else 0.0,
                "max_frequency_per_million": round(max(values), 10) if values else 0.0,
                "active_year_count": sum(1 for value in values if value > 0),
                "notes": "Effective early bucket is 1800-1849." if period["period_id"] == "p1_pre_1850" else "",
            }
        )
    return rows


def source_indexes() -> dict[str, dict[str, Any]]:
    indexes: dict[str, dict[str, Any]] = {
        "first_pass_reuse": {},
        "chart01_reuse": {},
        "chart01_semantic_reuse": {},
        "ngram_cache_reuse": {},
        "phrase_metadata": {},
    }

    for row in list_from_payload(load_json(PROCESSED_DIR / "hub_frequency_series.json", {}), "series"):
        term = str(row.get("term", "")).lower()
        points = row.get("points", row.get("series", row.get("yearly_series", [])))
        if term and points:
            indexes["first_pass_reuse"][term] = normalize_points(points)

    chart01_raw = load_json(RAW_DIR / "hub_chart01_frequency_raw.json", {})
    for row in chart01_raw.get("query_results", []):
        term = str(row.get("query", "")).lower()
        if term and row.get("status") == "success":
            indexes["chart01_reuse"][term] = normalize_points(row.get("raw_series", []))

    chart01_series = load_json(PROCESSED_DIR / "hub_chart01_semantic_frequency_series.json", {})
    query_values_by_term: dict[str, list[dict[str, Any]]] = {}
    for group in chart01_series.get("groups", []):
        for row in group.get("yearly_series", []):
            year = int(row["year"])
            for query, value in row.get("query_values", {}).items():
                query_values_by_term.setdefault(query.lower(), []).append(
                    {"year": year, "value": float(value), "frequency_per_million": float(value)}
                )
    indexes["chart01_semantic_reuse"] = query_values_by_term

    for row in list_from_payload(load_json(PROCESSED_DIR / "hub_phrase_series.json", {}), "phrases"):
        phrase = str(row.get("phrase", "")).lower()
        if phrase:
            indexes["phrase_metadata"][phrase] = row

    for cache_root in [RAW_DIR / "chart01_frequency_cache", RAW_DIR / "chart02_routing_cache", RAW_DIR / "cache"]:
        if not cache_root.exists():
            continue
        for path in cache_root.glob("*.json"):
            try:
                payload = json.loads(path.read_text(encoding="utf-8"))
            except (OSError, json.JSONDecodeError, UnicodeDecodeError):
                continue
            for term, series in normalize_ngram_payload(payload).items():
                indexes["ngram_cache_reuse"].setdefault(term, series)

    return indexes


def lookup_series(query: str, indexes: dict[str, dict[str, Any]]) -> tuple[str | None, list[dict[str, Any]] | None]:
    key = query.lower()
    for source in ["first_pass_reuse", "chart01_reuse", "chart01_semantic_reuse", "ngram_cache_reuse"]:
        if key in indexes[source]:
            return source, indexes[source][key]
    return None, None


def priority_for_query(query: str) -> str:
    if query in HIGH_PRIORITY:
        return "high"
    if query in MEDIUM_PRIORITY:
        return "medium"
    if query in LOW_PRIORITY:
        return "low"
    if query in DROP_TERMS:
        return "drop"
    return "low"


def triage_for_query(row: dict[str, Any], indexes: dict[str, dict[str, Any]], has_evidence: bool) -> tuple[str, str, str]:
    query = row["query"]
    if row["previous_status"] == "success":
        return "already_available", "low", "Already available from previous Chart 02 pass."
    source, _ = lookup_series(query, indexes)
    if source:
        return "recover_from_existing_data", priority_for_query(query), f"Recover frequency from {source}."
    if query in DROP_TERMS:
        return "drop_or_exclude", "drop", "Malformed, reversed, or redundant variant with no current evidence need."
    if query in {"regional hub", "global hub", "international hub", "service hub"}:
        return "ambiguous_or_noisy", "low", "Ambiguous without context; do not use as routing frequency evidence."
    if priority_for_query(query) in {"high", "medium"}:
        return "retry_frequency", priority_for_query(query), "Network/cache failure only; retry a targeted Ngram request if possible."
    if has_evidence:
        return "evidence_only", "low", "Keep as annotation/evidence term if context supports routing."
    return "evidence_only", "low", "Frequency is not essential; retain only if later evidence supports it."


def build_inventory(indexes: dict[str, dict[str, Any]]) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    raw_frequency = load_json(RAW_DIR / "hub_chart02_routing_frequency_raw.json", {})
    flags = {row["query"]: row for row in load_json(PROCESSED_DIR / "hub_chart02_routing_quality_flags.json", {}).get("flags", [])}
    evidence_terms = {
        str(row.get("term", "")).lower()
        for row in load_json(PROCESSED_DIR / "hub_chart02_transfer_model_evidence.json", {}).get("evidence_items", [])
    }
    inventory = []
    failed_triage = []
    for record in raw_frequency.get("query_results", []):
        query = record["query"]
        source, _ = lookup_series(query, indexes)
        has_evidence = query.lower() in evidence_terms
        base = {
            "query": query,
            "routing_layer": record["routing_layer"],
            "previous_status": record.get("status", ""),
            "previous_recommended_use": flags.get(query, {}).get("recommended_use", ""),
            "failure_reason": record.get("failure_reason", ""),
            "has_chart01_data": query.lower() in indexes["chart01_reuse"] or query.lower() in indexes["chart01_semantic_reuse"],
            "has_first_pass_data": query.lower() in indexes["first_pass_reuse"] or query.lower() in indexes["phrase_metadata"],
            "has_evidence_item": has_evidence,
            "local_recovery_source": source,
        }
        triage, priority, reason = triage_for_query(base, indexes, has_evidence)
        item = {
            **base,
            "recovery_priority": priority,
            "recovery_reason": reason,
        }
        inventory.append(item)
        if base["previous_status"] == "failed":
            failed_triage.append(
                {
                    "query": query,
                    "routing_layer": record["routing_layer"],
                    "previous_failure_reason": record.get("failure_reason", ""),
                    "triage_category": triage,
                    "recovery_priority": priority,
                    "recommended_action": reason,
                    "notes": "Frequency recovery is attempted only for high/medium retry_frequency terms.",
                }
            )
    return inventory, failed_triage


def retry_ngram(triage_rows: list[dict[str, Any]]) -> tuple[dict[str, list[dict[str, Any]]], list[dict[str, Any]]]:
    retry_terms = [
        row["query"]
        for row in triage_rows
        if row["triage_category"] == "retry_frequency" and row["recovery_priority"] in {"high", "medium"}
    ]
    recovered: dict[str, list[dict[str, Any]]] = {}
    logs: list[dict[str, Any]] = []
    for start in range(0, len(retry_terms), BATCH_SIZE):
        batch = retry_terms[start : start + BATCH_SIZE]
        url = ngram_url(batch)
        fetched = fetch_json(url, f"ngram_retry_{slug('_'.join(batch))}")
        logs.append({"source": "google_books_ngram_retry", "queries": batch, **fetched["log"]})
        if fetched["payload"] is not None:
            recovered.update(normalize_ngram_payload(fetched["payload"]))
        if start + BATCH_SIZE < len(retry_terms):
            time.sleep(REQUEST_DELAY_SECONDS)
    return recovered, logs


def build_recovered_frequency(inventory: list[dict[str, Any]], triage_rows: list[dict[str, Any]], indexes: dict[str, dict[str, Any]]) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    retry_series, retry_logs = retry_ngram(triage_rows)
    triage_by_query = {row["query"]: row for row in triage_rows}
    previous_records = {
        row["query"]: row
        for row in load_json(RAW_DIR / "hub_chart02_routing_frequency_raw.json", {}).get("query_results", [])
    }
    recovered_items = []

    for item in inventory:
        query = item["query"]
        previous = previous_records.get(query, {})
        source, series = lookup_series(query, indexes)
        status = "already_available" if item["previous_status"] == "success" else "failed_again"
        source_label = "previous_chart02"
        notes = "Carried forward from previous Chart 02 pass."

        if item["previous_status"] == "success":
            series = normalize_points(previous.get("raw_series", []))
        elif series:
            status = "recovered"
            source_label = source or "existing_cache"
            notes = f"Recovered from local {source_label}."
        elif query.lower() in retry_series:
            series = retry_series[query.lower()]
            status = "recovered"
            source_label = "ngram_retry"
            notes = "Recovered through targeted Ngram retry."
        else:
            triage = triage_by_query.get(query, {})
            series = empty_series()
            if triage.get("triage_category") == "evidence_only":
                status = "evidence_only"
                source_label = "none"
                notes = "Frequency unavailable; keep only as evidence/annotation candidate."
            elif triage.get("triage_category") == "drop_or_exclude":
                status = "dropped"
                source_label = "none"
                notes = "Dropped or excluded after triage."
            elif triage.get("triage_category") == "ambiguous_or_noisy":
                status = "evidence_only"
                source_label = "none"
                notes = "Ambiguous/noisy without context; not recovered as frequency series."
            else:
                status = "failed_again"
                source_label = "ngram_retry"
                notes = "Targeted retry did not recover a usable series."

        recovered_items.append(
            {
                "query": query,
                "routing_layer": item["routing_layer"],
                "source": source_label,
                "status": status,
                "year_start": START_YEAR,
                "year_end": END_YEAR,
                "series": series,
                "period_summary": period_summary(series),
                "notes": notes,
            }
        )
    return recovered_items, retry_logs


def snippet_around(text: str, term: str, radius: int = 140) -> str:
    match = re.search(re.escape(term), text, flags=re.IGNORECASE)
    if not match:
        return ""
    start = max(0, match.start() - radius)
    end = min(len(text), match.end() + radius)
    snippet = re.sub(r"\s+", " ", text[start:end]).strip()
    return snippet[:320]


def year_from_text(value: str) -> int | None:
    matches = re.findall(r"\b(18\d{2}|19\d{2}|20\d{2})\b", value)
    return int(matches[0]) if matches else None


def local_cache_evidence_candidates() -> list[dict[str, Any]]:
    candidates = []
    roots = [RAW_DIR / "cache", RAW_DIR / "etymology_cache", RAW_DIR / "evidence_strengthening_cache"]
    for root in roots:
        if not root.exists():
            continue
        for path in root.glob("*"):
            if path.suffix.lower() not in {".txt", ".json", ".html"}:
                continue
            try:
                text = path.read_text(encoding="utf-8", errors="replace")
            except OSError:
                continue
            lower = text.lower()
            for term in ARCHIVE_TARGETS:
                if term.lower() not in lower:
                    continue
                snippet = snippet_around(text, term)
                if not snippet:
                    continue
                year = year_from_text(path.name) or year_from_text(snippet)
                candidates.append(
                    {
                        "term": term,
                        "source": "local_archive_cache",
                        "source_path": str(path.relative_to(ROOT)),
                        "year": year,
                        "evidence_text_short": snippet,
                        "status": "candidate",
                        "notes": "Recovered from existing local raw/cache file; source image or full metadata should be checked before final copy.",
                    }
                )
    return candidates


def archive_searches() -> list[dict[str, Any]]:
    rows = []
    for query in ARCHIVE_TARGETS:
        url = ia_search_url(query)
        fetched = fetch_json(url, f"ia_search_{slug(query)}")
        docs = []
        if fetched["payload"]:
            docs = fetched["payload"].get("response", {}).get("docs", [])[:5]
        rows.append(
            {
                "query": query,
                "source": "internet_archive",
                "search_url_or_api": url,
                "results_checked": len(docs),
                "promising_results": len(docs),
                "evidence_items_created": [],
                "status": "success" if fetched["log"]["ok"] else "failed",
                "failure_reason": fetched["log"].get("error") or "",
                "results": docs,
                "notes": "Metadata search only; no large files downloaded.",
            }
        )
        time.sleep(REQUEST_DELAY_SECONDS)
    return rows


def main() -> None:
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    indexes = source_indexes()
    inventory, failed_triage = build_inventory(indexes)
    recovered_items, retry_logs = build_recovered_frequency(inventory, failed_triage, indexes)
    archive_rows = archive_searches()
    local_evidence = local_cache_evidence_candidates()
    previous_evidence = load_json(PROCESSED_DIR / "hub_chart02_transfer_model_evidence.json", {})

    write_json(
        RAW_DIR / "hub_chart02_recovery_query_inventory_raw.json",
        {
            "metadata": {
                "word": "hub",
                "chart_id": "chart_02",
                "pass": "data_recovery",
                "generated_at": utc_now(),
                "generated_by_script": "scripts/recover_hub_chart02_routing_data.py",
            },
            "inventory": inventory,
        },
    )
    write_json(
        RAW_DIR / "hub_chart02_recovered_frequency_raw.json",
        {
            "metadata": {
                "word": "hub",
                "chart_id": "chart_02",
                "generated_at": utc_now(),
                "generated_by_script": "scripts/recover_hub_chart02_routing_data.py",
                "notes": [
                    "Previous successful Chart 02 series are carried forward.",
                    "Failed terms are recovered only from existing local data or targeted Ngram retry.",
                    "No missing values are invented.",
                ],
            },
            "recovered_frequency_items": recovered_items,
            "ngram_retry_logs": retry_logs,
        },
    )
    write_json(
        RAW_DIR / "hub_chart02_recovered_evidence_raw.json",
        {
            "metadata": {
                "word": "hub",
                "chart_id": "chart_02",
                "generated_at": utc_now(),
                "generated_by_script": "scripts/recover_hub_chart02_routing_data.py",
            },
            "previous_evidence": previous_evidence.get("evidence_items", []),
            "local_cache_evidence_candidates": local_evidence,
            "notes": [
                "Local cache candidates are not automatically high-confidence.",
                "Processing decides whether items are carried forward, upgraded, downgraded, retained, or excluded.",
            ],
        },
    )
    write_json(
        RAW_DIR / "hub_chart02_archive_search_raw.json",
        {
            "metadata": {
                "word": "hub",
                "chart_id": "chart_02",
                "generated_at": utc_now(),
                "generated_by_script": "scripts/recover_hub_chart02_routing_data.py",
            },
            "archive_searches": archive_rows,
        },
    )
    write_json(
        RAW_DIR / "hub_chart02_recovery_log.json",
        {
            "metadata": {
                "word": "hub",
                "chart_id": "chart_02",
                "generated_at": utc_now(),
                "generated_by_script": "scripts/recover_hub_chart02_routing_data.py",
            },
            "previous_failed_queries": sum(1 for item in inventory if item["previous_status"] == "failed"),
            "failed_queries_triaged": len(failed_triage),
            "triage_counts": dict(Counter(row["triage_category"] for row in failed_triage)),
            "recovered_frequency_status_counts": dict(Counter(row["status"] for row in recovered_items)),
            "archive_status_counts": dict(Counter(row["status"] for row in archive_rows)),
            "local_cache_evidence_candidates": len(local_evidence),
            "ngram_retry_logs": retry_logs,
        },
    )

    print("hub chart02 recovery scrape complete")
    print(f"previous failed queries: {sum(1 for item in inventory if item['previous_status'] == 'failed')}")
    print(f"failed queries triaged: {len(failed_triage)}")
    print(f"frequency status counts: {dict(Counter(row['status'] for row in recovered_items))}")
    print(f"archive status counts: {dict(Counter(row['status'] for row in archive_rows))}")
    print(f"local cache evidence candidates: {len(local_evidence)}")
    print("outputs:")
    for path in [
        RAW_DIR / "hub_chart02_recovery_query_inventory_raw.json",
        RAW_DIR / "hub_chart02_recovered_frequency_raw.json",
        RAW_DIR / "hub_chart02_recovered_evidence_raw.json",
        RAW_DIR / "hub_chart02_archive_search_raw.json",
        RAW_DIR / "hub_chart02_recovery_log.json",
    ]:
        print(f"- {path.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
