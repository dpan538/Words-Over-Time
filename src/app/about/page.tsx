import { ConstraintGrid } from "@/components/ConstraintGrid";
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

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-wheat text-ink">
      <div className="flex w-full flex-col gap-14 px-5 py-5 sm:px-10 sm:py-7 lg:gap-20 lg:px-16 xl:px-20">
        <Nav />

        <section className="border-y-2 border-ink py-4">
          <div className="grid gap-4 lg:grid-cols-[0.48fr_0.74fr_0.78fr] lg:items-stretch">
            <header className="border-b-2 border-ink pb-4 lg:border-b-0 lg:border-r-2 lg:pb-0 lg:pr-5">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-fire">
                about / methodology
              </p>
              <h1 className="mt-4 text-[clamp(2.8rem,4.5vw,4.8rem)] font-black leading-[0.9] tracking-normal">
                methodology
              </h1>
              <p className="mt-5 max-w-md text-base font-bold leading-6 text-ink/72">
                A selected-word archive for historical frequency, attestation,
                scanned evidence, and interpretation.
              </p>
            </header>

            <MethodDiagram />
          </div>
        </section>

        <div className="relative flex flex-col gap-3 lg:gap-4">
          <section className="grid gap-10 py-2 lg:grid-cols-[16rem_1fr] lg:gap-16">
            <header className="max-w-md">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-fire">
                hybrid model
              </p>
              <h2 className="mt-4 text-[clamp(2rem,3vw,3.4rem)] font-black leading-[0.96]">
                layered evidence
              </h2>
              <p className="mt-5 text-sm font-bold leading-6 text-ink/68">
                Two information layers share one structure. The source layer stays
                readable at rest; hover gently brings the output layer forward.
              </p>
              <p className="mt-8 text-[0.82rem] font-bold leading-5 text-ink/66">
                The grid stays fixed. Hover or click a module to reveal a second
                information system: colored relationship lines between the module,
                its claim label, and its uncertainty constraints.
              </p>
              <div className="mt-8 space-y-3 font-mono text-[0.72rem] font-bold uppercase leading-5 tracking-[0.14em] text-ink/68">
                <p>base: six column archive grid</p>
                <p>interaction: relation overlay</p>
              </div>
            </header>

            <div className="relative min-h-[610px]">
              <div className="absolute left-0 top-10 hidden h-px w-full bg-ink/30 lg:block" />
              <div className="absolute bottom-16 left-[8%] right-[6%] hidden h-px bg-ink/22 lg:block" />
              <div className="absolute right-[6%] top-6 h-20 w-20 rounded-full border border-dotted border-ink/35" />
              <div className="absolute bottom-12 left-[34%] h-24 w-24 bg-nice/10 mix-blend-multiply" />
              <div className="absolute right-[30%] top-[38%] h-16 w-32 bg-sun/15 mix-blend-multiply" />

              <div className="relative z-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                {evidenceFlow.map((item) => (
                  <article
                    key={item.number}
                    className={`group/evidence relative min-h-[500px] border-l-2 border-ink/55 px-5 pb-5 pt-2 transition duration-200 ${item.border}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`h-4 w-4 border border-ink ${item.accent}`} />
                      <p className={`font-mono text-xs font-black transition duration-200 ${item.text}`}>
                        {item.number}
                      </p>
                    </div>
                    <p className="mt-8 font-mono text-sm uppercase leading-6 tracking-[0.12em] text-ink/76">
                      {item.source}
                    </p>
                    <div className="my-8 h-24 border-l border-dashed border-ink/28 transition duration-200 group-hover/evidence:border-current" />
                    <p className={`font-mono text-[0.72rem] font-black uppercase tracking-[0.16em] text-fire transition duration-200 ${item.text}`}>
                      output / {item.title}
                    </p>
                    <h3 className="mt-3 text-[clamp(1.4rem,2vw,2rem)] font-black leading-[0.98]">
                      {item.output}
                    </h3>
                    <p className="mt-4 text-sm font-bold leading-6 text-ink/72">
                      {item.body}
                    </p>
                    <p className="mt-5 border-t border-ink/18 pt-4 text-xs font-bold leading-5 text-ink/62 transition duration-200 group-hover/evidence:text-ink/78">
                      {item.constraint}
                    </p>
                    <p className="mt-4 font-mono text-[0.66rem] uppercase leading-5 tracking-[0.13em] text-ink/58 transition duration-200 group-hover/evidence:text-ink/76">
                      {item.claim}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <div className="hidden grid-cols-[16rem_1fr] gap-16 lg:grid">
            <div />
            <div className="grid h-20 grid-cols-6">
              <span className="col-start-1 border-l border-dashed border-ink/40" />
              <span className="col-start-2 border-l border-dashed border-blaze/35" />
              <span className="col-start-3 border-l border-dashed border-sun/40" />
              <span className="col-start-4 border-l border-dashed border-nice/50" />
              <span className="col-start-5 border-l border-dashed border-blaze/45" />
              <span className="col-start-6 border-l border-dashed border-sail/45" />
            </div>
          </div>

          <ConstraintGrid />
        </div>

        <footer className="grid gap-5 border-t-2 border-ink py-6 text-[0.78rem] font-bold leading-5 text-ink/68 md:grid-cols-[0.35fr_0.65fr]">
          <p className="font-mono uppercase tracking-[0.14em]">
            © 2026 Words Over Time
          </p>
          <p>
            All rights reserved. This MVP does not use accounts, authentication,
            or a user-tracking database. Public historical snippets, source
            rights, and licensing limits will be reviewed before any final
            research publication.
          </p>
        </footer>
      </div>
    </main>
  );
}
