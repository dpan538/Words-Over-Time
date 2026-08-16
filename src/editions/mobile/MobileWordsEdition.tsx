import Link from "next/link";
import type { CSSProperties } from "react";
import { Nav } from "@/editions/mobile/shared/Nav";
import { wordRoutes } from "@/lib/site";

export function MobileWordsEdition() {
  return (
    <main className="min-h-screen bg-wheat px-5 py-5 text-ink sm:px-10 sm:py-7 lg:px-16 xl:px-20">
      <Nav />
      <section className="mx-auto flex max-w-[1680px] flex-col gap-10 py-14">
        <div className="grid gap-8 border-b-4 border-ink pb-10 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.34fr)]">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.2em] text-nice">words over time / index</p>
            <h1 className="mt-4 max-w-5xl text-6xl font-black leading-[0.95] sm:text-8xl lg:text-9xl">word studies</h1>
          </div>
          <div className="self-end text-base font-bold leading-relaxed text-anthracite sm:text-lg">
            Browse the public studies currently available for search engines, readers, and AI retrieval tools. Each entry links to a canonical
            route with metadata, structured data, source notes, and explicit publication boundaries.
          </div>
        </div>

        <div className="grid gap-4">
          {wordRoutes.map((route, index) => (
            <Link
              key={route.path}
              href={route.path}
              className="group grid gap-5 border-b-2 border-ink/30 py-6 transition hover:border-ink lg:grid-cols-[120px_minmax(0,0.45fr)_minmax(0,1fr)] lg:items-start"
            >
              <span className="font-mono text-sm font-black text-ink/60">{String(index + 1).padStart(2, "0")}</span>
              <span className="text-4xl font-black leading-none transition group-hover:text-[var(--word-accent)] sm:text-6xl" style={{ "--word-accent": route.accent } as CSSProperties}>
                {route.title.toLowerCase()}/
              </span>
              <span className="flex flex-col gap-4">
                <span className="max-w-3xl text-lg font-bold leading-snug text-anthracite sm:text-xl">{route.summary || route.description}</span>
                <span className="flex flex-wrap gap-2">
                  {route.keywords.slice(0, 5).map((keyword) => (
                    <span key={keyword} className="border border-ink/40 px-2 py-1 text-xs font-black uppercase tracking-[0.12em] text-ink/75">
                      {keyword}
                    </span>
                  ))}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
