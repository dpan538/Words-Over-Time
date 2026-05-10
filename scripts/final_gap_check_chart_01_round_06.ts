import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const BASE_DIR = path.join(
  process.cwd(),
  "docs",
  "research",
  "artificial",
  "chart_01_art_artifice",
  "final_gap_check_round_06",
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
    source_name: "Johnson's Dictionary Online",
    url: "https://johnsonsdictionaryonline.com/views/search.php?term=artificial",
    access_status: "partially_accessed",
    checked_for: "artificial; artifice; artificer; artificially",
    result:
      "The public search interface is discoverable, but stable direct entry extraction was not captured in this pass.",
    limitations: "Treat Johnson as indirect unless manually captured from the site or page scans.",
  },
  {
    source_name: "Definitions.net Johnson transcription",
    url: "https://www.definitions.net/definition/artificial",
    access_status: "accessed_indirect",
    checked_for: "Johnson artificial senses",
    result:
      "Provides a Johnson-attributed artificial entry with separate made-by-art/not-natural, fictitious/not-genuine, and artful/contrived-with-skill senses.",
    limitations: "Secondary transcription; useful but not direct Johnson evidence.",
  },
  {
    source_name: "Project Gutenberg: Shakespeare, Henry VI Part 3",
    url: "https://www.gutenberg.org/files/1502/1502-h/1502-h.htm",
    access_status: "accessed",
    checked_for: "artificial tears",
    result:
      "Pre-1828 literary evidence for artificial tears in a deception/feigned-emotion context.",
    limitations: "A literary usage example, not a dictionary sense tree.",
  },
  {
    source_name: "Etymonline artificial",
    url: "https://www.etymonline.com/word/artificial",
    access_status: "accessed",
    checked_for: "not genuine; affected/insincere; artificial day",
    result:
      "Gives pre-1828 claimed chronology for not-genuine and affected/insincere senses and the artificial-day early-use claim.",
    limitations: "Secondary etymology source; OED needed for precise earliest quotations.",
  },
  {
    source_name: "Webster 1828 artificial",
    url: "https://webstersdictionary1828.com/Dictionary/artificial",
    access_status: "accessed",
    checked_for: "checkpoint comparison",
    result:
      "Separates made-by-art/not-natural from feigned/fictitious/not-genuine and gives artificial lines as a technical phrase.",
    limitations: "Checkpoint at 1828, not pre-1828 origin evidence.",
  },
  {
    source_name: "Webster 1828 day",
    url: "https://webstersdictionary1828.com/Home?word=day",
    access_status: "accessed",
    checked_for: "artificial day checkpoint",
    result:
      "Defines day between rising and setting of the sun as artificial day.",
    limitations: "Checkpoint only; not pre-1828.",
  },
  {
    source_name: "Reformed Books Online / Perkins excerpt",
    url: "https://reformedbooksonline.com/topics/topics-by-subject/the-lords-day/when-does-the-lords-day-begin/",
    access_status: "accessed_indirect",
    checked_for: "artificial day",
    result:
      "Quotes William Perkins material dated 1606/early 1600s describing an artificial day as sunrise-to-sunset.",
    limitations: "Modern collection/quotation; direct EEBO/scan check still preferable.",
  },
  {
    source_name: "Google Play Books: Edmund Gunter, Sector",
    url: "https://play.google.com/store/books/details/Edmund_GUNTER_The_Description_and_Use_of_the_Secto?id=Q4C1qhHk2FEC",
    access_status: "search_result_accessed",
    checked_for: "artificial lines",
    result:
      "1636 title metadata includes a canon of artificiall lines and tangents for astronomy, navigation, dialling, and fortification.",
    limitations: "Title/metadata evidence; direct full-text extraction not captured.",
  },
  {
    source_name: "Bailey / Ash / Sheridan / Walker historical dictionaries",
    url: "",
    access_status: "search_only",
    checked_for: "artificial negative senses",
    result:
      "No stable direct extract useful enough to add beyond Johnson/Webster in this pass.",
    limitations: "Can remain unresolved; do not keep broad-searching before content planning.",
  },
  {
    source_name: "OED / MED",
    url: "https://www.oed.com/",
    access_status: "not_accessible",
    checked_for: "precise earliest dates; artificial day; negative senses",
    result:
      "Not accessed.",
    limitations: "Needed only for exact earliest-date/final-copy claims.",
  },
];

