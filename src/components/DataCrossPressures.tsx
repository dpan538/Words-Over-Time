"use client";

import { useMemo, useRef, useState } from "react";

import { useScrollReveal } from "@/hooks/useScrollReveal";
import type { CrossPressureArm, CrossPressureFlow, CrossPressureNode, DataCrossPressuresDataset } from "@/types/dataCrossPressures";

type DataCrossPressuresProps = {
  dataset: DataCrossPressuresDataset;
};

type Point = {
  x: number;
  y: number;
};

const W = 1800;
const H = 960;
const ISO_CX = 780;
const ISO_CY = 520;
const ISO_X_SCALE = 0.72;
const ISO_Y_SCALE = 0.42;
const FIELD_RADIUS = 460;
const Z_MAX_HEIGHT = 290;
const FREQ_MAX = 25;
const HEMI_R = 0.44;
const HEMI_Z_SCALE = 0.62;
const FREQ_LIFT_SCALE = 0.34;
const HOVER_LIFT_PX = 8;
const VISUAL_SCALE = 1.38;
const VISUAL_SHIFT_X = -42;
const VISUAL_SHIFT_Y = 67;

const CENTER = { x: 0.5, y: 0.5 };

const colors = {
  ink: "#050510",
  wheat: "#F5ECD2",
  paper: "#FBF3DC",
  quiet: "#8F846C",
};

const DEFAULT_LABEL_IDS = new Set([
  "personal_data",
  "data_protection",
  "data_breach",
  "statistical_data",
  "scientific_data",
  "dataset",
  "data_ethics",
  "sensitive_data",
]);

function isoProject(nx: number, ny: number, nz = 0): Point {
  const fx = (nx - 0.5) * FIELD_RADIUS * 2;
  const fy = (ny - 0.5) * FIELD_RADIUS * 2;

  return {
    x: ISO_CX + (fx - fy) * ISO_X_SCALE,
    y: ISO_CY + (fx + fy) * ISO_Y_SCALE - nz * Z_MAX_HEIGHT,
  };
}

function normalizeFreq(value: number | null | undefined) {
  if (!value || value <= 0) return 0;
  return Math.min(value / FREQ_MAX, 1);
}

function nodeZ(node: CrossPressureNode) {
  if (!node.visibilitySummary?.available) return 0;
  return normalizeFreq(node.visibilitySummary.recent2022 ?? node.visibilitySummary.average2000_2022 ?? 0);
}

function sphereBaseZ(nx: number, ny: number) {
  const dist = Math.sqrt((nx - 0.5) ** 2 + (ny - 0.5) ** 2);
  const capped = Math.min(dist / HEMI_R, 1);
  return Math.sqrt(1 - capped * capped) * HEMI_Z_SCALE;
}

function nodeSphereBaseZ(node: CrossPressureNode) {
  return sphereBaseZ(node.x ?? CENTER.x, node.y ?? CENTER.y);
}

function nodeTotalZ(node: CrossPressureNode) {
  return nodeSphereBaseZ(node) + nodeZ(node) * FREQ_LIFT_SCALE;
}

function nodeFreqLabel(node: CrossPressureNode) {
  const summary = node.visibilitySummary;
  if (!summary?.available) return null;
  const value = summary.recent2022 ?? summary.average2000_2022;
  if (value === null || value === undefined) return null;
  return `${value.toFixed(2)}/M`;
}

function armEnd(arm: CrossPressureArm) {
  if (arm.direction === "left") return isoProject(0.04, 0.5, 0);
  if (arm.direction === "right") return isoProject(0.96, 0.5, 0);
  if (arm.direction === "up") return isoProject(0.5, 0.04, 0);
  return isoProject(0.5, 0.96, 0);
}

function armLabelOffset(arm: CrossPressureArm) {
  if (arm.direction === "left") return { dx: -32, dy: -10, anchor: "end" as const };
  if (arm.direction === "right") return { dx: 32, dy: 16, anchor: "start" as const };
  if (arm.direction === "up") return { dx: 18, dy: -24, anchor: "start" as const };
  return { dx: -18, dy: 36, anchor: "end" as const };
}

function nodeRadius(node: CrossPressureNode) {
  if (node.level === "major") return 9;
  if (node.level === "minor") return 6;
  return 4;
}

function lineOpacity(flow: CrossPressureFlow) {
  if (flow.emphasis === "primary") return 0.38;
  if (flow.emphasis === "secondary") return 0.25;
  return 0.16;
}

