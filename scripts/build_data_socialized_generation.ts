import fs from "node:fs";
import path from "node:path";

type TermRecord = {
  term: string;
  branch: string;
  visual_role: string;
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
  source_ids: string[];
};

type FrequencyPoint = {
  year: number;
  frequencyPerMillion: number;
};

type FrequencySeries = {
  term_slug: string;
  corpus: string;
  corpus_label: string;
  data_quality_status: string;
  points: FrequencyPoint[];
};

type RelationRecord = {
  relation_id: string;
  from: string;
  to: string;
  relation_type: string;
  branch: string;
  date_range: string;
  weight: number;
  confidence_level: string;
};

type SourceRecord = {
  source_id: string;
  title: string;
  author_or_org: string;
  year: string | number;
  source_type: string;
  url: string;
  reliability: string;
  used_for: string[];
};

type LayoutTerm = {
  slug: string;
  panels: ("outline" | "inner")[];
  circle: "trace_circulation" | "identity_rights_control" | "overlap" | "ai_tail";
  role: "major_label" | "minor_label" | "dot_only" | "hover_only" | "edge_tail";
  labelPriority: number;
  position: {
    outline?: { x: number; y: number };
    inner?: { x: number; y: number };
  };
  rationale: string;
};

const ROOT = process.cwd();
const GENERATED = path.join(ROOT, "src/data/generated");

function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(path.join(GENERATED, file), "utf8")) as T;
}

function average(points: FrequencyPoint[], start: number, end: number) {
  const selected = points.filter((point) => point.year >= start && point.year <= end);
  if (!selected.length) return null;
  const sum = selected.reduce((total, point) => total + point.frequencyPerMillion, 0);
  return Number((sum / selected.length).toFixed(4));
}

function peak(points: FrequencyPoint[], start: number, end: number) {
  const selected = points.filter((point) => point.year >= start && point.year <= end);
  if (!selected.length) return null;
  const max = selected.reduce((best, point) =>
    point.frequencyPerMillion > best.frequencyPerMillion ? point : best,
  );
  return {
    year: max.year,
    frequencyPerMillion: Number(max.frequencyPerMillion.toFixed(4)),
  };
}

function growth(points: FrequencyPoint[]) {
  const avg1990s = average(points, 1990, 1999);
  const avg2010s = average(points, 2010, 2019);
  if (!avg1990s || !avg2010s) return null;
  return Number((avg2010s / avg1990s).toFixed(2));
}

const termData = readJson<{ terms: TermRecord[] }>("data_terms.json");
const coverageData = readJson<{ term_coverage: CoverageRecord[] }>("data_coverage_report.json");
const frequencyData = readJson<{ series: FrequencySeries[]; source: unknown }>("data_frequency.json");
const relationData = readJson<{ relation_policy: string; relations: RelationRecord[] }>("data_relations.json");
const sourceData = readJson<{ sources: SourceRecord[] }>("data_sources.json");

const termsBySlug = new Map(termData.terms.map((term) => [term.slug, term]));
const coverageBySlug = new Map(coverageData.term_coverage.map((term) => [term.term_slug, term]));
const englishFrequencyBySlug = new Map(
  frequencyData.series
    .filter((series) => series.corpus === "en")
    .map((series) => [series.term_slug, series]),
);
const sourcesById = new Map(sourceData.sources.map((source) => [source.source_id, source]));

