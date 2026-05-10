import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const BASE_DIR = path.join(
  process.cwd(),
  "docs",
  "research",
  "artificial",
  "chart_01_art_artifice",
  "audit_round_03",
);
const RAW_DIR = path.join(BASE_DIR, "raw");
const PROCESSED_DIR = path.join(BASE_DIR, "processed");
const NOTES_DIR = path.join(BASE_DIR, "notes");
const SOURCES_DIR = path.join(BASE_DIR, "sources");

const START_YEAR = 1800;
const END_YEAR = 2019;
const CORPUS = "en";
const SMOOTHING = 0;
const CASE_INSENSITIVE = true;
const ENDPOINT = "https://books.google.com/ngrams/json";
const BATCH_SIZE = 8;
const REQUEST_DELAY_MS = 350;

type Chart01Sense =
  | "art_skill_making"
  | "technical_rule_reckoning"
  | "contrivance_construction"
  | "not_natural"
  | "imitation_substitute"
  | "fake_not_genuine"
  | "affected_insincere"
  | "mixed_bridge_sense"
  | "unclear_or_unusable";

type NgramResponse = {
  ngram: string;
  timeseries: number[];
};

const ngramTerms = [
  "artificial",
  "artificially",
  "artifice",
  "artificer",
  "artificiality",
  "contrivance",
  "contrived",
  "artful",
  "artless",
  "artisan",
  "artifact",
  "artefact",
  "made by art",
  "made by skill",
  "human skill",
  "artificial day",
  "artificial memory",
  "artificial arguments",
  "artificial lines",
  "artificial numbers",
];

const senseDefinitions: Array<{
  sense: Chart01Sense;
  definition: string;
  core_terms: string;
  example_phrases: string;
  strongest_sources: string;
  earliest_confirmed_or_claimed_period: string;
  confidence: string;
  notes: string;
}> = [
  {
    sense: "art_skill_making",
    definition: "Made by art, skill, craft, learned technique, or human labor.",
    core_terms: "art; artificial; artificially; artifice; artificer",
    example_phrases: "made by art; human skill; by art or human skill",
    strongest_sources: "Webster 1828 artificial/art/artificer; Etymonline artificial/artifice/artificer; Merriam-Webster word histories",
    earliest_confirmed_or_claimed_period: "late medieval/early 15c. in etymological sources; securely visible in Webster 1828",
    confidence: "high",
    notes: "This is the strongest Chart 1 layer, but OED is still needed for earliest quotations.",
  },
  {
    sense: "technical_rule_reckoning",
    definition:
      "Made, defined, divided, or produced by rule, method, calculation, rhetoric, memory art, mathematical system, or technical convention.",
    core_terms: "artificial; artificial arguments; artificial lines; artificial numbers; artificial memory; artificial day",
    example_phrases: "artificial day; artificial memory; artificial arguments; artificial lines; artificial numbers",
    strongest_sources: "Webster 1828 artificial; Etymonline artificial; Rhetorica ad Herennium memory passage",
    earliest_confirmed_or_claimed_period: "late medieval claim for artificial day; classical/medieval tradition for artificial memory; Webster 1828 for technical examples",
    confidence: "medium",
    notes: "Strong semantically, but several anchors are specialized and need OED/primary snippet verification before public use.",
  },
  {
    sense: "contrivance_construction",
    definition: "Devised, arranged, constructed, or contrived; neutral in some sources, suspicious in others.",
    core_terms: "artificial; artificially; artifice; artificer; contrivance; contrived",
    example_phrases: "contrived by art; artificial revolution; artificer of fortunes",
    strongest_sources: "Webster 1828 artificial/artifice/artificer; Merriam-Webster artifice",
    earliest_confirmed_or_claimed_period: "visible in historical dictionary evidence by 1828; older chronology needs OED/Johnson",
    confidence: "high",
    notes: "This is the bridge sense. It must not be collapsed into deception.",
  },
  {
    sense: "not_natural",
    definition: "Opposed to natural, but not necessarily fake or deceptive.",
    core_terms: "artificial; art; natural contrast",
    example_phrases: "artificial heat; artificial light; artificial day",
    strongest_sources: "Webster 1828 artificial/art; Etymonline artificial; Merriam-Webster artificial",
    earliest_confirmed_or_claimed_period: "late 14c. claim in Etymonline; secure in Webster 1828",
    confidence: "high",
    notes: "Central distinction: not natural may mean human-made, rule-made, or skill-made.",
  },
  {
    sense: "imitation_substitute",
    definition: "Made in imitation of, or as a substitute for, something natural.",
    core_terms: "artificial",
    example_phrases: "artificial teeth; artificial flowers; artificial light",
    strongest_sources: "Etymonline artificial; Cambridge; Oxford Learner's; Merriam-Webster",
    earliest_confirmed_or_claimed_period: "16c. claim in Etymonline",
    confidence: "medium",
    notes: "Important boundary but belongs mostly beyond Chart 1 unless used to separate not-natural from fake.",
  },
  {
    sense: "fake_not_genuine",
    definition: "Fictitious, sham, not genuine, false, not real.",
    core_terms: "artificial; artifice",
    example_phrases: "artificial tears; artificial emotion; sham artifice",
    strongest_sources: "Webster 1828 artificial; Etymonline artificial; Merriam-Webster artificial/artifice",
    earliest_confirmed_or_claimed_period: "1640s claim in Etymonline; secure in Webster 1828",
    confidence: "medium",
    notes: "Evidence exists, but it is not the only or earliest layer in the collected evidence.",
  },
  {
    sense: "affected_insincere",
    definition: "Forced, mannered, unnatural in behavior, insincere, emotionally artificial.",
    core_terms: "artificial; artificiality; artifice; artless",
    example_phrases: "artificial smile; artificial manner; social artifice",
    strongest_sources: "Etymonline artificial; Cambridge; Merriam-Webster; Webster 1828 artless",
    earliest_confirmed_or_claimed_period: "1590s claim in Etymonline; modern dictionaries confirm live sense",
    confidence: "medium",
    notes: "Useful boundary evidence, but should stay secondary for Chart 1.",
  },
  {
    sense: "mixed_bridge_sense",
    definition: "Evidence item explicitly crosses two senses, especially skillful contrivance and suspicious contrivance.",
    core_terms: "artifice; artificer; artful; contrivance",
    example_phrases: "artful device; artificer of fraud or lies",
    strongest_sources: "Webster 1828 artifice/artificer; Merriam-Webster artifice",
    earliest_confirmed_or_claimed_period: "secure in Webster 1828; older transition needs OED/Johnson",
    confidence: "high",
    notes: "Best label for artifice and contrivance when skill and suspicion coexist.",
  },
  {
    sense: "unclear_or_unusable",
    definition: "Evidence is too vague, corrupted, inaccessible, or contextless for Chart 1.",
    core_terms: "Ngram-only phrases; inaccessible Johnson/OED items",
    example_phrases: "artificial reason; artificial logic; unsupported snippet hits",
    strongest_sources: "N/A",
    earliest_confirmed_or_claimed_period: "N/A",
    confidence: "high",
    notes: "Use this bucket to keep Chart 1 from overclaiming.",
  },
];

