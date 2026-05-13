import fs from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve("docs/research/artificial/chart_05_human_continuation");
const DIRS = ["raw", "processed", "notes", "sources", "scripts"].map((dir) => path.join(ROOT, dir));
const CREATED_AT = "2026-05-13 21:22:30 AEST";

const ngramSettings = {
  source: "Google Books Ngram",
  corpus: "en",
  yearStart: 1800,
  yearEnd: 2019,
  smoothing: 0,
  caseInsensitive: true,
};

const termInventory = [
  // Layer 1: external/background
  ["artificial aid", 1, "external_artificial_things", "background_support", "support", "unclear", "background", "historical", "established_term"],
  ["artificial apparatus", 1, "external_artificial_things", "background_support", "support", "unclear", "background", "historical", "established_term"],
  ["artificial device", 1, "external_artificial_things", "background_support", "support", "unclear", "background", "historical", "established_term"],
  ["artificial support", 1, "external_artificial_things", "background_support", "support", "unclear", "background", "historical", "established_term"],
  ["mechanical aid", 1, "external_artificial_things", "background_support", "support", "unclear", "background", "historical", "established_term"],
  ["life-saving apparatus", 1, "external_artificial_things", "background_support", "support", "unclear", "background", "historical", "established_term"],

  // Layer 2: body support
  ["artificial respiration", 2, "body_support", "maintain_life_process", "support", "medical_support", "core", "historical", "established_term"],
  ["artificial feeding", 2, "body_support", "maintain_life_process", "support", "medical_support", "core", "historical", "established_term"],
  ["artificial nutrition", 2, "body_support", "maintain_life_process", "support", "medical_support", "supporting", "historical", "established_term"],
  ["artificial hydration", 2, "body_support", "maintain_life_process", "support", "medical_support", "supporting", "historical", "established_term"],
  ["artificial life support", 2, "body_support", "maintain_life_process", "support", "medical_support", "core", "modern_established", "established_term"],
  ["life support", 2, "body_support", "maintain_life_process", "support", "medical_support", "core", "modern_established", "established_term"],
  ["mechanical ventilation", 2, "body_support", "maintain_life_process", "support", "medical_support", "core", "modern_established", "established_term"],
  ["nutritional support", 2, "body_support", "maintain_life_process", "support", "medical_support", "supporting", "modern_established", "established_term"],
  ["tube feeding", 2, "body_support", "maintain_life_process", "support", "medical_support", "supporting", "modern_established", "established_term"],

  // Layer 3: body replacement
  ["artificial limb", 3, "body_replacement", "replace_human_function", "replacement", "prosthetic_replacement", "core", "historical", "established_term"],
  ["artificial limbs", 3, "body_replacement", "replace_human_function", "replacement", "prosthetic_replacement", "supporting", "historical", "established_term"],
  ["prosthesis", 3, "body_replacement", "replace_human_function", "replacement", "prosthetic_replacement", "core", "historical", "established_term"],
  ["prosthetic limb", 3, "body_replacement", "replace_human_function", "replacement", "prosthetic_replacement", "supporting", "modern_established", "established_term"],
  ["artificial heart", 3, "body_replacement", "replace_human_function", "replacement", "organ_replacement", "core", "modern_established", "established_term"],
  ["artificial hearts", 3, "body_replacement", "replace_human_function", "replacement", "organ_replacement", "supporting", "modern_established", "established_term"],
  ["artificial kidney", 3, "body_replacement", "replace_human_function", "replacement", "organ_replacement", "core", "modern_established", "established_term"],
  ["artificial organ", 3, "body_replacement", "replace_human_function", "replacement", "organ_replacement", "core", "modern_established", "established_term"],
  ["artificial organs", 3, "body_replacement", "replace_human_function", "replacement", "organ_replacement", "core", "modern_established", "established_term"],
  ["heart-assist device", 3, "body_replacement", "assist_or_replace_function", "replacement", "organ_replacement", "supporting", "modern_established", "established_term"],
  ["bionic limb", 3, "body_replacement", "replace_human_function", "replacement", "prosthetic_replacement", "supporting", "modern_established", "emerging_term"],
  ["synthetic organ", 3, "body_replacement", "replace_human_function", "replacement", "organ_replacement", "supporting", "modern_emerging", "emerging_term"],

  // Layer 4: reproduction / continuation
  ["artificial insemination", 4, "reproduction_continuation", "generate_or_continue_life", "continuation", "biological_life", "core", "historical", "established_term"],
  ["artificial fertilization", 4, "reproduction_continuation", "generate_or_continue_life", "continuation", "biological_life", "core", "historical", "established_term"],
  ["artificial fertilisation", 4, "reproduction_continuation", "generate_or_continue_life", "continuation", "biological_life", "variant", "historical", "established_term"],
  ["in vitro fertilization", 4, "reproduction_continuation", "generate_or_continue_life", "continuation", "biological_life", "core", "modern_established", "established_term"],
  ["in vitro fertilisation", 4, "reproduction_continuation", "generate_or_continue_life", "continuation", "biological_life", "variant", "modern_established", "established_term"],
  ["test-tube baby", 4, "reproduction_continuation", "generate_or_continue_life", "continuation", "biological_life", "supporting", "modern_established", "established_term"],
  ["artificial womb", 4, "reproduction_continuation", "gestation_boundary", "continuation", "biological_life", "core", "modern_emerging", "emerging_term"],
  ["ectogenesis", 4, "reproduction_continuation", "gestation_boundary", "continuation", "biological_life", "supporting", "modern_emerging", "speculative_term"],

  // Bridge and Layer 5: process/cognition/presence
  ["artificial life", 5, "human_process_cognition_presence", "life_process_simulation", "simulation", "computational_life", "bridge", "historical", "established_term"],
  ["artificial language", 5, "human_process_cognition_presence", "human_symbol_process", "simulation", "human_process", "core", "historical", "established_term"],
  ["artificial voice", 5, "human_process_cognition_presence", "human_presence", "simulation", "voice_presence", "core", "modern_emerging", "policy_sensitive"],
  ["synthetic voice", 5, "human_process_cognition_presence", "human_presence", "simulation", "voice_presence", "supporting", "modern_emerging", "policy_sensitive"],
  ["voice cloning", 5, "human_process_cognition_presence", "human_presence", "simulation", "voice_presence", "supporting", "modern_emerging", "policy_sensitive"],
  ["AI voice", 5, "human_process_cognition_presence", "human_presence", "simulation", "voice_presence", "supporting", "modern_emerging", "policy_sensitive"],
  ["artificial intelligence", 5, "human_process_cognition_presence", "cognitive_process", "simulation", "cognitive_process", "core", "modern_established", "established_term"],
  ["machine intelligence", 5, "human_process_cognition_presence", "cognitive_process", "simulation", "cognitive_process", "supporting", "historical", "established_term"],
  ["artificial neural network", 5, "human_process_cognition_presence", "cognitive_model", "simulation", "cognitive_process", "core", "modern_established", "established_term"],
  ["neural network", 5, "human_process_cognition_presence", "cognitive_model", "simulation", "cognitive_process", "supporting", "modern_established", "established_term"],
  ["artificial consciousness", 5, "human_process_cognition_presence", "consciousness_edge", "speculative_extension", "philosophical_life", "edge", "speculative", "philosophical_term"],
  ["machine consciousness", 5, "human_process_cognition_presence", "consciousness_edge", "speculative_extension", "philosophical_life", "edge", "speculative", "philosophical_term"],
  ["artificial companion", 5, "human_process_cognition_presence", "social_presence", "speculative_extension", "social_presence", "edge", "modern_emerging", "emerging_term"],
  ["AI companion", 5, "human_process_cognition_presence", "social_presence", "speculative_extension", "social_presence", "edge", "modern_emerging", "emerging_term"],
  ["artificial agent", 5, "human_process_cognition_presence", "agency_presence", "speculative_extension", "cognitive_process", "edge", "modern_emerging", "terminology_unstable"],
  ["AI agent", 5, "human_process_cognition_presence", "agency_presence", "speculative_extension", "cognitive_process", "edge", "modern_emerging", "terminology_unstable"],
  ["artificial general intelligence", 5, "human_process_cognition_presence", "general_cognition", "speculative_extension", "cognitive_process", "edge", "speculative", "hype_sensitive"],
  ["artificial creativity", 5, "human_process_cognition_presence", "creative_process", "speculative_extension", "cognitive_process", "edge", "modern_emerging", "emerging_term"],
];

