import fs from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve("docs/research/artificial/chart_05_human_continuation/targeted_supplement_round_02");
const CREATED_AT = "2026-05-13 22:05:41 AEST";

const ngramSettings = {
  source: "Google Books Ngram",
  corpus: "en",
  yearStart: 1800,
  yearEnd: 2019,
  smoothing: 0,
  caseInsensitive: true,
};

const variantTerms = [
  ["life saving apparatus", "layer1_apparatus_variant", "external_artificial_things", "background_support"],
  ["life-saving apparatus", "layer1_apparatus_variant", "external_artificial_things", "background_support"],
  ["life saving device", "layer1_apparatus_variant", "external_artificial_things", "background_support"],
  ["life-saving device", "layer1_apparatus_variant", "external_artificial_things", "background_support"],
  ["artificial respiration apparatus", "layer1_apparatus_variant", "body_support_bridge", "support"],
  ["artificial respiration device", "layer1_apparatus_variant", "body_support_bridge", "support"],
  ["artificial respirator", "layer1_apparatus_variant", "body_support_bridge", "support"],
  ["mechanical respirator", "layer1_apparatus_variant", "body_support_bridge", "support"],
  ["Drinker respirator", "layer1_apparatus_variant", "body_support_bridge", "support"],
  ["iron lung", "layer1_apparatus_variant", "body_support_bridge", "support"],
  ["resuscitation apparatus", "layer1_apparatus_variant", "body_support_bridge", "support"],
  ["artificial life support", "life_support_phrase_variant", "body_support", "support"],
  ["artificial nutrition and hydration", "life_support_phrase_variant", "body_support", "support"],
  ["artificial feeding", "life_support_phrase_variant", "body_support", "support"],
  ["mechanical ventilation", "life_support_phrase_variant", "body_support", "support"],
  ["test tube baby", "test_tube_variant", "reproduction_continuation", "continuation"],
  ["test-tube baby", "test_tube_variant", "reproduction_continuation", "continuation"],
  ["test tube babies", "test_tube_variant", "reproduction_continuation", "continuation"],
  ["test-tube babies", "test_tube_variant", "reproduction_continuation", "continuation"],
  ["test tube fertilization", "test_tube_variant", "reproduction_continuation", "continuation"],
  ["test-tube fertilization", "test_tube_variant", "reproduction_continuation", "continuation"],
  ["in vitro fertilization", "test_tube_variant", "reproduction_continuation", "continuation"],
  ["in vitro fertilisation", "test_tube_variant", "reproduction_continuation", "continuation"],
  ["artificial life", "artificial_life_sense_variant", "human_process_cognition_presence", "simulation"],
  ["synthetic life", "artificial_life_sense_variant", "human_process_cognition_presence", "simulation"],
  ["strong artificial life", "artificial_life_sense_variant", "human_process_cognition_presence", "simulation"],
  ["weak artificial life", "artificial_life_sense_variant", "human_process_cognition_presence", "simulation"],
  ["soft artificial life", "artificial_life_sense_variant", "human_process_cognition_presence", "simulation"],
  ["wet artificial life", "artificial_life_sense_variant", "human_process_cognition_presence", "simulation"],
  ["artificial organism", "artificial_life_sense_variant", "human_process_cognition_presence", "simulation"],
  ["artificial organisms", "artificial_life_sense_variant", "human_process_cognition_presence", "simulation"],
];

