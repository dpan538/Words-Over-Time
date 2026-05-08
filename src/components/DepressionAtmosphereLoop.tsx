"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from "react";

type PointerPosition = { x: number; y: number };

export type LaneId = "expert" | "media" | "lived";

export type SectorNode = {
  id: string;
  label: string;
  shortLabel: string;
  startAngle: number;
  endAngle: number;
  color: string;
  weight: number;
  generalization: number;
  filterGroup: "emotional" | "economic" | "cultural" | "response";
  keywords: string[];
  description: string;
};

export type AtmosphereMarker = {
  id: string;
  sectorId: string;
  lane: LaneId;
  angle: number;
  magnitude: number;
  kind: "dot" | "bar" | "capsule" | "tick";
  sourceType: "pubmed" | "news" | "public" | "archive";
  phraseCluster: string[];
};

export type BridgeLink = {
  id: string;
  fromSector: string;
  toSector: string;
  strength: number;
  label: string;
};

type DepressionAtmosphereLoopProps = {
  activeInspectorId?: string;
  onHover: (inspectorId: string | null, position?: PointerPosition) => void;
  onInspect: (inspectorId: string, position?: PointerPosition) => void;
};

type ActiveAtmosphere =
  | { kind: "sector"; id: string }
  | { kind: "marker"; id: string }
  | { kind: "bridge"; id: string }
  | null;

type TooltipState = {
  x: number;
  y: number;
  title: string;
  detail: string;
};

const WIDTH = 1700;
const HEIGHT = 1160;
const CX = 850;
const CY = 560;
const TILT = 0.58;
const ink = "#050510";
const paper = "#F5ECD2";
const blue = "#1570AC";
const cyan = "#2C9FC7";
const grayBlue = "#596F82";
const orangeRed = "#E04A22";
const ochre = "#C88D18";
const wine = "#7C345A";
const teal = "#0B7F73";

const laneDefs: {
  id: LaneId;
  label: string;
  shortLabel: string;
  radius: number;
  bandWidth: number;
  color: string;
  description: string;
}[] = [
  {
    id: "expert",
    label: "expert trace",
    shortLabel: "expert",
    radius: 300,
    bandWidth: 58,
    color: blue,
    description: "psychiatry / psychology / public health traces",
  },
  {
    id: "media",
    label: "media circulation",
    shortLabel: "media",
    radius: 390,
    bandWidth: 64,
    color: wine,
    description: "news / platform / public discourse circulation",
  },
  {
    id: "lived",
    label: "lived uptake",
    shortLabel: "lived",
    radius: 485,
    bandWidth: 70,
    color: teal,
    description: "self-description / everyday uptake / social use",
  },
];

const laneById = Object.fromEntries(laneDefs.map((lane) => [lane.id, lane])) as Record<LaneId, (typeof laneDefs)[number]>;
const INNER_WALL = laneById.expert.radius - laneById.expert.bandWidth / 2 - 18;
const OUTER_WALL = laneById.lived.radius + laneById.lived.bandWidth / 2 + 18;
const BRIDGE_R = INNER_WALL - 36;
const LABEL_R = OUTER_WALL + 104;

export const atmosphereSectors: SectorNode[] = [
  {
    id: "personal_affect",
    label: "personal affect",
    shortLabel: "personal",
    startAngle: 295,
    endAngle: 355,
    color: blue,
    weight: 0.84,
    generalization: 0.74,
    filterGroup: "emotional",
    keywords: ["sadness", "low mood", "heaviness", "hopelessness", "emptiness"],
    description: "Depression travels as a personal low-state language for affect, weight, absence, and narrowed possibility.",
  },
  {
    id: "collective_mood",
    label: "collective mood",
    shortLabel: "collective",
    startAngle: 0,
    endAngle: 58,
    color: grayBlue,
    weight: 0.78,
    generalization: 0.82,
    filterGroup: "emotional",
    keywords: ["social gloom", "malaise", "emotional climate", "pessimism", "fatigue"],
    description: "The word scales from private feeling into a language of shared social weather and low public energy.",
  },
  {
    id: "economic_downturn",
    label: "economic downturn",
    shortLabel: "economic",
    startAngle: 64,
    endAngle: 122,
    color: orangeRed,
    weight: 0.9,
    generalization: 0.68,
    filterGroup: "economic",
    keywords: ["recession", "contraction", "crisis", "slump", "low growth"],
    description: "Economic depression keeps the lowering metaphor public, measurable, and crisis-oriented.",
  },
  {
    id: "productivity_burnout",
    label: "productivity / burnout",
    shortLabel: "burnout",
    startAngle: 128,
    endAngle: 188,
    color: ochre,
    weight: 0.76,
    generalization: 0.88,
    filterGroup: "cultural",
    keywords: ["burnout", "exhaustion", "fatigue", "demotivation", "low productivity"],
    description: "Work and productivity discourse recasts depression as depleted capacity, exhausted motivation, and social fatigue.",
  },
  {
    id: "media_cultural_discourse",
    label: "media / cultural discourse",
    shortLabel: "media culture",
    startAngle: 194,
    endAngle: 252,
    color: wine,
    weight: 0.82,
    generalization: 0.92,
    filterGroup: "cultural",
    keywords: ["awareness language", "doom discourse", "online sadness", "crisis narrative", "depression era"],
    description: "Media turns depression into a circulating cultural signal, from awareness campaigns to ambient crisis language.",
  },
  {
    id: "response_coping_wellbeing",
    label: "response / coping / wellbeing",
    shortLabel: "response",
    startAngle: 258,
    endAngle: 290,
    color: teal,
    weight: 0.8,
    generalization: 0.86,
    filterGroup: "response",
    keywords: ["therapy", "medication", "self-care", "help-seeking", "support systems"],
    description: "Response language routes generalized depression into care, support, self-management, and wellbeing systems.",
  },
];

