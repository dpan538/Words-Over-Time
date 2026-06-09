#!/usr/bin/env python3
"""Generate simple PNG figures from aggregate reader-study tables.

This script intentionally uses only the Python standard library so the study
package does not need plotting dependencies.
"""

from __future__ import annotations

import argparse
import csv
import struct
import zlib
from collections import defaultdict
from pathlib import Path
from statistics import mean


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_TABLES = ROOT / "outputs" / "tables"
DEFAULT_FIGURES = ROOT / "outputs" / "figures"

INK = (5, 5, 16)
GRID = (220, 223, 226)
BASELINE = (240, 107, 4)
EVIDENCE = (21, 112, 172)
TEXT = (35, 35, 42)
BG = (255, 252, 246)


FONT: dict[str, list[str]] = {
    "0": ["111", "101", "101", "101", "111"],
    "1": ["010", "110", "010", "010", "111"],
    "2": ["111", "001", "111", "100", "111"],
    "3": ["111", "001", "111", "001", "111"],
    "4": ["101", "101", "111", "001", "001"],
    "5": ["111", "100", "111", "001", "111"],
    "6": ["111", "100", "111", "101", "111"],
    "7": ["111", "001", "010", "010", "010"],
    "8": ["111", "101", "111", "101", "111"],
    "9": ["111", "101", "111", "001", "111"],
    ".": ["000", "000", "000", "000", "010"],
    "%": ["101", "001", "010", "100", "101"],
    "-": ["000", "000", "111", "000", "000"],
    " ": ["000", "000", "000", "000", "000"],
    "a": ["010", "101", "111", "101", "101"],
    "b": ["110", "101", "110", "101", "110"],
    "c": ["011", "100", "100", "100", "011"],
    "d": ["110", "101", "101", "101", "110"],
    "e": ["111", "100", "110", "100", "111"],
    "f": ["111", "100", "110", "100", "100"],
    "g": ["011", "100", "101", "101", "011"],
    "h": ["101", "101", "111", "101", "101"],
    "i": ["111", "010", "010", "010", "111"],
    "j": ["001", "001", "001", "101", "010"],
    "k": ["101", "101", "110", "101", "101"],
    "l": ["100", "100", "100", "100", "111"],
    "m": ["101", "111", "111", "101", "101"],
    "n": ["110", "101", "101", "101", "101"],
    "o": ["010", "101", "101", "101", "010"],
    "p": ["110", "101", "110", "100", "100"],
    "q": ["010", "101", "101", "111", "001"],
    "r": ["110", "101", "110", "101", "101"],
    "s": ["011", "100", "010", "001", "110"],
    "t": ["111", "010", "010", "010", "010"],
    "u": ["101", "101", "101", "101", "111"],
    "v": ["101", "101", "101", "101", "010"],
    "w": ["101", "101", "111", "111", "101"],
    "x": ["101", "101", "010", "101", "101"],
    "y": ["101", "101", "010", "010", "010"],
    "z": ["111", "001", "010", "100", "111"],
}


def read_csv(path: Path) -> list[dict[str, str]]:
    if not path.exists():
        return []
    with path.open(newline="", encoding="utf-8") as handle:
        return list(csv.DictReader(handle))


def png_chunk(kind: bytes, data: bytes) -> bytes:
    return struct.pack(">I", len(data)) + kind + data + struct.pack(">I", zlib.crc32(kind + data) & 0xFFFFFFFF)