const dictionaryGapExtracts = [
  {
    id: "johnson_artificial_indirect",
    source_name: "Johnson via Definitions.net",
    term: "artificial",
    source_url: "https://www.definitions.net/definition/artificial",
    year_or_period: "1755/1773 via indirect transcription",
    definition_summary:
      "Separates made-by-art/not-natural, fictitious/not-genuine, and artful/contrived-with-skill senses.",
    sense: "not_natural_distinct; fake_not_genuine; art_skill_making",
    reliability: "medium_low",
    access_status: "indirect_only",
    chart_01_value: "high_if_verified",
    notes: "Direct Johnson entry was not stabilized; use as indirect support only.",
  },
  {
    id: "etymonline_negative_senses",
    source_name: "Etymonline",
    term: "artificial",
    source_url: "https://www.etymonline.com/word/artificial",
    year_or_period: "1590s/1640s claimed",
    definition_summary:
      "Claims affected/insincere from the 1590s and fictitious/not-genuine from the 1640s.",
    sense: "affected_insincere; fake_not_genuine",
    reliability: "medium",
    access_status: "accessed",
    chart_01_value: "supporting",
    notes: "Good chronology pointer; OED needed for exact quotations.",
  },
  {
    id: "webster_1828_checkpoint_negative",
    source_name: "Webster 1828",
    term: "artificial",
    source_url: "https://webstersdictionary1828.com/Dictionary/artificial",
    year_or_period: "1828 checkpoint",
    definition_summary:
      "Lists made/contrived by art in opposition to natural separately from feigned/fictitious/not-genuine.",
    sense: "not_natural_distinct; fake_not_genuine",
    reliability: "high_as_checkpoint",
    access_status: "accessed",
    chart_01_value: "supporting",
    notes: "Use as checkpoint, not as origin.",
  },
];

const negativeSnippets = [
  {
    id: "shakespeare_artificial_tears",
    term_or_phrase: "artificial tears",
    variant_spelling: "artificial",
    year_or_period: "1590s play; public-domain edition accessed",
    source_title: "Henry VI, Part 3",
    source_author: "William Shakespeare",
    source_type: "primary_text",
    source_url: "https://www.gutenberg.org/files/1502/1502-h/1502-h.htm",
    sense: "fake_not_genuine",
    confidence: "high",
    short_summary:
      "Richard describes the ability to display tears while framing his face for deception; strong feigned-emotion evidence.",
    evidence_value: "strong",
    chart_01_usefulness: "supporting",
    notes: "Also overlaps affected/insincere, but the clearest reading is fake/feigned tears.",
  },
  {
    id: "johnson_artificial_tears",
    term_or_phrase: "artificial tears",
    variant_spelling: "artificial",
    year_or_period: "1755/1773 indirect transcription",
    source_title: "Johnson's Dictionary via Definitions.net",
    source_author: "Samuel Johnson",
    source_type: "historical_dictionary_indirect",
    source_url: "https://www.definitions.net/definition/artificial",
    sense: "fake_not_genuine",
    confidence: "medium",
    short_summary:
      "Johnson-attributed entry places the Shakespeare artificial-tears quotation under fictitious/not-genuine.",
    evidence_value: "medium",
    chart_01_usefulness: "supporting",
    notes: "Useful because it shows eighteenth-century lexicographic classification, but direct Johnson still not captured.",
  },
  {
    id: "etymonline_affected_insincere",
    term_or_phrase: "artificial",
    variant_spelling: "artificial",
    year_or_period: "1590s claimed",
    source_title: "Etymonline artificial",
    source_author: "Douglas Harper",
    source_type: "etymology_source",
    source_url: "https://www.etymonline.com/word/artificial",
    sense: "affected_insincere",
    confidence: "medium",
    short_summary:
      "Secondary source dates the affected/insincere branch before 1828.",
    evidence_value: "medium",
    chart_01_usefulness: "notes_only",
    notes: "No separate primary snippet for affected/insincere was captured in this pass.",
  },
  {
    id: "johnson_not_natural_distinct",
    term_or_phrase: "artificial",
    variant_spelling: "artificial",
    year_or_period: "1755/1773 indirect transcription",
    source_title: "Johnson's Dictionary via Definitions.net",
    source_author: "Samuel Johnson",
    source_type: "historical_dictionary_indirect",
    source_url: "https://www.definitions.net/definition/artificial",
    sense: "not_natural_distinct",
    confidence: "medium",
    short_summary:
      "Johnson-attributed entry lists made by art/not natural separately from fictitious/not-genuine.",
    evidence_value: "medium",
    chart_01_usefulness: "supporting",
    notes: "This is the clearest source for keeping not-natural distinct from fake before Webster 1828, but it is indirect.",
  },
  {
    id: "webster_1828_not_natural_vs_fake",
    term_or_phrase: "artificial",
    variant_spelling: "artificial",
    year_or_period: "1828 checkpoint",
    source_title: "Webster 1828",
    source_author: "Noah Webster",
    source_type: "historical_dictionary_checkpoint",
    source_url: "https://webstersdictionary1828.com/Dictionary/artificial",
    sense: "not_natural_distinct",
    confidence: "high",
    short_summary:
      "Webster keeps made-by-art/in-opposition-to-natural separate from feigned/fictitious/not-genuine.",
    evidence_value: "medium",
    chart_01_usefulness: "supporting",
    notes: "Not pre-1828, but confirms the boundary at the checkpoint.",
  },
];

