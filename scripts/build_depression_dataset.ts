import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = path.join(process.cwd(), "src", "data", "generated");
const CATEGORIES_FILE = path.join(OUT_DIR, "depression_categories.json");
const DATASET_FILE = path.join(OUT_DIR, "depression_dataset.json");

const categoryDefs = [
  {
    id: "emotional_state",
    label: "Emotional state",
    color: "#F06B04",
    senseBranch: "emotional low state",
    supportingTerms: ["depression", "sadness", "despair", "gloom", "low spirits"],
    caveat: "Everyday feeling/state evidence should not be collapsed into clinical diagnosis.",
  },
  {
    id: "clinical_psychiatric_condition",
    label: "Clinical / psychiatric condition",
    color: "#A1081F",
    senseBranch: "clinical psychiatric condition",
    supportingTerms: ["mental depression", "clinical depression", "major depression", "depressive disorder", "melancholia"],
    caveat: "Modern diagnostic language is historically late and should be separated from older melancholy and dejection language.",
  },
  {
    id: "economic_downturn",
    label: "Economic downturn",
    color: "#FBB728",
    senseBranch: "economic downturn",
    supportingTerms: ["economic depression", "great depression", "financial depression", "business depression"],
    caveat: "Economic depression is a distinct branch and should not be visually blended with mood/clinical evidence.",
  },
  {
    id: "geographical_topographical",
    label: "Geographical / topographical depression",
    color: "#5FCA00",
    senseBranch: "geographical hollow / low area",
    supportingTerms: ["topographical depression", "geological depression", "depression of the surface", "depression of the land"],
    caveat: "This branch may be sparse in public-domain snippets but is semantically important for branching visuals.",
  },
  {
    id: "physical_lowering_pressure",
    label: "Physical lowering / pressure",
    color: "#2C9FC7",
    senseBranch: "physical lowering / pressing down",
    supportingTerms: ["depression of", "pressure", "lowering", "pressed", "tropical depression"],
    caveat: "This includes literal lowering and pressure-adjacent uses; meteorology may need its own branch later.",
  },
  {
    id: "literary_melancholy_sadness_cluster",
    label: "Literary melancholy / sadness cluster",
    color: "#1570AC",
    senseBranch: "literary melancholy / sadness cluster",
    supportingTerms: ["melancholy", "melancholia", "despair", "gloom"],
    caveat: "This is a historical neighbor cluster, not an exact synonym set.",
  },
];

type FrequencyFile = {
  generatedAt: string;
  source: unknown;
  series: Array<{
    id: string;
    label: string;
    query: string;
    group: string;
    comparisonRole: string;
    firstNonZeroYear: number | null;
    recommendedVisualStartYear: number;
    earlyFrequencyStatus: string;
    usabilityStatus: string;
    visualUse: string;
    rangeStats: Array<{
      startYear: number;
      endYear: number;
      nonZeroYearCount: number;
      averageFrequencyPerMillion: number;
      maxFrequencyPerMillion: number;
    }>;
  }>;
};

type TermsAuditFile = {
  generatedAt: string;
  source: unknown;
  terms: Array<Record<string, unknown> & {
    query: string;
    group: string;
    comparisonRole: string;
    firstNonZeroYear: number | null;
    usabilityStatus: string;
    visualUse: string;
  }>;
};

type PrehistoryFile = {
  generatedAt: string;
  layer: string;
  coverage: unknown;
  records: Array<{
    id: string;
    form: string;
    normalizedForm: string;
    evidenceType: string;
    senseBranch: string;
    dateLabel: string;
    yearApproximation: number;
    sourceName: string;
    sourceUrl: string;
    verificationStatus: string;
    confidence: string;
    caveat: string;
  }>;
  investigatedSources: Array<Record<string, unknown>>;
};

