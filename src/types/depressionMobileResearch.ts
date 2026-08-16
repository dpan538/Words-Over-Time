export type DepressionMobilePoint = {
  year: number;
  value: number;
};

export type DepressionRotaryAnnualPoint = {
  year: number;
  value: number | null;
};

export type DepressionRotarySeries = {
  key: "business" | "financial" | "economic";
  label: string;
  family: "phrase";
  color: string;
  yDomain: [0, number];
  points: DepressionRotaryAnnualPoint[];
  peak: {
    year: number;
    value: number;
  };
};

export type DepressionRotaryInterludeData = {
  id: "rotary-interlude";
  kind: "rotary-interlude";
  code: "03A";
  period: [1874, 1939];
  background: "#EEE7DD";
  unit: "appearances per million corpus words";
  series: DepressionRotarySeries[];
};

export type DepressionMobileSeries = {
  id: string;
  label: string;
  color: string;
  unit: "appearances per million corpus words";
  points: DepressionMobilePoint[];
};

export type DepressionMobileMetric = {
  label: string;
  detail: string;
  value: number;
  precision: number;
};

export type DepressionMobileAttestation = {
  year: number;
  label: string;
  sense: string;
  source: string;
  confidence: "medium" | "high" | "low";
};

export type DepressionMobileAnnotation = {
  year?: number;
  label: string;
  detail: string;
};

export type DepressionMobileEvent = {
  startYear: number;
  endYear: number;
  label: string;
  role: string;
};

export type DepressionMobileChartKind =
  | "anchors"
  | "comparison-bars"
  | "smoothed-lines"
  | "crossover-lines"
  | "phrase-multiples"
  | "lollipop"
  | "crisis-multiples"
  | "plateau-bars"
  | "clinical-multiples"
  | "diagnostic-multiples"
  | "modern-contrast";

export type DepressionMobileChart = {
  id: string;
  kind: DepressionMobileChartKind;
  title: string;
  accessibleSummary: string;
  unitLabel: string;
  transform: string;
  period: [number, number];
  series?: DepressionMobileSeries[];
  metrics?: DepressionMobileMetric[];
  attestations?: DepressionMobileAttestation[];
  annotations?: DepressionMobileAnnotation[];
  events?: DepressionMobileEvent[];
  yMaximum?: number;
  sharedDomain?: boolean;
  caveat: string;
};

export type DepressionMobileChapter = {
  id: "roots" | "print" | "crossover" | "crisis" | "plateau" | "labels";
  order: 1 | 2 | 3 | 4 | 5 | 6;
  code: string;
  periodLabel: string;
  background: string;
  semanticLabel: string;
  title: string;
  deck: string;
  visibleCaveat: string;
  summary: DepressionMobileChart;
  detail: DepressionMobileChart;
};

export type DepressionMobileSource = {
  label: string;
  url: string;
  use: string;
};

export type DepressionMobileResearch = {
  schemaVersion: "2.1.0";
  generatedAt: string;
  title: string;
  thesis: string;
  closingFinding: string;
  chapters: DepressionMobileChapter[];
  rotaryInterlude: DepressionRotaryInterludeData;
  sources: DepressionMobileSource[];
  methods: string[];
  caveats: string[];
  rights: string[];
};