function lineWidth(flow: CrossPressureFlow) {
  if (flow.emphasis === "primary") return 2;
  if (flow.emphasis === "secondary") return 1.45;
  return 1.05;
}

function wrapLabel(label: string, maxChars = 16) {
  if (label.includes(" / ")) return label.split(" / ");
  if (label.length <= maxChars) return [label];
  const words = label.split(" ");
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }

  if (line) lines.push(line);
  return lines;
}

function flowPath(flow: CrossPressureFlow, nodesById: Map<string, CrossPressureNode>) {
  const ordered = [flow.source, ...flow.via, flow.target]
    .map((id) => nodesById.get(id))
    .filter((node): node is CrossPressureNode => Boolean(node?.x && node?.y));

  if (ordered.length < 2) return "";
  const pts = ordered.map((node) => isoProject(node.x ?? CENTER.x, node.y ?? CENTER.y, nodeSphereBaseZ(node) + 0.012));
  const commands = [`M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`];

  for (let i = 1; i < pts.length; i += 1) {
    const previous = pts[i - 1];
    const current = pts[i];
    const control = {
      x: (previous.x + current.x) / 2,
      y: (previous.y + current.y) / 2 - (flow.emphasis === "primary" ? 24 : 12),
    };
    commands.push(`Q ${control.x.toFixed(2)} ${control.y.toFixed(2)} ${current.x.toFixed(2)} ${current.y.toFixed(2)}`);
  }

  return commands.join(" ");
}

function relatedFlowIds(nodeId: string | null, flows: CrossPressureFlow[]) {
  if (!nodeId) return new Set<string>();
  return new Set(
    flows
      .filter((flow) => flow.source === nodeId || flow.target === nodeId || flow.via.includes(nodeId))
      .map((flow) => flow.id),
  );
}

function flowHasNode(flow: CrossPressureFlow, nodeId: string | null) {
  return Boolean(nodeId && (flow.source === nodeId || flow.target === nodeId || flow.via.includes(nodeId)));
}

function hemisphereRingPath(normalizedH: number, steps = 88) {
  const r = HEMI_R * Math.sqrt(Math.max(0, 1 - normalizedH * normalizedH));
  const pts: string[] = [];

  for (let i = 0; i <= steps; i += 1) {
    const theta = (i / steps) * Math.PI * 2;
    const nx = 0.5 + r * Math.cos(theta);
    const ny = 0.5 + r * Math.sin(theta);
    const p = isoProject(nx, ny, normalizedH * HEMI_Z_SCALE);
    pts.push(`${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`);
  }

  pts.push("Z");
  return pts.join(" ");
}

function hemisphereMeridianPath(phi: number, steps = 48) {
  const pts: string[] = [];

  for (let i = 0; i <= steps; i += 1) {
    const h = i / steps;
    const r = HEMI_R * Math.sqrt(Math.max(0, 1 - h * h));
    const nx = 0.5 + r * Math.cos(phi);
    const ny = 0.5 + r * Math.sin(phi);
    const p = isoProject(nx, ny, h * HEMI_Z_SCALE);
    pts.push(`${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`);
  }

  return pts.join(" ");
}

function IsoHemisphere() {
  const ringHeights = [0, 0.22, 0.44, 0.66, 0.88, 1];
  const meridianCount = 10;

  return (
    <g>
      <ellipse
        cx={ISO_CX}
        cy={ISO_CY}
        rx={FIELD_RADIUS * HEMI_R * 1.62}
        ry={FIELD_RADIUS * HEMI_R * 0.62}
        fill={colors.ink}
        fillOpacity="0.035"
      />
      <path d={hemisphereRingPath(0)} fill={colors.paper} fillOpacity="0.55" stroke={colors.ink} strokeOpacity="0.22" strokeWidth="1.5" />
      {Array.from({ length: meridianCount }, (_, index) => {
        const phi = (index / meridianCount) * Math.PI * 2;
        return (
          <path
            key={`m-${index}`}
            d={hemisphereMeridianPath(phi)}
            fill="none"
            stroke={colors.ink}
            strokeOpacity="0.075"
            strokeWidth="1"
          />
        );
      })}
      {ringHeights.map((height, index) => (
        <path
          key={`r-${height}`}
          d={hemisphereRingPath(height)}
          fill="none"
          stroke={colors.ink}
          strokeOpacity={0.15 - index * 0.018}
          strokeWidth={height === 0 ? 1.8 : 1}
        />
      ))}
    </g>
  );
}

