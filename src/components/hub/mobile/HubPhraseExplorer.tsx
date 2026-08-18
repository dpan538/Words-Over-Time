"use client";

import { useMemo, useState } from "react";
import type { HubMobileAnalysis } from "@/types/hubMobileAnalysis";
import { CLOUD_FORMS, useHubAtmosphereActions, useHubAtmosphereScene } from "./HubAtmosphere";
import { frequencyLabel, HubLinePlot, niceCeiling, type HubLineSeries } from "./HubLinePlot";
import styles from "./mobile-hub.module.css";

const phraseOrder = ["wheel hub", "commercial hub", "transport hub", "network hub", "financial hub", "data hub"];

function trajectorySummary(values: number[]) {
  const first = values[0];
  const last = values.at(-1)!;
  const peak = Math.max(...values);
  const peakIndex = values.indexOf(peak);
  if (last < first) return "The series begins highest and ends lower, while remaining visible in the final period.";
  if (peakIndex === values.length - 1) return "The series reaches its highest selected-period mean in 2000–19.";
  return `The series peaks before the final period, then ends ${last > first ? "above" : "below"} its 1900–19 mean.`;
}

export function HubPhraseExplorer({ analysis }: { analysis: HubMobileAnalysis }) {
  const phraseSectionRef = useHubAtmosphereScene("phrase");
  const { activate } = useHubAtmosphereActions();
  const featured = useMemo(() => analysis.phrases.filter((phrase) => phrase.featured).sort((a, b) => phraseOrder.indexOf(a.term) - phraseOrder.indexOf(b.term)), [analysis.phrases]);
  const [activeTerm, setActiveTerm] = useState(featured[0].term);
  const [mode, setMode] = useState<"absolute" | "shape">("absolute");
  const [selectedPoint, setSelectedPoint] = useState(5);
  const active = featured.find((phrase) => phrase.term === activeTerm) ?? featured[0];
  const family = analysis.families.find((entry) => entry.id === active.familyId)!;
  const values = active.periods.map((period) => period.meanFrequencyPerMillion);
  const peak = Math.max(...values);
  const peakIndex = values.indexOf(peak);
  const absoluteMax = niceCeiling(Math.max(...featured.flatMap((phrase) => phrase.periods.map((period) => period.meanFrequencyPerMillion))));
  const displayValues = mode === "shape" ? values.map((value) => peak === 0 ? 0 : (value / peak) * 100) : values;
  const series: HubLineSeries[] = [{
    id: active.term,
    label: active.term,
    color: family.color,
    values: active.periods.map((period, index) => ({ periodId: period.periodId, value: displayValues[index] })),
  }];
  const selectedValue = values[selectedPoint] ?? values.at(-1)!;

  const selectPhrase = (term: string) => {
    const phraseIndex = featured.findIndex((phrase) => phrase.term === term);
    const phrase = featured[phraseIndex];
    const phraseFamily = analysis.families.find((entry) => entry.id === phrase.familyId)!;
    setActiveTerm(term);
    setSelectedPoint(5);
    activate({
      scene: "phrase",
      palette: [phraseFamily.color, "#818be1", "#e9b964"],
      form: phraseIndex % CLOUD_FORMS.length,
      pulse: true,
    });
  };

  return (
    <section ref={phraseSectionRef} className={`${styles.phraseSection} ${styles.phraseExplorerSection}`} data-surface-category="visualization" aria-labelledby="hub-phrases-title">
      <header className={styles.sectionHeader}>
        <p>06 / PHRASE EXPLORER</p>
        <h2 id="hub-phrases-title">Watch the center change what it gathers.</h2>
        <span>Select one representative phrase, then compare magnitude or trajectory shape.</span>
      </header>
      <div className={styles.phraseSelectors} role="tablist" aria-label="Representative phrases">
        {featured.map((phrase) => (
          <button
            key={phrase.term}
            type="button"
            role="tab"
            aria-selected={active.term === phrase.term}
            data-active={active.term === phrase.term}
            onClick={() => selectPhrase(phrase.term)}
          >{phrase.term}</button>
        ))}
      </div>
      <div className={styles.phraseReadout} aria-live="polite">
        <p><i style={{ background: family.color }} />{family.label}</p>
        <strong>{active.term}</strong>
        <span>{trajectorySummary(values)}</span>
      </div>
      <div className={styles.scaleSwitch} aria-label="Chart scale">
        <button type="button" aria-pressed={mode === "absolute"} data-active={mode === "absolute"} onClick={() => setMode("absolute")}>ABSOLUTE</button>
        <button type="button" aria-pressed={mode === "shape"} data-active={mode === "shape"} onClick={() => setMode("shape")}>SHAPE</button>
      </div>
      {mode === "shape" ? <p className={styles.shapeWarning}>SHAPE MODE / each phrase peak = 100. Absolute magnitudes cannot be compared in this view.</p> : null}
      <figure className={`${styles.primaryFigure} ${styles.phrasePlot}`}>
        <HubLinePlot
          series={series}
          activeId={active.term}
          maxValue={mode === "shape" ? 100 : absoluteMax}
          periodLabels={analysis.periods}
          selectedPoint={selectedPoint}
          onSelectPoint={setSelectedPoint}
          normalized={mode === "shape"}
          ariaLabel={`${active.term} across six periods in ${mode} scale.`}
        />
        <figcaption>MEASURE / twenty-year arithmetic mean, occurrences per million{mode === "shape" ? "; displayed as a peak-indexed trajectory" : " on one shared phrase scale"}.</figcaption>
      </figure>
      <dl className={styles.phraseStats}>
        <div><dt>FIRST</dt><dd>{frequencyLabel(values[0])}</dd></div>
        <div><dt>PEAK</dt><dd>{frequencyLabel(peak)}<small>{analysis.periods[peakIndex].shortLabel}</small></dd></div>
        <div><dt>LATEST</dt><dd>{frequencyLabel(values.at(-1)!)}</dd></div>
        <div><dt>SELECTED</dt><dd>{frequencyLabel(selectedValue)}<small>{analysis.periods[selectedPoint]?.shortLabel}</small></dd></div>
      </dl>
      <details className={styles.methodFold}>
        <summary>METHOD AND LIMITS <span aria-hidden="true">+</span></summary>
        <p>Absolute mode uses one shared scale across the six featured phrases. Shape mode divides each value by that phrase’s own selected-period peak and is only for comparing trajectory form. Neither mode measures total English usage or establishes why a phrase changed.</p>
      </details>
    </section>
  );
}
