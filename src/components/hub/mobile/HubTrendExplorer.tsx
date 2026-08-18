"use client";

import { useMemo, useState } from "react";
import type { HubFamilyId, HubMobileAnalysis } from "@/types/hubMobileAnalysis";
import { CLOUD_FORMS, useHubAtmosphereActions, useHubAtmosphereScene } from "./HubAtmosphere";
import { frequencyLabel, HubLinePlot, niceCeiling, type HubLineSeries } from "./HubLinePlot";
import styles from "./mobile-hub.module.css";

export function HubTrendExplorer({ analysis }: { analysis: HubMobileAnalysis }) {
  const trendSectionRef = useHubAtmosphereScene("trend");
  const { activate } = useHubAtmosphereActions();
  const [activeId, setActiveId] = useState<HubFamilyId>("mechanical_core");
  const active = analysis.families.find((family) => family.id === activeId) ?? analysis.families[0];
  const series = useMemo<HubLineSeries[]>(() => analysis.families.map((family) => ({
    id: family.id,
    label: family.label,
    color: family.color,
    values: family.periods.map((period) => ({ periodId: period.periodId, value: period.meanFrequencyPerMillion })),
  })), [analysis.families]);
  const maxValue = niceCeiling(Math.max(...series.flatMap((line) => line.values.map((point) => point.value))));
  const values = active.periods.map((period) => period.meanFrequencyPerMillion);
  const peak = Math.max(...values);
  const peakIndex = values.indexOf(peak);
  const rising = values.at(-1)! > values[0];

  const selectFamily = (familyId: HubFamilyId) => {
    const familyIndex = analysis.families.findIndex((family) => family.id === familyId);
    const family = analysis.families[familyIndex];
    setActiveId(familyId);
    activate({
      scene: "trend",
      palette: [family.color, "#858fe4", "#edbd61"],
      form: familyIndex % CLOUD_FORMS.length,
      pulse: true,
    });
  };

  return (
    <section ref={trendSectionRef} className={`${styles.reportSection} ${styles.trendSection}`} data-surface-category="visualization" aria-labelledby="hub-trend-title">
      <header className={styles.sectionHeader}>
        <p>02 / CHANGE OVER TIME</p>
        <h2 id="hub-trend-title">The wheel recedes. Systems accumulate.</h2>
        <span>Six selected semantic families share one frequency scale, so their magnitudes remain comparable.</span>
      </header>
      <div className={styles.trendReadout} aria-live="polite">
        <p><i style={{ background: active.color }} />ACTIVE FAMILY</p>
        <strong>{active.label}</strong>
        <span>{rising ? "Higher" : "Lower"} in 2000–19 than in 1900–19 · peak {frequencyLabel(peak)} in {analysis.periods[peakIndex].label}</span>
      </div>
      <div className={styles.familySelectors} aria-label="Select semantic family">
        {analysis.families.map((family) => (
          <button
            key={family.id}
            type="button"
            aria-pressed={activeId === family.id}
            data-active={activeId === family.id}
            onClick={() => selectFamily(family.id)}
          >
            <i style={{ background: family.color }} />{family.label}
          </button>
        ))}
      </div>
      <figure className={`${styles.primaryFigure} ${styles.trendFigure}`}>
        <HubLinePlot
          series={series}
          activeId={activeId}
          maxValue={maxValue}
          periodLabels={analysis.periods}
          ariaLabel="Six family means across six twenty-year periods on a shared occurrences-per-million scale. The selected family is emphasized."
        />
        <figcaption>MEASURE / arithmetic mean of the selected phrases in each family, occurrences per million printed-book tokens.</figcaption>
      </figure>
      <details className={styles.methodFold}>
        <summary>METHOD AND LIMITS <span aria-hidden="true">+</span></summary>
        <p>Each point averages the selected phrases assigned to that family within a twenty-year period. The shared linear scale compares magnitude as well as direction. These are unsmoothed Google Books Ngram frequency signals, not population usage rates or evidence of a single cause.</p>
      </details>
    </section>
  );
}
