#!/usr/bin/env python3
"""Collect first-pass attention/click proxy signals for privacy-related concepts."""

from __future__ import annotations

import json
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

WORD = "privacy"
LAYER_ID = "attention_metrics"
RAW_PATH = RAW_DIR / "privacy_attention_metrics_raw.json"

USER_AGENT = "WordsOverTime/0.1 privacy attention metrics pass; contact: local research script"
REQUEST_DELAY_SECONDS = 0.35

PAGEVIEWS_START = "2016010100"
PAGEVIEWS_END = "2026030100"
PAGEVIEW_SOURCE = "https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/all-access/user/"

TRACKED_PAGES = [
    {"page": "Privacy", "label": "Privacy"},
    {"page": "Internet_privacy", "label": "Internet privacy"},
    {"page": "Information_privacy", "label": "Information privacy"},
    {"page": "Data_privacy", "label": "Data privacy"},
    {"page": "Privacy_policy", "label": "Privacy policy"},
    {"page": "Right_to_privacy", "label": "Right to privacy"},
    {"page": "Surveillance", "label": "Surveillance"},
    {"page": "General_data_protection_regulation", "label": "GDPR"},
    {"page": "California_Consumer_Privacy_Act", "label": "CCPA"},
    {"page": "Data_breach", "label": "Data breach"},
    {"page": "Digital_rights", "label": "Digital rights"},
]

KNOWN_EVENT_ANCHORS = [
    {
        "label": "1988 - U.S. Privacy Act enforcement era visibility growth in federal record privacy language.",
        "date": "1988-01-01",
        "category": "policy",
        "confidence": "medium",
    },
    {
        "label": "2013 - Mass-surveillance disclosures increase public interest in privacy and surveillance topics.",
        "date": "2013-06-01",
        "category": "attention",
        "confidence": "medium",
    },
    {
        "label": "2018 - GDPR launches practical policy discourse in public and platform communication.",
        "date": "2018-05-25",
        "category": "policy",
        "confidence": "high",
    },
    {
        "label": "2020 - CCPA becomes active and enters consumer-facing privacy coverage.",
        "date": "2020-01-01",
        "category": "policy",
        "confidence": "medium",
    },
    {
        "label": "2020-2024 - Platform settings and privacy controls become major coverage topics.",
        "date": "2020-06-01",
        "category": "attention",
        "confidence": "low",
    },
]


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def normalize_title(page: str) -> str:
    return urllib.parse.quote(page.replace(" ", "_"), safe="_")


def write_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def fetch_json(url: str) -> tuple[dict[str, Any] | None, str | None, int | None]:
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT, "Accept": "application/json"})
    try:
        with urllib.request.urlopen(request, timeout=25) as response:
            body = response.read().decode("utf-8", errors="replace")
            payload = json.loads(body)
            return payload, None, getattr(response, "status", None)
    except urllib.error.HTTPError as exc:
        return None, f"HTTPError {exc.code} {exc.reason}", getattr(exc, "code", None)
    except urllib.error.URLError as exc:
        return None, f"URLError: {exc.reason}", None
    except (OSError, json.JSONDecodeError) as exc:
        return None, f"{type(exc).__name__}: {exc}", None


def aggregate_yearly(items: list[dict[str, Any]]) -> list[dict[str, Any]]:
    totals: dict[str, int] = {}
    for item in items:
        timestamp = str(item.get("timestamp", ""))
        if len(timestamp) < 4:
            continue
        year = timestamp[:4]
        try:
            views = int(item.get("views", 0) or 0)
        except (TypeError, ValueError):
            views = 0
        totals[year] = totals.get(year, 0) + views
    return [{"date": year, "views": int(value)} for year, value in sorted(totals.items(), key=lambda i: i[0])]


def clean_pageviews_text(payload: dict[str, Any]) -> dict[str, Any]:
    items = payload.get("items", [])
    yearly = aggregate_yearly(items if isinstance(items, list) else [])
    return {
        "monthly_count": len(items) if isinstance(items, list) else 0,
        "yearly_series": yearly,
        "total_views": sum(item["views"] for item in yearly),
    }


