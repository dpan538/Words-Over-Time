import Link from "next/link";
import {
  plannedStudyById,
  publishedStudyById,
  type PublishedStudyRegistryEntry,
} from "@/data/words";
import styles from "./mobile-home.module.css";

type HomePanel = "one" | "two";

type PublishedWordMarkProps = {
  className: string;
  labelClassName?: string;
  panel: HomePanel;
  study: PublishedStudyRegistryEntry;
};

const foreverStudy = publishedStudyById("study-forever");
const artificialStudy = publishedStudyById("study-artificial");
const privacyStudy = publishedStudyById("study-privacy");
const hubStudy = publishedStudyById("study-hub");
const depressionStudy = publishedStudyById("study-depression");
const intelligenceStudy = plannedStudyById("study-intelligence");
const dataStudy = publishedStudyById("study-data");

function PublishedWordMark({
  className,
  labelClassName,
  panel,
  study,
}: PublishedWordMarkProps) {
  const label = (
    <>
      {study.label}
      <span aria-hidden="true">/</span>
    </>
  );

  return (
    <Link
      href={study.href}
      id={`m-home-word-${study.slug}`}
      data-audit-home-word="published"
      data-home-panel={panel}
      data-home-status={study.status}
      data-home-study-id={study.studyId}
      data-home-word={study.slug}
      className={`${styles.wordLink} ${className}`}
    >
      {labelClassName ? <span className={labelClassName}>{label}</span> : label}
    </Link>
  );
}

export function MobileHome() {
  return (
    <div className={styles.root} data-home-edition="mobile">
      <section className={styles.firstPanel} id="m-home-panel-one" aria-labelledby="m-home-directory-title">
        <nav className={styles.nav} aria-label="Mobile home navigation">
          <Link href="/" className={styles.navLink}>
            Words Over Time
          </Link>
          <Link href="/about" className={styles.navLink}>
            About
          </Link>
        </nav>

        <header className={styles.introduction}>
          <p className={styles.projectName} aria-hidden="true">
            <span>Words</span>
            <span className={styles.projectNameAccent}>Over Time</span>
          </p>
          <p className={styles.explanation}>
            Words Over Time is a semantic-frequency research project, design research, and infographic art. It treats language as visual material: a field of memory, evidence, attention, and public pressure, making the available evidence visible with its sources, limits, and gaps.
          </p>
        </header>

        <div className={styles.firstDirectory}>
          <p className={styles.directoryLabel} id="m-home-directory-title">
            Words you wanna know:
          </p>
          <div className={styles.firstWordField} aria-label="First word field">
            <PublishedWordMark
              study={foreverStudy}
              panel="one"
              className={styles.forever}
            />
            <PublishedWordMark
              study={artificialStudy}
              panel="one"
              className={styles.artificial}
            />
            <PublishedWordMark
              study={privacyStudy}
              panel="one"
              className={styles.privacy}
            />
          </div>
        </div>

        <div className={styles.continueRule} aria-label="Continue to the second word field">
          <span>Continue</span>
          <span aria-hidden="true">↓</span>
        </div>
      </section>

      <section className={styles.secondPanel} id="m-home-panel-two" aria-label="Second word field and project links">
        <div className={styles.secondWordField}>
          <PublishedWordMark
            study={hubStudy}
            panel="two"
            className={styles.hubWord}
            labelClassName={styles.hubMark}
          />

          <PublishedWordMark
            study={depressionStudy}
            panel="two"
            className={styles.depression}
          />

          <div
            id={`m-home-word-${intelligenceStudy.slug}`}
            data-audit-home-word="planned"
            data-home-panel="two"
            data-home-status={intelligenceStudy.status}
            data-home-study-id={intelligenceStudy.studyId}
            data-home-word={intelligenceStudy.slug}
            className={`${styles.comingSoonWord} ${styles.intelligence}`}
          >
            <span>
              {intelligenceStudy.label}
              <span aria-hidden="true">/</span>
            </span>
            <span className={styles.comingSoonStatus}>(Coming soon)</span>
          </div>

          <PublishedWordMark
            study={dataStudy}
            panel="two"
            className={styles.data}
          />
        </div>

        <footer className={styles.mobileFooter}>
          <p className={styles.credit}>Research / data / writing / design by Dai Pan / 潘岱</p>
          <Link className={styles.aboutCta} href="/about">
            About the project <span aria-hidden="true">→</span>
          </Link>
          <div className={styles.terminalRule} aria-hidden="true" />
        </footer>
      </section>
    </div>
  );
}
