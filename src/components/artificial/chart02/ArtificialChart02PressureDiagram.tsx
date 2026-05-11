"use client";

import { Fragment, useMemo, useState } from "react";

const ink = "#050510";
const muted = "rgba(5, 5, 16, 0.58)";

type CircleDef = {
  cx: number;
  cy: number;
  r: number;
};

type PointDef = {
  x: number;
  y: number;
};

type EvidenceItem = {
  id: string;
  x: number;
  y: number;
  lines: string[];
  anchor?: "start" | "middle" | "end";
};

const C1: CircleDef = { cx: 338, cy: 250, r: 60 };
const C2: CircleDef = { cx: 330, cy: 370, r: 60 };
const P: PointDef = { x: 460, y: 305 };
const artificialPointR = 5.5;
const artificialWrapR = artificialPointR;
const substituteField: CircleDef = { cx: 412, cy: 358, r: 104 };

const notNaturalEvidence: EvidenceItem[] = [
  { id: "natural-light", x: 72, y: 232, lines: ["natural light", "↔ artificial light"] },
  { id: "natural-flavor", x: 72, y: 286, lines: ["natural flavor", "↔ artificial flavor"] },
  { id: "natural-ingredients", x: 72, y: 340, lines: ["natural ingredients", "↔ artificial ingredients"] },
];

const notRealEvidence: EvidenceItem[] = [
  { id: "fake", x: 558, y: 250, lines: ["fake"] },
  { id: "not-genuine", x: 558, y: 314, lines: ["not genuine"] },
  { id: "imitation", x: 558, y: 382, lines: ["imitation"] },
];

const substituteEvidence: EvidenceItem[] = [
  { id: "light", x: 386, y: 374, lines: ["artificial light"], anchor: "middle" },
  { id: "flowers", x: 324, y: 438, lines: ["artificial flowers"], anchor: "middle" },
  { id: "teeth", x: 538, y: 442, lines: ["artificial teeth"], anchor: "middle" },
];

const suspicionEvidence: EvidenceItem[] = [
  { id: "uneasy-fit", x: 116, y: 206, lines: ["uneasy fit"] },
  { id: "not-quite", x: 176, y: 260, lines: ["not quite"] },
  { id: "deviation", x: 244, y: 208, lines: ["deviation"] },
  { id: "over-made", x: 154, y: 394, lines: ["over-made"] },
  { id: "too-made", x: 238, y: 420, lines: ["too made"] },
  { id: "distrust", x: 538, y: 214, lines: ["distrust"] },
  { id: "false-surface", x: 530, y: 414, lines: ["false surface"] },
  { id: "copy", x: 262, y: 462, lines: ["copy"] },
  { id: "suspect", x: 510, y: 466, lines: ["suspect"] },
];

function circleToCircleTangent(
  cx1: number,
  cy1: number,
  r1: number,
  cx2: number,
  cy2: number,
  r2: number,
  side: 1 | -1,
) {
  const dx = cx2 - cx1;
  const dy = cy2 - cy1;
  const d = Math.sqrt(dx * dx + dy * dy);
  const theta = Math.atan2(dy, dx);
  const gamma = theta + side * Math.acos((r2 - r1) / d);
  const nx = Math.cos(gamma);
  const ny = Math.sin(gamma);
  return {
    onC1: [cx1 - r1 * nx, cy1 - r1 * ny] as [number, number],
    onC2: [cx2 - r2 * nx, cy2 - r2 * ny] as [number, number],
  };
}

function angleOf(cx: number, cy: number, px: number, py: number) {
  return Math.atan2(py - cy, px - cx);
}

