import Link from "next/link";
import { artificialMobileProduction as research } from "@/data/artificialMobileProduction";
import { artificialMobileTimeStudy as timeStudy } from "@/data/artificialMobileTimeStudy";
import {
  ArtificialBranchTrend,
  ArtificialLinearDashboard,
  EvidenceContextExplorer,
  InteractiveCompoundTree,
  InteractiveDatedTimeline,
  InteractiveMovementHeading,
  InteractiveSemanticSphere,
  InteractiveStudyTitle,
  type CompoundTreeBranch,
  type HumanEvidenceExample,
} from "./MobileArtificialInteractions";
import { ArtificialMotionController } from "./MobileArtificialMotion";
import styles from "./mobile-artificial.module.css";

const compoundPublicLabels = ["body", "mind", "materials", "senses", "social life"] as const;

const compoundGroups = research.phraseVocabulary.domains.map((domain, domainIndex) => ({
  id: domain.domain.toLowerCase(),
  label: compoundPublicLabels[domainIndex] ?? domain.domain.toLowerCase(),
  count: domain.termCount,
  domainIndex,
  terms: domain.termNames,
}));

const compoundTree = compoundGroups.map((group) => {
  const branchY = 12 + group.domainIndex * 19;
  const hubAngle = -Math.PI / 2 + group.domainIndex / compoundGroups.length * Math.PI * 2;
  const hubX = 50 + Math.cos(hubAngle) * 17;
  const hubZ = Math.sin(hubAngle) * 18;
  const leaves = group.terms.map((term, itemIndex) => {
    const useTwoRings = group.count > 10;
    const ringIndex = useTwoRings ? itemIndex % 2 : 0;
    const localIndex = useTwoRings ? Math.floor(itemIndex / 2) : itemIndex;
    const localCount = useTwoRings ? Math.ceil((group.count - ringIndex) / 2) : group.count;
    const radius = useTwoRings ? (ringIndex === 0 ? 14 : 24) : 20;
    const theta = -Math.PI / 2 + localIndex / localCount * Math.PI * 2 + ringIndex * .18;
    return {
      id: term,
      label: term,
      ringIndex,
      sequence: localIndex,
      x: hubX + Math.cos(theta) * radius,
      y: branchY + Math.sin(theta) * radius * .34,
      z: hubZ + Math.sin(theta) * radius * .9,
    };
  });
  return { ...group, hubX, hubY: branchY, hubZ, leaves };
});

const compoundBranches: CompoundTreeBranch[] = compoundTree.map((branch) => ({
  domainIndex: branch.domainIndex,
  hub: { x: branch.hubX, y: branch.hubY, z: branch.hubZ },
  id: branch.id,
  label: branch.label,
  leaves: branch.leaves,
}));

const humanExamples = research.humanContinuation.evidenceExamples as readonly HumanEvidenceExample[];

const compoundCount = research.phraseVocabulary.exactPhraseCount;
const suspicionCount = research.suspicionTransfer.anchorCount;
const humanCount = research.humanContinuation.markedEvidenceRecordCount;
const coverageEntryCount = timeStudy.rawTermYearCellCount;
const selectedTermCount = timeStudy.rawSelectedTermCount;

function PhraseFieldPage() {
  return (
    <section className={`${styles.reportPage} ${styles.registryPage}`} aria-labelledby="artificial-phrase-field-title">
      <div className={styles.gridSurface}>
        <div className={styles.movementIntro} data-motion-scene>
          <InteractiveMovementHeading
            id="artificial-phrase-field-title"
            index="01 / THE WORD BRANCHES"
            title="Five ways “artificial” branches."
          />
          <p data-motion-copy>Forty-eight phrases form five connected branches. Near and far circles only separate overlapping terms; swipe to read each branch.</p>
        </div>
        <ArtificialLinearDashboard />
        <div className={styles.primaryGeometryMovement} data-motion-scene data-surface-category="visualization">
          <InteractiveCompoundTree branches={compoundBranches} />
        </div>
      </div>
    </section>
  );
}

