"use client";

import { useMemo, useRef, useState } from "react";

import { useScrollReveal } from "@/hooks/useScrollReveal";
import type {
  DataSocializedGenerationDataset,
  DataSocializedPanel,
  DataSocializedTerm,
  SocializedCircleId,
  SocializedPanelId,
  SocializedPoint,
  SocializedVisualRole,
} from "@/types/dataSocializedGeneration";

type DataSocializedGenerationProps = {
  dataset: DataSocializedGenerationDataset;
};

type PanelPlateProps = {
  panel: DataSocializedPanel;
  dataset: DataSocializedGenerationDataset;
  activeSlug: string | null;
  setActiveSlug: (slug: string | null) => void;
};

type PlottedTerm = DataSocializedTerm & {
  point: SocializedPoint;
  px: number;
  py: number;
};

type PlateGeometry = {
  width: number;
  height: number;
};

const plateGeometry: Record<SocializedPanelId, PlateGeometry> = {
  outline: { width: 760, height: 980 },
  inner: { width: 520, height: 1080 },
};

const PLATE_PAD = 26;

const innerCoreTerms = new Set([
  "user-data",
  "personal-data",
  "open-data",
  "data-mining",
  "data-protection",
  "data-privacy",
  "data-breach",
  "big-data",
  "data-science",
]);

const colors = {
  ink: "#050510",
  wheat: "#F5ECD2",
  trace: "#1570AC",
  tracePale: "#86D7E9",
  control: "#A1081F",
  controlPale: "#D78374",
  overlap: "#17151A",
  ai: "#036C17",
  aiPale: "#B9CDAA",
  quiet: "#CDBF99",
};

const roleRadius: Record<SocializedVisualRole, number> = {
  major_label: 7.4,
  minor_label: 5.1,
  dot_only: 3.3,
  hover_only: 2.6,
  edge_tail: 5.4,
};

const circleColor: Record<SocializedCircleId, string> = {
  trace_circulation: colors.trace,
  identity_rights_control: colors.control,
  overlap: colors.overlap,
  ai_tail: colors.ai,
};

const RING_CX = 290;
const RING_CY = 382;
const SEG_GAP_DEG = 4;

type RingZoneDef = {
  zoneId: SocializedCircleId;
  color: string;
  innerR: number;
  outerR: number;
};

type RingSegment = {
  slug: string;
  label: string;
  val: number;
  startDeg: number;
  endDeg: number;
  midDeg: number;
  zoneId: SocializedCircleId;
  color: string;
};

type RingLabelVisibility = "full" | "value_only" | "none";

const RING_ZONE_DEFS: RingZoneDef[] = [
  { zoneId: "overlap", color: colors.overlap, innerR: 55, outerR: 87 },
  { zoneId: "trace_circulation", color: colors.trace, innerR: 100, outerR: 146 },
  { zoneId: "identity_rights_control", color: colors.control, innerR: 160, outerR: 182 },
  { zoneId: "ai_tail", color: colors.ai, innerR: 194, outerR: 220 },
];

const branchLabels: Record<string, string> = {
  networked_trace_interoperability: "trace / circulation",
  personal_data_governance: "identity / control",
  commercial_analytics_decision: "analytics / markets",
  database_structured_access: "structured access",
  ai_training_synthetic_generation: "ai amplification",
};

const labelRegisters: Record<
  SocializedPanelId,
  Record<string, { x: number; y: number; anchor: "start" | "end"; band: "trace" | "overlap" | "control" | "ai" }>
> = {
  outline: {
    metadata: { x: 0.17, y: 0.25, anchor: "start", band: "trace" },
    "clickstream-data": { x: 0.17, y: 0.31, anchor: "start", band: "trace" },
    "open-data": { x: 0.6, y: 0.22, anchor: "start", band: "trace" },
    "search-data": { x: 0.6, y: 0.29, anchor: "start", band: "trace" },
    dataset: { x: 0.6, y: 0.36, anchor: "start", band: "trace" },
    "data-science": { x: 0.24, y: 0.44, anchor: "start", band: "overlap" },
    "data-mining": { x: 0.18, y: 0.55, anchor: "start", band: "overlap" },
    "big-data": { x: 0.36, y: 0.65, anchor: "start", band: "overlap" },
    "user-data": { x: 0.49, y: 0.43, anchor: "start", band: "overlap" },
    "personal-data": { x: 0.56, y: 0.54, anchor: "start", band: "overlap" },
    "data-driven": { x: 0.57, y: 0.64, anchor: "start", band: "overlap" },
    "data-protection": { x: 0.24, y: 0.77, anchor: "start", band: "control" },
    "data-privacy": { x: 0.61, y: 0.75, anchor: "start", band: "control" },
    "data-breach": { x: 0.7, y: 0.59, anchor: "start", band: "control" },
    "data-governance": { x: 0.4, y: 0.84, anchor: "start", band: "control" },
    "data-broker": { x: 0.7, y: 0.83, anchor: "start", band: "control" },
    "training-data": { x: 0.88, y: 0.36, anchor: "end", band: "ai" },
    "synthetic-data": { x: 0.88, y: 0.47, anchor: "end", band: "ai" },
  },
  inner: {
    "open-data": { x: 0.56, y: 0.23, anchor: "start", band: "trace" },
    "data-science": { x: 0.27, y: 0.43, anchor: "start", band: "overlap" },
    "data-mining": { x: 0.2, y: 0.56, anchor: "start", band: "overlap" },
    "big-data": { x: 0.33, y: 0.68, anchor: "start", band: "overlap" },
    "user-data": { x: 0.47, y: 0.39, anchor: "start", band: "overlap" },
    "personal-data": { x: 0.52, y: 0.52, anchor: "start", band: "overlap" },
    "data-breach": { x: 0.66, y: 0.57, anchor: "start", band: "control" },
    "data-privacy": { x: 0.6, y: 0.7, anchor: "start", band: "control" },
    "data-protection": { x: 0.24, y: 0.74, anchor: "start", band: "control" },
  },
};

