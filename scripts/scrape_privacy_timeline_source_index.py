#!/usr/bin/env python3
"""Collect a broad machine-readable timeline anchor index for privacy."""

from __future__ import annotations

import json
import urllib.error
import urllib.request
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
RESEARCH_DIR = ROOT / "docs" / "research" / "privacy"
RAW_DIR = RESEARCH_DIR / "raw"

WORD = "privacy"
LAYER_ID = "timeline_source_index"
RAW_PATH = RAW_DIR / "privacy_timeline_source_index_raw.json"

CATEGORY_LABELS = {
    "lexical_origin": "Lexical origin",
    "early_usage": "Early usage",
    "public_private_distinction": "Public-private distinction",
    "legal_rights": "Legal rights",
    "domestic_life": "Domestic life and private life",
    "information_theory": "Information and data theory",
    "data_protection": "Data protection law",
    "computing": "Computing and systems",
    "internet": "Internet and web era",
    "platform_governance": "Platform governance",
    "surveillance": "Surveillance and monitoring",
    "security": "Security and threat management",
    "advertising": "Advertising and targeting",
    "breach": "Breach incidents",
    "policy_regulation": "Policy regulation",
    "ai_biometrics": "AI and biometrics",
    "cultural_event": "Cultural event",
    "uncertain": "Uncertain",
}

