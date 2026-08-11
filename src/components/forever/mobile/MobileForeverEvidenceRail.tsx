"use client";

import { useRef, type SyntheticEvent } from "react";
import type { ForeverMobileRailCard } from "@/types/foreverMobileAnalysis";
import styles from "./mobile-forever.module.css";

type MobileForeverEvidenceRailProps = {
  railId: "rail-a" | "rail-b" | "rail-c";
  eyebrow: string;
  cards: ForeverMobileRailCard[];
};

export function MobileForeverEvidenceRail({ railId, eyebrow, cards }: MobileForeverEvidenceRailProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const move = (direction: -1 | 1) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    scroller.scrollBy({ left: direction * (scroller.clientWidth - 16), behavior: "smooth" });
  };

  const closeSiblings = (event: SyntheticEvent<HTMLDetailsElement>) => {
    const current = event.currentTarget;
    if (!current.open) return;
    scrollerRef.current?.querySelectorAll<HTMLDetailsElement>("details").forEach((details) => {
      if (details !== current) details.open = false;
    });
  };

  return (
    <section className={`${styles.evidenceRailSection} ${styles[railId]}`} data-surface-category="cards" aria-labelledby={`${railId}-title`}>
      <header className={styles.railHeader}>
        <div>
          <p>DATA CARDS</p>
          <h2 id={`${railId}-title`}>{eyebrow}</h2>
        </div>
        <div className={styles.railControls} aria-label={`${eyebrow} card controls`}>
          <button type="button" onClick={() => move(-1)} aria-label="Previous evidence card">←</button>
          <span>01 / 03</span>
          <button type="button" onClick={() => move(1)} aria-label="Next evidence card">→</button>
        </div>
      </header>
      <div className={styles.railScroller} ref={scrollerRef}>
        {cards.map((card, index) => (
          <details
            className={`${styles.evidenceCard} ${styles[`cardTone${index + 1}`]}`}
            name={railId}
            onToggle={closeSiblings}
            key={card.id}
          >
            <summary>
              <span className={styles.cardFront}>
                <span className={styles.cardTopline}>
                  <span className={styles.outlineCapsule}>{card.label} / {card.scope}</span>
                  <span className={styles.circleAffordance} aria-hidden="true">↘</span>
                </span>
                <span className={styles.cardValue}>{card.displayValue}</span>
                <span className={styles.cardUnit}>{card.unit}</span>
                <span className={`${styles.cardMicro} ${styles[card.micro.kind]}`} aria-label={`${card.label} data microvisualisation`}>
                  <i style={{ "--micro-primary": `${card.micro.primaryPercent}%` } as React.CSSProperties} />
                  <i style={{ "--micro-secondary": `${card.micro.secondaryPercent}%` } as React.CSSProperties} />
                </span>
                <span className={styles.cardAction}>DETAIL / SOURCE <b>+</b></span>
              </span>
            </summary>
            <div className={styles.cardBody}>
              <dl>
                <div><dt>Definition</dt><dd>{card.definition}</dd></div>
                <div><dt>Reading</dt><dd>{card.interpretation}</dd></div>
                <div><dt>Boundary</dt><dd>{card.caveat}</dd></div>
                <div><dt>Source</dt><dd>{card.source}</dd></div>
              </dl>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
