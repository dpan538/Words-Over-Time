"use client";

import { useState } from "react";

type CitationAndSharingProps = {
  canonicalUrl: string;
  citation: string;
  title: string;
};

async function copyText(value: string) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
    // Continue to the local fallback when Clipboard API permission is denied.
  }

  const field = document.createElement("textarea");
  field.value = value;
  field.setAttribute("readonly", "");
  field.style.position = "fixed";
  field.style.opacity = "0";
  document.body.appendChild(field);
  field.select();
  const copied = document.execCommand("copy");
  field.remove();
  return copied;
}

export function CitationAndSharing({ canonicalUrl, citation, title }: CitationAndSharingProps) {
  const [status, setStatus] = useState("");

  const handleCopy = async (value: string, success: string) => {
    try {
      const copied = await copyText(value);
      setStatus(copied ? success : "Copy failed. Select the citation text below instead.");
    } catch {
      setStatus("Copy failed. Select the citation text below instead.");
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url: canonicalUrl });
        setStatus("Share sheet opened.");
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    await handleCopy(canonicalUrl, "Canonical page link copied.");
  };

  const buttonClass =
    "min-h-11 border border-ink bg-transparent px-3 py-2 text-left font-mono text-[0.7rem] font-black uppercase leading-5 tracking-[0.1em] transition hover:bg-ink hover:text-wheat focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-ink";

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <button type="button" className={buttonClass} onClick={() => handleCopy(canonicalUrl, "Canonical page link copied.")}>
          Copy page link
        </button>
        <button type="button" className={buttonClass} onClick={() => handleCopy(citation, "Project citation copied.")}>
          Copy project citation
        </button>
        <button type="button" className={buttonClass} onClick={handleShare}>
          Share this study
        </button>
      </div>
      <p className="mt-3 select-all text-sm font-semibold leading-6 text-ink/[0.68]">{citation}</p>
      <p className="mt-2 min-h-5 font-mono text-[0.68rem] font-black uppercase tracking-[0.09em] text-[var(--study-text-accent)]" aria-live="polite">
        {status}
      </p>
    </div>
  );
}
