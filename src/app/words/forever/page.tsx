import { ForeverPoster } from "@/components/ForeverPoster";
import { JsonLd } from "@/components/JsonLd";
import { WordSeoSummary } from "@/components/WordSeoSummary";
import datasetJson from "@/data/generated/forever_dataset.json";
import { createPageMetadata, createRouteJsonLd } from "@/lib/site";
import type { ForeverGeneratedDataset } from "@/types/foreverRealData";

const fullDataset = datasetJson as ForeverGeneratedDataset;
const dataset: ForeverGeneratedDataset = {
  ...fullDataset,
  frequency: fullDataset.frequency.map((series) => ({
    ...series,
    points: series.points.map(({ year, frequencyPerMillion }) => ({
      year,
      frequencyPerMillion,
    })),
  })),
};

export const metadata = createPageMetadata("/words/forever");
const jsonLd = createRouteJsonLd("/words/forever");

export default function ForeverPage() {
  return (
    <>
      <JsonLd data={jsonLd} />
      <ForeverPoster dataset={dataset} />
      <WordSeoSummary path="/words/forever" />
    </>
  );
}
