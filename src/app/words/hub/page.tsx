import { EditionBoundary } from "@/components/edition/EditionBoundary";
import { JsonLd } from "@/components/JsonLd";
import { DesktopHubEdition } from "@/editions/desktop/DesktopHubEdition";
import { MobileHubEdition } from "@/editions/mobile/MobileHubEdition";
import { createPageMetadata, createRouteJsonLd } from "@/lib/site";

export const metadata = createPageMetadata("/words/hub");
const jsonLd = createRouteJsonLd("/words/hub");

export default function HubPage() {
  return (
    <>
      <JsonLd data={jsonLd} />
      <EditionBoundary desktop={<DesktopHubEdition />} mobile={<MobileHubEdition />} />
    </>
  );
}
