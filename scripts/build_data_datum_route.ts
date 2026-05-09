import fs from "node:fs";
import path from "node:path";

type GrammarPoint = {
  year: number;
  value: number;
  frequencyPerMillion: number;
};

type GrammarSeries = {
  series_id: string;
  term: string;
  term_slug: string;
  corpus: string;
  corpus_label: string;
  data_quality_status: string;
  points: GrammarPoint[];
};

type TermRecord = {
  term: string;
  branch: string;
  domain: string;
  visual_role: string;
  data_layer: string;
  confidence_level: string;
  first_attestation: string | null;
  first_strong_visibility: string | null;
  notes: string;
  caveat: string;
  source_ids: string[];
  slug: string;
};

type CoverageRecord = {
  term: string;
  term_slug: string;
  coverage_status: string;
  best_source_type: string;
  needs_manual_review: boolean;
  recommended_visual_status: string;
  reason: string;
  caveat: string;
  data_layer: string;
  source_ids: string[];
};

type NodeLevel = "major" | "secondary" | "annotation";
type TrackId = "entry" | "fork" | "plural_evidentiary" | "singular_infrastructural" | "extension";

type RouteNode = {
  id: string;
  label: string;
  level: NodeLevel;
  track: TrackId;
  role: string;
  x: number;
  y: number;
  note: string;
  sourceTermSlug?: string;
  evidenceSummary?: string;
  firstAttestation?: string | null;
  firstStrongVisibility?: string | null;
};

type RouteEdge = {
  id: string;
  source: string;
  target: string;
  role: string;
  style: "solid" | "arc" | "dashed";
  emphasis: "primary" | "secondary" | "quiet";
  curvature: number;
  label?: string;
};

const ROOT = process.cwd();
const GENERATED = path.join(ROOT, "src/data/generated");

function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(path.join(GENERATED, file), "utf8")) as T;
}

function round(value: number, places = 3) {
  return Number(value.toFixed(places));
}

function average(points: GrammarPoint[], start: number, end: number) {
  const selected = points.filter((point) => point.year >= start && point.year <= end);
  if (!selected.length) return null;
  return round(selected.reduce((sum, point) => sum + point.frequencyPerMillion, 0) / selected.length);
}

function pointAt(points: GrammarPoint[], year: number) {
  const point = points.find((item) => item.year === year);
  return point ? round(point.frequencyPerMillion) : null;
}

function normalizedAt(points: GrammarPoint[], year: number, max: number) {
  const point = points.find((item) => item.year === year);
  return point ? round(point.frequencyPerMillion / max, 4) : null;
}

function crossingYear(earlier: GrammarSeries, later: GrammarSeries, startYear = 1900) {
  const laterByYear = new Map(later.points.map((point) => [point.year, point]));
  let previous: { year: number; diff: number } | null = null;

  for (const point of earlier.points) {
    if (point.year < startYear) continue;
    const next = laterByYear.get(point.year);
    if (!next) continue;
    const diff = next.frequencyPerMillion - point.frequencyPerMillion;
    if (previous && previous.diff < 0 && diff >= 0) {
      return point.year;
    }
    previous = { year: point.year, diff };
  }

  return null;
}

function termSummary(term: TermRecord | undefined, coverage: CoverageRecord | undefined) {
  return {
    firstAttestation: term?.first_attestation ?? null,
    firstStrongVisibility: term?.first_strong_visibility ?? null,
    evidenceSummary: coverage
      ? `${coverage.coverage_status}; ${coverage.best_source_type}; ${coverage.reason}`
      : term?.notes,
  };
}

function grammarSeries(series: GrammarSeries[], term: string, corpus = "en") {
  const match = series.find((item) => item.term === term && item.corpus === corpus);
  if (!match) throw new Error(`Missing grammar series: ${term}/${corpus}`);
  return match;
}

function downsampleSparkline(series: GrammarSeries, max: number, start = 1950, end = 2022, step = 4) {
  const sampled = series.points.filter(
    (point) => point.year >= start && point.year <= end && (point.year === end || (point.year - start) % step === 0),
  );
  return sampled.map((point) => ({
    year: point.year,
    value: round(point.frequencyPerMillion),
    normalized: round(point.frequencyPerMillion / max, 4),
  }));
}

