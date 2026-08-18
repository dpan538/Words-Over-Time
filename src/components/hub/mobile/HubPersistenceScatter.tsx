"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { HubFamilyId, HubMobileAnalysis } from "@/types/hubMobileAnalysis";
import { CLOUD_FORMS, useHubAtmosphereActions, useHubAtmosphereScene } from "./HubAtmosphere";
import { frequencyLabel } from "./HubLinePlot";
import styles from "./mobile-hub.module.css";

const labelledTerms = new Set(["wheel hub", "commercial hub", "transport hub", "network hub", "data hub", "Ethernet hub"]);

function signedLabel(value: number) {
  if (value === 0) return "0";
  return `${value > 0 ? "+" : "−"}${frequencyLabel(Math.abs(value))}`;
}

function PointGlyph({ familyId, x, y, color }: { familyId: HubFamilyId; x: number; y: number; color: string }) {
  if (familyId === "central_place") return <rect x={x - 4} y={y - 4} width="8" height="8" rx="1" fill={color} stroke="#111018" strokeWidth="1.2" />;
  if (familyId === "transport_routing") return <polygon points={`${x},${y - 5} ${x + 5},${y} ${x},${y + 5} ${x - 5},${y}`} fill={color} stroke="#111018" strokeWidth="1.2" />;
  if (familyId === "institutional_cluster") return <polygon points={`${x},${y - 5} ${x + 5},${y + 4} ${x - 5},${y + 4}`} fill={color} stroke="#111018" strokeWidth="1.2" />;
  if (familyId === "network_system") return <circle cx={x} cy={y} r="4.5" fill="#f5eddb" stroke={color} strokeWidth="2.6" />;
  if (familyId === "digital_platform") return <path d={`M${x - 5} ${y}H${x + 5}M${x} ${y - 5}V${y + 5}`} stroke={color} strokeWidth="2.7" />;
  return <circle cx={x} cy={y} r="4.5" fill={color} stroke="#111018" strokeWidth="1.2" />;
}

