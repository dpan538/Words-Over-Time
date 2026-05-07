import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = path.join(process.cwd(), "src", "data", "generated");
const OUT_FILE = path.join(OUT_DIR, "forever_frequency.json");

const queries = ["forever", "for ever", "forevermore", "forever and ever"];
const startYear = 1500;
const endYear = 2022;
const corpus = "en";
const smoothing = 0;

type NgramResponse = {
  ngram: string;
  parent: string;
  type: string;
  timeseries: number[];
};

function rangeStats(points: Array<{ year: number; frequencyPerMillion: number }>, start: number, end: number) {
  const range = points.filter((point) => point.year >= start && point.year <= end);
  const nonZero = range.filter((point) => point.frequencyPerMillion > 0);
  const values = range.map((point) => point.frequencyPerMillion);
  const average =
    values.length > 0 ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;

  return {
    startYear: start,
    endYear: end,
    pointCount: range.length,
    nonZeroYearCount: nonZero.length,
    averageFrequencyPerMillion: Number(average.toFixed(6)),
    maxFrequencyPerMillion: Number(Math.max(0, ...values).toFixed(6)),
  };
}

function recommendationForQuery(query: string) {
  if (query === "for ever") {
    return {
      visualStartYear: 1600,
      status: "usable-with-caution",
      note: "The spaced form has substantial pre-1700 signal, but 1500s values should still be treated as early-print/noisy.",
    };
  }

  if (query === "forever") {
    return {
      visualStartYear: 1700,
      status: "pre-1700-too-unstable",
      note: "Pre-1700 one-word values are visually tempting but likely mix OCR, spelling normalization, and metadata noise. Use as audit data, not the default public line.",
    };
  }

  if (query === "forevermore") {
    return {
      visualStartYear: 1700,
      status: "pre-1700-too-sparse",
      note: "Pre-1700 signal is sparse and conflicts with some lexical-source dating. Use for audit only until verified against early-print text.",
    };
  }

  return {
    visualStartYear: 1700,
    status: "pre-1700-too-sparse",
    note: "Pre-1700 phrase signal is sparse. Use the full series for audit, but public context needs separate attestation or early-print evidence.",
  };
}

function colorForQuery(query: string) {
  const colors: Record<string, string> = {
    forever: "#F06B04",
    "for ever": "#2C9FC7",
    forevermore: "#FBB728",
    "forever and ever": "#A1081F",
  };

  return colors[query] ?? "#050510";
}

const url = new URL("https://books.google.com/ngrams/json");
url.searchParams.set("content", queries.join(","));
url.searchParams.set("year_start", String(startYear));
url.searchParams.set("year_end", String(endYear));
url.searchParams.set("corpus", corpus);
url.searchParams.set("smoothing", String(smoothing));
url.searchParams.set("case_insensitive", "false");

const response = await fetch(url);
if (!response.ok) {
  throw new Error(`Google Ngram request failed: ${response.status} ${response.statusText}`);
}

const rows = (await response.json()) as NgramResponse[];
const generatedSeries = rows.map((row) => {
  const points = row.timeseries.map((value, index) => ({
    year: startYear + index,
    value,
    frequencyPerMillion: value * 1_000_000,
  }));
  const firstNonZeroPoint = points.find((point) => point.value > 0);
  const recommendation = recommendationForQuery(row.ngram);

  return {
    id: row.ngram.toLowerCase().split(" ").join("-"),
    label: row.ngram,
    query: row.ngram,
    color: colorForQuery(row.ngram),
    source: "Google Books Ngram Viewer",
    sourceUrl: url.toString(),
    corpus,
    smoothing,
    startYear,
    endYear,
    inspectorId: `frequency-${row.ngram.toLowerCase().split(" ").join("-")}`,
    firstNonZeroYear: firstNonZeroPoint?.year ?? null,
    recommendedVisualStartYear: recommendation.visualStartYear,
    pre1700Status: recommendation.status,
    coverageNote: recommendation.note,
    rangeStats: [
      rangeStats(points, 1500, 1599),
      rangeStats(points, 1600, 1699),
      rangeStats(points, 1700, 1799),
      rangeStats(points, 1800, 2022),
    ],
    points,
  };
});

const generated = {
  generatedAt: new Date().toISOString(),
  source: {
    label: "Google Books Ngram Viewer",
    url: url.toString(),
    corpus,
    startYear,
    endYear,
    smoothing,
    note: "Values are yearly Ngram fractions. The app converts them to frequency per million for display. Pre-1700 values are generated for audit, not automatically trusted for public visuals.",
  },
  series: generatedSeries,
};

await mkdir(OUT_DIR, { recursive: true });
await writeFile(OUT_FILE, `${JSON.stringify(generated, null, 2)}\n`);
console.log(`Wrote ${OUT_FILE}`);
