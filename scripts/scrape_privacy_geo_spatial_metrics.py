#!/usr/bin/env python3
"""Scrape exploratory geo-spatial metrics for privacy.

This layer is intentionally broad and source-aware. It preserves:
- corpus-region frequency comparisons derived from existing privacy frequency data
- optional search-interest by region availability checks
- news geography via GDELT article/source-country data
- academic geography via OpenAlex works and institution geo metadata
- optional elevation enrichment for records with real coordinates
"""

from __future__ import annotations

import hashlib
import importlib.util
import json
import os
import time
import urllib.error
import urllib.parse
import urllib.request
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
RESEARCH_DIR = ROOT / "docs" / "research" / "privacy"
RAW_DIR = RESEARCH_DIR / "raw"
CACHE_DIR = RAW_DIR / "geo_spatial_cache"

WORD = "privacy"
LAYER_ID = "geo_spatial_metrics"
RAW_PATH = RAW_DIR / "privacy_geo_spatial_metrics_raw.json"
FREQUENCY_PROCESSED_PATH = RESEARCH_DIR / "processed" / "privacy_frequency_terms_processed.json"

USER_AGENT = "WordsOverTime/0.1 privacy geo-spatial metrics pass; contact: local research script"
REQUEST_DELAY_SECONDS = 0.12
CACHE_ONLY = "--cache-only" in os.sys.argv

QUERY_TERMS = [
    "privacy",
    "data privacy",
    "online privacy",
    "internet privacy",
    "digital privacy",
    "information privacy",
    "privacy policy",
    "privacy settings",
    "privacy rights",
    "right to privacy",
    "invasion of privacy",
    "privacy breach",
    "privacy concern",
    "privacy concerns",
    "privacy and security",
    "privacy and surveillance",
    "surveillance privacy",
    "GDPR privacy",
    "biometric privacy",
    "location privacy",
    "consumer privacy",
    "medical privacy",
    "financial privacy",
    "genetic privacy",
    "privacy law Africa",
    "data protection Africa",
    "privacy Nigeria",
    "data privacy Nigeria",
    "privacy Kenya",
    "data protection Kenya",
    "privacy South Africa",
    "POPIA privacy",
    "privacy Brazil",
    "LGPD privacy",
    "data protection Brazil",
    "privacy Mexico",
    "data protection Mexico",
    "privacy Argentina",
    "privacy Chile",
    "privacy Colombia",
    "privacy India",
    "DPDP Act privacy",
    "privacy Indonesia",
    "personal data protection Indonesia",
    "privacy Philippines",
    "data privacy act Philippines",
    "privacy Japan",
    "APPI privacy Japan",
    "privacy South Korea",
    "PIPA privacy Korea",
    "privacy Singapore",
    "PDPA privacy Singapore",
    "privacy Malaysia",
    "privacy Thailand",
    "privacy Vietnam",
    "privacy Middle East",
    "privacy Saudi Arabia",
    "privacy UAE",
    "privacy Qatar",
    "privacy Russia",
    "data protection Russia",
    "personal data Russia",
    "152-FZ privacy Russia",
    "Roskomnadzor privacy",
    "privacy China",
    "data protection China",
    "personal information protection law China",
    "PIPL privacy China",
    "China cybersecurity law privacy",
    "China data security law privacy",
    "privacy Taiwan",
    "data protection Taiwan",
    "Personal Data Protection Act Taiwan",
    "Taiwan PDPA privacy",
    "privacy Hong Kong",
    "Hong Kong PDPO privacy",
    "personal data privacy ordinance Hong Kong",
    "privacy Japan APPI",
    "Act on Protection of Personal Information Japan",
    "personal information protection Japan",
    "kojin joho privacy",
    "privacy Korea PIPA",
    "South Korea Personal Information Protection Act",
    "personal information protection Korea",
    "privacy Mongolia",
    "privacy Nepal",
    "privacy Sri Lanka",
    "privacy Bangladesh",
    "Bangladesh data protection privacy",
    "privacy Pakistan",
    "personal data protection Pakistan",
    "privacy Myanmar",
    "privacy Cambodia",
    "privacy Laos",
    "privacy Brunei",
    "privacy Morocco",
    "Morocco data protection privacy",
    "privacy Ghana",
    "Ghana data protection privacy",
    "privacy Egypt",
    "Egypt personal data protection privacy",
    "privacy Uganda",
    "privacy Rwanda",
    "privacy Tanzania",
    "privacy Ethiopia",
    "privacy Peru",
    "privacy Uruguay",
    "privacy Ecuador",
    "privacy Costa Rica",
    "privacy Panama",
    "privacy Venezuela",
    "habeas data privacy",
    "Latin America data protection privacy",
]

