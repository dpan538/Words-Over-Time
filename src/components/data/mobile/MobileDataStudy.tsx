"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type MouseEvent, type ReactNode, type RefObject } from "react";
import { dataMobileExperience as study } from "@/data/dataMobileExperience";
import { MobileScrollDotScene } from "./MobileScrollDotScene";
import { type DotLayoutName } from "./mobile-dot-layouts";
import styles from "./mobile-data.module.css";

type CustomProperties = CSSProperties & Record<`--${string}`, string | number>;

const periodLabels = {
  "1850_1899": "1850—99",
  "1930_1949": "1930—49",
  "1950_1969": "1950—69",
  "1970_1989": "1970—89",
  "1990_2004": "1990—04",
  "2005_2019": "2005—19",
} as const;

function format(value: number, digits = 3) {
  return value.toFixed(digits);
}

function areaDotStyle(value: number, maximum: number, minimum = 5, range = 13): CustomProperties {
  const diameter = minimum + Math.sqrt(Math.max(0, value) / maximum) * range;
  return { "--data-dot-size": `${diameter.toFixed(3)}px` };
}

function fillDotStyle(value: number, maximum: number, index: number, count: number): CustomProperties {
  return { "--dot-fill": Math.max(0, Math.min(1, value / maximum * count - index)).toFixed(4) };
}

function cardAreaDotStyle(value: number, maximum: number, minimum = 5, range = 20): CustomProperties {
  const diameter = minimum + Math.sqrt(Math.max(0, value) / maximum) * range;
  return { "--card-dot-size": `${diameter.toFixed(3)}px` };
}

function massDotStyle(index: number, late: number, early: number): CustomProperties {
  const row = Math.floor(index / 10);
  const column = index % 10;
  return {
    ...fillDotStyle(late, 100, index, 100),
    "--dot-base-alpha": index < Math.round(early) ? .28 : .07,
    "--mass-dot-y": `${(Math.abs(column - 4.5) * 2.7 + Math.abs(row - 5) * .35).toFixed(2)}px`,
  };
}

function polarPointStyle(angle: number, radius: number, size = 4): CustomProperties {
  const radians = angle / 180 * Math.PI;
  return {
    "--polar-x": `${(50 + Math.cos(radians) * radius).toFixed(4)}%`,
    "--polar-y": `${(50 + Math.sin(radians) * radius).toFixed(4)}%`,
    "--polar-size": `${size}px`,
  };
}

type MorphPoint = (typeof study.morph.points)[number];
type MorphPosition = { x: number; y: number };

function stableCoordinate(value: number) {
  return Number(value.toFixed(4));
}

function smoothStep(value: number) {
  const clamped = Math.max(0, Math.min(1, value));
  return clamped * clamped * (3 - 2 * clamped);
}

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function stableProgress(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.round(clamp01(value) * 10_000) / 10_000;
}

function mix(from: number, to: number, progress: number) {
  return from + (to - from) * progress;
}

function segment(progress: number, start: number, end: number) {
  return clamp01((progress - start) / (end - start));
}

function smoothstep(value: number) {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
}

function useElementScrollProgress<T extends HTMLElement>(
  ref: RefObject<T | null>,
  startViewport = 0.82,
  endViewport = 0.2,
) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;

      const element = ref.current;
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const start = window.innerHeight * startViewport;
      const end = window.innerHeight * endViewport;
      const next = stableProgress((start - rect.top) / (start - end));

      setProgress((previous) =>
        Math.abs(previous - next) < 0.0005 ? previous : next,
      );
    };

    const schedule = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    const resizeObserver = typeof ResizeObserver === "undefined"
      ? null
      : new ResizeObserver(schedule);

    const observedElement = ref.current;
    if (observedElement) resizeObserver?.observe(observedElement);
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("pageshow", schedule);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("pageshow", schedule);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [endViewport, ref, startViewport]);

  return progress;
}

const HERO_LINE_POINTS = [
  { x: 20, y: 34 },
  { x: 32, y: 34 },
  { x: 44, y: 34 },
  { x: 56, y: 34 },
  { x: 68, y: 34 },
  { x: 80, y: 34 },
] as const;

const HERO_ARROW_POINTS = [
  { x: 34, y: 44 },
  { x: 50, y: 10 },
  { x: 50, y: 25 },
  { x: 50, y: 40 },
  { x: 50, y: 61 },
  { x: 66, y: 44 },
] as const;

function HeroSixDotArrow() {
  const ref = useRef<HTMLDivElement>(null);
  const progress = useElementScrollProgress(ref, 0.58, 0.08);
  const morph = smoothstep(segment(progress, 0.08, 0.88));

  return (
    <div ref={ref} className={styles.heroDotStage} aria-hidden="true">
      <svg viewBox="0 0 100 72" className={styles.heroDotSvg} role="presentation">
        {HERO_LINE_POINTS.map((start, index) => {
          const end = HERO_ARROW_POINTS[index];
          const wave = Math.sin(morph * Math.PI) * Math.sin(index * 1.35) * 4.8;

          return (
            <circle
              key={index}
              cx={mix(start.x, end.x, morph)}
              cy={mix(start.y, end.y, morph) + wave}
              r="4.2"
              className={styles.heroDot}
            />
          );
        })}
      </svg>
    </div>
  );
}

function ClosingDotMerge() {
  const ref = useRef<HTMLDivElement>(null);
  const progress = useElementScrollProgress(ref, 0.86, 0.64);
  const merge = smoothstep(segment(progress, 0, 0.72));
  const resolveToOne = smoothstep(segment(progress, 0.55, 0.78));

  return (
    <div ref={ref} className={styles.closingDotMerge} aria-hidden="true">
      <div className={styles.closingDotMergeStage}>
        <svg viewBox="0 0 100 42" className={styles.closingDotMergeSvg} role="presentation">
          {HERO_LINE_POINTS.map((start, index) => (
            <circle
              key={index}
              cx={mix(start.x, 50, merge)}
              cy="21"
              r={index === 2 ? 4.2 : mix(4.2, 0, resolveToOne)}
              opacity={index === 2 ? 1 : 1 - resolveToOne}
              className={styles.closingDotMergeDot}
            />
          ))}
        </svg>
      </div>
    </div>
  );
}

let cancelBackToTopAnimation: (() => void) | null = null;

function animateBackToTop(event: MouseEvent<HTMLAnchorElement>) {
  event.preventDefault();
  cancelBackToTopAnimation?.();

  const root = document.documentElement;
  const body = document.body;
  const startY = window.scrollY;
  const previousRootBehavior = root.style.scrollBehavior;
  const previousBodyBehavior = body.style.scrollBehavior;

  root.style.scrollBehavior = "auto";
  body.style.scrollBehavior = "auto";

  const restore = () => {
    root.style.scrollBehavior = previousRootBehavior;
    body.style.scrollBehavior = previousBodyBehavior;
    window.removeEventListener("wheel", stopForUserInput);
    window.removeEventListener("touchstart", stopForUserInput);
    window.removeEventListener("pointerdown", stopForUserInput);
    window.removeEventListener("keydown", stopForUserInput);
    cancelBackToTopAnimation = null;
  };

  let frame = 0;
  let active = true;

  function stopForUserInput() {
    if (!active) return;
    active = false;
    window.cancelAnimationFrame(frame);
    restore();
  }

  cancelBackToTopAnimation = stopForUserInput;

  if (startY <= 0 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    root.scrollTop = 0;
    body.scrollTop = 0;
    window.scrollTo(0, 0);
    active = false;
    restore();
    return;
  }

  window.addEventListener("wheel", stopForUserInput, { passive: true });
  window.addEventListener("touchstart", stopForUserInput, { passive: true });
  window.addEventListener("pointerdown", stopForUserInput, { passive: true });
  window.addEventListener("keydown", stopForUserInput);

  const duration = 700;
  const startedAt = performance.now();

  const step = (now: number) => {
    if (!active) return;

    const progress = clamp01((now - startedAt) / duration);
    const nextY = Math.round(startY * (1 - progress));

    root.scrollTop = nextY;
    body.scrollTop = nextY;
    window.scrollTo(0, nextY);

    if (progress < 1) {
      frame = window.requestAnimationFrame(step);
      return;
    }

    active = false;
    root.scrollTop = 0;
    body.scrollTop = 0;
    window.scrollTo(0, 0);
    restore();
  };

  frame = window.requestAnimationFrame(step);
}

