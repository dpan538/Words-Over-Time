import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

import type {
  ForeverAnalysisArtifact,
  ForeverAuditValue,
  ForeverFigureContract,
  ForeverFigureContractRegistry,
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
const SCHEMA_VERSION = "1.0.0";

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
  const [scripts, dataSources, generated, sources, docsRaw, sourceRaw, repositoryRaw, structuredData] = await Promise.all([
    walkRelativeFiles("scripts"),
    walkRelativeFiles("src/data"),
    walkRelativeFiles("src/data/generated"),
    walkRelativeFiles("docs/research/forever/sources"),
    walkRelativeFiles("docs/research/forever/raw"),
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
    ...sourceRaw,
    ...repositoryRaw,
    ...structuredData,
  ]).sort();
}

async function loadInputs(): Promise<InputBundle> {
  const discoveredCandidatePaths = await discoverForeverAuditCandidates();
  const inputPaths = [...CORE_INPUT_PATHS];
  const unregisteredCandidates = discoveredCandidatePaths.filter((candidate) => !inputPaths.includes(candidate as (typeof CORE_INPUT_PATHS)[number]));
  invariant(
    unregisteredCandidates.length === 0,
    `unregistered Forever raw/data/script candidate(s): ${unregisteredCandidates.join(", ")}; audit and add each path before the gate may be regenerated`,
  );
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
  return /^(?:docs\/research\/forever\/raw|src\/data\/raw\/forever|data\/forever)\//.test(relativePath);
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

function validateCanonicalFormRegistry(inputs: InputBundle) {
  const value = parseRegisteredJson(inputs, CANONICAL_FORM_REGISTRY_PATH);
  if (!isRecord(value) || !Array.isArray(value.forms) || !isRecord(value.analysisWindow)) return null;
  const startYear = value.analysisWindow.startYear;
  const endYear = value.analysisWindow.endYear;
  if (!Number.isInteger(startYear) || !Number.isInteger(endYear) || Number(startYear) > Number(endYear)) return null;
  const rows = value.forms.filter(isRecord);
  const required = new Map(inputs.frequency.series.map((series) => [series.query, ngramOrder(series.query)]));
  const valid =
    value.completeFamily === true &&
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
    Array.from(required).every(([form, order]) => rows.some((row) => row.form === form && row.ngramOrder === order));
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
        Number(row.match_count) >= 0 &&
        row.release === source.release &&
        totalYears.has(Number(row.year)),
    ) &&
    new Set(matchRows.map((row) => `${row.form}:${row.year}`)).size === matchRows.length;
  const yearsByForm = new Map(
    Array.from(expectedOrder.keys()).map((form) => [
      form,
      matchRows.filter((row) => row.form === form).map((row) => Number(row.year)).sort((a, b) => a - b),
    ]),
  );
  const foreverYears = yearsByForm.get("forever") ?? [];
  const forEverYears = yearsByForm.get("for ever") ?? [];
  const sharedCompleteYears =
    foreverYears.length === expectedYears.length &&
    forEverYears.length === expectedYears.length &&
    expectedYears.every((year, index) => year === foreverYears[index] && year === forEverYears[index]) &&
    expectedYears.every((year) => totalYears.has(year));

  return totalsValid && totalRows.length === expectedYears.length && matchesValid && sharedCompleteYears;
}

