#!/usr/bin/env python3
"""Collect local evidence for hub Chart 04 semantic dependency.

This pass supports a narrative about hub becoming a modifier-dependent naming
operator. It does not perform broad web scraping; it consolidates existing
Chart 01-03 frequency, naming, brand, and institutional evidence so the next
visual pass can distinguish lexical survival from modifier-driven meaning.
"""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
RESEARCH_DIR = ROOT / "docs" / "research" / "hub"
RAW_DIR = RESEARCH_DIR / "raw"
PROCESSED_DIR = RESEARCH_DIR / "processed"


CORE_TERMS = [
    {"term": "hub", "pattern": "standalone_headword", "object_type": "lexical_background", "dependency_class": "standalone"},
    {"term": "hubs", "pattern": "standalone_headword", "object_type": "lexical_background", "dependency_class": "standalone"},
    {"term": "hub of activity", "pattern": "hub_of_x", "object_type": "central_place", "dependency_class": "relational_phrase"},
    {"term": "hub of commerce", "pattern": "hub_of_x", "object_type": "central_place", "dependency_class": "relational_phrase"},
    {"term": "wheel hub", "pattern": "modifier_plus_hub", "object_type": "mechanical_core", "dependency_class": "specified_object"},
    {"term": "transport hub", "pattern": "modifier_plus_hub", "object_type": "routing_node", "dependency_class": "specified_object"},
    {"term": "network hub", "pattern": "modifier_plus_hub", "object_type": "technical_system", "dependency_class": "specified_object"},
]


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def load_json(path: Path, fallback: Any | None = None) -> Any:
    if not path.exists():
        return fallback
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def normalized_key(value: str) -> str:
    return value.strip().lower().replace("-", " ")


def find_frequency_record(term: str, frequency_data: dict[str, Any], phrase_data: dict[str, Any]) -> dict[str, Any] | None:
    key = normalized_key(term)
    for row in frequency_data.get("series", []):
        if normalized_key(str(row.get("term", ""))) == key:
            return {
                "source_file": "hub_frequency_series.json",
                "source_kind": "first_pass_ngram",
                "term": row.get("term"),
                "status": row.get("status", "collected"),
                "stats": row.get("stats", {}),
                "average_frequency_by_period": row.get("average_frequency_by_period", []),
                "points": row.get("points", []),
            }
    for row in phrase_data.get("phrases", []):
        if normalized_key(str(row.get("phrase", ""))) == key:
            return {
                "source_file": "hub_phrase_series.json",
                "source_kind": "first_pass_phrase_ngram",
                "term": row.get("phrase"),
                "status": row.get("approximate_frequency_signal", {}).get("status", "collected"),
                "stats": row.get("approximate_frequency_signal", {}),
                "average_frequency_by_period": row.get("average_frequency_by_period", []),
                "points": row.get("points", []),
            }
    return None


def chart03_lookup(chart03: dict[str, Any]) -> dict[str, dict[str, Any]]:
    lookup: dict[str, dict[str, Any]] = {}
    for row in chart03.get("representative_terms", []):
        lookup[normalized_key(row.get("term", ""))] = {"source": "representative_terms", **row}
    for row in chart03.get("quality_flags", []):
        key = normalized_key(row.get("term", ""))
        lookup.setdefault(key, {}).update({"quality_flag": row})
    return lookup


