"use client";

import type { ReactNode } from "react";
import { DeferredDesktopEdition } from "./DeferredDesktopEdition";
import { EditionBoundary } from "./EditionBoundary";

const loadDesktopPrivacyEdition = () =>
  import("@/components/privacy/desktop/DesktopPrivacyEdition").then(
    (module) => module.DesktopPrivacyEdition,
  );

export function PrivacyEditionBridge({ children }: { children: ReactNode }) {
  return (
    <EditionBoundary
      mobile={children}
      desktop={<DeferredDesktopEdition load={loadDesktopPrivacyEdition} />}
    />
  );
}
