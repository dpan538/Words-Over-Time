#!/usr/bin/env python3
"""Collect a deep supplemental research pass for privacy.

This layer targets evidence gaps that remain after the first-round modular pass:
- dated public evidence beyond dictionary summaries
- legal/privacy-rights transition phrases
- information/data transition phrases
- tension and tradeoff vocabulary
- platform/regulator compliance language
- public-knowledge and institutional/legal reference corpora
- legal opinion metadata and archive-discovery metadata
- a second attention-like source from news volume
- extra academic transition vocabulary
"""

from __future__ import annotations

import hashlib
import html
import http.client
import json
import os
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
CACHE_DIR = RAW_DIR / "research_expansion_cache"

WORD = "privacy"
LAYER_ID = "research_expansion"
RAW_PATH = RAW_DIR / "privacy_research_expansion_raw.json"

USER_AGENT = "WordsOverTime/0.1 privacy supplemental expansion pass; contact: local research script"
CACHE_ONLY = "--cache-only" in os.sys.argv

NGRAM_ENDPOINT = "https://books.google.com/ngrams/json"
START_YEAR = 1800
END_YEAR = 2022
CORPORA = ["en", "en-US", "en-GB"]
NGRAM_BATCH_SIZE = 6
GENERAL_DELAY_SECONDS = 0.35
GDELT_DELAY_SECONDS = 1.2

EARLY_PUBLIC_WINDOWS = [
    "1789-1850",
    "1851-1890",
    "1891-1930",
    "1931-1970",
]

EARLY_PUBLIC_TERMS = [
    "privacy",
    "private",
    "privy",
    "right to privacy",
    "invasion of privacy",
    "information privacy",
    "privacy law",
]

LEGAL_TRANSITION_TERMS = [
    "right to privacy",
    "privacy rights",
    "invasion of privacy",
    "expectation of privacy",
    "reasonable expectation of privacy",
    "privacy law",
    "privacy laws",
    "intrusion upon seclusion",
]

INFO_TRANSITION_TERMS = [
    "information privacy",
    "informational privacy",
    "computer privacy",
    "database privacy",
    "records privacy",
    "personal information",
    "data protection",
    "privacy protection",
    "fair information practices",
    "personally identifiable information",
    "PII",
    "data governance",
]

TENSION_TERMS = [
    "privacy and security",
    "security and privacy",
    "privacy and surveillance",
    "privacy and transparency",
    "privacy and convenience",
    "privacy and sharing",
    "privacy and safety",
    "privacy and publicity",
]

PLATFORM_AND_POLICY_DOCS = [
    {"doc_id": "apple_privacy", "label": "Apple Privacy", "url": "https://www.apple.com/legal/privacy/"},
    {"doc_id": "google_privacy", "label": "Google Privacy Policy", "url": "https://policies.google.com/privacy"},
    {"doc_id": "meta_privacy", "label": "Meta Privacy Policy", "url": "https://www.facebook.com/privacy/policy/"},
    {"doc_id": "microsoft_privacy", "label": "Microsoft Privacy Statement", "url": "https://www.microsoft.com/en-us/privacy/privacystatement"},
    {"doc_id": "openai_privacy", "label": "OpenAI Privacy Policy", "url": "https://openai.com/policies/privacy-policy/"},
    {"doc_id": "ca_oag_ccpa", "label": "California OAG CCPA", "url": "https://www.oag.ca.gov/privacy/ccpa"},
    {"doc_id": "oaic_privacy", "label": "OAIC Privacy", "url": "https://www.oaic.gov.au/privacy"},
    {"doc_id": "gdpr_lex", "label": "GDPR Official Text", "url": "https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng"},
]

POLICY_MATCH_TERMS = [
    "privacy policy",
    "privacy notice",
    "privacy settings",
    "privacy controls",
    "privacy preferences",
    "data protection",
    "personal information",
    "consent",
    "cookies",
    "privacy rights",
]

GDELT_DISCOURSE_TERMS = [
    "right to privacy",
    "privacy law",
    "privacy policy",
    "privacy settings",
    "privacy controls",
    "privacy and security",
    "privacy and surveillance",
    "privacy and transparency",
    "information privacy",
    "data protection",
    "personally identifiable information",
    "data governance",
]

GDELT_ATTENTION_TERMS = [
    "privacy",
    "privacy policy",
]

OPENALEX_TRANSITION_TERMS = [
    "informational privacy",
    "computer privacy",
    "database privacy",
    "records privacy",
    "data protection",
    "fair information practices",
    "personally identifiable information",
    "privacy law",
    "privacy policy",
    "data governance",
]

OPENALEX_PER_PAGE = 8
OPENALEX_PAGES = 1
OPENALEX_INSTITUTION_LIMIT = 20

REFERENCE_MATCH_TERMS = [
    "privacy",
    "private",
    "surveillance",
    "security",
    "consent",
    "identity",
    "personal data",
    "data protection",
    "privacy rights",
]

WIKIPEDIA_REFERENCE_PAGES = [
    "Privacy",
    "Right to privacy",
    "Data privacy",
    "Information privacy",
    "Internet privacy",
    "Privacy policy",
    "General Data Protection Regulation",
    "Mass surveillance",
    "Data breach",
    "Personal data",
    "Privacy concerns with social networking services",
]

LEGAL_AND_INSTITUTIONAL_DOCS = [
    {"doc_id": "cornell_privacy", "label": "Cornell Wex Privacy", "url": "https://www.law.cornell.edu/wex/privacy"},
    {
        "doc_id": "cornell_reasonable_expectation",
        "label": "Cornell Constitution Annotated Reasonable Expectation of Privacy",
        "url": "https://www.law.cornell.edu/constitution-conan/amendment-4/reasonable-expectation-of-privacy",
    },
    {"doc_id": "doj_privacy_act_1974", "label": "DOJ Privacy Act of 1974", "url": "https://www.justice.gov/opcl/privacy-act-1974"},
    {"doc_id": "nist_privacy_framework", "label": "NIST Privacy Framework", "url": "https://www.nist.gov/privacy-framework"},
    {
        "doc_id": "eu_data_protection",
        "label": "European Commission Data Protection",
        "url": "https://commission.europa.eu/law/law-topic/data-protection_en",
    },
]

COURTLISTENER_QUERIES = [
    "right to privacy",
    "invasion of privacy",
    "reasonable expectation of privacy",
    "intrusion upon seclusion",
    "privacy act",
    "data privacy",
]

COURTLISTENER_LIMIT = 10

