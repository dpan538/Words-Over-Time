import { ForeverPoster } from "@/components/ForeverPoster";
import datasetJson from "@/data/generated/forever_dataset.json";
import { createPageMetadata } from "@/lib/site";
import type { ForeverGeneratedDataset } from "@/types/foreverRealData";

const dataset = datasetJson as ForeverGeneratedDataset;

export const metadata = createPageMetadata("/words/forever");

export default function ForeverPage() {
  return <ForeverPoster dataset={dataset} />;
}
