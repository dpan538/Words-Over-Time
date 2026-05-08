export type MachineRelationType =
  | "one_to_one"
  | "one_to_many"
  | "many_to_one"
  | "many_to_many"
  | "feedback_loop";

export type MachineDirectionalityHint =
  | "forward"
  | "bidirectional"
  | "collector"
  | "branching"
  | "delayed_feedback";

export type MachineNodeKey =
  | "depression"
  | "clinical_psychiatry"
  | "diagnosis"
  | "clinical_vocabulary_mesh_indexing"
  | "symptoms"
  | "psychology_behavior"
  | "treatment_medication"
  | "therapy_counseling"
  | "public_health_records"
  | "phq9_screening"
  | "prevalence"
  | "functional_difficulty"
  | "media_public_discourse"
  | "mental_health_awareness"
  | "stigma"
  | "self_description"
  | "disclosure_secrecy"
  | "help_seeking"
  | "policy_social_response";

export type MachineAuthorityTier = "official" | "systematic_review" | "peer_reviewed";

export type MachineEvidenceRef = {
  id: string;
  label: string;
  source_kind: string;
  authority_tier: MachineAuthorityTier;
  citation_note: string;
};

export type MachineRelation = {
  id: string;
  type: MachineRelationType;
  source_nodes: MachineNodeKey[];
  target_nodes: MachineNodeKey[];
  short_explanation: string;
  suggested_visual_treatment: string;
  suggested_motion_behaviour: string;
  strength_score: number;
  evidence_refs: string[];
  directionality_hint: MachineDirectionalityHint;
  curation_note?: string;
};

export type DepressionSemanticMachineRelations = {
  meta: {
    word: string;
    version: string;
    generated_at: string;
    strength_semantics: string;
    notes?: string;
  };
  relation_taxonomy: MachineRelationType[];
  node_keys: MachineNodeKey[];
  evidence_registry: MachineEvidenceRef[];
  relations: MachineRelation[];
};
