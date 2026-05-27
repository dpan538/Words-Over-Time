"use client";

import { useMemo, useState, type CSSProperties } from "react";

export type HubChart04DependencyData = {
  title: string;
  subtitle: string;
  recordCount: number;
  highDependencyTerms: number;
  mediumDependencyTerms: number;
  objectTypeDiversityCount: number;
  brandPlatformExamples: number;
  institutionalExamples: number;
  verdict: string;
  mainTerms: string[];
  comparisonTerms: string[];
  dependencyTiers: {
    id: string;
    label: string;
    count: number;
    note: string;
  }[];
  objectSpectrum: {
    objectType: string;
    count: number;
  }[];
  formGroups: {
    label: string;
    termCount: number;
    meanDependencyScore: number;
    exampleTerms: string[];
  }[];
  boundaryClaims: string[];
  interpretiveNote: string;
  cautions: string[];
};

type HubChart04CentralityRebuiltProps = {
  data: HubChart04DependencyData;
};

type DiagramLayerId =
  | "format_core"
  | "modifier_dependency"
  | "object_containers"
  | "specified_objects"
  | "caution_boundary";

type DiagramLayerSpec = {
  id: DiagramLayerId;
  number: string;
  label: string;
  shortLabel: string;
  color: string;
  labelX: number;
  labelY: number;
  cardX: number;
  cardY: number;
  metricLabel: string;
  metricValue: string;
  summary: string;
  relationship: string;
  terms: string[];
  relatedLayers: DiagramLayerId[];
};

type RadialParticle = {
  id: string;
  x: number;
  y: number;
  r: number;
  opacity: number;
  delay: number;
  lineDelay: number;
};

type RadialFamily = {
  label: string;
  count: number;
  score: number;
  examples: string[];
  angle: number;
};

type ArcRow = {
  id: string;
  label: string;
  count: number;
  radius: number;
  startAngle: number;
  endAngle: number;
  delay: number;
  opacity: number;
};

const W = 820;
const H = 1068;
const CX = 410;
const WHEAT = "#F7F0DC";
const INK = "#050510";
const BLUE = "#1F5BEE";
const BLUE_DARK = "#082DA6";
const CYAN = "#66D2F1";
const GREEN = "#4F9329";
const GREEN_DARK = "#1E5A19";
const ORANGE = "#FFC02F";
const RED = "#F0441F";
const RED_DARK = "#B82416";
const WHITE = "#D8D5C9";
const MUTED = "#8F8B82";
const TEAL = "#8BBEB2";
const GOLD = "#FBB728";
const LEFT_W = 680;
const LEFT_H = 680;
const LEFT_CX = 330;
const LEFT_CY = 330;
const RIGHT_W = 760;
const RIGHT_H = 680;
const RIGHT_CX = 210;
const RIGHT_CY = 350;

function buildDiagramLayers(data: HubChart04DependencyData): DiagramLayerSpec[] {
  const hubTerms = data.comparisonTerms.filter((term) => term === "hub" || term === "hubs");
  const dependencyTerms = data.mainTerms.slice(0, 6);
  const objectTerms = [
    `${data.objectTypeDiversityCount} object types`,
    `${data.brandPlatformExamples} brand/platform examples`,
    `${data.institutionalExamples} institutional examples`,
    "platforms",
    "student services",
    "technical systems",
  ];
  const specifiedTerms = data.mainTerms.slice(6, 12);
  const boundaryTerms = data.cautions.slice(0, 4);

  return [
    {
      id: "format_core",
      number: "01",
      label: "Stable Format Core",
      shortLabel: "Core",
      color: RED,
      labelX: 482,
      labelY: 140,
      cardX: 482,
      cardY: 176,
      metricLabel: "stable sign",
      metricValue: hubTerms.length ? hubTerms.join(" / ") : "hub",
      summary: "The red spheres mark hub as the repeated sign: visually stable, but not enough to specify the object by itself.",
      relationship: "Feeds every other layer; the same hub form is reused while the attached domain word does the specifying.",
      terms: hubTerms.length ? hubTerms : ["hub", "hubs"],
      relatedLayers: ["modifier_dependency", "caution_boundary"],
    },
    {
      id: "modifier_dependency",
      number: "02",
      label: "Modifier Dependency",
      shortLabel: "Dependency",
      color: GREEN,
      labelX: 54,
      labelY: 262,
      cardX: 54,
      cardY: 304,
      metricLabel: "high dependency",
      metricValue: String(data.highDependencyTerms),
      summary: "The green arches show how X words carry the domain and object meaning in modern X + hub formations.",
      relationship: "Transforms the stable hub form into platform, service, room, resource, or system names.",
      terms: dependencyTerms,
      relatedLayers: ["format_core", "object_containers", "specified_objects"],
    },
    {
      id: "object_containers",
      number: "03",
      label: "Object-Type Containers",
      shortLabel: "Containers",
      color: BLUE,
      labelX: 522,
      labelY: 468,
      cardX: 508,
      cardY: 506,
      metricLabel: "object types",
      metricValue: String(data.objectTypeDiversityCount),
      summary: "The blue walls and columns hold the spread of object types that can now be named as hubs.",
      relationship: "Receives modifier-defined terms and sorts them into institutional, platform, technical, and access-point objects.",
      terms: objectTerms,
      relatedLayers: ["modifier_dependency", "specified_objects"],
    },
    {
      id: "specified_objects",
      number: "04",
      label: "Specified Objects",
      shortLabel: "Objects",
      color: ORANGE,
      labelX: 64,
      labelY: 906,
      cardX: 66,
      cardY: 736,
      metricLabel: "brand + institutional",
      metricValue: `${data.brandPlatformExamples} + ${data.institutionalExamples}`,
      summary: "The yellow stepped field represents named objects where hub becomes an access format rather than a single thing.",
      relationship: "This is where GitHub, student hub, data hub, and equipment hub become different objects with the same naming grammar.",
      terms: specifiedTerms,
      relatedLayers: ["modifier_dependency", "object_containers", "caution_boundary"],
    },
    {
      id: "caution_boundary",
      number: "05",
      label: "Evidence Boundary",
      shortLabel: "Boundary",
      color: INK,
      labelX: 506,
      labelY: 1038,
      cardX: 506,
      cardY: 884,
      metricLabel: "verdict",
      metricValue: data.verdict.replaceAll("_", " "),
      summary: "The black corners and rules mark the limits: the chart supports modifier dependency, not the claim that hub has lost all meaning.",
      relationship: "Keeps the final narrative honest by separating supported dependency from overclaiming.",
      terms: boundaryTerms,
      relatedLayers: ["format_core", "specified_objects"],
    },
  ];
}