def build_inventory(chart03: dict[str, Any]) -> list[dict[str, Any]]:
    records: list[dict[str, Any]] = []
    seen: set[str] = set()

    def add(record: dict[str, Any]) -> None:
        key = normalized_key(record["term"])
        if key in seen:
            return
        seen.add(key)
        records.append(record)

    for record in CORE_TERMS:
        add(
            {
                "term": record["term"],
                "form_type": record["pattern"],
                "dependency_class": record["dependency_class"],
                "object_type": record["object_type"],
                "modifier_or_domain": record["term"].split(" hub")[0] if " hub" in record["term"] else "",
                "source_basis": ["first_pass_frequency", "chart01_chart02_context"],
                "notes": "Baseline comparison term for modifier dependency.",
            }
        )

    for row in chart03.get("representative_terms", []):
        pattern = row.get("naming_pattern", "")
        term = row.get("term", "")
        if not term:
            continue
        add(
            {
                "term": term,
                "form_type": pattern,
                "dependency_class": "modifier_defined" if pattern == "suffix_phrase" else "hub_as_modifier",
                "object_type": row.get("object_type", ""),
                "modifier_or_domain": term.rsplit(" hub", 1)[0] if term.lower().endswith(" hub") else term.replace("hub ", ""),
                "frequency_signal_strength": row.get("frequency_signal_strength", ""),
                "first_visible_period": row.get("first_visible_period", ""),
                "peak_period": row.get("peak_period", ""),
                "source_basis": ["chart03_representative_terms"],
                "notes": "Modern naming candidate from Chart 03.",
            }
        )

    for row in chart03.get("brand_platform_inventory", []):
        name = row.get("name", "")
        if not name or not row.get("include_in_chart", False):
            continue
        add(
            {
                "term": name,
                "form_type": row.get("hub_position", "brand_or_platform"),
                "dependency_class": "brand_compound",
                "object_type": row.get("object_type", ""),
                "modifier_or_domain": name.replace("Hub", "").replace("hub", "").replace("-Hub", "").replace(" Hub", "").strip("- "),
                "first_known_or_launch_year": row.get("first_known_or_launch_year", ""),
                "domain_or_category": row.get("domain_or_category", ""),
                "naming_function": row.get("naming_function", ""),
                "source_basis": ["chart03_brand_platform_inventory"],
                "notes": row.get("notes", ""),
                "sensitivity_or_caution": row.get("sensitivity_or_caution", ""),
            }
        )

    for row in chart03.get("institutional_access_examples", []):
        term = row.get("term", "")
        if not term:
            continue
        add(
            {
                "term": term,
                "form_type": "suffix_phrase",
                "dependency_class": "institutional_modifier_defined",
                "object_type": row.get("object_type", ""),
                "modifier_or_domain": term.rsplit(" hub", 1)[0] if term.lower().endswith(" hub") else term,
                "institution_or_source": row.get("institution_or_source", ""),
                "source_url": row.get("source_url", ""),
                "source_basis": ["chart03_institutional_access_examples"],
                "notes": row.get("context_summary", ""),
            }
        )

    return records