export const atmosphereMarkers: AtmosphereMarker[] = [
  {
    id: "personal-clinical-low-mood",
    sectorId: "personal_affect",
    lane: "expert",
    angle: 306,
    magnitude: 0.62,
    kind: "capsule",
    sourceType: "pubmed",
    phraseCluster: ["low mood", "anhedonia", "symptom cluster"],
  },
  {
    id: "personal-news-sadness",
    sectorId: "personal_affect",
    lane: "media",
    angle: 326,
    magnitude: 0.42,
    kind: "bar",
    sourceType: "news",
    phraseCluster: ["sadness", "mental health", "public story"],
  },
  {
    id: "personal-lived-heavy",
    sectorId: "personal_affect",
    lane: "lived",
    angle: 346,
    magnitude: 0.7,
    kind: "dot",
    sourceType: "public",
    phraseCluster: ["emptiness", "heavy", "can't move"],
  },
  {
    id: "collective-public-health",
    sectorId: "collective_mood",
    lane: "expert",
    angle: 10,
    magnitude: 0.46,
    kind: "tick",
    sourceType: "pubmed",
    phraseCluster: ["population burden", "risk", "screening"],
  },
  {
    id: "collective-media-gloom",
    sectorId: "collective_mood",
    lane: "media",
    angle: 30,
    magnitude: 0.78,
    kind: "capsule",
    sourceType: "news",
    phraseCluster: ["social gloom", "malaise", "pessimism"],
  },
  {
    id: "collective-lived-fatigue",
    sectorId: "collective_mood",
    lane: "lived",
    angle: 50,
    magnitude: 0.58,
    kind: "dot",
    sourceType: "public",
    phraseCluster: ["collective fatigue", "everyone tired", "low energy"],
  },
  {
    id: "economic-archive-crisis",
    sectorId: "economic_downturn",
    lane: "expert",
    angle: 75,
    magnitude: 0.7,
    kind: "bar",
    sourceType: "archive",
    phraseCluster: ["economic depression", "contraction", "industrial decline"],
  },
  {
    id: "economic-news-recession",
    sectorId: "economic_downturn",
    lane: "media",
    angle: 95,
    magnitude: 0.82,
    kind: "capsule",
    sourceType: "news",
    phraseCluster: ["recession", "slump", "crisis"],
  },
  {
    id: "economic-lived-hard-times",
    sectorId: "economic_downturn",
    lane: "lived",
    angle: 115,
    magnitude: 0.42,
    kind: "tick",
    sourceType: "public",
    phraseCluster: ["hard times", "job loss", "low growth"],
  },
  {
    id: "burnout-expert-function",
    sectorId: "productivity_burnout",
    lane: "expert",
    angle: 140,
    magnitude: 0.55,
    kind: "tick",
    sourceType: "pubmed",
    phraseCluster: ["functioning", "work impairment", "fatigue"],
  },
  {
    id: "burnout-media-work",
    sectorId: "productivity_burnout",
    lane: "media",
    angle: 160,
    magnitude: 0.66,
    kind: "bar",
    sourceType: "news",
    phraseCluster: ["burnout", "productivity anxiety", "exhaustion"],
  },
  {
    id: "burnout-lived-demotivation",
    sectorId: "productivity_burnout",
    lane: "lived",
    angle: 182,
    magnitude: 0.88,
    kind: "dot",
    sourceType: "public",
    phraseCluster: ["demotivation", "can't focus", "low productivity"],
  },
  {
    id: "media-expert-awareness",
    sectorId: "media_cultural_discourse",
    lane: "expert",
    angle: 205,
    magnitude: 0.48,
    kind: "tick",
    sourceType: "pubmed",
    phraseCluster: ["awareness", "stigma", "public language"],
  },
  {
    id: "media-news-crisis",
    sectorId: "media_cultural_discourse",
    lane: "media",
    angle: 228,
    magnitude: 0.9,
    kind: "capsule",
    sourceType: "news",
    phraseCluster: ["doom discourse", "crisis narrative", "depression era"],
  },
  {
    id: "media-lived-online-sadness",
    sectorId: "media_cultural_discourse",
    lane: "lived",
    angle: 246,
    magnitude: 0.74,
    kind: "bar",
    sourceType: "public",
    phraseCluster: ["online sadness", "relatable", "mood"],
  },
  {
    id: "response-expert-treatment",
    sectorId: "response_coping_wellbeing",
    lane: "expert",
    angle: 264,
    magnitude: 0.76,
    kind: "capsule",
    sourceType: "pubmed",
    phraseCluster: ["therapy", "medication", "care pathway"],
  },
  {
    id: "response-media-selfcare",
    sectorId: "response_coping_wellbeing",
    lane: "media",
    angle: 276,
    magnitude: 0.64,
    kind: "bar",
    sourceType: "news",
    phraseCluster: ["self-care", "support systems", "wellbeing"],
  },
  {
    id: "response-lived-help",
    sectorId: "response_coping_wellbeing",
    lane: "lived",
    angle: 288,
    magnitude: 0.8,
    kind: "dot",
    sourceType: "public",
    phraseCluster: ["help-seeking", "support", "getting through"],
  },
];

export const atmosphereBridges: BridgeLink[] = [
  {
    id: "affect-to-collective",
    fromSector: "personal_affect",
    toSector: "collective_mood",
    strength: 0.72,
    label: "private low mood scales into shared climate",
  },
  {
    id: "collective-to-media",
    fromSector: "collective_mood",
    toSector: "media_cultural_discourse",
    strength: 0.66,
    label: "malaise becomes public narrative",
  },
  {
    id: "economic-to-collective",
    fromSector: "economic_downturn",
    toSector: "collective_mood",
    strength: 0.78,
    label: "downturn language thickens social gloom",
  },
  {
    id: "burnout-to-lived",
    fromSector: "productivity_burnout",
    toSector: "personal_affect",
    strength: 0.58,
    label: "exhaustion becomes self-description",
  },
  {
    id: "media-to-response",
    fromSector: "media_cultural_discourse",
    toSector: "response_coping_wellbeing",
    strength: 0.64,
    label: "awareness routes language toward help-seeking",
  },
  {
    id: "response-to-affect",
    fromSector: "response_coping_wellbeing",
    toSector: "personal_affect",
    strength: 0.54,
    label: "care language feeds back into self-reading",
  },
];

