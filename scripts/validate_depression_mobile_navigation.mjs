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
const { sceneTraversal } = navigationModule.exports;

if (typeof sceneTraversal !== "function") {
  throw new Error("Depression scene traversal did not compile to a callable function.");
}

const SCENE_COUNT = 9;

for (let origin = 0; origin < SCENE_COUNT; origin += 1) {
  for (let candidate = 0; candidate < SCENE_COUNT; candidate += 1) {
    const traversal = sceneTraversal(origin, candidate, SCENE_COUNT);
    const target = traversal.at(-1);
    if (target < 0 || target >= SCENE_COUNT) {
      throw new Error(`Out-of-range scene target: ${origin} -> ${candidate}.`);
    }
    for (let index = 1; index < traversal.length; index += 1) {
      if (Math.abs(traversal[index] - traversal[index - 1]) !== 1) {
        throw new Error(`Traversal skipped a scene: ${traversal.join(" -> ")}.`);
      }
    }
  }
}

const expectedCases = [
  { origin: 1, candidate: 3, expected: [1, 2, 3] },
  { origin: 3, candidate: 1, expected: [3, 2, 1] },
  { origin: 0, candidate: 8, expected: [0, 1, 2, 3, 4, 5, 6, 7, 8] },
  { origin: 8, candidate: 0, expected: [8, 7, 6, 5, 4, 3, 2, 1, 0] },
  { origin: 4, candidate: 4, expected: [4] },
];

for (const testCase of expectedCases) {
  const actual = sceneTraversal(testCase.origin, testCase.candidate, SCENE_COUNT);
  if (actual.join(",") !== testCase.expected.join(",")) {
    throw new Error(`Expected ${testCase.expected.join(" -> ")}, received ${actual.join(" -> ")} for ${JSON.stringify(testCase)}.`);
  }
}

console.log("Depression mobile navigation invariants passed.");
