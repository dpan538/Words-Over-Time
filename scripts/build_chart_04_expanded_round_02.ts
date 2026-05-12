import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const CHART4_DIR = path.join(process.cwd(), "docs", "research", "artificial", "chart_04_suspicion_distance");
const BASE_DIR = path.join(CHART4_DIR, "expanded_corpus_round_02");
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

const sourceUrls = {
  existingChart4: "docs/research/artificial/chart_04_suspicion_distance/",
  etymonlineArtificial: "https://www.etymonline.com/word/artificial",
  etymonlineArtificiality: "https://www.etymonline.com/word/artificiality",
  etymonlineArtificially: "https://www.etymonline.com/word/artificially",
  etymonlineArtifice: "https://www.etymonline.com/word/artifice",
  etymonlineSimulation: "https://www.etymonline.com/word/simulation",
  johnsonIndirect: "https://www.definitions.net/definition/artificial",
  webster1828: "https://webstersdictionary1828.com/Dictionary/artificial",
  shakespeareHenryVI: "https://www.gutenberg.org/files/1502/1502-h/1502-h.htm",
  wollstonecraft: "https://www.gutenberg.org/ebooks/67466.html.images",
  chambers: "https://www.gutenberg.org/cache/epub/39803/pg39803-images.html",
  chroniclingKitchenBouquet: "https://chroniclingamerica.loc.gov/lccn/sn83045462/1950-05-03/ed-1/seq-42/",
  chroniclingArtificiallyColored: "https://chroniclingamerica.loc.gov/lccn/sn86090233/1904-05-12/ed-1/seq-6/",
  ecfr10122: "https://ecfr.io/Title-21/Section-101.22",
  fdaNoArtificialColorsLetter:
    "https://www.fda.gov/food/food-chemical-safety/letter-food-industry-no-artificial-colors-labeling-claims",
  fdaNoArtificialColorsRelease:
    "https://www.fda.gov/news-events/press-announcements/fda-takes-new-approach-no-artificial-colors-claims",
  fdaColorAdditives: "https://www.fda.gov/food/color-additives-information-consumers/color-additives-foods",
  fdaTypesIngredients: "https://www.fda.gov/food/food-additives-and-gras-ingredients-information-consumers/types-food-ingredients",
  fdaPledges:
    "https://www.fda.gov/food/color-additives-information-consumers/tracking-food-industry-pledges-remove-petroleum-based-food-dyes",
  pepsicoGatorade:
    "https://www.pepsico.com/en/newsroom/press-releases/2026/gatorade-lower-sugar-brings-a-new-era-of-hydration-with-no-artificial-flavors-sweeteners-or-colors",
  pepsicoHydration:
    "https://www.pepsico.com/en/newsroom/press-releases/2026/150-million-americans-feel-dehydrated-gatorade-aims-to-change-how-people-think-about-hydration",
  campbellBeefBroth: "https://www.campbells.com/swanson/broth/beef-broth/",
  campbellVegetableBroth: "https://www.campbells.com/swanson/products/broth/vegetable-broth/",
  campbellLessSodium: "https://www.campbells.com/swanson/products/broth/50-less-sodium-beef-broth/",
  consumerReportsNatural: "https://www.consumerreports.org/food-labels/seals-and-claims/natural",
  iftCleanLabel: "https://www.ift.org/food-technology-magazine/ingredients-clean-label",
  freedoniaCleanLabel:
    "https://www.freedoniagroup.com/press-releases/new-report-consumers-crave-transparency-clean-label-foods-on-the-rise",
  foodNavigatorCleanLabel:
    "https://www.foodnavigator-usa.com/Article/2024/09/12/clean-label-trends-boost-natural-flavors-but-price-remains-key-purchase-driver",
  wordReferenceArtificial: "https://www.wordreference.com/definition/artificial",
  britArtificial: "https://www.britannica.com/dictionary/artificial",
  cambridgeThesaurus: "https://dictionary.cambridge.org/us/thesaurus/articles/made-by-humans",
  oxfordArtificial: "https://www.oxfordlearnersdictionaries.com/definition/english/artificial",
  baileyGoogleBooks: "https://books.google.com/books/about/An_universal_etymological_English_dictio.html?id=UeUIAAAAQAAJ",
};

const dictionaryExtracts = [
  {
    id: "etymonline_artificial",
    source_name: "Etymonline",
    term: "artificial",
    source_url: sourceUrls.etymonlineArtificial,
    source_type: "etymology_source",
    period_checked: "pre_1800",
    access_status: "accessed",
    extract_summary:
      "Secondary etymology separates not-natural/spontaneous, made by human skill, imitation/substitute, fictitious/not genuine, and affected/insincere chronology.",
    sense_or_usage: "not_natural; fake_not_genuine; affected_insincere; semantic_distance",
    year_or_period: "late 14c.; early 15c.; 16c.; 1590s; 1640s",
    confidence: "medium",
    notes: "Use as chronology pointer. OED or primary quotations are still needed for final dating.",
  },
  {
    id: "etymonline_artificiality",
    source_name: "Etymonline",
    term: "artificiality",
    source_url: sourceUrls.etymonlineArtificiality,
    source_type: "etymology_source",
    period_checked: "pre_1800",
    access_status: "accessed",
    extract_summary: "Records artificiality as appearance of art and insincerity, with artificialness earlier.",
    sense_or_usage: "affected_insincere",
    year_or_period: "1763 for artificiality; 1590s for artificialness",
    confidence: "medium",
    notes: "Good pre-1800 abstract-noun support, but still secondary.",
  },
  {
    id: "etymonline_artifice",
    source_name: "Etymonline",
    term: "artifice",
    source_url: sourceUrls.etymonlineArtifice,
    source_type: "etymology_source",
    period_checked: "pre_1800",
    access_status: "accessed",
    extract_summary: "Frames artifice as workmanship/making by craft or skill, with crafty device/trick developing later.",
    sense_or_usage: "neutral_descriptive; fake_not_genuine",
    year_or_period: "1530s; 1650s",
    confidence: "medium",
    notes: "Useful art-family bridge, not a direct artificial usage.",
  },
  {
    id: "johnson_artificial_indirect",
    source_name: "Johnson via Definitions.net",
    term: "artificial",
    source_url: sourceUrls.johnsonIndirect,
    source_type: "historical_dictionary",
    period_checked: "pre_1800",
    access_status: "indirect_only",
    extract_summary:
      "Indirect Johnson-attributed entry separates made-by-art/not-natural, fictitious/not-genuine, and artful/contrived-with-skill senses.",
    sense_or_usage: "not_natural; fake_not_genuine; neutral_descriptive",
    year_or_period: "1755/1773 indirect transcription",
    confidence: "medium_low",
    notes: "Direct Johnson entry still needs manual verification before final claims.",
  },
  {
    id: "webster_1828_checkpoint",
    source_name: "Webster 1828",
    term: "artificial",
    source_url: sourceUrls.webster1828,
    source_type: "historical_dictionary",
    period_checked: "1800_2019",
    access_status: "accessed",
    extract_summary:
      "Checkpoint dictionary separates made/contrived by art in opposition to natural from feigned/fictitious/not genuine.",
    sense_or_usage: "not_natural; fake_not_genuine",
    year_or_period: "1828 checkpoint",
    confidence: "high_as_checkpoint",
    notes: "Useful as checkpoint only, not origin.",
  },
  {
    id: "merriam_webster_artificial",
    source_name: "Merriam-Webster",
    term: "artificial",
    source_url: "https://www.merriam-webster.com/dictionary/artificial",
    source_type: "modern_dictionary",
    period_checked: "post_2019",
    access_status: "accessed",
    extract_summary: "Modern entry keeps made-by-humans and not-genuine/sincere senses, including artificial smile.",
    sense_or_usage: "not_natural; affected_insincere; fake_not_genuine",
    year_or_period: "current dictionary; first known use listed as 15th century",
    confidence: "medium",
    notes: "Good modern sense split. Not historical attestation proof.",
  },
  {
    id: "britannica_artificial",
    source_name: "Britannica Dictionary",
    term: "artificial",
    source_url: sourceUrls.britArtificial,
    source_type: "modern_dictionary",
    period_checked: "post_2019",
    access_status: "accessed",
    extract_summary:
      "Modern learner entry includes not natural/real, created by people, and not sincere senses; examples include no artificial colors/flavors/sweeteners and artificial smile.",
    sense_or_usage: "not_natural; affected_insincere; absence_claim",
    year_or_period: "current dictionary",
    confidence: "medium",
    notes: "Useful for modern live-sense inventory.",
  },
  {
    id: "cambridge_made_by_humans_thesaurus",
    source_name: "Cambridge Thesaurus",
    term: "artificial; synthetic; fake; false; imitation; man-made",
    source_url: sourceUrls.cambridgeThesaurus,
    source_type: "modern_dictionary",
    period_checked: "post_2019",
    access_status: "accessed",
    extract_summary:
      "Thesaurus distinguishes artificial as human-made/copying nature from natural/real and from fake/false/imitation/bogus.",
    sense_or_usage: "semantic_distance",
    year_or_period: "current dictionary/thesaurus",
    confidence: "medium",
    notes: "Useful for semantic distance review, not frequency.",
  },
  {
    id: "bailey_google_books_search",
    source_name: "Bailey Universal Etymological English Dictionary",
    term: "artificial",
    source_url: sourceUrls.baileyGoogleBooks,
    source_type: "historical_dictionary",
    period_checked: "pre_1800",
    access_status: "search_only",
    extract_summary: "Google Books records for Bailey editions were found, but no stable artificial entry extract was captured.",
    sense_or_usage: "unclear_or_mixed",
    year_or_period: "1724 and later editions",
    confidence: "low",
    notes: "Needs manual page inspection or scan download.",
  },
  {
    id: "oed_access_gap",
    source_name: "OED",
    term: "artificial",
    source_url: "https://www.oed.com/",
    source_type: "historical_dictionary",
    period_checked: "pre_1800",
    access_status: "not_accessible",
    extract_summary: "Not accessed in this pass.",
    sense_or_usage: "unclear_or_mixed",
    year_or_period: "not checked",
    confidence: "low",
    notes: "Needed for final earliest-sense chronology.",
  },
];

