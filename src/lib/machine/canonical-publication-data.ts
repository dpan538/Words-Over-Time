import "server-only";

export const CANONICAL_ORIGIN = "https://www.wordsovertime.com" as const;
export const PROJECT_DOI = "10.5281/zenodo.20437678" as const;
export const PROJECT_DOI_URL = `https://doi.org/${PROJECT_DOI}` as const;

export const canonicalAuthor = {
  id: `${CANONICAL_ORIGIN}/#dai-pan`,
  name: "Dai Pan",
  nativeName: "潘岱",
  displayName: "Dai Pan / 潘岱",
  url: "https://daipan.art/",
  sameAs: ["https://daipan.art/", "https://www.daipan.ink/"],
  jobTitle: "Artist, designer, and design researcher",
  nationality: "China",
} as const;

export type CanonicalRoutePath =
  | "/"
  | "/about"
  | "/words"
  | "/words/forever"
  | "/words/artificial"
  | "/words/hub"
  | "/words/privacy"
  | "/words/data"
  | "/words/depression";

export type CanonicalPublicationContract = {
  path: CanonicalRoutePath;
  canonicalUrl: string;
  machineTitle: string;
  machineDescription: string;
  subject: {
    name: string;
    alternateNames?: string[];
    kind: "word-study" | "collection" | "methodology";
  };
  publication: {
    publishedAt: string;
    modifiedAt: string;
    inLanguage: "en";
    authorId: string;
  };
  publicResearchScope: {
    sourceFamilies: string[];
    methods: string[];
  };
  sharedClaims: Array<{
    id: string;
    statement: string;
    mobileSupported: true;
    desktopSupported: true;
  }>;
  relatedRoutes: CanonicalRoutePath[];
  publicBoundary: {
    rawResearchPublic: false;
    cachePublic: false;
    downloadableDatasetPublic: false;
    rightsPage: "/about";
  };
};

const publicBoundary = {
  rawResearchPublic: false,
  cachePublic: false,
  downloadableDatasetPublic: false,
  rightsPage: "/about",
} as const;

const route = (
  value: Omit<CanonicalPublicationContract, "canonicalUrl" | "publicBoundary">,
): CanonicalPublicationContract => ({
  ...value,
  canonicalUrl: `${CANONICAL_ORIGIN}${value.path === "/" ? "" : value.path}`,
  publicBoundary,
});

