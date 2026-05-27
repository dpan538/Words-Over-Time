#!/usr/bin/env python3
"""Collect source-attempt metadata for privacy's 1890-1950 legal-injury layer."""

from __future__ import annotations

import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parents[1]
RESEARCH_DIR = ROOT / "docs" / "research" / "privacy"
RAW_DIR = RESEARCH_DIR / "raw"
RAW_PATH = RAW_DIR / "privacy_legal_injury_matrix_raw.json"

USER_AGENT = "WordsOverTime/0.1 privacy legal injury research; contact: local research script"


SOURCE_ANCHORS: list[dict[str, Any]] = [
    {
        "anchor_id": "privacy_1890_warren_brandeis",
        "year": 1890,
        "label": "The Right to Privacy",
        "branch_id": "right_articulated",
        "source_title": "Warren and Brandeis, The Right to Privacy",
        "source_url": "https://en.wikisource.org/wiki/The_Right_to_Privacy",
        "description": "A law-review article frames privacy as a right against unwanted publicity and intrusion.",
        "evidence_type": "legal_article",
        "strength": 5,
        "confidence": "high",
    },
    {
        "anchor_id": "privacy_1902_roberson",
        "year": 1902,
        "label": "Roberson v. Rochester Folding Box Co.",
        "branch_id": "publicity_press",
        "source_title": "Roberson v. Rochester Folding Box Co.",
        "source_url": "https://law.justia.com/cases/new-york/court-of-appeals/1902/171-n-y-538-3591680.html",
        "description": "A widely cited New York case rejects a common-law privacy claim after unauthorized use of a person's image.",
        "evidence_type": "case_law",
        "strength": 3,
        "confidence": "medium",
    },
    {
        "anchor_id": "privacy_1903_new_york_name_picture",
        "year": 1903,
        "label": "New York name and picture statute",
        "branch_id": "name_likeness",
        "source_title": "New York Civil Rights Law sections 50 and 51",
        "source_url": "https://www.nysenate.gov/legislation/laws/CVR/50",
        "description": "New York's statutory privacy response protects against unauthorized use of name, portrait, or picture.",
        "evidence_type": "statute",
        "strength": 4,
        "confidence": "medium",
    },
    {
        "anchor_id": "privacy_1905_pavesich",
        "year": 1905,
        "label": "Pavesich recognizes privacy injury",
        "branch_id": "tort_injury",
        "source_title": "Pavesich v. New England Life Insurance Co.",
        "source_url": "https://law.justia.com/cases/georgia/supreme-court/1905/122-ga-190-1.html",
        "description": "A Georgia decision is commonly treated as early recognition of a privacy right against unauthorized commercial image use.",
        "evidence_type": "case_law",
        "strength": 4,
        "confidence": "medium",
    },
    {
        "anchor_id": "privacy_1928_olmstead",
        "year": 1928,
        "label": "Olmstead dissent",
        "branch_id": "constitutional_surveillance",
        "source_title": "Olmstead v. United States",
        "source_url": "https://supreme.justia.com/cases/federal/us/277/438/",
        "description": "Brandeis's dissent links privacy to constitutional limits on surveillance and the right to be let alone.",
        "evidence_type": "case_law_dissent",
        "strength": 5,
        "confidence": "high",
    },
    {
        "anchor_id": "privacy_1931_melvin",
        "year": 1931,
        "label": "Melvin v. Reid",
        "branch_id": "tort_injury",
        "source_title": "Melvin v. Reid",
        "source_url": "https://www.courtlistener.com/opinion/3285175/melvin-v-reid/",
        "description": "A California case is often cited in privacy tort history around disclosure, reputation, and renewed public exposure.",
        "evidence_type": "case_law",
        "strength": 3,
        "confidence": "medium",
    },
    {
        "anchor_id": "privacy_1939_restatement",
        "year": 1939,
        "label": "Restatement privacy tort language",
        "branch_id": "tort_injury",
        "source_title": "Restatement (First) of Torts privacy reference",
        "source_url": "https://www.law.cornell.edu/wex/invasion_of_privacy",
        "description": "Privacy becomes increasingly legible as tort injury vocabulary in legal summaries and doctrine.",
        "evidence_type": "legal_doctrine",
        "strength": 3,
        "confidence": "medium",
    },
    {
        "anchor_id": "privacy_1940_sidis",
        "year": 1940,
        "label": "Sidis and newsworthiness",
        "branch_id": "publicity_press",
        "source_title": "Sidis v. F-R Publishing Corp.",
        "source_url": "https://www.courtlistener.com/opinion/1506784/sidis-v-f-r-pub-corporation/",
        "description": "A public-interest/newsworthiness case marks tension between privacy claims and publicity or press coverage.",
        "evidence_type": "case_law",
        "strength": 3,
        "confidence": "medium",
    },
    {
        "anchor_id": "privacy_1948_udhr",
        "year": 1948,
        "label": "UDHR Article 12",
        "branch_id": "human_rights",
        "source_title": "Universal Declaration of Human Rights",
        "source_url": "https://www.un.org/en/about-us/universal-declaration-of-human-rights",
        "description": "International human-rights language protects against arbitrary interference with privacy, family, home, and correspondence.",
        "evidence_type": "human_rights",
        "strength": 5,
        "confidence": "high",
    },
    {
        "anchor_id": "privacy_1950_echr_article_8",
        "year": 1950,
        "label": "ECHR Article 8",
        "branch_id": "human_rights",
        "source_title": "European Convention on Human Rights, Article 8",
        "source_url": "https://www.echr.coe.int/documents/d/echr/convention_ENG",
        "description": "European rights language protects private and family life, home, and correspondence.",
        "evidence_type": "human_rights",
        "strength": 4,
        "confidence": "high",
    },
]


