import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = path.join(process.cwd(), "src", "data", "generated");
const RESEARCH_DIR = path.join(process.cwd(), "docs", "research");

const START_YEAR = 1800;
const END_YEAR = 2022;
const SMOOTHING = 0;
const BATCH_SIZE = 10;
const REQUEST_DELAY_MS = 350;

const CORPORA = [
  { id: "en", label: "English" },
  { id: "en-US", label: "American English" },
  { id: "en-GB", label: "British English" },
];

const VALID_BRANCHES = [
  "core",
  "evidence_measurement",
  "administrative_recordkeeping",
  "computational_processing",
  "database_structured_access",
  "networked_trace_interoperability",
  "personal_data_governance",
  "commercial_analytics_decision",
  "ai_training_synthetic_generation",
  "grammar",
] as const;

type Branch = (typeof VALID_BRANCHES)[number];
type VisualRole = "major_node" | "minor_node" | "annotation" | "hidden_search_term";
type DataLayer = "raw" | "computed" | "curated" | "interpretive";
type Confidence = "high" | "medium" | "low";
type QualityStatus = "ok" | "sparse" | "noisy" | "missing" | "requires_manual_review";

type TermDefinition = {
  term: string;
  variants: string[];
  branch: Branch;
  domain: string;
  visual_role: VisualRole;
  data_layer: DataLayer;
  confidence_level: Confidence;
  first_attestation: string | null;
  first_strong_visibility: string | null;
  notes: string;
  caveat: string;
  source_ids: string[];
};

type NgramResponse = {
  ngram: string;
  parent: string;
  type: string;
  timeseries: number[];
};

type FrequencyPoint = {
  year: number;
  value: number;
  frequencyPerMillion: number;
};

type FrequencySeries = {
  series_id: string;
  term: string;
  term_slug: string;
  corpus: string;
  corpus_label: string;
  year_start: number;
  year_end: number;
  smoothing: number;
  case_insensitive: boolean;
  ngram: string | null;
  request_url: string;
  points: FrequencyPoint[];
  first_non_zero_year: number | null;
  max_year: number | null;
  max_value: number;
  max_frequency_per_million: number;
  average_frequency_by_period: Array<{
    period: string;
    start_year: number;
    end_year: number;
    average_frequency_per_million: number;
    max_frequency_per_million: number;
    non_zero_year_count: number;
  }>;
  threshold_years: {
    above_0: number | null;
    above_0_1_per_million: number | null;
    above_1_per_million: number | null;
    above_5_per_million: number | null;
  };
  data_quality_status: QualityStatus;
  data_layer: DataLayer;
  caveat: string;
};

