"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
  type ReactNode,
} from "react";
import { animate as animateValue, motion } from "motion/react";
import { artificialMobileTimeStudy as timeStudy } from "@/data/artificialMobileTimeStudy";
import { IMMEDIATE_FEEDBACK_SECONDS, motionTime } from "./ArtificialMotionTiming";
import { NebulaCanvas, useArtificialEntrance } from "./ArtificialVisualizationMotion";
import styles from "./mobile-artificial.module.css";

type Point3D = { x: number; y: number; z: number };

export type CompoundTreeLeaf = Point3D & { id: string; label: string; ringIndex: number; sequence: number };

export type CompoundTreeBranch = {
  domainIndex: number;
  hub: Point3D;
  id: string;
  label: string;
  leaves: CompoundTreeLeaf[];
};

export type HumanEvidenceExample = {
  id: string;
  term: string;
  layerNumber: number;
  functionMode: "support" | "replacement" | "continuation" | "simulation" | "speculative_extension";
  currentRelevance: "modern_established" | "modern_emerging" | "historical" | "speculative";
  confidence: "high" | "medium";
  sourceName: string;
  sourceType: string;
  sourceUrl: string;
  yearOrPeriod: string;
  evidenceKind: string;
  shortSummary: string;
};

export type EvidenceOrbit = {
  examples: readonly HumanEvidenceExample[];
  id: string;
  label: string;
  layerIndex: number;
  phase: number;
  radius: number;
  rotation: number;
  tilt: number;
};

export type MediaTermGroup = {
  count: number;
  id: string;
  label: string;
  terms: readonly string[];
};

export type ResearchCoverage = {
  selectedTermCount: number;
  retainedTermYearCellCount: number;
  compoundTermCount: number;
  compoundTermYearCellCount: number;
  compoundYearCoverage: { start: number; end: number };
  mediaTermCount: number;
  mediaTermYearCellCount: number;
  mediaYearCoverage: { start: number; end: number };
  unit: string;
};

export type SemanticMobilityView = {
  id: string;
  relationFamily: "artificial_vs_fake" | "realistic_bridge" | "simulated_context";
  axisLabel: string;
  title: string;
  summary: string;
  sourceName: string;
  sourceType: string;
  sourceUrl: string;
  yearOrPeriod: string;
};

type InteractiveMovementHeadingProps = {
  id: string;
  index: string;
  title: string;
};

export function InteractiveStudyTitle({ id, title }: { id: string; title: string }) {
  return (
    <div className={styles.studyTitleEntity}>
      <h1 id={id}>{title}</h1>
    </div>
  );
}

type RotatableGeometryFrameProps = {
  children: (yaw: number, viewIndex: number) => ReactNode;
  className?: string;
  initialViewIndex?: number;
  label: string;
  onViewChange?: (index: number) => void;
  viewNoun: string;
  views: readonly CuratedGeometryView[];
};

type CuratedGeometryView = {
  label: string;
  summary: string;
  sourceName?: string;
  sourceUrl?: string;
  yearOrPeriod?: string;
  yaw: number;
};

const GESTURE_THRESHOLD = 10;
const SAFARI_EDGE_GUTTER = 24;
const TREE_ORIGINAL_VIEWBOX_HEIGHT = 175;
const TREE_VIEWBOX_HEIGHT = 133;
const TREE_DRAWABLE_TOP = 5;

type GestureAxis = "idle" | "pending" | "rotating" | "scrolling" | "cancelled";

const functionLabels: Record<HumanEvidenceExample["functionMode"], string> = {
  support: "bodily support",
  replacement: "functional replacement",
  continuation: "reproductive continuation",
  simulation: "modeled process",
  speculative_extension: "speculative extension",
};

const relevanceLabels: Record<HumanEvidenceExample["currentRelevance"], string> = {
  modern_established: "used now",
  modern_emerging: "emerging now",
  historical: "historical",
  speculative: "speculative",
};

function readableSummary(value: string) {
  return value
    .replace(/\bMeSH\b/g, "Medical Subject Headings")
    .replace(/\bFCC\b/g, "the U.S. communications regulator")
    .replace(/\bAGI\b/g, "artificial general intelligence")
    .replace(/\bIVF\b/g, "in vitro fertilization")
    .replace(/^Nature Communications record for the /, "Nature Communications describes the ")
    .replace(/; useful as artificial womb technology anchor\.?$/i, ".");
}

export function InteractiveMovementHeading({ id, index, title }: InteractiveMovementHeadingProps) {
  return (
    <div className={styles.entityHeading}>
      <p className={styles.movementIndex}>{index}</p>
      <h2 id={id}>{title}</h2>
    </div>
  );
}

function publicNumber(value: number) {
  return value.toLocaleString("en-US");
}

export function ResearchCoveragePanel({ coverage }: { coverage: ResearchCoverage }) {
  const panelId = useId();
  return (
    <section className={styles.coveragePanel} data-motion-scene data-surface-category="visualization" aria-labelledby={`${panelId}-title`}>
      <header className={styles.entityPanelHeader}>
        <h3 id={`${panelId}-title`}>Research coverage</h3>
        <b>{coverage.selectedTermCount} TERMS OVER TIME</b>
      </header>
      <div className={styles.coverageTotal}>
        <b>{publicNumber(coverage.retainedTermYearCellCount)}</b>
        <span>year-by-year checks</span>
      </div>
      <div className={styles.coverageBars} role="img" aria-label={`${publicNumber(coverage.compoundTermYearCellCount)} yearly checks for phrases containing artificial, and ${publicNumber(coverage.mediaTermYearCellCount)} yearly checks for media comparison terms`}>
        <div style={{ "--coverage-share": coverage.compoundTermYearCellCount / coverage.retainedTermYearCellCount } as CSSProperties}>
          <span>phrases containing “artificial”</span><i aria-hidden="true"><b /></i><strong>{publicNumber(coverage.compoundTermYearCellCount)}</strong>
        </div>
        <div style={{ "--coverage-share": coverage.mediaTermYearCellCount / coverage.retainedTermYearCellCount } as CSSProperties}>
          <span>media comparison terms</span><i aria-hidden="true"><b /></i><strong>{publicNumber(coverage.mediaTermYearCellCount)}</strong>
        </div>
      </div>
    </section>
  );
}

export function InteractiveMediaConsole({ groups }: { groups: readonly MediaTermGroup[] }) {
  const panelId = useId();
  const detailId = `${panelId}-detail`;
  const flatTerms = useMemo(() => groups.flatMap((group) => group.terms.map((term) => ({ group, term }))), [groups]);
  const [activeGroupId, setActiveGroupId] = useState(groups[0]?.id ?? "");
  const [selectedTerm, setSelectedTerm] = useState(flatTerms[0]?.term ?? "");
  const termRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const selected = flatTerms.find((item) => item.term === selectedTerm) ?? flatTerms[0];
  const activeGroup = groups.find((group) => group.id === activeGroupId) ?? groups[0];
  const maximumGroupCount = Math.max(...groups.map((group) => group.count), 1);

  const chooseGroup = useCallback((group: MediaTermGroup) => {
    setActiveGroupId(group.id);
    setSelectedTerm(group.terms[0] ?? "");
  }, []);

  const moveTermFocus = useCallback((currentIndex: number, key: string) => {
    let nextIndex = currentIndex;
    if (key === "ArrowLeft" || key === "ArrowUp") nextIndex = Math.max(0, currentIndex - 1);
    else if (key === "ArrowRight" || key === "ArrowDown") nextIndex = Math.min(flatTerms.length - 1, currentIndex + 1);
    else if (key === "Home") nextIndex = 0;
    else if (key === "End") nextIndex = flatTerms.length - 1;
    else return false;
    const next = flatTerms[nextIndex];
    if (!next) return false;
    setActiveGroupId(next.group.id);
    setSelectedTerm(next.term);
    window.requestAnimationFrame(() => termRefs.current[nextIndex]?.focus());
    return true;
  }, [flatTerms]);

  return (
    <details className={styles.secondaryDataDisclosure} data-motion-scene data-surface-category="card">
      <summary>
        <span><b>12</b> terms across 4 groups</span>
        <em>Which media technologies were compared?</em>
        <i aria-hidden="true">+</i>
      </summary>
      <section className={styles.mediaConsole} aria-labelledby={`${panelId}-title`}>
        <header className={styles.secondaryDataHeader}>
          <h3 id={`${panelId}-title`}>Which media technologies were compared?</h3>
          <p>The study uses twelve selected terms from optical devices, sound and cinema, broadcasting, and digital simulation. This is a comparison list—not a popularity ranking or timeline.</p>
        </header>
        <div className={styles.mediaBarChart} role="group" aria-label="Twelve selected media terms grouped into four technology categories">
          {groups.map((group) => (
            <button
              key={group.id}
              type="button"
              aria-pressed={activeGroupId === group.id}
              onClick={() => chooseGroup(group)}
              style={{ "--media-share": group.count / maximumGroupCount } as CSSProperties}
            >
              <span>{group.label}</span><i aria-hidden="true"><b /></i><strong>{group.count}</strong>
            </button>
          ))}
        </div>
        {activeGroup && (
          <div className={styles.mediaTermChooser} role="group" aria-label={`${activeGroup.label} terms`}>
            <p>{activeGroup.label}</p>
            <div>
              {activeGroup.terms.map((term) => {
                const stableIndex = flatTerms.findIndex((item) => item.term === term);
                return (
                  <button
                    key={term}
                    ref={(node) => { termRefs.current[stableIndex] = node; }}
                    type="button"
                    aria-pressed={selectedTerm === term}
                    aria-controls={detailId}
                    tabIndex={selectedTerm === term ? 0 : -1}
                    onClick={() => setSelectedTerm(term)}
                    onKeyDown={(event) => {
                      if (moveTermFocus(stableIndex, event.key)) event.preventDefault();
                    }}
                  ><i aria-hidden="true" /><span>{term}</span></button>
                );
              })}
            </div>
          </div>
        )}
        {selected && (
          <article id={detailId} className={styles.mediaConsoleDetail}>
            <p>{selected.group.label} · one of {selected.group.count}</p>
            <h4>{selected.term}</h4>
            <span>This is one selected term in this technology group. The bar counts terms; it does not measure usage.</span>
          </article>
        )}
        <span className={styles.rotationStatus} role="status" aria-live="polite">Selected {selected?.term}.</span>
      </section>
    </details>
  );
}

