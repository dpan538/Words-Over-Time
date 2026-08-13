import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { basename, resolve } from "node:path";
import type {
  PrivacyFigureContract,
  PrivacyFinding,
  PrivacyMobileAnalysis,
  PrivacySourceManifestEntry,
} from "../src/types/privacyMobileAnalysis.ts";

const ROOT = resolve(import.meta.dirname, "..");
const ATTENTION_RAW = "docs/research/privacy/raw/privacy_attention_metrics_raw.json";
const EXPANSION_RAW = "docs/research/privacy/raw/privacy_research_expansion_raw.json";
const ANCHOR_RAW = "docs/research/privacy/raw/privacy_modern_transit_system_raw.json";
const OUTPUT = "docs/research/privacy/mobile-2026-08/privacy_mobile_analysis.json";
const BACKUP = "docs/research/privacy/mobile-2026-08/privacy_mobile_cleaned_backup.json";
const GENERATED = "src/data/generated/privacy_mobile_analysis.json";
const SCRIPT = "scripts/build_privacy_mobile_analysis.ts";
const ANALYSIS_START = 2018;
const ANALYSIS_END = 2025;
const MIN_POLICY_TOKENS = 1_000;

type JsonObject = Record<string, unknown>;
type RawAttentionRow = {
  label: string;
  page: string;
  series: Array<{ date: string; views: number }>;
  source_log: { records: number; status: string; url: string };
};
type RawPolicyRow = { doc_id: string; label: string; url: string };
type RawAnchor = {
  station_id: string;
  year: number;
  label: string;
  route_ids: string[];
  confidence: string;
  manual_review: boolean;
  source_title: string;
  source_url: string;
};
type RawAnchorAttempt = { station_id: string; reachable: boolean; status: number };

