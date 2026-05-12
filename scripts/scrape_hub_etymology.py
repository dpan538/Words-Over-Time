#!/usr/bin/env python3
"""Second-pass etymology and earliest-attestation collection for hub.

This script keeps the attestation layer separate from the first-pass frequency
and phrase dataset. It records dictionary claims, historical dictionary entries,
search attempts, and usable early evidence candidates without promoting any
claim to a confirmed first use unless the source supports that.
"""

from __future__ import annotations

import hashlib
import html
import http.client
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
REPORTS_DIR = RESEARCH_DIR / "reports"
CACHE_DIR = RAW_DIR / "etymology_cache"
FIRST_PASS_SNIPPETS = PROCESSED_DIR / "hub_snippet_samples.json"
FIRST_PASS_PHRASES = PROCESSED_DIR / "hub_phrase_series.json"

CACHE_ONLY = "--cache-only" in sys.argv
REQUEST_DELAY_SECONDS = 0.35
USER_AGENT = "WordsOverTime/0.1 hub etymology pass; contact: local research script"


SENSES: dict[str, str] = {
    "mechanical_core": "Mechanical wheel center",
    "central_place": "Central place or focus",
    "transport_logistics": "Transport and logistics node",
    "network_system": "Communication, computing, or network node",
    "institutional_cluster": "Institutional, economic, cultural, or knowledge cluster",
    "digital_platform": "Digital, content, data, or resource platform",
}


REFERENCE_SOURCES: list[dict[str, Any]] = [
    {
        "id": "etymonline_hub",
        "source_name": "Online Etymology Dictionary",
        "url": "https://www.etymonline.com/word/hub",
        "source_type": "secondary_etymology",
        "entry_term": "hub",
        "expected_claims": [
            "Wheel-center sense dated to the 1640s.",
            "Origin described as uncertain, with a possible hubbe/hob family link.",
            "Center-of-activity sense dated to Oliver Wendell Holmes in 1858.",
        ],
    },
    {
        "id": "etymonline_hubcap",
        "source_name": "Online Etymology Dictionary",
        "url": "https://www.etymonline.com/word/hubcap",
        "source_type": "secondary_etymology",
        "entry_term": "hubcap",
        "expected_claims": ["Hubcap / hub cap dated to 1896 as hub plus cap."],
    },
    {
        "id": "merriam_webster_hub",
        "source_name": "Merriam-Webster",
        "url": "https://www.merriam-webster.com/dictionary/hub",
        "source_type": "dictionary",
        "entry_term": "hub",
        "expected_claims": [
            "First known use listed as 1649 for the central circular-object sense.",
            "Etymology summarized as probably an alteration of hob.",
        ],
    },
    {
        "id": "merriam_webster_hubcap",
        "source_name": "Merriam-Webster",
        "url": "https://www.merriam-webster.com/dictionary/hubcap",
        "source_type": "dictionary",
        "entry_term": "hubcap",
        "expected_claims": ["First known use listed as 1903."],
    },
    {
        "id": "merriam_webster_hub_and_spoke",
        "source_name": "Merriam-Webster",
        "url": "https://www.merriam-webster.com/dictionary/hub-and-spoke",
        "source_type": "dictionary",
        "entry_term": "hub-and-spoke",
        "expected_claims": ["First known use listed as 1980 for air-traffic routing systems."],
    },
    {
        "id": "merriam_webster_nave",
        "source_name": "Merriam-Webster",
        "url": "https://www.merriam-webster.com/dictionary/nave",
        "source_type": "dictionary",
        "entry_term": "nave",
        "expected_claims": ["Nave is an older wheel-center term, with first known use before the 12th century."],
    },
    {
        "id": "wiktionary_hub",
        "source_name": "Wiktionary",
        "url": "https://en.wiktionary.org/wiki/hub",
        "source_type": "dictionary",
        "entry_term": "hub",
        "expected_claims": [
            "Etymology gives earlier hubbe, shared with hob, and describes ultimate origin as unknown.",
            "Sense inventory includes wheel center, traffic distribution point, activity center, and networking device.",
        ],
    },
    {
        "id": "webster_1828_hub",
        "source_name": "Webster 1828",
        "url": "https://webstersdictionary1828.com/Dictionary/hub",
        "source_type": "historical_dictionary",
        "entry_term": "hub",
        "expected_claims": ["Historical dictionary entry defines hub as the nave of a wheel."],
    },
    {
        "id": "webster_1913_hub",
        "source_name": "Webster's Revised Unabridged Dictionary 1913",
        "url": "https://www.websters1913.com/words/Hub",
        "source_type": "historical_dictionary",
        "entry_term": "hub",
        "expected_claims": ["Historical dictionary entry defines hub as the central part of a wheel; the nave."],
    },
    {
        "id": "cambridge_hub",
        "source_name": "Cambridge Dictionary",
        "url": "https://dictionary.cambridge.org/dictionary/english/hub",
        "source_type": "dictionary",
        "entry_term": "hub",
        "expected_claims": ["Modern entry separates central place, wheel, IT, and transport/business senses."],
    },
    {
        "id": "collins_hub",
        "source_name": "Collins Dictionary",
        "url": "https://www.collinsdictionary.com/dictionary/english/hub",
        "source_type": "dictionary",
        "entry_term": "hub",
        "expected_claims": ["Modern dictionary sense comparison; may block automated access."],
    },
]


