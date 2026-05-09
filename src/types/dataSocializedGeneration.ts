export type SocializedPanelId = "outline" | "inner";

export type SocializedCircleId =
  | "trace_circulation"
  | "identity_rights_control"
  | "overlap"
  | "ai_tail";

export type SocializedVisualRole =
  | "major_label"
  | "minor_label"
  | "dot_only"
  | "hover_only"
  | "edge_tail";

export type SocializedPoint = {
  x: number;
  y: number;
};

export type SocializedCircleGeometry = {
  cx: number;
  cy: number;
  r: number;
};

export type DataSocializedPanel = {
  id: SocializedPanelId;
  label: string;
  dateRange: string;
  centerOfGravity?: string;
  scaleMeaning: string;
  density: "spacious" | "compressed";
  circleGeometry: {
    trace_circulation: SocializedCircleGeometry;
    identity_rights_control: SocializedCircleGeometry;
  };
};

export type DataSocializedTerm = {
  slug: string;
  label: string;
  panels: SocializedPanelId[];
  circle: SocializedCircleId;
  visualRole: SocializedVisualRole;
  labelPriority: number;
  branch: string;
  confidenceLevel: string;
  coverageStatus: string;
  recommendedVisualStatus: string;
  firstAttestation: string | null;
  firstStrongVisibility: string | null;
  position: Partial<Record<SocializedPanelId, SocializedPoint>>;
  ngramSummary: {
    corpus: string;
    quality: string;
    average1990_2022: number | null;
    average2003_2013: number | null;
    average2005_2012: number | null;
    average2014_2022: number | null;
    peak1990_2022: { year: number; frequencyPerMillion: number } | null;
    growth1990sTo2010s: number | null;
  } | null;
  sourceIds: string[];
  sourceRefs: Array<{
    sourceId: string;
    title?: string;
    sourceType?: string;
    year?: string | number;
  }>;
  notes: string;
  caveat: string;
  selectionRationale: string;
};

export type DataSocializedRelation = {
  relation_id: string;
  from: string;
  to: string;
  relation_type: string;
  branch: string;
  date_range: string;
  weight: number;
  confidence_level: string;
  panels: SocializedPanelId[];
  chart2_note?: string;
};

export type DataSocializedGenerationDataset = {
  word: "data";
  chartId: string;
  title: string;
  thesis: string;
  generatedAt: string;
  sourceInputs: string[];
  panels: DataSocializedPanel[];
  circles: Array<{
    id: "trace_circulation" | "identity_rights_control" | "overlap";
    label: string;
    meaning: string;
  }>;
  terms: DataSocializedTerm[];
  relations: DataSocializedRelation[];
  aiTailTerms: string[];
  downgradedTerms: Array<{
    slug: string;
    label: string;
    visualRole: SocializedVisualRole;
    reason: string;
    coverageStatus: string;
    recommendedVisualStatus: string;
  }>;
  omittedCandidateTerms: Array<{
    label: string;
    reason: string;
  }>;
  notes: string[];
  caveat: string;
};
