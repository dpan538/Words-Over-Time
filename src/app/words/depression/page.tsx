import type { Viewport } from "next";
import { JsonLd } from "@/components/JsonLd";
import { DepressionEditionBridge } from "@/components/edition/DepressionEditionBridge";
import { MobileDepressionEdition } from "@/components/depression/mobile/MobileDepressionEdition";
import { createPageMetadata, createRouteJsonLd } from "@/lib/site";

export const metadata = createPageMetadata("/words/depression");
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};
const jsonLd = createRouteJsonLd("/words/depression");

export default function DepressionPage() {
  return (
    <>
      <JsonLd data={jsonLd} />
      <DepressionEditionBridge>
        <MobileDepressionEdition />
      </DepressionEditionBridge>
    </>
  );
}
