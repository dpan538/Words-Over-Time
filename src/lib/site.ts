import type { Metadata } from "next";

export const siteConfig = {
  name: "Words Over Time",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://words-over-time.vercel.app").replace(/\/$/, ""),
  description:
    "A curated historical word-frequency and semantic visualisation archive for tracing how words change across culture, technology, law, and public discourse.",
  author: "Words Over Time",
  updatedAt: "2026-05-28",
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
};

export const siteRoutes: SiteRoute[] = [
  {
    path: "/",
    title: "Words Over Time",
    description:
      "A visual archive of word histories, built from public corpora, processed evidence layers, and source-led interpretation.",
    priority: 1,
    changeFrequency: "weekly",
    section: "home",
    keywords: ["word history", "semantic change", "historical linguistics", "data visualisation"],
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
      "How Words Over Time handles source provenance, transformed evidence, public-domain material, third-party licenses, and publication boundaries.",
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
    keywords: ["forever", "permanence", "memory", "archive", "platform persistence"],
    accent: "#f06b04",
    summary:
      "Forever is read as a promise of duration whose meaning changes when memory becomes archival, searchable, platformed, and hard to delete.",
    related: ["/words/artificial", "/words/privacy", "/words/data"],
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
    keywords: ["privacy", "data protection", "surveillance", "consent", "legal injury"],
    accent: "#7e42b8",
    summary:
      "Privacy is traced from private life and secrecy into legal rights, data protection, public attention, surveillance, consent, and governance interfaces.",
    related: ["/words/data", "/words/hub", "/words/artificial"],
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

export function absoluteUrl(path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${siteConfig.url}${normalizedPath}`;
}

export function routeByPath(path: string) {
  return siteRoutes.find((route) => route.path === path);
}

export function createPageMetadata(path: string, overrides: Partial<Pick<SiteRoute, "title" | "description">> = {}): Metadata {
  const route = routeByPath(path);
  const title = overrides.title || route?.title || siteConfig.name;
  const description = overrides.description || route?.description || siteConfig.description;
  const canonical = absoluteUrl(path);
  const imagePath = route?.section === "word" ? `${path}/opengraph-image` : "/opengraph-image";
  const twitterImagePath = route?.section === "word" ? `${path}/twitter-image` : "/twitter-image";

  return {
    title,
    description,
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

export function createRouteJsonLd(path: string) {
  const route = routeByPath(path) || siteRoutes[0];
  const url = absoluteUrl(route.path);
  const pageId = `${url}#webpage`;
  const breadcrumbId = `${url}#breadcrumb`;
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
      headline: route.title,
      description: route.description,
      abstract: route.summary || route.description,
      inLanguage: "en",
      dateModified: siteConfig.updatedAt,
      isPartOf: {
        "@id": `${siteConfig.url}/#website`,
      },
      breadcrumb: {
        "@id": breadcrumbId,
      },
      keywords: route.keywords.join(", "),
    },
    {
      "@type": "BreadcrumbList",
      "@id": breadcrumbId,
      itemListElement: breadcrumbItems,
    },
  ];

  if (route.section === "word") {
    graph.push({
      "@type": "CreativeWork",
      "@id": `${url}#word-study`,
      name: `${route.title} word study`,
      headline: route.title,
      url,
      description: route.description,
      abstract: route.summary,
      genre: ["digital humanities", "historical linguistics", "data visualization"],
      about: route.keywords.map((keyword) => ({ "@type": "Thing", name: keyword })),
      isPartOf: {
        "@id": `${siteConfig.url}/#collection`,
      },
    });
  }

  if (route.section === "home" || route.section === "index") {
    graph[0].hasPart = wordRoutes.map((wordRoute, index) => ({
      "@type": "CreativeWork",
      position: index + 1,
      name: wordRoute.title,
      url: absoluteUrl(wordRoute.path),
      description: wordRoute.description,
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
    },
    {
      "@type": "CollectionPage",
      "@id": `${siteConfig.url}/#collection`,
      name: siteConfig.name,
      url: siteConfig.url,
      description: "A collection of visual word-history studies.",
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
          description: route.description,
        })),
    },
  ],
};
