import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = path.join(process.cwd(), "src", "data", "generated");
const OUT_FILE = path.join(OUT_DIR, "forever_modern_context.json");
const API = "https://en.wikinews.org/w/api.php";
const USER_AGENT = "WordsOverTime/1.0 contact: local";

const queries = [
  "forever",
  "\"for ever\"",
  "\"forever and ever\"",
  "\"remembered forever\"",
  "\"live forever\"",
  "\"takes forever\"",
  "\"gone forever\"",
  "\"online forever\"",
  "\"internet forever\"",
  "\"digital forever\"",
];
const searchLimit = 6;

const categoryRules = [
  {
    id: "remembrance",
    terms: ["remembered", "memory", "memorial", "legacy", "forgotten"],
  },
  {
    id: "hyperbole_colloquial",
    terms: ["takes forever", "go on forever", "live with that forever", "waiting", "takes"],
  },
  {
    id: "digital_permanence",
    terms: ["online", "internet", "digital", "data", "privacy", "web"],
  },
  {
    id: "permanence_duration",
    terms: ["gone forever", "lost forever", "live forever", "last forever", "forever after"],
  },
  {
    id: "eternity_religion",
    terms: ["god", "heaven", "soul", "eternity", "forever and ever"],
  },
  {
    id: "romance_vow",
    terms: ["love", "loved", "heart", "forever yours"],
  },
];

const stopwords = new Set([
  "about",
  "after",
  "again",
  "also",
  "and",
  "are",
  "been",
  "but",
  "for",
  "forever",
  "from",
  "have",
  "his",
  "her",
  "into",
  "that",
  "the",
  "their",
  "there",
  "this",
  "was",
  "were",
  "with",
  "would",
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

function stripHtml(value: string) {
  return value
    .replace(/<[^>]+>/g, "")
    .replace(/&quot;/g, "\"")
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

async function api(params: Record<string, string>) {
  const url = new URL(API);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const response = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
    });
    if (response.ok) return response.json();
    if (response.status !== 429 || attempt === 3) {
      throw new Error(`Wikinews API failed: ${response.status} ${response.statusText}`);
    }
    await sleep(1500 * (attempt + 1));
  }
  throw new Error("Wikinews API failed after retries.");
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function search(query: string) {
  const data = await api({
    action: "query",
    list: "search",
    srsearch: query,
    srlimit: String(searchLimit),
    format: "json",
    utf8: "1",
  });
  return (data.query?.search ?? []) as SearchRow[];
}

function categoryIdsForText(text: string) {
  const lower = text.toLowerCase();
  return categoryRules
    .filter((rule) => rule.terms.some((term) => lower.includes(term)))
    .map((rule) => rule.id);
}

function tokenize(text: string) {
  return text.toLowerCase().match(/[a-z]+(?:'[a-z]+)?/g) ?? [];
}

const snippets: ModernSnippet[] = [];
const seenTitles = new Set<string>();

for (const query of queries) {
  console.log(`Searching Wikinews: ${query}`);
  const rows = await search(query);
  await sleep(650);
  for (const row of rows) {
    const plainSnippet = stripHtml(row.snippet);
    if (!plainSnippet.toLowerCase().includes("forever") && !plainSnippet.toLowerCase().includes("for ever")) {
      continue;
    }
    const key = `${row.title}-${plainSnippet}`;
    if (seenTitles.has(key)) continue;
    seenTitles.add(key);

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
      quote: plainSnippet,
      rightsStatus: year >= 2025 ? "CC BY 4.0" : "CC BY 2.5",
      evidenceType: "modern_open_news_context",
      categoryIds: categoryIdsForText(plainSnippet),
      caveat:
        "Wikinews is an open modern news/context snapshot. It is not comparable to the Google Books or Gutenberg historical corpora.",
    });
  }
}

const phrases = queries
  .filter((query) => query.includes("\""))
  .map((query) => query.replaceAll("\"", ""))
  .map((phrase) => {
    const matching = snippets.filter((snippet) => snippet.quote.toLowerCase().includes(phrase));
    return {
      id: `modern-phrase-${slug(phrase)}`,
      phrase,
      count: matching.length,
      documentFrequency: new Set(matching.map((snippet) => snippet.title)).size,
      sourceCorpus: "Wikinews",
      relatedSnippetIds: matching.map((snippet) => snippet.id),
      categoryIds: categoryIdsForText(phrase),
      displayEligible: matching.length > 0,
      caveat: "Modern phrase evidence is from open news snippets, not a balanced corpus.",
    };
  })
  .filter((phrase) => phrase.count > 0);

const tokenCounts = new Map<string, { count: number; snippetIds: Set<string> }>();
for (const snippet of snippets) {
  const tokens = tokenize(snippet.quote);
  tokens.forEach((token) => {
    if (token.length < 3 || stopwords.has(token)) return;
    const current = tokenCounts.get(token) ?? { count: 0, snippetIds: new Set<string>() };
    current.count += 1;
    current.snippetIds.add(snippet.id);
    tokenCounts.set(token, current);
  });
}

const collocates = Array.from(tokenCounts.entries())
  .map(([token, value]) => ({
    id: `modern-collocate-${slug(token)}`,
    token,
    count: value.count,
    documentFrequency: value.snippetIds.size,
    sourceCorpus: "Wikinews",
    categoryIds: categoryIdsForText(token),
    relatedSnippetIds: Array.from(value.snippetIds),
    caveat: "Computed from API search snippets only; use as exploratory modern context.",
  }))
  .filter((row) => row.count >= 2)
  .sort((a, b) => b.count - a.count || b.documentFrequency - a.documentFrequency)
  .slice(0, 30);

const years = snippets.map((snippet) => snippet.year);
const generated = {
  generatedAt: new Date().toISOString(),
  layer: "modern context",
  source: {
    label: "Wikinews",
    url: "https://en.wikinews.org/",
    apiUrl: API,
    licenseNote:
      "Wikinews text is open licensed. Articles before 2024-12-16 are generally CC BY 2.5; newer text is CC BY 4.0 unless otherwise specified.",
    caveat:
      "This is an open-news context snapshot, not a balanced corpus and not comparable with Ngram or Gutenberg.",
  },
  coverage: {
    startYear: years.length ? Math.min(...years) : null,
    endYear: years.length ? Math.max(...years) : null,
    sourceType: "open news search snippets",
    comparableToHistoricalCorpus: false,
  },
  queries,
  snippets,
  phrases,
  collocates,
};

await mkdir(OUT_DIR, { recursive: true });
await writeFile(OUT_FILE, `${JSON.stringify(generated, null, 2)}\n`);
console.log(`Wrote ${OUT_FILE}`);
