"use client";

import { useState } from "react";
import {
  chart03HoverForLayer,
  chart03HoverForLine,
  chart03HoverForResponse,
  chart03HoverForTerm,
  chart03TermIndex,
  type Chart03Layer,
  type Chart03HoverProps,
} from "@/components/artificial/chart03/chart03Shared";

// ── colours ──────────────────────────────────────────────────────────────────
const BG = "transparent";
const INK = "#111018";
const RED = "#A1081F";
const DIM = "rgba(17,16,24,0.78)";
const FAINT = "rgba(17,16,24,0.30)";
const RULE = "rgba(17,16,24,0.42)";
const LABEL = "rgba(17,16,24,0.88)";
const MUTED = "rgba(17,16,24,0.76)";

const WIDTH = 960;
const HEIGHT = 820;
const PANEL_TOP_HEIGHT = 390;
const PANEL_DIV1 = 325;
const PANEL_DIV2 = 650;

// ── time helpers ─────────────────────────────────────────────────────────────
const TL_LEFT = 30;
const TL_RIGHT = WIDTH - TL_LEFT;
const yearToX = (y: number) => TL_LEFT + ((y - 1800) / 219) * (TL_RIGHT - TL_LEFT);

// ── Panel B: scatter dot positions (precomputed from ngram metadata) ──────────
// r = 20 + (firstAbove1perM_or_peak - 1800) / 219 * 115
// angle: SIGHT=−π/2, SOUND=π, LIGHT=0, SCENE=π/2; off-axis = intermediate
type DotKind = "dominant" | "transition" | "concept";
type Dot = { id: string; cx: number; cy: number; r: number; label: string; axis: string; kind?: DotKind };
type ScatterLabelOffset = {
  dx: number;
  dy: number;
  anchor: "start" | "middle" | "end";
  yearDy?: number;
};
const CX = 488;
const CY = 221;
function polar(angle: number, radius: number): [number, number] {
  return [CX + radius * Math.cos(angle), CY + radius * Math.sin(angle)];
}
const τ = Math.PI;
const SIGHT = -τ / 2;
const SOUND = τ;
const LIGHT = 0;
const SCENE = τ / 2;

const scatterDots: Dot[] = [
  // ── SIGHT (photography / image) ──────────────────────────────
  { id: "photograph",      ...toXYR(SIGHT - 0.15, 1832, 5.5), label: "photograph",      axis: "sight", kind: "transition" },
  { id: "photography",     ...toXYR(SIGHT + 0.06, 1851, 5.5), label: "photography",     axis: "sight", kind: "dominant" },
  { id: "moving-picture",  ...toXYR(SIGHT - 0.26, 1916, 4.5), label: "moving picture",  axis: "sight", kind: "transition" },
  { id: "digital-image",   ...toXYR(SIGHT - 0.04, 1998, 4),   label: "digital image",   axis: "sight", kind: "concept" },
  { id: "cinematograph",   ...toXYR(SIGHT + 0.42, 1912, 3),   label: "cinematograph",   axis: "sight", kind: "transition" },
  // ── SOUND (phonograph / audio) ───────────────────────────────
  { id: "phonograph",      ...toXYR(SOUND + 0.08, 1878, 5),   label: "phonograph",      axis: "sound", kind: "dominant" },
  { id: "gramophone",      ...toXYR(SOUND - 0.05, 1923, 3.5), label: "gramophone",      axis: "sound", kind: "transition" },
  { id: "recorded-music",  ...toXYR(SOUND - 0.15, 1933, 3),   label: "recorded music",  axis: "sound", kind: "concept" },
  { id: "high-fidelity",   ...toXYR(SOUND - 0.22, 1953, 4),   label: "high fidelity",   axis: "sound", kind: "concept" },
  { id: "sound-recording", ...toXYR(SOUND - 0.30, 1983, 4),   label: "sound recording", axis: "sound", kind: "concept" },
  // ── LIGHT (artificial light / stage) ─────────────────────────
  { id: "electric-light",  ...toXYR(LIGHT + 0.05, 1897, 9),   label: "electric light",  axis: "light", kind: "dominant" },
  { id: "stage-lighting",  ...toXYR(LIGHT - 0.08, 1925, 3),   label: "stage lighting",  axis: "light", kind: "concept" },
  { id: "limelight",       ...toXYR(LIGHT + 0.15, 1882, 2.5), label: "limelight",       axis: "light", kind: "transition" },
  // ── SCENE (spectacle apparatus) ──────────────────────────────
  { id: "panorama",        ...toXYR(SCENE + 0.10, 1807, 4),   label: "panorama",        axis: "scene", kind: "dominant" },
  { id: "diorama",         ...toXYR(SCENE - 0.08, 1850, 3.5), label: "diorama",         axis: "scene", kind: "transition" },
  { id: "stereoscope",     ...toXYR(SCENE + 0.18, 1852, 3.5), label: "stereoscope",     axis: "scene", kind: "transition" },
  { id: "magic-lantern",   ...toXYR(SCENE - 0.18, 1869, 3),   label: "magic lantern",   axis: "scene", kind: "transition" },
  // ── OFF-AXIS: television (sight × light, upper-right) ────────
  { id: "television",      ...toXYR(-τ / 4,        1953, 12),  label: "television",      axis: "off", kind: "dominant" },
  // ── OFF-AXIS: computer graphics / VR (sight × light, upper-right, further) ──
  { id: "computer-gfx",   ...toXYR(-τ / 4 + 0.36, 1978, 5),  label: "computer graphics", axis: "off", kind: "concept" },
  { id: "virtual-reality", ...toXYR(-τ / 4 - 0.15, 2019, 3.5), label: "virtual reality",  axis: "off", kind: "concept" },
  // ── OFF-AXIS: simulation (sound × scene, lower-left) ─────────
  { id: "simulation",      ...toXYR(3 * τ / 4,     1995, 7),  label: "simulation",      axis: "off", kind: "concept" },
  { id: "mass-production", ...toXYR(-τ / 12,       1930, 3.2), label: "mass production", axis: "off", kind: "concept" },
  { id: "halftone",        ...toXYR(SIGHT + 0.28,  1895, 2.8), label: "halftone",       axis: "sight", kind: "concept" },
];