def fetch_pageview_page(page: str) -> dict[str, Any]:
    title = normalize_title(page)
    url = f"{PAGEVIEW_SOURCE}{title}/monthly/{PAGEVIEWS_START}/{PAGEVIEWS_END}"
    payload, error, status = fetch_json(url)
    source_log = {
        "label": page,
        "source": "wikimedia_pageviews",
        "url": url,
        "status": "ok" if payload is not None else "failed",
        "status_code": status,
        "error": error,
        "retrieved_at": utc_now(),
        "records": 0,
        "total_views": 0,
    }
    if payload is None:
        return {
            "label": page,
            "page": page,
            "series": [],
            "total_views": 0,
            "available": False,
            "source_log": source_log,
            "notes": error,
        }

    cleaned = clean_pageviews_text(payload)
    source_log["records"] = cleaned["monthly_count"]
    source_log["total_views"] = cleaned["total_views"]
    return {
        "label": page,
        "page": page,
        "series": cleaned["yearly_series"],
        "total_views": cleaned["total_views"],
        "available": True,
        "source_log": source_log,
        "notes": None,
    }


def detect_source_state(logs: list[dict[str, Any]]) -> list[dict[str, Any]]:
    sources = []
    counts = Counter("ok" if item["available"] else "failed" for item in logs)
    for item in logs:
        sources.append(
            {
                "source_id": "wikipedia_pageviews",
                "source_label": "Wikimedia REST pageviews",
                "source_status": "ok" if item["available"] else "failed",
                "source_url": f"{PAGEVIEW_SOURCE}{normalize_title(item['page'])}/monthly/{PAGEVIEWS_START}/{PAGEVIEWS_END}",
                "page": item["page"],
                "status_code": item["source_log"].get("status_code"),
                "retrieved_at": item["source_log"]["retrieved_at"],
                "records": item["source_log"]["records"],
                "total_views": item["source_log"]["total_views"],
                "error": item["source_log"]["error"],
            }
        )
    return sources, dict(counts)


def collect_rows() -> tuple[list[dict[str, Any]], list[dict[str, Any]], list[dict[str, Any]]]:
    series_rows = []
    source_logs = []
    for page in TRACKED_PAGES:
        row = fetch_pageview_page(page["page"])
        series_rows.append(row)
        source_logs.append(row["source_log"])
    sources, counts = detect_source_state(series_rows)
    unavailable = [item for item in source_logs if item.get("status") == "failed"]

    events = []
    for anchor in KNOWN_EVENT_ANCHORS:
        events.append(
            {
                "date": anchor["date"],
                "label": anchor["label"],
                "category": anchor["category"],
                "source": "privacy_research_context",
                "confidence": anchor["confidence"],
            }
        )

    # Keep explicit no-automatic-source placeholders for methods the project does not
    # pull reliably here.
    additional_unavailable = [
        {
            "source_id": "google_trends",
            "source": "Google Trends",
            "availability": "not_fetched",
            "reason": "No stable official public API available in this environment.",
        },
        {
            "source_id": "now_corpus",
            "source": "NOW Corpus",
            "availability": "not_fetched",
            "reason": "Requires paid/managed access or exports outside this environment.",
        },
        {
            "source_id": "coca",
            "source": "COCA",
            "availability": "not_fetched",
            "reason": "No public API in this environment.",
        },
    ]

    source_audit = {
        "requested_source_ids": ["wikipedia_pageviews", "google_trends", "now_corpus", "coca"],
        "result_counts": counts,
        "unavailable": unavailable,
        "additional_unavailable": additional_unavailable,
        "notes": "Pageviews are treated as public attention proxies, not direct usage counts.",
    }
    return series_rows, events, source_audit


def main() -> None:
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    series_rows, events, source_audit = collect_rows()
    sources = list(source_audit.get("requested_source_ids", [])) if source_audit else []
    payload = {
        "metadata": {
            "word": WORD,
            "layer_id": LAYER_ID,
            "title": "Privacy attention and clicks proxy layer",
            "generated_at": utc_now(),
            "generated_by_script": "scripts/scrape_privacy_attention_metrics.py",
            "tracking_pages": TRACKED_PAGES,
            "source_window": {
                "monthly_start": PAGEVIEWS_START,
                "monthly_end": PAGEVIEWS_END,
                "granularity": "monthly pageviews aggregated to yearly totals",
            },
        },
        "series_rows": series_rows,
        "events": events,
        "source_audit": source_audit,
        "sources": sources,
    }
    write_json(RAW_PATH, payload)

    print("Privacy attention metrics scrape summary")
    print(f"- Pages requested: {len(TRACKED_PAGES)}")
    print(f"- Pages with data: {len([row for row in series_rows if row['available']])}")
    print(f"- Failed sources: {len([row for row in series_rows if not row['available']])}")
    print(f"- Raw output: {RAW_PATH}")


if __name__ == "__main__":
    main()
