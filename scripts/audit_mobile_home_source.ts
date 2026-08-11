import { readFile } from "node:fs/promises";
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
const mobileHomePath = path.join(
  root,
  "src/components/home/mobile/MobileHome.tsx",
);
const mobileCssPath = path.join(
  root,
  "src/components/home/mobile/mobile-home.module.css",
);
const desktopHomePath = path.join(
  root,
  "src/components/home/desktop/DesktopHome.tsx",
);
const foreverPagePath = path.join(root, "src/app/words/forever/page.tsx");
const foreverPublicRendererPath = path.join(
  root,
  "src/components/ForeverMobileEditorial.tsx",
);

const [mobileHome, mobileCss, desktopHome, foreverPage, foreverPublicRenderer] =
  await Promise.all([
    readFile(mobileHomePath, "utf8"),
    readFile(mobileCssPath, "utf8"),
    readFile(desktopHomePath, "utf8"),
    readFile(foreverPagePath, "utf8"),
    readFile(foreverPublicRendererPath, "utf8"),
  ]);

const failures: string[] = [];

function check(condition: unknown, message: string) {
  if (!condition) failures.push(message);
}

for (const study of words) {
  for (const field of ["label", "href", "status", "studyId"] as const) {
    check(
      Object.hasOwn(study, field),
      `Registry entry ${study.slug} must explicitly own ${field}`,
    );
  }
}

const canonicalHub = words.find((study) => study.studyId === "study-hub");
check(
  canonicalHub?.label === "hub" && canonicalHub.href === "/words/hub",
  "The existing Hub study registry entry must remain unchanged",
);

const publishedHomeStudies = [
  ["study-forever", "forever", "/words/forever"],
  ["study-artificial", "artificial", "/words/artificial"],
  ["study-privacy", "privacy", "/words/privacy"],
  ["study-depression", "depression", "/words/depression"],
  ["study-data", "data", "/words/data"],
] as const;

for (const [studyId, label, href] of publishedHomeStudies) {
  const study = words.find((entry) => entry.studyId === studyId);
  check(study?.label === label, `${studyId} must keep label ${label}`);
  check(study?.href === href, `${studyId} must keep href ${href}`);
  check(
    mobileHome.includes(`publishedStudyById("${studyId}")`),
    `MobileHome must select ${studyId} from the route registry`,
  );
}

const intelligence = words.find(
  (study) => study.studyId === "study-intelligence",
);
check(
  intelligence?.status === "coming-soon" && intelligence.href === null,
  "Intelligence must remain the sole route-less coming-soon registry item",
);

const sourceSequence = [
  "Words you wanna know:",
  "study={foreverStudy}",
  "study={artificialStudy}",
  "study={privacyStudy}",
  'id="m-home-word-null"',
  "study={depressionStudy}",
  'id={`m-home-word-${intelligenceStudy.slug}`}',
  "(Coming soon)",
  "study={dataStudy}",
  "<p className={styles.overTime}>Over Time</p>",
  "mobile-project-introduction",
  "mobile-copyright",
] as const;
const sourcePositions = sourceSequence.map((token) => mobileHome.indexOf(token));
check(
  sourcePositions.every(
    (position, index) =>
      position >= 0 && (index === 0 || position > sourcePositions[index - 1]),
  ),
  "Mobile Home source order must be label → seven words → Over Time → introduction → Copyright",
);

