import { access, readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

type AuditedStudy = {
  href: string | null;
  label: string;
  slug: string;
  status: "complete" | "coming-soon";
  studyId: string;
};

const require = createRequire(import.meta.url);
const { words } = require("../src/data/words.ts") as {
  words: AuditedStudy[];
};

const root = fileURLToPath(new URL("..", import.meta.url));
const mobileHomePath = path.join(root, "src/components/home/mobile/MobileHome.tsx");
const mobileCssPath = path.join(root, "src/components/home/mobile/mobile-home.module.css");
const desktopHomePath = path.join(root, "src/components/home/desktop/DesktopHome.tsx");
const evidencePath = path.join(
  root,
  "docs/evidence/mobile-home-forever-rebuild-2026-08/home-word-bbox-audit.json",
);

const expectedPublished = [
  ["study-forever", "forever", "/words/forever", "one"],
  ["study-artificial", "artificial", "/words/artificial", "one"],
  ["study-privacy", "privacy", "/words/privacy", "one"],
  ["study-hub", "hub", "/words/hub", "two"],
  ["study-depression", "depression", "/words/depression", "two"],
  ["study-data", "data", "/words/data", "two"],
] as const;

const failures: string[] = [];

function check(condition: unknown, message: string) {
  if (!condition) failures.push(message);
}

async function exists(filePath: string) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

const [mobileHome, mobileCss, desktopHome, evidenceText] = await Promise.all([
  readFile(mobileHomePath, "utf8"),
  readFile(mobileCssPath, "utf8"),
  readFile(desktopHomePath, "utf8"),
  readFile(evidencePath, "utf8"),
]);

const evidence = JSON.parse(evidenceText) as {
  expectedMarks?: Array<{
    href: string | null;
    id: string;
    label: string;
    panel: "one" | "two";
    status: "complete" | "coming-soon";
    studyId: string;
  }>;
  status?: string;
};

for (const study of words) {
  for (const field of ["label", "href", "status", "studyId"] as const) {
    check(
      Object.hasOwn(study, field),
      `Registry entry ${study.slug} must explicitly own ${field}`,
    );
  }
}

const published = words.filter((study) => study.status === "complete");
const planned = words.filter((study) => study.status === "coming-soon");

check(published.length === 6, `Expected six published studies, found ${published.length}`);
check(planned.length === 1, `Expected one planned study, found ${planned.length}`);
check(
  planned[0]?.studyId === "study-intelligence" &&
    planned[0]?.label === "intelligence" &&
    planned[0]?.href === null,
  "Intelligence must be the sole route-less coming-soon entry",
);
check(
  words.every((study) => study.label !== "null" && study.slug !== "null"),
  "Canonical registry must not contain a null study",
);

for (const [studyId, label, href, panel] of expectedPublished) {
  const study = published.find((entry) => entry.studyId === studyId);
  check(Boolean(study), `Missing published registry entry ${studyId}`);
  check(study?.label === label, `${studyId} must expose label ${label}`);
  check(study?.href === href, `${studyId} must resolve to ${href}`);
  check(
    mobileHome.includes(`publishedStudyById("${studyId}")`),
    `MobileHome must select ${studyId} from the canonical registry`,
  );
  check(
    await exists(path.join(root, "src/app", href.slice(1), "page.tsx")),
    `Published route file is missing for ${href}`,
  );

  const mark = evidence.expectedMarks?.find((entry) => entry.studyId === studyId);
  check(Boolean(mark), `BBox evidence schema is missing ${studyId}`);
  check(mark?.label === label, `BBox evidence label mismatch for ${studyId}`);
  check(mark?.href === href, `BBox evidence href mismatch for ${studyId}`);
  check(mark?.panel === panel, `BBox evidence panel mismatch for ${studyId}`);
  check(mark?.status === "complete", `BBox evidence status mismatch for ${studyId}`);
}

check(
  !(await exists(path.join(root, "src/app/words/null/page.tsx"))),
  "A /words/null route must not be created",
);

const publishedMarkCount = mobileHome.match(/<PublishedWordMark\b/g)?.length ?? 0;
check(
  publishedMarkCount === 6,
  `MobileHome must render six published word anchors, found ${publishedMarkCount}`,
);
check(
  mobileHome.includes('plannedStudyById("study-intelligence")'),
  "MobileHome must select intelligence from the planned registry entry",
);
check(
  !mobileHome.includes("<PublishedWordMark study={intelligenceStudy}"),
  "Intelligence must not use the published link renderer",
);

for (const selector of [
  "data-audit-home-word",
  "data-home-panel",
  "data-home-status",
  "data-home-study-id",
  "data-home-word",
]) {
  check(mobileHome.includes(selector), `Stable Home audit selector is missing: ${selector}`);
}

for (const [label, pattern] of [
  ["Client Component directive", /["']use client["']/],
  ["React effect", /\buseEffect\b/],
  ["React state", /\buseState\b/],
  ["window API", /\bwindow\b/],
  ["document API", /\bdocument\b/],
  ["UA sniffing", /\buserAgent\b|\bnavigator\b/],
  ["dynamic no-SSR", /\bssr\s*:\s*false\b|\bdynamic\s*\(/],
  ["request headers", /\bheaders\s*\(/],
  ["canvas", /<canvas\b|createElement\(["']canvas["']\)/],
  ["Three/WebGL", /\bthree\b|\bTHREE\b|WebGL/i],
] as const) {
  check(!pattern.test(mobileHome), `MobileHome contains forbidden ${label}`);
}

check(
  !/m-home-word-null|\/words\/null|No route|styles\.(?:null|unavailable)/.test(
    mobileHome,
  ),
  "MobileHome must not retain the null/no-route placeholder",
);
check(
  !/\.null(?:Word|Mark)|\.unavailable(?:Word|Status)/.test(mobileCss),
  "Mobile Home CSS must not retain null/unavailable selectors",
);
check(
  !mobileHome.includes('href="/words/'),
  "Published Mobile Home hrefs must come from the canonical registry",
);

const importSpecifiers = Array.from(
  mobileHome.matchAll(/from\s+["']([^"']+)["']/g),
  (match) => match[1],
);
const allowedImports = new Set(["next/link", "@/data/words", "./mobile-home.module.css"]);
check(
  importSpecifiers.every((specifier) => allowedImports.has(specifier)),
  `MobileHome has an unexpected dependency: ${importSpecifiers
    .filter((specifier) => !allowedImports.has(specifier))
    .join(", ")}`,
);
check(
  !desktopHome.includes("MobileHome") && !mobileHome.includes("DesktopHome"),
  "MobileHome and DesktopHome must not import one another",
);

const hubWordBlocks = Array.from(
  mobileCss.matchAll(/\.hubWord\s*\{([^}]*)\}/g),
  (match) => match[1],
);
const hubMarkBlocks = Array.from(
  mobileCss.matchAll(/\.hubMark\s*\{([^}]*)\}/g),
  (match) => match[1],
);
check(
  hubWordBlocks.some(
    (block) =>
      /grid-column:\s*1\s*\/\s*3/.test(block) &&
      /grid-row:\s*1\s*\/\s*3/.test(block) &&
      /align-self:\s*stretch/.test(block),
  ),
  "Hub must inherit the two-row vertical-spine grid geometry",
);
check(
  hubMarkBlocks.some((block) => /writing-mode:\s*vertical-rl/.test(block)),
  "Hub mark must retain the vertical writing mode",
);

const remFontMinimums = Array.from(
  mobileCss.matchAll(/font-size:\s*(?:clamp\(\s*)?([0-9.]+)rem/g),
  (match) => Number(match[1]) * 16,
);
const pxFontSizes = Array.from(
  mobileCss.matchAll(/font-size:\s*([0-9.]+)px/g),
  (match) => Number(match[1]),
);
const sourceFontSizes = [...remFontMinimums, ...pxFontSizes];
const sourceFontFloorPx = Math.min(...sourceFontSizes);
check(
  sourceFontSizes.length > 0 && sourceFontFloorPx >= 13,
  `Mobile Home source font floor is ${sourceFontFloorPx}px; expected at least 13px`,
);

const plannedEvidence = evidence.expectedMarks?.filter(
  (entry) => entry.status === "coming-soon",
);
check(
  evidence.status === "POST_HUB_GATE_BROWSER_MEASUREMENT_REQUIRED",
  "BBox evidence must remain explicitly unmeasured after the Home gate change",
);
check(
  plannedEvidence?.length === 1 &&
    plannedEvidence[0]?.studyId === "study-intelligence" &&
    plannedEvidence[0]?.href === null,
  "BBox evidence must contain one inert intelligence mark",
);

const report = {
  status: failures.length === 0 ? "PASS" : "FAIL",
  registry: {
    entries: words.length,
    explicitFields: ["label", "href", "status", "studyId"],
    publishedAnchors: published.length,
    publishedHrefs: published.map((study) => study.href),
    plannedMarks: planned.map((study) => ({
      studyId: study.studyId,
      label: study.label,
      href: study.href,
      status: study.status,
    })),
  },
  mobileHome: {
    serverComponent: !/["']use client["']/.test(mobileHome),
    publishedMarkCount,
    sourceFontFloorPx,
    stableAuditSelectors: true,
    hubVerticalSpine: true,
    nullStudyOrRoute: false,
  },
  evidence: {
    status: evidence.status,
    browserMeasurementsPresent: false,
  },
  failures,
};

console.log(JSON.stringify(report, null, 2));

if (failures.length > 0) process.exitCode = 1;
