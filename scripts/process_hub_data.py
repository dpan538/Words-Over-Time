#!/usr/bin/env python3
"""Process raw hub research data into chart-planning JSON and reports."""

from __future__ import annotations

import json
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
RESEARCH_DIR = ROOT / "docs" / "research" / "hub"
RAW_DIR = RESEARCH_DIR / "raw"
PROCESSED_DIR = RESEARCH_DIR / "processed"
REPORTS_DIR = RESEARCH_DIR / "reports"
GENERATED_DIR = ROOT / "src" / "data" / "generated"


SEMANTIC_CATEGORIES: list[dict[str, Any]] = [
    {
        "id": "mechanical_core",
        "label": "Mechanical Core",
        "summary": "Hub as the central part of a wheel or rotating structure.",
        "approximate_period": "early / foundational",
        "keywords": ["wheel hub", "axle", "spoke", "hubcap", "hub cap"],
    },
    {
        "id": "central_place",
        "label": "Central Place",
        "summary": "Hub as a center of activity, trade, life, or urban concentration.",
        "approximate_period": "generalized metaphor",
        "keywords": ["hub of activity", "hub of commerce", "hub of trade", "city hub"],
    },
    {
        "id": "transport_logistics",
        "label": "Transport & Logistics",
        "summary": "Hub as a node for movement, routing, distribution, and connection.",
        "approximate_period": "rail / air / logistics expansion",
        "keywords": ["transport hub", "airport hub", "logistics hub", "regional hub", "shipping hub"],
    },
    {
        "id": "network_system",
        "label": "Network System",
        "summary": "Hub as a central node in communication, computing, and network architecture.",
        "approximate_period": "technical/network age",
        "keywords": ["network hub", "communication hub", "hub node", "hub-and-spoke"],
    },
    {
        "id": "institutional_cluster",
        "label": "Institutional Cluster",
        "summary": "Hub as a concentration of business, education, research, finance, culture, or innovation.",
        "approximate_period": "late industrial / knowledge economy",
        "keywords": ["business hub", "financial hub", "education hub", "innovation hub", "knowledge hub"],
    },
    {
        "id": "digital_platform",
        "label": "Digital Platform",
        "summary": "Hub as a digital access point, content center, resource center, or data platform.",
        "approximate_period": "web / platform era",
        "keywords": ["digital hub", "content hub", "data hub", "resource hub", "learning hub"],
    },
]


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def slug(value: str) -> str:
    return re.sub(r"_+", "_", re.sub(r"[^a-z0-9]+", "_", value.lower())).strip("_")


def load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def round_float(value: Any, digits: int = 8) -> float:
    try:
        return round(float(value), digits)
    except (TypeError, ValueError):
        return 0.0


def period_stats(points: list[dict[str, Any]], start: int, end: int) -> dict[str, Any]:
    selected = [point for point in points if start <= point["year"] <= end]
    if not selected:
        return {
            "period": f"{start}-{end}",
            "start_year": start,
            "end_year": end,
            "average_frequency_per_million": 0,
            "max_frequency_per_million": 0,
            "nonzero_year_count": 0,
        }
    values = [point["frequency_per_million"] for point in selected]
    return {
        "period": f"{start}-{end}",
        "start_year": start,
        "end_year": end,
        "average_frequency_per_million": round_float(sum(values) / len(values)),
        "max_frequency_per_million": round_float(max(values)),
        "nonzero_year_count": sum(1 for value in values if value > 0),
    }


def quality_for(result: dict[str, Any]) -> str:
    status = result.get("status")
    stats = result.get("stats", {})
    if status == "error":
        return "failed"
    if status == "missing":
        return "missing"
    if status == "too_sparse":
        return "sparse"
    if stats.get("peak_frequency_per_million", 0) < 0.01:
        return "sparse"
    category = result.get("category")
    first = stats.get("first_nonzero_year")
    if category in {"digital_platform", "institutional_cluster", "network_system"} and first and first < 1950:
        return "requires_manual_review"
    return "ok"


