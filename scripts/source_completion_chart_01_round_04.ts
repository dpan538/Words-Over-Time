import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const BASE_DIR = path.join(
  process.cwd(),
  "docs",
  "research",
  "artificial",
  "chart_01_art_artifice",
  "source_completion_round_04",
);
const RAW_DIR = path.join(BASE_DIR, "raw");
const PROCESSED_DIR = path.join(BASE_DIR, "processed");
const NOTES_DIR = path.join(BASE_DIR, "notes");
const SOURCES_DIR = path.join(BASE_DIR, "sources");

const generatedAt = new Date().toISOString();

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

const sourceCoverage = [
  {
    source_name: "Oxford English Dictionary",
    source_type: "authoritative_dictionary",
    access_status: "not_accessible",
    terms_checked: "artificial; artifice; artificer",
    terms_found: "",
    chart_01_value: "high",
    reliability: "high",
    limitations: "Subscription source not accessed in this environment.",
    notes: "Still needed for precise earliest-date claims and full obsolete technical sense tree.",
  },
  {
    source_name: "Middle English Dictionary",
    source_type: "authoritative_dictionary",
    access_status: "search_only",
    terms_checked: "artificial; artifice; artificer",
    terms_found: "No stable direct entry found through web search in this pass.",
    chart_01_value: "medium",
    reliability: "high",
    limitations: "Search did not surface exact relevant entries; deeper MED interface work may be needed.",
    notes: "Useful if it can confirm Middle English forms; not required if OED supplies earliest evidence.",
  },
  {
    source_name: "Etymonline",
    source_type: "etymology_source",
    access_status: "accessed",
    terms_checked: "artificial; artificially; artifice; artificer; art; artifact; artisan",
    terms_found: "artificial; artificially; artifice; artificer; art; artifact; artisan",
    chart_01_value: "high",
    reliability: "medium",
    limitations: "Secondary etymology; dates and sense order need OED/primary confirmation before final copy.",
    notes: "Best compact chronology source for the art/skill/making-to-fake boundary.",
  },
  {
    source_name: "Webster 1828",
    source_type: "historical_dictionary",
    access_status: "accessed",
    terms_checked: "artificial; art; artifice; artificer; artless; factitious",
    terms_found: "artificial; art; artifice; artificer; artless; factitious",
    chart_01_value: "high",
    reliability: "high",
    limitations: "A nineteenth-century checkpoint, not earliest evidence.",
    notes: "Strongest accessible public-domain fallback for sense boundaries.",
  },
  {
    source_name: "Johnson's Dictionary Online",
    source_type: "historical_dictionary",
    access_status: "partially_accessed",
    terms_checked: "artificial; artifice; artificer",
    terms_found: "Search interface accessible; direct stable term pages not captured.",
    chart_01_value: "medium",
    reliability: "high",
    limitations: "Interface/search output not stable enough for direct extraction here.",
    notes: "Direct Johnson verification remains a final-copy task.",
  },
  {
    source_name: "Johnson via Definitions.net",
    source_type: "backup_source",
    access_status: "accessed",
    terms_checked: "artificial; artifice; factitious",
    terms_found: "artifice; factitious; artificial secondary transcription referenced from previous pass",
    chart_01_value: "medium",
    reliability: "low",
    limitations: "Secondary transcription; do not treat as direct Johnson proof.",
    notes: "Useful as a pointer: artifice includes trick/fraud/stratagem and art/trade.",
  },
  {
    source_name: "Century Dictionary via Wordnik",
    source_type: "historical_dictionary",
    access_status: "accessed",
    terms_checked: "artificial; artifact",
    terms_found: "artificial; artifact",
    chart_01_value: "high",
    reliability: "medium",
    limitations: "Wordnik reproduces Century text but is not the original scan.",
    notes: "Very useful because it separates technical, skill/art, not-natural, imitation, fake, affected, and artful senses.",
  },
  {
    source_name: "Century / Webster via FineDictionary",
    source_type: "backup_source",
    access_status: "accessed",
    terms_checked: "artificial; artifice; artifact",
    terms_found: "artificial; artifice; artifact",
    chart_01_value: "medium",
    reliability: "medium",
    limitations: "Secondary dictionary aggregation; use as corroboration only.",
    notes: "Confirms Chambers/Century/Webster-style sense boundary patterns.",
  },
  {
    source_name: "Worcester Dictionary",
    source_type: "historical_dictionary",
    access_status: "search_only",
    terms_checked: "artificial; artifice",
    terms_found: "No stable direct extract found in this pass.",
    chart_01_value: "low",
    reliability: "medium",
    limitations: "Not enough accessible text found quickly.",
    notes: "Optional; Webster/Century cover the key boundary well enough.",
  },
  {
    source_name: "Imperial Dictionary",
    source_type: "historical_dictionary",
    access_status: "search_only",
    terms_checked: "artificial; artifice",
    terms_found: "No stable direct extract found in this pass.",
    chart_01_value: "low",
    reliability: "medium",
    limitations: "Not enough accessible text found quickly.",
    notes: "Optional backup only.",
  },
  {
    source_name: "Webster 1913 / Collaborative International Dictionary",
    source_type: "historical_dictionary",
    access_status: "accessed",
    terms_checked: "artificial; artificially; artifice",
    terms_found: "artificial; artificially; artifice",
    chart_01_value: "medium",
    reliability: "medium",
    limitations: "Later than Webster 1828; often derivative of earlier dictionary tradition.",
    notes: "Useful for technical phrases such as artificial arguments, lines, numbers and artificially as by skill/contrivance.",
  },
  {
    source_name: "Merriam-Webster",
    source_type: "modern_dictionary",
    access_status: "accessed",
    terms_checked: "artificial; artifice; artificer; art",
    terms_found: "artificial; artifice; artificer; art",
    chart_01_value: "high",
    reliability: "high",
    limitations: "Modern dictionary; not early quotation evidence.",
    notes: "Strong etymology and sense-boundary support.",
  },
  {
    source_name: "Cambridge Dictionary",
    source_type: "learner_dictionary",
    access_status: "accessed",
    terms_checked: "artificial",
    terms_found: "artificial",
    chart_01_value: "medium",
    reliability: "high",
    limitations: "Modern learner source only.",
    notes: "Good for distinguishing made-by-people/copy-of-nature from not sincere.",
  },
  {
    source_name: "Oxford Learner's Dictionary",
    source_type: "learner_dictionary",
    access_status: "accessed",
    terms_checked: "artificial",
    terms_found: "artificial",
    chart_01_value: "medium",
    reliability: "high",
    limitations: "Modern learner source only.",
    notes: "Useful for separating artificial, synthetic, false, man-made, fake, and imitation.",
  },
  {
    source_name: "Collins via WordReference",
    source_type: "modern_dictionary",
    access_status: "accessed",
    terms_checked: "artificial",
    terms_found: "artificial",
    chart_01_value: "medium",
    reliability: "medium",
    limitations: "Modern dictionary aggregation page.",
    notes: "Confirms Latin artificialis/artificium and modern sense separation.",
  },
  {
    source_name: "Wiktionary",
    source_type: "backup_source",
    access_status: "accessed",
    terms_checked: "artificer; artificial",
    terms_found: "artificer; artificial",
    chart_01_value: "low",
    reliability: "low",
    limitations: "Community-edited; use only as backup/source pointer.",
    notes: "Useful for Middle English artificer forms only if no stronger source is available.",
  },
  {
    source_name: "Rhetorica ad Herennium memory passage",
    source_type: "secondary_scholarly",
    access_status: "accessed",
    terms_checked: "artificial memory",
    terms_found: "artificial memory concept",
    chart_01_value: "medium",
    reliability: "medium",
    limitations: "Conceptual/rhetorical tradition source, not English lexical first-use evidence.",
    notes: "Good support for learned technique if framed carefully.",
  },
];

