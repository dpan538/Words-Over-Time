import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const repositoryRoot = process.cwd();
const sourceRoot = path.join(repositoryRoot, "src");

const mobileEntrypoints = [
  "src/components/home/mobile/MobileHome.tsx",
  "src/components/about/mobile/MobileAbout.tsx",
  "src/components/forever/mobile/MobileForeverStudy.tsx",
  "src/components/artificial/mobile/MobileArtificialStudy.tsx",
  "src/components/hub/mobile/MobileHubStudy.tsx",
  "src/components/privacy/mobile/MobilePrivacyStudy.tsx",
  "src/components/data/mobile/MobileDataStudy.tsx",
  "src/components/depression/mobile/MobileDepressionEdition.tsx",
  "src/components/words/mobile/MobileWordsIndex.tsx",
  "src/components/error/mobile/MobileErrorStatePage.tsx",
] as const;

const publicRoutes = [
  "src/app/page.tsx",
  "src/app/about/page.tsx",
  "src/app/words/page.tsx",
  "src/app/words/forever/page.tsx",
  "src/app/words/artificial/page.tsx",
  "src/app/words/hub/page.tsx",
  "src/app/words/privacy/page.tsx",
  "src/app/words/data/page.tsx",
  "src/app/words/depression/page.tsx",
] as const;

const specialPublicSurfaces = [
  {
    file: "src/app/words/privacy/mobile-demo/page.tsx",
    required: 'redirect("/words/privacy")',
  },
  { file: "src/app/error.tsx", required: "ErrorStatePage" },
  { file: "src/app/global-error.tsx", required: "ErrorStatePage" },
  { file: "src/app/not-found.tsx", required: "ErrorStatePage" },
] as const;

const mobileWordStudyEntrypoints = mobileEntrypoints.slice(2, 8);

const forbiddenMobileDependencies = [
  /\/desktop\//i,
  /(?:^|\/)Desktop[^/]*\.(?:ts|tsx)$/,
  /(?:^|\/)[^/]*Poster[^/]*\.(?:ts|tsx)$/,
  /\/WordPageShell\.tsx$/,
  /\/Nav\.tsx$/,
  /\/SearchIntentSummary\.tsx$/,
  /\/EvidenceCoverageStrip\.tsx$/,
  /\/WordSeoSummary\.tsx$/,
  /\/edition\//,
] as const;

const legacyBoundaryPatterns = [
  { name: "959px", pattern: /959px/ },
  { name: "960px", pattern: /960px/ },
  { name: "59.999rem", pattern: /59\.999rem/ },
  { name: "60rem", pattern: /60rem/ },
  { name: "min-[960px]", pattern: /min-\[960px\]/ },
  { name: "Tailwind md:hidden", pattern: /\bmd:hidden\b/ },
] as const;

const sourceExtensions = [".ts", ".tsx", ".css", ".mjs", ".js", ".jsx", ".json"];

function relative(filePath: string) {
  return path.relative(repositoryRoot, filePath).split(path.sep).join("/");
}

function walk(directory: string): string[] {
  if (!existsSync(directory)) return [];
  return readdirSync(directory).flatMap((name) => {
    const candidate = path.join(directory, name);
    return statSync(candidate).isDirectory() ? walk(candidate) : [candidate];
  });
}

function resolveSourceImport(fromFile: string, specifier: string) {
  if (!specifier.startsWith("@/") && !specifier.startsWith(".")) return null;

  const unresolved = specifier.startsWith("@/")
    ? path.join(sourceRoot, specifier.slice(2))
    : path.resolve(path.dirname(fromFile), specifier);
  const candidates = [
    unresolved,
    ...sourceExtensions.map((extension) => `${unresolved}${extension}`),
    ...sourceExtensions.map((extension) => path.join(unresolved, `index${extension}`)),
  ];

  return candidates.find((candidate) => existsSync(candidate) && statSync(candidate).isFile()) ?? null;
}

function importsFrom(filePath: string) {
  const source = readFileSync(filePath, "utf8");
  const specifiers = new Set<string>();
  const patterns = [
    /(?:import|export)\s+(?:type\s+)?(?:[\s\S]*?\sfrom\s*)?["']([^"']+)["']/g,
    /import\(\s*["']([^"']+)["']\s*\)/g,
    /@import\s+["']([^"']+)["']/g,
  ];

  for (const pattern of patterns) {
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(source)) !== null) specifiers.add(match[1]);
  }

  return [...specifiers]
    .map((specifier) => resolveSourceImport(filePath, specifier))
    .filter((candidate): candidate is string => Boolean(candidate));
}

function dependencyGraph(entrypoint: string) {
  const pending = [path.join(repositoryRoot, entrypoint)];
  const visited = new Set<string>();

  while (pending.length > 0) {
    const current = pending.pop()!;
    if (visited.has(current) || !existsSync(current)) continue;
    visited.add(current);
    if (!/\.(?:ts|tsx|css|mjs|js|jsx)$/.test(current)) continue;
    for (const imported of importsFrom(current)) pending.push(imported);
  }

  return [...visited];
}

