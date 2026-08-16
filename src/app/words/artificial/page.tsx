import { ArtificialPoster } from "@/components/ArtificialPoster";
import { MobileArtificialStudy } from "@/components/artificial/mobile/MobileArtificialStudy";
import { ResponsiveArtificialEdition } from "@/components/artificial/mobile/ResponsiveArtificialEdition";
import { JsonLd } from "@/components/JsonLd";
import { WordPageShell } from "@/components/WordPageShell";
import { createPageMetadata, createRouteJsonLd } from "@/lib/site";
import type { Viewport } from "next";

export const metadata = createPageMetadata("/words/artificial");
export const viewport: Viewport = {
  themeColor: [{ color: "#050507", media: "(max-width: 959px)" }],
};
const jsonLd = createRouteJsonLd("/words/artificial");

export default function ArtificialPage() {
  return (
    <>
      <JsonLd data={jsonLd} />
      <ResponsiveArtificialEdition
        desktop={
          <WordPageShell path="/words/artificial">
            <ArtificialPoster />
          </WordPageShell>
        }
        mobile={<MobileArtificialStudy />}
      />
    </>
  );
}
