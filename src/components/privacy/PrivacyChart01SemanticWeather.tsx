"use client";

import { useState } from "react";

type WeatherPeriod = {
  period_id: string;
  label: string;
  start_year: number;
  end_year: number;
  angle_start_degrees: number;
  angle_end_degrees: number;
  interpretation: string;
  data_basis: string;
};

type WeatherTrack = {
  track_id: string;
  label: string;
  visual_role: string;
  color: string;
  terms: string[];
  context_terms?: string[];
};

type WeatherPoint = {
  point_id: string;
  period_id: string;
  track_id: string;
  term: string;
  angle_degrees: number;
  radius: number;
  size: number;
  opacity: number;
  value?: number;
};

type WeatherThreshold = {
  year: number;
  label: string;
  angle_degrees: number;
  description: string;
  confidence: string;
};

type PeriodTrackScore = {
  period_id: string;
  track_id: string;
  raw_score: number;
  normalized_score: number;
  evidence_count: number;
  top_terms: {
    term: string;
    mean_frequency_per_million: number;
  }[];
  data_quality: string;
  notes: string;
};

export type PrivacySemanticWeatherDataset = {
  word: "privacy";
  layer_id: "pre_modern_semantic_weather";
  title: string;
  generated_at: string;
  periods: WeatherPeriod[];
  tracks: WeatherTrack[];
  period_track_scores: PeriodTrackScore[];
  weather_points: WeatherPoint[];
  thresholds: WeatherThreshold[];
  content_plan: {
    hero_title: string;
    hero_tagline: string;
    hero_terms: string[];
    chart01_title: string;
    chart01_intro: string;
    homepage_hover_label: string;
    recommended_hover_color: string;
  };
  limitations: string[];
};

type PrivacyChart01SemanticWeatherProps = {
  dataset: PrivacySemanticWeatherDataset;
};

type TextAnchor = "start" | "middle" | "end";

type CircleSample = {
  id: string;
  angle: number;
  radius: number;
  size: number;
  fill: string;
  fillOpacity: number;
  strokeOpacity: number;
  strokeWidth: number;
};

type EvidenceBarSample = {
  id: string;
  angle: number;
  innerRadius: number;
  outerRadius: number;
  width: number;
  opacity: number;
  periodLabel: string;
  term: string;
  value: number;
};

