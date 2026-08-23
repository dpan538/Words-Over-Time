import { canonicalSocialPreview } from "@/lib/machine/social-preview";
import { createCanonicalSocialImage, ogImageSize } from "@/lib/og-image";

const preview = canonicalSocialPreview("/words");

export const alt = preview.imageAlt;
export const size = ogImageSize;
export const contentType = "image/png";

export default function WordsOpenGraphImage() {
  return createCanonicalSocialImage("/words");
}
