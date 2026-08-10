import Link from "next/link";
import { Nav } from "@/components/Nav";

const designLineage = [
  {
    name: "Josef Müller-Brockmann",
    work: "Grid Systems in Graphic Design",
    year: "1961",
    role: "The modular grid makes structure repeatable and lets absent evidence remain visible instead of being filled for symmetry.",
    color: "#F06B04",
  },
  {
    name: "Karl Gerstner",
    work: "Designing Programmes",
    year: "1964",
    role: "Colour and layout behave as rules: route identity can vary, while evidence roles keep their established meanings.",
    color: "#1570AC",
  },
  {
    name: "Emil Ruder",
    work: "Typographie",
    year: "1967",
    role: "Helvetica Neue carries information without performing a separate literary, historical, or technical personality.",
    color: "#A1081F",
  },
  {
    name: "HfG Ulm",
    work: "Hochschule für Gestaltung",
    year: "1953–1968",
    role: "Design is an epistemological practice: the order of evidence and interpretation forms a claim that must be inspectable.",
    color: "#036C17",
  },
] as const;

const evidenceFlow = [
  ["01", "Corpus frequency", "A source-specific visibility signal; never an earliest-use claim."],
  ["02", "Lexical attestation", "Dictionary and cited lexical leads kept separate from frequency."],
  ["03", "Scanned evidence", "Inspectable page or public-domain context with OCR and rights limits attached."],
  ["04", "Annotation", "Authored grouping, variant policy, uncertainty, and interpretation named as such."],
] as const;

const evidenceDimensions = [
  ["01 Signal", "source-specific frequency or visibility"],
  ["02 Attestation", "lexical, dictionary, or cited page evidence"],
  ["03 Variant", "forms, phrases, compounds, and aggregation policy"],
  ["04 Context", "snippets, metadata, historical and domain setting"],
  ["05 Boundary", "uncertainty, confidence, and explicit claim limit"],
  ["06 Rights", "source URL, attribution, and reuse status"],
] as const;

const sourceLedger = [
  ["Google Books Ngram", "printed-book frequency through 2022", "source terms + attribution"],
  ["Project Gutenberg", "selected public-domain context texts", "item and jurisdiction checks"],
  ["Library of Congress", "newspaper metadata, OCR, page evidence", "item-level rights vary"],
  ["Wikimedia / Wikinews", "modern open context and metadata", "applicable CC licence"],
  ["Lexical references", "attestation and sense-history checks", "entries cited, not reproduced"],
  ["Policy / legal / clinical sources", "domain anchors and source audits", "source-specific rights"],
] as const;

const methodLedger = [
  ["Source capture", "Source-specific scripts and curated records preserve provenance."],
  ["Frequency normalization", "Terms compare only inside compatible source families and denominators."],
  ["Display transformation", "Square-root, indexed, or ranked views are labelled as display devices."],
  ["Variant policy", "Forms are merged or separated only through an explicit editorial decision."],
  ["Semantic grouping", "Categories are interpretive maps backed by visible rules and evidence."],
  ["Confidence labels", "Sparse data, OCR, rights, and source limits stay attached to claims."],
] as const;

function SectionLabel({ number, label }: { number: string; label: string }) {
  return (
    <p className="font-mono text-[0.66rem] font-semibold uppercase tracking-[0.12em] text-fire">
      {number} / {label}
    </p>
  );
}