const evidenceRows = [
  {
    id: "S2E001",
    term_or_phrase: "artificial respiration apparatus",
    target_gap: "layer1_apparatus",
    primary_layer: 1,
    function_mode: "support",
    source_period: "1900_1950",
    year_or_period: "1929 / 1931",
    source_name: "JCI / PubMed: Drinker-Shaw artificial respiration apparatus",
    source_type: "medical_journal",
    source_url: "https://www.jci.org/articles/view/100226",
    evidence_kind: "historical_medical_anchor",
    confidence: "high",
    short_summary: "1929 Drinker-Shaw article is explicitly titled as an apparatus for prolonged administration of artificial respiration.",
    visual_implication: "Use as background bridge from external apparatus into body support.",
    notes: "Supports Layer 1 as apparatus/device field without making it a major chart layer.",
  },
  {
    id: "S2E002",
    term_or_phrase: "mechanical respirator / iron lung",
    target_gap: "layer1_apparatus",
    primary_layer: 1,
    function_mode: "support",
    source_period: "1900_1950",
    year_or_period: "1927-1930s",
    source_name: "Britannica: iron lung",
    source_type: "encyclopedia",
    source_url: "https://www.britannica.com/science/iron-lung",
    evidence_kind: "historical_technology_anchor",
    confidence: "high",
    short_summary: "Britannica frames the iron lung as a mechanical medical device used to maintain respiration when patients could not breathe on their own.",
    visual_implication: "Can be a quiet apparatus/support base node, not a top-level claim.",
    notes: "Good explanatory source for artificial starts outside the body as device/support.",
  },
  {
    id: "S2E003",
    term_or_phrase: "artificial breathing / mechanical respirators",
    target_gap: "layer1_apparatus",
    primary_layer: 1,
    function_mode: "support",
    source_period: "1900_1950",
    year_or_period: "1930-1939",
    source_name: "NCBI Bookshelf: Respiratory technologies and the co-production of breathing",
    source_type: "medical_history",
    source_url: "https://www.ncbi.nlm.nih.gov/books/NBK582502/",
    evidence_kind: "historical_context",
    confidence: "high",
    short_summary: "Historical discussion describes interwar respirators and artificial breathing technologies used for respiratory paralysis.",
    visual_implication: "Useful as connector material between apparatus and body support.",
    notes: "Good source for the body boundary being mediated by machines before AI appears.",
  },
  {
    id: "S2E004",
    term_or_phrase: "artificial life support",
    target_gap: "life_support_exact_phrase",
    primary_layer: 2,
    function_mode: "support",
    source_period: "modern_reference",
    year_or_period: "modern",
    source_name: "Cleveland Clinic: Life Support Measures",
    source_type: "medical_reference",
    source_url: "https://my.clevelandclinic.org/health/treatments/12362-life-support-measures",
    evidence_kind: "medical_context",
    confidence: "medium",
    short_summary: "Life support is framed through interventions such as mechanical ventilation, artificial nutrition/hydration, and dialysis rather than a single exact phrase.",
    visual_implication: "Keep exact phrase artificial life support secondary; show life support as stronger node.",
    notes: "Exact phrase still weaker than the component technologies.",
  },
  {
    id: "S2E005",
    term_or_phrase: "artificial life support",
    target_gap: "life_support_exact_phrase",
    primary_layer: 2,
    function_mode: "support",
    source_period: "modern_reference",
    year_or_period: "MeSH introduced 1978",
    source_name: "NCBI MeSH: Life Support Care",
    source_type: "medical_dictionary",
    source_url: "https://www.ncbi.nlm.nih.gov/mesh/68008020",
    evidence_kind: "controlled_vocabulary",
    confidence: "high",
    short_summary: "MeSH supports Life Support Care as extraordinary therapeutic measures to sustain and prolong life.",
    visual_implication: "Use life support as the hard anchor; artificial life support can remain a label/variant.",
    notes: "The exact phrase should not be over-weighted.",
  },
  {
    id: "S2E006",
    term_or_phrase: "test-tube baby",
    target_gap: "test_tube_variant",
    primary_layer: 4,
    function_mode: "continuation",
    source_period: "1950_2000",
    year_or_period: "1978 / MeSH introduced 1979",
    source_name: "NCBI MeSH: Fertilization in Vitro",
    source_type: "medical_dictionary",
    source_url: "https://www.ncbi.nlm.nih.gov/mesh/68005307",
    evidence_kind: "entry_term",
    confidence: "high",
    short_summary: "MeSH lists Test-Tube Baby, Test Tube Babies, and Test-Tube Fertilization as entry terms under Fertilization in Vitro.",
    visual_implication: "Restore test-tube baby as IVF variant/press-language bridge if needed.",
    notes: "Prefer IVF as medical node; use test-tube baby as historical/public-language node.",
  },
  {
    id: "S2E007",
    term_or_phrase: "test-tube baby",
    target_gap: "test_tube_variant",
    primary_layer: 4,
    function_mode: "continuation",
    source_period: "1950_2000",
    year_or_period: "1978",
    source_name: "Britannica: Louise Brown",
    source_type: "encyclopedia",
    source_url: "https://www.britannica.com/biography/Louise-Brown",
    evidence_kind: "historical_anchor",
    confidence: "high",
    short_summary: "Louise Brown is identified as the first human conceived using IVF and as the press-dubbed test-tube baby.",
    visual_implication: "Use as public-history marker for reproduction/continuation layer.",
    notes: "Use carefully: test-tube baby is public phrase, not the technical process name.",
  },
  {
    id: "S2E008",
    term_or_phrase: "artificial life",
    target_gap: "artificial_life_sense_split",
    primary_layer: 5,
    function_mode: "simulation",
    source_period: "pre_computational_modern",
    year_or_period: "early 20th century",
    source_name: "PubMed: Erasing Borders, early synthetic biology",
    source_type: "historical_review",
    source_url: "https://pubmed.ncbi.nlm.nih.gov/27900404/",
    evidence_kind: "historical_review",
    confidence: "medium",
    short_summary: "Early synthetic biology attempts by Leduc, Herrera, and Burke are described as efforts to cross the border between inert and living matter.",
    visual_implication: "Supports biological_life / synthetic-life prehistory without making it an AI node.",
    notes: "Use as background for artificial life A: biological/synthetic-life track.",
  },
  {
    id: "S2E009",
    term_or_phrase: "artificial life",
    target_gap: "artificial_life_sense_split",
    primary_layer: 5,
    function_mode: "simulation",
    source_period: "1950_2000",
    year_or_period: "1987 / 1989",
    source_name: "Open Library / Langton: Artificial Life proceedings",
    source_type: "academic_book_record",
    source_url: "https://openlibrary.org/books/OL1800410M/Artificial_life",
    evidence_kind: "field_anchor",
    confidence: "high",
    short_summary: "The 1987 Los Alamos workshop and 1989 proceedings established artificial life around synthesis and simulation of living systems.",
    visual_implication: "Use as computational_life bridge node from life processes to cognition/process modeling.",
    notes: "This is the stronger Chart 05 sense for artificial life as bridge to Layer 5.",
  },
  {
    id: "S2E010",
    term_or_phrase: "artificial life",
    target_gap: "artificial_life_sense_split",
    primary_layer: 5,
    function_mode: "simulation",
    source_period: "modern_reference",
    year_or_period: "2026 revision",
    source_name: "Stanford Encyclopedia of Philosophy: Life",
    source_type: "philosophy_reference",
    source_url: "https://plato.stanford.edu/entries/life/",
    evidence_kind: "sense_boundary",
    confidence: "high",
    short_summary: "SEP separates artificial and synthetic life issues and notes disputes around Strong A-Life, software, hardware, and biological features.",
    visual_implication: "Keep artificial life as split/bridge node; avoid treating it as one simple reproduction term.",
    notes: "Good caution source for sense_track and boundary risk.",
  },
  {
    id: "S2E011",
    term_or_phrase: "artificial life",
    target_gap: "artificial_life_sense_split",
    primary_layer: 5,
    function_mode: "simulation",
    source_period: "2019_2026",
    year_or_period: "2024",
    source_name: "MIT Press Artificial Life: What Is Artificial Life Today?",
    source_type: "academic_journal",
    source_url: "https://direct.mit.edu/artl/article/30/1/1/120293/What-Is-Artificial-Life-Today-and-Where-Should-It",
    evidence_kind: "field_status",
    confidence: "high",
    short_summary: "A 2024 Artificial Life journal article describes the field as coalescing after Langton's 1987 workshop and revisits life-as-it-could-be framing.",
    visual_implication: "Supports artificial life as established field but still boundary-crossing.",
    notes: "Useful for not letting artificial life collapse into AI or reproduction.",
  },
  {
    id: "S2E012",
    term_or_phrase: "artificial womb",
    target_gap: "artificial_life_sense_split",
    primary_layer: 4,
    function_mode: "continuation",
    source_period: "2019_2026",
    year_or_period: "2026",
    source_name: "PubMed: Artificial Womb Technology systematic review",
    source_type: "medical_review",
    source_url: "https://pubmed.ncbi.nlm.nih.gov/41664724/",
    evidence_kind: "speculative_boundary",
    confidence: "high",
    short_summary: "Artificial womb remains preclinical fetal-support technology, with no human trials noted in the review.",
    visual_implication: "Draw as continuation edge/experimental node, not as completed life replacement.",
    notes: "Keeps Layer 4 careful and prevents artificial life confusion.",
  },
];

