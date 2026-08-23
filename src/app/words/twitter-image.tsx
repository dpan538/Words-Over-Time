import WordsOpenGraphImage, { alt as openGraphAlt } from "./opengraph-image";
import { ogImageSize } from "@/lib/og-image";

export const alt = openGraphAlt;
export const size = ogImageSize;
export const contentType = "image/png";

export default function WordsTwitterImage() {
  return WordsOpenGraphImage();
}
