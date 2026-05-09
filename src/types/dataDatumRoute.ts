export type DatumRouteTrackId =
  | "entry"
  | "fork"
  | "plural_evidentiary"
  | "singular_infrastructural"
  | "extension";

export type DatumRouteNodeLevel = "major" | "secondary" | "annotation";

export type DatumRouteNode = {
  id: string;
  label: string;
  level: DatumRouteNodeLevel;
  track: DatumRouteTrackId;
  role: string;
  x: number;
  y: number;
  note: string;
  sourceTermSlug?: string;
  evidenceSummary?: string;
  firstAttestation?: string | null;
  firstStrongVisibility?: string | null;
};

export type DatumRouteEdge = {
  id: string;
  source: string;
  target: string;
  role: string;
  style: "solid" | "arc" | "dashed";
  emphasis: "primary" | "secondary" | "quiet";
  curvature: number;
  label?: string;
};

export type DatumRouteTrack = {
  id: "plural_evidentiary" | "singular_infrastructural";
  label: string;
  description: string;
  color: string;
  y: number;
};

export type DatumRouteAnnotation = {
  id: string;
  anchorNode: string;
  title: string;
  text: string;
  x: number;
  y: number;
};

export type DatumRouteEvidence = {
  anchorNode: string;
  label: string;
  summary: string;
  metrics: Record<string, number | string | null>;
};

export type DatumRouteSparklinePoint = {
  year: number;
  value: number;
  normalized: number;
};

export type DatumRouteSparklineSeries = {
  id: string;
  label: string;
  color: string;
  points: DatumRouteSparklinePoint[];
};

export type DataDatumRouteDataset = {
  word: "data";
  chartId: string;
  generatedAt: string;
  sourceInputs: string[];
  metadata: {
    title: string;
    subtitle: string;
    thesis: string;
    caveat: string;
  };
  tracks: DatumRouteTrack[];
  nodes: DatumRouteNode[];
  edges: DatumRouteEdge[];
  annotations: DatumRouteAnnotation[];
  evidence: DatumRouteEvidence[];
  sparkline: {
    unit: string;
    corpus: string;
    source: string;
    startYear: number;
    endYear: number;
    series: DatumRouteSparklineSeries[];
    crossingYear: number | null;
    crossingLabel: string;
    crossingMarker?: {
      year: number;
      normalized: number | null;
      ratio: number | null;
    };
  };
};
