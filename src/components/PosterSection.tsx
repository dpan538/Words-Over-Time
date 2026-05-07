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
      className={`border-t border-ink/80 py-14 sm:py-18 lg:py-24 ${className}`}
    >
      <div className="mb-8 grid gap-3 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10">
        <p className="font-mono text-[0.72rem] font-black uppercase leading-5 tracking-[0.2em] text-fire">
          {eyebrow}
        </p>
        <div className="max-w-5xl">
          <h2 className="text-[clamp(1.22rem,2vw,1.95rem)] font-black leading-[1.02] tracking-normal">
            {title}
          </h2>
          {intro ? (
            <p className="mt-2 max-w-3xl text-[0.92rem] font-bold leading-6 text-ink/62">
              {intro}
            </p>
          ) : null}
        </div>
      </div>
      {children}
    </section>
  );
}
