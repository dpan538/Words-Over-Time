import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const CHART4_DIR = path.join(process.cwd(), "docs", "research", "artificial", "chart_04_suspicion_distance");
const ROUND2_DIR = path.join(CHART4_DIR, "expanded_corpus_round_02");
const ROUND3_DIR = path.join(CHART4_DIR, "chart_04a_pejoration_trajectory_round_03");
const BASE_DIR = path.join(CHART4_DIR, "chart_04a_evidence_hardening_round_04");
const RAW_DIR = path.join(BASE_DIR, "raw");
const PROCESSED_DIR = path.join(BASE_DIR, "processed");
const NOTES_DIR = path.join(BASE_DIR, "notes");
const SOURCES_DIR = path.join(BASE_DIR, "sources");
const SCRIPTS_DIR = path.join(BASE_DIR, "scripts");

type CsvValue = string | number | boolean | null;
type CsvRow = Record<string, CsvValue>;

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

const urls = {
  chart4: "docs/research/artificial/chart_04_suspicion_distance/",
  round2: "docs/research/artificial/chart_04_suspicion_distance/expanded_corpus_round_02/",
  round3: "docs/research/artificial/chart_04_suspicion_distance/chart_04a_pejoration_trajectory_round_03/",
  oed: "https://www.oed.com/",
  etymonlineArtificial: "https://www.etymonline.com/word/artificial",
  etymonlineArtificiality: "https://www.etymonline.com/word/artificiality",
  etymonlineArtifice: "https://www.etymonline.com/word/artifice",
  johnsonIndirect: "https://www.definitions.net/definition/artificial",
  webster1828: "https://webstersdictionary1828.com/Dictionary/artificial",
  webster1913Artificial: "https://www.websters1913.com/words/Artificial",
  shakespeareHenryVI: "https://www.gutenberg.org/files/1502/1502-h/1502-h.htm",
  wollstonecraft: "https://www.gutenberg.org/ebooks/67466.html.images",
  chambers: "https://www.gutenberg.org/cache/epub/39803/pg39803-images.html",
  fdaColorHistory: "https://www.fda.gov/industry/color-additives/color-additives-history",
  annArbor1893: "https://aadl.org/node/521746",
  scientificAmerican1898: "https://www.scientificamerican.com/article/artificial-coloring-of-food-products/",
  chroniclingArtificiallyColored: "https://chroniclingamerica.loc.gov/lccn/sn86090233/1904-05-12/ed-1/seq-6/",
  chroniclingKitchenBouquet: "https://chroniclingamerica.loc.gov/lccn/sn83045462/1950-05-03/ed-1/seq-42/",
  jamaCyclamate: "https://jamanetwork.com/journals/jama/fullarticle/349150",
  newYorkerCyclamate: "https://www.newyorker.com/magazine/1969/11/01/comment-5253",
  fdaMilestones: "https://www.fda.gov/about-fda/fda-history/milestones-us-food-and-drug-law",
  nestle2015: "https://www.nestleusa.com/media/pressreleases/nestle-usa-removing-artificial-flavors-colors-from-chocolate-candy",
  kraft2015:
    "https://news.kraftheinzcompany.com/press-releases-details/2015/Kraft-Macaroni--Cheese-Announces-Recipe-Change/default.aspx",
  generalMills2015:
    "https://www.generalmills.com/news/press-releases/general-mills-cereals-commits-to-remove-artificial-flavors-and-colors-from-artificial-sources",
  ecfr10122: "https://ecfr.io/Title-21/Section-101.22",
  fdaNoArtificialColors:
    "https://www.fda.gov/food/food-chemical-safety/letter-food-industry-no-artificial-colors-labeling-claims",
  fdaNoArtificialColorsRelease:
    "https://www.fda.gov/news-events/press-announcements/fda-takes-new-approach-no-artificial-colors-claims",
  kraft2025:
    "https://news.kraftheinzcompany.com/press-releases-details/2025/Kraft-Heinz-Commits-to-Remove-FDC-Colors-From-Its-U-S--Portfolio-Before-the-End-of-2027-and-Will-Not-Launch-New-Products-in-the-U-S--With-FDC-Colors-Effective-Immediately/default.aspx",
  pepsicoGatorade:
    "https://www.pepsico.com/en/newsroom/press-releases/2026/gatorade-lower-sugar-brings-a-new-era-of-hydration-with-no-artificial-flavors-sweeteners-or-colors",
  swansonLessSodium: "https://www.campbells.com/swanson/products/broth/50-less-sodium-beef-broth/",
  consumerReportsNatural: "https://www.consumerreports.org/food-labels/seals-and-claims/natural",
  consumerReportsSweeteners:
    "https://www.consumerreports.org/health/sugar-sweeteners/the-truth-about-artificial-sweeteners-a2293745150/",
  iftCleanLabel: "https://www.ift.org/food-technology-magazine/ingredients-clean-label",
  freedoniaCleanLabel:
    "https://www.freedoniagroup.com/press-releases/new-report-consumers-crave-transparency-clean-label-foods-on-the-rise",
  cambridgeThesaurus: "https://dictionary.cambridge.org/us/thesaurus/articles/made-by-humans",
  oxfordArtificial: "https://www.oxfordlearnersdictionaries.com/definition/english/artificial",
  wordReferenceArtificial: "https://www.wordreference.com/definition/artificial",
  merriamArtificial: "https://www.merriam-webster.com/dictionary/artificial",
  merriamFake: "https://www.merriam-webster.com/dictionary/fake",
  merriamSynthetic: "https://www.merriam-webster.com/dictionary/synthetic",
};

const lexicalAuthorityExtracts: CsvRow[] = [
  {
    source_name: "OED",
    entry_or_term: "artificial; artificiality; artifice",
    access_status: "not_accessible",
    sense_label: "unverified",
    period_or_date_if_available: "",
    supports_not_natural: "",
    supports_fake_not_genuine: "",
    supports_affected_insincere: "",
    supports_contrived_or_feigned: "",
    distinguishes_not_natural_from_fake: "",
    source_url: urls.oed,
    notes: "Not accessible in this pass; still the strongest source needed for final dated sense chronology.",
  },
  {
    source_name: "Etymonline",
    entry_or_term: "artificial",
    access_status: "accessed",
    sense_label: "not natural; made by art; imitation/substitute; affected/insincere; fictitious/not genuine",
    period_or_date_if_available: "late 14c.; early 15c.; 16c.; 1590s; 1640s",
    supports_not_natural: true,
    supports_fake_not_genuine: true,
    supports_affected_insincere: true,
    supports_contrived_or_feigned: true,
    distinguishes_not_natural_from_fake: true,
    source_url: urls.etymonlineArtificial,
    notes: "Useful chronology pointer, but secondary.",
  },
  {
    source_name: "Etymonline",
    entry_or_term: "artificiality",
    access_status: "accessed",
    sense_label: "appearance of art; insincerity",
    period_or_date_if_available: "1763 for artificiality; 1590s for artificialness",
    supports_not_natural: false,
    supports_fake_not_genuine: false,
    supports_affected_insincere: true,
    supports_contrived_or_feigned: true,
    distinguishes_not_natural_from_fake: false,
    source_url: urls.etymonlineArtificiality,
    notes: "Strengthens pre-1800 affected/insincere lexical authority.",
  },
  {
    source_name: "Etymonline",
    entry_or_term: "artifice",
    access_status: "accessed",
    sense_label: "workmanship by craft/skill; crafty device/trick",
    period_or_date_if_available: "1530s; 1650s",
    supports_not_natural: false,
    supports_fake_not_genuine: true,
    supports_affected_insincere: false,
    supports_contrived_or_feigned: true,
    distinguishes_not_natural_from_fake: false,
    source_url: urls.etymonlineArtifice,
    notes: "Useful art-family support for skill-to-trick branch.",
  },
  {
    source_name: "Johnson via Definitions.net",
    entry_or_term: "artificial",
    access_status: "indirect_only",
    sense_label: "made by art; not natural; fictitious; not genuine; artful",
    period_or_date_if_available: "1755/1773 indirect transcription",
    supports_not_natural: true,
    supports_fake_not_genuine: true,
    supports_affected_insincere: false,
    supports_contrived_or_feigned: true,
    distinguishes_not_natural_from_fake: true,
    source_url: urls.johnsonIndirect,
    notes: "Direct Johnson still not stabilized; useful but must remain indirect.",
  },
  {
    source_name: "Webster 1828",
    entry_or_term: "artificial",
    access_status: "accessed",
    sense_label: "made/contrived by art; opposed to natural; feigned/fictitious/not genuine",
    period_or_date_if_available: "1828 checkpoint",
    supports_not_natural: true,
    supports_fake_not_genuine: true,
    supports_affected_insincere: false,
    supports_contrived_or_feigned: true,
    distinguishes_not_natural_from_fake: true,
    source_url: urls.webster1828,
    notes: "Checkpoint only, not origin.",
  },
  {
    source_name: "Webster 1913",
    entry_or_term: "artificial",
    access_status: "accessed",
    sense_label: "made by art; feigned; fictitious; not genuine or natural",
    period_or_date_if_available: "1913 dictionary snapshot",
    supports_not_natural: true,
    supports_fake_not_genuine: true,
    supports_affected_insincere: true,
    supports_contrived_or_feigned: true,
    distinguishes_not_natural_from_fake: true,
    source_url: urls.webster1913Artificial,
    notes: "Later comparison source; useful for continuity of sense inventory.",
  },
  {
    source_name: "Merriam-Webster",
    entry_or_term: "artificial",
    access_status: "accessed",
    sense_label: "human-made; not genuine or natural; affected; not spontaneous",
    period_or_date_if_available: "modern dictionary; first known use listed as 15th century",
    supports_not_natural: true,
    supports_fake_not_genuine: true,
    supports_affected_insincere: true,
    supports_contrived_or_feigned: true,
    distinguishes_not_natural_from_fake: true,
    source_url: urls.merriamArtificial,
    notes: "Modern authority for live sense boundaries; not historical chronology proof.",
  },
  {
    source_name: "Bailey / Ash / Sheridan / Walker",
    entry_or_term: "artificial",
    access_status: "partially_accessed",
    sense_label: "scan/search leads only",
    period_or_date_if_available: "18th century",
    supports_not_natural: "",
    supports_fake_not_genuine: "",
    supports_affected_insincere: "",
    supports_contrived_or_feigned: "",
    distinguishes_not_natural_from_fake: "",
    source_url: "",
    notes: "No stable entry extraction completed; keep as optional manual scan work.",
  },
];

