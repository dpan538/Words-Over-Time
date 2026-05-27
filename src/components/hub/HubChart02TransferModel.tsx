"use client";

import { useMemo, useState } from "react";

export type HubChart02TermRole = "main_model" | "main_series" | "supporting" | "annotation";

export type HubChart02FlowTerm = {
  term: string;
  routingLayer: string;
  role: HubChart02TermRole;
  side: "left" | "center" | "right";
  weight: number;
  confidence: "high" | "medium" | "low";
  note: string;
};

export type HubChart02Evidence = {
  label: string;
  year: string;
  term: string;
  confidence: "high" | "medium" | "low";
  note: string;
};

export type HubChart02LayerConfidence = {
  routingLayer: string;
  frequencySupport: string;
  evidenceSupport: string;
  recommendedRole: string;
  confidence: "high" | "medium" | "low";
};

export type HubChart02RouteStratum = {
  routingLayer: string;
  label: string;
  firstVisiblePeriod: string;
  modernStatus: string;
  dominantTerm: string;
  role: string;
  confidence: "high" | "medium" | "low";
};

export type HubChart02TimelineEvent = {
  year: string;
  label: string;
  routingLayer: string;
  term: string;
  confidence: "high" | "medium" | "low";
  note: string;
};

export type HubChart02TransferData = {
  title: string;
  subtitle: string;
  sourceSummary: string;
  coreStatus: string;
  readiness: string;
  recoveredCount: number;
  evidenceCount: number;
  confidenceCounts: {
    high: number;
    medium: number;
    low: number;
  };
  flows: HubChart02FlowTerm[];
  evidence: HubChart02Evidence[];
  layers: HubChart02LayerConfidence[];
  routeStrata: HubChart02RouteStratum[];
  timeline: HubChart02TimelineEvent[];
  roleCounts: Record<HubChart02TermRole, number>;
  cautions: string[];
};

type HubChart02TransferModelProps = {
  data: HubChart02TransferData;
};

type DiagramTerm = HubChart02FlowTerm & {
  x: number;
  y: number;
  anchor: "start" | "middle" | "end";
};

const WHEAT = "#F5ECD2";
const AMETHYST = "#0D0630";
const TEAL = "#8BBEB2";
const SUN = "#F8B72A";
const RUBY = "#852736";
const BLUE = "#3556D8";
const GRID = "rgba(13,6,48,0.13)";

const layerLabels: Record<string, string> = {
  rail_transit_route: "Rail / transit route",
  air_logistics_route: "Air / logistics route",
  hub_and_spoke_model: "Hub-and-spoke model",
  network_communication_route: "Network / communication route",
  institutional_route_language: "Institutional access language",
};

const layerColors: Record<string, string> = {
  rail_transit_route: TEAL,
  air_logistics_route: "#AFC9BF",
  hub_and_spoke_model: SUN,
  network_communication_route: BLUE,
  institutional_route_language: RUBY,
};

const roleColors: Record<HubChart02TermRole, string> = {
  main_model: SUN,
  main_series: TEAL,
  supporting: BLUE,
  annotation: RUBY,
};

const leftSlots = [168, 248, 328, 408, 488, 568];
const rightSlots = [178, 258, 338, 418, 498, 578];
const centerSlots = [316, 394];

function roleLabel(role: HubChart02TermRole) {
  return role.replace("_", " ");
}

function bandPath(fromX: number, fromY: number, toX: number, toY: number) {
  const tension = Math.max(120, Math.abs(toX - fromX) * 0.46);
  return `M ${fromX} ${fromY} C ${fromX + tension} ${fromY}, ${toX - tension} ${toY}, ${toX} ${toY}`;
}

function labelSize(role: HubChart02TermRole) {
  if (role === "main_model") return "text-[1.22rem]";
  if (role === "main_series") return "text-[1.07rem]";
  return "text-[0.92rem]";
}

function strokeWidth(term: HubChart02FlowTerm) {
  if (term.role === "main_model") return 28;
  if (term.role === "main_series") return 22;
  if (term.role === "supporting") return Math.max(9, term.weight * 15);
  return 5;
}

function confidenceOpacity(confidence: "high" | "medium" | "low") {
  if (confidence === "high") return 1;
  if (confidence === "medium") return 0.78;
  return 0.48;
}

