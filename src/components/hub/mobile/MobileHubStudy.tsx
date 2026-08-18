"use client";

import Link from "next/link";
import type { HubMobileAnalysis } from "@/types/hubMobileAnalysis";
import { OrganicSemanticField } from "./HubChromaticFields";
import {
  HubAtmosphereProvider,
  HubAtmosphereViewport,
  useHubAtmosphereScene,
} from "./HubAtmosphere";
import { HubEvidenceRail } from "./HubEvidenceRail";
import { HubPersistenceScatter } from "./HubPersistenceScatter";
import { HubPhraseExplorer } from "./HubPhraseExplorer";
import { HubTrendExplorer } from "./HubTrendExplorer";
import { HubVisibilityChart } from "./HubVisibilityChart";
import styles from "./mobile-hub.module.css";

type MobileHubStudyProps = {
  analysis: HubMobileAnalysis;
};

export function MobileHubStudy({ analysis }: MobileHubStudyProps) {
  return (
    <HubAtmosphereProvider>
      <MobileHubStudyContent analysis={analysis} />
    </HubAtmosphereProvider>
  );
}

function MobileHubStudyContent({ analysis }: MobileHubStudyProps) {
  const heroSectionRef = useHubAtmosphereScene("hero");
  const semanticSectionRef = useHubAtmosphereScene("semantic");
  const closingSectionRef = useHubAtmosphereScene("closing");

  return (
    <main
      id="m-hub-top"
      className={`${styles.root} ${styles.atmosphereApp}`}
      data-hub-edition="mobile-research"
      data-hub-mobile-root
      aria-labelledby="m-hub-title"
    >
      <HubAtmosphereViewport />
      <div className={styles.heroShell}>
        <header className={styles.siteHeader}>
          <nav aria-label="Primary navigation">
            <Link href="/">WORDS OVER TIME</Link>
            <Link href="/about">ABOUT</Link>
          </nav>
        </header>

        <section ref={heroSectionRef} className={styles.subject} data-surface-category="text">
          <div className={styles.heroContent}>
            <div className={styles.heroTopline}>
              <p className={styles.eyebrow}>WORD STUDY</p>
              <span>1800—2022</span>
            </div>
            <h1 id="m-hub-title">hub</h1>
            <p className={styles.heroLine}>A CENTER THAT<br />LEARNED TO TRAVEL.</p>
          </div>
          <p className={styles.thesis}>From the fixed center of a wheel to places, routes, institutions, networks, and digital services, “hub” kept the idea of a center while changing what gathered around it.</p>
          <a className={styles.heroAdvance} href="#hub-semantic-title"><span>READ THE FIELD</span><i aria-hidden="true">↓</i></a>
        </section>
      </div>

      <section ref={semanticSectionRef} className={styles.semanticSection} data-surface-category="visualization" aria-labelledby="hub-semantic-title">
        <header className={styles.sectionHeader}>
          <p>01 / SEMANTIC FIELD</p>
          <h2 id="hub-semantic-title">One word. Six kinds of center.</h2>
          <span>The mechanical center came first. Later selected uses kept the center but changed the system around it.</span>
        </header>
        <OrganicSemanticField analysis={analysis} />
        <details className={styles.methodFold}>
          <summary>METHOD AND LIMITS <span aria-hidden="true">+</span></summary>
          <p>First visibility is the earliest twenty-year period in which at least one successfully captured selected phrase in a family reaches the fixed frequency threshold. It is not the historical invention date of that meaning, and the organic outline does not encode family share.</p>
        </details>
      </section>

      <HubTrendExplorer analysis={analysis} />
      <HubEvidenceRail analysis={analysis} />
      <HubVisibilityChart analysis={analysis} />
      <HubPersistenceScatter analysis={analysis} />
      <HubPhraseExplorer analysis={analysis} />

      <section ref={closingSectionRef} className={styles.closing} data-surface-category="text" aria-labelledby="hub-closing-title">
        <p className={styles.closeEyebrow}>CLOSE FINDING</p>
        <h2 id="hub-closing-title">THE CENTER SURVIVED. THE SYSTEM AROUND IT CHANGED.</h2>
        <p className={styles.closingLead}>Across the selected evidence, “hub” keeps one basic idea: a center that gathers things around it. What gathers changes—from wheels to places, routes, organizations, networks, and services.</p>
        <p className={styles.closingNote}>Mechanical phrases remain visible as newer families appear and grow. The evidence points to an expanding field of centers, not one meaning cleanly replacing another.</p>
        <details>
          <summary>METHOD AND LIMITS <span aria-hidden="true">+</span></summary>
          <div>
            <p>{analysis.exclusions.rule}</p>
            <p>Google Books Ngram Viewer · English corpus · 1800–2022 · smoothing 0 · case-insensitive. The retained raw capture does not pin a persistent corpus release. Frequency is a printed-book proxy, not a population use rate.</p>
          </div>
        </details>
        <details>
          <summary>SOURCES AND RIGHTS <span aria-hidden="true">+</span></summary>
          <div>
            <p>Frequency signals come from the retained Google Books Ngram capture. Dated evidence comes from the public historical dictionaries, digitized texts, catalogue records, and dictionary claims named on each evidence entry.</p>
            <p>Short summaries are used for research citation. Upstream material retains its original rights and attribution.</p>
          </div>
        </details>
        <a className={styles.backToTop} href="#m-hub-top">BACK TO TOP <span className={styles.upGlyph} aria-hidden="true" /></a>
      </section>

      <footer className={styles.footer}>Words Over Time: semantic change and word usage over time</footer>
    </main>
  );
}
