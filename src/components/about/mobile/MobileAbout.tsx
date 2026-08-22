import Link from "next/link";
import type { CSSProperties } from "react";
import { MobileCitationCopy } from "./MobileCitationCopy";
import styles from "./mobile-about.module.css";

const researchSteps = [
  {
    number: "01",
    title: "Question and scope",
    body: "Specify the headword and variants, time and geographic scope, research question, and comparison to be tested.",
  },
  {
    number: "02",
    title: "Evidence register",
    body: "Record each source’s role, release or capture date, fields, coverage, rights, and missingness before analysis.",
  },
  {
    number: "03",
    title: "Analytic specification",
    body: "Declare inclusion rules, denominator, grouping, transformation, unit, and incomparable states before rendering.",
  },
  {
    number: "04",
    title: "Reproducible derivation",
    body: "Calculate from retained inputs through scripts or typed transforms, preserving missing and unavailable values.",
  },
  {
    number: "05",
    title: "Claim review",
    body: "Match the conclusion to the evidence and publish its unit, caveat, source, access date, and revision path.",
  },
] as const;

const researchApplications = [
  {
    number: "A",
    title: "Forever / form policy",
    body: "forever and for ever remain separate one-gram and two-gram series. A combined rate is published only when same-release raw totals provide a shared word-token denominator.",
    accent: "#AE4202",
  },
  {
    number: "B",
    title: "Hub / fixed inventory",
    body: "Visibility means selected phrases at or above 0.002 appearances per million, divided by the same 39 proxies in each of six twenty-year periods. It does not estimate all uses of hub.",
    accent: "#7C88E3",
  },
  {
    number: "C",
    title: "Depression / layered claim",
    body: "The retained core series peaks at 43.33 appearances per million in 1932. Separate economic-phrase and NBER series support context, not a claim that every occurrence is economic or that timing proves causation.",
    accent: "#2A375C",
  },
] as const;

const appliedDesignReferences = [
  {
    number: "01",
    route: "Data",
    family: "data",
    name: "Yugo Nakamura / iida UI",
    body: "KDDI describes one continuous information band built from icons, widgets, section bars, motion, and vertical scroll. It is a useful parallel for Data’s modular stream—not a source for its charts or palette.",
    label: "KDDI / INFOBAR A01",
    href: "https://www.kddi.com/corporate/news_release/2011/0517l/besshi.html",
    surface: "#1570AC",
    ink: "#FFFFFF",
    accent: "#66D8BD",
  },
  {
    number: "02",
    route: "Artificial",
    family: "artificial",
    name: "Ryoji Ikeda / datamatics",
    body: "Ikeda treats data as number fields, grids, repetition, and precise audiovisual sequence. This parallels Artificial’s data-as-signal method; its magenta and layout remain project-specific.",
    label: "MOT / Ryoji Ikeda",
    href: "https://www.mot-art-museum.jp/ryojiikeda/en/works/",
    surface: "#050507",
    ink: "#FFFFFF",
    accent: "#FF315F",
  },
  {
    number: "03",
    route: "Artificial",
    family: "artificial",
    name: "Rhizomatiks / Multiplex",
    body: "Rhizomatiks turns source code, project metadata, event data, and motion into visual systems. This parallels Artificial’s instrument-like interaction, not a copied installation.",
    label: "Rhizomatiks / Multiplex",
    href: "https://rhizomatiks.com/work/rhizomatiks_multiplex/",
    surface: "#A92A49",
    ink: "#FFFFFF",
    accent: "#FF315F",
  },
  {
    number: "04",
    route: "Hub / Bay Area",
    family: "hub",
    name: "Barbara Stauffacher Solomon / supergraphics",
    body: "SFMOMA describes supergraphics as large forms responding to architecture. This parallels Hub’s oversized Helvetica and page-as-environment, translated into a phone-length report.",
    label: "SFMOMA / Supergraphics",
    href: "https://www.sfmoma.org/exhibition/barbara-stauffacher-solomon-strips-of-stripes/",
    surface: "#D98C73",
    ink: "#050510",
    accent: "#E4BB59",
  },
  {
    number: "05",
    route: "Hub / Southern California",
    family: "hub",
    name: "Light and Space",
    body: "Light and Space centres light, transparency, reflectivity, and colour. This parallels Hub’s non-quantitative chromatic atmosphere; values remain in labels and axes.",
    label: "Getty / Light and Space",
    href: "https://www.getty.edu/vow/AATFullDisplay?find=&logic=AND&note=&subjectid=300375712",
    surface: "#7C88E3",
    ink: "#050510",
    accent: "#E4BB59",
  },
  {
    number: "06",
    route: "Hub / MIT",
    family: "hub",
    name: "Muriel Cooper / Information Landscapes",
    body: "Cooper’s work moved from print toward dynamic information interfaces. This parallels Hub’s continuous, scene-based reading, not its specific colour field.",
    label: "MoMA / Information Landscapes",
    href: "https://www.moma.org/calendar/exhibitions/1654",
    surface: "#E4BB59",
    ink: "#050510",
    accent: "#1570AC",
  },
] as const;