function DistrustTimelinePage() {
  return (
    <section className={`${styles.reportPage} ${styles.evidencePage}`} aria-labelledby="artificial-distrust-title">
      <div className={styles.gridSurface}>
        <div className={styles.movementIntro} data-motion-scene>
          <InteractiveMovementHeading
            id="artificial-distrust-title"
            index="02 / WHERE DISTRUST APPEARS"
            title="Where does distrust attach to “artificial”?"
          />
          <p data-motion-copy>The cited phrases range from “artificial coloring” to “no artificial colors.” Their positions show time only—not the strength or popularity of the attitude.</p>
        </div>
        <div className={styles.timelineMovement} data-motion-scene data-surface-category="visualization">
          <InteractiveDatedTimeline examples={research.suspicionTransfer.anchors} />
        </div>
      </div>
    </section>
  );
}

function SemanticMobilityPage() {
  return (
    <section className={`${styles.reportPage} ${styles.semanticPage}`} aria-labelledby="artificial-semantic-title">
      <div className={styles.gridSurface}>
        <div className={styles.movementIntro} data-motion-scene>
          <InteractiveMovementHeading
            id="artificial-semantic-title"
            index="03 / MADE, REAL, OR SIMULATED"
            title="Made is not the same as fake."
          />
          <p data-motion-copy>These source cases separate how something was made from whether an event happened, an object looks realistic, or a voice was simulated.</p>
        </div>
        <div className={styles.semanticMovement} data-motion-scene data-surface-category="visualization">
          <InteractiveSemanticSphere caveat={research.semanticMobility.caveat} views={research.semanticMobility.views} />
        </div>
      </div>
    </section>
  );
}

export function MobileArtificialStudy() {
  return (
    <article id="m-artificial-top" className={styles.mobileArtificial} data-artificial-edition="mobile-research" aria-labelledby="m-artificial-title">
      <ArtificialMotionController rootId="m-artificial-top" />
      <header className={styles.siteHeader}><nav aria-label="Primary navigation"><Link href="/">WORDS OVER TIME</Link><Link href="/about">ABOUT</Link></nav></header>

      <section className={styles.studySubject} data-surface-category="text">
        <p className={styles.studyEyebrow}>WORD STUDY</p>
        <InteractiveStudyTitle id="m-artificial-title" title="artificial" />
        <p className={styles.studyThesis}>“Artificial” did not travel in a straight line from “made by people” to “fake.” These sources show separate branches through materials, senses, distrust, bodily support, modeled processes, and speculation.</p>
        <dl className={styles.studyScope}>
          <div><dt>{coverageEntryCount.toLocaleString("en-US")}</dt><dd>year-by-year checks</dd></div>
          <div><dt className={styles.scopeRange}>1800—2019</dt><dd>fixed time span</dd></div>
        </dl>
      </section>

      <PhraseFieldPage />
      <DistrustTimelinePage />
      <SemanticMobilityPage />
      <EvidenceContextExplorer examples={humanExamples} />
      <ArtificialBranchTrend />

      <section className={styles.closeFinding} data-motion-scene data-surface-category="text" aria-labelledby="m-artificial-close-title">
        <p className={styles.closeEyebrow}>CLOSE FINDING</p>
        <div className={styles.closeStatement} data-motion-copy>
          <h2 id="m-artificial-close-title">The evidence does not describe one line from made to fake.</h2>
          <p>Making, distrust, support, replacement, reproductive continuation, modeled processes, and speculative extensions remain distinct branches in the cited sources.</p>
        </div>
        <details className={styles.closeSources}>
          <summary>SOURCES / RIGHTS <span aria-hidden="true">+</span></summary>
          <div>
            <p>This study makes {coverageEntryCount.toLocaleString("en-US")} fixed year-by-year comparisons across {selectedTermCount} exact terms. The primary scatter and trend use only the {timeStudy.comparableCompoundTermCount} two-word phrases measured on the same scale; the large number is research coverage, not a count of books or word appearances.</p>
            <p>{suspicionCount} dated sources locate distrust in time, five cited cases separate “made,” “real,” and “simulated,” and the final circles reread {humanCount} cited passages about human functions. These counts describe material selected for this study—not every use of “artificial” in English. Source material remains credited to its original authors and publishers.</p>
            <nav aria-label="Artificial method and source links"><Link href="/about">Method and rights</Link><a href="https://github.com/dpan538/Words-Over-Time" target="_blank" rel="noreferrer">Research materials</a></nav>
          </div>
        </details>
        <a className={styles.backToTop} href="#m-artificial-top">BACK TO TOP <span className={styles.upGlyph} aria-hidden="true" /></a>
      </section>
      <footer className={styles.editionFooter}><p>Words Over Time: semantic change and word usage over time</p></footer>
    </article>
  );
}