ARCHIVE_QUERIES = [
    "privacy",
    "right to privacy",
    "privacy law",
    "data privacy",
    "online privacy",
]

ARCHIVE_ROWS = 8

CROSSREF_QUERIES = [
    "privacy",
    "right to privacy",
    "data privacy",
    "information privacy",
    "online privacy",
    "privacy policy",
    "medical privacy",
    "genetic privacy",
]

CROSSREF_ROWS = 10


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def write_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def slug(value: str) -> str:
    return re.sub(r"_+", "_", re.sub(r"[^a-z0-9]+", "_", value.lower())).strip("_")


def cache_path(prefix: str, url: str) -> Path:
    digest = hashlib.sha1(url.encode("utf-8")).hexdigest()[:16]
    return CACHE_DIR / f"{prefix}_{digest}.json"


def normalize_text(html_text: str) -> str:
    text = re.sub(r"<script\b[^>]*>.*?</script>", " ", html_text, flags=re.I | re.S)
    text = re.sub(r"<style\b[^>]*>.*?</style>", " ", text, flags=re.I | re.S)
    text = html.unescape(text)
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def fetch_text(url: str, prefix: str, source_name: str, source_type: str, retries: int = 1) -> dict[str, Any]:
    path = cache_path(prefix, url)
    log = {
        "source_name": source_name,
        "source_type": source_type,
        "url": url,
        "status": "failed",
        "error": None,
        "retrieved_at": utc_now(),
        "from_cache": path.exists(),
        "cache_path": str(path.relative_to(ROOT)),
    }
    if path.exists():
        try:
            payload = path.read_text(encoding="utf-8")
            log["status"] = "success"
            return {"log": log, "payload": payload}
        except OSError as exc:
            log["error"] = f"cache-read: {exc}"

    if CACHE_ONLY:
        log["error"] = "cache-only mode active: no cached response available."
        return {"log": log, "payload": None}

    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    for attempt in range(retries + 1):
        try:
            with urllib.request.urlopen(request, timeout=40) as response:
                payload = response.read().decode("utf-8", errors="replace")
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_text(payload, encoding="utf-8")
                log["status"] = "success"
                log["from_cache"] = False
                log["status_code"] = getattr(response, "status", None)
                return {"log": log, "payload": payload}
        except urllib.error.HTTPError as exc:
            log["error"] = f"HTTPError {exc.code} {exc.reason}"
            if exc.code == 429 and attempt < retries:
                time.sleep(4 + attempt)
                continue
            break
        except urllib.error.URLError as exc:
            log["error"] = f"URLError: {exc.reason}"
            break
        except TimeoutError as exc:
            log["error"] = f"TimeoutError: {exc}"
            if attempt < retries:
                time.sleep(2 + attempt)
                continue
            break
        except http.client.IncompleteRead as exc:
            payload = exc.partial.decode("utf-8", errors="replace")
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(payload, encoding="utf-8")
            log["status"] = "partial"
            log["from_cache"] = False
            log["error"] = f"IncompleteRead: {exc}"
            return {"log": log, "payload": payload}
        except OSError as exc:
            log["error"] = f"{type(exc).__name__}: {exc}"
            break
    return {"log": log, "payload": None}


def fetch_json(url: str, prefix: str, source_name: str, source_type: str, retries: int = 1) -> dict[str, Any]:
    response = fetch_text(url, prefix, source_name, source_type, retries=retries)
    payload = response.get("payload")
    if not isinstance(payload, str):
        return {"log": response["log"], "payload": None}
    try:
        return {"log": response["log"], "payload": json.loads(payload)}
    except json.JSONDecodeError as exc:
        response["log"]["status"] = "failed"
        response["log"]["error"] = f"json-decode: {exc}"
        return {"log": response["log"], "payload": None}


def sleep_general() -> None:
    time.sleep(GENERAL_DELAY_SECONDS)


def sleep_gdelt() -> None:
    time.sleep(GDELT_DELAY_SECONDS)


def build_failure(source_id: str, source_type: str, reason: str, extra: dict[str, Any] | None = None) -> dict[str, Any]:
    row = {
        "source_id": source_id,
        "source_type": source_type,
        "availability": "failed",
        "reason": reason,
        "retrieved_at": utc_now(),
    }
    if extra:
        row.update(extra)
    return row


def ngram_url(terms: list[str], corpus: str) -> str:
    params = {
        "content": ",".join(terms),
        "year_start": START_YEAR,
        "year_end": END_YEAR,
        "corpus": corpus,
        "smoothing": 0,
        "case_insensitive": "true",
    }
    return f"{NGRAM_ENDPOINT}?{urllib.parse.urlencode(params)}"


def collect_public_dated_evidence() -> tuple[list[dict[str, Any]], list[dict[str, Any]], list[dict[str, Any]], list[dict[str, Any]]]:
    records: list[dict[str, Any]] = []
    attempts: list[dict[str, Any]] = []
    failures: list[dict[str, Any]] = []

    for term in EARLY_PUBLIC_TERMS:
        for window in EARLY_PUBLIC_WINDOWS:
            url = (
                "https://www.loc.gov/collections/chronicling-america/"
                f"?fo=json&at=results,pagination&c=3&query={urllib.parse.quote(term)}&dates={window}"
            )
            response = fetch_json(url, f"loc_{slug(term)}_{window}", "Library of Congress Chronicling America Collection", "public_dated_evidence")
            attempts.append(
                {
                    "source_id": "loc_chronicling_america_collection",
                    "source_type": "public_dated_evidence",
                    "query": term,
                    "window": window,
                    "status": response["log"].get("status"),
                    "url": url,
                    "error": response["log"].get("error"),
                    "from_cache": response["log"].get("from_cache"),
                    "retrieved_at": response["log"].get("retrieved_at"),
                }
            )
            payload = response.get("payload")
            if not isinstance(payload, dict):
                failures.append(
                    build_failure(
                        "loc_chronicling_america_collection",
                        "public_dated_evidence",
                        response["log"].get("error") or "No usable LOC payload returned.",
                        {"query": term, "window": window, "url": url},
                    )
                )
                sleep_general()
                continue

            for index, item in enumerate(payload.get("results", [])[:3], start=1):
                records.append(
                    {
                        "record_id": f"privacy_expansion_loc_{slug(term)}_{window}_{index:03d}",
                        "source_type": "public_dated_evidence",
                        "query": term,
                        "window": window,
                        "date": item.get("date"),
                        "year": int(str(item.get("date"))[:4]) if str(item.get("date", ""))[:4].isdigit() else None,
                        "title": item.get("title"),
                        "publication_place": (item.get("item") or {}).get("place_of_publication"),
                        "location_terms": (item.get("item") or {}).get("location", []),
                        "digital_id": ((item.get("item") or {}).get("digital_id") or [None])[0],
                        "newspaper_title": ((item.get("item") or {}).get("newspaper_title") or [None])[0],
                        "description": " ".join(item.get("description", [])) if isinstance(item.get("description"), list) else item.get("description"),
                        "source": "Library of Congress Chronicling America",
                        "source_url": url,
                        "confidence": "medium",
                        "notes": "Public historical publication evidence from collection search metadata; not a full text snippet.",
                    }
                )
            sleep_general()

    sources = [
        {
            "source_id": "loc_chronicling_america_collection",
            "source_type": "public_dated_evidence",
            "source_name": "Library of Congress Chronicling America Collection",
            "available": len(records) > 0,
            "records": len(records),
            "notes": "Used as dated public evidence metadata rather than a full OCR citation layer.",
        }
    ]
    return records, attempts, sources, failures


