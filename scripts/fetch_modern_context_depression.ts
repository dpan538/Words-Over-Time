import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = path.join(process.cwd(), "src", "data", "generated");
const OUT_FILE = path.join(OUT_DIR, "depression_modern_context.json");

const WIKINEWS_API = "https://en.wikinews.org/w/api.php";
const WIKIPEDIA_API = "https://en.wikipedia.org/w/api.php";
const USER_AGENT = "WordsOverTime/1.0 contact: local";
const searchLimit = 8;

const wikinewsQueries = [
  "depression",
  "\"clinical depression\"",
  "\"major depression\"",
  "\"depressive disorder\"",
  "\"mental health\" depression",
  "\"economic depression\"",
  "\"Great Depression\"",
  "\"tropical depression\"",
  "\"geological depression\"",
];

const wikipediaPages = [
  "Depression_(mood)",
  "Major_depressive_disorder",
  "Depressive_disorder",
  "Melancholia",
  "Melancholy",
  "Economic_depression",
  "Great_Depression",
  "Depression_(geology)",
  "Tropical_cyclone",
];

const trackedPhrases = [
  "clinical depression",
  "major depression",
  "depressive disorder",
  "mental health",
  "economic depression",
  "great depression",
  "tropical depression",
  "geological depression",
];

const stopwords = new Set([
  "about",
  "after",
  "also",
  "and",
  "are",
  "been",
  "but",
  "depression",
  "depressions",
  "for",
  "from",
  "has",
  "have",
  "into",
  "its",
  "more",
  "not",
  "that",
  "the",
  "their",
  "this",
  "was",
  "were",
  "which",
  "with",
]);

type SearchRow = {
  title: string;
  snippet: string;
  timestamp?: string;
};

type ModernSnippet = {
  id: string;
  source: string;
  sourceUrl: string;
  sourceCorpus: string;
  title: string;
  author: string;
  year: number;
  eraId: string;
  dateBasis: string;
  query: string;
  quote: string;
  rightsStatus: string;
  evidenceType: string;
  categoryIds: string[];
  caveat: string;
};

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
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

function tokenize(text: string) {
  return text.toLowerCase().match(/[a-z]+(?:'[a-z]+)?/g) ?? [];
}

function categoryIdsForText(text: string) {
  const lower = text.toLowerCase();
  const categories = new Set<string>();

  if (/(sad|mood|low mood|despair|hopeless|loneliness|emotion|feeling)/.test(lower)) {
    categories.add("emotional_state");
  }
  if (/(clinical|major depressive|depressive disorder|psychiatr|diagnos|symptom|mental health|treatment|patient|antidepressant|suicid)/.test(lower)) {
    categories.add("clinical_psychiatric_condition");
  }
  if (/(economic|great depression|recession|unemployment|trade|financial|market|business|crisis|econom)/.test(lower)) {
    categories.add("economic_downturn");
  }
  if (/(geolog|topograph|hollow|basin|landform|surface|terrain|low area)/.test(lower)) {
    categories.add("geographical_topographical");
  }
  if (/(pressure|lowering|pressed|tropical depression|low pressure|barometric|cyclone|storm)/.test(lower)) {
    categories.add("physical_lowering_pressure");
  }
  if (/(melanchol|sadness|despair|gloom|literary|black bile)/.test(lower)) {
    categories.add("literary_melancholy_sadness_cluster");
  }

  return Array.from(categories);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function api(endpoint: string, params: Record<string, string>) {
  const url = new URL(endpoint);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);

  for (let attempt = 0; attempt < 7; attempt += 1) {
    const response = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
    });
    if (response.ok) return response.json();
    if (response.status !== 429 || attempt === 6) {
      throw new Error(`Wikimedia API failed: ${response.status} ${response.statusText}`);
    }
    const retryAfter = Number(response.headers.get("retry-after"));
    await sleep(Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 2500 * (attempt + 1));
  }

  throw new Error("Wikimedia API failed after retries.");
}

async function searchWikinews(query: string) {
  const data = await api(WIKINEWS_API, {
    action: "query",
    list: "search",
    srsearch: query,
    srlimit: String(searchLimit),
    format: "json",
    utf8: "1",
  });
  return (data.query?.search ?? []) as SearchRow[];
}

async function wikipediaExtract(title: string) {
  const data = await api(WIKIPEDIA_API, {
    action: "query",
    prop: "extracts|info",
    exintro: "1",
    explaintext: "1",
    redirects: "1",
    titles: title,
    inprop: "url",
    format: "json",
    utf8: "1",
  });
  const pages = Object.values(data.query?.pages ?? {}) as Array<{
    title?: string;
    extract?: string;
    fullurl?: string;
    touched?: string;
  }>;
  return pages[0] ?? null;
}

const snippets: ModernSnippet[] = [];
const seen = new Set<string>();

