export type CrossPressureArmId =
  | "personal"
  | "private_control"
  | "science_evidence"
  | "ethics_governance";

export type CrossPressureDirection = "left" | "right" | "up" | "down";
export type CrossPressureNodeLevel = "major" | "minor" | "hover" | "excluded";
export type CrossPressureDataAvailability = "existing" | "partial" | "missing_or_needs_collection";

export type CrossPressureVisibilitySummary = {
  available: boolean;
  corpus?: string;
  average1990_2022?: number | null;
  average2000_2022?: number | null;
  average2010_2022?: number | null;
  peakYear1990_2022?: number | null;
  peakFrequencyPerMillion?: number | null;
  recent2022?: number | null;
  growthDirection?: string | null;
  caveat?: string;
};

export type CrossPressureArm = {
  id: CrossPressureArmId;
  label: string;
  direction: CrossPressureDirection;
  description: string;
  color: string;
};

export type CrossPressureRegion = {
  id: CrossPressureArmId;
  label: string;
  description: string;
  color: string;
  points: Array<{ x: number; y: number }>;
};

export type CrossPressureNode = {
  id: string;
  label: string;
  pressurePrimary: CrossPressureArmId;
  pressureSecondary?: CrossPressureArmId | null;
  level: CrossPressureNodeLevel;
  x?: number;
  y?: number;
  labelDx?: number;
  labelDy?: number;
  labelAnchor?: "start" | "middle" | "end";
  dataAvailability: CrossPressureDataAvailability;
  existsInDataTerms: boolean;
  existsInDataFrequency: boolean;
  coverageStatus: "strong" | "usable" | "weak" | "missing" | "partial";
  recommendedVisualStatus?: string | null;
  evidenceType: string[];
  confidence: "high" | "medium" | "low";
  note: string;
  timeTag?: string | null;
  sourceIds?: string[];
  caveat?: string | null;
  requiresManualEvidence?: boolean;
  requiresPolicySource?: boolean;
  requiresAcademicSource?: boolean;
  requiresNewsOrNowCorpus?: boolean;
  visibilitySummary?: CrossPressureVisibilitySummary;
};

export type CrossPressureBridgeNode = {
  id: string;
  role: string;
  connects: CrossPressureArmId[];
};

export type CrossPressureFlow = {
  id: string;
  source: string;
  via: string[];
  target: string;
  label: string;
  type: "semantic_transfer" | "bridge_relation";
  emphasis: "primary" | "secondary" | "quiet";
};

export type CrossPressureDateTag = {
  id: string;
  label: string;
  text: string;
  x: number;
  y: number;
  relatedNodes: string[];
};

export type DataCrossPressuresDataset = {
  word: "data";
  chartId: "data-cross-pressures";
  generatedAt: string;
  sourceInputs: string[];
  metadata: {
    title: string;
    subtitle: string;
    thesis: string;
    caveat: string;
    model: "axial_semantic_field";
  };
  pressureArms: CrossPressureArm[];
  regions: CrossPressureRegion[];
  nodes: CrossPressureNode[];
  bridgeNodes: CrossPressureBridgeNode[];
  flows: CrossPressureFlow[];
  dateTags: CrossPressureDateTag[];
  evidenceNotes: Array<{ id: string; text: string }>;
  visualNotes: Array<{ id: string; text: string }>;
};
