import type { WordStudyProfile } from "@/data/search-intents";

type SearchIntentSummaryProps = {
  profile: WordStudyProfile;
};

export function SearchIntentSummary({ profile }: SearchIntentSummaryProps) {
  const primary = profile.answers.find((answer) => answer.id === profile.primaryAnswerId) || profile.answers[0];
  const related = profile.answers.filter((answer) => answer.id !== primary.id);

  return (
    <section className="border-b-2 border-ink py-8 sm:py-10" aria-labelledby={`${profile.word}-direct-answer`}>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(20rem,0.55fr)] lg:gap-12">
        <article id={primary.id} className="scroll-mt-6 border-l-4 border-[var(--study-accent)] pl-4 sm:pl-6">
          <p className="font-mono text-[0.72rem] font-black uppercase tracking-[0.18em] text-ink/[0.58]">
            direct answer / source bounded
          </p>
          <h2 id={`${profile.word}-direct-answer`} className="mt-3 max-w-4xl text-[clamp(1.65rem,3.2vw,3.4rem)] font-black leading-[0.98]">
            {primary.question}
          </h2>
          <p className="mt-4 max-w-4xl text-[1.05rem] font-bold leading-[1.48] text-anthracite sm:text-[1.22rem]">
            {primary.shortAnswer}
          </p>
          <p className="mt-5 max-w-3xl border-t border-ink/25 pt-4 font-mono text-[0.75rem] font-black uppercase leading-5 tracking-[0.1em] text-ink/[0.62]">
            Caveat: {primary.caveat}
          </p>
          <a
            href={`#${primary.relatedSection}`}
            className="mt-5 inline-flex min-h-11 items-center border-b-2 border-ink pb-1 text-[0.76rem] font-black uppercase tracking-[0.13em] transition hover:border-[var(--study-accent)] hover:text-[var(--study-text-accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
          >
            Open the supporting research section
          </a>
        </article>

        <div className="border-t border-ink/[0.45] pt-5 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
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
