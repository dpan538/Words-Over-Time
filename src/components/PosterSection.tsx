"use client";

import type { ReactNode } from "react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

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
  const revealRef = useScrollReveal();

  return (
    <section
      ref={revealRef}
      className={`scroll-reveal pb-0 pt-8 sm:pt-9 lg:pt-10 ${className}`}
    >
      <div className="mb-8 grid gap-3 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10">
        <p className="font-mono text-[0.82rem] font-black uppercase leading-5 tracking-[0.16em] text-fire">
          {eyebrow}
        </p>
        <div className="max-w-5xl">
          <h2 className="text-[clamp(1.22rem,2vw,1.95rem)] font-black leading-[1.02] tracking-normal">
            {title}
          </h2>
          {intro ? (
            <p className="mt-2 max-w-[1040px] text-[1.08rem] leading-[1.55] text-ink/68">
              {intro}
            </p>
          ) : null}
        </div>
      </div>
      {children}
    </section>
  );
}
