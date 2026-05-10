import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const BASE_DIR = path.join(process.cwd(), "docs", "research", "artificial", "chart_03_mechanical_reproduction");
const RAW_DIR = path.join(BASE_DIR, "raw");
const PROCESSED_DIR = path.join(BASE_DIR, "processed");
const NOTES_DIR = path.join(BASE_DIR, "notes");

const START_YEAR = 1800;
const END_YEAR = 2019;
const CORPUS = "en";
const CORPUS_LABEL = "English";
const SMOOTHING = 0;
const CASE_INSENSITIVE = true;
const SOURCE = "Google Books Ngram Viewer";
const ENDPOINT = "https://books.google.com/ngrams/json";
const BATCH_SIZE = 8;
const REQUEST_DELAY_MS = 350;

type QueryGroup =
  | "a_narrative_spine"
  | "b_supporting_evidence"
  | "c_optional_density"
  | "media_technology_anchor"
  | "authenticity_counterterm"
  | "a_perception_lighting"
  | "b_sound_reproduction"
  | "c_scene_manufacturing"
  | "d_industrial_material"
  | "e_authenticity_specific"
  | "f_media_infrastructure"
  | "g_pre_cinema_apparatus"
  | "h_color_television_media"
  | "i_digital_entry"
  | "j_authenticity_context";

type Status = "collected" | "missing" | "too_sparse" | "error";

type TermDefinition = {
  term: string;
  query_group: QueryGroup;
  narrative_role: string;
  priority_note?: string;
};

type NgramResponse = {
  ngram: string;
  parent?: string;
  type?: string;
  timeseries: number[];
};

type RawPoint = {
  year: number;
  term: string;
  value: number;
  source: string;
  corpus: string;
  smoothing: number;
  case_sensitive: boolean;
  query_group: QueryGroup;
  narrative_role: string;
};

type TermResult = {
  term: string;
  query_group: QueryGroup;
  narrative_role: string;
  status: Status;
  request_url: string | null;
  returned_ngram: string | null;
  points: RawPoint[];
  error: string | null;
  notes: string;
};

