#!/usr/bin/env python3
"""Aggregate anonymized Words Over Time reader-study responses.

The default input is a tiny anonymized dummy file so the pipeline can be
checked before formal data collection begins.
"""

from __future__ import annotations

import argparse
import csv
from collections import defaultdict
from pathlib import Path
from statistics import mean


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_RESPONSES = ROOT / "data_templates" / "dummy_participant_responses.csv"
DEFAULT_ANSWER_KEY = ROOT / "data_templates" / "task_answer_key.csv"
DEFAULT_OUTPUT = ROOT / "outputs" / "tables"


def read_csv(path: Path) -> list[dict[str, str]]:
    with path.open(newline="", encoding="utf-8") as handle:
        return list(csv.DictReader(handle))


def write_csv(path: Path, rows: list[dict[str, object]], fields: list[str]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=fields)
        writer.writeheader()
        for row in rows:
            writer.writerow(row)


def parse_float(value: str) -> float | None:
    value = (value or "").strip()
    if not value:
        return None
    try:
        return float(value)
    except ValueError:
        return None


def build_answer_lookup(rows: list[dict[str, str]]) -> dict[tuple[str, str, str], dict[str, str]]:
    lookup: dict[tuple[str, str, str], dict[str, str]] = {}
    for row in rows:
        keys = [
            (row["task_id"], row["word"], row["condition"]),
            (row["task_id"], row["word"], "any"),
            (row["task_id"], "any", row["condition"]),
            (row["task_id"], "any", "any"),
        ]
        for key in keys:
            lookup.setdefault(key, row)
    return lookup


def answer_for(row: dict[str, str], lookup: dict[tuple[str, str, str], dict[str, str]]) -> dict[str, str] | None:
    keys = [
        (row["task_id"], row["word"], row["condition"]),
        (row["task_id"], row["word"], "any"),
        (row["task_id"], "any", row["condition"]),
        (row["task_id"], "any", "any"),
    ]
    for key in keys:
        if key in lookup:
            return lookup[key]
    return None


def score_row(row: dict[str, str], answer: dict[str, str] | None) -> int | None:
    explicit = (row.get("is_correct") or "").strip().lower()
    if explicit in {"1", "true", "yes", "y"}:
        return 1
    if explicit in {"0", "false", "no", "n"}:
        return 0
    if not answer:
        return None
    selected = (row.get("selected_answer") or "").strip().lower()
    accepted = {answer["correct_answer"].strip().lower()}
    accepted.update(
        item.strip().lower()
        for item in (answer.get("accepted_variants") or "").split(";")
        if item.strip()
    )
    return 1 if selected in accepted else 0


