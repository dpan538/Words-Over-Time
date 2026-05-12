#!/usr/bin/env python3
"""Third-pass evidence-strengthening scrape for hub.

This script is deliberately narrow. It checks a small set of public-domain
reference/text sources for clearer pre-1908 attestations and records failed or
ambiguous searches without promoting them into evidence.
"""

from __future__ import annotations

import hashlib
import html
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
CACHE_DIR = RAW_DIR / "evidence_strengthening_cache"

CACHE_ONLY = "--cache-only" in sys.argv
REQUEST_DELAY_SECONDS = 0.35
USER_AGENT = "WordsOverTime/0.1 hub evidence strengthening; contact: local research script"

SENSE_LABELS = {
    "mechanical_core": "Mechanical wheel center",
    "central_place": "Central place or focus",
    "transport_logistics": "Transport and logistics node",
    "network_system": "Communication, computing, or network node",
    "institutional_cluster": "Institutional, economic, cultural, or knowledge cluster",
    "digital_platform": "Digital, content, data, or resource platform",
}

IA_SOURCES = [
    {
        "id": "webster_1828_volume_1_hub_entry",
        "identifier": "americandictiona01websrich",
        "source_title": "An American Dictionary of the English Language",
        "source_author": "Noah Webster",
        "source_publication_year": 1828,
        "source_type": "dictionary",
        "term": "hub",
        "sense_id": "mechanical_core",
        "year_type": "historical_dictionary",
        "search_phrases": [
            "The nave of a wheel ; a solid piece of timber in which the spokes are inserted",
            "The nave of a wheel; a solid piece of timber in which the spokes are inserted",
        ],
        "source_page_hint": "IA OCR leaf 908: americandictiona01websrich_0912.djvu",
        "context_summary": "Webster's 1828 dictionary entry treats hub/hob as the nave of a wheel and the timber part receiving the spokes.",
        "why_this_is_stronger": "Replaces a web-only dictionary citation with a dated public-domain scan/OCR of Webster's 1828 dictionary.",
        "confidence": "high",
        "is_direct_attestation": False,
        "is_dictionary_claim": False,
        "limitations": "Historical dictionary evidence, not a first-use quotation or non-dictionary corpus example.",
    },
    {
        "id": "johnson_todd_chalmers_1828_hub_hob",
        "identifier": "bub_gb_EXEUPL_Jv2MC",
        "source_title": "Johnson's English Dictionary, as Improved by Todd and Abridged by Chalmers",
        "source_author": "Samuel Johnson; H. J. Todd; Alexander Chalmers",
        "source_publication_year": 1828,
        "source_type": "dictionary",
        "term": "hub",
        "sense_id": "mechanical_core",
        "year_type": "historical_dictionary",
        "search_phrases": [
            "HUB, or HOB, n.s. The nave of a wheel",
            "The nave of a wheel, Webst. Dict",
        ],
        "source_page_hint": "IA OCR leaf 1144: bub_gb_EXEUPL_Jv2MC_1143.djvu",
        "context_summary": "A British dictionary compilation lists hub/hob as the nave of a wheel and notes provincial status.",
        "why_this_is_stronger": "Adds an independently dated 1828 dictionary witness that links hub/hob, nave, and provincial usage.",
        "confidence": "medium",
        "is_direct_attestation": False,
        "is_dictionary_claim": False,
        "limitations": "Dictionary evidence and OCR are readable but imperfect; not a direct non-dictionary use.",
    },
    {
        "id": "london_bicycle_club_gazette_1878_wheel_hub",
        "identifier": "londonbicyclecl02unkngoog",
        "source_title": "London Bicycle Club Gazette",
        "source_author": "London Bicycle Club",
        "source_publication_year": 1878,
        "source_type": "periodical",
        "term": "wheel hub",
        "sense_id": "mechanical_core",
        "year_type": "direct_text",
        "search_phrases": ["Wheel Hub", "Front Wheel Hub"],
        "source_page_hint": "IA OCR leaf 36: londonbicyclecl02unkngoog_0035.djvu",
        "context_summary": "Cycling periodical context uses wheel hub mechanically in relation to bicycle equipment.",
        "why_this_is_stronger": "Moves readable mechanical direct-text evidence before the previous 1908 corpus snippet.",
        "confidence": "medium",
        "is_direct_attestation": True,
        "is_dictionary_claim": False,
        "limitations": "OCR heading appears partly garbled around 'Front'; image verification is recommended before publication.",
    },
    {
        "id": "chandler_1881_bicycle_tour_spokes_hub",
        "identifier": "abicycletourine02changoog",
        "source_title": "A Bicycle Tour in England and Wales",
        "source_author": "Alfred D. Chandler",
        "source_publication_year": 1881,
        "source_type": "book",
        "term": "hub",
        "sense_id": "mechanical_core",
        "year_type": "direct_text",
        "search_phrases": ["spokes screwed direct into the hub", "spokes screwed directly into the hub"],
        "source_page_hint": "IA OCR leaf 151: abicycletourine02changoog_0150.djvu",
        "context_summary": "A cycling book discusses spokes attached to the bicycle hub.",
        "why_this_is_stronger": "Readable dated book text gives clear mechanical hub usage before 1908.",
        "confidence": "high",
        "is_direct_attestation": True,
        "is_dictionary_claim": False,
        "limitations": "Google-scanned IA OCR; page image should be checked before final quotation.",
    },
    {
        "id": "wright_ditson_1884_hubs_catalogue",
        "identifier": "wright00wrig",
        "source_title": "Wright & Ditson's Annual Illustrated Catalogue",
        "source_author": "Wright & Ditson",
        "source_publication_year": 1884,
        "source_type": "catalogue",
        "term": "hubs",
        "sense_id": "mechanical_core",
        "year_type": "direct_text",
        "search_phrases": ["screwed directly into the hubs", "Malleable Iron Hubs and Cranks"],
        "source_page_hint": "IA OCR leaf 48: wright00wrig_0048.djvu",
        "context_summary": "Sporting-goods catalogue describes bicycle construction using hubs.",
        "why_this_is_stronger": "Adds a second readable, dated mechanical use before 1908.",
        "confidence": "high",
        "is_direct_attestation": True,
        "is_dictionary_claim": False,
        "limitations": "Catalogue OCR is readable; verify page image for final quotation.",
    },
]

