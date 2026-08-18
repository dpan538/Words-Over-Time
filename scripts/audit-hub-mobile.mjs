import { readFile } from "node:fs/promises";
import path from "node:path";

const supplied = process.argv.slice(2);
const defaultComponents = [
  "src/components/hub/mobile/MobileHubStudy.tsx",
  "src/components/hub/mobile/HubAtmosphere.tsx",
  "src/components/hub/mobile/HubChromaticFields.tsx",
  "src/components/hub/mobile/HubLinePlot.tsx",
  "src/components/hub/mobile/HubTrendExplorer.tsx",
  "src/components/hub/mobile/HubEvidenceRail.tsx",
  "src/components/hub/mobile/HubVisibilityChart.tsx",
  "src/components/hub/mobile/HubPersistenceScatter.tsx",
  "src/components/hub/mobile/HubPhraseExplorer.tsx",
];
const defaultCss = "src/components/hub/mobile/mobile-hub.module.css";
const files = supplied.length > 0 ? supplied : [...defaultComponents, defaultCss];
const absoluteFiles = files.map((file) => path.resolve(process.cwd(), file));
const records = await Promise.all(absoluteFiles.map(async (file) => ({ file, text: await readFile(file, "utf8") })));
const componentText = records.filter(({ file }) => /\.(tsx|ts|jsx|js)$/.test(file)).map(({ text }) => text).join("\n");
const cssText = records.filter(({ file }) => /\.css$/.test(file)).map(({ text }) => text).join("\n");
const joined = records.map(({ text }) => text).join("\n");
const atmosphereText = records.find(({ file }) => file.endsWith("HubAtmosphere.tsx"))?.text ?? "";
const chromaticText = records.find(({ file }) => file.endsWith("HubChromaticFields.tsx"))?.text ?? "";
const evidenceText = records.find(({ file }) => file.endsWith("HubEvidenceRail.tsx"))?.text ?? "";
const semanticText = chromaticText.split("export function OrganicSemanticField")[1] ?? "";

const failures = [];
const forbid = (label, pattern, text = joined) => {
  if (pattern.test(text)) failures.push(`${label}: ${pattern}`);
};
const requirePattern = (label, pattern, text = joined) => {
  if (!pattern.test(text)) failures.push(`missing ${label}: ${pattern}`);
};

forbid("page-global field system", /pageFields/);
forbid("independent semantic blob", /semanticBlob/);
forbid("stretched SVG", /preserveAspectRatio=["']none["']/);
forbid("runtime randomness", /Math\.random\s*\(/);
forbid("forbidden fixed section height", /(?:72|111|116|126)svh/);
forbid("tiny 7px-equivalent label", /0\.4[0-9]rem|\b7px\b/, cssText);
forbid("page percentage field placement", /top:\s*(?:2|18|35|51|67)%/, cssText);
forbid("hard-coded legacy scatter domain", /-0\.03|0\.038/, componentText);
forbid("oversized CSS blur", /blur\((?:6[0-9]|[7-9][0-9]|\d{3,})px\)/, cssText);
forbid("semantic ellipse silhouette", /<ellipse\b/, semanticText);
forbid("semantic displacement silhouette", /feDisplacementMap/, semanticText);
forbid("semantic outline stroke", /\bstroke(?:Width|Opacity)?=/, semanticText);
forbid("atmosphere displacement contour", /feDisplacementMap/, atmosphereText);
forbid("ambient displacement contour", /feDisplacementMap/, chromaticText);
forbid("over-tight hero wordmark spacing", /\.subject\s+h1[\s\S]*?letter-spacing:\s*-(?:0\.0(?:2[6-9]|[3-9]\d)|0\.[1-9])em/, cssText);
forbid("scatter chart hit targets", /scatterHitTarget/, joined);
forbid("legacy section-local ambient component", /\bAmbientField\b/, componentText);
forbid("legacy hero atmosphere", /HubHeroAtmosphere/, componentText);
forbid("animated blur/filter parameter", /animate=\{\{[^}]*?(?:stdDeviation|baseFrequency|filter)/, atmosphereText);

requirePattern("connected organic field marker", /data-hub-organic-field/, componentText);
requirePattern("single fixed viewport atmosphere", /data-hub-atmosphere/, atmosphereText);
requirePattern("single semantic Bézier silhouette", /SEMANTIC_BODY_PATH/, chromaticText);
requirePattern("Motion React imports", /from\s+["']motion\/react["']/, atmosphereText);
requirePattern("MotionConfig reduced-motion policy", /<MotionConfig\s+reducedMotion=["']user["']/, atmosphereText);
requirePattern("viewport scene observer", /useInView\(/, atmosphereText);
requirePattern("deterministic atmosphere forms", /CLOUD_FORMS/, atmosphereText);
requirePattern("deterministic SVG turbulence", /feTurbulence/, atmosphereText);
requirePattern("fixed atmosphere CSS", /\.atmosphereViewport\s*\{[\s\S]*?position:\s*fixed[\s\S]*?inset:\s*0/, cssText);
requirePattern("Safari safe-area fallback", /html:has\(\[data-hub-mobile-root\]\)/, cssText);
requirePattern("linked card diffusion", /LinkedCardPulse/, componentText);
for (const scene of ["hero", "semantic", "trend", "evidence", "visibility", "scatter", "phrase", "closing"]) {
  requirePattern(`${scene} atmosphere scene registration`, new RegExp(`useHubAtmosphereScene\\(["']${scene}["']\\)`), componentText);
}
requirePattern("shared line-chart y axis unit", /OCCURRENCES PER MILLION/, componentText);
requirePattern("visibility common percentage scale", /\[0, 25, 50, 75, 100\]/, componentText);
requirePattern("dynamic scatter min", /Math\.min\(\.\.\.analysis\.phrases/, componentText);
requirePattern("dynamic scatter max", /Math\.max\(\.\.\.analysis\.phrases/, componentText);
requirePattern("scatter zero line", /scatterZero/, componentText);
requirePattern("evidence swipe-synchronous preview", /syncActiveFromScroll/, componentText);
requirePattern("evidence collapses before horizontal swipe", /collapseOpenPanels/, componentText);
requirePattern("evidence browser-restored state reset", /details\[open\][\s\S]*?panel\.open\s*=\s*false/, evidenceText);
requirePattern("expected details hydration mismatch guard", /suppressHydrationWarning/, evidenceText);
requirePattern("evidence cards keep independent heights", /\.evidenceRail\s*\{[\s\S]*?align-items:\s*flex-start/, cssText);
requirePattern("scatter swipe selection rail", /scatterSelectionRail/, componentText);
requirePattern("single-step phrase swipe", /finishSingleStepSwipe/, componentText);
requirePattern("phrase absolute mode", /absolute/, componentText);
requirePattern("phrase shape warning", /Absolute magnitudes cannot be compared/, componentText);
requirePattern("reduced motion fallback", /prefers-reduced-motion:\s*reduce/, cssText);
requirePattern("safe area support", /safe-area-inset-(?:top|bottom)/, cssText);

if (failures.length > 0) {
  console.error(`Hub mobile structural audit failed (${failures.length}):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log(`Hub mobile structural audit passed across ${records.length} files.`);
}
