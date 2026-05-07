"use client";

import { useState } from "react";
import type {
  ForeverEra,
  ForeverEraId,
  GeneratedFrequencySeries,
} from "@/types/foreverRealData";

type FrequencyTimelineProps = {
  series: GeneratedFrequencySeries[];
  eras: ForeverEra[];
  selectedEra: ForeverEraId;
  activeInspectorId?: string;
  onHover: (inspectorId: string | null) => void;
  onInspect: (inspectorId: string) => void;
};

const width = 1200;
const height = 430;
const padX = 58;
const padTop = 42;
const padBottom = 62;

function pointsToPath(points: Array<{ x: number; y: number }>) {
  return points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
}

function filterPoints(series: GeneratedFrequencySeries, era?: ForeverEra) {
  if (!era || era.id === "all" || era.startYear === null || era.endYear === null) return series.points;
  return series.points.filter((point) => point.year >= era.startYear! && point.year <= era.endYear!);
}

function seriesKind(query: string) {
  if (query === "for ever") return "spaced form";
  if (query.includes(" ")) return "phrase series";
  return "single-word form";
}

export function FrequencyTimeline({
  series,
  eras,
  selectedEra,
  activeInspectorId,
  onHover,
  onInspect,
}: FrequencyTimelineProps) {
  const [tooltip, setTooltip] = useState<string | null>(null);
  const era = eras.find((item) => item.id === selectedEra);
  const visibleSeries = series.map((item) => ({ ...item, points: filterPoints(item, era) }));
  const allPoints = visibleSeries.flatMap((item) => item.points);
  const years = allPoints.map((point) => point.year);
  const maxValue = Math.max(...allPoints.map((point) => Math.sqrt(point.frequencyPerMillion)), 1);
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);
  const x = (year: number) =>
    padX + ((year - minYear) / Math.max(1, maxYear - minYear)) * (width - padX * 2);
  const y = (value: number) =>
    padTop + (height - padTop - padBottom) - (Math.sqrt(value) / maxValue) * (height - padTop - padBottom);

  return (
    <div className="group relative border border-ink bg-wheat p-3 transition duration-300 hover:bg-[#f8f0da] sm:p-5">
      {tooltip ? (
        <div className="pointer-events-none absolute right-5 top-5 z-10 max-w-xs border border-ink bg-wheat px-3 py-2 font-mono text-[0.64rem] font-black uppercase leading-4 tracking-[0.12em] shadow-[4px_4px_0_#050510]">
          {tooltip}
        </div>
      ) : null}
      <div className="relative overflow-hidden border border-ink/18 bg-[#f5ecd2]">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-auto w-full"
          role="img"
          aria-label="Real Google Ngram frequency timeline for forever variants"
        >
          <rect width={width} height={height} fill="#F5ECD2" />
          {[0.2, 0.4, 0.6, 0.8].map((line) => (
            <line
              key={line}
              x1={padX}
              x2={width - padX}
              y1={padTop + (height - padTop - padBottom) * line}
              y2={padTop + (height - padTop - padBottom) * line}
              stroke="#050510"
              strokeDasharray="2 10"
              strokeWidth="1"
              opacity="0.18"
            />
          ))}
          {[minYear, Math.round((minYear + maxYear) / 2), maxYear].map((year) => (
            <g key={year}>
              <line
                x1={x(year)}
                x2={x(year)}
                y1={padTop}
                y2={height - padBottom + 10}
                stroke="#050510"
                strokeWidth="1"
                opacity="0.16"
              />
              <text
                x={x(year)}
                y={height - 24}
                textAnchor="middle"
                className="fill-ink font-mono text-[22px] font-black"
              >
                {year}
              </text>
            </g>
          ))}

          {visibleSeries.map((item, index) => {
            const path = pointsToPath(
              item.points.map((point) => ({
                x: x(point.year),
                y: y(point.frequencyPerMillion),
              })),
            );
            const active = activeInspectorId === item.inspectorId;

            return (
              <g key={item.id}>
                <path
                  d={path}
                  fill="none"
                  stroke={item.color}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={active ? 9 : 5}
                  opacity={activeInspectorId && !active ? 0.28 : 0.88}
                  className="cursor-crosshair transition duration-200 hover:opacity-100"
                  onMouseEnter={() => {
                    onHover(item.inspectorId);
                    setTooltip(`${item.label} / ${seriesKind(item.query)} / Google Ngram / ${minYear}-${maxYear}`);
                  }}
                  onMouseLeave={() => {
                    onHover(null);
                    setTooltip(null);
                  }}
                  onClick={() => onInspect(item.inspectorId)}
                >
                  <title>{item.label}: click to inspect source and frequency calculation</title>
                </path>
                <text
                  x={width - padX}
                  y={64 + index * 28}
                  textAnchor="end"
                  className="fill-ink font-mono text-[17px] font-black uppercase tracking-[0.12em]"
                >
                  {item.label} / {seriesKind(item.query)}
                </text>
                <rect
                  x={width - padX - 235}
                  y={52 + index * 28}
                  width="22"
                  height="8"
                  fill={item.color}
                />
              </g>
            );
          })}
        </svg>
      </div>
      <div className="mt-4 grid gap-3 font-mono text-[0.66rem] font-black uppercase leading-5 tracking-[0.14em] text-ink/58 sm:grid-cols-4">
        <p>source: Google Books Ngram</p>
        <p>coverage: {minYear}-{maxYear}</p>
        <p>metric: raw yearly fraction x 1m</p>
        <p>smoothing: 0 / y uses sqrt display scale</p>
      </div>
      <p className="mt-4 max-w-3xl text-sm font-bold leading-6 text-ink/62">
        Ngram frequency is not earliest attestation. Early years can be noisy,
        especially for lower-frequency phrases and scanned-book metadata.
      </p>
    </div>
  );
}