export function HubPersistenceScatter({ analysis }: { analysis: HubMobileAnalysis }) {
  const scatterSectionRef = useHubAtmosphereScene("scatter");
  const { activate } = useHubAtmosphereActions();
  const selectionRailRef = useRef<HTMLDivElement>(null);
  const swipeStartRef = useRef<{ x: number; index: number } | null>(null);
  const swipeLockRef = useRef(false);
  const swipeUnlockTimerRef = useRef<number | null>(null);
  const [familyFilter, setFamilyFilter] = useState<HubFamilyId | "all">("all");
  const [selectedTerm, setSelectedTerm] = useState("transport hub");
  const selectedTermRef = useRef("transport hub");
  const familyById = useMemo(() => new Map(analysis.families.map((family) => [family.id, family])), [analysis.families]);
  const visiblePhrases = familyFilter === "all" ? analysis.phrases : analysis.phrases.filter((phrase) => phrase.familyId === familyFilter);
  const selected = analysis.phrases.find((phrase) => phrase.term === selectedTerm) ?? visiblePhrases[0] ?? analysis.phrases[0];
  const rawMin = Math.min(...analysis.phrases.map((phrase) => phrase.changeFrom1980sPerMillion));
  const rawMax = Math.max(...analysis.phrases.map((phrase) => phrase.changeFrom1980sPerMillion));
  const padding = Math.max((rawMax - rawMin) * .1, .001);
  const minY = rawMin - padding;
  const maxY = rawMax + padding;
  const plot = { left: 60, right: 338, top: 60, bottom: 388 };
  const x = (value: number) => plot.left + (value / 6) * (plot.right - plot.left);
  const y = (value: number) => plot.bottom - ((value - minY) / (maxY - minY)) * (plot.bottom - plot.top);
  const zeroY = y(0);
  const yTicks = Array.from({ length: 5 }, (_, index) => minY + ((maxY - minY) / 4) * index);
  const before = selected.periods.find((period) => period.periodId === "1980_1999")!.meanFrequencyPerMillion;
  const after = selected.periods.find((period) => period.periodId === "2000_2019")!.meanFrequencyPerMillion;
  const selectedVisibleIndex = Math.max(0, visiblePhrases.findIndex((phrase) => phrase.term === selected.term));
  const activateScatterPhrase = (phrase: HubMobileAnalysis["phrases"][number]) => {
    const phraseFamily = familyById.get(phrase.familyId) ?? analysis.families[0];
    const phraseIndex = analysis.phrases.findIndex((item) => item.term === phrase.term);
    activate({
      scene: "scatter",
      palette: [phraseFamily.color, "#7184df", "#92bd78"],
      form: Math.max(0, phraseIndex) % CLOUD_FORMS.length,
      pulse: true,
    });
  };

  const commitSelectedPhrase = (phrase: HubMobileAnalysis["phrases"][number], pulse = true) => {
    const changed = selectedTermRef.current !== phrase.term;
    selectedTermRef.current = phrase.term;
    if (changed) setSelectedTerm(phrase.term);
    if (pulse) activateScatterPhrase(phrase);
  };

  useEffect(() => {
    const rail = selectionRailRef.current;
    const initialIndex = analysis.phrases.findIndex((phrase) => phrase.term === "transport hub");
    const slide = rail?.querySelector<HTMLElement>(`[data-index="${initialIndex}"]`);
    if (!rail || !slide || initialIndex < 0) return;
    const left = slide.offsetLeft - Number.parseFloat(getComputedStyle(rail).paddingLeft);
    rail.scrollTo({ left, behavior: "auto" });
  }, [analysis.phrases]);

  useEffect(() => () => {
    if (swipeUnlockTimerRef.current !== null) window.clearTimeout(swipeUnlockTimerRef.current);
  }, []);

  const chooseFilter = (nextFilter: HubFamilyId | "all") => {
    const nextPhrases = nextFilter === "all" ? analysis.phrases : analysis.phrases.filter((phrase) => phrase.familyId === nextFilter);
    if (swipeUnlockTimerRef.current !== null) window.clearTimeout(swipeUnlockTimerRef.current);
    swipeLockRef.current = false;
    swipeStartRef.current = null;
    setFamilyFilter(nextFilter);
    const nextPhrase = nextPhrases[0] ?? analysis.phrases[0];
    commitSelectedPhrase(nextPhrase);
    requestAnimationFrame(() => selectionRailRef.current?.scrollTo({ left: 0, behavior: "auto" }));
  };

  const syncSelectedFromSwipe = () => {
    const rail = selectionRailRef.current;
    if (!rail || swipeLockRef.current || swipeStartRef.current) return;
    const slides = [...rail.querySelectorAll<HTMLElement>("[data-scatter-selection]")];
    const railLeft = rail.getBoundingClientRect().left + Number.parseFloat(getComputedStyle(rail).paddingLeft);
    const next = slides.reduce((closest, slide, index) => {
      const distance = Math.abs(slide.getBoundingClientRect().left - railLeft);
      return distance < closest.distance ? { index, distance } : closest;
    }, { index: 0, distance: Number.POSITIVE_INFINITY }).index;
    const phrase = visiblePhrases[next];
    if (phrase && phrase.term !== selectedTermRef.current) commitSelectedPhrase(phrase);
  };

  const selectVisiblePhrase = (index: number, behavior?: ScrollBehavior) => {
    const phrase = visiblePhrases[index];
    const rail = selectionRailRef.current;
    const slide = rail?.querySelector<HTMLElement>(`[data-index="${index}"]`);
    if (!phrase) return;
    commitSelectedPhrase(phrase);
    if (rail && slide) {
      const left = slide.offsetLeft - Number.parseFloat(getComputedStyle(rail).paddingLeft);
      rail.scrollTo({ left, behavior: behavior ?? (window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth") });
    }
  };

  const finishSingleStepSwipe = (clientX: number) => {
    const start = swipeStartRef.current;
    swipeStartRef.current = null;
    if (!start) return;
    const delta = clientX - start.x;
    const direction = delta < -24 ? 1 : delta > 24 ? -1 : 0;
    const next = Math.min(visiblePhrases.length - 1, Math.max(0, start.index + direction));
    swipeLockRef.current = true;
    selectVisiblePhrase(next);
    if (swipeUnlockTimerRef.current !== null) window.clearTimeout(swipeUnlockTimerRef.current);
    swipeUnlockTimerRef.current = window.setTimeout(() => {
      selectVisiblePhrase(next, "auto");
      swipeLockRef.current = false;
    }, 460);
  };

  return (
    <section ref={scatterSectionRef} className={`${styles.reportSection} ${styles.scatterSection}`} data-surface-category="visualization" aria-labelledby="hub-scatter-title">
      <header className={styles.sectionHeader}>
        <p>05 / PERSISTENCE × CHANGE</p>
        <h2 id="hub-scatter-title">New hubs rise. Enduring hubs divide.</h2>
        <span>Persistence counts visible periods; vertical change compares the final two twenty-year periods.</span>
      </header>
      <div className={styles.familyFilter} aria-label="Filter phrases by semantic family">
        <button type="button" aria-pressed={familyFilter === "all"} data-active={familyFilter === "all"} onClick={() => chooseFilter("all")}>ALL</button>
        {analysis.families.map((family) => (
          <button
            key={family.id}
            type="button"
            aria-pressed={familyFilter === family.id}
            data-active={familyFilter === family.id}
            onClick={() => chooseFilter(family.id)}
          ><i style={{ background: family.color }} />{family.label}</button>
        ))}
      </div>
      <figure className={styles.scatterFigure}>
        <svg viewBox="0 0 390 460" role="img" aria-label="Selected hub phrases plotted by number of visible periods and change in occurrences per million from 1980–1999 to 2000–2019.">
          <rect className={styles.quadrantNewRise} x={plot.left} y={plot.top} width={x(3) - plot.left} height={zeroY - plot.top} />
          <rect className={styles.quadrantEnduringRise} x={x(3)} y={plot.top} width={plot.right - x(3)} height={zeroY - plot.top} />
          <rect className={styles.quadrantNewFall} x={plot.left} y={zeroY} width={x(3) - plot.left} height={plot.bottom - zeroY} />
          <rect className={styles.quadrantEnduringFall} x={x(3)} y={zeroY} width={plot.right - x(3)} height={plot.bottom - zeroY} />
          {yTicks.map((tick) => <line key={tick} className={styles.scatterGridLine} x1={plot.left} x2={plot.right} y1={y(tick)} y2={y(tick)} />)}
          {[0, 1, 2, 3, 4, 5, 6].map((tick) => <line key={tick} className={styles.scatterGridLine} x1={x(tick)} x2={x(tick)} y1={plot.top} y2={plot.bottom} />)}
          <line className={styles.scatterZero} x1={plot.left} x2={plot.right} y1={zeroY} y2={zeroY} />
          <line className={styles.scatterAxis} x1={plot.left} x2={plot.left} y1={plot.top} y2={plot.bottom} />
          <line className={styles.scatterAxis} x1={plot.left} x2={plot.right} y1={plot.bottom} y2={plot.bottom} />
          <text className={styles.quadrantLabel} x={plot.left + 8} y={plot.top + 18}>NEW / RISING</text>
          <text className={styles.quadrantLabel} x={x(3) + 8} y={plot.top + 18}>ENDURING / RISING</text>
          <text className={styles.quadrantLabel} x={plot.left + 8} y={plot.bottom - 10}>NEW / FALLING</text>
          <text className={styles.quadrantLabel} x={x(3) + 8} y={plot.bottom - 10}>ENDURING / FALLING</text>
          {yTicks.map((tick) => <text key={tick} className={styles.scatterTick} x={plot.left - 8} y={y(tick) + 4} textAnchor="end">{signedLabel(tick)}</text>)}
          {[0, 1, 2, 3, 4, 5, 6].map((tick) => <text key={tick} className={styles.scatterTick} x={x(tick)} y={plot.bottom + 21} textAnchor="middle">{tick}</text>)}
          <text className={styles.scatterUnit} x={plot.left} y="16">CHANGE / OCCURRENCES PER MILLION</text>
          <text className={styles.scatterUnit} x={(plot.left + plot.right) / 2} y="444" textAnchor="middle">VISIBLE TWENTY-YEAR PERIODS</text>
          {visiblePhrases.map((phrase) => {
            const pointX = x(phrase.persistencePeriodCount);
            const pointY = y(phrase.changeFrom1980sPerMillion);
            const family = familyById.get(phrase.familyId)!;
            const isSelected = selected.term === phrase.term;
            return (
              <g key={phrase.term} data-selected={isSelected} className={styles.scatterPoint}>
                {isSelected ? <circle cx={pointX} cy={pointY} r="10" fill="none" stroke="#111018" strokeWidth="1.4" /> : null}
                <PointGlyph familyId={phrase.familyId} x={pointX} y={pointY} color={family.color} />
                {(labelledTerms.has(phrase.term) || isSelected) ? <text className={styles.scatterPointLabel} x={pointX > 270 ? pointX - 8 : pointX + 8} y={pointY < plot.top + 38 ? pointY + 20 : pointY - 7} textAnchor={pointX > 270 ? "end" : "start"}>{phrase.term}</text> : null}
              </g>
            );
          })}
        </svg>
        <figcaption>MEASURE / x: periods at or above the visibility threshold · y: 2000–19 mean minus 1980–99 mean, occurrences per million.</figcaption>
      </figure>
      <div className={styles.scatterReadout}>
        <div
          className={styles.scatterSelectionRail}
          ref={selectionRailRef}
          onScroll={syncSelectedFromSwipe}
          onPointerDown={(event) => {
            if (!swipeLockRef.current) swipeStartRef.current = { x: event.clientX, index: selectedVisibleIndex };
          }}
          onPointerUp={(event) => finishSingleStepSwipe(event.clientX)}
          onPointerCancel={(event) => finishSingleStepSwipe(event.clientX)}
          aria-label="Swipe through plotted phrases"
        >
          {visiblePhrases.map((phrase, index) => {
            const phraseFamily = familyById.get(phrase.familyId)!;
            return (
              <button
                type="button"
                key={phrase.term}
                data-scatter-selection
                data-index={index}
                data-active={selected.term === phrase.term}
                aria-pressed={selected.term === phrase.term}
                tabIndex={selected.term === phrase.term ? 0 : -1}
                onClick={() => {
                  if (!swipeLockRef.current) selectVisiblePhrase(index);
                }}
                onKeyDown={(event) => {
                  if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
                  event.preventDefault();
                  const direction = event.key === "ArrowRight" ? 1 : -1;
                  const next = Math.min(visiblePhrases.length - 1, Math.max(0, index + direction));
                  selectVisiblePhrase(next);
                  requestAnimationFrame(() => {
                    selectionRailRef.current?.querySelector<HTMLButtonElement>(`[data-index="${next}"]`)?.focus();
                  });
                }}
              >
                <span><i style={{ background: phraseFamily.color }} />{phraseFamily.label}</span>
                <strong>{phrase.term}</strong>
              </button>
            );
          })}
        </div>
        <p className={styles.scatterSwipeCue}>SWIPE PHRASES · {selectedVisibleIndex + 1} / {visiblePhrases.length}</p>
        <dl aria-live="polite">
          <div><dt>PERSISTENCE</dt><dd>{selected.persistencePeriodCount} / 6 periods</dd></div>
          <div><dt>1980–99</dt><dd>{frequencyLabel(before)}</dd></div>
          <div><dt>2000–19</dt><dd>{frequencyLabel(after)}</dd></div>
          <div><dt>CHANGE</dt><dd>{signedLabel(selected.changeFrom1980sPerMillion)}</dd></div>
        </dl>
      </div>
      <details className={styles.methodFold}>
        <summary>METHOD AND LIMITS <span aria-hidden="true">+</span></summary>
        <p>The y-domain is calculated from the observed minimum and maximum changes with ten percent padding. Equal-size points preserve frequency comparisons; colour and glyph shape redundantly identify families. A phrase can be absent because it remained below the selected threshold, not because no historical use existed.</p>
      </details>
    </section>
  );
}