const sourceEvidence = [
  {
    id: "E001",
    term_or_phrase: "artificial respiration",
    primary_layer: 2,
    function_mode: "support",
    source_period: "modern_reference",
    year_or_period: "MeSH current; historical subheading available",
    source_name: "NCBI MeSH: Respiration, Artificial",
    source_type: "medical_dictionary",
    source_url: "https://www.ncbi.nlm.nih.gov/mesh/68012121",
    evidence_kind: "definition",
    confidence: "high",
    short_summary: "Defines artificial respiration as mechanical or non-mechanical methods that force air into and out of the lungs; entry terms include mechanical ventilation.",
    chart05_relevance: "high",
    current_relevance: "modern_established",
    speculative_status: "established_term",
    notes: "Strong Layer 2 support anchor; semantic mode is sustain/maintain breathing.",
  },
  {
    id: "E002",
    term_or_phrase: "mechanical ventilation",
    primary_layer: 2,
    function_mode: "support",
    source_period: "modern_reference",
    year_or_period: "MeSH entry term under Respiration, Artificial",
    source_name: "NCBI MeSH: Respiration, Artificial",
    source_type: "medical_dictionary",
    source_url: "https://www.ncbi.nlm.nih.gov/mesh/68012121",
    evidence_kind: "entry_term",
    confidence: "high",
    short_summary: "Mechanical ventilation appears as an entry term under artificial respiration.",
    chart05_relevance: "high",
    current_relevance: "modern_established",
    speculative_status: "established_term",
    notes: "Bridge anchor from older artificial respiration to modern life-support technology.",
  },
  {
    id: "E003",
    term_or_phrase: "artificial feeding",
    primary_layer: 2,
    function_mode: "support",
    source_period: "modern_reference",
    year_or_period: "MeSH current",
    source_name: "NCBI MeSH: Nutritional Support",
    source_type: "medical_dictionary",
    source_url: "https://www.ncbi.nlm.nih.gov/mesh/68018529",
    evidence_kind: "entry_term",
    confidence: "high",
    short_summary: "MeSH lists Artificial Feeding and Feeding, Artificial as entry terms for nutritional support.",
    chart05_relevance: "high",
    current_relevance: "modern_established",
    speculative_status: "established_term",
    notes: "Supports Layer 2 as artificial sustaining necessary bodily intake.",
  },
  {
    id: "E004",
    term_or_phrase: "artificial feeding",
    primary_layer: 2,
    function_mode: "support",
    source_period: "modern_reference",
    year_or_period: "2022 update",
    source_name: "NCBI Bookshelf: Enteral Feeding",
    source_type: "medical_reference",
    source_url: "https://www.ncbi.nlm.nih.gov/books/NBK532876/",
    evidence_kind: "context_signal",
    confidence: "high",
    short_summary: "Describes artificial nutrition as providing or supplementing daily metabolic requirements when oral feeding is inadequate or contraindicated.",
    chart05_relevance: "high",
    current_relevance: "modern_established",
    speculative_status: "established_term",
    notes: "Good support-mode language for the layer label.",
  },
  {
    id: "E005",
    term_or_phrase: "artificial life support",
    primary_layer: 2,
    function_mode: "support",
    source_period: "modern_reference",
    year_or_period: "MeSH current; introduced 1978",
    source_name: "NCBI MeSH: Life Support Care",
    source_type: "medical_dictionary",
    source_url: "https://www.ncbi.nlm.nih.gov/mesh/68008020",
    evidence_kind: "definition",
    confidence: "high",
    short_summary: "Defines life support care as extraordinary therapeutic measures to sustain and prolong life.",
    chart05_relevance: "high",
    current_relevance: "modern_established",
    speculative_status: "established_term",
    notes: "Anchor for artificial keeps life going; phrase 'artificial life support' itself still needs phrase-source review.",
  },
  {
    id: "E006",
    term_or_phrase: "artificial limb",
    primary_layer: 3,
    function_mode: "replacement",
    source_period: "modern_reference",
    year_or_period: "MeSH current",
    source_name: "NCBI MeSH: Artificial Limbs",
    source_type: "medical_dictionary",
    source_url: "https://www.ncbi.nlm.nih.gov/mesh/68001186",
    evidence_kind: "definition",
    confidence: "high",
    short_summary: "Defines artificial limbs as prosthetic replacements for arms, legs, and parts thereof.",
    chart05_relevance: "high",
    current_relevance: "modern_established",
    speculative_status: "established_term",
    notes: "Clean Layer 3 replacement anchor.",
  },
  {
    id: "E007",
    term_or_phrase: "artificial limb",
    primary_layer: 3,
    function_mode: "replacement",
    source_period: "modern_reference",
    year_or_period: "MedlinePlus current",
    source_name: "MedlinePlus: Artificial Limbs",
    source_type: "medical_reference",
    source_url: "https://medlineplus.gov/artificiallimbs.html",
    evidence_kind: "context_signal",
    confidence: "high",
    short_summary: "Explains artificial limbs as prostheses that can replace missing arms or legs and help perform daily activities.",
    chart05_relevance: "high",
    current_relevance: "modern_established",
    speculative_status: "established_term",
    notes: "Useful plain-language source for replacement/restoration.",
  },
  {
    id: "E008",
    term_or_phrase: "artificial heart",
    primary_layer: 3,
    function_mode: "replacement",
    source_period: "modern_reference",
    year_or_period: "MeSH introduced 1967",
    source_name: "NCBI MeSH: Heart, Artificial",
    source_type: "medical_dictionary",
    source_url: "https://www.ncbi.nlm.nih.gov/mesh/D006354",
    evidence_kind: "definition",
    confidence: "high",
    short_summary: "Defines an artificial heart as a pumping mechanism duplicating natural heart output/rate/pressure and replacing all or part of heart function.",
    chart05_relevance: "high",
    current_relevance: "modern_established",
    speculative_status: "established_term",
    notes: "Strong Layer 3 organ-function replacement anchor.",
  },
  {
    id: "E009",
    term_or_phrase: "artificial kidney",
    primary_layer: 3,
    function_mode: "replacement",
    source_period: "modern_reference",
    year_or_period: "MeSH previous indexing 1966",
    source_name: "NCBI MeSH: Renal Dialysis",
    source_type: "medical_dictionary",
    source_url: "https://www.ncbi.nlm.nih.gov/mesh/68006435",
    evidence_kind: "entry_history",
    confidence: "high",
    short_summary: "Renal dialysis entry notes previous indexing under Kidney, Artificial in 1966.",
    chart05_relevance: "high",
    current_relevance: "modern_established",
    speculative_status: "established_term",
    notes: "Strong historical anchor for artificial kidney as replacement therapy context.",
  },
  {
    id: "E010",
    term_or_phrase: "artificial organs",
    primary_layer: 3,
    function_mode: "replacement",
    source_period: "modern_reference",
    year_or_period: "Journal start 1977",
    source_name: "NLM Catalog: Artificial organs",
    source_type: "medical_catalog",
    source_url: "https://www.ncbi.nlm.nih.gov/nlmcatalog/7802778",
    evidence_kind: "publication_anchor",
    confidence: "medium",
    short_summary: "NLM catalog records a MEDLINE-indexed journal titled Artificial Organs starting in 1977.",
    chart05_relevance: "medium",
    current_relevance: "modern_established",
    speculative_status: "established_term",
    notes: "Shows field-level consolidation; not a definition by itself.",
  },
  {
    id: "E011",
    term_or_phrase: "artificial insemination",
    primary_layer: 4,
    function_mode: "continuation",
    source_period: "modern_reference",
    year_or_period: "MeSH current",
    source_name: "NCBI MeSH: Insemination, Artificial",
    source_type: "medical_dictionary",
    source_url: "https://www.ncbi.nlm.nih.gov/mesh/68007315",
    evidence_kind: "definition",
    confidence: "high",
    short_summary: "Defines artificial insemination as artificial introduction of semen or spermatozoa to facilitate fertilization.",
    chart05_relevance: "high",
    current_relevance: "modern_established",
    speculative_status: "established_term",
    notes: "Core Layer 4 continuation anchor; intervention in reproduction rather than support/replacement.",
  },
  {
    id: "E012",
    term_or_phrase: "in vitro fertilization",
    primary_layer: 4,
    function_mode: "continuation",
    source_period: "modern_reference",
    year_or_period: "MeSH introduced 1979",
    source_name: "NCBI MeSH: Fertilization in Vitro",
    source_type: "medical_dictionary",
    source_url: "https://www.ncbi.nlm.nih.gov/mesh/68005307",
    evidence_kind: "definition",
    confidence: "high",
    short_summary: "Defines IVF as assisted reproduction involving direct handling and manipulation of oocytes and sperm to achieve fertilization in vitro.",
    chart05_relevance: "high",
    current_relevance: "modern_established",
    speculative_status: "established_term",
    notes: "Strong continuation/reproduction anchor and successor to artificial fertilization language.",
  },
  {
    id: "E013",
    term_or_phrase: "artificial womb",
    primary_layer: 4,
    function_mode: "continuation",
    source_period: "2000_2019",
    year_or_period: "2017",
    source_name: "Nature Communications: extra-uterine lamb support system",
    source_type: "scientific_article",
    source_url: "https://www.nature.com/articles/ncomms15794",
    evidence_kind: "scientific_anchor",
    confidence: "medium",
    short_summary: "Nature Communications record for the 2017 extra-uterine system work on extreme premature lamb support; useful as artificial womb technology anchor.",
    chart05_relevance: "medium",
    current_relevance: "modern_emerging",
    speculative_status: "emerging_term",
    notes: "Use carefully: animal/preclinical support, not human gestation replacement.",
  },
  {
    id: "E014",
    term_or_phrase: "artificial womb",
    primary_layer: 4,
    function_mode: "continuation",
    source_period: "2019_2026",
    year_or_period: "2026",
    source_name: "PubMed: Artificial Womb Technology systematic review",
    source_type: "medical_review",
    source_url: "https://pubmed.ncbi.nlm.nih.gov/41664724/",
    evidence_kind: "review_signal",
    confidence: "high",
    short_summary: "2026 systematic review treats artificial womb technology as preclinical fetal support and notes no human trials yet.",
    chart05_relevance: "high",
    current_relevance: "modern_emerging",
    speculative_status: "speculative_term",
    notes: "Critical source for controlling speculative status.",
  },
  {
    id: "E015",
    term_or_phrase: "artificial life",
    primary_layer: 5,
    function_mode: "simulation",
    source_period: "modern_reference",
    year_or_period: "recognized discipline in the 1980s; 1987 conference",
    source_name: "Britannica: Artificial life",
    source_type: "encyclopedia",
    source_url: "https://www.britannica.com/technology/artificial-life",
    evidence_kind: "definition",
    confidence: "high",
    short_summary: "Defines artificial life as computer simulation of life used to study living systems, with recognized field status in the 1980s.",
    chart05_relevance: "high",
    current_relevance: "modern_established",
    speculative_status: "established_term",
    notes: "Bridge node from life continuation to computational life-process simulation; do not collapse with reproduction terms.",
  },
  {
    id: "E016",
    term_or_phrase: "artificial language",
    primary_layer: 5,
    function_mode: "simulation",
    source_period: "historical",
    year_or_period: "1887 Esperanto anchor",
    source_name: "Britannica: Esperanto",
    source_type: "encyclopedia",
    source_url: "https://www.britannica.com/topic/Esperanto",
    evidence_kind: "historical_anchor",
    confidence: "high",
    short_summary: "Britannica describes Esperanto as an artificial language constructed in 1887 for international second-language use.",
    chart05_relevance: "high",
    current_relevance: "historical",
    speculative_status: "established_term",
    notes: "Important non-AI cognition/process anchor: artificial enters human symbolic process before modern AI.",
  },
  {
    id: "E017",
    term_or_phrase: "artificial language",
    primary_layer: 5,
    function_mode: "simulation",
    source_period: "modern_reference",
    year_or_period: "dictionary current",
    source_name: "Merriam-Webster: artificial language",
    source_type: "dictionary",
    source_url: "https://www.merriam-webster.com/dictionary/artificial%20language",
    evidence_kind: "definition",
    confidence: "high",
    short_summary: "Defines artificial language as a devised language for international or specific purposes, not native speech.",
    chart05_relevance: "medium",
    current_relevance: "modern_established",
    speculative_status: "established_term",
    notes: "Useful boundary source for language/process layer.",
  },
  {
    id: "E018",
    term_or_phrase: "artificial intelligence",
    primary_layer: 5,
    function_mode: "simulation",
    source_period: "modern_reference",
    year_or_period: "AI article current; 1950s history",
    source_name: "Britannica: Artificial intelligence",
    source_type: "encyclopedia",
    source_url: "https://www.britannica.com/technology/artificial-intelligence",
    evidence_kind: "definition",
    confidence: "high",
    short_summary: "Defines AI as computer/robot ability to perform tasks associated with human intellectual processes such as reasoning.",
    chart05_relevance: "high",
    current_relevance: "modern_established",
    speculative_status: "established_term",
    notes: "Top-layer anchor, but not chart center.",
  },
  {
    id: "E019",
    term_or_phrase: "artificial neural network",
    primary_layer: 5,
    function_mode: "simulation",
    source_period: "modern_reference",
    year_or_period: "theoretical basis 1943; first simple network 1954",
    source_name: "Britannica: neural network",
    source_type: "encyclopedia",
    source_url: "https://www.britannica.com/technology/neural-network",
    evidence_kind: "definition",
    confidence: "high",
    short_summary: "Defines artificial neural networks as computer programs inspired by brain networks, with early theoretical and implementation history.",
    chart05_relevance: "high",
    current_relevance: "modern_established",
    speculative_status: "established_term",
    notes: "Cognitive/process modeling node; good bridge from body/organ metaphors to mind process.",
  },
  {
    id: "E020",
    term_or_phrase: "artificial voice",
    primary_layer: 5,
    function_mode: "simulation",
    source_period: "2019_2026",
    year_or_period: "2024",
    source_name: "FCC Declaratory Ruling FCC-24-17",
    source_type: "regulatory_source",
    source_url: "https://docs.fcc.gov/public/attachments/FCC-24-17A1.pdf",
    evidence_kind: "policy_signal",
    confidence: "high",
    short_summary: "FCC confirms TCPA restrictions on artificial or prerecorded voice encompass current AI technologies that generate human voices.",
    chart05_relevance: "high",
    current_relevance: "modern_emerging",
    speculative_status: "policy_sensitive",
    notes: "Strong modern voice/presence anchor; policy source, not historical origin.",
  },
  {
    id: "E021",
    term_or_phrase: "artificial companion",
    primary_layer: 5,
    function_mode: "speculative_extension",
    source_period: "2019_2026",
    year_or_period: "2023",
    source_name: "International Journal of Social Robotics: Artificial companions review",
    source_type: "academic_review",
    source_url: "https://link.springer.com/article/10.1007/s12369-023-01031-y",
    evidence_kind: "review_signal",
    confidence: "medium",
    short_summary: "Systematic review treats artificial companions as adaptive and engaging systems oriented toward emotional bonds and long-term relationships.",
    chart05_relevance: "medium",
    current_relevance: "modern_emerging",
    speculative_status: "emerging_term",
    notes: "Edge node only; useful for presence layer, not center.",
  },
  {
    id: "E022",
    term_or_phrase: "AI companion",
    primary_layer: 5,
    function_mode: "speculative_extension",
    source_period: "2019_2026",
    year_or_period: "2024",
    source_name: "PubMed: Digital loneliness and AI companions",
    source_type: "academic_article",
    source_url: "https://pubmed.ncbi.nlm.nih.gov/38504806/",
    evidence_kind: "modern_context",
    confidence: "medium",
    short_summary: "2024 article frames AI companions in relation to social recognition and digital loneliness.",
    chart05_relevance: "low",
    current_relevance: "modern_emerging",
    speculative_status: "emerging_term",
    notes: "Use as context only; high risk of making chart too topical.",
  },
  {
    id: "E023",
    term_or_phrase: "artificial consciousness",
    primary_layer: 5,
    function_mode: "speculative_extension",
    source_period: "modern_reference",
    year_or_period: "2008",
    source_name: "PubMed: Artificial consciousness discipline obstacles",
    source_type: "academic_article",
    source_url: "https://pubmed.ncbi.nlm.nih.gov/18762409/",
    evidence_kind: "speculative_boundary",
    confidence: "medium",
    short_summary: "Article explicitly describes artificial consciousness as far from an established discipline and facing theoretical and technological obstacles.",
    chart05_relevance: "low",
    current_relevance: "speculative",
    speculative_status: "philosophical_term",
    notes: "Should be dotted/edge/notes-only unless later evidence justifies display.",
  },
  {
    id: "E024",
    term_or_phrase: "artificial general intelligence",
    primary_layer: 5,
    function_mode: "speculative_extension",
    source_period: "modern_reference",
    year_or_period: "2026 Britannica current",
    source_name: "Britannica: Is artificial general intelligence possible?",
    source_type: "encyclopedia",
    source_url: "https://www.britannica.com/technology/artificial-intelligence/Is-artificial-general-intelligence-AGI-possible",
    evidence_kind: "speculative_boundary",
    confidence: "high",
    short_summary: "Britannica frames AGI/strong AI as controversial and out of reach.",
    chart05_relevance: "low",
    current_relevance: "speculative",
    speculative_status: "hype_sensitive",
    notes: "AI boundary-control source; likely hover-only or notes-only.",
  },
  {
    id: "E025",
    term_or_phrase: "artificial general intelligence",
    primary_layer: 5,
    function_mode: "speculative_extension",
    source_period: "modern_reference",
    year_or_period: "Merriam-Webster current; first known use 1989",
    source_name: "Merriam-Webster: artificial general intelligence",
    source_type: "dictionary",
    source_url: "https://www.merriam-webster.com/dictionary/artificial%20general%20intelligence",
    evidence_kind: "definition",
    confidence: "medium",
    short_summary: "Dictionary definition treats AGI as potential capability; first known use listed as 1989.",
    chart05_relevance: "low",
    current_relevance: "speculative",
    speculative_status: "hype_sensitive",
    notes: "Useful if the term appears as a dotted edge.",
  },
  {
    id: "E026",
    term_or_phrase: "artificial",
    primary_layer: 0,
    function_mode: "mixed",
    source_period: "modern_reference",
    year_or_period: "dictionary current",
    source_name: "Merriam-Webster: artificial",
    source_type: "dictionary",
    source_url: "https://www.merriam-webster.com/dictionary/artificial",
    evidence_kind: "definition_family",
    confidence: "high",
    short_summary: "Includes artificial limb, artificial respiration, artificial insemination, artificial nutrition and broader made/not-natural senses.",
    chart05_relevance: "medium",
    current_relevance: "modern_established",
    speculative_status: "established_term",
    notes: "Useful source for why medical/body continuations are part of artificial's definition family.",
  },
];

