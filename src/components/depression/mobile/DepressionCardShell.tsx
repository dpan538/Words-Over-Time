"use client";

import { memo, type KeyboardEvent } from "react";
import type { DepressionMobileChapter } from "@/types/depressionMobileResearch";
import { DepressionChapterVisualization } from "./DepressionChapterVisualizations";
import styles from "./mobile-depression.module.css";

type Face = "front" | "back";

function SwitchGlyph() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18.5 7.5H8.75C5.85 7.5 4 9.1 4 11.75" />
      <path d="m15.4 4.4 3.1 3.1-3.1 3.1" />
      <path d="M5.5 16.5h9.75c2.9 0 4.75-1.6 4.75-4.25" />
      <path d="m8.6 19.6-3.1-3.1 3.1-3.1" />
    </svg>
  );
}

export const DepressionPersistentCard = memo(function DepressionPersistentCard({
  activeChapter,
  face,
  visible,
  onToggle,
}: {
  activeChapter: DepressionMobileChapter;
  face: Face;
  visible: boolean;
  onToggle: () => void;
}) {
  const interactive = visible;

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (!interactive || (event.key !== "Enter" && event.key !== " ")) return;
    event.preventDefault();
    onToggle();
  };

  const action = face === "front" ? "Show the detailed chart and narrative" : "Return to the summary chart and narrative";

  return (
    <article
      className={styles.persistentCard}
      data-depression-card="shell"
      data-active-chapter={activeChapter.id}
      data-visible={visible ? "true" : "false"}
      data-content-phase="idle"
      role="button"
      tabIndex={interactive ? 0 : -1}
      aria-hidden={!visible}
      aria-disabled={!interactive}
      aria-label={`${action} for ${activeChapter.title}`}
      aria-pressed={face === "back"}
      onClick={() => { if (interactive) onToggle(); }}
      onKeyDown={onKeyDown}
    >
      <div key={activeChapter.id} className={styles.cardContent}>
        <div className={styles.cardFace} data-active={face === "front" ? "true" : "false"} data-depression-card-face="front" aria-hidden={face !== "front"}>
          <DepressionChapterVisualization chart={activeChapter.summary} />
        </div>
        <div className={styles.cardFace} data-active={face === "back" ? "true" : "false"} data-depression-card-face="back" aria-hidden={face !== "back"}>
          <DepressionChapterVisualization chart={activeChapter.detail} />
        </div>
      </div>
      <span className={styles.flipGlyph} data-face={face} aria-hidden="true"><SwitchGlyph /></span>
    </article>
  );
});