function svgPoint(point: SocializedPoint, g: PlateGeometry) {
  return {
    x: PLATE_PAD + point.x * (g.width - PLATE_PAD * 2),
    y: 58 + point.y * (g.height - 128),
  };
}

function registerPoint(point: SocializedPoint, g: PlateGeometry) {
  return {
    x: PLATE_PAD + point.x * (g.width - PLATE_PAD * 2),
    y: 58 + point.y * (g.height - 128),
  };
}

function circlePx(circle: { cx: number; cy: number; r: number }, g: PlateGeometry) {
  const fieldW = g.width - PLATE_PAD * 2;
  const fieldH = g.height - 128;
  const size = Math.min(fieldW, fieldH);
  return {
    cx: PLATE_PAD + circle.cx * fieldW,
    cy: 58 + circle.cy * fieldH,
    r: circle.r * size,
  };
}

function polarToCartesian(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg - 90) * (Math.PI / 180);
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function donutSegmentPath(
  cx: number,
  cy: number,
  innerR: number,
  outerR: number,
  startDeg: number,
  endDeg: number,
) {
  const s1 = polarToCartesian(cx, cy, outerR, startDeg);
  const e1 = polarToCartesian(cx, cy, outerR, endDeg);
  const s2 = polarToCartesian(cx, cy, innerR, endDeg);
  const e2 = polarToCartesian(cx, cy, innerR, startDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return [
    `M ${s1.x.toFixed(2)} ${s1.y.toFixed(2)}`,
    `A ${outerR} ${outerR} 0 ${large} 1 ${e1.x.toFixed(2)} ${e1.y.toFixed(2)}`,
    `L ${s2.x.toFixed(2)} ${s2.y.toFixed(2)}`,
    `A ${innerR} ${innerR} 0 ${large} 0 ${e2.x.toFixed(2)} ${e2.y.toFixed(2)}`,
    "Z",
  ].join(" ");
}

function arcMidpoint(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
  return polarToCartesian(cx, cy, r, (startDeg + endDeg) / 2);
}

function buildRingSegments(terms: DataSocializedTerm[], zoneDef: RingZoneDef): RingSegment[] {
  const zoneTerms = terms
    .filter((term) => term.circle === zoneDef.zoneId)
    .map((term) => ({ ...term, val: term.ngramSummary?.average2005_2012 ?? 0 }))
    .filter((term) => term.val > 0)
    .sort((a, b) => b.val - a.val);

  const total = zoneTerms.reduce((sum, term) => sum + term.val, 0);
  const usable = Math.max(1, 360 - SEG_GAP_DEG * zoneTerms.length);
  let cursor = 0;

  return zoneTerms.map((term) => {
    const span = total > 0 ? (term.val / total) * usable : usable / zoneTerms.length;
    const startDeg = cursor;
    const endDeg = cursor + span;
    cursor = endDeg + SEG_GAP_DEG;
    return {
      slug: term.slug,
      label: term.label,
      val: term.val,
      startDeg,
      endDeg,
      midDeg: (startDeg + endDeg) / 2,
      zoneId: zoneDef.zoneId,
      color: zoneDef.color,
    };
  });
}

function getLabelR(def: RingZoneDef, segmentIndex: number, isActive: boolean) {
  if (isActive) return def.outerR + 52;
  return segmentIndex % 2 === 0 ? def.outerR + 18 : def.outerR + 46;
}

function getLabelVisibility(spanDeg: number, isActive: boolean): RingLabelVisibility {
  if (isActive) return "full";
  if (spanDeg >= 22) return "full";
  if (spanDeg >= 8) return "value_only";
  return "none";
}

function wrapLabel(label: string) {
  const words = label.split(" ");
  if (label.length <= 12 || words.length < 2) return [label];
  return [words.slice(0, -1).join(" "), words.at(-1) ?? ""];
}

function relationLabel(type: string) {
  return type.replaceAll("_", " ");
}

function avgForPanel(term: DataSocializedTerm, panelId: SocializedPanelId) {
  if (!term.ngramSummary) return 0;
  if (panelId === "inner") return term.ngramSummary.average2005_2012 ?? 0;
  return term.ngramSummary.average1990_2022 ?? 0;
}

function termRadius(term: DataSocializedTerm, panelId: SocializedPanelId) {
  const base = roleRadius[term.visualRole];
  const frequency = avgForPanel(term, panelId);
  const bump = Math.min(3.4, Math.sqrt(Math.max(frequency, 0)) * 0.82);
  return Number((base + bump).toFixed(2));
}

function labelColor(term: DataSocializedTerm) {
  if (term.circle === "ai_tail") return colors.ai;
  if (term.circle === "overlap") {
    if (term.branch === "commercial_analytics_decision") return colors.ink;
    if (term.branch === "personal_data_governance") return colors.control;
    return colors.trace;
  }
  if (term.visualRole === "major_label") return circleColor[term.circle];
  if (term.visualRole === "minor_label") return colors.ink;
  return colors.ink;
}

function labelOpacity(term: DataSocializedTerm, active: boolean, idle: boolean) {
  if (active) return 1;
  if (!idle) return 0.28;
  if (term.visualRole === "major_label") return 0.9;
  if (term.visualRole === "minor_label") return 0.74;
  if (term.visualRole === "edge_tail") return 0.76;
  return 0.46;
}

function labelSize(term: DataSocializedTerm) {
  if (term.visualRole === "major_label") return 17;
  if (term.visualRole === "minor_label") return 13;
  if (term.visualRole === "edge_tail") return 11.5;
  return 9.5;
}

function labelWeight(term: DataSocializedTerm) {
  if (term.visualRole === "major_label") return "900";
  if (term.visualRole === "minor_label" || term.visualRole === "edge_tail") return "850";
  return "800";
}

function supportDots(panel: DataSocializedPanel, g: PlateGeometry) {
  const trace = circlePx(panel.circleGeometry.trace_circulation, g);
  const control = circlePx(panel.circleGeometry.identity_rights_control, g);
  const rows = panel.id === "inner" ? 13 : 15;
  const cols = panel.id === "inner" ? 11 : 19;
  const xStep = panel.id === "inner" ? 34 : 36;
  const yStep = panel.id === "inner" ? 42 : 39;
  const startX = panel.id === "inner" ? 82 : 70;
  const startY = panel.id === "inner" ? 216 : 132;
  const dots = [];

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const index = row * cols + col;
      const patternedGap = (row * 5 + col * 7) % (panel.id === "inner" ? 11 : 13) < 2;
      const encodedPair = (row + col) % 5 === 0;
      if (patternedGap && !encodedPair) continue;

      const x = startX + col * xStep + (row % 2) * 6;
      const y = startY + row * yStep;
      const inTrace = (x - trace.cx) ** 2 + (y - trace.cy) ** 2 < trace.r ** 2;
      const inControl = (x - control.cx) ** 2 + (y - control.cy) ** 2 < control.r ** 2;
      const inOverlap = inTrace && inControl;
      if (!inTrace && !inControl) continue;
      if (panel.id === "inner" && !inOverlap && (row < 1 || row > 11 || col < 1 || col > 9)) continue;

      dots.push({
        id: `${panel.id}-support-${index}`,
        x,
        y,
        r: inOverlap ? 2.05 : encodedPair ? 1.95 : 1.55,
        opacity: inOverlap ? (panel.id === "inner" ? 0.38 : 0.3) : 0.19,
        fill: inOverlap ? colors.ink : inTrace ? colors.trace : colors.control,
      });
    }
  }

  return dots;
}

