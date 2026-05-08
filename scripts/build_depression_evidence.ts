import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = path.join(process.cwd(), "src", "data", "generated");
const OUT_FILE = path.join(OUT_DIR, "depression_evidence_normalized.json");

type BranchesFile = {
  termRoles: Array<{ term: string; branchIds: string[]; displayRole: string; synonymStatus: string }>;
};

type PrehistoryFile = {
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
    sourceCategory?: string;
    quote?: string;
    verificationStatus: string;
    confidence: string;
    caveat: string;
  }>;
};

type ArchivalFile = {
  snippets: Array<{
    id: string;
    sourceCorpus: string;
    sourceUrl: string;
    title: string;
    author: string;
    year: number;
    matchedTerm: string;
    matchedPhrase: string | null;
    quote: string;
    categoryIds: string[];
    rightsStatus: string;
    evidenceType: string;
    caveat: string;
  }>;
};

type ModernFile = {
  snippets: Array<{
    id: string;
    source: string;
    sourceUrl: string;
    sourceCorpus: string;
    title: string;
    author: string;
    year: number;
    query: string;
    quote: string;
    rightsStatus: string;
    evidenceType: string;
    categoryIds: string[];
    caveat: string;
  }>;
};

type ClinicalFile = {
  meshDescriptors: Array<{
    id: string;
    heading: string;
    uniqueId: string;
    branchId: string;
    yearIntroduced: number | null;
    sourceUrl: string;
    scopeNote: string;
    caveat: string;
  }>;
  pubmed: Array<{
    id: string;
    label: string;
    branchId: string;
    totalCount: number;
    samples: Array<{
      uid: string;
      title: string;
      pubdate: string;
      source: string;
      sourceUrl: string;
      rightsState: string;
    }>;
  }>;
  institutionalDefinitions: Array<{
    id: string;
    source: string;
    sourceUrl: string;
    branchId: string;
    year: number;
    summary: string;
    rightsState: string;
    confidence: string;
  }>;
};

type EconomicFile = {
  chroniclingAmerica: Array<{
    id: string;
    query: string;
    branchId: string;
    samples: Array<{
      id: string;
      title: string;
      year: number | null;
      sourceUrl: string;
      snippet: string;
      branchId: string;
      rightsState: string;
      confidence: string;
    }>;
  }>;
  nber: {
    source: string;
    sourceUrl: string;
    records: Array<{
      id: string;
      label: string;
      peak: string;
      trough: string;
      durationMonths: number;
      branchId: string;
    }>;
  };
};

async function readJson<T>(file: string) {
  return JSON.parse(await readFile(file, "utf8")) as T;
}

function branchFromLegacyCategory(categoryId: string) {
  const map: Record<string, string> = {
    emotional_state: "emotional",
    clinical_psychiatric_condition: "clinical",
    economic_downturn: "economic",
    geographical_topographical: "geographic",
    physical_lowering_pressure: "physical",
    literary_melancholy_sadness_cluster: "melancholy_melancholia",
  };
  return map[categoryId] ?? "emotional";
}

function branchFromSenseBranch(senseBranch: string) {
  const map: Record<string, string> = {
    astronomical_angle: "astronomical",
    emotional_low_state: "emotional",
    physical_lowering_pressure: "physical",
    economic_downturn: "economic",
    meteorological_low_pressure: "meteorological",
    clinical_psychiatric_condition: "clinical",
    literary_melancholy_sadness_cluster: "melancholy_melancholia",
  };
  return map[senseBranch] ?? "emotional";
}

function displayPriority(layer: string, branchTag: string, evidenceType: string) {
  if (layer === "attestation") return 95;
  if (branchTag === "clinical" && layer === "clinical_vocabulary") return 90;
  if (branchTag === "economic" && layer === "economic_context") return 88;
  if (evidenceType === "snippet") return 80;
  return 55;
}