function seededFraction(seed: number) {
  const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return value - Math.floor(value);
}

function givenPosition(point: MorphPoint): MorphPosition {
  const angle = -Math.PI / 2 + point.yearIndex / 10 * Math.PI * 2 + point.decadeIndex * Math.PI / 10;
  const radius = 9 + point.decadeIndex * 5.2;
  return { x: stableCoordinate(50 + Math.cos(angle) * radius), y: stableCoordinate(50 + Math.sin(angle) * radius) };
}

function chronologyGridPosition(point: MorphPoint): MorphPosition {
  return {
    x: stableCoordinate(12 + point.decadeIndex * 12.67),
    y: stableCoordinate(11 + point.yearIndex * 8.65),
  };
}

function createCollectedPositions() {
  const slots: MorphPosition[] = [{ x: 50, y: 50 }];
  const rings = [
    { count: 6, radius: 10 },
    { count: 12, radius: 18.5 },
    { count: 18, radius: 27 },
    { count: 24, radius: 35 },
    { count: 9, radius: 42 },
  ];

  for (const [ringIndex, ring] of rings.entries()) {
    const phase = -Math.PI / 2 + (ringIndex % 2) * Math.PI / ring.count;
    for (let index = 0; index < ring.count; index += 1) {
      const angle = phase + index / ring.count * Math.PI * 2;
      slots.push({ x: stableCoordinate(50 + Math.cos(angle) * ring.radius), y: stableCoordinate(50 + Math.sin(angle) * ring.radius) });
    }
  }

  const ranked = [...study.morph.points].sort((left, right) => right.collected - left.collected || left.year - right.year);
  return new Map(ranked.map((point, index) => [point.year, slots[index]]));
}

const collectedPositions = createCollectedPositions();

type NamedMorphState = "start" | "end";

const namedBadgeColors = ["#ff5a3d", "#f6c73f", "#2d7dff", "#a65bf4", "#24d39a"] as const;
const namedWordColors = ["#ff806b", "#ffdb68", "#72c8ff", "#c59aff", "#56e2b5"] as const;
const namedLeadPositions = [
  { x: 82, y: 0 }, { x: 62, y: 13 },
  { x: 90, y: 24 }, { x: 72, y: 39 },
  { x: 86, y: 54 }, { x: 14, y: 60 },
  { x: 48, y: 72 }, { x: 76, y: 82 },
  { x: 21, y: 91 }, { x: 57, y: 98 },
] as const;

const namedMorphPoints = study.named.terms.flatMap((term, termIndex) =>
  term.annualPoints.map(({ year, value }, yearIndex) => ({
    id: `${term.id}-${year}`,
    label: term.label,
    year,
    yearIndex,
    termIndex,
    value,
  })),
);

function namedMorphPosition(termIndex: number, yearIndex: number, state: NamedMorphState): MorphPosition {
  if (state === "start") {
    const isLead = yearIndex === 0 || yearIndex === 69;
    if (isLead) return namedLeadPositions[termIndex * 2 + (yearIndex === 69 ? 1 : 0)];
    const seed = yearIndex + termIndex * 73;
    return {
      x: stableCoordinate(6 + seededFraction(seed + .17) * 88),
      y: stableCoordinate(-4 + seededFraction(seed + 101.31) * 38),
    };
  }
  const boxes = [
    { x: 25, y: 8, width: 38, height: 10 },
    { x: 75, y: 8, width: 38, height: 10 },
    { x: 23, y: 18, width: 30, height: 10 },
    { x: 64, y: 18, width: 38, height: 10 },
    { x: 51, y: 29, width: 56, height: 10 },
  ];
  const box = boxes[termIndex];
  const seed = yearIndex + termIndex * 79;
  return {
    x: stableCoordinate(box.x + (seededFraction(seed + 211.7) - .5) * box.width),
    y: stableCoordinate(box.y + (seededFraction(seed + 419.2) - .5) * box.height),
  };
}

function namedBurstPosition(termIndex: number, yearIndex: number): MorphPosition {
  const ordinal = termIndex * 70 + yearIndex;
  const angle = ordinal * 2.399963229728653 + seededFraction(ordinal + 317.4) * .42;
  const radius = 18 + Math.pow(seededFraction(ordinal + 557.8), .58) * 70;
  return {
    x: stableCoordinate(50 + Math.cos(angle) * radius),
    y: stableCoordinate(50 + Math.sin(angle) * radius * .88),
  };
}

function namedMorphDotStyle(termIndex: number, yearIndex: number, value: number, state: NamedMorphState): CustomProperties {
  const position = namedMorphPosition(termIndex, yearIndex, state);
  return {
    ...areaDotStyle(value, study.named.sharedDomainMax, 3.2, 11.8),
    "--badge-color": namedBadgeColors[termIndex],
    "--reveal-threshold": (0.05 + seededFraction(termIndex * 70 + yearIndex + 811.3) * .27).toFixed(4),
    "--named-dot-x": `${position.x}%`,
    "--named-dot-y": `${position.y}%`,
  };
}

const namedAnnualPeak = namedMorphPoints.reduce((winner, point) => point.value > winner.value ? point : winner);
const sensitiveLatest = study.named.terms.find((term) => term.id === "sensitive")!.annualPoints.at(-1)!;

function morphPosition(point: MorphPoint, state: "given" | "collected") {
  if (state === "given") return givenPosition(point);
  return collectedPositions.get(point.year) ?? givenPosition(point);
}

function dotStyle(point: MorphPoint, state: "given" | "collected"): CustomProperties {
  const position = morphPosition(point, state);
  const diameter = (6 + Math.sqrt(point[state] / study.morph.sharedDomainMax) * 20).toFixed(3);
  return {
    "--dot-x": `${position.x}%`,
    "--dot-y": `${position.y}%`,
    "--dot-size": `${diameter}px`,
  };
}

function StudyHeader() {
  return (
    <header className={styles.siteHeader}>
      <nav aria-label="Primary navigation">
        <Link href="/">WORDS OVER TIME</Link>
        <Link href="/about">ABOUT</Link>
      </nav>
    </header>
  );
}

function Movement({
  align = "left",
  bridgeLabel,
  children,
  statement,
}: {
  align?: "left" | "right";
  bridgeLabel: string;
  children: ReactNode;
  statement: ReactNode;
}) {
  return (
    <section className={`${styles.flowMovement} ${align === "right" ? styles.alignRight : ""}`}>
      <h2 className={styles.movementStatement}>{statement}</h2>
      {children}
      <div className={styles.movementBridge}>
        <div className={styles.bridgeRule} aria-hidden="true"><i /><span>◆</span><i /></div>
        <p className={styles.bridgeLabel}>{bridgeLabel}</p>
      </div>
    </section>
  );
}

