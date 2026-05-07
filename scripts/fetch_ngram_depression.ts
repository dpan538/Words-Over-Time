import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = path.join(process.cwd(), "src", "data", "generated");
const FREQUENCY_FILE = path.join(OUT_DIR, "depression_frequency.json");
const AUDIT_FILE = path.join(OUT_DIR, "depression_terms_audit.json");

const startYear = 1500;
const endYear = 2022;
const corpus = "en";
const smoothing = 0;

const candidateTerms = [
  { query: "depression", group: "core", comparisonRole: "target word" },
  { query: "melancholy", group: "mood-historical", comparisonRole: "historical mood neighbor" },
  { query: "melancholia", group: "mood-historical", comparisonRole: "medical-historical neighbor" },
  { query: "sadness", group: "mood-related", comparisonRole: "broad mood neighbor" },
  { query: "despair", group: "mood-related", comparisonRole: "intense mood neighbor" },
  { query: "gloom", group: "mood-related", comparisonRole: "literary mood neighbor" },
  { query: "anxiety", group: "mood-related", comparisonRole: "adjacent mental-health neighbor" },
  { query: "low spirits", group: "mood-phrase", comparisonRole: "historical phrase neighbor" },
  { query: "mental depression", group: "clinical-psychiatric", comparisonRole: "clinical phrase candidate" },
  { query: "clinical depression", group: "clinical-psychiatric", comparisonRole: "modern clinical phrase" },
  { query: "major depression", group: "clinical-psychiatric", comparisonRole: "modern clinical phrase" },
  { query: "depressive disorder", group: "clinical-psychiatric", comparisonRole: "diagnostic phrase" },
  { query: "depression disorder", group: "clinical-psychiatric", comparisonRole: "diagnostic phrase variant" },
  { query: "economic depression", group: "economic", comparisonRole: "economic phrase" },
  { query: "great depression", group: "economic", comparisonRole: "named economic event phrase" },
  { query: "financial depression", group: "economic", comparisonRole: "economic phrase" },
  { query: "business depression", group: "economic", comparisonRole: "economic phrase" },
  { query: "topographical depression", group: "geographical", comparisonRole: "geographical phrase" },
  { query: "geological depression", group: "geographical", comparisonRole: "geological phrase" },
];

type NgramResponse = {
  ngram: string;
  parent: string;
  type: string;
  timeseries: number[];
};

type Point = {
  year: number;
  value: number;
  frequencyPerMillion: number;
};

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function batch<T>(items: T[], size: number) {
  const batches: T[][] = [];
  for (let index = 0; index < items.length; index += size) batches.push(items.slice(index, index + size));
  return batches;
}

function colorForGroup(group: string) {
  const colors: Record<string, string> = {
    core: "#F06B04",
    "mood-historical": "#1570AC",
    "mood-related": "#2C9FC7",
    "mood-phrase": "#036C17",
    "clinical-psychiatric": "#A1081F",
    economic: "#FBB728",
    geographical: "#5FCA00",
  };

  return colors[group] ?? "#050510";
}

function rangeStats(points: Point[], start: number, end: number) {
  const range = points.filter((point) => point.year >= start && point.year <= end);
  const nonZero = range.filter((point) => point.value > 0);
  const values = range.map((point) => point.frequencyPerMillion);
  const max = Math.max(0, ...values);
  const average = values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;

  return {
    startYear: start,
    endYear: end,
    pointCount: range.length,
    nonZeroYearCount: nonZero.length,
    firstNonZeroYear: nonZero[0]?.year ?? null,
    averageFrequencyPerMillion: Number(average.toFixed(8)),
    maxFrequencyPerMillion: Number(max.toFixed(8)),
  };
}

function firstYearAbove(points: Point[], threshold: number) {
  return points.find((point) => point.frequencyPerMillion >= threshold)?.year ?? null;
}

