export function installDepressionViewportHeight() {
  const root = document.documentElement;
  const viewport = window.visualViewport;
  let frame = 0;
  let settleTimer = 0;
  let pendingHeight = 0;
  let appliedHeight = 0;

  const readHeight = () => Math.round(viewport?.height ?? window.innerHeight);

  const apply = (force = false) => {
    const deck = document.querySelector<HTMLElement>('[data-depression-deck="true"]');
    const deckIsMoving = deck?.dataset.scrollActive === "true" || deck?.dataset.linearTransition === "true";
    if (!force && deckIsMoving) {
      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(() => apply(), 140);
      return;
    }
    const height = pendingHeight || readHeight();
    if (height === appliedHeight) return;
    appliedHeight = height;
    root.style.setProperty("--depression-vvh", `${height}px`);
    window.dispatchEvent(new CustomEvent("depression:viewportchange", { detail: { height } }));
  };

  const schedule = () => {
    pendingHeight = readHeight();
    window.clearTimeout(settleTimer);
    settleTimer = window.setTimeout(() => apply(), 140);
  };

  const updateOrientation = () => {
    window.clearTimeout(settleTimer);
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      pendingHeight = readHeight();
      apply(true);
    });
  };

  pendingHeight = readHeight();
  apply(true);
  viewport?.addEventListener("resize", schedule, { passive: true });
  window.addEventListener("resize", schedule, { passive: true });
  window.addEventListener("orientationchange", updateOrientation, { passive: true });

  return () => {
    cancelAnimationFrame(frame);
    window.clearTimeout(settleTimer);
    viewport?.removeEventListener("resize", schedule);
    window.removeEventListener("resize", schedule);
    window.removeEventListener("orientationchange", updateOrientation);
    root.style.removeProperty("--depression-vvh");
  };
}
