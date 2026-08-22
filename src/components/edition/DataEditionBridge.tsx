"use client";

import type { ReactNode } from "react";
import { DeferredDesktopEdition } from "./DeferredDesktopEdition";
import { EditionBoundary } from "./EditionBoundary";

const loadDesktopDataEdition = () =>
  import("@/components/data/desktop/DesktopDataEdition").then(
    (module) => module.DesktopDataEdition,
  );

export function DataEditionBridge({ children }: { children: ReactNode }) {
  return (
    <EditionBoundary
      mobile={children}
      desktop={<DeferredDesktopEdition load={loadDesktopDataEdition} />}
    />
  );
}