ANCHORS = [
    {
        "anchor_id": "privacy_lexical_origin_private",
        "year": 1300,
        "label": "Latin privatus/privare lineage noted in private-related scholarship",
        "category": "lexical_origin",
        "description": "Privacy is likely a much later noun stabilized in modern English; roots are linked through private/seclusion traditions.",
        "source": "Oxford-style etymological references (subscription/public)",
        "source_url": "https://www.oed.com/search/dictionary/?scope=Entries&q=private",
        "confidence": "low",
        "date_label": "c. 14th-15th century (indirect)",
        "notes": "Indirect and often secondary reconstruction in this pass.",
    },
    {
        "anchor_id": "privacy_early_private_usage",
        "year": 1500,
        "label": "Private / privacy-adjacent terms appear in moral and social meaning fields",
        "category": "early_usage",
        "description": "Historical dictionary traditions describe private as opposed to public or common exposure in pre-modern records.",
        "source": "Historical dictionary references and usage guides",
        "source_url": "https://www.oed.com/search/dictionary/?scope=Entries&q=private",
        "confidence": "low",
        "date_label": "pre-1600 (candidate)",
        "notes": "Needs direct primary verification in a later pass.",
    },
    {
        "anchor_id": "privacy_public_private_distinction",
        "year": 1814,
        "label": "Early public/private distinction appears in legal and social writing",
        "category": "public_private_distinction",
        "description": "Scholarly framing of privacy as seclusion vs exposure becomes increasingly explicit.",
        "source": "Legal-philosophical literature overviews",
        "source_url": "https://www.merriam-webster.com/dictionary/private",
        "confidence": "low",
        "date_label": "around 1814",
        "notes": "Keep as directional; not fixed to a single definitive source line yet.",
    },
    {
        "anchor_id": "privacy_1890_right_to_privacy",
        "year": 1890,
        "label": "Warren and Brandeis publish 'The Right to Privacy'",
        "category": "legal_rights",
        "description": "The article frames privacy as a legal right against unjustified intrusion.",
        "source": "Warren & Brandeis, The Right to Privacy",
        "source_url": "https://www.law.cornell.edu/wex/right_to_privacy",
        "confidence": "high",
        "date_label": "1890",
        "notes": "Well-established publication anchor.",
    },
    {
        "anchor_id": "privacy_information_theory",
        "year": 1950,
        "label": "Information privacy terminology gains traction in mid-century governance discourse",
        "category": "information_theory",
        "description": "The term family begins to treat privacy as informational control rather than only seclusion.",
        "source": "Privacy policy histories and archival legal summaries",
        "source_url": "https://www.ftc.gov/news-events/topics/privacy-technology",
        "confidence": "medium",
        "date_label": "mid-20th century",
        "notes": "Approximate anchor for semantic expansion.",
    },
    {
        "anchor_id": "privacy_domestic_life",
        "year": 1950,
        "label": "Domestic/privacy-of-home framing appears in family and personal life contexts",
        "category": "domestic_life",
        "description": "Privacy remains linked to family, home, and bodily/person-based protection.",
        "source": "Secondary legal and social science summaries",
        "source_url": "https://www.oed.com/search/dictionary/?scope=Entries&q=domestic",
        "confidence": "low",
        "date_label": "mid-late 20th century",
        "notes": "Needs direct text-level support.",
    },
    {
        "anchor_id": "privacy_data_protection_1974_us",
        "year": 1974,
        "label": "U.S. Privacy Act",
        "category": "data_protection",
        "description": "Federal regulations begin restricting agency handling of records and personal data governance.",
        "source": "U.S. Privacy Act of 1974",
        "source_url": "https://www.justice.gov/opcl/privacy-act-1974",
        "confidence": "high",
        "date_label": "1974",
        "notes": "Strong legal anchor.",
    },
    {
        "anchor_id": "privacy_data_protection_1980_oecd",
        "year": 1980,
        "label": "OECD data protection guidance for automated processing",
        "category": "data_protection",
        "description": "OECD starts shaping international data-protection and personal-information language.",
        "source": "OECD Recommendation on Data Protection",
        "source_url": "https://www.oecd.org/en/data/",
        "confidence": "medium",
        "date_label": "1980",
        "notes": "Policy-level anchor rather than a single source quote in this pass.",
    },
    {
        "anchor_id": "privacy_computing_mainframes",
        "year": 1984,
        "label": "Privacy language begins to be associated with automated and database systems",
        "category": "computing",
        "description": "Data banking, records systems, and computer processing expand the privacy vocabulary.",
        "source": "Technical/legal overviews on U.S./U.K. data governance",
        "source_url": "https://www.legislation.gov.uk/ukpga/1984/2/contents",
        "confidence": "medium",
        "date_label": "1980s",
        "notes": "Category proxy; supports transition into information-technology contexts.",
    },
    {
        "anchor_id": "privacy_internet_1990",
        "year": 1995,
        "label": "Internet-era usage introduces privacy as online activity concern",
        "category": "internet",
        "description": "Commercial web adoption drives user-facing privacy language around cookies, tracking, and account safety.",
        "source": "Web policy histories and privacy concept pages",
        "source_url": "https://www.ftc.gov/news-events/topics/privacy-technology",
        "confidence": "medium",
        "date_label": "1990s",
        "notes": "Directional marker for chart planning.",
    },
    {
        "anchor_id": "privacy_platform_governance_2000",
        "year": 2000,
        "label": "Privacy policy and settings interfaces become user-facing in platforms",
        "category": "platform_governance",
        "description": "Online services increasingly expose privacy settings and policy controls to end-users.",
        "source": "Platform terms history and consumer privacy literature",
        "source_url": "https://www.ftc.gov/news-events/topics/privacy-technology",
        "confidence": "medium",
        "date_label": "2000s",
        "notes": "Needs product-level primary-page audit in later pass.",
    },
    {
        "anchor_id": "privacy_surveillance_2001",
        "year": 2001,
        "label": "Security and surveillance language tightens with post-9/11 governance",
        "category": "surveillance",
        "description": "Institutional security concerns increase public focus on surveillance/privacy trade-offs.",
        "source": "Public safety and civil-liberty summaries",
        "source_url": "https://www.oag.ca.gov/privacy",
        "confidence": "low",
        "date_label": "2001+",
        "notes": "Directional; broad year spread.",
    },
    {
        "anchor_id": "privacy_security_breach_2005",
        "year": 2005,
        "label": "Breach-disclosure reporting begins to normalize privacy-security discourse",
        "category": "breach",
        "description": "Privacy/security risk language strengthens as breach notices and protections expand.",
        "source": "Policy briefings and breach reporting frameworks",
        "source_url": "https://www.ftc.gov/news-events/topics/privacy-technology",
        "confidence": "low",
        "date_label": "2000s",
        "notes": "Broad marker, year precision is low.",
    },
    {
        "anchor_id": "privacy_gdpr_2016",
        "year": 2018,
        "label": "GDPR enforcement era expands consumer-facing privacy consciousness",
        "category": "policy_regulation",
        "description": "Regulatory framework accelerates global references to consent, rights, and platform duties.",
        "source": "EU GDPR",
        "source_url": "https://eur-lex.europa.eu/eli/reg/2016/679/oj",
        "confidence": "high",
        "date_label": "2018 enforcement",
        "notes": "High-confidence anchor with stable legal source.",
    },
    {
        "anchor_id": "privacy_ccpa_2020",
        "year": 2020,
        "label": "U.S. state privacy regulation enters mainstream product and press attention",
        "category": "policy_regulation",
        "description": "CCPA introduces state-level consumer privacy rights framing and private-sector obligations.",
        "source": "California Consumer Privacy Act",
        "source_url": "https://www.oag.ca.gov/privacy/ccpa",
        "confidence": "medium",
        "date_label": "2018 law, 2020 active",
        "notes": "Use as policy-growth anchor, not corpus evidence.",
    },
    {
        "anchor_id": "privacy_snowden_2013",
        "year": 2013,
        "label": "Post-Snowden public discourse broadens around surveillance and personal autonomy",
        "category": "cultural_event",
        "description": "Large-scale surveillance disclosures become a major reference point for privacy debates.",
        "source": "Media/legal retrospectives",
        "source_url": "https://www.privacyinternational.org",
        "confidence": "medium",
        "date_label": "2013",
        "notes": "Directional event marker, not a single legal anchor.",
    },
    {
        "anchor_id": "privacy_cambridge_analytica_2018",
        "year": 2018,
        "label": "Targeted advertising and social profiling scandals intensify privacy attention",
        "category": "advertising",
        "description": "Data use and microtargeting controversies reshape public language around privacy.",
        "source": "Social media and governance reporting",
        "source_url": "https://www.ftc.gov/news-events/topics/privacy-technology",
        "confidence": "medium",
        "date_label": "2018",
        "notes": "Media-driven marker; useful for event annotation.",
    },
    {
        "anchor_id": "privacy_ai_biometrics_2020",
        "year": 2020,
        "label": "Biometric and generative-model privacy concerns move into policy and rights discussions",
        "category": "ai_biometrics",
        "description": "AI and biometric analytics create privacy tensions around inference, identity, and automated profiling.",
        "source": "AI and governance overviews",
        "source_url": "https://www.oecd.org/going-further/ai/",
        "confidence": "low",
        "date_label": "2020s",
        "notes": "Early and high-uncertainty, especially in exact year placement.",
    },
    {
        "anchor_id": "privacy_google_trends_gap",
        "year": 2022,
        "label": "Search-intent measures remain a recommended future anchor source",
        "category": "uncertain",
        "description": "Search trend proxies are valuable for post-2020 attention but require a stable acquisition method.",
        "source": "Project constraints",
        "source_url": "https://trends.google.com/trends/",
        "confidence": "low",
        "date_label": "placeholder",
        "notes": "Placeholder anchor; not date-grounded in this pass.",
    },
]


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def write_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def check_source(url: str) -> tuple[bool, str | None]:
    try:
        request = urllib.request.Request(url, headers={"User-Agent": "WordsOverTime/0.1 privacy timeline source check"})
        with urllib.request.urlopen(request, timeout=12) as response:
            return True, str(getattr(response, "status", ""))
    except urllib.error.HTTPError as exc:
        return False, f"HTTPError {exc.code} {exc.reason}"
    except urllib.error.URLError as exc:
        return False, f"URLError: {exc.reason}"
    except Exception as exc:
        return False, f"{type(exc).__name__}: {exc}"