const dictionaryExtracts = [
  {
    id: "webster_1828_artificial",
    source_name: "Webster 1828",
    term: "artificial",
    year: 1828,
    source_type: "historical_dictionary",
    source_url: "https://webstersdictionary1828.com/Dictionary/artificial",
    short_definition_summary:
      "Lists made/contrived by art, human skill, and labor first; separately lists feigned/fictitious/not genuine; includes rhetorical and mathematical technical uses.",
    exact_short_quote: "Made or contrived by art",
    sense: "mixed_bridge_sense",
    reliability: "high",
    access_limitations: "",
    helps_chart_01_directly: true,
  },
  {
    id: "webster_1828_artificially",
    source_name: "Webster 1828",
    term: "artificially",
    year: 1828,
    source_type: "historical_dictionary",
    source_url: "https://webstersdictionary1828.com/Dictionary/artificially",
    short_definition_summary:
      "Checked as required, but the direct page returned unreliably in web tooling. Prior package keeps the by-art/human-skill paraphrase from accessible lookup context.",
    exact_short_quote: "",
    sense: "art_skill_making",
    reliability: "medium",
    access_limitations: "Direct page gave an intermittent fetch error in this pass.",
    helps_chart_01_directly: true,
  },
  {
    id: "webster_1828_art",
    source_name: "Webster 1828",
    term: "art",
    year: 1828,
    source_type: "historical_dictionary",
    source_url: "https://webstersdictionary1828.com/Dictionary/art",
    short_definition_summary:
      "Defines art as human skill modifying things for intended purposes, a system of rules, and acquired skill/dexterity.",
    exact_short_quote: "art stands opposed to nature",
    sense: "art_skill_making",
    reliability: "high",
    access_limitations: "",
    helps_chart_01_directly: true,
  },
  {
    id: "webster_1828_artifice",
    source_name: "Webster 1828",
    term: "artifice",
    year: 1828,
    source_type: "historical_dictionary",
    source_url: "https://webstersdictionary1828.com/Dictionary/artifice",
    short_definition_summary:
      "Gives artifice as an ingenious device in good or bad sense, with bad sense aligning with trick/fraud; also art/trade/skill by science or practice.",
    exact_short_quote: "in a good or bad sense",
    sense: "mixed_bridge_sense",
    reliability: "high",
    access_limitations: "",
    helps_chart_01_directly: true,
  },
  {
    id: "webster_1828_artificer",
    source_name: "Webster 1828",
    term: "artificer",
    year: 1828,
    source_type: "historical_dictionary",
    source_url: "https://webstersdictionary1828.com/Dictionary/artificer",
    short_definition_summary:
      "Defines artificer as artist/mechanic/manufacturer requiring skill or knowledge, then maker/contriver/inventor, and only then obsolete cunning/artful fellow.",
    exact_short_quote: "requires skill or knowledge",
    sense: "art_skill_making",
    reliability: "high",
    access_limitations: "",
    helps_chart_01_directly: true,
  },
  {
    id: "webster_1828_artless",
    source_name: "Webster 1828",
    term: "artless",
    year: 1828,
    source_type: "historical_dictionary",
    source_url: "https://webstersdictionary1828.com/Dictionary/artless",
    short_definition_summary:
      "Shows art-family polarity: artless can mean unskillful, but also sincere/unaffected/free from guile.",
    exact_short_quote: "free from guile",
    sense: "affected_insincere",
    reliability: "high",
    access_limitations: "",
    helps_chart_01_directly: false,
  },
  {
    id: "etymonline_artificial",
    source_name: "Etymonline",
    term: "artificial",
    year: null,
    source_type: "secondary_etymology",
    source_url: "https://www.etymonline.com/word/artificial",
    short_definition_summary:
      "Separates the art/skill/theory-system root, artificial day, early-15c human-skill/labor sense, 16c imitation/substitute, 1590s insincere, and 1640s not-genuine senses.",
    exact_short_quote: "made by human skill and labor",
    sense: "mixed_bridge_sense",
    reliability: "medium",
    access_limitations: "Secondary source; earliest claims need OED or primary text confirmation.",
    helps_chart_01_directly: true,
  },
  {
    id: "etymonline_artificially",
    source_name: "Etymonline",
    term: "artificially",
    year: null,
    source_type: "secondary_etymology",
    source_url: "https://www.etymonline.com/word/artificially",
    short_definition_summary:
      "Directly glosses artificially as by art or human skill and contrivance, dated early 15c.",
    exact_short_quote: "by art or human skill",
    sense: "art_skill_making",
    reliability: "medium",
    access_limitations: "Secondary source.",
    helps_chart_01_directly: true,
  },
  {
    id: "etymonline_artifice",
    source_name: "Etymonline",
    term: "artifice",
    year: null,
    source_type: "secondary_etymology",
    source_url: "https://www.etymonline.com/word/artifice",
    short_definition_summary:
      "Dates artifice as workmanship/making by craft or skill in the 1530s, with crafty-device/trick sense later in the 1650s.",
    exact_short_quote: "making of something by craft",
    sense: "mixed_bridge_sense",
    reliability: "medium",
    access_limitations: "Secondary source.",
    helps_chart_01_directly: true,
  },
  {
    id: "etymonline_artificer",
    source_name: "Etymonline",
    term: "artificer",
    year: null,
    source_type: "secondary_etymology",
    source_url: "https://www.etymonline.com/word/artificer",
    short_definition_summary:
      "Dates artificer to the late 14c. as one who makes by art or skill, with devious-artifice sense around 1600.",
    exact_short_quote: "makes by art or skill",
    sense: "mixed_bridge_sense",
    reliability: "medium",
    access_limitations: "Secondary source.",
    helps_chart_01_directly: true,
  },
  {
    id: "mw_artificial",
    source_name: "Merriam-Webster",
    term: "artificial",
    year: 2026,
    source_type: "dictionary",
    source_url: "https://www.merriam-webster.com/dictionary/artificial",
    short_definition_summary:
      "Modern entry separates human-made/natural-model, insincere/fake, imitation/sham, biological classification, and archaic artful/cunning; etymology ties word to human skill, art, rhetoric, and craft.",
    exact_short_quote: "produced by human skill",
    sense: "mixed_bridge_sense",
    reliability: "high",
    access_limitations: "",
    helps_chart_01_directly: true,
  },
  {
    id: "mw_artifice",
    source_name: "Merriam-Webster",
    term: "artifice",
    year: 2026,
    source_type: "dictionary",
    source_url: "https://www.merriam-webster.com/dictionary/artifice",
    short_definition_summary:
      "Modern entry explicitly gives clever/artful skill and device before trick/false behavior, and explains artifice as both creative skill and falseness/trickery.",
    exact_short_quote: "clever or artful skill",
    sense: "mixed_bridge_sense",
    reliability: "high",
    access_limitations: "",
    helps_chart_01_directly: true,
  },
  {
    id: "mw_artificer",
    source_name: "Merriam-Webster",
    term: "artificer",
    year: 2026,
    source_type: "dictionary",
    source_url: "https://www.merriam-webster.com/dictionary/artificer",
    short_definition_summary:
      "Defines artificer as skilled/artistic worker/craftsman and as one who makes or contrives.",
    exact_short_quote: "skilled or artistic worker",
    sense: "art_skill_making",
    reliability: "high",
    access_limitations: "",
    helps_chart_01_directly: true,
  },
  {
    id: "mw_art",
    source_name: "Merriam-Webster",
    term: "art",
    year: 2026,
    source_type: "dictionary",
    source_url: "https://www.merriam-webster.com/dictionary/art",
    short_definition_summary:
      "Defines art first as acquired skill and also as branch of learning or occupation requiring knowledge/skill.",
    exact_short_quote: "skill acquired by experience",
    sense: "art_skill_making",
    reliability: "high",
    access_limitations: "",
    helps_chart_01_directly: true,
  },
  {
    id: "cambridge_artificial",
    source_name: "Cambridge Dictionary",
    term: "artificial",
    year: 2026,
    source_type: "dictionary",
    source_url: "https://dictionary.cambridge.org/dictionary/english/artificial",
    short_definition_summary:
      "Modern entry separates made-by-people/often-copying-natural from not-sincere; useful boundary evidence, not early evidence.",
    exact_short_quote: "made by people",
    sense: "not_natural",
    reliability: "high",
    access_limitations: "",
    helps_chart_01_directly: false,
  },
  {
    id: "oxford_learners_artificial",
    source_name: "Oxford Learner's Dictionary",
    term: "artificial",
    year: 2026,
    source_type: "dictionary",
    source_url: "https://www.oxfordlearnersdictionaries.com/definition/english/artificial",
    short_definition_summary:
      "Modern learner entry separates copy/not-real, created-by-people/not-natural, and fake/appearance senses; synonym note distinguishes artificial, synthetic, false, man-made, fake, and imitation.",
    exact_short_quote: "not happening naturally",
    sense: "mixed_bridge_sense",
    reliability: "high",
    access_limitations: "",
    helps_chart_01_directly: false,
  },
  {
    id: "johnson_artificial_secondary",
    source_name: "Johnson's Dictionary via Definitions.net",
    term: "artificial",
    year: 1755,
    source_type: "historical_dictionary_secondary_transcription",
    source_url: "https://www.definitions.net/definition/artificial",
    short_definition_summary:
      "Secondary transcription reports Johnson senses: made by art/not natural; fictitious/not genuine; artful/contrived with skill, with examples including artificial day.",
    exact_short_quote: "Made by art; not natural",
    sense: "mixed_bridge_sense",
    reliability: "low",
    access_limitations: "Johnson's own site was not directly extractable; this is a secondary transcription and must be manually verified.",
    helps_chart_01_directly: true,
  },
  {
    id: "johnson_artifice_secondary",
    source_name: "Johnson's Dictionary via Definitions.net",
    term: "artifice",
    year: 1755,
    source_type: "historical_dictionary_secondary_transcription",
    source_url: "https://www.definitions.net/definition/artifice",
    short_definition_summary:
      "Secondary transcription reports Johnson senses: trick/fraud/stratagem and art/trade.",
    exact_short_quote: "Trick; fraud; stratagem",
    sense: "mixed_bridge_sense",
    reliability: "low",
    access_limitations: "Manual Johnson verification required.",
    helps_chart_01_directly: true,
  },
  {
    id: "century_artifice_finedictionary",
    source_name: "Century Dictionary via FineDictionary",
    term: "artifice",
    year: null,
    source_type: "historical_dictionary_secondary_transcription",
    source_url: "https://www.finedictionary.com/artifice",
    short_definition_summary:
      "Secondary transcription of Century Dictionary gives artifice as art of making, skilfully contrived work, artful contrivance/trickery, and crafty device.",
    exact_short_quote: "The art of making",
    sense: "mixed_bridge_sense",
    reliability: "medium",
    access_limitations: "Secondary web transcription; use as support only.",
    helps_chart_01_directly: true,
  },
];