const sourceFamilies = [
  {
    source: "Google Books Ngram Viewer",
    role: "Long-run printed-book visibility in named English corpora through 2022.",
    boundary: "Viewer/API values retain their source release, n-gram order, native denominator, and transformation record.",
  },
  {
    source: "Project Gutenberg + Library of Congress",
    role: "Selected public-domain passages, scanned pages, and historical newspaper occurrences.",
    boundary: "Each occurrence retains its work, edition or publication context, OCR condition, date precision, and item-level rights.",
  },
  {
    source: "Lexical references",
    role: "Attestation and sense-history checks through cited dictionaries and etymological references.",
    boundary: "Entries are citation targets rather than reproduced datasets; a reported attestation remains source-bound and revisable.",
  },
  {
    source: "Legal, clinical, policy, and technical sources",
    role: "Domain anchors from courts, statutes, agencies, standards bodies, controlled vocabularies, and research publications.",
    boundary: "These records support bounded institutional context, not a shared frequency scale or automatic semantic classification.",
  },
  {
    source: "Contemporary and aggregate records",
    role: "Modern context from Wikimedia projects and selected geographic, demographic, academic, and public-attention sources.",
    boundary: "Captures remain source- and date-specific; a modern inventory does not establish persistence or prevalence.",
  },
] as const;

const rightsLedger = [
  ["Project source code", "Application code, styles, utilities, and pipeline implementation are released under MIT; the grant covers software implementation only."],
  ["Original research and design", "Research writing, curated datasets, classifications, page compositions, visual identity, and Dai Pan / 潘岱 authorship marks remain © 2026 Dai Pan / 潘岱."],
  ["Upstream material", "Corpus series, archival passages, dictionary references, public records, metadata, and open media retain their own source terms and attribution requirements."],
  ["Processed and curated records", "Derived tables and project records document provenance and transformations; they do not relicense upstream material or grant commercial extraction rights over curated classifications."],
  ["Site privacy", "The public site uses no accounts, cookies, or visitor tracking and stores no visitor personal data."],
] as const;

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h3 className={styles.sectionHeading}>{children}</h3>;
}

