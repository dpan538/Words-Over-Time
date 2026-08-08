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
    <div className="w-full min-w-0 max-w-[1580px] font-black tracking-normal lg:text-[clamp(3.9rem,10.8vw,11rem)] lg:leading-[1.06]">
      {rows.map((row) => (
        <div
          key={row.map((word) => word.slug).join("-")}
          className="grid min-w-0 border-t-2 border-ink lg:block lg:border-0 lg:whitespace-nowrap"
        >
          {row.map((word) => (
            <div
              key={word.slug}
              className="min-w-0 border-b-2 border-ink lg:inline-block lg:border-0 lg:whitespace-nowrap"
            >
              <WordCard word={word} />
              <span aria-hidden="true" className="mx-[0.08em] hidden text-ink lg:inline">
                /
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
