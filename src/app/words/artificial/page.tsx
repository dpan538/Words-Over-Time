import { JsonLd } from "@/components/JsonLd";
import { ArtificialEditionBridge } from "@/components/edition/ArtificialEditionBridge";
import { MobileArtificialStudy } from "@/components/artificial/mobile/MobileArtificialStudy";
import { createPageMetadata, createRouteJsonLd } from "@/lib/site";
import type { Viewport } from "next";

export const metadata = createPageMetadata("/words/artificial");
export const viewport: Viewport = {
  themeColor: [{ color: "#050507", media: "(max-width: 500px)" }],
};
const jsonLd = createRouteJsonLd("/words/artificial");

export default function ArtificialPage() {
  return (
    <>
      <JsonLd data={jsonLd} />
      <ArtificialEditionBridge>
        <MobileArtificialStudy />
      </ArtificialEditionBridge>
    </>
  );
}
