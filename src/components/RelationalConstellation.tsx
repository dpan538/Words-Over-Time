"use client";

import { useMemo, useState } from "react";
import type {
  ForeverEraId,
  GeneratedCategory,
  GeneratedCollocate,
  GeneratedModernContext,
  GeneratedPhrase,
  GeneratedSnippet,
} from "@/types/foreverRealData";

type PointerPosition = { x: number; y: number };

type RelationalConstellationProps = {
  phrases: GeneratedPhrase[];
  collocates: GeneratedCollocate[];
  categories: GeneratedCategory[];
  snippets: GeneratedSnippet[];
  modernContext?: GeneratedModernContext | null;
  selectedEra: ForeverEraId;
  activeInspectorId?: string;
  onHover: (inspectorId: string | null, position?: PointerPosition) => void;
  onInspect: (inspectorId: string, position?: PointerPosition) => void;
};

type Node = {
  id: string;
  inspectorId: string;
  label: string;
  kind: "center" | "phrase" | "collocate" | "category" | "snippet";
  layer: "archival" | "modern" | "shared";
  x: number;
  y: number;
  radius: number;
  color: string;
  categoryIds: string[];
  value: number;
  labelX?: number;
  labelY?: number;
  labelAnchor?: "start" | "middle" | "end";
};

type Edge = {
  id: string;
  inspectorId: string;
  source: string;
  target: string;
  color: string;
  weight: number;
  relation: "phrase" | "collocate" | "category" | "snippet" | "layer";
};

const width = 2200;
const height = 1480;
const cx = 1100;
const cy = 760;

const categoryOrder = [
  "eternity_religion",
  "romance_vow",
  "permanence_duration",
  "remembrance",
  "hyperbole_colloquial",
];

const categoryAngles: Record<string, number> = {
  eternity_religion: 225,
  romance_vow: 292,
  permanence_duration: 5,
  remembrance: 72,
  hyperbole_colloquial: 145,
};

const colorFallbacks: Record<string, string> = {
  eternity_religion: "#1570AC",
  romance_vow: "#A1081F",
  permanence_duration: "#F06B04",
  remembrance: "#036C17",
  hyperbole_colloquial: "#FBB728",
  digital_permanence: "#2C9FC7",
};

function ellipsePoint(rx: number, ry: number, angle: number) {
  const radians = (angle * Math.PI) / 180;
  return {
    x: cx + Math.cos(radians) * rx,
    y: cy + Math.sin(radians) * ry,
  };
}

function curvePath(a: Node, b: Node, bend = 0.22) {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return `M ${a.x} ${a.y} Q ${mx - dy * bend} ${my + dx * bend} ${b.x} ${b.y}`;
}

function wrapWords(label: string, maxChars = 18) {
  const words = label.split(" ");
  const lines: string[] = [];
  let current = "";
  words.forEach((word) => {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  });
  if (current) lines.push(current);
  return lines;
}

function categoryColor(categoryIds: string[], categories: GeneratedCategory[]) {
  const id = categoryIds[0];
  return categories.find((category) => category.id === id)?.color ?? colorFallbacks[id] ?? "#050510";
}

function phraseAngles(count: number, layer: "archival" | "modern") {
  const start = layer === "archival" ? 118 : -62;
  const end = layer === "archival" ? 242 : 62;
  if (count <= 1) return [(start + end) / 2];
  return Array.from({ length: count }).map((_, index) => start + ((end - start) / (count - 1)) * index);
}

function collocateAngles(count: number, layer: "archival" | "modern") {
  const start = layer === "archival" ? 206 : -96;
  const end = layer === "archival" ? 304 : 18;
  if (count <= 1) return [(start + end) / 2];
  return Array.from({ length: count }).map((_, index) => start + ((end - start) / (count - 1)) * index);
}

function labelAnchor(x: number) {
  if (x > cx + 90) return "start";
  if (x < cx - 90) return "end";
  return "middle";
}