const pre1800Snippets: CsvRow[] = [
  {
    id: "pre1800_shakespeare_artificial_tears",
    term_or_phrase: "artificial tears",
    year_or_period: "1590s play; public-domain edition accessed",
    source_name: "Henry VI, Part 3",
    source_type: "book_snippet",
    source_url: sourceUrls.shakespeareHenryVI,
    evidence_kind: "snippet",
    sense_or_usage: "fake_not_genuine",
    short_summary:
      "Richard describes the ability to display tears in a self-consciously deceptive performance; useful feigned-emotion evidence.",
    confidence: "high",
    notes: "Already captured in Chart 1 round 06; carried forward because it is directly Chart 4 relevant.",
  },
  {
    id: "pre1800_wollstonecraft_artificial_manners",
    term_or_phrase: "artificial manners",
    year_or_period: "1787",
    source_name: "Thoughts on the Education of Daughters",
    source_type: "book_snippet",
    source_url: sourceUrls.wollstonecraft,
    evidence_kind: "snippet",
    sense_or_usage: "affected_insincere",
    short_summary:
      "Chapter headed Artificial Manners contrasts affectation and copied feeling with sincerity, artlessness, and genuine emotion.",
    confidence: "high",
    notes: "Strong pre-1800 conduct-literature evidence for social/artificial manners, not a frequency signal.",
  },
  {
    id: "pre1800_chambers_artificial_manner",
    term_or_phrase: "artificial manner",
    year_or_period: "1773",
    source_name: "An Explanatory Discourse by Tan Chet-qua",
    source_type: "book_snippet",
    source_url: sourceUrls.chambers,
    evidence_kind: "snippet",
    sense_or_usage: "unclear_or_mixed",
    short_summary:
      "Uses artificial manner/stile for highly artful gardening; nearby language opposes nature and names affectation in aesthetic practice.",
    confidence: "medium",
    notes: "Useful for nature/art boundary and affectation vocabulary, but not directly social insincerity.",
  },
];

const newspaperSnippets: CsvRow[] = [
  {
    id: "news_1904_artificially_colored_jam",
    term_or_phrase: "artificially colored",
    year_or_period: "1904-05-12",
    source_name: "The Port Gibson Reveille via Chronicling America",
    source_type: "newspaper_snippet",
    source_url: sourceUrls.chroniclingArtificiallyColored,
    evidence_kind: "context_signal",
    sense_or_usage: "consumer_suspicion",
    short_summary:
      "Newspaper food item contrasts a tomato-based product not artificially colored with pumpkin-based imitations colored by coal-tar dyes.",
    confidence: "medium",
    notes: "OCR/source context should be manually checked before public use.",
  },
  {
    id: "ad_1950_kitchen_bouquet_no_artificial_flavoring",
    term_or_phrase: "no artificial flavoring",
    year_or_period: "1950-05-03",
    source_name: "Evening Star via Chronicling America",
    source_type: "advertising_snippet",
    source_url: sourceUrls.chroniclingKitchenBouquet,
    evidence_kind: "advertising_claim",
    sense_or_usage: "absence_claim",
    short_summary:
      "Kitchen Bouquet advertisement frames its gravy browning as no artificial flavoring while emphasizing vegetables, herbs, spices, and true meat taste.",
    confidence: "medium",
    notes: "Good historical ad lead; verify page image before final quotation.",
  },
];

const modernSnippets: CsvRow[] = [
  {
    id: "modern_2026_gatorade_no_artificial",
    term_or_phrase: "no artificial flavors, sweeteners or colors",
    year_or_period: "2026-03-04",
    source_name: "PepsiCo / Gatorade press release",
    source_type: "web_snippet",
    source_url: sourceUrls.pepsicoGatorade,
    evidence_kind: "packaging_claim",
    sense_or_usage: "absence_claim",
    short_summary:
      "Gatorade Lower Sugar launch copy foregrounds absence of artificial flavors, sweeteners, and colors as a product attribute.",
    confidence: "high",
    notes: "Brand/marketing source, not balanced corpus evidence.",
  },
  {
    id: "modern_2026_gatorade_remove_artificial_colors",
    term_or_phrase: "remove artificial colors",
    year_or_period: "2026",
    source_name: "PepsiCo hydration press release",
    source_type: "web_snippet",
    source_url: sourceUrls.pepsicoHydration,
    evidence_kind: "context_signal",
    sense_or_usage: "consumer_suspicion",
    short_summary:
      "Gatorade copy describes an active transition away from artificial colors while preserving familiar product colors.",
    confidence: "medium",
    notes: "Useful for modern formulation/consumer expectation language.",
  },
  {
    id: "modern_swanson_no_artificial_ingredients",
    term_or_phrase: "no artificial ingredients",
    year_or_period: "current page accessed 2026-05-12",
    source_name: "Swanson 50% Less Sodium Beef Broth",
    source_type: "web_snippet",
    source_url: sourceUrls.campbellLessSodium,
    evidence_kind: "packaging_claim",
    sense_or_usage: "absence_claim",
    short_summary:
      "Product page presents no artificial ingredients alongside no MSG added, no preservatives, and gluten-free positioning.",
    confidence: "high",
    notes: "Current product-page evidence; page content may change.",
  },
  {
    id: "modern_swanson_no_artificial_flavors_colors",
    term_or_phrase: "no artificial flavors or colors",
    year_or_period: "current page accessed 2026-05-12",
    source_name: "Swanson Beef Broth",
    source_type: "web_snippet",
    source_url: sourceUrls.campbellBeefBroth,
    evidence_kind: "packaging_claim",
    sense_or_usage: "absence_claim",
    short_summary:
      "Product page says the broth uses natural/non-GMO ingredients and has no artificial flavors or colors and no preservatives.",
    confidence: "high",
    notes: "Current product-page evidence; page content may change.",
  },
  {
    id: "modern_swanson_vegetable_no_artificial",
    term_or_phrase: "no artificial colors; no artificial flavors",
    year_or_period: "current page accessed 2026-05-12",
    source_name: "Swanson Vegetable Broth",
    source_type: "web_snippet",
    source_url: sourceUrls.campbellVegetableBroth,
    evidence_kind: "packaging_claim",
    sense_or_usage: "absence_claim",
    short_summary:
      "Product page lists no artificial colors, no artificial flavors, and no preservatives as product attributes.",
    confidence: "high",
    notes: "Current product-page evidence; page content may change.",
  },
  {
    id: "modern_consumer_reports_natural",
    term_or_phrase: "natural; artificial ingredients",
    year_or_period: "current page accessed 2026-05-12",
    source_name: "Consumer Reports Natural label guide",
    source_type: "secondary_literature",
    source_url: sourceUrls.consumerReportsNatural,
    evidence_kind: "context_signal",
    sense_or_usage: "semantic_distance",
    short_summary:
      "Consumer-label guide says consumers often expect natural to mean no artificial ingredients, while noting limited formal meaning for many foods.",
    confidence: "medium",
    notes: "Useful for consumer expectation, not direct product frequency.",
  },
  {
    id: "modern_ift_clean_label",
    term_or_phrase: "clean label; not artificial or synthetic",
    year_or_period: "2021",
    source_name: "Institute of Food Technologists Food Technology Magazine",
    source_type: "secondary_literature",
    source_url: sourceUrls.iftCleanLabel,
    evidence_kind: "context_signal",
    sense_or_usage: "consumer_suspicion",
    short_summary:
      "Clean-label article reports consumer definitions that include not artificial or synthetic and free of additives/preservatives.",
    confidence: "medium",
    notes: "Useful clean-label context; survey details need source trace if used prominently.",
  },
  {
    id: "modern_freedonia_clean_label",
    term_or_phrase: "clean label; absence of artificial flavors and preservatives",
    year_or_period: "2024-07-18",
    source_name: "Freedonia / Packaged Facts press release",
    source_type: "secondary_literature",
    source_url: sourceUrls.freedoniaCleanLabel,
    evidence_kind: "context_signal",
    sense_or_usage: "consumer_suspicion",
    short_summary:
      "Clean-label market report frames recognizable ingredients and absence of artificial flavors/preservatives as part of consumer-facing clean-label language.",
    confidence: "medium",
    notes: "Press-release/report source, not a balanced corpus.",
  },
  {
    id: "modern_foodnavigator_clean_label",
    term_or_phrase: "natural flavors over artificial counterparts",
    year_or_period: "2024-09-12",
    source_name: "FoodNavigator-USA",
    source_type: "news_snippet",
    source_url: sourceUrls.foodNavigatorCleanLabel,
    evidence_kind: "context_signal",
    sense_or_usage: "semantic_distance",
    short_summary:
      "Trade-news article frames clean-label demand as favoring natural flavors over artificial counterparts.",
    confidence: "medium",
    notes: "Trade publication. Use as market-language lead only.",
  },
];

