"use client";

import type { HubPeriodId } from "@/types/hubMobileAnalysis";
import styles from "./mobile-hub.module.css";

export type HubLineSeries = {
  id: string;
  label: string;
  color: string;
  values: Array<{ periodId: HubPeriodId; value: number }>;
};

export function frequencyLabel(value: number) {
  if (value === 0) return "0";
  if (Math.abs(value) < 0.0001) return "<0.0001";
  if (Math.abs(value) < 0.01) return value.toFixed(4);
  return value.toFixed(3);
}

export function niceCeiling(value: number) {
  if (value <= 0) return 1;
  const exponent = 10 ** Math.floor(Math.log10(value));
  const normalized = value / exponent;
  const nice = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return nice * exponent;
}

export function HubLinePlot({
  series,
  periodLabels,
  maxValue,
  activeId,
  selectedPoint,
  onSelectPoint,
  ariaLabel,
  normalized = false,
}: {
  series: HubLineSeries[];
  periodLabels: Array<{ id: HubPeriodId; shortLabel: string }>;
  maxValue: number;
  activeId: string;
  selectedPoint?: number;
  onSelectPoint?: (index: number) => void;
  ariaLabel: string;
  normalized?: boolean;
}) {
  const width = 390;
  const height = 286;
  const plot = { left: 54, right: 340, top: 30, bottom: 248 };
  const x = (index: number) => plot.left + (index / Math.max(1, periodLabels.length - 1)) * (plot.right - plot.left);
  const y = (value: number) => plot.bottom - (value / maxValue) * (plot.bottom - plot.top);
  const yTicks = [0, maxValue / 2, maxValue];

  return (
    <svg className={styles.linePlot} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={ariaLabel}>
      <g className={styles.plotGrid}>
        {yTicks.map((tick) => <line key={tick} x1={plot.left} x2={plot.right} y1={y(tick)} y2={y(tick)} />)}
        {periodLabels.map((period, index) => <line key={period.id} x1={x(index)} x2={x(index)} y1={plot.top} y2={plot.bottom} />)}
      </g>
      <line className={styles.plotAxis} x1={plot.left} x2={plot.left} y1={plot.top} y2={plot.bottom} />
      <line className={styles.plotAxis} x1={plot.left} x2={plot.right} y1={plot.bottom} y2={plot.bottom} />
      {yTicks.map((tick) => <text key={tick} className={styles.plotTick} x={plot.left - 8} y={y(tick) + 4} textAnchor="end">{normalized ? Math.round(tick) : frequencyLabel(tick)}</text>)}
      {periodLabels.map((period, index) => <text key={period.id} className={styles.plotTick} x={x(index)} y={plot.bottom + 22} textAnchor="middle">{period.shortLabel}</text>)}
      <text className={styles.plotUnit} x={plot.left} y="14">{normalized ? "INDEX / PEAK = 100" : "OCCURRENCES PER MILLION"}</text>
      {series.map((line) => {
        const isActive = line.id === activeId;
        const points = line.values.map((point, index) => `${x(index)},${y(point.value)}`).join(" ");
        return (
          <g key={line.id} className={styles.plotSeries} data-active={isActive}>
            <polyline points={points} fill="none" stroke={line.color} strokeWidth={isActive ? 3.4 : 1.3} vectorEffect="non-scaling-stroke" />
            {isActive ? line.values.map((point, index) => (
              <g key={point.periodId}>
                <circle cx={x(index)} cy={y(point.value)} r={selectedPoint === index ? 5.8 : 3.7} fill={line.color} stroke="#111018" strokeWidth="1.1" />
                {onSelectPoint ? (
                  <circle
                    className={styles.plotHitTarget}
                    cx={x(index)} cy={y(point.value)} r="23"
                    tabIndex={0}
                    role="button"
                    aria-label={`${line.label}, ${periodLabels[index].shortLabel}, ${normalized ? `${Math.round(point.value)} index` : `${frequencyLabel(point.value)} occurrences per million`}`}
                    onClick={() => onSelectPoint(index)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onSelectPoint(index);
                      }
                    }}
                  />
                ) : null}
              </g>
            )) : null}
          </g>
        );
      })}
    </svg>
  );
}
