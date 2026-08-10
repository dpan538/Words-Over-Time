import type {
  ForeverGeneratedDataset,
  GeneratedModernContext,
  GeneratedPhrase,
} from "@/types/foreverRealData";

type ForeverRecurrenceFieldProps = {
  phrases: GeneratedPhrase[];
  modernContext?: GeneratedModernContext | null;
  coverage: ForeverGeneratedDataset["coverage"];
};

const archivalOrder = ["live forever", "gone forever", "forever and ever"];
const modernOrder = [
  "live forever",
  "for ever",
  "remembered forever",
  "forever and ever",
  "gone forever",
];

function orderedPhrases<T extends { displayEligible: boolean; phrase: string }>(
  phrases: T[],
  order: string[],
) {
  return phrases
    .filter((phrase) => phrase.displayEligible)
    .sort((left, right) => {
      const leftIndex = order.indexOf(left.phrase);
      const rightIndex = order.indexOf(right.phrase);
      return (leftIndex < 0 ? order.length : leftIndex) -
        (rightIndex < 0 ? order.length : rightIndex);
    });
}

function recordsForPhrase(
  phrase: GeneratedModernContext["phrases"][number],
  modernContext: GeneratedModernContext,
) {
  const snippetsById = new Map(
    modernContext.snippets.map((snippet) => [snippet.id, snippet]),
  );
  const records = new Map<
    string,
    { sourceUrl: string; title: string; year: number; appearanceCount: number }
  >();

  for (const snippetId of phrase.relatedSnippetIds) {
    const snippet = snippetsById.get(snippetId);
    if (!snippet) continue;
    const current = records.get(snippet.sourceUrl);
    if (current) {
      current.appearanceCount += 1;
    } else {
      records.set(snippet.sourceUrl, {
        sourceUrl: snippet.sourceUrl,
        title: snippet.title,
        year: snippet.year,
        appearanceCount: 1,
      });
    }
  }

  return [...records.values()].sort(
    (left, right) => left.year - right.year || left.title.localeCompare(right.title),
  );
}

