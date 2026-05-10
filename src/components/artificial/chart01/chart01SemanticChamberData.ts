export type ChamberPlane =
  | "word_family"
  | "technical_construction"
  | "sense_boundary"
  | "guide";

export type ChamberNode = {
  id: string;
  label: string;
  plane: ChamberPlane;
  role: string;
  confidence: "high" | "medium" | "low" | "structural";
  visibility: "always" | "state" | "hover" | "small_annotation" | "notes_only";
  weight: 1 | 2 | 3 | 4 | 5;
};

export type ChamberEdge = {
  id: string;
  source: string;
  target: string;
  type:
    | "word_family"
    | "semantic_projection"
    | "technical_support"
    | "sense_branch"
    | "semantic_drift"
    | "contrast";
  weight: 1 | 2 | 3 | 4 | 5;
  visibility: "always" | "state" | "hover" | "low_opacity";
};

export type ChamberState =
  | "resting"
  | "word_family"
  | "technical"
  | "sense_boundary"
  | "full_overlay";

export const chamberNodes: ChamberNode[] = [
  {
    id: "artificial",
    label: "artificial",
    plane: "word_family",
    role: "central word",
    confidence: "high",
    visibility: "always",
    weight: 5,
  },
  {
    id: "art",
    label: "art",
    plane: "word_family",
    role: "skill / learned practice",
    confidence: "high",
    visibility: "always",
    weight: 5,
  },
  {
    id: "artifice",
    label: "artifice",
    plane: "word_family",
    role: "skillful making / contrivance",
    confidence: "high",
    visibility: "always",
    weight: 5,
  },
  {
    id: "artificer",
    label: "artificer",
    plane: "word_family",
    role: "maker / craftsperson",
    confidence: "high",
    visibility: "state",
    weight: 4,
  },
  {
    id: "artificially",
    label: "artificially",
    plane: "word_family",
    role: "by art / by skill / by contrivance",
    confidence: "high",
    visibility: "state",
    weight: 3,
  },
  {
    id: "made_by_art_skill",
    label: "made by art / skill",
    plane: "sense_boundary",
    role: "origin sense",
    confidence: "high",
    visibility: "always",
    weight: 5,
  },
  {
    id: "contrivance_construction",
    label: "contrivance / construction",
    plane: "sense_boundary",
    role: "bridge sense",
    confidence: "high",
    visibility: "always",
    weight: 5,
  },
  {
    id: "not_natural",
    label: "not natural",
    plane: "sense_boundary",
    role: "distinct sense",
    confidence: "high",
    visibility: "always",
    weight: 4,
  },
  {
    id: "fake_not_genuine",
    label: "fake / not genuine",
    plane: "sense_boundary",
    role: "suspicious branch",
    confidence: "medium",
    visibility: "always",
    weight: 3,
  },
  {
    id: "imitation_substitute",
    label: "imitation / substitute",
    plane: "sense_boundary",
    role: "substitution branch",
    confidence: "medium",
    visibility: "state",
    weight: 3,
  },
  {
    id: "affected_insincere",
    label: "affected / insincere",
    plane: "sense_boundary",
    role: "affective branch",
    confidence: "medium",
    visibility: "state",
    weight: 2,
  },
  {
    id: "artificial_arguments",
    label: "artificial arguments",
    plane: "technical_construction",
    role: "rule-based rhetoric",
    confidence: "high",
    visibility: "state",
    weight: 4,
  },
  {
    id: "artificial_numbers",
    label: "artificial numbers",
    plane: "technical_construction",
    role: "mathematical reckoning",
    confidence: "high",
    visibility: "state",
    weight: 4,
  },
  {
    id: "artificial_memory",
    label: "artificial memory",
    plane: "technical_construction",
    role: "learned memory technique",
    confidence: "medium",
    visibility: "state",
    weight: 3,
  },
  {
    id: "artificial_day",
    label: "artificial day",
    plane: "technical_construction",
    role: "daylight reckoning annotation",
    confidence: "medium",
    visibility: "small_annotation",
    weight: 2,
  },
  {
    id: "guide_not_natural_not_fake",
    label: "not natural is not fake",
    plane: "guide",
    role: "sense boundary warning",
    confidence: "structural",
    visibility: "state",
    weight: 4,
  },
  {
    id: "guide_contrivance_not_deception_only",
    label: "contrivance is not only deception",
    plane: "guide",
    role: "bridge warning",
    confidence: "structural",
    visibility: "hover",
    weight: 3,
  },
];

export const chamberEdges: ChamberEdge[] = [
  {
    id: "art_to_artifice",
    source: "art",
    target: "artifice",
    type: "word_family",
    weight: 5,
    visibility: "always",
  },
  {
    id: "artifice_to_artificial",
    source: "artifice",
    target: "artificial",
    type: "word_family",
    weight: 5,
    visibility: "always",
  },
  {
    id: "artifice_to_artificer",
    source: "artifice",
    target: "artificer",
    type: "word_family",
    weight: 4,
    visibility: "state",
  },
  {
    id: "artificial_to_artificially",
    source: "artificial",
    target: "artificially",
    type: "word_family",
    weight: 3,
    visibility: "state",
  },
  {
    id: "art_to_made_by_art_skill",
    source: "art",
    target: "made_by_art_skill",
    type: "semantic_projection",
    weight: 4,
    visibility: "state",
  },
  {
    id: "artifice_to_contrivance",
    source: "artifice",
    target: "contrivance_construction",
    type: "semantic_projection",
    weight: 4,
    visibility: "state",
  },
  {
    id: "made_by_art_to_contrivance",
    source: "made_by_art_skill",
    target: "contrivance_construction",
    type: "sense_branch",
    weight: 5,
    visibility: "always",
  },
  {
    id: "contrivance_to_not_natural",
    source: "contrivance_construction",
    target: "not_natural",
    type: "sense_branch",
    weight: 5,
    visibility: "always",
  },
  {
    id: "not_natural_to_fake_drift",
    source: "not_natural",
    target: "fake_not_genuine",
    type: "semantic_drift",
    weight: 3,
    visibility: "state",
  },
  {
    id: "not_natural_fake_contrast",
    source: "not_natural",
    target: "fake_not_genuine",
    type: "contrast",
    weight: 5,
    visibility: "state",
  },
  {
    id: "not_natural_to_imitation",
    source: "not_natural",
    target: "imitation_substitute",
    type: "sense_branch",
    weight: 3,
    visibility: "state",
  },
  {
    id: "contrivance_to_affected",
    source: "contrivance_construction",
    target: "affected_insincere",
    type: "sense_branch",
    weight: 2,
    visibility: "low_opacity",
  },
  {
    id: "made_by_art_to_arguments",
    source: "made_by_art_skill",
    target: "artificial_arguments",
    type: "technical_support",
    weight: 4,
    visibility: "state",
  },
  {
    id: "made_by_art_to_numbers",
    source: "made_by_art_skill",
    target: "artificial_numbers",
    type: "technical_support",
    weight: 4,
    visibility: "state",
  },
  {
    id: "made_by_art_to_memory",
    source: "made_by_art_skill",
    target: "artificial_memory",
    type: "technical_support",
    weight: 3,
    visibility: "state",
  },
  {
    id: "contrivance_to_day",
    source: "contrivance_construction",
    target: "artificial_day",
    type: "technical_support",
    weight: 2,
    visibility: "low_opacity",
  },
];

export const chamberStateLabels: Record<ChamberState, string> = {
  resting: "resting",
  word_family: "word family",
  technical: "technical",
  sense_boundary: "sense boundary",
  full_overlay: "full overlay",
};