const regulatorySources = [
  {
    id: "reg_ecfr_101_22",
    source_name: "21 CFR 101.22",
    source_type: "regulatory_source",
    source_url: sourceUrls.ecfr10122,
    year_or_period: "current CFR",
    terms: ["artificial flavor", "artificial color", "natural flavor", "chemical preservative", "artificially flavored"],
    summary:
      "Defines artificial flavor/flavoring, natural flavor/flavoring, artificial color/coloring, and labeling conditions for flavors, colors, and preservatives.",
    chart4_role: "Background definition for labeling categories, not suspicion proof.",
    limitations: "Regulation explains labeling categories; it does not measure sentiment or consumer interpretation.",
  },
  {
    id: "reg_fda_2026_no_artificial_colors_letter",
    source_name: "FDA letter to food industry on no artificial colors labeling claims",
    source_type: "regulatory_source",
    source_url: sourceUrls.fdaNoArtificialColorsLetter,
    year_or_period: "2026-02-05",
    terms: ["no artificial colors", "no artificial color", "made without artificial food colors"],
    summary:
      "FDA states enforcement discretion for certain voluntary absence claims when foods contain no FD&C Act certified colors.",
    chart4_role: "Recent official evidence that no artificial colors is an active labeling phrase.",
    limitations: "Regulatory policy source; not consumer sentiment proof.",
  },
  {
    id: "reg_fda_color_additives_foods",
    source_name: "FDA Color Additives in Foods",
    source_type: "regulatory_source",
    source_url: sourceUrls.fdaColorAdditives,
    year_or_period: "current page accessed 2026-05-12",
    terms: ["artificial colors", "synthetic", "color additives", "artificial coloring"],
    summary:
      "Consumer-facing FDA page explains certified and exempt color additives and gives historical background on artificial coloring.",
    chart4_role: "Background for artificial color as a labeling/regulatory category.",
    limitations: "Contains health/safety/regulatory framing; do not turn into Chart 4 health claims.",
  },
  {
    id: "reg_fda_types_food_ingredients",
    source_name: "FDA Types of Food Ingredients",
    source_type: "regulatory_source",
    source_url: sourceUrls.fdaTypesIngredients,
    year_or_period: "current page accessed 2026-05-12",
    terms: ["artificial flavor", "artificial colors", "flavors", "preservatives", "ingredients"],
    summary:
      "FDA consumer page lists examples of ingredient categories and notes label declarations such as natural flavoring, artificial flavor, and artificial colors.",
    chart4_role: "Background for packaging and ingredient-label terminology.",
    limitations: "Not evidence of pejoration.",
  },
  {
    id: "reg_fda_pledges_remove_dyes",
    source_name: "FDA tracking food industry pledges to remove petroleum based food dyes",
    source_type: "regulatory_source",
    source_url: sourceUrls.fdaPledges,
    year_or_period: "2025-2026",
    terms: ["remove artificial dyes", "artificial colors", "synthetic dyes", "no artificial flavors or dyes"],
    summary:
      "FDA tracks industry pledges to remove petroleum-based certified colors and includes brand-level reformulation language.",
    chart4_role: "Recent source showing artificial/color absence and removal language in regulatory-industry interface.",
    limitations: "Policy and pledge tracking source; not a balanced usage corpus.",
  },
];

const sourceAccessLog: CsvRow[] = [
  {
    source_name: "Existing Chart 4 Ngram package",
    source_type: "corpus_result",
    access_status: "accessed",
    source_url: sourceUrls.existingChart4,
    terms_checked: "all first-round Chart 4 groups",
    result: "Used as 1800-2019 baseline; not rerun.",
    notes: "Read data availability and non-Ngram source queue.",
  },
  ...dictionaryExtracts.map((item) => ({
    source_name: item.source_name,
    source_type: item.source_type,
    access_status: item.access_status,
    source_url: item.source_url,
    terms_checked: item.term,
    result: item.extract_summary,
    notes: item.notes,
  })),
  {
    source_name: "Project Gutenberg - Henry VI, Part 3",
    source_type: "book_snippet",
    access_status: "accessed",
    source_url: sourceUrls.shakespeareHenryVI,
    terms_checked: "artificial tears",
    result: "Pre-1800 feigned-emotion lead carried forward from Chart 1 gap check.",
    notes: "Use snippet cautiously and verify edition if quoted.",
  },
  {
    source_name: "Project Gutenberg - Wollstonecraft",
    source_type: "book_snippet",
    access_status: "accessed",
    source_url: sourceUrls.wollstonecraft,
    terms_checked: "artificial manners",
    result: "Found strong 1787 conduct-literature context for artificial manners and affectation.",
    notes: "Public-domain source.",
  },
  {
    source_name: "Project Gutenberg - Chambers",
    source_type: "book_snippet",
    access_status: "accessed",
    source_url: sourceUrls.chambers,
    terms_checked: "artificial manner; artificial style/stile; affectation",
    result: "Found 1773 aesthetic/gardening uses tied to art/nature and affectation.",
    notes: "Ambiguous for Chart 4 pejoration; keep as context only.",
  },
  {
    source_name: "Chronicling America",
    source_type: "newspaper_snippet; advertising_snippet",
    access_status: "accessed",
    source_url: sourceUrls.chroniclingKitchenBouquet,
    terms_checked: "no artificial flavoring; artificially colored",
    result: "Found two historical newspaper/ad leads.",
    notes: "OCR/page image should be checked before quotation.",
  },
  ...regulatorySources.map((item) => ({
    source_name: item.source_name,
    source_type: item.source_type,
    access_status: "accessed",
    source_url: item.source_url,
    terms_checked: item.terms.join("; "),
    result: item.summary,
    notes: item.limitations,
  })),
  {
    source_name: "PepsiCo / Gatorade",
    source_type: "web_snippet",
    access_status: "accessed",
    source_url: sourceUrls.pepsicoGatorade,
    terms_checked: "no artificial flavors; no artificial sweeteners; no artificial colors",
    result: "Found 2026 launch/marketing absence claim.",
    notes: "Brand source.",
  },
  {
    source_name: "Campbell's / Swanson product pages",
    source_type: "web_snippet",
    access_status: "accessed",
    source_url: sourceUrls.campbellLessSodium,
    terms_checked: "no artificial ingredients; no artificial flavors; no artificial colors; no preservatives",
    result: "Found current product-page absence claims.",
    notes: "Product pages may change.",
  },
  {
    source_name: "Consumer Reports Natural label guide",
    source_type: "secondary_literature",
    access_status: "accessed",
    source_url: sourceUrls.consumerReportsNatural,
    terms_checked: "natural; artificial ingredients",
    result: "Found consumer-expectation context around natural and no artificial ingredients.",
    notes: "Use as consumer-label context, not corpus frequency.",
  },
  {
    source_name: "IFT Food Technology clean-label article",
    source_type: "secondary_literature",
    access_status: "accessed",
    source_url: sourceUrls.iftCleanLabel,
    terms_checked: "clean label; not artificial or synthetic; preservatives; additives",
    result: "Found clean-label context.",
    notes: "Secondary/trade source.",
  },
  {
    source_name: "OED",
    source_type: "historical_dictionary",
    access_status: "not_accessible",
    source_url: "https://www.oed.com/",
    terms_checked: "artificial; artificiality; artifice",
    result: "Not accessed in this pass.",
    notes: "Still a major manual review item.",
  },
  {
    source_name: "Ash, Sheridan, Walker dictionaries",
    source_type: "historical_dictionary",
    access_status: "search_only",
    source_url: "",
    terms_checked: "artificial",
    result: "No stable entry extracts captured in this pass.",
    notes: "Need manual scan/page work if they become important.",
  },
];

