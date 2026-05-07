import { WordCard } from "@/components/WordCard";
import type { Word } from "@/types/word";

type WordListProps = {
  words: Word[];
};

export function WordList({ words }: WordListProps) {
  return (
    <div className="max-w-[1500px] text-[clamp(4rem,12vw,12rem)] font-black leading-[0.86] tracking-normal">
      {words.map((word, index) => (
        <span key={word.slug}>
          <WordCard word={word} />
          {index < words.length - 1 ? (
            <span className="mx-[0.08em] text-fire">/</span>
          ) : null}
        </span>
      ))}
    </div>
  );
}