const artificialLifeSenseRows = [
  {
    sense_track: "biological_life",
    status: "partially_supported",
    strongest_source: "PubMed early synthetic biology review",
    period_anchor: "early 20th century background",
    visual_treatment: "background_bridge",
    summary: "Early synthetic-biology attempts frame artificial/synthetic life as crossing inert/living matter, but this is not the same as modern ALife.",
    risk: "medium",
  },
  {
    sense_track: "computational_life",
    status: "strong",
    strongest_source: "Langton/Routledge proceedings; MIT Press Artificial Life journal",
    period_anchor: "1987 workshop / 1989 proceedings / 1993-94 journal",
    visual_treatment: "solid_bridge_node",
    summary: "Computational artificial life is the strongest established sense for Chart 05: synthesis/simulation of living systems and life-as-it-could-be.",
    risk: "low",
  },
  {
    sense_track: "philosophical_life",
    status: "supported_as_boundary",
    strongest_source: "Stanford Encyclopedia of Philosophy: Life",
    period_anchor: "modern reference",
    visual_treatment: "notes_or_edge",
    summary: "Strong A-Life and definitions of life remain contested, so philosophical life should control boundaries rather than become a visual center.",
    risk: "medium",
  },
  {
    sense_track: "unclear",
    status: "must_disambiguate",
    strongest_source: "Ngram alone insufficient",
    period_anchor: "all periods",
    visual_treatment: "do_not_use_without_context",
    summary: "Bare artificial life frequency cannot say whether usage is biological, computational, fictional, or philosophical.",
    risk: "high",
  },
];

