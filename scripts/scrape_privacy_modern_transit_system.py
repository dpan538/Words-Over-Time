#!/usr/bin/env python3
"""Collect source support for privacy's 1950-2026 modern transit-system layer."""

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
RAW_PATH = RAW_DIR / "privacy_modern_transit_system_raw.json"

USER_AGENT = "WordsOverTime/0.1 privacy modern transit research; contact: local research script"


ROUTES: list[dict[str, Any]] = [
    {
        "route_id": "rights_personhood",
        "label": "Rights / personhood",
        "color": "#7E42B8",
        "description": "Privacy as personal autonomy, private life, constitutional liberty, and legal rights.",
        "terms": [
            "right to privacy",
            "privacy rights",
            "reasonable expectation of privacy",
            "private life",
            "domestic privacy",
            "individual privacy",
        ],
    },
    {
        "route_id": "information_data_protection",
        "label": "Information / data protection",
        "color": "#2E8FAF",
        "description": "Privacy as information control, data protection, personal data, and governance duty.",
        "terms": [
            "information privacy",
            "data privacy",
            "data protection",
            "personal data",
            "privacy law",
            "privacy protection",
        ],
    },
    {
        "route_id": "internet_platform_interface",
        "label": "Internet / platform interface",
        "color": "#F26A21",
        "description": "Privacy as web interface, policy notice, settings, consent screens, and platform defaults.",
        "terms": [
            "online privacy",
            "internet privacy",
            "digital privacy",
            "privacy policy",
            "privacy policies",
            "privacy notice",
            "privacy settings",
            "privacy controls",
        ],
    },
    {
        "route_id": "surveillance_security_tension",
        "label": "Surveillance / security",
        "color": "#D83232",
        "description": "Privacy as a tension with policing, national security, monitoring, and mass surveillance.",
        "terms": [
            "surveillance",
            "privacy and security",
            "security and privacy",
            "privacy and surveillance",
            "surveillance privacy",
            "privacy and monitoring",
        ],
    },
    {
        "route_id": "breach_risk_compliance",
        "label": "Breach / risk / compliance",
        "color": "#2F9F5F",
        "description": "Privacy as operational risk, breach disclosure, compliance process, and institutional accountability.",
        "terms": [
            "data breach",
            "privacy breach",
            "breach of privacy",
            "privacy risk",
            "privacy impact",
            "privacy audit",
            "privacy compliance",
        ],
    },
    {
        "route_id": "identity_consent_advertising",
        "label": "Identity / consent / advertising",
        "color": "#DDBE24",
        "description": "Privacy as identity control, consent, anonymity, trust, profiling, and targeted advertising.",
        "terms": [
            "privacy and identity",
            "privacy and consent",
            "privacy and anonymity",
            "privacy and trust",
            "consumer privacy",
            "privacy and transparency",
        ],
    },
    {
        "route_id": "ai_biometrics_sensitive_data",
        "label": "AI / biometrics / sensitive data",
        "color": "#1F6678",
        "description": "Privacy as biometric, genetic, location, inference, and automated-decision concern.",
        "terms": [
            "biometric privacy",
            "genetic privacy",
            "location privacy",
            "medical privacy",
            "financial privacy",
            "privacy preserving",
            "privacy-enhancing",
        ],
    },
]