const layoutTerms: LayoutTerm[] = [
  {
    slug: "metadata",
    panels: ["outline", "inner"],
    circle: "trace_circulation",
    role: "minor_label",
    labelPriority: 3,
    position: { outline: { x: 0.32, y: 0.27 }, inner: { x: 0.31, y: 0.27 } },
    rationale: "Bridge term for web resources, indexing, and trace description.",
  },
  {
    slug: "open-data",
    panels: ["outline", "inner"],
    circle: "trace_circulation",
    role: "major_label",
    labelPriority: 1,
    position: { outline: { x: 0.57, y: 0.2 }, inner: { x: 0.56, y: 0.22 } },
    rationale: "Public/reusable circulation branch; policy salience outweighs modest book frequency.",
  },
  {
    slug: "user-data",
    panels: ["outline", "inner"],
    circle: "overlap",
    role: "hover_only",
    labelPriority: 6,
    position: { outline: { x: 0.43, y: 0.45 }, inner: { x: 0.42, y: 0.44 } },
    rationale: "Conceptually central to platform traces but downgraded because confidence is low and Ngram quality requires review.",
  },
  {
    slug: "clickstream-data",
    panels: ["outline"],
    circle: "trace_circulation",
    role: "dot_only",
    labelPriority: 7,
    position: { outline: { x: 0.23, y: 0.39 } },
    rationale: "Support dot for web activity traces.",
  },
  {
    slug: "search-data",
    panels: ["outline"],
    circle: "trace_circulation",
    role: "hover_only",
    labelPriority: 7,
    position: { outline: { x: 0.72, y: 0.37 } },
    rationale: "Support dot for search/platform traces; coverage is noisy.",
  },
  {
    slug: "personal-data",
    panels: ["outline", "inner"],
    circle: "overlap",
    role: "major_label",
    labelPriority: 1,
    position: { outline: { x: 0.54, y: 0.49 }, inner: { x: 0.52, y: 0.49 } },
    rationale: "Strong legal and Ngram support; anchors the person-attached side of socialized data.",
  },
  {
    slug: "data-protection",
    panels: ["outline", "inner"],
    circle: "identity_rights_control",
    role: "major_label",
    labelPriority: 1,
    position: { outline: { x: 0.36, y: 0.67 }, inner: { x: 0.38, y: 0.65 } },
    rationale: "Strong governance term; EU/UK wording caveat retained.",
  },
  {
    slug: "data-privacy",
    panels: ["outline", "inner"],
    circle: "identity_rights_control",
    role: "minor_label",
    labelPriority: 4,
    position: { outline: { x: 0.6, y: 0.66 }, inner: { x: 0.59, y: 0.63 } },
    rationale: "Important privacy branch but downgraded because internal coverage recommends hover-only.",
  },
  {
    slug: "data-breach",
    panels: ["outline", "inner"],
    circle: "overlap",
    role: "major_label",
    labelPriority: 2,
    position: { outline: { x: 0.67, y: 0.55 }, inner: { x: 0.66, y: 0.54 } },
    rationale: "Exposure event that turns private data into public/legal matter.",
  },
  {
    slug: "data-governance",
    panels: ["outline"],
    circle: "identity_rights_control",
    role: "hover_only",
    labelPriority: 6,
    position: { outline: { x: 0.49, y: 0.76 } },
    rationale: "Later consolidation term; internal coverage recommends hover-only.",
  },
  {
    slug: "data-broker",
    panels: ["outline"],
    circle: "identity_rights_control",
    role: "hover_only",
    labelPriority: 6,
    position: { outline: { x: 0.7, y: 0.74 } },
    rationale: "Commercial-control term; policy relevance is stronger than book visibility.",
  },
  {
    slug: "data-mining",
    panels: ["outline", "inner"],
    circle: "overlap",
    role: "major_label",
    labelPriority: 1,
    position: { outline: { x: 0.29, y: 0.51 }, inner: { x: 0.32, y: 0.51 } },
    rationale: "Extraction vocabulary that links traces, markets, and analysis.",
  },
  {
    slug: "big-data",
    panels: ["outline", "inner"],
    circle: "overlap",
    role: "major_label",
    labelPriority: 1,
    position: { outline: { x: 0.46, y: 0.57 }, inner: { x: 0.48, y: 0.56 } },
    rationale: "Scale discourse intensifies after the inner core and links analytics to social exhaust.",
  },
  {
    slug: "data-science",
    panels: ["outline", "inner"],
    circle: "overlap",
    role: "major_label",
    labelPriority: 2,
    position: { outline: { x: 0.41, y: 0.38 }, inner: { x: 0.47, y: 0.39 } },
    rationale: "Professional/method term; modern visibility consolidates around 2010-2015.",
  },
  {
    slug: "data-driven",
    panels: ["outline", "inner"],
    circle: "overlap",
    role: "dot_only",
    labelPriority: 6,
    position: { outline: { x: 0.57, y: 0.39 }, inner: { x: 0.58, y: 0.47 } },
    rationale: "Useful organizational connective tissue, but noisy enough to keep visually secondary.",
  },
  {
    slug: "dataset",
    panels: ["outline"],
    circle: "trace_circulation",
    role: "dot_only",
    labelPriority: 7,
    position: { outline: { x: 0.68, y: 0.28 } },
    rationale: "Packaged data unit; included as bridge to later training data.",
  },
  {
    slug: "training-data",
    panels: ["outline", "inner"],
    circle: "ai_tail",
    role: "edge_tail",
    labelPriority: 5,
    position: { outline: { x: 0.86, y: 0.33 }, inner: { x: 0.86, y: 0.33 } },
    rationale: "Later AI amplification term; deliberately placed on the outer rim, away from the overlap origin.",
  },
  {
    slug: "synthetic-data",
    panels: ["outline"],
    circle: "ai_tail",
    role: "edge_tail",
    labelPriority: 6,
    position: { outline: { x: 0.86, y: 0.45 } },
    rationale: "Later AI/privacy response layer; not part of the socialization core.",
  },
];

