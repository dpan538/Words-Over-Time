"use client";

import { useState } from "react";

const columns = [
  { num: "01", label: "frequency", color: "#F06B04" },
  { num: "02", label: "attestation", color: "#F06B04" },
  { num: "03", label: "variant", color: "#1570AC" },
  { num: "04", label: "context", color: "#1570AC" },
  { num: "05", label: "confidence", color: "#050510" },
  { num: "06", label: "source", color: "#050510" },
];

const descriptions = [
  "Google Ngram frequency signal, 1500-2022",
  "Dictionary and lexical earliest attestation",
  "Orthographic variants and spelling history",
  "Gutenberg + Wikinews contextual evidence",
  "Confidence label: high / medium / low",
  "Source corpus and rights status",
];

export function GridRuler() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="sticky top-0 z-20 border-b border-ink/18 bg-wheat/95 backdrop-blur">
      <button
        type="button"
        className="grid w-full cursor-pointer select-none text-left"
        style={{ gridTemplateColumns: "repeat(6, minmax(0, 1fr))" }}
        onClick={() => setExpanded((value) => !value)}
        title="Toggle grid legend"
      >
        {columns.map((col, index) => (
          <span
            key={col.num}
            className={`flex min-w-0 items-center gap-1.5 border-ink/10 px-2 py-2.5 sm:px-3 ${
              index < columns.length - 1 ? "border-r" : ""
            }`}
          >
            <span
              className="h-1.5 w-1.5 flex-shrink-0"
              style={{ backgroundColor: col.color, opacity: 0.7 }}
            />
            <span className="font-mono text-[0.85rem] font-black uppercase tracking-[0.14em] text-ink/42">
              {col.num}
            </span>
            <span
              className={`truncate font-mono text-[0.85rem] font-black uppercase tracking-[0.1em] text-ink/34 transition-opacity duration-200 ${
                expanded ? "opacity-100" : "opacity-0 sm:opacity-100"
              }`}
            >
              {col.label}
            </span>
          </span>
        ))}
      </button>

      {expanded ? (
        <div
          className="grid border-t border-ink/10"
          style={{ gridTemplateColumns: "repeat(6, minmax(0, 1fr))" }}
        >
          {descriptions.map((desc, index) => (
            <div
              key={desc}
              className={`px-2 py-3 font-mono text-[0.85rem] font-bold leading-5 text-ink/48 sm:px-3 ${
                index < descriptions.length - 1 ? "border-r border-ink/10" : ""
              }`}
            >
              {desc}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
