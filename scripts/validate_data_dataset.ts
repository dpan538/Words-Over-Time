import { readFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = path.join(process.cwd(), "src", "data", "generated");

const VALID_BRANCHES = new Set([
  "core",
  "evidence_measurement",
  "administrative_recordkeeping",
  "computational_processing",
  "database_structured_access",
  "networked_trace_interoperability",
  "personal_data_governance",
  "commercial_analytics_decision",
  "ai_training_synthetic_generation",
  "grammar",
]);

const VALID_CONFIDENCE = new Set(["high", "medium", "low"]);
const VALID_DATA_LAYERS = new Set(["raw", "computed", "curated", "interpretive"]);
const VALID_RELATION_TYPES = new Set([
  "lexical_root",
  "semantic_neighbor",
  "technical_enables",
  "institutionalizes",
  "stores",
  "processes",
  "retrieves",
  "governs",
  "commercializes",
  "extracts",
  "trains_with",
  "generates",
  "describes",
]);

async function readJson<T>(fileName: string): Promise<T> {
  return JSON.parse(await readFile(path.join(OUT_DIR, fileName), "utf8")) as T;
}

function pushIf(errors: string[], condition: boolean, message: string) {
  if (condition) errors.push(message);
}

type TermFile = {
  terms: Array<{
    term: string;
    slug: string;
    branch: string;
    visual_role: string;
    data_layer: string;
    confidence_level: string;
    first_attestation: string | null;
    caveat: string;
    source_ids: string[];
  }>;
};

type SourceFile = { sources: Array<{ source_id: string }> };
type EvidenceFile = {
  evidence_items: Array<{
    evidence_id: string;
    term_slug: string;
    branch: string;
    source_id: string;
    confidence_level: string;
    data_layer: string;
  }>;
};
type RelationsFile = {
  relations: Array<{
    relation_id: string;
    from: string;
    to: string;
    relation_type: string;
    branch: string;
    confidence_level: string;
    evidence_ids: string[];
    source_ids: string[];
    data_layer: string;
  }>;
};
type PhasesFile = {
  phases: Array<{
    phase_id: string;
    branch: string;
    supporting_term_slugs: string[];
    confidence_level?: string;
    evidence_strength: string;
    source_ids: string[];
    data_layer: string;
  }>;
};
type FrequencyFile = {
  series: Array<{
    term_slug: string;
    corpus: string;
    data_layer: string;
    data_quality_status: string;
  }>;
};
type GrammarFile = FrequencyFile;
type CoverageFile = {
  term_coverage: Array<{
    term_slug: string;
    branch: string;
    source_ids: string[];
    data_layer: string;
  }>;
};

async function main() {
  const errors: string[] = [];
  const warnings: string[] = [];

  const termsFile = await readJson<TermFile>("data_terms.json");
  const sourcesFile = await readJson<SourceFile>("data_sources.json");
  const evidenceFile = await readJson<EvidenceFile>("data_evidence.json");
  const relationsFile = await readJson<RelationsFile>("data_relations.json");
  const phasesFile = await readJson<PhasesFile>("data_phases.json");
  const frequencyFile = await readJson<FrequencyFile>("data_frequency.json");
  const grammarFile = await readJson<GrammarFile>("data_grammar_usage.json");
  const coverageFile = await readJson<CoverageFile>("data_coverage_report.json");

  const termSlugs = new Set<string>();
  const sourceIds = new Set(sourcesFile.sources.map((source) => source.source_id));
  const evidenceIds = new Set(evidenceFile.evidence_items.map((item) => item.evidence_id));

  for (const term of termsFile.terms) {
    pushIf(errors, termSlugs.has(term.slug), `Duplicate term slug: ${term.slug}`);
    termSlugs.add(term.slug);
    pushIf(errors, !VALID_BRANCHES.has(term.branch), `Invalid branch for term ${term.slug}: ${term.branch}`);
    pushIf(errors, !VALID_CONFIDENCE.has(term.confidence_level), `Invalid confidence for term ${term.slug}: ${term.confidence_level}`);
    pushIf(errors, !VALID_DATA_LAYERS.has(term.data_layer), `Invalid data layer for term ${term.slug}: ${term.data_layer}`);
    pushIf(errors, !term.caveat || term.caveat.length < 12, `Term ${term.slug} is missing a useful caveat`);
    pushIf(errors, !term.source_ids.length, `Term ${term.slug} has no source IDs`);
    for (const sourceId of term.source_ids) {
      pushIf(errors, !sourceIds.has(sourceId), `Term ${term.slug} references missing source ${sourceId}`);
    }
    if (term.visual_role === "major_node") {
      pushIf(errors, term.source_ids.length === 0, `Major node ${term.slug} has no source IDs`);
      pushIf(errors, !term.caveat, `Major node ${term.slug} has no caveat`);
    }
    if (term.first_attestation && /^\d{4}$/.test(term.first_attestation) && /unknown|approximate/i.test(term.caveat)) {
      warnings.push(`Term ${term.slug} has exact-looking attestation and vague caveat; review wording.`);
    }
  }

  for (const evidence of evidenceFile.evidence_items) {
    pushIf(errors, !termSlugs.has(evidence.term_slug), `Evidence ${evidence.evidence_id} references missing term ${evidence.term_slug}`);
    pushIf(errors, !sourceIds.has(evidence.source_id), `Evidence ${evidence.evidence_id} references missing source ${evidence.source_id}`);
    pushIf(errors, !VALID_BRANCHES.has(evidence.branch), `Evidence ${evidence.evidence_id} has invalid branch ${evidence.branch}`);
    pushIf(errors, !VALID_CONFIDENCE.has(evidence.confidence_level), `Evidence ${evidence.evidence_id} has invalid confidence ${evidence.confidence_level}`);
    pushIf(errors, !VALID_DATA_LAYERS.has(evidence.data_layer), `Evidence ${evidence.evidence_id} has invalid data layer ${evidence.data_layer}`);
  }

  for (const relation of relationsFile.relations) {
    pushIf(errors, !termSlugs.has(relation.from), `Relation ${relation.relation_id} has missing from term ${relation.from}`);
    pushIf(errors, !termSlugs.has(relation.to), `Relation ${relation.relation_id} has missing to term ${relation.to}`);
    pushIf(errors, !VALID_RELATION_TYPES.has(relation.relation_type), `Relation ${relation.relation_id} has invalid type ${relation.relation_type}`);
    pushIf(errors, !VALID_BRANCHES.has(relation.branch), `Relation ${relation.relation_id} has invalid branch ${relation.branch}`);
    pushIf(errors, !VALID_CONFIDENCE.has(relation.confidence_level), `Relation ${relation.relation_id} has invalid confidence ${relation.confidence_level}`);
    pushIf(errors, !VALID_DATA_LAYERS.has(relation.data_layer), `Relation ${relation.relation_id} has invalid data layer ${relation.data_layer}`);
    for (const evidenceId of relation.evidence_ids) {
      pushIf(errors, !evidenceIds.has(evidenceId), `Relation ${relation.relation_id} references missing evidence ${evidenceId}`);
    }
    for (const sourceId of relation.source_ids) {
      pushIf(errors, !sourceIds.has(sourceId), `Relation ${relation.relation_id} references missing source ${sourceId}`);
    }
  }

  for (const phase of phasesFile.phases) {
    pushIf(errors, !VALID_BRANCHES.has(phase.branch), `Phase ${phase.phase_id} has invalid branch ${phase.branch}`);
    pushIf(errors, !VALID_DATA_LAYERS.has(phase.data_layer), `Phase ${phase.phase_id} has invalid data layer ${phase.data_layer}`);
    for (const termSlug of phase.supporting_term_slugs) {
      pushIf(errors, !termSlugs.has(termSlug), `Phase ${phase.phase_id} references missing term ${termSlug}`);
    }
    for (const sourceId of phase.source_ids) {
      pushIf(errors, !sourceIds.has(sourceId), `Phase ${phase.phase_id} references missing source ${sourceId}`);
    }
  }

  for (const row of [...frequencyFile.series, ...grammarFile.series]) {
    pushIf(errors, !termSlugs.has(row.term_slug) && !["data-are", "data-is", "these-data", "this-data"].includes(row.term_slug), `Frequency row references missing term ${row.term_slug}`);
    pushIf(errors, !VALID_DATA_LAYERS.has(row.data_layer), `Frequency row ${row.term_slug}/${row.corpus} has invalid data layer ${row.data_layer}`);
  }

  for (const row of coverageFile.term_coverage) {
    pushIf(errors, !termSlugs.has(row.term_slug), `Coverage row references missing term ${row.term_slug}`);
    pushIf(errors, !VALID_BRANCHES.has(row.branch), `Coverage row ${row.term_slug} has invalid branch ${row.branch}`);
    pushIf(errors, !VALID_DATA_LAYERS.has(row.data_layer), `Coverage row ${row.term_slug} has invalid data layer ${row.data_layer}`);
    for (const sourceId of row.source_ids) {
      pushIf(errors, !sourceIds.has(sourceId), `Coverage row ${row.term_slug} references missing source ${sourceId}`);
    }
  }

  console.log(`Validated ${termsFile.terms.length} terms.`);
  console.log(`Validated ${sourcesFile.sources.length} sources.`);
  console.log(`Validated ${evidenceFile.evidence_items.length} evidence items.`);
  console.log(`Validated ${relationsFile.relations.length} relations.`);
  console.log(`Warnings: ${warnings.length}`);
  for (const warning of warnings) console.warn(`Warning: ${warning}`);

  if (errors.length) {
    console.error(`Validation failed with ${errors.length} errors:`);
    for (const error of errors) console.error(`- ${error}`);
    process.exit(1);
  }

  console.log("Validation passed.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
