"use client";

import { useEffect, useState } from "react";

type SectionEntry = {
  id: string;
  num: string;
  label: string;
};

const sections: SectionEntry[] = [
  { id: "project-statement", num: "00", label: "Statement" },
  { id: "methodology", num: "01", label: "Methodology" },
  { id: "design-research", num: "02", label: "Design Research" },
  { id: "layered-evidence", num: "03", label: "Evidence" },
  { id: "source-ledger", num: "04", label: "Sources" },
  { id: "calculation-methods", num: "05", label: "Methods" },
  { id: "claim-boundaries", num: "06", label: "Position" },
  { id: "constraint-grid", num: "07", label: "Audit Grid" },
  { id: "open-source", num: "08", label: "GitHub" },
  { id: "licensing", num: "09", label: "Licensing" },
];

export function AboutSectionNav() {
  const [activeId, setActiveId] = useState<string>(sections[0].id);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveId(id);
        },
        { rootMargin: "-20% 0px -70% 0px", threshold: 0 },
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((observer) => observer.disconnect());
  }, []);

  const activeSection = sections.find((section) => section.id === activeId);

  return (
    <nav className="fixed left-0 top-0 z-30 hidden h-screen w-12 flex-col items-center border-r border-ink/14 bg-wheat/90 py-6 backdrop-blur lg:flex xl:w-14">
      <a
        href="#project-statement"
        className="mb-6 flex h-7 w-7 items-center justify-center border border-ink/30 transition hover:border-fire"
        title="Words Over Time"
      >
        <span className="font-mono text-[0.5rem] font-black uppercase tracking-[0.08em] text-fire">
          WOT
        </span>
      </a>

      <div className="flex flex-1 flex-col items-center gap-0">
        {sections.map((section, index) => {
          const isActive = activeId === section.id;

          return (
            <div key={section.id} className="flex flex-col items-center">
              <a
                href={`#${section.id}`}
                title={`${section.num} - ${section.label}`}
                className="group relative flex flex-col items-center gap-0"
              >
                <span
                  className={`h-[7px] w-[7px] rounded-full border transition-all duration-200 ${
                    isActive
                      ? "scale-125 border-fire bg-fire"
                      : "border-ink/30 bg-wheat group-hover:border-blaze group-hover:bg-blaze/20"
                  }`}
                />
                <span className="pointer-events-none absolute left-6 top-1/2 -translate-y-1/2 whitespace-nowrap opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                  <span className="block border border-ink bg-wheat px-2 py-1 shadow-[2px_2px_0_#050510]">
                    <span className="font-mono text-[0.6rem] font-black uppercase tracking-[0.12em] text-fire">
                      {section.num}
                    </span>
                    <span className="ml-2 font-mono text-[0.6rem] font-black uppercase tracking-[0.1em]">
                      {section.label}
                    </span>
                  </span>
                </span>
              </a>
              {index < sections.length - 1 ? (
                <div className="h-5 w-px bg-ink/10" />
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="mt-4">
        <span className="font-mono text-[0.5rem] font-black uppercase tracking-[0.1em] text-ink/28">
          {activeSection?.num ?? "00"}
        </span>
      </div>
    </nav>
  );
}