const evidenceRows: CsvRow[] = [
  {
    id: "e001",
    term_or_phrase: "artificial",
    source_period: "pre_1800",
    year_or_period: "late 14c.-1640s chronology",
    source_name: "Etymonline",
    source_type: "etymology_source",
    source_url: sourceUrls.etymonlineArtificial,
    evidence_kind: "definition",
    sense_or_usage: "not_natural",
    confidence: "medium",
    short_summary: "Secondary chronology reports early not-natural/spontaneous and made-by-skill senses.",
    chart4_relevance: "high",
    needs_followup: true,
    notes: "OED or primary quotations needed before final dating.",
  },
  {
    id: "e002",
    term_or_phrase: "artificial",
    source_period: "pre_1800",
    year_or_period: "1590s/1640s chronology",
    source_name: "Etymonline",
    source_type: "etymology_source",
    source_url: sourceUrls.etymonlineArtificial,
    evidence_kind: "definition",
    sense_or_usage: "affected_insincere",
    confidence: "medium",
    short_summary: "Secondary source dates affected/insincere and fictitious/not-genuine branches before 1800.",
    chart4_relevance: "high",
    needs_followup: true,
    notes: "Use as chronology pointer, not final proof.",
  },
  {
    id: "e003",
    term_or_phrase: "artificiality",
    source_period: "pre_1800",
    year_or_period: "1763",
    source_name: "Etymonline",
    source_type: "etymology_source",
    source_url: sourceUrls.etymonlineArtificiality,
    evidence_kind: "definition",
    sense_or_usage: "affected_insincere",
    confidence: "medium",
    short_summary: "Artificiality is recorded with appearance-of-art and insincerity sense.",
    chart4_relevance: "medium",
    needs_followup: true,
    notes: "Good abstract-noun lead.",
  },
  {
    id: "e004",
    term_or_phrase: "artificial tears",
    source_period: "pre_1800",
    year_or_period: "1590s play",
    source_name: "Henry VI, Part 3",
    source_type: "book_snippet",
    source_url: sourceUrls.shakespeareHenryVI,
    evidence_kind: "snippet",
    sense_or_usage: "fake_not_genuine",
    confidence: "high",
    short_summary: "Feigned-emotion use where tears are part of a deceptive performance.",
    chart4_relevance: "high",
    needs_followup: true,
    notes: "Verify source edition and quotation if used publicly.",
  },
  {
    id: "e005",
    term_or_phrase: "artificial manners",
    source_period: "pre_1800",
    year_or_period: "1787",
    source_name: "Thoughts on the Education of Daughters",
    source_type: "book_snippet",
    source_url: sourceUrls.wollstonecraft,
    evidence_kind: "snippet",
    sense_or_usage: "affected_insincere",
    confidence: "high",
    short_summary: "Wollstonecraft explicitly frames artificial manners as affectation rather than genuine feeling.",
    chart4_relevance: "high",
    needs_followup: false,
    notes: "Strong pre-1800 social/affective evidence.",
  },
  {
    id: "e006",
    term_or_phrase: "artificial manner",
    source_period: "pre_1800",
    year_or_period: "1773",
    source_name: "An Explanatory Discourse by Tan Chet-qua",
    source_type: "book_snippet",
    source_url: sourceUrls.chambers,
    evidence_kind: "snippet",
    sense_or_usage: "unclear_or_mixed",
    confidence: "medium",
    short_summary: "Aesthetic/gardening use ties artificial manner to art/nature contrast and nearby affectation vocabulary.",
    chart4_relevance: "medium",
    needs_followup: true,
    notes: "Not direct social insincerity.",
  },
  {
    id: "e007",
    term_or_phrase: "artificial",
    source_period: "pre_1800",
    year_or_period: "1755/1773 indirect transcription",
    source_name: "Johnson via Definitions.net",
    source_type: "historical_dictionary",
    source_url: sourceUrls.johnsonIndirect,
    evidence_kind: "definition",
    sense_or_usage: "fake_not_genuine",
    confidence: "medium",
    short_summary: "Indirect Johnson-attributed entry separates not-natural from fictitious/not-genuine.",
    chart4_relevance: "high",
    needs_followup: true,
    notes: "Direct Johnson scan/manual entry check remains required.",
  },
  {
    id: "e008",
    term_or_phrase: "artificial",
    source_period: "1800_2019",
    year_or_period: "1828 checkpoint",
    source_name: "Webster 1828",
    source_type: "historical_dictionary",
    source_url: sourceUrls.webster1828,
    evidence_kind: "definition",
    sense_or_usage: "fake_not_genuine",
    confidence: "high",
    short_summary: "Checkpoint dictionary keeps made-by-art/not-natural separate from feigned/fictitious/not-genuine.",
    chart4_relevance: "medium",
    needs_followup: false,
    notes: "Not origin evidence.",
  },
  {
    id: "e009",
    term_or_phrase: "Chart 4 Ngram baseline",
    source_period: "1800_2019",
    year_or_period: "1800-2019",
    source_name: "Existing Chart 4 Ngram package",
    source_type: "corpus_result",
    source_url: sourceUrls.existingChart4,
    evidence_kind: "context_signal",
    sense_or_usage: "semantic_distance",
    confidence: "medium",
    short_summary: "Existing Ngram pass collected 140 term/group records; 137 collected, 3 missing, no sparse/error.",
    chart4_relevance: "background",
    needs_followup: false,
    notes: "Used as baseline only. Not rerun.",
  },
  {
    id: "e010",
    term_or_phrase: "artificially colored",
    source_period: "1800_2019",
    year_or_period: "1904-05-12",
    source_name: "The Port Gibson Reveille via Chronicling America",
    source_type: "newspaper_snippet",
    source_url: sourceUrls.chroniclingArtificiallyColored,
    evidence_kind: "context_signal",
    sense_or_usage: "consumer_suspicion",
    confidence: "medium",
    short_summary: "Food item discusses alleged jam, coal-tar dyes, and a product not artificially colored.",
    chart4_relevance: "medium",
    needs_followup: true,
    notes: "OCR/page review needed.",
  },
  {
    id: "e011",
    term_or_phrase: "no artificial flavoring",
    source_period: "1800_2019",
    year_or_period: "1950-05-03",
    source_name: "Evening Star via Chronicling America",
    source_type: "advertising_snippet",
    source_url: sourceUrls.chroniclingKitchenBouquet,
    evidence_kind: "advertising_claim",
    sense_or_usage: "absence_claim",
    confidence: "medium",
    short_summary: "Ad uses no artificial flavoring as a positive product distinction.",
    chart4_relevance: "high",
    needs_followup: true,
    notes: "Verify image before final quotation.",
  },
  {
    id: "e012",
    term_or_phrase: "artificial flavor; artificial color",
    source_period: "post_2019",
    year_or_period: "current CFR",
    source_name: "21 CFR 101.22",
    source_type: "regulatory_source",
    source_url: sourceUrls.ecfr10122,
    evidence_kind: "regulatory_definition",
    sense_or_usage: "regulatory_labeling",
    confidence: "high",
    short_summary: "Federal labeling regulation defines artificial flavor/flavoring and artificial color/coloring.",
    chart4_relevance: "background",
    needs_followup: false,
    notes: "Background only; not suspicion proof.",
  },
  {
    id: "e013",
    term_or_phrase: "no artificial colors",
    source_period: "post_2019",
    year_or_period: "2026-02-05",
    source_name: "FDA no artificial colors labeling letter",
    source_type: "regulatory_source",
    source_url: sourceUrls.fdaNoArtificialColorsLetter,
    evidence_kind: "regulatory_definition",
    sense_or_usage: "regulatory_labeling",
    confidence: "high",
    short_summary: "FDA addresses voluntary no artificial colors claims for foods without FD&C Act certified colors.",
    chart4_relevance: "high",
    needs_followup: false,
    notes: "Recent official evidence of active absence-claim category.",
  },
  {
    id: "e014",
    term_or_phrase: "no artificial flavors, sweeteners or colors",
    source_period: "post_2019",
    year_or_period: "2026-03-04",
    source_name: "PepsiCo / Gatorade",
    source_type: "web_snippet",
    source_url: sourceUrls.pepsicoGatorade,
    evidence_kind: "packaging_claim",
    sense_or_usage: "absence_claim",
    confidence: "high",
    short_summary: "Product launch copy foregrounds absence of artificial flavors, sweeteners, and colors.",
    chart4_relevance: "high",
    needs_followup: false,
    notes: "Brand source.",
  },
  {
    id: "e015",
    term_or_phrase: "no artificial ingredients",
    source_period: "post_2019",
    year_or_period: "current product page",
    source_name: "Swanson 50% Less Sodium Beef Broth",
    source_type: "web_snippet",
    source_url: sourceUrls.campbellLessSodium,
    evidence_kind: "packaging_claim",
    sense_or_usage: "absence_claim",
    confidence: "high",
    short_summary: "Product page uses no artificial ingredients in a cluster of clean-label style claims.",
    chart4_relevance: "high",
    needs_followup: false,
    notes: "Current product-page evidence.",
  },
  {
    id: "e016",
    term_or_phrase: "natural; artificial ingredients",
    source_period: "post_2019",
    year_or_period: "current page",
    source_name: "Consumer Reports Natural label guide",
    source_type: "secondary_literature",
    source_url: sourceUrls.consumerReportsNatural,
    evidence_kind: "context_signal",
    sense_or_usage: "semantic_distance",
    confidence: "medium",
    short_summary: "Consumer-label guide links consumer expectations of natural to no artificial ingredients.",
    chart4_relevance: "medium",
    needs_followup: true,
    notes: "Consumer expectation context only.",
  },
  {
    id: "e017",
    term_or_phrase: "clean label",
    source_period: "post_2019",
    year_or_period: "2021-2024",
    source_name: "IFT and Freedonia/Packaged Facts",
    source_type: "secondary_literature",
    source_url: `${sourceUrls.iftCleanLabel}; ${sourceUrls.freedoniaCleanLabel}`,
    evidence_kind: "context_signal",
    sense_or_usage: "consumer_suspicion",
    confidence: "medium",
    short_summary: "Clean-label sources connect simple/recognizable ingredients with avoiding artificial/synthetic additives.",
    chart4_relevance: "medium",
    needs_followup: true,
    notes: "Secondary source width; not balanced corpus evidence.",
  },
  {
    id: "e018",
    term_or_phrase: "artificial; fake; synthetic; imitation; real",
    source_period: "post_2019",
    year_or_period: "current dictionary/thesaurus",
    source_name: "Cambridge / WordReference / Oxford learner sources",
    source_type: "modern_dictionary",
    source_url: `${sourceUrls.cambridgeThesaurus}; ${sourceUrls.wordReferenceArtificial}; ${sourceUrls.oxfordArtificial}`,
    evidence_kind: "definition",
    sense_or_usage: "semantic_distance",
    confidence: "medium",
    short_summary: "Modern dictionary/thesaurus sources distinguish artificial from natural/real and from fake/false/imitation/synthetic.",
    chart4_relevance: "medium",
    needs_followup: false,
    notes: "Use for semantic boundaries, not claims of change.",
  },
];

