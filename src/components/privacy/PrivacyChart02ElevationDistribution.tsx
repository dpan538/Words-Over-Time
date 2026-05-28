"use client";

import { useMemo, useState } from "react";

type QueryCount = {
  query: string;
  count: number;
};

export type PrivacyGeoElevationPoint = {
  id: string;
  city: string;
  region: string | null;
  country: string;
  country_code: string | null;
  latitude: number;
  longitude: number;
  elevation_meters: number;
  record_count: number;
  log_signal: number;
  signal_deviation: number;
  band_id: string;
  top_queries: QueryCount[];
  notes: string[];
};

type PrivacyGeoElevationBand = {
  band_id: string;
  label: string;
  min_m: number | null;
  max_m: number | null;
  point_count: number;
  record_count: number;
  mean_log_signal: number;
  median_log_signal: number;
  relative_to_global_mean: number | null;
  top_places: Array<{
    city: string;
    country: string;
    elevation_meters: number;
    record_count: number;
  }>;
};

export type PrivacyGeoElevationDataset = {
  word: "privacy";
  layer_id: "geo_elevation_distribution";
  status: string;
  intended_use: string;
  title: string;
  description: string;
  statistics: {
    point_count: number;
    elevation_point_count: number;
    record_count_total: number;
    elevation_min_m: number;
    elevation_max_m: number;
    mean_log_signal: number;
    median_elevation_m: number;
    q1_elevation_m: number;
    q3_elevation_m: number;
    source_total_records: number;
    google_trends_available: boolean;
  };
  points: PrivacyGeoElevationPoint[];
  bands: PrivacyGeoElevationBand[];
  annotations: Array<{
    annotation_id: string;
    point_id: string;
    label: string;
    description: string;
  }>;
  strong_signals: string[];
  limitations: string[];
};

type PrivacyChart02ElevationDistributionProps = {
  dataset: PrivacyGeoElevationDataset;
};

type PlotPoint = PrivacyGeoElevationPoint & {
  x: number;
  y: number;
  baselineY: number;
  color: string;
  size: number;
};

type BandSegment = PrivacyGeoElevationBand & {
  x0: number;
  x1: number;
  width: number;
};

const WIDTH = 1680;
const HEIGHT = 780;
const PLOT = {
  left: 145,
  right: 1535,
  top: 148,
  baseline: 390,
  bottom: 560,
};
const BAND_GAP = 34;
const MIN_BAND_WIDTH = 170;

const INK = "#050510";
const GRID = "#686255";
const COOL = "#238eaa";
const LOW = "#a8914d";
const WARM = "#e2b900";
const HOT = "#c73a2b";
const VIOLET = "#6F3AA6";

const GRID_LINES = [
  PLOT.top,
  PLOT.top + (PLOT.baseline - PLOT.top) * 0.5,
  PLOT.baseline,
  PLOT.baseline + (PLOT.bottom - PLOT.baseline) * 0.5,
  PLOT.bottom,
];

const yScale = (deviation: number) => {
  if (deviation >= 0) {
    const clamped = Math.min(deviation, 3.25);
    return PLOT.baseline - (clamped / 3.25) * (PLOT.baseline - PLOT.top);
  }
  const clamped = Math.min(Math.abs(deviation), 1.65);
  return PLOT.baseline + (clamped / 1.65) * (PLOT.bottom - PLOT.baseline);
};

const pointColor = (deviation: number) => {
  if (deviation >= 1.6) return HOT;
  if (deviation >= 0.45) return WARM;
  if (deviation <= -0.45) return COOL;
  return LOW;
};

const pointSize = (recordCount: number) => {
  if (recordCount >= 1000) return 9.6;
  if (recordCount >= 400) return 8.3;
  if (recordCount >= 200) return 7.1;
  return 6.2;
};

const formatElevation = (value: number) => `${Math.round(value).toLocaleString()}m`;

const stableNoise = (value: string) => {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) % 1000003;
  }
  return hash / 1000003;
};

