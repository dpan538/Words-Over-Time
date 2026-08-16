import { ForeverPoster } from "@/components/ForeverPoster";
import { WordSeoSummary } from "@/components/WordSeoSummary";
import datasetJson from "@/data/generated/forever_dataset.json";
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

export function DesktopForeverEdition() {
  return (
    <>
      <ForeverPoster dataset={dataset} />
      <WordSeoSummary path="/words/forever" />
    </>
  );
}
