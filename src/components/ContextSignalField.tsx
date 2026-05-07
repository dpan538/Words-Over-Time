"use client";

import { useMemo, useState } from "react";
import type {
  ForeverEra,
  ForeverEraId,
  GeneratedCategory,
  GeneratedLedgerCell,
  GeneratedModernContext,
} from "@/types/foreverRealData";

type PointerPosition = { x: number; y: number };

type ContextSignalFieldProps = {
  ledger: GeneratedLedgerCell[];
  categories: GeneratedCategory[];
  eras: ForeverEra[];
  modernContext?: GeneratedModernContext | null;
  selectedEra: ForeverEraId;
  activeInspectorId?: string;
  onHover: (inspectorId: string | null, position?: PointerPosition) => void;
  onInspect: (inspectorId: string, position?: PointerPosition) => void;
};

type GlobeNode = {
  id: string;
  inspectorId: string;
  label: string;
  categoryId: string;
  lon: number;
  lat: number;
  color: string;
  archivalSupport: number;
  modernSupport: number;
  confidence: "high" | "medium" | "low" | "snapshot" | "unavailable";
};

type OrbitMark = {
  id: string;
  inspectorId: string;
  angle: number;
  rx: number;
  ry: number;
  rotate: number;
  color: string;
  radius: number;
  opacity: number;
};

const width = 1900;
const height = 1180;
const cx = 950;
const cy = 510;
const globeRx = 420;
const globeRy = 420;

const globePositions: Record<string, { lon: number; lat: number }> = {
  eternity_religion: { lon: -122, lat: 34 },
  romance_vow: { lon: -48, lat: -28 },
  permanence_duration: { lon: 16, lat: 18 },
  remembrance: { lon: 82, lat: -36 },
  hyperbole_colloquial: { lon: 144, lat: 24 },
  digital_permanence: { lon: 134, lat: -6 },
};

const categoryIds = [
  "eternity_religion",
  "romance_vow",
  "permanence_duration",
  "remembrance",
  "hyperbole_colloquial",
];

