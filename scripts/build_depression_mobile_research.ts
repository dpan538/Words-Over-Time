import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type {
  DepressionMobileAttestation,
  DepressionMobileChart,
  DepressionMobileMetric,
  DepressionMobileResearch,
  DepressionMobileSeries,
  DepressionRotaryInterludeData,
  DepressionRotarySeries,
} from "../src/types/depressionMobileResearch.ts";

const ROOT = process.cwd();
const GENERATED = path.join(ROOT, "src", "data", "generated");
const OUTPUT = path.join(GENERATED, "depression_mobile_research.json");
const UNIT = "appearances per million corpus words" as const;

type FrequencyPoint = { year: number; frequencyPerMillion: number };
type FrequencySeries = {
  id: string;
  label: string;
  query: string;
  color: string;
  points: FrequencyPoint[];
};
type FrequencyFile = {
  generatedAt: string;
  source: { label: string; urls: string[]; corpus: string; note: string };
  series: FrequencySeries[];
};
type PrehistoryFile = {
  records: Array<{
    form: string;
    senseBranch: string;
    yearApproximation: number;
    sourceName: string;
    sourceUrl: string;
    confidence: "medium" | "high" | "low";
  }>;
};
type EconomicFile = {
  nber: {
    source: string;
    sourceUrl: string;
    records: Array<{ id: string; label: string; peak: string; trough: string; durationMonths: number }>;
  };
};
type ClinicalFile = {
  meshDescriptors: Array<{ heading: string; yearIntroduced: number | null; sourceUrl: string }>;
};

