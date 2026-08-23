"use client";

import { ForeverPoster } from "@/components/ForeverPoster";
import { DesktopWordSeoSummary } from "@/components/word-study/desktop/DesktopWordSeoSummary";
import datasetJson from "@/data/generated/forever_dataset.json";
import type {
  ForeverClientDataset,
  ForeverGeneratedDataset,
} from "@/types/foreverRealData";

const fullDataset = datasetJson as unknown as ForeverGeneratedDataset;
const referencedInspectorIds = new Set([
  ...fullDataset.frequency.map((series) => series.inspectorId),
  ...fullDataset.phrases.map((phrase) => phrase.inspectorId),
  ...fullDataset.collocates.map((collocate) => collocate.inspectorId),
  ...fullDataset.snippets.map((snippet) => snippet.inspectorId),
  ...fullDataset.categories.flatMap((category) =>
    category.eraScores.map((score) => score.inspectorId),
  ),
  ...fullDataset.atlas.nodes.map((node) => node.inspectorId),
  ...fullDataset.atlas.edges.map((edge) => edge.inspectorId),
  ...fullDataset.ledger.map((cell) => cell.inspectorId),
]);

const dataset: ForeverClientDataset = {
  coverage: fullDataset.coverage,
  eras: fullDataset.eras,
  frequency: fullDataset.frequency.map((series) => ({
    ...series,
    points: series.points.map(({ year, frequencyPerMillion }) => ({
      year,
      frequencyPerMillion,
    })),
  })),
  prehistory: fullDataset.prehistory,
  modernContext: fullDataset.modernContext,
  phrases: fullDataset.phrases,
  collocates: fullDataset.collocates,
  snippets: fullDataset.snippets,
  categories: fullDataset.categories,
  atlas: fullDataset.atlas,
  ledger: fullDataset.ledger,
  inspectors: fullDataset.inspectors
    .filter((entry) => referencedInspectorIds.has(entry.id))
    .map(
      ({
        id,
        title,
        visualType,
        elementType,
        period,
        evidenceCount,
        documentFrequency,
        scoreType,
        scoreValue,
        sourceCorpus,
        relatedSnippetIds,
        caveats,
      }) => ({
        id,
        title,
        visualType,
        elementType,
        period,
        evidenceCount,
        documentFrequency,
        scoreType,
        scoreValue,
        sourceCorpus,
        relatedSnippetIds,
        caveats,
      }),
    ),
};

/** Desktop-only forever composition and data boundary. */
export function DesktopForeverEdition() {
  return (
    <div data-forever-edition="desktop">
      <ForeverPoster dataset={dataset} />
      <DesktopWordSeoSummary path="/words/forever" />
    </div>
  );
}
