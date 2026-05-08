import { AboutSectionNav } from "@/components/AboutSectionNav";
import { ConstraintGrid } from "@/components/ConstraintGrid";
import { GridRuler } from "@/components/GridRuler";
import { MethodDiagram } from "@/components/MethodDiagram";
import { Nav } from "@/components/Nav";

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
  { word: "forever", status: "complete", color: "#F06B04" },
  { word: "depression", status: "complete", color: "#1570AC" },
  { word: "privacy", status: "planned", color: "#050510" },
  { word: "data", status: "planned", color: "#050510" },
  { word: "artificial", status: "planned", color: "#050510" },
  { word: "intelligence", status: "planned", color: "#050510" },
];

const dataSources = [
  {
    source: "Google Books Ngram Viewer",
    use: "Frequency time series",
    coverage: "English corpus, 1500-2022; smoothing 0",
    access: "Public JSON API",
    license: "Creative Commons Attribution 3.0",
  },
  {
    source: "Project Gutenberg",
    use: "Context snippets, collocates, phrases",
    coverage: "Public-domain books, 1726-1930",
    access: "Public text API",
    license: "Project Gutenberg License; public-domain content",
  },
  {
    source: "Wikinews (EN)",
    use: "Modern context snapshots",
    coverage: "2024-2026 news snippets",
    access: "MediaWiki API",
    license: "Creative Commons Attribution 2.5",
  },
  {
    source: "Online Etymology Dictionary",
    use: "Historical form tracing",
    coverage: "Middle English through 14c.",
    access: "Manual review; secondary citation",
    license: "Copyright Douglas Harper; cited only",
  },
  {
    source: "Wiktionary",
    use: "Word variants and historical spellings",
    coverage: "Multilingual, from 14c.",
    access: "Manual review; secondary citation",
    license: "Creative Commons Attribution-ShareAlike",
  },
];

const roleColors: Record<string, string> = {
  "Frequency time series": "#F06B04",
  "Context snippets, collocates, phrases": "#1570AC",
  "Modern context snapshots": "#2C9FC7",
  "Historical form tracing": "#050510",
  "Word variants and historical spellings": "#050510",
};

const calculationMethods = [
  {
    title: "Frequency Normalization",
    body: "All frequency values come from the Google Books Ngram API and are expressed as occurrences per million words. Raw values are not smoothed; smoothing is set to 0.",
  },
  {
    title: "Display Scale Transformation",
    body: "To reduce the visual masking caused by high-frequency years, the frequency axis uses a square-root display transform: displayValue = sqrt(frequencyPerMillion). This common nonlinear compression keeps trend direction visible while reducing the visual weight of extreme values.",
  },
  {
    title: "Category Classification",
    body: "The six semantic categories (Eternity/Religion, Romance/Vow, Permanence/Duration, Memory/Remembrance, Hyperbole/Colloquial, Digital Permanence) are assigned through keyword heuristics. Classification depends on whether a target phrase appears in a curated phrase list and whether collocates overlap with a category keyword list. This is a curated interpretive layer, not an automatic semantic classifier.",
  },
  {
    title: "Pre-1700 Data Handling",
    body: "Ngram data before 1700 has known OCR noise, spelling normalization errors, and metadata quality issues. The joined form forever is marked unreliable in this interval and shown as a shaded region rather than a main-line signal. The spaced form for ever is available in this interval but should be read cautiously.",
  },
  {
    title: "Era Segmentation",
    body: "Eight eras are manually defined around Gutenberg coverage density and Ngram signal quality: 1700-1799 (sparse Gutenberg coverage), 1800-1849, 1850-1899 (strongest Gutenberg coverage), 1900-1949 (limited public-domain text), 1950-1999 and 2000-2019 (Ngram only, no Gutenberg snippets), and recent (2020-2022).",
  },
  {
    title: "Stopword Filtering",
    body: "Collocate extraction filters a standard English stopword list and also removes the forms ever, forever, would, shall, could, should, said, now, yet, still, upon, one, two, thing, and things.",
  },
];

