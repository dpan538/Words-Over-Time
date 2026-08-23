import { notFound } from "next/navigation";
import {
  canonicalWordRoutes,
  type CanonicalRoutePath,
} from "@/lib/machine/canonical-publication";
import { createCanonicalSocialImage, ogImageSize } from "@/lib/og-image";

export const alt = "Words Over Time word-study social preview";
export const size = ogImageSize;
export const contentType = "image/png";
export const dynamicParams = false;

type ImageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return canonicalWordRoutes.map((route) => ({
    slug: route.path.split("/").at(-1) || "",
  }));
}

export default async function WordOpenGraphImage({ params }: ImageProps) {
  const { slug } = await params;
  const path = `/words/${slug}` as CanonicalRoutePath;
  const route = canonicalWordRoutes.find((candidate) => candidate.path === path);

  if (!route) notFound();

  return createCanonicalSocialImage(route.path);
}
