import type { CSSProperties, ReactNode } from "react";
import { EvidenceCoverageStrip } from "@/components/EvidenceCoverageStrip";
import { MobileChapterNav } from "@/components/MobileChapterNav";
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
      className="min-h-screen bg-wheat text-ink"
      aria-labelledby={`${profile.word}-study-title`}
      style={{ "--study-accent": route.accent, "--study-text-accent": textAccent } as CSSProperties}
    >
      <div className="mx-auto w-full max-w-[1960px] px-4 pt-5 sm:px-7 lg:px-10 xl:px-12">
        <Nav />
        <header className="relative mt-1 overflow-hidden border-y-2 border-ink py-8 sm:py-11 lg:py-14">
          <div className="pointer-events-none absolute inset-0 opacity-60 [background-image:linear-gradient(90deg,rgba(5,5,16,0.09)_1px,transparent_1px),linear-gradient(180deg,rgba(5,5,16,0.07)_1px,transparent_1px)] [background-size:72px_72px]" />
          <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end">
            <div>
              <p className="font-mono text-[0.75rem] font-black uppercase tracking-[0.18em] text-[var(--study-text-accent)] sm:text-[0.82rem]">
                {profile.eyebrow}
              </p>
              <h1
                id={`${profile.word}-study-title`}
                className="mt-4 max-w-full break-words text-[clamp(4.3rem,17vw,18rem)] font-black leading-[0.76] tracking-[-0.045em] text-[var(--study-text-accent)]"
              >
                {profile.word}
              </h1>
              <p className="mt-7 max-w-5xl text-[clamp(1.12rem,2.2vw,2.85rem)] font-black leading-[1.04]">
                {profile.heroSummary}
              </p>
              <p className="mt-4 max-w-4xl font-mono text-[0.75rem] font-black uppercase leading-6 tracking-[0.11em] text-ink/[0.62] sm:text-[0.88rem]">
                {profile.scopeLine}
              </p>
            </div>
            <dl className="hidden border-y border-ink bg-wheat/90 lg:grid">
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
        <MobileChapterNav profile={profile} />
      </div>
      {children}
      <WordSeoSummary path={path} />
    </main>
  );
}
