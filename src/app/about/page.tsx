import { JsonLd } from "@/components/JsonLd";
import { MobileAbout } from "@/components/about/mobile/MobileAbout";
import { AboutEditionBridge } from "@/components/edition/AboutEditionBridge";
import { createPageMetadata, createRouteJsonLd } from "@/lib/site";

export const metadata = createPageMetadata("/about");
const jsonLd = createRouteJsonLd("/about");

export default function AboutPage() {
  return (
    <main aria-labelledby="about-title">
      <JsonLd data={jsonLd} />
      <h1 id="about-title" className="sr-only">About Words Over Time</h1>
      <AboutEditionBridge>
        <MobileAbout />
      </AboutEditionBridge>
    </main>
  );
}