const snippets1850_1900: CsvRow[] = [
  {
    id: "r04_1850_001",
    term_or_phrase: "artificial coloring",
    year_or_period: "1856 onward; 1881 first FDA-approved synthetic color noted",
    source_name: "FDA Color Additives History",
    source_type: "regulatory_source",
    source_url: urls.fdaColorHistory,
    evidence_kind: "context_signal",
    sense_or_usage: "industrial_synthetic",
    domain: "industrial_synthetic",
    short_summary:
      "FDA historical page places synthetic organic dyes in the 1850s and food-use certification in the late 19th century.",
    confidence: "high",
    notes: "Background for industrial/chemical food color context; not sentiment proof.",
  },
  {
    id: "r04_1850_002",
    term_or_phrase: "artificial coloring of food products",
    year_or_period: "1898",
    source_name: "Scientific American lead",
    source_type: "magazine_snippet",
    source_url: urls.scientificAmerican1898,
    evidence_kind: "context_signal",
    sense_or_usage: "consumer_suspicion",
    domain: "processed_consumer",
    short_summary:
      "Scientific American title directly marks artificial coloring of food products as a period topic.",
    confidence: "medium",
    notes: "Search/discovery lead; needs page verification before quotation.",
  },
  {
    id: "r04_1850_003",
    term_or_phrase: "adulteration; imitation; genuine",
    year_or_period: "1893",
    source_name: "Ann Arbor Register: Food Adulteration",
    source_type: "newspaper_snippet",
    source_url: urls.annArbor1893,
    evidence_kind: "context_signal",
    sense_or_usage: "consumer_suspicion",
    domain: "processed_consumer",
    short_summary:
      "Public newspaper item around food adulteration supplies nearby trust vocabulary for pure/genuine/imitation context.",
    confidence: "medium",
    notes: "Not an artificial phrase by itself; useful gap-context evidence.",
  },
];

const snippets1900_1950: CsvRow[] = [
  {
    id: "r04_1900_001",
    term_or_phrase: "artificially colored",
    year_or_period: "1904-05-12",
    source_name: "The Port Gibson Reveille via Chronicling America",
    source_type: "newspaper_snippet",
    source_url: urls.chroniclingArtificiallyColored,
    evidence_kind: "context_signal",
    sense_or_usage: "consumer_suspicion",
    domain: "processed_consumer",
    short_summary:
      "Food item contrasts a product not artificially colored with imitations colored by coal-tar dyes.",
    confidence: "medium",
    notes: "Earlier round lead retained as anchor; page image should be reviewed.",
  },
  {
    id: "r04_1900_002",
    term_or_phrase: "artificial colors; adulteration",
    year_or_period: "1906 and 1938 law milestones",
    source_name: "FDA milestones in food and drug law",
    source_type: "regulatory_source",
    source_url: urls.fdaMilestones,
    evidence_kind: "context_signal",
    sense_or_usage: "consumer_suspicion",
    domain: "processed_consumer",
    short_summary:
      "FDA legal milestones frame food adulteration, color additives, and consumer protection across the early 20th century.",
    confidence: "high",
    notes: "Regulatory continuity evidence, not a chart claim about sentiment.",
  },
];

const snippets1950_2019: CsvRow[] = [
  {
    id: "r04_1950_001",
    term_or_phrase: "no artificial flavoring",
    year_or_period: "1950-05-03",
    source_name: "Evening Star via Chronicling America",
    source_type: "advertising_snippet",
    source_url: urls.chroniclingKitchenBouquet,
    evidence_kind: "advertising_claim",
    sense_or_usage: "absence_claim",
    domain: "absence_claim",
    short_summary: "Kitchen Bouquet ad uses no artificial flavoring as a positive taste/trust distinction.",
    confidence: "medium",
    notes: "Retained as mid-century anchor.",
  },
  {
    id: "r04_1950_002",
    term_or_phrase: "artificial sweetener",
    year_or_period: "1969-1976",
    source_name: "JAMA / FDA / New Yorker cyclamate materials",
    source_type: "secondary_literature",
    source_url: `${urls.jamaCyclamate}; ${urls.fdaMilestones}; ${urls.newYorkerCyclamate}`,
    evidence_kind: "context_signal",
    sense_or_usage: "industrial_synthetic",
    domain: "industrial_synthetic",
    short_summary:
      "Cyclamate/artificial-sweetener discourse gives a late-1960s consumer/regulatory scrutiny anchor.",
    confidence: "medium",
    notes: "No health claim; use only as scrutiny/reformulation context.",
  },
  {
    id: "r04_1950_003",
    term_or_phrase: "remove artificial flavors and certified colors",
    year_or_period: "2015",
    source_name: "Nestle USA candy reformulation release",
    source_type: "web_snippet",
    source_url: urls.nestle2015,
    evidence_kind: "context_signal",
    sense_or_usage: "absence_claim",
    domain: "absence_claim",
    short_summary:
      "Nestle announced removal of artificial flavors and certified colors from chocolate candy brands.",
    confidence: "high",
    notes: "Strong pre-2019 reformulation/absence anchor.",
  },
  {
    id: "r04_1950_004",
    term_or_phrase: "no artificial flavors, preservatives or synthetic colors",
    year_or_period: "2015",
    source_name: "Kraft Macaroni & Cheese recipe change",
    source_type: "web_snippet",
    source_url: urls.kraft2015,
    evidence_kind: "context_signal",
    sense_or_usage: "absence_claim",
    domain: "absence_claim",
    short_summary:
      "Kraft announced recipe changes using no artificial flavors, preservatives, or synthetic colors.",
    confidence: "high",
    notes: "Strong pre-clean-label transition anchor.",
  },
  {
    id: "r04_1950_005",
    term_or_phrase: "remove artificial flavors and colors from artificial sources",
    year_or_period: "2015",
    source_name: "General Mills cereals announcement",
    source_type: "web_snippet",
    source_url: urls.generalMills2015,
    evidence_kind: "context_signal",
    sense_or_usage: "absence_claim",
    domain: "absence_claim",
    short_summary:
      "General Mills announced a cereal portfolio commitment to remove artificial flavors and colors from artificial sources.",
    confidence: "high",
    notes: "Useful 2010s mass-market food anchor.",
  },
];

