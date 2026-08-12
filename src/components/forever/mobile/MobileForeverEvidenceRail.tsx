"use client";

import { useRef, useState, type MouseEvent, type SyntheticEvent, type TouchEvent } from "react";
import type { ForeverMobileRailCard } from "@/types/foreverMobileAnalysis";
import styles from "./mobile-forever.module.css";

type MobileForeverEvidenceRailProps = {
  railId: "rail-a" | "rail-b" | "rail-c";
  eyebrow: string;
  cards: ForeverMobileRailCard[];
};

export function MobileForeverEvidenceRail({ railId, eyebrow, cards }: MobileForeverEvidenceRailProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const activeIndexRef = useRef(0);
  const touchStartXRef = useRef<number | null>(null);
  const touchMovedRef = useRef(false);
  const suppressClickRef = useRef(false);
  const swipeStartedRef = useRef(false);
  const reopenAfterSwipeRef = useRef(false);
  const settleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const detailsCards = () => Array.from(scrollerRef.current?.querySelectorAll<HTMLDetailsElement>("details") ?? []);

  const closeAll = () => {
    detailsCards().forEach((details) => { details.open = false; });
  };

  const nearestIndex = () => {
    const scroller = scrollerRef.current;
    const cardsInRail = detailsCards();
    if (!scroller || cardsInRail.length === 0) return 0;
    return cardsInRail.reduce((nearest, card, index) => (
      Math.abs(card.offsetLeft - scroller.scrollLeft) < Math.abs(cardsInRail[nearest].offsetLeft - scroller.scrollLeft)
        ? index
        : nearest
    ), 0);
  };

  const settleSwipe = () => {
    if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
    settleTimerRef.current = setTimeout(() => {
      const nextIndex = nearestIndex();
      activeIndexRef.current = nextIndex;
      setActiveIndex(nextIndex);
      if (reopenAfterSwipeRef.current) {
        const nextCard = detailsCards()[nextIndex];
        if (nextCard) nextCard.open = true;
      }
      reopenAfterSwipeRef.current = false;
      swipeStartedRef.current = false;
    }, 160);
  };

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    touchStartXRef.current = event.touches[0]?.clientX ?? null;
    touchMovedRef.current = false;
    swipeStartedRef.current = false;
    reopenAfterSwipeRef.current = detailsCards().some((details) => details.open);
    if (reopenAfterSwipeRef.current) closeAll();
  };

  const handleTouchMove = (event: TouchEvent<HTMLDivElement>) => {
    const startX = touchStartXRef.current;
    const currentX = event.touches[0]?.clientX;
    if (startX === null || currentX === undefined || Math.abs(currentX - startX) < 18) return;
    touchMovedRef.current = true;
    suppressClickRef.current = true;
    if (swipeStartedRef.current) return;
    swipeStartedRef.current = true;
    if (!reopenAfterSwipeRef.current) {
      reopenAfterSwipeRef.current = detailsCards().some((details) => details.open);
      if (reopenAfterSwipeRef.current) closeAll();
    }
  };

  const handleTouchEnd = () => {
    settleSwipe();
    if (!touchMovedRef.current) suppressClickRef.current = false;
    touchStartXRef.current = null;
  };

  const suppressSwipeClick = (event: MouseEvent<HTMLElement>) => {
    if (!suppressClickRef.current) return;
    event.preventDefault();
    event.stopPropagation();
    suppressClickRef.current = false;
  };

  const handleScroll = () => {
    const nextIndex = nearestIndex();
    if (nextIndex !== activeIndexRef.current) {
      if (!swipeStartedRef.current) {
        reopenAfterSwipeRef.current = detailsCards().some((details) => details.open);
        if (reopenAfterSwipeRef.current) closeAll();
      }
      activeIndexRef.current = nextIndex;
      setActiveIndex(nextIndex);
    }
    settleSwipe();
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
        <p className={styles.railCounter} aria-live="polite" aria-label={`Card ${activeIndex + 1} of ${cards.length}`}>
          {activeIndex + 1} / {cards.length}
        </p>
      </header>
      <div
        className={styles.railScroller}
        ref={scrollerRef}
        onScroll={handleScroll}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {cards.map((card, index) => (
          <details
            className={`${styles.evidenceCard} ${styles[`cardTone${index + 1}`]}`}
            name={railId}
            onToggle={closeSiblings}
            key={card.id}
          >
            <summary onClickCapture={suppressSwipeClick}>
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
