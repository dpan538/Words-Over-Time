import { JsonLd } from "@/components/JsonLd";
import { DataEditionBridge } from "@/components/edition/DataEditionBridge";
import { MobileDataStudy } from "@/components/data/mobile/MobileDataStudy";
import { createPageMetadata, createRouteJsonLd } from "@/lib/site";
import type { Viewport } from "next";

export const metadata = createPageMetadata("/words/data");
export const viewport: Viewport = {
  themeColor: [{ color: "#1570ac", media: "(max-width: 500px)" }],
  viewportFit: "cover",
};
const jsonLd = createRouteJsonLd("/words/data");

export default function DataPage() {
  return (
    <>
      <JsonLd data={jsonLd} />
      <DataEditionBridge>
        <MobileDataStudy />
      </DataEditionBridge>
    </>
  );
}
