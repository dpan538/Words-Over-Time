import { createRouteOgImage, ogImageSize } from "@/lib/og-image";
import { routeByPath, siteRoutes, wordRoutes } from "@/lib/site";

export const alt = "Words Over Time word study";
export const size = ogImageSize;
export const contentType = "image/png";

type ImageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return wordRoutes.map((route) => ({
    slug: route.path.split("/").at(-1) || "",
  }));
}

export default async function WordOpenGraphImage({ params }: ImageProps) {
  const { slug } = await params;
  const route = routeByPath(`/words/${slug}`) || siteRoutes[0];

  return createRouteOgImage(route);
}