STATIC_DICTIONARY_ATTESTATIONS: list[dict[str, Any]] = [
    {
        "id": "hub_attestation_001",
        "term": "hub",
        "sense_id": "mechanical_core",
        "claimed_year": 1640,
        "evidence_year": None,
        "year_type": "dictionary_claim",
        "source_title": "Online Etymology Dictionary: hub",
        "source_author": "Douglas Harper",
        "source_date": "current public entry",
        "source_url": "https://www.etymonline.com/word/hub",
        "source_type": "secondary_etymology",
        "evidence_text_short": "",
        "definition_or_context_summary": "Dates the wheel-center sense to the 1640s and treats the origin as uncertain.",
        "is_direct_attestation": False,
        "is_dictionary_claim": True,
        "confidence": "medium",
        "reliability_notes": "Approximate decade claim from a secondary etymology source; no primary quotation visible in the entry.",
        "copyright_notes": "Paraphrased; no long quotation copied.",
    },
    {
        "id": "hub_attestation_002",
        "term": "hub",
        "sense_id": "mechanical_core",
        "claimed_year": 1649,
        "evidence_year": None,
        "year_type": "dictionary_claim",
        "source_title": "Merriam-Webster: hub",
        "source_author": "Merriam-Webster",
        "source_date": "current public entry",
        "source_url": "https://www.merriam-webster.com/dictionary/hub",
        "source_type": "dictionary",
        "evidence_text_short": "",
        "definition_or_context_summary": "Lists first known use as 1649 for the central circular-object sense.",
        "is_direct_attestation": False,
        "is_dictionary_claim": True,
        "confidence": "medium",
        "reliability_notes": "First-known-use claim from dictionary scholarship; no quotation is visible in the public entry.",
        "copyright_notes": "Paraphrased; no long quotation copied.",
    },
    {
        "id": "hub_attestation_003",
        "term": "hub",
        "sense_id": "mechanical_core",
        "claimed_year": None,
        "evidence_year": 1828,
        "year_type": "exact",
        "source_title": "American Dictionary of the English Language",
        "source_author": "Noah Webster",
        "source_date": "1828",
        "source_url": "https://webstersdictionary1828.com/Dictionary/hub",
        "source_type": "historical_dictionary",
        "evidence_text_short": "The nave of a wheel.",
        "definition_or_context_summary": "Dated public historical dictionary entry gives the wheel-center meaning.",
        "is_direct_attestation": True,
        "is_dictionary_claim": False,
        "confidence": "medium",
        "reliability_notes": "Direct dated dictionary entry supports sense availability by 1828; it is not a first-use quotation.",
        "copyright_notes": "Public-domain dictionary; short excerpt.",
    },
    {
        "id": "hub_attestation_004",
        "term": "hub",
        "sense_id": "mechanical_core",
        "claimed_year": None,
        "evidence_year": 1913,
        "year_type": "exact",
        "source_title": "Webster's Revised Unabridged Dictionary",
        "source_author": "C. & G. Merriam",
        "source_date": "1913",
        "source_url": "https://www.websters1913.com/words/Hub",
        "source_type": "historical_dictionary",
        "evidence_text_short": "The central part ... of a wheel; the nave.",
        "definition_or_context_summary": "Public-domain dictionary confirms the wheel-center sense and synonym nave.",
        "is_direct_attestation": True,
        "is_dictionary_claim": False,
        "confidence": "medium",
        "reliability_notes": "Direct dated dictionary entry, but later than 1828 and not a usage quotation.",
        "copyright_notes": "Public-domain dictionary; short excerpt.",
    },
    {
        "id": "hub_attestation_005",
        "term": "hub",
        "sense_id": "central_place",
        "claimed_year": 1858,
        "evidence_year": 1858,
        "year_type": "dictionary_claim",
        "source_title": "Online Etymology Dictionary: hub",
        "source_author": "Douglas Harper",
        "source_date": "current public entry",
        "source_url": "https://www.etymonline.com/word/hub",
        "source_type": "secondary_etymology",
        "evidence_text_short": "Boston State-House is the hub of the solar system.",
        "definition_or_context_summary": "Dates the center-of-interest/activity sense to Oliver Wendell Holmes and Boston.",
        "is_direct_attestation": False,
        "is_dictionary_claim": True,
        "confidence": "medium",
        "reliability_notes": "Secondary source quotes a dated primary example; primary text was not independently verified in this pass.",
        "copyright_notes": "Short quotation under 25 words from a non-lyrical source.",
    },
    {
        "id": "hub_attestation_006",
        "term": "hubcap",
        "sense_id": "mechanical_core",
        "claimed_year": 1896,
        "evidence_year": None,
        "year_type": "dictionary_claim",
        "source_title": "Online Etymology Dictionary: hubcap",
        "source_author": "Douglas Harper",
        "source_date": "current public entry",
        "source_url": "https://www.etymonline.com/word/hubcap",
        "source_type": "secondary_etymology",
        "evidence_text_short": "",
        "definition_or_context_summary": "Dates hubcap / hub cap to 1896 as a compound from hub plus cap.",
        "is_direct_attestation": False,
        "is_dictionary_claim": True,
        "confidence": "medium",
        "reliability_notes": "Secondary etymology claim; no visible dated quotation in the entry.",
        "copyright_notes": "Paraphrased.",
    },
    {
        "id": "hub_attestation_007",
        "term": "hubcap",
        "sense_id": "mechanical_core",
        "claimed_year": 1903,
        "evidence_year": None,
        "year_type": "dictionary_claim",
        "source_title": "Merriam-Webster: hubcap",
        "source_author": "Merriam-Webster",
        "source_date": "current public entry",
        "source_url": "https://www.merriam-webster.com/dictionary/hubcap",
        "source_type": "dictionary",
        "evidence_text_short": "",
        "definition_or_context_summary": "Lists first known use of hubcap as 1903.",
        "is_direct_attestation": False,
        "is_dictionary_claim": True,
        "confidence": "medium",
        "reliability_notes": "Dictionary first-known-use claim; no quotation visible in the public entry.",
        "copyright_notes": "Paraphrased.",
    },
    {
        "id": "hub_attestation_008",
        "term": "hub-and-spoke",
        "sense_id": "transport_logistics",
        "claimed_year": 1980,
        "evidence_year": None,
        "year_type": "dictionary_claim",
        "source_title": "Merriam-Webster: hub-and-spoke",
        "source_author": "Merriam-Webster",
        "source_date": "current public entry",
        "source_url": "https://www.merriam-webster.com/dictionary/hub-and-spoke",
        "source_type": "dictionary",
        "evidence_text_short": "",
        "definition_or_context_summary": "Defines hub-and-spoke as an air-traffic routing system and lists first known use as 1980.",
        "is_direct_attestation": False,
        "is_dictionary_claim": True,
        "confidence": "medium",
        "reliability_notes": "Dictionary claim for a specific transport-system adjective; no quotation visible in the public entry.",
        "copyright_notes": "Paraphrased.",
    },
    {
        "id": "hub_attestation_009",
        "term": "nave",
        "sense_id": "mechanical_core",
        "claimed_year": 1100,
        "evidence_year": None,
        "year_type": "dictionary_claim",
        "source_title": "Merriam-Webster: nave",
        "source_author": "Merriam-Webster",
        "source_date": "current public entry",
        "source_url": "https://www.merriam-webster.com/dictionary/nave",
        "source_type": "dictionary",
        "evidence_text_short": "",
        "definition_or_context_summary": "Nave is treated as an older wheel-center term, with first known use before the 12th century.",
        "is_direct_attestation": False,
        "is_dictionary_claim": True,
        "confidence": "medium",
        "reliability_notes": "Related-term evidence only; not an attestation of hub itself.",
        "copyright_notes": "Paraphrased.",
    },
]


