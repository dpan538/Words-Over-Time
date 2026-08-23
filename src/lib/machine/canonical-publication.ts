import "server-only";

import type { Metadata } from "next";
import {
  CANONICAL_ORIGIN,
  canonicalAuthor,
  canonicalPublicationProject,
  canonicalPublicationRoutes,
  type CanonicalPublicationContract,
  type CanonicalRoutePath,
} from "./canonical-publication-data";

export {
  CANONICAL_ORIGIN,
  canonicalAuthor,
  canonicalPublicationProject,
  canonicalPublicationRoutes,
};
export type { CanonicalPublicationContract, CanonicalRoutePath };

export const canonicalWordRoutes = canonicalPublicationRoutes.filter(
  (route) => route.subject.kind === "word-study",
);

export function canonicalUrl(path: string = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${CANONICAL_ORIGIN}${normalizedPath === "/" ? "" : normalizedPath}`;
}

export function canonicalRouteByPath(path: string): CanonicalPublicationContract {
  const route = canonicalPublicationRoutes.find((candidate) => candidate.path === path);
  if (!route) throw new Error(`Unknown canonical publication route: ${path}`);
  return route;
}

function canonicalEntityId(url: string, fragment: string) {
  return `${url === CANONICAL_ORIGIN ? `${url}/` : url}#${fragment}`;
}

export function canonicalSocialImagePath(
  route: CanonicalPublicationContract,
  kind: "openGraph" | "twitter" = "openGraph",
) {
  const imageName = kind === "twitter" ? "twitter-image" : "opengraph-image";
  return route.path === "/" ? `/${imageName}` : `${route.path}/${imageName}`;
}

export function canonicalSocialTitle(route: CanonicalPublicationContract) {
  return route.path === "/"
    ? route.machineTitle
    : `${route.machineTitle} | Words Over Time`;
}

export function canonicalSocialImageAlt(route: CanonicalPublicationContract) {
  return route.path === "/"
    ? route.machineTitle
    : `Words Over Time: ${route.machineTitle}`;
}

export function createPageMetadata(path: CanonicalRoutePath): Metadata {
  const route = canonicalRouteByPath(path);
  const canonical = route.canonicalUrl;
  const openGraphImage = canonicalUrl(canonicalSocialImagePath(route));
  const twitterImage = canonicalUrl(canonicalSocialImagePath(route, "twitter"));
  const socialTitle = canonicalSocialTitle(route);
  const socialImageAlt = canonicalSocialImageAlt(route);
  const isWordStudy = route.subject.kind === "word-study";

  return {
    title: path === "/" ? { absolute: route.machineTitle } : route.machineTitle,
    description: route.machineDescription,
    keywords: null,
    authors: [{ name: canonicalAuthor.displayName, url: canonicalAuthor.url }],
    creator: canonicalAuthor.displayName,
    publisher: canonicalAuthor.displayName,
    alternates: {
      canonical,
      languages: { en: canonical },
      types: { "application/rss+xml": canonicalUrl("/feed.xml") },
    },
    openGraph: {
      type: isWordStudy ? "article" : "website",
      url: canonical,
      siteName: "Words Over Time",
      locale: "en_US",
      title: socialTitle,
      description: route.machineDescription,
      images: [
        {
          url: openGraphImage,
          width: 1200,
          height: 630,
          alt: socialImageAlt,
          type: "image/png",
        },
      ],
      ...(isWordStudy
        ? {
            publishedTime: route.publication.publishedAt,
            modifiedTime: route.publication.modifiedAt,
            authors: [canonicalAuthor.url],
            section: "Word Studies",
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description: route.machineDescription,
      images: [
        {
          url: twitterImage,
          alt: socialImageAlt,
        },
      ],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-snippet": -1,
        "max-image-preview": "large",
        "max-video-preview": -1,
      },
    },
  };
}

function authorJsonLd() {
  return {
    "@type": "Person",
    "@id": canonicalAuthor.id,
    name: canonicalAuthor.name,
    alternateName: canonicalAuthor.nativeName,
    url: canonicalAuthor.url,
    sameAs: canonicalAuthor.sameAs,
    nationality: {
      "@type": "Country",
      name: canonicalAuthor.nationality,
    },
    jobTitle: canonicalAuthor.jobTitle,
  };
}

function websiteJsonLd() {
  return {
    "@type": "WebSite",
    "@id": `${CANONICAL_ORIGIN}/#website`,
    name: "Words Over Time",
    url: CANONICAL_ORIGIN,
    description: canonicalPublicationProject.description,
    inLanguage: "en",
    creator: { "@id": canonicalAuthor.id },
  };
}

function projectJsonLd() {
  return {
    "@type": "CreativeWork",
    "@id": canonicalPublicationProject.id,
    name: canonicalPublicationProject.name,
    url: CANONICAL_ORIGIN,
    description: canonicalPublicationProject.description,
    inLanguage: canonicalPublicationProject.inLanguage,
    datePublished: canonicalPublicationProject.publishedAt,
    dateModified: canonicalPublicationProject.modifiedAt,
    creator: { "@id": canonicalAuthor.id },
    identifier: {
      "@type": "PropertyValue",
      propertyID: "DOI",
      value: canonicalPublicationProject.doi,
      url: canonicalPublicationProject.doiUrl,
    },
    usageInfo: canonicalUrl("/about"),
  };
}

function breadcrumbJsonLd(route: CanonicalPublicationContract) {
  const items = [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: canonicalUrl("/"),
    },
    ...(route.subject.kind === "word-study"
      ? [
          {
            "@type": "ListItem",
            position: 2,
            name: "Word Studies",
            item: canonicalUrl("/words"),
          },
          {
            "@type": "ListItem",
            position: 3,
            name: route.subject.name,
            item: route.canonicalUrl,
          },
        ]
      : [
          {
            "@type": "ListItem",
            position: 2,
            name: route.subject.name,
            item: route.canonicalUrl,
          },
        ]),
  ];

  return {
    "@type": "BreadcrumbList",
    "@id": canonicalEntityId(route.canonicalUrl, "breadcrumb"),
    itemListElement: items,
  };
}

