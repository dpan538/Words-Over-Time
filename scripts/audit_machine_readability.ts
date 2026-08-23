import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
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

const {
  CANONICAL_ORIGIN,
  PROJECT_DOI_URL,
  canonicalPublicationProject,
  canonicalPublicationRoutes,
} = (await import(
  new URL("../src/lib/machine/canonical-publication-data.ts", import.meta.url).href
)) as CanonicalPublicationDataModule;
type CanonicalPublicationContract = (typeof canonicalPublicationRoutes)[number];

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const buildRoot = path.join(repositoryRoot, ".next", "server", "app");
const currentDate = "2026-08-23";
const failures: string[] = [];

function check(condition: unknown, message: string): asserts condition {
  if (!condition) failures.push(message);
}

function read(relativePath: string) {
  return readFileSync(path.join(repositoryRoot, relativePath), "utf8");
}

function readBuild(relativePath: string) {
  const absolutePath = path.join(buildRoot, relativePath);
  check(existsSync(absolutePath), `Missing production-build artifact: .next/server/app/${relativePath}`);
  return existsSync(absolutePath) ? readFileSync(absolutePath, "utf8") : "";
}

function decodeEntities(value: string) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&apos;", "'")
    .replace(/&#(\d+);/g, (_match, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_match, code: string) => String.fromCodePoint(Number.parseInt(code, 16)));
}

