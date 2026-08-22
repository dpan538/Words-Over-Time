"use client";

import type { ReactNode } from "react";
import { DeferredDesktopEdition } from "./DeferredDesktopEdition";
import { EditionBoundary } from "./EditionBoundary";

const loadDesktopWordsIndex = () =>
  import("@/components/words/desktop/DesktopWordsIndex").then(
    (module) => module.default,
  );

export function WordsIndexEditionBridge({ children }: { children: ReactNode }) {
  return (
    <EditionBoundary
      mobile={children}
      desktop={<DeferredDesktopEdition load={loadDesktopWordsIndex} />}
    />
  );
}