const dictionarySources = [
  {
    source_name: "Webster 1828",
    url: "https://webstersdictionary1828.com/Dictionary/artificial",
    access_status: "accessed",
    term: "artificial",
    publication_date: 1828,
    definition_summary:
      "Made or contrived by art/human skill and labor, opposed to natural; also feigned/fictitious/not genuine; includes technical rhetoric/math senses.",
    sense_classification: "mixed_bridge_sense",
    supports_chart_01: true,
    reliability_level: "high",
    limitations: "Strong public-domain checkpoint, but not earliest evidence.",
  },
  {
    source_name: "Etymonline",
    url: "https://www.etymonline.com/word/artificial",
    access_status: "accessed",
    term: "artificial",
    publication_date: "current",
    definition_summary:
      "Links word to Latin artificialis/artificium/artifex; separates artificial day, human skill/labor, imitation/substitute, insincere, and not-genuine chronology.",
    sense_classification: "mixed_bridge_sense",
    supports_chart_01: true,
    reliability_level: "medium",
    limitations: "Secondary etymology; dates require OED/primary verification.",
  },
  {
    source_name: "Merriam-Webster",
    url: "https://www.merriam-webster.com/dictionary/artificial",
    access_status: "accessed",
    term: "artificial",
    publication_date: 2026,
    definition_summary:
      "Modern entry and etymology preserve Middle English human-devised sense and Latin skill/art/make chain; archaic artful/cunning is separate.",
    sense_classification: "mixed_bridge_sense",
    supports_chart_01: true,
    reliability_level: "high",
    limitations: "Modern source, not early quotation record.",
  },
  {
    source_name: "Century Dictionary via Wordnik",
    url: "https://www.wordnik.com/words/artificial",
    access_status: "accessed",
    term: "artificial",
    publication_date: "late 19th / early 20th c. source reproduced online",
    definition_summary:
      "Separates art/rules/technical, skill/art construction, human skill opposed to natural, imitation/substitute, feigned/not genuine, affected, and artful/crafty.",
    sense_classification: "mixed_bridge_sense",
    supports_chart_01: true,
    reliability_level: "medium",
    limitations: "Reproduced on Wordnik; not original scan.",
  },
  {
    source_name: "Webster 1913 / Collaborative International Dictionary via Wordnik",
    url: "https://www.wordnik.com/words/artificial",
    access_status: "accessed",
    term: "artificial",
    publication_date: 1913,
    definition_summary:
      "Confirms made/contrived by art or human skill opposed to natural, fake/not genuine, archaic artful/cunning, and technical rhetoric/science senses.",
    sense_classification: "mixed_bridge_sense",
    supports_chart_01: true,
    reliability_level: "medium",
    limitations: "Later dictionary tradition; supporting not primary for early chronology.",
  },
  {
    source_name: "Johnson via Definitions.net",
    url: "https://www.definitions.net/definition/artifice",
    access_status: "accessed_secondary",
    term: "artifice",
    publication_date: 1755,
    definition_summary:
      "Secondary transcription gives artifice as trick/fraud/stratagem and art/trade.",
    sense_classification: "mixed_bridge_sense",
    supports_chart_01: true,
    reliability_level: "low",
    limitations: "Not direct Johnson extraction; must verify before final copy.",
  },
  {
    source_name: "Merriam-Webster",
    url: "https://www.merriam-webster.com/dictionary/artifice",
    access_status: "accessed",
    term: "artifice",
    publication_date: 2026,
    definition_summary:
      "Defines artifice as clever/artful skill and ingenious device, also trick and false/insincere behavior; etymology links art, craft, craftsmanship, cunning, and making.",
    sense_classification: "mixed_bridge_sense",
    supports_chart_01: true,
    reliability_level: "high",
    limitations: "Modern source, but very clear for bridge sense.",
  },
  {
    source_name: "Webster 1828",
    url: "https://webstersdictionary1828.com/Dictionary/artificer",
    access_status: "accessed",
    term: "artificer",
    publication_date: 1828,
    definition_summary:
      "Skilled maker/artist/mechanic/manufacturer and maker/contriver/inventor; obsolete cunning fellow is separate.",
    sense_classification: "art_skill_making",
    supports_chart_01: true,
    reliability_level: "high",
    limitations: "Strong but likely supporting evidence rather than main claim.",
  },
  {
    source_name: "Merriam-Webster",
    url: "https://www.merriam-webster.com/dictionary/artificer",
    access_status: "accessed",
    term: "artificer",
    publication_date: 2026,
    definition_summary:
      "Defines artificer as skilled/artistic worker/craftsman and one who makes or contrives; first known use 14th century.",
    sense_classification: "art_skill_making",
    supports_chart_01: true,
    reliability_level: "high",
    limitations: "Modern source; useful cross-check.",
  },
  {
    source_name: "Cambridge Dictionary",
    url: "https://dictionary.cambridge.org/dictionary/english/artificial",
    access_status: "accessed",
    term: "artificial",
    publication_date: 2026,
    definition_summary:
      "Modern entry distinguishes made by people/often as copy of nature from not sincere.",
    sense_classification: "not_natural",
    supports_chart_01: false,
    reliability_level: "high",
    limitations: "Boundary support only; not early history.",
  },
  {
    source_name: "Oxford Learner's Dictionary",
    url: "https://www.oxfordlearnersdictionaries.com/definition/english/artificial",
    access_status: "accessed",
    term: "artificial",
    publication_date: 2026,
    definition_summary:
      "Modern entry and thesaurus distinguish artificial, synthetic, false, man-made, fake, and imitation.",
    sense_classification: "mixed_bridge_sense",
    supports_chart_01: false,
    reliability_level: "high",
    limitations: "Modern boundary support only.",
  },
];