const SVG_SIZE = 1200;
const CENTER = SVG_SIZE / 2;
const WEATHER_RADIUS = 405;
const VIEWBOX_OFFSET = 76;
const VIEWBOX_SIZE = 1048;
const DATA_ARC_START = -92;
const DATA_ARC_END = 268;
const VISUAL_ARC_START = -88;
const VISUAL_ARC_END = 264;
const INK = "#050510";
const GRID = "#2f291d";
const GOLD = "#f0c300";
const GREEN = "#168f4e";
const BLUE = "#0b94bd";
const VIOLET = "#8430c9";
const MONO_STYLE = { fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" };

function roundSvg(value: number, precision = 3) {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}

function polarToCartesian(angleDegrees: number, radiusRatio: number) {
  const angle = ((angleDegrees - 90) * Math.PI) / 180;
  const radius = radiusRatio * WEATHER_RADIUS;
  return {
    x: roundSvg(CENTER + Math.cos(angle) * radius),
    y: roundSvg(CENTER + Math.sin(angle) * radius),
  };
}

function arcPath(startAngle: number, endAngle: number, radiusRatio: number) {
  const start = polarToCartesian(startAngle, radiusRatio);
  const end = polarToCartesian(endAngle, radiusRatio);
  const largeArcFlag = Math.abs(endAngle - startAngle) > 180 ? 1 : 0;
  const radius = roundSvg(radiusRatio * WEATHER_RADIUS);
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
}

function sectorPath(startAngle: number, endAngle: number, innerRadius: number, outerRadius: number) {
  const outerStart = polarToCartesian(startAngle, outerRadius);
  const outerEnd = polarToCartesian(endAngle, outerRadius);
  const innerEnd = polarToCartesian(endAngle, innerRadius);
  const innerStart = polarToCartesian(startAngle, innerRadius);
  const largeArcFlag = Math.abs(endAngle - startAngle) > 180 ? 1 : 0;

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${roundSvg(outerRadius * WEATHER_RADIUS)} ${roundSvg(outerRadius * WEATHER_RADIUS)} 0 ${largeArcFlag} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${roundSvg(innerRadius * WEATHER_RADIUS)} ${roundSvg(innerRadius * WEATHER_RADIUS)} 0 ${largeArcFlag} 0 ${innerStart.x} ${innerStart.y}`,
    "Z",
  ].join(" ");
}

function hashUnit(seed: number) {
  let hash = Math.round(seed * 1000) | 0;
  hash ^= hash << 13;
  hash ^= hash >>> 17;
  hash ^= hash << 5;
  return ((hash >>> 0) % 10000) / 10000;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function visualAngle(sourceAngle: number) {
  const progress = (sourceAngle - DATA_ARC_START) / (DATA_ARC_END - DATA_ARC_START);
  return VISUAL_ARC_START + progress * (VISUAL_ARC_END - VISUAL_ARC_START);
}

function labelPosition(angleDegrees: number, radiusRatio: number) {
  const point = polarToCartesian(angleDegrees, radiusRatio);
  const normalized = ((angleDegrees % 360) + 360) % 360;
  let anchor: TextAnchor = "middle";

  if (normalized > 18 && normalized < 168) {
    anchor = "start";
  } else if (normalized > 192 && normalized < 342) {
    anchor = "end";
  }

  return { ...point, anchor };
}

function scoreFor(dataset: PrivacySemanticWeatherDataset, periodId: string, trackId: string) {
  return dataset.period_track_scores.find((score) => score.period_id === periodId && score.track_id === trackId);
}

function boundaryScore(periodId: string) {
  const scores: Record<string, number> = {
    root_field: 0.08,
    seclusion_secret: 0.18,
    public_private: 0.78,
    intrusion_threshold: 0.58,
  };

  return scores[periodId] ?? 0.18;
}

function periodMidAngle(period: WeatherPeriod) {
  return (period.angle_start_degrees + period.angle_end_degrees) / 2;
}

function evidenceCircleSeries({
  period,
  trackId,
  score,
  evidenceCount,
  periodIndex,
  fill,
  bandCenter,
  bandLift,
  baseCount,
  maxCount,
  minSize,
  maxSize,
  seed,
}: {
  period: WeatherPeriod;
  trackId: string;
  score: number;
  evidenceCount: number;
  periodIndex: number;
  fill: string;
  bandCenter: number;
  bandLift: number;
  baseCount: number;
  maxCount: number;
  minSize: number;
  maxSize: number;
  seed: number;
}): CircleSample[] {
  const count = Math.round(baseCount + score * maxCount + Math.min(evidenceCount, 8) * 0.9);
  const start = period.angle_start_degrees + 5;
  const end = period.angle_end_degrees - 5;
  const span = end - start;

  return Array.from({ length: count }, (_, index) => {
    const progress = count === 1 ? 0.5 : index / (count - 1);
    const angleGrid = start + span * progress;
    const angleJitter = (hashUnit(seed + periodIndex * 19 + index * 2.7) - 0.5) * (2.2 + score * 3.2);
    const radialWave = (hashUnit(seed + periodIndex * 29 + index * 6.7) - 0.5) * 0.05;
    const radialJitter = (hashUnit(seed + periodIndex * 23 + index * 4.1) - 0.5) * (0.04 + score * 0.055);
    const radius = roundSvg(clamp(bandCenter + bandLift * score + radialWave + radialJitter, 0.28, 1.02), 4);
    const sizeNoise = hashUnit(seed + periodIndex * 31 + index * 5.3);

    return {
      id: `${trackId}-${period.period_id}-${index}`,
      angle: roundSvg(angleGrid + angleJitter, 4),
      radius,
      size: roundSvg(minSize + score * (maxSize - minSize) * 0.68 + sizeNoise * (maxSize - minSize) * 0.42, 3),
      fill,
      fillOpacity: roundSvg(0.3 + score * 0.2, 4),
      strokeOpacity: roundSvg(0.58 + score * 0.2, 4),
      strokeWidth: roundSvg(1.25 + score * 0.55, 3),
    };
  });
}

function pressureScoreForAngle(dataset: PrivacySemanticWeatherDataset, angle: number) {
  const period = dataset.periods.find(
    (item) => angle >= item.angle_start_degrees && angle <= item.angle_end_degrees,
  );

  if (!period) {
    return 0.18;
  }

  const raw = scoreFor(dataset, period.period_id, "publicity_observation_pressure")?.normalized_score ?? 0;
  const localProgress =
    (angle - period.angle_start_degrees) / (period.angle_end_degrees - period.angle_start_degrees || 1);

  if (period.period_id === "intrusion_threshold") {
    return clamp(0.28 + localProgress * 0.62 + raw * 0.25, 0.25, 1);
  }

  if (period.period_id === "seclusion_secret") {
    return clamp(0.2 + raw * 0.35, 0.16, 0.42);
  }

  if (period.period_id === "public_private") {
    return clamp(0.14 + localProgress * 0.18 + raw * 0.2, 0.12, 0.38);
  }

  return clamp(0.08 + localProgress * 0.08 + raw * 0.16, 0.06, 0.22);
}

function radialBarPolygon(angleDegrees: number, innerRadius: number, outerRadius: number, width: number) {
  const angle = ((angleDegrees - 90) * Math.PI) / 180;
  const ux = Math.cos(angle);
  const uy = Math.sin(angle);
  const tx = -uy;
  const ty = ux;
  const halfWidth = width / 2;
  const inner = {
    x: CENTER + ux * innerRadius * WEATHER_RADIUS,
    y: CENTER + uy * innerRadius * WEATHER_RADIUS,
  };
  const outer = {
    x: CENTER + ux * outerRadius * WEATHER_RADIUS,
    y: CENTER + uy * outerRadius * WEATHER_RADIUS,
  };

  return [
    `${roundSvg(inner.x + tx * halfWidth)},${roundSvg(inner.y + ty * halfWidth)}`,
    `${roundSvg(outer.x + tx * halfWidth)},${roundSvg(outer.y + ty * halfWidth)}`,
    `${roundSvg(outer.x - tx * halfWidth)},${roundSvg(outer.y - ty * halfWidth)}`,
    `${roundSvg(inner.x - tx * halfWidth)},${roundSvg(inner.y - ty * halfWidth)}`,
  ].join(" ");
}

function evidenceBars(dataset: PrivacySemanticWeatherDataset): EvidenceBarSample[] {
  return dataset.periods.flatMap((period, periodIndex) => {
    const score = scoreFor(dataset, period.period_id, "publicity_observation_pressure");
    const normalized = score?.normalized_score ?? 0;
    const terms =
      score?.top_terms?.length
        ? score.top_terms
        : [
            { term: "publicity", mean_frequency_per_million: 0 },
            { term: "observation", mean_frequency_per_million: 0 },
            { term: "intrusion", mean_frequency_per_million: 0 },
          ];
    const count = Math.round(5 + normalized * 24 + (period.period_id === "intrusion_threshold" ? 12 : 0));
    const start = period.angle_start_degrees + 3;
    const end = period.angle_end_degrees - 3;
    const span = end - start;

    return Array.from({ length: count }, (_, index) => {
      const progress = count === 1 ? 0.5 : index / (count - 1);
      const angle = roundSvg(start + span * progress + (hashUnit(201 + periodIndex * 37 + index * 2.1) - 0.5) * 3.8, 4);
      const localPressure = pressureScoreForAngle(dataset, angle);
      const length = roundSvg(0.11 + localPressure * 0.22 + hashUnit(211 + periodIndex * 31 + index * 4.2) * 0.1, 4);
      const innerRadius = clamp(
        0.53 + localPressure * 0.13 + (hashUnit(223 + periodIndex * 23 + index * 3.4) - 0.5) * 0.18,
        0.36,
        0.95,
      );
      const outerRadius = clamp(innerRadius + length, 0.54, 1.12);
      const term = terms[index % terms.length];

      return {
        id: `privacy-pressure-evidence-${period.period_id}-${index}`,
        angle,
        innerRadius: roundSvg(innerRadius, 4),
        outerRadius: roundSvg(outerRadius, 4),
        width: roundSvg(1.5 + localPressure * 2.2 + hashUnit(241 + index * 5.3) * 1.3, 3),
        opacity: roundSvg(0.4 + localPressure * 0.34, 4),
        periodLabel: `${period.start_year}-${period.end_year} ${period.label}`,
        term: term.term,
        value: term.mean_frequency_per_million,
      };
    });
  });
}

function calloutLine(angle: number, inner: number, outer: number) {
  const start = polarToCartesian(angle, inner);
  const end = polarToCartesian(angle, outer);
  return { start, end };
}

export function PrivacyChart01SemanticWeather({ dataset }: PrivacyChart01SemanticWeatherProps) {
  const threshold = dataset.thresholds[0];
  const pressureEvidenceBars = evidenceBars(dataset);
  const [activeEvidence, setActiveEvidence] = useState<EvidenceBarSample | null>(null);
  const visualPeriods = dataset.periods.map((period) => ({
    ...period,
    angle_start_degrees: visualAngle(period.angle_start_degrees),
    angle_end_degrees: visualAngle(period.angle_end_degrees),
  }));
  const periodLabels = visualPeriods.map((period) => ({
    ...period,
    midAngle: periodMidAngle(period),
  }));

  const seclusionCircles = visualPeriods.flatMap((period, periodIndex) => {
    const score = scoreFor(dataset, period.period_id, "seclusion_private_life");
    return evidenceCircleSeries({
      period,
      trackId: "seclusion_private_life",
      score: score?.normalized_score ?? 0,
      evidenceCount: score?.evidence_count ?? 0,
      periodIndex,
      fill: GOLD,
      bandCenter: 0.75,
      bandLift: 0.17,
      baseCount: 5,
      maxCount: 30,
      minSize: 13,
      maxSize: 44,
      seed: 17,
    });
  });

  const secrecyCircles = visualPeriods.flatMap((period, periodIndex) => {
    const score = scoreFor(dataset, period.period_id, "secrecy_confidentiality");
    return evidenceCircleSeries({
      period,
      trackId: "secrecy_confidentiality",
      score: score?.normalized_score ?? 0,
      evidenceCount: score?.evidence_count ?? 0,
      periodIndex,
      fill: GREEN,
      bandCenter: 0.48,
      bandLift: 0.18,
      baseCount: 8,
      maxCount: 23,
      minSize: 6,
      maxSize: 24,
      seed: 41,
    });
  });

  const boundaryCircles = visualPeriods.flatMap((period, periodIndex) =>
    evidenceCircleSeries({
      period,
      trackId: "public_private_boundary",
      score: boundaryScore(period.period_id),
      evidenceCount: period.period_id === "public_private" ? 5 : 1,
      periodIndex,
      fill: BLUE,
      bandCenter: 0.54,
      bandLift: 0.15,
      baseCount: 2,
      maxCount: 19,
      minSize: 8,
      maxSize: 32,
      seed: 73,
    }),
  );

  const yearTicks = [
    { year: 1200, angle: visualPeriods[0]?.angle_start_degrees ?? VISUAL_ARC_START },
    ...visualPeriods.map((period) => ({ year: period.end_year, angle: period.angle_end_degrees })),
  ];

  return (
    <div className="overflow-visible">
      <div className="grid items-start gap-6 xl:grid-cols-[20rem_minmax(0,1fr)]">
        <aside
          aria-live="polite"
          className="min-h-[8rem] border-l-2 border-ink/45 pl-4 pt-3 xl:mt-[50px]"
        >
          {activeEvidence ? (
            <>
              <p className="break-words font-mono text-[1.05rem] font-black uppercase leading-[1.15] tracking-[0.12em] text-ink">
                {activeEvidence.term}
              </p>
              <p className="mt-4 font-mono text-[0.92rem] font-black leading-[1.35] text-ink/78">
                {activeEvidence.periodLabel}
              </p>
              <p className="mt-2 font-mono text-[0.86rem] font-black leading-[1.35] text-ink/62">
                {activeEvidence.value.toFixed(4)} per million
              </p>
            </>
          ) : (
            <>
              <p className="font-mono text-[0.74rem] font-black uppercase leading-5 tracking-[0.16em] text-privacy-violet">
                evidence hover
              </p>
              <p className="mt-3 max-w-[17rem] text-[0.92rem] leading-6 text-ink/58">
                Move across a purple evidence tick to read the term, period, and frequency signal.
              </p>
            </>
          )}
          <div className="mt-8 space-y-4">
            {[
              { label: "outer gold band", detail: "seclusion-private life", color: GOLD },
              { label: "middle green band", detail: "secrecy-confidentiality", color: GREEN },
              { label: "blue band", detail: "public-private boundary", color: BLUE },
              { label: "purple evidence ticks", detail: "hoverable pressure evidence", color: VIOLET },
            ].map((item) => (
              <div key={item.label} className="grid grid-cols-[1rem_1fr] gap-3">
                <span
                  className="mt-1 h-3 w-3 rounded-full border border-ink/35"
                  style={{ backgroundColor: item.color }}
                />
                <p className="font-mono text-[0.73rem] font-black uppercase leading-[1.38] tracking-[0.12em] text-ink/70">
                  {item.label}
                  <br />
                  <span className="text-ink/52">{item.detail}</span>
                </p>
              </div>
            ))}
          </div>
          <p className="mt-8 max-w-[17rem] font-mono text-[0.75rem] font-black uppercase leading-5 tracking-[0.12em] text-ink/56">
            privacy semantic weather / 1200-1890, plotted as structured evidence bands
          </p>
          <div className="mt-8 border-t border-ink/20 pt-5">
            <p className="font-mono text-[0.74rem] font-black uppercase leading-5 tracking-[0.16em] text-privacy-violet/80">
              chart note
            </p>
            <p className="mt-3 max-w-[18rem] text-[0.92rem] leading-6 text-ink/62">
              The 1890 marker is a threshold, not an origin. The chart reads the centuries before it as a slow
              semantic climate: privacy is already forming around seclusion and private life, while publicity and
              intrusion pressure are only beginning to gather force.
            </p>
          </div>
        </aside>

        <div className="relative -mt-6 mx-auto aspect-square w-full max-w-[1040px] overflow-visible">
          <svg
            viewBox={`${VIEWBOX_OFFSET} ${VIEWBOX_OFFSET} ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}
            role="img"
            aria-label="Geometric semantic weather diagram for privacy before the legal-rights threshold"
            className="h-full w-full overflow-visible"
            overflow="visible"
          >
          <style>
            {`
              @media (prefers-reduced-motion: no-preference) {
                .privacy-breathe {
                  transform-box: fill-box;
                  transform-origin: center;
                  animation: privacy-breathe 5.8s ease-in-out infinite;
                }

                .privacy-evidence-bar {
                  transform-box: fill-box;
                  transform-origin: center;
                  animation: privacy-evidence-tick 4.8s ease-in-out infinite;
                }
              }

              .privacy-evidence-bar {
                pointer-events: none;
                transition: opacity 180ms ease, stroke-width 180ms ease, filter 180ms ease, transform 180ms ease;
              }

              .privacy-evidence-hit {
                pointer-events: all;
              }

              .privacy-evidence:hover .privacy-evidence-bar,
              .privacy-evidence:focus .privacy-evidence-bar {
                opacity: 1;
                stroke-width: 1.9;
                filter: saturate(1.28);
                transform: scale(1.35);
              }

              @keyframes privacy-breathe {
                0%, 100% { transform: scale(0.92); }
                50% { transform: scale(1.14); }
              }

              @keyframes privacy-evidence-tick {
                0%, 100% { transform: scaleY(0.82); }
                50% { transform: scaleY(1.08); }
              }
            `}
          </style>

          <g>
            {periodLabels.map((period, index) => (
              <path
                key={`${period.period_id}-sector`}
                d={sectorPath(period.angle_start_degrees, period.angle_end_degrees, 0.23, 1.035)}
                fill={[GOLD, GREEN, BLUE, VIOLET][index]}
                fillOpacity={0.045 + index * 0.008}
              />
            ))}
          </g>

          <g>
            {[0.23, 0.42, 0.6, 0.78, 0.96, 1.035].map((radius) => (
              <path
                key={radius}
                d={arcPath(VISUAL_ARC_START, VISUAL_ARC_END, radius)}
                fill="none"
                stroke={GRID}
                strokeOpacity={radius === 1.035 ? 0.44 : 0.2}
                strokeWidth={radius === 1.035 ? 2.1 : 1.1}
              />
            ))}

            {Array.from({ length: 23 }, (_, index) => {
              const angle =
                VISUAL_ARC_START + (index / 22) * (VISUAL_ARC_END - VISUAL_ARC_START);
              const inner = polarToCartesian(angle, 0.13);
              const outer = polarToCartesian(angle, 1.08);
              return (
                <line
                  key={angle}
                  x1={inner.x}
                  y1={inner.y}
                  x2={outer.x}
                  y2={outer.y}
                  stroke={GRID}
                  strokeOpacity={index % 6 === 0 ? 0.3 : 0.14}
                  strokeWidth={index % 6 === 0 ? 1.45 : 1}
                />
              );
            })}
          </g>

          <g>
            {visualPeriods.map((period) => {
              const line = calloutLine(period.angle_start_degrees, 0.18, 1.1);
              return (
                <line
                  key={`${period.period_id}-boundary`}
                  x1={line.start.x}
                  y1={line.start.y}
                  x2={line.end.x}
                  y2={line.end.y}
                  stroke={INK}
                  strokeOpacity="0.46"
                  strokeWidth="1.65"
                />
              );
            })}
            <path
              d={arcPath(VISUAL_ARC_START - 1.8, VISUAL_ARC_START + 1.8, 1.09)}
              fill="none"
              stroke={VIOLET}
              strokeOpacity="0.88"
              strokeWidth="5"
            />
          </g>

          <g>
            <path
              d={arcPath(VISUAL_ARC_START, VISUAL_ARC_END, 0.77)}
              fill="none"
              stroke={GOLD}
              strokeOpacity="0.68"
              strokeWidth="2.5"
            />
            <path
              d={arcPath(VISUAL_ARC_START, VISUAL_ARC_END, 0.58)}
              fill="none"
              stroke={GREEN}
              strokeOpacity="0.66"
              strokeWidth="2.35"
            />
            <path
              d={arcPath(visualAngle(72), VISUAL_ARC_END, 0.66)}
              fill="none"
              stroke={BLUE}
              strokeOpacity="0.64"
              strokeWidth="2.35"
            />
          </g>

          <g>
            {seclusionCircles.map((point) => {
              const position = polarToCartesian(point.angle, point.radius);
              return (
                <circle
                  key={point.id}
                  className="privacy-breathe"
                  cx={position.x}
                  cy={position.y}
                  r={point.size}
                  fill={point.fill}
                  fillOpacity={point.fillOpacity}
                  stroke={point.fill}
                  strokeOpacity={point.strokeOpacity}
                  strokeWidth={point.strokeWidth}
                  style={{ animationDelay: `${roundSvg(hashUnit(point.angle + point.size) * -5.8, 3)}s` }}
                />
              );
            })}
          </g>

          <g>
            {boundaryCircles.map((point) => {
              const position = polarToCartesian(point.angle, point.radius);
              return (
                <circle
                  key={point.id}
                  className="privacy-breathe"
                  cx={position.x}
                  cy={position.y}
                  r={point.size}
                  fill={point.fill}
                  fillOpacity={point.fillOpacity}
                  stroke={point.fill}
                  strokeOpacity={point.strokeOpacity}
                  strokeWidth={point.strokeWidth}
                  style={{ animationDelay: `${roundSvg(hashUnit(point.angle + point.size + 9) * -5.8, 3)}s` }}
                />
              );
            })}
          </g>

          <g>
            {secrecyCircles.map((point) => {
              const position = polarToCartesian(point.angle, point.radius);
              return (
                <circle
                  key={point.id}
                  className="privacy-breathe"
                  cx={position.x}
                  cy={position.y}
                  r={point.size}
                  fill={point.fill}
                  fillOpacity={point.fillOpacity}
                  stroke={point.fill}
                  strokeOpacity={point.strokeOpacity}
                  strokeWidth={point.strokeWidth}
                  style={{ animationDelay: `${roundSvg(hashUnit(point.angle + point.size + 17) * -5.8, 3)}s` }}
                />
              );
            })}
          </g>

          <g>
            {pressureEvidenceBars.map((bar) => {
              return (
                <g
                  key={bar.id}
                  className="privacy-evidence"
                  tabIndex={0}
                  aria-label={`${bar.periodLabel}: ${bar.term} (${bar.value.toFixed(4)} per million)`}
                  onBlur={() => setActiveEvidence(null)}
                  onFocus={() => setActiveEvidence(bar)}
                  onPointerEnter={() => setActiveEvidence(bar)}
                  onPointerMove={() => setActiveEvidence(bar)}
                >
                  <polygon
                    className="privacy-evidence-hit"
                    points={radialBarPolygon(
                      visualAngle(bar.angle),
                      clamp(bar.innerRadius - 0.075, 0.18, 1.1),
                      clamp(bar.outerRadius + 0.075, 0.28, 1.18),
                      Math.max(32, bar.width + 28),
                    )}
                    fill={INK}
                    fillOpacity="0.001"
                    stroke={INK}
                    strokeOpacity="0.001"
                  />
                  <polygon
                    className="privacy-evidence-bar"
                    points={radialBarPolygon(visualAngle(bar.angle), bar.innerRadius, bar.outerRadius, bar.width)}
                    fill={VIOLET}
                    fillOpacity={bar.opacity}
                    stroke={VIOLET}
                    strokeOpacity="0.82"
                    strokeWidth="0.8"
                    style={{ animationDelay: `${roundSvg(hashUnit(bar.angle + bar.width) * -4.8, 3)}s` }}
                  />
                </g>
              );
            })}
          </g>

          {threshold ? (
            <g>
              <line
                x1={polarToCartesian(visualAngle(threshold.angle_degrees), 0.09).x}
                y1={polarToCartesian(visualAngle(threshold.angle_degrees), 0.09).y}
                x2={polarToCartesian(visualAngle(threshold.angle_degrees), 1.11).x}
                y2={polarToCartesian(visualAngle(threshold.angle_degrees), 1.11).y}
                stroke={INK}
                strokeOpacity="0.56"
                strokeWidth="1.8"
              />
              <path
                d={arcPath(visualAngle(threshold.angle_degrees) - 1.6, visualAngle(threshold.angle_degrees) + 1.6, 1.09)}
                fill="none"
                stroke={VIOLET}
                strokeOpacity="0.88"
                strokeWidth="5"
              />
            </g>
          ) : null}

          <g>
            <circle cx={CENTER} cy={CENTER} r="8.5" fill={INK} fillOpacity="0.66" />
            <circle cx={CENTER} cy={CENTER} r="102" fill="none" stroke={INK} strokeOpacity="0.24" />
            <circle cx={CENTER} cy={CENTER} r="132" fill="none" stroke={INK} strokeOpacity="0.18" />
            <text
              x={CENTER}
              y={CENTER - 27}
              textAnchor="middle"
              style={MONO_STYLE}
              fill={INK}
              fontSize="34"
              fontWeight="900"
              opacity="0.72"
            >
              privacy
            </text>
            <text
              x={CENTER}
              y={CENTER + 32}
              textAnchor="middle"
              style={{ ...MONO_STYLE, letterSpacing: "0.18em" }}
              fill={INK}
              fontSize="13.5"
              fontWeight="900"
              opacity="0.6"
            >
              NOT YET A DIGITAL WORD
            </text>
          </g>

          <g>
            {yearTicks.map((tick) => {
              const outer = polarToCartesian(tick.angle, 1.055);
              const label = labelPosition(tick.angle, 1.135);
              const isStart = tick.year === 1200;
              const isEnd = tick.year === 1890;
              return (
                <g key={tick.year}>
                  <circle cx={outer.x} cy={outer.y} r={isStart || isEnd ? "5.4" : "4.1"} fill={INK} fillOpacity="0.66" />
                  <text
                    x={label.x}
                    y={label.y}
                    textAnchor={label.anchor}
                    style={{ ...MONO_STYLE, letterSpacing: "0.12em" }}
                    fill={INK}
                    fontSize={isStart ? "18" : "15.5"}
                    fontWeight="900"
                    opacity={isStart ? "0.86" : "0.68"}
                  >
                    <tspan x={label.x} dy="0">
                      {tick.year}
                    </tspan>
                    {isStart ? (
                      <tspan x={label.x} dy="18" fontSize="10.5" letterSpacing="0.16em">
                        START
                      </tspan>
                    ) : null}
                  </text>
                </g>
              );
            })}
          </g>

          <g>
            {periodLabels.map((period) => {
              const position = labelPosition(period.midAngle, 1.12);
              return (
                <text
                  key={`${period.period_id}-label`}
                  x={position.x}
                  y={position.y}
                  textAnchor={position.anchor}
                  style={{ ...MONO_STYLE, letterSpacing: "0.18em" }}
                  fill={INK}
                  fontSize="17"
                  fontWeight="900"
                  opacity="0.68"
                >
                  {period.label.toUpperCase()}
                </text>
              );
            })}
          </g>

          <g opacity="0.7">
            {[
              { angle: -30, text: "private matter / withdrawal", inner: 0.82 },
              { angle: 36, text: "secret knowledge", inner: 0.58 },
              { angle: 130, text: "public-private contrast", inner: 0.66 },
            ].map((note) => {
              const line = calloutLine(note.angle, note.inner, 1.12);
              const textPoint = labelPosition(note.angle, 1.17);
              return (
                <g key={note.text}>
                  <line
                    x1={line.start.x}
                    y1={line.start.y}
                    x2={line.end.x}
                    y2={line.end.y}
                    stroke={INK}
                    strokeWidth="1.15"
                    strokeOpacity="0.54"
                  />
                  <text
                    x={textPoint.x}
                    y={textPoint.y}
                    textAnchor={textPoint.anchor}
                    style={{ ...MONO_STYLE, letterSpacing: "0.08em" }}
                    fill={INK}
                    fontSize="12.5"
                    fontWeight="900"
                    opacity="0.58"
                  >
                    {note.text.toUpperCase()}
                  </text>
                </g>
              );
            })}
          </g>

          </svg>
        </div>
      </div>

      <div className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {dataset.periods.map((period) => (
          <article key={period.period_id} className="border-t border-ink/20 pt-3">
            <p className="font-mono text-[0.68rem] font-black uppercase tracking-[0.14em] text-[#8430c9]">
              {period.start_year}-{period.end_year}
            </p>
            <h4 className="mt-1 text-[1.02rem] font-black leading-5 text-ink">{period.label}</h4>
            <p className="mt-2 text-[0.9rem] leading-5 text-ink/72">{period.interpretation}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