SEARCH_QUERIES: list[dict[str, str]] = [
    {"query": "hub", "term": "hub", "sense_id": "mechanical_core"},
    {"query": "hub of a wheel", "term": "hub of a wheel", "sense_id": "mechanical_core"},
    {"query": "hub of the wheel", "term": "hub of the wheel", "sense_id": "mechanical_core"},
    {"query": "wheel hub", "term": "wheel hub", "sense_id": "mechanical_core"},
    {"query": "axle hub", "term": "axle hub", "sense_id": "mechanical_core"},
    {"query": "hub cap", "term": "hub cap", "sense_id": "mechanical_core"},
    {"query": "hub of activity", "term": "hub of activity", "sense_id": "central_place"},
    {"query": "hub of commerce", "term": "hub of commerce", "sense_id": "central_place"},
    {"query": "hub of trade", "term": "hub of trade", "sense_id": "central_place"},
    {"query": "hub of industry", "term": "hub of industry", "sense_id": "central_place"},
    {"query": "hub of the city", "term": "hub of the city", "sense_id": "central_place"},
    {"query": "social hub", "term": "social hub", "sense_id": "central_place"},
    {"query": "commercial hub", "term": "commercial hub", "sense_id": "institutional_cluster"},
    {"query": "railway hub", "term": "railway hub", "sense_id": "transport_logistics"},
    {"query": "railroad hub", "term": "railroad hub", "sense_id": "transport_logistics"},
    {"query": "transport hub", "term": "transport hub", "sense_id": "transport_logistics"},
    {"query": "transit hub", "term": "transit hub", "sense_id": "transport_logistics"},
    {"query": "airport hub", "term": "airport hub", "sense_id": "transport_logistics"},
    {"query": "airline hub", "term": "airline hub", "sense_id": "transport_logistics"},
    {"query": "shipping hub", "term": "shipping hub", "sense_id": "transport_logistics"},
    {"query": "logistics hub", "term": "logistics hub", "sense_id": "transport_logistics"},
    {"query": "hub and spoke", "term": "hub and spoke", "sense_id": "transport_logistics"},
    {"query": "hub-and-spoke", "term": "hub-and-spoke", "sense_id": "transport_logistics"},
    {"query": "communication hub", "term": "communication hub", "sense_id": "network_system"},
    {"query": "network hub", "term": "network hub", "sense_id": "network_system"},
    {"query": "hub node", "term": "hub node", "sense_id": "network_system"},
    {"query": "Ethernet hub", "term": "Ethernet hub", "sense_id": "network_system"},
    {"query": "internet hub", "term": "internet hub", "sense_id": "network_system"},
    {"query": "server hub", "term": "server hub", "sense_id": "network_system"},
    {"query": "business hub", "term": "business hub", "sense_id": "institutional_cluster"},
    {"query": "financial hub", "term": "financial hub", "sense_id": "institutional_cluster"},
    {"query": "knowledge hub", "term": "knowledge hub", "sense_id": "institutional_cluster"},
    {"query": "education hub", "term": "education hub", "sense_id": "institutional_cluster"},
    {"query": "innovation hub", "term": "innovation hub", "sense_id": "institutional_cluster"},
    {"query": "research hub", "term": "research hub", "sense_id": "institutional_cluster"},
    {"query": "startup hub", "term": "startup hub", "sense_id": "institutional_cluster"},
    {"query": "digital hub", "term": "digital hub", "sense_id": "digital_platform"},
    {"query": "content hub", "term": "content hub", "sense_id": "digital_platform"},
    {"query": "data hub", "term": "data hub", "sense_id": "digital_platform"},
    {"query": "resource hub", "term": "resource hub", "sense_id": "digital_platform"},
    {"query": "learning hub", "term": "learning hub", "sense_id": "digital_platform"},
    {"query": "platform hub", "term": "platform hub", "sense_id": "digital_platform"},
]


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def ensure_dirs() -> None:
    for directory in (RAW_DIR, PROCESSED_DIR, REPORTS_DIR, CACHE_DIR):
        directory.mkdir(parents=True, exist_ok=True)