export function atmosphereSectorInspectorId(sectorId: string) {
  return `depression-atmosphere-sector-${sectorId}`;
}

export function atmosphereMarkerInspectorId(markerId: string) {
  return `depression-atmosphere-marker-${markerId}`;
}

export function atmosphereBridgeInspectorId(bridgeId: string) {
  return `depression-atmosphere-bridge-${bridgeId}`;
}

function n(value: number, digits = 2) {
  return Number(value.toFixed(digits));
}

function pointer(event: ReactMouseEvent<SVGElement>): PointerPosition {
  return { x: event.clientX, y: event.clientY };
}

function normalizeAngle(angle: number) {
  return ((angle % 360) + 360) % 360;
}

function projectPoint(cx: number, cy: number, radius: number, angle: number, rotation: number) {
  const rad = ((angle - 90 + rotation) * Math.PI) / 180;
  const depth = Math.sin(rad);
  return {
    x: cx + radius * Math.cos(rad),
    y: cy + radius * depth * TILT,
    depth,
  };
}

function midAngle(startAngle: number, endAngle: number) {
  const start = normalizeAngle(startAngle);
  let end = normalizeAngle(endAngle);
  if (end <= start) end += 360;
  return normalizeAngle(start + (end - start) / 2);
}

function angleRange(startAngle: number, endAngle: number) {
  const start = normalizeAngle(startAngle);
  let end = normalizeAngle(endAngle);
  if (end <= start) end += 360;
  return { start, end, span: end - start };
}

function annularSectorPath(
  cx: number,
  cy: number,
  innerRadius: number,
  outerRadius: number,
  startAngle: number,
  endAngle: number,
  rotation: number,
  gap = 1.5,
) {
  let start = normalizeAngle(startAngle) + gap;
  let end = normalizeAngle(endAngle) - gap;
  if (end <= start) end += 360;
  const outerStart = projectPoint(cx, cy, outerRadius, start, rotation);
  const outerEnd = projectPoint(cx, cy, outerRadius, end, rotation);
  const innerEnd = projectPoint(cx, cy, innerRadius, end, rotation);
  const innerStart = projectPoint(cx, cy, innerRadius, start, rotation);
  const largeArc = end - start > 180 ? 1 : 0;
  return [
    `M ${n(outerStart.x)} ${n(outerStart.y)}`,
    `A ${outerRadius} ${n(outerRadius * TILT)} 0 ${largeArc} 1 ${n(outerEnd.x)} ${n(outerEnd.y)}`,
    `L ${n(innerEnd.x)} ${n(innerEnd.y)}`,
    `A ${innerRadius} ${n(innerRadius * TILT)} 0 ${largeArc} 0 ${n(innerStart.x)} ${n(innerStart.y)}`,
    "Z",
  ].join(" ");
}

function fullAnnulusPath(cx: number, cy: number, innerRadius: number, outerRadius: number, rotation: number) {
  const outerTop = projectPoint(cx, cy, outerRadius, 0, rotation);
  const outerBottom = projectPoint(cx, cy, outerRadius, 180, rotation);
  const innerTop = projectPoint(cx, cy, innerRadius, 0, rotation);
  const innerBottom = projectPoint(cx, cy, innerRadius, 180, rotation);
  return [
    `M ${n(outerTop.x)} ${n(outerTop.y)}`,
    `A ${outerRadius} ${n(outerRadius * TILT)} 0 1 1 ${n(outerBottom.x)} ${n(outerBottom.y)}`,
    `A ${outerRadius} ${n(outerRadius * TILT)} 0 1 1 ${n(outerTop.x)} ${n(outerTop.y)}`,
    `M ${n(innerTop.x)} ${n(innerTop.y)}`,
    `A ${innerRadius} ${n(innerRadius * TILT)} 0 1 0 ${n(innerBottom.x)} ${n(innerBottom.y)}`,
    `A ${innerRadius} ${n(innerRadius * TILT)} 0 1 0 ${n(innerTop.x)} ${n(innerTop.y)}`,
    "Z",
  ].join(" ");
}

function circularArcPath(cx: number, cy: number, radius: number, startAngle: number, endAngle: number, rotation: number) {
  const start = normalizeAngle(startAngle);
  let end = normalizeAngle(endAngle);
  if (end <= start) end += 360;
  const startPoint = projectPoint(cx, cy, radius, start, rotation);
  const endPoint = projectPoint(cx, cy, radius, end, rotation);
  const largeArc = end - start > 180 ? 1 : 0;
  return `M ${n(startPoint.x)} ${n(startPoint.y)} A ${radius} ${n(radius * TILT)} 0 ${largeArc} 1 ${n(endPoint.x)} ${n(endPoint.y)}`;
}

function bridgeArcPath(fromAngle: number, toAngle: number, offset: number, rotation: number) {
  return circularArcPath(CX, CY, BRIDGE_R - offset * 5.5, fromAngle, toAngle, rotation);
}

function bridgeMidAngle(fromAngle: number, toAngle: number) {
  const start = normalizeAngle(fromAngle);
  let end = normalizeAngle(toAngle);
  if (end <= start) end += 360;
  return normalizeAngle(start + (end - start) / 2);
}

function sectorForMarker(markerId: string) {
  return atmosphereMarkers.find((marker) => marker.id === markerId)?.sectorId;
}

function sectorsForBridge(bridgeId: string) {
  const bridge = atmosphereBridges.find((item) => item.id === bridgeId);
  return bridge ? [bridge.fromSector, bridge.toSector] : [];
}

