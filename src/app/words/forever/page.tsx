import { ForeverPoster } from "@/components/ForeverPoster";
import { JsonLd } from "@/components/JsonLd";
import datasetJson from "@/data/generated/forever_dataset.json";
import { createPageMetadata, createRouteJsonLd } from "@/lib/site";
import type { ForeverGeneratedDataset } from "@/types/foreverRealData";

const dataset = datasetJson as ForeverGeneratedDataset;

export const metadata = createPageMetadata("/words/forever");
const jsonLd = createRouteJsonLd("/words/forever");

export default function ForeverPage() {
  return (
    <>
      <JsonLd data={jsonLd} />
      <ForeverPoster dataset={dataset} />
    </>
  );
}