const branches = await readJson<BranchesFile>(path.join(OUT_DIR, "depression_branches.json"));
const prehistory = await readJson<PrehistoryFile>(path.join(OUT_DIR, "depression_prehistory.json"));
const archival = await readJson<ArchivalFile>(path.join(OUT_DIR, "depression_archival_context.json"));
const modern = await readJson<ModernFile>(path.join(OUT_DIR, "depression_modern_context.json"));
const clinical = await readJson<ClinicalFile>(path.join(OUT_DIR, "depression_clinical_vocabulary.json"));
const economic = await readJson<EconomicFile>(path.join(OUT_DIR, "depression_economic_context.json"));

const termRoleByTerm = new Map(branches.termRoles.map((role) => [role.term.toLowerCase(), role]));
const evidence = [];

for (const record of prehistory.records) {
  const branchTag = branchFromSenseBranch(record.senseBranch);
  evidence.push({
    id: `norm-${record.id}`,
    term: record.form,
    year: record.yearApproximation,
    source: record.sourceName,
    sourceLayer: "attestation",
    branchTag,
    snippet: record.quote,
    confidence: record.confidence,
    rightsState: "reference metadata only",
    displayPriority: displayPriority("attestation", branchTag, record.evidenceType),
    evidenceType: record.evidenceType,
    sourceUrl: record.sourceUrl,
    title: record.sourceName,
    author: "",
    caveat: record.caveat,
    relatedRole: termRoleByTerm.get(record.normalizedForm.toLowerCase())?.displayRole ?? "sense-history record",
  });
}

for (const snippet of archival.snippets) {
  const term = snippet.matchedPhrase ?? snippet.matchedTerm;
  const branchTags = snippet.categoryIds.length
    ? Array.from(new Set(snippet.categoryIds.map(branchFromLegacyCategory)))
    : termRoleByTerm.get(term.toLowerCase())?.branchIds ?? ["emotional"];
  for (const branchTag of branchTags) {
    evidence.push({
      id: `norm-${snippet.id}-${branchTag}`,
      term,
      year: snippet.year,
      source: snippet.sourceCorpus,
      sourceLayer: "archival_context",
      branchTag,
      snippet: snippet.quote,
      confidence: "medium",
      rightsState: snippet.rightsStatus,
      displayPriority: displayPriority("archival_context", branchTag, "snippet"),
      evidenceType: snippet.evidenceType,
      sourceUrl: snippet.sourceUrl,
      title: snippet.title,
      author: snippet.author,
      caveat: snippet.caveat,
      relatedRole: termRoleByTerm.get(term.toLowerCase())?.displayRole ?? "archival context candidate",
    });
  }
}

for (const snippet of modern.snippets) {
  const branchTags = snippet.categoryIds.length
    ? Array.from(new Set(snippet.categoryIds.map(branchFromLegacyCategory)))
    : ["modern_public_discourse"];
  for (const branchTag of branchTags) {
    evidence.push({
      id: `norm-${snippet.id}-${branchTag}`,
      term: snippet.query,
      year: snippet.year,
      source: snippet.source,
      sourceLayer: "modern_snapshot",
      branchTag: branchTag === "clinical" ? "modern_public_discourse" : branchTag,
      snippet: snippet.quote,
      confidence: "medium",
      rightsState: snippet.rightsStatus,
      displayPriority: displayPriority("modern_snapshot", branchTag, "snippet"),
      evidenceType: snippet.evidenceType,
      sourceUrl: snippet.sourceUrl,
      title: snippet.title,
      author: snippet.author,
      caveat: snippet.caveat,
      relatedRole: termRoleByTerm.get(snippet.query.toLowerCase())?.displayRole ?? "modern context snapshot",
    });
  }
}

for (const descriptor of clinical.meshDescriptors) {
  evidence.push({
    id: `norm-${descriptor.id}`,
    term: descriptor.heading,
    year: descriptor.yearIntroduced ?? 2026,
    source: "MeSH / NCBI",
    sourceLayer: "clinical_vocabulary",
    branchTag: descriptor.branchId,
    snippet: descriptor.scopeNote,
    confidence: "high",
    rightsState: "reference metadata",
    displayPriority: displayPriority("clinical_vocabulary", descriptor.branchId, "controlled_vocabulary"),
    evidenceType: "controlled_vocabulary",
    sourceUrl: descriptor.sourceUrl,
    title: descriptor.heading,
    author: "National Library of Medicine",
    caveat: descriptor.caveat,
    relatedRole: "clinical vocabulary node",
  });
}