const defaultScatterLabelOffset: ScatterLabelOffset = { dx: 0, dy: -13, anchor: "middle", yearDy: 14 };
const scatterLabelOffsets: Record<string, ScatterLabelOffset> = {
  photograph: { dx: -13, dy: 22, anchor: "end", yearDy: 13 },
  photography: { dx: 13, dy: -19, anchor: "start", yearDy: 13 },
  "moving-picture": { dx: -11, dy: 24, anchor: "end", yearDy: 13 },
  "digital-image": { dx: 0, dy: -21, anchor: "middle", yearDy: 45 },
  cinematograph: { dx: 12, dy: -10, anchor: "start", yearDy: 13 },
  halftone: { dx: 12, dy: -15, anchor: "start", yearDy: 13 },
  television: { dx: -12, dy: 26, anchor: "end", yearDy: 13 },
  "computer-gfx": { dx: 14, dy: 4, anchor: "start", yearDy: 17 },
  "virtual-reality": { dx: 12, dy: -11, anchor: "start", yearDy: 14 },
  simulation: { dx: -13, dy: 23, anchor: "end", yearDy: 13 },
  "electric-light": { dx: 13, dy: -14, anchor: "start", yearDy: 14 },
  "stage-lighting": { dx: 11, dy: 20, anchor: "start", yearDy: 13 },
  limelight: { dx: -11, dy: -14, anchor: "end", yearDy: 13 },
  phonograph: { dx: -13, dy: -16, anchor: "end", yearDy: 13 },
  gramophone: { dx: -12, dy: 22, anchor: "end", yearDy: 13 },
  "recorded-music": { dx: -12, dy: 21, anchor: "end", yearDy: 13 },
  "high-fidelity": { dx: -12, dy: 23, anchor: "end", yearDy: 13 },
  "sound-recording": { dx: -12, dy: 24, anchor: "end", yearDy: 13 },
  panorama: { dx: 0, dy: 23, anchor: "middle", yearDy: 13 },
  diorama: { dx: 12, dy: 20, anchor: "start", yearDy: 13 },
  stereoscope: { dx: -12, dy: 22, anchor: "end", yearDy: 13 },
  "magic-lantern": { dx: 12, dy: 21, anchor: "start", yearDy: 13 },
  "mass-production": { dx: 14, dy: -9, anchor: "start", yearDy: 13 },
};

function toXYR(angle: number, year: number, dotR: number) {
  const radius = 16 + ((year - 1800) / 219) * 94;
  const [cx, cy] = polar(angle, radius);
  return { cx, cy, r: dotR * 0.86 };
}

function lowerEllipseArc(cx: number, cy: number, rx: number, ry: number): string {
  return `M ${cx - rx} ${cy} A ${rx} ${ry} 0 0 0 ${cx + rx} ${cy}`;
}

function upperEllipseArc(cx: number, cy: number, rx: number, ry: number): string {
  return `M ${cx - rx} ${cy} A ${rx} ${ry} 0 0 1 ${cx + rx} ${cy}`;
}

// ── Panel D: timeline line data ───────────────────────────────────────────────
// Five polylines, each pre-sampled as [year, normalisedValue_0_1] pairs.
// Normalization is per-line so each story is readable independently.
type LineData = { id: string; label: string; opacity: number; dash?: string; points: [number, number][] };

const timelineTop = 470;
const timelineBot = 690;
const TH = timelineBot - timelineTop; // 220px usable

function lineY(v: number): number {
  return timelineBot - v * TH;
}

const timelineLines: LineData[] = [
  {
    id: "inauthenticity",
    label: "imitation · forgery",
    opacity: 0.9,
    points: [
      [1800, 22 / 22], [1810, 21 / 22], [1830, 19 / 22], [1860, 12 / 22],
      [1880, 9 / 22],  [1900, 6 / 22],  [1925, 4 / 22],  [1950, 3 / 22],
      [1975, 3 / 22],  [2000, 3 / 22],  [2019, 4 / 22],
    ],
  },
  {
    id: "spectacle",
    label: "panorama · diorama · stereoscope",
    opacity: 0.65,
    points: [
      [1800, 0.4 / 5], [1808, 4.2 / 5], [1815, 3.8 / 5], [1830, 2.5 / 5], [1851, 2.8 / 5],
      [1858, 3.4 / 5], [1870, 2.6 / 5], [1890, 1.8 / 5], [1910, 1.2 / 5],
      [1950, 0.5 / 5], [1975, 0.4 / 5], [2019, 0.3 / 5],
    ],
  },
  {
    id: "reproduction",
    label: "phonograph · photography · electric light · cinema · radio",
    opacity: 0.75,
    points: [
      [1800, 0.3 / 22], [1840, 1.2 / 22], [1860, 3.5 / 22],
      [1878, 6.0 / 22], [1897, 21.86 / 22], [1910, 16 / 22],
      [1925, 12 / 22],  [1942, 9 / 22],    [1950, 6 / 22],
      [1975, 4 / 22],   [2000, 2.5 / 22],  [2019, 1.8 / 22],
    ],
  },
  {
    id: "television",
    label: "television",
    opacity: 0.85,
    dash: "5 3",
    points: [
      [1800, 0],         [1900, 0.5 / 54], [1920, 2.0 / 54],
      [1930, 4.0 / 54],  [1940, 14 / 54],  [1950, 38 / 54],
      [1953, 53.75 / 54],[1960, 44 / 54],  [1975, 38 / 54],
      [1990, 33 / 54],   [2000, 29 / 54],  [2019, 27.7 / 54],
    ],
  },
  {
    id: "authenticity",
    label: "authenticity · simulation",
    opacity: 0.55,
    points: [
      [1800, 4.1 / 40],  [1820, 3.6 / 40],  [1850, 2.8 / 40],
      [1880, 2.0 / 40],  [1900, 1.5 / 40],  [1925, 1.2 / 40],
      [1950, 1.8 / 40],  [1960, 3.5 / 40],  [1975, 10 / 40],
      [1990, 20 / 40],   [1995, 35 / 40],   [2016, 40 / 40],
      [2019, 38 / 40],
    ],
  },
  {
    id: "industrial",
    label: "photomechanical · halftone · mass production",
    opacity: 0.45,
    dash: "2 4",
    points: [
      [1800, 0.1 / 10], [1850, 0.6 / 10], [1880, 2.2 / 10],
      [1895, 4.8 / 10], [1910, 5.6 / 10], [1930, 8.8 / 10],
      [1950, 9.2 / 10], [1975, 6.0 / 10], [2019, 4.5 / 10],
    ],
  },
];

