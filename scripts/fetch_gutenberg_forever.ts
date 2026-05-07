import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = path.join(process.cwd(), "src", "data", "generated");
const OUT_FILE = path.join(OUT_DIR, "forever_gutenberg_sources.json");

const targetPhrases = [
  "forever and ever",
  "live forever",
  "yours forever",
  "remembered forever",
  "takes forever",
  "forever young",
  "gone forever",
];

const stopwords = new Set([
  "a",
  "about",
  "above",
  "after",
  "again",
  "against",
  "all",
  "am",
  "an",
  "and",
  "any",
  "are",
  "as",
  "at",
  "be",
  "because",
  "been",
  "before",
  "being",
  "below",
  "between",
  "both",
  "but",
  "by",
  "can",
  "could",
  "did",
  "do",
  "does",
  "doing",
  "down",
  "during",
  "each",
  "few",
  "for",
  "from",
  "further",
  "had",
  "has",
  "have",
  "having",
  "he",
  "her",
  "here",
  "hers",
  "herself",
  "him",
  "himself",
  "his",
  "how",
  "i",
  "if",
  "in",
  "into",
  "is",
  "it",
  "its",
  "itself",
  "me",
  "more",
  "most",
  "my",
  "myself",
  "no",
  "nor",
  "not",
  "of",
  "off",
  "on",
  "once",
  "only",
  "or",
  "other",
  "our",
  "ours",
  "ourselves",
  "out",
  "over",
  "own",
  "same",
  "she",
  "should",
  "so",
  "some",
  "such",
  "than",
  "that",
  "the",
  "their",
  "theirs",
  "them",
  "themselves",
  "then",
  "there",
  "these",
  "they",
  "this",
  "those",
  "through",
  "to",
  "too",
  "under",
  "until",
  "up",
  "very",
  "was",
  "we",
  "were",
  "what",
  "when",
  "where",
  "which",
  "while",
  "who",
  "whom",
  "why",
  "will",
  "with",
  "you",
  "your",
  "yours",
  "yourself",
  "yourselves",
]);

const sources = [
  { gutenbergId: 829, title: "Gulliver's Travels", author: "Jonathan Swift", year: 1726 },
  { gutenbergId: 1080, title: "A Modest Proposal", author: "Jonathan Swift", year: 1729 },
  { gutenbergId: 1342, title: "Pride and Prejudice", author: "Jane Austen", year: 1813 },
  { gutenbergId: 158, title: "Emma", author: "Jane Austen", year: 1815 },
  { gutenbergId: 84, title: "Frankenstein", author: "Mary Wollstonecraft Shelley", year: 1818 },
  { gutenbergId: 1260, title: "Jane Eyre", author: "Charlotte Bronte", year: 1847 },
  { gutenbergId: 768, title: "Wuthering Heights", author: "Emily Bronte", year: 1847 },
  { gutenbergId: 1184, title: "The Count of Monte Cristo", author: "Alexandre Dumas", year: 1844 },
  { gutenbergId: 25344, title: "The Scarlet Letter", author: "Nathaniel Hawthorne", year: 1850 },
  { gutenbergId: 2701, title: "Moby-Dick", author: "Herman Melville", year: 1851 },
  { gutenbergId: 98, title: "A Tale of Two Cities", author: "Charles Dickens", year: 1859 },
  { gutenbergId: 1400, title: "Great Expectations", author: "Charles Dickens", year: 1861 },
  { gutenbergId: 11, title: "Alice's Adventures in Wonderland", author: "Lewis Carroll", year: 1865 },
  { gutenbergId: 2600, title: "War and Peace", author: "Leo Tolstoy", year: 1869 },
  { gutenbergId: 74, title: "The Adventures of Tom Sawyer", author: "Mark Twain", year: 1876 },
  { gutenbergId: 174, title: "The Picture of Dorian Gray", author: "Oscar Wilde", year: 1890 },
  { gutenbergId: 1661, title: "The Adventures of Sherlock Holmes", author: "Arthur Conan Doyle", year: 1892 },
  { gutenbergId: 345, title: "Dracula", author: "Bram Stoker", year: 1897 },
  { gutenbergId: 36, title: "The War of the Worlds", author: "H. G. Wells", year: 1898 },
  { gutenbergId: 55, title: "The Wonderful Wizard of Oz", author: "L. Frank Baum", year: 1900 },
  { gutenbergId: 45, title: "Anne of Green Gables", author: "L. M. Montgomery", year: 1908 },
  { gutenbergId: 64317, title: "The Great Gatsby", author: "F. Scott Fitzgerald", year: 1925 },
  { gutenbergId: 77600, title: "The Maltese Falcon", author: "Dashiell Hammett", year: 1930 },
];

