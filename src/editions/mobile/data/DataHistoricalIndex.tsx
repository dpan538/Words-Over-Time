'use client';

import { useState } from "react";

import type {
  DataFunctionGroup,
  DataHistoricalIndexDataset,
  DataHistoricalPanel,
  DataHistoricalTerm,
} from "@/types/dataHistoricalIndex";

type DataHistoricalIndexProps = {
  dataset: DataHistoricalIndexDataset;
};

type Geometry = {
  width: number;
  height: number;
  left: number;
  right: number;
  top: number;
  spineY: number;
  functionY: number;
  functionHeight: number;
};

type EraSeg = {
  startYear: number;
  endYear: number;
  pxPerYear: number;
};

const LEFT = 104;
const RIGHT = 60;

const PHASE_REGISTER_Y = 68;

const ERA_SEGS_A: EraSeg[] = [
  { startYear: 1630, endYear: 1800, pxPerYear: 0.45 },
  { startYear: 1800, endYear: 1900, pxPerYear: 1.2 },
  { startYear: 1900, endYear: 1950, pxPerYear: 2.8 },
  { startYear: 1950, endYear: 1980, pxPerYear: 8 },
  { startYear: 1980, endYear: 2000, pxPerYear: 12 },
  { startYear: 2000, endYear: 2005, pxPerYear: 15 },
];

const ERA_SEGS_B: EraSeg[] = [
  { startYear: 2005, endYear: 2012, pxPerYear: 28 },
  { startYear: 2012, endYear: 2026, pxPerYear: 49.5 },
];

function computeGeometryWidth(segs: EraSeg[], leftMargin: number, rightMargin: number) {
  const plotW = segs.reduce((sum, seg) => sum + (seg.endYear - seg.startYear) * seg.pxPerYear, 0);
  return Math.ceil(leftMargin + plotW + rightMargin);
}

const geometryA: Geometry = {
  width: computeGeometryWidth(ERA_SEGS_A, LEFT, RIGHT),
  height: 950,
  left: LEFT,
  right: RIGHT,
  top: 148,
  spineY: 420,
  functionY: 765,
  functionHeight: 136,
};

const geometryB: Geometry = {
  width: computeGeometryWidth(ERA_SEGS_B, LEFT, RIGHT),
  height: 1080,
  left: LEFT,
  right: RIGHT,
  top: 148,
  spineY: 420,
  functionY: 890,
  functionHeight: 156,
};

const important = new Set(["data", "data_processing", "database", "personal_data", "big_data", "training_data"]);
const colors = {
  ink: "#050510",
  wheat: "#F5ECD2",
  blue: "#1570AC",
  paleBlue: "#2C9FC7",
  governance: "#A1081F",
  training: "#036C17",
  decision: "#AE4202",
  muted: "rgba(5,5,16,0.42)",
};

function eraSegments(panel: DataHistoricalPanel) {
  return panel.id === "panel_a" ? ERA_SEGS_A : ERA_SEGS_B;
}

function piecewiseX(year: number, segs: EraSeg[], leftMargin: number) {
  let x = leftMargin;

  for (const seg of segs) {
    if (year <= seg.startYear) break;
    const reach = Math.min(year, seg.endYear);
    x += (reach - seg.startYear) * seg.pxPerYear;
    if (year <= seg.endYear) break;
  }

  return x;
}

function scaleYear(year: number, panel: DataHistoricalPanel, g: Geometry) {
  return piecewiseX(year, eraSegments(panel), g.left);
}

function termYear(term: DataHistoricalTerm) {
  return term.visualYear ?? term.displayYear;
}

function plotEndX(panel: DataHistoricalPanel, g: Geometry) {
  return scaleYear(panel.endYear, panel, g);
}

function plotWidth(panel: DataHistoricalPanel, g: Geometry) {
  return plotEndX(panel, g) - g.left;
}

function functionBox(group: DataFunctionGroup, groups: DataFunctionGroup[], panel: DataHistoricalPanel, g: Geometry) {
  const index = groups.findIndex((item) => item.id === group.id);
  const step = plotWidth(panel, g) / groups.length;
  return {
    x: g.left + step * index,
    y: g.functionY,
    width: step,
    height: g.functionHeight,
  };
}