STATIONS: list[dict[str, Any]] = [
    {
        "station_id": "echr_article_8_1950",
        "year": 1950,
        "label": "ECHR Article 8",
        "route_ids": ["rights_personhood"],
        "station_type": "rights_anchor",
        "description": "European rights language protects private and family life, home, and correspondence.",
        "source_title": "European Convention on Human Rights",
        "source_url": "https://rm.coe.int/168007aee0",
        "confidence": "high",
        "manual_review": False,
    },
    {
        "station_id": "griswold_1965",
        "year": 1965,
        "label": "Griswold v. Connecticut",
        "route_ids": ["rights_personhood"],
        "station_type": "constitutional_privacy",
        "description": "U.S. constitutional privacy becomes visible through marital and reproductive-rights reasoning.",
        "source_title": "Griswold v. Connecticut",
        "source_url": "https://www.oyez.org/cases/1964/496",
        "confidence": "medium",
        "manual_review": False,
    },
    {
        "station_id": "katz_1967",
        "year": 1967,
        "label": "Reasonable expectation",
        "route_ids": ["rights_personhood", "surveillance_security_tension"],
        "station_type": "transfer",
        "description": "Katz reframes Fourth Amendment privacy around reasonable expectation rather than only property trespass.",
        "source_title": "Katz v. United States",
        "source_url": "https://www.oyez.org/cases/1967/35",
        "confidence": "medium",
        "manual_review": False,
    },
    {
        "station_id": "hew_fipps_1973",
        "year": 1973,
        "label": "Fair information practices",
        "route_ids": ["information_data_protection"],
        "station_type": "data_governance",
        "description": "The HEW report helps consolidate fair information practice principles for computerized records.",
        "source_title": "Records, Computers, and the Rights of Citizens",
        "source_url": "https://aspe.hhs.gov/reports/records-computers-rights-citizens",
        "confidence": "high",
        "manual_review": False,
    },
    {
        "station_id": "privacy_act_1974",
        "year": 1974,
        "label": "U.S. Privacy Act",
        "route_ids": ["information_data_protection", "breach_risk_compliance"],
        "station_type": "transfer",
        "description": "Federal records privacy becomes a statutory administrative-control framework.",
        "source_title": "Privacy Act of 1974",
        "source_url": "https://www.justice.gov/opcl/privacy-act-1974",
        "confidence": "high",
        "manual_review": False,
    },
    {
        "station_id": "oecd_guidelines_1980",
        "year": 1980,
        "label": "OECD privacy guidelines",
        "route_ids": ["information_data_protection"],
        "station_type": "data_governance",
        "description": "OECD guidelines internationalize privacy principles for personal-data flows.",
        "source_title": "OECD Privacy Guidelines",
        "source_url": "https://legalinstruments.oecd.org/en/instruments/OECD-LEGAL-0188",
        "confidence": "high",
        "manual_review": False,
    },
    {
        "station_id": "convention_108_1981",
        "year": 1981,
        "label": "Convention 108",
        "route_ids": ["information_data_protection", "rights_personhood"],
        "station_type": "transfer",
        "description": "Council of Europe Convention 108 makes personal-data protection a treaty framework.",
        "source_title": "Convention 108",
        "source_url": "https://rm.coe.int/1680078b37",
        "confidence": "high",
        "manual_review": False,
    },
    {
        "station_id": "ecpa_1986",
        "year": 1986,
        "label": "Electronic communications",
        "route_ids": ["surveillance_security_tension", "information_data_protection"],
        "station_type": "transfer",
        "description": "Electronic communications privacy links communications networks, search, disclosure, and surveillance.",
        "source_title": "Electronic Communications Privacy Act",
        "source_url": "https://bja.ojp.gov/program/it/privacy-civil-liberties/authorities/statutes/1285",
        "confidence": "high",
        "manual_review": False,
    },
    {
        "station_id": "eu_directive_1995",
        "year": 1995,
        "label": "EU Data Protection Directive",
        "route_ids": ["information_data_protection"],
        "station_type": "data_governance",
        "description": "EU privacy governance centers personal data, processing, and cross-border protection.",
        "source_title": "Directive 95/46/EC",
        "source_url": "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:31995L0046",
        "confidence": "high",
        "manual_review": False,
    },
    {
        "station_id": "hipaa_1996",
        "year": 1996,
        "label": "Health privacy",
        "route_ids": ["ai_biometrics_sensitive_data", "information_data_protection"],
        "station_type": "transfer",
        "description": "Health-information privacy becomes an institutional and sectoral compliance domain.",
        "source_title": "HIPAA Privacy Rule",
        "source_url": "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-E",
        "confidence": "high",
        "manual_review": False,
    },
    {
        "station_id": "coppa_1998",
        "year": 1998,
        "label": "Children online",
        "route_ids": ["internet_platform_interface", "identity_consent_advertising"],
        "station_type": "transfer",
        "description": "Children's online privacy turns consent, notice, and platform collection into a regulatory object.",
        "source_title": "Children's Online Privacy Protection Rule",
        "source_url": "https://www.ftc.gov/legal-library/browse/rules/childrens-online-privacy-protection-rule-coppa",
        "confidence": "high",
        "manual_review": False,
    },
    {
        "station_id": "patriot_act_2001",
        "year": 2001,
        "label": "Security turn",
        "route_ids": ["surveillance_security_tension"],
        "station_type": "security_policy",
        "description": "Post-9/11 security law intensifies the privacy-surveillance tension.",
        "source_title": "USA PATRIOT Act",
        "source_url": "https://www.govinfo.gov/content/pkg/PLAW-107publ56/html/PLAW-107publ56.htm",
        "confidence": "high",
        "manual_review": False,
    },
    {
        "station_id": "eprivacy_directive_2002",
        "year": 2002,
        "label": "ePrivacy / cookies",
        "route_ids": ["internet_platform_interface", "information_data_protection"],
        "station_type": "transfer",
        "description": "European ePrivacy rules connect communications privacy, cookies, and online tracking.",
        "source_title": "Directive 2002/58/EC",
        "source_url": "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32002L0058",
        "confidence": "high",
        "manual_review": False,
    },
    {
        "station_id": "california_breach_2003",
        "year": 2003,
        "label": "Breach notification",
        "route_ids": ["breach_risk_compliance", "information_data_protection"],
        "station_type": "transfer",
        "description": "California breach-notification law helps make data breaches a visible privacy-risk category.",
        "source_title": "California breach notification law",
        "source_url": "https://oag.ca.gov/privacy/databreach/reporting",
        "confidence": "medium",
        "manual_review": False,
    },
    {
        "station_id": "ftc_privacy_report_2012",
        "year": 2012,
        "label": "Privacy framework",
        "route_ids": ["internet_platform_interface", "identity_consent_advertising", "breach_risk_compliance"],
        "station_type": "transfer",
        "description": "FTC consumer-privacy guidance ties privacy by design, simplified choice, and transparency to platform practice.",
        "source_title": "Protecting Consumer Privacy in an Era of Rapid Change",
        "source_url": "https://www.ftc.gov/reports/protecting-consumer-privacy-era-rapid-change-recommendations-businesses-policymakers",
        "confidence": "high",
        "manual_review": False,
    },
    {
        "station_id": "snowden_2013",
        "year": 2013,
        "label": "Mass surveillance",
        "route_ids": ["surveillance_security_tension", "internet_platform_interface"],
        "station_type": "transfer",
        "description": "Snowden disclosures make mass surveillance a global public-attention privacy frame.",
        "source_title": "Privacy and Civil Liberties Oversight Board archive",
        "source_url": "https://www.pclob.gov/",
        "confidence": "medium",
        "manual_review": True,
    },
    {
        "station_id": "gdpr_adoption_2016",
        "year": 2016,
        "label": "GDPR adopted",
        "route_ids": ["information_data_protection", "breach_risk_compliance", "identity_consent_advertising"],
        "station_type": "transfer",
        "description": "GDPR adoption consolidates personal-data rights, consent, accountability, and penalties.",
        "source_title": "Regulation (EU) 2016/679",
        "source_url": "https://eur-lex.europa.eu/eli/reg/2016/679/oj",
        "confidence": "high",
        "manual_review": False,
    },
    {
        "station_id": "gdpr_applies_2018",
        "year": 2018,
        "label": "GDPR applies",
        "route_ids": ["information_data_protection", "internet_platform_interface", "breach_risk_compliance"],
        "station_type": "transfer",
        "description": "GDPR enforcement begins and privacy becomes a mainstream product, policy, and compliance interface.",
        "source_title": "European Commission data protection",
        "source_url": "https://commission.europa.eu/law/law-topic/data-protection/data-protection-eu_en",
        "confidence": "high",
        "manual_review": False,
    },
    {
        "station_id": "cambridge_analytica_2018",
        "year": 2018,
        "label": "Platform profiling",
        "route_ids": ["identity_consent_advertising", "internet_platform_interface"],
        "station_type": "platform_event",
        "description": "Cambridge Analytica and Facebook enforcement make profiling, consent, and social data visible privacy harms.",
        "source_title": "FTC Facebook privacy enforcement",
        "source_url": "https://www.ftc.gov/news-events/news/press-releases/2019/07/ftc-imposes-5-billion-penalty-sweeping-new-privacy-restrictions-facebook",
        "confidence": "high",
        "manual_review": False,
    },
    {
        "station_id": "ccpa_2018_2020",
        "year": 2020,
        "label": "Consumer privacy rights",
        "route_ids": ["information_data_protection", "identity_consent_advertising", "breach_risk_compliance"],
        "station_type": "transfer",
        "description": "CCPA makes U.S. state consumer privacy rights and business obligations a mainstream privacy line.",
        "source_title": "California Consumer Privacy Act",
        "source_url": "https://oag.ca.gov/privacy/ccpa",
        "confidence": "high",
        "manual_review": False,
    },
    {
        "station_id": "china_pipl_2021",
        "year": 2021,
        "label": "PIPL",
        "route_ids": ["information_data_protection", "internet_platform_interface"],
        "station_type": "data_governance",
        "description": "China's Personal Information Protection Law extends large-scale personal-information governance.",
        "source_title": "Personal Information Protection Law of the PRC",
        "source_url": "https://en.spp.gov.cn/2021-12/29/c_948419.htm",
        "confidence": "medium",
        "manual_review": True,
    },
    {
        "station_id": "state_privacy_2023",
        "year": 2023,
        "label": "State privacy wave",
        "route_ids": ["information_data_protection", "breach_risk_compliance", "internet_platform_interface"],
        "station_type": "policy_wave",
        "description": "Virginia, Colorado, Connecticut, and other state privacy laws broaden U.S. privacy compliance geography.",
        "source_title": "California Privacy Protection Agency privacy resources",
        "source_url": "https://cppa.ca.gov/",
        "confidence": "medium",
        "manual_review": True,
    },
    {
        "station_id": "eu_ai_act_2024",
        "year": 2024,
        "label": "AI and biometrics",
        "route_ids": ["ai_biometrics_sensitive_data", "information_data_protection", "surveillance_security_tension"],
        "station_type": "transfer",
        "description": "AI regulation brings biometric identification, sensitive inference, and automated profiling into privacy-adjacent governance.",
        "source_title": "EU AI Act regulatory framework",
        "source_url": "https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai",
        "confidence": "high",
        "manual_review": False,
    },
]


