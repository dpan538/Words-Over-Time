import { EditionBoundary } from "@/components/edition/EditionBoundary";
import { JsonLd } from "@/components/JsonLd";
import { DesktopDepressionEdition } from "@/editions/desktop/DesktopDepressionEdition";
import { MobileDepressionRescueEdition } from "@/editions/mobile/depression/MobileDepressionRescueEdition";
import { createPageMetadata, createRouteJsonLd } from "@/lib/site";

export const metadata = createPageMetadata("/words/depression");
const jsonLd = createRouteJsonLd("/words/depression");

export default function DepressionPage() {
  return (
    <>
      <JsonLd data={jsonLd} />
      <EditionBoundary
        desktop={<DesktopDepressionEdition />}
        mobile={<MobileDepressionRescueEdition />}
      />
    </>
  );
}
