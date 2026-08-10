import type { GeneratedPrehistory } from "@/types/foreverRealData";

type ForeverAttestationHingeProps = {
  prehistory?: GeneratedPrehistory | null;
};

function sourceNames(records: GeneratedPrehistory["records"]) {
  return [...new Set(records.map((record) => record.sourceName))].join(" / ");
}

export function ForeverAttestationHinge({ prehistory }: ForeverAttestationHingeProps) {
  if (!prehistory) return null;

  const spaced = prehistory.records.filter(
    (record) => record.yearApproximation === 1375 && record.form === "for ever",
  );
  const phrase = prehistory.records.find(
    (record) => record.id === "attestation-for-ever-and-ever-kjv",
  );
  const joined = prehistory.records.find(
    (record) => record.id === "attestation-forever-one-word-late-17c",
  );
  const conflicts = prehistory.records
    .filter((record) => record.normalizedForm === "forevermore")
    .sort((left, right) => left.yearApproximation - right.yearApproximation);
  const earlyConflict = conflicts[0];
  const lateConflict = conflicts[conflicts.length - 1];

  return (
    <figure
      id="origin"
      className="scroll-mt-6 bg-paper-mobile pb-20 pt-20 text-ink"
      aria-labelledby="forever-attestation-hinge-title"
    >
      <div className="px-5">
        <p className="font-mono text-[0.8125rem] font-semibold uppercase leading-5 tracking-[0.04em] text-nice">
          02 / orthographic proof
        </p>
        <h2
          id="forever-attestation-hinge-title"
          className="mt-4 max-w-[21rem] text-[2rem] font-semibold leading-[1.02] tracking-[-0.02em]"
        >
          The space is visible. The dates remain source leads.
        </h2>
        <p className="mt-5 max-w-[22rem] text-[1.0625rem] font-normal leading-[1.55]">
          Forms are ordered by approximate source date. Scale and spacing create the editorial proof; they do not measure confidence or prove a first use.
        </p>
      </div>

      <div className="mt-16 space-y-20 px-5">
        <section className="grid grid-cols-6 gap-x-3" aria-labelledby="forever-spaced-form">
          <p className="col-span-2 font-mono text-[0.8125rem] font-semibold uppercase leading-5 tracking-[0.04em] text-nice">
            c.1375<br />late 14c.
          </p>
          <div className="col-span-6 mt-7">
            <p
              id="forever-spaced-form"
              aria-label="for ever"
              className="flex items-end text-[clamp(2.35rem,16.5vw,4.25rem)] font-extrabold uppercase leading-[0.9] tracking-[-0.02em]"
            >
              <span aria-hidden="true" className="text-nice">for</span>
              <span aria-hidden="true" className="relative mx-[0.16em] inline-block w-[0.28em] self-stretch">
                <span className="absolute inset-x-0 bottom-1/2 border-t border-nice" />
              </span>
              <span aria-hidden="true" className="text-fire">ever</span>
            </p>
            <p className="mt-5 max-w-[22rem] font-mono text-[0.8125rem] font-semibold uppercase leading-5 tracking-[0.04em] text-ink/85">
              {spaced.length} lexical leads / {sourceNames(spaced)}
            </p>
            <p className="mt-2 text-[1.0625rem] font-normal leading-[1.55] text-ink/85">
              Space retained. The blue connector points to the written gap; its width is editorial, not a measured value.
            </p>
          </div>
        </section>

        <section className="grid grid-cols-6 gap-x-3" aria-labelledby="forever-emphatic-form">
          <p className="col-span-2 break-words font-mono text-[0.8125rem] font-semibold uppercase leading-5 tracking-[0.04em] text-ink max-[300px]:[overflow-wrap:anywhere]">
            1611<br />KJV-associated
          </p>
          <div className="col-span-5 col-start-2 mt-8">
            <p id="forever-emphatic-form" className="text-[2rem] font-semibold uppercase leading-[0.98] tracking-[-0.02em]">
              For ever<br />and ever
            </p>
            <p className="mt-4 font-mono text-[0.8125rem] font-semibold uppercase leading-5 tracking-[0.04em] text-ink/85">
              {phrase?.sourceName ?? "secondary lexical source"}
            </p>
          </div>
        </section>

        <section className="grid grid-cols-6 gap-x-3" aria-labelledby="forever-joined-form">
          <p className="col-span-2 font-mono text-[0.8125rem] font-semibold uppercase leading-5 tracking-[0.04em] text-fire">
            c.1680<br />late 17c.
          </p>
          <div className="col-span-6 mt-7">
            <p
              id="forever-joined-form"
              className="text-[clamp(2.35rem,16.5vw,4.25rem)] font-extrabold uppercase leading-[0.9] tracking-[-0.02em] text-blaze"
            >
              forever
            </p>
            <p className="mt-5 font-mono text-[0.8125rem] font-semibold uppercase leading-5 tracking-[0.04em] text-ink/85">
              one-word lead / {joined?.sourceName ?? "secondary lexical source"}
            </p>
          </div>
        </section>

        <section className="pt-2" aria-labelledby="forever-conflict-form">
          <p className="font-mono text-[0.8125rem] font-semibold uppercase leading-5 tracking-[0.04em] text-wine">
            source conflict / unresolved
          </p>
          <h3 id="forever-conflict-form" className="mt-4 text-[2rem] font-semibold uppercase leading-none tracking-[-0.02em] text-wine max-[300px]:text-[1.65rem]">
            Forevermore?
          </h3>
          <div className="relative mt-10 h-px bg-wine" aria-hidden="true">
            <span className="absolute -left-0.5 -top-1.5 h-3 w-3 rounded-full border-2 border-wine bg-paper-mobile" />
            <span className="absolute -right-0.5 -top-1.5 h-3 w-3 rounded-full border-2 border-wine bg-paper-mobile" />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-6">
            <div>
              <p className="break-words text-[2rem] font-semibold leading-none text-wine max-[300px]:text-2xl">{earlyConflict?.dateLabel ?? "14th c."}</p>
              <p className="mt-3 font-mono text-[0.8125rem] font-semibold uppercase leading-5 tracking-[0.04em] text-ink/85">
                {earlyConflict?.sourceName ?? "lexical source"}
              </p>
            </div>
            <div className="text-right">
              <p className="break-words text-[2rem] font-semibold leading-none text-wine max-[300px]:text-2xl">{lateConflict?.dateLabel ?? "1819"}</p>
              <p className="mt-3 font-mono text-[0.8125rem] font-semibold uppercase leading-5 tracking-[0.04em] text-ink/85">
                {lateConflict?.sourceName ?? "lexical source"}
              </p>
            </div>
          </div>
          <p className="mt-6 text-[1.0625rem] font-normal leading-[1.55]">
            The line joins two conflicting reports; it is not a date range, average, or confidence scale.
          </p>
        </section>
      </div>

      <figcaption className="mt-20 px-5">
        <p className="max-w-[22rem] text-[1.0625rem] font-normal leading-[1.55]">
          The spaced leads precede the later one-word lead in these secondary sources. The project has not verified an earliest surviving quotation, so disagreement remains visible rather than being averaged away.
        </p>
        <p className="mt-5 font-mono text-[0.8125rem] font-semibold uppercase leading-5 tracking-[0.04em] text-ink/85">
          Attestation / secondary lexical sources, c.1375–1819 · Transform / records ordered by approximate date; type scale is editorial · Boundary / no comparable pre-1700 corpus; exact first use remains unverified
        </p>
      </figcaption>
    </figure>
  );
}