def fetch_source(anchor: dict[str, Any]) -> dict[str, Any]:
    url = anchor["source_url"]
    log: dict[str, Any] = {
        "anchor_id": anchor["anchor_id"],
        "url": url,
        "checked_at": datetime.now(timezone.utc).isoformat(),
    }
    try:
        request = Request(url, headers={"User-Agent": USER_AGENT})
        with urlopen(request, timeout=18) as response:
            raw = response.read(240_000)
            text = raw.decode("utf-8", errors="replace")
            title_match = re.search(r"<title[^>]*>(.*?)</title>", text, re.I | re.S)
            title = re.sub(r"\s+", " ", title_match.group(1)).strip() if title_match else ""
            log.update(
                {
                    "reachable": True,
                    "status": getattr(response, "status", None),
                    "content_type": response.headers.get("content-type"),
                    "bytes_sampled": len(raw),
                    "html_title": title,
                    "contains_privacy": "privacy" in text.lower(),
                    "contains_right": "right" in text.lower(),
                }
            )
    except HTTPError as exc:
        log.update({"reachable": False, "status": exc.code, "error": f"HTTPError {exc.code}: {exc.reason}"})
    except URLError as exc:
        log.update({"reachable": False, "status": None, "error": f"URLError: {exc.reason}"})
    except Exception as exc:  # noqa: BLE001 - clear research failure logging is desired here.
        log.update({"reachable": False, "status": None, "error": f"{type(exc).__name__}: {exc}"})
    return log


def main() -> int:
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    source_attempts = [fetch_source(anchor) for anchor in SOURCE_ANCHORS]
    payload = {
        "word": "privacy",
        "layer_id": "legal_injury_matrix",
        "status": "raw_source_attempts",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "generated_by_script": "scripts/scrape_privacy_legal_injury_matrix.py",
        "anchors": SOURCE_ANCHORS,
        "source_attempts": source_attempts,
        "failed_sources": [attempt for attempt in source_attempts if not attempt.get("reachable")],
        "notes": [
            "This layer supports privacy chart 01B, not a separate chart number.",
            "Source attempts preserve reachability metadata; processing adds phrase-frequency signals from existing privacy layers.",
        ],
    }
    RAW_PATH.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Wrote {RAW_PATH}")
    print(f"Anchors: {len(SOURCE_ANCHORS)}")
    print(f"Reachable sources: {sum(1 for item in source_attempts if item.get('reachable'))}/{len(source_attempts)}")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:  # noqa: BLE001
        print(f"privacy legal injury scrape failed: {exc}", file=sys.stderr)
        raise SystemExit(1)