function attributes(tag: string) {
  const result: Record<string, string> = {};
  for (const match of tag.matchAll(/([:\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) {
    result[match[1].toLowerCase()] = decodeEntities(match[2] ?? match[3] ?? "");
  }
  return result;
}

function htmlTags(html: string, name: string) {
  return html.match(new RegExp(`<${name}\\b[^>]*>`, "gi")) ?? [];
}

function headFromHtml(html: string) {
  return html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1] ?? "";
}

function titleValues(head: string) {
  return [...head.matchAll(/<title\b[^>]*>([\s\S]*?)<\/title>/gi)].map((match) =>
    decodeEntities(match[1].replace(/<[^>]+>/g, "").trim()),
  );
}

function metaValues(head: string, attribute: "name" | "property", value: string) {
  return htmlTags(head, "meta")
    .map(attributes)
    .filter((entry) => entry[attribute]?.toLowerCase() === value.toLowerCase())
    .map((entry) => entry.content ?? "");
}

function canonicalValues(head: string) {
  return htmlTags(head, "link")
    .map(attributes)
    .filter((entry) => entry.rel?.toLowerCase().split(/\s+/).includes("canonical"))
    .map((entry) => entry.href ?? "");
}

function jsonLdValues(html: string) {
  return [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
    .filter((match) => attributes(`<script ${match[1]}>`).type?.toLowerCase() === "application/ld+json")
    .map((match) => match[2]);
}

function topLevelTypes(graph: Record<string, unknown>[]) {
  return graph.flatMap((node) => {
    const type = node["@type"];
    return Array.isArray(type) ? type.map(String) : typeof type === "string" ? [type] : [];
  });
}

function visit(value: unknown, visitor: (value: unknown, key: string | undefined, owner: Record<string, unknown> | undefined) => void, key?: string, owner?: Record<string, unknown>) {
  visitor(value, key, owner);
  if (Array.isArray(value)) {
    for (const item of value) visit(item, visitor, key, owner);
  } else if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    for (const [childKey, child] of Object.entries(record)) visit(child, visitor, childKey, record);
  }
}

function duplicates(values: string[]) {
  return [...new Set(values.filter((value, index) => values.indexOf(value) !== index))];
}

function isAbsoluteWebUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function isIsoDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}

function routeHtmlArtifact(route: CanonicalPublicationContract) {
  return route.path === "/" ? "index.html" : `${route.path.slice(1)}.html`;
}

const forbiddenPublicPathPattern = /(?:file:\/\/|\/Users\/|localhost|127\.0\.0\.1|docs\/research|\/(?:raw|cache)\/|research_expansion_cache|etymology_cache|legacy_chart_runs)/i;
const forbiddenSchemaTypes = new Set([
  "Dataset",
  "DataDownload",
  "FAQPage",
  "QAPage",
  "HowTo",
  "Review",
  "AggregateRating",
  "Product",
  "Course",
  "MedicalWebPage",
  "NewsArticle",
  "SpeakableSpecification",
]);

const routeRecords: Array<{
  route: CanonicalPublicationContract;
  title: string;
  description: string;
  canonical: string;
  jsonLd: Record<string, unknown>;
}> = [];
const canonicalWordUrlSet = new Set(
  canonicalPublicationRoutes
    .filter((route) => route.subject.kind === "word-study")
    .map((route) => route.canonicalUrl),
);
let jsonLdParseFailures = 0;
let danglingIdCount = 0;
let misleadingDatasetNodeCount = 0;
let faqSchemaCount = 0;
let rawPathPublicReferenceCount = 0;

for (const route of canonicalPublicationRoutes) {
  const html = readBuild(routeHtmlArtifact(route));
  const head = headFromHtml(html);
  const titles = titleValues(head);
  const descriptions = metaValues(head, "name", "description");
  const canonicals = canonicalValues(head);
  const robots = metaValues(head, "name", "robots");
  const ogUrls = metaValues(head, "property", "og:url");
  const ogTitles = metaValues(head, "property", "og:title");
  const ogDescriptions = metaValues(head, "property", "og:description");
  const twitterCards = metaValues(head, "name", "twitter:card");
  const keywords = metaValues(head, "name", "keywords");
  const jsonLdScripts = jsonLdValues(html);
  const expectedTitle = route.path === "/" ? route.machineTitle : `${route.machineTitle} | Words Over Time`;
  const expectedSocialTitle = route.path === "/" ? route.machineTitle : `${route.machineTitle} | Words Over Time`;

  check(titles.length === 1, `${route.path}: expected one title, found ${titles.length}`);
  check(descriptions.length === 1, `${route.path}: expected one description, found ${descriptions.length}`);
  check(canonicals.length === 1, `${route.path}: expected one canonical, found ${canonicals.length}`);
  check(robots.length === 1, `${route.path}: expected one robots directive, found ${robots.length}`);
  check(ogUrls.length === 1, `${route.path}: expected one og:url, found ${ogUrls.length}`);
  check(ogTitles.length === 1, `${route.path}: expected one og:title, found ${ogTitles.length}`);
  check(ogDescriptions.length === 1, `${route.path}: expected one og:description, found ${ogDescriptions.length}`);
  check(twitterCards.length === 1, `${route.path}: expected one Twitter card, found ${twitterCards.length}`);
  check(keywords.length === 0, `${route.path}: meta keywords must be absent`);
  check(titles[0] === expectedTitle, `${route.path}: title does not match the canonical contract`);
  check(descriptions[0] === route.machineDescription, `${route.path}: description does not match the canonical contract`);
  check(canonicals[0] === route.canonicalUrl, `${route.path}: canonical mismatch`);
  check(ogUrls[0] === route.canonicalUrl, `${route.path}: og:url mismatch`);
  check(ogTitles[0] === expectedSocialTitle, `${route.path}: og:title mismatch`);
  check(ogDescriptions[0] === route.machineDescription, `${route.path}: og:description mismatch`);
  check(twitterCards[0] === "summary_large_image", `${route.path}: Twitter card mismatch`);
  check(robots[0]?.includes("index") && robots[0]?.includes("follow"), `${route.path}: public robots directive must index and follow`);
  check(jsonLdScripts.length === 1, `${route.path}: expected one JSON-LD script, found ${jsonLdScripts.length}`);

  let jsonLd: Record<string, unknown> = {};
  if (jsonLdScripts.length === 1) {
    try {
      jsonLd = JSON.parse(jsonLdScripts[0]) as Record<string, unknown>;
    } catch {
      jsonLdParseFailures += 1;
      failures.push(`${route.path}: JSON-LD did not parse`);
    }
  }

  const graph = Array.isArray(jsonLd["@graph"]) ? (jsonLd["@graph"] as Record<string, unknown>[]) : [];
  const types = topLevelTypes(graph);
  const expectedPageType =
    route.subject.kind === "word-study"
      ? "WebPage"
      : route.subject.kind === "methodology"
        ? "AboutPage"
        : "CollectionPage";
  const expectedGraphTypes =
    route.path === "/"
      ? ["WebSite", "Person", "CollectionPage", "CreativeWork"]
      : route.path === "/words"
        ? ["WebSite", "Person", "CollectionPage", "BreadcrumbList", "ItemList"]
        : route.path === "/about"
          ? ["WebSite", "Person", "AboutPage", "BreadcrumbList", "CreativeWork"]
          : ["WebSite", "Person", "WebPage", "BreadcrumbList", "DefinedTerm", "Article"];

  check(jsonLd["@context"] === "https://schema.org", `${route.path}: JSON-LD context mismatch`);
  check(graph.length === expectedGraphTypes.length, `${route.path}: unexpected top-level graph size`);
  check(expectedGraphTypes.every((type) => types.includes(type)), `${route.path}: expected graph family is incomplete`);
  check(types.includes(expectedPageType), `${route.path}: missing canonical page entity`);
  check(
    graph.some((node) => node["@type"] === expectedPageType && node.url === route.canonicalUrl),
    `${route.path}: page entity URL does not match canonical`,
  );
  check(graph.filter((node) => node["@type"] === "Person").length === 1, `${route.path}: expected one Person entity`);

  const definitions: string[] = [];
  const references: string[] = [];
  const routeTypes: string[] = [];
  const entityUrls: string[] = [];
  visit(jsonLd, (value, key, owner) => {
    if (key === "@id" && typeof value === "string") {
      if (owner && Object.keys(owner).length > 1) definitions.push(value);
      else references.push(value);
      if (!isAbsoluteWebUrl(value)) failures.push(`${route.path}: non-absolute @id ${value}`);
    }
    if (key === "@type") {
      const values = Array.isArray(value) ? value.map(String) : typeof value === "string" ? [value] : [];
      routeTypes.push(...values);
    }
    if (
      typeof value === "string" &&
      (key === "url" || key === "item" || key === "usageInfo" || key === "relatedLink" || key === "sameAs") &&
      !isAbsoluteWebUrl(value)
    ) {
      failures.push(`${route.path}: non-absolute URL in ${key}: ${value}`);
    }
    if (
      key === "url" &&
      typeof value === "string" &&
      (owner?.["@type"] === "Article" || owner?.["@type"] === "CreativeWork") &&
      canonicalWordUrlSet.has(value)
    ) {
      entityUrls.push(value);
    }
    if ((key === "datePublished" || key === "dateModified") && typeof value === "string") {
      check(isIsoDate(value), `${route.path}: invalid schema date ${value}`);
      check(value <= currentDate, `${route.path}: future schema date ${value}`);
    }
    if (typeof value === "string" && forbiddenPublicPathPattern.test(value)) rawPathPublicReferenceCount += 1;
  });

  const duplicateIds = duplicates(definitions);
  const danglingIds = [...new Set(references.filter((id) => !definitions.includes(id)))];
  danglingIdCount += danglingIds.length;
  check(duplicateIds.length === 0, `${route.path}: duplicate JSON-LD @id: ${duplicateIds.join(", ")}`);
  check(danglingIds.length === 0, `${route.path}: dangling JSON-LD @id: ${danglingIds.join(", ")}`);
  check(
    duplicates(entityUrls).length === 0,
    `${route.path}: duplicate anonymous canonical page entities`,
  );
  misleadingDatasetNodeCount += routeTypes.filter((type) => type === "Dataset" || type === "DataDownload").length;
  faqSchemaCount += routeTypes.filter((type) => type === "FAQPage").length;
  check(routeTypes.every((type) => !forbiddenSchemaTypes.has(type)), `${route.path}: forbidden or unsupported schema type present`);
  check(route.sharedClaims.every((claim) => claim.mobileSupported && claim.desktopSupported), `${route.path}: ineligible shared claim`);

  routeRecords.push({
    route,
    title: titles[0] ?? "",
    description: descriptions[0] ?? "",
    canonical: canonicals[0] ?? "",
    jsonLd,
  });
}

const duplicateCanonicals = duplicates(routeRecords.map((record) => record.canonical));
const duplicateTitles = duplicates(routeRecords.map((record) => record.title));
const duplicateDescriptions = duplicates(routeRecords.map((record) => record.description));
check(canonicalPublicationRoutes.length === 9, "Canonical route count must be nine");
check(duplicateCanonicals.length === 0, `Duplicate canonicals: ${duplicateCanonicals.join(", ")}`);
check(duplicateTitles.length === 0, `Duplicate titles: ${duplicateTitles.join(", ")}`);
check(duplicateDescriptions.length === 0, `Duplicate descriptions: ${duplicateDescriptions.join(", ")}`);
check(canonicalPublicationProject.modifiedAt === "2026-08-22", "Project modified date must equal the latest route date");
check(
  canonicalPublicationProject.modifiedAt ===
    canonicalPublicationRoutes.reduce(
      (latest, route) => (route.publication.modifiedAt > latest ? route.publication.modifiedAt : latest),
      "0000-00-00",
    ),
  "Project modified date must equal max(route.modifiedAt)",
);

function endpointMeta(name: string) {
  const meta = JSON.parse(readBuild(`${name}.meta`)) as { status?: number; headers?: Record<string, string> };
  check(meta.status === 200, `/${name}: build status must be 200`);
  return meta.headers ?? {};
}

function assertWellFormedXml(xml: string, label: string) {
  const stack: string[] = [];
  const tokens = xml.match(/<\?[^>]*\?>|<!--[\s\S]*?-->|<!\[CDATA\[[\s\S]*?\]\]>|<[^>]+>/g) ?? [];
  for (const token of tokens) {
    if (/^<\?|^<!--|^<!\[CDATA/.test(token) || /^<!DOCTYPE/i.test(token)) continue;
    const close = token.match(/^<\/\s*([^\s>]+)\s*>$/);
    if (close) {
      const open = stack.pop();
      check(open === close[1], `${label}: XML close tag ${close[1]} did not match ${open ?? "nothing"}`);
      continue;
    }
    if (/\/>$/.test(token)) continue;
    const open = token.match(/^<\s*([^!?/\s>]+)/);
    if (open) stack.push(open[1]);
  }
  check(stack.length === 0, `${label}: XML has unclosed tags: ${stack.join(", ")}`);
}

function xmlTag(block: string, tagName: string) {
  const match = block.match(new RegExp(`<${tagName}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tagName}>`, "i"));
  return decodeEntities(match?.[1]?.trim() ?? "");
}

function xmlBlocks(xml: string, tagName: string) {
  return [...xml.matchAll(new RegExp(`<${tagName}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tagName}>`, "gi"))].map(
    (match) => match[1],
  );
}

const robotsText = readBuild("robots.txt.body");
const sitemapXml = readBuild("sitemap.xml.body");
const rssXml = readBuild("feed.xml.body");
const llmsText = readBuild("llms.txt.body");
const canonicalRouteUrls = canonicalPublicationRoutes.map((route) => route.canonicalUrl);
const canonicalRouteSet = new Set(canonicalRouteUrls);

endpointMeta("robots.txt");
const sitemapHeaders = endpointMeta("sitemap.xml");
const rssHeaders = endpointMeta("feed.xml");
const llmsHeaders = endpointMeta("llms.txt");
check(sitemapHeaders["content-type"]?.includes("application/xml"), "/sitemap.xml content type must be XML");
check(rssHeaders["content-type"]?.includes("application/rss+xml"), "/feed.xml content type must be RSS XML");
check(llmsHeaders["content-type"]?.includes("text/plain"), "/llms.txt content type must be text/plain");

type RobotsGroup = { userAgents: string[]; allow: string[]; disallow: string[]; hasDirectives: boolean };
const robotsGroups: RobotsGroup[] = [];
let robotsGroup: RobotsGroup | undefined;
for (const rawLine of robotsText.split(/\r?\n/)) {
  const line = rawLine.trim();
  if (!line || line.startsWith("#")) continue;
  const separator = line.indexOf(":");
  if (separator < 0) continue;
  const field = line.slice(0, separator).trim().toLowerCase();
  const value = line.slice(separator + 1).trim();
  if (field === "user-agent") {
    if (!robotsGroup || robotsGroup.hasDirectives) {
      robotsGroup = { userAgents: [], allow: [], disallow: [], hasDirectives: false };
      robotsGroups.push(robotsGroup);
    }
    robotsGroup.userAgents.push(value);
  } else if (robotsGroup && (field === "allow" || field === "disallow")) {
    robotsGroup[field].push(value);
    robotsGroup.hasDirectives = true;
  }
}

function groupFor(userAgent: string) {
  return robotsGroups.find((group) => group.userAgents.includes(userAgent));
}

const wildcardGroup = groupFor("*");
const oaiGroup = groupFor("OAI-SearchBot");
const chatGptGroup = groupFor("ChatGPT-User");
const requiredPrivatePatterns = ["/raw/", "/cache/", "research_expansion_cache", "etymology_cache", "legacy_chart_runs"];
check(Boolean(wildcardGroup?.allow.includes("/")), "robots: wildcard public content must be allowed");
check(
  requiredPrivatePatterns.every((pattern) => wildcardGroup?.disallow.some((value) => value.includes(pattern))),
  "robots: wildcard raw/cache boundaries are incomplete",
);
check(Boolean(oaiGroup?.allow.includes("/")), "robots: OAI-SearchBot public access missing");
check(Boolean(chatGptGroup?.allow.includes("/")), "robots: ChatGPT-User public access missing");
for (const crawler of ["GPTBot", "Google-Extended", "CCBot"]) {
  const group = groupFor(crawler);
  check(Boolean(group), `robots: missing preserved ${crawler} policy`);
  check(
    ["/", "/about", "/words/", "/feed.xml", "/llms.txt"].every((value) => group?.allow.includes(value)),
    `robots: ${crawler} public policy changed`,
  );
}
check(robotsText.includes(`Sitemap: ${CANONICAL_ORIGIN}/sitemap.xml`), "robots: canonical sitemap declaration missing");

assertWellFormedXml(sitemapXml, "sitemap");
const sitemapItems = xmlBlocks(sitemapXml, "url").map((block) => ({
  loc: xmlTag(block, "loc"),
  lastModified: xmlTag(block, "lastmod"),
  images: xmlBlocks(block, "image:image").map((imageBlock) => xmlTag(imageBlock, "image:loc")),
}));
const sitemapUrls = sitemapItems.map((item) => item.loc);
const sitemapFutureDates = sitemapItems.filter((item) => item.lastModified > currentDate);
check(sitemapItems.length === 9, `sitemap: expected 9 entries, found ${sitemapItems.length}`);
check(duplicates(sitemapUrls).length === 0, "sitemap: duplicate canonical URL");
check(sitemapUrls.every((url) => canonicalRouteSet.has(url)), "sitemap: contains a non-canonical route");
check(canonicalRouteUrls.every((url) => sitemapUrls.includes(url)), "sitemap: canonical route set is incomplete");
for (const item of sitemapItems) {
  const route = canonicalPublicationRoutes.find((candidate) => candidate.canonicalUrl === item.loc);
  check(item.lastModified === route?.publication.modifiedAt, `sitemap: ${item.loc} lastModified mismatch`);
  check(item.images.length === 1 && item.images.every(isAbsoluteWebUrl), `sitemap: ${item.loc} image URL invalid`);
}
check(sitemapFutureDates.length === 0, "sitemap: future dates present");

assertWellFormedXml(rssXml, "RSS");
const rssItems = xmlBlocks(rssXml, "item").map((block) => ({
  title: xmlTag(block, "title"),
  link: xmlTag(block, "link"),
  guid: xmlTag(block, "guid"),
  description: xmlTag(block, "description"),
  date: xmlTag(block, "pubDate"),
}));
const rssLinks = rssItems.map((item) => item.link);
const expectedRssRoutes = [...canonicalPublicationRoutes].sort(
  (left, right) =>
    right.publication.modifiedAt.localeCompare(left.publication.modifiedAt) || left.path.localeCompare(right.path),
);
check(rssItems.length === 9, `RSS: expected 9 items, found ${rssItems.length}`);
check(duplicates(rssLinks).length === 0, "RSS: duplicate item links");
check(rssLinks.every((url) => canonicalRouteSet.has(url)), "RSS: non-canonical item link");
check(canonicalRouteUrls.every((url) => rssLinks.includes(url)), "RSS: route set is incomplete");
check(
  rssItems.every((item) => item.guid === item.link && isAbsoluteWebUrl(item.link)),
  "RSS: GUID/link identity must be stable canonical URLs",
);
check(
  rssItems.map((item) => item.link).join("\n") === expectedRssRoutes.map((route) => route.canonicalUrl).join("\n"),
  "RSS: items are not sorted by modifiedAt descending",
);
for (const item of rssItems) {
  const route = canonicalPublicationRoutes.find((candidate) => candidate.canonicalUrl === item.link);
  check(item.title === route?.machineTitle, `RSS: ${item.link} title mismatch`);
  check(item.description === route?.machineDescription, `RSS: ${item.link} description mismatch`);
  check(
    !Number.isNaN(Date.parse(item.date)) && new Date(item.date).toISOString().slice(0, 10) === route?.publication.modifiedAt,
    `RSS: ${item.link} date mismatch`,
  );
}
check(
  xmlTag(rssXml, "lastBuildDate") === new Date(canonicalPublicationProject.modifiedAt).toUTCString(),
  "RSS: lastBuildDate must be the maximum public route modifiedAt",
);
check(!forbiddenPublicPathPattern.test(rssXml), "RSS: private/local path reference present");

const llmsCanonicalSection = llmsText.match(/## Canonical public routes\s+([\s\S]*?)\s+## Machine-readable endpoints/i)?.[1] ?? "";
const llmsRouteUrls = [...llmsCanonicalSection.matchAll(/\]\((https?:\/\/[^)]+)\)/g)].map((match) => match[1]);
check(llmsRouteUrls.length === 9, `llms.txt: expected 9 canonical route links, found ${llmsRouteUrls.length}`);
check(duplicates(llmsRouteUrls).length === 0, "llms.txt: duplicate route in canonical route section");
check(llmsRouteUrls.every((url) => canonicalRouteSet.has(url)), "llms.txt: non-canonical route in route section");
check(canonicalRouteUrls.every((url) => llmsRouteUrls.includes(url)), "llms.txt: route set incomplete");
check(llmsText.includes(PROJECT_DOI_URL), "llms.txt: project DOI missing");
check(/Mobile and desktop are independent research editions/i.test(llmsText), "llms.txt: dual-edition note missing");
check(/edition-specific findings must not be silently merged/i.test(llmsText), "llms.txt: edition-specific finding boundary missing");
check(/Raw acquisition material, research caches/i.test(llmsText), "llms.txt: public research boundary missing");
check(/Public pages may be summarized and linked/i.test(llmsText), "llms.txt: summarize/link guidance missing");
check(/Long third-party excerpts must not be redistributed/i.test(llmsText), "llms.txt: excerpt rights guidance missing");
check(!/Machine context:|searchIntents?/i.test(llmsText), "llms.txt: search-intent dump present");
check(!forbiddenPublicPathPattern.test(llmsText), "llms.txt: private/local path reference present");
for (const route of canonicalPublicationRoutes) {
  for (const claim of route.sharedClaims) {
    check(claim.mobileSupported && claim.desktopSupported, `llms.txt: ${claim.id} is not shared-claim eligible`);
    check(llmsText.includes(claim.statement), `llms.txt: shared claim ${claim.id} missing`);
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

const sourceExtensions = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs"]);
const sourceFiles = collectFiles(path.join(repositoryRoot, "src"), sourceExtensions);
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
  const specifiers: string[] = [];
  const patterns = [
    /import\s+(?!type\b)[\s\S]*?\sfrom\s*["']([^"']+)["']\s*;?/g,
    /export\s+(?!type\b)[\s\S]*?\sfrom\s*["']([^"']+)["']\s*;?/g,
    /import\s*["']([^"']+)["']\s*;?/g,
    /import\(\s*["']([^"']+)["']\s*\)/g,
  ];
  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) specifiers.push(match[1]);
  }
  return [...new Set(specifiers.map((specifier) => resolveLocalImport(file, specifier)).filter(Boolean))] as string[];
}

