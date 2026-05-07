"use client";

import { useEffect, useRef } from "react";

type RevealElement = HTMLElement & {
  dataset: DOMStringMap;
};

function isReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function prepareSvgElements(root: HTMLElement) {
  const drawElements = Array.from(
    root.querySelectorAll<SVGGeometryElement>(
      "svg path, svg polyline",
    ),
  ).filter((element) => {
    const stroke = element.getAttribute("stroke");
    return (
      !element.closest("defs") &&
      !element.classList.contains("no-scroll-draw") &&
      Boolean(stroke) &&
      stroke !== "none"
    );
  });

  drawElements.slice(0, 72).forEach((element, index) => {
    try {
      const length = element.getTotalLength();
      if (!Number.isFinite(length) || length <= 0) return;
      element.classList.add("svg-draw");
      element.style.setProperty("--path-length", `${length}`);
      element.style.setProperty("--draw-delay", `${Math.min(index * 14, 220)}ms`);
      element.style.strokeDasharray = `${length}`;
      element.style.strokeDashoffset = `${length}`;
    } catch {
      // Some SVG shapes do not expose length consistently across browsers.
    }
  });

  const nodes = Array.from(
    root.querySelectorAll<SVGGraphicsElement>(
      "svg g.cursor-crosshair circle, svg g.cursor-crosshair ellipse, svg g.cursor-crosshair rect, svg circle.cursor-crosshair, svg ellipse.cursor-crosshair, svg rect.cursor-crosshair",
    ),
  ).filter((element) => !element.closest("defs"));

  nodes.slice(0, 96).forEach((element, index) => {
    element.classList.add("svg-node");
    element.style.setProperty(
      "--node-opacity",
      element.getAttribute("opacity") ?? (element.style.opacity || "1"),
    );
    element.style.setProperty("--node-delay", `${120 + Math.min(index * 8, 280)}ms`);
  });

  const labels = Array.from(root.querySelectorAll<SVGTextElement>("svg text")).filter(
    (element) => !element.closest("defs"),
  );

  labels.slice(0, 90).forEach((element, index) => {
    element.classList.add("svg-label");
    element.style.setProperty(
      "--label-opacity",
      element.getAttribute("opacity") ?? (element.style.opacity || "1"),
    );
    element.style.setProperty("--label-delay", `${190 + Math.min(index * 6, 280)}ms`);
  });
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
        window.requestAnimationFrame(() => {
          prepareSvgElements(element);
          window.requestAnimationFrame(() => {
            element.classList.add("is-visible");
          });
        });
        observer.unobserve(element);
      },
      {
        root: null,
        rootMargin: "0px 0px -18% 0px",
        threshold: 0.08,
      },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return ref;
}
