import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = path.join(process.cwd(), "src", "data", "generated");

const eras = [
  { id: "all", label: "All", startYear: null, endYear: null, note: "All available real-data coverage." },
  { id: "1700-1799", label: "1700-1799", startYear: 1700, endYear: 1799, note: "Sparse Gutenberg seed coverage; Ngram coverage is available." },
  { id: "1800-1849", label: "1800-1849", startYear: 1800, endYear: 1849, note: "Gutenberg seed texts and Ngram coverage." },
  { id: "1850-1899", label: "1850-1899", startYear: 1850, endYear: 1899, note: "Strongest Gutenberg context coverage in the current corpus layer." },
  { id: "1900-1949", label: "1900-1949", startYear: 1900, endYear: 1949, note: "Limited public-domain context texts in the current corpus layer." },
  { id: "1950-1999", label: "1950-1999", startYear: 1950, endYear: 1999, note: "Ngram coverage only in this round; no Gutenberg snippets selected." },
  { id: "2000-2019", label: "2000-2019", startYear: 2000, endYear: 2019, note: "Ngram coverage only in this round; recent contextual corpus not implemented." },
  { id: "recent", label: "Recent", startYear: 2020, endYear: 2022, note: "Google Ngram currently reaches 2022 here; no live 2026 layer is implemented." },
];

const categoryDefs = [
  {
    id: "eternity_religion",
    label: "Eternity / Religion",
    color: "#1570AC",
    method: "Curated heuristic from phrases and collocates such as forever and ever, God, heaven, soul, immortal.",
    phrases: ["forever and ever"],
    collocates: ["god", "heaven", "soul", "immortal", "eternal", "spirit", "life", "lives"],
  },
  {
    id: "romance_vow",
    label: "Romance / Vow",
    color: "#A1081F",
    method: "Curated heuristic from vow and address patterns such as yours forever plus love collocates.",
    phrases: ["yours forever"],
    collocates: ["love", "heart", "dear", "beloved", "kiss", "darling", "loving"],
  },
  {
    id: "permanence_duration",
    label: "Permanence / Duration",
    color: "#F06B04",
    method: "Curated heuristic for lasting, remaining, living, and loss patterns.",
    phrases: ["live forever", "gone forever"],
    collocates: ["last", "remain", "gone", "lost", "life", "live", "death", "world"],
  },
  {
    id: "remembrance",
    label: "Memory / Remembrance",
    color: "#036C17",
    method: "Curated heuristic for remembered, memory, name, and legacy patterns.",
    phrases: ["remembered forever"],
    collocates: ["remembered", "memory", "name", "forgotten", "remember", "dead", "grave"],
  },
  {
    id: "hyperbole_colloquial",
    label: "Hyperbole / Colloquial",
    color: "#FBB728",
    method: "Curated heuristic for exaggerated duration patterns. Gutenberg evidence is expected to be thin.",
    phrases: ["takes forever", "forever young"],
    collocates: ["long", "never", "always", "young", "wait", "waiting", "time"],
  },
  {
    id: "digital_permanence",
    label: "Digital Permanence",
    color: "#2C9FC7",
    method: "Not supported by the current public-domain text seed. Kept as a future category note only.",
    phrases: [],
    collocates: ["online", "internet", "digital", "data", "privacy"],
  },
];

const collocateDisplayStopwords = new Set([
  "ever",
  "forever",
  "would",
  "shall",
  "could",
  "should",
  "may",
  "might",
  "must",
  "said",
  "says",
  "now",
  "yet",
  "still",
  "without",
  "upon",
  "one",
  "two",
  "thing",
  "things",
]);

type FrequencyFile = {
  generatedAt: string;
  source: {
    label: string;
    url: string;
    corpus: string;
    startYear: number;
    endYear: number;
    smoothing: number;
    note: string;
  };
  series: Array<{
    id: string;
    label: string;
    query: string;
    color: string;
    source: string;
    sourceUrl: string;
    corpus: string;
    smoothing: number;
    startYear: number;
    endYear: number;
    firstNonZeroYear?: number | null;
    recommendedVisualStartYear?: number;
    pre1700Status?: string;
    coverageNote?: string;
    rangeStats?: Array<{
      startYear: number;
      endYear: number;
      pointCount: number;
      nonZeroYearCount: number;
      averageFrequencyPerMillion: number;
      maxFrequencyPerMillion: number;
    }>;
    inspectorId: string;
    points: Array<{ year: number; value: number; frequencyPerMillion: number }>;
  }>;
};

type PrehistoryFile = {
  generatedAt: string;
  layer: string;
  coverage: {
    earliestApproximateYear: number;
    latestApproximateYear: number;
    comparableCorpusAvailable: boolean;
    note: string;
  };
  records: Array<{
    id: string;
    form: string;
    normalizedForm: string;
    evidenceType: string;
    dateLabel: string;
    yearApproximation: number;
    sourceName: string;
    sourceUrl: string;
    sourceCategory: string;
    quote: string;
    verificationStatus: string;
    confidence: string;
    caveat: string;
  }>;
  investigatedSources: Array<{
    id: string;
    name: string;
    coverage: string;
    status: string;
    sourceUrl: string;
    note: string;
  }>;
};

type ModernContextFile = {
  generatedAt: string;
  layer: string;
  source: {
    label: string;
    url: string;
    apiUrl: string;
    licenseNote: string;
    caveat: string;
  };
  coverage: {
    startYear: number | null;
    endYear: number | null;
    sourceType: string;
    comparableToHistoricalCorpus: boolean;
  };
  queries: string[];
  snippets: Array<{
    id: string;
    source: string;
    sourceUrl: string;
    sourceCorpus: string;
    title: string;
    author: string;
    year: number;
    eraId: string;
    dateBasis?: string;
    query: string;
    quote: string;
    rightsStatus: string;
    evidenceType: string;
    categoryIds: string[];
    caveat: string;
  }>;
  phrases: Array<{
    id: string;
    phrase: string;
    count: number;
    documentFrequency: number;
    sourceCorpus: string;
    relatedSnippetIds: string[];
    categoryIds: string[];
    displayEligible: boolean;
    caveat: string;
  }>;
  collocates: Array<{
    id: string;
    token: string;
    count: number;
    documentFrequency: number;
    sourceCorpus: string;
    categoryIds: string[];
    relatedSnippetIds: string[];
    caveat: string;
  }>;
};

type GutenbergFile = {
  generatedAt: string;
  source: { label: string; url: string; note: string };
  targetPhrases: string[];
  windowSize: number;
  minimumCollocateCount: number;
  sources: Array<{
    id: string;
    gutenbergId: number;
    title: string;
    author: string;
    year: number;
    eraId: string;
    source: string;
    sourceUrl: string;
    rightsStatus: string;
    tokenCount: number;
    foreverFormCount: number;
    phraseCounts: Record<string, number>;
    collocates: Record<string, number>;
    occurrences: Array<{
      kind: "phrase" | "form";
      phrase: string;
      tokenIndex: number;
      charIndex: number;
      snippet: string;
    }>;
  }>;
};

type PhraseRow = {
  id: string;
  phrase: string;
  eraId: string;
  count: number;
  jointCount: number;
  documentFrequency: number;
  dispersion: number;
  scoreType: string;
  scoreValue: number;
  sourceTextCount: number;
  sampleTitles: string[];
  categoryIds: string[];
  relatedSnippetIds: string[];
  displayEligible: boolean;
  displayReason: string;
  inspectorId: string;
};

type CollocateRow = {
  id: string;
  token: string;
  eraId: string;
  count: number;
  jointCount: number;
  documentFrequency: number;
  dispersion: number;
  scoreType: string;
  score: number;
  scoreValue: number;
  windowSize: number;
  categoryIds: string[];
  sourceTextCount: number;
  relatedSnippetIds: string[];
  displayEligible: boolean;
  displayReason: string;
  inspectorId: string;
};

type SnippetRow = {
  id: string;
  eraId: string;
  year: number;
  title: string;
  author: string;
  source: string;
  sourceUrl: string;
  quote: string;
  phrase: string;
  evidenceType:
    | "form_occurrence"
    | "phrase_evidence"
    | "collocate_support"
    | "contextual_category_support";
  rightsStatus: string;
  categoryIds: string[];
  note: string;
  inspectorId: string;
};

type FlowRow = {
  id: string;
  source: string;
  target: string;
  value: number;
  eraId: string;
  color: string;
  relation: string;
  inspectorId: string;
};

type AtlasNodeRow = {
  id: string;
  label: string;
  column: "form" | "phrase" | "contextual_category" | "collocate";
  eraId: string;
  color: string;
  value: number;
  evidenceCount: number;
  documentFrequency?: number;
  scoreType?: string;
  scoreValue?: number;
  sourceCorpus: string;
  relatedSnippetIds: string[];
  caveat: string;
  inspectorId: string;
};

type AtlasEdgeRow = {
  id: string;
  sourceId: string;
  targetId: string;
  relationType:
    | "form_relation"
    | "phrase_evidence"
    | "category_assignment"
    | "collocate_support"
    | "editorial_grouping";
  value: number;
  eraId: string;
  evidenceCount: number;
  scoreType?: string;
  scoreValue?: number;
  dataLayer: "raw" | "computed" | "curated" | "interpretive";
  relatedSnippetIds: string[];
  caveat: string;
  inspectorId: string;
};

