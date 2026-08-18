"use client";

import type { CSSProperties } from "react";
import type { HubMobileAnalysis } from "@/types/hubMobileAnalysis";
import { useHubAtmosphereScene } from "./HubAtmosphere";
import styles from "./mobile-hub.module.css";

export function HubVisibilityChart({ analysis }: { analysis: HubMobileAnalysis }) {
  const visibilitySectionRef = useHubAtmosphereScene("visibility");
  const selected = [analysis.visibility[0], analysis.visibility[4], analysis.visibility[5]].map((visibility) => ({
    ...visibility,
    period: analysis.periods.find((period) => period.id === visibility.periodId)!,
  }));

  return (
    <section ref={visibilitySectionRef} className={`${styles.reportSection} ${styles.visibilitySection}`} data-surface-category="visualization" aria-labelledby="hub-visibility-title">
      <header className={styles.sectionHeader}>
        <p>04 / PHRASE VISIBILITY</p>
        <h2 id="hub-visibility-title">More kinds of center became visible.</h2>
        <span>The same fixed inventory is measured in every period; only the visible share changes.</span>
      </header>
      <figure className={styles.visibilityFigure}>
        <div className={styles.visibilityAxis} aria-hidden="true">
          {[0, 25, 50, 75, 100].map((tick) => <span key={tick} style={{ left: `${tick}%` }}>{tick}</span>)}
        </div>
        <div className={styles.visibilityRows}>
          {selected.map((entry, index) => (
            <div className={styles.visibilityRow} key={entry.periodId}>
              <div className={styles.visibilityRowLabel}>
                <strong>{entry.period.label}</strong>
                <span>{entry.visiblePhraseCount} / {analysis.eligiblePhraseCount}</span>
              </div>
              <div className={styles.visibilityTrack} role="img" aria-label={`${entry.period.label}: ${entry.visiblePhraseCount} of ${analysis.eligiblePhraseCount} selected phrases visible, ${entry.visibleSharePercent.toFixed(2)} percent.`}>
                <i style={{ width: `${entry.visibleSharePercent}%`, "--visibility-index": index } as CSSProperties} />
                <b style={{ left: `${entry.visibleSharePercent}%` }} />
                {[0, 25, 50, 75, 100].map((tick) => <span key={tick} style={{ left: `${tick}%` }} />)}
              </div>
              <strong className={styles.visibilityValue}>{entry.visibleSharePercent.toFixed(1)}%</strong>
            </div>
          ))}
        </div>
        <figcaption>MEASURE / share of the same fixed selected phrase inventory at or above {analysis.thresholdPerMillion} occurrences per million.</figcaption>
      </figure>
      <details className={styles.methodFold}>
        <summary>READ THE MEASURE <span aria-hidden="true">+</span></summary>
        <p>A phrase is visible when its unsmoothed twenty-year arithmetic mean reaches the stated threshold. Counts use the fixed denominator of {analysis.eligiblePhraseCount} successfully captured selected phrases. This is a printed-book proxy, not a share of all English uses of “hub.”</p>
      </details>
    </section>
  );
}
