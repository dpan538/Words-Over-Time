import type { WordStudyProfile } from "@/data/search-intents";

type EvidenceCoverageStripProps = {
  profile: WordStudyProfile;
};

export function EvidenceCoverageStrip({ profile }: EvidenceCoverageStripProps) {
  return (
    <section className="hidden border-b border-ink py-6 min-[960px]:block" aria-labelledby={`${profile.word}-coverage-title`}>
      <div className="grid gap-5 lg:grid-cols-[12rem_minmax(0,1fr)] lg:gap-8">
        <div>
          <p className="font-mono text-[0.72rem] font-black uppercase tracking-[0.18em] text-[var(--study-text-accent)]">evidence coverage</p>
          <h2 id={`${profile.word}-coverage-title`} className="mt-2 text-lg font-black leading-tight">
            What the page can inspect
          </h2>
        </div>
        <div>
          <dl className="grid border-y border-ink sm:grid-cols-3">
            {profile.coverage.map((item, index) => (
              <div key={item.label} className={`grid grid-cols-[6.5rem_1fr] border-ink px-0 py-3 sm:block sm:px-4 ${index > 0 ? "border-t sm:border-l sm:border-t-0" : ""}`}>
                <dt className="font-mono text-[0.68rem] font-black uppercase tracking-[0.13em] text-ink/60">{item.label}</dt>
                <dd className="font-mono text-[0.78rem] font-black uppercase leading-5 tracking-[0.08em] sm:mt-1">{item.value}</dd>
                <dd className="col-span-2 mt-1 text-xs font-semibold leading-5 text-ink/[0.58] sm:mt-2">{item.note}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 font-mono text-[0.68rem] font-black uppercase leading-5 tracking-[0.1em] text-ink/60">
            Evidence types: {profile.evidenceTypes.join(" / ")}
          </p>
        </div>
      </div>
    </section>
  );
}
