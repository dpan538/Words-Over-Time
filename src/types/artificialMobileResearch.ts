export type ArtificialMissingnessState =
  | "observed_positive"
  | "observed_zero"
  | "absent_or_suppressed"
  | "not_searched"
  | "fetch_failed"
  | "unavailable"
  | "incomparable"
  | "out_of_scope";

export type ArtificialInputRole =
  | "raw_capture"
  | "source_record"
  | "mobile_frozen_input"
  | "legacy_processed_excluded"
  | "legacy_transform_excluded"
  | "research_note"
  | "transform"
  | "legacy_design_excluded"
  | "system_excluded";

export type ArtificialInputInventoryEntry = {
  path: string;
  sha256: string;
  bytes: number;
  lineCount: number | null;
  role: ArtificialInputRole;
  activeDependency: boolean;
  exclusionReason: string | null;
};

export type ArtificialFinding = {
  id: string;
  question: string;
  result: string;
  rawFields: string[];
  filters: string[];
  grouping: string;
  denominator: string;
  transform: string;
  unit: string;
  caveat: string;
  sourceRows: string[];
  contractIds: string[];
};

export type ArtificialFigureContract = {
  id: string;
  movementId: string;
  order: 1 | 2 | 3 | 4 | 5;
  title: string;
  findingId: string;
  researchQuestion: string;
  sourceFilesAndFields: string[];
  recordGranularityAndN: string;
  filters: string[];
  grouping: string;
  denominator: string;
  formula: string;
  unit: string;
  visualChannelMapping: string[];
  validInterpretation: string;
  prohibitedInterpretation: string[];
  missingnessPolicy: string;
  sourceAndRightsBoundary: string;
  referenceMapping: string;
  interactionContract: string;
  crossEditionCompatibilityReviewId: string | null;
  productionEligible: boolean;
  blocker: string | null;
};

export type ArtificialCrossEditionCompatibilityReview = {
  id: string;
  mobileFindingId: string;
  desktopConclusionId: string;
  desktopConclusion: string;
  mobileConclusion: string;
  sharedFactScope: string;
  relationship: "compatible_reframing" | "compatible_extension" | "different_scope_no_conflict";
  compatibilityRationale: string;
  mobileFrameworkDifference: string;
  prohibitedMobileClaim: string;
  conflictDetected: false;
};

export type ArtificialNarrativeMovement = {
  id: string;
  order: 1 | 2 | 3 | 4 | 5;
  workingTitle: string;
  publicQuestion: string;
  oneSentenceFinding: string;
  figureContractId: string;
  requiredReference: string;
  visualGrammar: string;
  interaction: string;
  flipCardsProhibited: true;
  status: "supported" | "provisional_data_gate";
};

