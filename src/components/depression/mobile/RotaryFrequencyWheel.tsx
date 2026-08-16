"use client";

import {
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
const SHARED_MAX = 3.5;
const ANNUAL_START = -153;
const ANNUAL_END = 153;
const BAR_INNER = 104;
const BAR_LENGTH = 36;
const SELECTOR_INNER = 146;
const SELECTOR_OUTER = 169;

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

function point(radius: number, angle: number): Point {
  const radians = ((angle - 90) * Math.PI) / 180;
  return {
    x: CX + Math.cos(radians) * radius,
    y: CY + Math.sin(radians) * radius,
  };
}

function sectorPath(index: number) {
  const centre = index * STEP;
  const start = centre - STEP / 2 + 1.5;
  const end = centre + STEP / 2 - 1.5;
  const outerStart = point(SELECTOR_OUTER, start);
  const outerEnd = point(SELECTOR_OUTER, end);
  const innerEnd = point(SELECTOR_INNER, end);
  const innerStart = point(SELECTOR_INNER, start);
  return [
    `M${outerStart.x} ${outerStart.y}`,
    `A${SELECTOR_OUTER} ${SELECTOR_OUTER} 0 0 1 ${outerEnd.x} ${outerEnd.y}`,
    `L${innerEnd.x} ${innerEnd.y}`,
    `A${SELECTOR_INNER} ${SELECTOR_INNER} 0 0 0 ${innerStart.x} ${innerStart.y}`,
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

function fullLabel(series: DepressionRotarySeries) {
  return series.label.toUpperCase().split(" ");
}

function AnnualBars({ series }: { series: DepressionRotarySeries }) {
  return (
    <g key={series.key} className={styles.annualBars} aria-hidden="true" data-annual-position-count={series.points.length}>
      {series.points.map((annualPoint, index) => {
        if (annualPoint.value === null) return null;
        const progress = index / Math.max(1, series.points.length - 1);
        const angle = ANNUAL_START + progress * (ANNUAL_END - ANNUAL_START);
        const start = point(BAR_INNER, angle);
        const end = point(BAR_INNER + Math.max(1, (annualPoint.value / SHARED_MAX) * BAR_LENGTH), angle);
        const peak = annualPoint.year === series.peak.year;
        return (
          <line
            key={annualPoint.year}
            x1={start.x}
            y1={start.y}
            x2={end.x}
            y2={end.y}
            className={peak ? styles.annualPeak : styles.annualBar}
            data-year={annualPoint.year}
            vectorEffect="non-scaling-stroke"
          />
        );
      })}
    </g>
  );
}

function SelectorLabels({ series, rotation, selectedIndex }: { series: DepressionRotarySeries[]; rotation: number; selectedIndex: number }) {
  return (
    <g aria-hidden="true">
      {series.map((item, index) => {
        const location = point(157.5, rotation + index * STEP);
        const words = fullLabel(item);
        return (
          <text
            key={item.key}
            x={location.x}
            y={location.y - 5}
            textAnchor="middle"
            className={index === selectedIndex ? styles.selectorLabelActive : styles.selectorLabel}
            data-selector-name={item.label}
          >
            <tspan x={location.x}>{words[0]}</tspan>
            <tspan x={location.x} dy="12">{words.slice(1).join(" ")}</tspan>
          </text>
        );
      })}
    </g>
  );
}

function CentreKpi({ series }: { series: DepressionRotarySeries }) {
  const words = fullLabel(series);
  return (
    <g key={series.key} className={styles.wheelKpi} aria-hidden="true">
      <circle cx={CX} cy={CY} r="79" className={styles.wheelHub} />
      <text x={CX} y="142" textAnchor="middle" className={styles.wheelPhrase}>
        <tspan x={CX}>{words[0]}</tspan>
        <tspan x={CX} dy="14">{words.slice(1).join(" ")}</tspan>
      </text>
      <text x={CX} y="207" textAnchor="middle" className={styles.wheelPeakValue}>{series.peak.value.toFixed(2)}</text>
      <text x={CX} y="228" textAnchor="middle" className={styles.wheelPeakYear}>{series.peak.year} PEAK</text>
      <text x={CX} y="246" textAnchor="middle" className={styles.wheelUnit}>/ MILLION WORDS</text>
    </g>
  );
}

export function RotaryFrequencyWheel({ data }: { data: DepressionRotaryInterludeData }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [dragging, setDragging] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const rotationRef = useRef(0);
  const selectedSeries = data.series[selectedIndex] ?? data.series[0];

  useEffect(() => () => { dragRef.current = null; }, []);

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
    if (!svgRef.current || event.pointerType === "mouse" && event.button !== 0) return;
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

  const rotorStyle = { "--selector-rotation": `${rotation}deg` } as CSSProperties;

  return (
    <div className={styles.rotaryWheel} data-dragging={dragging ? "true" : "false"}>
      <svg
        ref={svgRef}
        className={styles.rotarySvg}
        viewBox="0 0 360 360"
        role="slider"
        tabIndex={0}
        aria-label="Economic phrase rotary explorer"
        aria-valuemin={0}
        aria-valuemax={data.series.length - 1}
        aria-valuenow={selectedIndex}
        aria-valuetext={selectedSeries.label}
        data-rotary-control
        onKeyDown={onKeyDown}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishPointer}
        onPointerCancel={finishPointer}
      >
        <title>Economic phrase rotary explorer</title>
        <desc>Rotate to select business depression, financial depression, or economic depression. Sixty-six radial bars show annual appearances per million words from 1874 to 1939 on a shared zero-to-3.5 scale.</desc>

        <g className={styles.selectorRing} style={rotorStyle} aria-hidden="true">
          {data.series.map((item, index) => (
            <path key={item.key} d={sectorPath(index)} className={index === selectedIndex ? styles.selectorSectorActive : styles.selectorSector} data-selector-sector={item.key} />
          ))}
        </g>
        <SelectorLabels series={data.series} rotation={rotation} selectedIndex={selectedIndex} />

        <g className={styles.radialScale} aria-hidden="true">
          <circle cx={CX} cy={CY} r={BAR_INNER} />
          <circle cx={CX} cy={CY} r={BAR_INNER + BAR_LENGTH / 2} />
          <circle cx={CX} cy={CY} r={BAR_INNER + BAR_LENGTH} />
          <text x="78" y="284">0</text>
          <text x="271" y="284" textAnchor="end">3.5 / M</text>
          <text x={CX} y="305" textAnchor="middle">1874—1939 · 66 ANNUAL POSITIONS</text>
        </g>
        <AnnualBars series={selectedSeries} />
        <CentreKpi series={selectedSeries} />
        <path d="M180 4 L172 19 L188 19 Z" className={styles.wheelPointer} aria-hidden="true" />
      </svg>
    </div>
  );
}
