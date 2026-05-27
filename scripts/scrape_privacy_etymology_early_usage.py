#!/usr/bin/env python3
"""Collect early-usage and etymological evidence for privacy-related forms.

This script is intentionally broad and conservative: it records evidence candidates,
uncertainty, and failed fetches without converting dictionary claims into proven
first-attestation facts.
"""

from __future__ import annotations

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
RESEARCH_DIR = ROOT / "docs" / "research" / "privacy"
RAW_DIR = RESEARCH_DIR / "raw"
CACHE_DIR = RAW_DIR / "etymology_cache"
RAW_PATH = RAW_DIR / "privacy_etymology_early_usage_raw.json"

WORD = "privacy"
LAYER_ID = "etymology_early_usage"
USER_AGENT = "WordsOverTime/0.1 privacy etymology/early-usage pass; contact: local research script"
REQUEST_DELAY_SECONDS = 0.35
CACHE_ONLY = "--cache-only" in sys.argv
YEAR_MIN = 1200
YEAR_MAX = datetime.now(timezone.utc).year + 10
EARLY_CONTEXT_CHARS = 160


REFERENCE_SOURCES = [
    {
        "id": "etymonline_privacy",
        "source_name": "Online Etymology Dictionary",
        "url": "https://www.etymonline.com/word/privacy",
        "source_type": "secondary_etymology",
        "source_author": "Douglas Harper",
        "target_terms": ["privacy"],
        "focus": ["semantic_shifts", "dating_claims"],
    },
    {
        "id": "etymonline_private",
        "source_name": "Online Etymology Dictionary",
        "url": "https://www.etymonline.com/word/private",
        "source_type": "secondary_etymology",
        "source_author": "Douglas Harper",
        "target_terms": ["private"],
        "focus": ["semantic_shifts", "dating_claims"],
    },
    {
        "id": "etymonline_privy",
        "source_name": "Online Etymology Dictionary",
        "url": "https://www.etymonline.com/word/privy",
        "source_type": "secondary_etymology",
        "source_author": "Douglas Harper",
        "target_terms": ["privy"],
        "focus": ["semantic_shifts"],
    },
    {
        "id": "merriam_webster_privacy",
        "source_name": "Merriam-Webster",
        "url": "https://www.merriam-webster.com/dictionary/privacy",
        "source_type": "dictionary",
        "source_author": "Merriam-Webster",
        "target_terms": ["privacy"],
        "focus": ["entry_definition", "first_known_use"],
    },
    {
        "id": "merriam_webster_private",
        "source_name": "Merriam-Webster",
        "url": "https://www.merriam-webster.com/dictionary/private",
        "source_type": "dictionary",
        "source_author": "Merriam-Webster",
        "target_terms": ["private"],
        "focus": ["entry_definition", "first_known_use", "history"],
    },
    {
        "id": "merriam_webster_privy",
        "source_name": "Merriam-Webster",
        "url": "https://www.merriam-webster.com/dictionary/privy",
        "source_type": "dictionary",
        "source_author": "Merriam-Webster",
        "target_terms": ["privy"],
        "focus": ["entry_definition", "first_known_use", "history"],
    },
    {
        "id": "wiktionary_privacy",
        "source_name": "Wiktionary",
        "url": "https://en.wiktionary.org/wiki/privacy",
        "source_type": "dictionary",
        "source_author": "Wiktionary contributors",
        "target_terms": ["privacy"],
        "focus": ["etymology", "meaning_categories"],
    },
    {
        "id": "wiktionary_private",
        "source_name": "Wiktionary",
        "url": "https://en.wiktionary.org/wiki/private",
        "source_type": "dictionary",
        "source_author": "Wiktionary contributors",
        "target_terms": ["private"],
        "focus": ["etymology", "meaning_categories"],
    },
    {
        "id": "oed_privacy_index",
        "source_name": "Oxford English Dictionary",
        "url": "https://www.oed.com/search/dictionary/?scope=Entries&q=privacy",
        "source_type": "subscription_dictionary",
        "source_author": "Oxford University Press",
        "target_terms": ["privacy", "private", "privy"],
        "focus": ["earliest_attestation", "historical_quotes"],
        "notes": "High-confidence dictionary source, usually subscription-gated.",
    },
    {
        "id": "websters1828_private",
        "source_name": "Webster 1828",
        "url": "https://webstersdictionary1828.com/Dictionary/private",
        "source_type": "historical_dictionary",
        "source_author": "Noah Webster, first 1828 edition",
        "target_terms": ["private"],
        "focus": ["dated_dictionary_entry"],
        "notes": "Public-domain historical dictionary.",
    },
    {
        "id": "websters1913_private",
        "source_name": "Webster 1913",
        "url": "https://www.websters1913.com/words/Private",
        "source_type": "historical_dictionary",
        "source_author": "C. & G. Merriam",
        "target_terms": ["private"],
        "focus": ["dated_dictionary_entry"],
    },
    {
        "id": "mw_privacy_article",
        "source_name": "Merriam-Webster - 'Right to Privacy' legal article",
        "url": "https://www.merriam-webster.com/dictionary/privacy-law",
        "source_type": "dictionary",
        "source_author": "Merriam-Webster",
        "target_terms": ["privacy", "right to privacy"],
        "focus": ["legal_term"],
    },
]