const CHAPTER_RELAY_TONES = [
  styles.relayMass,
  styles.relayCut,
  styles.relayPackaged,
  styles.relayNamed,
  styles.relayRuled,
  styles.relayMade,
] as const;

function NarrativeParagraph({ children, label, step }: { children: ReactNode; label: string; step: number }) {
  const relayProgress = `${(step / (CHAPTER_RELAY_TONES.length - 1) * 83.333).toFixed(3)}%`;

  return (
    <section
      className={styles.narrativeParagraph}
      aria-label={label}
      style={{ "--relay-progress": relayProgress } as CustomProperties}
    >
      <div className={styles.chapterRelay} aria-hidden="true">
        <i className={styles.relayLine} />
        <i className={styles.relayProgress} />
        <div className={styles.relayNodes}>
          {CHAPTER_RELAY_TONES.map((tone, index) => (
            <span
              className={`${styles.relayNode} ${tone} ${index <= step ? styles.relayNodeReached : ""} ${index === step ? styles.relayNodeActive : ""}`}
              key={tone}
            />
          ))}
        </div>
      </div>
      <div className={styles.narrativeMeta}>
        <span>{String(step + 1).padStart(2, "0")} / 06</span>
        <span>{label}</span>
      </div>
      <p>{children}</p>
    </section>
  );
}

function DotCardFrame({
  id,
  cardClassName,
  ariaLabel,
  index,
  title,
  range,
  fromLayout,
  toLayout,
  children,
  value,
}: {
  id: string;
  cardClassName: string;
  ariaLabel: string;
  index: string;
  title: string;
  range: string;
  fromLayout: DotLayoutName;
  toLayout: DotLayoutName;
  children?: ReactNode;
  value: ReactNode;
}) {
  return (
    <figure id={id} className={`${styles.squareCard} ${styles.dotCard} ${cardClassName}`} aria-label={ariaLabel}>
      <figcaption className={styles.dotCardHeader}>
        <span>{index} / {title}</span>
        <span>{range}</span>
      </figcaption>
      <div className={styles.dotCardPlot}>
        <MobileScrollDotScene fromLayout={fromLayout} toLayout={toLayout}>
          {children}
        </MobileScrollDotScene>
      </div>
      <div className={styles.dotCardValue}>{value}</div>
    </figure>
  );
}

function MassCard() {
  const amount = study.mass.amountShare;
  const singular = study.mass.singularAgreementShare;
  const late = amount[1];
  return (
    <DotCardFrame
      id="m-data-card-mass"
      cardClassName={styles.massCard}
      ariaLabel={`Mass. Amount-of-data share changes from ${amount[0].percent.toFixed(2)} percent in the 1940s to ${amount[1].percent.toFixed(2)} percent in the 2010s. Across seven selected agreement pairs, singular-form share rises from ${singular[0].percent.toFixed(2)} to ${singular[1].percent.toFixed(2)} percent.`}
      index="01"
      title="MASS"
      range="94 DOTS"
      fromLayout="scatter"
      toLayout="mass"
      value={(
        <div className={styles.massCardReadout}>
          <div>
            <span>1940s / AMOUNT</span>
            <strong>{amount[0].percent.toFixed(1)}</strong>
          </div>
          <div>
            <span>2010s / AMOUNT</span>
            <strong>{late.percent.toFixed(1)}%</strong>
          </div>
        </div>
      )}
    />
  );
}

const CUT_ITEM_ORDER = ["sheets", "types", "points", "sources"] as const;
const CUT_X = [13, 37, 62, 86] as const;
const CUT_BASELINE_Y = 50;
const CUT_SCALE_MAX = 2.1;

function cutRadius(value: number) {
  return 3.8 + Math.sqrt(value / CUT_SCALE_MAX) * 10.2;
}