const snippetExtracts = [
  {
    id: "webster_artificial_arguments",
    term_or_phrase: "artificial arguments",
    year: 1828,
    title: "American Dictionary of the English Language",
    author: "Noah Webster",
    source_url: "https://webstersdictionary1828.com/Dictionary/artificial",
    short_paraphrase: "Rhetorical arguments invented by the speaker, contrasted with external authority/testimony.",
    sense: "technical_rule_reckoning",
    confidence: "high",
    useful_for_chart_01: true,
    notes: "Strong technical-rhetorical anchor, but specialized.",
  },
  {
    id: "webster_artificial_lines",
    term_or_phrase: "artificial lines",
    year: 1828,
    title: "American Dictionary of the English Language",
    author: "Noah Webster",
    source_url: "https://webstersdictionary1828.com/Dictionary/artificial",
    short_paraphrase: "Lines on a sector or scale contrived to represent logarithmic sines/tangents for calculation.",
    sense: "technical_rule_reckoning",
    confidence: "high",
    useful_for_chart_01: true,
    notes: "Very good technical-rule evidence; may be too technical for public main text.",
  },
  {
    id: "webster_artificial_numbers",
    term_or_phrase: "artificial numbers",
    year: 1828,
    title: "American Dictionary of the English Language",
    author: "Noah Webster",
    source_url: "https://webstersdictionary1828.com/Dictionary/artificial",
    short_paraphrase: "Artificial numbers are identified with logarithms.",
    sense: "technical_rule_reckoning",
    confidence: "high",
    useful_for_chart_01: true,
    notes: "Compact technical-reckoning evidence.",
  },
  {
    id: "johnson_artificial_day_secondary",
    term_or_phrase: "artificial day",
    year: 1755,
    title: "A Dictionary of the English Language, secondary transcription",
    author: "Samuel Johnson via Definitions.net",
    source_url: "https://www.definitions.net/definition/artificial",
    short_paraphrase: "Johnson transcription includes Sidney example using artificial day, under made by art/not natural sense.",
    sense: "technical_rule_reckoning",
    confidence: "low",
    useful_for_chart_01: true,
    notes: "Must verify against Johnson scan or Johnson site before prominent use.",
  },
  {
    id: "rhetorica_artificial_memory",
    term_or_phrase: "artificial memory",
    year: 0,
    title: "Rhetorica ad Herennium passages on memory",
    author: "Anonymous classical rhetorical text",
    source_url: "https://www.laits.utexas.edu/memoria/Ad_Herennium_Passages.html",
    short_paraphrase: "Distinguishes natural memory from memory strengthened through training and discipline.",
    sense: "technical_rule_reckoning",
    confidence: "medium",
    useful_for_chart_01: true,
    notes: "Conceptually strong for learned technique, but not English first-use evidence.",
  },
  {
    id: "webster_made_by_art_phrase",
    term_or_phrase: "made by art",
    year: 1828,
    title: "American Dictionary of the English Language",
    author: "Noah Webster",
    source_url: "https://webstersdictionary1828.com/Dictionary/artificial",
    short_paraphrase: "Definition places artificial in the made/contrived by art and human skill/labor field.",
    sense: "art_skill_making",
    confidence: "high",
    useful_for_chart_01: true,
    notes: "Phrase is definitional support, not a corpus snippet.",
  },
  {
    id: "etymonline_artificial_day",
    term_or_phrase: "artificial day",
    year: 1400,
    title: "Etymonline artificial",
    author: "Douglas Harper",
    source_url: "https://www.etymonline.com/word/artificial",
    short_paraphrase: "Reports artificial day as daylight span from sunrise to sunset, opposed to a 24-hour natural day.",
    sense: "technical_rule_reckoning",
    confidence: "medium",
    useful_for_chart_01: true,
    notes: "Good pointer; still needs OED or primary quotation.",
  },
];