function termStrokeWidth(term: DataHistoricalTerm) {
  if (term.importance === "essential") return 3.9;
  if (term.importance === "very high") return 2.7;
  if (term.importance === "medium-high") return 1.75;
  if (term.importance === "high") return 2;
  return 1.45;
}

function termRadius(term: DataHistoricalTerm) {
  if (term.importance === "essential") return 8.4;
  if (term.importance === "very high") return 6.5;
  if (term.importance === "medium-high") return 4.8;
  if (term.importance === "high") return 5.2;
  return 4.2;
}

function roleColor(termOrGroup: { id?: string; functionGroup?: string }) {
  const role = termOrGroup.functionGroup ?? termOrGroup.id;
  if (role === "governance") return colors.governance;
  if (role === "training") return colors.training;
  if (role === "decision") return colors.decision;
  if (role === "platform") return colors.paleBlue;
  if (role === "evidence") return colors.ink;
  if (role === "records") return "#6D5B35";
  if (role === "processing") return "#5B6B82";
  if (role === "storage") return "#315A72";
  if (role === "analysis") return colors.blue;
  if (role === "all") return colors.blue;
  return colors.blue;
}

function relationColor(target: DataHistoricalTerm | undefined, strength: string | undefined) {
  if (strength !== "primary") return colors.paleBlue;
  if (target?.functionGroup === "governance") return colors.governance;
  if (target?.functionGroup === "training") return colors.training;
  if (target?.functionGroup === "decision") return colors.decision;
  return colors.blue;
}

function wordsForSvg(label: string) {
  if (label.length <= 15) return [label];
  const words = label.split(" ");
  if (words.length <= 1) return [label];
  return [words.slice(0, -1).join(" "), words.at(-1) ?? ""];
}

function wrapSvgText(text: string, charsPerLine: number) {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > charsPerLine) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }

  if (current) lines.push(current);
  return lines;
}

function relationLabel(type: string) {
  return type.replaceAll("_", " ");
}

function tickYears(panel: DataHistoricalPanel) {
  if (panel.id === "panel_b") return [2005, 2012, 2016, 2020, 2024, 2026];
  return [1630, 1800, 1900, 1950, 1980, 2000, 2005];
}

function laneYFor(panel: DataHistoricalPanel, term: DataHistoricalTerm) {
  const lane = panel.lanes?.find((item) => item.id === term.laneId);
  if (lane) return lane.y;
  const fallback = panel.lanes?.[term.labelLane ?? 0]?.y;
  return fallback ?? 132;
}

function resolveCollisions(terms: DataHistoricalTerm[], panel: DataHistoricalPanel, g: Geometry, minGap = 85) {
  const byLane = new Map<string, DataHistoricalTerm[]>();
  const adjustments = new Map<string, number>();

  terms.forEach((term) => {
    const lane = term.laneId ?? "unassigned";
    const laneTerms = byLane.get(lane) ?? [];
    laneTerms.push(term);
    byLane.set(lane, laneTerms);
  });

  byLane.forEach((laneTerms) => {
    const sorted = [...laneTerms].sort((a, b) => scaleYear(a.displayYear, panel, g) - scaleYear(b.displayYear, panel, g));
    for (let index = 1; index < sorted.length; index += 1) {
      const prevX = scaleYear(sorted[index - 1].displayYear, panel, g);
      const currX = scaleYear(sorted[index].displayYear, panel, g);
      if (currX - prevX < minGap) {
        adjustments.set(sorted[index].id, index % 2 === 1 ? -38 : 38);
      }
    }
  });

  return adjustments;
}

function frequencyPoints(panel: DataHistoricalPanel, g: Geometry) {
  const series = panel.frequencySeries?.find((item) => item.termId === "data");
  if (!series?.points.length) return [];
  const max = Math.max(...series.points.map((point) => point.value), 1);
  return series.points.map((point) => {
      const x = scaleYear(point.year, panel, g);
      const compressed = Math.sqrt(point.value / max);
      const y = g.spineY - 24 - compressed * (panel.density === "dense" ? 132 : 154);
      return { x, y };
  });
}

