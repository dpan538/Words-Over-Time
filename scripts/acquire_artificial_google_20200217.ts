import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const START_YEAR = 1800;
const END_YEAR = 2019;
const CORPUS_ID = 26;
const VIEWER_SHORTHAND = "eng_2019";
const RELEASE = "googlebooks-eng-20200217";
const FROZEN_INPUT = path.join(ROOT, "docs/research/artificial/mobile-2026-08/artificial_mobile_frozen_inputs.json");
const OUTPUT_DIR = path.join(ROOT, "docs/research/artificial/mobile-2026-08/google-fixed-20200217");
const OUTPUT = path.join(OUTPUT_DIR, "artificial-viewer-eng_2019-s0-case-sensitive.json");

type FrozenInput = {
  compoundTerms: Array<{ term: string; semanticDomain: string }>;
  mediaTerms: Array<{ term: string; era: string }>;
};

type ViewerRow = {
  ngram: string;
  parent: string;
  type: string;
  timeseries: number[];
};

function invariant(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function stableJson(value: unknown) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

async function fetchBatch(terms: readonly string[]) {
  const selectors = terms.map((term) => `${term}:${VIEWER_SHORTHAND}`);
  const url = new URL("https://books.google.com/ngrams/json");
  url.searchParams.set("content", selectors.join(","));
  url.searchParams.set("year_start", String(START_YEAR));
  url.searchParams.set("year_end", String(END_YEAR));
  url.searchParams.set("corpus", String(CORPUS_ID));
  url.searchParams.set("smoothing", "0");
  url.searchParams.set("case_insensitive", "false");
  const response = await fetch(url, { headers: { "user-agent": "WordsOverTime/1.0 research capture" } });
  invariant(response.ok, `Viewer request failed: ${response.status} ${response.statusText}`);
  const rows = await response.json() as ViewerRow[];
  invariant(Array.isArray(rows), "Viewer response is not an array");
  return { requestUrl: url.toString(), rows };
}

async function main() {
  const checkMode = process.argv.includes("--check");
  invariant(existsSync(FROZEN_INPUT), "Artificial mobile frozen input is missing");
  const frozen = JSON.parse(await readFile(FROZEN_INPUT, "utf8")) as FrozenInput;
  const terms = [...frozen.compoundTerms.map((row) => row.term), ...frozen.mediaTerms.map((row) => row.term)];
  invariant(terms.length === 42 && new Set(terms).size === 42, "Expected 42 distinct selected terms");

  if (checkMode) {
    invariant(existsSync(OUTPUT), "Pinned Artificial Viewer capture is missing");
    const artifact = JSON.parse(await readFile(OUTPUT, "utf8")) as { series: Array<{ term: string; values: number[] }>; selectedTermCount: number; termYearCellCount: number; release: string };
    invariant(artifact.release === RELEASE, "Pinned Artificial Viewer release changed");
    invariant(artifact.selectedTermCount === 42 && artifact.termYearCellCount === 9_240, "Pinned Artificial Viewer coverage changed");
    invariant(artifact.series.length === 42, "Pinned Artificial Viewer series count changed");
    invariant(artifact.series.every((row) => row.values.length === 220 && row.values.every((value) => Number.isFinite(value) && value >= 0)), "Pinned Artificial Viewer values are invalid");
    console.log("Validated pinned Artificial eng_2019 Viewer capture: 42 terms × 220 years = 9,240 term-year cells.");
    return;
  }

  const batches: Array<{ requestUrl: string; rows: ViewerRow[] }> = [];
  for (let index = 0; index < terms.length; index += 7) batches.push(await fetchBatch(terms.slice(index, index + 7)));
  const returned = batches.flatMap((batch) => batch.rows);
  const byLabel = new Map(returned.map((row) => [row.ngram, row]));
  const series = terms.map((term) => {
    const label = `${term}:${VIEWER_SHORTHAND}`;
    const row = byLabel.get(label);
    invariant(row, `Viewer did not return ${label}`);
    invariant(row.parent === "" && row.type === "NGRAM", `${label} is not an exact NGRAM row`);
    invariant(row.timeseries.length === 220, `${label} does not contain 220 annual values`);
    invariant(row.timeseries.every((value) => Number.isFinite(value) && value >= 0), `${label} contains an invalid value`);
    const compound = frozen.compoundTerms.find((candidate) => candidate.term === term);
    const media = frozen.mediaTerms.find((candidate) => candidate.term === term);
    invariant(compound || media, `${term} lost its selected group`);
    return {
      term,
      ngramOrder: term.trim().split(/\s+/).length,
      family: compound ? "compound" : "media",
      group: compound?.semanticDomain ?? media?.era ?? "unavailable",
      values: row.timeseries,
    };
  });
  const artifact = {
    schemaVersion: "1.0.0",
    source: "Google Books Ngram Viewer",
    sourceInfoUrl: "https://books.google.com/ngrams/info",
    release: RELEASE,
    viewerShorthand: VIEWER_SHORTHAND,
    corpusId: CORPUS_ID,
    smoothing: 0,
    caseSensitive: true,
    yearCoverage: { start: START_YEAR, end: END_YEAR },
    selectedTermCount: series.length,
    termYearCellCount: series.length * 220,
    unit: "one exact selected term in one retained year; value is the corpus-normalized fraction for that n-gram order",
    missingness: "A returned zero is retained as absent_or_suppressed, not an observed count of zero.",
    comparability: "Only equal n-gram orders share a raw normalized-fraction axis. Cross-order media shapes are normalized within each term before equal-term group aggregation.",
    requestUrls: batches.map((batch) => batch.requestUrl),
    selectedInputSha256: sha256(stableJson({ compoundTerms: frozen.compoundTerms, mediaTerms: frozen.mediaTerms })),
    series,
  };
  await mkdir(OUTPUT_DIR, { recursive: true });
  await writeFile(OUTPUT, stableJson(artifact), "utf8");
  console.log(`Froze ${artifact.termYearCellCount.toLocaleString("en-US")} pinned term-year cells at ${path.relative(ROOT, OUTPUT)}.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