const failures: string[] = [];
const entrypointReports = mobileEntrypoints.map((entrypoint) => {
  const absoluteEntrypoint = path.join(repositoryRoot, entrypoint);
  if (!existsSync(absoluteEntrypoint)) {
    failures.push(`Missing mobile entrypoint: ${entrypoint}`);
    return { entrypoint, dependencyCount: 0, forbiddenDependencies: [] as string[] };
  }

  const dependencies = dependencyGraph(entrypoint);
  const forbiddenDependencies = dependencies
    .map(relative)
    .filter((dependency) =>
      forbiddenMobileDependencies.some((pattern) => pattern.test(`/${dependency}`)),
    );
  if (forbiddenDependencies.length > 0) {
    failures.push(`${entrypoint} reaches desktop presentation: ${forbiddenDependencies.join(", ")}`);
  }

  return {
    entrypoint,
    dependencyCount: dependencies.length,
    forbiddenDependencies,
  };
});

const mobileWordStudyMainLandmarks = mobileWordStudyEntrypoints.map((entrypoint) => {
  const dependencies = dependencyGraph(entrypoint);
  const owners = dependencies
    .filter((dependency) => /\.(?:ts|tsx)$/.test(dependency))
    .filter((dependency) => /<main(?:\s|>)/.test(readFileSync(dependency, "utf8")))
    .map(relative);

  if (owners.length === 0) {
    failures.push(`${entrypoint} does not own a mobile main landmark`);
  }

  return { entrypoint, owners };
});

const mobileInventory = walk(path.join(sourceRoot, "components"))
  .filter((filePath) => {
    const sourcePath = relative(filePath);
    const baseName = path.basename(filePath);
    return sourcePath.includes("/mobile/") || /Mobile/.test(baseName);
  })
  .filter((filePath) => /\.(?:ts|tsx|css)$/.test(filePath));

const inventoryForbiddenDependencies = mobileInventory.flatMap((filePath) =>
  importsFrom(filePath)
    .map(relative)
    .filter((dependency) =>
      forbiddenMobileDependencies.some((pattern) => pattern.test(`/${dependency}`)),
    )
    .map((dependency) => `${relative(filePath)} → ${dependency}`),
);
if (inventoryForbiddenDependencies.length > 0) {
  failures.push(
    `Mobile design inventory imports desktop presentation: ${inventoryForbiddenDependencies.join(", ")}`,
  );
}

const legacyBoundaryHits = mobileInventory.flatMap((filePath) => {
  const source = readFileSync(filePath, "utf8");
  return legacyBoundaryPatterns
    .filter(({ pattern }) => pattern.test(source))
    .map(({ name }) => `${relative(filePath)} (${name})`);
});
if (legacyBoundaryHits.length > 0) {
  failures.push(`Legacy mobile boundary found: ${legacyBoundaryHits.join(", ")}`);
}

for (const route of publicRoutes) {
  const routePath = path.join(repositoryRoot, route);
  if (!existsSync(routePath)) {
    failures.push(`Missing public route: ${route}`);
    continue;
  }
  const routeSource = readFileSync(routePath, "utf8");
  if (/components\/(?:[^"']+\/)?desktop\/|\b(?:Desktop\w+|\w+Poster|WordPageShell)\b/.test(routeSource)) {
    failures.push(`${route} imports or assembles desktop presentation directly`);
  }
}

for (const surface of specialPublicSurfaces) {
  const surfacePath = path.join(repositoryRoot, surface.file);
  if (!existsSync(surfacePath)) {
    failures.push(`Missing special public surface: ${surface.file}`);
    continue;
  }
  if (!readFileSync(surfacePath, "utf8").includes(surface.required)) {
    failures.push(`${surface.file} no longer contains ${surface.required}`);
  }
}

const boundaryPath = path.join(sourceRoot, "components/edition/EditionBoundary.tsx");
if (!existsSync(boundaryPath)) {
  failures.push("Missing neutral EditionBoundary");
} else {
  const boundarySource = readFileSync(boundaryPath, "utf8");
  if (!boundarySource.includes('MOBILE_MEDIA_QUERY = "(max-width: 500px)"')) {
    failures.push("EditionBoundary mobile query is not exactly max-width: 500px");
  }
  if (!boundarySource.includes('DESKTOP_MEDIA_QUERY = "(min-width: 501px)"')) {
    failures.push("EditionBoundary desktop query is not exactly min-width: 501px");
  }
  if (!boundarySource.includes("useSyncExternalStore")) {
    failures.push("EditionBoundary does not use a hydration-safe external-store snapshot");
  }
}

const report = {
  status: failures.length === 0 ? "PASS" : "FAIL",
  contract: {
    mobile: "width <= 500px",
    coreViewport: "390px",
    desktop: "width >= 501px",
  },
  mobileEntrypoints: entrypointReports,
  mobileWordStudyMainLandmarks,
  inventoriedMobileDesignFileCount: mobileInventory.length,
  inventoryForbiddenDependencies,
  legacyBoundaryHits,
  publicRouteCount: publicRoutes.length,
  specialPublicSurfaceCount: specialPublicSurfaces.length,
  failures,
};

console.log(JSON.stringify(report, null, 2));
if (failures.length > 0) process.exitCode = 1;