type LedgerCellRow = {
  id: string;
  categoryId: string;
  eraId: string;
  evidenceStrength: "strong" | "moderate" | "weak" | "none";
  phraseSupport: number;
  collocateSupport: number;
  snippetSupport: number;
  coverageStatus:
    | "supported"
    | "weak"
    | "no-current-context-layer"
    | "future-layer";
  confidence: "high" | "medium" | "low" | "unavailable";
  scoreType: string;
  scoreValue: number;
  sourceCorpus: string;
  relatedSnippetIds: string[];
  inspectorId: string;
};

type NetworkNodeRow = {
  id: string;
  label: string;
  group: string;
  x: number;
  y: number;
  radius: number;
  color: string;
  eraId: string;
  inspectorId: string;
  count?: number;
  score?: number;
};

type NetworkEdgeRow = {
  id: string;
  source: string;
  target: string;
  weight: number;
  relation: string;
  color: string;
  eraId: string;
  inspectorId: string;
};

type InspectorRow = {
  id: string;
  title: string;
  visualType: string;
  elementType: string;
  period: string;
  dataLayer: "raw" | "computed" | "curated" | "interpretive";
  selectionReason: string;
  evidenceCount: number;
  documentFrequency?: number;
  scoreType?: string;
  scoreValue?: number;
  sourceCorpus: string;
  coverageRange: string;
  relatedSnippetIds: string[];
  rawInputs: Array<{ label: string; value: string | number; detail?: string }>;
  derivedValues: Array<{ label: string; value: string | number; detail?: string }>;
  curatedDecisions: Array<{ label: string; value: string | number; detail?: string }>;
  visualMapping: string;
  explanation: string;
  sources: Array<{ label: string; url?: string; dateRange?: string; rightsStatus?: string }>;
  caveats: string[];
};

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function eraForYear(year: number) {
  return eras.find(
    (era) =>
      era.id !== "all" &&
      era.startYear !== null &&
      era.endYear !== null &&
      year >= era.startYear &&
      year <= era.endYear,
  )?.id ?? "recent";
}

function pointsForEra(points: Array<{ year: number; frequencyPerMillion: number }>, eraId: string) {
  const era = eras.find((item) => item.id === eraId);
  if (!era || era.id === "all" || era.startYear === null || era.endYear === null) return points;
  return points.filter((point) => point.year >= era.startYear! && point.year <= era.endYear!);
}

