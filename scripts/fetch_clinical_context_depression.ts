import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = path.join(process.cwd(), "src", "data", "generated");
const OUT_FILE = path.join(OUT_DIR, "depression_clinical_vocabulary.json");
const EUTILS = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";
const USER_AGENT = "WordsOverTime/1.0 contact: local";

const pubmedQueries = [
  { id: "depression_mesh", label: "Depression [MeSH]", term: "\"Depression\"[MeSH Terms]", branchId: "clinical" },
  { id: "depressive_disorder_mesh", label: "Depressive Disorder [MeSH]", term: "\"Depressive Disorder\"[MeSH Terms]", branchId: "clinical" },
  { id: "major_depressive_disorder_mesh", label: "Major Depressive Disorder [MeSH]", term: "\"Major Depressive Disorder\"[MeSH Terms]", branchId: "clinical" },
  { id: "clinical_depression_text", label: "clinical depression", term: "\"clinical depression\"", branchId: "modern_public_discourse" },
  { id: "major_depression_text", label: "major depression", term: "\"major depression\"", branchId: "clinical" },
  { id: "melancholia_history", label: "melancholia history", term: "melancholia history", branchId: "melancholy_melancholia" },
];

const periods = [
  { id: "pre-1950", start: 1800, end: 1949 },
  { id: "1950-1979", start: 1950, end: 1979 },
  { id: "1980-1999", start: 1980, end: 1999 },
  { id: "2000-2026", start: 2000, end: 2026 },
];

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

async function fetchJson(url: URL) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const response = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
    if (response.ok) return response.json();
    if (response.status !== 429 || attempt === 4) {
      throw new Error(`NCBI request failed: ${response.status} ${response.statusText}`);
    }
    await sleep(1500 * (attempt + 1));
  }
  throw new Error("NCBI request failed after retries");
}

async function pubmedSearch(term: string, start?: number, end?: number, retmax = 0) {
  const url = new URL(`${EUTILS}/esearch.fcgi`);
  url.searchParams.set("db", "pubmed");
  url.searchParams.set("term", term);
  url.searchParams.set("retmode", "json");
  url.searchParams.set("retmax", String(retmax));
  url.searchParams.set("sort", "pub+date");
  if (start && end) {
    url.searchParams.set("datetype", "pdat");
    url.searchParams.set("mindate", String(start));
    url.searchParams.set("maxdate", String(end));
  }
  return fetchJson(url);
}

async function pubmedSummary(ids: string[]) {
  if (ids.length === 0) return [];
  const url = new URL(`${EUTILS}/esummary.fcgi`);
  url.searchParams.set("db", "pubmed");
  url.searchParams.set("id", ids.join(","));
  url.searchParams.set("retmode", "json");
  const data = await fetchJson(url);
  return ids.map((id) => data.result?.[id]).filter(Boolean);
}

const meshDescriptors = [
  {
    id: "mesh-depression",
    heading: "Depression",
    uniqueId: "D003863",
    branchId: "clinical",
    yearIntroduced: null,
    sourceUrl: "https://www.ncbi.nlm.nih.gov/mesh/68003863",
    scopeNote:
      "Depressive states usually of moderate intensity in contrast with major depressive disorder.",
    caveat:
      "MeSH distinguishes Depression from Depressive Disorder and Major Depressive Disorder; keep this broad state separate from diagnosis.",
  },
  {
    id: "mesh-depressive-disorder",
    heading: "Depressive Disorder",
    uniqueId: "D003866",
    branchId: "clinical",
    yearIntroduced: 1981,
    sourceUrl: "https://www.ncbi.nlm.nih.gov/mesh/D003866",
    scopeNote:
      "An affective disorder with prominent, relatively persistent dysphoric mood or loss of interest/pleasure.",
    caveat:
      "MeSH explicitly warns not to confuse this diagnostic category with the broader Depression heading.",
  },
  {
    id: "mesh-major-depressive-disorder",
    heading: "Major Depressive Disorder",
    uniqueId: "D003865",
    branchId: "clinical",
    yearIntroduced: 1981,
    sourceUrl: "https://www.ncbi.nlm.nih.gov/mesh/68003865",
    scopeNote:
      "A disorder involving five or more specified symptoms over a two-week period, including depressed mood or loss of interest/pleasure.",
    caveat:
      "Use as a modern diagnostic node, not as a label for older melancholy or low-spirits evidence.",
  },
];