def parse_ngram_rows(rows: list[dict[str, Any]], query_terms: list[str]) -> dict[str, list[dict[str, Any]]]:
    by_query: dict[str, list[dict[str, Any]]] = {}
    for row in rows:
        ngram = str(row.get("ngram", "")).strip()
        if not ngram.endswith(" (All)"):
            continue
        key = re.sub(r"\s+\(all\)$", "", ngram, flags=re.I).strip().lower()
        if key not in {item.lower() for item in query_terms}:
            continue
        points = []
        for offset, value in enumerate(row.get("timeseries", [])):
            points.append(
                {
                    "year": START_YEAR + offset,
                    "value": round(float(value or 0.0) * 1_000_000, 10),
                }
            )
        by_query[key] = points
    return by_query


def collect_phrase_frequency_expansion() -> tuple[list[dict[str, Any]], list[dict[str, Any]], list[dict[str, Any]], list[dict[str, Any]]]:
    groups = [
        ("legal_transition", LEGAL_TRANSITION_TERMS),
        ("information_transition", INFO_TRANSITION_TERMS),
        ("tension_terms", TENSION_TERMS),
    ]
    records: list[dict[str, Any]] = []
    attempts: list[dict[str, Any]] = []
    failures: list[dict[str, Any]] = []

    for group_id, terms in groups:
        for corpus in CORPORA:
            for start in range(0, len(terms), NGRAM_BATCH_SIZE):
                batch = terms[start : start + NGRAM_BATCH_SIZE]
                url = ngram_url(batch, corpus)
                response = fetch_json(url, f"ngram_{group_id}_{corpus}_{start:03d}", "Google Books Ngram Viewer", "supplemental_phrase_frequency")
                attempts.append(
                    {
                        "source_id": "google_books_ngram",
                        "source_type": "supplemental_phrase_frequency",
                        "group_id": group_id,
                        "corpus": corpus,
                        "queries": batch,
                        "status": response["log"].get("status"),
                        "url": url,
                        "error": response["log"].get("error"),
                        "from_cache": response["log"].get("from_cache"),
                        "retrieved_at": response["log"].get("retrieved_at"),
                    }
                )
                payload = response.get("payload")
                if not isinstance(payload, list):
                    failures.append(
                        build_failure(
                            "google_books_ngram",
                            "supplemental_phrase_frequency",
                            response["log"].get("error") or "No usable ngram payload returned.",
                            {"group_id": group_id, "corpus": corpus, "queries": batch},
                        )
                    )
                    sleep_general()
                    continue

                rows = parse_ngram_rows(payload, batch)
                for term in batch:
                    points = rows.get(term.lower(), [])
                    status = "collected" if any(point["value"] > 0 for point in points) else "sparse"
                    records.append(
                        {
                            "record_id": f"privacy_expansion_ngram_{group_id}_{slug(term)}_{corpus}",
                            "source_type": "supplemental_phrase_frequency",
                            "group_id": group_id,
                            "query": term,
                            "corpus": corpus,
                            "source": "Google Books Ngram Viewer",
                            "status": status,
                            "values": points,
                            "nonzero_points": len([point for point in points if point["value"] > 0]),
                            "notes": None if status == "collected" else "No visible phrase series recovered from this corpus response.",
                        }
                    )
                sleep_general()

    sources = [
        {
            "source_id": "google_books_ngram",
            "source_type": "supplemental_phrase_frequency",
            "source_name": "Google Books Ngram Viewer",
            "available": len(records) > 0,
            "records": len(records),
            "notes": "Used for legal, informational, and tension phrase growth signals.",
        }
    ]
    return records, attempts, sources, failures


def snippet_examples(text: str, term: str, max_examples: int = 3) -> list[str]:
    pattern = re.compile(re.escape(term), re.I)
    examples = []
    for match in pattern.finditer(text):
        start = max(0, match.start() - 90)
        end = min(len(text), match.end() + 90)
        examples.append(text[start:end].strip())
        if len(examples) >= max_examples:
            break
    return examples


def matched_term_rows(text: str, terms: list[str], max_examples: int = 3) -> list[dict[str, Any]]:
    lowered = text.lower()
    rows = []
    seen_terms: set[str] = set()
    for term in terms:
        term_key = term.lower()
        if term_key in seen_terms:
            continue
        seen_terms.add(term_key)
        count = lowered.count(term.lower())
        if count <= 0:
            continue
        rows.append(
            {
                "term": term,
                "count": count,
                "examples": snippet_examples(text, term, max_examples=max_examples),
            }
        )
    return rows


