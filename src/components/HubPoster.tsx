import Link from "next/link";
import type { ReactNode } from "react";
import {
  HubChart01SemanticField,
  type HubChart01FieldData,
  type HubChart01Layer,
  type HubChart01PeriodSignal,
  type HubChart01Query,
} from "@/components/hub/HubChart01SemanticField";
import {
  HubChart02TransferModel,
  type HubChart02Evidence,
  type HubChart02FlowTerm,
  type HubChart02LayerConfidence,
  type HubChart02TermRole,
  type HubChart02TransferData,
} from "@/components/hub/HubChart02TransferModel";
import { Nav } from "@/components/Nav";
import hubChartDataPreviewJson from "@/data/generated/hub_chart_data_preview.json";

type VisibilityQuery = {
  query: string;
  mean_value: number;
};

type VisibilityGroup = {
  semantic_group: string;
  visibility_score: number;
  rank: number;
  main_contributing_queries: VisibilityQuery[];
};

type VisibilityPeriod = {
  period_id: string;
  period_label: string;
  ranked_groups: VisibilityGroup[];
  mechanical_core_status?: {
    status: string;
    relative_signal: number;
  };
};

type HubChartPreview = {
  metadata: {
    word: string;
  };
  chart01_frequency_layer: {
    metadata: {
      generated_at: string;
    };
    frequency_summary: {
      data_answer_preliminary: {
        mechanical_core_status: string;
        dominant_modern_groups: string[];
      };
      quality_flag_counts: Record<string, number>;
      observations_requiring_caution: string[];
    };
    semantic_visibility_index: {
      periods: VisibilityPeriod[];
    };
  };
  evidence_strengthening_layer: {
    evidence_quality_upgrade: {
      previous_earliest_claimed_year: string;
      new_earliest_supported_year: number;
      new_earliest_direct_text_year: number;
      new_earliest_mechanical_direct_text_year: number;
      new_earliest_metaphorical_direct_text_year: number;
      claim_1640s_resolved: boolean;
      evidence_1828_classification: string;
    };
    nave_relation_summary: {
      relationship_supported: boolean;
      summary: string;
      chart_planning_note: string;
    };
  };
  chart02_recovery_layer?: Chart02RecoveryLayer;
};

type LayerSpec = {
  id: string;
  layerNumber: string;
  label: string;
  semanticGroups: string[];
  periodHint: string;
  summary: string;
  color: string;
  accentColor: string;
};

type Chart02RecoveredTerm = {
  term: string;
  routing_layer: string;
  recovery_status: string;
  frequency_support: string;
  evidence_ids: string[];
  evidence_confidence: "high" | "medium" | "low";
  recommended_role_after_recovery: string;
  notes: string;
};

type Chart02HardenedEvidence = {
  evidence_id: string;
  term: string;
  routing_layer: string;
  year: number | null;
  source_title: string;
  source_type: string;
  context_summary: string;
  supports_claim: string;
  confidence: "high" | "medium" | "low";
  limitations: string;
};

type Chart02RecoveryLayer = {
  metadata: {
    generated_at: string;
  };
  recovered_terms: Chart02RecoveredTerm[];
  hardened_evidence: Chart02HardenedEvidence[];
  model_confidence: {
    core_model_status: {
      hub_and_spoke_strong_enough: boolean;
      main_model_terms: string[];
      confidence: "high" | "medium" | "low";
      notes: string;
    };
    routing_layers: {
      routing_layer: string;
      frequency_support: string;
      evidence_support: string;
      recommended_role: string;
      confidence: "high" | "medium" | "low";
    }[];
    terms_to_use: {
      main_model: string[];
      main_series: string[];
      supporting: string[];
      annotation: string[];
      exclude: string[];
    };
    remaining_gaps: {
      gap: string;
      severity: string;
      notes: string;
    }[];
  };
  recovery_summary: {
    recovery_summary: {
      frequency_series_recovered: number;
      hardened_evidence_items: number;
      high_confidence_evidence: number;
      medium_confidence_evidence: number;
      low_confidence_evidence: number;
    };
    chart02_readiness_after_recovery: string;
    main_model_status: string;
    notes: string;
  };
};

const preview = hubChartDataPreviewJson as HubChartPreview;