function PanelPlate({ panel, dataset, activeSlug, setActiveSlug }: PanelPlateProps) {
  const [activeRelation, setActiveRelation] = useState<string | null>(null);
  const g = plateGeometry[panel.id];
  const panelTerms = useMemo<PlottedTerm[]>(
    () =>
      dataset.terms
        .filter((term) => {
          if (!term.panels.includes(panel.id) || !term.position[panel.id]) return false;
          return panel.id === "outline" || innerCoreTerms.has(term.slug);
        })
        .map((term) => {
          const point = term.position[panel.id];
          if (!point) throw new Error(`Missing point for ${term.slug} in ${panel.id}`);
          const px = svgPoint(point, g);
          return { ...term, point, px: px.x, py: px.y };
        }),
    [dataset.terms, g, panel.id],
  );
  const termBySlug = useMemo(() => new Map(panelTerms.map((term) => [term.slug, term])), [panelTerms]);
  const panelRelations = dataset.relations.filter(
    (relation) =>
      relation.panels.includes(panel.id) && termBySlug.has(relation.from) && termBySlug.has(relation.to),
  );
  const isIdle = !activeSlug && !activeRelation;
  const traceCircle = circlePx(panel.circleGeometry.trace_circulation, g);
  const controlCircle = circlePx(panel.circleGeometry.identity_rights_control, g);
  const dots = supportDots(panel, g);

  return (
    <svg
      role="img"
      aria-labelledby={`${panel.id}-social-title ${panel.id}-social-desc`}
      viewBox={`0 0 ${g.width} ${g.height}`}
      className="data-socialized-plate block w-full bg-wheat"
    >
      <title id={`${panel.id}-social-title`}>{panel.label}</title>
      <desc id={`${panel.id}-social-desc`}>{panel.scaleMeaning}</desc>

      <defs>
        <pattern id={`${panel.id}-paper-grid`} width="34" height="34" patternUnits="userSpaceOnUse">
          <path d="M 34 0 L 0 0 0 34" fill="none" stroke={colors.ink} strokeOpacity="0.055" strokeWidth="1" />
        </pattern>
        <pattern id={`${panel.id}-control-grid`} width="18" height="18" patternUnits="userSpaceOnUse">
          <path d="M 18 0 L 0 0 0 18" fill="none" stroke={colors.ink} strokeOpacity={panel.id === "inner" ? "0.2" : "0.16"} strokeWidth="0.9" />
          <circle cx="9" cy="9" r="0.9" fill={colors.ink} opacity={panel.id === "inner" ? "0.16" : "0.12"} />
        </pattern>
        <pattern id={`${panel.id}-control-hatch`} width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="9" stroke={colors.control} strokeOpacity={panel.id === "inner" ? "0.12" : "0.09"} strokeWidth="1" />
        </pattern>
        <filter id={`${panel.id}-plate-grain`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.92" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="table" tableValues="0 0.055" />
          </feComponentTransfer>
        </filter>
      </defs>

      <rect width={g.width} height={g.height} fill={colors.wheat} />
      <rect x="0" y="0" width={g.width} height={g.height} fill={`url(#${panel.id}-paper-grid)`} />
      <rect x="0" y="0" width={g.width} height={g.height} filter={`url(#${panel.id}-plate-grain)`} opacity="0.22" />

      <g>
        <text x="24" y="28" fill={colors.ink} fontFamily="Helvetica Neue, Helvetica, Arial, sans-serif" fontSize="13" fontWeight="900" letterSpacing="2.5">
          CHART 2 / {panel.id === "outline" ? "A" : "B"}
        </text>
        <text x="24" y="58" fill={colors.ink} fontFamily="Helvetica Neue, Helvetica, Arial, sans-serif" fontSize="26" fontWeight="900" letterSpacing="0" opacity="0.82">
          {panel.label}
        </text>
        <text x={g.width - 24} y="58" textAnchor="end" fill={panel.id === "inner" ? colors.control : colors.trace} fontFamily="Helvetica Neue, Helvetica, Arial, sans-serif" fontSize="12" fontWeight="900" letterSpacing="1.4">
          {panel.id === "inner" ? "CENTER 2005-2012" : "GENERATION SCAN"}
        </text>
      </g>

      <circle
        cx={traceCircle.cx}
        cy={traceCircle.cy}
        r={traceCircle.r}
        fill="none"
        stroke={colors.ink}
        strokeOpacity="0.58"
        strokeWidth="1.7"
      />
      <circle
        cx={traceCircle.cx}
        cy={traceCircle.cy}
        r={traceCircle.r - 5}
        fill="none"
        stroke={colors.trace}
        strokeOpacity="0.18"
        strokeWidth="1"
      />
      <circle
        cx={controlCircle.cx}
        cy={controlCircle.cy}
        r={controlCircle.r}
        fill={colors.wheat}
        fillOpacity="0.04"
      />
      <circle
        cx={controlCircle.cx}
        cy={controlCircle.cy}
        r={controlCircle.r}
        fill={`url(#${panel.id}-control-grid)`}
        opacity={panel.id === "inner" ? 0.82 : 0.72}
      />
      <circle
        cx={controlCircle.cx}
        cy={controlCircle.cy}
        r={controlCircle.r}
        fill={`url(#${panel.id}-control-hatch)`}
        opacity={panel.id === "inner" ? 0.9 : 0.76}
      />
      <circle
        cx={controlCircle.cx}
        cy={controlCircle.cy}
        r={controlCircle.r}
        fill="none"
        stroke={colors.ink}
        strokeOpacity="0.64"
        strokeWidth="1.6"
      />
      <circle
        cx={controlCircle.cx}
        cy={controlCircle.cy}
        r={controlCircle.r - 6}
        fill="none"
        stroke={colors.control}
        strokeOpacity="0.18"
        strokeWidth="1"
      />

      <text x={traceCircle.cx - traceCircle.r + 18} y={traceCircle.cy - traceCircle.r + 50} fill={colors.ink} fontFamily="Helvetica Neue, Helvetica, Arial, sans-serif" fontSize="10" fontWeight="900" letterSpacing="1.8" opacity="0.68">
        TRACE & CIRCULATION
      </text>
      <text x={controlCircle.cx - controlCircle.r + 18} y={Math.min(controlCircle.cy + controlCircle.r - 54, g.height - 68)} fill={colors.control} fillOpacity="0.72" fontFamily="Helvetica Neue, Helvetica, Arial, sans-serif" fontSize="10" fontWeight="900" letterSpacing="1.8">
        IDENTITY, RIGHTS & CONTROL
      </text>
      <text x={g.width / 2} y={g.height - 36} textAnchor="middle" fill={colors.ink} fillOpacity="0.42" fontFamily="monospace" fontSize="7.5" fontWeight="900" letterSpacing="1.25">
        OVERLAP: TRACES ATTACH TO PEOPLE, VALUE, INSTITUTIONS, RIGHTS
      </text>

      {dots.map((dot) => (
        <circle key={dot.id} cx={dot.x} cy={dot.y} r={dot.r} fill={dot.fill} opacity={dot.opacity} />
      ))}

      {panelRelations.map((relation, index) => {
        const from = termBySlug.get(relation.from);
        const to = termBySlug.get(relation.to);
        if (!from || !to) return null;
        const relationKey = `${relation.from}-${relation.to}`;
        const active = activeRelation === relationKey || activeSlug === relation.from || activeSlug === relation.to;
        const stroke = relation.to === "training-data" || relation.to === "synthetic-data" ? colors.ai : colors.trace;
        const midX = (from.px + to.px) / 2;
        const midY = (from.py + to.py) / 2 - 28 - (index % 3) * 6;

        return (
          <g
            key={relation.relation_id}
            className="data-socialized-relation"
            onMouseEnter={() => setActiveRelation(relationKey)}
            onMouseLeave={() => setActiveRelation(null)}
            style={{ animationDelay: `${index * 18}ms`, cursor: "pointer" }}
          >
            <path
              d={`M ${from.px} ${from.py} Q ${midX} ${midY} ${to.px} ${to.py}`}
              fill="none"
              stroke="rgba(0,0,0,0.001)"
              strokeWidth="15"
              style={{ pointerEvents: "stroke" }}
            />
            <path
              d={`M ${from.px} ${from.py} Q ${midX} ${midY} ${to.px} ${to.py}`}
              fill="none"
              stroke={stroke}
              strokeOpacity={isIdle ? 0.15 : active ? 0.74 : 0.035}
              strokeWidth={active ? 2 : 1.1}
              strokeLinecap="round"
              strokeDasharray={relation.to === "training-data" || relation.to === "synthetic-data" ? "3 5" : undefined}
            />
            {active ? (
              <text x={midX} y={midY - 7} textAnchor="middle" fill={stroke} fillOpacity="0.58" fontFamily="monospace" fontSize="6.5" fontWeight="900" letterSpacing="1">
                {relationLabel(relation.relation_type).toUpperCase()}
              </text>
            ) : null}
          </g>
        );
      })}

      {panelTerms.map((term, index) => {
        const active = activeSlug === term.slug;
        const radius = termRadius(term, panel.id);
        const stroke = circleColor[term.circle];
        const fill =
          term.circle === "ai_tail"
            ? colors.aiPale
            : term.circle === "identity_rights_control"
              ? colors.controlPale
              : term.circle === "trace_circulation"
                ? colors.tracePale
                : colors.wheat;
        const register = labelRegisters[panel.id][term.slug] ?? {
          x: term.point.x,
          y: term.point.y,
          anchor: term.point.x > 0.55 ? "end" : "start",
          band: term.circle === "ai_tail" ? "ai" : term.circle === "identity_rights_control" ? "control" : "overlap",
        };
        const label = registerPoint({ x: register.x, y: register.y }, g);
        const labelX = label.x;
        const labelY = label.y;
        const labelLines = wrapLabel(term.label);
        const termOpacity = isIdle || active ? 1 : 0.42;
        const labelIsActive = active || activeRelation?.startsWith(term.slug) || activeRelation?.endsWith(term.slug);
        const bandStroke =
          register.band === "ai"
            ? colors.ai
            : register.band === "control"
              ? colors.control
              : register.band === "trace"
                ? colors.trace
                : colors.ink;

        return (
          <g
            key={term.slug}
            className="data-socialized-term"
            onMouseEnter={() => setActiveSlug(term.slug)}
            onMouseLeave={() => setActiveSlug(null)}
            style={{ animationDelay: `${120 + index * 18}ms`, cursor: "pointer" }}
            aria-label={`${term.label}: ${term.selectionRationale}`}
          >
            <path
              d={`M ${term.px} ${term.py} L ${(term.px + labelX) / 2} ${term.py} L ${labelX + (register.anchor === "end" ? 8 : -8)} ${labelY - 7}`}
              fill="none"
              stroke={term.circle === "ai_tail" ? colors.ai : bandStroke}
              strokeOpacity={labelIsActive ? 0.5 : term.visualRole === "major_label" ? 0.17 : 0.09}
              strokeWidth={labelIsActive ? 1.4 : 0.85}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={term.visualRole === "edge_tail" ? "3 5" : undefined}
            />
            {term.visualRole === "edge_tail" ? (
              <circle cx={term.px} cy={term.py} r={radius + 6} fill="none" stroke={colors.ai} strokeOpacity="0.16" strokeWidth="1.2" strokeDasharray="3 4" />
            ) : null}
            <circle
              cx={term.px}
              cy={term.py}
              r={active ? radius + 3 : radius}
              fill={fill}
              fillOpacity={term.circle === "overlap" ? 0.92 : 0.96}
              stroke={stroke}
              strokeWidth={active ? 2.4 : term.visualRole === "major_label" ? 1.9 : 1.2}
              opacity={termOpacity}
            />
            {term.visualRole === "major_label" ? (
              <circle cx={term.px} cy={term.py} r={radius + 5.5} fill="none" stroke={stroke} strokeOpacity="0.22" strokeWidth="1.2" />
            ) : null}
            <text
              x={labelX}
              y={labelY - 12}
              textAnchor={register.anchor}
              fill={bandStroke}
              fontFamily="Helvetica Neue, Helvetica, Arial, sans-serif"
              fontSize="8.5"
              fontWeight="900"
              letterSpacing="0.75"
              opacity={labelOpacity(term, active, isIdle) * 0.78}
            >
              {String(panelTerms.findIndex((item) => item.slug === term.slug) + 1).padStart(2, "0")} / {register.band.toUpperCase()}
            </text>
            <text
              x={labelX}
              y={labelY}
              textAnchor={register.anchor}
              fill={labelColor(term)}
              fontFamily="Helvetica Neue, Helvetica, Arial, sans-serif"
              fontSize={labelSize(term)}
              fontWeight={labelWeight(term)}
              opacity={labelOpacity(term, active, isIdle)}
            >
              {labelLines.map((line, lineIndex) => (
                <tspan key={`${term.slug}-${line}`} x={labelX} dy={lineIndex === 0 ? 0 : labelSize(term) + 1.5}>
                  {line}
                </tspan>
              ))}
            </text>
          </g>
        );
      })}

    </svg>
  );
}

const INNER_W = 580;
const INNER_H = 700;

type InnerRingPlateProps = {
  dataset: DataSocializedGenerationDataset;
  activeSlug: string | null;
  setActiveSlug: (slug: string | null) => void;
};

function InnerRingPlate({ dataset, activeSlug, setActiveSlug }: InnerRingPlateProps) {
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isIdle = activeSlug === null;
  const allSegments = useMemo(
    () => RING_ZONE_DEFS.flatMap((def) => buildRingSegments(dataset.terms, def)),
    [dataset.terms],
  );
  const segBySlug = useMemo(() => new Map(allSegments.map((segment) => [segment.slug, segment])), [allSegments]);
  const activeRelations = useMemo(() => {
    if (!activeSlug) return [];
    return dataset.relations.filter((relation) => relation.from === activeSlug || relation.to === activeSlug);
  }, [activeSlug, dataset.relations]);
  const handleEnter = (slug: string) => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    setActiveSlug(slug);
  };
  const handleLeave = () => {
    leaveTimer.current = setTimeout(() => setActiveSlug(null), 90);
  };

  return (
    <svg
      role="img"
      aria-labelledby="inner-ring-title inner-ring-desc"
      viewBox={`0 0 ${INNER_W} ${INNER_H}`}
      className="block w-full bg-wheat"
    >
      <title id="inner-ring-title">INNER / 2003-2013 - Frequency Ring</title>
      <desc id="inner-ring-desc">
        Ngram printed-book frequency per million averaged over 2005-2012, grouped by semantic zone.
      </desc>

      <defs>
        <pattern id="inner-ring-grid" width="34" height="34" patternUnits="userSpaceOnUse">
          <path d="M 34 0 L 0 0 0 34" fill="none" stroke={colors.ink} strokeOpacity="0.055" strokeWidth="1" />
        </pattern>
        <filter id="inner-ring-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.92" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="table" tableValues="0 0.055" />
          </feComponentTransfer>
        </filter>
      </defs>

      <rect width={INNER_W} height={INNER_H} fill={colors.wheat} />
      <rect width={INNER_W} height={INNER_H} fill="url(#inner-ring-grid)" />
      <rect width={INNER_W} height={INNER_H} filter="url(#inner-ring-grain)" opacity="0.22" />

      <g>
        <text x="24" y="26" fill={colors.ink} fontFamily="Helvetica Neue, Helvetica, Arial, sans-serif" fontSize="13" fontWeight="900" letterSpacing="2.5">
          CHART 2 / B
        </text>
        <text x="24" y="56" fill={colors.ink} fontFamily="Helvetica Neue, Helvetica, Arial, sans-serif" fontSize="26" fontWeight="900">
          Inner Core
        </text>
        <text x={INNER_W - 24} y="54" textAnchor="end" fill={colors.control} opacity="0.72" fontFamily="Helvetica Neue, Helvetica, Arial, sans-serif" fontSize="12" fontWeight="900" letterSpacing="1.4">
          2003-2013 / FREQ REGISTER
        </text>
        <text x={INNER_W - 24} y="72" textAnchor="end" fill={colors.ink} opacity="0.38" fontFamily="Helvetica Neue, Helvetica, Arial, sans-serif" fontSize="11" fontWeight="900" letterSpacing="1.45">
          2005-2012 / LOUDNESS BY ZONE
        </text>
      </g>

      <line x1="24" x2={INNER_W - 24} y1="84" y2="84" stroke={colors.ink} strokeOpacity="0.14" strokeWidth="1" />
      <text
        x={RING_CX}
        y="100"
        textAnchor="middle"
        fill={colors.ink}
        opacity="0.3"
        fontFamily="Helvetica Neue, Helvetica, Arial, sans-serif"
        fontSize="9.5"
        fontWeight="900"
        letterSpacing="1.6"
      >
        ARC LENGTH = SHARE OF ZONE FREQUENCY
      </text>

      {RING_ZONE_DEFS.map((def) => (
        <circle
          key={`guide-${def.zoneId}`}
          cx={RING_CX}
          cy={RING_CY}
          r={(def.innerR + def.outerR) / 2}
          fill="none"
          stroke={colors.ink}
          strokeOpacity="0.045"
          strokeWidth="0.6"
        />
      ))}

      {RING_ZONE_DEFS.map((def, zoneIndex) => {
        const segments = buildRingSegments(dataset.terms, def);
        return (
          <g key={def.zoneId}>
            {segments.map((segment, segmentIndex) => {
              const active = activeSlug === segment.slug;
              const related = activeRelations.some((relation) => relation.from === segment.slug || relation.to === segment.slug);
              const fade = !isIdle && !active && !related;
              const expand = active ? 6 : related ? 3 : 0;
              const outerR = def.outerR + expand;
              const innerR = def.innerR;
              const path = donutSegmentPath(RING_CX, RING_CY, innerR, outerR, segment.startDeg, segment.endDeg);
              const delayMs = (zoneIndex * 5 + segmentIndex) * 45;
              const spanDeg = segment.endDeg - segment.startDeg;
              const labelR = getLabelR(def, segmentIndex, active);
              const labelVisibility = getLabelVisibility(spanDeg, active);
              const mid = arcMidpoint(RING_CX, RING_CY, labelR, segment.startDeg, segment.endDeg);
              const anchor: "start" | "end" = mid.x > RING_CX ? "start" : "end";
              const leaderStart = arcMidpoint(RING_CX, RING_CY, def.outerR + 3, segment.startDeg, segment.endDeg);
              const leaderStartX = leaderStart.x.toFixed(2);
              const leaderStartY = leaderStart.y.toFixed(2);
              const midX = mid.x.toFixed(2);
              const midY = mid.y.toFixed(2);
              const activeLabelX = (mid.x + (anchor === "start" ? 6 : -6)).toFixed(2);

              return (
                <g
                  key={segment.slug}
                  className="socialized-ring-seg"
                  style={{ animationDelay: `${delayMs}ms`, cursor: "pointer" }}
                  onMouseEnter={() => handleEnter(segment.slug)}
                  onMouseLeave={handleLeave}
                  aria-label={`${segment.label}: average 2005-2012 ${segment.val.toFixed(4)} per million`}
                >
                  <path
                    d={path}
                    fill={segment.color}
                    opacity={fade ? 0.22 : active ? 0.88 : related ? 0.65 : 0.56}
                    style={{ transition: "opacity 250ms ease" }}
                  />
                  {active ? (
                    <path
                      d={donutSegmentPath(RING_CX, RING_CY, innerR - 3, outerR + 4, segment.startDeg, segment.endDeg)}
                      fill="none"
                      stroke={segment.color}
                      strokeOpacity="0.25"
                      strokeWidth="4"
                    />
                  ) : null}
                  {labelVisibility !== "none" ? (
                    <line
                      x1={leaderStartX}
                      y1={leaderStartY}
                      x2={midX}
                      y2={midY}
                      stroke={segment.color}
                      strokeOpacity={fade ? 0.14 : active ? 0.45 : 0.22}
                      strokeWidth={active ? 1.2 : 0.8}
                      style={{ transition: "stroke-opacity 250ms ease" }}
                    />
                  ) : null}
                  {labelVisibility === "full" ? (
                    <>
                      <text
                        x={midX}
                        y={(mid.y - 11).toFixed(2)}
                        textAnchor={anchor}
                        fill={active ? segment.color : colors.ink}
                        opacity={fade ? 0.22 : active ? 1 : 0.82}
                        fontFamily="Helvetica Neue, Helvetica, Arial, sans-serif"
                        fontSize={active ? 16 : 14}
                        fontWeight="900"
                        style={{ transition: "opacity 250ms ease, font-size 250ms ease" }}
                      >
                        {segment.label}
                      </text>
                      <text
                        x={midX}
                        y={(mid.y + 4).toFixed(2)}
                        textAnchor={anchor}
                        fill={segment.color}
                        opacity={fade ? 0.14 : active ? 0.68 : 0.52}
                        fontFamily="Helvetica Neue, Helvetica, Arial, sans-serif"
                        fontSize="11"
                        fontWeight="900"
                        letterSpacing="0.5"
                      >
                        {segment.val.toFixed(3)}
                      </text>
                    </>
                  ) : null}
                  {labelVisibility === "value_only" ? (
                    <text
                      x={midX}
                      y={midY}
                      textAnchor={anchor}
                      fill={segment.color}
                      opacity={fade ? 0.14 : 0.48}
                      fontFamily="Helvetica Neue, Helvetica, Arial, sans-serif"
                      fontSize="11"
                      fontWeight="900"
                    >
                      {segment.val.toFixed(3)}
                    </text>
                  ) : null}
                  {active && labelVisibility === "none" ? (
                    <text
                      x={activeLabelX}
                      y={midY}
                      textAnchor={anchor}
                      fill={segment.color}
                      fontFamily="Helvetica Neue, Helvetica, Arial, sans-serif"
                      fontSize="13"
                      fontWeight="900"
                    >
                      {segment.label} - {segment.val.toFixed(3)}
                    </text>
                  ) : null}
                </g>
              );
            })}
          </g>
        );
      })}

      {activeRelations.map((relation) => {
        const fromSegment = segBySlug.get(relation.from);
        const toSegment = segBySlug.get(relation.to);
        if (!fromSegment || !toSegment) return null;

        const fromDef = RING_ZONE_DEFS.find((def) => def.zoneId === fromSegment.zoneId);
        const toDef = RING_ZONE_DEFS.find((def) => def.zoneId === toSegment.zoneId);
        if (!fromDef || !toDef) return null;

        const fromPoint = arcMidpoint(
          RING_CX,
          RING_CY,
          (fromDef.innerR + fromDef.outerR) / 2,
          fromSegment.startDeg,
          fromSegment.endDeg,
        );
        const toPoint = arcMidpoint(
          RING_CX,
          RING_CY,
          (toDef.innerR + toDef.outerR) / 2,
          toSegment.startDeg,
          toSegment.endDeg,
        );
        const cpX = ((fromPoint.x + toPoint.x) / 2) * 0.55 + RING_CX * 0.45;
        const cpY = ((fromPoint.y + toPoint.y) / 2) * 0.55 + RING_CY * 0.45;

        return (
          <path
            key={relation.relation_id}
            className="data-socialized-active-relation"
            d={`M ${fromPoint.x.toFixed(1)} ${fromPoint.y.toFixed(1)} Q ${cpX.toFixed(1)} ${cpY.toFixed(1)} ${toPoint.x.toFixed(1)} ${toPoint.y.toFixed(1)}`}
            fill="none"
            stroke={fromSegment.color}
            strokeOpacity="0.52"
            strokeWidth="1.4"
            strokeDasharray="4 4"
            strokeLinecap="round"
          />
        );
      })}

      <g transform={`translate(${RING_CX} ${RING_CY})`}>
        <circle cx="0" cy="0" r="38" fill={colors.wheat} stroke={colors.ink} strokeOpacity="0.42" strokeWidth="1.5" />
        <circle cx="0" cy="0" r="32" fill="none" stroke={colors.ink} strokeOpacity="0.1" strokeWidth="0.8" />
        <text x="0" y="-23" textAnchor="middle" dominantBaseline="middle" fill={colors.ink} opacity="0.72" fontFamily="Helvetica Neue, Helvetica, Arial, sans-serif" fontSize="13" fontWeight="900" letterSpacing="1.2">
          2003
        </text>
        <text x="0" y="0" textAnchor="middle" dominantBaseline="middle" fill={colors.ink} opacity="0.38" fontFamily="Helvetica Neue, Helvetica, Arial, sans-serif" fontSize="10" fontWeight="900" letterSpacing="0.8">
          -
        </text>
        <text x="0" y="23" textAnchor="middle" dominantBaseline="middle" fill={colors.ink} opacity="0.72" fontFamily="Helvetica Neue, Helvetica, Arial, sans-serif" fontSize="13" fontWeight="900" letterSpacing="1.2">
          2013
        </text>
      </g>

      <text
        x={RING_CX}
        y={INNER_H - 24}
        textAnchor="middle"
        fill={colors.ink}
        opacity="0.28"
        fontFamily="Helvetica Neue, Helvetica, Arial, sans-serif"
        fontSize="10"
        fontWeight="900"
        letterSpacing="1.2"
      >
        AVG PRINTED-BOOK FREQ PER MILLION - GOOGLE NGRAM EN - 2005-2012
      </text>
    </svg>
  );
}