const historicalExtracts = [
  {
    id: "century_artificial_wordnik",
    source_name: "Century Dictionary via Wordnik",
    term: "artificial",
    year: "late 19th / early 20th c.",
    url: "https://www.wordnik.com/words/artificial",
    short_extract_or_summary:
      "Century separates technical/rules of art, skillful contrivance, human skill opposed to nature, imitation/substitute, feigned/not genuine, affected, and artful/crafty.",
    sense: "mixed_bridge_sense",
    chart_01_value: "high",
    reliability: "medium",
    limitation: "Online reproduction rather than original scan.",
  },
  {
    id: "webster_1913_artificial_wordnik",
    source_name: "Webster 1913 / GNU Collaborative International Dictionary via Wordnik",
    term: "artificial",
    year: 1913,
    url: "https://www.wordnik.com/words/artificial",
    short_extract_or_summary:
      "Gives made/contrived by art or human skill opposed to natural, not genuine, obsolete artful/cunning, and technical rhetoric/science senses.",
    sense: "mixed_bridge_sense",
    chart_01_value: "medium",
    reliability: "medium",
    limitation: "Later source; useful confirmation only.",
  },
  {
    id: "webster_1913_artificially_longdo",
    source_name: "Webster 1913 via Longdo",
    term: "artificially",
    year: 1913,
    url: "https://dict.longdo.com/search/*cia*?nocache=1",
    short_extract_or_summary:
      "Defines artificially as by art or skill and contrivance, not by nature; also skillfully and craftily as obsolete senses.",
    sense: "mixed_bridge_sense",
    chart_01_value: "medium",
    reliability: "low",
    limitation: "Search result/aggregator; use only as support.",
  },
  {
    id: "chambers_artificial_finedictionary",
    source_name: "Chambers 20th Century via FineDictionary",
    term: "artificial",
    year: "20th c.",
    url: "https://www.finedictionary.com/artificial",
    short_extract_or_summary:
      "Gives artificial as made by art, not natural, cultivated, feigned, and affected in manners.",
    sense: "mixed_bridge_sense",
    chart_01_value: "medium",
    reliability: "medium",
    limitation: "Secondary aggregation.",
  },
  {
    id: "johnson_artifice_definitions",
    source_name: "Johnson via Definitions.net",
    term: "artifice",
    year: 1755,
    url: "https://www.definitions.net/definition/artifice",
    short_extract_or_summary:
      "Secondary transcription: artifice includes trick/fraud/stratagem and art/trade.",
    sense: "mixed_bridge_sense",
    chart_01_value: "medium",
    reliability: "low",
    limitation: "Requires direct Johnson verification.",
  },
  {
    id: "johnson_factitious_definitions",
    source_name: "Johnson via Definitions.net",
    term: "factitious",
    year: 1755,
    url: "https://www.definitions.net/definition/FACTITIOUS",
    short_extract_or_summary:
      "Secondary Johnson transcription defines factitious as made by art, opposed to what is made by nature.",
    sense: "not_natural",
    chart_01_value: "low",
    reliability: "low",
    limitation: "Comparator only; not a central artificial source.",
  },
  {
    id: "wordnik_artifact_century",
    source_name: "Century Dictionary via Wordnik",
    term: "artifact",
    year: "late 19th / early 20th c.",
    url: "https://www.wordnik.com/words/artifact",
    short_extract_or_summary:
      "Artifact is described as anything made by art or an artificial product.",
    sense: "art_skill_making",
    chart_01_value: "low",
    reliability: "medium",
    limitation: "Background family evidence only.",
  },
];

const anchorSnippets = [
  {
    phrase: "artificial day",
    year: "late medieval claimed; 1755 secondary Johnson; 1800 Ngram visible",
    title: "Etymonline artificial; Johnson secondary transcription",
    author: "Douglas Harper; Samuel Johnson via secondary transcription",
    source_url: "https://www.etymonline.com/word/artificial",
    short_paraphrase: "Artificial day is the daylight span from sunrise to sunset, contrasted with a full natural day.",
    sense: "technical_rule_reckoning",
    confidence: "medium",
    chart_01_status: "supporting_anchor",
    notes: "Needs OED or primary quotation before public-facing core use.",
  },
  {
    phrase: "artificial memory",
    year: "classical/medieval tradition; English chronology unresolved",
    title: "Rhetorica ad Herennium memory passage",
    author: "Anonymous classical rhetorical text",
    source_url: "https://www.laits.utexas.edu/memoria/Ad_Herennium_Passages.html",
    short_paraphrase: "Artificial memory is memory strengthened by training, discipline, and method.",
    sense: "technical_rule_reckoning",
    confidence: "medium",
    chart_01_status: "supporting_anchor",
    notes: "Good learned-technique support; not an English earliest-use anchor.",
  },
  {
    phrase: "artificial arguments",
    year: 1828,
    title: "Webster 1828 artificial",
    author: "Noah Webster",
    source_url: "https://webstersdictionary1828.com/Dictionary/artificial",
    short_paraphrase: "Rhetorical arguments invented by the speaker, not external proofs such as laws or authorities.",
    sense: "technical_rule_reckoning",
    confidence: "high",
    chart_01_status: "supporting_anchor",
    notes: "Strong technical-rhetorical evidence but specialized.",
  },
  {
    phrase: "artificial lines",
    year: 1828,
    title: "Webster 1828 artificial",
    author: "Noah Webster",
    source_url: "https://webstersdictionary1828.com/Dictionary/artificial",
    short_paraphrase: "Lines on a scale/sector contrived to represent logarithmic sines and tangents for calculation.",
    sense: "technical_rule_reckoning",
    confidence: "high",
    chart_01_status: "supporting_anchor",
    notes: "Strong rule/calculation evidence.",
  },
  {
    phrase: "artificial numbers",
    year: 1828,
    title: "Webster 1828 artificial",
    author: "Noah Webster",
    source_url: "https://webstersdictionary1828.com/Dictionary/artificial",
    short_paraphrase: "Artificial numbers are logarithms.",
    sense: "technical_rule_reckoning",
    confidence: "high",
    chart_01_status: "supporting_anchor",
    notes: "Compact technical evidence.",
  },
  {
    phrase: "artificial method",
    year: "1800-2019 Ngram only",
    title: "Ngram visibility from previous pass",
    author: "Google Books",
    source_url: "https://books.google.com/ngrams/",
    short_paraphrase: "Visibility exists but sense is not confirmed in this source-completion pass.",
    sense: "unclear_or_unusable",
    confidence: "low",
    chart_01_status: "background_only",
    notes: "Do not use without snippet review.",
  },
  {
    phrase: "made by art",
    year: 1828,
    title: "Webster 1828 artificial and factitious",
    author: "Noah Webster",
    source_url: "https://webstersdictionary1828.com/Dictionary/artificial",
    short_paraphrase: "Definition language directly places artificial in made-by-art / human skill territory.",
    sense: "art_skill_making",
    confidence: "high",
    chart_01_status: "supporting_anchor",
    notes: "Useful as definition evidence, not a standalone phrase history.",
  },
  {
    phrase: "made by skill",
    year: "1800-2019 Ngram only",
    title: "Ngram visibility from previous pass",
    author: "Google Books",
    source_url: "https://books.google.com/ngrams/",
    short_paraphrase: "Generic phrase visibility; no strong Chart 1-specific snippet found.",
    sense: "art_skill_making",
    confidence: "low",
    chart_01_status: "background_only",
    notes: "Too generic.",
  },
  {
    phrase: "human skill",
    year: 1828,
    title: "Webster 1828 artificial",
    author: "Noah Webster",
    source_url: "https://webstersdictionary1828.com/Dictionary/artificial",
    short_paraphrase: "Artificial is defined through human skill/labor opposed to natural.",
    sense: "art_skill_making",
    confidence: "high",
    chart_01_status: "supporting_anchor",
    notes: "Good paraphrase support.",
  },
  {
    phrase: "contrived by art",
    year: 1828,
    title: "Webster 1828 artificial",
    author: "Noah Webster",
    source_url: "https://webstersdictionary1828.com/Dictionary/artificial",
    short_paraphrase: "Contrived by art supports construction/contrivance sense rather than fake by itself.",
    sense: "contrivance_construction",
    confidence: "high",
    chart_01_status: "background_only",
    notes: "Useful but risky if overemphasized.",
  },
  {
    phrase: "by art and human skill",
    year: 1828,
    title: "Webster 1828 artificial",
    author: "Noah Webster",
    source_url: "https://webstersdictionary1828.com/Dictionary/artificial",
    short_paraphrase: "The phrase captures the main source-backed boundary: by art/human skill, not necessarily fake.",
    sense: "art_skill_making",
    confidence: "high",
    chart_01_status: "supporting_anchor",
    notes: "Use carefully as paraphrase unless exact wording is checked.",
  },
];

