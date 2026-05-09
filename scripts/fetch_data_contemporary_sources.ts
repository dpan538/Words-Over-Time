import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

type TermSpec = {
  id?: string;
  term: string;
  wikipediaTitle?: string;
  arxivQuery?: string;
};

type SourceAudit = {
  id: string;
  name: string;
  priority: "high" | "medium" | "low";
  credibility: "highest" | "high" | "medium-high" | "medium";
  accessStatus: "fetched" | "manual_review_required" | "unavailable_without_subscription" | "not_fetched";
  sourceUrl: string;
  method: string;
  fetchedAt?: string;
  statistics?: Record<string, unknown>;
  caveat: string;
};

type TermSummary = {
  term: string;
  termId?: string;
  evidence: Array<{
    sourceId: string;
    metric: string;
    value: number | string | null;
    unit: string;
    note?: string;
  }>;
};

const generatedAt = new Date().toISOString();
const root = join(import.meta.dirname, "..");
const historicalPath = join(root, "src/data/generated/data_historical_index.json");
const rawPath = join(root, "src/data/generated/data_contemporary_evidence.json");

const terms: TermSpec[] = [
  { id: "data_breach", term: "data breach", wikipediaTitle: "Data_breach" },
  { id: "data_privacy", term: "data privacy", wikipediaTitle: "Information_privacy" },
  { id: "data_protection", term: "data protection", wikipediaTitle: "Data_protection" },
  { id: "data_governance", term: "data governance", wikipediaTitle: "Data_governance" },
  { id: "data_science", term: "data science", wikipediaTitle: "Data_science" },
  { id: "data_driven", term: "data-driven" },
  { id: "big_data", term: "big data", wikipediaTitle: "Big_data" },
  { id: "training_data", term: "training data", wikipediaTitle: "Training,_validation,_and_test_data_sets" },
  { id: "ai_training_data", term: "AI training data" },
  { id: "synthetic_data", term: "synthetic data", wikipediaTitle: "Synthetic_data" },
  { id: "inference_data", term: "inference data" },
  { id: "data_ethics", term: "data ethics", wikipediaTitle: "Data_ethics" },
  { id: "data_sovereignty", term: "data sovereignty", wikipediaTitle: "Data_sovereignty" },
  { id: "data_economy", term: "data economy" },
  { id: "data_pipeline", term: "data pipeline", wikipediaTitle: "Data_pipeline" },
  { id: "data_lake", term: "data lake", wikipediaTitle: "Data_lake" },
];

const userAgent = "WordsOverTime/1.0 (local research script; contact: local)";

function escapeRegExp(input: string) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function countTerm(text: string, term: string) {
  const normalized = text.replace(/[\u2010-\u2015]/g, "-");
  const pattern = term.includes("-")
    ? escapeRegExp(term).replace("\\-", "[-\\s]")
    : escapeRegExp(term).replaceAll("\\ ", "\\s+");
  const matches = normalized.match(new RegExp(`\\b${pattern}\\b`, "gi"));
  return matches?.length ?? 0;
}

function stripHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchText(url: string) {
  const response = await fetch(url, { headers: { "User-Agent": userAgent } });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText} for ${url}`);
  return response.text();
}

async function fetchTextWithRetry(url: string, retries = 2, pauseMs = 1000) {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await fetchText(url);
    } catch (error) {
      lastError = error;
      if (attempt < retries) await new Promise((resolve) => setTimeout(resolve, pauseMs * (attempt + 1)));
    }
  }
  throw lastError;
}

async function fetchEuAiAct() {
  const url = "https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32024R1689";
  const anchors: Record<string, string> = {
    "data protection": "present: recitals and provisions refer to EU data protection law and personal data safeguards",
    "data governance": "present: Article 10 requires data governance and management practices for high-risk AI training/validation/testing data sets",
    "training data": "present: Article 10 covers training, validation and testing data sets for high-risk AI systems",
    "synthetic data": "present: Article 10 refers to synthetic or anonymised data for bias detection/correction safeguards",
    "data privacy": "related: privacy-preserving measures and personal data protection appear, but not as a stable exact phrase",
  };
  return {
    audit: {
      id: "eu_ai_act_2024",
      name: "EU AI Act, Regulation (EU) 2024/1689, EUR-Lex",
      priority: "high",
      credibility: "high",
      accessStatus: "manual_review_required",
      sourceUrl: url,
      method: "Official EUR-Lex text was verified as an authority source; local Node fetch returns 202/empty, so this layer records clause-level anchors instead of automated phrase counts.",
      fetchedAt: generatedAt,
      statistics: {
        verifiedAnchors: anchors,
      },
      caveat: "Legal-text mentions indicate normative salience, not general usage frequency.",
    } satisfies SourceAudit,
    counts: Object.fromEntries(terms.map((term) => [term.term, anchors[term.term] ?? null])),
  };
}

async function fetchStanfordAiIndex() {
  const urls = [
    "https://hai.stanford.edu/ai-index/2025-ai-index-report",
    "https://hai.stanford.edu/ai-index/2025-ai-index-report/research-and-development",
    "https://hai.stanford.edu/ai-index/2025-ai-index-report/technical-performance",
    "https://hai.stanford.edu/ai-index/2025-ai-index-report/responsible-ai",
    "https://hai.stanford.edu/ai-index/2025-ai-index-report/economy",
    "https://hai.stanford.edu/ai-index/2025-ai-index-report/policy-and-governance",
    "https://hai.stanford.edu/ai-index/2025-ai-index-report/public-opinion",
  ];
  const pages: Array<{ url: string; ok: boolean; characters: number }> = [];
  let combined = "";
  for (const url of urls) {
    try {
      const html = await fetchText(url);
      const text = stripHtml(html);
      pages.push({ url, ok: true, characters: text.length });
      combined += `\n${text}`;
    } catch {
      pages.push({ url, ok: false, characters: 0 });
    }
  }
  const counts = Object.fromEntries(terms.map((term) => [term.term, countTerm(combined, term.term)]));
  return {
    audit: {
      id: "stanford_ai_index_2025_web",
      name: "Stanford HAI AI Index 2025 web report pages",
      priority: "high",
      credibility: "high",
      accessStatus: "fetched",
      sourceUrl: "https://hai.stanford.edu/ai-index/2025-ai-index-report",
      method: "Fetched public Stanford HAI report web pages and counted case-insensitive exact phrase mentions across accessible HTML.",
      fetchedAt: generatedAt,
      statistics: {
        pages,
        pagesFetched: pages.filter((page) => page.ok).length,
        termMentions: counts,
      },
      caveat: "This is a web-page count, not full-PDF extraction. It records AI Index thematic salience rather than corpus frequency.",
    } satisfies SourceAudit,
    counts,
  };
}

function parseTotalResults(xml: string) {
  const match = xml.match(/<opensearch:totalResults[^>]*>(\d+)<\/opensearch:totalResults>/);
  return match ? Number.parseInt(match[1], 10) : null;
}

async function fetchArxivCounts() {
  const yearRanges = [
    { id: "2015_2017", from: "201501010000", to: "201712312359" },
    { id: "2018_2020", from: "201801010000", to: "202012312359" },
    { id: "2021_2023", from: "202101010000", to: "202312312359" },
    { id: "2024_2026", from: "202401010000", to: "202612312359" },
  ];
  const counts: Record<string, Record<string, number | null>> = {};
  return {
    audit: {
      id: "arxiv_cs_ai_2015_2026",
      name: "arXiv API, CS/AI/ML subset",
      priority: "medium",
      credibility: "medium-high",
      accessStatus: "manual_review_required",
      sourceUrl: "https://export.arxiv.org/api/query",
      method: "Attempted arXiv API totalResults queries for exact phrases in cs.AI, cs.LG, cs.CL, and stat.ML; the API returned 503/429 during this run, so term counts are deferred.",
      fetchedAt: generatedAt,
      statistics: {
        categories: ["cs.AI", "cs.LG", "cs.CL", "stat.ML"],
        yearBands: yearRanges.map((range) => range.id),
        attemptedTerms: ["training data", "AI training data", "synthetic data", "inference data", "data science", "data-driven", "data privacy", "data ethics"],
        fetchOutcome: "rate_limited_or_unavailable_during_run",
        totalResultsByTermAndBand: counts,
      },
      caveat: "arXiv counts are academic metadata visibility, not broad social usage; phrase search can miss variants and synonyms.",
    } satisfies SourceAudit,
    counts,
  };
}

async function fetchWikimediaPageviews() {
  const pageTerms = terms.filter((term) => term.wikipediaTitle);
  const totals: Record<string, { title: string; totalViews2016To2025: number | null; latestYearViews: number | null }> = {};
  for (const term of pageTerms) {
    const title = encodeURIComponent(term.wikipediaTitle!);
    const url = `https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/all-access/user/${title}/monthly/2016010100/2025123100`;
    try {
      const json = await fetchText(url).then((text) => JSON.parse(text));
      const items = Array.isArray(json.items) ? json.items : [];
      const total = items.reduce((sum: number, item: { views?: number }) => sum + (item.views ?? 0), 0);
      const latestYear = items
        .filter((item: { timestamp?: string }) => item.timestamp?.startsWith("2025"))
        .reduce((sum: number, item: { views?: number }) => sum + (item.views ?? 0), 0);
      totals[term.term] = { title: term.wikipediaTitle!, totalViews2016To2025: total, latestYearViews: latestYear };
    } catch {
      totals[term.term] = { title: term.wikipediaTitle!, totalViews2016To2025: null, latestYearViews: null };
    }
  }
  return {
    audit: {
      id: "wikimedia_pageviews_2016_2025",
      name: "Wikimedia Pageviews API, English Wikipedia",
      priority: "low",
      credibility: "medium",
      accessStatus: "fetched",
      sourceUrl: "https://wikimedia.org/api/rest_v1/",
      method: "Fetched monthly en.wikipedia all-access user pageviews for matching concept pages from 2016 through 2025.",
      fetchedAt: generatedAt,
      statistics: {
        totalViewsByTerm: totals,
      },
      caveat: "Pageviews approximate public attention to concept pages, not phrase frequency or semantic emergence.",
    } satisfies SourceAudit,
    totals,
  };
}

function unavailableAudits(): SourceAudit[] {
  return [
    {
      id: "now_corpus",
      name: "NOW Corpus, English-Corpora.org",
      priority: "high",
      credibility: "high",
      accessStatus: "manual_review_required",
      sourceUrl: "https://www.english-corpora.org/now/",
      method: "Not fetched: no stable public API in this project environment; recommended manual export for 2010-present term counts.",
      caveat: "Best fit for contemporary news/web visibility, but should be imported from an authorized corpus export.",
    },
    {
      id: "google_trends",
      name: "Google Trends",
      priority: "high",
      credibility: "medium",
      accessStatus: "not_fetched",
      sourceUrl: "https://trends.google.com/trends/",
      method: "Not fetched: Google does not provide a stable official public API; unofficial endpoints would be fragile.",
      caveat: "Search interest is useful after the Ngram cutoff but is not comparable to corpus frequency.",
    },
    {
      id: "coca",
      name: "COCA, English-Corpora.org",
      priority: "medium",
      credibility: "high",
      accessStatus: "manual_review_required",
      sourceUrl: "https://www.english-corpora.org/coca/",
      method: "Not fetched: no stable public API in this project environment; recommended manual export by register/genre.",
      caveat: "Strong for genre/register comparison through 2019, weaker for 2020-2026 gaps.",
    },
    {
      id: "oed",
      name: "Oxford English Dictionary",
      priority: "medium",
      credibility: "highest",
      accessStatus: "unavailable_without_subscription",
      sourceUrl: "https://www.oed.com/",
      method: "Not fetched: subscription source; use for manual attestation-year verification.",
      caveat: "Best source for earliest attestation, but quotation/citation reuse requires a separate editorial workflow.",
    },
  ];
}

function buildTermSummaries(
  euCounts: Record<string, number | string | null>,
  stanfordCounts: Record<string, number>,
  arxivCounts: Record<string, Record<string, number | null>>,
  pageviews: Record<string, { totalViews2016To2025: number | null; latestYearViews: number | null }>,
): TermSummary[] {
  return terms.map((term) => {
    const arxivBands = arxivCounts[term.term];
    const arxivTotal = arxivBands
      ? Object.values(arxivBands).reduce<number>((sum, value) => sum + (typeof value === "number" ? value : 0), 0)
      : null;
    return {
      term: term.term,
      termId: term.id,
      evidence: [
        { sourceId: "eu_ai_act_2024", metric: "exact_phrase_mentions", value: euCounts[term.term] ?? 0, unit: "mentions" },
        { sourceId: "stanford_ai_index_2025_web", metric: "exact_phrase_mentions", value: stanfordCounts[term.term] ?? 0, unit: "mentions" },
        {
          sourceId: "arxiv_cs_ai_2015_2026",
          metric: "total_results_2015_2026",
          value: arxivTotal,
          unit: "arXiv API totalResults",
          note: arxivBands ? JSON.stringify(arxivBands) : "not queried for this term",
        },
        {
          sourceId: "wikimedia_pageviews_2016_2025",
          metric: "total_pageviews_2016_2025",
          value: pageviews[term.term]?.totalViews2016To2025 ?? null,
          unit: "pageviews",
          note: pageviews[term.term]?.latestYearViews == null ? "no matching page or fetch failed" : `2025 views: ${pageviews[term.term].latestYearViews}`,
        },
      ],
    };
  });
}

async function main() {
  const [eu, stanford, arxiv, wikimedia] = await Promise.all([
    fetchEuAiAct(),
    fetchStanfordAiIndex(),
    fetchArxivCounts(),
    fetchWikimediaPageviews(),
  ]);

  const contemporaryEvidence = {
    generatedAt,
    purpose:
      "Supplement Chart 1 with contemporary evidence sources for 2020-2026 terms; this layer supports provenance and confidence rather than changing the visual index by itself.",
    terms: terms.map((term) => term.term),
    sourceAudits: [eu.audit, stanford.audit, arxiv.audit, wikimedia.audit, ...unavailableAudits()],
    termSummaries: buildTermSummaries(eu.counts, stanford.counts, arxiv.counts, wikimedia.totals),
    caveats: [
      "Counts are not directly comparable across sources because legal text, report pages, academic metadata, and pageviews measure different kinds of visibility.",
      "NOW, COCA, and OED remain manual-review sources unless authorized exports are provided.",
      "Google Trends is recorded as a candidate post-Ngram proxy but was not fetched because there is no stable official API.",
    ],
  };

  writeFileSync(rawPath, `${JSON.stringify(contemporaryEvidence, null, 2)}\n`);

  const historical = JSON.parse(readFileSync(historicalPath, "utf8"));
  historical.contemporaryEvidence = contemporaryEvidence;
  writeFileSync(historicalPath, `${JSON.stringify(historical, null, 2)}\n`);

  console.log(
    JSON.stringify(
      {
        generatedAt,
        wrote: [rawPath, historicalPath],
        fetchedSources: contemporaryEvidence.sourceAudits.filter((source) => source.accessStatus === "fetched").map((source) => source.id),
        manualSources: contemporaryEvidence.sourceAudits.filter((source) => source.accessStatus !== "fetched").map((source) => source.id),
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
