import type { ReactNode } from "react";
import {
  HubChart01SemanticField,
  type HubChart01FieldData,
  type HubChart01Layer,
  type HubChart01PeriodSignal,
  type HubChart01Query,
} from "@/editions/mobile/hub/HubChart01SemanticField";
import {
  HubChart02TransferModel,
  type HubChart02Evidence,
  type HubChart02FlowTerm,
  type HubChart02LayerConfidence,
  type HubChart02RouteStratum,
  type HubChart02TermRole,
  type HubChart02TimelineEvent,
  type HubChart02TransferData,
} from "@/editions/mobile/hub/HubChart02TransferModel";
import {
  HubChart03NamingMachine,
  type HubChart03Family,
  type HubChart03NamingMachineData,
  type HubChart03Node,
  type HubChart03PatternCard,
  type HubChart03SupportType,
} from "@/editions/mobile/hub/HubChart03NamingMachine";
import {
  HubChart04CentralityRebuilt,
  type HubChart04DependencyData,
} from "@/editions/mobile/hub/HubChart04CentralityRebuilt";
import hubChartDataPreviewJson from "@/data/generated/hub_chart_data_preview.json";
import hubChart02RecoveredRoutingTermsJson from "../../../../docs/research/hub/processed/hub_chart02_recovered_routing_terms.json";
import hubChart02RoutingByPeriodJson from "../../../../docs/research/hub/processed/hub_chart02_routing_by_period.json";
import hubChart02TransferModelTimelineJson from "../../../../docs/research/hub/processed/hub_chart02_transfer_model_timeline.json";
import hubChart03NamingByPeriodJson from "../../../../docs/research/hub/processed/hub_chart03_naming_by_period.json";
import hubChart03NamingPatternsJson from "../../../../docs/research/hub/processed/hub_chart03_naming_patterns.json";
import hubChart04ModifierDominanceTermsJson from "../../../../docs/research/hub/processed/hub_chart04_modifier_dominance_terms.json";
import hubChart04NarrativeSupportMatrixJson from "../../../../docs/research/hub/processed/hub_chart04_narrative_support_matrix.json";
import hubChart04SemanticDependencyIndexJson from "../../../../docs/research/hub/processed/hub_chart04_semantic_dependency_index.json";

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
  chart03_naming_layer?: Chart03NamingLayer;
  chart04_dependency_layer?: Chart04DependencyLayer;
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

type Chart02RecoveredTermsFile = {
  terms: Chart02RecoveredTerm[];
};

type Chart02RoutingByPeriodRow = {
  period_id: string;
  period_label: string;
  routing_layer: string;
  routing_layer_label: string;
  active_query_count: number;
  routing_visibility_status: string;
  data_quality: string;
  dominant_terms: {
    term: string;
    mean_frequency_per_million: number;
  }[];
};

type Chart02RoutingByPeriodFile = {
  rows: Chart02RoutingByPeriodRow[];
};

