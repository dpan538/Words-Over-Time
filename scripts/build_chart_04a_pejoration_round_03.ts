import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const CHART4_DIR = path.join(process.cwd(), "docs", "research", "artificial", "chart_04_suspicion_distance");
const ROUND2_DIR = path.join(CHART4_DIR, "expanded_corpus_round_02");
const BASE_DIR = path.join(CHART4_DIR, "chart_04a_pejoration_trajectory_round_03");
const RAW_DIR = path.join(BASE_DIR, "raw");
const PROCESSED_DIR = path.join(BASE_DIR, "processed");
const NOTES_DIR = path.join(BASE_DIR, "notes");
const SOURCES_DIR = path.join(BASE_DIR, "sources");
const SCRIPTS_DIR = path.join(BASE_DIR, "scripts");

type CsvValue = string | number | boolean | null;
type CsvRow = Record<string, CsvValue>;

type NgramRow = {
  year: number;
  term: string;
  value: number;
  query_group: string;
  source: string;
  corpus: string;
  smoothing: string;
  case_sensitive: string;
};

function csvValue(value: CsvValue) {
  if (value === null) return "";
  const text = String(value);
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function csvRows(headers: string[], rows: CsvRow[]) {
  return [headers.join(","), ...rows.map((row) => headers.map((header) => csvValue(row[header] ?? "")).join(","))].join(
    "\n",
  );
}

function mdList(items: string[]) {
  return items.length ? items.map((item) => `- ${item}`).join("\n") : "- None";
}

async function readIfExists(filePath: string) {
  try {
    return { status: "read", content: await readFile(filePath, "utf8") };
  } catch (error) {
    return { status: "missing", content: "", error: error instanceof Error ? error.message : String(error) };
  }
}

function parseNgramLong(csv: string): NgramRow[] {
  const lines = csv.trim().split("\n").slice(1);
  return lines
    .filter(Boolean)
    .map((line) => {
      const [year, term, value, query_group, source, corpus, smoothing, case_sensitive] = line.split(",");
      return {
        year: Number(year),
        term,
        value: Number(value),
        query_group,
        source,
        corpus,
        smoothing,
        case_sensitive,
      };
    });
}

const sourceUrls = {
  chart4: "docs/research/artificial/chart_04_suspicion_distance/",
  round2: "docs/research/artificial/chart_04_suspicion_distance/expanded_corpus_round_02/",
  etymonlineArtificial: "https://www.etymonline.com/word/artificial",
  etymonlineArtificiality: "https://www.etymonline.com/word/artificiality",
  etymonlineArtifice: "https://www.etymonline.com/word/artifice",
  johnsonIndirect: "https://www.definitions.net/definition/artificial",
  webster1828: "https://webstersdictionary1828.com/Dictionary/artificial",
  shakespeareHenryVI: "https://www.gutenberg.org/files/1502/1502-h/1502-h.htm",
  wollstonecraft: "https://www.gutenberg.org/ebooks/67466.html.images",
  chambers: "https://www.gutenberg.org/cache/epub/39803/pg39803-images.html",
  chroniclingArtificiallyColored: "https://chroniclingamerica.loc.gov/lccn/sn86090233/1904-05-12/ed-1/seq-6/",
  chroniclingKitchenBouquet: "https://chroniclingamerica.loc.gov/lccn/sn83045462/1950-05-03/ed-1/seq-42/",
  jamaCyclamate: "https://jamanetwork.com/journals/jama/fullarticle/349150",
  ncbiCyclamate:
    "https://www.ncbi.nlm.nih.gov/books/NBK224045/",
  fdaMilestones: "https://www.fda.gov/about-fda/fda-history/milestones-us-food-and-drug-law",
  newYorkerCyclamate: "https://www.newyorker.com/magazine/1969/11/01/comment-5253",
  ecfr10122: "https://ecfr.io/Title-21/Section-101.22",
  fdaNoArtificialColors:
    "https://www.fda.gov/food/food-chemical-safety/letter-food-industry-no-artificial-colors-labeling-claims",
  fdaColorAdditives: "https://www.fda.gov/food/color-additives-information-consumers/color-additives-foods",
  pepsicoGatorade:
    "https://www.pepsico.com/en/newsroom/press-releases/2026/gatorade-lower-sugar-brings-a-new-era-of-hydration-with-no-artificial-flavors-sweeteners-or-colors",
  pepsicoHydration:
    "https://www.pepsico.com/en/newsroom/press-releases/2026/150-million-americans-feel-dehydrated-gatorade-aims-to-change-how-people-think-about-hydration",
  swansonLessSodium: "https://www.campbells.com/swanson/products/broth/50-less-sodium-beef-broth/",
  swansonBeef: "https://www.campbells.com/swanson/broth/beef-broth/",
  consumerReportsNatural: "https://www.consumerreports.org/food-labels/seals-and-claims/natural",
  consumerReportsSweeteners:
    "https://www.consumerreports.org/health/sugar-sweeteners/the-truth-about-artificial-sweeteners-a2293745150/",
  iftCleanLabel: "https://www.ift.org/food-technology-magazine/ingredients-clean-label",
  freedoniaCleanLabel:
    "https://www.freedoniagroup.com/press-releases/new-report-consumers-crave-transparency-clean-label-foods-on-the-rise",
  foodNavigatorCleanLabel:
    "https://www.foodnavigator-usa.com/Article/2024/09/12/clean-label-trends-boost-natural-flavors-but-price-remains-key-purchase-driver",
  cambridgeThesaurus: "https://dictionary.cambridge.org/us/thesaurus/articles/made-by-humans",
  oxfordArtificial: "https://www.oxfordlearnersdictionaries.com/definition/english/artificial",
  wordReferenceArtificial: "https://www.wordreference.com/definition/artificial",
};

const priorityTerms = [
  { term: "artificial", domain: "early_lexical_negative", preferredGroup: "core_baseline" },
  { term: "artificiality", domain: "early_lexical_negative", preferredGroup: "core_baseline" },
  { term: "artifice", domain: "early_lexical_negative", preferredGroup: "core_baseline" },
  { term: "fake", domain: "semantic_distance_support", preferredGroup: "core_baseline" },
  { term: "synthetic", domain: "industrial_synthetic", preferredGroup: "core_baseline" },
  { term: "imitation", domain: "imitation_substitute", preferredGroup: "core_baseline" },
  { term: "processed", domain: "processed_consumer", preferredGroup: "core_baseline" },
  { term: "artificial manner", domain: "affected_manners", preferredGroup: "suspicion_negative" },
  { term: "artificial manners", domain: "affected_manners", preferredGroup: "suspicion_negative" },
  { term: "artificial tears", domain: "false_emotion", preferredGroup: "suspicion_negative" },
  { term: "artificial smile", domain: "false_emotion", preferredGroup: "suspicion_negative" },
  { term: "artificial style", domain: "aesthetic_style", preferredGroup: "suspicion_negative" },
  { term: "artificial taste", domain: "aesthetic_style", preferredGroup: "suspicion_negative" },
  { term: "artificial flavor", domain: "processed_consumer", preferredGroup: "consumer_packaging" },
  { term: "artificial color", domain: "processed_consumer", preferredGroup: "consumer_packaging" },
  { term: "artificial ingredients", domain: "processed_consumer", preferredGroup: "consumer_packaging" },
  { term: "no artificial ingredients", domain: "absence_claim", preferredGroup: "absence_claim" },
  { term: "no artificial flavors", domain: "absence_claim", preferredGroup: "absence_claim" },
  { term: "no artificial colors", domain: "absence_claim", preferredGroup: "absence_claim" },
  { term: "nothing artificial", domain: "absence_claim", preferredGroup: "absence_claim" },
  { term: "all natural", domain: "modern_authenticity", preferredGroup: "absence_claim" },
  { term: "clean label", domain: "modern_authenticity", preferredGroup: "absence_claim" },
];

function decadeSignalRows(ngramRows: NgramRow[]) {
  const output: CsvRow[] = [];
  for (const termSpec of priorityTerms) {
    const exact = ngramRows.filter((row) => row.term === termSpec.term);
    const rows =
      exact.filter((row) => row.query_group === termSpec.preferredGroup).length > 0
        ? exact.filter((row) => row.query_group === termSpec.preferredGroup)
        : exact;
    if (!rows.length) {
      output.push({
        term: termSpec.term,
        decade: "missing",
        avg_value: null,
        max_value: null,
        query_group: termSpec.preferredGroup,
        domain: termSpec.domain,
        notes: "No existing Chart 4 Ngram row found; do not infer absence in language.",
      });
      continue;
    }

    for (let decade = 1800; decade <= 2010; decade += 10) {
      const decadeRows = rows.filter((row) => row.year >= decade && row.year <= Math.min(decade + 9, 2019));
      if (!decadeRows.length) continue;
      const avg = decadeRows.reduce((sum, row) => sum + row.value, 0) / decadeRows.length;
      const max = Math.max(...decadeRows.map((row) => row.value));
      output.push({
        term: termSpec.term,
        decade,
        avg_value: avg,
        max_value: max,
        query_group: decadeRows[0].query_group,
        domain: termSpec.domain,
        notes: "Existing Ngram frequency signal only; not sense proof and not earliest attestation.",
      });
    }
  }
  return output;
}

const pre1800NegativeSnippets: CsvRow[] = [
  {
    id: "r03_pre_001",
    term_or_phrase: "artificial",
    source_period: "pre_1800",
    year_or_period: "late 14c.-1640s chronology",
    source_name: "Etymonline",
    source_type: "etymology_source",
    source_url: sourceUrls.etymonlineArtificial,
    evidence_kind: "definition",
    sense_or_usage: "affected_insincere",
    domain: "early_lexical_negative",
    confirmation_status: "lead only",
    short_summary:
      "Secondary chronology reports affected/insincere and fictitious/not-genuine branches before 1800.",
    confidence: "medium",
    notes: "OED or primary quotation review required before exact chronology claims.",
  },
  {
    id: "r03_pre_002",
    term_or_phrase: "artificiality",
    source_period: "pre_1800",
    year_or_period: "1763",
    source_name: "Etymonline",
    source_type: "etymology_source",
    source_url: sourceUrls.etymonlineArtificiality,
    evidence_kind: "definition",
    sense_or_usage: "affected_insincere",
    domain: "early_lexical_negative",
    confirmation_status: "lead only",
    short_summary: "Artificiality is recorded as appearance of art and insincerity.",
    confidence: "medium",
    notes: "Useful pre-1800 abstract-noun lead.",
  },
  {
    id: "r03_pre_003",
    term_or_phrase: "artificial tears",
    source_period: "pre_1800",
    year_or_period: "1590s play",
    source_name: "Henry VI, Part 3",
    source_type: "book_snippet",
    source_url: sourceUrls.shakespeareHenryVI,
    evidence_kind: "snippet",
    sense_or_usage: "false_emotion",
    domain: "false_emotion",
    confirmation_status: "confirmed",
    short_summary: "Feigned tears appear as part of a self-consciously deceptive emotional performance.",
    confidence: "high",
    notes: "Strong early false-emotion lead; verify edition before quotation.",
  },
  {
    id: "r03_pre_004",
    term_or_phrase: "artificial manners",
    source_period: "pre_1800",
    year_or_period: "1787",
    source_name: "Thoughts on the Education of Daughters",
    source_type: "book_snippet",
    source_url: sourceUrls.wollstonecraft,
    evidence_kind: "snippet",
    sense_or_usage: "affected_insincere",
    domain: "affected_manners",
    confirmation_status: "confirmed",
    short_summary: "Wollstonecraft frames artificial manners as affectation and copied feeling rather than genuine feeling.",
    confidence: "high",
    notes: "Strong pre-1800 social/manners evidence.",
  },
  {
    id: "r03_pre_005",
    term_or_phrase: "artificial manner",
    source_period: "pre_1800",
    year_or_period: "1773",
    source_name: "An Explanatory Discourse by Tan Chet-qua",
    source_type: "book_snippet",
    source_url: sourceUrls.chambers,
    evidence_kind: "snippet",
    sense_or_usage: "aesthetic_criticism",
    domain: "aesthetic_style",
    confirmation_status: "lead only",
    short_summary: "Aesthetic/gardening passage uses artificial manner/stile in an art-versus-nature and affectation context.",
    confidence: "medium",
    notes: "Mixed evidence; useful for aesthetic domain, not direct insincerity.",
  },
  {
    id: "r03_pre_006",
    term_or_phrase: "artificial smile",
    source_period: "pre_1800",
    year_or_period: "not found in this pass",
    source_name: "Search status",
    source_type: "book_snippet",
    source_url: "",
    evidence_kind: "context_signal",
    sense_or_usage: "unclear_or_mixed",
    domain: "false_emotion",
    confirmation_status: "not found",
    short_summary: "No pre-1800 artificial smile sample was stabilized in this pass.",
    confidence: "low",
    notes: "Keep in manual review queue.",
  },
];

const historicalAdvertisingSnippets: CsvRow[] = [
  {
    id: "r03_hist_001",
    term_or_phrase: "artificially colored",
    source_period: "1900_1950",
    year_or_period: "1904-05-12",
    source_name: "The Port Gibson Reveille via Chronicling America",
    source_type: "newspaper_snippet",
    source_url: sourceUrls.chroniclingArtificiallyColored,
    evidence_kind: "context_signal",
    sense_or_usage: "consumer_suspicion",
    domain: "processed_consumer",
    short_summary:
      "Food item contrasts a product not artificially colored with imitations colored using coal-tar dyes.",
    confidence: "medium",
    notes: "Page image/OCR review required.",
  },
  {
    id: "r03_hist_002",
    term_or_phrase: "no artificial flavoring",
    source_period: "1950_2000",
    year_or_period: "1950-05-03",
    source_name: "Evening Star via Chronicling America",
    source_type: "advertising_snippet",
    source_url: sourceUrls.chroniclingKitchenBouquet,
    evidence_kind: "advertising_claim",
    sense_or_usage: "absence_claim",
    domain: "absence_claim",
    short_summary: "Kitchen Bouquet ad uses no artificial flavoring as a positive trust/taste claim.",
    confidence: "medium",
    notes: "Good advertising lead; verify page image before final quotation.",
  },
];

const consumerTransitionSnippets: CsvRow[] = [
  {
    id: "r03_consumer_001",
    term_or_phrase: "artificial sweetener",
    source_period: "1950_2000",
    year_or_period: "1969-1976 discussion",
    source_name: "JAMA cyclamate sweeteners article",
    source_type: "secondary_literature",
    source_url: sourceUrls.jamaCyclamate,
    evidence_kind: "context_signal",
    sense_or_usage: "industrial_synthetic",
    domain: "industrial_synthetic",
    short_summary:
      "Article summarizes cyclamate's regulatory controversy and notes artificial sweetener as a food-additive category under scrutiny.",
    confidence: "medium",
    notes: "Use as discourse/regulatory-history evidence only; do not make health claims.",
  },
  {
    id: "r03_consumer_002",
    term_or_phrase: "artificial sweetener",
    source_period: "1950_2000",
    year_or_period: "1969",
    source_name: "FDA milestones / cyclamate history",
    source_type: "regulatory_source",
    source_url: sourceUrls.fdaMilestones,
    evidence_kind: "context_signal",
    sense_or_usage: "industrial_synthetic",
    domain: "processed_consumer",
    short_summary:
      "FDA historical timeline records late-1960s action around artificial sweetener saccharin and broader food/color additive regulation.",
    confidence: "medium",
    notes: "Regulatory background only.",
  },
  {
    id: "r03_consumer_003",
    term_or_phrase: "free of cyclamates",
    source_period: "1950_2000",
    year_or_period: "1969",
    source_name: "The New Yorker comment on cyclamate ban",
    source_type: "magazine_snippet",
    source_url: sourceUrls.newYorkerCyclamate,
    evidence_kind: "context_signal",
    sense_or_usage: "consumer_suspicion",
    domain: "processed_consumer",
    short_summary:
      "Magazine comment describes post-ban soft-drink advertising that quickly positioned a reformulated product as free of cyclamates.",
    confidence: "medium",
    notes: "Useful consumer-transition lead; humorous commentary, not a corpus measure.",
  },
  {
    id: "r03_consumer_004",
    term_or_phrase: "artificial flavor; artificial color",
    source_period: "1950_2000",
    year_or_period: "current CFR roots in food-labeling regulation",
    source_name: "21 CFR 101.22",
    source_type: "regulatory_source",
    source_url: sourceUrls.ecfr10122,
    evidence_kind: "regulatory_definition",
    sense_or_usage: "consumer_suspicion",
    domain: "processed_consumer",
    short_summary: "Regulatory categories stabilize artificial flavor/color as labelable food attributes.",
    confidence: "high",
    notes: "Definition/background only; not pejoration proof.",
  },
];

const modernSnippets: CsvRow[] = [
  {
    id: "r03_modern_001",
    term_or_phrase: "no artificial colors",
    source_period: "2019_2026",
    year_or_period: "2026-02-05",
    source_name: "FDA no artificial colors labeling letter",
    source_type: "regulatory_source",
    source_url: sourceUrls.fdaNoArtificialColors,
    evidence_kind: "regulatory_definition",
    sense_or_usage: "absence_claim",
    domain: "absence_claim",
    short_summary: "FDA addresses voluntary no artificial colors claims for foods without certified colors.",
    confidence: "high",
    notes: "Official labeling-policy evidence; not sentiment proof.",
  },
  {
    id: "r03_modern_002",
    term_or_phrase: "no artificial flavors, sweeteners or colors",
    source_period: "2019_2026",
    year_or_period: "2026-03-04",
    source_name: "PepsiCo / Gatorade",
    source_type: "packaging_claim",
    source_url: sourceUrls.pepsicoGatorade,
    evidence_kind: "packaging_claim",
    sense_or_usage: "absence_claim",
    domain: "absence_claim",
    short_summary: "Gatorade launch copy foregrounds absence of artificial flavors, sweeteners, and colors.",
    confidence: "high",
    notes: "Brand source; product positioning evidence.",
  },
  {
    id: "r03_modern_003",
    term_or_phrase: "no artificial ingredients",
    source_period: "2019_2026",
    year_or_period: "current page accessed 2026-05-12",
    source_name: "Swanson 50% Less Sodium Beef Broth",
    source_type: "packaging_claim",
    source_url: sourceUrls.swansonLessSodium,
    evidence_kind: "packaging_claim",
    sense_or_usage: "absence_claim",
    domain: "absence_claim",
    short_summary: "Product page clusters no artificial ingredients with no MSG added, no preservatives, and gluten-free language.",
    confidence: "high",
    notes: "Current product page; content may change.",
  },
  {
    id: "r03_modern_004",
    term_or_phrase: "natural; artificial ingredients",
    source_period: "2019_2026",
    year_or_period: "current page accessed 2026-05-12",
    source_name: "Consumer Reports natural label guide",
    source_type: "consumer_report",
    source_url: sourceUrls.consumerReportsNatural,
    evidence_kind: "context_signal",
    sense_or_usage: "semantic_distance",
    domain: "modern_authenticity",
    short_summary: "Consumer label guide links consumer expectations of natural with no artificial ingredients.",
    confidence: "medium",
    notes: "Consumer expectation source, not frequency.",
  },
  {
    id: "r03_modern_005",
    term_or_phrase: "artificial sweeteners",
    source_period: "2019_2026",
    year_or_period: "2023",
    source_name: "Consumer Reports artificial sweeteners article",
    source_type: "consumer_report",
    source_url: sourceUrls.consumerReportsSweeteners,
    evidence_kind: "context_signal",
    sense_or_usage: "consumer_suspicion",
    domain: "processed_consumer",
    short_summary:
      "Consumer article treats artificial sweeteners as a consumer decision category and discusses why some consumers scrutinize them.",
    confidence: "medium",
    notes: "Do not convert into health claim; use only as consumer-suspicion context.",
  },
  {
    id: "r03_modern_006",
    term_or_phrase: "clean label; artificial or synthetic",
    source_period: "2019_2026",
    year_or_period: "2021",
    source_name: "IFT Food Technology",
    source_type: "industry_report",
    source_url: sourceUrls.iftCleanLabel,
    evidence_kind: "context_signal",
    sense_or_usage: "consumer_suspicion",
    domain: "modern_authenticity",
    short_summary: "Clean-label discussion includes consumer definitions that avoid artificial or synthetic ingredients.",
    confidence: "medium",
    notes: "Industry/secondary source.",
  },
  {
    id: "r03_modern_007",
    term_or_phrase: "clean label; absence of artificial flavors and preservatives",
    source_period: "2019_2026",
    year_or_period: "2024-07-18",
    source_name: "Freedonia / Packaged Facts",
    source_type: "industry_report",
    source_url: sourceUrls.freedoniaCleanLabel,
    evidence_kind: "context_signal",
    sense_or_usage: "consumer_suspicion",
    domain: "modern_authenticity",
    short_summary: "Market report frames clean-label foods around recognizable ingredients and absence of artificial flavors/preservatives.",
    confidence: "medium",
    notes: "Report/press-release source, not balanced corpus.",
  },
  {
    id: "r03_modern_008",
    term_or_phrase: "natural flavors over artificial counterparts",
    source_period: "2019_2026",
    year_or_period: "2024-09-12",
    source_name: "FoodNavigator-USA",
    source_type: "news_snippet",
    source_url: sourceUrls.foodNavigatorCleanLabel,
    evidence_kind: "context_signal",
    sense_or_usage: "semantic_distance",
    domain: "semantic_distance_support",
    short_summary: "Trade-news source frames clean-label demand as favoring natural flavors over artificial counterparts.",
    confidence: "medium",
    notes: "Useful bridge toward Chart 4B; not a final distance measure.",
  },
];

const evidenceRows: CsvRow[] = [
  {
    id: "p001",
    term_or_phrase: "artificial",
    domain: "early_lexical_negative",
    source_period: "pre_1800",
    year_or_period: "1590s/1640s chronology",
    source_name: "Etymonline",
    source_type: "etymology_source",
    source_url: sourceUrls.etymonlineArtificial,
    evidence_kind: "definition",
    sense_or_usage: "affected_insincere",
    confidence: "medium",
    short_summary: "Secondary chronology records affected/insincere and fictitious/not-genuine branches before 1800.",
    negative_charge: 2,
    chart4a_relevance: "high",
    chart4b_relevance: "medium",
    needs_followup: true,
    notes: "Chronology lead only; OED/manual quotation review needed.",
  },
  {
    id: "p002",
    term_or_phrase: "artificial tears",
    domain: "false_emotion",
    source_period: "pre_1800",
    year_or_period: "1590s play",
    source_name: "Henry VI, Part 3",
    source_type: "book_snippet",
    source_url: sourceUrls.shakespeareHenryVI,
    evidence_kind: "snippet",
    sense_or_usage: "false_emotion",
    confidence: "high",
    short_summary: "Feigned tears appear as part of a deceptive emotional performance.",
    negative_charge: 3,
    chart4a_relevance: "high",
    chart4b_relevance: "medium",
    needs_followup: true,
    notes: "Strong early false-emotion evidence.",
  },
  {
    id: "p003",
    term_or_phrase: "artificial manners",
    domain: "affected_manners",
    source_period: "pre_1800",
    year_or_period: "1787",
    source_name: "Thoughts on the Education of Daughters",
    source_type: "book_snippet",
    source_url: sourceUrls.wollstonecraft,
    evidence_kind: "snippet",
    sense_or_usage: "affected_insincere",
    confidence: "high",
    short_summary: "Artificial manners are framed as affectation and copied feeling rather than genuine feeling.",
    negative_charge: 3,
    chart4a_relevance: "high",
    chart4b_relevance: "medium",
    needs_followup: false,
    notes: "Strong early social/manners evidence.",
  },
  {
    id: "p004",
    term_or_phrase: "artificial manner",
    domain: "aesthetic_style",
    source_period: "pre_1800",
    year_or_period: "1773",
    source_name: "An Explanatory Discourse by Tan Chet-qua",
    source_type: "book_snippet",
    source_url: sourceUrls.chambers,
    evidence_kind: "snippet",
    sense_or_usage: "aesthetic_criticism",
    confidence: "medium",
    short_summary: "Aesthetic/gardening passage places artificial manner in a nature/art and affectation context.",
    negative_charge: 1,
    chart4a_relevance: "medium",
    chart4b_relevance: "low",
    needs_followup: true,
    notes: "Mixed and aesthetic, not direct social insincerity.",
  },
  {
    id: "p005",
    term_or_phrase: "artificial",
    domain: "fake_not_genuine",
    source_period: "pre_1800",
    year_or_period: "1755/1773 indirect transcription",
    source_name: "Johnson via Definitions.net",
    source_type: "historical_dictionary",
    source_url: sourceUrls.johnsonIndirect,
    evidence_kind: "definition",
    sense_or_usage: "fake_not_genuine",
    confidence: "medium",
    short_summary: "Indirect Johnson evidence separates not-natural from fictitious/not-genuine.",
    negative_charge: 2,
    chart4a_relevance: "high",
    chart4b_relevance: "high",
    needs_followup: true,
    notes: "Direct Johnson check still blocks firm claims.",
  },
  {
    id: "p006",
    term_or_phrase: "artificial",
    domain: "not_natural",
    source_period: "1800_1850",
    year_or_period: "1828 checkpoint",
    source_name: "Webster 1828",
    source_type: "historical_dictionary",
    source_url: sourceUrls.webster1828,
    evidence_kind: "definition",
    sense_or_usage: "not_natural",
    confidence: "high",
    short_summary: "Checkpoint dictionary separates made-by-art/not-natural from feigned/fictitious/not-genuine.",
    negative_charge: 1,
    chart4a_relevance: "medium",
    chart4b_relevance: "high",
    needs_followup: false,
    notes: "Not origin evidence.",
  },
  {
    id: "p007",
    term_or_phrase: "artificial manner / tears / smile Ngram signals",
    domain: "affected_manners",
    source_period: "1800_2019",
    year_or_period: "1800-2019",
    source_name: "Existing Chart 4 Ngram package",
    source_type: "corpus_result",
    source_url: sourceUrls.chart4,
    evidence_kind: "frequency_signal",
    sense_or_usage: "unclear_or_mixed",
    confidence: "medium",
    short_summary: "Existing Ngram provides frequency signals for social/emotional artificial phrases, not context or sentiment.",
    negative_charge: 1,
    chart4a_relevance: "background",
    chart4b_relevance: "low",
    needs_followup: true,
    notes: "Use only as visibility baseline.",
  },
  {
    id: "p008",
    term_or_phrase: "artificially colored",
    domain: "processed_consumer",
    source_period: "1900_1950",
    year_or_period: "1904-05-12",
    source_name: "The Port Gibson Reveille via Chronicling America",
    source_type: "newspaper_snippet",
    source_url: sourceUrls.chroniclingArtificiallyColored,
    evidence_kind: "context_signal",
    sense_or_usage: "consumer_suspicion",
    confidence: "medium",
    short_summary: "Food report contrasts products and coloring practices in a consumer trust context.",
    negative_charge: 2,
    chart4a_relevance: "medium",
    chart4b_relevance: "low",
    needs_followup: true,
    notes: "OCR/page review needed.",
  },
  {
    id: "p009",
    term_or_phrase: "no artificial flavoring",
    domain: "absence_claim",
    source_period: "1950_2000",
    year_or_period: "1950-05-03",
    source_name: "Evening Star via Chronicling America",
    source_type: "advertising_snippet",
    source_url: sourceUrls.chroniclingKitchenBouquet,
    evidence_kind: "advertising_claim",
    sense_or_usage: "absence_claim",
    confidence: "medium",
    short_summary: "Advertisement turns absence of artificial flavoring into a positive product distinction.",
    negative_charge: 4,
    chart4a_relevance: "high",
    chart4b_relevance: "medium",
    needs_followup: true,
    notes: "Verify page image before quotation.",
  },
  {
    id: "p010",
    term_or_phrase: "artificial sweetener",
    domain: "industrial_synthetic",
    source_period: "1950_2000",
    year_or_period: "1969-1976",
    source_name: "JAMA / FDA / New Yorker cyclamate materials",
    source_type: "secondary_literature",
    source_url: `${sourceUrls.jamaCyclamate}; ${sourceUrls.fdaMilestones}; ${sourceUrls.newYorkerCyclamate}`,
    evidence_kind: "context_signal",
    sense_or_usage: "industrial_synthetic",
    confidence: "medium",
    short_summary: "Cyclamate/artificial-sweetener discourse shows artificial entering regulatory and consumer scrutiny contexts.",
    negative_charge: 3,
    chart4a_relevance: "medium",
    chart4b_relevance: "low",
    needs_followup: true,
    notes: "Do not make health-risk claims from this row.",
  },
  {
    id: "p011",
    term_or_phrase: "artificial flavor; artificial color",
    domain: "processed_consumer",
    source_period: "1950_2000",
    year_or_period: "current CFR category",
    source_name: "21 CFR 101.22",
    source_type: "regulatory_source",
    source_url: sourceUrls.ecfr10122,
    evidence_kind: "regulatory_definition",
    sense_or_usage: "consumer_suspicion",
    confidence: "high",
    short_summary: "Regulatory categories stabilize artificial flavor/color as label-visible food terms.",
    negative_charge: 1,
    chart4a_relevance: "background",
    chart4b_relevance: "medium",
    needs_followup: false,
    notes: "Regulatory category, not negative proof.",
  },
  {
    id: "p012",
    term_or_phrase: "no artificial colors",
    domain: "absence_claim",
    source_period: "2019_2026",
    year_or_period: "2026-02-05",
    source_name: "FDA no artificial colors labeling letter",
    source_type: "regulatory_source",
    source_url: sourceUrls.fdaNoArtificialColors,
    evidence_kind: "regulatory_definition",
    sense_or_usage: "absence_claim",
    confidence: "high",
    short_summary: "FDA addresses voluntary no artificial colors labeling claims.",
    negative_charge: 4,
    chart4a_relevance: "high",
    chart4b_relevance: "medium",
    needs_followup: false,
    notes: "Official evidence that absence-claim language is active.",
  },
  {
    id: "p013",
    term_or_phrase: "no artificial flavors, sweeteners or colors",
    domain: "absence_claim",
    source_period: "2019_2026",
    year_or_period: "2026-03-04",
    source_name: "PepsiCo / Gatorade",
    source_type: "packaging_claim",
    source_url: sourceUrls.pepsicoGatorade,
    evidence_kind: "packaging_claim",
    sense_or_usage: "absence_claim",
    confidence: "high",
    short_summary: "Product launch copy foregrounds absence of artificial flavors, sweeteners, and colors.",
    negative_charge: 4,
    chart4a_relevance: "high",
    chart4b_relevance: "medium",
    needs_followup: false,
    notes: "Brand/product positioning evidence.",
  },
  {
    id: "p014",
    term_or_phrase: "no artificial ingredients",
    domain: "absence_claim",
    source_period: "2019_2026",
    year_or_period: "current page accessed 2026-05-12",
    source_name: "Swanson 50% Less Sodium Beef Broth",
    source_type: "packaging_claim",
    source_url: sourceUrls.swansonLessSodium,
    evidence_kind: "packaging_claim",
    sense_or_usage: "absence_claim",
    confidence: "high",
    short_summary: "Product page clusters no artificial ingredients with no preservatives and related claims.",
    negative_charge: 4,
    chart4a_relevance: "high",
    chart4b_relevance: "medium",
    needs_followup: false,
    notes: "Current product page; content can change.",
  },
  {
    id: "p015",
    term_or_phrase: "clean label",
    domain: "modern_authenticity",
    source_period: "2019_2026",
    year_or_period: "2021-2024",
    source_name: "IFT and Freedonia / Packaged Facts",
    source_type: "industry_report",
    source_url: `${sourceUrls.iftCleanLabel}; ${sourceUrls.freedoniaCleanLabel}`,
    evidence_kind: "context_signal",
    sense_or_usage: "consumer_suspicion",
    confidence: "medium",
    short_summary: "Clean-label sources connect recognizable ingredients with avoidance of artificial/synthetic additives.",
    negative_charge: 3,
    chart4a_relevance: "medium",
    chart4b_relevance: "high",
    needs_followup: true,
    notes: "Secondary/trade context, not balanced corpus.",
  },
  {
    id: "p016",
    term_or_phrase: "natural; artificial ingredients",
    domain: "modern_authenticity",
    source_period: "2019_2026",
    year_or_period: "current page",
    source_name: "Consumer Reports natural label guide",
    source_type: "consumer_report",
    source_url: sourceUrls.consumerReportsNatural,
    evidence_kind: "context_signal",
    sense_or_usage: "semantic_distance",
    confidence: "medium",
    short_summary: "Consumer label guide links expectations of natural with absence of artificial ingredients.",
    negative_charge: 2,
    chart4a_relevance: "medium",
    chart4b_relevance: "high",
    needs_followup: true,
    notes: "Consumer expectation context only.",
  },
  {
    id: "p017",
    term_or_phrase: "artificial sweeteners",
    domain: "processed_consumer",
    source_period: "2019_2026",
    year_or_period: "2023",
    source_name: "Consumer Reports artificial sweeteners article",
    source_type: "consumer_report",
    source_url: sourceUrls.consumerReportsSweeteners,
    evidence_kind: "context_signal",
    sense_or_usage: "consumer_suspicion",
    confidence: "medium",
    short_summary: "Consumer article treats artificial sweeteners as a scrutinized ingredient category.",
    negative_charge: 3,
    chart4a_relevance: "medium",
    chart4b_relevance: "low",
    needs_followup: true,
    notes: "Do not make health claims.",
  },
  {
    id: "p018",
    term_or_phrase: "artificial; fake; false; synthetic; imitation",
    domain: "semantic_distance_support",
    source_period: "2019_2026",
    year_or_period: "current dictionary/thesaurus",
    source_name: "Cambridge / Oxford / WordReference",
    source_type: "modern_dictionary",
    source_url: `${sourceUrls.cambridgeThesaurus}; ${sourceUrls.oxfordArtificial}; ${sourceUrls.wordReferenceArtificial}`,
    evidence_kind: "definition",
    sense_or_usage: "semantic_distance",
    confidence: "medium",
    short_summary: "Modern dictionary/thesaurus sources separate artificial from natural/real and fake/false/imitation/synthetic.",
    negative_charge: 1,
    chart4a_relevance: "background",
    chart4b_relevance: "high",
    needs_followup: false,
    notes: "Prepares Chart 4B; not a pejoration claim.",
  },
];

const domainTimeline: CsvRow[] = [
  {
    period: "pre_1800",
    domain: "early_lexical_negative",
    strongest_terms: "artificial; artificiality",
    strongest_sources: "Etymonline; Johnson indirect",
    evidence_count: 3,
    average_negative_charge: 2,
    coverage_quality: "medium",
    notes: "Early negative potential is visible but exact chronology remains blocked by OED/direct Johnson.",
  },
  {
    period: "pre_1800",
    domain: "affected_manners",
    strongest_terms: "artificial manners",
    strongest_sources: "Wollstonecraft",
    evidence_count: 1,
    average_negative_charge: 3,
    coverage_quality: "medium",
    notes: "Strong single source; needs breadth.",
  },
  {
    period: "pre_1800",
    domain: "false_emotion",
    strongest_terms: "artificial tears",
    strongest_sources: "Shakespeare",
    evidence_count: 1,
    average_negative_charge: 3,
    coverage_quality: "medium",
    notes: "Strong single source; artificial smile not yet found pre-1800.",
  },
  {
    period: "1800_1850",
    domain: "early_lexical_negative",
    strongest_terms: "artificial",
    strongest_sources: "Webster 1828; existing Ngram",
    evidence_count: 2,
    average_negative_charge: 1.5,
    coverage_quality: "medium",
    notes: "Good checkpoint, weak advertising/context width.",
  },
  {
    period: "1850_1900",
    domain: "processed_consumer",
    strongest_terms: "artificial color; artificial flavor",
    strongest_sources: "existing Ngram",
    evidence_count: 1,
    average_negative_charge: 1,
    coverage_quality: "weak",
    notes: "Needs magazine/newspaper evidence.",
  },
  {
    period: "1900_1950",
    domain: "processed_consumer",
    strongest_terms: "artificially colored",
    strongest_sources: "Chronicling America 1904",
    evidence_count: 1,
    average_negative_charge: 2,
    coverage_quality: "medium",
    notes: "Representative food trust/coloring lead.",
  },
  {
    period: "1950_2000",
    domain: "absence_claim",
    strongest_terms: "no artificial flavoring",
    strongest_sources: "Chronicling America 1950 ad",
    evidence_count: 1,
    average_negative_charge: 4,
    coverage_quality: "medium",
    notes: "Strong absence-claim lead, but needs broader ad samples.",
  },
  {
    period: "1950_2000",
    domain: "industrial_synthetic",
    strongest_terms: "artificial sweetener",
    strongest_sources: "JAMA; FDA milestones; New Yorker",
    evidence_count: 3,
    average_negative_charge: 3,
    coverage_quality: "medium",
    notes: "Consumer/regulatory scrutiny around artificial sweetener category.",
  },
  {
    period: "2000_2019",
    domain: "absence_claim",
    strongest_terms: "no artificial ingredients; clean label",
    strongest_sources: "existing Ngram baseline",
    evidence_count: 1,
    average_negative_charge: 2,
    coverage_quality: "weak",
    notes: "Ngram visibility only; needs non-book examples.",
  },
  {
    period: "2019_2026",
    domain: "absence_claim",
    strongest_terms: "no artificial colors; no artificial ingredients; no artificial flavors",
    strongest_sources: "FDA; Gatorade; Swanson",
    evidence_count: 4,
    average_negative_charge: 4,
    coverage_quality: "strong",
    notes: "Strongest modern Chart 4A evidence, with regulatory and product source width.",
  },
  {
    period: "2019_2026",
    domain: "modern_authenticity",
    strongest_terms: "clean label; natural; artificial ingredients",
    strongest_sources: "Consumer Reports; IFT; Freedonia",
    evidence_count: 3,
    average_negative_charge: 2.7,
    coverage_quality: "medium",
    notes: "Good context evidence but not balanced corpus.",
  },
  {
    period: "2019_2026",
    domain: "semantic_distance_support",
    strongest_terms: "artificial; fake; synthetic; imitation; natural",
    strongest_sources: "Cambridge; Oxford; WordReference",
    evidence_count: 1,
    average_negative_charge: 1,
    coverage_quality: "medium",
    notes: "Supports Chart 4B boundaries.",
  },
];

const domainWaveSummary: CsvRow[] = [
  {
    domain: "early_lexical_negative",
    first_visible_period: "pre_1800",
    strongest_period: "pre_1800",
    burst_or_wave_pattern: "early_presence",
    evidence_strength: "moderate",
    notes: "Negative potential is early, but exact sense ordering still needs OED/direct evidence.",
  },
  {
    domain: "affected_manners",
    first_visible_period: "pre_1800",
    strongest_period: "pre_1800 plus Ngram visibility after 1800",
    burst_or_wave_pattern: "multiple_waves",
    evidence_strength: "moderate",
    notes: "Appears early in conduct/social critique and remains visible as phrase evidence.",
  },
  {
    domain: "false_emotion",
    first_visible_period: "pre_1800",
    strongest_period: "pre_1800 for direct snippet; 20th/21st c. for Ngram visibility",
    burst_or_wave_pattern: "multiple_waves",
    evidence_strength: "moderate",
    notes: "Artificial tears is early; artificial smile requires more snippet review.",
  },
  {
    domain: "aesthetic_style",
    first_visible_period: "pre_1800",
    strongest_period: "unclear",
    burst_or_wave_pattern: "unclear",
    evidence_strength: "weak",
    notes: "Aesthetic evidence exists but is mixed.",
  },
  {
    domain: "processed_consumer",
    first_visible_period: "1900_1950",
    strongest_period: "1950_2000 and 2019_2026",
    burst_or_wave_pattern: "gradual_rise",
    evidence_strength: "moderate",
    notes: "Food/color/sweetener contexts need more 1850-1950 and 1950-2000 samples.",
  },
  {
    domain: "industrial_synthetic",
    first_visible_period: "1850_1900 as Ngram/background; stronger by 1950_2000",
    strongest_period: "1950_2000",
    burst_or_wave_pattern: "single_burst",
    evidence_strength: "moderate",
    notes: "Artificial sweetener/cyclamate materials mark a plausible scrutiny burst.",
  },
  {
    domain: "absence_claim",
    first_visible_period: "1950_2000",
    strongest_period: "2019_2026",
    burst_or_wave_pattern: "late_acceleration",
    evidence_strength: "strong",
    notes: "No-artificial claims are the strongest modern pejoration/avoidance evidence.",
  },
  {
    domain: "modern_authenticity",
    first_visible_period: "2000_2019",
    strongest_period: "2019_2026",
    burst_or_wave_pattern: "late_acceleration",
    evidence_strength: "moderate",
    notes: "Clean-label and natural/real contexts reactivate older not-genuine/not-natural tensions.",
  },
  {
    domain: "semantic_distance_support",
    first_visible_period: "pre_1800 for fake/not-genuine; current dictionaries for comparator map",
    strongest_period: "2019_2026",
    burst_or_wave_pattern: "unclear",
    evidence_strength: "moderate",
    notes: "Useful bridge to Chart 4B, not a trajectory result by itself.",
  },
];

const negativeScores: CsvRow[] = [
  {
    item: "early artificial negative lexical senses",
    domain: "early_lexical_negative",
    period: "pre_1800",
    negative_charge_score: 2,
    evidence_strength: 2,
    source_diversity: 2,
    chart4a_value: "high",
    chart4b_value: "medium",
    notes: "Moderate because OED/direct Johnson remain missing.",
  },
  {
    item: "artificial tears",
    domain: "false_emotion",
    period: "pre_1800",
    negative_charge_score: 3,
    evidence_strength: 3,
    source_diversity: 1,
    chart4a_value: "high",
    chart4b_value: "medium",
    notes: "Strong single-source feigned-emotion example.",
  },
  {
    item: "artificial manners",
    domain: "affected_manners",
    period: "pre_1800",
    negative_charge_score: 3,
    evidence_strength: 3,
    source_diversity: 1,
    chart4a_value: "high",
    chart4b_value: "medium",
    notes: "Strong single-source conduct/social example.",
  },
  {
    item: "artificially colored food lead",
    domain: "processed_consumer",
    period: "1900_1950",
    negative_charge_score: 2,
    evidence_strength: 2,
    source_diversity: 1,
    chart4a_value: "medium",
    chart4b_value: "low",
    notes: "Consumer trust/coloring context, not enough alone.",
  },
  {
    item: "no artificial flavoring ad",
    domain: "absence_claim",
    period: "1950_2000",
    negative_charge_score: 4,
    evidence_strength: 2,
    source_diversity: 1,
    chart4a_value: "high",
    chart4b_value: "medium",
    notes: "Strong form but only one ad source in this pass.",
  },
  {
    item: "artificial sweetener scrutiny",
    domain: "industrial_synthetic",
    period: "1950_2000",
    negative_charge_score: 3,
    evidence_strength: 2,
    source_diversity: 3,
    chart4a_value: "medium",
    chart4b_value: "low",
    notes: "Use as scrutiny/discourse evidence only.",
  },
  {
    item: "modern no-artificial claims",
    domain: "absence_claim",
    period: "2019_2026",
    negative_charge_score: 4,
    evidence_strength: 4,
    source_diversity: 3,
    chart4a_value: "high",
    chart4b_value: "medium",
    notes: "Strongest modern evidence cluster.",
  },
  {
    item: "clean label / natural authenticity",
    domain: "modern_authenticity",
    period: "2019_2026",
    negative_charge_score: 3,
    evidence_strength: 3,
    source_diversity: 3,
    chart4a_value: "medium",
    chart4b_value: "high",
    notes: "Prepares artificial/natural/real/fake comparator work.",
  },
  {
    item: "artificial vs fake/synthetic/imitation dictionary boundary",
    domain: "semantic_distance_support",
    period: "2019_2026",
    negative_charge_score: 1,
    evidence_strength: 3,
    source_diversity: 2,
    chart4a_value: "background",
    chart4b_value: "high",
    notes: "Important guardrail: artificial is fake-adjacent in some contexts but not identical with fake.",
  },
];

const burstCandidates: CsvRow[] = [
  {
    candidate_period: "pre_1800",
    domain: "affected_manners; false_emotion",
    terms: "artificial tears; artificial manners; artificiality",
    evidence_type: "book_snippet; etymology_source",
    why_candidate: "Early negative potential is already visible in emotional/social conduct contexts.",
    confidence: "medium",
    notes: "Not a burst in frequency; better treated as early split.",
  },
  {
    candidate_period: "1900_1950",
    domain: "processed_consumer",
    terms: "artificially colored; artificial color",
    evidence_type: "newspaper_snippet; Ngram baseline",
    why_candidate: "Food/coloring contexts begin to show consumer trust and purity pressure.",
    confidence: "low_medium",
    notes: "Evidence still thin.",
  },
  {
    candidate_period: "1950_2000",
    domain: "absence_claim; industrial_synthetic",
    terms: "no artificial flavoring; artificial sweetener",
    evidence_type: "advertising_snippet; regulatory/secondary literature",
    why_candidate: "Absence claims and artificial sweetener scrutiny make artificial visible as avoidable/scrutinized.",
    confidence: "medium",
    notes: "Needs broader magazine/newspaper pass.",
  },
  {
    candidate_period: "2019_2026",
    domain: "absence_claim; modern_authenticity",
    terms: "no artificial ingredients; no artificial colors; clean label; all natural",
    evidence_type: "packaging_claim; regulatory_source; industry_report; consumer_report",
    why_candidate: "Modern source width strongly foregrounds absence, clean-label, and natural/authenticity language.",
    confidence: "high",
    notes: "Strong evidence cluster, but not balanced-corpus proof.",
  },
];

const spiralCandidates: CsvRow[] = [
  {
    trajectory_model: "linear_pejoration",
    status: "weak",
    supporting_domains: "absence_claim; processed_consumer",
    supporting_periods: "1950_2000; 2019_2026",
    evidence_summary: "Modern absence claims intensify negative value, but early evidence shows negativity already existed.",
    risk: "Would erase early affected/false-emotion branches.",
    notes: "Do not use as default model.",
  },
  {
    trajectory_model: "early_split_then_reactivation",
    status: "promising",
    supporting_domains: "early_lexical_negative; affected_manners; false_emotion; absence_claim",
    supporting_periods: "pre_1800; 1950_2000; 2019_2026",
    evidence_summary: "Early negative senses coexist with neutral/not-natural senses, then later reappear in consumer domains.",
    risk: "Needs direct OED/Johnson and more 1800-1950 evidence.",
    notes: "Currently one of the best-supported cautious models.",
  },
  {
    trajectory_model: "wave_pattern",
    status: "possible",
    supporting_domains: "false_emotion; processed_consumer; industrial_synthetic; absence_claim",
    supporting_periods: "pre_1800; 1900_1950; 1950_2000; 2019_2026",
    evidence_summary: "Different domains appear to activate at different periods.",
    risk: "The mid-period evidence is still uneven.",
    notes: "Needs larger ad/magazine corpus.",
  },
  {
    trajectory_model: "domain_transfer",
    status: "promising",
    supporting_domains: "affected_manners -> processed_consumer -> absence_claim -> modern_authenticity",
    supporting_periods: "pre_1800 through 2019_2026",
    evidence_summary: "Suspicion moves from social/emotional artificiality into food/material/labeling and authenticity discourse.",
    risk: "Requires more connective evidence across 1850-2000.",
    notes: "Good Chart 4A framing candidate, not final chart structure.",
  },
  {
    trajectory_model: "spiral_accumulation",
    status: "promising",
    supporting_domains: "early_lexical_negative; false_emotion; processed_consumer; absence_claim; modern_authenticity",
    supporting_periods: "pre_1800; 1950_2000; 2019_2026",
    evidence_summary:
      "Older suspicions around insincerity/not-genuine return in new domains where artificial marks processed, synthetic, or avoidable features.",
    risk: "Can over-read continuity if snippets are too sparse.",
    notes: "Use only cautiously until manual review deepens evidence.",
  },
  {
    trajectory_model: "single_modern_burst",
    status: "unsupported",
    supporting_domains: "absence_claim",
    supporting_periods: "2019_2026",
    evidence_summary: "Modern evidence is strong, but early and mid-century evidence prevent treating negativity as purely modern.",
    risk: "Would ignore pre-1800 and mid-century evidence.",
    notes: "Not supported by current package.",
  },
];

const readinessMatrix: CsvRow[] = [
  {
    question: "Does artificial have early negative potential?",
    status: "mostly_ready",
    strongest_evidence: "Etymonline chronology; Shakespeare artificial tears; Wollstonecraft artificial manners; Johnson indirect",
    remaining_gap: "OED and direct Johnson verification",
    ready_for_visual_planning: false,
    notes: "Evidence is good, but exact chronology is not final.",
  },
  {
    question: "Does artificial show affected/insincere usage?",
    status: "mostly_ready",
    strongest_evidence: "Wollstonecraft artificial manners; Etymonline artificiality/artificial",
    remaining_gap: "More snippets for artificial smile, artificial expression, artificially affected",
    ready_for_visual_planning: false,
    notes: "Good domain, thin breadth.",
  },
  {
    question: "Does artificial show false emotion usage?",
    status: "partial",
    strongest_evidence: "Shakespeare artificial tears; existing Ngram artificial smile/tears signals",
    remaining_gap: "More contextual snippets for smile, feeling, emotion, sentiment",
    ready_for_visual_planning: false,
    notes: "Strong single early anchor.",
  },
  {
    question: "Does artificial become consumer-suspicious?",
    status: "partial",
    strongest_evidence: "1904 artificially colored lead; 1969-1976 artificial sweetener discourse; modern consumer reports",
    remaining_gap: "Broader historical advertising and magazine evidence",
    ready_for_visual_planning: false,
    notes: "Promising but uneven before modern period.",
  },
  {
    question: "Do absence claims intensify negative value?",
    status: "mostly_ready",
    strongest_evidence: "1950 no artificial flavoring ad; 2026 FDA no artificial colors; Gatorade; Swanson",
    remaining_gap: "More 1950-2019 packaging/advertising examples",
    ready_for_visual_planning: true,
    notes: "Strongest Chart 4A lane, especially after 2019.",
  },
  {
    question: "Is the trajectory linear, wave-like, or spiral?",
    status: "partial",
    strongest_evidence: "Early split plus later consumer/absence reactivation",
    remaining_gap: "More 1850-2000 evidence and direct lexicographic review",
    ready_for_visual_planning: false,
    notes: "Spiral/domain transfer looks promising; linear model looks weak.",
  },
  {
    question: "Can Chart 4A connect to Chart 4B?",
    status: "mostly_ready",
    strongest_evidence: "Johnson/Webster distinctions; Consumer Reports natural/artificial; Cambridge/Oxford/WordReference comparator sources",
    remaining_gap: "Dedicated semantic-distance/collocation pass",
    ready_for_visual_planning: false,
    notes: "Good guardrails; Chart 4B still needs its own evidence pass.",
  },
];

const sourceAccessLog: CsvRow[] = [
  {
    source_name: "Existing Chart 4 Ngram package",
    source_type: "corpus_result",
    access_status: "accessed",
    source_url: sourceUrls.chart4,
    terms_checked: priorityTerms.map((term) => term.term).join("; "),
    result: "Used for decade-level summaries; not rerun.",
    notes: "Frequency signal only.",
  },
  {
    source_name: "Expanded corpus round 02",
    source_type: "secondary_literature",
    access_status: "accessed",
    source_url: sourceUrls.round2,
    terms_checked: "round 02 evidence table, term status, timeline coverage, notes",
    result: "Reused as source-width baseline.",
    notes: "No files replaced.",
  },
  ...pre1800NegativeSnippets.map((row) => ({
    source_name: row.source_name,
    source_type: row.source_type,
    access_status: row.confirmation_status === "not found" ? "search_only" : "accessed",
    source_url: row.source_url,
    terms_checked: row.term_or_phrase,
    result: row.short_summary,
    notes: row.notes,
  })),
  ...historicalAdvertisingSnippets.map((row) => ({
    source_name: row.source_name,
    source_type: row.source_type,
    access_status: "accessed",
    source_url: row.source_url,
    terms_checked: row.term_or_phrase,
    result: row.short_summary,
    notes: row.notes,
  })),
  ...consumerTransitionSnippets.map((row) => ({
    source_name: row.source_name,
    source_type: row.source_type,
    access_status: "accessed",
    source_url: row.source_url,
    terms_checked: row.term_or_phrase,
    result: row.short_summary,
    notes: row.notes,
  })),
  ...modernSnippets.map((row) => ({
    source_name: row.source_name,
    source_type: row.source_type,
    access_status: "accessed",
    source_url: row.source_url,
    terms_checked: row.term_or_phrase,
    result: row.short_summary,
    notes: row.notes,
  })),
  {
    source_name: "OED",
    source_type: "historical_dictionary",
    access_status: "not_accessible",
    source_url: "https://www.oed.com/",
    terms_checked: "artificial; artificiality; artifice",
    result: "Not accessed in this pass.",
    notes: "Blocks final chronology claims.",
  },
];

const manualReviewQueue: CsvRow[] = [
  {
    priority: 1,
    item: "OED/direct Johnson chronology for artificial",
    why_review: "Needed before final claims about earliest negative or suspicious senses.",
    source_type_needed: "historical_dictionary",
    current_status: "OED not accessible; Johnson indirect only",
    blocking_level: "blocks_claim",
    notes: "Highest-priority manual review.",
  },
  {
    priority: 1,
    item: "artificial smile / artificial expression / artificial sentiment snippets",
    why_review: "False-emotion and social domains need contextual breadth beyond artificial tears/manners.",
    source_type_needed: "book_snippet; corpus_context; historical_dictionary",
    current_status: "artificial tears and artificial manners confirmed; artificial smile pre-1800 not found",
    blocking_level: "blocks_visual_planning",
    notes: "Search Google Books snippets, IA, HathiTrust, ECCO/EEBO if accessible.",
  },
  {
    priority: 1,
    item: "1850-1900 consumer/advertising bridge",
    why_review: "Timeline has a weak gap before the 1904 food-coloring lead.",
    source_type_needed: "newspaper_snippet; magazine_snippet; advertising_snippet",
    current_status: "weak",
    blocking_level: "blocks_visual_planning",
    notes: "Search artificial color/flavor/adulterated/pure/genuine/imitation.",
  },
  {
    priority: 2,
    item: "1950-2019 no artificial marketing",
    why_review: "Need more mid/late-century examples between the 1950 ad and modern packaging.",
    source_type_needed: "magazine_snippet; newspaper_advertising; packaging_claim",
    current_status: "thin",
    blocking_level: "blocks_visual_planning",
    notes: "Especially no artificial colors/flavors/ingredients and all natural.",
  },
  {
    priority: 2,
    item: "clean label product examples",
    why_review: "Clean label context is currently mostly secondary/trade-source evidence.",
    source_type_needed: "packaging_claim; brand pages; retailer product pages",
    current_status: "secondary evidence found",
    blocking_level: "minor_risk",
    notes: "Needed only if clean label becomes visible in Chart 4A.",
  },
  {
    priority: 1,
    item: "artificial vs fake vs synthetic semantic boundary",
    why_review: "Prevents overclaiming that artificial equals fake.",
    source_type_needed: "semantic_dictionary; corpus_context",
    current_status: "dictionary guardrails sampled",
    blocking_level: "blocks_claim",
    notes: "This becomes central to Chart 4B.",
  },
];

async function main() {
  const generatedAt = new Date().toISOString();
  await Promise.all([RAW_DIR, PROCESSED_DIR, NOTES_DIR, SOURCES_DIR, SCRIPTS_DIR].map((dir) => mkdir(dir, { recursive: true })));

  const requiredInputs = [
    path.join(CHART4_DIR, "processed", "chart_04_term_metadata.csv"),
    path.join(CHART4_DIR, "processed", "chart_04_terms_requiring_non_ngram_sources.csv"),
    path.join(CHART4_DIR, "processed", "chart_04_ngram_long.csv"),
    path.join(ROUND2_DIR, "processed", "round_02_evidence_table.csv"),
    path.join(ROUND2_DIR, "processed", "round_02_pre_1800_sense_status.csv"),
    path.join(ROUND2_DIR, "processed", "round_02_modern_2019_2026_term_status.csv"),
    path.join(ROUND2_DIR, "processed", "round_02_combined_timeline_coverage.csv"),
    path.join(ROUND2_DIR, "notes", "round_02_pre_1800_findings.md"),
    path.join(ROUND2_DIR, "notes", "round_02_2019_2026_findings.md"),
    path.join(ROUND2_DIR, "notes", "round_02_non_ngram_findings.md"),
    path.join(ROUND2_DIR, "notes", "round_02_remaining_risks.md"),
  ];
  const inputReads = await Promise.all(requiredInputs.map(async (filePath) => ({ filePath, ...(await readIfExists(filePath)) })));
  const missingInputs = inputReads.filter((item) => item.status === "missing").map((item) => item.filePath);
  const ngramRead = inputReads.find((item) => item.filePath.endsWith("chart_04_ngram_long.csv"));
  const ngramRows = ngramRead?.status === "read" ? parseNgramLong(ngramRead.content) : [];
  const decadeRows = decadeSignalRows(ngramRows);

  const ngramExtractRows = decadeRows.map((row) => ({
    ...row,
    source: "Existing Chart 4 Google Books Ngram package",
    source_url: sourceUrls.chart4,
  }));

  await writeFile(
    path.join(RAW_DIR, "round_03_ngram_decade_extract.csv"),
    `${csvRows(["term", "decade", "avg_value", "max_value", "query_group", "domain", "source", "source_url", "notes"], ngramExtractRows)}\n`,
  );
  await writeFile(
    path.join(RAW_DIR, "round_03_pre_1800_negative_snippets.csv"),
    `${csvRows(
      [
        "id",
        "term_or_phrase",
        "source_period",
        "year_or_period",
        "source_name",
        "source_type",
        "source_url",
        "evidence_kind",
        "sense_or_usage",
        "domain",
        "confirmation_status",
        "short_summary",
        "confidence",
        "notes",
      ],
      pre1800NegativeSnippets,
    )}\n`,
  );
  await writeFile(
    path.join(RAW_DIR, "round_03_historical_advertising_snippets.csv"),
    `${csvRows(
      [
        "id",
        "term_or_phrase",
        "source_period",
        "year_or_period",
        "source_name",
        "source_type",
        "source_url",
        "evidence_kind",
        "sense_or_usage",
        "domain",
        "short_summary",
        "confidence",
        "notes",
      ],
      historicalAdvertisingSnippets,
    )}\n`,
  );
  await writeFile(
    path.join(RAW_DIR, "round_03_consumer_transition_snippets.csv"),
    `${csvRows(
      [
        "id",
        "term_or_phrase",
        "source_period",
        "year_or_period",
        "source_name",
        "source_type",
        "source_url",
        "evidence_kind",
        "sense_or_usage",
        "domain",
        "short_summary",
        "confidence",
        "notes",
      ],
      consumerTransitionSnippets,
    )}\n`,
  );
  await writeFile(
    path.join(RAW_DIR, "round_03_modern_2019_2026_snippets.csv"),
    `${csvRows(
      [
        "id",
        "term_or_phrase",
        "source_period",
        "year_or_period",
        "source_name",
        "source_type",
        "source_url",
        "evidence_kind",
        "sense_or_usage",
        "domain",
        "short_summary",
        "confidence",
        "notes",
      ],
      modernSnippets,
    )}\n`,
  );
  await writeFile(
    path.join(RAW_DIR, "round_03_source_access_log.csv"),
    `${csvRows(["source_name", "source_type", "access_status", "source_url", "terms_checked", "result", "notes"], sourceAccessLog)}\n`,
  );

  await writeFile(
    path.join(PROCESSED_DIR, "round_03_pejoration_evidence_table.csv"),
    `${csvRows(
      [
        "id",
        "term_or_phrase",
        "domain",
        "source_period",
        "year_or_period",
        "source_name",
        "source_type",
        "source_url",
        "evidence_kind",
        "sense_or_usage",
        "confidence",
        "short_summary",
        "negative_charge",
        "chart4a_relevance",
        "chart4b_relevance",
        "needs_followup",
        "notes",
      ],
      evidenceRows,
    )}\n`,
  );
  await writeFile(
    path.join(PROCESSED_DIR, "round_03_domain_timeline.csv"),
    `${csvRows(
      [
        "period",
        "domain",
        "strongest_terms",
        "strongest_sources",
        "evidence_count",
        "average_negative_charge",
        "coverage_quality",
        "notes",
      ],
      domainTimeline,
    )}\n`,
  );
  await writeFile(
    path.join(PROCESSED_DIR, "round_03_decade_signal_summary.csv"),
    `${csvRows(["term", "decade", "avg_value", "max_value", "query_group", "domain", "notes"], decadeRows)}\n`,
  );
  await writeFile(
    path.join(PROCESSED_DIR, "round_03_domain_wave_summary.csv"),
    `${csvRows(["domain", "first_visible_period", "strongest_period", "burst_or_wave_pattern", "evidence_strength", "notes"], domainWaveSummary)}\n`,
  );
  await writeFile(
    path.join(PROCESSED_DIR, "round_03_negative_charge_scores.csv"),
    `${csvRows(
      [
        "item",
        "domain",
        "period",
        "negative_charge_score",
        "evidence_strength",
        "source_diversity",
        "chart4a_value",
        "chart4b_value",
        "notes",
      ],
      negativeScores,
    )}\n`,
  );
  await writeFile(
    path.join(PROCESSED_DIR, "round_03_burst_candidates.csv"),
    `${csvRows(["candidate_period", "domain", "terms", "evidence_type", "why_candidate", "confidence", "notes"], burstCandidates)}\n`,
  );
  await writeFile(
    path.join(PROCESSED_DIR, "round_03_spiral_trajectory_candidates.csv"),
    `${csvRows(
      ["trajectory_model", "status", "supporting_domains", "supporting_periods", "evidence_summary", "risk", "notes"],
      spiralCandidates,
    )}\n`,
  );
  await writeFile(
    path.join(PROCESSED_DIR, "round_03_manual_review_queue.csv"),
    `${csvRows(["priority", "item", "why_review", "source_type_needed", "current_status", "blocking_level", "notes"], manualReviewQueue)}\n`,
  );
  await writeFile(
    path.join(PROCESSED_DIR, "round_03_chart4a_readiness_matrix.csv"),
    `${csvRows(
      ["question", "status", "strongest_evidence", "remaining_gap", "ready_for_visual_planning", "notes"],
      readinessMatrix,
    )}\n`,
  );

  const filesCreated = [
    "raw/round_03_ngram_decade_extract.csv",
    "raw/round_03_pre_1800_negative_snippets.csv",
    "raw/round_03_historical_advertising_snippets.csv",
    "raw/round_03_consumer_transition_snippets.csv",
    "raw/round_03_modern_2019_2026_snippets.csv",
    "raw/round_03_source_access_log.csv",
    "processed/round_03_pejoration_evidence_table.csv",
    "processed/round_03_domain_timeline.csv",
    "processed/round_03_decade_signal_summary.csv",
    "processed/round_03_domain_wave_summary.csv",
    "processed/round_03_negative_charge_scores.csv",
    "processed/round_03_burst_candidates.csv",
    "processed/round_03_spiral_trajectory_candidates.csv",
    "processed/round_03_manual_review_queue.csv",
    "processed/round_03_chart4a_readiness_matrix.csv",
    "notes/round_03_collection_log.md",
    "notes/round_03_source_notes.md",
    "notes/round_03_pejoration_findings.md",
    "notes/round_03_trajectory_interpretation.md",
    "notes/round_03_chart4b_connection_notes.md",
    "notes/round_03_remaining_risks.md",
    "sources/round_03_source_urls.md",
    "scripts/README.md",
  ];

  const collectionLog = `# Round 03 Collection Log

Generated: ${generatedAt}

## Scope

Focused Chart 4A detailed data and evidence pass for \`artificial\`.

This pass collects and evaluates evidence for negative, suspicious, and pejorative charge across historical domains. It does not design Chart 4, implement visualization, write React components, create final chart copy, build the page, or decide final visual structure.

## Existing Data Read

${inputReads
  .map((item) => `- ${item.status === "read" ? "read" : "missing"}: \`${path.relative(process.cwd(), item.filePath)}\``)
  .join("\n")}

