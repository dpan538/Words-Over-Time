import { JsonLd } from "@/components/JsonLd";
import { HubEditionBridge } from "@/components/edition/HubEditionBridge";
import { MobileHubStudy } from "@/components/hub/mobile/MobileHubStudy";
import { hubMobileAnalysis } from "@/data/hubMobileAnalysis";
import { createPageMetadata, createRouteJsonLd } from "@/lib/machine/canonical-publication";

export const metadata = createPageMetadata("/words/hub");
const jsonLd = createRouteJsonLd("/words/hub");

export default function HubPage() {
  return (
    <>
      <JsonLd data={jsonLd} />
      <HubEditionBridge>
        <MobileHubStudy analysis={hubMobileAnalysis} />
      </HubEditionBridge>
    </>
  );
}