function CutCard() {
  const cardRef = useRef<HTMLElement>(null);
  const progress = useElementScrollProgress(cardRef);
  const t = smoothstep(progress);
  const items = CUT_ITEM_ORDER.map((id) => study.cut.items.find((item) => item.id === id)!);
  const displayed = items.map((item) => mix(item.early, item.late, t));
  const maximumIndex = displayed.reduce((winner, value, index, values) => value > values[winner] ? index : winner, 0);

  return (
    <article
      ref={cardRef}
      id="m-data-card-cut"
      className={`${styles.mobileDataCard} ${styles.cardV2} ${styles.cutCard}`}
      aria-label={`Cut. Four baseline-aligned proportional bubbles interpolate from 1950 to 1969 to 2005 to 2019. Late values are ${items.map((item) => `${item.label} ${format(item.late)}`).join(", ")}.`}
    >
      <header className={styles.cardV2Header}>
        <span>02 / CUT</span>
        <span>USES / MILLION</span>
      </header>
      <div className={styles.cardV2Plot}>
        <svg viewBox="0 0 100 70" role="img" aria-label="Four proportional bubbles sharing one baseline.">
          <line className={styles.cutBaseline} x1="4" y1={CUT_BASELINE_Y} x2="96" y2={CUT_BASELINE_Y} />
          {items.map((item, index) => {
            const value = displayed[index];
            const radius = cutRadius(value);
            const centerY = CUT_BASELINE_Y - radius;
            return (
              <g key={item.id}>
                <circle className={styles.cutBubble} cx={CUT_X[index]} cy={centerY} r={radius} />
                <text className={styles.plotValue} x={CUT_X[index]} y={centerY - radius - 2.2} textAnchor="middle">
                  {format(value)}
                </text>
                <text className={styles.plotLabel} x={CUT_X[index]} y={CUT_BASELINE_Y + 8} textAnchor="middle">
                  {item.id.toUpperCase()}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <footer className={styles.cardV2Footer}>
        <span className={styles.cardV2Context}>1950—69 → 2005—19</span>
        <div className={styles.cardV2Metric}>
          <strong>{format(displayed[maximumIndex])}</strong>
          <span>{items[maximumIndex].id.toUpperCase()} / MAX</span>
        </div>
      </footer>
    </article>
  );
}

function PackagedCard() {
  const cardRef = useRef<HTMLElement>(null);
  const progress = useElementScrollProgress(cardRef);
  const stage = clamp01(progress) * 3;
  const fromIndex = Math.floor(stage);
  const toIndex = Math.min(3, fromIndex + 1);
  const stageProgress = smoothstep(stage - fromIndex);
  const currentValues = study.packaged.terms.map((term) =>
    mix(term.values[fromIndex], term.values[toIndex], stageProgress),
  );
  const total = currentValues.reduce((sum, value) => sum + value, 0);
  const currentPeriod = study.packaged.periods[Math.round(stage)];
  const packageClasses = [styles.bubbleToneOne, styles.bubbleToneTwo, styles.bubbleToneThree, styles.bubbleToneFour];
  const rowY = [7, 22, 37, 52] as const;

  return (
    <article
      ref={cardRef}
      id="m-data-card-packaged"
      className={`${styles.mobileDataCard} ${styles.cardV2} ${styles.packagedCard}`}
      aria-label={`Packaged. Four proportional package strips show database, databank, dataset, and metadata across four selected periods. The current total is ${format(total)} uses per million bigrams.`}
    >
      <header className={styles.cardV2Header}>
        <span>03 / PACKAGED</span>
        <span>4 FORMS / 4 PERIODS</span>
      </header>
      <div className={styles.cardV2Plot}>
        <svg viewBox="0 0 100 70" role="img" aria-label="Four horizontal package strips show each form's share of the selected total.">
          {study.packaged.terms.map((term, termIndex) => {
            const share = total > 0 ? currentValues[termIndex] / total : 0;
            const width = share * 55;
            const y = rowY[termIndex];
            return (
              <g key={term.id}>
                <text className={styles.packageRowLabel} x="1" y={y + 7}>{term.label.toUpperCase()}</text>
                <rect className={styles.packageTrack} x="25" y={y} width="55" height="10" rx="1" />
                <rect className={`${styles.packageFill} ${packageClasses[termIndex]}`} x="25" y={y} width={width} height="10" rx="1" />
                <circle className={styles.packageEndDot} cx={25 + width} cy={y + 5} r="1.35" />
                <text className={styles.packagePercent} x="98" y={y + 7} textAnchor="end">
                  {(share * 100).toFixed(1)}%
                </text>
              </g>
            );
          })}
          <text className={styles.plotAxisLabel} x="25" y="68">0%</text>
          <text className={styles.plotAxisLabel} x="80" y="68" textAnchor="end">100%</text>
        </svg>
      </div>
      <footer className={styles.cardV2Footer}>
        <span className={styles.cardV2Context}>{periodLabels[currentPeriod]}</span>
        <div className={styles.cardV2Metric}>
          <strong>{format(total)}</strong>
          <span>FOUR-FORM TOTAL</span>
        </div>
      </footer>
    </article>
  );
}

function MorphDots({ state }: { state: "given" | "collected" }) {
  return (
    <div className={styles.dotField} aria-hidden="true">
      {study.morph.points.map((point) => (
        <i
          className={styles.morphDot}
          key={`${state}-${point.year}`}
          style={dotStyle(point, state)}
        />
      ))}
      <span className={styles.staticLayoutLabel}>{state === "given" ? "DATE ORDER / 7 DECADES" : "CENTER → EDGE / COLLECTED RANK"}</span>
    </div>
  );
}

function StaticMorphPanel({ state }: { state: "given" | "collected" }) {
  const given = state === "given";
  const peak = given ? study.morph.givenPeak : study.morph.collectedPeak;
  const early = study.morph.comparisons[0];
  const late = study.morph.comparisons[1];
  return (
    <figure
      className={`${styles.staticMorphPanel} ${given ? styles.givenPanel : styles.collectedPanel}`}
      aria-label={`Data ${state}, 1950 to 2019. Peak ${format(peak.perMillion)} uses per million bigrams in ${peak.year}. ${periodLabels[early.period]} average ${format(early[state])}; ${periodLabels[late.period]} average ${format(late[state])}.`}
    >
      <div className={styles.morphTopline}><span>EXACT BIGRAM</span><span>1950—2019</span></div>
      <figcaption>{given ? "DATA ARRIVES AS SOMETHING GIVEN." : "DATA ENTERS A SYSTEM OF COLLECTION."}</figcaption>
      <MorphDots state={state} />
      <div className={styles.staticReadouts}>
        <div><span>{periodLabels[early.period]}</span><strong>{format(early[state])}</strong></div>
        <div><span>{periodLabels[late.period]}</span><strong>{format(late[state])}</strong></div>
      </div>
      <p className={styles.morphUnit}>DATA {state.toUpperCase()} / USES PER MILLION BIGRAMS</p>
    </figure>
  );
}

function useScrollMorph(sectionRef: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const mobileQuery = window.matchMedia("(max-width: 959px)");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const forceStaticPreview = new URL(window.location.href).searchParams.get("motion") === "reduce";
    const dots = Array.from(section.querySelectorAll<HTMLElement>("[data-morph-dot]"));
    let animationFrame = 0;
    let listening = false;

    const update = () => {
      animationFrame = 0;
      const bounds = section.getBoundingClientRect();
      const travel = Math.max(1, section.offsetHeight - window.innerHeight);
      const progress = stableProgress(-bounds.top / travel);
      section.style.setProperty("--morph-progress", progress.toFixed(4));

      for (const dot of dots) {
        const given = Number(dot.dataset.given);
        const collected = Number(dot.dataset.collected);
        const givenX = Number(dot.dataset.givenX);
        const givenY = Number(dot.dataset.givenY);
        const gridX = Number(dot.dataset.gridX);
        const gridY = Number(dot.dataset.gridY);
        const collectedX = Number(dot.dataset.collectedX);
        const collectedY = Number(dot.dataset.collectedY);
        const value = given * (1 - progress) + collected * progress;
        const firstHalf = progress <= .5;
        const phase = smoothStep(firstHalf ? progress * 2 : (progress - .5) * 2);
        const fromX = firstHalf ? givenX : gridX;
        const fromY = firstHalf ? givenY : gridY;
        const toX = firstHalf ? gridX : collectedX;
        const toY = firstHalf ? gridY : collectedY;
        const diameter = 6 + Math.sqrt(value / study.morph.sharedDomainMax) * 20;
        dot.style.setProperty("--dot-size", `${diameter.toFixed(3)}px`);
        dot.style.setProperty("--dot-x", `${(fromX * (1 - phase) + toX * phase).toFixed(4)}%`);
        dot.style.setProperty("--dot-y", `${(fromY * (1 - phase) + toY * phase).toFixed(4)}%`);
      }
    };

    const requestUpdate = () => {
      if (!animationFrame) animationFrame = window.requestAnimationFrame(update);
    };

    const stop = () => {
      if (!listening) return;
      listening = false;
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      animationFrame = 0;
      delete section.dataset.morphEnhanced;
      section.style.removeProperty("--morph-progress");
    };

    const configure = () => {
      if (!mobileQuery.matches || motionQuery.matches || forceStaticPreview) {
        stop();
        return;
      }
      if (!listening) {
        listening = true;
        window.addEventListener("scroll", requestUpdate, { passive: true });
        window.addEventListener("resize", requestUpdate, { passive: true });
      }
      update();
      section.dataset.morphEnhanced = "true";
    };

    configure();
    mobileQuery.addEventListener("change", configure);
    motionQuery.addEventListener("change", configure);
    return () => {
      stop();
      mobileQuery.removeEventListener("change", configure);
      motionQuery.removeEventListener("change", configure);
    };
  }, [sectionRef]);
}

function useMobileDataEnvironment() {
  useLayoutEffect(() => {
    const mobileQuery = window.matchMedia("(max-width: 959px)");
    const root = document.documentElement;
    const body = document.body;
    const previous = {
      rootBackground: root.style.backgroundColor,
      rootColorScheme: root.style.colorScheme,
      bodyBackground: body.style.backgroundColor,
      bodyColorScheme: body.style.colorScheme,
    };

    const restore = () => {
      root.style.backgroundColor = previous.rootBackground;
      root.style.colorScheme = previous.rootColorScheme;
      body.style.backgroundColor = previous.bodyBackground;
      body.style.colorScheme = previous.bodyColorScheme;
    };

    const sync = () => {
      if (!mobileQuery.matches) {
        restore();
        return;
      }
      root.style.backgroundColor = "#1570ac";
      root.style.colorScheme = "dark";
      body.style.backgroundColor = "#1570ac";
      body.style.colorScheme = "dark";
    };

    sync();
    mobileQuery.addEventListener("change", sync);
    return () => {
      mobileQuery.removeEventListener("change", sync);
      restore();
    };
  }, []);
}

function GivenCollectedMorph() {
  const sectionRef = useRef<HTMLElement>(null);
  useScrollMorph(sectionRef);

  return (
    <section className={styles.morphScene} ref={sectionRef} aria-labelledby="m-data-morph-heading">
      <h2 className={styles.visuallyHidden} id="m-data-morph-heading">What looks given enters a workflow.</h2>
      <div className={styles.staticMorphFallback}>
        <StaticMorphPanel state="given" />
        <StaticMorphPanel state="collected" />
      </div>
      <figure
        className={styles.morphSticky}
        aria-label={`Scroll comparison of data given and data collected across the same 70 years from 1950 to 2019. Given peaks at ${format(study.morph.givenPeak.perMillion)} uses per million in ${study.morph.givenPeak.year}; collected peaks at ${format(study.morph.collectedPeak.perMillion)} in ${study.morph.collectedPeak.year}. In 2005 to 2019, the averages are ${format(study.morph.comparisons[1].given)} given and ${format(study.morph.comparisons[1].collected)} collected.`}
      >
        <div className={styles.morphPaperLayer} aria-hidden="true" />
        <div className={styles.morphTopline}><span>EXACT BIGRAMS</span><span>70 YEARS / SCROLL</span></div>
        <div className={styles.morphCopyField}>
          <figcaption className={styles.givenCopy}>DATA ARRIVES AS<br />SOMETHING GIVEN.</figcaption>
          <figcaption className={styles.chronologyCopy}>THE SAME 70 YEARS<br />CHANGE ORDER.</figcaption>
          <figcaption className={styles.collectedCopy}>DATA ENTERS A SYSTEM<br />OF COLLECTION.</figcaption>
        </div>
        <div className={styles.dotField} aria-hidden="true">
          {study.morph.points.map((point) => {
            const given = morphPosition(point, "given");
            const grid = chronologyGridPosition(point);
            const collected = morphPosition(point, "collected");
            return (
              <i
                className={styles.morphDot}
                data-collected={point.collected}
                data-collected-x={collected.x}
                data-collected-y={collected.y}
                data-given={point.given}
                data-given-x={given.x}
                data-given-y={given.y}
                data-grid-x={grid.x}
                data-grid-y={grid.y}
                data-morph-dot
                key={point.year}
                style={dotStyle(point, "given")}
              />
            );
          })}
          <span className={`${styles.layoutLabel} ${styles.givenLayoutLabel}`}>DATE ORDER / 7 DECADES</span>
          <span className={`${styles.layoutLabel} ${styles.chronologyLayoutLabel}`}>7 DECADES × 10 YEARS / SAME IDENTITIES</span>
          <span className={`${styles.layoutLabel} ${styles.collectedLayoutLabel}`}>CENTER → EDGE / COLLECTED RANK</span>
        </div>
        <div className={styles.morphReadoutField}>
          <div className={styles.givenReadout}>
            <div><span>1950—69 AVG</span><strong>{format(study.morph.comparisons[0].given)}</strong></div>
            <div><span>2005—19 AVG</span><strong>{format(study.morph.comparisons[1].given)}</strong></div>
          </div>
          <div className={styles.chronologyReadout}>
            <div><span>DECADES</span><strong>7</strong></div>
            <div><span>YEARS EACH</span><strong>10</strong></div>
          </div>
          <div className={styles.collectedReadout}>
            <p>COLLECTED DOES NOT MEAN COMPLETE.</p>
            <div><span>2005—19 AVG</span><strong>{format(study.morph.comparisons[1].collected)}</strong></div>
          </div>
        </div>
        <p className={styles.morphUnit}>
          <span className={styles.givenLabel}>DATA GIVEN</span>
          <span className={styles.collectedLabel}>DATA COLLECTED</span>
          <span> / USES PER MILLION BIGRAMS</span>
        </p>
      </figure>
    </section>
  );
}

function NamedBadgeLegend() {
  return (
    <div className={styles.namedBadgeLegend} aria-label="Badge colours: sufficient data coral, available data yellow, raw data blue, missing data purple, sensitive data pink.">
      {study.named.terms.map((term, index) => (
        <span key={term.id}><i style={{ "--badge-color": namedBadgeColors[index] } as CustomProperties} />{term.label.replace(" data", "").replace("data ", "")}</span>
      ))}
    </div>
  );
}

function NamedTextState({ state }: { state: NamedMorphState }) {
  if (state === "start") return <figcaption className={styles.periodsCopy}>DATA LOOKS LIKE<br />SOMETHING<br />ALREADY THERE.<br />A FACT.<br />A RECORD.<br />A RESOURCE<br />READY TO USE.</figcaption>;
  return (
    <figcaption className={styles.statesCopy}>
      <strong className={styles.statesHeadline}>
        DATA IS CALLED<br />
        <span style={{ "--term-color": namedWordColors[0] } as CustomProperties}>SUFFICIENT</span> / <span style={{ "--term-color": namedWordColors[1] } as CustomProperties}>AVAILABLE</span><br />
        <span style={{ "--term-color": namedWordColors[2] } as CustomProperties}>RAW</span> / <span style={{ "--term-color": namedWordColors[3] } as CustomProperties}>MISSING</span><br />
        OR <span style={{ "--term-color": namedWordColors[4] } as CustomProperties}>SENSITIVE</span>.<br />
        THESE ARE NOT<br />NEUTRAL DESCRIPTIONS.
      </strong>
      <p className={styles.statesBody}>A quality attached to data changes how it can be trusted, shared, governed, or used. These labels do more than describe a material: they establish expectations, permissions, and limits, helping produce the social condition in which a dataset can circulate and count as evidence for a particular reader or institution.</p>
    </figcaption>
  );
}

function NamedMorphField({ animated = false, state = "start" }: { animated?: boolean; state?: NamedMorphState }) {
  return (
    <div className={styles.namedMorphField} aria-hidden="true">
      {namedMorphPoints.map((point) => {
        const start = namedMorphPosition(point.termIndex, point.yearIndex, "start");
        const burst = namedBurstPosition(point.termIndex, point.yearIndex);
        const end = namedMorphPosition(point.termIndex, point.yearIndex, "end");
        return (
          <i
            className={`${styles.namedMorphDot} ${point.yearIndex === 0 || point.yearIndex === 69 ? styles.leadNamedBadge : ""}`}
            data-named-morph-dot={animated ? "" : undefined}
            data-start-x={start.x}
            data-start-y={start.y}
            data-burst-x={burst.x}
            data-burst-y={burst.y}
            data-end-x={end.x}
            data-end-y={end.y}
            key={point.id}
            style={namedMorphDotStyle(point.termIndex, point.yearIndex, point.value, state)}
          />
        );
      })}
    </div>
  );
}

function NamedStaticMorphPanel({ state }: { state: NamedMorphState }) {
  const start = state === "start";
  return (
    <figure
      className={`${styles.namedStaticMorphPanel} ${start ? styles.namedStartPanel : styles.namedEndPanel}`}
      style={{ "--named-progress": start ? 0 : 1 } as CustomProperties}
      aria-label={`${start ? "Ten enlarged phrase badges interrupt the statement Data looks like something already there" : "Five directly named qualities remain as coloured words after the annual badges disappear"}. The complete transition uses three hundred and fifty circles for sufficient, available, raw, missing, and sensitive data from 1950 to 2019. Colour identifies phrase and circle area encodes uses per million bigrams on one shared domain; badge position is editorial.`}
    >
      <div className={styles.namedMorphTopline}><span>5 EXACT BIGRAMS</span><span>70 YEARS</span></div>
      <NamedBadgeLegend />
      <div className={styles.namedMorphCopyField}><NamedTextState state={state} /></div>
      <NamedMorphField state={state} />
      <div className={styles.namedMorphReadouts}>
        <div><span>{namedAnnualPeak.label.toUpperCase()} PEAK / {namedAnnualPeak.year}</span><strong>{format(namedAnnualPeak.value)}</strong></div>
        <div><span>SENSITIVE / {sensitiveLatest.year}</span><strong>{format(sensitiveLatest.value)}</strong></div>
      </div>
      <p className={styles.namedMorphUnit}>USES PER MILLION BIGRAMS</p>
    </figure>
  );
}

function useNamedScrollMorph(sectionRef: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const mobileQuery = window.matchMedia("(max-width: 959px)");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const forceStaticPreview = new URL(window.location.href).searchParams.get("motion") === "reduce";
    const dots = Array.from(section.querySelectorAll<HTMLElement>("[data-named-morph-dot]"));
    let animationFrame = 0;
    let listening = false;

    const update = () => {
      animationFrame = 0;
      const bounds = section.getBoundingClientRect();
      const travel = Math.max(1, section.offsetHeight - window.innerHeight);
      const progress = stableProgress(-bounds.top / travel);
      section.style.setProperty("--named-progress", progress.toFixed(4));
      const firstHalf = progress <= .5;
      const phase = smoothStep(firstHalf ? progress * 2 : (progress - .5) * 2);
      for (const dot of dots) {
        const startX = Number(dot.dataset.startX);
        const startY = Number(dot.dataset.startY);
        const burstX = Number(dot.dataset.burstX);
        const burstY = Number(dot.dataset.burstY);
        const endX = Number(dot.dataset.endX);
        const endY = Number(dot.dataset.endY);
        const fromX = firstHalf ? startX : burstX;
        const fromY = firstHalf ? startY : burstY;
        const toX = firstHalf ? burstX : endX;
        const toY = firstHalf ? burstY : endY;
        dot.style.setProperty("--named-dot-x", `${(fromX * (1 - phase) + toX * phase).toFixed(4)}%`);
        dot.style.setProperty("--named-dot-y", `${(fromY * (1 - phase) + toY * phase).toFixed(4)}%`);
      }
    };

    const requestUpdate = () => {
      if (!animationFrame) animationFrame = window.requestAnimationFrame(update);
    };

    const stop = () => {
      if (!listening) return;
      listening = false;
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      animationFrame = 0;
      delete section.dataset.namedMorphEnhanced;
      section.style.removeProperty("--named-progress");
    };

    const configure = () => {
      if (!mobileQuery.matches || motionQuery.matches || forceStaticPreview) {
        stop();
        return;
      }
      if (!listening) {
        listening = true;
        window.addEventListener("scroll", requestUpdate, { passive: true });
        window.addEventListener("resize", requestUpdate, { passive: true });
      }
      update();
      section.dataset.namedMorphEnhanced = "true";
    };

    configure();
    mobileQuery.addEventListener("change", configure);
    motionQuery.addEventListener("change", configure);
    return () => {
      stop();
      mobileQuery.removeEventListener("change", configure);
      motionQuery.removeEventListener("change", configure);
    };
  }, [sectionRef]);
}

