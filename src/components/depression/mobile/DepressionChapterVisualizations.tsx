"use client";

import { memo, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import type { DepressionMobileChart, DepressionMobileMetric, DepressionMobileSeries } from "@/types/depressionMobileResearch";
import styles from "./mobile-depression.module.css";

type Size = { width: number; height: number };
type Box = Size & { left: number; right: number; top: number; bottom: number; innerWidth: number; innerHeight: number };

const FOOTERS: Record<string, string> = {
  "roots-summary": "Chronological anchors only; no first-use claim.",
  "roots-detail": "All six are secondary lexical sources.",
  "print-summary": "Shared zero baseline and corpus denominator.",
  "print-detail": "Printed forms compared; meanings remain distinct.",
  "crossover-summary": "Visibility crossover, not semantic replacement.",
  "crossover-detail": "Three phrases share one scale and denominator.",
  "crisis-summary": "All eleven annual values share a zero baseline.",
  "crisis-detail": "NBER interval is context, not causal proof.",
  "plateau-summary": "Stage means; −2.23 appearances per million.",
  "plateau-detail": "0.006 clinical mean / M · not illness prevalence.",
  "labels-summary": "Threshold uses a nine-year centred mean.",
  "labels-detail": "Anxiety is adjacent, not a synonym or subset.",
};

const CARD_TITLES: Record<string, string> = {
  "plateau-detail": "LABELS BEFORE THEIR RISE",
  "labels-detail": "A MODERN NEIGHBOUR",
};

const CARD_UNITS: Record<string, string> = {
  "roots-summary": "YEAR / SOURCE",
  "roots-detail": "SOURCE / STATUS",
  "print-summary": "MEAN / MILLION WORDS",
  "print-detail": "9-YEAR MEAN / MILLION",
  "crossover-summary": "9-YEAR MEAN / MILLION",
  "crossover-detail": "RAW / M · 0—3.5",
  "crisis-summary": "RAW / MILLION WORDS",
  "crisis-detail": "RAW / M · 0—3.5",
  "plateau-summary": "MEAN / MILLION WORDS",
  "plateau-detail": "RAW / M · 0—0.25",
  "labels-summary": "RAW / M · 0—1.0",
  "labels-detail": "RAW / MILLION WORDS",
};

function useChartSize() {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<Size>({ width: 320, height: 225 });
  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    const update = () => {
      const rect = node.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) setSize({ width: rect.width, height: rect.height });
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return { ref, size };
}

function boxFor(size: Size, margins = { top: 18, right: 12, bottom: 34, left: 40 }): Box {
  return {
    ...size,
    left: margins.left,
    right: margins.right,
    top: margins.top,
    bottom: margins.bottom,
    innerWidth: Math.max(1, size.width - margins.left - margins.right),
    innerHeight: Math.max(1, size.height - margins.top - margins.bottom),
  };
}

function value(metric: DepressionMobileMetric) {
  return metric.value.toFixed(metric.precision);
}

function maxSeries(series: DepressionMobileSeries[]) {
  return Math.max(.0001, ...series.flatMap((item) => item.points.map((point) => point.value)));
}

function xScale(year: number, period: [number, number], box: Box) {
  return box.left + ((year - period[0]) / Math.max(1, period[1] - period[0])) * box.innerWidth;
}

function yScale(value: number, maximum: number, box: Box) {
  return box.top + box.innerHeight - (value / Math.max(maximum, .0001)) * box.innerHeight;
}

function linePath(series: DepressionMobileSeries, period: [number, number], maximum: number, box: Box) {
  return series.points.map((point, index) => `${index ? "L" : "M"}${xScale(point.year, period, box).toFixed(2)},${yScale(point.value, maximum, box).toFixed(2)}`).join(" ");
}

function AxisLayer({ box, period, xTicks, yTicks, yMaximum }: { box: Box; period: [number, number]; xTicks: number[]; yTicks: number[]; yMaximum: number }) {
  return (
    <g aria-hidden="true">
      {yTicks.map((tick) => {
        const y = yScale(tick, yMaximum, box);
        return <g key={`y-${tick}`}><line className={styles.axisGrid} x1={box.left} x2={box.left + box.innerWidth} y1={y} y2={y} /><text className={styles.axisText} x={box.left - 7} y={y + 4} textAnchor="end">{tick}</text></g>;
      })}
      {xTicks.map((tick) => {
        const x = xScale(tick, period, box);
        return <g key={`x-${tick}`}><line className={styles.axisTick} x1={x} x2={x} y1={box.top + box.innerHeight} y2={box.top + box.innerHeight + 5} /><text className={styles.axisText} x={x} y={box.height - 7} textAnchor={tick === period[0] ? "start" : tick === period[1] ? "end" : "middle"}>{tick}</text></g>;
      })}
    </g>
  );
}

function ResponsivePlot({ chart, children, className = "" }: { chart: DepressionMobileChart; children: (size: Size) => ReactNode; className?: string }) {
  const { ref, size } = useChartSize();
  return (
    <div ref={ref} className={`${styles.cardChart} ${className}`}>
      <svg viewBox={`0 0 ${size.width} ${size.height}`} role="img" aria-labelledby={`${chart.id}-title ${chart.id}-desc`}>
        <title id={`${chart.id}-title`}>{chart.title}</title>
        <desc id={`${chart.id}-desc`}>{chart.accessibleSummary}</desc>
        {children(size)}
      </svg>
    </div>
  );
}

function ChartFrame({ chart, children }: { chart: DepressionMobileChart; children: ReactNode }) {
  return (
    <div className={styles.cardLayout} data-depression-card-layout={chart.id}>
      <header className={styles.cardHeader}><h3>{CARD_TITLES[chart.id] ?? chart.title}</h3><p>{CARD_UNITS[chart.id] ?? chart.transform}</p></header>
      <div className={styles.cardMain} data-depression-card-chart>{children}</div>
      <p className={styles.cardFooter}>{FOOTERS[chart.id] ?? chart.caveat}</p>
    </div>
  );
}

function Legend({ series }: { series: DepressionMobileSeries[] }) {
  return <div className={styles.chartLegend}>{series.map((item) => <span key={item.id}><i style={{ background: item.color }} />{item.label}</span>)}</div>;
}

function LinePlot({ chart, xTicks, yTicks, yMaximum, annotationYear, annotationLabel = "sustained lead", threshold, event }: { chart: DepressionMobileChart; xTicks: number[]; yTicks: number[]; yMaximum: number; annotationYear?: number; annotationLabel?: string; threshold?: number; event?: [number, number] }) {
  const series = chart.series ?? [];
  return (
    <div className={styles.chartWithLegend}>
      <ResponsivePlot chart={chart}>{(size) => {
        const box = boxFor(size);
        return <>
          <AxisLayer box={box} period={chart.period} xTicks={xTicks} yTicks={yTicks} yMaximum={yMaximum} />
          {event ? <rect className={styles.eventBand} x={xScale(event[0], chart.period, box)} y={box.top} width={Math.max(2, xScale(event[1], chart.period, box) - xScale(event[0], chart.period, box))} height={box.innerHeight} /> : null}
          {annotationYear ? <><line className={styles.annotationRule} x1={xScale(annotationYear, chart.period, box)} x2={xScale(annotationYear, chart.period, box)} y1={box.top} y2={box.top + box.innerHeight} /><text className={styles.annotationText} x={xScale(annotationYear, chart.period, box) + 5} y={box.top + 13}>{annotationLabel}</text></> : null}
          {threshold !== undefined ? <><line className={styles.thresholdRule} x1={box.left} x2={box.left + box.innerWidth} y1={yScale(threshold, yMaximum, box)} y2={yScale(threshold, yMaximum, box)} /><text className={styles.annotationText} x={box.left + 5} y={yScale(threshold, yMaximum, box) - 5}>0.1 / M</text></> : null}
          {series.map((item) => <path key={item.id} d={linePath(item, chart.period, yMaximum, box)} stroke={item.color} className={styles.dataLine} />)}
        </>;
      }}</ResponsivePlot>
      <Legend series={series} />
    </div>
  );
}

function RootsAnchorChart({ chart, detail }: { chart: DepressionMobileChart; detail: boolean }) {
  const anchors = chart.attestations ?? [];
  const annotations = chart.annotations ?? [];
  return <ChartFrame chart={chart}><div className={styles.anchorDiagram} role="img" aria-label={chart.accessibleSummary}>{anchors.map((anchor, index) => <div key={`${anchor.year}-${anchor.label}`}><time>{anchor.year < 1500 ? `c.${anchor.year}` : anchor.year}</time><i aria-hidden="true" /><strong>{detail ? annotations[index]?.detail ?? anchor.label : anchor.label}</strong></div>)}<p>SPACING: CHRONOLOGICAL ONLY</p>{detail ? <p>ALL SIX · MEDIUM CONFIDENCE · NO FIRST-USE CLAIM</p> : null}</div></ChartFrame>;
}

function HorizontalBars({ chart, maximum, ticks, primary, secondary }: { chart: DepressionMobileChart; maximum: number; ticks: number[]; primary: string; secondary?: string }) {
  const metrics = chart.metrics ?? [];
  return (
    <ChartFrame chart={chart}>
      <div className={styles.metricChartStack}>
        <div className={styles.derivedMetric}><strong>{primary}</strong>{secondary ? <span>{secondary}</span> : null}</div>
        <ResponsivePlot chart={chart}>{(size) => {
          const box = boxFor(size, { top: 60, right: 34, bottom: 35, left: 96 });
          const band = box.innerHeight / Math.max(1, metrics.length);
          return <>
            <AxisLayer box={box} period={[0, maximum] as [number, number]} xTicks={ticks} yTicks={[0]} yMaximum={1} />
            {metrics.map((metric, index) => {
              const y = box.top + band * index + band * .2;
              const height = band * .54;
              const width = (metric.value / maximum) * box.innerWidth;
              return <g key={metric.label}><text className={styles.barLabel} x={box.left - 7} y={y + height * .65} textAnchor="end">{metric.label}</text><rect className={styles.barTrack} x={box.left} y={y} width={box.innerWidth} height={height} /><rect className={styles.valueBar} x={box.left} y={y} width={width} height={height} /><text className={styles.barValue} x={Math.min(box.left + width + 6, size.width - 28)} y={y + height * .65}>{value(metric)}</text></g>;
            })}
          </>;
        }}</ResponsivePlot>
      </div>
    </ChartFrame>
  );
}

function PrintComparisonChart({ chart }: { chart: DepressionMobileChart }) {
  const metrics = chart.metrics ?? [];
  const ratio = metrics[1] && metrics[0] ? metrics[1].value / metrics[0].value : 0;
  return <HorizontalBars chart={chart} maximum={25} ticks={[0, 5, 10, 15, 20, 25]} primary={`${ratio.toFixed(2)}×`} secondary="melancholy / depression" />;
}

function HistoricalNeighborsChart({ chart }: { chart: DepressionMobileChart }) {
  return <ChartFrame chart={chart}><LinePlot chart={chart} xTicks={[1800, 1825, 1850, 1873]} yTicks={[0, 7, 14, 21, 28]} yMaximum={28} /></ChartFrame>;
}

function CrossoverChart({ chart }: { chart: DepressionMobileChart }) {
  const maximum = Math.ceil(maxSeries(chart.series ?? []) / 5) * 5;
  const ticks = [0, maximum / 2, maximum];
  return <ChartFrame chart={chart}><LinePlot chart={chart} xTicks={[1874, 1900, 1928]} yTicks={ticks} yMaximum={maximum} annotationYear={1874} /></ChartFrame>;
}

function PhraseChart({ chart, crisis = false }: { chart: DepressionMobileChart; crisis?: boolean }) {
  return <ChartFrame chart={chart}><LinePlot chart={chart} xTicks={crisis ? [1929, 1932, 1935, 1939] : [1874, 1900, 1928]} yTicks={[0, 1, 2, 3, 3.5]} yMaximum={3.5} event={crisis ? [1929, 1933] : undefined} /></ChartFrame>;
}

function CrisisLollipopChart({ chart }: { chart: DepressionMobileChart }) {
  const series = chart.series?.[0];
  if (!series) return null;
  const maximum = 50;
  return (
    <ChartFrame chart={chart}>
      <div className={styles.metricChartStack}>
        <div className={styles.derivedMetric}><strong>43.33</strong><span>1932 PEAK · / MILLION</span></div>
        <ResponsivePlot chart={chart}>{(size) => {
          const box = boxFor(size, { top: 62, right: 12, bottom: 35, left: 36 });
          return <><AxisLayer box={box} period={chart.period} xTicks={[1929, 1932, 1935, 1939]} yTicks={[0, 10, 20, 30, 40, 50]} yMaximum={maximum} />{series.points.map((point) => {const x=xScale(point.year,chart.period,box);const y=yScale(point.value,maximum,box);const focal=point.year===1932;return <g key={point.year}><line className={styles.lollipopStem} x1={x} x2={x} y1={yScale(0,maximum,box)} y2={y}/><circle className={focal?styles.lollipopFocal:styles.lollipopDot} cx={x} cy={y} r={focal?6:3.5}/>{focal?<text className={styles.barValue} x={x+7} y={y-6}>43.33</text>:null}</g>;})}</>;
        }}</ResponsivePlot>
      </div>
    </ChartFrame>
  );
}

function PlateauChart({ chart }: { chart: DepressionMobileChart }) {
  const metrics = chart.metrics ?? [];
  return (
    <ChartFrame chart={chart}>
      <div className={styles.plateauComparison} role="img" aria-label={chart.accessibleSummary}>
        <div className={styles.plateauMetrics}>
          {metrics.map((metric) => (
            <div key={metric.label}>
              <span>{metric.label}</span>
              <strong>{value(metric)}</strong>
            </div>
          ))}
        </div>
        <div className={styles.plateauBars}>
          {metrics.map((metric) => (
            <div key={metric.label}>
              <span>{metric.label}</span>
              <i><b style={{ width: `${(metric.value / 15) * 100}%` }} /></i>
              <strong>{value(metric)}</strong>
            </div>
          ))}
          <div className={styles.plateauAxis} aria-hidden="true"><span>0</span><span>5</span><span>10</span><span>15</span></div>
        </div>
      </div>
    </ChartFrame>
  );
}

function ClinicalBeforeRiseChart({ chart }: { chart: DepressionMobileChart }) {
  return <ChartFrame chart={chart}><LinePlot chart={chart} xTicks={[1940, 1960, 1979]} yTicks={[0, .05, .1, .15, .2, .25]} yMaximum={.25} threshold={.1} /></ChartFrame>;
}

function DiagnosticLabelsChart({ chart }: { chart: DepressionMobileChart }) {
  return <ChartFrame chart={chart}><LinePlot chart={chart} xTicks={[1980, 2000, 2022]} yTicks={[0, .25, .5, .75, 1]} yMaximum={1} threshold={.1} annotationYear={1983} annotationLabel="1983 · DURABLE" /></ChartFrame>;
}

function ModernContrastChart({ chart }: { chart: DepressionMobileChart }) {
  const maximum = Math.max(40, Math.ceil(maxSeries(chart.series ?? []) / 10) * 10);
  const metrics = chart.metrics ?? [];
  const readouts = ["depression", "anxiety"].map((label) => ({
    label,
    shortLabel: label === "depression" ? "DEP" : "ANX",
    mean: metrics.find((metric) => metric.label === "2010s" && metric.detail.startsWith(label)),
    endpoint: metrics.find((metric) => metric.label === "2022" && metric.detail === label),
  }));
  return (
    <ChartFrame chart={chart}>
      <div className={styles.modernStack}>
        <LinePlot chart={chart} xTicks={[1980, 2000, 2010, 2022]} yTicks={Array.from({ length: maximum / 10 + 1 }, (_, index) => index * 10)} yMaximum={maximum} />
        <div className={styles.meanReadout}>{readouts.map((item) => <span key={item.label} aria-label={`${item.label}, ${item.mean ? value(item.mean) : "unavailable"} 2010s mean; ${item.endpoint ? value(item.endpoint) : "unavailable"} in 2022`}><strong>{item.mean ? value(item.mean) : "—"}</strong><em>{item.shortLabel} / 2010s</em><b>{item.endpoint ? value(item.endpoint) : "—"}</b><i>2022</i></span>)}</div>
      </div>
    </ChartFrame>
  );
}

export const DepressionChapterVisualization = memo(function DepressionChapterVisualization({ chart }: { chart: DepressionMobileChart }) {
  switch (chart.kind) {
    case "anchors": return <RootsAnchorChart chart={chart} detail={chart.id.endsWith("detail")} />;
    case "comparison-bars": return <PrintComparisonChart chart={chart} />;
    case "smoothed-lines": return <HistoricalNeighborsChart chart={chart} />;
    case "crossover-lines": return <CrossoverChart chart={chart} />;
    case "phrase-multiples": return <PhraseChart chart={chart} />;
    case "lollipop": return <CrisisLollipopChart chart={chart} />;
    case "crisis-multiples": return <PhraseChart chart={chart} crisis />;
    case "plateau-bars": return <PlateauChart chart={chart} />;
    case "clinical-multiples": return <ClinicalBeforeRiseChart chart={chart} />;
    case "diagnostic-multiples": return <DiagnosticLabelsChart chart={chart} />;
    case "modern-contrast": return <ModernContrastChart chart={chart} />;
  }
});
