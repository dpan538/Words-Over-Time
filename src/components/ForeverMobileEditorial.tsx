import Link from "next/link";
import { ForeverAttestationHinge } from "@/components/ForeverAttestationHinge";
import { ForeverFormCurrent } from "@/components/ForeverFormCurrent";
import { ForeverRecurrenceField } from "@/components/ForeverRecurrenceField";
import type { ForeverGeneratedDataset } from "@/types/foreverRealData";

type ForeverMobileEditorialProps = {
  dataset: ForeverGeneratedDataset;
};

export function ForeverMobileEditorial({ dataset }: ForeverMobileEditorialProps) {
  return (
    <div className="bg-paper-mobile text-ink min-[960px]:hidden">
      <div className="mx-auto max-w-[42rem] overflow-hidden">
        <ForeverFormCurrent series={dataset.frequency} />
        <ForeverAttestationHinge prehistory={dataset.prehistory} />
        <ForeverRecurrenceField
          phrases={dataset.phrases}
          modernContext={dataset.modernContext}
          coverage={dataset.coverage}
        />

        <section id="evidence-archive" className="scroll-mt-6 px-5 pb-16 text-ink" aria-labelledby="forever-evidence-boundary-title">
          <p className="font-mono text-[0.8125rem] font-semibold uppercase leading-5 tracking-[0.04em] text-fire">
            evidence / boundary
          </p>
          <h2 id="forever-evidence-boundary-title" className="mt-4 max-w-[22rem] text-[2rem] font-semibold leading-[1.02] tracking-[-0.02em]">
            The layers touch. Their scales do not.
          </h2>
          <div className="mt-10 grid grid-cols-6 gap-x-3 gap-y-9">
            <div className="col-span-5 col-start-2">
              <p className="font-mono text-[0.8125rem] font-semibold uppercase leading-5 tracking-[0.04em] text-fire">01 signal</p>
              <p className="mt-3 text-[1.0625rem] font-normal leading-[1.55]">Google Books Ngram supplies yearly printed-frequency visibility from 1500–2022; public emphasis begins at 1700.</p>
            </div>
            <div className="col-span-5">
              <p className="font-mono text-[0.8125rem] font-semibold uppercase leading-5 tracking-[0.04em] text-nice">02 attestation + variant</p>
              <p className="mt-3 text-[1.0625rem] font-normal leading-[1.55]">Secondary lexical leads keep spaced, joined, emphatic, and conflicting forms separate. They are not project-owned earliest quotations.</p>
            </div>
            <div className="col-span-5 col-start-2">
              <p className="font-mono text-[0.8125rem] font-semibold uppercase leading-5 tracking-[0.04em] text-sail">03 context</p>
              <p className="mt-3 text-[1.0625rem] font-normal leading-[1.55]">Selected Project Gutenberg evidence ends in 1930. The 2024–2026 Wikinews revision layer is a separate open-news snapshot.</p>
            </div>
            <div className="col-span-6">
              <p className="font-mono text-[0.8125rem] font-semibold uppercase leading-5 tracking-[0.04em] text-wine">04 boundary + rights</p>
              <p className="mt-3 max-w-[22rem] text-[1.0625rem] font-normal leading-[1.55]">Frequency is not first attestation. Unlike corpora remain non-comparable. Public-domain checks, Wikinews licensing, Ngram attribution, and source URLs remain attached to the research archive.</p>
            </div>
          </div>
          <details className="mt-10 border-t border-ink/30 pt-3">
            <summary className="min-h-11 cursor-pointer py-3 font-mono text-[0.8125rem] font-semibold uppercase leading-5 tracking-[0.04em] text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
              Extended source and rights note
            </summary>
            <div className="space-y-4 pb-3 text-[1.0625rem] font-normal leading-[1.55] text-ink">
              <p>{dataset.modernContext?.source.caveat}</p>
              <p>{dataset.modernContext?.source.licenseNote}</p>
              <p>
                Full methodology, source URLs, calculations, and publication rights remain on the{" "}
                <Link href="/about" className="border-b border-ink/55 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
                  About page
                </Link>
                .
              </p>
            </div>
          </details>
        </section>
      </div>
    </div>
  );
}
