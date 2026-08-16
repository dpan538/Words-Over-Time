"use client";

import { useEffect } from "react";

type MotionScene = HTMLElement & { dataset: DOMStringMap };

function subscribeToMotionPreference(mediaQuery: MediaQueryList, listener: () => void) {
  if (typeof mediaQuery.addEventListener === "function") {
    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }

  const legacyQuery = mediaQuery as MediaQueryList & {
    addListener: (handler: () => void) => void;
    removeListener: (handler: () => void) => void;
  };
  legacyQuery.addListener(listener);
  return () => legacyQuery.removeListener(listener);
}

export function ArtificialMotionController({ rootId }: { rootId: string }) {
  useEffect(() => {
    const root = document.getElementById(rootId);
    if (!root) return;

    const scenes = Array.from(root.querySelectorAll<MotionScene>("[data-motion-scene]"));
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const frames = new Set<number>();
    let observer: IntersectionObserver | null = null;

    const showScene = (scene: MotionScene, animate: boolean) => {
      if (scene.dataset.motionSeen === "true") return;
      scene.dataset.motionSeen = "true";
      if (!animate) {
        scene.dataset.motionState = "visible";
        return;
      }

      const firstFrame = window.requestAnimationFrame(() => {
        frames.delete(firstFrame);
        const secondFrame = window.requestAnimationFrame(() => {
          frames.delete(secondFrame);
          scene.dataset.motionState = "visible";
        });
        frames.add(secondFrame);
      });
      frames.add(firstFrame);
    };

    const startMotion = () => {
      observer?.disconnect();
      observer = null;

      const motionAvailable = !motionPreference.matches && "IntersectionObserver" in window;
      root.dataset.motionReady = "true";

      if (!motionAvailable) {
        scenes.forEach((scene) => showScene(scene, false));
        return;
      }

      const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
      scenes.forEach((scene) => {
        if (scene.dataset.motionSeen === "true") return;
        const bounds = scene.getBoundingClientRect();
        const visibleNow = bounds.bottom > 0 && bounds.top < viewportHeight * 0.88;
        scene.dataset.motionState = visibleNow ? "visible" : "pending";
        if (visibleNow) scene.dataset.motionSeen = "true";
      });

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const scene = entry.target as MotionScene;
            showScene(scene, true);
            observer?.unobserve(scene);
          });
        },
        { rootMargin: "0px 0px -12% 0px", threshold: 0.12 },
      );

      scenes.forEach((scene) => {
        if (scene.dataset.motionSeen !== "true") observer?.observe(scene);
      });
    };

    const handlePageShow = () => startMotion();
    const handleVisibility = () => {
      root.dataset.motionPaused = document.visibilityState === "hidden" ? "true" : "false";
    };

    startMotion();
    const unsubscribe = subscribeToMotionPreference(motionPreference, startMotion);
    window.addEventListener("pageshow", handlePageShow);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      unsubscribe();
      observer?.disconnect();
      window.removeEventListener("pageshow", handlePageShow);
      document.removeEventListener("visibilitychange", handleVisibility);
      frames.forEach((frame) => window.cancelAnimationFrame(frame));
      delete root.dataset.motionReady;
      delete root.dataset.motionPaused;
    };
  }, [rootId]);

  return null;
}
