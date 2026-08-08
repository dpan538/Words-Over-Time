export type WordStudyPath =
  | "/words/forever"
  | "/words/privacy"
  | "/words/artificial"
  | "/words/hub"
  | "/words/depression"
  | "/words/data";

export type SearchIntentAnswer = {
  id: string;
  route: WordStudyPath;
  question: string;
  shortAnswer: string;
  evidenceBasis: readonly string[];
  evidenceIds?: readonly string[];
  caveat: string;
  anchor: string;
  relatedSection: string;
  searchIntent: string;
  lastReviewed: string;
};

export type EvidenceCoverageItem = {
  label: string;
  value: string;
  note: string;
};

export type StudyChapter = {
  label: string;
  href: `#${string}`;
};

export type WordStudyProfile = {
  route: WordStudyPath;
  word: string;
  eyebrow: string;
  heroSummary: string;
  scopeLine: string;
  primaryAnswerId: string;
  answers: readonly SearchIntentAnswer[];
  coverage: readonly EvidenceCoverageItem[];
  evidenceTypes: readonly string[];
  chapters: readonly StudyChapter[];
};

const reviewed = "2026-08-08";

export const wordStudyProfiles: Record<WordStudyPath, WordStudyProfile> = {
  "/words/forever": {
    route: "/words/forever",
    word: "forever",
    eyebrow: "Words Over Time / word study",
    heroSummary: "A source-led study of written form, duration, devotion, memory, archives, and questions of platform persistence.",
    scopeLine: "Spelling variation / printed frequency / archival contexts / modern capture",
    primaryAnswerId: "spelling-answer",
    coverage: [
      { label: "Ngram", value: "1500–2022", note: "yearly printed-book frequency; 1700+ is the recommended public emphasis" },
      { label: "Archive", value: "1726–1930", note: "selected Project Gutenberg contexts" },
      { label: "Modern", value: "2024–2026", note: "Wikinews search-result revision years; a separate, non-comparable snapshot" },
    ],
    evidenceTypes: ["lexical leads", "Ngram series", "public-domain snippets", "collocates", "modern context"],
    chapters: [
      { label: "Spelling", href: "#spelling" },
      { label: "Origin boundary", href: "#origin" },
      { label: "Meaning over time", href: "#meaning-over-time" },
      { label: "Evidence archive", href: "#evidence-archive" },
    ],
    answers: [
      {
        id: "spelling-answer",
        route: "/words/forever",
        question: "How does this study spell forever?",
        shortAnswer:
          "The study uses forever as its present headword, while preserving for ever as a separately measured historical form. The two forms are compared, not silently merged.",
        evidenceBasis: ["forever and for ever Ngram series", "curated form policy", "prehistory lexical leads"],
        evidenceIds: ["frequency-forever", "frequency-for-ever", "attestation-for-ever-late-14c-etymonline", "attestation-forever-one-word-late-17c"],
        caveat: "Printed frequency does not prescribe spelling and does not establish first use.",
        anchor: "spelling",
        relatedSection: "spelling",
        searchIntent: "spelling / one word versus two words",
        lastReviewed: reviewed,
      },
      {
        id: "origin-answer",
        route: "/words/forever",
        question: "What can the evidence say about forever’s origin?",
        shortAnswer:
          "The lexical lead layer records a late-fourteenth-century spaced form and a later one-word form, but the project does not have a comparable pre-1700 corpus that can verify an exact first use.",
        evidenceBasis: ["prehistory records", "investigated lexical sources", "coverage report"],
        evidenceIds: ["attestation-for-ever-late-14c-etymonline", "attestation-for-ever-late-14c-wiktionary", "attestation-forever-one-word-late-17c"],
        caveat: "These dates are medium-confidence secondary lexical leads, not project-verified earliest quotations.",
        anchor: "origin",
        relatedSection: "evidence-archive",
        searchIntent: "origin / etymology",
        lastReviewed: reviewed,
      },
      {
        id: "forever-meaning-answer",
        route: "/words/forever",
        question: "What does forever mean in this study?",
        shortAnswer:
          "Across the selected corpus evidence, forever carries claims of duration and permanence through devotional, affective, memorial, and archival contexts. Institutional and platform persistence remain interpretive prompts on this page, not established corpus findings.",
        evidenceBasis: ["semantic categories", "phrases and collocates", "archival snippets", "modern context layer"],
        caveat: "The historical corpus and the 2024–2026 snapshot are not directly comparable, and semantic groups are interpretive.",
        anchor: "meaning-over-time",
        relatedSection: "meaning-over-time",
        searchIntent: "meaning / semantic change / digital permanence",
        lastReviewed: reviewed,
      },
    ],
  },
  "/words/privacy": {
    route: "/words/privacy",
    word: "privacy",
    eyebrow: "Words Over Time / lexical study",
    heroSummary: "A source-led study of private life, secrecy, legal injury, data protection, surveillance, and governance interfaces.",
    scopeLine: "Root-family evidence / legal transition / data systems / governance",
    primaryAnswerId: "privacy-etymology-answer",
    coverage: [
      { label: "Early field", value: "1200–1890", note: "root-family and pre-rights semantic evidence" },
      { label: "Legal/data", value: "1890–2026", note: "curated legal, policy, technical, and public-source records" },
      { label: "Confidence", value: "27 medium / 5 low", note: "the early-usage layer contains no high-confidence record" },
    ],
    evidenceTypes: ["root-family records", "legal sources", "policy records", "geographic aggregates", "governance evidence"],
    chapters: [
      { label: "Etymology boundary", href: "#etymology" },
      { label: "Legal and data", href: "#legal-and-data-meaning" },
      { label: "World signal", href: "#chart-2-world-signal" },
      { label: "Governance", href: "#chart-3-governance-interface" },
    ],
    answers: [
      {
        id: "privacy-etymology-answer",
        route: "/words/privacy",
        question: "What can this study say about privacy’s etymology?",
        shortAnswer:
          "The collected layer places privacy inside an older family that includes private and privy and an adjacent field of secrecy. It does not treat every older related form as a direct attestation of the modern noun.",
        evidenceBasis: ["privacy etymology and early-usage processed layer", "root-family classification"],
        evidenceIds: ["privacy", "private", "privy", "secrecy"],
        caveat: "The layer has 27 medium- and 5 low-confidence records, with no high-confidence earliest-use record.",
        anchor: "etymology",
        relatedSection: "chart-1-semantic-weather",
        searchIntent: "etymology / origin",
        lastReviewed: reviewed,
      },
      {
        id: "privacy-legal-answer",
        route: "/words/privacy",
        question: "How does privacy become legal and data-system language?",
        shortAnswer:
          "The project’s post-1890 evidence follows privacy into claims about publicity, likeness, intrusion and injury; after 1950, its curated routes also include data protection, surveillance, consent, breach risk, identity, and sensitive data.",
        evidenceBasis: ["legal injury matrix", "modern transit system", "timeline source index"],
        caveat: "This is lexical and design research across selected jurisdictions and sources, not a universal legal definition or legal advice.",
        anchor: "legal-and-data-meaning",
        relatedSection: "legal-and-data-meaning",
        searchIntent: "legal meaning / data protection",
        lastReviewed: reviewed,
      },
      {
        id: "privacy-surveillance-answer",
        route: "/words/privacy",
        question: "How does the page connect privacy and surveillance?",
        shortAnswer:
          "Surveillance appears as one pressure among legal, regulatory, platform, consent, identity, and technical records in the modern governance layer; the visual relation is an authored synthesis of recovered sources.",
        evidenceBasis: ["research expansion layer", "modern transit system", "governance interface"],
        caveat: "Association and visual proximity do not prove that surveillance caused a lexical shift.",
        anchor: "privacy-and-surveillance",
        relatedSection: "chart-3-governance-interface",
        searchIntent: "privacy and surveillance history",
        lastReviewed: reviewed,
      },
    ],
  },
  "/words/artificial": {
    route: "/words/artificial",
    word: "artificial",
    eyebrow: "Words Over Time / word study",
    heroSummary: "A source-led study of art, skill, making, not-natural senses, imitation, synthetic matter, and machine-era boundaries.",
    scopeLine: "Artifice / making / sense boundaries / reproduction / human boundary",
    primaryAnswerId: "artificial-original-answer",
    coverage: [
      { label: "Early layer", value: "pre-1828", note: "art, skill, making, technical, and not-natural evidence" },
      { label: "Checkpoint", value: "1828", note: "Webster is used as a checkpoint, not the origin" },
      { label: "Modern", value: "to 2026", note: "selected synthetic, reproduction, body, and cognition records" },
    ],
    evidenceTypes: ["etymology leads", "historical dictionary", "book and press evidence", "Ngram series", "technical sources"],
    chapters: [
      { label: "Original meaning", href: "#original-meaning" },
      { label: "Created by artificial means", href: "#created-by-artificial-means" },
      { label: "Reproduction", href: "#chart-3-mechanical-reproduction" },
      { label: "Human boundary", href: "#chart-5-artificial-human-boundary" },
    ],
    answers: [
      {
        id: "artificial-original-answer",
        route: "/words/artificial",
        question: "What is the supported early meaning of artificial?",
        shortAnswer:
          "The project has pre-1828 evidence for an art, skill, and making layer, alongside technical and not-natural senses. Its safe-claims record explicitly rejects the idea that artificial originally meant only fake.",
        evidenceBasis: ["Round 06 final safe claims", "Round 04 safe claims", "Chart 01 evidence records"],
        caveat: "The evidence does not yet support an exact earliest-sense order or a definitive first date.",
        anchor: "original-meaning",
        relatedSection: "original-meaning",
        searchIntent: "original meaning / etymology / before AI",
        lastReviewed: reviewed,
      },
      {
        id: "artificial-means-answer",
        route: "/words/artificial",
        question: "What does ‘created by artificial means’ name here?",
        shortAnswer:
          "In this page’s semantic model, ‘created by artificial means’ is read through made-by-art, technical-construction, and not-natural layers. Those layers are kept distinct from fake-adjacent, synthetic, and suspicion readings, which can coexist across periods.",
        evidenceBasis: ["Chart 01 semantic chamber", "safe-claims boundary", "technical construction records"],
        caveat: "The phrase can change with its object and period, so this is a research-scoped relation rather than an exhaustive definition.",
        anchor: "created-by-artificial-means",
        relatedSection: "chart-2-under-pressure",
        searchIntent: "created by artificial means / meaning",
        lastReviewed: reviewed,
      },
      {
        id: "artificial-ai-answer",
        route: "/words/artificial",
        question: "How does artificial reach the AI era?",
        shortAnswer:
          "The visual sequence follows a move from made objects and technical rules into reproducible experience, synthetic and suspicion fields, then selected body, voice, life-process, and cognition terms.",
        evidenceBasis: ["mechanical reproduction suite", "suspicion-distance records", "human continuation boundary matrix"],
        caveat: "Artificial intelligence is a later extension in this study, not the origin or center of every earlier sense.",
        anchor: "artificial-before-ai",
        relatedSection: "chart-5-artificial-human-boundary",
        searchIntent: "artificial intelligence word history",
        lastReviewed: reviewed,
      },
    ],
  },
  "/words/hub": {
    route: "/words/hub",
    word: "hub",
    eyebrow: "Words Over Time / word study",
    heroSummary: "A source-led study of hub from the physical wheel center to transport, institutional, network, and platform uses.",
    scopeLine: "Wheel center / routing / compounds / dependency / modern extension",
    primaryAnswerId: "hub-origin-answer",
    coverage: [
      { label: "Frequency", value: "1800–2022", note: "selected Ngram queries and grouped visibility" },
      { label: "Earliest sense", value: "wheel center", note: "supported across public etymology sources" },
      { label: "Origin status", value: "uncertain", note: "ultimate derivation is not treated as settled" },
    ],
    evidenceTypes: ["etymology sources", "direct-text evidence", "Ngram query groups", "routing terms", "compound patterns"],
    chapters: [
      { label: "Origin boundary", href: "#origin" },
      { label: "Wheel to network", href: "#wheel-to-network" },
      { label: "Naming machine", href: "#hub-naming-machine" },
      { label: "Dependency", href: "#hub-dependency" },
    ],
    answers: [
      {
        id: "hub-origin-answer",
        route: "/words/hub",
        question: "What does the evidence say about hub’s origin?",
        shortAnswer:
          "Public etymology sources agree on the early mechanical sense: the solid center of a wheel that receives the spokes. They do not settle the word’s ultimate derivation.",
        evidenceBasis: ["hub etymology and attestation report", "public etymology source comparison", "direct-text mechanical evidence"],
        caveat: "Connections to hob or hubbe are possible theories, not a settled origin claim.",
        anchor: "origin",
        relatedSection: "wheel-to-network",
        searchIntent: "hub etymology / word origin",
        lastReviewed: reviewed,
      },
      {
        id: "hub-transfer-answer",
        route: "/words/hub",
        question: "How does hub move from wheel center to network?",
        shortAnswer:
          "The evidence supports a physical wheel-and-spoke model followed by selected central-place, transport, routing, network, and institutional extensions; the page visualizes transfer rather than one automatic linear replacement.",
        evidenceBasis: ["semantic frequency field", "transfer model", "routing-by-period records"],
        caveat: "Digital and platform terms are treated as later visible extensions, not securely dated origins or proof of dominance.",
        anchor: "wheel-to-network",
        relatedSection: "wheel-to-network",
        searchIntent: "wheel centre / transport node / network metaphor",
        lastReviewed: reviewed,
      },
      {
        id: "hub-format-answer",
        route: "/words/hub",
        question: "Why does hub work as a modern naming format?",
        shortAnswer:
          "In the curated compound evidence, attached words specify institutions, platforms, knowledge resources, communities, and technical systems while hub keeps a reusable central-access relation.",
        evidenceBasis: ["naming patterns", "modifier dominance terms", "semantic dependency index"],
        caveat: "The dependency score describes the selected compound sample; it is not a popularity or universal meaning score.",
        anchor: "hub-as-format",
        relatedSection: "hub-naming-machine",
        searchIntent: "hub meaning over time / digital platform hub",
        lastReviewed: reviewed,
      },
    ],
  },
  "/words/depression": {
    route: "/words/depression",
    word: "depression",
    eyebrow: "Words Over Time / semantic study",
    heroSummary: "A lexical and visual study of one written form branching through physical lowering, weather, economy, mood, diagnosis, and public discourse.",
    scopeLine: "Attestation / printed frequency / domain branches / modern public language",
    primaryAnswerId: "depression-branching-answer",
    coverage: [
      { label: "Ngram", value: "1500–2022", note: "yearly printed-book series; pre-1700 values require caution" },
      { label: "Lexical leads", value: "c.1400–1930", note: "target-word leads; related melancholy evidence begins c.1300" },
      { label: "Modern", value: "to 2026", note: "clinical, economic, public-health, and discourse layers" },
    ],
    evidenceTypes: ["lexical records", "Ngram series", "archival context", "clinical sources", "economic sources"],
    chapters: [
      { label: "Meaning over time", href: "#meaning-over-time" },
      { label: "Physical and weather", href: "#physical-and-weather" },
      { label: "Economic", href: "#economic-meaning" },
      { label: "Clinical", href: "#clinical-meaning" },
    ],
    answers: [
      {
        id: "depression-branching-answer",
        route: "/words/depression",
        question: "How does depression change meaning in this study?",
        shortAnswer:
          "The evidence is organized as branches rather than one replacement sequence: physical lowering, geographic and weather lows, emotional and melancholy uses, economic crisis, clinical naming, and modern public discourse.",
        evidenceBasis: ["branch dataset", "prehistory records", "normalized evidence", "frequency series"],
        caveat: "Branch tags are editorial, and corpus visibility is neither importance nor first attestation.",
        anchor: "meaning-over-time",
        relatedSection: "depression-historical-plate",
        searchIntent: "semantic branching / meaning over time",
        lastReviewed: reviewed,
      },
      {
        id: "depression-physical-answer",
        route: "/words/depression",
        question: "What connects physical and weather depression?",
        shortAnswer:
          "The page keeps a lowering relation visible across literal pressing or downward uses, geographic hollows, and meteorological or barometric lows, while treating them as distinct domain branches rather than one definition.",
        evidenceBasis: ["physical branch", "geographic branch", "meteorological branch", "lexical lead records"],
        caveat: "Secondary lexical dates are evidence leads, not definitive first-use proof.",
        anchor: "physical-and-weather",
        relatedSection: "depression-historical-plate",
        searchIntent: "physical loweredness / weather meaning",
        lastReviewed: reviewed,
      },
      {
        id: "depression-domain-answer",
        route: "/words/depression",
        question: "How are the economic and clinical branches separated?",
        shortAnswer:
          "The study tracks economic phrases and crisis records separately from mood, diagnosis, clinical vocabulary, care, and public-health evidence, then shows where public discourse makes the branches adjacent.",
        evidenceBasis: ["economic context layer", "clinical vocabulary", "prehistory records", "modern context"],
        caveat: "This is word-history research, not a clinical definition, diagnosis, medical advice, or economic forecast.",
        anchor: "economic-meaning",
        relatedSection: "clinical-meaning",
        searchIntent: "economic meaning / clinical meaning",
        lastReviewed: reviewed,
      },
    ],
  },
  "/words/data": {
    route: "/words/data",
    word: "data",
    eyebrow: "Words Over Time / word study",
    heroSummary: "A source-led study of data from given facts and counted observations to infrastructure, governance, social traces, and AI-era material.",
    scopeLine: "Datum / grammar / collection / infrastructure / governance / AI",
    primaryAnswerId: "data-datum-answer",
    coverage: [
      { label: "Index", value: "1630–2026", note: "curated historical and contemporary evidence" },
      { label: "Frequency", value: "to 2022", note: "printed-language visibility from selected Ngram series" },
      { label: "Grammar", value: "datum ↔ data", note: "singular, plural, and mass-noun usage are kept visible" },
    ],
    evidenceTypes: ["Ngram series", "lexical evidence", "grammar records", "contemporary sources", "governance records"],
    chapters: [
      { label: "Datum and data", href: "#datum-and-data" },
      { label: "Meaning over time", href: "#data-meaning-over-time" },
      { label: "Social traces", href: "#data-social-traces" },
      { label: "Governance and AI", href: "#data-governance-ai" },
    ],
    answers: [
      {
        id: "data-datum-answer",
        route: "/words/data",
        question: "How does this study relate datum and data?",
        shortAnswer:
          "The grammar route keeps datum visible as a singular item and data as a historically plural form, then follows evidence for data used with both plural and singular or mass-noun grammar.",
        evidenceBasis: ["datum route dataset", "grammar usage records", "historical index"],
        caveat: "The chart describes genre-sensitive printed-book usage signals; it does not issue a universal prescriptive rule.",
        anchor: "datum-and-data",
        relatedSection: "datum-and-data",
        searchIntent: "datum / singular and plural",
        lastReviewed: reviewed,
      },
      {
        id: "data-meaning-answer",
        route: "/words/data",
        question: "What historical movement does the page trace?",
        shortAnswer:
          "The index follows data from given facts, premises, and counted observations into collected records, databases, personal information, platform traces, and institutional infrastructure.",
        evidenceBasis: ["historical index", "terms and phases", "contemporary evidence"],
        caveat: "The index shows selected historical relations and printed visibility, not strict causality or all uses of data.",
        anchor: "data-meaning-over-time",
        relatedSection: "data-meaning-over-time",
        searchIntent: "etymology / meaning over time",
        lastReviewed: reviewed,
      },
      {
        id: "data-ai-answer",
        route: "/words/data",
        question: "How does data become governance and AI-era material?",
        shortAnswer:
          "The later evidence maps data as social trace, personal attachment, controlled institutional object, scientific resource, ethical responsibility, and training material under simultaneous pressures.",
        evidenceBasis: ["socialized generation dataset", "cross-pressures dataset", "contemporary evidence"],
        caveat: "The pressure field is an interpretive synthesis; proximity does not establish equivalence, priority, or causation.",
        anchor: "data-governance-ai",
        relatedSection: "data-governance-ai",
        searchIntent: "governance / AI-era meaning",
        lastReviewed: reviewed,
      },
    ],
  },
};

export function wordStudyProfile(path: WordStudyPath) {
  return wordStudyProfiles[path];
}
