"use client";

import { useMemo, useState } from "react";

import type {
  DataDatumRouteDataset,
  DatumRouteAnnotation,
  DatumRouteEdge,
  DatumRouteNode,
  DatumRouteTrackId,
} from "@/types/dataDatumRoute";

type DataDatumRouteProps = {
  dataset: DataDatumRouteDataset;
};

type Point = {
  x: number;
  y: number;
};

const W = 1480;
const H = 860;
const PAD_X = 72;
const PAD_TOP = 96;
const ROUTE_W = W - PAD_X * 2;
const ROUTE_H = 680;
const ANNO_Y = 778;
const ANNO_COLS = 4;
const ANNO_W = ROUTE_W / ANNO_COLS;

const colors = {
  ink: "#050510",
  wheat: "#F5ECD2",
  blue: "#1570AC",
  rust: "#A1081F",
  green: "#036C17",
  quiet: "#8F846C",
  pale: "#CDBF99",
};

const trackColor: Record<DatumRouteTrackId, string> = {
  entry: colors.ink,
  fork: colors.ink,
  plural_evidentiary: colors.blue,
  singular_infrastructural: colors.rust,
  extension: colors.green,
};

const PHASES = [
  { label: "Singular Origin", xStart: 0, xEnd: 0.24, color: colors.ink },
  { label: "Grammatical Fork", xStart: 0.24, xEnd: 0.52, color: colors.blue },
  { label: "Infrastructural Build", xStart: 0.52, xEnd: 0.72, color: colors.rust },
  { label: "Coexistence / Tail", xStart: 0.72, xEnd: 1, color: colors.green },
];

function point(node: Pick<DatumRouteNode, "x" | "y">): Point {
  return {
    x: PAD_X + node.x * ROUTE_W,
    y: PAD_TOP + node.y * ROUTE_H,
  };
}

function annotationPoint(annotation: DatumRouteAnnotation): Point {
  return {
    x: PAD_X + annotation.x * ROUTE_W,
    y: PAD_TOP + annotation.y * ROUTE_H,
  };
}

function wrapText(text: string, charsPerLine: number) {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > charsPerLine && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }

  if (current) lines.push(current);
  return lines;
}

function nodeRadius(node: DatumRouteNode) {
  if (node.id === "data") return 17;
  if (node.id === "data_processing" || node.id === "database") return 13.5;
  if (node.level === "major") return 11.5;
  return 7.2;
}

function nodeLabelAnchor(node: DatumRouteNode): "start" | "middle" | "end" {
  if (node.id === "statistical_data") return "end";
  if (node.id === "data_as_resource") return "end";
  if (node.id === "training_data") return "end";
  if (node.x > 0.86) return "end";
  if (node.id === "datum" || node.id === "data") return "middle";
  return "start";
}

function labelOffset(node: DatumRouteNode) {
  if (node.id === "datum") return { dx: 0, dy: -35 };
  if (node.id === "data") return { dx: 0, dy: -78 };
  if (node.id === "statistical_data") return { dx: -18, dy: 36 };
  if (node.id === "empirical_data") return { dx: 14, dy: 58 };
  if (node.id === "data_as_resource") return { dx: -13, dy: -26 };
  if (node.track === "plural_evidentiary") return { dx: 16, dy: -48 };
  if (node.id === "training_data") return { dx: -13, dy: 26 };
  return { dx: 13, dy: 28 };
}

function edgeStroke(edge: DatumRouteEdge, nodesById: Map<string, DatumRouteNode>) {
  if (edge.role === "lexical_derivation") return colors.ink;
  if (edge.emphasis === "quiet") return colors.quiet;
  const target = nodesById.get(edge.target);
  if (target?.track === "plural_evidentiary") return colors.blue;
  if (target?.track === "extension") return colors.green;
  if (target?.track === "singular_infrastructural") return colors.rust;
  return colors.ink;
}