function parseActiveAtmosphere(inspectorId?: string): ActiveAtmosphere {
  if (!inspectorId) return null;
  if (inspectorId.startsWith("depression-atmosphere-sector-")) {
    return { kind: "sector", id: inspectorId.replace("depression-atmosphere-sector-", "") };
  }
  if (inspectorId.startsWith("depression-atmosphere-marker-")) {
    return { kind: "marker", id: inspectorId.replace("depression-atmosphere-marker-", "") };
  }
  if (inspectorId.startsWith("depression-atmosphere-bridge-")) {
    return { kind: "bridge", id: inspectorId.replace("depression-atmosphere-bridge-", "") };
  }
  return null;
}

function filterLabel(filter: SectorNode["filterGroup"] | "all") {
  if (filter === "all") return "all";
  if (filter === "emotional") return "emotional";
  if (filter === "economic") return "economic";
  if (filter === "cultural") return "cultural";
  return "response";
}

function splitLabel(label: string, maxLength: number) {
  const words = label.split(" ");
  const lines: string[] = [];
  let current = "";
  words.forEach((word) => {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxLength && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  });
  if (current) lines.push(current);
  return lines;
}

function labelPosition(sector: SectorNode, rotation: number) {
  const angle = midAngle(sector.startAngle, sector.endAngle);
  const point = projectPoint(CX, CY, LABEL_R, angle, rotation);
  const anchor = point.x > CX + 18 ? "start" : point.x < CX - 18 ? "end" : "middle";
  return { ...point, angle, anchor: anchor as "start" | "middle" | "end" };
}

function markerPoint(marker: AtmosphereMarker, rotation: number) {
  return projectPoint(CX, CY, laneById[marker.lane].radius, marker.angle, rotation);
}

function markerShape(marker: AtmosphereMarker, point: { x: number; y: number }, color: string, active: boolean) {
  const size = 8 + marker.magnitude * 16;
  const opacity = active ? 0.94 : 0.7;
  return (
    <>
      <circle
        cx={n(point.x)}
        cy={n(point.y)}
        r={n(size * 0.56)}
        fill={color}
        fillOpacity={opacity}
        stroke={paper}
        strokeOpacity={0.9}
        strokeWidth={active ? 2.4 : 1.8}
      />
      <circle
        cx={n(point.x)}
        cy={n(point.y)}
        r={n(size * 0.18)}
        fill={paper}
        fillOpacity={active ? 0.82 : 0.54}
      />
    </>
  );
}

function bridgeArrow(angle: number, color: string, offset: number, active: boolean, rotation: number) {
  const tip = projectPoint(CX, CY, BRIDGE_R - offset * 5.5, angle, rotation);
  return (
    <g transform={`translate(${n(tip.x)} ${n(tip.y)}) rotate(${angle + rotation})`}>
      <polygon points="0,-10 6,6 -6,6" fill={color} fillOpacity={active ? 0.92 : 0.62} />
    </g>
  );
}