const transitionEdges = [
  ["body_support", "body_support", "artificial respiration", "mechanical ventilation", "support_modernization", "strong", "MeSH lists mechanical ventilation as an entry term under artificial respiration.", "Use as intralayer bridge."],
  ["body_support", "body_support", "artificial feeding", "nutritional support", "support_modernization", "strong", "MeSH maps Artificial Feeding to Nutritional Support.", "Strong support mode distinction."],
  ["body_support", "body_replacement", "life support", "artificial heart", "support_to_replacement", "medium", "Life support sustains/prolongs life; artificial heart replaces pumping function.", "Conceptual bridge, not causal proof."],
  ["body_support", "body_replacement", "life support", "artificial kidney", "support_to_replacement", "medium", "Renal dialysis/kidney artificial evidence sits in replacement therapy and life-prolonging care contexts.", "Needs historical snippet if chart uses explicit line."],
  ["body_replacement", "body_replacement", "artificial limb", "prosthesis", "replacement_synonym_bridge", "strong", "MeSH defines artificial limbs as prosthetic replacements.", "Good layer-internal connector."],
  ["body_replacement", "reproduction_continuation", "artificial organ", "artificial womb", "replacement_to_continuation", "weak", "Artificial womb is closer to extracorporeal gestational support than conventional organ replacement.", "Mark as weak/edge; avoid causal line."],
  ["reproduction_continuation", "reproduction_continuation", "artificial insemination", "artificial fertilization", "continuation_chain", "medium", "Both intervene in reproductive process; artificial insemination facilitates fertilization.", "Needs older textual history if emphasized."],
  ["reproduction_continuation", "reproduction_continuation", "artificial fertilization", "in vitro fertilization", "continuation_modernization", "strong", "MeSH IVF definition covers direct handling/manipulation to achieve fertilization in vitro.", "Good transition from older phrase to modern technique."],
  ["reproduction_continuation", "human_process_cognition_presence", "artificial womb", "artificial life", "continuation_to_life_process_simulation", "weak", "Artificial womb is biological support/gestation; artificial life is computational life-process simulation.", "Use as conceptual bridge only."],
  ["human_process_cognition_presence", "human_process_cognition_presence", "artificial life", "artificial intelligence", "life_process_to_cognition", "medium", "Britannica notes A-life overlaps with adaptive systems and neural networks/AI questions.", "Do not imply origin."],
  ["human_process_cognition_presence", "human_process_cognition_presence", "artificial language", "artificial intelligence", "symbolic_process_to_cognition", "medium", "Artificial language predates AI and provides a human symbolic-process anchor.", "Useful to keep language visible before AI."],
  ["human_process_cognition_presence", "human_process_cognition_presence", "artificial neural network", "artificial intelligence", "cognitive_model_to_ai", "strong", "Britannica places neural networks in AI and cognitive computing.", "Strong top-layer connector."],
  ["human_process_cognition_presence", "human_process_cognition_presence", "artificial voice", "AI voice", "voice_presence_policy", "strong", "FCC ruling links artificial voice language to AI-generated human voices and voice cloning.", "Modern presence connector."],
  ["human_process_cognition_presence", "human_process_cognition_presence", "artificial voice", "artificial companion", "voice_to_social_presence", "weak", "Voice/presence can support companion systems, but current evidence is more topical than historical.", "Keep dotted if used."],
  ["human_process_cognition_presence", "human_process_cognition_presence", "artificial intelligence", "artificial consciousness", "ai_to_consciousness_edge", "speculative", "Artificial consciousness source stresses discipline remains theoretically obstructed.", "Dotted edge/notes-only."],
  ["human_process_cognition_presence", "human_process_cognition_presence", "artificial intelligence", "artificial general intelligence", "ai_to_agi_edge", "speculative", "Britannica frames AGI as controversial and out of reach.", "Hype-sensitive; notes-only likely."],
];