def write_png(path: Path, width: int, height: int, pixels: list[list[tuple[int, int, int]]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    raw = b"".join(b"\x00" + b"".join(bytes(pixel) for pixel in row) for row in pixels)
    data = b"\x89PNG\r\n\x1a\n"
    data += png_chunk(b"IHDR", struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0))
    data += png_chunk(b"IDAT", zlib.compress(raw, 9))
    data += png_chunk(b"IEND", b"")
    path.write_bytes(data)


def canvas(width: int = 960, height: int = 560) -> list[list[tuple[int, int, int]]]:
    return [[BG for _ in range(width)] for _ in range(height)]


def rect(img: list[list[tuple[int, int, int]]], x: int, y: int, w: int, h: int, color: tuple[int, int, int]) -> None:
    height = len(img)
    width = len(img[0])
    for yy in range(max(0, y), min(height, y + h)):
        for xx in range(max(0, x), min(width, x + w)):
            img[yy][xx] = color


def text(img: list[list[tuple[int, int, int]]], x: int, y: int, value: str, color: tuple[int, int, int] = TEXT, scale: int = 3) -> None:
    cursor = x
    for char in value.lower():
        glyph = FONT.get(char, FONT[" "])
        for gy, row in enumerate(glyph):
            for gx, bit in enumerate(row):
                if bit == "1":
                    rect(img, cursor + gx * scale, y + gy * scale, scale, scale, color)
        cursor += 4 * scale


def aggregate_mean(rows: list[dict[str, str]], group_field: str, value_field: str) -> dict[str, float]:
    groups: dict[str, list[float]] = defaultdict(list)
    for row in rows:
        try:
            groups[row[group_field]].append(float(row[value_field]))
        except (KeyError, ValueError):
            continue
    return {key: mean(values) for key, values in groups.items() if values}


def bar_chart(path: Path, title: str, values: dict[str, float], maximum: float = 1.0) -> None:
    img = canvas()
    text(img, 48, 36, title, INK, 4)
    rect(img, 72, 448, 800, 2, INK)
    rect(img, 72, 128, 2, 320, INK)
    for i in range(5):
        y = 448 - i * 80
        rect(img, 72, y, 800, 1, GRID)
        label = f"{(maximum * i / 4):.1f}"
        text(img, 28, y - 8, label, TEXT, 2)

    ordered = [key for key in ["baseline", "evidence_grid"] if key in values]
    if not ordered:
        ordered = sorted(values)
    colors = {"baseline": BASELINE, "evidence_grid": EVIDENCE}
    bar_w = 180 if len(ordered) <= 2 else 100
    gap = 120
    start = 180
    for index, key in enumerate(ordered):
        value = values[key]
        h = int(320 * min(max(value / maximum, 0), 1))
        x = start + index * (bar_w + gap)
        rect(img, x, 448 - h, bar_w, h, colors.get(key, INK))
        text(img, x, 468, key.replace("_", "-"), TEXT, 2)
        text(img, x + 24, 420 - h, f"{value:.2f}", TEXT, 3)
    write_png(path, 960, 560, img)


def theme_map(path: Path, rows: list[dict[str, str]]) -> None:
    counts: dict[str, int] = defaultdict(int)
    for row in rows:
        code = row.get("qualitative_code", "")
        try:
            counts[code] += int(row.get("count", "0"))
        except ValueError:
            continue
    top = sorted(counts.items(), key=lambda item: (-item[1], item[0]))[:8]
    maximum = max([count for _, count in top], default=1)
    img = canvas()
    text(img, 48, 36, "qualitative theme map", INK, 4)
    y = 120
    for code, count in top:
        w = int(620 * count / maximum)
        rect(img, 72, y, w, 28, EVIDENCE)
        text(img, 72, y + 40, code.replace("_", "-")[:30], TEXT, 2)
        text(img, 720, y + 6, str(count), TEXT, 3)
        y += 72
    write_png(path, 960, 560, img)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--tables-dir", default=str(DEFAULT_TABLES))
    parser.add_argument("--figures-dir", default=str(DEFAULT_FIGURES))
    args = parser.parse_args()

    tables = Path(args.tables_dir)
    figures = Path(args.figures_dir)
    summary = read_csv(tables / "reader_study_summary.csv")
    task_accuracy = read_csv(tables / "task_level_accuracy.csv")
    themes = read_csv(tables / "qualitative_theme_counts.csv")

    bar_chart(
        figures / "task_accuracy_comparison.png",
        "task accuracy comparison",
        aggregate_mean(task_accuracy, "condition", "accuracy"),
        1.0,
    )
    bar_chart(
        figures / "misinterpretation_rate_comparison.png",
        "misinterpretation rate",
        aggregate_mean(summary, "condition", "frequency_misinterpretation_rate"),
        1.0,
    )
    bar_chart(
        figures / "source_transparency_ratings.png",
        "source transparency ratings",
        aggregate_mean(summary, "condition", "source_transparency_rating_mean"),
        7.0,
    )
    theme_map(figures / "qualitative_theme_map.png", themes)


if __name__ == "__main__":
    main()
