import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const BASE_DIR = path.join(process.cwd(), "docs", "research", "artificial", "chart_01_art_artifice");
const RAW_DIR = path.join(BASE_DIR, "raw");
const PROCESSED_DIR = path.join(BASE_DIR, "processed");
const NOTES_DIR = path.join(BASE_DIR, "notes");
const SOURCES_DIR = path.join(BASE_DIR, "sources");

const START_YEAR = 1800;
const END_YEAR = 2019;
const CORPUS = "en";
const SMOOTHING = 0;
const CASE_INSENSITIVE = true;
const SOURCE = "Google Books Ngram Viewer";
const ENDPOINT = "https://books.google.com/ngrams/json";
const BATCH_SIZE = 8;
const REQUEST_DELAY_MS = 350;

type Chart01ArtificialSense =
  | "art_skill_making"
  | "technical_rule_reckoning"
  | "contrivance_construction"
  | "not_natural"
  | "imitation_substitute"
  | "fake_not_genuine"
  | "affected_insincere"
  | "unclear_or_mixed";

type SourceType =
  | "dictionary"
  | "historical_dictionary"
  | "corpus_snippet"
  | "book_snippet"
  | "ngram"
  | "secondary_etymology";

type EvidenceKind = "definition" | "attestation" | "snippet" | "frequency_signal" | "etymology" | "usage_example";
type Confidence = "high" | "medium" | "low";
type ChartUsefulness = "core" | "supporting" | "background" | "exclude" | "needs_review";

type NgramResponse = {
  ngram: string;
  parent?: string;
  type?: string;
  timeseries: number[];
};

type NgramPoint = {
  year: number;
  term: string;
  value: number;
  source: string;
  corpus: string;
  smoothing: number;
  case_sensitive: boolean;
  query_group: string;
};

const ngramTerms = [
  { term: "artificial", query_group: "primary_chart_01_term" },
  { term: "artificially", query_group: "primary_chart_01_term" },
  { term: "artifice", query_group: "primary_chart_01_term" },
  { term: "artificer", query_group: "primary_chart_01_term" },
  { term: "artificiality", query_group: "secondary_word_family" },
  { term: "artful", query_group: "secondary_word_family" },
  { term: "artless", query_group: "secondary_word_family" },
  { term: "artisan", query_group: "secondary_word_family" },
  { term: "artifact", query_group: "secondary_word_family" },
  { term: "artefact", query_group: "secondary_word_family" },
  { term: "contrivance", query_group: "conceptual_comparator" },
  { term: "contrived", query_group: "conceptual_comparator" },
  { term: "technical", query_group: "conceptual_comparator" },
  { term: "mechanical", query_group: "conceptual_comparator" },
  { term: "made by art", query_group: "phrase_candidate" },
  { term: "made by skill", query_group: "phrase_candidate" },
  { term: "human skill", query_group: "phrase_candidate" },
  { term: "artificial work", query_group: "phrase_candidate" },
  { term: "artificial method", query_group: "phrase_candidate" },
  { term: "artificial system", query_group: "phrase_candidate" },
  { term: "artificial memory", query_group: "phrase_candidate" },
  { term: "artificial day", query_group: "phrase_candidate" },
] as const;

