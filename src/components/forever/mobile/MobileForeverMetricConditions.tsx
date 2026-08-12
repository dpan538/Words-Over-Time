"use client";

import { useState, type CSSProperties } from "react";
import type { ForeverMobileAnalysis, ForeverMobileMetricId } from "@/types/foreverMobileAnalysis";
import styles from "./mobile-forever.module.css";

type MobileForeverMetricConditionsProps = {
  conditions: ForeverMobileAnalysis["metricConditions"];
};

export function MobileForeverMetricConditions({ conditions }: MobileForeverMetricConditionsProps) {
  const [selectedId, setSelectedId] = useState<ForeverMobileMetricId>("rate");
  const [isFlipped, setIsFlipped] = useState(false);
  const selected = conditions.find((condition) => condition.id === selectedId) ?? conditions[0];
  const latest = selected.decades[selected.decades.length - 1];

  return (
    <section className={styles.metricSection} data-figure-id="F04" data-surface-category="visualization" aria-labelledby="m-forever-f04-title">
      <header className={styles.metricHeader}>
        <p className={styles.figureIndex}>04 / CONDITIONS</p>
        <h2 id="m-forever-f04-title">Breadth or repetition?</h2>
        <p>Switch between three valid conditions. The paired decade marks redraw on each condition’s own scale.</p>
      </header>

      <div className={styles.conditionMatrix} data-flipped={isFlipped}>
        <div className={styles.conditionMatrixInner}>
          <div className={styles.conditionMatrixFront} inert={isFlipped} aria-hidden={isFlipped}>
            <button className={styles.conditionFlipSurface} type="button" aria-label={`Explain ${selected.ratio2010s.toFixed(3)} times ${selected.label} ratio`} onClick={() => setIsFlipped(true)}>
              <span>TAP TO FLIP</span>
            </button>
            <header className={styles.conditionMatrixHeader}>
              <span>CONDITION COMPARISON</span>
              <strong>{selected.ratio2010s.toFixed(3)}×</strong>
            </header>
            <div className={styles.conditionButtons} role="group" aria-label="Select a comparison condition">
              {conditions.map((condition) => (
                <button type="button" aria-pressed={condition.id === selectedId} onClick={() => setSelectedId(condition.id)} key={condition.id}>
                  {condition.label}
                </button>
              ))}
            </div>

            <article className={styles.conditionRow}>
              <div className={styles.conditionReadingStack} aria-live="polite">
                {conditions.map((condition) => <p data-active={condition.id === selectedId} key={condition.id}>{condition.interpretation}</p>)}
              </div>
              <div className={styles.conditionMarks} role="img" aria-label={`${selected.label}: paired forever and for ever decade marks from the 1920s to the 2010s`}>
                {selected.decades.map((decade) => (
                  <span className={styles.conditionDecade} key={`${selectedId}-${decade.id}`}>
                    <span className={styles.conditionBars}>
                      <i style={{ "--mark-height": `${Math.max(8, decade.joinedPercent)}%` } as CSSProperties} />
                      <i style={{ "--mark-height": `${Math.max(8, decade.spacedPercent)}%` } as CSSProperties} />
                    </span>
                    <small>{decade.label.slice(2, 4)}</small>
                  </span>
                ))}
              </div>
              <div className={styles.conditionKey}><span><i /> forever</span><span><i /> for ever</span></div>
              <dl className={styles.conditionLatest}>
                <div><dt>forever / 2010s</dt><dd>{latest.joinedDisplayValue}</dd></div>
                <div><dt>for ever / 2010s</dt><dd>{latest.spacedDisplayValue}</dd></div>
              </dl>
              <p className={styles.conditionVisibleUnit}>{selected.displayUnit}</p>
            </article>
          </div>
          <div className={styles.conditionMatrixBack} inert={!isFlipped} aria-hidden={!isFlipped}>
            <button className={styles.conditionFlipSurface} type="button" aria-label="Return to condition chart" onClick={() => setIsFlipped(false)}>
              <span className={styles.visuallyHidden}>Return to chart</span>
            </button>
            <p className={styles.figureIndex}>{selected.label} / RATIO</p>
            <strong>{selected.ratio2010s.toFixed(3)}×</strong>
            <h3>What this comparison means</h3>
            <p>{selected.interpretation}</p>
            <p>The ratio divides the 2010s <em>forever</em> value by the 2010s <em>for ever</em> value inside this condition only.</p>
            {selected.id === "repeat" ? <p>REPEAT is not RATE plus REACH. It measures average exact-form appearances within each containing volume: an intensity condition derived separately for each form.</p> : null}
            <p className={styles.conditionBackUnit}>DISPLAY UNIT / {selected.displayUnit}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