def build_frequency_series(ngram_raw: dict[str, Any]) -> dict[str, Any]:
    series = []
    for result in ngram_raw.get("results", []):
        points = [
            {
                "term": point["term"],
                "year": point["year"],
                "value": point["value"],
                "frequency_per_million": point["frequency_per_million"],
                "source": point["source"],
                "corpus": point["corpus"],
                "smoothing": point["smoothing"],
                "notes": result.get("notes") if result.get("status") != "collected" else "",
            }
            for point in result.get("points", [])
        ]
        series.append(
            {
                "series_id": f"{result['term_slug']}-{ngram_raw['metadata']['query_settings']['corpus']}",
                "term": result["term"],
                "term_slug": result["term_slug"],
                "category": result["category"],
                "query_group": result["query_group"],
                "status": result["status"],
                "data_quality_status": quality_for(result),
                "source": result["source"],
                "returned_ngram": result.get("returned_ngram"),
                "request_url": result.get("request_url"),
                "year_start": ngram_raw["metadata"]["query_settings"]["year_start"],
                "year_end": ngram_raw["metadata"]["query_settings"]["year_end"],
                "corpus": ngram_raw["metadata"]["query_settings"]["corpus"],
                "corpus_label": ngram_raw["metadata"]["query_settings"]["corpus_label"],
                "smoothing": ngram_raw["metadata"]["query_settings"]["smoothing"],
                "case_insensitive": ngram_raw["metadata"]["query_settings"]["case_insensitive"],
                "stats": result.get("stats", {}),
                "average_frequency_by_period": [
                    period_stats(points, 1800, 1849),
                    period_stats(points, 1850, 1899),
                    period_stats(points, 1900, 1949),
                    period_stats(points, 1950, 1999),
                    period_stats(points, 2000, 2022),
                ],
                "points": points,
                "notes": result.get("notes") or "",
                "error": result.get("error"),
            }
        )

    return {
        "metadata": {
            "word": "hub",
            "generated_at": utc_now(),
            "generated_by_script": "scripts/process_hub_data.py",
            "source": ngram_raw.get("metadata", {}).get("source"),
            "query_settings": ngram_raw.get("metadata", {}).get("query_settings", {}),
            "limitations": [
                "Google Books Ngram values are printed-book frequency signals, not semantic proof.",
                "Case-insensitive aggregate rows are preferred where available.",
                "Rare phrases may be absent or thresholded by the Ngram endpoint.",
            ],
        },
        "series": series,
    }


def snippet_lookup(snippets: list[dict[str, Any]]) -> dict[str, dict[str, Any]]:
    lookup: dict[str, dict[str, Any]] = {}
    for snippet in snippets:
        term = snippet.get("term_or_phrase")
        if isinstance(term, str) and term not in lookup:
            lookup[term] = snippet
    return lookup


def build_phrase_series(
    phrase_raw: dict[str, Any],
    frequency_series: dict[str, Any],
    snippets: list[dict[str, Any]],
) -> dict[str, Any]:
    by_term = {series["term"]: series for series in frequency_series.get("series", [])}
    by_snippet = snippet_lookup(snippets)
    phrases = []

    for candidate in phrase_raw.get("phrase_candidates", []):
        term = candidate["phrase"]
        series = by_term.get(term)
        snippet = by_snippet.get(term)
        evidence_text = candidate.get("evidence_snippet") or (snippet or {}).get("text_snippet")
        points = []
        if series:
            points = [
                {
                    "year": point["year"],
                    "value": point["value"],
                    "frequency_per_million": point["frequency_per_million"],
                    "source": point["source"],
                    "smoothing": point["smoothing"],
                    "notes": point.get("notes", ""),
                }
                for point in series.get("points", [])
            ]

        notes = candidate.get("notes") or ""
        if series and series.get("data_quality_status") == "requires_manual_review":
            notes = (notes + " Requires manual snippet review before using early year as a semantic claim.").strip()

        phrases.append(
            {
                "phrase": term,
                "phrase_slug": candidate.get("phrase_slug") or slug(term),
                "category": candidate["category"],
                "category_label": candidate.get("category_label"),
                "query_group": candidate.get("query_group"),
                "earliest_found_year": candidate.get("earliest_found_year"),
                "sample_years": candidate.get("sample_years", []),
                "approximate_frequency_signal": candidate.get("approximate_frequency_signal", {}),
                "source": candidate.get("source"),
                "evidence_snippet": evidence_text,
                "evidence_snippet_id": candidate.get("evidence_snippet_id") or (snippet or {}).get("snippet_id"),
                "reliability_level": candidate.get("reliability_level"),
                "data_quality_status": series.get("data_quality_status") if series else "missing",
                "points": points,
                "notes": notes,
            }
        )

    return {
        "metadata": {
            "word": "hub",
            "generated_at": utc_now(),
            "generated_by_script": "scripts/process_hub_data.py",
            "note": "Phrase series are candidate data for later chart planning, not final visual selections.",
        },
        "phrases": phrases,
    }