export function MobileAboutEditorial() {
  return (
    <div className="mx-auto max-w-[42rem] px-5 pb-16 pt-5">
      <Nav />

      <header className="pb-16 pt-14">
        <SectionLabel number="01" label="project / authorship" />
        <h1 className="mt-4 text-[clamp(3.65rem,17vw,5.4rem)] font-black leading-[0.78] tracking-[-0.045em]">
          Words
          <span className="block text-fire">Over Time</span>
        </h1>
        <p className="mt-8 max-w-xl text-[1.08rem] font-medium leading-[1.55]">
          A source-led archive for historical word frequency, lexical attestation, form variation, semantic grouping, and interpretive annotation. It is not a simplified dictionary: provenance, uncertainty, rights, and claim limits remain part of the reading.
        </p>
        <p className="mt-5 font-mono text-[0.68rem] font-semibold uppercase leading-5 tracking-[0.08em] text-ink/68">
          Research / data / writing / design by Dai Pan / 潘岱
        </p>
      </header>

      <section className="border-t border-ink/70 py-14" aria-labelledby="mobile-about-lineage">
        <SectionLabel number="02" label="design lineage + visual programme" />
        <h2 id="mobile-about-lineage" className="mt-3 text-[1.9rem] font-bold leading-[1.02]">
          Structure is part of the argument.
        </h2>
        <div className="mt-9">
          {designLineage.map((reference, index) => (
            <article key={reference.name} className={`grid grid-cols-6 gap-x-3 py-5 ${index > 0 ? "border-t border-ink/16" : ""}`}>
              <div className="col-span-2">
                <span className="block h-[3px] w-7" style={{ backgroundColor: reference.color }} />
                <h3 className="mt-3 text-[0.8rem] font-semibold leading-4" style={{ color: reference.color }}>
                  {reference.name}
                </h3>
              </div>
              <div className="col-span-4">
                <p className="font-mono text-[0.65rem] font-semibold uppercase leading-4 tracking-[0.05em]">
                  {reference.work} / {reference.year}
                </p>
                <p className="mt-2 text-[0.82rem] font-medium leading-5 text-ink/76">{reference.role}</p>
              </div>
            </article>
          ))}
        </div>
        <p className="mt-8 max-w-xl text-[1rem] font-medium leading-[1.6]">
          The project does not reproduce Swiss design as a historical style. It applies the principle that design structure makes claims, and those claims should be auditable.
        </p>
      </section>

      <section className="border-t border-ink/70 py-14" aria-labelledby="mobile-about-method">
        <SectionLabel number="03" label="method + evidence flow" />
        <h2 id="mobile-about-method" className="mt-3 text-[1.9rem] font-bold leading-[1.02]">
          Sources remain distinct at rest.
        </h2>
        <p className="mt-5 text-[0.96rem] font-medium leading-[1.6] text-ink/78">
          Frequency, first attestation, scanned occurrence, and interpretation do different work. The mobile edition places each source label beside its output so the transition from evidence to claim remains readable without hover.
        </p>
        <ol className="mt-8">
          {evidenceFlow.map(([number, title, body], index) => (
            <li key={number} className={`grid grid-cols-6 gap-x-3 py-4 ${index > 0 ? "border-t border-ink/14" : ""}`}>
              <span className="col-span-1 font-mono text-[0.64rem] font-semibold text-nice">{number}</span>
              <div className="col-span-5">
                <h3 className="text-[0.9rem] font-semibold leading-5">{title}</h3>
                <p className="mt-1 text-[0.8rem] font-medium leading-5 text-ink/70">{body}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-9">
          <p className="font-mono text-[0.64rem] font-semibold uppercase tracking-[0.1em] text-ink/64">six evidence dimensions</p>
          <dl className="mt-4 grid grid-cols-2 gap-x-5 gap-y-5">
            {evidenceDimensions.map(([term, description]) => (
              <div key={term}>
                <dt className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.05em]">{term}</dt>
                <dd className="mt-1 text-[0.75rem] font-medium leading-4 text-ink/68">{description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="border-t border-ink/70 py-14" aria-labelledby="mobile-about-boundaries">
        <SectionLabel number="04" label="claim boundaries" />
        <h2 id="mobile-about-boundaries" className="mt-3 text-[1.9rem] font-bold leading-[1.02]">
          A visible signal is not a universal meaning.
        </h2>
        <p className="mt-5 text-[0.96rem] font-medium leading-[1.6] text-ink/78">
          The archive can report visibility inside a named corpus, cite an attestation, or disclose how evidence was grouped. It cannot turn those bounded observations into claims about all English, every community, cultural importance, causation, or an exact first use.
        </p>
        <div className="mt-8 grid grid-cols-2 gap-5">
          <div>
            <p className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.08em] text-sail">can support</p>
            <p className="mt-2 text-[0.78rem] font-medium leading-5 text-ink/72">corpus visibility / cited lexical leads / disclosed semantic grouping / reproducible transformations</p>
          </div>
          <div>
            <p className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.08em] text-wine">cannot support</p>
            <p className="mt-2 text-[0.78rem] font-medium leading-5 text-ink/72">universal definition / first-use certainty / cultural value / absence outside current coverage</p>
          </div>
        </div>
      </section>

      <section className="border-t border-ink/70 pt-14" aria-labelledby="mobile-about-rights">
        <SectionLabel number="05" label="sources / rights / citation" />
        <h2 id="mobile-about-rights" className="mt-3 text-[1.9rem] font-bold leading-[1.02]">
          Cite the archive and its upstream sources.
        </h2>
        <p className="mt-5 text-[0.96rem] font-medium leading-[1.6] text-ink/78">
          Source URLs, coverage, transforms, attribution, and publication status remain part of each study. The project DOI identifies the archive as a whole; it is not assigned to every route as a separate dataset identifier.
        </p>
        <p className="mt-5 font-mono text-[0.68rem] font-semibold leading-5 text-ink/70">
          Pan, Dai. “Words Over Time.” 2026. https://www.wordsovertime.com/. DOI: 10.5281/zenodo.20437678.
        </p>
        <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-[0.76rem] font-semibold uppercase tracking-[0.06em]">
          <a href="https://doi.org/10.5281/zenodo.20437678" target="_blank" rel="noreferrer" className="border-b border-ink/55 pb-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">Project DOI</a>
          <a href="https://github.com/dpan538/Words-Over-Time" target="_blank" rel="noreferrer" className="border-b border-ink/55 pb-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">Public repository</a>
          <Link href="/words" className="border-b border-ink/55 pb-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">Word index</Link>
        </div>

        <div className="mt-10 border-t border-ink/18">
          <details>
            <summary className="min-h-11 cursor-pointer py-4 font-mono text-[0.66rem] font-semibold uppercase tracking-[0.08em] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">Full method register</summary>
            <dl className="space-y-4 pb-5">
              {methodLedger.map(([term, description]) => (
                <div key={term}>
                  <dt className="text-[0.8rem] font-semibold">{term}</dt>
                  <dd className="mt-1 text-[0.76rem] font-medium leading-5 text-ink/70">{description}</dd>
                </div>
              ))}
            </dl>
          </details>
          <details className="border-t border-ink/14">
            <summary className="min-h-11 cursor-pointer py-4 font-mono text-[0.66rem] font-semibold uppercase tracking-[0.08em] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">Source ledger</summary>
            <dl className="space-y-4 pb-5">
              {sourceLedger.map(([source, role, rights]) => (
                <div key={source}>
                  <dt className="text-[0.8rem] font-semibold">{source}</dt>
                  <dd className="mt-1 text-[0.76rem] font-medium leading-5 text-ink/70">{role} / {rights}</dd>
                </div>
              ))}
            </dl>
          </details>
          <details className="border-y border-ink/14">
            <summary className="min-h-11 cursor-pointer py-4 font-mono text-[0.66rem] font-semibold uppercase tracking-[0.08em] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">Licensing boundary</summary>
            <div className="space-y-3 pb-5 text-[0.76rem] font-medium leading-5 text-ink/72">
              <p>Application code is released under MIT. That grant does not cover research writing, curated datasets, semantic classifications, page compositions, visual identity, or authorship marks.</p>
              <p>Original research and design are © 2026 Dai Pan / 潘岱. Non-commercial citation and study are permitted with attribution; third-party source material keeps its own rights status.</p>
              <p>Short excerpts and page pointers are used only where publication rights permit. Restricted or subscription material remains a citation target rather than a downloadable dataset.</p>
            </div>
          </details>
        </div>
      </section>
    </div>
  );
}
