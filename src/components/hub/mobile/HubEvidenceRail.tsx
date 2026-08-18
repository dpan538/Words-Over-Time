"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import type { HubMobileAnalysis } from "@/types/hubMobileAnalysis";
import {
  CLOUD_FORMS,
  LinkedCardPulse,
  useHubAtmosphereActions,
  useHubAtmosphereScene,
  type HubPalette,
} from "./HubAtmosphere";
import styles from "./mobile-hub.module.css";

const evidenceColors: HubPalette[] = [
  ["#f07143", "#6b7fe5", "#f0c84b"],
  ["#f1c84d", "#df6d9b", "#7288e7"],
  ["#ea6942", "#7ca873", "#6f7fe2"],
  ["#77a974", "#6e82e5", "#ef7550"],
  ["#697ae2", "#db6894", "#efc64a"],
];

export function HubEvidenceRail({ analysis }: { analysis: HubMobileAnalysis }) {
  const evidenceSectionRef = useHubAtmosphereScene("evidence");
  const { activate } = useHubAtmosphereActions();
  const railRef = useRef<HTMLDivElement>(null);
  const lastAtmosphereIndexRef = useRef(0);
  const pointerStartRef = useRef<{ x: number; y: number; scrollLeft: number; index: number; hadOpenPanel: boolean } | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const active = analysis.evidence[activeIndex] ?? analysis.evidence[0];

  const collapseOpenPanels = () => {
    railRef.current?.querySelectorAll<HTMLDetailsElement>("details[open]").forEach((panel) => {
      panel.open = false;
    });
  };

  useEffect(() => {
    railRef.current?.querySelectorAll<HTMLDetailsElement>("details[open]").forEach((panel) => {
      panel.open = false;
    });
  }, []);

  const triggerEvidenceAtmosphere = useCallback((index: number) => {
    activate({
      scene: "evidence",
      palette: evidenceColors[index % evidenceColors.length],
      form: index % CLOUD_FORMS.length,
      pulse: true,
    });
  }, [activate]);

  useEffect(() => {
    if (lastAtmosphereIndexRef.current === activeIndex) return;
    lastAtmosphereIndexRef.current = activeIndex;
    triggerEvidenceAtmosphere(activeIndex);
  }, [activeIndex, triggerEvidenceAtmosphere]);

  const syncActiveFromScroll = () => {
    const rail = railRef.current;
    if (!rail) return;
    if (pointerStartRef.current && Math.abs(rail.scrollLeft - pointerStartRef.current.scrollLeft) > 5) {
      collapseOpenPanels();
    }
    const panels = [...rail.querySelectorAll<HTMLElement>("[data-hub-evidence-panel]")];
    const railLeft = rail.getBoundingClientRect().left + Number.parseFloat(getComputedStyle(rail).paddingLeft);
    const next = panels.reduce((closest, panel, index) => {
      const distance = Math.abs(panel.getBoundingClientRect().left - railLeft);
      return distance < closest.distance ? { index, distance } : closest;
    }, { index: 0, distance: Number.POSITIVE_INFINITY }).index;
    setActiveIndex((current) => current === next ? current : next);
  };

  const moveToIndex = (next: number) => {
    const rail = railRef.current;
    const panel = rail?.querySelector<HTMLElement>(`[data-index="${next}"]`);
    collapseOpenPanels();
    if (rail && panel) {
      const left = panel.offsetLeft - Number.parseFloat(getComputedStyle(rail).paddingLeft);
      rail.scrollTo({ left, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    }
    setActiveIndex(next);
  };

  const move = (direction: -1 | 1) => {
    moveToIndex(Math.min(analysis.evidence.length - 1, Math.max(0, activeIndex + direction)));
  };

  const finishPointerGesture = (clientX: number, clientY: number) => {
    const start = pointerStartRef.current;
    pointerStartRef.current = null;
    if (!start?.hadOpenPanel) return;
    const deltaX = clientX - start.x;
    const deltaY = clientY - start.y;
    if (Math.abs(deltaX) <= 24 || Math.abs(deltaX) <= Math.abs(deltaY)) return;
    const direction = deltaX < 0 ? 1 : -1;
    moveToIndex(Math.min(analysis.evidence.length - 1, Math.max(0, start.index + direction)));
  };

  return (
    <section ref={evidenceSectionRef} className={styles.evidenceSection} data-surface-category="cards" aria-labelledby="hub-evidence-title">
      <header className={styles.evidenceHeader}>
        <div>
          <p>03 / FIRST EVIDENCE</p>
          <h2 id="hub-evidence-title">The metaphor arrived early.</h2>
          <span aria-live="polite">{active.year} / {active.term} — {active.senseLabel}</span>
        </div>
        <div className={styles.railControls} aria-label="Evidence controls">
          <button type="button" onClick={() => move(-1)} disabled={activeIndex === 0} aria-label="Previous evidence">←</button>
          <button type="button" onClick={() => move(1)} disabled={activeIndex === analysis.evidence.length - 1} aria-label="Next evidence">→</button>
        </div>
      </header>
      <div
        className={styles.evidenceRail}
        ref={railRef}
        data-hub-rail="evidence"
        onScroll={syncActiveFromScroll}
        onPointerDown={(event) => {
          pointerStartRef.current = {
            x: event.clientX,
            y: event.clientY,
            scrollLeft: event.currentTarget.scrollLeft,
            index: activeIndex,
            hadOpenPanel: Boolean(event.currentTarget.querySelector("details[open]")),
          };
        }}
        onPointerMove={(event) => {
          const start = pointerStartRef.current;
          if (!start) return;
          const deltaX = Math.abs(event.clientX - start.x);
          const deltaY = Math.abs(event.clientY - start.y);
          if (deltaX > 7 && deltaX > deltaY) collapseOpenPanels();
        }}
        onPointerUp={(event) => finishPointerGesture(event.clientX, event.clientY)}
        onPointerCancel={(event) => finishPointerGesture(event.clientX, event.clientY)}
        onWheel={(event) => {
          if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) collapseOpenPanels();
        }}
      >
        {analysis.evidence.map((evidence, index) => {
          const firstYear = analysis.evidence[0].year;
          const lastYear = analysis.evidence.at(-1)!.year;
          const position = ((evidence.year - firstYear) / (lastYear - firstYear)) * 100;
          return (
            <details
              className={styles.evidencePanel}
              key={evidence.id}
              suppressHydrationWarning
              data-hub-evidence-panel
              data-index={index}
              data-active={activeIndex === index}
              style={{ "--panel-accent": evidenceColors[index][0] } as CSSProperties}
            >
              <LinkedCardPulse
                active={activeIndex === index}
                itemKey={evidence.id}
                palette={evidenceColors[index]}
              />
              <summary onClick={() => {
                if (index === activeIndex) triggerEvidenceAtmosphere(index);
                else moveToIndex(index);
              }}>
                <span className={styles.evidenceKind}>{evidence.evidenceKind.replaceAll("_", " ")}</span>
                <span className={styles.expandAction} aria-hidden="true">+</span>
                <strong className={styles.evidenceYear}>{evidence.year}</strong>
                <span className={styles.evidenceTerm}>{evidence.term}</span>
                <span className={styles.evidenceFinding}>{evidence.senseLabel}</span>
                <span className={styles.evidenceTimeline} role="img" aria-label={`${evidence.year} on the evidence sequence from ${firstYear} to ${lastYear}`}>
                  <i /><b style={{ left: `${position}%` }} />
                  <small>{firstYear}</small><small>{lastYear}</small>
                </span>
                <span className={styles.openEvidence}>OPEN EVIDENCE</span>
              </summary>
              <div className={styles.evidenceDetails}>
                <p>{evidence.summary}</p>
                <dl>
                  <div><dt>CONFIDENCE</dt><dd>{evidence.confidence}</dd></div>
                  <div><dt>LIMIT</dt><dd>{evidence.caveat}</dd></div>
                  <div><dt>SOURCE</dt><dd>{evidence.sourceTitle}</dd></div>
                </dl>
                <a href={evidence.sourceUrl} target="_blank" rel="noreferrer">OPEN SOURCE ↗</a>
              </div>
            </details>
          );
        })}
      </div>
      <p className={styles.swipeCue}>SWIPE · {activeIndex + 1} / {analysis.evidence.length} · NEXT ENTRY REMAINS VISIBLE</p>
    </section>
  );
}