const snippets2019_2026: CsvRow[] = [
  {
    id: "r04_modern_001",
    term_or_phrase: "no artificial colors",
    year_or_period: "2026-02-05",
    source_name: "FDA no artificial colors labeling letter",
    source_type: "regulatory_source",
    source_url: urls.fdaNoArtificialColors,
    evidence_kind: "regulatory_definition",
    sense_or_usage: "absence_claim",
    domain: "absence_claim",
    short_summary: "FDA addresses voluntary no artificial colors claims for foods without certified colors.",
    confidence: "high",
    notes: "Strong official modern hardening evidence.",
  },
  {
    id: "r04_modern_002",
    term_or_phrase: "remove FD&C colors",
    year_or_period: "2025",
    source_name: "Kraft Heinz FD&C colors commitment",
    source_type: "web_snippet",
    source_url: urls.kraft2025,
    evidence_kind: "context_signal",
    sense_or_usage: "absence_claim",
    domain: "absence_claim",
    short_summary:
      "Kraft Heinz committed to remove certified colors from its U.S. portfolio and not launch new U.S. products with them.",
    confidence: "high",
    notes: "Modern reformulation-away-from-artificial-color anchor.",
  },
  {
    id: "r04_modern_003",
    term_or_phrase: "no artificial flavors, sweeteners or colors",
    year_or_period: "2026-03-04",
    source_name: "PepsiCo / Gatorade",
    source_type: "packaging_claim",
    source_url: urls.pepsicoGatorade,
    evidence_kind: "packaging_claim",
    sense_or_usage: "absence_claim",
    domain: "absence_claim",
    short_summary: "Gatorade launch copy foregrounds absence of artificial flavors, sweeteners, and colors.",
    confidence: "high",
    notes: "Modern product positioning evidence.",
  },
  {
    id: "r04_modern_004",
    term_or_phrase: "no artificial ingredients",
    year_or_period: "current page accessed 2026-05-12",
    source_name: "Swanson 50% Less Sodium Beef Broth",
    source_type: "packaging_claim",
    source_url: urls.swansonLessSodium,
    evidence_kind: "packaging_claim",
    sense_or_usage: "absence_claim",
    domain: "absence_claim",
    short_summary:
      "Product page clusters no artificial ingredients with no MSG added, no preservatives, and gluten-free language.",
    confidence: "high",
    notes: "Product page may change.",
  },
  {
    id: "r04_modern_005",
    term_or_phrase: "clean label; artificial or synthetic",
    year_or_period: "2021-2024",
    source_name: "IFT / Freedonia clean-label sources",
    source_type: "industry_report",
    source_url: `${urls.iftCleanLabel}; ${urls.freedoniaCleanLabel}`,
    evidence_kind: "context_signal",
    sense_or_usage: "consumer_suspicion",
    domain: "modern_authenticity",
    short_summary:
      "Clean-label sources connect simple/recognizable ingredients with avoiding artificial or synthetic additives.",
    confidence: "medium",
    notes: "Industry/secondary context; not balanced corpus.",
  },
];

const chart4bLeads: CsvRow[] = [
  {
    id: "r04_4b_001",
    lead_topic: "artificial_vs_fake",
    term_or_phrase: "artificial; fake",
    source_name: "Merriam-Webster and Oxford learner sources",
    source_type: "modern_dictionary",
    source_url: `${urls.merriamArtificial}; ${urls.merriamFake}; ${urls.oxfordArtificial}`,
    why_useful_for_chart4b:
      "Separates artificial as made/produced by people or not natural from fake as not genuine or counterfeit.",
    confidence: "medium",
    notes: "Useful distinction; still needs corpus examples.",
  },
  {
    id: "r04_4b_002",
    lead_topic: "artificial_vs_genuine",
    term_or_phrase: "artificial; genuine",
    source_name: "Johnson indirect / Webster 1828 / modern dictionaries",
    source_type: "historical_dictionary",
    source_url: `${urls.johnsonIndirect}; ${urls.webster1828}`,
    why_useful_for_chart4b: "Shows artificial can be defined as not genuine while also preserving not-natural as a separate sense.",
    confidence: "medium",
    notes: "Direct Johnson/OED needed for hard chronology.",
  },
  {
    id: "r04_4b_003",
    lead_topic: "artificial_vs_synthetic",
    term_or_phrase: "artificial; synthetic",
    source_name: "Cambridge Thesaurus / Merriam-Webster",
    source_type: "modern_dictionary",
    source_url: `${urls.cambridgeThesaurus}; ${urls.merriamSynthetic}`,
    why_useful_for_chart4b:
      "Helps separate artificial as human-made/not natural from synthetic as chemically or artificially produced.",
    confidence: "medium",
    notes: "Needs term-pair contextual corpus later.",
  },
  {
    id: "r04_4b_004",
    lead_topic: "artificial_vs_imitation",
    term_or_phrase: "artificial imitation; imitation",
    source_name: "Etymonline / Cambridge / Oxford",
    source_type: "modern_dictionary",
    source_url: `${urls.etymonlineArtificial}; ${urls.cambridgeThesaurus}; ${urls.oxfordArtificial}`,
    why_useful_for_chart4b: "Useful for substitute/copy branch without collapsing every artificial use into deception.",
    confidence: "medium",
    notes: "Needs snippet examples.",
  },
  {
    id: "r04_4b_005",
    lead_topic: "artificial_vs_natural",
    term_or_phrase: "artificial; natural",
    source_name: "Consumer Reports natural label guide / Webster 1828",
    source_type: "consumer_report",
    source_url: `${urls.consumerReportsNatural}; ${urls.webster1828}`,
    why_useful_for_chart4b: "Connects historical not-natural sense with modern consumer expectations around natural labels.",
    confidence: "medium",
    notes: "Good bridge from 4A to 4B.",
  },
  {
    id: "r04_4b_006",
    lead_topic: "artificial_vs_authentic",
    term_or_phrase: "artificial; authentic",
    source_name: "WordReference / Oxford learner source",
    source_type: "modern_dictionary",
    source_url: `${urls.wordReferenceArtificial}; ${urls.oxfordArtificial}`,
    why_useful_for_chart4b: "Useful modern comparator around sincerity, authenticity, and not genuine senses.",
    confidence: "medium",
    notes: "Needs dedicated Chart 4B source pass.",
  },
  {
    id: "r04_4b_007",
    lead_topic: "artificial_vs_realistic",
    term_or_phrase: "artificial; realistic; real",
    source_name: "Oxford learner source / WordReference",
    source_type: "modern_dictionary",
    source_url: `${urls.oxfordArtificial}; ${urls.wordReferenceArtificial}`,
    why_useful_for_chart4b: "Flags real/realistic as separate comparators from fake/genuine.",
    confidence: "low_medium",
    notes: "Only a lead; needs more targeted collection.",
  },
];

