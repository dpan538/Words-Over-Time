"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
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

export function DepressionPersistentCard({
  activeChapter,
  face,
  visible,
  onToggle,
}: {
  activeChapter?: DepressionMobileChapter;
  face: Face;
  visible: boolean;
  onToggle: () => void;
}) {
  const [renderedChapter, setRenderedChapter] = useState(activeChapter);
  const [contentPhase, setContentPhase] = useState<"idle" | "exit" | "enter">("idle");
  const transactionRef = useRef(0);
  const timerRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!activeChapter || activeChapter.id === renderedChapter?.id) return;
    if (!renderedChapter) {
      setRenderedChapter(activeChapter);
      setContentPhase("idle");
      return;
    }
    const transaction = ++transactionRef.current;
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    setContentPhase("exit");
    timerRef.current = window.setTimeout(() => {
      if (transaction !== transactionRef.current) return;
      setRenderedChapter(activeChapter);
      setContentPhase("enter");
      frameRef.current = requestAnimationFrame(() => {
        frameRef.current = requestAnimationFrame(() => {
          if (transaction === transactionRef.current) setContentPhase("idle");
        });
      });
    }, 170);
  }, [activeChapter, renderedChapter?.id]);

  useEffect(() => () => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
  }, []);

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (!visible || (event.key !== "Enter" && event.key !== " ")) return;
    event.preventDefault();
    onToggle();
  };

  const action = face === "front" ? "Show the detailed chart and narrative" : "Return to the summary chart and narrative";

  return (
    <article
      className={styles.persistentCard}
      data-depression-card="shell"
      data-visible={visible ? "true" : "false"}
      data-content-phase={contentPhase}
      role="button"
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
      aria-label={`${action}${renderedChapter ? ` for ${renderedChapter.title}` : ""}`}
      aria-pressed={face === "back"}
      onClick={() => { if (visible) onToggle(); }}
      onKeyDown={onKeyDown}
    >
      {renderedChapter ? (
        <div className={styles.cardContent}>
          <div className={styles.cardFace} data-active={face === "front" ? "true" : "false"} data-depression-card-face="front" aria-hidden={face !== "front"}>
            <DepressionChapterVisualization chart={renderedChapter.summary} />
          </div>
          <div className={styles.cardFace} data-active={face === "back" ? "true" : "false"} data-depression-card-face="back" aria-hidden={face !== "back"}>
            <DepressionChapterVisualization chart={renderedChapter.detail} />
          </div>
        </div>
      ) : null}
      <span className={styles.flipGlyph} data-face={face} aria-hidden="true"><SwitchGlyph /></span>
    </article>
  );
}
