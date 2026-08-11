import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import type {
  ForeverMobileAnalysis,
  ForeverMobileAnnualTurn,
  ForeverMobileDecade,
  ForeverMobileMetricCondition,
  ForeverMobileMetricId,
  ForeverMobileRailCard,
  ForeverMobileSpotCheck,
} from "../src/types/foreverMobileAnalysis.ts";

const ROOT = resolve(import.meta.dirname, "..");
const GOOGLE_ROOT = "docs/research/forever/google-fixed-20200217";
const JOINED_PATH = `${GOOGLE_ROOT}/extracted/forever-1.annual.tsv`;
const SPACED_PATH = `${GOOGLE_ROOT}/extracted/for-ever-2.annual.tsv`;
const TOTALCOUNTS_PATH = `${GOOGLE_ROOT}/frozen/totalcounts-1`;
const GOOGLE_ANALYSIS_PATH = "src/data/generated/forever_analysis.json";
const OUTPUT_PATH = "src/data/generated/forever_mobile_analysis.json";
const RELEASE = "googlebooks-eng-20200217";
const RATE_UNIT = "exact-form appearances per million corpus word tokens";
const REACH_UNIT = "containing-volume incidences per million corpus volumes";
const REPEAT_UNIT = "exact-form appearances per containing volume";

type AnnualRawRow = {
  form: "forever" | "for ever";
  year: number;
  matchCount: number;
  volumeCount: number;
  ngramOrder: 1 | 2;
  corpusRelease: string;
  lineNumber: number;
};

type TotalcountRow = {
  year: number;
  wordTokens: number;
  pageCount: number;
  volumeCount: number;
};