function deg(value: number) {
  return (value * Math.PI) / 180;
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

function categorySupportFromModern(modernContext: GeneratedModernContext | null | undefined, categoryId: string) {
  const phraseSupport =
    modernContext?.phrases
      .filter((phrase) => phrase.categoryIds.includes(categoryId))
      .reduce((sum, phrase) => sum + phrase.count, 0) ?? 0;
  const collocateSupport =
    modernContext?.collocates
      .filter((collocate) => collocate.categoryIds.includes(categoryId))
      .reduce((sum, collocate) => sum + collocate.count, 0) ?? 0;
  const snippetSupport = modernContext?.snippets.filter((snippet) => snippet.categoryIds.includes(categoryId)).length ?? 0;
  return phraseSupport + collocateSupport + snippetSupport;
}

function supportFromLedger(
  ledger: GeneratedLedgerCell[],
  categoryId: string,
  selectedEra: ForeverEraId,
): { support: number; score: number; confidence: GlobeNode["confidence"]; inspectorId?: string } {
  const archivalEraIds = ["1700-1799", "1800-1849", "1850-1899", "1900-1949"];
  const cells = ledger.filter(
    (cell) =>
      cell.categoryId === categoryId &&
      (selectedEra === "all" ? archivalEraIds.includes(cell.eraId) : cell.eraId === selectedEra),
  );
  const support = cells.reduce((sum, cell) => sum + cell.phraseSupport + cell.collocateSupport + cell.snippetSupport, 0);
  const score = cells.reduce((sum, cell) => sum + cell.scoreValue, 0);
  const confidence: GlobeNode["confidence"] = cells.some((cell) => cell.confidence === "high")
    ? "high"
    : cells.some((cell) => cell.confidence === "medium")
      ? "medium"
      : cells.length
        ? "low"
        : "unavailable";
  return { support, score, confidence, inspectorId: cells[0]?.inspectorId };
}

function project(lon: number, lat: number, rotation: number) {
  const lonRad = deg(lon + rotation);
  const latRad = deg(lat);
  const x = cx + Math.cos(latRad) * Math.sin(lonRad) * globeRx;
  const y = cy - Math.sin(latRad) * globeRy * 0.82;
  const z = Math.cos(latRad) * Math.cos(lonRad);
  return { x, y, z, scale: 0.7 + (z + 1) * 0.25 };
}

function orbitPoint(angle: number, rx: number, ry: number, rotate = 0) {
  const a = deg(angle);
  const r = deg(rotate);
  const rawX = Math.cos(a) * rx;
  const rawY = Math.sin(a) * ry;
  return {
    x: cx + rawX * Math.cos(r) - rawY * Math.sin(r),
    y: cy + rawX * Math.sin(r) + rawY * Math.cos(r),
  };
}

export function ContextSignalField({
  ledger,
  categories,
  eras,
  modernContext,
  selectedEra,
  activeInspectorId,
  onHover,
  onInspect,
}: ContextSignalFieldProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [rotation, setRotation] = useState(-18);
  const [dragStart, setDragStart] = useState<number | null>(null);
  const activeId = activeInspectorId ?? hoveredId;
  const focused = Boolean(activeId);
  const selectedEraRecord = eras.find((era) => era.id === selectedEra);

  const nodes = useMemo<GlobeNode[]>(() => {
    return categories
      .filter((category) => categoryIds.includes(category.id))
      .map((category) => {
        const position = globePositions[category.id];
        const archival = supportFromLedger(ledger, category.id, selectedEra);
        const modernSupport = categorySupportFromModern(modernContext, category.id);
        return {
          id: `globe-${category.id}`,
          inspectorId:
            selectedEra === "recent"
              ? modernContext?.phrases.find((phrase) => phrase.categoryIds.includes(category.id))?.id ??
                modernContext?.collocates.find((collocate) => collocate.categoryIds.includes(category.id))?.id ??
                modernContext?.snippets.find((snippet) => snippet.categoryIds.includes(category.id))?.id ??
                `inspect-category-${category.id}-recent`
              : archival.inspectorId ?? `inspect-category-${category.id}-all`,
          label: category.label,
          categoryId: category.id,
          lon: position.lon,
          lat: position.lat,
          color: category.color,
          archivalSupport: archival.support + Math.round(archival.score),
          modernSupport,
          confidence: selectedEra === "recent" ? "snapshot" : archival.confidence,
        };
      });
  }, [categories, ledger, modernContext, selectedEra]);

  const orbitMarks = useMemo<OrbitMark[]>(() => {
    const marks: OrbitMark[] = [];
    const archivalEraIds = ["1700-1799", "1800-1849", "1850-1899", "1900-1949"];
    const visibleCells = ledger.filter((cell) =>
      selectedEra === "all"
        ? archivalEraIds.includes(cell.eraId) && categoryIds.includes(cell.categoryId)
        : cell.eraId === selectedEra && categoryIds.includes(cell.categoryId),
    );
    visibleCells.forEach((cell) => {
      const categoryIndex = Math.max(0, categoryIds.indexOf(cell.categoryId));
      const color = categories.find((category) => category.id === cell.categoryId)?.color ?? "#050510";
      const support = cell.phraseSupport + cell.collocateSupport + cell.snippetSupport;
      const count = Math.max(3, Math.min(18, support));
      Array.from({ length: count }).forEach((_, index) => {
        marks.push({
          id: `${cell.id}-mark-${index}`,
          inspectorId: cell.inspectorId,
          angle: 208 + categoryIndex * 22 + index * (92 / count),
          rx: 518 + categoryIndex * 18,
          ry: 192 + categoryIndex * 17,
          rotate: -24 + categoryIndex * 13,
          color,
          radius: index % 5 === 0 ? 4.8 : 2.8,
          opacity: cell.evidenceStrength === "strong" ? 0.72 : cell.evidenceStrength === "moderate" ? 0.5 : 0.34,
        });
      });
    });
    (modernContext?.phrases ?? []).slice(0, 14).forEach((phrase, index) => {
      marks.push({
        id: `${phrase.id}-orbit`,
        inspectorId: phrase.id,
        angle: -52 + index * 8.8,
        rx: 586,
        ry: 328,
        rotate: 31,
        color: "#2C9FC7",
        radius: 5 + Math.min(11, phrase.count * 2),
        opacity: 0.78,
      });
    });
    (modernContext?.collocates ?? []).slice(0, 18).forEach((collocate, index) => {
      marks.push({
        id: `${collocate.id}-orbit`,
        inspectorId: collocate.id,
        angle: 18 + index * 6.5,
        rx: 618,
        ry: 256,
        rotate: -18,
        color: categories.find((category) => category.id === collocate.categoryIds[0])?.color ?? "#2C9FC7",
        radius: 3.4 + Math.min(7, collocate.count * 0.55),
        opacity: 0.54,
      });
    });
    return marks;
  }, [categories, ledger, modernContext, selectedEra]);

  const modernLayerPoints = (modernContext?.phrases ?? []).slice(0, 16).map((phrase, index) => ({
    id: phrase.id,
    label: phrase.phrase,
    angle: -42 + index * 6.2,
    color: "#2C9FC7",
    value: phrase.count,
  }));

  return (
    <div className="relative overflow-hidden bg-wheat py-2">
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className={`h-auto min-w-[1400px] w-full touch-pan-y ${dragStart === null ? "cursor-grab" : "cursor-grabbing"}`}
          role="img"
          aria-label="Semantic globe showing contextual category signals around forever"
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            setDragStart(event.clientX);
          }}
          onPointerMove={(event) => {
            if (dragStart === null) return;
            setRotation((current) => current + (event.clientX - dragStart) * 0.18);
            setDragStart(event.clientX);
          }}
          onPointerUp={(event) => {
            event.currentTarget.releasePointerCapture(event.pointerId);
            setDragStart(null);
          }}
          onWheel={(event) => {
            const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
            setRotation((current) => current + delta * 0.035);
          }}
          onPointerLeave={() => {
            setDragStart(null);
            setHoveredId(null);
            onHover(null);
          }}
        >
          <defs>
            <radialGradient id="globe-fill" cx="42%" cy="34%" r="68%">
              <stop offset="0%" stopColor="#FBB728" stopOpacity="0.28" />
              <stop offset="52%" stopColor="#F5ECD2" stopOpacity="0.88" />
              <stop offset="100%" stopColor="#050510" stopOpacity="0.08" />
            </radialGradient>
            <pattern id="globe-paper" width="38" height="38" patternUnits="userSpaceOnUse">
              <path d="M 38 0 L 0 0 0 38" fill="none" stroke="#050510" strokeOpacity="0.035" />
            </pattern>
            <pattern id="globe-gap" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(42)">
              <line x1="0" x2="0" y1="0" y2="16" stroke="#050510" strokeOpacity="0.18" strokeWidth="2" />
            </pattern>
            <filter id="globe-soft">
              <feGaussianBlur stdDeviation="8" />
            </filter>
          </defs>
          <rect width={width} height={height} fill="#F5ECD2" />
          <rect width={width} height={height} fill="url(#globe-paper)" />

          <text x="76" y="54" className="fill-fire font-mono text-[18px] font-black uppercase tracking-[0.2em]">
            semantic globe / context sphere
          </text>
          <text x={width - 76} y="54" textAnchor="end" className="fill-ink/58 font-mono text-[15px] font-black uppercase tracking-[0.13em]">
            {selectedEraRecord?.label ?? selectedEra} / drag to turn
          </text>

          <rect x="790" y="150" width="320" height="720" fill="url(#globe-gap)" opacity="0.22" />
          <text x="950" y="986" textAnchor="middle" className="fill-ink/52 font-mono text-[14px] font-black uppercase tracking-[0.13em]">
            1930-2023 contextual gap crosses the object
          </text>

          <ellipse cx={cx} cy={cy} rx="518" ry="466" fill="#050510" opacity="0.07" filter="url(#globe-soft)" />
          <circle cx={cx} cy={cy} r="424" fill="url(#globe-fill)" stroke="#050510" strokeOpacity="0.48" strokeWidth="2.2" />

          {[-70, -50, -30, -12, 0, 12, 30, 50, 70].map((lat) => (
            <ellipse
              key={`lat-${lat}`}
              cx={cx}
              cy={cy - Math.sin(deg(lat)) * globeRy * 0.82}
              rx={globeRx * Math.cos(deg(lat))}
              ry={globeRx * Math.cos(deg(lat)) * 0.18}
              fill="none"
              stroke="#050510"
              strokeOpacity={lat === 0 ? 0.3 : 0.13}
              strokeWidth={lat === 0 ? 1.8 : 1}
            />
          ))}
          {[-82, -64, -46, -28, -10, 10, 28, 46, 64, 82].map((angle) => (
            <ellipse
              key={`meridian-${angle}`}
              cx={cx}
              cy={cy}
              rx="124"
              ry="424"
              fill="none"
              stroke="#050510"
              strokeOpacity="0.1"
              strokeWidth="1"
              transform={`rotate(${angle + rotation * 0.18} ${cx} ${cy})`}
            />
          ))}

          {nodes.map((node, index) => {
            const support = selectedEra === "recent" ? node.modernSupport : node.archivalSupport;
            return (
              <ellipse
                key={`${node.id}-category-orbit`}
                cx={cx}
                cy={cy}
                rx={438 + index * 35}
                ry={122 + index * 31}
                fill="none"
                stroke={node.color}
                strokeOpacity={0.15 + Math.min(0.38, support / 90)}
                strokeWidth={1.8 + Math.min(3.4, Math.sqrt(Math.max(1, support)) * 0.22)}
                strokeDasharray={node.confidence === "unavailable" ? "3 12" : undefined}
                transform={`rotate(${-52 + index * 27 + rotation * 0.035} ${cx} ${cy})`}
              />
            );
          })}
          <ellipse cx={cx} cy={cy} rx="590" ry="248" fill="none" stroke="#1570AC" strokeOpacity="0.62" strokeWidth="3.8" transform={`rotate(${-18 + rotation * 0.04} ${cx} ${cy})`} />
          <ellipse cx={cx} cy={cy} rx="540" ry="326" fill="none" stroke="#A1081F" strokeOpacity="0.48" strokeWidth="3.2" transform={`rotate(${28 + rotation * 0.04} ${cx} ${cy})`} />
          <ellipse cx={cx} cy={cy} rx="470" ry="152" fill="none" stroke="#F06B04" strokeOpacity="0.58" strokeWidth="4" transform={`rotate(${68 + rotation * 0.04} ${cx} ${cy})`} />

          {orbitMarks.map((mark) => {
            const point = orbitPoint(mark.angle + rotation * 0.42, mark.rx, mark.ry, mark.rotate + rotation * 0.04);
            const active = activeId === mark.inspectorId;
            return (
              <circle
                key={mark.id}
                cx={point.x}
                cy={point.y}
                r={active ? mark.radius + 3 : mark.radius}
                fill={mark.color}
                stroke={active ? "#050510" : "none"}
                strokeWidth={active ? 2 : 0}
                opacity={focused && !active ? 0.12 : mark.opacity}
                className="cursor-crosshair transition duration-200"
                onMouseEnter={(event) => {
                  setHoveredId(mark.inspectorId);
                  onHover(mark.inspectorId, { x: event.clientX, y: event.clientY });
                }}
                onMouseMove={(event) => onHover(mark.inspectorId, { x: event.clientX, y: event.clientY })}
                onClick={(event) => {
                  event.stopPropagation();
                  onInspect(mark.inspectorId, { x: event.clientX, y: event.clientY });
                }}
              />
            );
          })}

          {modernLayerPoints.map((point, index) => {
            const p = orbitPoint(point.angle + rotation * 0.6, 566, 318, 28 + rotation * 0.04);
            const active = activeId === point.id;
            return (
              <g
                key={point.id}
                opacity={focused && !active ? 0.16 : 1}
                className="cursor-crosshair transition duration-200"
                onMouseEnter={(event) => {
                  setHoveredId(point.id);
                  onHover(point.id, { x: event.clientX, y: event.clientY });
                }}
                onMouseMove={(event) => onHover(point.id, { x: event.clientX, y: event.clientY })}
                onClick={(event) => {
                  event.stopPropagation();
                  onInspect(point.id, { x: event.clientX, y: event.clientY });
                }}
              >
                <circle cx={p.x} cy={p.y} r={5 + Math.min(13, point.value * 2)} fill="#2C9FC7" stroke="#050510" strokeWidth={active ? 3 : 1.6} />
              </g>
            );
          })}

          {nodes
            .map((node) => ({ node, p: project(node.lon, node.lat, rotation) }))
            .sort((a, b) => a.p.z - b.p.z)
            .map(({ node, p }, index) => {
              const active = activeId === node.inspectorId;
              const dimmed = focused && !active;
              const support = selectedEra === "recent" ? node.modernSupport : node.archivalSupport;
              const radius = (20 + Math.sqrt(Math.max(1, support)) * 6) * p.scale;
              const labelSide = p.x > cx ? "start" : "end";
              const labelX = p.x + (labelSide === "start" ? radius + 34 : -radius - 34);
              const labelY = p.y - radius - 14;
              const lines = wrapWords(node.label, 18);
              return (
                <g
                  key={node.id}
                  opacity={dimmed ? 0.14 : p.z < -0.35 ? 0.38 : 1}
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
                  <line x1={p.x} x2={labelX} y1={p.y} y2={labelY} stroke={node.color} strokeWidth={active ? 3 : 1.5} strokeOpacity={p.z < -0.35 ? 0.22 : 0.54} />
                  {Array.from({ length: Math.max(8, Math.min(36, Math.round(support / 2) + 8)) }).map((_, rayIndex) => {
                    const angle = (rayIndex / 18) * Math.PI * 2 + index;
                    return (
                      <line
                        key={`${node.id}-ray-${rayIndex}`}
                        x1={p.x + Math.cos(angle) * radius * 0.62}
                        y1={p.y + Math.sin(angle) * radius * 0.62}
                        x2={p.x + Math.cos(angle) * radius * 1.2}
                        y2={p.y + Math.sin(angle) * radius * 1.2}
                        stroke={node.color}
                        strokeWidth={active ? 3 : 1.4}
                        strokeOpacity={p.z < -0.35 ? 0.14 : 0.48}
                        strokeLinecap="round"
                      />
                    );
                  })}
                  <circle cx={p.x} cy={p.y} r={radius * 1.18} fill={node.color} opacity={p.z < -0.35 ? 0.04 : 0.1} filter="url(#globe-soft)" />
                  <circle cx={p.x} cy={p.y} r={active ? radius * 0.72 : radius * 0.56} fill="#050510" stroke={node.color} strokeWidth={active ? 5 : 3} />
                  <text x={labelX} y={labelY} textAnchor={labelSide} className="fill-ink font-mono text-[15px] font-black uppercase tracking-[0.08em]">
                    {lines.map((line, lineIndex) => (
                      <tspan key={line} x={labelX} dy={lineIndex === 0 ? 0 : 18}>
                        {line}
                      </tspan>
                    ))}
                  </text>
                  <text x={labelX} y={labelY + lines.length * 18 + 18} textAnchor={labelSide} className="fill-ink/54 font-mono text-[13px] font-black uppercase tracking-[0.1em]">
                    {selectedEra === "recent" ? "modern snapshot" : node.confidence}
                  </text>
                </g>
              );
            })}

          <g transform="translate(118 1082)" className="font-mono text-[14px] font-black uppercase tracking-[0.12em]">
            <circle cx="0" cy="-5" r="8" fill="#050510" />
            <text x="22" y="0" className="fill-ink/58">node size = support density</text>
            <line x1="336" x2="408" y1="-5" y2="-5" stroke="#F06B04" strokeWidth="4" strokeLinecap="round" />
            <text x="426" y="0" className="fill-ink/58">orbits = phrase/collocate/snippet support</text>
            <rect x="812" y="-18" width="54" height="24" fill="url(#globe-gap)" />
            <text x="886" y="0" className="fill-ink/58">hatched vertical band = missing comparable context</text>
          </g>
        </svg>
      </div>
    </div>
  );
}
