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
    <div className="max-w-[1580px] text-[clamp(3.9rem,10.8vw,11rem)] font-black leading-[1.06] tracking-normal">
      {rows.map((row) => (
        <div key={row.map((word) => word.slug).join("-")} className="whitespace-nowrap">
          {row.map((word) => (
            <span key={word.slug} className="inline-block whitespace-nowrap">
              <WordCard word={word} />
              <span className="mx-[0.08em] text-ink">/</span>
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}
