import type { ReactNode } from "react";
import type { Viewport } from "next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#fcfaf3",
};

export default function HubLayout({ children }: { children: ReactNode }) {
  return children;
}
