import { HubPoster } from "@/components/HubPoster";
import { WordSeoSummary } from "@/components/WordSeoSummary";

export function DesktopHubEdition() {
  return (
    <>
      <HubPoster />
      <WordSeoSummary path="/words/hub" />
    </>
  );
}