type Chart02TimelineEventFile = {
  events: {
    event_id: string;
    year: number | string;
    label: string;
    routing_layer: string;
    term: string;
    description: string;
    confidence: "high" | "medium" | "low";
    notes: string;
  }[];
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

type Chart03RepresentativeTerm = {
  term: string;
  naming_pattern: string;
  object_type: string;
  frequency_signal_strength: string;
  first_visible_period: string;
  peak_period: string;
};

type Chart03BrandExample = {
  name: string;
  object_type: string;
  hub_position: string;
  naming_function: string;
  include_in_chart: boolean;
  sensitivity_or_caution?: string;
  notes?: string;
};

type Chart03InstitutionalExample = {
  term: string;
  institution_or_source: string;
  object_type: string;
  context_summary: string;
  supports_naming_claim: boolean;
  confidence: "high" | "medium" | "low";
};

type Chart03NamingLayer = {
  metadata: {
    generated_at: string;
  };
  representative_terms: Chart03RepresentativeTerm[];
  brand_platform_inventory: Chart03BrandExample[];
  institutional_access_examples: Chart03InstitutionalExample[];
  hypothesis_evaluation: {
    verdict: string;
    strongest_pattern: string;
    recommended_chart03_focus: string;
  };
  recommended_chart_inputs: {
    main_patterns: string[];
    main_terms: string[];
    supporting_terms: string[];
    brand_examples: string[];
    institutional_examples: {
      term: string;
      institution_or_source: string;
      object_type: string;
    }[];
    annotation_terms: string[];
    exclude_terms: string[];
  };
  data_cautions: string[];
};

type Chart03PatternRecord = {
  pattern_id: string;
  label: string;
  frequency_support: string;
  search_visibility_support: string;
  recommended_chart_role: string;
  confidence: "high" | "medium" | "low";
  representative_examples: string[];
};

type Chart03NamingPatternsFile = {
  patterns: Chart03PatternRecord[];
};

type Chart03NamingByPeriodRow = {
  period_id: string;
  period_label: string;
  naming_pattern: string;
  active_terms: string[];
  new_or_emerging_terms: string[];
  search_visibility_status: string;
  data_quality: string;
};

type Chart03NamingByPeriodFile = {
  periods: Chart03NamingByPeriodRow[];
};

type Chart04DependencyLayer = {
  metadata: {
    working_title: string;
    narrative_direction: string;
  };
  semantic_dependency_index: {
    record_count: number;
    dependency_class_counts: Record<string, number>;
    dependency_tier_counts: Record<string, number>;
    object_type_count: number;
    object_type_counts: Record<string, number>;
    interpretive_note: string;
  };
  narrative_support_matrix: {
    summary: {
      overall_verdict: string;
      high_dependency_terms: number;
      medium_dependency_terms: number;
      brand_platform_examples: number;
      institutional_examples: number;
      object_type_diversity_count: number;
    };
    recommended_chart04_focus: string;
    do_not_claim: string[];
  };
  recommended_visual_inputs: {
    main_terms: string[];
    comparison_terms: string[];
    brand_or_platform_examples: string[];
    cautions: string[];
  };
};

type Chart04SemanticDependencyIndexFile = {
  summary: {
    dependency_tier_counts: Record<string, number>;
    object_type_counts: Record<string, number>;
    interpretive_note: string;
  };
};

type Chart04ModifierDominanceTermsFile = {
  form_groups: {
    label: string;
    term_count: number;
    mean_dependency_score: number;
    terms: string[];
  }[];
};

type Chart04NarrativeSupportMatrixFile = {
  claims: {
    claim: string;
    support_status: string;
    confidence: string;
    caution: string;
  }[];
  do_not_claim: string[];
};

const preview = hubChartDataPreviewJson as HubChartPreview;
const chart02RecoveredTerms = hubChart02RecoveredRoutingTermsJson as Chart02RecoveredTermsFile;
const chart02RoutingByPeriod = hubChart02RoutingByPeriodJson as Chart02RoutingByPeriodFile;
const chart02TransferTimeline = hubChart02TransferModelTimelineJson as Chart02TimelineEventFile;
const chart03NamingPatterns = hubChart03NamingPatternsJson as Chart03NamingPatternsFile;
const chart03NamingByPeriod = hubChart03NamingByPeriodJson as Chart03NamingByPeriodFile;
const chart04ModifierDominanceTerms = hubChart04ModifierDominanceTermsJson as Chart04ModifierDominanceTermsFile;
const chart04NarrativeSupportMatrix = hubChart04NarrativeSupportMatrixJson as Chart04NarrativeSupportMatrixFile;
const chart04SemanticDependencyIndex = hubChart04SemanticDependencyIndexJson as Chart04SemanticDependencyIndexFile;

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
  { num: "03", label: "Naming Machine", color: "#8BBEB2" },
  { num: "04", label: "Stable Format", color: "#852736" },
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

function chart02StratumRoleLabel(role: string) {
  if (role === "core_model") return "core model";
  if (role === "main_series") return "main series";
  if (role === "supporting") return "supporting";
  if (role === "annotation") return "annotation";
  if (role === "exclude") return "exclude";
  return role.replaceAll("_", " ");
}

function firstVisibleChart02Row(rows: Chart02RoutingByPeriodRow[]) {
  return rows.find((row) => row.active_query_count > 0 && row.routing_visibility_status !== "absent");
}

function modernChart02Row(rows: Chart02RoutingByPeriodRow[]) {
  return rows[rows.length - 1] ?? rows[0];
}

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
      routeStrata: [],
      timeline: [],
      roleCounts: {
        main_model: 0,
        main_series: 0,
        supporting: 0,
        annotation: 0,
      },
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
    const term =
      chart02RecoveredTerms.terms.find((item) => item.term.toLowerCase() === plan.term.toLowerCase()) ??
      findChart02Term(recovery, plan.term);
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
  const routeStrata: HubChart02RouteStratum[] = recovery.model_confidence.routing_layers.map((layer) => {
    const rows = chart02RoutingByPeriod.rows.filter((row) => row.routing_layer === layer.routing_layer);
    const firstVisible = firstVisibleChart02Row(rows);
    const modern = modernChart02Row(rows);
    const dominantTerm =
      modern?.dominant_terms[0]?.term ??
      firstVisible?.dominant_terms[0]?.term ??
      recovery.model_confidence.core_model_status.main_model_terms.find((term) => layer.routing_layer === "hub_and_spoke_model") ??
      "no stable dominant term";
    return {
      routingLayer: layer.routing_layer,
      label: modern?.routing_layer_label ?? chart02LayerLabels[layer.routing_layer] ?? layer.routing_layer,
      firstVisiblePeriod: firstVisible?.period_label ?? "not recovered",
      modernStatus: modern?.routing_visibility_status ?? "unknown",
      dominantTerm,
      role: chart02StratumRoleLabel(layer.recommended_role),
      confidence: layer.confidence,
    };
  });

  const timeline: HubChart02TimelineEvent[] = chart02TransferTimeline.events
    .sort((a, b) => Number(a.year) - Number(b.year))
    .slice(0, 6)
    .map((event) => ({
      year: String(event.year),
      label: event.label,
      routingLayer: event.routing_layer,
      term: event.term,
      confidence: event.confidence,
      note: event.description || event.notes,
    }));

  const roleCounts: Record<HubChart02TermRole, number> = {
    main_model: recovery.model_confidence.terms_to_use.main_model.length,
    main_series: recovery.model_confidence.terms_to_use.main_series.length,
    supporting: recovery.model_confidence.terms_to_use.supporting.length,
    annotation: recovery.model_confidence.terms_to_use.annotation.length,
  };

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
    routeStrata,
    timeline,
    roleCounts,
    cautions: [
      "Flow width maps recommended data role, not exact traffic volume.",
      "Ngram values are printed-book frequency proxies and do not prove first historical attestation.",
      "Expanded hub-and-spoke variants remain gap-limited; the chart uses the stronger core terms.",
      "Regional, global, and institutional hub terms are kept out of the main routing flow unless context shows transfer.",
      "Early routing evidence is sparser than modern routing evidence.",
    ],
  };
}