function wordListJsonLd() {
  return {
    "@type": "ItemList",
    "@id": canonicalEntityId(canonicalUrl("/words"), "item-list"),
    name: "Words Over Time public word studies",
    numberOfItems: canonicalWordRoutes.length,
    itemListElement: canonicalWordRoutes.map((route, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: route.subject.name,
      item: route.canonicalUrl,
    })),
  };
}

function collectionPageJsonLd(route: CanonicalPublicationContract) {
  const pageId = canonicalEntityId(route.canonicalUrl, "webpage");
  const listId = canonicalEntityId(canonicalUrl("/words"), "item-list");
  return {
    "@type": "CollectionPage",
    "@id": pageId,
    url: route.canonicalUrl,
    name: route.subject.name,
    headline: route.machineTitle,
    description: route.machineDescription,
    inLanguage: route.publication.inLanguage,
    datePublished: route.publication.publishedAt,
    dateModified: route.publication.modifiedAt,
    author: { "@id": canonicalAuthor.id },
    isPartOf: { "@id": `${CANONICAL_ORIGIN}/#website` },
    mainEntity: route.path === "/" ? { "@id": canonicalPublicationProject.id } : { "@id": listId },
    ...(route.path === "/"
      ? {}
      : { breadcrumb: { "@id": canonicalEntityId(route.canonicalUrl, "breadcrumb") } }),
  };
}

function aboutPageJsonLd(route: CanonicalPublicationContract) {
  return {
    "@type": "AboutPage",
    "@id": canonicalEntityId(route.canonicalUrl, "webpage"),
    url: route.canonicalUrl,
    name: route.subject.name,
    headline: route.machineTitle,
    description: route.machineDescription,
    inLanguage: route.publication.inLanguage,
    datePublished: route.publication.publishedAt,
    dateModified: route.publication.modifiedAt,
    author: { "@id": canonicalAuthor.id },
    isPartOf: { "@id": `${CANONICAL_ORIGIN}/#website` },
    breadcrumb: { "@id": canonicalEntityId(route.canonicalUrl, "breadcrumb") },
    mainEntity: { "@id": canonicalPublicationProject.id },
  };
}

function wordStudyJsonLd(route: CanonicalPublicationContract) {
  const pageId = canonicalEntityId(route.canonicalUrl, "webpage");
  const termId = canonicalEntityId(route.canonicalUrl, "defined-term");
  const studyId = canonicalEntityId(route.canonicalUrl, "word-study");
  const sharedClaim = route.sharedClaims[0]?.statement || route.machineDescription;

  const page = {
    "@type": "WebPage",
    "@id": pageId,
    url: route.canonicalUrl,
    name: route.subject.name,
    headline: route.machineTitle,
    description: route.machineDescription,
    inLanguage: route.publication.inLanguage,
    datePublished: route.publication.publishedAt,
    dateModified: route.publication.modifiedAt,
    author: { "@id": canonicalAuthor.id },
    isPartOf: { "@id": `${CANONICAL_ORIGIN}/#website` },
    breadcrumb: { "@id": canonicalEntityId(route.canonicalUrl, "breadcrumb") },
    mainEntity: { "@id": termId },
    relatedLink: route.relatedRoutes.map(canonicalUrl),
    usageInfo: canonicalUrl(route.publicBoundary.rightsPage),
  };

  const definedTerm = {
    "@type": "DefinedTerm",
    "@id": termId,
    name: route.subject.name,
    ...(route.subject.alternateNames?.length
      ? { alternateName: route.subject.alternateNames }
      : {}),
    description: sharedClaim,
    url: route.canonicalUrl,
    subjectOf: { "@id": studyId },
  };

  const article = {
    "@type": "Article",
    "@id": studyId,
    name: `${route.subject.name} word study`,
    headline: route.machineTitle,
    url: route.canonicalUrl,
    description: route.machineDescription,
    abstract: sharedClaim,
    datePublished: route.publication.publishedAt,
    dateModified: route.publication.modifiedAt,
    inLanguage: route.publication.inLanguage,
    articleSection: "Word Studies",
    author: { "@id": canonicalAuthor.id },
    about: { "@id": termId },
    mainEntityOfPage: { "@id": pageId },
    usageInfo: canonicalUrl(route.publicBoundary.rightsPage),
  };

  return [page, breadcrumbJsonLd(route), definedTerm, article];
}

export function createRouteJsonLd(path: CanonicalRoutePath) {
  const route = canonicalRouteByPath(path);
  const graph: Record<string, unknown>[] = [websiteJsonLd(), authorJsonLd()];

  if (route.path === "/") {
    graph.push(collectionPageJsonLd(route), projectJsonLd());
  } else if (route.path === "/words") {
    graph.push(collectionPageJsonLd(route), breadcrumbJsonLd(route), wordListJsonLd());
  } else if (route.path === "/about") {
    graph.push(aboutPageJsonLd(route), breadcrumbJsonLd(route), projectJsonLd());
  } else {
    graph.push(...wordStudyJsonLd(route));
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}

export const homeJsonLd = createRouteJsonLd("/");