const senseConfirmation = [
  {
    sense: "art_skill_making",
    confirmed_by_sources: "Webster 1828; Etymonline; Merriam-Webster; Century via Wordnik; Webster 1913",
    strongest_source: "Webster 1828 artificial and art",
    secondary_sources: "Etymonline; Merriam-Webster; Century via Wordnik",
    confidence: "high",
    earliest_confirmed_or_claimed_period: "late medieval/early 15c. claimed; 1828 secure public-domain checkpoint",
    notes: "Stable enough for content-structure planning; avoid exact earliest dates without OED.",
  },
  {
    sense: "technical_rule_reckoning",
    confirmed_by_sources: "Webster 1828; Webster 1913; Etymonline; Rhetorica ad Herennium",
    strongest_source: "Webster 1828 technical examples",
    secondary_sources: "Wordnik Webster 1913; Etymonline artificial day; memory-art source",
    confidence: "high",
    earliest_confirmed_or_claimed_period: "late medieval claimed for artificial day; 1828 secure for lines/numbers/arguments",
    notes: "Ready as supporting evidence; anchor prominence still needs manual judgment.",
  },
  {
    sense: "contrivance_construction",
    confirmed_by_sources: "Webster 1828; Merriam-Webster; Etymonline; Century via Wordnik",
    strongest_source: "Webster 1828 artificial/artifice",
    secondary_sources: "Merriam-Webster artifice; Etymonline artifice",
    confidence: "high",
    earliest_confirmed_or_claimed_period: "1828 secure; older chronology claimed in etymology sources",
    notes: "Bridge sense is confirmed; must not be equated with deception.",
  },
  {
    sense: "not_natural",
    confirmed_by_sources: "Webster 1828; Century via Wordnik; Cambridge; Oxford Learner's; Merriam-Webster",
    strongest_source: "Webster 1828 artificial",
    secondary_sources: "Century via Wordnik; Cambridge; Oxford Learner's",
    confidence: "high",
    earliest_confirmed_or_claimed_period: "late medieval claimed; 1828 secure",
    notes: "Confirmed as distinct from fake/not genuine.",
  },
  {
    sense: "imitation_substitute",
    confirmed_by_sources: "Etymonline; Century via Wordnik; Cambridge; Oxford Learner's; Collins via WordReference",
    strongest_source: "Century via Wordnik",
    secondary_sources: "Etymonline; Cambridge; Oxford Learner's",
    confidence: "medium",
    earliest_confirmed_or_claimed_period: "16c. claimed by Etymonline",
    notes: "Boundary sense only for Chart 1; mostly later chart territory.",
  },
  {
    sense: "fake_not_genuine",
    confirmed_by_sources: "Webster 1828; Etymonline; Century via Wordnik; Merriam-Webster; Oxford Learner's",
    strongest_source: "Webster 1828 artificial",
    secondary_sources: "Century via Wordnik; Merriam-Webster",
    confidence: "high",
    earliest_confirmed_or_claimed_period: "1640s claimed by Etymonline; 1828 secure",
    notes: "Confirmed as a separate sense, not the whole word.",
  },
  {
    sense: "affected_insincere",
    confirmed_by_sources: "Etymonline; Cambridge; Oxford Learner's; Century via Wordnik; Webster artless",
    strongest_source: "Century via Wordnik for artificial; Webster artless for family contrast",
    secondary_sources: "Cambridge; Oxford Learner's; Etymonline",
    confidence: "medium",
    earliest_confirmed_or_claimed_period: "1590s claimed by Etymonline; modern dictionaries secure",
    notes: "Useful boundary sense but not a Chart 1 center.",
  },
  {
    sense: "mixed_bridge_sense",
    confirmed_by_sources: "Webster 1828; Merriam-Webster artifice; Etymonline artifice; Johnson secondary transcription; Century via Wordnik",
    strongest_source: "Webster 1828 artifice and Merriam-Webster artifice",
    secondary_sources: "Etymonline; Johnson secondary; Century via Wordnik",
    confidence: "high",
    earliest_confirmed_or_claimed_period: "1828 secure; 1530s/1650s split claimed by Etymonline",
    notes: "Artifice is best treated as a bridge term.",
  },
  {
    sense: "unclear_or_unusable",
    confirmed_by_sources: "Ngram-only phrases and inaccessible sources",
    strongest_source: "N/A",
    secondary_sources: "N/A",
    confidence: "high",
    earliest_confirmed_or_claimed_period: "N/A",
    notes: "Use this label for unsupported phrase candidates.",
  },
];

