import { JsonLd } from "@/components/JsonLd";
import { WordsIndexEditionBridge } from "@/components/edition/WordsIndexEditionBridge";
import { MobileWordsIndex } from "@/components/words/mobile/MobileWordsIndex";
import { createPageMetadata, createRouteJsonLd } from "@/lib/machine/canonical-publication";

export const metadata = createPageMetadata("/words");
const jsonLd = createRouteJsonLd("/words");

export default function WordsIndexPage() {
  return (
    <>
      <JsonLd data={jsonLd} />
      <WordsIndexEditionBridge>
        <MobileWordsIndex />
      </WordsIndexEditionBridge>
    </>
  );
}
