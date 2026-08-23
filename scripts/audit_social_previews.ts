import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

type CanonicalPublicationDataModule = typeof import("../src/lib/machine/canonical-publication-data");
type ResolveHook = (
  specifier: string,
  context: unknown,
  nextResolve: (specifier: string, context: unknown) => unknown,
) => unknown;

const { registerHooks } = createRequire(import.meta.url)("node:module") as {
  registerHooks(hooks: { resolve: ResolveHook }): void;
};

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === "server-only") {
      return { shortCircuit: true, url: "data:text/javascript,export {};" };
    }
    return nextResolve(specifier, context);
  },
});

const { CANONICAL_ORIGIN, canonicalPublicationRoutes } = (await import(
  new URL("../src/lib/machine/canonical-publication-data.ts", import.meta.url).href
)) as CanonicalPublicationDataModule;

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const buildRoot = path.join(repositoryRoot, ".next", "server", "app");
const runtimeBaseUrl = process.env.SOCIAL_PREVIEW_BASE_URL?.replace(/\/$/, "");
const failures: string[] = [];

function check(condition: unknown, message: string) {
  if (!condition) failures.push(message);
}

function read(relativePath: string) {
  return readFileSync(path.join(repositoryRoot, relativePath), "utf8");
}

function duplicates(values: string[]) {
  return [...new Set(values.filter((value, index) => values.indexOf(value) !== index))];
}

function decodeEntities(value: string) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&apos;", "'")
    .replace(/&#(\d+);/g, (_match, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_match, code: string) =>
      String.fromCodePoint(Number.parseInt(code, 16)),
    );
}

