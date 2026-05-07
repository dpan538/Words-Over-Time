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

export type ForeverGeneratedDataset = {
  generatedAt: string;
  coverage: {
    ngramStartYear: number;
    ngramEndYear: number;
    gutenbergStartYear: number;
    gutenbergEndYear: number;
    recentImplemented: boolean;
  };
  eras: ForeverEra[];
  frequency: GeneratedFrequencySeries[];
  phrases: GeneratedPhrase[];
  collocates: GeneratedCollocate[];
  snippets: GeneratedSnippet[];
  categories: GeneratedCategory[];
  flows: GeneratedFlowLink[];
  network: {
    nodes: GeneratedNetworkNode[];
    edges: GeneratedNetworkEdge[];
  };
  inspectors: InspectorEntry[];
};
