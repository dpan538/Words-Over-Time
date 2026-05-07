"use client";

import type { ForeverEra, ForeverEraId } from "@/types/foreverRealData";

type EraSwitcherProps = {
  eras: ForeverEra[];
  selectedEra: ForeverEraId;
  onChange: (eraId: ForeverEraId) => void;
};

export function EraSwitcher({ eras, selectedEra, onChange }: EraSwitcherProps) {
  return (
    <div className="border-y border-ink py-4">
      <p className="mb-3 font-mono text-[0.64rem] font-black uppercase tracking-[0.18em] text-fire">
        era switcher / filters every visual layer
      </p>
      <div className="flex flex-wrap gap-2">
        {eras.map((era) => {
          const active = era.id === selectedEra;

          return (
            <button
              key={era.id}
              type="button"
              onClick={() => onChange(era.id)}
              className={`border px-3 py-2 font-mono text-[0.68rem] font-black uppercase tracking-[0.12em] transition duration-200 ${
                active
                  ? "border-ink bg-ink text-wheat"
                  : "border-ink/40 bg-wheat text-ink hover:border-blaze hover:bg-blaze hover:text-wheat"
              }`}
              title={era.note}
            >
              {era.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
