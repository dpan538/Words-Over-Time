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
    const mobileWordSize =
      word.slug === "intelligence"
        ? "text-[clamp(2.55rem,13vw,4.3rem)]"
        : "text-[clamp(3.15rem,15.5vw,5.1rem)]";

    return (
      <Link
        href={word.href}
        className={`group relative inline-flex min-h-11 min-w-0 items-baseline py-1.5 text-ink transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current min-[960px]:inline-block min-[960px]:min-h-0 min-[960px]:py-0 min-[960px]:decoration-[0.08em] min-[960px]:underline-offset-[0.13em] min-[960px]:hover:-translate-y-1 min-[960px]:hover:skew-x-[-3deg] min-[960px]:hover:underline ${hoverTone}`}
      >
        <span
          className={`min-w-0 break-words font-black leading-[0.84] tracking-[-0.05em] min-[960px]:inline min-[960px]:text-[1em] min-[960px]:leading-[inherit] min-[960px]:tracking-normal ${mobileWordSize}`}
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
      <span className="min-w-0 break-words text-[clamp(2.55rem,13vw,4.3rem)] font-black leading-[0.84] tracking-[-0.05em] min-[960px]:inline min-[960px]:text-[1em] min-[960px]:leading-[inherit] min-[960px]:tracking-normal">
        {word.label}
      </span>
      <span className="pointer-events-none absolute left-2 top-0 hidden -translate-y-[62%] whitespace-nowrap text-[0.105em] font-bold uppercase leading-none tracking-[0.16em] text-sail min-[960px]:group-hover:block">
        coming soon
      </span>
    </span>
  );
}
