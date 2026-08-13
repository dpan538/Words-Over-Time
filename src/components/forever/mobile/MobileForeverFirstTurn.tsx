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

function annualPoints(annual: ForeverMobileAnalysis["annualFirstTurn"], selector: (row: ForeverMobileAnalysis["annualFirstTurn"][number]) => number) {
  const values = annual.map(selector);
  const maximum = Math.max(...values);
  const minimum = Math.min(...values);
  const span = maximum - minimum || 1;
  return values.map((value, index) => `${index * 20},${92 - ((value - minimum) / span) * 76}`).join(" ");
}

function sequenceX(index: number) {
  return 12 + index * 55.2;
}

function sequenceY(sharePercent: number) {
  return 105 - ((sharePercent - 45) / 10) * 90;
}

export function MobileForeverFirstTurn({ annual, transition, fromShare, toShare }: MobileForeverFirstTurnProps) {
  const [selectedYear, setSelectedYear] = useState<1884 | 1886>(1884);
  const [statFlipped, setStatFlipped] = useState(false);
  const selected = annual.find((row) => row.year === selectedYear) ?? annual[2];

  return (
    <section
      className={styles.firstTurn}
      data-figure-id="F02"
      data-surface-category="visualization"
      aria-labelledby="m-forever-f02-title"
    >
      <header className={styles.firstTurnHeader}>
        <p className={styles.figureIndex}>02 / FIRST TURN</p>
        <h2 id="m-forever-f02-title">Majority without growth</h2>
        <p>The joined form becomes the decade-level majority while its own rate remains effectively flat.</p>
      </header>

      <button className={styles.firstStatFlip} data-chart-grow="meter" data-open={statFlipped} type="button" aria-pressed={statFlipped} aria-label="Flip joined share explanation" onClick={() => setStatFlipped((current) => !current)}>
        <span className={styles.firstStatFlipInner}>
          <span className={styles.firstStatFront}>
            <span className={styles.capsuleRow}>
              <span className={styles.outlineCapsule}>JOINED SHARE</span>
              <span className={styles.circleAffordance} aria-hidden="true">↻</span>
            </span>
            <span className={styles.dominantStat}>
              <strong>+{transition.joinedSharePercentagePointChange.toFixed(2)}</strong>
              <span>pp</span>
            </span>
            <span className={styles.firstStatLabel}>joined share / 1880s→1890s</span>
            <span className={styles.resultRule} />
            <span className={styles.resultStatement}>{fromShare.toFixed(2)}% → {toShare.toFixed(2)}%</span>
          </span>
          <span className={styles.firstStatBack}>
            <span className={styles.tileLabel}>WHY +{transition.joinedSharePercentagePointChange.toFixed(2)} PP?</span>
            <strong>The joined form becomes the decade-level majority even though its own exact-form rate remains effectively flat.</strong>
            <span>This is a change in the pair’s balance: the spaced form declines more sharply between the 1880s and 1890s.</span>
          </span>
        </span>
      </button>

      <article className={styles.firstSequencePanel}>
        <div className={styles.capsuleRow}>
          <span className={styles.outlineCapsule}>ANNUAL SEQUENCE</span>
          <span className={styles.selectedYear}>{selected.year}</span>
        </div>
        <div className={styles.sequenceChart} data-chart-grow="line" data-phase={selectedYear === 1884 ? "first" : "sustained"} aria-label="Joined share line from 1882 through 1887 with a fifty percent threshold">
          <svg viewBox="0 0 300 120" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Annual joined share from 1882 through 1887, shown on a labelled 45 to 55 percent scale">
            <line className={styles.sequenceThreshold} x1="12" y1="60" x2="288" y2="60" />
            <polyline className={styles.sequenceBaseLine} points={annual.map((row, index) => `${sequenceX(index)},${sequenceY(row.visual.joinedSharePercent)}`).join(" ")} />
            <polyline className={`${styles.sequencePhaseLine} ${styles.sequenceFirstLine}`} points={annual.slice(0, 3).map((row, index) => `${sequenceX(index)},${sequenceY(row.visual.joinedSharePercent)}`).join(" ")} />
            <polyline className={`${styles.sequencePhaseLine} ${styles.sequenceSustainedLine}`} points={annual.slice(3).map((row, index) => `${sequenceX(index + 3)},${sequenceY(row.visual.joinedSharePercent)}`).join(" ")} />
            {annual.map((row, index) => (
              <circle data-phase={index <= 2 ? "first" : "sustained"} className={row.year === selectedYear ? styles.sequenceActivePoint : undefined} cx={sequenceX(index)} cy={sequenceY(row.visual.joinedSharePercent)} r={row.year === selectedYear ? 4 : 2.7} key={row.year} />
            ))}
          </svg>
          <span className={`${styles.sequenceDomainLabel} ${styles.sequenceDomainTop}`}>55%</span>
          <span className={styles.sequenceThresholdLabel}>50%</span>
          <span className={`${styles.sequenceDomainLabel} ${styles.sequenceDomainBottom}`}>45%</span>
          <div className={styles.sequenceYears}>{annual.map((row) => <small key={row.year}>{row.year}</small>)}</div>
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
        <div className={styles.changeLedgerChart} data-chart-grow="line">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label="Annual exact-form rate paths across the first-turn sequence">
            <polyline className={styles.ledgerJoined} points={annualPoints(annual, (row) => row.joinedRatePerMillionWords)} />
            <polyline className={styles.ledgerSpaced} points={annualPoints(annual, (row) => row.spacedRatePerMillionWords)} />
            <polyline className={styles.ledgerPair} points={annualPoints(annual, (row) => row.joinedRatePerMillionWords + row.spacedRatePerMillionWords)} />
          </svg>
          <div className={styles.changeLedgerYears}>{annual.map((row) => <span key={row.year}>{row.year}</span>)}</div>
        </div>
        <dl className={styles.changeLedgerLegend}>
          <div><dt><i className={styles.ledgerJoined} />forever</dt><dd>{transition.joinedRatePercentChange.toFixed(2)}%</dd></div>
          <div><dt><i className={styles.ledgerSpaced} />for ever</dt><dd>{transition.spacedRatePercentChange.toFixed(2)}%</dd></div>
          <div><dt><i className={styles.ledgerPair} />pair total</dt><dd>{transition.combinedRatePercentChange.toFixed(2)}%</dd></div>
        </dl>
        <p className={styles.reachLead}>First sustained reach lead / <strong>{transition.firstSustainedReachLeadYear}</strong></p>
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
