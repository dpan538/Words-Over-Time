"use client";

import { useMemo, useState } from "react";

type LegalBranch = {
  branch_id: string;
  label: string;
  description: string;
  color: string;
};

type LegalMatrixNode = {
  anchor_id: string;
  year: number;
  label: string;
  branch_id: string;
  source_title: string;
  source_url: string;
  description: string;
  evidence_type: string;
  strength: number;
  confidence: string;
  radius: number;
  source_reachable: boolean;
  source_status?: number;
};

type LegalPhraseSeries = {
  term: string;
  source: string;
  mean_1890_1950: number;
  max_1890_1950: number;
  peak_year_1890_1950: number | null;
};

type LegalYearSignal = {
  year: number;
  value: number;
  raw_total: number;
  active_phrase_count: number;
  top_phrase: string;
};

type LegalScaleItem = {
  label: string;
  strength: number;
  radius: number;
};

type LegalSourceSummary = {
  source_id: string;
  description: string;
  record_count: number;
  reachable_count?: number;
  year_range?: [number, number];
};

export type PrivacyLegalInjuryDataset = {
  word: "privacy";
  layer_id: "legal_injury_matrix";
  status: string;
  intended_use: string;
  title: string;
  subtitle: string;
  generated_at: string;
  year_range: [number, number];
  branches: LegalBranch[];
  matrix_nodes: LegalMatrixNode[];
  phrase_series: LegalPhraseSeries[];
  yearly_phrase_signal: LegalYearSignal[];
  scale: LegalScaleItem[];
  sources: LegalSourceSummary[];
  failed_sources: {
    anchor_id: string;
    url: string;
    status?: number;
    error?: string;
  }[];
  limitations: string[];
};

type PrivacyChart01LegalInjuryProps = {
  dataset: PrivacyLegalInjuryDataset;
};

