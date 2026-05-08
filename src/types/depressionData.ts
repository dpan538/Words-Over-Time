export type DepressionFrequencyPoint = {
  year: number;
  value: number;
  frequencyPerMillion: number;
};

export type DepressionFrequencySeries = {
  id: string;
  label: string;
  query: string;
  group: string;
  comparisonRole: string;
  color: string;
  source: string;
  corpus: string;
  smoothing: number;
  startYear: number;
  endYear: number;
  firstNonZeroYear: number | null;
  recommendedVisualStartYear: number;
  earlyFrequencyStatus: string;
  coverageNote: string;
  semanticCaveat: string;
  usabilityStatus: string;
  visualUse: string;
  points: DepressionFrequencyPoint[];
};

export type DepressionFrequencyFile = {
  generatedAt: string;
  source: {
    label: string;
    corpus: string;
    startYear: number;
    endYear: number;
    smoothing: number;
    note: string;
  };
  series: DepressionFrequencySeries[];
};

export type DepressionPrehistoryRecord = {
  id: string;
  form: string;
  normalizedForm: string;
  evidenceType: string;
  senseBranch: string;
  dateLabel: string;
  yearApproximation: number;
  sourceName: string;
  sourceUrl: string;
  sourceCategory: string;
  quote: string;
  verificationStatus: string;
  confidence: string;
  caveat: string;
};

export type DepressionPrehistoryFile = {
  generatedAt: string;
  layer: string;
  coverage: {
    earliestApproximateYear: number;
    latestApproximateYear: number;
    comparableCorpusAvailable: boolean;
    note: string;
  };
  records: DepressionPrehistoryRecord[];
};

export type DepressionBranch = {
  id: string;
  label: string;
  tier: number;
  color: string;
  periodOfImportance: string;
  role: string;
  supportingTerms: string[];
  visualUse: string;
  caveat: string;
};

export type DepressionBranchesFile = {
  generatedAt: string;
  layer: string;
  branchPolicy: string;
  branches: DepressionBranch[];
};

export type DepressionEvidenceRecord = {
  id: string;
  term: string;
  year: number | null;
  source: string;
  sourceLayer: string;
  branchTag: string;
  snippet: string;
  confidence: string;
  rightsState: string;
  displayPriority: number;
  evidenceType: string;
  sourceUrl?: string;
  title?: string;
  author?: string;
  caveat: string;
  relatedRole?: string;
};

export type DepressionEvidenceFile = {
  generatedAt: string;
  layer: string;
  schema: {
    fields: string[];
    note: string;
  };
  evidence: DepressionEvidenceRecord[];
};

export type DepressionCoverageReport = {
  generatedAt: string;
  word: string;
  status: string;
  uiBuilt: boolean;
  layerCoverage: {
    prehistoryAttestation: {
      source: string;
      coverage: DepressionPrehistoryFile["coverage"];
      recordCount: number;
      visualUse: string;
      limitation: string;
    };
    longSpanFrequency: {
      source: string;
      coverage: { startYear: number; endYear: number };
      seriesCount: number;
      usableSeries: number;
      visualUse: string;
      limitation: string;
    };
    archivalContext: {
      source: string;
      coverage: { startYear: number; endYear: number };
      snippetCount: number;
      phraseCount: number;
      collocateCount: number;
      visualUse: string;
      limitation: string;
    };
    modernContext: {
      source: string;
      coverage: { startYear: number; endYear: number };
      snippetCount: number;
      phraseCount: number;
      collocateCount: number;
      visualUse: string;
      limitation: string;
    };
    normalizedEvidence: {
      source: string;
      evidenceCount: number;
      coverage: { earliestYear: number; latestYear: number };
      byLayer: Record<string, number>;
      byBranch: Record<string, number>;
      visualUse: string;
      limitation: string;
    };
  };
  semanticBranchIds: string[];
};