export const canonicalPublicationRoutes: readonly CanonicalPublicationContract[] = [
  route({
    path: "/",
    machineTitle: "Words Over Time: Semantic Change and Word Frequency",
    machineDescription:
      "Words Over Time is a semantic-frequency research project, design research, and infographic art by Dai Pan / 潘岱.",
    subject: { name: "Words Over Time", kind: "collection" },
    publication: {
      publishedAt: "2026-05-07",
      modifiedAt: "2026-08-11",
      inLanguage: "en",
      authorId: canonicalAuthor.id,
    },
    publicResearchScope: {
      sourceFamilies: ["public canonical word studies"],
      methods: ["source-led visual research"],
    },
    sharedClaims: [
      {
        id: "home-project-identity",
        statement:
          "Words Over Time is a semantic-frequency research project, design research, and infographic art by Dai Pan / 潘岱.",
        mobileSupported: true,
        desktopSupported: true,
      },
    ],
    relatedRoutes: ["/words", "/about"],
  }),
  route({
    path: "/words",
    machineTitle: "Word Studies: Meaning and Usage Over Time",
    machineDescription:
      "Browse six public visual studies of forever, artificial, privacy, hub, depression, and data, each with one canonical URL and stated evidence boundaries.",
    subject: { name: "Word studies", kind: "collection" },
    publication: {
      publishedAt: "2026-05-28",
      modifiedAt: "2026-05-28",
      inLanguage: "en",
      authorId: canonicalAuthor.id,
    },
    publicResearchScope: {
      sourceFamilies: ["six public canonical word studies"],
      methods: ["canonical index"],
    },
    sharedClaims: [
      {
        id: "words-six-public-studies",
        statement:
          "The public index contains six word studies: forever, artificial, privacy, hub, depression, and data.",
        mobileSupported: true,
        desktopSupported: true,
      },
    ],
    relatedRoutes: [
      "/words/forever",
      "/words/artificial",
      "/words/privacy",
      "/words/hub",
      "/words/depression",
      "/words/data",
    ],
  }),
  route({
    path: "/about",
    machineTitle: "Methodology, Sources, and Rights",
    machineDescription:
      "Read the research methods, provenance rules, evidence limits, transformation rules, citation guidance, and publication rights behind Words Over Time.",
    subject: { name: "Words Over Time methodology", kind: "methodology" },
    publication: {
      publishedAt: "2026-05-07",
      modifiedAt: "2026-08-22",
      inLanguage: "en",
      authorId: canonicalAuthor.id,
    },
    publicResearchScope: {
      sourceFamilies: ["public methodology and rights statements"],
      methods: ["provenance disclosure", "evidence-boundary disclosure"],
    },
    sharedClaims: [
      {
        id: "about-method-rights-scope",
        statement:
          "The About page documents methodology, provenance, evidence limits, transformation rules, citation, and rights for Words Over Time.",
        mobileSupported: true,
        desktopSupported: true,
      },
    ],
    relatedRoutes: ["/", "/words"],
  }),
  route({
    path: "/words/forever",
    machineTitle: "Forever and For Ever in Printed-Book Usage",
    machineDescription:
      "Compare the written forms “forever” and “for ever” through source-bounded printed-book frequency evidence and a visual study of changing usage.",
    subject: { name: "forever", alternateNames: ["for ever"], kind: "word-study" },
    publication: {
      publishedAt: "2026-05-07",
      modifiedAt: "2026-08-22",
      inLanguage: "en",
      authorId: canonicalAuthor.id,
    },
    publicResearchScope: {
      sourceFamilies: ["printed-book frequency evidence"],
      methods: ["written-form comparison", "source-bounded visualization"],
    },
    sharedClaims: [
      {
        id: "forever-written-form-comparison",
        statement:
          "This study compares the exact written forms “forever” and “for ever” in source-bounded printed-book frequency evidence.",
        mobileSupported: true,
        desktopSupported: true,
      },
    ],
    relatedRoutes: ["/words/artificial", "/words/privacy", "/words/data"],
  }),
  route({
    path: "/words/artificial",
    machineTitle: "Artificial Meaning Over Time",
    machineDescription:
      "Trace distinct branches of artificial across making, synthetic or simulated forms, distrust, bodily support, and modeled human processes.",
    subject: { name: "artificial", kind: "word-study" },
    publication: {
      publishedAt: "2026-05-10",
      modifiedAt: "2026-08-16",
      inLanguage: "en",
      authorId: canonicalAuthor.id,
    },
    publicResearchScope: {
      sourceFamilies: ["selected lexical and usage evidence"],
      methods: ["semantic-branch comparison", "source-bounded visualization"],
    },
    sharedClaims: [
      {
        id: "artificial-distinct-branches",
        statement:
          "This study treats “artificial” as distinct branches across making, synthetic or simulated forms, distrust, bodily support, and modeled human processes.",
        mobileSupported: true,
        desktopSupported: true,
      },
    ],
    relatedRoutes: ["/words/forever", "/words/data", "/words/privacy"],
  }),
  route({
    path: "/words/privacy",
    machineTitle: "Privacy: Public Attention and Institutional Systems",
    machineDescription:
      "Study selected evidence for privacy across public attention and the institutional policies, controls, rights, duties, and risks built around it.",
    subject: { name: "privacy", kind: "word-study" },
    publication: {
      publishedAt: "2026-05-27",
      modifiedAt: "2026-08-13",
      inLanguage: "en",
      authorId: canonicalAuthor.id,
    },
    publicResearchScope: {
      sourceFamilies: ["selected public-attention and institutional evidence"],
      methods: ["source-bounded comparison", "institutional-context analysis"],
    },
    sharedClaims: [
      {
        id: "privacy-attention-institutions",
        statement:
          "This study examines selected privacy evidence across public attention and institutional policies, controls, rights, duties, and risks.",
        mobileSupported: true,
        desktopSupported: true,
      },
    ],
    relatedRoutes: ["/words/data", "/words/hub", "/words/artificial"],
  }),
  route({
    path: "/words/hub",
    machineTitle: "Hub Meaning Over Time: Wheel to Network",
    machineDescription:
      "Trace how hub retains the idea of a center while moving from wheels to places, routes, institutions, networks, and digital services.",
    subject: { name: "hub", kind: "word-study" },
    publication: {
      publishedAt: "2026-05-13",
      modifiedAt: "2026-08-18",
      inLanguage: "en",
      authorId: canonicalAuthor.id,
    },
    publicResearchScope: {
      sourceFamilies: ["printed-book frequency and selected usage evidence"],
      methods: ["semantic-layer comparison", "source-bounded visualization"],
    },
    sharedClaims: [
      {
        id: "hub-center-migration",
        statement:
          "This study traces “hub” as a retained center concept moving from wheels to places, routes, institutions, networks, and digital services.",
        mobileSupported: true,
        desktopSupported: true,
      },
    ],
    relatedRoutes: ["/words/privacy", "/words/data", "/words/artificial"],
  }),
  route({
    path: "/words/depression",
    machineTitle: "Depression Meanings Across Weather, Economy, and Clinical Use",
    machineDescription:
      "Trace one spelling across loweredness, melancholy, weather, economic crisis, and clinical diagnosis without reducing it to one meaning.",
    subject: { name: "depression", kind: "word-study" },
    publication: {
      publishedAt: "2026-05-08",
      modifiedAt: "2026-08-16",
      inLanguage: "en",
      authorId: canonicalAuthor.id,
    },
    publicResearchScope: {
      sourceFamilies: ["selected lexical, corpus, economic, weather, and clinical-context evidence"],
      methods: ["semantic-branch comparison", "source-bounded visualization"],
    },
    sharedClaims: [
      {
        id: "depression-semantic-branches",
        statement:
          "This lexical study traces one spelling across loweredness, melancholy, weather, economic crisis, and clinical diagnosis without treating it as one settled meaning.",
        mobileSupported: true,
        desktopSupported: true,
      },
    ],
    relatedRoutes: ["/words/forever", "/words/privacy", "/words/data"],
  }),
  route({
    path: "/words/data",
    machineTitle: "Data Meaning Over Time: From Given to Governed",
    machineDescription:
      "Trace data from something given and countable into material that is collected, divided, packaged, governed, worked on, and made usable.",
    subject: { name: "data", kind: "word-study" },
    publication: {
      publishedAt: "2026-05-10",
      modifiedAt: "2026-08-20",
      inLanguage: "en",
      authorId: canonicalAuthor.id,
    },
    publicResearchScope: {
      sourceFamilies: ["selected lexical and data-practice evidence"],
      methods: [
        "exact-phrase comparison",
        "grammar-and-neighbouring-form comparison",
        "source-bounded visualization",
      ],
    },
    sharedClaims: [
      {
        id: "data-given-to-usable-material",
        statement:
          "This study traces data from something given and countable into material that is collected, divided, packaged, governed, worked on, and made usable.",
        mobileSupported: true,
        desktopSupported: true,
      },
    ],
    relatedRoutes: ["/words/privacy", "/words/hub", "/words/artificial"],
  }),
] as const;

export const canonicalPublicationProject = {
  id: `${CANONICAL_ORIGIN}/#project`,
  name: "Words Over Time",
  description:
    "Words Over Time is a semantic-frequency research project, design research, and infographic art by Dai Pan / 潘岱.",
  doi: PROJECT_DOI,
  doiUrl: PROJECT_DOI_URL,
  authorId: canonicalAuthor.id,
  publishedAt: "2026-05-07",
  modifiedAt: "2026-08-22",
  inLanguage: "en",
} as const;
