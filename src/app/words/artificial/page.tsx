import { ArtificialPoster } from "@/components/ArtificialPoster";
import { createPageMetadata } from "@/lib/site";

export const metadata = createPageMetadata("/words/artificial");

export default function ArtificialPage() {
  return <ArtificialPoster />;
}
