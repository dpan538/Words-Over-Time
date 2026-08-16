import { MobileForeverStudy } from "@/components/forever/mobile/MobileForeverStudy";
import { foreverMobileAnalysis } from "@/data/foreverMobileAnalysis";
import { MobileWordPageShell } from "@/editions/mobile/shared/MobileWordPageShell";

export function MobileForeverEdition() {
  return (
    <MobileWordPageShell path="/words/forever">
      <MobileForeverStudy analysis={foreverMobileAnalysis} />
    </MobileWordPageShell>
  );
}
