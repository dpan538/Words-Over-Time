import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = path.join(process.cwd(), "src", "data", "generated");
const OUT_FILE = path.join(OUT_DIR, "forever_frequency.json");

const queries = ["forever", "for ever", "forevermore", "forever and ever"];
const startYear = 1700;
const endYear = 2022;
const corpus = "en";
const smoothing = 0;

type NgramResponse = {
  ngram: string;
  parent: string;
  type: string;
  timeseries: number[];
};

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
const generated = {
  generatedAt: new Date().toISOString(),
  source: {
    label: "Google Books Ngram Viewer",
    url: url.toString(),
    corpus,
    startYear,
    endYear,
    smoothing,
    note: "Values are yearly Ngram fractions. The app converts them to frequency per million for display.",
  },
  series: rows.map((row) => ({
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
    points: row.timeseries.map((value, index) => ({
      year: startYear + index,
      value,
      frequencyPerMillion: value * 1_000_000,
    })),
  })),
};

await mkdir(OUT_DIR, { recursive: true });
await writeFile(OUT_FILE, `${JSON.stringify(generated, null, 2)}\n`);
console.log(`Wrote ${OUT_FILE}`);
