"use client";

import { useId, useState } from "react";
import { FigureShareActions } from "@/components/FigureShareActions";
import type {
  GeneratedFrequencyPoint,
  GeneratedFrequencySeries,
} from "@/types/foreverRealData";

type MobileFrequencyStoryProps = {
  series: GeneratedFrequencySeries[];
  activeInspectorId?: string;
};

const chartWidth = 360;
const chartHeight = 236;
const chartLeft = 34;
const chartRight = 12;
const chartTop = 24;
const chartBottom = 40;

function getPlottedPoints(item: GeneratedFrequencySeries) {
  const firstPoint = item.points[0];
  const lastPoint = item.points[item.points.length - 1];
  const recommendedStart = item.recommendedVisualStartYear;
  const canUseRecommendedStart =
    firstPoint &&
    lastPoint &&
    recommendedStart !== undefined &&
    firstPoint.year < recommendedStart &&
    lastPoint.year >= recommendedStart;

  return canUseRecommendedStart
    ? item.points.filter((point) => point.year >= recommendedStart)
    : item.points;
}

function getHighestPoint(points: GeneratedFrequencyPoint[]) {
  let highest = points[0];

  for (const point of points) {
    if (!highest || point.frequencyPerMillion > highest.frequencyPerMillion) highest = point;
  }

  return highest;
}

function formatFrequency(value: number) {
  if (value === 0) return "0";
  if (value >= 1) return value.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
  if (value >= 0.01) return value.toFixed(4).replace(/0+$/, "").replace(/\.$/, "");
  return value.toExponential(2);
}

function getContrastText(background: string) {
  const hex = background.replace("#", "");
  if (!/^[0-9a-f]{6}$/i.test(hex)) return "#050510";

  const channels = [0, 2, 4].map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16) / 255);
  const luminance = channels
    .map((channel) =>
      channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
    )
    .reduce((total, channel, index) => total + channel * [0.2126, 0.7152, 0.0722][index], 0);
  const blackContrast = (luminance + 0.05) / 0.05;
  const wheatContrast = (0.88 + 0.05) / (luminance + 0.05);

  return blackContrast >= wheatContrast ? "#050510" : "#F7F0DC";
}

function makeYearTicks(minYear: number, maxYear: number) {
  const span = maxYear - minYear;
  const count = span < 4 ? Math.max(2, span + 1) : 5;
  return Array.from(
    new Set(
      Array.from({ length: count }, (_, index) =>
        Math.round(minYear + (span * index) / Math.max(1, count - 1)),
      ),
    ),
  );
}

function pointPath(
  points: GeneratedFrequencyPoint[],
  x: (year: number) => number,
  y: (value: number) => number,
) {
  return points
    .map((point, index) =>
      `${index === 0 ? "M" : "L"} ${x(point.year).toFixed(2)} ${y(point.frequencyPerMillion).toFixed(2)}`,
    )
    .join(" ");
}

