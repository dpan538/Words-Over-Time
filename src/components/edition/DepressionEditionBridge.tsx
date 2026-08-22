"use client";

import type { ReactNode } from "react";
import { DeferredDesktopEdition } from "./DeferredDesktopEdition";
import { EditionBoundary } from "./EditionBoundary";

const loadDesktopDepressionEdition = () =>
  import("@/components/depression/desktop/DesktopDepressionEdition").then(
    (module) => module.DesktopDepressionEdition,
  );

export function DepressionEditionBridge({ children }: { children: ReactNode }) {
  return (
    <EditionBoundary
      mobile={children}
      desktop={<DeferredDesktopEdition load={loadDesktopDepressionEdition} />}
    />
  );
}
