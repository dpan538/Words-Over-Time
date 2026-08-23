import type { MetadataRoute } from "next";
import {
  canonicalPublicationRoutes,
  canonicalSocialImagePath,
  canonicalUrl,
} from "@/lib/machine/canonical-publication";

export default function sitemap(): MetadataRoute.Sitemap {
  return canonicalPublicationRoutes.map((route) => ({
    url: route.canonicalUrl,
    lastModified: route.publication.modifiedAt,
    images: [canonicalUrl(canonicalSocialImagePath(route))],
  }));
}
