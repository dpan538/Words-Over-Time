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
const posterMarksPath = path.join(root, "src/components/PosterMarks.tsx");
const foreverPagePath = path.join(root, "src/app/words/forever/page.tsx");
const foreverPublicRendererPath = path.join(
  root,
  "src/components/forever/mobile/MobileForeverStudy.tsx",
);

const [
  mobileHome,
  mobileCss,
  desktopHome,
  posterMarks,
  foreverPage,
  foreverPublicRenderer,
] = await Promise.all([
    readFile(mobileHomePath, "utf8"),
    readFile(mobileCssPath, "utf8"),
    readFile(desktopHomePath, "utf8"),
    readFile(posterMarksPath, "utf8"),
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
  ["study-hub", "hub", "/words/hub"],
  ["study-data", "data", "/words/data"],
  ["study-depression", "depression", "/words/depression"],
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
  "study={hubStudy}",
  "study={dataStudy}",
  "study={depressionStudy}",
  'id={`m-home-word-${intelligenceStudy.slug}`}',
  "(Coming soon)",
  "<p className={styles.overTime}>Over Time</p>",
  "data-home-palette-divider",
  "mobile-project-introduction",
  "mobile-copyright",
  "data-home-footer",
] as const;
const sourcePositions = sourceSequence.map((token) => mobileHome.indexOf(token));
check(
  sourcePositions.every(
    (position, index) =>
      position >= 0 && (index === 0 || position > sourcePositions[index - 1]),
  ),
  "Mobile Home source order must be label → seven words → Over Time → palette → introduction → Copyright → footer",
);

const desktopPaletteSequence = [
  "bg-ink",
  "bg-anthracite",
  "bg-ulm",
  "bg-wheat",
  "bg-blaze",
  "bg-signal",
  "bg-fire",
  "bg-wine",
  "bg-sun",
  "bg-nice",
  "bg-cobalt",
  "bg-sail",
  "bg-hub-amethyst",
  "bg-hub-space",
  "bg-hub-teal",
  "bg-hub-ruby",
  "bg-hub-blue",
] as const;

const desktopPalettePositions = desktopPaletteSequence.map((token) =>
  posterMarks.indexOf(token),
);
check(
  desktopPalettePositions.every(
    (position, index) =>
      position >= 0 &&
      (index === 0 || position > desktopPalettePositions[index - 1]),
  ),
  "Desktop PosterMarks must preserve its canonical 17-segment palette order",
);

const mobilePaletteSequence = [
  "#050510",
  "#FCFAF3",
  "#AE4202",
  "#1570AC",
  "#FBB728",
  "#FF315F",
  "#6F3AA6",
  "#EF4B35",
  "#2C78A9",
  "#EF805F",
  "#7C88E3",
  "#E4BB59",
  "#F5816B",
  "#66D8BD",
  "#2A375C",
  "#267765",
  "#B33A2E",
] as const;
const mobilePalettePositions = mobilePaletteSequence.map((token) =>
  mobileHome.indexOf(token),
);
check(
  mobilePalettePositions.every(
    (position, index) =>
      position >= 0 &&
      (index === 0 || position > mobilePalettePositions[index - 1]),
  ),
  "Mobile Home must use the audited 17-segment mobile study palette",
);

check(
  mobileHome.indexOf("Words Over Time") < mobileHome.indexOf("About"),
  "Header must read Words Over Time before About",
);
check(
  (mobileHome.match(/<PublishedWordMark\b/g)?.length ?? 0) === 6,
  "Mobile Home must render exactly six routed word links",
);
check(
  !/m-home-word-null|data-home-word="null"|styles\.nullWord|\/words\/null/.test(
    mobileHome,
  ),
  "Mobile Home must not render or link a null study",
);
check(
  mobileHome.includes('publishedStudyById("study-hub")') &&
    mobileHome.includes('data-home-word-row="hub-data"') &&
    mobileHome.indexOf("study={hubStudy}") <
      mobileHome.indexOf("study={dataStudy}"),
  "Hub and data must be adjacent published links in one shared row",
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
  ) || /<details[\s\S]*?className=\{`\$\{styles\.copyright\} mobile-copyright`\}/.test(
    mobileHome,
  ),
  "Copyright must remain a native details element",
);
check(
  !/<details[^>]*\bopen\b/.test(mobileHome),
  "Copyright must be a native details element that is closed by default",
);
check(
  mobileHome.includes("<summary>COPYRIGHTS</summary>"),
  "Copyright disclosure must use the required summary",
);
check(
  mobileHome.includes("© 2026 Dai Pan / 潘岱") &&
    mobileHome.includes("Commercial reproduction or reuse") &&
    mobileHome.includes("Research / data / writing / design by Dai Pan / 潘岱"),
  "Copyright disclosure must retain copyright, reuse, and creator credit",
);

