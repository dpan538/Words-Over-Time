import { ArtificialPoster } from "@/components/ArtificialPoster";
import { MobileArtificialStudy } from "@/components/artificial/mobile/MobileArtificialStudy";
import { ResponsiveArtificialEdition } from "@/components/artificial/mobile/ResponsiveArtificialEdition";
import { JsonLd } from "@/components/JsonLd";
import { WordPageShell } from "@/components/WordPageShell";
import { createPageMetadata, createRouteJsonLd } from "@/lib/site";

export const metadata = createPageMetadata("/words/artificial");
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