function slug(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function canonical(value: string) {
  return value
    .toLowerCase()
    .replace(/\s*\(all\)$/i, "")
    .replace(/\s*-\s*/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

function batch<T>(items: T[], size: number) {
  const batches: T[][] = [];
  for (let index = 0; index < items.length; index += size) batches.push(items.slice(index, index + size));
  return batches;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function average(values: number[]) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

function rounded(value: number, digits = 8) {
  return Number(value.toFixed(digits));
}

function periodStats(points: FrequencyPoint[], start: number, end: number) {
  const range = points.filter((point) => point.year >= start && point.year <= end);
  const values = range.map((point) => point.frequencyPerMillion);
  return {
    period: `${start}-${end}`,
    start_year: start,
    end_year: end,
    average_frequency_per_million: rounded(average(values)),
    max_frequency_per_million: rounded(Math.max(0, ...values)),
    non_zero_year_count: range.filter((point) => point.frequencyPerMillion > 0).length,
  };
}

function firstYearAbove(points: FrequencyPoint[], thresholdPerMillion: number) {
  return points.find((point) => point.frequencyPerMillion > thresholdPerMillion)?.year ?? null;
}

function maxPoint(points: FrequencyPoint[]) {
  return points.reduce(
    (best, point) => (point.frequencyPerMillion > best.frequencyPerMillion ? point : best),
    { year: null as number | null, value: 0, frequencyPerMillion: 0 },
  );
}

function qualityFor(term: TermDefinition, points: FrequencyPoint[], ngram: string | null): QualityStatus {
  if (!ngram) return "missing";

  const max = maxPoint(points).frequencyPerMillion;
  const nonZero = points.filter((point) => point.frequencyPerMillion > 0).length;
  const termSlug = slug(term.term);
  const noisyTerms = new Set([
    "data-base",
    "data-set",
    "big-data",
    "data-driven",
    "user-data",
    "search-data",
    "log-data",
    "machine-readable-data",
    "labelled-data",
    "labeled-data",
    "synthetic-data",
    "datafication",
  ]);

  if (nonZero < 5 || max < 0.001) return "sparse";
  if (noisyTerms.has(termSlug)) return "requires_manual_review";
  if (term.confidence_level === "low") return "requires_manual_review";
  if (term.visual_role === "hidden_search_term") return "noisy";
  return "ok";
}

function sourceUrlFor(terms: TermDefinition[], corpus: string) {
  const url = new URL("https://books.google.com/ngrams/json");
  url.searchParams.set("content", terms.map((term) => term.term).join(","));
  url.searchParams.set("year_start", String(START_YEAR));
  url.searchParams.set("year_end", String(END_YEAR));
  url.searchParams.set("corpus", corpus);
  url.searchParams.set("smoothing", String(SMOOTHING));
  url.searchParams.set("case_insensitive", "true");
  return url;
}

async function fetchNgramBatch(terms: TermDefinition[], corpus: string) {
  const url = sourceUrlFor(terms, corpus);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Google Ngram request failed for ${corpus}: ${response.status} ${response.statusText}`);
  }
  return { url: url.toString(), rows: (await response.json()) as NgramResponse[] };
}

const sources = [
  {
    source_id: "src_google_ngram",
    title: "Google Books Ngram Viewer",
    author_or_org: "Google Books / Google Research",
    year: "2022 corpus endpoint",
    source_type: "ngram",
    url: "https://books.google.com/ngrams/",
    reliability: "medium",
    used_for: ["long-run printed-book visibility", "corpus comparison"],
    limitations: "Book corpus only; OCR, dating, language detection, genre mix, and corpus updates can affect results. Not semantic proof.",
  },
  {
    source_id: "src_coha",
    title: "Corpus of Historical American English",
    author_or_org: "English-Corpora.org",
    year: "1810s-2010s",
    source_type: "corpus",
    url: "https://www.english-corpora.org/coha/",
    reliability: "high",
    used_for: ["future historical collocation validation", "grammar validation"],
    limitations: "Bulk extraction may require interface access or subscription; not fetched in this pass.",
  },
  {
    source_id: "src_coca",
    title: "Corpus of Contemporary American English",
    author_or_org: "English-Corpora.org",
    year: "1990-2019",
    source_type: "corpus",
    url: "https://www.english-corpora.org/coca/",
    reliability: "high",
    used_for: ["future contemporary collocations", "grammar by genre"],
    limitations: "Bulk extraction may require interface access or subscription; not fetched in this pass.",
  },
  {
    source_id: "src_now",
    title: "NOW Corpus",
    author_or_org: "English-Corpora.org",
    year: "2010-present",
    source_type: "corpus",
    url: "https://www.english-corpora.org/now/",
    reliability: "high",
    used_for: ["recent news/web terms", "data breach and AI-era validation"],
    limitations: "News/web register; not fetched in this pass.",
  },
  {
    source_id: "src_mw_data",
    title: "Merriam-Webster Dictionary: data",
    author_or_org: "Merriam-Webster",
    year: "current",
    source_type: "dictionary",
    url: "https://www.merriam-webster.com/dictionary/data",
    reliability: "high",
    used_for: ["data definition", "first known use", "singular/plural usage"],
    limitations: "Dictionary attestation is not frequency or cultural prominence.",
  },
  {
    source_id: "src_mw_datum",
    title: "Merriam-Webster Dictionary: datum",
    author_or_org: "Merriam-Webster",
    year: "current",
    source_type: "dictionary",
    url: "https://www.merriam-webster.com/dictionary/datum",
    reliability: "high",
    used_for: ["datum definition", "lexical root"],
    limitations: "Dictionary attestation is not frequency or cultural prominence.",
  },
  {
    source_id: "src_etymonline_data",
    title: "Online Etymology Dictionary: data",
    author_or_org: "Douglas Harper",
    year: "current",
    source_type: "dictionary",
    url: "https://www.etymonline.com/word/data",
    reliability: "medium",
    used_for: ["etymology", "dated semantic notes"],
    limitations: "Secondary lexical source; confirm exact claims with OED or primary quotations before final public copy.",
  },
  {
    source_id: "src_mw_data_processing",
    title: "Merriam-Webster Dictionary: data processing",
    author_or_org: "Merriam-Webster",
    year: "current",
    source_type: "dictionary",
    url: "https://www.merriam-webster.com/dictionary/data%20processing",
    reliability: "high",
    used_for: ["data processing attestation", "computing branch"],
    limitations: "Attestation does not measure public visibility.",
  },
  {
    source_id: "src_mw_database",
    title: "Merriam-Webster Dictionary: database",
    author_or_org: "Merriam-Webster",
    year: "current",
    source_type: "dictionary",
    url: "https://www.merriam-webster.com/dictionary/database",
    reliability: "high",
    used_for: ["database attestation", "structured access branch"],
    limitations: "Modern spelling should be compared with spaced variant 'data base'.",
  },
  {
    source_id: "src_mw_dataset",
    title: "Merriam-Webster Dictionary: dataset",
    author_or_org: "Merriam-Webster",
    year: "current",
    source_type: "dictionary",
    url: "https://www.merriam-webster.com/dictionary/dataset",
    reliability: "high",
    used_for: ["dataset attestation", "AI bridge term"],
    limitations: "Spaced variant 'data set' requires separate frequency treatment.",
  },
  {
    source_id: "src_mw_data_bank",
    title: "Merriam-Webster Dictionary: data bank",
    author_or_org: "Merriam-Webster",
    year: "current",
    source_type: "dictionary",
    url: "https://www.merriam-webster.com/dictionary/data%20bank",
    reliability: "high",
    used_for: ["legacy database vocabulary"],
    limitations: "Term may be historically visible but less central to current page UI.",
  },
  {
    source_id: "src_mw_metadata",
    title: "Merriam-Webster Dictionary: metadata",
    author_or_org: "Merriam-Webster",
    year: "current",
    source_type: "dictionary",
    url: "https://www.merriam-webster.com/dictionary/metadata",
    reliability: "high",
    used_for: ["metadata attestation", "data-about-data branch"],
    limitations: "Does not itself separate library, web, and surveillance uses.",
  },
  {
    source_id: "src_mw_data_mining",
    title: "Merriam-Webster Dictionary: data mining",
    author_or_org: "Merriam-Webster",
    year: "current",
    source_type: "dictionary",
    url: "https://www.merriam-webster.com/dictionary/data%20mining",
    reliability: "high",
    used_for: ["data mining attestation", "commercial analytics branch"],
    limitations: "Needs policy and business context for social interpretation.",
  },
  {
    source_id: "src_cambridge_data",
    title: "Cambridge Dictionary: data",
    author_or_org: "Cambridge University Press",
    year: "current",
    source_type: "dictionary",
    url: "https://dictionary.cambridge.org/dictionary/english/data",
    reliability: "high",
    used_for: ["mass noun and singular/plural grammar note"],
    limitations: "Modern usage guide, not historical corpus evidence.",
  },
  {
    source_id: "src_nist_big_data",
    title: "NIST Big Data Interoperability Framework",
    author_or_org: "National Institute of Standards and Technology",
    year: "2015",
    source_type: "technical",
    url: "https://www.nist.gov/programs-projects/nist-big-data-public-working-group",
    reliability: "high",
    used_for: ["big data technical context"],
    limitations: "Technical framework; not lexical first-use evidence.",
  },
  {
    source_id: "src_oecd_open_data",
    title: "OECD Open Government Data",
    author_or_org: "OECD",
    year: "current",
    source_type: "policy",
    url: "https://www.oecd.org/en/topics/open-government-data.html",
    reliability: "high",
    used_for: ["open data policy context"],
    limitations: "Policy source, not general language corpus.",
  },
  {
    source_id: "src_oecd_data_driven_innovation",
    title: "Data-Driven Innovation",
    author_or_org: "OECD",
    year: "2015",
    source_type: "policy",
    url: "https://www.oecd.org/sti/data-driven-innovation-9789264229358-en.htm",
    reliability: "high",
    used_for: ["data as innovation and decision infrastructure"],
    limitations: "Policy/economic frame, not neutral lexical evidence.",
  },
  {
    source_id: "src_ico_personal_data",
    title: "What is personal data?",
    author_or_org: "UK Information Commissioner's Office",
    year: "current",
    source_type: "legal",
    url: "https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/personal-information-what-is-it/",
    reliability: "high",
    used_for: ["personal data definition", "UK/EU governance branch"],
    limitations: "Jurisdiction-specific legal meaning.",
  },
  {
    source_id: "src_ico_data_protection",
    title: "Guide to data protection",
    author_or_org: "UK Information Commissioner's Office",
    year: "current",
    source_type: "legal",
    url: "https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/data-protection-principles/",
    reliability: "high",
    used_for: ["data protection principles"],
    limitations: "Jurisdiction-specific legal meaning.",
  },
  {
    source_id: "src_gdpr_article_4",
    title: "GDPR Article 4 definitions",
    author_or_org: "European Union / GDPR.eu",
    year: "2016",
    source_type: "legal",
    url: "https://gdpr.eu/article-4-definitions/",
    reliability: "high",
    used_for: ["personal data", "processing", "personal data breach definitions"],
    limitations: "GDPR.eu is an explanatory publication; final legal copy should reference official EU text.",
  },
  {
    source_id: "src_ftc_data_brokers",
    title: "FTC data brokers report",
    author_or_org: "Federal Trade Commission",
    year: "2014",
    source_type: "policy",
    url: "https://www.ftc.gov/news-events/press-releases/2014/05/ftc-recommends-congress-require-data-broker-industry-be-more",
    reliability: "high",
    used_for: ["data broker and commercial personal-data market"],
    limitations: "US regulatory frame, not broad corpus evidence.",
  },
  {
    source_id: "src_ftc_social_media_data",
    title: "FTC report on social media and video streaming surveillance",
    author_or_org: "Federal Trade Commission",
    year: "2024",
    source_type: "policy",
    url: "https://www.ftc.gov/news-events/news/press-releases/2024/09/ftc-staff-report-finds-large-social-media-video-streaming-companies-have-engaged-vast-surveillance",
    reliability: "high",
    used_for: ["platform data", "user data", "commercial monetization"],
    limitations: "Recent regulatory source; not historical frequency evidence.",
  },
  {
    source_id: "src_stanford_training_data",
    title: "What is training data?",
    author_or_org: "Stanford HAI",
    year: "current",
    source_type: "academic",
    url: "https://hai.stanford.edu/ai-definitions/what-is-training-data",
    reliability: "high",
    used_for: ["training data definition"],
    limitations: "Current AI explainer, not historical usage source.",
  },
  {
    source_id: "src_nist_synthetic_data",
    title: "Synthetic data definitions and context",
    author_or_org: "National Institute of Standards and Technology",
    year: "current",
    source_type: "technical",
    url: "https://www.nist.gov/",
    reliability: "medium",
    used_for: ["synthetic data technical context"],
    limitations: "Use a more specific NIST page or academic source before final public copy.",
  },
  {
    source_id: "src_cleveland_data_science",
    title: "Data Science: An Action Plan for Expanding the Technical Areas of the Field of Statistics",
    author_or_org: "William S. Cleveland",
    year: "2001",
    source_type: "academic",
    url: "https://doi.org/10.1111/j.1751-5823.2001.tb00477.x",
    reliability: "high",
    used_for: ["modern data science disciplinary sense"],
    limitations: "Academic disciplinary framing, not public language frequency.",
  },
  {
    source_id: "src_van_dijck_datafication",
    title: "Datafication, dataism and dataveillance",
    author_or_org: "Jose van Dijck",
    year: "2014",
    source_type: "academic",
    url: "https://ojs.library.queensu.ca/index.php/surveillance-and-society/article/view/datafication",
    reliability: "high",
    used_for: ["datafication critical concept"],
    limitations: "Academic concept; should be an annotation rather than primary frequency anchor.",
  },
  {
    source_id: "src_1890_census",
    title: "1890 Census and punch-card tabulation context",
    author_or_org: "United States Census Bureau / history sources",
    year: "1890",
    source_type: "historical",
    url: "https://www.census.gov/history/www/innovations/technology/the_hollerith_tabulator.html",
    reliability: "high",
    used_for: ["administrative recordkeeping", "punch-card bridge"],
    limitations: "Context source; not direct lexical frequency evidence.",
  },
] as const;

const terms: TermDefinition[] = [
  { term: "data", variants: [], branch: "core", domain: "lexical root", visual_role: "major_node", data_layer: "raw", confidence_level: "high", first_attestation: "1630", first_strong_visibility: "persistent from scientific/statistical print; accelerates in 20th century", notes: "Core lemma and semantic root for all branch terms.", caveat: "Frequency mixes senses and cannot identify meaning without context.", source_ids: ["src_mw_data", "src_etymonline_data", "src_google_ngram"] },
  { term: "datum", variants: [], branch: "core", domain: "lexical root", visual_role: "minor_node", data_layer: "raw", confidence_level: "high", first_attestation: "1646", first_strong_visibility: "specialized/formal use; declines relative to data after mid-20th century", notes: "Singular form that preserves the 'something given' root.", caveat: "Technical and formal distribution differs from the mass noun data.", source_ids: ["src_mw_datum", "src_etymonline_data", "src_google_ngram"] },
  { term: "statistical data", variants: [], branch: "evidence_measurement", domain: "statistics", visual_role: "minor_node", data_layer: "curated", confidence_level: "medium", first_attestation: null, first_strong_visibility: "early 20th century in books", notes: "Data as numerical evidence for statistical inference.", caveat: "Exact attestation requires dictionary or corpus snippet review.", source_ids: ["src_google_ngram", "src_coha"] },
  { term: "empirical data", variants: [], branch: "evidence_measurement", domain: "science", visual_role: "minor_node", data_layer: "curated", confidence_level: "medium", first_attestation: null, first_strong_visibility: "mid-late 20th century in books", notes: "Data as observed evidence from experience or experiment.", caveat: "Requires snippet review to distinguish philosophical and scientific uses.", source_ids: ["src_google_ngram", "src_coha"] },
  { term: "observational data", variants: [], branch: "evidence_measurement", domain: "science", visual_role: "minor_node", data_layer: "curated", confidence_level: "medium", first_attestation: null, first_strong_visibility: "late 20th century", notes: "Data as observations rather than experimental interventions.", caveat: "May be field-specific; use as support term unless corpus signal is strong.", source_ids: ["src_google_ngram", "src_coha"] },
  { term: "census data", variants: [], branch: "administrative_recordkeeping", domain: "administration", visual_role: "minor_node", data_layer: "curated", confidence_level: "medium", first_attestation: null, first_strong_visibility: "20th century", notes: "Administrative population records and tabulations.", caveat: "The 1890 punch-card context is historical evidence, not necessarily phrase-frequency evidence.", source_ids: ["src_1890_census", "src_google_ngram"] },
  { term: "data collection", variants: [], branch: "administrative_recordkeeping", domain: "administration", visual_role: "major_node", data_layer: "curated", confidence_level: "medium", first_attestation: null, first_strong_visibility: "1960s-present", notes: "Procedural intake step shared by science, administration, and platforms.", caveat: "Broad phrase; needs context when assigned to a specific branch.", source_ids: ["src_google_ngram", "src_coha"] },
  { term: "data entry", variants: [], branch: "administrative_recordkeeping", domain: "administration", visual_role: "minor_node", data_layer: "curated", confidence_level: "medium", first_attestation: "1969", first_strong_visibility: "1970s-1990s", notes: "Encoding records into machine systems.", caveat: "First attestation from secondary lexical notes should be verified before final copy.", source_ids: ["src_etymonline_data", "src_google_ngram"] },
  { term: "data tabulation", variants: [], branch: "administrative_recordkeeping", domain: "administration", visual_role: "minor_node", data_layer: "curated", confidence_level: "low", first_attestation: null, first_strong_visibility: "20th century if supported", notes: "Bridge between counting records and machine processing.", caveat: "Potentially sparse and phrase-specific; likely hover-only unless Ngram is strong.", source_ids: ["src_1890_census", "src_google_ngram"] },
  { term: "data processing", variants: [], branch: "computational_processing", domain: "computing", visual_role: "major_node", data_layer: "raw", confidence_level: "high", first_attestation: "1954", first_strong_visibility: "1960s-1980s", notes: "Postwar pivot to machine-processable information.", caveat: "Frequency shows printed visibility, not the full history of computing practice.", source_ids: ["src_mw_data_processing", "src_google_ngram"] },
  { term: "computer data", variants: [], branch: "computational_processing", domain: "computing", visual_role: "hidden_search_term", data_layer: "curated", confidence_level: "low", first_attestation: null, first_strong_visibility: "1960s-1980s", notes: "Direct modifier tying data to computers.", caveat: "Broad/noisy and less conceptually useful than data processing or database.", source_ids: ["src_google_ngram"] },
  { term: "digital data", variants: [], branch: "computational_processing", domain: "computing", visual_role: "hidden_search_term", data_layer: "curated", confidence_level: "low", first_attestation: null, first_strong_visibility: "1970s-1990s", notes: "Data as digitally encoded information.", caveat: "Broad phrase; keep as back-end support unless needed.", source_ids: ["src_google_ngram"] },
  { term: "machine-readable data", variants: ["machine readable data"], branch: "computational_processing", domain: "computing", visual_role: "annotation", data_layer: "curated", confidence_level: "medium", first_attestation: null, first_strong_visibility: "2000s policy/standards context", notes: "Bridge from computing to open-data and interoperability policy.", caveat: "Hyphenation and standards language make Ngram noisy.", source_ids: ["src_oecd_open_data", "src_google_ngram"] },
  { term: "data storage", variants: [], branch: "computational_processing", domain: "computing", visual_role: "minor_node", data_layer: "curated", confidence_level: "medium", first_attestation: null, first_strong_visibility: "1970s-present", notes: "Infrastructure stage after collection and before retrieval/analysis.", caveat: "Broad technical term; better as pipeline node than standalone story.", source_ids: ["src_google_ngram"] },
  { term: "data retrieval", variants: [], branch: "computational_processing", domain: "information retrieval", visual_role: "major_node", data_layer: "curated", confidence_level: "medium", first_attestation: null, first_strong_visibility: "1960s-1990s", notes: "Retrieval makes stored data queryable and useful.", caveat: "Needs snippet review to separate generic retrieval from database/information-retrieval technical use.", source_ids: ["src_google_ngram", "src_mw_database"] },
  { term: "database", variants: ["data base"], branch: "database_structured_access", domain: "database", visual_role: "major_node", data_layer: "raw", confidence_level: "high", first_attestation: "c.1962", first_strong_visibility: "1970s-1990s", notes: "Structured data collection for access and query.", caveat: "Merge or compare with 'data base' for historical spelling/segmentation.", source_ids: ["src_mw_database", "src_google_ngram"] },
  { term: "data base", variants: ["database"], branch: "database_structured_access", domain: "database", visual_role: "minor_node", data_layer: "curated", confidence_level: "medium", first_attestation: null, first_strong_visibility: "1960s-1980s", notes: "Spaced precursor/variant of database.", caveat: "Likely noisy before technical sense; use as variant support.", source_ids: ["src_mw_database", "src_google_ngram"] },
  { term: "data bank", variants: ["databank"], branch: "database_structured_access", domain: "database", visual_role: "minor_node", data_layer: "raw", confidence_level: "high", first_attestation: "1966", first_strong_visibility: "1970s-1980s", notes: "Legacy term for stored collections of data.", caveat: "Historically useful but probably not a primary modern node.", source_ids: ["src_mw_data_bank", "src_google_ngram"] },
  { term: "dataset", variants: ["data set"], branch: "database_structured_access", domain: "scientific data / AI", visual_role: "major_node", data_layer: "raw", confidence_level: "high", first_attestation: "1958", first_strong_visibility: "1990s-2010s", notes: "Packaged unit of data; key bridge to AI training material.", caveat: "Compare one-word and spaced forms separately.", source_ids: ["src_mw_dataset", "src_google_ngram"] },
  { term: "data set", variants: ["dataset"], branch: "database_structured_access", domain: "scientific data / AI", visual_role: "minor_node", data_layer: "curated", confidence_level: "medium", first_attestation: null, first_strong_visibility: "1970s-2000s", notes: "Spaced form of dataset.", caveat: "Older hits can be generic; treat as variant support.", source_ids: ["src_mw_dataset", "src_google_ngram"] },
  { term: "data management", variants: [], branch: "database_structured_access", domain: "database / governance", visual_role: "minor_node", data_layer: "curated", confidence_level: "medium", first_attestation: null, first_strong_visibility: "1980s-2010s", notes: "Organizational discipline around data quality, storage, and access.", caveat: "Overlaps database, governance, and enterprise management.", source_ids: ["src_google_ngram"] },
  { term: "data warehouse", variants: [], branch: "database_structured_access", domain: "database / analytics", visual_role: "annotation", data_layer: "curated", confidence_level: "medium", first_attestation: null, first_strong_visibility: "1990s-2000s", notes: "Enterprise data infrastructure for analytics.", caveat: "Specialized term; likely annotation rather than backbone.", source_ids: ["src_google_ngram"] },
  { term: "metadata", variants: [], branch: "networked_trace_interoperability", domain: "information systems", visual_role: "major_node", data_layer: "raw", confidence_level: "high", first_attestation: "1983", first_strong_visibility: "late 1990s-2010s", notes: "Data about data; bridge between indexing, web resources, and platform trace.", caveat: "Do not treat every metadata use as surveillance.", source_ids: ["src_mw_metadata", "src_google_ngram"] },
  { term: "open data", variants: [], branch: "networked_trace_interoperability", domain: "open government", visual_role: "major_node", data_layer: "curated", confidence_level: "medium", first_attestation: null, first_strong_visibility: "2005-2015", notes: "Machine-readable, reusable public data policy branch.", caveat: "Policy salience matters more than book frequency.", source_ids: ["src_oecd_open_data", "src_google_ngram"] },
  { term: "user data", variants: [], branch: "networked_trace_interoperability", domain: "platforms", visual_role: "minor_node", data_layer: "curated", confidence_level: "low", first_attestation: null, first_strong_visibility: "2010s-2026", notes: "Data produced by or about users in networked systems.", caveat: "Recent/platform-heavy; validate with NOW, FTC, and snippets.", source_ids: ["src_ftc_social_media_data", "src_now", "src_google_ngram"] },
  { term: "search data", variants: [], branch: "networked_trace_interoperability", domain: "search platforms", visual_role: "annotation", data_layer: "curated", confidence_level: "low", first_attestation: null, first_strong_visibility: "2010s-2026", notes: "Queries, clicks, and search logs as data traces.", caveat: "Likely sparse/noisy in books; needs web and policy validation.", source_ids: ["src_now", "src_google_ngram"] },
  { term: "clickstream data", variants: [], branch: "networked_trace_interoperability", domain: "web analytics", visual_role: "minor_node", data_layer: "curated", confidence_level: "medium", first_attestation: null, first_strong_visibility: "2000s-2010s", notes: "Web-navigation traces for analytics.", caveat: "Specialized and recent; likely not a primary public-book signal.", source_ids: ["src_google_ngram", "src_now"] },
  { term: "log data", variants: [], branch: "networked_trace_interoperability", domain: "systems / platforms", visual_role: "hidden_search_term", data_layer: "curated", confidence_level: "low", first_attestation: null, first_strong_visibility: "2000s-present", notes: "System event records; useful search expansion.", caveat: "Very broad and noisy; hide from main view.", source_ids: ["src_google_ngram"] },
  { term: "personal data", variants: [], branch: "personal_data_governance", domain: "privacy / legal", visual_role: "major_node", data_layer: "raw", confidence_level: "high", first_attestation: null, first_strong_visibility: "1980s-2000s", notes: "Legally defined data relating to an identified or identifiable person.", caveat: "Jurisdiction-specific meanings; avoid treating UK/EU legal language as universal.", source_ids: ["src_ico_personal_data", "src_gdpr_article_4", "src_google_ngram"] },
  { term: "data protection", variants: [], branch: "personal_data_governance", domain: "privacy / legal", visual_role: "major_node", data_layer: "raw", confidence_level: "high", first_attestation: null, first_strong_visibility: "1980s-2010s", notes: "Legal/governance frame for lawful processing and rights.", caveat: "Especially strong in UK/EU discourse; US often says privacy or personal information.", source_ids: ["src_ico_data_protection", "src_gdpr_article_4", "src_google_ngram"] },
  { term: "data privacy", variants: [], branch: "personal_data_governance", domain: "privacy / legal", visual_role: "minor_node", data_layer: "curated", confidence_level: "medium", first_attestation: null, first_strong_visibility: "2010s-2026", notes: "Privacy branch phrased around data rather than broader privacy.", caveat: "Recent and news/policy heavy; books understate salience.", source_ids: ["src_now", "src_google_ngram", "src_ftc_social_media_data"] },
  { term: "data breach", variants: [], branch: "personal_data_governance", domain: "privacy / security", visual_role: "major_node", data_layer: "curated", confidence_level: "medium", first_attestation: null, first_strong_visibility: "2010s-2026", notes: "Incident frame around exposed or compromised data.", caveat: "News-heavy; use NOW/legal sources before final chart prominence.", source_ids: ["src_gdpr_article_4", "src_now", "src_google_ngram"] },
  { term: "personal data breach", variants: [], branch: "personal_data_governance", domain: "privacy / legal", visual_role: "annotation", data_layer: "raw", confidence_level: "high", first_attestation: null, first_strong_visibility: "2010s legal context", notes: "GDPR legal phrase for breach affecting personal data.", caveat: "Legal phrase; likely sparse in books but high policy relevance.", source_ids: ["src_gdpr_article_4", "src_google_ngram"] },
  { term: "data rights", variants: [], branch: "personal_data_governance", domain: "rights / governance", visual_role: "annotation", data_layer: "curated", confidence_level: "medium", first_attestation: null, first_strong_visibility: "2010s-2026", notes: "Rights discourse around data access, portability, and control.", caveat: "Conceptually important but needs policy source review before main display.", source_ids: ["src_gdpr_article_4", "src_now", "src_google_ngram"] },
  { term: "data governance", variants: [], branch: "personal_data_governance", domain: "governance", visual_role: "minor_node", data_layer: "curated", confidence_level: "medium", first_attestation: null, first_strong_visibility: "2015-2026", notes: "Management and policy controls around data quality, access, and accountability.", caveat: "Enterprise and public-policy uses may diverge.", source_ids: ["src_oecd_data_driven_innovation", "src_google_ngram"] },
  { term: "data mining", variants: [], branch: "commercial_analytics_decision", domain: "analytics", visual_role: "major_node", data_layer: "raw", confidence_level: "high", first_attestation: "1968", first_strong_visibility: "1990s-2000s", notes: "Extracting patterns or value from large data collections.", caveat: "Technical term with commercial and surveillance implications; context matters.", source_ids: ["src_mw_data_mining", "src_google_ngram"] },
  { term: "big data", variants: [], branch: "commercial_analytics_decision", domain: "analytics", visual_role: "major_node", data_layer: "curated", confidence_level: "medium", first_attestation: "1980 early use; modern sense mid-1990s", first_strong_visibility: "2007-2015", notes: "Scale-oriented term for large, complex, networked datasets and analytics.", caveat: "Early phrase hits can be literal; modern technical sense needs manual review.", source_ids: ["src_nist_big_data", "src_google_ngram"] },
  { term: "data-driven", variants: ["data driven"], branch: "commercial_analytics_decision", domain: "decision infrastructure", visual_role: "major_node", data_layer: "curated", confidence_level: "medium", first_attestation: null, first_strong_visibility: "2005-2015", notes: "Data as basis for institutional or product decisions.", caveat: "Hyphenated query is noisy in Ngram; verify with snippets.", source_ids: ["src_oecd_data_driven_innovation", "src_google_ngram"] },
  { term: "data science", variants: [], branch: "commercial_analytics_decision", domain: "analytics / AI", visual_role: "major_node", data_layer: "curated", confidence_level: "medium", first_attestation: "1974 phrase; 2001 modern disciplinary framing", first_strong_visibility: "2010-2015", notes: "Disciplinary/professional branch connecting statistics, computing, and AI.", caveat: "First phrase-use and modern disciplinary centrality are separate; validate snippets before exact timeline copy.", source_ids: ["src_cleveland_data_science", "src_google_ngram"] },
  { term: "data broker", variants: [], branch: "commercial_analytics_decision", domain: "commercial privacy", visual_role: "major_node", data_layer: "curated", confidence_level: "medium", first_attestation: null, first_strong_visibility: "2014-2026", notes: "Commercial intermediary collecting or selling personal information.", caveat: "Regulatory/policy source is stronger than book corpus.", source_ids: ["src_ftc_data_brokers", "src_google_ngram"] },
  { term: "data monetization", variants: ["data monetisation"], branch: "commercial_analytics_decision", domain: "commercial analytics", visual_role: "annotation", data_layer: "curated", confidence_level: "medium", first_attestation: null, first_strong_visibility: "2010s-2026", notes: "Explicit asset/revenue framing of data.", caveat: "Recent business phrase; validate outside books.", source_ids: ["src_ftc_social_media_data", "src_oecd_data_driven_innovation", "src_google_ngram"] },
  { term: "training data", variants: [], branch: "ai_training_synthetic_generation", domain: "AI / machine learning", visual_role: "major_node", data_layer: "curated", confidence_level: "high", first_attestation: null, first_strong_visibility: "2015-2026", notes: "Examples used to teach machine-learning models.", caveat: "Earlier phrase hits can refer to training as education rather than ML.", source_ids: ["src_stanford_training_data", "src_google_ngram"] },
  { term: "labelled data", variants: ["labeled data"], branch: "ai_training_synthetic_generation", domain: "AI / machine learning", visual_role: "minor_node", data_layer: "curated", confidence_level: "medium", first_attestation: null, first_strong_visibility: "2015-2026", notes: "Training examples with labels; British spelling.", caveat: "Spelling variant and specialized ML use require manual review.", source_ids: ["src_stanford_training_data", "src_google_ngram"] },
  { term: "labeled data", variants: ["labelled data"], branch: "ai_training_synthetic_generation", domain: "AI / machine learning", visual_role: "minor_node", data_layer: "curated", confidence_level: "medium", first_attestation: null, first_strong_visibility: "2015-2026", notes: "Training examples with labels; American spelling.", caveat: "Spelling variant and specialized ML use require manual review.", source_ids: ["src_stanford_training_data", "src_google_ngram"] },
  { term: "synthetic data", variants: [], branch: "ai_training_synthetic_generation", domain: "AI / privacy", visual_role: "major_node", data_layer: "curated", confidence_level: "medium", first_attestation: null, first_strong_visibility: "2020s", notes: "Data generated by models or algorithms rather than directly observed.", caveat: "Modern AI/privacy sense should be validated with technical sources, not Ngram alone.", source_ids: ["src_nist_synthetic_data", "src_google_ngram"] },
  { term: "datafication", variants: [], branch: "ai_training_synthetic_generation", domain: "critical digital studies", visual_role: "annotation", data_layer: "interpretive", confidence_level: "high", first_attestation: null, first_strong_visibility: "2010s-2026", notes: "Critical concept for turning life/processes into data.", caveat: "Academic concept; use as interpretive halo unless corpus signal supports more.", source_ids: ["src_van_dijck_datafication", "src_google_ngram"] },
];

const grammarTerms: TermDefinition[] = [
  { term: "data are", variants: [], branch: "grammar", domain: "grammar", visual_role: "annotation", data_layer: "computed", confidence_level: "medium", first_attestation: null, first_strong_visibility: "persistent formal/scientific pattern", notes: "Plural agreement pattern.", caveat: "Genre-sensitive; annotation only.", source_ids: ["src_mw_data", "src_cambridge_data", "src_google_ngram"] },
  { term: "data is", variants: [], branch: "grammar", domain: "grammar", visual_role: "annotation", data_layer: "computed", confidence_level: "medium", first_attestation: null, first_strong_visibility: "20th-century mass noun growth", notes: "Singular/mass agreement pattern.", caveat: "Genre-sensitive; annotation only.", source_ids: ["src_mw_data", "src_cambridge_data", "src_google_ngram"] },
  { term: "these data", variants: [], branch: "grammar", domain: "grammar", visual_role: "annotation", data_layer: "computed", confidence_level: "medium", first_attestation: null, first_strong_visibility: "formal/scientific pattern", notes: "Plural demonstrative pattern.", caveat: "Genre-sensitive and lower-frequency; annotation only.", source_ids: ["src_mw_data", "src_cambridge_data", "src_google_ngram"] },
  { term: "this data", variants: [], branch: "grammar", domain: "grammar", visual_role: "annotation", data_layer: "computed", confidence_level: "medium", first_attestation: null, first_strong_visibility: "modern mass noun pattern", notes: "Singular/mass demonstrative pattern.", caveat: "Genre-sensitive and lower-frequency; annotation only.", source_ids: ["src_mw_data", "src_cambridge_data", "src_google_ngram"] },
];

const phases = [
  {
    phase_id: "evidence_measurement",
    label: "Evidence and measurement",
    branch: "evidence_measurement",
    date_range: { start: 1630, end: null },
    core_meaning: "Facts, observations, measurements, and givens used for reasoning.",
    representative_terms: ["data", "datum", "statistical data", "empirical data", "observational data"],
    evidence_strength: "strong",
    visual_role: "phase_band",
    caveat: "This layer persists through later phases; it is not replaced.",
    source_ids: ["src_mw_data", "src_mw_datum", "src_etymonline_data"],
    data_layer: "interpretive",
  },
  {
    phase_id: "administrative_recordkeeping",
    label: "Administrative counting and recordkeeping",
    branch: "administrative_recordkeeping",
    date_range: { start: 1890, end: null },
    core_meaning: "Records, tabulations, forms, and administrative observations encoded for counting and retrieval.",
    representative_terms: ["census data", "data collection", "data entry", "data tabulation"],
    evidence_strength: "strong",
    visual_role: "phase_band",
    caveat: "Administrative data overlaps statistics but should remain distinct from scientific evidence.",
    source_ids: ["src_1890_census", "src_google_ngram"],
    data_layer: "interpretive",
  },
  {
    phase_id: "computational_processing",
    label: "Computational processing",
    branch: "computational_processing",
    date_range: { start: 1946, end: null },
    core_meaning: "Machine-readable information processed, stored, retrieved, and transformed by computers.",
    representative_terms: ["data processing", "computer data", "digital data", "machine-readable data", "data storage", "data retrieval"],
    evidence_strength: "strong",
    visual_role: "phase_band",
    caveat: "Computing is a major pivot, not the origin of data as a word.",
    source_ids: ["src_mw_data", "src_mw_data_processing", "src_etymonline_data"],
    data_layer: "interpretive",
  },
  {
    phase_id: "database_structured_access",
    label: "Database and structured access",
    branch: "database_structured_access",
    date_range: { start: 1958, end: null },
    core_meaning: "Organized, queryable, managed collections of data and packaged datasets.",
    representative_terms: ["database", "data base", "data bank", "dataset", "data set", "data management", "data warehouse"],
    evidence_strength: "strong",
    visual_role: "phase_band",
    caveat: "Database terms describe a major branch, not the whole history of computing data.",
    source_ids: ["src_mw_database", "src_mw_dataset", "src_mw_data_bank"],
    data_layer: "interpretive",
  },
  {
    phase_id: "networked_trace_interoperability",
    label: "Networked trace and interoperability",
    branch: "networked_trace_interoperability",
    date_range: { start: 1983, end: null },
    core_meaning: "Data as descriptive metadata, machine-readable public resources, logs, clicks, and platform traces.",
    representative_terms: ["metadata", "open data", "user data", "search data", "clickstream data", "log data"],
    evidence_strength: "medium",
    visual_role: "phase_band",
    caveat: "Recent platform terms require news, policy, and technical sources beyond books.",
    source_ids: ["src_mw_metadata", "src_oecd_open_data", "src_ftc_social_media_data"],
    data_layer: "interpretive",
  },
  {
    phase_id: "personal_data_governance",
    label: "Personal data and governance",
    branch: "personal_data_governance",
    date_range: { start: 1970, end: null },
    core_meaning: "Data as protected personal information, regulated processing, rights, breaches, and governance.",
    representative_terms: ["personal data", "data protection", "data privacy", "data breach", "personal data breach", "data rights", "data governance"],
    evidence_strength: "strong",
    visual_role: "phase_band",
    caveat: "Legal vocabulary is jurisdiction-specific; show UK/EU and US differences carefully.",
    source_ids: ["src_ico_personal_data", "src_ico_data_protection", "src_gdpr_article_4"],
    data_layer: "interpretive",
  },
  {
    phase_id: "commercial_analytics_decision",
    label: "Commercial analytics and decision infrastructure",
    branch: "commercial_analytics_decision",
    date_range: { start: 1990, end: null },
    core_meaning: "Data as extractable value, analytic resource, decision input, and market asset.",
    representative_terms: ["data mining", "big data", "data-driven", "data broker", "data monetization"],
    evidence_strength: "strong",
    visual_role: "phase_band",
    caveat: "Do not reduce all modern data to commercial extraction; this is one branch.",
    source_ids: ["src_mw_data_mining", "src_nist_big_data", "src_oecd_data_driven_innovation", "src_ftc_data_brokers"],
    data_layer: "interpretive",
  },
  {
    phase_id: "ai_training_synthetic_generation",
    label: "AI training and synthetic generation",
    branch: "ai_training_synthetic_generation",
    date_range: { start: 2000, end: null },
    core_meaning: "Data as model training examples, labeled substrate, and synthetic substitute or augmentation.",
    representative_terms: ["training data", "labelled data", "labeled data", "synthetic data", "datafication"],
    evidence_strength: "strong_current",
    visual_role: "phase_band",
    caveat: "Latest layer only; do not present AI as the final or only destination of the word.",
    source_ids: ["src_stanford_training_data", "src_nist_synthetic_data", "src_van_dijck_datafication"],
    data_layer: "interpretive",
  },
];

const relationSeeds = [
  ["datum", "data", "lexical_root", "core", 1, "raw"],
  ["data", "statistical data", "semantic_neighbor", "evidence_measurement", 0.82, "curated"],
  ["data", "empirical data", "semantic_neighbor", "evidence_measurement", 0.78, "curated"],
  ["data", "observational data", "semantic_neighbor", "evidence_measurement", 0.7, "curated"],
  ["census data", "data tabulation", "technical_enables", "administrative_recordkeeping", 0.72, "interpretive"],
  ["data collection", "data entry", "technical_enables", "administrative_recordkeeping", 0.76, "interpretive"],
  ["data entry", "data processing", "technical_enables", "computational_processing", 0.84, "interpretive"],
  ["data collection", "data processing", "technical_enables", "computational_processing", 0.85, "interpretive"],
  ["data processing", "data storage", "processes", "computational_processing", 0.8, "interpretive"],
  ["data storage", "data retrieval", "retrieves", "computational_processing", 0.78, "interpretive"],
  ["data processing", "database", "technical_enables", "database_structured_access", 0.9, "interpretive"],
  ["data base", "database", "semantic_neighbor", "database_structured_access", 0.9, "curated"],
  ["data bank", "database", "semantic_neighbor", "database_structured_access", 0.68, "curated"],
  ["database", "dataset", "stores", "database_structured_access", 0.64, "interpretive"],
  ["database", "metadata", "describes", "networked_trace_interoperability", 0.72, "interpretive"],
  ["metadata", "open data", "institutionalizes", "networked_trace_interoperability", 0.58, "interpretive"],
  ["open data", "machine-readable data", "institutionalizes", "networked_trace_interoperability", 0.7, "interpretive"],
  ["user data", "clickstream data", "semantic_neighbor", "networked_trace_interoperability", 0.66, "curated"],
  ["user data", "search data", "semantic_neighbor", "networked_trace_interoperability", 0.58, "curated"],
  ["log data", "clickstream data", "semantic_neighbor", "networked_trace_interoperability", 0.52, "curated"],
  ["personal data", "data protection", "governs", "personal_data_governance", 0.92, "raw"],
  ["personal data", "data privacy", "governs", "personal_data_governance", 0.78, "curated"],
  ["data protection", "personal data breach", "governs", "personal_data_governance", 0.84, "raw"],
  ["data breach", "personal data breach", "semantic_neighbor", "personal_data_governance", 0.72, "curated"],
  ["personal data", "data rights", "governs", "personal_data_governance", 0.68, "interpretive"],
  ["data governance", "data rights", "governs", "personal_data_governance", 0.6, "interpretive"],
  ["user data", "data mining", "extracts", "commercial_analytics_decision", 0.72, "interpretive"],
  ["data mining", "big data", "semantic_neighbor", "commercial_analytics_decision", 0.7, "curated"],
  ["big data", "data science", "semantic_neighbor", "commercial_analytics_decision", 0.74, "curated"],
  ["big data", "data-driven", "commercializes", "commercial_analytics_decision", 0.74, "interpretive"],
  ["personal data", "data broker", "commercializes", "commercial_analytics_decision", 0.84, "interpretive"],
  ["data broker", "data monetization", "commercializes", "commercial_analytics_decision", 0.8, "interpretive"],
  ["dataset", "training data", "trains_with", "ai_training_synthetic_generation", 0.88, "interpretive"],
  ["labeled data", "training data", "trains_with", "ai_training_synthetic_generation", 0.8, "curated"],
  ["labelled data", "training data", "trains_with", "ai_training_synthetic_generation", 0.76, "curated"],
  ["training data", "synthetic data", "generates", "ai_training_synthetic_generation", 0.72, "interpretive"],
  ["datafication", "training data", "semantic_neighbor", "ai_training_synthetic_generation", 0.48, "interpretive"],
] as const;

const evidenceSeed = [
  ["ev_datum_root", "datum", "core", "1646", "src_mw_datum", "dictionary", "Datum preserves the root sense of something given or admitted as a basis for reasoning.", "Datum: a given basis for reasoning.", "dictionary paraphrase", "high", "tooltip_evidence", "Attestation is not commonness.", "raw"],
  ["ev_data_root", "data", "core", "1630", "src_mw_data", "dictionary", "Data retains both factual-information and digital-information senses.", "Data bridges factual evidence and processable information.", "dictionary paraphrase", "high", "tooltip_evidence", "Definitions do not show frequency.", "raw"],
  ["ev_data_etymology", "data", "core", "1640s / 1946 / 1954", "src_etymonline_data", "dictionary", "Etymology notes early given-fact sense plus later computer and data-processing senses.", "Etymology links givens, computing, and data processing.", "dictionary paraphrase", "medium", "annotation", "Secondary lexical source; verify exact dates for final copy.", "raw"],
  ["ev_statistical_data", "statistical data", "evidence_measurement", "19th-20th century", "src_google_ngram", "ngram", "Ngram can track the phrase as evidence/statistics vocabulary.", "Statistical data is a durable evidence branch.", "computed summary", "medium", "tooltip_evidence", "Needs snippet review.", "computed"],
  ["ev_empirical_data", "empirical data", "evidence_measurement", "19th-20th century", "src_google_ngram", "ngram", "Ngram can track empirical-data visibility as scientific evidence vocabulary.", "Empirical data marks observed evidence.", "computed summary", "medium", "tooltip_evidence", "Needs snippet review.", "computed"],
  ["ev_observational_data", "observational data", "evidence_measurement", "20th century", "src_google_ngram", "ngram", "Phrase supports an observational branch in scientific discourse.", "Observational data adds a non-experimental evidence node.", "computed summary", "medium", "tooltip_evidence", "Field-specific uses require review.", "computed"],
  ["ev_census_punch_cards", "census data", "administrative_recordkeeping", "1890", "src_1890_census", "historical", "The 1890 census tabulation context connects administrative records to machine processing.", "Census records are a bridge from administration to machine tabulation.", "public-domain/government paraphrase", "high", "annotation", "Historical context, not phrase-frequency proof.", "raw"],
  ["ev_data_collection", "data collection", "administrative_recordkeeping", "1960s-present", "src_google_ngram", "ngram", "Phrase is broad but provides a measurable collection-stage node.", "Data collection is the intake stage of the stack.", "computed summary", "medium", "tooltip_evidence", "Branch assignment depends on context.", "computed"],
  ["ev_data_entry", "data entry", "administrative_recordkeeping", "1969", "src_etymonline_data", "dictionary", "Lexical notes identify data entry as a late-1960s compound.", "Data entry marks records becoming machine input.", "dictionary paraphrase", "medium", "tooltip_evidence", "Verify with OED or MW before final public copy.", "raw"],
  ["ev_data_processing_attestation", "data processing", "computational_processing", "1954", "src_mw_data_processing", "dictionary", "First known use anchors a major computing compound.", "Data processing anchors the postwar computing pivot.", "dictionary paraphrase", "high", "tooltip_evidence", "Attestation is not visibility.", "raw"],
  ["ev_data_processing_ngram", "data processing", "computational_processing", "1950s-1980s", "src_google_ngram", "ngram", "Ngram provides a visible mid-century growth curve for data processing.", "Data processing rises strongly after mid-century.", "computed summary", "high", "chart_annotation", "Printed books only.", "computed"],
  ["ev_machine_readable", "machine-readable data", "computational_processing", "2000s policy context", "src_oecd_open_data", "policy", "Open-data policy often requires machine-readable formats.", "Machine-readable data links processing to public-data policy.", "policy paraphrase", "medium", "annotation", "Hyphenated phrase is noisy in Ngram.", "raw"],
  ["ev_database_attestation", "database", "database_structured_access", "c.1962", "src_mw_database", "dictionary", "Dictionary attestation anchors the database branch.", "Database organizes data for access and query.", "dictionary paraphrase", "high", "tooltip_evidence", "Spaced variant should be normalized separately.", "raw"],
  ["ev_dataset_attestation", "dataset", "database_structured_access", "1958", "src_mw_dataset", "dictionary", "Dataset is a key packaged-data term and AI bridge.", "Dataset packages data as a unit.", "dictionary paraphrase", "high", "tooltip_evidence", "Compare with data set.", "raw"],
  ["ev_data_bank_attestation", "data bank", "database_structured_access", "1966", "src_mw_data_bank", "dictionary", "Data bank is a legacy structured-storage term.", "Data bank marks an earlier storage vocabulary.", "dictionary paraphrase", "high", "tooltip_evidence", "Likely secondary to database in the final UI.", "raw"],
  ["ev_metadata_attestation", "metadata", "networked_trace_interoperability", "1983", "src_mw_metadata", "dictionary", "Metadata makes data describe other data.", "Metadata: data about data.", "dictionary paraphrase", "high", "tooltip_evidence", "Do not conflate all metadata with surveillance.", "raw"],
  ["ev_open_data_oecd", "open data", "networked_trace_interoperability", "2000s-2010s", "src_oecd_open_data", "policy", "OECD open-data framing emphasizes accessibility, reuse, and machine readability.", "Open data institutionalizes reuse and machine-readable access.", "policy paraphrase", "high", "tooltip_evidence", "Policy source, not lexical commonness.", "raw"],
  ["ev_user_data_ftc", "user data", "networked_trace_interoperability", "2024", "src_ftc_social_media_data", "policy", "FTC reporting describes large platforms collecting and monetizing personal data at scale.", "Platform user data becomes commercial trace.", "policy paraphrase", "high", "annotation", "Recent US regulatory frame.", "raw"],
  ["ev_personal_data_ico", "personal data", "personal_data_governance", "current legal", "src_ico_personal_data", "legal", "ICO defines personal data as information relating to an identified or identifiable person.", "Personal data is a governed legal object.", "legal paraphrase", "high", "tooltip_evidence", "UK/EU framing; do not universalize.", "raw"],
  ["ev_data_protection_ico", "data protection", "personal_data_governance", "current legal", "src_ico_data_protection", "legal", "ICO guidance frames data protection through principles for lawful processing.", "Data protection governs how personal data is processed.", "legal paraphrase", "high", "tooltip_evidence", "Jurisdiction-specific.", "raw"],
  ["ev_personal_data_breach", "personal data breach", "personal_data_governance", "2016-current", "src_gdpr_article_4", "legal", "GDPR definitions include personal data breach as a security incident affecting personal data.", "Breach language turns data into a security and rights event.", "legal paraphrase", "high", "tooltip_evidence", "Use official EU legal text before final quotation.", "raw"],
  ["ev_data_breach", "data breach", "personal_data_governance", "2010s-present", "src_now", "corpus", "Recent news corpus validation is needed because breach vocabulary is news-heavy.", "Data breach is a news-heavy risk node.", "corpus plan", "medium", "annotation", "Not fully validated in this pass.", "curated"],
  ["ev_data_mining", "data mining", "commercial_analytics_decision", "1968 / 1990s-2000s", "src_mw_data_mining", "dictionary", "Data mining anchors extraction and analytics vocabulary.", "Data mining extracts patterns and value.", "dictionary paraphrase", "high", "tooltip_evidence", "Social interpretation needs context.", "raw"],
  ["ev_big_data_nist", "big data", "commercial_analytics_decision", "2010s", "src_nist_big_data", "technical", "NIST provides a technical framework for big data environments.", "Big data makes scale a semantic event.", "technical paraphrase", "high", "tooltip_evidence", "Early phrase hits may be literal.", "raw"],
  ["ev_data_driven_oecd", "data-driven", "commercial_analytics_decision", "2015", "src_oecd_data_driven_innovation", "policy", "OECD frames data as an input to innovation and decision infrastructure.", "Data-driven links data to institutional decisions.", "policy paraphrase", "high", "annotation", "Policy/economic lens, not all modern usage.", "raw"],
  ["ev_data_broker_ftc", "data broker", "commercial_analytics_decision", "2014", "src_ftc_data_brokers", "policy", "FTC materials identify data brokers as commercial intermediaries in personal information markets.", "Data broker turns personal data into a marketplace object.", "policy paraphrase", "high", "tooltip_evidence", "US regulatory frame.", "raw"],
  ["ev_training_data", "training data", "ai_training_synthetic_generation", "current AI", "src_stanford_training_data", "academic", "Training data is the set of examples used to teach machine-learning models.", "Training data makes data into model substrate.", "academic paraphrase", "high", "tooltip_evidence", "Earlier hits can be non-ML training contexts.", "raw"],
  ["ev_synthetic_data", "synthetic data", "ai_training_synthetic_generation", "2020s", "src_nist_synthetic_data", "technical", "Synthetic data is generated rather than directly observed from real systems.", "Synthetic data is generated data for models, privacy, or simulation.", "technical paraphrase", "medium", "tooltip_evidence", "Use more specific technical source before final copy.", "raw"],
  ["ev_datafication", "datafication", "ai_training_synthetic_generation", "2010s", "src_van_dijck_datafication", "academic", "Datafication names the process of turning social life into quantified data.", "Datafication is an interpretive halo around platform and AI branches.", "academic paraphrase", "high", "annotation", "Academic concept; not a raw frequency anchor.", "interpretive"],
] as const;

async function buildFrequencySeries(termList: TermDefinition[], includePoints: boolean) {
  const series: FrequencySeries[] = [];
  const errors: Array<{ corpus: string; terms: string[]; error: string }> = [];
  const successfulTerms = new Set<string>();

  for (const corpus of CORPORA) {
    for (const termBatch of batch(termList, BATCH_SIZE)) {
      console.log(`Fetching ${corpus.id}: ${termBatch.map((term) => term.term).join(", ")}`);
      let response: { url: string; rows: NgramResponse[] };
      try {
        response = await fetchNgramBatch(termBatch, corpus.id);
      } catch (error) {
        errors.push({
          corpus: corpus.id,
          terms: termBatch.map((term) => term.term),
          error: error instanceof Error ? error.message : String(error),
        });
        await sleep(REQUEST_DELAY_MS);
        continue;
      }

      const rowsByTerm = new Map<string, NgramResponse>();
      for (const row of response.rows) {
        const rowKey = canonical(row.ngram);
        if (row.ngram.endsWith("(All)") || !rowsByTerm.has(rowKey)) {
          rowsByTerm.set(rowKey, row);
        }
      }

      for (const term of termBatch) {
        const row = rowsByTerm.get(canonical(term.term));
        const points = row
          ? row.timeseries.map((value, index) => ({
              year: START_YEAR + index,
              value: rounded(value, 14),
              frequencyPerMillion: rounded(value * 1_000_000),
            }))
          : [];
        const best = maxPoint(points);
        const termSlug = slug(term.term);
        if (row) successfulTerms.add(termSlug);

        series.push({
          series_id: `${termSlug}-${corpus.id.toLowerCase()}`,
          term: term.term,
          term_slug: termSlug,
          corpus: corpus.id,
          corpus_label: corpus.label,
          year_start: START_YEAR,
          year_end: END_YEAR,
          smoothing: SMOOTHING,
          case_insensitive: true,
          ngram: row?.ngram ?? null,
          request_url: response.url,
          points: includePoints ? points : [],
          first_non_zero_year: points.find((point) => point.frequencyPerMillion > 0)?.year ?? null,
          max_year: best.year,
          max_value: rounded(best.value, 14),
          max_frequency_per_million: rounded(best.frequencyPerMillion),
          average_frequency_by_period: [
            periodStats(points, 1800, 1899),
            periodStats(points, 1900, 1949),
            periodStats(points, 1950, 1999),
            periodStats(points, 2000, END_YEAR),
          ],
          threshold_years: {
            above_0: firstYearAbove(points, 0),
            above_0_1_per_million: firstYearAbove(points, 0.1),
            above_1_per_million: firstYearAbove(points, 1),
            above_5_per_million: firstYearAbove(points, 5),
          },
          data_quality_status: qualityFor(term, points, row?.ngram ?? null),
          data_layer: "computed",
          caveat: "Google Books Ngram measures printed-book visibility, not semantic meaning. Case-insensitive aggregates may include OCR and capitalization noise.",
        });
      }

      await sleep(REQUEST_DELAY_MS);
    }
  }

  return { series, errors, successfulTerms };
}

function csvEscape(value: unknown) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function buildCsv(series: FrequencySeries[]) {
  const headers = [
    "term",
    "term_slug",
    "corpus",
    "quality",
    "first_non_zero_year",
    "max_year",
    "max_frequency_per_million",
    "avg_1800_1899",
    "avg_1900_1949",
    "avg_1950_1999",
    "avg_2000_2022",
    "above_0_1_per_million",
    "above_1_per_million",
    "above_5_per_million",
    "ngram",
  ];
  const rows = series.map((item) => {
    const period = Object.fromEntries(
      item.average_frequency_by_period.map((stat) => [stat.period, stat.average_frequency_per_million]),
    );
    return [
      item.term,
      item.term_slug,
      item.corpus,
      item.data_quality_status,
      item.first_non_zero_year,
      item.max_year,
      item.max_frequency_per_million,
      period["1800-1899"],
      period["1900-1949"],
      period["1950-1999"],
      period[`2000-${END_YEAR}`],
      item.threshold_years.above_0_1_per_million,
      item.threshold_years.above_1_per_million,
      item.threshold_years.above_5_per_million,
      item.ngram,
    ];
  });
  return [headers, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n") + "\n";
}

function buildRelations() {
  const termBySlug = new Map(terms.map((term) => [slug(term.term), term]));
  return relationSeeds.map(([fromTerm, toTerm, relationType, branch, weight, layer]) => {
    const fromSlug = slug(fromTerm);
    const toSlug = slug(toTerm);
    const from = termBySlug.get(fromSlug);
    const to = termBySlug.get(toSlug);
    const source_ids = Array.from(new Set([...(from?.source_ids ?? []), ...(to?.source_ids ?? [])])).slice(0, 4);
    return {
      relation_id: `${fromSlug}-to-${toSlug}-${relationType}`,
      from: fromSlug,
      to: toSlug,
      relation_type: relationType,
      branch,
      date_range: { start: null, end: null },
      weight,
      confidence_level: layer === "raw" ? "high" : "medium",
      evidence_ids: [],
      source_ids,
      visual_role: Number(weight) >= 0.8 ? "solid_edge" : "support_edge",
      caveat: layer === "raw" ? "Source-backed lexical or legal relation." : "Curated semantic/infrastructure edge; not computed from corpus co-occurrence.",
      data_layer: layer,
    };
  });
}

function buildEvidence() {
  return evidenceSeed.map(
    ([
      evidence_id,
      term,
      branch,
      date_or_period,
      source_id,
      source_type,
      short_note,
      display_text,
      rights_status,
      confidence_level,
      visual_role,
      caveat,
      data_layer,
    ]) => ({
      evidence_id,
      term_slug: slug(term),
      branch,
      date_or_period,
      source_id,
      source_type,
      short_note,
      display_text,
      rights_status,
      confidence_level,
      visual_role,
      caveat,
      data_layer,
    }),
  );
}

function bestSourceType(term: TermDefinition) {
  if (term.source_ids.some((source) => source.includes("ico") || source.includes("gdpr"))) return "legal";
  if (term.source_ids.some((source) => source.includes("ftc") || source.includes("oecd"))) return "policy";
  if (term.source_ids.some((source) => source.includes("stanford") || source.includes("cleveland") || source.includes("van_dijck"))) return "academic";
  if (term.source_ids.some((source) => source.includes("mw") || source.includes("etymonline") || source.includes("cambridge"))) return "dictionary";
  return "ngram";
}

function buildCoverage(frequencySeries: FrequencySeries[]) {
  const byTerm = new Map<string, FrequencySeries[]>();
  for (const item of frequencySeries) {
    if (!byTerm.has(item.term_slug)) byTerm.set(item.term_slug, []);
    byTerm.get(item.term_slug)?.push(item);
  }

  const termCoverage = terms.map((term) => {
    const termSlug = slug(term.term);
    const rows = byTerm.get(termSlug) ?? [];
    const en = rows.find((row) => row.corpus === "en") ?? rows[0];
    const max = en?.max_frequency_per_million ?? 0;
    const quality = en?.data_quality_status ?? "missing";
    const coverage_status =
      term.confidence_level === "high" && ["ok", "requires_manual_review", "noisy"].includes(quality)
        ? "strong"
        : quality === "missing"
          ? "missing"
          : max >= 0.1
            ? "usable"
            : "weak";
    const recommended_visual_status =
      term.visual_role === "major_node"
        ? coverage_status === "missing"
          ? "annotation_only"
          : "show"
        : term.visual_role === "minor_node"
          ? "hover_only"
          : term.visual_role === "annotation"
            ? "annotation_only"
            : "hide";
    const needs_manual_review =
      ["requires_manual_review", "noisy", "sparse", "missing"].includes(quality) || term.confidence_level !== "high";

    return {
      term: term.term,
      term_slug: termSlug,
      branch: term.branch,
      coverage_status,
      best_source_type: bestSourceType(term),
      needs_manual_review,
      reason: `English Ngram quality: ${quality}; term confidence: ${term.confidence_level}; visual role: ${term.visual_role}.`,
      recommended_visual_status,
      caveat: term.caveat,
      data_layer: "computed",
      source_ids: term.source_ids,
    };
  });

  const branchCoverage = VALID_BRANCHES.filter((branch) => branch !== "grammar").map((branch) => {
    const branchTerms = termCoverage.filter((item) => item.branch === branch);
    return {
      branch,
      term_count: branchTerms.length,
      strong_count: branchTerms.filter((item) => item.coverage_status === "strong").length,
      usable_count: branchTerms.filter((item) => item.coverage_status === "usable").length,
      weak_count: branchTerms.filter((item) => item.coverage_status === "weak").length,
      missing_count: branchTerms.filter((item) => item.coverage_status === "missing").length,
      needs_manual_review_count: branchTerms.filter((item) => item.needs_manual_review).length,
    };
  });

  return {
    generatedAt: new Date().toISOString(),
    word: "data",
    status: "initial-data-layer",
    note: "Coverage combines Ngram availability, source type, curated confidence, and visual role. It is not a final editorial approval.",
    term_coverage: termCoverage,
    branch_coverage: branchCoverage,
  };
}

function buildTechnicalReport(
  frequency: { series: FrequencySeries[]; request_errors: Array<{ corpus: string; terms: string[]; error: string }> },
  coverage: ReturnType<typeof buildCoverage>,
) {
  const enSeries = frequency.series.filter((item) => item.corpus === "en");
  const fetched = enSeries.filter((item) => item.ngram).length;
  const missing = enSeries.filter((item) => item.data_quality_status === "missing").map((item) => item.term);
  const sparse = enSeries.filter((item) => item.data_quality_status === "sparse").map((item) => item.term);
  const noisy = enSeries
    .filter((item) => ["noisy", "requires_manual_review"].includes(item.data_quality_status))
    .map((item) => item.term);
  const strongest = enSeries
    .slice()
    .sort((a, b) => b.max_frequency_per_million - a.max_frequency_per_million)
    .slice(0, 12)
    .map((item) => `- ${item.term}: max ${item.max_frequency_per_million} per million in ${item.max_year}; quality ${item.data_quality_status}`)
    .join("\n");

  return `# Data Data Acquisition Report

Generated: ${new Date().toISOString()}

## Files Generated

- \`src/data/generated/data_terms.json\`
- \`src/data/generated/data_frequency.json\`
- \`src/data/generated/data_phases.json\`
- \`src/data/generated/data_relations.json\`
- \`src/data/generated/data_sources.json\`
- \`src/data/generated/data_evidence.json\`
- \`src/data/generated/data_grammar_usage.json\`
- \`src/data/generated/data_coverage_report.json\`
- \`src/data/generated/data_dataset.json\`
- \`docs/research/data_ngram_summary.csv\`
- \`docs/research/data_data_acquisition_report.md\`

## Scripts Used

- \`scripts/fetch_data_ngram.ts\`: generated curated term/source/phase/evidence/relation files, fetched Google Books Ngram data for English, American English, and British English, wrote the compact CSV, coverage report, grammar dataset, consolidated dataset, and this report.
- \`scripts/validate_data_dataset.ts\`: validates term slugs, relation endpoints, evidence/source references, branch values, confidence values, data layers, and major-node source/caveat coverage.

## Ngram Fetch Summary

- Terms requested: ${terms.length}
- Corpora requested: ${CORPORA.map((corpus) => corpus.id).join(", ")}
- Date range: ${START_YEAR}-${END_YEAR}
- Case-insensitive: true
- English term rows returned: ${fetched}/${terms.length}
- Request errors: ${frequency.request_errors.length}

## Sparse, Noisy, Or Missing English Rows

- Missing: ${missing.length ? missing.join(", ") : "none"}
- Sparse: ${sparse.length ? sparse.join(", ") : "none"}
- Noisy / requires manual review: ${noisy.length ? noisy.join(", ") : "none"}

## Strongest Available English Ngram Signals

${strongest}

## Coverage Summary

- Strong term coverage: ${coverage.term_coverage.filter((item) => item.coverage_status === "strong").length}
- Usable term coverage: ${coverage.term_coverage.filter((item) => item.coverage_status === "usable").length}
- Weak term coverage: ${coverage.term_coverage.filter((item) => item.coverage_status === "weak").length}
- Missing term coverage: ${coverage.term_coverage.filter((item) => item.coverage_status === "missing").length}
- Terms needing manual review: ${coverage.term_coverage.filter((item) => item.needs_manual_review).length}

## Data Layer Notes

- Raw: dictionary, legal, policy, historical, and source-backed evidence records.
- Computed: Ngram frequency series, period averages, thresholds, and coverage summaries.
- Curated: term inclusion, branch assignment, visual roles, and many compound-term visibility labels.
- Interpretive: phase model and semantic/infrastructure relation edges.

## Implementation Recommendation

- Chart 01: use \`data_frequency.json\` for a restrained baseline of \`data\`, \`datum\`, and selected high-signal compounds. Label Ngram as visibility evidence only.
- Chart 02: use \`data_terms.json\`, \`data_phases.json\`, and \`data_coverage_report.json\` for the compound emergence timeline. Keep first attestation separate from first strong visibility.
- Chart 03: use \`data_relations.json\`, \`data_terms.json\`, and \`data_evidence.json\` for the semantic branch network and infrastructure overlay. Mark curated/interpretive edges in UI metadata.

## Next Steps

- Manually review snippets for noisy compounds, especially \`data base\`, \`data set\`, \`big data\`, \`data-driven\`, \`user data\`, \`search data\`, \`machine-readable data\`, \`training data\`, \`labelled data\`, and \`synthetic data\`.
- Add COHA/COCA/NOW extraction where access allows, especially for grammar and recent platform/privacy/AI terms.
- Replace broad source placeholders with more specific technical URLs for synthetic data before final public copy.
- Decide which major nodes should be visible by default after reviewing the coverage file.
`;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  await mkdir(RESEARCH_DIR, { recursive: true });

  const generatedAt = new Date().toISOString();
  const termRecords = terms.map((term) => ({ ...term, slug: slug(term.term) }));
  const { series, errors } = await buildFrequencySeries(terms, true);
  const grammar = await buildFrequencySeries(grammarTerms, true);
  const phaseRecords = phases.map((phase) => ({
    ...phase,
    supporting_term_slugs: phase.representative_terms.map(slug),
  }));
  const evidence = buildEvidence();
  const relations = buildRelations();
  const coverage = buildCoverage(series);

  const termsFile = { generatedAt, word: "data", terms: termRecords };
  const frequencyFile = {
    generatedAt,
    word: "data",
    source: {
      source_id: "src_google_ngram",
      label: "Google Books Ngram Viewer",
      year_start: START_YEAR,
      year_end: END_YEAR,
      smoothing: SMOOTHING,
      corpora: CORPORA,
      note: "Values are yearly Ngram fractions converted to frequency per million. Case-insensitive rows use the '(All)' aggregate when returned.",
    },
    series,
    request_errors: errors,
  };
  const grammarFile = {
    generatedAt,
    word: "data",
    recommendation: "annotation_only",
    caveat: "Grammar patterns are genre-sensitive; Ngram is only a rough visibility signal. Validate with COHA/COCA before final claims.",
    series: grammar.series,
    request_errors: grammar.errors,
  };
  const sourcesFile = { generatedAt, word: "data", sources };
  const evidenceFile = {
    generatedAt,
    word: "data",
    layer: "tooltip and annotation evidence",
    evidence_items: evidence,
  };
  const relationsFile = {
    generatedAt,
    word: "data",
    relation_policy: "Edges are curated/interpretive unless data_layer is raw. They are not computed corpus collocations.",
    relations,
  };
  const phasesFile = {
    generatedAt,
    word: "data",
    layer: "interpretive semantic phase model",
    phases: phaseRecords,
  };
  const datasetFile = {
    generatedAt,
    word: "data",
    status: "initial-data-layer",
    metadata: {
      note: "Consolidated convenience file for future frontend work. Source-specific files remain canonical during research.",
      no_final_react_components_built: true,
    },
    terms: termRecords,
    frequency: frequencyFile,
    phases: phasesFile,
    relations: relationsFile,
    sources: sourcesFile,
    evidence: evidenceFile,
    grammar_usage: grammarFile,
    coverage_report: coverage,
  };

  await writeFile(path.join(OUT_DIR, "data_terms.json"), `${JSON.stringify(termsFile, null, 2)}\n`);
  await writeFile(path.join(OUT_DIR, "data_frequency.json"), `${JSON.stringify(frequencyFile, null, 2)}\n`);
  await writeFile(path.join(OUT_DIR, "data_phases.json"), `${JSON.stringify(phasesFile, null, 2)}\n`);
  await writeFile(path.join(OUT_DIR, "data_relations.json"), `${JSON.stringify(relationsFile, null, 2)}\n`);
  await writeFile(path.join(OUT_DIR, "data_sources.json"), `${JSON.stringify(sourcesFile, null, 2)}\n`);
  await writeFile(path.join(OUT_DIR, "data_evidence.json"), `${JSON.stringify(evidenceFile, null, 2)}\n`);
  await writeFile(path.join(OUT_DIR, "data_grammar_usage.json"), `${JSON.stringify(grammarFile, null, 2)}\n`);
  await writeFile(path.join(OUT_DIR, "data_coverage_report.json"), `${JSON.stringify(coverage, null, 2)}\n`);
  await writeFile(path.join(OUT_DIR, "data_dataset.json"), `${JSON.stringify(datasetFile, null, 2)}\n`);
  await writeFile(path.join(RESEARCH_DIR, "data_ngram_summary.csv"), buildCsv(series));
  await writeFile(path.join(RESEARCH_DIR, "data_data_acquisition_report.md"), buildTechnicalReport(frequencyFile, coverage));

  console.log(`Wrote ${termRecords.length} terms, ${series.length} frequency series, ${grammar.series.length} grammar series.`);
  console.log(`Request errors: ${errors.length + grammar.errors.length}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
