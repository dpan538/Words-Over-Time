import { ArtificialPoster } from "@/components/ArtificialPoster";
import { JsonLd } from "@/components/JsonLd";
import { WordSeoSummary } from "@/components/WordSeoSummary";
import { createPageMetadata, createRouteJsonLd } from "@/lib/site";

export const metadata = createPageMetadata("/words/artificial");
const jsonLd = createRouteJsonLd("/words/artificial");

export default function ArtificialPage() {
  return (
    <>
      <JsonLd data={jsonLd} />
      <ArtificialPoster />
      <WordSeoSummary path="/words/artificial" />
    </>
  );
}
