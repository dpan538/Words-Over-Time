"use client";

import Link from "next/link";
import { Fragment, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useMobileScrollReveal } from "@/components/mobile/useMobileScrollReveal";
import type { PrivacyMobileAnalysis } from "@/types/privacyMobileAnalysis";
import styles from "./mobile-privacy.module.css";

type MobilePrivacyStudyProps = {
  analysis: PrivacyMobileAnalysis;
};

type AttentionTopic = PrivacyMobileAnalysis["attention"]["topics"][number];
type PolicyDocument = PrivacyMobileAnalysis["policyCorpus"]["documents"][number];
type FlipKey = `topic:${string}` | `policy:${string}` | "attention" | "anchors";

const categoryLabels = {
  concept: "CONCEPT",
  governance: "GOVERNANCE",
  pressure: "PRESSURE",
} as const;

const categoryColors = {
  concept: "var(--privacy-coral)",
  governance: "var(--privacy-blue)",
  pressure: "var(--privacy-ink)",
} as const;

const routeLabels: Record<string, string> = {
  rights_personhood: "RIGHTS",
  information_data_protection: "DATA",
  internet_platform_interface: "PLATFORM",
  surveillance_security_tension: "SECURITY",
  breach_risk_compliance: "RISK",
  identity_consent_advertising: "CONSENT",
  ai_biometrics_sensitive_data: "AI",
};

const stateLabels: Record<string, string> = {
  observed_positive: "USED HERE",
  observed_zero: "OBSERVED ZERO",
  absent_or_suppressed: "TOO THIN",
  not_searched: "NOT SEARCHED",
  fetch_failed: "FETCH FAILED",
  unavailable: "UNAVAILABLE",
  incomparable: "NOT COMPARABLE",
  out_of_scope: "OUTSIDE THIS PAGE",
};

function FlipGlyph() {
  return (
    <svg className={styles.flipGlyph} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18.5 7.5H8.75C5.85 7.5 4 9.1 4 11.75" />
      <path d="m15.4 4.4 3.1 3.1-3.1 3.1" />
      <path d="M5.5 16.5h9.75c2.9 0 4.75-1.6 4.75-4.25" />
      <path d="m8.6 19.6-3.1-3.1 3.1-3.1" />
    </svg>
  );
}

function FlipButton({
  active,
  locked,
  onFlip,
  className,
  label,
  front,
  back,
}: {
  active: boolean;
  locked: boolean;
  onFlip: () => void;
  className: string;
  label: string;
  front: ReactNode;
  back: ReactNode;
}) {
  const gesture = useRef({ pointerId: -1, x: 0, y: 0, moved: false });
  const blockClickUntil = useRef(0);

  const finishPointer = (pointerId: number) => {
    if (gesture.current.pointerId !== pointerId) return;
    if (gesture.current.moved) blockClickUntil.current = performance.now() + 350;
    gesture.current.pointerId = -1;
  };

  return (
    <button
      type="button"
      className={`${styles.flipButton} ${className} ${active ? styles.isFlipped : ""}`}
      onPointerDown={(event) => {
        if (!event.isPrimary) return;
        gesture.current = {
          pointerId: event.pointerId,
          x: event.clientX,
          y: event.clientY,
          moved: false,
        };
      }}
      onPointerMove={(event) => {
        if (gesture.current.pointerId !== event.pointerId || gesture.current.moved) return;
        const distance = Math.hypot(
          event.clientX - gesture.current.x,
          event.clientY - gesture.current.y,
        );
        if (distance > 10) gesture.current.moved = true;
      }}
      onPointerUp={(event) => finishPointer(event.pointerId)}
      onPointerCancel={(event) => finishPointer(event.pointerId)}
      onClick={() => {
        if (performance.now() < blockClickUntil.current) return;
        onFlip();
      }}
      disabled={locked}
      aria-pressed={active}
      aria-label={`${label}. ${active ? "Show chart" : "Show definition and source"}`}
    >
      <span className={styles.flipInner}>
        <span className={`${styles.flipFace} ${styles.flipFront}`} aria-hidden={active}>{front}</span>
        <span className={`${styles.flipFace} ${styles.flipBack}`} aria-hidden={!active}>{back}</span>
      </span>
    </button>
  );
}