const anchorReviews = [
  {
    phrase: "artificial day",
    status: "supporting_anchor",
    primary_sense: "technical_rule_reckoning",
    secondary_sense: "not_natural",
    source_count: 3,
    strongest_source: "Etymonline plus Johnson secondary transcription",
    earliest_reliable_year_or_period: "late medieval claimed; 1755 secondary Johnson transcription; Ngram visible 1800",
    ngram_signal: "collected; visible 1800-2019",
    chart_01_usefulness: "supporting",
    confidence: "medium",
    needs_manual_review: true,
    notes: "Semantically excellent but public comprehension and primary attestation need checking.",
  },
  {
    phrase: "artificial memory",
    status: "supporting_anchor",
    primary_sense: "technical_rule_reckoning",
    secondary_sense: "art_skill_making",
    source_count: 2,
    strongest_source: "Rhetorica ad Herennium memory passage",
    earliest_reliable_year_or_period: "classical rhetorical tradition; English chronology unresolved",
    ngram_signal: "collected; visible 1800-2019",
    chart_01_usefulness: "supporting",
    confidence: "medium",
    needs_manual_review: true,
    notes: "Strong for learned technique, weak for English lexical chronology without more snippets.",
  },
  {
    phrase: "artificial arguments",
    status: "strong_anchor",
    primary_sense: "technical_rule_reckoning",
    secondary_sense: "art_skill_making",
    source_count: 2,
    strongest_source: "Webster 1828 artificial entry",
    earliest_reliable_year_or_period: "1828 securely; Johnson needs manual check",
    ngram_signal: "collected in audit check",
    chart_01_usefulness: "supporting",
    confidence: "high",
    needs_manual_review: true,
    notes: "Strong technical-rhetorical sense; manual Johnson/OED check needed before core use.",
  },
  {
    phrase: "artificial lines",
    status: "strong_anchor",
    primary_sense: "technical_rule_reckoning",
    secondary_sense: "contrivance_construction",
    source_count: 1,
    strongest_source: "Webster 1828 artificial entry",
    earliest_reliable_year_or_period: "1828",
    ngram_signal: "collected in audit check",
    chart_01_usefulness: "supporting",
    confidence: "high",
    needs_manual_review: false,
    notes: "Good proof that artificial can mean rule/technical construction, not fake.",
  },
  {
    phrase: "artificial numbers",
    status: "strong_anchor",
    primary_sense: "technical_rule_reckoning",
    secondary_sense: "",
    source_count: 1,
    strongest_source: "Webster 1828 artificial entry",
    earliest_reliable_year_or_period: "1828",
    ngram_signal: "collected in audit check",
    chart_01_usefulness: "supporting",
    confidence: "high",
    needs_manual_review: false,
    notes: "Very compact technical example: logarithms.",
  },
  {
    phrase: "made by art",
    status: "supporting_anchor",
    primary_sense: "art_skill_making",
    secondary_sense: "not_natural",
    source_count: 2,
    strongest_source: "Webster 1828; Ngram",
    earliest_reliable_year_or_period: "1828 dictionary; Ngram visible 1800",
    ngram_signal: "collected; visible",
    chart_01_usefulness: "supporting",
    confidence: "high",
    needs_manual_review: false,
    notes: "Best as a definition phrase rather than standalone historical phrase.",
  },
  {
    phrase: "made by skill",
    status: "background_only",
    primary_sense: "art_skill_making",
    secondary_sense: "",
    source_count: 1,
    strongest_source: "Ngram only in this audit",
    earliest_reliable_year_or_period: "Ngram visible from 1810",
    ngram_signal: "collected but weak",
    chart_01_usefulness: "background",
    confidence: "low",
    needs_manual_review: true,
    notes: "Too generic without dictionary/snippet support.",
  },
  {
    phrase: "human skill",
    status: "supporting_anchor",
    primary_sense: "art_skill_making",
    secondary_sense: "",
    source_count: 2,
    strongest_source: "Webster 1828 definition phrase; Ngram",
    earliest_reliable_year_or_period: "1828 dictionary; Ngram visible 1800",
    ngram_signal: "collected; visible",
    chart_01_usefulness: "supporting",
    confidence: "medium",
    needs_manual_review: false,
    notes: "Useful for paraphrase/support, not a distinctive phrase anchor.",
  },
  {
    phrase: "by art or human skill",
    status: "supporting_anchor",
    primary_sense: "art_skill_making",
    secondary_sense: "contrivance_construction",
    source_count: 2,
    strongest_source: "Webster 1828 and Etymonline artificially",
    earliest_reliable_year_or_period: "1828 secure; early 15c. claimed by Etymonline for artificially",
    ngram_signal: "not collected as exact phrase",
    chart_01_usefulness: "supporting",
    confidence: "medium",
    needs_manual_review: true,
    notes: "Very strong semantically; needs exact-source handling if quoted.",
  },
  {
    phrase: "contrived by art",
    status: "background_only",
    primary_sense: "contrivance_construction",
    secondary_sense: "art_skill_making",
    source_count: 2,
    strongest_source: "Webster 1828 artificial; Merriam-Webster etymology",
    earliest_reliable_year_or_period: "1828 secure; older etymology in modern dictionary",
    ngram_signal: "not collected as exact phrase",
    chart_01_usefulness: "background",
    confidence: "medium",
    needs_manual_review: false,
    notes: "Good bridge wording, but risks making the chart about contrivance rather than art/skill.",
  },
];

