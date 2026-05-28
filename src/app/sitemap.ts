import type { MetadataRoute } from "next";
import { absoluteUrl, siteConfig, siteRoutes } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return siteRoutes.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified: siteConfig.updatedAt,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