type SourceStatementCounts = {
  context: number;
  direct: number;
  indirect: number;
  unused: number;
};

const sourceStatementStates = [
  { id: "direct", label: "DIRECT SUPPORT", explanation: "These statements are used directly in the closing interpretation." },
  { id: "indirect", label: "INDIRECT SUPPORT", explanation: "These statements inform the study, but require a narrower or more careful reading." },
  { id: "context", label: "SEPARATE CONTEXT", explanation: "This statement defines a neighboring meaning rather than supporting the central conclusion." },
  { id: "unused", label: "NOT USED", explanation: "These statements were reviewed but are not carried into the closing interpretation." },
] as const;

export function SourceStatementConsole({ counts }: { counts: SourceStatementCounts }) {
  const panelId = useId();
  const detailId = `${panelId}-detail`;
  const [selectedState, setSelectedState] = useState<(typeof sourceStatementStates)[number]["id"]>("direct");
  const selected = sourceStatementStates.find((state) => state.id === selectedState) ?? sourceStatementStates[0];
  const total = counts.direct + counts.indirect + counts.context + counts.unused;

  return (
    <details className={styles.secondaryDataDisclosure} data-motion-scene data-surface-category="card">
      <summary>
        <span><b>{total}</b> statements checked</span>
        <em>What made it into the conclusion?</em>
        <i aria-hidden="true">+</i>
      </summary>
      <section className={styles.statementConsole} aria-labelledby={`${panelId}-title`}>
        <header className={styles.secondaryDataHeader}>
          <h3 id={`${panelId}-title`}>What made it into the conclusion?</h3>
          <p>Four statements are used directly, four indirectly, one as context, and two are not used. These roles describe this study’s use of the material—not truth, probability, or statistical confidence.</p>
        </header>
        <div className={styles.statementTracks} role="group" aria-label={`${total} source statements grouped by how this study uses them`}>
          {sourceStatementStates.map((state) => {
            const count = counts[state.id];
            return (
              <button
                key={state.id}
                type="button"
                aria-pressed={selectedState === state.id}
                aria-controls={detailId}
                onClick={() => setSelectedState(state.id)}
                style={{ "--statement-share": count / total } as CSSProperties}
              >
                <span>{state.label}</span>
                <i aria-hidden="true"><b /></i>
                <strong>{count}</strong>
              </button>
            );
          })}
        </div>
        <article id={detailId} className={styles.statementDetail}>
          <p>{selected.label} · {counts[selected.id]} OF {total}</p>
          <h4>{selected.explanation}</h4>
        </article>
        <span className={styles.rotationStatus} role="status" aria-live="polite">Showing {selected.label.toLowerCase()}.</span>
      </section>
    </details>
  );
}

function rotatePoint(point: Point3D, yaw: number): Point3D {
  const angle = yaw * Math.PI / 180;
  const cosine = Math.cos(angle);
  const sine = Math.sin(angle);
  const centeredX = point.x - 50;
  return {
    x: 50 + centeredX * cosine + point.z * sine,
    y: point.y,
    z: -centeredX * sine + point.z * cosine,
  };
}

function treeY(value: number) {
  const originalY = value * TREE_ORIGINAL_VIEWBOX_HEIGHT / 100;
  const compressedHeight = TREE_VIEWBOX_HEIGHT - TREE_DRAWABLE_TOP;
  const originalHeight = TREE_ORIGINAL_VIEWBOX_HEIGHT - TREE_DRAWABLE_TOP;
  return TREE_DRAWABLE_TOP + (originalY - TREE_DRAWABLE_TOP) * compressedHeight / originalHeight;
}

function svgCoordinate(value: number) {
  return value.toFixed(4);
}

function treeDepthScale(value: number) {
  return Math.max(.72, Math.min(1.38, 1 + value / 92));
}

function releaseCapture(target: HTMLDivElement, pointerId: number) {
  try {
    if (target.hasPointerCapture(pointerId)) target.releasePointerCapture(pointerId);
  } catch {
    // WebKit can release capture before React receives pointercancel.
  }
}

function RotatableGeometryFrame({ children, className = "", initialViewIndex = 0, label, onViewChange, viewNoun, views }: RotatableGeometryFrameProps) {
  const fieldId = useId();
  const infoId = `${fieldId}-curated-view`;
  const pointerIdRef = useRef<number | null>(null);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const horizontalTravelRef = useRef(0);
  const previewFrameRef = useRef<number | null>(null);
  const previewTravelRef = useRef(0);
  const suppressClickRef = useRef(false);
  const safeInitialViewIndex = Math.max(0, Math.min(initialViewIndex, Math.max(views.length - 1, 0)));
  const viewIndexRef = useRef(safeInitialViewIndex);
  const gestureAxisRef = useRef<GestureAxis>("idle");
  const [viewIndex, setViewIndex] = useState(safeInitialViewIndex);
  const [previewYaw, setPreviewYaw] = useState(0);
  const [announcement, setAnnouncement] = useState("");
  const activeView = views[viewIndex] ?? { label: label, summary: "Swipe sideways to change the fixed view.", yaw: 0 };

  const selectView = useCallback((nextIndex: number) => {
    if (views.length === 0) return;
    const normalizedIndex = (nextIndex + views.length) % views.length;
    viewIndexRef.current = normalizedIndex;
    setViewIndex(normalizedIndex);
    onViewChange?.(normalizedIndex);
    setAnnouncement(`${label}: ${views[normalizedIndex]?.label ?? "new view"}.`);
  }, [label, onViewChange, views]);

  const stepView = useCallback((direction: -1 | 1) => {
    selectView(viewIndexRef.current + direction);
  }, [selectView]);

  const clearGesture = useCallback((target: HTMLDivElement, pointerId: number) => {
    if (previewFrameRef.current !== null) window.cancelAnimationFrame(previewFrameRef.current);
    previewFrameRef.current = null;
    setPreviewYaw(0);
    releaseCapture(target, pointerId);
    pointerIdRef.current = null;
    gestureAxisRef.current = "idle";
    delete target.dataset.gesture;
    delete target.dataset.dragging;
  }, []);

  const onPointerDown = useCallback((event: PointerEvent<HTMLDivElement>) => {
    if (!event.isPrimary) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    const viewportWidth = window.visualViewport?.width ?? window.innerWidth;
    if (event.pointerType === "touch" && (event.clientX <= SAFARI_EDGE_GUTTER || event.clientX >= viewportWidth - SAFARI_EDGE_GUTTER)) return;
    pointerIdRef.current = event.pointerId;
    startXRef.current = event.clientX;
    startYRef.current = event.clientY;
    horizontalTravelRef.current = 0;
    suppressClickRef.current = false;
    gestureAxisRef.current = "pending";
    event.currentTarget.dataset.gesture = "pending";
  }, []);

  const onPointerMove = useCallback((event: PointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current !== event.pointerId) return;
    const horizontalTravel = event.clientX - startXRef.current;
    const verticalTravel = event.clientY - startYRef.current;
    const absoluteHorizontal = Math.abs(horizontalTravel);
    const absoluteVertical = Math.abs(verticalTravel);

    if (gestureAxisRef.current === "pending") {
      if (Math.max(absoluteHorizontal, absoluteVertical) < GESTURE_THRESHOLD) return;
      if (absoluteHorizontal <= absoluteVertical + 7) {
        gestureAxisRef.current = "scrolling";
        event.currentTarget.dataset.gesture = "scrolling";
        return;
      }
      gestureAxisRef.current = "rotating";
      event.currentTarget.dataset.gesture = "rotating";
      event.currentTarget.dataset.dragging = "true";
      try {
        event.currentTarget.setPointerCapture(event.pointerId);
      } catch {
        gestureAxisRef.current = "cancelled";
        clearGesture(event.currentTarget, event.pointerId);
        return;
      }
    }

    if (gestureAxisRef.current !== "rotating") return;
    if (event.cancelable) event.preventDefault();
    horizontalTravelRef.current = horizontalTravel;
    previewTravelRef.current = horizontalTravel;
    if (previewFrameRef.current === null) {
      previewFrameRef.current = window.requestAnimationFrame(() => {
        setPreviewYaw(Math.max(-18, Math.min(18, previewTravelRef.current * .16)));
        previewFrameRef.current = null;
      });
    }
  }, [clearGesture]);

  const commitPointer = useCallback((event: PointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current !== event.pointerId) return;
    const gestureAxis = gestureAxisRef.current;
    const direction = horizontalTravelRef.current < 0 ? 1 : -1;
    clearGesture(event.currentTarget, event.pointerId);
    if (gestureAxis === "rotating") {
      suppressClickRef.current = true;
      stepView(direction);
    }
  }, [clearGesture, stepView]);

  const cancelPointer = useCallback((event: PointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current !== event.pointerId) return;
    gestureAxisRef.current = "cancelled";
    clearGesture(event.currentTarget, event.pointerId);
  }, [clearGesture]);

  const onLostPointerCapture = useCallback((event: PointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current !== event.pointerId) return;
    pointerIdRef.current = null;
    gestureAxisRef.current = "idle";
    delete event.currentTarget.dataset.gesture;
    delete event.currentTarget.dataset.dragging;
  }, []);

  return (
    <div className={[styles.rotatableRecordField, className].filter(Boolean).join(" ")}>
      <div
        id={fieldId}
        className={styles.rotator}
        role="group"
        tabIndex={0}
        aria-describedby={infoId}
        aria-label={`${label}. One sideways swipe moves to the next ${viewNoun.toLowerCase()} and updates the permanent text below. Swipe vertically to continue.`}
        data-curated-view={viewIndex + 1}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={commitPointer}
        onPointerCancel={cancelPointer}
        onLostPointerCapture={onLostPointerCapture}
        onClick={(event) => {
          if (suppressClickRef.current) {
            suppressClickRef.current = false;
            event.preventDefault();
            return;
          }
          const target = event.target as HTMLElement;
          if (target.closest("button, a, summary")) return;
          const bounds = event.currentTarget.getBoundingClientRect();
          stepView(event.clientX < bounds.left + bounds.width / 2 ? -1 : 1);
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") { event.preventDefault(); stepView(-1); }
          else if (event.key === "ArrowRight") { event.preventDefault(); stepView(1); }
          else if (event.key === "Home") { event.preventDefault(); selectView(0); }
          else if (event.key === "End") { event.preventDefault(); selectView(views.length - 1); }
        }}
      >
        {children(activeView.yaw + previewYaw, viewIndex)}
      </div>
      <div id={infoId} className={styles.curatedViewReadout}>
        {views.map((view, index) => (
          <article key={`${view.label}-${index}`} className={index === viewIndex ? styles.curatedViewActive : styles.curatedViewInactive} aria-hidden={index !== viewIndex}>
            <h4>{view.label}</h4>
            <p>{view.summary}</p>
            {view.sourceUrl
              ? <a href={view.sourceUrl} tabIndex={index === viewIndex ? 0 : -1} target="_blank" rel="noreferrer">{view.yearOrPeriod ? `${view.yearOrPeriod} · ` : ""}{view.sourceName ?? "View source"}</a>
              : <small>SWIPE TO READ</small>}
          </article>
        ))}
      </div>
      <span className={styles.rotationStatus} role="status" aria-live="polite">{announcement}</span>
    </div>
  );
}

