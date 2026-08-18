import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import type {
  HubFamilyId,
  HubFigureContract,
  HubMobileAnalysis,
  HubPeriodId,
} from "../src/types/hubMobileAnalysis.ts";

const ROOT = resolve(import.meta.dirname, "..");
const FREQUENCY_RAW = "docs/research/hub/raw/hub_chart01_frequency_raw.json";
const EVIDENCE_RAW = "docs/research/hub/raw/hub_evidence_strengthening_raw.json";
const ATTESTATIONS_RAW = "docs/research/hub/raw/hub_earliest_attestations_raw.json";
const SCRIPT = "scripts/build_hub_mobile_analysis.ts";
const OUTPUT = "docs/research/hub/mobile-2026-08/hub_mobile_analysis.json";
const GENERATED = "src/data/generated/hub_mobile_analysis.json";
const THRESHOLD = 0.002;

type RawSeriesPoint = { year: number; frequency_per_million: number };
type RawQuery = {
  query: string;
  semantic_group: string;
  status: "success" | "failed";
  notes: string;
  raw_series: RawSeriesPoint[];
};
type FrequencyRaw = {
  metadata: { query_settings: HubMobileAnalysis["querySettings"] & { year_start: number; year_end: number; case_insensitive: boolean } };
  query_results: RawQuery[];
};
type StrengthenedEvidence = {
  raw_id: string;
  term: string;
  sense_label: string;
  evidence_year: number;
  year_type: "historical_dictionary" | "direct_text";
  source_title: string;
  source_url: string;
  context_summary: string;
  confidence: "high" | "medium" | "low";
  limitations: string;
};
type AttestationEvidence = {
  id: string;
  term: string;
  sense_label: string;
  claimed_year: number | null;
  evidence_year: number | null;
  year_type: "dictionary_claim" | "corpus_evidence" | string;
  source_title: string;
  source_url: string;
  definition_or_context_summary: string;
  confidence: "high" | "medium" | "low";
  reliability_notes: string;
};

const periods: HubMobileAnalysis["periods"] = [
  { id: "1900_1919", label: "1900–1919", shortLabel: "1900", startYear: 1900, endYear: 1919 },
  { id: "1920_1939", label: "1920–1939", shortLabel: "1920", startYear: 1920, endYear: 1939 },
  { id: "1940_1959", label: "1940–1959", shortLabel: "1940", startYear: 1940, endYear: 1959 },
  { id: "1960_1979", label: "1960–1979", shortLabel: "1960", startYear: 1960, endYear: 1979 },
  { id: "1980_1999", label: "1980–1999", shortLabel: "1980", startYear: 1980, endYear: 1999 },
  { id: "2000_2019", label: "2000–2019", shortLabel: "2000", startYear: 2000, endYear: 2019 },
];

const familyDefinitions: Array<{ id: HubFamilyId; label: string; color: string }> = [
  { id: "mechanical_core", label: "MECHANICAL", color: "#f06b45" },
  { id: "central_place", label: "PLACE", color: "#f2c84b" },
  { id: "transport_routing", label: "TRANSPORT", color: "#82a978" },
  { id: "institutional_cluster", label: "INSTITUTION", color: "#cf83bd" },
  { id: "network_system", label: "NETWORK", color: "#6a7fe4" },
  { id: "digital_platform", label: "DIGITAL", color: "#9273d8" },
];

const featuredTerms = ["wheel hub", "commercial hub", "transport hub", "network hub", "financial hub", "data hub"];