const grammarUsage = readJson<{ generatedAt: string; caveat: string; series: GrammarSeries[] }>(
  "data_grammar_usage.json",
);
const termData = readJson<{ terms: TermRecord[] }>("data_terms.json");
const coverageData = readJson<{ term_coverage: CoverageRecord[] }>("data_coverage_report.json");

const termsBySlug = new Map(termData.terms.map((term) => [term.slug, term]));
const coverageBySlug = new Map(coverageData.term_coverage.map((term) => [term.term_slug, term]));

const dataAre = grammarSeries(grammarUsage.series, "data are");
const dataIs = grammarSeries(grammarUsage.series, "data is");
const theseData = grammarSeries(grammarUsage.series, "these data");
const thisData = grammarSeries(grammarUsage.series, "this data");
const crossing = crossingYear(dataAre, dataIs, 1900);
const crossingMarkerYear = 2020;
const sparklineMax = Math.max(
  ...dataAre.points
    .concat(dataIs.points, theseData.points, thisData.points)
    .filter((point) => point.year >= 1950 && point.year <= 2022)
    .map((point) => point.frequencyPerMillion),
  1,
);
const dataAreAtCrossingMarker = pointAt(dataAre.points, crossingMarkerYear);
const dataIsAtCrossingMarker = pointAt(dataIs.points, crossingMarkerYear);
const crossingRatio =
  dataAreAtCrossingMarker && dataIsAtCrossingMarker
    ? round(dataIsAtCrossingMarker / dataAreAtCrossingMarker, 2)
    : null;

const nodes: RouteNode[] = [
  {
    id: "datum",
    label: "datum",
    level: "major",
    track: "entry",
    role: "lexical_singular_root",
    x: 0.07,
    y: 0.51,
    note: "one given item",
    sourceTermSlug: "datum",
    ...termSummary(termsBySlug.get("datum"), coverageBySlug.get("datum")),
  },
  {
    id: "data",
    label: "data",
    level: "major",
    track: "fork",
    role: "central_fork_shared_base",
    x: 0.22,
    y: 0.51,
    note: "plural form, later mass base",
    sourceTermSlug: "data",
    ...termSummary(termsBySlug.get("data"), coverageBySlug.get("data")),
  },
  {
    id: "these_data",
    label: "these data",
    level: "major",
    track: "plural_evidentiary",
    role: "explicit_plural_demonstrative",
    x: 0.36,
    y: 0.31,
    note: "explicit plural framing",
  },
  {
    id: "data_are",
    label: "data are",
    level: "major",
    track: "plural_evidentiary",
    role: "formal_plural_construction",
    x: 0.52,
    y: 0.31,
    note: "formal plural construction",
  },
  {
    id: "statistical_data",
    label: "statistical data",
    level: "secondary",
    track: "plural_evidentiary",
    role: "measured_fact_support",
    x: 0.67,
    y: 0.09,
    note: "counted or measured facts",
    sourceTermSlug: "statistical-data",
    ...termSummary(termsBySlug.get("statistical-data"), coverageBySlug.get("statistical-data")),
  },
  {
    id: "empirical_data",
    label: "empirical data",
    level: "secondary",
    track: "plural_evidentiary",
    role: "observed_evidence_support",
    x: 0.83,
    y: 0.24,
    note: "observed evidence",
    sourceTermSlug: "empirical-data",
    ...termSummary(termsBySlug.get("empirical-data"), coverageBySlug.get("empirical-data")),
  },
  {
    id: "data_processing",
    label: "data processing",
    level: "major",
    track: "singular_infrastructural",
    role: "aggregation_machine_handling",
    x: 0.38,
    y: 0.67,
    note: "aggregation and machine handling",
    sourceTermSlug: "data-processing",
    ...termSummary(termsBySlug.get("data-processing"), coverageBySlug.get("data-processing")),
  },
  {
    id: "database",
    label: "database",
    level: "major",
    track: "singular_infrastructural",
    role: "stored_structured_material",
    x: 0.54,
    y: 0.73,
    note: "stored and structured material",
    sourceTermSlug: "database",
    ...termSummary(termsBySlug.get("database"), coverageBySlug.get("database")),
  },
  {
    id: "this_data",
    label: "this data",
    level: "major",
    track: "singular_infrastructural",
    role: "singular_mass_demonstrative",
    x: 0.68,
    y: 0.66,
    note: "singular or mass demonstrative",
  },
  {
    id: "data_is",
    label: "data is",
    level: "major",
    track: "singular_infrastructural",
    role: "singular_mass_construction",
    x: 0.82,
    y: 0.56,
    note: "singular or mass construction",
  },
  {
    id: "data_as_resource",
    label: "data as resource",
    level: "secondary",
    track: "singular_infrastructural",
    role: "resource_logic",
    x: 0.9,
    y: 0.76,
    note: "material for systems and reuse",
  },
  {
    id: "training_data",
    label: "training data",
    level: "secondary",
    track: "extension",
    role: "model_input_extension",
    x: 0.96,
    y: 0.88,
    note: "later model-input extension",
    sourceTermSlug: "training-data",
    ...termSummary(termsBySlug.get("training-data"), coverageBySlug.get("training-data")),
  },
];

