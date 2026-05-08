import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = path.join(process.cwd(), "src", "data", "generated");
const OUT_FILE = path.join(OUT_DIR, "depression_economic_context.json");
const USER_AGENT = "WordsOverTime/1.0 contact: local";

const chroniclingQueries = [
  { id: "economic_depression", query: "\"economic depression\"", branchId: "economic" },
  { id: "great_depression", query: "\"Great Depression\"", branchId: "economic" },
  { id: "business_depression", query: "\"business depression\"", branchId: "economic" },
  { id: "financial_depression", query: "\"financial depression\"", branchId: "economic" },
  { id: "depression_trade", query: "\"depression in trade\"", branchId: "economic" },
  { id: "tropical_depression", query: "\"tropical depression\"", branchId: "meteorological" },
];

const periods = [
  { id: "1800-1849", start: 1800, end: 1849 },
  { id: "1850-1899", start: 1850, end: 1899 },
  { id: "1900-1928", start: 1900, end: 1928 },
  { id: "1929-1939", start: 1929, end: 1939 },
  { id: "1940-1963", start: 1940, end: 1963 },
];

const nberCycles = [
  { id: "panic-1873-long-depression", label: "Panic of 1873 / long contraction", peak: "1873-10", trough: "1879-03", durationMonths: 65, branchId: "economic" },
  { id: "panic-1893", label: "Panic of 1893 contraction", peak: "1893-01", trough: "1894-06", durationMonths: 17, branchId: "economic" },
  { id: "great-depression-1929-1933", label: "Great Depression contraction", peak: "1929-08", trough: "1933-03", durationMonths: 43, branchId: "economic" },
  { id: "recession-1937-1938", label: "1937-1938 recession", peak: "1937-05", trough: "1938-06", durationMonths: 13, branchId: "economic" },
  { id: "great-recession-2007-2009", label: "Great Recession", peak: "2007-12", trough: "2009-06", durationMonths: 18, branchId: "economic" },
  { id: "covid-2020-contraction", label: "COVID-19 contraction", peak: "2020-02", trough: "2020-04", durationMonths: 2, branchId: "economic" },
];