def collect_policy_and_platform_texts() -> tuple[list[dict[str, Any]], list[dict[str, Any]], list[dict[str, Any]], list[dict[str, Any]]]:
    records: list[dict[str, Any]] = []
    attempts: list[dict[str, Any]] = []
    failures: list[dict[str, Any]] = []

    for doc in PLATFORM_AND_POLICY_DOCS:
        response = fetch_text(doc["url"], f"policy_{doc['doc_id']}", doc["label"], "platform_policy_corpus")
        attempts.append(
            {
                "source_id": doc["doc_id"],
                "source_type": "platform_policy_corpus",
                "status": response["log"].get("status"),
                "url": doc["url"],
                "error": response["log"].get("error"),
                "from_cache": response["log"].get("from_cache"),
                "retrieved_at": response["log"].get("retrieved_at"),
            }
        )
        payload = response.get("payload")
        if not isinstance(payload, str):
            failures.append(
                build_failure(
                    doc["doc_id"],
                    "platform_policy_corpus",
                    response["log"].get("error") or "No usable HTML payload returned.",
                    {"url": doc["url"]},
                )
            )
            sleep_general()
            continue

        normalized = normalize_text(payload)
        match_rows = matched_term_rows(normalized, POLICY_MATCH_TERMS)
        title_match = re.search(r"<title>(.*?)</title>", payload, flags=re.I | re.S)
        records.append(
            {
                "record_id": f"privacy_expansion_policy_{doc['doc_id']}",
                "source_type": "platform_policy_corpus",
                "doc_id": doc["doc_id"],
                "label": doc["label"],
                "url": doc["url"],
                "title": html.unescape(title_match.group(1).strip()) if title_match else doc["label"],
                "text_length": len(normalized),
                "matched_terms": match_rows,
                "source": doc["label"],
                "confidence": "medium",
                "notes": "Term counts are page-level text matches from policy/compliance documents and not formal semantic parsing.",
            }
        )
        sleep_general()

    sources = [
        {
            "source_id": "platform_policy_corpus",
            "source_type": "platform_policy_corpus",
            "source_name": "Platform and regulator policy documents",
            "available": len(records) > 0,
            "records": len(records),
            "notes": "Curated public policy texts used to recover compliance and interface language.",
        }
    ]
    return records, attempts, sources, failures


def wikipedia_summary_url(title: str) -> str:
    encoded = urllib.parse.quote(title.replace(" ", "_"))
    return f"https://en.wikipedia.org/api/rest_v1/page/summary/{encoded}"


def collect_wikipedia_reference_corpus() -> tuple[list[dict[str, Any]], list[dict[str, Any]], list[dict[str, Any]], list[dict[str, Any]]]:
    records: list[dict[str, Any]] = []
    attempts: list[dict[str, Any]] = []
    failures: list[dict[str, Any]] = []

    for title in WIKIPEDIA_REFERENCE_PAGES:
        url = wikipedia_summary_url(title)
        response = fetch_json(url, f"wiki_summary_{slug(title)}", "Wikipedia REST Summary", "wikipedia_reference_corpus")
        attempts.append(
            {
                "source_id": "wikipedia_rest_summary",
                "source_type": "wikipedia_reference_corpus",
                "title": title,
                "status": response["log"].get("status"),
                "url": url,
                "error": response["log"].get("error"),
                "from_cache": response["log"].get("from_cache"),
                "retrieved_at": response["log"].get("retrieved_at"),
            }
        )
        payload = response.get("payload")
        if not isinstance(payload, dict):
            failures.append(
                build_failure(
                    "wikipedia_rest_summary",
                    "wikipedia_reference_corpus",
                    response["log"].get("error") or "No usable Wikipedia summary payload returned.",
                    {"title": title, "url": url},
                )
            )
            sleep_general()
            continue

        extract = str(payload.get("extract") or "").strip()
        records.append(
            {
                "record_id": f"privacy_expansion_wikipedia_{slug(title)}",
                "source_type": "wikipedia_reference_corpus",
                "page_title": payload.get("title") or title,
                "description": payload.get("description"),
                "wikidata_id": payload.get("wikibase_item"),
                "extract": extract,
                "extract_length": len(extract),
                "content_urls": payload.get("content_urls"),
                "matched_terms": matched_term_rows(extract, REFERENCE_MATCH_TERMS, max_examples=2),
                "source": "Wikipedia REST Summary",
                "source_url": url,
                "confidence": "medium",
                "notes": "Public-knowledge summary text for concept framing and linked topical vocabulary; not a primary historical source.",
            }
        )
        sleep_general()

    sources = [
        {
            "source_id": "wikipedia_rest_summary",
            "source_type": "wikipedia_reference_corpus",
            "source_name": "Wikipedia REST Summary",
            "available": len(records) > 0,
            "records": len(records),
            "notes": "Public summary layer used to widen concept coverage beyond dictionaries and isolated legal texts.",
        }
    ]
    return records, attempts, sources, failures


def collect_legal_institutional_corpus() -> tuple[list[dict[str, Any]], list[dict[str, Any]], list[dict[str, Any]], list[dict[str, Any]]]:
    records: list[dict[str, Any]] = []
    attempts: list[dict[str, Any]] = []
    failures: list[dict[str, Any]] = []

    for doc in LEGAL_AND_INSTITUTIONAL_DOCS:
        response = fetch_text(doc["url"], f"legal_ref_{doc['doc_id']}", doc["label"], "legal_institutional_corpus")
        attempts.append(
            {
                "source_id": doc["doc_id"],
                "source_type": "legal_institutional_corpus",
                "status": response["log"].get("status"),
                "url": doc["url"],
                "error": response["log"].get("error"),
                "from_cache": response["log"].get("from_cache"),
                "retrieved_at": response["log"].get("retrieved_at"),
            }
        )
        payload = response.get("payload")
        if not isinstance(payload, str):
            failures.append(
                build_failure(
                    doc["doc_id"],
                    "legal_institutional_corpus",
                    response["log"].get("error") or "No usable legal/institutional HTML payload returned.",
                    {"url": doc["url"]},
                )
            )
            sleep_general()
            continue

        normalized = normalize_text(payload)
        title_match = re.search(r"<title>(.*?)</title>", payload, flags=re.I | re.S)
        records.append(
            {
                "record_id": f"privacy_expansion_legal_ref_{doc['doc_id']}",
                "source_type": "legal_institutional_corpus",
                "doc_id": doc["doc_id"],
                "label": doc["label"],
                "url": doc["url"],
                "title": html.unescape(title_match.group(1).strip()) if title_match else doc["label"],
                "text_length": len(normalized),
                "matched_terms": matched_term_rows(normalized, REFERENCE_MATCH_TERMS + POLICY_MATCH_TERMS),
                "source": doc["label"],
                "confidence": "medium",
                "notes": "Public legal or institutional explanatory text, useful for doctrinal and governance vocabulary rather than first-attestation evidence.",
            }
        )
        sleep_general()

    sources = [
        {
            "source_id": "legal_institutional_corpus",
            "source_type": "legal_institutional_corpus",
            "source_name": "Legal and institutional public reference documents",
            "available": len(records) > 0,
            "records": len(records),
            "notes": "Explanatory legal and institutional pages broaden privacy beyond dictionary-style summaries and platform policy language.",
        }
    ]
    return records, attempts, sources, failures


