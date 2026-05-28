#!/usr/bin/env python3
"""Collect demographic context for the privacy geo layer.

This fetches broad, reproducible country-level data that can support a later
02C visual comparing recovered privacy signal with population and life
expectancy. It preserves raw World Bank responses and does not interpret the
relationship as causal.
"""

from __future__ import annotations

import json
import sys
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
RAW_DIR = ROOT / "docs" / "research" / "privacy" / "raw"
RAW_PATH = RAW_DIR / "privacy_geo_demographic_context_raw.json"

WORD = "privacy"
LAYER_ID = "geo_demographic_context"
USER_AGENT = "WordsOverTime/1.0 privacy geo demographic context"

WORLD_BANK_BASE = "https://api.worldbank.org/v2"
OWID_GRAPHER_BASE = "https://ourworldindata.org/grapher"
INDICATORS = {
    "population_total": {
        "indicator": "SP.POP.TOTL",
        "label": "Population, total",
        "source_type": "population_context",
    },
    "life_expectancy_total": {
        "indicator": "SP.DYN.LE00.IN",
        "label": "Life expectancy at birth, total years",
        "source_type": "life_expectancy_context",
    },
    "internet_users_percent": {
        "indicator": "IT.NET.USER.ZS",
        "label": "Individuals using the Internet (% of population)",
        "source_type": "digital_access_context",
    },
    "urban_population_percent": {
        "indicator": "SP.URB.TOTL.IN.ZS",
        "label": "Urban population (% of total population)",
        "source_type": "urbanization_context",
    },
}
OWID_FALLBACKS = {
    "owid_life_expectancy": {
        "url": f"{OWID_GRAPHER_BASE}/life-expectancy.csv",
        "source_type": "life_expectancy_context_fallback",
        "role": "Fallback life expectancy values for places not covered by World Bank joins.",
    },
    "owid_population": {
        "url": f"{OWID_GRAPHER_BASE}/population.csv",
        "source_type": "population_context_fallback",
        "role": "Fallback population values for places not covered by World Bank joins.",
    },
}


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def fetch_json(url: str) -> Any:
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(request, timeout=45) as response:
        charset = response.headers.get_content_charset() or "utf-8"
        return json.loads(response.read().decode(charset))


def fetch_source(url: str, source_id: str, payload: dict[str, Any]) -> None:
    try:
        data = fetch_json(url)
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as error:
        payload["failures"].append(
            {
                "source_id": source_id,
                "url": url,
                "error": str(error),
                "retrieved": False,
            }
        )
        return

    payload["responses"][source_id] = {
        "url": url,
        "retrieved": True,
        "response": data,
    }


def fetch_text_source(url: str, source_id: str, payload: dict[str, Any]) -> None:
    request = urllib.request.Request(url, headers={"User-Agent": f"Mozilla/5.0 {USER_AGENT}"})
    try:
        with urllib.request.urlopen(request, timeout=45) as response:
            charset = response.headers.get_content_charset() or "utf-8"
            text = response.read().decode(charset)
    except (urllib.error.URLError, TimeoutError, UnicodeDecodeError) as error:
        payload["failures"].append(
            {
                "source_id": source_id,
                "url": url,
                "error": str(error),
                "retrieved": False,
            }
        )
        return

    payload["responses"][source_id] = {
        "url": url,
        "retrieved": True,
        "format": "csv",
        "response": text,
    }


def main() -> int:
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    payload: dict[str, Any] = {
        "word": WORD,
        "layer_id": LAYER_ID,
        "status": "raw_source_attempt",
        "intended_use": "available_for_chart02c_population_life_expectancy_context",
        "accessed_at": utc_now(),
        "sources": [
            {
                "source_id": "privacy_geo_attention_map",
                "source_type": "recovered_privacy_signal",
                "path": "src/data/generated/privacy_geo_attention_map.json",
                "role": "Country-level privacy signal to join with demographic context.",
            },
            {
                "source_id": "world_bank_country_metadata",
                "source_type": "country_metadata",
                "url": f"{WORLD_BANK_BASE}/country?format=json&per_page=400",
                "role": "Country names, ISO codes, region, and income labels.",
            },
            *[
                {
                    "source_id": f"world_bank_{key}",
                    "source_type": meta["source_type"],
                    "indicator": meta["indicator"],
                    "url": f"{WORLD_BANK_BASE}/country/all/indicator/{meta['indicator']}?format=json&per_page=20000",
                    "role": meta["label"],
                }
                for key, meta in INDICATORS.items()
            ],
            *[
                {
                    "source_id": key,
                    "source_type": meta["source_type"],
                    "url": meta["url"],
                    "role": meta["role"],
                }
                for key, meta in OWID_FALLBACKS.items()
            ],
        ],
        "responses": {},
        "failures": [],
        "notes": [
            "World Bank values are country-level context, not privacy search demand.",
            "This layer supports a conceptual comparison with recovered source signals, not a fitted causal model.",
        ],
    }

    fetch_source(f"{WORLD_BANK_BASE}/country?format=json&per_page=400", "world_bank_country_metadata", payload)
    for key, meta in INDICATORS.items():
        url = f"{WORLD_BANK_BASE}/country/all/indicator/{meta['indicator']}?format=json&per_page=20000"
        fetch_source(url, f"world_bank_{key}", payload)
    for key, meta in OWID_FALLBACKS.items():
        fetch_text_source(meta["url"], key, payload)

    payload["status"] = "raw_collected_partial" if payload["failures"] else "raw_collected"
    RAW_PATH.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    print("Privacy geo demographic context scrape summary")
    print(f"- Sources attempted: {1 + len(INDICATORS) + len(OWID_FALLBACKS)}")
    print(f"- Sources recovered: {len(payload['responses'])}")
    print(f"- Source failures: {len(payload['failures'])}")
    print(f"- Raw output: {RAW_PATH}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
