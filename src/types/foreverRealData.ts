import type { InspectorEntry } from "@/types/inspector";

export type ForeverEraId =
  | "all"
  | "1700-1799"
  | "1800-1849"
  | "1850-1899"
  | "1900-1949"
  | "1950-1999"
  | "2000-2019"
  | "recent";

export type ForeverEra = {
  id: ForeverEraId;
  label: string;
  startYear: number | null;
  endYear: number | null;
  note: string;
};

export type GeneratedFrequencyPoint = {
  year: number;
  value: number;
  frequencyPerMillion: number;
};

export type GeneratedFrequencySeries = {
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
  points: GeneratedFrequencyPoint[];
  inspectorId: string;
};

export type GeneratedPhrase = {
  id: string;
  phrase: string;
  eraId: ForeverEraId;
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

export type GeneratedCollocate = {
  id: string;
  token: string;
  eraId: ForeverEraId;
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

export type GeneratedSnippet = {
  id: string;
  eraId: ForeverEraId;
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

export type GeneratedCategory = {
  id: string;
  label: string;
  color: string;
  method: string;
  eraScores: Array<{
    eraId: ForeverEraId;
    score: number;
    phraseCount: number;
    collocateCount: number;
    snippetCount: number;
    supportingPhrases: string[];
    supportingCollocates: string[];
    inspectorId: string;
  }>;
};

export type GeneratedFlowLink = {
  id: string;
  source: string;
  target: string;
  value: number;
  eraId: ForeverEraId;
  color: string;
  relation: string;
  inspectorId: string;
};

export type GeneratedAtlasNode = {
  id: string;
  label: string;
  column: "form" | "phrase" | "contextual_category" | "collocate";
  eraId: ForeverEraId | "all";
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

export type GeneratedAtlasEdge = {
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
  eraId: ForeverEraId | "all";
  evidenceCount: number;
  scoreType?: string;
  scoreValue?: number;
  dataLayer: "raw" | "computed" | "curated" | "interpretive";
  relatedSnippetIds: string[];
  caveat: string;
  inspectorId: string;
};

export type GeneratedLedgerCell = {
  id: string;
  categoryId: string;
  eraId: ForeverEraId;
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

export type GeneratedNetworkNode = {
  id: string;
  label: string;
  group: "word" | "variant" | "phrase" | "collocate" | "contextual_category";
  x: number;
  y: number;
  radius: number;
  color: string;
  eraId: ForeverEraId | "all";
  count?: number;
  score?: number;
  inspectorId: string;
};

export type GeneratedNetworkEdge = {
  id: string;
  source: string;
  target: string;
  weight: number;
  relation: string;
  color: string;
  eraId: ForeverEraId | "all";
  inspectorId: string;
};

export type GeneratedPrehistory = {
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

export type GeneratedModernContext = {
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
    eraId: ForeverEraId;
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

export type ForeverGeneratedDataset = {
  generatedAt: string;
  coverage: {
    ngramStartYear: number;
    ngramEndYear: number;
    ngramPublicVisualDefaultStartYear?: number;
    ngramPre1700Available?: boolean;
    gutenbergStartYear: number;
    gutenbergEndYear: number;
    prehistoryEarliestApproximateYear?: number | null;
    prehistoryComparableCorpusAvailable?: boolean;
    modernContextStartYear?: number | null;
    modernContextEndYear?: number | null;
    modernContextComparableToHistoricalCorpus?: boolean;
    recentImplemented: boolean;
  };
  sourceLayers?: Array<{
    id: string;
    source: string;
    coverage: string;
    role: string;
    comparable: boolean;
  }>;
  eras: ForeverEra[];
  frequency: GeneratedFrequencySeries[];
  prehistory?: GeneratedPrehistory | null;
  modernContext?: GeneratedModernContext | null;
  phrases: GeneratedPhrase[];
  collocates: GeneratedCollocate[];
  snippets: GeneratedSnippet[];
  categories: GeneratedCategory[];
  flows: GeneratedFlowLink[];
  atlas: {
    nodes: GeneratedAtlasNode[];
    edges: GeneratedAtlasEdge[];
  };
  ledger: GeneratedLedgerCell[];
  network: {
    nodes: GeneratedNetworkNode[];
    edges: GeneratedNetworkEdge[];
  };
  inspectors: InspectorEntry[];
};