def courtlistener_search_url(query: str) -> str:
    params = {
        "q": f'"{query}"',
        "type": "o",
        "order_by": "score desc",
        "page_size": str(COURTLISTENER_LIMIT),
    }
    return f"https://www.courtlistener.com/api/rest/v4/search/?{urllib.parse.urlencode(params)}"


def collect_courtlistener_opinions() -> tuple[list[dict[str, Any]], list[dict[str, Any]], list[dict[str, Any]], list[dict[str, Any]]]:
    records: list[dict[str, Any]] = []
    attempts: list[dict[str, Any]] = []
    failures: list[dict[str, Any]] = []

    for query in COURTLISTENER_QUERIES:
        seen_keys: set[str] = set()
        url = courtlistener_search_url(query)
        response = fetch_json(url, f"courtlistener_{slug(query)}", "CourtListener search", "court_opinion_metadata")
        attempts.append(
            {
                "source_id": "courtlistener_search",
                "source_type": "court_opinion_metadata",
                "query": query,
                "status": response["log"].get("status"),
                "url": url,
                "error": response["log"].get("error"),
                "from_cache": response["log"].get("from_cache"),
                "retrieved_at": response["log"].get("retrieved_at"),
            }
        )
        payload = response.get("payload")
        if not isinstance(payload, dict):
            failures.append(
                build_failure(
                    "courtlistener_search",
                    "court_opinion_metadata",
                    response["log"].get("error") or "No usable CourtListener payload returned.",
                    {"query": query, "url": url},
                )
            )
            sleep_general()
            continue

        for index, item in enumerate(payload.get("results", []), start=1):
            dedupe_key = str(item.get("cluster_id") or item.get("absolute_url") or item.get("caseName") or "")
            if dedupe_key and dedupe_key in seen_keys:
                continue
            if dedupe_key:
                seen_keys.add(dedupe_key)
            records.append(
                {
                    "record_id": f"privacy_expansion_courtlistener_{slug(query)}_{index:03d}",
                    "source_type": "court_opinion_metadata",
                    "query": query,
                    "case_name": item.get("caseName") or item.get("caseNameShort"),
                    "date_filed": item.get("dateFiled"),
                    "year": int(str(item.get("dateFiled"))[:4]) if str(item.get("dateFiled", ""))[:4].isdigit() else None,
                    "court": item.get("court"),
                    "court_citation_string": item.get("court_citation_string"),
                    "docket_number": item.get("docketNumber"),
                    "citation_count": item.get("citeCount"),
                    "cluster_id": item.get("cluster_id"),
                    "opinions": item.get("opinions"),
                    "snippet": item.get("snippet"),
                    "absolute_url": item.get("absolute_url"),
                    "source": "CourtListener",
                    "confidence": "medium",
                    "notes": "Search metadata for privacy-related legal opinions; useful for doctrine discovery, not exhaustive legal history.",
                }
            )
        sleep_general()

    sources = [
        {
            "source_id": "courtlistener_search",
            "source_type": "court_opinion_metadata",
            "source_name": "CourtListener search",
            "available": len(records) > 0,
            "records": len(records),
            "notes": "Opinion-search metadata adds a case-law discovery channel to the privacy research stack.",
        }
    ]
    return records, attempts, sources, failures


def archive_search_url(query: str) -> str:
    params = {
        "q": f'(title:("{query}") OR subject:("{query}")) AND mediatype:texts',
        "fl[]": ["identifier", "title", "creator", "year", "mediatype", "collection", "downloads"],
        "rows": str(ARCHIVE_ROWS),
        "output": "json",
    }
    return f"https://archive.org/advancedsearch.php?{urllib.parse.urlencode(params, doseq=True)}"


def collect_archive_metadata() -> tuple[list[dict[str, Any]], list[dict[str, Any]], list[dict[str, Any]], list[dict[str, Any]]]:
    records: list[dict[str, Any]] = []
    attempts: list[dict[str, Any]] = []
    failures: list[dict[str, Any]] = []

    for query in ARCHIVE_QUERIES:
        url = archive_search_url(query)
        response = fetch_json(url, f"archive_{slug(query)}", "Internet Archive Advanced Search", "archive_metadata")
        attempts.append(
            {
                "source_id": "internet_archive_advanced_search",
                "source_type": "archive_metadata",
                "query": query,
                "status": response["log"].get("status"),
                "url": url,
                "error": response["log"].get("error"),
                "from_cache": response["log"].get("from_cache"),
                "retrieved_at": response["log"].get("retrieved_at"),
            }
        )
        payload = response.get("payload")
        docs = ((payload or {}).get("response") or {}).get("docs") if isinstance(payload, dict) else None
        if not isinstance(docs, list):
            failures.append(
                build_failure(
                    "internet_archive_advanced_search",
                    "archive_metadata",
                    response["log"].get("error") or "No usable Internet Archive docs payload returned.",
                    {"query": query, "url": url},
                )
            )
            sleep_general()
            continue

        for index, doc in enumerate(docs, start=1):
            year_value = doc.get("year")
            year = int(str(year_value)[:4]) if str(year_value)[:4].isdigit() else None
            records.append(
                {
                    "record_id": f"privacy_expansion_archive_{slug(query)}_{index:03d}",
                    "source_type": "archive_metadata",
                    "query": query,
                    "identifier": doc.get("identifier"),
                    "title": doc.get("title"),
                    "creator": doc.get("creator"),
                    "year": year,
                    "mediatype": doc.get("mediatype"),
                    "collection": doc.get("collection"),
                    "downloads": doc.get("downloads"),
                    "source": "Internet Archive",
                    "source_url": f"https://archive.org/details/{doc.get('identifier')}" if doc.get("identifier") else url,
                    "confidence": "low",
                    "notes": "Archive discovery metadata widens bibliographic and collection-level discovery but is not text-level evidence.",
                }
            )
        sleep_general()

    sources = [
        {
            "source_id": "internet_archive_advanced_search",
            "source_type": "archive_metadata",
            "source_name": "Internet Archive Advanced Search",
            "available": len(records) > 0,
            "records": len(records),
            "notes": "Archive metadata adds a discovery channel for book/article titles and collections touching privacy vocabulary.",
        }
    ]
    return records, attempts, sources, failures


def crossref_url(query: str) -> str:
    params = {
        "query.title": query,
        "rows": str(CROSSREF_ROWS),
        "select": "DOI,title,published-print,published-online,issued,type,container-title,publisher,author,subject",
    }
    return f"https://api.crossref.org/works?{urllib.parse.urlencode(params)}"


