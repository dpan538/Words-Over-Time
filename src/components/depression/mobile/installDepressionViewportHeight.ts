export function installDepressionViewportHeight() {
  const root = document.documentElement;
  const viewport = window.visualViewport;
  let frame = 0;

  const update = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      const height = viewport?.height ?? window.innerHeight;
      root.style.setProperty("--depression-vvh", `${Math.round(height)}px`);
    });
  };

  update();
  viewport?.addEventListener("resize", update, { passive: true });
  window.addEventListener("resize", update, { passive: true });
  window.addEventListener("orientationchange", update, { passive: true });

  return () => {
    cancelAnimationFrame(frame);
    viewport?.removeEventListener("resize", update);
    window.removeEventListener("resize", update);
    window.removeEventListener("orientationchange", update);
    root.style.removeProperty("--depression-vvh");
  };
}
