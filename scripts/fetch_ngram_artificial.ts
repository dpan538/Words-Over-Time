import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const BASE_DIR = path.join(process.cwd(), "docs", "research", "artificial");
const RAW_DIR = path.join(BASE_DIR, "raw");
const PROCESSED_DIR = path.join(BASE_DIR, "processed");
const NOTES_DIR = path.join(BASE_DIR, "notes");

const START_YEAR = 1800;
const END_YEAR = 2019;
const CORPUS = "en";
const CORPUS_LABEL = "English";
const SMOOTHING = 0;
const CASE_INSENSITIVE = true;
const SOURCE = "Google Books Ngram Viewer";
const ENDPOINT = "https://books.google.com/ngrams/json";
const BATCH_SIZE = 8;
const REQUEST_DELAY_MS = 350;

type QueryGroup = "core_term" | "priority_phrase" | "secondary_phrase" | "test_term";
type Status = "collected" | "missing" | "too_sparse" | "error" | "skipped";

type TermDefinition = {
  term: string;
  query_group: QueryGroup;
  priority_note?: string;
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
};

type TermResult = {
  term: string;
  query_group: QueryGroup;
  status: Status;
  request_url: string | null;
  returned_ngram: string | null;
  points: RawPoint[];
  error: string | null;
  notes: string;
};

const termGroups: Record<QueryGroup, TermDefinition[]> = {
  core_term: [
    "artificial",
    "artificially",
    "artifice",
    "artificer",
    "synthetic",
    "fake",
    "man-made",
    "human-made",
    "machine-made",
    "simulated",
  ].map((term) => ({ term, query_group: "core_term" })),
  priority_phrase: [
    "artificial light",
    "artificial flowers",
    "artificial teeth",
    "artificial limb",
    "artificial respiration",
    "artificial selection",
    "artificial insemination",
    "artificial silk",
    "artificial leather",
    "artificial sweetener",
    "artificial color",
    "artificial colour",
    "artificial intelligence",
    "artificial neural network",
    "artificial life",
    "artificial language",
  ].map((term) => ({ term, query_group: "priority_phrase" })),
  secondary_phrase: [
    "artificial day",
    "artificial heart",
    "artificial kidney",
    "artificial breeding",
    "artificial fertilization",
    "artificial incubation",
    "artificial feeding",
    "artificial rubber",
    "artificial fibre",
    "artificial fiber",
    "artificial flavor",
    "artificial flavour",
    "artificial ingredients",
    "artificial vision",
    "artificial consciousness",
    "artificial general intelligence",
    "artificial creativity",
    "artificial voice",
    "artificial companion",
    "artificial womb",
  ].map((term) => ({ term, query_group: "secondary_phrase" })),
  test_term: [
    { term: "artificial agent", priority_note: "Low-priority test term." },
    { term: "artificial image", priority_note: "Low-priority test term." },
    { term: "natural", priority_note: "Low-priority broad/noisy test term." },
  ].map((item) => ({ ...item, query_group: "test_term" })),
};

const rawFiles: Record<QueryGroup, string> = {
  core_term: "artificial_ngram_raw_core_terms.csv",
  priority_phrase: "artificial_ngram_raw_priority_phrases.csv",
  secondary_phrase: "artificial_ngram_raw_secondary_phrases.csv",
  test_term: "artificial_ngram_raw_test_terms.csv",
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
  }));
}

function resultFromRow(term: TermDefinition, row: NgramResponse, requestUrl: string): TermResult {
  const points = pointsFor(term, row);
  const nonZeroCount = points.filter((point) => point.value > 0).length;
  const status: Status = nonZeroCount === 0 ? "missing" : nonZeroCount <= 3 ? "too_sparse" : "collected";
  const notes =
    status === "missing"
      ? "Ngram returned a row, but all yearly values were zero."
      : status === "too_sparse"
        ? "Ngram returned only one to three nonzero years; keep for audit only until checked against other sources."
        : term.priority_note ?? "";

  return {
    term: term.term,
    query_group: term.query_group,
    status,
    request_url: requestUrl,
    returned_ngram: row.ngram,
    points,
    error: null,
    notes,
  };
}

function missingResult(term: TermDefinition, requestUrl: string): TermResult {
  return {
    term: term.term,
    query_group: term.query_group,
    status: "missing",
    request_url: requestUrl,
    returned_ngram: null,
    points: [],
    error: null,
    notes: term.priority_note ?? "No row returned by Google Ngram for this query.",
  };
}

