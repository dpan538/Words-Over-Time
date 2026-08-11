"use client";

import { useState } from "react";
import type { ForeverMobileAnalysis, ForeverMobileMetricCondition, ForeverMobileMetricId } from "@/types/foreverMobileAnalysis";
import styles from "./mobile-forever.module.css";

type MobileForeverMetricConditionsProps = {
  conditions: ForeverMobileAnalysis["metricConditions"];
};

function pointsFor(condition: ForeverMobileMetricCondition, width: number, height: number) {
  const step = width / condition.decades.length;
  return condition.decades
    .map((row, index) => `${step * index + step / 2},${height - row.joinedPercent / 100 * height}`)
    .join(" ");
}

function displayValue(metric: ForeverMobileMetricId, value: number) {
  if (metric === "reach") return value.toFixed(0);
  return value.toFixed(2);
}

export function MobileForeverMetricConditions({ conditions }: MobileForeverMetricConditionsProps) {
  const [selectedId, setSelectedId] = useState<ForeverMobileMetricId>("rate");
  const selected = conditions.find((condition) => condition.id === selectedId) ?? conditions[0];
  const latest = selected.decades[selected.decades.length - 1];

  return (
    <section
      className={styles.metricSection}
      data-figure-id="F04"
      data-surface-category="visualization"
      aria-labelledby="m-forever-f04-title"
    >
      <header className={styles.metricHeader}>
        <p className={styles.figureIndex}>04 / CONDITIONS</p>
        <h2 id="m-forever-f04-title">Breadth or repetition?</h2>
        <p>Compare three valid conditions without placing unlike units on one scale.</p>
      </header>

      <div className={styles.metricShell}>
        <div className={styles.metricControls}>
          <div className={styles.metricControlHeader}>
            <span>CONDITION COMPARISON</span>
            <strong>{selected.ratio2010s.toFixed(3)}×</strong>
          </div>
          <div className={styles.metricButtons} role="group" aria-label="Select a Forever comparison condition">
            {conditions.map((condition) => (
              <button
                type="button"
                aria-pressed={condition.id === selectedId}
                key={condition.id}
                onClick={() => setSelectedId(condition.id)}
              >
                <svg viewBox="0 0 72 18" role="img" aria-label={`${condition.label} decade sparkline`}>
                  <polyline points={pointsFor(condition, 72, 18)} />
                </svg>
                <span>{condition.label}</span>
              </button>
            ))}
          </div>
          <div className={styles.metricIntensity}>
            <span style={{ "--metric-ratio": `${Math.min(selected.ratio2010s / 5 * 100, 100)}%` } as React.CSSProperties} />
          </div>
          <p>{selected.unit}</p>
        </div>

        <div className={styles.metricChartPanel}>
          <p className={styles.metricPanelLabel}>1920s→2010s / exact forms</p>
          <p className={styles.metricPanelReading}>{selected.interpretation}</p>
          <div className={styles.metricChart}>
            <svg className={styles.metricGuide} viewBox="0 0 1000 100" preserveAspectRatio="none" role="img">
              <title>{`${selected.label} joined-form endpoint guide`}</title>
              <desc>Ten decade endpoints for forever under the selected condition.</desc>
              <polyline points={pointsFor(selected, 1000, 100)} />
            </svg>
            {selected.decades.map((row) => (
              <div
                className={styles.metricStemSlot}
                key={row.id}
                aria-label={`${row.label}: forever ${displayValue(selected.id, row.joinedValue)}; for ever ${displayValue(selected.id, row.spacedValue)}; ${selected.unit}`}
              >
                <span
                  className={styles.metricStem}
                  style={{
                    "--joined-height": `${row.joinedPercent}%`,
                    "--spaced-height": `${row.spacedPercent}%`,
                    "--extension-height": `${row.extensionPercent}%`,
                  } as React.CSSProperties}
                >
                  <i className={styles.metricSpacedStem} />
                  <i className={styles.metricJoinedExtension} />
                  <i className={styles.metricEndpoint} />
                </span>
                <small>{row.label.slice(2, 4)}</small>
              </div>
            ))}
          </div>
          <dl className={styles.metricLatestValues}>
            <div><dt>for ever / 2010s</dt><dd>{displayValue(selected.id, latest.spacedValue)}</dd></div>
            <div><dt>forever / 2010s</dt><dd>{displayValue(selected.id, latest.joinedValue)}</dd></div>
          </dl>
          <p className={styles.metricLive} aria-live="polite">{selected.label}: {selected.headline}. Unit: {selected.unit}.</p>
        </div>
      </div>
    </section>
  );
}