function invariant(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function text(path: string): string {
  return readFileSync(resolve(ROOT, path), "utf8");
}

function json<T>(path: string): T {
  return JSON.parse(text(path)) as T;
}

function rounded(value: number, digits = 5): number {
  return Number(value.toFixed(digits));
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function periodMean(row: RawQuery, startYear: number, endYear: number): number {
  const values = row.raw_series.filter((point) => point.year >= startYear && point.year <= endYear);
  invariant(values.length === endYear - startYear + 1, `${row.query} is missing annual values for ${startYear}–${endYear}`);
  return values.reduce((sum, point) => sum + point.frequency_per_million, 0) / values.length;
}

function isEligible(row: RawQuery): row is RawQuery & { semantic_group: HubFamilyId } {
  if (row.status !== "success" || row.semantic_group === "total_background") return false;
  if (row.query.includes("-") || row.query.trim().split(/\s+/).length !== 2) return false;
  return !/May be|adjacent|sparse|do not let/i.test(row.notes ?? "");
}

function buildArtifact(): HubMobileAnalysis {
  const frequencyRaw = json<FrequencyRaw>(FREQUENCY_RAW);
  const evidenceRaw = json<{ strengthened_attestation_candidates_raw: StrengthenedEvidence[] }>(EVIDENCE_RAW);
  const attestationsRaw = json<{ attestation_candidates: AttestationEvidence[] }>(ATTESTATIONS_RAW);
  const eligible = frequencyRaw.query_results.filter(isEligible);
  invariant(eligible.length === 39, `Expected 39 eligible phrase proxies, found ${eligible.length}`);

  const phrases: HubMobileAnalysis["phrases"] = eligible.map((row) => {
    const definition = familyDefinitions.find((family) => family.id === row.semantic_group);
    invariant(definition, `Unregistered family ${row.semantic_group}`);
    const values = periods.map((period) => {
      const meanFrequencyPerMillion = rounded(periodMean(row, period.startYear, period.endYear));
      return {
        periodId: period.id,
        meanFrequencyPerMillion,
        visible: meanFrequencyPerMillion >= THRESHOLD,
      };
    });
    const change = rounded(values[5].meanFrequencyPerMillion - values[4].meanFrequencyPerMillion);
    return {
      term: row.query,
      familyId: row.semantic_group,
      familyLabel: definition.label,
      periods: values,
      persistencePeriodCount: values.filter((value) => value.visible).length,
      changeFrom1980sPerMillion: change,
      direction: change >= 0 ? "rising" : "falling",
      trajectoryLabel: change >= 0 ? "RISING AFTER 1980" : "LOWER AFTER 1980",
      featured: featuredTerms.includes(row.query),
    };
  });

  const visibility = periods.map((period) => {
    const visiblePhraseCount = phrases.filter((phrase) => phrase.periods.find((value) => value.periodId === period.id)?.visible).length;
    return {
      periodId: period.id,
      visiblePhraseCount,
      visibleSharePercent: rounded((visiblePhraseCount / phrases.length) * 100, 2),
    };
  });

  const families = familyDefinitions.map((definition) => {
    const members = phrases.filter((phrase) => phrase.familyId === definition.id);
    invariant(members.length > 0, `No eligible phrases for ${definition.id}`);
    const familyPeriods = periods.map((period) => {
      const values = members.map((phrase) => phrase.periods.find((value) => value.periodId === period.id)!);
      const visiblePhraseCount = values.filter((value) => value.visible).length;
      return {
        periodId: period.id,
        meanFrequencyPerMillion: rounded(values.reduce((sum, value) => sum + value.meanFrequencyPerMillion, 0) / values.length),
        visiblePhraseCount,
        visibleSharePercent: rounded((visiblePhraseCount / members.length) * 100, 2),
      };
    });
    const firstVisible = familyPeriods.find((period) => period.visiblePhraseCount > 0);
    invariant(firstVisible, `No visible period for ${definition.id}`);
    return {
      ...definition,
      eligiblePhraseCount: members.length,
      firstVisiblePeriodId: firstVisible.periodId,
      currentVisibleSharePercent: familyPeriods.at(-1)!.visibleSharePercent,
      periods: familyPeriods,
    };
  });

  const quadrantSummary: HubMobileAnalysis["quadrantSummary"] = [
    { id: "new_rising", label: "NEW / RISING", phraseCount: phrases.filter((row) => row.persistencePeriodCount < 3 && row.direction === "rising").length },
    { id: "enduring_rising", label: "ENDURING / RISING", phraseCount: phrases.filter((row) => row.persistencePeriodCount >= 3 && row.direction === "rising").length },
    { id: "enduring_falling", label: "ENDURING / FALLING", phraseCount: phrases.filter((row) => row.persistencePeriodCount >= 3 && row.direction === "falling").length },
    { id: "new_falling", label: "NEW / FALLING", phraseCount: phrases.filter((row) => row.persistencePeriodCount < 3 && row.direction === "falling").length },
  ];

  const strengthenedById = new Map(evidenceRaw.strengthened_attestation_candidates_raw.map((row) => [row.raw_id, row]));
  const attestationByKey = (term: string, year: number) => attestationsRaw.attestation_candidates.find((row) => row.term === term && (row.evidence_year ?? row.claimed_year) === year);
  const evidenceSelections: Array<StrengthenedEvidence | AttestationEvidence> = [
    strengthenedById.get("webster_1828_volume_1_hub_entry")!,
    strengthenedById.get("gutenberg_autocrat_1858_hub_metaphor")!,
    strengthenedById.get("london_bicycle_club_gazette_1878_wheel_hub")!,
    attestationByKey("railway hub", 1943)!,
    attestationByKey("hub-and-spoke", 1980)!,
  ];
  invariant(evidenceSelections.every(Boolean), "One or more selected evidence anchors are missing");
  const evidence: HubMobileAnalysis["evidence"] = evidenceSelections.map((row) => {
    if ("raw_id" in row) {
      return {
        id: row.raw_id,
        year: row.evidence_year,
        term: row.term,
        senseLabel: row.sense_label,
        summary: row.context_summary,
        evidenceKind: row.year_type,
        confidence: row.confidence,
        sourceTitle: row.source_title,
        sourceUrl: row.source_url,
        caveat: row.limitations,
      };
    }
    const year = row.evidence_year ?? row.claimed_year;
    invariant(year !== null, `${row.id} has no usable year`);
    return {
      id: row.id,
      year,
      term: row.term,
      senseLabel: row.sense_label,
      summary: row.definition_or_context_summary,
      evidenceKind: row.year_type === "corpus_evidence" ? "corpus_evidence" : "dictionary_claim",
      confidence: row.confidence,
      sourceTitle: row.source_title,
      sourceUrl: row.source_url,
      caveat: row.reliability_notes,
    };
  });

  const commonSource = [FREQUENCY_RAW, "query_results[].semantic_group", "query_results[].raw_series[].frequency_per_million"];
  const figureContracts: HubFigureContract[] = [
    {
      id: "hub-m01", moduleOrder: 1, title: "One word, six kinds of center",
      researchQuestion: "When do the selected semantic families become visible?", sourceFilesAndFields: commonSource,
      filters: ["successful, non-background, unhyphenated two-token queries", "exclude raw-note ambiguous, sparse, and mechanical-adjacent rows"],
      grouping: "semantic family × twenty-year period", denominator: "eligible phrases within each family",
      formula: "unweighted twenty-year arithmetic mean; visible at >= 0.002 per million", unit: "period and percent of eligible family phrases",
      visualChannelMapping: ["colour = family", "vertical position = first visible period", "diameter = 2000–2019 visible share", "direct label = family and period"],
      missingnessPolicy: "failed queries are excluded, never displayed as zero", caveat: "proxy visibility is not semantic population prevalence", productionEligible: true,
    },
    {
      id: "hub-m02", moduleOrder: 2, title: "The original line falls; the others rise around it",
      researchQuestion: "How do selected family means change across the twentieth century?", sourceFilesAndFields: commonSource,
      filters: ["same fixed 39-phrase production inventory"], grouping: "semantic family × period",
      denominator: "eligible phrases within the family", formula: "arithmetic mean of phrase-period means", unit: "occurrences per million printed-book tokens",
      visualChannelMapping: ["x = period", "y = family mean", "colour and direct label = family"],
      missingnessPolicy: "all retained annual rows must be present; failure blocks the phrase", caveat: "family means are selected-proxy summaries", productionEligible: true,
    },
    {
      id: "hub-m03", moduleOrder: 3, title: "More ways to be a center",
      researchQuestion: "How broadly is the same phrase inventory visible in three comparison periods?", sourceFilesAndFields: commonSource,
      filters: ["same fixed 39-phrase production inventory"], grouping: "comparison period",
      denominator: "39 eligible phrases in every displayed period", formula: "visible phrases / 39 × 100", unit: "percent of selected phrase inventory",
      visualChannelMapping: ["equal-width arc length = share", "direct text = rounded percentage", "radius = period order only"],
      missingnessPolicy: "failed and excluded queries do not enter the fixed denominator", caveat: "not an estimate of all English hub usage", productionEligible: true,
    },
    {
      id: "hub-m04", moduleOrder: 4, title: "Persistence and change",
      researchQuestion: "Which selected phrases are durable, recent, rising, or falling?", sourceFilesAndFields: commonSource,
      filters: ["same fixed 39-phrase production inventory"], grouping: "one point per phrase",
      denominator: "six periods for persistence; phrase-specific means for change", formula: "x = visible period count; y = 2000–2019 mean − 1980–1999 mean", unit: "periods and occurrences per million",
      visualChannelMapping: ["x = persistence", "y = change", "equal point area = phrase", "colour = family"],
      missingnessPolicy: "below threshold remains observed below-threshold, not missing", caveat: "recent growth can be large from a very small base", productionEligible: true,
    },
    {
      id: "hub-m05", moduleOrder: 5, title: "Evidence anchors", researchQuestion: "What dated evidence supports key transitions?",
      sourceFilesAndFields: [EVIDENCE_RAW, ATTESTATIONS_RAW], filters: ["five non-duplicate readable anchors", "medium or high confidence"],
      grouping: "chronological", denominator: "not applicable", formula: "no quantitative aggregation", unit: "year and evidence type",
      visualChannelMapping: ["open strip order = year", "timeline position = year", "text = confidence and evidence type"],
      missingnessPolicy: "dictionary claim remains distinct from direct text", caveat: "the dictionary records establish availability, not first use", productionEligible: true,
    },
    {
      id: "hub-m06", moduleOrder: 6, title: "Phrase trajectories", researchQuestion: "How do representative phrases carry the larger movement?",
      sourceFilesAndFields: commonSource, filters: ["six pre-registered representative phrases from the production inventory"], grouping: "phrase × period",
      denominator: "phrase-specific printed-book frequency", formula: "unweighted twenty-year arithmetic mean", unit: "occurrences per million",
      visualChannelMapping: ["x = period", "y = phrase mean on a shared scale", "line colour = family"],
      missingnessPolicy: "all six selected phrases have complete annual rows", caveat: "examples illustrate the selected inventory and are not exhaustive", productionEligible: true,
    },
  ];

  const spotChecks: HubMobileAnalysis["spotChecks"] = [];
  const check = (id: string, actual: number | string | boolean, expected: number | string | boolean) => spotChecks.push({ id, actual, expected, passed: actual === expected });
  check("hub-check-eligible-phrases", phrases.length, 39);
  check("hub-check-1900-visible", visibility[0].visiblePhraseCount, 5);
  check("hub-check-1980-visible", visibility[4].visiblePhraseCount, 19);
  check("hub-check-2000-visible", visibility[5].visiblePhraseCount, 35);
  check("hub-check-new-rising", quadrantSummary.find((row) => row.id === "new_rising")!.phraseCount, 27);
  check("hub-check-current-transport", families.find((row) => row.id === "transport_routing")!.periods.at(-1)!.visiblePhraseCount, 8);
  check("hub-check-current-digital", families.find((row) => row.id === "digital_platform")!.periods.at(-1)!.visiblePhraseCount, 6);
  check("hub-check-contracts", figureContracts.every((contract) => contract.productionEligible), true);
  invariant(spotChecks.every((checkRow) => checkRow.passed), `Hub spot checks failed: ${spotChecks.filter((row) => !row.passed).map((row) => row.id).join(", ")}`);

  return {
    schemaVersion: "1.0.0",
    auditId: "hub-mobile-2026-08-16",
    generatedFromFrozenInputs: true,
    implementationAuthorized: true,
    principalQuestion: "How did hub retain the idea of a center while becoming available to describe places, routes, institutions, networks, and digital services?",
    querySettings: { yearStart: 1800, yearEnd: 2022, corpus: "en", smoothing: 0, caseInsensitive: true },
    thresholdPerMillion: THRESHOLD,
    eligiblePhraseCount: phrases.length,
    exclusions: {
      failedQueries: frequencyRaw.query_results.filter((row) => row.status === "failed").map((row) => row.query),
      rule: "Successful non-background, unhyphenated two-token queries; raw-note ambiguous, sparse, and mechanical-adjacent rows excluded.",
    },
    periods,
    visibility,
    families,
    phrases,
    quadrantSummary,
    evidence,
    figureContracts,
    sourceManifest: [FREQUENCY_RAW, EVIDENCE_RAW, ATTESTATIONS_RAW, SCRIPT].map((path) => ({
      path,
      sha256: sha256(text(path)),
      role: path === SCRIPT ? "transform" as const : "active_input" as const,
    })),
    spotChecks,
  };
}

function stableJson(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function writeOrCheck(path: string, content: string, checkMode: boolean): void {
  const absolute = resolve(ROOT, path);
  if (checkMode) {
    invariant(existsSync(absolute), `${path} is missing`);
    invariant(readFileSync(absolute, "utf8") === content, `${path} is stale; rerun ${SCRIPT}`);
  } else {
    writeFileSync(absolute, content, "utf8");
  }
}

const checkMode = process.argv.includes("--check");
const artifact = buildArtifact();
const content = stableJson(artifact);
writeOrCheck(OUTPUT, content, checkMode);
writeOrCheck(GENERATED, content, checkMode);
console.log(`hub mobile analysis ${checkMode ? "validated" : "written"}: ${sha256(content)}`);
