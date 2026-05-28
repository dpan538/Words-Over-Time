import { HubPoster } from "@/components/HubPoster";
import { createPageMetadata } from "@/lib/site";

export const metadata = createPageMetadata("/words/hub");

export default function HubPage() {
  return <HubPoster />;
}