function HoverInfoPanel({
  activeSlug,
  dataset,
}: {
  activeSlug: string | null;
  dataset: DataSocializedGenerationDataset;
}) {
  const term = activeSlug ? dataset.terms.find((item) => item.slug === activeSlug) : null;
  const relations = activeSlug
    ? dataset.relations.filter((relation) => relation.from === activeSlug || relation.to === activeSlug)
    : [];

  return (
    <div
      className="min-h-[200px] border-t border-ink px-5 py-5"
      style={{
        background: term ? `${circleColor[term.circle]}06` : "transparent",
        transition: "background 200ms ease",
      }}
    >
      {term ? (
        <>
          <p className="font-sans text-[1.35rem] font-black leading-none tracking-tight" style={{ color: circleColor[term.circle] }}>
            {term.label}
          </p>
          <p className="mt-2 font-mono text-[0.72rem] font-black uppercase tracking-[0.16em] text-ink/42">
            {branchLabels[term.branch] ?? term.branch} - {term.coverageStatus}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <p className="font-mono text-[0.6rem] font-black uppercase tracking-[0.18em] text-ink/38">
                avg 1990-2022
              </p>
              <p className="mt-0.5 font-mono text-[1rem] font-black text-ink/80">
                {term.ngramSummary?.average1990_2022?.toFixed(4) ?? "-"}
              </p>
            </div>
            <div>
              <p className="font-mono text-[0.6rem] font-black uppercase tracking-[0.18em] text-ink/38">
                avg 2005-2012
              </p>
              <p className="mt-0.5 font-mono text-[1rem] font-black" style={{ color: circleColor[term.circle] }}>
                {term.ngramSummary?.average2005_2012?.toFixed(4) ?? "-"}
              </p>
            </div>
          </div>
          {relations.length > 0 ? (
            <div className="mt-4">
              <p className="font-mono text-[0.6rem] font-black uppercase tracking-[0.18em] text-ink/38">
                relations
              </p>
              <div className="mt-2 flex flex-col gap-1.5">
                {relations.map((relation) => {
                  const other = relation.from === activeSlug ? relation.to : relation.from;
                  const direction = relation.from === activeSlug ? "->" : "<-";
                  return (
                    <div key={relation.relation_id} className="flex items-baseline gap-2">
                      <span className="font-mono text-[0.78rem] font-black" style={{ color: circleColor[term.circle] }}>
                        {direction}
                      </span>
                      <span className="font-sans text-[0.88rem] font-black text-ink/78">
                        {other.replaceAll("-", " ")}
                      </span>
                      <span className="font-mono text-[0.62rem] font-black uppercase tracking-[0.1em] text-ink/36">
                        {relationLabel(relation.relation_type)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
          <p className="mt-4 text-[0.8rem] font-bold leading-5 text-ink/42">
            {term.firstStrongVisibility ?? "-"}
          </p>
        </>
      ) : (
        <div>
          <p className="font-mono text-[0.72rem] font-black uppercase tracking-[0.18em] text-ink/38">
            hover any term
          </p>
          <p className="mt-2 text-[0.92rem] font-bold leading-6 text-ink/52">
            Arc length shows each term's share of its zone's frequency in print, 2005-2012. Ring thickness reflects how loud each zone was on average.
          </p>
          <p className="mt-3 text-[0.82rem] font-bold leading-5 text-ink/36">
            dataset and metadata dominated print in this decade. big data and data science were nearly absent.
          </p>
        </div>
      )}
    </div>
  );
}

function ZoneLegendPanel() {
  return (
    <div className="flex flex-1 flex-col border-t border-ink px-5 py-5">
      <p className="font-mono text-[0.62rem] font-black uppercase tracking-[0.18em] text-ink/36">
        semantic zones
      </p>
      <div className="mt-3 grid gap-4">
        {[
          ["Trace & Circulation", colors.trace, "web traces / metadata / open data / analytics"],
          ["Identity, Rights & Control", colors.control, "personal data / privacy / breach / governance"],
          ["AI Amplification Tail", colors.ai, "training data / synthetic data as later edge"],
        ].map(([label, color, detail]) => (
          <div key={label} className="grid grid-cols-[1.15rem_1fr] gap-3">
            <span className="mt-1 h-3 w-3 rounded-full border border-ink/40" style={{ backgroundColor: color }} />
            <div>
              <p className="font-mono text-[0.66rem] font-black uppercase tracking-[0.16em]" style={{ color }}>
                {label}
              </p>
              <p className="mt-1 text-[0.82rem] font-bold leading-5 text-ink/56">{detail}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-auto grid gap-3 pt-6">
        <div className="border-t border-ink/20 pt-4">
          <p className="font-mono text-[0.62rem] font-black uppercase tracking-[0.18em] text-nice">
            register basis
          </p>
          <p className="mt-2 text-[0.82rem] font-bold leading-5 text-ink/50">
            Panel B is a frequency register, not a second Venn field: it compresses the 2005-2012 core by printed-book loudness inside each semantic zone.
          </p>
        </div>
        <div className="border-t border-ink/20 pt-4">
          <p className="font-mono text-[0.62rem] font-black uppercase tracking-[0.18em] text-wine">
            reading tension
          </p>
          <p className="mt-2 text-[0.82rem] font-bold leading-5 text-ink/50">
            The quiet terms that dominate this decade show the socialization of data before the later, louder big-data and AI narratives.
          </p>
        </div>
      </div>
    </div>
  );
}

export function DataSocializedGeneration({ dataset }: DataSocializedGenerationProps) {
  const chartRevealRef = useScrollReveal<HTMLDivElement>();
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const outline = dataset.panels.find((panel) => panel.id === "outline");
  const majorTerms = dataset.terms.filter((term) => term.visualRole === "major_label").length;
  const tailTerms = dataset.aiTailTerms.length;

  return (
    <div className="data-socialized-chart border border-ink bg-wheat">
      <div className="grid border-b border-ink md:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="px-4 py-4 sm:px-5">
          <p className="font-mono text-[0.68rem] font-black uppercase tracking-[0.18em] text-nice">
            Chart 2 / semantic socialization
          </p>
          <p className="mt-2 max-w-4xl text-[1.02rem] font-bold leading-[1.55] text-ink/68">
            Data did not become social through AI alone. Before generative systems made data newly visible, a platform generation had already turned data into traces, profiles, public resources, private risks, and governed objects.
          </p>
        </div>
        <div className="border-t border-ink px-4 py-4 md:border-l md:border-t-0">
          <p className="font-mono text-[0.62rem] font-black uppercase tracking-[0.15em] text-ink/42">
            plate basis
          </p>
          <p className="mt-2 font-mono text-[0.7rem] font-black uppercase leading-5 tracking-[0.1em] text-nice">
            2 panels / {dataset.terms.length} terms / {majorTerms} anchors
          </p>
          <p className="mt-2 text-[0.78rem] font-bold leading-5 text-ink/52">
            {tailTerms} AI tail terms stay on the outer rim, not the overlap origin.
          </p>
        </div>
      </div>

      <div ref={chartRevealRef} className="data-chart-reveal overflow-x-auto border-b border-ink">
        <div className="grid min-w-[1340px] grid-cols-[minmax(760px,1fr)_580px] items-start">
          {outline ? (
            <PanelPlate
              panel={outline}
              dataset={dataset}
              activeSlug={activeSlug}
              setActiveSlug={setActiveSlug}
            />
          ) : null}
          <div className="flex h-full self-stretch flex-col border-l border-ink">
            <InnerRingPlate dataset={dataset} activeSlug={activeSlug} setActiveSlug={setActiveSlug} />
            <HoverInfoPanel activeSlug={activeSlug} dataset={dataset} />
            <ZoneLegendPanel />
          </div>
        </div>
      </div>

      <div className="grid gap-4 border-t border-ink px-4 py-4 sm:px-5 md:grid-cols-[1fr_1.15fr]">
        <div>
          <p className="font-mono text-[0.66rem] font-black uppercase tracking-[0.18em] text-nice">
            how to read
          </p>
          <p className="mt-2 text-[0.86rem] font-bold leading-6 text-ink/62">
            The outline plate maps the semantic field with two overlapping circles. The inner ring registers 2005-2012 printed-book visibility by semantic zone, exposing which words were loud before the later big-data story.
          </p>
        </div>
        <div>
          <p className="font-mono text-[0.66rem] font-black uppercase tracking-[0.18em] text-wine">
            caveat
          </p>
          <p className="mt-2 text-[0.86rem] font-bold leading-6 text-ink/62">
            {dataset.caveat}
          </p>
        </div>
      </div>
    </div>
  );
}