const layerSpecs: LayerSpec[] = [
  {
    id: "mechanical_core",
    layerNumber: "Layer 1",
    label: "Mechanical / Wheel Hub",
    semanticGroups: ["mechanical_core"],
    periodHint: "1800-1945 strongest",
    summary: "Wheel-center and spoke-bearing uses remain present across the series, then become less dominant in modern semantic visibility.",
    color: "#8BBEB2",
    accentColor: "#FBB728",
  },
  {
    id: "central_place",
    layerNumber: "Layer 2",
    label: "Central Place Hub",
    semanticGroups: ["central_place"],
    periodHint: "1850s metaphor layer",
    summary: "The word expands from a physical center toward activity, commerce, city, and social center phrases.",
    color: "#FBB728",
    accentColor: "#8BBEB2",
  },
  {
    id: "transport_routing",
    layerNumber: "Layer 3",
    label: "Transport / Routing Hub",
    semanticGroups: ["transport_routing"],
    periodHint: "route and transfer model",
    summary: "Transport and hub-and-spoke phrases make hub visible as a routing structure for people, goods, and movement.",
    color: "#8BBEB2",
    accentColor: "#FBB728",
  },
  {
    id: "network_system",
    layerNumber: "Layer 4",
    label: "Network / System Hub",
    semanticGroups: ["network_system"],
    periodHint: "technical node model",
    summary: "Communication, computing, Ethernet, USB, and network phrases keep the central-node logic technical and device-adjacent.",
    color: "#FBB728",
    accentColor: "#8BBEB2",
  },
  {
    id: "institutional_digital",
    layerNumber: "Layer 5",
    label: "Institutional / Digital Hub",
    semanticGroups: ["institutional_cluster", "digital_platform"],
    periodHint: "modern visible center",
    summary: "Business, research, knowledge, digital, content, and data phrases make hub a modern access point and institutional concentration.",
    color: "#8BBEB2",
    accentColor: "#FBB728",
  },
];

const hubPanels = [
  { num: "01", label: "Semantic Frequency Field", color: "#FBB728" },
  { num: "02", label: "Transfer Model", color: "#414B9E" },
  { num: "03", label: "Compound Growth", color: "#8BBEB2" },
  { num: "04", label: "Centrality Pressure", color: "#852736" },
];

function scoreForGroups(period: VisibilityPeriod, groupIds: string[]) {
  return period.ranked_groups
    .filter((group) => groupIds.includes(group.semantic_group))
    .reduce((total, group) => total + group.visibility_score, 0);
}

function queriesForGroups(periods: VisibilityPeriod[], groupIds: string[]) {
  const byQuery = new Map<string, number>();
  periods.forEach((period) => {
    period.ranked_groups
      .filter((group) => groupIds.includes(group.semantic_group))
      .forEach((group) => {
        group.main_contributing_queries.forEach((query) => {
          byQuery.set(query.query, Math.max(byQuery.get(query.query) ?? 0, query.mean_value));
        });
      });
  });
  return Array.from(byQuery.entries())
    .map(([query, meanValue]) => ({ query, meanValue }))
    .sort((a, b) => b.meanValue - a.meanValue);
}

function periodSignalsForSpec(
  spec: LayerSpec,
  periods: VisibilityPeriod[],
  maxScore: number,
  rankLookup: Map<string, Map<string, number>>,
): HubChart01PeriodSignal[] {
  return periods.map((period) => {
    const groupQueries = queriesForGroups([period], spec.semanticGroups).slice(0, 3);
    return {
      periodId: period.period_id,
      periodLabel: period.period_label,
      score: scoreForGroups(period, spec.semanticGroups),
      normalizedScore: maxScore > 0 ? scoreForGroups(period, spec.semanticGroups) / maxScore : 0,
      rank: rankLookup.get(period.period_id)?.get(spec.id) ?? 0,
      status: spec.id === "mechanical_core" ? period.mechanical_core_status?.status : undefined,
      mainQueries: groupQueries,
    };
  });
}

function buildRankLookup(periods: VisibilityPeriod[]) {
  const lookup = new Map<string, Map<string, number>>();
  periods.forEach((period) => {
    const ranked = layerSpecs
      .map((spec) => ({
        layerId: spec.id,
        score: scoreForGroups(period, spec.semanticGroups),
      }))
      .sort((a, b) => b.score - a.score);
    lookup.set(
      period.period_id,
      new Map(ranked.map((item, index) => [item.layerId, index + 1])),
    );
  });
  return lookup;
}