const hardeningRows: CsvRow[] = [
  {
    id: "h001",
    term_or_phrase: "artificial",
    focus_area: "lexical_authority",
    domain: "early_lexical_negative",
    source_period: "pre_1800",
    year_or_period: "late 14c.-1640s chronology",
    source_name: "Etymonline",
    source_type: "etymology_source",
    source_url: urls.etymonlineArtificial,
    evidence_kind: "definition",
    sense_or_usage: "fake_not_genuine",
    confidence: "medium",
    negative_charge: 2,
    short_summary:
      "Secondary source distinguishes not-natural/made-by-art from affected/insincere and fictitious/not-genuine branches.",
    chart4a_value: "high",
    chart4b_value: "medium",
    gap_filled: "partial",
    needs_followup: true,
    notes: "OED remains inaccessible.",
  },
  {
    id: "h002",
    term_or_phrase: "artificial",
    focus_area: "lexical_authority",
    domain: "fake_not_genuine",
    source_period: "pre_1800",
    year_or_period: "1755/1773 indirect transcription",
    source_name: "Johnson via Definitions.net",
    source_type: "historical_dictionary",
    source_url: urls.johnsonIndirect,
    evidence_kind: "definition",
    sense_or_usage: "fake_not_genuine",
    confidence: "medium",
    negative_charge: 2,
    short_summary:
      "Indirect Johnson evidence separates made-by-art/not-natural from fictitious/not-genuine and artful senses.",
    chart4a_value: "high",
    chart4b_value: "high",
    gap_filled: "partial",
    needs_followup: true,
    notes: "Direct Johnson remains unresolved.",
  },
  {
    id: "h003",
    term_or_phrase: "artificial",
    focus_area: "lexical_authority",
    domain: "fake_not_genuine",
    source_period: "1800_1850",
    year_or_period: "1828 checkpoint",
    source_name: "Webster 1828",
    source_type: "historical_dictionary",
    source_url: urls.webster1828,
    evidence_kind: "definition",
    sense_or_usage: "fake_not_genuine",
    confidence: "high",
    negative_charge: 2,
    short_summary:
      "Checkpoint dictionary keeps made-by-art/not-natural distinct from feigned/fictitious/not-genuine.",
    chart4a_value: "medium",
    chart4b_value: "high",
    gap_filled: "partial",
    needs_followup: false,
    notes: "Not an origin source.",
  },
  {
    id: "h004",
    term_or_phrase: "artificial coloring",
    focus_area: "gap_1850_1900",
    domain: "industrial_synthetic",
    source_period: "1850_1900",
    year_or_period: "1856-1898",
    source_name: "FDA Color Additives History / Scientific American lead",
    source_type: "regulatory_source",
    source_url: `${urls.fdaColorHistory}; ${urls.scientificAmerican1898}`,
    evidence_kind: "context_signal",
    sense_or_usage: "industrial_synthetic",
    confidence: "medium_high",
    negative_charge: 2,
    short_summary:
      "Synthetic dye and artificial food-coloring evidence gives the 1850-1900 period a usable industrial/food trust anchor.",
    chart4a_value: "high",
    chart4b_value: "low",
    gap_filled: "yes",
    needs_followup: true,
    notes: "Scientific American page needs verification before quotation.",
  },
  {
    id: "h005",
    term_or_phrase: "adulteration; imitation; genuine",
    focus_area: "gap_1850_1900",
    domain: "processed_consumer",
    source_period: "1850_1900",
    year_or_period: "1893",
    source_name: "Ann Arbor Register food adulteration item",
    source_type: "newspaper_snippet",
    source_url: urls.annArbor1893,
    evidence_kind: "context_signal",
    sense_or_usage: "consumer_suspicion",
    confidence: "medium",
    negative_charge: 2,
    short_summary:
      "Food adulteration context adds nearby purity/genuine/imitation vocabulary to the 1850-1900 gap.",
    chart4a_value: "medium",
    chart4b_value: "medium",
    gap_filled: "partial",
    needs_followup: true,
    notes: "Not an artificial phrase; use as context only.",
  },
  {
    id: "h006",
    term_or_phrase: "artificially colored",
    focus_area: "consumer_transition",
    domain: "processed_consumer",
    source_period: "1900_1950",
    year_or_period: "1904",
    source_name: "Chronicling America food-coloring lead",
    source_type: "newspaper_snippet",
    source_url: urls.chroniclingArtificiallyColored,
    evidence_kind: "context_signal",
    sense_or_usage: "consumer_suspicion",
    confidence: "medium",
    negative_charge: 2,
    short_summary: "Early 1900s food-coloring item anchors consumer/purity suspicion around artificial coloring.",
    chart4a_value: "medium",
    chart4b_value: "low",
    gap_filled: "partial",
    needs_followup: true,
    notes: "Retained from earlier round; still needs page review.",
  },
  {
    id: "h007",
    term_or_phrase: "no artificial flavoring",
    focus_area: "consumer_transition",
    domain: "absence_claim",
    source_period: "1950_2000",
    year_or_period: "1950",
    source_name: "Kitchen Bouquet advertisement",
    source_type: "advertising_snippet",
    source_url: urls.chroniclingKitchenBouquet,
    evidence_kind: "advertising_claim",
    sense_or_usage: "absence_claim",
    confidence: "medium",
    negative_charge: 4,
    short_summary: "Mid-century advertisement turns absence of artificial flavoring into positive trust/taste evidence.",
    chart4a_value: "high",
    chart4b_value: "medium",
    gap_filled: "partial",
    needs_followup: true,
    notes: "Page image verification needed.",
  },
  {
    id: "h008",
    term_or_phrase: "artificial sweetener",
    focus_area: "consumer_transition",
    domain: "industrial_synthetic",
    source_period: "1950_2000",
    year_or_period: "1969-1976",
    source_name: "JAMA / FDA / New Yorker cyclamate materials",
    source_type: "secondary_literature",
    source_url: `${urls.jamaCyclamate}; ${urls.fdaMilestones}; ${urls.newYorkerCyclamate}`,
    evidence_kind: "context_signal",
    sense_or_usage: "consumer_suspicion",
    confidence: "medium",
    negative_charge: 3,
    short_summary: "Artificial sweetener discourse anchors late-1960s additive scrutiny and reformulation language.",
    chart4a_value: "medium",
    chart4b_value: "low",
    gap_filled: "partial",
    needs_followup: true,
    notes: "No health claim.",
  },
  {
    id: "h009",
    term_or_phrase: "remove artificial flavors/colors",
    focus_area: "consumer_transition",
    domain: "absence_claim",
    source_period: "2000_2019",
    year_or_period: "2015",
    source_name: "Nestle / Kraft / General Mills reformulation announcements",
    source_type: "web_snippet",
    source_url: `${urls.nestle2015}; ${urls.kraft2015}; ${urls.generalMills2015}`,
    evidence_kind: "context_signal",
    sense_or_usage: "absence_claim",
    confidence: "high",
    negative_charge: 4,
    short_summary:
      "Major food brands publicly announced removal of artificial flavors, colors, preservatives, or synthetic colors in 2015.",
    chart4a_value: "high",
    chart4b_value: "medium",
    gap_filled: "yes",
    needs_followup: false,
    notes: "Strong pre-2019 continuity improvement.",
  },
  {
    id: "h010",
    term_or_phrase: "no artificial colors",
    focus_area: "modern_hardening",
    domain: "absence_claim",
    source_period: "2019_2026",
    year_or_period: "2026",
    source_name: "FDA no artificial colors labeling materials",
    source_type: "regulatory_source",
    source_url: `${urls.fdaNoArtificialColors}; ${urls.fdaNoArtificialColorsRelease}`,
    evidence_kind: "regulatory_definition",
    sense_or_usage: "absence_claim",
    confidence: "high",
    negative_charge: 4,
    short_summary: "FDA materials show no artificial colors as active modern labeling language.",
    chart4a_value: "high",
    chart4b_value: "medium",
    gap_filled: "yes",
    needs_followup: false,
    notes: "Official source.",
  },
  {
    id: "h011",
    term_or_phrase: "remove FD&C colors",
    focus_area: "modern_hardening",
    domain: "absence_claim",
    source_period: "2019_2026",
    year_or_period: "2025",
    source_name: "Kraft Heinz FD&C colors commitment",
    source_type: "web_snippet",
    source_url: urls.kraft2025,
    evidence_kind: "context_signal",
    sense_or_usage: "absence_claim",
    confidence: "high",
    negative_charge: 4,
    short_summary:
      "Kraft Heinz committed to remove certified colors from its U.S. portfolio and not launch new U.S. products with them.",
    chart4a_value: "high",
    chart4b_value: "medium",
    gap_filled: "yes",
    needs_followup: false,
    notes: "Strong reformulation-away source.",
  },
  {
    id: "h012",
    term_or_phrase: "no artificial flavors, sweeteners or colors",
    focus_area: "modern_hardening",
    domain: "absence_claim",
    source_period: "2019_2026",
    year_or_period: "2026",
    source_name: "PepsiCo / Gatorade",
    source_type: "packaging_claim",
    source_url: urls.pepsicoGatorade,
    evidence_kind: "packaging_claim",
    sense_or_usage: "absence_claim",
    confidence: "high",
    negative_charge: 4,
    short_summary: "Gatorade launch copy foregrounds no artificial flavors, sweeteners, or colors.",
    chart4a_value: "high",
    chart4b_value: "medium",
    gap_filled: "yes",
    needs_followup: false,
    notes: "Brand/product positioning.",
  },
  {
    id: "h013",
    term_or_phrase: "artificial vs fake / genuine / synthetic / imitation / natural",
    focus_area: "chart4b_bridge",
    domain: "semantic_distance_support",
    source_period: "2019_2026",
    year_or_period: "current dictionary/thesaurus",
    source_name: "Cambridge / Oxford / WordReference / Merriam-Webster",
    source_type: "modern_dictionary",
    source_url: `${urls.cambridgeThesaurus}; ${urls.oxfordArtificial}; ${urls.wordReferenceArtificial}; ${urls.merriamArtificial}`,
    evidence_kind: "comparison_lead",
    sense_or_usage: "semantic_distance",
    confidence: "medium",
    negative_charge: 1,
    short_summary:
      "Dictionary and thesaurus sources distinguish artificial from fake, genuine, synthetic, imitation, real, and natural.",
    chart4a_value: "background",
    chart4b_value: "high",
    gap_filled: "partial",
    needs_followup: true,
    notes: "Bridge only; Chart 4B still needs dedicated pass.",
  },
];

const lexicalStatus: CsvRow[] = lexicalAuthorityExtracts.map((row) => ({
  source_name: row.source_name,
  entry_or_term: row.entry_or_term,
  access_status: row.access_status,
  supports_not_natural: row.supports_not_natural,
  supports_fake_not_genuine: row.supports_fake_not_genuine,
  supports_affected_insincere: row.supports_affected_insincere,
  supports_contrived_feigned: row.supports_contrived_or_feigned,
  distinguishes_not_natural_from_fake: row.distinguishes_not_natural_from_fake,
  confidence:
    row.access_status === "accessed" ? "medium" : row.access_status === "indirect_only" ? "medium_low" : "low",
  notes: row.notes,
}));