## Missing Inputs

${mdList(missingInputs.map((filePath) => `\`${path.relative(process.cwd(), filePath)}\``))}

## Ngram Handling

- Existing Chart 4 Ngram was used as the 1800-2019 baseline.
- The 140-term Ngram run was not repeated.
- Decade averages and max values were extracted for ${priorityTerms.length} priority terms.
- Ngram first visible years and frequencies are not treated as attestations or sense proof.

## Evidence Counts

- Priority Ngram decade rows: ${decadeRows.length}
- Pejoration evidence rows: ${evidenceRows.length}
- Pre-1800 snippet/status rows: ${pre1800NegativeSnippets.length}
- Historical advertising rows: ${historicalAdvertisingSnippets.length}
- Consumer transition rows: ${consumerTransitionSnippets.length}
- Modern 2019-2026 rows: ${modernSnippets.length}
- Manual review items: ${manualReviewQueue.length}

## Files Written

${mdList(filesCreated.map((file) => `\`${file}\``))}
`;
  await writeFile(path.join(NOTES_DIR, "round_03_collection_log.md"), collectionLog);

  const sourceNotes = `# Round 03 Source Notes

Generated: ${generatedAt}

## Existing Corpus Baseline

The existing Chart 4 Google Books Ngram package is used only as a visibility baseline. It was not rerun. Decade summaries are frequency signals, not sense classification.

