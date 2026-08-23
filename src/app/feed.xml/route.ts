import {
  CANONICAL_ORIGIN,
  canonicalPublicationProject,
  canonicalPublicationRoutes,
  type CanonicalPublicationContract,
} from "@/lib/machine/canonical-publication";

export const dynamic = "force-static";

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function rssItem(route: CanonicalPublicationContract) {
  return `<item>
    <title>${escapeXml(route.machineTitle)}</title>
    <link>${escapeXml(route.canonicalUrl)}</link>
    <guid isPermaLink="true">${escapeXml(route.canonicalUrl)}</guid>
    <description>${escapeXml(route.machineDescription)}</description>
    <category>${escapeXml(route.subject.kind)}</category>
    <pubDate>${new Date(route.publication.modifiedAt).toUTCString()}</pubDate>
  </item>`;
}

function rssFeed() {
  const publicRoutes = [...canonicalPublicationRoutes].sort(
    (left, right) =>
      right.publication.modifiedAt.localeCompare(left.publication.modifiedAt) ||
      left.path.localeCompare(right.path),
  );
  const lastBuildDate = publicRoutes.reduce<string>(
    (latest, route) =>
      route.publication.modifiedAt > latest ? route.publication.modifiedAt : latest,
    canonicalPublicationProject.publishedAt,
  );

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(canonicalPublicationProject.name)}</title>
    <link>${escapeXml(CANONICAL_ORIGIN)}</link>
    <description>${escapeXml(canonicalPublicationProject.description)}</description>
    <language>en</language>
    <lastBuildDate>${new Date(lastBuildDate).toUTCString()}</lastBuildDate>
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