const pre1800SenseStatus: CsvRow[] = [
  {
    sense: "neutral_descriptive",
    pre_1800_status: "confirmed",
    strongest_source: "Etymonline artificial/artificially; Johnson indirect",
    source_count: 3,
    confidence: "medium",
    notes: "Early art/human-skill and made-by-art senses are visible in etymological and indirect dictionary evidence.",
  },
  {
    sense: "not_natural",
    pre_1800_status: "confirmed",
    strongest_source: "Etymonline artificial; Johnson indirect",
    source_count: 2,
    confidence: "medium",
    notes: "Confirmed as a pre-1800 sense family, but exact earliest quotations need OED/manual verification.",
  },
  {
    sense: "fake_not_genuine",
    pre_1800_status: "confirmed",
    strongest_source: "Shakespeare artificial tears; Etymonline; Johnson indirect",
    source_count: 3,
    confidence: "medium_high",
    notes: "Good evidence for a pre-1800 fake/feigned branch; keep separate from not-natural.",
  },
  {
    sense: "affected_insincere",
    pre_1800_status: "partially_confirmed",
    strongest_source: "Wollstonecraft artificial manners; Etymonline artificiality/artificial",
    source_count: 3,
    confidence: "medium",
    notes: "Strong conduct-literature lead plus etymology, but more snippets are needed for breadth.",
  },
  {
    sense: "imitation_substitute",
    pre_1800_status: "partially_confirmed",
    strongest_source: "Etymonline artificial",
    source_count: 1,
    confidence: "medium_low",
    notes: "Chronology pointer only; needs primary snippets for artificial flowers/teeth/light/tears or similar.",
  },
  {
    sense: "consumer_suspicion",
    pre_1800_status: "not_found",
    strongest_source: "",
    source_count: 0,
    confidence: "low",
    notes: "No clear pre-1800 consumer/packaging suspicion evidence found in this pass.",
  },
  {
    sense: "absence_claim",
    pre_1800_status: "not_found",
    strongest_source: "",
    source_count: 0,
    confidence: "low",
    notes: "No pre-1800 no-artificial style absence claim found; likely modern packaging/advertising category.",
  },
];

const modernTermStatus: CsvRow[] = [
  {
    term_or_phrase: "no artificial ingredients",
    status: "confirmed_recent_usage",
    strongest_source: "Swanson 50% Less Sodium Beef Broth",
    source_type: "web_snippet",
    example_year_or_period: "current page accessed 2026-05-12",
    modern_relevance: "high",
    notes: "Current product-page absence claim.",
  },
  {
    term_or_phrase: "no artificial colors",
    status: "confirmed_recent_usage",
    strongest_source: "FDA no artificial colors letter; Gatorade; Swanson",
    source_type: "regulatory_source; web_snippet",
    example_year_or_period: "2026",
    modern_relevance: "high",
    notes: "Strong regulatory and product/brand evidence.",
  },
  {
    term_or_phrase: "no artificial flavors",
    status: "confirmed_recent_usage",
    strongest_source: "Gatorade; Swanson",
    source_type: "web_snippet",
    example_year_or_period: "2026/current",
    modern_relevance: "high",
    notes: "Strong product/brand evidence.",
  },
  {
    term_or_phrase: "nothing artificial",
    status: "not_checked",
    strongest_source: "",
    source_type: "",
    example_year_or_period: "",
    modern_relevance: "medium",
    notes: "First-round Ngram collected it; needs modern web/product review.",
  },
  {
    term_or_phrase: "free from artificial",
    status: "not_checked",
    strongest_source: "",
    source_type: "",
    example_year_or_period: "",
    modern_relevance: "medium",
    notes: "First-round Ngram collected it; needs modern web/product review.",
  },
  {
    term_or_phrase: "clean label",
    status: "confirmed_recent_usage",
    strongest_source: "IFT; Freedonia/Packaged Facts; FoodNavigator-USA",
    source_type: "secondary_literature; news_snippet",
    example_year_or_period: "2021-2024",
    modern_relevance: "high",
    notes: "Clean-label context found; still needs product-level examples if used visually.",
  },
  {
    term_or_phrase: "all natural",
    status: "partial_or_snippet_only",
    strongest_source: "Consumer Reports Natural label guide",
    source_type: "secondary_literature",
    example_year_or_period: "current page accessed 2026-05-12",
    modern_relevance: "medium",
    notes: "Consumer expectation context; not a direct product sample in this pass.",
  },
  {
    term_or_phrase: "artificial ingredients",
    status: "partial_or_snippet_only",
    strongest_source: "Consumer Reports Natural label guide",
    source_type: "secondary_literature",
    example_year_or_period: "current page accessed 2026-05-12",
    modern_relevance: "medium",
    notes: "Appears as expectation boundary in natural-label context.",
  },
  {
    term_or_phrase: "artificial flavor",
    status: "confirmed_recent_usage",
    strongest_source: "21 CFR 101.22; FDA ingredient page; Gatorade/Swanson absence claims",
    source_type: "regulatory_source; web_snippet",
    example_year_or_period: "current CFR; 2026/current product pages",
    modern_relevance: "high",
    notes: "Regulatory and product evidence.",
  },
  {
    term_or_phrase: "artificial color",
    status: "confirmed_recent_usage",
    strongest_source: "21 CFR 101.22; FDA no artificial colors letter",
    source_type: "regulatory_source",
    example_year_or_period: "2026/current CFR",
    modern_relevance: "high",
    notes: "Strong regulatory/background evidence.",
  },
  {
    term_or_phrase: "artificial sweetener",
    status: "confirmed_recent_usage",
    strongest_source: "Gatorade no artificial flavors, sweeteners or colors",
    source_type: "web_snippet",
    example_year_or_period: "2026",
    modern_relevance: "medium",
    notes: "Only absence-claim form captured here.",
  },
  {
    term_or_phrase: "synthetic ingredients",
    status: "partial_or_snippet_only",
    strongest_source: "IFT clean-label article; Consumer Reports natural guide",
    source_type: "secondary_literature",
    example_year_or_period: "2021/current",
    modern_relevance: "medium",
    notes: "Context found for synthetic/artificial opposition; needs product examples.",
  },
  {
    term_or_phrase: "natural ingredients",
    status: "confirmed_recent_usage",
    strongest_source: "Swanson product pages; clean-label secondary sources",
    source_type: "web_snippet; secondary_literature",
    example_year_or_period: "current/2024",
    modern_relevance: "medium",
    notes: "Useful opposition phrase.",
  },
  {
    term_or_phrase: "real ingredients",
    status: "not_checked",
    strongest_source: "",
    source_type: "",
    example_year_or_period: "",
    modern_relevance: "medium",
    notes: "Needs brand/product-page review.",
  },
  {
    term_or_phrase: "fake ingredients",
    status: "not_found",
    strongest_source: "",
    source_type: "",
    example_year_or_period: "",
    modern_relevance: "low",
    notes: "No strong source found in this pass.",
  },
];