const dictionarySources = [
  {
    id: "etymonline_art",
    source_name: "Etymonline",
    url: "https://www.etymonline.com/word/art",
    entry_term: "art",
    source_type: "secondary_etymology",
    definition_summary:
      "Traces art to skill from learning/practice, scholarship/learning, human workmanship opposed to nature, and systems of rules.",
    earliest_date: "early 13c. for skill from learning or practice",
    sense_categories: ["art_skill_making", "technical_rule_reckoning"],
    supports: {
      made_by_art_skill: true,
      not_natural: true,
      imitation_substitute: false,
      contrived: false,
      fake_not_genuine: false,
      insincere_affected: false,
    },
    reliability_note: "Useful secondary etymology for art as skill/rule/workmanship, rather than only fine art.",
    access_limitation: null,
  },
  {
    id: "etymonline_artificial",
    source_name: "Etymonline",
    url: "https://www.etymonline.com/word/artificial",
    entry_term: "artificial",
    source_type: "secondary_etymology",
    definition_summary:
      "Traces artificial to Latin artificialis and artificium, with art, skill, theory/system, and maker roots; separates early human-skill sense from later imitation and negative senses.",
    earliest_date: "late 14c. for early English layer; early 15c. for made by human skill/labor",
    sense_categories: [
      "art_skill_making",
      "technical_rule_reckoning",
      "contrivance_construction",
      "not_natural",
      "imitation_substitute",
      "fake_not_genuine",
      "affected_insincere",
    ],
    supports: {
      made_by_art_skill: true,
      not_natural: true,
      imitation_substitute: true,
      contrived: true,
      fake_not_genuine: true,
      insincere_affected: true,
    },
    reliability_note: "Useful secondary etymology and semantic chronology; verify exact earliest quotations with OED or primary texts before final copy.",
    access_limitation: null,
  },
  {
    id: "etymonline_artifice",
    source_name: "Etymonline",
    url: "https://www.etymonline.com/word/artifice",
    entry_term: "artifice",
    source_type: "secondary_etymology",
    definition_summary:
      "Frames artifice first as workmanship and making by craft or skill, with trick/device sense developing later.",
    earliest_date: "1530s for workmanship/making by craft or skill; 1650s for crafty device/trick",
    sense_categories: ["art_skill_making", "contrivance_construction", "fake_not_genuine"],
    supports: {
      made_by_art_skill: true,
      not_natural: false,
      imitation_substitute: false,
      contrived: true,
      fake_not_genuine: true,
      insincere_affected: false,
    },
    reliability_note: "Strong for relation between art, artifice, and artificer; still secondary rather than primary quotation evidence.",
    access_limitation: null,
  },
  {
    id: "etymonline_artificer",
    source_name: "Etymonline",
    url: "https://www.etymonline.com/word/artificer",
    entry_term: "artificer",
    source_type: "secondary_etymology",
    definition_summary:
      "Gives artificer as an agent noun for one who makes by art or skill, with a later devious-artifice branch.",
    earliest_date: "late 14c.",
    sense_categories: ["art_skill_making", "contrivance_construction"],
    supports: {
      made_by_art_skill: true,
      not_natural: false,
      imitation_substitute: false,
      contrived: true,
      fake_not_genuine: false,
      insincere_affected: false,
    },
    reliability_note: "Strong word-family support for the maker/craftsperson layer.",
    access_limitation: null,
  },
  {
    id: "etymonline_artificiality",
    source_name: "Etymonline",
    url: "https://www.etymonline.com/word/artificiality",
    entry_term: "artificiality",
    source_type: "secondary_etymology",
    definition_summary:
      "Records artificiality as appearance of art and insincerity, with artificialness as an earlier related form.",
    earliest_date: "1763 for artificiality; 1590s for artificialness",
    sense_categories: ["art_skill_making", "affected_insincere"],
    supports: {
      made_by_art_skill: true,
      not_natural: false,
      imitation_substitute: false,
      contrived: false,
      fake_not_genuine: false,
      insincere_affected: true,
    },
    reliability_note: "Useful for the abstract-noun bridge from appearance of art to insincerity.",
    access_limitation: null,
  },
  {
    id: "etymonline_artisan",
    source_name: "Etymonline",
    url: "https://www.etymonline.com/word/artisan",
    entry_term: "artisan",
    source_type: "secondary_etymology",
    definition_summary:
      "Frames artisan as one skilled in a mechanical art or craftsman, from the same art/skill family.",
    earliest_date: "1530s",
    sense_categories: ["art_skill_making"],
    supports: {
      made_by_art_skill: true,
      not_natural: false,
      imitation_substitute: false,
      contrived: false,
      fake_not_genuine: false,
      insincere_affected: false,
    },
    reliability_note: "Background word-family evidence only; less direct than artificer.",
    access_limitation: null,
  },
  {
    id: "etymonline_artifact",
    source_name: "Etymonline",
    url: "https://www.etymonline.com/word/artifact",
    entry_term: "artifact",
    source_type: "secondary_etymology",
    definition_summary:
      "Gives artefact/artifact as an artificial production or thing made/modified by human art, from arte plus factum.",
    earliest_date: "1821 for artefact; 1884 for artifact spelling",
    sense_categories: ["art_skill_making", "not_natural"],
    supports: {
      made_by_art_skill: true,
      not_natural: true,
      imitation_substitute: false,
      contrived: false,
      fake_not_genuine: false,
      insincere_affected: false,
    },
    reliability_note: "Useful background evidence for thing-made-by-skill; not central to artificial's earliest layer.",
    access_limitation: null,
  },
  {
    id: "webster_1828_artificial",
    source_name: "Webster 1828",
    url: "https://webstersdictionary1828.com/Dictionary/artificial",
    entry_term: "artificial",
    source_type: "historical_dictionary",
    definition_summary:
      "Defines artificial first as made or contrived by art, human skill, and labor, opposed to natural; also gives fictitious/not genuine and technical examples.",
    earliest_date: "1828 dictionary snapshot",
    sense_categories: [
      "art_skill_making",
      "technical_rule_reckoning",
      "not_natural",
      "fake_not_genuine",
      "contrivance_construction",
    ],
    supports: {
      made_by_art_skill: true,
      not_natural: true,
      imitation_substitute: false,
      contrived: true,
      fake_not_genuine: true,
      insincere_affected: false,
    },
    reliability_note: "High-value historical dictionary evidence; public-domain definition reproduced online.",
    access_limitation: null,
  },
  {
    id: "webster_1828_art",
    source_name: "Webster 1828",
    url: "https://webstersdictionary1828.com/Dictionary/art",
    entry_term: "art",
    source_type: "historical_dictionary",
    definition_summary:
      "Defines art around human skill, rule-governed practice, mechanic and liberal arts, and skill acquired by experience or study.",
    earliest_date: "1828 dictionary snapshot",
    sense_categories: ["art_skill_making", "technical_rule_reckoning"],
    supports: {
      made_by_art_skill: true,
      not_natural: true,
      imitation_substitute: false,
      contrived: false,
      fake_not_genuine: false,
      insincere_affected: false,
    },
    reliability_note: "Useful historical support for art as skill/rules rather than only fine art.",
    access_limitation: null,
  },
  {
    id: "webster_1828_artifice",
    source_name: "Webster 1828",
    url: "https://webstersdictionary1828.com/Dictionary/artifice",
    entry_term: "artifice",
    source_type: "historical_dictionary",
    definition_summary:
      "Defines artifice as an artful or ingenious device that may be good or bad, and separately as art/trade/skill by practice.",
    earliest_date: "1828 dictionary snapshot",
    sense_categories: ["art_skill_making", "contrivance_construction", "fake_not_genuine"],
    supports: {
      made_by_art_skill: true,
      not_natural: false,
      imitation_substitute: false,
      contrived: true,
      fake_not_genuine: true,
      insincere_affected: false,
    },
    reliability_note: "Good evidence that artifice was already mixed in 1828: skill/ingenuity plus possible trickery.",
    access_limitation: null,
  },
  {
    id: "webster_1828_artificer",
    source_name: "Webster 1828",
    url: "https://webstersdictionary1828.com/Dictionary/artificer",
    entry_term: "artificer",
    source_type: "historical_dictionary",
    definition_summary:
      "Defines artificer as artist, mechanic, manufacturer, or maker whose work requires skill or specialized knowledge; also notes contriving/deceptive uses.",
    earliest_date: "1828 dictionary snapshot",
    sense_categories: ["art_skill_making", "contrivance_construction", "fake_not_genuine"],
    supports: {
      made_by_art_skill: true,
      not_natural: false,
      imitation_substitute: false,
      contrived: true,
      fake_not_genuine: true,
      insincere_affected: false,
    },
    reliability_note: "Strong agent-noun evidence for the skilled maker behind artificial.",
    access_limitation: null,
  },
  {
    id: "webster_1828_artificially",
    source_name: "Webster 1828",
    url: "https://webstersdictionary1828.com/Dictionary/artificially",
    entry_term: "artificially",
    source_type: "historical_dictionary",
    definition_summary:
      "Defines artificially as by art or human skill and contrivance, with art/ingenuity as a positive technical mode.",
    earliest_date: "1828 dictionary snapshot",
    sense_categories: ["art_skill_making", "contrivance_construction"],
    supports: {
      made_by_art_skill: true,
      not_natural: false,
      imitation_substitute: false,
      contrived: true,
      fake_not_genuine: false,
      insincere_affected: false,
    },
    reliability_note: "Direct support for the adverbial skill/contrivance sense.",
    access_limitation: null,
  },
  {
    id: "webster_1828_artful",
    source_name: "Webster 1828",
    url: "https://webstersdictionary1828.com/Home?word=artful",
    entry_term: "artful",
    source_type: "historical_dictionary",
    definition_summary:
      "Separates artful as performed with art or skill from cunning/stratagem, noting the latter as the most usual sense.",
    earliest_date: "1828 dictionary snapshot",
    sense_categories: ["art_skill_making", "not_natural", "contrivance_construction", "fake_not_genuine"],
    supports: {
      made_by_art_skill: true,
      not_natural: true,
      imitation_substitute: false,
      contrived: true,
      fake_not_genuine: true,
      insincere_affected: false,
    },
    reliability_note: "Useful background for how art-family words can carry both skill and cunning.",
    access_limitation: null,
  },
  {
    id: "webster_1828_artless",
    source_name: "Webster 1828",
    url: "https://webstersdictionary1828.com/Dictionary/artless",
    entry_term: "artless",
    source_type: "historical_dictionary",
    definition_summary:
      "Defines artless both as lacking art/skill and as free from guile, craft, or stratagem.",
    earliest_date: "1828 dictionary snapshot",
    sense_categories: ["art_skill_making", "affected_insincere", "fake_not_genuine"],
    supports: {
      made_by_art_skill: true,
      not_natural: false,
      imitation_substitute: false,
      contrived: false,
      fake_not_genuine: true,
      insincere_affected: true,
    },
    reliability_note: "Background evidence for art-family polarity: art can mean skill, but artlessness can mean sincerity.",
    access_limitation: null,
  },
  {
    id: "webster_1828_craft",
    source_name: "Webster 1828",
    url: "https://webstersdictionary1828.com/Dictionary/craft",
    entry_term: "craft",
    source_type: "historical_dictionary",
    definition_summary:
      "Defines craft as art, ability, dexterity, and skill, while also recording cunning/deceitful uses.",
    earliest_date: "1828 dictionary snapshot",
    sense_categories: ["art_skill_making", "contrivance_construction", "fake_not_genuine"],
    supports: {
      made_by_art_skill: true,
      not_natural: false,
      imitation_substitute: false,
      contrived: true,
      fake_not_genuine: true,
      insincere_affected: false,
    },
    reliability_note: "Background support for the skill/craft-to-cunning semantic field.",
    access_limitation: null,
  },
  {
    id: "merriam_webster_artificial",
    source_name: "Merriam-Webster",
    url: "https://www.merriam-webster.com/dictionary/artificial",
    entry_term: "artificial",
    source_type: "dictionary",
    definition_summary:
      "Modern entry keeps made-by-humans and not-genuine/sincere senses, and etymology links artificial to skill, artistry, craft, and making.",
    earliest_date: "15th century first known use",
    sense_categories: ["art_skill_making", "not_natural", "imitation_substitute", "fake_not_genuine", "affected_insincere"],
    supports: {
      made_by_art_skill: true,
      not_natural: true,
      imitation_substitute: true,
      contrived: true,
      fake_not_genuine: true,
      insincere_affected: true,
    },
    reliability_note: "High-quality modern dictionary and etymology; not a substitute for OED sense ordering.",
    access_limitation: null,
  },
  {
    id: "merriam_webster_artifice",
    source_name: "Merriam-Webster",
    url: "https://www.merriam-webster.com/dictionary/artifice",
    entry_term: "artifice",
    source_type: "dictionary",
    definition_summary:
      "Defines artifice as clever/artful skill and device, but also trick and false or insincere behavior; etymology ties it to art, craft, craftiness, and making.",
    earliest_date: "1540 first known use",
    sense_categories: ["art_skill_making", "contrivance_construction", "fake_not_genuine", "affected_insincere"],
    supports: {
      made_by_art_skill: true,
      not_natural: false,
      imitation_substitute: false,
      contrived: true,
      fake_not_genuine: true,
      insincere_affected: true,
    },
    reliability_note: "Strong modern sense split showing artifice as both skill and deceptive device.",
    access_limitation: null,
  },
  {
    id: "merriam_webster_artificer",
    source_name: "Merriam-Webster",
    url: "https://www.merriam-webster.com/dictionary/artificer",
    entry_term: "artificer",
    source_type: "dictionary",
    definition_summary:
      "Defines artificer as skilled/artistic worker or craftsman, and as one who makes or contrives.",
    earliest_date: null,
    sense_categories: ["art_skill_making", "contrivance_construction"],
    supports: {
      made_by_art_skill: true,
      not_natural: false,
      imitation_substitute: false,
      contrived: true,
      fake_not_genuine: false,
      insincere_affected: false,
    },
    reliability_note: "Good modern confirmation of maker/craftsperson sense.",
    access_limitation: null,
  },
  {
    id: "merriam_webster_art",
    source_name: "Merriam-Webster",
    url: "https://www.merriam-webster.com/dictionary/art",
    entry_term: "art",
    source_type: "dictionary",
    definition_summary:
      "Begins with art as acquired skill, then branch of learning, skilled occupation, and creative production.",
    earliest_date: null,
    sense_categories: ["art_skill_making", "technical_rule_reckoning"],
    supports: {
      made_by_art_skill: true,
      not_natural: false,
      imitation_substitute: false,
      contrived: false,
      fake_not_genuine: false,
      insincere_affected: false,
    },
    reliability_note: "Useful for modern readers who equate art only with fine art.",
    access_limitation: null,
  },
  {
    id: "cambridge_artificial",
    source_name: "Cambridge Dictionary",
    url: "https://dictionary.cambridge.org/dictionary/english/artificial",
    entry_term: "artificial",
    source_type: "dictionary",
    definition_summary:
      "Modern learner/general entry distinguishes made by people, often copying nature, from not sincere.",
    earliest_date: null,
    sense_categories: ["not_natural", "imitation_substitute", "affected_insincere"],
    supports: {
      made_by_art_skill: false,
      not_natural: true,
      imitation_substitute: true,
      contrived: false,
      fake_not_genuine: false,
      insincere_affected: true,
    },
    reliability_note: "Good modern sense contrast; weak for early history.",
    access_limitation: null,
  },
  {
    id: "oxford_learners_artificial",
    source_name: "Oxford Learner's Dictionary",
    url: "https://www.oxfordlearnersdictionaries.com/definition/english/artificial",
    entry_term: "artificial",
    source_type: "dictionary",
    definition_summary:
      "Modern learner entry distinguishes copy/not real, created by people, and not what it appears to be/fake senses; thesaurus separates artificial from synthetic, man-made, fake, false, and imitation.",
    earliest_date: null,
    sense_categories: ["not_natural", "imitation_substitute", "fake_not_genuine", "affected_insincere"],
    supports: {
      made_by_art_skill: false,
      not_natural: true,
      imitation_substitute: true,
      contrived: false,
      fake_not_genuine: true,
      insincere_affected: true,
    },
    reliability_note: "Useful for distinguishing modern near-synonyms; not historical attestation evidence.",
    access_limitation: null,
  },
  {
    id: "johnson_dictionary_online",
    source_name: "Johnson's Dictionary Online",
    url: "https://johnsonsdictionaryonline.com/",
    entry_term: "artificial",
    source_type: "historical_dictionary",
    definition_summary:
      "Site checked as a historical dictionary source, but the entry text was not reliably accessible through the non-JavaScript workflow.",
    earliest_date: "1755/1773 dictionary source if manually accessed",
    sense_categories: ["unclear_or_mixed"],
    supports: {
      made_by_art_skill: false,
      not_natural: false,
      imitation_substitute: false,
      contrived: false,
      fake_not_genuine: false,
      insincere_affected: false,
    },
    reliability_note: "Potentially high if manually accessed; current extraction is an access note only.",
    access_limitation: "Requires JavaScript/search interaction; entry not captured in this pass.",
  },
  {
    id: "rhetorica_ad_herennium_memory",
    source_name: "Rhetorica ad Herennium passages on memory",
    url: "https://www.laits.utexas.edu/memoria/Ad_Herennium_Passages.html",
    entry_term: "artificial memory",
    source_type: "book_snippet",
    definition_summary:
      "Primary classical/rhetorical passage distinguishes natural memory from artificial memory as memory strengthened by training and discipline.",
    earliest_date: "ancient source; online translation excerpt",
    sense_categories: ["technical_rule_reckoning", "art_skill_making"],
    supports: {
      made_by_art_skill: true,
      not_natural: true,
      imitation_substitute: false,
      contrived: false,
      fake_not_genuine: false,
      insincere_affected: false,
    },
    reliability_note: "Strong conceptual support for artificial as trained/systematic rather than fake; not an English first-use source.",
    access_limitation: null,
  },
  {
    id: "cambridge_memory_middle_ages",
    source_name: "Cambridge University Press: Memory in the Middle Ages chapter summary",
    url: "https://www.cambridge.org/core/books/memory-in-the-middle-ages/james-i-of-aragon-vicent-ferrer-and-francesc-eiximenis-natural-memory-and-artificial-memory/6A9911639FE5CF09F0D9DAA1484E4C26",
    entry_term: "artificial memory",
    source_type: "book_snippet",
    definition_summary:
      "Chapter summary says classical and medieval rhetoric distinguished natural memory from artificial memory, the latter cultivated by rules of the art of memory.",
    earliest_date: "2021 summary of classical/medieval tradition",
    sense_categories: ["technical_rule_reckoning", "art_skill_making"],
    supports: {
      made_by_art_skill: true,
      not_natural: true,
      imitation_substitute: false,
      contrived: false,
      fake_not_genuine: false,
      insincere_affected: false,
    },
    reliability_note: "Good scholarly support for artificial as rule-trained faculty; secondary/summary rather than corpus data.",
    access_limitation: "Full chapter may be paywalled.",
  },
] as const;