def category_support(
    category_id: str,
    phrases: list[dict[str, Any]],
    snippets: list[dict[str, Any]],
) -> dict[str, Any]:
    category_phrases = [phrase for phrase in phrases if phrase.get("category") == category_id]
    category_snippets = [snippet for snippet in snippets if snippet.get("semantic_category") == category_id]
    visible = [
        phrase
        for phrase in category_phrases
        if phrase.get("approximate_frequency_signal", {}).get("peak_frequency_per_million", 0) >= 0.05
    ]
    strongest = sorted(
        category_phrases,
        key=lambda item: item.get("approximate_frequency_signal", {}).get("peak_frequency_per_million", 0),
        reverse=True,
    )[:8]
    if category_snippets and visible:
        support = "strong"
    elif category_snippets or visible:
        support = "moderate"
    else:
        support = "thin"
    return {
        "phrase_count": len(category_phrases),
        "snippet_count": len(category_snippets),
        "visible_frequency_phrase_count": len(visible),
        "support_level": support,
        "strongest_terms": [
            {
                "term": phrase["phrase"],
                "peak_frequency_per_million": phrase.get("approximate_frequency_signal", {}).get(
                    "peak_frequency_per_million", 0
                ),
                "peak_year": phrase.get("approximate_frequency_signal", {}).get("peak_year"),
                "data_quality_status": phrase.get("data_quality_status"),
            }
            for phrase in strongest
        ],
    }


def build_semantic_categories(
    phrase_series: dict[str, Any],
    snippets: list[dict[str, Any]],
) -> dict[str, Any]:
    phrases = phrase_series.get("phrases", [])
    categories = []
    for category in SEMANTIC_CATEGORIES:
        support = category_support(category["id"], phrases, snippets)
        categories.append(
            {
                **category,
                "evidence_support": support,
                "notes": [
                    "Category is a processed scaffold for later visualization, not final interpretive copy.",
                    "Phrase assignment follows the data-pass taxonomy and can be refined during chart planning.",
                ],
            }
        )

    return {
        "metadata": {
            "word": "hub",
            "generated_at": utc_now(),
            "generated_by_script": "scripts/process_hub_data.py",
        },
        "categories": categories,
    }


def get_phrase(phrase_series: dict[str, Any], phrase: str) -> dict[str, Any] | None:
    for item in phrase_series.get("phrases", []):
        if item.get("phrase") == phrase:
            return item
    return None


def phrase_year(phrase_series: dict[str, Any], phrase: str, threshold_key: str = "first_above_0_1_per_million") -> int | None:
    item = get_phrase(phrase_series, phrase)
    if not item:
        return None
    signal = item.get("approximate_frequency_signal", {})
    return signal.get(threshold_key) or signal.get("first_nonzero_year")


def event_from_phrase(
    phrase_series: dict[str, Any],
    event_id: str,
    phrase: str,
    label: str,
    description: str,
    category: str,
    confidence: str = "medium",
) -> dict[str, Any]:
    item = get_phrase(phrase_series, phrase)
    signal = (item or {}).get("approximate_frequency_signal", {})
    year = signal.get("first_above_0_1_per_million") or signal.get("first_nonzero_year")
    notes = "Year comes from Ngram first visible signal; verify with snippets before final copy."
    if item and item.get("data_quality_status") == "requires_manual_review":
        notes += " Early hits are especially noisy for this phrase."
    return {
        "id": event_id,
        "year": year,
        "approximate_year": year,
        "label": label,
        "description": description,
        "semantic_category": category,
        "evidence_source": {
            "source": "Google Books Ngram Viewer",
            "term": phrase,
            "returned_ngram": (item or {}).get("returned_ngram"),
            "frequency_signal": signal,
        },
        "confidence": confidence if year else "low",
        "notes": notes if year else "No usable Ngram year found; keep as a placeholder for manual research.",
    }


