import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const BASE_DIR = path.join(process.cwd(), "docs", "research", "artificial", "chart_03_mechanical_reproduction");
const RAW_DIR = path.join(BASE_DIR, "raw");
const PROCESSED_DIR = path.join(BASE_DIR, "processed");
const NOTES_DIR = path.join(BASE_DIR, "notes");

const START_YEAR = 1800;
const END_YEAR = 2020;
const CORPUS = "en";
const CORPUS_LABEL = "English";
const SMOOTHING = 0;
const CASE_INSENSITIVE = true;
const SOURCE = "Google Books Ngram Viewer";
const ENDPOINT = "https://books.google.com/ngrams/json";
const BATCH_SIZE = 8;
const REQUEST_DELAY_MS = 350;

type QueryGroup =
  | "chart06_sense"
  | "chart06_material"
  | "chart06_biological"
  | "chart06_cognitive"
  | "chart06_social";

type Status = "collected" | "missing" | "too_sparse" | "error";

type TermDefinition = {
  term: string;
  query_group: QueryGroup;
  semantic_domain: string;
  narrative_role: string;
};

type NgramResponse = {
  ngram: string;
  parent?: string;
  type?: string;
  timeseries: number[];
};

type RawPoint = {
  year: number;
  term: string;
  value: number;
  source: string;
  corpus: string;
  smoothing: number;
  case_sensitive: boolean;
  query_group: QueryGroup;
  semantic_domain: string;
  narrative_role: string;
};

type TermResult = {
  term: string;
  query_group: QueryGroup;
  semantic_domain: string;
  narrative_role: string;
  status: Status;
  request_url: string | null;
  returned_ngram: string | null;
  points: RawPoint[];
  error: string | null;
  notes: string;
};

const termGroups: Record<QueryGroup, TermDefinition[]> = {
  chart06_sense: [
    ["artificial light", "early sensory substitute / illumination anchor"],
    ["artificial colour", "British spelling; color and perception manufacturing"],
    ["artificial color", "American spelling; color and perception manufacturing"],
    ["artificial flower", "decorative substitute and artificial natural object"],
    ["artificial flavour", "British spelling; food-sensory substitute and suspicion"],
    ["artificial flavor", "American spelling; food-sensory substitute and suspicion"],
    ["artificial sweetener", "taste substitute and consumer-regulatory signal"],
  ].map(([term, narrative_role]) => ({
    term,
    narrative_role,
    query_group: "chart06_sense",
    semantic_domain: "SENSE",
  })),

  chart06_material: [
    ["artificial silk", "industrial textile substitute"],
    ["artificial stone", "engineered building/material substitute"],
    ["artificial rubber", "synthetic/wartime material substitute"],
    ["artificial fibre", "British spelling; synthetic textile material"],
    ["artificial fiber", "American spelling; synthetic textile material"],
    ["artificial resin", "synthetic material and industrial polymer vocabulary"],
  ].map(([term, narrative_role]) => ({
    term,
    narrative_role,
    query_group: "chart06_material",
    semantic_domain: "MATERIAL",
  })),

  chart06_biological: [
    ["artificial respiration", "life-support intervention and artificial bodily process"],
    ["artificial limb", "prosthetic body part"],
    ["artificial insemination", "reproductive technology and postwar biological intervention"],
    ["artificial kidney", "organ replacement / medical machine"],
    ["artificial heart", "organ replacement frontier"],
    ["artificial organ", "general organ-replacement phrase"],
  ].map(([term, narrative_role]) => ({
    term,
    narrative_role,
    query_group: "chart06_biological",
    semantic_domain: "BIOLOGICAL",
  })),

  chart06_cognitive: [
    ["artificial language", "constructed symbolic/cognitive system"],
    ["artificial memory", "memory metaphor / cognitive prosthesis phrase"],
    ["artificial intelligence", "machine cognition anchor"],
    ["artificial reasoning", "machine/cognitive-process phrase"],
    ["artificial neural network", "late cognitive/AI technical phrase"],
  ].map(([term, narrative_role]) => ({
    term,
    narrative_role,
    query_group: "chart06_cognitive",
    semantic_domain: "COGNITIVE",
  })),

  chart06_social: [
    ["artificial manner", "social conduct and performed style"],
    ["artificial behaviour", "British spelling; social/moral artificiality"],
    ["artificial behavior", "American spelling; social/moral artificiality"],
    ["artificial smile", "performed emotion and authenticity pressure"],
    ["artificial dignity", "moral/social performance phrase"],
    ["artificial excitement", "performed affect and social artificiality"],
  ].map(([term, narrative_role]) => ({
    term,
    narrative_role,
    query_group: "chart06_social",
    semantic_domain: "SOCIAL",
  })),
};

