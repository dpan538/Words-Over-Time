"use client";

import { useMemo, useState } from "react";
import type {
  ForeverEraId,
  GeneratedFrequencySeries,
  GeneratedPrehistory,
} from "@/types/foreverRealData";
import { getSelectionMatch } from "@/lib/visualSelection";
import type { SelectedItem, SelectedLayer } from "@/types/visualSelection";

type PointerPosition = { x: number; y: number };

type VariantDriftFieldProps = {
  frequency: GeneratedFrequencySeries[];
  prehistory?: GeneratedPrehistory | null;
  selectedEra: ForeverEraId;
  selectedItem?: SelectedItem | null;
  selectedLayer?: SelectedLayer;
  activeInspectorId?: string;
  onHover: (inspectorId: string | null, position?: PointerPosition) => void;
  onInspect: (inspectorId: string, position?: PointerPosition) => void;
};

type PressureAnchor = {
  id: string;
  label: string;
  period: string;
  year: number;
  x: number;
  y: number;
  color: string;
  radius: number;
};

const width = 1900;
const height = 920;
const left = 106;
const right = 106;
const top = 94;
const plotTop = 148;
const plotBottom = 690;

const pressureAnchors: PressureAnchor[] = [
  { id: "pressure-attestation", label: "Spaced form prehistory", period: "late 14c.-1611", year: 1375, x: 210, y: 214, color: "#1570AC", radius: 34 },
  { id: "pressure-devotional-print", label: "Devotional print formulae", period: "1600s-1700s", year: 1650, x: 482, y: 150, color: "#2C9FC7", radius: 44 },
  { id: "pressure-literary-vow", label: "Literary permanence", period: "1800-1899", year: 1860, x: 888, y: 170, color: "#A1081F", radius: 58 },
  { id: "pressure-memory-loss", label: "Memory and loss", period: "1850-1930", year: 1900, x: 1036, y: 608, color: "#036C17", radius: 50 },
  { id: "pressure-media-culture", label: "Media and pop title culture", period: "1950-2022", year: 1988, x: 1458, y: 196, color: "#FBB728", radius: 62 },
  { id: "pressure-modern-snapshot", label: "Modern open-news context", period: "2024-2026", year: 2025, x: 1668, y: 610, color: "#2C9FC7", radius: 48 },
];

const pressureCategoryIds: Record<string, string[]> = {
  "pressure-attestation": [],
  "pressure-devotional-print": ["eternity_religion"],
  "pressure-literary-vow": ["romance_vow", "permanence_duration"],
  "pressure-memory-loss": ["remembrance"],
  "pressure-media-culture": ["hyperbole_colloquial", "permanence_duration"],
  "pressure-modern-snapshot": ["digital_permanence", "hyperbole_colloquial"],
};

function xScale(year: number) {
  return left + ((year - 1500) / (2022 - 1500)) * (width - left - right);
}

