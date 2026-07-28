import { absoluteUrl, siteConfig, siteRoutes } from "@/lib/site";

export const dynamic = "force-static";

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function rssItem(route: (typeof siteRoutes)[number]) {
  const url = absoluteUrl(route.path);

  return `<item>
    <title>${escapeXml(`${route.title} | ${siteConfig.name}`)}</title>
    <link>${escapeXml(url)}</link>
    <guid isPermaLink="true">${escapeXml(url)}</guid>
    <description>${escapeXml(route.summary || route.seoDescription || route.description)}</description>
    <category>${escapeXml(route.section)}</category>
    <pubDate>${new Date(route.updatedAt).toUTCString()}</pubDate>
  </item>`;
}

function rssFeed() {
  const publicRoutes = siteRoutes.filter((route) => route.path !== "/");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(siteConfig.name)}</title>
    <link>${escapeXml(siteConfig.url)}</link>
    <description>${escapeXml(siteConfig.description)}</description>
    <language>en</language>
    <lastBuildDate>${new Date(siteConfig.updatedAt).toUTCString()}</lastBuildDate>
    <docs>https://www.rssboard.org/rss-specification</docs>
    ${publicRoutes.map((route) => rssItem(route)).join("\n    ")}
  </channel>
</rss>`;
}

export function GET() {
  return new Response(rssFeed(), {
    headers: {
      "content-type": "application/rss+xml; charset=utf-8",
      "cache-control": "public, max-age=0, must-revalidate",
    },
  });
}