const edges: RouteEdge[] = [
  {
    id: "datum-data",
    source: "datum",
    target: "data",
    role: "lexical_derivation",
    style: "solid",
    emphasis: "primary",
    curvature: 0,
  },
  {
    id: "data-these-data",
    source: "data",
    target: "these_data",
    role: "plural_branch",
    style: "solid",
    emphasis: "primary",
    curvature: -0.22,
  },
  {
    id: "these-data-data-are",
    source: "these_data",
    target: "data_are",
    role: "grammatical_continuation",
    style: "solid",
    emphasis: "primary",
    curvature: -0.08,
  },
  {
    id: "data-are-statistical-data",
    source: "data_are",
    target: "statistical_data",
    role: "formal_scientific_support",
    style: "arc",
    emphasis: "secondary",
    curvature: -0.22,
  },
  {
    id: "data-are-empirical-data",
    source: "data_are",
    target: "empirical_data",
    role: "formal_scientific_support",
    style: "arc",
    emphasis: "secondary",
    curvature: -0.16,
  },
  {
    id: "data-data-processing",
    source: "data",
    target: "data_processing",
    role: "infrastructural_branch",
    style: "solid",
    emphasis: "primary",
    curvature: 0.24,
  },
  {
    id: "data-processing-database",
    source: "data_processing",
    target: "database",
    role: "infrastructural_mediation",
    style: "solid",
    emphasis: "primary",
    curvature: 0.05,
  },
  {
    id: "database-this-data",
    source: "database",
    target: "this_data",
    role: "mass_framing_bridge",
    style: "arc",
    emphasis: "primary",
    curvature: -0.12,
  },
  {
    id: "this-data-data-is",
    source: "this_data",
    target: "data_is",
    role: "singular_expansion",
    style: "solid",
    emphasis: "primary",
    curvature: -0.04,
  },
  {
    id: "data-is-resource",
    source: "data_is",
    target: "data_as_resource",
    role: "resource_logic",
    style: "solid",
    emphasis: "primary",
    curvature: 0.14,
  },
  {
    id: "resource-training",
    source: "data_as_resource",
    target: "training_data",
    role: "later_extension",
    style: "dashed",
    emphasis: "secondary",
    curvature: 0.12,
  },
  {
    id: "statistical-data-processing",
    source: "statistical_data",
    target: "data_processing",
    role: "evidence_to_infrastructure_translation",
    style: "dashed",
    emphasis: "quiet",
    curvature: 0.45,
    label: "measured facts become processable material",
  },
  {
    id: "database-data-is",
    source: "database",
    target: "data_is",
    role: "stored_mass_support",
    style: "dashed",
    emphasis: "quiet",
    curvature: -0.28,
    label: "structured stores support mass framing",
  },
];

