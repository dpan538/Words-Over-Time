import fs from "node:fs";
import ts from "typescript";

const sourceUrl = new URL("../src/components/depression/mobile/depressionSceneNavigation.ts", import.meta.url);
const source = fs.readFileSync(sourceUrl, "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;
const navigationModule = { exports: {} };
new Function("module", "exports", compiled)(navigationModule, navigationModule.exports);
const { clampToAdjacentScene } = navigationModule.exports;

if (typeof clampToAdjacentScene !== "function") {
  throw new Error("Depression scene clamp did not compile to a callable function.");
}

const SCENE_COUNT = 9;

for (let origin = 0; origin < SCENE_COUNT; origin += 1) {
  for (let candidate = 0; candidate < SCENE_COUNT; candidate += 1) {
    const target = clampToAdjacentScene(origin, candidate, SCENE_COUNT);
    if (Math.abs(target - origin) > 1) {
      throw new Error(`Scene skip detected: ${origin} -> ${candidate} settled at ${target}.`);
    }
    if (target < 0 || target >= SCENE_COUNT) {
      throw new Error(`Out-of-range scene target: ${target}.`);
    }
  }
}

const expectedCases = [
  { origin: 1, candidate: 3, expected: 2 },
  { origin: 3, candidate: 1, expected: 2 },
  { origin: 0, candidate: 8, expected: 1 },
  { origin: 8, candidate: 0, expected: 7 },
  { origin: 4, candidate: 4, expected: 4 },
];

for (const testCase of expectedCases) {
  const actual = clampToAdjacentScene(testCase.origin, testCase.candidate, SCENE_COUNT);
  if (actual !== testCase.expected) {
    throw new Error(`Expected ${testCase.expected}, received ${actual} for ${JSON.stringify(testCase)}.`);
  }
}

console.log("Depression mobile navigation invariants passed.");
