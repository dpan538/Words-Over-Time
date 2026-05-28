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
  section: "home" | "method" | "word";
  keywords: string[];
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
  },
];

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

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        en: canonical,
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
          url: absoluteUrl("/opengraph-image"),
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
      images: [absoluteUrl("/twitter-image")],
    },
  };
}

export function createRouteJsonLd(path: string) {
  const route = routeByPath(path) || siteRoutes[0];
  const url = absoluteUrl(route.path);
  const pageId = `${url}#webpage`;
  const breadcrumbId = `${url}#breadcrumb`;
  const pageType = route.section === "home" ? "CollectionPage" : route.section === "method" ? "AboutPage" : "WebPage";
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
      genre: ["digital humanities", "historical linguistics", "data visualization"],
      about: route.keywords.map((keyword) => ({ "@type": "Thing", name: keyword })),
      isPartOf: {
        "@id": `${siteConfig.url}/#collection`,
      },
    });
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
