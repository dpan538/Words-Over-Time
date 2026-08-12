import Link from "next/link";
import type { ForeverMobileAnalysis } from "@/types/foreverMobileAnalysis";
import { MobileForeverCompositionFlipField } from "./MobileForeverCompositionFlipField";
import { MobileForeverEvidenceRail } from "./MobileForeverEvidenceRail";
import { MobileForeverFirstTurn } from "./MobileForeverFirstTurn";
import { MobileForeverLongArc } from "./MobileForeverLongArc";
import { MobileForeverMetricConditions } from "./MobileForeverMetricConditions";
import styles from "./mobile-forever.module.css";

type MobileForeverStudyProps = {
  analysis: ForeverMobileAnalysis;
};

export function MobileForeverStudy({ analysis }: MobileForeverStudyProps) {
  return (
    <article
      id="m-forever-top"
      className={styles.root}
      data-forever-edition="mobile-research"
      data-release={analysis.release.persistentIdentifier}
    >
      <MobileForeverLongArc analysis={analysis} />
      <MobileForeverEvidenceRail railId="rail-a" eyebrow="Peak / low / return" cards={analysis.rails.railA} />

      <MobileForeverFirstTurn
        annual={analysis.annualFirstTurn}
        transition={analysis.firstTransition}
        fromShare={analysis.milestones.balance1880s.joinedShareOfExactFormAppearances}
        toShare={analysis.milestones.majority1890s.joinedShareOfExactFormAppearances}
      />
      <MobileForeverEvidenceRail railId="rail-b" eyebrow="The annual turn" cards={analysis.rails.railB} />

      <MobileForeverCompositionFlipField milestones={analysis.milestones} transition={analysis.secondTransition} />
      <MobileForeverEvidenceRail railId="rail-c" eyebrow="What drives the return" cards={analysis.rails.railC} />

      <MobileForeverMetricConditions conditions={analysis.metricConditions} />

      <section className={styles.closingFinding} data-surface-category="text" aria-labelledby="m-forever-closing-title">
        <p className={styles.figureIndex}>CLOSING FINDING</p>
        <h2 id="m-forever-closing-title">{analysis.closingFinding.title}</h2>
        <p className={styles.closingSentence}>{analysis.closingFinding.sentence}</p>
        <p className={styles.closingInsight}>That means forever’s modern lead comes mainly from reaching more books, not from being used over and over within the same book.</p>
        <details className={styles.closingData}>
          <summary>Three measures <span aria-hidden="true">+</span></summary>
        <dl className={styles.closingEvidence}>
          <div>
            <dt>Overall use</dt>
            <dd>{analysis.closingFinding.rateRatio.toFixed(3)}×</dd>
            <p>In the 2010s sample, forever appears about four times as often per million words as for ever.</p>
          </div>
          <div>
            <dt>Use within a book</dt>
            <dd>{analysis.closingFinding.repeatRatio.toFixed(3)}×</dd>
            <p>In books that contain the spelling, forever is repeated only about 5% more often than for ever.</p>
          </div>
          <div>
            <dt>How steady the split stays</dt>
            <dd>{analysis.secondTransition.shareBand1990sTo2010s.widthPercentagePoints.toFixed(2)} points</dd>
            <p>From the 1990s through the 2010s, forever stays close to four-fifths of the two spellings’ recorded appearances. Its share moves by only 1.38 percentage points.</p>
          </div>
        </dl>
          <p className={styles.closingBoundary}>These figures apply only to forever and for ever in this fixed Google Books sample. They do not represent all English writing, identify when a spelling became accepted, or show that one meaning replaced another.</p>
        </details>
        <details className={styles.citation} data-surface-category="text">
          <summary>Citation / rights / links <span aria-hidden="true">+</span></summary>
          <div className={styles.citationBody}>
          <p>
            Rates and volume conditions use the fixed Google Books English 2019 release, persistent identity <code>{analysis.release.persistentIdentifier}</code>, for complete decades from 1800–2019.
          </p>
          <p>{analysis.caveats.join(" ")}</p>
          <p>
            Google Books Ngram data remain subject to Google's source conditions. Project code is available under its repository licence; original research, writing and design remain credited to Dai Pan / 潘岱.
          </p>
          <nav aria-label="Forever sources and project links">
            <a href="https://books.google.com/ngrams/info" target="_blank" rel="noreferrer">Google Ngram information ↗</a>
            <Link href="/about">Research method and rights →</Link>
            <a href="https://github.com/dpan538/Words-Over-Time" target="_blank" rel="noreferrer">Project repository ↗</a>
          </nav>
          </div>
        </details>
      </section>

      <a className={styles.backToTop} href="#m-forever-top">
        Back to top <span aria-hidden="true">↑</span>
      </a>

      <footer className={styles.mobileFooter} data-surface-category="text">
        <p>Words Over Time: semantic change and word usage over time</p>
      </footer>
    </article>
  );
}