check(
  mobileHome.indexOf("Words Over Time") < mobileHome.indexOf("About"),
  "Header must read Words Over Time before About",
);
check(
  (mobileHome.match(/<PublishedWordMark\b/g)?.length ?? 0) === 5,
  "Mobile Home must render exactly five routed word links",
);
check(
  mobileHome.includes('data-home-word="null"') &&
    !mobileHome.includes('href="/words/null"'),
  "Null must be visible without inventing a /words/null route",
);
check(
  !/hubStudy|study-hub|m-home-word-hub/.test(mobileHome),
  "Hub must not appear in Mobile Home",
);
check(
  !/No route|Continue|About the project|continueRule|aboutCta|terminalRule|firstPanel|secondPanel|projectName/.test(
    mobileHome,
  ),
  "Mobile Home still contains a removed panel, continuation, title, route note, or CTA",
);
check(
  !/\b0[1-7]\b/.test(mobileHome),
  "Mobile Home must not number the seven words",
);
check(
  /<details className=\{`\$\{styles\.copyright\} mobile-copyright`\}>/.test(
    mobileHome,
  ) && !/<details[^>]*\bopen\b/.test(mobileHome),
  "Copyright must be a native details element that is closed by default",
);
check(
  mobileHome.includes("<summary>Copyright / rights</summary>"),
  "Copyright disclosure must use the required summary",
);
check(
  mobileHome.includes("© 2026 Dai Pan / 潘岱") &&
    mobileHome.includes("Commercial reproduction or reuse") &&
    mobileHome.includes("Research / data / writing / design by Dai Pan / 潘岱"),
  "Copyright disclosure must retain copyright, reuse, and creator credit",
);

for (const [label, pattern] of [
  ["Client Component directive", /["']use client["']/],
  ["React effect", /\buseEffect\b/],
  ["React state", /\buseState\b/],
  ["browser API", /\bwindow\b|\bdocument\b|\bnavigator\b/],
  ["dynamic no-SSR", /\bssr\s*:\s*false\b|\bdynamic\s*\(/],
  ["canvas/WebGL/Three", /<canvas\b|WebGL|\bthree\b/i],
] as const) {
  check(!pattern.test(mobileHome), `MobileHome contains forbidden ${label}`);
}

check(
  !desktopHome.includes("MobileHome") && !mobileHome.includes("DesktopHome"),
  "MobileHome and DesktopHome must remain independent",
);
check(
  /\.nullWord\s*\{[\s\S]*?writing-mode:\s*vertical-rl;[\s\S]*?\}/.test(
    mobileCss,
  ),
  "Null must retain a vertical typographic composition",
);
check(
  !/aspect-ratio|min-height|\.continueRule|\.firstPanel|\.secondPanel|\.mobileFooter|\.aboutCta/.test(
    mobileCss,
  ),
  "Mobile Home CSS must not retain panel or spacing-only height machinery",
);
check(
  /\.copyright summary\s*\{[\s\S]*?min-block-size:\s*44px;[\s\S]*?\}/.test(
    mobileCss,
  ),
  "Copyright summary must expose a 44px minimum target",
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

const publicForeverText = `${foreverPage}\n${foreverPublicRenderer}`;
check(
  foreverPage.includes("ForeverMobileEditorial") &&
    !foreverPage.includes("ForeverMobileDataGate"),
  "Public Forever route must use the prior public mobile renderer",
);
check(
  !/RAW-DATA AUDIT|PUBLICATION GATE|Forever page gate|implementation unauthorized|\bSTOP\b|productionEligible|contract-google/i.test(
    publicForeverText,
  ),
  "Public Forever route or renderer contains internal audit/gate copy",
);

const report = {
  status: failures.length === 0 ? "PASS" : "FAIL",
  mobileHome: {
    sequence: [
      "WORDS YOU WANNA KNOW",
      "forever",
      "artificial",
      "privacy",
      "null",
      "depression",
      "intelligence",
      "COMING SOON",
      "data",
      "OVER TIME",
      "project introduction",
      "Copyright / rights",
    ],
    routedWordLinks: publishedHomeStudies.length,
    nullRouteCreated: false,
    hubRendered: false,
    copyrightDefaultOpen: false,
    sourceFontFloorPx,
  },
  forever: {
    publicRenderer: "ForeverMobileEditorial",
    internalGateCopyRendered: false,
  },
  failures,
};

console.log(JSON.stringify(report, null, 2));

if (failures.length > 0) process.exitCode = 1;