function domainClass(domainIndex: number) {
  return domainIndex === 0 ? "" : styles[`geometryDomain${domainIndex}`];
}

export function InteractiveCompoundTree({ branches }: { branches: readonly CompoundTreeBranch[] }) {
  const entrance = useArtificialEntrance<HTMLDivElement>();
  const leaves = useMemo(() => branches.flatMap((branch) => branch.leaves.map((leaf) => ({ ...leaf, branch }))), [branches]);
  const publicThemeSummaries: Record<string, string> = {
    body: "Heart, kidney, limb, organ, respiration, and insemination name interventions connected to bodily life.",
    mind: "Brain, intelligence, language, memory, reason, and neural systems name constructed mental processes.",
    materials: "Fiber, resin, rubber, silk, and stone name substances made to take on another material role.",
    senses: "Color, flavor, flowers, light, and sweeteners name effects designed to look, taste, or feel familiar.",
    "social life": "Behavior, courtesy, emotion, manners, smiles, sympathy, and voice name performed social signals.",
  };
  const curatedViews = useMemo(() => branches.map((branch, index) => ({
    yaw: -40 + index * 20,
    label: branch.label,
    summary: publicThemeSummaries[branch.label] ?? branch.leaves.map((leaf) => leaf.label).join(" · "),
  })), [branches]);
  return (
    <div ref={entrance.ref} className={styles.geometryExplorer}>
      <RotatableGeometryFrame
        className={styles.compoundGeometryFrame}
        initialViewIndex={0}
        label="phrase themes"
        viewNoun="THEME"
        views={curatedViews}
      >
        {(yaw, activeBranchIndex) => {
          const root = rotatePoint({ x: 50, y: 3.5, z: 0 }, yaw);
          const projectedBranches = branches.map((branch) => ({
            ...branch,
            projectedHub: rotatePoint(branch.hub, yaw),
            projectedLeaves: branch.leaves.map((leaf) => ({ ...leaf, projected: rotatePoint(leaf, yaw) })),
          }));
          const orderedLeaves = projectedBranches
            .flatMap((branch) => branch.projectedLeaves.map((leaf) => ({ ...leaf, domainIndex: branch.domainIndex, branchLabel: branch.label })))
            .sort((first, second) => first.projected.z - second.projected.z);
          return (
            <figure className={styles.compoundGeometryFigure}>
              <NebulaCanvas
                activeAnchor={activeBranchIndex}
                anchors={projectedBranches.map((branch) => ({ x: branch.projectedHub.x / 100, y: treeY(branch.projectedHub.y) / TREE_VIEWBOX_HEIGHT }))}
                count={110}
                entered={entrance.entered}
                inView={entrance.inView}
                seed={481805}
              />
              <motion.svg className={styles.compoundGeometrySvg} viewBox={`7 0 86 ${TREE_VIEWBOX_HEIGHT}`} preserveAspectRatio="xMidYMid meet" aria-label={`${leaves.length} phrases containing artificial, grouped into five meaning themes.`}>
                <g className={styles.geometryRelations} aria-hidden="true">
                  {projectedBranches.map((branch) => (
                    <g key={branch.id} className={branch.domainIndex === activeBranchIndex ? styles.activeViewRelation : styles.inactiveViewRelation}>
                      <motion.line className={styles.geometryRootBranch} x1={svgCoordinate(root.x)} y1={svgCoordinate(treeY(root.y + 2))} x2={svgCoordinate(branch.projectedHub.x)} y2={svgCoordinate(treeY(branch.projectedHub.y))} initial={entrance.reduced ? false : { pathLength: 0, opacity: 0 }} animate={{ pathLength: entrance.entered ? 1 : 0, opacity: entrance.entered ? 1 : 0 }} transition={{ delay: motionTime(.08 + branch.domainIndex * .055), duration: motionTime(.38), ease: "linear" }} />
                      {[...new Set(branch.projectedLeaves.map((leaf) => leaf.ringIndex))].map((ringIndex) => {
                        const ringLeaves = branch.projectedLeaves.filter((leaf) => leaf.ringIndex === ringIndex).sort((a, b) => a.sequence - b.sequence);
                        if (ringLeaves.length < 3) return null;
                        const path = `${ringLeaves.map((leaf, index) => `${index === 0 ? "M" : "L"}${svgCoordinate(leaf.projected.x)} ${svgCoordinate(treeY(leaf.projected.y))}`).join(" ")} Z`;
                        return <motion.path key={`${branch.id}-${ringIndex}`} className={styles.geometryClusterRing} d={path} initial={entrance.reduced ? false : { pathLength: 0, opacity: 0 }} animate={{ pathLength: entrance.entered ? 1 : 0, opacity: entrance.entered ? 1 : 0 }} transition={{ delay: motionTime(.42 + branch.domainIndex * .075), duration: motionTime(.34), ease: "linear" }} />;
                      })}
                      {branch.projectedLeaves.map((leaf) => (
                        <motion.line key={leaf.id} className={styles.geometryLeafBranch} x1={svgCoordinate(branch.projectedHub.x)} y1={svgCoordinate(treeY(branch.projectedHub.y))} x2={svgCoordinate(leaf.projected.x)} y2={svgCoordinate(treeY(leaf.projected.y))} initial={entrance.reduced ? false : { pathLength: 0, opacity: 0 }} animate={{ pathLength: entrance.entered ? 1 : 0, opacity: entrance.entered ? 1 : 0 }} transition={{ delay: motionTime(.24 + branch.domainIndex * .07 + leaf.sequence * .018), duration: motionTime(.28), ease: "linear" }} />
                      ))}
                    </g>
                  ))}
                </g>
                <g className={styles.geometryBranchHubs} aria-hidden="true">
                  {projectedBranches.map((branch) => <motion.circle key={branch.id} cx={svgCoordinate(branch.projectedHub.x)} cy={svgCoordinate(treeY(branch.projectedHub.y))} r="1.05" initial={entrance.reduced ? false : { opacity: 0, scale: 0 }} animate={{ opacity: entrance.entered ? 1 : 0, scale: entrance.entered ? 1 : 0 }} transition={{ delay: motionTime(.18 + branch.domainIndex * .075), duration: motionTime(.22), ease: "easeOut" }} />)}
                </g>
                {orderedLeaves.map((leaf, markIndex) => {
                  const depthScale = treeDepthScale(leaf.projected.z);
                  return (
                    <motion.g
                      key={leaf.id}
                      aria-hidden="true"
                      className={[styles.geometryRecord, domainClass(leaf.domainIndex), leaf.domainIndex === activeBranchIndex ? styles.activeViewRecord : styles.inactiveViewRecord].filter(Boolean).join(" ")}
                      style={{ "--mark-index": markIndex, "--depth-opacity": Math.min(1, .52 + depthScale * .36) } as CSSProperties}
                      initial={entrance.reduced ? false : { opacity: 0, scale: 0 }}
                      animate={{ opacity: entrance.entered ? 1 : 0, scale: entrance.entered ? 1 : 0 }}
                      transition={{ delay: motionTime(.28 + leaf.domainIndex * .075 + leaf.sequence * .018), duration: motionTime(.28), ease: [0.2, 0.75, 0.25, 1] }}
                    >
                      <circle className={styles.geometryRecordTrace} cx={svgCoordinate(leaf.projected.x)} cy={svgCoordinate(treeY(leaf.projected.y))} r={svgCoordinate(3.5 * depthScale)} />
                      <circle className={styles.geometryRecordHalo} cx={svgCoordinate(leaf.projected.x)} cy={svgCoordinate(treeY(leaf.projected.y))} r={svgCoordinate(2.8 * depthScale)} />
                      <circle className={styles.geometryRecordCore} cx={svgCoordinate(leaf.projected.x)} cy={svgCoordinate(treeY(leaf.projected.y))} r={svgCoordinate(1.45 * depthScale)} />
                    </motion.g>
                  );
                })}
                {projectedBranches.map((branch) => (
                  <motion.text key={branch.id} className={[styles.geometryDomainLabel, branch.domainIndex === activeBranchIndex ? styles.activeViewLabel : styles.inactiveViewLabel].join(" ")} x={svgCoordinate(branch.projectedHub.x)} y={svgCoordinate(treeY(branch.projectedHub.y))} initial={entrance.reduced ? false : { opacity: 0 }} animate={{ opacity: entrance.entered ? 1 : 0 }} transition={{ delay: motionTime(.78 + branch.domainIndex * .04), duration: motionTime(.2) }}>{branch.label.toUpperCase()}</motion.text>
                ))}
                <motion.text className={styles.geometryRootLabel} x={svgCoordinate(root.x)} y={svgCoordinate(treeY(root.y))} initial={entrance.reduced ? false : { opacity: 0, scale: .7 }} animate={{ opacity: entrance.entered ? 1 : 0, scale: entrance.entered ? 1 : .7 }} transition={{ duration: motionTime(.22), ease: "easeOut" }}>ARTIFICIAL</motion.text>
              </motion.svg>
            </figure>
          );
        }}
      </RotatableGeometryFrame>
    </div>
  );
}