def fetch_source(station: dict[str, Any]) -> dict[str, Any]:
    url = station["source_url"]
    log: dict[str, Any] = {
        "station_id": station["station_id"],
        "url": url,
        "checked_at": datetime.now(timezone.utc).isoformat(),
    }
    try:
        request = Request(url, headers={"User-Agent": USER_AGENT})
        with urlopen(request, timeout=18) as response:
            raw = response.read(260_000)
            text = raw.decode("utf-8", errors="replace")
            title_match = re.search(r"<title[^>]*>(.*?)</title>", text, re.I | re.S)
            title = re.sub(r"\s+", " ", title_match.group(1)).strip() if title_match else ""
            lower = text.lower()
            log.update(
                {
                    "reachable": True,
                    "status": getattr(response, "status", None),
                    "content_type": response.headers.get("content-type"),
                    "bytes_sampled": len(raw),
                    "html_title": title,
                    "contains_privacy": "privacy" in lower,
                    "contains_data": "data" in lower,
                    "contains_personal": "personal" in lower,
                    "contains_station_year": str(station["year"]) in lower,
                }
            )
    except HTTPError as exc:
        log.update({"reachable": False, "status": exc.code, "error": f"HTTPError {exc.code}: {exc.reason}"})
    except URLError as exc:
        log.update({"reachable": False, "status": None, "error": f"URLError: {exc.reason}"})
    except Exception as exc:  # noqa: BLE001
        log.update({"reachable": False, "status": None, "error": f"{type(exc).__name__}: {exc}"})
    return log