function FreqAxis() {
  const base = isoProject(0.5, 0.5, HEMI_Z_SCALE);
  const top = isoProject(0.5, 0.5, HEMI_Z_SCALE + FREQ_LIFT_SCALE * 1.08);
  const ticks = [10, 20];

  return (
    <g>
      <line x1={base.x} y1={base.y} x2={top.x} y2={top.y} stroke={colors.ink} strokeOpacity="0.18" strokeWidth="1.1" />
      {ticks.map((value) => {
        const tick = isoProject(0.5, 0.5, HEMI_Z_SCALE + normalizeFreq(value) * FREQ_LIFT_SCALE);
        return (
          <g key={value}>
            <line x1={tick.x - 6} y1={tick.y} x2={tick.x + 6} y2={tick.y} stroke={colors.ink} strokeOpacity="0.18" />
          </g>
        );
      })}
    </g>
  );
}

export function DataCrossPressures({ dataset }: DataCrossPressuresProps) {
  const chartRevealRef = useScrollReveal<HTMLElement>();
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [pinnedNodeId, setPinnedNodeId] = useState<string | null>(null);
  const [activeDateTagId, setActiveDateTagId] = useState<string | null>(null);

  const nodes = useMemo(
    () => dataset.nodes.filter((node) => node.level !== "excluded" && node.x !== undefined && node.y !== undefined),
    [dataset.nodes],
  );
  const nodesById = useMemo(() => new Map(dataset.nodes.map((node) => [node.id, node])), [dataset.nodes]);
  const armsById = useMemo(() => new Map(dataset.pressureArms.map((arm) => [arm.id, arm])), [dataset.pressureArms]);
  const bridgeIds = useMemo(() => new Set(dataset.bridgeNodes.map((node) => node.id)), [dataset.bridgeNodes]);
  const quantifiedNodes = nodes.filter((node) => node.visibilitySummary?.available);
  const missingShown = nodes.filter((node) => node.dataAvailability === "missing_or_needs_collection").length;
  const activeNodeId = pinnedNodeId ?? hoveredNodeId;
  const activeDateTag = activeDateTagId ? dataset.dateTags.find((tag) => tag.id === activeDateTagId) ?? null : null;
  const activeFlowIds = relatedFlowIds(activeNodeId, dataset.flows);

  const sortedNodes = [...nodes].sort((a, b) => {
    const depthA = (a.x ?? 0.5) + (a.y ?? 0.5);
    const depthB = (b.x ?? 0.5) + (b.y ?? 0.5);
    return depthA - depthB;
  });

  const isNodeHighlighted = (node: CrossPressureNode) => {
    if (activeDateTag) return activeDateTag.relatedNodes.includes(node.id);
    if (activeNodeId) return node.id === activeNodeId || dataset.flows.some((flow) => flowHasNode(flow, activeNodeId) && flowHasNode(flow, node.id));
    return true;
  };

  const handleMouseEnter = (id: string) => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    setHoveredNodeId(id);
  };
  const handleMouseLeave = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => setHoveredNodeId(null), 180);
  };
  const handleNodeClick = (id: string) => {
    setPinnedNodeId((current) => (current === id ? null : id));
    setHoveredNodeId(id);
  };

  return (
    <figure ref={chartRevealRef} className="data-chart-reveal data-cross-chart overflow-hidden border-y border-ink bg-wheat">
      <div className="overflow-x-auto">
          <svg
            className="block w-full min-w-[1440px]"
            viewBox={`0 0 ${W} ${H}`}
            role="img"
            aria-label={`${dataset.metadata.title}. Isometric semantic field placing data among four pressures. Node height encodes comparable 2022 Ngram frequency where available.`}
          >
            <defs>
              <filter id="cross-paper-soften" x="-10%" y="-10%" width="120%" height="120%">
                <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" result="noise" />
                <feColorMatrix in="noise" type="saturate" values="0" result="mono" />
                <feComponentTransfer in="mono" result="fade">
                  <feFuncA type="table" tableValues="0 0.045" />
                </feComponentTransfer>
                <feBlend in="SourceGraphic" in2="fade" mode="multiply" />
              </filter>
              {dataset.pressureArms.map((arm) => (
                <marker key={arm.id} id={`arrow-${arm.id}`} markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto" markerUnits="strokeWidth">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill={arm.color} fillOpacity="0.58" />
                </marker>
              ))}
            </defs>

            <rect width={W} height={H} fill={colors.wheat} />
            <g className="data-cross-field" transform={`translate(${VISUAL_SHIFT_X} ${VISUAL_SHIFT_Y}) translate(${ISO_CX} ${ISO_CY}) scale(${VISUAL_SCALE}) translate(${-ISO_CX} ${-ISO_CY})`}>
            <g className="data-cross-surface" filter="url(#cross-paper-soften)">
              <IsoHemisphere />
            </g>

            <g className="data-cross-arms">
              {dataset.pressureArms.map((arm) => {
                const center = isoProject(0.5, 0.5, HEMI_Z_SCALE);
                const end = armEnd(arm);
                const offset = armLabelOffset(arm);
                return (
                  <g key={arm.id}>
                    <line
                      x1={center.x}
                      y1={center.y}
                      x2={end.x}
                      y2={end.y}
                      stroke={arm.color}
                      strokeOpacity="0.46"
                      strokeWidth="2.4"
                      markerEnd={`url(#arrow-${arm.id})`}
                    />
                    <text
                      x={end.x + offset.dx}
                      y={end.y + offset.dy}
                      textAnchor={offset.anchor}
                      fill={arm.color}
                      fontFamily="monospace"
                      fontSize="13"
                      fontWeight="900"
                      letterSpacing="1.4"
                    >
                      {arm.label}
                    </text>
                  </g>
                );
              })}
              <FreqAxis />
            </g>

            <g className="data-cross-flows">
              {dataset.flows.map((flow, index) => {
                const source = nodesById.get(flow.source);
                const color = source ? (armsById.get(source.pressurePrimary)?.color ?? colors.ink) : colors.ink;
                const path = flowPath(flow, nodesById);
                const active = activeFlowIds.has(flow.id);
                const idle = activeFlowIds.size === 0;
                return path ? (
                  <path
                    key={flow.id}
                    className="data-cross-flow"
                    d={path}
                    fill="none"
                    stroke={color}
                    strokeOpacity={active ? lineOpacity(flow) : idle ? lineOpacity(flow) * 0.35 : 0.05}
                    strokeWidth={lineWidth(flow)}
                    strokeLinecap="round"
                    strokeDasharray={flow.emphasis === "quiet" ? "5 7" : undefined}
                    pointerEvents="none"
                    style={{ animationDelay: `${160 + index * 26}ms` }}
                  />
                ) : null;
              })}
            </g>

            <g className="data-cross-center">
              <ellipse
                cx={isoProject(CENTER.x, CENTER.y, HEMI_Z_SCALE).x}
                cy={isoProject(CENTER.x, CENTER.y, HEMI_Z_SCALE).y}
                rx="104"
                ry="46"
                fill={colors.paper}
                fillOpacity="0.72"
                stroke={colors.ink}
                strokeOpacity="0.28"
              />
              <text
                x={isoProject(CENTER.x, CENTER.y, HEMI_Z_SCALE).x}
                y={isoProject(CENTER.x, CENTER.y, HEMI_Z_SCALE).y - 6}
                textAnchor="middle"
                fill={colors.ink}
                fontFamily="monospace"
                fontSize="12"
                fontWeight="900"
                letterSpacing="1.3"
                stroke={colors.wheat}
                strokeWidth="3"
                paintOrder="stroke fill"
              >
                DATA AS
              </text>
              <text
                x={isoProject(CENTER.x, CENTER.y, HEMI_Z_SCALE).x}
                y={isoProject(CENTER.x, CENTER.y, HEMI_Z_SCALE).y + 15}
                textAnchor="middle"
                fill={colors.ink}
                fontFamily="monospace"
                fontSize="12"
                fontWeight="900"
                letterSpacing="1.3"
                stroke={colors.wheat}
                strokeWidth="3"
                paintOrder="stroke fill"
              >
                CONTESTED MATERIAL
              </text>
            </g>

            <g className="data-cross-nodes">
              {sortedNodes.map((node, index) => {
                const primary = armsById.get(node.pressurePrimary);
                const secondary = node.pressureSecondary ? armsById.get(node.pressureSecondary) : null;
                const color = primary?.color ?? colors.ink;
                const surfaceZ = nodeSphereBaseZ(node);
                const floor = isoProject(node.x ?? CENTER.x, node.y ?? CENTER.y, surfaceZ);
                const z = nodeTotalZ(node);
                const top = isoProject(node.x ?? CENTER.x, node.y ?? CENTER.y, z);
                const r = nodeRadius(node);
                const missing = node.dataAvailability === "missing_or_needs_collection";
                const hasFreq = nodeZ(node) > 0.018;
                const bridge = bridgeIds.has(node.id);
                const highlighted = isNodeHighlighted(node);
                const labelVisible = DEFAULT_LABEL_IDS.has(node.id) || activeNodeId === node.id;
                const labelLines = wrapLabel(node.label, node.level === "major" ? 16 : 12);
                const labelAnchor = (node.labelAnchor ?? (node.x && node.x > 0.52 ? "start" : "end")) as "start" | "middle" | "end";
                const labelX = top.x + (node.labelDx ?? (labelAnchor === "end" ? -12 : 12));
                const labelY = top.y + (node.labelDy ?? (node.level === "major" ? -10 : -6));
                const freqLabel = nodeFreqLabel(node);

                return (
                  <g
                    key={node.id}
                    className="data-cross-node"
                    opacity={highlighted ? 1 : 0.16}
                    onMouseEnter={() => handleMouseEnter(node.id)}
                    onMouseLeave={handleMouseLeave}
                    onFocus={() => handleMouseEnter(node.id)}
                    onBlur={handleMouseLeave}
                    onClick={() => handleNodeClick(node.id)}
                    tabIndex={0}
                    role="button"
                    aria-label={`${node.label}: ${node.note}`}
                    style={{
                      cursor: "pointer",
                      transform: activeNodeId === node.id ? `translateY(-${HOVER_LIFT_PX}px)` : "translateY(0)",
                      transition: "transform 0.12s ease-out, opacity 0.16s ease",
                      transformBox: "fill-box",
                      transformOrigin: `${top.x}px ${top.y}px`,
                      animationDelay: `${260 + index * 18}ms`,
                    }}
                  >
                    <ellipse cx={floor.x} cy={floor.y} rx={r + 5} ry={(r + 5) * 0.45} fill={color} opacity={bridge ? 0.2 : 0.12} />
                    {bridge ? <ellipse cx={floor.x} cy={floor.y} rx={r + 14} ry={(r + 14) * 0.46} fill="none" stroke={colors.ink} strokeOpacity="0.18" /> : null}
                    {hasFreq ? (
                      <line
                        x1={floor.x}
                        y1={floor.y}
                        x2={top.x}
                        y2={top.y}
                        stroke={color}
                        strokeOpacity="0.31"
                        strokeWidth={node.level === "major" ? 1.8 : 1.25}
                        strokeDasharray={missing ? "4 5" : undefined}
                      />
                    ) : null}
                    {activeNodeId === node.id ? (
                      <>
                        <ellipse
                          cx={top.x}
                          cy={top.y}
                          rx={r + 22}
                          ry={(r + 22) * 0.5}
                          fill={color}
                          fillOpacity="0.08"
                          stroke={color}
                          strokeOpacity="0.18"
                        />
                        <circle cx={top.x} cy={top.y} r={r + 10} fill="none" stroke={color} strokeOpacity="0.36" strokeWidth="1.5" />
                      </>
                    ) : null}
                    {secondary ? <circle cx={top.x + 4} cy={top.y + 4} r={r} fill={secondary.color} fillOpacity="0.28" /> : null}
                    <circle
                      cx={top.x}
                      cy={top.y}
                      r={r}
                      fill={missing ? colors.wheat : color}
                      stroke={color}
                      strokeWidth={missing ? 2 : 1.35}
                      strokeDasharray={missing ? "3 3" : undefined}
                      opacity={node.level === "hover" && activeNodeId !== node.id ? 0.72 : 1}
                    />
                    {labelVisible ? (
                      <text
                        x={labelX}
                        y={labelY}
                        textAnchor={labelAnchor}
                        fill={node.level === "major" ? colors.ink : color}
                        fontFamily="Helvetica Neue, Helvetica, Arial, sans-serif"
                        fontSize={node.level === "major" ? 13 : 12.5}
                        fontWeight={node.level === "major" ? 900 : 800}
                        letterSpacing="0"
                        stroke={colors.wheat}
                        strokeWidth={node.level === "major" ? 4 : 3.5}
                        strokeLinejoin="round"
                        paintOrder="stroke fill"
                      >
                        {labelLines.map((line, index) => (
                          <tspan key={line} x={labelX} dy={index === 0 ? 0 : node.level === "major" ? 14 : 13.75}>
                            {line}
                          </tspan>
                        ))}
                      </text>
                    ) : null}
                    {freqLabel && activeNodeId === node.id ? (
                      <text
                        x={labelX}
                        y={labelY + labelLines.length * 14 + 4}
                        textAnchor={labelAnchor}
                        fill={color}
                        opacity="0.72"
                        fontFamily="monospace"
                        fontSize="11.25"
                        fontWeight="900"
                        stroke={colors.wheat}
                        strokeWidth="3"
                        paintOrder="stroke fill"
                      >
                        {freqLabel}
                      </text>
                    ) : null}
                  </g>
                );
              })}
            </g>

            </g>

            <g transform="translate(1518 24)">
              {dataset.pressureArms.map((arm, index) => {
                const y = index * 76;
                const lines = wrapLabel(arm.description.replace(/\.$/, ""), 28).slice(0, 2);
                return (
                  <g key={arm.id} transform={`translate(0 ${y})`}>
                    <line x1="0" y1="-12" x2="276" y2="-12" stroke={arm.color} strokeOpacity="0.42" />
                    <text fill={arm.color} fontFamily="monospace" fontSize="14.85" fontWeight="900" letterSpacing="1.4">
                      {arm.label}
                    </text>
                    <text y="23" fill={colors.ink} opacity="0.56" fontFamily="Helvetica Neue, Helvetica, Arial, sans-serif" fontSize="13.9" fontWeight="800">
                      {lines.map((line, lineIndex) => (
                        <tspan key={line} x="0" dy={lineIndex === 0 ? 0 : 15.7}>
                          {line}
                        </tspan>
                      ))}
                    </text>
                  </g>
                );
              })}
            </g>

            <g transform="translate(1518 372)">
              <text x="0" y="0" fill={colors.ink} opacity="0.5" fontFamily="monospace" fontSize="13.2" fontWeight="900" letterSpacing="1.3">
                HISTORICAL ANCHORS
              </text>
              {dataset.dateTags.map((tag, index) => {
                const y = 34 + index * 48;
                const active = activeDateTagId === tag.id;
                const lines = wrapLabel(tag.text, 25).slice(0, 1);
                return (
                  <g
                    key={tag.id}
                    transform={`translate(0 ${y})`}
                    opacity={activeDateTagId && !active ? 0.34 : 1}
                    onMouseEnter={() => setActiveDateTagId(tag.id)}
                    onMouseLeave={() => setActiveDateTagId(null)}
                    onFocus={() => setActiveDateTagId(tag.id)}
                    onBlur={() => setActiveDateTagId(null)}
                    tabIndex={0}
                    role="button"
                    aria-label={`${tag.label}: ${tag.text}`}
                    style={{ cursor: "pointer" }}
                  >
                    <line x1="0" y1="-9" x2="276" y2="-9" stroke={colors.ink} strokeOpacity={active ? 0.32 : 0.16} />
                    <text x="0" y="7" fill={colors.ink} fontFamily="monospace" fontSize="14.3" fontWeight="900">
                      {tag.label}
                    </text>
                    <text x="79" y="7" fill={colors.ink} opacity="0.5" fontFamily="monospace" fontSize="10.45" fontWeight="900">
                      {lines[0]}
                    </text>
                  </g>
                );
              })}
            </g>

            <g transform="translate(24 24)">
              <line x1="0" x2="440" y1="-10" y2="-10" stroke={colors.ink} strokeOpacity="0.22" />
              <text x="0" y="0" fill={colors.ink} fontFamily="monospace" fontSize="16.5" fontWeight="900" letterSpacing="1.4">
                READING KEY
              </text>
              <text x="0" y="30" fill={colors.ink} opacity="0.62" fontFamily="monospace" fontSize="14.45" fontWeight="900">
                x/y = semantic position
                <tspan x="0" dy="19.25">
                  z = corpus frequency lift
                </tspan>
              </text>
              <text x="0" y="82" fill={colors.ink} opacity="0.42" fontFamily="monospace" fontSize="13.75" fontWeight="900" letterSpacing="0.5">
                GEOMETRIC NOTE - strict ellipsoid projection.
              </text>
              <text x="0" y="105" fill={colors.ink} opacity="0.44" fontFamily="monospace" fontSize="13.75" fontWeight="900">
                {`${quantifiedNodes.length} measured; ${missingShown} policy/manual.`}
              </text>
            </g>
          </svg>
      </div>
        <figcaption className="sr-only">{dataset.metadata.caveat}</figcaption>
    </figure>
  );
}