const evidence = [
  {
    anchorNode: "data_are",
    label: "plural visibility",
    summary: "Plural construction remains visible in formal and scientific registers.",
    metrics: {
      average1900_1949: average(dataAre.points, 1900, 1949),
      average1950_1999: average(dataAre.points, 1950, 1999),
      average2000_2022: average(dataAre.points, 2000, 2022),
      value2022: pointAt(dataAre.points, 2022),
    },
  },
  {
    anchorNode: "data_is",
    label: "singular expansion",
    summary: "Singular construction rises and overtakes data are around 2020 in the English printed-book signal.",
    metrics: {
      crossingYear: crossing,
      describedAs: "around 2020",
      average1900_1949: average(dataIs.points, 1900, 1949),
      average1950_1999: average(dataIs.points, 1950, 1999),
      average2000_2022: average(dataIs.points, 2000, 2022),
      value2022: pointAt(dataIs.points, 2022),
    },
  },
  {
    anchorNode: "these_data",
    label: "plural demonstrative",
    summary: "Explicit plural demonstrative framing remains a visible printed construction.",
    metrics: {
      average1950_1999: average(theseData.points, 1950, 1999),
      average2000_2022: average(theseData.points, 2000, 2022),
      value2022: pointAt(theseData.points, 2022),
    },
  },
  {
    anchorNode: "this_data",
    label: "mass demonstrative",
    summary: "Singular or mass demonstrative framing grows alongside the infrastructural route.",
    metrics: {
      average1950_1999: average(thisData.points, 1950, 1999),
      average2000_2022: average(thisData.points, 2000, 2022),
      value2022: pointAt(thisData.points, 2022),
    },
  },
];

const dataset = {
  word: "data",
  chartId: "data-datum-route",
  generatedAt: new Date().toISOString(),
  sourceInputs: [
    "data_grammar_usage.json",
    "data_terms.json",
    "data_coverage_report.json",
    "data_phases.json",
    "data_historical_index.json",
    "data_frequency.json",
    "data_relations.json",
  ],
  metadata: {
    title: "From Datum to Data",
    subtitle: "A grammatical route from counted facts to mass resource",
    thesis:
      "Plural usage persists while singular and mass usage expands through infrastructural contexts.",
    caveat:
      "This chart reads a usage shift, not a rule change. Printed-book frequencies indicate visibility and remain genre-sensitive.",
  },
  tracks: [
    {
      id: "plural_evidentiary",
      label: "Plural / Evidentiary Route",
      description: "Data as countable facts, observations, and formal plural usage.",
      color: "#1570AC",
      y: 0.29,
    },
    {
      id: "singular_infrastructural",
      label: "Singular / Infrastructural Route",
      description: "Data as processed, stored, reusable, and mass-like material.",
      color: "#A1081F",
      y: 0.68,
    },
  ],
  nodes,
  edges,
  annotations: [
    {
      id: "fork-note",
      anchorNode: "data",
      title: "central fork",
      text: "Data is the shared base: historical plural form and later mass-noun platform.",
      x: 0.235,
      y: 0.405,
    },
    {
      id: "infrastructure-note",
      anchorNode: "data_processing",
      title: "infrastructural mediation",
      text: "Processing and databases make data easier to treat as aggregated material.",
      x: 0.39,
      y: 0.835,
    },
    {
      id: "crossing-note",
      anchorNode: "data_is",
      title: "printed-book signal",
      text: "Data is overtakes data are around 2020 in this signal; plural usage remains active.",
      x: 0.815,
      y: 0.42,
    },
    {
      id: "right-note",
      anchorNode: "training_data",
      title: "persistence / expansion",
      text: "The route ends as coexistence: plural persistence, singular expansion.",
      x: 0.765,
      y: 0.895,
    },
  ],
  evidence,
  sparkline: {
    unit: "frequency per million",
    corpus: dataAre.corpus_label,
    source: "Google Books Ngram English, smoothing 0",
    startYear: 1950,
    endYear: 2022,
    series: [
      {
        id: "data_are",
        label: "data are",
        color: "#1570AC",
        points: downsampleSparkline(dataAre, sparklineMax),
      },
      {
        id: "data_is",
        label: "data is",
        color: "#A1081F",
        points: downsampleSparkline(dataIs, sparklineMax),
      },
      {
        id: "these_data",
        label: "these data",
        color: "#2C9FC7",
        points: downsampleSparkline(theseData, sparklineMax),
      },
      {
        id: "this_data",
        label: "this data",
        color: "#AE4202",
        points: downsampleSparkline(thisData, sparklineMax),
      },
    ],
    crossingYear: crossing,
    crossingLabel: "around 2020",
    crossingMarker: {
      year: crossingMarkerYear,
      normalized: normalizedAt(dataIs.points, crossingMarkerYear, sparklineMax),
      ratio: crossingRatio,
    },
  },
};

fs.writeFileSync(path.join(GENERATED, "data_datum_route.json"), `${JSON.stringify(dataset, null, 2)}\n`);

console.log(`Wrote ${path.join(GENERATED, "data_datum_route.json")}`);
