import { EditionBoundary } from "@/components/edition/EditionBoundary";
import { JsonLd } from "@/components/JsonLd";
import { DesktopWordsEdition } from "@/editions/desktop/DesktopWordsEdition";
import { MobileWordsEdition } from "@/editions/mobile/MobileWordsEdition";
import { createPageMetadata, createRouteJsonLd } from "@/lib/site";

export const metadata = createPageMetadata("/words");
const jsonLd = createRouteJsonLd("/words");

export default function WordsIndexPage() {
  return (
    <>
      <JsonLd data={jsonLd} />
      <EditionBoundary desktop={<DesktopWordsEdition />} mobile={<MobileWordsEdition />} />
    </>
  );
}
