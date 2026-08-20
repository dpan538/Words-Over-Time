export type DataMobilePeriodId =
  | "1850_1899"
  | "1930_1949"
  | "1950_1969"
  | "1970_1989"
  | "1990_2004"
  | "2005_2019";

export type DataMobileSource = {
  id: string;
  title: string;
  organization: string;
  url: string;
  role: string;
};

export type DataMobileExperience = {
  schemaVersion: "1.1.0";
  auditId: "data-mobile-experience-2026-08-18";
  generatedFromFrozenInputs: true;
  predesignApproved: true;
  implementationAuthorized: true;
  narrativeId: "from-given-to-made-v4";
  corpus: {
    label: "Google Books English 2019";
    release: "googlebooks-eng-20200217";
    numericId: 26;
    startYear: 1800;
    endYear: 2019;
    smoothing: 0;
    unit: "uses per million bigrams";
  };
  scope: {
    selectedProbeCount: number;
    returnedCrossCorpusSeriesCount: number;
    morphStartYear: 1950;
    morphEndYear: 2019;
    morphYearCount: 70;
  };
  mass: {
    amountShare: Array<{ decade: "1940s" | "2010s"; percent: number }>;
    singularAgreementShare: Array<{ decade: "1940s" | "2010s"; percent: number }>;
    includedAgreementPairs: string[];
    excludedAmbiguousPair: string;
  };
  cut: {
    earlyPeriod: "1950_1969";
    latePeriod: "2005_2019";
    unit: "per million bigrams";
    items: Array<{
      id: "sheets" | "points" | "sources" | "types";
      label: string;
      early: number;
      late: number;
    }>;
  };
  packaged: {
    periods: Array<"1950_1969" | "1970_1989" | "1990_2004" | "2005_2019">;
    unit: "selected exact forms, summed uses per million bigrams";
    sharedDomainMax: number;
    totals: Array<{ period: "1950_1969" | "1970_1989" | "1990_2004" | "2005_2019"; value: number }>;
    terms: Array<{
      id: "database" | "databank" | "dataset" | "metadata";
      label: string;
      values: number[];
      late: number;
    }>;
  };
  morph: {
    startYear: 1950;
    endYear: 2019;
    unit: "per million bigrams";
    sharedDomainMax: number;
    points: Array<{
      year: number;
      decadeIndex: number;
      yearIndex: number;
      given: number;
      collected: number;
    }>;
    givenPeak: { year: number; perMillion: number };
    collectedPeak: { year: number; perMillion: number };
    comparisons: Array<{
      period: "1950_1969" | "2005_2019";
      given: number;
      collected: number;
    }>;
  };
  named: {
    startYear: 1950;
    endYear: 2019;
    yearCount: 70;
    sharedDomainMax: number;
    periods: Array<"1850_1899" | "1930_1949" | "1970_1989" | "2005_2019">;
    unit: "per million bigrams";
    terms: Array<{
      id: "sufficient" | "available" | "raw" | "missing" | "sensitive";
      label: string;
      values: number[];
      late: number;
      annualPoints: Array<{
        year: number;
        value: number;
      }>;
    }>;
  };
  ruled: {
    period: "2005_2019";
    unit: "normalized per-million bigram values in separately labelled corpora";
    terms: Array<{
      id: "protection" | "personal" | "privacy";
      label: string;
      american: number;
      british: number;
      britishToAmericanRatio: number;
    }>;
  };
  made: {
    periods: Array<"1950_1969" | "1970_1989" | "1990_2004" | "2005_2019">;
    unit: "per million bigrams";
    terms: Array<{
      id: "entry" | "cleaning" | "labeling" | "annotation";
      label: string;
      facet: "entry" | "small";
      values: number[];
      late: number;
    }>;
  };
  sources: DataMobileSource[];
  lineage: Array<{
    path: string;
    sha256: string;
    role: "active_input" | "transform";
  }>;
};