def build_timeline_events(
    phrase_series: dict[str, Any],
    snippets: list[dict[str, Any]],
) -> dict[str, Any]:
    snippet_by_term = snippet_lookup(snippets)
    events: list[dict[str, Any]] = [
        {
            "id": "mechanical_wheel_center_1640s",
            "year": None,
            "approximate_year": 1640,
            "label": "Wheel-center sense",
            "description": "Lexical references place the foundational sense at the central solid part of a wheel.",
            "semantic_category": "mechanical_core",
            "evidence_source": {
                "source": "Online Etymology Dictionary",
                "url": "https://www.etymonline.com/word/hub",
                "snippet_id": (snippet_by_term.get("hub") or {}).get("snippet_id"),
            },
            "confidence": "medium",
            "notes": "Secondary lexical dating; primary quotation check still needed.",
        },
        {
            "id": "boston_hub_metaphor_1858",
            "year": 1858,
            "approximate_year": 1858,
            "label": "Hub as proud civic center",
            "description": "The Boston 'Hub' usage shows the wheel-center image expanding into civic centrality and cultural focus.",
            "semantic_category": "central_place",
            "evidence_source": {
                "source": "Online Etymology Dictionary",
                "url": "https://www.etymonline.com/word/hub",
                "snippet_id": (snippet_by_term.get("the Hub") or {}).get("snippet_id"),
            },
            "confidence": "medium",
            "notes": "Good scaffold event, but verify wording in Holmes before final use.",
        },
        {
            "id": "hubcap_compound_1896",
            "year": 1896,
            "approximate_year": 1896,
            "label": "Hubcap compound",
            "description": "The wheel sense remains productive in mechanical compounds such as hubcap.",
            "semantic_category": "mechanical_core",
            "evidence_source": {
                "source": "Online Etymology Dictionary",
                "url": "https://www.etymonline.com/word/hubcap",
                "snippet_id": (snippet_by_term.get("hubcap") or {}).get("snippet_id"),
            },
            "confidence": "medium",
            "notes": "Compound date from secondary lexical source.",
        },
        event_from_phrase(
            phrase_series,
            "rail_transport_hub_signal",
            "railroad hub",
            "Rail transport hub",
            "Rail and railroad phrases begin to make hub visible as a routing and connection metaphor.",
            "transport_logistics",
        ),
        event_from_phrase(
            phrase_series,
            "airport_hub_signal",
            "airport hub",
            "Airport hub",
            "Air travel extends hub to route concentration and passenger/traffic interchange.",
            "transport_logistics",
        ),
        event_from_phrase(
            phrase_series,
            "airline_hub_signal",
            "airline hub",
            "Airline hub",
            "Airline route planning reinforces hub as an operational center in a wider route system.",
            "transport_logistics",
        ),
        event_from_phrase(
            phrase_series,
            "hub_and_spoke_signal",
            "hub-and-spoke",
            "Hub-and-spoke system",
            "The hyphenated form marks a system architecture built around a central node and radiating connections.",
            "network_system",
        ),
        event_from_phrase(
            phrase_series,
            "network_hub_signal",
            "network hub",
            "Network hub",
            "Communication and computing make hub a central node or connection device.",
            "network_system",
        ),
        event_from_phrase(
            phrase_series,
            "business_financial_hub_signal",
            "business hub",
            "Business hub",
            "Economic and institutional language uses hub for clustered access, exchange, and coordination.",
            "institutional_cluster",
        ),
        event_from_phrase(
            phrase_series,
            "innovation_hub_signal",
            "innovation hub",
            "Innovation hub",
            "Knowledge-economy language extends hub to organized concentrations of research, entrepreneurship, and exchange.",
            "institutional_cluster",
        ),
        event_from_phrase(
            phrase_series,
            "digital_hub_signal",
            "digital hub",
            "Digital hub",
            "Web and platform language uses hub for access points and digital aggregation.",
            "digital_platform",
            "low",
        ),
        event_from_phrase(
            phrase_series,
            "content_data_hub_signal",
            "content hub",
            "Content and data hub",
            "Modern platform language makes hub a container for content, data, resources, and services.",
            "digital_platform",
            "low",
        ),
    ]

    events.sort(key=lambda event: event.get("approximate_year") or 9999)
    return {
        "metadata": {
            "word": "hub",
            "generated_at": utc_now(),
            "generated_by_script": "scripts/process_hub_data.py",
            "note": "Timeline is a scaffold for planning, not a final historical essay.",
        },
        "events": events,
    }


def build_snippet_samples(snippets_raw: dict[str, Any]) -> dict[str, Any]:
    snippets = snippets_raw.get("snippets", [])
    seen: set[str] = set()
    deduped = []
    for snippet in snippets:
        key = f"{snippet.get('source_url')}|{snippet.get('term_or_phrase')}|{snippet.get('text_snippet')}"
        if key in seen:
            continue
        seen.add(key)
        deduped.append(snippet)

    deduped.sort(key=lambda item: (item.get("year") is None, item.get("year") or 9999, item.get("snippet_id", "")))
    samples = deduped[:60]
    return {
        "metadata": {
            "word": "hub",
            "generated_at": utc_now(),
            "generated_by_script": "scripts/process_hub_data.py",
            "note": "Snippets are short evidence samples for manual review. OCR snippets should be checked against source images.",
        },
        "snippets": samples,
    }


