import Link from "next/link";
import styles from "./mobile-about.module.css";

const designLineage = [
  {
    name: "Josef Müller-Brockmann",
    work: "Grid Systems in Graphic Design",
    year: "1961",
    role: "The modular grid makes structure repeatable and lets absent evidence remain visible instead of being filled for symmetry.",
  },
  {
    name: "Karl Gerstner",
    work: "Designing Programmes",
    year: "1964",
    role: "Colour and layout behave as rules: route identity can vary, while evidence roles keep their established meanings.",
  },
  {
    name: "Emil Ruder",
    work: "Typographie",
    year: "1967",
    role: "Helvetica Neue carries information without performing a separate literary, historical, or technical personality.",
  },
  {
    name: "HfG Ulm",
    work: "Hochschule für Gestaltung",
    year: "1953–1968",
    role: "Design is an epistemological practice: the order of evidence and interpretation forms a claim that must be inspectable.",
  },
] as const;

const routeColours = [
  ["forever", "#F06B04"],
  ["artificial", "#A1081F"],
  ["privacy", "#6F3AA6"],
  ["hub", "#18314F"],
  ["depression", "#1570AC"],
  ["data", "#1570AC"],
  ["intelligence / planned", "#050510"],
] as const;

const evidenceFlow = [
  {
    number: "01",
    title: "Corpus frequency",
    source: "Long-run book or corpus frequency data",
    output: "A source-specific normalized usage trace",
    body: "Frequency is read as a long-run signal, with corpus boundaries kept visible.",
    constraint: "Corpus size, n-gram order, genre mix, and release boundaries stay attached to the line.",
    claim: "Supports corpus-visibility statements, not first-use claims.",
  },
  {
    number: "02",
    title: "Lexical attestation",
    source: "Dictionary and cited lexical evidence",
    output: "An earliest reported or attested usage",
    body: "Dictionary evidence anchors claims about reported first known use without pretending it is corpus frequency.",
    constraint: "Attestation can sit outside the archive corpus and still matter; it is source-bound and may later be revised.",
    claim: "Supports an attestation label and form-policy checks.",
  },
  {
    number: "03",
    title: "Scanned evidence",
    source: "A verified scanned-book page or public-domain passage",
    output: "An inspectable occurrence with context",
    body: "A page image or passage can show construction and context while preserving its individual provenance.",
    constraint: "Scan quality, OCR noise, edition date, and public-domain limits remain visible.",
    claim: "Supports a cited occurrence, not a population trend by itself.",
  },
  {
    number: "04",
    title: "Annotation",
    source: "Authored interpretive notes",
    output: "A form, grouping, and uncertainty policy",
    body: "Notes separate spelling variants, semantic drift, licensing limits, and confidence.",
    constraint: "Interpretive decisions are recorded instead of hidden behind the chart.",
    claim: "Supports bounded interpretation when the rule and evidence remain local.",
  },
] as const;