def collect_rows() -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    anchors: list[dict[str, Any]] = []
    source_status: dict[str, dict[str, Any]] = {}

    for anchor in ANCHORS:
        source_url = anchor["source_url"]
        source_ok, status = check_source(source_url)
        source_id = source_url.split("://", 1)[-1].split("/", 1)[0]
        source_record = source_status.setdefault(
            source_id,
            {
                "source_id": source_id,
                "source_url": source_url,
                "title": anchor["source"],
                "checked_at": utc_now(),
                "checks": 0,
                "reachable": False,
                "failure_examples": [],
            },
        )
        source_record["checks"] += 1
        if source_ok:
            source_record["reachable"] = True
        else:
            source_record["failure_examples"].append(status)

        anchor_record = dict(anchor)
        anchor_record["source_status"] = {
            "source_id": source_id,
            "reachable": source_ok,
            "status_code_or_error": status,
            "checked_at": utc_now(),
        }
        anchors.append(anchor_record)

    return anchors, list(source_status.values())


def main() -> None:
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    anchors, source_records = collect_rows()
    source_counts = Counter(
        "reachable" if item.get("reachable") else "unreachable" for item in source_records
    )
    payload = {
        "metadata": {
            "word": WORD,
            "layer_id": LAYER_ID,
            "title": "Privacy timeline source index",
            "generated_at": utc_now(),
            "generated_by_script": "scripts/scrape_privacy_timeline_source_index.py",
            "categories": CATEGORY_LABELS,
            "requested_anchor_count": len(ANCHORS),
            "source_count": len(source_records),
            "source_check_counts": dict(source_counts),
            "source_records": source_records,
            "notes": [
                "Some sources are kept as low-confidence planning anchors until primary documents are reviewed.",
                "Reachability checks are included for source audit only and are not a proxy for semantic verification.",
            ],
        },
        "anchors": anchors,
    }
    write_json(RAW_PATH, payload)

    print("Privacy timeline source index scrape summary")
    print(f"- Anchors: {len(anchors)}")
    print(f"- Reachable sources: {source_counts.get('reachable', 0)}")
    print(f"- Unreachable sources: {source_counts.get('unreachable', 0)}")
    print(f"- Categories covered: {len(CATEGORY_LABELS)}")
    print(f"- Raw output: {RAW_PATH}")


if __name__ == "__main__":
    main()