def compact_phrase_for_preview(phrase: dict[str, Any]) -> dict[str, Any]:
    return {
        "phrase": phrase["phrase"],
        "category": phrase["category"],
        "earliest_found_year": phrase.get("earliest_found_year"),
        "sample_years": phrase.get("sample_years", []),
        "approximate_frequency_signal": phrase.get("approximate_frequency_signal", {}),
        "reliability_level": phrase.get("reliability_level"),
        "data_quality_status": phrase.get("data_quality_status"),
        "evidence_snippet_id": phrase.get("evidence_snippet_id"),
        "notes": phrase.get("notes", ""),
    }


def build_chart_preview(
    frequency_series: dict[str, Any],
    phrase_series: dict[str, Any],
    semantic_categories: dict[str, Any],
    timeline_events: dict[str, Any],
    snippet_samples: dict[str, Any],
    reference_notes: dict[str, Any],
) -> dict[str, Any]:
    failed_sources = reference_notes.get("failed_or_unavailable_sources", [])
    sparse_terms = reference_notes.get("sparse_or_missing_terms", [])
    return {
        "metadata": {
            "word": "hub",
            "generated_at": utc_now(),
            "generated_by_script": "scripts/process_hub_data.py",
            "source_summary": [
                "Google Books Ngram Viewer for long-run printed-book frequency signals.",
                "Dictionary and etymology pages for paraphrased sense inventory and date leads.",
                "loc.gov Chronicling America OCR descriptions, Google Books API textSnippets, Internet Archive full-text files, and legacy Chronicling America OCR search for snippet candidates where available.",
            ],
            "limitations": [
                "This is a raw/processed data foundation, not final chart copy.",
                "Ngram values are not sense-disambiguated.",
                "OCR snippets can contain recognition and dating errors.",
                "Modern digital/platform uses need additional contemporary corpus validation.",
            ],
        },
        "frequency_series": frequency_series,
        "phrase_series": {
            "metadata": phrase_series.get("metadata", {}),
            "phrases": [compact_phrase_for_preview(phrase) for phrase in phrase_series.get("phrases", [])],
        },
        "semantic_categories": semantic_categories,
        "timeline_events": timeline_events,
        "snippet_samples": snippet_samples,
        "data_quality_notes": {
            "failed_or_unavailable_sources": failed_sources,
            "sparse_or_missing_terms": sparse_terms,
            "review_flags": [
                "Treat first nonzero Ngram years for modern phrases as search leads only.",
                "Prefer phrase trends and snippets together when choosing future chart anchors.",
                "Do not collapse physical, place, transport, network, institutional, and digital senses into a single technology story.",
            ],
        },
    }


def source_status(dictionary_raw: dict[str, Any]) -> list[dict[str, Any]]:
    rows = []
    for source in dictionary_raw.get("sources", []):
        known_live_issue = None
        if source.get("id") == "collins_hub":
            known_live_issue = "Live attempt returned HTTP 403 Forbidden; source preserved for manual review."
        rows.append(
            {
                "id": source.get("id"),
                "source_name": source.get("source_name"),
                "url": source.get("url"),
                "access_status": source.get("access_status"),
                "http_status": source.get("http_status"),
                "error": source.get("error"),
                "known_live_issue": known_live_issue,
            }
        )
    return rows


def corpus_source_status(snippets_raw: dict[str, Any]) -> list[dict[str, Any]]:
    layer_specs = [
        ("legacy_chronicling_america", "Legacy Chronicling America API", snippets_raw.get("chronicling_america", {})),
        ("loc_chronicling_america", "loc.gov Chronicling America search", snippets_raw.get("loc_chronicling_america", {})),
        ("internet_archive", "Internet Archive", snippets_raw.get("internet_archive", {})),
        ("google_books", "Google Books API", snippets_raw.get("google_books", {})),
    ]
    rows = []
    snippets = snippets_raw.get("snippets", [])
    for layer_id, label, payload in layer_specs:
        queries = payload.get("collection_queries", []) if isinstance(payload, dict) else []
        access_log = payload.get("access_log", []) if isinstance(payload, dict) else []
        query_errors = [query for query in queries if query.get("errors")]
        access_failures = [entry for entry in access_log if not entry.get("ok")]
        snippet_count = sum(
            1
            for snippet in snippets
            if (
                (layer_id == "legacy_chronicling_america" and snippet.get("snippet_id", "").startswith("hub_chronicling_"))
                or (layer_id == "loc_chronicling_america" and snippet.get("snippet_id", "").startswith("hub_loc_chronicling_"))
                or (layer_id == "internet_archive" and snippet.get("snippet_id", "").startswith("hub_internet_archive_"))
                or (layer_id == "google_books" and snippet.get("snippet_id", "").startswith("hub_google_books_"))
            )
        )
        if snippet_count:
            status = "partial"
        elif query_errors or access_failures:
            status = "failed_or_unavailable"
        else:
            status = "no_results"
        known_live_issue = None
        if layer_id == "legacy_chronicling_america":
            known_live_issue = "Live attempts returned HTTP 404 from the legacy chroniclingamerica.loc.gov search endpoint; loc.gov search was used instead."
        elif layer_id == "google_books":
            known_live_issue = "Live attempts returned HTTP 429 rate limiting; no Google Books snippets were collected in this pass."
        rows.append(
            {
                "id": layer_id,
                "label": label,
                "status": status,
                "queries_attempted": len(queries),
                "snippets_collected": snippet_count,
                "queries_with_errors": len(query_errors),
                "access_failures": len(access_failures),
                "sample_error": (query_errors[0].get("errors") or [None])[0] if query_errors else None,
                "known_live_issue": known_live_issue,
            }
        )
    return rows