const anchorGapSnippets = [
  {
    id: "perkins_artificial_day",
    phrase: "artificial day",
    variant_spelling: "artificial",
    year_or_period: "1606 source claimed/quoted",
    source_title: "William Perkins, A Digest or Harmony",
    source_author: "William Perkins via Reformed Books Online quotation",
    source_type: "historical_text_indirect",
    source_url:
      "https://reformedbooksonline.com/topics/topics-by-subject/the-lords-day/when-does-the-lords-day-begin/",
    sense: "technical_rule_reckoning",
    confidence: "medium",
    short_summary:
      "Quoted early-modern source defines artificial day as the time from sunrise to sunset.",
    evidence_value: "medium",
    chart_01_usefulness: "notes_only",
    notes: "Pre-1828 source is identified, but direct scan/transcription should be checked before visible use.",
  },
  {
    id: "webster_1828_day_checkpoint",
    phrase: "artificial day",
    variant_spelling: "artificial",
    year_or_period: "1828 checkpoint",
    source_title: "Webster 1828 Day",
    source_author: "Noah Webster",
    source_type: "historical_dictionary_checkpoint",
    source_url: "https://webstersdictionary1828.com/Home?word=day",
    sense: "technical_rule_reckoning",
    confidence: "high",
    short_summary:
      "Defines the daylight span between rising and setting of the sun as artificial day.",
    evidence_value: "medium",
    chart_01_usefulness: "notes_only",
    notes: "Useful checkpoint but not pre-1828 evidence.",
  },
  {
    id: "gunter_artificiall_lines",
    phrase: "artificial lines",
    variant_spelling: "artificiall",
    year_or_period: "1636 title metadata",
    source_title: "The Description and Use of the Sector, Crosse-staffe, and Other Instruments",
    source_author: "Edmund Gunter",
    source_type: "book_metadata",
    source_url:
      "https://play.google.com/store/books/details/Edmund_GUNTER_The_Description_and_Use_of_the_Secto?id=Q4C1qhHk2FEC",
    sense: "technical_rule_reckoning",
    confidence: "medium",
    short_summary:
      "Title metadata includes a canon of artificiall lines and tangents for astronomy, navigation, dialling, and fortification.",
    evidence_value: "medium",
    chart_01_usefulness: "supporting",
    notes: "Confirms pre-1828 phrase existence; direct text would improve public citation quality.",
  },
  {
    id: "webster_1828_lines_checkpoint",
    phrase: "artificial lines",
    variant_spelling: "artificial",
    year_or_period: "1828 checkpoint",
    source_title: "Webster 1828 Artificial",
    source_author: "Noah Webster",
    source_type: "historical_dictionary_checkpoint",
    source_url: "https://webstersdictionary1828.com/Dictionary/artificial",
    sense: "technical_rule_reckoning",
    confidence: "high",
    short_summary:
      "Defines artificial lines as sector/scale lines representing logarithmic sines and tangents.",
    evidence_value: "medium",
    chart_01_usefulness: "supporting",
    notes: "Checkpoint clarifies meaning; Gunter supplies pre-1828 support.",
  },
];