function validateGutenbergRawManifest(inputs: InputBundle) {
  const value = parseRegisteredJson(inputs, GUTENBERG_RAW_MANIFEST_PATH);
  if (!isRecord(value) || !Array.isArray(value.sourceRecords) || !nonEmptyString(value.selectionPolicy)) return false;
  const rows = value.sourceRecords.filter(isRecord);
  return (
    rows.length === 23 &&
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
  return (
    searchRows.length === 10 &&
    pageRows.length >= 16 &&
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
  const requiredStates = ["observed-zero", "not-searched", "unavailable", "incomparable"];
  const stateSet = new Set(value.states);
  const rows = value.rows.filter(isRecord);
  const requiredDatasets = ["google-ngram", "gutenberg", "attestations", "modern"];
  return (
    requiredStates.every((state) => stateSet.has(state)) &&
    requiredDatasets.every((dataset) => rows.some((row) => row.dataset === dataset)) &&
    rows.every(
      (row) =>
        nonEmptyString(row.dataset) &&
        nonEmptyString(row.period) &&
        nonEmptyString(row.coverageState) &&
        stateSet.has(row.coverageState) &&
        Number.isInteger(row.documentCount) &&
        Number.isInteger(row.recordCount) &&
        Number.isInteger(row.tokenCount),
    )
  );
}

function validateRightsManifest(inputs: InputBundle) {
  const value = parseRegisteredJson(inputs, RIGHTS_MANIFEST_PATH);
  if (!isRecord(value) || !Array.isArray(value.records)) return false;
  const rows = value.records.filter(isRecord);
  const rawInputsToCover = inputs.inputPaths.filter(
    (pathname) => isDedicatedRawPath(pathname) && ![RIGHTS_MANIFEST_PATH, COVERAGE_MANIFEST_PATH, TRANSFORM_MANIFEST_PATH].includes(pathname),
  );
  return (
    rawInputsToCover.length > 0 &&
    rawInputsToCover.every((pathname) =>
      rows.some(
        (row) =>
          row.path === pathname &&
          nonEmptyString(row.sourceUrl) &&
          nonEmptyString(row.rightsBoundary) &&
          checksumBindsRegisteredBytes(inputs, row.path, row.sha256),
      ),
    )
  );
}

function validateTransformManifest(inputs: InputBundle) {
  const value = parseRegisteredJson(inputs, TRANSFORM_MANIFEST_PATH);
  if (!isRecord(value) || !Array.isArray(value.transforms)) return false;
  const rows = value.transforms.filter(isRecord);
  const requiredPipelineScripts = inputs.inputPaths.filter(
    (pathname) => /^scripts\/(?:fetch|build).*forever.*\.ts$/i.test(pathname),
  );
  const rawPayloadPaths = inputs.inputPaths.filter(
    (pathname) => isDedicatedRawPath(pathname) && !EXPECTED_RAW_PATHS.has(pathname),
  );
  const coveredPaths = new Set(
    rows.flatMap((row) =>
      [
        ...(Array.isArray(row.inputs) ? row.inputs.filter(isRecord).map((input) => input.path) : []),
        ...(Array.isArray(row.outputs) ? row.outputs.filter(isRecord).map((output) => output.path) : []),
      ].filter((pathname): pathname is string => typeof pathname === "string"),
    ),
  );
  return (
    rows.length > 0 &&
    new Set(rows.map((row) => row.id)).size === rows.length &&
    requiredPipelineScripts.every((scriptPath) => rows.some((row) => row.scriptPath === scriptPath)) &&
    rawPayloadPaths.every((pathname) => coveredPaths.has(pathname)) &&
    rows.every(
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
}

function auditRawAvailability(inputs: InputBundle): ForeverRawAvailabilityAudit {
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
  const rawMatchCountKeyPaths = keyMatches(["match_count", "matchCount"]);
  const annualWordTokenTotalKeyPaths = keyMatches(["annual_word_tokens", "annualWordTokens"]);
  const pinnedCorpusReleaseKeyPaths = keyMatches(["corpus_release", "corpusRelease", "persistentCorpusId", "persistent_corpus_id"]);
  const commonDenominatorValidated = validateCommonDenominatorFile(inputs);
  const commonDenominatorValidatedFiles = commonDenominatorValidated ? [COMMON_DENOMINATOR_PATH] : [];
  const canonicalFormRegistryPresent = validateCanonicalFormRegistry(inputs) !== null;
  const googleRawResponsePresent = validateViewerRawResponse(inputs);
  const gutenbergRawTextsAndMetadataPresent = validateGutenbergRawManifest(inputs);
  const attestationPrimaryRecordsPresent = validateAttestationRawManifest(inputs);
  const modernRawApiAndPageCapturesPresent = validateModernRawManifest(inputs);
  const coverageManifestPresent = validateCoverageManifest(inputs);
  const rightsManifestPresent = validateRightsManifest(inputs);
  const transformManifestPresent = validateTransformManifest(inputs);
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

function dataGateCopy(status: ReturnType<typeof deriveDataGate>) {
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
      granularity: "23 manually selected works with nested occurrence-level rows",
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
        "Selection coverage and searched-zero status outside the 23 works are not encoded.",
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
  const entries = inputs.inputPaths.map((relativePath) => manifestEntry(inputs, relativePath));
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

function buildGaps(): ForeverRawGap[] {
  return [
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
      blocksFindingIds: ["finding-ngram-denominator", "finding-ngram-window"],
      blocksContractIds: ["contract-viewer-facets", "contract-transition-robustness"],
    },
    {
      id: "gap-google-common-denominator",
      priority: "P0",
      missingFilesOrFields: ["official raw match_count rows", "same-release annual word-token totals", "release/shard manifest", "checksums"],
      whyRequired: "A common appearances-per-million-words scale cannot be reconstructed from Viewer normalized fractions.",
      officialSourceBoundary: "Google official downloadable Ngram shards and same-release total-count files only; no blog or third-party reconstruction.",
      blocksFindingIds: ["finding-ngram-denominator"],
      blocksContractIds: ["contract-transition-robustness", "contract-orthographic-family"],
    },
    {
      id: "gap-gutenberg-raw-texts-metadata",
      priority: "P0",
      missingFilesOrFields: ["23 retained official text files", "Gutenberg metadata/release/update", "edition/translator/language", "capture date", "SHA-256", "selection manifest"],
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
      missingFilesOrFields: ["10 raw search responses", "total/continuation/zero-result state", "pageid/revid/timestamps", "16 unique revision captures", "page publication/text/capture dates", "license metadata", "passage hashes"],
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
      blocksContractIds: ["contract-coverage-matrix", "contract-viewer-facets", "contract-date-ledger", "contract-modern-matrix"],
    },
  ];
}

function buildFindings(
  inputs: InputBundle,
  dataGate: ReturnType<typeof deriveDataGate>,
  availability: ForeverRawAvailabilityAudit,
): ForeverFindingsRegistry {
  const frequencyPath = "src/data/generated/forever_frequency.json";
  const gutenbergPath = "src/data/generated/forever_gutenberg_sources.json";
  const prehistoryPath = "src/data/generated/forever_prehistory.json";
  const modernPath = "src/data/generated/forever_modern_context.json";
  const officialAuthorityPath = "docs/research/forever/sources/google-ngram-official-authority.json";
  const foreverSeries = inputs.frequency.series.find((series) => series.query === "forever");
  invariant(foreverSeries, "forever Viewer series is absent");
  const foreverWindow = foreverSeries.points.filter((point) => point.year >= 1700 && point.year <= 2022);
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

  const findings: ForeverFinding[] = [
    {
      id: "finding-ngram-denominator",
      status: "audited-blocker",
      productionEligible: false,
      question: "Can joined 'forever' and spaced 'for ever' share an appearances-per-million scale?",
      rawFields: [
        sourceSelector(frequencyPath, "series[query in {'forever','for ever'}]", ["query", "points[].value", "source.corpus", "source.url"]),
        sourceSelector(officialAuthorityPath, "sourceRecords[id='google-ngram-viewer-denominator']", ["url", "applicableClaim", "sourceLocation", "accessedOn"]),
      ],
      filters: ["query is exactly 'forever' or 'for ever'", "smoothing=0", "case_insensitive=false"],
      grouping: ["query", "year"],
      denominator: availability.commonAnnualWordTokenDenominatorAvailable
        ? "same-release annual word-token total validated for both exact forms and every shared year"
        : "Viewer-specific all-unigram denominator for forever; all-bigram denominator for for ever",
      transformFormula: availability.commonAnnualWordTokenDenominatorAvailable
        ? "raw match_count / annual_word_tokens × 1,000,000"
        : "Viewer fraction × 1,000,000, with unit retained by n-gram order",
      result: {
        summary: availability.commonAnnualWordTokenDenominatorAvailable
          ? "A strict official-source schema validates exact joined/spaced match rows against the same annual word-token totals."
          : "Only option B is present: separate Viewer-normalized facets; a shared joined/spaced scale is invalid.",
        values: {
          foreverOrder: ngramOrder("forever"),
          forEverOrder: ngramOrder("for ever"),
          rawMatchCountsAvailable: availability.rawMatchCountsAvailable,
          annualWordTokenTotalsAvailable: availability.annualWordTokenTotalsAvailable,
          sharedScaleAllowed: availability.commonAnnualWordTokenDenominatorAvailable,
        },
      },
      caveat: ["Corpus release is not pinned.", "No raw response or official bulk rows are retained."],
      sourceRowsFiles: [
        sourceSelector(frequencyPath, "source", ["corpus", "url", "smoothing", "startYear", "endYear"]),
        sourceSelector("scripts/fetch_ngram_forever.ts", "URL construction and response mapping", ["content", "corpus", "smoothing", "case_insensitive", "timeseries"]),
        sourceSelector(officialAuthorityPath, "sourceRecords[id in {'google-ngram-viewer-denominator','google-ngram-viewer-release-mutation'}]", ["publisher", "title", "url", "accessedOn", "applicableClaim", "repositoryUse"]),
      ],
      blockedByGapIds: ["gap-google-raw-response-release", "gap-google-common-denominator"],
    },
    {
      id: "finding-ngram-window",
      status: "audited-limited-result",
      productionEligible: false,
      question: "What is the actual granularity of the historical 323-row Forever table?",
      rawFields: [sourceSelector(frequencyPath, "series[query='forever'].points", ["year", "value", "frequencyPerMillion"])],
      filters: ["query='forever'", "1700 <= year <= 2022"],
      grouping: ["one row per year"],
      denominator: "all unigrams in each Viewer corpus-year",
      transformFormula: "inclusive filter; row_count = 2022 - 1700 + 1",
      result: {
        summary: "The table is 323 Viewer-normalized annual unigram observations, not 323 raw match-count rows.",
        values: { rowCount: foreverWindow.length, firstYear: foreverWindow[0]?.year ?? null, lastYear: foreverWindow.at(-1)?.year ?? null },
      },
      caveat: ["Numeric zero is not a typed missingness state.", "The raw API response is absent."],
      sourceRowsFiles: [sourceSelector(frequencyPath, "series[query='forever'].points[1700..2022]", ["year", "value"])],
      blockedByGapIds: ["gap-google-raw-response-release"],
    },
    {
      id: "finding-gutenberg-inventory",
      status: "audited-limited-result",
      productionEligible: false,
      question: "What joined/spaced counts exist inside the selected Gutenberg inventory?",
      rawFields: [sourceSelector(gutenbergPath, "sources[] and sources[].occurrences[kind='form']", ["id", "year", "tokenCount", "kind", "phrase", "tokenIndex"])],
      filters: ["23 manually selected works", "occurrence.kind='form'", "phrase exactly 'forever' or 'for ever'"],
      grouping: ["form", "selected work"],
      denominator: "token count inside the selected 23 processed texts only",
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

  return { schemaVersion: SCHEMA_VERSION, auditId: AUDIT_ID, dataGate, findings };
}

function buildContracts(inputs: InputBundle, dataGate: ReturnType<typeof deriveDataGate>): ForeverFigureContractRegistry {
  const ngramN = Object.fromEntries(inputs.frequency.series.map((series) => [series.query, series.points.length]));
  const contracts: ForeverFigureContract[] = [
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
      id: "contract-viewer-facets",
      candidatePanel: "Viewer-normalized form facets",
      findingIds: ["finding-ngram-denominator", "finding-ngram-window"],
      productionEligible: false,
      eligibilityReason: "Separate-unit option B is analytically possible, but the raw response and explicit corpus release are not retained.",
      researchQuestion: "How does each registered form move within its own Google Viewer denominator?",
      rawFilesAndFields: [sourceSelector("src/data/generated/forever_frequency.json", "series[].points[]", ["query", "year", "value"])],
      recordGranularityAndN: { granularity: "query-year Viewer observation", n: ngramN },
      filters: ["smoothing=0", "case_insensitive=false"],
      grouping: ["ngram order", "query", "year"],
      denominator: "separate all-unigram/all-bigram/all-trigram corpus-year totals",
      formulaTransform: "Viewer fraction × 1,000,000; no cross-order arithmetic",
      unit: "per million unigrams OR per million bigrams OR per million trigrams, locally labeled",
      visualChannelMapping: [{ channel: "facet", field: "ngram order", mapping: "never share an axis across orders" }, { channel: "x", field: "year", mapping: "linear time" }, { channel: "y", field: "Viewer fraction", mapping: "within-facet fixed unit" }],
      validInterpretation: ["Within-series movement and same-order comparison after release is pinned."],
      prohibitedInterpretation: ["joined/spaced share, ratio, crossover, overtaking, delta, or orthographic dominance"],
      missingnessErrorSourceLimitations: ["Zero/missing ambiguity", "corpus alias is unpinned", "raw response absent"],
      localDisclosureRequirements: ["exact unit per facet", "corpus/release", "smoothing", "n/year range", "zero/missing caveat"],
      blockedByGapIds: ["gap-google-raw-response-release", "gap-coverage-rights-transform-manifests"],
    },
    {
      id: "contract-transition-robustness",
      candidatePanel: "Transition robustness field",
      findingIds: ["finding-ngram-denominator"],
      productionEligible: false,
      eligibilityReason: "Common denominator and multiple pinned corpus/release/smoothing analyses are absent.",
      researchQuestion: "Does a joined/spaced transition conclusion survive corpus, release, and smoothing choices?",
      rawFilesAndFields: [
        sourceSelector(COMMON_DENOMINATOR_PATH, "source-bound TSV paths plus registered analysis window", [
          "source.match_rows_path",
          "source.annual_totals_path",
          "source.release",
          "analysisWindow.startYear",
          "analysisWindow.endYear",
          "TSV: form,ngram_order,year,match_count,annual_word_tokens,release",
        ]),
      ],
      recordGranularityAndN: { granularity: "form × year × corpus release × smoothing specification", n: {} },
      filters: ["preregistered complete years/forms"],
      grouping: ["corpus", "release", "smoothing"],
      denominator: "same-release annual word-token total",
      formulaTransform: "raw_match_count / annual_word_tokens × 1,000,000; sensitivity grid",
      unit: "appearances per million words",
      visualChannelMapping: [{ channel: "facet", field: "corpus/release", mapping: "one fixed cell per specification" }, { channel: "symbol", field: "conclusion stability", mapping: "stable/unstable/indeterminate" }],
      validInterpretation: ["Sensitivity of a preregistered conclusion."],
      prohibitedInterpretation: ["Robustness from one Viewer series or mixed denominators."],
      missingnessErrorSourceLimitations: ["All required raw bulk rows/totals are missing."],
      localDisclosureRequirements: ["formula", "release", "specification count", "missing years"],
      blockedByGapIds: ["gap-google-common-denominator", "gap-google-raw-response-release"],
    },
    {
      id: "contract-orthographic-family",
      candidatePanel: "Orthographic-family small multiples",
      findingIds: ["finding-ngram-denominator"],
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
      blockedByGapIds: ["gap-canonical-form-registry", "gap-google-common-denominator"],
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
  return {
    schemaVersion: SCHEMA_VERSION,
    auditId: AUDIT_ID,
    dataGate,
    productionEligibleCount: 0,
    contracts,
  };
}

function buildSpotChecks(inputs: InputBundle): ForeverSpotCheck[] {
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
      derivation: "array length",
      derivedAuditValue: inputs.frequency.series.length,
      findingIds: ["finding-ngram-denominator"],
    },
    {
      id: "spot-forever-323-window",
      rawPath: frequencyPath,
      rowSelector: "series[query='forever'].points[1700<=year<=2022]",
      observedFields: ["year"],
      observedValue: { first: foreverWindow[0]?.year ?? null, last: foreverWindow.at(-1)?.year ?? null },
      derivation: "inclusive filtered row count",
      derivedAuditValue: foreverWindow.length,
      findingIds: ["finding-ngram-window"],
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
        derivation: `Viewer fraction × 1,000,000; unit=${ngramUnit(ngramOrder(query))}`,
        derivedAuditValue: final?.frequencyPerMillion ?? null,
        findingIds: ["finding-ngram-denominator"],
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
  invariant(checks.length >= 10, "at least ten spot checks are required");
  return checks.map((check) => ({ ...check, renderedValue: renderedAuditValue(check.derivedAuditValue) }));
}

function buildUntraceableInputs(): ForeverUntraceableInput[] {
  return [
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
}

function buildAssertions(
  inputs: InputBundle,
  availability: ForeverRawAvailabilityAudit,
  manifest: ForeverRawDataManifest,
  findings: ForeverFindingsRegistry,
  contracts: ForeverFigureContractRegistry,
  spotChecks: ForeverSpotCheck[],
  dataGate: ReturnType<typeof deriveDataGate>,
): ForeverValidationAssertion[] {
  const manifestPaths = manifest.entries.map((entry) => entry.path);
  const denominatorFinding = findings.findings.find((finding) => finding.id === "finding-ngram-denominator");
  const windowFinding = findings.findings.find((finding) => finding.id === "finding-ngram-window");
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
  const zeroMissingStateValid =
    availability.coverageManifestPresent ||
    windowFinding.caveat.some((caveat) => caveat.includes("Numeric zero is not a typed missingness state"));
  const foreverWindow = inputs.frequency.series
    .find((series) => series.query === "forever")
    ?.points.filter((point) => point.year >= 1700 && point.year <= 2022) ?? [];
  const windowValid =
    foreverWindow.length === 323 && foreverWindow[0]?.year === 1700 && foreverWindow.at(-1)?.year === 2022;
  const gateValid =
    dataGate === deriveDataGate(availability, buildUntraceableInputs().length, contracts.productionEligibleCount);
  const spotChecksValid =
    spotChecks.length >= 10 &&
    spotChecks.every((spotCheck) => spotCheck.renderedValue === renderedAuditValue(spotCheck.derivedAuditValue));

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
      id: "assert-denominator-incompatibility",
      passed: denominatorStateValid,
      assertion: "The joined/spaced shared-scale flag follows the validated common-denominator predicate.",
      observed: denominatorFinding.result.values,
    },
    {
      id: "assert-missing-not-zero",
      passed: zeroMissingStateValid,
      assertion: "Numeric zero is recorded as an ambiguous observed value and never reclassified as typed missingness.",
      observed: {
        zeroState: "numeric-observation-with-unknown-semantic-status",
        typedMissingStateAvailable: availability.coverageManifestPresent,
        coverageManifestPresent: manifest.coverageManifestPresent,
      },
    },
    {
      id: "assert-323-window",
      passed: windowValid,
      assertion: "The 1700-2022 inclusive Forever Viewer slice contains 323 query-year rows.",
      observed: windowFinding.result.values,
    },
    {
      id: "assert-stop-gate-is-valid",
      passed: gateValid,
      assertion: "The data gate is derived from retained raw-input availability, and no figure contract is production eligible.",
      observed: {
        dataGate,
        productionEligibleCount: contracts.contracts.filter((contract) => contract.productionEligible).length,
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
  const derivedGate = deriveDataGate(
    artifact.rawAvailabilityAudit,
    artifact.untraceableResearchInputs.length,
    artifact.figureContractRegistry.productionEligibleCount,
  );
  invariant(artifact.dataGate.status === derivedGate, "data gate does not match retained-input availability");
  invariant(
    artifact.dataGate.productionPanelsAllowed === (derivedGate === "PASS"),
    "productionPanelsAllowed does not match the derived data gate",
  );
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
  invariant(artifact.figureContractRegistry.contracts.every((contract) => contract.productionEligible === false), "a panel was marked production eligible at STOP gate");
  invariant(artifact.figureContractRegistry.productionEligibleCount === 0, "productionEligibleCount must be zero");
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
    artifact.spotChecks.every((spotCheck) => spotCheck.findingIds.every((id) => findingIds.has(id))),
    "a spot check points to an unknown finding",
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
  invariant(ngramSeries.find((series) => series.query === "forever")?.allowedUnit === "per million unigrams", "forever unit drifted");
  invariant(ngramSeries.find((series) => series.query === "for ever")?.allowedUnit === "per million bigrams", "for ever unit drifted");
  invariant(ngramSeries.find((series) => series.query === "forever and ever")?.allowedUnit === "per million trigrams", "forever and ever unit drifted");
}

async function buildArtifact(): Promise<ForeverAnalysisArtifact> {
  const inputs = await loadInputs();
  const availability = auditRawAvailability(inputs);
  const untraceableResearchInputs = buildUntraceableInputs();
  const dataGate = deriveDataGate(availability, untraceableResearchInputs.length, 0);
  const manifest = buildManifest(inputs, dataGate, availability);
  const findings = buildFindings(inputs, dataGate, availability);
  const contracts = buildContracts(inputs, dataGate);
  const gaps = buildGaps();
  const spotChecks = buildSpotChecks(inputs);
  const assertions = buildAssertions(inputs, availability, manifest, findings, contracts, spotChecks, dataGate);
  const gateCopy = dataGateCopy(dataGate);
  const series = inputs.frequency.series.map((item) => {
    const order = ngramOrder(item.query);
    return {
      query: item.query,
      ngramOrder: order,
      denominator: ngramDenominator(order),
      allowedUnit: ngramUnit(order),
      pointCount: item.points.length,
      startYear: item.points[0]?.year ?? inputs.frequency.source.startYear,
      endYear: item.points.at(-1)?.year ?? inputs.frequency.source.endYear,
    };
  });

  const artifact: ForeverAnalysisArtifact = {
    schemaVersion: SCHEMA_VERSION,
    auditId: AUDIT_ID,
    auditSnapshot: "audit/mobile-search-growth-2026-08 at 33bc7ab2; inputs are authoritative by SHA-256, not by wall-clock time",
    deterministic: true,
    dataGate: {
      status: dataGate,
      displayTitle: gateCopy.displayTitle,
      displaySummary: gateCopy.displaySummary,
      productionPanelsAllowed: dataGate === "PASS",
      reasons: gateCopy.reasons,
      nextEligibleGate: gateCopy.nextEligibleGate,
    },
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
        { path: "scripts/fetch_ngram_forever.ts", formsOrQueries: inputs.frequency.series.map((item) => item.query), policy: "case-sensitive Viewer queries; mixed n-gram orders" },
        { path: "scripts/fetch_gutenberg_forever.ts", formsOrQueries: ["forever", "for ever", ...inputs.gutenberg.targetPhrases], policy: "lowercased ASCII adjacent-token matching" },
        { path: "scripts/build_prehistory_forever.ts", formsOrQueries: unique(inputs.prehistory.records.map((record) => record.form)), policy: "manual normalizedForm mapping" },
        { path: "scripts/fetch_modern_context_forever.ts", formsOrQueries: inputs.modern.queries, policy: "MediaWiki search strings with post-filtered snippets" },
        { path: "src/data/forever.ts", formsOrQueries: ["for ever", "forever", "FOREVER-family", "forevermore", "forever and ever"], policy: "legacy placeholder registry; not imported by current data build" },
      ],
      separationFindings: [
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
        "Same-order comparison only when corpus/release/query policy is identical and locally stated.",
      ],
      prohibitedUse: [
        "joined/spaced share",
        "direct joined/spaced ratio",
        "crossover or overtaking year",
        "joined/spaced delta",
        "orthographic dominance",
        "one shared generic frequency-per-million axis across unigram, bigram, and trigram series",
      ],
    },
    googleOfficialShardFeasibility: {
      status: "NOT_EXECUTED_OFFLINE_AUDIT",
      planningEnvelope: "approximately 1.2 GB",
      repositoryEvidenceForExactShardSize: false,
      officialSourcesOnly: true,
      requirements: [
        "Identify exact official Google Ngram corpus release before transfer.",
        "Acquire the official unigram shard(s) for forever/forevermore and bigram shard(s) for for ever; add trigram only if the phrase is preregistered.",
        "Acquire same-release official total-count/year files needed for a common annual word-token denominator.",
        "Record source URLs, compressed/uncompressed sizes, SHA-256, extraction command/version, row filters, and rights boundary.",
      ],
      boundary: [
        "The approximately 1.2 GB figure is a requested planning envelope, not a size verified by repository evidence.",
        "One lexical shard alone cannot establish a common denominator; same-release annual total-count inputs are also required.",
        "Actual transfer, decompression, disk, memory, release layout, and query-to-shard mapping must be checked before acquisition.",
        "No network acquisition was attempted in this audit.",
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
