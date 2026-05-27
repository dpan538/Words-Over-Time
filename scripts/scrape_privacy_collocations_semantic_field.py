#!/usr/bin/env python3
"""Scrape broad collocation and phrase-frequency evidence for privacy."""

from __future__ import annotations

import hashlib
import json
import re
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
LAYER_ID = "collocations_semantic_field"
RAW_PATH = RAW_DIR / "privacy_collocations_semantic_field_raw.json"

NGRAM_ENDPOINT = "https://books.google.com/ngrams/json"
START_YEAR = 1500
END_YEAR = 2022
CORPUS = "en"
SMOOTHING = 0
CASE_INSENSITIVE = True
BATCH_SIZE = 7
REQUEST_DELAY_SECONDS = 0.35
USER_AGENT = "WordsOverTime/0.1 privacy collocations broad pass; contact: local research script"

BUCKET_DEFINITIONS: dict[str, dict[str, Any]] = {
    "seclusion_private_life": {
        "label": "Seclusion and private life",
        "description": "Privacy as seclusion, secluding spaces, family life, or personal life framing.",
        "phrases": [
            "privacy of",
            "privacy in",
            "privacy from",
            "privacy for",
            "private life",
            "domestic privacy",
            "family privacy",
            "workplace privacy",
            "workers' privacy",
            "patient privacy",
            "family privacy",
            "bodily privacy",
            "sexual privacy",
            "intimate privacy",
        ],
    },
    "legal_rights_intrusion": {
        "label": "Legal rights and intrusion",
        "description": "Legal and civic claims around rights, intrusion, and expectation frameworks.",
        "phrases": [
            "right to privacy",
            "rights of privacy",
            "privacy rights",
            "reasonable expectation of privacy",
            "invasion of privacy",
            "loss of privacy",
            "violation of privacy",
            "loss of privacy",
        ],
    },
    "information_data_control": {
        "label": "Information and data control",
        "description": "Privacy as information control, confidentiality, and data governance.",
        "phrases": [
            "information privacy",
            "data privacy",
            "privacy protection",
            "privacy protection",
            "privacy and confidentiality",
            "confidentiality of privacy",
            "privacy concerns",
            "privacy risk",
            "privacy breach",
            "privacy and information",
            "personal data privacy",
            "data breach",
            "consumer privacy",
            "medical privacy",
            "financial privacy",
            "genetic privacy",
            "location privacy",
            "identity privacy",
        ],
    },
    "digital_platform_governance": {
        "label": "Digital/platform governance",
        "description": "Policy and product-layer privacy language in digital systems.",
        "phrases": [
            "digital privacy",
            "online privacy",
            "internet privacy",
            "privacy policy",
            "privacy policies",
            "privacy notice",
            "privacy settings",
            "privacy controls",
            "privacy preferences",
            "privacy by design",
            "privacy-preserving",
            "privacy enhancing",
            "privacy-preserving",
            "network privacy",
            "platform privacy",
            "privacy and platform",
            "privacy settings",
            "privacy policy",
        ],
    },
    "surveillance_security_tension": {
        "label": "Surveillance and security tension",
        "description": "Security, monitoring, and surveillance trade-offs around privacy.",
        "phrases": [
            "privacy and security",
            "security and privacy",
            "privacy and surveillance",
            "surveillance privacy",
            "privacy and monitoring",
            "privacy and camera",
            "privacy and biometrics",
            "privacy and tracking",
            "privacy and advertising",
        ],
    },
    "identity_anonymity_consent": {
        "label": "Identity, anonymity, consent",
        "description": "Identity and consent-linked privacy language.",
        "phrases": [
            "privacy and identity",
            "identity and privacy",
            "anonymity and privacy",
            "consent and privacy",
            "privacy and transparency",
            "privacy and trust",
        ],
    },
    "policy_compliance_institutional": {
        "label": "Policy and compliance",
        "description": "Institutional and legal compliance language around privacy obligations.",
        "phrases": [
            "privacy law",
            "privacy legislation",
            "privacy policy compliance",
            "privacy audit",
            "privacy impact assessment",
            "privacy by policy",
            "privacy impact",
            "gdpr privacy",
        ],
    },
    "technical_privacy_preserving": {
        "label": "Technical privacy mechanisms",
        "description": "Technical or architecture language for protective privacy designs.",
        "phrases": [
            "privacy preserving",
            "privacy-preserving",
            "privacy enhancing",
            "privacy-enhancing",
            "privacy by design",
            "privacy-preserving",
            "privacy security",
            "encrypted privacy",
        ],
    },
    "uncertain_other": {
        "label": "Uncertain/other",
        "description": "Useful phrases that do not fit one anchor bucket yet.",
        "phrases": [
            "privacy and privacy",
            "public privacy",
            "privacy movement",
            "privacy culture",
            "privacy discourse",
            "privacy debate",
            "privacy concerns about",
            "privacy of the self",
            "privacy politics",
            "privacy narrative",
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


def ngram_url(terms: list[str]) -> str:
    params = {
        "content": ",".join(terms),
        "year_start": START_YEAR,
        "year_end": END_YEAR,
        "corpus": CORPUS,
        "smoothing": SMOOTHING,
        "case_insensitive": "true" if CASE_INSENSITIVE else "false",
    }
    return f"{NGRAM_ENDPOINT}?{urllib.parse.urlencode(params)}"


def cache_path(prefix: str, url: str) -> Path:
    digest = hashlib.sha1(url.encode("utf-8")).hexdigest()[:16]
    return CACHE_DIR / f"{prefix}_{digest}.json"


def fetch_json(url: str, prefix: str) -> dict[str, Any]:
    path = cache_path(prefix, url)
    log = {
        "source": "Google Books Ngram Viewer",
        "source_type": "ngram",
        "url": url,
        "status": "failed",
        "error": None,
        "retrieved_at": utc_now(),
        "from_cache": path.exists(),
    }
    if path.exists():
        try:
            payload = json.loads(path.read_text(encoding="utf-8"))
            log["status"] = "success"
            return {"log": log, "payload": payload}
        except (OSError, json.JSONDecodeError) as exc:
            log["error"] = f"cache-read: {exc}"

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


def normalize_rows(rows: list[dict[str, Any]]) -> dict[str, list[dict[str, Any]]]:
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
    return by_query


def status_from_points(points: list[dict[str, Any]], request_ok: bool) -> str:
    if not request_ok:
        return "failed"
    if not points:
        return "missing"
    nonzero = [point for point in points if float(point.get("frequency_per_million", 0.0)) > 0]
    return "sparse" if not nonzero else "collected"


def phrase_specs() -> list[dict[str, Any]]:
    specs: list[dict[str, Any]] = []
    counter = 1
    seen: set[str] = set()
    for bucket_id, bucket in BUCKET_DEFINITIONS.items():
        for phrase in bucket["phrases"]:
            normalized = phrase.lower().strip()
            if normalized in seen:
                continue
            seen.add(normalized)
            specs.append(
                {
                    "query_id": f"privacy_collocations_semantic_field_query_{counter:03d}",
                    "query": phrase,
                    "bucket_id": bucket_id,
                    "bucket_label": bucket["label"],
                    "query_group": "phrase",
                }
            )
            counter += 1
    return specs


def collect_rows() -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    specs = phrase_specs()
    query_log: list[dict[str, Any]] = []
    results: list[dict[str, Any]] = []

    for start in range(0, len(specs), BATCH_SIZE):
        batch = specs[start : start + BATCH_SIZE]
        batch_terms = [item["query"] for item in batch]
        url = ngram_url(batch_terms)
        response = fetch_json(url, f"ngram_{slug('_'.join(batch_terms))}")
        log = dict(response["log"])
        payload = response.get("payload")

        if isinstance(payload, list):
            rows = normalize_rows(payload)
            for item in batch:
                points = rows.get(item["query"].lower(), [])
                status = status_from_points(points, True)
                notes = "" if status == "collected" else "No visible phrase data in response."
                if status != "collected":
                    notes = log.get("error") or notes
                results.append(
                    {
                        "query_id": item["query_id"],
                        "query": item["query"],
                        "bucket_id": item["bucket_id"],
                        "bucket_label": item["bucket_label"],
                        "source": "Google Books Ngram Viewer",
                        "source_type": "ngram",
                        "request_url": url,
                        "start_year": START_YEAR,
                        "end_year": END_YEAR,
                        "status": status,
                        "raw_series": points,
                        "nonzero_points": sum(1 for point in points if float(point.get("frequency_per_million", 0.0)) > 0),
                        "notes": notes,
                    }
                )
        else:
            for item in batch:
                results.append(
                    {
                        "query_id": item["query_id"],
                        "query": item["query"],
                        "bucket_id": item["bucket_id"],
                        "bucket_label": item["bucket_label"],
                        "source": "Google Books Ngram Viewer",
                        "source_type": "ngram",
                        "request_url": url,
                        "start_year": START_YEAR,
                        "end_year": END_YEAR,
                        "status": "failed",
                        "raw_series": [],
                        "nonzero_points": 0,
                        "notes": log.get("error") or "No usable ngram payload was returned.",
                    }
                )

        query_log.append(
            {
                "batch_id": f"{start // BATCH_SIZE + 1:02d}",
                "queries": batch_terms,
                "status": log.get("status"),
                "error": log.get("error"),
                "from_cache": bool(log.get("from_cache")),
            }
        )
        time.sleep(REQUEST_DELAY_SECONDS)

    return results, query_log


def main() -> None:
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    CACHE_DIR.mkdir(parents=True, exist_ok=True)

    query_results, query_log = collect_rows()
    bucket_counts = {bucket_id: 0 for bucket_id in BUCKET_DEFINITIONS}
    for row in query_results:
        bucket_counts[row.get("bucket_id", "uncertain_other")] += 1

    payload = {
        "metadata": {
            "word": WORD,
            "layer_id": LAYER_ID,
            "title": "Privacy broad collocations and phrase families",
            "generated_at": utc_now(),
            "generated_by_script": "scripts/scrape_privacy_collocations_semantic_field.py",
            "start_year": START_YEAR,
            "end_year": END_YEAR,
            "corpus": CORPUS,
            "smoothing": SMOOTHING,
            "case_insensitive": CASE_INSENSITIVE,
            "batch_size": BATCH_SIZE,
            "time_buckets": [
                "pre_1500",
                "1500_1799",
                "1800_1890",
                "1890_1950",
                "1950_1980",
                "1980_2000",
                "2000_2010",
                "2010_2022",
            ],
            "bucket_counts": bucket_counts,
            "source": {
                "name": "Google Books Ngram Viewer",
                "url": NGRAM_ENDPOINT,
            },
            "notes": [
                "Phrase list is intentionally broad and includes candidates for discovery in future passes.",
                "No phrase ranking is assumed; low-frequency phrases are kept for reclassification.",
            ],
            "query_count_requested": len(phrase_specs()),
        },
        "query_log": query_log,
        "query_results": query_results,
        "bucket_definitions": BUCKET_DEFINITIONS,
    }

    write_json(RAW_PATH, payload)

    collected = sum(1 for row in query_results if row["status"] == "collected")
    sparse = sum(1 for row in query_results if row["status"] == "sparse")
    missing_or_failed = sum(1 for row in query_results if row["status"] in {"missing", "failed"})
    print("Privacy collocations and semantic-field scrape summary")
    print(f"- Phrase queries: {len(query_results)}")
    print(f"- Collected: {collected}")
    print(f"- Sparse: {sparse}")
    print(f"- Missing/failed: {missing_or_failed}")
    print(f"- Raw output: {RAW_PATH}")


if __name__ == "__main__":
    main()