const speculativeTerms = [
  ["artificial intelligence", "established_term", "Established AI term with encyclopedia/dictionary support.", "yes", "solid_node", "Keep in top layer but not central."],
  ["artificial neural network", "established_term", "Established cognitive-computing and AI model term.", "yes", "solid_node", "Good process/cognition anchor."],
  ["artificial language", "established_term", "Historical constructed-language meaning predates modern AI.", "yes", "solid_node", "Important counterweight to AI."],
  ["artificial life", "established_term", "Established computational field but sense-split required.", "yes", "bridge_node", "Use as bridge from life to computational simulation."],
  ["artificial voice", "policy_sensitive", "Modern AI voice and regulatory evidence; voice-cloning risk context.", "yes", "solid_or_dotted_node", "Do not over-expand into AI policy chart."],
  ["synthetic voice", "policy_sensitive", "Related modern voice term; not necessarily artificial phrase.", "maybe", "hover_only", "Use if voice cluster needs depth."],
  ["AI companion", "emerging_term", "Modern social/presence term with recent scholarship and news.", "maybe", "dotted_node", "Can show edge, not core."],
  ["artificial companion", "emerging_term", "Academic review term, interdisciplinary and unstable boundaries.", "maybe", "dotted_node", "Good presence edge but not center."],
  ["artificial consciousness", "philosophical_term", "Theoretical obstacles and no established practical discipline.", "maybe", "hover_only", "Avoid solid node unless chart explicitly shows speculative edge."],
  ["machine consciousness", "philosophical_term", "Adjacent term; not a core artificial phrase.", "no", "notes_only", "Keep in notes unless needed."],
  ["artificial general intelligence", "hype_sensitive", "Dictionary/encyclopedia term but out-of-reach and controversial.", "maybe", "notes_only", "Use only as boundary note."],
  ["artificial agent", "terminology_unstable", "Agent language is broad and rapidly changing.", "no", "notes_only", "Needs separate intelligence-page treatment."],
  ["AI agent", "terminology_unstable", "Too current and unstable for this historical artificial chart.", "no", "notes_only", "Avoid center."],
  ["artificial creativity", "emerging_term", "Adjacent to computational creativity; not yet needed.", "no", "notes_only", "Optional future intelligence page."],
];

