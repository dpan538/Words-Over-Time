import { ArtificialPoster } from "@/components/ArtificialPoster";
import { DesktopWordSeoSummary } from "@/components/word-study/desktop/DesktopWordSeoSummary";

/** Desktop-only artificial composition boundary. */
export function DesktopArtificialEdition() {
  return (
    <div data-artificial-edition="desktop">
      <ArtificialPoster />
      <DesktopWordSeoSummary path="/words/artificial" />
    </div>
  );
}
