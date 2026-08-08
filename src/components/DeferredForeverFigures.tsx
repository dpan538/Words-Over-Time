"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type ReactNode } from "react";

const InteractiveInstitutionalDoubt = dynamic(
  () => import("@/components/ForeverInstitutionalDoubt").then((module) => module.ForeverInstitutionalDoubt),
  { ssr: false },
);

const InteractiveModernCapture = dynamic(
  () => import("@/components/ForeverInstitutionalDoubt").then((module) => module.ForeverModernCaptureSupplement),
  { ssr: false },
);

const doubtPreview = [
  {
    evidence: "Forever Stamp / 2007",
    source: "USPS institutional product name",
    boundary: "Permanent validity is an administrative promise, not a timeless meaning.",
  },
  {
    evidence: "PFAS / forever chemicals",
    source: "EPA risk vocabulary",
    boundary: "Here forever names unwanted persistence, not chosen devotion or duration.",
  },
  {
    evidence: "online forever",
    source: "modern open-news context",
    boundary: "Persistence may be produced by platforms, caches, and archives rather than memory.",
  },
  {
    evidence: "Gutenberg + Ngram trace",
    source: "book-corpus survival",
    boundary: "What survives in print is not the same as what was most meaningful in speech.",
  },
] as const;

function NearViewportFigure({ children, fallback }: { children: ReactNode; fallback: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const node = rootRef.current;
    if (!node || ready) return undefined;
    if (!("IntersectionObserver" in window)) {
      setReady(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        setReady(true);
        observer.disconnect();
      },
      { rootMargin: "600px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [ready]);

  return <div ref={rootRef}>{ready ? children : fallback}</div>;
}

function InstitutionalDoubtPreview() {
  return (
    <figure className="overflow-hidden border border-ink/[0.18] bg-[#fbf8ee]" aria-labelledby="institutional-doubt-preview-title">
      <div className="grid border-b border-ink/[0.18] lg:grid-cols-[22rem_1fr]">
        <div className="border-b border-ink/[0.18] p-6 lg:border-b-0 lg:border-r">
          <p className="font-mono text-[0.9rem] font-black uppercase tracking-[0.16em] text-fire">
            chart 02 / static evidence state
          </p>
          <h3 id="institutional-doubt-preview-title" className="mt-4 text-[clamp(1.9rem,2.9vw,3.6rem)] font-black leading-[0.95] text-ink">
            Evidence does not settle forever.
          </h3>
          <p className="mt-5 text-base leading-7 text-ink/[0.68]">
            The source boundaries remain readable before the optional 3D evidence instrument loads near the viewport.
          </p>
        </div>
        <div className="grid min-h-[680px] content-center gap-4 bg-[linear-gradient(90deg,rgba(5,5,16,0.055)_1px,transparent_1px),linear-gradient(180deg,rgba(5,5,16,0.045)_1px,transparent_1px)] bg-[size:44px_44px] p-6 sm:grid-cols-2">
          {doubtPreview.map((item) => (
            <div key={item.evidence} className="border border-ink/25 bg-wheat/90 p-4">
              <p className="font-mono text-sm font-black uppercase leading-5 tracking-[0.08em]">{item.evidence}</p>
              <p className="mt-2 font-mono text-[0.7rem] font-black uppercase leading-5 tracking-[0.07em] text-ink/50">{item.source}</p>
              <p className="mt-3 text-sm leading-6 text-ink/70">{item.boundary}</p>
            </div>
          ))}
        </div>
      </div>
      <figcaption className="grid lg:grid-cols-4">
        {doubtPreview.map((item, index) => (
          <span key={item.evidence} className={`min-h-[200px] border-ink/[0.18] p-5 ${index < 3 ? "border-b lg:border-b-0 lg:border-r" : ""}`}>
            <span className="block font-mono text-[0.84rem] font-black uppercase tracking-[0.14em] text-fire">evidence {String(index + 1).padStart(2, "0")}</span>
            <span className="mt-4 block font-mono text-base font-black uppercase leading-6 tracking-[0.08em]">{item.evidence}</span>
            <span className="mt-3 block font-mono text-[0.78rem] font-black uppercase leading-5 tracking-[0.08em] text-ink/60">{item.source}</span>
            <span className="mt-4 block text-base leading-7 text-ink/[0.68]">{item.boundary}</span>
          </span>
        ))}
      </figcaption>
    </figure>
  );
}

function ModernCapturePreview() {
  return (
    <figure className="mt-6 overflow-hidden border border-ink/[0.18] bg-[#020204] text-wheat" aria-labelledby="modern-capture-preview-title">
      <div className="flex min-h-[820px] flex-col justify-center px-5 py-10 sm:px-10">
        <p className="font-mono text-[0.72rem] font-black uppercase tracking-[0.18em] text-[#f3efe1]/60">static first state / optional signal field loads nearby</p>
        <h3 id="modern-capture-preview-title" className="mt-4 max-w-4xl text-[clamp(1.8rem,4vw,4.5rem)] font-black leading-[0.95]">
          Historical meanings and modern permanence claims remain separate layers.
        </h3>
        <ul className="mt-8 grid border-l border-t border-[#f3efe1]/[0.35] sm:grid-cols-2 lg:grid-cols-4">
          {["devotional permanence / 1600s–1700s", "literary vow / 1800–1899", "memory and loss / 1850–1930", "archive survival / 1900–2022", "institutional validity / 2007", "chemical persistence / 2010s–2026", "platform retention / 2000s–2026"].map((label) => (
            <li key={label} className="border-b border-r border-[#f3efe1]/[0.35] p-4 font-mono text-[0.72rem] font-black uppercase leading-5 tracking-[0.08em]">{label}</li>
          ))}
        </ul>
        <p className="mt-6 max-w-3xl text-sm leading-6 text-[#f3efe1]/[0.68]">
          These bands combine authored semantic groupings with source-specific signals; visual distance is not proof of chronology or causation.
        </p>
      </div>
      <figcaption className="border-t border-[#f3efe1]/[0.24] px-5 py-4 font-mono text-[0.68rem] font-black uppercase leading-5 tracking-[0.08em] text-[#f3efe1]/60">
        Static evidence state. The interactive SVG enhancement is requested only as this figure approaches the viewport.
      </figcaption>
    </figure>
  );
}

export function DeferredForeverInstitutionalDoubt() {
  return (
    <NearViewportFigure fallback={<InstitutionalDoubtPreview />}>
      <InteractiveInstitutionalDoubt />
    </NearViewportFigure>
  );
}

export function DeferredForeverModernCaptureSupplement() {
  return (
    <NearViewportFigure fallback={<ModernCapturePreview />}>
      <InteractiveModernCapture />
    </NearViewportFigure>
  );
}