const institutionalDefinitions = [
  {
    id: "nimh-depression",
    source: "National Institute of Mental Health",
    sourceUrl: "https://www.nimh.nih.gov/health/publications/depression",
    branchId: "modern_public_discourse",
    year: 2026,
    summary:
      "NIMH frames depression as different from ordinary sadness or low mood and includes major depression, major depressive disorder, and clinical depression as public-facing labels.",
    rightsState: "public US government health information",
    confidence: "high",
  },
  {
    id: "who-depressive-disorder",
    source: "World Health Organization",
    sourceUrl: "https://www.who.int/news-room/fact-sheets/detail/depression",
    branchId: "modern_public_discourse",
    year: 2025,
    summary:
      "WHO frames depressive disorder as involving depressed mood or loss of pleasure/interest for long periods, distinct from regular mood changes.",
    rightsState: "WHO web content; use as cited reference, not bulk corpus",
    confidence: "high",
  },
  {
    id: "pmc-open-access-subset",
    source: "PubMed Central Open Access Subset",
    sourceUrl: "https://pmc.ncbi.nlm.nih.gov/tools/openftlist",
    branchId: "clinical",
    year: 2026,
    summary:
      "PMC OA can provide reusable full-text medical articles where licenses allow reuse; not all PMC articles are reusable.",
    rightsState: "license varies by article",
    confidence: "high",
  },
  {
    id: "icd-11-browser-depressive-disorders",
    source: "WHO ICD-11 Browser",
    sourceUrl: "https://icd.who.int/browse/2025-01/mms/en",
    branchId: "clinical",
    year: 2025,
    summary:
      "ICD-11 is a current diagnostic classification reference. It is useful for modern clinical branch labels, not for historical frequency or older affective evidence.",
    rightsState: "reference metadata only; ICD content should be cited, not bulk-copied",
    confidence: "medium",
  },
  {
    id: "apa-dsm-history",
    source: "American Psychiatric Association DSM history",
    sourceUrl: "https://www.psychiatry.org/psychiatrists/practice/dsm/history-of-the-dsm",
    branchId: "clinical",
    year: 2026,
    summary:
      "DSM public history is a classification-history reference for medicalization and diagnostic vocabulary shifts. It is not a reusable corpus source.",
    rightsState: "reference metadata only; APA DSM material is copyright-restricted",
    confidence: "medium",
  },
];

const pubmed = [];
for (const query of pubmedQueries) {
  console.log(`PubMed counts: ${query.label}`);
  const byPeriod = [];
  for (const period of periods) {
    const data = await pubmedSearch(query.term, period.start, period.end);
    await sleep(350);
    byPeriod.push({
      periodId: period.id,
      startYear: period.start,
      endYear: period.end,
      count: Number(data.esearchresult?.count ?? 0),
    });
  }

  const sampleSearch = await pubmedSearch(query.term, undefined, undefined, 5);
  await sleep(350);
  const ids = sampleSearch.esearchresult?.idlist ?? [];
  const summaries = await pubmedSummary(ids);
  await sleep(350);

  pubmed.push({
    id: `pubmed-${slug(query.id)}`,
    label: query.label,
    query: query.term,
    branchId: query.branchId,
    totalCount: Number(sampleSearch.esearchresult?.count ?? 0),
    countsByPeriod: byPeriod,
    samples: summaries.map((summary: Record<string, unknown>) => ({
      uid: summary.uid,
      title: summary.title,
      pubdate: summary.pubdate,
      source: summary.source,
      sourceUrl: summary.uid ? `https://pubmed.ncbi.nlm.nih.gov/${summary.uid}/` : "https://pubmed.ncbi.nlm.nih.gov/",
      evidenceType: "pubmed_metadata",
      rightsState: "metadata only; article rights vary",
    })),
    caveat:
      "PubMed counts are biomedical bibliography counts, not general-language frequency or condition prevalence.",
  });
}

const generated = {
  generatedAt: new Date().toISOString(),
  layer: "clinical vocabulary and medicalization evidence",
  sources: [
    "PubMed E-utilities",
    "PubMed Central Open Access Subset",
    "MeSH Browser / NCBI",
    "WHO ICD-11 Browser",
    "APA DSM public history",
    "NIMH",
    "WHO",
  ],
  meshDescriptors,
  pubmed,
  institutionalDefinitions,
  caveats: [
    "Clinical labels are branch-specific and should not be projected backward onto ordinary sadness, low spirits, or melancholy.",
    "PubMed and MeSH are medical/institutional layers, not general public usage corpora.",
    "PMC OA is feasible for future full-text extraction, but article-level license checks remain necessary.",
  ],
};

await mkdir(OUT_DIR, { recursive: true });
await writeFile(OUT_FILE, `${JSON.stringify(generated, null, 2)}\n`);
console.log(`Wrote ${OUT_FILE}`);