WEB_TEXT_SOURCES = [
    {
        "id": "gutenberg_autocrat_1858_hub_metaphor",
        "url": "https://www.gutenberg.org/files/751/751.txt",
        "source_title": "The Autocrat of the Breakfast-Table",
        "source_author": "Oliver Wendell Holmes",
        "source_publication_year": 1858,
        "source_type": "book",
        "term": "hub",
        "sense_id": "central_place",
        "year_type": "direct_text",
        "search_phrases": ["Boston State-House is the hub of the solar system"],
        "context_summary": "Holmes uses hub metaphorically for Boston's central self-conception.",
        "why_this_is_stronger": "Verifies the previously dictionary-mediated 1858 metaphor claim in a public-domain text.",
        "confidence": "high",
        "is_direct_attestation": True,
        "is_dictionary_claim": False,
        "limitations": "Project Gutenberg text confirms the passage; first-edition page verification would further strengthen publication details.",
    },
    {
        "id": "etymonline_hub_claim_check",
        "url": "https://www.etymonline.com/word/hub",
        "source_title": "Online Etymology Dictionary: hub",
        "source_author": "Douglas Harper",
        "source_publication_year": None,
        "source_type": "secondary_etymology",
        "term": "hub",
        "sense_id": "mechanical_core",
        "year_type": "dictionary_claim",
        "search_phrases": ["1640s", "origin uncertain", "hub of the solar system"],
        "context_summary": "Public etymology entry gives a 1640s wheel-sense date and uncertain origin note.",
        "why_this_is_stronger": "Documents that the 1640s date is visible as a reference claim, not a visible primary quotation.",
        "confidence": "medium",
        "is_direct_attestation": False,
        "is_dictionary_claim": True,
        "limitations": "No visible primary quotation or cited 1640s source is present in the public entry.",
    },
    {
        "id": "merriam_webster_hub_claim_check",
        "url": "https://www.merriam-webster.com/dictionary/hub",
        "source_title": "Merriam-Webster: hub",
        "source_author": "Merriam-Webster",
        "source_publication_year": None,
        "source_type": "dictionary",
        "term": "hub",
        "sense_id": "mechanical_core",
        "year_type": "dictionary_claim",
        "search_phrases": ["First Known Use", "1649", "probably alteration of hob"],
        "context_summary": "Dictionary entry lists a 1649 first-known-use date and a probable hob relation.",
        "why_this_is_stronger": "Records that the 1649 date remains a dictionary claim without a visible quotation in the public page.",
        "confidence": "medium",
        "is_direct_attestation": False,
        "is_dictionary_claim": True,
        "limitations": "No visible quotation or source title is available on the public page.",
    },
]

