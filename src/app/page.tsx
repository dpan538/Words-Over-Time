import { JsonLd } from "@/components/JsonLd";
import { DesktopHome } from "@/components/home/desktop/DesktopHome";
import { MobileHome } from "@/components/home/mobile/MobileHome";
import { createPageMetadata, homeJsonLd } from "@/lib/site";

export const metadata = createPageMetadata("/");

export default function Home() {
  return (
    <main aria-labelledby="home-title">
      <JsonLd data={homeJsonLd} />
      <h1 id="home-title" className="sr-only">Words Over Time</h1>
      <MobileHome />
      <DesktopHome />
    </main>
  );
}
