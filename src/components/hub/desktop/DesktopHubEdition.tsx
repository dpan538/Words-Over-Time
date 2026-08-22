import { HubPoster } from "@/components/HubPoster";
import { WordPageShell } from "@/components/WordPageShell";

/** Desktop-only hub composition boundary. */
export function DesktopHubEdition() {
  return (
    <div data-hub-edition="desktop">
      <WordPageShell path="/words/hub">
        <HubPoster />
      </WordPageShell>
    </div>
  );
}