def main() -> int:
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    source_attempts = [fetch_source(station) for station in STATIONS]
    payload = {
        "word": "privacy",
        "layer_id": "modern_transit_system",
        "status": "raw_source_attempts",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "generated_by_script": "scripts/scrape_privacy_modern_transit_system.py",
        "year_range": [1950, 2026],
        "routes": ROUTES,
        "stations": STATIONS,
        "source_attempts": source_attempts,
        "failed_sources": [attempt for attempt in source_attempts if not attempt.get("reachable")],
        "notes": [
            "This layer supports privacy chart 01C inside the first privacy chapter; it is not a separate chart number.",
            "Source attempts preserve reachability metadata. Processing adds local phrase, attention, transfer, and flow metrics.",
            "Manual-review sources can still be useful as cultural or jurisdictional markers, but should be visually lighter than verified official/legal sources.",
        ],
    }
    RAW_PATH.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Wrote {RAW_PATH}")
    print(f"Routes: {len(ROUTES)}")
    print(f"Stations: {len(STATIONS)}")
    print(f"Reachable sources: {sum(1 for item in source_attempts if item.get('reachable'))}/{len(source_attempts)}")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:  # noqa: BLE001
        print(f"privacy modern transit scrape failed: {exc}", file=sys.stderr)
        raise SystemExit(1)