const termGroups: Record<QueryGroup, TermDefinition[]> = {
  a_narrative_spine: [
    ["photograph", "photographic image baseline; helps define the reproduction-era window"],
    ["photography", "photographic technology baseline; helps define the reproduction-era window"],
    ["authentic", "counter-term for authenticity pressure; compare against artificial/media terms"],
    ["authenticity", "counter-term for authenticity pressure; likely strong but not an artificial modifier"],
    ["artificial sound", "sound reproduction line: phonograph, radio, recording"],
    ["artificial lighting", "staged/cinematic perception manufacturing, distinct from artificial light"],
  ].map(([term, narrative_role]) => ({ term, narrative_role, query_group: "a_narrative_spine" })),

  b_supporting_evidence: [
    ["mechanical reproduction", "direct Benjamin-line academic/theoretical bridge"],
    ["artificial atmosphere", "theater/exhibition/environmental perception manufacturing"],
    ["recorded", "broad emergence of recording as a media action; sense-noisy but useful"],
    ["artificial daylight", "studio lighting / artificial sun / film-production specificity"],
    ["simulation", "late-tail bridge paired with simulated"],
  ].map(([term, narrative_role]) => ({ term, narrative_role, query_group: "b_supporting_evidence" })),

  c_optional_density: [
    ["reproduced", "general reproduction vocabulary"],
    ["reproduction", "general reproduction vocabulary and Benjamin-line context"],
    ["artificial color", "color reproduction via print, dye, film, and manufactured perception"],
    ["artificial colour", "British spelling variant for artificial color"],
    ["aura", "Benjamin aura concept; broad and sense-noisy in ordinary language"],
    ["artificial scene", "constructed scene/environment candidate"],
    ["artificial environment", "later constructed-environment candidate"],
  ].map(([term, narrative_role]) => ({ term, narrative_role, query_group: "c_optional_density" })),

  media_technology_anchor: [
    ["phonograph", "sound reproduction technology anchor"],
    ["gramophone", "sound reproduction technology anchor, especially British usage"],
    ["recorded sound", "specific sound-reproduction phrase"],
    ["sound recording", "specific recording practice phrase"],
    ["moving picture", "early motion-picture vocabulary"],
    ["motion picture", "film/cinema reproduction technology anchor"],
    ["cinematograph", "early cinema technology anchor"],
    ["radio broadcasting", "broadcast-mediated sound reproduction anchor"],
    ["photographic reproduction", "direct image-copying bridge between photography and reproduction"],
    ["facsimile", "copy/reproduction term that may precede mass media discourse"],
  ].map(([term, narrative_role]) => ({ term, narrative_role, query_group: "media_technology_anchor" })),

  authenticity_counterterm: [
    ["genuine", "counter-pressure around original/real/genuine status; broad but useful comparator"],
    ["original", "counter-pressure around original status; very broad and sense-noisy"],
    ["originality", "authorship/originality pressure around reproducibility"],
    ["fake", "negative authenticity-pressure comparator from the existing artificial dataset"],
    ["simulated", "existing artificial core term; pairs with simulation for late-tail pressure"],
    ["artificial image", "image/manufactured-perception phrase from existing test set, now Chart 3 relevant"],
    ["artificial voice", "voice/sound manufacturing phrase from existing secondary set, now Chart 3 relevant"],
  ].map(([term, narrative_role]) => ({ term, narrative_role, query_group: "authenticity_counterterm" })),

  a_perception_lighting: [
    ["electric light", "dominant artificial-light form after electrification; separates technical light from perception-making"],
    ["stage lighting", "theater perception manufacturing and constructed performance experience"],
    ["studio lighting", "film/photo production lighting; later and more professional than stage lighting"],
    ["limelight", "nineteenth-century stage-lighting technology and spectacle vocabulary"],
    ["artificial sunlight", "studio/photographic artificial-sun phrase, more specific than artificial light"],
  ].map(([term, narrative_role]) => ({ term, narrative_role, query_group: "a_perception_lighting" })),

  b_sound_reproduction: [
    ["talking picture", "sound-film transition marker after the late-1920s shift"],
    ["sound film", "alternate sound-cinema vocabulary for the same transition"],
    ["recorded music", "when recorded music becomes everyday language"],
    ["wireless", "British radio/broadcasting vocabulary running alongside radio"],
    ["phonographic", "adjectival phonograph vocabulary that may catch technical/legal contexts"],
    ["synthetic sound", "synthetic/audio-manufacturing phrase paired against artificial sound"],
  ].map(([term, narrative_role]) => ({ term, narrative_role, query_group: "b_sound_reproduction" })),

  c_scene_manufacturing: [
    ["diorama", "early artificial-scene apparatus and immersive display technology"],
    ["panorama", "early manufactured landscape/viewing experience"],
    ["artificial scenery", "direct theater/exhibition phrase for manufactured scenes"],
    ["moving image", "general moving-image concept, paired with moving picture"],
    ["projected image", "projection mechanism behind cinema and manufactured visual experience"],
    ["stereoscope", "nineteenth-century stereoscopic viewing and perceptual reproduction device"],
  ].map(([term, narrative_role]) => ({ term, narrative_role, query_group: "c_scene_manufacturing" })),

  d_industrial_material: [
    ["mass production", "industrial batch-production background pressure for reproducibility"],
    ["mass produced", "consumer/descriptive form of industrial reproducibility"],
    ["handmade", "reverse term for reproduced/artificial/mass-produced goods"],
    ["ersatz", "wartime artificial substitute vocabulary, especially WWI/WWII contexts"],
    ["photomechanical", "print-image reproduction technology vocabulary"],
    ["halftone", "material print technology for visual reproduction"],
  ].map(([term, narrative_role]) => ({ term, narrative_role, query_group: "d_industrial_material" })),

  e_authenticity_specific: [
    ["forgery", "specific extreme of inauthenticity, especially art/document falsification"],
    ["counterfeit", "specific anxiety around imitation goods and false copies"],
    ["imitation", "specific reproduction/semblance term already useful in Chart 2, now tracked over time"],
    ["faithful copy", "copy phrase that can pressure the original/reproduction boundary"],
    ["virtual", "semantic bridge from simulation toward digitally mediated artificial experience"],
    ["virtual reality", "late-tail artificial/reproducible experience phrase"],
  ].map(([term, narrative_role]) => ({ term, narrative_role, query_group: "e_authenticity_specific" })),

  f_media_infrastructure: [
    ["broadcast", "broader broadcast term covering radio and television eras"],
    ["mass media", "media-as-system vocabulary"],
    ["transmission", "technical signal-transfer vocabulary for reproduction and broadcast systems"],
    ["stereophonic", "audio-reproduction quality term for spatial sound"],
  ].map(([term, narrative_role]) => ({ term, narrative_role, query_group: "f_media_infrastructure" })),

  g_pre_cinema_apparatus: [
    ["magic lantern", "pre-cinema projection apparatus bridging diorama/stereoscope to cinema"],
    ["automaton", "mechanical human/performing figure as early artificial perception spectacle"],
    ["waxworks", "public artificial-body display and lifelike exhibition culture"],
    ["theatrical illusion", "direct theater vocabulary for manufactured visual experience"],
    ["stage effect", "practical theater vocabulary for engineered experience and spectacle"],
    ["lifelike", "realism-quality counter-pressure for artificial representation"],
  ].map(([term, narrative_role]) => ({ term, narrative_role, query_group: "g_pre_cinema_apparatus" })),

  h_color_television_media: [
    ["colour photography", "British spelling for color-photography transition and commercialization"],
    ["color photography", "American spelling for color-photography transition and commercialization"],
    ["colour film", "British spelling for color film and cinema color transition"],
    ["color film", "American spelling for color film and cinema color transition"],
    ["television", "broadcast visual medium filling the 1930s-1960s media gap"],
    ["televised", "broadcast action term, more specific than television as a medium noun"],
    ["special effect", "film/visual-manufacturing vocabulary from early cinema to CGI"],
    ["trick photography", "early photographic/cinematic visual manipulation vocabulary"],
  ].map(([term, narrative_role]) => ({ term, narrative_role, query_group: "h_color_television_media" })),

  i_digital_entry: [
    ["digital image", "digital visual artifact and digital-era image reproduction"],
    ["digital recording", "digital audio/recording transition vocabulary"],
    ["computer graphics", "technical vocabulary for visual simulation and image generation"],
    ["digital reproduction", "bridge from mechanical reproduction to digital copying"],
    ["high fidelity", "audio-realism quality term around reproduced sound"],
  ].map(([term, narrative_role]) => ({ term, narrative_role, query_group: "i_digital_entry" })),

  j_authenticity_context: [
    ["authentic experience", "modern phrase for authenticity anxiety around mediated experience"],
    ["art forgery", "specific art/copy falsification phrase"],
    ["true to life", "realism-quality phrase and counter-pressure to artificial representation"],
  ].map(([term, narrative_role]) => ({ term, narrative_role, query_group: "j_authenticity_context" })),
};

