"use client";

import type { ForeverEra, ForeverEraId } from "@/types/foreverRealData";

type EraSwitcherProps = {
  eras: ForeverEra[];
  selectedEra: ForeverEraId;
  onChange: (eraId: ForeverEraId) => void;
};

export function EraSwitcher({ eras, selectedEra, onChange }: EraSwitcherProps) {
  return (
    <div className="border-y border-ink py-3">
      <div className="mb-3 flex items-baseline gap-4">
        <p className="font-mono text-[0.76rem] font-black uppercase tracking-[0.16em] text-fire">
          era
        </p>
        <p className="font-mono text-[0.74rem] font-black uppercase tracking-[0.12em] text-ink/46">
          filters all panels
        </p>
      </div>
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4 xl:grid-cols-8">
        {eras.map((era) => {
          const active = era.id === selectedEra;

          return (
            <button
              key={era.id}
              type="button"
              onClick={() => onChange(era.id)}
              className={`group flex min-h-[3.05rem] min-w-0 flex-col items-start border px-2.5 py-2 font-mono text-[0.72rem] font-black uppercase tracking-[0.08em] transition duration-200 ${
                active
                  ? "border-ink bg-ink text-wheat"
                  : "border-ink/40 bg-wheat text-ink hover:border-blaze hover:bg-blaze hover:text-wheat"
              }`}
              title={era.note}
            >
              {era.label}
              {era.note ? (
                <span
                  className={`mt-1 max-w-full text-left text-[0.64rem] font-bold normal-case leading-3 tracking-normal opacity-0 transition-opacity group-hover:opacity-100 ${
                    active ? "text-wheat/60 opacity-60" : "text-ink/50 group-hover:text-wheat/70"
                  }`}
                >
                  {era.note}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
