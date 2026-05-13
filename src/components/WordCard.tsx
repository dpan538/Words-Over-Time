import Link from "next/link";
import type { Word } from "@/types/word";

type WordCardProps = {
  word: Word;
};

export function WordCard({ word }: WordCardProps) {
  if (word.href) {
    const isBlueWord = word.slug === "depression" || word.slug === "data";
    const isArtificialWord = word.slug === "artificial";
    const isHubWord = word.slug === "hub";
    const hoverTone = isHubWord
      ? "hover:text-hub-teal"
      : isArtificialWord
        ? "hover:text-wine"
        : isBlueWord
          ? "hover:text-nice"
          : "hover:text-blaze";
    const labelTone = isHubWord
      ? "text-hub-space"
      : isArtificialWord
        ? "text-wine"
        : isBlueWord
          ? "text-nice"
          : "text-blaze";
    const hoverLabel = isHubWord ? "center moved" : isArtificialWord ? "semantic chamber" : "word page";
    return (
      <Link
        href={word.href}
        className={`group relative inline-block text-ink decoration-[0.08em] underline-offset-[0.13em] transition duration-200 hover:-translate-y-1 hover:skew-x-[-3deg] hover:underline ${hoverTone}`}
      >
        {word.label}
        <span className={`pointer-events-none absolute left-2 top-0 hidden -translate-y-[62%] text-[0.105em] font-bold uppercase leading-none tracking-[0.16em] group-hover:block ${labelTone}`}>
          {hoverLabel}
        </span>
      </Link>
    );
  }

  return (
    <span className="group relative inline-block cursor-not-allowed text-ink transition duration-200 hover:-translate-y-0.5 hover:skew-x-[-2deg] hover:text-sail">
      {word.label}
      <span className="pointer-events-none absolute left-2 top-0 hidden -translate-y-[62%] whitespace-nowrap text-[0.105em] font-bold uppercase leading-none tracking-[0.16em] text-sail group-hover:block">
        coming soon
      </span>
    </span>
  );
}