const evidenceSeed = [
  {
    id: "etymonline_artificial_family",
    term: "artificial",
    year: 1400,
    period: "late medieval / early modern",
    source_name: "Etymonline",
    source_type: "secondary_etymology" as SourceType,
    source_url: "https://www.etymonline.com/word/artificial",
    evidence_kind: "etymology" as EvidenceKind,
    sense: "art_skill_making" as Chart01ArtificialSense,
    confidence: "medium" as Confidence,
    short_summary:
      "Connects artificial to Latin artificialis/artificium and to art, skill, theory/system, and the maker root.",
    chart_01_usefulness: "core" as ChartUsefulness,
    notes: "Use as semantic-family evidence, not as final earliest-quotation proof.",
  },
  {
    id: "etymonline_artificial_day",
    term: "artificial day",
    year: 1400,
    period: "late medieval / early modern",
    source_name: "Etymonline",
    source_type: "secondary_etymology" as SourceType,
    source_url: "https://www.etymonline.com/word/artificial",
    evidence_kind: "attestation" as EvidenceKind,
    sense: "technical_rule_reckoning" as Chart01ArtificialSense,
    confidence: "medium" as Confidence,
    short_summary:
      "Reports artificial day as an early English phrase for the daylight span, contrasted with the full natural day.",
    chart_01_usefulness: "supporting" as ChartUsefulness,
    notes: "Useful technical/reckoning anchor but likely too obscure without extra context.",
  },
  {
    id: "etymonline_artifice_skill_before_trick",
    term: "artifice",
    year: 1530,
    period: "16th century",
    source_name: "Etymonline",
    source_type: "secondary_etymology" as SourceType,
    source_url: "https://www.etymonline.com/word/artifice",
    evidence_kind: "etymology" as EvidenceKind,
    sense: "art_skill_making" as Chart01ArtificialSense,
    confidence: "medium" as Confidence,
    short_summary:
      "Gives artifice first as workmanship and making by craft or skill, with trick/device later.",
    chart_01_usefulness: "core" as ChartUsefulness,
    notes: "Directly supports the skill-before-deception distinction.",
  },
  {
    id: "etymonline_artificer_maker",
    term: "artificer",
    year: 1400,
    period: "late medieval",
    source_name: "Etymonline",
    source_type: "secondary_etymology" as SourceType,
    source_url: "https://www.etymonline.com/word/artificer",
    evidence_kind: "etymology" as EvidenceKind,
    sense: "art_skill_making" as Chart01ArtificialSense,
    confidence: "medium" as Confidence,
    short_summary:
      "Gives artificer as one who makes by art or skill, strengthening the maker/craftsperson branch.",
    chart_01_usefulness: "supporting" as ChartUsefulness,
    notes: "Probably background or annotation evidence.",
  },
  {
    id: "webster_1828_artificial_primary",
    term: "artificial",
    year: 1828,
    period: "19th century",
    source_name: "Webster 1828",
    source_type: "historical_dictionary" as SourceType,
    source_url: "https://webstersdictionary1828.com/Dictionary/artificial",
    evidence_kind: "definition" as EvidenceKind,
    sense: "art_skill_making" as Chart01ArtificialSense,
    confidence: "high" as Confidence,
    short_summary:
      "Places made or contrived by art/human skill before fictitious/not-genuine senses, and gives technical examples.",
    chart_01_usefulness: "core" as ChartUsefulness,
    notes: "Best public historical dictionary anchor collected in this pass.",
  },
  {
    id: "webster_1828_artificial_fake_secondary",
    term: "artificial",
    year: 1828,
    period: "19th century",
    source_name: "Webster 1828",
    source_type: "historical_dictionary" as SourceType,
    source_url: "https://webstersdictionary1828.com/Dictionary/artificial",
    evidence_kind: "definition" as EvidenceKind,
    sense: "fake_not_genuine" as Chart01ArtificialSense,
    confidence: "high" as Confidence,
    short_summary:
      "Also records feigned, fictitious, and not genuine/natural as a separate sense.",
    chart_01_usefulness: "supporting" as ChartUsefulness,
    notes: "Useful for coexistence rather than a simple replacement story.",
  },
  {
    id: "webster_1828_art_technical_skill",
    term: "art",
    year: 1828,
    period: "19th century",
    source_name: "Webster 1828",
    source_type: "historical_dictionary" as SourceType,
    source_url: "https://webstersdictionary1828.com/Dictionary/art",
    evidence_kind: "definition" as EvidenceKind,
    sense: "art_skill_making" as Chart01ArtificialSense,
    confidence: "high" as Confidence,
    short_summary:
      "Frames art as human skill, rule-governed action, mechanic/liberal arts, and learned dexterity.",
    chart_01_usefulness: "core" as ChartUsefulness,
    notes: "Key support for explaining art in artificial as skill/technique.",
  },
  {
    id: "webster_1828_artifice_mixed",
    term: "artifice",
    year: 1828,
    period: "19th century",
    source_name: "Webster 1828",
    source_type: "historical_dictionary" as SourceType,
    source_url: "https://webstersdictionary1828.com/Dictionary/artifice",
    evidence_kind: "definition" as EvidenceKind,
    sense: "contrivance_construction" as Chart01ArtificialSense,
    confidence: "high" as Confidence,
    short_summary:
      "Defines artifice as an ingenious device in good or bad sense, and as art/trade/skill by practice.",
    chart_01_usefulness: "supporting" as ChartUsefulness,
    notes: "Good for showing contrivance is not automatically deception.",
  },
  {
    id: "webster_1828_artificer_agent",
    term: "artificer",
    year: 1828,
    period: "19th century",
    source_name: "Webster 1828",
    source_type: "historical_dictionary" as SourceType,
    source_url: "https://webstersdictionary1828.com/Dictionary/artificer",
    evidence_kind: "definition" as EvidenceKind,
    sense: "art_skill_making" as Chart01ArtificialSense,
    confidence: "high" as Confidence,
    short_summary:
      "Defines artificer as skilled artist/mechanic/manufacturer and maker/contriver.",
    chart_01_usefulness: "supporting" as ChartUsefulness,
    notes: "Strong maker noun; may be too specialized for main visual text.",
  },
  {
    id: "webster_1828_artificial_arguments",
    term: "artificial arguments",
    year: 1828,
    period: "19th century",
    source_name: "Webster 1828",
    source_type: "historical_dictionary" as SourceType,
    source_url: "https://webstersdictionary1828.com/Dictionary/artificial",
    evidence_kind: "usage_example" as EvidenceKind,
    sense: "technical_rule_reckoning" as Chart01ArtificialSense,
    confidence: "high" as Confidence,
    short_summary:
      "Rhetorical artificial arguments are invented by the speaker, contrasted with authority/testimony-type proofs.",
    chart_01_usefulness: "supporting" as ChartUsefulness,
    notes: "Shows artificial as made by rhetorical art, not fake.",
  },
  {
    id: "ad_herennium_artificial_memory",
    term: "artificial memory",
    year: 0,
    period: "classical rhetorical tradition",
    source_name: "Rhetorica ad Herennium passages on memory",
    source_type: "book_snippet" as SourceType,
    source_url: "https://www.laits.utexas.edu/memoria/Ad_Herennium_Passages.html",
    evidence_kind: "snippet" as EvidenceKind,
    sense: "technical_rule_reckoning" as Chart01ArtificialSense,
    confidence: "medium" as Confidence,
    short_summary:
      "Distinguishes natural memory from artificial memory as training/system/discipline that strengthens memory.",
    chart_01_usefulness: "supporting" as ChartUsefulness,
    notes: "Conceptually strong but not an English lexical attestation.",
  },
  {
    id: "cambridge_memory_middle_ages_summary",
    term: "artificial memory",
    year: 2021,
    period: "modern scholarly summary",
    source_name: "Cambridge University Press",
    source_type: "book_snippet" as SourceType,
    source_url:
      "https://www.cambridge.org/core/books/memory-in-the-middle-ages/james-i-of-aragon-vicent-ferrer-and-francesc-eiximenis-natural-memory-and-artificial-memory/6A9911639FE5CF09F0D9DAA1484E4C26",
    evidence_kind: "snippet" as EvidenceKind,
    sense: "technical_rule_reckoning" as Chart01ArtificialSense,
    confidence: "medium" as Confidence,
    short_summary:
      "Summarizes classical/medieval rhetoric as distinguishing innate natural memory from rule-cultivated artificial memory.",
    chart_01_usefulness: "background" as ChartUsefulness,
    notes: "Good scholarly corroboration; full chapter may be paywalled.",
  },
  {
    id: "mw_artificial_modern_split",
    term: "artificial",
    year: 2026,
    period: "modern",
    source_name: "Merriam-Webster",
    source_type: "dictionary" as SourceType,
    source_url: "https://www.merriam-webster.com/dictionary/artificial",
    evidence_kind: "definition" as EvidenceKind,
    sense: "not_natural" as Chart01ArtificialSense,
    confidence: "high" as Confidence,
    short_summary:
      "Modern entry keeps human-made/natural-model and not-genuine/sincere branches, with etymology from skill/craft/making.",
    chart_01_usefulness: "supporting" as ChartUsefulness,
    notes: "Good for modern sense split and etymology, not early chronology.",
  },
  {
    id: "cambridge_artificial_modern_split",
    term: "artificial",
    year: 2026,
    period: "modern",
    source_name: "Cambridge Dictionary",
    source_type: "dictionary" as SourceType,
    source_url: "https://dictionary.cambridge.org/dictionary/english/artificial",
    evidence_kind: "definition" as EvidenceKind,
    sense: "not_natural" as Chart01ArtificialSense,
    confidence: "high" as Confidence,
    short_summary:
      "Modern entry separates made by people/often copy of nature from not sincere.",
    chart_01_usefulness: "background" as ChartUsefulness,
    notes: "Useful contrast source; not an early-history source.",
  },
  {
    id: "oxford_learners_synonym_split",
    term: "artificial",
    year: 2026,
    period: "modern",
    source_name: "Oxford Learner's Dictionary",
    source_type: "dictionary" as SourceType,
    source_url: "https://www.oxfordlearnersdictionaries.com/definition/english/artificial",
    evidence_kind: "definition" as EvidenceKind,
    sense: "imitation_substitute" as Chart01ArtificialSense,
    confidence: "high" as Confidence,
    short_summary:
      "Modern learner entry separates artificial, synthetic, false, man-made, fake, and imitation in the synonym field.",
    chart_01_usefulness: "background" as ChartUsefulness,
    notes: "Useful for later precision: not natural does not automatically mean fake.",
  },
] as const;