export function ForeverRecurrenceField({
  phrases,
  modernContext,
  coverage,
}: ForeverRecurrenceFieldProps) {
  const archival = orderedPhrases(
    phrases.filter((phrase) => phrase.eraId === "all"),
    archivalOrder,
  );
  const modern = modernContext
    ? orderedPhrases(modernContext.phrases, modernOrder)
    : [];
  const archivalMaximum = Math.max(1, ...archival.map((phrase) => phrase.count));

  return (
    <figure
      id="meaning-over-time"
      className="scroll-mt-6 bg-paper-mobile text-ink"
      aria-labelledby="forever-recurrence-title"
    >
      <div className="px-5 pb-12 pt-12">
        <p className="font-mono text-[0.8125rem] font-semibold uppercase leading-5 tracking-[0.04em] text-fire">
          03 / recurrence + record
        </p>
        <h2
          id="forever-recurrence-title"
          className="mt-4 max-w-[22rem] text-[2rem] font-semibold leading-[1.02] tracking-[-0.02em]"
        >
          What repeats—and where is it counted?
        </h2>
        <p className="mt-5 max-w-[22rem] text-[1.0625rem] font-normal leading-[1.55]">
          Selected books and modern source pages stay visually separate. Each field defines its unit before the evidence begins.
        </p>
      </div>

      <section className="bg-fire px-5 pb-20 pt-12 text-paper-mobile" aria-labelledby="forever-archive-proof">
        <div className="flex items-end justify-between gap-5 max-[300px]:block">
          <h3 id="forever-archive-proof" className="text-[2rem] font-semibold uppercase leading-none tracking-[-0.02em]">
            Archive proof /
          </h3>
          <p className="text-right font-mono text-[0.8125rem] font-semibold uppercase leading-5 tracking-[0.04em] max-[300px]:mt-4 max-[300px]:text-left">
            Gutenberg seed<br />1726–1930
          </p>
        </div>
        <p className="mt-6 max-w-[22rem] font-mono text-[0.8125rem] font-semibold uppercase leading-5 tracking-[0.04em]">
          Position on every rule = counted phrase appearances · one shared 0–{archivalMaximum} scale
        </p>

        <div className="mt-12 space-y-16">
          {archival.map((phrase) => (
            <section
              key={phrase.id}
              className="min-w-0"
              aria-labelledby={`archive-phrase-${phrase.id}`}
            >
              <div className="flex items-end justify-between gap-5">
                <h4 id={`archive-phrase-${phrase.id}`} className="min-w-0 text-[2rem] font-semibold leading-[1.02] tracking-[-0.02em]">
                  {phrase.phrase}
                </h4>
                <p className="shrink-0 text-[3.5rem] font-normal leading-none tracking-[-0.025em]" aria-label={`${phrase.count} counted phrase appearances`}>
                  {String(phrase.count).padStart(2, "0")}
                </p>
              </div>

              <div className="mt-6" role="img" aria-label={`${phrase.phrase}: ${phrase.count} counted phrase appearances on a shared scale from zero to ${archivalMaximum}.`}>
                <div className="grid font-mono text-[0.8125rem] font-semibold leading-5 tracking-[0.04em]" style={{ gridTemplateColumns: `repeat(${archivalMaximum + 1}, minmax(0, 1fr))` }} aria-hidden="true">
                  {Array.from({ length: archivalMaximum + 1 }, (_, value) => (
                    <span key={value} className={value === archivalMaximum ? "text-right" : undefined}>{value}</span>
                  ))}
                </div>
                <div className="relative mt-2 h-14 border-y border-paper-mobile/65" aria-hidden="true">
                  {Array.from({ length: archivalMaximum + 1 }, (_, value) => (
                    <span
                      key={value}
                      className="absolute inset-y-0 w-px bg-paper-mobile/35"
                      style={{ left: `${(value / archivalMaximum) * 100}%` }}
                    />
                  ))}
                  <span
                    className="absolute left-0 top-1/2 h-[3px] -translate-y-1/2 bg-sun"
                    style={{ width: `${(phrase.count / archivalMaximum) * 100}%` }}
                  />
                  <span
                    className="absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border-2 border-paper-mobile bg-sun"
                    style={{ left: `calc(${(phrase.count / archivalMaximum) * 100}% - 1.25rem)` }}
                  />
                </div>
              </div>

              <p className="mt-4 font-mono text-[0.8125rem] font-semibold uppercase leading-5 tracking-[0.04em]">
                {phrase.count} counted appearances across {phrase.documentFrequency} selected {phrase.documentFrequency === 1 ? "book" : "books"}
              </p>
              <p className="mt-3 font-mono text-[0.8125rem] font-semibold uppercase leading-5 tracking-[0.04em] text-paper-mobile/90">
                Books / {phrase.sampleTitles.join(" / ")}
              </p>
            </section>
          ))}
        </div>
      </section>

      <section className="overflow-hidden px-5 pb-10 pt-4" aria-labelledby="forever-context-void">
        <p aria-hidden="true" className="-ml-3 text-[8.5rem] font-normal leading-none tracking-[-0.03em] text-transparent [-webkit-text-stroke:1px_#050510]">
          1930
        </p>
        <div className="mt-8 grid grid-cols-6 gap-3">
          <div className="col-span-2 border-l border-ink/40 pl-3 pt-1 font-mono text-[0.8125rem] font-semibold uppercase leading-5 tracking-[0.04em] text-fire">
            coverage<br />void
          </div>
          <div className="col-span-4">
            <h3 id="forever-context-void" className="text-[2rem] font-semibold leading-[1.02] tracking-[-0.02em]">
              No comparable context layer joins these sources.
            </h3>
            <p className="mt-4 text-[1.0625rem] font-normal leading-[1.55]">
              The paper field keeps the break visible. Its height is editorial: it is not a frequency value and does not prove non-use.
            </p>
          </div>
        </div>
        <p aria-hidden="true" className="-mr-3 mt-10 text-right text-[8.5rem] font-normal leading-none tracking-[-0.03em] text-transparent [-webkit-text-stroke:1px_#1570AC]">
          2024
        </p>
      </section>

      {modernContext ? (
        <section className="bg-nice px-5 pb-20 pt-12 text-paper-mobile" aria-labelledby="forever-modern-ledger">
          <p className="font-mono text-[0.8125rem] font-semibold uppercase leading-5 tracking-[0.04em]">
            2024–2026 / revision snapshot
          </p>
          <h3 id="forever-modern-ledger" className="mt-4 text-[2rem] font-semibold uppercase leading-none tracking-[-0.02em]">
            Modern source rake /
          </h3>
          <p className="mt-6 max-w-[22rem] text-[1.0625rem] font-normal leading-[1.55]">
            Every vertical stem is one source page. Every short cross-line is one time the phrase appears in a captured excerpt. Stems are ordered by revision year, then title; horizontal position is not a popularity scale.
          </p>

          <div className="mt-14 space-y-16">
            {modern.map((phrase) => {
              const records = recordsForPhrase(phrase, modernContext);
              return (
                <section key={phrase.id} aria-labelledby={`modern-phrase-${phrase.id}`}>
                  <h4 id={`modern-phrase-${phrase.id}`} className="text-[2rem] font-semibold leading-[1.02] tracking-[-0.02em]">
                    {phrase.phrase}
                  </h4>
                  <p className="mt-3 font-mono text-[0.8125rem] font-semibold uppercase leading-5 tracking-[0.04em]">
                    {phrase.count} captured {phrase.count === 1 ? "appearance" : "appearances"} across {phrase.documentFrequency} source {phrase.documentFrequency === 1 ? "page" : "pages"}
                  </p>

                  <div className="mt-6 border-y border-paper-mobile/60 px-2 pt-5" role="img" aria-label={`${phrase.phrase}: ${records.length} source pages carry ${phrase.count} captured phrase appearances.`}>
                    <div className="grid min-h-32 items-end gap-3" style={{ gridTemplateColumns: `repeat(${Math.max(1, records.length)}, minmax(0, 1fr))` }} aria-hidden="true">
                      {records.map((record, recordIndex) => (
                        <div key={record.sourceUrl} className="relative h-28 min-w-0">
                          <span className="absolute bottom-8 left-1/2 top-1 w-px -translate-x-1/2 bg-paper-mobile/80" />
                          {Array.from({ length: record.appearanceCount }, (_, appearanceIndex) => (
                            <span
                              key={appearanceIndex}
                              className="absolute left-1/2 h-[2px] w-7 -translate-x-1/2 bg-sun"
                              style={{ top: `${12 + appearanceIndex * 18}px` }}
                            />
                          ))}
                          <span className="absolute inset-x-0 bottom-1 text-center font-mono text-[0.8125rem] font-semibold leading-5 tracking-[0.04em]">
                            {String(recordIndex + 1).padStart(2, "0")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <details className="mt-4 border-b border-paper-mobile/60 pb-1">
                    <summary className="min-h-11 cursor-pointer py-3 text-[0.9375rem] font-semibold leading-5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper-mobile">
                      Source pages / {records.length}
                    </summary>
                    <ol className="pb-3">
                      {records.map((record, recordIndex) => (
                        <li key={record.sourceUrl} className="border-t border-paper-mobile/45">
                          <a
                            href={record.sourceUrl}
                            className="grid min-h-11 grid-cols-[2rem_1fr] gap-x-3 py-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper-mobile"
                          >
                            <span className="font-mono text-[0.8125rem] font-semibold leading-5 tracking-[0.04em]">
                              {String(recordIndex + 1).padStart(2, "0")}
                            </span>
                            <span className="min-w-0">
                              <span className="block text-[0.9375rem] font-normal leading-5">
                                {record.title}
                              </span>
                              <span className="mt-2 block font-mono text-[0.8125rem] font-semibold uppercase leading-5 tracking-[0.04em]">
                                Revision {record.year} / {record.appearanceCount} captured {record.appearanceCount === 1 ? "appearance" : "appearances"}
                              </span>
                            </span>
                          </a>
                        </li>
                      ))}
                    </ol>
                  </details>
                </section>
              );
            })}
          </div>

          <p className="mt-16 max-w-[22rem] text-[1.0625rem] font-normal leading-[1.55]">
            The source rake makes repeated appearances within one page visible without pretending that the snapshot is a ranking. Revision year is not event date, and these query captures do not measure popularity.
          </p>
          <p className="mt-5 font-mono text-[0.8125rem] font-semibold uppercase leading-5 tracking-[0.04em]">
            Context / Wikinews open-news revision snapshot · Unit / captured phrase appearance; source page = unique source URL · Boundary / not a balanced corpus and not comparable with Gutenberg or Ngram
          </p>
        </section>
      ) : null}

      <figcaption className="px-5 pb-20 pt-10">
        <p className="max-w-[22rem] text-[1.0625rem] font-normal leading-[1.55]">
          Gutenberg phrase totals use one selected archive and one counting rule. The modern source rake uses a separate revision snapshot. The two fields can be read in sequence, never as one ranking or growth series.
        </p>
        <p className="mt-5 font-mono text-[0.8125rem] font-semibold uppercase leading-5 tracking-[0.04em] text-ink/85">
          Variant + context / {coverage.gutenbergStartYear}–{coverage.gutenbergEndYear} selected Gutenberg texts → {coverage.modernContextStartYear ?? 2024}–{coverage.modernContextEndYear ?? 2026} Wikinews snapshot · Boundary / missing coverage is not zero or non-use
        </p>
      </figcaption>
    </figure>
  );
}