def write_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def slug(value: str) -> str:
    return re.sub(r"_+", "_", re.sub(r"[^a-z0-9]+", "_", value.lower())).strip("_")


def clean_text(value: str) -> str:
    value = html.unescape(value)
    value = re.sub(r"<[^>]+>", " ", value)
    value = re.sub(r"\s+", " ", value)
    return value.strip()


def clip_words(value: str, max_words: int = 24) -> str:
    words = clean_text(value).split()
    if len(words) <= max_words:
        return " ".join(words)
    return " ".join(words[:max_words]).rstrip(" ,;:") + "..."


def parse_year(value: Any) -> int | None:
    if value is None:
        return None
    match = re.search(r"(1[0-9]\d{2}|20\d{2})", str(value))
    return int(match.group(1)) if match else None


def cache_path(prefix: str, url: str, suffix: str) -> Path:
    digest = hashlib.sha1(url.encode("utf-8")).hexdigest()[:16]
    return CACHE_DIR / f"{prefix}_{digest}.{suffix}"


def fetch_url(url: str, prefix: str, suffix: str = "txt", timeout: int = 20) -> dict[str, Any]:
    path = cache_path(prefix, url, suffix)
    log: dict[str, Any] = {
        "url": url,
        "cache_path": str(path.relative_to(ROOT)),
        "from_cache": path.exists(),
        "ok": False,
        "status_code": None,
        "content_type": None,
        "error": None,
    }
    if path.exists():
        try:
            data = path.read_bytes()
            log.update({"ok": True, "bytes": len(data)})
            return {"log": log, "data": data}
        except OSError as exc:
            log["error"] = f"Cache read failed: {exc}"

    if CACHE_ONLY:
        log["error"] = "Cache-only mode: no cached response for this URL."
        return {"log": log, "data": None}

    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT, "Accept": "*/*"})
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            data = response.read()
            path.write_bytes(data)
            log.update(
                {
                    "ok": True,
                    "status_code": getattr(response, "status", None),
                    "content_type": response.headers.get("Content-Type"),
                    "bytes": len(data),
                    "from_cache": False,
                }
            )
            return {"log": log, "data": data}
    except urllib.error.HTTPError as exc:
        log.update({"status_code": exc.code, "error": f"HTTPError: {exc.reason}"})
    except urllib.error.URLError as exc:
        log["error"] = f"URLError: {exc.reason}"
    except TimeoutError as exc:
        log["error"] = f"TimeoutError: {exc}"
    except http.client.IncompleteRead as exc:
        log["error"] = f"IncompleteRead: received {len(exc.partial)} bytes before response ended"
    except OSError as exc:
        log["error"] = f"OSError: {exc}"
    return {"log": log, "data": None}