const phraseStatusRows = [
  {
    item: "artificial life support",
    status: "partial",
    strongest_source: "NCBI MeSH Life Support Care",
    source_type: "medical_dictionary",
    suggested_chart_term: "life support",
    should_show_exact_phrase: "maybe",
    notes: "Exact phrase exists in Ngram but is weaker than life support plus artificial respiration / artificial feeding / mechanical ventilation.",
  },
  {
    item: "life-saving apparatus",
    status: "weak_as_exact_phrase",
    strongest_source: "variant Ngram and respirator history",
    source_type: "ngram_variant + medical_history",
    suggested_chart_term: "apparatus / device support",
    should_show_exact_phrase: "no",
    notes: "Use as conceptual Layer 1 background, not as labeled node.",
  },
  {
    item: "test-tube baby",
    status: "strengthened",
    strongest_source: "NCBI MeSH IVF entry terms; Britannica Louise Brown",
    source_type: "medical_dictionary + encyclopedia",
    suggested_chart_term: "IVF / test-tube baby",
    should_show_exact_phrase: "maybe",
    notes: "Use as public-language bridge under IVF, not as standalone technical core.",
  },
];

const integrationRows = [
  ["Layer 1 apparatus base", "use_quietly", "artificial respiration apparatus; mechanical respirator; iron lung", "background scaffolding under Body Support", "Do not over-expand Layer 1; keep as entry ramp."],
  ["Body Support", "strengthened", "artificial respiration; artificial feeding; life support; mechanical ventilation", "core lower human-boundary layer", "Exact artificial life support phrase should remain secondary."],
  ["Reproduction / Continuation", "strengthened", "IVF; artificial insemination; artificial womb; test-tube baby as public phrase", "continuation layer with careful experimental edge", "Artificial womb needs preclinical/speculative styling."],
  ["Artificial life bridge", "strengthened_but_split", "biological_life; computational_life; philosophical_life", "bridge node between life continuation and process simulation", "Do not assign artificial life solely to reproduction."],
  ["AI boundary", "unchanged_controlled", "AI / AGI / consciousness / companion", "highest edge only", "No new reason to center AI."],
];