const rawFiles: Record<QueryGroup, string> = {
  chart06_sense: "chart_06_ngram_raw_sense.csv",
  chart06_material: "chart_06_ngram_raw_material.csv",
  chart06_biological: "chart_06_ngram_raw_biological.csv",
  chart06_cognitive: "chart_06_ngram_raw_cognitive.csv",
  chart06_social: "chart_06_ngram_raw_social.csv",
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function batch<T>(items: T[], size: number) {
  const groups: T[][] = [];
  for (let index = 0; index < items.length; index += size) groups.push(items.slice(index, index + size));
  return groups;
}

function canonical(value: string) {
  return value
    .toLowerCase()
    .replace(/\s*\(all\)$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function slug(value: string) {
  return value.replace(/[^a-z0-9]+/gi, "_").replace(/^_|_$/g, "").toLowerCase();
}

function csvValue(value: string | number | boolean | null) {
  if (value === null) return "";
  const text = String(value);
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function csvRows(headers: string[], rows: Array<Record<string, string | number | boolean | null>>) {
  return [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => csvValue(row[header] ?? "")).join(",")),
  ].join("\n");
}

function ngramUrl(terms: string[]) {
  const url = new URL(ENDPOINT);
  url.searchParams.set("content", terms.join(","));
  url.searchParams.set("year_start", String(START_YEAR));
  url.searchParams.set("year_end", String(END_YEAR));
  url.searchParams.set("corpus", CORPUS);
  url.searchParams.set("smoothing", String(SMOOTHING));
  url.searchParams.set("case_insensitive", String(CASE_INSENSITIVE));
  return url;
}

async function fetchRows(terms: TermDefinition[]) {
  const url = ngramUrl(terms.map((term) => term.term));
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Google Ngram request failed: ${response.status} ${response.statusText}`);
  }
  return { url: url.toString(), rows: (await response.json()) as NgramResponse[] };
}

function preferAggregateRows(rows: NgramResponse[]) {
  const byCanonical = new Map<string, NgramResponse>();
  for (const row of rows) {
    const key = canonical(row.ngram);
    const existing = byCanonical.get(key);
    const isAggregate = /\(all\)$/i.test(row.ngram);
    const existingIsAggregate = existing ? /\(all\)$/i.test(existing.ngram) : false;
    if (!existing || (isAggregate && !existingIsAggregate)) byCanonical.set(key, row);
  }
  return byCanonical;
}

function pointsFor(term: TermDefinition, row: NgramResponse): RawPoint[] {
  return row.timeseries.map((value, index) => ({
    year: START_YEAR + index,
    term: term.term,
    value,
    source: SOURCE,
    corpus: CORPUS,
    smoothing: SMOOTHING,
    case_sensitive: !CASE_INSENSITIVE,
    query_group: term.query_group,
    semantic_domain: term.semantic_domain,
    narrative_role: term.narrative_role,
  }));
}

function resultFromRow(term: TermDefinition, row: NgramResponse, requestUrl: string): TermResult {
  const points = pointsFor(term, row);
  const nonZeroCount = points.filter((point) => point.value > 0).length;
  const status: Status = nonZeroCount === 0 ? "missing" : nonZeroCount <= 3 ? "too_sparse" : "collected";
  return {
    term: term.term,
    query_group: term.query_group,
    semantic_domain: term.semantic_domain,
    narrative_role: term.narrative_role,
    status,
    request_url: requestUrl,
    returned_ngram: row.ngram,
    points,
    error: null,
    notes:
      status === "missing"
        ? "Ngram returned a row, but all yearly values were zero."
        : status === "too_sparse"
          ? "Ngram returned only one to three nonzero years; keep for audit only until checked against other sources."
          : "",
  };
}

function missingResult(term: TermDefinition, requestUrl: string): TermResult {
  return {
    term: term.term,
    query_group: term.query_group,
    semantic_domain: term.semantic_domain,
    narrative_role: term.narrative_role,
    status: "missing",
    request_url: requestUrl,
    returned_ngram: null,
    points: [],
    error: null,
    notes: "No row returned by Google Ngram for this query.",
  };
}

function errorResult(term: TermDefinition, requestUrl: string | null, error: unknown): TermResult {
  return {
    term: term.term,
    query_group: term.query_group,
    semantic_domain: term.semantic_domain,
    narrative_role: term.narrative_role,
    status: "error",
    request_url: requestUrl,
    returned_ngram: null,
    points: [],
    error: error instanceof Error ? error.message : String(error),
    notes: "Request failed; no frequency values collected.",
  };
}

async function collectBatch(terms: TermDefinition[]) {
  const requestUrl = ngramUrl(terms.map((term) => term.term)).toString();
  try {
    const { url, rows } = await fetchRows(terms);
    const byCanonical = preferAggregateRows(rows);
    return terms.map((term) => {
      const row = byCanonical.get(canonical(term.term));
      return row ? resultFromRow(term, row, url) : missingResult(term, url);
    });
  } catch (batchError) {
    const results: TermResult[] = [];
    for (const term of terms) {
      await sleep(REQUEST_DELAY_MS);
      const singleUrl = ngramUrl([term.term]).toString();
      try {
        const { url, rows } = await fetchRows([term]);
        const row = preferAggregateRows(rows).get(canonical(term.term));
        results.push(row ? resultFromRow(term, row, url) : missingResult(term, url));
      } catch (singleError) {
        results.push(errorResult(term, singleUrl, singleError));
      }
    }
    if (results.every((result) => result.status === "error")) {
      return terms.map((term) => errorResult(term, requestUrl, batchError));
    }
    return results;
  }
}

function averageFor(points: RawPoint[], firstYear: number, lastYear: number) {
  const window = points.filter((point) => point.year >= firstYear && point.year <= lastYear);
  if (!window.length) return null;
  return window.reduce((sum, point) => sum + point.value, 0) / window.length;
}

function thresholdYear(points: RawPoint[], threshold: number) {
  return points.find((point) => point.value >= threshold)?.year ?? null;
}

function statsFor(result: TermResult) {
  const nonZero = result.points.filter((point) => point.value > 0);
  const peak = result.points.reduce(
    (best, point) => (point.value > best.value ? point : best),
    { year: null as number | null, value: 0 },
  );
  const recent = [...result.points].reverse().find((point) => point.value > 0) ?? null;
  const millionScale = 1_000_000;
  const avg1800_1849 = averageFor(result.points, 1800, 1849);
  const avg1850_1899 = averageFor(result.points, 1850, 1899);
  const avg1900_1949 = averageFor(result.points, 1900, 1949);
  const avg1950_1999 = averageFor(result.points, 1950, 1999);
  const avg2000_2020 = averageFor(result.points, 2000, 2020);

  return {
    term: result.term,
    term_slug: slug(result.term),
    query_group: result.query_group,
    semantic_domain: result.semantic_domain,
    narrative_role: result.narrative_role,
    status: result.status,
    first_nonzero_year: nonZero[0]?.year ?? null,
    last_nonzero_year: nonZero[nonZero.length - 1]?.year ?? null,
    peak_year: peak.year,
    peak_value: peak.value,
    peak_per_million: peak.value * millionScale,
    recent_year: recent?.year ?? null,
    recent_value: recent?.value ?? null,
    recent_per_million: recent ? recent.value * millionScale : null,
    nonzero_year_count: nonZero.length,
    avg_1800_1849_per_million: avg1800_1849 === null ? null : avg1800_1849 * millionScale,
    avg_1850_1899_per_million: avg1850_1899 === null ? null : avg1850_1899 * millionScale,
    avg_1900_1949_per_million: avg1900_1949 === null ? null : avg1900_1949 * millionScale,
    avg_1950_1999_per_million: avg1950_1999 === null ? null : avg1950_1999 * millionScale,
    avg_2000_2020_per_million: avg2000_2020 === null ? null : avg2000_2020 * millionScale,
    first_above_0_01_per_million: thresholdYear(result.points, 0.01 / millionScale),
    first_above_0_1_per_million: thresholdYear(result.points, 0.1 / millionScale),
    first_above_1_per_million: thresholdYear(result.points, 1 / millionScale),
    returned_ngram: result.returned_ngram,
    notes: result.error ? `${result.notes} Error: ${result.error}` : result.notes,
  };
}

function statusList(results: TermResult[], status: Status) {
  return results.filter((result) => result.status === status).map((result) => result.term);
}

function topSignals(results: TermResult[], limit = 12) {
  return results
    .map((result) => {
      const peak = result.points.reduce((best, point) => Math.max(best, point.value), 0);
      return { term: result.term, semantic_domain: result.semantic_domain, peak_per_million: peak * 1_000_000 };
    })
    .sort((a, b) => b.peak_per_million - a.peak_per_million)
    .slice(0, limit);
}

async function main() {
  const generatedAt = new Date().toISOString();
  await Promise.all([RAW_DIR, PROCESSED_DIR, NOTES_DIR].map((directory) => mkdir(directory, { recursive: true })));

  const allResults: TermResult[] = [];
  const requestUrls: string[] = [];

  for (const group of Object.keys(termGroups) as QueryGroup[]) {
    for (const terms of batch(termGroups[group], BATCH_SIZE)) {
      const results = await collectBatch(terms);
      allResults.push(...results);
      for (const result of results) {
        if (result.request_url && !requestUrls.includes(result.request_url)) requestUrls.push(result.request_url);
      }
      await sleep(REQUEST_DELAY_MS);
    }
  }

  const rawHeaders = [
    "year",
    "term",
    "value",
    "source",
    "corpus",
    "smoothing",
    "case_sensitive",
    "query_group",
    "semantic_domain",
    "narrative_role",
  ];
  for (const group of Object.keys(rawFiles) as QueryGroup[]) {
    const rows = allResults.flatMap((result) => (result.query_group === group ? result.points : []));
    await writeFile(path.join(RAW_DIR, rawFiles[group]), `${csvRows(rawHeaders, rows)}\n`);
  }

  const longRows = allResults.flatMap((result) =>
    result.points.map((point) => ({
      year: point.year,
      term: point.term,
      value: point.value,
      value_per_million: point.value * 1_000_000,
      query_group: point.query_group,
      semantic_domain: point.semantic_domain,
      narrative_role: point.narrative_role,
      source: point.source,
      corpus: point.corpus,
      smoothing: point.smoothing,
      case_sensitive: point.case_sensitive,
    })),
  );
  await writeFile(
    path.join(PROCESSED_DIR, "chart_06_compound_ngram_long.csv"),
    `${csvRows(
      [
        "year",
        "term",
        "value",
        "value_per_million",
        "query_group",
        "semantic_domain",
        "narrative_role",
        "source",
        "corpus",
        "smoothing",
        "case_sensitive",
      ],
      longRows,
    )}\n`,
  );

  const metadata = allResults.map(statsFor);
  await writeFile(
    path.join(PROCESSED_DIR, "chart_06_compound_term_metadata.csv"),
    `${csvRows(
      [
        "term",
        "term_slug",
        "query_group",
        "semantic_domain",
        "narrative_role",
        "status",
        "first_nonzero_year",
        "last_nonzero_year",
        "peak_year",
        "peak_value",
        "peak_per_million",
        "recent_year",
        "recent_value",
        "recent_per_million",
        "nonzero_year_count",
        "avg_1800_1849_per_million",
        "avg_1850_1899_per_million",
        "avg_1900_1949_per_million",
        "avg_1950_1999_per_million",
        "avg_2000_2020_per_million",
        "first_above_0_01_per_million",
        "first_above_0_1_per_million",
        "first_above_1_per_million",
        "returned_ngram",
        "notes",
      ],
      metadata,
    )}\n`,
  );

  const inventory = (Object.keys(termGroups) as QueryGroup[]).flatMap((group) =>
    termGroups[group].map((term) => ({
      term: term.term,
      query_group: group,
      semantic_domain: term.semantic_domain,
      narrative_role: term.narrative_role,
    })),
  );
  await writeFile(
    path.join(PROCESSED_DIR, "chart_06_compound_term_inventory.csv"),
    `${csvRows(["term", "query_group", "semantic_domain", "narrative_role"], inventory)}\n`,
  );

  const attempted = allResults.length;
  const collected = statusList(allResults, "collected");
  const missing = statusList(allResults, "missing");
  const tooSparse = statusList(allResults, "too_sparse");
  const errored = statusList(allResults, "error");
  const strongest = topSignals(allResults);

  const log = `# Chart 06 Compound Expansion Collection Log

Generated: ${generatedAt}

## Script

- \`scripts/fetch_chart_06_compound_expansion.ts\`

## Chart Frame

Chart 06 tracks how \`artificial\` behaves as a prefix across five semantic domains: SENSE, MATERIAL, BIOLOGICAL, COGNITIVE, and SOCIAL.

## Source Method

- Source: ${SOURCE}
- Endpoint: \`${ENDPOINT}\`
- Output root: \`docs/research/artificial/chart_03_mechanical_reproduction\`
- Corpus: \`${CORPUS}\` (${CORPUS_LABEL})
- Date range: ${START_YEAR}-${END_YEAR}
- Smoothing: ${SMOOTHING}
- Case-sensitive query: ${!CASE_INSENSITIVE}
- Case-insensitive parameter: ${CASE_INSENSITIVE}
- Query batching: ${BATCH_SIZE} terms per request, with single-term retry after batch failure

## Terms Attempted

${(Object.keys(termGroups) as QueryGroup[])
  .map((group) => `### ${group}\n\n${termGroups[group].map((term) => `- ${term.term}: ${term.narrative_role}`).join("\n")}`)
  .join("\n\n")}

## Status

- Terms attempted: ${attempted}
- Successfully collected: ${collected.length}
- Missing: ${missing.length}
- Too sparse: ${tooSparse.length}
- Errored: ${errored.length}

${missing.length ? `### Missing\n\n${missing.map((term) => `- ${term}`).join("\n")}` : ""}

${tooSparse.length ? `### Too sparse\n\n${tooSparse.map((term) => `- ${term}`).join("\n")}` : ""}

${errored.length ? `### Errored\n\n${errored.map((term) => `- ${term}`).join("\n")}` : ""}

## Strongest Signals By Peak Frequency

${strongest.map((row) => `- ${row.term} (${row.semantic_domain}): peak ${row.peak_per_million} per million`).join("\n")}

## Output Files

- \`raw/chart_06_ngram_raw_sense.csv\`
- \`raw/chart_06_ngram_raw_material.csv\`
- \`raw/chart_06_ngram_raw_biological.csv\`
- \`raw/chart_06_ngram_raw_cognitive.csv\`
- \`raw/chart_06_ngram_raw_social.csv\`
- \`processed/chart_06_compound_ngram_long.csv\`
- \`processed/chart_06_compound_term_metadata.csv\`
- \`processed/chart_06_compound_term_inventory.csv\`

## Request URLs

${requestUrls.map((url) => `- ${url}`).join("\n")}
`;

  await writeFile(path.join(NOTES_DIR, "chart_06_compound_collection_log.md"), log);

  console.log(`Chart 06 compound collection complete: ${collected.length}/${attempted} collected.`);
  if (missing.length) console.log(`Missing: ${missing.join(", ")}`);
  if (tooSparse.length) console.log(`Too sparse: ${tooSparse.join(", ")}`);
  if (errored.length) console.log(`Errored: ${errored.join(", ")}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