const termRoles = [
  ["art", "core_node", "Explains that art means skill/rule/craft, not only fine art.", "art_skill_making", "technical_rule_reckoning", "Webster 1828; Merriam-Webster; Etymonline", "not collected in audit Ngram", "low", "high", "Core semantic root."],
  ["artificial", "core_node", "Main word; strongest dictionary evidence separates art/skill, not-natural, fake, and technical uses.", "mixed_bridge_sense", "not_natural;fake_not_genuine", "Webster 1828; Etymonline; Merriam-Webster", "strong", "medium", "high", "Use with sense boundary labels."],
  ["artificially", "supporting_node", "Direct adverbial evidence for by art/human skill/contrivance.", "art_skill_making", "contrivance_construction", "Etymonline; Webster access note", "strong", "low", "medium", "Good supporting term."],
  ["artifice", "supporting_node", "Shows skill/making and deception branches together.", "mixed_bridge_sense", "art_skill_making;fake_not_genuine", "Etymonline; Webster 1828; Merriam-Webster; Century via FineDictionary", "strong", "high", "high", "Needs careful framing so deception does not swallow skill."],
  ["artificer", "supporting_node", "Agent noun for skilled maker/craftsman.", "art_skill_making", "contrivance_construction", "Webster 1828; Etymonline; Merriam-Webster", "visible", "low", "high", "Likely supporting annotation, not headline."],
  ["artificiality", "background_note", "Mostly useful for later affect/insincerity layer.", "affected_insincere", "art_skill_making", "Etymonline; modern dictionaries", "visible", "medium", "medium", "Do not make it central."],
  ["artful", "background_note", "Shows art-family bridge into cunning.", "mixed_bridge_sense", "contrivance_construction", "Webster 1828 background", "visible", "high", "medium", "Could distract."],
  ["artless", "background_note", "Shows inverse relation between art/skill and sincerity/guile.", "affected_insincere", "art_skill_making", "Webster 1828", "visible", "medium", "medium", "Use only in notes."],
  ["artisan", "background_note", "Craft-worker family term but less direct than artificer.", "art_skill_making", "", "Etymonline; Cambridge/MW possible", "visible", "medium", "medium", "Background only."],
  ["artifact", "background_note", "Thing-made-by-art relation, but later and not needed for core Chart 1.", "art_skill_making", "not_natural", "Etymonline", "visible", "medium", "medium", "Notes only."],
  ["artefact", "background_note", "Variant of artifact; useful only for source context.", "art_skill_making", "not_natural", "Etymonline", "visible", "medium", "medium", "Notes only."],
  ["contrivance", "comparison_only", "Bridge concept for devised construction, but can pull toward suspicion.", "contrivance_construction", "fake_not_genuine", "Merriam-Webster artifice synonym note; Webster artifice", "strong", "high", "medium", "Use sparingly."],
  ["contrived", "comparison_only", "Useful bridge verb/adjective, but risks moralizing.", "contrivance_construction", "fake_not_genuine", "Webster/MW artificial/artifice context", "strong", "high", "medium", "Use as boundary note only."],
  ["technical", "comparison_only", "Good modern paraphrase for rule-based uses, not etymological core.", "technical_rule_reckoning", "", "Ngram only in this audit", "strong", "medium", "medium", "Comparison only."],
  ["mechanical", "comparison_only", "Adjacent craft/skill/machine term, but too broad for Chart 1.", "technical_rule_reckoning", "art_skill_making", "Ngram only in this audit", "strong", "high", "medium", "Avoid unless needed for context."],
].map(([term, recommended_role, reason, primary_sense, secondary_sense, source_support, ngram_support, chart_01_risk, decision_confidence, notes]) => ({
  term,
  recommended_role,
  reason,
  primary_sense,
  secondary_sense,
  source_support,
  ngram_support,
  chart_01_risk,
  decision_confidence,
  notes,
}));

function scoreItem(input: {
  id: string;
  term_or_phrase: string;
  source_name: string;
  source_type: string;
  sense: Chart01Sense;
  source_reliability: number;
  sense_clarity: number;
  historical_value: number;
  chart_01_relevance: number;
  risk_of_misreading: number;
  recommended_use: string;
  notes: string;
}) {
  return {
    ...input,
    total_score:
      input.source_reliability + input.sense_clarity + input.historical_value + input.chart_01_relevance - input.risk_of_misreading,
  };
}

const evidenceScores = [
  scoreItem({ id: "webster_1828_artificial", term_or_phrase: "artificial", source_name: "Webster 1828", source_type: "historical_dictionary", sense: "mixed_bridge_sense", source_reliability: 5, sense_clarity: 5, historical_value: 5, chart_01_relevance: 5, risk_of_misreading: 2, recommended_use: "use_as_core_evidence", notes: "Best public-domain evidence for sense boundaries." }),
  scoreItem({ id: "webster_1828_art", term_or_phrase: "art", source_name: "Webster 1828", source_type: "historical_dictionary", sense: "art_skill_making", source_reliability: 5, sense_clarity: 5, historical_value: 5, chart_01_relevance: 5, risk_of_misreading: 1, recommended_use: "use_as_core_evidence", notes: "Clarifies art as skill/rule/human disposition." }),
  scoreItem({ id: "etymonline_artificial", term_or_phrase: "artificial", source_name: "Etymonline", source_type: "secondary_etymology", sense: "mixed_bridge_sense", source_reliability: 3, sense_clarity: 5, historical_value: 4, chart_01_relevance: 5, risk_of_misreading: 2, recommended_use: "use_as_supporting_evidence", notes: "Strong chronology guide; needs OED for final dates." }),
  scoreItem({ id: "etymonline_artifice", term_or_phrase: "artifice", source_name: "Etymonline", source_type: "secondary_etymology", sense: "mixed_bridge_sense", source_reliability: 3, sense_clarity: 5, historical_value: 4, chart_01_relevance: 5, risk_of_misreading: 3, recommended_use: "use_as_supporting_evidence", notes: "Clean skill-before-trick chronology but secondary." }),
  scoreItem({ id: "webster_1828_artifice", term_or_phrase: "artifice", source_name: "Webster 1828", source_type: "historical_dictionary", sense: "mixed_bridge_sense", source_reliability: 5, sense_clarity: 4, historical_value: 5, chart_01_relevance: 4, risk_of_misreading: 4, recommended_use: "use_as_supporting_evidence", notes: "Important but high risk of modern deception reading." }),
  scoreItem({ id: "webster_1828_artificer", term_or_phrase: "artificer", source_name: "Webster 1828", source_type: "historical_dictionary", sense: "art_skill_making", source_reliability: 5, sense_clarity: 5, historical_value: 5, chart_01_relevance: 4, risk_of_misreading: 2, recommended_use: "use_as_supporting_evidence", notes: "Strong maker/craftsperson evidence." }),
  scoreItem({ id: "mw_artificial", term_or_phrase: "artificial", source_name: "Merriam-Webster", source_type: "dictionary", sense: "mixed_bridge_sense", source_reliability: 5, sense_clarity: 4, historical_value: 3, chart_01_relevance: 4, risk_of_misreading: 2, recommended_use: "use_as_supporting_evidence", notes: "Good etymology and modern sense split." }),
  scoreItem({ id: "johnson_artificial_secondary", term_or_phrase: "artificial", source_name: "Johnson via Definitions.net", source_type: "historical_dictionary_secondary_transcription", sense: "mixed_bridge_sense", source_reliability: 2, sense_clarity: 4, historical_value: 4, chart_01_relevance: 4, risk_of_misreading: 4, recommended_use: "manual_review_before_use", notes: "Potentially excellent once manually verified." }),
  scoreItem({ id: "webster_artificial_lines", term_or_phrase: "artificial lines", source_name: "Webster 1828", source_type: "historical_dictionary", sense: "technical_rule_reckoning", source_reliability: 5, sense_clarity: 5, historical_value: 4, chart_01_relevance: 4, risk_of_misreading: 2, recommended_use: "use_as_supporting_evidence", notes: "Strong technical-rule example." }),
  scoreItem({ id: "webster_artificial_numbers", term_or_phrase: "artificial numbers", source_name: "Webster 1828", source_type: "historical_dictionary", sense: "technical_rule_reckoning", source_reliability: 5, sense_clarity: 5, historical_value: 4, chart_01_relevance: 4, risk_of_misreading: 1, recommended_use: "use_as_supporting_evidence", notes: "Strong and compact." }),
  scoreItem({ id: "rhetorica_artificial_memory", term_or_phrase: "artificial memory", source_name: "Rhetorica ad Herennium", source_type: "book_snippet", sense: "technical_rule_reckoning", source_reliability: 4, sense_clarity: 4, historical_value: 4, chart_01_relevance: 4, risk_of_misreading: 3, recommended_use: "manual_review_before_use", notes: "Great concept; not English lexical chronology." }),
  scoreItem({ id: "cambridge_artificial", term_or_phrase: "artificial", source_name: "Cambridge Dictionary", source_type: "dictionary", sense: "not_natural", source_reliability: 5, sense_clarity: 5, historical_value: 1, chart_01_relevance: 2, risk_of_misreading: 2, recommended_use: "background_only", notes: "Modern boundary evidence only." }),
  scoreItem({ id: "oxford_learners_artificial", term_or_phrase: "artificial", source_name: "Oxford Learner's Dictionary", source_type: "dictionary", sense: "mixed_bridge_sense", source_reliability: 5, sense_clarity: 4, historical_value: 1, chart_01_relevance: 2, risk_of_misreading: 2, recommended_use: "background_only", notes: "Good for synonym boundaries, not early chronology." }),
];