function categoryLabelPosition(categoryId: string, point: { x: number; y: number }) {
  const positions: Record<string, { x: number; y: number; anchor: "start" | "middle" | "end" }> = {
    eternity_religion: { x: point.x - 96, y: point.y + 92, anchor: "end" },
    romance_vow: { x: point.x + 118, y: point.y + 74, anchor: "start" },
    permanence_duration: { x: point.x + 84, y: point.y + 90, anchor: "start" },
    remembrance: { x: point.x - 70, y: point.y + 96, anchor: "end" },
    hyperbole_colloquial: { x: point.x - 96, y: point.y - 78, anchor: "end" },
  };
  return positions[categoryId] ?? { x: point.x, y: point.y + 72, anchor: "middle" as const };
}

function localLabelPosition(
  point: { x: number; y: number },
  index: number,
  preferred?: "left" | "right",
): { x: number; y: number; anchor: "start" | "end" } {
  const side = preferred ?? (point.x >= cx ? "right" : "left");
  const anchor = side === "right" ? "start" : "end";
  const offsetX = side === "right" ? 24 : -24;
  const offsetY = [-18, 0, 18, 34][index % 4];
  return { x: point.x + offsetX, y: point.y + offsetY, anchor };
}

export function RelationalConstellation({
  phrases,
  collocates,
  categories,
  snippets,
  modernContext,
  selectedEra,
  activeInspectorId,
  onHover,
  onInspect,
}: RelationalConstellationProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const activeId = activeInspectorId ?? hoveredId;

  const { nodes, edges } = useMemo(() => {
    const showArchival = selectedEra === "all" || ["1700-1799", "1800-1849", "1850-1899", "1900-1949"].includes(selectedEra);
    const showModern = selectedEra === "all" || selectedEra === "recent" || selectedEra === "2000-2019";
    const archivalPhrases = phrases
      .filter((phrase) => (selectedEra === "all" ? phrase.eraId === "all" : phrase.eraId === selectedEra) && phrase.displayEligible)
      .sort((a, b) => b.count - a.count || b.scoreValue - a.scoreValue)
      .slice(0, 10);
    const archivalCollocates = collocates
      .filter((collocate) => (selectedEra === "all" ? collocate.eraId === "all" : collocate.eraId === selectedEra) && collocate.displayEligible)
      .sort((a, b) => b.count - a.count || b.scoreValue - a.scoreValue)
      .slice(0, 8);
    const modernPhrases = modernContext?.phrases.filter((phrase) => phrase.displayEligible).slice(0, 8) ?? [];
    const modernCollocates = modernContext?.collocates.slice(0, 9) ?? [];
    const archivalSnippets = snippets
      .filter((snippet) => selectedEra === "all" || snippet.eraId === selectedEra)
      .sort((a, b) => a.year - b.year)
      .slice(0, 14);
    const modernSnippets = modernContext?.snippets.slice(0, 10) ?? [];
    const nextNodes: Node[] = [
      {
        id: "forever-center",
        inspectorId: "inspect-node-forever-all",
        label: "forever",
        kind: "center",
        layer: "shared",
        x: cx,
        y: cy,
        radius: 68,
        color: "#050510",
        categoryIds: [],
        value: 1,
      },
    ];
    const nextEdges: Edge[] = [];

    categories
      .filter((category) => categoryOrder.includes(category.id))
      .forEach((category) => {
        const point = ellipsePoint(532, 390, categoryAngles[category.id]);
        const label = categoryLabelPosition(category.id, point);
        nextNodes.push({
          id: `category-${category.id}`,
          inspectorId: `inspect-category-${category.id}-all`,
          label: category.label,
          kind: "category",
          layer: "shared",
          x: point.x,
          y: point.y,
          radius: 25,
          color: category.color,
          categoryIds: [category.id],
          value: 1,
          labelX: label.x,
          labelY: label.y,
          labelAnchor: label.anchor,
        });
        nextEdges.push({
          id: `edge-center-category-${category.id}`,
          inspectorId: `inspect-category-${category.id}-all`,
          source: "forever-center",
          target: `category-${category.id}`,
          color: category.color,
          weight: 1.7,
          relation: "category",
        });
      });

    if (showArchival) {
      const angles = phraseAngles(archivalPhrases.length, "archival");
      archivalPhrases.forEach((phrase, index) => {
        const point = ellipsePoint(330 + (index % 2) * 46, 250 + (index % 2) * 34, angles[index]);
        const id = `archival-phrase-${phrase.id}`;
        const color = categoryColor(phrase.categoryIds, categories);
        nextNodes.push({
          id,
          inspectorId: phrase.inspectorId,
          label: phrase.phrase,
          kind: "phrase",
          layer: "archival",
          x: point.x,
          y: point.y,
          radius: 17 + Math.min(15, phrase.count * 2.1),
          color,
          categoryIds: phrase.categoryIds,
          value: phrase.count,
        });
        nextEdges.push({
          id: `edge-center-${id}`,
          inspectorId: phrase.inspectorId,
          source: "forever-center",
          target: id,
          color,
          weight: 1.9 + Math.min(5.6, phrase.count * 0.62),
          relation: "phrase",
        });
        phrase.categoryIds.slice(0, 2).forEach((categoryId) => {
          if (!categoryOrder.includes(categoryId)) return;
          nextEdges.push({
            id: `edge-${id}-${categoryId}`,
            inspectorId: phrase.inspectorId,
            source: id,
            target: `category-${categoryId}`,
            color,
            weight: 1.2 + Math.min(4, phrase.count * 0.34),
            relation: "category",
          });
        });
      });

      const collocateArc = collocateAngles(archivalCollocates.length, "archival");
      archivalCollocates.forEach((collocate, index) => {
        const point = ellipsePoint(702 + (index % 3) * 36, 520 + (index % 3) * 26, collocateArc[index]);
        const color = categoryColor(collocate.categoryIds, categories);
        const id = `archival-collocate-${collocate.id}`;
        const label = localLabelPosition(point, index, "left");
        nextNodes.push({
          id,
          inspectorId: collocate.inspectorId,
          label: collocate.token,
          kind: "collocate",
          layer: "archival",
          x: point.x,
          y: point.y,
          radius: 6 + Math.min(14, collocate.count * 0.65),
          color,
          categoryIds: collocate.categoryIds,
          value: collocate.count,
          labelX: label.x,
          labelY: label.y,
          labelAnchor: label.anchor,
        });
        const categoryId = collocate.categoryIds.find((item) => categoryOrder.includes(item));
        nextEdges.push({
          id: `edge-${id}`,
          inspectorId: collocate.inspectorId,
          source: id,
          target: categoryId ? `category-${categoryId}` : "forever-center",
          color,
          weight: 0.75 + Math.min(3.2, collocate.count * 0.19),
          relation: "collocate",
        });
      });

      archivalSnippets.forEach((snippet, index) => {
        const point = ellipsePoint(822, 616, 142 + index * (102 / Math.max(1, archivalSnippets.length - 1)));
        const id = `archival-snippet-${snippet.id}`;
        const color = categoryColor(snippet.categoryIds, categories);
        const label = localLabelPosition(point, index, "left");
        nextNodes.push({
          id,
          inspectorId: snippet.inspectorId,
          label: String(snippet.year),
          kind: "snippet",
          layer: "archival",
          x: point.x,
          y: point.y,
          radius: 5,
          color,
          categoryIds: snippet.categoryIds,
          value: 1,
          labelX: label.x,
          labelY: label.y,
          labelAnchor: label.anchor,
        });
        const categoryId = snippet.categoryIds.find((item) => categoryOrder.includes(item));
        nextEdges.push({
          id: `edge-${id}`,
          inspectorId: snippet.inspectorId,
          source: id,
          target: categoryId ? `category-${categoryId}` : "forever-center",
          color,
          weight: 0.7,
          relation: "snippet",
        });
      });
    }

    if (showModern && modernContext) {
      const angles = phraseAngles(modernPhrases.length, "modern");
      modernPhrases.forEach((phrase, index) => {
        const point = ellipsePoint(344 + (index % 2) * 48, 260 + (index % 2) * 34, angles[index]);
        const id = `modern-phrase-${phrase.id}`;
        const color = categoryColor(phrase.categoryIds, categories) || "#2C9FC7";
        nextNodes.push({
          id,
          inspectorId: phrase.id,
          label: phrase.phrase,
          kind: "phrase",
          layer: "modern",
          x: point.x,
          y: point.y,
          radius: 17 + Math.min(15, phrase.count * 2.4),
          color,
          categoryIds: phrase.categoryIds,
          value: phrase.count,
        });
        nextEdges.push({
          id: `edge-center-${id}`,
          inspectorId: phrase.id,
          source: "forever-center",
          target: id,
          color,
          weight: 2 + Math.min(5.2, phrase.count * 0.74),
          relation: "phrase",
        });
        phrase.categoryIds.slice(0, 2).forEach((categoryId) => {
          if (!categoryOrder.includes(categoryId)) return;
          nextEdges.push({
            id: `edge-${id}-${categoryId}`,
            inspectorId: phrase.id,
            source: id,
            target: `category-${categoryId}`,
            color,
            weight: 1.2 + Math.min(3.6, phrase.count * 0.42),
            relation: "category",
          });
        });
      });

      const collocateArc = collocateAngles(modernCollocates.length, "modern");
      modernCollocates.forEach((collocate, index) => {
        const point = ellipsePoint(706 + (index % 3) * 36, 520 + (index % 3) * 26, collocateArc[index]);
        const id = `modern-collocate-${collocate.id}`;
        const color = categoryColor(collocate.categoryIds, categories) || "#2C9FC7";
        const label = localLabelPosition(point, index, "right");
        nextNodes.push({
          id,
          inspectorId: collocate.id,
          label: collocate.token,
          kind: "collocate",
          layer: "modern",
          x: point.x,
          y: point.y,
          radius: 6 + Math.min(14, collocate.count * 0.78),
          color,
          categoryIds: collocate.categoryIds,
          value: collocate.count,
          labelX: label.x,
          labelY: label.y,
          labelAnchor: label.anchor,
        });
        const categoryId = collocate.categoryIds.find((item) => categoryOrder.includes(item));
        nextEdges.push({
          id: `edge-${id}`,
          inspectorId: collocate.id,
          source: id,
          target: categoryId ? `category-${categoryId}` : "forever-center",
          color,
          weight: 0.75 + Math.min(3.2, collocate.count * 0.22),
          relation: "collocate",
        });
      });

      modernSnippets.forEach((snippet, index) => {
        const point = ellipsePoint(824, 618, 36 + index * (102 / Math.max(1, modernSnippets.length - 1)));
        const id = `modern-snippet-${snippet.id}`;
        const color = categoryColor(snippet.categoryIds, categories) || "#2C9FC7";
        const label = localLabelPosition(point, index, "right");
        nextNodes.push({
          id,
          inspectorId: snippet.id,
          label: String(snippet.year),
          kind: "snippet",
          layer: "modern",
          x: point.x,
          y: point.y,
          radius: 5,
          color,
          categoryIds: snippet.categoryIds,
          value: 1,
          labelX: label.x,
          labelY: label.y,
          labelAnchor: label.anchor,
        });
        const categoryId = snippet.categoryIds.find((item) => categoryOrder.includes(item));
        nextEdges.push({
          id: `edge-${id}`,
          inspectorId: snippet.id,
          source: id,
          target: categoryId ? `category-${categoryId}` : "forever-center",
          color,
          weight: 0.7,
          relation: "snippet",
        });
      });
    }

    return { nodes: nextNodes, edges: nextEdges };
  }, [categories, collocates, modernContext, phrases, selectedEra, snippets]);

  const nodesById = useMemo(() => new Map(nodes.map((node) => [node.id, node])), [nodes]);
  const activeNode = nodes.find((node) => node.inspectorId === activeId);
  const activeEdge = edges.find((edge) => edge.inspectorId === activeId);
  const connectedIds = useMemo(() => {
    const set = new Set<string>();
    if (activeNode) {
      set.add(activeNode.id);
      edges.forEach((edge) => {
        if (edge.source === activeNode.id || edge.target === activeNode.id) {
          set.add(edge.id);
          set.add(edge.source);
          set.add(edge.target);
        }
      });
    }
    if (activeEdge) {
      set.add(activeEdge.id);
      set.add(activeEdge.source);
      set.add(activeEdge.target);
    }
    return set;
  }, [activeEdge, activeNode, edges]);
  const focused = Boolean(activeId);

  return (
    <div className="relative overflow-hidden bg-wheat py-2">
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-auto min-w-[1540px] w-full"
          role="img"
          aria-label="Radial relationship constellation for forever"
          onMouseLeave={() => {
            setHoveredId(null);
            onHover(null);
          }}
        >
          <defs>
            <pattern id="constellation-paper" width="38" height="38" patternUnits="userSpaceOnUse">
              <path d="M 38 0 L 0 0 0 38" fill="none" stroke="#050510" strokeOpacity="0.035" />
            </pattern>
            <filter id="constellation-glow">
              <feGaussianBlur stdDeviation="7" />
            </filter>
          </defs>
          <rect width={width} height={height} fill="#F5ECD2" />
          <rect width={width} height={height} fill="url(#constellation-paper)" />

          <text x="76" y="54" className="fill-fire font-mono text-[18px] font-black uppercase tracking-[0.2em]">
            radial relational constellation
          </text>
          <text x={width - 76} y="54" textAnchor="end" className="fill-ink/58 font-mono text-[15px] font-black uppercase tracking-[0.13em]">
            archive and modern snapshot kept apart
          </text>

          {[
            [248, 176],
            [376, 284],
            [532, 390],
            [716, 532],
            [850, 638],
          ].map(([rx, ry], index) => (
            <ellipse
              key={`${rx}-${ry}`}
              cx={cx}
              cy={cy}
              rx={rx}
              ry={ry}
              fill="none"
              stroke="#050510"
              strokeWidth={index === 2 ? 1.6 : 1}
              strokeDasharray={index % 2 ? "4 12" : "2 10"}
              strokeOpacity={index === 2 ? 0.18 : 0.1}
            />
          ))}

          <g opacity="0.72">
            <line x1="178" x2="178" y1="246" y2="1230" stroke="#F06B04" strokeWidth="3" strokeLinecap="round" />
            <line x1="2022" x2="2022" y1="246" y2="1230" stroke="#2C9FC7" strokeWidth="3" strokeLinecap="round" />
            <line x1="178" x2="330" y1="246" y2="246" stroke="#F06B04" strokeWidth="3" strokeLinecap="round" />
            <line x1="1870" x2="2022" y1="246" y2="246" stroke="#2C9FC7" strokeWidth="3" strokeLinecap="round" />
          </g>
          <text x="272" y="222" className="fill-ink/58 font-mono text-[16px] font-black uppercase tracking-[0.14em]">
            archival / 1726-1930
          </text>
          <text x="1624" y="222" className="fill-ink/58 font-mono text-[16px] font-black uppercase tracking-[0.14em]">
            modern snapshot / 2024-2026
          </text>

          {edges.map((edge) => {
            const source = nodesById.get(edge.source);
            const target = nodesById.get(edge.target);
            if (!source || !target) return null;
            const active = connectedIds.has(edge.id) || activeId === edge.inspectorId;
            const dimmed = focused && !active;
            const bend = edge.relation === "category" ? 0.1 : edge.relation === "collocate" ? -0.18 : 0.2;
            return (
              <path
                key={edge.id}
                d={curvePath(source, target, bend)}
                fill="none"
                stroke={edge.color}
                strokeWidth={active ? edge.weight + 2 : edge.weight}
                strokeLinecap="round"
                strokeOpacity={dimmed ? 0.045 : active ? 0.9 : edge.relation === "snippet" ? 0.035 : edge.relation === "collocate" ? 0.16 : 0.38}
                strokeDasharray={edge.relation === "collocate" || edge.relation === "snippet" ? "3 9" : undefined}
                className="cursor-crosshair transition duration-200"
                onMouseEnter={(event) => {
                  setHoveredId(edge.inspectorId);
                  onHover(edge.inspectorId, { x: event.clientX, y: event.clientY });
                }}
                onMouseMove={(event) => onHover(edge.inspectorId, { x: event.clientX, y: event.clientY })}
                onClick={(event) => {
                  event.stopPropagation();
                  onInspect(edge.inspectorId, { x: event.clientX, y: event.clientY });
                }}
              />
            );
          })}

          {nodes.map((node) => {
            const active = connectedIds.has(node.id) || activeId === node.inspectorId;
            const dimmed = focused && !active;
            const lines = wrapWords(node.label, node.kind === "phrase" ? 17 : 16);
            const anchor = labelAnchor(node.x);
            const computedLabelX = anchor === "start" ? node.x + node.radius + 14 : anchor === "end" ? node.x - node.radius - 14 : node.x;
            const computedLabelY = node.kind === "category" ? node.y + 58 : node.kind === "snippet" ? node.y + 28 : node.y + node.radius + 28;
            const labelX = node.labelX ?? computedLabelX;
            const labelY = node.labelY ?? computedLabelY;
            const textAnchor = node.labelAnchor ?? anchor;

            return (
              <g
                key={node.id}
                opacity={dimmed ? 0.15 : 1}
                className="cursor-crosshair transition duration-200"
                onMouseEnter={(event) => {
                  setHoveredId(node.inspectorId);
                  onHover(node.inspectorId, { x: event.clientX, y: event.clientY });
                }}
                onMouseMove={(event) => onHover(node.inspectorId, { x: event.clientX, y: event.clientY })}
                onClick={(event) => {
                  event.stopPropagation();
                  onInspect(node.inspectorId, { x: event.clientX, y: event.clientY });
                }}
              >
                {node.kind === "center" ? (
                  <>
                    <ellipse cx={node.x} cy={node.y} rx="100" ry="54" fill="#050510" opacity="0.055" filter="url(#constellation-glow)" />
                    <ellipse cx={node.x} cy={node.y} rx="78" ry="42" fill="#050510" stroke="#F06B04" strokeWidth={active ? 6 : 3} />
                    <text x={node.x} y={node.y + 12} textAnchor="middle" className="fill-wheat font-sans text-[36px] font-black">
                      forever
                    </text>
                  </>
                ) : node.kind === "category" ? (
                  <>
                    <circle cx={node.x} cy={node.y} r={node.radius + 22} fill={node.color} opacity="0.1" />
                    <circle cx={node.x} cy={node.y} r={active ? node.radius + 8 : node.radius} fill="#F5ECD2" stroke={node.color} strokeWidth={active ? 7 : 4} />
                    <circle cx={node.x} cy={node.y} r="8" fill="#050510" />
                    <text x={labelX} y={labelY} textAnchor={textAnchor} className="fill-ink font-mono text-[14px] font-black uppercase tracking-[0.08em]">
                      {lines.map((line, index) => (
                        <tspan key={line} x={labelX} dy={index === 0 ? 0 : 18}>
                          {line}
                        </tspan>
                      ))}
                    </text>
                  </>
                ) : node.kind === "phrase" ? (
                  <>
                    <circle cx={node.x} cy={node.y} r={node.radius + 18} fill={node.color} opacity="0.08" />
                    <rect
                      x={node.x - Math.max(72, Math.max(...lines.map((line) => line.length)) * 5 + 22)}
                      y={node.y - 18}
                      width={Math.max(144, Math.max(...lines.map((line) => line.length)) * 10 + 44)}
                      height={Math.max(42, lines.length * 18 + 18)}
                      fill="#050510"
                      stroke={node.color}
                      strokeWidth={active ? 4.5 : 2.6}
                    />
                    <text x={node.x} y={node.y - 1} textAnchor="middle" className="fill-wheat font-mono text-[12.5px] font-black uppercase tracking-[0.06em]">
                      {lines.map((line, index) => (
                        <tspan key={line} x={node.x} dy={index === 0 ? 0 : 17}>
                          {line}
                        </tspan>
                      ))}
                    </text>
                  </>
                ) : node.kind === "snippet" ? (
                  <>
                    <line x1={node.x - 20} x2={node.x + 20} y1={node.y} y2={node.y} stroke={node.color} strokeWidth={active ? 5 : 2.4} strokeLinecap="round" />
                    <circle cx={node.x} cy={node.y} r={active ? 6 : 3.8} fill="#050510" />
                    <text x={labelX} y={labelY} textAnchor={textAnchor} className="fill-ink/64 font-mono text-[11.5px] font-black uppercase tracking-[0.08em]">
                      {node.label}
                    </text>
                  </>
                ) : (
                  <>
                    <circle cx={node.x} cy={node.y} r={node.radius + 9} fill="none" stroke={node.color} strokeWidth="1.8" strokeOpacity="0.36" />
                    <circle cx={node.x} cy={node.y} r={active ? node.radius + 4 : node.radius} fill={node.color} stroke="#050510" strokeWidth={active ? 3.5 : 1.8} />
                    <text x={labelX} y={labelY} textAnchor={textAnchor} className="fill-ink/74 font-mono text-[13px] font-black uppercase tracking-[0.08em]">
                      {node.label}
                    </text>
                  </>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
