export type ForeverMobileForm = "forever" | "for ever";

export type ForeverMobileMetricId = "rate" | "reach" | "repeat";

export type ForeverMobileRawLineage = {
  annualPaths: [string, string];
  annualLineNumbers: number[];
  totalcountsPath: string;
  totalcountYears: number[];
};

export type ForeverMobileDecade = {
  id: string;
  label: string;
  startYear: number;
  endYear: number;
  completeYears: number;
  joinedMatchCount: number;
  spacedMatchCount: number;
  joinedVolumeCount: number;
  spacedVolumeCount: number;
  corpusWordTokens: number;
  corpusVolumes: number;
  joinedRatePerMillionWords: number;
  spacedRatePerMillionWords: number;
  combinedRatePerMillionWords: number;
  joinedShareOfExactFormAppearances: number;
  joinedReachPerMillionVolumes: number;
  spacedReachPerMillionVolumes: number;
  joinedAppearancesPerContainingVolume: number;
  spacedAppearancesPerContainingVolume: number;
  visual: {
    combinedOnSeventyPercent: number;
    joinedOnSeventyPercent: number;
    spacedOnSeventyPercent: number;
  };
  lineage: ForeverMobileRawLineage;
};

export type ForeverMobileAnnualTurn = {
  year: number;
  joinedMatchCount: number;
  spacedMatchCount: number;
  corpusWordTokens: number;
  joinedRatePerMillionWords: number;
  spacedRatePerMillionWords: number;
  joinedShareOfExactFormAppearances: number;
  joinedReachPerMillionVolumes: number;
  spacedReachPerMillionVolumes: number;
  role: "lead-in" | "first_crossing" | "reversal" | "sustained_crossing" | "confirmation";
  visual: {
    joinedSharePercent: number;
    spacedSharePercent: number;
  };
  lineage: ForeverMobileRawLineage;
};

export type ForeverMobileRailCard = {
  id: string;
  railId: "rail-a" | "rail-b" | "rail-c";
  label: string;
  scope: string;
  value: number;
  displayValue: string;
  unit: string;
  micro: {
    kind: "stacked-rate" | "form-composition" | "factor-strip";
    primaryPercent: number;
    secondaryPercent: number;
  };
  definition: string;
  interpretation: string;
  caveat: string;
  source: string;
};

export type ForeverMobileMetricCondition = {
  id: ForeverMobileMetricId;
  label: "RATE" | "REACH" | "REPEAT";
  unit: string;
  displayUnit: string;
  domain: { min: 0; max: number };
  ratio2010s: number;
  headline: string;
  interpretation: string;
  decades: Array<{
    id: string;
    label: string;
    joinedValue: number;
    spacedValue: number;
    joinedDisplayValue: string;
    spacedDisplayValue: string;
    joinedPercent: number;
    spacedPercent: number;
    extensionPercent: number;
  }>;
};

export type ForeverMobileSpotCheck = {
  id: string;
  actual: number | string | boolean;
  expected: number | string | boolean;
  tolerance: number | null;
  passed: boolean;
  lineage: string;
};

export type ForeverMobileAnalysis = {
  schemaVersion: "1.0.0";
  generatedFromFrozenInputs: true;
  release: {
    viewerShorthand: "eng_2019";
    persistentIdentifier: "googlebooks-eng-20200217";
    rawReleaseDirectory: "20200217/eng";
    analysisWindow: { start: 1800; end: 2019 };
    exactForms: [
      { form: "forever"; ngramOrder: 1 },
      { form: "for ever"; ngramOrder: 2 },
    ];
  };
  units: {
    rate: string;
    reach: string;
    repeat: string;
  };
  caveats: string[];
  decades: ForeverMobileDecade[];
  annualFirstTurn: ForeverMobileAnnualTurn[];
  milestones: {
    peak1820s: ForeverMobileDecade;
    balance1880s: ForeverMobileDecade;
    majority1890s: ForeverMobileDecade;
    low1980s: ForeverMobileDecade;
    return2010s: ForeverMobileDecade;
    peakToLowPercentChange: number;
    lowToReturnFactor: number;
    returnBelowPeakPercent: number;
  };
  firstTransition: {
    from: "1880s";
    to: "1890s";
    joinedRatePercentChange: number;
    spacedRatePercentChange: number;
    combinedRatePercentChange: number;
    joinedSharePercentagePointChange: number;
    firstCrossingYear: 1884;
    reversalYear: 1885;
    sustainedCrossingYear: 1886;
    firstSustainedReachLeadYear: 1886;
  };
  secondTransition: {
    from: "1980s";
    to: "2010s";
    joinedRateFactor: number;
    spacedRateFactor: number;
    combinedRateFactor: number;
    joinedReachFactor: number;
    spacedReachFactor: number;
    joinedRepeatFactor: number;
    spacedRepeatFactor: number;
    corpusWordsPerVolumeFactor: number;
    shareBand1990sTo2010s: {
      minimum: number;
      maximum: number;
      widthPercentagePoints: number;
      combinedRateFactor: number;
    };
    ratios2010s: {
      rate: number;
      reach: number;
      repeat: number;
    };
  };
  longArcAnchors: ForeverMobileDecade[];
  metricConditions: ForeverMobileMetricCondition[];
  rails: {
    railA: ForeverMobileRailCard[];
    railB: ForeverMobileRailCard[];
    railC: ForeverMobileRailCard[];
  };
  closingFinding: {
    title: string;
    sentence: string;
    rateRatio: number;
    repeatRatio: number;
  };
  figureContracts: Array<{
    id: "F01" | "F02" | "F03" | "F04";
    productionEligible: true;
    findingKey: string;
    generatedDataKeys: string[];
    sourcePaths: string[];
    transform: string;
    denominator: string;
    unit: string;
    missingnessPolicy: string;
    validInterpretation: string;
    prohibitedInterpretation: string;
  }>;
  spotChecks: ForeverMobileSpotCheck[];
};
