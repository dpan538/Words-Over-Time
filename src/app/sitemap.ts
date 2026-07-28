import type { MetadataRoute } from "next";
import { absoluteUrl, routeSocialImagePath, siteRoutes } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return siteRoutes.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified: route.updatedAt,
    images: [absoluteUrl(routeSocialImagePath(route))],
  }));
}