IA_SEARCH_QUERIES = [
    {"query": '"hub of a wheel"', "sense_id": "mechanical_core"},
    {"query": '"hub of the wheel"', "sense_id": "mechanical_core"},
    {"query": '"wheel hub"', "sense_id": "mechanical_core"},
    {"query": '"axle hub"', "sense_id": "mechanical_core"},
    {"query": '"hub of activity"', "sense_id": "central_place"},
    {"query": '"hub of commerce"', "sense_id": "central_place"},
    {"query": '"commercial hub"', "sense_id": "central_place"},
    {"query": '"railway hub"', "sense_id": "transport_logistics"},
    {"query": '"railroad hub"', "sense_id": "transport_logistics"},
    {"query": '"hub and spoke"', "sense_id": "transport_logistics"},
]

GUTENDEX_QUERIES = [
    {"query": "Autocrat of the Breakfast-Table Holmes", "expected_id": 751, "sense_id": "central_place"},
]

LOC_SEARCH_QUERIES = [
    {"query": '"hub of the wheel"', "date_range": "1850-1907", "sense_id": "mechanical_core"},
    {"query": '"wheel hub"', "date_range": "1850-1907", "sense_id": "mechanical_core"},
]


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def write_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def cache_path(prefix: str, url: str, suffix: str) -> Path:
    digest = hashlib.sha1(url.encode("utf-8")).hexdigest()[:16]
    return CACHE_DIR / f"{prefix}_{digest}.{suffix}"


def fetch_url(url: str, prefix: str, suffix: str, timeout: int = 25) -> dict[str, Any]:
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
            path.parent.mkdir(parents=True, exist_ok=True)
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
        log.update({"status_code": exc.code, "error": f"HTTPError: {exc.code} {exc.reason}"})
    except urllib.error.URLError as exc:
        log["error"] = f"URLError: {exc.reason}"
    except TimeoutError as exc:
        log["error"] = f"TimeoutError: {exc}"
    except OSError as exc:
        log["error"] = f"OSError: {exc}"
    return {"log": log, "data": None}


def clean_text(value: str) -> str:
    value = html.unescape(value)
    value = value.replace("\u017f", "s")
    value = re.sub(r"\s+", " ", value)
    return value.strip()


def clip_words(value: str, limit: int = 34) -> str:
    words = clean_text(value).split()
    return " ".join(words[:limit])


def clip_around_phrase(value: str, phrase: str | None, before_words: int = 12, after_words: int = 24) -> str:
    words = clean_text(value).split()
    if not phrase:
        return " ".join(words[: before_words + after_words])
    phrase_words = clean_text(phrase).lower().split()
    lowered = [word.lower().strip(".,;:!?\"'()[]") for word in words]
    start_index = 0
    for index in range(len(lowered)):
        if lowered[index : index + len(phrase_words)] == phrase_words:
            start_index = max(0, index - before_words)
            end_index = min(len(words), index + len(phrase_words) + after_words)
            return " ".join(words[start_index:end_index])
    phrase_start = clean_text(value).lower().find(clean_text(phrase).lower())
    if phrase_start != -1:
        prefix_words = clean_text(value)[:phrase_start].split()
        index = len(prefix_words)
        start_index = max(0, index - before_words)
        end_index = min(len(words), index + len(phrase_words) + after_words)
        return " ".join(words[start_index:end_index])
    return " ".join(words[: before_words + after_words])


def source_url_for_ia(identifier: str) -> str:
    return f"https://archive.org/details/{identifier}"


def decode_json(data: bytes | None) -> Any:
    if not data:
        return None
    return json.loads(data.decode("utf-8", errors="replace"))


def find_context(text: str, phrases: list[str], before: int = 180, after: int = 260) -> tuple[str, str | None]:
    cleaned = clean_text(text)
    lowered = cleaned.lower()
    for phrase in phrases:
        index = lowered.find(phrase.lower())
        if index != -1:
            start = max(0, index - before)
            end = min(len(cleaned), index + len(phrase) + after)
            return cleaned[start:end], phrase
    return "", None


