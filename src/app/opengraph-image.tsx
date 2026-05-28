import { createOgImage, ogImageSize } from "@/lib/og-image";
import { siteConfig } from "@/lib/site";

export const alt = "Words Over Time";
export const size = ogImageSize;
export const contentType = "image/png";

export default function OpenGraphImage() {
  return createOgImage({
    title: "semantic histories as visual evidence",
    description: siteConfig.description,
    keywords: ["Dai Pan", "semantic change", "word frequency", "search statistics", "infographic art"],
  });
}
