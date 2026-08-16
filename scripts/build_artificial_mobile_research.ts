import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import { resolve } from "node:path";
import type {
  ArtificialFigureContract,
  ArtificialFinding,
  ArtificialCrossEditionCompatibilityReview,
  ArtificialInputInventoryEntry,
  ArtificialInputRole,
  ArtificialMissingnessState,
  ArtificialMobileResearchArtifact,
  ArtificialNarrativeMovement,
} from "../src/types/artificialMobileResearch.ts";

const ROOT = resolve(import.meta.dirname, "..");
const RESEARCH_ROOT = "docs/research/artificial";
const OUTPUT_ROOT = "docs/research/artificial/mobile-2026-08";
const ARTIFACT_PATH = `${OUTPUT_ROOT}/artificial_mobile_research.json`;
const BACKUP_PATH = `${OUTPUT_ROOT}/artificial_mobile_cleaned_backup.json`;
const FROZEN_INPUT_PATH = `${OUTPUT_ROOT}/artificial_mobile_frozen_inputs.json`;
const MANIFEST_PATH = `${OUTPUT_ROOT}/artificial_raw_data_manifest.json`;
const PREDESIGN_PATH = `${OUTPUT_ROOT}/artificial_mobile_predesign_research_brief.md`;
const GENERATED_PATH = "src/data/generated/artificial_mobile_research.json";
const SCRIPT_PATH = "scripts/build_artificial_mobile_research.ts";
const TYPE_PATH = "src/types/artificialMobileResearch.ts";
const DESKTOP_PUBLISHED_PATH = "src/components/ArtificialPoster.tsx";

const COMPATIBILITY_REVIEW_IDS = {
  "artificial-finding-origin-branches": "artificial-compatibility-01-origin",
  "artificial-finding-compound-registry": "artificial-compatibility-02-systems",
  "artificial-finding-media-registry": "artificial-compatibility-03-experience",
  "artificial-finding-suspicion-transfer": "artificial-compatibility-04-suspicion",
  "artificial-finding-human-continuation": "artificial-compatibility-05-human",
  "artificial-finding-semantic-mobility": "artificial-compatibility-06-semantic-mobility",
} as const;

const HUMAN_EVIDENCE =
  "docs/research/artificial/chart_05_human_continuation/raw/chart_05_source_evidence_raw.csv";

const ORIGIN_ANCHOR_RAW =
  "docs/research/artificial/chart_01_art_artifice/final_gap_check_round_06/raw/round_06_anchor_gap_snippets.csv";
const ORIGIN_NEGATIVE_RAW =
  "docs/research/artificial/chart_01_art_artifice/final_gap_check_round_06/raw/round_06_pre_1828_negative_snippets.csv";
const ORIGIN_DICTIONARY_RAW =
  "docs/research/artificial/chart_01_art_artifice/final_gap_check_round_06/raw/round_06_dictionary_gap_extracts.json";

const SUSPICION_RAW_FILES = [
  "docs/research/artificial/chart_04_suspicion_distance/chart_04a_evidence_hardening_round_04/raw/round_04_1850_1900_snippets.csv",
  "docs/research/artificial/chart_04_suspicion_distance/chart_04a_evidence_hardening_round_04/raw/round_04_1900_1950_snippets.csv",
  "docs/research/artificial/chart_04_suspicion_distance/chart_04a_evidence_hardening_round_04/raw/round_04_1950_2019_transition_snippets.csv",
  "docs/research/artificial/chart_04_suspicion_distance/chart_04a_evidence_hardening_round_04/raw/round_04_2019_2026_modern_snippets.csv",
] as const;

const SEMANTIC_MOBILITY_RAW_FILES = [
  "docs/research/artificial/chart_04_suspicion_distance/chart_04b_semantic_mobility_round_03/raw/round_03_direct_contrast_hardening.csv",
  "docs/research/artificial/chart_04_suspicion_distance/chart_04b_semantic_mobility_round_03/raw/round_03_realistic_bridge_hardening.csv",
  "docs/research/artificial/chart_04_suspicion_distance/chart_04b_semantic_mobility_round_03/raw/round_03_simulated_context_hardening.csv",
] as const;

const SEMANTIC_MOBILITY_ACCESS_LOG =
  "docs/research/artificial/chart_04_suspicion_distance/chart_04b_semantic_mobility_round_03/raw/round_03_source_access_log.csv";

const COMPOUND_RAW_FILES = [
  "docs/research/artificial/chart_03_mechanical_reproduction/raw/chart_06_ngram_raw_sense.csv",
  "docs/research/artificial/chart_03_mechanical_reproduction/raw/chart_06_ngram_raw_material.csv",
  "docs/research/artificial/chart_03_mechanical_reproduction/raw/chart_06_ngram_raw_biological.csv",
  "docs/research/artificial/chart_03_mechanical_reproduction/raw/chart_06_ngram_raw_cognitive.csv",
  "docs/research/artificial/chart_03_mechanical_reproduction/raw/chart_06_ngram_raw_social.csv",
] as const;

const COMPOUND_SUPPLEMENT_RAW_FILES = [
  "docs/research/artificial/chart_03_mechanical_reproduction/raw/chart_06_ngram_raw_social_supplement.csv",
  "docs/research/artificial/chart_03_mechanical_reproduction/raw/chart_06_ngram_raw_cognitive_artificial_supplement.csv",
] as const;

const PHRASE_VOCABULARY_RAW_FILES = [
  ...COMPOUND_RAW_FILES,
  ...COMPOUND_SUPPLEMENT_RAW_FILES,
] as const;

const MEDIA_RAW_FILES = walkMediaRawFiles();

const MEDIA_TERMS = new Map<string, ArtificialMobileResearchArtifact["mediaShift"]["terms"][number]["era"]>([
  ["diorama", "optical_apparatus"],
  ["stereoscope", "optical_apparatus"],
  ["magic lantern", "optical_apparatus"],
  ["phonograph", "sound_and_cinema"],
  ["moving picture", "sound_and_cinema"],
  ["sound film", "sound_and_cinema"],
  ["radio broadcasting", "broadcast"],
  ["television", "broadcast"],
  ["computer graphics", "digital_simulation"],
  ["digital image", "digital_simulation"],
  ["virtual reality", "digital_simulation"],
  ["simulation", "digital_simulation"],
]);

type CsvRow = Record<string, string>;
type NgramPoint = {
  year: number;
  term: string;
  value: number;
  source: string;
  corpus: string;
  smoothing: number;
  caseSensitive: boolean;
  sourcePath: string;
  sourceLine: number;
};

type MobileFrozenInputs = {
  schemaVersion: "1.2.0";
  sourceBoundary: "mobile_raw_to_frozen_input";
  desktopProcessedInputsUsed: false;
  originRecords: Array<{
    id: string;
    claim: string;
    state: "core" | "method" | "caveat" | "excluded";
    status: string;
    evidenceStrength: string;
    source: string;
    risk: string;
    sourcePath: string;
    sourceLine: number | null;
  }>;
  compoundTerms: Array<{ term: string; semanticDomain: string; narrativeRole: string; sourcePath: string }>;
  phraseVocabularyTerms: Array<{ term: string; semanticDomain: string; narrativeRole: string; sourcePath: string }>;
  compoundNgramPoints: NgramPoint[];
  mediaTerms: Array<{ term: string; era: ArtificialMobileResearchArtifact["mediaShift"]["terms"][number]["era"]; narrativeRole: string; sourcePath: string }>;
  mediaNgramPoints: NgramPoint[];
  suspicionAnchors: Array<{
    id: string;
    period: string;
    phrases: string[];
    domain: string;
    negativeCharge: number;
    strength: string;
    source: string;
    sourceType: string;
    sourceUrl: string;
    sourcePath: string;
    sourceLine: number;
  }>;
  semanticMobilityCandidates: Array<{
    id: string;
    relationFamily: "artificial_vs_fake" | "realistic_bridge" | "simulated_context";
    sourceName: string;
    sourceType: string;
    sourceUrl: string;
    yearOrPeriod: string;
    confidence: string;
    shortSummary: string;
    accessStatus: string;
    dateAccessed: string;
    sourcePath: string;
    sourceLine: number;
  }>;
  humanRecords: Array<CsvRow & { sourcePath: string; sourceLine: string }>;
};

