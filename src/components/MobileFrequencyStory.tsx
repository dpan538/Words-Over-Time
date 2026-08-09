import type {
  GeneratedFrequencyPoint,
  GeneratedFrequencySeries,
} from "@/types/foreverRealData";

type MobileFrequencyStoryProps = {
  series: GeneratedFrequencySeries[];
  activeInspectorId?: string;
};

const chartWidth = 360;
const chartHeight = 116;
const chartLeft = 0;
const chartRight = 0;
const chartTop = 24;
const chartBottom = 20;

function plottedPoints(series: GeneratedFrequencySeries) {
  const recommendedStart = series.recommendedVisualStartYear;
  const filtered = recommendedStart
    ? series.points.filter((point) => point.year >= recommendedStart)
    : series.points;

  return filtered.length > 1 ? filtered : series.points;
}

function highestPoint(points: GeneratedFrequencyPoint[]) {
  return points.reduce(
    (highest, point) =>
      point.frequencyPerMillion > highest.frequencyPerMillion ? point : highest,
    points[0],
  );
}

function frequencyLabel(value: number) {
  if (value >= 10) return value.toFixed(1);
  if (value >= 1) return value.toFixed(2);
  return value.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
}

function pathFor(points: GeneratedFrequencyPoint[]) {
  const first = points[0];
  const last = points[points.length - 1];
  const highest = highestPoint(points);
  const plotWidth = chartWidth - chartLeft - chartRight;
  const plotHeight = chartHeight - chartTop - chartBottom;
  const maxRoot = Math.sqrt(Math.max(highest.frequencyPerMillion, 0.000001));
  const x = (year: number) =>
    chartLeft + ((year - first.year) / Math.max(1, last.year - first.year)) * plotWidth;
  const y = (value: number) =>
    chartTop + plotHeight - (Math.sqrt(Math.max(value, 0)) / maxRoot) * plotHeight;

  return points
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"} ${x(point.year).toFixed(2)} ${y(point.frequencyPerMillion).toFixed(2)}`,
    )
    .join(" ");
}

export function MobileFrequencyStory({ series }: MobileFrequencyStoryProps) {
  const available = series
    .map((item) => ({ item, points: plottedPoints(item) }))
    .filter(({ points }) => points.length > 1);

  if (available.length === 0) {
    return (
      <p className="text-sm leading-6 text-ink/60">
        No yearly frequency series is available inside the declared coverage.
      </p>
    );
  }

  return (
    <figure id="spelling" className="scroll-mt-6 border-t border-ink/70 pt-5" aria-labelledby="forever-frequency-title">
      <p className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.13em] text-fire">
        01 / static time trace
      </p>
      <h2 id="forever-frequency-title" className="mt-2 max-w-sm text-[1.75rem] font-bold leading-[1.02]">
        How do the written forms move through print?
      </h2>

      <div className="mt-8 space-y-7">
        {available.map(({ item, points }) => {
          const first = points[0];
          const last = points[points.length - 1];
          const highest = highestPoint(points);
          const middleYear = Math.round(first.year + (last.year - first.year) / 2);

          return (
            <div key={item.id} className="min-w-0">
              <div className="flex items-end justify-between gap-3">
                <p className="text-base font-semibold leading-5" style={{ color: item.color }}>
                  {item.label}
                </p>
                <p className="text-right font-mono text-[0.64rem] font-medium uppercase leading-4 tracking-[0.05em] text-ink/52">
                  2022 / {frequencyLabel(last.frequencyPerMillion)} per million
                </p>
              </div>
              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="mt-1 block h-auto w-full"
                role="img"
                aria-label={`${item.label}: yearly Google Books Ngram frequency from ${first.year} to ${last.year}; highest plotted value ${frequencyLabel(highest.frequencyPerMillion)} per million in ${highest.year}; recent value ${frequencyLabel(last.frequencyPerMillion)} per million in ${last.year}.`}
              >
                <title>{`${item.label} yearly print-frequency trace`}</title>
                <desc>
                  Google Books Ngram yearly frequency per million. The vertical display uses an independent square-root scale for this row; direct values are provided for the highest and most recent points.
                </desc>
                <line x1="0" x2={chartWidth} y1={chartHeight - chartBottom} y2={chartHeight - chartBottom} stroke="#050510" strokeWidth="1" opacity="0.22" />
                <path d={pathFor(points)} fill="none" stroke={item.color} strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
                <circle
                  cx={((highest.year - first.year) / Math.max(1, last.year - first.year)) * chartWidth}
                  cy={chartTop}
                  r="3.5"
                  fill={item.color}
                />
                <text x="0" y={chartHeight - 4} className="fill-ink/50 font-mono text-[9px] font-medium">
                  {first.year}
                </text>
                <text x={chartWidth / 2} y={chartHeight - 4} textAnchor="middle" className="fill-ink/50 font-mono text-[9px] font-medium">
                  {middleYear}
                </text>
                <text x={chartWidth} y={chartHeight - 4} textAnchor="end" className="fill-ink/50 font-mono text-[9px] font-medium">
                  {last.year}
                </text>
                <text x="0" y="12" className="fill-ink/48 font-mono text-[9px] font-medium uppercase">
                  high {frequencyLabel(highest.frequencyPerMillion)} / {highest.year}
                </text>
              </svg>
            </div>
          );
        })}
      </div>

      <figcaption className="mt-8">
        <p className="max-w-xl text-[1rem] font-normal leading-[1.62] text-ink/76">
          The spaced form remains far more visible through the earlier part of this plotted window, while the one-word headword rises later. The lower-frequency compounds have distinct traces but should not be read from line height alone: each row is independently scaled so its shape remains legible.
        </p>
        <p className="mt-4 max-w-xl font-mono text-[0.66rem] font-medium uppercase leading-5 tracking-[0.06em] text-ink/48">
          Signal / Google Books Ngram, English corpus, smoothing 0, displayed from each series’ recommended start through 2022 · Transform / frequency per million, independent square-root row scales · Boundary / frequency is not first attestation
        </p>
      </figcaption>
    </figure>
  );
}