const transitionRows = transitionEdges.map(([source_layer, target_layer, source_term, target_term, relation_type, relation_strength, evidence_summary, notes]) => ({
  source_layer,
  target_layer,
  source_term,
  target_term,
  relation_type,
  relation_strength,
  evidence_summary,
  notes,
}));

const termRows = termInventory.map(
  ([
    term_or_phrase,
    primary_layer,
    layer_name,
    layer_role,
    function_mode,
    sense_track,
    chart_priority,
    current_relevance,
    speculative_status,
  ]) => ({
    term_or_phrase,
    primary_layer,
    layer_name,
    layer_role,
    function_mode,
    sense_track,
    chart_priority,
    current_relevance,
    speculative_status,
  }),
);

function csvEscape(value) {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (/[",\n\r]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

function toCsv(rows, columns) {
  return [
    columns.join(","),
    ...rows.map((row) => columns.map((column) => csvEscape(row[column])).join(",")),
  ].join("\n") + "\n";
}

async function writeCsv(file, rows, columns) {
  await fs.writeFile(path.join(ROOT, file), toCsv(rows, columns), "utf8");
}

async function ensureDirs() {
  await Promise.all(DIRS.map((dir) => fs.mkdir(dir, { recursive: true })));
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
    headers: { "User-Agent": "WordsOverTime/1.0 chart05 data collection" },
  });
  if (!response.ok) {
    throw new Error(`Ngram fetch failed ${response.status} for ${terms.join(", ")}`);
  }
  return response.json();
}

function cleanNgramName(name) {
  return name.replace(/\s+\(All\)$/i, "").trim();
}

async function collectNgrams() {
  const terms = termRows.map((row) => row.term_or_phrase);
  const batches = [];
  for (let i = 0; i < terms.length; i += 10) batches.push(terms.slice(i, i + 10));

  const ngramMap = new Map();
  const errors = [];
  for (const batch of batches) {
    try {
      const rows = await fetchNgramBatch(batch);
      for (const row of rows) {
        const cleaned = cleanNgramName(row.ngram);
        const key = cleaned.toLowerCase();
        const existing = ngramMap.get(key);
        if (!existing || /\(All\)$/i.test(row.ngram)) {
          ngramMap.set(key, row.timeseries ?? []);
        }
      }
    } catch (error) {
      errors.push({ batch: batch.join("; "), error: error.message });
    }
  }

  const rawRows = [];
  const longRows = [];
  const metadataRows = [];
  for (const term of terms) {
    const meta = termRows.find((row) => row.term_or_phrase === term);
    const values = ngramMap.get(term.toLowerCase()) ?? [];
    const hasReturned = values.length > 0;
    const nonzero = values
      .map((value, index) => ({ year: ngramSettings.yearStart + index, value }))
      .filter((item) => item.value > 0);
    let status = "missing";
    if (hasReturned && nonzero.length > 5) status = "collected";
    else if (hasReturned && nonzero.length > 0) status = "too_sparse";
    const peak = nonzero.reduce((best, item) => (item.value > best.value ? item : best), { year: "", value: 0 });
    const recentYear = ngramSettings.yearEnd;
    const recentValue = hasReturned ? values[values.length - 1] ?? 0 : 0;

    for (let i = 0; i < values.length; i += 1) {
      const row = {
        year: ngramSettings.yearStart + i,
        term,
        value: values[i],
        source: ngramSettings.source,
        corpus: ngramSettings.corpus,
        smoothing: ngramSettings.smoothing,
        case_sensitive: !ngramSettings.caseInsensitive,
        primary_layer: meta.primary_layer,
        layer_name: meta.layer_name,
        function_mode: meta.function_mode,
      };
      rawRows.push(row);
      longRows.push(row);
    }

    metadataRows.push({
      term_or_phrase: term,
      primary_layer: meta.primary_layer,
      layer_name: meta.layer_name,
      function_mode: meta.function_mode,
      sense_track: meta.sense_track,
      status,
      first_nonzero_year: nonzero[0]?.year ?? "",
      last_nonzero_year: nonzero.at(-1)?.year ?? "",
      peak_year: peak.year,
      peak_value: peak.value,
      recent_year: recentYear,
      recent_value: recentValue,
      nonzero_year_count: nonzero.length,
      notes: "Ngram first nonzero year is not first attestation; broad terms require contextual sources.",
    });
  }

  return { rawRows, longRows, metadataRows, errors };
}

function layerBoundaryRows() {
  const risks = {
    "artificial life": ["5", "4", "simulation", "Bridge from biological life language to computational ALife; do not place solely in reproduction.", "high"],
    "artificial voice": ["5", "", "simulation", "Human presence/process term; modern policy source makes it visible but not a body-support term.", "medium"],
    "artificial organ": ["3", "4", "replacement", "Organ replacement belongs Layer 3; artificial womb may tempt Layer 4 analogy but is gestational support.", "medium"],
    "artificial womb": ["4", "2", "continuation", "Preclinical fetal support/partial ectogestation; not conventional organ replacement and not full artificial life.", "high"],
    "artificial intelligence": ["5", "", "simulation", "Top cognitive-process term; must not become chart center.", "medium"],
  };
  return termRows.map((row) => {
    const override = risks[row.term_or_phrase];
    return {
      term_or_phrase: row.term_or_phrase,
      primary_layer: override?.[0] ?? row.primary_layer,
      secondary_layer: override?.[1] ?? "",
      function_mode: override?.[2] ?? row.function_mode,
      why_this_layer: override?.[3] ?? `${row.layer_name} / ${row.layer_role}`,
      boundary_risk: override?.[4] ?? (row.chart_priority === "edge" ? "medium" : "low"),
      notes: row.chart_priority === "background" ? "Background only; probably not shown as a main node." : "",
    };
  });
}

function layerTimelineRows(metadataRows) {
  const groups = new Map();
  for (const term of termRows) {
    const meta = metadataRows.find((row) => row.term_or_phrase === term.term_or_phrase);
    const key = `${term.primary_layer}|${term.layer_name}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push({ ...term, ngram_status: meta?.status ?? "missing", peak_year: meta?.peak_year ?? "" });
  }
  return Array.from(groups.entries()).map(([key, terms]) => {
    const [layer_number, layer_name] = key.split("|");
    const coreTerms = terms.filter((term) => ["core", "bridge"].includes(term.chart_priority)).map((term) => term.term_or_phrase);
    const ngramTerms = terms.filter((term) => term.ngram_status === "collected").map((term) => term.term_or_phrase);
    return {
      layer_number,
      layer_name,
      conceptual_role:
        layer_name === "external_artificial_things"
          ? "outside body / apparatus background"
          : layer_name === "body_support"
            ? "maintain bodily life processes"
            : layer_name === "body_replacement"
              ? "replace damaged or missing function"
              : layer_name === "reproduction_continuation"
                ? "intervene in reproduction and gestational continuity"
                : "model or externalize human process, cognition, voice, and presence",
      core_terms: coreTerms.join("; "),
      visible_ngram_terms: ngramTerms.join("; "),
      evidence_count: sourceEvidence.filter((item) => Number(item.primary_layer) === Number(layer_number)).length,
      confidence: layer_name === "external_artificial_things" ? "background" : "medium_to_high",
      notes: layer_name === "human_process_cognition_presence" ? "Use speculative controls so AI-adjacent nodes do not dominate." : "",
    };
  });
}

function dataAvailabilityRows(metadataRows) {
  const groups = new Map();
  for (const row of metadataRows) {
    const key = `${row.primary_layer}|${row.layer_name}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row);
  }
  return Array.from(groups.entries()).map(([key, rows]) => {
    const [primary_layer, layer_name] = key.split("|");
    const collected = rows.filter((row) => row.status === "collected");
    const missing = rows.filter((row) => row.status === "missing");
    const tooSparse = rows.filter((row) => row.status === "too_sparse");
    const strongest = [...collected]
      .sort((a, b) => Number(b.peak_value) - Number(a.peak_value))
      .slice(0, 5)
      .map((row) => row.term_or_phrase);
    return {
      primary_layer,
      layer_name,
      total_terms: rows.length,
      collected: collected.length,
      missing: missing.length,
      too_sparse: tooSparse.length,
      strongest_terms_by_ngram_peak: strongest.join("; "),
      missing_terms: missing.map((row) => row.term_or_phrase).join("; "),
      notes:
        layer_name === "external_artificial_things"
          ? "Layer 1 should remain background unless source anchors are strengthened."
          : layer_name === "human_process_cognition_presence"
            ? "Layer 5 has broad signal; speculative controls should prevent AI over-dominance."
            : "Ngram visibility is baseline only; source evidence controls interpretation.",
    };
  });
}