function invariant(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function absolute(path: string): string {
  return resolve(ROOT, path);
}

function buffer(path: string): Buffer {
  return readFileSync(absolute(path));
}

function text(path: string): string {
  return readFileSync(absolute(path), "utf8");
}

function sha256(value: string | Buffer): string {
  return createHash("sha256").update(value).digest("hex");
}

function rounded(value: number, digits = 2): number {
  return Number(value.toFixed(digits));
}

function median(values: number[]): number {
  invariant(values.length > 0, "Cannot calculate a median from an empty list");
  const ordered = [...values].sort((a, b) => a - b);
  const middle = Math.floor(ordered.length / 2);
  return ordered.length % 2 === 0 ? (ordered[middle - 1] + ordered[middle]) / 2 : ordered[middle];
}

function parseCsv(value: string): CsvRow[] {
  const records: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let index = 0; index < value.length; index += 1) {
    const character = value[index];
    if (quoted) {
      if (character === '"' && value[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        cell += character;
      }
    } else if (character === '"') {
      quoted = true;
    } else if (character === ",") {
      row.push(cell);
      cell = "";
    } else if (character === "\n") {
      row.push(cell.replace(/\r$/, ""));
      records.push(row);
      row = [];
      cell = "";
    } else {
      cell += character;
    }
  }
  if (cell.length > 0 || row.length > 0) {
    row.push(cell.replace(/\r$/, ""));
    records.push(row);
  }
  const [headers, ...body] = records;
  invariant(headers?.length > 0, "CSV is missing a header row");
  return body.filter((record) => record.some((item) => item !== "")).map((record) => {
    invariant(record.length === headers.length, `CSV row has ${record.length} fields; expected ${headers.length}`);
    return Object.fromEntries(headers.map((header, index) => [header, record[index]]));
  });
}

function csv(path: string): CsvRow[] {
  return parseCsv(text(path));
}

function json<T>(path: string): T {
  return JSON.parse(text(path)) as T;
}

function walk(directory: string): string[] {
  const entries = readdirSync(absolute(directory), { withFileTypes: true });
  return entries.flatMap((entry) => {
    const path = `${directory}/${entry.name}`;
    if (path.startsWith(OUTPUT_ROOT)) return [];
    return entry.isDirectory() ? walk(path) : [path];
  });
}

function walkMediaRawFiles(): string[] {
  return walk("docs/research/artificial/chart_03_mechanical_reproduction/raw")
    .filter((path) => path.includes("chart_03_ngram_raw_") && path.endsWith(".csv"))
    .sort();
}

function roleFor(path: string): ArtificialInputRole {
  if (path.endsWith(".DS_Store")) return "system_excluded";
  if (path.includes("/structure_specification/")) return "legacy_design_excluded";
  if (path.includes("/raw/")) return path.includes("source") ? "source_record" : "raw_capture";
  if (path.includes("/sources/")) return "source_record";
  if (path.includes("/notes/")) return "research_note";
  if (path.includes("/processed/")) return "legacy_processed_excluded";
  if (path.includes("/scripts/")) return "legacy_transform_excluded";
  return "research_note";
}

function lineCountFor(path: string, bytes: Buffer): number | null {
  if (path.endsWith(".DS_Store")) return null;
  return bytes.length === 0 ? 0 : bytes.toString("utf8").split(/\r?\n/).length - (bytes.at(-1) === 10 ? 1 : 0);
}

function buildInventory(activePaths: Set<string>, frozenInputJson: string): ArtificialInputInventoryEntry[] {
  const researchEntries = walk(RESEARCH_ROOT).sort().map((path) => {
    const bytes = buffer(path);
    const role = roleFor(path);
    const activeDependency = activePaths.has(path);
    return {
      path,
      sha256: sha256(bytes),
      bytes: bytes.length,
      lineCount: lineCountFor(path, bytes),
      role,
      activeDependency,
      exclusionReason:
        role === "legacy_design_excluded"
          ? "Historical visual planning is not research authority for the independent mobile edition."
          : role === "system_excluded"
            ? "Operating-system metadata is not research data."
            : role === "legacy_processed_excluded"
              ? "Legacy desktop/prior-research derivation is retained for history but cannot govern the independent mobile research chain."
            : role === "legacy_transform_excluded"
              ? "Legacy transform code is retained for reproducibility history but is excluded from the mobile dependency closure."
            : activeDependency
              ? null
              : "Inventoried for provenance but outside the active dependency closure of this five-movement predesign.",
    } satisfies ArtificialInputInventoryEntry;
  });
  const transforms = [SCRIPT_PATH, TYPE_PATH].map((path) => {
    const bytes = buffer(path);
    return {
      path,
      sha256: sha256(bytes),
      bytes: bytes.length,
      lineCount: lineCountFor(path, bytes),
      role: "transform" as const,
      activeDependency: true,
      exclusionReason: null,
    };
  });
  const frozenInput = {
    path: FROZEN_INPUT_PATH,
    sha256: sha256(frozenInputJson),
    bytes: Buffer.byteLength(frozenInputJson),
    lineCount: frozenInputJson.split("\n").length - 1,
    role: "mobile_frozen_input" as const,
    activeDependency: true,
    exclusionReason: null,
  } satisfies ArtificialInputInventoryEntry;
  return [...researchEntries, ...transforms, frozenInput].sort((a, b) => a.path.localeCompare(b.path));
}

function uniqueTermRows(paths: readonly string[], requiredTerms?: Set<string>): Map<string, CsvRow & { sourcePath: string }> {
  const result = new Map<string, CsvRow & { sourcePath: string }>();
  for (const path of paths) {
    for (const row of csv(path)) {
      if (requiredTerms && !requiredTerms.has(row.term)) continue;
      const existing = result.get(row.term);
      if (existing) {
        invariant(existing.semantic_domain === row.semantic_domain, `${row.term} changed semantic domain across raw rows`);
        invariant(existing.narrative_role === row.narrative_role, `${row.term} changed narrative role across raw rows`);
        continue;
      }
      result.set(row.term, { ...row, sourcePath: path });
    }
  }
  return result;
}

function buildMobileFrozenInputs(): MobileFrozenInputs {
  const originRows: Array<{ row: CsvRow; sourcePath: string; sourceLine: number }> = [
    ...csv(ORIGIN_ANCHOR_RAW).map((row, index) => ({ row, sourcePath: ORIGIN_ANCHOR_RAW, sourceLine: index + 2 })),
    ...csv(ORIGIN_NEGATIVE_RAW).map((row, index) => ({ row, sourcePath: ORIGIN_NEGATIVE_RAW, sourceLine: index + 2 })),
  ];
  const dictionaryRows = json<Array<CsvRow>>(ORIGIN_DICTIONARY_RAW);
  const originState = new Map<string, MobileFrozenInputs["originRecords"][number]["state"]>([
    ["gunter_artificiall_lines", "core"],
    ["webster_1828_lines_checkpoint", "core"],
    ["shakespeare_artificial_tears", "core"],
    ["webster_1828_not_natural_vs_fake", "core"],
    ["webster_1828_day_checkpoint", "method"],
    ["perkins_artificial_day", "caveat"],
    ["johnson_artificial_tears", "caveat"],
    ["etymonline_affected_insincere", "caveat"],
    ["johnson_not_natural_distinct", "caveat"],
    ["johnson_artificial_indirect", "excluded"],
    ["etymonline_negative_senses", "excluded"],
  ]);
  const originRecords: MobileFrozenInputs["originRecords"] = [
    ...originRows.map(({ row, sourcePath, sourceLine }) => ({
      id: row.id,
      claim: row.short_summary,
      state: originState.get(row.id) ?? "excluded",
      status: row.sense,
      evidenceStrength: row.evidence_value,
      source: `${row.source_title} / ${row.source_author}`,
      risk: row.notes,
      sourcePath,
      sourceLine,
    })),
    ...dictionaryRows.filter((row) => originState.has(row.id)).map((row) => ({
      id: row.id,
      claim: row.definition_summary,
      state: originState.get(row.id)!,
      status: row.sense,
      evidenceStrength: row.reliability,
      source: row.source_name,
      risk: row.notes,
      sourcePath: ORIGIN_DICTIONARY_RAW,
      sourceLine: null,
    })),
  ].sort((a, b) => a.id.localeCompare(b.id));
  invariant(originRecords.length === 11, `Expected 11 mobile-adjudicated origin records, found ${originRecords.length}`);

  const compoundRows = uniqueTermRows(COMPOUND_RAW_FILES);
  const compoundTerms = [...compoundRows].map(([term, row]) => ({
    term,
    semanticDomain: row.semantic_domain,
    narrativeRole: row.narrative_role,
    sourcePath: row.sourcePath,
  })).sort((a, b) => a.semanticDomain.localeCompare(b.semanticDomain) || a.term.localeCompare(b.term));
  invariant(compoundTerms.length === 30, `Expected 30 raw-derived compound terms, found ${compoundTerms.length}`);

  const phraseVocabularyRows = uniqueTermRows(PHRASE_VOCABULARY_RAW_FILES);
  const phraseVocabularyTerms = [...phraseVocabularyRows].map(([term, row]) => ({
    term,
    semanticDomain: row.semantic_domain,
    narrativeRole: row.narrative_role,
    sourcePath: row.sourcePath,
  })).filter((row) => row.term.startsWith("artificial "))
    .sort((a, b) => a.semanticDomain.localeCompare(b.semanticDomain) || a.term.localeCompare(b.term));
  invariant(phraseVocabularyTerms.length === 48, `Expected 48 raw-derived artificial-prefix vocabulary terms, found ${phraseVocabularyTerms.length}`);

  const mediaRows = uniqueTermRows(MEDIA_RAW_FILES, new Set(MEDIA_TERMS.keys()));
  const mediaTerms = [...MEDIA_TERMS].map(([term, era]) => {
    const row = mediaRows.get(term);
    invariant(row, `Selected mobile media term ${term} is missing from raw captures`);
    return { term, era, narrativeRole: row.narrative_role, sourcePath: row.sourcePath };
  }).sort((a, b) => a.era.localeCompare(b.era) || a.term.localeCompare(b.term));

  const suspicionSelections = new Map<string, { period: string; negativeCharge: number }>([
    ["r04_1850_001", { period: "1850_1900", negativeCharge: 1 }],
    ["r04_1900_001", { period: "1900_1950", negativeCharge: 2 }],
    ["r04_1950_001", { period: "1950", negativeCharge: 2 }],
    ["r04_1950_002", { period: "1969_1976", negativeCharge: 3 }],
    ["r04_1950_003", { period: "2015", negativeCharge: 3 }],
    ["r04_modern_005", { period: "2021_2024", negativeCharge: 2 }],
    ["r04_modern_001", { period: "2025_2026", negativeCharge: 3 }],
  ]);
  const suspicionAnchors: MobileFrozenInputs["suspicionAnchors"] = [];
  for (const path of SUSPICION_RAW_FILES) {
    csv(path).forEach((row, index) => {
      const selection = suspicionSelections.get(row.id);
      if (!selection) return;
      suspicionAnchors.push({
        id: row.id,
        period: selection.period,
        phrases: row.term_or_phrase.split(";").map((item) => item.trim()).filter(Boolean),
        domain: row.domain,
        negativeCharge: selection.negativeCharge,
        strength: row.confidence,
        source: row.source_name,
        sourceType: row.source_type,
        sourceUrl: row.source_url,
        sourcePath: path,
        sourceLine: index + 2,
      });
    });
  }
  suspicionAnchors.sort((a, b) => a.period.localeCompare(b.period));
  invariant(suspicionAnchors.length === suspicionSelections.size, "A preregistered mobile suspicion anchor is absent from raw inputs");

  const semanticAccessByUrl = new Map(csv(SEMANTIC_MOBILITY_ACCESS_LOG).map((row) => [row.url_or_path, row]));
  const semanticMobilityCandidates: MobileFrozenInputs["semanticMobilityCandidates"] = SEMANTIC_MOBILITY_RAW_FILES.flatMap((path) => {
    const relationFamily: MobileFrozenInputs["semanticMobilityCandidates"][number]["relationFamily"] = path.includes("direct_contrast")
      ? "artificial_vs_fake"
      : path.includes("realistic_bridge")
        ? "realistic_bridge"
        : "simulated_context";
    return csv(path).map((row, index) => {
      const access = semanticAccessByUrl.get(row.source_url);
      return {
        id: row.id,
        relationFamily,
        sourceName: row.source_name,
        sourceType: row.source_type,
        sourceUrl: row.source_url,
        yearOrPeriod: row.year_or_period,
        confidence: row.confidence,
        shortSummary: row.short_summary,
        accessStatus: access?.access_status ?? "unmatched",
        dateAccessed: access?.date_accessed ?? "unavailable",
        sourcePath: path,
        sourceLine: index + 2,
      };
    });
  }).sort((a, b) => a.id.localeCompare(b.id));
  invariant(semanticMobilityCandidates.length === 18, `Expected 18 semantic-mobility candidates, found ${semanticMobilityCandidates.length}`);
  invariant(new Set(semanticMobilityCandidates.map((row) => row.id)).size === 18, "Semantic-mobility candidate IDs are not unique");
  invariant(new Set(semanticMobilityCandidates.map((row) => row.sourceUrl)).size === 15, "Semantic-mobility URL count changed; review the source panel");

  const compoundNgramPoints = readNgramPoints(COMPOUND_RAW_FILES, new Set(compoundTerms.map((row) => row.term)));
  const mediaNgramPoints = readNgramPoints(MEDIA_RAW_FILES, new Set(mediaTerms.map((row) => row.term)));
  const humanRecords = csv(HUMAN_EVIDENCE).map((row, index) => ({
    ...row,
    sourcePath: HUMAN_EVIDENCE,
    sourceLine: String(index + 2),
  }));

  return {
    schemaVersion: "1.2.0",
    sourceBoundary: "mobile_raw_to_frozen_input",
    desktopProcessedInputsUsed: false,
    originRecords,
    compoundTerms,
    phraseVocabularyTerms,
    compoundNgramPoints,
    mediaTerms,
    mediaNgramPoints,
    suspicionAnchors,
    semanticMobilityCandidates,
    humanRecords,
  };
}

function buildPhraseVocabulary(frozen: MobileFrozenInputs) {
  const terms = frozen.phraseVocabularyTerms;
  invariant(new Set(terms.map((row) => row.term)).size === terms.length, "Phrase vocabulary contains duplicate exact terms");
  const domains = [...new Set(terms.map((row) => row.semanticDomain))].sort().map((domain) => {
    const domainTerms = terms.filter((row) => row.semanticDomain === domain);
    return {
      domain,
      termCount: domainTerms.length,
      termNames: domainTerms.map((row) => row.term).sort(),
    };
  });
  invariant(domains.length === 5, `Expected five phrase-vocabulary themes, found ${domains.length}`);
  invariant(domains.reduce((sum, row) => sum + row.termCount, 0) === 48, "Phrase-vocabulary theme totals changed");
  return {
    exactPhraseCount: terms.length,
    domains,
    allowedPublicUse: "equal-mark selected vocabulary map only" as const,
  };
}

function readNgramPoints(paths: readonly string[], requiredTerms?: Set<string>): NgramPoint[] {
  const points: NgramPoint[] = [];
  for (const path of paths) {
    const rows = csv(path);
    rows.forEach((row, index) => {
      if (requiredTerms && !requiredTerms.has(row.term)) return;
      const year = Number(row.year);
      const value = Number(row.value);
      invariant(Number.isInteger(year), `${path}:${index + 2} has an invalid year`);
      invariant(Number.isFinite(value) && value >= 0, `${path}:${index + 2} has an invalid Viewer fraction`);
      invariant(row.corpus === "en", `${path}:${index + 2} does not use the audited en alias`);
      invariant(row.smoothing === "0", `${path}:${index + 2} is not smoothing=0`);
      points.push({
        year,
        term: row.term,
        value,
        source: row.source,
        corpus: row.corpus,
        smoothing: Number(row.smoothing),
        caseSensitive: row.case_sensitive === "true",
        sourcePath: path,
        sourceLine: index + 2,
      });
    });
  }
  return points;
}

function groupByTerm(points: NgramPoint[]): Map<string, NgramPoint[]> {
  const grouped = new Map<string, NgramPoint[]>();
  for (const point of points) grouped.set(point.term, [...(grouped.get(point.term) ?? []), point]);
  for (const rows of grouped.values()) rows.sort((a, b) => a.year - b.year);
  return grouped;
}

function ngramOrder(term: string): number {
  return term.trim().split(/\s+/).length;
}

function ownPeakShape(rows: NgramPoint[]): Array<{
  decade: number;
  percentOfOwnPeak: number | null;
  state: ArtificialMissingnessState;
}> {
  const decadeMeans = Array.from({ length: 22 }, (_, index) => 1800 + index * 10).map((decade) => {
    const decadeRows = rows.filter((row) => row.year >= decade && row.year <= decade + 9);
    const positive = decadeRows.filter((row) => row.value > 0);
    return {
      decade,
      value: positive.length >= 8 ? positive.reduce((sum, row) => sum + row.value, 0) / positive.length : null,
      state: (positive.length >= 8 ? "observed_positive" : "absent_or_suppressed") as ArtificialMissingnessState,
    };
  });
  const maximum = Math.max(...decadeMeans.flatMap((row) => (row.value === null ? [] : [row.value])));
  invariant(Number.isFinite(maximum) && maximum > 0, "Term lacks an eligible decade for own-peak normalization");
  return decadeMeans.map((row) => ({
    decade: row.decade,
    percentOfOwnPeak: row.value === null ? null : rounded((row.value / maximum) * 100),
    state: row.state,
  }));
}

function buildCompoundFamily(frozen: MobileFrozenInputs) {
  const registry = frozen.compoundTerms;
  invariant(registry.length === 30, `Expected 30 mobile-frozen base compounds, found ${registry.length}`);
  const registryByTerm = new Map(registry.map((row) => [row.term, row]));
  const points = frozen.compoundNgramPoints;
  const grouped = groupByTerm(points);
  invariant(grouped.size === registry.length, "Not every registered compound has a raw Viewer series");
  const terms = [...grouped].map(([term, rows]) => {
    const registration = registryByTerm.get(term);
    invariant(registration, `Unregistered compound term ${term}`);
    invariant(rows.length === 221, `${term} should contain 221 yearly rows from 1800 through 2020`);
    invariant(rows[0].year === 1800 && rows.at(-1)!.year === 2020, `${term} year coverage drifted`);
    const positive = rows.filter((row) => row.value > 0);
    invariant(positive.length > 0, `${term} contains no positive Viewer observation`);
    const peak = positive.reduce((best, row) => (row.value > best.value ? row : best), positive[0]);
    const latest = rows.at(-1)!;
    return {
      term,
      ngramOrder: ngramOrder(term),
      domain: registration.semanticDomain,
      peakYear: peak.year,
      peakViewerFraction: peak.value,
      latestYear: latest.year,
      latestViewerFraction: latest.value,
      positiveYearCount: positive.length,
      absentOrSuppressedYearCount: rows.length - positive.length,
      ownPeakDecadeShape: ownPeakShape(rows),
      sourceRows: [`${peak.sourcePath}:${peak.sourceLine}`, `${latest.sourcePath}:${latest.sourceLine}`],
    };
  }).sort((a, b) => a.domain.localeCompare(b.domain) || a.peakYear - b.peakYear || a.term.localeCompare(b.term));
  const domains = [...new Set(terms.map((term) => term.domain))].sort().map((domain) => {
    const domainTerms = terms.filter((term) => term.domain === domain);
    const peakYears = domainTerms.map((term) => term.peakYear);
    return {
      domain,
      termCount: domainTerms.length,
      termNames: domainTerms.map((term) => term.term).sort(),
      earliestPeakYear: Math.min(...peakYears),
      latestPeakYear: Math.max(...peakYears),
      medianPeakYear: rounded(median(peakYears), 1),
      peakYearBins: [
        [1800, 1849], [1850, 1899], [1900, 1949], [1950, 1999], [2000, 2020],
      ].map(([startYear, endYear]) => ({
        startYear,
        endYear,
        termCount: domainTerms.filter((term) => term.peakYear >= startYear && term.peakYear <= endYear).length,
      })),
    };
  });
  return { registeredArtificialPrefixTermCount: terms.length, domains, terms };
}

function buildMediaShift(frozen: MobileFrozenInputs) {
  const grouped = groupByTerm(frozen.mediaNgramPoints);
  invariant(grouped.size === frozen.mediaTerms.length, `Expected ${frozen.mediaTerms.length} selected media series; found ${grouped.size}`);
  const terms = frozen.mediaTerms.map(({ term, era }) => {
    const rows = grouped.get(term)!;
    invariant(rows.length === 220, `${term} should contain 220 yearly rows from 1800 through 2019`);
    const positive = rows.filter((row) => row.value > 0);
    const peak = positive.reduce((best, row) => (row.value > best.value ? row : best), positive[0]);
    return {
      term,
      ngramOrder: ngramOrder(term),
      era,
      peakYear: peak.year,
      firstPositiveYear: positive[0].year,
      positiveYearCount: positive.length,
      sourceRows: [`${positive[0].sourcePath}:${positive[0].sourceLine}`, `${peak.sourcePath}:${peak.sourceLine}`],
    };
  }).sort((a, b) => a.peakYear - b.peakYear || a.term.localeCompare(b.term));
  const eraLabels = new Map([
    ["optical_apparatus", "Optical apparatus"],
    ["sound_and_cinema", "Sound and cinema"],
    ["broadcast", "Broadcast"],
    ["digital_simulation", "Digital simulation"],
  ] as const);
  const eras = [...eraLabels].map(([era, label]) => {
    const eraTerms = terms.filter((term) => term.era === era);
    return { era, label, termCount: eraTerms.length, termNames: eraTerms.map((term) => term.term).sort() };
  });
  invariant(eras.reduce((sum, era) => sum + era.termCount, 0) === terms.length, "Media era registry count drifted");
  return { selectedTermCount: terms.length, eras, terms };
}

function buildOriginEvidence(frozen: MobileFrozenInputs) {
  const publicCoreClaims = frozen.originRecords.filter((row) => row.state === "core").map((row) => ({
    claim: row.claim,
    status: row.status,
    evidenceStrength: row.evidenceStrength,
    source: row.source,
  }));
  const methodologicalBoundaryClaims = frozen.originRecords.filter((row) => row.state === "method").map((row) => ({
    claim: row.claim,
    status: row.status,
    evidenceStrength: row.evidenceStrength,
    source: row.source,
  }));
  const useWithCareClaims = frozen.originRecords.filter((row) => row.state === "caveat").map((row) => ({
    claim: row.claim,
    status: row.status,
    risk: row.risk,
  }));
  const excludedClaims = frozen.originRecords.filter((row) => row.state === "excluded").map((row) => ({
    claim: row.claim,
    status: row.status,
    risk: row.risk,
  }));
  return {
    claimCount: frozen.originRecords.length,
    publicCoreClaims,
    methodologicalBoundaryClaims,
    useWithCareClaims,
    excludedClaims,
    excludedClaimCount: excludedClaims.length,
  };
}

function buildSuspicionTransfer(frozen: MobileFrozenInputs) {
  const anchors = frozen.suspicionAnchors.map(({ sourcePath: _sourcePath, sourceLine: _sourceLine, id: _id, ...anchor }) => anchor);
  invariant(anchors.length === 7, `Expected seven period anchors, found ${anchors.length}`);
  invariant(anchors.every((row) => Number.isInteger(row.negativeCharge)), "Suspicion anchors contain an invalid charge score");
  const modelAssessment = [
    {
      model: "linear_pejoration",
      status: "weak",
      confidence: "medium",
      notes: "The seven source-bound mobile anchors change domain and evidence type; they do not form a population sentiment series.",
    },
    {
      model: "domain_transfer",
      status: "supported_with_limits",
      confidence: "medium",
      notes: "The selected record moves from coloring/adulteration context to absence and reformulation claims, but the curated sample cannot measure prevalence.",
    },
  ];
  return { anchorCount: anchors.length, anchors, modelAssessment };
}

function buildSemanticMobility(frozen: MobileFrozenInputs) {
  const publicViews = new Map<string, { axisLabel: string; title: string; summary: string }>([
    ["f001", {
      axisLabel: "REAL",
      title: "Artificial can still be real.",
      summary: "A textbook uses an artificial tsunami to separate how an event was made from whether it actually happened.",
    }],
    ["f004", {
      axisLabel: "DESIGNED",
      title: "Designed does not mean deceptive.",
      summary: "A laboratory may be artificial because it was arranged, while the choices and outcomes inside it remain real.",
    }],
    ["r001", {
      axisLabel: "REALISTIC",
      title: "Artificial things can become more realistic.",
      summary: "Researchers describe artificial skin that more closely mimics—and looks like—human skin.",
    }],
    ["s001", {
      axisLabel: "SIMULATED",
      title: "Simulation describes an operation.",
      summary: "The FCC describes voice cloning as technology that artificially simulates a human voice.",
    }],
    ["r004", {
      axisLabel: "GENERATED",
      title: "Sounding real does not change the source.",
      summary: "In a listening study, some cloned voices sounded as real and human as recordings, while remaining generated voices.",
    }],
  ]);
  const views = [...publicViews].map(([id, copy]) => {
    const source = frozen.semanticMobilityCandidates.find((row) => row.id === id);
    invariant(source, `Selected semantic-mobility case ${id} is missing`);
    invariant(source.confidence === "high", `Selected semantic-mobility case ${id} is not high-confidence`);
    invariant(source.accessStatus === "accessed", `Selected semantic-mobility case ${id} is not recorded as accessed`);
    return {
      id,
      relationFamily: source.relationFamily,
      ...copy,
      sourceName: source.sourceName,
      sourceType: source.sourceType,
      sourceUrl: source.sourceUrl,
      yearOrPeriod: source.yearOrPeriod,
    };
  });
  invariant(new Set(views.map((row) => row.sourceUrl)).size === views.length, "Semantic-mobility public views must use distinct sources");
  return {
    candidateStatementCount: frozen.semanticMobilityCandidates.length,
    distinctUrlCount: new Set(frozen.semanticMobilityCandidates.map((row) => row.sourceUrl)).size,
    selectedCaseCount: views.length,
    unit: "one selected source-bound semantic case" as const,
    caveat: "The circle connects meanings; distance is not a score.",
    views,
  };
}

function buildHumanContinuation(frozen: MobileFrozenInputs) {
  const evidence = frozen.humanRecords;
  const layerConfig = [
    { layerNumber: 0, id: "definition_family", label: "Definition-family context" },
    { layerNumber: 2, id: "support", label: "Bodily support" },
    { layerNumber: 3, id: "replacement", label: "Functional replacement" },
    { layerNumber: 4, id: "continuation", label: "Reproductive continuation" },
    { layerNumber: 5, id: "simulation", label: "Modeled human processes" },
  ];
  const layers = layerConfig.map((layer) => {
    const rows = evidence.filter((row) => Number(row.primary_layer) === layer.layerNumber);
    const anchorTerms = [...new Set(rows.map((row) => row.term_or_phrase))].sort();
    return {
      ...layer,
      evidenceCount: rows.length,
      confidence: rows.every((row) => row.confidence === "high") ? "high" : "mixed",
      anchorTerms,
    };
  });
  invariant(layers.reduce((sum, layer) => sum + layer.evidenceCount, 0) === evidence.length, "Every frozen human-process record must belong to one mobile layer");
  const visibleEvidence = evidence.filter((row) => Number(row.primary_layer) > 1);
  const evidenceExamples = visibleEvidence.map((row) => ({
    id: row.id,
    term: row.term_or_phrase,
    layerNumber: Number(row.primary_layer),
    functionMode: row.function_mode as "support" | "replacement" | "continuation" | "simulation" | "speculative_extension",
    currentRelevance: row.current_relevance as "modern_established" | "modern_emerging" | "historical" | "speculative",
    confidence: row.confidence as "high" | "medium",
    sourceName: row.source_name,
    sourceType: row.source_type,
    sourceUrl: row.source_url,
    yearOrPeriod: row.year_or_period,
    evidenceKind: row.evidence_kind,
    shortSummary: row.short_summary,
  })).sort((a, b) => a.id.localeCompare(b.id));
  const functionConfig = [
    { id: "support", sourceMode: "support", label: "Bodily support" },
    { id: "replacement", sourceMode: "replacement", label: "Functional replacement" },
    { id: "continuation", sourceMode: "continuation", label: "Reproductive continuation" },
    { id: "modeled_processes", sourceMode: "simulation", label: "Modeled processes" },
    { id: "speculative_extensions", sourceMode: "speculative_extension", label: "Speculative extensions" },
  ] as const;
  const functionGroups = functionConfig.map(({ id, sourceMode, label }) => ({
    id,
    label,
    evidenceCount: evidenceExamples.filter((row) => row.functionMode === sourceMode).length,
  }));
  const evidenceProfile = {
    highConfidenceCount: evidenceExamples.filter((row) => row.confidence === "high").length,
    mediumConfidenceCount: evidenceExamples.filter((row) => row.confidence === "medium").length,
    establishedCount: evidenceExamples.filter((row) => row.currentRelevance === "modern_established").length,
    emergingCount: evidenceExamples.filter((row) => row.currentRelevance === "modern_emerging").length,
    historicalCount: evidenceExamples.filter((row) => row.currentRelevance === "historical").length,
    speculativeCount: evidenceExamples.filter((row) => row.currentRelevance === "speculative").length,
    supportAndReplacementEstablishedCount: evidenceExamples.filter((row) => (row.functionMode === "support" || row.functionMode === "replacement") && row.currentRelevance === "modern_established").length,
    supportAndReplacementCount: evidenceExamples.filter((row) => row.functionMode === "support" || row.functionMode === "replacement").length,
    speculativeExtensionEstablishedCount: evidenceExamples.filter((row) => row.functionMode === "speculative_extension" && row.currentRelevance === "modern_established").length,
    speculativeExtensionCount: evidenceExamples.filter((row) => row.functionMode === "speculative_extension").length,
    maturityByFunction: functionConfig.map(({ label, sourceMode }) => {
      const rows = evidenceExamples.filter((row) => row.functionMode === sourceMode);
      return {
        functionMode: sourceMode,
        label,
        totalCount: rows.length,
        establishedCount: rows.filter((row) => row.currentRelevance === "modern_established").length,
        emergingCount: rows.filter((row) => row.currentRelevance === "modern_emerging").length,
        historicalCount: rows.filter((row) => row.currentRelevance === "historical").length,
        speculativeCount: rows.filter((row) => row.currentRelevance === "speculative").length,
      };
    }),
  };
  invariant(evidenceExamples.length === 25, `Expected 25 visible human-function examples, found ${evidenceExamples.length}`);
  invariant(functionGroups.map((row) => row.evidenceCount).join(",") === "5,5,4,6,5", "Human-function split changed; review the public figure contract");
  invariant(evidenceProfile.highConfidenceCount === 19 && evidenceProfile.mediumConfidenceCount === 6, "Human confidence profile changed; review the public figure contract");
  invariant(evidenceProfile.establishedCount === 16 && evidenceProfile.emergingCount === 5 && evidenceProfile.historicalCount === 1 && evidenceProfile.speculativeCount === 3, "Human relevance profile changed; review the public figure contract");
  invariant(evidenceProfile.supportAndReplacementEstablishedCount === 10 && evidenceProfile.supportAndReplacementCount === 10, "Established support/replacement profile changed; review the public figure contract");
  invariant(evidenceProfile.speculativeExtensionEstablishedCount === 0 && evidenceProfile.speculativeExtensionCount === 5, "Speculative-extension profile changed; review the public figure contract");
  invariant(
    evidenceProfile.maturityByFunction.map((row) => [row.establishedCount, row.emergingCount, row.historicalCount, row.speculativeCount].join("/")).join(",") === "5/0/0/0,5/0/0/0,2/2/0/0,4/1/1/0,0/2/0/3",
    "Human current-use distribution changed; review the public figure contract",
  );
  return {
    evidenceRecordCount: evidence.length,
    markedEvidenceRecordCount: layers.filter((layer) => layer.layerNumber > 1).reduce((sum, layer) => sum + layer.evidenceCount, 0),
    contextRecordCount: layers.find((layer) => layer.layerNumber === 0)?.evidenceCount ?? 0,
    evidenceExamples,
    functionGroups,
    evidenceProfile,
    layers,
  };
}

function buildCrossEditionCompatibility(
  findings: ArtificialFinding[],
): ArtificialMobileResearchArtifact["crossEditionCompatibility"] {
  const desktopPublished = text(DESKTOP_PUBLISHED_PATH);
  const requiredDesktopCopy = [
    "Artificial before fake",
    "manufactured perception, mechanical reproduction, suspicion, semantic distance",
    "Artificial gathers negative charge through returning contexts",
    "without collapsing those relations into one synonym map",
    "artificial starts outside the body as apparatus, then moves through support, replacement, reproduction, and finally human process, voice, and cognition",
  ];
  for (const statement of requiredDesktopCopy) {
    invariant(
      desktopPublished.includes(statement),
      `${DESKTOP_PUBLISHED_PATH} changed a published Artificial conclusion; repeat the cross-edition compatibility review before generating mobile findings: ${statement}`,
    );
  }

  const findingById = new Map(findings.map((finding) => [finding.id, finding]));
  const review = (
    value: Omit<ArtificialCrossEditionCompatibilityReview, "mobileConclusion" | "conflictDetected">,
  ): ArtificialCrossEditionCompatibilityReview => {
    const mobileFinding = findingById.get(value.mobileFindingId);
    invariant(mobileFinding, `Compatibility review ${value.id} references a missing mobile finding`);
    return { ...value, mobileConclusion: mobileFinding.result, conflictDetected: false };
  };

  const reviews: ArtificialCrossEditionCompatibilityReview[] = [
    review({
      id: COMPATIBILITY_REVIEW_IDS["artificial-finding-origin-branches"],
      mobileFindingId: "artificial-finding-origin-branches",
      desktopConclusionId: "desktop-artificial-01-before-fake",
      desktopConclusion: "Artificial begins in artifice, making, and non-natural construction before fake-adjacent readings; not-natural and fake remain distinct.",
      sharedFactScope: "The early semantic branches of artificial and the boundary between made/non-natural and fake/not-genuine.",
      relationship: "compatible_reframing",
      compatibilityRationale: "Both editions preserve making as the earlier basis and reject artificial = fake as an origin claim. Mobile changes the evidence display, not the conclusion.",
      mobileFrameworkDifference: "The mobile edition uses an adjudicated claim-state matrix rather than the desktop semantic chamber.",
      prohibitedMobileClaim: "Do not claim that desktop placed fake at the origin or that the mobile edition overturns the desktop semantic chamber.",
    }),
    review({
      id: COMPATIBILITY_REVIEW_IDS["artificial-finding-compound-registry"],
      mobileFindingId: "artificial-finding-compound-registry",
      desktopConclusionId: "desktop-artificial-02-pressure-and-systems",
      desktopConclusion: "Artificial occupies several linked technical and semantic pressure fields rather than one simple bad/fake meaning.",
      sharedFactScope: "The coexistence of multiple technical, material, sensory, biological, cognitive, and social uses.",
      relationship: "compatible_extension",
      compatibilityRationale: "The mobile registry adds an inventory framework for overlapping systems without changing the desktop account of semantic pressure or asserting a new frequency hierarchy.",
      mobileFrameworkDifference: "The mobile edition asks which preregistered compounds are present by system; desktop follows semantic pressure and spatial relations.",
      prohibitedMobileClaim: "Do not treat registry counts as proof that one mobile system replaces, outranks, or invalidates a desktop semantic field.",
    }),
    review({
      id: COMPATIBILITY_REVIEW_IDS["artificial-finding-media-registry"],
      mobileFindingId: "artificial-finding-media-registry",
      desktopConclusionId: "desktop-artificial-03-manufactured-experience",
      desktopConclusion: "Artificial moves from objects toward manufactured and reproducible experience across apparatus, senses, media, and authenticity pressure.",
      sharedFactScope: "Manufactured perception and reproducible experience vocabulary.",
      relationship: "compatible_reframing",
      compatibilityRationale: "The mobile edition reorganizes selected exact terms into four systems. It does not contradict the desktop movement or claim an alternative invention chronology.",
      mobileFrameworkDifference: "The mobile edition uses an equal-mark vocabulary register; desktop uses a historical reproduction suite.",
      prohibitedMobileClaim: "Do not use the mobile registry to deny the desktop reproduction narrative, infer invention dates, or rank terms by incompatible Viewer magnitudes.",
    }),
    review({
      id: COMPATIBILITY_REVIEW_IDS["artificial-finding-suspicion-transfer"],
      mobileFindingId: "artificial-finding-suspicion-transfer",
      desktopConclusionId: "desktop-artificial-04-suspicion-distance",
      desktopConclusion: "Artificial gathers negative charge in returning contexts while remaining semantically distinct from fake, with suspicion moving through affective, industrial, consumer, and absence-claim domains.",
      sharedFactScope: "Source-bound contexts in which artificial carries suspicion or negative charge.",
      relationship: "compatible_extension",
      compatibilityRationale: "The mobile finding is limited to seven selected anchors and adds a domain-address ledger to the desktop suspicion/distance framework; it does not reject the desktop trajectory.",
      mobileFrameworkDifference: "The mobile edition compares source-bound domain addresses; desktop maps suspicion orbit and semantic distance.",
      prohibitedMobileClaim: "Do not claim the selected anchors disprove the desktop suspicion trajectory or measure a population-wide sentiment trend.",
    }),
    review({
      id: COMPATIBILITY_REVIEW_IDS["artificial-finding-semantic-mobility"],
      mobileFindingId: "artificial-finding-semantic-mobility",
      desktopConclusionId: "desktop-artificial-04b-semantic-distance",
      desktopConclusion: "Artificial, real, fake, realistic, and simulated remain related but non-identical semantic relations.",
      sharedFactScope: "The boundary between made/artificial, fake, real outcomes, realism, and simulation.",
      relationship: "compatible_extension",
      compatibilityRationale: "The five mobile cases make the existing non-collapse boundary readable without calculating a semantic distance or contradicting the desktop relation map.",
      mobileFrameworkDifference: "The mobile edition uses five fixed source cases in a circular touch field; desktop uses a broader semantic-distance framework.",
      prohibitedMobileClaim: "Do not treat circle distance as a score or claim that five selected cases measure the prevalence of any meaning.",
    }),
    review({
      id: COMPATIBILITY_REVIEW_IDS["artificial-finding-human-continuation"],
      mobileFindingId: "artificial-finding-human-continuation",
      desktopConclusionId: "desktop-artificial-05-human-boundary",
      desktopConclusion: "Artificial enters human-related territory through support, replacement, reproduction, voice, presence, and cognition.",
      sharedFactScope: "Bodily support, replacement, reproduction, and modeled human-process evidence.",
      relationship: "compatible_reframing",
      compatibilityRationale: "The same compatible branches remain visible, but mobile groups retained records by function and explicitly avoids claiming that record counts prove a transition sequence.",
      mobileFrameworkDifference: "The mobile edition presents functional evidence layers; desktop presents a layered human-boundary progression.",
      prohibitedMobileClaim: "Do not claim that mobile record counts reverse the desktop human-boundary conclusion or prove a different historical sequence.",
    }),
  ];

  invariant(new Set(reviews.map((item) => item.id)).size === reviews.length, "Compatibility review IDs must be unique");
  invariant(reviews.every((item) => item.conflictDetected === false), "A conflicting mobile conclusion cannot be published");
  return {
    policy: "independent_framework_compatible_conclusions",
    desktopResearchAuthorityForMobileDerivation: false,
    desktopPublishedSnapshot: [{ path: DESKTOP_PUBLISHED_PATH, sha256: sha256(buffer(DESKTOP_PUBLISHED_PATH)) }],
    reviewedProductionFindingCount: reviews.length,
    conflictCount: 0,
    publicationRule: "Mobile may use a different question, method, narrative, and visual framework, but conclusions that overlap a desktop fact scope must remain compatible. Apparent conflict requires narrower scope, an explicit method boundary, or a blocked finding—not a claim that desktop is wrong.",
    reviews,
  };
}

function buildNarrative(
  origin: ReturnType<typeof buildOriginEvidence>,
  phraseVocabulary: ReturnType<typeof buildPhraseVocabulary>,
  compounds: ReturnType<typeof buildCompoundFamily>,
  media: ReturnType<typeof buildMediaShift>,
  suspicion: ReturnType<typeof buildSuspicionTransfer>,
  semanticMobility: ReturnType<typeof buildSemanticMobility>,
  human: ReturnType<typeof buildHumanContinuation>,
) {
  const findings: ArtificialFinding[] = [
    {
      id: "artificial-finding-origin-branches",
      question: "Did artificial begin as a synonym for fake?",
      result: `${origin.publicCoreClaims.length} core public-use claims support an earlier art, skill, making and technical-rule history. Fake/not-genuine is a coexisting branch, not the origin claim.`,
      rawFields: ["claim", "status", "strongest_sources", "evidence_strength", "can_use_in_chart_01"],
      filters: ["yes = core", "yes_with_care = caveated", "notes_only/no = excluded"],
      grouping: "claim × adjudicated public-use state",
      denominator: `${origin.claimCount} adjudicated claims`,
      transform: "Preserve one equal cell per claim and its source-bound state.",
      unit: "adjudicated claim",
      caveat: "Exact earliest-use claims remain blocked without direct OED evidence.",
      sourceRows: [
        `${FROZEN_INPUT_PATH} → originRecords`,
        `${ORIGIN_ANCHOR_RAW} → retained exact records`,
        `${ORIGIN_NEGATIVE_RAW} → retained exact records`,
        `${ORIGIN_DICTIONARY_RAW} → retained exact records`,
      ],
      contractIds: ["artificial-contract-01-origin-matrix"],
    },
    {
      id: "artificial-finding-compound-registry",
      question: "How broadly does the selected artificial-prefix vocabulary branch across meaning?",
      result: `${phraseVocabulary.exactPhraseCount} exact phrases containing artificial occupy ${phraseVocabulary.domains.length} selected meaning themes.`,
      rawFields: ["term", "semantic_domain", "narrative_role"],
      filters: ["exact artificial-prefix rows from the five base captures and two vocabulary supplements", "no Viewer values", "no inferred chronology"],
      grouping: "semantic_domain × exact term",
      denominator: `${phraseVocabulary.exactPhraseCount} selected exact phrases`,
      transform: "Deduplicate exact phrase labels, group them by semantic_domain, and sort their labels.",
      unit: "selected exact phrase",
      caveat: "Vocabulary coverage is a selected study map, not population prevalence or frequency.",
      sourceRows: [
        `${FROZEN_INPUT_PATH} → phraseVocabularyTerms`,
        ...PHRASE_VOCABULARY_RAW_FILES.map((path) => `${path} → exact artificial-prefix term rows`),
      ],
      contractIds: ["artificial-contract-02-compound-registry"],
    },
    {
      id: "artificial-finding-compound-viewer-blocked",
      question: "Do the registered compounds form a quantitative time sequence?",
      result: "The available Viewer captures cannot support a production quantitative field because the corpus alias is unpinned.",
      rawFields: ["year", "term", "value", "corpus", "smoothing"],
      filters: ["exact term equality", "1800–2020 rows"],
      grouping: "term × year",
      denominator: "Google Viewer normalized fraction by n-gram order",
      transform: "No production transform authorized.",
      unit: "incomparable Viewer fraction",
      caveat: "Cross-order comparison and silent zero conversion are prohibited.",
      sourceRows: COMPOUND_RAW_FILES.map((path) => `${path} → exact yearly rows`),
      contractIds: ["artificial-contract-02-viewer-shape-blocked"],
    },
    {
      id: "artificial-finding-media-registry",
      question: "Which manufactured-experience vocabulary is registered for the mobile study?",
      result: `${media.selectedTermCount} exact registered terms are grouped into ${media.eras.length} curated systems: optical apparatus, sound/cinema, broadcast and digital simulation.`,
      rawFields: ["term", "query_group", "narrative_role", "curated era"],
      filters: ["12 exact preregistered media terms", "no Viewer magnitudes", "no inferred dates"],
      grouping: "curated system × exact term",
      denominator: `${media.selectedTermCount} selected exact terms`,
      transform: "Validate every selected term against the registry and assign one equal record mark to its preregistered system.",
      unit: "registered exact media term",
      caveat: "The four systems organize the selected vocabulary; they are not an invention chronology.",
      sourceRows: [
        `${FROZEN_INPUT_PATH} → mediaTerms`,
        ...MEDIA_RAW_FILES.map((path) => `${path} → selected exact term rows`),
      ],
      contractIds: ["artificial-contract-03-media-registry"],
    },
    {
      id: "artificial-finding-media-viewer-blocked",
      question: "Can media terms be placed on a production quantitative chronology?",
      result: "The current Viewer capture cannot authorize a production chronology because its release is not pinned.",
      rawFields: ["year", "term", "value"],
      filters: ["exact selected terms"],
      grouping: "term × year",
      denominator: "Google Viewer normalized fraction by n-gram order",
      transform: "No production transform authorized.",
      unit: "incomparable Viewer fraction",
      caveat: "Do not infer invention dates, popularity or cross-order magnitude.",
      sourceRows: media.terms.flatMap((term) => term.sourceRows),
      contractIds: ["artificial-contract-03-viewer-chronology-blocked"],
    },
    {
      id: "artificial-finding-suspicion-transfer",
      question: "Where does suspicion attach within the mobile edition's selected source record?",
      result: `${suspicion.anchorCount} dated examples place distrust in several source settings between 1850 and 2026; they do not form a population trend.`,
      rawFields: ["period", "phrases", "source", "sourceType", "domain", "strength"],
      filters: ["seven frozen dated examples", "show source setting and source-support label"],
      grouping: "period × source setting",
      denominator: `${suspicion.anchorCount} dated source examples`,
      transform: "Preserve one equal source example per selected ID; draw labelled ranges as ranges and exact years as points on the 1850–2026 reading axis.",
      unit: "dated source example",
      caveat: "Selected examples are not a population sentiment series; approximate periods remain approximate.",
      sourceRows: [
        `${FROZEN_INPUT_PATH} → suspicionAnchors + mobile model assessment`,
        ...SUSPICION_RAW_FILES.map((path) => `${path} → retained exact record IDs`),
      ],
      contractIds: ["artificial-contract-04-suspicion-terminal"],
    },
    {
      id: "artificial-finding-semantic-mobility",
      question: "Does artificial mean fake, unreal, or merely made?",
      result: "Five fully accessed source cases show that something can be artificial and still real, realistic, or simulated without becoming fake.",
      rawFields: ["id", "relation family", "source_name", "source_type", "source_url", "year_or_period", "short_summary", "access_status"],
      filters: ["five preregistered IDs", "high confidence", "accessed source", "distinct source URL"],
      grouping: "one fixed semantic case per circular view",
      denominator: `${semanticMobility.selectedCaseCount} selected source-bound semantic cases`,
      transform: "Select the five preregistered accessed IDs, strip internal confidence and review notes, and preserve one equal case per fixed view.",
      unit: semanticMobility.unit,
      caveat: semanticMobility.caveat,
      sourceRows: [
        `${FROZEN_INPUT_PATH} → semanticMobilityCandidates`,
        ...SEMANTIC_MOBILITY_RAW_FILES.map((path) => `${path} → selected exact IDs`),
        `${SEMANTIC_MOBILITY_ACCESS_LOG} → access verification`,
      ],
      contractIds: ["artificial-contract-04b-semantic-sphere"],
    },
    {
      id: "artificial-finding-human-continuation",
      question: "Which bodily and human-process branches are retained in the mobile source record?",
      result: `${human.markedEvidenceRecordCount} source examples divide into five function groups: 5 support, 5 replacement, 4 continuation, 6 modeled processes and 5 speculative extensions.`,
      rawFields: ["id", "primary_layer", "function_mode", "term_or_phrase", "current_relevance", "confidence", "source_type", "source_name", "short_summary", "source_url"],
      filters: ["25 frozen evidence examples", "exclude the single layer-0 definition context from the plotted denominator"],
      grouping: "function mode × source example",
      denominator: `${human.markedEvidenceRecordCount} source examples`,
      transform: "Map each retained ID to one equal mark; group by function_mode; retain current relevance and source support for alternate readings.",
      unit: "selected source example",
      caveat: "Evidence coverage is not historical importance, sequence, or a transition claim; speculative extensions remain separate from modeled processes.",
      sourceRows: [`${FROZEN_INPUT_PATH} → humanRecords`, `${HUMAN_EVIDENCE} → all raw records`],
      contractIds: ["artificial-contract-05-human-segment-field"],
    },
  ];

  const contract = (
    id: string,
    movementId: string,
    order: 1 | 2 | 3 | 4 | 5,
    title: string,
    finding: ArtificialFinding,
    options: Pick<ArtificialFigureContract, "recordGranularityAndN" | "visualChannelMapping" | "validInterpretation" | "prohibitedInterpretation" | "missingnessPolicy" | "sourceAndRightsBoundary" | "referenceMapping" | "interactionContract" | "productionEligible" | "blocker">,
  ): ArtificialFigureContract => ({
    id, movementId, order, title, findingId: finding.id, researchQuestion: finding.question,
    sourceFilesAndFields: finding.sourceRows, recordGranularityAndN: options.recordGranularityAndN,
    filters: finding.filters, grouping: finding.grouping, denominator: finding.denominator,
    formula: finding.transform, unit: finding.unit, visualChannelMapping: options.visualChannelMapping,
    validInterpretation: options.validInterpretation, prohibitedInterpretation: options.prohibitedInterpretation,
    missingnessPolicy: options.missingnessPolicy, sourceAndRightsBoundary: options.sourceAndRightsBoundary,
    referenceMapping: options.referenceMapping, interactionContract: options.interactionContract,
    crossEditionCompatibilityReviewId: (COMPATIBILITY_REVIEW_IDS as Record<string, string>)[finding.id] ?? null,
    productionEligible: options.productionEligible, blocker: options.blocker,
  });

  const contracts: ArtificialFigureContract[] = [
    contract("artificial-contract-01-origin-matrix", "movement-01-made-before-fake", 1, "Made before fake", findings[0], {
      recordGranularityAndN: `${origin.claimCount} adjudicated claims`,
      visualChannelMapping: ["claim → one equal cell", "state → solid/outlined/hatched/dim", "claim wording → local ledger"],
      validInterpretation: findings[0].result,
      prohibitedInterpretation: ["exact first-use date", "blank equals absence"],
      missingnessPolicy: "Excluded claims remain visible as excluded states, never zero.",
      sourceAndRightsBoundary: "Claim summaries and provenance only.",
      referenceMapping: "Reference 5 dot matrix plus Reference 6 terminal surface.",
      interactionContract: "Native details expose claim/source text; no flip card.", productionEligible: true, blocker: null,
    }),
    contract("artificial-contract-02-compound-registry", "movement-02-compound-family", 2, "A family of systems", findings[1], {
      recordGranularityAndN: `${phraseVocabulary.exactPhraseCount} exact phrase rows in ${phraseVocabulary.domains.length} meaning themes`,
      visualChannelMapping: ["exact phrase → one equal circle", "meaning theme → one fixed branch view", "term count → directly labelled circle count"],
      validInterpretation: findings[1].result,
      prohibitedInterpretation: ["frequency", "chronology", "domain prevalence"],
      missingnessPolicy: "Only selected exact phrases are marks; unselected phrases are out_of_scope, not zero.",
      sourceAndRightsBoundary: "Repository raw term labels and the deterministic mobile grouping transform only.",
      referenceMapping: "Reference 12: one dense, circular, branching terminal field without detached cards.",
      interactionContract: "One horizontal touch gesture moves exactly one fixed theme and changes the persistent term list; vertical touch continues the page; no hover or free camera.", productionEligible: true, blocker: null,
    }),
    contract("artificial-contract-02-viewer-shape-blocked", "movement-02-compound-family", 2, "Compound Viewer shape — blocked", findings[2], {
      recordGranularityAndN: `${compounds.terms.length} exact series`, visualChannelMapping: [],
      validInterpretation: "No production interpretation.", prohibitedInterpretation: ["all quantitative rendering"],
      missingnessPolicy: "Blocked inputs never become rendered zeros.", sourceAndRightsBoundary: "Unpinned Viewer alias.",
      referenceMapping: "None until release repair.", interactionContract: "Not rendered.", productionEligible: false,
      blocker: "Pin and re-freeze the Google Books release before quantitative use.",
    }),
    contract("artificial-contract-03-media-registry", "movement-03-manufactured-experience", 3, "Manufactured experience register", findings[3], {
      recordGranularityAndN: `${media.selectedTermCount} exact terms in ${media.eras.length} curated systems`,
      visualChannelMapping: ["exact term → one equal terminal block", "curated system → one audio-log band", "term label → direct local text"],
      validInterpretation: findings[3].result, prohibitedInterpretation: ["chronology", "frequency", "invention order"],
      missingnessPolicy: "Unselected terms are out_of_scope, not zero.", sourceAndRightsBoundary: "Repository media-term registry only.",
      referenceMapping: "Reference 8: vertically partitioned audio-log fields and equal signal blocks.",
      interactionContract: "Native details disclose the exact selected vocabulary; no flip card.", productionEligible: true, blocker: null,
    }),
    contract("artificial-contract-03-viewer-chronology-blocked", "movement-03-manufactured-experience", 3, "Media Viewer chronology — blocked", findings[4], {
      recordGranularityAndN: `${media.terms.length} exact series`, visualChannelMapping: [],
      validInterpretation: "No production interpretation.", prohibitedInterpretation: ["all quantitative chronology rendering"],
      missingnessPolicy: "Blocked inputs never become rendered zeros.", sourceAndRightsBoundary: "Unpinned Viewer alias.",
      referenceMapping: "None until release repair.", interactionContract: "Not rendered.", productionEligible: false,
      blocker: "Pin and re-freeze the Google Books release before quantitative use.",
    }),
    contract("artificial-contract-04-suspicion-terminal", "movement-04-suspicion-transfer", 4, "Suspicion changes address", findings[5], {
      recordGranularityAndN: `${suspicion.anchorCount} dated source examples`,
      visualChannelMapping: ["example → one labelled row", "period range → horizontal range with two endpoints", "exact year → one circular point", "selected row → matching highlighted interval on the shared axis"],
      validInterpretation: findings[5].result, prohibitedInterpretation: ["sentiment index", "causal trend"],
      missingnessPolicy: "Periods without retained anchors are unavailable, not zero.", sourceAndRightsBoundary: "Curated source metadata and short phrases.",
      referenceMapping: "References 3 and 6: edge-to-edge terminal grid and dense source telemetry.",
      interactionContract: "Native details reveal source boundaries; no flip card.", productionEligible: true, blocker: null,
    }),
    contract("artificial-contract-04b-semantic-sphere", "movement-04b-semantic-mobility", 5, "Made, real, or fake", findings[6], {
      recordGranularityAndN: `${semanticMobility.selectedCaseCount} equal source-bound semantic cases from ${semanticMobility.candidateStatementCount} reviewed statements`,
      visualChannelMapping: ["selected source case → one equal circular mark", "fixed view → one 72-degree turn", "active case → red highlight and persistent public summary", "depth → orientation only"],
      validInterpretation: findings[6].result,
      prohibitedInterpretation: ["semantic-distance score", "frequency", "chronology", "confidence ranking"],
      missingnessPolicy: "Only the five accessed preregistered cases become public marks; all other candidates remain out_of_scope for this figure.",
      sourceAndRightsBoundary: "Project-authored short summaries and source metadata only; no source text is reproduced.",
      referenceMapping: "Circular terminal field from the supplied Artificial instrument reference, using only equal circular marks.",
      interactionContract: "One horizontal touch gesture turns exactly 72 degrees to the next fixed case and replaces the persistent summary; vertical touch continues the page; no hover or free camera.",
      productionEligible: true,
      blocker: null,
    }),
    contract("artificial-contract-05-human-segment-field", "movement-05-human-continuation", 5, "Into human processes", findings[7], {
      recordGranularityAndN: `${human.markedEvidenceRecordCount} evidence examples in ${human.functionGroups.length} function-mode groups, plus one unplotted definition context`,
      visualChannelMapping: ["source example → one equal circle", "function mode → one labelled orbit/fill", "current relevance and source support → two alternate fill readings", "selected ID → visible term, summary and source link"],
      validInterpretation: findings[7].result, prohibitedInterpretation: ["importance ranking", "inevitable endpoint"],
      missingnessPolicy: "Background and speculative edges remain named but unquantified.", sourceAndRightsBoundary: "Source metadata and short summaries only.",
      referenceMapping: "References 7 and 8: black dashboard rows plus audio-terminal segment field.",
      interactionContract: "Single-axis turn separates overlapping marks; choosing a circle reveals its term, function, status, source support, summary and source link; no flip card.", productionEligible: true, blocker: null,
    }),
  ];

  const movements: ArtificialNarrativeMovement[] = [
    { id: "movement-01-made-before-fake", order: 1, workingTitle: "Made before fake", publicQuestion: findings[0].question,
      oneSentenceFinding: findings[0].result, figureContractId: contracts[0].id, requiredReference: "artificial-reference-05-dot-matrix + artificial-reference-06-full-screen-terminal",
      visualGrammar: "Terminal evidence matrix.", interaction: "Native source disclosure.", flipCardsProhibited: true, status: "supported" },
    { id: "movement-02-compound-family", order: 2, workingTitle: "A family of systems", publicQuestion: findings[1].question,
      oneSentenceFinding: findings[1].result, figureContractId: contracts[1].id, requiredReference: "artificial-reference-01-pixel-equalizer + artificial-reference-07-modular-black-dashboard",
      visualGrammar: "Modular black dashboard with equal registry pixels.", interaction: "Native domain disclosures.", flipCardsProhibited: true, status: "supported" },
    { id: "movement-03-manufactured-experience", order: 3, workingTitle: "Experience becomes engineered", publicQuestion: findings[3].question,
      oneSentenceFinding: findings[3].result, figureContractId: contracts[3].id, requiredReference: "artificial-reference-08-audio-terminal",
      visualGrammar: "Audio-log terminal bands with equal term signals.", interaction: "Native vocabulary disclosures.", flipCardsProhibited: true, status: "supported" },
    { id: "movement-04-suspicion-transfer", order: 4, workingTitle: "Suspicion changes address", publicQuestion: findings[5].question,
      oneSentenceFinding: findings[5].result, figureContractId: contracts[5].id, requiredReference: "artificial-reference-03-terminal-grid + artificial-reference-06-full-screen-terminal",
      visualGrammar: "Dense period × domain terminal ledger.", interaction: "Native source disclosures.", flipCardsProhibited: true, status: "supported" },
    { id: "movement-04b-semantic-mobility", order: 5, workingTitle: "Made, real, or fake", publicQuestion: findings[6].question,
      oneSentenceFinding: findings[6].result, figureContractId: contracts[6].id, requiredReference: "artificial-reference-06-full-screen-terminal",
      visualGrammar: "Circular semantic field with five fixed source cases.", interaction: "One fixed touch turn per source case.", flipCardsProhibited: true, status: "supported" },
    { id: "movement-05-human-continuation", order: 5, workingTitle: "Into human processes", publicQuestion: findings[7].question,
      oneSentenceFinding: findings[7].result, figureContractId: contracts[7].id, requiredReference: "artificial-reference-07-modular-black-dashboard + artificial-reference-08-audio-terminal",
      visualGrammar: "Layered segment dashboard.", interaction: "Native layer disclosures.", flipCardsProhibited: true, status: "supported" },
  ];
  return { findings, contracts, movements };
}

function stableJson(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function writeOrCheck(path: string, content: string, checkMode: boolean): void {
  const target = absolute(path);
  if (checkMode) {
    invariant(existsSync(target), `${path} is missing`);
    invariant(readFileSync(target, "utf8") === content, `${path} is stale; run npm run data:artificial:mobile:research`);
    return;
  }
  mkdirSync(resolve(target, ".."), { recursive: true });
  writeFileSync(target, content, "utf8");
}

function validatePredesignBrief(): void {
  invariant(existsSync(absolute(PREDESIGN_PATH)), `${PREDESIGN_PATH} is missing`);
  const brief = text(PREDESIGN_PATH);
  const requiredStatements = [
    "Mobile research, data selection, analysis, transforms, narrative, and visualization are independent.",
    "Desktop findings and processed tables are not research authority and do not enter the active dependency closure.",
    "Independent does not mean contradictory.",
    "Apparent conflict requires a narrower claim, an explicit method boundary, or a blocked mobile finding",
    "34 raw/source inputs, two mobile transform/type files, and one mobile frozen-input artifact",
    "without importing the legacy transition table or inferring edges",
    "Flip cards:** prohibited for every movement",
  ];
  for (const statement of requiredStatements) {
    invariant(brief.includes(statement), `${PREDESIGN_PATH} lost required mobile-independence statement: ${statement}`);
  }
  invariant(!brief.includes("transition edges are retained"), `${PREDESIGN_PATH} still treats legacy transition edges as mobile research authority`);
}

function build() {
  validatePredesignBrief();
  const frozenInputs = buildMobileFrozenInputs();
  const frozenInputJson = stableJson(frozenInputs);
  const originEvidence = buildOriginEvidence(frozenInputs);
  const phraseVocabulary = buildPhraseVocabulary(frozenInputs);
  const compoundFamily = buildCompoundFamily(frozenInputs);
  const mediaShift = buildMediaShift(frozenInputs);
  const suspicionTransfer = buildSuspicionTransfer(frozenInputs);
  const semanticMobility = buildSemanticMobility(frozenInputs);
  const humanContinuation = buildHumanContinuation(frozenInputs);
  const researchCoverage = {
    selectedTermCount: frozenInputs.compoundTerms.length + frozenInputs.mediaTerms.length,
    retainedTermYearCellCount: frozenInputs.compoundNgramPoints.length + frozenInputs.mediaNgramPoints.length,
    compoundTermCount: frozenInputs.compoundTerms.length,
    compoundTermYearCellCount: frozenInputs.compoundNgramPoints.length,
    compoundYearCoverage: {
      start: Math.min(...frozenInputs.compoundNgramPoints.map((row) => row.year)),
      end: Math.max(...frozenInputs.compoundNgramPoints.map((row) => row.year)),
    },
    mediaTermCount: frozenInputs.mediaTerms.length,
    mediaTermYearCellCount: frozenInputs.mediaNgramPoints.length,
    mediaYearCoverage: {
      start: Math.min(...frozenInputs.mediaNgramPoints.map((row) => row.year)),
      end: Math.max(...frozenInputs.mediaNgramPoints.map((row) => row.year)),
    },
    unit: "one selected exact term in one retained year" as const,
    allowedPublicUse: "method footprint only" as const,
  };
  const compoundCoverageKeys = new Set(frozenInputs.compoundNgramPoints.map((row) => `${row.term}\u0000${row.year}`));
  const mediaCoverageKeys = new Set(frozenInputs.mediaNgramPoints.map((row) => `${row.term}\u0000${row.year}`));
  invariant(
    compoundCoverageKeys.size === frozenInputs.compoundNgramPoints.length && mediaCoverageKeys.size === frozenInputs.mediaNgramPoints.length,
    "Selected method footprint contains duplicate term-year cells",
  );
  invariant(
    researchCoverage.selectedTermCount === 42 && researchCoverage.retainedTermYearCellCount === 9_270 && researchCoverage.compoundTermYearCellCount === 6_630 && researchCoverage.mediaTermYearCellCount === 2_640,
    "Selected term-year method footprint changed; review its public chart and caveat",
  );
  const narrative = buildNarrative(originEvidence, phraseVocabulary, compoundFamily, mediaShift, suspicionTransfer, semanticMobility, humanContinuation);
  const crossEditionCompatibility = buildCrossEditionCompatibility(narrative.findings);

  const productionContracts = narrative.contracts.filter((contract) => contract.productionEligible);
  invariant(
    productionContracts.every((contract) => contract.crossEditionCompatibilityReviewId !== null),
    "Every production-eligible Artificial contract requires a cross-edition compatibility review",
  );
  invariant(
    productionContracts.every((contract) => crossEditionCompatibility.reviews.some((review) => review.id === contract.crossEditionCompatibilityReviewId)),
    "Every production-eligible Artificial contract must resolve to a cross-edition compatibility review",
  );
  invariant(
    narrative.contracts.filter((contract) => !contract.productionEligible).every((contract) => contract.crossEditionCompatibilityReviewId === null),
    "Blocked analytical candidates must not masquerade as reviewed production conclusions",
  );

  const activePaths = new Set<string>([
    ORIGIN_ANCHOR_RAW,
    ORIGIN_NEGATIVE_RAW,
    ORIGIN_DICTIONARY_RAW,
    HUMAN_EVIDENCE,
    ...COMPOUND_RAW_FILES,
    ...COMPOUND_SUPPLEMENT_RAW_FILES,
    ...MEDIA_RAW_FILES,
    ...SUSPICION_RAW_FILES,
    ...SEMANTIC_MOBILITY_RAW_FILES,
    SEMANTIC_MOBILITY_ACCESS_LOG,
  ]);
  const inventory = buildInventory(activePaths, frozenInputJson);
  const activeLegacyProcessed = inventory.filter((entry) => entry.activeDependency && (entry.role === "legacy_processed_excluded" || entry.role === "legacy_transform_excluded"));
  invariant(activeLegacyProcessed.length === 0, `Legacy processed inputs entered the mobile dependency closure: ${activeLegacyProcessed.map((entry) => entry.path).join(", ")}`);
  const inputSetSha256 = sha256(inventory.map((entry) => `${entry.path}:${entry.sha256}`).join("\n"));
  const manifestSummary = {
    inventoriedFileCount: inventory.length,
    activeDependencyCount: inventory.filter((entry) => entry.activeDependency).length,
    rawCaptureCount: inventory.filter((entry) => entry.role === "raw_capture").length,
    mobileFrozenInputCount: inventory.filter((entry) => entry.role === "mobile_frozen_input").length,
    legacyProcessedExcludedCount: inventory.filter((entry) => entry.role === "legacy_processed_excluded").length,
    legacyDesignExcludedCount: inventory.filter((entry) => entry.role === "legacy_design_excluded").length,
    inputSetSha256,
  };

  const referenceRegistry: ArtificialMobileResearchArtifact["referenceRegistry"] = [
    {
      id: "artificial-reference-01-pixel-equalizer",
      suppliedPath: "conversation attachment codex-clipboard-a841d0f9-3cdd-4460-bd2e-11b790ca1dce.png",
      mandatoryCharacteristics: ["black rounded field", "square pixel cells", "white/grey data density", "dominant metric label", "no decorative unmatched cells"],
      assignedMovementId: "movement-02-compound-family",
    },
    {
      id: "artificial-reference-02-dot-calendar",
      suppliedPath: "conversation attachment codex-clipboard-a28f0c4c-269e-43a5-b487-d4a883814387.png",
      mandatoryCharacteristics: ["two compact widgets", "one larger occupancy grid", "black surface", "equal circular marks", "direct temporal labels"],
      assignedMovementId: "movement-03-manufactured-experience",
    },
    {
      id: "artificial-reference-03-terminal-grid",
      suppliedPath: "conversation attachment codex-clipboard-7781c65a-bc87-4a8b-9a37-13b19de27882.png",
      mandatoryCharacteristics: ["dense terminal hierarchy", "beige/dark-red system", "pixel-grid structure", "compact codes with readable redundancy", "no fake telemetry"],
      assignedMovementId: "movement-04-suspicion-transfer",
    },
    {
      id: "artificial-reference-04-segment-clock",
      suppliedPath: "conversation attachment codex-clipboard-23bd50cb-a87a-4188-9aab-20ab7347bd15.png",
      mandatoryCharacteristics: ["green on black", "segmented display language", "vertical bar field", "large state selector", "persistent comparison rather than flip"],
      assignedMovementId: "movement-05-human-continuation",
    },
    {
      id: "artificial-reference-05-dot-matrix",
      suppliedPath: "conversation attachment codex-clipboard-06443e21-7dd9-4e37-a2ef-57b276a2764e.png",
      mandatoryCharacteristics: ["monochrome solid and hollow dots", "equal mark area", "state legend", "compact mobile grid", "no percentage inferred from arbitrary fill"],
      assignedMovementId: "movement-01-made-before-fake",
    },
    {
      id: "artificial-reference-06-full-screen-terminal",
      suppliedPath: "conversation attachment codex-clipboard-14294d31-e744-43c2-9114-c2d1f9158219.png",
      mandatoryCharacteristics: ["edge-to-edge black research surface", "fine persistent grid", "several vertically partitioned pixel fields", "dense monospaced source telemetry", "white/grey marks only unless route emphasis is data-bound", "no detached card shell"],
      assignedMovementId: "movement-04-suspicion-transfer",
    },
    {
      id: "artificial-reference-07-modular-black-dashboard",
      suppliedPath: "conversation attachment codex-clipboard-359641dc-c9ee-45d7-8235-1a166c5179f7.png",
      mandatoryCharacteristics: ["full black page system", "thin bordered stacked modules", "headline metrics above chart fields", "pixel heatmap plus bar and line modules", "dense but ordered list rows", "consistent edge gutters and module rhythm"],
      assignedMovementId: "movement-02-compound-family",
    },
    {
      id: "artificial-reference-08-audio-terminal",
      suppliedPath: "conversation attachment codex-clipboard-60a02540-eb3e-4131-9bc0-cc39de0f5e0c.png",
      mandatoryCharacteristics: ["edge-to-edge black audio-log surface", "fine persistent grid", "equal signal blocks", "vertically partitioned modules", "compact direct labels", "no ornamental telemetry"],
      assignedMovementId: "movement-03-manufactured-experience",
    },
    {
      id: "artificial-reference-09-extended-segment",
      suppliedPath: "conversation attachment codex-clipboard-092495a7-6135-4aa2-a5eb-f14eba4358ee.png",
      mandatoryCharacteristics: ["near-black full surface", "one thin outlined landscape panel", "three compact state tags", "large left-aligned result", "equal vertical segments", "small lower handle"],
      assignedMovementId: "movement-01-made-before-fake",
    },
    {
      id: "artificial-reference-10-three-metric-stack",
      suppliedPath: "conversation attachment codex-clipboard-ffd260e3-eeb4-468f-aed5-15d92fcdb597.png",
      mandatoryCharacteristics: ["light grey full surface", "three identical black rounded panels", "large headline counts", "dark bars with white caps", "consistent vertical rhythm"],
      assignedMovementId: "movement-02-compound-family",
    },
    {
      id: "artificial-reference-11-linear-dashboard-pair",
      suppliedPath: "conversation attachment codex-clipboard-c704d438-1d70-4ca2-b4c9-b1d16d92ca5c.png",
      mandatoryCharacteristics: ["near-black full surface", "centered editorial heading", "two equal thin-outlined plots", "dense point field", "segmented vertical-bar field", "no decorative quantitative marks"],
      assignedMovementId: "movement-04-suspicion-transfer",
    },
    {
      id: "artificial-reference-12-dual-terminal-pages",
      suppliedPath: "conversation attachment codex-clipboard-49c2dcf6-233a-48c7-9fd3-5ef61c0168d5.png",
      mandatoryCharacteristics: ["edge-to-edge black terminal interiors", "fine square grid", "white and grey equal record marks", "particle body and globe", "segmented signal fields", "dense direct telemetry", "physical phone shell excluded from web implementation"],
      assignedMovementId: "movement-05-human-continuation",
    },
    {
      id: "artificial-reference-13-dot-matrix-toggle",
      suppliedPath: "conversation attachment codex-clipboard-9d9e0e35-d2d5-419c-af31-6d7dfda9659b.png",
      mandatoryCharacteristics: ["white full surface", "large pale page index", "top-right asterisk control", "right-aligned count stack", "lower-half five-column dot matrix", "solid hollow and centered-dot states"],
      assignedMovementId: "movement-01-made-before-fake",
    },
  ];

  const spotChecks: ArtificialMobileResearchArtifact["spotChecks"] = [];
  const check = (id: string, actual: number | string | boolean, expected: number | string | boolean, lineage: string) =>
    spotChecks.push({ id, actual, expected, passed: actual === expected, lineage });
  check("artificial-check-origin-claim-count", originEvidence.claimCount, 11, `${FROZEN_INPUT_PATH} → originRecords`);
  check("artificial-check-origin-core-count", originEvidence.publicCoreClaims.length, 4, `${FROZEN_INPUT_PATH} → originRecords[state=core]`);
  check("artificial-check-compound-count", compoundFamily.terms.length, 30, `${FROZEN_INPUT_PATH} → compoundTerms`);
  check("artificial-check-phrase-vocabulary-count", phraseVocabulary.exactPhraseCount, 48, `${FROZEN_INPUT_PATH} → phraseVocabularyTerms`);
  check("artificial-check-phrase-vocabulary-theme-count", phraseVocabulary.domains.length, 5, `${FROZEN_INPUT_PATH} → phraseVocabularyTerms[semanticDomain]`);
  check("artificial-check-compound-year-start", Math.min(...compoundFamily.terms.flatMap((term) => term.ownPeakDecadeShape.map((row) => row.decade))), 1800, "compound decade transform");
  check("artificial-check-compound-year-end", Math.max(...compoundFamily.terms.flatMap((term) => term.ownPeakDecadeShape.map((row) => row.decade))), 2010, "compound decade transform");
  check("artificial-check-ai-peak", compoundFamily.terms.find((term) => term.term === "artificial intelligence")?.peakYear ?? -1, 2020, COMPOUND_RAW_FILES[3]);
  check("artificial-check-silk-peak", compoundFamily.terms.find((term) => term.term === "artificial silk")?.peakYear ?? -1, 1929, COMPOUND_RAW_FILES[1]);
  check("artificial-check-media-count", mediaShift.selectedTermCount, 12, `${FROZEN_INPUT_PATH} → mediaTerms`);
  check("artificial-check-magic-lantern-peak", mediaShift.terms.find((term) => term.term === "magic lantern")?.peakYear ?? -1, 1869, "chart_03 raw media source");
  check("artificial-check-digital-image-peak", mediaShift.terms.find((term) => term.term === "digital image")?.peakYear ?? -1, 1999, "chart_03 raw media source");
  check("artificial-check-period-anchors", suspicionTransfer.anchorCount, 7, `${FROZEN_INPUT_PATH} → suspicionAnchors`);
  check("artificial-check-linear-model-weak", suspicionTransfer.modelAssessment.find((row) => row.model === "linear_pejoration")?.status ?? "missing", "weak", "mobile-only source-bound model assessment");
  check("artificial-check-human-evidence", humanContinuation.evidenceRecordCount, 26, HUMAN_EVIDENCE);
  check("artificial-check-human-visible-layer-evidence", humanContinuation.layers.filter((row) => row.layerNumber > 1).reduce((sum, row) => sum + row.evidenceCount, 0), 25, `${FROZEN_INPUT_PATH} → humanRecords`);
  check("artificial-check-human-modeled-processes", humanContinuation.functionGroups.find((row) => row.id === "modeled_processes")?.evidenceCount ?? -1, 6, `${FROZEN_INPUT_PATH} → humanRecords[function_mode=simulation]`);
  check("artificial-check-human-speculative-extensions", humanContinuation.functionGroups.find((row) => row.id === "speculative_extensions")?.evidenceCount ?? -1, 5, `${FROZEN_INPUT_PATH} → humanRecords[function_mode=speculative_extension]`);
  check("artificial-check-mobile-research-authority", frozenInputs.desktopProcessedInputsUsed, false, `${FROZEN_INPUT_PATH} → sourceBoundary`);
  check("artificial-check-active-legacy-processed", activeLegacyProcessed.length, 0, `${MANIFEST_PATH} → active dependency closure`);
  check("artificial-check-flip-prohibition", narrative.movements.every((movement) => movement.flipCardsProhibited), true, "narrative interaction registry");
  check("artificial-check-semantic-mobility-cases", semanticMobility.selectedCaseCount, 5, `${FROZEN_INPUT_PATH} → semanticMobilityCandidates`);
  check("artificial-check-semantic-mobility-urls", semanticMobility.distinctUrlCount, 15, `${FROZEN_INPUT_PATH} → semanticMobilityCandidates[sourceUrl]`);
  check("artificial-check-contract-count", narrative.contracts.length, 8, "six production contracts plus two blocked Viewer candidates");
  check("artificial-check-mandatory-reference-count", referenceRegistry.length, 13, "mandatory reference registry");
  check("artificial-check-reference-assignment", referenceRegistry.every((reference) => narrative.movements.some((movement) => movement.id === reference.assignedMovementId)), true, "reference registry → narrative movement registry");
  check("artificial-check-provisional-ngram-gates", narrative.contracts.filter((contract) => !contract.productionEligible).length, 2, "Viewer denominator audit → per-figure gates");
  check("artificial-check-desktop-compatibility-review-count", crossEditionCompatibility.reviewedProductionFindingCount, productionContracts.length, "six production findings → six cross-edition compatibility reviews");
  check("artificial-check-desktop-conflict-count", crossEditionCompatibility.conflictCount, 0, "cross-edition compatibility registry");
  check("artificial-check-production-contract-compatibility-links", productionContracts.every((contract) => contract.crossEditionCompatibilityReviewId !== null), true, "production contracts → compatibility review registry");
  check("artificial-check-desktop-not-derivation-authority", crossEditionCompatibility.desktopResearchAuthorityForMobileDerivation, false, "cross-edition compatibility policy");
  invariant(spotChecks.every((row) => row.passed), `Artificial spot checks failed: ${spotChecks.filter((row) => !row.passed).map((row) => row.id).join(", ")}`);

  const artifact: ArtificialMobileResearchArtifact = {
    schemaVersion: "1.6.0",
    auditId: "artificial-mobile-raw-research-2026-08-13",
    generatedFromFrozenInputs: true,
    pageImplementationAuthorized: true,
    pageImplementationStarted: true,
    predesignApprovedByUser: true,
    researchIndependence: {
      mobileResearchAuthority: true,
      desktopResearchAuthority: false,
      mobileFrozenInputPath: FROZEN_INPUT_PATH,
      mobileTransformPath: SCRIPT_PATH,
      activeRawSourceCount: inventory.filter((entry) => entry.activeDependency && (entry.role === "raw_capture" || entry.role === "source_record")).length,
      activeLegacyProcessedDependencyCount: 0,
      renderedComponentsConsumeTypedArtifactOnly: true,
      desktopCompatibilityReviewOnly: true,
      desktopInputsUsedForFindingDerivation: false,
    },
    crossEditionCompatibility,
    principalQuestion: "How did artificial move from a word about art, making and non-natural construction into overlapping technical, sensory, social and human systems without ever becoming a simple synonym for fake?",
    missingnessTaxonomy: [
      "observed_positive", "observed_zero", "absent_or_suppressed", "not_searched",
      "fetch_failed", "unavailable", "incomparable", "out_of_scope",
    ],
    manifestSummary,
    viewerDenominatorAudit: {
      captureType: "Google Books Ngram Viewer normalized fraction",
      corpusAlias: "en",
      releasePinned: false,
      yearCoverage: { start: 1800, end: 2020 },
      ngramOrders: [...new Set(compoundFamily.terms.map((term) => term.ngramOrder))].sort(),
      allowedUses: [
        "within one exact term: identify retained positive years and its own peak year",
        "within one exact term: normalize eligible decadal shapes to that term's own maximum",
        "place equal term marks in time without encoding cross-term magnitude",
      ],
      prohibitedUses: [
        "shared appearances-per-million scale across n-gram orders",
        "cross-order frequency ranking or ratio",
        "language-wide adoption, meaning share or social acceptance",
        "convert a zero Viewer fraction to observed zero when suppression is possible",
      ],
      productionBlocker: "Re-freeze the active exact-term series against a pinned Google Books release before implementing quantitative Viewer-derived mobile figures.",
    },
    researchCoverage,
    originEvidence,
    phraseVocabulary,
    compoundFamily,
    mediaShift,
    suspicionTransfer,
    semanticMobility,
    humanContinuation,
    newMobileOnlyAnalysis: [
      "Forty-eight exact artificial-prefix labels from five base captures and two raw vocabulary supplements are grouped into five mobile-only meaning themes without using blocked Viewer magnitudes.",
      "Twelve preregistered media terms are grouped into four mobile-only manufactured-experience systems without inferring dates or popularity.",
      "Twenty-six raw source records are regrouped into five mobile-only evidence layers without inheriting legacy transition claims.",
      "Five fully accessed semantic cases separate made, real, realistic, simulated and fake-adjacent judgements without inventing a distance score.",
      "Six rendered figure contracts are independently eligible; two Viewer-derived research candidates remain blocked and unrendered.",
    ],
    findings: narrative.findings,
    figureContracts: narrative.contracts,
    narrativeMovements: narrative.movements,
    referenceRegistry,
    spotChecks,
  };
  const backup = {
    schemaVersion: "1.5.0",
    auditId: artifact.auditId,
    frozenInputSetSha256: inputSetSha256,
    missingnessTaxonomy: artifact.missingnessTaxonomy,
    researchCoverage,
    originClaims: originEvidence,
    phraseVocabulary,
    compoundTerms: compoundFamily.terms,
    compoundDomains: compoundFamily.domains,
    mediaTerms: mediaShift.terms,
    suspicionAnchors: suspicionTransfer.anchors,
    suspicionModels: suspicionTransfer.modelAssessment,
    humanLayers: humanContinuation.layers,
    researchIndependence: artifact.researchIndependence,
    crossEditionCompatibility: artifact.crossEditionCompatibility,
  };
  const manifest = {
    schemaVersion: "1.2.0",
    auditId: artifact.auditId,
    inventoryRoot: RESEARCH_ROOT,
    excludesFromInventory: [OUTPUT_ROOT],
    inputSetSha256,
    entries: inventory,
  };
  return { artifact, backup, frozenInputJson, manifest };
}

const checkMode = process.argv.includes("--check");
const { artifact, backup, frozenInputJson, manifest } = build();
const artifactJson = stableJson(artifact);
writeOrCheck(FROZEN_INPUT_PATH, frozenInputJson, checkMode);
writeOrCheck(ARTIFACT_PATH, artifactJson, checkMode);
writeOrCheck(BACKUP_PATH, stableJson(backup), checkMode);
writeOrCheck(MANIFEST_PATH, stableJson(manifest), checkMode);
writeOrCheck(GENERATED_PATH, artifactJson, checkMode);
console.log(`artificial mobile research ${checkMode ? "validated" : "written"}: ${sha256(artifactJson)}`);