def promising_phrases(phrase_series: dict[str, Any], limit: int = 20) -> list[dict[str, Any]]:
    phrases = phrase_series.get("phrases", [])
    ranked = sorted(
        phrases,
        key=lambda phrase: (
            phrase.get("reliability_level") == "high",
            phrase.get("approximate_frequency_signal", {}).get("peak_frequency_per_million", 0),
        ),
        reverse=True,
    )
    return [
        {
            "phrase": phrase["phrase"],
            "category": phrase["category"],
            "peak_frequency_per_million": phrase.get("approximate_frequency_signal", {}).get(
                "peak_frequency_per_million", 0
            ),
            "peak_year": phrase.get("approximate_frequency_signal", {}).get("peak_year"),
            "first_signal_year": phrase.get("earliest_found_year"),
            "data_quality_status": phrase.get("data_quality_status"),
            "reliability_level": phrase.get("reliability_level"),
        }
        for phrase in ranked[:limit]
    ]


def build_report(
    ngram_raw: dict[str, Any],
    dictionary_raw: dict[str, Any],
    snippets_raw: dict[str, Any],
    phrase_series: dict[str, Any],
    semantic_categories: dict[str, Any],
    timeline_events: dict[str, Any],
    snippet_samples: dict[str, Any],
    reference_notes: dict[str, Any],
    outputs: dict[str, str],
) -> dict[str, Any]:
    collected_terms = [result for result in ngram_raw.get("results", []) if result.get("status") == "collected"]
    missing_terms = [
        result for result in ngram_raw.get("results", []) if result.get("status") in {"missing", "too_sparse", "error"}
    ]
    category_support_rows = [
        {
            "id": category["id"],
            "label": category["label"],
            **category["evidence_support"],
        }
        for category in semantic_categories.get("categories", [])
    ]
    dictionary_failed_count = sum(1 for source in dictionary_raw.get("sources", []) if source.get("access_status") != "collected")
    corpus_status = corpus_source_status(snippets_raw)
    corpus_layers_with_failures = sum(1 for layer in corpus_status if layer["queries_with_errors"] or layer["access_failures"])

    return {
        "metadata": {
            "word": "hub",
            "generated_at": utc_now(),
            "generated_by_script": "scripts/process_hub_data.py",
        },
        "counts": {
            "terms_attempted": len(ngram_raw.get("results", [])),
            "terms_collected": len(collected_terms),
            "phrase_candidates": len(phrase_series.get("phrases", [])),
            "snippets": len(snippet_samples.get("snippets", [])),
            "semantic_categories": len(semantic_categories.get("categories", [])),
            "timeline_events": len(timeline_events.get("events", [])),
            "missing_or_failed_sources": dictionary_failed_count + corpus_layers_with_failures,
            "sparse_or_missing_terms": len(missing_terms),
        },
        "source_status": source_status(dictionary_raw),
        "corpus_source_status": corpus_status,
        "promising_phrases": promising_phrases(phrase_series),
        "sparse_or_uncertain_terms": [
            {
                "term": result.get("term"),
                "status": result.get("status"),
                "notes": result.get("notes"),
                "error": result.get("error"),
            }
            for result in missing_terms
        ],
        "semantic_category_support": category_support_rows,
        "outputs": outputs,
        "rerun_commands": [
            "python3 scripts/scrape_hub_data.py",
            "python3 scripts/process_hub_data.py",
        ],
        "next_research_questions": [
            "Which early central-place snippets are strong enough to separate Boston-style civic hub from generic 'center' language?",
            "When does transport hub become stronger than railroad/railway hub in printed-book visibility?",
            "Which hub-and-spoke evidence belongs to transport systems versus computing/network architecture?",
            "Which modern phrases are meaningful for the future page: data hub, content hub, innovation hub, or digital hub?",
            "Can COHA/COCA/NOW or another contemporary corpus validate recent platform and institutional uses better than books?",
        ],
    }