function polylinePoints(line: LineData): string {
  return line.points
    .map(([year, v]) => `${yearToX(year).toFixed(1)},${lineY(v).toFixed(1)}`)
    .join(" ");
}

// ── burst event markers ───────────────────────────────────────────────────────
const burstEvents = [
  { year: 1808, label: "panorama", termId: "panorama" },
  { year: 1851, label: "photography", termId: "photography" },
  { year: 1878, label: "phonograph", termId: "phonograph" },
  { year: 1897, label: "electric light", termId: "electric-light" },
  { year: 1929, label: "radio", termId: "recorded-music" },
  { year: 1953, label: "television", termId: "television" },
  { year: 1995, label: "simulation", termId: "simulation" },
];

const lineExtraLabels = [
  { lineId: "industrial", x: yearToX(1895), y: timelineBot - 30, label: "photomechanical · halftone" },
  { lineId: "industrial", x: yearToX(1930), y: timelineBot - 46, label: "mass production" },
  { lineId: "authenticity", x: yearToX(1988), y: timelineTop + 34, label: "digital reproduction" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function PanelLabel({
  num, title, note, x,
}: {
  num: string; title: string; note: string; x: number;
}) {
  return (
    <g>
      <text x={x + 16} y={34} fill={MUTED} fontSize={8.8} fontFamily="monospace" letterSpacing="0.10em">
        {"{0" + num + "}"}
      </text>
      <text x={x + 16} y={49} fill={INK} fontSize={11.5} fontFamily="monospace" letterSpacing="0.14em" fontWeight="bold">
        {title.toUpperCase()}
      </text>
      <text x={x + 16} y={64} fill={MUTED} fontSize={8.3} fontFamily="monospace" letterSpacing="0.06em">
        {note}
      </text>
    </g>
  );
}

function GlobeApparatus({ activeHover, onHover }: Chart03HoverProps) {
  const [hoveredBand, setHoveredBand] = useState<string | null>(null);

  // Five latitude ellipses representing apparatus strata
  const bands = [
    {
      id: "spectacle",
      cy: 150,
      rx: 64,
      ry: 11,
      label: "PANORAMA · DIORAMA",
      detail: "pre-cinema spectacle",
      years: "1808–1851",
      terms: ["panorama", "diorama"],
      dim: true,
    },
    {
      id: "apparatus",
      cy: 182,
      rx: 91,
      ry: 14,
      label: "STEREOSCOPE · MAGIC LANTERN",
      detail: "viewing apparatus",
      years: "1850–1880",
      terms: ["stereoscope", "magic-lantern"],
      dim: true,
    },
    {
      id: "recording",
      cy: 221,
      rx: 109,
      ry: 17,
      label: "PHOTOGRAPHY · PHONOGRAPH",
      detail: "image and sound become recordable",
      years: "1851–1878",
      terms: ["photography", "photograph", "phonograph"],
      dim: false,
    },
    {
      id: "broadcast",
      cy: 260,
      rx: 91,
      ry: 14,
      label: "CINEMA · RADIO · LIGHT",
      detail: "manufactured public experience",
      years: "1895–1930",
      terms: ["cinema", "moving-picture", "electric-light", "recorded-music"],
      dim: true,
    },
    {
      id: "mass-media",
      cy: 292,
      rx: 64,
      ry: 11,
      label: "TELEVISION · MASS MEDIA",
      detail: "experience at broadcast scale",
      years: "1950–2019",
      terms: ["television", "mass-production", "digital-image", "simulation", "virtual-reality"],
      dim: true,
    },
  ];
  const activeBand = bands.find((band) => band.id === hoveredBand || band.id === activeHover?.layer || (activeHover?.termId ? band.terms.includes(activeHover.termId) : false));

  return (
    <g>
      {/* Globe outline */}
      <circle cx={160} cy={221} r={112} fill="none" stroke={FAINT} strokeWidth={0.5} strokeDasharray="2 4" />
      {/* Vertical meridian */}
      <ellipse cx={160} cy={221} rx={3} ry={112} fill="none" stroke={FAINT} strokeWidth={0.5} />
      <path d="M 160 109 C 118 150, 118 292, 160 333" fill="none" stroke={FAINT} strokeWidth={0.45} opacity={0.42} />
      <path d="M 160 109 C 202 150, 202 292, 160 333" fill="none" stroke={FAINT} strokeWidth={0.45} opacity={0.42} />
      <ellipse cx={160} cy={221} rx={118} ry={34} fill="none" stroke="rgba(161,8,31,0.22)" strokeWidth={0.6} strokeDasharray="3 5" className="chart03-slow-spin" />

      {bands.map((b) => {
        const isHovered = hoveredBand === b.id || activeHover?.layer === b.id || (activeHover?.termId ? b.terms.includes(activeHover.termId) : false);
        const hasExternal = activeHover !== null && activeHover !== undefined;
        const isDimmed = (hoveredBand !== null || hasExternal) && !isHovered;
        return (
        <g
          key={b.id}
          onMouseEnter={() => {
            setHoveredBand(b.id);
            onHover?.(chart03HoverForLayer(b.id as Chart03Layer, "apparatus"));
          }}
          onMouseLeave={() => {
            setHoveredBand(null);
            onHover?.(null);
          }}
          style={{ cursor: "default" }}
        >
          <ellipse
            cx={160}
            cy={b.cy}
            rx={b.rx}
            ry={b.ry}
            fill="none"
            stroke={isHovered || !b.dim ? INK : MUTED}
            strokeWidth={isHovered ? 1.8 : b.dim ? 0.8 : 1.4}
            opacity={isDimmed ? 0.35 : 1}
            className={isHovered ? "chart03-band-pulse" : undefined}
          />
          <path
            d={upperEllipseArc(160, b.cy - 1.8, b.rx * 0.985, b.ry * 0.86)}
            fill="none"
            stroke={isHovered ? INK : FAINT}
            strokeWidth={isHovered ? 0.8 : 0.45}
            opacity={isDimmed ? 0.10 : isHovered ? 0.42 : 0.20}
            pointerEvents="none"
          />
          <path
            d={lowerEllipseArc(160, b.cy + 2.8, b.rx, b.ry)}
            fill="none"
            stroke={isHovered || !b.dim ? INK : LABEL}
            strokeWidth={isHovered ? 1.45 : b.dim ? 0.72 : 1.05}
            opacity={isDimmed ? 0.26 : isHovered ? 0.95 : 0.58}
            pointerEvents="none"
          />
          <line
            x1={160 - b.rx}
            y1={b.cy}
            x2={160 - b.rx}
            y2={b.cy + 3}
            stroke={isHovered ? INK : FAINT}
            strokeWidth={0.45}
            opacity={isDimmed ? 0.12 : 0.34}
            pointerEvents="none"
          />
          <line
            x1={160 + b.rx}
            y1={b.cy}
            x2={160 + b.rx}
            y2={b.cy + 3}
            stroke={isHovered ? INK : FAINT}
            strokeWidth={0.45}
            opacity={isDimmed ? 0.12 : 0.34}
            pointerEvents="none"
          />
          <ellipse
            cx={160}
            cy={b.cy}
            rx={b.rx + 8}
            ry={b.ry + 6}
            fill="transparent"
            stroke="transparent"
            strokeWidth={8}
          />
          <text
            x={160}
            y={b.cy + 3.5}
            textAnchor="middle"
            fill={isHovered || !b.dim ? INK : LABEL}
            fontSize={b.dim ? 6.6 : 8.3}
            fontFamily="monospace"
            letterSpacing="0.10em"
            className="select-none"
            opacity={isDimmed ? 0.45 : 1}
          >
            {b.label}
          </text>
          <text
            x={160 + b.rx + 14}
            y={b.cy + 3}
            fill={isHovered ? INK : MUTED}
            fontSize={6.2}
            fontFamily="monospace"
            letterSpacing="0.06em"
            opacity={isDimmed ? 0.20 : isHovered ? 0.92 : 0.58}
            className="select-none"
          >
            {b.years}
          </text>
        </g>
        );
      })}

      <text
        x={160}
        y={348}
        textAnchor="middle"
        fill={activeBand ? INK : MUTED}
        fontSize={7.4}
        fontFamily="monospace"
        letterSpacing="0.08em"
        opacity={activeBand ? 0.9 : 0.65}
      >
        {activeBand ? activeBand.detail : "hover a band to isolate an apparatus layer"}
      </text>
    </g>
  );
}

function SensesScatter({ activeHover, onHover }: Chart03HoverProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  const axisLabels = [
    { label: "SIGHT",  x: CX,       y: CY - 118 },
    { label: "SCENE",  x: CX,       y: CY + 130 },
    { label: "SOUND",  x: CX - 123, y: CY + 4   },
    { label: "LIGHT",  x: CX + 123, y: CY + 4   },
  ];
  const activeTerm = activeHover?.termId;
  const activeDomain = activeHover?.domain;

  return (
    <g>
      {/* Concentric guide rings */}
      {[28, 55, 82, 110].map((r, index) => (
        <circle
          key={r}
          cx={CX}
          cy={CY}
          r={r}
          fill="none"
          stroke={RULE}
          strokeWidth={0.5}
          className={index === 3 ? "chart03-radar-pulse" : undefined}
        />
      ))}

      {/* Axis lines */}
      <line x1={CX} y1={CY - 116} x2={CX} y2={CY + 116} stroke={RULE} strokeWidth={0.5} strokeDasharray="2 3" />
      <line x1={CX - 116} y1={CY} x2={CX + 116} y2={CY} stroke={RULE} strokeWidth={0.5} strokeDasharray="2 3" />
      <line x1={CX - 82} y1={CY - 82} x2={CX + 82} y2={CY + 82} stroke={FAINT} strokeWidth={0.4} strokeDasharray="1 4" />
      <line x1={CX + 82} y1={CY - 82} x2={CX - 82} y2={CY + 82} stroke={FAINT} strokeWidth={0.4} strokeDasharray="1 4" />

      {/* Center */}
      <circle cx={CX} cy={CY} r={5} fill={BG} stroke="rgba(17,16,24,0.48)" strokeWidth={0.7} />
      <text x={CX} y={CY + 3.5} textAnchor="middle" fill={DIM} fontSize={5} fontFamily="monospace">
        artificial
      </text>

      {/* Scatter dots */}
      {scatterDots.map((dot) => {
        const meta = chart03TermIndex[dot.id];
        const isPrimary = hovered === dot.id || activeTerm === dot.id;
        const isRelated = Boolean(activeTerm && meta?.relatedTerms?.includes(activeTerm));
        const isHighlighted = isPrimary || isRelated;
        const domainLinked = activeDomain !== undefined && activeDomain === meta?.domain;
        const hasActive = hovered !== null || activeHover !== null && activeHover !== undefined;
        const isDimmed = hasActive && !isHighlighted && !domainLinked;
        const dotOpacity = isPrimary ? 1 : isRelated ? 0.74 : domainLinked ? 0.66 : isDimmed ? 0.16 : 0.82;
        const labelOffset = scatterLabelOffsets[dot.id] ?? defaultScatterLabelOffset;
        const labelX = dot.cx + labelOffset.dx;
        const labelY = dot.cy + labelOffset.dy;
        const yearY = labelY + (labelOffset.yearDy ?? 14);
        const commonShapeProps = {
          fill: dot.kind === "transition" ? BG : INK,
          stroke: INK,
          strokeWidth: isPrimary ? 1.5 : isRelated ? 0.8 : dot.kind === "transition" ? 1 : 0,
          opacity: dotOpacity,
          style: { transition: "opacity 0.2s, stroke-width 0.2s" },
          pointerEvents: "none" as const,
        };
        return (
          <g
            key={dot.id}
            onMouseEnter={() => {
              setHovered(dot.id);
              onHover?.(chart03HoverForTerm(dot.id, "senses"));
            }}
            onMouseLeave={() => {
              setHovered(null);
              onHover?.(null);
            }}
            style={{ cursor: "default" }}
          >
            <circle cx={dot.cx} cy={dot.cy} r={Math.max(dot.r + 8, 12)} fill="transparent" />
            {dot.kind === "concept" ? (
              <path
                d={`M ${dot.cx} ${dot.cy - dot.r} L ${dot.cx + dot.r} ${dot.cy} L ${dot.cx} ${dot.cy + dot.r} L ${dot.cx - dot.r} ${dot.cy} Z`}
                {...commonShapeProps}
              />
            ) : (
              <circle cx={dot.cx} cy={dot.cy} r={dot.r} {...commonShapeProps} />
            )}
            {isRelated && !isPrimary ? (
              <circle
                cx={dot.cx}
                cy={dot.cy}
                r={dot.r + 4.5}
                fill="none"
                stroke={INK}
                strokeWidth={0.55}
                opacity={0.22}
                pointerEvents="none"
              />
            ) : null}
            {isPrimary && (
              <g pointerEvents="none">
                <circle cx={dot.cx} cy={dot.cy} r={dot.r + 5.5} fill="none" stroke={INK} strokeWidth={0.8} opacity={0.55} className="chart03-node-pulse" />
                <text
                  x={labelX}
                  y={labelY}
                  textAnchor={labelOffset.anchor}
                  fill={INK}
                  fontSize={7.7}
                  fontFamily="monospace"
                  letterSpacing="0.06em"
                >
                  {dot.label}
                </text>
                {meta?.year ? (
                  <text
                    x={labelX}
                    y={yearY}
                    textAnchor={labelOffset.anchor}
                    fill={DIM}
                    fontSize={6.5}
                    fontFamily="monospace"
                  >
                    {meta.year}
                  </text>
                ) : null}
              </g>
            )}
          </g>
        );
      })}

      {/* Axis labels */}
      {axisLabels.map((a) => (
        <text
          key={a.label}
          x={a.x}
          y={a.y}
          textAnchor="middle"
          fill={activeDomain === a.label.toLowerCase() ? INK : LABEL}
          fontSize={9.4}
          fontFamily="monospace"
          letterSpacing="0.12em"
          className="select-none"
          opacity={activeDomain && activeDomain !== a.label.toLowerCase() ? 0.42 : 1}
        >
          {a.label}
        </text>
      ))}
    </g>
  );
}

function AuthenticityResponse({ activeHover, onHover }: Chart03HoverProps) {
  const [hoveredArc, setHoveredArc] = useState<string | null>(null);
  // Panel C: x 650–960, drawing area x 666–936, y 90–390
  const base = 366;
  const div1 = 760; // end of first-wave column
  const div2 = 846; // start of second-wave column
  const panelL = 674;
  const panelR = 928;
  const openEndX = panelR - 8;
  const labelX = panelR - 12;
  const activeResponse = hoveredArc ?? activeHover?.responseId ?? null;
  const isActive = (id: string) => activeResponse === null || activeResponse === id;
  const arcOpacity = (id: string, baseOpacity: number) => (isActive(id) ? baseOpacity : baseOpacity * 0.24);
  const hitProps = (id: string, width = 9) => ({
    onMouseEnter: () => {
      setHoveredArc(id);
      onHover?.(chart03HoverForResponse(id, "response"));
    },
    onMouseLeave: () => {
      setHoveredArc(null);
      onHover?.(null);
    },
    style: { cursor: "default" },
    pointerEvents: "stroke" as const,
    strokeWidth: width,
  });
  const labelHitProps = (id: string) => ({
    onMouseEnter: () => {
      setHoveredArc(id);
      onHover?.(chart03HoverForResponse(id, "response"));
    },
    onMouseLeave: () => {
      setHoveredArc(null);
      onHover?.(null);
    },
    style: { cursor: "default" },
  });
  const genuinePath = `M ${panelL} ${base} C ${panelL + 2} 160, ${div1 - 2} 160, ${div1} ${base}`;
  const imitationPath = `M ${panelL} ${base} C ${panelL + 4} 182, ${div1 - 4} 182, ${div1} ${base}`;
  const forgeryPath = `M ${panelL} ${base} C ${panelL + 6} 235, ${div1 - 6} 235, ${div1} ${base}`;
  const simulationPath = `M ${div2} ${base} C ${div2 + 12} ${base - 10}, ${div2 + 52} 190, ${openEndX} 152`;
  const authenticityPath = `M ${div2} ${base} C ${div2 + 14} ${base - 6}, ${div2 + 52} 230, ${openEndX} 190`;

  return (
    <g>
      {/* Internal column dividers */}
      <line x1={div1} y1={110} x2={div1} y2={base + 8} stroke={RULE} strokeWidth={0.5} />
      <line x1={div2} y1={110} x2={div2} y2={base + 8} stroke={RULE} strokeWidth={0.5} />

      {/* Column era labels */}
      <text x={(panelL + div1) / 2} y={118} textAnchor="middle" fill={LABEL} fontSize={7.7} fontFamily="monospace" letterSpacing="0.07em">FIRST WAVE</text>
      <text x={(panelL + div1) / 2} y={130} textAnchor="middle" fill={DIM}   fontSize={6.6} fontFamily="monospace">1800 – 1880</text>
      <text x={(div1 + div2) / 2}   y={118} textAnchor="middle" fill={DIM}   fontSize={7.7} fontFamily="monospace" letterSpacing="0.07em">VACUUM</text>
      <text x={(div1 + div2) / 2}   y={130} textAnchor="middle" fill={FAINT} fontSize={6.6} fontFamily="monospace">1880 – 1960</text>
      <text x={(div2 + panelR) / 2} y={118} textAnchor="middle" fill={LABEL} fontSize={7.7} fontFamily="monospace" letterSpacing="0.07em">SECOND WAVE</text>
      <text x={(div2 + panelR) / 2} y={130} textAnchor="middle" fill={DIM}   fontSize={6.6} fontFamily="monospace">1960 – 2019</text>

      {/* Baseline */}
      <line x1={panelL} y1={base} x2={panelR} y2={base} stroke={RULE} strokeWidth={0.5} />

      {/* ── First wave: three declining arcs ── */}
      {/* genuine (~22/M) */}
      <path d={genuinePath} fill="none" stroke="transparent" {...hitProps("genuine", 8)} />
      <path d={genuinePath}
        fill="none" stroke={INK} strokeWidth={activeResponse === "genuine" ? 2.2 : 1.3} opacity={arcOpacity("genuine", 0.95)} pointerEvents="none" />
      {/* imitation (~18/M) */}
      <path d={imitationPath} fill="none" stroke="transparent" {...hitProps("imitation", 8)} />
      <path d={imitationPath}
        fill="none" stroke={INK} strokeWidth={activeResponse === "imitation" ? 1.9 : 1.0} opacity={arcOpacity("imitation", 0.75)} pointerEvents="none" />
      {/* forgery (~10/M) */}
      <path d={forgeryPath} fill="none" stroke="transparent" {...hitProps("forgery", 8)} />
      <path d={forgeryPath}
        fill="none" stroke={INK} strokeWidth={activeResponse === "forgery" ? 1.6 : 0.7} opacity={arcOpacity("forgery", 0.68)} pointerEvents="none" />

      {/* Arc labels (first wave) */}
      <rect x={(panelL + div1) / 2 - 20} y={145} width={40} height={14} fill="transparent" {...labelHitProps("genuine")} />
      <rect x={(panelL + div1) / 2 - 24} y={167} width={48} height={14} fill="transparent" {...labelHitProps("imitation")} />
      <rect x={(panelL + div1) / 2 - 20} y={219} width={40} height={14} fill="transparent" {...labelHitProps("forgery")} />
      <text x={(panelL + div1) / 2} y={154} textAnchor="middle" fill={INK} fontSize={6.6} fontFamily="monospace" opacity={arcOpacity("genuine", 0.95)} pointerEvents="none">genuine</text>
      <text x={(panelL + div1) / 2} y={176} textAnchor="middle" fill={INK} fontSize={6.6} fontFamily="monospace" opacity={arcOpacity("imitation", 0.82)} pointerEvents="none">imitation</text>
      <text x={(panelL + div1) / 2} y={228} textAnchor="middle" fill={INK} fontSize={6.6} fontFamily="monospace" opacity={arcOpacity("forgery", 0.68)} pointerEvents="none">forgery</text>

      {/* ── Vacuum: ghost line ── */}
      <path d={`M ${div1} ${base} C ${div1 + 20} ${base - 8}, ${div2 - 20} ${base - 8}, ${div2} ${base}`}
        fill="none" stroke={FAINT} strokeWidth={0.5} strokeDasharray="2 3" />
      <text x={(div1 + div2) / 2} y={318} textAnchor="middle" fill="rgba(17,16,24,0.58)" fontSize={6.6} fontFamily="monospace" fontStyle="italic" letterSpacing="0.04em">authenticity</text>
      <text x={(div1 + div2) / 2} y={329} textAnchor="middle" fill="rgba(17,16,24,0.58)" fontSize={6.6} fontFamily="monospace" fontStyle="italic" letterSpacing="0.04em">vocabulary</text>
      <text x={(div1 + div2) / 2} y={340} textAnchor="middle" fill="rgba(17,16,24,0.58)" fontSize={6.6} fontFamily="monospace" fontStyle="italic" letterSpacing="0.04em">at minimum</text>

      {/* ── Second wave: two open arcs rising off-right ── */}
      {/* simulation (~36/M) — highest, still rising */}
      <path d={simulationPath} fill="none" stroke="transparent" {...hitProps("simulation", 10)} />
      <path d={simulationPath}
        fill="none" stroke={INK} strokeWidth={activeResponse === "simulation" ? 2.2 : 1.3} opacity={arcOpacity("simulation", 0.95)} pointerEvents="none" />
      {/* authenticity (~6.5/M) — lower */}
      <path d={authenticityPath} fill="none" stroke="transparent" {...hitProps("authenticity", 10)} />
      <path d={authenticityPath}
        fill="none" stroke={INK} strokeWidth={activeResponse === "authenticity" ? 1.8 : 0.8} opacity={arcOpacity("authenticity", 0.78)} pointerEvents="none" />

      {/* Arc labels (second wave) */}
      <rect x={labelX - 62} y={136} width={66} height={15} fill="transparent" {...labelHitProps("simulation")} />
      <rect x={labelX - 72} y={174} width={76} height={15} fill="transparent" {...labelHitProps("authenticity")} />
      <text x={labelX} y={146} textAnchor="end" fill={INK} fontSize={7.7} fontFamily="monospace" opacity={arcOpacity("simulation", 0.95)} pointerEvents="none">simulation</text>
      <text x={labelX} y={184} textAnchor="end" fill={INK} fontSize={7.7} fontFamily="monospace" opacity={arcOpacity("authenticity", 0.78)} pointerEvents="none">authenticity</text>

      {/* Open-end markers (arcs still rising) */}
      <circle cx={openEndX} cy={152} r={activeResponse === "simulation" ? 3 : 2} fill={INK} opacity={arcOpacity("simulation", 0.7)} pointerEvents="none" />
      <circle cx={openEndX} cy={190} r={activeResponse === "authenticity" ? 3 : 2} fill={INK} opacity={arcOpacity("authenticity", 0.5)} pointerEvents="none" />
      <text x={openEndX + 4} y={156} fill={MUTED} fontSize={6.6} fontFamily="monospace" opacity={arcOpacity("simulation", 1)} pointerEvents="none">→</text>
      <text x={openEndX + 4} y={194} fill={MUTED} fontSize={6.6} fontFamily="monospace" opacity={arcOpacity("authenticity", 1)} pointerEvents="none">→</text>
    </g>
  );
}

function BurstTimeline({ activeHover, onHover }: Chart03HoverProps) {
  const [hoveredLine, setHoveredLine] = useState<string | null>(null);
  const [hoveredEvent, setHoveredEvent] = useState<number | null>(null);
  const activeLine = hoveredLine ?? activeHover?.lineId ?? null;
  const activeYear = hoveredEvent ?? activeHover?.year ?? null;

  return (
    <g>
      {/* Section header */}
      <text x={TL_LEFT} y={430} fill={MUTED} fontSize={7.7} fontFamily="monospace" letterSpacing="0.06em">{"{04}"}</text>
      <text x={TL_LEFT + 28} y={430} fill={INK} fontSize={11.5} fontFamily="monospace" letterSpacing="0.14em" fontWeight="bold">BURST PERIODS</text>
      <text x={TL_LEFT + 28} y={444} fill={MUTED} fontSize={8.3} fontFamily="monospace" letterSpacing="0.05em">threshold crossings 1800 – 2019</text>

      {/* Grid lines */}
      {[0.25, 0.5, 0.75].map((v) => (
        <line key={v} x1={TL_LEFT} y1={lineY(v)} x2={TL_RIGHT} y2={lineY(v)} stroke={RULE} strokeWidth={0.4} />
      ))}

      {/* Burst event verticals */}
      {burstEvents.map((ev) => {
        const isHovered = hoveredEvent === ev.year || activeHover?.termId === ev.termId || (activeYear !== null && Math.abs(activeYear - ev.year) <= 4);
        return (
        <g
          key={ev.year}
          onMouseEnter={() => {
            setHoveredEvent(ev.year);
            onHover?.(chart03HoverForTerm(ev.termId, "timeline-event"));
          }}
          onMouseLeave={() => {
            setHoveredEvent(null);
            onHover?.(null);
          }}
          style={{ cursor: "default" }}
        >
          <line
            x1={yearToX(ev.year)} y1={timelineTop - 6}
            x2={yearToX(ev.year)} y2={timelineBot}
            stroke={isHovered ? "rgba(17,16,24,0.78)" : "rgba(17,16,24,0.42)"}
            strokeWidth={isHovered ? 0.8 : 0.4}
            strokeDasharray="1 3"
          />
          <line
            x1={yearToX(ev.year) - 6}
            y1={timelineTop - 8}
            x2={yearToX(ev.year) + 6}
            y2={timelineBot + 4}
            stroke="transparent"
            strokeWidth={14}
          />
          <text
            x={yearToX(ev.year) + 2}
            y={timelineTop + 15}
            fill={isHovered ? INK : "rgba(17,16,24,0.82)"}
            fontSize={isHovered ? 9.4 : 8.6}
            fontFamily="monospace"
            transform={`rotate(-90, ${yearToX(ev.year) + 2}, ${timelineTop + 15})`}
            textAnchor="end"
          >
            {ev.label} {ev.year}
          </text>
        </g>
        );
      })}

      {/* Polylines */}
      {timelineLines.map((line) => (
        <g key={line.id}
          onMouseEnter={() => {
            setHoveredLine(line.id);
            onHover?.(chart03HoverForLine(line.id, "timeline-line"));
          }}
          onMouseLeave={() => {
            setHoveredLine(null);
            onHover?.(null);
          }}>
          <polyline
            points={polylinePoints(line)}
            fill="none"
            stroke="transparent"
            strokeWidth={14}
            strokeDasharray={line.dash}
            pointerEvents="stroke"
          />
          <polyline
            points={polylinePoints(line)}
            fill="none"
            stroke={INK}
            strokeWidth={activeLine === line.id ? 1.8 : 1.1}
            strokeDasharray={line.dash}
            opacity={activeLine && activeLine !== line.id ? 0.18 : line.opacity}
            style={{ transition: "opacity 0.2s, stroke-width 0.2s" }}
          />
        </g>
      ))}

      {lineExtraLabels.map((item) => {
        const isHovered = activeLine === item.lineId;
        return (
          <text
            key={`${item.lineId}-${item.label}`}
            x={item.x}
            y={item.y}
            fill={isHovered ? INK : "rgba(17,16,24,0.62)"}
            fontSize={isHovered ? 8.6 : 7.5}
            fontFamily="monospace"
            letterSpacing="0.04em"
            textAnchor="middle"
            className="select-none"
            opacity={activeLine && !isHovered ? 0.22 : 0.78}
          >
            {item.label}
          </text>
        );
      })}

      {/* Line legend */}
      {timelineLines.map((line, i) => (
        <g key={line.id + "-legend"}
          onMouseEnter={() => {
            setHoveredLine(line.id);
            onHover?.(chart03HoverForLine(line.id, "timeline-legend"));
          }}
          onMouseLeave={() => {
            setHoveredLine(null);
            onHover?.(null);
          }}
          style={{ cursor: "default" }}>
          <line
            x1={TL_LEFT} y1={timelineBot + 34 + i * 15}
            x2={TL_LEFT + 20} y2={timelineBot + 34 + i * 15}
            stroke={INK}
            strokeWidth={1.2}
            strokeDasharray={line.dash}
            opacity={activeLine && activeLine !== line.id ? 0.18 : line.opacity}
            style={{ transition: "opacity 0.2s" }}
          />
          <text
            x={TL_LEFT + 25} y={timelineBot + 38 + i * 15}
            fill={activeLine === line.id ? INK : LABEL}
            fontSize={8.8}
            fontFamily="monospace"
            letterSpacing="0.06em"
            style={{ transition: "fill 0.2s" }}
          >
            {line.label}
          </text>
        </g>
      ))}

      {/* X axis */}
      <line x1={TL_LEFT} y1={timelineBot} x2={TL_RIGHT} y2={timelineBot} stroke="rgba(17,16,24,0.68)" strokeWidth={0.6} />
      {[1800, 1825, 1850, 1875, 1900, 1925, 1950, 1975, 2000, 2019].map((yr) => (
        <g key={yr}>
          <line x1={yearToX(yr)} y1={timelineBot} x2={yearToX(yr)} y2={timelineBot + 4} stroke="rgba(17,16,24,0.68)" strokeWidth={0.5} />
          <text x={yearToX(yr)} y={timelineBot + 13} textAnchor="middle" fill={DIM} fontSize={7.7} fontFamily="monospace">{yr}</text>
        </g>
      ))}
    </g>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main export
// ─────────────────────────────────────────────────────────────────────────────

export function ArtificialChart03MechanicalReproduction({ activeHover, onHover }: Chart03HoverProps) {
  return (
    <div className="w-full overflow-x-auto rounded-sm border border-ink/35">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: "block", width: "100%", minWidth: 680, background: "transparent" }}
        aria-label="Chart 3 — In the Age of Mechanical Reproduction, Part 1: wide view overview"
      >
        <style>{`
          @keyframes chart03RadarPulse {
            0%, 100% { opacity: 0.22; transform: scale(0.985); }
            50% { opacity: 0.58; transform: scale(1.018); }
          }
          @keyframes chart03NodePulse {
            0%, 100% { opacity: 0.30; }
            50% { opacity: 0.72; }
          }
          @keyframes chart03BandPulse {
            0%, 100% { stroke-opacity: 0.72; }
            50% { stroke-opacity: 1; }
          }
          @keyframes chart03SlowSpin {
            0% { stroke-dashoffset: 0; }
            100% { stroke-dashoffset: -40; }
          }
          .chart03-radar-pulse {
            transform-origin: ${CX}px ${CY}px;
            animation: chart03RadarPulse 4.8s ease-in-out infinite;
          }
          .chart03-node-pulse { animation: chart03NodePulse 1.8s ease-in-out infinite; }
          .chart03-band-pulse { animation: chart03BandPulse 2.2s ease-in-out infinite; }
          .chart03-slow-spin { animation: chart03SlowSpin 9s linear infinite; }
        `}</style>
        {/* ── Panel borders ────────────────────────────────────────────── */}
        <rect x={0} y={0} width={WIDTH} height={PANEL_TOP_HEIGHT} fill="none" stroke={RULE} strokeWidth={0.5} />
        <line x1={PANEL_DIV1} y1={0} x2={PANEL_DIV1} y2={PANEL_TOP_HEIGHT} stroke={RULE} strokeWidth={0.5} />
        <line x1={PANEL_DIV2} y1={0} x2={PANEL_DIV2} y2={PANEL_TOP_HEIGHT} stroke={RULE} strokeWidth={0.5} />

        {/* ── Panel A ──────────────────────────────────────────────────── */}
        <PanelLabel num="1" title="The Apparatus" note="devices that wrap experience, layer by layer" x={0} />
        <GlobeApparatus activeHover={activeHover} onHover={onHover} />

        {/* ── Panel B ──────────────────────────────────────────────────── */}
        <PanelLabel num="2" title="The Senses" note="which senses are manufactured, and when" x={PANEL_DIV1} />
        <SensesScatter activeHover={activeHover} onHover={onHover} />

        {/* ── Panel C ──────────────────────────────────────────────────── */}
        <PanelLabel num="3" title="The Response" note="authenticity vocabulary — two waves and a valley" x={PANEL_DIV2} />
        <AuthenticityResponse activeHover={activeHover} onHover={onHover} />

        {/* ── Panel D: timeline ────────────────────────────────────────── */}
        <BurstTimeline activeHover={activeHover} onHover={onHover} />

        {/* ── Outer border ─────────────────────────────────────────────── */}
        <rect x={0} y={0} width={WIDTH} height={HEIGHT} fill="none" stroke={RULE} strokeWidth={0.5} />
      </svg>
    </div>
  );
}