function NamedPeriodsMorph() {
  const sectionRef = useRef<HTMLElement>(null);
  useNamedScrollMorph(sectionRef);

  return (
    <section className={styles.namedMorphScene} ref={sectionRef} aria-labelledby="m-data-named-morph-heading">
      <h2 className={styles.visuallyHidden} id="m-data-named-morph-heading">Three hundred and fifty annual phrase badges interrupt one statement, burst outward, and dissolve into five coloured terms.</h2>
      <div className={styles.namedStaticMorphFallback}>
        <NamedStaticMorphPanel state="start" />
        <NamedStaticMorphPanel state="end" />
      </div>
      <figure
        className={styles.namedMorphSticky}
        aria-label="Scroll transformation of three hundred and fifty exact annual phrase-frequency badges from 1950 to 2019. Ten enlarged badges begin around a statement that data looks already there; the full annual field appears and flies outward; every circle then disappears as sufficient, available, raw, missing, and sensitive remain as coloured words. Colour identifies phrase, area uses one shared uses-per-million-bigrams domain, and position is editorial."
      >
        <div className={styles.namedBlueLayer} aria-hidden="true" />
        <div className={styles.namedMorphTopline}><span>5 EXACT BIGRAMS</span><span>70 YEARS / SCROLL</span></div>
        <NamedBadgeLegend />
        <div className={styles.namedMorphCopyField}>
          <NamedTextState state="start" />
          <NamedTextState state="end" />
        </div>
        <NamedMorphField animated />
        <div className={styles.namedMorphReadouts}>
          <div><span>{namedAnnualPeak.label.toUpperCase()} PEAK / {namedAnnualPeak.year}</span><strong>{format(namedAnnualPeak.value)}</strong></div>
          <div><span>SENSITIVE / {sensitiveLatest.year}</span><strong>{format(sensitiveLatest.value)}</strong></div>
        </div>
        <p className={styles.namedMorphUnit}>USES PER MILLION BIGRAMS</p>
      </figure>
    </section>
  );
}

