"use client";

import { useMemo, useState } from "react";
import { DataLegend } from "@/components/DataLegend";
import type {
  ForeverEraId,
  GeneratedNetworkEdge,
  GeneratedNetworkNode,
} from "@/types/foreverRealData";

type PhraseCollocateNetworkProps = {
  nodes: GeneratedNetworkNode[];
  edges: GeneratedNetworkEdge[];
  selectedEra: ForeverEraId;
  activeInspectorId?: string;
  onHover: (inspectorId: string | null) => void;
  onInspect: (inspectorId: string) => void;
};

const groupLabels = {
  word: "word",
  variant: "variants",
  phrase: "phrases",
  collocate: "collocates",
  contextual_category: "contextual categories",
};

const drawPriority = {
  contextual_category: 1,
  collocate: 2,
  variant: 3,
  phrase: 4,
  word: 5,
};

function curvedPath(source: GeneratedNetworkNode, target: GeneratedNetworkNode) {
  const midX = (source.x + target.x) / 2;
  const midY = (source.y + target.y) / 2;
  const dx = target.x - source.x;
  const dy = target.y - source.y;
  return `M ${source.x} ${source.y} Q ${midX - dy * 0.08} ${midY + dx * 0.08 - 28} ${target.x} ${target.y}`;
}

export function PhraseCollocateNetwork({
  nodes,
  edges,
  selectedEra,
  activeInspectorId,
  onHover,
  onInspect,
}: PhraseCollocateNetworkProps) {
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<string | null>(null);
  const visibleNodes = nodes
    .filter((node) => node.eraId === "all" || node.eraId === selectedEra)
    .sort((a, b) => drawPriority[a.group] - drawPriority[b.group]);
  const nodeIds = new Set(visibleNodes.map((node) => node.id));
  const visibleEdges = edges.filter(
    (edge) =>
      (edge.eraId === "all" || edge.eraId === selectedEra) &&
      nodeIds.has(edge.source) &&
      nodeIds.has(edge.target),
  );
  const nodesById = useMemo(() => new Map(visibleNodes.map((node) => [node.id, node])), [visibleNodes]);
  const connectedEdgeIds = useMemo(
    () =>
      new Set(
        visibleEdges
          .filter((edge) => edge.source === activeNode || edge.target === activeNode)
          .map((edge) => edge.id),
      ),
    [activeNode, visibleEdges],
  );
  const connectedNodeIds = useMemo(() => {
    if (!activeNode) return new Set<string>();
    const ids = new Set([activeNode]);
    visibleEdges.forEach((edge) => {
      if (edge.source === activeNode) ids.add(edge.target);
      if (edge.target === activeNode) ids.add(edge.source);
    });
    return ids;
  }, [activeNode, visibleEdges]);
  const legendItems = Object.entries(groupLabels).map(([group, label]) => {
    const node = visibleNodes.find((item) => item.group === group);
    return { label, color: node?.color ?? "#050510" };
  });

  return (
    <div className="relative border border-ink bg-wheat p-3 sm:p-5">
      {tooltip ? (
        <div className="pointer-events-none absolute right-5 top-5 z-10 max-w-xs border border-ink bg-wheat px-3 py-2 font-mono text-[0.64rem] font-black uppercase leading-4 tracking-[0.12em] shadow-[4px_4px_0_#050510]">
          {tooltip}
        </div>
      ) : null}
      <svg
        viewBox="0 0 1000 650"
        className="h-auto w-full"
        role="img"
        aria-label="Fixed node-link network for real Project Gutenberg phrase and collocate evidence"
        onMouseLeave={() => {
          setActiveNode(null);
          setTooltip(null);
        }}
      >
        <rect width="1000" height="650" fill="#F5ECD2" />
        <g opacity="0.16">
          <circle cx="500" cy="310" r="190" fill="none" stroke="#050510" strokeWidth="1" />
          <circle cx="500" cy="310" r="285" fill="none" stroke="#050510" strokeDasharray="4 13" />
          <line x1="110" x2="890" y1="310" y2="310" stroke="#050510" strokeWidth="1" />
          <line x1="500" x2="500" y1="70" y2="590" stroke="#050510" strokeWidth="1" />
        </g>

        {visibleEdges.map((edge) => {
          const source = nodesById.get(edge.source);
          const target = nodesById.get(edge.target);
          if (!source || !target) return null;
          const activeByHover = !activeNode || connectedEdgeIds.has(edge.id);
          const activeByInspector = activeInspectorId === edge.inspectorId;

          return (
            <path
              key={edge.id}
              d={curvedPath(source, target)}
              fill="none"
              stroke={edge.color}
              strokeWidth={activeByInspector ? 6 : 1 + edge.weight * 4}
              opacity={activeByHover ? 0.72 : 0.1}
              className="cursor-crosshair transition duration-200"
              onMouseEnter={() => {
                onHover(edge.inspectorId);
                setTooltip(edge.relation);
              }}
              onClick={() => onInspect(edge.inspectorId)}
            >
              <title>{edge.relation}: click to inspect edge evidence</title>
            </path>
          );
        })}

        {visibleNodes.map((node) => {
          const activeByHover = !activeNode || connectedNodeIds.has(node.id);
          const activeByInspector = activeInspectorId === node.inspectorId;
          const textAnchor = node.x < 430 ? "end" : node.x > 570 ? "start" : "middle";
          const labelX =
            textAnchor === "end"
              ? node.x - node.radius - 10
              : textAnchor === "start"
                ? node.x + node.radius + 10
                : node.x;
          const labelY = node.group === "word" ? node.y + 62 : node.y + 5;

          return (
            <g
              key={node.id}
              onMouseEnter={() => {
                setActiveNode(node.id);
                onHover(node.inspectorId);
                setTooltip(`${node.label} / ${groupLabels[node.group]}`);
              }}
              onClick={() => onInspect(node.inspectorId)}
              className="cursor-crosshair transition duration-200"
              opacity={activeByHover ? 1 : 0.25}
            >
              <circle
                cx={node.x}
                cy={node.y}
                r={activeByInspector ? node.radius + 7 : node.radius}
                fill={node.color}
                stroke="#050510"
                strokeWidth={node.group === "word" || node.group === "phrase" ? 4 : 2}
                className="transition duration-200"
              />
              <circle cx={node.x} cy={node.y} r={node.radius + 8} fill="none" stroke={node.color} strokeWidth="1" opacity="0.42" />
              <text
                x={labelX}
                y={labelY}
                textAnchor={textAnchor}
                className={`font-sans font-black ${
                  node.group === "word"
                    ? "fill-ink text-[46px]"
                    : node.group === "phrase"
                      ? "fill-ink text-[24px]"
                      : "fill-ink text-[17px]"
                }`}
              >
                {node.label}
              </text>
              <text
                x={labelX}
                y={labelY + (node.group === "word" ? 30 : 22)}
                textAnchor={textAnchor}
                className="fill-fire font-mono text-[12px] font-black uppercase tracking-[0.16em]"
              >
                {groupLabels[node.group]}
                {node.count ? ` / ${node.count}` : ""}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_22rem]">
        <p className="text-sm font-bold leading-6 text-ink/66">
          Fixed positions keep the network readable. Phrases and collocates are
          extracted from the Project Gutenberg seed, then filtered by the era
          switcher.
        </p>
        <DataLegend items={legendItems} />
      </div>
    </div>
  );
}
