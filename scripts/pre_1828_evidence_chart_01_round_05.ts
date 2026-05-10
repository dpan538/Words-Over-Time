import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const BASE_DIR = path.join(
  process.cwd(),
  "docs",
  "research",
  "artificial",
  "chart_01_art_artifice",
  "pre_1828_evidence_round_05",
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

const sourceAccessLog = [
  {
    source_name: "Oxford English Dictionary",
    url: "https://www.oed.com/",
    access_status: "not_accessible",
    searched_for: "artificial; artifice; artificer; artificially; artificial day",
    result: "Not accessed in this environment.",
    limitations: "Subscription source; use later for earliest quotations and exact sense order.",
  },
  {
    source_name: "Middle English Dictionary",
    url: "https://quod.lib.umich.edu/m/middle-english-dictionary/dictionary",
    access_status: "search_only",
    searched_for: "artificial; artifice; artificer",
    result: "Search did not surface stable exact entries for the target terms.",
    limitations: "Further interface-specific searching may be needed.",
  },
  {
    source_name: "Etymonline artificial",
    url: "https://www.etymonline.com/word/artificial",
    access_status: "accessed",
    searched_for: "artificial; artificial day; sense chronology",
    result: "Late 14c. / early 15c. claimed chronology and word-family etymology captured.",
    limitations: "Secondary source; date claims require OED/primary verification.",
  },
  {
    source_name: "Etymonline artificially",
    url: "https://www.etymonline.com/word/artificially",
    access_status: "accessed",
    searched_for: "artificially",
    result: "Early 15c. adverbial sense by art or human skill and contrivance captured.",
    limitations: "Secondary source; date claims require OED/primary verification.",
  },
  {
    source_name: "Merriam-Webster artificial",
    url: "https://www.merriam-webster.com/dictionary/artificial",
    access_status: "accessed",
    searched_for: "Middle English artificial; etymology",
    result: "15th-century first known use and Latin ars/facere etymology captured.",
    limitations: "Modern dictionary; not a quotation database.",
  },
  {
    source_name: "Johnson's Dictionary Online",
    url: "https://johnsonsdictionaryonline.com/views/search.php?term=artificial",
    access_status: "partially_accessed",
    searched_for: "artificial; artifice; artificer",
    result: "Search pages accessible, but direct stable entry text not captured.",
    limitations: "Requires manual site interaction or page-image lookup.",
  },
  {
    source_name: "Johnson via secondary sources",
    url: "https://www.definitions.net/definition/artifice",
    access_status: "accessed_secondary",
    searched_for: "Johnson artifice; Johnson artificial",
    result: "Secondary artifice entry captured; artificial entry referenced by scholarly snippet from 1773/1755.",
    limitations: "Not a substitute for direct Johnson source.",
  },
  {
    source_name: "Project Gutenberg: Richard Sherry, A Treatise of Schemes and Tropes",
    url: "https://www.gutenberg.org/files/28447/28447-h/28447-h.htm",
    access_status: "accessed",
    searched_for: "artificiall / vnartificial rhetorical proofs",
    result: "1550 rhetorical artificiall/vnartificial proof distinction captured.",
    limitations: "Facsimile reproduction/transcription; still public-domain and stable.",
  },
  {
    source_name: "EEBO / OTA: Thomas Wilson, The Arte of Rhetorique",
    url: "https://ota.bodleian.ox.ac.uk/repository/xmlui/bitstream/handle/20.500.12024/3153/3153.html?isAllowed=y&sequence=6",
    access_status: "accessed",
    searched_for: "artificiall memory",
    result: "1553 natural/artificiall memory division captured.",
    limitations: "Early spelling and transcription conventions require care.",
  },
  {
    source_name: "University of Texas: Rhetorica ad Herennium memory passage",
    url: "https://www.laits.utexas.edu/memoria/Ad_Herennium_Passages.html",
    access_status: "accessed",
    searched_for: "artificial memory concept",
    result: "Natural vs artificial memory concept captured.",
    limitations: "Classical source/translation; concept history, not English first-use proof.",
  },
  {
    source_name: "MAA: Napier and logarithms",
    url: "https://old.maa.org/press/periodicals/convergence/napiers-binary-chessboard-calculator-napier-and-logarithms",
    access_status: "accessed",
    searched_for: "artificial numbers",
    result: "Napier's artificial numbers/logarithms context captured.",
    limitations: "Secondary history of mathematics source, but reliable and dated to 1614/1619 context.",
  },
  {
    source_name: "Wikisource / Britannica: Napier",
    url: "https://en.wikisource.org/wiki/1911_Encyclop%C3%A6dia_Britannica/Napier%2C_John",
    access_status: "accessed",
    searched_for: "artificial numbers",
    result: "Public-domain encyclopedia confirmation that Napier used artificial numbers before logarithm naming.",
    limitations: "Post-1828 encyclopedia about pre-1828 text.",
  },
  {
    source_name: "Bailey / Ash / Sheridan / Walker",
    url: "",
    access_status: "search_only",
    searched_for: "artificial; artifice; artificer",
    result: "No stable useful direct extract captured in this pass.",
    limitations: "Could be checked via scans later if needed; Johnson/Webster/Century already cover key boundary.",
  },
];

const dictionaryExtracts = [
  {
    id: "etymonline_artificial_pre1828",
    source_name: "Etymonline",
    term: "artificial",
    variant_spelling: "artificial; Old French artificial; Latin artificialis",
    year_or_period: "late 14c.; early 15c.; 16c.; 1590s; 1640s claimed",
    source_type: "etymology_source",
    source_url: "https://www.etymonline.com/word/artificial",
    short_summary:
      "Gives artificial as late-14c. from Old French/Latin, earliest English phrase artificial day, made-by-human-skill sense from early 15c., imitation from 16c., insincere from 1590s, not-genuine from 1640s.",
    sense: "word_family_etymology",
    confidence: "medium",
    pre_1828_value: "strong",
    notes: "Strong guide but exact dates need OED/primary confirmation.",
  },
  {
    id: "mw_artificial_middle_english",
    source_name: "Merriam-Webster",
    term: "artificial",
    variant_spelling: "Middle English artificial",
    year_or_period: "15th century first known use",
    source_type: "etymology_source",
    source_url: "https://www.merriam-webster.com/dictionary/artificial",
    short_summary:
      "Gives Middle English artificial and Latin artificialis/artificium chain from ars skill plus facere make/do.",
    sense: "word_family_etymology",
    confidence: "medium",
    pre_1828_value: "strong",
    notes: "Good independent confirmation that the word predates 1828.",
  },
  {
    id: "etymonline_artificially_pre1828",
    source_name: "Etymonline",
    term: "artificially",
    variant_spelling: "artificially",
    year_or_period: "early 15c. claimed",
    source_type: "etymology_source",
    source_url: "https://www.etymonline.com/word/artificially",
    short_summary:
      "Gives artificially as an early-15c. adverb meaning by art, human skill, and contrivance.",
    sense: "art_skill_making",
    confidence: "medium",
    pre_1828_value: "strong",
    notes: "Important because the adverb preserves the art/skill/contrivance layer directly.",
  },
  {
    id: "etymonline_artifice_pre1828",
    source_name: "Etymonline",
    term: "artifice",
    variant_spelling: "artifice",
    year_or_period: "1530s; 1650s claimed",
    source_type: "etymology_source",
    source_url: "https://www.etymonline.com/word/artifice",
    short_summary:
      "Gives artifice first as workmanship/making by craft or skill, with crafty device/trick later.",
    sense: "word_family_etymology",
    confidence: "medium",
    pre_1828_value: "strong",
    notes: "Strong bridge evidence; direct OED would improve confidence.",
  },
  {
    id: "etymonline_artificer_pre1828",
    source_name: "Etymonline",
    term: "artificer",
    variant_spelling: "artificer",
    year_or_period: "late 14c.; c.1600 claimed",
    source_type: "etymology_source",
    source_url: "https://www.etymonline.com/word/artificer",
    short_summary:
      "Gives artificer as one who makes by art or skill, with later devious-artifice specialization.",
    sense: "word_family_etymology",
    confidence: "medium",
    pre_1828_value: "strong",
    notes: "Good maker/craftsperson support before 1828.",
  },
  {
    id: "johnson_artificial_secondary_pre1828",
    source_name: "Johnson's Dictionary via scholarly/secondary references",
    term: "artificial",
    variant_spelling: "artificial",
    year_or_period: "1755 / 1773",
    source_type: "historical_dictionary",
    source_url: "https://johnsonsdictionaryonline.com/views/search.php?term=artificial",
    short_summary:
      "Secondary/scholarly references report Johnson senses: made by art/not natural; fictitious/not genuine; artful/contrived with skill.",
    sense: "mixed_bridge_sense",
    confidence: "low",
    pre_1828_value: "medium",
    notes: "Useful pointer but direct Johnson entry still needs manual verification.",
  },
  {
    id: "johnson_artifice_secondary_pre1828",
    source_name: "Johnson via Definitions.net",
    term: "artifice",
    variant_spelling: "artifice",
    year_or_period: "1755",
    source_type: "historical_dictionary",
    source_url: "https://www.definitions.net/definition/artifice",
    short_summary:
      "Secondary transcription gives artifice as trick/fraud/stratagem and art/trade.",
    sense: "mixed_bridge_sense",
    confidence: "low",
    pre_1828_value: "medium",
    notes: "Confirms bridge shape if verified directly.",
  },
];

const textSnippets = [
  {
    id: "sherry_1550_artificiall_proves",
    term_or_phrase: "artificial arguments",
    variant_spelling: "artificiall; vnartificial",
    year_or_period: "1550",
    source_title: "A Treatise of Schemes and Tropes",
    source_author: "Richard Sherry",
    source_type: "primary_text",
    source_url: "https://www.gutenberg.org/files/28447/28447-h/28447-h.htm",
    sense: "technical_rule_reckoning",
    confidence: "high",
    short_summary:
      "Rhetorical proofs are divided into artificiall and vnartificial; artificial proofs are made by the disputant's wit, while inartificial proofs are supplied otherwise.",
    pre_1828_value: "strong",
    chart_01_usefulness: "supporting",
    notes: "Excellent pre-1828 technical/rhetorical anchor.",
  },
  {
    id: "wilson_1553_artificiall_memory",
    term_or_phrase: "artificial memory",
    variant_spelling: "artificiall; memorie",
    year_or_period: "1553",
    source_title: "The Arte of Rhetorique",
    source_author: "Thomas Wilson",
    source_type: "primary_text",
    source_url: "https://ota.bodleian.ox.ac.uk/repository/xmlui/bitstream/handle/20.500.12024/3153/3153.html?isAllowed=y&sequence=6",
    sense: "technical_rule_reckoning",
    confidence: "high",
    short_summary:
      "Memory is divided into natural and artificiall, where natural memory works without precepts and artificial memory belongs to the teachable art of memory.",
    pre_1828_value: "strong",
    chart_01_usefulness: "supporting",
    notes: "Strong English pre-1828 learned-technique anchor.",
  },
  {
    id: "fulwood_1562_artificiall_memorie",
    term_or_phrase: "artificial memory",
    variant_spelling: "Artificiall Memorie",
    year_or_period: "1562",
    source_title: "The Castel of Memorie",
    source_author: "William Fulwood / Guglielmo Gratarolo",
    source_type: "secondary_scholarly",
    source_url: "https://deepblue.lib.umich.edu/bitstream/handle/2027.42/99866/bozio_1.pdf?sequence=1",
    sense: "technical_rule_reckoning",
    confidence: "medium",
    short_summary:
      "Scholarly quotation reports Artificiall Memorie as an ordered placing of sensible things in the mind by imagination so natural memory can recall them.",
    pre_1828_value: "medium",
    chart_01_usefulness: "supporting",
    notes: "Strong concept; direct public-domain text would be better than dissertation quotation.",
  },
  {
    id: "ad_herennium_artificial_memory_concept",
    term_or_phrase: "artificial memory",
    variant_spelling: "artificial memory",
    year_or_period: "classical source; modern translation",
    source_title: "Rhetorica ad Herennium passages on memory",
    source_author: "Anonymous; translated excerpt",
    source_type: "secondary_scholarly",
    source_url: "https://www.laits.utexas.edu/memoria/Ad_Herennium_Passages.html",
    sense: "technical_rule_reckoning",
    confidence: "medium",
    short_summary:
      "Artificial memory is contrasted with natural memory and strengthened by training and discipline.",
    pre_1828_value: "medium",
    chart_01_usefulness: "background",
    notes: "Concept history, not English word-history evidence by itself.",
  },
  {
    id: "napier_artificial_numbers",
    term_or_phrase: "artificial numbers",
    variant_spelling: "artificial numbers",
    year_or_period: "1614/1619 context",
    source_title: "John Napier and logarithms",
    source_author: "MAA / Britannica-Wikisource summaries",
    source_type: "secondary_scholarly",
    source_url: "https://old.maa.org/press/periodicals/convergence/napiers-binary-chessboard-calculator-napier-and-logarithms",
    sense: "technical_rule_reckoning",
    confidence: "medium",
    short_summary:
      "Napier first announced or described logarithms as artificial numbers before or around the naming of logarithms.",
    pre_1828_value: "strong",
    chart_01_usefulness: "supporting",
    notes: "Good pre-1828 mathematical/reckoning support; primary Latin text could be checked later.",
  },
  {
    id: "johnson_artificial_secondary",
    term_or_phrase: "artificial",
    variant_spelling: "artificial",
    year_or_period: "1755/1773",
    source_title: "A Dictionary of the English Language",
    source_author: "Samuel Johnson via secondary/scholarly references",
    source_type: "historical_dictionary",
    source_url: "https://johnsonsdictionaryonline.com/views/search.php?term=artificial",
    sense: "mixed_bridge_sense",
    confidence: "low",
    short_summary:
      "Johnson is reported to list made by art/not natural, fictitious/not genuine, and artful/contrived with skill.",
    pre_1828_value: "medium",
    chart_01_usefulness: "needs_review",
    notes: "Manual direct Johnson check still needed.",
  },
];

const variantSearchLog = [
  ["artificial", "confirmed in Etymonline/MW/Johnson/Webster tradition", "confirmed"],
  ["artificall", "searched; modern search noise high; Sherry/Wilson/Fulwood show artificiall as variant in phrases", "confirmed"],
  ["artificiale", "Latin/French family noted, no English snippet captured", "possible"],
  ["artificiel", "Old/Middle French form from etymological sources, not English use", "possible"],
  ["artificy", "not found in useful Chart 1 source", "not_found"],
  ["artificially", "Etymonline claims early 15c. by art/human skill/contrivance", "confirmed"],
  ["artificiallie", "not found in useful Chart 1 source", "not_found"],
  ["artifice", "confirmed in Etymonline and Johnson secondary", "confirmed"],
  ["artificer", "confirmed in Etymonline/MW; direct pre-1828 snippet not captured", "possible"],
  ["artificers", "not pursued beyond scope", "not_found"],
  ["artificial day", "Etymonline claimed; direct pre-1828 snippet not captured", "possible"],
  ["artificiall day", "searched, not found in useful source", "not_found"],
  ["artificall day", "searched, not found in useful source", "not_found"],
  ["artificial memory", "concept confirmed; English artificiall memory in Wilson/Fulwood", "confirmed"],
  ["artificiall memory", "confirmed in Wilson/Fulwood context", "confirmed"],
  ["artificial arguments", "Johnson/Webster tradition; Sherry has artificiall proofs rather than exact phrase", "possible"],
  ["artificiall arguments", "not exact; Sherry has artificiall/vnartificial proofs", "possible"],
  ["artificial lines", "pre-1828 direct source not captured; Webster 1828 checkpoint only", "not_found"],
  ["artificiall lines", "not found in useful pre-1828 source", "not_found"],
  ["artificial numbers", "confirmed through Napier/logarithm history", "confirmed"],
  ["artificiall numbers", "not found in useful pre-1828 source", "not_found"],
].map(([variant_spelling, result, status]) => ({ variant_spelling, result, status }));

const evidenceRows = [...dictionaryExtracts, ...textSnippets].map((item) => ({
  id: item.id,
  term_or_phrase: "term" in item ? item.term : item.term_or_phrase,
  variant_spelling: item.variant_spelling,
  year_or_period: item.year_or_period,
  source_title: "source_name" in item ? item.source_name : item.source_title,
  source_author: "source_author" in item ? item.source_author : "",
  source_type: item.source_type,
  source_url: item.source_url,
  sense: item.sense,
  confidence: item.confidence,
  short_summary: item.short_summary,
  pre_1828_value: item.pre_1828_value,
  chart_01_usefulness: "chart_01_usefulness" in item ? item.chart_01_usefulness : "supporting",
  notes: item.notes,
}));

const senseTimeline = [
  {
    sense: "word_family_etymology",
    earliest_confirmed_or_claimed_period: "late 14c./15th c. claimed",
    strongest_pre_1828_source: "Etymonline; Merriam-Webster etymology",
    secondary_sources: "MW first-known-use; Old French/Latin forms",
    confidence: "medium",
    notes: "Strongly supports pre-1828 existence and family, but exact attestations need OED/MED.",
  },
  {
    sense: "art_skill_making",
    earliest_confirmed_or_claimed_period: "early 15c. claimed; 1755/1773 Johnson reported",
    strongest_pre_1828_source: "Etymonline; Johnson secondary",
    secondary_sources: "Sherry/Wilson/Fulwood technical uses imply rule/skill layer",
    confidence: "medium",
    notes: "Safe as an older layer, but exact earliest English quotation still unresolved.",
  },
  {
    sense: "technical_rule_reckoning",
    earliest_confirmed_or_claimed_period: "1550 Sherry; 1553 Wilson; 1562 Fulwood; 1614/1619 Napier",
    strongest_pre_1828_source: "Sherry 1550; Wilson 1553; Napier artificial numbers",
    secondary_sources: "Rhetorica ad Herennium concept; Webster/Johnson later dictionary tradition",
    confidence: "high",
    notes: "Best pre-1828 evidence cluster found in this pass.",
  },
  {
    sense: "contrivance_construction",
    earliest_confirmed_or_claimed_period: "1530s/early modern claimed; 1755/1773 Johnson reported",
    strongest_pre_1828_source: "Etymonline artifice; Johnson secondary artificial/artifice",
    secondary_sources: "Merriam-Webster etymology",
    confidence: "medium",
    notes: "Bridge sense is older than 1828, but direct primary quotes need checking.",
  },
  {
    sense: "not_natural",
    earliest_confirmed_or_claimed_period: "late 14c. claimed; 1755/1773 Johnson reported",
    strongest_pre_1828_source: "Etymonline artificial day; Johnson secondary artificial",
    secondary_sources: "Merriam-Webster Middle English summary",
    confidence: "medium",
    notes: "Confirmed as pre-1828 in reliable secondary/lexical sources; direct OED would strengthen.",
  },
  {
    sense: "imitation_substitute",
    earliest_confirmed_or_claimed_period: "16c. claimed",
    strongest_pre_1828_source: "Etymonline",
    secondary_sources: "later dictionaries",
    confidence: "low",
    notes: "Pre-1828 claim exists, but no primary snippet collected in this pass.",
  },
  {
    sense: "fake_not_genuine",
    earliest_confirmed_or_claimed_period: "1640s claimed; Johnson reported",
    strongest_pre_1828_source: "Etymonline; Johnson secondary artificial",
    secondary_sources: "later dictionaries",
    confidence: "medium",
    notes: "Pre-1828 sense likely, but direct Johnson/OED check needed for final copy.",
  },
  {
    sense: "affected_insincere",
    earliest_confirmed_or_claimed_period: "1590s claimed",
    strongest_pre_1828_source: "Etymonline",
    secondary_sources: "later dictionaries",
    confidence: "low",
    notes: "Claimed before 1828, but no direct primary snippet captured here.",
  },
];

const variantSpellings = [
  ["artificial", "artificial", "Etymonline; Merriam-Webster; Johnson secondary", "late 14c./15th c. claimed", "https://www.etymonline.com/word/artificial", "confirmed", "Modern spelling appears in historical/lexical tradition."],
  ["artificial", "artificall", "Sherry/Wilson/Fulwood phrase evidence", "1550s", "https://www.gutenberg.org/files/28447/28447-h/28447-h.htm", "confirmed", "Early spelling in artificiall/vnartificial proofs and artificiall memory contexts."],
  ["artificial", "artificiale", "Latin/French family context", "medieval/Latin", "https://www.etymonline.com/word/artificial", "possible", "Not captured as English snippet."],
  ["artificial", "artificiel", "Old French / modern French etymology", "Old French", "https://www.etymonline.com/word/artificial", "possible", "Source language form, not English Chart 1 evidence."],
  ["artificially", "artificially", "Etymonline", "early 15c. claimed", "https://www.etymonline.com/word/artificially", "confirmed", "Adverbial art/skill/contrivance evidence."],
  ["artificially", "artificiallie", "search attempted", "N/A", "", "not_found", "No useful source found."],
  ["artifice", "artifice", "Etymonline; Johnson secondary", "1530s claimed; 1755 Johnson secondary", "https://www.etymonline.com/word/artifice", "confirmed", "Word-family bridge."],
  ["artificer", "artificer", "Etymonline; MW", "late 14c. claimed", "https://www.etymonline.com/word/artificer", "possible", "Strong lexical claim, no direct pre-1828 primary snippet captured."],
  ["artificial memory", "artificiall memory / Artificiall Memorie", "Wilson/Fulwood", "1553/1562", "https://ota.bodleian.ox.ac.uk/repository/xmlui/bitstream/handle/20.500.12024/3153/3153.html?isAllowed=y&sequence=6", "confirmed", "Strong pre-1828 learned-technique phrase."],
].map(([modern_term, variant_spelling, source_found, year_or_period, source_url, status, notes]) => ({
  modern_term,
  variant_spelling,
  source_found,
  year_or_period,
  source_url,
  status,
  notes,
}));

const anchorStatus = [
  ["artificial day", "claimed_pre_1828_but_needs_verification", "Etymonline artificial", "late 14c. claimed", "technical_rule_reckoning", "medium", "high", "notes_only", "No primary/OED snippet captured; do not core-anchor yet."],
  ["artificial memory", "confirmed_pre_1828", "Wilson 1553 / Fulwood 1562", "1553/1562", "technical_rule_reckoning", "high", "medium", "supporting_anchor", "Now stronger than previous rounds for English learned-technique evidence."],
  ["artificial arguments", "confirmed_pre_1828", "Sherry 1550 artificiall/vnartificial proofs; Johnson/Webster tradition", "1550 for artificiall proofs", "technical_rule_reckoning", "medium", "medium", "supporting_anchor", "Exact phrase not as strong as concept; artificial/inartificial rhetorical proof distinction is strong."],
  ["artificial lines", "not_confirmed_pre_1828", "Webster 1828 / Webster 1913 only", "1828 checkpoint", "technical_rule_reckoning", "low", "medium", "needs_review", "No pre-1828 source captured."],
  ["artificial numbers", "confirmed_pre_1828", "Napier/logarithm history", "1614/1619 context", "technical_rule_reckoning", "medium", "low", "supporting_anchor", "Good mathematical/reckoning anchor; primary Latin text optional later."],
  ["made by art", "claimed_pre_1828_but_needs_verification", "Johnson secondary; Etymonline family", "1755/1773 reported", "art_skill_making", "medium", "low", "supporting_anchor", "Strong as paraphrase; exact direct quote still needs Johnson/OED."],
  ["made by skill", "not_confirmed_pre_1828", "No strong pre-1828 source captured", "N/A", "art_skill_making", "low", "medium", "background_only", "Too generic."],
  ["human skill", "claimed_pre_1828_but_needs_verification", "Etymonline early 15c. claim; Johnson secondary", "early 15c. claimed; 1755/1773 reported", "art_skill_making", "medium", "low", "supporting_anchor", "Safe as older layer with care, not exact earliest claim."],
  ["contrived by art", "claimed_pre_1828_but_needs_verification", "Etymonline/MW etymology; Johnson secondary", "pre-1828 claimed/reported", "contrivance_construction", "medium", "medium", "background_only", "Do not let contrivance dominate."],
].map(([phrase, pre_1828_status, strongest_source, year_or_period, primary_sense, confidence, public_facing_risk, chart_01_status, notes]) => ({
  phrase,
  pre_1828_status,
  strongest_source,
  year_or_period,
  primary_sense,
  confidence,
  public_facing_risk,
  chart_01_status,
  notes,
}));

const claimConfidence = [
  ["Artificial is attested before 1828.", "safe", "Etymonline; Merriam-Webster", "high", "avoid exact date without OED", "yes", "Safe: word predates 1828."],
  ["Artificial belongs to the art / skill / making word family before 1828.", "safe", "Etymonline; Merriam-Webster; artifice/artificer etymology", "high", "low", "yes", "Strongly supported by independent etymology sources."],
  ["Artificial has a pre-1828 sense of made by art / human skill.", "mostly_safe", "Etymonline early 15c.; Johnson secondary", "medium", "direct quotation still pending", "yes_with_care", "Use older layer wording, not exact earliest date."],
  ["Artificial has a pre-1828 sense of not natural.", "mostly_safe", "Etymonline late 14c.; Johnson secondary", "medium", "direct OED/Johnson still pending", "yes_with_care", "Safe as distinction if dates are not overclaimed."],
  ["Artificial has a pre-1828 sense of fake / not genuine.", "partially_supported", "Etymonline 1640s; Johnson secondary", "medium", "direct source pending", "yes_with_care", "Likely, but verify before final copy."],
  ["Artificial has a pre-1828 affected / insincere sense.", "partially_supported", "Etymonline 1590s", "low", "no primary snippet captured", "notes_only", "Keep secondary until OED/primary check."],
  ["Artificial day is a pre-1828 technical/reckoning anchor.", "partially_supported", "Etymonline", "medium", "no primary snippet captured", "notes_only", "Do not make core without OED/primary."],
  ["Artificial memory is a pre-1828 learned-technique anchor in English.", "mostly_safe", "Wilson 1553; Fulwood 1562", "high", "needs exact quote handling", "yes_with_care", "Now materially stronger than previous rounds."],
  ["Artificial arguments / lines / numbers are pre-1828 rule-based technical anchors.", "partially_supported", "Sherry 1550 for artificial proofs; Napier for artificial numbers", "medium", "artificial lines not pre-1828 confirmed", "yes_with_care", "Arguments/proofs and numbers are strong; lines remain unconfirmed pre-1828."],
  ["Webster 1828 should be treated as a checkpoint, not an origin.", "safe", "All pre-1828 evidence in this round", "high", "low", "yes", "This is now the cleanest round-05 conclusion."],
  ["OED is needed for precise earliest-date claims.", "safe", "OED not accessed; Etymonline/MW are secondary for dates", "high", "low", "yes", "Keep as guardrail."],
].map(([claim, status, strongest_supporting_sources, evidence_strength, risk, can_use_in_chart_01, notes]) => ({
  claim,
  status,
  strongest_supporting_sources,
  evidence_strength,
  risk,
  can_use_in_chart_01,
  notes,
}));

const publicDomainCandidates = [
  ["A Treatise of Schemes and Tropes", "Richard Sherry", "1550", "primary_text", "artificiall/vnartificial proofs", "technical_rule_reckoning", "https://www.gutenberg.org/files/28447/28447-h/28447-h.htm", "yes", "Best public-domain pre-1828 rhetorical anchor."],
  ["The Arte of Rhetorique", "Thomas Wilson", "1553", "primary_text", "artificiall memory", "technical_rule_reckoning", "https://ota.bodleian.ox.ac.uk/repository/xmlui/bitstream/handle/20.500.12024/3153/3153.html?isAllowed=y&sequence=6", "yes_with_care", "Good early English memory anchor; early spelling needs careful transcription."],
  ["The Castel of Memorie", "William Fulwood", "1562", "primary_text / secondary quotation located", "Artificiall Memorie", "technical_rule_reckoning", "https://deepblue.lib.umich.edu/bitstream/handle/2027.42/99866/bozio_1.pdf?sequence=1", "needs_review", "Need direct public-domain text if used publicly."],
  ["Mirifici Logarithmorum Canonis Constructio / Napier summaries", "John Napier", "1619 / written earlier", "secondary_scholarly", "artificial numbers", "technical_rule_reckoning", "https://old.maa.org/press/periodicals/convergence/napiers-binary-chessboard-calculator-napier-and-logarithms", "yes_with_care", "Use as history-of-math support; primary text optional."],
  ["A Dictionary of the English Language", "Samuel Johnson", "1755/1773", "historical_dictionary", "artificial; artifice", "mixed_bridge_sense", "https://johnsonsdictionaryonline.com/views/search.php?term=artificial", "needs_review", "Direct source still needs manual capture."],
].map(([source_title, author, year_or_period, source_type, term_or_phrase, sense, source_url, usable_for_public_page, notes]) => ({
  source_title,
  author,
  year_or_period,
  source_type,
  term_or_phrase,
  sense,
  source_url,
  usable_for_public_page,
  notes,
}));

const unresolved = [
  ["OED artificial", "not accessed", "Needed for precise late-14c/early-15c claims.", "Check OED before final copy.", "Blocks exact-date language."],
  ["OED artifice/artificer", "not accessed", "Needed for exact word-family chronology.", "Check if visible.", "Not blocking structure planning."],
  ["MED entries", "search-only; no stable exact entry", "Could confirm Middle English forms.", "Deeper MED/manual search if OED unavailable.", "Optional if OED checked."],
  ["Johnson direct source", "stable direct entry not captured", "Would strengthen 1755 pre-1828 dictionary evidence.", "Use Johnson site/scans manually.", "Needed for direct Johnson citation."],
  ["Artificial day primary snippet", "not captured", "Earliest claimed use depends on it.", "Check OED/EEBO/MED.", "Keep notes-only until verified."],
  ["Artificial lines pre-1828", "not captured", "Webster 1828 lists it, but pre-1828 source absent.", "Search math/navigation texts if needed.", "Can use Webster as checkpoint only."],
  ["Affected/insincere pre-1828 primary evidence", "not captured", "Etymonline dates it to 1590s.", "Check OED or Shakespeare contexts.", "Use with care only."],
].map(([item, issue, why_it_matters, next_action, notes]) => ({ item, issue, why_it_matters, next_action, notes }));

async function main() {
  await Promise.all([RAW_DIR, PROCESSED_DIR, NOTES_DIR, SOURCES_DIR].map((directory) => mkdir(directory, { recursive: true })));

  await writeFile(path.join(RAW_DIR, "round_05_pre_1828_dictionary_extracts.json"), `${JSON.stringify(dictionaryExtracts, null, 2)}\n`);
  await writeFile(
    path.join(RAW_DIR, "round_05_pre_1828_text_snippets.csv"),
    `${csvRows(
      [
        "id",
        "term_or_phrase",
        "variant_spelling",
        "year_or_period",
        "source_title",
        "source_author",
        "source_type",
        "source_url",
        "sense",
        "confidence",
        "short_summary",
        "pre_1828_value",
        "chart_01_usefulness",
        "notes",
      ],
      textSnippets,
    )}\n`,
  );
  await writeFile(
    path.join(RAW_DIR, "round_05_variant_search_log.csv"),
    `${csvRows(["variant_spelling", "result", "status"], variantSearchLog)}\n`,
  );
  await writeFile(
    path.join(RAW_DIR, "round_05_source_access_log.csv"),
    `${csvRows(["source_name", "url", "access_status", "searched_for", "result", "limitations"], sourceAccessLog)}\n`,
  );

  await writeFile(
    path.join(PROCESSED_DIR, "round_05_pre_1828_evidence_table.csv"),
    `${csvRows(
      [
        "id",
        "term_or_phrase",
        "variant_spelling",
        "year_or_period",
        "source_title",
        "source_author",
        "source_type",
        "source_url",
        "sense",
        "confidence",
        "short_summary",
        "pre_1828_value",
        "chart_01_usefulness",
        "notes",
      ],
      evidenceRows,
    )}\n`,
  );
  await writeFile(
    path.join(PROCESSED_DIR, "round_05_pre_1828_sense_timeline.csv"),
    `${csvRows(
      ["sense", "earliest_confirmed_or_claimed_period", "strongest_pre_1828_source", "secondary_sources", "confidence", "notes"],
      senseTimeline,
    )}\n`,
  );
  await writeFile(
    path.join(PROCESSED_DIR, "round_05_variant_spellings.csv"),
    `${csvRows(["modern_term", "variant_spelling", "source_found", "year_or_period", "source_url", "status", "notes"], variantSpellings)}\n`,
  );
  await writeFile(
    path.join(PROCESSED_DIR, "round_05_anchor_phrase_pre_1828_status.csv"),
    `${csvRows(
      ["phrase", "pre_1828_status", "strongest_source", "year_or_period", "primary_sense", "confidence", "public_facing_risk", "chart_01_status", "notes"],
      anchorStatus,
    )}\n`,
  );
  await writeFile(
    path.join(PROCESSED_DIR, "round_05_pre_1828_claim_confidence.csv"),
    `${csvRows(
      ["claim", "status", "strongest_supporting_sources", "evidence_strength", "risk", "can_use_in_chart_01", "notes"],
      claimConfidence,
    )}\n`,
  );
  await writeFile(
    path.join(PROCESSED_DIR, "round_05_public_domain_source_candidates.csv"),
    `${csvRows(
      ["source_title", "author", "year_or_period", "source_type", "term_or_phrase", "sense", "source_url", "usable_for_public_page", "notes"],
      publicDomainCandidates,
    )}\n`,
  );
  await writeFile(
    path.join(PROCESSED_DIR, "round_05_unresolved_pre_1828_items.csv"),
    `${csvRows(["item", "issue", "why_it_matters", "next_action", "notes"], unresolved)}\n`,
  );

  await writeFile(
    path.join(SOURCES_DIR, "round_05_source_urls.md"),
    `# Round 05 Source URLs

- Etymonline artificial: https://www.etymonline.com/word/artificial
- Etymonline artificially: https://www.etymonline.com/word/artificially
- Merriam-Webster artificial: https://www.merriam-webster.com/dictionary/artificial
- Etymonline artifice: https://www.etymonline.com/word/artifice
- Etymonline artificer: https://www.etymonline.com/word/artificer
- Johnson Dictionary Online search: https://johnsonsdictionaryonline.com/views/search.php?term=artificial
- Richard Sherry, A Treatise of Schemes and Tropes: https://www.gutenberg.org/files/28447/28447-h/28447-h.htm
- Thomas Wilson, The Arte of Rhetorique: https://ota.bodleian.ox.ac.uk/repository/xmlui/bitstream/handle/20.500.12024/3153/3153.html?isAllowed=y&sequence=6
- Rhetorica ad Herennium memory passage: https://www.laits.utexas.edu/memoria/Ad_Herennium_Passages.html
- MAA Napier/logarithms: https://old.maa.org/press/periodicals/convergence/napiers-binary-chessboard-calculator-napier-and-logarithms
- 1911 Britannica Napier: https://en.wikisource.org/wiki/1911_Encyclop%C3%A6dia_Britannica/Napier%2C_John
`,
  );

  await writeFile(
    path.join(NOTES_DIR, "round_05_collection_log.md"),
    `# Round 05 Pre-1828 Collection Log

Generated: ${generatedAt}

## Scope

Focused pre-1828 evidence pass for Chart 1 only. No visuals, React, chart layout, final copy, or later artificial topics.

## Key Actions

- Checked etymology and modern dictionary summaries only for pre-1828 claims and word-family evidence.
- Searched for pre-1828 public-domain anchors, especially rhetoric/memory/mathematics.
- Captured Sherry 1550, Wilson 1553, Fulwood 1562 secondary quotation, Napier artificial numbers, and Johnson secondary evidence.
- Recorded OED/MED/Johnson direct access limitations.

## Important Findings

- Webster 1828 is clearly not the origin; it is a checkpoint.
- Pre-1828 technical-rule evidence is stronger than before: artificiall/vnartificial proofs, artificiall memory, and artificial numbers.
- Artificial day remains claimed but not primary-verified.

## Sources Not Fully Resolved

- OED not accessed.
- MED exact entries not found through search.
- Johnson direct entry not captured.
- Bailey/Ash/Sheridan/Walker did not yield stable useful extracts in this pass.
`,
  );

  await writeFile(
    path.join(NOTES_DIR, "round_05_source_notes.md"),
    `# Round 05 Source Notes

Generated: ${generatedAt}

## Strong Pre-1828 Sources

- Richard Sherry 1550 gives a strong English rhetorical artificiall/vnartificial distinction.
- Thomas Wilson 1553 gives a strong English artificiall memory distinction.
- Napier/logarithm sources give artificial numbers as a rule/calculation term before 1828.

## Useful But Secondary Sources

- Etymonline and Merriam-Webster confirm pre-1828 word-family history but should not be treated as direct earliest quotations.
- Etymonline artificially adds a direct adverbial art/skill/contrivance claim from early 15c.
- Johnson secondary references point to 1755/1773 dictionary senses but still need direct verification.
- Fulwood 1562 is currently captured through scholarly quotation; direct text should be checked if used publicly.

## Weak / Unresolved Sources

- Artificial day remains source-backed as a claim, but not primary-verified here.
- Artificial lines remain 1828-checkpoint evidence only in this pass.
`,
  );

  await writeFile(
    path.join(NOTES_DIR, "round_05_pre_1828_evidence_synthesis.md"),
    `# Round 05 Pre-1828 Evidence Synthesis

Generated: ${generatedAt}

## 1. Overview

This pass confirms that Webster 1828 is not the origin of artificial. It is a public, structured checkpoint where older senses are organized. The pre-1828 evidence now includes etymological claims, early English rhetorical usage, early English memory-art usage, and mathematical/reckoning usage.

## 2. What Evidence Exists Before 1828

The strongest pre-1828 evidence captured here is Sherry 1550 for artificiall/vnartificial proofs, Wilson 1553 for natural/artificiall memory, Fulwood 1562 for Artificiall Memorie through scholarly quotation, and Napier's artificial numbers in the logarithm tradition. Johnson 1755/1773 remains promising but needs direct verification.

## 3. Evidence For Art / Skill / Making Before 1828

Etymonline and Merriam-Webster place artificial inside the art/skill/make family before 1828, and Etymonline's artificially entry preserves the adverbial sense of action done by art, human skill, and contrivance. The rhetorical and memory examples show artificial as rule-made, teachable, and method-governed, not fake. Direct OED/MED evidence is still needed for exact earliest quotations.

## 4. Evidence For Not-Natural Before 1828

Etymonline's artificial day and Johnson secondary reports support not-natural before 1828. The key point remains that not-natural is a contrast with nature or natural memory/day/proof, not automatically fakery.

## 5. Evidence For Fake / Not Genuine Before 1828

Etymonline dates this branch to the 1640s, and Johnson secondary reports a fictitious/not-genuine sense. This looks pre-1828, but direct OED/Johnson checking is needed before final wording.

## 6. Evidence For Affected / Insincere Before 1828

Etymonline dates affected/insincere to the 1590s. No direct primary snippet was captured in this pass, so this should remain a secondary boundary note for now.

## 7. Status Of Artificial Day

Artificial day remains important but not yet safe as a visible core anchor. It is claimed as earliest by Etymonline, but this pass did not capture a primary Middle English or early-modern quotation.

## 8. Status Of Artificial Memory

Artificial memory is now much stronger for Chart 1. Wilson 1553 gives English artificiall memory as part of rhetoric, and Fulwood 1562 supports Artificiall Memorie through a scholarly quotation. It can support learned technique with care.

## 9. Status Of Artificial Arguments / Lines / Numbers

Artificial arguments are supported conceptually by Sherry's artificiall/vnartificial proofs in 1550, though the exact phrase artificial arguments is later dictionary language. Artificial numbers are supported by Napier/logarithm history before 1828. Artificial lines were not confirmed pre-1828 in this pass.

## 10. Variant Spellings And Search Limitations

The most useful variant is artificiall, especially in artificiall memory and artificiall/vnartificial proof contexts. Artificiel and artificiale are source-language forms rather than English evidence here. Searches for artificiall day, artificiall lines, and artificiallie did not produce useful evidence.

## 11. What Webster 1828 Can And Cannot Be Used For

Webster 1828 can be used as a checkpoint that clearly organizes older senses. It should not be used as the origin of artificial or as evidence for earliest dates.

## 12. What Still Needs OED / MED / Manual Confirmation

OED is still needed for exact earliest dates, artificial day, and pre-1828 fake/affected branches. MED may help with Middle English forms if deeper search succeeds. Johnson direct entry remains desirable for 1755/1773 dictionary evidence.
`,
  );

  await writeFile(
    path.join(NOTES_DIR, "round_05_safe_pre_1828_claims.md"),
    `# Round 05 Safe Pre-1828 Claims

Generated: ${generatedAt}

## Safe

- Artificial is older than 1828.
- Webster 1828 is a checkpoint, not an origin.
- Artificial belongs to the art / skill / making word family before 1828.
- Pre-1828 English has artificiall technical/rule uses in rhetoric and memory contexts.

## Safe With Care

- Artificial has an older made-by-art / human-skill layer.
- Artificial has an older not-natural layer.
- Artificial memory can support a learned-technique sense before 1828.
- Artificial arguments/proofs and artificial numbers can support technical/reckoning before 1828.

## Notes Only

- Artificial day as earliest phrase until OED/primary evidence is captured.
- Affected/insincere pre-1828 sense until primary/OED evidence is captured.
- Artificial lines as pre-1828 anchor; not confirmed here.

## Do Not Claim Yet

- Do not claim exact earliest date.
- Do not claim artificial day is the earliest use as a verified fact.
- Do not claim artificial memory is the origin of the word.
- Do not claim fake/not-genuine or affected/insincere branches are fully verified from primary pre-1828 sources in this pass.
`,
  );

  await writeFile(
    path.join(NOTES_DIR, "round_05_remaining_risks.md"),
    `# Round 05 Remaining Risks

Generated: ${generatedAt}

- OED inaccessible: exact earliest-date claims remain unsafe.
- MED inaccessible/search-incomplete: Middle English forms remain under-verified.
- Early spelling variation: artificiall/artificall/artificiel/artificiale searches are noisy.
- OCR and scan errors: early printed texts can be misread or silently modernized.
- Google Books metadata dating errors: do not use snippet dates as proof without source inspection.
- Modernized spelling in later editions: Gutenberg/OTA texts may normalize or mediate early spellings.
- Snippet context can be too short: especially for artificial day and Johnson secondary evidence.
- Artificial day may be obscure even if verified.
- Artificial memory is conceptually old, but English chronology still needs careful handling.
- Do not treat Webster 1828 as origin.
- Do not treat Etymonline dates as personally verified earliest attestations.
`,
  );

  console.log("Round 05 pre-1828 evidence package complete.");
}

await main();
