import { EditionBoundary } from "@/components/edition/EditionBoundary";
import { JsonLd } from "@/components/JsonLd";
import { DesktopHomeEdition } from "@/editions/desktop/DesktopHomeEdition";
import { MobileHomeEdition } from "@/editions/mobile/MobileHomeEdition";
import { createPageMetadata, homeJsonLd } from "@/lib/site";

export const metadata = createPageMetadata("/");

export default function Home() {
  return (
    <>
      <JsonLd data={homeJsonLd} />
      <EditionBoundary desktop={<DesktopHomeEdition />} mobile={<MobileHomeEdition />} />
    </>
  );
}
