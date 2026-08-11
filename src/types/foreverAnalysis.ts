export type ForeverDataGateStatus =
  | "PASS"
  | "STOP_RAW_DATA_MISSING"
  | "STOP_UNTRACEABLE_TRANSFORM"
  | "STOP_INSUFFICIENT_ANALYTIC_DEPTH";

export type ForeverMissingnessState =
  | "observed_positive"
  | "observed_zero"
  | "absent_or_suppressed"
  | "not_searched"
  | "fetch_failed"
  | "unavailable"
  | "incomparable"
  | "out_of_scope";

export type ForeverDependencyClosure = {
  inputPaths: string[];
  transformIds: string[];
  excludedLegacyPaths: string[];
  closureValidated: boolean;
};

export type ForeverRightsResolution = {
  datasetLevelInheritanceAllowed: true;
  itemLevelOverrideAllowed: true;
  resolved: boolean;
};

export type ForeverGoogleAnnualRateRow = {
  form: "forever" | "for ever";
  ngramOrder: 1 | 2;
  year: number;
  matchCount: number;
  volumeCount: number;
  annualWordTokens: number;
  appearancesPerMillionWordTokens: number;
  state: "observed_positive" | "observed_zero";
  sourceWidePath: string;
  sourceFieldIndex: number;
  annualPath: string;
  annualLine: number;
};

export type ForeverGoogleViewerFacetRow = {
  form: "forever" | "for ever";
  ngramOrder: 1 | 2;
  year: number;
  viewerFraction: number;
  perMillionOrderNgrams: number;
  unit: "per million unigrams" | "per million bigrams";
  state: "observed_positive" | "absent_or_suppressed";
  responsePath: string;
  responseRowIndex: number;
  timeseriesIndex: number;
};

export type ForeverGoogleCoverageRow = {
  form: "forever" | "for ever";
  year: number;
  state: "observed_positive" | "observed_zero" | "absent_or_suppressed" | "unavailable";
};

export type ForeverGooglePairRow = {
  year: number;
  state: "observed_positive" | "observed_zero" | "incomparable";
  joinedRate: number | null;
  spacedRate: number | null;
  joinedShare: number | null;
  rawRatio: number | null;
};

export type ForeverGoogleAcquisitionOutcome =
  | "STOP_GOOGLE_OBJECT_DISCOVERY_FAILED"
  | "STOP_GOOGLE_DOWNLOAD_OR_CHECKSUM_FAILED"
  | "STOP_GOOGLE_RAW_PARSE_FAILED"
  | "STOP_GOOGLE_COMMON_DENOMINATOR_FAILED"
  | "PARTIAL_GOOGLE_VIEWER_CONTRACT_READY"
  | "GOOGLE_COMMON_DENOMINATOR_CONTRACT_READY";

export type ForeverFixedGoogleReleaseAudit = {
  outcome: ForeverGoogleAcquisitionOutcome;
  release: {
    viewerShorthand: "eng_2019";
    persistentIdentifier: "googlebooks-eng-20200217";
    rawReleaseDirectory: "20200217/eng";
    expectedUpperYear: 2019;
  };
  coreFamily: Array<{
    form: "forever" | "for ever";
    ngramOrder: 1 | 2;
    role: "core_joined" | "core_spaced";
  }>;
  optionalRelatedForms: Array<{
    form: "forevermore";
    ngramOrder: 1;
    blocksCorePairEligibility: false;
  }>;
  outOfScopeForms: Array<{
    form: "forever and ever";
    ngramOrder: 3;
    blocksCorePairEligibility: false;
  }>;
  scopeDiagnostics: {
    nonGatingForCorePair: true;
    optionalRelatedFormRegistryValid: boolean;
    outOfScopeTrigramRegistryValid: boolean;
  };
  fixedViewerSeparateFacets: {
    productionEligible: boolean;
    validation: Record<string, boolean>;
    requestPath: string;
    responsePath: string;
    responseSha256: string | null;
    pointCounts: Record<string, number>;
    yearRange: { start: number; end: number } | null;
    observations: ForeverGoogleViewerFacetRow[];
    rawCompatibleSanity: {
      nonGatingForViewerContract: true;
      nonGatingForRawContract: true;
      form: "forever";
      status: "not_available" | "passed" | "failed";
      comparedYears: number;
      absoluteTolerancePpm: number;
      maximumAbsoluteDifferencePpm: number | null;
      sample: {
        year: number;
        rawPerMillionWordTokens: number;
        viewerPerMillionUnigrams: number;
        absoluteDifferencePpm: number;
      } | null;
      passed: boolean | null;
    };
  };
  fixedRawCommonDenominator: {
    productionEligible: boolean;
    validation: Record<string, boolean>;
    activeDependencyInputPaths: string[];
    activeTransformIds: string[];
    excludedLegacyPaths: string[];
    rightsResolvedBy: "dataset-default" | "item-override" | null;
    yearRange: { start: number; end: number } | null;
    coverageByForm: Record<
      string,
      {
        retainedRows: number;
        earliestRetainedYear: number | null;
        latestRetainedYear: number | null;
        observedZeroYears: number;
        absentOrSuppressedYears: number;
        unavailableDenominatorYears: number;
      }
    >;
    annualRates: ForeverGoogleAnnualRateRow[];
    annualCoverage: ForeverGoogleCoverageRow[];
    pairRows: ForeverGooglePairRow[];
  };
};

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
  | "checksum-bound-derived"
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
  status: "audited-blocker" | "audited-limited-result" | "validated-result";
  productionEligible: boolean;
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
  missingnessPolicy: string;
  derivationPolicy: {
    yearCoverage: string;
    minimumDataRule: string;
    smoothingRule: string;
    edgeHandling: string;
    corpusLimitations: string[];
    rawRowLineage: string;
  };
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
  productionEligible: boolean;
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
  missingnessPolicy: string;
  activeDependencyClosure: ForeverDependencyClosure;
  rightsResolution: ForeverRightsResolution;
  localDisclosureRequirements: string[];
  blockedByGapIds: string[];
};

export type ForeverFigureContractRegistry = {
  schemaVersion: string;
  auditId: string;
  dataGate: ForeverDataGateStatus;
  productionEligibleCount: number;
  pageImplementationAuthorized: false;
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
  contractIds?: string[];
  dependencyDisposition?: "active" | "excluded/legacy";
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
  dependencyDisposition: "active" | "excluded/legacy";
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
    productionPanelsAllowed: false;
    pageImplementationAuthorized: false;
    reasons: string[];
    nextEligibleGate: ForeverDataGateStatus;
  };
  missingnessTaxonomy: {
    states: ForeverMissingnessState[];
    sparseRowAbsencePolicy: string;
    observedZeroEvidenceRule: string;
  };
  fixedGoogleReleaseAudit: ForeverFixedGoogleReleaseAudit;
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
    fixedViewerSeparateFacetsEligible: boolean;
    fixedRawCommonDenominatorEligible: boolean;
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
    status: "DISCOVERY_EXECUTED" | "ACQUISITION_VALIDATED";
    planningEnvelope: string;
    repositoryEvidenceForExactShardSize: boolean;
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
