import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = path.join(process.cwd(), "src", "data", "generated");
const OUT_FILE = path.join(OUT_DIR, "depression_archival_context.json");

const USER_AGENT = "WordsOverTime/1.0 contact: local";
const windowSize = 5;

const targetTerms = ["depression", "melancholy", "melancholia", "sadness", "despair", "gloom"];

const targetPhrases = [
  "mental depression",
  "clinical depression",
  "major depression",
  "depressive disorder",
  "economic depression",
  "great depression",
  "financial depression",
  "business depression",
  "depression of spirits",
  "state of depression",
  "fits of depression",
  "nervous depression",
  "depression in trade",
  "commercial depression",
  "topographical depression",
  "geological depression",
  "depression of the surface",
  "depression of the land",
  "black bile",
];

const sources = [
  { gutenbergId: 10800, title: "The Anatomy of Melancholy", author: "Robert Burton", year: 1621 },
  { gutenbergId: 3300, title: "The Wealth of Nations", author: "Adam Smith", year: 1776 },
  { gutenbergId: 37144, title: "Observations on Madness and Melancholy", author: "John Haslam", year: 1809 },
  { gutenbergId: 1342, title: "Pride and Prejudice", author: "Jane Austen", year: 1813 },
  { gutenbergId: 84, title: "Frankenstein", author: "Mary Wollstonecraft Shelley", year: 1818 },
  { gutenbergId: 33224, title: "Principles of Geology", author: "Charles Lyell", year: 1830 },
  { gutenbergId: 944, title: "The Voyage of the Beagle", author: "Charles Darwin", year: 1839 },
  { gutenbergId: 1260, title: "Jane Eyre", author: "Charlotte Bronte", year: 1847 },
  { gutenbergId: 768, title: "Wuthering Heights", author: "Emily Bronte", year: 1847 },
  { gutenbergId: 1228, title: "On the Origin of Species", author: "Charles Darwin", year: 1859 },
  { gutenbergId: 2701, title: "Moby-Dick", author: "Herman Melville", year: 1851 },
  { gutenbergId: 1400, title: "Great Expectations", author: "Charles Dickens", year: 1861 },
  { gutenbergId: 2600, title: "War and Peace", author: "Leo Tolstoy", year: 1869 },
  { gutenbergId: 74, title: "The Adventures of Tom Sawyer", author: "Mark Twain", year: 1876 },
  { gutenbergId: 174, title: "The Picture of Dorian Gray", author: "Oscar Wilde", year: 1890 },
  { gutenbergId: 1661, title: "The Adventures of Sherlock Holmes", author: "Arthur Conan Doyle", year: 1892 },
  { gutenbergId: 345, title: "Dracula", author: "Bram Stoker", year: 1897 },
  { gutenbergId: 36, title: "The War of the Worlds", author: "H. G. Wells", year: 1898 },
  { gutenbergId: 55, title: "The Wonderful Wizard of Oz", author: "L. Frank Baum", year: 1900 },
  { gutenbergId: 621, title: "The Varieties of Religious Experience", author: "William James", year: 1902 },
  { gutenbergId: 64317, title: "The Great Gatsby", author: "F. Scott Fitzgerald", year: 1925 },
  { gutenbergId: 77600, title: "The Maltese Falcon", author: "Dashiell Hammett", year: 1930 },
];

const stopwords = new Set([
  "about",
  "above",
  "after",
  "again",
  "against",
  "all",
  "also",
  "and",
  "any",
  "are",
  "because",
  "been",
  "before",
  "being",
  "below",
  "between",
  "both",
  "but",
  "can",
  "could",
  "depression",
  "depressions",
  "despair",
  "did",
  "does",
  "doing",
  "down",
  "during",
  "each",
  "few",
  "for",
  "from",
  "further",
  "gloom",
  "good",
  "had",
  "has",
  "have",
  "having",
  "her",
  "here",
  "hers",
  "him",
  "his",
  "man",
  "men",
  "how",
  "into",
  "its",
  "itself",
  "melancholia",
  "melancholy",
  "more",
  "most",
  "much",
  "nor",
  "not",
  "off",
  "once",
  "one",
  "only",
  "other",
  "our",
  "out",
  "over",
  "own",
  "same",
  "sadness",
  "shall",
  "she",
  "should",
  "some",
  "such",
  "than",
  "that",
  "the",
  "their",
  "them",
  "then",
  "there",
  "these",
  "they",
  "this",
  "those",
  "through",
  "too",
  "under",
  "until",
  "upon",
  "was",
  "were",
  "what",
  "when",
  "where",
  "which",
  "while",
  "who",
  "will",
  "with",
  "would",
  "you",
  "your",
]);

