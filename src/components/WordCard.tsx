import Link from "next/link";
import type { Word } from "@/types/word";

type WordCardProps = {
  word: Word;
};

export function WordCard({ word }: WordCardProps) {
  if (word.href) {
    return (
      <Link
        href={word.href}
        className="group relative inline-block text-blaze decoration-[0.08em] underline-offset-[0.13em] transition duration-200 hover:-translate-y-1 hover:skew-x-[-4deg] hover:text-wine hover:underline"
      >
        {word.label}
        <span className="absolute -top-5 left-1 hidden text-[0.11em] font-bold uppercase tracking-[0.14em] text-wine group-hover:block">
          demo word
        </span>
      </Link>
    );
  }

  return (
    <span className="group relative inline-block cursor-not-allowed text-ink/42 transition duration-200 hover:-translate-y-0.5 hover:skew-x-[-3deg] hover:text-nice">
      {word.label}
      <span className="pointer-events-none absolute -top-5 left-1 hidden whitespace-nowrap text-[0.11em] font-bold uppercase tracking-[0.14em] text-nice group-hover:block">
        coming soon
      </span>
    </span>
  );
}
