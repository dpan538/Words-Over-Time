export type PrivacyMissingnessState =
  | "observed_positive"
  | "observed_zero"
  | "absent_or_suppressed"
  | "not_searched"
  | "fetch_failed"
  | "unavailable"
  | "incomparable"
  | "out_of_scope";

export type PrivacySourceManifestEntry = {
  id: string;
  path: string;
  sha256: string;
  role: "active_input" | "supporting_input" | "excluded_input" | "transform";
  sourceFamily: string;
  recordGranularity: string;
  recordCount: number | null;
  coverage: string;
  rightsBoundary: string;
  activeContractIds: string[];
  exclusionReason: string | null;
};

export type PrivacyFinding = {
  id: string;
  question: string;
  result: string;
  rawFields: string[];
  filters: string[];
  grouping: string;
  denominator: string;
  transform: string;
  caveat: string;
  sourceRows: string[];
  contractIds: string[];
};

export type PrivacyFigureContract = {
  id: string;
  movement: "movement-a-attention" | "movement-b-infrastructure";
  moduleOrder: 1 | 2 | 3 | 4 | 5;
  title: string;
  researchQuestion: string;
  findingId: string;
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
  cardBehavior: string;
  productionEligible: boolean;
  blocker: string | null;
};

export type PrivacyMobileAnalysis = {
  schemaVersion: "1.0.0";
  auditId: "privacy-mobile-2026-08-12";
  generatedFromFrozenInputs: true;
  implementationAuthorized: false;
  principalQuestion: string;
  missingnessTaxonomy: PrivacyMissingnessState[];
  sourceManifest: PrivacySourceManifestEntry[];
  attention: {
    source: "Wikimedia Pageviews API";
    startYear: 2018;
    endYear: 2025;
    excludedPartialYear: 2026;
    excludedCoverageTopics: Array<{ page: string; state: "unavailable"; reason: string }>;
    topics: Array<{
      page: string;
      label: string;
      category: "concept" | "governance" | "pressure";
      totalViews: number;
      shareOfSelectedInventoryPercent: number;
      peakYear: number;
      peakViews: number;
      latestVsPeakPercent: number;
      yearly: Array<{ year: number; views: number; percentOfTopicPeak: number; state: "observed_positive" | "observed_zero" }>;
    }>;
    categoryYearly: Array<{
      year: number;
      concept: number;
      governance: number;
      pressure: number;
      total: number;
      conceptSharePercent: number;
      governanceSharePercent: number;
      pressureSharePercent: number;
    }>;
  };
  policyCorpus: {
    terms: string[];
    minimumTokenRule: number;
    includedDocumentCount: number;
    excludedDocumentCount: number;
    documents: Array<{
      id: string;
      label: string;
      url: string;
      rawPath: string;
      tokenCount: number;
      matchedPhraseCount: number;
      terms: Array<{ term: string; count: number; perTenThousandTokens: number; shareOfRegisteredPhraseHitsPercent: number; state: "observed_positive" | "observed_zero" }>;
    }>;
    excludedDocuments: Array<{ id: string; tokenCount: number; state: "absent_or_suppressed"; reason: string }>;
  };
  anchorLedger: {
    inclusionRule: string;
    includedCount: number;
    excludedCount: number;
    transferCount: number;
    transferSharePercent: number;
    routeCounts: Array<{ routeId: string; anchorCount: number; shareOfAnchorsPercent: number }>;
    anchors: Array<{
      id: string;
      year: number;
      label: string;
      routeIds: string[];
      isTransfer: boolean;
      sourceTitle: string;
      sourceUrl: string;
      sourceStatus: number;
    }>;
  };
  coverageAudit: Array<{
    layerId: string;
    state: PrivacyMissingnessState;
    productionUse: string;
    reason: string;
  }>;
  coverageSummary: Array<{
    id: "used" | "thin" | "different" | "outside";
    layerCount: number;
    shareOfAuditedLayersPercent: number;
    layerIds: string[];
  }>;
  findings: PrivacyFinding[];
  figureContracts: PrivacyFigureContract[];
  spotChecks: Array<{
    id: string;
    actual: number | string | boolean;
    expected: number | string | boolean;
    passed: boolean;
    lineage: string;
  }>;
};
