import type { WordStudyProfile } from "@/data/search-intents";

type MobileChapterNavProps = {
  profile: WordStudyProfile;
};

export function MobileChapterNav({ profile }: MobileChapterNavProps) {
  return (
    <nav className="border-b-2 border-ink py-5 lg:hidden" aria-label={`${profile.word} study chapters`}>
      <p className="mb-3 font-mono text-[0.7rem] font-black uppercase tracking-[0.18em] text-ink/60">chapter index / tap to jump</p>
      <ol className="grid grid-cols-2 border-l border-t border-ink">
        {profile.chapters.map((chapter, index) => (
          <li key={chapter.href}>
            <a
              href={chapter.href}
              className="grid min-h-14 grid-cols-[2rem_1fr] items-center border-b border-r border-ink px-2 py-2 font-mono text-[0.7rem] font-black uppercase leading-4 tracking-[0.08em] transition hover:bg-ink hover:text-wheat focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              <span aria-hidden="true" className="text-[var(--study-text-accent)]">{String(index + 1).padStart(2, "0")}</span>
              <span>{chapter.label}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