type Token = {
  text: string;
  index: number;
};

type Snippet = {
  id: string;
  sourceId: string;
  sourceCorpus: string;
  sourceUrl: string;
  title: string;
  author: string;
  year: number;
  eraId: string;
  dateBasis: string;
  rightsStatus: string;
  matchedTerm: string;
  matchedPhrase: string | null;
  quote: string;
  categoryIds: string[];
  evidenceType: string;
  caveat: string;
};

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function textUrls(id: number) {
  return [
    `https://www.gutenberg.org/files/${id}/${id}-0.txt`,
    `https://www.gutenberg.org/files/${id}/${id}.txt`,
    `https://www.gutenberg.org/cache/epub/${id}/pg${id}.txt`,
    `https://www.gutenberg.org/ebooks/${id}.txt.utf-8`,
  ];
}

async function fetchText(id: number) {
  let lastError = "";
  for (const url of textUrls(id)) {
    try {
      const response = await fetch(url, {
        headers: { "User-Agent": USER_AGENT },
      });
      if (response.ok) return { text: await response.text(), url };
      lastError = `${response.status} ${response.statusText}`;
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }
  }
  throw new Error(`Could not fetch Gutenberg ${id}: ${lastError}`);
}

function stripGutenbergBoilerplate(text: string) {
  const startMatch = text.match(/\*\*\*\s*START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[\s\S]*?\*\*\*/i);
  const endMatch = text.match(/\*\*\*\s*END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK/i);
  const start = startMatch?.index === undefined ? 0 : startMatch.index + startMatch[0].length;
  const end = endMatch?.index ?? text.length;

  return text.slice(start, end).replace(/\r/g, "").replace(/[ \t]+/g, " ");
}