function usability(points: Point[]) {
  const post1700 = rangeStats(points, 1700, 2022);
  const post1900 = rangeStats(points, 1900, 2022);
  const max = post1700.maxFrequencyPerMillion;

  if (post1700.nonZeroYearCount < 8 || max < 0.00001) {
    return {
      status: "too-sparse",
      visualUse: "audit-only",
      note: "Too sparse for a primary visual trace; keep as audit data or small annotation only.",
    };
  }

  if (post1700.nonZeroYearCount < 60 || max < 0.0002) {
    return {
      status: "sparse-but-usable",
      visualUse: "secondary",
      note: "Usable as a secondary trace or marker layer, but not strong enough to anchor a main visual alone.",
    };
  }

  if (post1900.nonZeroYearCount > 80 && max >= 0.001) {
    return {
      status: "usable",
      visualUse: "primary-or-secondary",
      note: "Enough signal for comparison, with strongest reliability in the modern book period.",
    };
  }

  return {
    status: "usable-with-caution",
    visualUse: "secondary",
    note: "Useful for comparison, but interpretation should be tied to sense/category evidence.",
  };
}

function visualStartRecommendation(points: Point[]) {
  const stats1500 = rangeStats(points, 1500, 1599);
  const stats1600 = rangeStats(points, 1600, 1699);
  const stats1700 = rangeStats(points, 1700, 1799);

  if (stats1500.nonZeroYearCount >= 25 && stats1500.maxFrequencyPerMillion >= 0.00005) {
    return {
      startYear: 1500,
      earlyStatus: "visible-but-early-print-noisy",
      note: "The 1500s contain visible signal, but this should be styled as early-print/noisy frequency evidence.",
    };
  }

  if (stats1600.nonZeroYearCount >= 20 && stats1600.maxFrequencyPerMillion >= 0.00005) {
    return {
      startYear: 1600,
      earlyStatus: "usable-with-caution",
      note: "The 1600s contain enough signal for a cautious early trace; default public views should still emphasize 1700 onward.",
    };
  }

  if (stats1700.nonZeroYearCount >= 20) {
    return {
      startYear: 1700,
      earlyStatus: "pre-1700-too-sparse-or-noisy",
      note: "Pre-1700 signal is too sparse or unstable for a confident visual baseline.",
    };
  }

  return {
    startYear: 1800,
    earlyStatus: "late-emerging-or-very-sparse",
    note: "The series is too sparse before 1800 for a strong public visual trace.",
  };
}

function semanticReliability(term: (typeof candidateTerms)[number], recommendationStartYear: number) {
  const query = term.query.toLowerCase();

  if (["clinical depression", "major depression", "depressive disorder", "depression disorder"].includes(query)) {
    return {
      recommendedVisualStartYear: Math.max(1900, recommendationStartYear),
      semanticStatus: "modern-clinical-sense-only",
      semanticCaveat:
        "Earlier Ngram hits may be literal or non-diagnostic phrase uses. Do not use pre-1900 values as clinical evidence without quotation review.",
    };
  }

  if (query === "mental depression") {
    return {
      recommendedVisualStartYear: Math.max(1800, recommendationStartYear),
      semanticStatus: "clinical-bridge-phrase",
      semanticCaveat:
        "Mental depression can bridge older affective language and later clinical usage; inspect snippets before assigning it to psychiatry.",
    };
  }

  if (query === "great depression") {
    return {
      recommendedVisualStartYear: Math.max(1900, recommendationStartYear),
      semanticStatus: "named-event-modern-only",
      semanticCaveat:
        "Pre-1930 values do not necessarily refer to the Great Depression as a named event.",
    };
  }

  if (term.group === "economic") {
    return {
      recommendedVisualStartYear: Math.max(1800, recommendationStartYear),
      semanticStatus: "economic-sense-needs-context",
      semanticCaveat:
        "Economic readings should be tied to trade, market, or business context; early phrase hits may be noisy.",
    };
  }

  if (term.group === "geographical") {
    return {
      recommendedVisualStartYear: Math.max(1800, recommendationStartYear),
      semanticStatus: "small-branch-candidate",
      semanticCaveat:
        "The geographical/topographical branch is semantically important but relatively sparse in the current audit.",
    };
  }

  return {
    recommendedVisualStartYear: recommendationStartYear,
    semanticStatus: "frequency-series",
    semanticCaveat:
      "Frequency shows printed form visibility only; category assignment requires context evidence.",
  };
}