function csvEscape(value) {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (/[",\n\r]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

function toCsv(rows, columns) {
  return [columns.join(","), ...rows.map((row) => columns.map((column) => csvEscape(row[column])).join(","))].join("\n") + "\n";
}

async function writeCsv(file, rows, columns) {
  await fs.mkdir(path.dirname(path.join(ROOT, file)), { recursive: true });
  await fs.writeFile(path.join(ROOT, file), toCsv(rows, columns), "utf8");
}

async function fetchNgramBatch(terms) {
  const url = new URL("https://books.google.com/ngrams/json");
  url.searchParams.set("content", terms.join(","));
  url.searchParams.set("year_start", String(ngramSettings.yearStart));
  url.searchParams.set("year_end", String(ngramSettings.yearEnd));
  url.searchParams.set("corpus", ngramSettings.corpus);
  url.searchParams.set("smoothing", String(ngramSettings.smoothing));
  url.searchParams.set("case_insensitive", "true");
  const response = await fetch(url, {
    headers: { "User-Agent": "WordsOverTime/1.0 chart05 supplement" },
  });
  if (!response.ok) throw new Error(`Ngram fetch failed ${response.status}`);
  return response.json();
}

function cleanNgramName(name) {
  return name.replace(/\s+\(All\)$/i, "").trim();
}

async function collectNgrams() {
  const terms = variantTerms.map(([term]) => term);
  const batches = [];
  for (let i = 0; i < terms.length; i += 10) batches.push(terms.slice(i, i + 10));

  const ngramMap = new Map();
  const errors = [];
  for (const batch of batches) {
    try {
      const rows = await fetchNgramBatch(batch);
      for (const row of rows) {
        const key = cleanNgramName(row.ngram).toLowerCase();
        const existing = ngramMap.get(key);
        if (!existing || /\(All\)$/i.test(row.ngram)) ngramMap.set(key, row.timeseries ?? []);
      }
    } catch (error) {
      errors.push({ batch: batch.join("; "), error: error.message });
    }
  }

  const rawRows = [];
  const statusRows = [];
  for (const [term, query_group, layer_name, function_mode] of variantTerms) {
    const values = ngramMap.get(term.toLowerCase()) ?? [];
    const nonzero = values
      .map((value, index) => ({ year: ngramSettings.yearStart + index, value }))
      .filter((item) => item.value > 0);
    const status = values.length && nonzero.length > 5 ? "collected" : values.length && nonzero.length > 0 ? "too_sparse" : "missing";
    const peak = nonzero.reduce((best, item) => (item.value > best.value ? item : best), { year: "", value: 0 });
    values.forEach((value, index) => {
      rawRows.push({
        year: ngramSettings.yearStart + index,
        term,
        value,
        source: ngramSettings.source,
        corpus: ngramSettings.corpus,
        smoothing: ngramSettings.smoothing,
        case_sensitive: !ngramSettings.caseInsensitive,
        query_group,
        layer_name,
        function_mode,
      });
    });
    statusRows.push({
      term_or_phrase: term,
      query_group,
      layer_name,
      function_mode,
      status,
      first_nonzero_year: nonzero[0]?.year ?? "",
      last_nonzero_year: nonzero.at(-1)?.year ?? "",
      peak_year: peak.year,
      peak_value: peak.value,
      nonzero_year_count: nonzero.length,
      notes: "Ngram first nonzero year is not first attestation; supplement variants are for visibility only.",
    });
  }
  return { rawRows, statusRows, errors };
}

function layer1StatusRows(statusRows) {
  const relevant = statusRows.filter((row) => row.query_group === "layer1_apparatus_variant");
  return relevant.map((row) => ({
    term_or_phrase: row.term_or_phrase,
    status: row.status,
    strongest_source: row.term_or_phrase.includes("respirator") || row.term_or_phrase === "iron lung" ? "Britannica/JAMA respirator history" : "Ngram variant plus apparatus context",
    should_show_in_chart: ["mechanical respirator", "iron lung", "artificial respirator"].includes(row.term_or_phrase) ? "maybe_background" : "no_or_background",
    visual_treatment: "thin_base_scaffold",
    notes: row.status === "missing" ? "Weak as exact phrase; use apparatus concept instead." : "Useful as apparatus-side context, not a main node.",
  }));
}

function visualReadinessRows(statusRows) {
  return [
    {
      question: "Can Layer 1 remain non-empty without stealing focus?",
      status: "mostly_ready",
      strongest_support: "artificial respiration apparatus / iron lung / mechanical respirator evidence",
      remaining_gap: "Exact artificial aid/apparatus snippets still sparse.",
      visual_guidance: "Use as quiet base lattice, not a layer of large labels.",
    },
    {
      question: "Can artificial life be placed without confusing reproduction and computation?",
      status: "mostly_ready",
      strongest_support: "Langton/ALife field + SEP strong/weak A-Life boundary + early synthetic biology background",
      remaining_gap: "More direct biological/artificial life historical snippets would help.",
      visual_guidance: "Use artificial life as bridge node with split hover labels.",
    },
    {
      question: "Can exact artificial life support be used?",
      status: "partial",
      strongest_support: "Life Support Care + Ngram exact phrase + component technologies",
      remaining_gap: "Exact phrase source is weaker than life support component terms.",
      visual_guidance: "Prefer life support as main node; exact phrase can appear as annotation/variant.",
    },
    {
      question: "Can test-tube baby be restored?",
      status: "ready_as_variant",
      strongest_support: "MeSH IVF entry terms and Britannica Louise Brown",
      remaining_gap: "It is press/public language, not technical core.",
      visual_guidance: "Use as historical label beside IVF, smaller than IVF node.",
    },
    {
      question: "Does this change AI boundary?",
      status: "no_change",
      strongest_support: "Body-side and reproduction anchors strengthened.",
      remaining_gap: "No need to center AI.",
      visual_guidance: "Keep AI as top-layer node inside larger human-continuation stack.",
    },
  ];
}

async function main() {
  await fs.mkdir(ROOT, { recursive: true });
  const { rawRows, statusRows, errors } = await collectNgrams();

  await writeCsv("raw/round_02_targeted_ngram_variants.csv", rawRows, [
    "year",
    "term",
    "value",
    "source",
    "corpus",
    "smoothing",
    "case_sensitive",
    "query_group",
    "layer_name",
    "function_mode",
  ]);
  await writeCsv("raw/round_02_targeted_source_snippets.csv", evidenceRows, [
    "id",
    "term_or_phrase",
    "target_gap",
    "primary_layer",
    "function_mode",
    "source_period",
    "year_or_period",
    "source_name",
    "source_type",
    "source_url",
    "evidence_kind",
    "confidence",
    "short_summary",
    "visual_implication",
    "notes",
  ]);
  await writeCsv("raw/round_02_source_access_log.csv", [
    ["Google Books Ngram", "frequency_source", "1800-2019", "accessed", "variant terms", "No sense disambiguation."],
    ["JCI / PubMed / JAMA records", "medical_journal", "1929-1931", "accessed", "Drinker respirator/artificial respiration apparatus", "Some JAMA full text may be access-limited; JCI/PubMed records are accessible."],
    ["Britannica", "encyclopedia", "historical/modern", "accessed", "iron lung; Louise Brown", "Encyclopedic rather than corpus evidence."],
    ["NCBI Bookshelf", "medical_history", "1900-1950 historical discussion", "accessed", "respiratory technologies/artificial breathing", "Secondary history source."],
    ["NCBI MeSH", "medical_dictionary", "modern controlled vocabulary", "accessed", "IVF entry terms; Life Support Care", "Entry dates are not first attestations."],
    ["PubMed", "medical/academic index", "2008-2026", "accessed", "early synthetic biology; artificial womb", "Abstract/index evidence only for some records."],
    ["Open Library / MIT Press / Routledge", "academic_publisher", "1987-2024", "accessed", "ALife proceedings/journal", "Publisher/library records and journal articles, not full corpus."],
    ["Stanford Encyclopedia of Philosophy", "philosophy_reference", "2026 revision", "accessed", "artificial and synthetic life", "Conceptual boundary source."],
  ].map(([source_name, source_type, period_covered, access_status, terms_checked, limitations]) => ({
    source_name,
    source_type,
    period_covered,
    access_status,
    terms_checked,
    usefulness: "targeted Chart 05 gap filling",
    limitations,
    notes: "",
  })), [
    "source_name",
    "source_type",
    "period_covered",
    "access_status",
    "terms_checked",
    "usefulness",
    "limitations",
    "notes",
  ]);

  await writeCsv("processed/round_02_targeted_evidence_table.csv", evidenceRows, [
    "id",
    "term_or_phrase",
    "target_gap",
    "primary_layer",
    "function_mode",
    "source_period",
    "year_or_period",
    "source_name",
    "source_type",
    "source_url",
    "evidence_kind",
    "confidence",
    "short_summary",
    "visual_implication",
    "notes",
  ]);
  await writeCsv("processed/round_02_targeted_variant_status.csv", statusRows, [
    "term_or_phrase",
    "query_group",
    "layer_name",
    "function_mode",
    "status",
    "first_nonzero_year",
    "last_nonzero_year",
    "peak_year",
    "peak_value",
    "nonzero_year_count",
    "notes",
  ]);
  await writeCsv("processed/round_02_layer1_apparatus_status.csv", layer1StatusRows(statusRows), [
    "term_or_phrase",
    "status",
    "strongest_source",
    "should_show_in_chart",
    "visual_treatment",
    "notes",
  ]);
  await writeCsv("processed/round_02_artificial_life_sense_split.csv", artificialLifeSenseRows, [
    "sense_track",
    "status",
    "strongest_source",
    "period_anchor",
    "visual_treatment",
    "summary",
    "risk",
  ]);
  await writeCsv("processed/round_02_phrase_status.csv", phraseStatusRows, [
    "item",
    "status",
    "strongest_source",
    "source_type",
    "suggested_chart_term",
    "should_show_exact_phrase",
    "notes",
  ]);
  await writeCsv("processed/round_02_chart05_visual_readiness_update.csv", visualReadinessRows(statusRows), [
    "question",
    "status",
    "strongest_support",
    "remaining_gap",
    "visual_guidance",
  ]);
  await writeCsv(
    "processed/round_02_terms_to_integrate.csv",
    integrationRows.map(([item, integration_status, terms, visual_role, notes]) => ({ item, integration_status, terms, visual_role, notes })),
    ["item", "integration_status", "terms", "visual_role", "notes"],
  );

  await fs.writeFile(
    path.join(ROOT, "notes/round_02_collection_log.md"),
    `# Chart 05 Targeted Supplement Round 02

Date/time: ${CREATED_AT}

Purpose: fill targeted gaps from the first Chart 05 data package.

Targets:
- Layer 1 apparatus/support anchors.
- Artificial life sense split.
- Exact artificial life support phrase status.
- Test-tube baby / IVF variant status.

Ngram settings:
- Google Books Ngram, corpus ${ngramSettings.corpus}, ${ngramSettings.yearStart}-${ngramSettings.yearEnd}, smoothing ${ngramSettings.smoothing}, case-insensitive.

Variant terms attempted: ${variantTerms.length}
Structured evidence rows: ${evidenceRows.length}
Ngram errors: ${errors.length ? errors.map((error) => `${error.batch}: ${error.error}`).join("; ") : "none"}
`,
    "utf8",
  );

  await fs.writeFile(
    path.join(ROOT, "notes/round_02_findings.md"),
    `# Chart 05 Targeted Supplement Findings

## Layer 1

Layer 1 is now usable as a quiet apparatus base. The strongest support is not the exact phrase "life-saving apparatus" but the historical cluster around artificial respiration apparatus, mechanical respirators, the Drinker respirator, and the iron lung.

## Artificial Life

Artificial life should remain a bridge node with sense split:
- biological/synthetic-life prehistory: partially supported.
- computational ALife: strongest and most chart-ready.
- philosophical/Strong A-Life boundary: useful as caution, not center.

## Artificial Life Support

Use "life support" as the hard node. The exact phrase "artificial life support" can appear as a variant/annotation but should not dominate the support layer.

## Test-Tube Baby

The variant is strengthened. MeSH maps test-tube baby terms under IVF, and Louise Brown supplies a clear 1978 public-history anchor. Use it as public-language bridge under IVF, not as the technical core.
`,
    "utf8",
  );

  await fs.writeFile(
    path.join(ROOT, "notes/round_02_visual_integration_notes.md"),
    `# Chart 05 Visual Integration Notes

- Keep the body-side layers visually stronger than the AI layer.
- Draw Layer 1 as a thin external apparatus lattice or base plane.
- Put Body Support and Body Replacement in separate strata: support = sustain process; replacement = restore/substitute function.
- Treat Artificial Life as a split bridge, not a single reproductive node.
- Prefer IVF / artificial insemination / artificial womb as Layer 4 nodes; use test-tube baby as public-language marker.
- Keep AGI, artificial consciousness, artificial agent, and artificial companion at edge/notes level unless a later round explicitly expands them.
`,
    "utf8",
  );

  await fs.writeFile(
    path.join(ROOT, "sources/README.md"),
    `# Chart 05 Targeted Supplement Sources

Structured URLs are stored in raw/round_02_targeted_source_snippets.csv and processed/round_02_targeted_evidence_table.csv.

This round uses Google Books Ngram, JAMA/JAMA Network records, Britannica, NCBI Bookshelf, NCBI MeSH, PubMed, Routledge/MIT Press, and Stanford Encyclopedia of Philosophy.
`,
    "utf8",
  );

  console.log(JSON.stringify({
    variant_terms_attempted: variantTerms.length,
    ngram_rows: rawRows.length,
    structured_evidence_rows: evidenceRows.length,
    ngram_errors: errors,
    output: ROOT,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