const normalizedMobileHome = mobileHome.replace(/\s+/g, " ");
check(
  normalizedMobileHome.includes(
    "Words Over Time is a semantic-frequency research project, design research, and infographic art. It treats language as visual material: a field of memory, evidence, attention, and public pressure, making the available evidence visible with its sources, limits, and gaps.",
  ),
  "Mobile Home must preserve the approved project overview verbatim",
);
check(
  mobileHome.includes(
    "<p>Words Over Time: semantic change and word usage over time</p>",
  ),
  "Mobile Home must end with the required always-visible footer wording",
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
  /\.wordField\s*\{[\s\S]*?grid-template-columns:\s*minmax\(0,\s*1fr\);[\s\S]*?\}/.test(
    mobileCss,
  ),
  "The seven words must occupy a single-column typographic field",
);
check(
  /\.hubDataRow\s*\{[\s\S]*?display:\s*flex;[\s\S]*?white-space:\s*nowrap;[\s\S]*?\}/.test(
    mobileCss,
  ),
  "Hub and data must share one unbroken typographic row",
);
check(
  /--home-field-label-size:\s*clamp\(0\.9375rem,\s*4vw,\s*1rem\);/.test(
    mobileCss,
  ) &&
    /\.directoryLabel,\s*\n\.overTime\s*\{[\s\S]*?font-size:\s*var\(--home-field-label-size\);[\s\S]*?\}/.test(
      mobileCss,
    ),
  "WORDS YOU WANNA KNOW and OVER TIME must share the approved refined font size",
);
check(
  /\.directoryLabel\s*\{[\s\S]*?letter-spacing:\s*0\.035em;[\s\S]*?\}/.test(
    mobileCss,
  ) &&
    /\.directoryLabel\s*\{[\s\S]*?word-spacing:\s*-0\.12em;[\s\S]*?\}/.test(
      mobileCss,
    ),
  "WORDS YOU WANNA KNOW must retain its tightened letter and word spacing",
);
check(
  /\.wordField\s*\{[\s\S]*?row-gap:\s*clamp\(20px,\s*5\.4vw,\s*22px\);[\s\S]*?\}/.test(
    mobileCss,
  ),
  "The six word rows must retain the approved 20–22px refined rhythm",
);
check(
  /\.wordField\s*\{[\s\S]*?padding:\s*clamp\(2\.25rem,\s*9vw,\s*2\.8rem\)\s+var\(--home-gutter\)\s+clamp\(1\.5rem,\s*6vw,\s*1\.75rem\);[\s\S]*?\}/.test(
    mobileCss,
  ) &&
    /\.paletteDivider\s*\{[\s\S]*?margin:\s*0\s+var\(--home-gutter\)\s+clamp\(2rem,\s*8vw,\s*2\.25rem\);[\s\S]*?\}/.test(
      mobileCss,
    ),
  "The opening field and closing palette rhythm must retain their approved spacing",
);
check(
  /--home-word-size:\s*clamp\(/.test(mobileCss) &&
    /\.wordLink,\s*\n\.intelligenceMark\s*\{[\s\S]*?font-size:\s*var\(--home-word-size\);[\s\S]*?\}/.test(
      mobileCss,
    ),
  "All seven word marks must consume one shared mobile font-size variable",
);
for (const className of [
  "forever",
  "artificial",
  "privacy",
  "hub",
  "data",
  "depression",
]) {
  const blocks = Array.from(
    mobileCss.matchAll(
      new RegExp(`\\.${className}\\s*\\{([\\s\\S]*?)\\}`, "g"),
    ),
    (match) => match[1],
  );
  check(
    blocks.every((block) => !/font-size\s*:/.test(block)),
    `.${className} must not override the shared word font size`,
  );
}
check(
  /\.forever,\s*\n\.artificial,\s*\n\.privacy,\s*\n\.hub,\s*\n\.depression,\s*\n\.data\s*\{[\s\S]*?color:\s*inherit;[\s\S]*?\}/.test(
    mobileCss,
  ) &&
    /\.intelligence\s*\{[\s\S]*?color:\s*var\(--wot-ink\);[\s\S]*?\}/.test(
      mobileCss,
    ),
  "Intelligence must remain visible in the normal ink color before scroll emphasis",
);
check(
  /\.copyright summary::after\s*\{[\s\S]*?content:\s*"\+";[\s\S]*?\}/.test(
    mobileCss,
  ) &&
    /\.copyright\[open\] summary::after\s*\{[\s\S]*?content:\s*"−";[\s\S]*?\}/.test(
      mobileCss,
    ),
  "Copyrights summary must expose a right-side plus and open-state minus",
);
const copyrightBlock = mobileCss.match(
  /\.copyright\s*\{([\s\S]*?)\}/,
)?.[1];
const footerBlock = mobileCss.match(/\.footer\s*\{([\s\S]*?)\}/)?.[1];
check(
  copyrightBlock != null &&
    footerBlock != null &&
    /border-block\s*:\s*1px solid/.test(copyrightBlock) &&
    !/border-block-start\s*:/.test(footerBlock) &&
    /padding-block\s*:\s*0\.9rem 10px;/.test(footerBlock),
  "Copyrights must have equal top/bottom rules and the page must end with 10px padding",
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
  foreverPage.includes("MobileForeverStudy") &&
    foreverPage.includes("foreverMobileAnalysis") &&
    !foreverPage.includes("ForeverMobileEditorial") &&
    !foreverPage.includes("ForeverMobileDataGate"),
  "Public Forever route must use the independent fixed-release mobile study renderer",
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
      "hub",
      "data",
      "depression",
      "intelligence",
      "COMING SOON",
      "OVER TIME",
      "mobile study palette divider",
      "project introduction",
      "COPYRIGHTS",
      "final footer",
    ],
    routedWordLinks: publishedHomeStudies.length,
    nullRouteCreated: false,
    nullRendered: false,
    hubRendered: true,
    renderedWordRows: 6,
    copyrightDefaultOpen: false,
    sourceFontFloorPx,
  },
  forever: {
    publicRenderer: "MobileForeverStudy",
    internalGateCopyRendered: false,
  },
  failures,
};

console.log(JSON.stringify(report, null, 2));

if (failures.length > 0) process.exitCode = 1;