const anchorStatus = [
  {
    phrase: "artificial day",
    source_count: 3,
    strongest_source: "Etymonline; Johnson secondary transcription",
    earliest_reliable_year_or_period: "late medieval claimed; 1755 secondary transcription; secure primary not yet captured",
    primary_sense: "technical_rule_reckoning",
    secondary_sense: "not_natural",
    chart_01_status: "supporting_anchor",
    confidence: "medium",
    public_facing_risk: "high",
    notes: "Semantically useful but too obscure for core without explanation/OED.",
  },
  {
    phrase: "artificial memory",
    source_count: 2,
    strongest_source: "Rhetorica ad Herennium memory tradition",
    earliest_reliable_year_or_period: "classical/medieval concept; English date unresolved",
    primary_sense: "technical_rule_reckoning",
    secondary_sense: "art_skill_making",
    chart_01_status: "supporting_anchor",
    confidence: "medium",
    public_facing_risk: "medium",
    notes: "Useful as learned-technique support, not English earliest-use proof.",
  },
  {
    phrase: "artificial arguments",
    source_count: 2,
    strongest_source: "Webster 1828",
    earliest_reliable_year_or_period: "1828 secure; Johnson direct check pending",
    primary_sense: "technical_rule_reckoning",
    secondary_sense: "art_skill_making",
    chart_01_status: "supporting_anchor",
    confidence: "high",
    public_facing_risk: "medium",
    notes: "Strong but specialized.",
  },
  {
    phrase: "artificial lines",
    source_count: 2,
    strongest_source: "Webster 1828 / Webster 1913",
    earliest_reliable_year_or_period: "1828 secure",
    primary_sense: "technical_rule_reckoning",
    secondary_sense: "contrivance_construction",
    chart_01_status: "supporting_anchor",
    confidence: "high",
    public_facing_risk: "medium",
    notes: "Strong technical calculation example.",
  },
  {
    phrase: "artificial numbers",
    source_count: 2,
    strongest_source: "Webster 1828 / Webster 1913",
    earliest_reliable_year_or_period: "1828 secure",
    primary_sense: "technical_rule_reckoning",
    secondary_sense: "",
    chart_01_status: "supporting_anchor",
    confidence: "high",
    public_facing_risk: "low",
    notes: "Compact example: logarithms.",
  },
  {
    phrase: "artificial method",
    source_count: 1,
    strongest_source: "Ngram only from previous pass",
    earliest_reliable_year_or_period: "not verified",
    primary_sense: "unclear_or_unusable",
    secondary_sense: "",
    chart_01_status: "background_only",
    confidence: "low",
    public_facing_risk: "high",
    notes: "Do not use without snippet evidence.",
  },
  {
    phrase: "made by art",
    source_count: 3,
    strongest_source: "Webster 1828; Century via Wordnik",
    earliest_reliable_year_or_period: "1828 secure",
    primary_sense: "art_skill_making",
    secondary_sense: "not_natural",
    chart_01_status: "supporting_anchor",
    confidence: "high",
    public_facing_risk: "low",
    notes: "Use as definitional support, not as phrase-history claim.",
  },
  {
    phrase: "made by skill",
    source_count: 1,
    strongest_source: "Ngram only",
    earliest_reliable_year_or_period: "not verified",
    primary_sense: "art_skill_making",
    secondary_sense: "",
    chart_01_status: "background_only",
    confidence: "low",
    public_facing_risk: "medium",
    notes: "Too generic.",
  },
  {
    phrase: "human skill",
    source_count: 3,
    strongest_source: "Webster 1828; Century via Wordnik; Merriam-Webster etymology",
    earliest_reliable_year_or_period: "1828 secure",
    primary_sense: "art_skill_making",
    secondary_sense: "",
    chart_01_status: "supporting_anchor",
    confidence: "high",
    public_facing_risk: "low",
    notes: "Good paraphrase support.",
  },
  {
    phrase: "contrived by art",
    source_count: 3,
    strongest_source: "Webster 1828; Merriam-Webster etymology; Century via Wordnik",
    earliest_reliable_year_or_period: "1828 secure",
    primary_sense: "contrivance_construction",
    secondary_sense: "art_skill_making",
    chart_01_status: "background_only",
    confidence: "medium",
    public_facing_risk: "medium",
    notes: "Confirmed, but keep secondary so contrivance does not dominate.",
  },
  {
    phrase: "by art and human skill",
    source_count: 3,
    strongest_source: "Webster 1828; Century via Wordnik; Etymonline artificially",
    earliest_reliable_year_or_period: "1828 secure; early 15c. claimed by Etymonline for artificially",
    primary_sense: "art_skill_making",
    secondary_sense: "contrivance_construction",
    chart_01_status: "supporting_anchor",
    confidence: "high",
    public_facing_risk: "low",
    notes: "Strong source-backed paraphrase; check exact wording if quoted.",
  },
];

