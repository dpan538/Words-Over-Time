import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

const researchDataDisallow = [
  "/docs/",
  "/docs/research/",
  "/docs/research/*/raw/",
  "/docs/research/*/cache/",
  "/docs/research/*/research_expansion_cache/",
  "/docs/research/*/etymology_cache/",
  "/docs/research/*/legacy_chart_runs/",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/about", "/words/", "/feed.xml"],
        disallow: researchDataDisallow,
      },
      {
        userAgent: [
          "GPTBot",
          "ChatGPT-User",
          "OAI-SearchBot",
          "ClaudeBot",
          "Claude-SearchBot",
          "PerplexityBot",
          "Applebot",
          "Google-Extended",
          "CCBot",
        ],
        allow: ["/", "/about", "/words/", "/feed.xml", "/llms.txt"],
        disallow: researchDataDisallow,
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