function invariant(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function assertClose(actual: number, expected: number, label: string) {
  invariant(Math.abs(actual - expected) < 0.005, `${label}: expected ${expected}, received ${actual}`);
}

async function readJson<T>(file: string): Promise<T> {
  return JSON.parse(await readFile(file, "utf8")) as T;
}

function rounded(value: number, precision = 4) {
  return Number(value.toFixed(precision));
}

function assertAnnualSeries(series: FrequencySeries) {
  let previous = -Infinity;
  for (const point of series.points) {
    invariant(Number.isFinite(point.frequencyPerMillion), `${series.query} has a non-finite rate`);
    invariant(point.year > previous, `${series.query} has unsorted or duplicate year ${point.year}`);
    previous = point.year;
  }
}

function average(points: FrequencyPoint[], startYear: number, endYear: number) {
  const selected = points.filter((point) => point.year >= startYear && point.year <= endYear);
  invariant(selected.length === endYear - startYear + 1, `Missing annual values for ${startYear}–${endYear}`);
  return rounded(selected.reduce((total, point) => total + point.frequencyPerMillion, 0) / selected.length);
}

function maximum(points: FrequencyPoint[], startYear: number, endYear: number) {
  const selected = points.filter((point) => point.year >= startYear && point.year <= endYear);
  invariant(selected.length > 0, `No values for ${startYear}–${endYear}`);
  return selected.reduce((largest, point) =>
    point.frequencyPerMillion > largest.frequencyPerMillion ? point : largest,
  );
}

function centeredAverage(points: FrequencyPoint[], year: number, radius = 4) {
  return average(points, year - radius, year + radius);
}

function firstSustainedAbove(points: FrequencyPoint[], threshold: number, startYear: number, endYear: number) {
  let run = 0;
  for (let year = startYear + 4; year <= endYear - 4; year += 1) {
    run = centeredAverage(points, year) >= threshold ? run + 1 : 0;
    if (run === 5) return year - 4;
  }
  throw new Error(`No sustained value above ${threshold} from ${startYear} to ${endYear}`);
}

function firstSustainedCrossover(
  left: FrequencyPoint[],
  right: FrequencyPoint[],
  startYear: number,
  endYear: number,
) {
  let run = 0;
  for (let year = startYear + 4; year <= endYear - 4; year += 1) {
    run = centeredAverage(left, year) > centeredAverage(right, year) ? run + 1 : 0;
    if (run === 20) return year - 19;
  }
  throw new Error("No sustained crossover found");
}

function seriesFor(frequency: FrequencyFile, query: string) {
  const series = frequency.series.find((candidate) => candidate.query === query);
  invariant(series, `Missing Ngram series: ${query}`);
  assertAnnualSeries(series);
  return series;
}

function chartSeries(series: FrequencySeries, startYear: number, endYear: number, color: string): DepressionMobileSeries {
  const points = series.points
    .filter((point) => point.year >= startYear && point.year <= endYear)
    .map((point) => ({ year: point.year, value: rounded(point.frequencyPerMillion) }));
  invariant(points.length === endYear - startYear + 1, `Missing ${series.query} chart value`);
  return { id: series.id, label: series.label, color, unit: UNIT, points };
}

function rotarySeries(
  series: FrequencySeries,
  definition: Pick<DepressionRotarySeries, "key" | "family" | "color" | "yDomain">,
): DepressionRotarySeries {
  const byYear = new Map(series.points.map((point) => [point.year, point.frequencyPerMillion]));
  const points = Array.from({ length: 1939 - 1874 + 1 }, (_, index) => {
    const year = 1874 + index;
    const observed = byYear.get(year);
    return { year, value: observed === undefined ? null : rounded(observed) };
  });
  const validPoints = points.filter((point): point is { year: number; value: number } => point.value !== null);
  invariant(validPoints.length > 0, `No rotary values for ${series.query}`);
  const peak = validPoints.reduce((largest, point) => point.value > largest.value ? point : largest);
  invariant(peak.value <= definition.yDomain[1], `${series.query} rotary peak exceeds its family scale`);
  return {
    ...definition,
    label: series.label,
    points,
    peak: { year: peak.year, value: rounded(peak.value) },
  };
}

function assertRotaryInterlude(interlude: DepressionRotaryInterludeData) {
  invariant(interlude.series.length === 3, "03A must contain exactly three market-phrase series");
  invariant(interlude.series.every((series) => ["business", "financial", "economic"].includes(series.key)), "03A may contain only the three economic compounds");
  for (const series of interlude.series) {
    invariant(series.points.length === 66, `${series.label} must contain all 66 annual positions`);
    const years = series.points.map((point) => point.year);
    invariant(years[0] === 1874 && years.at(-1) === 1939, `${series.label} rotary range changed`);
    invariant(new Set(years).size === years.length, `${series.label} has duplicate rotary years`);
    invariant(years.every((year, index) => index === 0 || year > years[index - 1]), `${series.label} rotary years are not sorted`);
  }
  invariant(interlude.series.every((series) => series.yDomain[0] === 0 && series.yDomain[1] === 3.5), "All 03A phrases must share the 0—3.5 / M scale");
}

function smoothedChartSeries(series: FrequencySeries, startYear: number, endYear: number, color: string): DepressionMobileSeries {
  const points = Array.from({ length: endYear - startYear + 1 }, (_, index) => {
    const year = startYear + index;
    return { year, value: centeredAverage(series.points, year) };
  });
  return { id: series.id, label: series.label, color, unit: UNIT, points };
}

function metric(label: string, detail: string, value: number, precision = 2): DepressionMobileMetric {
  return { label, detail, value: rounded(value, precision), precision };
}

function chart(
  id: DepressionMobileChart["id"],
  kind: DepressionMobileChart["kind"],
  period: [number, number],
  title: string,
  accessibleSummary: string,
  transform: string,
  caveat: string,
  rest: Omit<Partial<DepressionMobileChart>, "id" | "kind" | "period" | "title" | "accessibleSummary" | "transform" | "caveat" | "unitLabel">,
): DepressionMobileChart {
  return {
    id,
    kind,
    period,
    title,
    accessibleSummary,
    unitLabel: "APPEARANCES / MILLION CORPUS WORDS",
    transform,
    caveat,
    ...rest,
  };
}

async function buildResearch(): Promise<DepressionMobileResearch> {
  const [frequency, prehistory, economic, clinical] = await Promise.all([
    readJson<FrequencyFile>(path.join(GENERATED, "depression_frequency.json")),
    readJson<PrehistoryFile>(path.join(GENERATED, "depression_prehistory.json")),
    readJson<EconomicFile>(path.join(GENERATED, "depression_economic_context.json")),
    readJson<ClinicalFile>(path.join(GENERATED, "depression_clinical_vocabulary.json")),
  ]);

  const depression = seriesFor(frequency, "depression");
  const melancholy = seriesFor(frequency, "melancholy");
  const anxiety = seriesFor(frequency, "anxiety");
  const economicPhrase = seriesFor(frequency, "economic depression");
  const businessPhrase = seriesFor(frequency, "business depression");
  const financialPhrase = seriesFor(frequency, "financial depression");
  const clinicalPhrase = seriesFor(frequency, "clinical depression");
  const majorPhrase = seriesFor(frequency, "major depression");
  const disorderPhrase = seriesFor(frequency, "depressive disorder");

  const keyAttestations = [
    ["astronomical_angle", "ASTRONOMICAL ANGLE"],
    ["emotional_low_state", "EMOTIONAL LOW"],
    ["physical_lowering_pressure", "PHYSICAL LOWERING"],
    ["economic_downturn", "ECONOMIC DOWNTURN"],
    ["meteorological_low_pressure", "WEATHER LOW"],
    ["clinical_psychiatric_condition", "CLINICAL TERM"],
  ] as const;
  const attestations: DepressionMobileAttestation[] = keyAttestations.map(([senseBranch, label]) => {
    const record = prehistory.records.find((candidate) => candidate.form === "depression" && candidate.senseBranch === senseBranch);
    invariant(record, `Missing prehistory record for ${senseBranch}`);
    return {
      year: record.yearApproximation,
      label,
      sense: senseBranch.replaceAll("_", " "),
      source: record.sourceName,
      confidence: record.confidence,
    };
  });

  const printDepressionMean = average(depression.points, 1800, 1873);
  const printMelancholyMean = average(melancholy.points, 1800, 1873);
  const crossoverYear = firstSustainedCrossover(depression.points, melancholy.points, 1800, 2000);
  const crisisPeak = maximum(depression.points, 1929, 1939);
  const postwarOneMean = average(depression.points, 1940, 1959);
  const postwarTwoMean = average(depression.points, 1960, 1979);
  const clinicalPostwarMean = average(clinicalPhrase.points, 1940, 1979);
  const clinicalSustainedYear = firstSustainedAbove(clinicalPhrase.points, 0.01, 1900, 2022);
  const majorSustainedYear = firstSustainedAbove(majorPhrase.points, 0.1, 1900, 2022);
  const disorderSustainedYear = firstSustainedAbove(disorderPhrase.points, 0.1, 1900, 2022);
  const depression2010s = average(depression.points, 2010, 2019);
  const anxiety2010s = average(anxiety.points, 2010, 2019);
  const depression2022 = depression.points.find((point) => point.year === 2022)?.frequencyPerMillion;
  const anxiety2022 = anxiety.points.find((point) => point.year === 2022)?.frequencyPerMillion;
  const greatDepression = economic.nber.records.find((record) => record.id === "great-depression-1929-1933");
  const rotaryInterlude: DepressionRotaryInterludeData = {
    id: "rotary-interlude",
    kind: "rotary-interlude",
    code: "03A",
    period: [1874, 1939],
    background: "#EEE7DD",
    unit: UNIT,
    series: [
      rotarySeries(businessPhrase, { key: "business", family: "phrase", color: "#B13A2D", yDomain: [0, 3.5] }),
      rotarySeries(financialPhrase, { key: "financial", family: "phrase", color: "#955718", yDomain: [0, 3.5] }),
      rotarySeries(economicPhrase, { key: "economic", family: "phrase", color: "#6E635A", yDomain: [0, 3.5] }),
    ],
  };

  invariant(greatDepression, "Missing NBER Great Depression marker");
  invariant(depression2022 !== undefined && anxiety2022 !== undefined, "Missing 2022 modern comparison values");
  assertClose(printDepressionMean, 6.28, "1800–1873 depression mean");
  assertClose(printMelancholyMean, 20.2, "1800–1873 melancholy mean");
  invariant(crossoverYear === 1874, `Sustained crossover must begin in 1874, received ${crossoverYear}`);
  invariant(crisisPeak.year === 1932, `Crisis peak must be in 1932, received ${crisisPeak.year}`);
  assertClose(crisisPeak.frequencyPerMillion, 43.33, "1932 depression value");
  assertClose(postwarOneMean, 13.33, "1940–1959 mean");
  assertClose(postwarTwoMean, 11.1, "1960–1979 mean");
  invariant(majorSustainedYear === 1983 && disorderSustainedYear === 1983, "1983 diagnostic threshold logic changed");
  assertClose(depression2010s, 23.03, "2010s depression mean");
  assertClose(anxiety2010s, 26.15, "2010s anxiety mean");
  assertClose(depression2022, 22.86, "2022 depression value");
  assertClose(anxiety2022, 32.34, "2022 anxiety value");
  assertRotaryInterlude(rotaryInterlude);

  return {
    schemaVersion: "2.1.0",
    generatedAt: frequency.generatedAt,
    title: "depression",
    thesis: "A shared spelling moves through several kinds of descent. Its largest book-frequency peak belongs to an economic crisis period, not to a clinical count.",
    closingFinding: "This is not one straight path from sadness to sickness. Depression is a branching word: mood, market, pressure, landscape, weather and diagnosis share its spelling without sharing one meaning.",
    chapters: [
      {
        id: "roots",
        order: 1,
        code: "01",
        periodLabel: "c.1400—1799",
        background: "#26375F",
        semanticLabel: "SEVERAL KINDS OF LOWERING",
        title: "A downward word before a reliable curve.",
        deck: "The early record locates several senses; it does not support a continuous frequency story.",
        visibleCaveat: "Lexical-source dates are sense-history anchors, not first-use claims or corpus rates.",
        summary: chart(
          "roots-summary", "anchors", [1400, 1905], "SIX LEXICAL ANCHORS",
          "Six secondary lexical-source anchors mark astronomical, emotional, physical, economic, meteorological and clinical branches from around 1400 to 1905.",
          "LEXICAL SOURCE · NOT FREQUENCY", "Anchor spacing is chronological only; it does not encode amount.",
          { attestations, annotations: attestations.map((item) => ({ year: item.year, label: item.label, detail: item.sense })) },
        ),
        detail: chart(
          "roots-detail", "anchors", [1400, 1905], "WHAT EACH DATE CAN SAY",
          "Each date is a secondary lexical-source anchor with a named semantic category and confidence state; none is shown as a first-use claim.",
          "SECONDARY SOURCE · STATUS", "These are retained secondary lexical records, not a comparable historical corpus.",
          { attestations, annotations: attestations.map((item) => ({ year: item.year, label: item.source.toUpperCase(), detail: `${item.label} · ${item.confidence} confidence` })) },
        ),
      },
      {
        id: "print",
        order: 2,
        code: "02",
        periodLabel: "1800—1873",
        background: "#1F6B5C",
        semanticLabel: "PRINT VISIBILITY",
        title: "A new word enters print; melancholy still leads.",
        deck: "Depression becomes continuously visible in books, but it is not yet the dominant historical neighbour for low mood.",
        visibleCaveat: "The comparison measures printed forms in one corpus, not interchangeable meanings.",
        summary: chart(
          "print-summary", "comparison-bars", [1800, 1873], "PERIOD AVERAGE",
          "From 1800 through 1873, depression averages 6.28 and melancholy 20.20 appearances per million corpus words; melancholy is about 3.2 times the depression rate.",
          "STAGE MEAN · / MILLION CORPUS WORDS", "Both bars share a zero baseline and the same denominator.",
          { metrics: [metric("DEPRESSION", "1800—1873 mean", printDepressionMean), metric("MELANCHOLY", "1800—1873 mean", printMelancholyMean)], yMaximum: 22 },
        ),
        detail: chart(
          "print-detail", "smoothed-lines", [1800, 1873], "THREE HISTORICAL NEIGHBORS",
          "Nine-year centered annual means keep depression below melancholy through this early print period; anxiety is shown as a distinct neighbouring term.",
          "9-YEAR MEAN · / MILLION CORPUS WORDS", "Melancholy and anxiety are comparative forms, not counted senses of depression.",
          { series: [smoothedChartSeries(depression, 1800, 1873, "#B64026"), smoothedChartSeries(melancholy, 1800, 1873, "#264C92"), smoothedChartSeries(anxiety, 1800, 1873, "#8A6114")], sharedDomain: true },
        ),
      },
      {
        id: "crossover",
        order: 3,
        code: "03",
        periodLabel: "1874—1928",
        background: "#8A4E16",
        semanticLabel: "A SHIFT IN VISIBILITY",
        title: "Depression crosses melancholy; market language gains weight.",
        deck: "Its printed visibility stays above melancholy from 1874 onward. That is a visibility crossover, not semantic replacement.",
        visibleCaveat: "A sustained frequency crossover is not evidence of a semantic replacement.",
        summary: chart(
          "crossover-summary", "crossover-lines", [1874, 1928], "A SUSTAINED CROSSOVER",
          "A nine-year centered average for depression stays above melancholy for twenty consecutive years beginning in 1874.",
          "9-YEAR MEAN · / MILLION CORPUS WORDS", "This compares forms in print, not the meanings of all uses.",
          { series: [smoothedChartSeries(depression, 1874, 1928, "#B64026"), smoothedChartSeries(melancholy, 1874, 1928, "#315F9A")], annotations: [{ year: crossoverYear, label: "1874", detail: "first year of the sustained visibility crossover" }], sharedDomain: true },
        ),
        detail: chart(
          "crossover-detail", "phrase-multiples", [1874, 1928], "MARKET PHRASES, SEPARATE BRANCH",
          "Business depression, financial depression and economic depression share one zero-to-3.5 scale from 1874 through 1928.",
          "RAW · / MILLION CORPUS WORDS · SHARED 0—3.5", "Phrase frequency is not an estimate of the share of meanings carried by the core word.",
          { series: [chartSeries(businessPhrase, 1874, 1928, "#A9472E"), chartSeries(financialPhrase, 1874, 1928, "#315F9A"), chartSeries(economicPhrase, 1874, 1928, "#7B631C")], sharedDomain: true, yMaximum: 3.5 },
        ),
      },
      {
        id: "crisis",
        order: 4,
        code: "04",
        periodLabel: "1929—1939",
        background: "#9D3025",
        semanticLabel: "ECONOMIC CRISIS",
        title: "1932: the highest peak is not a diagnosis.",
        deck: "The core word rises sharply during the Great Depression period alongside independent economic phrase series.",
        visibleCaveat: "Economic timing is contextual evidence, not proof that every book use is economic.",
        summary: chart(
          "crisis-summary", "lollipop", [1929, 1939], "THE HIGH POINT",
          "Depression reaches 43.33 appearances per million corpus words in 1932. All eleven raw annual values from 1929 through 1939 are shown.",
          "RAW · / MILLION CORPUS WORDS", "The lollipops share a zero baseline; 1932 is directly marked.",
          { metrics: [metric("1932", "depression peak", crisisPeak.frequencyPerMillion)], series: [chartSeries(depression, 1929, 1939, "#9D3025")], yMaximum: 45 },
        ),
        detail: chart(
          "crisis-detail", "crisis-multiples", [1929, 1939], "ECONOMIC PHRASES IN CONTEXT",
          "Economic, business and financial depression are separate low-scale phrase series. The NBER 1929–1933 contraction band is contextual, not causal proof.",
          "RAW · / MILLION CORPUS WORDS · SHARED 0—3.5", "The NBER event is shown beside phrase series; it does not classify individual book uses.",
          { series: [chartSeries(economicPhrase, 1929, 1939, "#9D3025"), chartSeries(businessPhrase, 1929, 1939, "#315F9A"), chartSeries(financialPhrase, 1929, 1939, "#7B631C")], sharedDomain: true, yMaximum: 3.5, events: [{ startYear: Number(greatDepression.peak.slice(0, 4)), endYear: Number(greatDepression.trough.slice(0, 4)), label: "NBER 1929–1933 CONTRACTION", role: "contextual economic event; not lexical evidence" }] },
        ),
      },
      {
        id: "plateau",
        order: 5,
        code: "05",
        periodLabel: "1940—1979",
        background: "#604B70",
        semanticLabel: "POST-CRISIS PLATFORM",
        title: "The peak recedes; diagnostic language stays marginal.",
        deck: "The broad word remains visible after the economic peak, while clinical labels have not yet formed a durable high-frequency band.",
        visibleCaveat: "A low phrase rate does not measure disease prevalence or diagnostic practice.",
        summary: chart(
          "plateau-summary", "plateau-bars", [1940, 1979], "TWO POST-CRISIS PLATFORMS",
          "Depression averages 13.33 appearances per million corpus words in 1940–1959 and 11.10 in 1960–1979.",
          "STAGE MEAN · / MILLION CORPUS WORDS", "Both platform bars share a zero baseline.",
          { metrics: [metric("1940—1959", "depression mean", postwarOneMean), metric("1960—1979", "depression mean", postwarTwoMean)], yMaximum: 16 },
        ),
        detail: chart(
          "plateau-detail", "clinical-multiples", [1940, 1979], "LABELS BEFORE THEIR LATER RISE",
          "Clinical depression, major depression and depressive disorder stay in much lower-frequency bands. A 0.1-per-million reference is marked separately on each scale.",
          "RAW · / MILLION CORPUS WORDS · SHARED 0—0.25", "These phrase rates do not project current diagnostic definitions back onto earlier decades.",
          { series: [chartSeries(clinicalPhrase, 1940, 1979, "#9D3025"), chartSeries(majorPhrase, 1940, 1979, "#315F9A"), chartSeries(disorderPhrase, 1940, 1979, "#7B631C")], annotations: [{ label: `${clinicalPostwarMean.toFixed(3)} / MILLION`, detail: "clinical depression 1940–1979 stage mean" }, { label: "0.1 / MILLION", detail: "shared reference threshold" }], sharedDomain: true, yMaximum: .25 },
        ),
      },
      {
        id: "labels",
        order: 6,
        code: "06",
        periodLabel: "1980—2022",
        background: "#315F66",
        semanticLabel: "DIAGNOSTIC BRANCHES",
        title: "Diagnostic labels rise; the shared word stays multiple.",
        deck: "Clinical phrases become more visible after the early 1980s. The core word still names more than diagnosis.",
        visibleCaveat: "Diagnostic phrase frequency is not a count of diagnoses, people or public-health prevalence.",
        summary: chart(
          "labels-summary", "diagnostic-multiples", [1980, 2022], "A DURABLE LABEL BAND",
          "Major depression and depressive disorder first remain above 0.1 appearances per million under the nine-year, five-consecutive-year rule in 1983. Clinical depression uses a 0.01 threshold because it does not cross 0.1 in that period.",
          "RAW · / MILLION CORPUS WORDS · SHARED 0—1.0", "Every dense annual mark represents a retained yearly value; threshold logic uses nine-year centered means.",
          { series: [chartSeries(clinicalPhrase, 1980, 2022, "#9D3025"), chartSeries(majorPhrase, 1980, 2022, "#315F9A"), chartSeries(disorderPhrase, 1980, 2022, "#7B631C")], annotations: [{ year: majorSustainedYear, label: "1983", detail: "major + disorder sustained above 0.1 / million" }, { year: clinicalSustainedYear, label: `${clinicalSustainedYear}`, detail: "clinical sustained above 0.01 / million" }], sharedDomain: true, yMaximum: 1 },
        ),
        detail: chart(
          "labels-detail", "modern-contrast", [1980, 2022], "A MODERN NEIGHBOUR, NOT A SYNONYM",
          "In the 2010s, depression averages 23.03 and anxiety 26.15 appearances per million corpus words. In 2022 they are 22.86 and 32.34 respectively.",
          "RAW · / MILLION CORPUS WORDS", "Anxiety is adjacent in this comparison, not a replacement or subset of depression.",
          { series: [chartSeries(depression, 1980, 2022, "#9D3025"), chartSeries(anxiety, 1980, 2022, "#315F9A")], metrics: [metric("2010s", "depression mean", depression2010s), metric("2010s", "anxiety mean", anxiety2010s), metric("2022", "depression", depression2022), metric("2022", "anxiety", anxiety2022)], sharedDomain: true },
        ),
      },
    ],
    rotaryInterlude,
    sources: [
      { label: frequency.source.label, url: frequency.source.urls[0] ?? "https://books.google.com/ngrams", use: "Annual English book-frequency series; stored fractions are converted to appearances per million corpus words." },
      { label: "Lexical-source attestation records", url: prehistory.records[0]?.sourceUrl ?? "https://www.etymonline.com/word/depression", use: "Sense-history anchors only; not a continuous corpus or first-use record." },
      { label: economic.nber.source, url: economic.nber.sourceUrl, use: "Economic event context only; not lexical frequency evidence." },
      { label: "MeSH / NCBI", url: clinical.meshDescriptors.find((descriptor) => descriptor.heading === "Depressive Disorder")?.sourceUrl ?? "https://www.ncbi.nlm.nih.gov/mesh/", use: "Controlled-vocabulary context only; not general-language frequency evidence." },
    ],
    methods: [
      "Every charted book rate is the stored annual Google Books Ngram fraction multiplied by 1,000,000. The source file is the English corpus, 1500–2022, with source smoothing set to zero.",
      "Period values are arithmetic means of every annual value in the labelled inclusive range. Raw annual plots remain unsmoothed unless the chart itself is labelled as a nine-year centered mean.",
      "The 1874 crossover requires depression to exceed melancholy on a nine-year centered average for twenty consecutive years. Modern thresholds require five consecutive years above the stated rate using the same centered mean.",
      "The 03A wheel compares business depression, financial depression and economic depression on one shared 0–3.5-per-million scale. Every phrase retains all 66 annual positions from 1874 through 1939.",
      "Economic-event dates and controlled-vocabulary dates are contextual layers. They are not normalized with book-frequency values and do not prove causal relationships.",
    ],
    caveats: [
      "A single depression frequency series is not sense-classified. No chart treats emotional, economic, physical or clinical senses as shares of one whole.",
      "Early Ngram values are sparse and potentially noisy. The first chapter therefore uses lexical anchors rather than a continuous early-frequency plot.",
      "Phrase frequency is not a count of diagnoses, people, disease prevalence, economic output or the share of meanings carried by the core word.",
    ],
    rights: [
      "Google Books Ngram Viewer data and all linked institutional sources remain subject to their own terms and attribution requirements.",
      "Words Over Time presents derived rates, small rendered excerpts of source metadata, and links for research navigation; it does not republish source corpora.",
    ],
  };
}

const payload = `${JSON.stringify(await buildResearch(), null, 2)}\n`;
const check = process.argv.includes("--check");

if (check) {
  const current = await readFile(OUTPUT, "utf8");
  if (current !== payload) throw new Error("depression_mobile_research.json is out of date; run data:depression:mobile");
  console.log("depression mobile research artifact is current and its invariants passed");
} else {
  await writeFile(OUTPUT, payload);
  console.log(`Wrote ${OUTPUT}`);
}