const sourceLedger = [
  {
    source: "Google Books Ngram Viewer",
    role: "Printed-book frequency time series",
    coverage: "English corpora through 2022; queried at smoothing 0 before local transforms",
    access: "Public Viewer/API response and source-specific scripts",
    rights: "Google Books Ngram terms and attribution apply",
  },
  {
    source: "Project Gutenberg",
    role: "Selected public-domain context text",
    coverage: "Mainly eighteenth- to early-twentieth-century books selected for inspectable passages",
    access: "Gutenberg text files and local, provenance-preserving extracts",
    rights: "Project Gutenberg licence; public-domain status varies outside the US",
  },
  {
    source: "Library of Congress / Chronicling America",
    role: "Historical newspaper evidence",
    coverage: "Digitized US newspapers, chiefly 1770s–1960s depending on collection availability",
    access: "LOC JSON, OCR, image, PDF, and item metadata",
    rights: "Library of Congress statements; item-level rights vary",
  },
  {
    source: "Wikimedia / Wikinews / MediaWiki",
    role: "Modern open context and metadata",
    coverage: "Contemporary page, publication, article, and capture metadata where relevant",
    access: "MediaWiki and Wikimedia public APIs",
    rights: "Applicable CC BY or CC BY-SA project terms",
  },
  {
    source: "Lexical references",
    role: "Attestation and sense-history checks",
    coverage: "OED candidate checks, Etymonline, Wiktionary, Merriam-Webster, and Cambridge",
    access: "Manual review and citation pointers only",
    rights: "Publisher-specific; entries are cited, not reproduced",
  },
  {
    source: "Policy, clinical, and technical references",
    role: "Domain context anchors",
    coverage: "EU, GDPR/ICO, FTC/NIST/OECD, PubMed/MeSH, WHO/NIMH, APA, Stanford HAI, and related sources",
    access: "Public pages, APIs, and manual source audits",
    rights: "Citation targets and metadata, not a republished corpus",
  },
  {
    source: "Public law and human-rights repositories",
    role: "Legal and rights anchors",
    coverage: "Court, statute, regulation, treaty, and agency sources named in individual studies",
    access: "Public pages, case metadata, and curated descriptions",
    rights: "Source-specific; text is cited, summarized, or paraphrased",
  },
  {
    source: "Geographic, demographic, and attention sources",
    role: "Aggregate context signals",
    coverage: "OpenAlex, GDELT, World Bank, Our World in Data, Open-Elevation, and availability checks",
    access: "Public APIs or processed aggregate records",
    rights: "Aggregate metrics and metadata only; upstream terms remain in force",
  },
] as const;

const calculationMethods = [
  ["Source capture", "Scripts fetch or ingest source-specific data into generated records. Full text is retained only where reuse is permitted; otherwise the project stores pointers, metadata, or curated evidence records."],
  ["Frequency denominator", "Viewer/API normalized frequencies keep their native denominator. Unigrams are labelled per million unigrams and bigrams per million bigrams. A shared appearances-per-million-words scale is permitted only when raw match counts and a common annual word-token denominator are both available."],
  ["Display transformation", "Square-root, indexed, ranked, period-aggregate, or max-normalized displays are labelled as transforms. They do not become raw counts through visual treatment."],
  ["Form policy", "Each study declares which forms remain separate and which may be grouped. Joined and spaced forms stay separate unless a preregistered aggregation and valid common denominator justify combining them."],
  ["Semantic grouping", "Curated phrase sets, collocates, source annotations, and domain evidence can form interpretive maps. They are not represented as automatic sense disambiguation."],
  ["Branch and dependency scoring", "Where a study uses curated examples, counts, object-type spread, phrase form, and modifier dependence may be converted into a disclosed score. That score is not popularity or legal meaning."],
  ["Confidence and boundary labels", "Claims are identified as source-supported, corpus-visible, manually attested, derived, pending, or cautionary. Sparse data, OCR, rights, genre, and coverage limits remain attached."],
] as const;

const archiveClaims = [
  "A selected form can be reported as more or less visible inside a named, compatible corpus series.",
  "A lexical or scanned source can support an attestation when source type, date precision, and uncertainty are named.",
  "A semantic chart can show curated interpretive structure when its grouping rule is disclosed.",
  "Retrieval, filtering, transformation, and visualization choices can be made auditable.",
] as const;

const archiveLimits = [
  "Frequency is not cultural importance, lived experience, literary value, causation, or legal meaning.",
  "A selected corpus is not all English usage, genres, places, or communities.",
  "A semantic group is not an automatic definition and is not mutually exclusive by default.",
  "A first detected corpus point is not the first historical use of a word.",
  "A missing result is not zero and is not evidence that a usage did not exist.",
  "A one-time modern capture is an inventory, not persistence, survival, or prevalence.",
] as const;