const createBandSegments = (bands: PrivacyGeoElevationBand[]) => {
  const activeBands = bands.filter((band) => band.point_count > 0);
  const totalWeight = activeBands.reduce((sum, band) => sum + Math.pow(band.point_count, 0.74), 0);
  const usableWidth = PLOT.right - PLOT.left - BAND_GAP * Math.max(0, activeBands.length - 1);
  const minWidth = Math.min(MIN_BAND_WIDTH, usableWidth / Math.max(activeBands.length, 1));
  const weightedWidth = Math.max(0, usableWidth - minWidth * activeBands.length);
  let cursor = PLOT.left;

  return activeBands.map((band) => {
    const width = minWidth + weightedWidth * (Math.pow(band.point_count, 0.74) / totalWeight);
    const segment = { ...band, x0: cursor, x1: cursor + width, width };
    cursor += width + BAND_GAP;
    return segment;
  });
};

export function PrivacyChart02ElevationDistribution({ dataset }: PrivacyChart02ElevationDistributionProps) {
  const bandSegments = useMemo<BandSegment[]>(() => createBandSegments(dataset.bands), [dataset.bands]);

  const plotted = useMemo<PlotPoint[]>(() => {
    const byBand = new Map<string, PrivacyGeoElevationPoint[]>();
    dataset.points.forEach((point) => {
      const items = byBand.get(point.band_id) ?? [];
      items.push(point);
      byBand.set(point.band_id, items);
    });

    return bandSegments.flatMap((segment) => {
      const points = [...(byBand.get(segment.band_id) ?? [])].sort(
        (a, b) => a.elevation_meters - b.elevation_meters || b.record_count - a.record_count,
      );
      return points.map((point, index) => {
        const count = Math.max(points.length - 1, 1);
        const densityPosition = points.length === 1 ? 0.5 : index / count;
        const noise = stableNoise(`${point.id}-${point.city}`);
        const wave = Math.sin(index * 1.74 + segment.x0 * 0.01) * 0.018;
        const jitter = (noise - 0.5) * 0.042;
        const x = segment.x0 + Math.min(0.985, Math.max(0.015, densityPosition + wave + jitter)) * segment.width;

        return {
          ...point,
          x,
          y: yScale(point.signal_deviation),
          baselineY: PLOT.baseline,
          color: pointColor(point.signal_deviation),
          size: pointSize(point.record_count),
        };
      });
    });
  }, [bandSegments, dataset.points]);

  const [selectedId, setSelectedId] = useState<string>(dataset.points[0]?.id ?? "");
  const selected = plotted.find((point) => point.id === selectedId) ?? plotted[0];
  const strongest = [...plotted].sort((a, b) => b.record_count - a.record_count).slice(0, 4);
  const highElevation = [...plotted].sort((a, b) => b.elevation_meters - a.elevation_meters).slice(0, 3);
  const cityLabelLayout = (point: PlotPoint, index: number) => {
    const baseX = Math.min(PLOT.right - 72, Math.max(PLOT.left + 72, point.x));
    const key = point.city.toLowerCase();
    const offsets: Record<string, { x: number; y: number }> = {
      seattle: { x: -36, y: 54 },
      cambridge: { x: -8, y: 92 },
      london: { x: 18, y: 70 },
      oxford: { x: 46, y: 112 },
    };
    const fallback = { x: (index - 1.5) * 26, y: 78 + index * 18 };
    const offset = offsets[key] ?? fallback;
    return {
      labelX: Math.min(PLOT.right - 72, Math.max(PLOT.left + 72, baseX + offset.x)),
      labelY: offset.y,
    };
  };

  return (
    <div className="border-y border-ink/70">
      <div className="grid gap-6 border-b border-ink/25 px-4 py-5 lg:grid-cols-[minmax(0,1fr)_21rem] lg:px-6">
        <div>
          <p className="font-mono text-[0.98rem] font-black uppercase leading-6 tracking-[0.18em] text-privacy-violet">
            altitude distribution / recovered signal
          </p>
          <p className="mt-2 max-w-[980px] text-[1.1rem] font-bold leading-7 text-ink/78">
            Each vertical stem is one recovered city point. Height shows privacy signal above or below the layer
            average; x-position is grouped by elevation band and expanded by sample density.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-3 font-mono text-[0.86rem] font-black uppercase tracking-[0.14em]">
          <div>
            <p className="text-privacy-violet">city points</p>
            <p className="mt-1 text-[1.12rem] text-ink">{dataset.statistics.point_count}</p>
          </div>
          <div>
            <p className="text-privacy-violet">records</p>
            <p className="mt-1 text-[1.12rem] text-ink">{dataset.statistics.record_count_total.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-privacy-violet">median altitude</p>
            <p className="mt-1 text-[1.12rem] text-ink">{formatElevation(dataset.statistics.median_elevation_m)}</p>
          </div>
          <div>
            <p className="text-privacy-violet">highest point</p>
            <p className="mt-1 text-[1.12rem] text-ink">{formatElevation(dataset.statistics.elevation_max_m)}</p>
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden bg-wheat">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          role="img"
          aria-label="Privacy recovered signal compared with elevation distribution"
          className="block h-[620px] w-full sm:h-[700px] xl:h-[750px]"
        >
          <rect width={WIDTH} height={HEIGHT} fill="#F7F0DC" />

          {GRID_LINES.map((y, index) => (
            <line
              key={`grid-y-${index}`}
              x1={PLOT.left}
              x2={PLOT.right}
              y1={y}
              y2={y}
              stroke={GRID}
              strokeOpacity={index === 2 ? 0.72 : 0.24}
              strokeWidth={index === 2 ? 1.9 : 1}
            />
          ))}

          {bandSegments.map((segment) => {
            return (
              <g key={`segment-${segment.band_id}`}>
                <rect
                  x={segment.x0}
                  y={PLOT.top - 42}
                  width={segment.width}
                  height={PLOT.bottom - PLOT.top + 84}
                  fill={INK}
                  opacity={0.018}
                />
                <line
                  x1={segment.x0}
                  x2={segment.x0}
                  y1={PLOT.top - 16}
                  y2={PLOT.bottom + 28}
                  stroke={GRID}
                  strokeOpacity={0.22}
                />
                <line
                  x1={segment.x1}
                  x2={segment.x1}
                  y1={PLOT.top - 16}
                  y2={PLOT.bottom + 28}
                  stroke={GRID}
                  strokeOpacity={0.14}
                />
                <text
                  x={(segment.x0 + segment.x1) / 2}
                  y={PLOT.bottom + 66}
                  textAnchor="middle"
                  fill={INK}
                  opacity={0.62}
                  fontFamily="var(--font-geist-mono), monospace"
                  fontSize={21}
                  fontWeight={900}
                >
                  {segment.label}
                </text>
                <text
                  x={(segment.x0 + segment.x1) / 2}
                  y={PLOT.bottom + 92}
                  textAnchor="middle"
                  fill={INK}
                  opacity={0.45}
                  fontFamily="var(--font-geist-mono), monospace"
                  fontSize={13}
                  fontWeight={900}
                >
                  {segment.point_count} points / density-expanded
                </text>
              </g>
            );
          })}

          <text
            x={PLOT.left - 38}
            y={PLOT.top + 8}
            textAnchor="end"
            fill={INK}
            fontFamily="var(--font-geist-mono), monospace"
            fontSize={20}
            fontWeight={900}
          >
            above avg
          </text>
          <text
            x={PLOT.left - 38}
            y={PLOT.baseline + 7}
            textAnchor="end"
            fill={INK}
            fillOpacity={0.82}
            fontFamily="var(--font-geist-mono), monospace"
            fontSize={20}
            fontWeight={900}
          >
            mean
          </text>
          <text
            x={PLOT.left - 38}
            y={PLOT.bottom + 7}
            textAnchor="end"
            fill={INK}
            fillOpacity={0.72}
            fontFamily="var(--font-geist-mono), monospace"
            fontSize={20}
            fontWeight={900}
          >
            below avg
          </text>

          {plotted.map((point) => (
            <g
              key={point.id}
              onMouseEnter={() => setSelectedId(point.id)}
              onFocus={() => setSelectedId(point.id)}
              tabIndex={0}
              className="cursor-crosshair outline-none"
            >
              <line
                x1={point.x}
                x2={point.x}
                y1={point.baselineY}
                y2={point.y}
                stroke={INK}
                strokeOpacity={selected?.id === point.id ? 0.82 : 0.36}
                strokeWidth={selected?.id === point.id ? 2 : 1.15}
              />
              <rect
                x={point.x - point.size / 2}
                y={point.y - point.size / 2}
                width={point.size}
                height={point.size}
                fill={point.color}
                stroke={selected?.id === point.id ? INK : point.color}
                strokeWidth={selected?.id === point.id ? 2 : 1}
              />
              {Array.from({ length: Math.min(4, Math.max(1, Math.round(Math.log10(point.record_count + 10)))) }).map(
                (_, beadIndex) => (
                  <rect
                    key={`${point.id}-bead-${beadIndex}`}
                    x={point.x - 2.1}
                    y={PLOT.baseline + 15 + beadIndex * 9}
                    width={4.2}
                    height={4.2}
                    fill={point.color}
                    opacity={0.42}
                  />
                ),
              )}
              <rect x={point.x - 9} y={Math.min(point.y, point.baselineY) - 12} width={18} height={Math.abs(point.y - point.baselineY) + 24} fill="transparent" />
            </g>
          ))}

          {strongest.map((point, index) => {
            const { labelX, labelY } = cityLabelLayout(point, index);
            const elbowY = labelY + 22;
            return (
              <g key={`strong-${point.id}`} pointerEvents="none">
                <path
                  d={`M ${point.x} ${point.y - 9} L ${point.x} ${elbowY} L ${labelX} ${elbowY}`}
                  stroke={INK}
                  strokeOpacity={0.44}
                  strokeWidth={1.25}
                  fill="none"
                />
                <text
                  x={labelX}
                  y={labelY}
                  textAnchor="middle"
                  fill={INK}
                  fillOpacity={0.86}
                  fontFamily="var(--font-geist-mono), monospace"
                  fontSize={18}
                  fontWeight={900}
                >
                  {point.city}
                </text>
              </g>
            );
          })}

          {highElevation.map((point, index) => (
            <g key={`high-${point.id}`} pointerEvents="none">
              <text
                x={Math.min(point.x + 18, PLOT.right - 140)}
                y={point.y + 24 + index * 12}
                fill={INK}
                fillOpacity={0.7}
                fontFamily="var(--font-geist-mono), monospace"
                fontSize={17}
                fontWeight={900}
              >
                {formatElevation(point.elevation_meters)}
              </text>
            </g>
          ))}

          <g transform={`translate(${PLOT.left}, 690)`}>
            {bandSegments
              .map((band, index) => {
                const slotWidth = (PLOT.right - PLOT.left) / bandSegments.length;
                const x = index * slotWidth;
                const width = Math.max(150, slotWidth - 34);
                const rel = band.relative_to_global_mean ?? 0;
                const color = pointColor(rel);
                return (
                  <g key={band.band_id} transform={`translate(${x}, 0)`}>
                    <line x1={0} x2={width} y1={0} y2={0} stroke={INK} strokeOpacity={0.24} />
                    <rect x={0} y={10} width={Math.max(18, Math.min(width, band.point_count * 3.2))} height={10} fill={color} opacity={0.82} />
                    <text
                      x={0}
                      y={42}
                      fill={INK}
                      fontFamily="var(--font-geist-mono), monospace"
                      fontSize={15}
                      fontWeight={900}
                    >
                      {band.label}
                    </text>
                    <text
                      x={0}
                      y={66}
                      fill={INK}
                      fillOpacity={0.72}
                      fontFamily="var(--font-geist-mono), monospace"
                      fontSize={14}
                      fontWeight={900}
                    >
                      {band.point_count} points / {band.record_count.toLocaleString()} records
                    </text>
                  </g>
                );
              })}
          </g>
        </svg>
      </div>

      <div className="grid min-h-[190px] gap-6 border-t border-ink/30 px-4 py-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1fr)] lg:px-6">
        <div>
          <p className="font-mono text-[0.94rem] font-black uppercase tracking-[0.16em] text-privacy-violet">
            selected point
          </p>
          <h4 className="mt-2 text-[1.45rem] font-black leading-tight text-ink">
            {selected?.city}, {selected?.country}
          </h4>
          <p className="mt-2 font-mono text-[1.02rem] font-black uppercase leading-6 tracking-[0.1em] text-ink/78">
            {selected ? `${formatElevation(selected.elevation_meters)} / ${selected.record_count.toLocaleString()} recovered records` : "No point selected"}
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <p className="max-w-[620px] text-[1.1rem] leading-7 text-ink/78">
            The chart compares recovered privacy signal with altitude. Most strong signals sit in low-elevation city
            and institution clusters; higher places appear as useful counterpoints.
          </p>
          <p className="font-mono text-[0.94rem] font-black leading-6 tracking-[0.04em] text-ink/68">
            Altitude is spatial context, not a causal answer. This layer holds a macro pattern; the next comparison
            connects privacy signal with population and life expectancy without forcing a fit.
          </p>
        </div>
      </div>
    </div>
  );
}