function tokenize(text: string): Token[] {
  const tokens: Token[] = [];
  const matcher = /[A-Za-z]+(?:'[A-Za-z]+)?/g;
  let match: RegExpExecArray | null;
  while ((match = matcher.exec(text))) {
    tokens.push({ text: match[0].toLowerCase(), index: match.index });
  }
  return tokens;
}

function eraIdForYear(year: number) {
  if (year < 1700) return "pre-1700";
  if (year <= 1799) return "1700-1799";
  if (year <= 1849) return "1800-1849";
  if (year <= 1899) return "1850-1899";
  if (year <= 1949) return "1900-1949";
  return "post-1950";
}

function phraseTokens(phrase: string) {
  return phrase.toLowerCase().split(/\s+/);
}

function matchesAt(tokens: Token[], index: number, phrase: string[]) {
  return phrase.every((part, offset) => tokens[index + offset]?.text === part);
}

function snippetAround(text: string, index: number) {
  const start = Math.max(0, index - 170);
  const end = Math.min(text.length, index + 230);
  const raw = text.slice(start, end).replace(/\s+/g, " ").trim();
  const leading = start > 0 ? "..." : "";
  const trailing = end < text.length ? "..." : "";

  return `${leading}${raw}${trailing}`;
}

function isEditorialMatter(quote: string) {
  return /project gutenberg edition|electronic version|transcriber|produced by|proofreading team|editor had made|release date/i.test(
    quote,
  );
}

function categoryIdsForText(text: string) {
  const lower = text.toLowerCase();
  const categories = new Set<string>();

  if (/(sad|sorrow|despair|gloom|spirits|dejected|despond|grief|unhappy)/.test(lower)) {
    categories.add("emotional_state");
  }
  if (/(melanchol|madness|insanity|patient|disease|mental|nervous|psychiatr|disorder|symptom)/.test(lower)) {
    categories.add("clinical_psychiatric_condition");
  }
  if (/(trade|commerce|business|financial|economic|panic|market|prices|credit|industry|manufactur)/.test(lower)) {
    categories.add("economic_downturn");
  }
  if (/(geolog|topograph|surface|valley|basin|land|sea|mountain|strata|earth|island|coast)/.test(lower)) {
    categories.add("geographical_topographical");
  }
  if (/(pressure|press|pressed|lowering|baromet|angle|horizon|below|sink|sinking)/.test(lower)) {
    categories.add("physical_lowering_pressure");
  }
  if (/(melancholy|melancholia|black bile|sorrow|despair|gloom|poet|literary)/.test(lower)) {
    categories.add("literary_melancholy_sadness_cluster");
  }

  return Array.from(categories);
}

const phraseParts = new Map(targetPhrases.map((phrase) => [phrase, phraseTokens(phrase)]));
const sourceRows = [];
const snippets: Snippet[] = [];
const phraseMap = new Map<string, {
  phrase: string;
  count: number;
  sourceIds: Set<string>;
  snippetIds: Set<string>;
  categoryIds: Set<string>;
}>();
const collocateMap = new Map<string, {
  token: string;
  count: number;
  sourceIds: Set<string>;
  snippetIds: Set<string>;
  categoryIds: Set<string>;
}>();

for (const source of sources) {
  console.log(`Fetching Gutenberg ${source.gutenbergId}: ${source.title}`);
  let fetched: { text: string; url: string };
  try {
    fetched = await fetchText(source.gutenbergId);
  } catch (error) {
    console.warn(error instanceof Error ? error.message : String(error));
    continue;
  }

  const text = stripGutenbergBoilerplate(fetched.text);
  const tokens = tokenize(text);
  const sourceId = `gutenberg-${source.gutenbergId}`;
  const eraId = eraIdForYear(source.year);
  const sourceTermCounts = Object.fromEntries(targetTerms.map((term) => [term, 0]));
  const sourcePhraseCounts = Object.fromEntries(targetPhrases.map((phrase) => [phrase, 0]));
  let sourceOccurrenceCount = 0;

  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    const matchedTerm = targetTerms.find((term) => token.text === term);
    let matchedPhrase: string | null = null;

    for (const [phrase, parts] of phraseParts) {
      if (matchesAt(tokens, index, parts)) {
        matchedPhrase = phrase;
        sourcePhraseCounts[phrase] += 1;
        const phraseRow = phraseMap.get(phrase) ?? {
          phrase,
          count: 0,
          sourceIds: new Set<string>(),
          snippetIds: new Set<string>(),
          categoryIds: new Set<string>(),
        };
        phraseRow.count += 1;
        phraseRow.sourceIds.add(sourceId);
        phraseMap.set(phrase, phraseRow);
      }
    }

    if (!matchedTerm && !matchedPhrase) continue;

    const matchLabel = matchedPhrase ?? matchedTerm ?? "depression-context";
    if (matchedTerm) sourceTermCounts[matchedTerm] += 1;
    sourceOccurrenceCount += 1;

    const quote = snippetAround(text, token.index);
    if (isEditorialMatter(quote)) continue;
    const categoryIds = categoryIdsForText(`${matchLabel} ${quote}`);
    const snippetId = `archival-${source.gutenbergId}-${sourceOccurrenceCount}`;
    if (snippets.length < 180 || matchedPhrase || matchedTerm === "depression") {
      snippets.push({
        id: snippetId,
        sourceId,
        sourceCorpus: "Project Gutenberg",
        sourceUrl: fetched.url,
        title: source.title,
        author: source.author,
        year: source.year,
        eraId,
        dateBasis: "curated original publication year",
        rightsStatus: "Public domain in the USA",
        matchedTerm: matchedTerm ?? matchLabel,
        matchedPhrase,
        quote,
        categoryIds,
        evidenceType: matchedPhrase ? "phrase_evidence" : "term_occurrence",
        caveat:
          "Project Gutenberg evidence is display-safe but not a balanced historical corpus. Publication years are curated approximations for the source texts.",
      });
    }

    if (matchedPhrase) {
      const phraseRow = phraseMap.get(matchedPhrase);
      if (phraseRow) {
        phraseRow.snippetIds.add(snippetId);
        categoryIds.forEach((categoryId) => phraseRow.categoryIds.add(categoryId));
      }
    }

    const left = Math.max(0, index - windowSize);
    const right = Math.min(tokens.length - 1, index + windowSize);
    for (let cursor = left; cursor <= right; cursor += 1) {
      if (cursor === index) continue;
      const candidate = tokens[cursor].text;
      if (candidate.length < 3 || stopwords.has(candidate)) continue;
      const current = collocateMap.get(candidate) ?? {
        token: candidate,
        count: 0,
        sourceIds: new Set<string>(),
        snippetIds: new Set<string>(),
        categoryIds: new Set<string>(),
      };
      current.count += 1;
      current.sourceIds.add(sourceId);
      current.snippetIds.add(snippetId);
      categoryIdsForText(candidate).forEach((categoryId) => current.categoryIds.add(categoryId));
      categoryIds.forEach((categoryId) => current.categoryIds.add(categoryId));
      collocateMap.set(candidate, current);
    }
  }

  sourceRows.push({
    id: sourceId,
    gutenbergId: source.gutenbergId,
    title: source.title,
    author: source.author,
    year: source.year,
    eraId,
    source: "Project Gutenberg",
    sourceUrl: fetched.url,
    rightsStatus: "Public domain in the USA",
    tokenCount: tokens.length,
    termCounts: sourceTermCounts,
    phraseCounts: sourcePhraseCounts,
    occurrenceCount: sourceOccurrenceCount,
  });
}

