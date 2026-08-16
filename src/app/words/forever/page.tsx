import { EditionBoundary } from "@/components/edition/EditionBoundary";
import { JsonLd } from "@/components/JsonLd";
import { DesktopForeverEdition } from "@/editions/desktop/DesktopForeverEdition";
import { MobileForeverEdition } from "@/editions/mobile/MobileForeverEdition";
import { createPageMetadata, createRouteJsonLd } from "@/lib/site";

export const metadata = createPageMetadata("/words/forever");
const jsonLd = createRouteJsonLd("/words/forever");

export default function ForeverPage() {
  return (
    <>
      <JsonLd data={jsonLd} />
      <EditionBoundary desktop={<DesktopForeverEdition />} mobile={<MobileForeverEdition />} />
    </>
  );
}
