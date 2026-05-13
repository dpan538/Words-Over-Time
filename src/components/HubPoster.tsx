import Link from "next/link";
import type { ReactNode } from "react";
import { HubChart01SemanticField, type HubChart01FieldData, type HubChart01Layer, type HubChart01PeriodSignal, type HubChart01Query } from "@/components/hub/HubChart01SemanticField";
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
    accentColor: "#0D0630",
  },
  {
    id: "central_place",
    layerNumber: "Layer 2",
    label: "Central Place Hub",
    semanticGroups: ["central_place"],
    periodHint: "1850s metaphor layer",
    summary: "The word expands from a physical center toward activity, commerce, city, and social center phrases.",
    color: "#E6F9AF",
    accentColor: "#852736",
  },
  {
    id: "transport_routing",
    layerNumber: "Layer 3",
    label: "Transport / Routing Hub",
    semanticGroups: ["transport_routing"],
    periodHint: "route and transfer model",
    summary: "Transport and hub-and-spoke phrases make hub visible as a routing structure for people, goods, and movement.",
    color: "#8BBEB2",
    accentColor: "#0D0630",
  },
  {
    id: "network_system",
    layerNumber: "Layer 4",
    label: "Network / System Hub",
    semanticGroups: ["network_system"],
    periodHint: "technical node model",
    summary: "Communication, computing, Ethernet, USB, and network phrases keep the central-node logic technical and device-adjacent.",
    color: "#E6F9AF",
    accentColor: "#0D0630",
  },
  {
    id: "institutional_digital",
    layerNumber: "Layer 5",
    label: "Institutional / Digital Hub",
    semanticGroups: ["institutional_cluster", "digital_platform"],
    periodHint: "modern visible center",
    summary: "Business, research, knowledge, digital, content, and data phrases make hub a modern access point and institutional concentration.",
    color: "#8BBEB2",
    accentColor: "#852736",
  },
];

const hubPanels = [
  { num: "01", label: "Semantic Frequency Field", color: "#E6F9AF" },
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
