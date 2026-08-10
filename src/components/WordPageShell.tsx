import type { CSSProperties, ReactNode } from "react";
import { EvidenceCoverageStrip } from "@/components/EvidenceCoverageStrip";
import { Nav } from "@/components/Nav";
import { SearchIntentSummary } from "@/components/SearchIntentSummary";
import { WordSeoSummary } from "@/components/WordSeoSummary";
import { wordStudyProfile, type WordStudyPath } from "@/data/search-intents";
import { routeByPath } from "@/lib/site";

type WordPageShellProps = {
  path: WordStudyPath;
  children: ReactNode;
};

export function WordPageShell({ path, children }: WordPageShellProps) {
  const profile = wordStudyProfile(path);
  const route = routeByPath(path);
  const textAccent = path === "/words/forever" ? "#AE4202" : path === "/words/hub" ? "#0B6B71" : route?.accent;

  if (!route) return children;

  return (
    <main
      className="min-h-screen bg-paper-mobile text-ink min-[960px]:bg-wheat"
      aria-labelledby={`${profile.word}-study-title`}
      style={{ "--study-accent": route.accent, "--study-text-accent": textAccent } as CSSProperties}
    >
      <div className="mx-auto w-full max-w-[1960px] px-5 pt-5 min-[960px]:px-10 xl:px-12">
        <Nav />
        <header className="relative mt-1 py-12 min-[960px]:overflow-hidden min-[960px]:border-y-2 min-[960px]:border-ink min-[960px]:py-14">
          <div className="pointer-events-none absolute inset-0 hidden opacity-60 [background-image:linear-gradient(90deg,rgba(5,5,16,0.09)_1px,transparent_1px),linear-gradient(180deg,rgba(5,5,16,0.07)_1px,transparent_1px)] [background-size:72px_72px] min-[960px]:block" />
          <div className="relative grid gap-8 min-[960px]:grid-cols-[minmax(0,1fr)_22rem] min-[960px]:items-end">
            <div>
              <p className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[var(--study-text-accent)] min-[960px]:text-[0.82rem] min-[960px]:font-black min-[960px]:tracking-[0.18em]">
                {profile.eyebrow}
              </p>
              <h1
                id={`${profile.word}-study-title`}
                className="mt-5 max-w-full break-words text-[clamp(4.3rem,17vw,18rem)] font-black leading-[0.78] tracking-[-0.045em] text-[var(--study-text-accent)] min-[960px]:mt-4 min-[960px]:leading-[0.76]"
              >
                {profile.word}
              </h1>
              <p className="mt-7 max-w-5xl text-[1.05rem] font-medium leading-[1.48] min-[960px]:text-[clamp(1.12rem,2.2vw,2.85rem)] min-[960px]:font-black min-[960px]:leading-[1.04]">
                {profile.heroSummary}
              </p>
              <p className="mt-5 max-w-4xl font-mono text-[0.68rem] font-semibold uppercase leading-5 tracking-[0.08em] text-ink/70 min-[960px]:mt-4 min-[960px]:text-[0.88rem] min-[960px]:font-black min-[960px]:leading-6 min-[960px]:tracking-[0.11em] min-[960px]:text-ink/[0.62]">
                {profile.scopeLine}
              </p>
              <p className="mt-3 font-mono text-[0.66rem] font-semibold uppercase leading-5 tracking-[0.06em] text-ink/64 min-[960px]:hidden">
                coverage / {profile.coverage.map((item) => `${item.label} ${item.value}`).join(" · ")}
              </p>
            </div>
            <dl className="hidden border-y border-ink bg-wheat/90 min-[960px]:grid">
              {profile.coverage.map((item, index) => (
                <div key={item.label} className={`grid grid-cols-[7rem_1fr] border-ink ${index > 0 ? "border-t" : ""}`}>
                  <dt className="border-r border-ink px-3 py-3 font-mono text-[0.7rem] font-black uppercase tracking-[0.12em] text-[var(--study-text-accent)]">
                    {item.label}
                  </dt>
                  <dd className="px-3 py-3 font-mono text-[0.78rem] font-black uppercase tracking-[0.09em]">{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </header>
        <SearchIntentSummary profile={profile} />
        <EvidenceCoverageStrip profile={profile} />
      </div>
      {children}
      <WordSeoSummary path={path} />
    </main>
  );
}
