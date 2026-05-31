import { AboutSectionNav } from "@/components/AboutSectionNav";
import { GridRuler } from "@/components/GridRuler";
import { JsonLd } from "@/components/JsonLd";
import { MethodDiagram } from "@/components/MethodDiagram";
import { Nav } from "@/components/Nav";
import { createPageMetadata, createRouteJsonLd } from "@/lib/site";
import Link from "next/link";

export const metadata = createPageMetadata("/about");
const jsonLd = createRouteJsonLd("/about");

const evidenceFlow = [
  {
    number: "01",
    title: "Corpus frequency",
    source: "long-run book / corpus frequency data",
    output: "normalized usage trace",
    body: "Frequency is read as a long-run signal, with corpus boundaries kept visible.",
    constraint: "Corpus size, genre mix, and source breaks stay attached to the line.",
    claim: "Feeds the detected-in-corpus label and long-term frequency module.",
    accent: "bg-nice",
    border: "group-hover/evidence:border-nice",
    text: "group-hover/evidence:text-nice",
  },
  {
    number: "02",
    title: "Lexical attestation",
    source: "dictionary / lexical evidence",
    output: "earliest attested usage",
    body: "Dictionary evidence anchors claims about first known use without pretending it is corpus frequency.",
    constraint: "Attestation can sit outside the archive corpus and still matter.",
    claim: "Feeds the attested-usage label and variant policy checks.",
    accent: "bg-blaze",
    border: "group-hover/evidence:border-blaze",
    text: "group-hover/evidence:text-blaze",
  },
  {
    number: "03",
    title: "Scanned evidence",
    source: "verified scanned-book page",
    output: "earliest scanned-book occurrence",
    body: "A page image or public-domain snippet gives inspectable context, still with uncertainty attached.",
    constraint: "Scan quality, OCR noise, and public-domain limits remain visible.",
    claim: "Feeds scanned-book occurrence and context snippet modules.",
    accent: "bg-sun",
    border: "group-hover/evidence:border-sun",
    text: "group-hover/evidence:text-fire",
  },
  {
    number: "04",
    title: "Annotation",
    source: "interpretive notes",
    output: "variant and uncertainty policy",
    body: "Notes separate spelling variants, semantic drift, licensing limits, and confidence.",
    constraint: "Interpretive decisions are recorded instead of hidden behind the chart.",
    claim: "Feeds semantic notes, confidence language, and module status.",
    accent: "bg-sail",
    border: "group-hover/evidence:border-sail",
    text: "group-hover/evidence:text-sail",
  },
];

const wordIndex = [
  { word: "data", status: "complete", color: "#1570AC", href: "/words/data" },
  { word: "privacy", status: "complete", color: "#6C4FA3", href: "/words/privacy" },
  { word: "artificial", status: "complete", color: "#A1081F", href: "/words/artificial" },
  { word: "hub", status: "complete", color: "#18314F", href: "/words/hub" },
  { word: "depression", status: "complete", color: "#1570AC", href: "/words/depression" },
  { word: "forever", status: "complete", color: "#F06B04", href: "/words/forever" },
  { word: "intelligence", status: "planned", color: "#050510" },
];

const dataSources = [
  {
    source: "Google Books Ngram Viewer",
    use: "Frequency time series",
    coverage: "English corpora through 2022; queried at smoothing 0 before local transforms",
    access: "Public JSON endpoint / scripted fetch",
    license: "Google Books Ngram terms; attribution required",
  },
  {
    source: "Project Gutenberg",
    use: "Public-domain context text",
    coverage: "Selected public-domain books, mainly eighteenth to early twentieth century",
    access: "Gutenberg text files / local processed extracts",
    license: "Project Gutenberg License; public-domain status varies outside the US",
  },
  {
    source: "Library of Congress / Chronicling America",
    use: "Historical newspaper evidence",
    coverage: "Digitized US newspapers, chiefly 1770s-1960s depending on collection availability",
    access: "LOC JSON, OCR text, image/PDF metadata",
    license: "Library of Congress rights statements; item-level rights vary",
  },
  {
    source: "Wikimedia / Wikinews / MediaWiki APIs",
    use: "Modern context and attention signals",
    coverage: "Contemporary page, article, and context metadata where relevant",
    access: "MediaWiki and Wikimedia public APIs",
    license: "CC BY / CC BY-SA family; project-specific terms apply",
  },
  {
    source: "Lexical references",
    use: "Attestation and sense-history checks",
    coverage: "OED candidate checks, Online Etymology Dictionary, Wiktionary, Merriam-Webster, Cambridge",
    access: "Manual review and citation pointers only",
    license: "Publisher-specific; entries are not reproduced",
  },
  {
    source: "Policy, clinical, and technical references",
    use: "Domain context anchors",
    coverage: "EU AI Act, GDPR/ICO, FTC/NIST/OECD, PubMed/MeSH, WHO/NIMH, APA/DSM-history pointers, Stanford HAI and related pages",
    access: "Public web pages, APIs, and manual source audits",
    license: "Source-specific; used as citation targets and metadata, not republished text",
  },
  {
    source: "Public law and human-rights repositories",
    use: "Legal and rights anchors",
    coverage: "Wikisource, CourtListener, Justia/Oyez, Cornell Wex, NY Senate, UN, ECHR, EUR-Lex, eCFR, govinfo, DOJ/HHS, FTC, OECD, CPPA and related public pages",
    access: "Public source pages, case-law metadata, statute/regulation references, and curated descriptions",
    license: "Source-specific; legal text, summaries, and court opinions are cited or paraphrased, not redistributed as a corpus",
  },
  {
    source: "Geographic and demographic context sources",
    use: "Aggregate context signals",
    coverage: "OpenAlex, GDELT, World Bank indicators, Our World in Data fallback values, Open-Elevation, and Google Trends availability checks",
    access: "Public APIs or processed aggregate records",
    license: "Source-specific; used as aggregate metrics, metadata, or unavailable-source audits only",
  },
];