def ia_file_names(metadata: dict[str, Any]) -> tuple[str | None, str | None]:
    text_name = None
    xml_name = None
    for file_record in metadata.get("files", []):
        name = file_record.get("name", "")
        if name.endswith("_djvu.txt") and text_name is None:
            text_name = name
        elif name.endswith("_djvu.xml") and xml_name is None:
            xml_name = name
    return text_name, xml_name


def normalize_for_page_search(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", html.unescape(value).lower()).strip()


def find_page_in_xml(xml_text: str, phrase: str) -> str:
    normalized_phrase = normalize_for_page_search(phrase)
    if not normalized_phrase:
        return ""
    objects = re.split(r"(?=<OBJECT\b)", xml_text)
    for index, obj in enumerate(objects):
        if "<WORD" not in obj:
            continue
        words = re.findall(r"<WORD\b[^>]*>(.*?)</WORD>", obj, flags=re.S)
        object_text = normalize_for_page_search(" ".join(html.unescape(word) for word in words))
        if normalized_phrase in object_text:
            page_match = re.search(r'<PARAM name="PAGE" value="([^"]+)"', obj)
            page = page_match.group(1) if page_match else f"object_{index}"
            return f"IA OCR leaf {index}: {page}"
    return ""


def fetch_ia_source(source: dict[str, Any]) -> tuple[dict[str, Any], dict[str, Any] | None]:
    identifier = source["identifier"]
    metadata_url = f"https://archive.org/metadata/{urllib.parse.quote(identifier)}"
    metadata_response = fetch_url(metadata_url, f"ia_metadata_{source['id']}", "json")
    status = {
        "id": source["id"],
        "source": "Internet Archive",
        "identifier": identifier,
        "url": metadata_url,
        "metadata_status": metadata_response["log"],
        "text_status": None,
        "xml_status": None,
        "usable": False,
        "notes": "",
    }
    if not metadata_response["log"]["ok"]:
        status["notes"] = "Metadata fetch failed."
        return status, None

    metadata = decode_json(metadata_response["data"])
    text_name, xml_name = ia_file_names(metadata)
    if not text_name:
        status["notes"] = "No IA OCR text file found."
        return status, None

    text_url = f"https://archive.org/download/{urllib.parse.quote(identifier)}/{urllib.parse.quote(text_name)}"
    text_response = fetch_url(text_url, f"ia_text_{source['id']}", "txt", timeout=35)
    status["text_status"] = text_response["log"]
    if not text_response["log"]["ok"]:
        status["notes"] = "OCR text fetch failed."
        return status, None

    text = text_response["data"].decode("utf-8", errors="replace")
    context, matched_phrase = find_context(text, source["search_phrases"])
    if not context:
        status["notes"] = "Target phrase not found in OCR text."
        return status, None

    source_page = source.get("source_page_hint", "")
    if xml_name:
        status["xml_status"] = {
            "ok": False,
            "skipped": True,
            "reason": "Large IA DjVu XML files are not cached; source_page uses a stored page hint from the verified third-pass run.",
            "file_name": xml_name,
        }

    status["usable"] = True
    status["notes"] = f"Matched phrase: {matched_phrase}"
    candidate = {
        "raw_id": source["id"],
        "term": source["term"],
        "sense_id": source["sense_id"],
        "sense_label": SENSE_LABELS[source["sense_id"]],
        "evidence_year": source["source_publication_year"],
        "year_type": source["year_type"],
        "source_title": source["source_title"],
        "source_author": source["source_author"],
        "source_publication_year": source["source_publication_year"],
        "source_page": source_page,
        "source_url": source_url_for_ia(identifier),
        "source_type": source["source_type"],
        "evidence_text_short": clip_around_phrase(context, matched_phrase),
        "raw_context": context,
        "matched_phrase": matched_phrase,
        "context_summary": source["context_summary"],
        "is_direct_attestation": source["is_direct_attestation"],
        "is_dictionary_claim": source["is_dictionary_claim"],
        "sense_is_clear": True,
        "confidence": source["confidence"],
        "why_this_is_stronger": source["why_this_is_stronger"],
        "limitations": source["limitations"],
        "copyright_notes": "Public-domain or public OCR text; short evidence excerpt only.",
    }
    return status, candidate


def fetch_web_text_source(source: dict[str, Any]) -> tuple[dict[str, Any], dict[str, Any] | None]:
    suffix = "txt" if source["url"].endswith(".txt") else "html"
    response = fetch_url(source["url"], f"web_text_{source['id']}", suffix)
    status = {
        "id": source["id"],
        "source": "web_text",
        "url": source["url"],
        "fetch_status": response["log"],
        "usable": False,
        "notes": "",
    }
    if not response["log"]["ok"]:
        status["notes"] = "Fetch failed."
        return status, None

    text = response["data"].decode("utf-8", errors="replace")
    context, matched_phrase = find_context(text, source["search_phrases"])
    if not context:
        status["notes"] = "Target phrase not found in fetched text."
        return status, None

    status["usable"] = True
    status["notes"] = f"Matched phrase: {matched_phrase}"
    candidate = {
        "raw_id": source["id"],
        "term": source["term"],
        "sense_id": source["sense_id"],
        "sense_label": SENSE_LABELS[source["sense_id"]],
        "evidence_year": source["source_publication_year"],
        "year_type": source["year_type"],
        "source_title": source["source_title"],
        "source_author": source["source_author"],
        "source_publication_year": source["source_publication_year"],
        "source_page": "",
        "source_url": source["url"],
        "source_type": source["source_type"],
        "evidence_text_short": clip_around_phrase(context, matched_phrase),
        "raw_context": context,
        "matched_phrase": matched_phrase,
        "context_summary": source["context_summary"],
        "is_direct_attestation": source["is_direct_attestation"],
        "is_dictionary_claim": source["is_dictionary_claim"],
        "sense_is_clear": source["sense_id"] in {"mechanical_core", "central_place"},
        "confidence": source["confidence"],
        "why_this_is_stronger": source["why_this_is_stronger"],
        "limitations": source["limitations"],
        "copyright_notes": "Short excerpt only; Project Gutenberg text is public domain in the United States where applicable.",
    }
    return status, candidate


def ia_search(query: dict[str, str]) -> dict[str, Any]:
    q = f'{query["query"]} AND mediatype:texts'
    params = [
        ("q", q),
        ("fl[]", "identifier"),
        ("fl[]", "title"),
        ("fl[]", "creator"),
        ("fl[]", "date"),
        ("rows", "5"),
        ("sort[]", "date asc"),
        ("output", "json"),
    ]
    url = "https://archive.org/advancedsearch.php?" + urllib.parse.urlencode(params)
    response = fetch_url(url, f"ia_search_{slug(query['query'])}", "json", timeout=20)
    log = {
        "source": "Internet Archive full-text search",
        "query": query["query"],
        "sense_id": query["sense_id"],
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
    except json.JSONDecodeError as exc:
        log["notes"] = f"JSON decode failed: {exc}"
        return log
    docs = payload.get("response", {}).get("docs", [])
    log.update(
        {
            "status": "ok",
            "result_count": payload.get("response", {}).get("numFound"),
            "earliest_plausible_date": docs[0].get("date") if docs else None,
            "usable_evidence": False,
            "notes": "Search lead only; direct evidence is taken only from targeted source fetches.",
            "sample_results": docs[:3],
        }
    )
    return log


def gutendex_search(query: dict[str, Any]) -> dict[str, Any]:
    url = "https://gutendex.com/books/?" + urllib.parse.urlencode({"search": query["query"]})
    response = fetch_url(url, f"gutendex_{slug(query['query'])}", "json", timeout=20)
    log = {
        "source": "Gutendex",
        "query": query["query"],
        "sense_id": query["sense_id"],
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
    except json.JSONDecodeError as exc:
        log["notes"] = f"JSON decode failed: {exc}"
        return log
    results = payload.get("results", [])
    expected = next((item for item in results if item.get("id") == query.get("expected_id")), None)
    log.update(
        {
            "status": "found" if expected else "ok",
            "result_count": payload.get("count"),
            "usable_evidence": bool(expected),
            "notes": "Matched expected Project Gutenberg work." if expected else "Expected work not found in first page.",
            "sample_results": [
                {"id": item.get("id"), "title": item.get("title"), "authors": item.get("authors")}
                for item in results[:3]
            ],
        }
    )
    return log


def loc_search(query: dict[str, str]) -> dict[str, Any]:
    params = {
        "fo": "json",
        "c": "3",
        "q": query["query"],
        "dates": query["date_range"],
        "fa": "partof:chronicling america",
        "at": "results,pagination",
    }
    url = "https://www.loc.gov/search/?" + urllib.parse.urlencode(params)
    response = fetch_url(url, f"loc_search_{slug(query['query'])}", "json", timeout=12)
    log = {
        "source": "loc.gov Chronicling America search",
        "query": query["query"],
        "sense_id": query["sense_id"],
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
    except json.JSONDecodeError as exc:
        log["notes"] = f"JSON decode failed: {exc}"
        return log
    results = payload.get("results", [])
    log.update(
        {
            "status": "ok",
            "result_count": payload.get("pagination", {}).get("total"),
            "earliest_plausible_date": results[0].get("date") if results else None,
            "usable_evidence": False,
            "notes": "Search result only; LOC OCR pages returned access/time-limit issues in this pass.",
            "sample_results": [
                {"date": item.get("date"), "title": item.get("title"), "url": item.get("url")}
                for item in results[:3]
            ],
        }
    )
    return log


def slug(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "_", value.lower()).strip("_")[:64] or "query"


def build_claim_investigation(source_statuses: list[dict[str, Any]], candidates: list[dict[str, Any]]) -> list[dict[str, Any]]:
    by_id = {status["id"]: status for status in source_statuses}
    return [
        {
            "claim": "1640s",
            "claim_source": "Online Etymology Dictionary",
            "source_url": "https://www.etymonline.com/word/hub",
            "source_status": by_id.get("etymonline_hub_claim_check", {}).get("fetch_status", {}),
            "visible_quotation": False,
            "visible_author_or_title": False,
            "visible_dated_source": False,
            "classification": "dictionary_claim",
            "notes": "The public entry gives a decade date for hub in the wheel-center sense and uncertain origin notes, but no visible 1640s quotation.",
        },
        {
            "claim": "1649",
            "claim_source": "Merriam-Webster",
            "source_url": "https://www.merriam-webster.com/dictionary/hub",
            "source_status": by_id.get("merriam_webster_hub_claim_check", {}).get("fetch_status", {}),
            "visible_quotation": False,
            "visible_author_or_title": False,
            "visible_dated_source": False,
            "classification": "dictionary_claim",
            "notes": "The public page lists first-known use but does not expose a dated quotation or bibliographic source for the claim.",
        },
        {
            "claim": "1828 supported evidence",
            "claim_source": "Noah Webster, An American Dictionary of the English Language",
            "source_url": next((item["source_url"] for item in candidates if item["raw_id"] == "webster_1828_volume_1_hub_entry"), ""),
            "source_status": by_id.get("webster_1828_volume_1_hub_entry", {}),
            "visible_quotation": False,
            "visible_author_or_title": True,
            "visible_dated_source": True,
            "classification": "historical_dictionary",
            "notes": "The 1828 evidence is a dated historical dictionary entry, not direct corpus prose.",
        },
    ]


def build_nave_sources(candidates: list[dict[str, Any]]) -> dict[str, Any]:
    webster = next((item for item in candidates if item["raw_id"] == "webster_1828_volume_1_hub_entry"), None)
    johnson = next((item for item in candidates if item["raw_id"] == "johnson_todd_chalmers_1828_hub_hob"), None)
    return {
        "metadata": {
            "word": "hub",
            "generated_at": utc_now(),
            "generated_by_script": "scripts/scrape_hub_evidence_strengthening.py",
        },
        "nave_relation_sources": [
            {
                "id": "nave_relation_001",
                "source_title": "Merriam-Webster: nave",
                "source_url": "https://www.merriam-webster.com/dictionary/nave",
                "source_type": "dictionary",
                "evidence_text_short": "",
                "relationship_claim": "Nave is an older wheel-center term; public dictionary gives first known use before the 12th century.",
                "confidence": "medium",
                "limitations": "Public dictionary first-use claim only; no quotation visible in this third pass.",
            },
            {
                "id": "nave_relation_002",
                "source_title": webster["source_title"] if webster else "An American Dictionary of the English Language",
                "source_url": webster["source_url"] if webster else "",
                "source_type": "historical_dictionary",
                "evidence_text_short": webster["evidence_text_short"] if webster else "",
                "relationship_claim": "Webster 1828 defines hub/hob through nave and describes the hub as the timber receiving spokes.",
                "confidence": "high" if webster else "low",
                "limitations": webster["limitations"] if webster else "Source fetch failed.",
            },
            {
                "id": "nave_relation_003",
                "source_title": johnson["source_title"] if johnson else "Johnson/Todd/Chalmers 1828",
                "source_url": johnson["source_url"] if johnson else "",
                "source_type": "historical_dictionary",
                "evidence_text_short": johnson["evidence_text_short"] if johnson else "",
                "relationship_claim": "Johnson/Todd/Chalmers 1828 lists hub or hob as the nave of a wheel and notes English provincial usage.",
                "confidence": "medium" if johnson else "low",
                "limitations": johnson["limitations"] if johnson else "Source fetch failed.",
            },
        ],
    }


def main() -> None:
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    CACHE_DIR.mkdir(parents=True, exist_ok=True)

    source_statuses: list[dict[str, Any]] = []
    candidates: list[dict[str, Any]] = []
    search_logs: list[dict[str, Any]] = []

    for source in IA_SOURCES:
        status, candidate = fetch_ia_source(source)
        source_statuses.append(status)
        if candidate:
            candidates.append(candidate)
        time.sleep(REQUEST_DELAY_SECONDS)

    for source in WEB_TEXT_SOURCES:
        status, candidate = fetch_web_text_source(source)
        source_statuses.append(status)
        if candidate and not candidate.get("is_dictionary_claim"):
            candidates.append(candidate)
        time.sleep(REQUEST_DELAY_SECONDS)

    for query in IA_SEARCH_QUERIES:
        search_logs.append(ia_search(query))
        time.sleep(REQUEST_DELAY_SECONDS)

    for query in GUTENDEX_QUERIES:
        search_logs.append(gutendex_search(query))
        time.sleep(REQUEST_DELAY_SECONDS)

    for query in LOC_SEARCH_QUERIES:
        search_logs.append(loc_search(query))
        time.sleep(REQUEST_DELAY_SECONDS)

    claim_investigation = build_claim_investigation(source_statuses, candidates)
    evidence_raw = {
        "metadata": {
            "word": "hub",
            "generated_at": utc_now(),
            "generated_by_script": "scripts/scrape_hub_evidence_strengthening.py",
            "cache_only": CACHE_ONLY,
            "scope": "third-pass evidence strengthening for early attestations, etymology claims, and nave relation.",
        },
        "source_statuses": source_statuses,
        "claim_investigation": claim_investigation,
        "strengthened_attestation_candidates_raw": candidates,
        "notes": [
            "The 1640s and 1649 dates remain dictionary/reference claims unless a visible primary quotation is found.",
            "The 1828 Webster evidence is treated as historical dictionary evidence, not direct corpus prose.",
            "Search logs include negative and search-lead results to document what was checked without padding the evidence set.",
        ],
    }

    pre_1908_log = {
        "metadata": {
            "word": "hub",
            "generated_at": utc_now(),
            "generated_by_script": "scripts/scrape_hub_evidence_strengthening.py",
            "cache_only": CACHE_ONLY,
        },
        "searches": search_logs,
    }

    nave_sources = build_nave_sources(candidates)

    write_json(RAW_DIR / "hub_evidence_strengthening_raw.json", evidence_raw)
    write_json(RAW_DIR / "hub_pre_1908_search_log.json", pre_1908_log)
    write_json(RAW_DIR / "hub_nave_relation_sources_raw.json", nave_sources)

    counts = {level: sum(1 for item in candidates if item.get("confidence") == level) for level in ("high", "medium", "low")}
    direct_years = [
        item["evidence_year"]
        for item in candidates
        if item.get("year_type") == "direct_text" and item.get("evidence_year") is not None
    ]
    print("Hub evidence strengthening scrape summary")
    print(f"- New strengthened attestation candidates: {len(candidates)}")
    print(f"- Confidence counts: high={counts['high']}, medium={counts['medium']}, low={counts['low']}")
    print(f"- New earliest direct text year: {min(direct_years) if direct_years else 'not_found'}")
    print("- 1640s claim resolved to primary quotation: no")
    print("- 1828 evidence clarified: historical_dictionary")
    print(f"- Nave relation sources: {len(nave_sources['nave_relation_sources'])}")
    print(f"- Raw output directory: {RAW_DIR}")
    if CACHE_ONLY:
        print("- Mode: cache-only")


if __name__ == "__main__":
    main()
