"use client";

import { useEffect, useRef } from "react";

type RevealElement = HTMLElement & {
  dataset: DOMStringMap;
};

function isReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function useScrollReveal() {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const element = ref.current as RevealElement | null;
    if (!element || element.dataset.scrollRevealReady === "true") return;

    element.dataset.scrollRevealReady = "true";

    if (isReducedMotion()) {
      element.classList.add("is-visible");
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        element.classList.add("is-visible");
        observer.unobserve(element);
      },
      {
        root: null,
        rootMargin: "0px 0px -10% 0px",
        threshold: 0.06,
      },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return ref;
}