const notNaturalVsFake = [
  {
    sense: "not_natural_distinct",
    definition: "Opposed to natural, but not necessarily deceptive, false, fake, or morally bad.",
    pre_1828_support: "partially_confirmed",
    strongest_source: "Johnson via Definitions.net; Etymonline; Perkins artificial day",
    confidence: "medium",
    can_use_in_chart_01: "yes_with_care",
    notes: "Boundary is strong conceptually; direct Johnson/OED would improve final-copy confidence.",
  },
  {
    sense: "fake_not_genuine",
    definition: "False, fictitious, sham, feigned, not genuine, not real.",
    pre_1828_support: "confirmed",
    strongest_source: "Shakespeare artificial tears; Johnson via Definitions.net; Etymonline 1640s claim",
    confidence: "medium_high",
    can_use_in_chart_01: "yes_with_care",
    notes: "Use as a later coexisting branch, not as the original meaning.",
  },
  {
    sense: "affected_insincere",
    definition: "Forced, mannered, emotionally unnatural, insincere, artificial in behavior/style/expression.",
    pre_1828_support: "partially_confirmed",
    strongest_source: "Etymonline 1590s claim; Shakespeare artificial tears as overlap",
    confidence: "medium_low",
    can_use_in_chart_01: "notes_only",
    notes: "No clean separate pre-1828 primary snippet was found; do not make it a main Chart 1 claim.",
  },
];

const weakAnchorStatus = [
  {
    phrase: "artificial day",
    status: "partially_confirmed",
    strongest_source: "Perkins 1606 quoted by Reformed Books Online; Etymonline; Webster 1828 day checkpoint",
    year_or_period: "1606 source quoted; 1828 checkpoint",
    primary_sense: "technical_rule_reckoning",
    confidence: "medium",
    public_facing_risk: "high",
    final_chart_01_recommendation: "notes_only",
    notes: "Historically real, but too obscure and still indirectly sourced for visible anchor use.",
  },
  {
    phrase: "artificiall day",
    status: "unclear",
    strongest_source: "No stable exact-form source captured",
    year_or_period: "",
    primary_sense: "technical_rule_reckoning",
    confidence: "low",
    public_facing_risk: "high",
    final_chart_01_recommendation: "exclude",
    notes: "Do not use this spelling unless OED/MED supplies it.",
  },
  {
    phrase: "artificall day",
    status: "unclear",
    strongest_source: "No stable exact-form source captured",
    year_or_period: "",
    primary_sense: "technical_rule_reckoning",
    confidence: "low",
    public_facing_risk: "high",
    final_chart_01_recommendation: "exclude",
    notes: "Do not use this spelling unless OED/MED supplies it.",
  },
  {
    phrase: "artificial lines",
    status: "confirmed_pre_1828",
    strongest_source: "Gunter 1636 title metadata; Webster 1828 checkpoint",
    year_or_period: "1636 title metadata; 1828 checkpoint",
    primary_sense: "technical_rule_reckoning",
    confidence: "medium",
    public_facing_risk: "medium",
    final_chart_01_recommendation: "small_annotation",
    notes: "Confirmed enough as a technical/reckoning support item, but visually obscure.",
  },
  {
    phrase: "artificiall lines",
    status: "confirmed_pre_1828",
    strongest_source: "Gunter 1636 title metadata",
    year_or_period: "1636",
    primary_sense: "technical_rule_reckoning",
    confidence: "medium",
    public_facing_risk: "medium",
    final_chart_01_recommendation: "small_annotation",
    notes: "Best pre-1828 spelling found for the lines anchor.",
  },
  {
    phrase: "artificall lines",
    status: "not_confirmed",
    strongest_source: "No stable source captured",
    year_or_period: "",
    primary_sense: "technical_rule_reckoning",
    confidence: "low",
    public_facing_risk: "high",
    final_chart_01_recommendation: "exclude",
    notes: "Not needed because artificiall lines is confirmed.",
  },
];