const gapMatrix: CsvRow[] = [
  {
    gap_area: "OED_direct_Johnson",
    previous_status: "not accessible / indirect only",
    current_status: "partially_filled",
    strongest_new_evidence: "Webster 1913 continuity added; Etymonline/Webster/Johnson indirect consolidated",
    remaining_problem: "OED and direct Johnson still not accessed",
    confidence: "medium_low",
    notes: "Strengthened but not fully solved.",
  },
  {
    gap_area: "pre_1800_false_or_affected",
    previous_status: "mostly_ready but thin",
    current_status: "partially_filled",
    strongest_new_evidence: "Lexical authority table consolidates artificiality, artifice, Johnson indirect, Shakespeare, Wollstonecraft",
    remaining_problem: "More pre-1800 artificial smile/expression/sentiment snippets needed",
    confidence: "medium",
    notes: "Enough for visual planning caveat, not final chronology.",
  },
  {
    gap_area: "1850_1900_consumer_or_industrial_gap",
    previous_status: "weak",
    current_status: "mostly_filled",
    strongest_new_evidence: "FDA synthetic dye/color-additive history; Scientific American 1898 lead; 1893 food adulteration context",
    remaining_problem: "Need more direct artificial flavor/color newspaper examples",
    confidence: "medium",
    notes: "Gap is now usable as industrial/food trust context.",
  },
  {
    gap_area: "1900_1950_early_packaging_gap",
    previous_status: "medium but thin",
    current_status: "partially_filled",
    strongest_new_evidence: "1904 artificially colored lead; FDA 1906/1938 regulatory milestones",
    remaining_problem: "Need more ads before 1950",
    confidence: "medium",
    notes: "Still not broad, but no longer empty.",
  },
  {
    gap_area: "1950_2019_transition_gap",
    previous_status: "thin",
    current_status: "mostly_filled",
    strongest_new_evidence: "1950 ad; 1969 artificial sweetener/cyclamate; 2015 Nestle/Kraft/General Mills reformulation",
    remaining_problem: "1980s/1990s packaging examples still thin",
    confidence: "medium_high",
    notes: "Continuity is much better.",
  },
  {
    gap_area: "2019_2026_modern_absence_claims",
    previous_status: "strong",
    current_status: "filled",
    strongest_new_evidence: "FDA 2026; Kraft Heinz 2025; Gatorade 2026; Swanson product page",
    remaining_problem: "Current product pages can change",
    confidence: "high",
    notes: "Strong modern lane.",
  },
  {
    gap_area: "chart4b_bridge_evidence",
    previous_status: "mostly_ready but needs separate pass",
    current_status: "mostly_filled",
    strongest_new_evidence: "Dictionary/thesaurus bridge table across fake/genuine/synthetic/imitation/natural/realistic",
    remaining_problem: "No dedicated semantic-distance corpus yet",
    confidence: "medium",
    notes: "Prepared but not completed.",
  },
];

const periodAnchors: CsvRow[] = [
  {
    period: "pre_1800",
    anchor_term_or_phrase: "artificial tears; artificial manners",
    anchor_source: "Shakespeare; Wollstonecraft; Etymonline",
    source_type: "book_snippet; etymology_source",
    why_anchor: "Shows early false-emotion and affected-manners negative potential.",
    negative_charge: 3,
    domain: "false_emotion; affected_manners",
    chart4a_strength: "strong_with_caveat",
    notes: "OED/direct Johnson still needed for chronology.",
  },
  {
    period: "1800_1850",
    anchor_term_or_phrase: "artificial",
    anchor_source: "Webster 1828",
    source_type: "historical_dictionary",
    why_anchor: "Checkpoint separating not-natural from feigned/fictitious/not genuine.",
    negative_charge: 2,
    domain: "early_lexical_negative",
    chart4a_strength: "medium",
    notes: "Checkpoint only.",
  },
  {
    period: "1850_1900",
    anchor_term_or_phrase: "artificial coloring",
    anchor_source: "FDA Color Additives History; Scientific American 1898 lead",
    source_type: "regulatory_source; magazine_snippet",
    why_anchor: "Connects artificial to synthetic/industrial food-coloring context.",
    negative_charge: 2,
    domain: "industrial_synthetic",
    chart4a_strength: "medium",
    notes: "Now usable, but needs more direct newspaper examples.",
  },
  {
    period: "1900_1950",
    anchor_term_or_phrase: "artificially colored",
    anchor_source: "Chronicling America 1904; FDA food-law milestones",
    source_type: "newspaper_snippet; regulatory_source",
    why_anchor: "Food coloring, adulteration, and regulation anchor early consumer trust context.",
    negative_charge: 2,
    domain: "processed_consumer",
    chart4a_strength: "medium",
    notes: "Representative, not exhaustive.",
  },
  {
    period: "1950_2000",
    anchor_term_or_phrase: "no artificial flavoring; artificial sweetener",
    anchor_source: "Kitchen Bouquet ad; cyclamate materials",
    source_type: "advertising_snippet; secondary_literature; regulatory_source",
    why_anchor: "Shows absence claim and additive scrutiny logic.",
    negative_charge: 4,
    domain: "absence_claim; industrial_synthetic",
    chart4a_strength: "medium_high",
    notes: "More late-century packaging would help.",
  },
  {
    period: "2000_2019",
    anchor_term_or_phrase: "remove artificial flavors/colors",
    anchor_source: "Nestle; Kraft; General Mills 2015 announcements",
    source_type: "web_snippet",
    why_anchor: "Strong pre-2019 reformulation-away-from-artificial cluster.",
    negative_charge: 4,
    domain: "absence_claim",
    chart4a_strength: "strong",
    notes: "Great continuity improvement.",
  },
  {
    period: "2019_2026",
    anchor_term_or_phrase: "no artificial colors; no artificial ingredients; no artificial flavors",
    anchor_source: "FDA; Kraft Heinz; Gatorade; Swanson",
    source_type: "regulatory_source; packaging_claim; web_snippet",
    why_anchor: "Strongest modern absence/reformulation evidence.",
    negative_charge: 4,
    domain: "absence_claim",
    chart4a_strength: "strong",
    notes: "Source-diverse modern lane.",
  },
];

const trajectorySummary: CsvRow[] = [
  {
    trajectory_model: "linear_pejoration",
    status: "weak",
    strongest_support: "Modern no-artificial claims intensify negative value.",
    new_support_from_round_04: "2015/2025/2026 reformulation-away sources strengthen modern rise.",
    main_weakness: "Early negative potential predates modern consumer culture.",
    confidence: "medium",
    notes: "Still not the best model.",
  },
  {
    trajectory_model: "early_split_then_reactivation",
    status: "strong",
    strongest_support: "Early lexical/false-emotion/manners evidence plus modern absence claims.",
    new_support_from_round_04: "Lexical authority consolidation and 1850-2019 continuity anchors.",
    main_weakness: "OED/direct Johnson missing.",
    confidence: "medium_high",
    notes: "Best-supported model after round 04.",
  },
  {
    trajectory_model: "domain_transfer",
    status: "strong",
    strongest_support: "Manners/emotion -> food coloring/adulteration -> sweeteners/additives -> no-artificial claims.",
    new_support_from_round_04: "1850-1900 and 2000-2019 anchors strengthen the domain chain.",
    main_weakness: "Some links remain representative rather than exhaustive.",
    confidence: "medium_high",
    notes: "Now defensible for visual planning.",
  },
  {
    trajectory_model: "spiral_accumulation",
    status: "promising",
    strongest_support: "Old not-genuine/affected suspicion returns in modern authenticity and absence-claim domains.",
    new_support_from_round_04: "More continuous period anchors make this less speculative.",
    main_weakness: "Still interpretive; risks over-reading continuity.",
    confidence: "medium",
    notes: "Plausible enough to mention cautiously, not final claim.",
  },
  {
    trajectory_model: "single_modern_burst",
    status: "unsupported",
    strongest_support: "Modern source cluster is strong.",
    new_support_from_round_04: "Modern cluster strengthened, but earlier anchors also strengthened.",
    main_weakness: "Cannot explain pre-1800 and 1950-2019 evidence.",
    confidence: "high",
    notes: "Reject as main model.",
  },
  {
    trajectory_model: "wave_pattern",
    status: "promising",
    strongest_support: "Different domains activate in different periods.",
    new_support_from_round_04: "1850-1900 and 2015 anchors improve continuity.",
    main_weakness: "Representative sources, not dense corpus evidence.",
    confidence: "medium",
    notes: "Good companion to domain transfer.",
  },
];

const chart4bBridgeLeads: CsvRow[] = chart4bLeads.map((row) => ({
  lead_topic: row.lead_topic,
  term_or_phrase: row.term_or_phrase,
  source_name: row.source_name,
  source_type: row.source_type,
  why_useful_for_chart4b: row.why_useful_for_chart4b,
  confidence: row.confidence,
  notes: row.notes,
}));

