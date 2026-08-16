import { EditionBoundary } from "@/components/edition/EditionBoundary";
import { JsonLd } from "@/components/JsonLd";
import { DesktopAboutEdition } from "@/editions/desktop/DesktopAboutEdition";
import { MobileAboutEdition } from "@/editions/mobile/MobileAboutEdition";
import { createPageMetadata, createRouteJsonLd } from "@/lib/site";

export const metadata = createPageMetadata("/about");
const jsonLd = createRouteJsonLd("/about");

export default function AboutPage() {
  return (
    <>
      <JsonLd data={jsonLd} />
      <EditionBoundary desktop={<DesktopAboutEdition />} mobile={<MobileAboutEdition />} />
    </>
  );
}