function buildHubChart01Data(): HubChart01FieldData {
  const periods = preview.chart01_frequency_layer.semantic_visibility_index.periods;
  const maxScore = Math.max(
    ...periods.flatMap((period) => layerSpecs.map((spec) => scoreForGroups(period, spec.semanticGroups))),
    0.000001,
  );
  const rankLookup = buildRankLookup(periods);
  const lastPeriod = periods[periods.length - 1];
  const layers: HubChart01Layer[] = layerSpecs.map((spec) => {
    const periodSignals = periodSignalsForSpec(spec, periods, maxScore, rankLookup);
    const scores = periodSignals.map((period) => period.score);
    const modernScore = scoreForGroups(lastPeriod, spec.semanticGroups);
    const queryLabels = queriesForGroups(periods, spec.semanticGroups);
    return {
      ...spec,
      earlyScore: periodSignals[0]?.score ?? 0,
      modernScore,
      peakScore: Math.max(...scores, 0),
      normalizedPeak: Math.max(...scores, 0) / maxScore,
      modernRank: rankLookup.get(lastPeriod.period_id)?.get(spec.id) ?? 0,
      modernStatus:
        spec.id === "mechanical_core"
          ? lastPeriod.mechanical_core_status?.status ?? "present"
          : spec.id === "institutional_digital"
            ? "dominant"
            : modernScore > 0
              ? "visible"
              : "sparse",
      queryLabels,
      periods: periodSignals,
    };
  });

  const evidence = preview.evidence_strengthening_layer.evidence_quality_upgrade;
  const nave = preview.evidence_strengthening_layer.nave_relation_summary;

  return {
    title: "A Word Whose Center Moved",
    subtitle: "Semantic-frequency field for hub Chart 01",
    generatedAt: preview.chart01_frequency_layer.metadata.generated_at,
    sourceSummary: "Google Books Ngram semantic proxies plus strengthened attestation notes.",
    layers,
    evidence: [
      {
        label: "Earliest claimed",
        value: evidence.previous_earliest_claimed_year,
        note: evidence.claim_1640s_resolved ? "Primary quotation resolved." : "Dictionary claim only; no visible primary quotation in the current layer.",
      },
      {
        label: "1828 support",
        value: String(evidence.new_earliest_supported_year),
        note: `Classified as ${evidence.evidence_1828_classification}; useful for wheel sense, not a corpus first-use date.`,
      },
      {
        label: "Direct metaphor",
        value: String(evidence.new_earliest_metaphorical_direct_text_year),
        note: "High-confidence direct text supports central-place metaphor before the twentieth century.",
      },
      {
        label: "Direct mechanical",
        value: String(evidence.new_earliest_mechanical_direct_text_year),
        note: "Readable direct-text mechanical evidence keeps the wheel-center layer anchored.",
      },
      {
        label: "Nave relation",
        value: nave.relationship_supported ? "supported" : "uncertain",
        note: nave.summary,
      },
    ],
    cautions: [
      ...preview.chart01_frequency_layer.frequency_summary.observations_requiring_caution,
      "The 1800-1849 period is the effective early Ngram window for this chart layer.",
      "The latest period is 2020-2022, not a full 2020-present sample.",
    ],
  };
}

function asChart02Role(role: string | undefined, fallback: HubChart02TermRole): HubChart02TermRole {
  if (role === "main_model" || role === "main_series" || role === "supporting" || role === "annotation") {
    return role;
  }
  return fallback;
}

function findChart02Term(recovery: Chart02RecoveryLayer, term: string) {
  return recovery.recovered_terms.find((item) => item.term.toLowerCase() === term.toLowerCase());
}

function findChart02Evidence(
  recovery: Chart02RecoveryLayer,
  term: string,
  preferredTitle?: string,
): Chart02HardenedEvidence | undefined {
  const matches = recovery.hardened_evidence.filter((item) => item.term.toLowerCase() === term.toLowerCase());
  return (
    matches.find((item) => preferredTitle && item.source_title.toLowerCase().includes(preferredTitle.toLowerCase())) ??
    matches.find((item) => item.confidence === "high" && item.year !== null) ??
    matches.find((item) => item.confidence === "high") ??
    matches.find((item) => item.year !== null) ??
    matches[0]
  );
}