const readinessUpdate: CsvRow[] = [
  {
    question: "Does artificial have early negative potential?",
    previous_status: "mostly_ready",
    updated_status: "mostly_ready",
    strongest_support: "Etymonline; artificial tears; artificial manners; Johnson indirect; Webster checkpoint",
    remaining_risk: "OED/direct Johnson unavailable",
    ready_for_visual_planning: "mostly_yes",
    notes: "Enough for planning with caveat, not final dating.",
  },
  {
    question: "Is affected/insincere evidence strong enough?",
    previous_status: "mostly_ready",
    updated_status: "mostly_ready",
    strongest_support: "Wollstonecraft artificial manners; artificiality lexical evidence",
    remaining_risk: "Need more artificial smile/expression examples",
    ready_for_visual_planning: "mostly_yes",
    notes: "Good domain lane, still thin in breadth.",
  },
  {
    question: "Is false emotion evidence strong enough?",
    previous_status: "partial",
    updated_status: "partial",
    strongest_support: "Shakespeare artificial tears",
    remaining_risk: "Still mainly one strong source",
    ready_for_visual_planning: "uncertain",
    notes: "Keep as support, not sole lane.",
  },
  {
    question: "Is there a usable 1850_1900 transition?",
    previous_status: "not_ready",
    updated_status: "mostly_ready",
    strongest_support: "FDA synthetic color history; Scientific American 1898 lead; 1893 adulteration context",
    remaining_risk: "Need more direct artificial food phrase examples",
    ready_for_visual_planning: "mostly_yes",
    notes: "The gap is now usable.",
  },
  {
    question: "Is there enough continuity from 1900 to 2026?",
    previous_status: "partial",
    updated_status: "mostly_ready",
    strongest_support: "1904 food coloring; 1950 no artificial flavoring; 1969 sweetener; 2015 brand removals; 2025/2026 sources",
    remaining_risk: "1980s/1990s still thin",
    ready_for_visual_planning: "mostly_yes",
    notes: "Continuity is much stronger.",
  },
  {
    question: "Is absence claim evidence strong enough?",
    previous_status: "mostly_ready",
    updated_status: "ready",
    strongest_support: "1950 ad; 2015 reformulations; FDA 2026; Kraft 2025; Gatorade/Swanson",
    remaining_risk: "Product pages can change",
    ready_for_visual_planning: "yes",
    notes: "Strongest Chart 4A domain.",
  },
  {
    question: "Is early_split_then_reactivation defensible?",
    previous_status: "partial",
    updated_status: "mostly_ready",
    strongest_support: "Early negative evidence plus later absence/reformulation evidence",
    remaining_risk: "OED/direct Johnson",
    ready_for_visual_planning: "mostly_yes",
    notes: "Best-supported trajectory model.",
  },
  {
    question: "Is domain_transfer defensible?",
    previous_status: "partial",
    updated_status: "mostly_ready",
    strongest_support: "Social/emotional -> food/coloring -> additive/sweetener -> no-artificial/clean-label chain",
    remaining_risk: "More mid-century examples would help",
    ready_for_visual_planning: "mostly_yes",
    notes: "Now defensible as a planning hypothesis.",
  },
  {
    question: "Is spiral_accumulation plausible enough to mention?",
    previous_status: "partial",
    updated_status: "partial",
    strongest_support: "Recurring not-genuine/not-natural/avoidance logic in new domains",
    remaining_risk: "Still interpretive",
    ready_for_visual_planning: "uncertain",
    notes: "Mention cautiously if used.",
  },
  {
    question: "Can Chart 4A be planned visually now?",
    previous_status: "not_ready",
    updated_status: "mostly_ready",
    strongest_support: "Period anchors now cover pre_1800 through 2019_2026",
    remaining_risk: "Final claims still need manual quote verification and OED/direct Johnson if dating is shown",
    ready_for_visual_planning: "mostly_yes",
    notes: "Ready for visual planning as long as claims stay cautious.",
  },
];

const remainingGaps: CsvRow[] = [
  {
    gap: "OED/direct Johnson chronology",
    importance: "high",
    why_it_matters: "Blocks final dated claims about earliest negative senses.",
    can_proceed_without_it: "mostly_yes",
    recommended_followup: "Manual OED and direct Johnson scan check before public final copy.",
    notes: "Planning can proceed with caveat.",
  },
  {
    gap: "Pre-1800 artificial smile/expression breadth",
    importance: "medium",
    why_it_matters: "Would strengthen false-emotion/social-performance lane.",
    can_proceed_without_it: "yes",
    recommended_followup: "Google Books snippets, IA, HathiTrust, ECCO/EEBO if accessible.",
    notes: "Artificial tears/manners already carry the lane.",
  },
  {
    gap: "Direct artificial phrase examples in 1850-1900 ads",
    importance: "medium",
    why_it_matters: "Would make the industrial/consumer bridge more direct.",
    can_proceed_without_it: "mostly_yes",
    recommended_followup: "Search Chronicling America and magazine archives for artificial coloring/flavor/food.",
    notes: "Current gap is mostly filled by color-additive and food-adulteration context.",
  },
  {
    gap: "1980s/1990s no-artificial marketing",
    importance: "medium",
    why_it_matters: "Would smooth the 1950-2019 transition.",
    can_proceed_without_it: "mostly_yes",
    recommended_followup: "Magazine ads, Google Books snippets, product package archives.",
    notes: "2015 reformulation sources provide a strong late pre-2019 anchor.",
  },
  {
    gap: "Physical packaging images",
    importance: "low",
    why_it_matters: "Would verify product-page claims against package language.",
    can_proceed_without_it: "yes",
    recommended_followup: "Retailer images, product PDFs, package scans.",
    notes: "Not needed for current evidence planning.",
  },
  {
    gap: "Dedicated Chart 4B semantic-distance corpus",
    importance: "high",
    why_it_matters: "Chart 4B should not rely on Chart 4A evidence alone.",
    can_proceed_without_it: "yes",
    recommended_followup: "Separate semantic-distance/collocation pass.",
    notes: "Bridge leads are ready, not final.",
  },
];

const sourceAccessLog: CsvRow[] = [
  {
    source_name: "Existing Chart 4 / round 02 / round 03 packages",
    source_type: "corpus_result",
    access_status: "accessed",
    source_url: `${urls.chart4}; ${urls.round2}; ${urls.round3}`,
    terms_checked: "all requested existing files",
    result: "Read as baseline; not overwritten.",
    notes: "No full Ngram rerun.",
  },
  ...lexicalAuthorityExtracts.map((row) => ({
    source_name: row.source_name,
    source_type: row.source_name === "Etymonline" ? "etymology_source" : "historical_dictionary",
    access_status: row.access_status,
    source_url: row.source_url,
    terms_checked: row.entry_or_term,
    result: row.sense_label,
    notes: row.notes,
  })),
  ...snippets1850_1900.map((row) => ({
    source_name: row.source_name,
    source_type: row.source_type,
    access_status: row.source_name === "Scientific American lead" ? "search_only" : "accessed",
    source_url: row.source_url,
    terms_checked: row.term_or_phrase,
    result: row.short_summary,
    notes: row.notes,
  })),
  ...snippets1900_1950.map((row) => ({
    source_name: row.source_name,
    source_type: row.source_type,
    access_status: "accessed",
    source_url: row.source_url,
    terms_checked: row.term_or_phrase,
    result: row.short_summary,
    notes: row.notes,
  })),
  ...snippets1950_2019.map((row) => ({
    source_name: row.source_name,
    source_type: row.source_type,
    access_status: "accessed",
    source_url: row.source_url,
    terms_checked: row.term_or_phrase,
    result: row.short_summary,
    notes: row.notes,
  })),
  ...snippets2019_2026.map((row) => ({
    source_name: row.source_name,
    source_type: row.source_type,
    access_status: "accessed",
    source_url: row.source_url,
    terms_checked: row.term_or_phrase,
    result: row.short_summary,
    notes: row.notes,
  })),
  ...chart4bLeads.map((row) => ({
    source_name: row.source_name,
    source_type: row.source_type,
    access_status: "accessed",
    source_url: row.source_url,
    terms_checked: row.term_or_phrase,
    result: row.why_useful_for_chart4b,
    notes: row.notes,
  })),
];