function functionModeSummaryRows(metadataRows) {
  const groups = new Map();
  for (const term of termRows) {
    const meta = metadataRows.find((row) => row.term_or_phrase === term.term_or_phrase);
    const key = term.function_mode;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push({ ...term, ngram_status: meta?.status ?? "missing" });
  }
  return Array.from(groups.entries()).map(([function_mode, rows]) => {
    const sourceCount = sourceEvidence.filter((item) => item.function_mode === function_mode).length;
    return {
      function_mode,
      total_terms: rows.length,
      collected_ngram_terms: rows.filter((row) => row.ngram_status === "collected").length,
      source_evidence_count: sourceCount,
      core_terms: rows
        .filter((row) => ["core", "bridge"].includes(row.chart_priority))
        .map((row) => row.term_or_phrase)
        .join("; "),
      visual_use:
        function_mode === "support"
          ? "lower body-support layer; sustain/keep-alive logic"
          : function_mode === "replacement"
            ? "body-replacement layer; restore/substitute function"
            : function_mode === "continuation"
              ? "reproduction/continuation layer; generate or carry life"
              : function_mode === "simulation"
                ? "human process/cognition layer; model or externalize process"
                : "edge treatment only; speculative or unstable extension",
      notes: function_mode === "speculative_extension" ? "Do not make these central without a separate intelligence-page argument." : "",
    };
  });
}

