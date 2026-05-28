"use client";

import { useMemo, useState } from "react";

type PrivacyGeoDemographicRecord = {
  country: string;
  country_code: string;
  region: string | null;
  privacy_signal: {
    record_count: number;
    academic_records: number;
    news_records: number;
    weighted_score: number;
    density_score: number;
    density_class: string;
    peak_year: number | null;
    top_queries: Array<{
      query: string;
      count: number;
    }>;
  };
  demographics: {
    population: number | null;
    population_year: number | null;
    life_expectancy: number | null;
    life_expectancy_year: number | null;
    internet_users_percent: number | null;
    urban_population_percent: number | null;
  };
  derived: {
    population_millions: number | null;
    log_population: number | null;
    privacy_records_per_million: number | null;
    weighted_score_per_million: number | null;
    population_bucket: string | null;
    life_expectancy_bucket: string | null;
    signal_bucket: string | null;
    per_million_signal_bucket: string | null;
    life_expectancy_deviation_from_joined_mean: number | null;
  };
};

type PrivacyGeoDemographicNode = {
  id: string;
  label: string;
  region: string | null;
  population: number;
  life_expectancy: number;
  privacy_signal: number;
  privacy_records_per_million: number;
  visual_weight: number;
};

type PrivacyGeoDemographicEdge = {
  source_country_code: string;
  source_country: string;
  target_country_code: string;
  target_country: string;
  edge_type: string;
  distance: number;
  confidence: string;
  notes: string[];
};

export type PrivacyGeoDemographicContextDataset = {
  word: "privacy";
  layer_id: "geo_demographic_context";
  status: string;
  intended_use: string;
  title: string;
  description: string;
  statistics: {
    country_signal_count: number;
    countries_with_population: number;
    countries_with_life_expectancy: number;
    countries_joined_for_02c: number;
    network_node_count: number;
    context_edge_count: number;
    median_population: number;
    mean_life_expectancy: number;
    median_privacy_records_per_million: number;
  };
  records: PrivacyGeoDemographicRecord[];
  network_nodes: PrivacyGeoDemographicNode[];
  network_edges: PrivacyGeoDemographicEdge[];
  strong_signals: string[];
  limitations: string[];
};

type PrivacyChart02DemographicContextProps = {
  dataset: PrivacyGeoDemographicContextDataset;
};

type PlotNode = PrivacyGeoDemographicNode & {
  x: number;
  y: number;
  size: number;
  color: string;
  record?: PrivacyGeoDemographicRecord;
};

type PlotEdge = PrivacyGeoDemographicEdge & {
  pathD: string;
  source: PlotNode;
  target: PlotNode;
  color: string;
  weight: number;
};

type MicroPoint = {
  id: string;
  x: number;
  y: number;
  size: number;
  color: string;
  opacity: number;
  shape: "circle" | "square";
  delay: number;
};

type Fiber = {
  id: string;
  pathD: string;
  color: string;
  opacity: number;
  width: number;
  duration: number;
  delay: number;
};

type MicroFiber = {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  opacity: number;
  width: number;
};

type MicroFiberPath = {
  id: string;
  color: string;
  d: string;
  opacity: number;
  width: number;
};

const WIDTH = 1840;
const HEIGHT = 1210;
const PLOT = {
  left: 176,
  right: 1696,
  top: 88,
  bottom: 1062,
};
const GRAPH_SCALE = 1;
const GRAPH_CENTER_X = (PLOT.left + PLOT.right) / 2;
const GRAPH_CENTER_Y = (PLOT.top + PLOT.bottom) / 2;
const NODE_FIELD_MARGIN_X = 184;
const NODE_FIELD_MARGIN_Y = 152;
const MICRO_FIELD_MARGIN = 20;

const INK = "#050510";
const GRID = "#686255";
const WARM = "#F27624";