GDELT_WINDOWS = [
    {
        "window_id": "2015_2019",
        "startdatetime": "20150101000000",
        "enddatetime": "20191231235959",
    },
    {
        "window_id": "2020_2026",
        "startdatetime": "20200101000000",
        "enddatetime": "20261231235959",
    },
]

GDELT_MAX_RECORDS = 60
OPENALEX_PER_PAGE = 25
OPENALEX_PAGES = 4
OPENALEX_INSTITUTION_LIMIT = 260
ELEVATION_BATCH_SIZE = 20

COUNTRY_NAME_BY_CODE = {
    "AU": "Australia",
    "AT": "Austria",
    "BE": "Belgium",
    "BR": "Brazil",
    "CA": "Canada",
    "CH": "Switzerland",
    "CN": "China",
    "DK": "Denmark",
    "DE": "Germany",
    "ES": "Spain",
    "EU": "European Union",
    "FI": "Finland",
    "FR": "France",
    "GB": "United Kingdom",
    "HK": "China Hong Kong",
    "IE": "Ireland",
    "IL": "Israel",
    "IN": "India",
    "IT": "Italy",
    "JP": "Japan",
    "KR": "South Korea",
    "MX": "Mexico",
    "NL": "Netherlands",
    "NO": "Norway",
    "NZ": "New Zealand",
    "SG": "Singapore",
    "SE": "Sweden",
    "TW": "China Taiwan",
    "UK": "United Kingdom",
    "US": "United States",
    "ZA": "South Africa",
}


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def write_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def read_json(path: Path, fallback: Any | None = None) -> Any:
    if not path.exists():
        return fallback
    return json.loads(path.read_text(encoding="utf-8"))


def slug(value: str) -> str:
    return "".join(char.lower() if char.isalnum() else "_" for char in value).strip("_")


def cache_path(prefix: str, url: str) -> Path:
    digest = hashlib.sha1(url.encode("utf-8")).hexdigest()[:16]
    return CACHE_DIR / f"{prefix}_{digest}.json"


def sleep_briefly() -> None:
    time.sleep(REQUEST_DELAY_SECONDS)


def build_failure(source_id: str, source_type: str, reason: str, extra: dict[str, Any] | None = None) -> dict[str, Any]:
    payload = {
        "source_id": source_id,
        "source_type": source_type,
        "availability": "failed",
        "reason": reason,
        "retrieved_at": utc_now(),
    }
    if extra:
        payload.update(extra)
    return payload


def fetch_json(url: str, prefix: str, source_name: str, source_type: str) -> dict[str, Any]:
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
            payload = json.loads(path.read_text(encoding="utf-8"))
            log["status"] = "success"
            return {"log": log, "payload": payload}
        except (OSError, json.JSONDecodeError) as exc:
            log["error"] = f"cache-read: {exc}"

    if CACHE_ONLY:
        log["error"] = "cache-only mode active: no cached response available."
        return {"log": log, "payload": None}

    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT, "Accept": "application/json"})
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            payload = json.loads(response.read().decode("utf-8", errors="replace"))
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(json.dumps(payload, ensure_ascii=False), encoding="utf-8")
            log["status"] = "success"
            log["from_cache"] = False
            log["status_code"] = getattr(response, "status", None)
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


def country_name(code: str | None, fallback: str | None = None) -> str | None:
    if not code:
        return fallback
    return COUNTRY_NAME_BY_CODE.get(code.upper(), fallback or code.upper())