def markdown_report(report: dict[str, Any]) -> str:
    counts = report["counts"]
    source_lines = [
        f"- {source['source_name']}: {source['access_status']}"
        + (f" ({source['error']})" if source.get("error") else "")
        + (f"; note: {source['known_live_issue']}" if source.get("known_live_issue") else "")
        for source in report["source_status"]
    ]
    corpus_lines = [
        f"- {layer['label']}: {layer['status']}; {layer['snippets_collected']} snippets; {layer['queries_with_errors']} query errors; {layer['access_failures']} access failures"
        + (f"; sample: {layer['sample_error']}" if layer.get("sample_error") else "")
        + (f"; note: {layer['known_live_issue']}" if layer.get("known_live_issue") else "")
        for layer in report["corpus_source_status"]
    ]
    promising_lines = [
        f"- {item['phrase']} ({item['category']}): peak {item['peak_frequency_per_million']} per million in {item['peak_year']}; {item['data_quality_status']}"
        for item in report["promising_phrases"][:14]
    ]
    sparse_lines = [
        f"- {item['term']}: {item['status']}; {item.get('notes') or item.get('error') or 'review'}"
        for item in report["sparse_or_uncertain_terms"][:30]
    ]
    category_lines = [
        f"- {item['label']}: {item['support_level']} support; {item['phrase_count']} phrases; {item['snippet_count']} snippets"
        for item in report["semantic_category_support"]
    ]
    output_lines = [f"- `{path}`" for path in report["outputs"].values()]

    return f"""# Hub Data Collection Report

Generated: {report['metadata']['generated_at']}

## What Was Collected

- Ngram terms attempted: {counts['terms_attempted']}
- Ngram terms collected: {counts['terms_collected']}
- Phrase candidates: {counts['phrase_candidates']}
- Snippet samples: {counts['snippets']}
- Semantic categories: {counts['semantic_categories']}
- Timeline scaffold events: {counts['timeline_events']}
- Failed/unavailable source layers: {counts['missing_or_failed_sources']}

## Sources Used

{chr(10).join(source_lines) if source_lines else "- None"}

Primary frequency source: Google Books Ngram Viewer, English corpus, 1800-2022, smoothing 0, case-insensitive aggregate rows where available.

Historical snippet sources: loc.gov Chronicling America OCR descriptions, Google Books API textSnippets, Internet Archive full-text files, attempted legacy Chronicling America OCR search, plus short paraphrased reference snippets from dictionary/etymology sources. OCR/text snippets are review candidates, not final copy.

## Corpus Source Status

{chr(10).join(corpus_lines) if corpus_lines else "- None"}

## Scripts Created

- `scripts/scrape_hub_data.py`: fetches/caches Ngram, reference-source status, phrase candidates, and snippet candidates.
- `scripts/process_hub_data.py`: normalizes raw data into processed JSON, chart-preview JSON, and this report.

## How To Rerun

```bash
python3 scripts/scrape_hub_data.py
python3 scripts/process_hub_data.py
```

## Reliable Data

- The core `hub` and `hubs` Ngram lines are strong frequency baselines.
- Mechanical phrases such as `wheel hub`, `hub cap`, and `hubcap` preserve the older physical sense.
- Transport, institutional, network, and digital phrases are useful as trend candidates when paired with snippets.
- Dictionary-source records are paraphrased sense inventories and access logs, not polished definitions.

## Sparse Or Uncertain Data

{chr(10).join(sparse_lines) if sparse_lines else "- None flagged"}

## Promising Phrases For Later Visualization

{chr(10).join(promising_lines) if promising_lines else "- None yet"}

## Supported Semantic Categories

{chr(10).join(category_lines)}

## Outputs

{chr(10).join(output_lines)}

## Suggested Next Research Questions

{chr(10).join(f"- {item}" for item in report['next_research_questions'])}

## Limitations

- This is a data pass only; no final chart choice or narrative copy is implied.
- Ngram is not sense-disambiguated and may surface early noisy phrase hits.
- Google Books, Internet Archive, and Chronicling America OCR/text snippets need source verification before final use.
- Modern digital/platform language probably needs contemporary corpus or web evidence beyond books.
"""


def validate_expected_outputs(paths: list[Path]) -> list[str]:
    errors = []
    for path in paths:
        if not path.exists():
            errors.append(f"Missing expected file: {path}")
            continue
        try:
            json.loads(path.read_text(encoding="utf-8"))
        except json.JSONDecodeError as exc:
            errors.append(f"Invalid JSON in {path}: {exc}")
    return errors