function invariant(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function text(path: string): string {
  return readFileSync(resolve(ROOT, path), "utf8");
}

function json<T>(path: string): T {
  return JSON.parse(text(path)) as T;
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function rounded(value: number, digits = 2): number {
  return Number(value.toFixed(digits));
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function tokenizeHtml(value: string): string[] {
  const stripped = value
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ");
  return decodeHtmlEntities(stripped)
    .normalize("NFKC")
    .toLowerCase()
    .match(/[\p{L}\p{N}]+(?:[’'][\p{L}\p{N}]+)*/gu) ?? [];
}

function countPhrase(tokens: string[], phrase: string): number {
  const query = tokenizeHtml(phrase);
  let count = 0;
  outer: for (let index = 0; index <= tokens.length - query.length; index += 1) {
    for (let offset = 0; offset < query.length; offset += 1) {
      if (tokens[index + offset] !== query[offset]) continue outer;
    }
    count += 1;
  }
  return count;
}

function cachePathForPolicy(docId: string): string {
  const prefix = `policy_${docId}_`;
  const directory = resolve(ROOT, "docs/research/privacy/raw/research_expansion_cache");
  const candidates = readdirSync(directory).filter((name) => name.startsWith(prefix) && name.endsWith(".json"));
  invariant(candidates.length === 1, `Expected exactly one frozen cache for ${docId}, found ${candidates.length}`);
  return `docs/research/privacy/raw/research_expansion_cache/${candidates[0]}`;
}

function buildSourceManifest(policyPaths: string[]): PrivacySourceManifestEntry[] {
  const definitions: Array<Omit<PrivacySourceManifestEntry, "sha256">> = [
    {
      id: "privacy-wikimedia-attention-raw",
      path: ATTENTION_RAW,
      role: "active_input",
      sourceFamily: "Wikimedia Pageviews API",
      recordGranularity: "topic × calendar year",
      recordCount: 11,
      coverage: "topic-dependent capture; analysis freezes ten pages with complete years 2018–2025",
      rightsBoundary: "Wikimedia API-derived aggregate counts; attribute Wikimedia and linked article identities.",
      activeContractIds: ["privacy-figure-01-attention-field", "privacy-figure-02-topic-widgets"],
      exclusionReason: null,
    },
    {
      id: "privacy-research-expansion-raw",
      path: EXPANSION_RAW,
      role: "supporting_input",
      sourceFamily: "multi-source research expansion",
      recordGranularity: "source-specific record",
      recordCount: 1139,
      coverage: "historical metadata, policy captures, news, court, archive, publications, academic metadata",
      rightsBoundary: "Discovery metadata and captured public pages retain upstream rights; no full third-party text is republished.",
      activeContractIds: ["privacy-figure-03-policy-language-widgets"],
      exclusionReason: null,
    },
    {
      id: "privacy-institutional-anchor-raw",
      path: ANCHOR_RAW,
      role: "active_input",
      sourceFamily: "official/legal/institutional source ledger",
      recordGranularity: "dated institutional anchor",
      recordCount: 23,
      coverage: "1950–2024",
      rightsBoundary: "Only metadata, dates, labels and source links are retained; official texts remain upstream.",
      activeContractIds: ["privacy-figure-04-governance-grid"],
      exclusionReason: null,
    },
    ...policyPaths.map((path) => ({
      id: `privacy-policy-capture-${basename(path).replace(/\.[^.]+$/, "")}`,
      path,
      role: "active_input" as const,
      sourceFamily: "frozen public policy/platform HTML",
      recordGranularity: "captured document token stream",
      recordCount: 1,
      coverage: "single captured document",
      rightsBoundary: "Counts only; captured HTML is research evidence and is not republished.",
      activeContractIds: ["privacy-figure-03-policy-language-widgets"],
      exclusionReason: null,
    })),
    {
      id: "privacy-transform",
      path: SCRIPT,
      role: "transform",
      sourceFamily: "deterministic local transform",
      recordGranularity: "script",
      recordCount: null,
      coverage: "active dependency closure for five Privacy mobile contracts",
      rightsBoundary: "Repository code.",
      activeContractIds: [
        "privacy-figure-01-attention-field",
        "privacy-figure-02-topic-widgets",
        "privacy-figure-03-policy-language-widgets",
        "privacy-figure-04-governance-grid",
        "privacy-figure-05-coverage-ledger",
      ],
      exclusionReason: null,
    },
    {
      id: "privacy-variable-ngram",
      path: "docs/research/privacy/processed/privacy_frequency_terms_processed.json",
      role: "excluded_input",
      sourceFamily: "Google Books Ngram Viewer variable aliases",
      recordGranularity: "term × corpus × year",
      recordCount: 141,
      coverage: "1500–2022",
      rightsBoundary: "Google Books Ngram Viewer terms apply.",
      activeContractIds: ["privacy-figure-05-coverage-ledger"],
      exclusionReason: "Variable corpus aliases, unstable early tails and no fixed-release raw denominator; not production-authoritative.",
    },
    {
      id: "privacy-geo-mixed-signal",
      path: "docs/research/privacy/processed/privacy_geo_attention_map_processed.json",
      role: "excluded_input",
      sourceFamily: "OpenAlex + GDELT mixed geography",
      recordGranularity: "country/city recovered-source record",
      recordCount: 139071,
      coverage: "58 countries; 90 city/institution points",
      rightsBoundary: "OpenAlex and GDELT upstream terms apply.",
      activeContractIds: ["privacy-figure-05-coverage-ledger"],
      exclusionReason: "Academic production and news geography are incomparable and must not be presented as population-normalized public privacy attention.",
    },
  ];
  return definitions.map((entry) => ({ ...entry, sha256: sha256(text(entry.path)) }));
}

function buildArtifact(): PrivacyMobileAnalysis {
  const attentionRaw = json<{ series_rows: RawAttentionRow[] }>(ATTENTION_RAW);
  const expansionRaw = json<{ platform_policy_corpus: RawPolicyRow[]; statistics?: JsonObject }>(EXPANSION_RAW);
  const anchorRaw = json<{ stations: RawAnchor[]; source_attempts: RawAnchorAttempt[] }>(ANCHOR_RAW);

  invariant(attentionRaw.series_rows.length === 11, "Expected 11 frozen Wikimedia topic series");
  const excludedCoverageTopics = attentionRaw.series_rows
    .filter((row) => !Array.from({ length: ANALYSIS_END - ANALYSIS_START + 1 }, (_, offset) => ANALYSIS_START + offset)
      .every((year) => row.series.some((value) => Number(value.date) === year)))
    .map((row) => ({
      page: row.page,
      state: "unavailable" as const,
      reason: `The frozen capture does not contain every complete year from ${ANALYSIS_START} through ${ANALYSIS_END}.`,
    }));
  invariant(excludedCoverageTopics.length === 1 && excludedCoverageTopics[0].page === "General_data_protection_regulation", "Unexpected attention coverage exclusions");
  const categories: Record<string, "concept" | "governance" | "pressure"> = {
    Privacy: "concept",
    Internet_privacy: "concept",
    Information_privacy: "concept",
    Data_privacy: "concept",
    Right_to_privacy: "concept",
    Digital_rights: "concept",
    Privacy_policy: "governance",
    General_data_protection_regulation: "governance",
    California_Consumer_Privacy_Act: "governance",
    Surveillance: "pressure",
    Data_breach: "pressure",
  };
  const topicRows = attentionRaw.series_rows.filter((row) => !excludedCoverageTopics.some((excluded) => excluded.page === row.page)).map((row) => {
    const category = categories[row.page];
    invariant(category, `Unregistered attention topic: ${row.page}`);
    invariant(row.source_log.status === "ok" && row.source_log.records >= 91, `${row.page} capture is incomplete`);
    const rawYearly = row.series
      .filter((value) => Number(value.date) >= ANALYSIS_START && Number(value.date) <= ANALYSIS_END)
      .map((value) => ({
        year: Number(value.date),
        views: value.views,
      }));
    invariant(rawYearly.length === 8, `${row.page} does not contain eight complete analysis years`);
    const peak = rawYearly.reduce((best, value) => (value.views > best.views ? value : best), rawYearly[0]);
    const yearly = rawYearly.map((value) => ({
      ...value,
      percentOfTopicPeak: rounded((value.views / peak.views) * 100),
      state: (value.views === 0 ? "observed_zero" : "observed_positive") as "observed_zero" | "observed_positive",
    }));
    return {
      page: row.page,
      label: row.label.replaceAll("_", " "),
      category,
      totalViews: yearly.reduce((sum, value) => sum + value.views, 0),
      peakYear: peak.year,
      peakViews: peak.views,
      latestVsPeakPercent: rounded((yearly.at(-1)!.views / peak.views) * 100),
      yearly,
    };
  });
  const selectedInventoryTotal = topicRows.reduce((sum, topic) => sum + topic.totalViews, 0);
  const topics = topicRows.map((topic) => ({
    ...topic,
    shareOfSelectedInventoryPercent: rounded((topic.totalViews / selectedInventoryTotal) * 100),
  }));
  const categoryYearly = Array.from({ length: 8 }, (_, offset) => ANALYSIS_START + offset).map((year) => {
    const sums = { concept: 0, governance: 0, pressure: 0 };
    for (const topic of topics) {
      sums[topic.category] += topic.yearly.find((value) => value.year === year)?.views ?? 0;
    }
    const total = sums.concept + sums.governance + sums.pressure;
    return {
      year,
      ...sums,
      total,
      conceptSharePercent: rounded((sums.concept / total) * 100),
      governanceSharePercent: rounded((sums.governance / total) * 100),
      pressureSharePercent: rounded((sums.pressure / total) * 100),
    };
  });

  const policyTerms = [
    "privacy policy",
    "privacy notice",
    "privacy settings",
    "privacy controls",
    "privacy preferences",
    "data protection",
    "personal information",
    "consent",
    "cookies",
    "privacy rights",
  ];
  const policyRows = expansionRaw.platform_policy_corpus.map((row) => {
    const rawPath = cachePathForPolicy(row.doc_id);
    const tokens = tokenizeHtml(text(rawPath));
    const rawTerms = policyTerms.map((term) => {
      const count = countPhrase(tokens, term);
      return { term, count };
    });
    const matchedPhraseCount = rawTerms.reduce((sum, term) => sum + term.count, 0);
    return {
      id: row.doc_id,
      label: row.label,
      url: row.url,
      rawPath,
      tokenCount: tokens.length,
      matchedPhraseCount,
      terms: rawTerms.map(({ term, count }) => {
        return {
          term,
          count,
          perTenThousandTokens: rounded((count / tokens.length) * 10_000),
          shareOfRegisteredPhraseHitsPercent: matchedPhraseCount === 0 ? 0 : rounded((count / matchedPhraseCount) * 100),
          state: (count === 0 ? "observed_zero" : "observed_positive") as "observed_zero" | "observed_positive",
        };
      }).sort((a, b) => b.count - a.count || a.term.localeCompare(b.term)),
    };
  });
  const includedPolicies = policyRows.filter((row) => row.tokenCount >= MIN_POLICY_TOKENS);
  const excludedPolicies = policyRows.filter((row) => row.tokenCount < MIN_POLICY_TOKENS);
  invariant(includedPolicies.length === 5, `Expected 5 content-complete policy documents, found ${includedPolicies.length}`);

  const attemptsByStation = new Map(anchorRaw.source_attempts.map((row) => [row.station_id, row]));
  const includedAnchors = anchorRaw.stations
    .filter((station) => {
      const attempt = attemptsByStation.get(station.station_id);
      return station.confidence === "high" && !station.manual_review && Boolean(attempt?.reachable) &&
        Number(attempt?.status) >= 200 && Number(attempt?.status) < 300;
    })
    .map((station) => {
      const attempt = attemptsByStation.get(station.station_id)!;
      return {
        id: station.station_id,
        year: station.year,
        label: station.label,
        routeIds: station.route_ids,
        isTransfer: station.route_ids.length > 1,
        sourceTitle: station.source_title,
        sourceUrl: station.source_url,
        sourceStatus: attempt.status,
      };
    })
    .sort((a, b) => a.year - b.year || a.id.localeCompare(b.id));
  invariant(includedAnchors.length === 17, `Expected 17 high-confidence anchors, found ${includedAnchors.length}`);
  const routeCountsMap = new Map<string, number>();
  for (const anchor of includedAnchors) {
    for (const routeId of anchor.routeIds) routeCountsMap.set(routeId, (routeCountsMap.get(routeId) ?? 0) + 1);
  }
  const routeCounts = [...routeCountsMap.entries()]
    .map(([routeId, anchorCount]) => ({
      routeId,
      anchorCount,
      shareOfAnchorsPercent: rounded((anchorCount / includedAnchors.length) * 100),
    }))
    .sort((a, b) => b.anchorCount - a.anchorCount || a.routeId.localeCompare(b.routeId));

  const findings: PrivacyFinding[] = [
    {
      id: "privacy-finding-attention-mix",
      question: "How did the composition of captured privacy-related Wikipedia attention change from 2018 to 2025?",
      result: `Governance pages rose from ${categoryYearly[0].governanceSharePercent}% of the selected-page total in 2018 to ${categoryYearly.at(-1)!.governanceSharePercent}% in 2025.`,
      rawFields: ["series_rows[].page", "series_rows[].series[].date", "series_rows[].series[].views"],
      filters: ["Wikimedia status=ok", "complete calendar years 2018–2025", "ten pages with full-window coverage"],
      grouping: "year × registered editorial category",
      denominator: "sum of views across the same ten coverage-complete selected pages in the same year",
      transform: "category share = category views / selected-page total × 100",
      caveat: "This is navigation attention to selected English Wikipedia pages, not language use, public opinion or population prevalence.",
      sourceRows: [ATTENTION_RAW],
      contractIds: ["privacy-figure-01-attention-field"],
    },
    {
      id: "privacy-finding-topic-peaks",
      question: "Which selected privacy topics accumulated the most captured attention and when did each peak?",
      result: `${[...topics].sort((a, b) => b.totalViews - a.totalViews).slice(0, 3).map((topic) => `${topic.label} (${topic.totalViews.toLocaleString("en-US")})`).join(", ")} lead the 2018–2025 coverage-complete selected-topic inventory.`,
      rawFields: ["series_rows[].page", "series_rows[].series[].date", "series_rows[].series[].views"],
      filters: ["complete calendar years 2018–2025", "exclude the coverage-incomplete GDPR topic"],
      grouping: "article page",
      denominator: "none; pageview counts are shown within their source boundary",
      transform: "sum views by page; argmax yearly views per page",
      caveat: "Article identity, redirects, news cycles and editorial coverage affect pageviews.",
      sourceRows: [ATTENTION_RAW],
      contractIds: ["privacy-figure-02-topic-widgets"],
    },
    {
      id: "privacy-finding-policy-language",
      question: "Which interface and rights terms are visible in five content-complete frozen policy/regulator pages?",
      result: "The documents distribute privacy through different operational vocabularies: personal information, data protection, consent, cookies, settings, controls and rights.",
      rawFields: ["frozen HTML token stream", "registered exact phrase list"],
      filters: [`tokenCount >= ${MIN_POLICY_TOKENS}`, "exact adjacent token sequence", "five complete captures"],
      grouping: "document × registered exact phrase",
      denominator: "document token count for per-10,000-token display",
      transform: "non-overlapping exact phrase scan; count / document tokens × 10,000",
      caveat: "A one-time capture is a bounded document inventory; counts are not semantic parsing, policy quality or legal comparison.",
      sourceRows: includedPolicies.map((row) => row.rawPath),
      contractIds: ["privacy-figure-03-policy-language-widgets"],
    },
    {
      id: "privacy-finding-institutional-transfers",
      question: "How does the retained institutional ledger branch from private-life protection into data, platform, risk and technical governance?",
      result: `${includedAnchors.length} high-confidence, non-manual-review anchors remain; ${includedAnchors.filter((row) => row.isTransfer).length} belong to more than one registered route.`,
      rawFields: ["stations[].year", "stations[].route_ids", "stations[].confidence", "source_attempts[].reachable", "source_attempts[].status"],
      filters: ["confidence=high", "manual_review=false", "reachable HTTP 2xx source"],
      grouping: "dated anchor × route",
      denominator: "retained anchors only",
      transform: "route membership count; transfer = route_ids.length > 1",
      caveat: "This is a curated institutional ledger, not a complete world history of privacy law or equal jurisdictional coverage.",
      sourceRows: [ANCHOR_RAW],
      contractIds: ["privacy-figure-04-governance-grid"],
    },
    {
      id: "privacy-finding-coverage-boundary",
      question: "Which existing Privacy layers are safe for production and which remain incomparable or out of scope?",
      result: "Three active evidence families support the proposed story; variable Ngram aliases, mixed-source geo rankings, elevation and legacy chart metaphors remain excluded.",
      rawFields: ["research index statuses", "processed limitations", "active input manifests"],
      filters: ["current repository snapshot", "production claim boundary"],
      grouping: "research layer",
      denominator: "none",
      transform: "rule-based eligibility classification",
      caveat: "Exclusion is a production decision for this mobile edition, not deletion of historical research.",
      sourceRows: ["docs/research/privacy/privacy_research_index.json"],
      contractIds: ["privacy-figure-05-coverage-ledger"],
    },
  ];

  const contracts: PrivacyFigureContract[] = [
    {
      id: "privacy-figure-01-attention-field",
      movement: "movement-a-attention",
      moduleOrder: 1,
      title: "Attention changes shape",
      researchQuestion: findings[0].question,
      findingId: findings[0].id,
      sourceFilesAndFields: [`${ATTENTION_RAW} → series_rows[].{page,series[].date,series[].views}`],
      recordGranularityAndN: "10 pages × 8 complete years = 80 observations",
      filters: findings[0].filters,
      grouping: findings[0].grouping,
      denominator: findings[0].denominator,
      formula: findings[0].transform,
      unit: "share of selected-page views (%) and pageviews",
      visualChannelMapping: ["year → x", "annual selected-page total → bar height", "category share → stacked color area", "2025 share → direct label"],
      validInterpretation: findings[0].result,
      prohibitedInterpretation: ["public concern prevalence", "semantic frequency", "causal effect of a regulation"],
      missingnessPolicy: "2026 is out_of_scope as an incomplete year; the incomplete-coverage GDPR topic is unavailable; no missing year is filled.",
      sourceAndRightsBoundary: findings[0].caveat,
      referenceMapping: "Reference 1 yearly-activity full-height upper visual; description widget overlaps its lower edge.",
      cardBehavior: "Primary visualization is static; its compact finding card may flip for method/source but is not swipeable.",
      productionEligible: true,
      blocker: null,
    },
    {
      id: "privacy-figure-02-topic-widgets",
      movement: "movement-a-attention",
      moduleOrder: 2,
      title: "Eleven windows onto privacy",
      researchQuestion: findings[1].question,
      findingId: findings[1].id,
      sourceFilesAndFields: [`${ATTENTION_RAW} → series_rows[]`],
      recordGranularityAndN: "10 topic widgets, each containing 8 complete yearly observations",
      filters: findings[1].filters,
      grouping: findings[1].grouping,
      denominator: findings[1].denominator,
      formula: findings[1].transform,
      unit: "share of ten-page selected attention inventory (%) and annual percent of topic peak",
      visualChannelMapping: ["topic → widget", "topic total / ten-topic inventory total → principal percentage", "year → ordered microvisual mark", "annual views / topic peak → bar height, dense dot share or block opacity"],
      validInterpretation: findings[1].result,
      prohibitedInterpretation: ["importance ranking", "total internet interest", "language-wide use"],
      missingnessPolicy: "Observed zero remains zero; 2026 is out_of_scope; the GDPR topic is unavailable; other missing states are labeled rather than imputed.",
      sourceAndRightsBoundary: findings[1].caveat,
      referenceMapping: "Reference 1 lower two-column widget grid and Reference 2 circular/dot widget density.",
      cardBehavior: "Fixed two-column widget matrix. Any detailed widget flips in place; no horizontal rail.",
      productionEligible: true,
      blocker: null,
    },
    {
      id: "privacy-figure-03-policy-language-widgets",
      movement: "movement-b-infrastructure",
      moduleOrder: 3,
      title: "Privacy becomes interface language",
      researchQuestion: findings[2].question,
      findingId: findings[2].id,
      sourceFilesAndFields: includedPolicies.map((row) => `${row.rawPath} → normalized tokens`),
      recordGranularityAndN: `${includedPolicies.length} content-complete captured documents × ${policyTerms.length} registered phrases`,
      filters: findings[2].filters,
      grouping: findings[2].grouping,
      denominator: findings[2].denominator,
      formula: findings[2].transform,
      unit: "share of matches to ten registered phrases within each document (%)",
      visualChannelMapping: ["document → widget", "registered phrase → row or column", "phrase count / all ten registered phrase hits in document → percentage bar, dot or column", "observed zero → empty state"],
      validInterpretation: findings[2].result,
      prohibitedInterpretation: ["legal strength", "policy quality", "platform behavior", "semantic equivalence among phrases"],
      missingnessPolicy: "Documents below the 1,000-token content floor are absent_or_suppressed, not zero-valued documents.",
      sourceAndRightsBoundary: findings[2].caveat,
      referenceMapping: "Reference 1 credit-card widget and Reference 2 product-statistics modular surface.",
      cardBehavior: "Five widgets form a two-column irregular matrix. Tap flips one widget at a time to its source/boundary side.",
      productionEligible: true,
      blocker: null,
    },
    {
      id: "privacy-figure-04-governance-grid",
      movement: "movement-b-infrastructure",
      moduleOrder: 4,
      title: "One idea, many institutions",
      researchQuestion: findings[3].question,
      findingId: findings[3].id,
      sourceFilesAndFields: [`${ANCHOR_RAW} → stations[] + source_attempts[]`],
      recordGranularityAndN: `${includedAnchors.length} retained dated anchors; ${routeCounts.length} route families`,
      filters: findings[3].filters,
      grouping: findings[3].grouping,
      denominator: findings[3].denominator,
      formula: findings[3].transform,
      unit: "institutional anchors and route memberships",
      visualChannelMapping: ["retained anchor → one equal dot", "multi-route source → violet filled dot", "single-route source → pale dot", "route anchor count / 17 retained anchors → percentage bar", "source record → folded chronological link"],
      validInterpretation: findings[3].result,
      prohibitedInterpretation: ["complete global law history", "causal lineage", "equal jurisdictional coverage", "event importance by dot area"],
      missingnessPolicy: "Medium/low/manual-review anchors are unavailable for the production ledger; absence from a route is not a historical zero.",
      sourceAndRightsBoundary: findings[3].caveat,
      referenceMapping: "Reference 2 proportion dot field and Reference 4 compact percentage widgets; the deprecated year-by-route matrix is prohibited.",
      cardBehavior: "Static equal-dot proportion field and percentage route bars; record-level source links are folded below.",
      productionEligible: true,
      blocker: null,
    },
    {
      id: "privacy-figure-05-coverage-ledger",
      movement: "movement-b-infrastructure",
      moduleOrder: 5,
      title: "What this page can and cannot claim",
      researchQuestion: findings[4].question,
      findingId: findings[4].id,
      sourceFilesAndFields: ["privacy source manifest + processed layer limitations"],
      recordGranularityAndN: "research layer",
      filters: findings[4].filters,
      grouping: findings[4].grouping,
      denominator: findings[4].denominator,
      formula: findings[4].transform,
      unit: "evidence state",
      visualChannelMapping: ["evidence state group → widget", "layers in group / eleven audited layers → principal percentage", "group count → direct text"],
      validInterpretation: findings[4].result,
      prohibitedInterpretation: ["excluded equals false", "not searched equals zero", "research deletion"],
      missingnessPolicy: "Uses the full eight-state taxonomy; missing and zero are never collapsed.",
      sourceAndRightsBoundary: "Repository audit only; upstream rights remain attached to each layer.",
      referenceMapping: "Reference 4 compact dashboard modules translated into an evidence-state ledger.",
      cardBehavior: "Always-visible compact ledger; source/rights detail is a native disclosure below the ledger.",
      productionEligible: true,
      blocker: null,
    },
  ];

  const coverageAudit: PrivacyMobileAnalysis["coverageAudit"] = [
    { layerId: "attention_metrics", state: "observed_positive", productionUse: "figures 01–02", reason: "Ten frozen yearly pageview series have an explicit source boundary and complete 2018–2025 window." },
    { layerId: "attention_gdpr_topic", state: "unavailable", productionUse: "coverage only", reason: "The frozen GDPR page series begins in 2022 and cannot enter the 2018–2025 common-window comparison." },
    { layerId: "platform_policy_corpus", state: "observed_positive", productionUse: "figure 03", reason: "Five frozen documents pass the 1,000-token content floor." },
    { layerId: "modern_institutional_anchors", state: "observed_positive", productionUse: "figure 04", reason: "Seventeen high-confidence, non-manual-review anchors have reachable 2xx sources." },
    { layerId: "frequency_terms", state: "incomparable", productionUse: "coverage only", reason: "Variable Ngram aliases and no fixed-release raw denominator." },
    { layerId: "geo_attention_map", state: "incomparable", productionUse: "coverage only", reason: "Academic production and news/source geography are mixed." },
    { layerId: "geo_elevation_distribution", state: "out_of_scope", productionUse: "none", reason: "Elevation has no supported explanatory relationship to privacy attention." },
    { layerId: "etymology_first_use", state: "unavailable", productionUse: "none", reason: "Direct first-use evidence remains unverified." },
    { layerId: "google_trends_region", state: "not_searched", productionUse: "none", reason: "No stable official public API was used in the frozen research pass." },
    { layerId: "gdelt_failed_request", state: "fetch_failed", productionUse: "none", reason: "The retained research expansion records one JSON-decode failure." },
    { layerId: "partial_2026_attention", state: "out_of_scope", productionUse: "none", reason: "The captured 2026 year is partial and excluded from comparisons." },
  ];
  const coverageGroupStates = {
    used: ["observed_positive"],
    thin: ["unavailable", "absent_or_suppressed"],
    different: ["incomparable"],
    outside: ["fetch_failed", "out_of_scope", "not_searched"],
  } as const;
  const coverageSummary: PrivacyMobileAnalysis["coverageSummary"] = Object.entries(coverageGroupStates).map(([id, states]) => {
    const layers = coverageAudit.filter((layer) => (states as readonly string[]).includes(layer.state));
    return {
      id: id as PrivacyMobileAnalysis["coverageSummary"][number]["id"],
      layerCount: layers.length,
      shareOfAuditedLayersPercent: rounded((layers.length / coverageAudit.length) * 100),
      layerIds: layers.map((layer) => layer.layerId),
    };
  });

  const spotChecks: PrivacyMobileAnalysis["spotChecks"] = [];
  const check = (id: string, actual: number | string | boolean, expected: number | string | boolean, lineage: string) =>
    spotChecks.push({ id, actual, expected, passed: actual === expected, lineage });
  check("privacy-check-topic-count", topics.length, 10, ATTENTION_RAW);
  check("privacy-check-coverage-exclusion", excludedCoverageTopics[0].page, "General_data_protection_regulation", ATTENTION_RAW);
  check("privacy-check-complete-year-floor", Math.min(...topics.flatMap((topic) => topic.yearly.map((row) => row.year))), 2018, ATTENTION_RAW);
  check("privacy-check-complete-year-ceiling", Math.max(...topics.flatMap((topic) => topic.yearly.map((row) => row.year))), 2025, ATTENTION_RAW);
  check("privacy-check-2026-excluded", topics.some((topic) => topic.yearly.some((row) => row.year === 2026)), false, ATTENTION_RAW);
  check("privacy-check-privacy-2023", topics.find((topic) => topic.page === "Privacy")?.yearly.find((row) => row.year === 2023)?.views ?? -1, 488142, ATTENTION_RAW);
  check("privacy-check-policy-included", includedPolicies.length, 5, EXPANSION_RAW);
  check("privacy-check-policy-excluded", excludedPolicies.length, 3, EXPANSION_RAW);
  check("privacy-check-google-cookies", includedPolicies.find((row) => row.id === "google_privacy")?.terms.find((row) => row.term === "cookies")?.count ?? -1, 23, "frozen Google policy token stream");
  check("privacy-check-gdpr-data-protection", includedPolicies.find((row) => row.id === "gdpr_lex")?.terms.find((row) => row.term === "data protection")?.count ?? -1, 158, "frozen GDPR token stream");
  check("privacy-check-policy-zero-share", includedPolicies.flatMap((row) => row.terms).filter((row) => row.state === "observed_zero").every((row) => row.shareOfRegisteredPhraseHitsPercent === 0), true, "frozen policy token streams → observed-zero display boundary");
  check("privacy-check-policy-positive-share", includedPolicies.flatMap((row) => row.terms).filter((row) => row.state === "observed_positive").every((row) => row.shareOfRegisteredPhraseHitsPercent > 0), true, "frozen policy token streams → observed-positive display boundary");
  check("privacy-check-anchor-included", includedAnchors.length, 17, ANCHOR_RAW);
  check("privacy-check-anchor-transfers", includedAnchors.filter((row) => row.isTransfer).length, 12, ANCHOR_RAW);
  check("privacy-check-low-confidence-excluded", includedAnchors.some((row) => row.id === "snowden_2013"), false, ANCHOR_RAW);
  check("privacy-check-contract-count", contracts.length, 5, "figure contract registry");
  check("privacy-check-contract-eligibility", contracts.every((contract) => contract.productionEligible), true, "figure contract registry");
  invariant(spotChecks.every((row) => row.passed), `Privacy spot checks failed: ${spotChecks.filter((row) => !row.passed).map((row) => row.id).join(", ")}`);

  return {
    schemaVersion: "1.0.0",
    auditId: "privacy-mobile-2026-08-12",
    generatedFromFrozenInputs: true,
    implementationAuthorized: false,
    principalQuestion: "How did privacy move from a protected sphere into a public-facing infrastructure of attention, policy language and institutional control?",
    missingnessTaxonomy: [
      "observed_positive", "observed_zero", "absent_or_suppressed", "not_searched",
      "fetch_failed", "unavailable", "incomparable", "out_of_scope",
    ],
    sourceManifest: buildSourceManifest(includedPolicies.map((row) => row.rawPath)),
    attention: {
      source: "Wikimedia Pageviews API",
      startYear: 2018,
      endYear: 2025,
      excludedPartialYear: 2026,
      excludedCoverageTopics,
      topics,
      categoryYearly,
    },
    policyCorpus: {
      terms: policyTerms,
      minimumTokenRule: MIN_POLICY_TOKENS,
      includedDocumentCount: includedPolicies.length,
      excludedDocumentCount: excludedPolicies.length,
      documents: includedPolicies,
      excludedDocuments: excludedPolicies.map((row) => ({
        id: row.id,
        tokenCount: row.tokenCount,
        state: "absent_or_suppressed" as const,
        reason: `Captured document contains fewer than ${MIN_POLICY_TOKENS} visible tokens; zeros would be unsafe.`,
      })),
    },
    anchorLedger: {
      inclusionRule: "confidence=high AND manual_review=false AND source reachable with HTTP 2xx",
      includedCount: includedAnchors.length,
      excludedCount: anchorRaw.stations.length - includedAnchors.length,
      transferCount: includedAnchors.filter((row) => row.isTransfer).length,
      transferSharePercent: rounded((includedAnchors.filter((row) => row.isTransfer).length / includedAnchors.length) * 100),
      routeCounts,
      anchors: includedAnchors,
    },
    coverageAudit,
    coverageSummary,
    findings,
    figureContracts: contracts,
    spotChecks,
  };
}

function stableJson(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function writeOrCheck(path: string, content: string, checkMode: boolean): void {
  const absolute = resolve(ROOT, path);
  if (checkMode) {
    invariant(existsSync(absolute), `${path} is missing`);
    invariant(readFileSync(absolute, "utf8") === content, `${path} is stale; run npm run data:privacy:mobile`);
  } else {
    writeFileSync(absolute, content, "utf8");
  }
}

const checkMode = process.argv.includes("--check");
const artifact = buildArtifact();
const content = stableJson(artifact);
writeOrCheck(OUTPUT, content, checkMode);
writeOrCheck(BACKUP, content, checkMode);
writeOrCheck(GENERATED, content, checkMode);
console.log(`privacy mobile analysis ${checkMode ? "validated" : "written"}: ${sha256(content)}`);