function sourceCoverageRows() {
  const sources = [
    ["Google Books Ngram", "frequency_source", "1800-2019", "accessed", "all Chart 05 candidate terms", "Broad visibility baseline", "No sense disambiguation; book corpus bias; does not cover 2020-2026."],
    ["NCBI MeSH", "medical_dictionary", "modern controlled vocabulary with historical entry metadata", "accessed", "respiration, artificial; nutritional support; life support care; artificial limbs; artificial heart; renal dialysis; IVF; artificial insemination", "Strong body-support/replacement/reproduction boundaries", "Controlled vocabulary dates are not first attestations."],
    ["NCBI Bookshelf / MedlinePlus", "medical_reference", "modern", "accessed", "enteral feeding; artificial limbs; nutritional support", "Plain-language medical support/replacement context", "Secondary/explanatory sources."],
    ["NLM Catalog", "medical_catalog", "1970s field consolidation", "accessed", "Artificial Organs journals", "Evidence of medical field visibility", "Publication titles are field anchors, not definitions."],
    ["Britannica", "encyclopedia", "historical and modern summaries", "accessed", "AI; neural network; artificial life; Esperanto/artificial language", "Good high-level definitions and historical anchors", "Encyclopedic, not corpus evidence."],
    ["Merriam-Webster", "dictionary", "modern dictionary", "accessed", "artificial; artificial language; AGI", "Boundary definitions and medical artificial examples", "Dictionary examples are illustrative, not frequency evidence."],
    ["FCC", "regulatory_source", "2024", "accessed", "artificial voice / AI voice", "Strong modern policy-sensitive voice evidence", "Regulatory framing is not general language frequency."],
    ["PubMed reviews/articles", "academic_article", "2008-2026", "accessed", "artificial womb; artificial companions; artificial consciousness", "Modern and speculative edge control", "Some abstracts only; source interpretation cautious."],
  ];
  return sources.map(([source_name, source_type, period_covered, access_status, terms_checked, usefulness, limitations]) => ({
    source_name,
    source_type,
    period_covered,
    access_status,
    terms_checked,
    usefulness,
    limitations,
    notes: "",
  }));
}

function manualReviewRows(metadataRows) {
  return [
    ["1", "artificial life sense split", "Must distinguish biological/life-making language from computational ALife.", "dictionary + snippet + corpus_context", "partially_checked", "blocks_visual_planning", "Use as bridge node unless stronger biological evidence appears."],
    ["1", "Layer 1 apparatus evidence", "External artificial things layer may look abstract without anchors.", "Google Books snippets + public-domain medical texts", "ngram_only", "blocks_visual_planning", "Keep background if not strengthened."],
    ["1", "artificial life support phrase", "Life Support Care is strong, but exact phrase artificial life support needs contextual source.", "medical texts + snippets", "partial", "blocks_claim", "Do not overclaim exact phrase without snippets."],
    ["2", "artificial fertilization vs IVF", "Need historical phrase relationship and British spelling variant review.", "PubMed history + Google Books snippets", "partial", "blocks_visual_planning", "Ngram may be weak."],
    ["2", "artificial womb visual status", "Preclinical/speculative status must be clear.", "PubMed review + bioethics sources", "checked", "minor_risk", "Use dotted/edge treatment if displayed."],
    ["2", "artificial voice source inheritance", "Chart 4B sources can be reused but need Chart 05 framing.", "FCC + AI voice literature", "checked", "minor_risk", "Voice is human process/presence, not semantic distance here."],
    ["1", "AI over-dominance risk", "Layer 5 may have stronger modern signal than body layers.", "visual mapping review", "known_risk", "blocks_visual_planning", "Use layer geometry to keep body-side anchors visually strong."],
    ["2", "artificial consciousness", "Term is speculative/philosophical.", "philosophy + AI literature", "checked", "minor_risk", "Likely hover-only/notes-only."],
  ].map(([priority, item, why_review, source_type_needed, current_status, blocking_level, notes]) => ({
    priority,
    item,
    why_review,
    source_type_needed,
    current_status,
    blocking_level,
    notes,
  }));
}

async function writeNotes(metadataRows, errors) {
  const strongestByPeak = metadataRows
    .filter((row) => row.status === "collected")
    .sort((a, b) => Number(b.peak_value) - Number(a.peak_value))
    .slice(0, 12)
    .map((row) => `- ${row.term_or_phrase}: peak ${Number(row.peak_value).toExponential(3)} in ${row.peak_year}`)
    .join("\n");

  await fs.writeFile(
    path.join(ROOT, "notes/chart_05_collection_log.md"),
    `# Chart 05 Collection Log

Date/time: ${CREATED_AT}

Current word: artificial

Task: first Chart 05 data collection for layered human continuation.

Source settings:
- Google Books Ngram: corpus ${ngramSettings.corpus}, ${ngramSettings.yearStart}-${ngramSettings.yearEnd}, smoothing ${ngramSettings.smoothing}, case-insensitive.
- Non-Ngram source width: NCBI MeSH, NCBI Bookshelf, MedlinePlus, NLM Catalog, Britannica, Merriam-Webster, FCC, PubMed/Springer/Nature records.

Terms attempted: ${termRows.length}

Assumptions:
- Chart 05 is not an AI chart. AI is a top-layer node inside a longer body-to-process ascent.
- Ngram first nonzero years are not attestations.
- Medical controlled-vocabulary introduction dates are not first uses.
- Artificial life is treated as a bridge/sense-split term, not simply reproduction.
- Speculative AI-adjacent terms are marked before visual planning.

Ngram errors:
${errors.length ? errors.map((error) => `- ${error.batch}: ${error.error}`).join("\n") : "- None recorded."}

Strongest Ngram signals by peak value:
${strongestByPeak || "- No collected Ngram terms."}
`,
    "utf8",
  );

  await fs.writeFile(
    path.join(ROOT, "notes/chart_05_layer_findings.md"),
    `# Chart 05 Layer Findings

## Overview

The first pass supports a layered reading in which artificial enters the human boundary through support and replacement before it becomes a cognition/presence term.

## Layer 1 — External Artificial Things

This layer is useful as a quiet background, but it is not yet a strong evidence layer. Terms such as artificial aid, artificial apparatus, artificial device, artificial support, mechanical aid, and life-saving apparatus should mostly remain background unless snippet evidence is strengthened.

## Layer 2 — Body Support

Strongest anchors: artificial respiration, mechanical ventilation, artificial feeding, nutritional support, life support. NCBI MeSH gives strong support-mode definitions for artificial respiration and nutritional support. Life Support Care provides the sustain/prolong-life frame.

## Layer 3 — Body Replacement

Strongest anchors: artificial limb, prosthesis, artificial heart, artificial kidney, artificial organ/organs. MeSH and MedlinePlus strongly distinguish replacement/restoration from support.

## Layer 4 — Reproduction / Continuation

Strongest anchors: artificial insemination, in vitro fertilization, artificial womb. Artificial fertilization/fertilisation need more historical review. Artificial womb is current and important but must be marked preclinical/speculative.

## Layer 5 — Human Process / Cognition / Presence

Strongest anchors: artificial language, artificial life, artificial intelligence, artificial neural network, artificial voice. The layer must not become AI-only. Artificial language and artificial life provide non-AI process anchors; artificial voice provides modern presence/policy evidence.
`,
    "utf8",
  );

  await fs.writeFile(
    path.join(ROOT, "notes/chart_05_remaining_risks.md"),
    `# Chart 05 Remaining Risks

- Layer 1 is conceptually useful but still evidence-light.
- Artificial life has a major sense split: biological life, computational life, philosophical life, unclear.
- Artificial womb evidence is strong as modern/preclinical discussion but risky as a solid continuation node unless its speculative status is visible.
- Ngram is frequency evidence only; it cannot prove the semantic movement from support to replacement to cognition.
- AI-adjacent terms have a modern visibility advantage and must be visually downgraded when speculative.
- Exact phrase artificial life support still needs direct phrase snippets beyond Life Support Care.
- Artificial fertilization/fertilisation requires additional historical source review.
- Artificial companion, artificial consciousness, AGI, and AI agent should not become core nodes without a separate intelligence-page argument.
`,
    "utf8",
  );

  await fs.writeFile(
    path.join(ROOT, "notes/chart_05_ai_boundary_notes.md"),
    `# Chart 05 AI Boundary Notes

## Why Chart 05 is not an AI chart

Chart 05 is about artificial entering the human boundary. The historical sequence should remain: external support apparatus, body support, body replacement, reproduction/continuation, and only then human process/cognition/presence.

AI appears because it is one later form of artificial externalizing human cognitive process. It should not be the center of the chart.

## How to downgrade AI visually

- Keep body support and replacement layers structurally large and stable.
- Treat artificial intelligence as one top-layer anchor, not the title or gravitational center.
- Use artificial language and artificial life as process bridges so the top layer is not only AI.
- Mark artificial consciousness, artificial companion, artificial general intelligence, and AI agent as edge/speculative/notes-only unless later data justifies stronger treatment.

## Terms that can appear

- Solid: artificial language, artificial intelligence, artificial neural network, artificial life, artificial voice.
- Dotted or edge: artificial companion, AI companion, artificial consciousness.
- Notes-only by default: artificial general intelligence, artificial agent, AI agent, artificial creativity.

## Connection to a future intelligence page

If a future page focuses on intelligence, AGI, agents, consciousness, and companion systems can be expanded there. Chart 05 should only show that artificial reaches cognition/presence after a longer medical and biological human-continuation history.
`,
    "utf8",
  );
}