def collect_corpus_region_frequency() -> tuple[list[dict[str, Any]], list[dict[str, Any]], list[dict[str, Any]]]:
    processed = read_json(FREQUENCY_PROCESSED_PATH, {})
    series = processed.get("series", [])
    source_labels = {item.get("source_id"): item for item in processed.get("sources", [])}

    records: list[dict[str, Any]] = []
    source_attempts: list[dict[str, Any]] = []
    source_summaries: list[dict[str, Any]] = []

    for row in series:
        source_key = row.get("source")
        source_meta = source_labels.get(source_key, {})
        for point in row.get("values", []):
            records.append(
                {
                    "record_id": f"privacy_geo_corpus_{slug(str(row.get('term')))}_{source_key}_{point.get('year')}",
                    "source_group": "A",
                    "source_type": "corpus_region_frequency",
                    "query": row.get("term"),
                    "term": row.get("term"),
                    "year": point.get("year"),
                    "date": str(point.get("year")) if point.get("year") is not None else None,
                    "value": point.get("value"),
                    "source": "Google Books Ngram Viewer",
                    "source_method": "derived_from_existing_frequency_terms_layer",
                    "corpus": source_key,
                    "corpus_region_label": source_meta.get("corpus_label", source_key),
                    "country": None,
                    "country_code": None,
                    "region": source_meta.get("corpus_label", source_key),
                    "city": None,
                    "latitude": None,
                    "longitude": None,
                    "coordinate_precision": None,
                    "confidence": "medium",
                    "notes": "Corpus-region comparison is not exact geography and should be treated as regional corpus provenance.",
                }
            )

    for item in processed.get("sources", []):
        source_summaries.append(
            {
                "source_id": f"corpus_region_frequency::{item.get('source_id')}",
                "source_type": "corpus_region_frequency",
                "source_name": "Google Books Ngram Viewer",
                "available": True,
                "records": len([row for row in records if row.get("corpus") == item.get("source_id")]),
                "notes": f"Derived from processed privacy frequency series for {item.get('corpus_label', item.get('source_id'))}.",
            }
        )
        source_attempts.append(
            {
                "source_id": f"corpus_region_frequency::{item.get('source_id')}",
                "source_type": "corpus_region_frequency",
                "status": "success",
                "retrieved_at": utc_now(),
                "notes": "Loaded from local processed privacy frequency layer.",
            }
        )

    return records, source_attempts, source_summaries


def collect_trends_region_records() -> tuple[list[dict[str, Any]], list[dict[str, Any]], list[dict[str, Any]], list[dict[str, Any]]]:
    attempts: list[dict[str, Any]] = []
    source_summaries: list[dict[str, Any]] = []
    failures: list[dict[str, Any]] = []

    official_api_keys = [key for key in os.environ if "GOOGLE" in key and "TREND" in key]
    pytrends_available = importlib.util.find_spec("pytrends") is not None

    attempts.append(
        {
            "source_id": "google_trends_official",
            "source_type": "search_interest_by_region",
            "status": "unavailable",
            "retrieved_at": utc_now(),
            "notes": "No configured official Google Trends API credentials detected.",
        }
    )
    attempts.append(
        {
            "source_id": "pytrends",
            "source_type": "search_interest_by_region",
            "status": "unavailable",
            "retrieved_at": utc_now(),
            "notes": "pytrends import not available in this environment." if not pytrends_available else "pytrends available but not used without explicit experimental opt-in.",
        }
    )

    source_summaries.append(
        {
            "source_id": "google_trends",
            "source_type": "search_interest_by_region",
            "source_name": "Google Trends",
            "available": False,
            "records": 0,
            "notes": "No reproducible Trends method is configured for this workspace.",
        }
    )

    failures.append(
        build_failure(
            "google_trends",
            "search_interest_by_region",
            "No official Trends credentials detected and no reproducible unofficial client available.",
            {
                "official_config_detected": bool(official_api_keys),
                "experimental_client_available": pytrends_available,
            },
        )
    )

    return [], attempts, source_summaries, failures


def gdelt_url(query: str, window: dict[str, str]) -> str:
    params = {
        "query": query,
        "mode": "ArtList",
        "format": "json",
        "maxrecords": str(GDELT_MAX_RECORDS),
        "sort": "datedesc",
        "startdatetime": window["startdatetime"],
        "enddatetime": window["enddatetime"],
    }
    return f"https://api.gdeltproject.org/api/v2/doc/doc?{urllib.parse.urlencode(params)}"


