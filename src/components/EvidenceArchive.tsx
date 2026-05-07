"use client";

import { useMemo, useState } from "react";
import type {
  ForeverEra,
  ForeverEraId,
  GeneratedCollocate,
  GeneratedFrequencySeries,
  GeneratedLedgerCell,
  GeneratedModernContext,
  GeneratedPhrase,
  GeneratedPrehistory,
  GeneratedSnippet,
} from "@/types/foreverRealData";
import { getSelectionMatch } from "@/lib/visualSelection";
import type { SelectedItem, SelectedLayer } from "@/types/visualSelection";

type PointerPosition = { x: number; y: number };

type EvidenceArchiveProps = {
  snippets: GeneratedSnippet[];
  phrases: GeneratedPhrase[];
  collocates: GeneratedCollocate[];
  ledger: GeneratedLedgerCell[];
  eras: ForeverEra[];
  prehistory?: GeneratedPrehistory | null;
  frequency: GeneratedFrequencySeries[];
  modernContext?: GeneratedModernContext | null;
  selectedEra: ForeverEraId;
  selectedItem?: SelectedItem | null;
  selectedLayer?: SelectedLayer;
  activeInspectorId?: string;
  highlightedSnippetIds?: string[];
  onHover: (inspectorId: string | null, position?: PointerPosition) => void;
  onInspect: (inspectorId: string, position?: PointerPosition) => void;
};

const width = 1900;
const height = 1340;
const left = 96;
const archiveEnd = 1264;
const modernStart = 1560;
const modernEnd = 1812;

const rows = {
  attestation: 152,
  ngram: 328,
  archive: 574,
  gap: 944,
  modern: 1076,
};

const colors: Record<string, string> = {
  eternity_religion: "#1570AC",
  romance_vow: "#A1081F",
  permanence_duration: "#F06B04",
  remembrance: "#036C17",
  hyperbole_colloquial: "#FBB728",
  digital_permanence: "#2C9FC7",
};

const categoryLane: Record<string, number> = {
  eternity_religion: 0,
  romance_vow: 1,
  permanence_duration: 2,
  remembrance: 3,
  hyperbole_colloquial: 4,
  digital_permanence: 5,
};

function x(year: number) {
  if (year <= 1930) {
    return left + ((year - 1350) / (1930 - 1350)) * (archiveEnd - left);
  }
  if (year >= 2024) {
    return modernStart + ((year - 2024) / 2) * (modernEnd - modernStart);
  }
  return archiveEnd + ((year - 1930) / (2024 - 1930)) * (modernStart - archiveEnd);
}

function categoryColor(ids: string[]) {
  return colors[ids[0]] ?? "#050510";
}

