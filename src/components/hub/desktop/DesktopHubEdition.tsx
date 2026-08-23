import { HubPoster } from "@/components/HubPoster";
import { DesktopWordSeoSummary } from "@/components/word-study/desktop/DesktopWordSeoSummary";

/** Desktop-only hub composition boundary. */
export function DesktopHubEdition() {
  return (
    <div data-hub-edition="desktop">
      <HubPoster />
      <DesktopWordSeoSummary path="/words/hub" />
    </div>
  );
}