## Pre-1800 Sources

Etymonline, Shakespeare via Project Gutenberg, Wollstonecraft via Project Gutenberg, Chambers via Project Gutenberg, and Johnson indirect evidence were used. OED and direct Johnson remain unresolved.

## 1800-1950 Sources

Chronicling America examples were retained as representative newspaper/advertising leads. OCR and page images must be checked before any final quotation.

## 1950-2019 Consumer Transition Sources

JAMA, FDA history, New Yorker, and eCFR/FDA labeling sources provide consumer/regulatory context around artificial sweeteners and artificial flavor/color categories. These are not health-risk claims.

## 2019-2026 Sources

FDA, PepsiCo/Gatorade, Campbell/Swanson, Consumer Reports, IFT, Freedonia/Packaged Facts, FoodNavigator-USA, Cambridge, Oxford, and WordReference were used as modern source-width evidence.

## Limits

- Snippets are not frequency evidence.
- Product pages can change.
- Industry and brand sources are not balanced corpora.
- Negative-charge scores are interpretive triage scores, not final chart claims.
`;
  await writeFile(path.join(NOTES_DIR, "round_03_source_notes.md"), sourceNotes);

  const pejorationFindings = `# Round 03 Pejoration Findings

Generated: ${generatedAt}

## 1. Overview