def decode_json(data: bytes | None) -> Any:
    if not data:
        return None
    return json.loads(data.decode("utf-8"))


def read_json(path: Path, fallback: Any) -> Any:
    if not path.exists():
        return fallback
    return json.loads(path.read_text(encoding="utf-8"))


def extract_page_signals(source: dict[str, Any], text: str) -> dict[str, Any]:
    lower = text.lower()
    signals: dict[str, Any] = {
        "contains_entry_term": source["entry_term"].lower() in lower,
        "contains_first_known_use": "first known use" in lower,
        "contains_1649": "1649" in lower,
        "contains_1640s": "1640s" in lower,
        "contains_1858": "1858" in lower,
        "contains_nave": "nave" in lower,
        "contains_uncertain_origin": "uncertain origin" in lower or "origin is unknown" in lower,
    }
    meta = re.search(r'<meta name="description" content="([^"]+)"', text)
    if meta:
        signals["meta_description"] = clean_text(meta.group(1))
    title = re.search(r"<title>(.*?)</title>", text, flags=re.I | re.S)
    if title:
        signals["html_title"] = clean_text(title.group(1))
    return signals


def collect_reference_sources() -> dict[str, Any]:
    records = []
    for source in REFERENCE_SOURCES:
        suffix = "html"
        response = fetch_url(source["url"], f"source_{source['id']}", suffix)
        raw_text = response["data"].decode("utf-8", errors="replace") if response["data"] else ""
        records.append(
            {
                **source,
                "access_status": "collected" if response["log"]["ok"] else "failed",
                "http_status": response["log"].get("status_code"),
                "cache_path": response["log"].get("cache_path"),
                "from_cache": response["log"].get("from_cache"),
                "error": response["log"].get("error"),
                "known_live_issue": "Live attempts returned HTTP 403 Forbidden; source preserved for manual review."
                if source["id"] == "collins_hub"
                else None,
                "fetched_at": utc_now(),
                "text_length": len(raw_text),
                "page_signals": extract_page_signals(source, raw_text) if raw_text else {},
                "copyright_notes": "Only source status, paraphrase-ready signals, and very short excerpts are stored.",
            }
        )
        time.sleep(REQUEST_DELAY_SECONDS)
    return {
        "metadata": {
            "word": "hub",
            "generated_at": utc_now(),
            "generated_by_script": "scripts/scrape_hub_etymology.py",
            "cache_only": CACHE_ONLY,
        },
        "sources": records,
    }


def historical_dictionary_records(reference_raw: dict[str, Any]) -> dict[str, Any]:
    by_id = {source["id"]: source for source in reference_raw["sources"]}
    records = [
        {
            "id": "webster_1828_hub",
            "source_title": "American Dictionary of the English Language",
            "source_author": "Noah Webster",
            "source_year": 1828,
            "entry_term": "hub",
            "source_url": "https://webstersdictionary1828.com/Dictionary/hub",
            "access_status": by_id.get("webster_1828_hub", {}).get("access_status"),
            "sense_summary": "Hub as the nave of a wheel, a timber piece receiving spokes.",
            "evidence_text_short": "The nave of a wheel.",
            "supports_sense_ids": ["mechanical_core"],
            "confidence": "medium",
            "notes": "Dated dictionary entry; not a first-use quotation.",
        },
        {
            "id": "webster_1913_hub",
            "source_title": "Webster's Revised Unabridged Dictionary",
            "source_author": "C. & G. Merriam",
            "source_year": 1913,
            "entry_term": "hub",
            "source_url": "https://www.websters1913.com/words/Hub",
            "access_status": by_id.get("webster_1913_hub", {}).get("access_status"),
            "sense_summary": "Hub as central wheel part, nave, plus other technical/regional senses.",
            "evidence_text_short": "The central part ... of a wheel; the nave.",
            "supports_sense_ids": ["mechanical_core"],
            "confidence": "medium",
            "notes": "Public-domain dictionary confirms sense structure; not an earliest-use quotation.",
        },
    ]
    return {
        "metadata": {
            "word": "hub",
            "generated_at": utc_now(),
            "generated_by_script": "scripts/scrape_hub_etymology.py",
        },
        "historical_dictionary_entries": records,
    }


