import type { Metadata } from "next";

export const siteConfig = {
  name: "Words Over Time",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://www.wordsovertime.com").replace(/\/$/, ""),
  description:
    "A semantic-change, word-frequency, and search-statistics research project by Dai Pan (潘岱), presented as design research and infographic art.",
  author: "Dai Pan / 潘岱",
  authorName: "Dai Pan",
  authorNativeName: "潘岱",
  authorUrl: "https://daipan.art/",
  authorSameAs: ["https://daipan.art/", "https://www.daipan.ink/"],
  updatedAt: "2026-06-15",
};

export type SiteRoute = {
  path: string;
  title: string;
  description: string;
  priority: number;
  changeFrequency: "weekly" | "monthly" | "yearly";
  section: "home" | "index" | "method" | "word";
  keywords: string[];
  accent: string;
  summary?: string;
  related?: string[];
  seoTitle?: string;
  seoDescription?: string;
  searchIntents?: string[];
  definedTerm?: {
    name: string;
    alternateName?: string[];
    description: string;
  };
};

export const siteRoutes: SiteRoute[] = [
  {
    path: "/",
    title: "Words Over Time by Dai Pan",
    description:
      "A semantic-change, word-frequency, and search-statistics research project by Dai Pan, presented as design research and infographic art.",
    priority: 1,
    changeFrequency: "weekly",
    section: "home",
    keywords: ["Dai Pan", "潘岱", "word history", "semantic change", "word frequency", "search statistics", "infographic art"],
    accent: "#006fb6",
  },
  {
    path: "/words",
    title: "Word Studies",
    description:
      "Browse every public Words Over Time study, including forever, artificial, privacy, hub, depression, and data.",
    priority: 0.92,
    changeFrequency: "weekly",
    section: "index",
    keywords: ["word studies", "semantic history", "digital humanities", "visual essays"],
    accent: "#050510",
  },
  {
    path: "/about",
    title: "Methodology, Sources, and Rights",
    description:
      "How Dai Pan's Words Over Time handles source provenance, transformed evidence, design research, third-party licenses, and publication boundaries.",
    priority: 0.9,
    changeFrequency: "monthly",
    section: "method",
    keywords: ["research methodology", "source provenance", "copyright", "digital humanities"],
    accent: "#d93621",
  },
  {
    path: "/words/forever",
    title: "Forever",
    description:
      "A study of forever as promise, duration, memory, archive, platform persistence, and the changing conditions of permanence.",
    priority: 0.86,
    changeFrequency: "monthly",
    section: "word",
    keywords: [
      "forever",
      "permanence",
      "memory",
      "archive",
      "platform persistence",
      "forever meaning",
      "forever spelling",
      "forever origin",
    ],
    accent: "#f06b04",
    summary:
      "Forever is read as a promise of duration whose meaning changes when memory becomes archival, searchable, platformed, and hard to delete.",
    related: ["/words/artificial", "/words/privacy", "/words/data"],
    seoTitle: "Forever: Meaning, Spelling, Origin, and How the Word Changed Over Time",
    seoDescription:
      "A source-led study of forever: spelling variants, current meaning, earlier for ever forms, permanence, devotion, memory, archives, and platform-era promises.",
    searchIntents: [
      "how do you spell forever",
      "spell forever",
      "forever meaning",
      "how long is forever meaning",
      "forever origin",
      "forever etymology",
    ],
    definedTerm: {
      name: "forever",
      alternateName: ["for ever"],
      description:
        "Forever is treated as a word for duration and permanence whose use shifts across spelling variants, devotion, literary vows, memory, archives, and platform promises.",
    },
  },
  {
    path: "/words/artificial",
    title: "Artificial",
    description:
      "A study of artificial as craft, imitation, technical reproduction, synthetic material, suspicion, and machine-era intelligence.",
    priority: 0.86,
    changeFrequency: "monthly",
    section: "word",
    keywords: ["artificial", "artifice", "imitation", "synthetic", "machine intelligence"],
    accent: "#a1081f",
    summary:
      "Artificial moves from skilled making and artifice toward synthetic materials, reproduced experience, suspicion, and the boundary between human and machine intelligence.",
    related: ["/words/forever", "/words/data", "/words/privacy"],
  },
  {
    path: "/words/privacy",
    title: "Privacy",
    description:
      "A study of privacy moving from private life and secrecy into legal claims, data protection, geographic attention, and governance interfaces.",
    priority: 0.86,
    changeFrequency: "monthly",
    section: "word",
    keywords: [
      "privacy",
      "data protection",
      "surveillance",
      "consent",
      "legal injury",
      "privacy etymology",
      "privacy meaning",
      "privacy definition",
      "privacy over time",
    ],
    accent: "#6f3aa6",
    summary:
      "Privacy is traced from private life and secrecy into legal rights, data protection, public attention, surveillance, consent, and governance interfaces.",
    related: ["/words/data", "/words/hub", "/words/artificial"],
    seoTitle: "Privacy: Etymology, Meaning, and How the Word Changed Over Time",
    seoDescription:
      "A source-led study of privacy: current meaning, older senses of private life and secrecy, legal-right language, data protection, surveillance, consent, and governance.",
    searchIntents: [
      "privacy etymology",
      "etymology of privacy",
      "privacy meaning over time",
      "privacy definition through history",
      "privacy definition over years",
    ],
    definedTerm: {
      name: "privacy",
      description:
        "Privacy is treated as a word for private life and secrecy that later becomes legal-right language, data protection vocabulary, surveillance pressure, consent design, and governance infrastructure.",
    },
  },
  {
    path: "/words/hub",
    title: "Hub",
    description:
      "A study of hub as wheel center, transportation node, commercial center, platform access point, and networked control metaphor.",
    priority: 0.84,
    changeFrequency: "monthly",
    section: "word",
    keywords: ["hub", "network", "transportation", "platform", "centrality"],
    accent: "#0b7f86",
    summary:
      "Hub begins as a center of rotation and becomes a transport, commercial, digital, and platform term for access, routing, and control.",
    related: ["/words/privacy", "/words/data", "/words/artificial"],
  },
  {
    path: "/words/depression",
    title: "Depression",
    description:
      "A study of depression across loweredness, melancholy, weather, economy, diagnosis, and public-health discourse.",
    priority: 0.84,
    changeFrequency: "monthly",
    section: "word",
    keywords: ["depression", "melancholy", "economy", "diagnosis", "public health"],
    accent: "#006fb6",
    summary:
      "Depression branches through loweredness, melancholy, weather, economic crisis, diagnosis, and public-health discourse.",
    related: ["/words/forever", "/words/privacy", "/words/data"],
  },
  {
    path: "/words/data",
    title: "Data",
    description:
      "A study of data as given facts, counted observations, social traces, infrastructure, governance object, and AI-era material.",
    priority: 0.76,
    changeFrequency: "monthly",
    section: "word",
    keywords: ["data", "datum", "AI data", "social traces", "data governance"],
    accent: "#1570ac",
    summary:
      "Data is followed from given facts and counted observations into social traces, infrastructure, governance objects, and AI-era material.",
    related: ["/words/privacy", "/words/hub", "/words/artificial"],
  },
];