function NamedCard() {
  const cardRef = useRef<HTMLElement>(null);
  const progress = useElementScrollProgress(cardRef);
  const plotLeft = 7;
  const plotRight = 96;
  const plotTop = 12;
  const plotBottom = 58;
  const abbreviations = ["SUF", "AVL", "RAW", "MIS", "SEN"] as const;
  const yearX = (year: number) => plotLeft + ((year - 1950) / 69) * (plotRight - plotLeft);
  const valueY = (value: number) => plotBottom - value / study.named.sharedDomainMax * (plotBottom - plotTop);
  const currentYearIndex = Math.round(progress * (study.named.yearCount - 1));
  const currentYear = study.named.startYear + currentYearIndex;
  const cursorX = yearX(mix(study.named.startYear, study.named.endYear, progress));
  const selectedTerm = study.named.terms.find((term) => term.id === "available")!;
  const selectedPoint = selectedTerm.annualPoints[currentYearIndex];
  const seriesClasses = [styles.namedSeriesOne, styles.namedSeriesTwo, styles.namedSeriesThree, styles.namedSeriesFour, styles.namedSeriesFive];
  const legendX = [1, 21, 41, 61, 81] as const;

  return (
    <article
      ref={cardRef}
      id="m-data-card-named"
      className={`${styles.mobileDataCard} ${styles.cardV2} ${styles.namedCard}`}
      aria-label={`Named. Five annual line series show exact yearly values from ${study.named.startYear} to ${study.named.endYear}. The current cursor is ${currentYear}; available data is ${format(selectedPoint.value)} uses per million bigrams.`}
    >
      <header className={styles.cardV2Header}>
        <span>04 / NAMED</span>
        <span>5 SERIES / 70 YEARS</span>
      </header>
      <div className={styles.cardV2Plot}>
        <svg viewBox="0 0 100 70" role="img" aria-label="Five annual line series, one for each named quality of data.">
          {[plotTop, (plotTop + plotBottom) / 2, plotBottom].map((y) => (
            <line key={y} className={styles.namedGuide} x1={plotLeft} y1={y} x2={plotRight} y2={y} />
          ))}
          {study.named.terms.map((term, termIndex) => {
            const fullPoints = term.annualPoints.map((point) => `${yearX(point.year)},${valueY(point.value)}`).join(" ");
            const visiblePoints = term.annualPoints.slice(0, currentYearIndex + 1).map((point) => `${yearX(point.year)},${valueY(point.value)}`).join(" ");
            const currentPoint = term.annualPoints[currentYearIndex];
            const currentX = yearX(currentPoint.year);
            const currentY = valueY(currentPoint.value);
            return (
              <g key={term.id}>
                <polyline className={`${styles.namedLineGhost} ${seriesClasses[termIndex]}`} points={fullPoints} />
                <polyline className={`${styles.namedLine} ${seriesClasses[termIndex]}`} points={visiblePoints} />
                <rect
                  className={`${styles.namedLineMarker} ${seriesClasses[termIndex]}`}
                  x={currentX - 1.5}
                  y={currentY - 1.5}
                  width="3"
                  height="3"
                  transform={`rotate(45 ${currentX} ${currentY})`}
                />
              </g>
            );
          })}
          {abbreviations.map((label, index) => (
            <g key={label} className={seriesClasses[index]}>
              <line className={styles.namedLegendRule} x1={legendX[index]} y1="6" x2={legendX[index] + 5} y2="6" />
              <text className={styles.namedLegendLabel} x={legendX[index] + 6.5} y="7.5">{label}</text>
            </g>
          ))}
          <line className={styles.namedCursor} x1={cursorX} y1={plotTop} x2={cursorX} y2={plotBottom} />
          <text className={styles.plotAxisLabel} x={plotLeft} y="68" textAnchor="middle">1950</text>
          <text className={styles.plotAxisLabel} x={yearX(1983)} y="68" textAnchor="middle">1983</text>
          <text className={styles.plotAxisLabel} x={plotRight} y="68" textAnchor="middle">2019</text>
        </svg>
      </div>
      <footer className={styles.cardV2Footer}>
        <span className={styles.cardV2Context}>{currentYear} / CURSOR</span>
        <div className={styles.cardV2Metric}>
          <strong>{format(selectedPoint.value)}</strong>
          <span>AVAILABLE / USES PER M</span>
        </div>
      </footer>
    </article>
  );
}

