import { HubPoster } from "@/editions/mobile/hub/MobileHubPoster";
import { MobileWordPageShell } from "@/editions/mobile/shared/MobileWordPageShell";

export function MobileHubEdition() {
  return (
    <MobileWordPageShell path="/words/hub">
      <HubPoster />
    </MobileWordPageShell>
  );
}