const snippetCandidates = [
  {
    id: "snippet_webster_artificial_arguments",
    term: "artificial arguments",
    year: 1828,
    title: "American Dictionary of the English Language",
    author: "Noah Webster",
    source_url: "https://webstersdictionary1828.com/Dictionary/artificial",
    short_snippet_or_paraphrase:
      "Rhetorical artificial arguments are invented by the speaker, unlike authority/testimony-type proofs.",
    sense: "technical_rule_reckoning",
    confidence: "high",
    useful_for_chart_01: true,
    notes: "Technical rule/rhetoric example inside artificial entry.",
  },
  {
    id: "snippet_webster_artificial_lines_numbers",
    term: "artificial lines / artificial numbers",
    year: 1828,
    title: "American Dictionary of the English Language",
    author: "Noah Webster",
    source_url: "https://webstersdictionary1828.com/Dictionary/artificial",
    short_snippet_or_paraphrase:
      "Artificial lines and artificial numbers refer to mathematical/logarithmic instruments or forms.",
    sense: "technical_rule_reckoning",
    confidence: "high",
    useful_for_chart_01: true,
    notes: "Good evidence for artificial as rule/calculation rather than counterfeit.",
  },
  {
    id: "snippet_ad_herennium_memory",
    term: "artificial memory",
    year: 0,
    title: "Rhetorica ad Herennium passages on memory",
    author: "Anonymous classical rhetorical text; online translation excerpt hosted by University of Texas",
    source_url: "https://www.laits.utexas.edu/memoria/Ad_Herennium_Passages.html",
    short_snippet_or_paraphrase:
      "Artificial memory is memory strengthened through training, system, and discipline.",
    sense: "technical_rule_reckoning",
    confidence: "medium",
    useful_for_chart_01: true,
    notes: "Classical conceptual source; not an English attestation.",
  },
  {
    id: "snippet_cambridge_memory_middle_ages",
    term: "artificial memory",
    year: 2021,
    title: "Memory in the Middle Ages, chapter summary",
    author: "Xavier Renedo; edited by Flocel Sabate",
    source_url:
      "https://www.cambridge.org/core/books/memory-in-the-middle-ages/james-i-of-aragon-vicent-ferrer-and-francesc-eiximenis-natural-memory-and-artificial-memory/6A9911639FE5CF09F0D9DAA1484E4C26",
    short_snippet_or_paraphrase:
      "Classical and medieval rhetoric distinguished innate natural memory from rule-cultivated artificial memory.",
    sense: "technical_rule_reckoning",
    confidence: "medium",
    useful_for_chart_01: true,
    notes: "Scholarly summary; full chapter may be paywalled.",
  },
  {
    id: "snippet_etymonline_artificial_day",
    term: "artificial day",
    year: 1400,
    title: "Etymonline artificial",
    author: "Douglas Harper",
    source_url: "https://www.etymonline.com/word/artificial",
    short_snippet_or_paraphrase:
      "Artificial day is reported as daylight from sunrise to sunset, contrasted with a full natural day.",
    sense: "technical_rule_reckoning",
    confidence: "medium",
    useful_for_chart_01: true,
    notes: "Needs OED or primary quotation if used prominently.",
  },
  {
    id: "snippet_kaken_artificial_arguments",
    term: "artificial arguments",
    year: 1993,
    title: "Studies of Milton from the Perspective of History of Ideas",
    author: "KAKEN project abstract",
    source_url: "https://kaken.nii.ac.jp/grant/KAKENHI-PROJECT-04610283/",
    short_snippet_or_paraphrase:
      "Project abstract notes that in Ramean logic artificial arguments contrast with inartificial arguments and differ from present-day usage.",
    sense: "technical_rule_reckoning",
    confidence: "low",
    useful_for_chart_01: false,
    notes: "Interesting but too indirect; keep as background unless verified with primary rhetoric sources.",
  },
] as const;