type ContextFile = {
  generatedAt: string;
  layer: string;
  source: unknown;
  coverage: {
    startYear: number | null;
    endYear: number | null;
    sourceCount?: number;
    comparableToNgram?: boolean;
    comparableToHistoricalCorpus?: boolean;
  };
  snippets: Array<{
    id: string;
    title: string;
    year: number;
    matchedTerm?: string;
    matchedPhrase?: string | null;
    categoryIds: string[];
  }>;
  phrases: Array<{
    id: string;
    phrase: string;
    count: number;
    documentFrequency: number;
    categoryIds: string[];
    displayEligible?: boolean;
  }>;
  collocates: Array<{
    id: string;
    token: string;
    count: number;
    documentFrequency: number;
    categoryIds: string[];
    displayEligible?: boolean;
  }>;
};

async function readJson<T>(file: string) {
  return JSON.parse(await readFile(file, "utf8")) as T;
}

function relationRecommendation(term: TermsAuditFile["terms"][number]) {
  const query = term.query.toLowerCase();
  const sparse = term.usabilityStatus === "too-sparse";

  if (query === "depression") {
    return {
      historicallyUseful: true,
      semanticOverlap: "target",
      displayRole: "core word",
      recommendation: "Use as the central frequency and semantic-branch target.",
    };
  }
  if (["melancholy", "melancholia"].includes(query)) {
    return {
      historicallyUseful: !sparse,
      semanticOverlap: "high historical overlap, not exact synonym",
      displayRole: "historical mood/medical neighbor",
      recommendation: "Strong candidate for comparison, especially before modern clinical depression dominates.",
    };
  }
  if (["sadness", "despair", "gloom", "anxiety", "low spirits"].includes(query)) {
    return {
      historicallyUseful: !sparse,
      semanticOverlap: "partial mood overlap",
      displayRole: "related mood term",
      recommendation:
        query === "anxiety"
          ? "Useful as an adjacent modern mental-health neighbor, but not a synonym."
          : "Useful as a related emotional term if frequency is strong enough.",
    };
  }
  if (term.group === "clinical-psychiatric") {
    return {
      historicallyUseful: !sparse,
      semanticOverlap: "clinical branch overlap",
      displayRole: "clinical phrase",
      recommendation: "Use only where the series has modern signal; do not project backward into early periods.",
    };
  }
  if (term.group === "economic") {
    return {
      historicallyUseful: !sparse,
      semanticOverlap: "separate economic sense branch",
      displayRole: "economic branch phrase",
      recommendation: "Use to show semantic branching away from mood/clinical depression.",
    };
  }
  if (term.group === "geographical") {
    return {
      historicallyUseful: !sparse,
      semanticOverlap: "separate physical/geographical branch",
      displayRole: "topographical branch phrase",
      recommendation: "Use as a small branch unless more context data is added.",
    };
  }

  return {
    historicallyUseful: !sparse,
    semanticOverlap: "candidate relation",
    displayRole: "candidate term",
    recommendation: "Retain for audit; decide visual use after context verification.",
  };
}

function earliestContextHit(context: ContextFile, term: string) {
  const lower = term.toLowerCase();
  const snippets = context.snippets.filter((snippet) => {
    const matchedTerm = snippet.matchedTerm?.toLowerCase() ?? "";
    const matchedPhrase = snippet.matchedPhrase?.toLowerCase() ?? "";
    return matchedTerm === lower || matchedPhrase === lower;
  });
  return snippets.sort((a, b) => a.year - b.year)[0] ?? null;
}

function categorySupport(categoryId: string, archival: ContextFile, modern: ContextFile) {
  const archivalSnippets = archival.snippets.filter((snippet) => snippet.categoryIds.includes(categoryId));
  const modernSnippets = modern.snippets.filter((snippet) => snippet.categoryIds.includes(categoryId));
  const archivalPhrases = archival.phrases.filter((phrase) => phrase.categoryIds.includes(categoryId));
  const modernPhrases = modern.phrases.filter((phrase) => phrase.categoryIds.includes(categoryId));
  const archivalCollocates = archival.collocates.filter((collocate) => collocate.categoryIds.includes(categoryId));
  const modernCollocates = modern.collocates.filter((collocate) => collocate.categoryIds.includes(categoryId));

  const supportCount =
    archivalSnippets.length +
    modernSnippets.length +
    archivalPhrases.reduce((sum, phrase) => sum + phrase.count, 0) +
    modernPhrases.reduce((sum, phrase) => sum + phrase.count, 0) +
    archivalCollocates.reduce((sum, collocate) => sum + collocate.count, 0) +
    modernCollocates.reduce((sum, collocate) => sum + collocate.count, 0);

  return {
    supportCount,
    archival: {
      snippetCount: archivalSnippets.length,
      phraseCount: archivalPhrases.length,
      collocateCount: archivalCollocates.length,
      relatedSnippetIds: archivalSnippets.map((snippet) => snippet.id).slice(0, 16),
    },
    modern: {
      snippetCount: modernSnippets.length,
      phraseCount: modernPhrases.length,
      collocateCount: modernCollocates.length,
      relatedSnippetIds: modernSnippets.map((snippet) => snippet.id).slice(0, 16),
    },
    evidenceStrength:
      supportCount >= 80 ? "strong" : supportCount >= 25 ? "moderate" : supportCount > 0 ? "weak" : "unavailable",
  };
}

