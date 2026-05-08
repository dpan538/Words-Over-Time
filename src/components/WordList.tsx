import { WordCard } from "@/components/WordCard";
import type { Word } from "@/types/word";

type WordListProps = {
  words: Word[];
};

export function WordList({ words }: WordListProps) {
  return (
    <div className="max-w-[1580px] text-[clamp(3.9rem,10.8vw,11rem)] font-black leading-[1.06] tracking-normal">
      {words.map((word, index) => (
        <span key={word.slug}>
          <WordCard word={word} />
          {index < words.length - 1 ? (
            <span className="mx-[0.08em] text-ink">/</span>
          ) : null}
        </span>
      ))}
    </div>
  );
}