export type ArtificialMobileResearchArtifact = {
  schemaVersion: "1.6.0";
  auditId: "artificial-mobile-raw-research-2026-08-13";
  generatedFromFrozenInputs: true;
  pageImplementationAuthorized: true;
  pageImplementationStarted: true;
  predesignApprovedByUser: true;
  researchIndependence: {
    mobileResearchAuthority: true;
    desktopResearchAuthority: false;
    mobileFrozenInputPath: string;
    mobileTransformPath: string;
    activeRawSourceCount: number;
    activeLegacyProcessedDependencyCount: 0;
    renderedComponentsConsumeTypedArtifactOnly: true;
    desktopCompatibilityReviewOnly: true;
    desktopInputsUsedForFindingDerivation: false;
  };
  crossEditionCompatibility: {
    policy: "independent_framework_compatible_conclusions";
    desktopResearchAuthorityForMobileDerivation: false;
    desktopPublishedSnapshot: Array<{ path: string; sha256: string }>;
    reviewedProductionFindingCount: number;
    conflictCount: 0;
    publicationRule: string;
    reviews: ArtificialCrossEditionCompatibilityReview[];
  };
  principalQuestion: string;
  missingnessTaxonomy: ArtificialMissingnessState[];
  manifestSummary: {
    inventoriedFileCount: number;
    activeDependencyCount: number;
    rawCaptureCount: number;
    mobileFrozenInputCount: number;
    legacyProcessedExcludedCount: number;
    legacyDesignExcludedCount: number;
    inputSetSha256: string;
  };
  viewerDenominatorAudit: {
    captureType: "Google Books Ngram Viewer normalized fraction";
    corpusAlias: "en";
    releasePinned: false;
    yearCoverage: { start: number; end: number };
    ngramOrders: number[];
    allowedUses: string[];
    prohibitedUses: string[];
    productionBlocker: string;
  };
  researchCoverage: {
    selectedTermCount: number;
    retainedTermYearCellCount: number;
    compoundTermCount: number;
    compoundTermYearCellCount: number;
    compoundYearCoverage: { start: number; end: number };
    mediaTermCount: number;
    mediaTermYearCellCount: number;
    mediaYearCoverage: { start: number; end: number };
    unit: "one selected exact term in one retained year";
    allowedPublicUse: "method footprint only";
  };
  originEvidence: {
    claimCount: number;
    publicCoreClaims: Array<{ claim: string; status: string; evidenceStrength: string; source: string }>;
    methodologicalBoundaryClaims: Array<{ claim: string; status: string; evidenceStrength: string; source: string }>;
    useWithCareClaims: Array<{ claim: string; status: string; risk: string }>;
    excludedClaims: Array<{ claim: string; status: string; risk: string }>;
    excludedClaimCount: number;
  };
  phraseVocabulary: {
    exactPhraseCount: number;
    domains: Array<{
      domain: string;
      termCount: number;
      termNames: string[];
    }>;
    allowedPublicUse: "equal-mark selected vocabulary map only";
  };
  compoundFamily: {
    registeredArtificialPrefixTermCount: number;
    domains: Array<{
      domain: string;
      termCount: number;
      termNames: string[];
      earliestPeakYear: number;
      latestPeakYear: number;
      medianPeakYear: number;
      peakYearBins: Array<{ startYear: number; endYear: number; termCount: number }>;
    }>;
    terms: Array<{
      term: string;
      ngramOrder: number;
      domain: string;
      peakYear: number;
      peakViewerFraction: number;
      latestYear: number;
      latestViewerFraction: number;
      positiveYearCount: number;
      absentOrSuppressedYearCount: number;
      ownPeakDecadeShape: Array<{ decade: number; percentOfOwnPeak: number | null; state: ArtificialMissingnessState }>;
      sourceRows: string[];
    }>;
  };
  mediaShift: {
    selectedTermCount: number;
    eras: Array<{
      era: "optical_apparatus" | "sound_and_cinema" | "broadcast" | "digital_simulation";
      label: string;
      termCount: number;
      termNames: string[];
    }>;
    terms: Array<{
      term: string;
      ngramOrder: number;
      era: "optical_apparatus" | "sound_and_cinema" | "broadcast" | "digital_simulation";
      peakYear: number;
      firstPositiveYear: number;
      positiveYearCount: number;
      sourceRows: string[];
    }>;
  };
  suspicionTransfer: {
    anchorCount: number;
    anchors: Array<{
      period: string;
      phrases: string[];
      domain: string;
      negativeCharge: number;
      strength: string;
      source: string;
      sourceType: string;
      sourceUrl: string;
    }>;
    modelAssessment: Array<{ model: string; status: string; confidence: string; notes: string }>;
  };
  semanticMobility: {
    candidateStatementCount: number;
    distinctUrlCount: number;
    selectedCaseCount: number;
    unit: "one selected source-bound semantic case";
    caveat: string;
    views: Array<{
      id: string;
      relationFamily: "artificial_vs_fake" | "realistic_bridge" | "simulated_context";
      axisLabel: string;
      title: string;
      summary: string;
      sourceName: string;
      sourceType: string;
      sourceUrl: string;
      yearOrPeriod: string;
    }>;
  };
  humanContinuation: {
    evidenceRecordCount: number;
    markedEvidenceRecordCount: number;
    contextRecordCount: number;
    evidenceExamples: Array<{
      id: string;
      term: string;
      layerNumber: number;
      functionMode: "support" | "replacement" | "continuation" | "simulation" | "speculative_extension";
      currentRelevance: "modern_established" | "modern_emerging" | "historical" | "speculative";
      confidence: "high" | "medium";
      sourceName: string;
      sourceType: string;
      sourceUrl: string;
      yearOrPeriod: string;
      evidenceKind: string;
      shortSummary: string;
    }>;
    functionGroups: Array<{
      id: "support" | "replacement" | "continuation" | "modeled_processes" | "speculative_extensions";
      label: string;
      evidenceCount: number;
    }>;
    evidenceProfile: {
      highConfidenceCount: number;
      mediumConfidenceCount: number;
      establishedCount: number;
      emergingCount: number;
      historicalCount: number;
      speculativeCount: number;
      supportAndReplacementEstablishedCount: number;
      supportAndReplacementCount: number;
      speculativeExtensionEstablishedCount: number;
      speculativeExtensionCount: number;
      maturityByFunction: Array<{
        functionMode: "support" | "replacement" | "continuation" | "simulation" | "speculative_extension";
        label: string;
        totalCount: number;
        establishedCount: number;
        emergingCount: number;
        historicalCount: number;
        speculativeCount: number;
      }>;
    };
    layers: Array<{
      layerNumber: number;
      id: string;
      label: string;
      evidenceCount: number;
      confidence: string;
      anchorTerms: string[];
    }>;
  };
  newMobileOnlyAnalysis: string[];
  findings: ArtificialFinding[];
  figureContracts: ArtificialFigureContract[];
  narrativeMovements: ArtificialNarrativeMovement[];
  referenceRegistry: Array<{
    id: string;
    suppliedPath: string;
    mandatoryCharacteristics: string[];
    assignedMovementId: string;
  }>;
  spotChecks: Array<{
    id: string;
    actual: number | string | boolean;
    expected: number | string | boolean;
    passed: boolean;
    lineage: string;
  }>;
};