const coverageMatrix: CsvRow[] = [
  {
    source_name: "Existing Chart 4 Google Books Ngram",
    source_type: "corpus_result",
    period_covered: "1800-2019",
    access_status: "accessed",
    terms_checked: "140 term/group records",
    usefulness: "Baseline frequency visibility.",
    limitations: "No sense disambiguation; not sentiment proof; not post-2019.",
    notes: "Not rerun.",
  },
  {
    source_name: "Etymonline",
    source_type: "etymology_source",
    period_covered: "pre_1800 chronology",
    access_status: "accessed",
    terms_checked: "artificial; artificiality; artificially; artifice; simulation",
    usefulness: "Strong chronology leads for pre-1800 sense branches.",
    limitations: "Secondary source; needs OED/primary quotation verification.",
    notes: "High value for manual review planning.",
  },
  {
    source_name: "Project Gutenberg",
    source_type: "book_snippet",
    period_covered: "pre_1800 and later public-domain texts",
    access_status: "accessed",
    terms_checked: "artificial tears; artificial manners; artificial manner",
    usefulness: "Public-domain snippets with context.",
    limitations: "Small sample; not frequency evidence.",
    notes: "Good for pre-1800 examples.",
  },
  {
    source_name: "Chronicling America",
    source_type: "newspaper_snippet; advertising_snippet",
    period_covered: "1900-1950 sample",
    access_status: "accessed",
    terms_checked: "artificially colored; no artificial flavoring",
    usefulness: "Adds newspaper and advertising source width.",
    limitations: "OCR and page-context review required.",
    notes: "Needs larger search pass later.",
  },
  {
    source_name: "FDA and eCFR",
    source_type: "regulatory_source",
    period_covered: "current; 2019-2026 regulatory context",
    access_status: "accessed",
    terms_checked: "artificial flavor; artificial color; no artificial colors; ingredients; labeling",
    usefulness: "Defines labeling categories and captures 2026 no-artificial-colors policy language.",
    limitations: "Not sentiment or usage-frequency evidence.",
    notes: "Use as background.",
  },
  {
    source_name: "Brand/product pages",
    source_type: "web_snippet",
    period_covered: "2019-2026/current web",
    access_status: "accessed",
    terms_checked: "no artificial ingredients; no artificial colors; no artificial flavors; no artificial sweeteners",
    usefulness: "Direct modern packaging/product language.",
    limitations: "Pages can change; marketing language is not balanced corpus data.",
    notes: "PepsiCo/Gatorade and Campbell/Swanson sampled.",
  },
  {
    source_name: "Modern dictionary/thesaurus sources",
    source_type: "modern_dictionary",
    period_covered: "current semantic boundary",
    access_status: "accessed",
    terms_checked: "artificial; fake; false; synthetic; imitation; real; natural; man-made",
    usefulness: "Semantic-distance guardrails.",
    limitations: "Dictionary sense inventory, not historical trend.",
    notes: "Useful before interpreting broad comparators.",
  },
  {
    source_name: "Clean-label secondary/trade sources",
    source_type: "secondary_literature; news_snippet",
    period_covered: "2021-2024",
    access_status: "accessed",
    terms_checked: "clean label; artificial; synthetic; natural; preservatives; flavors",
    usefulness: "Consumer-culture context for absence claims.",
    limitations: "Survey/report/trade framing; may have market-source bias.",
    notes: "Needs direct corpus/product examples if central.",
  },
  {
    source_name: "OED, MED, Ash, Sheridan, Walker",
    source_type: "historical_dictionary",
    period_covered: "pre_1800",
    access_status: "not_accessible",
    terms_checked: "artificial and related terms",
    usefulness: "Potentially high for chronology.",
    limitations: "Not captured in this pass.",
    notes: "Manual review needed.",
  },
];

const manualReviewQueue: CsvRow[] = [
  {
    priority: 1,
    item: "pre-1800 fake / affected sense",
    why_review: "Needed before making any chronology claim about suspicious or pejorative senses.",
    source_type_needed: "OED; Johnson direct scan; historical dictionary; primary snippets",
    current_status: "partially confirmed from Etymonline, Shakespeare, Wollstonecraft, Johnson indirect",
    blocking_level: "blocks_claim",
    notes: "Do not finalize dates until OED/direct sources are checked.",
  },
  {
    priority: 1,
    item: "artificial smile / manner / tears snippets",
    why_review: "Need contextual samples for affective/social use, not just Ngram curves.",
    source_type_needed: "Google Books snippets; Project Gutenberg; Internet Archive; corpus_context",
    current_status: "artificial tears and artificial manners found; artificial smile not found pre-1800",
    blocking_level: "blocks_claim",
    notes: "Expand with snippets before visual planning.",
  },
  {
    priority: 1,
    item: "no artificial ingredients modern usage",
    why_review: "Core packaging/absence phrase needs direct product and label examples.",
    source_type_needed: "packaging_language; brand pages; retail product pages",
    current_status: "confirmed in Swanson product page sample",
    blocking_level: "blocks_visual_planning",
    notes: "Need broader brand sample if central.",
  },
  {
    priority: 2,
    item: "clean label usage",
    why_review: "Clean label connects artificial to consumer suspicion but is a broad market term.",
    source_type_needed: "consumer_culture_literature; market reports; product pages",
    current_status: "confirmed in secondary/trade sources",
    blocking_level: "blocks_visual_planning",
    notes: "Clarify whether clean label belongs in Chart 4 or notes.",
  },
  {
    priority: 1,
    item: "artificial vs fake dictionary distinction",
    why_review: "Prevents collapsing artificial into fake.",
    source_type_needed: "modern_dictionary; historical_dictionary; semantic_dictionary",
    current_status: "Cambridge/Oxford/WordReference/MW sampled",
    blocking_level: "blocks_claim",
    notes: "Keep artificial/fake/false/synthetic/imitation separated.",
  },
  {
    priority: 1,
    item: "broad terms fake / real / natural / synthetic",
    why_review: "Broad comparators are noisy and cannot be interpreted from Ngram alone.",
    source_type_needed: "semantic_dictionary; corpus_context",
    current_status: "dictionary/thesaurus boundary sources found",
    blocking_level: "blocks_claim",
    notes: "No broad unigram should become a claim without context.",
  },
  {
    priority: 2,
    item: "packaging / advertising examples",
    why_review: "Need source-width beyond books for absence claims.",
    source_type_needed: "newspaper_advertising; magazine_advertising; packaging_language",
    current_status: "Chronicling America 1950 ad and modern product pages found",
    blocking_level: "blocks_visual_planning",
    notes: "Needs larger historical ad pass.",
  },
  {
    priority: 2,
    item: "OED artificial sense chronology",
    why_review: "Best source for precise dated sense order.",
    source_type_needed: "historical_dictionary",
    current_status: "not accessible in this pass",
    blocking_level: "blocks_claim",
    notes: "Manual access needed.",
  },
  {
    priority: 3,
    item: "Bailey / Ash / Sheridan / Walker dictionary entries",
    why_review: "Could improve 18th-century lexical source width.",
    source_type_needed: "historical_dictionary scan",
    current_status: "search-only/no stable extracts",
    blocking_level: "minor_risk",
    notes: "Optional unless pre-1800 dictionary lane becomes central.",
  },
];

const gapSummary: CsvRow[] = [
  {
    gap_area: "pre-1800 exact chronology",
    current_status: "partial",
    why_it_matters: "Prevents overclaiming when negative or suspicious senses appear.",
    next_source_type: "OED; direct Johnson; primary quotation snippets",
    priority: 1,
    notes: "Etymonline and existing Chart 1 evidence give strong leads but not final dates.",
  },
  {
    gap_area: "pre-1800 artificial smile",
    current_status: "gap",
    why_it_matters: "Artificial smile is a clear modern affected/insincere phrase.",
    next_source_type: "Google Books snippets; ECCO/EEBO if accessible; Internet Archive",
    priority: 2,
    notes: "No pre-1800 artificial smile sample captured.",
  },
  {
    gap_area: "historical advertising before 1950",
    current_status: "weak",
    why_it_matters: "Consumer suspicion likely developed in ads/labels outside books.",
    next_source_type: "Chronicling America; magazine advertising; trade papers",
    priority: 1,
    notes: "Only two historical newspaper leads captured.",
  },
  {
    gap_area: "2019-2026 balanced corpus",
    current_status: "weak",
    why_it_matters: "Modern web/product snippets are source-width evidence, not representative frequency.",
    next_source_type: "NOW Corpus; GDELT/news corpus; COCA if accessible",
    priority: 2,
    notes: "Modern examples are useful but biased toward brand/regulatory sources.",
  },
  {
    gap_area: "packaging image evidence",
    current_status: "weak",
    why_it_matters: "Product pages may not match physical packaging.",
    next_source_type: "packaging scans; retailer images; brand PDFs",
    priority: 2,
    notes: "No package-image archive created in this pass.",
  },
  {
    gap_area: "semantic distance measurement",
    current_status: "background_only",
    why_it_matters: "Chart 4B may need semantic distance rather than just dictionary lists.",
    next_source_type: "semantic_dictionary; contextual corpus; embeddings/collocation corpus",
    priority: 2,
    notes: "Dictionary boundary sources collected; no semantic-distance computation done.",
  },
];

