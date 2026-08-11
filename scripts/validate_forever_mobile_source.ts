import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { ForeverMobileAnalysis } from "../src/types/foreverMobileAnalysis.ts";

const ROOT = resolve(import.meta.dirname, "..");
const publicFiles = [
  "src/components/forever/mobile/MobileForeverStudy.tsx",
  "src/components/forever/mobile/MobileForeverLongArc.tsx",
  "src/components/forever/mobile/MobileForeverFirstTurn.tsx",
  "src/components/forever/mobile/MobileForeverCompositionFlipField.tsx",
  "src/components/forever/mobile/MobileForeverMetricConditions.tsx",
  "src/components/forever/mobile/MobileForeverEvidenceRail.tsx",
  "src/components/forever/mobile/mobile-forever.module.css",
];

function invariant(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function text(path: string) {
  return readFileSync(resolve(ROOT, path), "utf8");
}

const publicSource = publicFiles.map((path) => `${path}\n${text(path)}`).join("\n");
const routeSource = text("src/app/words/forever/page.tsx");
const artifact = JSON.parse(text("src/data/generated/forever_mobile_analysis.json")) as ForeverMobileAnalysis;

invariant(routeSource.includes("MobileForeverStudy"), "Forever route does not render MobileForeverStudy");
invariant(routeSource.includes("foreverMobileAnalysis"), "Forever route does not consume the typed mobile analysis");
invariant(!routeSource.includes("ForeverMobileEditorial"), "Forever route still renders the legacy mobile editorial");
invariant(!routeSource.includes("ForeverMobileDataGate"), "Forever route renders the internal data gate");
invariant(!/ForeverDesktop|ForeverPoster|DesktopEdition/.test(publicSource), "mobile source imports a desktop Forever visual component");
invariant(!/\b(canvas|webgl2?|three\.js|from\s+["']three["'])\b/i.test(publicSource), "mobile source contains Canvas, WebGL or Three.js");
invariant(!/\b(audit|gate|stop|unauthorized|contract)\b/i.test(publicSource), "public mobile source contains workflow-status language");
invariant(!/\bmatch(?:es|ed|ing)?\b/i.test(publicSource), "public mobile source contains the ambiguous match unit");
invariant(!/<details\s+[^>]*open(?:\s|=|>)/i.test(publicSource), "a mobile disclosure is open by default");
invariant((publicSource.match(/data-figure-id="F0[1-4]"/g) ?? []).length === 4, "expected four rendered figure IDs");
invariant(artifact.generatedFromFrozenInputs === true, "mobile artifact is not marked as frozen-input derived");
invariant(artifact.release.persistentIdentifier === "googlebooks-eng-20200217", "mobile artifact release mismatch");
invariant(artifact.decades.length === 22, `expected 22 decades, found ${artifact.decades.length}`);
invariant(artifact.annualFirstTurn.length === 6, `expected six first-turn annual rows, found ${artifact.annualFirstTurn.length}`);
invariant(artifact.metricConditions.length === 3, "expected RATE, REACH and REPEAT conditions");
invariant(artifact.metricConditions.map((condition) => condition.id).join("|") === "rate|reach|repeat", "metric condition order changed");
invariant(artifact.rails.railA.length === 3 && artifact.rails.railB.length === 3 && artifact.rails.railC.length === 3, "each evidence rail must contain three cards");
invariant(artifact.figureContracts.length === 4 && artifact.figureContracts.every((contract) => contract.productionEligible), "all four mobile figure contracts must be eligible");
invariant(artifact.spotChecks.length >= 15 && artifact.spotChecks.every((check) => check.passed), "mobile artifact spot checks are incomplete or failing");

process.stdout.write(`Mobile Forever source PASS / ${publicFiles.length} public files / ${artifact.decades.length} decades / ${artifact.spotChecks.length} spot checks\n`);
