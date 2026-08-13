import { useEffect, useRef } from "react";

/**
 * Progressive chart motion only. Text and card shells never become hidden.
 * SSR/no-JS output remains complete; hydrated charts draw once on entry.
 */
export function useMobileScrollReveal<T extends HTMLElement>() {
  const rootRef = useRef<T>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const targets = Array.from(root.querySelectorAll<HTMLElement>("[data-chart-grow]"));
    const drawAll = () => {
      targets.forEach((target) => {
        target.dataset.chartState = "drawn";
      });
      root.dataset.mobileMotionReady = "true";
    };

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion || !("IntersectionObserver" in window)) {
      drawAll();
      return;
    }

    targets.forEach((target, index) => {
      target.dataset.chartState = "pending";
      // Keep a restrained cascade without making later charts feel delayed.
      target.style.setProperty("--chart-draw-delay", `${(index % 3) * 110}ms`);
    });
    root.dataset.mobileMotionReady = "true";

    const pendingTargets = new Set(targets);
    const animationFrames = new Set<number>();
    let observer: IntersectionObserver | null = null;
    let visibilityFrame = 0;

    const drawTarget = (target: HTMLElement) => {
      if (!pendingTargets.has(target)) return;
      pendingTargets.delete(target);
      observer?.unobserve(target);

      // Two frames guarantee that the pending geometry is painted before the
      // final chart state is applied, including after a fast browser restore.
      const firstFrame = window.requestAnimationFrame(() => {
        animationFrames.delete(firstFrame);
        const secondFrame = window.requestAnimationFrame(() => {
          target.dataset.chartState = "drawn";
          animationFrames.delete(secondFrame);
        });
        animationFrames.add(secondFrame);
      });
      animationFrames.add(firstFrame);
    };

    const drawVisibleTargets = () => {
      visibilityFrame = 0;
      const viewportWidth = window.innerWidth;
      const triggerLine = window.innerHeight * 1.06;

      pendingTargets.forEach((target) => {
        const bounds = target.getBoundingClientRect();
        const overlapsViewport =
          bounds.bottom > 0 &&
          bounds.top < triggerLine &&
          bounds.right > 0 &&
          bounds.left < viewportWidth;
        if (overlapsViewport) drawTarget(target);
      });
    };

    const scheduleVisibilityCheck = () => {
      if (visibilityFrame || pendingTargets.size === 0) return;
      visibilityFrame = window.requestAnimationFrame(drawVisibleTargets);
    };

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          drawTarget(entry.target as HTMLElement);
        });
      },
      // Begin just before the chart is fully inside the viewport so the reader
      // sees the complete draw rather than arriving during its final frames.
      { rootMargin: "0px 0px 6%", threshold: 0 },
    );

    targets.forEach((target) => observer.observe(target));
    window.addEventListener("scroll", scheduleVisibilityCheck, { passive: true });
    window.addEventListener("resize", scheduleVisibilityCheck, { passive: true });
    // Descendant scroll does not bubble. Capture it at the scope so cards that
    // enter through a horizontal rail receive the same fallback as page scroll.
    root.addEventListener("scroll", scheduleVisibilityCheck, { passive: true, capture: true });
    scheduleVisibilityCheck();

    return () => {
      observer?.disconnect();
      window.removeEventListener("scroll", scheduleVisibilityCheck);
      window.removeEventListener("resize", scheduleVisibilityCheck);
      root.removeEventListener("scroll", scheduleVisibilityCheck, true);
      if (visibilityFrame) window.cancelAnimationFrame(visibilityFrame);
      animationFrames.forEach((frame) => window.cancelAnimationFrame(frame));
    };
  }, []);

  return rootRef;
}