def crossref_year(item: dict[str, Any]) -> int | None:
    for key in ("published-print", "published-online", "issued"):
        parts = ((item.get(key) or {}).get("date-parts") or [])
        if parts and parts[0] and str(parts[0][0]).isdigit():
            return int(parts[0][0])
    return None


def collect_crossref_publication_metadata() -> tuple[list[dict[str, Any]], list[dict[str, Any]], list[dict[str, Any]], list[dict[str, Any]]]:
    records: list[dict[str, Any]] = []
    attempts: list[dict[str, Any]] = []
    failures: list[dict[str, Any]] = []

    for query in CROSSREF_QUERIES:
        url = crossref_url(query)
        response = fetch_json(url, f"crossref_{slug(query)}", "Crossref works", "publication_metadata")
        attempts.append(
            {
                "source_id": "crossref_works",
                "source_type": "publication_metadata",
                "query": query,
                "status": response["log"].get("status"),
                "url": url,
                "error": response["log"].get("error"),
                "from_cache": response["log"].get("from_cache"),
                "retrieved_at": response["log"].get("retrieved_at"),
            }
        )
        payload = response.get("payload")
        items = ((payload or {}).get("message") or {}).get("items") if isinstance(payload, dict) else None
        if not isinstance(items, list):
            failures.append(
                build_failure(
                    "crossref_works",
                    "publication_metadata",
                    response["log"].get("error") or "No usable Crossref items payload returned.",
                    {"query": query, "url": url},
                )
            )
            sleep_general()
            continue

        for index, item in enumerate(items, start=1):
            title_list = item.get("title") or []
            container_list = item.get("container-title") or []
            title = title_list[0] if title_list else None
            container = container_list[0] if container_list else None
            author_names = []
            for author in item.get("author") or []:
                name = " ".join(part for part in [author.get("given"), author.get("family")] if part)
                if name:
                    author_names.append(name)
            records.append(
                {
                    "record_id": f"privacy_expansion_crossref_{slug(query)}_{index:03d}",
                    "source_type": "publication_metadata",
                    "query": query,
                    "doi": item.get("DOI"),
                    "title": title,
                    "publication_year": crossref_year(item),
                    "type": item.get("type"),
                    "container_title": container,
                    "publisher": item.get("publisher"),
                    "authors": author_names,
                    "subjects": item.get("subject") or [],
                    "source": "Crossref",
                    "source_url": f"https://doi.org/{item.get('DOI')}" if item.get("DOI") else url,
                    "confidence": "medium",
                    "notes": "Publication/discovery metadata expands privacy research across article, chapter, and book-title channels.",
                }
            )
        sleep_general()

    sources = [
        {
            "source_id": "crossref_works",
            "source_type": "publication_metadata",
            "source_name": "Crossref works",
            "available": len(records) > 0,
            "records": len(records),
            "notes": "Publication metadata adds another non-dictionary discovery channel for privacy-related scholarship and books.",
        }
    ]
    return records, attempts, sources, failures


def gdelt_artlist_url(query: str) -> str:
    params = {
        "query": query,
        "mode": "ArtList",
        "format": "json",
        "maxrecords": "10",
        "sort": "datedesc",
        "startdatetime": "20240101000000",
        "enddatetime": "20261231235959",
    }
    return f"https://api.gdeltproject.org/api/v2/doc/doc?{urllib.parse.urlencode(params)}"


def gdelt_timeline_url(query: str) -> str:
    params = {
        "query": query,
        "mode": "TimelineVol",
        "format": "json",
        "timespan": "180days",
    }
    return f"https://api.gdeltproject.org/api/v2/doc/doc?{urllib.parse.urlencode(params)}"


def collect_gdelt_expansion() -> tuple[list[dict[str, Any]], list[dict[str, Any]], list[dict[str, Any]], list[dict[str, Any]], list[dict[str, Any]]]:
    discourse_records: list[dict[str, Any]] = []
    attention_records: list[dict[str, Any]] = []
    attempts: list[dict[str, Any]] = []
    failures: list[dict[str, Any]] = []

    for query in GDELT_DISCOURSE_TERMS:
        url = gdelt_artlist_url(query)
        response = fetch_json(url, f"gdelt_discourse_{slug(query)}", "GDELT DOC 2.0", "news_discourse_expansion", retries=0)
        attempts.append(
            {
                "source_id": "gdelt_doc_artlist",
                "source_type": "news_discourse_expansion",
                "query": query,
                "status": response["log"].get("status"),
                "url": url,
                "error": response["log"].get("error"),
                "from_cache": response["log"].get("from_cache"),
                "retrieved_at": response["log"].get("retrieved_at"),
            }
        )
        payload = response.get("payload")
        if not isinstance(payload, dict):
            failures.append(
                build_failure(
                    "gdelt_doc_artlist",
                    "news_discourse_expansion",
                    response["log"].get("error") or "No usable GDELT artlist payload returned.",
                    {"query": query, "url": url},
                )
            )
            sleep_gdelt()
            continue
        for index, article in enumerate(payload.get("articles", []), start=1):
            seendate = article.get("seendate")
            discourse_records.append(
                {
                    "record_id": f"privacy_expansion_gdelt_discourse_{slug(query)}_{index:03d}",
                    "source_type": "news_discourse_expansion",
                    "query": query,
                    "date": seendate,
                    "year": int(str(seendate)[:4]) if str(seendate)[:4].isdigit() else None,
                    "title": article.get("title"),
                    "domain": article.get("domain"),
                    "source_country": article.get("sourcecountry"),
                    "url": article.get("url"),
                    "language": article.get("language"),
                    "source": "GDELT DOC 2.0",
                    "confidence": "medium",
                    "notes": "News discourse metadata; strongest geography here is source country rather than mentioned-location coordinates.",
                }
            )
        sleep_gdelt()

    for query in GDELT_ATTENTION_TERMS:
        url = gdelt_timeline_url(query)
        response = fetch_json(url, f"gdelt_timeline_{slug(query)}", "GDELT DOC 2.0", "news_attention_proxy", retries=0)
        attempts.append(
            {
                "source_id": "gdelt_doc_timelinevol",
                "source_type": "news_attention_proxy",
                "query": query,
                "status": response["log"].get("status"),
                "url": url,
                "error": response["log"].get("error"),
                "from_cache": response["log"].get("from_cache"),
                "retrieved_at": response["log"].get("retrieved_at"),
            }
        )
        payload = response.get("payload")
        if not isinstance(payload, dict):
            failures.append(
                build_failure(
                    "gdelt_doc_timelinevol",
                    "news_attention_proxy",
                    response["log"].get("error") or "No usable GDELT timeline payload returned.",
                    {"query": query, "url": url},
                )
            )
            sleep_gdelt()
            continue
        for series in payload.get("timeline", []):
            for point in series.get("data", []):
                attention_records.append(
                    {
                        "record_id": f"privacy_expansion_gdelt_attention_{slug(query)}_{slug(str(point.get('date')))}",
                        "source_type": "news_attention_proxy",
                        "query": query,
                        "series": series.get("series"),
                        "date": point.get("date"),
                        "year": int(str(point.get("date"))[:4]) if str(point.get("date"))[:4].isdigit() else None,
                        "value": point.get("value"),
                        "source": "GDELT DOC 2.0",
                        "confidence": "medium",
                        "notes": "Volume intensity is a news-volume proxy, not a direct measure of importance or usage.",
                    }
                )
        sleep_gdelt()

    sources = [
        {
            "source_id": "gdelt_doc_artlist",
            "source_type": "news_discourse_expansion",
            "source_name": "GDELT DOC 2.0 ArtList",
            "available": len(discourse_records) > 0,
            "records": len(discourse_records),
            "notes": "Used for recent discourse metadata around legal, platform, and transition privacy queries.",
        },
        {
            "source_id": "gdelt_doc_timelinevol",
            "source_type": "news_attention_proxy",
            "source_name": "GDELT DOC 2.0 TimelineVol",
            "available": len(attention_records) > 0,
            "records": len(attention_records),
            "notes": "Used as a second attention-like proxy via news volume intensity.",
        },
    ]
    return discourse_records, attention_records, attempts, sources, failures


