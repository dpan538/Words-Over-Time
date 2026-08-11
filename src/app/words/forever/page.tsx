import { JsonLd } from "@/components/JsonLd";
import { ResponsiveForeverEdition } from "@/components/ResponsiveForeverEdition";
import { WordPageShell } from "@/components/WordPageShell";
import { MobileForeverStudy } from "@/components/forever/mobile/MobileForeverStudy";
import { foreverMobileAnalysis } from "@/data/foreverMobileAnalysis";
import { createPageMetadata, createRouteJsonLd } from "@/lib/site";

export const metadata = createPageMetadata("/words/forever");
const jsonLd = createRouteJsonLd("/words/forever");

export default function ForeverPage() {
  return (
    <>
      <JsonLd data={jsonLd} />
      <WordPageShell path="/words/forever">
        <ResponsiveForeverEdition>
          <MobileForeverStudy analysis={foreverMobileAnalysis} />
        </ResponsiveForeverEdition>
      </WordPageShell>
    </>
  );
}