export function MobileFrequencyStory({
  series,
  activeInspectorId,
}: MobileFrequencyStoryProps) {
  const titleId = useId();
  const descriptionId = useId();
  const tableId = useId();
  const evidenceId = useId();
  const initiallyActive = series.find((item) => item.inspectorId === activeInspectorId);
  const [selectedSeriesId, setSelectedSeriesId] = useState(
    () => initiallyActive?.id ?? series[0]?.id ?? "",
  );
  const [selectedPointIndex, setSelectedPointIndex] = useState(Number.MAX_SAFE_INTEGER);
  const [showTable, setShowTable] = useState(false);
  const [showEvidence, setShowEvidence] = useState(false);

  const selectedSeries =
    series.find((item) => item.id === selectedSeriesId) ?? series[0];

  if (!selectedSeries) {
    return (
      <p className="border border-ink/20 px-4 py-5 font-mono text-sm font-black text-ink/60">
        No frequency series is available for this coverage.
      </p>
    );
  }

  const points = getPlottedPoints(selectedSeries);
  const firstPoint = points[0];
  const recentPoint = points[points.length - 1];
  const highestPoint = getHighestPoint(points);
  const safeSelectedIndex = Math.min(Math.max(selectedPointIndex, 0), Math.max(points.length - 1, 0));
  const selectedPoint = points[safeSelectedIndex] ?? recentPoint;
  const omittedEarlyPoints = points.length < selectedSeries.points.length;

  if (!firstPoint || !recentPoint || !highestPoint || !selectedPoint) {
    return (
      <p className="border border-ink/20 px-4 py-5 font-mono text-sm font-black text-ink/60">
        No yearly Ngram line falls inside this selected coverage.
      </p>
    );
  }

  const minYear = firstPoint.year;
  const maxYear = recentPoint.year;
  const plotWidth = chartWidth - chartLeft - chartRight;
  const plotHeight = chartHeight - chartTop - chartBottom;
  const highestRoot = Math.sqrt(Math.max(highestPoint.frequencyPerMillion, 0));
  const displayMax = Math.max(highestRoot * 1.08, 0.000001);
  const x = (year: number) =>
    chartLeft + ((year - minYear) / Math.max(1, maxYear - minYear)) * plotWidth;
  const y = (value: number) =>
    chartTop + plotHeight - (Math.sqrt(Math.max(value, 0)) / displayMax) * plotHeight;
  const ticks = makeYearTicks(minYear, maxYear);
  const path = pointPath(points, x, y);

  const selectSeries = (nextSeries: GeneratedFrequencySeries) => {
    const nextPoints = getPlottedPoints(nextSeries);
    setSelectedSeriesId(nextSeries.id);
    setSelectedPointIndex(Math.max(0, nextPoints.length - 1));
    setShowTable(false);
    setShowEvidence(false);
  };

  const selectNearestPoint = (clientX: number, bounds: DOMRect) => {
    const svgX = ((clientX - bounds.left) / Math.max(1, bounds.width)) * chartWidth;
    const targetYear =
      minYear + ((svgX - chartLeft) / Math.max(1, plotWidth)) * (maxYear - minYear);
    let closestIndex = 0;

    for (let index = 1; index < points.length; index += 1) {
      if (
        Math.abs(points[index].year - targetYear) <
        Math.abs(points[closestIndex].year - targetYear)
      ) {
        closestIndex = index;
      }
    }

    setSelectedPointIndex(closestIndex);
  };

  return (
    <figure className="max-w-full overflow-hidden border-y border-ink bg-wheat py-5 min-[1360px]:hidden" aria-labelledby={titleId}>
      <div className="px-1">
        <p className="font-mono text-[0.68rem] font-black uppercase tracking-[0.14em] text-fire">
          01A / mobile frequency story
        </p>
        <h3 id={titleId} className="mt-2 text-2xl font-black leading-none text-ink">
          How the written form appears over time
        </h3>
        <p className="mt-3 text-sm font-bold leading-5 text-ink/[0.68]">
          Select one spelling, then tap the line or scrub the year control. The chart uses the existing yearly Google Books Ngram points.
        </p>
      </div>

      <div className="mt-4 grid max-w-full grid-cols-2 gap-2 px-1 pb-2" role="group" aria-label="Written variant">
        {series.map((item) => {
          const active = item.id === selectedSeries.id;
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={active}
              onClick={() => selectSeries(item)}
              className="min-h-11 min-w-0 border px-2 py-2 font-mono text-[0.68rem] font-black uppercase leading-4 tracking-[0.06em] outline-none focus-visible:ring-2 focus-visible:ring-fire focus-visible:ring-offset-2 focus-visible:ring-offset-wheat"
              style={{
                borderColor: active ? item.color : "#050510",
                backgroundColor: active ? item.color : "transparent",
                color: active ? getContrastText(item.color) : "#050510",
              }}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="mt-3 max-w-full">
        <svg
          width={chartWidth}
          height={chartHeight}
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="block h-auto w-full max-w-full touch-manipulation"
          role="img"
          aria-labelledby={`${titleId} ${descriptionId}`}
          onPointerDown={(event) => selectNearestPoint(event.clientX, event.currentTarget.getBoundingClientRect())}
        >
          <title>{selectedSeries.label} yearly frequency per million</title>
          <desc id={descriptionId}>
            Google Books Ngram frequency from {minYear} to {maxYear}, drawn with a square-root display scale. Use the year slider after the chart for keyboard access to every plotted point.
          </desc>
          <rect width={chartWidth} height={chartHeight} fill="#F5ECD2" />
          {[0, 0.5, 1].map((fraction) => (
            <line
              key={fraction}
              x1={chartLeft}
              x2={chartWidth - chartRight}
              y1={chartTop + plotHeight * fraction}
              y2={chartTop + plotHeight * fraction}
              stroke="#050510"
              strokeDasharray="2 7"
              strokeWidth="1"
              opacity="0.18"
            />
          ))}
          {ticks.map((year) => (
            <g key={year}>
              <line
                x1={x(year)}
                x2={x(year)}
                y1={chartTop}
                y2={chartTop + plotHeight}
                stroke="#050510"
                strokeWidth="1"
                opacity="0.1"
              />
              <text
                x={x(year)}
                y={chartHeight - 12}
                textAnchor={year === minYear ? "start" : year === maxYear ? "end" : "middle"}
                className="fill-ink font-mono text-[10px] font-black"
              >
                {year}
              </text>
            </g>
          ))}
          <path
            d={path}
            fill="none"
            stroke="#050510"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="6"
            opacity="1"
          />
          <path
            d={path}
            fill="none"
            stroke={selectedSeries.color}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="3.5"
          />
          <line
            x1={x(selectedPoint.year)}
            x2={x(selectedPoint.year)}
            y1={chartTop}
            y2={chartTop + plotHeight}
            stroke="#050510"
            strokeWidth="1.5"
            opacity="0.48"
          />
          <circle
            cx={x(selectedPoint.year)}
            cy={y(selectedPoint.frequencyPerMillion)}
            r="6"
            fill={selectedSeries.color}
            stroke="#050510"
            strokeWidth="2"
          />
          <rect x="38" y="3" width="284" height="31" fill="#F5ECD2" opacity="0.92" />
          <text x="180" y="16" textAnchor="middle" className="fill-ink font-mono text-[10px] font-black uppercase tracking-[0.08em]">
            {selectedPoint.year} / {formatFrequency(selectedPoint.frequencyPerMillion)} per million
          </text>
          <text x="180" y="29" textAnchor="middle" className="fill-ink/60 font-mono text-[8px] font-black uppercase tracking-[0.08em]">
            tap plot to select / sqrt display scale
          </text>
        </svg>
      </div>

      <div className="px-1">
        <label htmlFor={`${titleId}-year`} className="font-mono text-[0.7rem] font-black uppercase tracking-[0.1em] text-ink">
          Inspect year: {selectedPoint.year}
        </label>
        <input
          id={`${titleId}-year`}
          type="range"
          min="0"
          max={Math.max(0, points.length - 1)}
          step="1"
          value={safeSelectedIndex}
          onChange={(event) => setSelectedPointIndex(Number(event.currentTarget.value))}
          aria-valuetext={`${selectedPoint.year}: ${formatFrequency(selectedPoint.frequencyPerMillion)} occurrences per million`}
          className="mt-1 block h-11 w-full cursor-ew-resize accent-fire"
        />
        <p className="font-mono text-[0.72rem] font-black uppercase leading-5 tracking-[0.08em] text-ink/[0.62]" aria-live="polite">
          {selectedPoint.year}: {formatFrequency(selectedPoint.frequencyPerMillion)} per million
        </p>
      </div>

      <dl className="mt-4 grid grid-cols-2 border-t border-l border-ink/[0.24]">
        {[
          ["Displayed coverage", `${minYear}-${maxYear}`],
          ["First visible data year", String(firstPoint.year)],
          ["Highest plotted — not historic peak", `${highestPoint.year} / ${formatFrequency(highestPoint.frequencyPerMillion)} per million`],
          ["Most recent plotted value", `${recentPoint.year} / ${formatFrequency(recentPoint.frequencyPerMillion)} per million`],
        ].map(([label, value]) => (
          <div key={label} className="min-w-0 border-r border-b border-ink/[0.24] px-2 py-3">
            <dt className="font-mono text-[0.6rem] font-black uppercase leading-4 tracking-[0.08em] text-ink/60">
              {label}
            </dt>
            <dd className="mt-1 break-words font-mono text-[0.76rem] font-black leading-5 text-ink">
              {value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="space-y-3 px-1 pt-4">
        <p className="text-sm font-bold leading-5 text-ink">
          Within this displayed Ngram window, {selectedSeries.label} has its highest plotted yearly value of {formatFrequency(highestPoint.frequencyPerMillion)} per million in {highestPoint.year}; the most recent plotted value is {formatFrequency(recentPoint.frequencyPerMillion)} in {recentPoint.year}. “Highest plotted” describes only these selected corpus points, not a historic peak.
        </p>
        <p className="border-l-4 border-fire pl-3 font-mono text-[0.68rem] font-black uppercase leading-5 tracking-[0.07em] text-ink/[0.64]">
          Frequency is not first attestation. It does not establish the word’s origin, earliest use, or meaning by itself.
        </p>
        {omittedEarlyPoints ? (
          <p className="font-mono text-[0.66rem] font-black uppercase leading-5 tracking-[0.06em] text-ink/60">
            The public line begins at the series’ research-recommended display year. Earlier audit points remain in the source dataset and are not deleted.
          </p>
        ) : null}
        {selectedSeries.coverageNote ? (
          <p className="font-mono text-[0.66rem] font-black uppercase leading-5 tracking-[0.06em] text-ink/60">
            Series caveat: {selectedSeries.coverageNote}
          </p>
        ) : null}
        <p className="font-mono text-[0.66rem] font-black uppercase leading-5 tracking-[0.06em] text-ink/60">
          Source: {selectedSeries.source} / corpus {selectedSeries.corpus} / smoothing {selectedSeries.smoothing} / frequency per million / square-root display scale.
        </p>
      </div>

      <div className="mt-4 px-1">
        <button
          type="button"
          aria-expanded={showEvidence}
          aria-controls={evidenceId}
          onClick={() => setShowEvidence((current) => !current)}
          className="min-h-11 w-full border border-ink bg-ink px-4 py-2 font-mono text-[0.7rem] font-black uppercase tracking-[0.1em] text-wheat outline-none transition-colors hover:bg-fire focus-visible:ring-2 focus-visible:ring-fire focus-visible:ring-offset-2 focus-visible:ring-offset-wheat motion-reduce:transition-none"
        >
          {showEvidence ? "Hide" : "Open"} source evidence for {selectedSeries.label}
        </button>
        {showEvidence ? (
          <div id={evidenceId} className="border-x border-b border-ink px-3 py-4">
            <dl className="grid gap-3 font-mono text-[0.68rem] font-black uppercase leading-5 tracking-[0.06em]">
              <div>
                <dt className="text-ink/60">Source</dt>
                <dd>{selectedSeries.source}</dd>
              </div>
              <div>
                <dt className="text-ink/60">Series coverage</dt>
                <dd>{selectedSeries.startYear}-{selectedSeries.endYear} / corpus {selectedSeries.corpus} / smoothing {selectedSeries.smoothing}</dd>
              </div>
              <div>
                <dt className="text-ink/60">Evidence boundary</dt>
                <dd>{selectedSeries.coverageNote ?? "This series measures corpus frequency, not attestation or meaning."}</dd>
              </div>
            </dl>
            <a
              href={selectedSeries.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex min-h-11 w-full items-center justify-center border border-ink px-3 py-2 text-center font-mono text-[0.68rem] font-black uppercase leading-4 tracking-[0.07em] text-ink outline-none hover:bg-ink hover:text-wheat focus-visible:ring-2 focus-visible:ring-fire focus-visible:ring-offset-2 focus-visible:ring-offset-wheat"
            >
              Open source query
              <span className="sr-only"> in a new tab</span>
            </a>
          </div>
        ) : null}
        <button
          type="button"
          aria-expanded={showTable}
          aria-controls={tableId}
          onClick={() => setShowTable((current) => !current)}
          className="mt-2 min-h-11 w-full border border-ink px-4 py-2 font-mono text-[0.7rem] font-black uppercase tracking-[0.1em] text-ink outline-none transition-colors hover:bg-ink hover:text-wheat focus-visible:ring-2 focus-visible:ring-fire focus-visible:ring-offset-2 focus-visible:ring-offset-wheat motion-reduce:transition-none"
        >
          {showTable ? "Hide" : "Show"} yearly data table
        </button>
      </div>

      {showTable ? (
        <div id={tableId} className="mt-3 max-h-80 max-w-full overflow-auto border-y border-ink/[0.24] outline-none focus-visible:ring-2 focus-visible:ring-fire focus-visible:ring-offset-2 focus-visible:ring-offset-wheat" tabIndex={0} aria-label={`${selectedSeries.label} yearly frequency data table`}>
          <table className="w-full border-collapse font-mono text-[0.7rem]">
            <caption className="sr-only">
              Every plotted yearly Google Books Ngram value for {selectedSeries.label}, {minYear} to {maxYear}
            </caption>
            <thead className="sticky top-0 bg-wheat">
              <tr>
                <th scope="col" className="border-b border-ink px-3 py-2 text-left font-black uppercase tracking-[0.08em]">Year</th>
                <th scope="col" className="border-b border-ink px-3 py-2 text-right font-black uppercase tracking-[0.08em]">Per million</th>
              </tr>
            </thead>
            <tbody>
              {points.map((point) => (
                <tr key={point.year} className={point.year === selectedPoint.year ? "bg-fire/[0.12]" : undefined}>
                  <th scope="row" className="border-b border-ink/10 px-3 py-2 text-left font-black">{point.year}</th>
                  <td className="border-b border-ink/10 px-3 py-2 text-right">{formatFrequency(point.frequencyPerMillion)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <figcaption className="px-1 pt-4 font-mono text-[0.66rem] font-black uppercase leading-5 tracking-[0.06em] text-ink/60">
        Figure 01A. One variant at a time, using unaltered yearly points from the existing dataset. Square-root scaling changes display height, not the recorded values.
      </figcaption>

      <div className="mt-4 px-1">
        <FigureShareActions anchor="spelling-frequency" title="Forever spelling frequency over time" />
      </div>
    </figure>
  );
}
