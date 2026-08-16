import { EditionBoundary } from "@/components/edition/EditionBoundary";
import { JsonLd } from "@/components/JsonLd";
import { DesktopPrivacyEdition } from "@/editions/desktop/DesktopPrivacyEdition";
import { MobilePrivacyEdition } from "@/editions/mobile/MobilePrivacyEdition";
import { createPageMetadata, createRouteJsonLd } from "@/lib/site";

export const metadata = createPageMetadata("/words/privacy");
const jsonLd = createRouteJsonLd("/words/privacy");

export default function PrivacyPage() {
  return (
    <>
      <JsonLd data={jsonLd} />
      <EditionBoundary desktop={<DesktopPrivacyEdition />} mobile={<MobilePrivacyEdition />} />
    </>
  );
}