const rightsLedger = [
  ["Project source code", "Application code, styles, utilities, and pipeline implementation are released under MIT. The grant covers software implementation only."],
  ["Original research and design", "Research writing, curated datasets, classifications, page compositions, visual identity, and Dai Pan / 潘岱 authorship marks remain © 2026 Dai Pan / 潘岱. Non-commercial citation and study are permitted with attribution; commercial reproduction requires permission."],
  ["Google Books Ngram", "Source series remain Google data under the applicable Google Books Ngram terms and attribution; the archive does not relicense them."],
  ["Archival passages", "Project Gutenberg, Library of Congress, Internet Archive, and item-level public-domain or rights statements remain attached. Only short passages, metadata, or pointers are presented."],
  ["Modern open context", "Wikinews and Wikimedia material retains the applicable CC BY or CC BY-SA licence and attribution requirements; full articles are not republished."],
  ["Lexical references", "Dictionary entries are citation targets, not reproduced datasets. Etymonline, Wiktionary, OED, Merriam-Webster, and Cambridge retain their own rights."],
  ["Legal, policy, clinical, and technical sources", "Opinions, statutes, regulations, reports, article metadata, controlled vocabularies, and publisher pages are cited, linked, summarized, or paraphrased under source-specific terms."],
  ["Geographic and attention sources", "The interface may show processed counts, indices, labels, and context indicators; it does not redistribute upstream database dumps, news articles, search exports, or academic records."],
  ["Restricted or candidate corpora", "COHA, COCA, NOW, OED, HathiTrust/Bookworm, and EarlyPrint/EEBO-TCP remain candidate or manual-review controls unless an authorized export exists."],
  ["Raw caches and generated datasets", "Generated files document provenance and transformations. They are not an MIT rights grant for upstream material or for commercial extraction of curated classifications."],
  ["Site privacy", "The public site uses no accounts, cookies, or user tracking and stores no visitor personal data."],
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
        <p className={styles.navigationStatement}>This page explains how Words Over Time is designed, researched, sourced, reviewed, and bounded as an independent personal research and art project, developed through sustained inquiry across language, archives, data, writing, and visual form rather than commissioned, institutional, or commercial research.</p>
      </header>

      <div className={styles.groups}>
        <details className={styles.group} id="m-about-design">
          <summary className={styles.summary}>
            <span>Design</span>
            <span className={styles.summaryMark} aria-hidden="true">+</span>
          </summary>
          <div className={styles.groupBody}>
            <section className={styles.section} id="m-about-design-premise">
              <SectionHeading>Structure is part of the argument.</SectionHeading>
              <p>The project does not reproduce Swiss design as a historical style. It applies the principle that design structure makes claims, and those claims should be as auditable as the data they present.</p>
              <p>The desktop and mobile editions use independent composition systems because their reading conditions differ. Desktop can sustain a wide six-column field and optional interactive layers; mobile keeps a static, linear reading path with evidence and interpretation visible without hover.</p>
            </section>

            <section className={styles.section} id="m-about-design-system">
              <SectionHeading>Typography, colour, slash, rule, and grid</SectionHeading>
              <p>Helvetica Neue is the information carrier. Monospace labels identify method, state, source, and interface metadata. No type treatment is used as a substitute for evidence.</p>
              <p>Route colours identify studies, while evidence roles keep stable redundant labels. The slash closes a word mark without changing the researched form. Black rules mark structural boundaries; they do not encode quantity. Grid placement establishes reading relationships, not approximate data order.</p>
              <div className={styles.colourLedger} aria-label="Route colour ledger">
                {routeColours.map(([route, colour]) => (
                  <div key={route} className={styles.colourRow}>
                    <span className={styles.swatch} style={{ backgroundColor: colour }} aria-hidden="true" />
                    <span>{route}</span>
                    <span>{colour}</span>
                  </div>
                ))}
              </div>
              <p>The six evidence positions are signal, attestation, variant, context, boundary, and rights. Empty or unavailable evidence remains explicitly empty rather than being filled for symmetry.</p>
            </section>

            <section className={styles.section} id="m-about-data-to-form">
              <SectionHeading>Data-to-form and interaction boundaries</SectionHeading>
              <p>A figure begins with a research question, fields, filters, grouping, denominator, transform, result, caveat, and source rows. Visual channels are assigned only after that contract exists. Prose, section headings, and decorative metaphors do not generate research geometry.</p>
              <p>Mobile reading remains complete as static HTML and SVG. Hover can add emphasis on desktop but cannot carry exclusive meaning. JavaScript is not required for the mobile Home, About, or research narrative; reduced-motion preferences remove non-essential motion.</p>
            </section>

            <section className={styles.section} id="m-about-lineage">
              <SectionHeading>Design research lineage</SectionHeading>
              <div className={styles.cardList}>
                {designLineage.map((reference) => (
                  <article key={reference.name} className={styles.card}>
                    <p className={styles.cardLabel}>{reference.name}</p>
                    <p className={styles.cardMeta}>{reference.work} / {reference.year}</p>
                    <p>{reference.role}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className={styles.section} id="m-about-open-method">
              <SectionHeading>Design research and infographic art</SectionHeading>
              <p>The project is research, writing, interface design, and infographic art. Its open Infographic Editorial Design skill generalizes the method—define the claim, expose the evidence contract, design the reading path, and keep uncertainty visible—without granting reuse of this archive’s finished identity.</p>
              <a className={styles.textLink} href="https://github.com/dpan538/infographic-editorial-design-skill" target="_blank" rel="noreferrer">Open design-method skill ↗</a>
            </section>

            <section className={styles.section} id="m-about-accessibility">
              <SectionHeading>Accessibility and reduced motion</SectionHeading>
              <p>Text, labels, shapes, and line styles repeat colour meaning. Focus remains visible; controls meet a 44px target; mobile type is at least 13px; native disclosures work without JavaScript. Motion is supplementary and disabled when reduced motion is requested.</p>
            </section>

          </div>
        </details>

        <details className={styles.group} id="m-about-research">
          <summary className={styles.summary}>
            <span>Research method</span>
            <span className={styles.summaryMark} aria-hidden="true">+</span>
          </summary>
          <div className={styles.groupBody}>
            <section className={styles.section} id="m-about-object-scope">
              <SectionHeading>Research object and scope</SectionHeading>
              <p>Each entry is a selected-word study of historical frequency, semantic grouping, search and attention signals, lexical and scanned evidence, and source-bounded interpretation. It is not a general search engine or a dictionary.</p>
              <p>The intended audience is researchers, writers, educators, designers, artists, and anyone curious about how language carries history. A study does not claim that frequency equals importance, one archive represents all historical usage, or modern captures are directly comparable with historical corpora.</p>
            </section>

            <section className={styles.section} id="m-about-form-policy">
              <SectionHeading>Term and form selection</SectionHeading>
              <p>Every study declares its searched forms, spelling variants, compounds, X + word and word + X phrases, singular/plural grammar, and domain phrases. Aggregation is an editorial decision, not a default.</p>
              <p>Joined and spaced forms remain separate series unless all required forms are preregistered and a shared denominator is demonstrably valid. Missing forms are not replaced with zero.</p>
            </section>

            <section className={styles.section} id="m-about-evidence-flow">
              <SectionHeading>Evidence layers remain distinct</SectionHeading>
              <div className={styles.cardList}>
                {evidenceFlow.map((item) => (
                  <article key={item.number} className={styles.card}>
                    <p className={styles.cardLabel}>{item.number} / {item.title}</p>
                    <p className={styles.cardMeta}>Source / {item.source}</p>
                    <p><strong>Output:</strong> {item.output}.</p>
                    <p>{item.body}</p>
                    <p><strong>Limit:</strong> {item.constraint}</p>
                    <p><strong>Valid claim:</strong> {item.claim}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className={styles.section} id="m-about-printed-frequency">
              <SectionHeading>Printed frequency and denominator</SectionHeading>
              <p>Google Books Ngram Viewer values are source-normalized observations, not raw match counts. A unigram percentage is relative to all unigrams; a bigram percentage is relative to all bigrams. The public unit must therefore remain “per million unigrams” or “per million bigrams” unless raw match counts and a common annual word-token total support a new calculation.</p>
              <p>Smoothing 0 preserves the retrieved annual series. Any later smoothing, period aggregation, indexing, ranking, or normalization is stored and labelled as a transform rather than silently replacing the source series.</p>
            </section>

            <section className={styles.section} id="m-about-archive-modern-capture">
              <SectionHeading>Archival context and modern capture</SectionHeading>
              <p>Archive records distinguish composition, publication, edition, dictionary report, and capture dates. A verified unique passage remains one record with form, construction, work, publication year, and provenance; curated passages are a sample, not a population trend.</p>
              <p>Modern records distinguish a text date, page publication date, and capture date. Gutenberg and Wikinews remain separate source facets. A single capture is an inventory and cannot establish persistence, survival, or prevalence.</p>
            </section>

            <section className={styles.section} id="m-about-calculation-register">
              <SectionHeading>Count, unit, transform, and normalisation</SectionHeading>
              <dl className={styles.definitionList}>
                {calculationMethods.map(([term, description]) => (
                  <div key={term}>
                    <dt>{term}</dt>
                    <dd>{description}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section className={styles.section} id="m-about-comparability">
              <SectionHeading>Comparability, missingness, and first-use limits</SectionHeading>
              <div className={styles.claimGrid}>
                <div>
                  <h4>Can support</h4>
                  <ul>{archiveClaims.map((claim) => <li key={claim}>{claim}</li>)}</ul>
                </div>
                <div>
                  <h4>Cannot support</h4>
                  <ul>{archiveLimits.map((limit) => <li key={limit}>{limit}</li>)}</ul>
                </div>
              </div>
            </section>

            <details className={styles.subgroup} id="m-about-review-version">
              <summary className={styles.subsummary}>Review and version record</summary>
              <div className={styles.subgroupBody}>
                <p><strong>Published:</strong> 7 May 2026. <strong>Current route record:</strong> 28 July 2026.</p>
                <p>Review checks overclaiming, hierarchy, accessibility, source status, transforms, rights, and publication readiness. Pending, restricted, unavailable, and cautionary records remain labelled rather than being promoted into evidence.</p>
              </div>
            </details>
          </div>
        </details>

        <details className={styles.group} id="m-about-source">
          <summary className={styles.summary}>
            <span>Source</span>
            <span className={styles.summaryMark} aria-hidden="true">+</span>
          </summary>
          <div className={styles.groupBody}>
            <section className={styles.section} id="m-about-source-ledger">
              <SectionHeading>Evidence stays attached to its origin.</SectionHeading>
              <p>Words Over Time combines corpus series, archival passages, lexical references, public records, and contemporary context. These sources do different jobs and are never treated as one interchangeable dataset.</p>
              <p>Every public claim should retain its source identity, coverage, access path, date precision, transformation history, and rights boundary. Missing, restricted, unavailable, and incomparable records remain visible as limits rather than being converted into evidence.</p>
              <div className={styles.sourceLedger}>
                {sourceLedger.map((source) => (
                  <article key={source.source} className={styles.ledgerEntry}>
                    <h4>{source.source}</h4>
                    <p><strong>Role:</strong> {source.role}</p>
                    <p><strong>Coverage:</strong> {source.coverage}</p>
                    <p><strong>Access:</strong> {source.access}</p>
                    <p><strong>Rights:</strong> {source.rights}</p>
                  </article>
                ))}
              </div>
            </section>

            <details className={styles.subgroup} id="m-about-citations">
              <summary className={styles.subsummary}>Citation</summary>
              <div className={styles.subgroupBody}>
                <p>Cite this archive and upstream sources separately. A chart is an editorial synthesis of retrieval, cleaning, transformation, grouping, and visual design; it does not replace citations to Google Books Ngram, Project Gutenberg, Library of Congress, Wikimedia, dictionaries, policy pages, or clinical and technical references.</p>
                <p className={styles.citation}>Pan, Dai. “[Word page title].” Words Over Time, 2026, [page URL]. DOI: 10.5281/zenodo.20437678. Accessed [day month year].</p>
                <p>The DOI identifies the archive as a project; it is not a separate dataset identifier assigned to every route.</p>
                <a className={styles.textLink} href="https://doi.org/10.5281/zenodo.20437678" target="_blank" rel="noreferrer">Project DOI ↗</a>
              </div>
            </details>
          </div>
        </details>

        <details className={styles.group} id="m-about-license">
          <summary className={styles.summary}>
            <span>License</span>
            <span className={styles.summaryMark} aria-hidden="true">+</span>
          </summary>
          <div className={styles.groupBody}>
            <section className={styles.section} id="m-about-license-boundaries">
              <SectionHeading>Software openness does not erase authorship or upstream rights.</SectionHeading>
              <p>The public repository makes the application and research process inspectable. Its MIT licence applies to software implementation only; it does not automatically license the project’s research writing, visual identity, curated datasets, classifications, or third-party source material.</p>
              <p>Original work may be cited and studied non-commercially with attribution. Commercial copying, republication, dataset extraction, or reproduction of the finished visual identity requires written permission. Every upstream source retains its own applicable terms.</p>
              <a className={styles.textLink} href="https://opensource.org/license/mit" target="_blank" rel="noreferrer">Read the MIT licence ↗</a>
              <div className={styles.rightsLedger}>
                {rightsLedger.map(([category, boundary]) => (
                  <article key={category} className={styles.ledgerEntry}>
                    <h4>{category}</h4>
                    <p>{boundary}</p>
                  </article>
                ))}
              </div>
              <p className={styles.legalNote}>This page is a research and design archive, not legal advice. Public pages keep source URLs visible and avoid full third-party reproduction.</p>
            </section>
          </div>
        </details>

        <details className={styles.group} id="m-about-contact">
          <summary className={styles.summary}>
            <span>Contact</span>
            <span className={styles.summaryMark} aria-hidden="true">+</span>
          </summary>
          <div className={styles.groupBody}>
            <section className={styles.section} id="m-about-contact-creator">
              <SectionHeading>Creator</SectionHeading>
              <p>Research / data / writing / design by Dai Pan / 潘岱, a Chinese artist, designer, and design researcher working across visual art, photography, printmaking, writing, image-text worlds, and poetic research.</p>
              <p>Questions, corrections, source suggestions, and thoughtful responses to the project are welcome. Contact provides a direct channel for readers who are interested in the archive or want to point out evidence that should be reviewed.</p>
              <div className={styles.linkRow}>
                <a className={styles.textLink} href="https://daipan.art/" target="_blank" rel="noreferrer">Visual practice ↗</a>
                <a className={styles.textLink} href="https://www.daipan.ink/" target="_blank" rel="noreferrer">Writing practice ↗</a>
              </div>
            </section>

            <section className={styles.section} id="m-about-contact-direct">
              <SectionHeading>Direct contact</SectionHeading>
              <address className={styles.contactList}>
                <a className={styles.contactLink} href="mailto:dpan53853@gmail.com">
                  <span>Email</span>
                  <span>dpan53853@gmail.com</span>
                </a>
                <a className={styles.contactLink} href="tel:+8615262753021">
                  <span>Phone</span>
                  <span>+86 15262753021</span>
                </a>
              </address>
            </section>

            <section className={styles.section} id="m-about-contact-repository">
              <SectionHeading>Project repository</SectionHeading>
              <p>The public repository contains the application code, research scripts, generated records, and visualization components available for inspection.</p>
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