TERM_RELATIONS = {
    "privacy": {
        "spelling": "privacy",
        "category": "privacy_root_family",
        "notes": "Modern noun under investigation; likely post-medieval but potentially later than related private/privy entries.",
    },
    "private": {
        "spelling": "private",
        "category": "privacy_root_family",
        "notes": "Closely related adjective with seclusion and non-public meanings.",
    },
    "privy": {
        "spelling": "privy",
        "category": "privacy_root_family",
        "notes": "Potentially related form in older English; may include senses beyond privacy.",
    },
    "secrecy": {
        "spelling": "secrecy",
        "category": "semantic_neighbour",
        "notes": "Neighbouring semantic field for concealment and non-disclosure.",
    },
    "confidentiality": {
        "spelling": "confidentiality",
        "category": "semantic_neighbour",
        "notes": "Related legal/administrative privacy-adjacent concept.",
    },
    "anonymity": {
        "spelling": "anonymity",
        "category": "identity_privacy_neighbour",
        "notes": "Later-facing privacy-adjacent term around identity visibility control.",
    },
}


POSSIBLE_MEANING_CATEGORIES = [
    "private_public_distinction",
    "secrecy_confidentiality",
    "seclusion_withdrawal",
    "domestic_private_life",
    "freedom_from_observation",
    "freedom_from_intrusion",
    "legal_right",
    "information_control",
    "data_platform_governance",
    "surveillance_visibility",
    "uncertain",
]


WORD_LIST_FOR_CSV: list[str] = [
    "privacy",
    "private",
    "privy",
    "privately",
    "privateness",
    "privatism",
    "privatization",
    "privatise",
    "privatize",
    "secrecy",
    "secret",
    "seclusion",
    "solitude",
    "isolation",
    "publicity",
    "public",
    "personal",
    "domestic",
    "intimacy",
    "confidentiality",
    "anonymity",
]


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def write_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def slug(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "_", text.lower().strip())


_SCRIPT_TAG_RE = re.compile(r"<script\b[^>]*>.*?</script>", re.IGNORECASE | re.DOTALL)
_STYLE_TAG_RE = re.compile(r"<style\b[^>]*>.*?</style>", re.IGNORECASE | re.DOTALL)
_YEAR_WITH_CONTEXT_RE = re.compile(r"\b(1[0-9]{3}|20[0-9]{2})(?:s)?\b")
_CENTURY_RE = re.compile(r"\b([1-9]{1,2})(?:st|nd|rd|th)\s+centur(?:y|ies)\b", re.IGNORECASE)
_CENTURY_DASH_RE = re.compile(r"\b([1-9]{1,2})(?:st|nd|rd|th)-centur(?:y|ies)\b", re.IGNORECASE)
_TERM_CONTEXT_RE = re.compile(r"\b(privacy|private|privy|secrecy|seclusion|confidentiality|anonymity|publicity)\b", re.IGNORECASE)
_DATE_CONTEXT_RE = re.compile(
    r"\b(first|earliest|early|late|mid|attest|attested|attestation|known|recorded|recorded? as|from|since|date|dated|introduced|appearance|origin|c\.?|ca\.?|circa)\b",
    re.IGNORECASE,
)


