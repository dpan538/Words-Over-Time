import { ForeverMobileEditorial } from "@/components/ForeverMobileEditorial";
import { JsonLd } from "@/components/JsonLd";
import { ResponsiveForeverEdition } from "@/components/ResponsiveForeverEdition";
import { WordPageShell } from "@/components/WordPageShell";
import datasetJson from "@/data/generated/forever_dataset.json";
import { createPageMetadata, createRouteJsonLd } from "@/lib/site";
import type { ForeverGeneratedDataset } from "@/types/foreverRealData";

const fullDataset = datasetJson as unknown as ForeverGeneratedDataset;

export const metadata = createPageMetadata("/words/forever");
const jsonLd = createRouteJsonLd("/words/forever");

export default function ForeverPage() {
  return (
    <>
      <JsonLd data={jsonLd} />
      <WordPageShell path="/words/forever">
        <ResponsiveForeverEdition>
          <ForeverMobileEditorial dataset={fullDataset} />
        </ResponsiveForeverEdition>
      </WordPageShell>
    </>
  );
}
