import { DepressionPoster } from "@/components/DepressionPoster";
import { JsonLd } from "@/components/JsonLd";
import { WordSeoSummary } from "@/components/WordSeoSummary";
import branchesJson from "@/data/generated/depression_branches.json";
import coverageJson from "@/data/generated/depression_coverage_report.json";
import evidenceJson from "@/data/generated/depression_evidence_normalized.json";
import frequencyJson from "@/data/generated/depression_frequency.json";
import prehistoryJson from "@/data/generated/depression_prehistory.json";
import { createPageMetadata, createRouteJsonLd } from "@/lib/site";
import type {
  DepressionBranchesFile,
  DepressionCoverageReport,
  DepressionEvidenceFile,
  DepressionFrequencyFile,
  DepressionPrehistoryFile,
} from "@/types/depressionData";

const fullFrequency = frequencyJson as DepressionFrequencyFile;
const frequency: DepressionFrequencyFile = {
  ...fullFrequency,
  series: fullFrequency.series.map((series) => ({
    ...series,
    points: series.points.map(({ year, frequencyPerMillion }) => ({
      year,
      frequencyPerMillion,
    })),
  })),
};
const prehistory = prehistoryJson as DepressionPrehistoryFile;
const branches = branchesJson as DepressionBranchesFile;
const evidence = evidenceJson as DepressionEvidenceFile;
const coverage = coverageJson as DepressionCoverageReport;

export const metadata = createPageMetadata("/words/depression");
const jsonLd = createRouteJsonLd("/words/depression");

export default function DepressionPage() {
  return (
    <>
      <JsonLd data={jsonLd} />
      <DepressionPoster
        frequency={frequency}
        prehistory={prehistory}
        branches={branches}
        evidence={evidence}
        coverage={coverage}
      />
      <WordSeoSummary path="/words/depression" />
    </>
  );
}
