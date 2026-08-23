import { canonicalSocialPreview } from "@/lib/machine/social-preview";
import { createCanonicalSocialImage, ogImageSize } from "@/lib/og-image";

const preview = canonicalSocialPreview("/about");

export const alt = preview.imageAlt;
export const size = ogImageSize;
export const contentType = "image/png";

export default function AboutOpenGraphImage() {
  return createCanonicalSocialImage("/about");
}