async function main() {
  const generatedAt = new Date().toISOString();
  await Promise.all([RAW_DIR, PROCESSED_DIR, NOTES_DIR, SOURCES_DIR, SCRIPTS_DIR].map((dir) => mkdir(dir, { recursive: true })));

  const requiredInputs = [
    path.join(CHART4_DIR, "processed", "chart_04_term_metadata.csv"),
    path.join(CHART4_DIR, "processed", "chart_04_terms_requiring_non_ngram_sources.csv"),
    path.join(ROUND2_DIR, "processed", "round_02_evidence_table.csv"),
    path.join(ROUND2_DIR, "processed", "round_02_pre_1800_sense_status.csv"),
    path.join(ROUND2_DIR, "processed", "round_02_modern_2019_2026_term_status.csv"),
    path.join(ROUND2_DIR, "processed", "round_02_combined_timeline_coverage.csv"),
    path.join(ROUND3_DIR, "processed", "round_03_pejoration_evidence_table.csv"),
    path.join(ROUND3_DIR, "processed", "round_03_domain_timeline.csv"),
    path.join(ROUND3_DIR, "processed", "round_03_domain_wave_summary.csv"),
    path.join(ROUND3_DIR, "processed", "round_03_negative_charge_scores.csv"),
    path.join(ROUND3_DIR, "processed", "round_03_burst_candidates.csv"),
    path.join(ROUND3_DIR, "processed", "round_03_spiral_trajectory_candidates.csv"),
    path.join(ROUND3_DIR, "processed", "round_03_chart4a_readiness_matrix.csv"),
    path.join(ROUND3_DIR, "notes", "round_03_pejoration_findings.md"),
    path.join(ROUND3_DIR, "notes", "round_03_trajectory_interpretation.md"),
    path.join(ROUND3_DIR, "notes", "round_03_chart4b_connection_notes.md"),
    path.join(ROUND3_DIR, "notes", "round_03_remaining_risks.md"),
  ];
  const inputReads = await Promise.all(requiredInputs.map(async (filePath) => ({ filePath, ...(await readIfExists(filePath)) })));
  const missingInputs = inputReads.filter((input) => input.status === "missing").map((input) => input.filePath);

  await writeFile(
    path.join(RAW_DIR, "round_04_lexical_authority_extracts.csv"),
    `${csvRows(
      [
        "source_name",
        "entry_or_term",
        "access_status",
        "sense_label",
        "period_or_date_if_available",
        "supports_not_natural",
        "supports_fake_not_genuine",
        "supports_affected_insincere",
        "supports_contrived_or_feigned",
        "distinguishes_not_natural_from_fake",
        "source_url",
        "notes",
      ],
      lexicalAuthorityExtracts,
    )}\n`,
  );
  await writeFile(
    path.join(RAW_DIR, "round_04_1850_1900_snippets.csv"),
    `${csvRows(
      [
        "id",
        "term_or_phrase",
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
      snippets1850_1900,
    )}\n`,
  );
  await writeFile(
    path.join(RAW_DIR, "round_04_1900_1950_snippets.csv"),
    `${csvRows(
      [
        "id",
        "term_or_phrase",
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
      snippets1900_1950,
    )}\n`,
  );
  await writeFile(
    path.join(RAW_DIR, "round_04_1950_2019_transition_snippets.csv"),
    `${csvRows(
      [
        "id",
        "term_or_phrase",
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
      snippets1950_2019,
    )}\n`,
  );
  await writeFile(
    path.join(RAW_DIR, "round_04_2019_2026_modern_snippets.csv"),
    `${csvRows(
      [
        "id",
        "term_or_phrase",
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
      snippets2019_2026,
    )}\n`,
  );
  await writeFile(
    path.join(RAW_DIR, "round_04_chart4b_lead_snippets.csv"),
    `${csvRows(
      ["id", "lead_topic", "term_or_phrase", "source_name", "source_type", "source_url", "why_useful_for_chart4b", "confidence", "notes"],
      chart4bLeads,
    )}\n`,
  );
  await writeFile(
    path.join(RAW_DIR, "round_04_source_access_log.csv"),
    `${csvRows(["source_name", "source_type", "access_status", "source_url", "terms_checked", "result", "notes"], sourceAccessLog)}\n`,
  );

  await writeFile(
    path.join(PROCESSED_DIR, "round_04_evidence_hardening_table.csv"),
    `${csvRows(
      [
        "id",
        "term_or_phrase",
        "focus_area",
        "domain",
        "source_period",
        "year_or_period",
        "source_name",
        "source_type",
        "source_url",
        "evidence_kind",
        "sense_or_usage",
        "confidence",
        "negative_charge",
        "short_summary",
        "chart4a_value",
        "chart4b_value",
        "gap_filled",
        "needs_followup",
        "notes",
      ],
      hardeningRows,
    )}\n`,
  );
  await writeFile(
    path.join(PROCESSED_DIR, "round_04_lexical_authority_status.csv"),
    `${csvRows(
      [
        "source_name",
        "entry_or_term",
        "access_status",
        "supports_not_natural",
        "supports_fake_not_genuine",
        "supports_affected_insincere",
        "supports_contrived_feigned",
        "distinguishes_not_natural_from_fake",
        "confidence",
        "notes",
      ],
      lexicalStatus,
    )}\n`,
  );
  await writeFile(
    path.join(PROCESSED_DIR, "round_04_gap_fill_matrix.csv"),
    `${csvRows(
      ["gap_area", "previous_status", "current_status", "strongest_new_evidence", "remaining_problem", "confidence", "notes"],
      gapMatrix,
    )}\n`,
  );
  await writeFile(
    path.join(PROCESSED_DIR, "round_04_period_anchor_evidence.csv"),
    `${csvRows(
      [
        "period",
        "anchor_term_or_phrase",
        "anchor_source",
        "source_type",
        "why_anchor",
        "negative_charge",
        "domain",
        "chart4a_strength",
        "notes",
      ],
      periodAnchors,
    )}\n`,
  );
  await writeFile(
    path.join(PROCESSED_DIR, "round_04_trajectory_strengthening_summary.csv"),
    `${csvRows(
      ["trajectory_model", "status", "strongest_support", "new_support_from_round_04", "main_weakness", "confidence", "notes"],
      trajectorySummary,
    )}\n`,
  );
  await writeFile(
    path.join(PROCESSED_DIR, "round_04_chart4b_bridge_leads.csv"),
    `${csvRows(["lead_topic", "term_or_phrase", "source_name", "source_type", "why_useful_for_chart4b", "confidence", "notes"], chart4bBridgeLeads)}\n`,
  );
  await writeFile(
    path.join(PROCESSED_DIR, "round_04_chart4a_readiness_update.csv"),
    `${csvRows(
      ["question", "previous_status", "updated_status", "strongest_support", "remaining_risk", "ready_for_visual_planning", "notes"],
      readinessUpdate,
    )}\n`,
  );
  await writeFile(
    path.join(PROCESSED_DIR, "round_04_remaining_data_gaps.csv"),
    `${csvRows(["gap", "importance", "why_it_matters", "can_proceed_without_it", "recommended_followup", "notes"], remainingGaps)}\n`,
  );

  const filesCreated = [
    "raw/round_04_lexical_authority_extracts.csv",
    "raw/round_04_1850_1900_snippets.csv",
    "raw/round_04_1900_1950_snippets.csv",
    "raw/round_04_1950_2019_transition_snippets.csv",
    "raw/round_04_2019_2026_modern_snippets.csv",
    "raw/round_04_chart4b_lead_snippets.csv",
    "raw/round_04_source_access_log.csv",
    "processed/round_04_evidence_hardening_table.csv",
    "processed/round_04_lexical_authority_status.csv",
    "processed/round_04_gap_fill_matrix.csv",
    "processed/round_04_period_anchor_evidence.csv",
    "processed/round_04_trajectory_strengthening_summary.csv",
    "processed/round_04_chart4b_bridge_leads.csv",
    "processed/round_04_chart4a_readiness_update.csv",
    "processed/round_04_remaining_data_gaps.csv",
    "notes/round_04_collection_log.md",
    "notes/round_04_source_notes.md",
    "notes/round_04_lexical_findings.md",
    "notes/round_04_1850_1900_findings.md",
    "notes/round_04_consumer_transition_findings.md",
    "notes/round_04_modern_hardening_findings.md",
    "notes/round_04_chart4b_bridge_notes.md",
    "notes/round_04_final_assessment.md",
    "sources/round_04_source_urls.md",
    "scripts/README.md",
  ];

  const collectionLog = `# Round 04 Collection Log

Generated: ${generatedAt}

## Scope

Final Chart 4A evidence hardening pass for \`artificial\`. This is a targeted quality-improvement round, not a broad collection pass.

No chart design, visualization, React, final chart copy, page build, or final visual structure decision was produced.

## Existing Files Read

${inputReads
  .map((item) => `- ${item.status === "read" ? "read" : "missing"}: \`${path.relative(process.cwd(), item.filePath)}\``)
  .join("\n")}

