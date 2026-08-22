import { ArtificialPoster } from "@/components/ArtificialPoster";
import { WordPageShell } from "@/components/WordPageShell";

/** Desktop-only artificial composition boundary. */
export function DesktopArtificialEdition() {
  return (
    <div data-artificial-edition="desktop">
      <WordPageShell path="/words/artificial">
        <ArtificialPoster />
      </WordPageShell>
    </div>
  );
}
