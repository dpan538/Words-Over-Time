import type { ReactNode } from "react";

type PosterSectionProps = {
  eyebrow: string;
  title: string;
  intro?: string;
  children: ReactNode;
  className?: string;
};

export function PosterSection({
  eyebrow,
  title,
  intro,
  children,
  className = "",
}: PosterSectionProps) {
  return (
    <section
      className={`border-t border-ink/80 py-10 sm:py-14 ${className}`}
    >
      <div className="mb-7 grid gap-4 lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-10">
        <p className="font-mono text-[0.68rem] font-black uppercase leading-5 tracking-[0.2em] text-fire">
          {eyebrow}
        </p>
        <div className="max-w-5xl">
          <h2 className="text-[clamp(2.2rem,5vw,6.4rem)] font-black leading-[0.88] tracking-normal">
            {title}
          </h2>
          {intro ? (
            <p className="mt-4 max-w-3xl text-sm font-bold leading-6 text-ink/68 sm:text-base">
              {intro}
            </p>
          ) : null}
        </div>
      </div>
      {children}
    </section>
  );
}
