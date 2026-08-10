import type {
  GeneratedFrequencyPoint,
  GeneratedFrequencySeries,
} from "@/types/foreverRealData";

type ForeverFormCurrentProps = {
  series: GeneratedFrequencySeries[];
};

const startYear = 1600;
const endYear = 2022;
const chartWidth = 350;
const chartHeight = 330;
const ticks = [1600, 1700, 1800, 1900, 2022];

function pointsBetween(series: GeneratedFrequencySeries, start: number, end: number) {
  return series.points.filter((point) => point.year >= start && point.year <= end);
}

function highestPoint(points: GeneratedFrequencyPoint[]) {
  return points.reduce(
    (highest, point) =>
      point.frequencyPerMillion > highest.frequencyPerMillion ? point : highest,
    points[0],
  );
}

function frequencyLabel(value: number) {
  if (value >= 100) return value.toFixed(0);
  if (value >= 10) return value.toFixed(1);
  if (value >= 1) return value.toFixed(2);
  return value.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
}

function xFor(year: number, start: number, end: number, width: number) {
  return ((year - start) / Math.max(1, end - start)) * width;
}

function yFor(value: number, maximum: number, height: number) {
  return height - (Math.sqrt(Math.max(0, value)) / Math.sqrt(maximum)) * height;
}

