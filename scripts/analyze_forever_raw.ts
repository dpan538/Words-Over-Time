import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

import type {
  ForeverAnalysisArtifact,
  ForeverAuditValue,
  ForeverFigureContract,
  ForeverFigureContractRegistry,
  ForeverFixedGoogleReleaseAudit,
  ForeverFinding,
  ForeverFindingsRegistry,
  ForeverManifestEntry,
  ForeverRawDataManifest,
  ForeverRawGap,
  ForeverSourceSelector,
  ForeverSpotCheck,
  ForeverUntraceableInput,
  ForeverValidationAssertion,
} from "../src/types/foreverAnalysis";

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "src", "data", "generated");
const AUDIT_ID = "forever-raw-audit-2026-08-11";
const SCHEMA_VERSION = "2.0.0";

const PAGE_IMPLEMENTATION_AUTHORIZED = false as const;
const FIXED_GOOGLE_ROOT = "docs/research/forever/google-fixed-20200217";
const FIXED_GOOGLE_PATHS = {
  acquisition: `${FIXED_GOOGLE_ROOT}/acquisition-manifest.json`,
  rights: `${FIXED_GOOGLE_ROOT}/source-rights-manifest.json`,
  transforms: `${FIXED_GOOGLE_ROOT}/transform-manifest.json`,
  checksums: `${FIXED_GOOGLE_ROOT}/checksums.json`,
  family: `${FIXED_GOOGLE_ROOT}/core-family-registry.json`,
  extractionSummary: `${FIXED_GOOGLE_ROOT}/extracted/extraction-summary.json`,
  totalCounts: `${FIXED_GOOGLE_ROOT}/frozen/totalcounts-1`,
  viewerResponse: `${FIXED_GOOGLE_ROOT}/frozen/viewer-eng_2019-s0-case-sensitive.json`,
  viewerRequest: `${FIXED_GOOGLE_ROOT}/frozen/viewer-request.json`,
  foreverSource: `${FIXED_GOOGLE_ROOT}/extracted/forever-1.source.tsv`,
  foreverAnnual: `${FIXED_GOOGLE_ROOT}/extracted/forever-1.annual.tsv`,
  forEverSource: `${FIXED_GOOGLE_ROOT}/extracted/for-ever-2.source.tsv`,
  forEverAnnual: `${FIXED_GOOGLE_ROOT}/extracted/for-ever-2.annual.tsv`,
  forevermoreSource: `${FIXED_GOOGLE_ROOT}/extracted/forevermore-1.source.tsv`,
  forevermoreAnnual: `${FIXED_GOOGLE_ROOT}/extracted/forevermore-1.annual.tsv`,
} as const;

const MISSINGNESS_STATES = [
  "observed_positive",
  "observed_zero",
  "absent_or_suppressed",
  "not_searched",
  "fetch_failed",
  "unavailable",
  "incomparable",
  "out_of_scope",
] as const;

const LEGACY_FOREVER_PIPELINE_PATHS = [
  "scripts/fetch_ngram_forever.ts",
  "scripts/fetch_gutenberg_forever.ts",
  "scripts/build_prehistory_forever.ts",
  "scripts/fetch_modern_context_forever.ts",
  "scripts/build_forever_dataset.ts",
] as const;

const OUTPUT_PATHS = {
  analysis: "src/data/generated/forever_analysis.json",
  manifest: "src/data/generated/forever_raw_data_manifest.json",
  findings: "src/data/generated/forever_findings_registry.json",
  contracts: "src/data/generated/forever_figure_contract_registry.json",
} as const;

const CORE_INPUT_PATHS = [
  "scripts/analyze_forever_raw.ts",
  "scripts/fetch_ngram_forever.ts",
  "scripts/fetch_gutenberg_forever.ts",
  "scripts/build_prehistory_forever.ts",
  "scripts/fetch_modern_context_forever.ts",
  "scripts/build_forever_dataset.ts",
  "src/data/forever.ts",
  "src/data/search-intents.ts",
  "src/data/generated/forever_frequency.json",
  "src/data/generated/forever_gutenberg_sources.json",
  "src/data/generated/forever_prehistory.json",
  "src/data/generated/forever_modern_context.json",
  "src/data/generated/forever_dataset.json",
  "src/data/generated/forever_phrases.json",
  "src/data/generated/forever_collocates.json",
  "src/data/generated/forever_snippets.json",
  "src/data/generated/forever_categories.json",
  "src/data/generated/forever_atlas.json",
  "src/data/generated/forever_ledger.json",
  "src/components/ForeverFormCurrent.tsx",
  "src/components/FrequencyTimeline.tsx",
  "src/components/MobileFrequencyStory.tsx",
  "src/components/ForeverInstitutionalDoubt.tsx",
  "src/components/VariantDriftField.tsx",
  "src/components/ContextSignalField.tsx",
  "src/components/ForeverAttestationHinge.tsx",
  "src/components/ForeverRecurrenceField.tsx",
  "src/components/ForeverPoster.tsx",
  "src/app/words/forever/page.tsx",
  "src/components/forever/mobile/ForeverMobileDataGate.tsx",
  "src/lib/site.ts",
  "docs/research/forever/sources/google-ngram-official-authority.json",
] as const;

const OUTPUT_PATH_SET = new Set<string>(Object.values(OUTPUT_PATHS));
const COMMON_DENOMINATOR_PATH = "docs/research/forever/raw/google/common-denominator.json";
const VIEWER_RAW_RESPONSE_PATH = "docs/research/forever/raw/google/viewer-response.json";
const CANONICAL_FORM_REGISTRY_PATH = "docs/research/forever/raw/forever-form-registry.json";
const GUTENBERG_RAW_MANIFEST_PATH = "docs/research/forever/raw/gutenberg/manifest.json";
const ATTESTATION_RAW_MANIFEST_PATH = "docs/research/forever/raw/attestations/manifest.json";
const MODERN_RAW_MANIFEST_PATH = "docs/research/forever/raw/modern/manifest.json";
const COVERAGE_MANIFEST_PATH = "docs/research/forever/raw/coverage-manifest.json";
const RIGHTS_MANIFEST_PATH = "docs/research/forever/raw/rights-manifest.json";
const TRANSFORM_MANIFEST_PATH = "docs/research/forever/raw/transform-manifest.json";
const EXPECTED_RAW_PATHS = new Set([
  COMMON_DENOMINATOR_PATH,
  VIEWER_RAW_RESPONSE_PATH,
  CANONICAL_FORM_REGISTRY_PATH,
  GUTENBERG_RAW_MANIFEST_PATH,
  ATTESTATION_RAW_MANIFEST_PATH,
  MODERN_RAW_MANIFEST_PATH,
  COVERAGE_MANIFEST_PATH,
  RIGHTS_MANIFEST_PATH,
  TRANSFORM_MANIFEST_PATH,
]);

type OfficialAuthorityFile = {
  schemaVersion: string;
  sourceRecords: Array<{
    id: string;
    publisher: string;
    title: string;
    url: string;
    accessedOn: string;
    official: boolean;
    applicableClaim: string;
    repositoryUse: string;
    sourceLocation: string;
    captureStatus: string;
    rightsBoundary: string;
  }>;
};

type ForeverRawAvailabilityAudit = {
  discoveredCandidatePaths: string[];
  rawMatchCountKeyPaths: string[];
  annualWordTokenTotalKeyPaths: string[];
  pinnedCorpusReleaseKeyPaths: string[];
  commonDenominatorValidatedFiles: string[];
  canonicalFormRegistryPresent: boolean;
  googleRawResponsePresent: boolean;
  rawMatchCountsAvailable: boolean;
  annualWordTokenTotalsAvailable: boolean;
  commonAnnualWordTokenDenominatorAvailable: boolean;
  corpusReleasePinned: boolean;
  gutenbergRawTextsAndMetadataPresent: boolean;
  attestationPrimaryRecordsPresent: boolean;
  modernRawApiAndPageCapturesPresent: boolean;
  coverageManifestPresent: boolean;
  rightsManifestPresent: boolean;
  transformManifestPresent: boolean;
  upstreamRawPresent: boolean;
  allRequiredRawInputsPresent: boolean;
  fixedViewerSeparateFacetsEligible: boolean;
  fixedRawCommonDenominatorEligible: boolean;
};

type FrequencyPoint = {
  year: number;
  value: number;
  frequencyPerMillion: number;
};

type FrequencyFile = {
  generatedAt: string;
  source: {
    label: string;
    url: string;
    corpus: string;
    startYear: number;
    endYear: number;
    smoothing: number;
  };
  series: Array<{
    query: string;
    points: FrequencyPoint[];
  }>;
};

type GutenbergOccurrence = {
  kind: string;
  phrase: string;
  tokenIndex: number;
  charIndex: number;
  snippet: string;
};

type GutenbergFile = {
  generatedAt: string;
  source: { label: string; url: string };
  targetPhrases: string[];
  windowSize: number;
  minimumCollocateCount: number;
  sources: Array<{
    id: string;
    gutenbergId: number;
    title: string;
    author: string;
    year: number;
    sourceUrl: string;
    rightsStatus: string;
    tokenCount: number;
    foreverFormCount: number;
    phraseCounts: Record<string, number>;
    occurrences: GutenbergOccurrence[];
  }>;
};

type PrehistoryFile = {
  generatedAt: string;
  records: Array<{
    id: string;
    form: string;
    normalizedForm: string;
    yearApproximation: number;
    dateLabel: string;
    quote: string;
    verificationStatus: string;
    confidence: string;
    sourceName: string;
    sourceUrl: string;
  }>;
  investigatedSources: unknown[];
};

type ModernFile = {
  generatedAt: string;
  source: { label: string; url: string; apiUrl: string; licenseNote: string };
  queries: string[];
  snippets: Array<{
    id: string;
    sourceUrl: string;
    title: string;
    year: number;
    dateBasis: string;
    query: string;
    quote: string;
    rightsStatus: string;
  }>;
  phrases: Array<{
    phrase: string;
    count: number;
    documentFrequency: number;
  }>;
  collocates: unknown[];
};

type ForeverDatasetFile = {
  generatedAt: string;
  frequency: unknown[];
  prehistory: { records?: unknown[] } | null;
  modernContext: { snippets: unknown[]; phrases: unknown[]; collocates: unknown[] } | null;
  phrases: unknown[];
  collocates: unknown[];
  snippets: unknown[];
  categories: unknown[];
  flows: unknown[];
  atlas: { nodes: unknown[]; edges: unknown[] };
  ledger: unknown[];
  network: { nodes: unknown[]; edges: unknown[] };
  inspectors: unknown[];
};

type InputBundle = {
  inputPaths: string[];
  discoveredCandidatePaths: string[];
  bytes: Map<string, Buffer>;
  texts: Map<string, string>;
  frequency: FrequencyFile;
  gutenberg: GutenbergFile;
  prehistory: PrehistoryFile;
  modern: ModernFile;
  dataset: ForeverDatasetFile;
  phrases: unknown[];
  collocates: unknown[];
  snippets: unknown[];
  categories: unknown[];
  atlas: { nodes: unknown[]; edges: unknown[] };
  ledger: unknown[];
  officialAuthority: OfficialAuthorityFile;
};

function invariant(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`Forever audit invariant failed: ${message}`);
}

function sha256(value: string | Buffer) {
  return createHash("sha256").update(value).digest("hex");
}

function jsonText(value: unknown) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function renderedAuditValue(value: ForeverAuditValue) {
  return typeof value === "string" ? value : JSON.stringify(value);
}

function lineCount(value: string) {
  if (!value) return 0;
  return value.split(/\r?\n/).length - (value.endsWith("\n") ? 1 : 0);
}

function unique<T>(values: T[]) {
  return Array.from(new Set(values));
}

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

function sourceSelector(pathname: string, selector: string, fields: string[]): ForeverSourceSelector {
  return { path: pathname, selector, fields };
}

function ngramOrder(query: string) {
  return query.trim().split(/\s+/).length;
}

function ngramDenominator(order: number) {
  if (order === 1) return "all unigrams in the selected Google Books Ngram corpus/year";
  if (order === 2) return "all bigrams in the selected Google Books Ngram corpus/year";
  if (order === 3) return "all trigrams in the selected Google Books Ngram corpus/year";
  return `all ${order}-grams in the selected Google Books Ngram corpus/year`;
}

function ngramUnit(order: number) {
  if (order === 1) return "per million unigrams";
  if (order === 2) return "per million bigrams";
  if (order === 3) return "per million trigrams";
  return `per million ${order}-grams`;
}