def parse_gdelt_records(query: str, window: dict[str, str], payload: dict[str, Any]) -> list[dict[str, Any]]:
    articles = payload.get("articles", [])
    rows: list[dict[str, Any]] = []
    for index, article in enumerate(articles, start=1):
        seendate = article.get("seendate")
        year = int(str(seendate)[:4]) if seendate and str(seendate)[:4].isdigit() else None
        source_country = article.get("sourcecountry")
        rows.append(
            {
                "record_id": f"privacy_geo_gdelt_{slug(query)}_{window['window_id']}_{index:03d}",
                "source_group": "C",
                "source_type": "news_geo_discourse",
                "query": query,
                "term": query,
                "year": year,
                "date": seendate,
                "article_date": seendate,
                "title": article.get("title"),
                "source_name": article.get("domain"),
                "source": "GDELT DOC 2.0",
                "source_country": source_country,
                "country": source_country,
                "country_code": None,
                "region": None,
                "city": None,
                "mentioned_location_name": None,
                "mentioned_country": None,
                "latitude": None,
                "longitude": None,
                "location_resolution": None,
                "tone": None,
                "theme": None,
                "snippet": None,
                "url": article.get("url"),
                "source_method": "gdelt_doc_artlist",
                "window_id": window["window_id"],
                "confidence": "medium" if source_country else "low",
                "notes": "Country-level geography is based on article source country. Mentioned-location point data was not exposed by the reachable GDELT mode in this pass.",
            }
        )
    return rows


def collect_gdelt_records() -> tuple[list[dict[str, Any]], list[dict[str, Any]], list[dict[str, Any]], list[dict[str, Any]]]:
    records: list[dict[str, Any]] = []
    attempts: list[dict[str, Any]] = []
    failures: list[dict[str, Any]] = []

    for query in QUERY_TERMS:
        for window in GDELT_WINDOWS:
            url = gdelt_url(query, window)
            response = fetch_json(url, f"gdelt_{slug(query)}_{window['window_id']}", "GDELT DOC 2.0", "news_geo_discourse")
            attempts.append(
                {
                    "source_id": "gdelt_doc_2",
                    "source_type": "news_geo_discourse",
                    "query": query,
                    "window_id": window["window_id"],
                    "status": response["log"].get("status"),
                    "url": url,
                    "error": response["log"].get("error"),
                    "from_cache": response["log"].get("from_cache"),
                    "retrieved_at": response["log"].get("retrieved_at"),
                }
            )
            payload = response.get("payload")
            if isinstance(payload, dict):
                records.extend(parse_gdelt_records(query, window, payload))
            else:
                failures.append(
                    build_failure(
                        "gdelt_doc_2",
                        "news_geo_discourse",
                        response["log"].get("error") or "No usable GDELT payload returned.",
                        {"query": query, "window_id": window["window_id"], "url": url},
                    )
                )
            sleep_briefly()

    source_summaries = [
        {
            "source_id": "gdelt_doc_2",
            "source_type": "news_geo_discourse",
            "source_name": "GDELT DOC 2.0",
            "available": len(records) > 0,
            "records": len(records),
            "notes": "Article/source-country geography recovered. Point-level mentioned-location geography was not available from the reachable mode.",
        }
    ]
    return records, attempts, source_summaries, failures


def openalex_works_url(query: str, page: int) -> str:
    params = {
        "search": query,
        "per-page": str(OPENALEX_PER_PAGE),
        "page": str(page),
        "select": ",".join(
            [
                "id",
                "display_name",
                "publication_year",
                "publication_date",
                "type",
                "cited_by_count",
                "authorships",
                "doi",
                "primary_topic",
                "concepts",
            ]
        ),
        "mailto": "local@wordsovertime.invalid",
    }
    return f"https://api.openalex.org/works?{urllib.parse.urlencode(params)}"


def institution_select_url(institution_id: str) -> str:
    encoded = urllib.parse.quote(institution_id, safe=":/")
    params = urllib.parse.urlencode(
        {
            "select": "id,display_name,country_code,geo,type,ids,summary_stats",
            "mailto": "local@wordsovertime.invalid",
        }
    )
    return f"https://api.openalex.org/institutions/{encoded}?{params}"