def _normalize_text(html_text: str) -> str:
    body = _SCRIPT_TAG_RE.sub(" ", html_text)
    body = _STYLE_TAG_RE.sub(" ", body)
    body = html.unescape(body)
    body = re.sub(r"<[^>]+>", " ", body)
    body = re.sub(r"\s+", " ", body)
    return body.lower().strip()


def _year_from_match(match: str) -> int | None:
    try:
        value = int(match)
    except ValueError:
        return None
    if YEAR_MIN <= value <= YEAR_MAX:
        return value
    return None


def extract_year_candidates(text: str) -> list[int]:
    normalized = _normalize_text(text)
    candidates: set[int] = set()

    # Strongly anchored years (e.g., "first recorded 1600", "c. 17th century").
    for match in _YEAR_WITH_CONTEXT_RE.finditer(normalized):
        year = _year_from_match(match.group(1))
        if year is None:
            continue
        context = normalized[max(0, match.start() - EARLY_CONTEXT_CHARS) : min(len(normalized), match.end() + EARLY_CONTEXT_CHARS)]
        if _DATE_CONTEXT_RE.search(context) or _TERM_CONTEXT_RE.search(context):
            candidates.add(year)

    # Century phrasing (e.g., "14th century", "late 15th century").
    for match in _CENTURY_RE.finditer(normalized):
        century = match.group(1)
        year = _year_from_match(f"{int(century) * 100}")
        if year is not None:
            candidates.add(year)
    for match in _CENTURY_DASH_RE.finditer(normalized):
        century = match.group(1)
        year = _year_from_match(f"{int(century) * 100}")
        if year is not None:
            candidates.add(year)

    if candidates:
        return sorted(candidates)

    # Last-resort fallback only when no anchored year exists: terms and year in same sentence.
    sentence_parts = re.split(r"[\.!?;]", normalized)
    for sentence in sentence_parts:
        if not _TERM_CONTEXT_RE.search(sentence):
            continue
        if "<" in sentence or "{" in sentence:
            continue
        for match in _YEAR_WITH_CONTEXT_RE.finditer(sentence):
            year = _year_from_match(match.group(1))
            if year is not None:
                candidates.add(year)

    return sorted(candidates)


def extract_snippet(html_text: str, term: str) -> str:
    lower = html.unescape(html_text).replace("\n", " ")
    plain = re.sub(r"<[^>]+>", " ", lower)
    lower = re.sub(r"\s+", " ", plain).strip()
    index = lower.lower().find(term.lower())
    if index < 0:
        return lower[:360] if len(lower) > 360 else lower
    start = max(0, index - 160)
    end = min(len(lower), index + 260)
    snippet = lower[start:end].strip()
    if start > 0:
        snippet = f"…{snippet}"
    if end < len(lower):
        snippet = f"{snippet}…"
    return snippet[:380]


def classify_term_meaning(text: str) -> str:
    candidate = text.lower()
    if "let alone" in candidate or "intrusion" in candidate or "interference" in candidate:
        return "freedom_from_intrusion"
    if "secret" in candidate or "concealed" in candidate:
        return "secrecy_confidentiality"
    if "public" in candidate and "private" in candidate:
        return "private_public_distinction"
    if "domestic" in candidate or "family" in candidate:
        return "domestic_private_life"
    if "data" in candidate and ("protection" in candidate or "govern" in candidate):
        return "information_control"
    if "information" in candidate and "privacy" in candidate:
        return "information_control"
    if "surveil" in candidate or "monitor" in candidate:
        return "surveillance_visibility"
    if "anonym" in candidate or "identity" in candidate:
        return "secrecy_confidentiality"
    return "uncertain"