function frequencyPath(panel: DataHistoricalPanel, g: Geometry) {
  return frequencyPoints(panel, g)
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(" ");
}

function frequencyAreaPath(panel: DataHistoricalPanel, g: Geometry) {
  const points = frequencyPoints(panel, g);
  const first = points[0];
  const last = points.at(-1);
  if (!first || !last) return "";
  const line = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(" ");
  return `${line} L ${last.x.toFixed(2)} ${g.spineY} L ${first.x.toFixed(2)} ${g.spineY} Z`;
}

function PanelSvg({ panel }: { panel: DataHistoricalPanel }) {
  const [activeTerm, setActiveTerm] = useState<string | null>(null);
  const [activeArc, setActiveArc] = useState<string | null>(null);
  const isIdle = activeTerm === null && activeArc === null;
  const g = panel.density === "dense" ? geometryB : geometryA;
  const termsById = new Map(panel.terms.map((term) => [term.id, term]));
  const groupsById = new Map(panel.functions.map((group) => [group.id, group]));
  const activeArcRelation = panel.relations.find((relation) => `${relation.source}-${relation.target}` === activeArc);
  const sparkline = frequencyPath(panel, g);
  const sparklineArea = frequencyAreaPath(panel, g);
  const domainEndX = plotEndX(panel, g);
  const collisionDy = resolveCollisions(panel.terms, panel, g);

  return (
    <svg
      role="img"
      aria-labelledby={`${panel.id}-title ${panel.id}-desc`}
      viewBox={`0 0 ${g.width} ${g.height}`}
      className="bg-wheat"
      style={{ display: "block", minWidth: `${g.width}px`, width: "100%" }}
    >
      <title id={`${panel.id}-title`}>{`${panel.tag}: ${panel.label}`}</title>
      <desc id={`${panel.id}-desc`}>{panel.summary}</desc>

      <defs>
        <pattern id={`${panel.id}-grid`} width="34" height="34" patternUnits="userSpaceOnUse">
          <path d="M 34 0 L 0 0 0 34" fill="none" stroke="#050510" strokeOpacity="0.07" strokeWidth="1" />
        </pattern>
        <pattern id={`${panel.id}-hatch`} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="6" stroke={colors.ink} strokeOpacity="0.07" strokeWidth="1.5" />
        </pattern>
      </defs>

      <rect width={g.width} height={g.height} fill={colors.wheat} />
      <rect x={g.left} y={g.top} width={plotWidth(panel, g)} height={g.functionY - g.top} fill={`url(#${panel.id}-grid)`} />
      {panel.id === "panel_a" ? (
        <g>
          <rect
            x={scaleYear(1630, panel, g)}
            y={g.top}
            width={scaleYear(1800, panel, g) - scaleYear(1630, panel, g)}
            height={g.functionY - g.top}
            fill={`url(#${panel.id}-hatch)`}
          />
          <line
            x1={scaleYear(1800, panel, g)}
            x2={scaleYear(1800, panel, g)}
            y1={g.top - 8}
            y2={g.functionY}
            stroke={colors.blue}
            strokeOpacity="0.5"
            strokeWidth="1.4"
            strokeDasharray="5 4"
          />
          <text x={scaleYear(1800, panel, g) + 5} y={g.top - 14} fill={colors.blue} opacity="0.55" fontFamily="Helvetica Neue, Helvetica, Arial, sans-serif" fontSize="9" fontWeight="900" letterSpacing="1.2">
            NGRAM BEGINS 1800
          </text>
          <text x={(scaleYear(1630, panel, g) + scaleYear(1800, panel, g)) / 2} y={g.top - 28} textAnchor="middle" fill={colors.ink} opacity="0.32" fontFamily="Helvetica Neue, Helvetica, Arial, sans-serif" fontSize="8.5" fontWeight="900" letterSpacing="1.4">
            PRE-CORPUS / DICTIONARY ATTESTATION ONLY
          </text>
        </g>
      ) : null}
      <line x1={g.left} x2={g.left} y1={0} y2={g.height} stroke={colors.ink} strokeOpacity="0.3" strokeWidth="1.8" />
      <circle cx={g.left} cy={g.top} r="4" fill={colors.ink} opacity="0.28" />
      {panel.id === "panel_a" ? <circle cx={g.left} cy={g.height - 2} r="4" fill={colors.blue} opacity="0.45" /> : null}
      {panel.id === "panel_b" ? <circle cx={g.left} cy={2} r="4" fill={colors.blue} opacity="0.45" /> : null}

      <line x1={0} x2={g.width} y1={PHASE_REGISTER_Y - 4} y2={PHASE_REGISTER_Y - 4} stroke={colors.ink} strokeOpacity="0.28" strokeWidth="1.5" />
      <text x={g.left + 8} y={26} fill={colors.blue} fontFamily="Helvetica Neue, Helvetica, Arial, sans-serif" fontSize="12" fontWeight="900" letterSpacing="2.75">
        {panel.tag.toUpperCase()}
      </text>
      <text x={g.left + 8} y={55} fill={colors.ink} fontFamily="Helvetica Neue, Helvetica, Arial, sans-serif" fontSize="30" fontWeight="900" letterSpacing="0">
        {panel.label}
      </text>
      <text x={g.width - g.right} y={56} textAnchor="end" fill={colors.ink} opacity="0.42" fontFamily="Helvetica Neue, Helvetica, Arial, sans-serif" fontSize="15" fontWeight="900" letterSpacing="1.45">
        {panel.startYear}-{panel.endYear === 2026 ? "2026 / PRESENT" : panel.endYear}
      </text>

      {panel.phases?.map((phase, index) => {
        const x = scaleYear(phase.startYear, panel, g);
        const x2 = scaleYear(phase.endYear, panel, g);
        const phaseW = x2 - x;
        const isWide = phaseW >= 180;
        const isMedium = phaseW >= 90 && phaseW < 180;
        const labelText = isWide
          ? phase.label.toUpperCase()
          : isMedium
            ? phase.label.split("/")[0].trim().toUpperCase()
            : null;
        const centerX = (x + x2) / 2;
        const labelX = centerX;
        return (
          <g key={phase.id}>
            <rect
              x={x}
              y={g.top}
              width={x2 - x}
              height={g.functionY - g.top}
              fill={index % 2 === 0 ? colors.blue : colors.ink}
              opacity={index % 2 === 0 ? 0.055 : 0.038}
            />
            <line x1={x} x2={x} y1={PHASE_REGISTER_Y + 4} y2={g.functionY + g.functionHeight} stroke={colors.ink} strokeOpacity="0.18" strokeWidth="1" strokeDasharray="4 6" />
            {labelText ? (
              <text x={labelX} y={g.top - 42} textAnchor="middle" fill={colors.blue} fontFamily="Helvetica Neue, Helvetica, Arial, sans-serif" fontSize={isWide ? "13" : "11"} fontWeight="900" letterSpacing={isWide ? "1.8" : "0.8"}>
                {labelText}
              </text>
            ) : null}
            <text x={centerX} y={g.top - 24} textAnchor="middle" fill={colors.ink} opacity="0.38" fontFamily="Helvetica Neue, Helvetica, Arial, sans-serif" fontSize="11" fontWeight="700">
              {phase.startYear}-{phase.endYear}
            </text>
          </g>
        );
      })}

      {panel.density !== "dense" && panel.branchGroups?.map((branch, index) => {
        const x = scaleYear(branch.startYear, panel, g);
        const x2 = scaleYear(branch.endYear, panel, g);
        const y = g.top + 8 + index * 38;
        const labelX = index % 2 === 0 ? x + 12 : Math.min(x + 12, x2 - 12);
        return (
          <g key={branch.id}>
            <rect x={x} y={y} width={Math.max(24, x2 - x)} height="24" fill={colors.paleBlue} opacity={index % 2 === 0 ? 0.08 : 0.045} stroke={colors.paleBlue} strokeOpacity="0.22" />
            <text x={labelX} y={y + 12} dominantBaseline="middle" fill={colors.blue} fontFamily="Helvetica Neue, Helvetica, Arial, sans-serif" fontSize={panel.density === "dense" ? "12.5" : "12"} fontWeight="900" letterSpacing="1.15">
              {branch.label.toUpperCase()}
            </text>
          </g>
        );
      })}

      <line x1={g.left} x2={domainEndX} y1={g.top - 8} y2={g.top - 8} stroke={colors.ink} strokeOpacity="0.42" strokeWidth="2" />
      <line x1={g.left - 1} x2={g.left - 1} y1={g.top} y2={g.functionY} stroke={colors.ink} strokeOpacity="0.22" strokeWidth="1.5" />

      {panel.lanes?.map((lane) => (
        <g key={lane.id}>
          <line x1={g.left} x2={domainEndX} y1={lane.y + 26} y2={lane.y + 26} stroke={colors.ink} strokeOpacity="0.12" />
          <rect x={0} y={lane.y + 14} width={g.left - 8} height="20" fill={colors.blue} opacity="0.05" />
          <text x={g.left - 14} y={lane.y + 29} textAnchor="end" fill={colors.ink} fillOpacity="0.54" fontFamily="Helvetica Neue, Helvetica, Arial, sans-serif" fontSize="7.9" fontWeight="900" letterSpacing="0.9">
            {lane.label.toUpperCase()}
          </text>
        </g>
      ))}

      <line
        x1={scaleYear(panel.endYear, panel, g)}
        x2={scaleYear(panel.endYear, panel, g)}
        y1={g.top}
        y2={g.functionY + g.functionHeight}
        stroke={colors.ink}
        strokeOpacity="0.28"
      />

      {tickYears(panel).map((year) => {
        const x = scaleYear(year, panel, g);
        return (
          <g key={year}>
            <line x1={x} x2={x} y1={g.spineY - 14} y2={g.spineY + 14} stroke={colors.ink} strokeWidth="2.1" />
            <text x={x} y={g.spineY + 42} textAnchor="middle" fill={colors.ink} opacity="0.62" fontFamily="Helvetica Neue, Helvetica, Arial, sans-serif" fontSize="13" fontWeight="900">
              {year}
            </text>
          </g>
        );
      })}

      {sparkline ? (
        <g>
          <path d={sparklineArea} fill={colors.blue} opacity="0.048" />
          <path d={sparkline} fill="none" stroke={colors.blue} strokeOpacity="0.18" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
          <path d={sparkline} fill="none" stroke={colors.blue} strokeOpacity="0.72" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          <text x={g.left + 4} y={g.spineY - (panel.density === "dense" ? 138 : 118)} textAnchor="start" fill={colors.blue} opacity="0.52" fontFamily="Helvetica Neue, Helvetica, Arial, sans-serif" fontSize="9.25" fontWeight="900" letterSpacing="1.05">
            PRINTED-BOOK VISIBILITY
          </text>
        </g>
      ) : null}

      <line x1={g.left} x2={domainEndX} y1={g.spineY} y2={g.spineY} stroke={colors.ink} strokeWidth="3.6" />

      {panel.relations.map((relation, index) => {
        const source = termsById.get(relation.source);
        const target = termsById.get(relation.target);
        if (!source || !target) return null;
        const arcKey = `${relation.source}-${relation.target}`;
        const x1 = scaleYear(termYear(source), panel, g);
        const x2 = scaleYear(termYear(target), panel, g);
        const y1 = laneYFor(panel, source) + 22;
        const y2 = laneYFor(panel, target) + 22;
        const primary = relation.strength === "primary";
        const isTermMatch = activeTerm === relation.source || activeTerm === relation.target;
        const isArcMatch = activeArc === arcKey;
        const arcOpacity = isIdle ? (primary ? 0.14 : 0.05) : isTermMatch || isArcMatch ? (primary ? 0.82 : 0.42) : 0.03;
        const arcWidth = isIdle ? (primary ? 1.6 : 0.9) : isTermMatch || isArcMatch ? (primary ? 2.8 : 1.6) : 0.7;
        const arcY = Math.max(g.top + 18, Math.min(y1, y2) - (primary ? 54 : 38) - (index % (panel.density === "dense" ? 4 : 3)) * 10);
        const mid = (x1 + x2) / 2;
        const stroke = relationColor(target, relation.strength);
        return (
          <g
            key={`${arcKey}-${relation.type}`}
            style={{ cursor: "pointer" }}
            onMouseEnter={() => setActiveArc(arcKey)}
            onMouseLeave={() => setActiveArc(null)}
          >
            <path
              d={`M ${x1} ${y1} C ${mid} ${arcY}, ${mid} ${arcY}, ${x2} ${y2}`}
              fill="none"
              stroke="rgba(0,0,0,0.001)"
              strokeWidth="18"
              style={{ pointerEvents: "stroke" }}
            />
            <path
              d={`M ${x1} ${y1} C ${mid} ${arcY}, ${mid} ${arcY}, ${x2} ${y2}`}
              fill="none"
              stroke={stroke}
              strokeOpacity={arcOpacity}
              strokeWidth={arcWidth}
              strokeLinecap="round"
              style={{ transition: "stroke-opacity 140ms ease, stroke-width 140ms ease" }}
            />
            {(isTermMatch || isArcMatch) && primary ? (
              <text x={mid} y={arcY - 9} textAnchor="middle" fill={stroke} opacity="0.78" fontFamily="Helvetica Neue, Helvetica, Arial, sans-serif" fontSize="11.5" fontWeight="900" letterSpacing="1.1">
                {relationLabel(relation.type).toUpperCase()}
              </text>
            ) : null}
          </g>
        );
      })}

      {panel.terms.map((term) => {
        const x = scaleYear(termYear(term), panel, g);
        const y = laneYFor(panel, term);
        const group = term.functionGroup === "all" ? null : groupsById.get(term.functionGroup);
        const isKey = important.has(term.id);
        const isPreCorpus = term.frequency.status === "pre-corpus";
        const isActiveTerm =
          activeTerm === term.id ||
          activeArcRelation?.source === term.id ||
          activeArcRelation?.target === term.id;
        const labelLines = wordsForSvg(term.term);
        const labelX = x + (term.labelDx ?? 10);
        const labelY = y + (term.labelDy ?? 0) + (collisionDy.get(term.id) ?? 0);
        const labelAnchor = term.labelAnchor ?? "start";
        const labelSize = panel.density === "dense" ? (isKey ? 14 : 11) : isKey ? 17 : 12;
        const accent = roleColor(term);
        const leaderEndX = labelX + (labelAnchor === "end" ? 14 : -14);
        const branchLabelY = labelY + 24 + (labelLines.length - 1) * (labelSize + 2) + (term.branchLabelDy ?? 0);
        const provisionalLabelY = branchLabelY + 14 + (term.provisionalLabelDy ?? 0);
        return (
          <g
            key={term.id}
            style={{ cursor: "pointer" }}
          onMouseEnter={() => setActiveTerm(term.id)}
          onMouseLeave={() => setActiveTerm(null)}
          >
            <line
              x1={x}
              x2={x}
              y1={y + 26}
              y2={isPreCorpus ? g.spineY : g.functionY}
              stroke={colors.ink}
              strokeOpacity={isPreCorpus ? 0.28 : isKey ? 0.58 : 0.34}
              strokeWidth={isPreCorpus ? 1.3 : termStrokeWidth(term)}
            />
            {!isPreCorpus ? (
              <line x1={x} x2={x} y1={g.functionY} y2={g.functionY + 32} stroke={accent} strokeOpacity={term.functionGroup === "all" ? 0.18 : 0.58} strokeWidth={term.functionGroup === "all" ? 1.2 : 1.7} />
            ) : null}
            <line x1={x} x2={leaderEndX} y1={y + 26} y2={labelY - 7} stroke={accent} strokeOpacity="0.34" strokeWidth="1.1" />
            {term.id === "data" || term.id === "big_data" || term.importance === "essential" ? (
              <circle cx={x} cy={g.spineY} r={termRadius(term) + 5} fill="none" stroke={colors.blue} strokeOpacity="0.18" strokeWidth="1.5" />
            ) : null}
            <circle
              cx={x}
              cy={g.spineY}
              r={isKey ? termRadius(term) : 2.5}
              fill={isKey ? colors.blue : colors.wheat}
              stroke={colors.ink}
              strokeWidth={isKey ? 2 : 1}
              opacity={isKey ? 1 : 0.55}
            />
            <circle
              cx={x}
              cy={y + 26}
              r={termRadius(term) + (isActiveTerm ? 5 : 1.1)}
              fill={colors.wheat}
              stroke={accent}
              strokeWidth={isActiveTerm ? 2.4 : isKey ? 2.2 : 1.45}
              style={{ transition: "r 120ms ease, stroke-width 120ms ease" }}
            />
            <text x={labelX} y={labelY} textAnchor={labelAnchor} fill={isKey ? "#1570AC" : "#050510"} fontFamily="Helvetica Neue, Helvetica, Arial, sans-serif" fontSize={labelSize} fontWeight="900">
              {labelLines.map((line, lineIndex) => (
                <tspan key={`${term.id}-${line}`} x={labelX} dy={lineIndex === 0 ? 0 : labelSize + 2}>
                  {line}
                </tspan>
              ))}
            </text>
            <text x={labelX} y={branchLabelY} textAnchor={labelAnchor} fill={accent} opacity="0.58" fontFamily="Helvetica Neue, Helvetica, Arial, sans-serif" fontSize="9.5" fontWeight="900" letterSpacing="0.75">
              {term.branch.toUpperCase()}
            </text>
            {term.frequency.status === "provisional" ? (
              <text x={labelX} y={provisionalLabelY} textAnchor={labelAnchor} fill={colors.governance} opacity="0.78" fontFamily="Helvetica Neue, Helvetica, Arial, sans-serif" fontSize="8.5" fontWeight="900" letterSpacing="0.75">
                PROVISIONAL
              </text>
            ) : null}
          </g>
        );
      })}

      <g>
        <line x1={g.left} x2={domainEndX} y1={g.functionY} y2={g.functionY} stroke={colors.ink} strokeWidth="2.8" />
        <text x={g.left - 14} y={g.functionY + 22} textAnchor="end" fill={colors.ink} fillOpacity="0.36" fontFamily="Helvetica Neue, Helvetica, Arial, sans-serif" fontSize="10" fontWeight="900" letterSpacing="1.55">
          FUNCTION
        </text>
        {panel.functions.map((group, index) => {
          const box = functionBox(group, panel.functions, panel, g);
          const accent = roleColor(group);
          const quieterFunction = group.id === "processing" || group.id === "storage" || group.id === "analysis";
          const functionLabelSize = quieterFunction ? 12.15 : 13.5;
          const functionDescriptionSize = quieterFunction ? 9.7 : 10.8;
          const descriptionLineHeight = quieterFunction ? 14.4 : 15.3;
          const charsPerLine = Math.max(16, Math.floor((box.width - 32) / (quieterFunction ? 7 : 7.55)));
          const descLines = wrapSvgText(group.meaning, charsPerLine).slice(0, 4);
          return (
            <g key={group.id}>
              <rect
                x={box.x}
                y={box.y}
                width={box.width}
                height={box.height}
                fill={colors.wheat}
                stroke={colors.ink}
                strokeOpacity="0.38"
              />
              <rect x={box.x} y={box.y} width={box.width} height="14" fill={accent} opacity="0.82" />
              {index > 0 ? <line x1={box.x} x2={box.x} y1={box.y} y2={box.y + box.height} stroke={colors.ink} strokeOpacity="0.42" /> : null}
              <text x={box.x + 16} y={box.y + 42} fill={accent} fontFamily="Helvetica Neue, Helvetica, Arial, sans-serif" fontSize={functionLabelSize} fontWeight="900" letterSpacing="1.25">
                {group.label.toUpperCase()}
              </text>
              <text x={box.x + 16} y={box.y + 64} fill={colors.ink} fillOpacity="0.52" fontFamily="Helvetica Neue, Helvetica, Arial, sans-serif" fontSize={functionDescriptionSize} fontWeight="700" letterSpacing="0.15">
                {descLines.map((line, lineIndex) => (
                  <tspan key={`${group.id}-${line}`} x={box.x + 16} dy={lineIndex === 0 ? 0 : descriptionLineHeight}>
                    {line}
                  </tspan>
                ))}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}

export function DataHistoricalIndex({ dataset }: DataHistoricalIndexProps) {
  const termCount = dataset.panels.reduce((count, panel) => count + panel.terms.length, 0);
  const panelA = dataset.panels[0];
  const panelB = dataset.panels[1];

  return (
    <div className="border border-ink bg-wheat">
      <div className="grid border-b border-ink md:grid-cols-[1fr_18rem]">
        <div className="px-4 py-4 sm:px-5">
          <p className="font-mono text-[0.68rem] font-black uppercase tracking-[0.18em] text-nice">
            Chart 1 / historical index
          </p>
          <p className="mt-2 max-w-4xl text-[1.02rem] font-bold leading-[1.55] text-ink/68">
            This index traces how data moves from given facts into systems of collection, processing, storage, governance, and training. The upper panel shows long formation; the lower panel expands the contemporary period where terms and relations accelerate.
          </p>
        </div>
        <div className="border-t border-ink px-4 py-4 md:border-l md:border-t-0">
          <p className="font-mono text-[0.62rem] font-black uppercase tracking-[0.15em] text-ink/42">
            display basis
          </p>
          <p className="mt-2 font-mono text-[0.7rem] font-black uppercase leading-5 tracking-[0.1em] text-nice">
            2 panels / {termCount} stems
          </p>
          <p className="mt-2 text-[0.78rem] font-bold leading-5 text-ink/52">
            Time spacing is density-weighted; frequency remains background context.
          </p>
        </div>
      </div>

      {panelA ? (
        <div className="overflow-x-auto border-b border-ink/70">
          <PanelSvg panel={panelA} />
        </div>
      ) : null}

      {panelB?.hinge ? (
        <div className="relative flex h-16 items-center border-b border-t border-ink bg-wheat">
          <div className="pointer-events-none absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-ink/30" />
          <div className="relative z-10 flex h-full items-center border-r border-ink bg-wheat px-5">
            <div>
              <p className="font-mono text-[0.6rem] font-black uppercase tracking-[0.2em] text-ink/38">
                panel a ends
              </p>
              <p className="font-mono text-[1.1rem] font-black leading-none text-nice">
                {panelA?.endYear ?? 1980}
              </p>
            </div>
          </div>
          <div className="relative z-10 flex-1 px-6">
            <p className="max-w-3xl bg-wheat pr-4 font-mono text-[0.76rem] font-black uppercase leading-5 tracking-[0.1em] text-ink/52">
              {panelB.hinge}
            </p>
          </div>
          <div className="relative z-10 flex h-full items-center border-l border-ink bg-wheat px-5">
            <div className="text-right">
              <p className="font-mono text-[0.6rem] font-black uppercase tracking-[0.2em] text-ink/38">
                panel b begins
              </p>
              <p className="font-mono text-[1.1rem] font-black leading-none text-nice">
                {panelB?.startYear ?? 1980}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {panelB ? (
        <div className="overflow-x-auto border-b border-ink">
          <PanelSvg panel={panelB} />
        </div>
      ) : null}

      <div className="grid gap-4 px-4 py-4 sm:px-5 md:grid-cols-[1fr_1.15fr]">
        <div>
          <p className="font-mono text-[0.66rem] font-black uppercase tracking-[0.18em] text-nice">
            how to read
          </p>
          <p className="mt-2 text-[0.86rem] font-bold leading-6 text-ink/62">
            Each panel uses a density-weighted time scale, lane system, and function band. Stems connect terms to functions; hover a term or arc to read the relation paths.
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