function chart02TermNote(term: Chart02RecoveredTerm | undefined, routingLayer: string) {
  const layerLabel = chart02LayerLabels[routingLayer] ?? routingLayer;
  if (!term) {
    return `${layerLabel}; included as a selected Chart 02 route from the recovery layer.`;
  }
  const frequency = term.frequency_support.replaceAll("_", " ");
  const confidence = term.evidence_confidence;
  return `${layerLabel}. ${frequency} frequency support; ${confidence}-confidence evidence. ${term.notes}`;
}

const chart02LayerLabels: Record<string, string> = {
  rail_transit_route: "Rail and transit routing",
  air_logistics_route: "Air, freight, and logistics routing",
  hub_and_spoke_model: "Explicit hub-and-spoke model",
  network_communication_route: "Communication and network routing",
  institutional_route_language: "Access and service language",
};

function buildHubChart02Data(): HubChart02TransferData {
  const recovery = preview.chart02_recovery_layer;

  if (!recovery) {
    return {
      title: "The Transfer Model",
      subtitle: "When the center became a routing machine.",
      sourceSummary: "Chart 02 recovery data is unavailable in the generated hub preview.",
      coreStatus: "missing recovery layer",
      readiness: "not ready",
      recoveredCount: 0,
      evidenceCount: 0,
      confidenceCounts: { high: 0, medium: 0, low: 0 },
      flows: [],
      evidence: [],
      layers: [],
      cautions: ["Chart 02 recovery data was not found in the generated preview file."],
    };
  }

  const flowPlan: {
    term: string;
    routingLayer: string;
    side: HubChart02FlowTerm["side"];
    fallbackRole: HubChart02TermRole;
    weight: number;
  }[] = [
    { term: "transport hub", routingLayer: "rail_transit_route", side: "left", fallbackRole: "main_series", weight: 1 },
    { term: "transit hub", routingLayer: "rail_transit_route", side: "left", fallbackRole: "supporting", weight: 0.74 },
    { term: "railway hub", routingLayer: "rail_transit_route", side: "left", fallbackRole: "supporting", weight: 0.68 },
    { term: "railroad hub", routingLayer: "rail_transit_route", side: "left", fallbackRole: "supporting", weight: 0.58 },
    { term: "logistics hub", routingLayer: "air_logistics_route", side: "left", fallbackRole: "supporting", weight: 0.62 },
    { term: "distribution hub", routingLayer: "air_logistics_route", side: "left", fallbackRole: "annotation", weight: 0.36 },
    { term: "hub-and-spoke", routingLayer: "hub_and_spoke_model", side: "center", fallbackRole: "main_model", weight: 1 },
    { term: "hub and spoke", routingLayer: "hub_and_spoke_model", side: "center", fallbackRole: "main_model", weight: 0.92 },
    { term: "network hub", routingLayer: "network_communication_route", side: "right", fallbackRole: "supporting", weight: 0.78 },
    { term: "communication hub", routingLayer: "network_communication_route", side: "right", fallbackRole: "supporting", weight: 0.68 },
    { term: "hub node", routingLayer: "network_communication_route", side: "right", fallbackRole: "supporting", weight: 0.5 },
    { term: "Ethernet hub", routingLayer: "network_communication_route", side: "right", fallbackRole: "supporting", weight: 0.58 },
    { term: "switching hub", routingLayer: "network_communication_route", side: "right", fallbackRole: "supporting", weight: 0.54 },
    { term: "data hub", routingLayer: "network_communication_route", side: "right", fallbackRole: "supporting", weight: 0.48 },
  ];

  const flows: HubChart02FlowTerm[] = flowPlan.map((plan) => {
    const term = findChart02Term(recovery, plan.term);
    return {
      term: plan.term,
      routingLayer: term?.routing_layer ?? plan.routingLayer,
      role: asChart02Role(term?.recommended_role_after_recovery, plan.fallbackRole),
      side: plan.side,
      weight: plan.weight,
      confidence: term?.evidence_confidence ?? "medium",
      note: chart02TermNote(term, term?.routing_layer ?? plan.routingLayer),
    };
  });

  const evidencePlan = [
    { term: "transit hub", label: "Transit route evidence" },
    { term: "railway hub", label: "Railway routing evidence" },
    { term: "hub-and-spoke", label: "Explicit model reference", preferredTitle: "Merriam" },
    { term: "network hub", label: "Network-node reference" },
  ];
  const evidence: HubChart02Evidence[] = evidencePlan.flatMap((plan) => {
    const item = findChart02Evidence(recovery, plan.term, plan.preferredTitle);
    if (!item) return [];
    return [
      {
        label: plan.label,
        year: item.year === null ? "ref." : String(item.year),
        term: item.term,
        confidence: item.confidence,
        note: item.context_summary || item.limitations || item.supports_claim.replaceAll("_", " "),
      },
    ];
  });

  const summary = recovery.recovery_summary.recovery_summary;
  const layers: HubChart02LayerConfidence[] = recovery.model_confidence.routing_layers.map((layer) => ({
    routingLayer: layer.routing_layer,
    frequencySupport: layer.frequency_support,
    evidenceSupport: layer.evidence_support,
    recommendedRole: layer.recommended_role,
    confidence: layer.confidence,
  }));

  return {
    title: "The Transfer Model",
    subtitle: "How hub turned centrality into routing: routes collect, compress, and redistribute through a model point.",
    sourceSummary: "Hub Chart 02 recovery layer: routing terms, hardened evidence, and model confidence matrix.",
    coreStatus: recovery.model_confidence.core_model_status.hub_and_spoke_strong_enough
      ? "hub-and-spoke strong"
      : "hub-and-spoke limited",
    readiness: recovery.recovery_summary.chart02_readiness_after_recovery,
    recoveredCount: summary.frequency_series_recovered,
    evidenceCount: summary.hardened_evidence_items,
    confidenceCounts: {
      high: summary.high_confidence_evidence,
      medium: summary.medium_confidence_evidence,
      low: summary.low_confidence_evidence,
    },
    flows,
    evidence,
    layers,
    cautions: [
      "Flow width maps recommended data role, not exact traffic volume.",
      "Ngram values are printed-book frequency proxies and do not prove first historical attestation.",
      "Expanded hub-and-spoke variants remain gap-limited; the chart uses the stronger core terms.",
      "Regional, global, and institutional hub terms are kept out of the main routing flow unless context shows transfer.",
      "Early routing evidence is sparser than modern routing evidence.",
    ],
  };
}