function invariant(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function pathText(path: string): string {
  return readFileSync(resolve(ROOT, path), "utf8");
}

function parseInteger(value: string, label: string): number {
  invariant(/^\d+$/.test(value), `${label} must be a non-negative integer lexeme`);
  const parsed = Number(value);
  invariant(Number.isSafeInteger(parsed), `${label} is outside the safe integer range`);
  return parsed;
}

function parseAnnual(path: string, expectedForm: "forever" | "for ever", expectedOrder: 1 | 2): AnnualRawRow[] {
  const lines = pathText(path).trimEnd().split("\n");
  invariant(
    lines[0] === "ngram\tyear\tmatch_count\tvolume_count\tngram_order\tcorpus_release\tsource_shard\twide_field_index",
    `${path} has an unexpected header`,
  );

  const rows = lines.slice(1).map((line, index) => {
    const fields = line.split("\t");
    invariant(fields.length === 8, `${path}:${index + 2} has ${fields.length} fields`);
    const [form, year, matchCount, volumeCount, order, release] = fields;
    invariant(form === expectedForm, `${path}:${index + 2} form is not exact ${expectedForm}`);
    invariant(Number(order) === expectedOrder, `${path}:${index + 2} n-gram order mismatch`);
    invariant(release === RELEASE, `${path}:${index + 2} release mismatch`);
    return {
      form: expectedForm,
      year: parseInteger(year, `${path}:${index + 2} year`),
      matchCount: parseInteger(matchCount, `${path}:${index + 2} match_count`),
      volumeCount: parseInteger(volumeCount, `${path}:${index + 2} volume_count`),
      ngramOrder: expectedOrder,
      corpusRelease: release,
      lineNumber: index + 2,
    };
  });

  invariant(new Set(rows.map((row) => row.year)).size === rows.length, `${path} contains duplicate years`);
  return rows;
}

function parseTotalcounts(): TotalcountRow[] {
  const tokens = pathText(TOTALCOUNTS_PATH).trim().split(/\s+/).filter(Boolean);
  const rows = tokens.map((token) => {
    const fields = token.split(",");
    invariant(fields.length === 4, `${TOTALCOUNTS_PATH} token has ${fields.length} fields`);
    const [year, wordTokens, pageCount, volumeCount] = fields;
    const row = {
      year: parseInteger(year, `${TOTALCOUNTS_PATH} year`),
      wordTokens: parseInteger(wordTokens, `${TOTALCOUNTS_PATH} word tokens`),
      pageCount: parseInteger(pageCount, `${TOTALCOUNTS_PATH} page count`),
      volumeCount: parseInteger(volumeCount, `${TOTALCOUNTS_PATH} volume count`),
    };
    invariant(row.wordTokens > 0, `${TOTALCOUNTS_PATH}:${row.year} word-token denominator is zero`);
    invariant(row.volumeCount > 0, `${TOTALCOUNTS_PATH}:${row.year} volume denominator is zero`);
    return row;
  });
  invariant(new Set(rows.map((row) => row.year)).size === rows.length, `${TOTALCOUNTS_PATH} contains duplicate years`);
  return rows;
}

function rounded(value: number, digits = 9): number {
  return Number(value.toFixed(digits));
}

function percentChange(from: number, to: number): number {
  invariant(from !== 0, "percent-change baseline is zero");
  return rounded(((to / from) - 1) * 100);
}

function factor(from: number, to: number): number {
  invariant(from !== 0, "factor baseline is zero");
  return rounded(to / from);
}

function sha256(text: string): string {
  return createHash("sha256").update(text).digest("hex");
}

function niceDomainMax(value: number): number {
  invariant(value > 0, "metric domain maximum must be positive");
  const exponent = 10 ** Math.floor(Math.log10(value));
  const fraction = value / exponent;
  const nice = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10;
  return nice * exponent;
}

function buildArtifact(): ForeverMobileAnalysis {
  const joinedRows = parseAnnual(JOINED_PATH, "forever", 1);
  const spacedRows = parseAnnual(SPACED_PATH, "for ever", 2);
  const totalRows = parseTotalcounts();
  const joinedByYear = new Map(joinedRows.map((row) => [row.year, row]));
  const spacedByYear = new Map(spacedRows.map((row) => [row.year, row]));
  const totalsByYear = new Map(totalRows.map((row) => [row.year, row]));

  const googleAnalysis = JSON.parse(pathText(GOOGLE_ANALYSIS_PATH)) as {
    fixedGoogleReleaseAudit?: {
      outcome?: string;
      release?: { persistentIdentifier?: string };
      fixedRawCommonDenominator?: { productionEligible?: boolean };
    };
  };
  invariant(
    googleAnalysis.fixedGoogleReleaseAudit?.outcome === "GOOGLE_COMMON_DENOMINATOR_CONTRACT_READY",
    "fixed Google common-denominator outcome is not ready",
  );
  invariant(
    googleAnalysis.fixedGoogleReleaseAudit.release?.persistentIdentifier === RELEASE,
    "fixed Google release identity mismatch",
  );
  invariant(
    googleAnalysis.fixedGoogleReleaseAudit.fixedRawCommonDenominator?.productionEligible === true,
    "fixed raw common-denominator contract is not production eligible",
  );

  const decadeRows: ForeverMobileDecade[] = [];
  for (let startYear = 1800; startYear <= 2010; startYear += 10) {
    const years = Array.from({ length: 10 }, (_, index) => startYear + index);
    const joined = years.map((year) => joinedByYear.get(year));
    const spaced = years.map((year) => spacedByYear.get(year));
    const totals = years.map((year) => totalsByYear.get(year));
    invariant(joined.every(Boolean), `${startYear}s is missing joined raw rows`);
    invariant(spaced.every(Boolean), `${startYear}s is missing spaced raw rows`);
    invariant(totals.every(Boolean), `${startYear}s is missing totalcount rows`);

    const joinedRowsForDecade = joined as AnnualRawRow[];
    const spacedRowsForDecade = spaced as AnnualRawRow[];
    const totalsForDecade = totals as TotalcountRow[];
    const joinedMatchCount = joinedRowsForDecade.reduce((sum, row) => sum + row.matchCount, 0);
    const spacedMatchCount = spacedRowsForDecade.reduce((sum, row) => sum + row.matchCount, 0);
    const joinedVolumeCount = joinedRowsForDecade.reduce((sum, row) => sum + row.volumeCount, 0);
    const spacedVolumeCount = spacedRowsForDecade.reduce((sum, row) => sum + row.volumeCount, 0);
    const corpusWordTokens = totalsForDecade.reduce((sum, row) => sum + row.wordTokens, 0);
    const corpusVolumes = totalsForDecade.reduce((sum, row) => sum + row.volumeCount, 0);
    const joinedRate = joinedMatchCount / corpusWordTokens * 1_000_000;
    const spacedRate = spacedMatchCount / corpusWordTokens * 1_000_000;
    const combinedRate = joinedRate + spacedRate;
    const joinedShare = joinedMatchCount / (joinedMatchCount + spacedMatchCount) * 100;

    decadeRows.push({
      id: `decade-${startYear}s`,
      label: `${startYear}s`,
      startYear,
      endYear: startYear + 9,
      completeYears: 10,
      joinedMatchCount,
      spacedMatchCount,
      joinedVolumeCount,
      spacedVolumeCount,
      corpusWordTokens,
      corpusVolumes,
      joinedRatePerMillionWords: rounded(joinedRate),
      spacedRatePerMillionWords: rounded(spacedRate),
      combinedRatePerMillionWords: rounded(combinedRate),
      joinedShareOfExactFormAppearances: rounded(joinedShare),
      joinedReachPerMillionVolumes: rounded(joinedVolumeCount / corpusVolumes * 1_000_000),
      spacedReachPerMillionVolumes: rounded(spacedVolumeCount / corpusVolumes * 1_000_000),
      joinedAppearancesPerContainingVolume: rounded(joinedMatchCount / joinedVolumeCount),
      spacedAppearancesPerContainingVolume: rounded(spacedMatchCount / spacedVolumeCount),
      visual: {
        combinedOnSeventyPercent: rounded(combinedRate / 70 * 100, 6),
        joinedOnSeventyPercent: rounded(joinedRate / 70 * 100, 6),
        spacedOnSeventyPercent: rounded(spacedRate / 70 * 100, 6),
      },
      lineage: {
        annualPaths: [JOINED_PATH, SPACED_PATH],
        annualLineNumbers: [
          ...joinedRowsForDecade.map((row) => row.lineNumber),
          ...spacedRowsForDecade.map((row) => row.lineNumber),
        ],
        totalcountsPath: TOTALCOUNTS_PATH,
        totalcountYears: years,
      },
    });
  }
  invariant(decadeRows.length === 22, `expected 22 complete decades, received ${decadeRows.length}`);

  const annualFirstTurn: ForeverMobileAnnualTurn[] = [];
  for (let year = 1882; year <= 1887; year += 1) {
    const joined = joinedByYear.get(year);
    const spaced = spacedByYear.get(year);
    const totals = totalsByYear.get(year);
    invariant(joined && spaced && totals, `first-turn row ${year} is incomplete`);
    const pair = joined.matchCount + spaced.matchCount;
    const joinedShare = joined.matchCount / pair * 100;
    const role: ForeverMobileAnnualTurn["role"] =
      year === 1884 ? "first_crossing"
        : year === 1885 ? "reversal"
          : year === 1886 ? "sustained_crossing"
            : year === 1887 ? "confirmation"
              : "lead-in";
    annualFirstTurn.push({
      year,
      joinedMatchCount: joined.matchCount,
      spacedMatchCount: spaced.matchCount,
      corpusWordTokens: totals.wordTokens,
      joinedRatePerMillionWords: rounded(joined.matchCount / totals.wordTokens * 1_000_000),
      spacedRatePerMillionWords: rounded(spaced.matchCount / totals.wordTokens * 1_000_000),
      joinedShareOfExactFormAppearances: rounded(joinedShare),
      joinedReachPerMillionVolumes: rounded(joined.volumeCount / totals.volumeCount * 1_000_000),
      spacedReachPerMillionVolumes: rounded(spaced.volumeCount / totals.volumeCount * 1_000_000),
      role,
      visual: {
        joinedSharePercent: rounded(joinedShare, 6),
        spacedSharePercent: rounded(100 - joinedShare, 6),
      },
      lineage: {
        annualPaths: [JOINED_PATH, SPACED_PATH],
        annualLineNumbers: [joined.lineNumber, spaced.lineNumber],
        totalcountsPath: TOTALCOUNTS_PATH,
        totalcountYears: [year],
      },
    });
  }

  const decade = (startYear: number) => {
    const value = decadeRows.find((row) => row.startYear === startYear);
    invariant(value, `missing generated decade ${startYear}s`);
    return value;
  };
  const annual = (year: number) => {
    const value = annualFirstTurn.find((row) => row.year === year);
    invariant(value, `missing generated first-turn year ${year}`);
    return value;
  };

  const d1820 = decade(1820);
  const d1880 = decade(1880);
  const d1890 = decade(1890);
  const d1980 = decade(1980);
  const d1990 = decade(1990);
  const d2000 = decade(2000);
  const d2010 = decade(2010);
  const shareBandValues = [d1990, d2000, d2010].map((row) => row.joinedShareOfExactFormAppearances);
  const shareMinimum = Math.min(...shareBandValues);
  const shareMaximum = Math.max(...shareBandValues);

  const metricIds: ForeverMobileMetricId[] = ["rate", "reach", "repeat"];
  const metricUnit = { rate: RATE_UNIT, reach: REACH_UNIT, repeat: REPEAT_UNIT } as const;
  const metricValue = (row: ForeverMobileDecade, metric: ForeverMobileMetricId, form: "joined" | "spaced") => {
    if (metric === "rate") return form === "joined" ? row.joinedRatePerMillionWords : row.spacedRatePerMillionWords;
    if (metric === "reach") return form === "joined" ? row.joinedReachPerMillionVolumes : row.spacedReachPerMillionVolumes;
    return form === "joined" ? row.joinedAppearancesPerContainingVolume : row.spacedAppearancesPerContainingVolume;
  };
  const metricDecades = decadeRows.filter((row) => row.startYear >= 1920);
  invariant(metricDecades.length === 10, `expected 10 metric decades, received ${metricDecades.length}`);

  const metricConditions: ForeverMobileMetricCondition[] = metricIds.map((metric) => {
    const maximum = Math.max(...metricDecades.flatMap((row) => [
      metricValue(row, metric, "joined"),
      metricValue(row, metric, "spaced"),
    ]));
    const domainMax = niceDomainMax(maximum);
    const ratio2010s = metricValue(d2010, metric, "joined") / metricValue(d2010, metric, "spaced");
    const interpretation = metric === "rate"
      ? "In the 2010s, joined visibility is 4.172 times the spaced exact form."
      : metric === "reach"
        ? "In the 2010s, joined reach across corpus volumes is 3.970 times the spaced exact form."
        : "In the 2010s, the joined form is repeated only 1.051 times as often inside a containing volume.";
    return {
      id: metric,
      label: metric.toUpperCase() as ForeverMobileMetricCondition["label"],
      unit: metricUnit[metric],
      domain: { min: 0, max: domainMax },
      ratio2010s: rounded(ratio2010s),
      headline: `${rounded(ratio2010s, 3).toFixed(3)}× joined / spaced`,
      interpretation,
      decades: metricDecades.map((row) => {
        const joinedValue = metricValue(row, metric, "joined");
        const spacedValue = metricValue(row, metric, "spaced");
        invariant(joinedValue >= spacedValue, `${metric} ${row.label} does not support the specified extension encoding`);
        const joinedPercent = joinedValue / domainMax * 100;
        const spacedPercent = spacedValue / domainMax * 100;
        return {
          id: `${metric}-${row.startYear}`,
          label: row.label,
          joinedValue: rounded(joinedValue),
          spacedValue: rounded(spacedValue),
          joinedPercent: rounded(joinedPercent, 6),
          spacedPercent: rounded(spacedPercent, 6),
          extensionPercent: rounded(joinedPercent - spacedPercent, 6),
        };
      }),
    };
  });

  const railA: ForeverMobileRailCard[] = [
    [d1820, "PEAK", "The highest selected long-arc anchor.", "The pair is unusually visible in the 1820s, led by the spaced form.", "This is a fixed-corpus decade aggregate, not a language-wide peak."],
    [d1980, "LOW", "The lowest selected long-arc anchor.", "Both exact forms reach the pair's selected low before the later return.", "A low in this corpus does not establish absence from language."],
    [d2010, "RETURN", "The latest complete decade in the fixed release.", "The pair returns to 2.92 times its 1980s rate but remains below the 1820s anchor.", "The 2010s are a partial return, not a full recovery."],
  ].map(([row, scope, definition, interpretation, caveat]) => {
    const value = row as ForeverMobileDecade;
    return {
      id: `rail-a-${value.startYear}`,
      railId: "rail-a",
      label: value.label,
      scope: scope as string,
      value: value.combinedRatePerMillionWords,
      displayValue: value.combinedRatePerMillionWords.toFixed(2),
      unit: RATE_UNIT,
      micro: {
        kind: "stacked-rate",
        primaryPercent: rounded(value.joinedShareOfExactFormAppearances, 6),
        secondaryPercent: rounded(100 - value.joinedShareOfExactFormAppearances, 6),
      },
      definition: definition as string,
      interpretation: interpretation as string,
      caveat: caveat as string,
      source: `${RELEASE}; ${value.startYear}–${value.endYear}; exact raw rows and same-release totalcounts-1.`,
    };
  });

  const railB: ForeverMobileRailCard[] = [
    [annual(1884), "FIRST CROSSING", "The first annual crossing in the inspected six-year sequence."],
    [annual(1885), "REVERSAL", "The following year falls back below equal share."],
    [annual(1886), "SUSTAINED", "The joined form crosses again and remains above in 1887."],
  ].map(([row, scope, interpretation]) => {
    const value = row as ForeverMobileAnnualTurn;
    return {
      id: `rail-b-${value.year}`,
      railId: "rail-b",
      label: String(value.year),
      scope: scope as string,
      value: value.joinedShareOfExactFormAppearances,
      displayValue: `${value.joinedShareOfExactFormAppearances.toFixed(2)}%`,
      unit: "joined share of pair exact-form appearances",
      micro: {
        kind: "form-composition",
        primaryPercent: value.visual.joinedSharePercent,
        secondaryPercent: value.visual.spacedSharePercent,
      },
      definition: "Joined exact-form appearances divided by joined plus spaced exact-form appearances in the same year.",
      interpretation: interpretation as string,
      caveat: "A yearly crossing is not an irreversible language event; the fixed corpus and its composition bound the result.",
      source: `${RELEASE}; ${value.year}; exact raw rows and same-release totalcounts-1.`,
    };
  });

  const secondTransition = {
    from: "1980s" as const,
    to: "2010s" as const,
    joinedRateFactor: factor(d1980.joinedRatePerMillionWords, d2010.joinedRatePerMillionWords),
    spacedRateFactor: factor(d1980.spacedRatePerMillionWords, d2010.spacedRatePerMillionWords),
    combinedRateFactor: factor(d1980.combinedRatePerMillionWords, d2010.combinedRatePerMillionWords),
    joinedReachFactor: factor(d1980.joinedReachPerMillionVolumes, d2010.joinedReachPerMillionVolumes),
    spacedReachFactor: factor(d1980.spacedReachPerMillionVolumes, d2010.spacedReachPerMillionVolumes),
    joinedRepeatFactor: factor(d1980.joinedAppearancesPerContainingVolume, d2010.joinedAppearancesPerContainingVolume),
    spacedRepeatFactor: factor(d1980.spacedAppearancesPerContainingVolume, d2010.spacedAppearancesPerContainingVolume),
    corpusWordsPerVolumeFactor: rounded(
      (d2010.corpusWordTokens / d2010.corpusVolumes) /
      (d1980.corpusWordTokens / d1980.corpusVolumes),
    ),
    shareBand1990sTo2010s: {
      minimum: rounded(shareMinimum),
      maximum: rounded(shareMaximum),
      widthPercentagePoints: rounded(shareMaximum - shareMinimum),
      combinedRateFactor: factor(d1990.combinedRatePerMillionWords, d2010.combinedRatePerMillionWords),
    },
    ratios2010s: {
      rate: rounded(d2010.joinedRatePerMillionWords / d2010.spacedRatePerMillionWords),
      reach: rounded(d2010.joinedReachPerMillionVolumes / d2010.spacedReachPerMillionVolumes),
      repeat: rounded(d2010.joinedAppearancesPerContainingVolume / d2010.spacedAppearancesPerContainingVolume),
    },
  };

  const factorScale = 3.1;
  const railC: ForeverMobileRailCard[] = [
    {
      id: "rail-c-forever",
      railId: "rail-c",
      label: "forever",
      scope: "JOINED RETURN",
      value: secondTransition.joinedRateFactor,
      displayValue: `${secondTransition.joinedRateFactor.toFixed(2)}×`,
      unit: "1980s→2010s exact-form rate factor",
      micro: {
        kind: "factor-strip",
        primaryPercent: rounded(secondTransition.joinedReachFactor / factorScale * 100, 6),
        secondaryPercent: rounded(secondTransition.joinedRepeatFactor / factorScale * 100, 6),
      },
      definition: "Rate factor decomposed into reach × repetition ÷ corpus words-per-volume factor.",
      interpretation: `Reach ${secondTransition.joinedReachFactor.toFixed(3)}×; repetition ${secondTransition.joinedRepeatFactor.toFixed(3)}×; corpus density ÷${secondTransition.corpusWordsPerVolumeFactor.toFixed(3)}×.`,
      caveat: "This decomposition is an accounting identity, not a causal attribution.",
      source: `${RELEASE}; complete 1980s and 2010s raw rows and totalcounts-1.`,
    },
    {
      id: "rail-c-for-ever",
      railId: "rail-c",
      label: "for ever",
      scope: "SPACED RETURN",
      value: secondTransition.spacedRateFactor,
      displayValue: `${secondTransition.spacedRateFactor.toFixed(2)}×`,
      unit: "1980s→2010s exact-form rate factor",
      micro: {
        kind: "factor-strip",
        primaryPercent: rounded(secondTransition.spacedReachFactor / factorScale * 100, 6),
        secondaryPercent: rounded(secondTransition.spacedRepeatFactor / factorScale * 100, 6),
      },
      definition: "Rate factor decomposed into reach × repetition ÷ corpus words-per-volume factor.",
      interpretation: `Reach ${secondTransition.spacedReachFactor.toFixed(3)}×; repetition ${secondTransition.spacedRepeatFactor.toFixed(3)}×; corpus density ÷${secondTransition.corpusWordsPerVolumeFactor.toFixed(3)}×.`,
      caveat: "This decomposition is an accounting identity, not a causal attribution.",
      source: `${RELEASE}; complete 1980s and 2010s raw rows and totalcounts-1.`,
    },
    {
      id: "rail-c-pair",
      railId: "rail-c",
      label: "pair",
      scope: "COMBINED RETURN",
      value: secondTransition.combinedRateFactor,
      displayValue: `${secondTransition.combinedRateFactor.toFixed(2)}×`,
      unit: "1980s→2010s combined exact-form rate factor",
      micro: {
        kind: "factor-strip",
        primaryPercent: rounded(d1980.combinedRatePerMillionWords / d2010.combinedRatePerMillionWords * 100, 6),
        secondaryPercent: 100,
      },
      definition: "Combined joined plus spaced exact-form rate in two complete decades.",
      interpretation: `${d1980.combinedRatePerMillionWords.toFixed(2)} in the 1980s → ${d2010.combinedRatePerMillionWords.toFixed(2)} in the 2010s.`,
      caveat: "The factor describes this fixed corpus release; it is not a causal attribution.",
      source: `${RELEASE}; complete 1980s and 2010s raw rows and totalcounts-1.`,
    },
  ];

  const checks: Array<[string, number, number, number, string]> = [];
  const check = (id: string, actual: number, expected: number, tolerance: number, lineage: string) =>
    checks.push([id, actual, expected, tolerance, lineage]);
  for (const [label, row, expected] of [
    ["1820s", d1820, [9.113616, 59.477364, 68.590980, 13.2869]],
    ["1880s", d1880, [18.586015, 18.681862, 37.267877, 49.8714]],
    ["1890s", d1890, [18.572229, 14.239244, 32.811473, 56.6029]],
    ["1980s", d1980, [9.531400, 2.689990, 12.221390, 77.9895]],
    ["2010s", d2010, [28.753460, 6.892064, 35.645525, 80.6650]],
  ] as const) {
    check(`${label}-joined-rate`, row.joinedRatePerMillionWords, expected[0], 0.0000006, row.lineage.annualPaths.join(" + "));
    check(`${label}-spaced-rate`, row.spacedRatePerMillionWords, expected[1], 0.0000006, row.lineage.annualPaths.join(" + "));
    check(`${label}-combined-rate`, row.combinedRatePerMillionWords, expected[2], 0.0000006, row.lineage.annualPaths.join(" + "));
    check(`${label}-joined-share`, row.joinedShareOfExactFormAppearances, expected[3], 0.00006, row.lineage.annualPaths.join(" + "));
  }
  check("1884-joined-share", annual(1884).joinedShareOfExactFormAppearances, 50.1554, 0.00006, JOINED_PATH);
  check("1885-joined-share", annual(1885).joinedShareOfExactFormAppearances, 46.3305, 0.00006, JOINED_PATH);
  check("1886-joined-share", annual(1886).joinedShareOfExactFormAppearances, 53.8241, 0.00006, JOINED_PATH);

  const firstTransition = {
    from: "1880s" as const,
    to: "1890s" as const,
    joinedRatePercentChange: percentChange(d1880.joinedRatePerMillionWords, d1890.joinedRatePerMillionWords),
    spacedRatePercentChange: percentChange(d1880.spacedRatePerMillionWords, d1890.spacedRatePerMillionWords),
    combinedRatePercentChange: percentChange(d1880.combinedRatePerMillionWords, d1890.combinedRatePerMillionWords),
    joinedSharePercentagePointChange: rounded(d1890.joinedShareOfExactFormAppearances - d1880.joinedShareOfExactFormAppearances),
    firstCrossingYear: 1884 as const,
    reversalYear: 1885 as const,
    sustainedCrossingYear: 1886 as const,
    firstSustainedReachLeadYear: 1886 as const,
  };
  check("first-transition-joined-rate-change", firstTransition.joinedRatePercentChange, -0.0742, 0.00006, "1880s→1890s aggregate");
  check("first-transition-spaced-rate-change", firstTransition.spacedRatePercentChange, -23.7804, 0.00006, "1880s→1890s aggregate");
  check("first-transition-combined-rate-change", firstTransition.combinedRatePercentChange, -11.9578, 0.00006, "1880s→1890s aggregate");
  check("first-transition-share-change", firstTransition.joinedSharePercentagePointChange, 6.7315, 0.00006, "1880s→1890s aggregate");
  check("rebound-pair-factor", secondTransition.combinedRateFactor, 2.916651, 0.0000006, "1980s→2010s aggregate");
  check("rebound-joined-factor", secondTransition.joinedRateFactor, 3.016709, 0.0000006, "1980s→2010s aggregate");
  check("rebound-spaced-factor", secondTransition.spacedRateFactor, 2.562115, 0.0000006, "1980s→2010s aggregate");
  check("share-band-minimum", secondTransition.shareBand1990sTo2010s.minimum, 80.6650, 0.00006, "1990s–2010s aggregate");
  check("share-band-maximum", secondTransition.shareBand1990sTo2010s.maximum, 82.0480, 0.00006, "1990s–2010s aggregate");
  check("share-band-width", secondTransition.shareBand1990sTo2010s.widthPercentagePoints, 1.383, 0.0006, "1990s–2010s aggregate");
  check("2010s-rate-ratio", secondTransition.ratios2010s.rate, 4.171966, 0.0000006, "2010s aggregate");
  check("2010s-reach-ratio", secondTransition.ratios2010s.reach, 3.969515, 0.0000006, "2010s aggregate");
  check("2010s-repeat-ratio", secondTransition.ratios2010s.repeat, 1.051002, 0.0000006, "2010s aggregate");

  const spotChecks: ForeverMobileSpotCheck[] = checks.map(([id, actual, expected, tolerance, lineage]) => ({
    id,
    actual,
    expected,
    tolerance,
    passed: Math.abs(actual - expected) <= tolerance,
    lineage,
  }));
  invariant(spotChecks.every((item) => item.passed), `mobile Forever spot checks failed: ${spotChecks.filter((item) => !item.passed).map((item) => item.id).join(", ")}`);

  const sourcePaths = [JOINED_PATH, SPACED_PATH, TOTALCOUNTS_PATH];
  const artifact: ForeverMobileAnalysis = {
    schemaVersion: "1.0.0",
    generatedFromFrozenInputs: true,
    release: {
      viewerShorthand: "eng_2019",
      persistentIdentifier: RELEASE,
      rawReleaseDirectory: "20200217/eng",
      analysisWindow: { start: 1800, end: 2019 },
      exactForms: [
        { form: "forever", ngramOrder: 1 },
        { form: "for ever", ngramOrder: 2 },
      ],
    },
    units: { rate: RATE_UNIT, reach: REACH_UNIT, repeat: REPEAT_UNIT },
    caveats: [
      "The fixed corpus reflects the books Google retained and processed; OCR error, metadata error and changing corpus composition remain.",
      "Exact surface forms do not identify meaning, first use, social acceptance or language-wide spelling adoption.",
      "Sparse raw absence is absent_or_suppressed and is never silently converted to observed zero.",
      "Viewer-normalised fractions are not used for the shared joined/spaced scale.",
    ],
    decades: decadeRows,
    annualFirstTurn,
    milestones: {
      peak1820s: d1820,
      balance1880s: d1880,
      majority1890s: d1890,
      low1980s: d1980,
      return2010s: d2010,
      peakToLowPercentChange: percentChange(d1820.combinedRatePerMillionWords, d1980.combinedRatePerMillionWords),
      lowToReturnFactor: factor(d1980.combinedRatePerMillionWords, d2010.combinedRatePerMillionWords),
      returnBelowPeakPercent: percentChange(d1820.combinedRatePerMillionWords, d2010.combinedRatePerMillionWords),
    },
    firstTransition,
    secondTransition,
    longArcAnchors: [d1820, d1880, d1890, d1980, d2010],
    metricConditions,
    rails: { railA, railB, railC },
    closingFinding: {
      title: "Breadth, not heavier repetition.",
      sentence: "In the 2010s, forever is about four times as visible as for ever, but it is repeated only about five percent more often inside a containing volume. Its modern advantage is overwhelmingly one of breadth across books.",
      rateRatio: secondTransition.ratios2010s.rate,
      repeatRatio: secondTransition.ratios2010s.repeat,
    },
    figureContracts: [
      {
        id: "F01",
        productionEligible: true,
        findingKey: "milestones",
        generatedDataKeys: ["longArcAnchors", "milestones"],
        sourcePaths,
        transform: "ten-year sums of exact-form numerators and same-release denominators before division",
        denominator: "same-release corpus word tokens",
        unit: RATE_UNIT,
        missingnessPolicy: "all ten annual rows and denominators required; no silent fill",
        validInterpretation: "fixed-corpus long-arc visibility and exact-form composition",
        prohibitedInterpretation: "full recovery, first use, semantics or population spelling adoption",
      },
      {
        id: "F02",
        productionEligible: true,
        findingKey: "firstTransition",
        generatedDataKeys: ["annualFirstTurn", "firstTransition"],
        sourcePaths,
        transform: "annual exact-form shares plus exposure-weighted 1880s→1890s aggregate changes",
        denominator: "same-year pair exact-form counts for share; same-release word tokens for rate",
        unit: "percent share, percentage points and rate percent change",
        missingnessPolicy: "1882–1887 and both complete decades required; no silent fill",
        validInterpretation: "joined share turns while joined rate is effectively flat and spaced rate retreats",
        prohibitedInterpretation: "single-year irreversible switch or causal attribution",
      },
      {
        id: "F03",
        productionEligible: true,
        findingKey: "secondTransition",
        generatedDataKeys: ["secondTransition", "milestones.low1980s", "milestones.return2010s"],
        sourcePaths,
        transform: "complete-decade rates, shares and 1980s→2010s factors",
        denominator: "same-release word tokens; pair exact-form counts for share",
        unit: "percent share, rate and dimensionless factors",
        missingnessPolicy: "1980s–2010s complete decades required; no silent fill",
        validInterpretation: "both forms rebound after joined share has settled near four-fifths",
        prohibitedInterpretation: "a second spelling switch or causal mechanism",
      },
      {
        id: "F04",
        productionEligible: true,
        findingKey: "metricConditions",
        generatedDataKeys: ["metricConditions", "secondTransition.ratios2010s"],
        sourcePaths,
        transform: "complete-decade rate, reach and repetition metrics on independent domains",
        denominator: "word tokens for RATE, corpus volumes for REACH, containing volumes for REPEAT",
        unit: "three explicitly separate units",
        missingnessPolicy: "all 1920s–2010s decade inputs required; no silent fill",
        validInterpretation: "the modern joined advantage is primarily breadth across volumes",
        prohibitedInterpretation: "cross-unit magnitude comparison or causal decomposition",
      },
    ],
    spotChecks,
  };

  invariant(artifact.figureContracts.every((contract) => contract.productionEligible), "a mobile figure contract is not eligible");
  return artifact;
}

const artifact = buildArtifact();
const output = `${JSON.stringify(artifact, null, 2)}\n`;
const checkMode = process.argv.includes("--check");

if (checkMode) {
  const existing = pathText(OUTPUT_PATH);
  invariant(existing === output, `${OUTPUT_PATH} is stale; run the mobile Forever analysis build`);
  process.stdout.write(`Mobile Forever analysis PASS / ${artifact.decades.length} decades / ${artifact.spotChecks.length} spot checks / sha256 ${sha256(output)}\n`);
} else {
  writeFileSync(resolve(ROOT, OUTPUT_PATH), output, "utf8");
  process.stdout.write(`Wrote ${OUTPUT_PATH} / ${artifact.decades.length} decades / ${artifact.spotChecks.length} spot checks / sha256 ${sha256(output)}\n`);
}