def fetch_text(url: str) -> tuple[dict[str, Any], str | None]:
    log = {
        "source": url,
        "access_status": "fetched",
        "error": None,
        "status_code": None,
        "retrieved_at": utc_now(),
        "source_chars": 0,
    }
    if CACHE_ONLY:
        log["access_status"] = "not_fetched_cache_only"
        return {}, "cache-only"

    cache_file = CACHE_DIR / f"{slug(url)}.html"
    if cache_file.exists():
        try:
            payload = cache_file.read_text(encoding="utf-8", errors="replace")
            log["source_chars"] = len(payload)
            return {"source_type": "cache", "raw": payload, "status_code": 200}, None
        except OSError as exc:
            log["error"] = f"cache-read: {exc}"

    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT, "Accept": "text/html,application/json"})
    try:
        with urllib.request.urlopen(request, timeout=20) as response:
            body = response.read().decode("utf-8", errors="replace")
            cache_file.parent.mkdir(parents=True, exist_ok=True)
            cache_file.write_text(body, encoding="utf-8")
            log["source_chars"] = len(body)
            log["status_code"] = str(getattr(response, "status", ""))
            return {"source_type": "fetched", "raw": body, "status_code": getattr(response, "status", None)}, None
    except urllib.error.HTTPError as exc:
        log["access_status"] = "failed_http"
        log["error"] = f"HTTPError {exc.code} {exc.reason}"
        log["status_code"] = str(exc.code)
        return log, f"{log['error']}"
    except urllib.error.URLError as exc:
        log["access_status"] = "failed_network"
        log["error"] = f"URLError: {exc.reason}"
        return log, log["error"]
    except TimeoutError as exc:
        log["access_status"] = "failed_timeout"
        log["error"] = f"TimeoutError: {exc}"
        return log, log["error"]
    except OSError as exc:
        log["access_status"] = "failed_os_error"
        log["error"] = f"{type(exc).__name__}: {exc}"
        return log, log["error"]


def create_attestation_from_text(
    source: dict[str, Any],
    term: str,
    body: str,
    row_counter: int,
) -> list[dict[str, Any]]:
    records: list[dict[str, Any]] = []
    plain = re.sub(r"<[^>]+>", " ", body.lower())
    candidate_years = extract_year_candidates(plain)
    category = classify_term_meaning(plain)
    snippet = extract_snippet(body, term)
    if candidate_years:
        for year in candidate_years[:3]:
            records.append(
                {
                    "id": f"privacy_etym_{row_counter:03d}_{term.replace(' ', '_')}_{year}",
                    "term": term,
                    "spelling": term,
                    "year": year,
                    "date_label": str(year),
                    "meaning_category": category,
                    "definition_or_gloss": snippet[:220],
                    "evidence_excerpt": snippet,
                    "source_title": source.get("source_name"),
                    "source_author": source.get("source_author"),
                    "source_url": source.get("url"),
                    "source_type": source.get("source_type"),
                    "source_label": source.get("source_name"),
                    "evidence_type": "extracted_from_live_source",
                    "confidence": "low" if category == "uncertain" else "medium",
                    "notes": f"Extracted {term} occurrence from source text; multiple raw hits possible.",
                }
            )
        return records

    # If no robust year extraction exists, keep a low-confidence claim candidate
    records.append(
        {
            "id": f"privacy_etym_{row_counter:03d}_{term.replace(' ', '_')}_candidate",
            "term": term,
            "spelling": term,
            "year": None,
            "date_label": "uncertain",
            "meaning_category": category,
            "definition_or_gloss": "No explicit year found in source text during this pass.",
            "evidence_excerpt": snippet,
            "source_title": source.get("source_name"),
            "source_author": source.get("source_author"),
            "source_url": source.get("url"),
            "source_type": source.get("source_type"),
            "source_label": source.get("source_name"),
            "evidence_type": "unconfirmed_source_claim",
            "confidence": "low",
            "notes": "Needs manual review before treating as date-grounded attestation.",
        }
    )
    return records


def source_cache_key(url: str) -> str:
    return f"source_{slug(url)}"