const manualQueue = [
  [1, "OED artificial", "Verify earliest quotations, artificial day, obsolete technical senses, and order of not-natural/fake/insincere branches.", "Oxford English Dictionary", "not accessed", "Full sense tree and earliest quotations", true, "Blocking for final public dates."],
  [1, "OED artifice", "Confirm skill/workmanship vs trick chronology.", "Oxford English Dictionary", "not accessed", "Earliest quotations and sense ordering", true, "Needed if artifice is visible."],
  [1, "OED artificer", "Confirm maker/craftsperson dating and devious-artifice branch.", "Oxford English Dictionary", "not accessed", "Earliest quotations and sense history", true, "Needed if artificer is visible."],
  [1, "Johnson artificial", "Directly verify secondary transcription and examples.", "Johnson's Dictionary Online or scan", "secondary transcription only", "Made by art/not natural; fictitious; artful; examples", true, "Potentially a strong 1755 bridge."],
  [2, "Johnson artifice", "Directly verify trick/fraud and art/trade senses.", "Johnson's Dictionary Online or scan", "secondary transcription only", "Exact Johnson entry order", false, "Important but not blocking if Webster is used."],
  [2, "Johnson artificer", "Check whether entry gives skilled maker or mostly inventor/mechanic.", "Johnson's Dictionary Online or scan", "not verified", "Direct entry text", false, "Useful if artificer appears."],
  [1, "artificial day snippet", "Need primary or OED quotation before treating as early anchor.", "OED / Google Books / EEBO / Johnson", "secondary evidence only", "Dated quotation with context", true, "Semantically strong but obscure."],
  [2, "artificial memory snippet", "Need English historical example if used as lexical anchor.", "Google Books / IA / rhetoric texts", "conceptual classical source collected", "English quotation or clear scholarly bridge", false, "Use as learned-technique support until verified."],
  [2, "artificial arguments / lines / numbers", "Verify whether Webster examples trace to Johnson or technical dictionaries.", "Johnson / Webster / public-domain rhetoric/math texts", "Webster verified", "Additional dated examples", false, "Webster may be enough for support."],
  [1, "Webster 1828 as fallback", "Decide whether Webster is sufficient if OED is unavailable.", "Internal editorial review", "likely sufficient for public-domain fallback", "Fallback evidence policy", true, "Can support sense boundaries, not earliest dates."],
  [3, "Century Dictionary artificial", "Try direct scan or source beyond FineDictionary.", "Century Dictionary scan / Wordnik / FineDictionary", "not directly verified", "Historical dictionary support", false, "Optional support."],
].map(([priority, item, why_check, source_to_check, current_status, expected_value, blocking_for_chart_01, notes]) => ({
  priority,
  item,
  why_check,
  source_to_check,
  current_status,
  expected_value,
  blocking_for_chart_01,
  notes,
}));

function csvValue(value: unknown) {
  if (value === null || value === undefined) return "";
  const text = String(value);
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function csvRows(headers: string[], rows: Array<Record<string, unknown>>) {
  return [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => csvValue(row[header])).join(",")),
  ].join("\n");
}

