import { createOgImage, ogImageSize } from "@/lib/og-image";
import { siteConfig } from "@/lib/site";

export const alt = "Words Over Time";
export const size = ogImageSize;
export const contentType = "image/png";

export default function OpenGraphImage() {
  return createOgImage({
    title: "word histories as visual evidence",
    description: siteConfig.description,
    keywords: ["semantic change", "public corpora", "visual essays", "source boundaries"],
  });
}
