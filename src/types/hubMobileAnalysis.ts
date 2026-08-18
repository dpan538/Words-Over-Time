export type HubFamilyId =
  | "mechanical_core"
  | "central_place"
  | "transport_routing"
  | "institutional_cluster"
  | "network_system"
  | "digital_platform";

export type HubPeriodId =
  | "1900_1919"
  | "1920_1939"
  | "1940_1959"
  | "1960_1979"
  | "1980_1999"
  | "2000_2019";

export type HubPeriodValue = {
  periodId: HubPeriodId;
  meanFrequencyPerMillion: number;
  visible: boolean;
};

export type HubFigureContract = {
  id: "hub-m01" | "hub-m02" | "hub-m03" | "hub-m04" | "hub-m05" | "hub-m06";
  moduleOrder: 1 | 2 | 3 | 4 | 5 | 6;
  title: string;
  researchQuestion: string;
  sourceFilesAndFields: string[];
  filters: string[];
  grouping: string;
  denominator: string;
  formula: string;
  unit: string;
  visualChannelMapping: string[];
  missingnessPolicy: string;
  caveat: string;
  productionEligible: boolean;
};

export type HubMobileAnalysis = {
  schemaVersion: "1.0.0";
  auditId: "hub-mobile-2026-08-16";
  generatedFromFrozenInputs: true;
  implementationAuthorized: true;
  principalQuestion: string;
  querySettings: {
    yearStart: 1800;
    yearEnd: 2022;
    corpus: "en";
    smoothing: 0;
    caseInsensitive: true;
  };
  thresholdPerMillion: number;
  eligiblePhraseCount: number;
  exclusions: {
    failedQueries: string[];
    rule: string;
  };
  periods: Array<{
    id: HubPeriodId;
    label: string;
    shortLabel: string;
    startYear: number;
    endYear: number;
  }>;
  visibility: Array<{
    periodId: HubPeriodId;
    visiblePhraseCount: number;
    visibleSharePercent: number;
  }>;
  families: Array<{
    id: HubFamilyId;
    label: string;
    color: string;
    eligiblePhraseCount: number;
    firstVisiblePeriodId: HubPeriodId;
    currentVisibleSharePercent: number;
    periods: Array<{
      periodId: HubPeriodId;
      meanFrequencyPerMillion: number;
      visiblePhraseCount: number;
      visibleSharePercent: number;
    }>;
  }>;
  phrases: Array<{
    term: string;
    familyId: HubFamilyId;
    familyLabel: string;
    periods: HubPeriodValue[];
    persistencePeriodCount: number;
    changeFrom1980sPerMillion: number;
    direction: "rising" | "falling";
    trajectoryLabel: string;
    featured: boolean;
  }>;
  quadrantSummary: Array<{
    id: "new_rising" | "enduring_rising" | "enduring_falling" | "new_falling";
    label: string;
    phraseCount: number;
  }>;
  evidence: Array<{
    id: string;
    year: number;
    term: string;
    senseLabel: string;
    summary: string;
    evidenceKind: "historical_dictionary" | "direct_text" | "corpus_evidence" | "dictionary_claim";
    confidence: "high" | "medium" | "low";
    sourceTitle: string;
    sourceUrl: string;
    caveat: string;
  }>;
  figureContracts: HubFigureContract[];
  sourceManifest: Array<{
    path: string;
    sha256: string;
    role: "active_input" | "transform";
  }>;
  spotChecks: Array<{
    id: string;
    actual: number | string | boolean;
    expected: number | string | boolean;
    passed: boolean;
  }>;
};
