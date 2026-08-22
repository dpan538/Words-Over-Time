"use client";

import type { ReactNode } from "react";
import { DeferredDesktopEdition } from "./DeferredDesktopEdition";
import { EditionBoundary } from "./EditionBoundary";

const loadDesktopArtificialEdition = () =>
  import("@/components/artificial/desktop/DesktopArtificialEdition").then(
    (module) => module.DesktopArtificialEdition,
  );

export function ArtificialEditionBridge({ children }: { children: ReactNode }) {
  return (
    <EditionBoundary
      mobile={children}
      desktop={<DeferredDesktopEdition load={loadDesktopArtificialEdition} />}
    />
  );
}
