"use client";

import {
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type SyntheticEvent,
  type TouchEvent,
} from "react";
import type { ForeverMobileRailCard } from "@/types/foreverMobileAnalysis";
import styles from "./mobile-forever.module.css";

type MobileForeverEvidenceRailProps = {
  railId: "rail-a" | "rail-b" | "rail-c";
  eyebrow: string;
  cards: ForeverMobileRailCard[];
};

export function MobileForeverEvidenceRail({
  railId,
  eyebrow,
  cards,
}: MobileForeverEvidenceRailProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const activeIndexRef = useRef(0);
  const touchOriginRef = useRef<{ x: number; y: number } | null>(null);
  const touchAxisRef = useRef<"pending" | "horizontal" | "vertical">("pending");
  const suppressClickRef = useRef(false);
  const suppressClickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    return () => {
      if (suppressClickTimerRef.current) {
        clearTimeout(suppressClickTimerRef.current);
      }
    };
  }, []);

  const detailsCards = () =>
    Array.from(
      scrollerRef.current?.querySelectorAll<HTMLDetailsElement>("details") ??
        [],
    );

  const closeAll = () => {
    detailsCards().forEach((details) => {
      details.open = false;
    });
  };

  const nearestIndex = () => {
    const scroller = scrollerRef.current;
    const cardsInRail = detailsCards();
    if (!scroller || cardsInRail.length === 0) return 0;
    return cardsInRail.reduce(
      (nearest, card, index) =>
        Math.abs(card.offsetLeft - scroller.scrollLeft) <
        Math.abs(cardsInRail[nearest].offsetLeft - scroller.scrollLeft)
          ? index
          : nearest,
      0,
    );
  };

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0];
    touchOriginRef.current = touch ? { x: touch.clientX, y: touch.clientY } : null;
    touchAxisRef.current = "pending";
    suppressClickRef.current = false;
    if (suppressClickTimerRef.current) clearTimeout(suppressClickTimerRef.current);
  };

  const handleTouchMove = (event: TouchEvent<HTMLDivElement>) => {
    const origin = touchOriginRef.current;
    const touch = event.touches[0];
    if (!origin || !touch || touchAxisRef.current !== "pending") return;

    const deltaX = touch.clientX - origin.x;
    const deltaY = touch.clientY - origin.y;
    const distanceX = Math.abs(deltaX);
    const distanceY = Math.abs(deltaY);

    // Wait for intentional movement, then lock the gesture to one axis. This
    // keeps normal page scrolling from mutating card state on iOS Safari.
    if (Math.max(distanceX, distanceY) < 12) return;
    if (distanceY >= distanceX * 1.15) {
      touchAxisRef.current = "vertical";
      return;
    }
    if (distanceX < distanceY * 1.15) return;

    touchAxisRef.current = "horizontal";
    suppressClickRef.current = true;
    closeAll();
  };

  const handleTouchEnd = () => {
    const wasHorizontalSwipe = touchAxisRef.current === "horizontal";
    touchOriginRef.current = null;
    touchAxisRef.current = "pending";

    if (!wasHorizontalSwipe) {
      suppressClickRef.current = false;
      return;
    }

    // Safari emits a synthetic click immediately after touchend. Keep the
    // guard alive long enough to consume only that click, never the next tap.
    suppressClickTimerRef.current = setTimeout(() => {
      suppressClickRef.current = false;
    }, 400);
  };

  const handleTouchCancel = () => {
    touchOriginRef.current = null;
    touchAxisRef.current = "pending";
    suppressClickRef.current = false;
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
      // Keyboard/trackpad scrolling has no touch gesture to classify. Close an
      // expanded card once the snapped card actually changes, and never reopen
      // a card automatically after navigation.
      closeAll();
      activeIndexRef.current = nextIndex;
      setActiveIndex(nextIndex);
    }
  };

  const closeSiblings = (event: SyntheticEvent<HTMLDetailsElement>) => {
    const current = event.currentTarget;
    if (!current.open) return;
    scrollerRef.current
      ?.querySelectorAll<HTMLDetailsElement>("details")
      .forEach((details) => {
        if (details !== current) details.open = false;
      });
  };

  return (
    <section
      className={`${styles.evidenceRailSection} ${styles[railId]}`}
      data-surface-category="cards"
      aria-labelledby={`${railId}-title`}
    >
      <header className={styles.railHeader}>
        <div>
          <p>DATA CARDS</p>
          <h2 id={`${railId}-title`}>{eyebrow}</h2>
        </div>
        <p
          className={styles.railCounter}
          aria-live="polite"
          aria-label={`Card ${activeIndex + 1} of ${cards.length}`}
        >
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
        onTouchCancel={handleTouchCancel}
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
                  <span className={styles.outlineCapsule}>
                    {card.label} / {card.scope}
                  </span>
                  <span className={styles.circleAffordance} aria-hidden="true">
                    ↘
                  </span>
                </span>
                <span className={styles.cardValue}>{card.displayValue}</span>
                <span className={styles.cardUnit}>{card.unit}</span>
                <span
                  className={`${styles.cardMicro} ${styles[card.micro.kind]}`}
                  aria-label={`${card.label} data microvisualisation`}
                >
                  <i
                    style={
                      {
                        "--micro-primary": `${card.micro.primaryPercent}%`,
                      } as React.CSSProperties
                    }
                  />
                  <i
                    style={
                      {
                        "--micro-secondary": `${card.micro.secondaryPercent}%`,
                      } as React.CSSProperties
                    }
                  />
                </span>
                <span className={styles.cardAction}>
                  DETAIL / SOURCE <b>+</b>
                </span>
              </span>
            </summary>
            <div className={styles.cardBody}>
              <dl>
                <div>
                  <dt>Definition</dt>
                  <dd>{card.definition}</dd>
                </div>
                <div>
                  <dt>Reading</dt>
                  <dd>{card.interpretation}</dd>
                </div>
                <div>
                  <dt>Boundary</dt>
                  <dd>{card.caveat}</dd>
                </div>
                <div>
                  <dt>Source</dt>
                  <dd>{card.source}</dd>
                </div>
              </dl>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
