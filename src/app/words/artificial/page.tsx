import type { Viewport } from "next";
import { EditionBoundary } from "@/components/edition/EditionBoundary";
import { JsonLd } from "@/components/JsonLd";
import { DesktopArtificialEdition } from "@/editions/desktop/DesktopArtificialEdition";
import { MobileArtificialEdition } from "@/editions/mobile/MobileArtificialEdition";
import { createPageMetadata, createRouteJsonLd } from "@/lib/site";

export const metadata = createPageMetadata("/words/artificial");
export const viewport: Viewport = {
  themeColor: [{ color: "#050507", media: "(max-width: 959px)" }],
};
const jsonLd = createRouteJsonLd("/words/artificial");

export default function ArtificialPage() {
  return (
    <>
      <JsonLd data={jsonLd} />
      <EditionBoundary desktop={<DesktopArtificialEdition />} mobile={<MobileArtificialEdition />} />
    </>
  );
}