def summarize(args: argparse.Namespace) -> None:
    responses = read_csv(Path(args.responses))
    answer_lookup = build_answer_lookup(read_csv(Path(args.answer_key)))

    scored_rows: list[dict[str, object]] = []
    for row in responses:
        answer = answer_for(row, answer_lookup)
        score = score_row(row, answer)
        construct = answer["measured_construct"] if answer else "unmapped"
        scored_rows.append({**row, "score": score, "measured_construct": construct})

    task_groups: dict[tuple[str, str, str, str], list[int]] = defaultdict(list)
    participant_groups: dict[tuple[str, str, str], list[dict[str, object]]] = defaultdict(list)
    condition_groups: dict[str, list[dict[str, object]]] = defaultdict(list)
    qualitative_counts: dict[tuple[str, str], int] = defaultdict(int)

    for row in scored_rows:
        score = row["score"]
        if score is not None:
            task_groups[
                (
                    str(row["word"]),
                    str(row["condition"]),
                    str(row["task_id"]),
                    str(row["measured_construct"]),
                )
            ].append(int(score))
        participant_groups[
            (str(row["participant_id"]), str(row["participant_group"]), str(row["condition"]))
        ].append(row)
        condition_groups[str(row["condition"])].append(row)
        for code in str(row.get("qualitative_codes") or "").split(";"):
            code = code.strip()
            if code:
                qualitative_counts[(str(row["condition"]), code)] += 1

    task_rows = []
    for (word, condition, task_id, construct), scores in sorted(task_groups.items()):
        task_rows.append(
            {
                "word": word,
                "condition": condition,
                "task_id": task_id,
                "measured_construct": construct,
                "n": len(scores),
                "accuracy": round(mean(scores), 4),
            }
        )

    participant_metric_rows = []
    for (participant_id, group, condition), rows in sorted(participant_groups.items()):
        def construct_scores(name: str) -> list[int]:
            return [
                int(row["score"])
                for row in rows
                if row["score"] is not None and row["measured_construct"] == name
            ]

        evidence = construct_scores("evidence_type_identification")
        boundary = construct_scores("claim_boundary_comprehension")
        frequency = construct_scores("frequency_misinterpretation")
        all_scores = [int(row["score"]) for row in rows if row["score"] is not None]
        source_ratings = [parse_float(str(row.get("likert_source_transparency"))) for row in rows]
        confidence = [parse_float(str(row.get("likert_confidence"))) for row in rows]
        credibility = [parse_float(str(row.get("likert_credibility"))) for row in rows]
        difficulty = [parse_float(str(row.get("likert_difficulty"))) for row in rows]

        def avg(values: list[float | None]) -> str:
            clean = [value for value in values if value is not None]
            return f"{mean(clean):.2f}" if clean else ""

        participant_metric_rows.append(
            {
                "participant_id": participant_id,
                "participant_group": group,
                "condition": condition,
                "n_tasks": len(all_scores),
                "overall_accuracy": f"{mean(all_scores):.2f}" if all_scores else "",
                "evidence_identification_score": f"{mean(evidence):.2f}" if evidence else "",
                "claim_boundary_comprehension_score": f"{mean(boundary):.2f}" if boundary else "",
                "frequency_misinterpretation_rate": f"{1 - mean(frequency):.2f}" if frequency else "",
                "source_transparency_rating_mean": avg(source_ratings),
                "confidence_rating_mean": avg(confidence),
                "credibility_rating_mean": avg(credibility),
                "difficulty_rating_mean": avg(difficulty),
            }
        )

    summary_groups: dict[tuple[str, str], list[dict[str, object]]] = defaultdict(list)
    for row in participant_metric_rows:
        summary_groups[(str(row["condition"]), str(row["participant_group"]))].append(row)

    metric_fields = [
        "overall_accuracy",
        "evidence_identification_score",
        "claim_boundary_comprehension_score",
        "frequency_misinterpretation_rate",
        "source_transparency_rating_mean",
        "confidence_rating_mean",
        "credibility_rating_mean",
        "difficulty_rating_mean",
    ]

    summary_rows = []
    for (condition, group), rows in sorted(summary_groups.items()):
        summary_row: dict[str, object] = {
            "condition": condition,
            "participant_group": group,
            "n_participants": len(rows),
            "n_task_rows": sum(int(row["n_tasks"]) for row in rows),
        }
        for field in metric_fields:
            values = [
                parse_float(str(row[field]))
                for row in rows
                if parse_float(str(row[field])) is not None
            ]
            summary_row[field] = f"{mean(values):.2f}" if values else ""
        summary_rows.append(summary_row)

    qualitative_rows = [
        {"condition": condition, "qualitative_code": code, "count": count}
        for (condition, code), count in sorted(qualitative_counts.items())
    ]

    output = Path(args.output_dir)
    write_csv(
        output / "task_level_accuracy.csv",
        task_rows,
        ["word", "condition", "task_id", "measured_construct", "n", "accuracy"],
    )
    write_csv(
        output / "reader_study_summary.csv",
        summary_rows,
        [
            "condition",
            "participant_group",
            "n_participants",
            "n_task_rows",
            "overall_accuracy",
            "evidence_identification_score",
            "claim_boundary_comprehension_score",
            "frequency_misinterpretation_rate",
            "source_transparency_rating_mean",
            "confidence_rating_mean",
            "credibility_rating_mean",
            "difficulty_rating_mean",
        ],
    )
    write_csv(
        output / "qualitative_theme_counts.csv",
        qualitative_rows,
        ["condition", "qualitative_code", "count"],
    )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--responses", default=str(DEFAULT_RESPONSES))
    parser.add_argument("--answer-key", default=str(DEFAULT_ANSWER_KEY))
    parser.add_argument("--output-dir", default=str(DEFAULT_OUTPUT))
    summarize(parser.parse_args())


if __name__ == "__main__":
    main()
