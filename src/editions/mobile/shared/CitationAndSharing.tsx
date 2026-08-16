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
    "min-h-11 border-b border-ink/60 bg-transparent py-2 text-left font-mono text-[0.8125rem] font-semibold uppercase leading-5 tracking-[0.04em] hover:border-wine hover:text-wine focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-ink motion-reduce:transition-none min-[960px]:border min-[960px]:border-ink min-[960px]:px-3 min-[960px]:text-[0.7rem] min-[960px]:font-black min-[960px]:tracking-[0.1em] min-[960px]:transition min-[960px]:hover:bg-ink min-[960px]:hover:text-wheat";

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <button type="button" className={`${buttonClass} hidden min-[960px]:inline-block`} onClick={() => handleCopy(canonicalUrl, "Canonical page link copied.")}>
          Copy page link
        </button>
        <button type="button" className={buttonClass} onClick={() => handleCopy(citation, "Project citation copied.")}>
          Copy project citation
        </button>
        <button type="button" className={buttonClass} onClick={handleShare}>
          Share this study
        </button>
      </div>
      <p className="mt-4 select-all break-words text-sm font-normal leading-6 text-ink/85 min-[960px]:mt-3 min-[960px]:font-semibold min-[960px]:text-ink/[0.68]">{citation}</p>
      <p className="mt-2 min-h-5 font-mono text-[0.8125rem] font-semibold uppercase leading-5 tracking-[0.04em] text-fire min-[960px]:text-[0.68rem] min-[960px]:font-black min-[960px]:tracking-[0.09em] min-[960px]:text-[var(--study-text-accent)]" aria-live="polite">
        {status}
      </p>
    </div>
  );
}