for (const query of wikinewsQueries) {
  console.log(`Searching Wikinews: ${query}`);
  const rows = await searchWikinews(query);
  await sleep(550);

  for (const row of rows) {
    const quote = stripHtml(row.snippet);
    if (!/(depression|depressive|melanchol|mental health|great depression|tropical depression)/i.test(quote)) {
      continue;
    }
    const key = `wikinews-${row.title}-${quote}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const year = row.timestamp ? new Date(row.timestamp).getUTCFullYear() : new Date().getUTCFullYear();

    snippets.push({
      id: `modern-wikinews-${slug(row.title)}-${snippets.length + 1}`,
      source: "Wikinews",
      sourceUrl: `https://en.wikinews.org/wiki/${encodeURIComponent(row.title.replaceAll(" ", "_"))}`,
      sourceCorpus: "Wikinews API search",
      title: row.title,
      author: "Wikinews contributors",
      year,
      eraId: year <= 2019 ? "2000-2019" : "recent",
      dateBasis: "Wikinews search result revision timestamp",
      query,
      quote,
      rightsStatus: year >= 2025 ? "CC BY 4.0" : "CC BY 2.5",
      evidenceType: "modern_open_news_context",
      categoryIds: categoryIdsForText(`${query} ${quote}`),
      caveat:
        "Wikinews is an open modern news/context snapshot. It is not comparable to Google Books Ngram or Project Gutenberg.",
    });
  }
}

for (const page of wikipediaPages) {
  console.log(`Fetching Wikipedia extract: ${page}`);
  const row = await wikipediaExtract(page);
  await sleep(1400);
  if (!row?.extract) continue;
  const title = row.title ?? page.replaceAll("_", " ");
  const year = row.touched ? new Date(row.touched).getUTCFullYear() : new Date().getUTCFullYear();
  const quote = row.extract.replace(/\s+/g, " ").trim().slice(0, 700);

  snippets.push({
    id: `modern-wikipedia-${slug(title)}`,
    source: "Wikipedia",
    sourceUrl: row.fullurl ?? `https://en.wikipedia.org/wiki/${page}`,
    sourceCorpus: "Wikipedia current article extract",
    title,
    author: "Wikipedia contributors",
    year,
    eraId: "recent",
    dateBasis: "current article revision metadata",
    query: page.replaceAll("_", " "),
    quote,
    rightsStatus: "CC BY-SA 4.0",
    evidenceType: "modern_open_reference_context",
    categoryIds: categoryIdsForText(`${title} ${quote}`),
    caveat:
      "Wikipedia provides current open reference text and sense/category anchors. It is not dated usage evidence in the same way as corpus snippets.",
  });
}

const phrases = trackedPhrases
  .map((phrase) => {
    const matching = snippets.filter((snippet) => `${snippet.title} ${snippet.quote}`.toLowerCase().includes(phrase));
    return {
      id: `modern-phrase-${slug(phrase)}`,
      phrase,
      count: matching.length,
      documentFrequency: new Set(matching.map((snippet) => snippet.title)).size,
      sourceCorpus: "Wikinews + Wikipedia",
      relatedSnippetIds: matching.map((snippet) => snippet.id),
      categoryIds: categoryIdsForText(phrase),
      displayEligible: matching.length > 0,
      caveat: "Modern phrase evidence comes from open search/reference snippets, not a balanced corpus.",
    };
  })
  .filter((phrase) => phrase.count > 0);

const tokenCounts = new Map<string, { count: number; snippetIds: Set<string>; categoryIds: Set<string> }>();
for (const snippet of snippets) {
  const tokens = tokenize(snippet.quote);
  tokens.forEach((token) => {
    if (token.length < 3 || stopwords.has(token)) return;
    const current = tokenCounts.get(token) ?? {
      count: 0,
      snippetIds: new Set<string>(),
      categoryIds: new Set<string>(),
    };
    current.count += 1;
    current.snippetIds.add(snippet.id);
    snippet.categoryIds.forEach((categoryId) => current.categoryIds.add(categoryId));
    tokenCounts.set(token, current);
  });
}

const collocates = Array.from(tokenCounts.entries())
  .map(([token, value]) => ({
    id: `modern-collocate-${slug(token)}`,
    token,
    count: value.count,
    documentFrequency: value.snippetIds.size,
    sourceCorpus: "Wikinews + Wikipedia",
    categoryIds: Array.from(value.categoryIds),
    relatedSnippetIds: Array.from(value.snippetIds),
    caveat: "Computed from open snippets/extracts only; use as exploratory modern context.",
  }))
  .filter((row) => row.count >= 2)
  .sort((a, b) => b.count - a.count || b.documentFrequency - a.documentFrequency)
  .slice(0, 60);

const years = snippets.map((snippet) => snippet.year);
const generated = {
  generatedAt: new Date().toISOString(),
  layer: "modern context",
  source: {
    label: "Wikinews + Wikipedia",
    urls: ["https://en.wikinews.org/", "https://en.wikipedia.org/"],
    licenseNote:
      "Wikinews and Wikipedia text is open licensed. Wikinews older articles are generally CC BY 2.5; newer Wikinews and Wikipedia content is CC BY/CC BY-SA according to project terms.",
    caveat:
      "This is a separated modern open-context snapshot, not a continuous 1930-2026 corpus and not comparable with Gutenberg.",
  },
  coverage: {
    startYear: years.length ? Math.min(...years) : null,
    endYear: years.length ? Math.max(...years) : null,
    sourceType: "open news search snippets plus current reference extracts",
    comparableToHistoricalCorpus: false,
  },
  queries: wikinewsQueries,
  referencePages: wikipediaPages,
  snippets,
  phrases,
  collocates,
};

await mkdir(OUT_DIR, { recursive: true });
await writeFile(OUT_FILE, `${JSON.stringify(generated, null, 2)}\n`);
console.log(`Wrote ${OUT_FILE}`);