const chart03FamilySpecs: {
  id: string;
  label: string;
  color: string;
  angle: number;
  importance: number;
  reach: number;
  terms: {
    term: string;
    role: HubChart03Node["role"];
    alwaysLabel?: boolean;
  }[];
}[] = [
  {
    id: "institutional_campus",
    label: "Institutional / Campus",
    color: "#8BBEB2",
    angle: 210,
    importance: 0.95,
    reach: 330,
    terms: [
      { term: "student hub", role: "primary", alwaysLabel: true },
      { term: "learning hub", role: "secondary", alwaysLabel: true },
      { term: "resource hub", role: "secondary" },
      { term: "media hub", role: "tertiary" },
      { term: "service hub", role: "tertiary" },
      { term: "education hub", role: "secondary" },
      { term: "innovation hub", role: "secondary" },
      { term: "equipment hub", role: "tertiary" },
      { term: "career hub", role: "tertiary" },
    ],
  },
  {
    id: "platform_brand",
    label: "Platform / Brand",
    color: "#414B9E",
    angle: 320,
    importance: 0.68,
    reach: 308,
    terms: [
      { term: "GitHub", role: "primary", alwaysLabel: true },
      { term: "Docker Hub", role: "secondary", alwaysLabel: true },
      { term: "HubSpot", role: "secondary" },
      { term: "Sci-Hub", role: "tertiary" },
      { term: "Pornhub", role: "tertiary" },
      { term: "HubPages", role: "tertiary" },
      { term: "Hugging Face Hub", role: "tertiary" },
    ],
  },
  {
    id: "content_knowledge",
    label: "Content / Knowledge",
    color: "#FBB728",
    angle: 28,
    importance: 0.82,
    reach: 335,
    terms: [
      { term: "content hub", role: "primary", alwaysLabel: true },
      { term: "knowledge hub", role: "secondary", alwaysLabel: true },
      { term: "documentation hub", role: "tertiary" },
      { term: "resource hub", role: "secondary" },
      { term: "digital hub", role: "secondary" },
      { term: "online hub", role: "tertiary" },
      { term: "hub site", role: "tertiary" },
      { term: "hub page", role: "tertiary" },
    ],
  },
  {
    id: "technical_system",
    label: "Technical / System",
    color: "#852736",
    angle: 108,
    importance: 0.78,
    reach: 315,
    terms: [
      { term: "data hub", role: "primary", alwaysLabel: true },
      { term: "network hub", role: "secondary", alwaysLabel: true },
      { term: "API hub", role: "secondary" },
      { term: "integration hub", role: "tertiary" },
      { term: "hub node", role: "tertiary" },
      { term: "USB hub", role: "secondary" },
      { term: "Ethernet hub", role: "secondary" },
      { term: "switching hub", role: "tertiary" },
      { term: "hub network", role: "tertiary" },
    ],
  },
  {
    id: "community_place",
    label: "Community / Place",
    color: "#18314F",
    angle: 178,
    importance: 0.62,
    reach: 286,
    terms: [
      { term: "community hub", role: "primary", alwaysLabel: true },
      { term: "creative hub", role: "secondary", alwaysLabel: true },
      { term: "maker hub", role: "tertiary" },
      { term: "campus hub", role: "tertiary" },
      { term: "hub city", role: "secondary" },
      { term: "business hub", role: "secondary" },
      { term: "financial hub", role: "tertiary" },
    ],
  },
];

function chart03ObjectType(
  layer: Chart03NamingLayer,
  term: string,
) {
  const lower = term.toLowerCase();
  return (
    layer.representative_terms.find((item) => item.term.toLowerCase() === lower)?.object_type ??
    layer.brand_platform_inventory.find((item) => item.name.toLowerCase() === lower)?.object_type ??
    layer.institutional_access_examples.find((item) => item.term.toLowerCase() === lower)?.object_type ??
    "naming_example"
  );
}

function chart03SupportType(
  layer: Chart03NamingLayer,
  term: string,
): HubChart03SupportType {
  const lower = term.toLowerCase();
  const representative = layer.representative_terms.find((item) => item.term.toLowerCase() === lower);
  const brand = layer.brand_platform_inventory.find((item) => item.name.toLowerCase() === lower);
  const institutional = layer.institutional_access_examples.find((item) => item.term.toLowerCase() === lower);
  if (brand) return "brand/platform example";
  if (institutional) return "institutional example";
  if (representative?.frequency_signal_strength === "strong" || representative?.frequency_signal_strength === "usable") {
    return "frequency-supported";
  }
  if (layer.recommended_chart_inputs.annotation_terms.some((item) => item.toLowerCase() === lower)) {
    return "search-visible";
  }
  return "sparse or caution";
}

