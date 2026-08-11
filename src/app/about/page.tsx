import { JsonLd } from "@/components/JsonLd";
import { DesktopAbout } from "@/components/about/desktop/DesktopAbout";
import { MobileAbout } from "@/components/about/mobile/MobileAbout";
import { createPageMetadata, createRouteJsonLd } from "@/lib/site";

export const metadata = createPageMetadata("/about");
const jsonLd = createRouteJsonLd("/about");

export default function AboutPage() {
  return (
    <main aria-labelledby="about-title">
      <JsonLd data={jsonLd} />
      <h1 id="about-title" className="sr-only">About Words Over Time</h1>
      <MobileAbout />
      <DesktopAbout />
    </main>
  );
}
