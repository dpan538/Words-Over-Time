"use client";

import {
  memo,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import type {
  DepressionRotaryInterludeData,
  DepressionRotarySeries,
} from "@/types/depressionMobileResearch";
import styles from "./mobile-depression.module.css";

const CX = 180;
const CY = 180;
const OPTION_COUNT = 3;
const STEP = 360 / OPTION_COUNT;
const SELECTOR_INNER = 46;
const SELECTOR_OUTER = 144;
const CHART_LEFT = 18;
const CHART_RIGHT = 342;
const CHART_TOP = 16;
const CHART_BOTTOM = 110;

type Point = { x: number; y: number };
type DragState = {
  pointerId: number;
  startX: number;
  startY: number;
  pointerAngle: number;
  rotation: number;
  active: boolean;
  cancelled: boolean;
};

const PALETTES: Record<DepressionRotarySeries["key"], {
  scene: string;
  panel: string;
  wheel: string;
  wheelActive: string;
  ink: string;
}> = {
  business: {
    scene: "#0D3023",
    panel: "#3275C8",
    wheel: "#C7DDD2",
    wheelActive: "#F3E8D4",
    ink: "#0D241A",
  },
  financial: {
    scene: "#402A23",
    panel: "#E2A94F",
    wheel: "#E8D7C4",
    wheelActive: "#FFF1D8",
    ink: "#21160F",
  },
  economic: {
    scene: "#173746",
    panel: "#D96A57",
    wheel: "#C9DCE2",
    wheelActive: "#F3E8D4",
    ink: "#171A20",
  },
};

function fixed(value: number) {
  return value.toFixed(3);
}

function point(radius: number, angle: number): Point {
  const radians = ((angle - 90) * Math.PI) / 180;
  return {
    x: CX + Math.cos(radians) * radius,
    y: CY + Math.sin(radians) * radius,
  };
}

function sectorPath(index: number) {
  const centre = index * STEP;
  const start = centre - STEP / 2 + 3;
  const end = centre + STEP / 2 - 3;
  const outerStart = point(SELECTOR_OUTER, start);
  const outerEnd = point(SELECTOR_OUTER, end);
  const innerEnd = point(SELECTOR_INNER, end);
  const innerStart = point(SELECTOR_INNER, start);
  const controlEnd = point(74, end);
  const controlStart = point(74, start);
  return [
    `M${fixed(outerStart.x)} ${fixed(outerStart.y)}`,
    `A${SELECTOR_OUTER} ${SELECTOR_OUTER} 0 0 1 ${fixed(outerEnd.x)} ${fixed(outerEnd.y)}`,
    `Q${fixed(controlEnd.x)} ${fixed(controlEnd.y)} ${fixed(innerEnd.x)} ${fixed(innerEnd.y)}`,
    `A${SELECTOR_INNER} ${SELECTOR_INNER} 0 0 0 ${fixed(innerStart.x)} ${fixed(innerStart.y)}`,
    `Q${fixed(controlStart.x)} ${fixed(controlStart.y)} ${fixed(outerStart.x)} ${fixed(outerStart.y)}`,
    "Z",
  ].join(" ");
}

function pointerAngle(clientX: number, clientY: number, rect: DOMRect) {
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  return (Math.atan2(clientY - cy, clientX - cx) * 180) / Math.PI;
}

function normalizeDelta(value: number) {
  return ((value + 540) % 360) - 180;
}

function modulo(value: number, divisor: number) {
  return ((value % divisor) + divisor) % divisor;
}

function snapState(rotation: number) {
  const step = Math.round(rotation / STEP);
  return { rotation: step * STEP, index: modulo(-step, OPTION_COUNT) };
}

function shortLabel(series: DepressionRotarySeries) {
  if (series.key === "business") return "BUS";
  if (series.key === "financial") return "FIN";
  return "ECO";
}

function SelectorLabels({
  series,
  rotation,
  selectedIndex,
}: {
  series: DepressionRotarySeries[];
  rotation: number;
  selectedIndex: number;
}) {
  return (
    <g aria-hidden="true">
      {series.map((item, index) => {
        const location = point(103, rotation + index * STEP);
        return (
          <text
            key={item.key}
            x={fixed(location.x)}
            y={fixed(location.y + 5)}
            textAnchor="middle"
            className={index === selectedIndex ? styles.selectorLabelActive : styles.selectorLabel}
          >
            {shortLabel(item)}
          </text>
        );
      })}
    </g>
  );
}

function seriesPath(series: DepressionRotarySeries) {
  const yMaximum = series.yDomain[1];
  const valid = series.points.filter(
    (annualPoint): annualPoint is { year: number; value: number } => annualPoint.value !== null,
  );

  return valid.map((annualPoint, index) => {
    const x = CHART_LEFT + ((annualPoint.year - 1874) / (1939 - 1874)) * (CHART_RIGHT - CHART_LEFT);
    const y = CHART_BOTTOM - (annualPoint.value / yMaximum) * (CHART_BOTTOM - CHART_TOP);
    return `${index === 0 ? "M" : "L"}${fixed(x)} ${fixed(y)}`;
  }).join(" ");
}

function peakPoint(series: DepressionRotarySeries) {
  return {
    x: CHART_LEFT + ((series.peak.year - 1874) / (1939 - 1874)) * (CHART_RIGHT - CHART_LEFT),
    y: CHART_BOTTOM - (series.peak.value / series.yDomain[1]) * (CHART_BOTTOM - CHART_TOP),
  };
}

const SelectedSeriesPanel = memo(function SelectedSeriesPanel({ series }: { series: DepressionRotarySeries }) {
  const peak = peakPoint(series);
  return (
    <div key={series.key} className={styles.rotaryDataPanel} aria-live="polite">
      <div className={styles.rotaryDataHeading}>
        <p><span aria-hidden="true" />03A / PHRASE FREQUENCY</p>
        <h2>{series.label}</h2>
      </div>

      <div className={styles.rotaryPeakReadout}>
        <strong>{series.peak.value.toFixed(2)}</strong>
        <span>/ MILLION<br />CORPUS WORDS</span>
        <b>{series.peak.year} PEAK</b>
      </div>

      <svg
        className={styles.rotaryTrendChart}
        viewBox="0 0 360 132"
        role="img"
        aria-labelledby={`rotary-chart-title-${series.key} rotary-chart-desc-${series.key}`}
        preserveAspectRatio="none"
        data-annual-position-count={series.points.length}
      >
        <title id={`rotary-chart-title-${series.key}`}>{`${series.label} annual frequency, 1874 to 1939`}</title>
        <desc id={`rotary-chart-desc-${series.key}`}>{`Sixty-six annual positions in appearances per million corpus words. The series peaks at ${series.peak.value.toFixed(2)} in ${series.peak.year}.`}</desc>
        <line x1={CHART_LEFT} y1={CHART_BOTTOM} x2={CHART_RIGHT} y2={CHART_BOTTOM} className={styles.rotaryChartBaseline} />
        <line x1={CHART_LEFT} y1={CHART_TOP} x2={CHART_RIGHT} y2={CHART_TOP} className={styles.rotaryChartGuide} />
        <path d={seriesPath(series)} className={styles.rotaryChartLine} vectorEffect="non-scaling-stroke" />
        <circle cx={fixed(peak.x)} cy={fixed(peak.y)} r="5" className={styles.rotaryChartPeak} vectorEffect="non-scaling-stroke" />
        <text x={fixed(peak.x)} y={fixed(Math.max(CHART_TOP + 13, peak.y - 8))} textAnchor="middle" className={styles.rotaryChartPeakLabel}>{series.peak.year}</text>
        <text x={CHART_LEFT} y="129">1874</text>
        <text x={CHART_RIGHT} y="129" textAnchor="end">1939</text>
      </svg>
    </div>
  );
});

export function RotaryFrequencyWheel({
  data,
  onPanelColourChange,
}: {
  data: DepressionRotaryInterludeData;
  onPanelColourChange?: (colour: string) => void;
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [dragging, setDragging] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const rotationRef = useRef(0);
  const selectedSeries = data.series[selectedIndex] ?? data.series[0];
  const palette = PALETTES[selectedSeries.key];

  useEffect(() => () => { dragRef.current = null; }, []);
  useEffect(() => {
    onPanelColourChange?.(palette.panel);
  }, [onPanelColourChange, palette.panel]);

  const commitIndex = (nextIndex: number) => {
    const normalized = modulo(nextIndex, data.series.length);
    const currentStep = Math.round(rotationRef.current / STEP);
    const currentIndex = modulo(-currentStep, data.series.length);
    const delta = normalizeDelta((currentIndex - normalized) * STEP);
    const nextRotation = rotationRef.current + delta;
    rotationRef.current = nextRotation;
    setRotation(nextRotation);
    setSelectedIndex(normalized);
  };

  const handlePointerDown = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (!svgRef.current || (event.pointerType === "mouse" && event.button !== 0)) return;
    const rect = svgRef.current.getBoundingClientRect();
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      pointerAngle: pointerAngle(event.clientX, event.clientY, rect),
      rotation: rotationRef.current,
      active: false,
      cancelled: false,
    };
  };

  const handlePointerMove = (event: ReactPointerEvent<SVGSVGElement>) => {
    const drag = dragRef.current;
    const svg = svgRef.current;
    if (!drag || drag.pointerId !== event.pointerId || drag.cancelled || !svg) return;
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    const distance = Math.hypot(dx, dy);
    if (!drag.active) {
      if (distance < 6) return;
      if (Math.abs(dy) > Math.abs(dx) * 1.1) {
        drag.cancelled = true;
        dragRef.current = null;
        return;
      }
      drag.active = true;
      svg.setPointerCapture(event.pointerId);
      setDragging(true);
    }
    event.preventDefault();
    const angle = pointerAngle(event.clientX, event.clientY, svg.getBoundingClientRect());
    const next = drag.rotation + normalizeDelta(angle - drag.pointerAngle);
    rotationRef.current = next;
    setRotation(next);
  };

  const finishPointer = (event: ReactPointerEvent<SVGSVGElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    if (svgRef.current?.hasPointerCapture(event.pointerId)) svgRef.current.releasePointerCapture(event.pointerId);
    dragRef.current = null;
    if (!drag.active) return;
    const snapped = snapState(rotationRef.current);
    rotationRef.current = snapped.rotation;
    setRotation(snapped.rotation);
    setSelectedIndex(snapped.index);
    setDragging(false);
  };

  const onKeyDown = (event: KeyboardEvent<SVGSVGElement>) => {
    let next = selectedIndex;
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") next -= 1;
    else if (event.key === "ArrowRight" || event.key === "ArrowDown") next += 1;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = data.series.length - 1;
    else return;
    event.preventDefault();
    commitIndex(next);
  };

  const visualStyle = {
    "--selector-rotation": `${rotation}deg`,
    "--rotary-scene": palette.scene,
    "--rotary-panel": palette.panel,
    "--rotary-wheel": palette.wheel,
    "--rotary-wheel-active": palette.wheelActive,
    "--rotary-panel-ink": palette.ink,
  } as CSSProperties;

  return (
    <div className={styles.rotaryExperience} style={visualStyle} data-dragging={dragging ? "true" : "false"}>
      <div className={styles.rotarySelectorField}>
        <svg
          ref={svgRef}
          className={styles.rotarySelector}
          viewBox="0 0 360 360"
          role="slider"
          tabIndex={0}
          aria-label="Economic phrase rotary selector"
          aria-valuemin={0}
          aria-valuemax={data.series.length - 1}
          aria-valuenow={selectedIndex}
          aria-valuetext={`${selectedSeries.label}, peak ${selectedSeries.peak.value.toFixed(2)} per million in ${selectedSeries.peak.year}`}
          data-rotary-control
          onKeyDown={onKeyDown}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={finishPointer}
          onPointerCancel={finishPointer}
        >
          <title>Economic phrase rotary selector</title>
          <desc>Rotate the three-part wheel to select business depression, financial depression, or economic depression. The lower chart updates to the selected annual series.</desc>
          <circle cx={CX} cy={CY} r="157" className={styles.rotarySelectorDisc} />
          <g className={styles.selectorRing} aria-hidden="true">
            {data.series.map((item, index) => (
              <path
                key={item.key}
                d={sectorPath(index)}
                className={index === selectedIndex ? styles.selectorSectorActive : styles.selectorSector}
                data-selector-sector={item.key}
                onClick={() => commitIndex(index)}
              />
            ))}
          </g>
          <SelectorLabels series={data.series} rotation={rotation} selectedIndex={selectedIndex} />
          <circle cx={CX} cy={CY} r="34" className={styles.rotarySelectorHub} aria-hidden="true" />
          <path d="M180 4 L170 23 L190 23 Z" className={styles.wheelPointer} aria-hidden="true" />
        </svg>
      </div>
      <SelectedSeriesPanel series={selectedSeries} />
    </div>
  );
}