type Token = {
  text: string;
  index: number;
};

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
        headers: { "User-Agent": "WordsOverTimePrototype/0.1 contact: local-demo" },
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
  if (year >= 1700 && year <= 1799) return "1700-1799";
  if (year >= 1800 && year <= 1849) return "1800-1849";
  if (year >= 1850 && year <= 1899) return "1850-1899";
  if (year >= 1900 && year <= 1949) return "1900-1949";
  if (year >= 1950 && year <= 1999) return "1950-1999";
  if (year >= 2000 && year <= 2019) return "2000-2019";
  return "recent";
}

function phraseTokens(phrase: string) {
  return phrase.toLowerCase().split(/\s+/);
}

function matchesAt(tokens: Token[], index: number, phrase: string[]) {
  return phrase.every((part, offset) => tokens[index + offset]?.text === part);
}

function snippetAround(text: string, index: number) {
  const start = Math.max(0, index - 150);
  const end = Math.min(text.length, index + 210);
  const raw = text.slice(start, end).replace(/\s+/g, " ").trim();
  const leading = start > 0 ? "..." : "";
  const trailing = end < text.length ? "..." : "";

  return `${leading}${raw}${trailing}`;
}

const generatedSources = [];

for (const source of sources) {
  console.log(`Fetching Gutenberg ${source.gutenbergId}: ${source.title}`);
  const { text: rawText, url } = await fetchText(source.gutenbergId);
  const text = stripGutenbergBoilerplate(rawText);
  const tokens = tokenize(text);
  const phraseCounts = Object.fromEntries(targetPhrases.map((phrase) => [phrase, 0]));
  const occurrences = [];
  const collocates: Record<string, number> = {};
  const phraseTokenMap = new Map(targetPhrases.map((phrase) => [phrase, phraseTokens(phrase)]));
  const eraId = eraIdForYear(source.year);

  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    const isForever = token.text === "forever";
    const isForEver = token.text === "for" && tokens[index + 1]?.text === "ever";

    for (const [phrase, parts] of phraseTokenMap) {
      if (matchesAt(tokens, index, parts)) {
        phraseCounts[phrase] += 1;
        occurrences.push({
          kind: "phrase",
          phrase,
          tokenIndex: index,
          charIndex: token.index,
          snippet: snippetAround(text, token.index),
        });
      }
    }

    if (isForever || isForEver) {
      const form = isForever ? "forever" : "for ever";
      occurrences.push({
        kind: "form",
        phrase: form,
        tokenIndex: index,
        charIndex: token.index,
        snippet: snippetAround(text, token.index),
      });

      const left = Math.max(0, index - 5);
      const right = Math.min(tokens.length - 1, index + 5);
      for (let cursor = left; cursor <= right; cursor += 1) {
        if (cursor === index || (isForEver && cursor === index + 1)) continue;
        const candidate = tokens[cursor].text;
        if (candidate.length < 3 || stopwords.has(candidate)) continue;
        collocates[candidate] = (collocates[candidate] ?? 0) + 1;
      }
    }
  }

  generatedSources.push({
    id: `gutenberg-${source.gutenbergId}`,
    gutenbergId: source.gutenbergId,
    title: source.title,
    author: source.author,
    year: source.year,
    eraId,
    source: "Project Gutenberg",
    sourceUrl: url,
    rightsStatus: "Public domain in the USA",
    tokenCount: tokens.length,
    foreverFormCount: occurrences.filter((item) => item.kind === "form").length,
    phraseCounts,
    collocates,
    occurrences,
  });
}

const generated = {
  generatedAt: new Date().toISOString(),
  source: {
    label: "Project Gutenberg",
    url: "https://www.gutenberg.org/",
    note: "Seeded public-domain texts downloaded as UTF-8 plain text. Boilerplate is stripped before tokenization.",
  },
  targetPhrases,
  windowSize: 5,
  minimumCollocateCount: 2,
  sources: generatedSources,
};

await mkdir(OUT_DIR, { recursive: true });
await writeFile(OUT_FILE, `${JSON.stringify(generated, null, 2)}\n`);
console.log(`Wrote ${OUT_FILE}`);
