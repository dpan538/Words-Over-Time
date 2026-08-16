import { headers } from "next/headers";
import { DepressionPoster } from "@/components/DepressionPoster";
import { JsonLd } from "@/components/JsonLd";
import { WordPageShell } from "@/components/WordPageShell";
import { MobileDepressionEdition } from "@/components/depression/mobile/MobileDepressionEdition";
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

function isMobileRequest(userAgent: string, mobileClientHint: string | null) {
  if (mobileClientHint === "?1") return true;
  return /Android|iPhone|iPad|iPod|Mobile|Opera Mini|IEMobile/i.test(userAgent);
}

export default async function DepressionPage({
  searchParams,
}: {
  searchParams: Promise<{ edition?: string }>;
}) {
  const requestHeaders = await headers();
  const { edition } = await searchParams;
  const mobile = edition === "mobile" || isMobileRequest(
    requestHeaders.get("user-agent") ?? "",
    requestHeaders.get("sec-ch-ua-mobile"),
  );

  if (mobile) {
    return <MobileDepressionEdition />;
  }

  return (
    <>
      <JsonLd data={jsonLd} />
      <WordPageShell path="/words/depression">
        <DepressionPoster
          frequency={frequency}
          prehistory={prehistory}
          branches={branches}
          evidence={evidence}
          coverage={coverage}
        />
      </WordPageShell>
    </>
  );
}
