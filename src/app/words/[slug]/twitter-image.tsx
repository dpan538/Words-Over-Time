import WordOpenGraphImage from "./opengraph-image";
import { ogImageSize } from "@/lib/og-image";

export const alt = "Words Over Time word-study social preview";
export const size = ogImageSize;
export const contentType = "image/png";
export const dynamicParams = false;

type ImageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export { generateStaticParams } from "./opengraph-image";

export default function WordTwitterImage(props: ImageProps) {
  return WordOpenGraphImage(props);
}