const termFamily = [
  {
    term: "art",
    term_type: "root_family",
    relation_to_artificial: "Latin ars/art root; supports art as learned skill, rule, craft, and practice.",
    first_known_or_source_date: "early 13c. per Etymonline; 1828 historical dictionary snapshot collected",
    primary_sense: "art_skill_making",
    secondary_senses: "technical_rule_reckoning",
    notes: "Strong Chart 1 evidence; helps avoid modern narrow reading of art as only fine art.",
  },
  {
    term: "artificial",
    term_type: "derived_form",
    relation_to_artificial: "Main word; from artificialis/artificium, tied to art/skill/making and later not-natural/fake branches.",
    first_known_or_source_date: "15th century per Merriam-Webster; late 14c./early 15c. per Etymonline",
    primary_sense: "art_skill_making",
    secondary_senses: "technical_rule_reckoning;not_natural;imitation_substitute;fake_not_genuine;affected_insincere",
    notes: "Core term; dictionary evidence must carry semantic claims, not Ngram alone.",
  },
  {
    term: "artificially",
    term_type: "derived_form",
    relation_to_artificial: "Adverbial form; directly preserves by art/human skill/contrivance wording in Webster 1828.",
    first_known_or_source_date: "early 15c. per Etymonline; 1828 historical dictionary snapshot collected",
    primary_sense: "art_skill_making",
    secondary_senses: "contrivance_construction",
    notes: "Useful supporting term, probably not a main public-facing anchor.",
  },
  {
    term: "artifice",
    term_type: "root_family",
    relation_to_artificial: "Shares artificium family; shows skill/workmanship and later trick/deception branch.",
    first_known_or_source_date: "1540 per Merriam-Webster; 1530s per Etymonline",
    primary_sense: "art_skill_making",
    secondary_senses: "contrivance_construction;fake_not_genuine;affected_insincere",
    notes: "Strong evidence, but needs careful handling because modern readers hear deception first.",
  },
  {
    term: "artificer",
    term_type: "agent_noun",
    relation_to_artificial: "Maker/craftsperson figure behind the adjective family.",
    first_known_or_source_date: "late 14c. per Etymonline",
    primary_sense: "art_skill_making",
    secondary_senses: "contrivance_construction;fake_not_genuine",
    notes: "Strong background, maybe annotation-level.",
  },
  {
    term: "artificiality",
    term_type: "abstract_noun",
    relation_to_artificial: "Abstract noun showing appearance of art and insincerity branch.",
    first_known_or_source_date: "1763 per Etymonline",
    primary_sense: "affected_insincere",
    secondary_senses: "art_skill_making",
    notes: "Useful to mark later affect/insincerity, not root layer.",
  },
  {
    term: "artful",
    term_type: "background_term",
    relation_to_artificial: "Art-family word where skill and cunning coexist.",
    first_known_or_source_date: "1828 historical dictionary snapshot collected",
    primary_sense: "contrivance_construction",
    secondary_senses: "art_skill_making;fake_not_genuine",
    notes: "Background only; helps explain semantic drift in art-family words.",
  },
  {
    term: "artless",
    term_type: "background_term",
    relation_to_artificial: "Oppositional art-family word: can mean lacking skill or free from guile.",
    first_known_or_source_date: "1828 historical dictionary snapshot collected",
    primary_sense: "affected_insincere",
    secondary_senses: "art_skill_making;fake_not_genuine",
    notes: "Background only; useful for sincerity contrast.",
  },
  {
    term: "artisan",
    term_type: "background_term",
    relation_to_artificial: "Related art/craft worker term, but less directly tied to artificial.",
    first_known_or_source_date: "1530s per Etymonline artificer related entry",
    primary_sense: "art_skill_making",
    secondary_senses: "",
    notes: "Background only unless Chart 1 needs craft-worker vocabulary.",
  },
  {
    term: "artifact / artefact",
    term_type: "background_term",
    relation_to_artificial: "From arte + factum: thing made by skill; useful but later and less central.",
    first_known_or_source_date: "1821 per Etymonline",
    primary_sense: "art_skill_making",
    secondary_senses: "not_natural",
    notes: "Interesting support, not core Chart 1 evidence.",
  },
  {
    term: "contrivance",
    term_type: "comparator",
    relation_to_artificial: "Conceptual neighbor for devised/constructed arrangement.",
    first_known_or_source_date: "Ngram collected; dictionary support still optional",
    primary_sense: "contrivance_construction",
    secondary_senses: "fake_not_genuine",
    notes: "Useful comparator but may pull the story toward suspicion.",
  },
  {
    term: "technical",
    term_type: "comparator",
    relation_to_artificial: "Conceptual neighbor for rule/system/learned method.",
    first_known_or_source_date: "Ngram collected",
    primary_sense: "technical_rule_reckoning",
    secondary_senses: "",
    notes: "Background comparator only.",
  },
  {
    term: "artificial day",
    term_type: "phrase_anchor",
    relation_to_artificial: "Early technical/reckoning phrase rather than fake-object phrase.",
    first_known_or_source_date: "late 14c. per Etymonline",
    primary_sense: "technical_rule_reckoning",
    secondary_senses: "not_natural",
    notes: "Potential annotation; needs OED/primary corroboration if prominent.",
  },
  {
    term: "artificial memory",
    term_type: "phrase_anchor",
    relation_to_artificial: "Rhetorical learned-system phrase; artificial means trained by rules/art.",
    first_known_or_source_date: "classical rhetorical tradition; English Ngram collected",
    primary_sense: "technical_rule_reckoning",
    secondary_senses: "art_skill_making",
    notes: "Strong conceptually but not an early English phrase proof in this pass.",
  },
  {
    term: "artificial arguments",
    term_type: "phrase_anchor",
    relation_to_artificial: "Rhetorical phrase for arguments invented by the speaker/art rather than external authority.",
    first_known_or_source_date: "Johnson/Webster tradition; Webster 1828 collected",
    primary_sense: "technical_rule_reckoning",
    secondary_senses: "art_skill_making",
    notes: "Good technical support but may be obscure.",
  },
] as const;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function batch<T>(items: readonly T[], size: number) {
  const groups: T[][] = [];
  for (let index = 0; index < items.length; index += size) groups.push(items.slice(index, index + size) as T[]);
  return groups;
}

