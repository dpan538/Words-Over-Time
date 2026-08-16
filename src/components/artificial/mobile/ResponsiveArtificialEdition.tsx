"use client";

import { useEffect, useState, type ReactNode } from "react";

const desktopQuery = "(min-width: 960px)";

type ResponsiveArtificialEditionProps = {
  desktop: ReactNode;
  mobile: ReactNode;
};

export function ResponsiveArtificialEdition({ desktop, mobile }: ResponsiveArtificialEditionProps) {
  const [showDesktop, setShowDesktop] = useState(false);

  useEffect(() => {
    const query = window.matchMedia(desktopQuery);
    const root = document.documentElement;
    const body = document.body;
    const previousRootBackground = root.style.backgroundColor;
    const previousBodyBackground = body.style.backgroundColor;
    const previousRootColorScheme = root.style.colorScheme;
    const previousBodyColorScheme = body.style.colorScheme;
    const sync = () => {
      const desktop = query.matches;
      setShowDesktop(desktop);
      root.style.backgroundColor = desktop ? previousRootBackground : "#050507";
      body.style.backgroundColor = desktop ? previousBodyBackground : "#050507";
      root.style.colorScheme = desktop ? previousRootColorScheme : "dark";
      body.style.colorScheme = desktop ? previousBodyColorScheme : "dark";
    };
    sync();
    query.addEventListener("change", sync);
    return () => {
      query.removeEventListener("change", sync);
      root.style.backgroundColor = previousRootBackground;
      body.style.backgroundColor = previousBodyBackground;
      root.style.colorScheme = previousRootColorScheme;
      body.style.colorScheme = previousBodyColorScheme;
    };
  }, []);

  return (
    <>
      <div className="min-[960px]:hidden">{mobile}</div>
      {showDesktop ? desktop : <div className="hidden min-h-screen bg-wheat min-[960px]:block" aria-hidden="true" />}
    </>
  );
}
