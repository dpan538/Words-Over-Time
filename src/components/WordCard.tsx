import Link from "next/link";
import { routeByPath } from "@/lib/site";
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
    const route = routeByPath(word.href);
    const summary = route?.summary ?? route?.description;
    const mobileWordSize =
      word.slug === "intelligence"
        ? "text-[clamp(2rem,12vw,3.5rem)]"
        : "text-[clamp(2.4rem,13.5vw,4.25rem)]";

    return (
      <Link
        href={word.href}
        className={`group relative block min-h-11 min-w-0 py-4 text-ink transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current lg:inline-block lg:min-h-0 lg:py-0 lg:decoration-[0.08em] lg:underline-offset-[0.13em] lg:hover:-translate-y-1 lg:hover:skew-x-[-3deg] lg:hover:underline ${hoverTone}`}
      >
        <span
          className={`block min-w-0 break-words leading-[0.86] tracking-[-0.04em] lg:inline lg:text-[1em] lg:leading-[inherit] lg:tracking-normal ${mobileWordSize}`}
        >
          {word.label}
        </span>
        <span className="mt-3 grid gap-2 lg:hidden">
          {summary ? (
            <span className="max-w-2xl text-[0.92rem] font-bold leading-5 tracking-normal text-ink/[0.68]">
              {summary}
            </span>
          ) : null}
          <span className={`font-mono text-[0.7rem] font-black uppercase leading-4 tracking-[0.12em] ${labelTone}`}>
            Available study / source notes + claim boundaries
          </span>
        </span>
        <span className={`pointer-events-none absolute left-2 top-0 hidden -translate-y-[62%] text-[0.105em] font-bold uppercase leading-none tracking-[0.16em] lg:group-hover:block ${labelTone}`}>
          {hoverLabel}
        </span>
      </Link>
    );
  }

  return (
    <span className="group relative block min-w-0 py-4 text-ink lg:inline-block lg:py-0 lg:transition lg:duration-200 lg:hover:-translate-y-0.5 lg:hover:skew-x-[-2deg] lg:hover:text-sail">
      <span className="block min-w-0 break-words text-[clamp(2rem,12vw,3.5rem)] leading-[0.86] tracking-[-0.04em] lg:inline lg:text-[1em] lg:leading-[inherit] lg:tracking-normal">
        {word.label}
      </span>
      <span className="mt-3 grid gap-2 lg:hidden">
        <span className="max-w-2xl text-[0.92rem] font-bold leading-5 tracking-normal text-ink/60">
          A future source-led study; no research conclusion is published yet.
        </span>
        <span className="font-mono text-[0.7rem] font-black uppercase leading-4 tracking-[0.12em] text-sail">
          Coming soon
        </span>
      </span>
      <span className="pointer-events-none absolute left-2 top-0 hidden -translate-y-[62%] whitespace-nowrap text-[0.105em] font-bold uppercase leading-none tracking-[0.16em] text-sail lg:group-hover:block">
        coming soon
      </span>
    </span>
  );
}
