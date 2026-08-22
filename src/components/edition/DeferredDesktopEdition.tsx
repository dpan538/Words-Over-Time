"use client";

import { useEffect, useState, type ComponentType } from "react";
import { DesktopEditionLoading } from "./DesktopEditionLoading";

type DeferredDesktopEditionProps<Props extends object> = {
  load: () => Promise<ComponentType<Props>>;
  componentProps?: Props;
};

/**
 * Starts the desktop module request only after the desktop branch is mounted.
 * Keeping import() inside this effect prevents mobile viewports from fetching
 * desktop presentation chunks merely because the route supports both editions.
 */
export function DeferredDesktopEdition<
  Props extends object = Record<never, never>,
>({ load, componentProps }: DeferredDesktopEditionProps<Props>) {
  const [Component, setComponent] = useState<ComponentType<Props> | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;

    load().then(
      (loadedComponent) => {
        if (active) setComponent(() => loadedComponent);
      },
      (error: unknown) => {
        if (!active) return;
        setLoadError(
          error instanceof Error
            ? error.message
            : "The desktop edition could not be loaded.",
        );
      },
    );

    return () => {
      active = false;
    };
  }, [attempt, load]);

  if (loadError) {
    return (
      <DesktopEditionLoading
        error={loadError}
        onRetry={() => {
          setLoadError(null);
          setAttempt((current) => current + 1);
        }}
      />
    );
  }

  if (!Component) return <DesktopEditionLoading />;

  return <Component {...(componentProps ?? ({} as Props))} />;
}
