"use client";

import { useState } from "react";
import type {
  ForeverEra,
  ForeverEraId,
  GeneratedFrequencySeries,
} from "@/types/foreverRealData";

type PointerPosition = { x: number; y: number };

type FrequencyTimelineProps = {
  series: GeneratedFrequencySeries[];
  eras: ForeverEra[];
  selectedEra: ForeverEraId;
  activeInspectorId?: string;
  onHover: (inspectorId: string | null, position?: PointerPosition) => void;
  onInspect: (inspectorId: string, position?: PointerPosition) => void;
};

const width = 1880;
const height = 760;
const padX = 90;
const padTop = 74;
const padBottom = 118;

function pointsToPath(points: Array<{ x: number; y: number }>) {
  return points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
}

function filterPoints(series: GeneratedFrequencySeries, era?: ForeverEra) {
  if (!era || era.id === "all" || era.startYear === null || era.endYear === null) return series.points;
  return series.points.filter((point) => point.year >= era.startYear! && point.year <= era.endYear!);
}

export function FrequencyTimeline({
  series,
  eras,
  selectedEra,
  activeInspectorId,
  onHover,
  onInspect,
}: FrequencyTimelineProps) {
  const [localActiveId, setLocalActiveId] = useState<string | null>(null);
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
    <div className="group relative overflow-hidden bg-wheat py-2 transition duration-300 hover:bg-[#f8f0da] sm:py-4">
      <div className="relative overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-auto min-w-[1320px] w-full"
          role="img"
          aria-label="Real Google Ngram frequency timeline for forever variants"
          onMouseLeave={() => {
            setLocalActiveId(null);
            onHover(null);
          }}
        >
          <rect width={width} height={height} fill="#F5ECD2" />
          <defs>
            <pattern id="freq-field-grid" width="42" height="42" patternUnits="userSpaceOnUse">
              <path d="M 42 0 L 0 0 0 42" fill="none" stroke="#050510" strokeOpacity="0.035" strokeWidth="1" />
            </pattern>
            <pattern id="freq-early-noise" width="17" height="17" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" x2="0" y1="0" y2="17" stroke="#050510" strokeOpacity="0.16" strokeWidth="2" />
            </pattern>
          </defs>
          <rect width={width} height={height} fill="url(#freq-field-grid)" />
          {minYear < 1700 ? (
            <>
              <rect x={padX} y={padTop} width={Math.max(0, x(1700) - padX)} height={height - padTop - padBottom + 10} fill="url(#freq-early-noise)" />
              <line x1={x(1700)} x2={x(1700)} y1={padTop - 10} y2={height - padBottom + 16} stroke="#050510" strokeOpacity="0.28" strokeWidth="2" />
              <text x={x(1600)} y={padTop + 28} textAnchor="middle" className="fill-ink/50 font-mono text-[14px] font-black uppercase tracking-[0.12em]">
                noisy early trace
              </text>
            </>
          ) : null}
          <text
            x={padX}
            y="34"
            className="fill-fire font-mono text-[18px] font-black uppercase tracking-[0.2em]"
          >
            google books ngram / yearly frequency field
          </text>
          <text
            x={width - padX}
            y="34"
            textAnchor="end"
            className="fill-ink/60 font-mono text-[15px] font-black uppercase tracking-[0.14em]"
          >
            coverage {minYear}-{maxYear}
          </text>
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
          {minYear < 1700 && maxYear > 1700 ? (
            <text x={x(1700) + 10} y={height - 92} className="fill-ink/56 font-mono text-[14px] font-black uppercase tracking-[0.12em]">
              public emphasis begins 1700
            </text>
          ) : null}
          <g transform={`translate(${padX} ${height - 64})`}>
            {visibleSeries.map((item, index) => {
              const active = activeInspectorId === item.inspectorId || localActiveId === item.inspectorId;
              return (
                <g
                  key={item.id}
                  transform={`translate(${index * 218} 0)`}
                  opacity={localActiveId && !active ? 0.34 : 1}
                  className="cursor-crosshair"
                  onMouseEnter={(event) => {
                    setLocalActiveId(item.inspectorId);
                    onHover(item.inspectorId, { x: event.clientX, y: event.clientY });
                  }}
                  onMouseMove={(event) =>
                    onHover(item.inspectorId, { x: event.clientX, y: event.clientY })
                  }
                  onClick={(event) => {
                    event.stopPropagation();
                    onInspect(item.inspectorId, { x: event.clientX, y: event.clientY });
                  }}
                >
                  <line x1="0" x2="34" y1="0" y2="0" stroke={item.color} strokeWidth={active ? 7 : 4} strokeLinecap="round" />
                  <text
                    x="44"
                    y="5"
                    className="fill-ink font-mono text-[16px] font-black uppercase tracking-[0.1em]"
                  >
                    {item.label}
                  </text>
                </g>
              );
            })}
          </g>

          {visibleSeries.map((item, index) => {
            const path = pointsToPath(
              item.points.map((point) => ({
                x: x(point.year),
                y: y(point.frequencyPerMillion),
              })),
            );
            const active = activeInspectorId === item.inspectorId || localActiveId === item.inspectorId;
            const focusActive = Boolean(activeInspectorId || localActiveId);

            return (
              <g key={item.id}>
                <path
                  d={path}
                  fill="none"
                  stroke="#050510"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={active ? 16 : 8}
                  opacity={active ? 0.08 : 0}
                />
                <path
                  d={path}
                  fill="none"
                  stroke={item.color}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={active ? 9 : index === 0 ? 5.2 : 4.2}
                  opacity={focusActive && !active ? 0.12 : active ? 0.98 : 0.74}
                  className="cursor-crosshair transition duration-200 hover:opacity-100"
                  onMouseEnter={(event) => {
                    setLocalActiveId(item.inspectorId);
                    onHover(item.inspectorId, { x: event.clientX, y: event.clientY });
                  }}
                  onMouseMove={(event) =>
                    onHover(item.inspectorId, { x: event.clientX, y: event.clientY })
                  }
                  onMouseLeave={() => {
                    onHover(null);
                  }}
                  onClick={(event) => {
                    event.stopPropagation();
                    onInspect(item.inspectorId, { x: event.clientX, y: event.clientY });
                  }}
                />
              </g>
            );
          })}
        </svg>
      </div>
      <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[0.74rem] font-black uppercase leading-5 tracking-[0.12em] text-ink/54">
        <p>ngram {minYear}-{maxYear}</p>
        <p>1700+ emphasized</p>
        <p>frequency per million</p>
        <p>sqrt display scale</p>
        <p>frequency, not first attestation</p>
      </div>
    </div>
  );
}