export function MobileAbout() {
  return (
    <div className={styles.root} data-about-edition="mobile">
      <nav className={styles.nav} aria-label="Mobile about navigation">
        <Link href="/" className={styles.navLink}>Words Over Time</Link>
        <Link href="/about" aria-current="page" className={styles.navLink}>About</Link>
      </nav>

      <header className={styles.header}>
        <p className={styles.eyebrow}>About / design + research</p>
        <p className={styles.displayTitle} aria-hidden="true">About the project</p>
        <p className={styles.navigationStatement}>Words Over Time is an independent research archive tracing selected English words across time, media, and institutions. Its contribution is a repeatable method for comparing corpus signals, lexical attestations, archival occurrences, and public records without treating them as one dataset. Each study preserves source limits, denominators, date precision, and missingness, then turns those distinctions into an inspectable visual account of changing forms, uses, and public meanings—not a universal history of English.</p>
      </header>

      <div className={styles.groups}>
        <details className={`${styles.group} ${styles.researchGroup}`} id="m-about-research" open>
          <summary className={styles.summary}>
            <span>Research method</span>
            <span className={styles.summaryMark} aria-hidden="true">+</span>
          </summary>
          <div className={styles.groupBody}>
            <section className={styles.section} id="m-about-research-scope">
              <SectionHeading>Research object and scope</SectionHeading>
              <p>Each entry is a selected-word case study rather than a dictionary entry or a universal history of English. A study defines the forms being researched, the sources allowed to answer its question, the comparisons those sources support, and the gaps that prevent a stronger conclusion.</p>
            </section>

            <section className={styles.section} id="m-about-research-process">
              <SectionHeading>Research protocol</SectionHeading>
              <div className={styles.caseList} aria-label="Applied research examples">
                {researchSteps.map((step) => (
                  <article key={step.number} className={styles.card}>
                    <p className={styles.cardLabel}>{step.number} — {step.title}</p>
                    <p>{step.body}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className={styles.section} id="m-about-evidence-rules">
              <SectionHeading>Evidence and measurement</SectionHeading>
              <div className={styles.cardList}>
                {researchApplications.map((example) => (
                  <article
                    key={example.number}
                    className={`${styles.card} ${styles.caseCard}`}
                    style={{ "--case-accent": example.accent } as CSSProperties}
                  >
                    <p className={styles.cardLabel}>{example.number} — {example.title}</p>
                    <p>{example.body}</p>
                  </article>
                ))}
              </div>
              <p>Native denominators remain attached, including the distinction between unigram and bigram series. Smoothing, indexing, ranking, aggregation, and normalisation are labelled as transformations. Joined and spaced forms remain separate unless a valid common denominator supports combination. Missing, unavailable, not searched, and incomparable are never silently converted to zero.</p>
            </section>

            <section className={styles.section} id="m-about-claim-boundary">
              <SectionHeading>Claim boundary and review</SectionHeading>
              <p>Claims are limited to named-corpus visibility, source-bound attestation, disclosed semantic grouping, reproducible transformation, and bounded interpretation. They cannot establish a universal history, equate frequency with importance or causation, infer first use from a first corpus point, or treat missing evidence as absence.</p>
              <p>Review keeps event, text, publication, capture, and revision dates separate and checks source status, form policy, overclaiming, accessibility, and rights before publication.</p>
            </section>
          </div>
        </details>

        <details className={`${styles.group} ${styles.designGroup}`} id="m-about-design">
          <summary className={styles.summary}>
            <span>Design</span>
            <span className={styles.summaryMark} aria-hidden="true">+</span>
          </summary>
          <div className={styles.groupBody}>
            <section className={styles.section} id="m-about-design-position">
              <SectionHeading>Mobile visual position</SectionHeading>
              <p>The mobile edition has no single national or period style. Its working references mix contemporary interface graphics, editorial reporting, data art, and environmental colour. Because the original reference ledger does not fully preserve authorship, the six named examples below are critical parallels for reading the finished pages—not verified sources of direct influence.</p>
              <p>Across routes, scroll sets sequence, motion exposes structure, and colour creates atmosphere without replacing labels or source boundaries.</p>
            </section>

            <section className={styles.section} id="m-about-design-contexts">
              <SectionHeading>Applied references</SectionHeading>
              <div className={styles.referenceList} aria-label="Applied design references">
                {appliedDesignReferences.map((reference) => (
                  <article
                    key={reference.number}
                    className={styles.referenceCard}
                    data-design-family={reference.family}
                    style={{
                      "--reference-surface": reference.surface,
                      "--reference-ink": reference.ink,
                      "--reference-accent": reference.accent,
                    } as CSSProperties}
                  >
                    <div className={styles.referenceMeta}>
                      <span>{reference.number}</span>
                      <span>{reference.route}</span>
                    </div>
                    <h4 className={styles.referenceName}>{reference.name}</h4>
                    <p>{reference.body}</p>
                    <a className={styles.referenceLink} href={reference.href} target="_blank" rel="noreferrer">
                      {reference.label} ↗
                    </a>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </details>

        <details className={`${styles.group} ${styles.sourceGroup}`} id="m-about-source">
          <summary className={styles.summary}>
            <span>Source</span>
            <span className={styles.summaryMark} aria-hidden="true">+</span>
          </summary>
          <div className={styles.groupBody}>
            <section className={styles.section} id="m-about-source-ledger">
              <SectionHeading>Evidence stays attached to its origin.</SectionHeading>
              <p>Source classes answer different questions. Every public claim retains source identity, coverage, date precision, transformation history, missingness, and rights rather than treating the archive as one interchangeable dataset.</p>
              <div className={styles.sourceLedger}>
                {sourceFamilies.map((source) => (
                  <article key={source.source} className={styles.ledgerEntry}>
                    <h4>{source.source}</h4>
                    <p>{source.role}</p>
                    <p><strong>Boundary:</strong> {source.boundary}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className={styles.section} id="m-about-citations">
              <SectionHeading>Citation and provenance</SectionHeading>
              <p>Cite this archive and upstream sources separately. A chart records retrieval, cleaning, transformation, grouping, and visual design; it does not replace the source citation.</p>
              <p className={styles.citation}>Pan, Dai. “[Word page title].” Words Over Time, 2026, [page URL]. DOI: 10.5281/zenodo.20437678. Accessed [day month year].</p>
              <MobileCitationCopy citation={'Pan, Dai. “Hub.” Words Over Time, 2026, https://wordsovertime.com/words/hub. DOI: 10.5281/zenodo.20437678. Accessed 27 May 2026.'} />
              <p>The DOI identifies the project, not a separate dataset assigned to every route.</p>
              <a className={styles.textLink} href="https://doi.org/10.5281/zenodo.20437678" target="_blank" rel="noreferrer">Project DOI ↗</a>
            </section>
          </div>
        </details>

        <details className={`${styles.group} ${styles.licenseGroup}`} id="m-about-license">
          <summary className={styles.summary}>
            <span>License</span>
            <span className={styles.summaryMark} aria-hidden="true">+</span>
          </summary>
          <div className={styles.groupBody}>
            <section className={styles.section} id="m-about-license-boundaries">
              <SectionHeading>Software openness does not erase authorship or upstream rights.</SectionHeading>
              <p>The repository makes software and research processes inspectable. Original work may be cited and studied non-commercially with attribution; commercial copying, republication, dataset extraction, or reproduction of the finished identity requires permission.</p>
              <a className={styles.textLink} href="https://opensource.org/license/mit" target="_blank" rel="noreferrer">Read the MIT licence ↗</a>
              <div className={styles.rightsLedger}>
                {rightsLedger.map(([category, boundary]) => (
                  <article key={category} className={styles.ledgerEntry}>
                    <h4>{category}</h4>
                    <p>{boundary}</p>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </details>

        <details className={`${styles.group} ${styles.contactGroup}`} id="m-about-contact">
          <summary className={styles.summary}>
            <span>Contact</span>
            <span className={styles.summaryMark} aria-hidden="true">+</span>
          </summary>
          <div className={styles.groupBody}>
            <section className={`${styles.section} ${styles.contactSection}`} id="m-about-contact-creator">
              <SectionHeading>Creator and correspondence</SectionHeading>
              <p>Research, data, writing, and design by Dai Pan / 潘岱, a Chinese artist, designer, and design researcher working across visual art, printmaking, writing, image-text worlds, and poetic research.</p>
              <p>Questions, corrections, and source suggestions are welcome.</p>
              <address className={styles.contactList}>
                <a className={styles.contactLink} href="mailto:dpan53853@gmail.com"><span>Email</span><span>dpan53853@gmail.com</span></a>
                <a className={styles.contactLink} href="mailto:jarl555@qq.com"><span>Email</span><span>jarl555@qq.com</span></a>
                <a className={styles.contactLink} href="tel:+8615262753021"><span>Phone</span><span>+86 15262753021</span></a>
              </address>
              <div className={styles.linkRow}>
                <a className={styles.textLink} href="https://daipan.art/" target="_blank" rel="noreferrer">Visual practice ↗</a>
                <a className={styles.textLink} href="https://www.daipan.ink/" target="_blank" rel="noreferrer">Writing practice ↗</a>
              </div>
            </section>

            <section className={styles.section} id="m-about-contact-repository">
              <SectionHeading>Project repository</SectionHeading>
              <a className={styles.repoLink} href="https://github.com/dpan538/Words-Over-Time" target="_blank" rel="noreferrer">
                <span className={styles.repoKicker}>GitHub / dpan538</span>
                <span className={styles.repoName}>Words-Over-Time</span>
                <span className={styles.repoMeta}>Public repository / code / data pipeline</span>
                <span className={styles.repoArrow} aria-hidden="true">↗</span>
              </a>
            </section>
          </div>
        </details>
      </div>

      <footer className={styles.footer}>
        <Link href="/" className={styles.homeLink}>Back to the word field <span aria-hidden="true">→</span></Link>
      </footer>
    </div>
  );
}