def loc_search_url(query: str) -> str:
    params = {
        "fo": "json",
        "c": "3",
        "q": f'"{query}"',
        "fa": "partof:chronicling america",
        "at": "results,pagination",
    }
    return "https://www.loc.gov/search/?" + urllib.parse.urlencode(params)


def ia_search_url(query: str) -> str:
    params: list[tuple[str, str]] = [
        ("q", f'"{query}" AND mediatype:texts'),
        ("fl[]", "identifier"),
        ("fl[]", "title"),
        ("fl[]", "creator"),
        ("fl[]", "date"),
        ("rows", "3"),
        ("page", "1"),
        ("sort[]", "date asc"),
        ("output", "json"),
    ]
    return "https://archive.org/advancedsearch.php?" + urllib.parse.urlencode(params)


def gutendex_search_url(query: str) -> str:
    return "https://gutendex.com/books/?" + urllib.parse.urlencode({"search": query})


def google_books_status(query: str) -> dict[str, Any]:
    return {
        "source": "Google Books API",
        "query": query,
        "status": "skipped",
        "result_count": None,
        "earliest_plausible_date": None,
        "usable_evidence": False,
        "url": "https://www.googleapis.com/books/v1/volumes?" + urllib.parse.urlencode({"q": f'"{query}"'}),
        "notes": "Skipped in this second pass because the first pass hit HTTP 429 rate limiting; no aggressive retry.",
    }


def first_pass_ngram_lead(query: dict[str, str], phrase_series: dict[str, Any]) -> dict[str, Any]:
    match = next((item for item in phrase_series.get("phrases", []) if item.get("phrase", "").lower() == query["term"].lower()), None)
    signal = match.get("approximate_frequency_signal", {}) if match else {}
    return {
        "source": "First-pass Google Books Ngram",
        "query": query["query"],
        "status": "found" if match else "not_found",
        "result_count": None,
        "earliest_plausible_date": signal.get("first_nonzero_year"),
        "usable_evidence": False,
        "url": None,
        "notes": "Metadata/search lead only; Ngram year is not a textual attestation.",
    }


def first_pass_snippet_candidates(query: dict[str, str], snippets: list[dict[str, Any]], next_index: int) -> tuple[list[dict[str, Any]], dict[str, Any], int]:
    direct_source_types = {"article", "book", "newspaper", "corpus", "book_snippet"}
    candidates = []
    matching = [
        snippet
        for snippet in snippets
        if snippet.get("term_or_phrase", "").lower() == query["term"].lower()
        and snippet.get("year")
        and snippet.get("source_type") in direct_source_types
    ]
    matching.sort(key=lambda item: item.get("year") or 9999)
    for snippet in matching[:1]:
        text = snippet.get("text_snippet", "")
        exact_phrase = query["term"].lower().replace("-", " ") in text.lower().replace("-", " ")
        confidence = "medium" if exact_phrase and snippet.get("confidence") in {"high", "medium"} else "low"
        candidates.append(
            {
                "id": f"hub_attestation_{next_index:03d}",
                "term": query["term"],
                "sense_id": query["sense_id"],
                "sense_label": SENSES[query["sense_id"]],
                "claimed_year": None,
                "evidence_year": snippet.get("year"),
                "year_type": "corpus_evidence",
                "source_title": snippet.get("source_title"),
                "source_author": snippet.get("source_author"),
                "source_date": str(snippet.get("year")) if snippet.get("year") else "",
                "source_url": snippet.get("source_url"),
                "source_type": snippet.get("source_type"),
                "evidence_text_short": clip_words(text, 24),
                "definition_or_context_summary": f"First-pass snippet for {query['term']} in {SENSES[query['sense_id']].lower()}.",
                "is_direct_attestation": True,
                "is_dictionary_claim": False,
                "confidence": confidence,
                "reliability_notes": "Imported from first-pass snippets; OCR/readability and source image should be checked before final use.",
                "copyright_notes": "Short snippet only; verify source rights before publication.",
            }
        )
        next_index += 1
    log = {
        "source": "First-pass snippet samples",
        "query": query["query"],
        "status": "found" if matching else "not_found",
        "result_count": len(matching),
        "earliest_plausible_date": matching[0].get("year") if matching else None,
        "usable_evidence": bool(candidates),
        "url": None,
        "notes": "Uses first-pass curated snippet samples only.",
    }
    return candidates, log, next_index