function semanticSpherePoint(index: number): Point3D {
  const longitude = index / 5 * Math.PI * 2;
  const latitudes = [-18, -6, 10, 22, 4];
  const latitude = (latitudes[index] ?? 0) * Math.PI / 180;
  const radius = 38;
  return {
    x: 50 + Math.cos(latitude) * Math.cos(longitude) * radius,
    y: 50 + Math.sin(latitude) * radius,
    z: Math.cos(latitude) * Math.sin(longitude) * radius,
  };
}

function placeSemanticLabels(points: ReadonlyArray<{ axisLabel: string; id: string; projected: Point3D }>) {
  const labels = points.map((point) => {
    const offsetX = point.projected.x - 50;
    const offsetY = point.projected.y - 50;
    const length = Math.max(Math.hypot(offsetX, offsetY), 1);
    const width = Math.max(12, point.axisLabel.length * 2.25);
    return {
      id: point.id,
      width,
      x: Math.max(width / 2 + 2.5, Math.min(97.5 - width / 2, point.projected.x + offsetX / length * 9.5)),
      y: Math.max(7, Math.min(93, point.projected.y + offsetY / length * 9.5)),
    };
  });

  for (let pass = 0; pass < 10; pass += 1) {
    for (let firstIndex = 0; firstIndex < labels.length; firstIndex += 1) {
      for (let secondIndex = firstIndex + 1; secondIndex < labels.length; secondIndex += 1) {
        const first = labels[firstIndex];
        const second = labels[secondIndex];
        const horizontalOverlap = (first.width + second.width) / 2 + 3 - Math.abs(first.x - second.x);
        const verticalOverlap = 8.2 - Math.abs(first.y - second.y);
        if (horizontalOverlap <= 0 || verticalOverlap <= 0) continue;
        const direction = first.y <= second.y ? -1 : 1;
        first.y = Math.max(7, Math.min(93, first.y + direction * verticalOverlap / 2));
        second.y = Math.max(7, Math.min(93, second.y - direction * verticalOverlap / 2));
      }
    }
  }

  return new Map(labels.map((label) => [label.id, label]));
}

export function InteractiveSemanticSphere({ caveat, views }: { caveat: string; views: readonly SemanticMobilityView[] }) {
  const entrance = useArtificialEntrance<HTMLDivElement>();
  const curatedViews = useMemo(() => views.map((view, index) => ({
    label: view.title,
    summary: readableSummary(view.summary),
    sourceName: view.sourceName,
    sourceUrl: view.sourceUrl,
    yearOrPeriod: view.yearOrPeriod,
    yaw: index * 72 - 90,
  })), [views]);

  return (
    <div ref={entrance.ref} className={styles.semanticSphereExplorer}>
      <RotatableGeometryFrame
        className={styles.semanticGeometryFrame}
        initialViewIndex={0}
        label="made, real, and simulated meanings"
        viewNoun="SOURCE CASE"
        views={curatedViews}
      >
        {(yaw, activeIndex) => {
          const projected = views.map((view, index) => ({
            ...view,
            index,
            projected: rotatePoint(semanticSpherePoint(index), yaw),
          }));
          const labelPositions = placeSemanticLabels(projected);
          return (
            <figure className={styles.semanticSphereFigure}>
              <div className={styles.semanticVisualStage}>
                <NebulaCanvas
                  activeAnchor={activeIndex}
                  anchors={projected.map((point) => ({ x: point.projected.x / 100, y: point.projected.y / 100 }))}
                  circular
                  count={144}
                  entered={entrance.entered}
                  inView={entrance.inView}
                  seed={5032019}
                />
              <motion.svg className={styles.semanticSphereSvg} viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" focusable="false" aria-label="Five source cases distinguish artificial, real, realistic, simulated, and generated meanings.">
                <motion.circle className={styles.semanticSphereSurface} cx="50" cy="50" r="46" pathLength="1" initial={entrance.reduced ? false : { pathLength: 0, opacity: 0 }} animate={{ pathLength: entrance.entered ? 1 : 0, opacity: entrance.entered ? 1 : 0 }} transition={{ duration: motionTime(.34), ease: "linear" }} aria-hidden="true" />
                <g className={styles.semanticSphereRelations} aria-hidden="true">
                  {projected.map((point, index) => <motion.line key={point.id} x1="50" y1="50" x2={svgCoordinate(point.projected.x)} y2={svgCoordinate(point.projected.y)} initial={entrance.reduced ? false : { pathLength: 0, opacity: 0 }} animate={{ pathLength: entrance.entered ? 1 : 0, opacity: entrance.entered ? 1 : 0 }} transition={{ delay: motionTime(.28 + index * .045), duration: motionTime(.3), ease: "linear" }} />)}
                </g>
                <motion.circle className={styles.semanticSphereRootCore} cx="50" cy="50" r="8" initial={entrance.reduced ? false : { opacity: 0, scale: .2 }} animate={{ opacity: entrance.entered ? 1 : 0, scale: entrance.entered ? 1 : .2 }} transition={{ delay: motionTime(.16), duration: motionTime(.28), ease: "easeOut" }} />
                <motion.text className={styles.semanticSphereRoot} x="50" y="51" initial={entrance.reduced ? false : { opacity: 0, scale: .55 }} animate={{ opacity: entrance.entered ? 1 : 0, scale: entrance.entered ? 1 : .55 }} transition={{ delay: motionTime(.2), duration: motionTime(.26), ease: "easeOut" }}>ARTIFICIAL</motion.text>
                {projected.map((point) => {
                  const depth = Math.max(.72, Math.min(1.3, 1 + point.projected.z / 95));
                  const active = point.index === activeIndex;
                  const labelPosition = labelPositions.get(point.id) ?? { x: point.projected.x, y: point.projected.y };
                  return (
                    <motion.g
                      key={point.id}
                      className={active ? styles.semanticSphereActive : styles.semanticSphereInactive}
                      style={{ transformBox: "view-box", transformOrigin: `${svgCoordinate(point.projected.x)}px ${svgCoordinate(point.projected.y)}px` }}
                      aria-hidden="true"
                      initial={entrance.reduced ? false : { opacity: 0, scale: .2, x: 50 - point.projected.x, y: 50 - point.projected.y }}
                      animate={{ opacity: entrance.entered ? 1 : 0, scale: entrance.entered ? 1 : .2, x: 0, y: 0 }}
                      transition={{ delay: motionTime(.44 + point.index * .065), duration: motionTime(.34), ease: [0.2, 0.75, 0.25, 1] }}
                    >
                      <circle className={styles.semanticSphereHalo} cx={svgCoordinate(point.projected.x)} cy={svgCoordinate(point.projected.y)} r={svgCoordinate(7 * depth)} />
                      <circle className={styles.semanticSphereCore} cx={svgCoordinate(point.projected.x)} cy={svgCoordinate(point.projected.y)} r={svgCoordinate(2.65 * depth)} />
                      <motion.text className={styles.semanticSphereLabel} x={svgCoordinate(labelPosition.x)} y={svgCoordinate(labelPosition.y)} initial={entrance.reduced ? false : { opacity: 0 }} animate={{ opacity: entrance.entered ? 1 : 0 }} transition={{ delay: motionTime(.82 + point.index * .04), duration: motionTime(.18) }}>{point.axisLabel}</motion.text>
                    </motion.g>
                  );
                })}
              </motion.svg>
              </div>
              <figcaption>{caveat}</figcaption>
            </figure>
          );
        }}
      </RotatableGeometryFrame>
    </div>
  );
}