def openalex_works_url(query: str, page: int) -> str:
    params = {
        "search": query,
        "per-page": str(OPENALEX_PER_PAGE),
        "page": str(page),
        "select": "id,display_name,publication_year,publication_date,authorships,type,cited_by_count,doi,primary_topic",
        "mailto": "local@wordsovertime.invalid",
    }
    return f"https://api.openalex.org/works?{urllib.parse.urlencode(params)}"


def openalex_institution_url(institution_id: str) -> str:
    encoded = urllib.parse.quote(institution_id, safe=":/")
    params = urllib.parse.urlencode(
        {
            "select": "id,display_name,country_code,geo,type",
            "mailto": "local@wordsovertime.invalid",
        }
    )
    return f"https://api.openalex.org/institutions/{encoded}?{params}"


def collect_openalex_transition() -> tuple[list[dict[str, Any]], list[dict[str, Any]], list[dict[str, Any]], list[dict[str, Any]], list[dict[str, Any]]]:
    records: list[dict[str, Any]] = []
    institution_geo: list[dict[str, Any]] = []
    attempts: list[dict[str, Any]] = []
    failures: list[dict[str, Any]] = []
    institution_counts: dict[str, int] = {}

    for query in OPENALEX_TRANSITION_TERMS:
        for page in range(1, OPENALEX_PAGES + 1):
            url = openalex_works_url(query, page)
            response = fetch_json(url, f"openalex_transition_{slug(query)}_{page}", "OpenAlex works", "academic_transition_expansion")
            attempts.append(
                {
                    "source_id": "openalex_transition_works",
                    "source_type": "academic_transition_expansion",
                    "query": query,
                    "page": page,
                    "status": response["log"].get("status"),
                    "url": url,
                    "error": response["log"].get("error"),
                    "from_cache": response["log"].get("from_cache"),
                    "retrieved_at": response["log"].get("retrieved_at"),
                }
            )
            payload = response.get("payload")
            if not isinstance(payload, dict):
                failures.append(
                    build_failure(
                        "openalex_transition_works",
                        "academic_transition_expansion",
                        response["log"].get("error") or "No usable OpenAlex works payload returned.",
                        {"query": query, "page": page},
                    )
                )
                sleep_general()
                continue
            for work in payload.get("results", []):
                authorships = work.get("authorships", [])
                if not authorships:
                    records.append(
                        {
                            "record_id": f"privacy_expansion_openalex_{slug(query)}_{slug(str(work.get('id')))}_noinst",
                            "source_type": "academic_transition_expansion",
                            "query": query,
                            "work_id": work.get("id"),
                            "title": work.get("display_name"),
                            "publication_year": work.get("publication_year"),
                            "publication_date": work.get("publication_date"),
                            "type": work.get("type"),
                            "cited_by_count": work.get("cited_by_count"),
                            "doi": work.get("doi"),
                            "topic": (work.get("primary_topic") or {}).get("display_name"),
                            "institution_id": None,
                            "institution_name": None,
                            "country_code": None,
                            "country": None,
                            "region": None,
                            "city": None,
                            "latitude": None,
                            "longitude": None,
                            "source": "OpenAlex",
                            "confidence": "low",
                            "notes": "No institution metadata returned on this work.",
                        }
                    )
                    continue
                for authorship in authorships:
                    for institution in authorship.get("institutions", []):
                        institution_id = institution.get("id")
                        if institution_id:
                            institution_counts[institution_id] = institution_counts.get(institution_id, 0) + 1
                        records.append(
                            {
                                "record_id": f"privacy_expansion_openalex_{slug(query)}_{slug(str(work.get('id')))}_{slug(str(institution_id))}",
                                "source_type": "academic_transition_expansion",
                                "query": query,
                                "work_id": work.get("id"),
                                "title": work.get("display_name"),
                                "publication_year": work.get("publication_year"),
                                "publication_date": work.get("publication_date"),
                                "type": work.get("type"),
                                "cited_by_count": work.get("cited_by_count"),
                                "doi": work.get("doi"),
                                "topic": (work.get("primary_topic") or {}).get("display_name"),
                                "institution_id": institution_id,
                                "institution_name": institution.get("display_name"),
                                "country_code": institution.get("country_code"),
                                "country": institution.get("country_code"),
                                "region": None,
                                "city": None,
                                "latitude": None,
                                "longitude": None,
                                "source": "OpenAlex",
                                "confidence": "medium",
                                "notes": None,
                            }
                        )
            sleep_general()

    sorted_institutions = sorted(institution_counts.items(), key=lambda item: item[1], reverse=True)[:OPENALEX_INSTITUTION_LIMIT]
    geo_by_id: dict[str, dict[str, Any]] = {}
    for institution_id, _count in sorted_institutions:
        url = openalex_institution_url(institution_id)
        response = fetch_json(url, f"openalex_transition_inst_{slug(institution_id)}", "OpenAlex institutions", "academic_transition_expansion")
        attempts.append(
            {
                "source_id": "openalex_transition_institutions",
                "source_type": "academic_transition_expansion",
                "institution_id": institution_id,
                "status": response["log"].get("status"),
                "url": url,
                "error": response["log"].get("error"),
                "from_cache": response["log"].get("from_cache"),
                "retrieved_at": response["log"].get("retrieved_at"),
            }
        )
        payload = response.get("payload")
        if not isinstance(payload, dict):
            failures.append(
                build_failure(
                    "openalex_transition_institutions",
                    "academic_transition_expansion",
                    response["log"].get("error") or "No usable OpenAlex institution payload returned.",
                    {"institution_id": institution_id},
                )
            )
            sleep_general()
            continue
        geo = payload.get("geo") or {}
        row = {
            "institution_id": payload.get("id"),
            "institution_name": payload.get("display_name"),
            "country_code": payload.get("country_code"),
            "country": geo.get("country") or payload.get("country_code"),
            "region": geo.get("region"),
            "city": geo.get("city"),
            "latitude": geo.get("latitude"),
            "longitude": geo.get("longitude"),
            "type": payload.get("type"),
        }
        institution_geo.append(row)
        geo_by_id[row["institution_id"]] = row
        sleep_general()

    for row in records:
        institution_id = row.get("institution_id")
        if not institution_id or institution_id not in geo_by_id:
            continue
        geo = geo_by_id[institution_id]
        row["institution_name"] = geo.get("institution_name") or row.get("institution_name")
        row["country_code"] = geo.get("country_code") or row.get("country_code")
        row["country"] = geo.get("country") or row.get("country")
        row["region"] = geo.get("region")
        row["city"] = geo.get("city")
        row["latitude"] = geo.get("latitude")
        row["longitude"] = geo.get("longitude")

    sources = [
        {
            "source_id": "openalex_transition_works",
            "source_type": "academic_transition_expansion",
            "source_name": "OpenAlex works",
            "available": len(records) > 0,
            "records": len(records),
            "notes": "Used for extra transition and institution geography beyond the first geo layer.",
        },
        {
            "source_id": "openalex_transition_institutions",
            "source_type": "academic_transition_expansion",
            "source_name": "OpenAlex institutions",
            "available": len(institution_geo) > 0,
            "records": len(institution_geo),
            "notes": "Enriched high-frequency institutions with city/region/country/coordinates.",
        },
    ]
    return records, institution_geo, attempts, sources, failures