def collect_openalex_records() -> tuple[list[dict[str, Any]], list[dict[str, Any]], list[dict[str, Any]], list[dict[str, Any]], list[dict[str, Any]]]:
    records: list[dict[str, Any]] = []
    attempts: list[dict[str, Any]] = []
    failures: list[dict[str, Any]] = []
    institution_counts: Counter[str] = Counter()
    institution_display: dict[str, dict[str, Any]] = {}

    for query in QUERY_TERMS:
        for page in range(1, OPENALEX_PAGES + 1):
            url = openalex_works_url(query, page)
            response = fetch_json(url, f"openalex_works_{slug(query)}_p{page}", "OpenAlex works", "academic_geo_distribution")
            attempts.append(
                {
                    "source_id": "openalex_works",
                    "source_type": "academic_geo_distribution",
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
                        "openalex_works",
                        "academic_geo_distribution",
                        response["log"].get("error") or "No usable OpenAlex works payload returned.",
                        {"query": query, "page": page, "url": url},
                    )
                )
                sleep_briefly()
                continue

            for work in payload.get("results", []):
                authorships = work.get("authorships", [])
                if not authorships:
                    records.append(
                        {
                            "record_id": f"privacy_geo_openalex_{slug(query)}_{slug(str(work.get('id')))}_noinst",
                            "source_group": "D",
                            "source_type": "academic_geo_distribution",
                            "query": query,
                            "term": query,
                            "year": work.get("publication_year"),
                            "date": work.get("publication_date"),
                            "work_id": work.get("id"),
                            "title": work.get("display_name"),
                            "type": work.get("type"),
                            "cited_by_count": work.get("cited_by_count"),
                            "institution_id": None,
                            "institution_name": None,
                            "country_code": None,
                            "country": None,
                            "region": None,
                            "city": None,
                            "latitude": None,
                            "longitude": None,
                            "coordinate_precision": None,
                            "topic": (work.get("primary_topic") or {}).get("display_name"),
                            "doi": work.get("doi"),
                            "openalex_url": work.get("id"),
                            "source": "OpenAlex",
                            "source_method": "openalex_work_search",
                            "confidence": "low",
                            "notes": "No institution metadata was present on this work record.",
                        }
                    )
                    continue

                for authorship in authorships:
                    for institution in authorship.get("institutions", []):
                        institution_id = institution.get("id")
                        institution_name = institution.get("display_name")
                        institution_counts[institution_id] += 1
                        institution_display[institution_id] = institution
                        records.append(
                            {
                                "record_id": f"privacy_geo_openalex_{slug(query)}_{slug(str(work.get('id')))}_{slug(str(institution_id))}",
                                "source_group": "D",
                                "source_type": "academic_geo_distribution",
                                "query": query,
                                "term": query,
                                "year": work.get("publication_year"),
                                "date": work.get("publication_date"),
                                "work_id": work.get("id"),
                                "title": work.get("display_name"),
                                "type": work.get("type"),
                                "cited_by_count": work.get("cited_by_count"),
                                "institution_id": institution_id,
                                "institution_name": institution_name,
                                "country_code": institution.get("country_code"),
                                "country": country_name(institution.get("country_code")),
                                "region": None,
                                "city": None,
                                "latitude": None,
                                "longitude": None,
                                "coordinate_precision": None,
                                "topic": (work.get("primary_topic") or {}).get("display_name"),
                                "doi": work.get("doi"),
                                "openalex_url": work.get("id"),
                                "source": "OpenAlex",
                                "source_method": "openalex_work_search",
                                "confidence": "medium",
                                "notes": None,
                            }
                        )
            sleep_briefly()

    institution_geo_rows: list[dict[str, Any]] = []
    for institution_id, _count in institution_counts.most_common(OPENALEX_INSTITUTION_LIMIT):
        if not institution_id:
            continue
        url = institution_select_url(institution_id)
        response = fetch_json(
            url,
            f"openalex_institution_{slug(institution_id)}",
            "OpenAlex institutions",
            "academic_geo_distribution",
        )
        attempts.append(
            {
                "source_id": "openalex_institutions",
                "source_type": "academic_geo_distribution",
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
                    "openalex_institutions",
                    "academic_geo_distribution",
                    response["log"].get("error") or "No usable OpenAlex institution payload returned.",
                    {"institution_id": institution_id, "url": url},
                )
            )
            sleep_briefly()
            continue
        institution_geo_rows.append(
            {
                "institution_id": payload.get("id"),
                "institution_name": payload.get("display_name"),
                "country_code": payload.get("country_code"),
                "country": ((payload.get("geo") or {}).get("country")) or country_name(payload.get("country_code")),
                "region": (payload.get("geo") or {}).get("region"),
                "city": (payload.get("geo") or {}).get("city"),
                "latitude": (payload.get("geo") or {}).get("latitude"),
                "longitude": (payload.get("geo") or {}).get("longitude"),
                "institution_type": payload.get("type"),
                "summary_stats": payload.get("summary_stats", {}),
            }
        )
        sleep_briefly()

    geo_by_institution = {row["institution_id"]: row for row in institution_geo_rows if row.get("institution_id")}
    for row in records:
        institution_id = row.get("institution_id")
        if not institution_id:
            continue
        geo = geo_by_institution.get(institution_id)
        if not geo:
            continue
        row["institution_name"] = geo.get("institution_name") or row.get("institution_name")
        row["country_code"] = geo.get("country_code") or row.get("country_code")
        row["country"] = geo.get("country") or row.get("country")
        row["region"] = geo.get("region")
        row["city"] = geo.get("city")
        row["latitude"] = geo.get("latitude")
        row["longitude"] = geo.get("longitude")
        row["coordinate_precision"] = "institution_city" if geo.get("latitude") is not None and geo.get("longitude") is not None else None

    source_summaries = [
        {
            "source_id": "openalex_works",
            "source_type": "academic_geo_distribution",
            "source_name": "OpenAlex works",
            "available": len(records) > 0,
            "records": len(records),
            "notes": "Privacy-related works captured via query search and flattened by institution affiliation.",
        },
        {
            "source_id": "openalex_institutions",
            "source_type": "academic_geo_distribution",
            "source_name": "OpenAlex institutions",
            "available": len(institution_geo_rows) > 0,
            "records": len(institution_geo_rows),
            "notes": "Institution geo metadata used to enrich academic records with city/region/country and coordinates where available.",
        },
    ]
    return records, institution_geo_rows, attempts, source_summaries, failures


