#!/usr/bin/env python3
"""Scrape modular frequency-term time-series for privacy.

This pass is intentionally permissive: it keeps a large family of related
orthographic and semantic terms and records partial results whenever sources
fail. It is meant as a first-pass repository of candidate time-series signals.
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
RESEARCH_DIR = ROOT / "docs" / "research" / "privacy"
RAW_DIR = RESEARCH_DIR / "raw"
CACHE_DIR = RAW_DIR / "cache"

WORD = "privacy"
LAYER_ID = "frequency_terms"
RAW_PATH = RAW_DIR / "privacy_frequency_terms_raw.json"

NGRAM_ENDPOINT = "https://books.google.com/ngrams/json"
START_YEAR = 1500
END_YEAR = 2022
SMOOTHING = 0
CASE_INSENSITIVE = True
CORPORA = ["en", "en-US", "en-GB"]
CORPUS_LABEL_BY_CODE = {
    "en": "English (mixed corpus)",
    "en-US": "English (United States)",
    "en-GB": "English (United Kingdom)",
}
BATCH_SIZE = 7
REQUEST_DELAY_SECONDS = 0.35
USER_AGENT = "WordsOverTime/0.1 privacy broad frequency pass; contact: local research script"
CACHE_ONLY = "--cache-only" in sys.argv


TERMS: list[dict[str, str]] = [
    {"term": "privacy", "term_family": "privacy_core"},
    {"term": "private", "term_family": "privacy_core"},
    {"term": "privy", "term_family": "privacy_core"},
    {"term": "privately", "term_family": "privacy_core"},
    {"term": "privateness", "term_family": "privacy_core"},
    {"term": "privatism", "term_family": "privacy_core"},
    {"term": "privatise", "term_family": "privacy_core"},
    {"term": "privatize", "term_family": "privacy_core"},
    {"term": "privatization", "term_family": "privacy_core"},
    {"term": "secrecy", "term_family": "security_secrecy"},
    {"term": "secret", "term_family": "security_secrecy"},
    {"term": "seclusion", "term_family": "seclusion"},
    {"term": "solitude", "term_family": "seclusion"},
    {"term": "isolation", "term_family": "seclusion"},
    {"term": "publicity", "term_family": "public_visibility"},
    {"term": "public", "term_family": "public_visibility"},
    {"term": "personal", "term_family": "personal_reference"},
    {"term": "domestic", "term_family": "domestic_home"},
    {"term": "intimate", "term_family": "personal_reference"},
    {"term": "confidentiality", "term_family": "security_secrecy"},
    {"term": "anonymity", "term_family": "identity"},
    {"term": "surveillance", "term_family": "surveillance_control"},
    {"term": "data privacy", "term_family": "information_privacy"},
    {"term": "information privacy", "term_family": "information_privacy"},
    {"term": "digital privacy", "term_family": "information_privacy"},
    {"term": "online privacy", "term_family": "information_privacy"},
    {"term": "internet privacy", "term_family": "information_privacy"},
    {"term": "personal privacy", "term_family": "privacy_life"},
    {"term": "individual privacy", "term_family": "privacy_life"},
    {"term": "domestic privacy", "term_family": "privacy_life"},
    {"term": "private life", "term_family": "privacy_life"},
    {"term": "right to privacy", "term_family": "legal_rights"},
    {"term": "privacy rights", "term_family": "legal_rights"},
    {"term": "invasion of privacy", "term_family": "legal_rights"},
    {"term": "privacy policy", "term_family": "governance_policy"},
    {"term": "privacy policies", "term_family": "governance_policy"},
    {"term": "privacy settings", "term_family": "platform_governance"},
    {"term": "privacy notice", "term_family": "platform_governance"},
    {"term": "privacy concern", "term_family": "public_attention"},
    {"term": "privacy concerns", "term_family": "public_attention"},
    {"term": "privacy and security", "term_family": "surveillance_tension"},
    {"term": "privacy and surveillance", "term_family": "surveillance_tension"},
    {"term": "privacy breach", "term_family": "security_events"},
    {"term": "privacy violation", "term_family": "legal_rights"},
    {"term": "information control", "term_family": "information_privacy"},
    {"term": "data protection", "term_family": "information_privacy"},
    {"term": "data security", "term_family": "security_control"},
]


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def slug(value: str) -> str:
    return re.sub(r"_+", "_", re.sub(r"[^a-z0-9]+", "_", value.lower())).strip("_")


def write_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def ngram_url(terms: list[str], corpus: str) -> str:
    params = {
        "content": ",".join(terms),
        "year_start": START_YEAR,
        "year_end": END_YEAR,
        "corpus": corpus,
        "smoothing": SMOOTHING,
        "case_insensitive": "true" if CASE_INSENSITIVE else "false",
    }
    return f"{NGRAM_ENDPOINT}?{urllib.parse.urlencode(params)}"


def cache_path(prefix: str, url: str) -> Path:
    digest = hashlib.sha1(url.encode("utf-8")).hexdigest()[:16]
    return CACHE_DIR / f"{prefix}_{digest}.json"


def fetch_json(url: str, prefix: str, corpus: str, query_index: str) -> dict[str, Any]:
    path = cache_path(f"{prefix}_{corpus}_{query_index}", url)
    log = {
        "source": "Google Books Ngram Viewer",
        "source_type": "ngram",
        "url": url,
        "corpus": corpus,
        "status": "failed",
        "error": None,
        "retrieved_at": utc_now(),
        "from_cache": path.exists(),
    }
    if path.exists():
        try:
            payload = json.loads(path.read_text(encoding="utf-8"))
            log["status"] = "success"
            log["from_cache"] = True
            return {"log": log, "payload": payload}
        except (OSError, json.JSONDecodeError) as exc:
            log["error"] = f"cache-read: {exc}"

    if CACHE_ONLY:
        log["error"] = "cache-only mode active: no cached response available for this request."
        return {"log": log, "payload": None}

    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT, "Accept": "application/json"})
    try:
        with urllib.request.urlopen(request, timeout=20) as response:
            payload = json.loads(response.read().decode("utf-8", errors="replace"))
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(json.dumps(payload, ensure_ascii=False), encoding="utf-8")
            log["status"] = "success"
            log["from_cache"] = False
            return {"log": log, "payload": payload}
    except urllib.error.HTTPError as exc:
        log["error"] = f"HTTPError {exc.code} {exc.reason}"
    except urllib.error.URLError as exc:
        log["error"] = f"URLError: {exc.reason}"
    except TimeoutError as exc:
        log["error"] = f"TimeoutError: {exc}"
    except (OSError, json.JSONDecodeError) as exc:
        log["error"] = f"{type(exc).__name__}: {exc}"
    return {"log": log, "payload": None}


def strip_regex_token(term: str) -> str:
    return re.sub(r"\(.*?\)", "", term).strip()


def normalize_rows(rows: list[dict[str, Any]], normalize_term: str) -> list[dict[str, Any]]:
    by_query: dict[str, list[dict[str, Any]]] = {}
    for row in rows:
        ngram = str(row.get("ngram", "")).strip()
        if CASE_INSENSITIVE and not ngram.endswith(" (All)"):
            continue
        key = re.sub(r"\s+\(all\)$", "", ngram, flags=re.I).strip().lower()
        points = []
        for offset, value in enumerate(row.get("timeseries", [])):
            year = START_YEAR + offset
            frequency = float(value or 0.0)
            points.append(
                {
                    "year": year,
                    "value": round(frequency, 10),
                    "frequency_per_million": round(frequency * 1_000_000, 10),
                }
            )
        by_query[key] = points

    return by_query.get(normalize_term.lower(), [])


def row_status(points: list[dict[str, Any]]) -> str:
    if not points:
        return "missing"
    nonzero = [point for point in points if float(point.get("frequency_per_million", 0.0)) > 0]
    if not nonzero:
        return "sparse"
    return "collected"


def build_query_specs() -> list[dict[str, Any]]:
    specs: list[dict[str, Any]] = []
    for index, item in enumerate(TERMS, start=1):
        term = item["term"]
        specs.append(
                {
                    "query_id": f"privacy_frequency_terms_query_{index:03d}",
                "query": term,
                "query_group": "privacy_family_term",
                "term_family": item["term_family"],
                "normalized_query": strip_regex_token(term).lower(),
            }
        )
    return specs


def collect_rows() -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    specs = build_query_specs()
    results: list[dict[str, Any]] = []
    logs: list[dict[str, Any]] = []

    for corpus in CORPORA:
        missing_queries = {spec["query_id"]: spec for spec in specs}
        for start in range(0, len(specs), BATCH_SIZE):
            batch = specs[start : start + BATCH_SIZE]
            query_values = [spec["query"] for spec in batch]
            url = ngram_url(query_values, corpus)
            response = fetch_json(url, f"ngram_{slug('_'.join(query_values))}", corpus, f"{start // BATCH_SIZE:03d}")
            log = dict(response["log"])
            payload = response.get("payload")
            if isinstance(payload, list):
                for item in batch:
                    query = item["query"]
                    normalized = item["normalized_query"]
                    points = normalize_rows(payload, normalized)
                    missing_queries.pop(item["query_id"], None)
                    status = row_status(points)
                    if status == "missing" and log.get("status") != "success":
                        status = "failed"
                        points = []
                    if not points:
                        nonzero = 0
                    else:
                        nonzero = sum(1 for point in points if float(point.get("frequency_per_million", 0.0)) > 0)

                    results.append(
                        {
                            "query_id": item["query_id"],
                            "query": query,
                            "query_group": item["query_group"],
                            "term_family": item["term_family"],
                            "source": "Google Books Ngram Viewer",
                            "source_type": "ngram",
                            "source_corpus": corpus,
                            "source_corpus_label": CORPUS_LABEL_BY_CODE.get(corpus, corpus),
                            "request_url": url,
                            "start_year": START_YEAR,
                            "end_year": END_YEAR,
                            "status": status,
                            "raw_series": points,
                            "nonzero_points": nonzero,
                            "notes": "No direct visibility for this query in this corpus window." if status != "collected" else "",
                        }
                    )
            else:
                for item in batch:
                    missing_queries.pop(item["query_id"], None)
                    results.append(
                        {
                            "query_id": item["query_id"],
                            "query": item["query"],
                            "query_group": item["query_group"],
                            "term_family": item["term_family"],
                            "source": "Google Books Ngram Viewer",
                            "source_type": "ngram",
                            "source_corpus": corpus,
                            "source_corpus_label": CORPUS_LABEL_BY_CODE.get(corpus, corpus),
                            "request_url": url,
                            "start_year": START_YEAR,
                            "end_year": END_YEAR,
                            "status": "failed",
                            "raw_series": [],
                            "nonzero_points": 0,
                            "notes": log.get("error") or "No usable ngram payload was returned.",
                        }
                    )

            logs.append(
                {
                    "batch_id": f"{corpus}_{start // BATCH_SIZE + 1:02d}",
                    "corpus": corpus,
                    "queries": query_values,
                    "status": log.get("status", "failed"),
                    "error": log.get("error"),
                    "from_cache": bool(log.get("from_cache")),
                    "url": url,
                }
            )
            time.sleep(REQUEST_DELAY_SECONDS)

        for spec in missing_queries.values():
            query = spec["query"]
            results.append(
                {
                    "query_id": spec["query_id"],
                    "query": query,
                    "query_group": spec["query_group"],
                    "term_family": spec["term_family"],
                    "source": "Google Books Ngram Viewer",
                    "source_type": "ngram",
                    "source_corpus": corpus,
                    "source_corpus_label": CORPUS_LABEL_BY_CODE.get(corpus, corpus),
                    "request_url": None,
                    "start_year": START_YEAR,
                    "end_year": END_YEAR,
                    "status": "failed",
                    "raw_series": [],
                    "nonzero_points": 0,
                    "notes": "ngram payload did not include this query.",
                }
            )

    return results, logs


def main() -> None:
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    CACHE_DIR.mkdir(parents=True, exist_ok=True)

    query_results, query_log = collect_rows()

    raw_payload = {
        "metadata": {
            "word": WORD,
            "layer_id": LAYER_ID,
            "title": "Privacy frequency baseline (modular terms)",
            "generated_at": utc_now(),
            "generated_by_script": "scripts/scrape_privacy_frequency_terms.py",
            "start_year": START_YEAR,
            "end_year": END_YEAR,
            "corpora": CORPORA,
            "corpus_labels": CORPUS_LABEL_BY_CODE,
            "smoothing": SMOOTHING,
            "case_insensitive": CASE_INSENSITIVE,
            "batch_size": BATCH_SIZE,
            "source_summary": [
                "Google Books Ngram Viewer queries across several English corpora.",
                "Broad lexical family includes privacy, private, privy, and security/data-policy neighbors.",
                "Raw series are preserved as-is; missing rows remain in output with status markers.",
            ],
            "query_count_requested": len(TERMS),
            "source": {
                "name": "Google Books Ngram Viewer",
                "url": NGRAM_ENDPOINT,
            },
            "notes": [
                "Google Ngram values are not sense-disambiguated and are subject to corpus bias.",
                "High-uncertainty year labels in older strata can reflect OCR and source balancing.",
            ],
            "cache_only_mode": CACHE_ONLY,
        },
        "query_log": query_log,
        "query_results": query_results,
    }

    write_json(RAW_PATH, raw_payload)

    collected = sum(1 for row in query_results if row["status"] == "collected")
    sparse = sum(1 for row in query_results if row["status"] == "sparse")
    failed = sum(1 for row in query_results if row["status"] in {"failed", "missing"})
    print("Privacy frequency terms scrape summary")
    print(f"- Corpora requested: {', '.join(CORPORA)}")
    print(f"- Terms requested: {len(TERMS)}")
    print(f"- Query-source combinations: {len(query_results)}")
    print(f"- Collected: {collected}")
    print(f"- Sparse: {sparse}")
    print(f"- Missing/failed: {failed}")
    print(f"- Raw output: {RAW_PATH}")


if __name__ == "__main__":
    main()