function confidenceScale(confidence: "high" | "medium" | "low") {
  if (confidence === "high") return 1;
  if (confidence === "medium") return 0.68;
  return 0.38;
}

function confidenceColor(confidence: "high" | "medium" | "low") {
  if (confidence === "high") return RUBY;
  if (confidence === "medium") return AMETHYST;
  return BLUE;
}

function supportScale(value: string) {
  const normalized = value.toLowerCase();
  if (normalized.includes("strong") || normalized.includes("high")) return 1;
  if (normalized.includes("usable") || normalized.includes("medium") || normalized.includes("visible")) return 0.7;
  if (normalized.includes("low") || normalized.includes("sparse")) return 0.42;
  return 0.56;
}

const periodSequence = [
  "Before 1850",
  "1850-1899",
  "1900-1945",
  "1946-1979",
  "1980-1999",
  "2000-2009",
  "2010-2019",
  "2020-2022",
];

function periodPosition(period: string) {
  const matchIndex = periodSequence.findIndex((label) => period.toLowerCase().includes(label.toLowerCase()));
  if (matchIndex === -1) return 0.5;
  return matchIndex / Math.max(1, periodSequence.length - 1);
}

function shortRole(role: string) {
  return role.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function buildDiagramTerms(flows: HubChart02FlowTerm[]) {
  const left = flows.filter((flow) => flow.side === "left").slice(0, 6);
  const center = flows.filter((flow) => flow.side === "center").slice(0, 2);
  const right = flows.filter((flow) => flow.side === "right").slice(0, 6);

  const leftTerms = left.map((flow, index): DiagramTerm => ({
    ...flow,
    x: 112,
    y: leftSlots[index] ?? 132 + index * 72,
    anchor: "start",
  }));
  const centerTerms = center.map((flow, index): DiagramTerm => ({
    ...flow,
    x: 600,
    y: centerSlots[index] ?? 305 + index * 56,
    anchor: "middle",
  }));
  const rightTerms = right.map((flow, index): DiagramTerm => ({
    ...flow,
    x: 1084,
    y: rightSlots[index] ?? 142 + index * 72,
    anchor: "end",
  }));
  return { leftTerms, centerTerms, rightTerms };
}

function termIsActive(activeTerm: string | null, term: string) {
  return activeTerm === null || activeTerm === term;
}

export function HubChart02TransferModel({ data }: HubChart02TransferModelProps) {
  const [activeTerm, setActiveTerm] = useState<string | null>(null);
  const { leftTerms, centerTerms, rightTerms } = useMemo(() => buildDiagramTerms(data.flows), [data.flows]);
  const activeFlow = data.flows.find((flow) => flow.term === activeTerm) ?? null;
  const transferLedger = useMemo(() => {
    const matchedEvidence = data.timeline.map((item) => {
      const evidence =
        data.evidence.find((entry) => entry.term.toLowerCase() === item.term.toLowerCase()) ??
        data.evidence.find((entry) => item.term.toLowerCase().includes(entry.term.toLowerCase()) || entry.term.toLowerCase().includes(item.term.toLowerCase())) ??
        null;

      return {
        label: item.label,
        year: String(item.year),
        term: item.term,
        confidence: evidence?.confidence ?? item.confidence,
        note: evidence?.note ?? item.note,
      };
    });

    return matchedEvidence.slice(0, 5);
  }, [data.evidence, data.timeline]);

  const centerPrimary = centerTerms[0];
  const centerSecondary = centerTerms[1] ?? centerTerms[0];
  const centerY = centerTerms.length
    ? centerTerms.reduce((total, term) => total + term.y, 0) / centerTerms.length
    : 305;
  const centerX = 600;
  const ledgerYears = transferLedger
    .map((item) => Number.parseInt(item.year, 10))
    .filter((value) => Number.isFinite(value));
  const earliestLedgerYear = ledgerYears.length ? Math.min(...ledgerYears) : 1900;
  const latestLedgerYear = ledgerYears.length ? Math.max(...ledgerYears) : 2000;
  const yearSpan = Math.max(1, latestLedgerYear - earliestLedgerYear);
  const boardLabelWidth = 132;
  const boardWidth = 1200;
  const boardHeight = 400;
  const boardLeft = boardLabelWidth + 26;
  const boardRight = boardWidth - 34;
  const boardUsableWidth = boardRight - boardLeft;
  const roleEntries = (["main_model", "main_series", "supporting", "annotation"] as const).map((role) => ({
    role,
    label: roleLabel(role),
    count: data.roleCounts[role],
    color: roleColors[role],
  }));
  const totalRoleCount = Math.max(1, roleEntries.reduce((total, item) => total + item.count, 0));
  const roleSegments = roleEntries.map((item, index) => {
    const previousTotal = roleEntries.slice(0, index).reduce((total, entry) => total + entry.count, 0);
    return {
      ...item,
      offset: boardUsableWidth * (previousTotal / totalRoleCount),
      width: boardUsableWidth * (item.count / totalRoleCount),
    };
  });
  const activateLayerTerm = (routingLayer: string) => {
    const flow = data.flows.find((item) => item.routingLayer === routingLayer);
    setActiveTerm(flow?.term ?? null);
  };
  const routeColumnWidth = boardUsableWidth / Math.max(1, data.routeStrata.length);
  const timelineX = (year: string) => {
    const parsedYear = Number.parseInt(year, 10);
    if (!Number.isFinite(parsedYear)) return boardLeft + boardUsableWidth * 0.5;
    return boardLeft + ((parsedYear - earliestLedgerYear) / yearSpan) * boardUsableWidth;
  };

  return (
    <div className="border border-ink/72 bg-wheat">
      <div className="grid border-b border-ink/52 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0 px-4 py-4 sm:px-5">
          <p className="font-mono text-[0.92rem] font-black uppercase leading-5 tracking-[0.16em] text-hub-ruby">
            flat transfer diagram / selected routing terms only
          </p>
          <p className="mt-2 max-w-4xl text-[1.02rem] leading-6 text-ink/70">
            Recommended Chart 02 terms are mapped as route inputs, a central hub-and-spoke compression point, and later network/system extensions.
          </p>
        </div>
        <div className="grid border-t border-ink/52 lg:border-l lg:border-t-0">
          {[
            ["model", data.coreStatus],
            ["evidence", `${data.evidenceCount} items`],
            ["recovered", `${data.recoveredCount} series`],
          ].map(([label, value], index) => (
            <div key={label} className={`grid grid-cols-[7rem_1fr] ${index < 2 ? "border-b border-ink/52" : ""}`}>
              <dt className="border-r border-ink/52 px-3 py-3 font-mono text-[0.86rem] font-black uppercase tracking-[0.14em] text-hub-ruby">
                {label}
              </dt>
              <dd className="px-3 py-3 font-mono text-[0.92rem] font-black uppercase leading-5 tracking-[0.1em] text-hub-space">
                {value}
              </dd>
            </div>
          ))}
        </div>
      </div>

      <div className="relative min-h-[560px] overflow-hidden border-t border-ink/52 bg-wheat">
          <svg
            viewBox="0 0 1200 620"
            role="img"
            aria-label="Hub Chart 02 transfer model diagram"
            className="block h-full min-h-[560px] w-full"
            preserveAspectRatio="xMidYMid meet"
            onMouseLeave={() => setActiveTerm(null)}
          >
            <defs>
              <pattern id="hub-chart02-grid" width="80" height="80" patternUnits="userSpaceOnUse">
                <path d="M 80 0 L 0 0 0 80" fill="none" stroke={GRID} strokeWidth="1" />
              </pattern>
              <filter id="hub-chart02-center-glow" x="-80%" y="-80%" width="260%" height="260%">
                <feGaussianBlur stdDeviation="16" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <rect width="1200" height="620" fill={WHEAT} />
            <rect width="1200" height="620" fill="url(#hub-chart02-grid)" opacity="0.56" />
            <rect x="480" y="94" width="240" height="414" fill={AMETHYST} opacity="0.08" />
            <line x1="600" x2="600" y1="110" y2="522" stroke={AMETHYST} strokeOpacity="0.42" strokeWidth="1.2" />

            <text x="88" y="88" fill={RUBY} className="font-mono text-[17px] font-black uppercase tracking-[0.18em]">
              routing inputs
            </text>
            <text x="600" y="88" textAnchor="middle" fill={RUBY} className="font-mono text-[17px] font-black uppercase tracking-[0.18em]">
              compression model
            </text>
            <text x="1112" y="88" textAnchor="end" fill={RUBY} className="font-mono text-[17px] font-black uppercase tracking-[0.18em]">
              routing extensions
            </text>

            <g opacity="0.22">
              {[172, 246, 320, 394, 468].map((y) => (
                <path key={y} d={bandPath(104, y, 1092, y)} fill="none" stroke={AMETHYST} strokeWidth="1" />
              ))}
            </g>

            <g>
              {leftTerms.map((term) => {
                const active = termIsActive(activeTerm, term.term);
                const color = layerColors[term.routingLayer] ?? TEAL;
                return (
                  <g
                    key={term.term}
                    opacity={active ? confidenceOpacity(term.confidence) : 0.14}
                    className="cursor-pointer transition-opacity duration-300 ease-out"
                    onMouseEnter={() => setActiveTerm(term.term)}
                  >
                    <path
                      d={bandPath(term.x + 170, term.y, centerX - 42, centerY)}
                      fill="none"
                      stroke={color}
                      strokeLinecap="round"
                      strokeWidth={strokeWidth(term)}
                      strokeOpacity={term.role === "annotation" ? 0.34 : 0.72}
                    />
                    <path
                      d={bandPath(term.x + 170, term.y, centerX - 42, centerY)}
                      fill="none"
                      stroke={AMETHYST}
                      strokeLinecap="round"
                      strokeWidth="1.2"
                      strokeOpacity="0.32"
                    />
                    <circle cx={term.x + 152} cy={term.y} r={term.role === "main_series" ? 10 : 7} fill={color} stroke={AMETHYST} strokeOpacity="0.35" />
                  </g>
                );
              })}

              {rightTerms.map((term) => {
                const active = termIsActive(activeTerm, term.term);
                const color = layerColors[term.routingLayer] ?? BLUE;
                return (
                  <g
                    key={term.term}
                    opacity={active ? confidenceOpacity(term.confidence) : 0.14}
                    className="cursor-pointer transition-opacity duration-300 ease-out"
                    onMouseEnter={() => setActiveTerm(term.term)}
                  >
                    <path
                      d={bandPath(centerX + 42, centerY, term.x - 170, term.y)}
                      fill="none"
                      stroke={color}
                      strokeLinecap="round"
                      strokeWidth={strokeWidth(term)}
                      strokeOpacity={term.role === "annotation" ? 0.34 : 0.72}
                    />
                    <path
                      d={bandPath(centerX + 42, centerY, term.x - 170, term.y)}
                      fill="none"
                      stroke={AMETHYST}
                      strokeLinecap="round"
                      strokeWidth="1.2"
                      strokeOpacity="0.32"
                    />
                    <circle cx={term.x - 152} cy={term.y} r={term.role === "supporting" ? 8 : 6} fill={color} stroke={AMETHYST} strokeOpacity="0.35" />
                  </g>
                );
              })}
            </g>

            <g filter="url(#hub-chart02-center-glow)">
              <ellipse cx={centerX} cy={centerY} rx="136" ry="96" fill={SUN} opacity="0.42" />
              <ellipse cx={centerX} cy={centerY} rx="96" ry="64" fill={WHEAT} opacity="0.9" />
              <circle cx={centerX} cy={centerY} r="43" fill={SUN} />
              <circle cx={centerX} cy={centerY} r="19" fill={AMETHYST} opacity="0.92" />
            </g>

            <g>
              <path d="M 548 250 C 572 274, 626 274, 652 250" fill="none" stroke={AMETHYST} strokeOpacity="0.55" strokeWidth="1.4" />
              <path d="M 548 382 C 574 354, 628 354, 652 382" fill="none" stroke={AMETHYST} strokeOpacity="0.55" strokeWidth="1.4" />
              <text x={centerPrimary?.x ?? 600} y="278" textAnchor="middle" fill={AMETHYST} className="text-[28px] font-black">
                hub-and-spoke
              </text>
              <text x={centerSecondary?.x ?? 600} y="334" textAnchor="middle" fill={AMETHYST} className="text-[23px] font-black">
                hub and spoke
              </text>
              <text x={centerX} y="384" textAnchor="middle" fill={RUBY} className="font-mono text-[14px] font-black uppercase tracking-[0.16em]">
                collect / compress / redistribute
              </text>
            </g>

            <g>
              {leftTerms.map((term) => {
                const active = termIsActive(activeTerm, term.term);
                return (
                  <g
                    key={`label-${term.term}`}
                    className="cursor-pointer"
                    opacity={active ? 1 : activeTerm ? 0.28 : 0.94}
                    onMouseEnter={() => setActiveTerm(term.term)}
                  >
                    <text
                      x={term.x}
                      y={term.y + 5}
                      fill={term.role === "main_series" ? AMETHYST : RUBY}
                      className={`font-black ${labelSize(term.role)}`}
                    >
                      {term.term}
                    </text>
                    <text x={term.x} y={term.y + 23} fill={AMETHYST} opacity="0.48" className="font-mono text-[13px] font-black uppercase tracking-[0.1em]">
                      {roleLabel(term.role)}
                    </text>
                  </g>
                );
              })}

              {rightTerms.map((term) => {
                const active = termIsActive(activeTerm, term.term);
                return (
                  <g
                    key={`label-${term.term}`}
                    className="cursor-pointer"
                    opacity={active ? 1 : activeTerm ? 0.28 : 0.94}
                    onMouseEnter={() => setActiveTerm(term.term)}
                  >
                    <text
                      x={term.x}
                      y={term.y + 5}
                      textAnchor="end"
                      fill={term.confidence === "high" ? AMETHYST : BLUE}
                      className={`font-black ${labelSize(term.role)}`}
                    >
                      {term.term}
                    </text>
                    <text x={term.x} y={term.y + 23} textAnchor="end" fill={AMETHYST} opacity="0.48" className="font-mono text-[13px] font-black uppercase tracking-[0.1em]">
                      {layerLabels[term.routingLayer] ?? term.routingLayer}
                    </text>
                  </g>
                );
              })}
            </g>

            <g transform="translate(76 607)">
              <text fill={AMETHYST} className="font-mono text-[10.5px] font-black uppercase tracking-[0.14em]">
                Ngram proxy frequency, evidence hardened. Flow width maps role, not exact traffic volume.
              </text>
            </g>
          </svg>
      </div>

      <div className="border-t border-ink/52 bg-wheat">
        <svg
          viewBox={`0 0 ${boardWidth} ${boardHeight}`}
          role="img"
          aria-label="Chart 02 visual support table"
          className="block w-full"
          preserveAspectRatio="xMidYMid meet"
          onMouseLeave={() => setActiveTerm(null)}
        >
          <defs>
            <pattern id="hub-chart02-board-grid" width="74" height="74" patternUnits="userSpaceOnUse">
              <path d="M 74 0 L 0 0 0 74" fill="none" stroke={GRID} strokeWidth="1" />
            </pattern>
            <pattern id="hub-chart02-board-dots" width="12" height="12" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.1" fill={AMETHYST} opacity="0.22" />
            </pattern>
          </defs>

          <rect width={boardWidth} height={boardHeight} fill={WHEAT} />
          <rect width={boardWidth} height={boardHeight} fill="url(#hub-chart02-board-grid)" opacity="0.2" />
          {[0, 132, 292, boardHeight - 1].map((y) => (
            <line key={`board-row-${y}`} x1="0" x2={boardWidth} y1={y} y2={y} stroke={GRID} strokeWidth="1.2" />
          ))}
          <line x1={boardLabelWidth} x2={boardLabelWidth} y1="0" y2={boardHeight} stroke={GRID} strokeWidth="1.2" />

          <text x="18" y="29" fill={RUBY} className="font-mono text-[12.5px] font-black uppercase tracking-[0.18em]">
            <tspan x="18" dy="0">route</tspan>
            <tspan x="18" dy="18">strata</tspan>
          </text>
          <text x="18" y="153" fill={RUBY} className="font-mono text-[12.5px] font-black uppercase tracking-[0.18em]">
            <tspan x="18" dy="0">evidence</tspan>
            <tspan x="18" dy="18">axis</tspan>
          </text>
          <text x="18" y="313" fill={RUBY} className="font-mono text-[12.5px] font-black uppercase tracking-[0.18em]">
            <tspan x="18" dy="0">role</tspan>
            <tspan x="18" dy="18">weight</tspan>
          </text>

          {data.routeStrata.map((layer, index) => {
            const x = boardLeft + routeColumnWidth * index;
            const width = routeColumnWidth - 14;
            const active = activeFlow?.routingLayer === layer.routingLayer;
            const accent = layerColors[layer.routingLayer] ?? BLUE;
            const periodDotX = x + 18 + (width - 36) * periodPosition(layer.firstVisiblePeriod);
            const statusWidth = width * supportScale(layer.modernStatus);
            const visibleStart = Math.round(periodPosition(layer.firstVisiblePeriod) * (periodSequence.length - 1));

            return (
              <g
                key={`route-strip-${layer.routingLayer}`}
                className="cursor-pointer transition-opacity duration-300 ease-out"
                opacity={activeTerm && !active ? 0.28 : 1}
                onMouseEnter={() => activateLayerTerm(layer.routingLayer)}
              >
                <rect x={x} y="18" width={width} height="76" fill={accent} opacity={active ? 0.14 : 0.045} />
                <rect x={x} y="18" width={statusWidth} height="76" fill={accent} opacity={active ? 0.34 : 0.18} />
                <rect x={x} y="94" width={width} height="7" fill="url(#hub-chart02-board-dots)" opacity="0.8" />
                {periodSequence.map((_, tick) => {
                  const cellWidth = (width - 26) / periodSequence.length;
                  const heat = tick >= visibleStart ? supportScale(layer.modernStatus) * (0.24 + tick * 0.045) : 0.06;
                  return (
                    <rect
                      key={`${layer.routingLayer}-cell-${tick}`}
                      x={x + 12 + tick * cellWidth}
                      y="50"
                      width={Math.max(6, cellWidth - 3)}
                      height="18"
                      fill={accent}
                      opacity={active ? Math.min(0.78, heat + 0.22) : Math.min(0.58, heat)}
                    />
                  );
                })}
                <line x1={x + 18} x2={x + width - 18} y1="78" y2="78" stroke={AMETHYST} strokeOpacity="0.24" />
                {periodSequence.map((_, tick) => {
                  const tickX = x + 18 + ((width - 36) * tick) / Math.max(1, periodSequence.length - 1);
                  return <line key={`${layer.routingLayer}-${tick}`} x1={tickX} x2={tickX} y1="73" y2="83" stroke={AMETHYST} strokeOpacity="0.2" />;
                })}
                <circle cx={periodDotX} cy="78" r={4.5 + confidenceScale(layer.confidence) * 2.6} fill={accent} stroke={AMETHYST} strokeOpacity="0.55" strokeWidth="1.2" />
                <text x={x + 10} y="36" fill={AMETHYST} className="font-mono text-[10.8px] font-black uppercase tracking-[0.08em]">
                  {layer.label.replace(" Route", "").replace(" route", "").replace(" Language", "").replace(" language", "")}
                </text>
                <text x={x + 10} y="49" fill={AMETHYST} opacity="0.72" className="text-[11.4px] font-black">
                  {layer.dominantTerm}
                </text>
                <text x={x + width - 8} y="111" textAnchor="end" fill={confidenceColor(layer.confidence)} className="font-mono text-[10.2px] font-black uppercase tracking-[0.1em]">
                  {layer.confidence}
                </text>
              </g>
            );
          })}

          <g transform="translate(0 132)">
            <line x1={boardLeft} x2={boardRight} y1="70" y2="70" stroke={AMETHYST} strokeOpacity="0.35" strokeWidth="1.2" />
            {[earliestLedgerYear, Math.round((earliestLedgerYear + latestLedgerYear) / 2), latestLedgerYear].map((year) => {
              const x = boardLeft + ((year - earliestLedgerYear) / yearSpan) * boardUsableWidth;
              return (
                <g key={`axis-${year}`}>
                  <line x1={x} x2={x} y1="54" y2="92" stroke={AMETHYST} strokeOpacity="0.24" />
                  <text x={x} y="140" textAnchor="middle" fill={AMETHYST} opacity="0.62" className="font-mono text-[13.2px] font-black uppercase tracking-[0.08em]">
                    {year}
                  </text>
                </g>
              );
            })}

            {transferLedger.map((item, index) => {
              const x = timelineX(item.year);
              const laneY = [28, 28, 112, 28, 112][index] ?? (index % 2 === 0 ? 28 : 112);
              const active = activeFlow?.term === item.term;
              const accent = confidenceColor(item.confidence);
              const labelAnchor = x > boardRight - 90 ? "end" : "start";
              const labelX = x > boardRight - 90 ? x - 12 : x + 12;

              return (
                <g
                  key={`ledger-mark-${item.term}-${item.year}`}
                  className="cursor-pointer transition-opacity duration-300 ease-out"
                  opacity={activeTerm && !active ? 0.24 : 1}
                  onMouseEnter={() => setActiveTerm(item.term)}
                >
                  <line x1={x} x2={x} y1={laneY + 5} y2="70" stroke={accent} strokeOpacity="0.42" />
                  <circle cx={x} cy={laneY} r={5 + confidenceScale(item.confidence) * 5} fill={accent} fillOpacity="0.88" stroke={AMETHYST} strokeOpacity="0.42" />
                  <text x={labelX} y={laneY + 4} textAnchor={labelAnchor} fill={AMETHYST} className="font-mono text-[9.8px] font-black uppercase tracking-[0.08em]">
                    {item.year}
                  </text>
                  <text x={labelX} y={laneY + 22} textAnchor={labelAnchor} fill={accent} className="text-[9.8px] font-black">
                    {item.term}
                  </text>
                </g>
              );
            })}
          </g>

          <g transform="translate(0 292)">
            <rect x={boardLeft} y="43" width={boardUsableWidth} height="18" fill={AMETHYST} opacity="0.08" />
            {roleSegments.map((item) => {
              const active = activeFlow?.role === item.role;
              return (
                <g key={`role-${item.role}`} opacity={activeTerm && !active ? 0.3 : 1} className="transition-opacity duration-300 ease-out">
                  <rect
                    x={boardLeft + item.offset}
                    y="43"
                    width={Math.max(2, item.width)}
                    height="18"
                    fill={item.color}
                    opacity={active ? 0.8 : 0.52}
                    className="cursor-pointer"
                    onMouseEnter={() => {
                      const flow = data.flows.find((term) => term.role === item.role);
                      setActiveTerm(flow?.term ?? null);
                    }}
                  />
                  {Array.from({ length: Math.min(item.count, 32) }, (_, dotIndex) => {
                    const dotX = boardLeft + item.offset + 9 + (dotIndex % 16) * 10;
                    const dotY = 68 + Math.floor(dotIndex / 16) * 10;
                    return <circle key={`${item.role}-dot-${dotIndex}`} cx={dotX} cy={dotY} r="2.2" fill={item.color} opacity={active ? 0.95 : 0.55} />;
                  })}
                </g>
              );
            })}
            {roleEntries.map((item, index) => {
              const x = boardLeft + (boardUsableWidth / roleEntries.length) * index;
              const active = activeFlow?.role === item.role;
              return (
                <g
                  key={`role-label-${item.role}`}
                  className="cursor-pointer"
                  opacity={activeTerm && !active ? 0.34 : 1}
                  onMouseEnter={() => {
                    const flow = data.flows.find((term) => term.role === item.role);
                    setActiveTerm(flow?.term ?? null);
                  }}
                >
                  <rect x={x} y="28" width="17" height="6" fill={item.color} opacity={active ? 0.9 : 0.58} />
                  <text x={x + 23} y="34" fill={AMETHYST} className="font-mono text-[10.2px] font-black uppercase tracking-[0.1em]">
                    {item.label}
                  </text>
                  <text x={x} y="96" fill={item.color} className="text-[20.4px] font-black">
                    {item.count}
                  </text>
                </g>
              );
            })}
            <text x={boardLeft} y="16" fill={AMETHYST} className="font-mono text-[9.4px] font-black uppercase tracking-[0.13em]">
              Flow width maps recommended data role, not traffic volume. Ngram visibility is a proxy, not first attestation.
            </text>
          </g>
        </svg>
      </div>
    </div>
  );
}