def collect_loc_query(query: dict[str, str]) -> tuple[dict[str, Any], dict[str, Any] | None]:
    url = loc_search_url(query["query"])
    response = fetch_url(url, f"loc_{slug(query['query'])}", "json", timeout=15)
    log = {
        "source": "loc.gov Chronicling America search",
        "query": query["query"],
        "status": "failed",
        "result_count": None,
        "earliest_plausible_date": None,
        "usable_evidence": False,
        "url": url,
        "notes": response["log"].get("error"),
    }
    if not response["log"]["ok"]:
        return log, None
    try:
        payload = decode_json(response["data"])
    except (json.JSONDecodeError, UnicodeDecodeError) as exc:
        log["notes"] = f"JSON decode failed: {exc}"
        return log, None
    results = payload.get("results", []) if isinstance(payload, dict) else []
    total = payload.get("pagination", {}).get("total") if isinstance(payload, dict) else None
    log.update({"status": "ok", "result_count": total if total is not None else len(results), "notes": ""})
    best = None
    for result in results:
        descriptions = result.get("description") or []
        description_text = descriptions if isinstance(descriptions, str) else " ".join(str(item) for item in descriptions)
        if query["query"].lower().replace("-", " ") not in description_text.lower().replace("-", " "):
            continue
        year = parse_year(result.get("date") or result.get("dates"))
        if not year:
            continue
        title = result.get("title") or result.get("item", {}).get("newspaper_title") or "loc.gov result"
        if isinstance(title, list):
            title = title[0] if title else "loc.gov result"
        best = {
            "term": query["term"],
            "sense_id": query["sense_id"],
            "sense_label": SENSES[query["sense_id"]],
            "claimed_year": None,
            "evidence_year": year,
            "year_type": "corpus_evidence",
            "source_title": clean_text(str(title)),
            "source_author": None,
            "source_date": str(result.get("date") or year),
            "source_url": str(result.get("id") or result.get("url") or ""),
            "source_type": "newspaper",
            "evidence_text_short": clip_words(description_text, 24),
            "definition_or_context_summary": f"loc.gov OCR description includes {query['query']}.",
            "is_direct_attestation": True,
            "is_dictionary_claim": False,
            "confidence": "medium",
            "reliability_notes": "Readable OCR search-result description; page image should be checked before final use.",
            "copyright_notes": "Short OCR snippet only.",
        }
        log.update({"earliest_plausible_date": year, "usable_evidence": True})
        break
    return log, best


def collect_ia_query(query: dict[str, str]) -> dict[str, Any]:
    url = ia_search_url(query["query"])
    response = fetch_url(url, f"internet_archive_{slug(query['query'])}", "json", timeout=20)
    log = {
        "source": "Internet Archive advanced search",
        "query": query["query"],
        "status": "failed",
        "result_count": None,
        "earliest_plausible_date": None,
        "usable_evidence": False,
        "url": url,
        "notes": response["log"].get("error"),
    }
    if not response["log"]["ok"]:
        return log
    try:
        payload = decode_json(response["data"])
    except (json.JSONDecodeError, UnicodeDecodeError) as exc:
        log["notes"] = f"JSON decode failed: {exc}"
        return log
    docs = payload.get("response", {}).get("docs", []) if isinstance(payload, dict) else []
    years = [parse_year(doc.get("date")) for doc in docs]
    years = [year for year in years if year]
    log.update(
        {
            "status": "ok",
            "result_count": payload.get("response", {}).get("numFound") if isinstance(payload, dict) else len(docs),
            "earliest_plausible_date": min(years) if years else None,
            "usable_evidence": False,
            "notes": "Metadata/search lead only unless matching text is separately inspected.",
        }
    )
    return log


def collect_gutendex_query(query: dict[str, str]) -> dict[str, Any]:
    url = gutendex_search_url(query["query"])
    response = fetch_url(url, f"gutendex_{slug(query['query'])}", "json", timeout=15)
    log = {
        "source": "Project Gutenberg / Gutendex",
        "query": query["query"],
        "status": "failed",
        "result_count": None,
        "earliest_plausible_date": None,
        "usable_evidence": False,
        "url": url,
        "notes": response["log"].get("error"),
    }
    if not response["log"]["ok"]:
        return log
    try:
        payload = decode_json(response["data"])
    except (json.JSONDecodeError, UnicodeDecodeError) as exc:
        log["notes"] = f"JSON decode failed: {exc}"
        return log
    log.update(
        {
            "status": "ok",
            "result_count": payload.get("count") if isinstance(payload, dict) else None,
            "earliest_plausible_date": None,
            "usable_evidence": False,
            "notes": "Search-result metadata only; no snippet text available from this endpoint in this pass.",
        }
    )
    return log