function HubPanelProgress() {
  return (
    <div className="grid border-b border-ink/60 md:grid-cols-4">
      {hubPanels.map((panel, index) => (
        <div
          key={panel.num}
          className={`grid grid-cols-[4rem_1fr] border-ink/60 ${
            index < hubPanels.length - 1 ? "border-b md:border-b-0 md:border-r" : ""
          }`}
        >
          <div className="border-r border-ink/60 px-3 py-3 font-mono text-[0.72rem] font-black uppercase tracking-[0.16em] text-hub-ruby">
            {panel.num}
          </div>
          <div className="px-3 py-3 font-mono text-[0.72rem] font-black uppercase leading-5 tracking-[0.12em] text-ink">
            {panel.label}
          </div>
        </div>
      ))}
    </div>
  );
}

function HubSection({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <section className="pb-0 pt-8 sm:pt-9 lg:pt-10">
      <div className="mb-8 grid gap-3 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10">
        <p className="font-mono text-[0.82rem] font-black uppercase leading-5 tracking-[0.16em] text-hub-ruby">
          {eyebrow}
        </p>
        <div className="max-w-5xl">
          <h2 className="text-[clamp(1.22rem,2vw,1.95rem)] font-black leading-[1.02] tracking-normal text-ink">
            {title}
          </h2>
          <p className="mt-2 max-w-[1040px] text-[1.08rem] leading-[1.55] text-ink/68">
            {intro}
          </p>
        </div>
      </div>
      {children}
    </section>
  );
}