function errorResult(term: TermDefinition, requestUrl: string | null, error: unknown): TermResult {
  return {
    term: term.term,
    query_group: term.query_group,
    status: "error",
    request_url: requestUrl,
    returned_ngram: null,
    points: [],
    error: error instanceof Error ? error.message : String(error),
    notes: term.priority_note ?? "Request failed; no frequency values collected.",
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

function statsFor(result: TermResult) {
  const nonZero = result.points.filter((point) => point.value > 0);
  const peak = result.points.reduce(
    (best, point) => (point.value > best.value ? point : best),
    { year: null as number | null, value: 0 },
  );
  const recent = [...result.points].reverse().find((point) => point.value > 0) ?? null;

  return {
    term: result.term,
    query_group: result.query_group,
    status: result.status,
    first_nonzero_year: nonZero[0]?.year ?? null,
    last_nonzero_year: nonZero[nonZero.length - 1]?.year ?? null,
    peak_year: peak.year,
    peak_value: peak.value,
    recent_year: recent?.year ?? null,
    recent_value: recent?.value ?? null,
    nonzero_year_count: nonZero.length,
    notes: result.error ? `${result.notes} Error: ${result.error}` : result.notes,
  };
}

function topSignals(results: TermResult[], limit = 12) {
  return results
    .map((result) => {
      const peak = result.points.reduce((best, point) => Math.max(best, point.value), 0);
      return { term: result.term, peak };
    })
    .sort((a, b) => b.peak - a.peak)
    .slice(0, limit);
}

function statusList(results: TermResult[], status: Status) {
  return results.filter((result) => result.status === status).map((result) => result.term);
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

  const rawHeaders = ["year", "term", "value", "source", "corpus", "smoothing", "case_sensitive", "query_group"];
  for (const group of Object.keys(rawFiles) as QueryGroup[]) {
    const rows = allResults.flatMap((result) => (result.query_group === group ? result.points : []));
    await writeFile(path.join(RAW_DIR, rawFiles[group]), `${csvRows(rawHeaders, rows)}\n`);
  }

  const longRows = allResults.flatMap((result) =>
    result.points.map((point) => ({
      year: point.year,
      term: point.term,
      value: point.value,
      query_group: point.query_group,
      source: point.source,
      corpus: point.corpus,
      smoothing: point.smoothing,
      case_sensitive: point.case_sensitive,
    })),
  );
  await writeFile(
    path.join(PROCESSED_DIR, "artificial_ngram_long.csv"),
    `${csvRows(["year", "term", "value", "query_group", "source", "corpus", "smoothing", "case_sensitive"], longRows)}\n`,
  );

  const metadata = allResults.map(statsFor);
  await writeFile(
    path.join(PROCESSED_DIR, "artificial_term_metadata.csv"),
    `${csvRows(
      [
        "term",
        "query_group",
        "status",
        "first_nonzero_year",
        "last_nonzero_year",
        "peak_year",
        "peak_value",
        "recent_year",
        "recent_value",
        "nonzero_year_count",
        "notes",
      ],
      metadata,
    )}\n`,
  );

  const variantGroups = {
    artificial_color_colour: {
      label: "artificial color / colour",
      terms: ["artificial color", "artificial colour"],
      merge_status: "not_merged",
    },
    artificial_flavor_flavour: {
      label: "artificial flavor / flavour",
      terms: ["artificial flavor", "artificial flavour"],
      merge_status: "not_merged",
    },
    artificial_fiber_fibre: {
      label: "artificial fiber / fibre",
      terms: ["artificial fiber", "artificial fibre"],
      merge_status: "not_merged",
    },
    artificial_silk_rayon: {
      label: "artificial silk / rayon",
      terms: ["artificial silk", "rayon"],
      merge_status: "not_collected_as_same_term",
      note: "Potential successor relationship only. Rayon was not collected as a frequency term in this round; do not merge in this round.",
    },
  };
  await writeFile(path.join(PROCESSED_DIR, "artificial_variant_groups.json"), `${JSON.stringify(variantGroups, null, 2)}\n`);

  const attempted = allResults.length;
  const collected = statusList(allResults, "collected");
  const missing = statusList(allResults, "missing");
  const tooSparse = statusList(allResults, "too_sparse");
  const errored = statusList(allResults, "error");
  const strongest = topSignals(allResults);

  const collectionLog = `# Artificial Collection Log

Generated: ${generatedAt}

## Scripts

- \`scripts/fetch_ngram_artificial.ts\`

## Source Method

- Source: ${SOURCE}
- Endpoint: \`${ENDPOINT}\`
- Output root: \`docs/research/artificial\`
- Corpus: \`${CORPUS}\` (${CORPUS_LABEL})
- Date range: ${START_YEAR}-${END_YEAR}
- Smoothing: ${SMOOTHING}
- Case-sensitive query: ${!CASE_INSENSITIVE}
- Case-insensitive parameter: ${CASE_INSENSITIVE}
- Query batching: ${BATCH_SIZE} terms per request, with single-term retry after batch failure

## Terms Attempted

${(Object.keys(termGroups) as QueryGroup[])
  .map((group) => `### ${group}\n\n${termGroups[group].map((term) => `- ${term.term}`).join("\n")}`)
  .join("\n\n")}

## Terms Failed

${errored.length ? errored.map((term) => `- ${term}`).join("\n") : "- None"}

## Missing Terms

${missing.length ? missing.map((term) => `- ${term}`).join("\n") : "- None"}

## Too Sparse Terms

${tooSparse.length ? tooSparse.map((term) => `- ${term}`).join("\n") : "- None"}

## Manual Fixes

- None. Values were written directly from the Ngram JSON time series into CSV rows.

## Assumptions

- The English corpus was used for the first pass, matching the user's preferred source setting and keeping the first-round dataset compact.
- Outputs are stored under \`docs/research/artificial\` to distinguish research data storage from the existing \`data\` word/page.
- Existing project precedent uses \`smoothing=0\`; this script follows that convention.
- Case-insensitive Ngram queries were used so capitalization variants such as title-case phrase uses are aggregated.
- For case-insensitive Ngram responses, \`term (All)\` aggregate rows are preferred over individual capitalization rows.
- A term with one to three nonzero years is marked \`too_sparse\`; a term with no returned row or no nonzero values is marked \`missing\`.
- Low-priority test terms were collected because the same workflow handled them cleanly.

## Request URLs

${requestUrls.map((url) => `- ${url}`).join("\n")}

## Unresolved Issues

- Ngram does not disambiguate senses, so all phrase-level interpretation requires later snippet or archive review.
- Rare phrases may fall below Ngram reporting thresholds.
- Google Books corpus updates, OCR, metadata, and language detection can change exact values.
`;
  await writeFile(path.join(NOTES_DIR, "artificial_collection_log.md"), collectionLog);

  const sourceNotes = `# Artificial Source Notes

Generated: ${generatedAt}

## Google Books Ngram

- Source: ${SOURCE}
- Endpoint: \`${ENDPOINT}\`
- Corpus used: \`${CORPUS}\` (${CORPUS_LABEL})
- Date range: ${START_YEAR}-${END_YEAR}
- Smoothing: ${SMOOTHING}
- Case-insensitive: ${CASE_INSENSITIVE}

## Limitations

- Google Books Ngram reflects printed-book visibility, not total language use.
- OCR errors can create false positives or suppress real phrase uses.
- Bibliographic metadata and publication dating can be noisy.
- The data does not provide sense disambiguation.
- Rare phrases may be missing or undercounted because of phrase thresholding.
- Compound terms should not be interpreted from Ngram alone.

## Optional Sources

- No optional non-Ngram sources were fetched in this data-only round.
`;
  await writeFile(path.join(NOTES_DIR, "artificial_source_notes.md"), sourceNotes);

  const availabilityReport = `# Artificial Data Availability Report

Generated: ${generatedAt}

## Summary

- Terms attempted: ${attempted}
- Successfully collected: ${collected.length}
- Missing: ${missing.length}
- Too sparse: ${tooSparse.length}
- Errored: ${errored.length}

## Strongest Visible Frequency Signal

${strongest.map((item) => `- ${item.term}: peak raw Ngram value ${item.peak}`).join("\n")}

## Weak Or Sparse Signal

${tooSparse.length ? tooSparse.map((term) => `- ${term}`).join("\n") : "- None marked too_sparse under the current threshold."}

## Missing Terms

${missing.length ? missing.map((term) => `- ${term}`).join("\n") : "- None"}

## Errored Terms

${errored.length ? errored.map((term) => `- ${term}`).join("\n") : "- None"}

## Spelling Variants

- artificial color / artificial colour
- artificial flavor / artificial flavour
- artificial fiber / artificial fibre

## Terms That May Require Other Sources Beyond Ngram

- artificial day
- artificial teeth
- artificial limb
- artificial insemination
- artificial respiration
- artificial incubation
- artificial companion
- artificial womb
- artificial general intelligence
- artificial consciousness
- artificial creativity
- artificial voice
- artificial image

## Data-Only Notes

- These results describe data availability only.
- A phrase with a usable Ngram signal should still be checked against snippets, dictionaries, or archive sources before interpretation.
- A sparse phrase in Ngram may still be historically important and may need dictionary, newspaper, medical, technical, or archive support.
- The broad test term \`natural\` should not be interpreted from Ngram alone.

## Recommended Next Data-Checking Step

- Manually inspect Ngram snippets or a second corpus/archive source for missing and sparse terms, then decide whether any need non-Ngram support in the next data pass.
`;
  await writeFile(path.join(NOTES_DIR, "artificial_data_availability_report.md"), availabilityReport);

  console.log(`Artificial Ngram collection complete.
Terms attempted: ${attempted}
Collected: ${collected.length}
Missing: ${missing.length}
Too sparse: ${tooSparse.length}
Errored: ${errored.length}`);
}

await main();