def elevation_url(coords: list[tuple[float, float]]) -> str:
    joined = "|".join(f"{lat},{lon}" for lat, lon in coords)
    return f"https://api.open-elevation.com/api/v1/lookup?locations={urllib.parse.quote(joined, safe='|,')}"


def collect_elevation_records(points: list[dict[str, Any]]) -> tuple[list[dict[str, Any]], list[dict[str, Any]], list[dict[str, Any]], list[dict[str, Any]]]:
    unique_points: list[tuple[float, float, str | None, str | None, str | None]] = []
    seen: set[tuple[float, float]] = set()
    for point in points:
        lat = point.get("latitude")
        lon = point.get("longitude")
        if lat is None or lon is None:
            continue
        key = (round(float(lat), 6), round(float(lon), 6))
        if key in seen:
            continue
        seen.add(key)
        unique_points.append((float(lat), float(lon), point.get("country"), point.get("region"), point.get("city")))

    attempts: list[dict[str, Any]] = []
    failures: list[dict[str, Any]] = []
    rows: list[dict[str, Any]] = []

    for index in range(0, len(unique_points), ELEVATION_BATCH_SIZE):
        batch = unique_points[index : index + ELEVATION_BATCH_SIZE]
        coords = [(lat, lon) for lat, lon, _country, _region, _city in batch]
        url = elevation_url(coords)
        response = fetch_json(url, f"open_elevation_{index:04d}", "Open-Elevation", "elevation_enrichment")
        attempts.append(
            {
                "source_id": "open_elevation",
                "source_type": "elevation_enrichment",
                "status": response["log"].get("status"),
                "url": url,
                "error": response["log"].get("error"),
                "from_cache": response["log"].get("from_cache"),
                "retrieved_at": response["log"].get("retrieved_at"),
                "batch_size": len(batch),
            }
        )
        payload = response.get("payload")
        if not isinstance(payload, dict):
            failures.append(
                build_failure(
                    "open_elevation",
                    "elevation_enrichment",
                    response["log"].get("error") or "No usable elevation payload returned.",
                    {"batch_index": index, "url": url},
                )
            )
            sleep_briefly()
            continue
        results = payload.get("results", [])
        for batch_row, result in zip(batch, results):
            lat, lon, country, region, city = batch_row
            rows.append(
                {
                    "latitude": lat,
                    "longitude": lon,
                    "country": country,
                    "region": region,
                    "city": city,
                    "elevation_meters": result.get("elevation"),
                    "elevation_source": "open_elevation",
                    "elevation_confidence": "medium",
                    "coordinate_precision": "institution_city",
                    "notes": "Elevation is treated as a spatial attribute only and should not be interpreted as causal evidence.",
                }
            )
        sleep_briefly()

    source_summaries = [
        {
            "source_id": "open_elevation",
            "source_type": "elevation_enrichment",
            "source_name": "Open-Elevation",
            "available": len(rows) > 0,
            "records": len(rows),
            "notes": "Elevation was added only for records that already had valid coordinates.",
        }
    ]
    return rows, attempts, source_summaries, failures


