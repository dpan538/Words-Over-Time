import { JsonLd } from "@/components/JsonLd";
import { ForeverEditionBridge } from "@/components/edition/ForeverEditionBridge";
import { MobileForeverStudy } from "@/components/forever/mobile/MobileForeverStudy";
import { foreverMobileAnalysis } from "@/data/foreverMobileAnalysis";
import { createPageMetadata, createRouteJsonLd } from "@/lib/site";

export const metadata = createPageMetadata("/words/forever");
const jsonLd = createRouteJsonLd("/words/forever");

export default function ForeverPage() {
  return (
    <>
      <JsonLd data={jsonLd} />
      <ForeverEditionBridge>
        <MobileForeverStudy analysis={foreverMobileAnalysis} />
      </ForeverEditionBridge>
    </>
  );
}