function edgeOpacity(edge: DatumRouteEdge, activeEdge: string | null, activeNode: string | null) {
  const active = activeEdge === edge.id || activeNode === edge.source || activeNode === edge.target;
  if (active) return edge.emphasis === "quiet" ? 0.64 : 0.92;
  if (activeNode || activeEdge) return 0.065;
  if (edge.emphasis === "primary") return 0.48;
  if (edge.emphasis === "secondary") return 0.24;
  return 0.14;
}

function edgeWidth(edge: DatumRouteEdge, activeEdge: string | null, activeNode: string | null) {
  const active = activeEdge === edge.id || activeNode === edge.source || activeNode === edge.target;
  if (active) return edge.emphasis === "primary" ? 2.6 : 1.9;
  if (edge.emphasis === "primary") return 2.2;
  if (edge.emphasis === "secondary") return 1.4;
  return 1.1;
}

function edgePath(edge: DatumRouteEdge, nodesById: Map<string, DatumRouteNode>) {
  const source = nodesById.get(edge.source);
  const target = nodesById.get(edge.target);
  if (!source || !target) return "";

  const p1 = point(source);
  const p2 = point(target);
  const dx = p2.x - p1.x;
  const curve = edge.curvature * 320;
  const cp1x = p1.x + dx * 0.42;
  const cp1y = p1.y + curve * 0.55;
  const cp2x = p2.x - dx * 0.42;
  const cp2y = p2.y + curve * 0.45;

  if (Math.abs(edge.curvature) < 0.02) {
    return `M ${p1.x.toFixed(1)} ${p1.y.toFixed(1)} L ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }

  return `M ${p1.x.toFixed(1)} ${p1.y.toFixed(1)} C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)} ${cp2x.toFixed(1)} ${cp2y.toFixed(1)} ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
}

type EvidencePoint = {
  px: number;
  py: number;
  value: number;
  year: number;
};

