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
  const isForever = path === "/words/forever";
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
        <header className={`relative mt-1 min-[960px]:overflow-hidden min-[960px]:border-y-2 min-[960px]:border-ink min-[960px]:py-14 ${isForever ? "py-5" : "py-12"}`}>
          <div className="pointer-events-none absolute inset-0 hidden opacity-60 [background-image:linear-gradient(90deg,rgba(5,5,16,0.09)_1px,transparent_1px),linear-gradient(180deg,rgba(5,5,16,0.07)_1px,transparent_1px)] [background-size:72px_72px] min-[960px]:block" />
          <div className="relative grid min-w-0 gap-8 min-[960px]:grid-cols-[minmax(0,1fr)_22rem] min-[960px]:items-end">
            <div className="min-w-0">
              <p className="font-mono text-[0.8125rem] font-semibold uppercase tracking-[0.04em] text-fire min-[960px]:text-[0.82rem] min-[960px]:font-black min-[960px]:tracking-[0.18em] min-[960px]:text-[var(--study-text-accent)]">
                {profile.eyebrow}
              </p>
              <h1
                id={`${profile.word}-study-title`}
                className={`mt-5 max-w-full break-words font-extrabold text-[var(--study-text-accent)] min-[960px]:mt-4 min-[960px]:text-[clamp(4.3rem,17vw,18rem)] min-[960px]:font-black min-[960px]:leading-[0.76] min-[960px]:tracking-[-0.045em] ${isForever ? "!mt-3 text-[clamp(3rem,14vw,4rem)] leading-[0.84] tracking-[-0.035em] min-[960px]:!mt-4" : "text-[clamp(4.3rem,17vw,18rem)] leading-[0.84] tracking-[-0.035em]"}`}
              >
                {profile.word}
              </h1>
              <p className={`mt-7 max-w-5xl text-[1.0625rem] font-normal leading-[1.55] min-[960px]:text-[clamp(1.12rem,2.2vw,2.85rem)] min-[960px]:font-black min-[960px]:leading-[1.04] ${isForever ? "!mt-4 leading-[1.45] min-[960px]:!mt-7" : ""}`}>
                {isForever ? (
                  <>
                    <span className="min-[960px]:hidden">
                      Two movements shape the record: first the spelling balance turns as <i>for ever</i> retreats; later both forms rebound after the split has already settled.
                    </span>
                    <span className="hidden min-[960px]:inline">{profile.heroSummary}</span>
                  </>
                ) : profile.heroSummary}
              </p>
              <p className={`mt-5 max-w-4xl font-mono text-[0.8125rem] font-semibold uppercase leading-5 tracking-[0.04em] text-ink/85 min-[960px]:mt-4 min-[960px]:text-[0.88rem] min-[960px]:font-black min-[960px]:leading-6 min-[960px]:tracking-[0.11em] min-[960px]:text-ink/[0.62] ${isForever ? "hidden min-[960px]:block" : ""}`}>
                {profile.scopeLine}
              </p>
              {!isForever ? (
                <p className="mt-3 font-mono text-[0.8125rem] font-semibold uppercase leading-5 tracking-[0.04em] text-ink/80 min-[960px]:hidden">
                  coverage / {profile.coverage.map((item) => `${item.label} ${item.value}`).join(" · ")}
                </p>
              ) : null}
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
        <div className={isForever ? "hidden min-[960px]:block" : undefined}>
          <SearchIntentSummary profile={profile} />
        </div>
        <EvidenceCoverageStrip profile={profile} />
      </div>
      {children}
      <div className={isForever ? "hidden min-[960px]:block" : undefined}>
        <WordSeoSummary path={path} />
      </div>
    </main>
  );
}