function TopicMicrovisual({ topic, index }: { topic: AttentionTopic; index: number }) {
  const mode = index % 5;
  const label = `${topic.label}, each annual mark is shown as a percentage of this topic's ${topic.peakYear} peak.`;
  const style = { "--topic-color": categoryColors[topic.category] } as CSSProperties;
  const points = topic.yearly.map((year, pointIndex) => {
    const x = 8 + (pointIndex / Math.max(1, topic.yearly.length - 1)) * 264;
    const y = 7 + ((100 - year.percentOfTopicPeak) / 100) * 56;
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(" ");

  return (
    <div className={styles.topicVisual} style={style}>
      <div className={styles.topicShareMeter} data-chart-grow="meter" role="img" aria-label={`${topic.label} accounts for ${topic.shareOfSelectedInventoryPercent}% of the ten-page attention total from 2018 to 2025.`}>
        <span>8-YEAR SHARE</span>
        <i><b style={{ width: `${topic.shareOfSelectedInventoryPercent}%` }} /></i>
        <strong>{topic.shareOfSelectedInventoryPercent.toFixed(2)}%</strong>
      </div>
      {mode === 0 ? (
        <div className={styles.topicProgress} data-chart-grow="meter" role="img" aria-label={`${topic.latestVsPeakPercent}% of ${topic.label}'s own peak remained in 2025.`}>
          <span>2025 / OWN PEAK</span>
          <strong><i aria-hidden="true" />{topic.latestVsPeakPercent.toFixed(0)}%</strong>
          <i><b style={{ width: `${topic.latestVsPeakPercent}%` }} /></i>
        </div>
      ) : null}
      {mode === 1 ? (
        <div className={styles.topicPerformance} data-chart-grow="bar" role="img" aria-label={label}>
          <span>ANNUAL PERFORMANCE / % OF OWN PEAK</span>
          <div>{topic.yearly.map((year) => <i key={year.year} style={{ opacity: 0.2 + year.percentOfTopicPeak / 125 }} title={`${year.year}: ${year.percentOfTopicPeak}%`}><span>{String(year.year).slice(2)}</span></i>)}</div>
        </div>
      ) : null}
      {mode === 2 ? (
        <div className={styles.topicAnalytics} data-chart-grow="line" role="img" aria-label={label}>
          <span>ANNUAL ANALYTICS / % OF OWN PEAK</span>
          <svg viewBox="0 0 280 70" preserveAspectRatio="none" aria-hidden="true"><path d="M8 7H272M8 35H272M8 63H272" /><polyline points={points} /></svg>
          <div>{topic.yearly.map((year) => <span key={year.year}>{String(year.year).slice(2)}</span>)}</div>
        </div>
      ) : null}
      {mode === 3 ? (
        <div className={styles.topicBalance} data-chart-grow="arc" role="img" aria-label={`${topic.latestVsPeakPercent}% of ${topic.label}'s own peak remained in 2025.`}>
          <span>2025 / OWN PEAK</span>
          <svg viewBox="0 0 280 96" preserveAspectRatio="none" aria-hidden="true">
            <path d="M20 82 A120 70 0 0 1 260 82" pathLength="100" />
            <path
              className={styles.topicBalanceValue}
              d="M20 82 A120 70 0 0 1 260 82"
              pathLength="100"
              strokeDasharray={`${topic.latestVsPeakPercent} 100`}
            />
            <text x="140" y="84">{topic.latestVsPeakPercent.toFixed(0)}%</text>
          </svg>
        </div>
      ) : null}
      {mode === 4 ? (
        <div className={styles.topicActivity} data-chart-grow="bar" role="img" aria-label={label}>
          <span>YEARLY ACTIVITY / % OF OWN PEAK</span>
          <div>{topic.yearly.map((year) => <i key={year.year} title={`${year.year}: ${year.percentOfTopicPeak}%`}><b style={{ height: `${year.percentOfTopicPeak}%` }} /><span>{String(year.year).slice(2)}</span></i>)}</div>
        </div>
      ) : null}
    </div>
  );
}

function PolicyMicrovisual({ document, index }: { document: PolicyDocument; index: number }) {
  const terms = document.terms.filter((term) => term.state === "observed_positive").slice(0, 5);
  const mode = index % 3;
  const formatShare = (value: number) => value < 0.1 ? "<0.1%" : value < 1 ? `${value.toFixed(1)}%` : `${value.toFixed(0)}%`;

  if (document.id === "microsoft_privacy") {
    return (
      <div className={styles.policyComposition} data-chart-grow="meter" role="img" aria-label={`${document.label}: five leading registered phrases shown as parts of the document's registered-phrase total.`}>
        <div className={styles.policyCompositionBar} aria-hidden="true">
          {terms.map((term, rank) => <i key={term.term} data-rank={rank} style={{ width: `${term.shareOfRegisteredPhraseHitsPercent}%` }} />)}
        </div>
        <dl>
          {terms.map((term, rank) => (
            <div key={term.term}>
              <dt><i data-rank={rank} />{term.term.replace("privacy ", "")}</dt>
              <dd><strong>{term.count}</strong><span>{formatShare(term.shareOfRegisteredPhraseHitsPercent)}</span></dd>
            </div>
          ))}
        </dl>
      </div>
    );
  }

  if (mode === 0) {
    return (
      <div className={styles.policyBars} data-chart-grow="meter" role="img" aria-label={`${document.label}, share of all matches to the ten registered policy phrases.`}>
        {terms.map((term) => (
          <div key={term.term}>
            <span>{term.term.replace("privacy ", "")}</span>
            <i><b style={{ width: `${term.shareOfRegisteredPhraseHitsPercent}%` }} /></i>
            <strong>{formatShare(term.shareOfRegisteredPhraseHitsPercent)}</strong>
          </div>
        ))}
      </div>
    );
  }

  if (index === 1) {
    return (
      <div className={styles.policyRankColumns} data-chart-grow="bar" role="img" aria-label={`${document.label}, five registered policy phrases. Each column height is the phrase's exact share of this document's registered-phrase matches.`}>
        {terms.map((term) => (
          <div key={term.term}>
            <strong>{formatShare(term.shareOfRegisteredPhraseHitsPercent)}</strong>
            <i><b style={{ height: `${term.shareOfRegisteredPhraseHitsPercent}%` }} /></i>
            <span>{term.term.replace("privacy ", "")}</span>
            <small>{term.count}</small>
          </div>
        ))}
      </div>
    );
  }

  if (mode === 1) {
    return (
      <div className={styles.policyExactStack} data-chart-grow="meter" role="img" aria-label={`${document.label}: exact positive phrase matches as shares of ${document.matchedPhraseCount} registered-phrase matches.`}>
        <div className={styles.policyStackBar} aria-hidden="true">
          {terms.map((term, rank) => (
            <i key={term.term} data-rank={rank} style={{ width: `${term.shareOfRegisteredPhraseHitsPercent}%` }} />
          ))}
        </div>
        <dl>
          {terms.map((term) => (
            <div key={term.term}>
              <dt>{term.term.replace("privacy ", "")}</dt>
              <dd><strong>{term.count}</strong><span>{formatShare(term.shareOfRegisteredPhraseHitsPercent)}</span></dd>
            </div>
          ))}
        </dl>
      </div>
    );
  }

  return (
    <div className={styles.policyColumns} data-chart-grow="bar" role="img" aria-label={`${document.label}, share of all matches to the ten registered policy phrases shown as columns.`}>
      {terms.map((term) => (
        <div key={term.term}>
          <strong>{formatShare(term.shareOfRegisteredPhraseHitsPercent)}</strong>
          <i><b style={{ height: `${term.shareOfRegisteredPhraseHitsPercent}%` }} /></i>
          <span>{term.term.replace("privacy ", "")}</span>
        </div>
      ))}
    </div>
  );
}

export function MobilePrivacyStudy({ analysis }: MobilePrivacyStudyProps) {
  const motionRef = useMobileScrollReveal<HTMLElement>();
  const [flipped, setFlipped] = useState<Set<FlipKey>>(() => new Set());
  const lastYear = analysis.attention.categoryYearly.at(-1)!;
  const firstYear = analysis.attention.categoryYearly[0]!;
  const maxAnnualViews = Math.max(...analysis.attention.categoryYearly.map((year) => year.total));
  const coverageCopy = {
    used: { label: "USED ON THIS PAGE", note: "Complete layers that support the visible findings." },
    thin: { label: "MISSING OR TOO THIN", note: "Recorded as missing evidence, never converted to zero." },
    different: { label: "NOT COMPARABLE", note: "Real records whose units cannot share this page’s scales." },
    outside: { label: "LEFT OUT", note: "Failed, partial, or outside the approved question." },
  } as const;

  const toggle = (key: FlipKey) => setFlipped((current) => {
    const next = new Set(current);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    return next;
  });

  return (
    <main ref={motionRef} id="m-privacy-top" className={styles.root} data-privacy-edition="mobile-research">
      <header className={styles.siteHeader}>
        <nav aria-label="Primary navigation">
          <Link href="/">WORDS OVER TIME</Link>
          <Link href="/about">ABOUT</Link>
        </nav>
      </header>

      <section className={styles.subject} data-surface-category="text" aria-labelledby="m-privacy-title">
        <p className={styles.eyebrow}>WORD STUDY</p>
        <h2 id="m-privacy-title">privacy</h2>
        <p className={styles.thesis}>Privacy is both something people look for and something institutions turn into policies, controls, and rights.</p>
        <div className={styles.openingBoard} aria-label="Privacy appears in public attention and across institutional systems">
          <article className={styles.openingLead}>
            <div>
              <strong>{analysis.anchorLedger.transferSharePercent.toFixed(0)}<i>%</i></strong>
              <p>of the verified public sources on this page connect privacy to more than one system.</p>
            </div>
            <div className={styles.peopleScale} data-chart-grow="bar" aria-hidden="true">
              {Array.from({ length: 10 }, (_, index) => <i key={index} data-active={index < Math.round(analysis.anchorLedger.transferSharePercent / 10)} />)}
            </div>
          </article>
          <article className={styles.openingMix}>
            <div className={styles.openingDonut} data-chart-grow="dial" style={{ "--dial-share": `${lastYear.governanceSharePercent * 3.6}deg` } as CSSProperties}>
              <strong>{lastYear.governanceSharePercent.toFixed(0)}%</strong>
              <span>governance attention / {lastYear.year}</span>
            </div>
            <div className={styles.openingSegments}>
              <div data-chart-grow="bar" aria-hidden="true">
                <i style={{ height: `${lastYear.conceptSharePercent}%` }} />
                <i style={{ height: `${lastYear.governanceSharePercent}%` }} />
                <i style={{ height: `${lastYear.pressureSharePercent}%` }} />
              </div>
              <p><b>{lastYear.conceptSharePercent.toFixed(0)}%</b> idea<br /><b>{lastYear.governanceSharePercent.toFixed(0)}%</b> governance<br /><b>{lastYear.pressureSharePercent.toFixed(0)}%</b> pressure</p>
            </div>
          </article>
          <ul className={styles.openingLegend}>
            <li><i />WHAT PEOPLE OPEN</li>
            <li><i />WHAT POLICIES SAY</li>
            <li><i />WHERE RIGHTS AND RISKS MEET</li>
          </ul>
        </div>
      </section>

      <section className={styles.attentionField} data-surface-category="visualization" aria-labelledby="m-privacy-attention-title">
        <header className={styles.fieldHeader}>
          <div>
            <p className={styles.figureIndex}>01 / ATTENTION</p>
            <h2 id="m-privacy-attention-title">What people opened changed.</h2>
          </div>
          <p className={styles.periodBadge}>{analysis.attention.startYear}—{analysis.attention.endYear}</p>
        </header>

        <div className={styles.attentionSummary}>
          <div
            className={styles.shareDial}
            data-chart-grow="dial"
            style={{ "--dial-share": `${lastYear.governanceSharePercent * 3.6}deg` } as CSSProperties}
            role="img"
            aria-label={`Governance pages account for ${lastYear.governanceSharePercent} percent of selected pageviews in ${lastYear.year}.`}
          >
            <div>
              <strong>{lastYear.governanceSharePercent.toFixed(2)}%</strong>
              <span>GOVERNANCE / {lastYear.year}</span>
            </div>
          </div>
          <p><strong>+{(lastYear.governanceSharePercent - firstYear.governanceSharePercent).toFixed(2)}</strong><span>percentage points since {firstYear.year}</span></p>
        </div>

        <figure className={styles.attentionChart}>
          <div className={styles.attentionBars} data-chart-grow="bar">
            {analysis.attention.categoryYearly.map((year) => (
              <div className={styles.attentionYear} key={year.year}>
                <div
                  className={styles.attentionStack}
                  style={{ height: `${Math.max(31, (year.total / maxAnnualViews) * 100)}%` }}
                  aria-label={`${year.year}: ${year.total.toLocaleString("en-US")} selected pageviews; ${year.governanceSharePercent}% governance, ${year.conceptSharePercent}% concept, ${year.pressureSharePercent}% pressure.`}
                >
                  <span style={{ height: `${year.pressureSharePercent}%`, background: categoryColors.pressure }} />
                  <span style={{ height: `${year.governanceSharePercent}%`, background: categoryColors.governance }} />
                  <span style={{ height: `${year.conceptSharePercent}%`, background: categoryColors.concept }} />
                </div>
                <span>{String(year.year).slice(2)}</span>
              </div>
            ))}
          </div>
          <figcaption>
            <span><i style={{ background: categoryColors.concept }} />CONCEPT</span>
            <span><i style={{ background: categoryColors.governance }} />GOVERNANCE</span>
            <span><i style={{ background: categoryColors.pressure }} />PRESSURE</span>
          </figcaption>
        </figure>

        <FlipButton
          active={flipped.has("attention")}
          locked={false}
          onFlip={() => toggle("attention")}
          label="Selected page attention finding"
          className={styles.attentionOverlay}
          front={
            <>
              <span className={styles.cardKicker}>SELECTED-PAGE MIX</span>
              <strong>Governance pages occupy a larger share than in {firstYear.year}.</strong>
              <span className={styles.tapLabel}>TAP TO READ <FlipGlyph /></span>
            </>
          }
          back={
            <>
              <span className={styles.cardKicker}>WHAT THIS MEANS</span>
              <p>These shares compare the same ten coverage-complete English Wikipedia pages each year. They show navigation attention, not public opinion or language use.</p>
              <span className={styles.sourceLine}>{analysis.attention.source} / partial {analysis.attention.excludedPartialYear} excluded</span>
            </>
          }
        />
      </section>

      <section className={styles.topicSection} data-surface-category="cards" aria-labelledby="m-privacy-topics-title">
        <header className={styles.sectionHeader}>
          <p className={styles.figureIndex}>02 / TEN WINDOWS</p>
          <h2 id="m-privacy-topics-title">The selected topics do not move together.</h2>
        </header>
        <div className={styles.widgetGrid}>
          {analysis.attention.topics.map((topic, index) => {
            const key = `topic:${topic.page}` as const;
            const tone = [styles.topicToneOne, styles.topicToneTwo, styles.topicToneThree][index % 3];
            const isDataPrivacyBridge = topic.label === "Data privacy";
            return (
              <Fragment key={topic.page}>
                {index === 3 ? (
                  <p className={`${styles.readingBreak} ${styles.minorTopicReading}`}>
                    <strong>“Data privacy” is a smaller window in this record.</strong> It contributes {topic.shareOfSelectedInventoryPercent.toFixed(2)}% of the selected ten-page attention total, while its {analysis.attention.endYear} traffic remains {topic.latestVsPeakPercent.toFixed(0)}% of its own {topic.peakYear} peak. The next group moves into policy, rights, and surveillance.
                  </p>
                ) : null}
                {index === 7 ? (
                  <p className={styles.readingBreak}>The final three windows narrow the view to state law, breach pressure, and digital rights. Every percentage still uses the same ten-page total.</p>
                ) : null}
                {!isDataPrivacyBridge ? <FlipButton
                  active={flipped.has(key)}
                  locked={false}
                  onFlip={() => toggle(key)}
                  label={topic.label}
                  className={`${styles.topicCard} ${tone}`}
                  front={
                    <>
                      <span className={styles.widgetHeader}><b>{topic.label}</b><i>{categoryLabels[topic.category]}</i></span>
                      <strong className={styles.widgetValue}>{topic.shareOfSelectedInventoryPercent.toFixed(2)}<i>%</i></strong>
                      <span className={styles.widgetUnit}>OF THE TEN-PAGE ATTENTION TOTAL / {analysis.attention.startYear}—{analysis.attention.endYear}</span>
                      <TopicMicrovisual topic={topic} index={index} />
                      <span className={styles.widgetFooter}>{analysis.attention.endYear} = {topic.latestVsPeakPercent.toFixed(0)}% OF ITS PEAK <FlipGlyph /></span>
                    </>
                  }
                  back={
                    <>
                      <span className={styles.cardKicker}>{categoryLabels[topic.category]} / SOURCE</span>
                      <strong>{topic.label}</strong>
                      <p>Annual English Wikipedia pageviews. The total and peak use the complete {analysis.attention.startYear}–{analysis.attention.endYear} window only.</p>
                      <span className={styles.sourceLine}>WIKIMEDIA PAGEVIEWS API / EXACT PAGE TITLE</span>
                    </>
                  }
                /> : null}
              </Fragment>
            );
          })}
        </div>
        <details className={styles.missingWidget}>
          <summary>GDPR / DIFFERENT TIME WINDOW <span aria-hidden="true">+</span></summary>
          <p>The frozen series starts in 2022, so it is not inserted into the shared 2018–2025 comparison. Its absence here is not a zero.</p>
        </details>
      </section>

      <div className={styles.fieldTurn} aria-hidden="true"><span>ATTENTION</span><b><i /></b><span>INFRASTRUCTURE</span></div>

      <section className={styles.policySection} data-surface-category="visualization" aria-labelledby="m-privacy-policy-title">
        <header className={styles.sectionHeader}>
          <p className={styles.figureIndex}>03 / POLICY LANGUAGE</p>
          <h2 id="m-privacy-policy-title">Privacy becomes interface language.</h2>
          <p>Five complete frozen documents use different operational vocabularies.</p>
        </header>
        <div className={styles.policyGrid}>
          {analysis.policyCorpus.documents.map((document, index) => {
            const key = `policy:${document.id}` as const;
            const tone = [styles.policyToneOne, styles.policyToneTwo, styles.policyToneThree, styles.policyToneFour, styles.policyToneFive][index];
            return (
              <Fragment key={document.id}>
                {index === 2 ? (
                  <p className={styles.readingBreak}>The first two documents come from large online services. The last three come from a smaller service, a state regulator, and European law. Together they show how privacy language changes with the job each document has to do.</p>
                ) : null}
                <FlipButton
                  active={flipped.has(key)}
                  locked={false}
                  onFlip={() => toggle(key)}
                  label={document.label}
                  className={`${styles.policyCard} ${tone} ${document.terms.filter((term) => term.state === "observed_positive").length <= 3 ? styles.compactPolicyCard : ""} ${index === 2 ? styles.tallPolicyCard : ""}`}
                  front={
                    <>
                      <span className={styles.widgetHeader}><b>{document.label}</b><i>{document.matchedPhraseCount} MATCHES</i></span>
                      <PolicyMicrovisual document={document} index={index} />
                      <span className={styles.widgetFooter}>SHARE OF TEN REGISTERED PHRASES <FlipGlyph /></span>
                    </>
                  }
                  back={
                    <>
                      <span className={styles.cardKicker}>CAPTURE BOUNDARY</span>
                      <strong>{document.label}</strong>
                      <p>Exact adjacent phrase counts in one frozen document. Frequency does not measure policy quality, legal strength, or semantic importance.</p>
                      <span className={styles.sourceLine}>{document.tokenCount.toLocaleString("en-US")} VISIBLE TOKENS / SOURCE LINK IN DISCLOSURE</span>
                    </>
                  }
                />
              </Fragment>
            );
          })}
        </div>
      </section>

      <section className={styles.anchorSection} data-surface-category="visualization" aria-labelledby="m-privacy-anchor-title">
        <header className={styles.sectionHeader}>
          <p className={styles.figureIndex}>04 / PUBLIC SYSTEMS</p>
          <h2 id="m-privacy-anchor-title">One source can belong to several privacy systems.</h2>
        </header>

        <FlipButton
          active={flipped.has("anchors")}
          locked={false}
          onFlip={() => toggle("anchors")}
          label="Institutional route explanation"
          className={styles.institutionSummary}
          front={
            <>
              <span className={styles.cardKicker}>SHARED ROUTES</span>
              <strong>{analysis.anchorLedger.transferSharePercent.toFixed(0)}<i>%</i></strong>
              <p>{analysis.anchorLedger.transferCount} of {analysis.anchorLedger.includedCount} verified sources appear in more than one part of the privacy story.</p>
              <span className={styles.tapLabel}>TAP FOR BOUNDARY <FlipGlyph /></span>
            </>
          }
          back={
            <>
              <span className={styles.cardKicker}>CURATED PUBLIC RECORD</span>
              <p>This is a selected, verified source ledger rather than a complete global history. Shared routes show classification, not causal influence.</p>
              <span className={styles.sourceLine}>{analysis.anchorLedger.inclusionRule}</span>
            </>
          }
        />

        <div className={styles.systemComposition}>
          <div className={styles.routeBands} data-chart-grow="meter" aria-label="Share of seventeen verified sources registered to each privacy system">
            {analysis.anchorLedger.routeCounts.map((route) => (
              <div key={route.routeId}>
                <span>{routeLabels[route.routeId] ?? route.routeId}</span>
                <i><b style={{ width: `${route.shareOfAnchorsPercent}%` }} /></i>
                <strong>{route.shareOfAnchorsPercent.toFixed(0)}%</strong>
              </div>
            ))}
          </div>
        </div>
        <p className={styles.overlapNote}>Each route uses the same 17-source denominator. A source can belong to several routes, so these percentages overlap rather than add to 100%.</p>
        <details className={styles.anchorRecords}>
          <summary>17 VERIFIED SOURCE RECORDS <span aria-hidden="true">+</span></summary>
          <div className={styles.anchorCards}>
            {analysis.anchorLedger.anchors.map((anchor) => (
              <a key={anchor.id} href={anchor.sourceUrl} target="_blank" rel="noreferrer" data-transfer={anchor.isTransfer}>
                <span>{anchor.year}</span><strong>{anchor.label}</strong>
              </a>
            ))}
          </div>
        </details>
      </section>

      <section className={styles.coverageSection} data-surface-category="visualization" aria-labelledby="m-privacy-coverage-title">
        <header className={styles.sectionHeader}>
          <p className={styles.figureIndex}>05 / WHAT MADE THE CUT</p>
          <h2 id="m-privacy-coverage-title">Missing evidence stays missing.</h2>
        </header>
        <div className={styles.coverageTiles}>
          {analysis.coverageSummary.map((group) => (
            <article key={group.id} data-group={group.id}>
              <strong>{group.shareOfAuditedLayersPercent.toFixed(1)}<i>%</i></strong>
              <span>{coverageCopy[group.id].label}</span>
              <p>{group.layerCount} / {analysis.coverageAudit.length} layers. {coverageCopy[group.id].note}</p>
            </article>
          ))}
        </div>
        <p className={styles.coverageReading}>Only three audited layers support the visible figures. The rest stay named here so a missing, partial, or incompatible source cannot silently become evidence—or be mistaken for zero.</p>
        <details className={styles.coverageDetails}>
          <summary>SEE EVERY EVIDENCE STATE <span aria-hidden="true">+</span></summary>
          <div>
            {analysis.coverageAudit.map((layer) => (
              <article key={layer.layerId} data-state={layer.state}>
                <span>{stateLabels[layer.state] ?? layer.state}</span>
                <strong>{layer.layerId.replaceAll("_", " ")}</strong>
                <p>{layer.reason}</p>
              </article>
            ))}
          </div>
        </details>
      </section>

      <section className={styles.closing} data-surface-category="text">
        <p className={styles.figureIndex}>CLOSING READING</p>
        <h2>Privacy is not one thing moving in one direction.</h2>
        <p className={styles.closingLead}>The selected attention record and the institutional record meet at an operating surface: people encounter privacy as an idea, while documents and institutions translate it into notices, choices, duties, and risks.</p>
        <details className={styles.closingSources}>
          <summary>SOURCES / RIGHTS <span aria-hidden="true">+</span></summary>
          <div>
            <p>Attention figures use frozen Wikimedia Pageviews API responses for ten English Wikipedia pages with complete 2018–2025 coverage.</p>
            <p>Policy language uses exact phrase counts from five frozen public policy or regulator documents that pass the 1,000-token capture floor. Upstream text retains its original rights.</p>
            <p>Institutional anchors link to the named public sources. Research, data transforms, writing and design are by Dai Pan / 潘岱.</p>
            <nav aria-label="Privacy sources and project links">
              {analysis.policyCorpus.documents.map((document) => <a key={document.id} href={document.url} target="_blank" rel="noreferrer">{document.label} <span className={styles.externalGlyph} aria-hidden="true" /></a>)}
              <Link href="/about">Method and rights <span className={styles.externalGlyph} aria-hidden="true" /></Link>
              <a href="https://github.com/dpan538/Words-Over-Time" target="_blank" rel="noreferrer">Project repository <span className={styles.externalGlyph} aria-hidden="true" /></a>
            </nav>
          </div>
        </details>
        <a className={styles.backToTop} href="#m-privacy-top">BACK TO TOP <span className={styles.upGlyph} aria-hidden="true" /></a>
      </section>

      <footer className={styles.footer}><p>Words Over Time: semantic change and word usage over time</p></footer>
    </main>
  );
}
