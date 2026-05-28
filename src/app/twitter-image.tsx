import OpenGraphImage from "./opengraph-image";
import { ogImageSize } from "@/lib/og-image";

export const alt = "Words Over Time";
export const size = ogImageSize;
export const contentType = "image/png";

export default function TwitterImage() {
  return OpenGraphImage();
}