## Missing Inputs

${mdList(missingInputs.map((filePath) => `\`${path.relative(process.cwd(), filePath)}\``))}

## Ngram Policy

- Did not rerun the full 140-term Ngram package.
- Existing Chart 4/round 02/round 03 files were read as baseline evidence.
- This round focused on source hardening and gap filling.

## Files Written

${mdList(filesCreated.map((file) => `\`${file}\``))}
`;
  await writeFile(path.join(NOTES_DIR, "round_04_collection_log.md"), collectionLog);

  const sourceNotes = `# Round 04 Source Notes

Generated: ${generatedAt}

## Lexical Sources

OED and direct Johnson remain inaccessible. Etymonline, Johnson indirect, Webster 1828, Webster 1913, and Merriam-Webster were used to harden lexical sense boundaries.

## 1850-1900 Sources

FDA color-additive history, an 1898 Scientific American lead, and an 1893 food-adulteration newspaper item were used as representative evidence for industrial/food trust context.

## 1900-2019 Sources

Chronicling America, FDA legal milestones, JAMA/New Yorker/FDA cyclamate materials, and 2015 Nestle/Kraft/General Mills reformulation announcements strengthen the transition chain.

## 2019-2026 Sources

FDA no-artificial-colors materials, Kraft Heinz 2025, Gatorade 2026, Swanson product pages, and clean-label sources strengthen modern absence/reformulation evidence.

## Limits

Snippets are not frequency data. Regulatory sources are not sentiment proof. Product and brand pages can change. No health-risk claims are made.
`;
  await writeFile(path.join(NOTES_DIR, "round_04_source_notes.md"), sourceNotes);

  const lexicalFindings = `# Round 04 Lexical Findings

Generated: ${generatedAt}

## Sources Accessed

- Etymonline: artificial, artificiality, artifice.
- Johnson indirect via Definitions.net.
- Webster 1828 and Webster 1913.
- Merriam-Webster modern entry.

## Early Senses Supported

- not-natural / made by art
- fictitious / not genuine
- affected / insincere
- contrived / feigned

## Not-Natural vs Fake

Johnson indirect, Webster 1828, Webster 1913, and Etymonline all help keep not-natural distinct from fake/not-genuine. This strengthens Chart 4A and prepares Chart 4B.

## Unresolved

OED and direct Johnson remain unresolved. Bailey/Ash/Sheridan/Walker remain scan/search leads, not stable extracted sources.
`;
  await writeFile(path.join(NOTES_DIR, "round_04_lexical_findings.md"), lexicalFindings);

  const findings1850 = `# Round 04 1850-1900 Findings

Generated: ${generatedAt}

## What Was Found

- FDA color-additive history gives an industrial/synthetic food-coloring backbone from synthetic dye history through late-19th-century food certification context.
- Scientific American 1898 provides a direct artificial-coloring-of-food-products lead.
- The 1893 food-adulteration item provides nearby purity, genuine, imitation, and trust context.

## Food / Purity / Imitation / Industrial Suspicion

The gap is now usable as an industrial and food-trust bridge. It still needs more direct artificial flavor/color newspaper snippets before final copy.

## Status

The 1850-1900 gap improved from weak to mostly filled for planning purposes.
`;
  await writeFile(path.join(NOTES_DIR, "round_04_1850_1900_findings.md"), findings1850);

  const consumerFindings = `# Round 04 Consumer Transition Findings

Generated: ${generatedAt}

## 1900-1950

The 1904 artificially-colored lead and FDA food-law milestones anchor early food trust, coloring, adulteration, and regulation context.

## 1950-2019

- 1950: no artificial flavoring appears as an advertising claim.
- 1969-1976: artificial sweetener/cyclamate materials anchor additive scrutiny.
- 2015: Nestle, Kraft, and General Mills public reformulation announcements show removal of artificial flavors/colors/preservatives/synthetic colors.

## Emerging No-Artificial Logic

The transition is now much more continuous: food coloring/adulteration, additive scrutiny, advertising absence claims, and reformulation-away language all appear before the modern clean-label peak.
`;
  await writeFile(path.join(NOTES_DIR, "round_04_consumer_transition_findings.md"), consumerFindings);

  const modernFindings = `# Round 04 Modern Hardening Findings

Generated: ${generatedAt}

## Strongest 2019-2026 Evidence

- FDA no artificial colors labeling materials.
- Kraft Heinz 2025 commitment to remove certified colors.
- Gatorade 2026 no artificial flavors, sweeteners, or colors.
- Swanson no artificial ingredients product page.

## Regulatory / Labeling

FDA materials make no-artificial-colors an active labeling/regulatory phrase, but they do not prove sentiment.

## Clean-Label / Authenticity

IFT and Freedonia/Packaged Facts strengthen the clean-label/authenticity context around simple, recognizable, non-artificial/non-synthetic ingredients.

## Remaining Limitations

Modern evidence is source-diverse but still biased toward brand, regulatory, and trade sources.
`;
  await writeFile(path.join(NOTES_DIR, "round_04_modern_hardening_findings.md"), modernFindings);

  const chart4bNotes = `# Round 04 Chart 4B Bridge Notes

Generated: ${generatedAt}

## Artificial vs Fake

Dictionary evidence supports adjacency in not-genuine senses but keeps artificial distinct from fake.

## Artificial vs Genuine / Authentic

Johnson indirect, Webster, WordReference, Oxford, and modern consumer-label sources are useful leads for genuine/authentic boundaries.

## Artificial vs Synthetic

Synthetic dye/color and clean-label sources connect artificial to synthetic/industrial production without making them identical.

## Artificial vs Imitation

Etymonline and modern learner/thesaurus sources preserve imitation/substitute as one branch of artificial.

## Artificial vs Natural

Historical not-natural senses and modern Consumer Reports/FDA/product sources provide a strong bridge.

## Still Needed

Chart 4B still needs a dedicated semantic-distance/collocation pass.
`;
  await writeFile(path.join(NOTES_DIR, "round_04_chart4b_bridge_notes.md"), chart4bNotes);

  const finalAssessment = `# Round 04 Final Assessment

Generated: ${generatedAt}

## Overall Evidence Strength

Chart 4A is now stronger and more historically continuous. The evidence chain covers pre-1800, 1800-1850, 1850-1900, 1900-1950, 1950-2000, 2000-2019, and 2019-2026 with at least one usable anchor per period.

## Historical Continuity

The 1850-1900 and 1950-2019 gaps improved materially. The chain now moves from early manners/false emotion, to industrial food coloring and adulteration, to mid-century absence claims and sweetener scrutiny, to 2015 reformulation, to 2025-2026 modern no-artificial claims.

## Best-Supported Trajectory Model

The best-supported model is early split then reactivation, paired with domain transfer. Spiral accumulation is plausible enough to mention cautiously, but remains interpretive.

## Visual Planning Readiness

Chart 4A is mostly ready for visual planning if claims remain cautious and if early chronology is not presented as final without OED/direct Johnson.

## Remaining Risks

OED/direct Johnson remain unresolved. Some evidence is representative rather than exhaustive. Product pages can change. Negative-charge scoring is interpretive.

## Next Step

Proceed to visual planning or Chart 4B semantic-distance collection. Before final public copy, manually verify OED/direct Johnson and page-image snippets for any quotation-level claims.
`;
  await writeFile(path.join(NOTES_DIR, "round_04_final_assessment.md"), finalAssessment);

  const sourceUrls = `# Round 04 Source URLs

Generated: ${generatedAt}

${Object.entries(urls)
  .map(([key, url]) => `- ${key}: ${url}`)
  .join("\n")}
`;
  await writeFile(path.join(SOURCES_DIR, "round_04_source_urls.md"), sourceUrls);

  const scriptsReadme = `# Round 04 Scripts

- Project-level builder: \`scripts/build_chart_04a_hardening_round_04.ts\`
- Reads existing Chart 4 / round 02 / round 03 evidence and writes round 04 hardening outputs.
- Does not rerun the full Chart 4 Ngram package.
`;
  await writeFile(path.join(SCRIPTS_DIR, "README.md"), scriptsReadme);

  console.log(
    JSON.stringify(
      {
        generatedAt,
        outputRoot: BASE_DIR,
        missingInputs: missingInputs.map((filePath) => path.relative(process.cwd(), filePath)),
        lexicalAuthorityExtracts: lexicalAuthorityExtracts.length,
        snippets1850_1900: snippets1850_1900.length,
        snippets1900_1950: snippets1900_1950.length,
        snippets1950_2019: snippets1950_2019.length,
        snippets2019_2026: snippets2019_2026.length,
        chart4bLeads: chart4bLeads.length,
        hardeningRows: hardeningRows.length,
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
