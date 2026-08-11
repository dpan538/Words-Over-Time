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
  updatedAt: "2026-07-28",
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
  publishedAt: string;
  updatedAt: string;
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
    publishedAt: "2026-05-07",
    updatedAt: "2026-07-28",
    seoTitle: "Words Over Time: Word Meaning, History, and Usage",
    seoDescription:
      "Explore source-led visual studies of word meaning, etymology, semantic change, and usage over time by artist and design researcher Dai Pan.",
    searchIntents: ["word usage over time", "word meaning over time", "semantic change words", "word frequency over time"],
  },
  {
    path: "/words",
    title: "Word Studies",
    description:
      "Browse every public Words Over Time study, including forever, artificial, privacy, hub, depression, and data.",
    priority: 0.92,
    changeFrequency: "weekly",
    section: "index",
    keywords: ["word studies", "semantic history", "digital humanities", "visual essays", "word usage over time", "semantic change"],
    accent: "#050510",
    publishedAt: "2026-05-28",
    updatedAt: "2026-07-28",
    seoTitle: "Word Studies: Meaning and Usage Over Time",
    seoDescription:
      "Browse source-led visual studies of how privacy, forever, artificial, hub, depression, and data changed in meaning and usage over time.",
    searchIntents: ["word studies", "word usage over time", "word meaning over time", "semantic change examples", "word history studies"],
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
    publishedAt: "2026-05-07",
    updatedAt: "2026-07-28",
    seoTitle: "Methodology, Sources, and Rights",
    seoDescription:
      "Read the research methods, source-provenance rules, evidence boundaries, licenses, and publication rights behind Words Over Time.",
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
    publishedAt: "2026-05-07",
    updatedAt: "2026-07-28",
    summary:
      "Forever is read as a promise of duration whose meaning changes when memory becomes archival, searchable, platformed, and hard to delete.",
    related: ["/words/artificial", "/words/privacy", "/words/data"],
    seoTitle: "Forever Spelling, Meaning, and Origin",
    seoDescription:
      "Explore “for ever” and “forever” as distinct forms across duration, devotion, memory, archives, and platform persistence.",
    searchIntents: [
      "how do you spell forever",
      "spell forever",
      "is forever one word",
      "for ever or forever",
      "forever meaning",
      "how long is forever meaning",
      "forever origin",
      "forever etymology",
      "history of the word forever",
      "forever meaning over time",
      "forever digital permanence",
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
    keywords: [
      "artificial",
      "artifice",
      "imitation",
      "synthetic",
      "machine intelligence",
      "artificial etymology",
      "artificial meaning",
      "artificial word history",
    ],
    accent: "#a1081f",
    publishedAt: "2026-05-10",
    updatedAt: "2026-07-28",
    summary:
      "Artificial moves from skilled making and artifice toward synthetic materials, reproduced experience, suspicion, and the boundary between human and machine intelligence.",
    related: ["/words/forever", "/words/data", "/words/privacy"],
    seoTitle: "Artificial Etymology: Artifice to AI",
    seoDescription:
      "Trace artificial from artifice and skilled making to imitation, synthetic materials, suspicion, technical reproduction, and machine intelligence.",
    searchIntents: [
      "artificial etymology",
      "artificial meaning",
      "what does artificial mean",
      "artificial word origin",
      "artificial and artifice",
      "artificial meaning over time",
      "history of the word artificial",
      "created by artificial means",
      "artificial meaning before AI",
      "artificial intelligence word history",
    ],
    definedTerm: {
      name: "artificial",
      alternateName: ["artifice"],
      description:
        "Artificial is treated as a word whose meanings move through artifice, skilled making, imitation, synthetic material, suspicion, and machine-era intelligence.",
    },
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
    publishedAt: "2026-05-27",
    updatedAt: "2026-07-28",
    summary:
      "Privacy is traced from private life and secrecy into legal rights, data protection, public attention, surveillance, consent, and governance interfaces.",
    related: ["/words/data", "/words/hub", "/words/artificial"],
    seoTitle: "Privacy Etymology and Meaning Over Time",
    seoDescription:
      "Trace privacy from private life and secrecy to legal rights, data protection, surveillance, consent, and digital governance.",
    searchIntents: [
      "privacy etymology",
      "etymology of privacy",
      "origin of the word privacy",
      "history of privacy meaning",
      "privacy meaning over time",
      "privacy definition through history",
      "privacy definition over years",
      "privacy legal meaning",
      "privacy and data protection",
      "privacy and surveillance history",
      "modern meaning of privacy",
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
    keywords: ["hub", "network", "transportation", "platform", "centrality", "hub etymology", "hub meaning", "hub word origin"],
    accent: "#0b7f86",
    publishedAt: "2026-05-13",
    updatedAt: "2026-07-28",
    summary:
      "Hub begins as a center of rotation and becomes a transport, commercial, digital, and platform term for access, routing, and control.",
    related: ["/words/privacy", "/words/data", "/words/artificial"],
    seoTitle: "Hub Etymology: From Wheel Center to Network",
    seoDescription:
      "Trace hub from a wheel center to transport node, commercial center, digital access point, and network metaphor.",
    searchIntents: [
      "hub etymology",
      "hub meaning",
      "hub word origin",
      "origin of the word hub",
      "original meaning of hub",
      "why is a center called a hub",
      "hub meaning over time",
      "hub transportation meaning",
      "hub network metaphor",
      "digital platform hub meaning",
    ],
    definedTerm: {
      name: "hub",
      description:
        "Hub is treated as a word for a wheel center that shifts into transportation, commercial, digital, and platform metaphors of access, routing, and control.",
    },
  },
  {
    path: "/words/depression",
    title: "Depression",
    description:
      "A study of depression across loweredness, melancholy, weather, economy, diagnosis, and public-health discourse.",
    priority: 0.84,
    changeFrequency: "monthly",
    section: "word",
    keywords: [
      "depression",
      "melancholy",
      "economy",
      "diagnosis",
      "public health",
      "depression etymology",
      "depression meaning",
      "depression word history",
    ],
    accent: "#006fb6",
    publishedAt: "2026-05-08",
    updatedAt: "2026-07-28",
    summary:
      "Depression branches through loweredness, melancholy, weather, economic crisis, diagnosis, and public-health discourse.",
    related: ["/words/forever", "/words/privacy", "/words/data"],
    seoTitle: "Depression: Economic and Clinical Meanings",
    seoDescription:
      "Trace depression across physical loweredness, melancholy, weather, economic crisis, clinical diagnosis, and public-health discourse.",
    searchIntents: [
      "depression etymology",
      "depression meaning",
      "depression word origin",
      "depression meaning over time",
      "history of the word depression",
      "depression economic clinical meaning",
      "economic meaning of depression",
      "clinical meaning of depression",
      "depression weather meaning",
      "depression and melancholy word history",
      "how depression changed meaning",
    ],
    definedTerm: {
      name: "depression",
      description:
        "Depression is treated as a word branching through loweredness, melancholy, weather, economic crisis, clinical diagnosis, and public-health discourse.",
    },
  },
  {
    path: "/words/data",
    title: "Data",
    description:
      "A study of data as given facts, counted observations, social traces, infrastructure, governance object, and AI-era material.",
    priority: 0.76,
    changeFrequency: "monthly",
    section: "word",
    keywords: ["data", "datum", "AI data", "social traces", "data governance", "data etymology", "data meaning", "datum meaning"],
    accent: "#1570ac",
    publishedAt: "2026-05-10",
    updatedAt: "2026-07-28",
    summary:
      "Data is followed from given facts and counted observations into social traces, infrastructure, governance objects, and AI-era material.",
    related: ["/words/privacy", "/words/hub", "/words/artificial"],
    seoTitle: "Data Etymology: Datum, Meaning, and Usage",
    seoDescription:
      "Trace data and datum from given facts and counted observations to social traces, infrastructure, governance, and AI-era material.",
    searchIntents: [
      "data etymology",
      "datum data etymology",
      "data word origin",
      "data meaning over time",
      "history of the word data",
      "datum meaning",
      "data vs datum",
      "is data singular or plural",
      "what is the singular of data",
      "data as given facts",
      "data meaning in AI",
      "data governance meaning",
    ],
    definedTerm: {
      name: "data",
      alternateName: ["datum"],
      description:
        "Data is treated as a word moving from given facts and counted observations into social traces, infrastructure, governance objects, and AI-era material.",
    },
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

export function routeSocialImagePath(route: SiteRoute, kind: "openGraph" | "twitter" = "openGraph") {
  const imageName = kind === "twitter" ? "twitter-image" : "opengraph-image";
  return route.section === "word" ? `${route.path}/${imageName}` : `/${imageName}`;
}

export function createPageMetadata(path: string, overrides: Partial<Pick<SiteRoute, "title" | "description">> = {}): Metadata {
  const route = routeByPath(path);
  const title = overrides.title || (route ? routeSeoTitle(route) : siteConfig.name);
  const description = overrides.description || (route ? routeSeoDescription(route) : siteConfig.description);
  const canonical = absoluteUrl(path);
  const imagePath = route ? routeSocialImagePath(route) : "/opengraph-image";
  const twitterImagePath = route ? routeSocialImagePath(route, "twitter") : "/twitter-image";
  const isArticle = route?.section === "word" || route?.section === "method";
  const openGraphType = isArticle ? "article" : "website";
  const socialTitle = `${title} | ${siteConfig.name}`;

  return {
    title: path === "/" ? { absolute: title } : title,
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
      type: openGraphType,
      url: canonical,
      siteName: siteConfig.name,
      locale: "en_US",
      title: socialTitle,
      description,
      images: [
        {
          url: absoluteUrl(imagePath),
          width: 1200,
          height: 630,
          alt: `${siteConfig.name}: ${title}`,
          type: "image/png",
        },
      ],
      ...(isArticle && route
        ? {
            publishedTime: route.publishedAt,
            modifiedTime: route.updatedAt,
            authors: [siteConfig.authorUrl],
            section: route.section === "word" ? "Word Studies" : "Methodology",
            tags: routeSearchTerms(route),
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [
        {
          url: absoluteUrl(twitterImagePath),
          alt: `${siteConfig.name}: ${title}`,
        },
      ],
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
  const wordStudyId = `${url}#word-study`;
  const datasetId = `${url}#dataset`;
  const structuredTitle = routeSeoTitle(route);
  const structuredDescription = routeSeoDescription(route);
  const searchTerms = routeSearchTerms(route);
  const imageUrl = absoluteUrl(routeSocialImagePath(route));
  const relatedWordRoutes = (route.related || [])
    .map((relatedPath) => routeByPath(relatedPath))
    .filter((relatedRoute): relatedRoute is SiteRoute => Boolean(relatedRoute));
  const pageType =
    route.section === "home" || route.section === "index" ? "CollectionPage" : route.section === "method" ? "AboutPage" : "WebPage";
  const breadcrumbItems = [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: absoluteUrl("/"),
    },
    ...(route.section === "word"
      ? [
          {
            "@type": "ListItem",
            position: 2,
            name: "Word Studies",
            item: absoluteUrl("/words"),
          },
          {
            "@type": "ListItem",
            position: 3,
            name: route.title,
            item: url,
          },
        ]
      : route.path === "/"
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
      image: imageUrl,
      inLanguage: "en",
      datePublished: route.publishedAt,
      dateModified: route.updatedAt,
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
            primaryImageOfPage: {
              "@type": "ImageObject",
              url: imageUrl,
              width: 1200,
              height: 630,
            },
            relatedLink: relatedWordRoutes.map((relatedRoute) => absoluteUrl(relatedRoute.path)),
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
        "@id": wordStudyId,
      },
      keywords: searchTerms.join(", "),
    });

    graph.push({
      "@type": ["Article", "CreativeWork"],
      "@id": wordStudyId,
      name: `${route.title} word study`,
      headline: structuredTitle,
      url,
      image: imageUrl,
      description: structuredDescription,
      abstract: route.summary,
      datePublished: route.publishedAt,
      dateModified: route.updatedAt,
      inLanguage: "en",
      articleSection: "Word Studies",
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
      mentions: relatedWordRoutes.map((relatedRoute) => ({
        "@type": "DefinedTerm",
        "@id": `${absoluteUrl(relatedRoute.path)}#defined-term`,
        name: relatedRoute.definedTerm?.name || relatedRoute.title.toLowerCase(),
        url: absoluteUrl(relatedRoute.path),
        description: relatedRoute.definedTerm?.description || relatedRoute.summary || routeSeoDescription(relatedRoute),
      })),
      mainEntity: {
        "@id": definedTermId,
      },
      mainEntityOfPage: {
        "@id": pageId,
      },
      hasPart: {
        "@id": datasetId,
      },
      isPartOf: {
        "@id": `${siteConfig.url}/#collection`,
      },
      isBasedOn: {
        "@id": `${absoluteUrl("/about")}#webpage`,
      },
    });

    graph.push({
      "@type": "Dataset",
      "@id": datasetId,
      name: `${route.title} semantic-change research dataset`,
      description: route.summary || structuredDescription,
      url,
      image: imageUrl,
      inLanguage: "en",
      datePublished: route.publishedAt,
      dateModified: route.updatedAt,
      isAccessibleForFree: true,
      license: absoluteUrl("/about"),
      keywords: searchTerms,
      creator: {
        "@id": `${siteConfig.url}/#dai-pan`,
      },
      publisher: {
        "@id": `${siteConfig.url}/#dai-pan`,
      },
      mainEntityOfPage: {
        "@id": pageId,
      },
      isPartOf: {
        "@id": `${siteConfig.url}/#collection`,
      },
      about: {
        "@id": definedTermId,
      },
      measurementTechnique: [
        "source-led corpus research",
        "dictionary and archival evidence synthesis",
        "semantic-change data visualization",
      ],
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

const homeRoute = routeByPath("/") || siteRoutes[0];
const wordsIndexRoute = routeByPath("/words") || siteRoutes[1];

export const homeJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${siteConfig.url}/#website`,
      name: siteConfig.name,
      url: siteConfig.url,
      description: routeSeoDescription(homeRoute),
      inLanguage: "en",
      keywords: routeSearchTerms(homeRoute).join(", "),
      about: [
        { "@type": "Thing", name: "semantic change" },
        { "@type": "Thing", name: "word usage over time" },
        { "@type": "Thing", name: "word meaning over time" },
        { "@type": "Thing", name: "word frequency" },
      ],
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
      description: routeSeoDescription(wordsIndexRoute),
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
      description: routeSeoDescription(wordsIndexRoute),
      keywords: routeSearchTerms(wordsIndexRoute).join(", "),
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