const roleColors: Record<string, string> = {
  "Frequency time series": "#F06B04",
  "Public-domain context text": "#1570AC",
  "Historical newspaper evidence": "#1570AC",
  "Modern context and attention signals": "#2C9FC7",
  "Attestation and sense-history checks": "#050510",
  "Domain context anchors": "#036C17",
  "Legal and rights anchors": "#A1081F",
  "Aggregate context signals": "#596F82",
};

const calculationMethods = [
  {
    title: "Source capture",
    body: "Scripts fetch or ingest source-specific data into generated JSON files. Ngram queries are pulled as yearly series; Gutenberg and LOC material are stored as text or metadata extracts; policy, dictionary, clinical, and technical references are stored as source pointers or curated records when full-text reuse is restricted.",
  },
  {
    title: "Frequency normalization",
    body: "Google Ngram values are converted into comparable per-million visibility where needed. Most charts keep smoothing at 0, then apply local period aggregation, rank lookup, or max-normalization so that a chart compares terms within the same source family rather than across incompatible corpora.",
  },
  {
    title: "Display transformation",
    body: "Visual scales may use square-root, max-normalized, indexed, or ranked transforms. These transforms are display devices only: the interface labels them as visual intensity, visibility index, or relative signal rather than raw counts.",
  },
  {
    title: "Phrase and variant policy",
    body: "Each word page declares which forms belong together and which remain separate. Examples include spelling variants, compounds, X + word phrases, word + X phrases, singular/plural grammar, and domain phrases. Variant aggregation is treated as an editorial decision, not a default.",
  },
  {
    title: "Semantic grouping",
    body: "Semantic layers are built from curated phrase sets, keyword/collocate overlaps, source annotations, and domain-specific evidence records. They are not presented as machine-learned sense disambiguation; they are interpretive maps backed by visible source categories and caution language.",
  },
  {
    title: "Branch and dependency scoring",
    body: "For pages such as hub, form groups and dependency tiers are computed from curated examples: counts, object-type spread, phrase form, and modifier dependence are converted into visual branch maps. The score indicates how much the attached word specifies the object, not popularity or legal meaning.",
  },
  {
    title: "Confidence and boundary labels",
    body: "A claim can be source-supported, corpus-visible, manually attested, derived, pending, or cautionary. The page text must name that status instead of collapsing everything into proof. Absence, sparse data, OCR noise, rights limits, and genre bias remain attached to the claim.",
  },
];

const archiveClaims = [
  "Corpus frequency can show that selected forms become more or less visible within a named source boundary.",
  "Lexical and scanned sources can support attestation claims when source type and uncertainty are named.",
  "Semantic charts can show curated interpretive structure when the grouping rule is disclosed.",
  "Data collection, transformation, and visualization choices should be visible enough to audit.",
];

const archiveLimits = [
  "Frequency does not equal cultural importance, lived experience, literary value, or legal meaning.",
  "A selected corpus is not all English usage, all genres, or all communities.",
  "A semantic group is not an automatic definition and is not mutually exclusive by default.",
  "A first detected corpus point is not the first historical use of a word.",
  "A missing result is not evidence that a usage did not exist.",
];

const designReferences = [
  {
    author: "Josef Müller-Brockmann",
    years: "1914-1996",
    work: "Grid Systems in Graphic Design",
    year: "1961",
    relevance:
      "The six-column grid that structures every word entry is a direct application of Müller-Brockmann's modular grid principle: a visible, auditable structure that makes the absence of data as legible as its presence.",
    color: "#F06B04",
  },
  {
    author: "Karl Gerstner",
    years: "1930-2017",
    work: "Designing Programmes",
    year: "1964",
    relevance:
      "The color token system (ink, wheat, blaze, fire, sun, nice, curious, wine, sail) is a programme in Gerstner's sense: each token is a rule, not a feeling. Orange marks emphasis and interactivity. Blue marks sources and data layers. Green marks confidence.",
    color: "#1570AC",
  },
  {
    author: "Emil Ruder",
    years: "1914-1970",
    work: "Typographie",
    year: "1967",
    relevance:
      "Helvetica Neue is used throughout as an information-neutral carrier. Ruder's argument that type must serve communication rather than express the typographer applies here: the typeface does not perform its own historicity.",
    color: "#A1081F",
  },
  {
    author: "HfG Ulm",
    years: "1953-1968",
    work: "Hochschule für Gestaltung",
    year: "1953-1968",
    relevance:
      "The Ulm model treated design as an epistemological practice: structure makes claims, not just appearances. The page modules and evidence diagrams are design research artifacts; they argue through their structure that evidence should be shown as a relational system.",
    color: "#036C17",
  },
];

const evidenceColumns = [
  { label: "Signal", sub: "source-specific", color: "#F06B04", filled: true },
  { label: "Attestation", sub: "lexical proof", color: "#F06B04", filled: true },
  { label: "Variant", sub: "form policy", color: "#1570AC", filled: true },
  { label: "Context", sub: "snippet evidence", color: "#1570AC", filled: true },
  { label: "Boundary", sub: "claim limit", color: "#050510", filled: false },
  { label: "Rights", sub: "attribution", color: "#050510", filled: false, dashed: true },
];