function RuledCard() {
  const cardRef = useRef<HTMLElement>(null);
  const progress = useElementScrollProgress(cardRef);
  const scatter = { left: 14, right: 92, top: 7, bottom: 62 } as const;
  const maxDomain = Math.max(...study.ruled.terms.flatMap((term) => [term.british, term.american])) * 1.12;
  const xForUS = (value: number) => scatter.left + value / maxDomain * (scatter.right - scatter.left);
  const yForGB = (value: number) => scatter.bottom - value / maxDomain * (scatter.bottom - scatter.top);
  const axisProgress = smoothstep(segment(progress, 0, 0.25));
  const pointProgress = smoothstep(segment(progress, 0.25, 1));
  const axisX = mix(scatter.left, scatter.right, axisProgress);
  const axisY = mix(scatter.bottom, scatter.top, axisProgress);
  const maximumRatio = Math.max(...study.ruled.terms.map((term) => term.britishToAmericanRatio));
  const pointClasses = [styles.ruledPointOne, styles.ruledPointTwo, styles.ruledPointThree];
  const labelOffsets = [
    { x: 9.3, y: -4.2, anchor: "start" as const },
    { x: 9.3, y: 6.6, anchor: "start" as const },
    { x: 9.3, y: -6.8, anchor: "start" as const },
  ];

  return (
    <article
      ref={cardRef}
      id="m-data-card-ruled"
      className={`${styles.mobileDataCard} ${styles.cardV2} ${styles.ruledCard}`}
      aria-label={`Ruled. A GB by US scatter plot for three terms in 2005 to 2019. Ratios are ${study.ruled.terms.map((term) => `${term.label} ${format(term.britishToAmericanRatio)} times`).join(", ")}.`}
    >
      <header className={styles.cardV2Header}>
        <span>05 / RULED</span>
        <span>GB × US / 2005—19</span>
      </header>
      <div className={styles.cardV2Plot}>
        <svg viewBox="0 0 100 70" role="img" aria-label="British corpus frequency plotted against American corpus frequency with a parity diagonal.">
          <line className={styles.scatterAxis} x1={scatter.left} y1={scatter.bottom} x2={axisX} y2={scatter.bottom} />
          <line className={styles.scatterAxis} x1={scatter.left} y1={scatter.bottom} x2={scatter.left} y2={axisY} />
          <line className={styles.parityLine} x1={scatter.left} y1={scatter.bottom} x2={axisX} y2={axisY} />
          <path className={styles.scatterArrow} d={`M ${scatter.right - 3} ${scatter.bottom - 1.6} L ${scatter.right} ${scatter.bottom} L ${scatter.right - 3} ${scatter.bottom + 1.6}`} opacity={axisProgress} />
          <path className={styles.scatterArrow} d={`M ${scatter.left - 1.6} ${scatter.top + 3} L ${scatter.left} ${scatter.top} L ${scatter.left + 1.6} ${scatter.top + 3}`} opacity={axisProgress} />
          <text className={styles.scatterAxisLabel} x={scatter.right} y="68" textAnchor="end">US</text>
          <text className={styles.scatterAxisLabel} x="5" y={scatter.top + 1}>GB</text>
          {study.ruled.terms.map((term, index) => {
            const x = xForUS(term.american);
            const parityY = yForGB(term.american);
            const trueY = yForGB(term.british);
            const y = mix(parityY, trueY, pointProgress);
            const offset = labelOffsets[index];
            return (
              <g key={term.id} opacity={smoothstep(segment(progress, 0.22, 0.34))}>
                <line className={styles.scatterProjection} x1={x} y1={scatter.bottom} x2={x} y2={y} />
                <line className={styles.scatterProjection} x1={scatter.left} y1={y} x2={x} y2={y} />
                <line className={styles.scatterDelta} x1={x} y1={parityY} x2={x} y2={y} />
                <circle className={styles.scatterParityOrigin} cx={x} cy={parityY} r="2.1" />
                <circle className={styles.scatterProjectionMark} cx={x} cy={scatter.bottom} r="1.4" />
                <circle className={styles.scatterProjectionMark} cx={scatter.left} cy={y} r="1.4" />
                <circle className={styles.scatterPointHalo} cx={x} cy={y} r="7.4" />
                <circle className={`${styles.ruledScatterPoint} ${pointClasses[index]}`} cx={x} cy={y} r="5.8" />
                <text className={styles.scatterPointLabel} x={x + offset.x} y={y + offset.y} textAnchor={offset.anchor}>
                  {term.id.toUpperCase()} {format(term.britishToAmericanRatio)}×
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <footer className={styles.cardV2Footer}>
        <span className={styles.cardV2Context}>1× PARITY / DIAGONAL</span>
        <div className={styles.cardV2Metric}>
          <strong>{format(maximumRatio)}×</strong>
          <span>MAX GB÷US</span>
        </div>
      </footer>
    </article>
  );
}

const MADE_PERIOD_X = [29, 49, 69, 89] as const;
const MADE_BASELINE_Y = [15, 30, 45, 60] as const;

function MadeCard() {
  const cardRef = useRef<HTMLElement>(null);
  const progress = useElementScrollProgress(cardRef);
  const focal = study.made.terms.find((term) => term.id === "cleaning")!;
  const laneLabels = ["ENTRY", "CLEAN", "LABEL", "ANNOT"] as const;
  const periodCaptions = ["50—69", "70—89", "90—04", "05—19"] as const;
  const barClasses = [styles.madeBarOne, styles.madeBarTwo, styles.madeBarThree, styles.madeBarFour];

  return (
    <article
      ref={cardRef}
      id="m-data-card-made"
      className={`${styles.mobileDataCard} ${styles.cardV2} ${styles.madeCard}`}
      aria-label={`Made. Four small-multiple histograms show sixteen real checkpoints across four periods. Each row uses its own term maximum. In 2005 to 2019, uses per million bigrams are ${study.made.terms.map((term) => `${term.label} ${format(term.late)}`).join(", ")}.`}
    >
      <header className={styles.cardV2Header}>
        <span>06 / MADE</span>
        <span>4 HISTOGRAMS</span>
      </header>
      <div className={styles.cardV2Plot}>
        <svg viewBox="0 0 100 70" role="img" aria-label="Four row-scaled histograms with four measured periods in each row.">
          {study.made.terms.map((term, termIndex) => {
            const maximum = Math.max(...term.values);
            const baseline = MADE_BASELINE_Y[termIndex];
            return (
              <g key={term.id}>
                <text className={styles.madeRowLabel} x="1" y={baseline - 1.5}>{laneLabels[termIndex]}</text>
                <line className={styles.madeHistogramBaseline} x1="22" y1={baseline} x2="95" y2={baseline} />
                {term.values.map((value, periodIndex) => {
                  const reveal = smoothstep(segment(progress, periodIndex * 0.12, 0.4 + periodIndex * 0.12));
                  const height = value / maximum * 10.5 * reveal;
                  return (
                    <rect
                      key={study.made.periods[periodIndex]}
                      className={`${styles.madeHistogramBar} ${barClasses[termIndex]}`}
                      x={MADE_PERIOD_X[periodIndex] - 3.4}
                      y={baseline - height}
                      width="6.8"
                      height={height}
                    />
                  );
                })}
              </g>
            );
          })}
          {periodCaptions.map((caption, index) => (
            <text key={caption} className={`${styles.plotAxisLabel} ${styles.madePeriodLabel}`} x={MADE_PERIOD_X[index]} y="67" textAnchor="middle">{caption}</text>
          ))}
        </svg>
      </div>
      <footer className={`${styles.cardV2Footer} ${styles.madeCardFooter}`}>
        <span className={styles.cardV2Context}>ROW SCALE</span>
        <div className={styles.cardV2Metric}>
          <strong>{format(focal.late)}</strong>
          <span>CLEANING · 2005—19</span>
        </div>
      </footer>
    </article>
  );
}

function CloseFinding() {
  return (
    <section className={styles.closeFinding} aria-labelledby="m-data-close-title">
      <p className={styles.closeEyebrow}>CLOSE FINDING</p>
      <div className={styles.closeStatement}>
        <h2 id="m-data-close-title">Data is not found whole.<br />It is made legible.</h2>
        <p>Units, operations, rules, and labour decide what becomes available for use. Each act of selection also shapes what remains absent, who can interpret it, and how institutions may treat the result as evidence.</p>
      </div>
      <ClosingDotMerge />
      <details className={styles.closeSources}>
        <summary>SOURCES / RIGHTS / NAV <span aria-hidden="true">+</span></summary>
        <div>
          <p>This study recalculates {study.scope.selectedProbeCount} selected exact-string probes from frozen source captures. The animated field compares two exact bigrams across {study.scope.morphYearCount} shared years in {study.corpus.label}; printed-book visibility is not a population count or proof of cause.</p>
          <nav aria-label="Data study source links">
            {study.sources.map((source) => <a href={source.url} key={source.id} target="_blank" rel="noreferrer">{source.title}</a>)}
            <Link href="/about">METHOD AND RIGHTS</Link>
          </nav>
        </div>
      </details>
      <a className={styles.backToTop} href="#m-data-top" onClick={animateBackToTop}>BACK TO TOP <span className={styles.upGlyph} aria-hidden="true" /></a>
      <footer className={styles.editionFooter}>WORDS OVER TIME / DATA / MOBILE RESEARCH EDITION</footer>
    </section>
  );
}

export function MobileDataStudy() {
  useMobileDataEnvironment();

  return (
    <article id="m-data-top" className={styles.mobileData} data-data-edition="mobile-research" aria-labelledby="m-data-title">
      <section className={styles.opening}>
        <StudyHeader />
        <div className={styles.openingBody}>
          <p className={styles.studyEyebrow}>WORD STUDY</p>
          <h1 id="m-data-title">data</h1>
          <h2 className={styles.studyLead}>“Something already there.”</h2>
          <p className={styles.studyThesis}>Its grammar and neighbouring words show a material being counted, divided, worked on, governed, and made usable.</p>
          <dl className={styles.studyScope}>
            <div><dt>{study.scope.selectedProbeCount}</dt><dd>selected exact probes</dd></div>
            <div><dt>{study.corpus.startYear}—{study.corpus.endYear}</dt><dd>fixed book corpus</dd></div>
          </dl>
          <HeroSixDotArrow />
        </div>
      </section>

      <GivenCollectedMorph />
      <div className={styles.paperMovements}>
        <Movement bridgeLabel="MASS → CUT" statement={<>A plural becomes<br />a material.</>}><MassCard /></Movement>
        <NarrativeParagraph label="From mass grammar to divisible units" step={0}>The plural form behaves like a mass noun until neighbouring words give it units. Sheets, points, sources, and types turn an apparently continuous substance into things that can be counted and compared.</NarrativeParagraph>
        <Movement align="right" bridgeLabel="CUT → PACKAGED" statement={<>A material<br />needs edges.</>}><CutCard /></Movement>
        <NarrativeParagraph label="From divided units to containers" step={1}>Once data is divided into countable units, the vocabulary shifts toward transfer and storage. Sources and points dominate this selected late-period set, giving the material practical edges for circulation.</NarrativeParagraph>
        <Movement bridgeLabel="PACKAGED → NAMED" statement={<>The material<br />gets containers.</>}><PackagedCard /></Movement>
        <NarrativeParagraph label="From containers to named qualities" step={2}>Database, databank, dataset, and metadata do not grow at the same rate. Their changing shares show packaging as an historical choice: the container tells readers what belongs together before they inspect any record.</NarrativeParagraph>
      </div>
      <NamedPeriodsMorph />
      <Movement bridgeLabel="NAMED → RULED" statement={<>Work gives the<br />material qualities.</>}><NamedCard /></Movement>
      <NarrativeParagraph label="From qualities to institutional rules" step={3}>Sufficient, available, raw, missing, and sensitive rise along different annual paths. These labels are not decorative adjectives; each establishes an expectation about access, completeness, risk, or the work still required.</NarrativeParagraph>
      <div className={styles.doubleMovement}>
        <Movement align="right" bridgeLabel="RULED → MADE" statement={<>Qualities<br />become rules.</>}><RuledCard /></Movement>
        <NarrativeParagraph label="From rules to data work" step={4}>The Google Books British English (GB) × American English (US) field shows that institutional language does not travel evenly. Distance from the parity line makes regional emphasis visible, turning each qualitative rule into a measurable difference between corpora.</NarrativeParagraph>
        <Movement bridgeLabel="MADE → CLOSE" statement={<>Rules still depend<br />on work.</>}><MadeCard /></Movement>
        <NarrativeParagraph label="From data work to legibility" step={5}>Entry, cleaning, labeling, and annotation do not simply prepare data. Their histories rise at different rates, showing that a finished dataset is assembled through repeated operations that decide what can be compared, circulated, and trusted.</NarrativeParagraph>
      </div>
      <CloseFinding />
    </article>
  );
}
