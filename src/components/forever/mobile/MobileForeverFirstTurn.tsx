"use client";

import { useState } from "react";
import type { ForeverMobileAnalysis } from "@/types/foreverMobileAnalysis";
import styles from "./mobile-forever.module.css";

type MobileForeverFirstTurnProps = {
  annual: ForeverMobileAnalysis["annualFirstTurn"];
  transition: ForeverMobileAnalysis["firstTransition"];
  fromShare: number;
  toShare: number;
};

export function MobileForeverFirstTurn({ annual, transition, fromShare, toShare }: MobileForeverFirstTurnProps) {
  const [selectedYear, setSelectedYear] = useState<1884 | 1886>(1884);
  const selected = annual.find((row) => row.year === selectedYear) ?? annual[2];

  return (
    <section
      className={styles.firstTurn}
      data-figure-id="F02"
      data-surface-category="visualization"
      aria-labelledby="m-forever-f02-title"
    >
      <article className={styles.firstLeadPanel}>
        <div className={styles.capsuleRow}>
          <span className={styles.outlineCapsule}>02 / FIRST TURN</span>
          <span className={styles.circleAffordance} aria-hidden="true">↘</span>
        </div>
        <h2 id="m-forever-f02-title">Majority without growth</h2>
        <p>The joined form becomes the decade-level majority while its own rate remains effectively flat.</p>
        <div className={styles.annualTexture} aria-hidden="true">
          {annual.map((row) => (
            <i
              key={row.year}
              style={{ "--texture-height": `${row.visual.joinedSharePercent}%` } as React.CSSProperties}
            />
          ))}
        </div>
      </article>

      <article className={styles.firstStatPanel}>
        <div className={styles.capsuleRow}>
          <span className={styles.outlineCapsule}>JOINED SHARE</span>
          <span className={styles.circleAffordance} aria-hidden="true">→</span>
        </div>
        <div className={styles.dominantStat}>
          <strong>+{transition.joinedSharePercentagePointChange.toFixed(2)}</strong>
          <span>pp</span>
        </div>
        <p>joined share / 1880s→1890s</p>
        <div className={styles.resultRule} />
        <p className={styles.resultStatement}>{fromShare.toFixed(2)}% → {toShare.toFixed(2)}%</p>
      </article>

      <article className={styles.firstSequencePanel}>
        <div className={styles.capsuleRow}>
          <span className={styles.outlineCapsule}>ANNUAL SEQUENCE</span>
          <span className={styles.selectedYear}>{selected.year}</span>
        </div>
        <div className={styles.sequenceChart} aria-label="Joined share from 1882 through 1887 with a fifty percent threshold">
          <span className={styles.thresholdLine}><b>50%</b></span>
          {annual.map((row) => {
            const focal = row.year === 1884 || row.year === 1885 || row.year === 1886;
            const active = row.year === selectedYear;
            return (
              <div className={styles.sequencePosition} data-active={active} key={row.year}>
                <span
                  className={styles.sequenceBar}
                  style={{ "--share-height": `${row.visual.joinedSharePercent}%` } as React.CSSProperties}
                />
                {focal ? <strong>{row.joinedShareOfExactFormAppearances.toFixed(2)}%</strong> : null}
                <small>{row.year}</small>
              </div>
            );
          })}
        </div>
        <p className={styles.sequenceReading} aria-live="polite">
          {selectedYear === 1884
            ? "1884 / the first crossing in this six-year sequence."
            : "1886 / the crossing resumes and remains above in 1887."}
        </p>
      </article>

      <article className={styles.firstEvidencePanel}>
        <div className={styles.capsuleRow}>
          <span className={styles.outlineCapsule}>CHANGE LEDGER</span>
        </div>
        <dl>
          <div><dt>forever rate</dt><dd>{transition.joinedRatePercentChange.toFixed(2)}%</dd></div>
          <div><dt>for ever rate</dt><dd>{transition.spacedRatePercentChange.toFixed(2)}%</dd></div>
          <div><dt>pair total</dt><dd>{transition.combinedRatePercentChange.toFixed(2)}%</dd></div>
          <div><dt>first sustained reach lead</dt><dd>{transition.firstSustainedReachLeadYear}</dd></div>
        </dl>
      </article>

      <div className={styles.firstTurnSelector} role="group" aria-label="First-turn focal year">
        <button type="button" aria-pressed={selectedYear === 1884} onClick={() => setSelectedYear(1884)}>
          FIRST / 1884
        </button>
        <button type="button" aria-pressed={selectedYear === 1886} onClick={() => setSelectedYear(1886)}>
          SUSTAINED / 1886
        </button>
      </div>
    </section>
  );
}