The evidence does not point cleanly to a single modern moment when \`artificial\` became negative. It shows early negative potential and later reactivation in consumer and labeling domains.

## 2. Early Negative / Affected Evidence

Etymonline, Johnson indirect, Shakespeare, and Wollstonecraft suggest that fake/not-genuine, affected/insincere, and false-emotion uses are available before modern consumer culture. OED/direct Johnson remain needed.

## 3. False Emotion and Social Manner Evidence

The strongest early false-emotion lead is \`artificial tears\`. The strongest manners lead is Wollstonecraft's \`artificial manners\`. \`Artificial smile\` remains a manual-review gap for pre-1800 evidence.

## 4. Aesthetic / Style Evidence

The Chambers/Tan Chet-qua passage gives a mixed aesthetic example around artificial manner/stile, nature, and affectation. It is useful but weaker than the social and emotional evidence.

## 5. Consumer and Food Evidence

The 1904 artificially-colored food lead and artificial sweetener/cyclamate materials show consumer/regulatory scrutiny around artificial food categories, but the historical advertising sample remains thin.

## 6. Absence Claims

The 1950 \`no artificial flavoring\` ad and modern \`no artificial\` product/regulatory examples are the strongest avoidance/absence evidence.

## 7. Modern 2019-2026 Evidence

FDA, Gatorade, Swanson, Consumer Reports, and clean-label sources show recent source width around no-artificial claims, clean-label language, and natural/artificial opposition.

## 8. Strongest Evidence

- Pre-1800: artificial tears; artificial manners; Etymonline/Johnson indirect lexical leads.
- 1900-1950: artificially colored food lead.
- 1950-2000: no artificial flavoring ad; artificial sweetener scrutiny.
- 2019-2026: FDA no artificial colors, Gatorade no artificial flavors/sweeteners/colors, Swanson no artificial ingredients.

## 9. Weakest Evidence

- 1850-1900 consumer/advertising bridge.
- Pre-1800 artificial smile/expression/sentiment.
- Physical packaging image evidence.
- Balanced modern corpus evidence.

## 10. What Still Needs Review

OED/direct Johnson, more Google Books snippets, IA/HathiTrust/ECCO/EEBO if accessible, and a larger historical ad/magazine search.
`;
  await writeFile(path.join(NOTES_DIR, "round_03_pejoration_findings.md"), pejorationFindings);

  const trajectoryInterpretation = `# Round 03 Trajectory Interpretation

Generated: ${generatedAt}

## Cautious Reading

The current evidence makes a simple linear rise look weak. \`Artificial\` already has negative potential in early lexical, emotional, and manners contexts. Modern consumer suspicion is not the origin of negativity; it appears to reactivate and intensify older tensions in newer domains.

## Linear Rise

Weak. The modern no-artificial cluster is strong, but pre-1800 evidence prevents treating negativity as a purely late development.

## Early Split

Promising. Neutral/not-natural/made-by-art senses coexist with fake/not-genuine and affected/insincere branches early.

## Wave Pattern

Possible. Different domains appear in different periods: early manners/emotion, then food/coloring, then sweeteners/regulation, then clean-label/absence claims.

## Burst Periods

Possible but uneven. Candidate bursts include pre-1800 affected/false emotion, early 1900 food/coloring, mid-century no-artificial advertising and artificial sweetener scrutiny, and 2019-2026 clean-label/absence claims.

## Spiral Accumulation

Promising but not final. Older suspicions around insincerity and not-genuine seem to return in new domains: social performance, aesthetics, industrial/food processing, absence claims, and authenticity discourse.

## Domain Transfer

Promising. The same evaluative potential travels across domains rather than simply increasing in one domain.

## Unclear Areas

The 1850-1900 and 1950-2019 evidence is not yet broad enough to confidently distinguish wave pattern from sparse-source artifact.
`;
  await writeFile(path.join(NOTES_DIR, "round_03_trajectory_interpretation.md"), trajectoryInterpretation);

  const chart4bNotes = `# Round 03 Chart 4B Connection Notes

Generated: ${generatedAt}

## 1. Artificial and Fake / Not Genuine

Johnson indirect, Webster 1828, Etymonline, and artificial tears evidence connect artificial to fake/not-genuine or feigned contexts. This supports Chart 4B, but it does not mean artificial equals fake.

## 2. Artificial and Real / Realistic

Consumer Reports natural-label context and modern dictionary sources show artificial interacting with real/natural expectations. This needs a dedicated Chart 4B semantic-distance pass.

## 3. Artificial and Synthetic / Imitation

Artificial sweetener, synthetic, imitation, and clean-label sources show links to industrial/substitute language. These are adjacent but not interchangeable categories.

## 4. Fake-Adjacent but Not Identical

The strongest guardrail is that artificial can mean not natural, made by art, synthetic, imitation, affected, feigned, or not genuine depending on context. The evidence supports adjacency, not identity.

## 5. Remaining Semantic-Distance Needs

- Collocation or corpus-context pass for artificial/fake/real/genuine/natural/synthetic/imitation.
- Dedicated dictionary/thesaurus matrix.
- Modern snippets comparing artificial with realistic, real, authentic, genuine, synthetic, simulated, and imitation.
`;
  await writeFile(path.join(NOTES_DIR, "round_03_chart4b_connection_notes.md"), chart4bNotes);

  const remainingRisks = `# Round 03 Remaining Risks

Generated: ${generatedAt}

- OED/direct Johnson are still missing.
- Pre-1800 snippets are sparse outside artificial tears and artificial manners.
- Advertising evidence is uneven, especially 1850-1900 and 1950-2019.
- Modern sources may be biased toward brand claims, regulatory controversy, and accessible web pages.
- Ngram frequency is not sentiment.
- Absence claims do not prove health risk.
- Negative-charge scoring is interpretive triage.
- Chart 4B still needs its own semantic-distance review.
- No final Chart 4A visual structure is supported yet.
`;
  await writeFile(path.join(NOTES_DIR, "round_03_remaining_risks.md"), remainingRisks);

  const sourceUrlsMd = `# Round 03 Source URLs

Generated: ${generatedAt}

${Object.entries(sourceUrls)
  .map(([key, url]) => `- ${key}: ${url}`)
  .join("\n")}
`;
  await writeFile(path.join(SOURCES_DIR, "round_03_source_urls.md"), sourceUrlsMd);

  const scriptsReadme = `# Round 03 Scripts

- Project-level builder: \`scripts/build_chart_04a_pejoration_round_03.ts\`
- Reads existing Chart 4 data and writes Chart 4A trajectory round 03 outputs.
- Does not rerun Ngram.
`;
  await writeFile(path.join(SCRIPTS_DIR, "README.md"), scriptsReadme);

  console.log(
    JSON.stringify(
      {
        generatedAt,
        outputRoot: BASE_DIR,
        missingInputs: missingInputs.map((filePath) => path.relative(process.cwd(), filePath)),
        ngramRowsRead: ngramRows.length,
        decadeRows: decadeRows.length,
        evidenceRows: evidenceRows.length,
        pre1800NegativeSnippets: pre1800NegativeSnippets.length,
        historicalAdvertisingSnippets: historicalAdvertisingSnippets.length,
        consumerTransitionSnippets: consumerTransitionSnippets.length,
        modernSnippets: modernSnippets.length,
        manualReviewItems: manualReviewQueue.length,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