export function DepressionAtmosphereLoop({
  activeInspectorId,
  onHover,
  onInspect,
}: DepressionAtmosphereLoopProps) {
  const [localActiveId, setLocalActiveId] = useState<string | null>(null);
  const [hoveredLane, setHoveredLane] = useState<LaneId | null>(null);
  const [filter, setFilter] = useState<SectorNode["filterGroup"] | "all">("all");
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [rotation, setRotation] = useState(0);
  const [scrollRotation, setScrollRotation] = useState(0);
  const [dragging, setDragging] = useState(false);
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef({ active: false, moved: false, startX: 0, startRotation: 0 });
  const displayRotation = rotation + scrollRotation;

  const active = parseActiveAtmosphere(activeInspectorId ?? localActiveId ?? undefined);
  const activeSectorId =
    active?.kind === "sector"
      ? active.id
      : active?.kind === "marker"
        ? sectorForMarker(active.id)
        : active?.kind === "bridge"
          ? sectorsForBridge(active.id)[0]
          : undefined;
  const activeBridgeSectorIds = active?.kind === "bridge" ? sectorsForBridge(active.id) : [];
  const hasFocus = Boolean(active || hoveredLane || filter !== "all");

  const sectorById = useMemo(() => new Map(atmosphereSectors.map((sector) => [sector.id, sector])), []);

  const selectedPanelSector =
    (activeSectorId ? sectorById.get(activeSectorId) : undefined) ??
    (filter !== "all" ? atmosphereSectors.find((sector) => sector.filterGroup === filter) : undefined);

  const connectedBridgeIds = useMemo(() => {
    if (!activeSectorId && !activeBridgeSectorIds.length) return new Set<string>();
    const ids = new Set([activeSectorId, ...activeBridgeSectorIds].filter(Boolean));
    return new Set(
      atmosphereBridges
        .filter((bridge) => ids.has(bridge.fromSector) || ids.has(bridge.toSector))
        .map((bridge) => bridge.id),
    );
  }, [activeSectorId, activeBridgeSectorIds]);

  const sectorOrder = useMemo(
    () =>
      [...atmosphereSectors].sort((a, b) => {
        const aDepth = projectPoint(CX, CY, 1, midAngle(a.startAngle, a.endAngle), displayRotation).depth;
        const bDepth = projectPoint(CX, CY, 1, midAngle(b.startAngle, b.endAngle), displayRotation).depth;
        return aDepth - bDepth;
      }),
    [displayRotation],
  );

  const markerOrder = useMemo(
    () =>
      [...atmosphereMarkers].sort((a, b) => markerPoint(a, displayRotation).depth - markerPoint(b, displayRotation).depth),
    [displayRotation],
  );

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motionQuery.matches) return undefined;

    let frame = 0;
    const updateScrollRotation = () => {
      frame = 0;
      const rect = sectionRef.current?.getBoundingClientRect();
      if (!rect) return;
      const viewportHeight = Math.max(window.innerHeight, 1);
      if (rect.bottom < 0 || rect.top > viewportHeight) return;
      const progress = Math.min(1, Math.max(0, (viewportHeight - rect.top) / (viewportHeight + rect.height)));
      setScrollRotation(Number(((progress - 0.5) * 32).toFixed(3)));
    };
    const requestUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updateScrollRotation);
    };

    updateScrollRotation();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, []);

  const handleLeave = () => {
    setLocalActiveId(null);
    setHoveredLane(null);
    setTooltip(null);
    onHover(null);
  };

  const handleHover = (inspectorId: string, event: ReactMouseEvent<SVGElement>, tooltipState?: Omit<TooltipState, "x" | "y">) => {
    setLocalActiveId(inspectorId);
    if (tooltipState) {
      setTooltip({
        x: event.clientX,
        y: event.clientY,
        ...tooltipState,
      });
    }
    onHover(inspectorId, pointer(event));
  };

  const handleMove = (inspectorId: string, event: ReactMouseEvent<SVGElement>, tooltipState?: Omit<TooltipState, "x" | "y">) => {
    if (tooltipState) {
      setTooltip({
        x: event.clientX,
        y: event.clientY,
        ...tooltipState,
      });
    }
    onHover(inspectorId, pointer(event));
  };

  const handleInspect = (inspectorId: string, event: ReactMouseEvent<SVGElement>) => {
    event.stopPropagation();
    if (dragRef.current.moved) return;
    onInspect(inspectorId, pointer(event));
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    dragRef.current = { active: true, moved: false, startX: event.clientX, startRotation: rotation };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) return;
    const dx = event.clientX - dragRef.current.startX;
    if (Math.abs(dx) > 4) {
      dragRef.current.moved = true;
      setDragging(true);
      setRotation(Math.max(-22, Math.min(22, dragRef.current.startRotation + dx * 0.055)));
      event.preventDefault();
    }
  };

  const handlePointerEnd = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    const moved = dragRef.current.moved;
    dragRef.current.active = false;
    setDragging(false);
    if (moved) {
      window.setTimeout(() => {
        dragRef.current.moved = false;
      }, 0);
    }
  };

  return (
    <div ref={sectionRef} className="relative bg-wheat py-0">
      <div
        className={`depression-atmosphere-scroll overflow-x-auto ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
      >
        <div className="relative min-w-[1080px] w-full">
          <svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            className="depression-atmosphere h-auto w-full select-none"
            role="img"
            aria-label="Social atmosphere loop for depression"
            onMouseLeave={handleLeave}
          >
          <defs>
            <pattern id="depression-atmosphere-grid" width="52" height="52" patternUnits="userSpaceOnUse">
              <path d="M 52 0 L 0 0 0 52" fill="none" stroke={ink} strokeOpacity="0.055" strokeWidth="1" />
            </pattern>
            <pattern id="depression-atmosphere-diagonal" width="28" height="28" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" x2="0" y1="0" y2="28" stroke={ink} strokeOpacity="0.03" strokeWidth="7" />
            </pattern>
          </defs>

          <rect width={WIDTH} height={HEIGHT} fill={paper} />
          <rect width={WIDTH} height={HEIGHT} fill="url(#depression-atmosphere-grid)" />
          <rect x="92" y="122" width={WIDTH - 184} height="880" fill="url(#depression-atmosphere-diagonal)" opacity="0.22" />

          <g opacity="0.96">
            <text x="96" y="78" fill={teal} fontFamily="monospace" fontSize="18" fontWeight="900" letterSpacing="3.4">
              CHART 03 / SOCIAL ATMOSPHERE LOOP
            </text>
            <text x="96" y="126" fill={ink} fontFamily="Helvetica Neue, Helvetica, Arial, sans-serif" fontSize="42" fontWeight="900">
              Depression as a social atmosphere
            </text>
            <text x={WIDTH - 96} y="82" textAnchor="end" fill={ink} opacity="0.58" fontFamily="monospace" fontSize="16" fontWeight="900" letterSpacing="1.4">
              from expert term to generalized social condition
            </text>
            <text x={WIDTH - 96} y="110" textAnchor="end" fill={ink} opacity="0.46" fontFamily="monospace" fontSize="15" fontWeight="900" letterSpacing="0.9">
              projected ring / three source bands / inner circulation arcs
            </text>
          </g>

          <g>
            {sectorOrder.map((sector) => {
              const selected =
                activeSectorId === sector.id ||
                activeBridgeSectorIds.includes(sector.id) ||
                (filter !== "all" && sector.filterGroup === filter);
              const filteredOut = filter !== "all" && sector.filterGroup !== filter;
              const dimmed = hasFocus && !selected && !hoveredLane;
              return (
                <path
                  key={`${sector.id}-sector-fill`}
                  d={annularSectorPath(CX, CY, INNER_WALL, OUTER_WALL, sector.startAngle, sector.endAngle, displayRotation, 1.4)}
                  fill={sector.color}
                  fillOpacity={filteredOut ? 0.045 : selected ? 0.4 : dimmed ? 0.11 : 0.24}
                  stroke={sector.color}
                  strokeOpacity={filteredOut ? 0.1 : selected ? 0.98 : 0.68}
                  strokeWidth={selected ? 4.2 : 2.5}
                />
              );
            })}
          </g>

          <g>
            {laneDefs.map((lane) => {
              const laneActive = hoveredLane === lane.id;
              return (
                <g
                  key={lane.id}
                  opacity={hoveredLane && !laneActive ? 0.36 : 1}
                  onMouseEnter={() => setHoveredLane(lane.id)}
                  onMouseLeave={() => setHoveredLane(null)}
                >
                  <path
                    d={fullAnnulusPath(CX, CY, lane.radius - lane.bandWidth / 2, lane.radius + lane.bandWidth / 2, displayRotation)}
                    fill={lane.color}
                    fillOpacity={laneActive ? 0.22 : 0.125}
                    fillRule="evenodd"
                    stroke={lane.color}
                    strokeOpacity={laneActive ? 0.84 : 0.48}
                    strokeWidth={laneActive ? 2.7 : 1.7}
                  />
                  <ellipse
                    cx={CX}
                    cy={CY}
                    rx={lane.radius}
                    ry={n(lane.radius * TILT)}
                    fill="none"
                    stroke={laneActive ? lane.color : ink}
                    strokeOpacity={laneActive ? 0.84 : 0.42}
                    strokeWidth={laneActive ? 4.8 : 2.4}
                    strokeDasharray={lane.id === "expert" ? "2 15" : lane.id === "media" ? "14 13" : "28 14"}
                  />
                </g>
              );
            })}
          </g>

          <g pointerEvents="none">
            {sectorOrder.map((sector, sectorIndex) => {
              const selected =
                activeSectorId === sector.id ||
                activeBridgeSectorIds.includes(sector.id) ||
                (filter !== "all" && sector.filterGroup === filter);
              const hidden = filter !== "all" && sector.filterGroup !== filter;
              const range = angleRange(sector.startAngle, sector.endAngle);
              return laneDefs.map((lane, laneIndex) => {
                const marks = Array.from({ length: 5 }, (_, index) => {
                  const progress = (index + 0.68) / 5.8;
                  const startAngle = range.start + range.span * progress;
                  const radius =
                    lane.radius +
                    (index % 3 === 0 ? -0.3 : index % 3 === 1 ? 0.06 : 0.32) * lane.bandWidth +
                    Math.sin((sectorIndex + 1) * 1.7 + index * 1.1 + laneIndex) * 3.4;
                  const depth = projectPoint(CX, CY, radius, startAngle, displayRotation).depth;
                  const length = 3.8 + index * 0.7 + Math.max(0, depth) * 1.6;
                  return { startAngle, radius, depth, length };
                });
                return (
                  <g key={`${sector.id}-${lane.id}-surface`} opacity={hidden ? 0.1 : selected ? 0.66 : 0.36}>
                    {marks.map((mark, index) => (
                      <path
                        key={`${sector.id}-${lane.id}-texture-${index}`}
                        d={circularArcPath(CX, CY, mark.radius, mark.startAngle, mark.startAngle + mark.length, displayRotation)}
                        fill="none"
                        stroke={selected ? sector.color : lane.color}
                        strokeOpacity={0.42 + Math.max(0, mark.depth) * 0.24}
                        strokeWidth={selected ? 2.8 : 1.8}
                        strokeLinecap="round"
                      />
                    ))}
                    <path
                      d={circularArcPath(
                        CX,
                        CY,
                        lane.radius + (laneIndex - 1) * 2.8,
                        range.start + 5,
                        range.end - 5,
                        displayRotation,
                      )}
                      fill="none"
                      stroke={selected ? sector.color : ink}
                      strokeOpacity={selected ? 0.28 : 0.14}
                      strokeWidth={selected ? 1.7 : 1.2}
                      strokeDasharray="1 18"
                      strokeLinecap="round"
                    />
                  </g>
                );
              });
            })}
          </g>

          <ellipse cx={CX} cy={CY} rx={OUTER_WALL} ry={n(OUTER_WALL * TILT)} fill="none" stroke={ink} strokeOpacity="0.66" strokeWidth="3.8" />
          <ellipse cx={CX} cy={CY} rx={INNER_WALL} ry={n(INNER_WALL * TILT)} fill="none" stroke={ink} strokeOpacity="0.54" strokeWidth="2.8" />

          <g>
            {sectorOrder.map((sector) => {
              const selected =
                activeSectorId === sector.id ||
                activeBridgeSectorIds.includes(sector.id) ||
                (filter !== "all" && sector.filterGroup === filter);
              const hidden = filter !== "all" && sector.filterGroup !== filter;
              return (
                <g key={`${sector.id}-walls`} opacity={hidden ? 0.18 : selected ? 1 : 0.68}>
                  {[sector.startAngle, sector.endAngle].map((angle) => {
                    const inner = projectPoint(CX, CY, INNER_WALL, angle, displayRotation);
                    const outer = projectPoint(CX, CY, OUTER_WALL, angle, displayRotation);
                    return (
                      <line
                        key={`${sector.id}-wall-${angle}`}
                        x1={n(inner.x)}
                        y1={n(inner.y)}
                        x2={n(outer.x)}
                        y2={n(outer.y)}
                        stroke={paper}
                        strokeOpacity={selected ? 0.95 : 0.7}
                        strokeWidth={selected ? 4 : 2.2}
                        strokeLinecap="round"
                      />
                    );
                  })}
                  {selected ? (
                    <path
                      d={annularSectorPath(CX, CY, OUTER_WALL - 10, OUTER_WALL + 5, sector.startAngle, sector.endAngle, displayRotation, 1)}
                      fill={sector.color}
                      fillOpacity="0.9"
                    />
                  ) : null}
                </g>
              );
            })}
          </g>

          <g>
            {atmosphereBridges.map((bridge, index) => {
              const from = sectorById.get(bridge.fromSector);
              const to = sectorById.get(bridge.toSector);
              if (!from || !to) return null;
              const fromAngle = midAngle(from.startAngle, from.endAngle);
              const toAngle = midAngle(to.startAngle, to.endAngle);
              const inspectorId = atmosphereBridgeInspectorId(bridge.id);
              const selected = active?.kind === "bridge" && active.id === bridge.id;
              const connected = connectedBridgeIds.has(bridge.id);
              const filteredOut =
                filter !== "all" && from.filterGroup !== filter && to.filterGroup !== filter;
              const activeBridge = selected || connected;
              const dimmed = hasFocus && !activeBridge;
              const bridgeColor = to.color;
              const arcOffset = index % 3;
              const labelAngle = bridgeMidAngle(fromAngle, toAngle);
              const labelPoint = projectPoint(CX, CY, BRIDGE_R - arcOffset * 5.5 - 27, labelAngle, displayRotation);
              return (
                <g
                  key={bridge.id}
                  className="cursor-crosshair"
                  opacity={filteredOut ? 0.14 : dimmed ? 0.24 : 1}
                  onMouseEnter={(event) =>
                    handleHover(inspectorId, event, {
                      title: `${from.shortLabel} -> ${to.shortLabel}`,
                      detail: bridge.label,
                    })
                  }
                  onMouseMove={(event) =>
                    handleMove(inspectorId, event, {
                      title: `${from.shortLabel} -> ${to.shortLabel}`,
                      detail: bridge.label,
                    })
                  }
                  onClick={(event) => handleInspect(inspectorId, event)}
                >
                  <path d={bridgeArcPath(fromAngle, toAngle, arcOffset, displayRotation)} fill="none" stroke="transparent" strokeWidth="24" />
                  <path
                    d={bridgeArcPath(fromAngle, toAngle, arcOffset, displayRotation)}
                    fill="none"
                    stroke={paper}
                    strokeOpacity="0.8"
                    strokeWidth={n(8 + bridge.strength * 4)}
                    strokeLinecap="round"
                  />
                  <path
                    d={bridgeArcPath(fromAngle, toAngle, arcOffset, displayRotation)}
                    fill="none"
                    stroke={bridgeColor}
                    strokeOpacity={activeBridge ? 0.94 : 0.58}
                    strokeWidth={n(2.6 + bridge.strength * (activeBridge ? 5.6 : 3.6))}
                    strokeLinecap="round"
                  />
                  {bridgeArrow(toAngle, bridgeColor, arcOffset, activeBridge, displayRotation)}
                  {activeBridge ? (
                    <text
                      x={n(labelPoint.x)}
                      y={n(labelPoint.y)}
                      textAnchor="middle"
                      fill={bridgeColor}
                      fontFamily="monospace"
                      fontSize="12"
                      fontWeight="900"
                      letterSpacing="0.6"
                      paintOrder="stroke"
                      stroke={paper}
                      strokeWidth="5"
                      strokeLinejoin="round"
                    >
                      {bridge.label.length > 34 ? `${bridge.label.slice(0, 31)}...` : bridge.label}
                    </text>
                  ) : null}
                </g>
              );
            })}
          </g>

          <ellipse cx={CX} cy={CY} rx={INNER_WALL - 7} ry={n((INNER_WALL - 7) * TILT)} fill={paper} fillOpacity="0.98" stroke={ink} strokeOpacity="0.34" strokeWidth="2.1" />
          <ellipse cx={CX} cy={CY} rx={BRIDGE_R + 20} ry={n((BRIDGE_R + 20) * TILT)} fill="none" stroke={ink} strokeOpacity="0.2" strokeWidth="1.5" strokeDasharray="8 12" />
          <text x={CX} y={CY - 18} textAnchor="middle" fill={ink} opacity="0.84" fontFamily="monospace" fontSize="18" fontWeight="900" letterSpacing="3.2">
            AMBIENT CORE
          </text>
          <text x={CX} y={CY + 16} textAnchor="middle" fill={ink} opacity="0.6" fontFamily="monospace" fontSize="13" fontWeight="900" letterSpacing="1.3">
            expert &gt; media &gt; lived
          </text>

          <g>
            {markerOrder.map((marker) => {
              const sector = sectorById.get(marker.sectorId);
              if (!sector) return null;
              const point = markerPoint(marker, displayRotation);
              const inspectorId = atmosphereMarkerInspectorId(marker.id);
              const selected = active?.kind === "marker" && active.id === marker.id;
              const relatedSector = activeSectorId === marker.sectorId || activeBridgeSectorIds.includes(marker.sectorId);
              const laneActive = hoveredLane === marker.lane;
              const filteredOut = filter !== "all" && sector.filterGroup !== filter;
              const dimmed = hasFocus && !selected && !relatedSector && !laneActive;
              const color = selected || relatedSector ? sector.color : laneById[marker.lane].color;
              return (
                <g
                  key={marker.id}
                  className="cursor-crosshair depression-atmosphere-marker"
                  opacity={filteredOut ? 0.16 : dimmed ? 0.3 : 1}
                  onMouseEnter={(event) =>
                    handleHover(inspectorId, event, {
                      title: `${sector.shortLabel} / ${laneById[marker.lane].shortLabel}`,
                      detail: marker.phraseCluster.join(", "),
                    })
                  }
                  onMouseMove={(event) =>
                    handleMove(inspectorId, event, {
                      title: `${sector.shortLabel} / ${laneById[marker.lane].shortLabel}`,
                      detail: marker.phraseCluster.join(", "),
                    })
                  }
                  onClick={(event) => handleInspect(inspectorId, event)}
                >
                  <circle
                    cx={n(point.x)}
                    cy={n(point.y)}
                    r={n(13 + marker.magnitude * 12)}
                    fill={paper}
                    fillOpacity="0.92"
                    stroke={ink}
                    strokeOpacity={selected || relatedSector || laneActive ? 0.62 : 0.34}
                    strokeWidth={selected || relatedSector || laneActive ? 2.5 : 1.6}
                  />
                  {markerShape(marker, point, color, selected || relatedSector || laneActive)}
                </g>
              );
            })}
          </g>

          <g pointerEvents="none">
            {atmosphereSectors.map((sector) => {
              const selected =
                activeSectorId === sector.id ||
                activeBridgeSectorIds.includes(sector.id) ||
                (filter !== "all" && sector.filterGroup === filter);
              const hidden = filter !== "all" && sector.filterGroup !== filter;
              const position = labelPosition(sector, displayRotation);
              const labelLines = splitLabel(sector.label, 17);
              const ruleStart = projectPoint(CX, CY, OUTER_WALL + 8, position.angle, displayRotation);
              const ruleEnd = projectPoint(CX, CY, OUTER_WALL + 78, position.angle, displayRotation);
              const keywordAboveTitle = position.y > CY + 92;
              const keywordY = keywordAboveTitle
                ? position.y - 28
                : position.y + 24 + labelLines.length * 20;
              return (
                <g key={`${sector.id}-label`} opacity={hidden ? 0.28 : selected ? 1 : 0.94}>
                  <line
                    x1={n(ruleStart.x)}
                    y1={n(ruleStart.y)}
                    x2={n(ruleEnd.x)}
                    y2={n(ruleEnd.y)}
                    stroke={sector.color}
                    strokeOpacity={selected ? 0.95 : 0.68}
                    strokeWidth={selected ? 3.2 : 1.8}
                  />
                  <text
                    x={n(position.x)}
                    y={n(position.y)}
                    textAnchor={position.anchor}
                    fill={selected ? sector.color : ink}
                    fontFamily="Helvetica Neue, Helvetica, Arial, sans-serif"
                    fontSize={selected ? 26 : 22}
                    fontWeight="900"
                  >
                    {labelLines.map((line, index) => (
                      <tspan key={`${sector.id}-${line}`} x={n(position.x)} dy={index === 0 ? 0 : 26}>
                        {line}
                      </tspan>
                    ))}
                  </text>
                  <text
                    x={n(position.x)}
                    y={n(keywordY)}
                    textAnchor={position.anchor}
                    fill={ink}
                    opacity={selected ? 0.78 : 0.6}
                    fontFamily="monospace"
                    fontSize="13"
                    fontWeight="900"
                    letterSpacing="0.8"
                  >
                    {sector.keywords.slice(0, 2).join(" / ").toUpperCase()}
                  </text>
                </g>
              );
            })}
          </g>

          <g transform="translate(1210 964)">
            <line x1="0" x2="330" y1="0" y2="0" stroke={ink} strokeOpacity="0.55" strokeWidth="1.8" />
            <text x="0" y="30" fill={ink} opacity="0.68" fontFamily="monospace" fontSize="14" fontWeight="900" letterSpacing="2">
              LANES
            </text>
            {laneDefs.map((lane, index) => (
              <g
                key={`${lane.id}-legend`}
                className="cursor-crosshair"
                transform={`translate(0 ${58 + index * 34})`}
                onMouseEnter={() => setHoveredLane(lane.id)}
                onMouseLeave={() => setHoveredLane(null)}
              >
                <rect x="0" y="-12" width="76" height="20" fill={lane.color} fillOpacity={hoveredLane === lane.id ? 0.42 : 0.25} stroke={lane.color} strokeOpacity="0.68" />
                <text x="96" y="5" fill={lane.color} fontFamily="monospace" fontSize="14" fontWeight="900" letterSpacing="1.1">
                  {lane.label}
                </text>
              </g>
            ))}
          </g>

          <g transform="translate(106 962)">
            <line x1="0" x2="650" y1="0" y2="0" stroke={selectedPanelSector?.color ?? teal} strokeOpacity="0.92" strokeWidth="4.6" />
            <text x="0" y="38" fill={selectedPanelSector?.color ?? teal} fontFamily="monospace" fontSize="16" fontWeight="900" letterSpacing="2">
              {selectedPanelSector ? selectedPanelSector.label.toUpperCase() : "DIFFUSION PATH"}
            </text>
            <text x="0" y="76" fill={ink} fontFamily="Helvetica Neue, Helvetica, Arial, sans-serif" fontSize="28" fontWeight="900">
              {selectedPanelSector
                ? selectedPanelSector.keywords.slice(0, 3).join(" / ")
                : "expert trace -> media circulation -> lived uptake"}
            </text>
            <text x="0" y="112" fill={ink} opacity="0.72" fontFamily="monospace" fontSize="15" fontWeight="900" letterSpacing="0.6">
              {selectedPanelSector
                ? selectedPanelSector.keywords.slice(3).join(" / ")
                : "condition-language moves outward, then feeds back through response"}
            </text>
            <text x="0" y="148" fill={ink} opacity="0.64" fontFamily="monospace" fontSize="14" fontWeight="900" letterSpacing="0.7">
              {selectedPanelSector ? `GENERALIZATION ${Math.round(selectedPanelSector.generalization * 100)} / WEIGHT ${Math.round(selectedPanelSector.weight * 100)}` : "SEMANTIC CIRCULATION / NOT PREVALENCE"}
            </text>
          </g>
          </svg>

          <div
            className="absolute left-[3.9%] top-[14%] z-10 flex flex-wrap gap-2"
            role="group"
            aria-label="Filter social atmosphere sectors"
            onPointerDown={(event) => event.stopPropagation()}
          >
            {(["all", "emotional", "economic", "cultural", "response"] as const).map((item) => {
              const activeFilter = filter === item;
              return (
                <button
                  key={item}
                  type="button"
                  aria-pressed={activeFilter}
                  onClick={() => setFilter(item)}
                  className={`border px-4 py-2 font-mono text-[0.72rem] font-black uppercase tracking-[0.14em] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${
                    activeFilter
                      ? "border-ink bg-ink text-wheat"
                      : "border-ink/35 bg-wheat/82 text-ink backdrop-blur-[1px] hover:border-ink/70"
                  }`}
                >
                  {filterLabel(item)}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {tooltip ? (
        <div
          className="pointer-events-none fixed z-50 max-w-[280px] border border-ink bg-ink px-3 py-2 font-mono text-xs font-black leading-relaxed text-wheat shadow-[4px_4px_0_rgba(5,5,16,0.18)]"
          style={{ left: tooltip.x + 14, top: tooltip.y - 8 }}
        >
          <p className="uppercase tracking-[0.14em] text-wheat/72">{tooltip.title}</p>
          <p className="mt-1 normal-case tracking-normal">{tooltip.detail}</p>
        </div>
      ) : null}
    </div>
  );
}