def main() -> None:
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    GENERATED_DIR.mkdir(parents=True, exist_ok=True)

    ngram_raw = load_json(RAW_DIR / "hub_ngram_raw.json")
    phrase_raw = load_json(RAW_DIR / "hub_phrase_candidates_raw.json")
    dictionary_raw = load_json(RAW_DIR / "hub_dictionary_sources_raw.json")
    snippets_raw = load_json(RAW_DIR / "hub_corpus_snippets_raw.json")
    reference_notes = load_json(RAW_DIR / "hub_reference_notes_raw.json")

    snippet_samples = build_snippet_samples(snippets_raw)
    frequency_series = build_frequency_series(ngram_raw)
    phrase_series = build_phrase_series(phrase_raw, frequency_series, snippet_samples.get("snippets", []))
    semantic_categories = build_semantic_categories(phrase_series, snippet_samples.get("snippets", []))
    timeline_events = build_timeline_events(phrase_series, snippet_samples.get("snippets", []))
    chart_preview = build_chart_preview(
        frequency_series,
        phrase_series,
        semantic_categories,
        timeline_events,
        snippet_samples,
        reference_notes,
    )

    outputs = {
        "frequency_series": str((PROCESSED_DIR / "hub_frequency_series.json").relative_to(ROOT)),
        "phrase_series": str((PROCESSED_DIR / "hub_phrase_series.json").relative_to(ROOT)),
        "semantic_categories": str((PROCESSED_DIR / "hub_semantic_categories.json").relative_to(ROOT)),
        "timeline_events": str((PROCESSED_DIR / "hub_timeline_events.json").relative_to(ROOT)),
        "snippet_samples": str((PROCESSED_DIR / "hub_snippet_samples.json").relative_to(ROOT)),
        "chart_data_preview": str((PROCESSED_DIR / "hub_chart_data_preview.json").relative_to(ROOT)),
        "generated_chart_data_preview": str((GENERATED_DIR / "hub_chart_data_preview.json").relative_to(ROOT)),
        "report_md": str((REPORTS_DIR / "hub_data_collection_report.md").relative_to(ROOT)),
        "report_json": str((REPORTS_DIR / "hub_data_collection_report.json").relative_to(ROOT)),
    }
    report = build_report(
        ngram_raw,
        dictionary_raw,
        snippets_raw,
        phrase_series,
        semantic_categories,
        timeline_events,
        snippet_samples,
        reference_notes,
        outputs,
    )

    write_json(PROCESSED_DIR / "hub_frequency_series.json", frequency_series)
    write_json(PROCESSED_DIR / "hub_phrase_series.json", phrase_series)
    write_json(PROCESSED_DIR / "hub_semantic_categories.json", semantic_categories)
    write_json(PROCESSED_DIR / "hub_timeline_events.json", timeline_events)
    write_json(PROCESSED_DIR / "hub_snippet_samples.json", snippet_samples)
    write_json(PROCESSED_DIR / "hub_chart_data_preview.json", chart_preview)
    write_json(GENERATED_DIR / "hub_chart_data_preview.json", chart_preview)
    write_json(REPORTS_DIR / "hub_data_collection_report.json", report)
    (REPORTS_DIR / "hub_data_collection_report.md").write_text(markdown_report(report), encoding="utf-8")

    expected_json = [
        PROCESSED_DIR / "hub_frequency_series.json",
        PROCESSED_DIR / "hub_phrase_series.json",
        PROCESSED_DIR / "hub_semantic_categories.json",
        PROCESSED_DIR / "hub_timeline_events.json",
        PROCESSED_DIR / "hub_snippet_samples.json",
        PROCESSED_DIR / "hub_chart_data_preview.json",
        GENERATED_DIR / "hub_chart_data_preview.json",
        REPORTS_DIR / "hub_data_collection_report.json",
    ]
    validation_errors = validate_expected_outputs(expected_json)
    if validation_errors:
        raise SystemExit("\n".join(validation_errors))

    counts = report["counts"]
    print("Hub processing summary")
    print(f"- Terms collected: {counts['terms_collected']}/{counts['terms_attempted']}")
    print(f"- Phrase candidates: {counts['phrase_candidates']}")
    print(f"- Snippets: {counts['snippets']}")
    print(f"- Semantic categories: {counts['semantic_categories']}")
    print(f"- Timeline events: {counts['timeline_events']}")
    print(f"- Missing or failed sources: {counts['missing_or_failed_sources']}")
    print("- Output file paths:")
    for path in outputs.values():
        print(f"  - {path}")


if __name__ == "__main__":
    main()
