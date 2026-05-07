"use client";

import { useEffect, useMemo, useRef } from "react";
import type { InspectorEntry } from "@/types/inspector";

type MiniInspectorMenuProps = {
  entry?: InspectorEntry;
  position?: { x: number; y: number };
  pinned: boolean;
  onClose: () => void;
};

function shortType(entry: InspectorEntry) {
  return `${entry.visualType} / ${entry.elementType}`.replace("Relational Constellation / ", "");
}

function valueLabel(entry: InspectorEntry) {
  if (entry.scoreValue !== undefined) return `${entry.scoreType ?? "value"}: ${entry.scoreValue}`;
  if (entry.evidenceCount) return `count: ${entry.evidenceCount}`;
  return entry.scoreType ?? "available evidence";
}

export function MiniInspectorMenu({
  entry,
  position,
  pinned,
  onClose,
}: MiniInspectorMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!pinned) return undefined;

    const handlePointerDown = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) onClose();
    };

    window.addEventListener("pointerdown", handlePointerDown);
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, [onClose, pinned]);

  const coords = useMemo(() => {
    const fallback = { x: 28, y: 92 };
    const point = position ?? fallback;
    if (typeof window === "undefined") return point;
    return {
      x: Math.max(12, Math.min(point.x + 14, window.innerWidth - 312)),
      y: Math.max(12, Math.min(point.y + 14, window.innerHeight - 238)),
    };
  }, [position]);

  if (!entry) return null;

  return (
    <div
      ref={ref}
      className="fixed z-50 w-[18rem] border border-ink bg-wheat/96 px-3 py-3 font-mono text-ink shadow-[5px_5px_0_#050510] backdrop-blur"
      style={{ left: coords.x, top: coords.y }}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[0.58rem] font-black uppercase leading-4 tracking-[0.18em] text-fire">
          {pinned ? "pinned mark" : "hover mark"}
        </p>
        {pinned ? (
          <button
            type="button"
            onClick={onClose}
            className="border border-ink/35 px-1.5 py-0.5 text-[0.56rem] font-black uppercase tracking-[0.12em] transition hover:border-fire hover:text-fire"
          >
            close
          </button>
        ) : null}
      </div>

      <h3 className="mt-2 text-lg font-black leading-5">{entry.title}</h3>
      <dl className="mt-3 grid gap-1.5 text-[0.62rem] font-black uppercase leading-4 tracking-[0.1em]">
        <div className="grid grid-cols-[4.3rem_1fr] gap-2">
          <dt className="text-ink/45">type</dt>
          <dd>{shortType(entry)}</dd>
        </div>
        <div className="grid grid-cols-[4.3rem_1fr] gap-2">
          <dt className="text-ink/45">era</dt>
          <dd>{entry.period}</dd>
        </div>
        <div className="grid grid-cols-[4.3rem_1fr] gap-2">
          <dt className="text-ink/45">value</dt>
          <dd>{valueLabel(entry)}</dd>
        </div>
        <div className="grid grid-cols-[4.3rem_1fr] gap-2">
          <dt className="text-ink/45">source</dt>
          <dd>{entry.sourceCorpus}</dd>
        </div>
        <div className="grid grid-cols-[4.3rem_1fr] gap-2">
          <dt className="text-ink/45">caveat</dt>
          <dd>{entry.caveats[0] ?? "context-limited evidence"}</dd>
        </div>
      </dl>
    </div>
  );
}
