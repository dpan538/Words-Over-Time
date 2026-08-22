import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const desktopHomePath = path.join(
  root,
  "src/components/home/desktop/DesktopHome.tsx",
);
const posterMarksPath = path.join(root, "src/components/PosterMarks.tsx");

const [desktopHome, posterMarks] = await Promise.all([
  readFile(desktopHomePath, "utf8"),
  readFile(posterMarksPath, "utf8"),
]);

const failures: string[] = [];

function check(condition: unknown, message: string) {
  if (!condition) failures.push(message);
}

check(
  !/MobileHome|components\/home\/mobile/.test(desktopHome),
  "DesktopHome must not import or reference mobile presentation code",
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

console.log(
  JSON.stringify(
    {
      status: failures.length === 0 ? "PASS" : "FAIL",
      desktopHome: {
        mobilePresentationDependency: false,
        paletteSegments: desktopPaletteSequence.length,
      },
      failures,
    },
    null,
    2,
  ),
);

if (failures.length > 0) process.exitCode = 1;