const phraseRows = Array.from(phraseMap.values())
  .map((row) => ({
    id: `archival-phrase-${slug(row.phrase)}`,
    phrase: row.phrase,
    count: row.count,
    documentFrequency: row.sourceIds.size,
    sourceCorpus: "Project Gutenberg",
    relatedSnippetIds: Array.from(row.snippetIds),
    categoryIds: Array.from(row.categoryIds),
    displayEligible: row.count >= 1 && row.sourceIds.size >= 1,
    displayReason:
      row.count >= 2
        ? "Repeated phrase evidence in the Gutenberg seed."
        : "Single-source phrase evidence; useful as a candidate, not a stable pattern.",
  }))
  .sort((a, b) => b.count - a.count || b.documentFrequency - a.documentFrequency);

const collocateRows = Array.from(collocateMap.values())
  .map((row) => ({
    id: `archival-collocate-${slug(row.token)}`,
    token: row.token,
    count: row.count,
    documentFrequency: row.sourceIds.size,
    sourceCorpus: "Project Gutenberg",
    categoryIds: Array.from(row.categoryIds),
    relatedSnippetIds: Array.from(row.snippetIds).slice(0, 12),
    displayEligible: row.count >= 3 && row.sourceIds.size >= 2,
    displayReason:
      row.count >= 3 && row.sourceIds.size >= 2
        ? "Passes a lightweight count and source-spread threshold."
        : "Kept for raw audit only; too thin for a main visual.",
  }))
  .sort((a, b) => b.count - a.count || b.documentFrequency - a.documentFrequency)
  .slice(0, 80);

const generated = {
  generatedAt: new Date().toISOString(),
  layer: "archival context",
  source: {
    label: "Project Gutenberg",
    url: "https://www.gutenberg.org/",
    note:
      "Seeded public-domain texts downloaded as UTF-8 plain text. Boilerplate is stripped before tokenization.",
    caveat:
      "This layer is useful for snippets, phrase candidates, and collocates. It is not a representative historical corpus.",
  },
  coverage: {
    startYear: Math.min(...sourceRows.map((row) => row.year)),
    endYear: Math.max(...sourceRows.map((row) => row.year)),
    sourceCount: sourceRows.length,
    comparableToNgram: false,
  },
  targetTerms,
  targetPhrases,
  windowSize,
  sources: sourceRows,
  snippets,
  phrases: phraseRows,
  collocates: collocateRows,
};

await mkdir(OUT_DIR, { recursive: true });
await writeFile(OUT_FILE, `${JSON.stringify(generated, null, 2)}\n`);
console.log(`Wrote ${OUT_FILE}`);
