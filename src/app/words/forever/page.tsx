import { ForeverPoster } from "@/components/ForeverPoster";
import datasetJson from "@/data/generated/forever_dataset.json";
import type { ForeverGeneratedDataset } from "@/types/foreverRealData";

const dataset = datasetJson as ForeverGeneratedDataset;

export default function ForeverPage() {
  return <ForeverPoster dataset={dataset} />;
}
