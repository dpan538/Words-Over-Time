export type ForeverDataGateStatus =
  | "PASS"
  | "STOP_RAW_DATA_MISSING"
  | "STOP_UNTRACEABLE_TRANSFORM"
  | "STOP_INSUFFICIENT_ANALYTIC_DEPTH";

export type ForeverAuditValue =
  | string
  | number
  | boolean
  | null
  | ForeverAuditValue[]
  | { [key: string]: ForeverAuditValue };

export type ForeverManifestRole =
  | "term-form-registry"
  | "generated-capture"
  | "derived-artifact"
  | "transform-script"
  | "render-consumer"
  | "source-record"
  | "retained-raw";

export type ForeverAuthorityLevel =
  | "placeholder-only"
  | "generated-capture-without-upstream-raw"
  | "derived-non-authoritative"
  | "source-code-audit-only"
  | "official-source-reference"
  | "retained-upstream-raw";

export type ForeverTimeRange = {
  start: number | null;
  end: number | null;
  basis: string;
  precision: string;
};

export type ForeverManifestEntry = {
  id: string;
  path: string;
  role: ForeverManifestRole;
  authorityLevel: ForeverAuthorityLevel;
  sha256: string;
  byteLength: number;
  fields: string[];
  granularity: string;
  recordCounts: Record<string, number>;
  timeRange: ForeverTimeRange | null;
  source: string;
  sourceUrl: string | null;
  corpus: string | null;
  release: string | null;
  missingness: string[];
  duplicatePolicy: string;
  transformHistory: string[];
  rightsBoundary: string;
  productionAuthority: boolean;
  caveats: string[];
};

export type ForeverRawDataManifest = {
  schemaVersion: string;
  auditId: string;
  dataGate: ForeverDataGateStatus;
  inputSetSha256: string;
  expectedInputCount: number;
  entries: ForeverManifestEntry[];
  upstreamRawPresent: boolean;
  coverageManifestPresent: boolean;
  transformManifestPresent: boolean;
  rightsManifestPresent: boolean;
};

export type ForeverSourceSelector = {
  path: string;
  selector: string;
  fields: string[];
};

export type ForeverFinding = {
  id: string;
  status: "audited-blocker" | "audited-limited-result";
  productionEligible: false;
  question: string;
  rawFields: ForeverSourceSelector[];
  filters: string[];
  grouping: string[];
  denominator: string;
  transformFormula: string;
  result: {
    summary: string;
    values: Record<string, ForeverAuditValue>;
  };
  caveat: string[];
  sourceRowsFiles: ForeverSourceSelector[];
  blockedByGapIds: string[];
};

export type ForeverFindingsRegistry = {
  schemaVersion: string;
  auditId: string;
  dataGate: ForeverDataGateStatus;
  findings: ForeverFinding[];
};

export type ForeverVisualChannel = {
  channel: string;
  field: string;
  mapping: string;
};

export type ForeverFigureContract = {
  id: string;
  candidatePanel: string;
  findingIds: string[];
  productionEligible: false;
  eligibilityReason: string;
  researchQuestion: string;
  rawFilesAndFields: ForeverSourceSelector[];
  recordGranularityAndN: {
    granularity: string;
    n: Record<string, number>;
  };
  filters: string[];
  grouping: string[];
  denominator: string;
  formulaTransform: string;
  unit: string;
  visualChannelMapping: ForeverVisualChannel[];
  validInterpretation: string[];
  prohibitedInterpretation: string[];
  missingnessErrorSourceLimitations: string[];
  localDisclosureRequirements: string[];
  blockedByGapIds: string[];
};

export type ForeverFigureContractRegistry = {
  schemaVersion: string;
  auditId: string;
  dataGate: ForeverDataGateStatus;
  productionEligibleCount: 0;
  contracts: ForeverFigureContract[];
};

export type ForeverRawGap = {
  id: string;
  priority: "P0" | "P1";
  missingFilesOrFields: string[];
  whyRequired: string;
  officialSourceBoundary: string;
  blocksFindingIds: string[];
  blocksContractIds: string[];
};

export type ForeverSpotCheck = {
  id: string;
  rawPath: string;
  rowSelector: string;
  observedFields: string[];
  observedValue: ForeverAuditValue;
  derivation: string;
  derivedAuditValue: ForeverAuditValue;
  renderedValue: string;
  findingIds: string[];
};

export type ForeverValidationAssertion = {
  id: string;
  passed: boolean;
  assertion: string;
  observed: ForeverAuditValue;
};

export type ForeverUntraceableInput = {
  id: string;
  path: string;
  locations: string[];
  kind: string;
  reason: string;
  requiredDisposition: "exclude-from-research-results" | "rebuild-from-registered-finding";
};

export type ForeverAnalysisArtifact = {
  schemaVersion: string;
  auditId: string;
  auditSnapshot: string;
  deterministic: true;
  dataGate: {
    status: ForeverDataGateStatus;
    displayTitle: string;
    displaySummary: string;
    productionPanelsAllowed: boolean;
    reasons: string[];
    nextEligibleGate: ForeverDataGateStatus;
  };
  manifestSummary: {
    registeredInputCount: number;
    inputSetSha256: string;
    termFormRegistryFiles: number;
    generatedCaptureFiles: number;
    derivedArtifactFiles: number;
    transformScriptFiles: number;
    renderConsumerFiles: number;
    sourceRecordFiles: number;
    retainedRawFiles: number;
    upstreamRawPresent: boolean;
    coverageManifestPresent: boolean;
    rightsManifestPresent: boolean;
    productionEligiblePanelCount: number;
  };
  rawAvailabilityAudit: {
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
  termFormRegistryAudit: {
    canonicalRegistryPresent: boolean;
    fragments: Array<{
      path: string;
      formsOrQueries: string[];
      policy: string;
    }>;
    separationFindings: string[];
  };
  denominatorAudit: {
    rawMatchCountsAvailable: boolean;
    annualWordTokenTotalsAvailable: boolean;
    commonAnnualWordTokenDenominatorAvailable: boolean;
    corpusReleasePinned: boolean;
    viewerNormalizedOnly: boolean;
    sharedJoinedSpacedScaleAllowed: boolean;
    series: Array<{
      query: string;
      ngramOrder: number;
      denominator: string;
      allowedUnit: string;
      pointCount: number;
      startYear: number;
      endYear: number;
    }>;
    allowedUse: string[];
    prohibitedUse: string[];
  };
  googleOfficialShardFeasibility: {
    status: "NOT_EXECUTED_OFFLINE_AUDIT";
    planningEnvelope: "approximately 1.2 GB";
    repositoryEvidenceForExactShardSize: false;
    officialSourcesOnly: true;
    requirements: string[];
    boundary: string[];
  };
  rawDataManifest: ForeverRawDataManifest;
  findingsRegistry: ForeverFindingsRegistry;
  figureContractRegistry: ForeverFigureContractRegistry;
  requiredRawGaps: ForeverRawGap[];
  untraceableResearchInputs: ForeverUntraceableInput[];
  spotChecks: ForeverSpotCheck[];
  assertions: ForeverValidationAssertion[];
};
