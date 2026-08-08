"use client";

import { useEffect, useMemo, useRef, type CSSProperties } from "react";
import type { InspectorSummary } from "@/types/inspector";

type MiniInspectorMenuProps = {
  entry?: InspectorSummary;
  position?: { x: number; y: number };
  pinned: boolean;
  onClose: () => void;
};

function shortType(entry: InspectorSummary) {
  return `${entry.visualType} / ${entry.elementType}`.replace("Relational Constellation / ", "");
}

function valueLabel(entry: InspectorSummary) {
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
  const onCloseRef = useRef(onClose);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!pinned) return undefined;

    const handlePointerDown = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) onCloseRef.current();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }

      if (event.key !== "Tab" || !ref.current) return;
      const focusable = Array.from(
        ref.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    window.requestAnimationFrame(() => ref.current?.querySelector<HTMLElement>("button")?.focus());
    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
      previousFocusRef.current?.focus();
      previousFocusRef.current = null;
    };
  }, [entry?.id, pinned]);

  const coords = useMemo(() => {
    const fallback = { x: 28, y: 92 };
    const point = position ?? fallback;
    if (typeof window === "undefined") return point;
    return {
      x: Math.max(12, Math.min(point.x + 14, window.innerWidth - 344)),
      y: Math.max(12, Math.min(point.y + 14, window.innerHeight - 238)),
    };
  }, [position]);

  if (!entry) return null;

  return (
    <div
      ref={ref}
      role={pinned ? "dialog" : "status"}
      aria-modal={pinned || undefined}
      aria-labelledby="mini-inspector-title"
      aria-live={pinned ? undefined : "polite"}
      className={`fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-50 max-h-[min(72vh,34rem)] overflow-y-auto border border-ink bg-wheat/95 px-3.5 py-3.5 font-mono text-ink shadow-[5px_5px_0_#050510] backdrop-blur sm:bottom-auto sm:left-[var(--inspector-x)] sm:right-auto sm:top-[var(--inspector-y)] sm:w-[20rem] ${pinned ? "" : "pointer-events-none"}`}
      style={
        {
          "--inspector-x": `${coords.x}px`,
          "--inspector-y": `${coords.y}px`,
        } as CSSProperties
      }
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[0.72rem] font-black uppercase leading-5 tracking-[0.14em] text-fire">
          {pinned ? "pinned mark" : "hover mark"}
        </p>
        {pinned ? (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close evidence inspector"
            className="inline-flex min-h-11 min-w-11 items-center justify-center border border-ink/50 px-3 py-2 text-[0.68rem] font-black uppercase tracking-[0.1em] transition hover:border-fire hover:text-fire focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            close
          </button>
        ) : null}
      </div>

      <h3 id="mini-inspector-title" className="mt-2 text-lg font-black leading-5">{entry.title}</h3>
      <dl className="mt-3 grid gap-2 text-[0.76rem] font-black uppercase leading-5 tracking-[0.08em]">
        <div className="grid grid-cols-[4.8rem_1fr] gap-2">
          <dt className="text-ink/60">type</dt>
          <dd>{shortType(entry)}</dd>
        </div>
        <div className="grid grid-cols-[4.8rem_1fr] gap-2">
          <dt className="text-ink/60">era</dt>
          <dd>{entry.period}</dd>
        </div>
        <div className="grid grid-cols-[4.8rem_1fr] gap-2">
          <dt className="text-ink/60">value</dt>
          <dd>{valueLabel(entry)}</dd>
        </div>
        <div className="grid grid-cols-[4.8rem_1fr] gap-2">
          <dt className="text-ink/60">source</dt>
          <dd>{entry.sourceCorpus}</dd>
        </div>
        <div className="grid grid-cols-[4.8rem_1fr] gap-2">
          <dt className="text-ink/60">caveat</dt>
          <dd>{entry.caveats[0] ?? "context-limited evidence"}</dd>
        </div>
      </dl>
    </div>
  );
}