function pathFrom(points: Array<{ year: number; value: number }>) {
  return points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${xScale(point.year).toFixed(1)} ${point.value.toFixed(1)}`)
    .join(" ");
}

function wrapWords(label: string, maxChars = 17) {
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

export function VariantDriftField({
  frequency,
  prehistory,
  selectedEra,
  selectedItem,
  selectedLayer,
  activeInspectorId,
  onHover,
  onInspect,
}: VariantDriftFieldProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const activeId = activeInspectorId ?? hoveredId;
  const focused = Boolean(activeId);
  const forever = frequency.find((series) => series.query === "forever") ?? frequency[0];
  const forEver = frequency.find((series) => series.query === "for ever");

  const curveData = useMemo(() => {
    const points = forever.points.filter((point) => point.year >= 1500 && point.year <= 2022);
    const max = Math.max(...points.map((point) => Math.sqrt(point.frequencyPerMillion)), 1);
    return points
      .filter((point) => point.year % 2 === 0)
      .map((point) => ({
        year: point.year,
        value: plotBottom - (Math.sqrt(point.frequencyPerMillion) / max) * (plotBottom - plotTop),
        raw: point.frequencyPerMillion,
      }));
  }, [forever]);

  const spacedCurveData = useMemo(() => {
    if (!forEver) return [];
    const points = forEver.points.filter((point) => point.year >= 1500 && point.year <= 2022);
    const max = Math.max(...points.map((point) => Math.sqrt(point.frequencyPerMillion)), 1);
    return points
      .filter((point) => point.year % 4 === 0)
      .map((point) => ({
        year: point.year,
        value: plotBottom - (Math.sqrt(point.frequencyPerMillion) / max) * (plotBottom - plotTop),
        raw: point.frequencyPerMillion,
      }));
  }, [forEver]);

  const yAtYear = (year: number) => {
    const nearest = curveData.reduce((best, point) =>
      Math.abs(point.year - year) < Math.abs(best.year - year) ? point : best,
    curveData[0]);
    return nearest?.value ?? plotBottom;
  };

  return (
    <div className="relative overflow-hidden bg-wheat py-2">
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-auto min-w-[1360px] w-full"
          role="img"
          aria-label="Historical influence field for forever"
          onMouseLeave={() => {
            setHoveredId(null);
            onHover(null);
          }}
        >
          <defs>
            <pattern id="pressure-paper" width="38" height="38" patternUnits="userSpaceOnUse">
              <path d="M 38 0 L 0 0 0 38" fill="none" stroke="#050510" strokeOpacity="0.035" />
            </pattern>
            <pattern id="pressure-noise" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" x2="0" y1="0" y2="16" stroke="#050510" strokeOpacity="0.18" strokeWidth="2" />
            </pattern>
            <filter id="pressure-soft">
              <feGaussianBlur stdDeviation="10" />
            </filter>
          </defs>
          <rect width={width} height={height} fill="#F5ECD2" />
          <rect width={width} height={height} fill="url(#pressure-paper)" />
          <rect x={left} y="88" width={xScale(1700) - left} height="662" fill="url(#pressure-noise)" />
          <text x="76" y="52" className="fill-fire font-mono text-[18px] font-black uppercase tracking-[0.2em]">
            historical influence field
          </text>
          <text x={width - 76} y="52" textAnchor="end" className="fill-ink/58 font-mono text-[15px] font-black uppercase tracking-[0.14em]">
            pressure anchors + Ngram curve / {selectedLayer ?? selectedEra}
          </text>

          {[1500, 1600, 1700, 1800, 1900, 2000, 2022].map((year) => (
            <g key={year}>
              <line x1={xScale(year)} x2={xScale(year)} y1="96" y2="748" stroke="#050510" strokeOpacity={year === 1700 ? 0.26 : 0.1} />
              <text x={xScale(year)} y="800" textAnchor="middle" className="fill-ink/64 font-mono text-[15px] font-black uppercase tracking-[0.1em]">
                {year}
              </text>
            </g>
          ))}

          {pressureAnchors.map((anchor) => (
            <circle key={`${anchor.id}-halo`} cx={anchor.x} cy={anchor.y} r={anchor.radius * 2.6} fill={anchor.color} opacity="0.08" filter="url(#pressure-soft)" />
          ))}

          <path d={pathFrom(curveData)} fill="none" stroke="#050510" strokeWidth="16" strokeOpacity="0.07" strokeLinecap="round" strokeLinejoin="round" />
          {(() => {
            const match = getSelectionMatch(selectedItem, {
              inspectorId: forever.inspectorId,
              label: forever.label,
              query: forever.query,
              form: forever.query,
              layer: "frequency",
              kind: "form",
            });
            const active = activeId === forever.inspectorId || match === "active";
            const related = match === "related";
            const opacity = Boolean(selectedItem) && match === "unrelated" ? 0.34 : related ? 0.58 : focused && !active ? 0.24 : 0.88;
            return (
          <path
            d={pathFrom(curveData)}
            fill="none"
            stroke="#F06B04"
            strokeWidth={active ? 9 : related ? 7.5 : 7}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={opacity}
            className="cursor-crosshair transition duration-200"
            onMouseEnter={(event) => {
              setHoveredId(forever.inspectorId);
              onHover(forever.inspectorId, { x: event.clientX, y: event.clientY });
            }}
            onMouseMove={(event) => onHover(forever.inspectorId, { x: event.clientX, y: event.clientY })}
            onClick={(event) => {
              event.stopPropagation();
              onInspect(forever.inspectorId, { x: event.clientX, y: event.clientY });
            }}
          />
            );
          })()}
          {forEver ? (
            (() => {
              const match = getSelectionMatch(selectedItem, {
                inspectorId: forEver.inspectorId,
                label: forEver.label,
                query: forEver.query,
                form: forEver.query,
                layer: "frequency",
                kind: "form",
              });
              const active = activeId === forEver.inspectorId || match === "active";
              const related = match === "related";
              const opacity = Boolean(selectedItem) && match === "unrelated" ? 0.14 : related ? 0.34 : focused && !active ? 0.14 : 0.42;
              return (
                <path
                  d={pathFrom(spacedCurveData)}
                  fill="none"
                  stroke="#2C9FC7"
                  strokeWidth={active ? 6.5 : 4}
                  strokeDasharray="8 12"
                  strokeLinecap="round"
                  opacity={opacity}
                  className="cursor-crosshair transition duration-200"
                  onMouseEnter={(event) => {
                    setHoveredId(forEver.inspectorId);
                    onHover(forEver.inspectorId, { x: event.clientX, y: event.clientY });
                  }}
                  onMouseMove={(event) => onHover(forEver.inspectorId, { x: event.clientX, y: event.clientY })}
                  onClick={(event) => {
                    event.stopPropagation();
                    onInspect(forEver.inspectorId, { x: event.clientX, y: event.clientY });
                  }}
                />
              );
            })()
          ) : null}

          {pressureAnchors.map((anchor, index) => {
            const curveY = yAtYear(Math.max(1500, Math.min(2022, anchor.year)));
            const anchorX = xScale(Math.max(1500, Math.min(2022, anchor.year)));
            const match = getSelectionMatch(selectedItem, {
              inspectorId: anchor.id,
              id: anchor.id,
              label: anchor.label,
              kind: "pressure",
              layer: "influence",
              categoryIds: pressureCategoryIds[anchor.id],
            });
            const active = activeId === anchor.id || match === "active";
            const related = match === "related";
            const dimmed = (focused || Boolean(selectedItem)) && !active && !related;
            return (
              <g
                key={anchor.id}
                opacity={dimmed ? 0.16 : related ? 0.7 : 1}
                className="cursor-crosshair transition duration-200"
                onMouseEnter={(event) => {
                  setHoveredId(anchor.id);
                  onHover(anchor.id, { x: event.clientX, y: event.clientY });
                }}
                onMouseMove={(event) => onHover(anchor.id, { x: event.clientX, y: event.clientY })}
                onClick={(event) => {
                  event.stopPropagation();
                  onInspect(anchor.id, { x: event.clientX, y: event.clientY });
                }}
              >
                <path
                  d={`M ${anchor.x} ${anchor.y} C ${(anchor.x + anchorX) / 2} ${anchor.y + (index % 2 ? 140 : -120)}, ${(anchor.x + anchorX) / 2} ${curveY + (index % 2 ? -90 : 90)}, ${anchorX} ${curveY}`}
                  fill="none"
                  stroke={anchor.color}
                  strokeWidth={active ? 4 : 2}
                  strokeOpacity={active ? 0.88 : 0.36}
                  strokeLinecap="round"
                />
                {Array.from({ length: 18 }).map((_, rayIndex) => {
                  const angle = (rayIndex / 18) * Math.PI * 2;
                  const r1 = anchor.radius * 0.75;
                  const r2 = anchor.radius * (1.15 + (rayIndex % 4) * 0.18);
                  return (
                    <line
                      key={`${anchor.id}-ray-${rayIndex}`}
                      x1={anchor.x + Math.cos(angle) * r1}
                      y1={anchor.y + Math.sin(angle) * r1}
                      x2={anchor.x + Math.cos(angle) * r2}
                      y2={anchor.y + Math.sin(angle) * r2}
                      stroke={anchor.color}
                      strokeWidth={active ? 3 : 1.7}
                      strokeOpacity="0.55"
                      strokeLinecap="round"
                    />
                  );
                })}
                <circle cx={anchor.x} cy={anchor.y} r={active ? anchor.radius * 0.62 : anchor.radius * 0.5} fill="#050510" stroke={anchor.color} strokeWidth={active ? 5 : 3} />
                <text x={anchor.x} y={anchor.y + anchor.radius + 46} textAnchor="middle" className="fill-ink font-mono text-[16px] font-black uppercase tracking-[0.08em]">
                  {wrapWords(anchor.label).map((line, lineIndex) => (
                    <tspan key={line} x={anchor.x} dy={lineIndex === 0 ? 0 : 18}>
                      {line}
                    </tspan>
                  ))}
                </text>
                <text x={anchor.x} y={anchor.y + anchor.radius + 46 + wrapWords(anchor.label).length * 18} textAnchor="middle" className="fill-ink/55 font-mono text-[13px] font-black uppercase tracking-[0.08em]">
                  {anchor.period}
                </text>
              </g>
            );
          })}

          {(prehistory?.records ?? []).slice(0, 5).map((record, index) => {
            const match = getSelectionMatch(selectedItem, {
              id: record.id,
              inspectorId: record.id,
              label: record.form,
              form: record.normalizedForm || record.form,
              query: record.normalizedForm || record.form,
              kind: "prehistory",
              layer: "prehistory",
            });
            const active = activeId === record.id || match === "active";
            const related = match === "related";
            const xx = xScale(Math.max(1500, Math.min(2022, record.yearApproximation)));
            const yy = 710 + (index % 2) * 26;
            return (
              <g
                key={record.id}
                opacity={(focused || Boolean(selectedItem)) && !active && !related ? 0.18 : related ? 0.62 : 1}
                className="cursor-crosshair transition duration-200"
                onMouseEnter={(event) => {
                  setHoveredId(record.id);
                  onHover(record.id, { x: event.clientX, y: event.clientY });
                }}
                onMouseMove={(event) => onHover(record.id, { x: event.clientX, y: event.clientY })}
                onClick={(event) => {
                  event.stopPropagation();
                  onInspect(record.id, { x: event.clientX, y: event.clientY });
                }}
              >
                <line x1={xx} x2={xx} y1={yy - 48} y2={yy + 8} stroke="#050510" strokeDasharray="3 8" strokeWidth={active ? 3 : 1.7} />
                <circle cx={xx} cy={yy} r={active ? 8 : 5} fill="#F5ECD2" stroke="#050510" strokeWidth="2" />
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