const selectedSlugs = new Set(layoutTerms.map((term) => term.slug));

const terms = layoutTerms.map((layout) => {
  const term = termsBySlug.get(layout.slug);
  const coverage = coverageBySlug.get(layout.slug);
  const frequency = englishFrequencyBySlug.get(layout.slug);

  if (!term) {
    throw new Error(`Missing term ${layout.slug} in data_terms.json`);
  }

  const freq = frequency
    ? {
        corpus: frequency.corpus_label,
        quality: frequency.data_quality_status,
        average1990_2022: average(frequency.points, 1990, 2022),
        average2003_2013: average(frequency.points, 2003, 2013),
        average2005_2012: average(frequency.points, 2005, 2012),
        average2014_2022: average(frequency.points, 2014, 2022),
        peak1990_2022: peak(frequency.points, 1990, 2022),
        growth1990sTo2010s: growth(frequency.points),
      }
    : null;

  const sourceIds = Array.from(new Set([...(term.source_ids ?? []), ...(coverage?.source_ids ?? [])]));

  return {
    slug: layout.slug,
    label: term.term,
    panels: layout.panels,
    circle: layout.circle,
    visualRole: layout.role,
    labelPriority: layout.labelPriority,
    branch: term.branch,
    confidenceLevel: term.confidence_level,
    coverageStatus: coverage?.coverage_status ?? "unknown",
    recommendedVisualStatus: coverage?.recommended_visual_status ?? "unknown",
    firstAttestation: term.first_attestation,
    firstStrongVisibility: term.first_strong_visibility,
    position: layout.position,
    ngramSummary: freq,
    sourceIds,
    sourceRefs: sourceIds.map((sourceId) => {
      const source = sourcesById.get(sourceId);
      return source
        ? {
            sourceId,
            title: source.title,
            sourceType: source.source_type,
            year: source.year,
          }
        : { sourceId };
    }),
    notes: term.notes,
    caveat: coverage?.caveat ?? term.caveat,
    selectionRationale: layout.rationale,
  };
});

const allowedRelations = new Set([
  "metadata->open-data",
  "personal-data->data-protection",
  "personal-data->data-privacy",
  "user-data->data-mining",
  "data-mining->big-data",
  "big-data->data-science",
  "big-data->data-driven",
  "dataset->training-data",
  "training-data->synthetic-data",
]);

const extraRelations = [
  {
    relation_id: "chart2-user-data-personal-data",
    from: "user-data",
    to: "personal-data",
    relation_type: "attaches_to_person",
    branch: "chart2_curated_socialization",
    date_range: "2003-2013",
    weight: 0.82,
    confidence_level: "medium",
    chart2_note: "Curated Chart 2 relation: platform traces become socially charged when attached to identifiable persons.",
  },
  {
    relation_id: "chart2-user-data-data-breach",
    from: "user-data",
    to: "data-breach",
    relation_type: "exposure_path",
    branch: "chart2_curated_socialization",
    date_range: "2003-2013",
    weight: 0.68,
    confidence_level: "medium",
    chart2_note: "Curated Chart 2 relation: user traces become public risk through breach/exposure regimes.",
  },
  {
    relation_id: "chart2-data-science-training-data",
    from: "data-science",
    to: "training-data",
    relation_type: "later_ai_amplification",
    branch: "ai_training_synthetic_generation",
    date_range: "2015-2026",
    weight: 0.62,
    confidence_level: "medium",
    chart2_note: "Curated Chart 2 relation: AI training material amplifies an already socialized data field.",
  },
];