function attributes(tag: string) {
  const result: Record<string, string> = {};
  for (const match of tag.matchAll(/([:\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) {
    result[match[1].toLowerCase()] = decodeEntities(match[2] ?? match[3] ?? "");
  }
  return result;
}

function headFromHtml(html: string) {
  return html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1] ?? "";
}

function bodyFromHtml(html: string) {
  return html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? "";
}

function metaValues(head: string, attribute: "name" | "property", value: string) {
  return (head.match(/<meta\b[^>]*>/gi) ?? [])
    .map(attributes)
    .filter((entry) => entry[attribute]?.toLowerCase() === value.toLowerCase())
    .map((entry) => entry.content ?? "");
}

function canonicalValues(head: string) {
  return (head.match(/<link\b[^>]*>/gi) ?? [])
    .map(attributes)
    .filter((entry) => entry.rel?.toLowerCase().split(/\s+/).includes("canonical"))
    .map((entry) => entry.href ?? "");
}

function hash(value: string | Uint8Array) {
  return createHash("sha256").update(value).digest("hex");
}

function expectedImagePath(routePath: string, kind: "opengraph-image" | "twitter-image") {
  return routePath === "/" ? `/${kind}` : `${routePath}/${kind}`;
}

function expectedSocialTitle(route: (typeof canonicalPublicationRoutes)[number]) {
  return route.path === "/"
    ? route.machineTitle
    : `${route.machineTitle} | Words Over Time`;
}

function expectedImageAlt(route: (typeof canonicalPublicationRoutes)[number]) {
  return route.path === "/"
    ? route.machineTitle
    : `Words Over Time: ${route.machineTitle}`;
}

function routeHtmlArtifact(routePath: string) {
  return routePath === "/" ? "index.html" : `${routePath.slice(1)}.html`;
}

function isExpectedSocialImageUrl(value: string, expectedPath: string) {
  try {
    const url = new URL(value);
    return url.origin === CANONICAL_ORIGIN && url.pathname === expectedPath;
  } catch {
    return false;
  }
}

const canonicalSource = read("src/lib/machine/canonical-publication.ts");
const socialSource = read("src/lib/machine/social-preview.ts");
const imageSource = read("src/lib/og-image.tsx");
const rootImageSource = read("src/app/opengraph-image.tsx");
const rootTwitterSource = read("src/app/twitter-image.tsx");
const wordImageSource = read("src/app/words/[slug]/opengraph-image.tsx");
const wordTwitterSource = read("src/app/words/[slug]/twitter-image.tsx");
const aboutImageSource = read("src/app/about/opengraph-image.tsx");
const aboutTwitterSource = read("src/app/about/twitter-image.tsx");
const wordsImageSource = read("src/app/words/opengraph-image.tsx");
const wordsTwitterSource = read("src/app/words/twitter-image.tsx");
const allSocialRouteSources = [
  rootImageSource,
  rootTwitterSource,
  wordImageSource,
  wordTwitterSource,
  aboutImageSource,
  aboutTwitterSource,
  wordsImageSource,
  wordsTwitterSource,
].join("\n");

check(/^import "server-only";/m.test(socialSource), "Social preview contract must import server-only");
check(/^import "server-only";/m.test(imageSource), "Social image renderer must import server-only");
check(!/@\/lib\/site|\.\/site/.test(socialSource + imageSource), "Social preview runtime must not import legacy site.ts");
check(!/\bkeywords?\b|searchIntents?|search statistics|platform persistence|AI data|social traces/i.test(imageSource), "Social renderer contains legacy keyword/search copy");
check(!/\bkeywords?\b|searchIntents?|search statistics|platform persistence|AI data|social traces/i.test(socialSource + allSocialRouteSources), "Social contract or image route consumes legacy keyword/search copy");
check(/canonicalSocialPreview/.test(socialSource), "Canonical social-preview projection is missing");
check(/route\.machineDescription/.test(socialSource), "Social supporting text must derive from machineDescription");
check(/canonicalSocialTitle\(route\)/.test(socialSource), "Social title must derive from canonical social title");
check(/canonicalSocialImageAlt\(route\)/.test(socialSource), "Social alt must derive from canonical image alt");
check(/route\.subject\.name/.test(socialSource), "Social image title must derive from the canonical subject");
check(/route\.subject\.alternateNames/.test(socialSource), "Canonical alternate names must remain available to the social image title");
for (const expectedSocialLine of [
  "Meaning shifts. Frequencies move. Visual evidence makes the change legible.",
  "The method behind the words: sources, limits, transformations, citation, and rights.",
  "A growing research publication on how word meanings split, accumulate, and change—and what the evidence can actually support.",
  "In these printed-book frequency records, “forever” overtakes “for ever”—a shift between written forms, not a stable definition.",
  "Artificial has an earlier history in art and making, with distinct branches in simulation, distrust, bodily support, and modeled human processes.",
  "Hub travels from wheel centers into routes and networks while retaining the idea of a center and changing what gathers around it.",
  "Privacy extends beyond private life: institutions translate it into policies, controls, rights, and risks.",
  "Data is not simply given: collection, division, packaging, governance, and work shape what becomes usable.",
  "Depression is one spelling across loweredness, melancholy, weather, economic crisis, and clinical diagnosis—not one settled meaning.",
]) {
  check(socialSource.includes(expectedSocialLine), `Missing reviewed social supporting line: ${expectedSocialLine}`);
}
check(!/siteRoutes\[0\]|routeByPath|@\/lib\/site/.test(wordImageSource), "Unknown word image still falls back to the legacy Home route");
check(/dynamicParams\s*=\s*false/.test(wordImageSource), "Unknown word image params must be rejected before rendering");
check(/dynamicParams\s*=\s*false/.test(wordTwitterSource), "Twitter image route must use the same dynamic-param rejection");
check(/notFound\(\)/.test(wordImageSource), "Unknown word image must reject rather than render a Home fallback");
check(/canonicalWordRoutes/.test(wordImageSource), "Word image route must use canonical word routes");
check(/canonicalSocialPreview\("\/"\)/.test(rootImageSource), "Home image is not contract-derived");
check(/canonicalSocialPreview\("\/about"\)/.test(aboutImageSource), "About image is not contract-derived");
check(/canonicalSocialPreview\("\/words"\)/.test(wordsImageSource), "Words image is not contract-derived");
check(/route\.path === "\/"/.test(canonicalSource), "Canonical social image path must special-case only Home");
check(!/subject\.kind === "word-study"/.test(canonicalSource.match(/export function canonicalSocialImagePath[\s\S]*?\n}/)?.[0] ?? ""), "Non-word routes still share the Home social image URL");

const expectedOgUrls = canonicalPublicationRoutes.map(
  (route) => `${CANONICAL_ORIGIN}${expectedImagePath(route.path, "opengraph-image")}`,
);
const expectedTwitterUrls = canonicalPublicationRoutes.map(
  (route) => `${CANONICAL_ORIGIN}${expectedImagePath(route.path, "twitter-image")}`,
);
check(expectedOgUrls.length === 9 && duplicates(expectedOgUrls).length === 0, "Expected OG URL set must contain nine unique routes");
check(expectedTwitterUrls.length === 9 && duplicates(expectedTwitterUrls).length === 0, "Expected Twitter URL set must contain nine unique routes");

check(existsSync(buildRoot), "Current production build is required for the social preview audit");
let buildArtifactFresh = false;
if (existsSync(buildRoot)) {
  const auditedSourcePaths = [
    "src/lib/machine/canonical-publication-data.ts",
    "src/lib/machine/canonical-publication.ts",
    "src/lib/machine/social-preview.ts",
    "src/lib/og-image.tsx",
    "src/app/opengraph-image.tsx",
    "src/app/twitter-image.tsx",
    "src/app/about/opengraph-image.tsx",
    "src/app/about/twitter-image.tsx",
    "src/app/words/opengraph-image.tsx",
    "src/app/words/twitter-image.tsx",
    "src/app/words/[slug]/opengraph-image.tsx",
    "src/app/words/[slug]/twitter-image.tsx",
  ].map((relativePath) => path.join(repositoryRoot, relativePath));
  const newestAuditedSource = Math.max(...auditedSourcePaths.map((file) => statSync(file).mtimeMs));
  const htmlArtifacts = canonicalPublicationRoutes.map((route) =>
    path.join(buildRoot, routeHtmlArtifact(route.path)),
  );
  const existingHtmlArtifacts = htmlArtifacts.filter(existsSync);
  const oldestHtmlArtifact = existingHtmlArtifacts.length
    ? Math.min(...existingHtmlArtifacts.map((file) => statSync(file).mtimeMs))
    : 0;
  buildArtifactFresh = existingHtmlArtifacts.length === 9 && oldestHtmlArtifact >= newestAuditedSource;
  check(buildArtifactFresh, "Production HTML artifacts are missing or older than audited social source");

  for (const route of canonicalPublicationRoutes) {
    const artifact = path.join(buildRoot, routeHtmlArtifact(route.path));
    check(existsSync(artifact), `${route.path}: missing production HTML artifact`);
    if (!existsSync(artifact)) continue;

    const head = headFromHtml(readFileSync(artifact, "utf8"));
    const ogTitles = metaValues(head, "property", "og:title");
    const ogDescriptions = metaValues(head, "property", "og:description");
    const ogImages = metaValues(head, "property", "og:image");
    const ogImageTypes = metaValues(head, "property", "og:image:type");
    const ogImageWidths = metaValues(head, "property", "og:image:width");
    const ogImageHeights = metaValues(head, "property", "og:image:height");
    const ogImageAlts = metaValues(head, "property", "og:image:alt");
    const twitterCards = metaValues(head, "name", "twitter:card");
    const twitterTitles = metaValues(head, "name", "twitter:title");
    const twitterDescriptions = metaValues(head, "name", "twitter:description");
    const twitterImages = metaValues(head, "name", "twitter:image");
    const twitterImageAlts = metaValues(head, "name", "twitter:image:alt");
    const expectedTitle = expectedSocialTitle(route);
    const expectedAlt = expectedImageAlt(route);

    check(ogTitles.length === 1 && ogTitles[0] === expectedTitle, `${route.path}: OG title mismatch or duplication`);
    check(ogDescriptions.length === 1 && ogDescriptions[0] === route.machineDescription, `${route.path}: OG description mismatch or duplication`);
    check(ogImages.length === 1, `${route.path}: expected exactly one OG image`);
    check(isExpectedSocialImageUrl(ogImages[0] ?? "", expectedImagePath(route.path, "opengraph-image")), `${route.path}: OG image URL mismatch`);
    check(ogImageTypes.length === 1 && ogImageTypes[0] === "image/png", `${route.path}: OG image type mismatch or duplication`);
    check(ogImageWidths.length === 1 && ogImageWidths[0] === "1200", `${route.path}: OG image width mismatch or duplication`);
    check(ogImageHeights.length === 1 && ogImageHeights[0] === "630", `${route.path}: OG image height mismatch or duplication`);
    check(ogImageAlts.length === 1 && ogImageAlts[0] === expectedAlt, `${route.path}: OG image alt mismatch or duplication`);
    check(twitterCards.length === 1 && twitterCards[0] === "summary_large_image", `${route.path}: Twitter card mismatch or duplication`);
    check(twitterTitles.length === 1 && twitterTitles[0] === expectedTitle, `${route.path}: Twitter title mismatch or duplication`);
    check(twitterDescriptions.length === 1 && twitterDescriptions[0] === route.machineDescription, `${route.path}: Twitter description mismatch or duplication`);
    check(twitterImages.length === 1, `${route.path}: expected exactly one Twitter image`);
    check(isExpectedSocialImageUrl(twitterImages[0] ?? "", expectedImagePath(route.path, "twitter-image")), `${route.path}: Twitter image URL mismatch`);
    check(twitterImageAlts.length === 1 && twitterImageAlts[0] === expectedAlt, `${route.path}: Twitter image alt mismatch or duplication`);
  }
}

function collectFiles(root: string, extensions: Set<string>, output: string[] = []) {
  if (!existsSync(root)) return output;
  for (const entry of readdirSync(root)) {
    const absolutePath = path.join(root, entry);
    const stats = statSync(absolutePath);
    if (stats.isDirectory()) collectFiles(absolutePath, extensions, output);
    else if (extensions.has(path.extname(entry))) output.push(absolutePath);
  }
  return output;
}

const sourceFiles = collectFiles(path.join(repositoryRoot, "src"), new Set([".ts", ".tsx", ".js", ".jsx", ".mjs"]));
const sourceSet = new Set(sourceFiles);

function resolveLocalImport(importer: string, specifier: string) {
  const base = specifier.startsWith("@/")
    ? path.join(repositoryRoot, "src", specifier.slice(2))
    : specifier.startsWith(".")
      ? path.resolve(path.dirname(importer), specifier)
      : undefined;
  if (!base) return undefined;
  const candidates = [
    base,
    ...[".ts", ".tsx", ".js", ".jsx", ".mjs"].map((extension) => `${base}${extension}`),
    ...[".ts", ".tsx", ".js", ".jsx", ".mjs"].map((extension) => path.join(base, `index${extension}`)),
  ];
  return candidates.find((candidate) => sourceSet.has(candidate));
}

function runtimeImports(file: string) {
  const source = readFileSync(file, "utf8");
  const imports: string[] = [];
  const patterns = [
    /import\s+(?!type\b)[\s\S]*?\sfrom\s*["']([^"']+)["']\s*;?/g,
    /export\s+(?!type\b)[\s\S]*?\sfrom\s*["']([^"']+)["']\s*;?/g,
    /import\s*["']([^"']+)["']\s*;?/g,
    /import\(\s*["']([^"']+)["']\s*\)/g,
  ];
  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) imports.push(match[1]);
  }
  return [...new Set(imports.map((specifier) => resolveLocalImport(file, specifier)).filter(Boolean))] as string[];
}

