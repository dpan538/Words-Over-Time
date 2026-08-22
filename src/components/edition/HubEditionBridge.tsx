"use client";

import type { ReactNode } from "react";
import { DeferredDesktopEdition } from "./DeferredDesktopEdition";
import { EditionBoundary } from "./EditionBoundary";

const loadDesktopHubEdition = () =>
  import("@/components/hub/desktop/DesktopHubEdition").then(
    (module) => module.DesktopHubEdition,
  );

export function HubEditionBridge({ children }: { children: ReactNode }) {
  return (
    <div data-hub-route>
      <EditionBoundary
        mobile={children}
        desktop={<DeferredDesktopEdition load={loadDesktopHubEdition} />}
      />
    </div>
  );
}
