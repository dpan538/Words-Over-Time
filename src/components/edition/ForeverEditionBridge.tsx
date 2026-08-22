"use client";

import type { ReactNode } from "react";
import { DeferredDesktopEdition } from "./DeferredDesktopEdition";
import { EditionBoundary } from "./EditionBoundary";

const loadDesktopForeverEdition = () =>
  import("@/components/forever/desktop/DesktopForeverEdition").then(
    (module) => module.DesktopForeverEdition,
  );

export function ForeverEditionBridge({ children }: { children: ReactNode }) {
  return (
    <EditionBoundary
      mobile={children}
      desktop={<DeferredDesktopEdition load={loadDesktopForeverEdition} />}
    />
  );
}
