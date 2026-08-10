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
    const isPrivacyWord = word.slug === "privacy";
    const hoverTone = isHubWord
      ? "hover:text-hub-teal"
      : isArtificialWord
        ? "hover:text-wine"
        : isPrivacyWord
          ? "hover:text-privacy-violet"
          : isBlueWord
            ? "hover:text-nice"
            : "hover:text-blaze";
    const labelTone = isHubWord
      ? "text-hub-space"
      : isArtificialWord
        ? "text-wine"
        : isPrivacyWord
          ? "text-privacy-violet"
          : isBlueWord
            ? "text-nice"
            : "text-blaze";
    const hoverLabel = word.hoverLabel ?? "word page";
    return (
      <Link
        href={word.href}
        className={`group relative inline-flex min-h-11 min-w-0 items-baseline py-1.5 text-current focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ink motion-reduce:transition-none min-[960px]:inline-block min-[960px]:min-h-0 min-[960px]:py-0 min-[960px]:text-ink min-[960px]:transition min-[960px]:duration-200 min-[960px]:decoration-[0.08em] min-[960px]:underline-offset-[0.13em] min-[960px]:hover:-translate-y-1 min-[960px]:hover:skew-x-[-3deg] min-[960px]:hover:underline min-[960px]:focus-visible:outline min-[960px]:focus-visible:outline-2 min-[960px]:focus-visible:outline-offset-4 min-[960px]:focus-visible:outline-current min-[960px]:focus-visible:ring-0 ${hoverTone}`}
      >
        <span
          className="min-w-0 whitespace-nowrap text-[1em] leading-[inherit] tracking-[-0.025em] min-[960px]:inline min-[960px]:text-[1em] min-[960px]:font-black min-[960px]:leading-[inherit] min-[960px]:tracking-normal"
        >
          {word.label}
        </span>
        <span className={`pointer-events-none absolute left-2 top-0 hidden -translate-y-[62%] text-[0.105em] font-bold uppercase leading-none tracking-[0.16em] min-[960px]:group-hover:block ${labelTone}`}>
          {hoverLabel}
        </span>
      </Link>
    );
  }

  return (
    <span className="group relative inline-flex min-w-0 items-baseline py-1.5 text-ink min-[960px]:inline-block min-[960px]:py-0 min-[960px]:transition min-[960px]:duration-200 min-[960px]:hover:-translate-y-0.5 min-[960px]:hover:skew-x-[-2deg] min-[960px]:hover:text-sail">
      <span className="min-w-0 whitespace-nowrap text-[1em] leading-[inherit] tracking-[-0.025em] min-[960px]:inline min-[960px]:text-[1em] min-[960px]:font-black min-[960px]:leading-[inherit] min-[960px]:tracking-normal">
        {word.label}
      </span>
      <span className="pointer-events-none absolute left-2 top-0 hidden -translate-y-[62%] whitespace-nowrap text-[0.105em] font-bold uppercase leading-none tracking-[0.16em] text-sail min-[960px]:group-hover:block">
        coming soon
      </span>
    </span>
  );
}