def main() -> None:
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    CACHE_DIR.mkdir(parents=True, exist_ok=True)

    corpus_records, corpus_attempts, corpus_sources = collect_corpus_region_frequency()
    trends_records, trends_attempts, trends_sources, trends_failures = collect_trends_region_records()
    gdelt_records, gdelt_attempts, gdelt_sources, gdelt_failures = collect_gdelt_records()
    openalex_records, institution_geo_rows, openalex_attempts, openalex_sources, openalex_failures = collect_openalex_records()
    elevation_rows, elevation_attempts, elevation_sources, elevation_failures = collect_elevation_records(openalex_records)

    elevation_by_coord = {
        (round(float(item["latitude"]), 6), round(float(item["longitude"]), 6)): item for item in elevation_rows if item.get("latitude") is not None and item.get("longitude") is not None
    }
    for row in openalex_records:
        lat = row.get("latitude")
        lon = row.get("longitude")
        if lat is None or lon is None:
            continue
        elevation = elevation_by_coord.get((round(float(lat), 6), round(float(lon), 6)))
        if not elevation:
            continue
        row["elevation_meters"] = elevation.get("elevation_meters")
        row["elevation_source"] = elevation.get("elevation_source")
        row["elevation_confidence"] = elevation.get("elevation_confidence")

    all_attempts = corpus_attempts + trends_attempts + gdelt_attempts + openalex_attempts + elevation_attempts
    all_sources = corpus_sources + trends_sources + gdelt_sources + openalex_sources + elevation_sources
    all_failures = trends_failures + gdelt_failures + openalex_failures + elevation_failures

    payload = {
        "metadata": {
            "word": WORD,
            "layer_id": LAYER_ID,
            "title": "Privacy geo-spatial metrics",
            "generated_at": utc_now(),
            "generated_by_script": "scripts/scrape_privacy_geo_spatial_metrics.py",
            "queries": QUERY_TERMS,
            "local_inputs": [str(FREQUENCY_PROCESSED_PATH.relative_to(ROOT))],
            "notes": [
                "This is a broad geo-spatial discovery layer and is not a final visualization specification.",
                "Elevation is preserved only as a spatial attribute; it is not interpreted as causal evidence.",
                "Unavailable geo sources are logged explicitly rather than coerced to zero values.",
            ],
        },
        "sources": all_sources,
        "source_attempts": all_attempts,
        "corpus_region_records": corpus_records,
        "trends_region_records": trends_records,
        "gdelt_records": gdelt_records,
        "openalex_records": openalex_records,
        "institution_geo_records": institution_geo_rows,
        "elevation_records": elevation_rows,
        "failed_sources": all_failures,
    }
    write_json(RAW_PATH, payload)

    print("Privacy geo-spatial metrics scrape summary")
    print(f"- Corpus-region records: {len(corpus_records)}")
    print(f"- Trends region records: {len(trends_records)}")
    print(f"- GDELT records: {len(gdelt_records)}")
    print(f"- OpenAlex records: {len(openalex_records)}")
    print(f"- Institution geo rows: {len(institution_geo_rows)}")
    print(f"- Elevation rows: {len(elevation_rows)}")
    print(f"- Failed source entries: {len(all_failures)}")
    print(f"- Raw output: {RAW_PATH}")


if __name__ == "__main__":
    main()
