import { MobilePrivacyStudy } from "@/components/privacy/mobile/MobilePrivacyStudy";
import { privacyMobileAnalysis } from "@/data/privacyMobileAnalysis";
import { MobileWordPageShell } from "@/editions/mobile/shared/MobileWordPageShell";

export function MobilePrivacyEdition() {
  return (
    <MobileWordPageShell path="/words/privacy">
      <MobilePrivacyStudy analysis={privacyMobileAnalysis} />
    </MobileWordPageShell>
  );
}