function average(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function categoriesForPhrase(phrase: string) {
  return categoryDefs
    .filter((category) => category.phrases.includes(phrase))
    .map((category) => category.id);
}

function categoriesForCollocate(token: string) {
  return categoryDefs
    .filter((category) => category.collocates.includes(token.toLowerCase()))
    .map((category) => category.id);
}

function sourceTextTitles(sources: GutenbergFile["sources"], phrase: string, eraId: string) {
  return sources
    .filter((source) => (eraId === "all" || source.eraId === eraId) && (source.phraseCounts[phrase] ?? 0) > 0)
    .map((source) => source.title)
    .slice(0, 4);
}

function simpleLogDice(jointCount: number, targetCount: number, candidateCount: number) {
  if (jointCount <= 0 || targetCount <= 0 || candidateCount <= 0) return 0;
  return 14 + Math.log2((2 * jointCount) / (targetCount + candidateCount));
}

function displayReasonForPhrase(count: number, documentFrequency: number) {
  if (count >= 3 && documentFrequency >= 2) {
    return "Displayed because it has repeated phrase evidence across more than one source text.";
  }

  return "Displayed as a targeted phrase because it was requested for the forever evidence layer and appears in the seed corpus.";
}

function evidenceTypeForSnippet(phrase: string, categoryIds: string[]): SnippetRow["evidenceType"] {
  if (categoryIds.length > 0) return "contextual_category_support";
  if (phrase.includes(" ")) return phrase === "for ever" ? "form_occurrence" : "phrase_evidence";
  return "form_occurrence";
}

function atlasFormNodeId(label: string, eraId: string) {
  return `atlas-form-${slug(label)}-${eraId}`;
}

function atlasPhraseNodeId(label: string, eraId: string) {
  return `atlas-phrase-${slug(label)}-${eraId}`;
}

function atlasCategoryNodeId(label: string, eraId: string) {
  return `atlas-category-${slug(label)}-${eraId}`;
}

function atlasCollocateNodeId(label: string, eraId: string) {
  return `atlas-collocate-${slug(label)}-${eraId}`;
}

function atlasFormLabel(id: string) {
  const labels: Record<string, string> = {
    forever: "forever",
    "for-ever": "for ever",
    forevermore: "forevermore",
    "forever-and-ever": "forever and ever",
  };
  return labels[id] ?? id;
}

const frequency = JSON.parse(
  await readFile(path.join(OUT_DIR, "forever_frequency.json"), "utf8"),
) as FrequencyFile;
const gutenberg = JSON.parse(
  await readFile(path.join(OUT_DIR, "forever_gutenberg_sources.json"), "utf8"),
) as GutenbergFile;

async function readJsonIfExists<T>(fileName: string, fallback: T) {
  try {
    return JSON.parse(await readFile(path.join(OUT_DIR, fileName), "utf8")) as T;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return fallback;
    throw error;
  }
}

const prehistory = await readJsonIfExists<PrehistoryFile | null>("forever_prehistory.json", null);
const modernContext = await readJsonIfExists<ModernContextFile | null>("forever_modern_context.json", null);

const phraseRows: PhraseRow[] = [];
for (const era of eras) {
  for (const phrase of gutenberg.targetPhrases) {
    const matchingSources = gutenberg.sources.filter((source) => era.id === "all" || source.eraId === era.id);
    const count = matchingSources.reduce((sum, source) => sum + (source.phraseCounts[phrase] ?? 0), 0);
    if (count <= 0) continue;
    const documentFrequency = matchingSources.filter((source) => (source.phraseCounts[phrase] ?? 0) > 0).length;
    const dispersion = matchingSources.length > 0 ? documentFrequency / matchingSources.length : 0;
    const totalPhraseWindows = matchingSources.reduce((sum, source) => sum + source.foreverFormCount, 0);
    const scoreValue = simpleLogDice(count, Math.max(1, totalPhraseWindows), count);
    phraseRows.push({
      id: `phrase-${slug(phrase)}-${era.id}`,
      phrase,
      eraId: era.id,
      count,
      jointCount: count,
      documentFrequency,
      dispersion: Number(dispersion.toFixed(3)),
      scoreType: "simple logDice",
      scoreValue: Number(scoreValue.toFixed(3)),
      sourceTextCount: documentFrequency,
      sampleTitles: sourceTextTitles(gutenberg.sources, phrase, era.id),
      categoryIds: categoriesForPhrase(phrase),
      relatedSnippetIds: [],
      displayEligible: true,
      displayReason: displayReasonForPhrase(count, documentFrequency),
      inspectorId: `inspect-phrase-${slug(phrase)}-${era.id}`,
    });
  }
}

const collocateRows: CollocateRow[] = [];
for (const era of eras) {
  const totals = new Map<string, { count: number; sourceTextCount: number }>();
  const matchingSources = gutenberg.sources.filter((source) => era.id === "all" || source.eraId === era.id);
  for (const source of matchingSources) {
    for (const [token, count] of Object.entries(source.collocates)) {
      const current = totals.get(token) ?? { count: 0, sourceTextCount: 0 };
      current.count += count;
      current.sourceTextCount += 1;
      totals.set(token, current);
    }
  }

  const totalForeverWindows = matchingSources.reduce((sum, source) => sum + source.foreverFormCount, 0);
  const rows = Array.from(totals.entries())
    .map(([token, value]) => ({
      token,
      count: value.count,
      sourceTextCount: value.sourceTextCount,
      score: simpleLogDice(value.count, totalForeverWindows, value.count),
    }))
    .filter((row) => !collocateDisplayStopwords.has(row.token))
    .filter((row) => categoriesForCollocate(row.token).length > 0)
    .filter((row) => row.count >= gutenberg.minimumCollocateCount)
    .filter((row) => row.sourceTextCount >= (era.id === "all" ? 2 : 1))
    .sort((a, b) => b.score - a.score || b.count - a.count)
    .slice(0, era.id === "all" ? 10 : 5);

  for (const row of rows) {
    collocateRows.push({
      id: `collocate-${slug(row.token)}-${era.id}`,
      token: row.token,
      eraId: era.id,
      count: row.count,
      jointCount: row.count,
      documentFrequency: row.sourceTextCount,
      dispersion: Number((row.sourceTextCount / Math.max(1, matchingSources.length)).toFixed(3)),
      scoreType: "simple logDice",
      score: Number(row.score.toFixed(3)),
      scoreValue: Number(row.score.toFixed(3)),
      windowSize: gutenberg.windowSize,
      categoryIds: categoriesForCollocate(row.token),
      sourceTextCount: row.sourceTextCount,
      relatedSnippetIds: [],
      displayEligible: true,
      displayReason:
        "Displayed because it matches a curated contextual category and passes the count/document-frequency filter.",
      inspectorId: `inspect-collocate-${slug(row.token)}-${era.id}`,
    });
  }
}

const snippetRows: SnippetRow[] = [];
for (const era of eras.filter((item) => item.id !== "all")) {
  const candidates = gutenberg.sources
    .filter((source) => source.eraId === era.id)
    .flatMap((source) =>
      source.occurrences
        .filter((occurrence) => occurrence.kind === "phrase" || occurrence.phrase === "forever" || occurrence.phrase === "for ever")
        .map((occurrence) => ({ source, occurrence })),
    );

  const selected = candidates
    .sort((a, b) => (a.occurrence.kind === "phrase" ? -1 : 1) - (b.occurrence.kind === "phrase" ? -1 : 1))
    .slice(0, 6);

  for (const [index, item] of selected.entries()) {
    const categoryIds = categoriesForPhrase(item.occurrence.phrase);
    snippetRows.push({
      id: `snippet-${era.id}-${index + 1}`,
      eraId: era.id,
      year: item.source.year,
      title: item.source.title,
      author: item.source.author,
      source: item.source.source,
      sourceUrl: item.source.sourceUrl,
      quote: item.occurrence.snippet,
      phrase: item.occurrence.phrase,
      evidenceType: evidenceTypeForSnippet(item.occurrence.phrase, categoryIds),
      rightsStatus: item.source.rightsStatus,
      categoryIds,
      note: item.occurrence.kind === "phrase" ? "Phrase-level evidence" : "Form occurrence evidence",
      inspectorId: `inspect-snippet-${era.id}-${index + 1}`,
    });
  }
}

const allSnippetRows = snippetRows.map((row) => ({ ...row, eraId: "all", id: `${row.id}-all`, inspectorId: `${row.inspectorId}-all` }));
snippetRows.push(...allSnippetRows);

for (const phrase of phraseRows) {
  phrase.relatedSnippetIds = snippetRows
    .filter((snippet) => snippet.eraId === phrase.eraId && snippet.phrase === phrase.phrase)
    .map((snippet) => snippet.id)
    .slice(0, 4);
}

for (const collocate of collocateRows) {
  const tokenPattern = new RegExp(`\\b${collocate.token}\\b`, "i");
  collocate.relatedSnippetIds = snippetRows
    .filter((snippet) => snippet.eraId === collocate.eraId && tokenPattern.test(snippet.quote))
    .map((snippet) => snippet.id)
    .slice(0, 4);
}

const categories = categoryDefs.map((category) => ({
  id: category.id,
  label: category.label,
  color: category.color,
  method: category.method,
  eraScores: eras.map((era) => {
    const phrases = phraseRows.filter((row) => row.eraId === era.id && row.categoryIds.includes(category.id));
    const collocates = collocateRows.filter((row) => row.eraId === era.id && row.categoryIds.includes(category.id));
    const snippets = snippetRows.filter((row) => row.eraId === era.id && row.categoryIds.includes(category.id));
    const rawScore =
      phrases.reduce((sum, row) => sum + row.count * 4, 0) +
      collocates.reduce((sum, row) => sum + row.count * 1.5, 0) +
      snippets.length * 3;
    return {
      eraId: era.id,
      score: Number(rawScore.toFixed(2)),
      phraseCount: phrases.reduce((sum, row) => sum + row.count, 0),
      collocateCount: collocates.reduce((sum, row) => sum + row.count, 0),
      snippetCount: snippets.length,
      supportingPhrases: phrases.map((row) => row.phrase),
      supportingCollocates: collocates.map((row) => row.token),
      inspectorId: `inspect-category-${category.id}-${era.id}`,
    };
  }),
}));

const flows: FlowRow[] = [];
for (const era of eras) {
  const familyTargets = ["forever", "for ever", "forevermore", "forever and ever"];
  for (const query of familyTargets) {
    const series = frequency.series.find((item) => item.query === query);
    if (!series) continue;
    const eraPoints = pointsForEra(series.points, era.id);
    const value = average(eraPoints.map((point) => point.frequencyPerMillion));
    flows.push({
      id: `flow-${slug(query)}-${era.id}`,
      source: slug(query),
      target: "forever-family",
      value: Number(value.toFixed(4)),
      eraId: era.id,
      color: series.color,
      relation: query === "forever and ever" ? "phrase-to-family" : "form-to-family",
      inspectorId: `inspect-flow-${slug(query)}-${era.id}`,
    });
  }
}

const atlasNodes: AtlasNodeRow[] = [];
const atlasEdges: AtlasEdgeRow[] = [];
const ledger: LedgerCellRow[] = [];

const contextualCoverageEras = new Set(["1700-1799", "1800-1849", "1850-1899", "1900-1949"]);

for (const era of eras) {
  const eraPhrases = phraseRows
    .filter((row) => row.eraId === era.id && row.displayEligible)
    .sort((a, b) => b.scoreValue - a.scoreValue || b.count - a.count)
    .slice(0, 6);
  const eraCollocates = collocateRows
    .filter((row) => row.eraId === era.id && row.displayEligible)
    .sort((a, b) => b.scoreValue - a.scoreValue || b.count - a.count)
    .slice(0, era.id === "all" ? 5 : 4);
  const eraFlows = flows.filter((flow) => flow.eraId === era.id);
  const eraCategories = categoryDefs
    .filter((category) => category.id !== "digital_permanence")
    .map((category) => ({
      category,
      score: categories
        .find((item) => item.id === category.id)
        ?.eraScores.find((score) => score.eraId === era.id),
    }));

  for (const flow of eraFlows) {
    atlasNodes.push({
      id: atlasFormNodeId(atlasFormLabel(flow.source), era.id),
      label: atlasFormLabel(flow.source),
      column: "form",
      eraId: era.id,
      color: flow.color,
      value: flow.value,
      evidenceCount: 1,
      scoreType: "mean Ngram frequency per million",
      scoreValue: flow.value,
      sourceCorpus: "Google Books Ngram",
      relatedSnippetIds: [],
      caveat:
        "Tracked form or phrase series from Google Books Ngram. This is contribution to an editorial grouping, not attestation.",
      inspectorId: `inspect-atlas-form-${slug(flow.source)}-${era.id}`,
    });
  }

  for (const phrase of eraPhrases) {
    atlasNodes.push({
      id: atlasPhraseNodeId(phrase.phrase, era.id),
      label: phrase.phrase,
      column: "phrase",
      eraId: era.id,
      color: "#050510",
      value: phrase.scoreValue,
      evidenceCount: phrase.jointCount,
      documentFrequency: phrase.documentFrequency,
      scoreType: phrase.scoreType,
      scoreValue: phrase.scoreValue,
      sourceCorpus: "Project Gutenberg",
      relatedSnippetIds: phrase.relatedSnippetIds,
      caveat: "Phrase evidence comes from the Project Gutenberg seed, not a balanced population corpus.",
      inspectorId: `inspect-atlas-phrase-${slug(phrase.phrase)}-${era.id}`,
    });
  }

  for (const { category, score } of eraCategories) {
    atlasNodes.push({
      id: atlasCategoryNodeId(category.label, era.id),
      label: category.label,
      column: "contextual_category",
      eraId: era.id,
      color: category.color,
      value: score?.score ?? 0,
      evidenceCount: (score?.phraseCount ?? 0) + (score?.collocateCount ?? 0) + (score?.snippetCount ?? 0),
      scoreType: "curated evidence-weighted heuristic",
      scoreValue: score?.score ?? 0,
      sourceCorpus: "Project Gutenberg",
      relatedSnippetIds: snippetRows
        .filter((snippet) => snippet.eraId === era.id && snippet.categoryIds.includes(category.id))
        .map((snippet) => snippet.id),
      caveat:
        category.id === "digital_permanence"
          ? "Future layer only."
          : "Curated contextual category, not automatic sense detection.",
      inspectorId: `inspect-atlas-category-${slug(category.id)}-${era.id}`,
    });
  }

  for (const collocate of eraCollocates) {
    atlasNodes.push({
      id: atlasCollocateNodeId(collocate.token, era.id),
      label: collocate.token,
      column: "collocate",
      eraId: era.id,
      color:
        categoryDefs.find((category) => category.id === collocate.categoryIds[0])?.color ??
        "#AE4202",
      value: collocate.scoreValue,
      evidenceCount: collocate.jointCount,
      documentFrequency: collocate.documentFrequency,
      scoreType: collocate.scoreType,
      scoreValue: collocate.scoreValue,
      sourceCorpus: "Project Gutenberg",
      relatedSnippetIds: collocate.relatedSnippetIds,
      caveat:
        "Collocates are secondary support marks. Generic neighboring words are filtered out of this atlas.",
      inspectorId: `inspect-atlas-collocate-${slug(collocate.token)}-${era.id}`,
    });
  }

  for (const phrase of eraPhrases) {
    const phraseNodeId = atlasPhraseNodeId(phrase.phrase, era.id);
    const formRelations = [
      phrase.phrase.includes("forever") ? atlasFormNodeId("forever", era.id) : null,
      phrase.phrase === "forever and ever" ? atlasFormNodeId("for ever", era.id) : null,
      phrase.phrase === "forever and ever" ? atlasFormNodeId("forever and ever", era.id) : null,
    ].filter(Boolean) as string[];

    for (const sourceId of formRelations) {
      atlasEdges.push({
        id: `atlas-edge-${slug(sourceId)}-${slug(phrase.phrase)}-${era.id}`,
        sourceId,
        targetId: phraseNodeId,
        relationType: "form_relation",
        value: phrase.scoreValue,
        eraId: era.id,
        evidenceCount: phrase.jointCount,
        scoreType: phrase.scoreType,
        scoreValue: phrase.scoreValue,
        dataLayer: "computed",
        relatedSnippetIds: phrase.relatedSnippetIds,
        caveat:
          "This relation connects a tracked form or series to a recurring phrase pattern in the current evidence set.",
        inspectorId: `inspect-atlas-edge-form-${slug(sourceId)}-${slug(phrase.phrase)}-${era.id}`,
      });
    }

    for (const categoryId of phrase.categoryIds) {
      const category = categoryDefs.find((item) => item.id === categoryId);
      if (!category) continue;
      atlasEdges.push({
        id: `atlas-edge-${slug(phrase.phrase)}-${categoryId}-${era.id}`,
        sourceId: phraseNodeId,
        targetId: atlasCategoryNodeId(category.label, era.id),
        relationType: "category_assignment",
        value: phrase.scoreValue,
        eraId: era.id,
        evidenceCount: phrase.jointCount,
        scoreType: phrase.scoreType,
        scoreValue: phrase.scoreValue,
        dataLayer: "curated",
        relatedSnippetIds: phrase.relatedSnippetIds,
        caveat:
          "This category assignment is curated from the available phrase, collocate, and snippet evidence.",
        inspectorId: `inspect-atlas-edge-category-${slug(phrase.phrase)}-${categoryId}-${era.id}`,
      });
    }
  }

  const eternityCategory = eraCategories.find((entry) => entry.category.id === "eternity_religion");
  if (eternityCategory) {
    atlasEdges.push({
      id: `atlas-edge-forevermore-eternity-${era.id}`,
      sourceId: atlasFormNodeId("forevermore", era.id),
      targetId: atlasCategoryNodeId(eternityCategory.category.label, era.id),
      relationType: "editorial_grouping",
      value: Math.max(0.1, eternityCategory.score?.score ?? 0),
      eraId: era.id,
      evidenceCount: 1,
      scoreType: "editorial grouping",
      scoreValue: eternityCategory.score?.score ?? 0,
      dataLayer: "interpretive",
      relatedSnippetIds: [],
      caveat:
        "This is an editorial grouping path used to place a tracked form near the strongest supported contextual family.",
      inspectorId: `inspect-atlas-edge-forevermore-eternity-${era.id}`,
    });
  }

  for (const collocate of eraCollocates) {
    for (const categoryId of collocate.categoryIds) {
      const category = categoryDefs.find((item) => item.id === categoryId);
      if (!category) continue;
      atlasEdges.push({
        id: `atlas-edge-${categoryId}-${slug(collocate.token)}-${era.id}`,
        sourceId: atlasCategoryNodeId(category.label, era.id),
        targetId: atlasCollocateNodeId(collocate.token, era.id),
        relationType: "collocate_support",
        value: collocate.scoreValue,
        eraId: era.id,
        evidenceCount: collocate.jointCount,
        scoreType: collocate.scoreType,
        scoreValue: collocate.scoreValue,
        dataLayer: "computed",
        relatedSnippetIds: collocate.relatedSnippetIds,
        caveat:
          "This collocate is shown as secondary support for a curated contextual category, not as a complete semantic account.",
        inspectorId: `inspect-atlas-edge-collocate-${categoryId}-${slug(collocate.token)}-${era.id}`,
      });
    }
  }
}

for (const category of categories) {
  for (const score of category.eraScores.filter((entry) => entry.eraId !== "all")) {
    const hasContextLayer = contextualCoverageEras.has(score.eraId);
    const coverageStatus =
      category.id === "digital_permanence"
        ? "future-layer"
        : hasContextLayer
          ? score.score >= 12
            ? "supported"
            : "weak"
          : "no-current-context-layer";
    const evidenceStrength =
      coverageStatus === "no-current-context-layer" || coverageStatus === "future-layer"
        ? "none"
        : score.score >= 20
          ? "strong"
          : score.score >= 8
            ? "moderate"
            : score.score > 0
              ? "weak"
              : "none";
    const confidence =
      coverageStatus === "future-layer" || coverageStatus === "no-current-context-layer"
        ? "unavailable"
        : score.phraseCount > 0 && score.snippetCount > 0
          ? "high"
          : score.score >= 8
            ? "medium"
            : "low";
    ledger.push({
      id: `ledger-${category.id}-${score.eraId}`,
      categoryId: category.id,
      eraId: score.eraId,
      evidenceStrength,
      phraseSupport: score.phraseCount,
      collocateSupport: score.collocateCount,
      snippetSupport: score.snippetCount,
      coverageStatus,
      confidence,
      scoreType: "curated evidence-weighted heuristic",
      scoreValue: score.score,
      sourceCorpus: "Project Gutenberg",
      relatedSnippetIds: snippetRows
        .filter((snippet) => snippet.eraId === score.eraId && snippet.categoryIds.includes(category.id))
        .map((snippet) => snippet.id),
      inspectorId: `inspect-ledger-${category.id}-${score.eraId}`,
    });
  }
}

function node(
  id: string,
  label: string,
  group: string,
  x: number,
  y: number,
  radius: number,
  color: string,
  eraId = "all",
  extra: Partial<NetworkNodeRow> = {},
): NetworkNodeRow {
  return { id, label, group, x, y, radius, color, eraId, inspectorId: `inspect-node-${id}-${eraId}`, ...extra };
}

const networkNodes: NetworkNodeRow[] = [
  node("forever", "forever", "word", 500, 310, 34, "#050510", "all"),
];
const networkEdges: NetworkEdgeRow[] = [];

for (const era of eras) {
  const phraseTop = phraseRows.filter((row) => row.eraId === era.id).sort((a, b) => b.count - a.count).slice(0, 6);
  const collocateTop = collocateRows.filter((row) => row.eraId === era.id).sort((a, b) => b.score - a.score).slice(0, 7);
  const categoryTop = categories
    .map((category) => ({ category, score: category.eraScores.find((score) => score.eraId === era.id)?.score ?? 0 }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const variantPositions = [
    ["forever-form", "forever", 500, 108, "#F06B04"],
    ["for-ever", "for ever", 245, 150, "#2C9FC7"],
    ["forevermore", "forevermore", 735, 150, "#FBB728"],
    ["forever-and-ever-series", "forever and ever", 835, 248, "#A1081F"],
  ] as const;
  for (const [id, label, x, y, color] of variantPositions) {
    networkNodes.push(node(`${id}-${era.id}`, label, "variant", x, y, 15, color, era.id));
    networkEdges.push({
      id: `edge-${id}-${era.id}`,
      source: "forever",
      target: `${id}-${era.id}`,
      weight: 0.36,
      relation: "variant relation from Ngram series",
      color,
      eraId: era.id,
      inspectorId: `inspect-edge-${id}-${era.id}`,
    });
  }

  phraseTop.forEach((phrase, index) => {
    const positions = [
      [230, 370],
      [350, 520],
      [640, 515],
      [760, 380],
      [720, 235],
      [282, 225],
    ];
    const [x, y] = positions[index] ?? [300 + index * 90, 500];
    const id = `phrase-${slug(phrase.phrase)}-${era.id}`;
    networkNodes.push(node(id, phrase.phrase, "phrase", x, y, 16 + Math.min(8, phrase.count), "#A1081F", era.id, { count: phrase.count }));
    networkEdges.push({
      id: `edge-${id}`,
      source: "forever",
      target: id,
      weight: Math.min(0.9, 0.22 + phrase.count / 12),
      relation: "phrase occurrence in Project Gutenberg seed texts",
      color: "#A1081F",
      eraId: era.id,
      inspectorId: `inspect-edge-${id}`,
    });
  });

  collocateTop.forEach((collocate, index) => {
    const positions = [
      [390, 100],
      [600, 112],
      [830, 285],
      [480, 585],
      [835, 135],
      [172, 245],
      [810, 475],
    ];
    const [x, y] = positions[index] ?? [180 + index * 80, 120];
    const id = `collocate-${slug(collocate.token)}-${era.id}`;
    const color = collocate.categoryIds[0]
      ? categoryDefs.find((category) => category.id === collocate.categoryIds[0])?.color ?? "#F06B04"
      : "#E87305";
    networkNodes.push(node(id, collocate.token, "collocate", x, y, 11 + Math.min(7, collocate.count), color, era.id, { count: collocate.count, score: collocate.score }));
    networkEdges.push({
      id: `edge-${id}`,
      source: "forever",
      target: id,
      weight: Math.min(0.85, 0.2 + collocate.score / 16),
      relation: "window collocate from Project Gutenberg seed texts",
      color,
      eraId: era.id,
      inspectorId: `inspect-edge-${id}`,
    });
  });

  categoryTop.forEach((item, index) => {
    const positions = [
      [125, 515],
      [895, 515],
      [120, 110],
      [895, 110],
      [910, 310],
    ];
    const [x, y] = positions[index] ?? [900, 280];
    const id = `category-${item.category.id}-${era.id}`;
    networkNodes.push(node(id, item.category.label, "contextual_category", x, y, 14, item.category.color, era.id, { score: item.score }));
    networkEdges.push({
      id: `edge-${id}`,
      source: "forever",
      target: id,
      weight: Math.min(0.75, 0.2 + item.score / 30),
      relation: "curated heuristic category summary",
      color: item.category.color,
      eraId: era.id,
      inspectorId: `inspect-edge-${id}`,
    });
  });
}

const inspectors: InspectorRow[] = [];
for (const series of frequency.series) {
  inspectors.push({
    id: series.inspectorId,
    title: `${series.label} frequency`,
    visualType: "Frequency Field",
    elementType: "Ngram line",
    period: `${series.startYear}-${series.endYear}`,
    dataLayer: "computed",
    selectionReason: "Displayed because this tracked form or phrase is part of the forever variant set.",
    evidenceCount: series.points.length,
    documentFrequency: undefined,
    scoreType: "Google Ngram yearly fraction",
    sourceCorpus: "Google Books Ngram",
    coverageRange: `${series.startYear}-${series.endYear}`,
    relatedSnippetIds: [],
    rawInputs: [
      { label: "Query", value: series.query },
      { label: "Corpus", value: series.corpus },
      { label: "Yearly points", value: series.points.length },
      { label: "First non-zero Ngram year", value: series.firstNonZeroYear ?? "none" },
    ],
    derivedValues: [
      { label: "Frequency per million", value: "Ngram yearly fraction x 1,000,000" },
      { label: "Smoothing", value: series.smoothing },
      { label: "Recommended visual start", value: series.recommendedVisualStartYear ?? series.startYear },
      { label: "Pre-1700 status", value: series.pre1700Status ?? "not assessed" },
    ],
    curatedDecisions: [
      { label: "Tracked form", value: "Included in the selected forever variant/phrase set" },
      { label: "Display scale", value: "Square-root y scale used only for legibility" },
    ],
    visualMapping: "X maps to publication year. Y maps to frequency per million with a square-root display scale for legibility. Colour maps to queried form or phrase.",
    explanation: "In this dataset, this line is a Google Books Ngram series converted to a per-million display value. It is not an attestation line and does not show the first time the form was used.",
    sources: [{ label: series.source, url: series.sourceUrl, dateRange: `${series.startYear}-${series.endYear}` }],
    caveats: [
      "Google Ngram is a large library sample, not a balanced corpus of all English.",
      "Only Ngrams above Google's display threshold appear.",
      series.coverageNote ?? "Early-year values can be noisy and should not be read as earliest attestation.",
    ],
  });
}

for (const phrase of phraseRows) {
  inspectors.push({
    id: phrase.inspectorId,
    title: phrase.phrase,
    visualType: "Phrase / Collocate Network",
    elementType: "Phrase node",
    period: phrase.eraId,
    dataLayer: "computed",
    selectionReason: phrase.displayReason,
    evidenceCount: phrase.count,
    documentFrequency: phrase.documentFrequency,
    scoreType: phrase.scoreType,
    scoreValue: phrase.scoreValue,
    sourceCorpus: "Project Gutenberg",
    coverageRange: `${gutenberg.sources[0]?.year ?? ""}-${gutenberg.sources.at(-1)?.year ?? ""}`,
    relatedSnippetIds: phrase.relatedSnippetIds,
    rawInputs: [
      { label: "Joint count", value: phrase.jointCount },
      { label: "Document frequency", value: phrase.documentFrequency },
      { label: "Sample titles", value: phrase.sampleTitles.join("; ") || "None" },
    ],
    derivedValues: [
      { label: "Score type", value: phrase.scoreType },
      { label: "Score value", value: phrase.scoreValue },
      { label: "Dispersion", value: phrase.dispersion },
    ],
    curatedDecisions: [
      { label: "Category mapping", value: phrase.categoryIds.join(", ") || "Uncategorized" },
      { label: "Display eligibility", value: phrase.displayEligible ? "Displayed" : "Hidden" },
    ],
    visualMapping: "Node size and edge weight increase with phrase count inside the selected era.",
    explanation: "In this dataset, this phrase is prioritized over loose collocates because phrase evidence is easier to read and verify in snippets.",
    sources: [{ label: "Project Gutenberg", url: gutenberg.source.url, rightsStatus: "Public domain in the USA" }],
    caveats: ["The Gutenberg seed is intentionally small and public-domain biased.", "Phrase absence here does not prove historical absence."],
  });
}

for (const collocate of collocateRows) {
  inspectors.push({
    id: collocate.inspectorId,
    title: collocate.token,
    visualType: "Phrase / Collocate Network",
    elementType: "Collocate node",
    period: collocate.eraId,
    dataLayer: "computed",
    selectionReason: collocate.displayReason,
    evidenceCount: collocate.count,
    documentFrequency: collocate.documentFrequency,
    scoreType: collocate.scoreType,
    scoreValue: collocate.scoreValue,
    sourceCorpus: "Project Gutenberg",
    coverageRange: `${gutenberg.sources[0]?.year ?? ""}-${gutenberg.sources.at(-1)?.year ?? ""}`,
    relatedSnippetIds: collocate.relatedSnippetIds,
    rawInputs: [
      { label: "Joint window count", value: collocate.jointCount },
      { label: "Window size", value: `±${collocate.windowSize} tokens` },
      { label: "Document frequency", value: collocate.documentFrequency },
    ],
    derivedValues: [
      { label: "Score type", value: collocate.scoreType },
      { label: "Score value", value: collocate.scoreValue },
      { label: "Dispersion", value: collocate.dispersion },
      { label: "Stopword filter", value: "Applied" },
    ],
    curatedDecisions: [
      { label: "Interpretive category", value: collocate.categoryIds.join(", ") },
      { label: "Display filter", value: "Requires category support plus count/document-frequency floor" },
    ],
    visualMapping: "Node size maps to count. Edge weight maps to the simple association score.",
    explanation: "This collocate occurs near forever or for ever and is shown only because it passes an interpretive-value filter. Generic words are kept out of the public network.",
    sources: [{ label: "Project Gutenberg", url: gutenberg.source.url, rightsStatus: "Public domain in the USA" }],
    caveats: ["This is a lightweight window collocate, not dependency parsing.", "OCR and edition choices may affect token context."],
  });
}

for (const snippet of snippetRows) {
  inspectors.push({
    id: snippet.inspectorId,
    title: `${snippet.year} / ${snippet.title}`,
    visualType: "Evidence Archive",
    elementType: "Evidence strip",
    period: snippet.eraId,
    dataLayer: "raw",
    selectionReason: "Selected as a compact, display-safe passage that anchors a visible form, phrase, or category mark.",
    evidenceCount: 1,
    documentFrequency: 1,
    scoreType: "none",
    sourceCorpus: snippet.source,
    coverageRange: String(snippet.year),
    relatedSnippetIds: [snippet.id],
    rawInputs: [
      { label: "Phrase/form", value: snippet.phrase },
      { label: "Title", value: snippet.title },
      { label: "Author", value: snippet.author },
      { label: "Year", value: snippet.year },
      { label: "Quote", value: snippet.quote },
    ],
    derivedValues: [
      { label: "Evidence type", value: snippet.evidenceType },
      { label: "Rights status", value: snippet.rightsStatus },
    ],
    curatedDecisions: [
      { label: "Selected form / phrase", value: snippet.phrase },
      { label: "Category support", value: snippet.categoryIds.join(", ") || "No category tag" },
      { label: "Why selected", value: snippet.note },
    ],
    visualMapping: "Strip position maps to year. Lane maps to evidence type. Strip length is used as a quote-length proxy for visual density, not a historical score.",
    explanation: "In this dataset, this public-domain snippet is a readable evidence anchor. It suggests a local use pattern, but it does not prove the word's full historical meaning.",
    sources: [{ label: "Project Gutenberg", url: snippet.sourceUrl, rightsStatus: snippet.rightsStatus }],
    caveats: ["Publication year is manually seeded for the source list.", "Snippet selection is illustrative, not exhaustive.", "This does not prove the word's full historical meaning."],
  });
}

for (const category of categories) {
  for (const score of category.eraScores) {
    inspectors.push({
      id: score.inspectorId,
      title: category.label,
      visualType: "Contextual Evidence Bands",
      elementType: "Curated contextual evidence band",
      period: score.eraId,
      dataLayer: "curated",
      selectionReason:
        category.id === "digital_permanence"
          ? "Future layer only: no real recent public corpus is connected in this dataset."
          : "Displayed as one of the active contextual evidence categories for forever.",
      evidenceCount: score.phraseCount + score.collocateCount + score.snippetCount,
      documentFrequency: score.snippetCount,
      scoreType: "curated evidence-weighted heuristic",
      scoreValue: score.score,
      sourceCorpus: "Project Gutenberg",
      coverageRange: `${gutenberg.sources[0]?.year ?? ""}-${gutenberg.sources.at(-1)?.year ?? ""}`,
      relatedSnippetIds: snippetRows
        .filter((snippet) => snippet.eraId === score.eraId && snippet.categoryIds.includes(category.id))
        .map((snippet) => snippet.id),
      rawInputs: [
        { label: "Phrase support", value: score.phraseCount, detail: score.supportingPhrases.join(", ") },
        { label: "Collocate support", value: score.collocateCount, detail: score.supportingCollocates.join(", ") },
        { label: "Snippet support", value: score.snippetCount },
      ],
      derivedValues: [{ label: "Heuristic evidence score", value: score.score }],
      curatedDecisions: [
        { label: "Category status", value: category.id === "digital_permanence" ? "Future / no current evidence" : "Active" },
        { label: "Scoring note", value: "Phrase hits, category collocates, and snippets are weighted for a compact public signal" },
      ],
      visualMapping: "Band thickness maps to the heuristic evidence score relative to other categories in the same era.",
      explanation: category.method,
      sources: [{ label: "Project Gutenberg", url: gutenberg.source.url, rightsStatus: "Public domain in the USA" }],
      caveats: ["These bands are curated contextual signals, not automatic sense classification.", "Digital permanence is not supported by this Gutenberg seed.", "This does not prove the word's full historical meaning."],
    });
  }
}

for (const flow of flows) {
  inspectors.push({
    id: flow.inspectorId,
    title: `${flow.source} -> forever family`,
    visualType: "Variant Flow Map",
    elementType: "Flow ribbon",
    period: flow.eraId,
    dataLayer: "computed",
    selectionReason: "Displayed to compare selected variants and phrase forms in an editorial family view.",
    evidenceCount: 1,
    scoreType: "mean Ngram frequency per million",
    scoreValue: flow.value,
    sourceCorpus: "Google Books Ngram",
    coverageRange: `${frequency.source.startYear}-${frequency.source.endYear}`,
    relatedSnippetIds: [],
    rawInputs: [
      { label: "Source form", value: flow.source },
      { label: "Target group", value: flow.target },
    ],
    derivedValues: [{ label: "Mean Ngram frequency per million", value: flow.value }],
    curatedDecisions: [
      { label: "Grouping", value: "Editorial family grouping" },
      { label: "Not modeled", value: "No direct historical transformation is inferred" },
    ],
    visualMapping: "Ribbon width maps to mean Ngram frequency per million in the selected era.",
    explanation: "This form aggregation diagram uses real Ngram series to compare how much each form contributes to an editorial family grouping.",
    sources: [{ label: "Google Books Ngram Viewer", url: frequency.source.url, dateRange: `${frequency.source.startYear}-${frequency.source.endYear}` }],
    caveats: ["This is an aggregation diagram, not a historical transition model.", "Values are mean frequencies in the era, not raw book counts."],
  });
}

for (const atlasNode of atlasNodes) {
  inspectors.push({
    id: atlasNode.inspectorId,
    title: atlasNode.label,
    visualType: "Form-Phrase-Context Atlas",
    elementType:
      atlasNode.column === "form"
        ? "Form node"
        : atlasNode.column === "phrase"
          ? "Phrase node"
          : atlasNode.column === "contextual_category"
            ? "Contextual category node"
            : "Supporting collocate node",
    period: atlasNode.eraId,
    dataLayer:
      atlasNode.column === "contextual_category"
        ? "curated"
        : atlasNode.column === "collocate"
          ? "computed"
          : atlasNode.column === "phrase"
            ? "computed"
            : "computed",
    selectionReason:
      atlasNode.column === "collocate"
        ? "Displayed only if the collocate passed the interpretive-value filter and supports a visible contextual grouping."
        : atlasNode.column === "contextual_category"
          ? "Displayed as a curated contextual grouping built from phrase, collocate, and snippet evidence."
          : "Displayed as part of the relational atlas for the selected forever evidence set.",
    evidenceCount: atlasNode.evidenceCount,
    documentFrequency: atlasNode.documentFrequency,
    scoreType: atlasNode.scoreType,
    scoreValue: atlasNode.scoreValue,
    sourceCorpus: atlasNode.sourceCorpus,
    coverageRange:
      atlasNode.sourceCorpus === "Google Books Ngram"
        ? `${frequency.source.startYear}-${frequency.source.endYear}`
        : `${gutenberg.sources[0]?.year ?? ""}-${gutenberg.sources.at(-1)?.year ?? ""}`,
    relatedSnippetIds: atlasNode.relatedSnippetIds,
    rawInputs: [
      { label: "Node label", value: atlasNode.label },
      { label: "Node column", value: atlasNode.column.replaceAll("_", " ") },
      { label: "Evidence count", value: atlasNode.evidenceCount },
    ],
    derivedValues: [
      { label: "Score type", value: atlasNode.scoreType ?? "none" },
      { label: "Score value", value: atlasNode.scoreValue ?? "n/a" },
      ...(atlasNode.documentFrequency !== undefined
        ? [{ label: "Document frequency", value: atlasNode.documentFrequency }]
        : []),
    ],
    curatedDecisions: [
      {
        label: "Display role",
        value:
          atlasNode.column === "collocate"
            ? "Secondary support"
            : atlasNode.column === "contextual_category"
              ? "Curated category anchor"
              : atlasNode.column === "phrase"
                ? "Primary phrase evidence"
                : "Tracked form or phrase series",
      },
      {
        label: "Selection reason",
        value:
          atlasNode.column === "phrase"
            ? "Phrase evidence is prioritized over loose neighboring words."
            : atlasNode.column === "collocate"
              ? "Only filtered collocates with category support are shown."
              : atlasNode.column === "contextual_category"
                ? "This is a curated grouping, not automatic sense detection."
                : "Tracked in the editorial family view.",
      },
    ],
    visualMapping:
      "Column position maps to evidence role. Mark size maps to evidence count or score. Colour maps to form, category, or supporting evidence type.",
    explanation:
      atlasNode.column === "contextual_category"
        ? "This category is curated from phrase, collocate, and snippet evidence. It does not prove the word's full historical meaning."
        : atlasNode.column === "phrase"
          ? "This phrase is a readable evidence unit in the current dataset, positioned between tracked forms and curated contextual groupings."
          : atlasNode.column === "collocate"
            ? "This collocate is shown as a supporting contextual mark, not as a standalone semantic claim."
            : "This tracked form or phrase series anchors one side of the relational atlas. It helps connect long-run frequency evidence to readable contextual patterns.",
    sources: [
      atlasNode.sourceCorpus === "Google Books Ngram"
        ? {
            label: "Google Books Ngram Viewer",
            url: frequency.source.url,
            dateRange: `${frequency.source.startYear}-${frequency.source.endYear}`,
          }
        : {
            label: "Project Gutenberg",
            url: gutenberg.source.url,
            rightsStatus: "Public domain in the USA",
          },
    ],
    caveats: [atlasNode.caveat],
  });
}

for (const atlasEdge of atlasEdges) {
  inspectors.push({
    id: atlasEdge.inspectorId,
    title: atlasEdge.relationType.replaceAll("_", " "),
    visualType: "Form-Phrase-Context Atlas",
    elementType: "Relational path",
    period: atlasEdge.eraId,
    dataLayer: atlasEdge.dataLayer,
    selectionReason:
      atlasEdge.relationType === "form_relation"
        ? "Displayed to connect a tracked form or series to a supported phrase pattern."
        : atlasEdge.relationType === "category_assignment"
          ? "Displayed to show a curated contextual grouping supported by phrase evidence."
          : atlasEdge.relationType === "collocate_support"
            ? "Displayed as secondary support from a filtered collocate."
            : "Displayed as an editorial grouping path in the atlas.",
    evidenceCount: atlasEdge.evidenceCount,
    documentFrequency: undefined,
    scoreType: atlasEdge.scoreType,
    scoreValue: atlasEdge.scoreValue,
    sourceCorpus:
      atlasEdge.relationType === "form_relation" && atlasEdge.dataLayer === "computed"
        ? "Google Books Ngram / Project Gutenberg"
        : "Project Gutenberg",
    coverageRange:
      atlasEdge.relationType === "form_relation"
        ? `${frequency.source.startYear}-${frequency.source.endYear} / ${gutenberg.sources[0]?.year ?? ""}-${gutenberg.sources.at(-1)?.year ?? ""}`
        : `${gutenberg.sources[0]?.year ?? ""}-${gutenberg.sources.at(-1)?.year ?? ""}`,
    relatedSnippetIds: atlasEdge.relatedSnippetIds,
    rawInputs: [
      { label: "Source id", value: atlasEdge.sourceId },
      { label: "Target id", value: atlasEdge.targetId },
      { label: "Relation type", value: atlasEdge.relationType.replaceAll("_", " ") },
    ],
    derivedValues: [
      { label: "Score type", value: atlasEdge.scoreType ?? "none" },
      { label: "Score value", value: atlasEdge.scoreValue ?? "n/a" },
      { label: "Evidence count", value: atlasEdge.evidenceCount },
    ],
    curatedDecisions: [
      { label: "Data layer", value: atlasEdge.dataLayer },
      {
        label: "Atlas role",
        value:
          atlasEdge.relationType === "collocate_support"
            ? "Secondary support path"
            : atlasEdge.relationType === "category_assignment"
              ? "Curated category link"
              : atlasEdge.relationType === "editorial_grouping"
                ? "Editorial grouping"
                : "Form or phrase relation",
      },
    ],
    visualMapping:
      "Path width maps to relation strength or score. Path style distinguishes form relation, category assignment, collocate support, and editorial grouping.",
    explanation:
      atlasEdge.relationType === "category_assignment"
        ? "This relation connects a recurring phrase pattern to a curated contextual grouping in the current evidence set."
        : atlasEdge.relationType === "collocate_support"
          ? "This relation shows how a filtered collocate supports a visible contextual grouping."
          : atlasEdge.relationType === "editorial_grouping"
            ? "This is an editorial grouping path used to place a tracked form near the strongest supported contextual family."
            : "This relation connects a tracked form or series to a recurring phrase pattern in the current evidence set.",
    sources: [
      {
        label:
          atlasEdge.relationType === "form_relation"
            ? "Google Books Ngram / Project Gutenberg"
            : "Project Gutenberg",
        url:
          atlasEdge.relationType === "form_relation"
            ? frequency.source.url
            : gutenberg.source.url,
      },
    ],
    caveats: [atlasEdge.caveat],
  });
}

for (const cell of ledger) {
  const category = categoryDefs.find((item) => item.id === cell.categoryId);
  const totalSupport = cell.phraseSupport + cell.collocateSupport + cell.snippetSupport;
  inspectors.push({
    id: cell.inspectorId,
    title: `${category?.label ?? cell.categoryId} / ${cell.eraId}`,
    visualType: "Context Signal Field",
    elementType: "Signal cell",
    period: cell.eraId,
    dataLayer:
      cell.coverageStatus === "future-layer"
        ? "interpretive"
        : cell.coverageStatus === "no-current-context-layer"
          ? "curated"
          : "curated",
    selectionReason:
      cell.coverageStatus === "supported"
        ? "Displayed as an era-binned contextual evidence summary with current support."
        : cell.coverageStatus === "weak" && totalSupport > 0
          ? "Displayed with a weak-evidence state because support exists but remains thin."
          : cell.coverageStatus === "weak"
            ? "Displayed with a low-signal state because the current seed has comparable coverage here but no surfaced support for this category."
          : cell.coverageStatus === "future-layer"
            ? "Displayed to mark a future contextual layer that is not implemented in the current dataset."
            : "Displayed to mark an era with no comparable contextual coverage in the current public-domain seed.",
    evidenceCount: totalSupport,
    documentFrequency: cell.snippetSupport,
    scoreType: cell.scoreType,
    scoreValue: cell.scoreValue,
    sourceCorpus: cell.sourceCorpus,
    coverageRange: `${gutenberg.sources[0]?.year ?? ""}-${gutenberg.sources.at(-1)?.year ?? ""}`,
    relatedSnippetIds: cell.relatedSnippetIds,
    rawInputs: [
      { label: "Phrase support", value: cell.phraseSupport },
      { label: "Collocate support", value: cell.collocateSupport },
      { label: "Snippet support", value: cell.snippetSupport },
    ],
    derivedValues: [
      { label: "Evidence strength", value: cell.evidenceStrength },
      { label: "Coverage status", value: cell.coverageStatus },
      { label: "Confidence", value: cell.confidence },
      { label: "Score value", value: cell.scoreValue },
    ],
    curatedDecisions: [
      {
        label: "Category method",
        value: category?.method ?? "Curated heuristic",
      },
      {
        label: "Interpretation guardrail",
        value:
          cell.coverageStatus === "no-current-context-layer"
            ? "Blank or hatched states indicate no comparable context layer, not absence of use."
            : "These cells summarize contextual signals, not automatic sense classification.",
      },
    ],
    visualMapping:
      "Cell fill and texture map to evidence strength and coverage status. Stronger support is darker; hatched or muted cells mark unavailable or future layers.",
    explanation:
      cell.coverageStatus === "future-layer"
        ? "This row is reserved for a future contextual layer. No comparable recent corpus is connected in the current dataset."
        : cell.coverageStatus === "no-current-context-layer"
          ? "No comparable contextual data is currently available for this era in the Project Gutenberg seed."
          : cell.coverageStatus === "weak" && totalSupport === 0
            ? "Comparable context coverage exists for this era in the current seed, but no phrase, collocate, or snippet support surfaced for this category."
          : "These cells summarize phrase, collocate, and snippet evidence. They are curated contextual signals, not automatic sense classification.",
    sources: [{ label: "Project Gutenberg", url: gutenberg.source.url, rightsStatus: "Public domain in the USA" }],
    caveats: [
      cell.coverageStatus === "no-current-context-layer"
        ? "Blank or hatched cells indicate no comparable contextual layer yet, not absence of the usage in history."
        : cell.coverageStatus === "future-layer"
          ? "Recent contextual layer not implemented. Requires a separate modern corpus."
          : "Context scores here are heuristic and evidence-weighted.",
    ],
  });
}

for (const graphNode of networkNodes) {
  if (inspectors.some((entry) => entry.id === graphNode.inspectorId)) continue;
  const matchingPhrase =
    graphNode.group === "phrase"
      ? phraseRows.find((row) => row.eraId === graphNode.eraId && row.phrase === graphNode.label)
      : undefined;
  const matchingCollocate =
    graphNode.group === "collocate"
      ? collocateRows.find((row) => row.eraId === graphNode.eraId && row.token === graphNode.label)
      : undefined;
  const matchingCategory =
    graphNode.group === "contextual_category"
      ? categories.find((category) => category.label === graphNode.label)
      : undefined;
  const categoryEraScore =
    matchingCategory?.eraScores.find((score) => score.eraId === graphNode.eraId);
  const variantSnippetIds =
    graphNode.group === "variant"
      ? snippetRows
          .filter((snippet) => snippet.eraId === graphNode.eraId && snippet.phrase === graphNode.label)
          .map((snippet) => snippet.id)
      : [];
  const wordSnippetIds =
    graphNode.group === "word"
      ? snippetRows
          .filter((snippet) => snippet.eraId === graphNode.eraId || graphNode.eraId === "all")
          .map((snippet) => snippet.id)
          .slice(0, 8)
      : [];
  const relatedSnippetIds =
    matchingPhrase?.relatedSnippetIds ??
    matchingCollocate?.relatedSnippetIds ??
    (matchingCategory && graphNode.eraId !== "all"
      ? snippetRows
          .filter((snippet) => snippet.eraId === graphNode.eraId && snippet.categoryIds.includes(matchingCategory.id))
          .map((snippet) => snippet.id)
      : graphNode.eraId === "all" && matchingCategory
        ? snippetRows.filter((snippet) => snippet.categoryIds.includes(matchingCategory.id)).map((snippet) => snippet.id).slice(0, 8)
        : graphNode.group === "variant"
          ? variantSnippetIds
          : wordSnippetIds);
  inspectors.push({
    id: graphNode.inspectorId,
    title: graphNode.label,
    visualType: "Relational Constellation",
    elementType: `${graphNode.group} node`,
    period: graphNode.eraId,
    dataLayer: graphNode.group === "contextual_category" ? "curated" : graphNode.group === "word" ? "curated" : "computed",
    selectionReason:
      graphNode.group === "collocate"
        ? "Displayed only if the collocate passed the interpretive-value filter."
        : graphNode.group === "phrase"
          ? "Displayed because phrase evidence is prioritized over looser neighboring-word links."
        : "Displayed as part of the fixed editorial relationship map.",
    evidenceCount:
      matchingPhrase?.jointCount ??
      matchingCollocate?.jointCount ??
      (categoryEraScore
        ? categoryEraScore.phraseCount + categoryEraScore.collocateCount + categoryEraScore.snippetCount
        : graphNode.count ?? 1),
    documentFrequency:
      matchingPhrase?.documentFrequency ??
      matchingCollocate?.documentFrequency ??
      categoryEraScore?.snippetCount,
    scoreType:
      matchingPhrase?.scoreType ??
      matchingCollocate?.scoreType ??
      (categoryEraScore ? "curated evidence-weighted heuristic" : graphNode.score ? "network/source score" : "none"),
    scoreValue:
      matchingPhrase?.scoreValue ??
      matchingCollocate?.scoreValue ??
      (categoryEraScore?.score ?? graphNode.score),
    sourceCorpus:
      graphNode.group === "variant"
        ? "Google Books Ngram"
        : graphNode.group === "word"
          ? "Google Books Ngram / Project Gutenberg"
          : "Project Gutenberg",
    coverageRange: `${frequency.source.startYear}-${frequency.source.endYear}`,
    relatedSnippetIds,
    rawInputs: [
      { label: "Node group", value: graphNode.group },
      { label: "Count", value: matchingPhrase?.jointCount ?? matchingCollocate?.jointCount ?? graphNode.count ?? "n/a" },
      { label: "Score", value: matchingPhrase?.scoreValue ?? matchingCollocate?.scoreValue ?? categoryEraScore?.score ?? graphNode.score ?? "n/a" },
    ],
    derivedValues: [
      { label: "Fixed layout", value: "Editorial node position" },
      ...(matchingPhrase ? [{ label: "Document frequency", value: matchingPhrase.documentFrequency }] : []),
      ...(matchingCollocate ? [{ label: "Document frequency", value: matchingCollocate.documentFrequency }] : []),
    ],
    curatedDecisions: [
      { label: "Node role", value: graphNode.group },
      { label: "Layout", value: "Fixed editorial placement, not force-directed geometry" },
    ],
    visualMapping: "Position is manually fixed for readability; colour maps to node group or category.",
    explanation:
      graphNode.group === "contextual_category"
        ? "This node is a curated contextual anchor. It summarizes evidence from phrases, collocates, and snippets rather than proving a discrete historical sense."
        : graphNode.group === "phrase"
          ? "This phrase node represents a readable recurrent pattern in the current evidence set."
          : graphNode.group === "collocate"
            ? "This collocate node is secondary support only. Generic neighboring words are filtered out of the public view."
            : "This node represents one readable unit in the relationship map. In this dataset, geometry supports inspection rather than making a statistical claim.",
    sources: [
      graphNode.group === "variant"
        ? { label: "Google Books Ngram Viewer", url: frequency.source.url, dateRange: `${frequency.source.startYear}-${frequency.source.endYear}` }
        : { label: "Project Gutenberg", url: gutenberg.source.url, rightsStatus: "Public domain in the USA" },
    ],
    caveats: [
      "The layout is editorial, not a force simulation.",
      ...(graphNode.group === "variant" ? ["Variant position does not imply historical transformation."] : []),
    ],
  });
}

for (const graphEdge of networkEdges) {
  if (inspectors.some((entry) => entry.id === graphEdge.inspectorId)) continue;
  const targetNode = networkNodes.find((node) => node.id === graphEdge.target);
  const sourceNode = networkNodes.find((node) => node.id === graphEdge.source);
  const targetPhrase =
    targetNode?.group === "phrase"
      ? phraseRows.find((row) => row.eraId === targetNode.eraId && row.phrase === targetNode.label)
      : undefined;
  const targetCollocate =
    targetNode?.group === "collocate"
      ? collocateRows.find((row) => row.eraId === targetNode.eraId && row.token === targetNode.label)
      : undefined;
  const targetCategory =
    targetNode?.group === "contextual_category"
      ? categories.find((category) => category.label === targetNode.label)
      : undefined;
  const relatedSnippetIds =
    targetPhrase?.relatedSnippetIds ??
    targetCollocate?.relatedSnippetIds ??
    (targetCategory && targetNode
      ? snippetRows
          .filter((snippet) => snippet.eraId === targetNode.eraId && snippet.categoryIds.includes(targetCategory.id))
          .map((snippet) => snippet.id)
      : []);
  inspectors.push({
    id: graphEdge.inspectorId,
    title: graphEdge.relation,
    visualType: "Relational Constellation",
    elementType: "Network edge",
    period: graphEdge.eraId,
    dataLayer: "computed",
    selectionReason: "Displayed because both connected nodes are visible in the selected era.",
    evidenceCount: 1,
    scoreType: targetPhrase?.scoreType ?? targetCollocate?.scoreType ?? "network edge weight",
    scoreValue: targetPhrase?.scoreValue ?? targetCollocate?.scoreValue ?? graphEdge.weight,
    sourceCorpus:
      targetNode?.group === "variant" ? "Google Books Ngram" : "Project Gutenberg",
    coverageRange: `${frequency.source.startYear}-${frequency.source.endYear}`,
    relatedSnippetIds,
    rawInputs: [
      { label: "Source node", value: sourceNode?.label ?? graphEdge.source },
      { label: "Target node", value: targetNode?.label ?? graphEdge.target },
      { label: "Relation", value: graphEdge.relation },
    ],
    derivedValues: [
      { label: "Edge weight", value: graphEdge.weight },
      ...(targetPhrase ? [{ label: "Phrase count", value: targetPhrase.jointCount }] : []),
      ...(targetCollocate ? [{ label: "Collocate count", value: targetCollocate.jointCount }] : []),
    ],
    curatedDecisions: [
      { label: "Network role", value: "Readable relationship edge" },
      { label: "Layout caveat", value: "Edge routing is visual composition, not a force model" },
    ],
    visualMapping: "Edge stroke width maps to the generated relationship weight for the selected era.",
    explanation: "This edge links the center word to a variant, phrase, collocate, or category node in the fixed editorial network.",
    sources: [
      targetNode?.group === "variant"
        ? { label: "Google Books Ngram Viewer", url: frequency.source.url, dateRange: `${frequency.source.startYear}-${frequency.source.endYear}` }
        : { label: "Project Gutenberg", url: gutenberg.source.url, rightsStatus: "Public domain in the USA" },
    ],
    caveats: ["The network is an inspectable reading aid, not a complete statistical model."],
  });
}

const dataset = {
  generatedAt: new Date().toISOString(),
  coverage: {
    ngramStartYear: frequency.source.startYear,
    ngramEndYear: frequency.source.endYear,
    ngramPublicVisualDefaultStartYear: 1700,
    ngramPre1700Available: frequency.source.startYear < 1700,
    gutenbergStartYear: Math.min(...gutenberg.sources.map((source) => source.year)),
    gutenbergEndYear: Math.max(...gutenberg.sources.map((source) => source.year)),
    prehistoryEarliestApproximateYear: prehistory?.coverage.earliestApproximateYear ?? null,
    prehistoryComparableCorpusAvailable: prehistory?.coverage.comparableCorpusAvailable ?? false,
    modernContextStartYear: modernContext?.coverage.startYear ?? null,
    modernContextEndYear: modernContext?.coverage.endYear ?? null,
    modernContextComparableToHistoricalCorpus:
      modernContext?.coverage.comparableToHistoricalCorpus ?? false,
    recentImplemented: Boolean(modernContext?.snippets.length),
  },
  sourceLayers: [
    {
      id: "attestation-prehistory",
      source: "lexical sources / source audit",
      coverage:
        prehistory == null
          ? "not generated"
          : `${prehistory.coverage.earliestApproximateYear}-${prehistory.coverage.latestApproximateYear}`,
      role: "earliest-use and pre-1700 feasibility notes",
      comparable: false,
    },
    {
      id: "long-span-frequency",
      source: "Google Books Ngram",
      coverage: `${frequency.source.startYear}-${frequency.source.endYear}`,
      role: "yearly frequency series",
      comparable: true,
    },
    {
      id: "archival-context",
      source: "Project Gutenberg seed",
      coverage: `${Math.min(...gutenberg.sources.map((source) => source.year))}-${Math.max(...gutenberg.sources.map((source) => source.year))}`,
      role: "public-domain snippets, phrases, and lightweight collocates",
      comparable: false,
    },
    {
      id: "modern-context",
      source: modernContext?.source.label ?? "not generated",
      coverage:
        modernContext?.coverage.startYear == null
          ? "not available"
          : `${modernContext.coverage.startYear}-${modernContext.coverage.endYear}`,
      role: "open modern context snapshot",
      comparable: modernContext?.coverage.comparableToHistoricalCorpus ?? false,
    },
  ],
  eras,
  frequency: frequency.series,
  prehistory,
  modernContext,
  phrases: phraseRows,
  collocates: collocateRows,
  snippets: snippetRows,
  categories,
  flows,
  atlas: {
    nodes: atlasNodes,
    edges: atlasEdges,
  },
  ledger,
  network: {
    nodes: networkNodes,
    edges: networkEdges,
  },
  inspectors,
};

await mkdir(OUT_DIR, { recursive: true });
await writeFile(path.join(OUT_DIR, "forever_phrases.json"), `${JSON.stringify(phraseRows, null, 2)}\n`);
await writeFile(path.join(OUT_DIR, "forever_collocates.json"), `${JSON.stringify(collocateRows, null, 2)}\n`);
await writeFile(path.join(OUT_DIR, "forever_snippets.json"), `${JSON.stringify(snippetRows, null, 2)}\n`);
await writeFile(path.join(OUT_DIR, "forever_categories.json"), `${JSON.stringify(categories, null, 2)}\n`);
await writeFile(path.join(OUT_DIR, "forever_atlas.json"), `${JSON.stringify({ nodes: atlasNodes, edges: atlasEdges }, null, 2)}\n`);
await writeFile(path.join(OUT_DIR, "forever_ledger.json"), `${JSON.stringify(ledger, null, 2)}\n`);
await writeFile(path.join(OUT_DIR, "forever_dataset.json"), `${JSON.stringify(dataset, null, 2)}\n`);

console.log(`Wrote generated forever dataset files to ${OUT_DIR}`);