const termRoles = [
  ["art", "core_node", "Webster 1828; Merriam-Webster; Etymonline", "art_skill_making;technical_rule_reckoning", "not needed", "high", "low", "keep_visible", "Core root, but define as skill/craft/rule."],
  ["artificial", "core_node", "Webster 1828; Etymonline; Merriam-Webster; Century", "mixed_bridge_sense", "strong previous Ngram", "high", "medium", "keep_visible", "Main node; label sense boundaries carefully."],
  ["artificially", "supporting_node", "Etymonline; Webster 1913; Webster 1828 prior note", "art_skill_making;contrivance_construction", "strong previous Ngram", "medium", "low", "keep_supporting", "Useful adverbial support."],
  ["artifice", "supporting_node", "Etymonline; Webster 1828; Merriam-Webster; Johnson secondary; Century", "mixed_bridge_sense", "strong previous Ngram", "high", "high", "keep_supporting", "Use as bridge, not pure deception."],
  ["artificer", "supporting_node", "Webster 1828; Merriam-Webster; Etymonline; Wiktionary backup", "art_skill_making", "visible previous Ngram", "medium", "medium", "keep_supporting", "Shows maker/craftsperson layer; probably not headline."],
  ["artificiality", "background_note", "Etymonline; modern dictionaries", "affected_insincere;art_skill_making", "visible previous Ngram", "low", "medium", "notes_only", "Later abstract/affective layer."],
  ["contrivance", "comparison_only", "Webster/Century/MW context", "contrivance_construction;mixed_bridge_sense", "strong previous Ngram", "medium", "high", "notes_only", "Useful boundary word but can hijack chart."],
  ["contrived", "comparison_only", "Webster/Century/MW context", "contrivance_construction", "strong previous Ngram", "medium", "high", "notes_only", "Use only as bridge explanation."],
  ["artful", "background_note", "Webster 1828; Merriam-Webster artificial archaic sense", "mixed_bridge_sense", "visible previous Ngram", "low", "medium", "notes_only", "Background for skill/cunning split."],
  ["artless", "background_note", "Webster 1828", "affected_insincere;art_skill_making", "visible previous Ngram", "low", "medium", "notes_only", "Useful inverse contrast, not chart node."],
  ["artisan", "background_note", "Etymonline; Wiktionary backup", "art_skill_making", "visible previous Ngram", "low", "medium", "notes_only", "Less direct than artificer."],
  ["artifact", "background_note", "Etymonline; Century via Wordnik", "art_skill_making;not_natural", "visible previous Ngram", "low", "medium", "notes_only", "Background family evidence only."],
  ["artefact", "background_note", "Etymonline; Century/Webster variants", "art_skill_making;not_natural", "visible previous Ngram", "low", "medium", "notes_only", "Variant/background only."],
  ["technical", "comparison_only", "Ngram only; modern paraphrase", "technical_rule_reckoning", "strong previous Ngram", "low", "medium", "notes_only", "Do not make a node."],
  ["mechanical", "exclude_for_chart_01", "Ngram only; too broad", "unclear_or_unusable", "strong previous Ngram", "none", "high", "exclude", "Not needed for Chart 1."],
].map(([term, recommended_role, source_support, sense_support, ngram_support, chart_01_value, risk, final_recommendation, notes]) => ({
  term,
  recommended_role,
  source_support,
  sense_support,
  ngram_support,
  chart_01_value,
  risk,
  final_recommendation,
  notes,
}));

const claimConfidence = [
  ["Artificial originally relates to art, skill, and making.", "mostly_safe", "Webster 1828; Etymonline; Merriam-Webster; Century via Wordnik", "high", "avoid precise earliest-date wording without OED", "yes_with_care", "Use 'early/older layer' rather than exact origin date."],
  ["Artificial does not simply mean fake.", "safe", "Webster 1828; Century via Wordnik; Merriam-Webster", "high", "low", "yes", "Strongly supported."],
  ["Not natural and fake are distinct senses.", "safe", "Webster 1828; Century via Wordnik; Cambridge; Oxford Learner's", "high", "low", "yes", "Core Chart 1 distinction."],
  ["Contrivance bridges skillful construction and suspicion.", "safe", "Webster 1828 artifice; Merriam-Webster artifice; Etymonline artifice", "high", "medium", "yes_with_care", "Use bridge label."],
  ["Artifice should be shown as both making and possible deception.", "mostly_safe", "Etymonline; Webster 1828; Merriam-Webster; Johnson secondary", "high", "high", "yes_with_care", "Potential overread risk; not pure deception."],
  ["Artificer helps reveal the maker/craftsperson layer.", "mostly_safe", "Webster 1828; Merriam-Webster; Etymonline", "high", "medium", "yes_with_care", "Probably supporting, not necessarily central."],
  ["Artificial day supports a technical/reckoning sense.", "partially_supported", "Etymonline; Johnson secondary", "medium", "high", "notes_only", "Needs OED/primary check before visible anchor."],
  ["Artificial memory supports a learned-technique sense.", "partially_supported", "Rhetorica ad Herennium; Cambridge scholarly summary from prior pass", "medium", "medium", "notes_only", "Good concept, unresolved English chronology."],
  ["Artificial arguments/lines/numbers support rule-based technical senses.", "safe", "Webster 1828; Webster 1913 via Wordnik", "high", "medium", "yes_with_care", "Specialized but secure."],
  ["Webster 1828 is sufficient as fallback authority if OED is unavailable.", "mostly_safe", "Webster 1828; corroborated by Century/MW/Etymonline", "high", "medium", "yes_with_care", "Sufficient for sense boundaries, not earliest dates."],
  ["OED is required for precise earliest-date claims.", "safe", "OED not accessed; Etymonline dates are secondary", "high", "low", "yes", "Treat as editorial guardrail."],
  ["Johnson is useful but not strictly required if Webster/Etymonline/MW are strong.", "mostly_safe", "Webster 1828; Etymonline; MW; Century", "medium", "medium", "yes_with_care", "Johnson still desirable, especially for 1755 bridge."],
].map(([claim, status, strongest_supporting_sources, evidence_strength, risk, can_use_in_chart_01, notes]) => ({
  claim,
  status,
  strongest_supporting_sources,
  evidence_strength,
  risk,
  can_use_in_chart_01,
  notes,
}));

const unresolved = [
  ["OED artificial", "Not accessed", "Needed for precise earliest-date claims and obsolete technical senses.", "blocks_final_copy", "Check OED before final copy.", "Does not block content-structure planning if Webster fallback is accepted."],
  ["OED artifice/artificer", "Not accessed", "Needed if either becomes a visible node with historical dates.", "blocks_final_copy", "Check OED if visible.", "Can plan structure with caveat."],
  ["Johnson direct artificial/artifice", "Direct stable extraction not captured", "Would strengthen 1755 bridge evidence.", "blocks_final_copy", "Use Johnson site or scan manually.", "Not strictly blocking if Webster/Century/MW are enough."],
  ["MED artificial/artifice/artificer", "Search-only, no stable entry found", "Could confirm Middle English forms if available.", "optional", "Deeper MED search if OED unavailable.", "Probably optional."],
  ["Artificial day", "Obscure and not primary-verified", "May be tempting as early technical anchor.", "blocks_final_copy", "Verify OED/primary snippet before visible use.", "Currently notes/supporting only."],
  ["Artificial memory", "Concept strong, English chronology unresolved", "Good learned-technique example but risky as early English anchor.", "blocks_final_copy", "Find dated English snippet or keep notes-only.", "Can support concept in notes."],
  ["Artifice visibility", "Bridge term can be misread as only deception", "Could distort Chart 1 if central.", "minor_risk", "Keep bridge framing.", "Safe with care."],
  ["Ngram years", "First-visible years can be mistaken for attestations", "Could create false chronology.", "minor_risk", "Do not use Ngram years as dates.", "Use only visibility evidence."],
].map(([item, issue, why_it_matters, blocking_level, next_action, notes]) => ({
  item,
  issue,
  why_it_matters,
  blocking_level,
  next_action,
  notes,
}));