for (const definition of clinical.institutionalDefinitions) {
  evidence.push({
    id: `norm-${definition.id}`,
    term: "depression",
    year: definition.year,
    source: definition.source,
    sourceLayer: "clinical_vocabulary",
    branchTag: definition.branchId,
    snippet: definition.summary,
    confidence: definition.confidence,
    rightsState: definition.rightsState,
    displayPriority: displayPriority("clinical_vocabulary", definition.branchId, "institutional_definition"),
    evidenceType: "institutional_definition",
    sourceUrl: definition.sourceUrl,
    title: definition.source,
    author: definition.source,
    caveat: "Institutional definition; useful for modern framing, not historical prevalence.",
    relatedRole: "modern public-health framing",
  });
}

for (const query of clinical.pubmed) {
  for (const sample of query.samples.slice(0, 4)) {
    const year = Number(String(sample.pubdate ?? "").match(/\d{4}/)?.[0] ?? 2026);
    evidence.push({
      id: `norm-pubmed-${sample.uid}`,
      term: query.label,
      year,
      source: "PubMed",
      sourceLayer: "clinical_bibliography",
      branchTag: query.branchId,
      snippet: String(sample.title ?? ""),
      confidence: "medium",
      rightsState: sample.rightsState,
      displayPriority: 65,
      evidenceType: "bibliographic_metadata",
      sourceUrl: sample.sourceUrl,
      title: String(sample.title ?? ""),
      author: String(sample.source ?? "PubMed"),
      caveat: "PubMed metadata shows biomedical literature visibility, not general usage or prevalence.",
      relatedRole: "clinical bibliography sample",
    });
  }
}

for (const query of economic.chroniclingAmerica) {
  for (const sample of query.samples.slice(0, 8)) {
    evidence.push({
      id: `norm-${sample.id}`,
      term: query.query,
      year: sample.year,
      source: "Chronicling America",
      sourceLayer: "economic_context",
      branchTag: sample.branchId,
      snippet: sample.snippet,
      confidence: sample.confidence,
      rightsState: sample.rightsState,
      displayPriority: displayPriority("economic_context", sample.branchId, "newspaper_metadata"),
      evidenceType: "newspaper_metadata",
      sourceUrl: sample.sourceUrl,
      title: sample.title,
      author: "Library of Congress / newspaper OCR",
      caveat: "Historic newspaper OCR and metadata need human review before quotation display.",
      relatedRole: sample.branchId === "meteorological" ? "weather branch newspaper sample" : "economic branch newspaper sample",
    });
  }
}

for (const cycle of economic.nber.records) {
  evidence.push({
    id: `norm-nber-${cycle.id}`,
    term: cycle.label,
    year: Number(cycle.peak.slice(0, 4)),
    source: "NBER",
    sourceLayer: "economic_context",
    branchTag: cycle.branchId,
    snippet: `${cycle.label}: peak ${cycle.peak}, trough ${cycle.trough}, duration ${cycle.durationMonths} months.`,
    confidence: "high",
    rightsState: "context metadata; attribution required",
    displayPriority: 92,
    evidenceType: "economic_event_marker",
    sourceUrl: economic.nber.sourceUrl,
    title: cycle.label,
    author: "NBER Business Cycle Dating Committee",
    caveat: "Economic event marker, not lexical usage evidence.",
    relatedRole: "economic context marker",
  });
}

const generated = {
  generatedAt: new Date().toISOString(),
  layer: "normalized evidence",
  schema: {
    fields: ["term", "year", "source", "branchTag", "snippet", "confidence", "rightsState", "displayPriority"],
    note:
      "All evidence layers are normalized into one inspectable record format. Branch tags are editorial and confidence-aware.",
  },
  evidence: evidence.sort((a, b) => (a.year ?? 9999) - (b.year ?? 9999) || b.displayPriority - a.displayPriority),
};

await mkdir(OUT_DIR, { recursive: true });
await writeFile(OUT_FILE, `${JSON.stringify(generated, null, 2)}\n`);
console.log(`Wrote ${OUT_FILE}`);