const INK = "#050510";
const GRID = "#504a3d";
const VIOLET = "#6F3AA6";
const RUST = "#B95A34";
const MONO_STYLE = { fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" };

const MATRIX_WIDTH = 1040;
const MATRIX_HEIGHT = 760;
const START_YEAR = 1890;
const END_YEAR = 1950;

function pointFor(year: number, branchIndex: number) {
  const progress = (year - START_YEAR) / (END_YEAR - START_YEAR);
  const x = 232 + progress * 600 + branchIndex * 20;
  const y = 126 + branchIndex * 72 + progress * 170;

  return { x, y, progress };
}

function linePath(
  points: { year: number; value: number }[],
  left: number,
  right: number,
  top: number,
  bottom: number,
  maxValue: number,
) {
  if (!points.length) return "";

  return points
    .map((point, index) => {
      const progress = (point.year - START_YEAR) / (END_YEAR - START_YEAR);
      const x = left + progress * (right - left);
      const y = bottom - (point.value / (maxValue || 1)) * (bottom - top);
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

function adjustedPointForNode(node: LegalMatrixNode, branchIndex: number) {
  const base = pointFor(node.year, branchIndex);
  const offsets: Record<string, { x: number; y: number }> = {
    privacy_1928_olmstead: { x: 34, y: -22 },
    privacy_1931_melvin: { x: -24, y: 24 },
    privacy_1939_restatement: { x: 20, y: 6 },
    privacy_1948_udhr: { x: -48, y: -40 },
    privacy_1950_echr_article_8: { x: 44, y: 34 },
  };
  const offset = offsets[node.anchor_id] ?? { x: 0, y: 0 };

  return { ...base, x: base.x + offset.x, y: base.y + offset.y };
}

function nodeYearLabelPosition(node: LegalMatrixNode, point: { x: number; y: number }, radius: number) {
  const positions: Record<string, { x: number; y: number; anchor: "start" | "middle" | "end" }> = {
    privacy_1928_olmstead: { x: point.x - 30, y: point.y + radius + 24, anchor: "end" },
    privacy_1931_melvin: { x: point.x + 28, y: point.y + radius + 22, anchor: "start" },
    privacy_1948_udhr: { x: point.x - 34, y: point.y + radius + 24, anchor: "end" },
    privacy_1950_echr_article_8: { x: point.x + 34, y: point.y + radius + 28, anchor: "start" },
  };

  return positions[node.anchor_id] ?? { x: point.x, y: point.y + radius + 17, anchor: "middle" as const };
}

function stripXForYear(year: number) {
  return 70 + ((year - START_YEAR) / (END_YEAR - START_YEAR)) * 620;
}

function stripSignalHeight(value: number, maxValue: number) {
  return 4 + Math.sqrt(value / (maxValue || 1)) * 26;
}

function compactNumber(value: number) {
  if (value >= 1) return value.toFixed(2);
  if (value >= 0.01) return value.toFixed(3);
  return value.toFixed(4);
}

function shortNodeLabel(node: LegalMatrixNode) {
  const labels: Record<string, string> = {
    privacy_1890_warren_brandeis: "RIGHT TO PRIVACY",
    privacy_1903_new_york_name_picture: "NAME / PICTURE STATUTE",
    privacy_1928_olmstead: "OLMSTEAD DISSENT",
    privacy_1948_udhr: "UDHR ARTICLE 12",
    privacy_1950_echr_article_8: "ECHR ARTICLE 8",
  };

  return labels[node.anchor_id] ?? node.evidence_type.replaceAll("_", " ").toUpperCase();
}

export function PrivacyChart01LegalInjury({ dataset }: PrivacyChart01LegalInjuryProps) {
  const [activeNodeId, setActiveNodeId] = useState<string | null>(dataset.matrix_nodes[0]?.anchor_id ?? null);
  const activeNode = dataset.matrix_nodes.find((node) => node.anchor_id === activeNodeId) ?? dataset.matrix_nodes[0];
  const branchById = useMemo(
    () => new Map(dataset.branches.map((branch, index) => [branch.branch_id, { ...branch, index }])),
    [dataset.branches],
  );
  const maxLineValue = Math.max(...dataset.yearly_phrase_signal.map((point) => point.value), 0);
  const stripTrendPath = dataset.yearly_phrase_signal
    .map((point, index) => {
      const x = stripXForYear(point.year);
      const y = 62 - stripSignalHeight(point.value, maxLineValue);
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");

  return (
    <div className="grid gap-8 xl:grid-cols-[23rem_minmax(0,1fr)]">
      <aside className="border-l-2 border-ink/45 pl-4">
        <p className="font-mono text-[0.74rem] font-black uppercase leading-5 tracking-[0.16em] text-privacy-violet">
          legal injury hover
        </p>
        {activeNode ? (
          <div className="mt-4 h-[18.5rem] overflow-hidden">
            <p className="font-mono text-[0.9rem] font-black uppercase leading-[1.25] tracking-[0.1em] text-ink">
              {activeNode.label}
            </p>
            <p className="mt-3 font-mono text-[0.82rem] font-black leading-5 text-ink/74">
              {activeNode.year} / {branchById.get(activeNode.branch_id)?.label}
            </p>
            <p className="mt-3 text-[0.9rem] leading-6 text-ink/74">{activeNode.description}</p>
            <p className="mt-4 font-mono text-[0.72rem] font-black uppercase leading-5 tracking-[0.1em] text-ink/52">
              confidence {activeNode.confidence} / source{" "}
              {activeNode.source_reachable ? "verified" : `needs manual check ${activeNode.source_status ?? ""}`}
            </p>
          </div>
        ) : null}

        <div className="mt-7 space-y-3">
          {dataset.branches.map((branch) => (
            <div key={branch.branch_id} className="grid grid-cols-[1rem_1fr] gap-3">
              <span
                className="mt-1 h-3 w-3 rounded-full border border-ink/40"
                style={{ backgroundColor: branch.color }}
              />
              <p className="font-mono text-[0.74rem] font-black uppercase leading-[1.35] tracking-[0.11em] text-ink/74">
                {branch.label}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-7 border-t border-ink/20 pt-5">
          <p className="font-mono text-[0.82rem] font-black uppercase leading-5 tracking-[0.16em] text-privacy-violet">
            legal phrase line
          </p>
          <svg viewBox="0 0 315 150" className="mt-2 h-auto w-full overflow-visible" aria-label="Legal phrase line chart">
            <line x1="28" y1="112" x2="296" y2="112" stroke={INK} strokeOpacity="0.48" />
            <line x1="28" y1="22" x2="28" y2="112" stroke={INK} strokeOpacity="0.3" />
            <line x1="28" y1="22" x2="296" y2="22" stroke={INK} strokeOpacity="0.14" />
            {[1890, 1910, 1930, 1950].map((year) => {
              const x = 28 + ((year - START_YEAR) / (END_YEAR - START_YEAR)) * 268;
                return (
                  <g key={year}>
                    <line x1={x} y1="22" x2={x} y2="112" stroke={INK} strokeOpacity="0.12" />
                    <text
                      x={x}
                      y="135"
                      textAnchor="middle"
                      style={MONO_STYLE}
                      fontSize="10"
                      fontWeight="900"
                      fill={INK}
                      fillOpacity="0.64"
                    >
                      {year}
                    </text>
                  </g>
                );
              })}
            <text
              x="16"
              y="25"
              textAnchor="end"
              style={MONO_STYLE}
              fontSize="8.5"
              fontWeight="900"
              fill={INK}
              fillOpacity="0.45"
            >
              MAX
            </text>
            <text
              x="16"
              y="115"
              textAnchor="end"
              style={MONO_STYLE}
              fontSize="8.5"
              fontWeight="900"
              fill={INK}
              fillOpacity="0.45"
            >
              0
            </text>
            <path
              d={linePath(dataset.yearly_phrase_signal, 28, 296, 22, 112, maxLineValue)}
              fill="none"
              stroke={VIOLET}
              strokeWidth="3.3"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {dataset.yearly_phrase_signal
              .filter((point) => point.year % 10 === 0 || point.value === maxLineValue)
              .map((point) => {
                const progress = (point.year - START_YEAR) / (END_YEAR - START_YEAR);
                const x = 28 + progress * 268;
                const y = 112 - (point.value / (maxLineValue || 1)) * 90;
                return <circle key={point.year} cx={x} cy={y} r="2.8" fill={INK} fillOpacity="0.62" />;
              })}
          </svg>
          <p className="mt-2 font-mono text-[0.66rem] font-black uppercase leading-4 tracking-[0.08em] text-ink/50">
            max {compactNumber(maxLineValue)} per million
          </p>
        </div>
      </aside>

      <div className="min-w-0">
        <div className="min-w-0">
          <svg
            viewBox={`0 0 ${MATRIX_WIDTH} ${MATRIX_HEIGHT}`}
            role="img"
            aria-label="Privacy legal injury matrix from 1890 to 1950"
            className="h-auto w-full overflow-hidden"
          >
            <rect x="0" y="0" width={MATRIX_WIDTH} height={MATRIX_HEIGHT} fill="transparent" />

            <g>
              {dataset.branches.map((branch, index) => {
                const start = pointFor(START_YEAR, index);
                const end = pointFor(END_YEAR, index);
                return (
                  <g key={`${branch.branch_id}-row`}>
                    <line x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke={GRID} strokeOpacity="0.34" strokeWidth="1.15" />
                    <text
                      x="24"
                      y={start.y + 4}
                      textAnchor="start"
                      style={MONO_STYLE}
                      fontSize="13"
                      fontWeight="900"
                      letterSpacing="2.2"
                      fill={INK}
                      fillOpacity="0.56"
                    >
                      {branch.label.toUpperCase()}
                    </text>
                  </g>
                );
              })}

              {[1890, 1900, 1910, 1920, 1930, 1940, 1950].map((year) => {
                const start = pointFor(year, 0);
                const end = pointFor(year, dataset.branches.length - 1);
                const labelX = year === 1950 ? end.x - 10 : end.x + 18;
                return (
                  <g key={year}>
                    <line x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke={GRID} strokeOpacity="0.34" strokeWidth="1" />
                    <text
                      x={labelX}
                      y={end.y + 5}
                      textAnchor={year === 1950 ? "end" : "start"}
                      style={MONO_STYLE}
                      fontSize="15"
                      fontWeight="900"
                      letterSpacing="2"
                      fill={INK}
                      fillOpacity="0.7"
                    >
                      {year}
                    </text>
                  </g>
                );
              })}
            </g>

            <g>
              {dataset.matrix_nodes.map((node) => {
                const branch = branchById.get(node.branch_id);
                const branchIndex = branch?.index ?? 0;
                const point = adjustedPointForNode(node, branchIndex);
                const color = branch?.color ?? VIOLET;
                const isActive = activeNodeId === node.anchor_id;
                const labelSide = point.x > 755 ? -1 : 1;
                const leaderLength = node.strength >= 5 ? 88 : node.strength >= 4 ? 66 : 46;
                const labelX = point.x + labelSide * leaderLength;
                const labelY = point.y - 24 - branchIndex * 2.5;
                const showFullLabel = (node.strength >= 5 && node.year <= 1928) || node.year === 1903;
                const yearLabel = nodeYearLabelPosition(node, point, node.radius);

                return (
                  <g
                    key={node.anchor_id}
                    tabIndex={0}
                    role="button"
                    aria-label={`${node.year} ${node.label}`}
                    className="cursor-pointer outline-none"
                    onMouseEnter={() => setActiveNodeId(node.anchor_id)}
                    onFocus={() => setActiveNodeId(node.anchor_id)}
                  >
                    <line
                      x1={point.x}
                      y1={point.y}
                      x2={labelX}
                      y2={labelY}
                      stroke={INK}
                      strokeOpacity={isActive ? 0.62 : 0.22}
                      strokeWidth={isActive ? 1.55 : 1}
                    />
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r={node.radius + 18}
                      fill="transparent"
                    />
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r={node.radius}
                      fill={color}
                      fillOpacity={isActive ? 0.78 : 0.56}
                      stroke={INK}
                      strokeOpacity={isActive ? 0.8 : 0.55}
                      strokeWidth={isActive ? 1.8 : 1.2}
                    />
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r={Math.max(3, node.radius * 0.17)}
                      fill={INK}
                      fillOpacity="0.72"
                    />
                    {node.strength >= 4 || isActive ? (
                      <text
                        x={yearLabel.x}
                        y={yearLabel.y}
                        textAnchor={yearLabel.anchor}
                        style={MONO_STYLE}
                        fontSize="11"
                        fontWeight="900"
                        letterSpacing="1.2"
                        fill={INK}
                        fillOpacity={isActive ? 0.86 : 0.5}
                      >
                        {node.year}
                      </text>
                    ) : null}
                    {showFullLabel ? (
                      <text
                        x={labelX}
                        y={labelY - 8}
                        textAnchor={labelSide > 0 ? "start" : "end"}
                        style={MONO_STYLE}
                        fontSize={isActive ? 12.5 : 11}
                        fontWeight="900"
                        letterSpacing="1.6"
                        fill={isActive ? INK : GRID}
                        fillOpacity={isActive ? 0.9 : 0.58}
                      >
                        {shortNodeLabel(node)}
                      </text>
                    ) : null}
                  </g>
                );
              })}
            </g>

            <g transform="translate(0 620)">
              <text
                x="70"
                y="0"
                style={MONO_STYLE}
                fontSize="13"
                fontWeight="900"
                letterSpacing="2.4"
                fill={VIOLET}
              >
                LEGAL ANCHOR STRIP
              </text>
              <text
                x="690"
                y="0"
                textAnchor="end"
                style={MONO_STYLE}
                fontSize="9.5"
                fontWeight="900"
                letterSpacing="1.4"
                fill={INK}
                fillOpacity="0.48"
              >
                LINE CONNECTS BAR TOPS / NGRAM SIGNAL
              </text>
              <line x1="70" y1="62" x2="690" y2="62" stroke={INK} strokeOpacity="0.48" strokeWidth="1.25" />
              <line x1="70" y1="26" x2="690" y2="26" stroke={INK} strokeOpacity="0.1" strokeWidth="1" />
              {[1890, 1900, 1910, 1920, 1930, 1940].map((year) => {
                const x = stripXForYear(year);
                const nextX = stripXForYear(year + 10);
                return (
                  <rect
                    key={`strip-decade-${year}`}
                    x={x}
                    y="29"
                    width={nextX - x}
                    height="33"
                    fill={year % 20 === 0 ? INK : VIOLET}
                    fillOpacity={year % 20 === 0 ? 0.025 : 0.018}
                  />
                );
              })}
              {[1890, 1910, 1930, 1950].map((year) => {
                const x = stripXForYear(year);
                return (
                  <g key={`strip-year-${year}`}>
                    <line x1={x} y1="22" x2={x} y2="82" stroke={INK} strokeOpacity="0.14" />
                    <text
                      x={x}
                      y="102"
                      textAnchor="middle"
                      style={MONO_STYLE}
                      fontSize="10"
                      fontWeight="900"
                      fill={INK}
                      fillOpacity="0.62"
                    >
                      {year}
                    </text>
                  </g>
                );
              })}
              {dataset.yearly_phrase_signal.map((point) => {
                const x = stripXForYear(point.year);
                const height = stripSignalHeight(point.value, maxLineValue);
                return (
                  <rect
                    key={`strip-signal-${point.year}`}
                    x={x - 2.25}
                    y={62 - height}
                    width="3.8"
                    height={height}
                    fill={VIOLET}
                    fillOpacity={point.year % 5 === 0 ? 0.32 : 0.2}
                  />
                );
              })}
              <path
                d={stripTrendPath}
                fill="none"
                stroke={VIOLET}
                strokeOpacity="0.5"
                strokeWidth="2.1"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {dataset.matrix_nodes.map((node) => {
                const branch = branchById.get(node.branch_id);
                const x = stripXForYear(node.year);
                const height = 12 + node.strength * 5.2;
                return (
                  <g key={`strip-${node.anchor_id}`}>
                    <rect
                      x={x - 5}
                      y={62 - height}
                      width="10"
                      height={height}
                      fill={branch?.color ?? VIOLET}
                      fillOpacity="0.76"
                      stroke={INK}
                      strokeOpacity="0.48"
                      strokeWidth="0.9"
                    />
                    {node.strength >= 5 ? (
                      <circle cx={x} cy={62 - height - 6} r="2.8" fill={INK} fillOpacity="0.62" />
                    ) : null}
                  </g>
                );
              })}
              <g transform="translate(70 125)">
                <circle cx="0" cy="-3" r="2.4" fill={VIOLET} fillOpacity="0.55" />
                <text
                  x="10"
                  y="0"
                  style={MONO_STYLE}
                  fontSize="8"
                  fontWeight="900"
                  letterSpacing="0.8"
                  fill={INK}
                  fillOpacity="0.58"
                >
                  ANNUAL PHRASE SIGNAL
                </text>
                <rect x="176" y="-10" width="8" height="12" fill={VIOLET} fillOpacity="0.65" stroke={INK} strokeOpacity="0.4" />
                <text
                  x="192"
                  y="0"
                  style={MONO_STYLE}
                  fontSize="8"
                  fontWeight="900"
                  letterSpacing="0.8"
                  fill={INK}
                  fillOpacity="0.58"
                >
                  LEGAL ANCHOR
                </text>
              </g>
            </g>

            <text x="156" y="36" style={MONO_STYLE} fontSize="15" fontWeight="900" letterSpacing="2.6" fill={VIOLET}>
              FROM PRIVACY TO LEGAL INJURY / 1890-1950
            </text>
            <text x="156" y="61" style={MONO_STYLE} fontSize="12" fontWeight="900" letterSpacing="2" fill={INK} fillOpacity="0.58">
              X = YEAR / ROW = LEGAL BRANCH / BUBBLE = SOURCE STRENGTH
            </text>

            <g transform="translate(742 32)">
              <text x="0" y="0" style={MONO_STYLE} fontSize="13" fontWeight="900" letterSpacing="2.4" fill={VIOLET}>
                SCALE
              </text>
              {dataset.scale.map((item, index) => {
                const x = 24 + index * 76;
                const y = 62;
                return (
                  <g key={`scale-${item.label}`}>
                    <circle
                      cx={x}
                      cy={y}
                      r={item.radius * 0.82}
                      fill={RUST}
                      fillOpacity={0.42 + index * 0.12}
                      stroke={INK}
                      strokeOpacity="0.58"
                      strokeWidth="1"
                    />
                    <text
                      x={x}
                      y={20}
                      textAnchor="middle"
                      style={MONO_STYLE}
                      fontSize="10"
                      fontWeight="900"
                      fill={INK}
                    >
                      {item.strength}
                    </text>
                    <text
                      x={x}
                      y={104}
                      textAnchor="middle"
                      style={MONO_STYLE}
                      fontSize="8"
                      fontWeight="900"
                      letterSpacing="0.7"
                      fill={INK}
                      fillOpacity="0.54"
                    >
                      {item.label.split(" ")[0].toUpperCase()}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>
        </div>

      </div>
    </div>
  );
}
