import Link from "next/link";
import { wordRoutes } from "@/lib/site";
import styles from "./mobile-words-index.module.css";

export function MobileWordsIndex() {
  return (
    <main className={styles.root} data-words-index-edition="mobile">
      <nav className={styles.nav} aria-label="Primary navigation">
        <Link href="/">Words Over Time</Link>
        <Link href="/about">About</Link>
      </nav>

      <section className={styles.content}>
        <div className={styles.introduction}>
          <div>
            <p className={styles.eyebrow}>words over time / index</p>
            <h1>word studies</h1>
          </div>
          <p className={styles.description}>
            Browse the public studies currently available for search engines,
            readers, and AI retrieval tools. Each entry links to a canonical
            route with metadata, structured data, source notes, and explicit
            publication boundaries.
          </p>
        </div>

        <div className={styles.studyList}>
          {wordRoutes.map((route, index) => (
            <Link
              key={route.path}
              href={route.path}
              className={styles.study}
            >
              <span className={styles.index}>
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className={styles.title}>{route.title.toLowerCase()}/</span>
              <span className={styles.studyDetails}>
                <span className={styles.summary}>
                  {route.summary || route.description}
                </span>
                <span className={styles.keywords}>
                  {route.keywords.slice(0, 5).map((keyword) => (
                    <span key={keyword} className={styles.keyword}>
                      {keyword}
                    </span>
                  ))}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