const archiveClaims = [
  "That the recorded frequency of a word in a corpus changes over time",
  "That those changes correlate with documentable cultural contexts",
  "That text snippets provide auditable evidence of contextual usage",
  "That category assignments are interpretive, not classificatory",
];

const archiveLimits = [
  "That frequency equals cultural importance or literary quality",
  "That a Gutenberg seed corpus of 48 texts from 1726-1930 represents all historical English usage",
  "That modern Wikinews snippets are comparable in scale or register to historical text evidence",
  "That semantic categories are stable, mutually exclusive, or exhaustive",
  "That the absence of evidence is evidence of absence",
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
      "The Ulm model treated design as an epistemological practice: structure makes claims, not just appearances. The ConstraintGrid and RelationalConstellation are design research artifacts; they argue through their structure that evidence should be shown as a relational system.",
    color: "#036C17",
  },
];

const evidenceColumns = [
  { label: "Frequency", sub: "corpus signal", color: "#F06B04", filled: true },
  { label: "Attestation", sub: "lexical proof", color: "#F06B04", filled: true },
  { label: "Variant", sub: "form policy", color: "#1570AC", filled: true },
  { label: "Context", sub: "snippet evidence", color: "#1570AC", filled: true },
  { label: "Confidence", sub: "partially filled", color: "#050510", filled: false },
  { label: "Source", sub: "pending", color: "#050510", filled: false, dashed: true },
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
    category: "Original editorial content",
    items: [
      "Word selection and curation",
      "Category definitions and heuristics",
      "Interpretive annotations",
      "Pressure anchor narratives",
      "Methodology text and interface design",
    ],
    statement: "© 2026 Words Over Time. All rights reserved.",
    note: "Not licensed for reproduction without permission.",
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
    items: ["Project Gutenberg public-domain texts (1726-1930)"],
    statement: "Sourced from Project Gutenberg (gutenberg.org).",
    note: "Texts are in the public domain in the United States. Rights status outside the US may vary by jurisdiction.",
    url: "https://www.gutenberg.org/policy/license.html",
  },
  {
    category: "Modern context snippets",
    items: ["Wikinews English edition (2024-2026)"],
    statement: "Sourced from Wikinews via MediaWiki API.",
    note: "Used under Creative Commons Attribution 2.5 Generic.",
    url: "https://creativecommons.org/licenses/by/2.5/",
  },
  {
    category: "Lexical and etymological references",
    items: ["Online Etymology Dictionary", "Wiktionary"],
    statement: "Used as secondary reference only; not reproduced in full.",
    note: "Etymonline © Douglas Harper. Wiktionary content under CC BY-SA.",
  },
  {
    category: "Privacy and data",
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
      <p className="-mt-1 font-mono text-[0.72rem] font-black uppercase tracking-[0.22em] text-fire">
        {kicker}
      </p>
      <h2 className="mt-3 text-[clamp(1.6rem,2.4vw,2.6rem)] font-black leading-[0.96]">
        {title}
      </h2>
      {desc ? (
        <p className="mt-4 text-[0.82rem] font-bold leading-5 text-ink/52">
          {desc}
        </p>
      ) : null}
    </header>
  );
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-wheat text-ink">
      <AboutSectionNav />
      <div className="flex w-full flex-col gap-8 px-5 py-5 sm:px-10 sm:py-7 lg:gap-12 lg:pl-20 lg:pr-16 xl:pl-24 xl:pr-20">
        <Nav />
        <GridRuler />

        <section
          id="project-statement"
          className="scroll-mt-20 grid gap-8 border-y-2 border-ink py-8 lg:grid-cols-[16rem_1fr] lg:gap-16"
        >
          <header>
            <p className="font-mono text-xs font-black uppercase tracking-[0.22em] text-fire">
              00 / project statement
            </p>
            <h1 className="mt-4 text-[clamp(2.7rem,5vw,6rem)] font-black leading-[0.9] tracking-normal">
              Words Over Time
            </h1>
          </header>
          <div className="max-w-4xl">
            <p className="text-[clamp(1.45rem,2.6vw,2.8rem)] font-black leading-[0.98]">
              is a curated editorial archive,
              <br />
              not a search engine.
            </p>
            <div className="mt-8 grid gap-5 text-sm font-bold leading-6 text-ink/70 md:grid-cols-2">
              <p>
                Each entry begins with a word selected for its cultural weight:
                a word that has shifted meaning, accumulated associations, or
                traveled across registers over centuries. The archive traces
                that word through corpus frequency, lexical attestation,
                scanned evidence, and interpretive annotation, presenting them
                as distinct layers rather than a single authoritative answer.
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
            <p className="mt-7 border-t border-ink/22 pt-4 font-mono text-[0.74rem] font-black uppercase leading-5 tracking-[0.14em] text-ink/70">
              Intended audience: researchers, writers, educators, and anyone
              curious about how language carries history.
            </p>
          </div>
        </section>

        <section
          id="methodology"
          className="scroll-mt-20 border-y-2 border-ink py-4"
        >
          <div className="grid gap-4 lg:grid-cols-[0.48fr_0.74fr_0.78fr] lg:items-stretch">
            <header className="border-b-2 border-ink pb-4 lg:border-b-0 lg:border-r-2 lg:pb-0 lg:pr-5">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-fire">
                01 / methodology
              </p>
              <h1 className="mt-4 text-[clamp(2.8rem,4.5vw,4.8rem)] font-black leading-[0.9] tracking-normal">
                methodology
              </h1>
              <p className="mt-5 max-w-md text-base font-bold leading-6 text-ink/72">
                A selected-word archive for historical frequency, attestation,
                scanned evidence, and interpretation.
              </p>
            </header>

            <div className="grid gap-4">
              <MethodDiagram />
            </div>

            <aside className="border-t border-ink/30 pt-5 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
              <p className="font-mono text-xs font-black uppercase tracking-[0.22em] text-fire">
                word index
              </p>
              <div className="mt-4 flex flex-col gap-2">
                {wordIndex.map(({ word, status, color }) => (
                  <div
                    key={word}
                    className="flex items-center justify-between gap-4"
                  >
                    <span
                      className="font-mono text-sm font-black uppercase"
                      style={{ color }}
                    >
                      {word}
                    </span>
                    <span
                      className={`font-mono text-[0.65rem] font-black uppercase tracking-[0.14em] ${
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
              <p className="mb-3 font-mono text-[0.72rem] font-black uppercase tracking-[0.16em] text-fire">
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
                      className="font-mono text-[0.6rem] font-black uppercase tracking-[0.14em]"
                      style={{
                        color: col.filled ? col.color : "rgba(5,5,16,0.3)",
                      }}
                    >
                      {col.label}
                    </p>
                    <p className="mt-1 font-mono text-[0.58rem] font-bold leading-4 text-ink/40">
                      {col.sub}
                    </p>
                  </div>
                ))}
              </div>
              <p className="mt-2 font-mono text-[0.62rem] font-bold leading-4 text-ink/38">
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
                    className="font-mono text-[0.65rem] font-black uppercase tracking-[0.13em]"
                    style={{ color: ref.color }}
                  >
                    {ref.author}
                  </p>
                  <p className="mt-0.5 font-mono text-[0.58rem] font-bold text-ink/32">
                    {ref.years}
                  </p>

                  <p className="mt-3 font-mono text-[0.62rem] font-black uppercase leading-4 tracking-[0.1em] text-ink/55">
                    {ref.work}
                  </p>
                  <p className="font-mono text-[0.58rem] font-bold text-ink/30">
                    {ref.year}
                  </p>

                  <p className="mt-3 border-t border-ink/12 pt-3 text-[0.78rem] font-bold leading-[1.5] text-ink/55">
                    {ref.relevance}
                  </p>
                </article>
              ))}
            </div>

            <div className="border-t border-ink/18 pt-5">
              <p className="max-w-3xl text-sm font-bold leading-6 text-ink/58">
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
                  <p className="font-mono text-[0.6rem] font-black uppercase tracking-[0.16em] text-ink/40">
                    {item.number} / source
                  </p>
                  <p className={`font-mono text-[0.62rem] font-black uppercase tracking-[0.1em]
                                 text-ink/55 transition duration-200 ${item.text}`}>
                    {item.source}
                  </p>
                </div>

                {/* Output content */}
                <div className="flex flex-1 flex-col px-4 pb-5 pt-4">
                  <p className={`font-mono text-[0.65rem] font-black uppercase tracking-[0.16em]
                                 text-fire transition duration-200 ${item.text}`}>
                    output / {item.title}
                  </p>
                  <h3 className="mt-2 text-[clamp(1.15rem,1.6vw,1.5rem)] font-black leading-[1.02]">
                    {item.output}
                  </h3>
                  <p className="mt-3 text-[0.82rem] font-bold leading-[1.55] text-ink/65">
                    {item.body}
                  </p>
                  <p className="mt-4 border-t border-ink/12 pt-3 text-[0.74rem] font-bold
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
              <thead className="font-mono text-[0.65rem] uppercase tracking-[0.14em] text-fire">
                <tr className="border-b border-ink/30">
                  <th className="px-4 py-2.5">Source</th>
                  <th className="px-4 py-2.5">Role</th>
                  <th className="px-4 py-2.5">Coverage</th>
                  <th className="px-4 py-2.5">License</th>
                </tr>
              </thead>
              <tbody className="text-[0.8rem] font-bold leading-5 text-ink/68">
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
                                     text-[0.58rem] font-black uppercase tracking-[0.09em]"
                          style={{ color: roleColor, border: `1px solid ${roleColor}` }}
                        >
                          {source.use}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-[0.72rem] text-ink/60">
                        {source.coverage}
                      </td>
                      <td className="px-4 py-3 text-[0.76rem] text-ink/48">
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
                  <p className="font-mono text-[0.66rem] font-black uppercase leading-[1.4] tracking-[0.13em] text-fire">
                    {method.title}
                  </p>
                </div>
                <div className="px-5 py-3.5">
                  <p className="text-[0.8rem] font-bold leading-[1.55] text-ink/60">
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
          <div className="grid gap-5 md:grid-cols-2">
            <article className="flex flex-col border border-sail/60">
              <header className="border-b border-sail/30 bg-sail/[0.08] px-5 py-3">
                <p className="font-mono text-[0.72rem] font-black uppercase tracking-[0.16em] text-sail">
                  Yes / what this archive claims
                </p>
              </header>
              <ul className="flex flex-1 flex-col divide-y divide-ink/10 px-5 py-2">
                {archiveClaims.map((claim) => (
                  <li key={claim} className="flex items-baseline gap-3 py-3">
                    <span className="mt-[2px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-sail" />
                    <span className="text-sm font-bold leading-6 text-ink/72">
                      {claim}
                    </span>
                  </li>
                ))}
              </ul>
            </article>

            <article className="flex flex-col border border-wine/50">
              <header className="border-b border-wine/25 bg-wine/[0.06] px-5 py-3">
                <p className="font-mono text-[0.72rem] font-black uppercase tracking-[0.16em] text-wine">
                  No / what this archive does not claim
                </p>
              </header>
              <ul className="flex flex-1 flex-col divide-y divide-ink/10 px-5 py-2">
                {archiveLimits.map((limit) => (
                  <li key={limit} className="flex items-baseline gap-3 py-3">
                    <span className="font-mono text-[0.72rem] font-black text-wine/60">
                      -
                    </span>
                    <span className="text-sm font-bold leading-6 text-ink/62">
                      {limit}
                    </span>
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </section>

        <section id="constraint-grid" className="scroll-mt-20">
          <div className="mb-8 grid gap-6 border-t-2 border-ink pt-10 lg:grid-cols-[16rem_1fr]">
            <AboutSectionHeader
              num="07"
              kicker="audit grid"
              title="Claim, module & risk"
            />
            <div className="max-w-3xl">
              <p className="text-sm font-bold leading-6 text-ink/68">
                The grid maps three types of element:{" "}
                <strong>claim columns</strong> (left three) describe what kind
                of statement is being made about a word;{" "}
                <strong>module columns</strong> (right three) describe the
                planned analysis instrument; <strong>risk rows</strong> (bottom)
                list the uncertainty categories that attach to each route.
              </p>
              <p className="mt-3 text-sm font-bold leading-6 text-ink/58">
                Hover or click a module to expose the audit route. The colored
                lines show which claim language and which risks attach to that
                particular instrument. No line is drawn until you select a
                module, because the relationships only matter in context.
              </p>
            </div>
          </div>
          <ConstraintGrid />
        </section>

        <section
          id="open-source"
          className="scroll-mt-20 grid gap-8 border-t-2 border-ink pt-10 lg:grid-cols-[16rem_1fr] lg:gap-16"
        >
          <AboutSectionHeader
            num="08"
            kicker="open source"
            title="Code & data"
            desc="The data pipeline and all visualization components are publicly available."
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
                  <p className="font-mono text-[0.72rem] font-black uppercase tracking-[0.14em] text-fire">
                    github / dpan538
                  </p>
                  <p className="mt-1 text-sm font-black text-ink">
                    Words-Over-Time
                  </p>
                  <p className="mt-1 font-mono text-[0.68rem] font-bold text-ink/48">
                    Public repository / Data pipeline / All components
                  </p>
                </div>
                <span className="font-mono text-[0.72rem] font-black uppercase tracking-[0.1em] text-ink/30 transition group-hover:text-ink/60">
                  -&gt;
                </span>
              </div>
            </a>

            <div className="grid gap-4 sm:grid-cols-2">
              <article className="border-l-2 border-ink/40 px-5 py-3">
                <p className="font-mono text-[0.68rem] font-black uppercase tracking-[0.14em] text-ink/50">
                  What is open
                </p>
                <ul className="mt-3 space-y-2 text-sm font-bold leading-5 text-ink/68">
                  {openItems.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="text-sail">+</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </article>
              <article className="border-l-2 border-ink/20 px-5 py-3">
                <p className="font-mono text-[0.68rem] font-black uppercase tracking-[0.14em] text-ink/40">
                  What is curated (not generic)
                </p>
                <ul className="mt-3 space-y-2 text-sm font-bold leading-5 text-ink/52">
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
              <p className="font-mono text-[0.68rem] font-black uppercase tracking-[0.14em] text-fire">
                citation note
              </p>
              <p className="mt-2 text-sm font-bold leading-6 text-ink/64">
                If you use data or code from this project in research, please
                cite both the original data sources (Google Books Ngram, Project
                Gutenberg, Wikinews) and this archive. The pipeline scripts are
                designed to be inspectable and reproducible.
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
                  <h3 className="font-mono text-[0.78rem] font-black uppercase tracking-[0.14em] text-fire">
                    {license.category}
                  </h3>
                  {license.items.length > 0 ? (
                    <ul className="mt-3 space-y-1 text-xs font-bold leading-5 text-ink/58">
                      {license.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : null}
                  <p className="mt-4 text-sm font-black leading-5 text-ink/78">
                    {license.statement}
                  </p>
                  <p className="mt-2 text-xs font-bold leading-5 text-ink/62">
                    {license.note}
                  </p>
                  {license.url ? (
                    <a
                      href={license.url}
                      className="mt-3 inline-block border-b border-ink/40 font-mono text-[0.66rem] font-black uppercase tracking-[0.14em] text-ink/64 transition hover:border-fire hover:text-fire"
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