function orientOrbitPoint(orbit: EvidenceOrbit, theta: number): Point3D {
  const tilt = orbit.tilt * Math.PI / 180;
  const rotation = orbit.rotation * Math.PI / 180;
  const localX = Math.cos(theta) * orbit.radius;
  const localY = Math.sin(theta) * orbit.radius;
  const tiltedY = localY * Math.cos(tilt);
  const tiltedZ = localY * Math.sin(tilt);
  return {
    x: 50 + localX * Math.cos(rotation) - tiltedY * Math.sin(rotation),
    y: 50 + localX * Math.sin(rotation) + tiltedY * Math.cos(rotation),
    z: tiltedZ,
  };
}

function orbitPaths(orbit: EvidenceOrbit, yaw: number) {
  const sampleCount = 72;
  const projected = Array.from({ length: sampleCount + 1 }, (_, index) => rotatePoint(orientOrbitPoint(orbit, index / sampleCount * Math.PI * 2), yaw));
  let back = "";
  let front = "";
  let previousSide: "back" | "front" | null = null;
  for (let index = 0; index < sampleCount; index += 1) {
    const first = projected[index];
    const second = projected[index + 1];
    const side = (first.z + second.z) / 2 < 0 ? "back" : "front";
    const segment = previousSide === side ? `L ${second.x.toFixed(2)} ${second.y.toFixed(2)} ` : `M ${first.x.toFixed(2)} ${first.y.toFixed(2)} L ${second.x.toFixed(2)} ${second.y.toFixed(2)} `;
    if (side === "back") back += segment;
    else front += segment;
    previousSide = side;
  }
  return { back, front };
}

function evidenceLayerClass(layerIndex: number) {
  return layerIndex === 0 ? "" : styles[`geometryLayer${layerIndex}`];
}

export function InteractiveEvidenceSphere({ orbits }: { orbits: readonly EvidenceOrbit[] }) {
  const examples = useMemo(() => orbits.flatMap((orbit) => orbit.examples), [orbits]);
  const curatedViews = useMemo(() => {
    const explanations: Record<string, string> = {
      support: "Artificial helps a bodily process continue.",
      replacement: "Artificial takes over a function normally performed by a body part.",
      continuation: "Artificial helps reproduction continue through an intervention.",
      modeled_processes: "Artificial recreates or models a human process such as voice or language.",
      speculative_extensions: "Artificial names a proposed ability or relationship that remains emerging or speculative.",
    };
    return orbits.map((orbit, index) => ({
      yaw: -40 + index * 20,
      label: orbit.label,
      summary: `${explanations[orbit.id] ?? "This relationship connects artificial to human life."} Terms in the cited passages: ${[...new Set(orbit.examples.map((example) => example.term))].join(" · ")}.`,
    }));
  }, [orbits]);
  return (
    <div className={styles.geometryExplorer}>
      <RotatableGeometryFrame
        className={styles.humanRotator}
        initialViewIndex={Math.max(0, orbits.findIndex((orbit) => orbit.id === "modeled_processes"))}
        label="human relationships"
        viewNoun="RELATIONSHIP"
        views={curatedViews}
      >
        {(yaw, activeOrbitIndex) => {
          const projectedOrbits = orbits.map((orbit) => ({
            ...orbit,
            paths: orbitPaths(orbit, yaw),
            points: orbit.examples.map((example, recordIndex) => ({
              example,
              projected: rotatePoint(orientOrbitPoint(orbit, -Math.PI / 2 + recordIndex / orbit.examples.length * Math.PI * 2 + orbit.phase), yaw),
            })),
          }));
          const orderedPoints = projectedOrbits.flatMap((orbit) => orbit.points.map((point) => ({ ...point, layerIndex: orbit.layerIndex }))).sort((a, b) => a.projected.z - b.projected.z);
          return (
            <figure className={styles.evidenceSphereFigure}>
              <svg className={styles.evidenceSphereSvg} viewBox="0 0 100 100" aria-label={`Cited source passages grouped into five relationships to human functions.`}>
                <circle className={styles.evidenceSphereSurface} cx="50" cy="50" r="44" aria-hidden="true" />
                <g className={styles.evidenceOrbitBacks} aria-hidden="true">{projectedOrbits.map((orbit) => <path key={orbit.id} className={[evidenceLayerClass(orbit.layerIndex), orbit.layerIndex === activeOrbitIndex ? styles.activeViewRelation : styles.inactiveViewRelation].filter(Boolean).join(" ")} d={orbit.paths.back} />)}</g>
                <g className={styles.evidenceOrbitFronts} aria-hidden="true">{projectedOrbits.map((orbit) => <path key={orbit.id} className={[evidenceLayerClass(orbit.layerIndex), orbit.layerIndex === activeOrbitIndex ? styles.activeViewRelation : styles.inactiveViewRelation].filter(Boolean).join(" ")} d={orbit.paths.front} />)}</g>
                {orderedPoints.map((point, markIndex) => {
                  const depthOpacity = 0.64 + ((point.projected.z + 44) / 88) * 0.36;
                  return (
                    <g
                      key={point.example.id}
                      aria-hidden="true"
                      className={[styles.geometryEvidenceRecord, evidenceLayerClass(point.layerIndex), point.layerIndex === activeOrbitIndex ? styles.activeViewRecord : styles.inactiveViewRecord].filter(Boolean).join(" ")}
                      style={{ "--depth-opacity": depthOpacity.toFixed(4), "--mark-index": markIndex } as CSSProperties}
                    >
                      <circle className={styles.geometryEvidenceHalo} cx={svgCoordinate(point.projected.x)} cy={svgCoordinate(point.projected.y)} r="5.2" />
                      <circle className={styles.geometryEvidenceCore} cx={svgCoordinate(point.projected.x)} cy={svgCoordinate(point.projected.y)} r="1.3" />
                    </g>
                  );
                })}
              </svg>
              <figcaption className={styles.evidenceOrbitLegend}>
                {orbits.map((orbit) => <span key={orbit.id} className={[evidenceLayerClass(orbit.layerIndex), orbit.layerIndex === activeOrbitIndex ? styles.activeViewLabel : styles.inactiveViewLabel].filter(Boolean).join(" ")}><i aria-hidden="true" />{orbit.label}</span>)}
              </figcaption>
            </figure>
          );
        }}
      </RotatableGeometryFrame>
    </div>
  );
}

export type DatedDistrustExample = {
  period: string;
  phrases: readonly string[];
  domain: string;
  strength: string;
  source: string;
  sourceType: string;
  sourceUrl: string;
};

const distrustDomainLabels: Record<string, string> = {
  absence_claim: "claims that something was removed or omitted",
  industrial_synthetic: "synthetic industrial goods",
  processed_consumer: "processed consumer products",
  modern_authenticity: "claims about authenticity",
};

function periodYears(period: string) {
  const years = period.match(/\d{4}/g)?.map(Number) ?? [];
  const start = years[0] ?? 1850;
  const end = years.at(-1) ?? start;
  return { start, end, point: (start + end) / 2 };
}

function publicPeriod(period: string) {
  return period.replaceAll("_", "–");
}

const TIMELINE_AXIS_INSET = 1.8;

function timelinePosition(year: number) {
  const raw = (year - 1850) / (2026 - 1850);
  return TIMELINE_AXIS_INSET + raw * (100 - TIMELINE_AXIS_INSET * 2);
}

