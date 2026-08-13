"use client";

import type { ReactNode } from "react";
import { useMobileScrollReveal } from "./useMobileScrollReveal";

export function MobileScrollRevealScope({ children }: { children: ReactNode }) {
  const scopeRef = useMobileScrollReveal<HTMLDivElement>();
  return <div ref={scopeRef} data-mobile-chart-scope="true">{children}</div>;
}