function wrapWords(label: string, maxChars = 16) {
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

function firstCategory(ids: string[]) {
  return ids[0] ?? "permanence_duration";
}

function archivalStripWidth(startX: number, desiredWidth: number, minWidth = 28) {
  const available = archiveEnd - startX - 28;
  if (available <= minWidth) return Math.max(8, archiveEnd - startX - 8);
  return Math.max(minWidth, Math.min(desiredWidth, available));
}

export function EvidenceArchive({
  snippets,
  phrases,
  collocates,
  ledger,
  eras,
  prehistory,
  frequency,
  modernContext,
  selectedEra,
  selectedItem,
  selectedLayer,
  activeInspectorId,
  highlightedSnippetIds = [],
  onHover,
  onInspect,
}: EvidenceArchiveProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const activeId = activeInspectorId ?? hoveredId;
  const selectedEraRecord = eras.find((era) => era.id === selectedEra);
  const highlightSet = useMemo(
    () => new Set([...highlightedSnippetIds, ...(selectedItem?.relatedSnippetIds ?? [])]),
    [highlightedSnippetIds, selectedItem],
  );
  const focused = Boolean(activeId || highlightedSnippetIds.length);

  const visibleArchiveSnippets = useMemo(
    () =>
      snippets
        .filter((snippet) => selectedEra === "all" || snippet.eraId === selectedEra)
        .sort((a, b) => a.year - b.year),
    [selectedEra, snippets],
  );

  const visiblePhrases = phrases
    .filter((phrase) => (selectedEra === "all" ? phrase.eraId === "all" : phrase.eraId === selectedEra) && phrase.displayEligible)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  const visibleCollocates = collocates
    .filter((collocate) => (selectedEra === "all" ? collocate.eraId === "all" : collocate.eraId === selectedEra) && collocate.displayEligible)
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);
  const visibleLedger = ledger.filter((cell) =>
    selectedEra === "all"
      ? ["1700-1799", "1800-1849", "1850-1899", "1900-1949"].includes(cell.eraId)
      : cell.eraId === selectedEra,
  );

  return (
    <div className="relative overflow-hidden bg-wheat py-2">
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-auto min-w-[1420px] w-full"
          role="img"
          aria-label="Layered evidence atlas for forever"
          onMouseLeave={() => {
            setHoveredId(null);
            onHover(null);
          }}
        >
          <defs>
            <pattern id="archive-paper" width="38" height="38" patternUnits="userSpaceOnUse">
              <path d="M 38 0 L 0 0 0 38" fill="none" stroke="#050510" strokeOpacity="0.035" />
            </pattern>
            <pattern id="archive-gap" width="18" height="18" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" x2="0" y1="0" y2="18" stroke="#050510" strokeOpacity="0.22" strokeWidth="2.4" />
            </pattern>
            <filter id="archive-soft">
              <feGaussianBlur stdDeviation="7" />
            </filter>
          </defs>
          <rect width={width} height={height} fill="#F5ECD2" />
          <rect width={width} height={height} fill="url(#archive-paper)" />

          <text x="76" y="54" className="fill-fire font-mono text-[18px] font-black uppercase tracking-[0.2em]">
            evidence atlas / layered archive map
          </text>
          <text x={width - 76} y="54" textAnchor="end" className="fill-ink/58 font-mono text-[17px] font-black uppercase tracking-[0.11em]">
            {selectedLayer ?? selectedEraRecord?.label ?? selectedEra}
          </text>

          {[1375, 1500, 1700, 1726, 1819, 1930, 2024, 2026].map((year) => (
            <g key={year}>
              <line x1={x(year)} x2={x(year)} y1="92" y2="1218" stroke="#050510" strokeOpacity={year === 1930 || year === 2024 ? 0.24 : 0.08} strokeDasharray={year === 1930 || year === 2024 ? "4 10" : undefined} />
              <text x={x(year)} y="1260" textAnchor="middle" className="fill-ink/62 font-mono text-[16px] font-black uppercase tracking-[0.08em]">
                {year}
              </text>
            </g>
          ))}

          <rect x={archiveEnd} y="96" width={modernStart - archiveEnd} height="1126" fill="url(#archive-gap)" opacity="0.24" />
          <path d={`M ${archiveEnd} 96 L ${archiveEnd + 72} 236 L ${archiveEnd + 18} 392 L ${archiveEnd + 92} 548 L ${archiveEnd + 28} 716 L ${archiveEnd + 104} 892 L ${archiveEnd + 46} 1222`} fill="none" stroke="#050510" strokeWidth="3" strokeOpacity="0.34" />
          <text x={(archiveEnd + modernStart) / 2} y={rows.gap - 18} textAnchor="middle" className="fill-ink/66 font-mono text-[18px] font-black uppercase tracking-[0.16em]">
            1930-2023 context gap
          </text>
          <text x={(archiveEnd + modernStart) / 2} y={rows.gap + 14} textAnchor="middle" className="fill-ink/48 font-mono text-[16px] font-black uppercase tracking-[0.1em]">
            no comparable corpus layer
          </text>

          {[
            ["lexical prehistory", rows.attestation, "#1570AC"],
            ["Ngram span", rows.ngram, "#F06B04"],
            ["Gutenberg archive", rows.archive, "#A1081F"],
            ["missing context", rows.gap, "#050510"],
            ["Wikinews snapshot", rows.modern, "#2C9FC7"],
          ].map(([label, yRow, color]) => (
            <g key={label}>
              <text x="76" y={Number(yRow) - 56} className="fill-ink font-mono text-[17px] font-black uppercase tracking-[0.13em]">
                {label}
              </text>
              <line x1="76" x2={width - 76} y1={Number(yRow) - 32} y2={Number(yRow) - 32} stroke={String(color)} strokeWidth="3" strokeOpacity="0.34" />
            </g>
          ))}

          {(prehistory?.records ?? []).map((record, index) => {
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
            const xx = x(record.yearApproximation);
            const yy = rows.attestation + (index % 3) * 34;
            const lines = wrapWords(`${record.form} ${record.dateLabel}`, 18);
            return (
              <g
                key={record.id}
                opacity={(focused || Boolean(selectedItem)) && !active && !related ? 0.18 : related ? 0.66 : 1}
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
                <circle cx={xx} cy={yy} r={active ? 10 : 7} fill="#F5ECD2" stroke="#050510" strokeWidth="2.5" />
                <line x1={xx} x2={xx + 70} y1={yy} y2={yy} stroke="#1570AC" strokeWidth={active ? 5 : 3} strokeLinecap="round" />
                <text x={xx + 82} y={yy - 8} className="fill-ink font-mono text-[16px] font-black uppercase tracking-[0.07em]">
                  {lines.map((line, lineIndex) => (
                    <tspan key={line} x={xx + 82} dy={lineIndex === 0 ? 0 : 17}>
                      {line}
                    </tspan>
                  ))}
                </text>
              </g>
            );
          })}

          {frequency.map((series, index) => {
            const match = getSelectionMatch(selectedItem, {
              inspectorId: series.inspectorId,
              label: series.label,
              query: series.query,
              form: series.query.includes(" ") ? undefined : series.query,
              phrase: series.query.includes(" ") ? series.query : undefined,
              kind: series.query.includes(" ") ? "phrase" : "form",
              layer: "frequency",
            });
            const active = activeId === series.inspectorId || match === "active";
            const related = match === "related";
            const yy = rows.ngram - 18 + index * 40;
            const lines = wrapWords(series.query, 18);
            return (
              <g
                key={series.id}
                opacity={(focused || Boolean(selectedItem)) && !active && !related ? 0.14 : related ? 0.62 : 1}
                className="cursor-crosshair transition duration-200"
                onMouseEnter={(event) => {
                  setHoveredId(series.inspectorId);
                  onHover(series.inspectorId, { x: event.clientX, y: event.clientY });
                }}
                onMouseMove={(event) => onHover(series.inspectorId, { x: event.clientX, y: event.clientY })}
                onClick={(event) => {
                  event.stopPropagation();
                  onInspect(series.inspectorId, { x: event.clientX, y: event.clientY });
                }}
              >
                <line x1={x(series.startYear)} x2={x(series.endYear)} y1={yy} y2={yy} stroke="#050510" strokeWidth="13" strokeOpacity="0.08" strokeLinecap="round" />
                <line x1={x(series.startYear)} x2={x(1700)} y1={yy} y2={yy} stroke={series.color} strokeWidth="4" strokeDasharray="4 9" strokeOpacity="0.35" />
                <line x1={x(series.recommendedVisualStartYear ?? 1700)} x2={x(series.endYear)} y1={yy} y2={yy} stroke={series.color} strokeWidth={active ? 9 : 6} strokeLinecap="round" />
                <text x={x(series.endYear) + 18} y={yy - 8} className="fill-ink font-mono text-[16px] font-black uppercase tracking-[0.07em]">
                  {lines.map((line, lineIndex) => (
                    <tspan key={line} x={x(series.endYear) + 18} dy={lineIndex === 0 ? 0 : 16}>
                      {line}
                    </tspan>
                  ))}
                </text>
              </g>
            );
          })}

          {visibleLedger.slice(0, 18).map((cell, index) => {
            const color = colors[cell.categoryId] ?? "#050510";
            const match = getSelectionMatch(selectedItem, {
              inspectorId: cell.inspectorId,
              kind: "category",
              layer: "archival",
              eraId: cell.eraId,
              categoryIds: [cell.categoryId],
            });
            const yy = rows.archive - 88 + (index % 6) * 22;
            const xx = x(1726) + Math.floor(index / 6) * 210 + (index % 2) * 26;
            return (
              <line
                key={cell.id}
                x1={xx}
                x2={xx + 54 + Math.min(112, cell.scoreValue * 3)}
                y1={yy}
                y2={yy}
                stroke={color}
                strokeWidth={cell.evidenceStrength === "strong" ? 5 : cell.evidenceStrength === "moderate" ? 3.6 : 2.5}
                strokeLinecap="round"
                opacity={Boolean(selectedItem) && match === "unrelated" ? 0.12 : match === "active" ? 0.9 : match === "related" ? 0.66 : 0.52}
              />
            );
          })}

          {[...visiblePhrases, ...visibleCollocates].slice(0, 18).map((item, index) => {
            const id = item.inspectorId;
            const label = "phrase" in item ? item.phrase : item.token;
            const support = item.count;
            const color = categoryColor(item.categoryIds);
            const match = getSelectionMatch(selectedItem, {
              inspectorId: id,
              label,
              phrase: "phrase" in item ? item.phrase : undefined,
              kind: "phrase" in item ? "phrase" : "collocate",
              layer: "archival",
              eraId: item.eraId,
              categoryIds: item.categoryIds,
            });
            const active = activeId === id || match === "active";
            const related = match === "related";
            const xx = x(1726) + 18 + Math.floor(index / 5) * 286 + (index % 2) * 28;
            const yy = rows.archive + 50 + (index % 5) * 42;
            const lines = wrapWords(label, 18);
            return (
              <g
                key={`${id}-${index}`}
                opacity={(focused || Boolean(selectedItem)) && !active && !related ? 0.14 : related ? 0.68 : 1}
                className="cursor-crosshair transition duration-200"
                onMouseEnter={(event) => {
                  setHoveredId(id);
                  onHover(id, { x: event.clientX, y: event.clientY });
                }}
                onMouseMove={(event) => onHover(id, { x: event.clientX, y: event.clientY })}
                onClick={(event) => {
                  event.stopPropagation();
                  onInspect(id, { x: event.clientX, y: event.clientY });
                }}
              >
                <line
                  x1={xx}
                  x2={xx + archivalStripWidth(xx, 50 + support * 10, 42)}
                  y1={yy}
                  y2={yy}
                  stroke={color}
                  strokeWidth={active ? 7 : 4}
                  strokeLinecap="round"
                />
                <text x={xx} y={yy - 12} className="fill-ink/74 font-mono text-[15px] font-black uppercase tracking-[0.07em]">
                  {lines.map((line, lineIndex) => (
                    <tspan key={line} x={xx} dy={lineIndex === 0 ? 0 : 15}>
                      {line}
                    </tspan>
                  ))}
                </text>
              </g>
            );
          })}

          {visibleArchiveSnippets.map((snippet, index) => {
            const category = firstCategory(snippet.categoryIds);
            const lane = categoryLane[category] ?? 2;
            const match = getSelectionMatch(selectedItem, {
              id: snippet.id,
              inspectorId: snippet.inspectorId,
              label: snippet.phrase,
              phrase: snippet.phrase,
              kind: "snippet",
              layer: "archival",
              eraId: snippet.eraId,
              categoryIds: snippet.categoryIds,
              snippetId: snippet.id,
            });
            const active = activeId === snippet.inspectorId || highlightSet.has(snippet.id) || match === "active";
            const related = match === "related";
            const xx = x(snippet.year) + ((index % 3) - 1) * 10;
            const yy = rows.archive + 292 + lane * 34 + (index % 2) * 10;
            return (
              <g
                key={snippet.id}
                opacity={(focused || Boolean(selectedItem)) && !active && !related ? 0.12 : related ? 0.66 : 1}
                className="cursor-crosshair transition duration-200"
                onMouseEnter={(event) => {
                  setHoveredId(snippet.inspectorId);
                  onHover(snippet.inspectorId, { x: event.clientX, y: event.clientY });
                }}
                onMouseMove={(event) => onHover(snippet.inspectorId, { x: event.clientX, y: event.clientY })}
                onClick={(event) => {
                  event.stopPropagation();
                  onInspect(snippet.inspectorId, { x: event.clientX, y: event.clientY });
                }}
              >
                <rect
                  x={xx}
                  y={yy - 7}
                  width={archivalStripWidth(xx, Math.min(118, snippet.quote.length * 0.5), 24)}
                  height="14"
                  fill="#050510"
                  opacity={active ? 0.88 : 0.66}
                />
                <line
                  x1={xx}
                  x2={xx + archivalStripWidth(xx, Math.min(86, snippet.quote.length * 0.38), 20)}
                  y1={yy + 12}
                  y2={yy + 12}
                  stroke={categoryColor(snippet.categoryIds)}
                  strokeWidth={active ? 5 : 3}
                  strokeLinecap="round"
                />
                <circle cx={xx - 10} cy={yy} r={active ? 7 : 4.5} fill={categoryColor(snippet.categoryIds)} stroke="#050510" />
              </g>
            );
          })}

          {(modernContext?.snippets ?? []).map((snippet, index) => {
            const match = getSelectionMatch(selectedItem, {
              id: snippet.id,
              inspectorId: snippet.id,
              label: snippet.query,
              phrase: snippet.query,
              kind: "snippet",
              layer: "modern",
              eraId: snippet.eraId,
              categoryIds: snippet.categoryIds,
              snippetId: snippet.id,
            });
            const active = activeId === snippet.id || highlightSet.has(snippet.id) || match === "active";
            const related = match === "related";
            const xx = x(snippet.year) + Math.floor(index / 5) * 48;
            const yy = rows.modern - 18 + (index % 5) * 44;
            const lines = index < 5 ? wrapWords(snippet.query, 16) : [];
            return (
              <g
                key={snippet.id}
                opacity={(focused || Boolean(selectedItem)) && !active && !related ? 0.12 : related ? 0.66 : 1}
                className="cursor-crosshair transition duration-200"
                onMouseEnter={(event) => {
                  setHoveredId(snippet.id);
                  onHover(snippet.id, { x: event.clientX, y: event.clientY });
                }}
                onMouseMove={(event) => onHover(snippet.id, { x: event.clientX, y: event.clientY })}
                onClick={(event) => {
                  event.stopPropagation();
                  onInspect(snippet.id, { x: event.clientX, y: event.clientY });
                }}
              >
                <line x1={xx} x2={xx + Math.min(136, snippet.quote.length * 0.5)} y1={yy} y2={yy} stroke="#2C9FC7" strokeWidth={active ? 8 : 5} strokeLinecap="round" />
                <line x1={xx + 10} x2={xx + 110} y1={yy + 10} y2={yy + 10} stroke="#050510" strokeWidth="2.5" strokeLinecap="round" opacity="0.54" />
                <circle cx={xx - 13} cy={yy} r={active ? 8 : 5} fill="#F5ECD2" stroke="#2C9FC7" strokeWidth="3" />
                {lines.length ? (
                  <text x={xx} y={yy - 16} className="fill-ink/74 font-mono text-[15px] font-black uppercase tracking-[0.07em]">
                    {lines.map((line, lineIndex) => (
                      <tspan key={line} x={xx} dy={lineIndex === 0 ? 0 : 15}>
                        {line}
                      </tspan>
                    ))}
                  </text>
                ) : null}
              </g>
            );
          })}

          <g transform="translate(76 1292)" className="font-mono text-[16px] font-black uppercase tracking-[0.1em]">
            <line x1="0" x2="64" y1="-4" y2="-4" stroke="#F06B04" strokeWidth="5" strokeLinecap="round" />
            <text x="82" y="0" className="fill-ink/58">frequency coverage</text>
            <rect x="352" y="-15" width="58" height="22" fill="#050510" opacity="0.7" />
            <text x="428" y="0" className="fill-ink/58">snippet strip</text>
            <rect x="654" y="-17" width="60" height="25" fill="url(#archive-gap)" />
            <text x="734" y="0" className="fill-ink/58">designed gap</text>
            <circle cx="1018" cy="-5" r="7" fill="#F5ECD2" stroke="#2C9FC7" strokeWidth="3" />
            <text x="1040" y="0" className="fill-ink/58">modern snapshot mark</text>
          </g>
        </svg>
      </div>
    </div>
  );
}
