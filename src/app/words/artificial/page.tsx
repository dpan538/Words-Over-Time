import { ArtificialPoster } from "@/components/ArtificialPoster";
import { JsonLd } from "@/components/JsonLd";
import { WordPageShell } from "@/components/WordPageShell";
import { createPageMetadata, createRouteJsonLd } from "@/lib/site";

export const metadata = createPageMetadata("/words/artificial");
const jsonLd = createRouteJsonLd("/words/artificial");

export default function ArtificialPage() {
  return (
    <>
      <JsonLd data={jsonLd} />
      <WordPageShell path="/words/artificial">
        <ArtificialPoster />
      </WordPageShell>
    </>
  );
}
