import type { ForeverAnalysisArtifact } from "@/types/foreverAnalysis";
import styles from "./forever-mobile-data-gate.module.css";

type ForeverMobileDataGateProps = {
  analysis: ForeverAnalysisArtifact;
};

export function ForeverMobileDataGate({ analysis }: ForeverMobileDataGateProps) {
  const { dataGate, denominatorAudit, manifestSummary } = analysis;

  return (
    <article
      className={styles.root}
      data-forever-edition="mobile"
      data-data-gate={dataGate.status}
      aria-labelledby="m-forever-data-gate-title"
    >
      <header className={styles.gateHeader}>
        <p className={styles.eyebrow}>Raw-data audit / publication gate</p>
        <h2 className={styles.gateTitle} id="m-forever-data-gate-title">
          {dataGate.displayTitle}
        </h2>
        <p className={styles.gateSummary}>{dataGate.displaySummary}</p>

        <dl className={styles.gateFacts}>
          <div>
            <dt>Status</dt>
            <dd>{dataGate.status}</dd>
          </div>
          <div>
            <dt>Registered audit inputs</dt>
            <dd>{manifestSummary.registeredInputCount}</dd>
          </div>
          <div>
            <dt>Production-eligible panels</dt>
            <dd>{manifestSummary.productionEligiblePanelCount}</dd>
          </div>
        </dl>
      </header>

      <section className={styles.section} aria-labelledby="m-forever-stop-reasons-title">
        <p className={styles.sectionIndex}>01 / Why publication stops</p>
        <h3 className={styles.sectionTitle} id="m-forever-stop-reasons-title">
          Missing inputs are not zeroes.
        </h3>
        <ol className={styles.reasonList}>
          {dataGate.reasons.map((reason) => (
            <li key={reason}>{reason}</li>
          ))}
        </ol>
      </section>

      <section className={styles.section} aria-labelledby="m-forever-denominator-title">
        <p className={styles.sectionIndex}>02 / Denominator audit</p>
        <h3 className={styles.sectionTitle} id="m-forever-denominator-title">
          Different n-gram orders, different denominators.
        </h3>
        <p className={styles.sectionLead}>
          Viewer-normalized values may only be read in the unit attached to their own n-gram order. The joined and spaced forms do not share a proven annual word-token denominator.
        </p>

        <div className={styles.seriesList} aria-label="Audited Google Viewer series units">
          {denominatorAudit.series.map((series) => (
            <dl className={styles.seriesCard} key={series.query}>
              <div className={styles.seriesName}>
                <dt>Query</dt>
                <dd>{series.query}</dd>
              </div>
              <div>
                <dt>N-gram order</dt>
                <dd>{series.ngramOrder}</dd>
              </div>
              <div>
                <dt>Allowed unit</dt>
                <dd>{series.allowedUnit}</dd>
              </div>
              <div>
                <dt>Retained observations</dt>
                <dd>{series.pointCount}</dd>
              </div>
              <div>
                <dt>Viewer year range</dt>
                <dd>{series.startYear}–{series.endYear}</dd>
              </div>
              <div className={styles.denominatorRow}>
                <dt>Denominator</dt>
                <dd>{series.denominator}</dd>
              </div>
            </dl>
          ))}
        </div>

        <div className={styles.interpretationGrid}>
          <div>
            <h4>Allowed after provenance repair</h4>
            <ul>
              {denominatorAudit.allowedUse.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className={styles.prohibited}>
            <h4>Not allowed from current data</h4>
            <ul>
              {denominatorAudit.prohibitedUse.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="m-forever-inputs-title">
        <p className={styles.sectionIndex}>03 / Raw inputs required</p>
        <h3 className={styles.sectionTitle} id="m-forever-inputs-title">
          What must exist before form can follow data.
        </h3>

        <div className={styles.gapList}>
          {analysis.requiredRawGaps.map((gap) => (
            <article className={styles.gapCard} key={gap.id}>
              <header>
                <p>{gap.priority}</p>
                <h4>{gap.id}</h4>
              </header>
              <p>{gap.whyRequired}</p>
              <ul>
                {gap.missingFilesOrFields.map((field) => (
                  <li key={field}>{field}</li>
                ))}
              </ul>
              <p className={styles.sourceBoundary}>
                Source boundary / {gap.officialSourceBoundary}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section} aria-labelledby="m-forever-contracts-title">
        <p className={styles.sectionIndex}>04 / Figure contracts</p>
        <h3 className={styles.sectionTitle} id="m-forever-contracts-title">
          Candidate figures remain contracts, not graphics.
        </h3>
        <div className={styles.contractList}>
          {analysis.figureContractRegistry.contracts.map((contract) => (
            <article className={styles.contractCard} key={contract.id}>
              <p>{contract.id}</p>
              <h4>{contract.candidatePanel}</h4>
              <p>{contract.eligibilityReason}</p>
              <p className={styles.contractStatus}>
                Production eligible / {String(contract.productionEligible)}
              </p>
            </article>
          ))}
        </div>
      </section>

      <details className={styles.trace}>
        <summary>Audit trace / values and assertions</summary>
        <div className={styles.traceBody}>
          <p>
            Audit ID / {analysis.auditId}<br />
            Input-set SHA-256 / {manifestSummary.inputSetSha256}
          </p>
          <h3>Raw → derived → rendered spot checks</h3>
          <ol className={styles.spotChecks}>
            {analysis.spotChecks.map((spotCheck) => (
              <li
                data-derived-value={spotCheck.renderedValue}
                data-finding-ids={spotCheck.findingIds.join(" ")}
                data-spot-check-id={spotCheck.id}
                key={spotCheck.id}
              >
                <strong>{spotCheck.id}</strong>
                <span>{spotCheck.rawPath} / {spotCheck.rowSelector}</span>
                <span>{spotCheck.derivation}</span>
                <output>{spotCheck.renderedValue}</output>
              </li>
            ))}
          </ol>
          <h3>Assertions</h3>
          <ul className={styles.assertions}>
            {analysis.assertions.map((assertion) => (
              <li key={assertion.id}>
                <strong>{assertion.id}</strong>
                <span>{assertion.assertion}</span>
              </li>
            ))}
          </ul>
        </div>
      </details>

      <footer className={styles.stopRule}>
        <p>No substantive mobile figure is rendered while this gate is stopped.</p>
      </footer>
    </article>
  );
}