const clientRoots = sourceFiles.filter((file) => /^\s*["']use client["']\s*;/.test(readFileSync(file, "utf8")));
const socialContractPath = path.join(repositoryRoot, "src", "lib", "machine", "social-preview.ts");
const imageRendererPath = path.join(repositoryRoot, "src", "lib", "og-image.tsx");
const canonicalContractPath = path.join(repositoryRoot, "src", "lib", "machine", "canonical-publication.ts");
const canonicalDataPath = path.join(repositoryRoot, "src", "lib", "machine", "canonical-publication-data.ts");
const visited = new Set<string>();
const queue = [...clientRoots];
while (queue.length) {
  const file = queue.shift()!;
  if (visited.has(file)) continue;
  visited.add(file);
  queue.push(...runtimeImports(file));
}
for (const protectedServerModule of [
  socialContractPath,
  imageRendererPath,
  canonicalContractPath,
  canonicalDataPath,
]) {
  check(!visited.has(protectedServerModule), `${path.relative(repositoryRoot, protectedServerModule)} is client reachable`);
}

const clientAssetFiles = collectFiles(path.join(repositoryRoot, ".next", "static"), new Set([".js"]));
for (const clientAssetFile of clientAssetFiles) {
  const source = readFileSync(clientAssetFile, "utf8");
  check(!/socialPreviewAccents|word-study social preview/.test(source), `Social-preview server marker leaked into ${path.relative(repositoryRoot, clientAssetFile)}`);
}

type RuntimeRouteRecord = {
  routePath: string;
  bodyHash: string;
  canonical: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  twitterCard: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
};

function runtimeRecord(routePath: string, html: string): RuntimeRouteRecord {
  const head = headFromHtml(html);
  return {
    routePath,
    bodyHash: hash(bodyFromHtml(html)),
    canonical: canonicalValues(head)[0] ?? "",
    ogTitle: metaValues(head, "property", "og:title")[0] ?? "",
    ogDescription: metaValues(head, "property", "og:description")[0] ?? "",
    ogImage: metaValues(head, "property", "og:image")[0] ?? "",
    twitterCard: metaValues(head, "name", "twitter:card")[0] ?? "",
    twitterTitle: metaValues(head, "name", "twitter:title")[0] ?? "",
    twitterDescription: metaValues(head, "name", "twitter:description")[0] ?? "",
    twitterImage: metaValues(head, "name", "twitter:image")[0] ?? "",
  };
}

function pngDimensions(bytes: Uint8Array) {
  const signature = [137, 80, 78, 71, 13, 10, 26, 10];
  if (!signature.every((value, index) => bytes[index] === value) || bytes.length < 24) return undefined;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  return { width: view.getUint32(16), height: view.getUint32(20) };
}

if (runtimeBaseUrl) {
  const userAgents = [
    "Mozilla/5.0 WordsOverTimeSocialAudit/1.0",
    "Twitterbot/1.0",
    "facebookexternalhit/1.1",
    "LinkedInBot/1.0",
    "Slackbot-LinkExpanding 1.0",
    "Discordbot/2.0",
    "WhatsApp/2.23",
  ];

  for (const route of canonicalPublicationRoutes) {
    const records: RuntimeRouteRecord[] = [];
    for (const userAgent of userAgents) {
      const response = await fetch(`${runtimeBaseUrl}${route.path}`, { headers: { "user-agent": userAgent } });
      check(response.status === 200, `${route.path}: ${userAgent} returned ${response.status}`);
      const html = await response.text();
      const head = headFromHtml(html);
      const expectedTitle = expectedSocialTitle(route);
      const expectedAlt = expectedImageAlt(route);
      const canonicals = canonicalValues(head);
      const ogTitles = metaValues(head, "property", "og:title");
      const ogDescriptions = metaValues(head, "property", "og:description");
      const ogImages = metaValues(head, "property", "og:image");
      const ogImageAlts = metaValues(head, "property", "og:image:alt");
      const twitterCards = metaValues(head, "name", "twitter:card");
      const twitterTitles = metaValues(head, "name", "twitter:title");
      const twitterDescriptions = metaValues(head, "name", "twitter:description");
      const twitterImages = metaValues(head, "name", "twitter:image");
      const twitterImageAlts = metaValues(head, "name", "twitter:image:alt");

      check(canonicals.length === 1 && canonicals[0] === route.canonicalUrl, `${route.path}: ${userAgent} canonical mismatch or duplication`);
      check(ogTitles.length === 1 && ogTitles[0] === expectedTitle, `${route.path}: ${userAgent} OG title mismatch or duplication`);
      check(ogDescriptions.length === 1 && ogDescriptions[0] === route.machineDescription, `${route.path}: ${userAgent} OG description mismatch or duplication`);
      check(ogImages.length === 1 && isExpectedSocialImageUrl(ogImages[0] ?? "", expectedImagePath(route.path, "opengraph-image")), `${route.path}: ${userAgent} OG image mismatch or duplication`);
      check(ogImageAlts.length === 1 && ogImageAlts[0] === expectedAlt, `${route.path}: ${userAgent} OG image alt mismatch or duplication`);
      check(twitterCards.length === 1 && twitterCards[0] === "summary_large_image", `${route.path}: ${userAgent} Twitter card mismatch or duplication`);
      check(twitterTitles.length === 1 && twitterTitles[0] === expectedTitle, `${route.path}: ${userAgent} Twitter title mismatch or duplication`);
      check(twitterDescriptions.length === 1 && twitterDescriptions[0] === route.machineDescription, `${route.path}: ${userAgent} Twitter description mismatch or duplication`);
      check(twitterImages.length === 1 && isExpectedSocialImageUrl(twitterImages[0] ?? "", expectedImagePath(route.path, "twitter-image")), `${route.path}: ${userAgent} Twitter image mismatch or duplication`);
      check(twitterImageAlts.length === 1 && twitterImageAlts[0] === expectedAlt, `${route.path}: ${userAgent} Twitter image alt mismatch or duplication`);
      records.push(runtimeRecord(route.path, html));
    }
    const baseline = JSON.stringify(records[0]);
    check(records.every((record) => JSON.stringify(record) === baseline), `${route.path}: social head/body varies by user agent`);
  }

  const routeImageHashes = new Set<string>();
  for (const route of canonicalPublicationRoutes) {
    const pairHashes: string[] = [];
    for (const kind of ["opengraph-image", "twitter-image"] as const) {
      const endpoint = expectedImagePath(route.path, kind);
      const response = await fetch(`${runtimeBaseUrl}${endpoint}`);
      const bytes = new Uint8Array(await response.arrayBuffer());
      const dimensions = pngDimensions(bytes);
      check(response.status === 200, `${endpoint}: returned ${response.status}`);
      check(response.headers.get("content-type")?.toLowerCase().startsWith("image/png"), `${endpoint}: content type is not image/png`);
      check(dimensions?.width === 1200 && dimensions.height === 630, `${endpoint}: expected 1200x630 PNG`);
      check(bytes.byteLength > 10_000, `${endpoint}: image payload is unexpectedly small`);
      pairHashes.push(hash(bytes));
    }
    check(pairHashes[0] === pairHashes[1], `${route.path}: OG and Twitter pixel outputs diverge`);
    routeImageHashes.add(pairHashes[0]);
  }
  check(routeImageHashes.size === 9, `Expected nine route-distinct social images, found ${routeImageHashes.size}`);

  for (const kind of ["opengraph-image", "twitter-image"] as const) {
    const invalidImage = await fetch(`${runtimeBaseUrl}/words/not-a-canonical-study/${kind}`, {
      redirect: "manual",
    });
    check(invalidImage.status === 404, `Unknown ${kind} must return 404, received ${invalidImage.status}`);
  }
}

console.log(`CANONICAL_SOCIAL_ROUTE_COUNT=${canonicalPublicationRoutes.length}`);
console.log(`OG_IMAGE_ROUTE_COUNT=${expectedOgUrls.length}`);
console.log(`TWITTER_IMAGE_ROUTE_COUNT=${expectedTwitterUrls.length}`);
console.log(`OG_IMAGE_UNIQUE_URL_COUNT=${new Set(expectedOgUrls).size}`);
console.log(`TWITTER_IMAGE_UNIQUE_URL_COUNT=${new Set(expectedTwitterUrls).size}`);
console.log("SOCIAL_IMAGE_WIDTH=1200");
console.log("SOCIAL_IMAGE_HEIGHT=630");
console.log(`SOCIAL_PREVIEW_CLIENT_REACHABLE=${visited.has(socialContractPath)}`);
console.log(`SOCIAL_BUILD_ARTIFACT_FRESH=${buildArtifactFresh}`);
console.log(`SOCIAL_RUNTIME_HTTP_AUDIT=${runtimeBaseUrl ? "RUN" : "SKIPPED_NO_BASE_URL"}`);

if (failures.length) {
  console.error(`SOCIAL_PREVIEW_AUDIT=FAIL (${failures.length} invariant${failures.length === 1 ? "" : "s"})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`SOCIAL_PREVIEW_AUDIT=${runtimeBaseUrl ? "PASS" : "PASS_SOURCE_BUILD"}`);
