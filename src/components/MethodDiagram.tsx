"use client";

import { useState } from "react";

const layers = [
  {
    number: "01",
    label: "frequency",
    shortLabel: "corpus",
    description: "Long-run corpus signal.",
    colorClass: "bg-nice",
    stroke: "#1570AC",
    top: "top-[70%]",
    left: "left-[13%]",
    line: "M58 198 L158 132",
  },
  {
    number: "02",
    label: "attestation",
    shortLabel: "lexicon",
    description: "Dictionary and lexical proof.",
    colorClass: "bg-blaze",
    stroke: "#F06B04",
    top: "top-[46%]",
    left: "left-[38%]",
    line: "M158 132 L265 78",
  },
  {
    number: "03",
    label: "scan evidence",
    shortLabel: "scans",
    description: "Inspectable page evidence.",
    colorClass: "bg-sun",
    stroke: "#FBB728",
    top: "top-[24%]",
    left: "left-[63%]",
    line: "M265 78 L344 54",
  },
  {
    number: "04",
    label: "annotation",
    shortLabel: "notes",
    description: "Interpretive uncertainty notes.",
    colorClass: "bg-sail",
    stroke: "#036C17",
    top: "top-[16%]",
    left: "left-[82%]",
    line: "M344 54 L372 42",
  },
];

export function MethodDiagram() {
  const [active, setActive] = useState(0);

  return (
    <div
      className="grid border border-ink/60"
      onMouseLeave={() => setActive(0)}
    >
      {layers.map((layer, index) => {
        const isActive = active === index;

        return (
          <button
            key={layer.number}
            type="button"
            onMouseEnter={() => setActive(index)}
            onFocus={() => setActive(index)}
            className={`grid grid-cols-[3.5rem_1fr] items-center border-ink/35 text-left transition duration-200 ${
              index < layers.length - 1 ? "border-b" : ""
            } ${isActive ? "bg-white/30" : "hover:bg-white/15"}`}
          >
            <span className="flex items-center gap-2 border-r border-ink/35 p-3 text-sm font-black uppercase tracking-[0.12em] text-fire">
              <span
                className={`h-3 w-3 border border-ink ${layer.colorClass}`}
              />
              {layer.number}
            </span>
            <span className="p-3">
              <span className="block text-sm font-black uppercase tracking-[0.12em]">
                {layer.label}
              </span>
              <span
                className={`mt-1 block text-[0.72rem] font-bold leading-4 transition duration-200 ${
                  isActive ? "text-ink/74" : "text-ink/50"
                }`}
              >
                {layer.description}
              </span>
            </span>
          </button>
        );
      })}
      <p className="border-t border-ink/35 p-3 text-sm font-bold leading-5 text-ink/66">
        Not a general search engine. Each word is selected, structured, and
        annotated before it becomes a public entry.
      </p>
    </div>
  );
}
