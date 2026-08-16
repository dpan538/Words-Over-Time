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
    const sync = () => setShowDesktop(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  return (
    <>
      <div className="min-[960px]:hidden">{mobile}</div>
      {showDesktop ? desktop : <div className="hidden min-h-screen bg-wheat min-[960px]:block" aria-hidden="true" />}
    </>
  );
}