const frequency = await readJson<FrequencyFile>(path.join(OUT_DIR, "depression_frequency.json"));
const termsAudit = await readJson<TermsAuditFile>(path.join(OUT_DIR, "depression_terms_audit.json"));
const prehistory = await readJson<PrehistoryFile>(path.join(OUT_DIR, "depression_prehistory.json"));
const archival = await readJson<ContextFile>(path.join(OUT_DIR, "depression_archival_context.json"));
const modern = await readJson<ContextFile>(path.join(OUT_DIR, "depression_modern_context.json"));

const categories = categoryDefs.map((category) => ({
  ...category,
  method: "Provisional curated category; support is counted from phrase, collocate, snippet, and lexical-source evidence.",
  ...categorySupport(category.id, archival, modern),
}));

const synonymAudit = termsAudit.terms
  .filter((term) => ["melancholy", "melancholia", "sadness", "despair", "gloom", "anxiety", "low spirits"].includes(term.query.toLowerCase()))
  .map((term) => ({
    term: term.query,
    frequencyUsability: term.usabilityStatus,
    visualUse: term.visualUse,
    firstNgramYear: term.firstNonZeroYear,
    ...relationRecommendation(term),
  }));

const phraseBranchAudit = termsAudit.terms
  .filter((term) => !["depression", "melancholy", "melancholia", "sadness", "despair", "gloom", "anxiety", "low spirits"].includes(term.query.toLowerCase()))
  .map((term) => ({
    term: term.query,
    group: term.group,
    frequencyUsability: term.usabilityStatus,
    visualUse: term.visualUse,
    firstNgramYear: term.firstNonZeroYear,
    ...relationRecommendation(term),
  }));

const earliestEvidence = {
  depression: {
    earliestAttestedUsage: prehistory.records
      .filter((record) => record.normalizedForm === "depression" && record.evidenceType === "earliest-attested-usage")
      .sort((a, b) => a.yearApproximation - b.yearApproximation)[0],
    earliestCorpusHit: earliestContextHit(archival, "depression"),
    earliestScannedOrDigitizedTextHit: earliestContextHit(archival, "depression"),
    earliestFrequencySeriesYear: frequency.series.find((row) => row.query === "depression")?.firstNonZeroYear ?? null,
    caveat:
      "These are separate evidence types. Do not present any one of them as the first appearance of the word.",
  },
  melancholy: {
    earliestAttestedUsage: prehistory.records.find((record) => record.normalizedForm === "melancholy"),
    earliestCorpusHit: earliestContextHit(archival, "melancholy"),
    earliestScannedOrDigitizedTextHit: earliestContextHit(archival, "melancholy"),
    earliestFrequencySeriesYear: frequency.series.find((row) => row.query === "melancholy")?.firstNonZeroYear ?? null,
    caveat: "Melancholy is a related historical neighbor, not the target word.",
  },
  melancholia: {
    earliestAttestedUsage: prehistory.records.find((record) => record.normalizedForm === "melancholia"),
    earliestCorpusHit: earliestContextHit(archival, "melancholia"),
    earliestScannedOrDigitizedTextHit: earliestContextHit(archival, "melancholia"),
    earliestFrequencySeriesYear: frequency.series.find((row) => row.query === "melancholia")?.firstNonZeroYear ?? null,
    caveat: "Melancholia is a medical/humoral neighbor and may need OED verification for earliest quotation claims.",
  },
};