def collect_searches_and_candidates() -> tuple[dict[str, Any], list[dict[str, Any]]]:
    first_pass_snippets = read_json(FIRST_PASS_SNIPPETS, {"snippets": []}).get("snippets", [])
    first_pass_phrases = read_json(FIRST_PASS_PHRASES, {"phrases": []})
    logs = []
    candidates: list[dict[str, Any]] = []
    next_index = 100

    for query in SEARCH_QUERIES:
        logs.append(first_pass_ngram_lead(query, first_pass_phrases))
        snippet_candidates, snippet_log, next_index = first_pass_snippet_candidates(query, first_pass_snippets, next_index)
        logs.append(snippet_log)
        candidates.extend(snippet_candidates)

        loc_log, loc_candidate = collect_loc_query(query)
        logs.append(loc_log)
        if loc_candidate:
            loc_candidate["id"] = f"hub_attestation_{next_index:03d}"
            candidates.append(loc_candidate)
            next_index += 1
        time.sleep(REQUEST_DELAY_SECONDS)

        logs.append(collect_ia_query(query))
        time.sleep(REQUEST_DELAY_SECONDS)

        logs.append(collect_gutendex_query(query))
        time.sleep(REQUEST_DELAY_SECONDS)

        logs.append(google_books_status(query["query"]))

    return (
        {
            "metadata": {
                "word": "hub",
                "generated_at": utc_now(),
                "generated_by_script": "scripts/scrape_hub_etymology.py",
                "cache_only": CACHE_ONLY,
                "notes": [
                    "Ngram first years are recorded as search leads only.",
                    "Google Books API was not retried because the first pass encountered HTTP 429 rate limiting.",
                    "LOC and OCR snippets are candidates requiring manual image verification.",
                ],
            },
            "searches": logs,
        },
        candidates,
    )


def etymology_theories(reference_raw: dict[str, Any]) -> dict[str, Any]:
    return {
        "metadata": {
            "word": "hub",
            "generated_at": utc_now(),
            "generated_by_script": "scripts/scrape_hub_etymology.py",
        },
        "etymology_source_status": reference_raw["sources"],
        "possible_origin_theories": [
            {
                "theory": "Unknown origin; possibly from earlier hubbe with a lump/protuberance sense related to hob.",
                "source": "Online Etymology Dictionary; Wiktionary",
                "confidence": "medium",
                "notes": "Both sources frame the ultimate origin as uncertain rather than settled.",
            },
            {
                "theory": "Probably an alteration of hob.",
                "source": "Merriam-Webster",
                "confidence": "medium",
                "notes": "Concise dictionary etymology; public entry does not provide a detailed derivation.",
            },
        ],
        "related_terms": [
            {
                "term": "nave",
                "relationship": "Older/alternate term for the central part of a wheel.",
                "notes": "Nave has Old English/Germanic roots and remains a synonym in historical dictionary entries for hub.",
            },
            {
                "term": "hob",
                "relationship": "Possible source or related form in hub etymology.",
                "notes": "Mentioned in dictionary/etymology sources, but origin is still treated as uncertain.",
            },
            {
                "term": "hubcap",
                "relationship": "Mechanical compound formed from hub plus cap.",
                "notes": "Etymonline dates hubcap/hub cap to 1896; Merriam-Webster lists 1903.",
            },
        ],
    }


def main() -> None:
    ensure_dirs()
    reference_raw = collect_reference_sources()
    historical_raw = historical_dictionary_records(reference_raw)
    search_log, search_candidates = collect_searches_and_candidates()
    etymology_raw = etymology_theories(reference_raw)

    all_candidates = []
    for candidate in STATIC_DICTIONARY_ATTESTATIONS + search_candidates:
        enriched = dict(candidate)
        enriched.setdefault("sense_label", SENSES.get(enriched.get("sense_id"), ""))
        all_candidates.append(enriched)

    attestations_raw = {
        "metadata": {
            "word": "hub",
            "generated_at": utc_now(),
            "generated_by_script": "scripts/scrape_hub_etymology.py",
            "cache_only": CACHE_ONLY,
            "notes": [
                "Dictionary first-known-use claims are separated from direct textual evidence.",
                "Dated dictionary entries support sense availability, not necessarily first corpus use.",
                "Low-confidence evidence is retained but flagged.",
            ],
        },
        "attestation_candidates": all_candidates,
    }

    write_json(RAW_DIR / "hub_etymology_sources_raw.json", etymology_raw)
    write_json(RAW_DIR / "hub_earliest_attestations_raw.json", attestations_raw)
    write_json(RAW_DIR / "hub_historical_dictionary_raw.json", historical_raw)
    write_json(RAW_DIR / "hub_attestation_search_log.json", search_log)

    confidence_counts = {
        level: sum(1 for item in all_candidates if item.get("confidence") == level)
        for level in ("high", "medium", "low")
    }
    failed_sources = sum(1 for source in reference_raw["sources"] if source.get("access_status") != "collected")
    print("Hub etymology scrape summary")
    print(f"- Etymology/reference sources collected: {len(reference_raw['sources']) - failed_sources}/{len(reference_raw['sources'])}")
    print(f"- Attestation candidates: {len(all_candidates)}")
    print(f"- Confidence counts: high={confidence_counts['high']}, medium={confidence_counts['medium']}, low={confidence_counts['low']}")
    print(f"- Search log entries: {len(search_log['searches'])}")
    print(f"- Failed or blocked reference sources: {failed_sources}")
    print(f"- Raw output directory: {RAW_DIR}")
    if CACHE_ONLY:
        print("- Mode: cache-only")


if __name__ == "__main__":
    main()
