import { DepressionPoster } from "@/components/DepressionPoster";
import branchesJson from "@/data/generated/depression_branches.json";
import coverageJson from "@/data/generated/depression_coverage_report.json";
import evidenceJson from "@/data/generated/depression_evidence_normalized.json";
import frequencyJson from "@/data/generated/depression_frequency.json";
import prehistoryJson from "@/data/generated/depression_prehistory.json";
import type {
  DepressionBranchesFile,
  DepressionCoverageReport,
  DepressionEvidenceFile,
  DepressionFrequencyFile,
  DepressionPrehistoryFile,
} from "@/types/depressionData";

const frequency = frequencyJson as DepressionFrequencyFile;
const prehistory = prehistoryJson as DepressionPrehistoryFile;
const branches = branchesJson as DepressionBranchesFile;
const evidence = evidenceJson as DepressionEvidenceFile;
const coverage = coverageJson as DepressionCoverageReport;

export default function DepressionPage() {
  return (
    <DepressionPoster
      frequency={frequency}
      prehistory={prehistory}
      branches={branches}
      evidence={evidence}
      coverage={coverage}
    />
  );
}