async function fetchBatch(terms: typeof candidateTerms) {
  const url = new URL("https://books.google.com/ngrams/json");
  url.searchParams.set("content", terms.map((term) => term.query).join(","));
  url.searchParams.set("year_start", String(startYear));
  url.searchParams.set("year_end", String(endYear));
  url.searchParams.set("corpus", corpus);
  url.searchParams.set("smoothing", String(smoothing));
  url.searchParams.set("case_insensitive", "false");

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Google Ngram request failed: ${response.status} ${response.statusText}`);
  }

  return {
    url: url.toString(),
    rows: (await response.json()) as NgramResponse[],
  };
}

const sourceUrls: string[] = [];
const rowsByQuery = new Map<string, NgramResponse>();

for (const terms of batch(candidateTerms, 8)) {
  console.log(`Fetching Ngram batch: ${terms.map((term) => term.query).join(", ")}`);
  const { url, rows } = await fetchBatch(terms);
  sourceUrls.push(url);
  rows.forEach((row) => rowsByQuery.set(row.ngram.toLowerCase(), row));
}

const series = candidateTerms.map((term) => {
  const row = rowsByQuery.get(term.query.toLowerCase());
  const points = row
    ? row.timeseries.map((value, index) => ({
        year: startYear + index,
        value,
        frequencyPerMillion: value * 1_000_000,
      }))
    : Array.from({ length: endYear - startYear + 1 }, (_, index) => ({
        year: startYear + index,
        value: 0,
        frequencyPerMillion: 0,
      }));
  const firstNonZero = points.find((point) => point.value > 0);
  const status = usability(points);
  const startRecommendation = visualStartRecommendation(points);
  const semantic = semanticReliability(term, startRecommendation.startYear);

  return {
    id: slug(term.query),
    label: term.query,
    query: term.query,
    group: term.group,
    comparisonRole: term.comparisonRole,
    color: colorForGroup(term.group),
    source: "Google Books Ngram Viewer",
    corpus,
    smoothing,
    startYear,
    endYear,
    firstNonZeroYear: firstNonZero?.year ?? null,
    firstYearAbove000001PerMillion: firstYearAbove(points, 0.00001),
    recommendedVisualStartYear: semantic.recommendedVisualStartYear,
    earlyFrequencyStatus: startRecommendation.earlyStatus,
    coverageNote: startRecommendation.note,
    semanticStatus: semantic.semanticStatus,
    semanticCaveat: semantic.semanticCaveat,
    usabilityStatus: status.status,
    visualUse: status.visualUse,
    usabilityNote: status.note,
    rangeStats: [
      rangeStats(points, 1500, 1599),
      rangeStats(points, 1600, 1699),
      rangeStats(points, 1700, 1799),
      rangeStats(points, 1800, 1899),
      rangeStats(points, 1900, 2022),
    ],
    points,
  };
});

const audit = {
  generatedAt: new Date().toISOString(),
  source: {
    label: "Google Books Ngram Viewer",
    urls: sourceUrls,
    corpus,
    startYear,
    endYear,
    smoothing,
    caveat:
      "Frequency series are book ngram fractions, not sense classification, first-use evidence, or contextual snippets.",
  },
  terms: series.map((row) => {
    const { points: _points, ...rest } = row;
    return rest;
  }),
};

const frequency = {
  generatedAt: new Date().toISOString(),
  source: {
    label: "Google Books Ngram Viewer",
    urls: sourceUrls,
    corpus,
    startYear,
    endYear,
    smoothing,
    note:
      "Values are yearly Ngram fractions converted to frequency per million. Pre-1700 values are retained for audit and should be treated cautiously.",
  },
  series,
};

await mkdir(OUT_DIR, { recursive: true });
await writeFile(FREQUENCY_FILE, `${JSON.stringify(frequency, null, 2)}\n`);
await writeFile(AUDIT_FILE, `${JSON.stringify(audit, null, 2)}\n`);
console.log(`Wrote ${FREQUENCY_FILE}`);
console.log(`Wrote ${AUDIT_FILE}`);
