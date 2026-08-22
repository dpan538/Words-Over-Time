"use client";

import type { ReactNode } from "react";
import { DeferredDesktopEdition } from "./DeferredDesktopEdition";
import { EditionBoundary } from "./EditionBoundary";

const loadDesktopAbout = () =>
  import("@/components/about/desktop/DesktopAbout").then(
    (module) => module.DesktopAbout,
  );

export function AboutEditionBridge({ children }: { children: ReactNode }) {
  return (
    <EditionBoundary
      mobile={children}
      desktop={<DeferredDesktopEdition load={loadDesktopAbout} />}
    />
  );
}
