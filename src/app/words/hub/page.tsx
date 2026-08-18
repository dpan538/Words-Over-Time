import { HubPoster } from "@/components/HubPoster";
import { HubEditionBoundary } from "@/components/hub/HubEditionBoundary";
import { JsonLd } from "@/components/JsonLd";
import { WordPageShell } from "@/components/WordPageShell";
import { MobileHubStudy } from "@/components/hub/mobile/MobileHubStudy";
import { hubMobileAnalysis } from "@/data/hubMobileAnalysis";
import { createPageMetadata, createRouteJsonLd } from "@/lib/site";

export const metadata = createPageMetadata("/words/hub");
const jsonLd = createRouteJsonLd("/words/hub");

export default function HubPage() {
  return (
    <>
      <JsonLd data={jsonLd} />
      <HubEditionBoundary
        mobile={<MobileHubStudy analysis={hubMobileAnalysis} />}
        desktop={(
          <WordPageShell path="/words/hub">
            <HubPoster />
          </WordPageShell>
        )}
      />
    </>
  );
}
