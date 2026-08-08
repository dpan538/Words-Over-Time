"use client";

import { useState } from "react";

type FigureShareActionsProps = {
  anchor: string;
  title: string;
};

type ShareStatus = "idle" | "copied" | "unavailable";

function getSectionUrl(anchor: string) {
  const url = new URL(window.location.href);
  url.search = "";
  url.hash = anchor;
  return url.toString();
}

async function copyText(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return true;
  }

  const field = document.createElement("textarea");
  field.value = value;
  field.setAttribute("readonly", "");
  field.style.position = "fixed";
  field.style.left = "-9999px";
  document.body.appendChild(field);
  field.select();
  const copied = document.execCommand("copy");
  field.remove();
  return copied;
}

export function FigureShareActions({ anchor, title }: FigureShareActionsProps) {
  const [status, setStatus] = useState<ShareStatus>("idle");

  const copyLink = async () => {
    try {
      const copied = await copyText(getSectionUrl(anchor));
      setStatus(copied ? "copied" : "unavailable");
    } catch {
      setStatus("unavailable");
    }
  };

  const shareLink = async () => {
    const url = getSectionUrl(anchor);

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }

    try {
      const copied = await copyText(url);
      setStatus(copied ? "copied" : "unavailable");
    } catch {
      setStatus("unavailable");
    }
  };

  return (
    <div className="border-t border-ink/20 pt-3">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={copyLink}
          className="min-h-11 border border-ink bg-wheat px-4 py-2 font-mono text-[0.7rem] font-black uppercase tracking-[0.1em] text-ink outline-none transition-colors hover:bg-ink hover:text-wheat focus-visible:ring-2 focus-visible:ring-fire focus-visible:ring-offset-2 focus-visible:ring-offset-wheat motion-reduce:transition-none"
        >
          Copy #{anchor} figure link
        </button>
        <button
          type="button"
          onClick={shareLink}
          className="min-h-11 border border-ink bg-ink px-4 py-2 font-mono text-[0.7rem] font-black uppercase tracking-[0.1em] text-wheat outline-none transition-colors hover:bg-fire focus-visible:ring-2 focus-visible:ring-fire focus-visible:ring-offset-2 focus-visible:ring-offset-wheat motion-reduce:transition-none"
        >
          Share figure
        </button>
      </div>
      <p className="mt-2 min-h-5 font-mono text-[0.68rem] font-black uppercase leading-5 tracking-[0.08em] text-ink/60" role="status" aria-live="polite">
        {status === "copied"
          ? "Section link copied."
          : status === "unavailable"
            ? `Copy unavailable. Add #${anchor} to this page URL.`
            : "Links point to this exact figure."}
      </p>
    </div>
  );
}