const timelineCoverage: CsvRow[] = [
  {
    period: "pre_1800",
    source_types_available: "etymology_source; historical_dictionary_indirect; book_snippet",
    strongest_evidence_types: "definition; snippet",
    weakest_evidence_types: "newspaper_advertising; packaging_claim; balanced corpus",
    coverage_quality: "medium",
    notes: "Good leads for not-natural, fake/not-genuine, and affected/insincere; exact chronology still needs OED/direct scans.",
  },
  {
    period: "1800_1850",
    source_types_available: "historical_dictionary; existing Ngram",
    strongest_evidence_types: "definition; corpus_result",
    weakest_evidence_types: "advertising_snippet",
    coverage_quality: "medium",
    notes: "Webster 1828 checkpoint plus Ngram baseline; non-book source width remains limited.",
  },
  {
    period: "1850_1900",
    source_types_available: "existing Ngram",
    strongest_evidence_types: "corpus_result",
    weakest_evidence_types: "newspaper_advertising; packaging_claim",
    coverage_quality: "weak",
    notes: "Needs historical newspaper and magazine ad review.",
  },
  {
    period: "1900_1950",
    source_types_available: "existing Ngram; newspaper_snippet",
    strongest_evidence_types: "corpus_result; context_signal",
    weakest_evidence_types: "packaging_claim",
    coverage_quality: "medium",
    notes: "1904 food-coloring item and 1950 ad lead add non-book width, but sample is thin.",
  },
  {
    period: "1950_2000",
    source_types_available: "existing Ngram; advertising_snippet",
    strongest_evidence_types: "corpus_result; advertising_claim",
    weakest_evidence_types: "packaging archive",
    coverage_quality: "medium",
    notes: "1950 ad lead shows absence claim; needs mid/late-century packaging and magazine ads.",
  },
  {
    period: "2000_2019",
    source_types_available: "existing Ngram; dictionary/background sources",
    strongest_evidence_types: "corpus_result",
    weakest_evidence_types: "modern web snippets",
    coverage_quality: "medium",
    notes: "Existing Ngram covers this period but non-book context remains thin.",
  },
  {
    period: "2019_2026",
    source_types_available: "regulatory_source; web_snippet; news_snippet; secondary_literature; modern_dictionary",
    strongest_evidence_types: "packaging_claim; regulatory_definition; context_signal",
    weakest_evidence_types: "balanced corpus_result",
    coverage_quality: "medium",
    notes: "Good source-width sample; lacks representative news/web corpus counts.",
  },
];

async function readExistingBaseline() {
  const availabilityPath = path.join(CHART4_DIR, "processed", "chart_04_data_availability_summary.csv");
  const nonNgramPath = path.join(CHART4_DIR, "processed", "chart_04_terms_requiring_non_ngram_sources.csv");
  const metadataPath = path.join(CHART4_DIR, "processed", "chart_04_term_metadata.csv");
  const [availability, nonNgram, metadata] = await Promise.all([
    readFile(availabilityPath, "utf8"),
    readFile(nonNgramPath, "utf8"),
    readFile(metadataPath, "utf8"),
  ]);
  return {
    availabilityRows: availability.trim().split("\n").length - 1,
    nonNgramRows: nonNgram.trim().split("\n").length - 1,
    metadataRows: metadata.trim().split("\n").length - 1,
    missingTerms: metadata
      .trim()
      .split("\n")
      .slice(1)
      .filter((line) => line.includes(",missing,"))
      .map((line) => line.split(",")[0]),
  };
}

async function main() {
  const generatedAt = new Date().toISOString();
  const baseline = await readExistingBaseline();
  await Promise.all([RAW_DIR, PROCESSED_DIR, NOTES_DIR, SOURCES_DIR, SCRIPTS_DIR].map((dir) => mkdir(dir, { recursive: true })));

  await writeFile(
    path.join(RAW_DIR, "round_02_pre_1800_dictionary_extracts.json"),
    `${JSON.stringify(dictionaryExtracts, null, 2)}\n`,
  );
  await writeFile(
    path.join(RAW_DIR, "round_02_pre_1800_snippets.csv"),
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
        "short_summary",
        "confidence",
        "notes",
      ],
      pre1800Snippets,
    )}\n`,
  );
  await writeFile(
    path.join(RAW_DIR, "round_02_historical_newspaper_snippets.csv"),
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
        "short_summary",
        "confidence",
        "notes",
      ],
      newspaperSnippets,
    )}\n`,
  );
  await writeFile(
    path.join(RAW_DIR, "round_02_modern_2019_2026_snippets.csv"),
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
        "short_summary",
        "confidence",
        "notes",
      ],
      modernSnippets,
    )}\n`,
  );
  await writeFile(
    path.join(RAW_DIR, "round_02_regulatory_sources.json"),
    `${JSON.stringify(regulatorySources, null, 2)}\n`,
  );
  await writeFile(
    path.join(RAW_DIR, "round_02_source_access_log.csv"),
    `${csvRows(["source_name", "source_type", "access_status", "source_url", "terms_checked", "result", "notes"], sourceAccessLog)}\n`,
  );

  await writeFile(
    path.join(PROCESSED_DIR, "round_02_evidence_table.csv"),
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
        "confidence",
        "short_summary",
        "chart4_relevance",
        "needs_followup",
        "notes",
      ],
      evidenceRows,
    )}\n`,
  );
  await writeFile(
    path.join(PROCESSED_DIR, "round_02_pre_1800_sense_status.csv"),
    `${csvRows(["sense", "pre_1800_status", "strongest_source", "source_count", "confidence", "notes"], pre1800SenseStatus)}\n`,
  );
  await writeFile(
    path.join(PROCESSED_DIR, "round_02_modern_2019_2026_term_status.csv"),
    `${csvRows(
      ["term_or_phrase", "status", "strongest_source", "source_type", "example_year_or_period", "modern_relevance", "notes"],
      modernTermStatus,
    )}\n`,
  );
  await writeFile(
    path.join(PROCESSED_DIR, "round_02_source_coverage_matrix.csv"),
    `${csvRows(
      ["source_name", "source_type", "period_covered", "access_status", "terms_checked", "usefulness", "limitations", "notes"],
      coverageMatrix,
    )}\n`,
  );
  await writeFile(
    path.join(PROCESSED_DIR, "round_02_manual_review_queue.csv"),
    `${csvRows(["priority", "item", "why_review", "source_type_needed", "current_status", "blocking_level", "notes"], manualReviewQueue)}\n`,
  );
  await writeFile(
    path.join(PROCESSED_DIR, "round_02_chart4_data_gap_summary.csv"),
    `${csvRows(["gap_area", "current_status", "why_it_matters", "next_source_type", "priority", "notes"], gapSummary)}\n`,
  );
  await writeFile(
    path.join(PROCESSED_DIR, "round_02_combined_timeline_coverage.csv"),
    `${csvRows(
      ["period", "source_types_available", "strongest_evidence_types", "weakest_evidence_types", "coverage_quality", "notes"],
      timelineCoverage,
    )}\n`,
  );

  const filesCreated = [
    "raw/round_02_pre_1800_dictionary_extracts.json",
    "raw/round_02_pre_1800_snippets.csv",
    "raw/round_02_historical_newspaper_snippets.csv",
    "raw/round_02_modern_2019_2026_snippets.csv",
    "raw/round_02_regulatory_sources.json",
    "raw/round_02_source_access_log.csv",
    "processed/round_02_evidence_table.csv",
    "processed/round_02_pre_1800_sense_status.csv",
    "processed/round_02_modern_2019_2026_term_status.csv",
    "processed/round_02_source_coverage_matrix.csv",
    "processed/round_02_manual_review_queue.csv",
    "processed/round_02_chart4_data_gap_summary.csv",
    "processed/round_02_combined_timeline_coverage.csv",
    "notes/round_02_collection_log.md",
    "notes/round_02_source_notes.md",
    "notes/round_02_pre_1800_findings.md",
    "notes/round_02_2019_2026_findings.md",
    "notes/round_02_non_ngram_findings.md",
    "notes/round_02_remaining_risks.md",
    "sources/round_02_source_urls.md",
    "scripts/README.md",
  ];

  const collectionLog = `# Round 02 Collection Log

Generated: ${generatedAt}

## Scope

Expanded Chart 4 corpus pass for \`artificial\`. This pass reads the existing Chart 4 Ngram package, preserves it as the 1800-2019 baseline, and adds pre-1800, post-2019, regulatory, dictionary, newspaper, advertising, product-page, and clean-label source width.

No chart design, visualization, React, final chart copy, or final semantic claim was produced.

## Existing Baseline Read

- Existing folder: \`docs/research/artificial/chart_04_suspicion_distance/\`
- Existing metadata rows read: ${baseline.metadataRows}
- Existing availability group rows read: ${baseline.availabilityRows}
- Existing non-Ngram queue rows read: ${baseline.nonNgramRows}
- Existing missing Ngram baseline terms: ${baseline.missingTerms.join(", ") || "none"}

## Ngram Policy

- Did not rerun the 140-term Chart 4 Ngram collection.
- Used existing 1800-2019 outputs as baseline only.
- No new Ngram query was necessary in this pass.

## Files Written

${mdList(filesCreated.map((file) => `\`${file}\``))}

## Source Types Checked

- historical_dictionary
- modern_dictionary
- etymology_source
- book_snippet
- newspaper_snippet
- advertising_snippet
- web_snippet
- news_snippet
- regulatory_source
- corpus_result
- secondary_literature

## Main Assumptions

- Source diversity is more useful than volume for this pass.
- Snippets are context leads, not frequency evidence.
- Existing Ngram first nonzero years are not treated as attestations.
- Modern product pages are packaging-language evidence, but they can change.
- Regulatory sources define categories; they do not prove consumer suspicion.