const rawFiles: Record<QueryGroup, string> = {
  a_narrative_spine: "chart_03_ngram_raw_a_narrative_spine.csv",
  b_supporting_evidence: "chart_03_ngram_raw_b_supporting_evidence.csv",
  c_optional_density: "chart_03_ngram_raw_c_optional_density.csv",
  media_technology_anchor: "chart_03_ngram_raw_media_technology_anchor.csv",
  authenticity_counterterm: "chart_03_ngram_raw_authenticity_counterterm.csv",
  a_perception_lighting: "chart_03_ngram_raw_a_perception_lighting.csv",
  b_sound_reproduction: "chart_03_ngram_raw_b_sound_reproduction.csv",
  c_scene_manufacturing: "chart_03_ngram_raw_c_scene_manufacturing.csv",
  d_industrial_material: "chart_03_ngram_raw_d_industrial_material.csv",
  e_authenticity_specific: "chart_03_ngram_raw_e_authenticity_specific.csv",
  f_media_infrastructure: "chart_03_ngram_raw_f_media_infrastructure.csv",
  g_pre_cinema_apparatus: "chart_03_ngram_raw_g_pre_cinema_apparatus.csv",
  h_color_television_media: "chart_03_ngram_raw_h_color_television_media.csv",
  i_digital_entry: "chart_03_ngram_raw_i_digital_entry.csv",
  j_authenticity_context: "chart_03_ngram_raw_j_authenticity_context.csv",
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function batch<T>(items: T[], size: number) {
  const groups: T[][] = [];
  for (let index = 0; index < items.length; index += size) groups.push(items.slice(index, index + size));
  return groups;
}

function canonical(value: string) {
  return value
    .toLowerCase()
    .replace(/\s*\(all\)$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function slug(value: string) {
  return value.replace(/[^a-z0-9]+/gi, "_").replace(/^_|_$/g, "").toLowerCase();
}

function csvValue(value: string | number | boolean | null) {
  if (value === null) return "";
  const text = String(value);
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function csvRows(headers: string[], rows: Array<Record<string, string | number | boolean | null>>) {
  return [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => csvValue(row[header] ?? "")).join(",")),
  ].join("\n");
}

function ngramUrl(terms: string[]) {
  const url = new URL(ENDPOINT);
  url.searchParams.set("content", terms.join(","));
  url.searchParams.set("year_start", String(START_YEAR));
  url.searchParams.set("year_end", String(END_YEAR));
  url.searchParams.set("corpus", CORPUS);
  url.searchParams.set("smoothing", String(SMOOTHING));
  url.searchParams.set("case_insensitive", String(CASE_INSENSITIVE));
  return url;
}

async function fetchRows(terms: TermDefinition[]) {
  const url = ngramUrl(terms.map((term) => term.term));
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Google Ngram request failed: ${response.status} ${response.statusText}`);
  }
  return { url: url.toString(), rows: (await response.json()) as NgramResponse[] };
}

function preferAggregateRows(rows: NgramResponse[]) {
  const byCanonical = new Map<string, NgramResponse>();
  for (const row of rows) {
    const key = canonical(row.ngram);
    const existing = byCanonical.get(key);
    const isAggregate = /\(all\)$/i.test(row.ngram);
    const existingIsAggregate = existing ? /\(all\)$/i.test(existing.ngram) : false;
    if (!existing || (isAggregate && !existingIsAggregate)) byCanonical.set(key, row);
  }
  return byCanonical;
}

function pointsFor(term: TermDefinition, row: NgramResponse): RawPoint[] {
  return row.timeseries.map((value, index) => ({
    year: START_YEAR + index,
    term: term.term,
    value,
    source: SOURCE,
    corpus: CORPUS,
    smoothing: SMOOTHING,
    case_sensitive: !CASE_INSENSITIVE,
    query_group: term.query_group,
    narrative_role: term.narrative_role,
  }));
}

function resultFromRow(term: TermDefinition, row: NgramResponse, requestUrl: string): TermResult {
  const points = pointsFor(term, row);
  const nonZeroCount = points.filter((point) => point.value > 0).length;
  const status: Status = nonZeroCount === 0 ? "missing" : nonZeroCount <= 3 ? "too_sparse" : "collected";
  const notes =
    status === "missing"
      ? "Ngram returned a row, but all yearly values were zero."
      : status === "too_sparse"
        ? "Ngram returned only one to three nonzero years; keep for audit only until checked against other sources."
        : term.priority_note ?? "";

  return {
    term: term.term,
    query_group: term.query_group,
    narrative_role: term.narrative_role,
    status,
    request_url: requestUrl,
    returned_ngram: row.ngram,
    points,
    error: null,
    notes,
  };
}

function missingResult(term: TermDefinition, requestUrl: string): TermResult {
  return {
    term: term.term,
    query_group: term.query_group,
    narrative_role: term.narrative_role,
    status: "missing",
    request_url: requestUrl,
    returned_ngram: null,
    points: [],
    error: null,
    notes: term.priority_note ?? "No row returned by Google Ngram for this query.",
  };
}

function errorResult(term: TermDefinition, requestUrl: string | null, error: unknown): TermResult {
  return {
    term: term.term,
    query_group: term.query_group,
    narrative_role: term.narrative_role,
    status: "error",
    request_url: requestUrl,
    returned_ngram: null,
    points: [],
    error: error instanceof Error ? error.message : String(error),
    notes: term.priority_note ?? "Request failed; no frequency values collected.",
  };
}

async function collectBatch(terms: TermDefinition[]) {
  const requestUrl = ngramUrl(terms.map((term) => term.term)).toString();
  try {
    const { url, rows } = await fetchRows(terms);
    const byCanonical = preferAggregateRows(rows);
    return terms.map((term) => {
      const row = byCanonical.get(canonical(term.term));
      return row ? resultFromRow(term, row, url) : missingResult(term, url);
    });
  } catch (batchError) {
    const results: TermResult[] = [];
    for (const term of terms) {
      await sleep(REQUEST_DELAY_MS);
      const singleUrl = ngramUrl([term.term]).toString();
      try {
        const { url, rows } = await fetchRows([term]);
        const row = preferAggregateRows(rows).get(canonical(term.term));
        results.push(row ? resultFromRow(term, row, url) : missingResult(term, url));
      } catch (singleError) {
        results.push(errorResult(term, singleUrl, singleError));
      }
    }

    if (results.every((result) => result.status === "error")) {
      return terms.map((term) => errorResult(term, requestUrl, batchError));
    }

    return results;
  }
}

function averageFor(points: RawPoint[], firstYear: number, lastYear: number) {
  const window = points.filter((point) => point.year >= firstYear && point.year <= lastYear);
  if (!window.length) return null;
  return window.reduce((sum, point) => sum + point.value, 0) / window.length;
}

function thresholdYear(points: RawPoint[], threshold: number) {
  return points.find((point) => point.value >= threshold)?.year ?? null;
}

function statsFor(result: TermResult) {
  const nonZero = result.points.filter((point) => point.value > 0);
  const peak = result.points.reduce(
    (best, point) => (point.value > best.value ? point : best),
    { year: null as number | null, value: 0 },
  );
  const recent = [...result.points].reverse().find((point) => point.value > 0) ?? null;
  const millionScale = 1_000_000;
  const peakPerMillion = peak.value * millionScale;
  const avg1800_1849 = averageFor(result.points, 1800, 1849);
  const avg1850_1899 = averageFor(result.points, 1850, 1899);
  const avg1900_1949 = averageFor(result.points, 1900, 1949);
  const avg1950_1999 = averageFor(result.points, 1950, 1999);

  return {
    term: result.term,
    term_slug: slug(result.term),
    query_group: result.query_group,
    narrative_role: result.narrative_role,
    status: result.status,
    first_nonzero_year: nonZero[0]?.year ?? null,
    last_nonzero_year: nonZero[nonZero.length - 1]?.year ?? null,
    peak_year: peak.year,
    peak_value: peak.value,
    peak_per_million: peakPerMillion,
    recent_year: recent?.year ?? null,
    recent_value: recent?.value ?? null,
    recent_per_million: recent ? recent.value * millionScale : null,
    nonzero_year_count: nonZero.length,
    avg_1800_1849_per_million: avg1800_1849 === null ? null : avg1800_1849 * millionScale,
    avg_1850_1899_per_million: avg1850_1899 === null ? null : avg1850_1899 * millionScale,
    avg_1900_1949_per_million: avg1900_1949 === null ? null : avg1900_1949 * millionScale,
    avg_1950_1999_per_million: avg1950_1999 === null ? null : avg1950_1999 * millionScale,
    first_above_0_01_per_million: thresholdYear(result.points, 0.01 / millionScale),
    first_above_0_1_per_million: thresholdYear(result.points, 0.1 / millionScale),
    first_above_1_per_million: thresholdYear(result.points, 1 / millionScale),
    returned_ngram: result.returned_ngram,
    notes: result.error ? `${result.notes} Error: ${result.error}` : result.notes,
  };
}

function statusList(results: TermResult[], status: Status) {
  return results.filter((result) => result.status === status).map((result) => result.term);
}

function topSignals(results: TermResult[], limit = 16) {
  return results
    .map((result) => {
      const peak = result.points.reduce((best, point) => Math.max(best, point.value), 0);
      return { term: result.term, peak_per_million: peak * 1_000_000 };
    })
    .sort((a, b) => b.peak_per_million - a.peak_per_million)
    .slice(0, limit);
}

async function main() {
  const generatedAt = new Date().toISOString();
  await Promise.all([RAW_DIR, PROCESSED_DIR, NOTES_DIR].map((directory) => mkdir(directory, { recursive: true })));

  const allResults: TermResult[] = [];
  const requestUrls: string[] = [];

  for (const group of Object.keys(termGroups) as QueryGroup[]) {
    for (const terms of batch(termGroups[group], BATCH_SIZE)) {
      const results = await collectBatch(terms);
      allResults.push(...results);
      for (const result of results) {
        if (result.request_url && !requestUrls.includes(result.request_url)) requestUrls.push(result.request_url);
      }
      await sleep(REQUEST_DELAY_MS);
    }
  }

  const rawHeaders = [
    "year",
    "term",
    "value",
    "source",
    "corpus",
    "smoothing",
    "case_sensitive",
    "query_group",
    "narrative_role",
  ];
  for (const group of Object.keys(rawFiles) as QueryGroup[]) {
    const rows = allResults.flatMap((result) => (result.query_group === group ? result.points : []));
    await writeFile(path.join(RAW_DIR, rawFiles[group]), `${csvRows(rawHeaders, rows)}\n`);
  }

  const longRows = allResults.flatMap((result) =>
    result.points.map((point) => ({
      year: point.year,
      term: point.term,
      value: point.value,
      value_per_million: point.value * 1_000_000,
      query_group: point.query_group,
      narrative_role: point.narrative_role,
      source: point.source,
      corpus: point.corpus,
      smoothing: point.smoothing,
      case_sensitive: point.case_sensitive,
    })),
  );
  await writeFile(
    path.join(PROCESSED_DIR, "chart_03_ngram_long.csv"),
    `${csvRows(
      [
        "year",
        "term",
        "value",
        "value_per_million",
        "query_group",
        "narrative_role",
        "source",
        "corpus",
        "smoothing",
        "case_sensitive",
      ],
      longRows,
    )}\n`,
  );

  const metadata = allResults.map(statsFor);
  await writeFile(
    path.join(PROCESSED_DIR, "chart_03_term_metadata.csv"),
    `${csvRows(
      [
        "term",
        "term_slug",
        "query_group",
        "narrative_role",
        "status",
        "first_nonzero_year",
        "last_nonzero_year",
        "peak_year",
        "peak_value",
        "peak_per_million",
        "recent_year",
        "recent_value",
        "recent_per_million",
        "nonzero_year_count",
        "avg_1800_1849_per_million",
        "avg_1850_1899_per_million",
        "avg_1900_1949_per_million",
        "avg_1950_1999_per_million",
        "first_above_0_01_per_million",
        "first_above_0_1_per_million",
        "first_above_1_per_million",
        "returned_ngram",
        "notes",
      ],
      metadata,
    )}\n`,
  );

  const termInventory = (Object.keys(termGroups) as QueryGroup[]).flatMap((group) =>
    termGroups[group].map((term) => ({
      term: term.term,
      query_group: group,
      narrative_role: term.narrative_role,
    })),
  );
  await writeFile(
    path.join(PROCESSED_DIR, "chart_03_term_inventory.csv"),
    `${csvRows(["term", "query_group", "narrative_role"], termInventory)}\n`,
  );

  const attempted = allResults.length;
  const collected = statusList(allResults, "collected");
  const missing = statusList(allResults, "missing");
  const tooSparse = statusList(allResults, "too_sparse");
  const errored = statusList(allResults, "error");
  const strongest = topSignals(allResults);

  const collectionLog = `# Chart 3 Mechanical Reproduction Collection Log

Generated: ${generatedAt}

## Script

- \`scripts/fetch_chart_03_reproduction.ts\`

## Chart Frame

Chart 3 is collecting data for: artificial object -> artificial image / sound / light / scene -> reproducible experience -> authenticity pressure.

This pass treats \`authentic\`, \`authenticity\`, \`genuine\`, \`original\`, and \`originality\` as counter-terms, not artificial modifiers. They should be aligned against the artificial/media timeline rather than interpreted as part of the artificial phrase family.

## Source Method

- Source: ${SOURCE}
- Endpoint: \`${ENDPOINT}\`
- Output root: \`docs/research/artificial/chart_03_mechanical_reproduction\`
- Corpus: \`${CORPUS}\` (${CORPUS_LABEL})
- Date range: ${START_YEAR}-${END_YEAR}
- Smoothing: ${SMOOTHING}
- Case-sensitive query: ${!CASE_INSENSITIVE}
- Case-insensitive parameter: ${CASE_INSENSITIVE}
- Query batching: ${BATCH_SIZE} terms per request, with single-term retry after batch failure

## Terms Attempted

${(Object.keys(termGroups) as QueryGroup[])
  .map((group) => `### ${group}\n\n${termGroups[group].map((term) => `- ${term.term}: ${term.narrative_role}`).join("\n")}`)
  .join("\n\n")}

## Status

- Terms attempted: ${attempted}
- Successfully collected: ${collected.length}
- Missing: ${missing.length}
- Too sparse: ${tooSparse.length}
- Errored: ${errored.length}

## Strongest Visible Frequency Signals

${strongest.map((item) => `- ${item.term}: peak ${item.peak_per_million} per million`).join("\n")}

## Missing Terms

${missing.length ? missing.map((term) => `- ${term}`).join("\n") : "- None"}

## Too Sparse Terms

${tooSparse.length ? tooSparse.map((term) => `- ${term}`).join("\n") : "- None"}

## Errored Terms

${errored.length ? errored.map((term) => `- ${term}`).join("\n") : "- None"}

## Request URLs

${requestUrls.map((url) => `- ${url}`).join("\n")}

## Assumptions

- A/B/C terms follow the user's priority structure.
- Media technology anchors were added to help locate the chart's reproduction-era window.
- Authenticity counter-terms were added because Chart 3 needs a visible pressure field around reproducibility, originality, and genuineness.
- Broad terms such as \`recorded\`, \`original\`, \`aura\`, and \`genuine\` are intentionally sense-noisy and must be interpreted only as background pressure.
- Values are raw Google Ngram fractions; per-million columns multiply those values by 1,000,000 for readability.

## Unresolved Issues

- Ngram does not disambiguate senses.
- Rare phrases can be missing or suppressed by phrase thresholds.
- \`mechanical reproduction\`, \`aura\`, and \`authenticity\` need later source/context checks before Benjamin-related claims are written.
- Technical-media terms may require newspaper, patent, trade, or film/recording history sources in a later round.
`;
  await writeFile(path.join(NOTES_DIR, "chart_03_collection_log.md"), collectionLog);

  const sourceNotes = `# Chart 3 Source Notes

Generated: ${generatedAt}

## Google Books Ngram

- Source: ${SOURCE}
- Endpoint: \`${ENDPOINT}\`
- Corpus used: \`${CORPUS}\` (${CORPUS_LABEL})
- Date range: ${START_YEAR}-${END_YEAR}
- Smoothing: ${SMOOTHING}
- Case-insensitive: ${CASE_INSENSITIVE}

## Interpretation Notes

- The data is frequency-only and cannot prove a specific semantic sense.
- Chart 3 should align three streams rather than collapse them: media/reproduction terms, artificial perception terms, and authenticity counter-terms.
- \`authentic\` and \`authenticity\` are expected to have their own strong timeline; their chart use is as counter-pressure.
- \`artificial lighting\` and \`artificial daylight\` are more specific than \`artificial light\`; missing or sparse results would not invalidate the broader lighting thread.
- \`artificial color\` and \`artificial colour\` are not merged here because their spelling distributions may tell different corpus stories.
`;
  await writeFile(path.join(NOTES_DIR, "chart_03_source_notes.md"), sourceNotes);

  console.log(`Chart 3 reproduction Ngram collection complete.
Terms attempted: ${attempted}
Collected: ${collected.length}
Missing: ${missing.length}
Too sparse: ${tooSparse.length}
Errored: ${errored.length}`);
}

await main();
