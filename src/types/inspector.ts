export type InspectorDataBlock = {
  label: string;
  value: string | number;
  detail?: string;
};

export type InspectorSource = {
  label: string;
  url?: string;
  dateRange?: string;
  rightsStatus?: string;
};

export type InspectorEntry = {
  id: string;
  title: string;
  visualType: string;
  elementType: string;
  period: string;
  dataLayer: "raw" | "computed" | "curated" | "interpretive";
  selectionReason: string;
  evidenceCount: number;
  documentFrequency?: number;
  scoreType?: string;
  scoreValue?: number;
  sourceCorpus: string;
  coverageRange: string;
  relatedSnippetIds: string[];
  rawInputs: InspectorDataBlock[];
  derivedValues: InspectorDataBlock[];
  curatedDecisions: InspectorDataBlock[];
  visualMapping: string;
  explanation: string;
  sources: InspectorSource[];
  caveats: string[];
};

export type VisualElementMeta = {
  inspectorId: string;
  title: string;
  subtitle?: string;
};
