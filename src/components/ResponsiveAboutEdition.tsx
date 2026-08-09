"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, type ReactNode } from "react";

const desktopQuery = "(min-width: 60rem)";

const AboutDesktopEdition = dynamic(
  () =>
    import("@/components/AboutDesktopEdition").then(
      (module) => module.AboutDesktopEdition,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="hidden min-h-screen bg-wheat min-[960px]:block" aria-hidden="true" />
    ),
  },
);

export function ResponsiveAboutEdition({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [desktop, setDesktop] = useState(false);

  useEffect(() => {
    const query = window.matchMedia(desktopQuery);
    const syncDesktop = () => setDesktop(query.matches);

    syncDesktop();
    setHydrated(true);
    query.addEventListener("change", syncDesktop);

    return () => query.removeEventListener("change", syncDesktop);
  }, []);

  if (hydrated && desktop) return <AboutDesktopEdition />;

  return <div className="min-[960px]:hidden">{children}</div>;
}