const relations = [
  ...relationData.relations.filter((relation) => {
    const key = `${relation.from}->${relation.to}`;
    return allowedRelations.has(key) && selectedSlugs.has(relation.from) && selectedSlugs.has(relation.to);
  }),
  ...extraRelations,
].map((relation) => ({
  ...relation,
  panels:
    relation.from === "dataset" || relation.to === "synthetic-data"
      ? ["outline"]
      : relation.to === "training-data"
        ? ["outline", "inner"]
        : ["outline", "inner"],
}));

const dataset = {
  word: "data",
  chartId: "data-socialized-generation",
  title: "The Generation That Socialized Data",
  thesis: "Data became social before it became generative.",
  generatedAt: new Date().toISOString(),
  sourceInputs: [
    "data_terms.json",
    "data_coverage_report.json",
    "data_frequency.json",
    "data_relations.json",
    "data_contemporary_evidence.json",
    "data_sources.json",
    "data_dataset.json",
    "data_historical_index.json",
  ],
  panels: [
    {
      id: "outline",
      label: "OUTLINE / 1990s-2020s",
      dateRange: "1990s-2020s",
      scaleMeaning: "The larger generation in which data became networked, personal, public, commercial, and governable.",
      density: "spacious",
      circleGeometry: {
        trace_circulation: { cx: 0.5, cy: 0.31, r: 0.405 },
        identity_rights_control: { cx: 0.5, cy: 0.66, r: 0.405 },
      },
    },
    {
      id: "inner",
      label: "INNER / 2003-2013",
      dateRange: "2003-2013",
      centerOfGravity: "2005-2012",
      scaleMeaning: "The compressed decade where platform traces, open data, privacy language, data mining, and big-data discourse began to overlap.",
      density: "compressed",
      circleGeometry: {
        trace_circulation: { cx: 0.5, cy: 0.31, r: 0.38 },
        identity_rights_control: { cx: 0.5, cy: 0.61, r: 0.38 },
      },
    },
  ],
  circles: [
    {
      id: "trace_circulation",
      label: "Trace & Circulation",
      meaning:
        "Data as web traces, metadata, user activity, platforms, search, public/open data, data mining, analytics, reusable circulation, and movement across systems.",
    },
    {
      id: "identity_rights_control",
      label: "Identity, Rights & Control",
      meaning:
        "Data as personal information, privacy, protection, breach, brokers, rights, permissions, regulation, institutional accountability, and public/private distinction.",
    },
    {
      id: "overlap",
      label: "Socialized Data Zone",
      meaning:
        "Data becomes social when circulating traces become attached to identifiable persons, public/private distinctions, market value, institutional control, and enforceable rights.",
    },
  ],
  terms,
  relations,
  aiTailTerms: terms.filter((term) => term.circle === "ai_tail").map((term) => term.slug),
  downgradedTerms: terms
    .filter((term) => ["hover_only", "dot_only", "edge_tail"].includes(term.visualRole))
    .map((term) => ({
      slug: term.slug,
      label: term.label,
      visualRole: term.visualRole,
      reason: term.selectionRationale,
      coverageStatus: term.coverageStatus,
      recommendedVisualStatus: term.recommendedVisualStatus,
    })),
  omittedCandidateTerms: [
    {
      label: "public data",
      reason: "Not present in data_terms.json or data_frequency.json; represented conceptually by open data and source notes rather than added as an unsupported term.",
    },
  ],
  notes: [
    "Panel A and Panel B are nested scales of the same socialization process, not outside versus inside.",
    "Coordinates are curated in normalized 0-1 panel space so the figure remains an analytical plate rather than a force-directed network.",
    "Ngram summaries use English Google Books Ngram frequency per million from 1990-2022, 2003-2013, 2005-2012, and 2014-2022.",
    "AI terms are placed on the rim as later amplification of already-socialized data.",
  ],
  caveat:
    "Frequencies indicate printed-book visibility; relation paths are curated semantic links. The chart identifies a plausible generation of socialization, not a single causal origin.",
};

fs.writeFileSync(
  path.join(GENERATED, "data_socialized_generation.json"),
  `${JSON.stringify(dataset, null, 2)}\n`,
);

console.log(`Wrote ${path.join(GENERATED, "data_socialized_generation.json")}`);
