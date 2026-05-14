#!/usr/bin/env python3
"""Collect targeted naming-pattern inputs for hub Chart 03.

This pass is not a broad hub scrape. It reuses existing hub frequency data
first, then attempts small Ngram gaps and lightweight public-page checks for
search-visibility, brand/platform, and institutional naming examples.
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
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
RESEARCH_DIR = ROOT / "docs" / "research" / "hub"
RAW_DIR = RESEARCH_DIR / "raw"
PROCESSED_DIR = RESEARCH_DIR / "processed"
CACHE_DIR = RAW_DIR / "chart03_naming_cache"

START_YEAR = 1800
END_YEAR = 2022
CORPUS = "en"
CORPUS_LABEL = "English"
SMOOTHING = 0
CASE_INSENSITIVE = True
BATCH_SIZE = 8
REQUEST_DELAY_SECONDS = 0.35
NGRAM_ENDPOINT = "https://books.google.com/ngrams/json"
DUCKDUCKGO_ENDPOINT = "https://duckduckgo.com/html/"
USER_AGENT = "WordsOverTime/0.1 hub chart03 naming pass; contact: local research script"
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

NAMING_TAXONOMY = {
    "suffix_phrase": {
        "label": "X + hub",
        "description": "A domain, audience, resource, service, or institution is named as a centralized access point.",
        "semantic_functions": [
            "access point",
            "resource aggregation",
            "service portal",
            "community gathering point",
            "knowledge organization",
            "institutional branding",
        ],
    },
    "prefix_phrase": {
        "label": "hub + X",
        "description": "Hub acts as a modifier meaning hub-like, central, systemic, or node-based.",
        "semantic_functions": ["technical connection", "system model", "node classification"],
    },
    "closed_compound_or_brand": {
        "label": "XHub / X-hub / HubX",
        "description": "Hub is incorporated into a brand, platform, website, product, or service name.",
        "semantic_functions": [
            "platform access",
            "content aggregation",
            "repository/distribution point",
            "service portal",
        ],
    },
    "institutional_access_point": {
        "label": "Institutional Access Point",
        "description": "Hub names a campus, service, office, room, portal, or resource access point.",
        "semantic_functions": ["access point", "resource aggregation", "service portal", "institutional branding"],
    },
    "platform_content_access": {
        "label": "Platform / Content Access",
        "description": "Hub names a digital, informational, content, data, documentation, or community access point.",
        "semantic_functions": ["content platform", "data access", "repository/distribution point", "knowledge organization"],
    },
    "technical_system": {
        "label": "Technical System",
        "description": "Hub names a node, connector, integration point, or technical routing object.",
        "semantic_functions": ["technical connection", "integration point", "repository/distribution point"],
    },
}


def frequency_specs() -> list[dict[str, Any]]:
    rows = [
        # X + hub: institutional/service/resource and modern access naming.
        ("student hub", "suffix_phrase", "institutional_access_point", "student service or portal"),
        ("learning hub", "suffix_phrase", "institutional_access_point", "learning support or learning environment"),
        ("resource hub", "suffix_phrase", "institutional_access_point", "resource access point"),
        ("equipment hub", "suffix_phrase", "institutional_access_point", "equipment room or checkout point"),
        ("media hub", "suffix_phrase", "institutional_access_point", "media equipment or production access point"),
        ("service hub", "suffix_phrase", "institutional_access_point", "service access point"),
        ("support hub", "suffix_phrase", "institutional_access_point", "support access point"),
        ("help hub", "suffix_phrase", "institutional_access_point", "help access point"),
        ("community hub", "suffix_phrase", "institutional_access_point", "community access or gathering point"),
        ("campus hub", "suffix_phrase", "institutional_access_point", "campus access or activity center"),
        ("library hub", "suffix_phrase", "institutional_access_point", "library access or catalog point"),
        ("wellbeing hub", "suffix_phrase", "institutional_access_point", "wellbeing service access point"),
        ("career hub", "suffix_phrase", "institutional_access_point", "career service access point"),
        ("maker hub", "suffix_phrase", "institutional_access_point", "maker space or fabrication access point"),
        ("business hub", "suffix_phrase", "institutional_access_point", "business concentration or access point"),
        ("financial hub", "suffix_phrase", "institutional_access_point", "financial concentration or access point"),
        ("innovation hub", "suffix_phrase", "institutional_access_point", "innovation cluster or service point"),
        ("knowledge hub", "suffix_phrase", "institutional_access_point", "knowledge resource access point"),
        ("research hub", "suffix_phrase", "institutional_access_point", "research resource or cluster"),
        ("education hub", "suffix_phrase", "institutional_access_point", "education cluster or service point"),
        ("creative hub", "suffix_phrase", "institutional_access_point", "creative community or service point"),
        ("startup hub", "suffix_phrase", "institutional_access_point", "startup ecosystem access point"),
        # Platform/content access.
        ("content hub", "suffix_phrase", "platform_content_access", "content aggregation point"),
        ("data hub", "suffix_phrase", "platform_content_access", "data access or integration point"),
        ("digital hub", "suffix_phrase", "platform_content_access", "digital access point"),
        ("online hub", "suffix_phrase", "platform_content_access", "online access point"),
        ("developer hub", "suffix_phrase", "platform_content_access", "developer documentation or tools point"),
        ("documentation hub", "suffix_phrase", "platform_content_access", "documentation access point"),
        ("API hub", "suffix_phrase", "platform_content_access", "API discovery or documentation point"),
        # Hub + X: prefix/systemic naming.
        ("hub page", "prefix_phrase", "platform_content_access", "hub-like landing page"),
        ("hub model", "prefix_phrase", "technical_system", "hub-like model"),
        ("hub system", "prefix_phrase", "technical_system", "hub-like system"),
        ("hub network", "prefix_phrase", "technical_system", "hub-like network"),
        ("hub node", "prefix_phrase", "technical_system", "hub-like node"),
        ("hub airport", "prefix_phrase", "technical_system", "hub airport category"),
        ("hub city", "prefix_phrase", "institutional_access_point", "city classified as hub"),
        ("hub location", "prefix_phrase", "institutional_access_point", "location classified as hub"),
        ("hub site", "prefix_phrase", "platform_content_access", "site classified as hub"),
        ("hub room", "prefix_phrase", "institutional_access_point", "room classified as hub"),
        ("hub service", "prefix_phrase", "institutional_access_point", "service classified as hub"),
        ("hub strategy", "prefix_phrase", "technical_system", "hub-like strategy"),
        # Technical-system phrases, including some already used in Chart 01/02.
        ("network hub", "suffix_phrase", "technical_system", "network node or device"),
        ("USB hub", "suffix_phrase", "technical_system", "technical device connector"),
        ("Ethernet hub", "suffix_phrase", "technical_system", "network device connector"),
        ("switching hub", "suffix_phrase", "technical_system", "network switching device"),
        ("communication hub", "suffix_phrase", "technical_system", "communication node"),
        ("integration hub", "suffix_phrase", "technical_system", "integration point"),
    ]
    specs = []
    for index, (query, pattern, object_type, note) in enumerate(rows, 1):
        specs.append(
            {
                "query_id": f"hub_chart03_query_{index:03d}",
                "query": query,
                "naming_pattern": pattern,
                "object_type": object_type,
                "semantic_function": note,
                "case_sensitive": False,
            }
        )
    return specs


BRAND_PLATFORM_SEEDS = [
    {
        "name": "GitHub",
        "normalized_form": "github",
        "hub_position": "closed_compound",
        "object_type": "platform",
        "domain_or_category": "software repositories and collaboration",
        "first_known_or_launch_year": "2008",
        "year_source": "public reference pages report official public launch in April 2008",
        "official_or_reference_url": "https://en.wikipedia.org/wiki/GitHub",
        "naming_function": "repository_center",
        "include_in_chart": True,
        "sensitivity_or_caution": "",
        "notes": "Brand/platform example; do not treat as ordinary phrase frequency.",
    },
    {
        "name": "Pornhub",
        "normalized_form": "pornhub",
        "hub_position": "closed_compound",
        "object_type": "website",
        "domain_or_category": "adult video platform",
        "first_known_or_launch_year": "2007",
        "year_source": "public reference pages report launch in May 2007",
        "official_or_reference_url": "https://en.wikipedia.org/wiki/Pornhub",
        "naming_function": "content_aggregation",
        "include_in_chart": True,
        "sensitivity_or_caution": "Adult-content platform; use neutrally as optional naming-pattern evidence only.",
        "notes": "Useful only as a platform-era compound naming example.",
    },
    {
        "name": "Sci-Hub",
        "normalized_form": "sci_hub",
        "hub_position": "hyphenated_compound",
        "object_type": "archive",
        "domain_or_category": "scientific paper access",
        "first_known_or_launch_year": "2011",
        "year_source": "public reference pages report founding in 2011",
        "official_or_reference_url": "https://en.wikipedia.org/wiki/Sci-Hub",
        "naming_function": "platform_access",
        "include_in_chart": True,
        "sensitivity_or_caution": "Legally contested access platform; use only as naming-pattern evidence.",
        "notes": "Brand/platform-like form; not ordinary lexical frequency.",
    },
    {
        "name": "HubSpot",
        "normalized_form": "hubspot",
        "hub_position": "prefix_brand",
        "object_type": "software_service",
        "domain_or_category": "marketing and CRM software",
        "first_known_or_launch_year": "2006",
        "year_source": "HubSpot story/about pages report founding in 2006",
        "official_or_reference_url": "https://www.hubspot.com/our-story",
        "naming_function": "service_portal",
        "include_in_chart": True,
        "sensitivity_or_caution": "",
        "notes": "Hub as brand prefix rather than suffix phrase.",
    },
    {
        "name": "HubPages",
        "normalized_form": "hubpages",
        "hub_position": "prefix_brand",
        "object_type": "website",
        "domain_or_category": "online publishing platform",
        "first_known_or_launch_year": "2006",
        "year_source": "HubPages FAQ and launch press references report August 2006",
        "official_or_reference_url": "https://hubpages.com/faq/",
        "naming_function": "content_aggregation",
        "include_in_chart": True,
        "sensitivity_or_caution": "",
        "notes": "Content-platform naming example.",
    },
    {
        "name": "Docker Hub",
        "normalized_form": "docker_hub",
        "hub_position": "suffix_phrase",
        "object_type": "repository",
        "domain_or_category": "container image registry",
        "first_known_or_launch_year": "2014",
        "year_source": "Docker 1.0/Docker Hub launch references",
        "official_or_reference_url": "https://docs.docker.com/docker-hub/",
        "naming_function": "technical_distribution",
        "include_in_chart": True,
        "sensitivity_or_caution": "",
        "notes": "Repository/distribution hub example.",
    },
    {
        "name": "Hugging Face Hub",
        "normalized_form": "hugging_face_hub",
        "hub_position": "suffix_phrase",
        "object_type": "repository",
        "domain_or_category": "models, datasets, and demos",
        "first_known_or_launch_year": "2020s",
        "year_source": "Hugging Face Hub documentation; exact launch year not asserted here",
        "official_or_reference_url": "https://huggingface.co/docs/hub/main/index",
        "naming_function": "repository_center",
        "include_in_chart": True,
        "sensitivity_or_caution": "Approximate date; do not show as precise launch year without further verification.",
        "notes": "Modern technical platform hub example.",
    },
    {
        "name": "Hubstaff",
        "normalized_form": "hubstaff",
        "hub_position": "prefix_brand",
        "object_type": "software_service",
        "domain_or_category": "time tracking and workforce software",
        "first_known_or_launch_year": "2012",
        "year_source": "Hubstaff about page reports origin in 2012",
        "official_or_reference_url": "https://hubstaff.com/about",
        "naming_function": "service_portal",
        "include_in_chart": False,
        "sensitivity_or_caution": "Optional background example; not central to Chart 03.",
        "notes": "Brand prefix example.",
    },
]


INSTITUTIONAL_EXAMPLE_SEEDS = [
    {
        "term": "student hub",
        "institution_or_source": "Western New England University",
        "source_url": "https://wne.edu/student-life/student-hub.cfm",
        "source_title": "Student Hub | Student Life",
        "country_or_region": "United States",
        "object_type": "student_service",
        "context_summary": "Campus center offices and drop-in student services are named as a Student Hub.",
        "supports_naming_claim": True,
        "confidence": "high",
    },
    {
        "term": "student hub",
        "institution_or_source": "University of Birmingham",
        "source_url": "https://www.birmingham.ac.uk/university/building/student-hub.aspx",
        "source_title": "Aston Webb Student Hub",
        "country_or_region": "United Kingdom",
        "object_type": "student_service",
        "context_summary": "Student Hub services are attached to a named university building/service point.",
        "supports_naming_claim": True,
        "confidence": "high",
    },
    {
        "term": "learning hub",
        "institution_or_source": "University of Sydney",
        "source_url": "https://www.sydney.edu.au/students/learning-hub.html",
        "source_title": "Learning Hub",
        "country_or_region": "Australia",
        "object_type": "student_service",
        "context_summary": "Learning Hub names an academic support access point for students.",
        "supports_naming_claim": True,
        "confidence": "high",
    },
    {
        "term": "learning hub",
        "institution_or_source": "University of Illinois Springfield",
        "source_url": "https://www.uis.edu/learning-hub",
        "source_title": "The Learning Hub",
        "country_or_region": "United States",
        "object_type": "student_service",
        "context_summary": "Learning Hub names academic support services.",
        "supports_naming_claim": True,
        "confidence": "high",
    },
    {
        "term": "resource hub",
        "institution_or_source": "Cornell University",
        "source_url": "https://scl.cornell.edu/new-student-resource-hub",
        "source_title": "New Student Resource Hub",
        "country_or_region": "United States",
        "object_type": "resource_center",
        "context_summary": "Resource Hub gathers new-student tasks, dates, resources, and campus links.",
        "supports_naming_claim": True,
        "confidence": "high",
    },
    {
        "term": "resource hub",
        "institution_or_source": "Valparaiso University",
        "source_url": "https://www.valpo.edu/resource-hub/",
        "source_title": "Resource Hub",
        "country_or_region": "United States",
        "object_type": "resource_center",
        "context_summary": "Resource Hub gathers student checklist, resources, and help pathways.",
        "supports_naming_claim": True,
        "confidence": "high",
    },
    {
        "term": "media hub",
        "institution_or_source": "Oregon State University",
        "source_url": "https://technology.oregonstate.edu/services/media-hub",
        "source_title": "Media Hub",
        "country_or_region": "United States",
        "object_type": "equipment_room",
        "context_summary": "Media Hub provides multimedia facilities, equipment, poster printing, DIY studios, consultation, and training.",
        "supports_naming_claim": True,
        "confidence": "high",
    },
    {
        "term": "media hub",
        "institution_or_source": "University of Plymouth",
        "source_url": "https://www.plymouth.ac.uk/facilities/media-hub",
        "source_title": "Media Hub",
        "country_or_region": "United Kingdom",
        "object_type": "equipment_room",
        "context_summary": "Media Hub names a physical facility with audiovisual and photographic equipment for courses.",
        "supports_naming_claim": True,
        "confidence": "high",
    },
    {
        "term": "equipment hub",
        "institution_or_source": "Lancashire jobs / University context",
        "source_url": "https://jobs.lancashire.ac.uk/Upload/vacancies/files/951/0424-24.pdf",
        "source_title": "Support Technician Equipment Hub - IT & AV (Stores)",
        "country_or_region": "United Kingdom",
        "object_type": "equipment_room",
        "context_summary": "Equipment Hub appears as a named IT/AV stores function in a university-related job document.",
        "supports_naming_claim": True,
        "confidence": "medium",
    },
    {
        "term": "service hub",
        "institution_or_source": "New York Tech",
        "source_url": "https://www.nyit.edu/students/student-service-hub/",
        "source_title": "Student Service Hub",
        "country_or_region": "United States",
        "object_type": "service_portal",
        "context_summary": "Student Service HUB names a one-stop student business/service access point.",
        "supports_naming_claim": True,
        "confidence": "high",
    },
    {
        "term": "wellbeing hub",
        "institution_or_source": "University of Buckingham",
        "source_url": "https://www.buckingham.ac.uk/student-life/wellbeing-hub/",
        "source_title": "Wellbeing Hub",
        "country_or_region": "United Kingdom",
        "object_type": "student_service",
        "context_summary": "Wellbeing Hub names a support service for students experiencing difficulties with university life.",
        "supports_naming_claim": True,
        "confidence": "high",
    },
    {
        "term": "career hub",
        "institution_or_source": "University of Minnesota College of Liberal Arts",
        "source_url": "https://cla.umn.edu/get-ready",
        "source_title": "CLA Career Hub",
        "country_or_region": "United States",
        "object_type": "service_portal",
        "context_summary": "Career Hub names an online career-readiness access and navigation point.",
        "supports_naming_claim": True,
        "confidence": "high",
    },
    {
        "term": "maker hub",
        "institution_or_source": "Elon University",
        "source_url": "https://www.elon.edu/u/fa/technology/makerhub",
        "source_title": "The Maker Hub",
        "country_or_region": "United States",
        "object_type": "community_space",
        "context_summary": "Maker Hub names a campus making/fabrication access space.",
        "supports_naming_claim": True,
        "confidence": "high",
    },
    {
        "term": "maker hub",
        "institution_or_source": "George Fox University",
        "source_url": "https://www.georgefox.edu/college-admissions/campus-tour/maker-hub.html",
        "source_title": "Engineering Maker Hub",
        "country_or_region": "United States",
        "object_type": "community_space",
        "context_summary": "Maker Hub names a design, prototyping, and fabrication space.",
        "supports_naming_claim": True,
        "confidence": "high",
    },
    {
        "term": "API hub",
        "institution_or_source": "Google Cloud Apigee",
        "source_url": "https://docs.cloud.google.com/apigee/docs/apihub/getting-started-apihub",
        "source_title": "Get started with API hub",
        "country_or_region": "Global",
        "object_type": "digital_portal",
        "context_summary": "API hub names a managed API inventory and access/management surface.",
        "supports_naming_claim": True,
        "confidence": "high",
    },
]


PLATFORM_EXAMPLE_SEEDS = [
    {
        "query": "content hub",
        "source_url": "https://doc.sitecore.com/ch/en",
        "source_title": "Sitecore Content Hub documentation",
        "domain": "doc.sitecore.com",
        "object_type": "platform_content_access",
        "notes": "Content Hub names a marketing content management platform.",
    },
    {
        "query": "data hub",
        "source_url": "https://docs.dune.com/web-app/overview",
        "source_title": "Dune Data Hub overview",
        "domain": "docs.dune.com",
        "object_type": "platform_content_access",
        "notes": "Data Hub names a central workspace for querying and sharing data insights.",
    },
    {
        "query": "API hub",
        "source_url": "https://docs.cloud.google.com/apigee/docs/apihub/getting-started-apihub",
        "source_title": "Google Cloud Apigee API hub documentation",
        "domain": "docs.cloud.google.com",
        "object_type": "platform_content_access",
        "notes": "API hub names an API inventory and management access point.",
    },
    {
        "query": "developer hub",
        "source_url": "https://docs.rapidapi.com/",
        "source_title": "Rapid API Hub documentation",
        "domain": "docs.rapidapi.com",
        "object_type": "platform_content_access",
        "notes": "API/developer hub documentation names an access surface for API users and publishers.",
    },
]


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


def cache_path(prefix: str, url: str, suffix: str = "json") -> Path:
    digest = hashlib.sha1(url.encode("utf-8")).hexdigest()[:16]
    return CACHE_DIR / f"{prefix}_{digest}.{suffix}"


def fetch_text(url: str, prefix: str, timeout: int = 18) -> dict[str, Any]:
    path = cache_path(prefix, url, "html")
    log = {
        "url": url,
        "cache_path": str(path.relative_to(ROOT)),
        "from_cache": path.exists(),
        "ok": False,
        "status_code": None,
        "error": None,
        "retrieved_at": utc_now(),
    }
    if path.exists():
        try:
            text = path.read_text(encoding="utf-8", errors="replace")
            log["ok"] = True
            return {"log": log, "text": text}
        except OSError as exc:
            log["error"] = f"Cache read failed: {exc}"

    if CACHE_ONLY:
        log["error"] = "Cache-only mode: no cached response for this URL."
        return {"log": log, "text": ""}

    request = urllib.request.Request(
        url,
        headers={
            "User-Agent": USER_AGENT,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
    )
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            data = response.read(400_000).decode("utf-8", errors="replace")
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(data, encoding="utf-8")
            log.update({"ok": True, "status_code": getattr(response, "status", None), "from_cache": False})
            return {"log": log, "text": data}
    except urllib.error.HTTPError as exc:
        log.update({"status_code": exc.code, "error": f"HTTPError: {exc.code} {exc.reason}"})
    except urllib.error.URLError as exc:
        log["error"] = f"URLError: {exc.reason}"
    except TimeoutError as exc:
        log["error"] = f"TimeoutError: {exc}"
    except OSError as exc:
        log["error"] = f"OSError: {exc}"
    return {"log": log, "text": ""}


def fetch_json(url: str, prefix: str, timeout: int = 18) -> dict[str, Any]:
    path = cache_path(prefix, url, "json")
    log = {
        "url": url,
        "cache_path": str(path.relative_to(ROOT)),
        "from_cache": path.exists(),
        "ok": False,
        "status_code": None,
        "error": None,
        "retrieved_at": utc_now(),
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


def title_from_html(text: str) -> str:
    match = re.search(r"<title[^>]*>(.*?)</title>", text, re.IGNORECASE | re.DOTALL)
    if not match:
        return ""
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", "", match.group(1)))).strip()


def normalize_points(points: list[dict[str, Any]]) -> list[dict[str, Any]]:
    normalized = []
    for point in points:
        year = int(point["year"])
        value = float(point.get("frequency_per_million", point.get("value", 0.0)))
        normalized.append({"year": year, "value": value, "frequency_per_million": value})
    return normalized


def points_from_existing_series(series: dict[str, Any]) -> list[dict[str, Any]]:
    return normalize_points(series.get("points", series.get("series", series.get("raw_series", []))))


def existing_frequency_index() -> dict[str, dict[str, Any]]:
    index: dict[str, dict[str, Any]] = {}

    for path, key, source in [
        (PROCESSED_DIR / "hub_frequency_series.json", "series", "first_pass_frequency"),
        (PROCESSED_DIR / "hub_phrase_series.json", "phrases", "first_pass_phrase_series"),
    ]:
        data = load_json(path, {key: []})
        for row in data.get(key, []):
            term = str(row.get("term", row.get("phrase", ""))).lower()
            points = points_from_existing_series(row)
            if term and points:
                index[term] = {"points": points, "source": source, "path": str(path.relative_to(ROOT))}

    chart01 = load_json(RAW_DIR / "hub_chart01_frequency_raw.json", {"query_results": []})
    for row in chart01.get("query_results", []):
        term = str(row.get("query", "")).lower()
        points = normalize_points(row.get("raw_series", []))
        if term and points:
            index[term] = {
                "points": points,
                "source": "chart01_frequency_raw",
                "path": str((RAW_DIR / "hub_chart01_frequency_raw.json").relative_to(ROOT)),
            }

    chart02 = load_json(PROCESSED_DIR / "hub_chart02_recovered_frequency_series.json", {"recovered_frequency_items": []})
    for row in chart02.get("recovered_frequency_items", []):
        term = str(row.get("query", "")).lower()
        points = normalize_points(row.get("series", []))
        if term and points:
            index[term] = {
                "points": points,
                "source": "chart02_recovered_frequency_series",
                "path": str((PROCESSED_DIR / "hub_chart02_recovered_frequency_series.json").relative_to(ROOT)),
            }
    return index


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


def normalize_ngram_rows(rows: list[dict[str, Any]]) -> dict[str, list[dict[str, Any]]]:
    by_query: dict[str, list[dict[str, Any]]] = {}
    for row in rows:
        ngram = row.get("ngram", "")
        if CASE_INSENSITIVE and not ngram.endswith(" (All)"):
            continue
        query = ngram.removesuffix(" (All)")
        by_query[query.lower()] = [
            {
                "year": START_YEAR + offset,
                "value": float(value) * 1_000_000,
                "frequency_per_million": round(float(value) * 1_000_000, 8),
            }
            for offset, value in enumerate(row.get("timeseries", []))
        ]
    return by_query


def stats_for_points(points: list[dict[str, Any]]) -> dict[str, Any]:
    nonzero = [point for point in points if float(point.get("frequency_per_million", 0.0)) > 0]
    if not points:
        return {
            "first_nonzero_year": None,
            "last_nonzero_year": None,
            "peak_year": None,
            "peak_frequency_per_million": 0.0,
            "nonzero_year_count": 0,
        }
    peak = max(points, key=lambda point: float(point.get("frequency_per_million", 0.0)))
    return {
        "first_nonzero_year": nonzero[0]["year"] if nonzero else None,
        "last_nonzero_year": nonzero[-1]["year"] if nonzero else None,
        "peak_year": peak["year"],
        "peak_frequency_per_million": round(float(peak.get("frequency_per_million", 0.0)), 8),
        "nonzero_year_count": len(nonzero),
    }


def collect_frequency() -> tuple[dict[str, Any], list[dict[str, Any]]]:
    specs = frequency_specs()
    existing = existing_frequency_index()
    raw_records: list[dict[str, Any]] = []
    logs: list[dict[str, Any]] = []
    missing: list[dict[str, Any]] = []

    for spec in specs:
        cached = existing.get(spec["query"].lower())
        if cached:
            points = cached["points"]
            raw_records.append(
                {
                    **spec,
                    "source": cached["path"],
                    "source_type": "existing_cache",
                    "start_year": START_YEAR,
                    "end_year": END_YEAR,
                    "raw_series": points,
                    "retrieved_at": utc_now(),
                    "status": "reused_existing",
                    "failure_reason": "",
                    "stats": stats_for_points(points),
                    "notes": f"Reused from {cached['source']}.",
                }
            )
            logs.append({"query": spec["query"], "action": "reused_existing_cache", "status": "success", "source": cached["path"]})
        else:
            missing.append(spec)

    fetched: dict[str, list[dict[str, Any]]] = {}
    for start in range(0, len(missing), BATCH_SIZE):
        batch_specs = missing[start : start + BATCH_SIZE]
        batch = [item["query"] for item in batch_specs]
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
            fetched.update(by_query)
            log["returned_queries"] = sorted(by_query.keys())
        logs.append(log)
        time.sleep(REQUEST_DELAY_SECONDS)

    for spec in missing:
        points = fetched.get(spec["query"].lower(), [])
        status = "success" if points else ("skipped" if CACHE_ONLY else "failed")
        raw_records.append(
            {
                **spec,
                "source": "Google Books Ngram Viewer",
                "source_type": "ngram",
                "start_year": START_YEAR,
                "end_year": END_YEAR,
                "raw_series": points,
                "retrieved_at": utc_now(),
                "status": status,
                "failure_reason": "" if points else "No returned Ngram aggregate row for query or request failed.",
                "stats": stats_for_points(points),
                "notes": "Targeted Chart 03 Ngram gap query; printed-book proxy only.",
            }
        )

    return (
        {
            "metadata": {
                "word": "hub",
                "chart_id": "chart_03",
                "purpose": "naming-pattern frequency layer",
                "generated_at": utc_now(),
                "generated_by_script": "scripts/scrape_hub_chart03_naming.py",
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
                    "Ngram is printed-book frequency, not naming proof.",
                    "Brand/platform names are not treated as ordinary phrase frequency.",
                    "Modern web-native naming may be underrepresented in Ngram.",
                ],
            },
            "naming_taxonomy": NAMING_TAXONOMY,
            "query_results": sorted(raw_records, key=lambda item: item["query_id"]),
        },
        logs,
    )


def parse_duckduckgo_results(text: str) -> list[dict[str, str]]:
    results = []
    for match in re.finditer(r'<a[^>]+class="result__a"[^>]+href="([^"]+)"[^>]*>(.*?)</a>', text, re.I | re.S):
        href = html.unescape(match.group(1))
        title = re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", "", match.group(2)))).strip()
        parsed = urllib.parse.urlparse(href)
        query = urllib.parse.parse_qs(parsed.query)
        if "uddg" in query:
            href = query["uddg"][0]
        domain = urllib.parse.urlparse(href).netloc.replace("www.", "")
        results.append({"title": title, "url": href, "domain": domain})
        if len(results) >= 5:
            break
    return results


def search_web(query: str) -> dict[str, Any]:
    url = f"{DUCKDUCKGO_ENDPOINT}?{urllib.parse.urlencode({'q': query})}"
    response = fetch_text(url, f"ddg_{slug(query)}", timeout=16)
    results = parse_duckduckgo_results(response["text"]) if response["log"]["ok"] else []
    return {"log": response["log"], "results": results, "url": url}


def collect_search_visibility() -> tuple[dict[str, Any], list[dict[str, Any]]]:
    seed_lookup: dict[str, list[dict[str, Any]]] = {}
    for example in INSTITUTIONAL_EXAMPLE_SEEDS:
        seed_lookup.setdefault(example["term"].lower(), []).append(
            {
                "title": example["source_title"],
                "url": example["source_url"],
                "domain": urllib.parse.urlparse(example["source_url"]).netloc.replace("www.", ""),
                "source_kind": "institutional_example",
                "notes": example["context_summary"],
            }
        )
    for example in PLATFORM_EXAMPLE_SEEDS:
        seed_lookup.setdefault(example["query"].lower(), []).append(
            {
                "title": example["source_title"],
                "url": example["source_url"],
                "domain": example["domain"],
                "source_kind": "platform_example",
                "notes": example["notes"],
            }
        )

    important_queries = [
        "student hub",
        "learning hub",
        "resource hub",
        "equipment hub",
        "media hub",
        "service hub",
        "wellbeing hub",
        "career hub",
        "maker hub",
        "content hub",
        "data hub",
        "API hub",
        "developer hub",
        "GitHub",
        "Pornhub",
        "Sci-Hub",
        "HubSpot",
        "Docker Hub",
        "Hugging Face Hub",
    ]

    records = []
    logs = []
    spec_lookup = {item["query"].lower(): item for item in frequency_specs()}
    brand_lookup = {item["name"].lower(): item for item in BRAND_PLATFORM_SEEDS}

    for query in important_queries:
        spec = spec_lookup.get(query.lower())
        brand = brand_lookup.get(query.lower())
        seeds = seed_lookup.get(query.lower(), [])
        search = search_web(f'"{query}"')
        logs.append({"query": query, "search_url": search["url"], **search["log"], "result_count_seen": len(search["results"])})
        combined = seeds + [{"source_kind": "web_search", **item} for item in search["results"]]
        # Preserve order while de-duplicating URLs.
        seen_urls = set()
        examples = []
        for item in combined:
            if item["url"] in seen_urls:
                continue
            seen_urls.add(item["url"])
            examples.append(item)
            if len(examples) >= 5:
                break
        visibility = "failed"
        if examples:
            visibility = "strong_presence" if len(examples) >= 3 else "visible"
        elif search["log"]["ok"]:
            visibility = "sparse"

        records.append(
            {
                "query": query,
                "naming_pattern": spec["naming_pattern"] if spec else "closed_compound_or_brand",
                "object_type": spec["object_type"] if spec else brand.get("object_type", "platform") if brand else "other",
                "source": "web_search + curated_public_examples" if examples else "web_search",
                "search_query": f'"{query}"',
                "approx_result_count": None,
                "top_result_domains": [item["domain"] for item in examples],
                "example_urls": [item["url"] for item in examples],
                "example_titles": [item["title"] for item in examples],
                "visibility_status": visibility,
                "evidence_quality": "high" if seeds else ("medium" if examples else "low"),
                "notes": "Search visibility is approximate presence evidence, not corpus frequency.",
            }
        )
        time.sleep(REQUEST_DELAY_SECONDS)

    return (
        {
            "metadata": {
                "word": "hub",
                "chart_id": "chart_03",
                "generated_at": utc_now(),
                "generated_by_script": "scripts/scrape_hub_chart03_naming.py",
                "purpose": "search visibility and public web presence for naming patterns",
                "limitations": [
                    "Search-result counts are not collected as exact frequency.",
                    "Public web examples show presence and naming function, not population-wide usage.",
                    "Search may be unavailable under restricted network conditions.",
                ],
            },
            "records": records,
        },
        logs,
    )


def verify_sources(items: list[dict[str, Any]], url_key: str, prefix: str) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    verified = []
    logs = []
    for item in items:
        url = item[url_key]
        cache_label = slug(item.get("name", item.get("term", item.get("source_title", "source"))))
        response = fetch_text(url, f"{prefix}_{cache_label}")
        title = title_from_html(response["text"]) if response["log"]["ok"] else ""
        verified_item = {
            **item,
            "source_status": "success" if response["log"]["ok"] else ("skipped" if CACHE_ONLY else "failed"),
            "source_failure_reason": response["log"].get("error") or "",
            "page_title_observed": title,
            "checked_at": utc_now(),
        }
        verified.append(verified_item)
        logs.append({"source_title": item.get("source_title", item.get("name", "")), **response["log"]})
        time.sleep(REQUEST_DELAY_SECONDS)
    return verified, logs


def main() -> None:
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    CACHE_DIR.mkdir(parents=True, exist_ok=True)

    frequency_raw, frequency_logs = collect_frequency()
    search_raw, search_logs = collect_search_visibility()
    brand_raw_items, brand_logs = verify_sources(BRAND_PLATFORM_SEEDS, "official_or_reference_url", "brand_source")
    institutional_raw_items, institutional_logs = verify_sources(INSTITUTIONAL_EXAMPLE_SEEDS, "source_url", "institutional_source")

    brand_raw = {
        "metadata": {
            "word": "hub",
            "chart_id": "chart_03",
            "generated_at": utc_now(),
            "generated_by_script": "scripts/scrape_hub_chart03_naming.py",
            "purpose": "brand/platform inventory source layer",
            "limitations": [
                "Brand examples are naming-pattern evidence, not ordinary lexical frequency.",
                "Adult-brand examples are recorded neutrally and should be optional in public presentation.",
                "Approximate launch years are labelled when exact public source verification is incomplete.",
            ],
        },
        "brands": brand_raw_items,
    }
    institutional_raw = {
        "metadata": {
            "word": "hub",
            "chart_id": "chart_03",
            "generated_at": utc_now(),
            "generated_by_script": "scripts/scrape_hub_chart03_naming.py",
            "purpose": "public institutional/campus/service examples of hub naming",
            "limitations": [
                "Examples are public-source presence evidence, not a complete census.",
                "The user's personal school equipment-room example is not treated as public evidence.",
            ],
        },
        "examples": institutional_raw_items,
    }

    query_log = {
        "metadata": {
            "word": "hub",
            "chart_id": "chart_03",
            "generated_at": utc_now(),
            "generated_by_script": "scripts/scrape_hub_chart03_naming.py",
            "cache_only": CACHE_ONLY,
        },
        "frequency_query_count": len(frequency_raw["query_results"]),
        "frequency_status_counts": dict(Counter(item["status"] for item in frequency_raw["query_results"])),
        "search_visibility_count": len(search_raw["records"]),
        "search_visibility_status_counts": dict(Counter(item["visibility_status"] for item in search_raw["records"])),
        "brand_source_status_counts": dict(Counter(item["source_status"] for item in brand_raw_items)),
        "institutional_source_status_counts": dict(Counter(item["source_status"] for item in institutional_raw_items)),
        "frequency_logs": frequency_logs,
        "search_logs": search_logs,
        "brand_logs": brand_logs,
        "institutional_logs": institutional_logs,
    }

    write_json(RAW_DIR / "hub_chart03_naming_frequency_raw.json", frequency_raw)
    write_json(RAW_DIR / "hub_chart03_search_visibility_raw.json", search_raw)
    write_json(RAW_DIR / "hub_chart03_platform_brand_sources_raw.json", brand_raw)
    write_json(RAW_DIR / "hub_chart03_institutional_examples_raw.json", institutional_raw)
    write_json(RAW_DIR / "hub_chart03_query_log.json", query_log)

    frequency_counts = Counter(item["status"] for item in frequency_raw["query_results"])
    print("Hub Chart 03 naming scrape summary")
    print(f"- Frequency queries attempted: {len(frequency_raw['query_results'])}")
    print(
        f"- Successful / reused / failed / skipped frequency queries: "
        f"{frequency_counts.get('success', 0)} / {frequency_counts.get('reused_existing', 0)} / "
        f"{frequency_counts.get('failed', 0)} / {frequency_counts.get('skipped', 0)}"
    )
    print(f"- Search visibility items collected: {len(search_raw['records'])}")
    print(f"- Brand/platform source items: {len(brand_raw_items)}")
    print(f"- Institutional example source items: {len(institutional_raw_items)}")
    print(
        "- Output paths: "
        f"{RAW_DIR / 'hub_chart03_naming_frequency_raw.json'}, "
        f"{RAW_DIR / 'hub_chart03_search_visibility_raw.json'}, "
        f"{RAW_DIR / 'hub_chart03_platform_brand_sources_raw.json'}, "
        f"{RAW_DIR / 'hub_chart03_institutional_examples_raw.json'}, "
        f"{RAW_DIR / 'hub_chart03_query_log.json'}"
    )


if __name__ == "__main__":
    main()
