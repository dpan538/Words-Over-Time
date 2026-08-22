import { JsonLd } from "@/components/JsonLd";
import { PrivacyEditionBridge } from "@/components/edition/PrivacyEditionBridge";
import { MobilePrivacyStudy } from "@/components/privacy/mobile/MobilePrivacyStudy";
import { privacyMobileAnalysis } from "@/data/privacyMobileAnalysis";
import { createPageMetadata, createRouteJsonLd } from "@/lib/site";

export const metadata = createPageMetadata("/words/privacy");
const jsonLd = createRouteJsonLd("/words/privacy");

export default function PrivacyPage() {
  return (
    <>
      <JsonLd data={jsonLd} />
      <PrivacyEditionBridge>
        <MobilePrivacyStudy analysis={privacyMobileAnalysis} />
      </PrivacyEditionBridge>
    </>
  );
}