def main() -> None:
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    CACHE_DIR.mkdir(parents=True, exist_ok=True)

    public_records, public_attempts, public_sources, public_failures = collect_public_dated_evidence()
    phrase_records, phrase_attempts, phrase_sources, phrase_failures = collect_phrase_frequency_expansion()
    policy_records, policy_attempts, policy_sources, policy_failures = collect_policy_and_platform_texts()
    wikipedia_records, wikipedia_attempts, wikipedia_sources, wikipedia_failures = collect_wikipedia_reference_corpus()
    legal_records, legal_attempts, legal_sources, legal_failures = collect_legal_institutional_corpus()
    gdelt_discourse, gdelt_attention, gdelt_attempts, gdelt_sources, gdelt_failures = collect_gdelt_expansion()
    court_records, court_attempts, court_sources, court_failures = collect_courtlistener_opinions()
    archive_records, archive_attempts, archive_sources, archive_failures = collect_archive_metadata()
    crossref_records, crossref_attempts, crossref_sources, crossref_failures = collect_crossref_publication_metadata()
    openalex_records, openalex_institutions, openalex_attempts, openalex_sources, openalex_failures = collect_openalex_transition()

    payload = {
        "metadata": {
            "word": WORD,
            "layer_id": LAYER_ID,
            "title": "Privacy supplemental research expansion",
            "generated_at": utc_now(),
            "generated_by_script": "scripts/scrape_privacy_research_expansion.py",
            "notes": [
                "This layer supplements existing privacy modules with deeper transition and evidence-gap collection.",
                "No single source here should be treated as a final narrative authority.",
                "Attention proxies and discourse metadata remain proxies rather than direct measures of importance.",
            ],
        },
        "sources": public_sources + phrase_sources + policy_sources + wikipedia_sources + legal_sources + gdelt_sources + court_sources + archive_sources + crossref_sources + openalex_sources,
        "source_attempts": public_attempts + phrase_attempts + policy_attempts + wikipedia_attempts + legal_attempts + gdelt_attempts + court_attempts + archive_attempts + crossref_attempts + openalex_attempts,
        "public_dated_evidence": public_records,
        "supplemental_phrase_frequency": phrase_records,
        "platform_policy_corpus": policy_records,
        "wikipedia_reference_corpus": wikipedia_records,
        "legal_institutional_corpus": legal_records,
        "news_discourse_expansion": gdelt_discourse,
        "news_attention_proxy": gdelt_attention,
        "court_opinion_metadata": court_records,
        "archive_metadata": archive_records,
        "publication_metadata": crossref_records,
        "academic_transition_expansion": openalex_records,
        "academic_transition_institutions": openalex_institutions,
        "failed_sources": public_failures + phrase_failures + policy_failures + wikipedia_failures + legal_failures + gdelt_failures + court_failures + archive_failures + crossref_failures + openalex_failures,
    }
    write_json(RAW_PATH, payload)

    print("Privacy research expansion scrape summary")
    print(f"- Public dated evidence records: {len(public_records)}")
    print(f"- Supplemental phrase rows: {len(phrase_records)}")
    print(f"- Policy/platform documents: {len(policy_records)}")
    print(f"- Wikipedia reference records: {len(wikipedia_records)}")
    print(f"- Legal/institutional records: {len(legal_records)}")
    print(f"- GDELT discourse rows: {len(gdelt_discourse)}")
    print(f"- GDELT attention rows: {len(gdelt_attention)}")
    print(f"- Court opinion records: {len(court_records)}")
    print(f"- Archive metadata rows: {len(archive_records)}")
    print(f"- Crossref publication rows: {len(crossref_records)}")
    print(f"- OpenAlex transition rows: {len(openalex_records)}")
    print(f"- OpenAlex institution rows: {len(openalex_institutions)}")
    print(f"- Failed source rows: {len(payload['failed_sources'])}")
    print(f"- Raw output: {RAW_PATH}")


if __name__ == "__main__":
    main()