export function HubPoster() {
  const chart01Data = buildHubChart01Data();
  const chart02Data = buildHubChart02Data();
  const queryCount = Object.values(preview.chart01_frequency_layer.frequency_summary.quality_flag_counts).reduce(
    (total, count) => total + count,
    0,
  );

  return (
    <main className="min-h-screen bg-wheat text-ink">
      <div className="mx-auto flex w-full max-w-[1960px] flex-col px-4 py-5 sm:px-7 lg:px-10 xl:px-12">
        <Nav />

        <section className="relative overflow-hidden border-y border-ink py-8 sm:py-10 lg:py-12">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(139,190,178,0.2)_1px,transparent_1px),linear-gradient(180deg,rgba(5,5,16,0.07)_1px,transparent_1px)] bg-[size:72px_72px]" />
          <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-end">
            <div>
              <p className="font-mono text-[0.82rem] font-black uppercase tracking-[0.18em] text-hub-space">
                Words Over Time / word page
              </p>
              <h1 className="mt-5 text-[clamp(5.6rem,18vw,19rem)] font-black leading-[0.72] tracking-normal text-hub-amethyst">
                hub
              </h1>
              <p className="mt-7 max-w-5xl text-[clamp(1.15rem,2.25vw,3rem)] font-black leading-[1.02] text-ink">
                A word whose center moved from the wheel to the systems around us.
              </p>
              <p className="mt-4 max-w-3xl font-mono text-[clamp(0.78rem,1.08vw,1rem)] font-black uppercase leading-6 tracking-[0.12em] text-hub-space">
                Wheel center / city center / transfer point / network node / institutional access point.
              </p>
            </div>

            <dl className="grid border-y border-ink bg-wheat/74">
              {[
                ["ngram", "1800-2022"],
                ["chart 01", "semantic field"],
                ["layers", String(chart01Data.layers.length)],
                ["queries", String(queryCount)],
              ].map(([label, value], index) => (
                <div
                  key={label}
                  className={`grid grid-cols-[7.25rem_1fr] border-ink ${
                    index < 3 ? "border-b" : ""
                  }`}
                >
                  <dt className="border-r border-ink px-3 py-3 font-mono text-[0.74rem] font-black uppercase leading-5 tracking-[0.14em] text-hub-ruby">
                    {label}
                  </dt>
                  <dd className="px-3 py-3 font-mono text-[0.8rem] font-black uppercase leading-5 tracking-[0.1em] text-ink">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <HubPanelProgress />

        <div className="mt-10 min-w-0">
          <div className="mb-10 grid gap-5 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10">
            <p className="font-mono text-[0.82rem] font-black uppercase leading-5 tracking-[0.16em] text-hub-ruby">
              entry note
            </p>
            <p className="max-w-[1040px] text-[1.08rem] leading-[1.55] text-ink/68">
              The first chart separates lexical survival from semantic dominance. The wheel sense remains present, but the modern visibility field is led by institutional, transport, and central-place uses.
            </p>
          </div>

          <HubSection
            eyebrow="01 / semantic frequency field"
            title={chart01Data.title}
            intro="Five semantic layers use Ngram proxy-frequency data and strengthened evidence notes to show where hub remains mechanical, where it becomes a place center, and where it becomes a system center."
          >
            <HubChart01SemanticField data={chart01Data} />
          </HubSection>

          <section className="mt-10 grid gap-5 border-t border-ink/60 pt-8 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10">
            <p className="font-mono text-[0.82rem] font-black uppercase leading-5 tracking-[0.16em] text-hub-ruby">
              evidence anchors
            </p>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              {chart01Data.evidence.map((item) => (
                <div key={item.label} className="border border-ink/38 px-3 py-3">
                  <p className="font-mono text-[0.66rem] font-black uppercase tracking-[0.14em] text-hub-space">
                    {item.label}
                  </p>
                  <p className="mt-2 text-[1.65rem] font-black leading-none text-hub-amethyst">
                    {item.value}
                  </p>
                  <p className="mt-3 text-[0.86rem] leading-5 text-ink/68">
                    {item.note}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-10 grid gap-5 border-t border-ink/60 pb-12 pt-8 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10">
            <p className="font-mono text-[0.82rem] font-black uppercase leading-5 tracking-[0.16em] text-hub-ruby">
              data cautions
            </p>
            <ul className="grid gap-2 text-[0.96rem] leading-6 text-ink/68 md:grid-cols-2">
              {chart01Data.cautions.map((caution) => (
                <li key={caution} className="border-l border-hub-ruby/80 pl-3">
                  {caution}
                </li>
              ))}
            </ul>
          </section>

          <HubSection
            eyebrow="02 / transfer model"
            title={chart02Data.title}
            intro="A flat transfer diagram follows selected routing terms from transport and logistics inputs into the hub-and-spoke model, then outward into communication and network extensions."
          >
            <HubChart02TransferModel data={chart02Data} />
          </HubSection>

          <div className="border-t border-ink/70 pb-12 pt-8">
            <div className="flex flex-wrap gap-4 font-mono text-[0.8rem] font-black uppercase tracking-[0.13em]">
              <Link href="/" className="border-b border-ink pb-1 text-ink transition hover:border-hub-teal hover:text-hub-blue">
                Back home
              </Link>
              <Link href="/about" className="border-b border-ink pb-1 text-ink transition hover:border-hub-teal hover:text-hub-blue">
                About methodology
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
