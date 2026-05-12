import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const BASE_DIR = path.join(process.cwd(), "docs", "research", "artificial", "chart_04_suspicion_distance");
const RAW_DIR = path.join(BASE_DIR, "raw");
const PROCESSED_DIR = path.join(BASE_DIR, "processed");
const NOTES_DIR = path.join(BASE_DIR, "notes");
const SOURCES_DIR = path.join(BASE_DIR, "sources");
const SCRIPTS_DIR = path.join(BASE_DIR, "scripts");

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

type QueryGroup =
  | "core_baseline"
  | "suspicion_negative"
  | "semantic_distance"
  | "natural_opposition_pair"
  | "consumer_packaging"
  | "absence_claim"
  | "optional";

type Status = "collected" | "missing" | "too_sparse" | "error" | "skipped";

type TermDefinition = {
  term: string;
  query_group: QueryGroup;
  notes: string;
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

const groupNotes: Record<QueryGroup, string> = {
  core_baseline: "Broad baseline terms for the artificial/natural/real/fake/synthetic field.",
  suspicion_negative: "Social, emotional, aesthetic, and behavioral phrases that may need context review for affected or insincere senses.",
  semantic_distance: "Comparators for artificial against fake, real, realistic, genuine, synthetic, imitation, simulated, and related terms.",
  natural_opposition_pair: "Paired artificial/natural phrases collected for later side-by-side review.",
  consumer_packaging: "Consumer, ingredient, packaging, and processed-product phrases.",
  absence_claim: "Absence claims where artificial may become marketable by omission.",
  optional: "Optional material, chemical, dye, product, substitute, and copy phrases.",
};

const termGroups: Record<QueryGroup, TermDefinition[]> = {
  core_baseline: [
    "artificial",
    "artificially",
    "artificiality",
    "artifice",
    "natural",
    "real",
    "realistic",
    "fake",
    "genuine",
    "synthetic",
    "imitation",
    "simulated",
    "constructed",
    "processed",
    "manufactured",
    "man-made",
    "man made",
    "human-made",
    "human made",
    "machine-made",
    "machine made",
  ].map((term) => ({ term, query_group: "core_baseline", notes: groupNotes.core_baseline })),

  suspicion_negative: [
    "artificial smile",
    "artificial manner",
    "artificial manners",
    "artificial style",
    "artificial expression",
    "artificial behaviour",
    "artificial behavior",
    "artificial sentiment",
    "artificial passion",
    "artificial emotion",
    "artificial feeling",
    "artificial tears",
    "artificial politeness",
    "artificial society",
    "artificial life",
    "artificial world",
    "artificial taste",
    "artificial charm",
    "artificial elegance",
    "artificial refinement",
    "artificial simplicity",
    "artificial constraint",
  ].map((term) => ({ term, query_group: "suspicion_negative", notes: groupNotes.suspicion_negative })),

  semantic_distance: [
    "artificial intelligence",
    "artificial life",
    "artificial language",
    "artificial image",
    "artificial voice",
    "artificial sound",
    "artificial scene",
    "artificial scenery",
    "artificial effect",
    "artificial effects",
    "realistic",
    "realism",
    "unrealistic",
    "unreal",
    "not real",
    "not genuine",
    "genuine",
    "authentic",
    "authenticity",
    "inauthentic",
    "fake",
    "falseness",
    "false",
    "counterfeit",
    "sham",
    "imitation",
    "synthetic",
    "simulated",
    "simulation",
  ].map((term) => ({ term, query_group: "semantic_distance", notes: groupNotes.semantic_distance })),

  natural_opposition_pair: [
    "artificial light",
    "natural light",
    "artificial flavor",
    "natural flavor",
    "artificial flavour",
    "natural flavour",
    "artificial color",
    "natural color",
    "artificial colour",
    "natural colour",
    "artificial ingredients",
    "natural ingredients",
    "artificial sweetener",
    "natural sweetener",
    "artificial selection",
    "natural selection",
    "artificial language",
    "natural language",
    "artificial intelligence",
    "natural intelligence",
    "artificial life",
    "natural life",
  ].map((term) => ({ term, query_group: "natural_opposition_pair", notes: groupNotes.natural_opposition_pair })),

  consumer_packaging: [
    "artificial ingredients",
    "artificial flavor",
    "artificial flavour",
    "artificial color",
    "artificial colour",
    "artificial colors",
    "artificial colours",
    "artificial sweetener",
    "artificial sweeteners",
    "artificial preservatives",
    "artificial additives",
    "artificially flavored",
    "artificially flavoured",
    "artificially colored",
    "artificially coloured",
  ].map((term) => ({ term, query_group: "consumer_packaging", notes: groupNotes.consumer_packaging })),

  absence_claim: [
    "no artificial ingredients",
    "no artificial flavors",
    "no artificial flavours",
    "no artificial colors",
    "no artificial colours",
    "no artificial preservatives",
    "nothing artificial",
    "free from artificial",
    "without artificial",
    "contains no artificial",
    "all natural",
    "clean label",
    "real ingredients",
    "simple ingredients",
  ].map((term) => ({ term, query_group: "absence_claim", notes: groupNotes.absence_claim })),

  optional: [
    "artificial chemicals",
    "artificial chemical",
    "artificial dyes",
    "artificial dye",
    "artificial colouring",
    "artificial coloring",
    "artificial substance",
    "artificial substances",
    "artificial material",
    "artificial materials",
    "artificial product",
    "artificial products",
    "artificial substitute",
    "artificial substitutes",
    "artificial imitation",
    "artificial copy",
    "artificial copies",
  ].map((term) => ({ term, query_group: "optional", notes: groupNotes.optional })),
};

const rawFiles: Record<QueryGroup, string> = {
  core_baseline: "chart_04_ngram_raw_core_terms.csv",
  suspicion_negative: "chart_04_ngram_raw_suspicion_terms.csv",
  semantic_distance: "chart_04_ngram_raw_distance_terms.csv",
  natural_opposition_pair: "chart_04_ngram_raw_phrase_pairs.csv",
  consumer_packaging: "chart_04_ngram_raw_consumer_terms.csv",
  absence_claim: "chart_04_ngram_raw_absence_claims.csv",
  optional: "chart_04_ngram_raw_optional_terms.csv",
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
  return value.toLowerCase().replace(/\s*\(all\)$/i, "").replace(/\s+/g, " ").trim();
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
  if (!response.ok) throw new Error(`Google Ngram request failed: ${response.status} ${response.statusText}`);
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
  return {
    term: term.term,
    query_group: term.query_group,
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
          : term.notes,
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
    notes: "No row returned by Google Ngram for this query.",
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

function topSignals(results: TermResult[], limit = 10) {
  return results
    .map((result) => ({
      term: result.term,
      query_group: result.query_group,
      peak: result.points.reduce((best, point) => Math.max(best, point.value), 0),
    }))
    .sort((a, b) => b.peak - a.peak)
    .slice(0, limit);
}

function statusList(results: TermResult[], status: Status) {
  return results.filter((result) => result.status === status).map((result) => `${result.term} [${result.query_group}]`);
}

function groupResults(results: TermResult[], group: QueryGroup) {
  return results.filter((result) => result.query_group === group);
}

function groupSummary(results: TermResult[], group: QueryGroup) {
  const subset = groupResults(results, group);
  const strongest = topSignals(subset, 5).map((item) => item.term).join("; ");
  const weakest = subset
    .filter((result) => result.status === "missing" || result.status === "too_sparse" || result.status === "error")
    .map((result) => result.term)
    .slice(0, 8)
    .join("; ");
  return {
    group,
    total_terms: subset.length,
    collected: subset.filter((result) => result.status === "collected").length,
    missing: subset.filter((result) => result.status === "missing").length,
    too_sparse: subset.filter((result) => result.status === "too_sparse").length,
    errored: subset.filter((result) => result.status === "error").length,
    strongest_terms: strongest,
    weakest_terms: weakest,
    notes: groupNotes[group],
  };
}

function termsRequiringNonNgramSources(results: TermResult[]) {
  const rows: Array<Record<string, string | number | boolean | null>> = [];
  const add = (termOrPhrase: string, reason: string, neededSourceType: string, priority: "high" | "medium" | "low", notes: string) => {
    rows.push({
      term_or_phrase: termOrPhrase,
      reason,
      needed_source_type: neededSourceType,
      priority,
      notes,
    });
  };

  for (const result of results) {
    if (result.query_group === "absence_claim") {
      add(
        result.term,
        "Absence claims are likely underrepresented in books and need advertising, labels, magazines, or packaging language.",
        "newspaper_advertising; magazine_advertising; packaging_language",
        result.status === "missing" || result.status === "too_sparse" ? "high" : "medium",
        `Ngram status: ${result.status}.`,
      );
    }
    if (result.query_group === "consumer_packaging") {
      add(
        result.term,
        "Consumer and ingredient phrases need non-book evidence before being used as packaging or market language.",
        "packaging_language; regulatory_source; magazine_advertising",
        result.status === "missing" || result.status === "too_sparse" ? "high" : "medium",
        `Ngram status: ${result.status}.`,
      );
    }
    if (result.query_group === "suspicion_negative") {
      add(
        result.term,
        "Affective or social phrases require context review because Ngram cannot classify sentiment, irony, or sense.",
        "Google Books snippets; corpus_context; historical_dictionary",
        result.status === "missing" || result.status === "too_sparse" ? "high" : "medium",
        `Ngram status: ${result.status}.`,
      );
    }
    if (["natural", "real", "fake", "false", "genuine", "authentic", "synthetic", "imitation"].includes(result.term)) {
      add(
        result.term,
        "Broad unigram is too ambiguous to interpret without contextual or semantic sources.",
        "semantic_dictionary; corpus_context; dictionary",
        "medium",
        `Ngram status: ${result.status}; query group: ${result.query_group}.`,
      );
    }
    if (result.status === "missing" || result.status === "too_sparse" || result.status === "error") {
      add(
        result.term,
        "Weak or missing Ngram signal needs confirmation before dismissal.",
        "Google Books snippets; corpus_context",
        "high",
        `Ngram status: ${result.status}; query group: ${result.query_group}.`,
      );
    }
  }

  const seen = new Set<string>();
  return rows.filter((row) => {
    const key = `${row.term_or_phrase}|${row.reason}|${row.needed_source_type}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function markdownList(items: string[]) {
  return items.length ? items.map((item) => `- ${item}`).join("\n") : "- None";
}

async function main() {
  const generatedAt = new Date().toISOString();
  await Promise.all(
    [RAW_DIR, PROCESSED_DIR, NOTES_DIR, SOURCES_DIR, SCRIPTS_DIR].map((directory) =>
      mkdir(directory, { recursive: true }),
    ),
  );

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
    path.join(PROCESSED_DIR, "chart_04_ngram_long.csv"),
    `${csvRows(["year", "term", "value", "query_group", "source", "corpus", "smoothing", "case_sensitive"], longRows)}\n`,
  );

  const metadata = allResults.map(statsFor);
  await writeFile(
    path.join(PROCESSED_DIR, "chart_04_term_metadata.csv"),
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
    color_colour: {
      label: "color / colour",
      terms: [
        "artificial color",
        "artificial colour",
        "artificial colors",
        "artificial colours",
        "natural color",
        "natural colour",
      ],
      merge_status: "not_merged",
    },
    flavor_flavour: {
      label: "flavor / flavour",
      terms: [
        "artificial flavor",
        "artificial flavour",
        "natural flavor",
        "natural flavour",
        "no artificial flavors",
        "no artificial flavours",
      ],
      merge_status: "not_merged",
    },
    behavior_behaviour: {
      label: "behavior / behaviour",
      terms: ["artificial behavior", "artificial behaviour"],
      merge_status: "not_merged",
    },
    hyphenated_made_terms: {
      label: "hyphenated / spaced made terms",
      terms: ["man-made", "man made", "human-made", "human made", "machine-made", "machine made"],
      merge_status: "not_merged",
    },
  };
  await writeFile(path.join(PROCESSED_DIR, "chart_04_variant_groups.json"), `${JSON.stringify(variantGroups, null, 2)}\n`);

  const phrasePairGroups = {
    light_pair: {
      label: "natural light / artificial light",
      left: "natural light",
      right: "artificial light",
      pair_type: "natural_opposition",
    },
    flavor_pair: {
      label: "natural flavor / artificial flavor",
      left: "natural flavor",
      right: "artificial flavor",
      pair_type: "natural_opposition",
    },
    flavour_pair: {
      label: "natural flavour / artificial flavour",
      left: "natural flavour",
      right: "artificial flavour",
      pair_type: "natural_opposition",
    },
    color_pair: {
      label: "natural color / artificial color",
      left: "natural color",
      right: "artificial color",
      pair_type: "natural_opposition",
    },
    colour_pair: {
      label: "natural colour / artificial colour",
      left: "natural colour",
      right: "artificial colour",
      pair_type: "natural_opposition",
    },
    ingredients_pair: {
      label: "natural ingredients / artificial ingredients",
      left: "natural ingredients",
      right: "artificial ingredients",
      pair_type: "consumer_opposition",
    },
    sweetener_pair: {
      label: "natural sweetener / artificial sweetener",
      left: "natural sweetener",
      right: "artificial sweetener",
      pair_type: "consumer_opposition",
    },
    selection_pair: {
      label: "natural selection / artificial selection",
      left: "natural selection",
      right: "artificial selection",
      pair_type: "technical_natural_opposition",
    },
    language_pair: {
      label: "natural language / artificial language",
      left: "natural language",
      right: "artificial language",
      pair_type: "semantic_natural_opposition",
    },
    intelligence_pair: {
      label: "natural intelligence / artificial intelligence",
      left: "natural intelligence",
      right: "artificial intelligence",
      pair_type: "cognitive_natural_opposition",
    },
    life_pair: {
      label: "natural life / artificial life",
      left: "natural life",
      right: "artificial life",
      pair_type: "semantic_natural_opposition",
    },
  };
  await writeFile(path.join(PROCESSED_DIR, "chart_04_phrase_pair_groups.json"), `${JSON.stringify(phrasePairGroups, null, 2)}\n`);

  const availabilityRows = (Object.keys(termGroups) as QueryGroup[]).map((group) => groupSummary(allResults, group));
  await writeFile(
    path.join(PROCESSED_DIR, "chart_04_data_availability_summary.csv"),
    `${csvRows(
      ["group", "total_terms", "collected", "missing", "too_sparse", "errored", "strongest_terms", "weakest_terms", "notes"],
      availabilityRows,
    )}\n`,
  );

  const nonNgramRows = termsRequiringNonNgramSources(allResults);
  await writeFile(
    path.join(PROCESSED_DIR, "chart_04_terms_requiring_non_ngram_sources.csv"),
    `${csvRows(["term_or_phrase", "reason", "needed_source_type", "priority", "notes"], nonNgramRows)}\n`,
  );

  const attempted = allResults.length;
  const collected = statusList(allResults, "collected");
  const missing = statusList(allResults, "missing");
  const tooSparse = statusList(allResults, "too_sparse");
  const errored = statusList(allResults, "error");
  const strongest = topSignals(allResults, 16);

  const collectionLog = `# Chart 4 Suspicion / Semantic Distance Collection Log

Generated: ${generatedAt}

## Script

- \`scripts/fetch_chart_04_suspicion_distance.ts\`

## Scope

This is a first-round data collection pass only. It does not design Chart 4, implement visualization, decide whether Chart 4A and Chart 4B become one or two charts, or write final chart copy.

## Source Method

- Source: ${SOURCE}
- Endpoint: \`${ENDPOINT}\`
- Output root: \`docs/research/artificial/chart_04_suspicion_distance\`
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

## Status

- Terms attempted: ${attempted}
- Successfully collected: ${collected.length}
- Missing: ${missing.length}
- Too sparse: ${tooSparse.length}
- Errored: ${errored.length}

## Terms Missing

${markdownList(missing)}

## Too Sparse Terms

${markdownList(tooSparse)}

## Errors

${markdownList(errored)}

## Manual Fixes

- None. Values were written directly from the Ngram JSON time series into raw and processed CSV files.

## Assumptions

- Google Books Ngram is used only as broad frequency / visibility evidence.
- The English corpus, 1800-2019 range, smoothing 0, and case-insensitive aggregate rows match earlier artificial data rounds.
- Returned \`term (All)\` aggregate rows are preferred for case-insensitive queries.
- Duplicate phrases are intentionally preserved across different query groups when they serve different research roles.
- Terms with one to three nonzero years are marked \`too_sparse\`.
- Optional terms were collected because the same workflow handled the required groups cleanly.
- \`first_nonzero_year\` is not treated as earliest attestation.

## Request URLs

${requestUrls.map((url) => `- ${url}`).join("\n")}

## Unresolved Issues

- Ngram cannot show sentiment directly.
- Ngram does not disambiguate senses.
- Broad unigrams such as \`natural\`, \`real\`, and \`fake\` are noisy baseline terms only.
- Packaging and advertising language is likely underrepresented in books.
- Sparse phrases may still be historically useful after snippet or advertising review.
`;
  await writeFile(path.join(NOTES_DIR, "chart_04_collection_log.md"), collectionLog);

  const sourceNotes = `# Chart 4 Source Notes

Generated: ${generatedAt}

## Google Books Ngram

- Source: ${SOURCE}
- Endpoint: \`${ENDPOINT}\`
- Corpus used: \`${CORPUS}\` (${CORPUS_LABEL})
- Date range: ${START_YEAR}-${END_YEAR}
- Smoothing: ${SMOOTHING}
- Case-insensitive: ${CASE_INSENSITIVE}

## Settings Used

The first-round Chart 4 package uses the same broad Ngram settings as earlier artificial passes unless a later project-level reason changes the settings.

## Limitations

- Book corpus bias: Ngram reflects printed-book frequency, not all language use.
- OCR and metadata issues can create false positives, false negatives, or dating noise.
- No sense disambiguation is available from the yearly time series.
- Phrase thresholding may hide rare or label-like phrases.
- Broad unigram ambiguity is especially high for \`natural\`, \`real\`, \`false\`, \`fake\`, \`genuine\`, and \`authentic\`.
- Packaging language may be underrepresented because it often appears in labels, ads, magazines, websites, and regulatory materials rather than books.
- Ngram cannot show sentiment directly; suspicion, insincerity, and pejoration need contextual evidence.

## Optional Non-Ngram Sources

- No optional non-Ngram sources were fetched in this round.
`;
  await writeFile(path.join(NOTES_DIR, "chart_04_source_notes.md"), sourceNotes);

  const availabilityReport = `# Chart 4 Data Availability Report

Generated: ${generatedAt}

## 1. Overview

- Terms attempted: ${attempted}
- Successfully collected: ${collected.length}
- Missing: ${missing.length}
- Too sparse: ${tooSparse.length}
- Errored: ${errored.length}

This report describes data availability only. It does not make final chart claims.

## 2. Terms Attempted

${(Object.keys(termGroups) as QueryGroup[])
  .map((group) => `### ${group}\n\n${termGroups[group].map((term) => `- ${term.term}`).join("\n")}`)
  .join("\n\n")}

## 3. Terms Collected

${markdownList(collected)}

## 4. Missing / Sparse / Errored Terms

### Missing

${markdownList(missing)}

### Too Sparse

${markdownList(tooSparse)}

### Errored

${markdownList(errored)}

## 5. Strongest Baseline Terms

${topSignals(groupResults(allResults, "core_baseline"), 10)
  .map((item) => `- ${item.term}: peak raw Ngram value ${item.peak}`)
  .join("\n")}

## 6. Strongest Suspicion / Negative-Charge Terms

${topSignals(groupResults(allResults, "suspicion_negative"), 10)
  .map((item) => `- ${item.term}: peak raw Ngram value ${item.peak}`)
  .join("\n")}

## 7. Strongest Semantic-Distance Terms

${topSignals(groupResults(allResults, "semantic_distance"), 10)
  .map((item) => `- ${item.term}: peak raw Ngram value ${item.peak}`)
  .join("\n")}

## 8. Strongest Natural-Opposition Pairs

${topSignals(groupResults(allResults, "natural_opposition_pair"), 12)
  .map((item) => `- ${item.term}: peak raw Ngram value ${item.peak}`)
  .join("\n")}

## 9. Strongest Consumer / Absence-Claim Terms

${topSignals([...groupResults(allResults, "consumer_packaging"), ...groupResults(allResults, "absence_claim")], 12)
  .map((item) => `- ${item.term} [${item.query_group}]: peak raw Ngram value ${item.peak}`)
  .join("\n")}

## 10. Terms That Require Non-Ngram Evidence

${nonNgramRows
  .slice(0, 80)
  .map((row) => `- ${row.term_or_phrase}: ${row.reason} Needed source type: ${row.needed_source_type}. Priority: ${row.priority}.`)
  .join("\n")}

## 11. Main Limitations

- This term package is a visibility and availability check, not sense proof.
- Broad unigram curves cannot be interpreted without context.
- A phrase may require snippet review even when it has a visible Ngram signal.
- Consumer and absence-claim language likely needs advertising, packaging, magazine, regulatory, or consumer-culture sources.
- A weak Ngram signal does not mean a phrase is historically unimportant.

## 12. Recommended Next Manual Review Step

Manually review snippets and advertising or packaging sources for high-priority absence claims, consumer phrases, and affective phrases marked sparse or context-sensitive. Keep dictionary and semantic-reference checks separate from Ngram frequency review.
`;
  await writeFile(path.join(NOTES_DIR, "chart_04_data_availability_report.md"), availabilityReport);

  const nextManualReview = `# Chart 4 Next Manual Review

Generated: ${generatedAt}

## Highest Priority

- Review absence claims and packaging phrases in newspaper advertising, magazine advertising, packaging/label examples, and regulatory materials.
- Review affective/social phrases such as \`artificial smile\`, \`artificial manner\`, \`artificial tears\`, \`artificial politeness\`, and \`artificial emotion\` in Google Books snippets or another contextual corpus.
- Review broad terms \`natural\`, \`real\`, \`fake\`, \`false\`, \`genuine\`, \`authentic\`, \`synthetic\`, and \`imitation\` with dictionaries or semantic/contextual sources before any interpretation.

## Useful Source Types

- historical_dictionary
- dictionary
- Google Books snippets
- newspaper_advertising
- magazine_advertising
- packaging_language
- regulatory_source
- consumer_culture_literature
- semantic_dictionary
- corpus_context

## Guardrails

- Do not use first visible Ngram years as earliest attestations.
- Do not use Ngram alone to claim sentiment or pejoration.
- Do not collapse \`artificial\` into \`fake\`.
- Do not treat food or packaging as the entire Chart 4 theme.
`;
  await writeFile(path.join(NOTES_DIR, "chart_04_next_manual_review.md"), nextManualReview);

  const sourcesReadme = `# Chart 4 Sources

This first-round package used Google Books Ngram only.

No source files were cached in this folder during this pass. Later manual-review rounds can add advertising, packaging, regulatory, dictionary, and snippet-source documentation here.
`;
  await writeFile(path.join(SOURCES_DIR, "README.md"), sourcesReadme);

  const scriptReadme = `# Chart 4 Scripts

- Main project script: \`scripts/fetch_chart_04_suspicion_distance.ts\`
- This local folder is reserved for any Chart 4-only helper scripts added in later data rounds.
`;
  await writeFile(path.join(SCRIPTS_DIR, "README.md"), scriptReadme);

  console.log(
    JSON.stringify(
      {
        generatedAt,
        outputRoot: BASE_DIR,
        attempted,
        collected: collected.length,
        missing: missing.length,
        tooSparse: tooSparse.length,
        errored: errored.length,
        strongestGroups: availabilityRows
          .map((row) => ({ group: row.group, collected: row.collected, strongest_terms: row.strongest_terms }))
          .sort((a, b) => b.collected - a.collected),
        strongestTerms: strongest,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
