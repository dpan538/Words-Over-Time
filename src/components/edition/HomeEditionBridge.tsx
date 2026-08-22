"use client";

import type { ReactNode } from "react";
import { DeferredDesktopEdition } from "./DeferredDesktopEdition";
import { EditionBoundary } from "./EditionBoundary";

const loadDesktopHome = () =>
  import("@/components/home/desktop/DesktopHome").then(
    (module) => module.DesktopHome,
  );

export function HomeEditionBridge({ children }: { children: ReactNode }) {
  return (
    <EditionBoundary
      mobile={children}
      desktop={<DeferredDesktopEdition load={loadDesktopHome} />}
    />
  );
}
