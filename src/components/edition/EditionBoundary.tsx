"use client";

import { useSyncExternalStore, type ReactNode } from "react";

export const MOBILE_MEDIA_QUERY = "(max-width: 500px)";
export const DESKTOP_MEDIA_QUERY = "(min-width: 501px)";

type EditionBoundaryProps = {
  desktop: ReactNode;
  mobile: ReactNode;
};

function subscribeToDesktopViewport(onStoreChange: () => void) {
  const mediaQuery = window.matchMedia(MOBILE_MEDIA_QUERY);
  mediaQuery.addEventListener("change", onStoreChange);

  return () => mediaQuery.removeEventListener("change", onStoreChange);
}

function getDesktopViewportSnapshot() {
  // Desktop is the exact inverse so fractional CSS pixels cannot create an
  // unassigned interval between 500 and 501.
  return !window.matchMedia(MOBILE_MEDIA_QUERY).matches;
}

function getServerViewportSnapshot() {
  return false;
}

/**
 * Chooses exactly one independently composed edition.
 *
 * The server and hydration snapshot are mobile so the initial markup is
 * deterministic. After hydration, matchMedia selects desktop at 501px and
 * above and keeps the active edition synchronized with viewport changes.
 */
export function EditionBoundary({ desktop, mobile }: EditionBoundaryProps) {
  const showDesktop = useSyncExternalStore(
    subscribeToDesktopViewport,
    getDesktopViewportSnapshot,
    getServerViewportSnapshot,
  );

  return showDesktop ? desktop : mobile;
}
