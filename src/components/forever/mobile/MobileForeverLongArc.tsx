import type { ForeverMobileAnalysis } from "@/types/foreverMobileAnalysis";
import styles from "./mobile-forever.module.css";

type MobileForeverLongArcProps = {
  analysis: ForeverMobileAnalysis;
};

export function MobileForeverLongArc({ analysis }: MobileForeverLongArcProps) {
  const { longArcAnchors, milestones } = analysis;

  return (
    <section
      className={styles.longArc}
      data-figure-id="F01"
      data-surface-category="visualization"
      aria-labelledby="m-forever-f01-title"
    >
      <figure className={styles.arcSheet}>
        <figcaption className={styles.sheetHeader}>
          <p className={styles.figureIndex}>01 / LONG ARC</p>
          <h2 id="m-forever-f01-title">Visibility / form</h2>
          <p>{analysis.units.rate}</p>
        </figcaption>

        <div className={styles.arcPeriodRow} aria-hidden="true">
          {longArcAnchors.map((decade) => <span key={decade.id}>{decade.label}</span>)}
        </div>

        <div className={styles.arcChart} data-chart-grow="bar" aria-label="Five selected decade rates on a zero to seventy scale">
          {longArcAnchors.map((decade) => (
            <div className={styles.arcColumnSlot} key={decade.id}>
              <div
                className={styles.arcColumn}
                style={{
                  "--arc-total": `${decade.visual.combinedOnSeventyPercent}%`,
                  "--arc-joined": `${decade.visual.joinedOnSeventyPercent}%`,
                  "--arc-spaced": `${decade.visual.spacedOnSeventyPercent}%`,
                } as React.CSSProperties}
              >
                <span className={styles.arcTotalLabel}>{decade.combinedRatePerMillionWords.toFixed(2)}</span>
                <span className={styles.arcSpacedLabel}>{decade.spacedRatePerMillionWords.toFixed(2)}</span>
                <span className={styles.arcJoinedLabel}>{decade.joinedRatePerMillionWords.toFixed(2)}</span>
                <span className={styles.arcSpacedSegment} />
                <span className={styles.arcJoinedSegment} />
              </div>
            </div>
          ))}
        </div>

        <div className={styles.formKey} aria-label="Form key">
          <span><i className={styles.joinedKey} /> forever</span>
          <span><i className={styles.spacedKey} /> for ever</span>
        </div>

        <table className={styles.srOnly}>
          <caption>Selected decade exact-form rates per million corpus word tokens</caption>
          <thead><tr><th>Decade</th><th>forever</th><th>for ever</th><th>pair total</th></tr></thead>
          <tbody>
            {longArcAnchors.map((decade) => (
              <tr key={decade.id}>
                <th>{decade.label}</th>
                <td>{decade.joinedRatePerMillionWords}</td>
                <td>{decade.spacedRatePerMillionWords}</td>
                <td>{decade.combinedRatePerMillionWords}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </figure>

      <figure className={styles.returnSheet}>
        <figcaption className={styles.returnHeader}>
          <p className={styles.figureIndex}>PAIR CURRENT</p>
          <h2>Peak / low / return</h2>
        </figcaption>
        <div className={styles.returnSteps}>
          <div className={styles.returnStepPeak}>
            <strong>{milestones.peak1820s.combinedRatePerMillionWords.toFixed(2)}</strong>
            <span>1820s / pair peak</span>
          </div>
          <div className={styles.returnStepLow}>
            <strong>{milestones.low1980s.combinedRatePerMillionWords.toFixed(2)}</strong>
            <span>1980s / pair low</span>
          </div>
          <div className={styles.returnStepNow}>
            <strong>{milestones.return2010s.combinedRatePerMillionWords.toFixed(2)}</strong>
            <span>2010s / return</span>
          </div>
        </div>
        <dl className={styles.returnFooter}>
          <div><dt>Peak→low</dt><dd>{milestones.peakToLowPercentChange.toFixed(2)}%</dd></div>
          <div><dt>Low→2010s</dt><dd>{milestones.lowToReturnFactor.toFixed(2)}×</dd></div>
          <div><dt>Below peak</dt><dd>{milestones.returnBelowPeakPercent.toFixed(2)}%</dd></div>
        </dl>
        <p className={styles.localCaveat}>A partial return in one fixed corpus, not a full recovery.</p>
      </figure>
    </section>
  );
}