function smoothCurvePath(points: EvidencePoint[]) {
  if (points.length < 2) return "";

  let d = `M ${points[0].px.toFixed(1)} ${points[0].py.toFixed(1)}`;

  for (let index = 0; index < points.length - 1; index += 1) {
    const p0 = points[Math.max(index - 1, 0)];
    const p1 = points[index];
    const p2 = points[index + 1];
    const p3 = points[Math.min(index + 2, points.length - 1)];
    const tension = 0.42;
    const cp1x = p1.px + ((p2.px - p0.px) * tension) / 3;
    const cp1y = p1.py + ((p2.py - p0.py) * tension) / 3;
    const cp2x = p2.px - ((p3.px - p1.px) * tension) / 3;
    const cp2y = p2.py - ((p3.py - p1.py) * tension) / 3;

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)} ${cp2x.toFixed(1)} ${cp2y.toFixed(1)} ${p2.px.toFixed(1)} ${p2.py.toFixed(1)}`;
  }

  return d;
}

function areaPath(points: EvidencePoint[], baseY: number) {
  if (points.length < 2) return "";
  const first = points[0];
  const last = points[points.length - 1];
  return `${smoothCurvePath(points)} L ${last.px.toFixed(1)} ${baseY.toFixed(1)} L ${first.px.toFixed(1)} ${baseY.toFixed(1)} Z`;
}

function EvidenceStrip({
  dataset,
  fullW = 1236,
  offsetX = 72,
  offsetY = 20,
  h = 160,
}: {
  dataset: DataDatumRouteDataset;
  fullW?: number;
  offsetX?: number;
  offsetY?: number;
  h?: number;
}) {
  const x = offsetX;
  const y = offsetY;
  const w = fullW;
  const labelX = x + w + 34;
  const start = dataset.sparkline.startYear;
  const end = dataset.sparkline.endYear;
  const globalMax = 22;
  const baselineY = y + h - 10;
  const sourceMax = Math.max(...dataset.sparkline.series.flatMap((series) => series.points.map((pointItem) => pointItem.value)), 1);
  const valueToY = (value: number) => baselineY - (value / globalMax) * (h - 30);
  const seriesPoints = dataset.sparkline.series.map((series) =>
    series.points.map((item) => ({
      px: x + ((item.year - start) / (end - start)) * w,
      py: valueToY(item.value),
      value: item.value,
      year: item.year,
    })),
  );

  const crossingX = dataset.sparkline.crossingYear
    ? x + ((dataset.sparkline.crossingYear - start) / (end - start)) * w
    : null;
  const crossingY =
    crossingX && dataset.sparkline.crossingMarker?.normalized !== null && dataset.sparkline.crossingMarker?.normalized !== undefined
      ? valueToY(dataset.sparkline.crossingMarker.normalized * sourceMax)
      : null;

  return (
    <g>
      <rect x={x - 16} y={y - 10} width={w + 148} height={h + 30} fill={colors.wheat} fillOpacity="0.82" stroke={colors.ink} strokeOpacity="0.22" />
      <text x={x} y={y + 12} fill={colors.ink} opacity="0.54" fontFamily="monospace" fontSize="10.5" fontWeight="900" letterSpacing="1.2">
        EVIDENCE STRIP / PRINTED-BOOK VISIBILITY
      </text>
      {[5, 10, 15, 20].map((tick) => {
        const tickY = valueToY(tick);
        return (
          <g key={tick}>
            <line x1={x - 6} x2={x + w} y1={tickY} y2={tickY} stroke={colors.ink} strokeOpacity="0.08" strokeWidth="1" />
            <text x={x - 9} y={tickY + 3.5} textAnchor="end" fill={colors.ink} opacity="0.34" fontFamily="monospace" fontSize="8.5" fontWeight="900">
              {tick}
            </text>
          </g>
        );
      })}
      <text
        x={x - 32}
        y={y + h / 2}
        textAnchor="middle"
        fill={colors.ink}
        opacity="0.28"
        fontFamily="monospace"
        fontSize="8"
        fontWeight="900"
        letterSpacing="1.2"
        style={{ writingMode: "vertical-rl" }}
        transform={`rotate(180, ${x - 32}, ${y + h / 2})`}
      >
        FREQ / M
      </text>
      <line x1={x} x2={x + w} y1={baselineY} y2={baselineY} stroke={colors.ink} strokeOpacity="0.2" />
      {[1950, 1980, 2010, 2022].map((year) => {
        const px = x + ((year - start) / (end - start)) * w;
        return (
          <g key={year}>
            <line x1={px} x2={px} y1={y + 8} y2={baselineY + 5} stroke={colors.ink} strokeOpacity="0.07" />
            <text x={px} y={y + h + 11} textAnchor="middle" fill={colors.ink} opacity="0.36" fontFamily="monospace" fontSize="9.5" fontWeight="900">
              {year}
            </text>
          </g>
        );
      })}
      {crossingX ? (
        <g>
          <rect x={crossingX - 28} y={y - 10} width="56" height={h + 20} fill={colors.rust} opacity="0.05" />
          <line x1={crossingX} x2={crossingX} y1={y + 20} y2={baselineY} stroke={colors.rust} strokeOpacity="0.22" strokeWidth="1.2" />
          <text x={crossingX} y={y + 16} textAnchor="middle" fill={colors.rust} opacity="0.68" fontFamily="monospace" fontSize="9" fontWeight="900" letterSpacing="0.8">
            ~2020
          </text>
          {crossingY ? (
            <circle cx={crossingX} cy={crossingY} r="4" fill={colors.rust} opacity="0.82" />
          ) : null}
        </g>
      ) : null}
      {[0, 1].map((index) => (
        <path
          key={`area-${dataset.sparkline.series[index]?.id ?? index}`}
          d={areaPath(seriesPoints[index], baselineY)}
          fill={index === 0 ? colors.blue : colors.rust}
          opacity="0.05"
        />
      ))}
      {dataset.sparkline.series.map((series, index) => (
        <path
          key={series.id}
          d={smoothCurvePath(seriesPoints[index])}
          fill="none"
          stroke={series.color}
          strokeOpacity={index < 2 ? (index === 0 ? 0.76 : 0.84) : 0.42}
          strokeWidth={index < 2 ? 2.35 : 1.45}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={index < 2 ? undefined : "4 5"}
        />
      ))}
      {seriesPoints.map((points, index) => {
        const last = points[points.length - 1];
        const series = dataset.sparkline.series[index];
        const labelY = [y + 88, y + 105, y + 145, y + 169][index] ?? last.py;
        return (
          <g key={`label-${series.id}`}>
            <line
              x1={last.px + 4}
              x2={labelX - 8}
              y1={last.py}
              y2={labelY - 3}
              stroke={series.color}
              strokeOpacity={index < 2 ? 0.22 : 0.12}
              strokeWidth={index < 2 ? "1.1" : "0.8"}
            />
            <text
              x={labelX}
              y={labelY}
              fill={series.color}
              fontFamily="monospace"
              fontSize="9.5"
              fontWeight="900"
              letterSpacing="0.5"
              opacity={index < 2 ? 0.82 : 0.52}
            >
              {series.label.toUpperCase()}
            </text>
          </g>
        );
      })}
    </g>
  );
}

function NodeGlyph({
  node,
  activeNode,
  setActiveNode,
}: {
  node: DatumRouteNode;
  activeNode: string | null;
  setActiveNode: (id: string | null) => void;
}) {
  const p = point(node);
  const radius = nodeRadius(node);
  const color = trackColor[node.track];
  const active = activeNode === node.id;
  const dimmed = activeNode !== null && !active;
  const label = labelOffset(node);
  const anchor = nodeLabelAnchor(node);
  const labelX = p.x + label.dx;
  const labelY = p.y + label.dy;
  const noteLines = wrapText(node.note, node.id === "data_processing" ? 28 : 24).slice(0, 2);
  const noteY = labelY + (node.id === "data" ? 20 : 17);

  return (
    <g
      onMouseEnter={() => setActiveNode(node.id)}
      onMouseLeave={() => setActiveNode(null)}
      style={{ cursor: "pointer" }}
      opacity={dimmed ? 0.42 : 1}
      aria-label={`${node.label}: ${node.note}`}
    >
      <line
        x1={p.x}
        x2={labelX + (anchor === "end" ? 10 : anchor === "start" ? -10 : 0)}
        y1={p.y}
        y2={labelY - 12}
        stroke={color}
        strokeOpacity={active ? 0.5 : 0.18}
        strokeWidth={active ? 1.35 : 0.8}
        strokeLinecap="round"
      />
      {node.id === "data" ? (
        <g>
          <circle cx={p.x} cy={p.y} r={radius + 22} fill="none" stroke={colors.ink} strokeOpacity="0.09" strokeWidth="1.4" strokeDasharray="3 5" />
          <circle cx={p.x} cy={p.y} r={radius + 13} fill="none" stroke={colors.ink} strokeOpacity="0.16" strokeWidth="1.1" />
          <circle cx={p.x} cy={p.y} r={radius + 6} fill="none" stroke={colors.ink} strokeOpacity="0.25" strokeWidth="1.4" />
        </g>
      ) : null}
      {node.id === "data_processing" || node.id === "database" ? (
        <circle cx={p.x} cy={p.y} r={radius + 7} fill="none" stroke={color} strokeOpacity="0.18" strokeWidth="1.2" />
      ) : null}
      <circle
        cx={p.x}
        cy={p.y}
        r={active ? radius + 3 : radius}
        fill={node.level === "secondary" ? colors.wheat : color}
        fillOpacity={node.level === "secondary" ? 0.98 : node.track === "fork" ? 0.92 : 0.82}
        stroke={node.level === "secondary" ? color : colors.ink}
        strokeWidth={active ? 2.3 : node.level === "major" ? 1.65 : 1.2}
      />
      <circle cx={p.x} cy={p.y} r="2" fill={node.level === "secondary" ? color : colors.wheat} fillOpacity="0.92" />
      <text
        x={labelX}
        y={labelY}
        textAnchor={anchor}
        fill={color}
        fontFamily="Helvetica Neue, Helvetica, Arial, sans-serif"
        fontSize={node.id === "data" ? "30" : node.level === "major" ? "20" : "15.5"}
        fontWeight="900"
        letterSpacing="0"
      >
        {node.label}
      </text>
      <text
        x={labelX}
        y={noteY}
        textAnchor={anchor}
        fill={colors.ink}
        opacity="0.46"
        fontFamily="monospace"
        fontSize={node.level === "secondary" ? "9.5" : "10.5"}
        fontWeight="900"
        letterSpacing="0.8"
      >
        {noteLines.map((line, index) => (
          <tspan key={`${node.id}-${line}`} x={labelX} dy={index === 0 ? 0 : 12}>
            {line.toUpperCase()}
          </tspan>
        ))}
      </text>
    </g>
  );
}

function AnnotationCallout({ annotation }: { annotation: DatumRouteAnnotation }) {
  const p = annotationPoint(annotation);
  const lines = wrapText(annotation.text, 36).slice(0, 3);
  const w = annotation.id === "crossing-note" ? 284 : annotation.id === "right-note" ? 286 : 255;
  const h = 54 + lines.length * 13;
  const anchorX = annotation.id === "crossing-note" || annotation.id === "right-note" ? p.x - w : p.x;

  return (
    <g>
      <rect x={anchorX} y={p.y - 22} width={w} height={h} fill={colors.wheat} fillOpacity="0.86" stroke={colors.ink} strokeOpacity="0.16" />
      <text x={anchorX + 12} y={p.y} fill={colors.ink} opacity="0.46" fontFamily="monospace" fontSize="9.5" fontWeight="900" letterSpacing="1.2">
        {annotation.title.toUpperCase()}
      </text>
      <text x={anchorX + 12} y={p.y + 18} fill={colors.ink} opacity="0.62" fontFamily="Helvetica Neue, Helvetica, Arial, sans-serif" fontSize="12.5" fontWeight="700">
        {lines.map((line, index) => (
          <tspan key={`${annotation.id}-${line}`} x={anchorX + 12} dy={index === 0 ? 0 : 14}>
            {line}
          </tspan>
        ))}
      </text>
    </g>
  );
}

function AnnotationRegister({ annotations }: { annotations: DatumRouteAnnotation[] }) {
  return (
    <g>
      {annotations.map((annotation, index) => {
        const ax = PAD_X + index * ANNO_W;
        const lines = wrapText(annotation.text, 38).slice(0, 2);
        return (
          <g key={annotation.id}>
            {index > 0 ? (
              <line x1={ax} x2={ax} y1={ANNO_Y - 8} y2={ANNO_Y + 42} stroke={colors.ink} strokeOpacity="0.2" />
            ) : null}
            <text x={ax + 10} y={ANNO_Y + 4} fill={colors.ink} opacity="0.42" fontFamily="monospace" fontSize="9.35" fontWeight="900" letterSpacing="1.3">
              {annotation.title.toUpperCase()}
            </text>
            <text x={ax + 10} y={ANNO_Y + 19} fill={colors.ink} opacity="0.62" fontFamily="Helvetica Neue, Helvetica, Arial, sans-serif" fontSize="12.1" fontWeight="700" letterSpacing="0">
              {lines.map((line, lineIndex) => (
                <tspan key={`${annotation.id}-${line}`} x={ax + 10} dy={lineIndex === 0 ? 0 : 14.3}>
                  {line}
                </tspan>
              ))}
            </text>
          </g>
        );
      })}
    </g>
  );
}

function HoverReadout({
  dataset,
  activeNode,
}: {
  dataset: DataDatumRouteDataset;
  activeNode: string | null;
}) {
  const node = activeNode ? dataset.nodes.find((item) => item.id === activeNode) : null;
  const evidence = node ? dataset.evidence.find((item) => item.anchorNode === node.id) : null;
  const color = node ? trackColor[node.track] : colors.ink;
  const metricText = evidence
    ? Object.entries(evidence.metrics)
        .slice(0, 2)
        .map(([key, value]) => `${key.replaceAll("_", " ")}: ${value ?? "-"}`)
        .join(" / ")
    : null;

  return (
    <div className="flex min-h-[56px] items-center gap-6 border-t border-ink px-5 py-3">
      {node ? (
        <>
          <p className="shrink-0 font-sans text-[1.1rem] font-black leading-none" style={{ color }}>
            {node.label}
          </p>
          <p className="shrink-0 font-mono text-[0.62rem] font-black uppercase tracking-[0.14em] text-ink/42">
            {node.role.replaceAll("_", " ")}
          </p>
          <p className="max-w-3xl text-[0.82rem] font-bold leading-5 text-ink/56">
            {evidence?.summary ?? node.firstStrongVisibility ?? node.note}
          </p>
          {metricText ? (
            <p className="ml-auto shrink-0 whitespace-nowrap font-mono text-[0.68rem] font-black text-ink/40">
              {metricText}
            </p>
          ) : null}
        </>
      ) : (
        <>
          <p className="text-[0.86rem] font-bold leading-none text-ink/52">
            Read left to right - upper rail: plural evidence / lower rail: singular infrastructure
          </p>
          <p className="ml-auto shrink-0 whitespace-nowrap font-mono text-[0.65rem] font-black uppercase tracking-[0.12em] text-ink/36">
            hover nodes or arcs
          </p>
        </>
      )}
    </div>
  );
}

export function DataDatumRoute({ dataset }: DataDatumRouteProps) {
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [activeEdge, setActiveEdge] = useState<string | null>(null);
  const nodesById = useMemo(() => new Map(dataset.nodes.map((node) => [node.id, node])), [dataset.nodes]);
  const majorCount = dataset.nodes.filter((node) => node.level === "major").length;

  return (
    <div className="border border-ink bg-wheat">
      <div className="grid border-b border-ink md:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="px-4 py-4 sm:px-5">
          <p className="font-mono text-[0.68rem] font-black uppercase tracking-[0.18em] text-nice">
            Chart 3 / grammatical route
          </p>
          <p className="mt-2 max-w-4xl text-[1.02rem] font-bold leading-[1.55] text-ink/68">
            From datum as a singular given to data as a plural form, then into two coexisting routes: formal plural evidence and singular or mass infrastructure.
          </p>
        </div>
        <div className="border-t border-ink px-4 py-4 md:border-l md:border-t-0">
          <p className="font-mono text-[0.62rem] font-black uppercase tracking-[0.15em] text-ink/42">
            route basis
          </p>
          <p className="mt-2 font-mono text-[0.7rem] font-black uppercase leading-5 tracking-[0.1em] text-nice">
            2 rails / {dataset.nodes.length} nodes / {majorCount} major
          </p>
          <p className="mt-2 text-[0.78rem] font-bold leading-5 text-ink/52">
            Coordinates are curated; the route is conceptual, not a calendar axis.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto border-b border-ink">
        <svg
          role="img"
          aria-label={`${dataset.metadata.title}: ${dataset.metadata.thesis}`}
          viewBox={`0 0 ${W} ${H}`}
          className="block bg-wheat"
          style={{ minWidth: `${W}px`, width: "100%" }}
        >
          <defs>
            <pattern id="datum-route-grid" width="36" height="36" patternUnits="userSpaceOnUse">
              <path d="M 36 0 L 0 0 0 36" fill="none" stroke={colors.ink} strokeOpacity="0.052" strokeWidth="1" />
            </pattern>
            <filter id="datum-route-grain">
              <feTurbulence type="fractalNoise" baseFrequency="0.88" numOctaves="2" stitchTiles="stitch" />
              <feColorMatrix type="saturate" values="0" />
              <feComponentTransfer>
                <feFuncA type="table" tableValues="0 0.045" />
              </feComponentTransfer>
            </filter>
            <marker id="datum-route-arrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill={colors.ink} opacity="0.55" />
            </marker>
          </defs>

          <rect width={W} height={H} fill={colors.wheat} />
          <rect width={W} height={H} fill="url(#datum-route-grid)" />
          <rect width={W} height={H} filter="url(#datum-route-grain)" opacity="0.18" />

          <text x="32" y="34" fill={colors.ink} fontFamily="monospace" fontSize="13" fontWeight="900" letterSpacing="2.7">
            CHART 3 / GRAMMATICAL ROUTE
          </text>
          <text x="32" y="72" fill={colors.ink} opacity="0.84" fontFamily="Helvetica Neue, Helvetica, Arial, sans-serif" fontSize="34" fontWeight="900">
            {dataset.metadata.title}
          </text>
          <text x={W - 34} y="40" textAnchor="end" fill={colors.ink} opacity="0.42" fontFamily="monospace" fontSize="10" fontWeight="900" letterSpacing="1.5">
            ROUTE MAP / NOT A TIMELINE
          </text>
          <text x={W - 34} y="125" textAnchor="end" fill={colors.ink} opacity="0.28" fontFamily="monospace" fontSize="9" fontWeight="900" letterSpacing="1.3">
            ROUTE IS CONCEPTUAL / NOT TO SCALE
          </text>
          <text x={W - 34} y="142" textAnchor="end" fill={colors.ink} opacity="0.22" fontFamily="monospace" fontSize="9" fontWeight="900" letterSpacing="1.3">
            SEE EVIDENCE STRIP BELOW FOR FREQUENCY DATA
          </text>

          {PHASES.map((phase, index) => {
            const x1 = PAD_X + phase.xStart * ROUTE_W;
            const x2 = PAD_X + phase.xEnd * ROUTE_W;
            const barY = PAD_TOP + 10;
            return (
              <g key={phase.label}>
                <rect
                  x={x1}
                  y={barY}
                  width={x2 - x1}
                  height="4"
                  fill={phase.color}
                  opacity="0.55"
                />
                {index > 0 ? (
                  <line
                    x1={x1}
                    x2={x1}
                    y1={PAD_TOP - 6}
                    y2={PAD_TOP + ROUTE_H * 0.88}
                    stroke={phase.color}
                    strokeOpacity="0.14"
                    strokeWidth="1"
                    strokeDasharray="4 7"
                  />
                ) : null}
                <text
                  x={(x1 + x2) / 2}
                  y={barY - 6}
                  textAnchor="middle"
                  fill={phase.color}
                  opacity="0.52"
                  fontFamily="monospace"
                  fontSize="11.05"
                  fontWeight="900"
                  letterSpacing="1.6"
                >
                  {phase.label.toUpperCase()}
                </text>
              </g>
            );
          })}

          <g>
            <line
              x1={PAD_X + 0.82 * ROUTE_W}
              x2={PAD_X + 0.82 * ROUTE_W}
              y1={PAD_TOP + 0.05 * ROUTE_H}
              y2={PAD_TOP + 0.95 * ROUTE_H}
              stroke={colors.rust}
              strokeOpacity="0.14"
              strokeWidth="1"
              strokeDasharray="5 6"
            />
            <text
              x={PAD_X + 0.82 * ROUTE_W + 4}
              y={PAD_TOP + 0.08 * ROUTE_H}
              fill={colors.rust}
              opacity="0.42"
              fontFamily="monospace"
              fontSize="8.5"
              fontWeight="900"
              letterSpacing="0.8"
            >
              ~2020
            </text>
          </g>

          {dataset.tracks.map((track) => {
            const y = PAD_TOP + track.y * ROUTE_H;
            const startX = point(nodesById.get("data") ?? { x: 0.22, y: 0.51 }).x;
            return (
              <g key={track.id}>
                <line x1={startX} x2={W - PAD_X} y1={y} y2={y} stroke={track.color} strokeOpacity="0.32" strokeWidth="2.5" strokeDasharray="8 10" />
                <text x={PAD_X} y={y - 14} fill={track.color} opacity="0.64" fontFamily="monospace" fontSize="10.5" fontWeight="900" letterSpacing="1.35">
                  {track.label.toUpperCase()}
                </text>
              </g>
            );
          })}

          <g>
            {dataset.edges.map((edge) => {
              const stroke = edgeStroke(edge, nodesById);
              const path = edgePath(edge, nodesById);
              const active = activeEdge === edge.id;
              return (
                <g
                  key={edge.id}
                  onMouseEnter={() => setActiveEdge(edge.id)}
                  onMouseLeave={() => setActiveEdge(null)}
                  style={{ cursor: "pointer" }}
                >
                  <path d={path} fill="none" stroke="rgba(0,0,0,0.001)" strokeWidth="18" style={{ pointerEvents: "stroke" }} />
                  {edge.emphasis === "primary" ? (
                    <path
                      d={path}
                      fill="none"
                      stroke={stroke}
                      strokeOpacity="0.07"
                      strokeWidth="12"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  ) : null}
                  <path
                    d={path}
                    fill="none"
                    stroke={stroke}
                    strokeOpacity={edgeOpacity(edge, activeEdge, activeNode)}
                    strokeWidth={edgeWidth(edge, activeEdge, activeNode)}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray={edge.style === "dashed" ? "6 7" : undefined}
                    markerEnd={edge.emphasis === "primary" ? "url(#datum-route-arrow)" : undefined}
                    style={{ transition: "stroke-opacity 160ms ease, stroke-width 160ms ease" }}
                  />
                  {active && edge.label ? (
                    <text
                      x={(point(nodesById.get(edge.source) ?? { x: 0, y: 0 }).x + point(nodesById.get(edge.target) ?? { x: 0, y: 0 }).x) / 2}
                      y={(point(nodesById.get(edge.source) ?? { x: 0, y: 0 }).y + point(nodesById.get(edge.target) ?? { x: 0, y: 0 }).y) / 2 + edge.curvature * 178 - 10}
                      textAnchor="middle"
                      fill={stroke}
                      opacity="0.72"
                      fontFamily="monospace"
                      fontSize="8.7"
                      fontWeight="900"
                      letterSpacing="0.9"
                    >
                      {edge.label.toUpperCase()}
                    </text>
                  ) : null}
                </g>
              );
            })}
          </g>

          {dataset.nodes.map((node) => (
            <NodeGlyph
              key={node.id}
              node={node}
              activeNode={activeNode}
              setActiveNode={setActiveNode}
            />
          ))}

          <g>
            <line
              x1={PAD_X + 0.99 * ROUTE_W}
              x2={PAD_X + 0.99 * ROUTE_W}
              y1={PAD_TOP + 0.1 * ROUTE_H}
              y2={PAD_TOP + 0.92 * ROUTE_H}
              stroke={colors.ink}
              strokeOpacity="0.18"
              strokeWidth="1.5"
            />
            <text
              x={PAD_X + 0.99 * ROUTE_W + 6}
              y={PAD_TOP + 0.5 * ROUTE_H}
              fill={colors.ink}
              opacity="0.28"
              fontFamily="monospace"
              fontSize="8.5"
              fontWeight="900"
              letterSpacing="1.4"
              style={{ writingMode: "vertical-lr" }}
            >
              COEXISTENCE ONGOING
            </text>
          </g>

          <AnnotationRegister annotations={dataset.annotations} />

        </svg>
      </div>

      <div className="overflow-x-auto border-b border-ink">
        <svg
          role="img"
          aria-label="Grammar evidence strip for data are, data is, these data, and this data"
          viewBox="0 0 1480 210"
          className="block bg-wheat"
          style={{ minWidth: "1480px", width: "100%" }}
        >
          <rect width="1480" height="210" fill={colors.wheat} />
          <EvidenceStrip dataset={dataset} fullW={1236} offsetX={72} offsetY={20} h={160} />
        </svg>
      </div>

      <HoverReadout dataset={dataset} activeNode={activeNode} />
      <div className="border-t border-ink/20 px-5 py-2">
        <p className="font-mono text-[0.62rem] font-black uppercase tracking-[0.14em] text-ink/36">
          Caveat: {dataset.metadata.caveat}
        </p>
      </div>
    </div>
  );
}