const johnsonStatus = [
  {
    term: "artificial",
    entry_status: "indirect_only",
    source_url_or_reference: "https://www.definitions.net/definition/artificial",
    definition_summary:
      "Johnson-attributed senses: made by art/not natural; fictitious/not genuine; artful/contrived with skill.",
    sense_support: "not_natural_distinct; fake_not_genuine; art_skill_making",
    confidence: "medium",
    usable_for_chart_01: "yes_with_care",
    notes: "Direct Johnson entry not stabilized; indirect transcription is strong enough for notes/support, not exact proof-text.",
  },
  {
    term: "artifice",
    entry_status: "indirect_only",
    source_url_or_reference: "Definitions.net / prior round source",
    definition_summary: "Prior rounds found secondary Johnson evidence, but no direct stable entry.",
    sense_support: "contrivance/deception bridge",
    confidence: "low",
    usable_for_chart_01: "notes_only",
    notes: "Do not rely on Johnson direct for artifice unless manually captured.",
  },
  {
    term: "artificer",
    entry_status: "not_found",
    source_url_or_reference: "Johnson search attempted",
    definition_summary: "",
    sense_support: "",
    confidence: "low",
    usable_for_chart_01: "no",
    notes: "Not needed for this final gap check.",
  },
  {
    term: "artificially",
    entry_status: "not_found",
    source_url_or_reference: "Johnson search attempted",
    definition_summary: "",
    sense_support: "",
    confidence: "low",
    usable_for_chart_01: "no",
    notes: "Etymonline round 05 remains enough for artificially as background.",
  },
];

const finalClaims = [
  ["Artificial predates Webster 1828.", "safe", "Etymonline; Merriam-Webster; round 05 evidence", "high", "low", "yes", "Do not attach exact earliest date unless OED is checked."],
  ["Webster 1828 is a checkpoint, not the origin.", "safe", "Round 05 and round 06 evidence", "high", "low", "yes", "This is now firmly established."],
  ["Artificial has pre-1828 art / skill / making evidence.", "safe", "Etymonline; MW; Sherry/Wilson/Gunter technical uses", "high", "low", "yes", "Safe without exact earliest-date language."],
  ["Artificial has pre-1828 technical/rule evidence.", "safe", "Sherry 1550; Wilson 1553; Gunter 1636; Napier context", "high", "low", "yes", "Strongest Chart 1 evidence set."],
  ["Artificial has pre-1828 not-natural evidence distinct from fake.", "mostly_safe", "Johnson indirect; Etymonline; Perkins artificial day; Webster checkpoint", "medium", "direct Johnson/OED not captured", "yes_with_care", "Use the distinction; avoid exact chronology."],
  ["Artificial has pre-1828 fake/not-genuine evidence.", "mostly_safe", "Shakespeare artificial tears; Johnson indirect; Etymonline", "medium_high", "Johnson direct missing", "yes_with_care", "Safe as coexisting/later branch, not original sense."],
  ["Artificial has pre-1828 affected/insincere evidence.", "partially_supported", "Etymonline; Shakespeare overlap", "medium_low", "no clean primary snippet", "notes_only", "Keep out of main claim unless OED confirms."],
  ["Artificial day can be used as a visible Chart 1 anchor.", "too_risky", "Perkins indirect; Etymonline; Webster 1828", "medium", "public-facing obscurity and indirect source", "notes_only", "Use only as note/sidebar if necessary."],
  ["Artificial lines can be used as a visible Chart 1 anchor.", "partially_supported", "Gunter 1636; Webster 1828", "medium", "technical obscurity", "yes_with_care", "Better as small annotation than core anchor."],
  ["Johnson direct entries are necessary for Chart 1.", "unsupported", "Johnson remains indirect; other sources suffice", "medium", "low", "no", "Useful but not necessary for content-structure planning."],
  ["OED is necessary only for exact earliest-date claims, not for the basic Chart 1 claim.", "safe", "Round 05/06 source coverage", "high", "low", "yes", "Content planning can proceed without OED if wording stays conservative."],
].map(([claim, status, strongest_sources, evidence_strength, risk, can_use_in_chart_01, notes]) => ({
  claim,
  status,
  strongest_sources,
  evidence_strength,
  risk,
  can_use_in_chart_01,
  notes,
}));