function linePath(
  points: GeneratedFrequencyPoint[],
  maximum: number,
  width: number,
  height: number,
) {
  const first = points[0];
  const last = points[points.length - 1];

  return points
    .map((point, index) => {
      const x = xFor(point.year, first.year, last.year, width);
      const y = yFor(point.frequencyPerMillion, maximum, height);
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

function areaPath(
  points: GeneratedFrequencyPoint[],
  maximum: number,
  width: number,
  height: number,
) {
  return `M 0 ${height} ${linePath(points, maximum, width, height).replace(/^M /, "L ")} L ${width} ${height} Z`;
}

export function ForeverFormCurrent({ series }: ForeverFormCurrentProps) {
  const forever = series.find((item) => item.id === "forever");
  const forEver = series.find((item) => item.id === "for-ever");
  const compounds = series.filter(
    (item) => item.id === "forevermore" || item.id === "forever-and-ever",
  );

  if (!forever || !forEver) return null;

  const foreverPoints = pointsBetween(forever, startYear, endYear);
  const forEverPoints = pointsBetween(forEver, startYear, endYear);
  const maximum = highestPoint([...foreverPoints, ...forEverPoints]).frequencyPerMillion;
  const foreverPeak = highestPoint(foreverPoints);
  const forEverPeak = highestPoint(forEverPoints);
  const foreverRecent = foreverPoints[foreverPoints.length - 1];
  const forEverRecent = forEverPoints[forEverPoints.length - 1];
  const earlyBandWidth = xFor(1700, startYear, endYear, chartWidth);

  return (
    <figure
      id="spelling"
      className="scroll-mt-6 overflow-hidden bg-ink text-paper-mobile"
      aria-labelledby="forever-form-current-title"
    >
      <div className="px-5 pb-3 pt-12">
        <p className="font-mono text-[0.8125rem] font-semibold uppercase leading-5 tracking-[0.04em] text-sun">
          01 / form current
        </p>
        <h2
          id="forever-form-current-title"
          className="mt-4 max-w-[20rem] text-[2rem] font-semibold leading-[1.02] tracking-[-0.02em]"
        >
          The space closes. The print-frequency signal changes direction.
        </h2>
        <p className="mt-5 max-w-[21rem] text-[1.0625rem] font-normal leading-[1.55]">
          Two spellings share one source, denominator, year domain, and square-root display scale. They remain separate series.
        </p>
      </div>

      <div className="mt-10 px-5">
        <div className="grid grid-cols-2 gap-5 max-[300px]:grid-cols-1">
          <div>
            <p className="flex items-center gap-3 text-[2rem] font-semibold leading-none tracking-[-0.02em]" style={{ color: forEver.color }}>
              <span aria-hidden="true" className="block w-8 border-t-2 border-dashed border-current" />
              for ever
            </p>
            <p className="mt-3 font-mono text-[0.8125rem] font-semibold uppercase leading-5 tracking-[0.04em]">
              Peak {frequencyLabel(forEverPeak.frequencyPerMillion)} / million · {forEverPeak.year}
            </p>
          </div>
          <div className="text-right max-[300px]:text-left">
            <p className="flex items-center justify-end gap-3 text-[2rem] font-semibold leading-none tracking-[-0.02em] max-[300px]:justify-start" style={{ color: forever.color }}>
              <span aria-hidden="true" className="block w-8 border-t-[3px] border-current" />
              forever
            </p>
            <p className="mt-3 font-mono text-[0.8125rem] font-semibold uppercase leading-5 tracking-[0.04em]">
              Peak {frequencyLabel(foreverPeak.frequencyPerMillion)} / million · {foreverPeak.year}
            </p>
          </div>
        </div>

        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="mt-8 block h-auto w-full"
          role="img"
          aria-labelledby="forever-form-current-svg-title forever-form-current-svg-desc"
        >
          <title id="forever-form-current-svg-title">
            Shared-scale frequency traces for “for ever” and “forever,” 1600–2022
          </title>
          <desc id="forever-form-current-svg-desc">
            Year runs left to right. Frequency per million uses one shared square-root vertical scale. The dashed blue for ever trace descends overall; the solid orange forever trace rises later. Pre-1700 is visibly marked as an early signal zone.
          </desc>
          <defs>
            <pattern id="forever-early-hatch" width="18" height="18" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" x2="0" y1="0" y2="18" stroke="#FCFAF3" strokeWidth="1" opacity="0.18" />
            </pattern>
          </defs>
          <rect width={earlyBandWidth} height={chartHeight} fill="url(#forever-early-hatch)" />
          {ticks.map((tick) => {
            const x = xFor(tick, startYear, endYear, chartWidth);
            return <line key={tick} x1={x} x2={x} y1="0" y2={chartHeight} stroke="#FCFAF3" strokeWidth="1" opacity="0.16" />;
          })}
          <line x1="0" x2={chartWidth} y1={chartHeight} y2={chartHeight} stroke="#FCFAF3" opacity="0.5" />
          <path d={areaPath(forEverPoints, maximum, chartWidth, chartHeight)} fill={forEver.color} opacity="0.24" />
          <path d={areaPath(foreverPoints, maximum, chartWidth, chartHeight)} fill={forever.color} opacity="0.34" />
          <path d={linePath(forEverPoints, maximum, chartWidth, chartHeight)} fill="none" stroke={forEver.color} strokeWidth="2.6" strokeDasharray="8 5" vectorEffect="non-scaling-stroke" />
          <path d={linePath(foreverPoints, maximum, chartWidth, chartHeight)} fill="none" stroke={forever.color} strokeWidth="3" vectorEffect="non-scaling-stroke" />
          <circle cx={chartWidth} cy={yFor(forEverRecent.frequencyPerMillion, maximum, chartHeight)} r="4.5" fill="#FCFAF3" stroke={forEver.color} strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
          <circle cx={chartWidth} cy={yFor(foreverRecent.frequencyPerMillion, maximum, chartHeight)} r="4.5" fill={forever.color} stroke="#FCFAF3" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        </svg>

        <div className="relative mt-3 h-5 font-mono text-[0.8125rem] font-semibold leading-5 tracking-[0.04em]" aria-label="Time axis labels">
          {ticks.map((tick) => (
            <span
              key={tick}
              className="absolute -translate-x-1/2 first:translate-x-0 last:-translate-x-full"
              style={{ left: `${(xFor(tick, startYear, endYear, chartWidth) / chartWidth) * 100}%` }}
            >
              {tick}
            </span>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-2 gap-5 font-mono text-[0.8125rem] font-semibold uppercase leading-5 tracking-[0.04em]">
          <p>For ever / 2022 / {frequencyLabel(forEverRecent.frequencyPerMillion)} per million</p>
          <p className="text-right">Forever / 2022 / {frequencyLabel(foreverRecent.frequencyPerMillion)} per million</p>
        </div>
        <p className="mt-5 font-mono text-[0.8125rem] font-semibold uppercase leading-5 tracking-[0.04em]">
          Hatched field / pre-1700 early signal · display / shared square-root scale
        </p>
      </div>

      <div className="mt-10 grid grid-cols-2 border-t border-paper-mobile/50 max-[300px]:grid-cols-1">
        {compounds.map((item) => {
          const points = pointsBetween(item, item.recommendedVisualStartYear ?? 1700, endYear);
          const peak = highestPoint(points);
          const recent = points[points.length - 1];
          return (
            <div key={item.id} className="min-w-0 border-paper-mobile/40 px-5 py-8 odd:border-r max-[300px]:border-b max-[300px]:odd:border-r-0">
              <p className="min-h-12 text-[1.0625rem] font-semibold leading-6">
                {item.label}
              </p>
              <svg viewBox="0 0 160 78" className="mt-4 block h-auto w-full" role="img" aria-label={`${item.label}: independently scaled print-frequency shape from ${points[0].year} to 2022; peak ${frequencyLabel(peak.frequencyPerMillion)} per million in ${peak.year}; 2022 value ${frequencyLabel(recent.frequencyPerMillion)}.`}>
                <line x1="0" x2="160" y1="70" y2="70" stroke="#FCFAF3" opacity="0.5" />
                <path d={linePath(points, peak.frequencyPerMillion, 160, 60)} transform="translate(0 8)" fill="none" stroke="#FCFAF3" strokeWidth="4.5" opacity="0.9" vectorEffect="non-scaling-stroke" />
                <path d={linePath(points, peak.frequencyPerMillion, 160, 60)} transform="translate(0 8)" fill="none" stroke={item.color} strokeWidth="2.3" vectorEffect="non-scaling-stroke" />
              </svg>
              <p className="mt-4 font-mono text-[0.8125rem] font-semibold uppercase leading-5 tracking-[0.04em]">
                {points[0].year}–2022 / independent shape scale
              </p>
              <p className="mt-2 font-mono text-[0.8125rem] font-semibold uppercase leading-5 tracking-[0.04em]">
                Peak {frequencyLabel(peak.frequencyPerMillion)} / recent {frequencyLabel(recent.frequencyPerMillion)}
              </p>
            </div>
          );
        })}
      </div>

      <figcaption className="border-t border-paper-mobile/50 px-5 pb-14 pt-8">
        <p className="max-w-[22rem] text-[1.0625rem] font-normal leading-[1.55]">
          The two large traces are comparable because they share a source, denominator, year domain, and display scale. The compound sparklines preserve shape on separate scales; their heights do not compare with the field above.
        </p>
        <p className="mt-5 font-mono text-[0.8125rem] font-semibold uppercase leading-5 tracking-[0.04em]">
          Signal / Google Books Ngram, English, smoothing 0 · Transform / frequency per million · Boundary / frequency is not attestation or meaning
        </p>
      </figcaption>
    </figure>
  );
}
