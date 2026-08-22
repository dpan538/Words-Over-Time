"use client";

import { useState } from "react";
import styles from "./mobile-about.module.css";

type CopyStatus = "idle" | "copied" | "unavailable";

async function copyText(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return true;
  }

  const field = document.createElement("textarea");
  field.value = value;
  field.setAttribute("readonly", "");
  field.style.position = "fixed";
  field.style.insetInlineStart = "-9999px";
  document.body.appendChild(field);
  field.select();
  const copied = document.execCommand("copy");
  field.remove();
  return copied;
}

export function MobileCitationCopy({ citation }: { citation: string }) {
  const [status, setStatus] = useState<CopyStatus>("idle");

  const copyCitation = async () => {
    try {
      setStatus((await copyText(citation)) ? "copied" : "unavailable");
    } catch {
      setStatus("unavailable");
    }
  };

  return (
    <div className={styles.citationExample}>
      <p className={styles.citationExampleLabel}>Example</p>
      <p className={styles.citationExampleText}>{citation}</p>
      <button className={styles.copyButton} type="button" onClick={copyCitation}>
        {status === "copied" ? "Copied" : status === "unavailable" ? "Copy unavailable" : "Copy example"}
      </button>
    </div>
  );
}
