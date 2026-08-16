import branchesJson from "@/data/generated/depression_branches.json";
import coverageJson from "@/data/generated/depression_coverage_report.json";
import evidenceJson from "@/data/generated/depression_evidence_normalized.json";
import frequencyJson from "@/data/generated/depression_frequency.json";
import prehistoryJson from "@/data/generated/depression_prehistory.json";
import { MobileWordPageShell } from "@/editions/mobile/shared/MobileWordPageShell";
import type {
  DepressionBranchesFile,
  DepressionCoverageReport,
  DepressionEvidenceFile,
  DepressionFrequencyFile,
  DepressionPrehistoryFile,
} from "@/types/depressionData";
import { MobileDepressionPoster } from "./MobileDepressionPoster";

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

/** Mechanical copy of the rescue SHA's normally rendered narrow-viewport path. */
export function MobileDepressionRescueEdition() {
  return (
    <MobileWordPageShell path="/words/depression">
      <MobileDepressionPoster
        frequency={frequency}
        prehistory={prehistory}
        branches={branches}
        evidence={evidence}
        coverage={coverage}
      />
    </MobileWordPageShell>
  );
}
