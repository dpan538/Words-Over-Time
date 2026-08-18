"use client";

import { useEffect, useState, type ReactNode } from "react";

type HubEditionBoundaryProps = {
  desktop: ReactNode;
  mobile: ReactNode;
};

export function HubEditionBoundary({ desktop, mobile }: HubEditionBoundaryProps) {
  const [showDesktop, setShowDesktop] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 501px)");
    const update = () => setShowDesktop(query.matches);

    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return <div data-hub-route>{showDesktop ? desktop : mobile}</div>;
}