const openItems = [
  "Data pipeline scripts (TypeScript, Node)",
  "Generated JSON datasets",
  "All visualization and UI components",
  "Calculation methods and stopword lists",
];

const curatedItems = [
  "Word selection and editorial decisions",
  "Category definitions and heuristics",
  "Interpretive annotations and pressure anchors",
  "Visual design and typographic decisions",
];

const licenses = [
  {
    category: "Project source code",
    items: [
      "Application code and components",
      "Styles, utilities, scripts, and configuration",
      "Data-processing pipeline implementation",
    ],
    statement: "Released under the MIT License.",
    note: "The MIT grant applies to software implementation only. It supports inspection, extension, reproducibility, and method study; it does not apply to research writing, visual design, curated datasets, semantic classifications, or authorship marks.",
    url: "https://opensource.org/license/mit",
  },
  {
    category: "Original research and design",
    items: [
      "Research text and methodology narrative",
      "Infographic and interface design",
      "Page composition and visual expression",
      "Curated datasets and word lists",
      "Category definitions and heuristics",
      "Interpretive annotations and pressure anchors",
      "Dai Pan / 潘岱 author identity and attribution",
    ],
    statement: "© 2026 Dai Pan / 潘岱. Non-commercial citation and study permitted with attribution.",
    note: "These materials may be cited, studied, quoted in short form, and referenced for non-commercial research, criticism, review, teaching, or educational purposes. Commercial copying, resale, republication, product packaging, dataset extraction, or visual/design reproduction is not permitted without written permission.",
  },
  {
    category: "Corpus frequency data",
    items: ["Google Books Ngram series (1500-2022)"],
    statement: "Source data: Google LLC, Google Books Ngram Viewer.",
    note: "Used under Creative Commons Attribution 3.0 Unported.",
    url: "https://creativecommons.org/licenses/by/3.0/",
  },
  {
    category: "Archival text snippets",
    items: [
      "Project Gutenberg public-domain texts (1726-1930)",
      "Library of Congress / Chronicling America page records",
      "Internet Archive public-domain dictionary scans",
    ],
    statement: "Sourced from Project Gutenberg (gutenberg.org).",
    note: "Only brief excerpts, metadata, or page pointers are used. Public-domain status is source- and jurisdiction-specific; item records should remain linked.",
    url: "https://www.gutenberg.org/policy/license.html",
  },
  {
    category: "Modern context snippets",
    items: ["Wikinews English edition (2024-2026)", "Wikipedia / Wikimedia page metadata and extracts where used"],
    statement: "Sourced from Wikinews via MediaWiki API.",
    note: "Used as short contextual evidence. Wikinews licensing depends on publication date: older English Wikinews material is generally CC BY 2.5, while material published from 16 December 2024 is CC BY 4.0. Wikipedia/Wikimedia text remains under the applicable CC BY-SA terms. Article text is not republished in full.",
    url: "https://en.wikinews.org/wiki/Wikinews:Copyright",
  },
  {
    category: "Lexical and etymological references",
    items: [
      "Online Etymology Dictionary",
      "Wiktionary",
      "Merriam-Webster",
      "Cambridge Dictionary",
      "Oxford English Dictionary candidate checks",
    ],
    statement: "Used for attestation, spelling, grammar, and sense-history checks only.",
    note: "Dictionary entries are cited as references, not reproduced. Etymonline © Douglas Harper; Wiktionary content under CC BY-SA; other dictionary rights remain with their publishers.",
  },
  {
    category: "Legal, policy, and technical references",
    items: [
      "EU AI Act / EUR-Lex",
      "ICO and GDPR reference pages",
      "CourtListener, Justia/Oyez, Cornell Wex, UN, ECHR, NY Senate, eCFR, govinfo, DOJ/HHS, FTC, OECD, CPPA, Census, and Stanford HAI pages",
      "Britannica, Cleveland Clinic, FCC, PLOS, and publisher pages",
      "Academic references for data science and datafication",
    ],
    statement: "Used as context anchors, source audits, and citation targets.",
    note: "Legal opinions, statutes, regulations, treaty language, platform policy pages, reports, and publisher pages are cited, linked, summarized, or paraphrased. They are not republished as full texts or treated as reusable site-owned content. Rights and reuse terms remain source-specific.",
  },
  {
    category: "Clinical and bibliographic metadata",
    items: [
      "PubMed and MeSH / NCBI records",
      "PubMed Central Open Access Subset pointers",
      "WHO, ICD-11, NIMH, APA DSM-history references",
      "Journal article titles and publication metadata",
    ],
    statement: "Used for metadata, controlled-vocabulary signals, and public-health context only.",
    note: "Article titles, identifiers, source URLs, and short metadata records are used as bibliographic evidence. Abstracts, full articles, DSM text, and publisher-owned clinical material are not redistributed; PMC and journal reuse terms vary by article.",
    url: "https://pmc.ncbi.nlm.nih.gov/about/copyright/",
  },
  {
    category: "Geographic, demographic, and attention signals",
    items: [
      "OpenAlex works/institution metadata",
      "GDELT news/source attention",
      "World Bank and Our World in Data demographic indicators",
      "Open-Elevation enrichment",
      "Google Trends candidate checks",
    ],
    statement: "Used for aggregate geography, population, and availability signals.",
    note: "The site displays processed counts, indices, country/city labels, and contextual indicators. It does not redistribute full news articles, search exports, academic records, or upstream database dumps; each upstream source keeps its own terms.",
  },
  {
    category: "Contemporary metadata and attention signals",
    items: [
      "Wikimedia Pageviews API",
      "arXiv API metadata attempts",
      "Stanford AI Index public web pages",
      "Google Trends candidate checks",
    ],
    statement: "Used for aggregate counts, availability audits, and source pointers only.",
    note: "No article text, abstracts, report pages, or trend exports are redistributed by this archive; API and publisher terms apply.",
  },
  {
    category: "Restricted or candidate corpora",
    items: [
      "COHA, COCA, and NOW Corpus",
      "Oxford English Dictionary",
      "HathiTrust / Bookworm",
      "EarlyPrint / EEBO-TCP",
    ],
    statement: "Listed as candidate or manual-review controls unless an authorized export is available.",
    note: "These sources are not bundled, republished, or treated as integrated public data in this prototype. Pending or restricted records should not be promoted into public-facing excerpts.",
  },
  {
    category: "Raw caches and generated datasets",
    items: [
      "Research JSON, source indexes, and API response caches",
      "Derived scores, labels, and visualization-ready records",
    ],
    statement: "Generated files document research provenance and transformation steps.",
    note: "They are not released under MIT and are not a rights grant for upstream material. Public pages may cite or summarize the research synthesis, but commercial extraction, republication, or reuse of curated datasets and classifications requires written permission and must follow the rights status attached to the original source.",
  },
  {
    category: "Site privacy and data use",
    items: [],
    statement: "This site does not use accounts, cookies, or user tracking.",
    note: "No personal data is collected or stored.",
  },
];

