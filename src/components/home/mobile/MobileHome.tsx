import Link from "next/link";
import styles from "./mobile-home.module.css";

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
            <Link
              href="/words/forever"
              id="m-home-word-forever"
              data-home-word="forever"
              data-home-panel="one"
              className={`${styles.wordLink} ${styles.forever}`}
            >
              forever<span aria-hidden="true">/</span>
            </Link>
            <Link
              href="/words/artificial"
              id="m-home-word-artificial"
              data-home-word="artificial"
              data-home-panel="one"
              className={`${styles.wordLink} ${styles.artificial}`}
            >
              artificial<span aria-hidden="true">/</span>
            </Link>
            <Link
              href="/words/privacy"
              id="m-home-word-privacy"
              data-home-word="privacy"
              data-home-panel="one"
              className={`${styles.wordLink} ${styles.privacy}`}
            >
              privacy<span aria-hidden="true">/</span>
            </Link>
          </div>
        </div>

        <div className={styles.continueRule} aria-label="Continue to the second word field">
          <span>Continue</span>
          <span aria-hidden="true">↓</span>
        </div>
      </section>

      <section className={styles.secondPanel} id="m-home-panel-two" aria-label="Second word field and project links">
        <div className={styles.secondWordField}>
          {/* No /words/null route or study record exists at this revision. Keep this
              mark visibly unavailable rather than fabricating a link to /words/hub. */}
          <div
            id="m-home-word-null"
            data-home-word="null"
            data-home-panel="two"
            className={`${styles.unavailableWord} ${styles.nullWord}`}
          >
            <span className={styles.nullMark}>null<span aria-hidden="true">/</span></span>
            <span className={styles.unavailableStatus}>No route</span>
          </div>

          <Link
            href="/words/depression"
            id="m-home-word-depression"
            data-home-word="depression"
            data-home-panel="two"
            className={`${styles.wordLink} ${styles.depression}`}
          >
            depression<span aria-hidden="true">/</span>
          </Link>

          <div
            id="m-home-word-intelligence"
            data-home-word="intelligence"
            data-home-panel="two"
            className={`${styles.comingSoonWord} ${styles.intelligence}`}
          >
            <span>intelligence<span aria-hidden="true">/</span></span>
            <span className={styles.comingSoonStatus}>Coming soon</span>
          </div>

          <Link
            href="/words/data"
            id="m-home-word-data"
            data-home-word="data"
            data-home-panel="two"
            className={`${styles.wordLink} ${styles.data}`}
          >
            data<span aria-hidden="true">/</span>
          </Link>
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