const dataset = {
  generatedAt: new Date().toISOString(),
  word: {
    id: "depression",
    label: "depression",
    status: "data-foundation-audit",
    framing:
      "Semantic branching audit for a future visual word page. No UI has been built in this round.",
  },
  layers: {
    prehistory: {
      source: "Lexical sources and source audit",
      coverage: prehistory.coverage,
      comparableCorpus: false,
      recordCount: prehistory.records.length,
    },
    frequency: {
      source: "Google Books Ngram Viewer",
      coverage: { startYear: 1500, endYear: 2022 },
      comparableCorpus: true,
      seriesCount: frequency.series.length,
    },
    archivalContext: {
      source: "Project Gutenberg seed",
      coverage: archival.coverage,
      comparableCorpus: false,
      snippetCount: archival.snippets.length,
      phraseCount: archival.phrases.length,
      collocateCount: archival.collocates.length,
    },
    modernContext: {
      source: "Wikinews + Wikipedia open snapshot",
      coverage: modern.coverage,
      comparableCorpus: false,
      snippetCount: modern.snippets.length,
      phraseCount: modern.phrases.length,
      collocateCount: modern.collocates.length,
    },
  },
  semanticBranches: categoryDefs.map((category) => ({
    id: category.id,
    label: category.label,
    senseBranch: category.senseBranch,
    supportingTerms: category.supportingTerms,
    caveat: category.caveat,
  })),
  earliestEvidence,
  termFrequencyAudit: termsAudit.terms,
  synonymAudit,
  phraseBranchAudit,
  categories,
  topArchivalPhrases: archival.phrases.slice(0, 30),
  topArchivalCollocates: archival.collocates.filter((collocate) => collocate.displayEligible).slice(0, 40),
  topModernPhrases: modern.phrases.slice(0, 30),
  topModernCollocates: modern.collocates.slice(0, 40),
  snippets: {
    archival: archival.snippets.slice(0, 80),
    modern: modern.snippets.slice(0, 80),
  },
  visualDirections: [
    {
      id: "branching-frequency-field",
      status: "promising",
      dataNeeded: "Ngram frequency series plus sense/phrase groups.",
      note: "Depression is better suited to semantic branching than a single relationship constellation.",
    },
    {
      id: "sense-branch-atlas",
      status: "promising",
      dataNeeded: "Lexical sense history, phrase candidates, archival snippets, modern reference/news context.",
      note: "Can show physical, geographical, emotional, clinical, and economic branches without merging them.",
    },
    {
      id: "melancholy-to-clinical-shift",
      status: "promising-with-caution",
      dataNeeded: "Melancholy/melancholia/depression frequency plus curated snippets.",
      note: "Strong historical story, but terms are neighbors rather than exact synonyms.",
    },
    {
      id: "modern-mental-health-snapshot",
      status: "needs-better-modern-corpus",
      dataNeeded: "A legally usable modern mental-health corpus beyond Wikinews/Wikipedia.",
      note: "Current modern layer is useful for anchors but too small for strong contemporary context visuals.",
    },
  ],
  caveats: [
    "Google Ngram is frequency-only and does not identify senses.",
    "Project Gutenberg snippets are display-safe but not a balanced historical corpus.",
    "Wikinews/Wikipedia modern context is open and useful, but not comparable to Gutenberg or Ngram.",
    "Pre-1700 corpus context requires EarlyPrint/EEBO-TCP or another early-print workflow.",
    "OED or another historical dictionary should be used before publishing first-attestation claims.",
  ],
};

const categoriesFile = {
  generatedAt: new Date().toISOString(),
  layer: "semantic category candidates",
  categories,
};

await mkdir(OUT_DIR, { recursive: true });
await writeFile(CATEGORIES_FILE, `${JSON.stringify(categoriesFile, null, 2)}\n`);
await writeFile(DATASET_FILE, `${JSON.stringify(dataset, null, 2)}\n`);
console.log(`Wrote ${CATEGORIES_FILE}`);
console.log(`Wrote ${DATASET_FILE}`);