type AboutSectionHeaderProps = {
  num: string;
  kicker: string;
  title: string;
  desc?: string;
};

function AboutSectionHeader({
  num,
  kicker,
  title,
  desc,
}: AboutSectionHeaderProps) {
  return (
    <header className="flex flex-col">
      <span className="select-none font-mono text-[clamp(2.8rem,4vw,4.5rem)] font-black leading-none text-ink/10">
        {num}
      </span>
      <p className="-mt-1 font-mono text-[0.96rem] font-black uppercase tracking-[0.22em] text-fire">
        {kicker}
      </p>
      <h2 className="mt-3 text-[clamp(1.6rem,2.4vw,2.6rem)] font-black leading-[0.96]">
        {title}
      </h2>
      {desc ? (
        <p className="mt-4 text-[0.96rem] font-bold leading-5 text-ink/52">
          {desc}
        </p>
      ) : null}
    </header>
  );
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-wheat text-ink">
      <JsonLd data={jsonLd} />
      <AboutSectionNav />
      <div className="flex w-full flex-col gap-8 px-5 py-5 sm:px-10 sm:py-7 lg:gap-12 lg:pl-20 lg:pr-16 xl:pl-24 xl:pr-20">
        <Nav />
        <GridRuler />

        <section
          id="project-statement"
          className="scroll-mt-20 grid gap-8 border-y-2 border-ink py-8 lg:grid-cols-[16rem_1fr] lg:gap-16"
        >
          <header>
            <p className="font-mono text-[0.82rem] font-black uppercase tracking-[0.22em] text-fire">
              00 / project statement
            </p>
            <h1 className="mt-4 text-[clamp(2.7rem,5vw,6rem)] font-black leading-[0.9] tracking-normal">
              Words Over Time
            </h1>
          </header>
          <div className="max-w-4xl">
            <p className="text-[clamp(1.45rem,2.6vw,2.8rem)] font-black leading-[0.98]">
              is a semantic-frequency research project,
              <br />
              design research, and infographic art.
            </p>
            <div className="mt-8 grid gap-5 text-[0.96rem] font-bold leading-6 text-ink/70 md:grid-cols-2">
              <p>
                Words Over Time is made by Dai Pan / 潘岱, a Chinese artist,
                designer, and design researcher. It treats language as visual
                material: a field of memory, evidence, attention, and public
                pressure that can be studied through semantic change, word
                frequency, search statistics, and source-led interpretation.
              </p>
              <p>
                This is not a dictionary. It does not define words. It does not
                claim that frequency reflects importance, that Gutenberg texts
                represent all historical usage, or that modern news snippets are
                comparable to historical corpora. What it does claim is that the
                available evidence is worth making visible, with its sources,
                limits, and gaps stated alongside the data.
              </p>
            </div>
            <div className="mt-7 grid gap-4 border-t border-ink/22 pt-5 font-mono text-[0.84rem] font-black uppercase leading-5 tracking-[0.12em] text-ink/62 md:grid-cols-[1fr_1fr]">
              <a className="transition hover:text-fire" href="https://daipan.art/" target="_blank" rel="noreferrer">
                Dai Pan / visual art, photography, printmaking, design research
              </a>
              <a className="transition hover:text-fire" href="https://www.daipan.ink/" target="_blank" rel="noreferrer">
                Dai Pan / writing, image-text worlds, poetic research
              </a>
            </div>
            <p className="mt-7 border-t border-ink/22 pt-4 font-mono text-[0.84rem] font-black uppercase leading-5 tracking-[0.14em] text-ink/70">
              Intended audience: researchers, writers, educators, designers,
              artists, and anyone curious about how language carries history.
            </p>
          </div>
        </section>

        <section
          id="methodology"
          className="scroll-mt-20 border-y-2 border-ink py-4"
        >
          <div className="grid gap-4 lg:grid-cols-[0.48fr_0.74fr_0.78fr] lg:items-stretch">
            <header className="border-b-2 border-ink pb-4 lg:border-b-0 lg:border-r-2 lg:pb-0 lg:pr-5">
              <p className="text-[0.82rem] font-black uppercase tracking-[0.22em] text-fire">
                01 / methodology
              </p>
              <h1 className="mt-4 text-[clamp(2.8rem,4.5vw,4.8rem)] font-black leading-[0.9] tracking-normal">
                methodology
              </h1>
              <p className="mt-5 max-w-md text-base font-bold leading-6 text-ink/72">
                A selected-word research system for historical frequency,
                semantic grouping, search statistics, scanned evidence, and
                interpretation.
              </p>
            </header>

            <div className="grid gap-4">
              <MethodDiagram />
            </div>

            <aside className="border-t border-ink/30 pt-5 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
              <p className="font-mono text-[0.82rem] font-black uppercase tracking-[0.22em] text-fire">
                word index
              </p>
              <div className="mt-4 flex flex-col gap-2">
                {wordIndex.map(({ word, status, color, href }) => (
                  <div
                    key={word}
                    className="flex items-center justify-between gap-4"
                  >
                    {href ? (
                      <Link
                        href={href}
                        className="font-mono text-[0.96rem] font-black uppercase transition hover:text-nice"
                        style={{ color }}
                      >
                        {word}
                      </Link>
                    ) : (
                      <span
                        className="font-mono text-[0.96rem] font-black uppercase"
                        style={{ color }}
                      >
                        {word}
                      </span>
                    )}
                    <span
                      className={`font-mono text-[0.86rem] font-black uppercase tracking-[0.14em] ${
                        status === "complete" ? "text-sail" : "text-ink/30"
                      }`}
                    >
                      {status}
                    </span>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </section>

        <section
          id="design-research"
          className="scroll-mt-20 grid gap-8 border-t-2 border-ink pt-10 lg:grid-cols-[16rem_1fr] lg:gap-16"
        >
          <AboutSectionHeader
            num="02"
            kicker="design research"
            title="Grid as argument"
            desc="The visual structure draws on the Swiss International Typographic Style as developed between the 1950s and 1980s at the Basel School of Design and the HfG Ulm."
          />

          <div className="flex flex-col gap-8">
            <div className="border-l-4 border-ink py-1 pl-5">
              <p className="text-[clamp(1.1rem,1.8vw,1.6rem)] font-black leading-[1.1]">
                The six-column grid is not an aesthetic choice. It is a claim
                that the six categories of semantic evidence are commensurate
                and comparable. When a category is missing, the column is empty.
                The gap is not hidden.
              </p>
            </div>

            <div>
              <p className="mb-3 font-mono text-[0.96rem] font-black uppercase tracking-[0.16em] text-fire">
                the visual programme / six evidence columns
              </p>
              <div
                className="grid border border-ink/40"
                style={{ gridTemplateColumns: "repeat(6, minmax(0, 1fr))" }}
              >
                {evidenceColumns.map((col, index) => (
                  <div
                    key={col.label}
                    className={`border-ink/18 px-2 py-4 transition duration-200 sm:px-3 ${
                      index < evidenceColumns.length - 1 ? "border-r" : ""
                    } ${col.dashed ? "opacity-35" : ""}`}
                    style={{
                      background: col.filled ? `${col.color}10` : "transparent",
                      borderTop: `3px solid ${
                        col.filled ? col.color : "rgba(5,5,16,0.15)"
                      }`,
                      borderTopStyle: col.dashed ? "dashed" : "solid",
                    }}
                  >
                    <p
                      className="font-mono text-[0.84rem] font-black uppercase tracking-[0.14em]"
                      style={{
                        color: col.filled ? col.color : "rgba(5,5,16,0.3)",
                      }}
                    >
                      {col.label}
                    </p>
                    <p className="mt-1 font-mono text-[0.84rem] font-bold leading-4 text-ink/40">
                      {col.sub}
                    </p>
                  </div>
                ))}
              </div>
              <p className="mt-2 font-mono text-[0.84rem] font-bold leading-4 text-ink/38">
                Faded columns = evidence not yet implemented. The absence is
                structural, not hidden.
              </p>
            </div>

            <div className="grid gap-0 border border-ink/25 sm:grid-cols-2 lg:grid-cols-4">
              {designReferences.map((ref, index) => (
                <article
                  key={ref.author}
                  className={`flex flex-col border-ink/18 px-4 pb-5 pt-4 transition duration-200 hover:bg-white/20 ${
                    index < designReferences.length - 1
                      ? "border-b lg:border-b-0"
                      : ""
                  } ${index >= 2 ? "sm:border-b-0" : ""} ${
                    index % 2 === 0 ? "sm:border-r" : ""
                  } ${
                    index < designReferences.length - 1 ? "lg:border-r" : ""
                  }`}
                >
                  <div
                    className="mb-3 h-[3px] w-6"
                    style={{ backgroundColor: ref.color }}
                  />
                  <p
                    className="font-mono text-[0.86rem] font-black uppercase tracking-[0.13em]"
                    style={{ color: ref.color }}
                  >
                    {ref.author}
                  </p>
                  <p className="mt-0.5 font-mono text-[0.84rem] font-bold text-ink/32">
                    {ref.years}
                  </p>

                  <p className="mt-3 font-mono text-[0.84rem] font-black uppercase leading-4 tracking-[0.1em] text-ink/55">
                    {ref.work}
                  </p>
                  <p className="font-mono text-[0.84rem] font-bold text-ink/30">
                    {ref.year}
                  </p>

                  <p className="mt-3 border-t border-ink/12 pt-3 text-[0.86rem] font-bold leading-[1.5] text-ink/55">
                    {ref.relevance}
                  </p>
                </article>
              ))}
            </div>

            <div className="border-t border-ink/18 pt-5">
              <p className="max-w-3xl text-[0.96rem] font-bold leading-6 text-ink/58">
                This is not an application of Swiss design as historical style.
                It is an application of the underlying principle: that the
                structure of a design makes claims, and those claims should be
                as auditable as the data they present.
              </p>
            </div>
          </div>
        </section>

        <section
          id="layered-evidence"
          className="scroll-mt-20 grid gap-10 py-2 lg:grid-cols-[16rem_1fr] lg:gap-16"
        >
          <AboutSectionHeader
            num="03"
            kicker="layered evidence"
            title="Evidence flow"
            desc="Two information layers share one structure. The source layer stays readable at rest; hover gently brings the output layer forward."
          />

          <div className="grid gap-0 border border-ink/30 sm:grid-cols-2">
            {evidenceFlow.map((item, index) => (
              <article
                key={item.number}
                className={`group/evidence flex flex-col border-ink/20 transition duration-200
                  hover:bg-white/20
                  ${index % 2 === 0 ? "sm:border-r" : ""}
                  ${index < 2 ? "border-b" : ""}`}
              >
                {/* Source row */}
                <div className={`flex items-center gap-3 border-l-[3px] border-ink/30 px-4 py-3
                                 transition duration-200 ${item.border}`}>
                  <span className={`h-3 w-3 flex-shrink-0 border border-ink/60 ${item.accent}`} />
                  <p className="font-mono text-[0.84rem] font-black uppercase tracking-[0.16em] text-ink/40">
                    {item.number} / source
                  </p>
                  <p className={`font-mono text-[0.84rem] font-black uppercase tracking-[0.1em]
                                 text-ink/55 transition duration-200 ${item.text}`}>
                    {item.source}
                  </p>
                </div>

                {/* Output content */}
                <div className="flex flex-1 flex-col px-4 pb-5 pt-4">
                  <p className={`font-mono text-[0.86rem] font-black uppercase tracking-[0.16em]
                                 text-fire transition duration-200 ${item.text}`}>
                    output / {item.title}
                  </p>
                  <h3 className="mt-2 text-[clamp(1.15rem,1.6vw,1.5rem)] font-black leading-[1.02]">
                    {item.output}
                  </h3>
                  <p className="mt-3 text-[0.96rem] font-bold leading-[1.55] text-ink/65">
                    {item.body}
                  </p>
                  <p className="mt-4 border-t border-ink/12 pt-3 text-[0.84rem] font-bold
                                leading-5 text-ink/45 transition duration-200
                                group-hover/evidence:text-ink/65">
                    {item.constraint}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section
          id="source-ledger"
          className="scroll-mt-20 grid gap-8 border-t-2 border-ink pt-10 lg:grid-cols-[16rem_1fr] lg:gap-16"
        >
          <AboutSectionHeader
            num="04"
            kicker="data sources"
            title="Source ledger"
          />
          <div className="overflow-x-auto border border-ink/40">
            <table className="w-full min-w-[560px] border-collapse text-left">
              <thead className="font-mono text-[0.86rem] uppercase tracking-[0.14em] text-fire">
                <tr className="border-b border-ink/30">
                  <th className="px-4 py-2.5">Source</th>
                  <th className="px-4 py-2.5">Role</th>
                  <th className="px-4 py-2.5">Coverage</th>
                  <th className="px-4 py-2.5">License</th>
                </tr>
              </thead>
              <tbody className="text-[0.92rem] font-bold leading-5 text-ink/68">
                {dataSources.map((source, index) => {
                  const roleColor = roleColors[source.use] ?? "#050510";
                  return (
                    <tr
                      key={source.source}
                      className={`border-b border-ink/14 transition duration-150
                                  last:border-b-0 hover:bg-white/30
                                  ${index % 2 !== 0 ? "bg-ink/[0.02]" : ""}`}
                    >
                      <td className="px-4 py-3 font-black text-ink">
                        {source.source}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-block px-1.5 py-0.5 font-mono
                                     text-[0.84rem] font-black uppercase tracking-[0.09em]"
                          style={{ color: roleColor, border: `1px solid ${roleColor}` }}
                        >
                          {source.use}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-[0.96rem] text-ink/60">
                        {source.coverage}
                      </td>
                      <td className="px-4 py-3 text-[0.84rem] text-ink/48">
                        {source.license}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section
          id="calculation-methods"
          className="scroll-mt-20 grid gap-8 border-t-2 border-ink pt-10 lg:grid-cols-[16rem_1fr] lg:gap-16"
        >
          <AboutSectionHeader
            num="05"
            kicker="calculation methods"
            title="How values are made visible"
          />
          <div className="border border-ink/30">
            {calculationMethods.map((method, index) => (
              <div
                key={method.title}
                className={`grid gap-0 sm:grid-cols-[10rem_1fr] ${
                  index < calculationMethods.length - 1
                    ? "border-b border-ink/15"
                    : ""
                }`}
              >
                <div className="border-b border-ink/10 px-4 py-3.5 sm:border-b-0 sm:border-r sm:border-ink/15">
                  <p className="font-mono text-[0.86rem] font-black uppercase leading-[1.4] tracking-[0.13em] text-fire">
                    {method.title}
                  </p>
                </div>
                <div className="px-5 py-3.5">
                  <p className="text-[0.92rem] font-bold leading-[1.55] text-ink/60">
                    {method.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section
          id="claim-boundaries"
          className="scroll-mt-20 grid gap-8 border-t-2 border-ink pt-10 lg:grid-cols-[16rem_1fr] lg:gap-16"
        >
          <AboutSectionHeader
            num="06"
            kicker="epistemological position"
            title="Claim boundaries"
          />
          <div className="space-y-6">
            <p className="max-w-4xl text-[1.06rem] font-bold leading-7 text-ink/70">
              The archive makes bounded claims. It can show that a selected form is visible in a named corpus, that a cited source supports an attestation, or that a curated semantic grouping organizes the evidence. It does not turn those signals into universal claims about all English usage, all communities, or all meanings of a word.
            </p>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <p className="font-mono text-[0.82rem] font-black uppercase tracking-[0.16em] text-sail">claims allowed</p>
                <ul className="mt-3 space-y-3 text-[0.96rem] font-bold leading-6 text-ink/72">
                  {archiveClaims.map((claim) => (
                    <li key={claim}>+ {claim}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-mono text-[0.82rem] font-black uppercase tracking-[0.16em] text-wine">claims refused</p>
                <ul className="mt-3 space-y-3 text-[0.96rem] font-bold leading-6 text-ink/62">
                  {archiveLimits.map((limit) => (
                    <li key={limit}>- {limit}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section
          id="open-skill"
          className="scroll-mt-20 grid gap-8 border-t-2 border-ink pt-10 lg:grid-cols-[16rem_1fr] lg:gap-16"
        >
          <AboutSectionHeader
            num="07"
            kicker="open method"
            title="Infographic Editorial Design Skill"
            desc="The design method behind this archive is also published as an open Codex skill for source-led infographic and editorial design."
          />

          <div className="flex flex-col gap-6">
            <div className="border-l-4 border-fire py-1 pl-5">
              <p className="max-w-4xl text-[clamp(1.08rem,1.7vw,1.5rem)] font-black leading-[1.15]">
                The skill is a portable method refined from this design
                experience: define the claim, expose the evidence contract,
                design the reading path, and keep uncertainty visible.
              </p>
            </div>

            <a
              href="https://github.com/dpan538/infographic-editorial-design-skill"
              target="_blank"
              rel="noreferrer"
              className="group flex items-stretch border border-ink/40 transition duration-200 hover:border-fire hover:bg-white/20"
            >
              <div className="flex w-12 flex-shrink-0 items-center justify-center border-r border-ink/30 bg-fire/[0.08]">
                <span className="font-mono text-[0.9rem] font-black uppercase tracking-[0.08em] text-fire">
                  SK
                </span>
              </div>
              <div className="flex flex-1 items-center justify-between gap-4 px-5 py-4">
                <div>
                  <p className="font-mono text-[0.96rem] font-black uppercase tracking-[0.14em] text-fire">
                    github / open skill
                  </p>
                  <p className="mt-1 text-[0.96rem] font-black text-ink">
                    infographic-editorial-design-skill
                  </p>
                  <p className="mt-1 font-mono text-[0.86rem] font-bold uppercase leading-5 tracking-[0.1em] text-ink/48">
                    MIT package / Codex skill / research-led infographic method
                  </p>
                </div>
                <span className="font-mono text-[0.96rem] font-black uppercase tracking-[0.1em] text-ink/30 transition group-hover:text-fire">
                  -&gt;
                </span>
              </div>
            </a>

            <div className="grid gap-4 md:grid-cols-3">
              {[
                {
                  label: "claim",
                  body: "The artifact starts by naming what the evidence can and cannot support.",
                },
                {
                  label: "contract",
                  body: "Source types, transforms, caveats, rights, and curated decisions stay visible.",
                },
                {
                  label: "review",
                  body: "The skill includes a rubric for overclaiming, hierarchy, accessibility, and publication readiness.",
                },
              ].map((item) => (
                <article key={item.label} className="border-l-2 border-ink/30 px-4 py-2">
                  <p className="font-mono text-[0.84rem] font-black uppercase tracking-[0.14em] text-fire">
                    {item.label}
                  </p>
                  <p className="mt-2 text-[0.94rem] font-bold leading-6 text-ink/62">
                    {item.body}
                  </p>
                </article>
              ))}
            </div>

            <p className="max-w-4xl border-t border-ink/16 pt-4 text-[0.94rem] font-bold leading-6 text-ink/58">
              The skill generalizes the method, not the finished identity. The
              MIT license covers the skill package itself; this archive's
              research writing, curated datasets, page compositions, visual
              identity, authorship marks, and third-party source material remain
              outside that grant.
            </p>
          </div>
        </section>

        <section
          id="open-source"
          className="scroll-mt-20 grid gap-8 border-t-2 border-ink pt-10 lg:grid-cols-[16rem_1fr] lg:gap-16"
        >
          <AboutSectionHeader
            num="08"
            kicker="public repository"
            title="Code & data"
            desc="The data pipeline and visualization components are public for inspection, reproducibility, and citation review."
          />

          <div className="flex flex-col gap-6">
            <a
              href="https://github.com/dpan538/Words-Over-Time"
              target="_blank"
              rel="noreferrer"
              className="group flex items-stretch border border-ink/40 transition duration-200 hover:border-ink hover:bg-white/20"
            >
              <div className="flex w-12 flex-shrink-0 items-center justify-center border-r border-ink/30 bg-ink/[0.04]">
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5 fill-ink/60 transition group-hover:fill-ink"
                  aria-hidden="true"
                >
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </div>
              <div className="flex flex-1 items-center justify-between gap-4 px-5 py-4">
                <div>
                  <p className="font-mono text-[0.96rem] font-black uppercase tracking-[0.14em] text-fire">
                    github / dpan538
                  </p>
                  <p className="mt-1 text-[0.96rem] font-black text-ink">
                    Words-Over-Time
                  </p>
                  <p className="mt-1 font-mono text-[0.86rem] font-bold text-ink/48">
                    Public repository / Data pipeline / All components
                  </p>
                </div>
                <span className="font-mono text-[0.96rem] font-black uppercase tracking-[0.1em] text-ink/30 transition group-hover:text-ink/60">
                  -&gt;
                </span>
              </div>
            </a>

            <div className="grid gap-4 sm:grid-cols-2">
              <article className="border-l-2 border-ink/40 px-5 py-3">
                <p className="font-mono text-[0.86rem] font-black uppercase tracking-[0.14em] text-ink/50">
                  What is inspectable
                </p>
                <ul className="mt-3 space-y-2 text-[0.96rem] font-bold leading-5 text-ink/68">
                  {openItems.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="text-sail">+</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </article>
              <article className="border-l-2 border-ink/20 px-5 py-3">
                <p className="font-mono text-[0.86rem] font-black uppercase tracking-[0.14em] text-ink/40">
                  What is curated (not generic)
                </p>
                <ul className="mt-3 space-y-2 text-[0.96rem] font-bold leading-5 text-ink/52">
                  {curatedItems.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="text-ink/30">.</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </article>
            </div>

            <div className="border border-ink/20 bg-ink/[0.03] px-5 py-4">
              <p className="font-mono text-[0.82rem] font-black uppercase tracking-[0.14em] text-fire">
                citation note
              </p>
              <div className="mt-3 grid gap-4 text-[0.96rem] font-bold leading-6 text-ink/66 lg:grid-cols-[1fr_1.1fr]">
                <p>
                  Cite the archive and the upstream sources separately. A Words Over Time chart is an editorial synthesis of source retrieval, cleaning, transformation, semantic grouping, and visual design; it is not a replacement citation for Google Books Ngram, Project Gutenberg, Library of Congress, Wikimedia, dictionary publishers, policy pages, or clinical/technical references.
                </p>
                <div className="border-l border-ink/22 pl-4">
                  <p className="font-mono text-[0.82rem] font-black uppercase tracking-[0.12em] text-ink/58">suggested website citation style</p>
                  <p className="mt-2 font-mono text-[0.86rem] font-bold leading-6 text-ink/72">
                    Pan, Dai. "[Word page title]." Words Over Time, 2026, [page URL]. DOI: 10.5281/zenodo.20437678. Accessed [day month year].
                  </p>
                  <p className="mt-3 font-mono text-[0.86rem] font-bold leading-6 text-ink/72">
                    Example: Pan, Dai. "Hub." Words Over Time, 2026, https://wordsovertime.com/words/hub. DOI: 10.5281/zenodo.20437678. Accessed 27 May 2026.
                  </p>
                  <p className="mt-3 font-mono text-[0.86rem] font-bold leading-6 text-ink/72">
                    Project DOI: https://doi.org/10.5281/zenodo.20437678
                  </p>
                </div>
              </div>
              <p className="mt-4 border-t border-ink/14 pt-4 text-[0.9rem] font-bold leading-6 text-ink/54">
                Rights note: this page is a research and design archive, not legal advice. Public launch should keep source URLs visible, avoid full third-party reproductions, and remove or paraphrase any pending, restricted, or subscription-only excerpt.
              </p>
            </div>
          </div>
        </section>

        <footer id="licensing" className="scroll-mt-20 border-t-2 border-ink py-8">
          <div className="grid gap-8 lg:grid-cols-[16rem_1fr] lg:gap-16">
            <AboutSectionHeader
              num="09"
              kicker="rights & attribution"
              title="Licensing"
            />
            <div className="grid gap-4 md:grid-cols-2">
              {licenses.map((license) => (
                <article
                  key={license.category}
                  className="border-l-2 border-ink/45 px-5 pb-5 pt-1"
                >
                  <h3 className="font-mono text-[0.86rem] font-black uppercase tracking-[0.14em] text-fire">
                    {license.category}
                  </h3>
                  {license.items.length > 0 ? (
                    <ul className="mt-3 space-y-1 text-[0.82rem] font-bold leading-5 text-ink/58">
                      {license.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : null}
                  <p className="mt-4 text-[0.96rem] font-black leading-5 text-ink/78">
                    {license.statement}
                  </p>
                  <p className="mt-2 text-[0.82rem] font-bold leading-5 text-ink/62">
                    {license.note}
                  </p>
                  {license.url ? (
                    <a
                      href={license.url}
                      className="mt-3 inline-block border-b border-ink/40 font-mono text-[0.86rem] font-black uppercase tracking-[0.14em] text-ink/64 transition hover:border-fire hover:text-fire"
                      rel="noreferrer"
                      target="_blank"
                    >
                      license link
                    </a>
                  ) : null}
                </article>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