function chart03NodeNote(
  layer: Chart03NamingLayer,
  term: string,
  supportType: HubChart03SupportType,
) {
  const lower = term.toLowerCase();
  const representative = layer.representative_terms.find((item) => item.term.toLowerCase() === lower);
  const brand = layer.brand_platform_inventory.find((item) => item.name.toLowerCase() === lower);
  const institutional = layer.institutional_access_examples.find((item) => item.term.toLowerCase() === lower);
  if (brand) {
    const caution = brand.sensitivity_or_caution ? ` ${brand.sensitivity_or_caution}` : "";
    return `${brand.name} is used as a ${brand.hub_position.replaceAll("_", " ")} platform/brand example; it is not treated as ordinary lexical frequency.${caution}`;
  }
  if (institutional) {
    return `${term} appears as a public institutional access example: ${institutional.context_summary}`;
  }
  if (representative) {
    const peak = representative.peak_period ? ` Peak proxy period: ${representative.peak_period.replaceAll("_", " ")}.` : "";
    return `${term} is ${supportType}; object type ${representative.object_type.replaceAll("_", " ")}.${peak}`;
  }
  return `${term} is retained as a cautious naming example; it should not carry a major frequency claim.`;
}

function chart03PatternModernStatus(rows: Chart03NamingByPeriodRow[]) {
  const modern = rows[rows.length - 1];
  if (!modern) return "untracked";
  if (modern.active_terms.length > 0) {
    return `${modern.active_terms.length} active terms / ${modern.search_visibility_status.replaceAll("_", " ")}`;
  }
  return modern.search_visibility_status.replaceAll("_", " ");
}

function buildHubChart03Data(): HubChart03NamingMachineData {
  const layer = preview.chart03_naming_layer;

  if (!layer) {
    return {
      title: "What Goes Around Hub",
      subtitle: "Chart 03 naming data is unavailable in the generated hub preview.",
      hypothesisVerdict: "missing",
      strongestPattern: "unknown",
      focus: "No Chart 03 naming layer was found.",
      sourceSummary: "Missing Chart 03 naming layer.",
      families: [],
      patterns: [],
      cautions: ["Chart 03 naming data was not found in the generated preview file."],
    };
  }

  const families: HubChart03Family[] = chart03FamilySpecs.map((family) => {
    const nodes = family.terms.map((item): HubChart03Node => {
      const supportType = chart03SupportType(layer, item.term);
      return {
        term: item.term,
        objectType: chart03ObjectType(layer, item.term),
        supportType,
        role: item.role,
        alwaysLabel: item.alwaysLabel,
        note: chart03NodeNote(layer, item.term, supportType),
      };
    });
    return {
      id: family.id,
      label: family.label,
      color: family.color,
      angle: family.angle,
      importance: family.importance,
      reach: family.reach,
      supportSummary:
        family.id === "platform_brand"
          ? "Brand and platform examples show hub as a modern naming material, but they are kept secondary and separate from lexical frequency."
          : family.id === "institutional_campus"
            ? "Public campus and service examples support hub as a room, portal, and student-service access name."
            : family.id === "content_knowledge"
              ? "Content, knowledge, documentation, and resource terms show hub as a collection or access surface."
              : family.id === "technical_system"
                ? "Technical terms keep hub as a node, connector, integration point, or system modifier."
                : "Community and place terms show hub as a social or local access-point label, often needing context.",
      nodes,
    };
  });

  const patterns: HubChart03PatternCard[] = chart03NamingPatterns.patterns.map((pattern) => {
    const rows = chart03NamingByPeriod.periods.filter((row) => row.naming_pattern === pattern.pattern_id);
    const firstActive = rows.find((row) => row.active_terms.length > 0);
    return {
      patternId: pattern.pattern_id,
      label: pattern.label,
      frequencySupport: pattern.frequency_support,
      searchVisibilitySupport: pattern.search_visibility_support,
      chartRole: pattern.recommended_chart_role,
      confidence: pattern.confidence,
      firstActivePeriod: firstActive?.period_label ?? "search-visible only",
      modernStatus: chart03PatternModernStatus(rows),
      examples: pattern.representative_examples.slice(0, 4),
    };
  });

  return {
    title: "What Goes Around Hub",
    subtitle: "Hub became a modern naming shortcut: put a domain before it, and that domain starts to sound like a place of access, service, aggregation, or coordination.",
    hypothesisVerdict: layer.hypothesis_evaluation.verdict,
    strongestPattern: layer.hypothesis_evaluation.strongest_pattern.replaceAll("_", " "),
    focus: layer.hypothesis_evaluation.recommended_chart03_focus,
    sourceSummary: "Hub Chart 03 naming layer: representative terms, institutional examples, brand/platform inventory, and hypothesis evaluation.",
    families,
    patterns,
    cautions: layer.data_cautions,
  };
}

