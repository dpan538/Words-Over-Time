"use client";

import { DeferredDesktopEdition } from "@/components/edition/DeferredDesktopEdition";
import { EditionBoundary } from "@/components/edition/EditionBoundary";
import { MobileErrorStatePage } from "@/components/error/mobile/MobileErrorStatePage";
import type { ErrorStatePageProps } from "@/components/error/error-state-types";

const loadDesktopErrorStatePage = () =>
  import("@/components/error/desktop/DesktopErrorStatePage").then(
    (module) => module.default,
  );

export function ErrorStatePage(props: ErrorStatePageProps) {
  return (
    <EditionBoundary
      mobile={<MobileErrorStatePage {...props} />}
      desktop={(
        <DeferredDesktopEdition
          load={loadDesktopErrorStatePage}
          componentProps={props}
        />
      )}
    />
  );
}