async function walkRelativeFiles(relativeDirectory: string): Promise<string[]> {
  const absoluteDirectory = path.join(ROOT, relativeDirectory);
  let entries;
  try {
    entries = await readdir(absoluteDirectory, { withFileTypes: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }

  const files = await Promise.all(
    entries.map(async (entry) => {
      const relativePath = path.posix.join(relativeDirectory, entry.name);
      return entry.isDirectory() ? walkRelativeFiles(relativePath) : [relativePath];
    }),
  );
  return files.flat().sort();
}

async function discoverForeverAuditCandidates() {
  const [scripts, dataSources, generated, sources, docsRaw, fixedGoogle, sourceRaw, repositoryRaw, structuredData] = await Promise.all([
    walkRelativeFiles("scripts"),
    walkRelativeFiles("src/data"),
    walkRelativeFiles("src/data/generated"),
    walkRelativeFiles("docs/research/forever/sources"),
    walkRelativeFiles("docs/research/forever/raw"),
    walkRelativeFiles(FIXED_GOOGLE_ROOT),
    walkRelativeFiles("src/data/raw/forever"),
    walkRelativeFiles("data/forever"),
    walkRelativeFiles("src/data/forever"),
  ]);

  return unique([
    ...scripts.filter((pathname) => /forever/i.test(path.basename(pathname)) && pathname.endsWith(".ts")),
    ...dataSources.filter(
      (pathname) =>
        path.posix.dirname(pathname) === "src/data" &&
        /forever/i.test(path.basename(pathname)) &&
        pathname !== "src/data/foreverAnalysis.ts",
    ),
    ...generated.filter(
      (pathname) => path.basename(pathname).startsWith("forever_") && pathname.endsWith(".json") && !OUTPUT_PATH_SET.has(pathname),
    ),
    ...sources,
    ...docsRaw,
    ...fixedGoogle.filter((pathname) => !pathname.endsWith(".part")),
    ...sourceRaw,
    ...repositoryRaw,
    ...structuredData,
  ]).sort();
}

async function loadInputs(): Promise<InputBundle> {
  const discoveredCandidatePaths = await discoverForeverAuditCandidates();
  // New frozen/raw files are registered by discovery, then held to the
  // contract-specific validators below. This keeps the manifest exhaustive
  // without making unrelated legacy inputs part of every figure closure.
  const inputPaths = unique([...CORE_INPUT_PATHS, ...discoveredCandidatePaths]).sort();
  const bytePairs = await Promise.all(
    inputPaths.map(async (relativePath) => [relativePath, await readFile(path.join(ROOT, relativePath))] as const),
  );
  const bytes = new Map<string, Buffer>(bytePairs);
  const texts = new Map<string, string>(bytePairs.map(([relativePath, content]) => [relativePath, content.toString("utf8")]));
  const parse = <T>(relativePath: string) => JSON.parse(texts.get(relativePath) ?? "") as T;

  return {
    inputPaths,
    discoveredCandidatePaths,
    bytes,
    texts,
    frequency: parse<FrequencyFile>("src/data/generated/forever_frequency.json"),
    gutenberg: parse<GutenbergFile>("src/data/generated/forever_gutenberg_sources.json"),
    prehistory: parse<PrehistoryFile>("src/data/generated/forever_prehistory.json"),
    modern: parse<ModernFile>("src/data/generated/forever_modern_context.json"),
    dataset: parse<ForeverDatasetFile>("src/data/generated/forever_dataset.json"),
    phrases: parse<unknown[]>("src/data/generated/forever_phrases.json"),
    collocates: parse<unknown[]>("src/data/generated/forever_collocates.json"),
    snippets: parse<unknown[]>("src/data/generated/forever_snippets.json"),
    categories: parse<unknown[]>("src/data/generated/forever_categories.json"),
    atlas: parse<{ nodes: unknown[]; edges: unknown[] }>("src/data/generated/forever_atlas.json"),
    ledger: parse<unknown[]>("src/data/generated/forever_ledger.json"),
    officialAuthority: parse<OfficialAuthorityFile>("docs/research/forever/sources/google-ngram-official-authority.json"),
  };
}

function collectStructuredKeyPaths(value: unknown, prefix = "", output: string[] = []): string[] {
  if (Array.isArray(value)) {
    for (const item of value) collectStructuredKeyPaths(item, `${prefix}[]`, output);
    return output;
  }
  if (value === null || typeof value !== "object") return output;
  for (const [key, child] of Object.entries(value)) {
    const keyPath = prefix ? `${prefix}.${key}` : key;
    output.push(keyPath);
    collectStructuredKeyPaths(child, keyPath, output);
  }
  return output;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function parseRegisteredJson(inputs: InputBundle, relativePath: string) {
  const text = inputs.texts.get(relativePath);
  return text === undefined ? null : (JSON.parse(text) as unknown);
}

function isDedicatedRawPath(relativePath: string) {
  return /^(?:docs\/research\/forever\/(?:raw|google-fixed-20200217)|src\/data\/raw\/forever|data\/forever)\//.test(relativePath);
}

function hasSha256(value: unknown) {
  return typeof value === "string" && /^[a-f0-9]{64}$/.test(value);
}

function nonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function unsignedIntegerLexeme(value: unknown): value is string {
  return typeof value === "string" && /^(?:0|[1-9]\d*)$/.test(value);
}

function yearLexeme(value: unknown): value is string {
  return typeof value === "string" && /^-?(?:0|[1-9]\d*)$/.test(value);
}

function checksumBindsRegisteredBytes(inputs: InputBundle, relativePath: unknown, expectedSha256: unknown) {
  if (typeof relativePath !== "string" || !isDedicatedRawPath(relativePath) || !hasSha256(expectedSha256)) return false;
  const bytes = inputs.bytes.get(relativePath);
  return bytes !== undefined && bytes.byteLength > 0 && sha256(bytes) === expectedSha256;
}

function checksumBindsAnyAuditInput(inputs: InputBundle, relativePath: unknown, expectedSha256: unknown) {
  if (typeof relativePath !== "string" || !hasSha256(expectedSha256)) return false;
  const bytes = inputs.bytes.get(relativePath);
  return bytes !== undefined && bytes.byteLength > 0 && sha256(bytes) === expectedSha256;
}

function parseTsv(text: string) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].split("\t");
  return lines.slice(1).map((line) =>
    Object.fromEntries(line.split("\t").map((value, index) => [headers[index], value])) as Record<string, string>,
  );
}

type FixedRawRow = {
  form: "forever" | "for ever";
  ngramOrder: 1 | 2;
  year: number;
  matchCount: number;
  volumeCount: number;
  sourceWidePath: string;
  sourceFieldIndex: number;
  annualPath: string;
  annualLine: number;
};

function parseFixedRawRows(
  inputs: InputBundle,
  sourceWidePath: string,
  annualPath: string,
  exactForm: FixedRawRow["form"],
  ngramOrderValue: FixedRawRow["ngramOrder"],
) {
  const sourceText = inputs.texts.get(sourceWidePath);
  const annualText = inputs.texts.get(annualPath);
  if (sourceText === undefined || annualText === undefined) {
    return { valid: false, rows: [] as FixedRawRow[] };
  }
  const sourceLines = sourceText.split(/\r?\n/).filter((line) => line.length > 0);
  const sourceFields = sourceLines[0]?.split("\t") ?? [];
  const lines = annualText.split(/\r?\n/).filter((line) => line.length > 0);
  const expectedHeader = [
    "ngram",
    "year",
    "match_count",
    "volume_count",
    "ngram_order",
    "corpus_release",
    "source_shard",
    "wide_field_index",
  ];
  const actualHeader = lines[0]?.split("\t") ?? [];
  const sourceTuples = sourceFields.slice(1).map((field, index) => {
    const [year, matchCount, volumeCount, ...extra] = field.split(",");
    const valid =
      extra.length === 0 &&
      /^\d{4}$/.test(year ?? "") &&
      unsignedIntegerLexeme(matchCount) &&
      unsignedIntegerLexeme(volumeCount) &&
      Number(year) <= 2019 &&
      Number.isSafeInteger(Number(year)) &&
      Number.isSafeInteger(Number(matchCount)) &&
      Number.isSafeInteger(Number(volumeCount));
    return { sourceFieldIndex: index + 1, year, matchCount, volumeCount, valid };
  });
  const rows: FixedRawRow[] = [];
  let valid =
    sourceLines.length === 1 &&
    sourceFields[0] === exactForm &&
    sourceFields.length > 1 &&
    actualHeader.length === expectedHeader.length &&
    expectedHeader.every((field, index) => actualHeader[index] === field) &&
    lines.length > 1 &&
    sourceTuples.every((tuple) => tuple.valid) &&
    lines.length - 1 === sourceTuples.length;
  const expectedShard = ngramOrderValue === 1
    ? "1-00018-of-00024.gz"
    : "2-00407-of-00589.gz";
  for (const [index, line] of lines.slice(1).entries()) {
    const fields = line.split("\t");
    const [
      ngram,
      year,
      matchCount,
      volumeCount,
      ngramOrderLexeme,
      corpusRelease,
      sourceShard,
      sourceFieldIndexLexeme,
    ] = fields;
    const sourceFieldIndex = Number(sourceFieldIndexLexeme);
    const rowValid =
      fields.length === 8 &&
      ngram === exactForm &&
      /^\d{4}$/.test(year ?? "") &&
      unsignedIntegerLexeme(matchCount) &&
      unsignedIntegerLexeme(volumeCount) &&
      ngramOrderLexeme === String(ngramOrderValue) &&
      corpusRelease === "googlebooks-eng-20200217" &&
      sourceShard === expectedShard &&
      unsignedIntegerLexeme(sourceFieldIndexLexeme) &&
      sourceFieldIndex > 0 &&
      sourceFieldIndex < sourceFields.length &&
      sourceFields[sourceFieldIndex] === `${year},${matchCount},${volumeCount}` &&
      Number(year) <= 2019 &&
      Number.isSafeInteger(Number(matchCount)) &&
      Number.isSafeInteger(Number(volumeCount));
    valid &&= rowValid;
    if (rowValid) {
      rows.push({
        form: exactForm,
        ngramOrder: ngramOrderValue,
        year: Number(year),
        matchCount: Number(matchCount),
        volumeCount: Number(volumeCount),
        sourceWidePath,
        sourceFieldIndex,
        annualPath,
        annualLine: index + 2,
      });
    }
  }
  valid &&=
    rows.length === sourceTuples.length &&
    new Set(rows.map((row) => row.year)).size === rows.length &&
    new Set(rows.map((row) => row.sourceFieldIndex)).size === rows.length &&
    sourceTuples.every((tuple) =>
      rows.some(
        (row) =>
          row.sourceFieldIndex === tuple.sourceFieldIndex &&
          row.year === Number(tuple.year) &&
          row.matchCount === Number(tuple.matchCount) &&
          row.volumeCount === Number(tuple.volumeCount),
      ),
    );
  return { valid, rows: rows.sort((a, b) => a.year - b.year) };
}

function parseFixedAnnualTotals(inputs: InputBundle) {
  const text = inputs.texts.get(FIXED_GOOGLE_PATHS.totalCounts);
  if (text === undefined) return { valid: false, totals: new Map<number, number>() };
  const totals = new Map<number, number>();
  let valid = true;
  const records = text.trim().split(/\s+/).filter(Boolean);
  for (const record of records) {
    const fields = record.split(",");
    const [year, tokenCount, pageCount, volumeCount] = fields;
    const rowValid =
      fields.length === 4 &&
      /^\d{4}$/.test(year ?? "") &&
      unsignedIntegerLexeme(tokenCount) &&
      Number(tokenCount) > 0 &&
      unsignedIntegerLexeme(pageCount) &&
      unsignedIntegerLexeme(volumeCount) &&
      Number.isSafeInteger(Number(year)) &&
      Number.isSafeInteger(Number(tokenCount)) &&
      Number.isSafeInteger(Number(pageCount)) &&
      Number.isSafeInteger(Number(volumeCount)) &&
      !totals.has(Number(year));
    valid &&= rowValid;
    if (rowValid) totals.set(Number(year), Number(tokenCount));
  }
  const years = Array.from(totals.keys());
  valid &&=
    years.length > 0 &&
    Math.max(...years) === 2019 &&
    years.every((year) => year <= 2019);
  return { valid, totals };
}

function roundedMetric(value: number) {
  return Number(value.toPrecision(15));
}

function auditFixedGoogleRelease(inputs: InputBundle): ForeverFixedGoogleReleaseAudit {
  const release = {
    viewerShorthand: "eng_2019" as const,
    persistentIdentifier: "googlebooks-eng-20200217" as const,
    rawReleaseDirectory: "20200217/eng" as const,
    expectedUpperYear: 2019 as const,
  };
  const emptyResult: ForeverFixedGoogleReleaseAudit = {
    outcome: "STOP_GOOGLE_OBJECT_DISCOVERY_FAILED",
    release,
    coreFamily: [
      { form: "forever", ngramOrder: 1, role: "core_joined" },
      { form: "for ever", ngramOrder: 2, role: "core_spaced" },
    ],
    optionalRelatedForms: [
      { form: "forevermore", ngramOrder: 1, blocksCorePairEligibility: false },
    ],
    outOfScopeForms: [
      { form: "forever and ever", ngramOrder: 3, blocksCorePairEligibility: false },
    ],
    scopeDiagnostics: {
      nonGatingForCorePair: true,
      optionalRelatedFormRegistryValid: false,
      outOfScopeTrigramRegistryValid: false,
    },
    fixedViewerSeparateFacets: {
      productionEligible: false,
      validation: {
        frozenRequestPresent: false,
        frozenResponsePresent: false,
        checksumBound: false,
        fixedReleaseExact: false,
        exactCoreForms: false,
        orderSpecificDenominators: false,
        rightsResolved: false,
        activeTransformClosure: false,
      },
      requestPath: FIXED_GOOGLE_PATHS.viewerRequest,
      responsePath: FIXED_GOOGLE_PATHS.viewerResponse,
      responseSha256: null,
      pointCounts: {},
      yearRange: null,
      observations: [],
      rawCompatibleSanity: {
        nonGatingForViewerContract: true,
        nonGatingForRawContract: true,
        form: "forever",
        status: "not_available",
        comparedYears: 0,
        absoluteTolerancePpm: 0.0001,
        maximumAbsoluteDifferencePpm: null,
        sample: null,
        passed: null,
      },
    },
    fixedRawCommonDenominator: {
      productionEligible: false,
      validation: {
        acquisitionIdentity: false,
        checksumBoundSourceObjects: false,
        checksumBoundFrozenInputs: false,
        exactCoreFamily: false,
        exactFormEquality: false,
        ngramOrders: false,
        annualWordTokenTotals: false,
        activeTransformClosure: false,
        rightsResolved: false,
        missingnessTyped: false,
        frozenYearBoundary: false,
        captureTimestampExcludedFromDerivation: true,
      },
      activeDependencyInputPaths: [],
      activeTransformIds: [],
      excludedLegacyPaths: [...LEGACY_FOREVER_PIPELINE_PATHS],
      rightsResolvedBy: null,
      yearRange: null,
      coverageByForm: {},
      annualRates: [],
      annualCoverage: [],
      pairRows: [],
    },
  };

  const viewerDependencyPaths = [
    "scripts/acquire_forever_google_20200217.ts",
    FIXED_GOOGLE_PATHS.rights,
    FIXED_GOOGLE_PATHS.transforms,
    FIXED_GOOGLE_PATHS.checksums,
    FIXED_GOOGLE_PATHS.viewerResponse,
    FIXED_GOOGLE_PATHS.viewerRequest,
  ];
  const rawDependencyPaths = [
    "scripts/acquire_forever_google_20200217.ts",
    FIXED_GOOGLE_PATHS.acquisition,
    FIXED_GOOGLE_PATHS.rights,
    FIXED_GOOGLE_PATHS.transforms,
    FIXED_GOOGLE_PATHS.checksums,
    FIXED_GOOGLE_PATHS.family,
    FIXED_GOOGLE_PATHS.extractionSummary,
    FIXED_GOOGLE_PATHS.totalCounts,
    FIXED_GOOGLE_PATHS.foreverSource,
    FIXED_GOOGLE_PATHS.foreverAnnual,
    FIXED_GOOGLE_PATHS.forEverSource,
    FIXED_GOOGLE_PATHS.forEverAnnual,
  ];
  const partialAcquisition = parseRegisteredJson(inputs, FIXED_GOOGLE_PATHS.acquisition);
  if (isRecord(partialAcquisition) && Array.isArray(partialAcquisition.objects)) {
    const discovered = partialAcquisition.objects.filter(isRecord);
    const sizes = new Map([
      ["unigram-shard", 593_921_274],
      ["bigram-shard", 647_005_430],
      ["annual-token-totals", 13_546],
    ]);
    if (
      Array.from(sizes).every(([id, bytes]) =>
        discovered.some(
          (row) =>
            row.id === id &&
            row.httpStatus === 200 &&
            row.contentLength === bytes &&
            nonEmptyString(row.etag) &&
            nonEmptyString(row.lastModified) &&
            Array.isArray(row.xGoogHash) &&
            row.xGoogHash.length >= 2,
        ),
      )
    ) {
      emptyResult.outcome = "STOP_GOOGLE_DOWNLOAD_OR_CHECKSUM_FAILED";
    }
  }
  const asRecord = (value: unknown): Record<string, unknown> => isRecord(value) ? value : {};
  const acquisition = asRecord(partialAcquisition);
  const rights = asRecord(parseRegisteredJson(inputs, FIXED_GOOGLE_PATHS.rights));
  const transforms = asRecord(parseRegisteredJson(inputs, FIXED_GOOGLE_PATHS.transforms));
  const checksums = asRecord(parseRegisteredJson(inputs, FIXED_GOOGLE_PATHS.checksums));
  const family = asRecord(parseRegisteredJson(inputs, FIXED_GOOGLE_PATHS.family));
  const extraction = asRecord(parseRegisteredJson(inputs, FIXED_GOOGLE_PATHS.extractionSummary));
  const viewerRequest = asRecord(parseRegisteredJson(inputs, FIXED_GOOGLE_PATHS.viewerRequest));
  const viewerResponseValue = parseRegisteredJson(inputs, FIXED_GOOGLE_PATHS.viewerResponse);
  const viewerResponse = Array.isArray(viewerResponseValue) ? viewerResponseValue : [];
  const viewerDependencyPathsPresent = viewerDependencyPaths.every((pathname) =>
    inputs.inputPaths.includes(pathname));
  const rawDependencyPathsPresent = rawDependencyPaths.every((pathname) =>
    inputs.inputPaths.includes(pathname));

  const checksumRows = Array.isArray(checksums.files) ? checksums.files.filter(isRecord) : [];
  const uniqueChecksumDescriptor = (pathname: string) => {
    const matching = checksumRows.filter((row) => row.path === pathname);
    return matching.length === 1 ? matching[0] : null;
  };
  const checksumPathsUniqueWithin = (paths: readonly string[]) =>
    paths.every((pathname) => uniqueChecksumDescriptor(pathname) !== null);
  const checksumBound = (pathname: string) => {
    const row = uniqueChecksumDescriptor(pathname);
    const bytes = inputs.bytes.get(pathname);
    return Boolean(
      row &&
      bytes &&
      row.requiredInTrackedCheckout === true &&
      row.bytes === bytes.byteLength &&
      hasSha256(row.sha256) &&
      sha256(bytes) === row.sha256,
    );
  };
  const exactOrderedStrings = (value: unknown, expected: readonly string[]) =>
    Array.isArray(value) &&
    value.length === expected.length &&
    expected.every((item, index) => value[index] === item);
  const acquisitionScriptPath = "scripts/acquire_forever_google_20200217.ts";
  const transformRows = Array.isArray(transforms.transforms) ? transforms.transforms.filter(isRecord) : [];
  const activeTransforms = transformRows.filter((row) => row.status === "active");
  const excludedTransforms = transformRows.filter((row) => row.status === "excluded_legacy");
  const transformScopes = isRecord(transforms.contractScopes) ? transforms.contractScopes : null;
  const transformScriptBound = (transformId: string) => {
    const transform = activeTransforms.find((row) => row.id === transformId);
    const scriptChecksum = uniqueChecksumDescriptor(acquisitionScriptPath);
    return Boolean(
      transform &&
      scriptChecksum &&
      transform.scriptPath === acquisitionScriptPath &&
      hasSha256(transform.scriptSha256) &&
      transform.scriptSha256 === scriptChecksum.sha256 &&
      checksumBound(acquisitionScriptPath),
    );
  };
  const contractScopeExact = (scopeId: string, expectedTransformIds: readonly string[]) =>
    Boolean(
      transformScopes &&
      exactOrderedStrings(transformScopes[scopeId], expectedTransformIds) &&
      expectedTransformIds.every(
        (transformId) => activeTransforms.filter((row) => row.id === transformId).length === 1,
      ),
    );
  const transformBoundPathsExact = (
    transformId: string,
    direction: "inputs" | "outputs",
    expectedPaths: readonly string[],
  ) => {
    const transform = activeTransforms.find((row) => row.id === transformId);
    const rows = transform && Array.isArray(transform[direction]) ? transform[direction].filter(isRecord) : [];
    const paths = rows.map((row) => row.path);
    return Boolean(
      rows.length === expectedPaths.length &&
      paths.every(nonEmptyString) &&
      new Set(paths).size === rows.length &&
      expectedPaths.every((pathname) => paths.includes(pathname)) &&
      rows.every((descriptor) => {
        const checksumDescriptor = uniqueChecksumDescriptor(String(descriptor.path));
        return Boolean(
          checksumDescriptor &&
          descriptor.bytes === checksumDescriptor.bytes &&
          descriptor.sha256 === checksumDescriptor.sha256 &&
          (checksumDescriptor.requiredInTrackedCheckout !== true || checksumBound(String(descriptor.path))),
        );
      }),
    );
  };

  const rightsDefaults = isRecord(rights.datasetDefaults) ? rights.datasetDefaults : null;
  const rightsOverrides = isRecord(rights.itemOverrides) ? rights.itemOverrides : null;
  const rightsDefaultsValid = Boolean(
    rightsDefaults &&
    rightsDefaults.viewerShorthand === release.viewerShorthand &&
    rightsDefaults.persistentIdentifier === release.persistentIdentifier &&
    nonEmptyString(rightsDefaults.sourceUrl) &&
    rightsDefaults.license === "Creative Commons Attribution 3.0 Unported License" &&
    rightsDefaults.licenseUrl === "https://creativecommons.org/licenses/by/3.0/" &&
    nonEmptyString(rightsDefaults.rightsBoundary),
  );
  const rightsResolvedFor = (activePaths: readonly string[]) =>
    rightsDefaultsValid &&
    Object.entries(rightsOverrides ?? {})
      .filter(([pathname]) => activePaths.includes(pathname))
      .every(
        ([pathname, override]) =>
          nonEmptyString(pathname) &&
          isRecord(override) &&
          nonEmptyString(override.rightsBoundary ?? override.license),
      );
  const viewerRightsResolved = rightsResolvedFor(viewerDependencyPaths);
  const rawRightsResolved = rightsResolvedFor(rawDependencyPaths);
  const rightsResolutionMode = rawRightsResolved
    ? rightsOverrides && Object.keys(rightsOverrides).some((pathname) => rawDependencyPaths.includes(pathname))
      ? "item-override" as const
      : "dataset-default" as const
    : null;

  const requestParams = isRecord(viewerRequest.params) ? viewerRequest.params : null;
  const requestRelease = isRecord(viewerRequest.release) ? viewerRequest.release : null;
  const rawResponseDescriptor = isRecord(viewerRequest.rawResponse) ? viewerRequest.rawResponse : null;
  const returnedDescriptors = Array.isArray(viewerRequest.returned)
    ? viewerRequest.returned.filter(isRecord)
    : [];
  const expectedViewerRequestUrl =
    "https://books.google.com/ngrams/json?content=forever%3Aeng_2019%2Cfor%20ever%3Aeng_2019&year_start=1500&year_end=2019&corpus=26&smoothing=0&case_insensitive=false";
  const viewerReleaseExact = Boolean(
    requestParams &&
    requestRelease &&
    viewerRequest.requestUrl === expectedViewerRequestUrl &&
    exactOrderedStrings(requestParams.canonicalSurfaceForms, ["forever", "for ever"]) &&
    exactOrderedStrings(requestParams.content, ["forever:eng_2019", "for ever:eng_2019"]) &&
    requestParams.corpusSelector === release.viewerShorthand &&
    requestParams.corpusQueryParam === 26 &&
    requestRelease.viewerShorthand === release.viewerShorthand &&
    requestRelease.persistentIdentifier === release.persistentIdentifier &&
    requestParams.yearStart === 1500 &&
    requestParams.yearEnd === 2019 &&
    requestParams.smoothing === 0 &&
    requestParams.caseSensitive === true &&
    requestParams.caseInsensitiveRequestValue === false,
  );
  const viewerReturnedLabelsExact =
    returnedDescriptors.length === 2 &&
    (["forever", "for ever"] as const).every((form) =>
      returnedDescriptors.some(
        (row) =>
          row.canonicalSurfaceForm === form &&
          row.ngram === `${form}:${release.viewerShorthand}` &&
          row.parent === "" &&
          row.type === "NGRAM" &&
          row.pointCount === 520,
      ),
    );
  const viewerRows = viewerResponse.filter(isRecord);
  const viewerExactCore =
    viewerRows.length === 2 &&
    ["forever", "for ever"].every((form) =>
      viewerRows.some(
        (row) =>
          row.ngram === `${form}:${release.viewerShorthand}` &&
          row.parent === "" &&
          row.type === "NGRAM" &&
          Array.isArray(row.timeseries) &&
          row.timeseries.length === 520 &&
          row.timeseries.every((value) => typeof value === "number" && Number.isFinite(value) && value >= 0),
      ),
    );
  const viewerChecksumBound = Boolean(
    rawResponseDescriptor &&
    rawResponseDescriptor.path === FIXED_GOOGLE_PATHS.viewerResponse &&
    checksumBound(FIXED_GOOGLE_PATHS.viewerResponse) &&
    checksumBound(FIXED_GOOGLE_PATHS.viewerRequest) &&
    rawResponseDescriptor.bytes === inputs.bytes.get(FIXED_GOOGLE_PATHS.viewerResponse)?.byteLength &&
    rawResponseDescriptor.sha256 === sha256(inputs.bytes.get(FIXED_GOOGLE_PATHS.viewerResponse)!),
  );
  const viewerFreezeTransform = activeTransforms.find(
    (row) => row.id === "google-20200217-viewer-freeze",
  );
  const viewerTransformClosure = Boolean(
    viewerDependencyPathsPresent &&
    viewerFreezeTransform &&
    checksumBound(FIXED_GOOGLE_PATHS.transforms) &&
    checksumBound(acquisitionScriptPath) &&
    contractScopeExact("fixed-viewer-separate-facets", ["google-20200217-viewer-freeze"]) &&
    transformScriptBound("google-20200217-viewer-freeze") &&
    transformBoundPathsExact("google-20200217-viewer-freeze", "inputs", []) &&
    Array.isArray(viewerFreezeTransform.externalInputs) &&
    viewerFreezeTransform.externalInputs.length === 1 &&
    viewerFreezeTransform.externalInputs.every(
      (row) =>
        isRecord(row) &&
        row.url === viewerRequest.requestUrl &&
        row.method === "GET" &&
        row.release === release.persistentIdentifier &&
        row.viewerShorthand === release.viewerShorthand &&
        row.corpusSelectionMethod === "inline :eng_2019 selector plus Viewer UI numeric ID" &&
        row.corpusQueryParam === 26 &&
        row.smoothing === 0 &&
        row.caseSensitive === true,
    ) &&
    nonEmptyString(viewerFreezeTransform.formula) &&
    transformBoundPathsExact("google-20200217-viewer-freeze", "outputs", [
      FIXED_GOOGLE_PATHS.viewerResponse,
      FIXED_GOOGLE_PATHS.viewerRequest,
    ])
  );
  const viewerValidation = {
    dependencyPathsPresent: viewerDependencyPathsPresent,
    frozenRequestPresent: inputs.inputPaths.includes(FIXED_GOOGLE_PATHS.viewerRequest),
    frozenResponsePresent: inputs.inputPaths.includes(FIXED_GOOGLE_PATHS.viewerResponse),
    checksumPathsUnique: checksumPathsUniqueWithin(
      viewerDependencyPaths.filter((pathname) => pathname !== FIXED_GOOGLE_PATHS.checksums),
    ),
    checksumAlgorithmSha256: checksums.algorithm === "sha256",
    checksumBound: viewerChecksumBound,
    fixedReleaseExact: viewerReleaseExact,
    exactCoreForms: viewerExactCore,
    returnedLabelsExact: viewerReturnedLabelsExact,
    orderSpecificDenominators: viewerExactCore,
    rightsResolved: viewerRightsResolved,
    rightsChecksumBound: checksumBound(FIXED_GOOGLE_PATHS.rights),
    activeTransformClosure: viewerTransformClosure,
  };
  const viewerStructuralEligible = Object.values(viewerValidation).every(Boolean);
  const viewerObservations = viewerStructuralEligible
    ? (["forever", "for ever"] as const).flatMap((form) => {
        const responseRowIndex = viewerRows.findIndex((row) => row.ngram === `${form}:${release.viewerShorthand}`);
        const responseRow = viewerRows[responseRowIndex]!;
        const order = form === "forever" ? 1 as const : 2 as const;
        const unit = form === "forever" ? "per million unigrams" as const : "per million bigrams" as const;
        return (responseRow.timeseries as number[]).map((viewerFraction, timeseriesIndex) => ({
          form,
          ngramOrder: order,
          year: 1500 + timeseriesIndex,
          viewerFraction,
          perMillionOrderNgrams: roundedMetric(viewerFraction * 1_000_000),
          unit,
          state: viewerFraction > 0 ? "observed_positive" as const : "absent_or_suppressed" as const,
          responsePath: FIXED_GOOGLE_PATHS.viewerResponse,
          responseRowIndex,
          timeseriesIndex,
        }));
      })
    : [];
  emptyResult.fixedViewerSeparateFacets = {
    productionEligible: viewerStructuralEligible,
    validation: viewerValidation,
    requestPath: FIXED_GOOGLE_PATHS.viewerRequest,
    responsePath: FIXED_GOOGLE_PATHS.viewerResponse,
    responseSha256: viewerChecksumBound
      ? sha256(inputs.bytes.get(FIXED_GOOGLE_PATHS.viewerResponse)!)
      : null,
    pointCounts: Object.fromEntries(
      viewerRows.map((row) => [String(row.ngram).replace(`:${release.viewerShorthand}`, ""), Array.isArray(row.timeseries) ? row.timeseries.length : 0]),
    ),
    yearRange: viewerReleaseExact ? { start: 1500, end: 2019 } : null,
    observations: viewerObservations,
    rawCompatibleSanity: emptyResult.fixedViewerSeparateFacets.rawCompatibleSanity,
  };

  const acquisitionRelease = isRecord(acquisition.release) ? acquisition.release : null;
  const diskPreflight = isRecord(acquisition.diskPreflight) ? acquisition.diskPreflight : null;
  const acquisitionObjects = Array.isArray(acquisition.objects) ? acquisition.objects.filter(isRecord) : [];
  const expectedObjects = new Map([
    ["unigram-shard", {
      bytes: 593_921_274,
      url: "https://storage.googleapis.com/books/ngrams/books/20200217/eng/1-00018-of-00024.gz",
      etag: "d42b5cec82ecb6d0b5f19d018fcd1743",
      md5Base64: "1Ctc7ILsttC18Z0Bj80XQw==",
      lastModified: "Sat, 14 Mar 2020 01:29:37 GMT",
    }],
    ["bigram-shard", {
      bytes: 647_005_430,
      url: "https://storage.googleapis.com/books/ngrams/books/20200217/eng/2-00407-of-00589.gz",
      etag: "8fe3ba01e4032bf15184824b20143529",
      md5Base64: "j+O6AeQDK/FRhIJLIBQ1KQ==",
      lastModified: "Sat, 14 Mar 2020 01:32:03 GMT",
    }],
    ["annual-token-totals", {
      bytes: 13_546,
      url: "https://storage.googleapis.com/books/ngrams/books/20200217/eng/totalcounts-1",
      etag: "fea9f8e9fe2c9b7b6862ec292a11e23d",
      md5Base64: "/qn46f4sm3toYuwpKhHiPQ==",
      lastModified: "Tue, 14 Jul 2020 16:49:55 GMT",
    }],
  ]);
  const acquisitionIdentity = Boolean(
    acquisitionRelease &&
    diskPreflight &&
    nonEmptyString(acquisition.retrievalStartedAt) &&
    nonEmptyString(acquisition.discoveryCompletedAt) &&
    diskPreflight.passed === true &&
    Number.isSafeInteger(diskPreflight.availableBytes) &&
    Number.isSafeInteger(diskPreflight.requiredBytes) &&
    Number(diskPreflight.availableBytes) >= Number(diskPreflight.requiredBytes) &&
    diskPreflight.coreShardCompressedBytes === 1_240_926_704 &&
    diskPreflight.totalDownloadBytes === 1_240_940_250 &&
    acquisitionRelease.viewerShorthand === release.viewerShorthand &&
    acquisitionRelease.persistentIdentifier === release.persistentIdentifier &&
    acquisitionRelease.rawReleaseDirectory === release.rawReleaseDirectory &&
    acquisitionRelease.expectedUpperYear === release.expectedUpperYear &&
    acquisition.officialIndexUrl === "https://storage.googleapis.com/books/ngrams/books/datasetsv3.html" &&
    Array.from(expectedObjects).every(([id, expected]) =>
      acquisitionObjects.some(
        (row) =>
          row.id === id &&
          row.url === expected.url &&
          row.httpStatus === 200 &&
          row.contentLength === expected.bytes &&
          row.expectedBytes === expected.bytes &&
          row.expectedEtag === expected.etag &&
          row.lastModified === expected.lastModified &&
          row.expectedLastModified === expected.lastModified &&
          Array.isArray(row.xGoogHash) &&
          row.xGoogHash.includes(`md5=${expected.md5Base64}`) &&
          isRecord(row.local) &&
          row.local.exists === true &&
          row.local.bytes === expected.bytes &&
          hasSha256(row.local.sha256) &&
          row.local.verifiedAgainstOfficialMd5 === true &&
          nonEmptyString(row.local.md5Hex) &&
          nonEmptyString(row.local.md5Base64) &&
          row.local.md5Hex === expected.etag &&
          row.local.md5Base64 === expected.md5Base64 &&
          String(row.etag).replace(/^"|"$/g, "") === row.local.md5Hex &&
          row.xGoogHash.includes(`md5=${row.local.md5Base64}`) &&
          Array.isArray(row.expectedXGoogHash) &&
          row.expectedXGoogHash.includes(`md5=${row.local.md5Base64}`),
      ),
    ),
  );

  const familyCoreForms = Array.isArray(family.coreForms) ? family.coreForms.filter(isRecord) : [];
  const familyOptionalForms = Array.isArray(family.optionalRelatedForms)
    ? family.optionalRelatedForms.filter(isRecord)
    : [];
  const familyOutOfScope = Array.isArray(family.outOfScope) ? family.outOfScope.filter(isRecord) : [];
  const optionalRelatedFormRegistryValid =
    familyOptionalForms.length === 1 &&
    familyOptionalForms.every((row) => row.blocksCorePairEligibility === false) &&
    familyOptionalForms.some(
      (row) =>
        row.exactForm === "forevermore" &&
        row.ngramOrder === 1 &&
        row.role === "optional_related" &&
        row.wideRawFile === FIXED_GOOGLE_PATHS.forevermoreSource &&
        row.annualFile === FIXED_GOOGLE_PATHS.forevermoreAnnual,
    );
  const outOfScopeTrigramRegistryValid =
    familyOutOfScope.length === 1 &&
    familyOutOfScope.some(
      (row) =>
        row.exactForm === "forever and ever" &&
        row.ngramOrder === 3 &&
        row.role === "independent_trigram_phrase" &&
        row.acquired === false &&
        row.blocksCorePairEligibility === false,
    );
  emptyResult.scopeDiagnostics = {
    nonGatingForCorePair: true,
    optionalRelatedFormRegistryValid,
    outOfScopeTrigramRegistryValid,
  };
  const exactCoreFamily =
    family.release === release.persistentIdentifier &&
    family.viewerShorthand === release.viewerShorthand &&
    isRecord(family.viewerRequestBoundary) &&
    family.viewerRequestBoundary.start === 1500 &&
    family.viewerRequestBoundary.end === 2019 &&
    family.expectedRawUpperYear === 2019 &&
    familyCoreForms.length === 2 &&
    familyCoreForms.every((row) => row.blocksCorePairEligibility === true) &&
    familyCoreForms.some(
      (row) =>
        row.exactForm === "forever" &&
        row.ngramOrder === 1 &&
        row.role === "core_joined" &&
        row.wideRawFile === FIXED_GOOGLE_PATHS.foreverSource &&
        row.annualFile === FIXED_GOOGLE_PATHS.foreverAnnual &&
        row.sourceShard === "https://storage.googleapis.com/books/ngrams/books/20200217/eng/1-00018-of-00024.gz",
    ) &&
    familyCoreForms.some(
      (row) =>
        row.exactForm === "for ever" &&
        row.ngramOrder === 2 &&
        row.role === "core_spaced" &&
        row.wideRawFile === FIXED_GOOGLE_PATHS.forEverSource &&
        row.annualFile === FIXED_GOOGLE_PATHS.forEverAnnual &&
        row.sourceShard === "https://storage.googleapis.com/books/ngrams/books/20200217/eng/2-00407-of-00589.gz",
    );

  const joinedParsed = parseFixedRawRows(
    inputs,
    FIXED_GOOGLE_PATHS.foreverSource,
    FIXED_GOOGLE_PATHS.foreverAnnual,
    "forever",
    1,
  );
  const spacedParsed = parseFixedRawRows(
    inputs,
    FIXED_GOOGLE_PATHS.forEverSource,
    FIXED_GOOGLE_PATHS.forEverAnnual,
    "for ever",
    2,
  );
  const totalsParsed = parseFixedAnnualTotals(inputs);
  const rawRows = [...joinedParsed.rows, ...spacedParsed.rows];
  const frozenInputsChecksumBound =
    checksums.algorithm === "sha256" && [
    acquisitionScriptPath,
    FIXED_GOOGLE_PATHS.acquisition,
    FIXED_GOOGLE_PATHS.transforms,
    FIXED_GOOGLE_PATHS.foreverSource,
    FIXED_GOOGLE_PATHS.foreverAnnual,
    FIXED_GOOGLE_PATHS.forEverSource,
    FIXED_GOOGLE_PATHS.forEverAnnual,
    FIXED_GOOGLE_PATHS.totalCounts,
    FIXED_GOOGLE_PATHS.family,
    FIXED_GOOGLE_PATHS.extractionSummary,
    FIXED_GOOGLE_PATHS.rights,
    ].every(checksumBound);
  const sourceObjectChecksumsBound = acquisitionObjects.every((row) => {
    if (!isRecord(row.local) || !nonEmptyString(row.local.cachePath)) return false;
    const descriptor = uniqueChecksumDescriptor(row.local.cachePath);
    return Boolean(
      descriptor &&
      descriptor.requiredInTrackedCheckout === false &&
      descriptor.bytes === row.local.bytes &&
      descriptor.sha256 === row.local.sha256,
    );
  }) && acquisitionObjects.length === 3;

  const commonTransformIds = [
    "google-20200217-core-exact-form-extraction",
    "google-20200217-core-wide-to-annual-expansion",
    "google-20200217-totalcounts-freeze",
  ] as const;
  const activeTransformClosure =
    rawDependencyPathsPresent &&
    checksumBound(acquisitionScriptPath) &&
    checksumBound(FIXED_GOOGLE_PATHS.transforms) &&
    contractScopeExact("fixed-raw-common-denominator", commonTransformIds) &&
    commonTransformIds.every(transformScriptBound) &&
    activeTransforms.some(
      (row) =>
        row.id === "google-20200217-core-exact-form-extraction" &&
        row.scriptPath === acquisitionScriptPath &&
        nonEmptyString(row.formula) &&
        nonEmptyString(row.missingnessPolicy),
    ) &&
    activeTransforms.some(
      (row) =>
        row.id === "google-20200217-totalcounts-freeze" &&
        row.scriptPath === acquisitionScriptPath &&
        nonEmptyString(row.formula),
    ) &&
    activeTransforms.some(
      (row) =>
        row.id === "google-20200217-core-wide-to-annual-expansion" &&
        row.scriptPath === acquisitionScriptPath &&
        nonEmptyString(row.formula) &&
        nonEmptyString(row.missingnessPolicy),
    ) &&
    transformBoundPathsExact("google-20200217-core-exact-form-extraction", "inputs", [
      ".cache/google-ngram/20200217/eng/1-00018-of-00024.gz",
      ".cache/google-ngram/20200217/eng/2-00407-of-00589.gz",
    ]) &&
    transformBoundPathsExact("google-20200217-core-exact-form-extraction", "outputs", [
      FIXED_GOOGLE_PATHS.foreverSource,
      FIXED_GOOGLE_PATHS.forEverSource,
    ]) &&
    transformBoundPathsExact("google-20200217-core-wide-to-annual-expansion", "inputs", [
      FIXED_GOOGLE_PATHS.foreverSource,
      FIXED_GOOGLE_PATHS.forEverSource,
    ]) &&
    transformBoundPathsExact("google-20200217-core-wide-to-annual-expansion", "outputs", [
      FIXED_GOOGLE_PATHS.foreverAnnual,
      FIXED_GOOGLE_PATHS.forEverAnnual,
    ]) &&
    transformBoundPathsExact("google-20200217-totalcounts-freeze", "inputs", [
      ".cache/google-ngram/20200217/eng/totalcounts-1",
    ]) &&
    transformBoundPathsExact("google-20200217-totalcounts-freeze", "outputs", [
      FIXED_GOOGLE_PATHS.totalCounts,
    ]);

  const totalYears = Array.from(totalsParsed.totals.keys()).filter((year) => year <= 2019);
  const analysisStartYear = totalYears.length > 0 ? Math.min(...totalYears) : null;
  const analysisEndYear = totalYears.length > 0 ? Math.max(...totalYears) : null;
  const frozenYearBoundary =
    totalsParsed.valid &&
    analysisStartYear !== null &&
    analysisEndYear === 2019 &&
    !Array.from(totalsParsed.totals.keys()).some((year) => year > 2019) &&
    rawRows.every((row) => row.year <= 2019);
  const exactFormEquality = joinedParsed.valid && spacedParsed.valid;
  const ngramOrders = rawRows.every((row) =>
    row.form === "forever" ? row.ngramOrder === 1 : row.ngramOrder === 2,
  );
  const annualRates = rawRows.filter((row) => totalsParsed.totals.has(row.year)).map((row) => ({
    form: row.form,
    ngramOrder: row.ngramOrder,
    year: row.year,
    matchCount: row.matchCount,
    volumeCount: row.volumeCount,
    annualWordTokens: totalsParsed.totals.get(row.year)!,
    appearancesPerMillionWordTokens: roundedMetric(
      (row.matchCount / totalsParsed.totals.get(row.year)!) * 1_000_000,
    ),
    state: row.matchCount === 0 ? "observed_zero" as const : "observed_positive" as const,
    sourceWidePath: row.sourceWidePath,
    sourceFieldIndex: row.sourceFieldIndex,
    annualPath: row.annualPath,
    annualLine: row.annualLine,
  }));
  const viewerUnigramByYear = new Map(
    viewerObservations
      .filter((row) => row.form === "forever")
      .map((row) => [row.year, row.perMillionOrderNgrams]),
  );
  const sanityPairs = annualRates
    .filter((row) => row.form === "forever" && viewerUnigramByYear.has(row.year))
    .map((row) => ({
      year: row.year,
      rawPerMillionWordTokens: row.appearancesPerMillionWordTokens,
      viewerPerMillionUnigrams: viewerUnigramByYear.get(row.year)!,
      absoluteDifferencePpm: Math.abs(
        row.appearancesPerMillionWordTokens - viewerUnigramByYear.get(row.year)!,
      ),
    }));
  const sanityTolerancePpm = 0.0001;
  const maximumSanityDifference = sanityPairs.length
    ? Math.max(...sanityPairs.map((row) => row.absoluteDifferencePpm))
    : null;
  const sanitySample = sanityPairs.find((row) => row.year === 2019) ?? sanityPairs.at(-1) ?? null;
  const rawCompatibleSanityPassed =
    sanityPairs.length > 0 &&
    maximumSanityDifference !== null &&
    maximumSanityDifference <= sanityTolerancePpm;
  const rateByFormYear = new Map(
    annualRates.map((row) => [`${row.form}:${row.year}`, row]),
  );
  const annualCoverage = (["forever", "for ever"] as const).flatMap((form) =>
    analysisStartYear === null || analysisEndYear === null
      ? []
      : Array.from({ length: analysisEndYear - analysisStartYear + 1 }, (_, index) => {
      const year = analysisStartYear + index;
      const rate = rateByFormYear.get(`${form}:${year}`);
      return {
        form,
        year,
        state: !totalsParsed.totals.has(year)
          ? "unavailable" as const
          : rate
            ? rate.state
            : "absent_or_suppressed" as const,
      };
    }),
  );
  const pairRows = analysisStartYear === null || analysisEndYear === null
    ? []
    : Array.from({ length: analysisEndYear - analysisStartYear + 1 }, (_, index) => {
    const year = analysisStartYear + index;
    const joined = rateByFormYear.get(`forever:${year}`);
    const spaced = rateByFormYear.get(`for ever:${year}`);
    if (!joined || !spaced) {
      return {
        year,
        state: "incomparable" as const,
        joinedRate: joined?.appearancesPerMillionWordTokens ?? null,
        spacedRate: spaced?.appearancesPerMillionWordTokens ?? null,
        joinedShare: null,
        rawRatio: null,
      };
    }
    return {
      year,
      state: joined.matchCount === 0 || spaced.matchCount === 0
        ? "observed_zero" as const
        : "observed_positive" as const,
      joinedRate: joined.appearancesPerMillionWordTokens,
      spacedRate: spaced.appearancesPerMillionWordTokens,
      joinedShare: joined.matchCount + spaced.matchCount === 0
        ? null
        : roundedMetric(joined.matchCount / (joined.matchCount + spaced.matchCount)),
      rawRatio: spaced.matchCount === 0
        ? null
        : roundedMetric(joined.matchCount / spaced.matchCount),
    };
  });
  const extractionForms = Array.isArray(extraction.forms) ? extraction.forms.filter(isRecord) : [];
  const expectedAnnualSchema = [
    "ngram",
    "year",
    "match_count",
    "volume_count",
    "ngram_order",
    "corpus_release",
    "source_shard",
    "wide_field_index",
  ];
  const extractionAnnualSchema = Array.isArray(extraction.annualExpandedSchema)
    ? extraction.annualExpandedSchema
    : [];
  const expectedCoreExtractions: Array<[
    FixedRawRow["form"],
    FixedRawRow["ngramOrder"],
    string,
    string,
    FixedRawRow[],
  ]> = [
    ["forever", 1, FIXED_GOOGLE_PATHS.foreverSource, FIXED_GOOGLE_PATHS.foreverAnnual, joinedParsed.rows],
    ["for ever", 2, FIXED_GOOGLE_PATHS.forEverSource, FIXED_GOOGLE_PATHS.forEverAnnual, spacedParsed.rows],
  ];
  const extractionLineageValidated =
    extraction.release === release.persistentIdentifier &&
    extraction.exactEqualityOnly === true &&
    nonEmptyString(extraction.rawCoverageRule) &&
    String(extraction.rawCoverageRule).includes("raw lower bound is not assumed") &&
    extraction.sparseAbsencePolicy ===
      "Only source rows that exactly equal the registered form are retained. A missing form-year is absent_or_suppressed, never silently converted to observed_zero." &&
    extractionAnnualSchema.length === expectedAnnualSchema.length &&
    expectedAnnualSchema.every((field, index) => extractionAnnualSchema[index] === field) &&
    nonEmptyString(extraction.wideFieldIndex) &&
    expectedCoreExtractions.every(([form, order, wideRawFile, annualFile, parsedRows]) =>
      extractionForms.some(
        (row) =>
          row.exactForm === form &&
          row.ngramOrder === order &&
          row.wideRawFile === wideRawFile &&
          row.annualFile === annualFile &&
          isRecord(row.stats) &&
          row.stats.sourceRecords === 1 &&
          row.stats.annualRows === parsedRows.length &&
          row.stats.earliestYear === parsedRows[0]?.year &&
          row.stats.latestYear === parsedRows.at(-1)?.year &&
          Array.isArray(row.stats.explicitZeroYears) &&
          exactOrderedStrings(
            row.stats.explicitZeroYears.map(String),
            parsedRows.filter((parsedRow) => parsedRow.matchCount === 0).map((parsedRow) => String(parsedRow.year)),
          ),
      ),
    );
  const derivedResearchBytes = jsonText({ annualRates, annualCoverage, pairRows });
  const captureTimestampValues = [
    acquisition.retrievalStartedAt,
    acquisition.discoveryCompletedAt,
    viewerRequest.capturedAt,
  ].filter(nonEmptyString);
  const captureTimestampExcludedFromDerivation =
    captureTimestampValues.length > 0 &&
    captureTimestampValues.every((timestamp) => !derivedResearchBytes.includes(timestamp));
  const commonValidation = {
    dependencyPathsPresent: rawDependencyPathsPresent,
    checksumPathsUnique: checksumPathsUniqueWithin(
      rawDependencyPaths.filter((pathname) => pathname !== FIXED_GOOGLE_PATHS.checksums),
    ),
    acquisitionIdentity,
    checksumBoundSourceObjects: sourceObjectChecksumsBound,
    checksumBoundFrozenInputs: frozenInputsChecksumBound,
    exactCoreFamily,
    exactFormEquality,
    ngramOrders,
    annualWordTokenTotals: totalsParsed.valid,
    activeTransformClosure,
    rightsResolved: rawRightsResolved,
    missingnessTyped: extractionLineageValidated,
    frozenYearBoundary,
    captureTimestampExcludedFromDerivation,
  };
  const commonEligible = Object.values(commonValidation).every(Boolean);
  const sanityAvailable = commonEligible && viewerStructuralEligible;
  emptyResult.fixedViewerSeparateFacets.rawCompatibleSanity = {
    nonGatingForViewerContract: true,
    nonGatingForRawContract: true,
    form: "forever",
    status: !sanityAvailable
      ? "not_available"
      : rawCompatibleSanityPassed
        ? "passed"
        : "failed",
    comparedYears: sanityAvailable ? sanityPairs.length : 0,
    absoluteTolerancePpm: sanityTolerancePpm,
    maximumAbsoluteDifferencePpm:
      sanityAvailable && maximumSanityDifference !== null
        ? roundedMetric(maximumSanityDifference)
        : null,
    sample: sanityAvailable && sanitySample
      ? {
          ...sanitySample,
          absoluteDifferencePpm: roundedMetric(sanitySample.absoluteDifferencePpm),
        }
      : null,
    passed: sanityAvailable ? rawCompatibleSanityPassed : null,
  };
  const coverageByForm = Object.fromEntries(
    (["forever", "for ever"] as const).map((form) => {
      const formRows = rawRows.filter((row) => row.form === form);
      return [form, {
        retainedRows: formRows.length,
        earliestRetainedYear: formRows[0]?.year ?? null,
        latestRetainedYear: formRows.at(-1)?.year ?? null,
        observedZeroYears: annualCoverage.filter(
          (row) => row.form === form && row.state === "observed_zero",
        ).length,
        absentOrSuppressedYears: annualCoverage.filter(
          (row) => row.form === form && row.state === "absent_or_suppressed",
        ).length,
        unavailableDenominatorYears: annualCoverage.filter(
          (row) => row.form === form && row.state === "unavailable",
        ).length,
      }];
    }),
  );
  emptyResult.fixedRawCommonDenominator = {
    productionEligible: commonEligible,
    validation: commonValidation,
    activeDependencyInputPaths: [
      "scripts/acquire_forever_google_20200217.ts",
      FIXED_GOOGLE_PATHS.acquisition,
      FIXED_GOOGLE_PATHS.rights,
      FIXED_GOOGLE_PATHS.transforms,
      FIXED_GOOGLE_PATHS.checksums,
      FIXED_GOOGLE_PATHS.family,
      FIXED_GOOGLE_PATHS.extractionSummary,
      FIXED_GOOGLE_PATHS.foreverSource,
      FIXED_GOOGLE_PATHS.foreverAnnual,
      FIXED_GOOGLE_PATHS.forEverSource,
      FIXED_GOOGLE_PATHS.forEverAnnual,
      FIXED_GOOGLE_PATHS.totalCounts,
    ],
    activeTransformIds: [
      ...commonTransformIds,
    ],
    excludedLegacyPaths: unique([
      ...LEGACY_FOREVER_PIPELINE_PATHS,
      ...excludedTransforms.map((row) => String(row.scriptPath)).filter(Boolean),
    ]),
    rightsResolvedBy: rightsResolutionMode,
    yearRange: frozenYearBoundary && analysisStartYear !== null
      ? { start: analysisStartYear, end: 2019 }
      : null,
    coverageByForm,
    annualRates: commonEligible ? annualRates : [],
    annualCoverage: commonEligible ? annualCoverage : [],
    pairRows: commonEligible ? pairRows : [],
  };
  emptyResult.outcome = commonEligible
    ? "GOOGLE_COMMON_DENOMINATOR_CONTRACT_READY"
    : emptyResult.fixedViewerSeparateFacets.productionEligible
      ? "PARTIAL_GOOGLE_VIEWER_CONTRACT_READY"
      : !acquisitionIdentity || !frozenInputsChecksumBound
        ? "STOP_GOOGLE_DOWNLOAD_OR_CHECKSUM_FAILED"
        : !exactFormEquality || !ngramOrders
          ? "STOP_GOOGLE_RAW_PARSE_FAILED"
          : "STOP_GOOGLE_COMMON_DENOMINATOR_FAILED";
  return emptyResult;
}

function validateCanonicalFormRegistry(inputs: InputBundle) {
  const value = parseRegisteredJson(inputs, CANONICAL_FORM_REGISTRY_PATH);
  if (!isRecord(value) || !Array.isArray(value.forms) || !isRecord(value.analysisWindow)) return null;
  const startYear = value.analysisWindow.startYear;
  const endYear = value.analysisWindow.endYear;
  if (!Number.isInteger(startYear) || !Number.isInteger(endYear) || Number(startYear) > Number(endYear)) return null;
  const rows = value.forms.filter(isRecord);
  const required = new Map([
    ["forever", 1],
    ["for ever", 2],
  ]);
  const valid =
    (value.completeCorePair === true || value.completeFamily === true) &&
    nonEmptyString(value.familyPolicy) &&
    rows.length >= required.size &&
    new Set(rows.map((row) => row.form)).size === rows.length &&
    rows.every(
      (row) =>
        nonEmptyString(row.form) &&
        row.ngramOrder === ngramOrder(row.form) &&
        nonEmptyString(row.casePolicy) &&
        nonEmptyString(row.joinedSpacedPolicy) &&
        nonEmptyString(row.hyphenPolicy) &&
        row.queryPreregistered === true,
    ) &&
    Array.from(required).every(([form, order]) =>
      rows.some(
        (row) =>
          row.form === form &&
          row.ngramOrder === order &&
          (!nonEmptyString(row.scope) || row.scope === "core"),
      ),
    ) &&
    !rows.some((row) => row.form === "forever and ever" && row.scope === "core");
  return valid ? { startYear: Number(startYear), endYear: Number(endYear) } : null;
}

function validateViewerRawResponse(inputs: InputBundle) {
  const value = parseRegisteredJson(inputs, VIEWER_RAW_RESPONSE_PATH);
  if (!isRecord(value) || !isRecord(value.request) || !isRecord(value.provenance)) return false;
  const rawResponsePath = value.provenance.rawResponsePath;
  if (!checksumBindsRegisteredBytes(inputs, rawResponsePath, value.provenance.responseSha256)) return false;
  const response = typeof rawResponsePath === "string" ? parseRegisteredJson(inputs, rawResponsePath) : null;
  if (!Array.isArray(response)) return false;
  const queries = value.request.queries;
  const seriesRows = response.filter(isRecord);
  const startYear = value.request.startYear;
  const endYear = value.request.endYear;
  const expectedPointCount = Number(endYear) - Number(startYear) + 1;
  return (
    Array.isArray(queries) &&
    ["forever", "for ever"].every((query) => queries.includes(query)) &&
    nonEmptyString(value.request.persistentCorpusId) &&
    Number.isInteger(startYear) &&
    Number.isInteger(endYear) &&
    expectedPointCount > 0 &&
    value.request.smoothing === 0 &&
    nonEmptyString(value.provenance.officialUrl) &&
    /^https:\/\/(?:books\.google\.com|storage\.googleapis\.com)\//.test(value.provenance.officialUrl) &&
    hasSha256(value.provenance.responseSha256) &&
    seriesRows.length > 0 &&
    ["forever", "for ever"].every((query) =>
      seriesRows.some(
        (row) =>
          row.ngram === query &&
          typeof row.parent === "string" &&
          typeof row.type === "string" &&
          Array.isArray(row.timeseries) &&
          row.timeseries.length === expectedPointCount &&
          row.timeseries.every((point) => typeof point === "number" && Number.isFinite(point) && point >= 0),
      ),
    )
  );
}

function validateCommonDenominatorFile(inputs: InputBundle) {
  const value = parseRegisteredJson(inputs, COMMON_DENOMINATOR_PATH);
  const canonicalRegistry = validateCanonicalFormRegistry(inputs);
  if (!isRecord(value) || !isRecord(value.source) || !isRecord(value.analysisWindow) || canonicalRegistry === null) {
    return false;
  }
  const source = value.source;
  const officialUrlsValid = [source.officialMatchSourceUrl, source.officialAnnualTotalsUrl].every(
    (url) => typeof url === "string" && /^https:\/\/storage\.googleapis\.com\/books\/ngrams\//.test(url),
  );
  const sourceValid =
    officialUrlsValid &&
    nonEmptyString(source.persistent_corpus_id) &&
    nonEmptyString(source.release) &&
    checksumBindsRegisteredBytes(inputs, source.match_rows_path, source.match_rows_sha256) &&
    checksumBindsRegisteredBytes(inputs, source.annual_totals_path, source.annual_totals_sha256) &&
    nonEmptyString(source.rights_boundary);
  const windowValid =
    value.analysisWindow.startYear === canonicalRegistry.startYear &&
    value.analysisWindow.endYear === canonicalRegistry.endYear;
  const matchText = typeof source.match_rows_path === "string" ? inputs.texts.get(source.match_rows_path) : undefined;
  const totalsText = typeof source.annual_totals_path === "string" ? inputs.texts.get(source.annual_totals_path) : undefined;
  if (!sourceValid || !windowValid || matchText === undefined || totalsText === undefined) return false;
  const totalRows = parseTsv(totalsText);
  const totalsValid =
    totalRows.length > 0 &&
    totalRows.every(
      (row) =>
        yearLexeme(row.year) &&
        Number(row.year) >= canonicalRegistry.startYear &&
        Number(row.year) <= canonicalRegistry.endYear &&
        unsignedIntegerLexeme(row.annual_word_tokens) &&
        Number(row.annual_word_tokens) > 0 &&
        row.release === source.release,
    ) &&
    new Set(totalRows.map((row) => row.year)).size === totalRows.length;
  const expectedYears = Array.from(
    { length: canonicalRegistry.endYear - canonicalRegistry.startYear + 1 },
    (_, index) => canonicalRegistry.startYear + index,
  );
  const totalYears = new Set(totalRows.map((row) => Number(row.year)));
  const matchRows = parseTsv(matchText);
  const expectedOrder = new Map([
    ["forever", "1"],
    ["for ever", "2"],
  ]);
  const matchesValid =
    matchRows.length > 0 &&
    matchRows.every(
      (row) =>
        expectedOrder.get(row.form) === row.ngram_order &&
        yearLexeme(row.year) &&
        unsignedIntegerLexeme(row.match_count) &&
        // Official shard exports are sparse. Retained rows are positive
        // observations; an absent form-year remains absent_or_suppressed and
        // must never be synthesized as observed_zero here.
        Number(row.match_count) > 0 &&
        row.release === source.release &&
        totalYears.has(Number(row.year)),
    ) &&
    new Set(matchRows.map((row) => `${row.form}:${row.year}`)).size === matchRows.length;
  const bothCoreFormsPresent = Array.from(expectedOrder.keys()).every((form) =>
    matchRows.some((row) => row.form === form),
  );

  return totalsValid && totalRows.length === expectedYears.length && matchesValid && bothCoreFormsPresent;
}

function validateGutenbergRawManifest(inputs: InputBundle) {
  const value = parseRegisteredJson(inputs, GUTENBERG_RAW_MANIFEST_PATH);
  if (!isRecord(value) || !Array.isArray(value.sourceRecords) || !nonEmptyString(value.selectionPolicy)) return false;
  const rows = value.sourceRecords.filter(isRecord);
  const declaredSourceCount = Number.isInteger(value.declaredSourceCount)
    ? Number(value.declaredSourceCount)
    : rows.length;
  return (
    rows.length > 0 &&
    rows.length === declaredSourceCount &&
    new Set(rows.map((row) => row.gutenbergId)).size === rows.length &&
    rows.every(
      (row) =>
        Number.isInteger(row.gutenbergId) &&
        nonEmptyString(row.title) &&
        nonEmptyString(row.author) &&
        Number.isInteger(row.publicationYear) &&
        nonEmptyString(row.editionOrTranslation) &&
        nonEmptyString(row.language) &&
        nonEmptyString(row.releaseOrUpdateDate) &&
        nonEmptyString(row.captureDate) &&
        nonEmptyString(row.rightsBoundary) &&
        nonEmptyString(row.officialUrl) &&
        /^https:\/\/(?:www\.)?gutenberg\.org\//.test(row.officialUrl) &&
        checksumBindsRegisteredBytes(inputs, row.rawTextPath, row.sha256),
    )
  );
}

function validateAttestationRawManifest(inputs: InputBundle) {
  const value = parseRegisteredJson(inputs, ATTESTATION_RAW_MANIFEST_PATH);
  if (!isRecord(value) || !Array.isArray(value.records)) return false;
  const rows = value.records.filter(isRecord);
  return (
    rows.length >= 6 &&
    new Set(rows.map((row) => row.id)).size === rows.length &&
    rows.every(
      (row) =>
        nonEmptyString(row.id) &&
        nonEmptyString(row.form) &&
        nonEmptyString(row.quotation) &&
        nonEmptyString(row.dateBasis) &&
        nonEmptyString(row.datePrecision) &&
        nonEmptyString(row.editionOrPublication) &&
        nonEmptyString(row.accessDate) &&
        nonEmptyString(row.verificationDecision) &&
        nonEmptyString(row.rightsBoundary) &&
        checksumBindsRegisteredBytes(inputs, row.sourceCapturePath, row.sha256),
    )
  );
}

function validateModernRawManifest(inputs: InputBundle) {
  const value = parseRegisteredJson(inputs, MODERN_RAW_MANIFEST_PATH);
  if (!isRecord(value) || !Array.isArray(value.searchResponses) || !Array.isArray(value.pageCaptures)) return false;
  const searchRows = value.searchResponses.filter(isRecord);
  const pageRows = value.pageCaptures.filter(isRecord);
  const declaredQueryCount = Number.isInteger(value.declaredQueryCount)
    ? Number(value.declaredQueryCount)
    : searchRows.length;
  const declaredPageCount = Number.isInteger(value.declaredPageCount)
    ? Number(value.declaredPageCount)
    : pageRows.length;
  return (
    searchRows.length > 0 &&
    pageRows.length > 0 &&
    searchRows.length === declaredQueryCount &&
    pageRows.length === declaredPageCount &&
    new Set(searchRows.map((row) => row.query)).size === searchRows.length &&
    new Set(pageRows.map((row) => `${row.pageId}:${row.revisionId}`)).size === pageRows.length &&
    searchRows.every(
      (row) =>
        nonEmptyString(row.query) &&
        nonEmptyString(row.captureTimestamp) &&
        Number.isInteger(row.totalResults) &&
        nonEmptyString(row.completionState) &&
        checksumBindsRegisteredBytes(inputs, row.rawResponsePath, row.sha256),
    ) &&
    pageRows.every(
      (row) =>
        Number.isInteger(row.pageId) &&
        Number.isInteger(row.revisionId) &&
        nonEmptyString(row.textDate) &&
        nonEmptyString(row.pagePublicationDate) &&
        nonEmptyString(row.captureTimestamp) &&
        nonEmptyString(row.license) &&
        hasSha256(row.passageSha256) &&
        checksumBindsRegisteredBytes(inputs, row.rawPagePath, row.sha256),
    )
  );
}

function validateCoverageManifest(inputs: InputBundle) {
  const value = parseRegisteredJson(inputs, COVERAGE_MANIFEST_PATH);
  if (!isRecord(value) || !Array.isArray(value.states) || !Array.isArray(value.rows)) return false;
  const stateSet = new Set(value.states);
  const rows = value.rows.filter(isRecord);
  return (
    MISSINGNESS_STATES.every((state) => stateSet.has(state)) &&
    rows.length > 0 &&
    rows.every(
      (row) =>
        nonEmptyString(row.dataset) &&
        nonEmptyString(row.period) &&
        nonEmptyString(row.coverageState) &&
        stateSet.has(row.coverageState) &&
        [row.documentCount, row.recordCount, row.tokenCount].every(
          (count) => count === null || (Number.isInteger(count) && Number(count) >= 0),
        ),
    )
  );
}

function validateRightsManifest(inputs: InputBundle) {
  const manifestPaths = [RIGHTS_MANIFEST_PATH, FIXED_GOOGLE_PATHS.rights].filter((pathname) =>
    inputs.inputPaths.includes(pathname),
  );
  return manifestPaths.some((manifestPath) => {
    const value = parseRegisteredJson(inputs, manifestPath);
    if (!isRecord(value)) return false;
    const legacyRows = Array.isArray(value.records) ? value.records.filter(isRecord) : [];
    const defaults = Array.isArray(value.datasetDefaults)
      ? value.datasetDefaults.filter(isRecord)
      : isRecord(value.datasetDefaults)
        ? [value.datasetDefaults]
        : [];
    const overrides = Array.isArray(value.itemOverrides)
      ? value.itemOverrides.filter(isRecord)
      : isRecord(value.itemOverrides)
        ? Object.entries(value.itemOverrides).map(([itemPath, row]) =>
            isRecord(row) ? { path: itemPath, ...row } : { path: itemPath },
          )
        : [];
    const defaultValid = defaults.some(
      (row) =>
        nonEmptyString(row.id ?? row.datasetId ?? row.dataset ?? row.persistentIdentifier) &&
        nonEmptyString(row.sourceUrl) &&
        nonEmptyString(row.rightsBoundary ?? row.license),
    );
    const overridesValid = overrides.every(
      (row) =>
        nonEmptyString(row.path) &&
        nonEmptyString(row.rightsBoundary ?? row.license),
    );
    const legacyValid = legacyRows.length > 0 && legacyRows.every(
      (row) =>
        nonEmptyString(row.path) &&
        nonEmptyString(row.sourceUrl) &&
        nonEmptyString(row.rightsBoundary) &&
        checksumBindsRegisteredBytes(inputs, row.path, row.sha256),
    );
    // A dataset default may cover every item; a more-specific item override is
    // permitted but never mandatory. This is deliberate inheritance, not a
    // global one-record-per-file success constant.
    return legacyValid || (defaultValid && overridesValid);
  });
}

function validateTransformManifest(inputs: InputBundle) {
  const manifestPaths = [TRANSFORM_MANIFEST_PATH, FIXED_GOOGLE_PATHS.transforms].filter((pathname) =>
    inputs.inputPaths.includes(pathname),
  );
  return manifestPaths.some((manifestPath) => {
    const value = parseRegisteredJson(inputs, manifestPath);
    if (!isRecord(value) || !Array.isArray(value.transforms)) return false;
    const rows = value.transforms.filter(isRecord);
    const activeRows = rows.filter(
      (row) => !["excluded", "excluded_legacy", "legacy"].includes(String(row.status ?? row.disposition)),
    );
    const excludedRows = rows.filter((row) => !activeRows.includes(row));
    return (
      activeRows.length > 0 &&
      new Set(rows.map((row) => row.id)).size === rows.length &&
      excludedRows.every((row) => nonEmptyString(row.id) && nonEmptyString(row.reason ?? row.exclusionReason)) &&
      activeRows.every(
        (row) =>
          nonEmptyString(row.id) &&
          nonEmptyString(row.version) &&
          nonEmptyString(row.formula) &&
          nonEmptyString(row.scriptPath) &&
          inputs.inputPaths.includes(row.scriptPath) &&
          Array.isArray(row.inputs) &&
          row.inputs.length > 0 &&
          row.inputs.filter(isRecord).length === row.inputs.length &&
          row.inputs.every(
            (input) => isRecord(input) && checksumBindsAnyAuditInput(inputs, input.path, input.sha256),
          ) &&
          Array.isArray(row.outputs) &&
          row.outputs.length > 0 &&
          row.outputs.every(
            (output) => isRecord(output) && checksumBindsAnyAuditInput(inputs, output.path, output.sha256),
          ),
      )
    );
  });
}

function auditRawAvailability(inputs: InputBundle): ForeverRawAvailabilityAudit {
  const fixedGoogle = auditFixedGoogleRelease(inputs);
  const structuredInputs = inputs.inputPaths
    .filter(
      (relativePath) =>
        relativePath.endsWith(".json") &&
        isDedicatedRawPath(relativePath),
    )
    .map((relativePath) => {
      const value = JSON.parse(inputs.texts.get(relativePath) ?? "null") as unknown;
      return {
        path: relativePath,
        keys: unique(collectStructuredKeyPaths(value)),
      };
    });
  const keyMatches = (keys: string[]) =>
    structuredInputs.flatMap((input) =>
      input.keys
        .filter((keyPath) => keys.includes(keyPath.split(".").at(-1)?.replace(/\[\]$/, "") ?? ""))
        .map((keyPath) => `${input.path}#${keyPath}`),
    );
  const rawMatchCountKeyPaths = unique([
    ...keyMatches(["match_count", "matchCount"]),
    ...(fixedGoogle.fixedRawCommonDenominator.validation.exactFormEquality === true
      ? [`${FIXED_GOOGLE_PATHS.foreverAnnual}#match_count`, `${FIXED_GOOGLE_PATHS.forEverAnnual}#match_count`]
      : []),
  ]);
  const annualWordTokenTotalKeyPaths = unique([
    ...keyMatches(["annual_word_tokens", "annualWordTokens"]),
    ...(fixedGoogle.fixedRawCommonDenominator.validation.annualWordTokenTotals === true
      ? [`${FIXED_GOOGLE_PATHS.totalCounts}#year,token_count,page_count,volume_count`]
      : []),
  ]);
  const pinnedCorpusReleaseKeyPaths = unique([
    ...keyMatches(["corpus_release", "corpusRelease", "persistentCorpusId", "persistent_corpus_id"]),
    ...(fixedGoogle.fixedRawCommonDenominator.validation.exactCoreFamily === true
      ? [`${FIXED_GOOGLE_PATHS.family}#release`, `${FIXED_GOOGLE_PATHS.foreverAnnual}#corpus_release`, `${FIXED_GOOGLE_PATHS.forEverAnnual}#corpus_release`]
      : []),
  ]);
  const commonDenominatorValidated =
    fixedGoogle.fixedRawCommonDenominator.productionEligible ||
    validateCommonDenominatorFile(inputs);
  const commonDenominatorValidatedFiles = commonDenominatorValidated
    ? fixedGoogle.fixedRawCommonDenominator.productionEligible
      ? [FIXED_GOOGLE_ROOT]
      : [COMMON_DENOMINATOR_PATH]
    : [];
  const canonicalFormRegistryPresent =
    fixedGoogle.fixedRawCommonDenominator.validation.exactCoreFamily === true ||
    validateCanonicalFormRegistry(inputs) !== null;
  const googleRawResponsePresent =
    fixedGoogle.fixedViewerSeparateFacets.productionEligible ||
    validateViewerRawResponse(inputs);
  const gutenbergRawTextsAndMetadataPresent = validateGutenbergRawManifest(inputs);
  const attestationPrimaryRecordsPresent = validateAttestationRawManifest(inputs);
  const modernRawApiAndPageCapturesPresent = validateModernRawManifest(inputs);
  const coverageManifestPresent = validateCoverageManifest(inputs);
  const rightsManifestPresent =
    fixedGoogle.fixedRawCommonDenominator.validation.rightsResolved === true ||
    validateRightsManifest(inputs);
  const transformManifestPresent =
    fixedGoogle.fixedRawCommonDenominator.validation.activeTransformClosure === true ||
    validateTransformManifest(inputs);
  const upstreamRawPresent = inputs.inputPaths.some(isDedicatedRawPath);
  const rawMatchCountsAvailable = commonDenominatorValidated;
  const annualWordTokenTotalsAvailable = commonDenominatorValidated;
  const corpusReleasePinned = commonDenominatorValidated || googleRawResponsePresent;
  const commonAnnualWordTokenDenominatorAvailable = commonDenominatorValidated;
  const allRequiredRawInputsPresent =
    canonicalFormRegistryPresent &&
    googleRawResponsePresent &&
    rawMatchCountsAvailable &&
    annualWordTokenTotalsAvailable &&
    commonAnnualWordTokenDenominatorAvailable &&
    corpusReleasePinned &&
    gutenbergRawTextsAndMetadataPresent &&
    attestationPrimaryRecordsPresent &&
    modernRawApiAndPageCapturesPresent &&
    coverageManifestPresent &&
    rightsManifestPresent &&
    transformManifestPresent;

  return {
    discoveredCandidatePaths: inputs.discoveredCandidatePaths,
    rawMatchCountKeyPaths,
    annualWordTokenTotalKeyPaths,
    pinnedCorpusReleaseKeyPaths,
    commonDenominatorValidatedFiles,
    canonicalFormRegistryPresent,
    googleRawResponsePresent,
    rawMatchCountsAvailable,
    annualWordTokenTotalsAvailable,
    commonAnnualWordTokenDenominatorAvailable,
    corpusReleasePinned,
    gutenbergRawTextsAndMetadataPresent,
    attestationPrimaryRecordsPresent,
    modernRawApiAndPageCapturesPresent,
    coverageManifestPresent,
    rightsManifestPresent,
    transformManifestPresent,
    upstreamRawPresent,
    allRequiredRawInputsPresent,
    fixedViewerSeparateFacetsEligible: fixedGoogle.fixedViewerSeparateFacets.productionEligible,
    fixedRawCommonDenominatorEligible: fixedGoogle.fixedRawCommonDenominator.productionEligible,
  };
}

function deriveDataGate(
  availability: ForeverRawAvailabilityAudit,
  untraceableInputCount: number,
  productionEligiblePanelCount: number,
) {
  if (!availability.allRequiredRawInputsPresent) return "STOP_RAW_DATA_MISSING" as const;
  if (untraceableInputCount > 0) return "STOP_UNTRACEABLE_TRANSFORM" as const;
  if (productionEligiblePanelCount < 5) return "STOP_INSUFFICIENT_ANALYTIC_DEPTH" as const;
  return "PASS" as const;
}

function dataGateCopy(
  status: ReturnType<typeof deriveDataGate>,
  fixedGoogle: ForeverFixedGoogleReleaseAudit,
) {
  if (status === "PASS") {
    return {
      displayTitle: "Forever data gate: pass",
      displaySummary: "Registered raw inputs, transforms, analytic depth, and production contracts pass the publication gate.",
      reasons: ["Every required raw/source manifest, transform, finding, and production contract passed its executable predicate."],
      nextEligibleGate: "PASS" as const,
    };
  }
  if (status === "STOP_UNTRACEABLE_TRANSFORM") {
    return {
      displayTitle: "Forever data gate: transforms untraceable",
      displaySummary: "Raw inputs are retained, but one or more research transforms or mappings are not yet source-bound and reproducible.",
      reasons: ["At least one research input or visual mapping remains outside a registered, checksum-bound transform."],
      nextEligibleGate: "STOP_INSUFFICIENT_ANALYTIC_DEPTH" as const,
    };
  }
  if (status === "STOP_INSUFFICIENT_ANALYTIC_DEPTH") {
    return {
      displayTitle: "Forever data gate: insufficient analytic depth",
      displaySummary: "Inputs and transforms are traceable, but fewer than five distinct substantive figure contracts are production-eligible.",
      reasons: ["Production-eligible contracts do not yet meet the preregistered five-panel minimum."],
      nextEligibleGate: "PASS" as const,
    };
  }
  if (fixedGoogle.fixedRawCommonDenominator.productionEligible) {
    return {
      displayTitle: "Forever page gate: implementation unauthorized",
      displaySummary:
        "The fixed Google common-denominator contract is analytically eligible, but this round does not authorize Mobile Forever figure implementation.",
      reasons: [
        "The fixed eng_2019 Viewer contract and googlebooks-eng-20200217 raw common-denominator contract passed independently.",
        "Other candidate figures retain their own unresolved source, coverage, rights, or transform gaps.",
        "pageImplementationAuthorized remains false; no substantive Mobile Forever figure may be added or restored in this round.",
      ],
      nextEligibleGate: "STOP_RAW_DATA_MISSING" as const,
    };
  }
  if (fixedGoogle.fixedViewerSeparateFacets.productionEligible) {
    return {
      displayTitle: "Forever page gate: raw denominator incomplete",
      displaySummary:
        "The fixed Viewer separate-facets contract is eligible, but the raw common-denominator contract and page implementation remain blocked.",
      reasons: [
        "Viewer values retain separate unigram and bigram denominators and cannot support direct joined/spaced arithmetic.",
        "pageImplementationAuthorized remains false.",
      ],
      nextEligibleGate: "STOP_RAW_DATA_MISSING" as const,
    };
  }
  return {
    displayTitle: "Forever data gate: raw inputs missing",
    displaySummary:
      "The current repository can document its limits, but it cannot publish a rebuilt data-to-form story until the required official raw captures and denominators are retained.",
    reasons: [
      "Google Viewer fractions are retained without checksum-bound raw match rows, same-release annual word-token totals, exact raw response, or pinned corpus release.",
      "Gutenberg source texts/editions/checksums, primary attestation records, and Wikinews raw API/page captures are absent.",
      "No validated coverage, rights, transform, or canonical form registry distinguishes missing, zero, not searched, unavailable, and incomparable states.",
      "Even under strict separate Viewer units, the remaining layers do not support five contract-complete substantive panels.",
    ],
    nextEligibleGate: "STOP_UNTRACEABLE_TRANSFORM" as const,
  };
}

function codeRecordCounts(text: string) {
  return {
    sourceLines: lineCount(text),
    generatedAtCalls: (text.match(/new Date\(\)\.toISOString\(\)/g) ?? []).length,
    exportedConstants: (text.match(/export const /g) ?? []).length,
  };
}

function manifestEntry(
  inputs: InputBundle,
  relativePath: string,
  availability: ForeverRawAvailabilityAudit,
): ForeverManifestEntry {
  const text = inputs.texts.get(relativePath);
  const bytes = inputs.bytes.get(relativePath);
  invariant(text !== undefined, `missing manifest input ${relativePath}`);
  invariant(bytes !== undefined, `missing manifest bytes ${relativePath}`);

  const common = {
    sha256: sha256(bytes),
    byteLength: bytes.byteLength,
    productionAuthority: false as const,
  };

  if (relativePath === "src/data/generated/forever_frequency.json") {
    const years = inputs.frequency.series.flatMap((series) => series.points.map((point) => point.year));
    const windowRows = inputs.frequency.series
      .find((series) => series.query === "forever")
      ?.points.filter((point) => point.year >= 1700 && point.year <= 2022).length ?? 0;
    return {
      id: "capture-google-viewer-frequency",
      path: relativePath,
      role: "generated-capture",
      authorityLevel: "generated-capture-without-upstream-raw",
      ...common,
      fields: [
        "source.{label,url,corpus,startYear,endYear,smoothing}",
        "series[].{query,corpus,smoothing,startYear,endYear}",
        "series[].points[].{year,value,frequencyPerMillion}",
      ],
      granularity: "one Google Viewer normalized observation per query-year",
      recordCounts: {
        series: inputs.frequency.series.length,
        observations: sum(inputs.frequency.series.map((series) => series.points.length)),
        foreverRows1700To2022: windowRows,
      },
      timeRange: {
        start: Math.min(...years),
        end: Math.max(...years),
        basis: "Viewer response year index",
        precision: "year",
      },
      source: inputs.frequency.source.label,
      sourceUrl: inputs.frequency.source.url,
      corpus: inputs.frequency.source.corpus,
      release: null,
      missingness: [
        "No null observations are encoded.",
        "A numeric zero cannot be distinguished from observed zero, missing/below-threshold signal, or unavailable source material.",
        "Raw match counts, volume counts, and annual token totals are absent.",
      ],
      duplicatePolicy: "No duplicate policy is recorded; query+year keys are unique in the generated file.",
      transformHistory: [
        "Viewer JSON timeseries index is mapped to startYear + index.",
        "frequencyPerMillion = Viewer normalized fraction × 1,000,000.",
        "parent and type fields from the API response are discarded; the raw response is not retained.",
      ],
      rightsBoundary: "Google source URL is recorded, but release, downloadable-file terms, capture checksum, and reuse boundary are not.",
      caveats: [
        "Corpus alias 'en' is not a pinned corpus release.",
        "Unigram, bigram, and trigram Viewer fractions do not share a denominator.",
      ],
    };
  }

  if (relativePath === "src/data/generated/forever_gutenberg_sources.json") {
    const years = inputs.gutenberg.sources.map((source) => source.year);
    const occurrences = inputs.gutenberg.sources.flatMap((source) => source.occurrences);
    return {
      id: "capture-gutenberg-selected-works",
      path: relativePath,
      role: "generated-capture",
      authorityLevel: "generated-capture-without-upstream-raw",
      ...common,
      fields: [
        "sources[].{id,gutenbergId,title,author,year,sourceUrl,rightsStatus,tokenCount,foreverFormCount}",
        "sources[].phraseCounts{}",
        "sources[].collocates{}",
        "sources[].occurrences[].{kind,phrase,tokenIndex,charIndex,snippet}",
      ],
      granularity: `${inputs.gutenberg.sources.length} manually selected works with nested occurrence-level rows`,
      recordCounts: {
        selectedWorks: inputs.gutenberg.sources.length,
        tokens: sum(inputs.gutenberg.sources.map((source) => source.tokenCount)),
        formOccurrences: occurrences.filter((row) => row.kind === "form").length,
        phraseOccurrences: occurrences.filter((row) => row.kind === "phrase").length,
        allOccurrenceRows: occurrences.length,
      },
      timeRange: {
        start: Math.min(...years),
        end: Math.max(...years),
        basis: "manually seeded work-publication year",
        precision: "year, not necessarily captured edition/translation year",
      },
      source: inputs.gutenberg.source.label,
      sourceUrl: inputs.gutenberg.source.url,
      corpus: "manually selected Project Gutenberg works",
      release: null,
      missingness: [
        "The downloaded source text files are not retained.",
        "Edition, translator, language, Gutenberg release/update, capture date, and checksums are absent.",
        `Selection coverage and searched-zero status outside the ${inputs.gutenberg.sources.length} works are not encoded.`,
      ],
      duplicatePolicy: "No declared occurrence dedupe policy; phrase and form rows may share a source+tokenIndex.",
      transformHistory: [
        "Fetch first successful URL from four fallbacks.",
        "Strip Gutenberg boilerplate, lowercase ASCII tokenization, exact adjacent-token form/phrase matching.",
        "Collocates count non-stopword tokens within ±5 tokens of joined/spaced form hits.",
      ],
      rightsBoundary: "Each row says 'Public domain in the USA'; source text revision, jurisdictional status, and passage-level provenance are not captured.",
      caveats: [
        "The sample is selected, not a balanced corpus.",
        "ASCII tokenization can conflate hyphenated 'for-ever' with spaced 'for ever'.",
        "Work year cannot establish the wording date of a later English edition or translation.",
      ],
    };
  }

  if (relativePath === "src/data/generated/forever_prehistory.json") {
    const years = inputs.prehistory.records.map((record) => record.yearApproximation);
    return {
      id: "capture-secondary-attestation-claims",
      path: relativePath,
      role: "generated-capture",
      authorityLevel: "generated-capture-without-upstream-raw",
      ...common,
      fields: [
        "records[].{id,form,normalizedForm,evidenceType,dateLabel,yearApproximation,sourceName,sourceUrl,quote,verificationStatus,confidence,caveat}",
        "investigatedSources[].{id,name,coverage,status,sourceUrl,note}",
      ],
      granularity: "one manually transcribed secondary lexical claim per record",
      recordCounts: {
        claims: inputs.prehistory.records.length,
        investigatedSources: inputs.prehistory.investigatedSources.length,
        blankQuotes: inputs.prehistory.records.filter((record) => record.quote.trim() === "").length,
      },
      timeRange: {
        start: Math.min(...years),
        end: Math.max(...years),
        basis: "manual approximate year assigned to source date label",
        precision: "mixed century/approximate-year/exact-looking-year",
      },
      source: "secondary lexical websites",
      sourceUrl: null,
      corpus: null,
      release: null,
      missingness: [
        "All claim quotations are blank.",
        "No edition, access date, snapshot, source-row quotation, or primary occurrence is stored.",
      ],
      duplicatePolicy: "Claims from different secondary sources are retained separately; conflict resolution is not implemented.",
      transformHistory: [
        "Date labels such as late 14c. and late 17c. are manually mapped to 1375 and 1680.",
        "Source claims are hard-coded into a build script rather than extracted from retained captures.",
      ],
      rightsBoundary: "No quotation-reuse or snapshot rights record is stored.",
      caveats: ["The layer cannot support a first-use claim or a verified source-bound date ledger."],
    };
  }

  if (relativePath === "src/data/generated/forever_modern_context.json") {
    const years = inputs.modern.snippets.map((snippet) => snippet.year);
    const uniqueUrls = unique(inputs.modern.snippets.map((snippet) => snippet.sourceUrl));
    return {
      id: "capture-wikinews-search-snippets",
      path: relativePath,
      role: "generated-capture",
      authorityLevel: "generated-capture-without-upstream-raw",
      ...common,
      fields: [
        "queries[]",
        "snippets[].{id,sourceUrl,title,year,dateBasis,query,quote,rightsStatus}",
        "phrases[].{phrase,count,documentFrequency,relatedSnippetIds}",
        "collocates[].{token,count,documentFrequency,relatedSnippetIds}",
      ],
      granularity: "one retained MediaWiki search-result snippet per title+snippet key",
      recordCounts: {
        registeredQueries: inputs.modern.queries.length,
        snippetRows: inputs.modern.snippets.length,
        uniqueSourceUrls: uniqueUrls.length,
        phraseAggregates: inputs.modern.phrases.length,
        collocateAggregates: inputs.modern.collocates.length,
      },
      timeRange: {
        start: years.length ? Math.min(...years) : null,
        end: years.length ? Math.max(...years) : null,
        basis: "search-result revision timestamp",
        precision: "year only; not text date, page publication date, or capture date",
      },
      source: inputs.modern.source.label,
      sourceUrl: inputs.modern.source.apiUrl,
      corpus: "Wikinews API search-result snippets",
      release: null,
      missingness: [
        "Raw API responses, total hits, continuation state, page IDs, revision IDs, and capture timestamps are absent.",
        "Queries with no retained snippets do not encode observed-zero versus unavailable/failed search.",
        "Page publication date and quoted-text date are absent.",
      ],
      duplicatePolicy: "Dedupes title+snippet, not page URL/revision/passage; the same page may survive under multiple queries.",
      transformHistory: [
        "Search up to six rows per query; strip HTML; keep snippets containing joined or spaced form.",
        "Phrase counts count retained snippet rows, and collocates are token counts over snippets.",
        "Rights label is inferred from revision year rather than exact revision timestamp/license metadata.",
      ],
      rightsBoundary: inputs.modern.source.licenseNote,
      caveats: ["A single mutable search capture cannot show persistence, survival, prevalence, or time trend."],
    };
  }

  if (relativePath === "docs/research/forever/sources/google-ngram-official-authority.json") {
    return {
      id: "source-google-ngram-official-authority",
      path: relativePath,
      role: "source-record",
      authorityLevel: "official-source-reference",
      ...common,
      fields: [
        "sourceRecords[].{id,publisher,title,url,accessedOn,official}",
        "sourceRecords[].{applicableClaim,repositoryUse,sourceLocation,captureStatus,rightsBoundary}",
      ],
      granularity: "one repository-retained authority/provenance record per official Google documentation claim",
      recordCounts: { sourceRecords: inputs.officialAuthority.sourceRecords.length },
      timeRange: null,
      source: "Google Books Ngram Viewer Team official documentation",
      sourceUrl: "https://books.google.com/ngrams/info",
      corpus: null,
      release: null,
      missingness: ["Official page HTML is not vendored; the URL, access date, location, and paraphrased claim are retained."],
      duplicatePolicy: "One record per authority question; denominator, release mutability, and official-download boundary remain separate.",
      transformHistory: ["Manually transcribed as a paraphrased source authority record; no numeric research result is extracted."],
      rightsBoundary: "Reference metadata and paraphrase only; no official page or dataset content is redistributed.",
      caveats: ["This record establishes denominator semantics and source boundaries, not raw observations or a pinned corpus release."],
    };
  }

  const fixedGoogleWidePaths = new Set<string>([
    FIXED_GOOGLE_PATHS.foreverSource,
    FIXED_GOOGLE_PATHS.forEverSource,
    FIXED_GOOGLE_PATHS.forevermoreSource,
  ]);
  if (fixedGoogleWidePaths.has(relativePath)) {
    const fields = text.trimEnd().split("\t");
    const years = fields.slice(1).map((field) => Number(field.split(",", 1)[0])).filter(Number.isFinite);
    const core = relativePath !== FIXED_GOOGLE_PATHS.forevermoreSource;
    return {
      id: `raw-google-v3-wide-${path.basename(relativePath, ".source.tsv")}`,
      path: relativePath,
      role: "retained-raw",
      authorityLevel: "retained-upstream-raw",
      ...common,
      productionAuthority: core && availability.fixedRawCommonDenominatorEligible,
      fields: ["tab field[0]: exact ngram", "tab field[k>0]: year,match_count,volume_count"],
      granularity: "one complete official Google v3 exact-form wide source record",
      recordCounts: { exactWideRecords: text.trim().length > 0 ? 1 : 0, annualObservationFields: Math.max(0, fields.length - 1) },
      timeRange: {
        start: years.length ? Math.min(...years) : null,
        end: years.length ? Math.max(...years) : null,
        basis: "year lexemes retained in the official v3 wide record",
        precision: "year",
      },
      source: "Google Books Ngram v3 downloadable fixed release",
      sourceUrl: relativePath.includes("for-ever-2")
        ? "https://storage.googleapis.com/books/ngrams/books/20200217/eng/2-00407-of-00589.gz"
        : "https://storage.googleapis.com/books/ngrams/books/20200217/eng/1-00018-of-00024.gz",
      corpus: "English 2019",
      release: "googlebooks-eng-20200217",
      missingness: [
        "Each included wide field is an explicit source observation; an absent year remains absent_or_suppressed.",
        "An explicit match_count lexeme of 0 is evidence for observed_zero for that form-year.",
      ],
      duplicatePolicy: "Exactly one wide source record per exact preregistered ngram; duplicate form records or year fields fail validation.",
      transformHistory: ["Stream-decompressed exact field[0] equality extraction; full matching source record retained with terminal LF."],
      rightsBoundary: "Dataset-level CC BY 3.0 inheritance applies; underlying scanned books/page images are outside this grant.",
      caveats: ["OCR, corpus composition, and publication bias remain."],
    };
  }

  const fixedGoogleAnnualPaths = new Set<string>([
    FIXED_GOOGLE_PATHS.foreverAnnual,
    FIXED_GOOGLE_PATHS.forEverAnnual,
    FIXED_GOOGLE_PATHS.forevermoreAnnual,
  ]);
  if (fixedGoogleAnnualPaths.has(relativePath)) {
    const rows = parseTsv(text);
    const years = rows.map((row) => Number(row.year)).filter(Number.isFinite);
    const core = relativePath !== FIXED_GOOGLE_PATHS.forevermoreAnnual;
    return {
      id: `derived-google-annual-${path.basename(relativePath, ".annual.tsv")}`,
      path: relativePath,
      role: "derived-artifact",
      authorityLevel: availability.fixedRawCommonDenominatorEligible && core
        ? "checksum-bound-derived"
        : "derived-non-authoritative",
      ...common,
      productionAuthority: core && availability.fixedRawCommonDenominatorEligible,
      fields: ["ngram", "year", "match_count", "volume_count", "ngram_order", "corpus_release", "source_shard", "wide_field_index"],
      granularity: "one deterministic annual expansion row per explicit field in the retained official wide source record",
      recordCounts: {
        annualDerivedRows: rows.length,
        explicitZeroRows: rows.filter((row) => row.match_count === "0").length,
      },
      timeRange: {
        start: years.length ? Math.min(...years) : null,
        end: years.length ? Math.max(...years) : null,
        basis: "year copied from the indexed official v3 wide-record field",
        precision: "year",
      },
      source: "deterministic expansion of retained Google v3 exact-form wide source record",
      sourceUrl: null,
      corpus: "English 2019",
      release: "googlebooks-eng-20200217",
      missingness: [
        "Only explicit wide-record fields become rows; absent form-years are not emitted and remain absent_or_suppressed.",
        "Explicit match_count=0 fields are retained and typed observed_zero; they are never inferred from absence.",
      ],
      duplicatePolicy: "Unique exact form + year and unique wide_field_index; every annual row must equal its indexed wide tuple.",
      transformHistory: ["Checksum-bound google-20200217-wide-to-annual-expansion; numeric lexemes and zero-based wide field index retained."],
      rightsBoundary: "Inherits the fixed Google dataset-level boundary, with item-level override support.",
      caveats: ["This is a derived lineage table, not an official four-column Google raw row format."],
    };
  }

  if (relativePath === FIXED_GOOGLE_PATHS.totalCounts) {
    const records = text.trim().split(/\s+/).filter(Boolean);
    const years = records.map((record) => Number(record.split(",", 1)[0])).filter(Number.isFinite);
    return {
      id: "raw-google-annual-totalcounts-1",
      path: relativePath,
      role: "retained-raw",
      authorityLevel: "retained-upstream-raw",
      ...common,
      productionAuthority: availability.fixedRawCommonDenominatorEligible,
      fields: ["year", "annual 1-gram word-token total", "page count", "volume count"],
      granularity: "one official totalcounts record per included year in the complete frozen object",
      recordCounts: { annualTotalRecords: records.length },
      timeRange: {
        start: years.length ? Math.min(...years) : null,
        end: years.length ? Math.max(...years) : null,
        basis: "official totalcounts-1 year record",
        precision: "year; release records are sparse and missing years are unavailable, not zero",
      },
      source: "Google Books Ngram fixed-release totalcounts-1",
      sourceUrl: "https://storage.googleapis.com/books/ngrams/books/20200217/eng/totalcounts-1",
      corpus: "English 2019",
      release: "googlebooks-eng-20200217",
      missingness: ["A missing totalcounts year is unavailable and cannot be used as a zero denominator."],
      duplicatePolicy: "One record per year; duplicate year fails validation.",
      transformHistory: ["Byte-for-byte freeze after official object length, ETag/MD5, and local SHA-256 validation."],
      rightsBoundary: "Dataset-level CC BY 3.0 inheritance applies; underlying scanned works remain outside this grant.",
      caveats: ["The official record coverage is sparse at its lower boundary; no continuous 1500–2019 assumption is made."],
    };
  }

  if (isDedicatedRawPath(relativePath)) {
    let fields = ["binary/raw payload"];
    let recordCounts: Record<string, number> = { files: 1 };
    if (relativePath.endsWith(".json") || relativePath.endsWith(".jsonl")) {
      if (relativePath.endsWith(".json")) {
        const value = JSON.parse(text) as unknown;
        fields = Array.isArray(value)
          ? ["rows[]"]
          : isRecord(value)
            ? Object.keys(value).sort().map((key) => `${key}`)
            : ["scalar JSON value"];
        recordCounts = Array.isArray(value)
          ? { rows: value.length }
          : isRecord(value)
            ? Object.fromEntries(
                Object.entries(value)
                  .filter(([, child]) => Array.isArray(child))
                  .map(([key, child]) => [key, (child as unknown[]).length]),
              )
            : { values: 1 };
      } else {
        recordCounts = { rows: text.split(/\r?\n/).filter(Boolean).length };
        fields = ["JSON Lines records"];
      }
    } else if (/\.(?:csv|tsv|txt)$/i.test(relativePath)) {
      recordCounts = { lines: lineCount(text) };
      fields = [relativePath.endsWith(".tsv") ? "tab-delimited raw rows" : "text-delimited raw rows"];
    } else {
      recordCounts = { binaryFiles: 1, bytes: bytes.byteLength };
    }
    return {
      id: `raw-${sha256(relativePath).slice(0, 12)}`,
      path: relativePath,
      role: "retained-raw",
      authorityLevel: "retained-upstream-raw",
      ...common,
      fields,
      granularity: "one retained upstream raw file; record granularity is accepted only through a validated, checksum-bound source manifest",
      recordCounts,
      timeRange: null,
      source: "retained upstream raw candidate",
      sourceUrl: null,
      corpus: null,
      release: null,
      missingness: ["Raw-file presence alone does not establish searched-zero, completeness, or coverage."],
      duplicatePolicy: "No policy inferred from filename; a validated transform/source manifest must define it.",
      transformHistory: ["Byte-preserved and SHA-256 hashed by the audit; no transform is inferred."],
      rightsBoundary: "Not accepted until a checksum-bound rights/source manifest covers this exact path.",
      caveats: ["This entry cannot make a finding or figure production-authoritative by presence alone."],
    };
  }

  const derivedJsonPaths = new Set([
    "src/data/generated/forever_dataset.json",
    "src/data/generated/forever_phrases.json",
    "src/data/generated/forever_collocates.json",
    "src/data/generated/forever_snippets.json",
    "src/data/generated/forever_categories.json",
    "src/data/generated/forever_atlas.json",
    "src/data/generated/forever_ledger.json",
  ]);
  if (derivedJsonPaths.has(relativePath)) {
    let recordCounts: Record<string, number>;
    let fields: string[];
    if (relativePath.endsWith("forever_dataset.json")) {
      recordCounts = {
        frequencySeries: inputs.dataset.frequency.length,
        phrases: inputs.dataset.phrases.length,
        collocates: inputs.dataset.collocates.length,
        snippets: inputs.dataset.snippets.length,
        categories: inputs.dataset.categories.length,
        flows: inputs.dataset.flows.length,
        atlasNodes: inputs.dataset.atlas.nodes.length,
        atlasEdges: inputs.dataset.atlas.edges.length,
        ledgerCells: inputs.dataset.ledger.length,
        networkNodes: inputs.dataset.network.nodes.length,
        networkEdges: inputs.dataset.network.edges.length,
        inspectors: inputs.dataset.inspectors.length,
      };
      fields = ["frequency[]", "phrases[]", "collocates[]", "snippets[]", "categories[]", "flows[]", "atlas{}", "ledger[]", "network{}", "inspectors[]"];
    } else if (relativePath.endsWith("forever_atlas.json")) {
      recordCounts = { nodes: inputs.atlas.nodes.length, edges: inputs.atlas.edges.length };
      fields = ["nodes[]", "edges[]"];
    } else {
      const rows = relativePath.endsWith("forever_phrases.json")
        ? inputs.phrases
        : relativePath.endsWith("forever_collocates.json")
          ? inputs.collocates
          : relativePath.endsWith("forever_snippets.json")
            ? inputs.snippets
            : relativePath.endsWith("forever_categories.json")
              ? inputs.categories
              : inputs.ledger;
      recordCounts = { rows: rows.length };
      fields = ["derived rows[]"];
    }
    return {
      id: `derived-${path.basename(relativePath, ".json").replaceAll("_", "-")}`,
      path: relativePath,
      role: "derived-artifact",
      authorityLevel: "derived-non-authoritative",
      ...common,
      fields,
      granularity: "derived display/interaction rows",
      recordCounts,
      timeRange: null,
      source: "build_forever_dataset.ts",
      sourceUrl: null,
      corpus: "mixed Google Viewer, selected Gutenberg, secondary lexical, and Wikinews layers",
      release: null,
      missingness: ["Upstream missingness is not preserved as a complete typed state model."],
      duplicatePolicy: "Varies by derived layer and is not registered as a dataset-level policy.",
      transformHistory: ["Heuristic filtering, scoring, selection, aggregation, and/or manual geometry from build_forever_dataset.ts."],
      rightsBoundary: "Inherits unresolved boundaries from every upstream layer; not a quotation or research authority.",
      caveats: ["Must not be used as raw analysis input or as a research result."],
    };
  }

  const isScript = relativePath.startsWith("scripts/");
  const isRegistry = relativePath === "src/data/forever.ts" || relativePath === "src/data/search-intents.ts";
  return {
    id: `${isScript ? "script" : isRegistry ? "registry" : "consumer"}-${path.basename(relativePath).replace(/\.[^.]+$/, "").replaceAll("_", "-")}`,
    path: relativePath,
    role: isScript ? "transform-script" : isRegistry ? "term-form-registry" : "render-consumer",
    authorityLevel: isRegistry ? "placeholder-only" : "source-code-audit-only",
    ...common,
    fields: isRegistry
      ? ["hard-coded sources/forms/claims/visual values", "prose evidence references"]
      : ["TypeScript source text", "hard-coded query/filter/transform/coordinate literals"],
    granularity: "source file",
    recordCounts: codeRecordCounts(text),
    timeRange: null,
    source: isScript ? "repository transform code" : isRegistry ? "legacy repository registry/prose" : "repository render code",
    sourceUrl: null,
    corpus: null,
    release: null,
    missingness: ["Source code cannot substitute for retained raw records or an explicit missingness state."],
    duplicatePolicy: "Not applicable or not declared in a machine-readable registry.",
    transformHistory: [isScript ? "Audited as executable transform logic." : "Audited for manually encoded research claims or visual mappings."],
    rightsBoundary: "No independent rights authority; follows the referenced data source if one exists.",
    caveats: [
      isRegistry
        ? "Contains placeholders or editorial claims and is excluded from research authority."
        : "May contain untraceable transforms/geometry and is excluded from research authority.",
    ],
  };
}

function buildManifest(
  inputs: InputBundle,
  dataGate: ReturnType<typeof deriveDataGate>,
  availability: ForeverRawAvailabilityAudit,
): ForeverRawDataManifest {
  const entries = inputs.inputPaths.map((relativePath) => manifestEntry(inputs, relativePath, availability));
  const digestMaterial = entries
    .map((entry) => `${entry.path}:${entry.sha256}`)
    .sort()
    .join("\n");
  return {
    schemaVersion: SCHEMA_VERSION,
    auditId: AUDIT_ID,
    dataGate,
    inputSetSha256: sha256(digestMaterial),
    expectedInputCount: inputs.inputPaths.length,
    entries,
    upstreamRawPresent: availability.upstreamRawPresent,
    coverageManifestPresent: availability.coverageManifestPresent,
    transformManifestPresent: availability.transformManifestPresent,
    rightsManifestPresent: availability.rightsManifestPresent,
  };
}

function buildGaps(fixedGoogle: ForeverFixedGoogleReleaseAudit): ForeverRawGap[] {
  const gaps: ForeverRawGap[] = [
    {
      id: "gap-canonical-form-registry",
      priority: "P0",
      missingFilesOrFields: ["one canonical term/form registry", "ngram order", "case policy", "joined/spaced/hyphen policy", "query preregistration"],
      whyRequired: "Current form lists are fragmented and inconsistent across Ngram, Gutenberg, prehistory, and modern scripts.",
      officialSourceBoundary: "Repository-authored registry; source query strings must remain exact and versioned.",
      blocksFindingIds: ["finding-gutenberg-inventory", "finding-derived-authority"],
      blocksContractIds: ["contract-orthographic-family", "contract-gutenberg-inventory"],
    },
    {
      id: "gap-google-raw-response-release",
      priority: "P0",
      missingFilesOrFields: ["exact raw Viewer response", "request manifest", "explicit Google corpus release", "response checksum", "parent/type fields"],
      whyRequired: "The generated series discards response fields and pins only the mutable corpus alias 'en'.",
      officialSourceBoundary: "Google official Viewer/API or official downloadable Ngram release only.",
      blocksFindingIds: ["finding-google-fixed-viewer-separate-facets"],
      blocksContractIds: ["contract-google-fixed-viewer-separate-facets"],
    },
    {
      id: "gap-google-common-denominator",
      priority: "P0",
      missingFilesOrFields: ["official v3 exact-form wide source records", "deterministic annual expansion with wide-field lineage", "same-release annual word-token totals", "release/shard manifest", "checksums"],
      whyRequired: "A common appearances-per-million-words scale cannot be reconstructed from Viewer normalized fractions.",
      officialSourceBoundary: "Google official downloadable Ngram shards and same-release total-count files only; no blog or third-party reconstruction.",
      blocksFindingIds: ["finding-google-raw-common-denominator"],
      blocksContractIds: ["contract-google-fixed-raw-common-denominator", "contract-orthographic-family"],
    },
    {
      id: "gap-gutenberg-raw-texts-metadata",
      priority: "P0",
      missingFilesOrFields: ["complete declared official text inventory", "Gutenberg metadata/release/update", "edition/translator/language", "capture date", "SHA-256", "selection manifest"],
      whyRequired: "Existing counts and passages cannot be deterministically re-extracted or dated to the wording edition.",
      officialSourceBoundary: "Project Gutenberg official files/metadata; passage reuse remains bounded by recorded edition and jurisdiction.",
      blocksFindingIds: ["finding-gutenberg-inventory", "finding-gutenberg-duplicates"],
      blocksContractIds: ["contract-coverage-matrix", "contract-gutenberg-inventory"],
    },
    {
      id: "gap-attestation-primary-records",
      priority: "P0",
      missingFilesOrFields: ["source quotation", "edition/publication record", "date precision", "access/snapshot date", "rights", "verification decision"],
      whyRequired: "All six current quotation fields are blank and two secondary claims conflict.",
      officialSourceBoundary: "Primary edition/scan or licensed lexical authority with quotation-reuse boundary.",
      blocksFindingIds: ["finding-prehistory-provenance"],
      blocksContractIds: ["contract-date-ledger"],
    },
    {
      id: "gap-modern-raw-api-pages",
      priority: "P0",
      missingFilesOrFields: ["all declared raw search responses", "total/continuation/zero-result state", "pageid/revid/timestamps", "all declared unique revision captures", "page publication/text/capture dates", "license metadata", "passage hashes"],
      whyRequired: "Search snippets are mutable, duplicate one page across queries, and use revision year as the only date.",
      officialSourceBoundary: "Wikinews/MediaWiki official API and page revision content only.",
      blocksFindingIds: ["finding-modern-capture"],
      blocksContractIds: ["contract-coverage-matrix", "contract-modern-matrix"],
    },
    {
      id: "gap-coverage-rights-transform-manifests",
      priority: "P0",
      missingFilesOrFields: ["coverage manifest", "observed-zero/not-searched/unavailable/incomparable states", "rights manifest", "transform history with versions"],
      whyRequired: "The current files cannot distinguish missing from zero or locally disclose all source/rights boundaries.",
      officialSourceBoundary: "Repository-authored manifests grounded in retained official captures.",
      blocksFindingIds: ["finding-modern-capture", "finding-derived-authority"],
      blocksContractIds: ["contract-coverage-matrix", "contract-date-ledger", "contract-modern-matrix"],
    },
  ];
  return gaps.filter((gap) => {
    if (
      gap.id === "gap-google-raw-response-release" &&
      fixedGoogle.fixedViewerSeparateFacets.productionEligible
    ) return false;
    if (
      gap.id === "gap-google-common-denominator" &&
      fixedGoogle.fixedRawCommonDenominator.productionEligible
    ) return false;
    return true;
  });
}

function buildFindings(
  inputs: InputBundle,
  dataGate: ReturnType<typeof deriveDataGate>,
  availability: ForeverRawAvailabilityAudit,
  fixedGoogle: ForeverFixedGoogleReleaseAudit,
): ForeverFindingsRegistry {
  const frequencyPath = "src/data/generated/forever_frequency.json";
  const gutenbergPath = "src/data/generated/forever_gutenberg_sources.json";
  const prehistoryPath = "src/data/generated/forever_prehistory.json";
  const modernPath = "src/data/generated/forever_modern_context.json";
  const officialAuthorityPath = "docs/research/forever/sources/google-ngram-official-authority.json";
  const fixedViewerReady = fixedGoogle.fixedViewerSeparateFacets.productionEligible;
  const fixedCommonReady = fixedGoogle.fixedRawCommonDenominator.productionEligible;
  const fixedViewerPathsPresent = [
    FIXED_GOOGLE_PATHS.viewerRequest,
    FIXED_GOOGLE_PATHS.viewerResponse,
  ].every((pathname) => inputs.inputPaths.includes(pathname));
  const fixedCommonPathsPresent = [
    FIXED_GOOGLE_PATHS.foreverSource,
    FIXED_GOOGLE_PATHS.foreverAnnual,
    FIXED_GOOGLE_PATHS.forEverSource,
    FIXED_GOOGLE_PATHS.forEverAnnual,
    FIXED_GOOGLE_PATHS.totalCounts,
    FIXED_GOOGLE_PATHS.acquisition,
    FIXED_GOOGLE_PATHS.transforms,
    FIXED_GOOGLE_PATHS.rights,
  ].every((pathname) => inputs.inputPaths.includes(pathname));
  const allOccurrences = inputs.gutenberg.sources.flatMap((source) =>
    source.occurrences.map((occurrence) => ({ sourceId: source.id, ...occurrence })),
  );
  const formOccurrences = allOccurrences.filter((row) => row.kind === "form");
  const joined = formOccurrences.filter((row) => row.phrase === "forever");
  const spaced = formOccurrences.filter((row) => row.phrase === "for ever");
  const uniquePositions = new Set(allOccurrences.map((row) => `${row.sourceId}:${row.tokenIndex}`));
  const modernUniqueUrls = new Set(inputs.modern.snippets.map((row) => row.sourceUrl));
  const modernQueriesWithoutRows = inputs.modern.queries.filter(
    (query) => !inputs.modern.snippets.some((row) => row.query === query),
  );

  const findingsBase: Array<Omit<ForeverFinding, "missingnessPolicy" | "derivationPolicy">> = [
    {
      id: "finding-google-raw-common-denominator",
      status: fixedCommonReady ? "validated-result" : "audited-blocker",
      productionEligible: fixedCommonReady,
      question: "Can joined 'forever' and spaced 'for ever' share an appearances-per-million scale?",
      rawFields: fixedCommonPathsPresent
        ? [
            sourceSelector(FIXED_GOOGLE_PATHS.foreverSource, "official v3 exact-form wide record", ["field[0]: ngram", "field[k]: year,match_count,volume_count"]),
            sourceSelector(FIXED_GOOGLE_PATHS.foreverAnnual, "deterministic annual expansion with wide-record lineage", ["ngram", "year", "match_count", "volume_count", "wide_field_index"]),
            sourceSelector(FIXED_GOOGLE_PATHS.forEverSource, "official v3 exact-form wide record", ["field[0]: ngram", "field[k]: year,match_count,volume_count"]),
            sourceSelector(FIXED_GOOGLE_PATHS.forEverAnnual, "deterministic annual expansion with wide-record lineage", ["ngram", "year", "match_count", "volume_count", "wide_field_index"]),
            sourceSelector(FIXED_GOOGLE_PATHS.totalCounts, "annual total-count records", ["year", "annual 1-gram word tokens"]),
          ]
        : [
            sourceSelector(frequencyPath, "series[query in {'forever','for ever'}]", ["query", "points[].value", "source.corpus", "source.url"]),
            sourceSelector(officialAuthorityPath, "sourceRecords[id='google-ngram-viewer-denominator']", ["url", "applicableClaim", "sourceLocation", "accessedOn"]),
          ],
      filters: ["exact ngram equality: forever or for ever", "fixed corpus googlebooks-eng-20200217", "year <= 2019; raw lower bound derives from retained release records"],
      grouping: ["exact form", "year"],
      denominator: "same-release annual 1-gram word-token total",
      transformFormula: "exact-form match_count / annual 1-gram word tokens × 1,000,000",
      result: {
        summary: fixedCommonReady
          ? "The fixed 20200217 raw rows and annual word-token totals validate a common exact-form rate denominator."
          : "The fixed raw common-denominator dependency closure is not yet complete.",
        values: {
          foreverOrder: ngramOrder("forever"),
          forEverOrder: ngramOrder("for ever"),
          release: fixedGoogle.release.persistentIdentifier,
          yearRange: fixedGoogle.fixedRawCommonDenominator.yearRange,
          annualRateRows: fixedGoogle.fixedRawCommonDenominator.annualRates.length,
          sharedScaleAllowed: fixedCommonReady,
          outcome: fixedGoogle.outcome,
        },
      },
      caveat: [
        "The rate describes exact surface-form appearances per million corpus word tokens, not language-wide spelling adoption or semantic replacement.",
        "OCR error, corpus composition, and publication bias remain.",
        "A sparse absent row is absent_or_suppressed, never silently observed_zero.",
      ],
      sourceRowsFiles: fixedCommonPathsPresent
        ? [
            sourceSelector(FIXED_GOOGLE_PATHS.acquisition, "release/objects", ["url", "contentLength", "etag", "xGoogHash", "local.sha256"]),
            sourceSelector(FIXED_GOOGLE_PATHS.transforms, "active transforms", ["id", "inputs", "outputs", "formula", "missingnessPolicy"]),
            sourceSelector(FIXED_GOOGLE_PATHS.rights, "datasetDefaults/itemOverrides", ["sourceUrl", "license", "rightsBoundary"]),
            sourceSelector(FIXED_GOOGLE_PATHS.extractionSummary, "actual per-form raw coverage and lineage schema", ["rawCoverageRule", "forms[].stats", "wideFieldIndex"]),
            sourceSelector(officialAuthorityPath, "official denominator and release authority records", ["publisher", "title", "url", "applicableClaim", "rightsBoundary"]),
          ]
        : [
            sourceSelector(frequencyPath, "source", ["corpus", "url", "smoothing", "startYear", "endYear"]),
            sourceSelector("scripts/fetch_ngram_forever.ts", "legacy excluded acquisition", ["content", "corpus", "smoothing", "case_insensitive", "timeseries"]),
            sourceSelector(officialAuthorityPath, "official source records", ["publisher", "title", "url", "applicableClaim"]),
          ],
      blockedByGapIds: fixedCommonReady ? [] : ["gap-google-common-denominator"],
    },
    {
      id: "finding-google-fixed-viewer-separate-facets",
      status: fixedViewerReady ? "validated-result" : "audited-blocker",
      productionEligible: fixedViewerReady,
      question: "What can the fixed eng_2019 Viewer response support when n-gram orders remain separate?",
      rawFields: fixedViewerPathsPresent
        ? [
            sourceSelector(FIXED_GOOGLE_PATHS.viewerRequest, "request/release", ["params", "release", "rawResponse.sha256"]),
            sourceSelector(FIXED_GOOGLE_PATHS.viewerResponse, "response rows", ["ngram", "parent", "type", "timeseries"]),
          ]
        : [sourceSelector(frequencyPath, "legacy mutable Viewer series", ["query", "year", "value"])],
      filters: ["eng_2019", "smoothing=0", "case-sensitive", "1500–2019", "core forms only"],
      grouping: ["n-gram order", "exact form", "year"],
      denominator: "forever: all unigrams; for ever: all bigrams, in separate facets",
      transformFormula: "Viewer normalized fraction × 1,000,000 within its own order-specific denominator",
      result: {
        summary: fixedViewerReady
          ? "The checksum-bound fixed response supports separate unigram and bigram facets only."
          : "The fixed Viewer request/response contract is not yet checksum-complete.",
        values: {
          release: fixedGoogle.release.viewerShorthand,
          pointCounts: fixedGoogle.fixedViewerSeparateFacets.pointCounts,
          yearRange: fixedGoogle.fixedViewerSeparateFacets.yearRange,
          directComparisonAllowed: false,
        },
      },
      caveat: ["No direct comparison, share, ratio, crossover, overtaking, or delta across unigram/bigram Viewer denominators."],
      sourceRowsFiles: fixedViewerPathsPresent
        ? [sourceSelector(FIXED_GOOGLE_PATHS.viewerRequest, "request + checksum", ["requestUrl", "params", "release", "rawResponse"])]
        : [sourceSelector(frequencyPath, "legacy source", ["source.corpus", "source.url"])],
      blockedByGapIds: fixedViewerReady ? [] : ["gap-google-raw-response-release"],
    },
    {
      id: "finding-gutenberg-inventory",
      status: "audited-limited-result",
      productionEligible: false,
      question: "What joined/spaced counts exist inside the selected Gutenberg inventory?",
      rawFields: [sourceSelector(gutenbergPath, "sources[] and sources[].occurrences[kind='form']", ["id", "year", "tokenCount", "kind", "phrase", "tokenIndex"])],
      filters: [`${inputs.gutenberg.sources.length} manually selected works`, "occurrence.kind='form'", "phrase exactly 'forever' or 'for ever'"],
      grouping: ["form", "selected work"],
      denominator: `token count inside the selected ${inputs.gutenberg.sources.length} processed texts only`,
      transformFormula: "count exact form rows; rate, if used, must equal form_count / selected_text_tokens × 1,000,000",
      result: {
        summary: "The generated inventory separates joined and spaced forms, but it is selected-corpus evidence without retained raw texts.",
        values: {
          selectedWorks: inputs.gutenberg.sources.length,
          tokens: sum(inputs.gutenberg.sources.map((source) => source.tokenCount)),
          joinedOccurrences: joined.length,
          spacedOccurrences: spaced.length,
          allFormOccurrences: formOccurrences.length,
        },
      },
      caveat: ["Not representative of print generally.", "Hyphenated forms may be conflated.", "Edition/translation dates are unresolved."],
      sourceRowsFiles: [sourceSelector(gutenbergPath, "sources[].occurrences[kind='form']", ["phrase", "tokenIndex", "snippet"])],
      blockedByGapIds: ["gap-gutenberg-raw-texts-metadata", "gap-canonical-form-registry"],
    },
    {
      id: "finding-gutenberg-duplicates",
      status: "audited-blocker",
      productionEligible: false,
      question: "Does one generated Gutenberg occurrence row equal one unique source passage position?",
      rawFields: [sourceSelector(gutenbergPath, "sources[].occurrences[]", ["source id", "kind", "phrase", "tokenIndex"])],
      filters: ["all generated occurrence rows"],
      grouping: ["source id + tokenIndex"],
      denominator: "generated occurrence rows versus unique source-token positions",
      transformFormula: "duplicate_role_rows = occurrence_rows - unique(source_id, tokenIndex)",
      result: {
        summary: "Phrase and form roles create repeated source-token positions; a record-level figure must dedupe passages before counting.",
        values: { occurrenceRows: allOccurrences.length, uniqueSourceTokenPositions: uniquePositions.size, duplicateRoleRows: allOccurrences.length - uniquePositions.size },
      },
      caveat: ["A future passage ID should distinguish one verified passage from its multiple analytic roles."],
      sourceRowsFiles: [sourceSelector(gutenbergPath, "sources[].occurrences[]", ["kind", "phrase", "tokenIndex"])],
      blockedByGapIds: ["gap-gutenberg-raw-texts-metadata"],
    },
    {
      id: "finding-prehistory-provenance",
      status: "audited-blocker",
      productionEligible: false,
      question: "Can current attestation claims support a source-bound date ledger?",
      rawFields: [sourceSelector(prehistoryPath, "records[]", ["form", "dateLabel", "yearApproximation", "quote", "verificationStatus", "confidence", "sourceUrl"])],
      filters: ["all attestation records"],
      grouping: ["form", "source claim"],
      denominator: "not applicable; claim ledger",
      transformFormula: "count records, blank quotations, and verification states",
      result: {
        summary: "No: all quotations are blank and the layer contains unresolved secondary-source conflicts.",
        values: {
          claims: inputs.prehistory.records.length,
          blankQuotes: inputs.prehistory.records.filter((record) => record.quote.trim() === "").length,
          conflictingClaims: inputs.prehistory.records.filter((record) => record.verificationStatus.includes("conflicting")).length,
        },
      },
      caveat: ["Approximate century labels are converted into exact-looking numeric coordinates."],
      sourceRowsFiles: [sourceSelector(prehistoryPath, "records[]", ["id", "dateLabel", "yearApproximation", "sourceName", "sourceUrl"])],
      blockedByGapIds: ["gap-attestation-primary-records"],
    },
    {
      id: "finding-modern-capture",
      status: "audited-blocker",
      productionEligible: false,
      question: "Can the Wikinews capture show modern persistence or a source/date matrix?",
      rawFields: [sourceSelector(modernPath, "queries[] and snippets[]", ["query", "sourceUrl", "title", "year", "dateBasis", "quote", "rightsStatus"])],
      filters: ["retained snippets containing joined or spaced form", "maximum six search rows per query"],
      grouping: ["query", "source URL"],
      denominator: "none; API search-result inventory",
      transformFormula: "count retained snippet rows and unique source URLs; find registered queries with no retained row",
      result: {
        summary: "The capture is a mutable one-time inventory, with one duplicate page across queries and no typed zero-result state.",
        values: {
          registeredQueries: inputs.modern.queries.length,
          snippetRows: inputs.modern.snippets.length,
          uniqueSourceUrls: modernUniqueUrls.size,
          duplicateUrlRows: inputs.modern.snippets.length - modernUniqueUrls.size,
          queriesWithoutRetainedRows: modernQueriesWithoutRows,
        },
      },
      caveat: ["Revision year is not page publication date, quoted-text date, or capture date.", "Snippet-row counts are not occurrences in page text."],
      sourceRowsFiles: [sourceSelector(modernPath, "snippets[]", ["id", "query", "sourceUrl", "year", "dateBasis"])],
      blockedByGapIds: ["gap-modern-raw-api-pages", "gap-coverage-rights-transform-manifests"],
    },
    {
      id: "finding-derived-authority",
      status: "audited-blocker",
      productionEligible: false,
      question: "Which current derived layers cannot continue as research results?",
      rawFields: [
        sourceSelector("scripts/build_forever_dataset.ts", "simpleLogDice, flows, categories, ledger, atlas, network", ["counts", "frequencyPerMillion", "manual positions", "heuristic weights"]),
        sourceSelector("src/data/generated/forever_dataset.json", "derived arrays", ["flows", "atlas", "network", "categories", "ledger", "inspectors"]),
      ],
      filters: ["all transforms without a finding/figure contract and all cross-denominator aggregates"],
      grouping: ["derived layer"],
      denominator: "mixed or unregistered",
      transformFormula: "audit source code for mixed units, candidateCount=jointCount scoring, manual coordinates, and heuristic weights",
      result: {
        summary: "Flows, atlas/network geometry, heuristic category/ledger scores, selected snippets, and score arrays are excluded from research authority.",
        values: {
          flows: inputs.dataset.flows.length,
          atlasNodes: inputs.dataset.atlas.nodes.length,
          networkNodes: inputs.dataset.network.nodes.length,
          inspectors: inputs.dataset.inspectors.length,
        },
      },
      caveat: ["These may be editorial design artifacts, but cannot be presented as measured findings."],
      sourceRowsFiles: [sourceSelector("scripts/build_forever_dataset.ts", "derived transforms", ["simpleLogDice", "flows", "network positions", "sourceLayers.comparable"])],
      blockedByGapIds: ["gap-canonical-form-registry", "gap-coverage-rights-transform-manifests"],
    },
  ];

  const findings: ForeverFinding[] = findingsBase.map((finding) => {
    const missingnessPolicy =
      "Use the registered typed coverage state; sparse-row absence remains absent_or_suppressed unless official format semantics independently prove observed_zero.";
    const derivationPolicy = finding.id === "finding-google-raw-common-denominator"
      ? {
          yearCoverage: fixedGoogle.fixedRawCommonDenominator.yearRange
            ? `${fixedGoogle.fixedRawCommonDenominator.yearRange.start}–${fixedGoogle.fixedRawCommonDenominator.yearRange.end}; lower bound derives from the frozen totalcounts release records and upper bound is fixed at 2019`
            : "unavailable until the fixed raw dependency closure validates",
          minimumDataRule: "Emit an annual rate only when an explicit exact-form wide observation field and a positive same-year totalcounts-1 token denominator both exist; pair arithmetic requires both core form rates, joined share requires a positive combined count, and raw ratio requires a positive spaced count.",
          smoothingRule: "No smoothing is applied in this contract. Any later smoothed result requires its own preregistered rule and sensitivity finding.",
          edgeHandling: "No interpolation, extrapolation, endpoint padding, or silent fill. Missing denominator years are unavailable; missing form fields are absent_or_suppressed.",
          corpusLimitations: ["OCR error", "changing corpus composition", "publication and survival bias", "exact surface form does not establish meaning or social adoption"],
          rawRowLineage: "official v3 exact-form wide source record field[k] → checksum-bound annual expansion row with wide_field_index=k → same-year frozen totalcounts-1 record → typed annual rate",
        }
      : finding.id === "finding-google-fixed-viewer-separate-facets"
        ? {
            yearCoverage: "1500–2019 from the frozen eng_2019 Viewer request; 520 requested values per exact core form",
            minimumDataRule: "Require exactly one returned NGRAM row and one finite non-negative value per requested year for each exact core form.",
            smoothingRule: "Viewer request smoothing=0; no additional smoothing.",
            edgeHandling: "No extrapolation outside the frozen request and no cross-facet arithmetic at either edge.",
            corpusLimitations: ["order-specific Viewer denominators", "OCR error", "changing corpus composition", "publication and survival bias"],
            rawRowLineage: "checksum-bound Viewer request parameters + raw response bytes → exact response row → timeseries index mapped to requested year within its own n-gram-order facet",
          }
        : {
            yearCoverage: finding.result.values.yearRange
              ? String(finding.result.values.yearRange)
              : "limited to the retained records identified by the finding filters; no unobserved period is inferred",
            minimumDataRule: "No production result until every blocked raw gap for this finding is resolved and its declared record granularity is source-bound.",
            smoothingRule: "No smoothing is registered for this finding.",
            edgeHandling: "Do not interpolate or extend beyond retained source records or their stated date precision.",
            corpusLimitations: finding.caveat,
            rawRowLineage: "See rawFields and sourceRowsFiles selectors; legacy heuristic/display arrays remain excluded from production authority.",
          };
    return { ...finding, missingnessPolicy, derivationPolicy };
  });
  return { schemaVersion: SCHEMA_VERSION, auditId: AUDIT_ID, dataGate, findings };
}

function buildContracts(
  inputs: InputBundle,
  dataGate: ReturnType<typeof deriveDataGate>,
  fixedGoogle: ForeverFixedGoogleReleaseAudit,
): ForeverFigureContractRegistry {
  const fixedViewerPathsPresent = [
    FIXED_GOOGLE_PATHS.viewerRequest,
    FIXED_GOOGLE_PATHS.viewerResponse,
  ].every((pathname) => inputs.inputPaths.includes(pathname));
  const fixedCommonPathsPresent = [
    FIXED_GOOGLE_PATHS.foreverSource,
    FIXED_GOOGLE_PATHS.foreverAnnual,
    FIXED_GOOGLE_PATHS.forEverSource,
    FIXED_GOOGLE_PATHS.forEverAnnual,
    FIXED_GOOGLE_PATHS.totalCounts,
  ].every((pathname) => inputs.inputPaths.includes(pathname));
  const contractsBase: Array<
    Omit<ForeverFigureContract, "missingnessPolicy" | "activeDependencyClosure" | "rightsResolution">
  > = [
    {
      id: "contract-coverage-matrix",
      candidatePanel: "Evidence coverage matrix",
      findingIds: ["finding-modern-capture", "finding-gutenberg-inventory"],
      productionEligible: false,
      eligibilityReason: "No typed coverage manifest distinguishes observed zero, not searched, unavailable, and incomparable.",
      researchQuestion: "Which source layers actually cover each period and evidence type?",
      rawFilesAndFields: [sourceSelector("src/data/generated/forever_frequency.json", "source/series", ["year", "query"]), sourceSelector("src/data/generated/forever_gutenberg_sources.json", "sources[]", ["year", "tokenCount"]), sourceSelector("src/data/generated/forever_modern_context.json", "queries/snippets", ["query", "year"])],
      recordGranularityAndN: { granularity: "dataset × period × coverage state", n: { currentDatasets: 4 } },
      filters: ["registered search scope only"],
      grouping: ["dataset", "year/decade", "document/token/record coverage state"],
      denominator: "registered source universe per layer",
      formulaTransform: "coverage state derived from retained search/capture log, never from numeric zero",
      unit: "documents, tokens, records, and explicit coverage state",
      visualChannelMapping: [{ channel: "cell text + shape", field: "coverage state", mapping: "distinct redundant state marker" }, { channel: "facet", field: "dataset", mapping: "one source layer per facet" }],
      validInterpretation: ["Where evidence is present, absent, unsearched, unavailable, or incomparable."],
      prohibitedInterpretation: ["A blank area is evidence of zero usage."],
      missingnessErrorSourceLimitations: ["Coverage state is not retained for current captures."],
      localDisclosureRequirements: ["state legend", "n by layer", "source/release", "coverage limitation"],
      blockedByGapIds: ["gap-coverage-rights-transform-manifests", "gap-gutenberg-raw-texts-metadata", "gap-modern-raw-api-pages"],
    },
    {
      id: "contract-google-fixed-viewer-separate-facets",
      candidatePanel: "Fixed Viewer separate facets",
      findingIds: ["finding-google-fixed-viewer-separate-facets"],
      productionEligible: fixedGoogle.fixedViewerSeparateFacets.productionEligible,
      eligibilityReason: fixedGoogle.fixedViewerSeparateFacets.productionEligible
        ? "Checksum-bound eng_2019 response, exact core forms, request parameters, release, and rights all validate; page implementation remains separately unauthorized."
        : "The frozen eng_2019 Viewer request/response closure is incomplete or invalid.",
      researchQuestion: "How does each core form move within its own fixed-release Viewer denominator?",
      rawFilesAndFields: fixedViewerPathsPresent
        ? [
            sourceSelector(FIXED_GOOGLE_PATHS.viewerRequest, "request/release/rawResponse", ["params", "release", "sha256"]),
            sourceSelector(FIXED_GOOGLE_PATHS.viewerResponse, "exact response rows", ["ngram", "parent", "type", "timeseries"]),
          ]
        : [sourceSelector("src/data/generated/forever_frequency.json", "legacy mutable Viewer series", ["query", "year", "value"])],
      recordGranularityAndN: { granularity: "exact query-year fixed Viewer observation", n: fixedGoogle.fixedViewerSeparateFacets.pointCounts },
      filters: ["eng_2019", "smoothing=0", "case-sensitive", "exact core forms", "1500–2019"],
      grouping: ["n-gram order", "exact form", "year"],
      denominator: "forever: all unigrams; for ever: all bigrams, never shared",
      formulaTransform: "Viewer fraction × 1,000,000; no cross-order arithmetic",
      unit: "forever — per million unigrams; for ever — per million bigrams",
      visualChannelMapping: [{ channel: "facet", field: "ngram order", mapping: "never share an axis across orders" }, { channel: "x", field: "year", mapping: "linear time" }, { channel: "y", field: "Viewer fraction", mapping: "within-facet fixed unit" }],
      validInterpretation: ["Within-series movement and same-order comparison after release is pinned."],
      prohibitedInterpretation: ["joined/spaced share, ratio, crossover, overtaking, delta, or orthographic dominance"],
      missingnessErrorSourceLimitations: ["Viewer zero/suppression semantics are not a common-denominator substitute.", "OCR and corpus-composition limits remain."],
      localDisclosureRequirements: ["exact unit per facet", "corpus/release", "smoothing", "n/year range", "zero/missing caveat"],
      blockedByGapIds: fixedGoogle.fixedViewerSeparateFacets.productionEligible ? [] : ["gap-google-raw-response-release"],
    },
    {
      id: "contract-google-fixed-raw-common-denominator",
      candidatePanel: "Fixed raw common denominator",
      findingIds: ["finding-google-raw-common-denominator"],
      productionEligible: fixedGoogle.fixedRawCommonDenominator.productionEligible,
      eligibilityReason: fixedGoogle.fixedRawCommonDenominator.productionEligible
        ? "Fixed official v3 wide source records, lineage-bound annual expansion, annual 1-gram token totals, object identity, checksums, active transform closure, rights, coverage, and sparse missingness all validate; page implementation remains separately unauthorized."
        : "The fixed raw common-denominator dependency closure is incomplete or invalid.",
      researchQuestion: "What are the exact joined and spaced annual rates on one fixed-release word-token denominator?",
      rawFilesAndFields: fixedCommonPathsPresent
        ? [
            sourceSelector(FIXED_GOOGLE_PATHS.foreverSource, "one official v3 exact-form wide source record", ["field[0]: ngram", "field[k]: year,match_count,volume_count"]),
            sourceSelector(FIXED_GOOGLE_PATHS.foreverAnnual, "derived annual expansion; each row binds one wide field", ["ngram", "year", "match_count", "volume_count", "wide_field_index"]),
            sourceSelector(FIXED_GOOGLE_PATHS.forEverSource, "one official v3 exact-form wide source record", ["field[0]: ngram", "field[k]: year,match_count,volume_count"]),
            sourceSelector(FIXED_GOOGLE_PATHS.forEverAnnual, "derived annual expansion; each row binds one wide field", ["ngram", "year", "match_count", "volume_count", "wide_field_index"]),
            sourceSelector(FIXED_GOOGLE_PATHS.totalCounts, "annual totals", ["year", "annual 1-gram word tokens"]),
          ]
        : [sourceSelector(COMMON_DENOMINATOR_PATH, "expected fixed raw closure", ["match rows", "annual totals", "release", "checksums"])],
      recordGranularityAndN: {
        granularity: "one official exact-form wide source record; deterministic form-year expansion plus explicit sparse coverage state",
        n: Object.fromEntries(
          Object.entries(fixedGoogle.fixedRawCommonDenominator.coverageByForm).map(([form, coverage]) => [form, coverage.retainedRows]),
        ),
      },
      filters: ["exact ngram equality", "googlebooks-eng-20200217", "year <= 2019; actual lower bound from release records", "no synthetic missing-year rows"],
      grouping: ["exact form", "year"],
      denominator: "same-release annual 1-gram word-token total",
      formulaTransform: "exact-form match_count / annual 1-gram word tokens × 1,000,000",
      unit: "exact surface-form appearances per million corpus word tokens",
      visualChannelMapping: [{ channel: "future x", field: "year", mapping: "linear time if implementation is separately authorized" }, { channel: "future y", field: "rate", mapping: "one common exact-form rate unit" }],
      validInterpretation: ["Within this fixed corpus release, exact surface-form appearances relative to annual word-token exposure."],
      prohibitedInterpretation: ["Language-wide spelling adoption, semantic replacement, first use, or an unbiased population trend."],
      missingnessErrorSourceLimitations: ["Sparse absent rows remain absent_or_suppressed.", "OCR, corpus composition, and publication bias remain."],
      localDisclosureRequirements: ["formula", "release", "actual retained row n", "coverage states", "raw lineage", "corpus limitations"],
      blockedByGapIds: fixedGoogle.fixedRawCommonDenominator.productionEligible ? [] : ["gap-google-common-denominator"],
    },
    {
      id: "contract-orthographic-family",
      candidatePanel: "Orthographic-family small multiples",
      findingIds: ["finding-google-raw-common-denominator"],
      productionEligible: false,
      eligibilityReason: "No canonical preregistered complete family and no valid shared scale across all current forms.",
      researchQuestion: "How do all preregistered family forms vary on a genuinely common scale?",
      rawFilesAndFields: [
        sourceSelector(CANONICAL_FORM_REGISTRY_PATH, "forms[] and analysisWindow", ["form", "ngramOrder", "casePolicy", "joinedSpacedPolicy", "hyphenPolicy", "queryPreregistered"]),
        sourceSelector(COMMON_DENOMINATOR_PATH, "checksum-bound match rows and annual totals", ["form", "ngram_order", "year", "match_count", "annual_word_tokens", "release"]),
      ],
      recordGranularityAndN: { granularity: "form-year", n: {} },
      filters: ["all preregistered forms; no post hoc omission"],
      grouping: ["form", "year"],
      denominator: "common annual word-token total",
      formulaTransform: "raw_match_count / annual_word_tokens × 1,000,000",
      unit: "appearances per million words",
      visualChannelMapping: [{ channel: "shared y", field: "rate", mapping: "one fixed scale for every multiple" }, { channel: "facet", field: "form", mapping: "one form per panel" }],
      validInterpretation: ["Relative magnitude and shape on a verified common scale."],
      prohibitedInterpretation: ["Independent shape scales or incomplete post hoc form selection."],
      missingnessErrorSourceLimitations: ["Canonical registry and raw denominator inputs are absent."],
      localDisclosureRequirements: ["complete form list", "shared axis", "n", "release", "missingness"],
      blockedByGapIds: [
        "gap-canonical-form-registry",
        ...(fixedGoogle.fixedRawCommonDenominator.productionEligible ? [] : ["gap-google-common-denominator"]),
      ],
    },
    {
      id: "contract-date-ledger",
      candidatePanel: "Source-bound date ledger",
      findingIds: ["finding-prehistory-provenance"],
      productionEligible: false,
      eligibilityReason: "Current records lack quotations/editions and turn approximate labels into exact-looking years.",
      researchQuestion: "What date does each source actually establish, and at what precision?",
      rawFilesAndFields: [sourceSelector("src/data/generated/forever_prehistory.json", "records[]", ["form", "dateLabel", "yearApproximation", "sourceUrl", "quote", "verificationStatus"])],
      recordGranularityAndN: { granularity: "one verified source-bound claim", n: { currentUnverifiedClaims: inputs.prehistory.records.length } },
      filters: ["verified quotation and edition required"],
      grouping: ["date basis: composition/publication/edition/dictionary report"],
      denominator: "not applicable",
      formulaTransform: "retain original temporal precision; do not coerce century labels to exact point dates",
      unit: "source date with precision/uncertainty",
      visualChannelMapping: [{ channel: "position/interval", field: "date precision", mapping: "point only for exact date; bounded band for uncertainty" }, { channel: "text", field: "date basis", mapping: "composition/publication/edition/report" }],
      validInterpretation: ["What each verified source claims at its actual precision."],
      prohibitedInterpretation: ["First use, or a rail implying an interval/relationship between conflicting claims."],
      missingnessErrorSourceLimitations: ["Six of six quotes are blank; conflict unresolved."],
      localDisclosureRequirements: ["quotation", "edition", "date basis", "verification", "rights"],
      blockedByGapIds: ["gap-attestation-primary-records", "gap-coverage-rights-transform-manifests"],
    },
    {
      id: "contract-gutenberg-inventory",
      candidatePanel: "Selected Gutenberg form inventory",
      findingIds: ["finding-gutenberg-inventory", "finding-gutenberg-duplicates"],
      productionEligible: false,
      eligibilityReason: "Potentially substantive within-sample panel, but raw texts, edition metadata, selection manifest, and passage dedupe IDs are missing.",
      researchQuestion: "Within the explicitly selected texts, where do joined and spaced forms occur relative to token exposure?",
      rawFilesAndFields: [sourceSelector("src/data/generated/forever_gutenberg_sources.json", "sources[]/occurrences[]", ["id", "title", "year", "tokenCount", "kind", "phrase", "tokenIndex", "snippet"])],
      recordGranularityAndN: { granularity: "selected work and deduped passage", n: { selectedWorks: inputs.gutenberg.sources.length } },
      filters: ["kind='form'", "exact registered joined/spaced policy", "one passage ID once"],
      grouping: ["work", "form", "edition-date band"],
      denominator: "tokens in each retained selected text",
      formulaTransform: "form_count / text_tokens × 1,000,000; preserve record-level passage rows",
      unit: "occurrences per million selected-text tokens plus raw counts",
      visualChannelMapping: [{ channel: "facet", field: "form", mapping: "joined/spaced" }, { channel: "position", field: "work/edition date", mapping: "verified date" }, { channel: "size + label", field: "count/rate", mapping: "redundant value encoding" }],
      validInterpretation: ["Inventory of the declared selected texts only."],
      prohibitedInterpretation: ["Population trend, orthographic dominance, or general literary frequency."],
      missingnessErrorSourceLimitations: ["Selected sample", "raw texts/editions absent", "hyphen conflation risk", "three duplicate role rows"],
      localDisclosureRequirements: ["selected n", "token denominator", "selection rule", "edition caveat", "passage provenance"],
      blockedByGapIds: ["gap-gutenberg-raw-texts-metadata", "gap-canonical-form-registry"],
    },
    {
      id: "contract-modern-matrix",
      candidatePanel: "Modern capture/source matrix",
      findingIds: ["finding-modern-capture"],
      productionEligible: false,
      eligibilityReason: "Raw search responses/page revisions, zero-result state, and three distinct date fields are absent.",
      researchQuestion: "What did one dated modern capture retrieve, from which source page/revision, for which query?",
      rawFilesAndFields: [sourceSelector("src/data/generated/forever_modern_context.json", "queries[]/snippets[]", ["query", "sourceUrl", "title", "year", "dateBasis", "quote", "rightsStatus"])],
      recordGranularityAndN: { granularity: "unique page revision/passage per query capture", n: { currentSnippetRows: inputs.modern.snippets.length, currentUniqueUrls: unique(inputs.modern.snippets.map((row) => row.sourceUrl)).length } },
      filters: ["dedupe page revision + passage hash", "record zero-result queries"],
      grouping: ["source facet", "query", "text date", "page publication date", "capture date"],
      denominator: "captured search inventory; no prevalence denominator",
      formulaTransform: "dedupe exact page-revision-passage; retain separate date fields",
      unit: "unique captured passage records",
      visualChannelMapping: [{ channel: "row", field: "unique passage", mapping: "one record" }, { channel: "columns", field: "date types", mapping: "text/publication/capture dates" }, { channel: "facet", field: "source", mapping: "Gutenberg and Wikinews never merged" }],
      validInterpretation: ["Contents of one documented inventory capture."],
      prohibitedInterpretation: ["Persistence, survival, prevalence, or modern trend."],
      missingnessErrorSourceLimitations: ["Mutable snippets", "one duplicate URL row", "four queries lack typed search outcome", "license inferred from year"],
      localDisclosureRequirements: ["capture timestamp", "query", "result total", "page/revision ID", "date bases", "license"],
      blockedByGapIds: ["gap-modern-raw-api-pages", "gap-coverage-rights-transform-manifests"],
    },
  ];
  const contracts: ForeverFigureContract[] = contractsBase.map((contract) => {
    const isViewer = contract.id === "contract-google-fixed-viewer-separate-facets";
    const isCommon = contract.id === "contract-google-fixed-raw-common-denominator";
    return {
      ...contract,
      missingnessPolicy: isCommon
        ? "Each explicit wide-record tuple is observed_positive when match_count > 0 or observed_zero when match_count = 0. An absent form-year is absent_or_suppressed and is never synthesized as zero."
        : "Use explicit typed states; never turn a missing sparse row into numeric zero without source-format proof.",
      activeDependencyClosure: isCommon
        ? {
            inputPaths: fixedGoogle.fixedRawCommonDenominator.activeDependencyInputPaths,
            transformIds: fixedGoogle.fixedRawCommonDenominator.activeTransformIds,
            excludedLegacyPaths: fixedGoogle.fixedRawCommonDenominator.excludedLegacyPaths,
            closureValidated: fixedGoogle.fixedRawCommonDenominator.productionEligible,
          }
        : isViewer
          ? {
              inputPaths: [
                "scripts/acquire_forever_google_20200217.ts",
                FIXED_GOOGLE_PATHS.viewerRequest,
                FIXED_GOOGLE_PATHS.viewerResponse,
                FIXED_GOOGLE_PATHS.transforms,
                FIXED_GOOGLE_PATHS.checksums,
                FIXED_GOOGLE_PATHS.rights,
              ].filter((pathname) => inputs.inputPaths.includes(pathname)),
              transformIds: ["google-20200217-viewer-freeze"],
              excludedLegacyPaths: [...LEGACY_FOREVER_PIPELINE_PATHS],
              closureValidated: fixedGoogle.fixedViewerSeparateFacets.productionEligible,
            }
          : {
              inputPaths: contract.rawFilesAndFields.map((source) => source.path),
              transformIds: [],
              excludedLegacyPaths: [...LEGACY_FOREVER_PIPELINE_PATHS],
              closureValidated: false,
            },
      rightsResolution: {
        datasetLevelInheritanceAllowed: true,
        itemLevelOverrideAllowed: true,
        resolved: isCommon
          ? fixedGoogle.fixedRawCommonDenominator.rightsResolvedBy !== null
          : isViewer
            ? fixedGoogle.fixedViewerSeparateFacets.validation.rightsResolved === true
            : false,
      },
    };
  });
  return {
    schemaVersion: SCHEMA_VERSION,
    auditId: AUDIT_ID,
    dataGate,
    productionEligibleCount: contracts.filter((contract) => contract.productionEligible).length,
    pageImplementationAuthorized: PAGE_IMPLEMENTATION_AUTHORIZED,
    contracts,
  };
}

function buildSpotChecks(
  inputs: InputBundle,
  fixedGoogle: ForeverFixedGoogleReleaseAudit,
  findings: ForeverFindingsRegistry,
  contracts: ForeverFigureContractRegistry,
): ForeverSpotCheck[] {
  const withPerturbedCoreFamily = (
    mutate: (familyRegistry: Record<string, unknown>) => void,
  ): InputBundle => {
    const familyRegistry = parseRegisteredJson(inputs, FIXED_GOOGLE_PATHS.family);
    const checksumManifest = parseRegisteredJson(inputs, FIXED_GOOGLE_PATHS.checksums);
    invariant(isRecord(familyRegistry), "fixed Google family registry missing for perturbation check");
    invariant(isRecord(checksumManifest) && Array.isArray(checksumManifest.files), "fixed Google checksum manifest missing for perturbation check");
    const perturbedFamily = JSON.parse(JSON.stringify(familyRegistry)) as Record<string, unknown>;
    const perturbedChecksums = JSON.parse(JSON.stringify(checksumManifest)) as Record<string, unknown>;
    mutate(perturbedFamily);
    const familyText = jsonText(perturbedFamily);
    const familyBytes = Buffer.from(familyText);
    const checksumFiles = Array.isArray(perturbedChecksums.files)
      ? perturbedChecksums.files.filter(isRecord)
      : [];
    const familyChecksum = checksumFiles.find((row) => row.path === FIXED_GOOGLE_PATHS.family);
    invariant(familyChecksum, "family registry checksum descriptor missing for perturbation check");
    familyChecksum.bytes = familyBytes.byteLength;
    familyChecksum.sha256 = sha256(familyBytes);
    const checksumText = jsonText(perturbedChecksums);
    return {
      ...inputs,
      bytes: new Map(inputs.bytes)
        .set(FIXED_GOOGLE_PATHS.family, familyBytes)
        .set(FIXED_GOOGLE_PATHS.checksums, Buffer.from(checksumText)),
      texts: new Map(inputs.texts)
        .set(FIXED_GOOGLE_PATHS.family, familyText)
        .set(FIXED_GOOGLE_PATHS.checksums, checksumText),
    };
  };
  const withPerturbedTransformManifest = (
    mutate: (transformManifest: Record<string, unknown>) => void,
  ): InputBundle => {
    const transformManifest = parseRegisteredJson(inputs, FIXED_GOOGLE_PATHS.transforms);
    const checksumManifest = parseRegisteredJson(inputs, FIXED_GOOGLE_PATHS.checksums);
    invariant(isRecord(transformManifest), "fixed Google transform manifest missing for perturbation check");
    invariant(isRecord(checksumManifest) && Array.isArray(checksumManifest.files), "fixed Google checksum manifest missing for transform perturbation check");
    const perturbedTransforms = JSON.parse(JSON.stringify(transformManifest)) as Record<string, unknown>;
    const perturbedChecksums = JSON.parse(JSON.stringify(checksumManifest)) as Record<string, unknown>;
    mutate(perturbedTransforms);
    const transformText = jsonText(perturbedTransforms);
    const transformBytes = Buffer.from(transformText);
    const checksumFiles = Array.isArray(perturbedChecksums.files)
      ? perturbedChecksums.files.filter(isRecord)
      : [];
    const transformChecksum = checksumFiles.find((row) => row.path === FIXED_GOOGLE_PATHS.transforms);
    invariant(transformChecksum, "transform manifest checksum descriptor missing for perturbation check");
    transformChecksum.bytes = transformBytes.byteLength;
    transformChecksum.sha256 = sha256(transformBytes);
    const checksumText = jsonText(perturbedChecksums);
    return {
      ...inputs,
      bytes: new Map(inputs.bytes)
        .set(FIXED_GOOGLE_PATHS.transforms, transformBytes)
        .set(FIXED_GOOGLE_PATHS.checksums, Buffer.from(checksumText)),
      texts: new Map(inputs.texts)
        .set(FIXED_GOOGLE_PATHS.transforms, transformText)
        .set(FIXED_GOOGLE_PATHS.checksums, checksumText),
    };
  };
  const withPerturbedRightsManifest = (
    mutate: (rightsManifest: Record<string, unknown>) => void,
  ): InputBundle => {
    const rightsManifest = parseRegisteredJson(inputs, FIXED_GOOGLE_PATHS.rights);
    const checksumManifest = parseRegisteredJson(inputs, FIXED_GOOGLE_PATHS.checksums);
    invariant(isRecord(rightsManifest), "fixed Google rights manifest missing for perturbation check");
    invariant(isRecord(checksumManifest) && Array.isArray(checksumManifest.files), "fixed Google checksum manifest missing for rights perturbation check");
    const perturbedRights = JSON.parse(JSON.stringify(rightsManifest)) as Record<string, unknown>;
    const perturbedChecksums = JSON.parse(JSON.stringify(checksumManifest)) as Record<string, unknown>;
    mutate(perturbedRights);
    const rightsText = jsonText(perturbedRights);
    const rightsBytes = Buffer.from(rightsText);
    const checksumFiles = Array.isArray(perturbedChecksums.files)
      ? perturbedChecksums.files.filter(isRecord)
      : [];
    const rightsChecksum = checksumFiles.find((row) => row.path === FIXED_GOOGLE_PATHS.rights);
    invariant(rightsChecksum, "rights manifest checksum descriptor missing for perturbation check");
    rightsChecksum.bytes = rightsBytes.byteLength;
    rightsChecksum.sha256 = sha256(rightsBytes);
    const checksumText = jsonText(perturbedChecksums);
    return {
      ...inputs,
      bytes: new Map(inputs.bytes)
        .set(FIXED_GOOGLE_PATHS.rights, rightsBytes)
        .set(FIXED_GOOGLE_PATHS.checksums, Buffer.from(checksumText)),
      texts: new Map(inputs.texts)
        .set(FIXED_GOOGLE_PATHS.rights, rightsText)
        .set(FIXED_GOOGLE_PATHS.checksums, checksumText),
    };
  };
  const trackedDescriptor = (pathname: string) => {
    const bytes = inputs.bytes.get(pathname);
    invariant(bytes, `missing perturbation descriptor bytes for ${pathname}`);
    return {
      path: pathname,
      bytes: bytes.byteLength,
      sha256: sha256(bytes),
      requiredInTrackedCheckout: true,
    };
  };
  const frequencyPath = "src/data/generated/forever_frequency.json";
  const gutenbergPath = "src/data/generated/forever_gutenberg_sources.json";
  const prehistoryPath = "src/data/generated/forever_prehistory.json";
  const modernPath = "src/data/generated/forever_modern_context.json";
  const getSeries = (query: string) => {
    const series = inputs.frequency.series.find((row) => row.query === query);
    invariant(series, `missing series ${query}`);
    return series;
  };
  const foreverWindow = getSeries("forever").points.filter((point) => point.year >= 1700 && point.year <= 2022);
  const allOccurrences = inputs.gutenberg.sources.flatMap((source) =>
    source.occurrences.map((occurrence) => ({ sourceId: source.id, ...occurrence })),
  );
  const formRows = allOccurrences.filter((row) => row.kind === "form");
  const uniquePositions = new Set(allOccurrences.map((row) => `${row.sourceId}:${row.tokenIndex}`));
  const modernUrls = unique(inputs.modern.snippets.map((row) => row.sourceUrl));
  const remembered = inputs.modern.phrases.find((row) => row.phrase === "remembered forever");
  const checks: Array<Omit<ForeverSpotCheck, "renderedValue">> = [
    {
      id: "spot-ngram-series-count",
      rawPath: frequencyPath,
      rowSelector: "series[]",
      observedFields: ["query"],
      observedValue: inputs.frequency.series.map((series) => series.query),
      derivation: "legacy excluded Viewer-series array length; never used by either fixed Google contract",
      derivedAuditValue: inputs.frequency.series.length,
      findingIds: ["finding-derived-authority"],
      dependencyDisposition: "excluded/legacy",
    },
    {
      id: "spot-forever-323-window",
      rawPath: frequencyPath,
      rowSelector: "series[query='forever'].points[1700<=year<=2022]",
      observedFields: ["year"],
      observedValue: { first: foreverWindow[0]?.year ?? null, last: foreverWindow.at(-1)?.year ?? null },
      derivation: "legacy excluded mutable/current inclusive filtered row count; outside the fixed 2019 Viewer contract",
      derivedAuditValue: foreverWindow.length,
      findingIds: ["finding-derived-authority"],
      dependencyDisposition: "excluded/legacy",
    },
    ...["forever", "for ever", "forevermore", "forever and ever"].map((query): Omit<ForeverSpotCheck, "renderedValue"> => {
      const series = getSeries(query);
      const final = series.points.at(-1);
      return {
        id: `spot-ngram-${query.replaceAll(" ", "-")}-2022`,
        rawPath: frequencyPath,
        rowSelector: `series[query='${query}'].points[year=2022]`,
        observedFields: ["value", "frequencyPerMillion"],
        observedValue: final?.value ?? null,
        derivation: `legacy excluded current-Viewer fraction × 1,000,000; unit=${ngramUnit(ngramOrder(query))}; never used by the fixed core pair`,
        derivedAuditValue: final?.frequencyPerMillion ?? null,
        findingIds: ["finding-derived-authority"],
        dependencyDisposition: "excluded/legacy",
      };
    }),
    {
      id: "spot-gutenberg-work-count",
      rawPath: gutenbergPath,
      rowSelector: "sources[]",
      observedFields: ["id"],
      observedValue: inputs.gutenberg.sources.map((source) => source.id),
      derivation: "array length",
      derivedAuditValue: inputs.gutenberg.sources.length,
      findingIds: ["finding-gutenberg-inventory"],
    },
    {
      id: "spot-gutenberg-token-denominator",
      rawPath: gutenbergPath,
      rowSelector: "sources[].tokenCount",
      observedFields: ["tokenCount"],
      observedValue: inputs.gutenberg.sources.map((source) => source.tokenCount),
      derivation: "sum tokenCount across selected works",
      derivedAuditValue: sum(inputs.gutenberg.sources.map((source) => source.tokenCount)),
      findingIds: ["finding-gutenberg-inventory"],
    },
    {
      id: "spot-gutenberg-joined-form",
      rawPath: gutenbergPath,
      rowSelector: "sources[].occurrences[kind='form' and phrase='forever']",
      observedFields: ["kind", "phrase"],
      observedValue: "forever",
      derivation: "exact joined-form row count",
      derivedAuditValue: formRows.filter((row) => row.phrase === "forever").length,
      findingIds: ["finding-gutenberg-inventory"],
    },
    {
      id: "spot-gutenberg-spaced-form",
      rawPath: gutenbergPath,
      rowSelector: "sources[].occurrences[kind='form' and phrase='for ever']",
      observedFields: ["kind", "phrase"],
      observedValue: "for ever",
      derivation: "exact spaced-form row count",
      derivedAuditValue: formRows.filter((row) => row.phrase === "for ever").length,
      findingIds: ["finding-gutenberg-inventory"],
    },
    {
      id: "spot-gutenberg-duplicate-role-rows",
      rawPath: gutenbergPath,
      rowSelector: "sources[].occurrences[] grouped by source.id+tokenIndex",
      observedFields: ["kind", "phrase", "tokenIndex"],
      observedValue: { rows: allOccurrences.length, uniquePositions: uniquePositions.size },
      derivation: "rows - unique(sourceId, tokenIndex)",
      derivedAuditValue: allOccurrences.length - uniquePositions.size,
      findingIds: ["finding-gutenberg-duplicates"],
    },
    {
      id: "spot-prehistory-blank-quotes",
      rawPath: prehistoryPath,
      rowSelector: "records[quote='']",
      observedFields: ["quote"],
      observedValue: inputs.prehistory.records.map((record) => record.quote),
      derivation: "count blank quotation fields",
      derivedAuditValue: inputs.prehistory.records.filter((record) => record.quote.trim() === "").length,
      findingIds: ["finding-prehistory-provenance"],
    },
    {
      id: "spot-modern-query-count",
      rawPath: modernPath,
      rowSelector: "queries[]",
      observedFields: ["query"],
      observedValue: inputs.modern.queries,
      derivation: "array length",
      derivedAuditValue: inputs.modern.queries.length,
      findingIds: ["finding-modern-capture"],
    },
    {
      id: "spot-modern-unique-urls",
      rawPath: modernPath,
      rowSelector: "snippets[].sourceUrl",
      observedFields: ["sourceUrl"],
      observedValue: { rows: inputs.modern.snippets.length, uniqueUrls: modernUrls.length },
      derivation: "snippet rows - unique source URLs",
      derivedAuditValue: inputs.modern.snippets.length - modernUrls.length,
      findingIds: ["finding-modern-capture"],
    },
    {
      id: "spot-modern-remembered-forever",
      rawPath: modernPath,
      rowSelector: "phrases[phrase='remembered forever']",
      observedFields: ["count", "documentFrequency"],
      observedValue: remembered ? { count: remembered.count, documentFrequency: remembered.documentFrequency } : null,
      derivation: "compare retained snippet-row count to unique-title document frequency",
      derivedAuditValue: remembered ? remembered.count - remembered.documentFrequency : null,
      findingIds: ["finding-modern-capture"],
    },
  ];
  if (fixedGoogle.fixedViewerSeparateFacets.productionEligible) {
    const viewerExtraOutputAudit = auditFixedGoogleRelease(
      withPerturbedTransformManifest((manifest) => {
        const rows = Array.isArray(manifest.transforms) ? manifest.transforms.filter(isRecord) : [];
        const viewerTransform = rows.find((row) => row.id === "google-20200217-viewer-freeze");
        invariant(viewerTransform && Array.isArray(viewerTransform.outputs), "Viewer transform missing for closure perturbation");
        viewerTransform.outputs.push(trackedDescriptor(FIXED_GOOGLE_PATHS.forevermoreAnnual));
      }),
    );
    checks.push({
      id: "spot-fixed-viewer-release",
      rawPath: FIXED_GOOGLE_PATHS.viewerRequest,
      rowSelector: "release + params",
      observedFields: ["viewerShorthand", "persistentIdentifier", "yearEnd", "smoothing", "caseSensitive", "rawResponse.sha256", "returned[].pointCount"],
      observedValue: {
        viewerShorthand: fixedGoogle.release.viewerShorthand,
        persistentIdentifier: fixedGoogle.release.persistentIdentifier,
        yearEnd: fixedGoogle.release.expectedUpperYear,
        responseSha256: fixedGoogle.fixedViewerSeparateFacets.responseSha256,
        pointCounts: fixedGoogle.fixedViewerSeparateFacets.pointCounts,
      },
      derivation: "validate frozen Viewer request, response checksum, exact core rows, point counts, order-specific units, rights, and active capture closure",
      derivedAuditValue:
        fixedGoogle.fixedViewerSeparateFacets.productionEligible &&
        fixedGoogle.fixedViewerSeparateFacets.responseSha256 !== null &&
        fixedGoogle.fixedViewerSeparateFacets.pointCounts.forever === 520 &&
        fixedGoogle.fixedViewerSeparateFacets.pointCounts["for ever"] === 520 &&
        fixedGoogle.fixedViewerSeparateFacets.yearRange?.start === 1500 &&
        fixedGoogle.fixedViewerSeparateFacets.yearRange?.end === 2019,
      findingIds: ["finding-google-fixed-viewer-separate-facets"],
      contractIds: ["contract-google-fixed-viewer-separate-facets"],
    }, {
      id: "spot-google-viewer-closure-rejects-extra-path",
      rawPath: FIXED_GOOGLE_PATHS.transforms,
      rowSelector: "contractScopes['fixed-viewer-separate-facets'] plus exact Viewer transform inputs/outputs",
      observedFields: ["contractScopes", "transforms[].inputs", "transforms[].outputs"],
      observedValue: {
        baselineViewerEligible: true,
        extraOutputViewerEligible: viewerExtraOutputAudit.fixedViewerSeparateFacets.productionEligible,
        rawContractUnaffected: viewerExtraOutputAudit.fixedRawCommonDenominator.productionEligible ===
          fixedGoogle.fixedRawCommonDenominator.productionEligible,
      },
      derivation: "add a checksum-bound optional-form output to the Viewer transform; exact closure must reject A without changing B",
      derivedAuditValue:
        viewerExtraOutputAudit.fixedViewerSeparateFacets.productionEligible === false &&
        viewerExtraOutputAudit.fixedRawCommonDenominator.productionEligible ===
          fixedGoogle.fixedRawCommonDenominator.productionEligible,
      findingIds: ["finding-google-fixed-viewer-separate-facets"],
      contractIds: ["contract-google-fixed-viewer-separate-facets"],
    });
  }
  if (fixedGoogle.fixedRawCommonDenominator.productionEligible) {
    const rates = fixedGoogle.fixedRawCommonDenominator.annualRates;
    const joinedRates = rates.filter((row) => row.form === "forever");
    const spacedRates = rates.filter((row) => row.form === "for ever");
    const first = rates.toSorted((a, b) => a.year - b.year || a.ngramOrder - b.ngramOrder)[0]!;
    const last = rates.toSorted((a, b) => b.year - a.year || a.ngramOrder - b.ngramOrder)[0]!;
    const lowPositive = rates
      .filter((row) => row.matchCount > 0)
      .toSorted((a, b) => a.matchCount - b.matchCount || a.year - b.year)[0];
    invariant(lowPositive, "fixed raw rows unexpectedly contain no positive low-count row");
    const explicitZero = rates.find((row) => row.matchCount === 0);
    const maximum = rates.toSorted((a, b) => b.matchCount - a.matchCount || a.year - b.year)[0]!;
    const sparse = fixedGoogle.fixedRawCommonDenominator.annualCoverage.find(
      (row) => row.state === "absent_or_suppressed",
    );
    invariant(sparse, "fixed raw rows unexpectedly contain no sparse form-year for a missingness spot check");
    const manualRate = roundedMetric((lowPositive.matchCount / lowPositive.annualWordTokens) * 1_000_000);
    const independentFixedGoogle = auditFixedGoogleRelease(inputs);
    const nonCoreScopesRemovedFixedGoogle = auditFixedGoogleRelease(
      withPerturbedCoreFamily((registry) => {
        delete registry.optionalRelatedForms;
        delete registry.outOfScope;
      }),
    );
    const coreChangedFixedGoogle = auditFixedGoogleRelease(
      withPerturbedCoreFamily((registry) => {
        const coreForms = Array.isArray(registry.coreForms)
          ? registry.coreForms.filter(isRecord)
          : [];
        const joined = coreForms.find((row) => row.exactForm === "forever");
        invariant(joined, "joined core form missing for perturbation check");
        joined.exactForm = "forever-corrupted";
      }),
    );
    const rawExtraOutputAudit = auditFixedGoogleRelease(
      withPerturbedTransformManifest((manifest) => {
        const rows = Array.isArray(manifest.transforms) ? manifest.transforms.filter(isRecord) : [];
        const coreTransform = rows.find(
          (row) => row.id === "google-20200217-core-exact-form-extraction",
        );
        invariant(coreTransform && Array.isArray(coreTransform.outputs), "core extraction transform missing for closure perturbation");
        coreTransform.outputs.push(trackedDescriptor(FIXED_GOOGLE_PATHS.forevermoreSource));
      }),
    );
    const optionalTransformDuplicateAudit = auditFixedGoogleRelease(
      withPerturbedTransformManifest((manifest) => {
        const rows = Array.isArray(manifest.transforms) ? manifest.transforms : null;
        invariant(rows, "transform rows missing for optional-scope perturbation");
        const optionalTransform = rows.find(
          (row) => isRecord(row) && row.id === "google-20200217-optional-exact-form-extraction",
        );
        invariant(optionalTransform, "optional transform missing for optional-scope perturbation");
        rows.push(JSON.parse(JSON.stringify(optionalTransform)) as unknown);
      }),
    );
    const invalidNonCoreRightsAudit = auditFixedGoogleRelease(
      withPerturbedRightsManifest((manifest) => {
        const overrides = isRecord(manifest.itemOverrides) ? manifest.itemOverrides : {};
        manifest.itemOverrides = overrides;
        overrides[FIXED_GOOGLE_PATHS.forevermoreAnnual] = {};
      }),
    );
    const derivationBytesA = jsonText({
      annualRates: fixedGoogle.fixedRawCommonDenominator.annualRates,
      annualCoverage: fixedGoogle.fixedRawCommonDenominator.annualCoverage,
      pairRows: fixedGoogle.fixedRawCommonDenominator.pairRows,
    });
    const derivationBytesB = jsonText({
      annualRates: independentFixedGoogle.fixedRawCommonDenominator.annualRates,
      annualCoverage: independentFixedGoogle.fixedRawCommonDenominator.annualCoverage,
      pairRows: independentFixedGoogle.fixedRawCommonDenominator.pairRows,
    });
    const commonFinding = ["finding-google-raw-common-denominator"];
    const commonContract = ["contract-google-fixed-raw-common-denominator"];
    const lineageFinding = findings.findings.find((finding) => finding.id === commonFinding[0]);
    const lineageContract = contracts.contracts.find((contract) => contract.id === commonContract[0]);
    const lineageValid = Boolean(
      lineageFinding &&
      lineageContract &&
      [lowPositive.annualPath, lowPositive.sourceWidePath].every((pathname) =>
        [...lineageFinding.rawFields, ...lineageFinding.sourceRowsFiles].some(
          (selector) => selector.path === pathname,
        )) &&
      lineageContract.findingIds.includes(lineageFinding.id) &&
      [lowPositive.annualPath, lowPositive.sourceWidePath].every(
        (pathname) =>
          lineageContract.rawFilesAndFields.some((selector) => selector.path === pathname) &&
          lineageContract.activeDependencyClosure.inputPaths.includes(pathname),
      ),
    );
    checks.push(
      {
        id: "spot-google-noncore-scopes-nonblocking",
        rawPath: FIXED_GOOGLE_PATHS.family,
        rowSelector: "coreForms[] compared with an in-memory optionalRelatedForms removal and a core-form mutation",
        observedFields: ["coreForms", "optionalRelatedForms", "outOfScope"],
        observedValue: {
          baselineEligible: fixedGoogle.fixedRawCommonDenominator.productionEligible,
          optionalAndOutOfScopeRemovedEligible:
            nonCoreScopesRemovedFixedGoogle.fixedRawCommonDenominator.productionEligible,
          coreChangedEligible: coreChangedFixedGoogle.fixedRawCommonDenominator.productionEligible,
          invalidOptionalRightsRawEligible:
            invalidNonCoreRightsAudit.fixedRawCommonDenominator.productionEligible,
          invalidOptionalRightsViewerEligible:
            invalidNonCoreRightsAudit.fixedViewerSeparateFacets.productionEligible,
        },
        derivation: "rebind the perturbed registry checksum, prove removal of optional-related and out-of-scope metadata leaves B rates byte-equivalent, and prove a core-form mutation makes B ineligible",
        derivedAuditValue:
          nonCoreScopesRemovedFixedGoogle.fixedRawCommonDenominator.productionEligible === true &&
          sha256(jsonText(nonCoreScopesRemovedFixedGoogle.fixedRawCommonDenominator.annualRates)) ===
            sha256(jsonText(fixedGoogle.fixedRawCommonDenominator.annualRates)) &&
          coreChangedFixedGoogle.fixedRawCommonDenominator.productionEligible === false &&
          invalidNonCoreRightsAudit.fixedRawCommonDenominator.productionEligible === true &&
          invalidNonCoreRightsAudit.fixedViewerSeparateFacets.productionEligible ===
            fixedGoogle.fixedViewerSeparateFacets.productionEligible,
        findingIds: commonFinding,
        contractIds: commonContract,
      },
      {
        id: "spot-google-raw-closure-rejects-extra-path",
        rawPath: FIXED_GOOGLE_PATHS.transforms,
        rowSelector: "contractScopes['fixed-raw-common-denominator'] plus exact scoped transform inputs/outputs",
        observedFields: ["contractScopes", "transforms[].id", "transforms[].inputs", "transforms[].outputs"],
        observedValue: {
          extraCoreOutputEligible: rawExtraOutputAudit.fixedRawCommonDenominator.productionEligible,
          viewerUnaffected: rawExtraOutputAudit.fixedViewerSeparateFacets.productionEligible ===
            fixedGoogle.fixedViewerSeparateFacets.productionEligible,
          duplicatedOptionalTransformRawEligible:
            optionalTransformDuplicateAudit.fixedRawCommonDenominator.productionEligible,
          duplicatedOptionalTransformViewerEligible:
            optionalTransformDuplicateAudit.fixedViewerSeparateFacets.productionEligible,
        },
        derivation: "an extra optional output inside a core transform must reject B; a duplicate optional-scope transform outside both A/B scopes must change neither contract",
        derivedAuditValue:
          rawExtraOutputAudit.fixedRawCommonDenominator.productionEligible === false &&
          rawExtraOutputAudit.fixedViewerSeparateFacets.productionEligible ===
            fixedGoogle.fixedViewerSeparateFacets.productionEligible &&
          optionalTransformDuplicateAudit.fixedRawCommonDenominator.productionEligible === true &&
          optionalTransformDuplicateAudit.fixedViewerSeparateFacets.productionEligible ===
            fixedGoogle.fixedViewerSeparateFacets.productionEligible,
        findingIds: commonFinding,
        contractIds: commonContract,
      },
      {
        id: "spot-google-exact-shard-identity",
        rawPath: FIXED_GOOGLE_PATHS.acquisition,
        rowSelector: "objects[id in {unigram-shard,bigram-shard,annual-token-totals}]",
        observedFields: ["url", "contentLength", "etag", "xGoogHash", "local.sha256", "local.md5Hex", "local.md5Base64", "local.verifiedAgainstOfficialMd5"],
        observedValue: fixedGoogle.fixedRawCommonDenominator.validation.acquisitionIdentity,
        derivation: "validate exact fixed object URLs, bytes, official hashes, and local digests",
        derivedAuditValue: fixedGoogle.fixedRawCommonDenominator.validation.acquisitionIdentity,
        findingIds: commonFinding,
        contractIds: commonContract,
      },
      {
        id: "spot-google-exact-form-equality",
        rawPath: first.sourceWidePath,
        rowSelector: "wide record field[0]",
        observedFields: ["ngram"],
        observedValue: first.form,
        derivation: "official v3 wide source record field[0] === preregistered exact form",
        derivedAuditValue:
          first.sourceFieldIndex > 0 &&
          (first.ngramOrder === 1 ? first.form === "forever" : first.form === "for ever"),
        findingIds: commonFinding,
        contractIds: commonContract,
      },
      {
        id: "spot-google-ngram-orders",
        rawPath: FIXED_GOOGLE_PATHS.family,
        rowSelector: "coreForms[]",
        observedFields: ["exactForm", "ngramOrder", "role"],
        observedValue: { forever: 1, "for ever": 2 },
        derivation: "validate core joined/spaced form orders",
        derivedAuditValue:
          joinedRates.every((row) => row.ngramOrder === 1) &&
          spacedRates.every((row) => row.ngramOrder === 2),
        findingIds: commonFinding,
        contractIds: commonContract,
      },
      {
        id: "spot-google-earliest-retained-year",
        rawPath: first.annualPath,
        rowSelector: `annual line ${first.annualLine}; source wide field ${first.sourceFieldIndex}`,
        observedFields: ["ngram", "year", "match_count", "wide_field_index"],
        observedValue: { form: first.form, year: first.year, matchCount: first.matchCount, sourceWidePath: first.sourceWidePath, sourceFieldIndex: first.sourceFieldIndex },
        derivation: "min(year) across deterministic annual rows, retaining exact wide-field lineage",
        derivedAuditValue: first.year,
        findingIds: commonFinding,
        contractIds: commonContract,
      },
      {
        id: "spot-google-latest-retained-year",
        rawPath: last.annualPath,
        rowSelector: `annual line ${last.annualLine}; source wide field ${last.sourceFieldIndex}`,
        observedFields: ["ngram", "year", "match_count", "wide_field_index"],
        observedValue: { form: last.form, year: last.year, matchCount: last.matchCount, sourceWidePath: last.sourceWidePath, sourceFieldIndex: last.sourceFieldIndex },
        derivation: "max(year) across deterministic annual rows, retaining exact wide-field lineage",
        derivedAuditValue: last.year,
        findingIds: commonFinding,
        contractIds: commonContract,
      },
      {
        id: "spot-google-sparse-year",
        rawPath: sparse.form === "forever" ? FIXED_GOOGLE_PATHS.foreverAnnual : FIXED_GOOGLE_PATHS.forEverAnnual,
        rowSelector: `exact form ${sparse.form}, year ${sparse.year}: no derived annual row from the official wide record`,
        observedFields: ["ngram", "year"],
        observedValue: null,
        derivation: "sparse absence maps to absent_or_suppressed; never synthesize zero",
        derivedAuditValue: "absent_or_suppressed",
        findingIds: commonFinding,
        contractIds: commonContract,
      },
      {
        id: "spot-google-positive-low-count",
        rawPath: lowPositive.annualPath,
        rowSelector: `annual line ${lowPositive.annualLine}; source wide field ${lowPositive.sourceFieldIndex}`,
        observedFields: ["ngram", "year", "match_count", "volume_count", "wide_field_index"],
        observedValue: { form: lowPositive.form, year: lowPositive.year, matchCount: lowPositive.matchCount, volumeCount: lowPositive.volumeCount, sourceWidePath: lowPositive.sourceWidePath, sourceFieldIndex: lowPositive.sourceFieldIndex },
        derivation: "minimum strictly positive retained match_count with wide-field lineage",
        derivedAuditValue: lowPositive.matchCount,
        findingIds: commonFinding,
        contractIds: commonContract,
      },
      {
        id: "spot-google-maximum-raw-match",
        rawPath: maximum.annualPath,
        rowSelector: `annual line ${maximum.annualLine}; source wide field ${maximum.sourceFieldIndex}`,
        observedFields: ["ngram", "year", "match_count"],
        observedValue: { form: maximum.form, year: maximum.year, matchCount: maximum.matchCount },
        derivation: "maximum retained raw match_count",
        derivedAuditValue: { year: maximum.year, value: maximum.matchCount },
        findingIds: commonFinding,
        contractIds: commonContract,
      },
      {
        id: "spot-google-annual-total-lookup",
        rawPath: FIXED_GOOGLE_PATHS.totalCounts,
        rowSelector: `year=${lowPositive.year}`,
        observedFields: ["year", "match_count (annual 1-gram word tokens)"],
        observedValue: lowPositive.annualWordTokens,
        derivation: "lookup same-release annual 1-gram token total by exact year",
        derivedAuditValue: lowPositive.annualWordTokens,
        findingIds: commonFinding,
        contractIds: commonContract,
      },
      {
        id: "spot-google-manual-per-million",
        rawPath: lowPositive.annualPath,
        rowSelector: `annual line ${lowPositive.annualLine} joined to totalcounts year ${lowPositive.year}`,
        observedFields: ["match_count", "annual_word_tokens"],
        observedValue: { matchCount: lowPositive.matchCount, annualWordTokens: lowPositive.annualWordTokens },
        derivation: "match_count / annual_word_tokens × 1,000,000",
        derivedAuditValue: manualRate,
        findingIds: commonFinding,
        contractIds: commonContract,
      },
      {
        id: "spot-google-joined-spaced-separation",
        rawPath: FIXED_GOOGLE_PATHS.family,
        rowSelector: "core forms",
        observedFields: ["exactForm", "role", "rawFile"],
        observedValue: { joinedRows: joinedRates.length, spacedRows: spacedRates.length },
        derivation: "count distinct exact-form raw row sets",
        derivedAuditValue: joinedRates.every((row) => row.form === "forever") && spacedRates.every((row) => row.form === "for ever"),
        findingIds: commonFinding,
        contractIds: commonContract,
      },
      {
        id: "spot-google-generated-rate-independent",
        rawPath: lowPositive.annualPath,
        rowSelector: `annual line ${lowPositive.annualLine}; source wide field ${lowPositive.sourceFieldIndex}`,
        observedFields: ["match_count", "year"],
        observedValue: lowPositive.appearancesPerMillionWordTokens,
        derivation: "independent manual formula must equal generated typed rate",
        derivedAuditValue: lowPositive.appearancesPerMillionWordTokens === manualRate,
        findingIds: commonFinding,
        contractIds: commonContract,
      },
      {
        id: "spot-google-byte-stable-derivation",
        rawPath: FIXED_GOOGLE_PATHS.checksums,
        rowSelector: "frozen input descriptors",
        observedFields: ["path", "bytes", "sha256"],
        observedValue: { first: sha256(derivationBytesA), second: sha256(derivationBytesB) },
        derivation: "independently parse and derive twice from frozen raw rows/totals, then compare serialized SHA-256",
        derivedAuditValue: sha256(derivationBytesA) === sha256(derivationBytesB),
        findingIds: commonFinding,
        contractIds: commonContract,
      },
      {
        id: "spot-google-raw-finding-contract-lineage",
        rawPath: lowPositive.annualPath,
        rowSelector: `annual line ${lowPositive.annualLine}; official source ${lowPositive.sourceWidePath} field ${lowPositive.sourceFieldIndex}`,
        observedFields: ["ngram", "year", "match_count", "wide_field_index"],
        observedValue: { annualPath: lowPositive.annualPath, annualLine: lowPositive.annualLine, sourceWidePath: lowPositive.sourceWidePath, sourceFieldIndex: lowPositive.sourceFieldIndex },
        derivation: "official wide field → deterministic annual row → finding-google-raw-common-denominator → contract-google-fixed-raw-common-denominator",
        derivedAuditValue: lineageValid,
        findingIds: commonFinding,
        contractIds: commonContract,
      },
    );
    if (explicitZero) {
      checks.push({
        id: "spot-google-explicit-zero",
        rawPath: explicitZero.annualPath,
        rowSelector: `annual line ${explicitZero.annualLine}; source wide field ${explicitZero.sourceFieldIndex}`,
        observedFields: ["ngram", "year", "match_count", "wide_field_index"],
        observedValue: {
          form: explicitZero.form,
          year: explicitZero.year,
          matchCount: explicitZero.matchCount,
          sourceWidePath: explicitZero.sourceWidePath,
          sourceFieldIndex: explicitZero.sourceFieldIndex,
        },
        derivation: "an explicit official wide tuple with match_count=0 maps to observed_zero",
        derivedAuditValue: explicitZero.state === "observed_zero",
        findingIds: commonFinding,
        contractIds: commonContract,
      });
    }
  }
  invariant(checks.length >= 10, "at least ten spot checks are required");
  return checks.map((check) => ({ ...check, renderedValue: renderedAuditValue(check.derivedAuditValue) }));
}

function buildUntraceableInputs(): ForeverUntraceableInput[] {
  const legacyInputs: Array<Omit<ForeverUntraceableInput, "dependencyDisposition">> = [
    {
      id: "untraceable-legacy-placeholder-registry",
      path: "src/data/forever.ts",
      locations: ["15-126", "145-293", "343-624"],
      kind: "placeholder sources, raw counts, token totals, frequencies, semantic scores, associations, network, and evidence rows",
      reason: "Values exist only as source literals tied to planned/not-selected corpora.",
      requiredDisposition: "exclude-from-research-results",
    },
    {
      id: "untraceable-derived-score-and-flow-arrays",
      path: "scripts/build_forever_dataset.ts",
      locations: ["475-478", "539-620", "675-719", "987-1095", "1777-1794"],
      kind: "misnamed score, heuristic weighting, mixed-denominator flows, manual geometry, and false comparable flag",
      reason: "The transforms lack valid denominators or finding contracts and include manual positions.",
      requiredDisposition: "exclude-from-research-results",
    },
    {
      id: "untraceable-institutional-doubt",
      path: "src/components/ForeverInstitutionalDoubt.tsx",
      locations: ["15-129", "469-555"],
      kind: "hard-coded evidence cards, branch angles/strengths, historical band frequency/search scores",
      reason: "Research-looking values exist only in JSX/geometry literals.",
      requiredDisposition: "rebuild-from-registered-finding",
    },
    {
      id: "untraceable-variant-drift",
      path: "src/components/VariantDriftField.tsx",
      locations: ["30-46", "71-126"],
      kind: "manual years, coordinates, radii, spreads, heights, and orbit levels",
      reason: "Coordinates and semantic anchors are not derived from registered source fields.",
      requiredDisposition: "rebuild-from-registered-finding",
    },
    {
      id: "untraceable-context-globe",
      path: "src/components/ContextSignalField.tsx",
      locations: ["56-70", "105-115"],
      kind: "fake latitude/longitude and additive incompatible support counts",
      reason: "Geography and combined support units are editorial metaphors, not observations.",
      requiredDisposition: "rebuild-from-registered-finding",
    },
    {
      id: "untraceable-mobile-attestation-rail",
      path: "src/components/ForeverAttestationHinge.tsx",
      locations: ["114-133"],
      kind: "rail joining conflicting dates",
      reason: "The connection implies a relationship/interval not present in source records.",
      requiredDisposition: "rebuild-from-registered-finding",
    },
    {
      id: "untraceable-mobile-recurrence",
      path: "src/components/ForeverRecurrenceField.tsx",
      locations: ["113-273"],
      kind: "integer endpoint plots, 1930-2024 empty field, and modern stem/notch rake",
      reason: "One-number coordinates and decorative absence/source shapes are not contract-backed mappings.",
      requiredDisposition: "rebuild-from-registered-finding",
    },
    {
      id: "untraceable-frequency-shared-scale",
      path: "src/components/ForeverFormCurrent.tsx",
      locations: ["102-106", "138-141", "175-215"],
      kind: "shared-denominator copy, shared axis, generic per-million unit, independent shape scales",
      reason: "Joined unigram and spaced bigram Viewer values are presented as directly comparable.",
      requiredDisposition: "rebuild-from-registered-finding",
    },
    {
      id: "untraceable-frequency-generic-units",
      path: "src/components/MobileFrequencyStory.tsx",
      locations: ["97-109", "128-142"],
      kind: "generic per-million labels and independent series scales",
      reason: "N-gram-order denominator is not locally visible and cross-form shapes invite invalid comparison.",
      requiredDisposition: "rebuild-from-registered-finding",
    },
  ];
  return legacyInputs.map((input) => ({
    ...input,
    dependencyDisposition: "excluded/legacy",
  }));
}

function buildAssertions(
  inputs: InputBundle,
  availability: ForeverRawAvailabilityAudit,
  manifest: ForeverRawDataManifest,
  findings: ForeverFindingsRegistry,
  contracts: ForeverFigureContractRegistry,
  spotChecks: ForeverSpotCheck[],
  dataGate: ReturnType<typeof deriveDataGate>,
  fixedGoogle: ForeverFixedGoogleReleaseAudit,
): ForeverValidationAssertion[] {
  const manifestPaths = manifest.entries.map((entry) => entry.path);
  const denominatorFinding = findings.findings.find((finding) => finding.id === "finding-google-raw-common-denominator");
  const windowFinding = findings.findings.find((finding) => finding.id === "finding-google-fixed-viewer-separate-facets");
  invariant(denominatorFinding, "denominator finding missing");
  invariant(windowFinding, "window finding missing");
  const manifestComplete =
    manifest.entries.length === manifest.expectedInputCount &&
    new Set(manifestPaths).size === manifest.expectedInputCount &&
    manifest.entries.every((entry) => /^[a-f0-9]{64}$/.test(entry.sha256));
  const queryKeys = new Set(inputs.frequency.series.map((series) => series.query));
  const generatedFormKeys = new Set(
    inputs.gutenberg.sources.flatMap((source) =>
      source.occurrences.filter((occurrence) => occurrence.kind === "form").map((occurrence) => occurrence.phrase),
    ),
  );
  const joinedSpacedSeparated =
    queryKeys.has("forever") && queryKeys.has("for ever") && generatedFormKeys.has("forever") && generatedFormKeys.has("for ever");
  const denominatorStateValid = availability.commonAnnualWordTokenDenominatorAvailable
    ? denominatorFinding.result.values.sharedScaleAllowed === true
    : ngramOrder("forever") !== ngramOrder("for ever") && denominatorFinding.result.values.sharedScaleAllowed === false;
  const zeroMissingStateValid = denominatorFinding.missingnessPolicy.includes("absent_or_suppressed");
  const viewerStateValid =
    windowFinding.productionEligible === fixedGoogle.fixedViewerSeparateFacets.productionEligible &&
    (fixedGoogle.fixedViewerSeparateFacets.productionEligible
      ? windowFinding.result.values.yearRange !== null
      : windowFinding.blockedByGapIds.includes("gap-google-raw-response-release"));
  const contractStateValid =
    contracts.contracts.find((contract) => contract.id === "contract-google-fixed-viewer-separate-facets")?.productionEligible ===
      fixedGoogle.fixedViewerSeparateFacets.productionEligible &&
    contracts.contracts.find((contract) => contract.id === "contract-google-fixed-raw-common-denominator")?.productionEligible ===
      fixedGoogle.fixedRawCommonDenominator.productionEligible &&
    contracts.pageImplementationAuthorized === false;
  const gateValid =
    dataGate === deriveDataGate(
      availability,
      buildUntraceableInputs().filter((input) => input.dependencyDisposition !== "excluded/legacy").length,
      contracts.productionEligibleCount,
    );
  const spotChecksValid =
    spotChecks.length >= 10 &&
    spotChecks.every((spotCheck) => spotCheck.renderedValue === renderedAuditValue(spotCheck.derivedAuditValue));
  const optionalScopePerturbationSpot = spotChecks.find(
    (spotCheck) => spotCheck.id === "spot-google-noncore-scopes-nonblocking",
  );
  const optionalScopeNonBlocking =
    !fixedGoogle.fixedRawCommonDenominator.productionEligible ||
    optionalScopePerturbationSpot?.derivedAuditValue === true;
  const exactClosurePerturbationsValid =
    (!fixedGoogle.fixedViewerSeparateFacets.productionEligible ||
      spotChecks.find((spotCheck) => spotCheck.id === "spot-google-viewer-closure-rejects-extra-path")
        ?.derivedAuditValue === true) &&
    (!fixedGoogle.fixedRawCommonDenominator.productionEligible ||
      spotChecks.find((spotCheck) => spotCheck.id === "spot-google-raw-closure-rejects-extra-path")
        ?.derivedAuditValue === true);

  return [
    {
      id: "assert-input-manifest-complete",
      passed: manifestComplete,
      assertion: "Every registered audit input appears exactly once with SHA-256.",
      observed: {
        expected: manifest.expectedInputCount,
        actual: manifest.entries.length,
        uniquePaths: new Set(manifestPaths).size,
        digestLengthOK: manifest.entries.every((entry) => /^[a-f0-9]{64}$/.test(entry.sha256)),
      },
    },
    {
      id: "assert-joined-spaced-separated",
      passed: joinedSpacedSeparated,
      assertion: "Joined and spaced forms remain distinct query/form keys in every audited count used by a finding.",
      observed: { joined: "forever", spaced: "for ever", distinct: joinedSpacedSeparated },
    },
    {
      id: "assert-denominator-scale-rule",
      passed: denominatorStateValid,
      assertion: "The joined/spaced shared-scale flag is enabled only by the independently validated raw common-denominator predicate.",
      observed: denominatorFinding.result.values,
    },
    {
      id: "assert-missing-not-zero",
      passed: zeroMissingStateValid,
      assertion: "Sparse-row absence remains absent_or_suppressed and is never reclassified as observed_zero without official inclusion evidence.",
      observed: {
        sparseAbsenceState: "absent_or_suppressed",
        zeroState: "observed_zero_requires-explicit-evidence",
        typedMissingStateAvailable:
          fixedGoogle.fixedRawCommonDenominator.validation.missingnessTyped === true ||
          availability.coverageManifestPresent,
        coverageManifestPresent: manifest.coverageManifestPresent,
      },
    },
    {
      id: "assert-fixed-viewer-contract",
      passed: viewerStateValid,
      assertion: "The fixed eng_2019 Viewer contract eligibility follows its checksum-bound 1500–2019 request/response predicate.",
      observed: windowFinding.result.values,
    },
    {
      id: "assert-per-figure-gates-independent",
      passed: contractStateValid,
      assertion: "Viewer and raw common-denominator contracts are evaluated independently while pageImplementationAuthorized remains false.",
      observed: {
        viewerEligible: fixedGoogle.fixedViewerSeparateFacets.productionEligible,
        commonDenominatorEligible: fixedGoogle.fixedRawCommonDenominator.productionEligible,
        pageImplementationAuthorized: contracts.pageImplementationAuthorized,
      },
    },
    {
      id: "assert-noncore-scopes-nonblocking",
      passed: optionalScopeNonBlocking,
      assertion: "Removing optional-related and out-of-scope metadata leaves the raw core-pair result byte-equivalent, while mutating a core form makes the raw contract ineligible.",
      observed: {
        optionalRelatedForm: "forevermore",
        outOfScopePhrase: "forever and ever",
        status: fixedGoogle.fixedRawCommonDenominator.productionEligible ? "tested" : "not_available",
        perturbationSpotPassed: optionalScopeNonBlocking,
      },
    },
    {
      id: "assert-active-dependency-closures-exact",
      passed: exactClosurePerturbationsValid,
      assertion: "Each Google contract rejects an extra optional path inside its scoped transform while changes confined to the other or optional scope do not alter its eligibility.",
      observed: {
        viewerContractEligible: fixedGoogle.fixedViewerSeparateFacets.productionEligible,
        rawContractEligible: fixedGoogle.fixedRawCommonDenominator.productionEligible,
        perturbationsPassed: exactClosurePerturbationsValid,
      },
    },
    {
      id: "assert-page-gate-independent",
      passed: gateValid,
      assertion: "The page gate is derived independently; a validated figure contract may be production eligible while page implementation remains unauthorized.",
      observed: {
        dataGate,
        productionEligibleCount: contracts.contracts.filter((contract) => contract.productionEligible).length,
        pageImplementationAuthorized: PAGE_IMPLEMENTATION_AUTHORIZED,
      },
    },
    {
      id: "assert-spot-check-minimum",
      passed: spotChecksValid,
      assertion: "At least ten raw-selector-to-derived-to-rendered-value spot checks are embedded.",
      observed: { spotCheckCount: spotChecks.length },
    },
  ];
}

function validateBuiltArtifact(artifact: ForeverAnalysisArtifact) {
  const manifestPaths = artifact.rawDataManifest.entries.map((entry) => entry.path);
  invariant(
    MISSINGNESS_STATES.every((state) => artifact.missingnessTaxonomy.states.includes(state)),
    "missingness taxonomy does not include every required state",
  );
  const derivedGate = deriveDataGate(
    artifact.rawAvailabilityAudit,
    artifact.untraceableResearchInputs.filter((input) => input.dependencyDisposition !== "excluded/legacy").length,
    artifact.figureContractRegistry.productionEligibleCount,
  );
  invariant(artifact.dataGate.status === derivedGate, "data gate does not match retained-input availability");
  invariant(
    artifact.dataGate.productionPanelsAllowed === PAGE_IMPLEMENTATION_AUTHORIZED &&
      artifact.dataGate.pageImplementationAuthorized === PAGE_IMPLEMENTATION_AUTHORIZED &&
      artifact.figureContractRegistry.pageImplementationAuthorized === PAGE_IMPLEMENTATION_AUTHORIZED,
    "page implementation authorization must remain independent and false in this acquisition round",
  );
  const viewerContract = artifact.figureContractRegistry.contracts.find(
    (contract) => contract.id === "contract-google-fixed-viewer-separate-facets",
  );
  const commonContract = artifact.figureContractRegistry.contracts.find(
    (contract) => contract.id === "contract-google-fixed-raw-common-denominator",
  );
  invariant(viewerContract && commonContract, "fixed Google A/B contracts are missing");
  invariant(
    viewerContract.productionEligible === artifact.fixedGoogleReleaseAudit.fixedViewerSeparateFacets.productionEligible &&
      commonContract.productionEligible === artifact.fixedGoogleReleaseAudit.fixedRawCommonDenominator.productionEligible,
    "fixed Google contract eligibility drifted from its independent validator",
  );
  invariant(
    artifact.fixedGoogleReleaseAudit.fixedRawCommonDenominator.productionEligible
      ? artifact.fixedGoogleReleaseAudit.outcome === "GOOGLE_COMMON_DENOMINATOR_CONTRACT_READY"
      : artifact.fixedGoogleReleaseAudit.fixedViewerSeparateFacets.productionEligible
        ? artifact.fixedGoogleReleaseAudit.outcome === "PARTIAL_GOOGLE_VIEWER_CONTRACT_READY"
        : artifact.fixedGoogleReleaseAudit.outcome.startsWith("STOP_GOOGLE_"),
    "Google acquisition outcome does not match A/B contract eligibility",
  );
  invariant(
    artifact.fixedGoogleReleaseAudit.coreFamily.length === 2 &&
      artifact.fixedGoogleReleaseAudit.coreFamily.some((row) => row.form === "forever" && row.ngramOrder === 1) &&
      artifact.fixedGoogleReleaseAudit.coreFamily.some((row) => row.form === "for ever" && row.ngramOrder === 2) &&
      artifact.fixedGoogleReleaseAudit.optionalRelatedForms.every((row) => row.blocksCorePairEligibility === false) &&
      artifact.fixedGoogleReleaseAudit.outOfScopeForms.every((row) => row.blocksCorePairEligibility === false) &&
      artifact.fixedGoogleReleaseAudit.scopeDiagnostics.nonGatingForCorePair === true,
    "the fixed core family was widened by optional or out-of-scope forms",
  );
  if (artifact.fixedGoogleReleaseAudit.fixedViewerSeparateFacets.productionEligible) {
    const viewer = artifact.fixedGoogleReleaseAudit.fixedViewerSeparateFacets;
    invariant(
      artifact.spotChecks.find((spotCheck) => spotCheck.id === "spot-google-viewer-closure-rejects-extra-path")
        ?.derivedAuditValue === true,
      "the Viewer contract accepted an extra path outside its exact active closure",
    );
    invariant(
      viewer.yearRange?.end === 2019 &&
        artifact.denominatorAudit.series.every(
          (row) => row.startYear === 1500 && row.endYear === 2019 && row.pointCount === 520,
        ),
      "fixed Viewer contract mixed in a mutable/current release year",
    );
    invariant(
      viewer.observations.length === 1040 &&
        viewer.rawCompatibleSanity.nonGatingForViewerContract === true &&
        viewer.rawCompatibleSanity.nonGatingForRawContract === true &&
        viewer.observations.every(
          (row) =>
            row.year === 1500 + row.timeseriesIndex &&
            row.perMillionOrderNgrams === roundedMetric(row.viewerFraction * 1_000_000) &&
            row.state === (row.viewerFraction > 0 ? "observed_positive" : "absent_or_suppressed") &&
            (row.form === "forever"
              ? row.ngramOrder === 1 && row.unit === "per million unigrams"
              : row.ngramOrder === 2 && row.unit === "per million bigrams"),
        ),
      "fixed Viewer typed facet observations drifted from the frozen order-specific response",
    );
    const sanity = viewer.rawCompatibleSanity;
    if (artifact.fixedGoogleReleaseAudit.fixedRawCommonDenominator.productionEligible) {
      invariant(
        sanity.status !== "not_available" &&
          sanity.passed === (sanity.status === "passed") &&
          sanity.comparedYears > 0 &&
          sanity.maximumAbsoluteDifferencePpm !== null &&
          sanity.sample !== null,
        "the non-gating Viewer/raw sanity diagnostic was not computed from both eligible inputs",
      );
    } else {
      invariant(
        sanity.status === "not_available" &&
          sanity.passed === null &&
          sanity.comparedYears === 0 &&
          sanity.maximumAbsoluteDifferencePpm === null &&
          sanity.sample === null,
        "the Viewer-only contract exposed a raw sanity result without an eligible raw contract",
      );
    }
  }
  if (artifact.fixedGoogleReleaseAudit.fixedRawCommonDenominator.productionEligible) {
    const common = artifact.fixedGoogleReleaseAudit.fixedRawCommonDenominator;
    invariant(common.annualRates.length > 0, "eligible common-denominator contract has no annual rates");
    invariant(
      artifact.spotChecks.find((spotCheck) => spotCheck.id === "spot-google-noncore-scopes-nonblocking")
        ?.derivedAuditValue === true,
      "optional/out-of-scope metadata leaked into the core-pair eligibility closure",
    );
    invariant(
      artifact.spotChecks.find((spotCheck) => spotCheck.id === "spot-google-raw-closure-rejects-extra-path")
        ?.derivedAuditValue === true,
      "the raw common-denominator contract accepted an extra path outside its exact active closure",
    );
    const expectedCoverageRows = common.yearRange
      ? (common.yearRange.end - common.yearRange.start + 1) * 2
      : 0;
    invariant(
      common.annualCoverage.length === expectedCoverageRows,
      "eligible common-denominator contract lacks complete typed coverage rows for its actual release-derived range",
    );
    invariant(
      common.annualCoverage
        .filter((row) => row.state === "observed_zero")
        .every((coverageRow) =>
          common.annualRates.some(
            (rateRow) =>
              rateRow.form === coverageRow.form &&
              rateRow.year === coverageRow.year &&
              rateRow.matchCount === 0 &&
              rateRow.sourceFieldIndex > 0,
          )),
      "an observed_zero coverage state lacks an explicit zero-bearing official wide-field lineage",
    );
    invariant(
      common.annualRates.every(
        (row) =>
          row.state === (row.matchCount === 0 ? "observed_zero" : "observed_positive") &&
          row.matchCount >= 0 &&
          row.annualWordTokens > 0 &&
          manifestPaths.includes(row.sourceWidePath) &&
          manifestPaths.includes(row.annualPath) &&
          row.sourceFieldIndex > 0 &&
          row.annualLine >= 2 &&
          row.appearancesPerMillionWordTokens ===
            roundedMetric((row.matchCount / row.annualWordTokens) * 1_000_000),
      ),
      "a generated common-denominator rate does not recompute from its raw lineage",
    );
    invariant(
      commonContract.activeDependencyClosure.closureValidated &&
        commonContract.rightsResolution.resolved &&
        artifact.dataGate.pageImplementationAuthorized === false,
      "analytic eligibility leaked into page implementation authorization",
    );
  }
  invariant(
    artifact.denominatorAudit.rawMatchCountsAvailable === artifact.rawAvailabilityAudit.rawMatchCountsAvailable,
    "raw match-count availability drifted from structured input scan",
  );
  invariant(
    artifact.denominatorAudit.annualWordTokenTotalsAvailable === artifact.rawAvailabilityAudit.annualWordTokenTotalsAvailable,
    "annual word-token availability drifted from structured input scan",
  );
  invariant(
    artifact.denominatorAudit.commonAnnualWordTokenDenominatorAvailable === artifact.rawAvailabilityAudit.commonAnnualWordTokenDenominatorAvailable,
    "common denominator availability drifted from structured input scan",
  );
  invariant(
    artifact.denominatorAudit.sharedJoinedSpacedScaleAllowed === artifact.rawAvailabilityAudit.commonAnnualWordTokenDenominatorAvailable,
    "joined/spaced scale flag does not match common-denominator evidence",
  );
  invariant(artifact.rawDataManifest.entries.length === artifact.rawDataManifest.expectedInputCount, "manifest entry count drifted");
  invariant(artifact.manifestSummary.registeredInputCount === artifact.rawDataManifest.expectedInputCount, "manifest summary input count drifted");
  invariant(
    artifact.manifestSummary.termFormRegistryFiles +
      artifact.manifestSummary.generatedCaptureFiles +
      artifact.manifestSummary.derivedArtifactFiles +
      artifact.manifestSummary.transformScriptFiles +
      artifact.manifestSummary.renderConsumerFiles +
      artifact.manifestSummary.sourceRecordFiles +
      artifact.manifestSummary.retainedRawFiles ===
      artifact.rawDataManifest.expectedInputCount,
    "manifest summary role counts do not cover every input",
  );
  invariant(new Set(manifestPaths).size === artifact.rawDataManifest.expectedInputCount, "manifest contains duplicate paths");
  invariant(CORE_INPUT_PATHS.every((inputPath) => manifestPaths.includes(inputPath)), "manifest is missing a required core input path");
  invariant(
    artifact.rawAvailabilityAudit.discoveredCandidatePaths.every((inputPath) => manifestPaths.includes(inputPath)),
    "a discovered Forever raw/data/script candidate is absent from the manifest",
  );
  invariant(artifact.spotChecks.length >= 10, "spot-check minimum not met");
  invariant(artifact.figureContractRegistry.contracts.length >= 5 && artifact.figureContractRegistry.contracts.length <= 7, "candidate contract count must be 5-7");
  invariant(
    artifact.figureContractRegistry.productionEligibleCount ===
      artifact.figureContractRegistry.contracts.filter((contract) => contract.productionEligible).length,
    "productionEligibleCount does not match independently evaluated figure contracts",
  );
  invariant(artifact.assertions.every((assertion) => assertion.passed), "a validation assertion failed");
  invariant(
    artifact.spotChecks.every((spotCheck) => spotCheck.renderedValue === renderedAuditValue(spotCheck.derivedAuditValue)),
    "spot-check rendered value drifted from its derived audit value",
  );
  const findingIds = new Set(artifact.findingsRegistry.findings.map((finding) => finding.id));
  const contractIds = new Set(artifact.figureContractRegistry.contracts.map((contract) => contract.id));
  const gapIds = new Set(artifact.requiredRawGaps.map((gap) => gap.id));
  const findingById = new Map(artifact.findingsRegistry.findings.map((finding) => [finding.id, finding]));
  const contractById = new Map(artifact.figureContractRegistry.contracts.map((contract) => [contract.id, contract]));
  const gapById = new Map(artifact.requiredRawGaps.map((gap) => [gap.id, gap]));
  invariant(findingIds.size === artifact.findingsRegistry.findings.length, "duplicate finding ID");
  invariant(contractIds.size === artifact.figureContractRegistry.contracts.length, "duplicate contract ID");
  invariant(gapIds.size === artifact.requiredRawGaps.length, "duplicate gap ID");
  invariant(
    artifact.requiredRawGaps.every(
      (gap) => gap.blocksFindingIds.every((id) => findingIds.has(id)) && gap.blocksContractIds.every((id) => contractIds.has(id)),
    ),
    "a raw gap points to an unknown finding or contract",
  );
  invariant(
    artifact.findingsRegistry.findings.every((finding) => finding.blockedByGapIds.every((id) => gapIds.has(id))),
    "a finding points to an unknown raw gap",
  );
  invariant(
    artifact.figureContractRegistry.contracts.every(
      (contract) => contract.findingIds.every((id) => findingIds.has(id)) && contract.blockedByGapIds.every((id) => gapIds.has(id)),
    ),
    "a figure contract points to an unknown finding or raw gap",
  );
  invariant(
    artifact.spotChecks.every(
      (spotCheck) =>
        spotCheck.findingIds.every((id) => findingIds.has(id)) &&
        (spotCheck.contractIds ?? []).every((id) => contractIds.has(id)),
    ),
    "a spot check points to an unknown finding or contract",
  );
  invariant(
    artifact.requiredRawGaps.every(
      (gap) =>
        gap.blocksFindingIds.every((id) => findingById.get(id)?.blockedByGapIds.includes(gap.id)) &&
        gap.blocksContractIds.every((id) => contractById.get(id)?.blockedByGapIds.includes(gap.id)),
    ),
    "a gap-to-finding/contract edge is not reciprocated by blockedByGapIds",
  );
  invariant(
    artifact.findingsRegistry.findings.every((finding) =>
      finding.blockedByGapIds.every((id) => gapById.get(id)?.blocksFindingIds.includes(finding.id)),
    ),
    "a finding-to-gap edge is not reciprocated by blocksFindingIds",
  );
  invariant(
    artifact.figureContractRegistry.contracts.every((contract) =>
      contract.blockedByGapIds.every((id) => gapById.get(id)?.blocksContractIds.includes(contract.id)),
    ),
    "a contract-to-gap edge is not reciprocated by blocksContractIds",
  );
  invariant(
    artifact.findingsRegistry.findings.some((finding) =>
      finding.sourceRowsFiles.some((source) => source.path === "docs/research/forever/sources/google-ngram-official-authority.json"),
    ),
    "the official Google denominator authority record is not linked from a finding",
  );
  const isRegisteredOrExpectedRawPath = (pathname: string) => manifestPaths.includes(pathname) || EXPECTED_RAW_PATHS.has(pathname);
  invariant(
    artifact.findingsRegistry.findings.every((finding) =>
      [...finding.rawFields, ...finding.sourceRowsFiles].every((source) => manifestPaths.includes(source.path)),
    ),
    "a finding source selector is not a registered manifest input",
  );
  invariant(
    artifact.figureContractRegistry.contracts.every((contract) =>
      contract.rawFilesAndFields.every((source) => isRegisteredOrExpectedRawPath(source.path)),
    ),
    "a contract raw-file selector is neither registered nor an exact expected raw path",
  );
  invariant(
    artifact.spotChecks.every((spotCheck) => manifestPaths.includes(spotCheck.rawPath)),
    "a spot-check raw path is not registered in the manifest",
  );
  const ngramSeries = artifact.denominatorAudit.series;
  invariant(ngramSeries.length === 2, "denominator audit core family must contain exactly the joined/spaced pair");
  invariant(ngramSeries.find((series) => series.query === "forever")?.allowedUnit === "per million unigrams", "forever unit drifted");
  invariant(ngramSeries.find((series) => series.query === "for ever")?.allowedUnit === "per million bigrams", "for ever unit drifted");
  invariant(!ngramSeries.some((series) => series.query === "forevermore" || series.query === "forever and ever"), "optional or out-of-scope forms entered the core denominator audit");
}

async function buildArtifact(): Promise<ForeverAnalysisArtifact> {
  const inputs = await loadInputs();
  const fixedGoogle = auditFixedGoogleRelease(inputs);
  const availability = auditRawAvailability(inputs);
  const untraceableResearchInputs = buildUntraceableInputs();
  const dataGate = deriveDataGate(
    availability,
    untraceableResearchInputs.filter((input) => input.dependencyDisposition !== "excluded/legacy").length,
    0,
  );
  const manifest = buildManifest(inputs, dataGate, availability);
  const findings = buildFindings(inputs, dataGate, availability, fixedGoogle);
  const contracts = buildContracts(inputs, dataGate, fixedGoogle);
  const gaps = buildGaps(fixedGoogle);
  const spotChecks = buildSpotChecks(inputs, fixedGoogle, findings, contracts);
  const assertions = buildAssertions(inputs, availability, manifest, findings, contracts, spotChecks, dataGate, fixedGoogle);
  const gateCopy = dataGateCopy(dataGate, fixedGoogle);
  const series = (["forever", "for ever"] as const).map((query) => {
    const order = ngramOrder(query);
    const fixedPointCount = fixedGoogle.fixedViewerSeparateFacets.pointCounts[query];
    return {
      query,
      ngramOrder: order,
      denominator: ngramDenominator(order),
      allowedUnit: ngramUnit(order),
      pointCount: fixedPointCount ?? 0,
      startYear: fixedGoogle.fixedViewerSeparateFacets.yearRange?.start ?? 1500,
      endYear: fixedGoogle.fixedViewerSeparateFacets.yearRange?.end ?? 2019,
    };
  });

  const artifact: ForeverAnalysisArtifact = {
    schemaVersion: SCHEMA_VERSION,
    auditId: AUDIT_ID,
    auditSnapshot: "audit/mobile-search-growth-2026-08; frozen inputs are authoritative by SHA-256, not by acquisition wall-clock time",
    deterministic: true,
    dataGate: {
      status: dataGate,
      displayTitle: gateCopy.displayTitle,
      displaySummary: gateCopy.displaySummary,
      productionPanelsAllowed: PAGE_IMPLEMENTATION_AUTHORIZED,
      pageImplementationAuthorized: PAGE_IMPLEMENTATION_AUTHORIZED,
      reasons: gateCopy.reasons,
      nextEligibleGate: gateCopy.nextEligibleGate,
    },
    missingnessTaxonomy: {
      states: [...MISSINGNESS_STATES],
      sparseRowAbsencePolicy:
        "An absent Google raw shard row is absent_or_suppressed, not observed_zero, unless official inclusion semantics independently prove a searched zero.",
      observedZeroEvidenceRule:
        "observed_zero requires an explicit zero-bearing official record or a source format whose complete inclusion semantics prove zero for that exact form-year.",
    },
    fixedGoogleReleaseAudit: fixedGoogle,
    manifestSummary: {
      registeredInputCount: manifest.entries.length,
      inputSetSha256: manifest.inputSetSha256,
      termFormRegistryFiles: manifest.entries.filter((entry) => entry.role === "term-form-registry").length,
      generatedCaptureFiles: manifest.entries.filter((entry) => entry.role === "generated-capture").length,
      derivedArtifactFiles: manifest.entries.filter((entry) => entry.role === "derived-artifact").length,
      transformScriptFiles: manifest.entries.filter((entry) => entry.role === "transform-script").length,
      renderConsumerFiles: manifest.entries.filter((entry) => entry.role === "render-consumer").length,
      sourceRecordFiles: manifest.entries.filter((entry) => entry.role === "source-record").length,
      retainedRawFiles: manifest.entries.filter((entry) => entry.role === "retained-raw").length,
      upstreamRawPresent: manifest.upstreamRawPresent,
      coverageManifestPresent: manifest.coverageManifestPresent,
      rightsManifestPresent: manifest.rightsManifestPresent,
      productionEligiblePanelCount: contracts.productionEligibleCount,
    },
    rawAvailabilityAudit: availability,
    termFormRegistryAudit: {
      canonicalRegistryPresent: availability.canonicalFormRegistryPresent,
      fragments: [
        ...(inputs.inputPaths.includes(FIXED_GOOGLE_PATHS.family)
          ? [{
              path: FIXED_GOOGLE_PATHS.family,
              formsOrQueries: ["forever", "for ever", "forevermore"],
              policy: "core pair is forever/1-gram + for ever/2-gram; forevermore optional; forever and ever independent trigram out of scope",
            }]
          : []),
        { path: "scripts/fetch_ngram_forever.ts", formsOrQueries: inputs.frequency.series.map((item) => item.query), policy: "case-sensitive Viewer queries; mixed n-gram orders" },
        { path: "scripts/fetch_gutenberg_forever.ts", formsOrQueries: ["forever", "for ever", ...inputs.gutenberg.targetPhrases], policy: "lowercased ASCII adjacent-token matching" },
        { path: "scripts/build_prehistory_forever.ts", formsOrQueries: unique(inputs.prehistory.records.map((record) => record.form)), policy: "manual normalizedForm mapping" },
        { path: "scripts/fetch_modern_context_forever.ts", formsOrQueries: inputs.modern.queries, policy: "MediaWiki search strings with post-filtered snippets" },
        { path: "src/data/forever.ts", formsOrQueries: ["for ever", "forever", "FOREVER-family", "forevermore", "forever and ever"], policy: "legacy placeholder registry; not imported by current data build" },
      ],
      separationFindings: [
        "The fixed Google core family contains only joined 'forever' (1-gram) and spaced 'for ever' (2-gram).",
        "'forevermore' is optional related evidence; 'forever and ever' is an independent out-of-scope trigram and neither can block the core pair.",
        "Joined 'forever' and spaced 'for ever' are separate in Viewer/Gutenberg query rows.",
        "Gutenberg target phrases omit spaced 'for ever and ever' even though passages exist.",
        "ASCII tokenization can conflate hyphenated 'for-ever' with spaced 'for ever'.",
        "Ngram, Gutenberg, prehistory, and modern lists are not governed by one versioned form policy.",
      ],
    },
    denominatorAudit: {
      rawMatchCountsAvailable: availability.rawMatchCountsAvailable,
      annualWordTokenTotalsAvailable: availability.annualWordTokenTotalsAvailable,
      commonAnnualWordTokenDenominatorAvailable: availability.commonAnnualWordTokenDenominatorAvailable,
      corpusReleasePinned: availability.corpusReleasePinned,
      viewerNormalizedOnly: !availability.rawMatchCountsAvailable,
      sharedJoinedSpacedScaleAllowed: availability.commonAnnualWordTokenDenominatorAvailable,
      series,
      allowedUse: [
        "Separate, explicitly labeled Viewer-normalized facets by n-gram order after raw response and release provenance are retained.",
        "Within-series temporal description, subject to zero/missing and corpus caveats.",
        availability.commonAnnualWordTokenDenominatorAvailable
          ? "From the fixed raw contract only: exact joined/spaced rates and pair arithmetic on the shared annual 1-gram word-token denominator."
          : "Same-order comparison only when corpus/release/query policy is identical and locally stated.",
      ],
      prohibitedUse: [
        "Any joined/spaced share, ratio, crossover, overtaking, or delta computed from Viewer-normalized unigram/bigram fractions.",
        "orthographic dominance",
        "one shared generic frequency-per-million axis across different Viewer n-gram orders",
      ],
    },
    googleOfficialShardFeasibility: {
      status: fixedGoogle.fixedRawCommonDenominator.productionEligible
        ? "ACQUISITION_VALIDATED"
        : "DISCOVERY_EXECUTED",
      planningEnvelope: "1,240,926,704 compressed bytes for the two core shards; 1,240,940,250 bytes including totalcounts-1",
      repositoryEvidenceForExactShardSize: true,
      officialSourcesOnly: true,
      requirements: [
        "Identify exact official Google Ngram corpus release before transfer.",
        "Acquire the exact official unigram shard for forever (optionally forevermore) and exact bigram shard for for ever; the trigram phrase is out of scope.",
        "Acquire same-release official total-count/year files needed for a common annual word-token denominator.",
        "Record source URLs, compressed/uncompressed sizes, SHA-256, extraction command/version, row filters, and rights boundary.",
      ],
      boundary: [
        "The exact object sizes and identity headers are retained in the acquisition manifest.",
        "One lexical shard alone cannot establish a common denominator; same-release annual total-count inputs are also required.",
        "Actual transfer, decompression, disk, memory, release layout, and query-to-shard mapping must be checked before acquisition.",
        "Acquisition timestamps are provenance only; derivation byte stability begins after input bytes are frozen and checksum-bound.",
      ],
    },
    rawDataManifest: manifest,
    findingsRegistry: findings,
    figureContractRegistry: contracts,
    requiredRawGaps: gaps,
    untraceableResearchInputs,
    spotChecks,
    assertions,
  };
  validateBuiltArtifact(artifact);
  return artifact;
}

async function expectedOutputs() {
  const artifact = await buildArtifact();
  return new Map<string, string>([
    [OUTPUT_PATHS.analysis, jsonText(artifact)],
    [OUTPUT_PATHS.manifest, jsonText(artifact.rawDataManifest)],
    [OUTPUT_PATHS.findings, jsonText(artifact.findingsRegistry)],
    [OUTPUT_PATHS.contracts, jsonText(artifact.figureContractRegistry)],
  ]);
}

async function writeOutputs(outputs: Map<string, string>) {
  await mkdir(OUT_DIR, { recursive: true });
  for (const [relativePath, content] of outputs) {
    await writeFile(path.join(ROOT, relativePath), content, "utf8");
    console.log(`Wrote ${relativePath} (${sha256(content)})`);
  }
}

async function checkOutputs(outputs: Map<string, string>) {
  for (const [relativePath, expected] of outputs) {
    const actual = await readFile(path.join(ROOT, relativePath), "utf8").catch(() => null);
    invariant(actual !== null, `generated artifact is missing: ${relativePath}`);
    invariant(actual === expected, `generated artifact is stale or non-deterministic: ${relativePath}`);
    console.log(`Validated ${relativePath} (${sha256(actual)})`);
  }
  console.log("Forever audit validation passed with a gate derived from registered input availability.");
}

const outputs = await expectedOutputs();
if (process.argv.includes("--check")) {
  await checkOutputs(outputs);
} else {
  await writeOutputs(outputs);
}
