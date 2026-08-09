import { JsonLd } from "@/components/JsonLd";
import { MobileAboutEditorial } from "@/components/MobileAboutEditorial";
import { ResponsiveAboutEdition } from "@/components/ResponsiveAboutEdition";
import { createPageMetadata, createRouteJsonLd } from "@/lib/site";

export const metadata = createPageMetadata("/about");
const jsonLd = createRouteJsonLd("/about");

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-paper-mobile text-ink min-[960px]:bg-wheat">
      <JsonLd data={jsonLd} />
      <ResponsiveAboutEdition>
        <MobileAboutEditorial />
      </ResponsiveAboutEdition>
    </main>
  );
}
