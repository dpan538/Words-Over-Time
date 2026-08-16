import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { ArtificialMediaEra, ArtificialMobileTimeStudy, ArtificialTimeTheme } from "../src/types/artificialMobileTimeStudy.ts";

const ROOT = process.cwd();
const INPUT = path.join(ROOT, "docs/research/artificial/mobile-2026-08/google-fixed-20200217/artificial-viewer-eng_2019-s0-case-sensitive.json");
const OUTPUT = path.join(ROOT, "src/data/generated/artificial_mobile_time_study.json");
const START_YEAR = 1800;
const END_YEAR = 2019;
const THEMES: ArtificialTimeTheme[] = ["BIOLOGICAL", "COGNITIVE", "MATERIAL", "SENSE", "SOCIAL"];
const ERAS: ArtificialMediaEra[] = ["optical_apparatus", "sound_and_cinema", "broadcast", "digital_simulation"];

type Capture = {
  release: string;
  selectedTermCount: number;
  termYearCellCount: number;
  series: Array<{ term: string; ngramOrder: number; family: "compound" | "media"; group: string; values: number[] }>;
};

function invariant(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function stableJson(value: unknown) { return `${JSON.stringify(value, null, 2)}\n`; }
function emptyThemeRecord(): Record<ArtificialTimeTheme, number> { return { BIOLOGICAL: 0, COGNITIVE: 0, MATERIAL: 0, SENSE: 0, SOCIAL: 0 }; }
function emptyEraRecord(): Record<ArtificialMediaEra, number> { return { optical_apparatus: 0, sound_and_cinema: 0, broadcast: 0, digital_simulation: 0 }; }

async function build() {
  const checkMode = process.argv.includes("--check");
  invariant(existsSync(INPUT), "Pinned Artificial Viewer capture is missing; run data:artificial:google:acquire");
  const capture = JSON.parse(await readFile(INPUT, "utf8")) as Capture;
  invariant(capture.release === "googlebooks-eng-20200217", "Artificial time-study release is not pinned");
  invariant(capture.selectedTermCount === 42 && capture.termYearCellCount === 9_240, "Pinned source coverage changed");
  const compound = capture.series.filter((row) => row.family === "compound" && row.ngramOrder === 2);
  const media = capture.series.filter((row) => row.family === "media");
  invariant(compound.length === 29, "Expected 29 comparable bigram phrases");
  invariant(media.length === 12, "Expected 12 selected media terms");

  const points = compound.flatMap((row) => row.values.flatMap((value, offset) => value > 0 ? [{ year: START_YEAR + offset, logFraction: Math.log10(value), theme: row.group as ArtificialTimeTheme }] : []));
  const logValues = points.map((point) => point.logFraction);
  const yDomain = { min: Math.floor(Math.min(...logValues)), max: Math.ceil(Math.max(...logValues)) };

  const compoundBands = Array.from({ length: 11 }, (_, bandIndex) => {
    const startYear = START_YEAR + bandIndex * 20;
    const endYear = Math.min(END_YEAR, startYear + 19);
    const themes = emptyThemeRecord();
    for (const row of compound) {
      const theme = row.group as ArtificialTimeTheme;
      for (let year = startYear; year <= endYear; year += 1) themes[theme] += row.values[year - START_YEAR] ?? 0;
    }
    const yearCount = endYear - startYear + 1;
    for (const theme of THEMES) themes[theme] /= yearCount;
    return { startYear, endYear, totalMeanFraction: Object.values(themes).reduce((sum, value) => sum + value, 0), themes };
  });

  const mediaMaxima = new Map(media.map((row) => [row.term, Math.max(...row.values)]));
  const mediaBands = Array.from({ length: 11 }, (_, bandIndex) => {
    const startYear = START_YEAR + bandIndex * 20;
    const endYear = Math.min(END_YEAR, startYear + 19);
    const eras = emptyEraRecord();
    const counts = emptyEraRecord();
    for (const row of media) {
      const era = row.group as ArtificialMediaEra;
      const maximum = mediaMaxima.get(row.term) ?? 0;
      if (maximum <= 0) continue;
      let sum = 0;
      for (let year = startYear; year <= endYear; year += 1) sum += (row.values[year - START_YEAR] ?? 0) / maximum;
      eras[era] += sum / (endYear - startYear + 1);
      counts[era] += 1;
    }
    for (const era of ERAS) eras[era] = counts[era] > 0 ? eras[era] / counts[era] : 0;
    return { startYear, endYear, totalEqualTermIndex: Object.values(eras).reduce((sum, value) => sum + value, 0), eras };
  });

  const years = Array.from({ length: END_YEAR - START_YEAR + 1 }, (_, index) => START_YEAR + index);
  const branchTrend = {
    unit: "share of the selected comparable bigram total, 11-year moving window" as const,
    years,
    themes: THEMES.map((theme) => ({
      theme,
      values: years.map((year) => {
        const from = Math.max(START_YEAR, year - 5);
        const to = Math.min(END_YEAR, year + 5);
        const sums = emptyThemeRecord();
        for (const row of compound) {
          for (let cursor = from; cursor <= to; cursor += 1) sums[row.group as ArtificialTimeTheme] += row.values[cursor - START_YEAR] ?? 0;
        }
        const total = Object.values(sums).reduce((sum, value) => sum + value, 0);
        return total > 0 ? sums[theme] / total : null;
      }),
    })),
  };

  const artifact: ArtificialMobileTimeStudy = {
    schemaVersion: "1.0.0",
    release: "googlebooks-eng-20200217",
    yearCoverage: { start: 1800, end: 2019 },
    rawSelectedTermCount: 42,
    rawTermYearCellCount: 9_240,
    rawCompoundCellCount: 6_600,
    rawMediaCellCount: 2_640,
    comparableCompoundTermCount: compound.length,
    comparableCompoundCellCount: 6_380,
    positiveComparableCompoundCellCount: points.length,
    scatter: { unit: "one positive bigram term-year Viewer cell", x: "year", y: "log10 corpus-normalized bigram fraction", points, yDomain },
    compoundBands,
    mediaBands,
    branchTrend,
  };
  const content = stableJson(artifact);
  if (checkMode) {
    invariant(existsSync(OUTPUT), "Artificial mobile time-study artifact is missing");
    invariant(await readFile(OUTPUT, "utf8") === content, "Artificial mobile time-study artifact is stale");
    console.log(`Validated Artificial mobile time study: ${points.length.toLocaleString("en-US")} positive bigram term-year points.`);
    return;
  }
  await mkdir(path.dirname(OUTPUT), { recursive: true });
  await writeFile(OUTPUT, content, "utf8");
  console.log(`Built Artificial mobile time study with ${points.length.toLocaleString("en-US")} positive comparable points.`);
}

build().catch((error) => { console.error(error); process.exitCode = 1; });