const fredSeries = [
  { id: "UNRATE", label: "Unemployment Rate", branchId: "economic", sourceUrl: "https://fred.stlouisfed.org/series/UNRATE" },
  { id: "INDPRO", label: "Industrial Production: Total Index", branchId: "economic", sourceUrl: "https://fred.stlouisfed.org/series/INDPRO" },
  { id: "GDPC1", label: "Real Gross Domestic Product", branchId: "economic", sourceUrl: "https://fred.stlouisfed.org/series/GDPC1" },
];

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function stripHtml(value: string) {
  return value
    .replace(/<[^>]+>/g, "")
    .replace(/&quot;/g, "\"")
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchJson(url: URL) {
  const response = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.json();
}

async function fetchChronicling(query: string, start: number, end: number) {
  const url = new URL("https://www.loc.gov/collections/chronicling-america/");
  url.searchParams.set("fo", "json");
  url.searchParams.set("q", query);
  url.searchParams.set("dates", `${start}/${end}`);
  url.searchParams.set("c", "8");
  url.searchParams.set("sp", "1");
  return fetchJson(url);
}

async function fetchFredCsv(seriesId: string) {
  const url = new URL("https://fred.stlouisfed.org/graph/fredgraph.csv");
  url.searchParams.set("id", seriesId);
  const response = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  const text = await response.text();
  const rows = text
    .trim()
    .split(/\r?\n/)
    .slice(1)
    .map((line) => {
      const [date, value] = line.split(",");
      return { date, value: value === "." ? null : Number(value) };
    })
    .filter((row) => row.date);
  return rows;
}

const chroniclingAmerica = [];
for (const query of chroniclingQueries) {
  console.log(`Chronicling America: ${query.query}`);
  const byPeriod = [];
  const samples = [];
  for (const period of periods) {
    try {
      const data = await fetchChronicling(query.query, period.start, period.end);
      await sleep(500);
      byPeriod.push({
        periodId: period.id,
        startYear: period.start,
        endYear: period.end,
        count: Number(data.pagination?.total ?? data.total ?? 0),
        countMetric: "loc.gov q search-result count",
      });
      for (const item of data.results ?? []) {
        if (samples.length >= 18) break;
        const title = item.title ?? item.item?.title ?? item.item?.newspaper_title?.[0] ?? query.query;
        const year = item.date ? Number(String(item.date).slice(0, 4)) : null;
        samples.push({
          id: `chronam-${query.id}-${samples.length + 1}`,
          title,
          year,
          date: item.date,
          state: item.location?.[0] ?? item.item?.location?.[0] ?? null,
          edition: item.item?.edition ?? item.item?.date_issued ?? null,
          sequence: item.index,
          sourceUrl: item.url ?? item.id,
          snippet: stripHtml(`${title} ${item.description?.[0] ?? ""}`),
          branchId: query.branchId,
          rightsState: "Library of Congress loc.gov Chronicling America metadata; OCR/item rights vary",
          confidence: "medium",
        });
      }
    } catch (error) {
      byPeriod.push({
        periodId: period.id,
        startYear: period.start,
        endYear: period.end,
        count: null,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
  chroniclingAmerica.push({
    id: `chronam-${query.id}`,
    query: query.query,
    branchId: query.branchId,
    countsByPeriod: byPeriod,
    samples,
    caveat:
      "Chronicling America is historic newspaper metadata/OCR accessed through the loc.gov API. Counts are q search-result counts, not phrase-frequency measurements, and need review before visual claims.",
  });
}

const fred = [];
for (const series of fredSeries) {
  console.log(`FRED CSV: ${series.id}`);
  try {
    const rows = await fetchFredCsv(series.id);
    await sleep(350);
    const sampled = rows
      .filter((row) => {
        const year = Number(row.date.slice(0, 4));
        return year % 10 === 0 || ["1929", "1933", "1937", "1948", "1980", "2008", "2020"].includes(String(year));
      })
      .slice(0, 120);
    fred.push({
      ...series,
      status: "integrated_public_csv",
      source: "FRED public graph CSV",
      observationCount: rows.length,
      startDate: rows[0]?.date ?? null,
      endDate: rows.at(-1)?.date ?? null,
      sampledObservations: sampled,
      caveat:
        "Fetched through FRED's public graph CSV endpoint, not the API-key web service. Use as contextual economic backdrop, not lexical evidence.",
    });
  } catch (error) {
    fred.push({
      ...series,
      status: "fetch_failed",
      error: error instanceof Error ? error.message : String(error),
      caveat:
        "FRED official API requires a key; graph CSV may fail or change. Store as contextual source only.",
    });
  }
}

const fraser = {
  id: "fraser",
  name: "FRASER",
  status: "investigated_api_key_required_not_ingested",
  sourceUrl: "https://fraser.stlouisfed.org/api-documentation/rest-api",
  branchId: "economic",
  role: "economic history document/snippet reservoir",
  caveat:
    "FRASER has a REST API and economic-history library, but API access requires registration/key handling and item rights vary. Not ingested in this pass.",
};

const generated = {
  generatedAt: new Date().toISOString(),
  layer: "economic and weather context",
  chroniclingAmerica,
  nber: {
    source: "NBER US Business Cycle Expansions and Contractions",
    sourceUrl: "https://www.nber.org/research/data/us-business-cycle-expansions-and-contractions",
    records: nberCycles,
    caveat:
      "NBER cycles are contextual event scaffolding, not word evidence. They should overlay economic branch visuals.",
  },
  fred,
  fraser,
  caveats: [
    "Economic and meteorological contexts must remain separate from clinical and emotional branches.",
    "Chronicling America snippets/counts are OCR newspaper evidence and need review before public claims.",
    "FRED/NBER/FRASER are contextual economic evidence, not lexical frequency corpora.",
  ],
};

await mkdir(OUT_DIR, { recursive: true });
await writeFile(OUT_FILE, `${JSON.stringify(generated, null, 2)}\n`);
console.log(`Wrote ${OUT_FILE}`);