function canonical(value: string) {
  return value
    .toLowerCase()
    .replace(/\s*\(all\)$/i, "")
    .replace(/\s+/g, " ")
    .trim();
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

function csvValue(value: string | number | boolean | null | undefined) {
  if (value === null || value === undefined) return "";
  const text = String(value);
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function csvRows(headers: string[], rows: Array<Record<string, string | number | boolean | null | undefined>>) {
  return [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => csvValue(row[header])).join(",")),
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

async function fetchNgramBatch(terms: typeof ngramTerms[number][]) {
  const url = ngramUrl(terms.map((term) => term.term));
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Ngram request failed: ${response.status} ${response.statusText}`);
  return { url: url.toString(), rows: (await response.json()) as NgramResponse[] };
}

async function collectNgram() {
  const points: NgramPoint[] = [];
  const statuses: Record<string, { status: string; first: number | null; peakYear: number | null; peakValue: number; note: string }> = {};
  const urls: string[] = [];
  const errors: string[] = [];

  for (const termBatch of batch(ngramTerms, BATCH_SIZE)) {
    const requestUrl = ngramUrl(termBatch.map((term) => term.term)).toString();
    try {
      const { url, rows } = await fetchNgramBatch(termBatch);
      urls.push(url);
      const rowMap = preferAggregateRows(rows);
      for (const term of termBatch) {
        const row = rowMap.get(canonical(term.term));
        if (!row) {
          statuses[term.term] = {
            status: "missing",
            first: null,
            peakYear: null,
            peakValue: 0,
            note: "No row returned by Google Ngram.",
          };
          continue;
        }
        const termPoints = row.timeseries.map((value, index) => ({
          year: START_YEAR + index,
          term: term.term,
          value,
          source: SOURCE,
          corpus: CORPUS,
          smoothing: SMOOTHING,
          case_sensitive: !CASE_INSENSITIVE,
          query_group: term.query_group,
        }));
        points.push(...termPoints);
        const nonZero = termPoints.filter((point) => point.value > 0);
        const peak = termPoints.reduce((best, point) => (point.value > best.value ? point : best), {
          year: null as number | null,
          value: 0,
        });
        statuses[term.term] = {
          status: nonZero.length === 0 ? "missing" : nonZero.length <= 3 ? "too_sparse" : "collected",
          first: nonZero[0]?.year ?? null,
          peakYear: peak.year,
          peakValue: peak.value,
          note: nonZero.length <= 3 ? "Very sparse Ngram visibility; semantic use requires snippets." : "Ngram visibility only.",
        };
      }
    } catch (error) {
      errors.push(`${requestUrl}: ${error instanceof Error ? error.message : String(error)}`);
      for (const term of termBatch) {
        statuses[term.term] = {
          status: "error",
          first: null,
          peakYear: null,
          peakValue: 0,
          note: error instanceof Error ? error.message : String(error),
        };
      }
    }
    await sleep(REQUEST_DELAY_MS);
  }

  return { points, statuses, urls, errors };
}

function sourceCountFor(term: string): number {
  const normalized = term.toLowerCase();
  const exactDictionaryCount = dictionarySources.filter((source) => source.entry_term.toLowerCase() === normalized).length;
  const evidenceCount = evidenceSeed.filter((item) => item.term.toLowerCase() === normalized).length;
  const snippetCount = snippetCandidates.filter((item) => item.term.toLowerCase() === normalized).length;
  if (normalized === "artifact / artefact") {
    return sourceCountFor("artifact") + sourceCountFor("artefact");
  }
  return exactDictionaryCount + evidenceCount + snippetCount;
}

function definitionTimeline() {
  return {
    items: evidenceSeed
      .filter((item) => item.evidence_kind === "definition" || item.evidence_kind === "etymology")
      .map((item) => ({
        id: item.id,
        term: item.term,
        year: item.year,
        source: item.source_name,
        source_url: item.source_url,
        sense: item.sense,
        definition_summary: item.short_summary,
        secondary_senses:
          dictionarySources.find(
            (source) => source.entry_term === item.term && source.source_name === item.source_name,
          )?.sense_categories.filter((sense) => sense !== item.sense) ?? [],
        reliability: item.confidence === "high" ? "high" : item.confidence === "medium" ? "medium" : "low",
        notes: item.notes,
      })),
  };
}

function phraseMetadata(statuses: Awaited<ReturnType<typeof collectNgram>>["statuses"]) {
  const phraseRows = [
    { phrase: "artificial day", primary_sense: "technical_rule_reckoning", relevance: "medium", support: "Etymonline; Ngram" },
    { phrase: "artificial memory", primary_sense: "technical_rule_reckoning", relevance: "high", support: "Rhetorica ad Herennium; Cambridge summary; Ngram" },
    { phrase: "artificial arguments", primary_sense: "technical_rule_reckoning", relevance: "medium", support: "Webster 1828; Johnson attributed via Webster 1913 derivative source" },
    { phrase: "artificial method", primary_sense: "technical_rule_reckoning", relevance: "medium", support: "Ngram only in this pass" },
    { phrase: "artificial system", primary_sense: "technical_rule_reckoning", relevance: "medium", support: "Ngram only in this pass" },
    { phrase: "artificial work", primary_sense: "art_skill_making", relevance: "low", support: "Ngram only in this pass" },
    { phrase: "made by art", primary_sense: "art_skill_making", relevance: "medium", support: "Ngram visibility and dictionary wording" },
    { phrase: "made by skill", primary_sense: "art_skill_making", relevance: "low", support: "Ngram only in this pass" },
    { phrase: "human skill", primary_sense: "art_skill_making", relevance: "medium", support: "Ngram visibility and dictionary wording" },
    { phrase: "artificial reason", primary_sense: "unclear_or_mixed", relevance: "low", support: "Not collected in Ngram extension" },
    { phrase: "artificial logic", primary_sense: "unclear_or_mixed", relevance: "low", support: "Not collected in Ngram extension" },
    { phrase: "artificial language", primary_sense: "technical_rule_reckoning", relevance: "low", support: "First-round Ngram only; not Chart 1 focus yet" },
    { phrase: "artificial body", primary_sense: "unclear_or_mixed", relevance: "exclude", support: "Not collected in this pass" },
    { phrase: "artificial motion", primary_sense: "unclear_or_mixed", relevance: "low", support: "Not collected in this pass" },
    { phrase: "artificial fire", primary_sense: "unclear_or_mixed", relevance: "low", support: "Not collected in this pass" },
    { phrase: "artificial light", primary_sense: "not_natural", relevance: "low", support: "First-round Ngram; outside Chart 1 unless used as Webster example" },
  ];

  return phraseRows.map((row) => {
    const status = statuses[row.phrase];
    return {
      phrase: row.phrase,
      status: status?.status ?? (row.support.includes("Not collected") ? "skipped" : "source_only"),
      primary_sense: row.primary_sense,
      first_visible_year: status?.first ?? null,
      peak_year: status?.peakYear ?? null,
      peak_value: status?.peakValue ?? null,
      source_support: row.support,
      chart_01_relevance: row.relevance,
      needs_snippet_review: row.support.includes("Ngram only") || row.relevance === "low" || row.relevance === "exclude",
      notes:
        row.relevance === "exclude"
          ? "Not enough Chart 1 relevance in this pass."
          : "Relevance is evidence-review only, not final visual selection.",
    };
  });
}

async function main() {
  const generatedAt = new Date().toISOString();
  await Promise.all([RAW_DIR, PROCESSED_DIR, NOTES_DIR, SOURCES_DIR].map((directory) => mkdir(directory, { recursive: true })));

  const { points, statuses, urls, errors } = await collectNgram();

  await writeFile(
    path.join(RAW_DIR, "chart_01_ngram_extended_terms.csv"),
    `${csvRows(["year", "term", "value", "source", "corpus", "smoothing", "case_sensitive", "query_group"], points)}\n`,
  );

  await writeFile(path.join(RAW_DIR, "chart_01_dictionary_sources.json"), `${JSON.stringify(dictionarySources, null, 2)}\n`);

  await writeFile(
    path.join(RAW_DIR, "chart_01_snippet_candidates.csv"),
    `${csvRows(
      [
        "id",
        "term",
        "year",
        "title",
        "author",
        "source_url",
        "short_snippet_or_paraphrase",
        "sense",
        "confidence",
        "useful_for_chart_01",
        "notes",
      ],
      [...snippetCandidates],
    )}\n`,
  );

  await writeFile(
    path.join(PROCESSED_DIR, "chart_01_term_family.csv"),
    `${csvRows(
      [
        "term",
        "term_type",
        "relation_to_artificial",
        "first_known_or_source_date",
        "primary_sense",
        "secondary_senses",
        "source_count",
        "ngram_collected",
        "notes",
      ],
      termFamily.map((row) => ({
        ...row,
        source_count: sourceCountFor(row.term),
        ngram_collected:
          statuses[row.term]?.status === "collected" ||
          (row.term === "artifact / artefact" && (statuses.artifact?.status === "collected" || statuses.artefact?.status === "collected")),
      })),
    )}\n`,
  );

  await writeFile(path.join(PROCESSED_DIR, "chart_01_definition_timeline.json"), `${JSON.stringify(definitionTimeline(), null, 2)}\n`);

  await writeFile(
    path.join(PROCESSED_DIR, "chart_01_evidence_table.csv"),
    `${csvRows(
      [
        "id",
        "term",
        "year",
        "period",
        "source_name",
        "source_type",
        "source_url",
        "evidence_kind",
        "sense",
        "confidence",
        "short_summary",
        "chart_01_usefulness",
        "notes",
      ],
      [
        ...evidenceSeed,
        ...ngramTerms.map((term) => {
          const status = statuses[term.term];
          return {
            id: `ngram_${term.term.replace(/[^a-z0-9]+/gi, "_").replace(/^_|_$/g, "").toLowerCase()}`,
            term: term.term,
            year: status?.first ?? null,
            period: "1800-2019",
            source_name: SOURCE,
            source_type: "ngram" as SourceType,
            source_url: urls.find((url) => url.includes(encodeURIComponent(term.term).replace(/%20/g, "+"))) ?? ENDPOINT,
            evidence_kind: "frequency_signal" as EvidenceKind,
            sense: "unclear_or_mixed" as Chart01ArtificialSense,
            confidence: status?.status === "collected" ? ("medium" as Confidence) : ("low" as Confidence),
            short_summary:
              status?.status === "collected"
                ? `Ngram visibility collected; peak raw value ${status.peakValue}.`
                : `Ngram status: ${status?.status ?? "missing"}.`,
            chart_01_usefulness:
              term.query_group === "primary_chart_01_term" && status?.status === "collected"
                ? ("supporting" as ChartUsefulness)
                : ("background" as ChartUsefulness),
            notes: status?.note ?? "No status recorded.",
          };
        }),
      ],
    )}\n`,
  );

  await writeFile(
    path.join(PROCESSED_DIR, "chart_01_phrase_metadata.csv"),
    `${csvRows(
      [
        "phrase",
        "status",
        "primary_sense",
        "first_visible_year",
        "peak_year",
        "peak_value",
        "source_support",
        "chart_01_relevance",
        "needs_snippet_review",
        "notes",
      ],
      phraseMetadata(statuses),
    )}\n`,
  );

  await writeFile(path.join(SOURCES_DIR, "README.md"), `# Chart 1 Sources\n\nSource details are stored in \`raw/chart_01_dictionary_sources.json\` and summarized in \`notes/chart_01_source_notes.md\`.\n`);

  const checkedSources = [
    "Etymonline: art, artificial, artificially, artifice, artificer, artificiality, artisan, artifact",
    "Webster 1828: artificial, artificially, art, artifice, artificer, artificiality, artful, artless, craft",
    "Merriam-Webster: artificial, artifice, artificer, art, craft",
    "Cambridge Dictionary: artificial",
    "Oxford Learner's Dictionary: artificial",
    "Johnson's Dictionary Online: site checked; non-JavaScript entry extraction not successful",
    "Rhetorica ad Herennium memory passage hosted by University of Texas",
    "Cambridge University Press chapter summary on natural and artificial memory",
    "Google Books Ngram JSON endpoint",
  ];

  const collectedCount = Object.values(statuses).filter((status) => status.status === "collected").length;
  const missingTerms = Object.entries(statuses).filter(([, status]) => status.status !== "collected");

  const collectionLog = `# Chart 1 Collection Log

Generated: ${generatedAt}

## Scope

Second-round evidence package for Chart 1 only: artificial as art, artifice, artificer, skill, craft, technical making, learned construction, and contrivance.

## Scripts Used

- \`scripts/fetch_chart_01_art_artifice.ts\`

## Output Root

- \`docs/research/artificial/chart_01_art_artifice\`

## Ngram Settings

- Source: ${SOURCE}
- Endpoint: \`${ENDPOINT}\`
- Corpus: \`${CORPUS}\`
- Date range: ${START_YEAR}-${END_YEAR}
- Smoothing: ${SMOOTHING}
- Case-insensitive: ${CASE_INSENSITIVE}
- Case-sensitive query: ${!CASE_INSENSITIVE}
- Aggregate handling: case-insensitive \`term (All)\` rows are preferred over single-capitalization rows.

## Sources Checked

${checkedSources.map((source) => `- ${source}`).join("\n")}

## Ngram Terms Attempted

${ngramTerms.map((term) => `- ${term.term} (${term.query_group})`).join("\n")}

## Ngram Collection Result

- Terms attempted: ${ngramTerms.length}
- Terms collected: ${collectedCount}
- Missing / sparse / errored: ${missingTerms.length}
${missingTerms.length ? missingTerms.map(([term, status]) => `- ${term}: ${status.status} (${status.note})`).join("\n") : "- None"}

## Request URLs

${urls.map((url) => `- ${url}`).join("\n")}

## Failures And Access Limitations

${errors.length ? errors.map((error) => `- ${error}`).join("\n") : "- No Ngram request errors."}
- Johnson's Dictionary Online was reachable, but the search/entry interface depends on JavaScript and did not expose stable entry text in this pass.
- OED was not accessed directly; use OED later for earliest quotations and full sense tree.
- Full Cambridge University Press chapter text may be paywalled; only public summary metadata was used.

## Assumptions

- Ngram is visibility evidence only and is not used as semantic proof.
- Dictionary entries are paraphrased to avoid overquoting and to keep the evidence table review-oriented.
- Modern dictionary sources are included to distinguish current senses, not to prove early chronology.
`;
  await writeFile(path.join(NOTES_DIR, "chart_01_collection_log.md"), collectionLog);

  const sourceNotes = `# Chart 1 Source Notes

Generated: ${generatedAt}

## High-Reliability Historical Dictionary Sources

- Webster 1828: strongest accessible public historical dictionary evidence in this pass. Supports art/skill, contrivance, not-natural, and fake/not-genuine distinctions.
- Johnson's Dictionary Online: likely valuable for 1755/1773, but entry extraction was blocked by the JavaScript/search workflow; mark for manual review.

## Etymology Sources

- Etymonline: useful for semantic chronology and word-family links among art, artificium, artifice, artificer, and artificial. Treat as a strong guide but not final proof of earliest quotations.
- Etymonline art/artisan/artifact entries are used as background for the skill/craft/thing-made-by-art family, not as final Chart 1 anchors.
- Merriam-Webster etymologies: useful for modern confirmation of skill/craft/making roots and first-known-use dates.

## Modern Dictionary Sources

- Merriam-Webster: reliable modern dictionary. Helpful for separating made-by-humans, not genuine/sincere, and archaic artful/cunning senses.
- Cambridge Dictionary: useful for current made-by-people/copy-of-nature and not-sincere split.
- Oxford Learner's Dictionary: useful for distinguishing artificial from synthetic, false, man-made, fake, and imitation.

## Rhetorical / Snippet Sources

- Rhetorica ad Herennium memory passage: strong conceptual support for artificial as trained/systematic/rule-based, not fake. It is not an English first-use source.
- Cambridge University Press chapter summary: scholarly support for natural vs artificial memory in classical/medieval rhetoric; full text may require access.

## Ngram Source

- Google Books Ngram: visibility signal for word-family and phrase candidates, using \`en\`, 1800-2019, smoothing 0, case-insensitive. It does not disambiguate senses.
`;
  await writeFile(path.join(NOTES_DIR, "chart_01_source_notes.md"), sourceNotes);

  const evidenceReview = `# Chart 1 Evidence Review

Generated: ${generatedAt}

## 1. Artificial As Art / Skill / Making

The strongest accessible evidence is Webster 1828, which places the made-by-art / human-skill sense first for artificial and separately records fictitious/not-genuine. Etymonline and Merriam-Webster both support the same family relation through Latin artificium and ars: art as acquired skill, craft, and making. Webster 1828 entries for art, artifice, artificer, and artificially reinforce that this semantic layer is not modern AI or industrial substitution; it is learned, rule-guided, skilled making.

## 2. Artificial As Technical Rule / Reckoning

Artificial day, artificial arguments, artificial lines/numbers, and artificial memory are the strongest technical-rule candidates. They show artificial as a learned or rule-made category: daylight reckoning, rhetorical invention, mathematical/logarithmic instruments, and trained memory. These are promising as evidence, but artificial day and artificial arguments may be obscure without careful annotation.

## 3. When Not Natural Appears

The not-natural contrast is present in the collected historical dictionary evidence, especially Webster 1828, where made by art/human skill is explicitly opposed to natural. This does not automatically mean fake. In this layer, not natural can simply mean human-made, rule-made, or skill-made.

## 4. When Fake / Not Genuine / Insincere Appears

Webster 1828 already lists feigned/fictitious/not genuine as a separate sense. Etymonline dates fictitious/not-genuine and affected/insincere branches earlier than Webster's dictionary snapshot. Merriam-Webster and Cambridge show those branches remain live in modern English. The evidence supports coexistence of senses, not a clean replacement.

## 5. Strong Enough For Chart 1 Evidence

- artificial: strong dictionary and etymology support.
- art: strong support for art as skill/rules/craft, especially Webster 1828 and Merriam-Webster.
- artifice: strong but needs care because deception is also present.
- artificer: strong maker/craftsperson support, probably as background or annotation.
- artificially: useful support for by art/human skill/contrivance.
- artificial memory / artificial arguments / artificial day: useful technical-rule evidence, with varying accessibility.

## 6. Interesting But Weak Or Obscure

- artificial day: historically important but potentially obscure for a public chart without OED or primary examples.
- artificial arguments: strong rhetorical example but specialized.
- artificial memory: conceptually strong; English lexical dating still needs care.
- artful/artless: useful background for skill-to-cunning and sincerity contrasts, but could broaden the chart too much.
- artifact/artefact, artisan, technical, mechanical, contrivance: background comparators only in this pass.

## 7. Still Needs Manual Review

- OED full entry for artificial, especially earliest quotations and obsolete technical senses.
- Johnson 1755/1773 artificial entry via browser/manual search.
- Primary examples for artificial day, artificial arguments, and artificial memory if they become prominent.
- Snippet review for phrase candidates with Ngram-only support.
`;
  await writeFile(path.join(NOTES_DIR, "chart_01_evidence_review.md"), evidenceReview);

  const openQuestions = `# Chart 1 Open Questions

Generated: ${generatedAt}

- Are the earliest senses accessible without OED, or should Chart 1 wait for OED quotation review before final copy?
- Is artificial day too obscure for a public-facing chart, or can it work as a small technical-reckoning annotation?
- Can artifice be shown without over-emphasizing deception, given that both skill and trickery are live in later dictionaries?
- Does artificer help the story visually, or should it remain etymological background?
- How early does the fake/not-genuine sense become visible in primary dictionary evidence beyond secondary etymology?
- How should Chart 1 distinguish not natural from fake in labels and evidence notes?
- Are artificial arguments and artificial memory too specialized, or are they the cleanest way to show artificial as rule-trained/learned?
- Which phrase candidates need Google Books snippet or archive review before design?
- Should artful/artless appear at all, or do they expand the semantic field beyond Chart 1's root story?
`;
  await writeFile(path.join(NOTES_DIR, "chart_01_open_questions.md"), openQuestions);

  console.log(`Chart 1 art/artifice evidence package complete.
Ngram terms attempted: ${ngramTerms.length}
Ngram terms collected: ${collectedCount}
Dictionary/source records: ${dictionarySources.length}
Evidence rows before Ngram rows: ${evidenceSeed.length}`);
}

await main();