function arcCmd(cx: number, cy: number, r: number, fromAngle: number, toAngle: number) {
  const x2 = cx + r * Math.cos(toAngle);
  const y2 = cy + r * Math.sin(toAngle);
  let diff = fromAngle - toAngle;
  if (diff <= 0) diff += 2 * Math.PI;
  const large = diff > Math.PI ? 1 : 0;
  return `A ${r} ${r} 0 ${large} 0 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
}

function buildRubberBand(c1: CircleDef, c2: CircleDef, p: PointDef, pointR = artificialWrapR) {
  const pCircle = { cx: p.x, cy: p.y, r: pointR };
  const tP1 = circleToCircleTangent(pCircle.cx, pCircle.cy, pCircle.r, c1.cx, c1.cy, c1.r, -1);
  const t12 = circleToCircleTangent(c1.cx, c1.cy, c1.r, c2.cx, c2.cy, c2.r, -1);
  const t2P = circleToCircleTangent(c2.cx, c2.cy, c2.r, pCircle.cx, pCircle.cy, pCircle.r, -1);

  const a1Start = angleOf(c1.cx, c1.cy, tP1.onC2[0], tP1.onC2[1]);
  const a1End = angleOf(c1.cx, c1.cy, t12.onC1[0], t12.onC1[1]);
  const a2Start = angleOf(c2.cx, c2.cy, t12.onC2[0], t12.onC2[1]);
  const a2End = angleOf(c2.cx, c2.cy, t2P.onC1[0], t2P.onC1[1]);
  const pArcStart = angleOf(pCircle.cx, pCircle.cy, t2P.onC2[0], t2P.onC2[1]);
  const pArcEnd = angleOf(pCircle.cx, pCircle.cy, tP1.onC1[0], tP1.onC1[1]);

  return [
    `M ${tP1.onC1[0].toFixed(2)} ${tP1.onC1[1].toFixed(2)}`,
    `L ${tP1.onC2[0].toFixed(2)} ${tP1.onC2[1].toFixed(2)}`,
    arcCmd(c1.cx, c1.cy, c1.r, a1Start, a1End),
    `L ${t12.onC2[0].toFixed(2)} ${t12.onC2[1].toFixed(2)}`,
    arcCmd(c2.cx, c2.cy, c2.r, a2Start, a2End),
    `L ${t2P.onC2[0].toFixed(2)} ${t2P.onC2[1].toFixed(2)}`,
    arcCmd(pCircle.cx, pCircle.cy, pCircle.r, pArcStart, pArcEnd),
    "Z",
  ].join(" ");
}

function buildRoundedPointTriangle(c1: CircleDef, p: CircleDef, c2: CircleDef) {
  const tC1P = circleToCircleTangent(c1.cx, c1.cy, c1.r, p.cx, p.cy, p.r, 1);
  const tPC2 = circleToCircleTangent(p.cx, p.cy, p.r, c2.cx, c2.cy, c2.r, 1);
  const tC2C1 = circleToCircleTangent(c2.cx, c2.cy, c2.r, c1.cx, c1.cy, c1.r, 1);

  const aPStart = angleOf(p.cx, p.cy, tC1P.onC2[0], tC1P.onC2[1]);
  const aPEnd = angleOf(p.cx, p.cy, tPC2.onC1[0], tPC2.onC1[1]);
  const a2Start = angleOf(c2.cx, c2.cy, tPC2.onC2[0], tPC2.onC2[1]);
  const a2End = angleOf(c2.cx, c2.cy, tC2C1.onC1[0], tC2C1.onC1[1]);
  const a1Start = angleOf(c1.cx, c1.cy, tC2C1.onC2[0], tC2C1.onC2[1]);
  const a1End = angleOf(c1.cx, c1.cy, tC1P.onC1[0], tC1P.onC1[1]);

  return [
    `M ${tC1P.onC2[0].toFixed(2)} ${tC1P.onC2[1].toFixed(2)}`,
    arcCmd(p.cx, p.cy, p.r, aPStart, aPEnd),
    `L ${tPC2.onC2[0].toFixed(2)} ${tPC2.onC2[1].toFixed(2)}`,
    arcCmd(c2.cx, c2.cy, c2.r, a2Start, a2End),
    `L ${tC2C1.onC2[0].toFixed(2)} ${tC2C1.onC2[1].toFixed(2)}`,
    arcCmd(c1.cx, c1.cy, c1.r, a1Start, a1End),
    "Z",
  ].join(" ");
}

function EvidenceLabel({
  x,
  y,
  lines,
  selected,
  anchor = "start",
}: {
  x: number;
  y: number;
  lines: string[];
  selected: boolean;
  anchor?: "start" | "middle" | "end";
}) {
  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      className="select-none font-mono text-[6.2px] font-black uppercase tracking-[0.12em] transition-opacity duration-500"
      fill={ink}
      opacity={selected ? 1 : 0}
    >
      {lines.map((line, index) => (
        <tspan key={`${line}-${index}`} x={x} dy={index === 0 ? 0 : 8.3}>
          {line}
        </tspan>
      ))}
    </text>
  );
}

function EvidenceGroup({ items, selected }: { items: EvidenceItem[]; selected: boolean }) {
  return (
    <g opacity={selected ? 1 : 0} className="transition-opacity duration-500">
      {items.map((item) => (
        <Fragment key={item.id}>
          <circle
            cx={item.anchor === "middle" ? item.x - 46 : item.x - 12}
            cy={item.y - 2}
            r="1.7"
            fill={ink}
            opacity="0.7"
          />
          <EvidenceLabel x={item.x} y={item.y} lines={item.lines} selected={selected} anchor={item.anchor} />
        </Fragment>
      ))}
    </g>
  );
}

export function ArtificialChart02PressureDiagram() {
  const [hovered, setHovered] = useState(false);
  const rubberBandPath = useMemo(() => buildRubberBand(C1, C2, P), []);
  const trianglePath = useMemo(
    () =>
      buildRoundedPointTriangle(
        { cx: C1.cx, cy: C1.cy, r: 3 },
        { cx: P.x, cy: P.y, r: 7 },
        { cx: C2.cx, cy: C2.cy, r: 3 },
      ),
    [],
  );

  return (
    <section className="border-b border-ink bg-wheat">
      <div className="border-b border-ink px-6 py-4">
        <p className="font-mono text-[0.72rem] font-black uppercase tracking-[0.16em] text-ink/45">
          Chart 02
        </p>
        <h2 className="mt-1 text-2xl font-black leading-none">Under pressure</h2>
        <div className="mt-5 flex items-center justify-between gap-6">
          <p className="font-mono text-[0.62rem] font-black uppercase tracking-[0.16em] text-ink/58">
            From substitute to suspicion
          </p>
          <div className="flex items-center gap-7 font-mono text-[0.62rem] font-black uppercase tracking-[0.16em] text-ink">
            <span className="inline-flex items-center gap-2.5">
              <span className="h-3.5 w-3.5 rounded-full border border-ink" />
              pressure field
            </span>
            <span className="inline-flex items-center gap-2.5">
              <span className="h-3.5 w-3.5 rounded-full bg-ink" />
              selected word
            </span>
          </div>
        </div>
      </div>
      <div
        className="overflow-x-auto bg-transparent px-3 pt-3 pb-1 sm:px-5 sm:pt-5 sm:pb-1"
      >
        <svg
          viewBox="28 170 620 330"
          role="img"
          tabIndex={0}
          aria-label="Artificial Under Pressure. Default state shows a closed rubber band wrapping not natural, not real, and the artificial point. Hover state reveals the pressure centers and suspicion evidence."
          data-active={hovered ? "true" : "false"}
          onFocus={() => setHovered(true)}
          onBlur={() => setHovered(false)}
          className="chart02-pressure-svg mx-auto block w-[190%] min-w-[1026px] max-w-[1444px] outline-none"
        >
          <desc>
            Default state shows a closed rubber band wrapping not natural, not real, and the artificial point. Hover
            state reveals the two pressure centers, an enclosing triangle, and suspicion evidence.
          </desc>
          <defs>
            <path id="chart02-suspicion-path" d={rubberBandPath} />
            <path
              id="chart02-c1-arc"
              d={`M ${C1.cx - C1.r} ${C1.cy} A ${C1.r} ${C1.r} 0 1 1 ${C1.cx + C1.r} ${C1.cy}`}
            />
            <path
              id="chart02-c2-arc"
              d={`M ${C2.cx - C2.r} ${C2.cy} A ${C2.r} ${C2.r} 0 1 1 ${C2.cx + C2.r} ${C2.cy}`}
            />
          </defs>
          <style>
            {`
              @keyframes chart02CircleSpin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }

              @keyframes chart02CircleSpinReverse {
                from { transform: rotate(0deg); }
                to { transform: rotate(-360deg); }
              }

              @keyframes chart02TreadFlow {
                from { stroke-dashoffset: 0; }
                to { stroke-dashoffset: -44; }
              }

              .chart02-circle-natural {
                transform-box: view-box;
                transform-origin: ${C1.cx}px ${C1.cy}px;
                animation: chart02CircleSpin 72s linear infinite;
              }

              .chart02-circle-real {
                transform-box: view-box;
                transform-origin: ${C2.cx}px ${C2.cy}px;
                animation: chart02CircleSpinReverse 82s linear infinite;
              }

              .chart02-suspicion-band {
                transform-box: fill-box;
              }

              .chart02-suspicion-tread {
                animation: chart02TreadFlow 40s linear infinite;
              }

              .chart02-suspicion-word {
                animation: chart02TreadFlow 40s linear infinite;
              }

              .chart02-pressure-svg[data-active="true"] .chart02-circle-natural,
              .chart02-pressure-svg[data-active="true"] .chart02-circle-real,
              .chart02-pressure-svg[data-active="true"] .chart02-suspicion-tread,
              .chart02-pressure-svg[data-active="true"] .chart02-suspicion-word {
                animation-play-state: paused;
              }
            `}
          </style>

          <circle
            cx={substituteField.cx}
            cy={substituteField.cy}
            r={substituteField.r}
            fill="none"
            stroke={ink}
            strokeWidth="1.2"
            vectorEffect="non-scaling-stroke"
          />
          <text
            x="526"
            y="360"
            className="select-none font-mono text-[6.7px] font-black uppercase tracking-[0.14em]"
            fill={muted}
          >
            substitute field
          </text>

          <g className="chart02-circle-natural">
            <circle
              cx={C1.cx}
              cy={C1.cy}
              r={C1.r}
              fill="none"
              stroke={ink}
              strokeWidth="1.2"
              vectorEffect="non-scaling-stroke"
            />
            <text opacity={hovered ? 0.25 : 1} className="transition-opacity duration-300">
              <textPath
                href="#chart02-c1-arc"
                startOffset="18%"
                className="font-mono text-[5.8px] font-black uppercase tracking-[0.18em]"
                fill={ink}
              >
                not natural
              </textPath>
            </text>
          </g>
          <g className="chart02-circle-real">
            <circle
              cx={C2.cx}
              cy={C2.cy}
              r={C2.r}
              fill="none"
              stroke={ink}
              strokeWidth="1.2"
              vectorEffect="non-scaling-stroke"
            />
            <text opacity={hovered ? 0.25 : 1} className="transition-opacity duration-300">
              <textPath
                href="#chart02-c2-arc"
                startOffset="18%"
                className="font-mono text-[5.8px] font-black uppercase tracking-[0.18em]"
                fill={ink}
              >
                not real
              </textPath>
            </text>
          </g>

          <g className="chart02-suspicion-band transition-opacity duration-500" opacity={hovered ? 0 : 1}>
            <path
              d={rubberBandPath}
              fill="none"
              stroke={ink}
              strokeWidth="1.3"
              vectorEffect="non-scaling-stroke"
            />
            <path
              d={rubberBandPath}
              fill="none"
              stroke={ink}
              strokeWidth="1.9"
              strokeDasharray="6 16"
              strokeLinecap="round"
              opacity="0.32"
              vectorEffect="non-scaling-stroke"
              className="chart02-suspicion-tread"
            />
            <text>
              <textPath
                href="#chart02-suspicion-path"
                startOffset="68%"
                className="chart02-suspicion-word font-mono text-[5.8px] font-black uppercase tracking-[0.18em]"
                fill={ink}
              >
                <animate
                  attributeName="startOffset"
                  values="68%;36%;68%"
                  dur="40s"
                  repeatCount="indefinite"
                />
                suspicion
              </textPath>
            </text>
          </g>

          <g opacity={hovered ? 1 : 0} className="transition-opacity duration-500">
            <path
              d={trianglePath}
              fill="none"
              stroke={ink}
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
            <circle cx={C1.cx} cy={C1.cy} r="3" fill={ink} />
            <circle cx={C2.cx} cy={C2.cy} r="3" fill={ink} />
          </g>

          <circle
            cx={P.x}
            cy={P.y}
            r={hovered ? 7 : artificialPointR}
            fill={ink}
            className="transition-all duration-300"
          />
          <text
            x={P.x}
            y={P.y - 19}
            textAnchor="middle"
            className="select-none font-mono text-[6.7px] font-black uppercase tracking-[0.14em]"
            fill={ink}
          >
            artificial
          </text>

          <g opacity={hovered ? 1 : 0} className="transition-opacity duration-500">
            <line x1="222" y1="232" x2={C1.cx} y2={C1.cy} stroke={ink} strokeWidth="0.55" strokeDasharray="2 4" opacity="0.24" vectorEffect="non-scaling-stroke" />
            <line x1="222" y1="286" x2={C1.cx} y2={C1.cy} stroke={ink} strokeWidth="0.55" strokeDasharray="2 4" opacity="0.24" vectorEffect="non-scaling-stroke" />
            <line x1="222" y1="340" x2={C1.cx} y2={C1.cy} stroke={ink} strokeWidth="0.55" strokeDasharray="2 4" opacity="0.24" vectorEffect="non-scaling-stroke" />
            <line x1="548" y1="250" x2={C2.cx} y2={C2.cy} stroke={ink} strokeWidth="0.55" strokeDasharray="2 4" opacity="0.24" vectorEffect="non-scaling-stroke" />
            <line x1="548" y1="314" x2={C2.cx} y2={C2.cy} stroke={ink} strokeWidth="0.55" strokeDasharray="2 4" opacity="0.24" vectorEffect="non-scaling-stroke" />
            <line x1="548" y1="382" x2={C2.cx} y2={C2.cy} stroke={ink} strokeWidth="0.55" strokeDasharray="2 4" opacity="0.24" vectorEffect="non-scaling-stroke" />
          </g>

          <EvidenceGroup items={notNaturalEvidence} selected={hovered} />
          <EvidenceGroup items={notRealEvidence} selected={hovered} />
          <EvidenceGroup items={substituteEvidence} selected={hovered} />
          <EvidenceGroup items={suspicionEvidence} selected={hovered} />

          {/* ── Quality-pressure strip (top of chart, hover only) ── */}
          <g opacity={hovered ? 1 : 0} className="transition-opacity duration-500">
            <text
              x="370"
              y="177"
              textAnchor="middle"
              className="select-none font-mono text-[5.5px] font-black uppercase tracking-[0.13em]"
              fill={muted}
            >
              quality pressure
            </text>
            <text
              x="370"
              y="187"
              textAnchor="middle"
              className="select-none font-mono text-[5.8px] font-black uppercase tracking-[0.09em]"
              fill={ink}
              opacity="0.58"
            >
              lifelike · true to life · high fidelity
            </text>
          </g>

          {/* ── N / S polarity note (bottom, hover only) ── */}
          <g opacity={hovered ? 1 : 0} className="transition-opacity duration-500">
            <text
              x="370"
              y="490"
              textAnchor="middle"
              className="select-none font-mono text-[5.5px] font-black uppercase tracking-[0.09em]"
              fill={ink}
              opacity="0.40"
            >
              N · natural / original ——→ artificial ——→ S · copy
            </text>
          </g>

          <text
            x="407"
            y="478"
            textAnchor="middle"
            className="select-none font-mono text-[6.7px] font-black uppercase tracking-[0.14em] transition-opacity duration-500"
            fill={ink}
            opacity={hovered ? 1 : 0}
          >
            not natural ≠ not real
          </text>
          <rect
            x="58"
            y="190"
            width="552"
            height="294"
            fill="transparent"
            onPointerEnter={() => setHovered(true)}
            onPointerLeave={() => setHovered(false)}
          />
        </svg>
      </div>
    </section>
  );
}