export const wordRoutes = siteRoutes.filter((route) => route.section === "word");

function uniqueStrings(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function routeSeoTitle(route: SiteRoute) {
  return route.seoTitle || route.title;
}

function routeSeoDescription(route: SiteRoute) {
  return route.seoDescription || route.description;
}

function routeSearchTerms(route: SiteRoute) {
  return uniqueStrings([...route.keywords, ...(route.searchIntents || [])]);
}

export function absoluteUrl(path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${siteConfig.url}${normalizedPath}`;
}

export function routeByPath(path: string) {
  return siteRoutes.find((route) => route.path === path);
}

export function createPageMetadata(path: string, overrides: Partial<Pick<SiteRoute, "title" | "description">> = {}): Metadata {
  const route = routeByPath(path);
  const title = overrides.title || (route ? routeSeoTitle(route) : siteConfig.name);
  const description = overrides.description || (route ? routeSeoDescription(route) : siteConfig.description);
  const canonical = absoluteUrl(path);
  const imagePath = route?.section === "word" ? `${path}/opengraph-image` : "/opengraph-image";
  const twitterImagePath = route?.section === "word" ? `${path}/twitter-image` : "/twitter-image";

  return {
    title,
    description,
    keywords: route ? routeSearchTerms(route) : undefined,
    authors: [{ name: siteConfig.author, url: siteConfig.authorUrl }],
    creator: siteConfig.author,
    publisher: siteConfig.author,
    alternates: {
      canonical,
      languages: {
        en: canonical,
      },
      types: {
        "application/rss+xml": absoluteUrl("/feed.xml"),
      },
    },
    openGraph: {
      type: "article",
      url: canonical,
      siteName: siteConfig.name,
      title: `${title} | ${siteConfig.name}`,
      description,
      images: [
        {
          url: absoluteUrl(imagePath),
          width: 1200,
          height: 630,
          alt: `${siteConfig.name}: ${title}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${siteConfig.name}`,
      description,
      images: [absoluteUrl(twitterImagePath)],
    },
  };
}

const authorJsonLd = {
  "@type": "Person",
  "@id": `${siteConfig.url}/#dai-pan`,
  name: siteConfig.authorName,
  alternateName: [siteConfig.authorNativeName, siteConfig.author],
  url: siteConfig.authorUrl,
  sameAs: siteConfig.authorSameAs,
  nationality: {
    "@type": "Country",
    name: "China",
  },
  jobTitle: "Artist, designer, and design researcher",
};

export function createRouteJsonLd(path: string) {
  const route = routeByPath(path) || siteRoutes[0];
  const url = absoluteUrl(route.path);
  const pageId = `${url}#webpage`;
  const breadcrumbId = `${url}#breadcrumb`;
  const definedTermId = `${url}#defined-term`;
  const structuredTitle = routeSeoTitle(route);
  const structuredDescription = routeSeoDescription(route);
  const searchTerms = routeSearchTerms(route);
  const pageType =
    route.section === "home" || route.section === "index" ? "CollectionPage" : route.section === "method" ? "AboutPage" : "WebPage";
  const breadcrumbItems = [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: absoluteUrl("/"),
    },
    ...(route.path === "/"
      ? []
      : [
          {
            "@type": "ListItem",
            position: 2,
            name: route.title,
            item: url,
          },
        ]),
  ];

  const graph: Record<string, unknown>[] = [
    {
      "@type": pageType,
      "@id": pageId,
      url,
      name: route.title,
      headline: structuredTitle,
      description: structuredDescription,
      abstract: route.summary || structuredDescription,
      inLanguage: "en",
      dateModified: siteConfig.updatedAt,
      isAccessibleForFree: true,
      author: {
        "@id": `${siteConfig.url}/#dai-pan`,
      },
      creator: {
        "@id": `${siteConfig.url}/#dai-pan`,
      },
      isPartOf: {
        "@id": `${siteConfig.url}/#website`,
      },
      breadcrumb: {
        "@id": breadcrumbId,
      },
      keywords: searchTerms.join(", "),
      ...(route.section === "word"
        ? {
            mainEntity: {
              "@id": definedTermId,
            },
          }
        : {}),
    },
    {
      "@type": "BreadcrumbList",
      "@id": breadcrumbId,
      itemListElement: breadcrumbItems,
    },
    authorJsonLd,
  ];

  if (route.section === "word") {
    graph.push({
      "@type": "DefinedTerm",
      "@id": definedTermId,
      name: route.definedTerm?.name || route.title.toLowerCase(),
      alternateName: route.definedTerm?.alternateName,
      description: route.definedTerm?.description || route.summary || structuredDescription,
      url,
      inDefinedTermSet: {
        "@id": `${siteConfig.url}/#defined-term-set`,
      },
      subjectOf: {
        "@id": `${url}#word-study`,
      },
      keywords: searchTerms.join(", "),
    });

    graph.push({
      "@type": "CreativeWork",
      "@id": `${url}#word-study`,
      name: `${route.title} word study`,
      headline: structuredTitle,
      url,
      description: structuredDescription,
      abstract: route.summary,
      genre: ["digital humanities", "historical linguistics", "data visualization"],
      artform: "infographic art",
      learningResourceType: "word history visual essay",
      educationalUse: "semantic-change research",
      isAccessibleForFree: true,
      keywords: searchTerms.join(", "),
      author: {
        "@id": `${siteConfig.url}/#dai-pan`,
      },
      creator: {
        "@id": `${siteConfig.url}/#dai-pan`,
      },
      about: route.keywords.map((keyword) => ({ "@type": "Thing", name: keyword })),
      mainEntity: {
        "@id": definedTermId,
      },
      isPartOf: {
        "@id": `${siteConfig.url}/#collection`,
      },
      isBasedOn: {
        "@id": `${absoluteUrl("/about")}#webpage`,
      },
    });
  }

  if (route.section === "home" || route.section === "index") {
    graph[0].hasPart = wordRoutes.map((wordRoute, index) => ({
      "@type": "CreativeWork",
      position: index + 1,
      name: wordRoute.title,
      url: absoluteUrl(wordRoute.path),
      description: routeSeoDescription(wordRoute),
      author: {
        "@id": `${siteConfig.url}/#dai-pan`,
      },
    }));
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}

export const homeJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${siteConfig.url}/#website`,
      name: siteConfig.name,
      url: siteConfig.url,
      description: siteConfig.description,
      inLanguage: "en",
      author: {
        "@id": `${siteConfig.url}/#dai-pan`,
      },
      creator: {
        "@id": `${siteConfig.url}/#dai-pan`,
      },
    },
    authorJsonLd,
    {
      "@type": "DefinedTermSet",
      "@id": `${siteConfig.url}/#defined-term-set`,
      name: `${siteConfig.name} word studies`,
      url: absoluteUrl("/words"),
      description: "A set of public word-history and semantic-change studies by Dai Pan.",
      hasDefinedTerm: wordRoutes.map((route) => ({
        "@type": "DefinedTerm",
        "@id": `${absoluteUrl(route.path)}#defined-term`,
        name: route.definedTerm?.name || route.title.toLowerCase(),
        alternateName: route.definedTerm?.alternateName,
        description: route.definedTerm?.description || route.summary || routeSeoDescription(route),
        url: absoluteUrl(route.path),
      })),
    },
    {
      "@type": "CollectionPage",
      "@id": `${siteConfig.url}/#collection`,
      name: siteConfig.name,
      url: siteConfig.url,
      description: "A collection of semantic-change, word-frequency, and search-statistics studies by Dai Pan.",
      author: {
        "@id": `${siteConfig.url}/#dai-pan`,
      },
      isPartOf: {
        "@id": `${siteConfig.url}/#website`,
      },
      hasPart: siteRoutes
        .filter((route) => route.section === "word")
        .map((route, index) => ({
          "@type": "CreativeWork",
          position: index + 1,
          name: route.title,
          url: absoluteUrl(route.path),
          description: routeSeoDescription(route),
          author: {
            "@id": `${siteConfig.url}/#dai-pan`,
          },
        })),
    },
  ],
};
