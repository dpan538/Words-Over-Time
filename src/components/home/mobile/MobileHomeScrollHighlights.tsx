"use client";

import { useEffect } from "react";

const START_SCROLL_THRESHOLD = 8;
const HIGHLIGHT_JOURNEY_RATIO = 0.62;
const OVERLAP_RATIO = 0.72;
const LEAD_OVERLAP_RATIO = 1.15;
const LEAD_HOLD_RATIO = 0.12;

export function MobileHomeScrollHighlights() {
  useEffect(() => {
    if (!window.matchMedia("(max-width: 500px)").matches) {
      return;
    }

    const root = document.querySelector<HTMLElement>(
      '[data-home-edition="mobile"]',
    );
    const words = Array.from(
      root?.querySelectorAll<HTMLElement>("[data-home-word]") ?? [],
    );
    const paletteSegments = Array.from(
      root?.querySelectorAll<HTMLElement>("[data-home-palette-segment]") ?? [],
    );

    if (!root || words.length === 0) {
      return;
    }

    let frame = 0;

    const update = () => {
      frame = 0;

      const maximumScroll = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        1,
      );
      const scrollPosition = Math.max(window.scrollY, 0);
      const highlightJourney = Math.max(
        maximumScroll * HIGHLIGHT_JOURNEY_RATIO - START_SCROLL_THRESHOLD,
        1,
      );
      const rawProgress = Math.min(
        Math.max(
          (scrollPosition - START_SCROLL_THRESHOLD) / highlightJourney,
          0,
        ),
        1,
      );
      const progress =
        rawProgress <= LEAD_HOLD_RATIO
          ? 0
          : (rawProgress - LEAD_HOLD_RATIO) / (1 - LEAD_HOLD_RATIO);
      const step = words.length > 1 ? 1 / (words.length - 1) : 1;

      words.forEach((word, index) => {
        const centre = words.length > 1 ? index * step : 0;
        const highlightRadius =
          step * (index === 0 ? LEAD_OVERLAP_RATIO : OVERLAP_RATIO);
        const isHighlighted =
          scrollPosition > START_SCROLL_THRESHOLD &&
          Math.abs(progress - centre) <= highlightRadius;

        word.toggleAttribute("data-scroll-highlight", isHighlighted);
      });

      const paletteProgress = Math.min(scrollPosition / maximumScroll, 1);
      paletteSegments.forEach((segment, index) => {
        const segmentProgress = Math.min(
          Math.max(paletteProgress * paletteSegments.length - index, 0),
          1,
        );
        segment.style.setProperty(
          "--palette-segment-progress",
          segmentProgress.toFixed(3),
        );
      });
    };

    const requestUpdate = () => {
      if (frame === 0) {
        frame = window.requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);

      if (frame !== 0) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, []);

  return null;
}