function buildHubChart04Data(): HubChart04DependencyData {
  const layer = preview.chart04_dependency_layer;

  if (!layer) {
    return {
      title: "Centrality Rebuilt",
      subtitle: "Chart 04 dependency data is unavailable in the generated hub preview.",
      recordCount: 0,
      highDependencyTerms: 0,
      mediumDependencyTerms: 0,
      objectTypeDiversityCount: 0,
      brandPlatformExamples: 0,
      institutionalExamples: 0,
      verdict: "missing",
      mainTerms: [],
      comparisonTerms: [],
      dependencyTiers: [],
      objectSpectrum: [],
      formGroups: [],
      boundaryClaims: [],
      interpretiveNote: "No dependency index was found for Chart 04.",
      cautions: ["Chart 04 dependency data was not found in the generated preview file."],
    };
  }

  const summary = layer.narrative_support_matrix.summary;
  const tierNotes: Record<string, string> = {
    high_dependency: "Modifier or domain word supplies most of the object meaning.",
    medium_dependency: "Hub still needs modifier support, but the object category is somewhat more legible.",
    contextual_dependency: "Meaning depends on phrase context rather than a single object class.",
    low_dependency: "Headword can stand more independently as a lexical background form.",
  };
  const dependencyTiers = Object.entries(chart04SemanticDependencyIndex.summary.dependency_tier_counts)
    .map(([id, count]) => ({
      id,
      label: id.replaceAll("_", " "),
      count,
      note: tierNotes[id] ?? "Dependency note unavailable.",
    }))
    .sort((a, b) => b.count - a.count);

  const objectSpectrum = Object.entries(chart04SemanticDependencyIndex.summary.object_type_counts)
    .map(([objectType, count]) => ({ objectType, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const formGroups = chart04ModifierDominanceTerms.form_groups
    .sort((a, b) => b.term_count - a.term_count)
    .slice(0, 6)
    .map((group) => ({
      label: group.label,
      termCount: group.term_count,
      meanDependencyScore: group.mean_dependency_score,
      exampleTerms: group.terms.slice(0, 3),
    }));

  return {
    title: layer.metadata.working_title || "Centrality Rebuilt",
    subtitle: "Hub stays stable as a naming format while the attached domain word increasingly supplies the object.",
    recordCount: layer.semantic_dependency_index.record_count,
    highDependencyTerms: summary.high_dependency_terms,
    mediumDependencyTerms: summary.medium_dependency_terms,
    objectTypeDiversityCount: summary.object_type_diversity_count,
    brandPlatformExamples: summary.brand_platform_examples,
    institutionalExamples: summary.institutional_examples,
    verdict: summary.overall_verdict,
    mainTerms: layer.recommended_visual_inputs.main_terms,
    comparisonTerms: layer.recommended_visual_inputs.comparison_terms,
    dependencyTiers,
    objectSpectrum,
    formGroups,
    boundaryClaims: chart04NarrativeSupportMatrix.do_not_claim,
    interpretiveNote: chart04SemanticDependencyIndex.summary.interpretive_note,
    cautions: layer.recommended_visual_inputs.cautions,
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
          <div className="border-r border-ink/60 px-3 py-3 font-mono text-[0.92rem] font-black uppercase tracking-[0.16em] text-hub-ruby">
            {panel.num}
          </div>
          <div className="px-3 py-3 font-mono text-[0.92rem] font-black uppercase leading-5 tracking-[0.12em] text-ink">
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
        <p className="font-mono text-[1.04rem] font-black uppercase leading-5 tracking-[0.16em] text-hub-ruby">
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

function HubChart35MinorHubBranch({
  chart03Data,
  chart04Data,
}: {
  chart03Data: HubChart03NamingMachineData;
  chart04Data: HubChart04DependencyData;
}) {
  const familyTerms = (familyId: string, fallback: string[]) => {
    const family = chart03Data.families.find((item) => item.id === familyId);
    const terms = family?.nodes.map((node) => node.term).filter(Boolean) ?? [];
    return (terms.length ? terms : fallback).slice(0, 4);
  };

  const branchCards = [
    {
      id: "room_service",
      kicker: "Public service",
      title: "Room, Desk, Portal",
      month: "minor hub",
      year: "campus",
      color: "#8BBEB2",
      ink: "#102D50",
      metricValue: `${chart04Data.institutionalExamples}`,
      metricLabel: "examples",
      terms: familyTerms("institutional_campus", ["student hub", "learning hub", "resource hub", "media hub"]),
      note: "A hub can be a place to collect equipment, advice, forms, help, or student services.",
    },
    {
      id: "platform_shell",
      kicker: "Platform shell",
      title: "Named Surface",
      month: "web",
      year: "brand",
      color: "#414B9E",
      ink: "#050510",
      metricValue: `${chart04Data.brandPlatformExamples}`,
      metricLabel: "examples",
      terms: familyTerms("platform_brand", ["GitHub", "Docker Hub", "HubSpot", "Sci-Hub"]).filter(
        (term) => term.toLowerCase() !== "pornhub",
      ),
      note: "The attached name does the identifying work; hub supplies a reusable platform shape.",
    },
    {
      id: "resource_field",
      kicker: "Resource field",
      title: "Collected Access",
      month: "files",
      year: "knowledge",
      color: "#F8B72A",
      ink: "#852736",
      metricValue: "3",
      metricLabel: "examples",
      terms: familyTerms("content_knowledge", ["content hub", "knowledge hub", "documentation hub", "resource hub"]),
      note: "Content, knowledge, and resources become easier to name when hub acts as an access container.",
    },
    {
      id: "technical_handle",
      kicker: "System handle",
      title: "Connective Object",
      month: "node",
      year: "system",
      color: "#852736",
      ink: "#2357D7",
      metricValue: `${chart04Data.objectTypeDiversityCount}`,
      metricLabel: "object types",
      terms: familyTerms("technical_system", ["data hub", "network hub", "API hub", "USB hub"]),
      note: "Technical hubs keep the old central-node logic, but the object is specified by data, network, API, or device.",
    },
  ];

  return (
    <section className="my-16 border-y border-ink/70 py-8">
      <div className="mb-6 grid gap-4 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10">
        <p className="font-mono text-[1.08rem] font-black uppercase leading-6 tracking-[0.16em] text-hub-ruby">
          03.5 / minor hub branch
        </p>
        <div>
          <h2 className="text-[clamp(1.2rem,2vw,1.9rem)] font-black leading-none text-ink">
            Small Hubs, Specific Worlds
          </h2>
          <p className="mt-2 max-w-4xl text-[1.05rem] leading-6 text-ink/68">
            A small branch for less canonical hub uses: rooms, portals, brands, resource surfaces, and technical handles.
          </p>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {branchCards.map((card, index) => (
          <article
            key={card.id}
            className="group relative min-h-[38.5rem] overflow-hidden border-2 border-ink bg-[#f7efdc] transition duration-500 hover:-translate-y-1 focus-within:-translate-y-1"
          >
            <div className="absolute left-0 top-0 z-20 h-1 w-full" style={{ backgroundColor: card.color }} />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_16%,rgba(255,255,255,0.85),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.38),transparent_42%)] opacity-70" />
            <div className="absolute inset-0 opacity-[0.16] [background-image:radial-gradient(circle,#050510_0.7px,transparent_0.7px)] [background-size:4px_4px]" />
            <div
              className="pointer-events-none absolute inset-0 opacity-0 backdrop-blur-[2px] transition duration-500 group-hover:opacity-100 group-focus-within:opacity-100"
              style={{
                background: `radial-gradient(circle at 50% 42%, ${card.color}34, rgba(255,255,255,0.2) 34%, transparent 70%)`,
              }}
            />

            <div className="relative z-10 grid grid-cols-[4.1rem_1fr_3.5rem] border-b border-ink/70 px-4 pb-4 pt-5 font-mono text-[0.7rem] font-black uppercase leading-3 tracking-[0.06em] text-hub-navy">
              <p className="text-hub-ruby">WOT</p>
              <p className="text-center">
                {card.kicker}
              </p>
              <p className="text-right text-hub-ruby">
                {card.month}
              </p>
            </div>

            <div className="relative z-10 min-h-[7.75rem] px-4 pt-4">
              <p className="font-mono text-[0.72rem] font-black uppercase leading-3 tracking-[0.08em]" style={{ color: card.color }}>
                Hub appendix / {card.year}
              </p>
              <h3 className="mt-2 max-w-[13rem] text-[1.62rem] font-black leading-[0.95] tracking-normal" style={{ color: card.color }}>
                {card.title}
              </h3>
            </div>

            <svg className="absolute inset-x-0 bottom-[11.35rem] h-[22rem] w-full" viewBox="0 0 260 320" role="img" aria-label={`${card.title} visual pattern`}>
              <defs>
                <linearGradient id={`hub-branch-grad-${card.id}`} x1="0" x2="1" y1="0" y2="1">
                  <stop offset="0%" stopColor={card.color} stopOpacity="0.96" />
                  <stop offset="100%" stopColor={card.ink} stopOpacity="0.7" />
                </linearGradient>
                <filter id={`hub-branch-soft-${card.id}`}>
                  <feGaussianBlur stdDeviation="0.8" />
                </filter>
              </defs>

              {index === 0 && (
                <g transform="translate(0 18)">
                  <path
                    d="M 42 230 C 74 196, 96 156, 130 156 C 164 156, 186 196, 218 230"
                    fill="none"
                    stroke={card.color}
                    strokeLinecap="round"
                    strokeWidth="28"
                    opacity="0.12"
                  />
                  <path
                    d="M 130 52 L 130 258"
                    fill="none"
                    stroke={card.ink}
                    strokeDasharray="2 8"
                    strokeLinecap="round"
                    strokeWidth="0.9"
                    opacity="0.18"
                  />
                  {Array.from({ length: 8 }).map((_, i) => {
                    const y = 82 + i * 18;
                    const valley = 8 + i * 6.2;
                    const color = i % 3 === 0 ? card.color : card.ink;
                    return (
                      <path
                        key={`campus-channel-${i}`}
                        d={`M 54 ${y} C 80 ${y + valley}, 102 ${y + valley + 7}, 130 ${y + valley + 7} C 158 ${y + valley + 7}, 180 ${y + valley}, 206 ${y}`}
                        fill="none"
                        stroke={color}
                        strokeLinecap="round"
                        strokeWidth={i === 3 ? 2.2 : 1.35}
                        opacity={i === 3 ? 0.74 : 0.46}
                      />
                    );
                  })}
                  {Array.from({ length: 7 }).map((_, i) => {
                    const y = 54 + i * 31.5;
                    const r = 3.6 + i * 1.35;
                    return (
                      <g key={`campus-drop-${i}`}>
                        <circle cx="130" cy={y} r={r + 6} fill={card.color} opacity="0.03">
                          <animate
                            attributeName="opacity"
                            begin={`${i * 0.32}s`}
                            dur="5.8s"
                            repeatCount="indefinite"
                            values="0.01;0.22;0.1;0.01"
                            keyTimes="0;0.2;0.55;1"
                          />
                          <animate
                            attributeName="r"
                            begin={`${i * 0.32}s`}
                            dur="5.8s"
                            repeatCount="indefinite"
                            values={`${r + 2};${r + 11};${r + 6};${r + 2}`}
                            keyTimes="0;0.2;0.55;1"
                          />
                        </circle>
                        <circle cx="130" cy={y} r={r} fill="#F05A2A" opacity="0">
                          <animate
                            attributeName="opacity"
                            begin={`${i * 0.32}s`}
                            dur="5.8s"
                            repeatCount="indefinite"
                            values="0;1;0.55;0"
                            keyTimes="0;0.18;0.58;1"
                          />
                          <animate
                            attributeName="r"
                            begin={`${i * 0.32}s`}
                            dur="5.8s"
                            repeatCount="indefinite"
                            values={`${Math.max(2.4, r - 1.1)};${r + 3.1};${r + 0.2};${Math.max(2.4, r - 1.1)}`}
                            keyTimes="0;0.18;0.58;1"
                          />
                        </circle>
                        <circle cx="130" cy={y} r={r + 12} fill="none" stroke="#F05A2A" strokeWidth="0.7" opacity="0">
                          <animate
                            attributeName="opacity"
                            begin={`${i * 0.32}s`}
                            dur="5.8s"
                            repeatCount="indefinite"
                            values="0;0.28;0.05;0"
                            keyTimes="0;0.2;0.6;1"
                          />
                          <animate
                            attributeName="r"
                            begin={`${i * 0.32}s`}
                            dur="5.8s"
                            repeatCount="indefinite"
                            values={`${r + 5};${r + 17};${r + 12};${r + 5}`}
                            keyTimes="0;0.2;0.6;1"
                          />
                        </circle>
                      </g>
                    );
                  })}
                </g>
              )}

              {index === 1 && (
                <g transform="translate(130 154)">
                  <circle r="96" fill={card.color} opacity="0.045" />
                  {[
                    { r: 94, w: 4.3, dash: "176 86 40 54", color: card.ink, opacity: 0.9, dur: 22, start: 8 },
                    { r: 80, w: 4.05, dash: "132 60 50 42", color: card.color, opacity: 0.78, dur: 18, start: 48 },
                    { r: 66, w: 3.75, dash: "98 50 40 38", color: card.ink, opacity: 0.76, dur: 25, start: 108 },
                    { r: 52, w: 3.35, dash: "80 42 30 40", color: card.color, opacity: 0.72, dur: 16, start: 168 },
                    { r: 38, w: 3.05, dash: "58 34 28 30", color: card.ink, opacity: 0.72, dur: 20, start: 222 },
                    { r: 24, w: 2.65, dash: "38 28 22 26", color: card.color, opacity: 0.74, dur: 13, start: 292 },
                  ].map((ring, i) => (
                    <circle
                      key={`platform-ring-${i}`}
                      r={ring.r}
                      cx="0"
                      cy="0"
                      fill="none"
                      stroke={ring.color}
                      strokeDasharray={ring.dash}
                      strokeLinecap="butt"
                      strokeWidth={ring.w}
                      opacity={ring.opacity}
                    >
                      <animateTransform
                        attributeName="transform"
                        begin={`${i * 0.12}s`}
                        dur={`${ring.dur}s`}
                        from={`${ring.start} 0 0`}
                        repeatCount="indefinite"
                        to={`${ring.start + (i % 2 === 0 ? 360 : -360)} 0 0`}
                        type="rotate"
                      />
                    </circle>
                  ))}
                  <circle r="8.5" fill="#f7efdc" stroke={card.ink} strokeWidth="1.15" opacity="0.92" />
                  <circle r="4" fill={card.color} opacity="0.92">
                    <animate attributeName="r" dur="4.8s" repeatCount="indefinite" values="3.3;5.4;3.3" />
                    <animate attributeName="opacity" dur="4.8s" repeatCount="indefinite" values="0.74;1;0.74" />
                  </circle>
                </g>
              )}

              {index === 2 && (
                <g>
                  {Array.from({ length: 10 }).map((_, i) => (
                    <rect
                      key={i}
                      x={12 + i * 26}
                      y={92 + (i % 3) * 13}
                      width="15"
                      height={132 - (i % 4) * 14}
                      fill={i % 2 ? card.color : card.ink}
                      opacity={i % 2 ? 0.88 : 0.62}
                    >
                      <animate attributeName="height" dur={`${4.2 + i * 0.18}s`} repeatCount="indefinite" values={`${132 - (i % 4) * 14};${164 - (i % 3) * 9};${132 - (i % 4) * 14}`} />
                      <animate attributeName="y" dur={`${4.2 + i * 0.18}s`} repeatCount="indefinite" values={`${92 + (i % 3) * 13};${76 + (i % 3) * 7};${92 + (i % 3) * 13}`} />
                    </rect>
                  ))}
                  <rect x="0" y="188" width="260" height="18" fill={`url(#hub-branch-grad-${card.id})`} opacity="0.88" />
                  <rect x="0" y="226" width="260" height="8" fill={card.ink} opacity="0.72" />
                </g>
              )}

              {index === 3 && (
                <g transform="translate(30 10)">
                  {Array.from({ length: 12 }).map((_, row) =>
                    Array.from({ length: 12 }).map((__, col) => (
                      <circle
                        key={`${row}-${col}`}
                        cx={col * 17}
                        cy={row * 17 + 36}
                        r={2.2 + ((row + col) % 4) * 0.45}
                        fill={(row + col) % 3 === 0 ? card.color : card.ink}
                        opacity={0.22 + ((row * col) % 8) * 0.08}
                      >
                        <animate attributeName="r" dur={`${3.7 + ((row + col) % 5) * 0.22}s`} repeatCount="indefinite" values={`${2.2 + ((row + col) % 4) * 0.45};${4.8 + ((row + col) % 3) * 0.6};${2.2 + ((row + col) % 4) * 0.45}`} />
                      </circle>
                    )),
                  )}
                  <path d="M 0 230 L 198 230" stroke={card.color} strokeWidth="8" strokeLinecap="round" opacity="0.74" />
                  <path d="M 0 250 L 198 250" stroke={card.ink} strokeWidth="3" strokeLinecap="round" opacity="0.58" />
                </g>
              )}
            </svg>

            <div className="absolute inset-x-0 bottom-0 z-10 h-[11.35rem] border-t border-ink/70 bg-[#f7efdc]/92 px-4 py-4 backdrop-blur-[2px]">
              <div className="grid gap-1">
                <p className="font-mono text-[0.64rem] font-black uppercase leading-3 tracking-[0.11em] text-hub-ruby">
                  sample field
                </p>
                <p className="font-mono text-[0.82rem] font-black uppercase leading-4 tracking-[0.07em] text-hub-navy">
                  <span className="mr-2 inline-block min-w-[1.4rem] text-[1.08rem] leading-none" style={{ color: card.color }}>
                    {card.metricValue}
                  </span>
                  {card.metricLabel}
                </p>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {card.terms.slice(0, 3).map((term) => (
                  <span
                    key={term}
                    className="border border-ink/50 bg-[#f7efdc]/55 px-2 py-1 font-mono text-[0.66rem] font-black uppercase tracking-[0.08em] text-ink"
                  >
                    {term}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-[0.82rem] leading-4 text-ink/78">{card.note}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-7 border-t border-ink/50 pt-5">
        <p className="max-w-6xl text-[1.08rem] leading-7 text-ink/72">
          These smaller cases keep hub from becoming one fixed object. It can mark a room, a platform surface, a
          resource collection, or a technical connector, but the attached word still does most of the specifying work.
        </p>
      </div>
    </section>
  );
}

export function HubPoster() {
  const chart01Data = buildHubChart01Data();
  const chart02Data = buildHubChart02Data();
  const chart03Data = buildHubChart03Data();
  const chart04Data = buildHubChart04Data();
  return (
    <div className="min-h-screen bg-wheat text-ink">
      <div className="mx-auto flex w-full max-w-[1960px] flex-col px-4 py-5 sm:px-7 lg:px-10 xl:px-12">
        <HubPanelProgress />

        <div className="mt-10 min-w-0">
          <div className="mb-10 grid gap-5 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10">
            <p className="font-mono text-[1.04rem] font-black uppercase leading-5 tracking-[0.16em] text-hub-ruby">
              entry note
            </p>
            <p className="max-w-[1040px] text-[1.08rem] leading-[1.55] text-ink/68">
              The first chart separates lexical survival from semantic dominance. The wheel sense remains present, but the modern visibility field is led by institutional, transport, and central-place uses.
            </p>
          </div>

          <span id="origin" className="block scroll-mt-6" aria-hidden="true" />
          <span id="wheel-to-network" className="block scroll-mt-6" aria-hidden="true" />
          <HubSection
            eyebrow="01 / semantic frequency field"
            title={chart01Data.title}
            intro="Five semantic layers use Ngram proxy-frequency data and strengthened evidence notes to show where hub remains mechanical, where it becomes a place center, and where it becomes a system center."
          >
            <HubChart01SemanticField data={chart01Data} />
          </HubSection>

          <section className="mt-10 grid gap-5 border-t border-ink/60 pt-8 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10">
            <p className="font-mono text-[1.04rem] font-black uppercase leading-5 tracking-[0.16em] text-hub-ruby">
              evidence anchors
            </p>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              {chart01Data.evidence.map((item) => (
                <div key={item.label} className="border border-ink/38 px-3 py-3">
                  <p className="font-mono text-[0.84rem] font-black uppercase tracking-[0.14em] text-hub-space">
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
            <p className="font-mono text-[1.04rem] font-black uppercase leading-5 tracking-[0.16em] text-hub-ruby">
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

          <span id="hub-naming-machine" className="block scroll-mt-6" aria-hidden="true" />
          <span id="hub-as-format" className="block scroll-mt-6" aria-hidden="true" />
          <HubSection
            eyebrow="03 / naming machine"
            title={chart03Data.title}
            intro="A radial naming diagram maps hub as a reusable operator: institutional services, platforms, knowledge resources, technical systems, and community places all form around X + hub."
          >
            <HubChart03NamingMachine data={chart03Data} />
          </HubSection>

          <HubChart35MinorHubBranch chart03Data={chart03Data} chart04Data={chart04Data} />

          <span id="hub-dependency" className="block scroll-mt-6" aria-hidden="true" />
          <HubSection
            eyebrow="04 / stable format"
            title={chart04Data.title}
            intro="A heavy pure-color diagram uses the new dependency layer to show hub as a stable naming format rather than a stable single object."
          >
            <HubChart04CentralityRebuilt data={chart04Data} />
          </HubSection>

        </div>
      </div>
    </div>
  );
}