def main() -> None:
    chart03 = load_json(PROCESSED_DIR / "hub_chart03_chart_data_preview.json", {})
    chart03_visibility = load_json(PROCESSED_DIR / "hub_chart03_search_visibility_index.json", {})
    chart03_by_period = load_json(PROCESSED_DIR / "hub_chart03_naming_by_period.json", {})
    frequency_data = load_json(PROCESSED_DIR / "hub_frequency_series.json", {})
    phrase_data = load_json(PROCESSED_DIR / "hub_phrase_series.json", {})
    chart01_summary = load_json(PROCESSED_DIR / "hub_chart01_frequency_summary.json", {})
    chart02_confidence = load_json(PROCESSED_DIR / "hub_chart02_model_confidence_matrix.json", {})

    inventory = build_inventory(chart03)
    lookup = chart03_lookup(chart03)

    frequency_records = []
    for record in inventory:
        term = record["term"]
        found = find_frequency_record(term, frequency_data, phrase_data)
        frequency_records.append(
            {
                "term": term,
                "form_type": record["form_type"],
                "dependency_class": record["dependency_class"],
                "object_type": record.get("object_type", ""),
                "frequency_record_status": "found_existing" if found else "not_found_existing",
                "frequency_record": found,
                "chart03_metadata": lookup.get(normalized_key(term), {}),
                "notes": "Existing local series reused where available; no new network frequency request was made.",
            }
        )

    visibility_records = []
    visibility_by_query = {
        normalized_key(row.get("query", "")): row for row in chart03_visibility.get("records", [])
    }
    for record in inventory:
        row = visibility_by_query.get(normalized_key(record["term"]))
        if row:
            visibility_records.append(
                {
                    "term": record["term"],
                    "dependency_class": record["dependency_class"],
                    "visibility_status": row.get("visibility_status", ""),
                    "top_result_domains": row.get("top_result_domains", []),
                    "example_urls": row.get("example_urls", []),
                    "evidence_quality": row.get("evidence_quality", ""),
                    "notes": "Reused Chart 03 search visibility record.",
                }
            )

    metadata = {
        "word": "hub",
        "chart_id": "chart_04",
        "pass": "semantic_dependency_collection",
        "generated_at": utc_now(),
        "generated_by_script": "scripts/scrape_hub_chart04_dependency.py",
        "source_files": [
            "docs/research/hub/processed/hub_chart03_chart_data_preview.json",
            "docs/research/hub/processed/hub_chart03_search_visibility_index.json",
            "docs/research/hub/processed/hub_chart03_naming_by_period.json",
            "docs/research/hub/processed/hub_frequency_series.json",
            "docs/research/hub/processed/hub_phrase_series.json",
            "docs/research/hub/processed/hub_chart01_frequency_summary.json",
            "docs/research/hub/processed/hub_chart02_model_confidence_matrix.json",
        ],
        "network_policy": "No new external requests. This pass consolidates previous scraped/curated layers.",
    }

    write_json(
        RAW_DIR / "hub_chart04_dependency_inventory_raw.json",
        {"metadata": metadata, "records": inventory},
    )
    write_json(
        RAW_DIR / "hub_chart04_dependency_frequency_raw.json",
        {"metadata": metadata, "records": frequency_records},
    )
    write_json(
        RAW_DIR / "hub_chart04_dependency_examples_raw.json",
        {
            "metadata": metadata,
            "visibility_records": visibility_records,
            "brand_platform_inventory": chart03.get("brand_platform_inventory", []),
            "institutional_access_examples": chart03.get("institutional_access_examples", []),
            "chart03_hypothesis_evaluation": chart03.get("hypothesis_evaluation", {}),
        },
    )
    write_json(
        RAW_DIR / "hub_chart04_query_log.json",
        {
            "metadata": metadata,
            "inventory_count": len(inventory),
            "frequency_found_existing": sum(1 for row in frequency_records if row["frequency_record_status"] == "found_existing"),
            "frequency_not_found_existing": sum(1 for row in frequency_records if row["frequency_record_status"] == "not_found_existing"),
            "visibility_records_reused": len(visibility_records),
            "chart03_period_records_reused": len(chart03_by_period.get("periods", [])),
            "chart01_preliminary_answer": chart01_summary.get("data_answer_preliminary", {}),
            "chart02_core_model_status": chart02_confidence.get("core_model_status", {}),
            "failed_or_skipped_sources": [
                {
                    "source": "new_external_web_or_ngram_requests",
                    "status": "skipped",
                    "reason": "Existing Chart 03 sources already contain targeted naming evidence; this pass avoids new broad scraping.",
                }
            ],
        },
    )

    print("Chart 04 semantic dependency raw collection complete")
    print(f"inventory records: {len(inventory)}")
    print(f"existing frequency records found: {sum(1 for row in frequency_records if row['frequency_record_status'] == 'found_existing')}")
    print(f"visibility records reused: {len(visibility_records)}")
    print("outputs:")
    for path in [
        RAW_DIR / "hub_chart04_dependency_inventory_raw.json",
        RAW_DIR / "hub_chart04_dependency_frequency_raw.json",
        RAW_DIR / "hub_chart04_dependency_examples_raw.json",
        RAW_DIR / "hub_chart04_query_log.json",
    ]:
        print(f"- {path.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
