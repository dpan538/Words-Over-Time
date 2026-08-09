import { WordCard } from "@/components/WordCard";
import type { Word } from "@/types/word";

type WordListProps = {
  words: Word[];
};

export function WordList({ words }: WordListProps) {
  const bySlug = new Map(words.map((word) => [word.slug, word]));
  const row = (slugs: string[]) => slugs.map((slug) => bySlug.get(slug)).filter((word): word is Word => Boolean(word));

  const rows = [
    row(["forever"]),
    row(["artificial"]),
    row(["privacy", "hub"]),
    row(["depression"]),
    row(["intelligence"]),
    row(["data"]),
  ].filter((row) => row.length > 0);

  return (
    <div className="w-full min-w-0 max-w-[1580px] font-black tracking-normal min-[960px]:text-[clamp(3.9rem,10.8vw,11rem)] min-[960px]:leading-[1.06]">
      {rows.map((row) => (
        <div
          key={row.map((word) => word.slug).join("-")}
          className="block min-w-0 min-[960px]:whitespace-nowrap"
        >
          {row.map((word) => (
            <div
              key={word.slug}
              className="flex min-w-0 items-baseline min-[960px]:inline-block min-[960px]:whitespace-nowrap"
            >
              <WordCard word={word} />
              <span aria-hidden="true" className="ml-[0.08em] text-[clamp(2.75rem,13.5vw,4.15rem)] leading-none text-ink min-[960px]:mx-[0.08em] min-[960px]:text-[1em] min-[960px]:leading-[inherit]">
                /
              </span>
              {word.status === "coming-soon" ? (
                <span className="ml-2 font-mono text-[0.52rem] font-medium uppercase tracking-[0.08em] text-ink/40 min-[960px]:hidden">
                  coming soon
                </span>
              ) : null}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
