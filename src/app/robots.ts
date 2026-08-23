import type { MetadataRoute } from "next";
import { canonicalUrl } from "@/lib/machine/canonical-publication";

const researchDataDisallow = [
  "/docs/",
  "/docs/research/",
  "/raw/",
  "/cache/",
  "/docs/research/*/raw/",
  "/docs/research/*/cache/",
  "/docs/research/*/research_expansion_cache/",
  "/docs/research/*/etymology_cache/",
  "/docs/research/*/legacy_chart_runs/",
  "/*research_expansion_cache*",
  "/*etymology_cache*",
  "/*legacy_chart_runs*",
];

const publicContentAllow = ["/", "/about", "/words/", "/feed.xml", "/llms.txt"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/about", "/words/", "/feed.xml"],
        disallow: researchDataDisallow,
      },
      {
        userAgent: ["OAI-SearchBot", "ChatGPT-User"],
        allow: publicContentAllow,
        disallow: researchDataDisallow,
      },
      {
        userAgent: ["GPTBot", "Google-Extended", "CCBot"],
        allow: publicContentAllow,
        disallow: researchDataDisallow,
      },
      {
        userAgent: ["ClaudeBot", "Claude-SearchBot", "PerplexityBot", "Applebot"],
        allow: publicContentAllow,
        disallow: researchDataDisallow,
      },
    ],
    sitemap: canonicalUrl("/sitemap.xml"),
  };
}