const unresolvedItems = [
  ["OED artificial", "not accessible", "blocks_final_copy", "Check only before exact earliest-date language.", "Does not block content-structure planning."],
  ["MED artificial / artificial day", "not stabilized", "optional", "Check only if artificial day becomes important.", "Do not run another broad scrape."],
  ["Johnson direct artificial entry", "direct extraction unstable", "minor_risk", "Manual capture from Johnson site or scan if needed.", "Indirect transcription is enough for planning."],
  ["Artificial day direct pre-1828 scan", "indirect Perkins source only", "minor_risk", "Manual scan if used visibly.", "Recommendation is notes-only."],
  ["Artificial lines direct full text", "title metadata plus Webster checkpoint only", "minor_risk", "Manual Gunter scan if used as public citation.", "Small annotation only."],
  ["Affected/insincere primary snippet", "not found cleanly", "minor_risk", "OED check before final copy if this branch matters.", "Keep notes-only."],
  ["Broad evidence gathering", "complete enough", "closed", "Stop broad evidence gathering.", "Move to content-structure planning."],
].map(([item, issue, blocking_level, next_action, notes]) => ({ item, issue, blocking_level, next_action, notes }));

async function main() {
  await Promise.all([RAW_DIR, PROCESSED_DIR, NOTES_DIR, SOURCES_DIR].map((dir) => mkdir(dir, { recursive: true })));

  await writeFile(path.join(RAW_DIR, "round_06_dictionary_gap_extracts.json"), `${JSON.stringify(dictionaryGapExtracts, null, 2)}\n`);
  await writeFile(
    path.join(RAW_DIR, "round_06_pre_1828_negative_snippets.csv"),
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
        "evidence_value",
        "chart_01_usefulness",
        "notes",
      ],
      negativeSnippets,
    )}\n`,
  );
  await writeFile(
    path.join(RAW_DIR, "round_06_anchor_gap_snippets.csv"),
    `${csvRows(
      [
        "id",
        "phrase",
        "variant_spelling",
        "year_or_period",
        "source_title",
        "source_author",
        "source_type",
        "source_url",
        "sense",
        "confidence",
        "short_summary",
        "evidence_value",
        "chart_01_usefulness",
        "notes",
      ],
      anchorGapSnippets,
    )}\n`,
  );
  await writeFile(
    path.join(RAW_DIR, "round_06_source_access_log.csv"),
    `${csvRows(["source_name", "url", "access_status", "checked_for", "result", "limitations"], sourceAccessLog)}\n`,
  );

  await writeFile(
    path.join(PROCESSED_DIR, "round_06_negative_sense_evidence.csv"),
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
        "evidence_value",
        "chart_01_usefulness",
        "notes",
      ],
      negativeSnippets,
    )}\n`,
  );
  await writeFile(
    path.join(PROCESSED_DIR, "round_06_not_natural_vs_fake_matrix.csv"),
    `${csvRows(
      ["sense", "definition", "pre_1828_support", "strongest_source", "confidence", "can_use_in_chart_01", "notes"],
      notNaturalVsFake,
    )}\n`,
  );
  await writeFile(
    path.join(PROCESSED_DIR, "round_06_weak_anchor_final_status.csv"),
    `${csvRows(
      [
        "phrase",
        "status",
        "strongest_source",
        "year_or_period",
        "primary_sense",
        "confidence",
        "public_facing_risk",
        "final_chart_01_recommendation",
        "notes",
      ],
      weakAnchorStatus,
    )}\n`,
  );
  await writeFile(
    path.join(PROCESSED_DIR, "round_06_johnson_status.csv"),
    `${csvRows(
      ["term", "entry_status", "source_url_or_reference", "definition_summary", "sense_support", "confidence", "usable_for_chart_01", "notes"],
      johnsonStatus,
    )}\n`,
  );
  await writeFile(
    path.join(PROCESSED_DIR, "round_06_final_claim_status.csv"),
    `${csvRows(["claim", "status", "strongest_sources", "evidence_strength", "risk", "can_use_in_chart_01", "notes"], finalClaims)}\n`,
  );
  await writeFile(
    path.join(PROCESSED_DIR, "round_06_remaining_unresolved_items.csv"),
    `${csvRows(["item", "issue", "blocking_level", "next_action", "notes"], unresolvedItems)}\n`,
  );

  await writeFile(
    path.join(SOURCES_DIR, "round_06_source_urls.md"),
    `# Round 06 Source URLs

- Definitions.net Johnson artificial: https://www.definitions.net/definition/artificial
- Project Gutenberg Shakespeare Henry VI Part 3: https://www.gutenberg.org/files/1502/1502-h/1502-h.htm
- Etymonline artificial: https://www.etymonline.com/word/artificial
- Webster 1828 artificial: https://webstersdictionary1828.com/Dictionary/artificial
- Webster 1828 day: https://webstersdictionary1828.com/Home?word=day
- Reformed Books Online / Perkins artificial day excerpt: https://reformedbooksonline.com/topics/topics-by-subject/the-lords-day/when-does-the-lords-day-begin/
- Google Play Books / Edmund Gunter artificiall lines title metadata: https://play.google.com/store/books/details/Edmund_GUNTER_The_Description_and_Use_of_the_Secto?id=Q4C1qhHk2FEC
`,
  );

  await writeFile(
    path.join(NOTES_DIR, "round_06_collection_log.md"),
    `# Round 06 Collection Log

Generated: ${generatedAt}

## Scope

Final narrow gap check for Chart 1 only. Checked negative/suspicious senses, not-natural vs fake separation, artificial day, artificial lines, and Johnson direct-entry status.

## Actions

- Rechecked Johnson direct availability and recorded indirect-only status.
- Captured Shakespeare artificial tears as the strongest pre-1828 fake/feigned-emotion evidence.
- Rechecked Etymonline negative-sense chronology.
- Checked Webster 1828 only as checkpoint/comparison.
- Checked artificial day and artificial lines weak anchors.
- Stopped broad source expansion.

## Manual Fixes

None. Files are generated from documented source summaries.
`,
  );

  await writeFile(
    path.join(NOTES_DIR, "round_06_source_notes.md"),
    `# Round 06 Source Notes

Generated: ${generatedAt}

## Strongest Sources

- Shakespeare / Project Gutenberg is the strongest primary text for artificial tears as feigned or not genuine.
- Definitions.net gives the most useful Johnson-attributed sense split, but remains indirect.
- Etymonline remains the best accessible source for pre-1828 negative-sense chronology.
- Gunter 1636 title metadata verifies artificiall lines as a pre-1828 technical phrase.
- Perkins 1606, via a modern quotation, supports artificial day but still needs direct scan verification before visible use.

## Limitations

OED and MED were not accessible. Johnson direct extraction remains unstable. Bailey, Ash, Sheridan, and Walker did not produce stable extracts worth adding.
`,
  );

  await writeFile(
    path.join(NOTES_DIR, "round_06_gap_check_synthesis.md"),
    `# Round 06 Gap Check Synthesis

Generated: ${generatedAt}

## 1. Overview

This final gap check closes enough of the remaining Chart 1 uncertainty to move into content-structure planning. It does not remove the need for OED before exact earliest-date language, but it does show that the basic semantic boundaries are safe if stated carefully.

## 2. What This Round Checked

The pass checked only negative/suspicious senses, not-natural vs fake separation, artificial day, artificial lines, and Johnson status.

## 3. Pre-1828 Not-Natural Evidence

Not-natural as a distinct sense remains supported by Johnson indirect evidence, Etymonline, artificial day material, and Webster 1828 as checkpoint. The safe formulation is that artificial can mean made by art or opposed to natural without necessarily meaning fake.

## 4. Pre-1828 Fake / Not-Genuine Evidence

The strongest evidence is artificial tears in Shakespeare, reinforced by Johnson's indirect classification under fictitious/not-genuine and Etymonline's 1640s chronology. This branch is usable with care as a coexisting/later negative sense.

## 5. Pre-1828 Affected / Insincere Evidence

Affected/insincere remains weaker. Etymonline dates it before 1828, and artificial tears overlaps with feigned emotion, but no clean separate primary snippet was captured. Keep this mostly in notes unless OED confirms it.

## 6. Artificial Day Final Status

Artificial day is historically plausible and partially confirmed through Etymonline, Webster 1828, and a Perkins 1606 excerpt quoted in a modern source. Because the direct early source was not captured and the term is public-facing obscure, it should remain notes-only or a very small annotation.

## 7. Artificial Lines Final Status

Artificial lines is now confirmed pre-1828 through Edmund Gunter 1636 title metadata using artificiall lines and through Webster 1828 as a meaning checkpoint. It is suitable as a small technical annotation, not a core anchor.

## 8. Johnson Final Status

Johnson direct extraction remains unresolved. The Definitions.net Johnson transcription is useful and clearly separates made-by-art/not-natural from fictitious/not-genuine, but it should be labeled indirect.

## 9. What Can Safely Enter Chart 1

- Artificial predates Webster 1828.
- Webster 1828 is a checkpoint, not origin.
- Artificial has pre-1828 art/skill/making and technical/rule evidence.
- Not-natural and fake can be separated with care.
- Fake/not-genuine can be included as a later/coexisting branch, especially via artificial tears.

## 10. What Should Remain Notes-Only

- Artificial day as earliest-use anchor.
- Affected/insincere as a distinct pre-1828 branch.
- Johnson direct-entry claims unless manually captured.

## 11. What Should Be Excluded

- Artificiall/artificall day spellings without direct source.
- Artificall lines spelling without source.
- Any exact earliest-date claim without OED/MED.
`,
  );

  await writeFile(
    path.join(NOTES_DIR, "round_06_final_safe_claims.md"),
    `# Round 06 Final Safe Claims

Generated: ${generatedAt}

## Safe

- Artificial predates Webster 1828.
- Webster 1828 is a checkpoint, not the origin.
- Artificial has pre-1828 art / skill / making evidence.
- Artificial has pre-1828 technical / rule evidence.

## Safe With Care

- Artificial has pre-1828 not-natural evidence distinct from fake.
- Artificial has pre-1828 fake / not-genuine evidence.
- Artificial lines can support a technical/reckoning annotation.
- Johnson can support Chart 1 only as indirect evidence unless manually captured.

## Notes Only

- Artificial day as a pre-1828 anchor.
- Affected / insincere as a pre-1828 branch.
- OED/MED earliest-date claims.

## Do Not Claim

- Do not claim artificial originally meant fake.
- Do not claim artificial day is verified as the earliest English use.
- Do not claim artificial lines should be a visible core anchor.
- Do not claim Johnson direct entries were captured.
`,
  );

  await writeFile(
    path.join(NOTES_DIR, "round_06_stop_or_continue_recommendation.md"),
    `# Round 06 Stop Or Continue Recommendation

Generated: ${generatedAt}

## Recommendation

Stop broad evidence gathering and move to content-structure planning.

## Reason

The basic Chart 1 claim no longer depends on Webster 1828 as an origin. Pre-1828 art/skill/making and technical/rule evidence is established from earlier rounds, and this final pass adds enough support for the negative and contrast-sense boundary.

## Specific Remaining Manual Checks

- Check OED only before exact earliest-date claims.
- Check Johnson direct entry only if the final page wants to cite Johnson by name.
- Check a direct Perkins or OED source only if artificial day becomes visible rather than notes-only.
- Check a direct Gunter scan only if artificial lines is used as a public-facing source.

No further broad scraping round is recommended.
`,
  );

  console.log("Round 06 final gap check package complete.");
}

await main();