def fetch_sources() -> tuple[list[dict[str, Any]], list[dict[str, Any]], list[dict[str, Any]], list[dict[str, Any]]]:
    source_status = []
    attestation_records = []
    source_checks = []
    search_plan = []
    row_counter = 1

    for source in REFERENCE_SOURCES:
        url = str(source.get("url"))
        source_checks.append(
            {
                "source_id": source.get("id"),
                "source_name": source.get("source_name"),
                "url": url,
                "attempted_at": utc_now(),
                "status": "pending",
            }
        )
        result = {"source_id": source.get("id"), "url": url}
        payload, payload_error = fetch_text(url)
        if isinstance(payload, dict) and payload.get("raw"):
            body = payload["raw"]
            source_checks[-1]["status"] = "fetched"
            source_checks[-1]["source_chars"] = len(body)
            source_checks[-1]["status_code"] = payload.get("status_code")
            search_plan.append(
                {
                    "source_id": source.get("id"),
                    "query": f"search_{source.get('target_terms', ['privacy'])[0]}",
                    "status": "skipped_no_api",
                    "notes": "No generic source search API used; source text parsed by term list.",
                }
            )
            for term in source.get("target_terms", []):
                for attestation in create_attestation_from_text(source, term, body, row_counter):
                    attestation_records.append(attestation)
                    row_counter += 1
                time.sleep(0.03)
        else:
            source_checks[-1]["status"] = "failed"
            source_checks[-1]["error"] = payload_error
            if isinstance(payload, dict):
                source_checks[-1]["source_chars"] = payload.get("source_chars", 0)
                source_checks[-1]["status_code"] = payload.get("status_code")

            for term in source.get("target_terms", []):
                attestation_records.append(
                    {
                        "id": f"privacy_etym_{row_counter:03d}_{term.replace(' ', '_')}_unfetched",
                        "term": term,
                        "spelling": term,
                        "year": None,
                        "date_label": "uncertain",
                        "meaning_category": "uncertain",
                        "definition_or_gloss": "",
                        "evidence_excerpt": "",
                        "source_title": source.get("source_name"),
                        "source_author": source.get("source_author"),
                        "source_url": source.get("url"),
                        "source_type": source.get("source_type"),
                        "source_label": source.get("source_name"),
                        "evidence_type": "source_unfetched",
                        "confidence": "low",
                        "notes": payload_error or "Could not fetch source content in this pass.",
                    }
                )
                row_counter += 1
            time.sleep(REQUEST_DELAY_SECONDS)

        source_status.append(source_checks[-1])

    cache_summary = {"cache_dir": str(CACHE_DIR), "cache_file_count": len(list(CACHE_DIR.glob("*.html")))}
    return attestation_records, source_status, source_checks, [{"plan": search_plan, "cache_summary": cache_summary}]


def main() -> None:
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    CACHE_DIR.mkdir(parents=True, exist_ok=True)

    attestation_records, source_status, _, auxiliary = fetch_sources()

    root_family = []
    for spelling, details in sorted(TERM_RELATIONS.items()):
        root_family.append(
            {
                "term": spelling,
                "relation_to_privacy": "root_related" if spelling in {"privacy", "private", "privy"} else "neighbouring_semantic_field",
                "spelling": details["spelling"],
                "category": details["category"],
                "notes": details["notes"],
            }
        )

    raw_payload = {
        "metadata": {
            "word": WORD,
            "layer_id": LAYER_ID,
            "title": "Privacy etymology and early usage evidence",
            "generated_at": utc_now(),
            "generated_by_script": "scripts/scrape_privacy_etymology_early_usage.py",
            "source_status": source_status,
            "target_terms": WORD_LIST_FOR_CSV,
            "meaning_categories": POSSIBLE_MEANING_CATEGORIES,
            "notes": [
                "Dictionary claims are preserved with confidence labels but are not promoted to confirmed first attestations.",
                "OCR/html normalization artifacts and source gate-keeping can suppress year labels.",
            ],
        },
        "reference_sources": REFERENCE_SOURCES,
        "source_checks": source_status,
        "attestation_records": attestation_records,
        "root_family": root_family,
        "auxiliary": {
            "search_plan": auxiliary,
        },
    }

    write_json(RAW_PATH, raw_payload)

    print("Privacy etymology and early usage scrape summary")
    print(f"- Source targets: {len(REFERENCE_SOURCES)}")
    print(f"- Attestation candidates generated: {len(attestation_records)}")
    print(f"- Root-family records: {len(root_family)}")
    print(f"- Raw output: {RAW_PATH}")


if __name__ == "__main__":
    main()
