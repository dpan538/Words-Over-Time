import { JsonLd } from "@/components/JsonLd";
import { ResponsiveForeverEdition } from "@/components/ResponsiveForeverEdition";
import { WordPageShell } from "@/components/WordPageShell";
import { ForeverMobileDataGate } from "@/components/forever/mobile/ForeverMobileDataGate";
import { foreverAnalysis } from "@/data/foreverAnalysis";
import { createPageMetadata, createRouteJsonLd } from "@/lib/site";

export const metadata = createPageMetadata("/words/forever");
const jsonLd = createRouteJsonLd("/words/forever");

export default function ForeverPage() {
  return (
    <>
      <JsonLd data={jsonLd} />
      <WordPageShell path="/words/forever">
        <ResponsiveForeverEdition>
          <ForeverMobileDataGate analysis={foreverAnalysis} />
        </ResponsiveForeverEdition>
      </WordPageShell>
    </>
  );
}
