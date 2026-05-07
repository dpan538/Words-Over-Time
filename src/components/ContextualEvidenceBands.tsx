"use client";

import { useState } from "react";
import { DataLegend } from "@/components/DataLegend";
import type {
  ForeverEra,
  ForeverEraId,
  GeneratedCategory,
} from "@/types/foreverRealData";

type ContextualEvidenceBandsProps = {
  categories: GeneratedCategory[];
  eras: ForeverEra[];
  selectedEra: ForeverEraId;
  activeInspectorId?: string;
  onHover: (inspectorId: string | null) => void;
  onInspect: (inspectorId: string) => void;
};

const width = 1120;
const height = 470;
const padX = 72;
const bandTop = 92;
const bandHeight = 250;

function areaPath(points: Array<{ x: number; y0: number; y1: number }>) {
  if (points.length === 1) {
    const point = points[0];
    return `M ${padX} ${point.y0} L ${width - padX} ${point.y0} L ${
      width - padX
    } ${point.y1} L ${padX} ${point.y1} Z`;
  }

  const upper = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y1}`);
  const lower = points.slice().reverse().map((point) => `L ${point.x} ${point.y0}`);
  return `${upper.join(" ")} ${lower.join(" ")} Z`;
}

function totalScore(category: GeneratedCategory) {
  return category.eraScores.reduce((sum, score) => sum + score.score, 0);
}

export function ContextualEvidenceBands({
  categories,
  eras,
  selectedEra,
  activeInspectorId,
  onHover,
  onInspect,
}: ContextualEvidenceBandsProps) {
  const [tooltip, setTooltip] = useState<string | null>(null);
  const activeCategories = categories.filter(
    (category) => category.id !== "digital_permanence" && totalScore(category) > 0,
  );
  const futureCategories = categories.filter(
    (category) => category.id === "digital_permanence" || totalScore(category) === 0,
  );
  const displayEras =
    selectedEra === "all"
      ? eras.filter((era) => era.id !== "all" && era.id !== "recent")
      : eras.filter((era) => era.id === selectedEra);
  const xForIndex = (index: number) =>
    displayEras.length === 1
      ? width / 2
      : padX + (index / (displayEras.length - 1)) * (width - padX * 2);

  const totalsByEra = displayEras.map((era) =>
    Math.max(
      1,
      activeCategories.reduce(
        (sum, category) =>
          sum + (category.eraScores.find((score) => score.eraId === era.id)?.score ?? 0),
        0,
      ),
    ),
  );

  const cumulativeByEra = displayEras.map(() => 0);
  const areas = activeCategories.map((category) => {
    const points = displayEras.map((era, index) => {
      const score = category.eraScores.find((item) => item.eraId === era.id);
      const share = (score?.score ?? 0) / totalsByEra[index];
      const y0 = bandTop + cumulativeByEra[index] * bandHeight;
      const y1 = y0 + share * bandHeight;
      cumulativeByEra[index] += share;
      return { x: xForIndex(index), y0, y1, score, era };
    });
    return { category, points };
  });

  return (
    <div className="relative border border-ink bg-[#f5ecd2] p-3 sm:p-5">
      {tooltip ? (
        <div className="pointer-events-none absolute right-5 top-5 z-10 max-w-xs border border-ink bg-wheat px-3 py-2 font-mono text-[0.64rem] font-black uppercase leading-4 tracking-[0.12em] shadow-[4px_4px_0_#050510]">
          {tooltip}
        </div>
      ) : null}
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full"
        role="img"
        aria-label="Curated contextual evidence bands for forever"
      >
        <rect width={width} height={height} fill="#F5ECD2" />
        <g opacity="0.2">
          {displayEras.map((era, index) => (
            <line key={era.id} x1={xForIndex(index)} x2={xForIndex(index)} y1="62" y2="372" stroke="#050510" />
          ))}
          <line x1={padX} x2={width - padX} y1="220" y2="220" stroke="#050510" />
        </g>

        {areas.map(({ category, points }) => {
          const score = points[0]?.score;
          const inspectorId =
            selectedEra === "all"
              ? category.eraScores.find((item) => item.eraId === "all")?.inspectorId
              : score?.inspectorId;
          const active = activeInspectorId === inspectorId;

          return (
            <path
              key={category.id}
              d={areaPath(points)}
              fill={category.color}
              opacity={activeInspectorId && !active ? 0.22 : 0.74}
              stroke="#050510"
              strokeWidth={active ? 3 : 1}
              className="cursor-crosshair transition duration-200 hover:opacity-95"
              onMouseEnter={() => {
                if (inspectorId) onHover(inspectorId);
                setTooltip(`${category.label} / evidence-weighted heuristic`);
              }}
              onMouseLeave={() => {
                onHover(null);
                setTooltip(null);
              }}
              onClick={() => inspectorId && onInspect(inspectorId)}
            >
              <title>{category.label}: click to inspect supporting phrases, collocates, and snippets</title>
            </path>
          );
        })}

        {displayEras.map((era, index) => (
          <g key={era.id}>
            <circle cx={xForIndex(index)} cy="220" r="5" fill="#050510" />
            <text x={xForIndex(index)} y="414" textAnchor="middle" className="fill-ink font-mono text-[24px] font-black">
              {era.label}
            </text>
          </g>
        ))}
        <text x="72" y="46" className="fill-fire font-mono text-[18px] font-black uppercase tracking-[0.18em]">
          contextual evidence bands / curated signals, not sense detection
        </text>
      </svg>
      <p className="mb-4 max-w-3xl text-sm font-bold leading-6 text-ink/66">
        These bands summarize phrase, collocate, and snippet evidence. They are
        curated contextual signals, not automatic sense classification.
      </p>
      <DataLegend items={activeCategories.map((category) => ({ label: category.label, color: category.color }))} />
      {futureCategories.length ? (
        <p className="mt-4 border-t border-ink/18 pt-4 font-mono text-[0.64rem] font-black uppercase leading-5 tracking-[0.14em] text-ink/50">
          future / no current evidence: {futureCategories.map((category) => category.label).join(" / ")}
        </p>
      ) : null}
    </div>
  );
}