function archPath(cx: number, y: number, outerRx: number, outerRy: number, innerRx: number, innerRy: number) {
  return [
    `M ${cx - outerRx} ${y}`,
    `A ${outerRx} ${outerRy} 0 0 1 ${cx + outerRx} ${y}`,
    `L ${cx + innerRx} ${y}`,
    `A ${innerRx} ${innerRy} 0 0 0 ${cx - innerRx} ${y}`,
    "Z",
  ].join(" ");
}

function archRimPath(cx: number, y: number, rx: number, ry: number) {
  return `M ${cx - rx} ${y} A ${rx} ${ry} 0 0 1 ${cx + rx} ${y}`;
}

function staircasePath(stepCount: number) {
  const bottomY = 1050;
  const topY = 620;
  const baseHalf = 382;
  const topHalf = 48;
  const stepH = (bottomY - topY) / stepCount;
  const stepW = (baseHalf - topHalf) / stepCount;
  const left: string[] = [`M ${CX - baseHalf} ${bottomY}`];
  for (let i = 0; i < stepCount; i += 1) {
    const nextY = bottomY - (i + 1) * stepH;
    const currentHalf = baseHalf - i * stepW;
    const nextHalf = baseHalf - (i + 1) * stepW;
    left.push(`L ${CX - currentHalf} ${nextY}`);
    left.push(`L ${CX - nextHalf} ${nextY}`);
  }
  left.push(`L ${CX + topHalf} ${topY}`);
  for (let i = stepCount - 1; i >= 0; i -= 1) {
    const currentY = bottomY - i * stepH;
    const nextY = bottomY - (i + 1) * stepH;
    const currentHalf = baseHalf - i * stepW;
    const nextHalf = baseHalf - (i + 1) * stepW;
    left.push(`L ${CX + nextHalf} ${nextY}`);
    left.push(`L ${CX + currentHalf} ${nextY}`);
    left.push(`L ${CX + currentHalf} ${currentY}`);
  }
  left.push("Z");
  return left.join(" ");
}

function blueWallPath(side: "left" | "right") {
  if (side === "left") {
    return "M 28 310 A 382 160 0 0 1 372 310 L 324 878 L 124 878 L 28 690 Z";
  }
  return "M 792 310 A 382 160 0 0 0 448 310 L 496 878 L 696 878 L 792 690 Z";
}

function pillarPath(index: number, side: "left" | "right") {
  const topY = 535 + index * 50;
  const bottomY = 875 - index * 20;
  const width = 34 + index * 2;
  const inset = 96 + index * 46;
  if (side === "left") {
    const x = inset;
    return `M ${x} ${topY} L ${x + width} ${topY + 28} L ${x + width} ${bottomY} L ${x} ${bottomY - 38} Z`;
  }
  const x = W - inset - width;
  return `M ${x + width} ${topY} L ${x} ${topY + 28} L ${x} ${bottomY} L ${x + width} ${bottomY - 38} Z`;
}

function Orb({ cy, r }: { cy: number; r: number }) {
  return (
    <g filter="url(#hub-chart04-orb-shadow)" className="hub04-main-orb">
      <circle cx={CX + 15} cy={cy + 13} r={r} fill={RED_DARK} opacity="0.72" />
      <circle cx={CX} cy={cy} r={r} fill="url(#hub-chart04-red-orb)" stroke={INK} strokeWidth="3" />
      <path
        d={`M ${CX - r * 0.47} ${cy - r * 0.18} Q ${CX - r * 0.4} ${cy - r * 0.54} ${CX - r * 0.1} ${cy - r * 0.65}`}
        fill="none"
        stroke={WHEAT}
        strokeLinecap="round"
        strokeWidth={Math.max(4, r * 0.09)}
        opacity="0.9"
      />
      <circle cx={CX - r * 0.03} cy={cy - r * 0.63} r={Math.max(3, r * 0.09)} fill={WHEAT} opacity="0.88" />
    </g>
  );
}

