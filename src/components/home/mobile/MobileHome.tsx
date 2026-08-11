import Link from "next/link";
import {
  plannedStudyById,
  publishedStudyById,
  type PublishedStudyRegistryEntry,
} from "@/data/words";
import styles from "./mobile-home.module.css";

type PublishedWordMarkProps = {
  className: string;
  study: PublishedStudyRegistryEntry;
};

const foreverStudy = publishedStudyById("study-forever");
const artificialStudy = publishedStudyById("study-artificial");
const privacyStudy = publishedStudyById("study-privacy");
const depressionStudy = publishedStudyById("study-depression");
const intelligenceStudy = plannedStudyById("study-intelligence");
const dataStudy = publishedStudyById("study-data");

function PublishedWordMark({ className, study }: PublishedWordMarkProps) {
  return (
    <Link
      href={study.href}
      id={`m-home-word-${study.slug}`}
      data-home-study-id={study.studyId}
      data-home-word={study.slug}
      className={`${styles.wordLink} ${className}`}
    >
      {study.label}
      <span aria-hidden="true">/</span>
    </Link>
  );
}

export function MobileHome() {
  return (
    <div className={styles.root} data-home-edition="mobile">
      <header className={`${styles.header} mobile-home-header`}>
        <Link href="/" className={styles.navLink}>
          Words Over Time
        </Link>
        <Link href="/about" className={styles.navLink}>
          About
        </Link>
      </header>

      <section
        className={`${styles.wordField} mobile-word-field`}
        aria-labelledby="m-home-directory-title"
      >
        <p className={styles.directoryLabel} id="m-home-directory-title">
          Words you wanna know:
        </p>

        <PublishedWordMark study={foreverStudy} className={styles.forever} />
        <PublishedWordMark
          study={artificialStudy}
          className={styles.artificial}
        />
        <PublishedWordMark study={privacyStudy} className={styles.privacy} />

        <span
          id="m-home-word-null"
          data-home-word="null"
          className={`${styles.wordMark} ${styles.nullWord}`}
        >
          null<span aria-hidden="true">/</span>
        </span>

        <PublishedWordMark
          study={depressionStudy}
          className={styles.depression}
        />

        <div
          id={`m-home-word-${intelligenceStudy.slug}`}
          data-home-study-id={intelligenceStudy.studyId}
          data-home-word={intelligenceStudy.slug}
          className={styles.intelligence}
        >
          <span className={styles.intelligenceMark}>
            {intelligenceStudy.label}
            <span aria-hidden="true">/</span>
          </span>
          <span className={styles.comingSoonStatus}>(Coming soon)</span>
        </div>

        <PublishedWordMark study={dataStudy} className={styles.data} />

        <p className={styles.overTime}>Over Time</p>
      </section>

      <section
        className={`${styles.projectIntroduction} mobile-project-introduction`}
        aria-label="Project introduction"
      >
        <p>
          Words Over Time is a semantic-frequency research project, design
          research, and infographic art. It treats language as visual material:
          a field of memory, evidence, attention, and public pressure, making
          the available evidence visible with its sources, limits, and gaps.
        </p>
      </section>

      <details className={`${styles.copyright} mobile-copyright`}>
        <summary>Copyright / rights</summary>
        <div className={styles.copyrightBody}>
          <p>
            Research / data / writing / design by Dai Pan / 潘岱, a Chinese
            artist, designer, and design researcher working across visual art,
            photography, printmaking, writing, image-text worlds, and poetic
            research.
          </p>
          <p>
            Research writing, curated datasets, classifications, page
            compositions, visual identity, and Dai Pan / 潘岱 authorship marks
            remain © 2026 Dai Pan / 潘岱.
          </p>
          <p>
            Source material retains its applicable source, licence, attribution,
            and item-level rights terms; the project does not relicense upstream
            material.
          </p>
          <p>
            Non-commercial citation and study are permitted with attribution.
            Commercial reproduction or reuse of the finished identity, curated
            datasets, and classifications requires permission.
          </p>
        </div>
      </details>
    </div>
  );
}
