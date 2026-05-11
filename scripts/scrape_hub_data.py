#!/usr/bin/env python3
"""Collect raw research data for the Words Over Time page seed: hub.

This is intentionally a data-preparation script only. It writes raw source
captures and source-derived candidates under docs/research/hub/raw.
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
CACHE_DIR = RAW_DIR / "cache"
PROCESSED_DIR = RESEARCH_DIR / "processed"
REPORTS_DIR = RESEARCH_DIR / "reports"

START_YEAR = 1800
END_YEAR = 2022
CORPUS = "en"
CORPUS_LABEL = "English"
SMOOTHING = 0
CASE_INSENSITIVE = True
BATCH_SIZE = 8
REQUEST_DELAY_SECONDS = 0.35
USER_AGENT = "WordsOverTime/0.1 hub data pass; contact: local research script"
NGRAM_ENDPOINT = "https://books.google.com/ngrams/json"
CACHE_ONLY = "--cache-only" in sys.argv


SEMANTIC_CATEGORIES = {
    "mechanical_core": {
        "label": "Mechanical Core",
        "summary": "Hub as the central part of a wheel or rotating structure.",
    },
    "central_place": {
        "label": "Central Place",
        "summary": "Hub as a center of activity, trade, life, or urban concentration.",
    },
    "transport_logistics": {
        "label": "Transport & Logistics",
        "summary": "Hub as a node for movement, routing, distribution, and connection.",
    },
    "network_system": {
        "label": "Network System",
        "summary": "Hub as a central node in communication, computing, and network architecture.",
    },
    "institutional_cluster": {
        "label": "Institutional Cluster",
        "summary": "Hub as a concentration of business, education, research, finance, culture, or innovation.",
    },
    "digital_platform": {
        "label": "Digital Platform",
        "summary": "Hub as a digital access point, content center, resource center, or data platform.",
    },
}


FREQUENCY_TERMS: list[dict[str, str]] = [
    {"term": "hub", "category": "central_place", "query_group": "core"},
    {"term": "hubs", "category": "central_place", "query_group": "core"},
    {"term": "wheel hub", "category": "mechanical_core", "query_group": "mechanical"},
    {"term": "wheel hubs", "category": "mechanical_core", "query_group": "mechanical"},
    {"term": "hub of the wheel", "category": "mechanical_core", "query_group": "mechanical"},
    {"term": "hub cap", "category": "mechanical_core", "query_group": "mechanical"},
    {"term": "hubcap", "category": "mechanical_core", "query_group": "mechanical"},
    {"term": "front hub", "category": "mechanical_core", "query_group": "mechanical"},
    {"term": "rear hub", "category": "mechanical_core", "query_group": "mechanical"},
    {"term": "axle hub", "category": "mechanical_core", "query_group": "mechanical"},
    {"term": "hub of activity", "category": "central_place", "query_group": "metaphor"},
    {"term": "hub of life", "category": "central_place", "query_group": "metaphor"},
    {"term": "hub of commerce", "category": "central_place", "query_group": "metaphor"},
    {"term": "hub of trade", "category": "central_place", "query_group": "metaphor"},
    {"term": "hub of industry", "category": "central_place", "query_group": "metaphor"},
    {"term": "hub of the city", "category": "central_place", "query_group": "metaphor"},
    {"term": "hub of the community", "category": "central_place", "query_group": "metaphor"},
    {"term": "railway hub", "category": "transport_logistics", "query_group": "transport"},
    {"term": "railroad hub", "category": "transport_logistics", "query_group": "transport"},
    {"term": "transport hub", "category": "transport_logistics", "query_group": "transport"},
    {"term": "transportation hub", "category": "transport_logistics", "query_group": "transport"},
    {"term": "transit hub", "category": "transport_logistics", "query_group": "transport"},
    {"term": "shipping hub", "category": "transport_logistics", "query_group": "transport"},
    {"term": "logistics hub", "category": "transport_logistics", "query_group": "transport"},
    {"term": "airport hub", "category": "transport_logistics", "query_group": "transport"},
    {"term": "airline hub", "category": "transport_logistics", "query_group": "transport"},
    {"term": "regional hub", "category": "transport_logistics", "query_group": "transport"},
    {"term": "global hub", "category": "transport_logistics", "query_group": "transport"},
    {"term": "communication hub", "category": "network_system", "query_group": "network"},
    {"term": "communications hub", "category": "network_system", "query_group": "network"},
    {"term": "network hub", "category": "network_system", "query_group": "network"},
    {"term": "hub node", "category": "network_system", "query_group": "network"},
    {"term": "central hub", "category": "network_system", "query_group": "network"},
    {"term": "server hub", "category": "network_system", "query_group": "network"},
    {"term": "internet hub", "category": "network_system", "query_group": "network"},
    {"term": "telecom hub", "category": "network_system", "query_group": "network"},
    {"term": "ethernet hub", "category": "network_system", "query_group": "network"},
    {"term": "hub and spoke", "category": "network_system", "query_group": "system_architecture"},
    {"term": "hub-and-spoke", "category": "network_system", "query_group": "system_architecture"},
    {"term": "hub model", "category": "network_system", "query_group": "system_architecture"},
    {"term": "hub system", "category": "network_system", "query_group": "system_architecture"},
    {"term": "hub network", "category": "network_system", "query_group": "system_architecture"},
    {"term": "business hub", "category": "institutional_cluster", "query_group": "institutional"},
    {"term": "financial hub", "category": "institutional_cluster", "query_group": "institutional"},
    {"term": "education hub", "category": "institutional_cluster", "query_group": "institutional"},
    {"term": "research hub", "category": "institutional_cluster", "query_group": "institutional"},
    {"term": "knowledge hub", "category": "institutional_cluster", "query_group": "institutional"},
    {"term": "innovation hub", "category": "institutional_cluster", "query_group": "institutional"},
    {"term": "creative hub", "category": "institutional_cluster", "query_group": "institutional"},
    {"term": "cultural hub", "category": "institutional_cluster", "query_group": "institutional"},
    {"term": "startup hub", "category": "institutional_cluster", "query_group": "institutional"},
    {"term": "technology hub", "category": "institutional_cluster", "query_group": "institutional"},
    {"term": "digital hub", "category": "digital_platform", "query_group": "digital"},
    {"term": "content hub", "category": "digital_platform", "query_group": "digital"},
    {"term": "data hub", "category": "digital_platform", "query_group": "digital"},
    {"term": "datahub", "category": "digital_platform", "query_group": "digital"},
    {"term": "media hub", "category": "digital_platform", "query_group": "digital"},
    {"term": "resource hub", "category": "digital_platform", "query_group": "digital"},
    {"term": "learning hub", "category": "digital_platform", "query_group": "digital"},
    {"term": "community hub", "category": "digital_platform", "query_group": "digital"},
    {"term": "platform hub", "category": "digital_platform", "query_group": "digital"},
]


REFERENCE_SOURCES: list[dict[str, Any]] = [
    {
        "id": "etymonline_hub",
        "source_name": "Online Etymology Dictionary",
        "url": "https://www.etymonline.com/word/hub",
        "entry_term": "hub",
        "source_type": "secondary_etymology",
        "reliability_level": "medium",
        "used_for": ["etymology", "dated sense notes", "compound notes"],
        "paraphrased_notes": [
            "Records the wheel-center sense as foundational and later generalizes hub to a center of activity.",
            "Useful for the Boston 'Hub' cultural nickname and hubcap compound notes; verify exact dates before final copy.",
        ],
        "sense_categories": ["mechanical_core", "central_place", "mechanical_core"],
    },
    {
        "id": "wiktionary_hub",
        "source_name": "Wiktionary",
        "url": "https://en.wiktionary.org/wiki/hub",
        "entry_term": "hub",
        "source_type": "dictionary",
        "reliability_level": "medium",
        "used_for": ["sense inventory", "derived terms", "quotations orientation"],
        "paraphrased_notes": [
            "Separates wheel-center, distribution-point, activity-center, and network-device senses.",
            "Useful for derivative forms and compounds such as hub-and-spoke, hubbed, hubbing, hubcap, and datahub.",
        ],
        "sense_categories": ["mechanical_core", "central_place", "transport_logistics", "network_system"],
    },
    {
        "id": "merriam_webster_hub",
        "source_name": "Merriam-Webster",
        "url": "https://www.merriam-webster.com/dictionary/hub",
        "entry_term": "hub",
        "source_type": "dictionary",
        "reliability_level": "high",
        "used_for": ["modern sense inventory", "first-known-use check"],
        "paraphrased_notes": [
            "Modern entry covers circular-object center, focal point, airline routing center, and network device senses.",
            "Good modern source, but dictionary attestation is not a frequency signal.",
        ],
        "sense_categories": ["mechanical_core", "central_place", "transport_logistics", "network_system"],
    },
    {
        "id": "cambridge_hub",
        "source_name": "Cambridge Dictionary",
        "url": "https://dictionary.cambridge.org/dictionary/english/hub",
        "entry_term": "hub",
        "source_type": "dictionary",
        "reliability_level": "high",
        "used_for": ["modern learner definitions", "transport and IT sense contrast"],
        "paraphrased_notes": [
            "Modern entry emphasizes a central or main part where activity is concentrated, plus wheel and computer-network uses.",
        ],
        "sense_categories": ["mechanical_core", "central_place", "transport_logistics", "network_system"],
    },
    {
        "id": "collins_hub",
        "source_name": "Collins Dictionary",
        "url": "https://www.collinsdictionary.com/dictionary/english/hub",
        "entry_term": "hub",
        "source_type": "dictionary",
        "reliability_level": "high",
        "used_for": ["modern dictionary sense comparison"],
        "paraphrased_notes": [
            "Modern entry includes wheel center, activity center, network connector, transport interchange, and skills cluster senses.",
        ],
        "sense_categories": [
            "mechanical_core",
            "central_place",
            "transport_logistics",
            "network_system",
            "institutional_cluster",
        ],
    },
    {
        "id": "websters_1913_hub",
        "source_name": "Webster's Revised Unabridged Dictionary 1913",
        "url": "https://www.websters1913.com/words/Hub",
        "entry_term": "hub",
        "source_type": "public_domain_dictionary",
        "reliability_level": "medium",
        "used_for": ["public-domain historical dictionary check"],
        "paraphrased_notes": [
            "Useful as a public-domain historical check for wheel-center and center/focus senses if accessible.",
        ],
        "sense_categories": ["mechanical_core", "central_place"],
    },
    {
        "id": "wikipedia_airline_hub",
        "source_name": "Wikipedia",
        "url": "https://en.wikipedia.org/wiki/Airline_hub",
        "entry_term": "airline hub",
        "source_type": "reference",
        "reliability_level": "low",
        "used_for": ["orientation only", "transport terminology"],
        "paraphrased_notes": [
            "Orientation source for airline hub terminology and hub-and-spoke airline operations; not final evidence by itself.",
        ],
        "sense_categories": ["transport_logistics", "network_system"],
    },
    {
        "id": "wikipedia_ethernet_hub",
        "source_name": "Wikipedia",
        "url": "https://en.wikipedia.org/wiki/Ethernet_hub",
        "entry_term": "ethernet hub",
        "source_type": "reference",
        "reliability_level": "low",
        "used_for": ["orientation only", "network-device terminology"],
        "paraphrased_notes": [
            "Orientation source for the hardware network-hub sense; replace with technical documentation for final claims.",
        ],
        "sense_categories": ["network_system"],
    },
]


REFERENCE_SNIPPET_SEEDS: list[dict[str, Any]] = [
    {
        "term_or_phrase": "hub",
        "year": 1640,
        "source_title": "Online Etymology Dictionary: hub",
        "source_url": "https://www.etymonline.com/word/hub",
        "source_type": "reference",
        "text_snippet": "Reference note dates the wheel-center sense to the 1640s.",
        "semantic_category": "mechanical_core",
        "confidence": "medium",
        "notes": "Paraphrased lexical note; verify against primary quotations before final copy.",
    },
    {
        "term_or_phrase": "the Hub",
        "year": 1858,
        "source_title": "Online Etymology Dictionary: hub",
        "source_url": "https://www.etymonline.com/word/hub",
        "source_type": "reference",
        "text_snippet": 'Holmes called Boston "the hub of the solar system."',
        "semantic_category": "central_place",
        "confidence": "medium",
        "notes": "Short quotation surfaced through a secondary etymology source; verify before final copy.",
    },
    {
        "term_or_phrase": "hubcap",
        "year": 1896,
        "source_title": "Online Etymology Dictionary: hubcap",
        "source_url": "https://www.etymonline.com/word/hubcap",
        "source_type": "reference",
        "text_snippet": "Reference note dates hubcap as a compound from hub plus cap.",
        "semantic_category": "mechanical_core",
        "confidence": "medium",
        "notes": "Paraphrased compound note.",
    },
    {
        "term_or_phrase": "hub",
        "year": None,
        "source_title": "Wiktionary: hub",
        "source_url": "https://en.wiktionary.org/wiki/hub",
        "source_type": "dictionary",
        "text_snippet": "Sense inventory includes wheel center, distribution point, activity center, and network device.",
        "semantic_category": "central_place",
        "confidence": "medium",
        "notes": "Paraphrased modern sense inventory.",
    },
    {
        "term_or_phrase": "hub-and-spoke",
        "year": None,
        "source_title": "Wiktionary: hub",
        "source_url": "https://en.wiktionary.org/wiki/hub",
        "source_type": "dictionary",
        "text_snippet": "Derived-term inventory includes hub-and-spoke, hubbed, hubbing, hubcap, and datahub.",
        "semantic_category": "network_system",
        "confidence": "medium",
        "notes": "Paraphrased derived-term inventory.",
    },
    {
        "term_or_phrase": "airline hub",
        "year": None,
        "source_title": "Merriam-Webster: hub",
        "source_url": "https://www.merriam-webster.com/dictionary/hub",
        "source_type": "dictionary",
        "text_snippet": "Modern dictionary sense covers a city through which airline traffic is routed.",
        "semantic_category": "transport_logistics",
        "confidence": "high",
        "notes": "Paraphrased modern dictionary sense.",
    },
    {
        "term_or_phrase": "network hub",
        "year": None,
        "source_title": "Merriam-Webster: hub",
        "source_url": "https://www.merriam-webster.com/dictionary/hub",
        "source_type": "dictionary",
        "text_snippet": "Modern dictionary sense covers a computer-network connection device.",
        "semantic_category": "network_system",
        "confidence": "high",
        "notes": "Paraphrased modern dictionary sense.",
    },
    {
        "term_or_phrase": "hub",
        "year": None,
        "source_title": "Cambridge Dictionary: hub",
        "source_url": "https://dictionary.cambridge.org/dictionary/english/hub",
        "source_type": "dictionary",
        "text_snippet": "Modern learner entry emphasizes the central or main part where activity is concentrated.",
        "semantic_category": "central_place",
        "confidence": "high",
        "notes": "Paraphrased modern dictionary sense.",
    },
    {
        "term_or_phrase": "transport hub",
        "year": None,
        "source_title": "Collins Dictionary: hub",
        "source_url": "https://www.collinsdictionary.com/dictionary/english/hub",
        "source_type": "dictionary",
        "text_snippet": "Modern dictionary sense includes a transport interchange and activity center.",
        "semantic_category": "transport_logistics",
        "confidence": "high",
        "notes": "Paraphrased modern dictionary sense.",
    },
]


CHRONICLING_QUERIES: list[dict[str, Any]] = [
    {"term": "wheel hub", "category": "mechanical_core", "date1": 1850, "date2": 1925, "max_items": 2},
    {"term": "hub of the wheel", "category": "mechanical_core", "date1": 1850, "date2": 1925, "max_items": 2},
    {"term": "hub cap", "category": "mechanical_core", "date1": 1890, "date2": 1930, "max_items": 2},
    {"term": "hub of activity", "category": "central_place", "date1": 1850, "date2": 1963, "max_items": 2},
    {"term": "hub of commerce", "category": "central_place", "date1": 1850, "date2": 1963, "max_items": 2},
    {"term": "hub of trade", "category": "central_place", "date1": 1850, "date2": 1963, "max_items": 2},
    {"term": "hub of industry", "category": "central_place", "date1": 1850, "date2": 1963, "max_items": 2},
    {"term": "hub of the city", "category": "central_place", "date1": 1850, "date2": 1963, "max_items": 2},
    {"term": "hub of the community", "category": "central_place", "date1": 1850, "date2": 1963, "max_items": 2},
    {"term": "railroad hub", "category": "transport_logistics", "date1": 1850, "date2": 1963, "max_items": 2},
    {"term": "railway hub", "category": "transport_logistics", "date1": 1850, "date2": 1963, "max_items": 2},
    {"term": "transportation hub", "category": "transport_logistics", "date1": 1900, "date2": 1963, "max_items": 2},
    {"term": "shipping hub", "category": "transport_logistics", "date1": 1850, "date2": 1963, "max_items": 2},
    {"term": "airport hub", "category": "transport_logistics", "date1": 1920, "date2": 1963, "max_items": 2},
    {"term": "airline hub", "category": "transport_logistics", "date1": 1930, "date2": 1963, "max_items": 2},
    {"term": "regional hub", "category": "transport_logistics", "date1": 1900, "date2": 1963, "max_items": 2},
    {"term": "business hub", "category": "institutional_cluster", "date1": 1900, "date2": 1963, "max_items": 2},
    {"term": "financial hub", "category": "institutional_cluster", "date1": 1900, "date2": 1963, "max_items": 2},
    {"term": "education hub", "category": "institutional_cluster", "date1": 1900, "date2": 1963, "max_items": 2},
    {"term": "cultural hub", "category": "institutional_cluster", "date1": 1900, "date2": 1963, "max_items": 2},
    {"term": "communication hub", "category": "network_system", "date1": 1900, "date2": 1963, "max_items": 2},
    {"term": "hub and spoke", "category": "network_system", "date1": 1850, "date2": 1963, "max_items": 2},
]


LOC_CHRONICLING_QUERIES: list[dict[str, Any]] = [
    {"term": "wheel hub", "category": "mechanical_core", "max_items": 1},
    {"term": "hub of the wheel", "category": "mechanical_core", "max_items": 1},
    {"term": "hub cap", "category": "mechanical_core", "max_items": 1},
    {"term": "front hub", "category": "mechanical_core", "max_items": 1},
    {"term": "rear hub", "category": "mechanical_core", "max_items": 1},
    {"term": "hub of activity", "category": "central_place", "max_items": 1},
    {"term": "hub of commerce", "category": "central_place", "max_items": 1},
    {"term": "hub of trade", "category": "central_place", "max_items": 1},
    {"term": "hub of industry", "category": "central_place", "max_items": 1},
    {"term": "hub of the city", "category": "central_place", "max_items": 1},
    {"term": "hub of the community", "category": "central_place", "max_items": 1},
    {"term": "railroad hub", "category": "transport_logistics", "max_items": 1},
    {"term": "railway hub", "category": "transport_logistics", "max_items": 1},
    {"term": "transportation hub", "category": "transport_logistics", "max_items": 1},
    {"term": "shipping hub", "category": "transport_logistics", "max_items": 1},
    {"term": "airport hub", "category": "transport_logistics", "max_items": 1},
    {"term": "airline hub", "category": "transport_logistics", "max_items": 1},
    {"term": "regional hub", "category": "transport_logistics", "max_items": 1},
    {"term": "business hub", "category": "institutional_cluster", "max_items": 1},
    {"term": "financial hub", "category": "institutional_cluster", "max_items": 1},
    {"term": "education hub", "category": "institutional_cluster", "max_items": 1},
    {"term": "cultural hub", "category": "institutional_cluster", "max_items": 1},
    {"term": "communication hub", "category": "network_system", "max_items": 1},
    {"term": "hub and spoke", "category": "network_system", "max_items": 1},
]

LOC_CHRONICLING_KEEP = {
    "wheel hub",
    "hub cap",
    "front hub",
    "rear hub",
    "hub of activity",
    "hub of commerce",
    "railroad hub",
    "railway hub",
    "transportation hub",
    "shipping hub",
    "airport hub",
    "business hub",
    "financial hub",
    "communication hub",
    "hub and spoke",
}
LOC_CHRONICLING_QUERIES = [query for query in LOC_CHRONICLING_QUERIES if query["term"] in LOC_CHRONICLING_KEEP]


INTERNET_ARCHIVE_QUERIES: list[dict[str, Any]] = [
    {"term": "wheel hub", "category": "mechanical_core", "date1": 1800, "date2": 1928, "max_items": 2},
    {"term": "hub of the wheel", "category": "mechanical_core", "date1": 1800, "date2": 1928, "max_items": 2},
    {"term": "hub cap", "category": "mechanical_core", "date1": 1890, "date2": 1928, "max_items": 2},
    {"term": "front hub", "category": "mechanical_core", "date1": 1880, "date2": 1928, "max_items": 1},
    {"term": "rear hub", "category": "mechanical_core", "date1": 1880, "date2": 1928, "max_items": 1},
    {"term": "hub of activity", "category": "central_place", "date1": 1850, "date2": 1928, "max_items": 2},
    {"term": "hub of commerce", "category": "central_place", "date1": 1850, "date2": 1928, "max_items": 2},
    {"term": "hub of trade", "category": "central_place", "date1": 1850, "date2": 1928, "max_items": 2},
    {"term": "hub of industry", "category": "central_place", "date1": 1850, "date2": 1928, "max_items": 2},
    {"term": "hub of the city", "category": "central_place", "date1": 1850, "date2": 1928, "max_items": 1},
    {"term": "hub of the community", "category": "central_place", "date1": 1850, "date2": 1928, "max_items": 1},
    {"term": "railroad hub", "category": "transport_logistics", "date1": 1860, "date2": 1928, "max_items": 2},
    {"term": "railway hub", "category": "transport_logistics", "date1": 1860, "date2": 1928, "max_items": 2},
    {"term": "transportation hub", "category": "transport_logistics", "date1": 1900, "date2": 1928, "max_items": 2},
    {"term": "shipping hub", "category": "transport_logistics", "date1": 1850, "date2": 1928, "max_items": 2},
    {"term": "airport hub", "category": "transport_logistics", "date1": 1910, "date2": 1928, "max_items": 1},
    {"term": "regional hub", "category": "transport_logistics", "date1": 1900, "date2": 1928, "max_items": 1},
    {"term": "business hub", "category": "institutional_cluster", "date1": 1880, "date2": 1928, "max_items": 2},
    {"term": "financial hub", "category": "institutional_cluster", "date1": 1880, "date2": 1928, "max_items": 2},
    {"term": "education hub", "category": "institutional_cluster", "date1": 1880, "date2": 1928, "max_items": 1},
    {"term": "research hub", "category": "institutional_cluster", "date1": 1900, "date2": 1928, "max_items": 1},
    {"term": "cultural hub", "category": "institutional_cluster", "date1": 1880, "date2": 1928, "max_items": 1},
    {"term": "communication hub", "category": "network_system", "date1": 1900, "date2": 1928, "max_items": 1},
    {"term": "hub and spoke", "category": "network_system", "date1": 1850, "date2": 1928, "max_items": 2},
]


GOOGLE_BOOKS_QUERIES: list[dict[str, Any]] = [
    {"term": "wheel hub", "category": "mechanical_core", "max_items": 1},
    {"term": "hub of the wheel", "category": "mechanical_core", "max_items": 1},
    {"term": "hub cap", "category": "mechanical_core", "max_items": 1},
    {"term": "front hub", "category": "mechanical_core", "max_items": 1},
    {"term": "rear hub", "category": "mechanical_core", "max_items": 1},
    {"term": "axle hub", "category": "mechanical_core", "max_items": 1},
    {"term": "hub of activity", "category": "central_place", "max_items": 1},
    {"term": "hub of commerce", "category": "central_place", "max_items": 1},
    {"term": "hub of trade", "category": "central_place", "max_items": 1},
    {"term": "hub of industry", "category": "central_place", "max_items": 1},
    {"term": "hub of the city", "category": "central_place", "max_items": 1},
    {"term": "hub of the community", "category": "central_place", "max_items": 1},
    {"term": "railway hub", "category": "transport_logistics", "max_items": 1},
    {"term": "railroad hub", "category": "transport_logistics", "max_items": 1},
    {"term": "transport hub", "category": "transport_logistics", "max_items": 1},
    {"term": "transit hub", "category": "transport_logistics", "max_items": 1},
    {"term": "shipping hub", "category": "transport_logistics", "max_items": 1},
    {"term": "logistics hub", "category": "transport_logistics", "max_items": 1},
    {"term": "airport hub", "category": "transport_logistics", "max_items": 1},
    {"term": "airline hub", "category": "transport_logistics", "max_items": 1},
    {"term": "regional hub", "category": "transport_logistics", "max_items": 1},
    {"term": "global hub", "category": "transport_logistics", "max_items": 1},
    {"term": "communication hub", "category": "network_system", "max_items": 1},
    {"term": "network hub", "category": "network_system", "max_items": 1},
    {"term": "hub node", "category": "network_system", "max_items": 1},
    {"term": "central hub", "category": "network_system", "max_items": 1},
    {"term": "internet hub", "category": "network_system", "max_items": 1},
    {"term": "ethernet hub", "category": "network_system", "max_items": 1},
    {"term": "hub and spoke", "category": "network_system", "max_items": 1},
    {"term": "hub-and-spoke", "category": "network_system", "max_items": 1},
    {"term": "business hub", "category": "institutional_cluster", "max_items": 1},
    {"term": "financial hub", "category": "institutional_cluster", "max_items": 1},
    {"term": "education hub", "category": "institutional_cluster", "max_items": 1},
    {"term": "research hub", "category": "institutional_cluster", "max_items": 1},
    {"term": "knowledge hub", "category": "institutional_cluster", "max_items": 1},
    {"term": "innovation hub", "category": "institutional_cluster", "max_items": 1},
    {"term": "creative hub", "category": "institutional_cluster", "max_items": 1},
    {"term": "cultural hub", "category": "institutional_cluster", "max_items": 1},
    {"term": "startup hub", "category": "institutional_cluster", "max_items": 1},
    {"term": "digital hub", "category": "digital_platform", "max_items": 1},
    {"term": "content hub", "category": "digital_platform", "max_items": 1},
    {"term": "data hub", "category": "digital_platform", "max_items": 1},
    {"term": "media hub", "category": "digital_platform", "max_items": 1},
    {"term": "resource hub", "category": "digital_platform", "max_items": 1},
    {"term": "learning hub", "category": "digital_platform", "max_items": 1},
    {"term": "community hub", "category": "digital_platform", "max_items": 1},
    {"term": "platform hub", "category": "digital_platform", "max_items": 1},
]


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def ensure_dirs() -> None:
    for directory in (RAW_DIR, CACHE_DIR, PROCESSED_DIR, REPORTS_DIR):
        directory.mkdir(parents=True, exist_ok=True)


def write_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def slug(value: str) -> str:
    return re.sub(r"_+", "_", re.sub(r"[^a-z0-9]+", "_", value.lower())).strip("_")


def canonical(value: str) -> str:
    value = value.lower()
    value = re.sub(r"\s*\(all\)$", "", value)
    value = re.sub(r"\s*-\s*", "-", value)
    value = re.sub(r"\s+", " ", value)
    return value.strip()


def cache_name(prefix: str, url: str, suffix: str) -> Path:
    digest = hashlib.sha1(url.encode("utf-8")).hexdigest()[:16]
    return CACHE_DIR / f"{prefix}_{digest}.{suffix}"


def fetch_url(url: str, prefix: str, suffix: str = "txt", timeout: int = 30) -> dict[str, Any]:
    cache_path = cache_name(prefix, url, suffix)
    log: dict[str, Any] = {
        "url": url,
        "cache_path": str(cache_path.relative_to(ROOT)),
        "from_cache": cache_path.exists(),
        "ok": False,
        "status_code": None,
        "content_type": None,
        "error": None,
    }

    if cache_path.exists():
        try:
            data = cache_path.read_bytes()
            log["ok"] = True
            log["bytes"] = len(data)
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
            cache_path.write_bytes(data)
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


def ngram_url(terms: list[str]) -> str:
    params = {
        "content": ",".join(terms),
        "year_start": str(START_YEAR),
        "year_end": str(END_YEAR),
        "corpus": CORPUS,
        "smoothing": str(SMOOTHING),
        "case_insensitive": str(CASE_INSENSITIVE).lower(),
    }
    return f"{NGRAM_ENDPOINT}?{urllib.parse.urlencode(params)}"


def chunks(values: list[dict[str, str]], size: int) -> list[list[dict[str, str]]]:
    return [values[index : index + size] for index in range(0, len(values), size)]


def decode_json_bytes(data: bytes | None) -> Any:
    if data is None:
        raise ValueError("No response bytes to decode.")
    return json.loads(data.decode("utf-8"))


def prefer_aggregate_rows(rows: list[dict[str, Any]]) -> dict[str, dict[str, Any]]:
    by_term: dict[str, dict[str, Any]] = {}
    for row in rows:
        key = canonical(str(row.get("ngram", "")))
        existing = by_term.get(key)
        is_aggregate = re.search(r"\(all\)$", str(row.get("ngram", "")), re.IGNORECASE) is not None
        existing_is_aggregate = (
            existing is not None
            and re.search(r"\(all\)$", str(existing.get("ngram", "")), re.IGNORECASE) is not None
        )
        if existing is None or (is_aggregate and not existing_is_aggregate):
            by_term[key] = row
    return by_term


def stats_for_points(points: list[dict[str, Any]]) -> dict[str, Any]:
    nonzero = [point for point in points if point["value"] > 0]
    peak = max(points, key=lambda point: point["frequency_per_million"], default=None)
    last = nonzero[-1] if nonzero else None
    first = nonzero[0] if nonzero else None

    def first_above(threshold: float) -> int | None:
        for point in points:
            if point["frequency_per_million"] > threshold:
                return point["year"]
        return None

    return {
        "first_nonzero_year": first["year"] if first else None,
        "last_nonzero_year": last["year"] if last else None,
        "peak_year": peak["year"] if peak else None,
        "peak_value": peak["value"] if peak else 0,
        "peak_frequency_per_million": peak["frequency_per_million"] if peak else 0,
        "nonzero_year_count": len(nonzero),
        "first_above_0_01_per_million": first_above(0.01),
        "first_above_0_1_per_million": first_above(0.1),
        "first_above_1_per_million": first_above(1),
    }


def result_from_row(term: dict[str, str], row: dict[str, Any], request_url: str) -> dict[str, Any]:
    points = []
    for index, raw_value in enumerate(row.get("timeseries", [])):
        value = float(raw_value or 0)
        points.append(
            {
                "term": term["term"],
                "year": START_YEAR + index,
                "value": value,
                "frequency_per_million": round(value * 1_000_000, 8),
                "source": "Google Books Ngram Viewer",
                "corpus": CORPUS,
                "corpus_label": CORPUS_LABEL,
                "smoothing": SMOOTHING,
                "case_insensitive": CASE_INSENSITIVE,
            }
        )

    stats = stats_for_points(points)
    if stats["nonzero_year_count"] == 0:
        status = "missing"
        notes = "Ngram returned a row, but all yearly values were zero."
    elif stats["nonzero_year_count"] <= 3 or stats["peak_frequency_per_million"] < 0.001:
        status = "too_sparse"
        notes = "Ngram signal is sparse; keep as a candidate but avoid interpretation without snippets."
    else:
        status = "collected"
        notes = ""

    return {
        "term": term["term"],
        "term_slug": slug(term["term"]),
        "category": term["category"],
        "query_group": term["query_group"],
        "status": status,
        "returned_ngram": row.get("ngram"),
        "request_url": request_url,
        "source": "Google Books Ngram Viewer",
        "points": points,
        "stats": stats,
        "notes": notes,
        "error": None,
    }


def missing_result(term: dict[str, str], request_url: str, notes: str) -> dict[str, Any]:
    return {
        "term": term["term"],
        "term_slug": slug(term["term"]),
        "category": term["category"],
        "query_group": term["query_group"],
        "status": "missing",
        "returned_ngram": None,
        "request_url": request_url,
        "source": "Google Books Ngram Viewer",
        "points": [],
        "stats": stats_for_points([]),
        "notes": notes,
        "error": None,
    }


def error_result(term: dict[str, str], request_url: str, error: str) -> dict[str, Any]:
    return {
        "term": term["term"],
        "term_slug": slug(term["term"]),
        "category": term["category"],
        "query_group": term["query_group"],
        "status": "error",
        "returned_ngram": None,
        "request_url": request_url,
        "source": "Google Books Ngram Viewer",
        "points": [],
        "stats": stats_for_points([]),
        "notes": "Request failed; preserve term for audit and retry later.",
        "error": error,
    }


def collect_ngram() -> dict[str, Any]:
    requests: list[dict[str, Any]] = []
    results: list[dict[str, Any]] = []

    for batch_index, term_batch in enumerate(chunks(FREQUENCY_TERMS, BATCH_SIZE), start=1):
        url = ngram_url([term["term"] for term in term_batch])
        response = fetch_url(url, f"google_ngram_{CORPUS}_{batch_index:02d}", "json")
        requests.append(response["log"])

        if response["log"]["ok"]:
            try:
                rows = decode_json_bytes(response["data"])
                by_term = prefer_aggregate_rows(rows)
                for term in term_batch:
                    row = by_term.get(canonical(term["term"]))
                    if row:
                        results.append(result_from_row(term, row, url))
                    else:
                        results.append(missing_result(term, url, "No row returned by Google Ngram for this query."))
            except (json.JSONDecodeError, ValueError, TypeError) as exc:
                for term in term_batch:
                    results.append(error_result(term, url, f"JSON decode failed: {exc}"))
        else:
            for term in term_batch:
                single_url = ngram_url([term["term"]])
                single_response = fetch_url(single_url, f"google_ngram_{CORPUS}_{slug(term['term'])}", "json")
                requests.append(single_response["log"])
                if single_response["log"]["ok"]:
                    try:
                        rows = decode_json_bytes(single_response["data"])
                        row = prefer_aggregate_rows(rows).get(canonical(term["term"]))
                        if row:
                            results.append(result_from_row(term, row, single_url))
                        else:
                            results.append(missing_result(term, single_url, "No row returned by Google Ngram."))
                    except (json.JSONDecodeError, ValueError, TypeError) as exc:
                        results.append(error_result(term, single_url, f"JSON decode failed: {exc}"))
                else:
                    results.append(error_result(term, single_url, str(single_response["log"].get("error"))))
                time.sleep(REQUEST_DELAY_SECONDS)

        time.sleep(REQUEST_DELAY_SECONDS)

    return {
        "metadata": {
            "word": "hub",
            "generated_at": utc_now(),
            "source": "Google Books Ngram Viewer",
            "endpoint": NGRAM_ENDPOINT,
            "query_settings": {
                "year_start": START_YEAR,
                "year_end": END_YEAR,
                "corpus": CORPUS,
                "corpus_label": CORPUS_LABEL,
                "smoothing": SMOOTHING,
                "case_insensitive": CASE_INSENSITIVE,
                "batch_size": BATCH_SIZE,
            },
        },
        "terms_attempted": FREQUENCY_TERMS,
        "requests": requests,
        "results": results,
    }


def collect_reference_sources() -> dict[str, Any]:
    sources = []
    for source in REFERENCE_SOURCES:
        suffix = "html" if "action=raw" not in source["url"] else "txt"
        response = fetch_url(source["url"], f"reference_{source['id']}", suffix)
        text = ""
        if response["data"]:
            try:
                text = response["data"].decode("utf-8", errors="replace")
            except UnicodeDecodeError:
                text = ""

        source_record = dict(source)
        source_record.update(
            {
                "access_status": "collected" if response["log"]["ok"] else "failed",
                "http_status": response["log"].get("status_code"),
                "content_type": response["log"].get("content_type"),
                "cache_path": response["log"].get("cache_path"),
                "from_cache": response["log"].get("from_cache"),
                "error": response["log"].get("error"),
                "fetched_at": utc_now(),
                "text_length": len(text),
                "contains_hub": "hub" in text.lower(),
                "access_notes": None
                if response["log"]["ok"]
                else "Source unavailable during automated pass; preserve URL for manual review.",
            }
        )
        sources.append(source_record)
        time.sleep(REQUEST_DELAY_SECONDS)

    return {
        "metadata": {
            "word": "hub",
            "generated_at": utc_now(),
            "note": "Reference sources are stored as access/status records plus paraphrased notes. Raw HTML/text is cached separately.",
        },
        "sources": sources,
    }


def clean_text(value: str) -> str:
    value = html.unescape(value)
    value = re.sub(r"<[^>]+>", " ", value)
    value = re.sub(r"\s+", " ", value)
    value = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f]", "", value)
    return value.strip()


def snippet_window(text: str, phrase: str, window: int = 220) -> tuple[str | None, bool]:
    compact = clean_text(text)
    lower = compact.lower()
    phrase_lower = phrase.lower()
    index = lower.find(phrase_lower)
    exact = True
    if index < 0:
        exact = False
        index = lower.find("hub")
    if index < 0:
        return None, False
    start = max(0, index - window // 2)
    end = min(len(compact), index + len(phrase) + window // 2)
    snippet = compact[start:end].strip()
    snippet = re.sub(r"^\S{0,20}\s", "", snippet) if start > 0 else snippet
    snippet = re.sub(r"\s\S{0,20}$", "", snippet) if end < len(compact) else snippet
    return snippet, exact


def parse_year(value: Any) -> int | None:
    if value is None:
        return None
    match = re.search(r"(1[5-9]\d{2}|20\d{2})", str(value))
    return int(match.group(1)) if match else None


def chronicling_search_url(query: dict[str, Any], mode: str) -> str:
    params: dict[str, str] = {
        "format": "json",
        "rows": str(max(1, query.get("max_items", 2) * 4)),
        "date1": str(query["date1"]),
        "date2": str(query["date2"]),
        "sort": "date",
    }
    if mode == "phrase":
        params["phrasetext"] = query["term"]
    else:
        params["andtext"] = query["term"]
    return "https://chroniclingamerica.loc.gov/search/pages/results/?" + urllib.parse.urlencode(params)


def ocr_url_for_item(item: dict[str, Any]) -> str | None:
    item_id = item.get("id") or item.get("url")
    if not item_id:
        return None
    item_url = str(item_id)
    if item_url.startswith("/"):
        item_url = "https://chroniclingamerica.loc.gov" + item_url
    if not item_url.endswith("/"):
        item_url += "/"
    return item_url + "ocr.txt"


def collect_chronicling_snippets() -> dict[str, Any]:
    snippets: list[dict[str, Any]] = []
    collection_queries: list[dict[str, Any]] = []
    access_log: list[dict[str, Any]] = []
    seen_keys: set[str] = set()

    for query in CHRONICLING_QUERIES:
        query_record = dict(query)
        query_record["search_urls"] = []
        query_record["items_seen"] = 0
        query_record["snippets_collected"] = 0
        query_record["errors"] = []

        items: list[dict[str, Any]] = []
        for mode in ("phrase", "and"):
            url = chronicling_search_url(query, mode)
            query_record["search_urls"].append(url)
            response = fetch_url(url, f"chronicling_search_{mode}_{slug(query['term'])}", "json")
            access_log.append(response["log"])
            if not response["log"]["ok"]:
                query_record["errors"].append(str(response["log"].get("error")))
                continue
            try:
                payload = decode_json_bytes(response["data"])
                items = payload.get("items", []) if isinstance(payload, dict) else []
                if items:
                    break
            except (json.JSONDecodeError, ValueError, TypeError) as exc:
                query_record["errors"].append(f"Search JSON decode failed: {exc}")
            time.sleep(REQUEST_DELAY_SECONDS)

        query_record["items_seen"] = len(items)
        for item in items:
            if query_record["snippets_collected"] >= query.get("max_items", 2):
                break
            ocr_url = ocr_url_for_item(item)
            if not ocr_url:
                continue
            response = fetch_url(ocr_url, f"chronicling_ocr_{slug(query['term'])}", "txt", timeout=45)
            access_log.append(response["log"])
            if not response["log"]["ok"] or not response["data"]:
                continue
            text = response["data"].decode("utf-8", errors="replace")
            snippet, exact = snippet_window(text, query["term"])
            if not snippet:
                continue

            source_url = str(item.get("url") or item.get("id") or ocr_url).rstrip("/")
            key = f"{source_url}|{slug(query['term'])}|{hashlib.sha1(snippet.encode('utf-8')).hexdigest()[:8]}"
            if key in seen_keys:
                continue
            seen_keys.add(key)

            year = parse_year(item.get("date"))
            snippets.append(
                {
                    "snippet_id": f"hub_chronicling_{len(snippets) + 1:04d}",
                    "term_or_phrase": query["term"],
                    "year": year,
                    "decade": f"{(year // 10) * 10}s" if year else None,
                    "source_title": clean_text(str(item.get("title") or item.get("newspaper_title") or "Chronicling America page")),
                    "source_author": None,
                    "source_url": source_url,
                    "source_type": "article",
                    "text_snippet": snippet,
                    "semantic_category": query["category"],
                    "confidence": "medium" if exact else "low",
                    "notes": "Exact phrase found in OCR window." if exact else "OCR page matched query, but snippet window falls back to nearest hub occurrence.",
                }
            )
            query_record["snippets_collected"] += 1
            time.sleep(REQUEST_DELAY_SECONDS)

        collection_queries.append(query_record)

    return {
        "collection_queries": collection_queries,
        "access_log": access_log,
        "snippets": snippets,
    }


def loc_chronicling_search_url(query: dict[str, Any]) -> str:
    params = {
        "fo": "json",
        "c": str(max(2, query.get("max_items", 1) * 2)),
        "q": f'"{query["term"]}"',
        "fa": "partof:chronicling america",
        "at": "results,pagination",
    }
    return "https://www.loc.gov/search/?" + urllib.parse.urlencode(params)


def collect_loc_chronicling_snippets() -> dict[str, Any]:
    snippets: list[dict[str, Any]] = []
    collection_queries: list[dict[str, Any]] = []
    access_log: list[dict[str, Any]] = []
    seen_sources: set[str] = set()

    for query in LOC_CHRONICLING_QUERIES:
        query_record = dict(query)
        query_record["search_url"] = loc_chronicling_search_url(query)
        query_record["items_seen"] = 0
        query_record["snippets_collected"] = 0
        query_record["errors"] = []

        response = fetch_url(query_record["search_url"], f"loc_chronicling_search_{slug(query['term'])}", "json", timeout=15)
        access_log.append(response["log"])
        if not response["log"]["ok"]:
            query_record["errors"].append(str(response["log"].get("error")))
            collection_queries.append(query_record)
            continue

        try:
            payload = decode_json_bytes(response["data"])
            results = payload.get("results", []) if isinstance(payload, dict) else []
        except (json.JSONDecodeError, ValueError, TypeError) as exc:
            query_record["errors"].append(f"loc.gov JSON decode failed: {exc}")
            results = []

        query_record["items_seen"] = len(results)
        for result in results:
            if query_record["snippets_collected"] >= query.get("max_items", 1):
                break
            descriptions = result.get("description", []) if isinstance(result, dict) else []
            if isinstance(descriptions, str):
                description_text = descriptions
            else:
                description_text = " ".join(str(item) for item in descriptions)
            snippet, exact = snippet_window(description_text, query["term"], window=260)
            if not snippet:
                continue

            source_url = str(result.get("id") or result.get("url") or result.get("aka", [""])[0]).strip()
            if not source_url:
                continue
            source_key = f"{source_url}|{slug(query['term'])}"
            if source_key in seen_sources:
                continue
            seen_sources.add(source_key)

            year = parse_year(result.get("date") or result.get("dates"))
            title = result.get("title") or result.get("item", {}).get("newspaper_title") or "loc.gov Chronicling America result"
            if isinstance(title, list):
                title = title[0] if title else "loc.gov Chronicling America result"

            snippets.append(
                {
                    "snippet_id": f"hub_loc_chronicling_{len(snippets) + 1:04d}",
                    "term_or_phrase": query["term"],
                    "year": year,
                    "decade": f"{(year // 10) * 10}s" if year else None,
                    "source_title": clean_text(str(title)),
                    "source_author": None,
                    "source_url": source_url,
                    "source_type": "article",
                    "text_snippet": snippet,
                    "semantic_category": query["category"],
                    "confidence": "medium" if exact else "low",
                    "notes": "loc.gov Chronicling America OCR description; verify page image before final copy.",
                }
            )
            query_record["snippets_collected"] += 1

        collection_queries.append(query_record)
        time.sleep(REQUEST_DELAY_SECONDS)

    return {
        "collection_queries": collection_queries,
        "access_log": access_log,
        "snippets": snippets,
    }


def internet_archive_search_url(query: dict[str, Any]) -> str:
    ia_query = f'"{query["term"]}" AND mediatype:texts AND date:[{query["date1"]} TO {query["date2"]}]'
    params: list[tuple[str, str]] = [
        ("q", ia_query),
        ("fl[]", "identifier"),
        ("fl[]", "title"),
        ("fl[]", "creator"),
        ("fl[]", "date"),
        ("rows", str(max(5, query.get("max_items", 2) * 4))),
        ("page", "1"),
        ("output", "json"),
    ]
    return "https://archive.org/advancedsearch.php?" + urllib.parse.urlencode(params)


def internet_archive_text_file(metadata: dict[str, Any]) -> str | None:
    files = metadata.get("files") if isinstance(metadata, dict) else None
    if not isinstance(files, list):
        return None
    candidates = []
    for file_record in files:
        name = file_record.get("name") if isinstance(file_record, dict) else None
        if not isinstance(name, str):
            continue
        lower = name.lower()
        if lower.endswith("_djvu.txt"):
            candidates.append((0, name))
        elif lower.endswith(".txt") and "abbyy" not in lower and "meta" not in lower:
            candidates.append((1, name))
    candidates.sort()
    return candidates[0][1] if candidates else None


def collect_internet_archive_snippets() -> dict[str, Any]:
    snippets: list[dict[str, Any]] = []
    collection_queries: list[dict[str, Any]] = []
    access_log: list[dict[str, Any]] = []
    seen_keys: set[str] = set()

    for query in INTERNET_ARCHIVE_QUERIES:
        query_record = dict(query)
        query_record["search_url"] = internet_archive_search_url(query)
        query_record["items_seen"] = 0
        query_record["snippets_collected"] = 0
        query_record["errors"] = []

        search_response = fetch_url(
            query_record["search_url"],
            f"internet_archive_search_{slug(query['term'])}",
            "json",
            timeout=45,
        )
        access_log.append(search_response["log"])
        if not search_response["log"]["ok"]:
            query_record["errors"].append(str(search_response["log"].get("error")))
            collection_queries.append(query_record)
            continue

        try:
            payload = decode_json_bytes(search_response["data"])
            docs = payload.get("response", {}).get("docs", []) if isinstance(payload, dict) else []
        except (json.JSONDecodeError, ValueError, TypeError) as exc:
            query_record["errors"].append(f"Search JSON decode failed: {exc}")
            docs = []

        query_record["items_seen"] = len(docs)
        for doc in docs:
            if query_record["snippets_collected"] >= query.get("max_items", 2):
                break
            identifier = doc.get("identifier") if isinstance(doc, dict) else None
            if not identifier:
                continue

            metadata_url = f"https://archive.org/metadata/{urllib.parse.quote(str(identifier))}"
            metadata_response = fetch_url(
                metadata_url,
                f"internet_archive_metadata_{slug(str(identifier))}",
                "json",
                timeout=45,
            )
            access_log.append(metadata_response["log"])
            if not metadata_response["log"]["ok"]:
                continue
            try:
                metadata = decode_json_bytes(metadata_response["data"])
            except (json.JSONDecodeError, ValueError, TypeError):
                continue

            text_file = internet_archive_text_file(metadata)
            if not text_file:
                continue

            text_url = f"https://archive.org/download/{urllib.parse.quote(str(identifier))}/{urllib.parse.quote(text_file)}"
            text_response = fetch_url(
                text_url,
                f"internet_archive_text_{slug(str(identifier))}",
                "txt",
                timeout=60,
            )
            access_log.append(text_response["log"])
            if not text_response["log"]["ok"] or not text_response["data"]:
                continue

            text = text_response["data"].decode("utf-8", errors="replace")
            snippet, exact = snippet_window(text, query["term"], window=240)
            if not snippet:
                continue

            source_url = f"https://archive.org/details/{identifier}"
            key = f"{source_url}|{slug(query['term'])}|{hashlib.sha1(snippet.encode('utf-8')).hexdigest()[:8]}"
            if key in seen_keys:
                continue
            seen_keys.add(key)

            year = parse_year(doc.get("date") or metadata.get("metadata", {}).get("date"))
            title = doc.get("title") or metadata.get("metadata", {}).get("title") or "Internet Archive text"
            creator = doc.get("creator") or metadata.get("metadata", {}).get("creator")
            if isinstance(creator, list):
                creator = "; ".join(str(item) for item in creator[:3])

            snippets.append(
                {
                    "snippet_id": f"hub_internet_archive_{len(snippets) + 1:04d}",
                    "term_or_phrase": query["term"],
                    "year": year,
                    "decade": f"{(year // 10) * 10}s" if year else None,
                    "source_title": clean_text(str(title)),
                    "source_author": clean_text(str(creator)) if creator else None,
                    "source_url": source_url,
                    "source_type": "book",
                    "text_snippet": snippet,
                    "semantic_category": query["category"],
                    "confidence": "high" if exact else "medium",
                    "notes": "Public-domain-era Internet Archive text; verify against scan before final copy."
                    if exact
                    else "Internet Archive text matched query, but snippet window falls back to nearest hub occurrence.",
                }
            )
            query_record["snippets_collected"] += 1
            time.sleep(REQUEST_DELAY_SECONDS)

        collection_queries.append(query_record)
        time.sleep(REQUEST_DELAY_SECONDS)

    return {
        "collection_queries": collection_queries,
        "access_log": access_log,
        "snippets": snippets,
    }


def google_books_search_url(query: dict[str, Any], free_only: bool) -> str:
    params: dict[str, str] = {
        "q": f'"{query["term"]}"',
        "maxResults": "8",
        "printType": "books",
        "orderBy": "relevance",
        "fields": "items(id,volumeInfo(title,authors,publishedDate,infoLink),searchInfo(textSnippet))",
    }
    if free_only:
        params["filter"] = "free-ebooks"
    return "https://www.googleapis.com/books/v1/volumes?" + urllib.parse.urlencode(params)


def clip_snippet(value: str, max_chars: int = 220) -> str:
    value = clean_text(value)
    if len(value) <= max_chars:
        return value
    clipped = value[:max_chars].rsplit(" ", 1)[0].strip()
    return clipped + "..."


def collect_google_books_snippets() -> dict[str, Any]:
    snippets: list[dict[str, Any]] = []
    collection_queries: list[dict[str, Any]] = []
    access_log: list[dict[str, Any]] = []
    seen_sources: set[str] = set()
    rate_limited = False

    for query in GOOGLE_BOOKS_QUERIES:
        query_record = dict(query)
        query_record["search_urls"] = []
        query_record["items_seen"] = 0
        query_record["snippets_collected"] = 0
        query_record["errors"] = []

        if rate_limited:
            query_record["errors"].append("Skipped after Google Books API returned HTTP 429 during this run.")
            collection_queries.append(query_record)
            continue

        items: list[dict[str, Any]] = []
        for free_only in (True, False):
            url = google_books_search_url(query, free_only)
            query_record["search_urls"].append(url)
            response = fetch_url(url, f"google_books_{'free' if free_only else 'all'}_{slug(query['term'])}", "json")
            access_log.append(response["log"])
            if not response["log"]["ok"]:
                query_record["errors"].append(str(response["log"].get("error")))
                if response["log"].get("status_code") == 429:
                    rate_limited = True
                    break
                continue
            try:
                payload = decode_json_bytes(response["data"])
                items = payload.get("items", []) if isinstance(payload, dict) else []
                if items:
                    break
            except (json.JSONDecodeError, ValueError, TypeError) as exc:
                query_record["errors"].append(f"Google Books JSON decode failed: {exc}")
            time.sleep(REQUEST_DELAY_SECONDS)

        if rate_limited:
            collection_queries.append(query_record)
            continue

        query_record["items_seen"] = len(items)
        for item in items:
            if query_record["snippets_collected"] >= query.get("max_items", 1):
                break
            search_info = item.get("searchInfo", {}) if isinstance(item, dict) else {}
            raw_snippet = search_info.get("textSnippet")
            if not raw_snippet:
                continue
            volume = item.get("volumeInfo", {})
            source_url = volume.get("infoLink") or f"https://books.google.com/books?id={item.get('id')}"
            source_key = f"{source_url}|{slug(query['term'])}"
            if source_key in seen_sources:
                continue
            seen_sources.add(source_key)
            snippet = clip_snippet(str(raw_snippet))
            if not snippet:
                continue
            year = parse_year(volume.get("publishedDate"))
            authors = volume.get("authors")
            author_text = "; ".join(str(author) for author in authors[:3]) if isinstance(authors, list) else None
            phrase_found = query["term"].lower().replace("-", " ") in snippet.lower().replace("-", " ")
            snippets.append(
                {
                    "snippet_id": f"hub_google_books_{len(snippets) + 1:04d}",
                    "term_or_phrase": query["term"],
                    "year": year,
                    "decade": f"{(year // 10) * 10}s" if year else None,
                    "source_title": clean_text(str(volume.get("title") or "Google Books result")),
                    "source_author": clean_text(author_text) if author_text else None,
                    "source_url": source_url,
                    "source_type": "book_snippet",
                    "text_snippet": snippet,
                    "semantic_category": query["category"],
                    "confidence": "medium" if phrase_found else "low",
                    "notes": "Short Google Books API textSnippet; research lead only, verify before public copy.",
                }
            )
            query_record["snippets_collected"] += 1

        collection_queries.append(query_record)
        time.sleep(REQUEST_DELAY_SECONDS)

    return {
        "collection_queries": collection_queries,
        "access_log": access_log,
        "snippets": snippets,
    }


def phrase_signal(result: dict[str, Any] | None) -> dict[str, Any]:
    if not result:
        return {
            "status": "missing",
            "first_nonzero_year": None,
            "peak_year": None,
            "peak_frequency_per_million": 0,
            "nonzero_year_count": 0,
        }
    stats = result.get("stats", {})
    return {
        "status": result.get("status"),
        "first_nonzero_year": stats.get("first_nonzero_year"),
        "first_above_0_1_per_million": stats.get("first_above_0_1_per_million"),
        "peak_year": stats.get("peak_year"),
        "peak_frequency_per_million": stats.get("peak_frequency_per_million", 0),
        "nonzero_year_count": stats.get("nonzero_year_count", 0),
    }


def reliability_for_signal(signal: dict[str, Any], has_snippet: bool) -> str:
    if has_snippet and signal.get("status") == "collected":
        return "high"
    if signal.get("peak_frequency_per_million", 0) >= 0.1 and signal.get("nonzero_year_count", 0) >= 10:
        return "medium"
    if has_snippet:
        return "medium"
    return "low"


def build_phrase_candidates(ngram_raw: dict[str, Any], snippets: list[dict[str, Any]]) -> dict[str, Any]:
    by_term = {result["term"]: result for result in ngram_raw.get("results", [])}
    snippets_by_term: dict[str, dict[str, Any]] = {}
    for snippet in snippets:
        term = snippet.get("term_or_phrase")
        if term and term not in snippets_by_term:
            snippets_by_term[term] = snippet

    candidates = []
    for term in FREQUENCY_TERMS:
        if term["query_group"] == "core":
            continue
        result = by_term.get(term["term"])
        signal = phrase_signal(result)
        snippet = snippets_by_term.get(term["term"])
        sample_years = [
            year
            for year in [
                signal.get("first_nonzero_year"),
                signal.get("first_above_0_1_per_million"),
                signal.get("peak_year"),
            ]
            if year is not None
        ]
        sample_years = list(dict.fromkeys(sample_years))
        note_parts = []
        if signal["status"] in {"missing", "error", "too_sparse"}:
            note_parts.append("Sparse or unavailable Ngram signal; retain as candidate for manual review.")
        if term["category"] in {"digital_platform", "institutional_cluster"} and signal.get("first_nonzero_year") and signal["first_nonzero_year"] < 1950:
            note_parts.append("Early Ngram hits may be literal, generic, OCR noise, or unrelated to the modern category.")

        candidates.append(
            {
                "phrase": term["term"],
                "phrase_slug": slug(term["term"]),
                "category": term["category"],
                "category_label": SEMANTIC_CATEGORIES[term["category"]]["label"],
                "query_group": term["query_group"],
                "earliest_found_year": signal.get("first_nonzero_year"),
                "sample_years": sample_years,
                "approximate_frequency_signal": signal,
                "source": "Google Books Ngram Viewer; supplemental snippets where available",
                "evidence_snippet": snippet.get("text_snippet") if snippet else None,
                "evidence_snippet_id": snippet.get("snippet_id") if snippet else None,
                "reliability_level": reliability_for_signal(signal, snippet is not None),
                "notes": " ".join(note_parts).strip(),
            }
        )

    return {
        "metadata": {
            "word": "hub",
            "generated_at": utc_now(),
            "note": "Phrase candidates are raw research candidates, not final chart copy.",
        },
        "phrase_candidates": candidates,
    }


def build_reference_notes(
    ngram_raw: dict[str, Any],
    dictionary_raw: dict[str, Any],
    snippets_raw: dict[str, Any],
) -> dict[str, Any]:
    failed_sources = [
        source
        for source in dictionary_raw.get("sources", [])
        if source.get("access_status") != "collected"
    ]
    failed_ngram = [
        result
        for result in ngram_raw.get("results", [])
        if result.get("status") == "error"
    ]
    sparse_terms = [
        result
        for result in ngram_raw.get("results", [])
        if result.get("status") in {"missing", "too_sparse"}
    ]

    return {
        "metadata": {
            "word": "hub",
            "generated_at": utc_now(),
            "generated_by_script": "scripts/scrape_hub_data.py",
        },
        "research_scope": [
            "physical central part of a wheel",
            "central point or focus",
            "transport and logistics hub",
            "communication and network hub",
            "business, innovation, knowledge, and cultural hub",
            "digital, content, data, and platform hub",
            "hub-and-spoke systems",
        ],
        "source_status_summary": {
            "dictionary_sources_attempted": len(dictionary_raw.get("sources", [])),
            "dictionary_sources_failed": len(failed_sources),
            "ngram_terms_attempted": len(ngram_raw.get("results", [])),
            "ngram_request_errors": len(failed_ngram),
            "ngram_sparse_or_missing_terms": len(sparse_terms),
            "corpus_snippets_collected": len(snippets_raw.get("snippets", [])),
        },
        "failed_or_unavailable_sources": [
            {
                "id": source.get("id"),
                "source_name": source.get("source_name"),
                "url": source.get("url"),
                "error": source.get("error"),
            }
            for source in failed_sources
        ],
        "sparse_or_missing_terms": [
            {
                "term": result.get("term"),
                "status": result.get("status"),
                "notes": result.get("notes"),
                "error": result.get("error"),
            }
            for result in sparse_terms
        ],
        "curation_notes": [
            "Ngram values show printed-book visibility, not meaning by themselves.",
            "Early first-nonzero years for modern phrases should be treated as search leads, not first-use claims.",
            "Chronicling America snippets are OCR-derived and require manual reading against page images before final use.",
            "Dictionary notes are paraphrased to avoid overquoting and should support sense inventory rather than polished copy.",
        ],
    }


def main() -> None:
    ensure_dirs()

    ngram_raw = collect_ngram()
    seed_snippets = []
    for index, snippet in enumerate(REFERENCE_SNIPPET_SEEDS, start=1):
        year = snippet.get("year")
        seed_record = {
            "snippet_id": f"hub_reference_{index:04d}",
            "decade": f"{(year // 10) * 10}s" if isinstance(year, int) else None,
            "source_author": None,
            **snippet,
        }
        seed_snippets.append(seed_record)

    dictionary_raw = collect_reference_sources()
    chronicling_raw = collect_chronicling_snippets()
    loc_chronicling_raw = collect_loc_chronicling_snippets()
    internet_archive_raw = collect_internet_archive_snippets()
    google_books_raw = collect_google_books_snippets()
    snippets_raw = {
        "metadata": {
            "word": "hub",
            "generated_at": utc_now(),
            "generated_by_script": "scripts/scrape_hub_data.py",
            "note": "Reference snippets are paraphrased. Google Books, Internet Archive, and Chronicling America snippets are short OCR/text windows for manual review.",
        },
        "reference_snippets": seed_snippets,
        "chronicling_america": {
            "collection_queries": chronicling_raw["collection_queries"],
            "access_log": chronicling_raw["access_log"],
        },
        "loc_chronicling_america": {
            "collection_queries": loc_chronicling_raw["collection_queries"],
            "access_log": loc_chronicling_raw["access_log"],
        },
        "internet_archive": {
            "collection_queries": internet_archive_raw["collection_queries"],
            "access_log": internet_archive_raw["access_log"],
        },
        "google_books": {
            "collection_queries": google_books_raw["collection_queries"],
            "access_log": google_books_raw["access_log"],
        },
        "snippets": seed_snippets
        + chronicling_raw["snippets"]
        + loc_chronicling_raw["snippets"]
        + internet_archive_raw["snippets"]
        + google_books_raw["snippets"],
    }
    phrase_raw = build_phrase_candidates(ngram_raw, snippets_raw["snippets"])
    reference_notes = build_reference_notes(ngram_raw, dictionary_raw, snippets_raw)

    write_json(RAW_DIR / "hub_ngram_raw.json", ngram_raw)
    write_json(RAW_DIR / "hub_phrase_candidates_raw.json", phrase_raw)
    write_json(RAW_DIR / "hub_dictionary_sources_raw.json", dictionary_raw)
    write_json(RAW_DIR / "hub_corpus_snippets_raw.json", snippets_raw)
    write_json(RAW_DIR / "hub_reference_notes_raw.json", reference_notes)

    collected_terms = sum(1 for result in ngram_raw["results"] if result["status"] == "collected")
    phrase_count = len(phrase_raw["phrase_candidates"])
    snippet_count = len(snippets_raw["snippets"])
    failed_sources = len(reference_notes["failed_or_unavailable_sources"])
    sparse_terms = len(reference_notes["sparse_or_missing_terms"])

    print("Hub scrape summary")
    print(f"- Ngram terms collected: {collected_terms}/{len(ngram_raw['results'])}")
    print(f"- Phrase candidates prepared: {phrase_count}")
    print(f"- Snippets collected/prepared: {snippet_count}")
    print(f"- Failed dictionary/reference sources: {failed_sources}")
    print(f"- Sparse or missing Ngram terms: {sparse_terms}")
    print(f"- Raw output directory: {RAW_DIR}")
    if CACHE_ONLY:
        print("- Mode: cache-only")


if __name__ == "__main__":
    main()