function batch<T>(items: T[], size: number) {
  const groups: T[][] = [];
  for (let index = 0; index < items.length; index += size) groups.push(items.slice(index, index + size));
  return groups;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function canonical(value: string) {
  return value.toLowerCase().replace(/\s*\(all\)$/i, "").replace(/\s+/g, " ").trim();
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

function preferAggregateRows(rows: NgramResponse[]) {
  const map = new Map<string, NgramResponse>();
  for (const row of rows) {
    const key = canonical(row.ngram);
    const existing = map.get(key);
    const isAggregate = /\(all\)$/i.test(row.ngram);
    const existingIsAggregate = existing ? /\(all\)$/i.test(existing.ngram) : false;
    if (!existing || (isAggregate && !existingIsAggregate)) map.set(key, row);
  }
  return map;
}

async function collectNgram() {
  const rows: Array<Record<string, unknown>> = [];
  const urls: string[] = [];
  const statuses: Record<string, { status: string; first: number | null; peakYear: number | null; peakValue: number }> = {};
  const errors: string[] = [];

  for (const terms of batch(ngramTerms, BATCH_SIZE)) {
    const url = ngramUrl(terms);
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      const responseRows = (await response.json()) as NgramResponse[];
      urls.push(url.toString());
      const map = preferAggregateRows(responseRows);

      for (const term of terms) {
        const result = map.get(canonical(term));
        if (!result) {
          statuses[term] = { status: "missing", first: null, peakYear: null, peakValue: 0 };
          continue;
        }
        const values = result.timeseries.map((value, index) => ({
          year: START_YEAR + index,
          term,
          value,
          source: "Google Books Ngram Viewer",
          corpus: CORPUS,
          smoothing: SMOOTHING,
          case_sensitive: !CASE_INSENSITIVE,
        }));
        rows.push(...values);
        const nonZero = values.filter((item) => Number(item.value) > 0);
        const peak = values.reduce(
          (best, item) => (Number(item.value) > Number(best.value) ? item : best),
          { year: null as number | null, value: 0 },
        );
        statuses[term] = {
          status: nonZero.length === 0 ? "missing" : nonZero.length <= 3 ? "too_sparse" : "collected",
          first: Number(nonZero[0]?.year) || null,
          peakYear: Number(peak.year) || null,
          peakValue: Number(peak.value),
        };
      }
    } catch (error) {
      errors.push(`${url.toString()}: ${error instanceof Error ? error.message : String(error)}`);
      for (const term of terms) statuses[term] = { status: "error", first: null, peakYear: null, peakValue: 0 };
    }
    await sleep(REQUEST_DELAY_MS);
  }
  return { rows, statuses, urls, errors };
}

async function main() {
  const generatedAt = new Date().toISOString();
  await Promise.all([RAW_DIR, PROCESSED_DIR, NOTES_DIR, SOURCES_DIR].map((dir) => mkdir(dir, { recursive: true })));
  const ngram = await collectNgram();

  await writeFile(path.join(RAW_DIR, "chart_01_audit_dictionary_extracts.json"), `${JSON.stringify(dictionaryExtracts, null, 2)}\n`);
  await writeFile(
    path.join(RAW_DIR, "chart_01_audit_snippet_extracts.csv"),
    `${csvRows(
      ["id", "term_or_phrase", "year", "title", "author", "source_url", "short_paraphrase", "sense", "confidence", "useful_for_chart_01", "notes"],
      snippetExtracts,
    )}\n`,
  );
  await writeFile(
    path.join(RAW_DIR, "chart_01_audit_ngram_check.csv"),
    `${csvRows(["year", "term", "value", "source", "corpus", "smoothing", "case_sensitive"], ngram.rows)}\n`,
  );

  await writeFile(
    path.join(PROCESSED_DIR, "chart_01_sense_boundary_matrix.csv"),
    `${csvRows(
      ["sense", "definition", "core_terms", "example_phrases", "strongest_sources", "earliest_confirmed_or_claimed_period", "confidence", "notes"],
      senseDefinitions,
    )}\n`,
  );
  await writeFile(
    path.join(PROCESSED_DIR, "chart_01_anchor_phrase_review.csv"),
    `${csvRows(
      [
        "phrase",
        "status",
        "primary_sense",
        "secondary_sense",
        "source_count",
        "strongest_source",
        "earliest_reliable_year_or_period",
        "ngram_signal",
        "chart_01_usefulness",
        "confidence",
        "needs_manual_review",
        "notes",
      ],
      anchorReviews,
    )}\n`,
  );
  await writeFile(
    path.join(PROCESSED_DIR, "chart_01_term_role_decisions.csv"),
    `${csvRows(
      [
        "term",
        "recommended_role",
        "reason",
        "primary_sense",
        "secondary_sense",
        "source_support",
        "ngram_support",
        "chart_01_risk",
        "decision_confidence",
        "notes",
      ],
      termRoles,
    )}\n`,
  );
  await writeFile(
    path.join(PROCESSED_DIR, "chart_01_evidence_strength_scores.csv"),
    `${csvRows(
      [
        "id",
        "term_or_phrase",
        "source_name",
        "source_type",
        "sense",
        "source_reliability",
        "sense_clarity",
        "historical_value",
        "chart_01_relevance",
        "risk_of_misreading",
        "total_score",
        "recommended_use",
        "notes",
      ],
      evidenceScores,
    )}\n`,
  );
  await writeFile(
    path.join(PROCESSED_DIR, "chart_01_manual_verification_queue.csv"),
    `${csvRows(
      ["priority", "item", "why_check", "source_to_check", "current_status", "expected_value", "blocking_for_chart_01", "notes"],
      manualQueue,
    )}\n`,
  );

  await writeFile(
    path.join(SOURCES_DIR, "source_urls.md"),
    `# Audit Round 03 Source URLs

- Webster 1828 artificial: https://webstersdictionary1828.com/Dictionary/artificial
- Webster 1828 art: https://webstersdictionary1828.com/Dictionary/art
- Webster 1828 artifice: https://webstersdictionary1828.com/Dictionary/artifice
- Webster 1828 artificer: https://webstersdictionary1828.com/Dictionary/artificer
- Webster 1828 artless: https://webstersdictionary1828.com/Dictionary/artless
- Etymonline artificial: https://www.etymonline.com/word/artificial
- Etymonline artificially: https://www.etymonline.com/word/artificially
- Etymonline artifice: https://www.etymonline.com/word/artifice
- Etymonline artificer: https://www.etymonline.com/word/artificer
- Merriam-Webster artificial: https://www.merriam-webster.com/dictionary/artificial
- Merriam-Webster artifice: https://www.merriam-webster.com/dictionary/artifice
- Merriam-Webster artificer: https://www.merriam-webster.com/dictionary/artificer
- Merriam-Webster art: https://www.merriam-webster.com/dictionary/art
- Cambridge artificial: https://dictionary.cambridge.org/dictionary/english/artificial
- Oxford Learner's artificial: https://www.oxfordlearnersdictionaries.com/definition/english/artificial
- Johnson secondary transcription artificial: https://www.definitions.net/definition/artificial
- Johnson secondary transcription artifice: https://www.definitions.net/definition/artifice
- Century secondary transcription artifice: https://www.finedictionary.com/artifice
- Rhetorica ad Herennium memory passage: https://www.laits.utexas.edu/memoria/Ad_Herennium_Passages.html
`,
  );

  const ngramCollected = Object.values(ngram.statuses).filter((status) => status.status === "collected").length;
  await writeFile(
    path.join(NOTES_DIR, "chart_01_audit_collection_log.md"),
    `# Chart 1 Audit Round 03 Collection Log

Generated: ${generatedAt}

## Scope

Chart 1 evidence audit and sense-boundary pass only. No visualization, layout, React work, or final page copy.

## Script

- \`scripts/audit_chart_01_art_artifice_round_03.ts\`

## Output Root

- \`docs/research/artificial/chart_01_art_artifice/audit_round_03\`

## Sources Checked

- Webster 1828: artificial, artificially attempted, art, artifice, artificer, artless
- Etymonline: artificial, artificially, artifice, artificer
- Merriam-Webster: artificial, artifice, artificer, art
- Cambridge Dictionary: artificial
- Oxford Learner's Dictionary: artificial
- Johnson's Dictionary Online: direct extraction still not stable; secondary transcriptions checked via Definitions.net
- Century Dictionary: checked through FineDictionary secondary transcription for artifice
- Rhetorica ad Herennium memory passage
- Google Books Ngram JSON endpoint

## Ngram Check

- Terms attempted: ${ngramTerms.length}
- Terms collected: ${ngramCollected}
- Terms non-collected: ${ngramTerms.length - ngramCollected}
- Corpus: ${CORPUS}
- Range: ${START_YEAR}-${END_YEAR}
- Smoothing: ${SMOOTHING}
- Case-insensitive: ${CASE_INSENSITIVE}

## Ngram Request URLs

${ngram.urls.map((url) => `- ${url}`).join("\n")}

## Failures / Limitations

${ngram.errors.length ? ngram.errors.map((error) => `- ${error}`).join("\n") : "- No Ngram request errors."}
- OED was not accessed.
- Johnson direct entries remain manual-verification items.
- Webster 1828 artificially direct page returned intermittently in web tooling.
- Definitions.net and FineDictionary are secondary transcriptions and should not be treated as primary Johnson/Century proof.

## Assumptions

- Ngram is used only as visibility evidence.
- Short exact quotes are kept brief; most dictionary content is paraphrased.
- Evidence readiness does not equal final chart selection.
`,
  );

  await writeFile(
    path.join(NOTES_DIR, "chart_01_audit_source_notes.md"),
    `# Chart 1 Audit Round 03 Source Notes

Generated: ${generatedAt}

## Highest-Value Sources

- Webster 1828 is the best accessible public-domain checkpoint for this audit because it explicitly separates art/skill, not-natural, fake/not-genuine, and technical-rhetorical senses.
- Etymonline is the strongest compact chronology source, but its dates should be treated as claims to verify against OED or primary texts.
- Merriam-Webster is strong for modern definitions and etymology, especially the art/skill/facere chain and artifice as both skill and falseness.

## Boundary Sources

- Cambridge and Oxford Learner's are useful mostly for modern distinctions among made-by-people, copy of nature, fake, and insincere.
- Webster artless helps show that art-family vocabulary can invert into sincerity/guile distinctions.

## Manual Sources Still Needed

- OED full entries for artificial, artifice, artificer.
- Direct Johnson entries for artificial, artifice, artificer.
- Primary snippets for artificial day and artificial memory if either becomes a visible anchor.
`,
  );

  await writeFile(
    path.join(NOTES_DIR, "chart_01_sense_boundary_review.md"),
    `# Chart 1 Sense Boundary Review

Generated: ${generatedAt}

## 1. What "Made By Art / Skill" Means

In the strongest sources, art means learned skill, rule-governed practice, craft, and human technique. Webster 1828 art and artificial make this especially clear: art can stand opposite nature without implying deceit. Merriam-Webster and Etymonline both preserve the art/skill/making root through ars, artificium, artifex, and facere.

## 2. Why "Not Natural" Is Not The Same As "Fake"

Not natural can mean made by people, rule-made, or produced by skill. Webster 1828 artificial places the art/human-skill sense before fictitious/not-genuine. Modern dictionaries often place copy-of-nature and fake/insincere senses near each other, so Chart 1 must keep those labels separate.

## 3. How "Contrivance" Bridges Skill And Suspicion

Contrivance can mean devised or constructed with skill. It can also lean toward trickery. Artifice is the clearest bridge: Webster 1828 says good or bad sense; Merriam-Webster gives clever skill/device before trick/false behavior. This bridge is important but risky.

## 4. What "Artificially" Contributes

Artificially is useful because Etymonline directly glosses it as by art or human skill and contrivance. It supports the adverbial action layer: something is done according to art, skill, technique, or deliberate construction.

## 5. What "Artificer" Contributes

Artificer gives the maker figure. Webster 1828 and Merriam-Webster both foreground skilled/artistic worker or craftsman before broader contriver/deviser meanings. It helps Chart 1 if used as supporting evidence, not necessarily as a major node.

## 6. What "Artifice" Contributes

Artifice contributes both the strongest root evidence and the largest risk. Etymonline and Merriam-Webster support workmanship/craft/skill, while Webster and modern definitions also expose trick/fraud/false behavior. Use it as a bridge, not as pure deception.

## 7. Whether Technical Anchors Are Useful

Artificial arguments, artificial lines, and artificial numbers are strong Webster-backed examples of rule-based technical senses. Artificial day is semantically valuable but still needs OED or primary verification. Artificial memory is conceptually strong for learned technique, but English lexical chronology is not yet settled.

## 8. What Evidence Is Still Too Uncertain

OED and Johnson remain the main missing checks. Artificial day should not be used prominently without primary/OED support. Artificial memory should not be presented as an English first-use anchor without more dated English evidence. Ngram first-visible years should not be treated as attestations.
`,
  );

  await writeFile(
    path.join(NOTES_DIR, "chart_01_chart_readiness_review.md"),
    `# Chart 1 Chart Readiness Review

Generated: ${generatedAt}

## 1. Evidence Ready To Use

- supported: Webster 1828 artificial as a public-domain sense-boundary checkpoint.
- supported: Webster 1828 art as evidence that art means human skill/rule/craft.
- supported: Webster 1828 artifice/artificer as supporting family evidence, with careful bridge labeling.
- supported: Webster artificial lines/numbers/arguments as technical-rule examples.

## 2. Promising But Needs Manual Verification

- partially_supported: artificial day as technical/reckoning anchor.
- partially_supported: artificial memory as learned-technique anchor.
- partially_supported: Johnson artificial/artifice/artificer.
- partially_supported: OED chronology for artificial and artifice.

## 3. Evidence That Should Stay In Notes Only

- artful/artless, artisan, artifact/artefact, technical, mechanical.
- Ngram-only phrases such as made by skill.
- Modern Cambridge/Oxford Learner's definitions, except as boundary support.

## 4. Claims That Are Supported

- supported: "Artificial relates to art, skill, and making."
- supported: "Artificial does not mean simply fake."
- supported: "Not natural and fake are related but distinct senses."
- supported: "Contrivance bridges skill and suspicion."
- partially_supported: "Artificial arguments/lines/numbers show rule-based technical senses."

## 5. Claims Not Yet Supported

- not_supported_yet: "Artificial day is a broadly legible public anchor."
- partially_supported: "Artificial memory is an early English artificial phrase."
- too_risky: "Artifice and artificer must both be visible in Chart 1."
- too_risky: "The exact earliest sense order is settled without OED."

## 6. Minimum Remaining Work Before Visual Planning

1. Check OED artificial/artifice/artificer.
2. Verify Johnson artificial/artifice entries directly.
3. Decide whether Webster 1828 is sufficient fallback if OED access is unavailable.
4. Confirm whether artificial day or artificial memory should be visible anchors or notes-only evidence.
`,
  );

  await writeFile(
    path.join(NOTES_DIR, "chart_01_claims_to_avoid.md"),
    `# Chart 1 Claims To Avoid

Generated: ${generatedAt}

- Do not claim artificial was originally positive in a simple moral sense.
- Do not claim artificial only later became opposed to nature unless the timeline is verified.
- Do not claim artificial day is widely understandable without explanation.
- Do not equate artifice only with deception.
- Do not equate not natural with fake.
- Do not use modern AI meanings in Chart 1.
- Do not treat Ngram first-visible years as earliest attestations.
- Do not overstate OED evidence if OED was not accessed.
- Do not present Johnson evidence as directly verified until the original entry or scan is checked.
- Do not make artificial memory an English earliest-use anchor from classical rhetoric alone.
- Do not let contrivance take over the chart as if the root story were primarily suspicion.
- Do not use modern learner dictionaries as evidence for medieval or early-modern chronology.
`,
  );

  console.log(`Audit round 03 complete.
Ngram terms attempted: ${ngramTerms.length}
Ngram terms collected: ${ngramCollected}
Dictionary extracts: ${dictionaryExtracts.length}
Snippet extracts: ${snippetExtracts.length}`);
}

await main();
