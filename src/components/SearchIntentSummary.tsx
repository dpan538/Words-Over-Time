import type { WordStudyProfile } from "@/data/search-intents";

type SearchIntentSummaryProps = {
  profile: WordStudyProfile;
};

export function SearchIntentSummary({ profile }: SearchIntentSummaryProps) {
  const primary = profile.answers.find((answer) => answer.id === profile.primaryAnswerId) || profile.answers[0];
  const related = profile.answers.filter((answer) => answer.id !== primary.id);

  return (
    <section className="pb-14 pt-2 min-[960px]:border-b-2 min-[960px]:border-ink min-[960px]:py-10" aria-labelledby={`${profile.word}-direct-answer`}>
      <div className="grid min-[960px]:grid-cols-[minmax(0,0.95fr)_minmax(20rem,0.55fr)] min-[960px]:gap-12">
        <article id={primary.id} className="scroll-mt-6 min-[960px]:border-l-4 min-[960px]:border-[var(--study-accent)] min-[960px]:pl-6">
          <p className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.13em] text-ink/64 min-[960px]:text-[0.72rem] min-[960px]:font-black min-[960px]:tracking-[0.18em] min-[960px]:text-ink/[0.58]">
            <span className="min-[960px]:hidden">research lead / source bounded</span>
            <span className="hidden min-[960px]:inline">direct answer / source bounded</span>
          </p>
          <h2 id={`${profile.word}-direct-answer`} className="mt-3 max-w-4xl text-2xl font-bold leading-[1.08] min-[960px]:text-[clamp(1.65rem,3.2vw,3.4rem)] min-[960px]:font-black min-[960px]:leading-[0.98]">
            {primary.question}
          </h2>
          <p className="mt-5 max-w-4xl text-[1rem] font-medium leading-[1.62] text-ink/84 min-[960px]:mt-4 min-[960px]:text-[1.22rem] min-[960px]:font-bold min-[960px]:leading-[1.48] min-[960px]:text-anthracite">
            {primary.shortAnswer}
          </p>
          <p className="mt-4 max-w-3xl text-[0.75rem] font-medium leading-5 text-ink/68 min-[960px]:mt-5 min-[960px]:border-t min-[960px]:border-ink/25 min-[960px]:pt-4 min-[960px]:font-mono min-[960px]:font-black min-[960px]:uppercase min-[960px]:tracking-[0.1em] min-[960px]:text-ink/[0.62]">
            Caveat: {primary.caveat}
          </p>
          <a
            href={`#${primary.relatedSection}`}
            className="mt-5 hidden min-h-11 items-center border-b-2 border-ink pb-1 text-[0.76rem] font-black uppercase tracking-[0.13em] transition hover:border-[var(--study-accent)] hover:text-[var(--study-text-accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink min-[960px]:inline-flex"
          >
            Open the supporting research section
          </a>
        </article>

        <div className="hidden border-t border-ink/[0.45] pt-5 min-[960px]:block min-[960px]:border-l min-[960px]:border-t-0 min-[960px]:pl-7 min-[960px]:pt-0">
          <p className="font-mono text-[0.72rem] font-black uppercase tracking-[0.18em] text-[var(--study-text-accent)]">
            related questions
          </p>
          <div className="mt-4 grid gap-5">
            {related.map((answer) => (
              <article key={answer.id} id={answer.id} className="scroll-mt-6 border-t border-ink/25 pt-4 first:border-t-0 first:pt-0">
                <h3 className="text-lg font-black leading-tight sm:text-xl">{answer.question}</h3>
                <p className="mt-2 text-sm font-semibold leading-6 text-ink/[0.72]">{answer.shortAnswer}</p>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[0.68rem] font-black uppercase leading-5 tracking-[0.09em] text-ink/60">
                  <span>reviewed {answer.lastReviewed}</span>
                  <a
                    href={`#${answer.relatedSection}`}
                    className="min-h-11 border-b border-ink/[0.55] py-3 text-ink/[0.72] hover:border-[var(--study-accent)] hover:text-[var(--study-text-accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                  >
                    evidence section
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
