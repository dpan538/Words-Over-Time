import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const read = (relativePath) => readFile(path.join(root, relativePath), "utf8");

function invariant(condition, message) {
  if (!condition) throw new Error(message);
}

const [payloadText, wheelSource, deckSource, cssSource] = await Promise.all([
  read("src/data/generated/depression_mobile_research.json"),
  read("src/components/depression/mobile/RotaryFrequencyWheel.tsx"),
  read("src/components/depression/mobile/DepressionStoryDeck.tsx"),
  read("src/components/depression/mobile/mobile-depression.module.css"),
]);

const payload = JSON.parse(payloadText);
const rotary = payload.rotaryInterlude;
invariant(rotary?.kind === "rotary-interlude", "Missing 03A rotary-interlude data");
invariant(rotary.series.length === 3, "03A must contain exactly three series");
invariant(rotary.background === "#EEE7DD", "03A background must be warm paper");
invariant(rotary.series.every((series) => ["business", "financial", "economic"].includes(series.key)), "03A contains a non-economic selector");
invariant(rotary.series.every((series) => series.yDomain[0] === 0 && series.yDomain[1] === 3.5), "03A series do not share the 0—3.5 scale");
for (const series of rotary.series) {
  invariant(series.points.length === 66, `${series.label} does not contain 66 annual positions`);
  invariant(series.points[0].year === 1874 && series.points.at(-1).year === 1939, `${series.label} has the wrong period`);
  invariant(new Set(series.points.map((point) => point.year)).size === 66, `${series.label} has duplicate years`);
}

const rotarySceneSource = deckSource.match(/function WheelScene[\s\S]*?function ClosingScene/)?.[0] ?? "";
invariant(rotarySceneSource.includes("<RotaryFrequencyWheel"), "WheelScene does not render its wheel");
invariant(!rotarySceneSource.includes("<DepressionPersistentCard"), "WheelScene contains a card shell");
invariant(!rotarySceneSource.includes("chapterNarrative"), "WheelScene contains chapter narrative");
invariant(!wheelSource.includes("DepressionCardShell"), "The rotary wheel imports or references a card shell");
invariant((wheelSource.match(/<svg/g) ?? []).length === 1, "The rotary instrument must use one SVG");
invariant(wheelSource.includes("data-annual-position-count"), "Annual-position structural marker is missing");

const forbidden3d = /perspective|preserve-3d|rotateX|rotateY|backface-visibility|translate3d/i;
invariant(!forbidden3d.test(cssSource), "Depression mobile CSS contains a forbidden 3D declaration");
invariant(!forbidden3d.test(wheelSource), "Rotary wheel source contains a forbidden 3D transform");
invariant(cssSource.includes("min(89vw, 56svh, 370px)"), "Rotary contained diameter contract changed");
invariant(cssSource.includes("touch-action: pan-y"), "Rotary scene no longer preserves vertical scrolling");

console.log("depression rotary scene structure and data invariants passed");
