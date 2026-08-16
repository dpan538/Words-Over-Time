"use client";

import { useEffect, useRef } from "react";
import { MobileArtificialStudy } from "@/components/artificial/mobile/MobileArtificialStudy";

export function MobileArtificialEdition() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const previousRootBackground = root.style.backgroundColor;
    const previousBodyBackground = body.style.backgroundColor;
    const previousRootColorScheme = root.style.colorScheme;
    const previousBodyColorScheme = body.style.colorScheme;

    if (rootRef.current?.getClientRects().length) {
      root.style.backgroundColor = "#050507";
      body.style.backgroundColor = "#050507";
      root.style.colorScheme = "dark";
      body.style.colorScheme = "dark";
    }

    return () => {
      root.style.backgroundColor = previousRootBackground;
      body.style.backgroundColor = previousBodyBackground;
      root.style.colorScheme = previousRootColorScheme;
      body.style.colorScheme = previousBodyColorScheme;
    };
  }, []);

  return (
    <div ref={rootRef}>
      <MobileArtificialStudy />
    </div>
  );
}