## Access Problems

- OED was not accessible.
- Direct Johnson was not stabilized; existing indirect Johnson status was carried forward.
- Bailey was found as Google Books records/search-only, but no stable entry extract was captured.
- Ash, Sheridan, and Walker entries were not captured; they remain manual scan items.
- No balanced 2019-2026 corpus such as NOW/COCA/GDELT was queried in this pass.
`;
  await writeFile(path.join(NOTES_DIR, "round_02_collection_log.md"), collectionLog);

  const sourceNotes = `# Round 02 Source Notes

Generated: ${generatedAt}

## Google Books Ngram

The existing Chart 4 Google Books Ngram package remains the 1800-2019 baseline. It was read but not rerun.

## Historical / Pre-1800 Sources

- Etymonline was used as a secondary etymology source for chronology leads.
- Project Gutenberg was used for public-domain snippet leads.
- Existing Chart 1 round 06 evidence was reused where directly relevant to Chart 4, especially artificial tears and Johnson indirect status.
- Johnson direct, OED, Bailey, Ash, Sheridan, Walker, MED, EEBO, and ECCO remain manual-review targets.

## Newspaper / Advertising Sources

- Chronicling America was sampled for historical newspaper and advertising evidence.
- OCR and page-image quality must be checked before final quotation.

## Modern / Web / Product Sources

- PepsiCo/Gatorade and Campbell/Swanson pages were sampled as current brand/product language.
- Consumer Reports, IFT, Freedonia/Packaged Facts, and FoodNavigator-USA were sampled for clean-label and consumer-language context.
- These are not balanced corpora.

## Regulatory Sources

- FDA and eCFR sources were used for labeling definitions and recent no-artificial-colors policy context.
- Regulatory sources are background sources only and do not prove pejoration or health risk.

## Limitations

- Source search is selective, not exhaustive.
- Search result snippets can be biased.
- Snippets do not show frequency.
- Current web/product pages can change after access.
- Broad terms such as natural, real, fake, synthetic, and genuine remain context-sensitive.
`;
  await writeFile(path.join(NOTES_DIR, "round_02_source_notes.md"), sourceNotes);

  const pre1800Findings = `# Round 02 Pre-1800 Findings

Generated: ${generatedAt}

## What Was Found Before 1800

- Etymonline provides secondary chronology leads for not-natural, made-by-skill, imitation/substitute, fake/not-genuine, and affected/insincere senses of \`artificial\`.
- Shakespeare's \`artificial tears\` remains the strongest pre-1800 feigned-emotion lead captured so far.
- Wollstonecraft's 1787 \`Artificial Manners\` chapter is a strong conduct-literature lead for artificial as affectation rather than genuine feeling.
- Chambers's 1773 \`artificial manner\`/gardening passage is useful for art/nature and affectation context, but it is mixed and aesthetic rather than direct social insincerity.
- Johnson remains useful only through indirect transcription until direct manual verification.

## Neutral / Descriptive Sense

Confirmed from etymology and dictionary leads as art/human-skill/made-by-art usage.

## Not-Natural

Confirmed as a pre-1800 sense family, but exact earliest source order needs OED/manual verification.

## Fake / Not-Genuine

Confirmed as a pre-1800 branch from the Shakespeare artificial-tears lead, Etymonline chronology, and Johnson indirect evidence.

## Affected / Insincere

Partially confirmed. Wollstonecraft gives strong \`artificial manners\` support, and Etymonline provides chronology for affected/insincere language. More snippets are needed for artificial smile, artificial manner, and artificial expression.

## What Remains Unresolved

- Direct OED chronology.
- Direct Johnson page/scan verification.
- Bailey/Ash/Sheridan/Walker dictionary extracts.
- More pre-1800 snippets for artificial smile, artificial expression, artificially affected, artificial and false, and artificial and unnatural.
`;
  await writeFile(path.join(NOTES_DIR, "round_02_pre_1800_findings.md"), pre1800Findings);

  const modernFindings = `# Round 02 2019-2026 Findings

Generated: ${generatedAt}

## What Was Found In Recent Sources

- FDA has explicit 2026 material on \`no artificial colors\` labeling claims.
- eCFR/FDA sources define artificial flavor, artificial color, and related labeling categories.
- Gatorade 2026 launch copy uses \`no artificial flavors, sweeteners or colors\`.
- Swanson/Campbell product pages use \`no artificial ingredients\`, \`no artificial flavors\`, \`no artificial colors\`, and \`no preservatives\`.
- Clean-label sources connect consumer-facing clean-label language with avoiding artificial/synthetic additives and favoring recognizable ingredients.

## Strongest Recent Terms

- no artificial colors
- no artificial flavors
- no artificial ingredients
- no artificial flavors, sweeteners or colors
- clean label
- artificial flavor
- artificial color

## Packaging / Absence Language

Modern product pages strongly support absence-claim language, but this pass sampled only a few brand/product pages.

## Clean-Label / Natural Language

Consumer Reports and clean-label trade/market sources show that \`natural\`, \`clean label\`, and \`no artificial ingredients\` interact in consumer expectation and marketing contexts. This is context evidence, not final proof.

## Fake / Synthetic / Real Comparison

Modern dictionary/thesaurus sources distinguish artificial from fake, false, synthetic, imitation, natural, and real. These are semantic guardrails rather than change claims.

## Limitations

- Modern sources are selective.
- Product pages can change.
- Brand/press sources are not balanced corpus evidence.
- No GDELT/NOW/COCA corpus pass was completed.
`;
  await writeFile(path.join(NOTES_DIR, "round_02_2019_2026_findings.md"), modernFindings);

  const nonNgramFindings = `# Round 02 Non-Ngram Findings

Generated: ${generatedAt}

## Newspapers / Advertising

- Chronicling America produced a 1904 newspaper food-coloring lead around \`artificially colored\`.
- Chronicling America produced a 1950 Kitchen Bouquet advertisement using \`no artificial flavoring\`.
- These leads show the value of advertising/newspaper review, but the sample is thin.

## Dictionary Findings

- Etymonline and existing Chart 1 dictionary work supply strong pre-1800 leads.
- Modern dictionary/thesaurus sources help separate artificial from fake, synthetic, false, imitation, natural, and real.
- Direct OED and Johnson remain important gaps.

## Regulatory Findings

- 21 CFR 101.22 defines artificial flavor/flavoring and artificial color/coloring.
- FDA's 2026 letter and press release show that \`no artificial colors\` is active regulatory/labeling language.
- FDA color-additive pages provide background on color additive categories and industry pledges.

## Modern Web / News Findings

- Brand/product pages confirm current absence claims.
- Clean-label secondary/trade sources confirm consumer-language context.
- Food/news/trade sources need to be kept separate from product claims.

## Where Ngram Was Insufficient

- Pre-1800 chronology.
- Post-2019 language.
- Advertising/packaging claims.
- Regulatory definitions.
- Semantic boundary distinctions among artificial, fake, real, natural, synthetic, and imitation.
`;
  await writeFile(path.join(NOTES_DIR, "round_02_non_ngram_findings.md"), nonNgramFindings);

  const remainingRisks = `# Round 02 Remaining Risks

Generated: ${generatedAt}

- Modern web snippets are not balanced corpus evidence.
- Search results can overrepresent SEO, brand pages, current controversy, and accessible sources.
- Packaging language source availability is uneven; product pages may not match package labels.
- Broad comparators such as \`fake\`, \`real\`, \`natural\`, and \`synthetic\` remain ambiguous without context.
- Historical newspaper OCR can be noisy.
- Pre-1800 access gaps remain, especially OED, Johnson direct, ECCO/EEBO, and eighteenth-century dictionary scans.
- Regulatory sources define label categories but do not show sentiment.
- No health-risk claims should be made from this package.
- No final semantic or Chart 4 claim is supported yet without manual review.
`;
  await writeFile(path.join(NOTES_DIR, "round_02_remaining_risks.md"), remainingRisks);

  const sourceUrlsMd = `# Round 02 Source URLs

Generated: ${generatedAt}

${Object.entries(sourceUrls)
  .map(([key, url]) => `- ${key}: ${url}`)
  .join("\n")}
`;
  await writeFile(path.join(SOURCES_DIR, "round_02_source_urls.md"), sourceUrlsMd);

  const scriptsReadme = `# Round 02 Scripts

- Project-level builder: \`scripts/build_chart_04_expanded_round_02.ts\`
- The builder reads existing Chart 4 baseline files and writes the expanded corpus round 02 package.
- It does not fetch or rerun Ngram.
`;
  await writeFile(path.join(SCRIPTS_DIR, "README.md"), scriptsReadme);

  console.log(
    JSON.stringify(
      {
        generatedAt,
        outputRoot: BASE_DIR,
        baseline,
        evidenceRows: evidenceRows.length,
        pre1800Snippets: pre1800Snippets.length,
        newspaperSnippets: newspaperSnippets.length,
        modernSnippets: modernSnippets.length,
        regulatorySources: regulatorySources.length,
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