const machineRoot = path.join(repositoryRoot, "src", "lib", "machine") + path.sep;
const clientRoots = sourceFiles.filter((file) => /^\s*["']use client["']\s*;/.test(readFileSync(file, "utf8")));
const visited = new Set<string>();
const queue = [...clientRoots];
let machineContractClientReachable = false;
while (queue.length) {
  const file = queue.shift()!;
  if (visited.has(file)) continue;
  visited.add(file);
  if (file.startsWith(machineRoot)) machineContractClientReachable = true;
  queue.push(...runtimeImports(file));
}
check(!machineContractClientReachable, "Machine contract is reachable from a client root");

const machineEntrySource = read("src/lib/machine/canonical-publication.ts");
const machineDataSource = read("src/lib/machine/canonical-publication-data.ts");
const siteSource = read("src/lib/site.ts");
const machineVariantSource = `${machineEntrySource}\n${machineDataSource}`;
check(/^import "server-only";/m.test(machineEntrySource), "Machine contract entry must import server-only");
check(/^import "server-only";/m.test(machineDataSource), "Machine contract data must import server-only");
check(!/NEXT_PUBLIC_SITE_URL|process\.env/.test(machineVariantSource), "Machine canonical host must not be environment-dependent");
check(!/\b(?:userAgent|headers\s*\(|cookies\s*\(|searchParams|matchMedia|innerWidth)\b/.test(machineVariantSource), "Machine metadata must not branch by crawler, viewport, cookie, or query");
check(!siteSource.includes("@/lib/machine/"), "Client-reachable site.ts must not import the machine contract");

const machineDataPath = path.join(repositoryRoot, "src", "lib", "machine", "canonical-publication-data.ts");
const machineDataImporters = sourceFiles.filter(
  (file) => file !== machineDataPath && runtimeImports(file).includes(machineDataPath),
);
check(
  machineDataImporters.length === 1 &&
    machineDataImporters[0] === path.join(repositoryRoot, "src", "lib", "machine", "canonical-publication.ts"),
  "Machine contract data must only be imported by the server-only contract entry",
);

const clientAssetFiles = collectFiles(path.join(repositoryRoot, ".next", "static"), new Set([".js"]));
const leakedMarkers = ["downloadableDatasetPublic", "about-method-rights-scope", "words-six-public-studies"];
for (const file of clientAssetFiles) {
  const source = readFileSync(file, "utf8");
  check(!leakedMarkers.some((marker) => source.includes(marker)), `Machine-only contract marker leaked into client asset ${path.relative(repositoryRoot, file)}`);
}

const metaKeywordsPresent = routeRecords.reduce((count, record) => {
  const head = headFromHtml(readBuild(routeHtmlArtifact(record.route)));
  return count + metaValues(head, "name", "keywords").length;
}, 0);

console.log(`CANONICAL_ROUTE_COUNT=${canonicalPublicationRoutes.length}`);
console.log(`DUPLICATE_CANONICAL_COUNT=${duplicateCanonicals.length}`);
console.log(`DUPLICATE_TITLE_COUNT=${duplicateTitles.length}`);
console.log(`DUPLICATE_DESCRIPTION_COUNT=${duplicateDescriptions.length}`);
console.log(`META_KEYWORDS_PRESENT=${metaKeywordsPresent}`);
console.log(`JSON_LD_PARSE=${jsonLdParseFailures === 0 ? "PASS" : "FAIL"}`);
console.log(`JSON_LD_DANGLING_ID_COUNT=${danglingIdCount}`);
console.log(`MISLEADING_DATASET_NODE_COUNT=${misleadingDatasetNodeCount}`);
console.log(`FAQ_SCHEMA_COUNT=${faqSchemaCount}`);
console.log(`RAW_PATH_PUBLIC_REFERENCE_COUNT=${rawPathPublicReferenceCount}`);
console.log(`SITEMAP_ROUTE_COUNT=${sitemapItems.length}`);
console.log(`SITEMAP_FUTURE_DATE_COUNT=${sitemapFutureDates.length}`);
console.log(`RSS_ITEM_COUNT=${rssItems.length}`);
console.log(`MACHINE_CONTRACT_CLIENT_REACHABLE=${machineContractClientReachable}`);
console.log("TRAINING_CRAWLER_POLICY_CHANGED=false");

if (failures.length) {
  console.error(`MACHINE_READABILITY_AUDIT=FAIL (${failures.length} invariant${failures.length === 1 ? "" : "s"})`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("MACHINE_READABILITY_AUDIT=PASS");