const sourceAccessLog = sourceCoverage.map((source) => ({
  source_name: source.source_name,
  url:
    source.source_name === "Webster 1828"
      ? "https://webstersdictionary1828.com/Dictionary/artificial"
      : source.source_name === "Etymonline"
        ? "https://www.etymonline.com/word/artificial"
        : source.source_name === "Merriam-Webster"
          ? "https://www.merriam-webster.com/dictionary/artificial"
          : source.source_name === "Century Dictionary via Wordnik"
            ? "https://www.wordnik.com/words/artificial"
            : source.source_name === "Johnson via Definitions.net"
              ? "https://www.definitions.net/definition/artifice"
              : source.source_name === "Middle English Dictionary"
                ? "https://quod.lib.umich.edu/m/middle-english-dictionary/dictionary"
                : "",
  access_status: source.access_status,
  checked_for: source.terms_checked,
  result: source.terms_found,
  limitation: source.limitations,
}));

async function main() {
  await Promise.all([RAW_DIR, PROCESSED_DIR, NOTES_DIR, SOURCES_DIR].map((directory) => mkdir(directory, { recursive: true })));

  await writeFile(path.join(RAW_DIR, "round_04_dictionary_sources.json"), `${JSON.stringify(dictionarySources, null, 2)}\n`);
  await writeFile(
    path.join(RAW_DIR, "round_04_historical_dictionary_extracts.json"),
    `${JSON.stringify(historicalExtracts, null, 2)}\n`,
  );
  await writeFile(
    path.join(RAW_DIR, "round_04_anchor_snippets.csv"),
    `${csvRows(
      ["phrase", "year", "title", "author", "source_url", "short_paraphrase", "sense", "confidence", "chart_01_status", "notes"],
      anchorSnippets,
    )}\n`,
  );
  await writeFile(
    path.join(RAW_DIR, "round_04_source_access_log.csv"),
    `${csvRows(["source_name", "url", "access_status", "checked_for", "result", "limitation"], sourceAccessLog)}\n`,
  );

  await writeFile(
    path.join(PROCESSED_DIR, "round_04_source_coverage_matrix.csv"),
    `${csvRows(
      ["source_name", "source_type", "access_status", "terms_checked", "terms_found", "chart_01_value", "reliability", "limitations", "notes"],
      sourceCoverage,
    )}\n`,
  );
  await writeFile(
    path.join(PROCESSED_DIR, "round_04_sense_confirmation_matrix.csv"),
    `${csvRows(
      ["sense", "confirmed_by_sources", "strongest_source", "secondary_sources", "confidence", "earliest_confirmed_or_claimed_period", "notes"],
      senseConfirmation,
    )}\n`,
  );
  await writeFile(
    path.join(PROCESSED_DIR, "round_04_anchor_phrase_status.csv"),
    `${csvRows(
      [
        "phrase",
        "source_count",
        "strongest_source",
        "earliest_reliable_year_or_period",
        "primary_sense",
        "secondary_sense",
        "chart_01_status",
        "confidence",
        "public_facing_risk",
        "notes",
      ],
      anchorStatus,
    )}\n`,
  );
  await writeFile(
    path.join(PROCESSED_DIR, "round_04_term_role_final_check.csv"),
    `${csvRows(
      [
        "term",
        "recommended_role",
        "source_support",
        "sense_support",
        "ngram_support",
        "chart_01_value",
        "risk",
        "final_recommendation",
        "notes",
      ],
      termRoles,
    )}\n`,
  );
  await writeFile(
    path.join(PROCESSED_DIR, "round_04_claim_confidence_table.csv"),
    `${csvRows(
      ["claim", "status", "strongest_supporting_sources", "evidence_strength", "risk", "can_use_in_chart_01", "notes"],
      claimConfidence,
    )}\n`,
  );
  await writeFile(
    path.join(PROCESSED_DIR, "round_04_unresolved_items.csv"),
    `${csvRows(["item", "issue", "why_it_matters", "blocking_level", "next_action", "notes"], unresolved)}\n`,
  );

  await writeFile(
    path.join(SOURCES_DIR, "round_04_source_urls.md"),
    `# Round 04 Source URLs

- Webster 1828 artificial: https://webstersdictionary1828.com/Dictionary/artificial
- Webster 1828 art: https://webstersdictionary1828.com/Dictionary/art
- Webster 1828 artifice: https://webstersdictionary1828.com/Dictionary/artifice
- Webster 1828 artificer: https://webstersdictionary1828.com/Dictionary/artificer
- Etymonline artificial: https://www.etymonline.com/word/artificial
- Etymonline artificially: https://www.etymonline.com/word/artificially
- Etymonline artifice: https://www.etymonline.com/word/artifice
- Etymonline artificer: https://www.etymonline.com/word/artificer
- Merriam-Webster artificial: https://www.merriam-webster.com/dictionary/artificial
- Merriam-Webster artifice: https://www.merriam-webster.com/dictionary/artifice
- Merriam-Webster artificer: https://www.merriam-webster.com/dictionary/artificer
- Wordnik artificial / Century / Webster 1913: https://www.wordnik.com/words/artificial
- Definitions.net artifice / Johnson secondary: https://www.definitions.net/definition/artifice
- Middle English Dictionary search: https://quod.lib.umich.edu/m/middle-english-dictionary/dictionary
- Rhetorica ad Herennium memory passage: https://www.laits.utexas.edu/memoria/Ad_Herennium_Passages.html
`,
  );

  await writeFile(
    path.join(NOTES_DIR, "round_04_collection_log.md"),
    `# Round 04 Collection Log

Generated: ${generatedAt}

## Scope

Source-completion / no-obvious-gap evidence pass for Chart 1 only. No visuals, React, layout, final chart copy, or later artificial topics.

## Script

- \`scripts/source_completion_chart_01_round_04.ts\`

## Output Root

- \`docs/research/artificial/chart_01_art_artifice/source_completion_round_04\`

## Sources Checked

- OED: noted as not accessible.
- MED: search-only; no stable exact relevant entry surfaced.
- Etymonline: accessed.
- Webster 1828: accessed.
- Johnson's Dictionary Online: partially accessible; direct stable extraction not captured.
- Johnson via Definitions.net: accessed as secondary transcription.
- Century via Wordnik / FineDictionary: accessed as reproduced/aggregated text.
- Worcester / Imperial: search-only, no stable extract captured.
- Webster 1913 / Collaborative International Dictionary: accessed through Wordnik/aggregators.
- Merriam-Webster, Cambridge, Oxford Learner's, Collins/WordReference, Wiktionary backup: checked where useful.
- Rhetorica ad Herennium memory passage: accessed for artificial memory concept.

## Manual Steps

- Kept exact quotations short and used paraphrase for dictionary content.
- Marked secondary transcriptions as lower reliability.
- Separated source accessibility from claim confidence.

## Assumptions

- Webster 1828 is sufficient as fallback for sense-boundary planning, but not for earliest-date claims.
- OED remains required for precise earliest dates and full sense ordering.
- Ngram remains visibility-only from previous rounds and is not treated as semantic proof here.
`,
  );

  await writeFile(
    path.join(NOTES_DIR, "round_04_source_notes.md"),
    `# Round 04 Source Notes

Generated: ${generatedAt}

## Best Sources For Chart 1

- Webster 1828: best accessible public-domain sense-boundary source.
- Etymonline: best compact chronology and etymology guide; verify dates later.
- Merriam-Webster: strong modern etymology and bridge-sense support.
- Century via Wordnik: very useful corroboration because it lays out technical, skill/art, not-natural, imitation, fake, affected, and artful senses separately.

## Backup / Partial Sources

- Johnson via Definitions.net is useful as a pointer, but not direct proof.
- Webster 1913 / Collaborative International Dictionary confirms technical phrases and older dictionary tradition.
- Chambers/Collins/FineDictionary/WordReference are useful corroboration, not primary anchors.
- MED and Worcester/Imperial remain optional or search-only in this pass.

## Source-Coverage Conclusion

There is now enough source diversity for Chart 1 content-structure planning, provided the visual/text does not make precise earliest-date claims before OED/Johnson verification.
`,
  );

  await writeFile(
    path.join(NOTES_DIR, "round_04_evidence_synthesis.md"),
    `# Round 04 Evidence Synthesis

Generated: ${generatedAt}

## 1. Overview

This source-completion pass found no major new conceptual gap for Chart 1. The art/skill/making layer is confirmed by multiple source types: Webster 1828, Etymonline, Merriam-Webster, and Century/Webster 1913 reproductions. The remaining gaps are about earliest dates and direct Johnson/OED verification, not about the basic sense boundary.

## 2. Evidence For Art / Skill / Making

Webster 1828 is the strongest accessible checkpoint: artificial is defined through art, human skill, and labor, while art itself is framed as skill and rule-governed practice. Etymonline and Merriam-Webster independently support the Latin art/skill/make chain. Century via Wordnik confirms the same boundary in a separate historical dictionary tradition.

## 3. Evidence For Technical Rule / Reckoning

Artificial arguments, artificial lines, and artificial numbers are now the strongest technical anchors because Webster 1828 and Webster 1913-style sources both support them. Artificial day remains semantically useful but needs OED/primary support. Artificial memory supports learned technique but should not be framed as an English earliest-use anchor yet.

## 4. Evidence For Contrivance As Bridge Sense

Artifice is the best bridge term. Etymonline distinguishes workmanship/craft from later trick; Webster 1828 gives good/bad sense; Merriam-Webster explicitly explains artifice as both creative skill and falseness/trickery. This confirms contrivance as bridge, not deception alone.

## 5. Evidence Separating Not-Natural From Fake

Webster 1828 and Century via Wordnik are the clearest sources because they separate made-by-art/opposed-to-natural from feigned/fictitious/not genuine. Cambridge and Oxford Learner's confirm that modern usage also separates made-by-people/copy-of-nature from insincere/fake senses.

## 6. Status Of Artifice

Artifice is safe as a supporting bridge term, not as a pure deception term and probably not as the only central node. It should be used with a warning label in the data: skillful making and possible trickery coexist.

## 7. Status Of Artificer

Artificer is useful as supporting evidence for the maker/craftsperson layer. Webster 1828 and Merriam-Webster are strong enough for content-structure planning. It probably does not need to be a core visible node unless the chart needs a maker figure.

## 8. Status Of Artificial Day

Artificial day remains supporting/notes-only unless OED or a primary snippet is checked. It is semantically excellent but public-facing risk is high because the phrase is obscure.

## 9. Status Of Artificial Memory

Artificial memory is a good learned-technique example, supported conceptually by rhetoric/memory-art tradition. It should stay notes/supporting until a dated English lexical example is captured.

## 10. Status Of Artificial Arguments / Lines / Numbers

These are now the strongest technical-rule anchors. They are specialized, but Webster-backed and useful for proving that artificial can mean rule-made or technically constructed rather than fake.

## 11. What Is Now Safe For Chart 1

It is safe to structure around artificial as art/skill/making, not simply fake; not natural and fake as distinct senses; and artifice as a bridge between skillful contrivance and suspicion. Webster 1828 can serve as fallback for sense boundaries.

## 12. What Remains Unsafe Or Too Uncertain

Precise earliest dates remain unsafe without OED. Johnson should not be cited as direct evidence until verified directly. Artificial day and artificial memory should not become core public anchors without more verification.
`,
  );

  await writeFile(
    path.join(NOTES_DIR, "round_04_safe_claims.md"),
    `# Round 04 Safe Claims

Generated: ${generatedAt}

## Safe To Use

- Artificial does not simply mean fake.
- Not natural and fake are distinct senses.
- Artificial has a strong art/skill/making layer.
- Contrivance can bridge skilled construction and suspicion.
- Artificial arguments / lines / numbers support technical rule/reckoning senses.

## Safe With Care

- Artificial originally relates to art, skill, and making. Use without precise earliest-date claims unless OED is checked.
- Artifice should be shown as both making/skill and possible deception.
- Artificer helps reveal the maker/craftsperson layer, but may be supporting rather than core.
- Webster 1828 is sufficient fallback for sense-boundary planning if OED is unavailable.

## Notes Only

- Artificial day as early technical/reckoning phrase until OED/primary support is captured.
- Artificial memory as learned-technique evidence until English chronology is clearer.
- Artful/artless, artifact/artefact, artisan, technical, mechanical.

## Do Not Claim Yet

- Do not claim exact earliest sense order.
- Do not claim artificial day is broadly legible.
- Do not claim artificial memory is an early English lexical anchor.
- Do not claim artifice means only deception.
- Do not claim Ngram years are attestations.
`,
  );

  await writeFile(
    path.join(NOTES_DIR, "round_04_remaining_risks.md"),
    `# Round 04 Remaining Risks

Generated: ${generatedAt}

- OED not accessed: blocks precise earliest-date claims and full obsolete-sense ordering.
- Johnson direct text not confirmed: secondary transcriptions are useful pointers but not final evidence.
- Artificial day remains obscure and primary verification is missing.
- Artificial memory chronology is uncertain for English use.
- Artifice can be overread as deception if not labeled as a bridge.
- Ngram first-visible years could be mistaken for attestations; keep them out of evidence claims.
- Modern senses can leak into Chart 1 if Cambridge/Oxford Learner's are treated as historical sources.
- Webster 1828 is strong but nineteenth-century; use it as fallback for sense boundaries, not origin dates.
- Century/Wordnik and FineDictionary are reproductions/aggregations; good corroboration, not the highest authority.
`,
  );

  console.log("Round 04 source completion package complete.");
}

await main();
