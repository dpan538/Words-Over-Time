"use client";

import { useEffect, useRef, useState } from "react";

export function usePausableSvgAnimations(rootMargin = "180px 0px") {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [isMotionActive, setIsMotionActive] = useState(true);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let isIntersecting = true;

    const applyMotionState = () => {
      const shouldRun = isIntersecting && !reduceMotion.matches && document.visibilityState === "visible";
      setIsMotionActive(shouldRun);

      if (typeof svg.pauseAnimations === "function" && typeof svg.unpauseAnimations === "function") {
        if (shouldRun) {
          svg.unpauseAnimations();
        } else {
          svg.pauseAnimations();
        }
      }
    };

    if (!("IntersectionObserver" in window)) {
      reduceMotion.addEventListener("change", applyMotionState);
      document.addEventListener("visibilitychange", applyMotionState);
      applyMotionState();

      return () => {
        reduceMotion.removeEventListener("change", applyMotionState);
        document.removeEventListener("visibilitychange", applyMotionState);
        if (typeof svg.unpauseAnimations === "function") {
          svg.unpauseAnimations();
        }
      };
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        isIntersecting = Boolean(entry?.isIntersecting);
        applyMotionState();
      },
      { rootMargin },
    );

    observer.observe(svg);
    reduceMotion.addEventListener("change", applyMotionState);
    document.addEventListener("visibilitychange", applyMotionState);
    applyMotionState();

    return () => {
      observer.disconnect();
      reduceMotion.removeEventListener("change", applyMotionState);
      document.removeEventListener("visibilitychange", applyMotionState);
      if (typeof svg.unpauseAnimations === "function") {
        svg.unpauseAnimations();
      }
    };
  }, [rootMargin]);

  return { svgRef, isMotionActive };
}