const regionPalette: Record<string, string> = {
  "North America": "#7E42B8",
  "Europe & Central Asia": "#238eaa",
  "East Asia & Pacific": "#2F8C4B",
  "South Asia": "#DDBE24",
  "Latin America & Caribbean ": "#F27624",
  "Sub-Saharan Africa ": "#C73A2B",
  "Middle East, North Africa, Afghanistan & Pakistan": "#2f7891",
  unknown: "#7c6f5b",
};

const regionOrder: Record<string, number> = {
  "North America": 0,
  "Europe & Central Asia": 1,
  "East Asia & Pacific": 2,
  "South Asia": 3,
  "Latin America & Caribbean ": 4,
  "Sub-Saharan Africa ": 5,
  "Middle East, North Africa, Afghanistan & Pakistan": 6,
  unknown: 7,
};

const stableNoise = (value: string) => {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 33 + value.charCodeAt(index)) % 1000003;
  }
  return hash / 1000003;
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const regionColor = (region: string | null) => regionPalette[region ?? "unknown"] ?? regionPalette.unknown;

const shortRegionLabel = (region: string) => {
  if (region === "Europe & Central Asia") return "Europe + Central Asia";
  if (region === "East Asia & Pacific") return "East Asia + Pacific";
  if (region === "Latin America & Caribbean ") return "Latin America";
  if (region === "Sub-Saharan Africa ") return "Sub-Saharan Africa";
  if (region === "Middle East, North Africa, Afghanistan & Pakistan") return "MENA + Pakistan";
  if (region === "unknown") return "Other recovered";
  return region;
};

const nodeSize = (node: PrivacyGeoDemographicNode) => {
  const signalPart = Math.sqrt(Math.max(0, node.visual_weight)) * 26;
  const perMillionPart = Math.sqrt(Math.max(0, node.privacy_records_per_million)) * 0.34;
  return clamp(7 + signalPart + perMillionPart, 9, 34);
};

const curvePath = (source: PlotNode, target: PlotNode, bendSeed: string, bendScale = 72) => {
  const midX = (source.x + target.x) / 2;
  const midY = (source.y + target.y) / 2;
  const curve = (stableNoise(bendSeed) - 0.5) * bendScale;
  const dx = target.x - source.x;
  const dy = target.y - source.y;
  const length = Math.max(1, Math.hypot(dx, dy));
  const normalX = (-dy / length) * curve;
  const normalY = (dx / length) * curve;
  return `M ${source.x.toFixed(1)} ${source.y.toFixed(1)} Q ${(midX + normalX).toFixed(1)} ${(midY + normalY).toFixed(1)} ${target.x.toFixed(1)} ${target.y.toFixed(1)}`;
};

const formatCount = (value: number) => value.toLocaleString();

const formatMaybe = (value: number | null | undefined, digits = 1) =>
  typeof value === "number" && Number.isFinite(value) ? value.toFixed(digits) : "n/a";

const formatPopulationAxis = (value: number) => {
  if (value >= 1_000_000_000) {
    const billions = value / 1_000_000_000;
    return `${billions >= 10 ? billions.toFixed(0) : billions.toFixed(1)}B people`;
  }
  if (value >= 1_000_000) {
    const millions = value / 1_000_000;
    return `${millions >= 100 ? millions.toFixed(0) : millions.toFixed(1)}M people`;
  }
  return `${Math.round(value / 1000)}K people`;
};

