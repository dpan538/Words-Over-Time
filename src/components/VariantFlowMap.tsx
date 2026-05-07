"use client";

import { useState } from "react";
import type {
  ForeverEraId,
  GeneratedFlowLink,
} from "@/types/foreverRealData";

type VariantFlowMapProps = {
  flows: GeneratedFlowLink[];
  selectedEra: ForeverEraId;
  activeInspectorId?: string;
  onHover: (inspectorId: string | null) => void;
  onInspect: (inspectorId: string) => void;
};

const sourceLayout: Record<string, { x: number; y: number; label: string }> = {
  forever: { x: 120, y: 110, label: "forever" },
  "for-ever": { x: 120, y: 190, label: "for ever" },
  forevermore: { x: 120, y: 270, label: "forevermore" },
  "forever-and-ever": { x: 120, y: 350, label: "forever and ever" },
};

const target = { x: 850, y: 230, label: "FOREVER-family" };

function flowPath(source: { x: number; y: number }) {
  return `M ${source.x} ${source.y} C 360 ${source.y}, 530 ${target.y}, ${target.x} ${target.y}`;
}

export function VariantFlowMap({
  flows,
  selectedEra,
  activeInspectorId,
  onHover,
  onInspect,
}: VariantFlowMapProps) {
  const [tooltip, setTooltip] = useState<string | null>(null);
  const visibleFlows = flows.filter((flow) => flow.eraId === selectedEra);
  const maxValue = Math.max(...visibleFlows.map((flow) => flow.value), 0.001);

  return (
    <div className="relative border border-ink bg-ink p-3 text-wheat sm:p-5">
      {tooltip ? (
        <div className="pointer-events-none absolute right-5 top-5 z-10 max-w-xs border border-wheat bg-ink px-3 py-2 font-mono text-[0.64rem] font-black uppercase leading-4 tracking-[0.12em] shadow-[4px_4px_0_#F06B04]">
          {tooltip}
        </div>
      ) : null}
      <svg
        viewBox="0 0 1000 450"
        className="h-auto w-full"
        role="img"
        aria-label="Semi-data-driven flow map from Google Ngram form frequencies into forever family"
      >
        <rect width="1000" height="450" fill="#050510" />
        <g opacity="0.18">
          {[90, 170, 250, 330].map((y) => (
            <line key={y} x1="64" x2="920" y1={y} y2={y} stroke="#F5ECD2" strokeWidth="1" />
          ))}
        </g>

        {visibleFlows.map((flow) => {
          const source = sourceLayout[flow.source];
          if (!source) return null;
          const active = activeInspectorId === flow.inspectorId;
          const strokeWidth = 5 + (flow.value / maxValue) * 42;

          return (
            <path
              key={flow.id}
              d={flowPath(source)}
              fill="none"
              stroke={flow.color}
              strokeLinecap="round"
              strokeWidth={active ? strokeWidth + 8 : strokeWidth}
              opacity={activeInspectorId && !active ? 0.18 : 0.48}
              className="cursor-crosshair transition duration-200 hover:opacity-80"
              onMouseEnter={() => {
                onHover(flow.inspectorId);
                setTooltip(`${source.label} -> FOREVER-family / mean ${flow.value} per million`);
              }}
              onMouseLeave={() => {
                onHover(null);
                setTooltip(null);
              }}
              onClick={() => onInspect(flow.inspectorId)}
            >
              <title>{source.label} flow: click to inspect grouping logic</title>
            </path>
          );
        })}

        {Object.entries(sourceLayout).map(([id, source]) => {
          const flow = visibleFlows.find((item) => item.source === id);
          return (
            <g key={id}>
              <circle
                cx={source.x}
                cy={source.y}
                r="17"
                fill={flow?.color ?? "#F5ECD2"}
                stroke="#F5ECD2"
                strokeWidth="2"
              />
              <text x={source.x + 34} y={source.y + 8} className="fill-wheat text-[28px] font-black">
                {source.label}
              </text>
              <text
                x={source.x + 34}
                y={source.y + 31}
                className="fill-sun font-mono text-[13px] font-black uppercase tracking-[0.16em]"
              >
                mean {flow?.value ?? 0} per million
              </text>
            </g>
          );
        })}

        <g>
          <circle cx={target.x} cy={target.y} r="42" fill="#F06B04" stroke="#F5ECD2" strokeWidth="3" />
          <text x={target.x} y={target.y + 78} textAnchor="middle" className="fill-wheat text-[36px] font-black">
            {target.label}
          </text>
          <text
            x={target.x}
            y={target.y + 106}
            textAnchor="middle"
            className="fill-sun font-mono text-[13px] font-black uppercase tracking-[0.16em]"
          >
            grouping label / not a single corpus token
          </text>
        </g>
      </svg>
      <div className="mt-4 grid gap-3 font-mono text-[0.66rem] font-black uppercase leading-5 tracking-[0.14em] text-wheat/62 sm:grid-cols-4">
        <p>source: Google Books Ngram</p>
        <p>value: mean era frequency</p>
        <p>width: per-million average</p>
        <p>caveat: aggregation, not transition</p>
      </div>
      <p className="mt-4 max-w-3xl text-sm font-bold leading-6 text-wheat/64">
        Ribbon width uses mean Ngram frequency in the selected era. This shows
        contribution to an editorial family grouping, not direct historical
        transformation.
      </p>
    </div>
  );
}
