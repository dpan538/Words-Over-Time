import { HubPoster } from "@/components/HubPoster";
import { JsonLd } from "@/components/JsonLd";
import { WordPageShell } from "@/components/WordPageShell";
import { createPageMetadata, createRouteJsonLd } from "@/lib/site";

export const metadata = createPageMetadata("/words/hub");
const jsonLd = createRouteJsonLd("/words/hub");

export default function HubPage() {
  return (
    <>
      <JsonLd data={jsonLd} />
      <WordPageShell path="/words/hub">
        <HubPoster />
      </WordPageShell>
    </>
  );
}
