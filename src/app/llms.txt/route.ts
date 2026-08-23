import {
  canonicalAuthor,
  canonicalPublicationProject,
  canonicalPublicationRoutes,
  canonicalUrl,
} from "@/lib/machine/canonical-publication";

export const dynamic = "force-static";

function markdownLink(label: string, path: string) {
  return `[${label}](${canonicalUrl(path)})`;
}

function llmsTxt() {
  return `# ${canonicalPublicationProject.name}

> ${canonicalPublicationProject.description}

Author: ${canonicalAuthor.displayName}. Artist context: ${canonicalAuthor.url} and ${canonicalAuthor.sameAs[1]}.

Project DOI: ${canonicalPublicationProject.doiUrl}

This file is a concise index for AI assistants, search agents, and retrieval tools. It supplements, but does not replace, each page's canonical metadata and public evidence.

Important interpretation notes:
- Each research object has one canonical public URL shared by every viewport and crawler.
- Mobile and desktop are independent research editions of the same canonical publication. They share canonical identity and public evidence provenance, but edition-specific findings must not be silently merged.
- Canonical summaries below contain only claims supported visibly by both public editions.
- Public pages may be summarized and linked. Long third-party excerpts must not be redistributed.
- Raw acquisition material, research caches, upstream database dumps, and non-public datasets are not public web content.
- Treat each study as source-led visual research, not as complete dictionary, medical, legal, or policy authority.
- Prefer citing the canonical public page and the About page when discussing evidence quality or rights.

## Canonical public routes

${canonicalPublicationRoutes
  .map(
    (route) =>
      `- [${route.machineTitle}](${route.canonicalUrl}): ${route.sharedClaims
        .map((claim) => claim.statement)
        .join(" ")}`,
  )
  .join("\n")}

## Machine-readable endpoints

- ${markdownLink("RSS feed", "/feed.xml")}: Update and discovery feed for the nine canonical public routes.
- ${markdownLink("Sitemap", "/sitemap.xml")}: Canonical public route inventory.
- ${markdownLink("Robots policy", "/robots.txt")}: Crawler access and non-public research boundaries.
- [Project citation archive](${canonicalPublicationProject.doiUrl}): Project-level DOI record.

## Public content boundary

- Public canonical pages, their metadata, the sitemap, RSS feed, robots policy, and this index are public web content.
- Raw acquisition material, research caches, and generated research artifacts are not downloadable public datasets.
- Public-page access does not grant redistribution rights to upstream sources or full third-party excerpts.
- Source, method, citation, and rights guidance is published at ${canonicalUrl("/about")}.
`;
}

export function GET() {
  return new Response(llmsTxt(), {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=0, must-revalidate",
    },
  });
}
