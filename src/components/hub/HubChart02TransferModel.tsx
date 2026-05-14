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
const SUN = "#FBB728";
const RUBY = "#852736";
const BLUE = "#414B9E";
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

const leftSlots = [132, 208, 284, 360, 436, 502];
const rightSlots = [142, 218, 294, 370, 446, 510];
const centerSlots = [265, 345];

function roleLabel(role: HubChart02TermRole) {
  return role.replace("_", " ");
}

function bandPath(fromX: number, fromY: number, toX: number, toY: number) {
  const tension = Math.max(120, Math.abs(toX - fromX) * 0.46);
  return `M ${fromX} ${fromY} C ${fromX + tension} ${fromY}, ${toX - tension} ${toY}, ${toX} ${toY}`;
}

function labelSize(role: HubChart02TermRole) {
  if (role === "main_model") return "text-[0.98rem]";
  if (role === "main_series") return "text-[0.84rem]";
  return "text-[0.72rem]";
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

  const centerPrimary = centerTerms[0];
  const centerSecondary = centerTerms[1] ?? centerTerms[0];
  const centerY = centerTerms.length
    ? centerTerms.reduce((total, term) => total + term.y, 0) / centerTerms.length
    : 305;
  const centerX = 600;

  return (
    <div className="border border-ink/64 bg-wheat">
      <div className="grid border-b border-ink/52 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0 px-4 py-4 sm:px-5">
          <p className="font-mono text-[0.72rem] font-black uppercase leading-5 tracking-[0.16em] text-hub-ruby">
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
              <dt className="border-r border-ink/52 px-3 py-3 font-mono text-[0.68rem] font-black uppercase tracking-[0.14em] text-hub-ruby">
                {label}
              </dt>
              <dd className="px-3 py-3 font-mono text-[0.72rem] font-black uppercase leading-5 tracking-[0.1em] text-hub-space">
                {value}
              </dd>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_21rem]">
        <div className="relative min-h-[540px] overflow-hidden border-b border-ink/52 bg-wheat lg:border-b-0 lg:border-r">
          <svg
            viewBox="0 0 1200 620"
            role="img"
            aria-label="Hub Chart 02 transfer model diagram"
            className="block h-full min-h-[540px] w-full"
            preserveAspectRatio="xMidYMid meet"
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
            <rect width="1200" height="620" fill="url(#hub-chart02-grid)" opacity="0.72" />
            <rect x="480" y="58" width="240" height="504" fill={AMETHYST} opacity="0.035" />
            <line x1="600" x2="600" y1="76" y2="546" stroke={AMETHYST} strokeOpacity="0.28" strokeWidth="1" />

            <text x="88" y="74" fill={RUBY} className="font-mono text-[13px] font-black uppercase tracking-[0.18em]">
              routing inputs
            </text>
            <text x="600" y="74" textAnchor="middle" fill={RUBY} className="font-mono text-[13px] font-black uppercase tracking-[0.18em]">
              compression model
            </text>
            <text x="1112" y="74" textAnchor="end" fill={RUBY} className="font-mono text-[13px] font-black uppercase tracking-[0.18em]">
              routing extensions
            </text>

            <g opacity="0.22">
              {[150, 230, 310, 390, 470].map((y) => (
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
                    className="cursor-pointer transition-opacity"
                    onMouseEnter={() => setActiveTerm(term.term)}
                    onMouseLeave={() => setActiveTerm(null)}
                    onFocus={() => setActiveTerm(term.term)}
                    onBlur={() => setActiveTerm(null)}
                    tabIndex={0}
                    role="button"
                    aria-label={`${term.term}, ${roleLabel(term.role)}`}
                  >
                    <path
                      d={bandPath(term.x + 170, term.y, centerX - 42, centerY)}
                      fill="none"
                      stroke={color}
                      strokeLinecap="round"
                      strokeWidth={strokeWidth(term)}
                      strokeOpacity={term.role === "annotation" ? 0.2 : 0.44}
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
                    className="cursor-pointer transition-opacity"
                    onMouseEnter={() => setActiveTerm(term.term)}
                    onMouseLeave={() => setActiveTerm(null)}
                    onFocus={() => setActiveTerm(term.term)}
                    onBlur={() => setActiveTerm(null)}
                    tabIndex={0}
                    role="button"
                    aria-label={`${term.term}, ${roleLabel(term.role)}`}
                  >
                    <path
                      d={bandPath(centerX + 42, centerY, term.x - 170, term.y)}
                      fill="none"
                      stroke={color}
                      strokeLinecap="round"
                      strokeWidth={strokeWidth(term)}
                      strokeOpacity={term.role === "annotation" ? 0.2 : 0.42}
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
              <ellipse cx={centerX} cy={centerY} rx="132" ry="92" fill={SUN} opacity="0.24" />
              <ellipse cx={centerX} cy={centerY} rx="94" ry="62" fill={WHEAT} opacity="0.72" />
              <circle cx={centerX} cy={centerY} r="43" fill={SUN} />
              <circle cx={centerX} cy={centerY} r="19" fill={AMETHYST} opacity="0.92" />
            </g>

            <g>
              <path d="M 548 250 C 572 274, 626 274, 652 250" fill="none" stroke={AMETHYST} strokeOpacity="0.55" strokeWidth="1.4" />
              <path d="M 548 382 C 574 354, 628 354, 652 382" fill="none" stroke={AMETHYST} strokeOpacity="0.55" strokeWidth="1.4" />
              <text x={centerPrimary?.x ?? 600} y="286" textAnchor="middle" fill={AMETHYST} className="text-[28px] font-black">
                hub-and-spoke
              </text>
              <text x={centerSecondary?.x ?? 600} y="344" textAnchor="middle" fill={AMETHYST} className="text-[23px] font-black">
                hub and spoke
              </text>
              <text x={centerX} y="398" textAnchor="middle" fill={RUBY} className="font-mono text-[11px] font-black uppercase tracking-[0.16em]">
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
                    onMouseLeave={() => setActiveTerm(null)}
                  >
                    <text
                      x={term.x}
                      y={term.y + 5}
                      fill={term.role === "main_series" ? AMETHYST : RUBY}
                      className={`font-black ${labelSize(term.role)}`}
                    >
                      {term.term}
                    </text>
                    <text x={term.x} y={term.y + 23} fill={AMETHYST} opacity="0.48" className="font-mono text-[10px] font-black uppercase tracking-[0.1em]">
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
                    onMouseLeave={() => setActiveTerm(null)}
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
                    <text x={term.x} y={term.y + 23} textAnchor="end" fill={AMETHYST} opacity="0.48" className="font-mono text-[10px] font-black uppercase tracking-[0.1em]">
                      {layerLabels[term.routingLayer] ?? term.routingLayer}
                    </text>
                  </g>
                );
              })}
            </g>

            <g transform="translate(76 565)">
              <text fill={AMETHYST} className="font-mono text-[12px] font-black uppercase tracking-[0.14em]">
                Ngram proxy frequency, evidence hardened. Flow width maps role, not exact traffic volume.
              </text>
            </g>
          </svg>
        </div>

        <aside className="grid content-start gap-3 p-4 sm:p-5">
          <div className="border border-ink/40 p-4">
            <p className="font-mono text-[0.68rem] font-black uppercase tracking-[0.16em] text-hub-ruby">
              selected route
            </p>
            <h4 className="mt-3 text-[1.75rem] font-black leading-[0.96] text-hub-amethyst">
              {activeFlow?.term ?? "All transfer routes"}
            </h4>
            <p className="mt-3 text-[0.96rem] leading-6 text-ink/68">
              {activeFlow
                ? activeFlow.note
                : "Transport and logistics terms converge into hub-and-spoke, then extend into network and communication hubs."}
            </p>
            <dl className="mt-4 grid grid-cols-2 border-t border-ink/38">
              {[
                ["role", activeFlow ? roleLabel(activeFlow.role) : "full map"],
                ["layer", activeFlow ? layerLabels[activeFlow.routingLayer] ?? activeFlow.routingLayer : "5 layers"],
                ["confidence", activeFlow?.confidence ?? "mixed"],
                ["readiness", data.readiness],
              ].map(([label, value], index) => (
                <div key={label} className={`${index < 2 ? "border-b" : ""} ${index % 2 === 0 ? "border-r" : ""} border-ink/38 px-2 py-3`}>
                  <dt className="font-mono text-[0.62rem] font-black uppercase tracking-[0.12em] text-hub-space">
                    {label}
                  </dt>
                  <dd className="mt-1 font-mono text-[0.72rem] font-black uppercase leading-4 tracking-[0.08em] text-ink">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="border border-ink/40 p-4">
            <p className="font-mono text-[0.68rem] font-black uppercase tracking-[0.16em] text-hub-ruby">
              layer confidence
            </p>
            <div className="mt-3 grid gap-2">
              {data.layers.map((layer) => (
                <div key={layer.routingLayer} className="grid grid-cols-[1fr_auto] gap-3 border-b border-ink/24 pb-2 last:border-b-0 last:pb-0">
                  <p className="text-[0.86rem] font-black leading-5 text-ink">
                    {layerLabels[layer.routingLayer] ?? layer.routingLayer}
                  </p>
                  <p className="font-mono text-[0.66rem] font-black uppercase tracking-[0.1em] text-hub-space">
                    {layer.confidence}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <div className="grid gap-0 border-t border-ink/52 lg:grid-cols-[15rem_minmax(0,1fr)]">
        <div className="border-b border-ink/52 px-4 py-4 lg:border-b-0 lg:border-r">
          <p className="font-mono text-[0.76rem] font-black uppercase leading-5 tracking-[0.16em] text-hub-ruby">
            evidence anchors
          </p>
        </div>
        <div className="grid gap-0 md:grid-cols-2 xl:grid-cols-4">
          {data.evidence.map((item, index) => (
            <div key={`${item.term}-${item.label}`} className={`min-h-[9rem] p-4 ${index < data.evidence.length - 1 ? "border-b border-ink/36 md:border-r xl:border-b-0" : ""}`}>
              <p className="font-mono text-[0.64rem] font-black uppercase tracking-[0.12em] text-hub-space">
                {item.label}
              </p>
              <div className="mt-3 flex items-baseline gap-3">
                <p className="text-[1.65rem] font-black leading-none text-hub-amethyst">{item.year}</p>
                <p className="font-mono text-[0.64rem] font-black uppercase tracking-[0.1em] text-hub-ruby">
                  {item.confidence}
                </p>
              </div>
              <p className="mt-3 text-[0.9rem] font-black leading-5 text-ink">{item.term}</p>
              <p className="mt-1 text-[0.84rem] leading-5 text-ink/62">{item.note}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-0 border-t border-ink/52 lg:grid-cols-[15rem_minmax(0,1fr)]">
        <div className="border-b border-ink/52 px-4 py-4 lg:border-b-0 lg:border-r">
          <p className="font-mono text-[0.76rem] font-black uppercase leading-5 tracking-[0.16em] text-hub-ruby">
            cautions
          </p>
        </div>
        <ul className="grid gap-0 text-[0.9rem] leading-5 text-ink/66 md:grid-cols-2">
          {data.cautions.map((caution) => (
            <li key={caution} className="border-b border-ink/28 px-4 py-3 odd:md:border-r">
              {caution}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