async function main() {
  await ensureDirs();

  const { rawRows, longRows, metadataRows, errors } = await collectNgrams();

  await writeCsv("raw/chart_05_ngram_raw_core_terms.csv", rawRows, [
    "year",
    "term",
    "value",
    "source",
    "corpus",
    "smoothing",
    "case_sensitive",
    "primary_layer",
    "layer_name",
    "function_mode",
  ]);

  await writeCsv("raw/chart_05_source_evidence_raw.csv", sourceEvidence, [
    "id",
    "term_or_phrase",
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
    "chart05_relevance",
    "current_relevance",
    "speculative_status",
    "notes",
  ]);

  const accessRows = sourceCoverageRows();
  await writeCsv("raw/chart_05_source_access_log.csv", accessRows, [
    "source_name",
    "source_type",
    "period_covered",
    "access_status",
    "terms_checked",
    "usefulness",
    "limitations",
    "notes",
  ]);

  await writeCsv("processed/chart_05_layered_terms.csv", termRows, [
    "term_or_phrase",
    "primary_layer",
    "layer_name",
    "layer_role",
    "function_mode",
    "sense_track",
    "chart_priority",
    "current_relevance",
    "speculative_status",
  ]);

  await writeCsv("processed/chart_05_ngram_long.csv", longRows, [
    "year",
    "term",
    "value",
    "source",
    "corpus",
    "smoothing",
    "case_sensitive",
    "primary_layer",
    "layer_name",
    "function_mode",
  ]);

  await writeCsv("processed/chart_05_term_metadata.csv", metadataRows, [
    "term_or_phrase",
    "primary_layer",
    "layer_name",
    "function_mode",
    "sense_track",
    "status",
    "first_nonzero_year",
    "last_nonzero_year",
    "peak_year",
    "peak_value",
    "recent_year",
    "recent_value",
    "nonzero_year_count",
    "notes",
  ]);

  await writeCsv("processed/chart_05_evidence_table.csv", sourceEvidence, [
    "id",
    "term_or_phrase",
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
    "chart05_relevance",
    "current_relevance",
    "speculative_status",
    "notes",
  ]);

  await writeCsv("processed/chart_05_layer_timeline.csv", layerTimelineRows(metadataRows), [
    "layer_number",
    "layer_name",
    "conceptual_role",
    "core_terms",
    "visible_ngram_terms",
    "evidence_count",
    "confidence",
    "notes",
  ]);

  await writeCsv("processed/chart_05_data_availability_summary.csv", dataAvailabilityRows(metadataRows), [
    "primary_layer",
    "layer_name",
    "total_terms",
    "collected",
    "missing",
    "too_sparse",
    "strongest_terms_by_ngram_peak",
    "missing_terms",
    "notes",
  ]);

  await writeCsv("processed/chart_05_function_mode_summary.csv", functionModeSummaryRows(metadataRows), [
    "function_mode",
    "total_terms",
    "collected_ngram_terms",
    "source_evidence_count",
    "core_terms",
    "visual_use",
    "notes",
  ]);

  await writeCsv("processed/chart_05_transition_edges.csv", transitionRows, [
    "source_layer",
    "target_layer",
    "source_term",
    "target_term",
    "relation_type",
    "relation_strength",
    "evidence_summary",
    "notes",
  ]);

  await writeCsv("processed/chart_05_transition_strength.csv", transitionRows, [
    "source_layer",
    "target_layer",
    "source_term",
    "target_term",
    "relation_type",
    "relation_strength",
    "evidence_summary",
    "notes",
  ]);

  await writeCsv("processed/chart_05_source_coverage.csv", accessRows, [
    "source_name",
    "source_type",
    "period_covered",
    "access_status",
    "terms_checked",
    "usefulness",
    "limitations",
    "notes",
  ]);

  await writeCsv("processed/chart_05_manual_review_queue.csv", manualReviewRows(metadataRows), [
    "priority",
    "item",
    "why_review",
    "source_type_needed",
    "current_status",
    "blocking_level",
    "notes",
  ]);

  await writeCsv("processed/chart_05_layer_boundary_matrix.csv", layerBoundaryRows(), [
    "term_or_phrase",
    "primary_layer",
    "secondary_layer",
    "function_mode",
    "why_this_layer",
    "boundary_risk",
    "notes",
  ]);

  await writeCsv(
    "processed/chart_05_speculative_terms.csv",
    speculativeTerms.map(([term, status, why_speculative_or_established, should_show_in_chart, visual_treatment, notes]) => ({
      term,
      status,
      why_speculative_or_established,
      should_show_in_chart,
      visual_treatment,
      notes,
    })),
    ["term", "status", "why_speculative_or_established", "should_show_in_chart", "visual_treatment", "notes"],
  );

  await writeNotes(metadataRows, errors);

  await fs.writeFile(
    path.join(ROOT, "sources/README.md"),
    `# Chart 05 Sources

Primary source families used in this round:

- Google Books Ngram for broad 1800-2019 term visibility.
- NCBI MeSH / NLM / MedlinePlus / NCBI Bookshelf for medical support, replacement, and reproduction terms.
- Britannica and Merriam-Webster for definitions and historical anchors around artificial language, artificial life, AI, neural networks, and AGI.
- FCC for 2024 artificial/AI voice regulatory context.
- PubMed/Springer/Nature records for artificial womb, artificial companions, and artificial consciousness.

All links used in structured evidence are included in processed/chart_05_evidence_table.csv.
`,
    "utf8",
  );

  console.log(
    JSON.stringify(
      {
        terms_attempted: termRows.length,
        ngram_rows: longRows.length,
        evidence_rows: sourceEvidence.length,
        transition_edges: transitionRows.length,
        ngram_errors: errors,
        output: ROOT,
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
