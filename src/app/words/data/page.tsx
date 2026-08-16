import { EditionBoundary } from "@/components/edition/EditionBoundary";
import { JsonLd } from "@/components/JsonLd";
import { DesktopDataEdition } from "@/editions/desktop/DesktopDataEdition";
import { MobileDataEdition } from "@/editions/mobile/MobileDataEdition";
import { createPageMetadata, createRouteJsonLd } from "@/lib/site";

export const metadata = createPageMetadata("/words/data");
const jsonLd = createRouteJsonLd("/words/data");

export default function DataPage() {
  return (
    <>
      <JsonLd data={jsonLd} />
      <EditionBoundary desktop={<DesktopDataEdition />} mobile={<MobileDataEdition />} />
    </>
  );
}