export function PrivacyChart02DemographicContext({ dataset }: PrivacyChart02DemographicContextProps) {
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  const { plotNodes, plotEdges, meshFibers, microFibers, microPoints, meanLifeY, lifeTicks, populationTicks } = useMemo(() => {
    const nodes = dataset.network_nodes.filter(
      (node) => Number.isFinite(node.population) && Number.isFinite(node.life_expectancy),
    );
    const logPops = nodes.map((node) => Math.log10(node.population));
    const lives = nodes.map((node) => node.life_expectancy);
    const minLog = Math.min(...logPops);
    const maxLog = Math.max(...logPops);
    const minLife = Math.min(...lives);
    const maxLife = Math.max(...lives);
    const recordsByCode = new Map(dataset.records.map((record) => [record.country_code, record]));
    const rankedByLife = [...nodes].sort(
      (a, b) => a.life_expectancy - b.life_expectancy || a.population - b.population,
    );
    const rankById = new Map(rankedByLife.map((node, index) => [node.id, index]));
    const lifeBandwidth = 1.55;
    const densityById = new Map(
      nodes.map((node) => {
        const density = nodes.reduce((sum, peer) => {
          const distance = (node.life_expectancy - peer.life_expectancy) / lifeBandwidth;
          return sum + Math.exp(-0.5 * distance * distance);
        }, 0);
        return [node.id, density];
      }),
    );
    const maxLifeDensity = Math.max(...Array.from(densityById.values()), 1);
    const lifeRankY = (rank: number) => {
      const rankT = (rank + 0.5) / Math.max(1, rankedByLife.length);
      return PLOT.bottom - rankT * (PLOT.bottom - PLOT.top);
    };
    const lifeValueRankY = (value: number) => {
      const lowerCount = rankedByLife.filter((node) => node.life_expectancy <= value).length;
      return lifeRankY(clamp(lowerCount - 0.5, 0, rankedByLife.length - 1));
    };
    const lifeDensityY = (node: PrivacyGeoDemographicNode) => {
      const rank = rankById.get(node.id) ?? 0;
      const rankT = (rank + 0.5) / Math.max(1, rankedByLife.length);
      const density = (densityById.get(node.id) ?? 1) / maxLifeDensity;
      const expandedRankT = clamp(0.05 + rankT * 0.9, 0.04, 0.96);
      const densityLift = (density - 0.5) * 22;
      return PLOT.bottom - expandedRankT * (PLOT.bottom - PLOT.top) + densityLift;
    };

    const plotted = nodes.map<PlotNode>((node) => {
      const logPop = Math.log10(node.population);
      const xT = (logPop - minLog) / Math.max(0.0001, maxLog - minLog);
      const regionIndex = regionOrder[node.region ?? "unknown"] ?? regionOrder.unknown;
      const jitterX = (stableNoise(`${node.id}-demo-x`) - 0.5) * 38;
      const localDensity = (densityById.get(node.id) ?? 1) / maxLifeDensity;
      const jitterY = (stableNoise(`${node.id}-demo-y`) - 0.5) * (46 + localDensity * 94);
      const bandLift = (regionIndex - 3.2) * 10;
      const densityY = lifeDensityY(node);
      const densityWave = Math.sin(xT * Math.PI * 4.6 + regionIndex * 0.85) * (18 + localDensity * 34);
      const localDensitySpread = (stableNoise(`${node.id}-density-lane`) - 0.5) * (34 + localDensity * 86);

      return {
        ...node,
        x: clamp(
          PLOT.left + xT * (PLOT.right - PLOT.left) + jitterX,
          PLOT.left + NODE_FIELD_MARGIN_X,
          PLOT.right - NODE_FIELD_MARGIN_X,
        ),
        y: clamp(
          densityY + densityWave + localDensitySpread + jitterY + bandLift,
          PLOT.top + NODE_FIELD_MARGIN_Y,
          PLOT.bottom - NODE_FIELD_MARGIN_Y,
        ),
        size: nodeSize(node),
        color: regionColor(node.region),
        record: recordsByCode.get(node.id),
      };
    });

    const byId = new Map(plotted.map((node) => [node.id, node]));
    const recoveredEdges = dataset.network_edges.flatMap<PlotEdge>((edge, index) => {
      const source = byId.get(edge.source_country_code);
      const target = byId.get(edge.target_country_code);
      if (!source || !target) return [];
      return [
        {
          ...edge,
          source,
          target,
          pathD: curvePath(source, target, `${edge.source_country_code}-${edge.target_country_code}`, 128),
          color: index % 2 === 0 ? source.color : target.color,
          weight: edge.confidence === "high" ? 1.6 : 1,
        },
      ];
    });

    const grouped = new Map<string, PlotNode[]>();
    plotted.forEach((node) => {
      const key = node.region ?? "unknown";
      const group = grouped.get(key) ?? [];
      group.push(node);
      grouped.set(key, group);
    });

    const fibers: Fiber[] = [];
    grouped.forEach((group, region) => {
      const sorted = [...group].sort((a, b) => a.x - b.x || a.y - b.y);
      sorted.forEach((node, index) => {
        const next = sorted[index + 1];
        const skip = sorted[index + 2];
        if (next) {
          fibers.push({
            id: `${region}-${node.id}-${next.id}`,
            pathD: curvePath(node, next, `${region}-${node.id}-${next.id}`, 48),
            color: regionColor(region),
            opacity: 0.44,
            width: 1.75,
            duration: 13 + stableNoise(`${node.id}-${next.id}-dur`) * 7,
            delay: -stableNoise(`${next.id}-${node.id}-delay`) * 11,
          });
        }
        if (skip && index % 2 === 0) {
          fibers.push({
            id: `${region}-${node.id}-${skip.id}-skip`,
            pathD: curvePath(node, skip, `${region}-${node.id}-${skip.id}-skip`, 90),
            color: regionColor(region),
            opacity: 0.3,
            width: 1.3,
            duration: 16 + stableNoise(`${node.id}-${skip.id}-dur`) * 8,
            delay: -stableNoise(`${skip.id}-${node.id}-delay`) * 12,
          });
        }
      });
    });

    const hubs = [...plotted].sort((a, b) => b.privacy_signal - a.privacy_signal).slice(0, 9);
    hubs.forEach((hub, hubIndex) => {
      plotted
        .filter((node) => node.id !== hub.id)
        .sort((a, b) => {
          const da = Math.hypot(a.x - hub.x, a.y - hub.y);
          const db = Math.hypot(b.x - hub.x, b.y - hub.y);
          return da - db;
        })
        .slice(0, hubIndex < 4 ? 14 : 10)
        .forEach((node, index) => {
          fibers.push({
            id: `hub-${hub.id}-${node.id}-${index}`,
            pathD: curvePath(hub, node, `hub-${hub.id}-${node.id}`, 150),
            color: index % 2 === 0 ? hub.color : node.color,
            opacity: hubIndex < 3 ? 0.4 : 0.28,
            width: hubIndex < 3 ? 1.65 : 1.18,
            duration: 18 + stableNoise(`hub-${hub.id}-${node.id}-dur`) * 10,
            delay: -stableNoise(`hub-${hub.id}-${node.id}-delay`) * 12,
          });
        });
    });

    const points: MicroPoint[] = [];
    const microLines: MicroFiber[] = [];
    plotted.forEach((node) => {
      const signal = node.record?.privacy_signal.record_count ?? node.privacy_signal;
      const count = clamp(Math.round(26 + Math.sqrt(Math.max(1, signal)) * 0.76 + node.visual_weight * 76), 26, 126);
      const nodePoints: MicroPoint[] = [];
      for (let index = 0; index < count; index += 1) {
        const noise = stableNoise(`${node.id}-micro-${index}`);
        const angle = index * 2.399963 + noise * 0.9;
        const radius = Math.sqrt((index + 1) / count) * (node.size * 4.4 + 20 * noise);
        const oval = 0.62 + stableNoise(`${node.id}-oval-${index}`) * 0.52;
        const point = {
          id: `${node.id}-micro-${index}`,
          x: clamp(node.x + Math.cos(angle) * radius, PLOT.left + MICRO_FIELD_MARGIN, PLOT.right - MICRO_FIELD_MARGIN),
          y: clamp(node.y + Math.sin(angle) * radius * oval, PLOT.top + MICRO_FIELD_MARGIN, PLOT.bottom - MICRO_FIELD_MARGIN),
          size: 2.8 + stableNoise(`${node.id}-size-${index}`) * (node.visual_weight > 0.55 ? 7.4 : 4.8),
          color: index % 7 === 0 ? WARM : index % 5 === 0 ? "#DDBE24" : node.color,
          opacity: 0.34 + stableNoise(`${node.id}-op-${index}`) * 0.48,
          shape: index % 6 === 0 ? "square" : "circle",
          delay: -stableNoise(`${node.id}-delay-${index}`) * 4.8,
        } satisfies MicroPoint;
        points.push(point);
        nodePoints.push(point);
        if (index > 0) {
          const prev = nodePoints[index - 1];
          microLines.push({
            id: `${node.id}-micro-link-${index}`,
            x1: prev.x,
            y1: prev.y,
            x2: point.x,
            y2: point.y,
            color: index % 4 === 0 ? WARM : node.color,
            opacity: 0.28 + stableNoise(`${node.id}-micro-line-${index}`) * 0.24,
            width: 0.7 + stableNoise(`${node.id}-micro-width-${index}`) * 0.9,
          });
        }
        if (index % 3 === 0) {
          microLines.push({
            id: `${node.id}-micro-spoke-${index}`,
            x1: node.x,
            y1: node.y,
            x2: point.x,
            y2: point.y,
            color: point.color,
            opacity: 0.2 + stableNoise(`${node.id}-micro-spoke-op-${index}`) * 0.22,
            width: 0.58 + stableNoise(`${node.id}-micro-spoke-w-${index}`) * 0.72,
          });
        }
      }
    });

    const lifeMeanY = lifeValueRankY(dataset.statistics.mean_life_expectancy);
    const lifeTicks = [
      { id: "max", label: `${maxLife.toFixed(1)} yrs`, y: PLOT.top + 12, weight: 900, opacity: 0.95 },
      { id: "mean", label: `mean ${dataset.statistics.mean_life_expectancy.toFixed(1)} yrs`, y: lifeMeanY + 8, weight: 900, opacity: 0.86 },
      { id: "min", label: `${minLife.toFixed(1)} yrs`, y: PLOT.bottom - 4, weight: 900, opacity: 0.78 },
    ];
    const populationScale = Math.max(0.0001, maxLog - minLog);
    const medianPopulationX = clamp(
      PLOT.left +
        ((Math.log10(dataset.statistics.median_population) - minLog) / populationScale) *
          (PLOT.right - PLOT.left),
      PLOT.left + 220,
      PLOT.right - 220,
    );
    const populationTicks = [
      {
        id: "low",
        label: formatPopulationAxis(Math.pow(10, minLog)),
        x: PLOT.left + 10,
        anchor: "start" as const,
      },
      {
        id: "median",
        label: `median ${formatPopulationAxis(dataset.statistics.median_population)}`,
        x: medianPopulationX,
        anchor: "middle" as const,
      },
      {
        id: "high",
        label: formatPopulationAxis(Math.pow(10, maxLog)),
        x: PLOT.right - 10,
        anchor: "end" as const,
      },
    ];

    return {
      plotNodes: plotted,
      plotEdges: recoveredEdges,
      meshFibers: fibers,
      microFibers: microLines,
      microPoints: points,
      meanLifeY: lifeMeanY,
      lifeTicks,
      populationTicks,
    };
  }, [dataset]);

  const visibleMicroFibers = useMemo(() => microFibers.slice(0, 2700), [microFibers]);
  const visibleMicroPoints = useMemo(() => microPoints.slice(0, 3600), [microPoints]);
  const microFiberPaths = useMemo<MicroFiberPath[]>(() => {
    const grouped = new Map<string, { color: string; opacity: number; width: number; segments: string[] }>();
    visibleMicroFibers.forEach((fiber) => {
      const width = fiber.width > 1.18 ? 1.7 : 1.15;
      const opacity = fiber.opacity > 0.4 ? 0.58 : 0.44;
      const key = `${fiber.color}-${width}-${opacity}`;
      const group = grouped.get(key) ?? { color: fiber.color, opacity, width, segments: [] };
      group.segments.push(`M ${fiber.x1.toFixed(1)} ${fiber.y1.toFixed(1)} L ${fiber.x2.toFixed(1)} ${fiber.y2.toFixed(1)}`);
      grouped.set(key, group);
    });
    return Array.from(grouped.entries()).map(([id, group]) => ({
      id,
      color: group.color,
      d: group.segments.join(" "),
      opacity: group.opacity,
      width: group.width,
    }));
  }, [visibleMicroFibers]);
  const activeFibers = meshFibers.slice(0, 76);
  const animatedRecovered = plotEdges.slice(0, 3);
  const hoveredNode = plotNodes.find((node) => node.id === hoveredNodeId) ?? null;
  const hoveredRecord = hoveredNode?.record;

  return (
    <div className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden bg-[#e9dfc9]">
      <div className="relative px-2 py-3 sm:px-4 lg:px-5">
        <aside
          className="pointer-events-none absolute right-12 top-5 z-10 min-h-[10.8rem] w-[min(21rem,calc(100vw-6rem))] border border-ink/22 bg-[#e9dfc9]/88 px-6 py-5 font-mono uppercase leading-6 tracking-[0.1em] text-ink shadow-[0_12px_42px_rgba(5,5,16,0.09)] backdrop-blur-[1px] sm:right-24 sm:top-7"
          aria-live="polite"
        >
          <p className="text-[0.72rem] font-black text-[#7E42B8]">
            {hoveredNode ? hoveredNode.label : "hover a country cluster"}
          </p>
          <p className="text-[0.78rem] font-black text-ink/72">
            {hoveredNode
              ? `${shortRegionLabel(hoveredNode.region ?? "unknown")} / ${formatCount(hoveredRecord?.privacy_signal.record_count ?? hoveredNode.privacy_signal)} records`
              : "population x-axis / life expectancy y-axis"}
          </p>
          <p className="mt-1 text-[0.78rem] font-black text-ink/64">
            {hoveredNode
              ? `${formatPopulationAxis(hoveredNode.population)} / ${hoveredNode.life_expectancy.toFixed(1)} yrs / ${formatMaybe(hoveredNode.privacy_records_per_million, 2)} per million`
              : `${formatCount(dataset.statistics.countries_joined_for_02c)} countries / hover for local signal`}
          </p>
        </aside>

        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          role="img"
          aria-label="Macro demographic context field for recovered privacy signals"
          className="block w-full"
        >
          <defs>
            <filter id="privacy-context-soft-shadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="7" stdDeviation="7" floodColor="#050510" floodOpacity="0.12" />
            </filter>
            <clipPath id="privacy-context-plot-clip">
              <rect
                x={PLOT.left - 44}
                y={PLOT.top - 44}
                width={PLOT.right - PLOT.left + 88}
                height={PLOT.bottom - PLOT.top + 88}
              />
            </clipPath>
            <style>{`
              .privacy-context-node .node-halo,
              .privacy-context-node .node-core,
              .privacy-context-node .node-square {
                transition: opacity 180ms ease, stroke-opacity 180ms ease, stroke-width 180ms ease;
              }
              .privacy-context-node:hover .node-halo {
                opacity: 0.34;
                stroke-opacity: 0.58;
              }
              .privacy-context-node:hover .node-core {
                opacity: 1;
                stroke-opacity: 0.72;
              }
              .privacy-context-node:hover .node-square {
                stroke-width: 2.4;
              }
            `}</style>
          </defs>

          <rect width={WIDTH} height={HEIGHT} fill="#e9dfc9" />
          <rect x={PLOT.left} y={PLOT.top} width={PLOT.right - PLOT.left} height={PLOT.bottom - PLOT.top} fill={INK} opacity={0.014} />

          {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
            const x = PLOT.left + tick * (PLOT.right - PLOT.left);
            return <line key={`x-${tick}`} x1={x} x2={x} y1={PLOT.top - 32} y2={PLOT.bottom + 48} stroke={GRID} strokeOpacity={0.15} />;
          })}
          {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
            const y = PLOT.top + tick * (PLOT.bottom - PLOT.top);
            return <line key={`y-${tick}`} x1={PLOT.left - 40} x2={PLOT.right + 40} y1={y} y2={y} stroke={GRID} strokeOpacity={0.13} />;
          })}
          <line x1={PLOT.left - 40} x2={PLOT.right + 40} y1={meanLifeY} y2={meanLifeY} stroke={INK} strokeOpacity={0.42} strokeWidth={1.4} />

          <text
            x={PLOT.left - 112}
            y={(PLOT.top + PLOT.bottom) / 2}
            transform={`rotate(-90 ${PLOT.left - 112} ${(PLOT.top + PLOT.bottom) / 2})`}
            textAnchor="middle"
            fill={INK}
            fillOpacity={0.76}
            fontFamily="var(--font-geist-mono), monospace"
            fontSize={16}
            fontWeight={900}
            letterSpacing={2.2}
          >
            LIFE EXPECTANCY
          </text>
          <text
            x={(PLOT.left + PLOT.right) / 2}
            y={PLOT.bottom + 114}
            textAnchor="middle"
            fill={INK}
            fillOpacity={0.76}
            fontFamily="var(--font-geist-mono), monospace"
            fontSize={16}
            fontWeight={900}
            letterSpacing={2.2}
          >
            POPULATION
          </text>

          {lifeTicks.map((tick) => (
            <text
              key={tick.id}
              x={PLOT.left - 24}
              y={tick.y}
              textAnchor="end"
              fill={INK}
              fillOpacity={tick.opacity}
              fontFamily="var(--font-geist-sans), sans-serif"
              fontSize={19}
              fontWeight={tick.weight}
            >
              {tick.label}
            </text>
          ))}
          {populationTicks.map((tick) => (
            <text
              key={tick.id}
              x={tick.x}
              y={PLOT.bottom + 92}
              textAnchor={tick.anchor}
              fill={INK}
              fillOpacity={0.68}
              fontFamily="var(--font-geist-sans), sans-serif"
              fontSize={16}
              fontWeight={900}
            >
              {tick.label}
            </text>
          ))}

          <g transform={`translate(${GRAPH_CENTER_X} ${GRAPH_CENTER_Y}) scale(${GRAPH_SCALE}) translate(${-GRAPH_CENTER_X} ${-GRAPH_CENTER_Y})`}>
            <g opacity={0.82}>
              {meshFibers.map((fiber) => (
                <path
                  key={fiber.id}
                  d={fiber.pathD}
                  fill="none"
                  stroke={fiber.color}
                  strokeOpacity={Math.min(0.5, fiber.opacity + 0.02)}
                  strokeWidth={Math.max(0.8, fiber.width * 0.78)}
                />
              ))}
            </g>
            <g opacity={0.82}>
              {plotEdges.map((edge) => (
                <path
                  key={`${edge.source_country_code}-${edge.target_country_code}`}
                  d={edge.pathD}
                  fill="none"
                  stroke={edge.color}
                  strokeOpacity={
                    hoveredNodeId
                      ? edge.source_country_code === hoveredNodeId || edge.target_country_code === hoveredNodeId
                        ? 0.78
                        : 0.14
                      : 0.38
                  }
                  strokeWidth={
                    edge.weight * 0.72 +
                    (hoveredNodeId && (edge.source_country_code === hoveredNodeId || edge.target_country_code === hoveredNodeId)
                      ? 1.05
                      : 0.48)
                  }
                />
              ))}
            </g>
            <g opacity={0.72}>
              {microFiberPaths.map((fiber) => (
                <path
                  key={fiber.id}
                  d={fiber.d}
                  fill="none"
                  stroke={fiber.color}
                  strokeOpacity={fiber.opacity * 0.78}
                  strokeWidth={Math.max(0.72, fiber.width * 0.82)}
                />
              ))}
            </g>

            <g>
              {visibleMicroPoints.map((point, index) => {
                const boostedOpacity = Math.min(0.9, point.opacity + (index % 9 === 0 ? 0.12 : 0.04));
              return (
                  point.shape === "square" ? (
                    <rect
                      key={point.id}
                      x={point.x - point.size / 2}
                      y={point.y - point.size / 2}
                      width={point.size}
                      height={point.size}
                      fill={point.color}
                      opacity={boostedOpacity}
                    />
                  ) : (
                    <circle
                      key={point.id}
                      cx={point.x}
                      cy={point.y}
                      r={point.size}
                      fill={point.color}
                      opacity={boostedOpacity}
                    />
                  )
              );
            })}
            </g>

            <g>
              {plotNodes.map((node, index) => (
                <g
                  key={node.id}
                  transform={`translate(${node.x.toFixed(1)} ${node.y.toFixed(1)})`}
                  className="privacy-context-node cursor-crosshair"
                  opacity={hoveredNodeId && hoveredNodeId !== node.id ? 0.58 : 1}
                  onMouseEnter={() => setHoveredNodeId(node.id)}
                  onFocus={() => setHoveredNodeId(node.id)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                  onBlur={() => setHoveredNodeId(null)}
                  tabIndex={0}
                >
                  <circle className="node-hit" r={node.size * 2.6} fill="transparent" />
                  <circle
                    className="node-halo"
                    r={hoveredNodeId === node.id ? node.size * 2.05 : node.size * 1.65}
                    fill={node.color}
                    opacity={hoveredNodeId === node.id ? 0.34 : 0.14}
                    stroke={node.color}
                    strokeWidth={hoveredNodeId === node.id ? 2.2 : 1.2}
                    strokeOpacity={hoveredNodeId === node.id ? 0.5 : 0.16}
                  />
                  <circle
                    className="node-core"
                    r={hoveredNodeId === node.id ? node.size * 0.92 : node.size * 0.74}
                    fill={node.color}
                    opacity={hoveredNodeId === node.id ? 0.98 : 0.76}
                    stroke={INK}
                    strokeOpacity={0.18}
                    strokeWidth={0.9}
                    filter="url(#privacy-context-soft-shadow)"
                  />
                  <rect
                    className="node-square"
                    x={-node.size * 0.18}
                    y={-node.size * 0.18}
                    width={node.size * 0.36}
                    height={node.size * 0.36}
                    fill="#e9dfc9"
                    stroke={INK}
                    strokeOpacity={0.55}
                    strokeWidth={1.2}
                  />
                </g>
              ))}
            </g>

            <g pointerEvents="none" clipPath="url(#privacy-context-plot-clip)">
              {activeFibers.slice(0, 3).map((fiber, index) => (
                <circle key={`particle-fiber-${fiber.id}`} r={index % 4 === 0 ? 6.8 : 4.9} fill={WARM} opacity={0.98}>
                  <animateMotion dur={`${(fiber.duration * 0.48).toFixed(2)}s`} begin={`${fiber.delay}s`} repeatCount="indefinite" path={fiber.pathD} />
                </circle>
              ))}
              {animatedRecovered.map((edge, index) => (
                <circle key={`particle-edge-${edge.source_country_code}-${edge.target_country_code}`} r={index % 3 === 0 ? 7.2 : 5.1} fill={WARM} opacity={0.96}>
                  <animateMotion dur={`${6.2 + (index % 7) * 0.42}s`} begin={`${-index * 0.55}s`} repeatCount="indefinite" path={edge.pathD} />
                </circle>
              ))}
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
}