export function InteractiveDatedTimeline({ examples }: { examples: readonly DatedDistrustExample[] }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const points = examples.map((example, index) => {
    const years = periodYears(example.period);
    const position = timelinePosition(years.point);
    const startPosition = timelinePosition(years.start);
    const endPosition = timelinePosition(years.end);
    return { example, index, position, startPosition, endPosition, isRange: years.end > years.start };
  });
  const selectedPoint = points[selectedIndex] ?? points[0];
  const ticks = [1850, 1900, 1950, 2000, 2026];
  return (
    <div className={styles.timelineExplorer}>
      <div id="artificial-distrust-detail" className={styles.timelineDetailStack}>
        {examples.map((example, index) => (
          <article key={`${example.period}-${index}`} className={[styles.timelineDetail, index === selectedIndex ? styles.timelineDetailActive : styles.timelineDetailInactive].join(" ")} aria-hidden={index !== selectedIndex}>
            <p>{publicPeriod(example.period)} · {distrustDomainLabels[example.domain] ?? example.domain.replaceAll("_", " ")} · {example.sourceType.replaceAll("_", " ")}</p>
            <h3>{example.phrases.join(" · ")}</h3>
            <span>This source places “artificial” in the context of {distrustDomainLabels[example.domain] ?? example.domain.replaceAll("_", " ")}.</span>
            <a href={example.sourceUrl} tabIndex={index === selectedIndex ? 0 : -1} target="_blank" rel="noreferrer">{example.source} ↗</a>
          </article>
        ))}
      </div>
      <div
        className={styles.compactTimeline}
        aria-label="Seven dated source rows on the same 1850 to 2026 scale"
        style={{
          "--active-start": `${selectedPoint?.startPosition ?? 0}%`,
          "--active-width": `${Math.max((selectedPoint?.endPosition ?? 0) - (selectedPoint?.startPosition ?? 0), .01)}%`,
          "--active-row": selectedIndex,
        } as CSSProperties}
      >
        <div className={styles.timelineSelectionGuide} aria-hidden="true">
          {selectedPoint?.isRange ? (
            <motion.div key={`range-${selectedIndex}`} className={styles.timelineRangeProjection}>
              <motion.b initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: motionTime(.2), ease: "linear" }} />
              <motion.i className={styles.timelineGuideStart} initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ delay: motionTime(.16), duration: motionTime(.26), ease: "linear" }} />
              <motion.i className={styles.timelineGuideEnd} initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ delay: motionTime(.16), duration: motionTime(.26), ease: "linear" }} />
            </motion.div>
          ) : <motion.em key={`point-${selectedIndex}`} initial={{ scale: .45, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: motionTime(.18), ease: "easeOut" }} />}
        </div>
        <div className={styles.timelineScale} aria-hidden="true">
          <i />
          {ticks.map((year) => <span key={year} style={{ left: `${timelinePosition(year)}%` }}>{year}</span>)}
        </div>
        <div className={styles.timelineRows} role="group" aria-label="Choose one dated source row">
          {points.map(({ endPosition, example, index, isRange, position, startPosition }) => (
            <button
              key={`${example.period}-${index}`}
              type="button"
              data-record-control
              aria-pressed={selectedIndex === index}
              aria-controls="artificial-distrust-detail"
              aria-label={`${publicPeriod(example.period)}. ${example.phrases.join(", ")}. ${distrustDomainLabels[example.domain] ?? example.domain}.`}
              onClick={() => setSelectedIndex(index)}
            >
              <span>{publicPeriod(example.period)}</span>
              <strong>{example.phrases.join(" · ")}</strong>
              <i aria-hidden="true">
                <b
                  className={isRange ? styles.timelineRangeMark : styles.timelinePointMark}
                  style={isRange
                    ? { left: `${startPosition}%`, width: `${Math.max(endPosition - startPosition, 1)}%` }
                    : { left: `${position}%` }}
                />
              </i>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const timeThemeLabels = {
  BIOLOGICAL: "BODY",
  COGNITIVE: "MIND",
  MATERIAL: "MATERIALS",
  SENSE: "SENSES",
  SOCIAL: "SOCIAL LIFE",
} as const;

const timeThemeOrder = ["BIOLOGICAL", "COGNITIVE", "MATERIAL", "SENSE", "SOCIAL"] as const;
const mediaEraOrder = ["optical_apparatus", "sound_and_cinema", "broadcast", "digital_simulation"] as const;
const mediaEraLabels = {
  optical_apparatus: "OPTICAL",
  sound_and_cinema: "SOUND + FILM",
  broadcast: "BROADCAST",
  digital_simulation: "DIGITAL",
} as const;

function DenseTermYearCanvas({ entered, reduced }: { entered: boolean; reduced: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const axisProgressRef = useRef(reduced ? 1 : 0);
  const revealProgressRef = useRef(reduced ? 1 : 0);
  const drawRef = useRef<() => void>(() => undefined);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let width = 1;
    let height = 1;
    let resizeFrame = 0;
    let ratio = 1;
    const draw = () => {
      const context = canvas.getContext("2d");
      if (!context) return;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, width, height);
      const plot = { left: 30, top: 12, right: width - 9, bottom: height - 25 };
      const plotWidth = Math.max(1, plot.right - plot.left);
      const plotHeight = Math.max(1, plot.bottom - plot.top);
      const axisProgress = axisProgressRef.current;
      const revealProgress = revealProgressRef.current;
      context.strokeStyle = "rgba(255,255,255,.16)";
      context.lineWidth = 1;
      context.font = "700 12px ui-monospace, monospace";
      context.fillStyle = "rgba(255,255,255,.9)";
      context.textAlign = "right";
      for (let exponent = timeStudy.scatter.yDomain.min; exponent <= timeStudy.scatter.yDomain.max; exponent += 2) {
        const y = plot.bottom - (exponent - timeStudy.scatter.yDomain.min) / (timeStudy.scatter.yDomain.max - timeStudy.scatter.yDomain.min) * plotHeight;
        context.beginPath(); context.moveTo(plot.left, y); context.lineTo(plot.left + plotWidth * axisProgress, y); context.stroke();
        context.globalAlpha = axisProgress;
        context.fillText(`10${exponent}`, plot.left - 5, y + 3);
        context.globalAlpha = 1;
      }
      context.textAlign = "center";
      for (const year of [1800, 1900, 2019]) {
        const x = plot.left + (year - 1800) / 219 * plotWidth;
        context.beginPath(); context.moveTo(x, plot.top); context.lineTo(x, plot.top + plotHeight * axisProgress); context.stroke();
        context.globalAlpha = axisProgress;
        context.textAlign = year === 1800 ? "left" : year === 2019 ? "right" : "center";
        context.fillText(String(year), x, height - 7);
        context.globalAlpha = 1;
      }
      context.save();
      context.beginPath();
      context.rect(plot.left, plot.top - 3, plotWidth * revealProgress, plotHeight + 6);
      context.clip();
      for (const point of timeStudy.scatter.points) {
        const x = plot.left + (point.year - 1800) / 219 * plotWidth;
        const y = plot.bottom - (point.logFraction - timeStudy.scatter.yDomain.min) / (timeStudy.scatter.yDomain.max - timeStudy.scatter.yDomain.min) * plotHeight;
        const themeIndex = timeThemeOrder.indexOf(point.theme);
        context.beginPath();
        if (themeIndex === 3) {
          context.moveTo(x, y - 1.65); context.lineTo(x + 1.65, y); context.lineTo(x, y + 1.65); context.lineTo(x - 1.65, y); context.closePath();
        } else context.arc(x, y, themeIndex === 0 ? 1.45 : 1.15, 0, Math.PI * 2);
        if (themeIndex === 2) {
          context.strokeStyle = "rgba(255,255,255,.8)"; context.lineWidth = .8; context.stroke();
        } else {
          context.fillStyle = themeIndex === 4 ? "rgba(255,49,95,.46)" : `rgba(255,255,255,${[.88, .62, .72, .76][themeIndex] ?? .7})`;
          context.fill();
        }
      }
      context.restore();
    };
    const resize = () => {
      width = Math.max(1, canvas.clientWidth);
      height = Math.max(1, canvas.clientHeight);
      ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      draw();
    };
    drawRef.current = draw;
    resize();
    const observer = new ResizeObserver(() => {
      if (resizeFrame) window.cancelAnimationFrame(resizeFrame);
      resizeFrame = window.requestAnimationFrame(() => {
        resizeFrame = 0;
        resize();
      });
    });
    observer.observe(canvas);
    return () => {
      observer.disconnect();
      if (resizeFrame) window.cancelAnimationFrame(resizeFrame);
    };
  }, []);
  useEffect(() => {
    if (!entered) return;
    if (reduced) {
      axisProgressRef.current = 1;
      revealProgressRef.current = 1;
      drawRef.current();
      return;
    }
    const axes = animateValue(axisProgressRef.current, 1, {
      duration: motionTime(.22),
      ease: "linear",
      onUpdate: (value) => { axisProgressRef.current = value; drawRef.current(); },
    });
    const reveal = animateValue(revealProgressRef.current, 1, {
      delay: motionTime(.2),
      duration: motionTime(.78),
      ease: "linear",
      onUpdate: (value) => { revealProgressRef.current = value; drawRef.current(); },
    });
    return () => { axes.stop(); reveal.stop(); };
  }, [entered, reduced]);
  return <canvas ref={canvasRef} className={styles.denseScatterCanvas} aria-label={`${timeStudy.positiveComparableCompoundCellCount.toLocaleString("en-US")} positive exact bigram term-year records. Horizontal position is year from 1800 to 2019. Vertical position is the log base ten corpus-normalized bigram fraction.`} />;
}

export function ArtificialLinearDashboard() {
  const maximumBand = Math.max(...timeStudy.mediaBands.map((band) => band.totalEqualTermIndex), Number.EPSILON);
  const entrance = useArtificialEntrance<HTMLElement>();
  return (
    <section ref={entrance.ref} className={styles.linearDashboard} data-motion-scene data-surface-category="visualization" aria-labelledby="artificial-linear-dashboard-title">
      <header>
        <p>{timeStudy.rawTermYearCellCount.toLocaleString("en-US")} YEARLY VALUES · 1800—2019</p>
        <h3 id="artificial-linear-dashboard-title">Two full-year views of the selected vocabulary.</h3>
      </header>
      <div className={styles.linearDashboardPair}>
        <figure className={styles.fullYearFigure}>
          <DenseTermYearCanvas entered={entrance.entered} reduced={entrance.reduced} />
          <motion.figcaption initial={entrance.reduced ? false : { opacity: 0 }} animate={{ opacity: entrance.entered ? 1 : 0 }} transition={{ delay: motionTime(.92), duration: motionTime(.18) }}><b>{timeStudy.positiveComparableCompoundCellCount.toLocaleString("en-US")}</b> positive yearly points across 29 exact two-word phrases<small>YEAR × NORMALIZED BOOK SHARE (LOG SCALE)</small></motion.figcaption>
          <motion.ul className={styles.dashboardLegend} aria-label="Five phrase themes" initial={entrance.reduced ? false : { opacity: 0, y: 5 }} animate={{ opacity: entrance.entered ? 1 : 0, y: entrance.entered ? 0 : 5 }} transition={{ delay: motionTime(.98), duration: motionTime(.2) }}>
            {timeThemeOrder.map((theme, index) => <li key={theme}><i className={styles[`themeKey${index}`]} aria-hidden="true" />{timeThemeLabels[theme]}</li>)}
          </motion.ul>
        </figure>
        <figure className={styles.fullYearFigure}>
          <div className={styles.segmentedYearBars} role="img" aria-label="Eleven twenty-year media columns. Height is the equal-term own-peak index; each column is divided into optical, sound and film, broadcast, and digital groups.">
            {timeStudy.mediaBands.map((band, bandIndex) => (
              <motion.i key={band.startYear} style={{ "--band-height": band.totalEqualTermIndex / maximumBand, "--mark-index": bandIndex, transformOrigin: "bottom center" } as CSSProperties} initial={entrance.reduced ? false : { opacity: .16, scaleY: .02 }} animate={{ opacity: entrance.entered ? 1 : .16, scaleY: entrance.entered ? 1 : .02 }} transition={{ delay: motionTime(.2 + bandIndex * .035), duration: motionTime(.62), ease: [0.2, 0.75, 0.25, 1] }}>
                {mediaEraOrder.map((era, eraIndex) => (
                  <motion.b key={era} className={styles[`mediaEra${eraIndex}`]} style={{ "--segment-share": band.totalEqualTermIndex > 0 ? band.eras[era] / band.totalEqualTermIndex : 0 } as CSSProperties} initial={entrance.reduced ? false : { opacity: 0 }} animate={{ opacity: entrance.entered ? 1 : 0 }} transition={{ delay: motionTime(.34 + bandIndex * .035 + eraIndex * .025), duration: motionTime(.16) }} />
                ))}
                {(bandIndex === 0 || bandIndex === 5 || bandIndex === 10) && <span>{band.startYear}</span>}
              </motion.i>
            ))}
          </div>
          <motion.figcaption initial={entrance.reduced ? false : { opacity: 0 }} animate={{ opacity: entrance.entered ? 1 : 0 }} transition={{ delay: motionTime(.92), duration: motionTime(.18) }}><b>{timeStudy.rawMediaCellCount.toLocaleString("en-US")}</b> yearly media-term points<small>20-YEAR BANDS × EACH TERM’S OWN PEAK</small></motion.figcaption>
          <motion.ul className={styles.dashboardLegend} aria-label="Four media groups" initial={entrance.reduced ? false : { opacity: 0, y: 5 }} animate={{ opacity: entrance.entered ? 1 : 0, y: entrance.entered ? 0 : 5 }} transition={{ delay: motionTime(.98), duration: motionTime(.2) }}>
            {mediaEraOrder.map((era, index) => <li key={era}><i className={styles[`mediaEra${index}`]} aria-hidden="true" />{mediaEraLabels[era]}</li>)}
          </motion.ul>
        </figure>
      </div>
    </section>
  );
}

function trendPath(values: readonly (number | null)[]) {
  const left = 34;
  const right = 334;
  const top = 16;
  const bottom = 190;
  let drawing = false;
  return values.map((value, index) => {
    if (value === null) { drawing = false; return ""; }
    const x = left + index / Math.max(values.length - 1, 1) * (right - left);
    const y = bottom - value * (bottom - top);
    const command = drawing ? "L" : "M";
    drawing = true;
    return `${command}${x.toFixed(2)} ${y.toFixed(2)}`;
  }).filter(Boolean).join(" ");
}

export function ArtificialBranchTrend() {
  const tickYears = [1800, 1850, 1900, 1950, 2019];
  const entrance = useArtificialEntrance<HTMLElement>();
  const trendClipPrefix = useId().replace(/:/g, "");
  return (
    <section ref={entrance.ref} className={styles.branchTrend} data-motion-scene data-surface-category="visualization" aria-labelledby="artificial-branch-trend-title">
      <p>FIVE SELECTED BRANCHES · SAME TWO-WORD BASELINE</p>
      <h2 id="artificial-branch-trend-title">How the selected phrase mix changes across 220 years.</h2>
      <svg viewBox="0 0 350 220" role="img" aria-label="Five lines show each theme's share of the selected exact two-word phrase total from 1800 through 2019, using an eleven-year moving window.">
        <defs aria-hidden="true">
          {timeStudy.branchTrend.themes.map((series, index) => (
            <clipPath key={series.theme} id={`${trendClipPrefix}-trend-${index}`} clipPathUnits="userSpaceOnUse">
              <motion.rect
                x="32"
                y="12"
                height="184"
                initial={entrance.reduced ? false : { width: 0 }}
                animate={{ width: entrance.entered ? 304 : 0 }}
                transition={{ delay: motionTime(.16 + index * .06), duration: motionTime(.82), ease: "linear" }}
              />
            </clipPath>
          ))}
        </defs>
        {[0, .25, .5, .75, 1].map((share, index) => {
          const y = 190 - share * 174;
          return <motion.g key={share} initial={entrance.reduced ? false : { opacity: 0 }} animate={{ opacity: entrance.entered ? 1 : 0 }} transition={{ delay: motionTime(index * .025), duration: motionTime(.18) }}><line x1="34" x2="334" y1={y} y2={y} /><text x="30" y={y + 3} textAnchor="end">{Math.round(share * 100)}%</text></motion.g>;
        })}
        {tickYears.map((year, index) => {
          const x = 34 + (year - 1800) / 219 * 300;
          return <motion.g key={year} initial={entrance.reduced ? false : { opacity: 0 }} animate={{ opacity: entrance.entered ? 1 : 0 }} transition={{ delay: motionTime(index * .025), duration: motionTime(.18) }}><line x1={x} x2={x} y1="16" y2="190" /><text x={x} y="211" textAnchor={year === 1800 ? "start" : year === 2019 ? "end" : "middle"}>{year}</text></motion.g>;
        })}
        {timeStudy.branchTrend.themes.map((series, index) => (
          <motion.path
            key={series.theme}
            className={styles[`trendTheme${index}`]}
            d={trendPath(series.values)}
            clipPath={`url(#${trendClipPrefix}-trend-${index})`}
            initial={entrance.reduced ? false : { opacity: .22 }}
            animate={{ opacity: entrance.entered ? 1 : .22 }}
            transition={{ delay: motionTime(.16 + index * .06), duration: motionTime(.2) }}
          />
        ))}
      </svg>
      <ul className={styles.trendLegend}>{timeThemeOrder.map((theme, index) => <motion.li key={theme} initial={entrance.reduced ? false : { opacity: 0 }} animate={{ opacity: entrance.entered ? 1 : 0 }} transition={{ delay: motionTime(.22 + index * .06), duration: motionTime(.2) }}><motion.i className={styles[`trendTheme${index}`]} aria-hidden="true" initial={entrance.reduced ? false : { scaleX: 0 }} animate={{ scaleX: entrance.entered ? 1 : 0 }} transition={{ delay: motionTime(.16 + index * .06), duration: motionTime(.82), ease: "linear" }} />{timeThemeLabels[theme]}</motion.li>)}</ul>
      <motion.p className={styles.trendUnit} initial={entrance.reduced ? false : { opacity: 0 }} animate={{ opacity: entrance.entered ? 1 : 0 }} transition={{ delay: motionTime(1.02), duration: motionTime(.18) }}>Share of the 29 selected exact two-word phrases; 11-year moving window.</motion.p>
    </section>
  );
}

type EvidenceContext = "function" | "relevance" | "support";

const matrixSlots = [
  0, 1, 2, 4,
  6, 8, 9, 11,
  12, 13, 15, 17,
  18, 20, 21, 23,
  24, 25, 26, 28, 29,
  30, 32, 33, 35,
] as const;

const contextOptions: Array<{ id: EvidenceContext; label: string; title: string }> = [
  { id: "function", label: "WHAT IT DOES", title: "Relationship to a human function" },
  { id: "relevance", label: "USED NOW?", title: "Used now, emerging, historical, or speculative" },
  { id: "support", label: "HOW CLEARLY", title: "How clearly the cited passage explains the term" },
];

function matrixState(example: HumanEvidenceExample, context: EvidenceContext) {
  if (context === "support") return example.confidence === "high" ? "matrixWhiteSolid" : "matrixRedRing";
  if (context === "relevance") {
    if (example.currentRelevance === "modern_established") return "matrixWhiteSolid";
    if (example.currentRelevance === "modern_emerging") return "matrixWhiteRing";
    if (example.currentRelevance === "historical") return "matrixRedCore";
    return "matrixRedSolid";
  }
  const states: Record<HumanEvidenceExample["functionMode"], string> = {
    support: "matrixWhiteSolid",
    replacement: "matrixWhiteRing",
    continuation: "matrixRedCore",
    simulation: "matrixRedRing",
    speculative_extension: "matrixRedSolid",
  };
  return states[example.functionMode];
}

function contextLegendItems(context: EvidenceContext) {
  if (context === "support") return [
    { state: "matrixWhiteSolid", label: "solid white · directly explains the term" },
    { state: "matrixRedRing", label: "thin white ring · supporting context in the cited passage" },
  ];
  if (context === "relevance") return [
    { state: "matrixWhiteSolid", label: "solid white · established" },
    { state: "matrixWhiteRing", label: "thick white ring · emerging" },
    { state: "matrixRedCore", label: "white with black core · historical" },
    { state: "matrixRedSolid", label: "double white ring · speculative" },
  ];
  return [
    { state: "matrixWhiteSolid", label: "solid white · bodily support" },
    { state: "matrixWhiteRing", label: "thick white ring · functional replacement" },
    { state: "matrixRedCore", label: "white with black core · reproductive continuation" },
    { state: "matrixRedRing", label: "thin white ring · modeled process" },
    { state: "matrixRedSolid", label: "double white ring · speculative extension" },
  ];
}

function contextReading(example: HumanEvidenceExample, context: EvidenceContext) {
  if (context === "support") return example.confidence === "high" ? "the cited passage explains the term directly" : "the cited passage adds supporting context";
  if (context === "relevance") return relevanceLabels[example.currentRelevance];
  return functionLabels[example.functionMode];
}

type MatrixState = "matrixWhiteSolid" | "matrixWhiteRing" | "matrixRedCore" | "matrixRedRing" | "matrixRedSolid";

const matrixGeometry: Record<MatrixState, { fill: number; hole: number; inner: number; outer: number; stroke: number }> = {
  matrixWhiteSolid: { fill: 40, hole: 0, inner: 0, outer: 0, stroke: 0 },
  matrixWhiteRing: { fill: 0, hole: 0, inner: 0, outer: 37, stroke: 9 },
  matrixRedCore: { fill: 40, hole: 13, inner: 0, outer: 0, stroke: 0 },
  matrixRedRing: { fill: 0, hole: 0, inner: 0, outer: 39, stroke: 4 },
  matrixRedSolid: { fill: 0, hole: 0, inner: 28, outer: 40, stroke: 3 },
};

function MatrixGlyph({ entered, index, reduced, selected, state }: { entered: boolean; index: number; reduced: boolean; selected: boolean; state: MatrixState }) {
  const previousStateRef = useRef(state);
  const enteredRef = useRef(false);
  const previous = matrixGeometry[previousStateRef.current];
  const next = matrixGeometry[state];
  const changing = enteredRef.current && previousStateRef.current !== state;
  const delay = reduced ? 0 : motionTime(index * .018);
  const value = (from: number, target: number) => changing ? [from, 0, target] : entered ? target : 0;

  useEffect(() => {
    previousStateRef.current = state;
    if (entered) enteredRef.current = true;
  }, [entered, state]);

  return (
    <motion.svg
      className={styles.matrixGlyph}
      viewBox="0 0 100 100"
      aria-hidden="true"
      animate={{ scale: selected && !reduced ? [.94, 1.07, 1] : 1 }}
      transition={{ duration: IMMEDIATE_FEEDBACK_SECONDS, ease: "easeOut" }}
    >
      <motion.circle className={styles.matrixGlyphFill} cx="50" cy="50" animate={{ r: value(previous.fill, next.fill), opacity: entered ? 1 : 0 }} transition={{ delay, duration: motionTime(changing ? .42 : .34), times: changing ? [0, .32, 1] : undefined, ease: "easeOut" }} />
      <motion.circle className={styles.matrixGlyphHole} cx="50" cy="50" animate={{ r: value(previous.hole, next.hole), opacity: entered && next.hole > 0 ? 1 : 0 }} transition={{ delay, duration: motionTime(changing ? .42 : .34), times: changing ? [0, .32, 1] : undefined, ease: "easeOut" }} />
      <motion.circle className={styles.matrixGlyphRing} cx="50" cy="50" fill="none" animate={{ r: changing ? [previous.outer || 39, 39, next.outer || 39] : 39, pathLength: value(previous.outer > 0 ? 1 : 0, next.outer > 0 ? 1 : 0), strokeWidth: value(previous.stroke, next.stroke), opacity: entered && next.outer > 0 ? 1 : 0 }} transition={{ delay, duration: motionTime(changing ? .42 : .34), times: changing ? [0, .32, 1] : undefined, ease: "linear" }} />
      <motion.circle className={styles.matrixGlyphRing} cx="50" cy="50" fill="none" animate={{ r: next.inner || 28, pathLength: value(previous.inner > 0 ? 1 : 0, next.inner > 0 ? 1 : 0), strokeWidth: value(previous.inner > 0 ? previous.stroke : 0, next.inner > 0 ? next.stroke : 0), opacity: entered && next.inner > 0 ? 1 : 0 }} transition={{ delay: delay + (next.inner > 0 ? motionTime(.06) : 0), duration: motionTime(changing ? .36 : .3), times: changing ? [0, .32, 1] : undefined, ease: "linear" }} />
      <motion.circle className={styles.matrixGlyphSelection} cx="50" cy="50" r="47" fill="none" initial={false} animate={{ pathLength: selected ? 1 : 0, opacity: selected ? 1 : 0 }} transition={{ duration: IMMEDIATE_FEEDBACK_SECONDS, ease: "linear" }} />
    </motion.svg>
  );
}

export function EvidenceContextExplorer({ examples }: { examples: readonly HumanEvidenceExample[] }) {
  const entrance = useArtificialEntrance<HTMLElement>();
  const panelId = useId();
  const instructionId = `${panelId}-instructions`;
  const [context, setContext] = useState<EvidenceContext>("function");
  const [selectedId, setSelectedId] = useState(() => examples[1]?.id ?? examples[0]?.id ?? "");
  const [helpOpen, setHelpOpen] = useState(false);
  const dotRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const selected = examples.find((example) => example.id === selectedId);
  const activeIndex = contextOptions.findIndex((option) => option.id === context);
  const moveGridFocus = useCallback((currentIndex: number, key: string) => {
    let nextIndex = currentIndex;
    if (key === "ArrowLeft") nextIndex = Math.max(0, currentIndex - 1);
    else if (key === "ArrowRight") nextIndex = Math.min(examples.length - 1, currentIndex + 1);
    else if (key === "ArrowUp") nextIndex = Math.max(0, currentIndex - 5);
    else if (key === "ArrowDown") nextIndex = Math.min(examples.length - 1, currentIndex + 5);
    else if (key === "Home") nextIndex = 0;
    else if (key === "End") nextIndex = examples.length - 1;
    else return false;
    const next = examples[nextIndex];
    if (!next) return false;
    setSelectedId(next.id);
    window.requestAnimationFrame(() => dotRefs.current[nextIndex]?.focus());
    return true;
  }, [examples]);
  return (
    <section ref={entrance.ref} className={styles.dotMatrixPage} data-motion-scene data-surface-category="visualization" aria-labelledby="artificial-context-title">
      <header className={styles.contextHeader}>
        <div className={styles.contextHeaderTop}>
          <p className={styles.contextPageIndex} aria-hidden="true">04</p>
          <button className={styles.instructionAsterisk} type="button" aria-expanded={helpOpen} aria-controls={instructionId} aria-label={`${helpOpen ? "Close" : "Open"} how to read this figure`} onClick={() => setHelpOpen((open) => !open)}><span aria-hidden="true">*</span></button>
        </div>
        <h2 id="artificial-context-title" className={styles.visuallyHidden}>Read the same cited material three ways</h2>
        <div className={styles.contextSelectedSummary}>
          {examples.map((example) => (
            <p key={example.id} className={example.id === selectedId ? styles.contextSummaryActive : styles.contextSummaryInactive} aria-hidden={example.id !== selectedId}>
              {readableSummary(example.shortSummary)}
            </p>
          ))}
        </div>
        <div className={styles.contextControls} role="group" aria-label="Choose one of three questions for the same cited material">
          {contextOptions.map((option, index) => (
            <button key={option.id} type="button" aria-pressed={context === option.id} aria-controls="artificial-context-grid" onClick={() => setContext(option.id)}><span>{String(index + 1).padStart(2, "0")}</span>{option.label}</button>
          ))}
        </div>
      </header>
      <div id={instructionId} className={styles.entityInstruction} role="note" hidden={!helpOpen}>
        <b>HOW TO READ</b>
        <p>The same cited passages stay in the same positions in all three views. Choose what the word does, whether the use is present now, or how clearly the passage explains the term; then choose any circle. Empty spaces carry no data.</p>
        <ul className={styles.contextLegend}>{contextLegendItems(context).map((item) => <li key={item.label}><i className={[styles.contextLegendSwatch, styles[item.state]].join(" ")} aria-hidden="true" /><span>{item.label}</span></li>)}</ul>
      </div>
      <div className={styles.dotMatrixComposition}>
        <div id="artificial-context-grid" className={styles.dotGrid} role="group" aria-label={`${examples.length} cited passages shown by ${contextOptions[activeIndex].title.toLowerCase()}.`}>
          {examples.map((example, index) => (
            (() => {
              const slot = matrixSlots[index] ?? index;
              return (
            <button
              key={example.id}
              ref={(node) => { dotRefs.current[index] = node; }}
              data-record-control
              type="button"
              className={example.id === selectedId ? styles.selectedDot : undefined}
              style={{ "--mark-index": index, gridColumn: slot % 6 + 1, gridRow: Math.floor(slot / 6) + 1 } as CSSProperties}
              aria-pressed={example.id === selectedId}
              aria-controls="artificial-context-title"
              aria-label={`${example.term}. ${contextReading(example, context)}.`}
              tabIndex={example.id === selectedId || (!selectedId && index === 0) ? 0 : -1}
              onClick={() => setSelectedId(example.id)}
              onKeyDown={(event) => {
                if (moveGridFocus(index, event.key)) event.preventDefault();
              }}
            >
              <MatrixGlyph entered={entrance.entered} index={index} reduced={entrance.reduced} selected={example.id === selectedId} state={matrixState(example, context) as MatrixState} />
              <span className={styles.visuallyHidden}>{example.term}</span>
            </button>
              );
            })()
          ))}
        </div>
      </div>
      <span className={styles.dotLiveStatus} role="status" aria-live="polite">Showing {contextOptions[activeIndex].title.toLowerCase()}.{selected ? ` Source chosen: ${selected.term}.` : " Choose a circle for its source."}</span>
    </section>
  );
}