function polar(cx: number, cy: number, radius: number, angle: number) {
  const radians = (angle * Math.PI) / 180;
  return {
    x: cx + Math.cos(radians) * radius,
    y: cy + Math.sin(radians) * radius,
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function describeArc(cx: number, cy: number, radius: number, startAngle: number, endAngle: number) {
  const start = polar(cx, cy, radius, startAngle);
  const end = polar(cx, cy, radius, endAngle);
  const largeArcFlag = Math.abs(endAngle - startAngle) <= 180 ? "0" : "1";
  return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
}

function normalizeLabel(label: string) {
  return label.replaceAll("_", " ").replace(/\s+/g, " ").trim();
}

function chartStyleVars(delay: number): CSSProperties {
  return { "--delay": `${delay}ms` } as CSSProperties;
}

function dependencyStrengthLabel(score: number) {
  if (score >= 0.9) return "very strong";
  if (score >= 0.75) return "strong";
  if (score >= 0.6) return "moderate";
  return "context";
}

function compactFamilyLabel(label: string) {
  const normalized = normalizeLabel(label);
  if (normalized.length <= 18) return normalized;
  return normalized
    .replace("Closed Compound", "Compound")
    .replace("HubX Brand Form", "Brand Form")
    .replace("Platform Content Access", "Platform Access")
    .replace("Institutional Access Point", "Institutional")
    .slice(0, 18);
}

function buildFamilies(data: HubChart04DependencyData): RadialFamily[] {
  const fallback = [
    { label: "X + hub", count: Math.max(data.highDependencyTerms, 24), score: 0.88, examples: data.mainTerms.slice(0, 8) },
    { label: "hub + X", count: Math.max(data.mediumDependencyTerms, 10), score: 0.68, examples: data.mainTerms.slice(8, 14) },
    { label: "object containers", count: data.objectTypeDiversityCount, score: 0.74, examples: data.objectSpectrum.map((item) => normalizeLabel(item.objectType)) },
  ];
  const groups = data.formGroups.length
    ? data.formGroups.map((group) => ({ label: group.label, count: group.termCount, score: group.meanDependencyScore, examples: group.exampleTerms }))
    : fallback;
  const angles = [214, 252, 292, 326, 26, 66, 112, 158];
  return groups.slice(0, 8).map((group, index) => ({ ...group, angle: angles[index % angles.length] }));
}

function buildRadialParticles(data: HubChart04DependencyData) {
  const families = buildFamilies(data);
  const maxCount = Math.max(...families.map((family) => family.count), 1);
  const particles: RadialParticle[] = [];

  families.forEach((family, familyIndex) => {
    const visualCount = clamp(family.count, 4, 18);
    const spread = visualCount > 12 ? 34 : 24;
    Array.from({ length: visualCount }).forEach((_, index) => {
      const ratio = visualCount === 1 ? 0.5 : index / (visualCount - 1);
      const angle = family.angle + (ratio - 0.5) * spread + ((index % 3) - 1) * 2.8;
      const ring = index % 7;
      const run = Math.floor(index / 7);
      const radius = 148 + ring * 38 + run * 30 + (family.count / maxCount) * 104;
      const point = polar(LEFT_CX, LEFT_CY, radius, angle);
      particles.push({
        id: `${family.label}-${index}`,
        x: clamp(point.x, 34, LEFT_W - 34),
        y: clamp(point.y, 34, LEFT_H - 34),
        r: 1.7 + family.score * 1.45 + (index % 4 === 0 ? 0.55 : 0),
        opacity: 0.34 + family.score * 0.3,
        delay: familyIndex * 180 + index * 42,
        lineDelay: familyIndex * 130 + index * 24,
      });
    });
  });

  data.comparisonTerms.slice(0, 8).forEach((term, index) => {
    const angle = 188 + index * 14;
      const point = polar(LEFT_CX, LEFT_CY, 108 + index * 11, angle);
    particles.push({
      id: `comparison-${term}-${index}`,
      x: clamp(point.x, 34, LEFT_W - 34),
      y: clamp(point.y, 34, LEFT_H - 34),
      r: 1.9,
      opacity: 0.42,
      delay: 1200 + index * 64,
      lineDelay: 520 + index * 30,
    });
  });

  return { families, particles };
}

function buildArcRows(data: HubChart04DependencyData): ArcRow[] {
  const tiers = data.dependencyTiers.length
    ? data.dependencyTiers
    : [
        { id: "high_dependency", label: "high dependency", count: data.highDependencyTerms, note: "" },
        { id: "medium_dependency", label: "medium dependency", count: data.mediumDependencyTerms, note: "" },
      ];
  const maxCount = Math.max(...tiers.map((tier) => tier.count), 1);
  const rows: ArcRow[] = [];
  tiers.forEach((tier, tierIndex) => {
    const laneCount = clamp(Math.ceil(tier.count / 7), 2, 6);
    Array.from({ length: laneCount }).forEach((_, laneIndex) => {
      const rowIndex = rows.length;
      const radius = 56 + rowIndex * 25;
      const strength = tier.count / maxCount;
      rows.push({
        id: `${tier.id}-${laneIndex}`,
        label: tier.label,
        count: tier.count,
        radius,
        startAngle: -82 + tierIndex * 2,
        endAngle: 82 - tierIndex * 4 - laneIndex * 1.6,
        delay: 120 + rowIndex * 95,
        opacity: 0.28 + strength * 0.34,
      });
    });
  });
  return rows.slice(0, 14);
}

function objectDots(data: HubChart04DependencyData, rows: ArcRow[]) {
  const spectrum = data.objectSpectrum.length ? data.objectSpectrum : [{ objectType: "object type", count: data.objectTypeDiversityCount || 1 }];
  const maxCount = Math.max(...spectrum.map((item) => item.count), 1);
  return spectrum.flatMap((item, itemIndex) => {
    const dotCount = clamp(Math.round((item.count / maxCount) * 10), 3, 10);
    return Array.from({ length: dotCount }).map((_, dotIndex) => {
      const row = rows[(itemIndex * 2 + dotIndex) % rows.length];
      const angle = -72 + dotIndex * (144 / Math.max(dotCount - 1, 1)) + itemIndex * 4;
      const radius = row.radius + 10 + (itemIndex % 3) * 4;
      const point = polar(RIGHT_CX, RIGHT_CY, radius, angle);
      return {
        id: `${item.objectType}-${dotIndex}`,
        x: point.x,
        y: point.y,
        size: itemIndex % 2 === 0 ? 4 : 3,
        opacity: 0.28 + (item.count / maxCount) * 0.34,
        delay: 620 + itemIndex * 130 + dotIndex * 35,
      };
    });
  });
}

function SvgButtonLayer({
  layer,
  active,
  related,
  onEnter,
  onLeave,
  onToggle,
}: {
  layer: DiagramLayerSpec;
  active: boolean;
  related: boolean;
  onEnter: () => void;
  onLeave: () => void;
  onToggle: () => void;
}) {
  return (
    <g
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onClick={onToggle}
      className="cursor-pointer outline-none"
      opacity={active ? 1 : related ? 1 : 0.9}
    >
      <rect
        x={layer.labelX}
        y={layer.labelY - 25}
        width={248}
        height={54}
        rx={0}
        fill={WHEAT}
        stroke={active ? layer.color : INK}
        strokeWidth={active ? 5 : 2}
      />
      <text x={layer.labelX + 16} y={layer.labelY - 5} fill={INK} fontFamily="monospace" fontSize={17} fontWeight={900} letterSpacing={2.2}>
        LAYER {layer.number}
      </text>
      <text x={layer.labelX + 16} y={layer.labelY + 18} fill={INK} fontFamily="sans-serif" fontSize={25} fontWeight={900}>
        {layer.shortLabel}
      </text>
    </g>
  );
}

function LayerInfoPanel({
  layer,
  relatedLabels,
  active,
  layers,
  activeLayerId,
  onSelect,
  onReset,
}: {
  layer: DiagramLayerSpec;
  relatedLabels: string[];
  active: boolean;
  layers: DiagramLayerSpec[];
  activeLayerId: DiagramLayerId | null;
  onSelect: (layerId: DiagramLayerId) => void;
  onReset: () => void;
}) {
  const terms = layer.terms.slice(0, 6);

  return (
    <aside className="flex min-h-[56rem] flex-col border border-ink/70 bg-wheat">
      <div className="min-h-[10.5rem] border-b border-ink/60 px-4 py-3" style={{ borderTop: `0.75rem solid ${active ? layer.color : "#8BBEB2"}` }}>
        <p className="font-mono text-[0.9rem] font-black uppercase tracking-[0.18em] text-hub-ruby">
          {active ? "selected layer" : "diagram state"}
        </p>
        <h3 className="mt-2 text-[clamp(1.55rem,2.6vw,2.25rem)] font-black leading-[0.96] text-ink">{layer.label}</h3>
      </div>

      <dl className="grid grid-cols-2 border-b border-ink/60">
        <div className="border-r border-ink/50 px-4 py-3">
          <dt className="font-mono text-[0.83rem] font-black uppercase tracking-[0.16em] text-hub-ruby">{layer.metricLabel}</dt>
          <dd className="mt-2 font-mono text-[1.45rem] font-black uppercase tracking-[0.08em] text-hub-space">{layer.metricValue}</dd>
        </div>
        <div className="px-4 py-3">
          <dt className="font-mono text-[0.83rem] font-black uppercase tracking-[0.16em] text-hub-ruby">linked layers</dt>
          <dd className="mt-2 font-mono text-[0.99rem] font-black uppercase leading-6 tracking-[0.08em] text-hub-space">{relatedLabels.join(" / ")}</dd>
        </div>
      </dl>

      <div className="min-h-[14rem] space-y-3 border-b border-ink/60 px-4 py-4 text-[0.96rem] leading-6 text-ink/76">
        <p>{layer.summary}</p>
        <p>{layer.relationship}</p>
      </div>

      <div className="min-h-[11.5rem] border-b border-ink/60 px-4 py-4">
        <p className="font-mono text-[0.83rem] font-black uppercase tracking-[0.16em] text-hub-ruby">terms / examples</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {terms.map((term) => (
            <span key={term} className="border border-ink/55 bg-[#F8F1DA] px-2 py-1 font-mono text-[0.9rem] font-black uppercase tracking-[0.09em] text-ink">
              {term}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-auto grid">
        <button type="button" onClick={onReset} className={`grid grid-cols-[4.6rem_1fr] border-b border-ink/55 text-left transition ${activeLayerId ? "bg-wheat hover:bg-[#F8F1DA]" : "bg-[#F8C65A]"}`}>
          <span className="border-r border-ink/45 px-3 py-3 font-mono text-[0.86rem] font-black uppercase tracking-[0.13em]">all</span>
          <span className="px-3 py-3 text-[1.14rem] font-black leading-6">All layers clear</span>
        </button>
        {layers.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            className={`grid grid-cols-[4.6rem_1fr] border-b border-ink/55 text-left transition last:border-b-0 ${activeLayerId === item.id ? "text-ink" : "hover:bg-[#F8F1DA]"}`}
            style={{ backgroundColor: activeLayerId === item.id ? `${item.color}55` : undefined }}
          >
            <span className="border-r border-ink/45 px-3 py-3 font-mono text-[0.86rem] font-black uppercase tracking-[0.13em]">{item.number}</span>
            <span className="px-3 py-3 text-[1.14rem] font-black leading-6">{item.label}</span>
          </button>
        ))}
      </div>
    </aside>
  );
}

function LeftConstellation({ data }: { data: HubChart04DependencyData }) {
  const { families, particles } = useMemo(() => buildRadialParticles(data), [data]);
  const maxFamilyCount = Math.max(...families.map((family) => family.count), 1);

  return (
    <article className="overflow-hidden border border-white/18 bg-black text-white shadow-[0_24px_80px_rgba(5,5,16,0.28)]">
      <div className="grid min-h-[9.5rem] gap-3 border-b border-white/14 px-6 py-5 sm:grid-cols-[1fr_auto] sm:items-center">
        <div>
          <p className="font-mono text-[0.82rem] font-black uppercase tracking-[0.24em] text-white/58">branch map A / radial dependency</p>
          <h3 className="mt-2 text-[clamp(1.7rem,3.1vw,2.62rem)] font-black leading-none tracking-[-0.04em]">Modifier gravity field</h3>
        </div>
        <div className="grid grid-cols-2 gap-2 font-mono text-[0.8rem] font-black uppercase tracking-[0.16em] text-white/72">
          <span className="border border-white/20 px-2 py-1">high {data.highDependencyTerms}</span>
          <span className="border border-white/20 px-2 py-1">records {data.recordCount}</span>
        </div>
      </div>

      <svg viewBox={`0 0 ${LEFT_W} ${LEFT_H}`} role="img" aria-label="Hub modifier dependency particle network" className="block aspect-square w-full">
        <defs>
          <radialGradient id="hub04-center-glow" cx="50%" cy="50%" r="55%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
            <stop offset="42%" stopColor="#FFFFFF" stopOpacity="0.62" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>
          <filter id="hub04-soft-white" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="1.7" />
          </filter>
        </defs>

        <rect width={LEFT_W} height={LEFT_H} fill="#000000" />
        <circle cx={LEFT_CX} cy={LEFT_CY} r="174" fill="url(#hub04-center-glow)" opacity="0.08" className="hub04-center-breathe" />
        <g>
          {particles.map((particle, index) => (
            <line key={`line-${particle.id}-${index}`} x1={LEFT_CX} y1={LEFT_CY} x2={particle.x} y2={particle.y} stroke={WHITE} strokeWidth="0.58" strokeOpacity="0.24" className="hub04-line-draw" style={chartStyleVars(particle.lineDelay)} />
          ))}
        </g>
        <g opacity="0.22">
          {particles.filter((_, index) => index % 5 === 0).map((particle, index) => {
            const midX = LEFT_CX + (particle.x - LEFT_CX) * 0.64;
            const midY = LEFT_CY + (particle.y - LEFT_CY) * 0.64;
            return <circle key={`mid-${particle.id}-${index}`} cx={midX} cy={midY} r="1.3" fill={WHITE} />;
          })}
        </g>
        <g>
          {particles.map((particle, index) => (
            <circle key={`particle-${particle.id}-${index}`} cx={particle.x} cy={particle.y} r={particle.r} fill={WHITE} fillOpacity={particle.opacity} className="hub04-particle-breathe" style={chartStyleVars(particle.delay)} />
          ))}
        </g>
        <g filter="url(#hub04-soft-white)">
          <circle cx={LEFT_CX} cy={LEFT_CY} r="15" fill={WHITE} opacity="0.9" className="hub04-center-breathe" />
        </g>
        <circle cx={LEFT_CX} cy={LEFT_CY} r="5" fill={WHITE} />
        <text x={LEFT_CX} y={LEFT_CY + 39} fill={WHITE} textAnchor="middle" fontFamily="monospace" fontSize="17" fontWeight="900" letterSpacing="4">HUB</text>
        <g>
          {families.slice(0, 6).map((family, index) => {
            const point = polar(LEFT_CX, LEFT_CY, 284 + (index % 2) * 38, family.angle);
            const x = clamp(point.x, 76, LEFT_W - 300);
            const y = clamp(point.y, 76, LEFT_H - 72);
            return (
              <g key={`${family.label}-${index}`} opacity="0.78">
                <rect x={x - 8} y={y - 15} width={Math.min(210, 112 * (family.count / maxFamilyCount) + 42)} height="1.2" fill={WHITE} opacity="0.52" />
                <text x={x} y={y} fill={WHITE} fontFamily="monospace" fontSize="14" fontWeight="900" letterSpacing="2">{compactFamilyLabel(family.label).toUpperCase()}</text>
                <text x={x} y={y + 22} fill={MUTED} fontFamily="monospace" fontSize="11.5" fontWeight="900" letterSpacing="1">{family.count} TERMS / {dependencyStrengthLabel(family.score).toUpperCase()}</text>
              </g>
            );
          })}
        </g>
      </svg>
    </article>
  );
}

function RightSemiCircle({ data }: { data: HubChart04DependencyData }) {
  const rows = useMemo(() => buildArcRows(data), [data]);
  const dots = useMemo(() => objectDots(data, rows), [data, rows]);
  const families = useMemo(() => buildFamilies(data), [data]);
  const maxTierCount = Math.max(...data.dependencyTiers.map((tier) => tier.count), 1);

  return (
    <article className="overflow-hidden border border-white/18 bg-black text-white shadow-[0_24px_80px_rgba(5,5,16,0.28)]">
      <div className="grid min-h-[9.5rem] gap-3 border-b border-white/14 px-6 py-5 sm:grid-cols-[1fr_auto] sm:items-center">
        <div>
          <p className="font-mono text-[0.82rem] font-black uppercase tracking-[0.24em] text-white/58">branch map B / boundary instrument</p>
          <h3 className="mt-2 text-[clamp(1.7rem,3.1vw,2.62rem)] font-black leading-none tracking-[-0.04em]">Dependency radius</h3>
        </div>
        <div className="grid grid-cols-2 gap-2 font-mono text-[0.8rem] font-black uppercase tracking-[0.16em] text-white/72">
          <span className="border border-white/20 px-2 py-1">objects {data.objectTypeDiversityCount}</span>
          <span className="border border-white/20 px-2 py-1">forms {data.formGroups.length}</span>
        </div>
      </div>

      <svg viewBox={`0 0 ${RIGHT_W} ${RIGHT_H}`} role="img" aria-label="Hub dependency tier semicircle chart" className="block aspect-square w-full">
        <rect width={RIGHT_W} height={RIGHT_H} fill="#000000" />
        <g>
          {rows.map((row) => (
            <path key={row.id} d={describeArc(RIGHT_CX, RIGHT_CY, row.radius, row.startAngle, row.endAngle)} fill="none" stroke={WHITE} strokeWidth={row.count > maxTierCount * 0.7 ? 1.45 : 1.05} strokeOpacity={row.opacity} strokeLinecap="round" pathLength="1" className="hub04-arc-redraw" style={chartStyleVars(row.delay)} />
          ))}
        </g>
        <g>
          {families.slice(0, 7).map((family, index) => {
            const angle = -74 + index * (148 / Math.max(families.slice(0, 7).length - 1, 1));
            const start = polar(RIGHT_CX, RIGHT_CY, 36, angle);
            const end = polar(RIGHT_CX, RIGHT_CY, 330, angle);
            return (
              <g key={`ray-${family.label}-${index}`}>
                <line x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke={WHITE} strokeWidth="0.75" strokeOpacity="0.34" className="hub04-line-draw" style={chartStyleVars(420 + index * 115)} />
                <circle cx={end.x} cy={end.y} r="1.8" fill={WHITE} opacity="0.48" className="hub04-particle-breathe" style={chartStyleVars(980 + index * 90)} />
              </g>
            );
          })}
        </g>
        <g>
          {dots.map((dot) => (
            <rect key={dot.id} x={dot.x - dot.size / 2} y={dot.y - dot.size / 2} width={dot.size} height={dot.size} fill={WHITE} fillOpacity={dot.opacity} transform={`rotate(45 ${dot.x} ${dot.y})`} className="hub04-particle-breathe" style={chartStyleVars(dot.delay)} />
          ))}
        </g>
        <circle cx={RIGHT_CX} cy={RIGHT_CY} r="34" fill="#000" stroke={WHITE} strokeOpacity="0.48" strokeWidth="1" />
        <circle cx={RIGHT_CX} cy={RIGHT_CY} r="6" fill={WHITE} />
        <path d="M 60 350 H 610" stroke={WHITE} strokeWidth="0.8" strokeOpacity="0.36" className="hub04-line-draw" style={chartStyleVars(300)} />
        <g fontFamily="monospace" fontWeight="900" letterSpacing="2.5">
          {data.dependencyTiers.slice(0, 4).map((tier, index) => {
            const y = 86 + index * 47;
            const lineEnd = 480 + (tier.count / maxTierCount) * 58;
            return (
              <g key={tier.id} opacity="0.9">
                <text x="44" y={y} fill={WHITE} fontSize="22">{tier.count}</text>
                <line x1="116" y1={y - 7} x2={lineEnd} y2={y - 7} stroke={WHITE} strokeWidth="0.95" strokeOpacity="0.52" />
                <text x="550" y={y} fill={MUTED} fontSize="11">{normalizeLabel(tier.label).toUpperCase()}</text>
              </g>
            );
          })}
        </g>
        <text x="46" y="628" fill={WHITE} fontFamily="monospace" fontSize="14.5" fontWeight="900" letterSpacing="3">VERDICT / {normalizeLabel(data.verdict).toUpperCase()}</text>
      </svg>
    </article>
  );
}

export function HubChart04CentralityRebuilt({ data }: HubChart04CentralityRebuiltProps) {
  const stepCount = Math.max(7, Math.min(10, Math.round(data.highDependencyTerms / 4)));
  const densityOpacity = Math.min(0.78, 0.38 + data.recordCount / 150);
  const wallPairs = Math.max(4, Math.min(7, Math.round(data.objectTypeDiversityCount / 3)));
  const diagramLayers = useMemo(() => buildDiagramLayers(data), [data]);
  const [hoveredLayer, setHoveredLayer] = useState<DiagramLayerId | null>(null);
  const [lockedLayer, setLockedLayer] = useState<DiagramLayerId | null>(null);
  const activeLayerId = lockedLayer ?? hoveredLayer;
  const activeLayer = diagramLayers.find((layer) => layer.id === activeLayerId);
  const layerById = (layerId: DiagramLayerId) => diagramLayers.find((layer) => layer.id === layerId);

  const toggleLayer = (layerId: DiagramLayerId) => {
    setHoveredLayer(null);
    setLockedLayer((current) => (current === layerId ? null : layerId));
  };

  const isLayerRelated = (layerId: DiagramLayerId) => Boolean(activeLayer?.relatedLayers.includes(layerId));
  const isLayerActive = (layerId: DiagramLayerId) => activeLayerId === layerId;
  const layerOpacity = (layerId: DiagramLayerId) => {
    if (!activeLayerId) return 1;
    if (isLayerActive(layerId)) return 1;
    if (isLayerRelated(layerId)) return 0.68;
    return 0.18;
  };

  const baseLayerFilter = (layerId: DiagramLayerId) => {
    if (layerId === "modifier_dependency") return "url(#hub-chart04-heavy-shadow)";
    if (layerId === "object_containers" || layerId === "specified_objects") return "url(#hub-chart04-soft-shadow)";
    return undefined;
  };

  const layerFilter = (layerId: DiagramLayerId) => {
    if (!activeLayerId) return undefined;
    if (isLayerActive(layerId)) return "url(#hub-chart04-interaction-lift)";
    if (isLayerRelated(layerId)) return baseLayerFilter(layerId);
    return "url(#hub-chart04-recede-blur)";
  };

  const layerProps = (layerId: DiagramLayerId) => ({
    className: "hub04-main-layer cursor-pointer outline-none transition-opacity duration-200",
    style: {
      opacity: layerOpacity(layerId),
      filter: layerFilter(layerId) ?? baseLayerFilter(layerId),
      "--hub04-main-delay": `${["format_core", "modifier_dependency", "object_containers", "specified_objects", "caution_boundary"].indexOf(layerId) * 180}ms`,
    } as CSSProperties,
    onMouseEnter: () => setHoveredLayer(layerId),
    onMouseLeave: () => setHoveredLayer(null),
    onClick: () => toggleLayer(layerId),
  });

  const inspectorLayer = activeLayer ?? {
    id: "format_core",
    number: "00",
    label: "All Dependency Layers",
    shortLabel: "All",
    color: "#8BBEB2",
    labelX: 36,
    labelY: 1020,
    cardX: 44,
    cardY: 844,
    metricLabel: "interaction",
    metricValue: "hover or click",
    summary: "Hover or click the poster shapes. The information stays inside the diagram and follows the selected layer.",
    relationship: "The whole diagram reads from repeated hub form, through modifier dependency, into named objects, with evidence cautions around the edge.",
    terms: data.mainTerms.slice(0, 8),
    relatedLayers: [],
  } satisfies DiagramLayerSpec;

  const relatedLabels = activeLayer
    ? activeLayer.relatedLayers.map((layerId) => layerById(layerId)?.shortLabel ?? layerId)
    : ["core", "dependency", "objects"];

  return (
    <div className="border border-ink/64 bg-wheat">
      <div className="border-b border-ink/52">
        <div className="mx-auto grid max-w-[88rem] gap-3 px-3 py-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div>
            <p className="font-mono text-[0.92rem] font-black uppercase leading-5 tracking-[0.16em] text-hub-ruby">pure color dependency diagram / Chart 04</p>
            <p className="mt-1 max-w-4xl text-[1.02rem] leading-6 text-ink/70">{data.subtitle}</p>
          </div>
          <dl className="grid border border-ink/45 sm:grid-cols-3 lg:w-[34rem]">
            {[
              ["records", String(data.recordCount)],
              ["object types", String(data.objectTypeDiversityCount)],
              ["verdict", data.verdict.replaceAll("_", " ")],
            ].map(([label, value], index) => (
              <div key={label} className={`${index < 2 ? "border-b border-ink/45 sm:border-b-0 sm:border-r" : ""} border-ink/45 px-3 py-2`}>
                <dt className="font-mono text-[0.74rem] font-black uppercase tracking-[0.14em] text-hub-ruby">{label}</dt>
                <dd className="mt-1 font-mono text-[0.86rem] font-black uppercase leading-5 tracking-[0.08em] text-hub-space">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="mx-auto grid max-w-[88rem] gap-3 px-3 py-3 lg:grid-cols-[24rem_minmax(0,1fr)] lg:items-start">
        <LayerInfoPanel
          layer={inspectorLayer}
          relatedLabels={relatedLabels}
          active={Boolean(activeLayer)}
          layers={diagramLayers}
          activeLayerId={activeLayerId}
          onSelect={toggleLayer}
          onReset={() => {
            setLockedLayer(null);
            setHoveredLayer(null);
          }}
        />
        <div className="flex justify-center">
          <svg viewBox={`0 0 ${W} ${H}`} role="group" aria-label="Hub Chart 04 dependency diagram" className="block aspect-[820/1068] w-full max-w-[54rem]">
            <defs>
              <filter id="hub-chart04-heavy-shadow" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="8" dy="11" stdDeviation="1.7" floodColor={INK} floodOpacity="0.54" /></filter>
              <filter id="hub-chart04-soft-shadow" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="5" dy="8" stdDeviation="2.2" floodColor={INK} floodOpacity="0.34" /></filter>
              <filter id="hub-chart04-orb-shadow" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="7" dy="10" stdDeviation="2.1" floodColor={INK} floodOpacity="0.5" /></filter>
              <filter id="hub-chart04-interaction-lift" x="-25%" y="-25%" width="150%" height="160%"><feDropShadow dx="9" dy="12" stdDeviation="2.1" floodColor={INK} floodOpacity="0.56" /></filter>
              <filter id="hub-chart04-recede-blur" x="-20%" y="-20%" width="140%" height="150%"><feGaussianBlur stdDeviation="1.15" /></filter>
              <linearGradient id="hub-chart04-blue-wall" x1="0" x2="1" y1="0" y2="1"><stop offset="0%" stopColor="#3278FF" /><stop offset="48%" stopColor={BLUE} /><stop offset="100%" stopColor={BLUE_DARK} /></linearGradient>
              <linearGradient id="hub-chart04-green-arch" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#75B73D" /><stop offset="52%" stopColor={GREEN} /><stop offset="100%" stopColor={GREEN_DARK} /></linearGradient>
              <linearGradient id="hub-chart04-step-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#FFD943" /><stop offset="56%" stopColor={ORANGE} /><stop offset="100%" stopColor="#EE9418" /></linearGradient>
              <radialGradient id="hub-chart04-red-orb" cx="38%" cy="28%" r="72%"><stop offset="0%" stopColor="#FF642D" /><stop offset="52%" stopColor={RED} /><stop offset="100%" stopColor="#B91F12" /></radialGradient>
              <pattern id="hub-chart04-green-stripes" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="transparent" /><path d="M 1 0 L 1 6" stroke={INK} strokeWidth="1.1" strokeOpacity="0.54" /></pattern>
              <pattern id="hub-chart04-blue-stripes" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="transparent" /><path d="M 0 2 L 6 2" stroke={INK} strokeWidth="0.86" strokeOpacity="0.43" /></pattern>
              <pattern id="hub-chart04-dot-density" width="10" height="10" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.15" fill={INK} opacity={densityOpacity * 0.86} /><circle cx="7" cy="7" r="1" fill={INK} opacity={densityOpacity * 0.72} /></pattern>
            </defs>
            <rect width={W} height={H} fill="#F7F0DC" />
            <g onClick={() => { setLockedLayer(null); setHoveredLayer(null); }} className="cursor-pointer outline-none">
              <rect x="42" y="28" width="254" height="38" fill={activeLayerId ? WHEAT : ORANGE} fillOpacity={activeLayerId ? 0.76 : 0.92} stroke={INK} strokeWidth="2" />
              <text x="58" y="53" fill={INK} fontFamily="monospace" fontSize="17" fontWeight="900" letterSpacing="2.2">ALL LAYERS / RESET</text>
            </g>
            <g {...layerProps("caution_boundary")}><path d="M 22 74 L 292 74 L 22 220 Z" fill={INK} /><path d="M 798 74 L 528 74 L 798 220 Z" fill={INK} /><path d="M 22 925 L 142 790 L 22 655 Z" fill={INK} /><path d="M 798 925 L 678 790 L 798 655 Z" fill={INK} /></g>
            <g {...layerProps("object_containers")}><path d={blueWallPath("left")} fill="url(#hub-chart04-blue-wall)" stroke={INK} strokeWidth="3" /><path d={blueWallPath("left")} fill="url(#hub-chart04-blue-stripes)" /><path d={blueWallPath("right")} fill="url(#hub-chart04-blue-wall)" stroke={INK} strokeWidth="3" /><path d={blueWallPath("right")} fill="url(#hub-chart04-blue-stripes)" /></g>
            <g {...layerProps("modifier_dependency")}>
              {[
                { y: 280, outerRx: 385, outerRy: 185, innerRx: 248, innerRy: 110 },
                { y: 394, outerRx: 285, outerRy: 130, innerRx: 180, innerRy: 82 },
                { y: 500, outerRx: 198, outerRy: 88, innerRx: 118, innerRy: 48 },
                { y: 584, outerRx: 124, outerRy: 54, innerRx: 66, innerRy: 28 },
              ].map((arch, index) => (
                <g key={arch.y}>
                  <path d={archPath(CX, arch.y, arch.outerRx, arch.outerRy, arch.innerRx, arch.innerRy)} fill="url(#hub-chart04-green-arch)" stroke={INK} strokeWidth={index === 0 ? 4 : 3} />
                  <path d={archPath(CX, arch.y, arch.outerRx, arch.outerRy, arch.innerRx, arch.innerRy)} fill="url(#hub-chart04-green-stripes)" />
                  <path d={archRimPath(CX, arch.y, arch.outerRx, arch.outerRy)} fill="none" stroke={CYAN} strokeWidth="6.4" className="hub04-main-rim" pathLength="1" />
                  <path d={archRimPath(CX, arch.y, arch.innerRx, arch.innerRy)} fill="none" stroke={INK} strokeOpacity="0.62" strokeWidth="4.6" />
                </g>
              ))}
            </g>
            <g {...layerProps("object_containers")}>
              {Array.from({ length: wallPairs }, (_, index) => (
                <g key={index}>
                  <path d={pillarPath(index, "left")} fill="url(#hub-chart04-blue-wall)" stroke={INK} strokeWidth="2.4" />
                  <path d={pillarPath(index, "left")} fill="url(#hub-chart04-blue-stripes)" />
                  <path d={pillarPath(index, "right")} fill="url(#hub-chart04-blue-wall)" stroke={INK} strokeWidth="2.4" />
                  <path d={pillarPath(index, "right")} fill="url(#hub-chart04-blue-stripes)" />
                </g>
              ))}
            </g>
            <g {...layerProps("specified_objects")}><path d={staircasePath(stepCount)} fill="url(#hub-chart04-step-fill)" stroke={INK} strokeWidth="3.4" /><path d={staircasePath(stepCount)} fill="url(#hub-chart04-dot-density)" /></g>
            <g {...layerProps("format_core")}><Orb cy={125} r={67} /><Orb cy={308} r={55} /><Orb cy={505} r={36} /><Orb cy={625} r={29} /></g>
            <g {...layerProps("caution_boundary")}><path d="M 28 1058 H 792" stroke={INK} strokeWidth="3" /><path d="M 50 1036 H 770" stroke={INK} strokeWidth="3" strokeDasharray="3 12" strokeLinecap="round" /></g>
            <g>
              {diagramLayers.map((layer) => (
                <SvgButtonLayer key={layer.id} layer={layer} active={activeLayerId === layer.id} related={Boolean(activeLayer && activeLayer.relatedLayers.includes(layer.id))} onEnter={() => setHoveredLayer(layer.id)} onLeave={() => setHoveredLayer(null)} onToggle={() => toggleLayer(layer.id)} />
              ))}
            </g>
          </svg>
        </div>
      </div>

      <div className="mt-10 border-t border-ink/54 px-4 pb-6 pt-10">
        <div className="mb-8 grid w-full gap-5 lg:grid-cols-[16rem_minmax(0,1fr)_minmax(18rem,0.44fr)]">
          <p className="font-mono text-[0.9rem] font-black uppercase leading-5 tracking-[0.2em] text-hub-ruby">branch evidence</p>
          <div>
            <h3 className="text-[clamp(1.45rem,2.5vw,2.35rem)] font-black leading-[0.95] tracking-[-0.04em] text-ink">
              Hub keeps branching after the central model.
            </h3>
            <p className="mt-3 max-w-4xl text-[1.04rem] leading-7 text-ink/68">
              The main diagram explains how hub becomes a stable naming format. These two branch maps show what happens after that format travels outward: institutional access points, technical systems, platform/content access, websites, repositories, and student services all borrow the same center-word while depending on different modifiers to specify the object.
            </p>
          </div>
          <div className="border border-ink/24 bg-wheat/60 px-4 py-3">
            <p className="font-mono text-[0.72rem] font-black uppercase tracking-[0.16em] text-hub-ruby">reading caution</p>
            <p className="mt-2 text-[0.9rem] leading-5 text-ink/62">
              The branch maps visualize dependency and spread; they do not claim every X + hub phrase means the same thing.
            </p>
          </div>
        </div>
        <div className="grid w-full gap-4 xl:grid-cols-[minmax(0,0.94fr)_minmax(0,1.08fr)]">
          <LeftConstellation data={data} />
          <RightSemiCircle data={data} />
        </div>
        <div className="mt-8 grid gap-5 border-t border-ink/42 pt-7 lg:grid-cols-[16rem_minmax(0,1fr)]">
          <p className="font-mono text-[0.9rem] font-black uppercase leading-5 tracking-[0.2em] text-hub-ruby">continuing question</p>
          <p className="max-w-5xl text-[clamp(1.02rem,1.35vw,1.18rem)] leading-7 text-ink/72">
            Hub ends this page as a word that has not disappeared into emptiness, but has become unusually available. It can still point to a wheel center, a transport transfer point, a network node, a campus desk, a website, a data system, or a brand surface. What changes is not that hub loses all meaning; it becomes a compact promise of access, concentration, and connection, waiting for another word to tell us what kind of world has gathered around it.
          </p>
        </div>
      </div>

      <style jsx global>{`
        .hub04-line-draw {
          stroke-dasharray: 1;
          stroke-dashoffset: 1;
          animation: hub04-draw 1100ms cubic-bezier(0.22, 1, 0.36, 1) var(--delay) forwards;
        }

        .hub04-arc-redraw {
          stroke-dasharray: 1;
          stroke-dashoffset: 1;
          animation:
            hub04-redraw-loop 7800ms cubic-bezier(0.22, 1, 0.36, 1) var(--delay) infinite,
            hub04-arc-breathe 4200ms ease-in-out calc(var(--delay) + 1650ms) infinite;
        }

        .hub04-particle-breathe {
          transform-box: fill-box;
          transform-origin: center;
          animation: hub04-breathe 2900ms ease-in-out var(--delay) infinite;
        }

        .hub04-center-breathe {
          transform-box: fill-box;
          transform-origin: center;
          animation: hub04-core 3400ms ease-in-out infinite;
        }

        .hub04-main-layer,
        .hub04-main-orb,
        .hub04-main-rim {
          transform-box: fill-box;
          transform-origin: center;
        }

        .hub04-main-layer {
          animation: hub04-main-layer-breathe 6800ms ease-in-out var(--hub04-main-delay) infinite;
        }

        .hub04-main-orb {
          animation: hub04-main-orb-pulse 5200ms ease-in-out infinite;
        }

        .hub04-main-rim {
          stroke-dasharray: 1;
          stroke-dashoffset: 1;
          animation:
            hub04-main-rim-redraw 6200ms cubic-bezier(0.22, 1, 0.36, 1) var(--hub04-main-delay) infinite,
            hub04-main-rim-glow 4200ms ease-in-out calc(var(--hub04-main-delay) + 900ms) infinite;
        }

        @keyframes hub04-draw {
          to { stroke-dashoffset: 0; }
        }

        @keyframes hub04-redraw-loop {
          0% { stroke-dashoffset: 1; }
          24% { stroke-dashoffset: 0; }
          72% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: 1; }
        }

        @keyframes hub04-arc-breathe {
          0%, 100% { opacity: 0.26; }
          50% { opacity: 0.62; }
        }

        @keyframes hub04-breathe {
          0%, 100% { opacity: 0.28; transform: scale(0.86); }
          45% { opacity: 0.76; transform: scale(1.14); }
        }

        @keyframes hub04-core {
          0%, 100% { opacity: 0.08; transform: scale(0.96); }
          50% { opacity: 0.22; transform: scale(1.06); }
        }

        @keyframes hub04-main-layer-breathe {
          0%, 100% { transform: translateY(0) scale(0.996); }
          50% { transform: translateY(-2px) scale(1.006); }
        }

        @keyframes hub04-main-orb-pulse {
          0%, 100% { transform: scale(0.985); opacity: 0.94; }
          50% { transform: scale(1.025); opacity: 1; }
        }

        @keyframes hub04-main-rim-redraw {
          0% { stroke-dashoffset: 1; }
          24%, 78% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -1; }
        }

        @keyframes hub04-main-rim-glow {
          0%, 100% { opacity: 0.58; }
          50% { opacity: 0.86; }
        }

        @media (prefers-reduced-motion: reduce) {
          .hub04-line-draw,
          .hub04-arc-redraw,
          .hub04-particle-breathe,
          .hub04-center-breathe,
          .hub04-main-layer,
          .hub04-main-orb,
          .hub04-main-rim {
            animation: none;
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </div>
  );
}
