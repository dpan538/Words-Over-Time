"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import styles from "./EditionBoundary.module.css";

export const EDITION_BREAKPOINT_PX = 960;
const desktopQuery = `(min-width: ${EDITION_BREAKPOINT_PX}px)`;

type Edition = "desktop" | "mobile";

type EditionBoundaryProps = {
  desktop: ReactNode;
  mobile: ReactNode;
};

function subscribeToEdition(onStoreChange: () => void) {
  const media = window.matchMedia(desktopQuery);
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
}

function getClientEdition(): Edition {
  return window.matchMedia(desktopQuery).matches ? "desktop" : "mobile";
}

function getServerEdition(): null {
  return null;
}

export function EditionBoundary({ desktop, mobile }: EditionBoundaryProps) {
  const edition = useSyncExternalStore(
    subscribeToEdition,
    getClientEdition,
    getServerEdition,
  );

  if (edition === "desktop") {
    return (
      <div className={styles.edition} data-edition="desktop">
        {desktop}
      </div>
    );
  }

  if (edition === "mobile") {
    return (
      <div className={styles.edition} data-edition="mobile">
        {mobile}
      </div>
    );
  }

  return (
    <div className={styles.boundary} data-edition-boundary="pending">
      <div className={styles.desktop} data-edition="desktop">
        {desktop}
      </div>
      <div className={styles.mobile} data-edition="mobile">
        {mobile}
      </div>
    </div>
  );
}
