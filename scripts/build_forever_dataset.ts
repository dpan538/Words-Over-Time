import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = path.join(process.cwd(), "src", "data", "generated");

const eras = [
  { id: "all", label: "All", startYear: null, endYear: null, note: "All available real-data coverage." },
  { id: "1700-1799", label: "1700-1799", startYear: 1700, endYear: 1799, note: "Sparse Gutenberg seed coverage; Ngram coverage is available." },
  { id: "1800-1849", label: "1800-1849", startYear: 1800, endYear: 1849, note: "Gutenberg seed texts and Ngram coverage." },
  { id: "1850-1899", label: "1850-1899", startYear: 1850, endYear: 1899, note: "Strongest Gutenberg seed coverage in this prototype." },
  { id: "1900-1949", label: "1900-1949", startYear: 1900, endYear: 1949, note: "Limited public-domain seed texts in this prototype." },
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
    inspectorId: string;
    points: Array<{ year: number; value: number; frequencyPerMillion: number }>;
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

const frequency = JSON.parse(
  await readFile(path.join(OUT_DIR, "forever_frequency.json"), "utf8"),
) as FrequencyFile;
const gutenberg = JSON.parse(
  await readFile(path.join(OUT_DIR, "forever_gutenberg_sources.json"), "utf8"),
) as GutenbergFile;

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
  const phraseTop = phraseRows.filter((row) => row.eraId === era.id).sort((a, b) => b.count - a.count).slice(0, 5);
  const collocateTop = collocateRows.filter((row) => row.eraId === era.id).sort((a, b) => b.score - a.score).slice(0, 7);
  const categoryTop = categories
    .map((category) => ({ category, score: category.eraScores.find((score) => score.eraId === era.id)?.score ?? 0 }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  const variantPositions = [
    ["forever-form", "forever", 500, 108, "#F06B04"],
    ["for-ever", "for ever", 245, 150, "#2C9FC7"],
    ["forevermore", "forevermore", 735, 150, "#FBB728"],
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
    visualType: "Main Frequency Timeline",
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
    ],
    derivedValues: [
      { label: "Frequency per million", value: "Ngram yearly fraction x 1,000,000" },
      { label: "Smoothing", value: series.smoothing },
    ],
    curatedDecisions: [
      { label: "Tracked form", value: "Included in the selected forever variant/phrase set" },
      { label: "Display scale", value: "Square-root y scale used only for legibility" },
    ],
    visualMapping: "X maps to publication year. Y maps to frequency per million with a square-root display scale for legibility. Colour maps to queried form or phrase.",
    explanation: "In this dataset, this line is a Google Books Ngram series converted to a per-million display value. It is not an attestation line and does not show the first time the form was used.",
    sources: [{ label: series.source, url: series.sourceUrl, dateRange: `${series.startYear}-${series.endYear}` }],
    caveats: ["Google Ngram is a large library sample, not a balanced corpus of all English.", "Only Ngrams above Google's display threshold appear.", "Early-year values can be noisy and should not be read as earliest attestation."],
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
    visualType: "Evidence Spine",
    elementType: "Evidence node",
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
    visualMapping: "The node position maps to year. Colour maps to evidence type. The label shows the selected form or phrase.",
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

for (const graphNode of networkNodes) {
  if (inspectors.some((entry) => entry.id === graphNode.inspectorId)) continue;
  inspectors.push({
    id: graphNode.inspectorId,
    title: graphNode.label,
    visualType: "Phrase / Collocate Network",
    elementType: `${graphNode.group} node`,
    period: graphNode.eraId,
    dataLayer: graphNode.group === "contextual_category" ? "curated" : graphNode.group === "word" ? "curated" : "computed",
    selectionReason:
      graphNode.group === "collocate"
        ? "Displayed only if the collocate passed the interpretive-value filter."
        : "Displayed as part of the fixed editorial relationship map.",
    evidenceCount: graphNode.count ?? 1,
    documentFrequency: graphNode.count ? 1 : undefined,
    scoreType: graphNode.score ? "network/source score" : "none",
    scoreValue: graphNode.score,
    sourceCorpus: "Google Ngram / Project Gutenberg",
    coverageRange: `${frequency.source.startYear}-${frequency.source.endYear}`,
    relatedSnippetIds: [],
    rawInputs: [
      { label: "Node group", value: graphNode.group },
      { label: "Count", value: graphNode.count ?? "n/a" },
      { label: "Score", value: graphNode.score ?? "n/a" },
    ],
    derivedValues: [{ label: "Fixed layout", value: "Editorial node position" }],
    curatedDecisions: [
      { label: "Node role", value: graphNode.group },
      { label: "Layout", value: "Fixed editorial placement, not force-directed geometry" },
    ],
    visualMapping: "Position is manually fixed for readability; colour maps to node group or category.",
    explanation: "This node represents one readable unit in the relationship map. In this dataset, geometry supports inspection rather than making a statistical claim.",
    sources: [{ label: "Google Ngram / Project Gutenberg", url: "https://www.gutenberg.org/" }],
    caveats: ["The layout is editorial, not a force simulation."],
  });
}

for (const graphEdge of networkEdges) {
  if (inspectors.some((entry) => entry.id === graphEdge.inspectorId)) continue;
  inspectors.push({
    id: graphEdge.inspectorId,
    title: graphEdge.relation,
    visualType: "Phrase / Collocate Network",
    elementType: "Network edge",
    period: graphEdge.eraId,
    dataLayer: "computed",
    selectionReason: "Displayed because both connected nodes are visible in the selected era.",
    evidenceCount: 1,
    scoreType: "network edge weight",
    scoreValue: graphEdge.weight,
    sourceCorpus: "Google Ngram / Project Gutenberg",
    coverageRange: `${frequency.source.startYear}-${frequency.source.endYear}`,
    relatedSnippetIds: [],
    rawInputs: [
      { label: "Source node", value: graphEdge.source },
      { label: "Target node", value: graphEdge.target },
      { label: "Relation", value: graphEdge.relation },
    ],
    derivedValues: [{ label: "Edge weight", value: graphEdge.weight }],
    curatedDecisions: [
      { label: "Network role", value: "Readable relationship edge" },
      { label: "Layout caveat", value: "Edge routing is visual composition, not a force model" },
    ],
    visualMapping: "Edge stroke width maps to the generated relationship weight for the selected era.",
    explanation: "This edge links the center word to a variant, phrase, collocate, or category node in the fixed editorial network.",
    sources: [{ label: "Google Ngram / Project Gutenberg", url: "https://www.gutenberg.org/" }],
    caveats: ["The network is an inspectable reading aid, not a complete statistical model."],
  });
}

const dataset = {
  generatedAt: new Date().toISOString(),
  coverage: {
    ngramStartYear: frequency.source.startYear,
    ngramEndYear: frequency.source.endYear,
    gutenbergStartYear: Math.min(...gutenberg.sources.map((source) => source.year)),
    gutenbergEndYear: Math.max(...gutenberg.sources.map((source) => source.year)),
    recentImplemented: false,
  },
  eras,
  frequency: frequency.series,
  phrases: phraseRows,
  collocates: collocateRows,
  snippets: snippetRows,
  categories,
  flows,
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
await writeFile(path.join(OUT_DIR, "forever_dataset.json"), `${JSON.stringify(dataset, null, 2)}\n`);

console.log(`Wrote generated forever dataset files to ${OUT_DIR}`);
