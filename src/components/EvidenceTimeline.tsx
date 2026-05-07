"use client";

import { useState } from "react";
import type {
  ForeverEraId,
  GeneratedSnippet,
} from "@/types/foreverRealData";

type EvidenceTimelineProps = {
  snippets: GeneratedSnippet[];
  selectedEra: ForeverEraId;
  activeInspectorId?: string;
  onHover: (inspectorId: string | null) => void;
  onInspect: (inspectorId: string) => void;
};

const width = 1160;
const height = 430;
const padX = 86;
const evidenceStyles = {
  form_occurrence: {
    label: "form occurrence",
    color: "#2C9FC7",
    y: 132,
  },
  phrase_evidence: {
    label: "phrase evidence",
    color: "#F06B04",
    y: 206,
  },
  collocate_support: {
    label: "collocate support",
    color: "#FBB728",
    y: 280,
  },
  contextual_category_support: {
    label: "contextual category support",
    color: "#036C17",
    y: 354,
  },
} as const;

export function EvidenceTimeline({
  snippets,
  selectedEra,
  activeInspectorId,
  onHover,
  onInspect,
}: EvidenceTimelineProps) {
  const [tooltip, setTooltip] = useState<string | null>(null);
  const visibleSnippets = snippets
    .filter((snippet) => snippet.eraId === selectedEra)
    .sort((a, b) => a.year - b.year)
    .slice(0, selectedEra === "all" ? 12 : 6);
  const years = visibleSnippets.map((snippet) => snippet.year);
  const minYear = years.length ? Math.min(...years) : 0;
  const maxYear = years.length ? Math.max(...years) : 1;
  const xForYear = (year: number) =>
    padX + ((year - minYear) / Math.max(1, maxYear - minYear)) * (width - padX * 2);

  return (
    <div className="relative border border-ink bg-wheat p-3 sm:p-5">
      {tooltip ? (
        <div className="pointer-events-none absolute right-5 top-5 z-10 max-w-xs border border-ink bg-wheat px-3 py-2 font-mono text-[0.64rem] font-black uppercase leading-4 tracking-[0.12em] shadow-[4px_4px_0_#050510]">
          {tooltip}
        </div>
      ) : null}

      {visibleSnippets.length ? (
        <>
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="h-auto w-full"
            role="img"
            aria-label="Dated Project Gutenberg evidence spine for forever snippets"
          >
            <rect width={width} height={height} fill="#F5ECD2" />
            <line x1={padX} x2={width - padX} y1="72" y2="72" stroke="#050510" strokeWidth="2" />
            {[minYear, Math.round((minYear + maxYear) / 2), maxYear].map((year) => (
              <g key={year}>
                <line x1={xForYear(year)} x2={xForYear(year)} y1="56" y2="385" stroke="#050510" strokeDasharray="2 9" opacity="0.22" />
                <text x={xForYear(year)} y="42" textAnchor="middle" className="fill-ink font-mono text-[20px] font-black">
                  {year}
                </text>
              </g>
            ))}

            {Object.entries(evidenceStyles).map(([type, style]) => (
              <g key={type}>
                <line x1={padX} x2={width - padX} y1={style.y} y2={style.y} stroke="#050510" opacity="0.12" />
                <circle cx="44" cy={style.y} r="9" fill={style.color} stroke="#050510" strokeWidth="1.5" />
                <text x="62" y={style.y + 5} className="fill-ink font-mono text-[13px] font-black uppercase tracking-[0.16em]">
                  {style.label}
                </text>
              </g>
            ))}

            {visibleSnippets.map((snippet, index) => {
              const style = evidenceStyles[snippet.evidenceType];
              const x = xForYear(snippet.year);
              const y = style.y + ((index % 3) - 1) * 9;
              const active = activeInspectorId === snippet.inspectorId;

              return (
                <g
                  key={snippet.id}
                  className="cursor-crosshair transition duration-200"
                  opacity={activeInspectorId && !active ? 0.32 : 1}
                  onMouseEnter={() => {
                    onHover(snippet.inspectorId);
                    setTooltip(`${snippet.year} / ${snippet.phrase} / ${snippet.title}`);
                  }}
                  onMouseLeave={() => {
                    onHover(null);
                    setTooltip(null);
                  }}
                  onClick={() => onInspect(snippet.inspectorId)}
                >
                  <line x1={x} x2={x} y1="72" y2={y} stroke="#050510" strokeWidth="1" opacity="0.28" />
                  <circle
                    cx={x}
                    cy={y}
                    r={active ? 17 : 12}
                    fill={style.color}
                    stroke="#050510"
                    strokeWidth="2"
                    className="transition duration-200"
                  />
                  <text
                    x={x}
                    y={y + (index % 2 === 0 ? -24 : 35)}
                    textAnchor="middle"
                    className="fill-ink font-mono text-[12px] font-black uppercase tracking-[0.1em]"
                  >
                    {snippet.year}
                  </text>
                  <text
                    x={x}
                    y={y + (index % 2 === 0 ? -42 : 53)}
                    textAnchor="middle"
                    className="fill-fire font-mono text-[12px] font-black uppercase tracking-[0.1em]"
                  >
                    {snippet.phrase.length > 18 ? `${snippet.phrase.slice(0, 17)}...` : snippet.phrase}
                  </text>
                  <title>{snippet.title}: click to inspect snippet provenance</title>
                </g>
              );
            })}
          </svg>

          <div className="mt-4 grid gap-3 font-mono text-[0.66rem] font-black uppercase leading-5 tracking-[0.14em] text-ink/58 sm:grid-cols-4">
            <p>source: Project Gutenberg</p>
            <p>node x: publication year</p>
            <p>node lane: evidence type</p>
            <p>click: quote and provenance</p>
          </div>
        </>
      ) : (
        <div className="border border-dashed border-ink/35 p-8">
          <h3 className="text-4xl font-black leading-none">no public evidence nodes</h3>
          <p className="mt-4 max-w-2xl text-sm font-bold leading-6 text-ink/66">
            This selected era has Ngram coverage, but the current Project
            Gutenberg seed does not provide display snippets for it. A separate
            contemporary public corpus is not implemented in this round.
          </p>
        </div>
      )}
    </div>
  );
}
