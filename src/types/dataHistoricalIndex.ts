export type DataHistoricalIndexDataset = {
  word: string;
  title: string;
  subtitle: string;
  coverage: {
    startYear: number;
    endYear: number;
    frequencySourceEndYear: number;
  };
  notes: string[];
  panels: DataHistoricalPanel[];
  caveat: string;
  contemporaryEvidence?: DataContemporaryEvidence;
};

export type DataContemporaryEvidence = {
  generatedAt: string;
  purpose: string;
  terms: string[];
  sourceAudits: DataEvidenceSourceAudit[];
  termSummaries: DataEvidenceTermSummary[];
  caveats: string[];
};

export type DataEvidenceSourceAudit = {
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

export type DataEvidenceTermSummary = {
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

export type DataHistoricalPanel = {
  id: string;
  label: string;
  tag: string;
  startYear: number;
  endYear: number;
  summary: string;
  density: "spacious" | "dense";
  hinge?: string;
  phases?: DataHistoricalPhase[];
  branchGroups?: DataBranchGroup[];
  lanes?: DataPanelLane[];
  functions: DataFunctionGroup[];
  terms: DataHistoricalTerm[];
  relations: DataRelation[];
  frequencySeries?: DataFrequencySeries[];
};

export type DataHistoricalPhase = {
  id: string;
  label: string;
  startYear: number;
  endYear: number;
  summary: string;
};

export type DataBranchGroup = {
  id: string;
  label: string;
  startYear: number;
  endYear: number;
};

export type DataPanelLane = {
  id: string;
  label: string;
  y: number;
};

export type DataFunctionGroup = {
  id: string;
  label: string;
  meaning: string;
};

export type DataHistoricalTerm = {
  id: string;
  term: string;
  branch: string;
  functionGroup: string;
  visualRole: string;
  importance: "essential" | "supporting" | "high" | "very high" | "medium-high";
  displayYear: number;
  visualYear?: number;
  laneId?: string;
  labelLane?: number;
  labelDx?: number;
  labelDy?: number;
  branchLabelDy?: number;
  provisionalLabelDy?: number;
  labelAnchor?: "start" | "end";
  frequency: {
    status: "fetched" | "provisional" | "pre-corpus";
    firstNonZeroYear: number | null;
    firstStrongVisibilityYear: number | null;
    maxYear: number | null;
    maxFrequencyPerMillion: number | null;
    quality: string;
  };
};

export type DataRelation = {
  source: string;
  target: string;
  type: string;
  strength?: "primary" | "secondary";
};

export type DataFrequencySeries = {
  termId: string;
  source: string;
  unit: string;
  status: "fetched" | "provisional" | "pre-corpus";
  points: Array<{
    year: number;
    value: number;
  }>;
};
