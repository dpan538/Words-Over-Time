import { HubPoster } from "@/components/HubPoster";
import { JsonLd } from "@/components/JsonLd";
import { createPageMetadata, createRouteJsonLd } from "@/lib/site";

export const metadata = createPageMetadata("/words/hub");
const jsonLd = createRouteJsonLd("/words/hub");

export default function HubPage() {
  return (
    <>
      <JsonLd data={jsonLd} />
      <HubPoster />
    </>
  );
}
