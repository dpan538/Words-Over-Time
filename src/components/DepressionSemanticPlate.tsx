"use client";

import { useMemo, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import type {
  DepressionBranchesFile,
  DepressionBranch,
  DepressionEvidenceFile,
  DepressionEvidenceRecord,
  DepressionFrequencyFile,
  DepressionFrequencySeries,
  DepressionPrehistoryFile,
  DepressionPrehistoryRecord,
} from "@/types/depressionData";

type PointerPosition = { x: number; y: number };

type DepressionSemanticPlateProps = {
  frequency: DepressionFrequencyFile;
  prehistory: DepressionPrehistoryFile;
  branches: DepressionBranchesFile;
  evidence: DepressionEvidenceFile;
  activeInspectorId?: string;
  onHover: (inspectorId: string | null, position?: PointerPosition) => void;
  onInspect: (inspectorId: string, position?: PointerPosition) => void;
};

type Phase = {
  id: string;
  number: string;
  label: string;
  years: string;
  startYear: number;
  endYear: number;
  y0: number;
  y1: number;
  note: string;
};

type BranchPlacement = {
  id: string;
  title: string;
  subtitle: string;
  jointYear: number;
  x: number;
  y: number;
  width: number;
  height: number;
  cx: number;
  cy: number;
  innerRadius: number;
  outerRadius: number;
  startAngle: number;
  endAngle: number;
  side: "left" | "right";
  shape: "oval" | "circle" | "capsule" | "block" | "ledger" | "matrix" | "gauge" | "fan";
  labelX: number;
  labelY: number;
  labelAnchor: "start" | "end";
  sampleLimit: number;
  motif: "affect" | "pressure" | "angle" | "basin" | "weather" | "ledger" | "clinical" | "public";
};

type EvidenceSample = {
  id: string;
  label: string;
  count: number;
  priority: number;
  sourceLayer: string;
  evidenceId?: string;
};

type BranchCell = DepressionBranch &
  BranchPlacement & {
    color: string;
    records: DepressionEvidenceRecord[];
    evidenceCount: number;
    layerCounts: Record<string, number>;
    samples: EvidenceSample[];
    jointX: number;
    jointY: number;
    sign: -1 | 1;
  };

type AttestationAnchor = {
  id: string;
  inspectorId: string;
  branchId: string;
  label: string;
  dateLabel: string;
  year: number;
  x: number;
  y: number;
  color: string;
  side: "left" | "right";
};

type MarginNote = {
  id: string;
  x: number;
  y: number;
  width: number;
  title: string;
  kicker: string;
  color: string;
  lines: string[];
};

const WIDTH = 1700;
const HEIGHT = 1780;
const SPINE_X = 850;
const MODULE = 52;

const ink = "#050510";
const paper = "#F5ECD2";
const silver = "#A8A39A";
const orange = "#F06B04";
const ochre = "#FBB728";
const blue = "#2C9FC7";
const deepBlue = "#1570AC";
const wine = "#A1081F";
const rust = "#AE4202";
const green = "#5FCA00";
const deepGreen = "#036C17";

const phases: Phase[] = [
  {
    id: "prehistory",
    number: "01",
    label: "prehistory cloud",
    years: "c.1300-1550",
    startYear: 1300,
    endYear: 1550,
    y0: 190,
    y1: 430,
    note: "older affective and lexical atmosphere",
  },
  {
    id: "split",
    number: "02",
    label: "early split",
    years: "1550-1700",
    startYear: 1550,
    endYear: 1700,
    y0: 430,
    y1: 720,
    note: "lowering, angle, affect begin to separate",
  },
  {
    id: "transition",
    number: "03",
    label: "18c-19c transition",
    years: "1700-1900",
    startYear: 1700,
    endYear: 1900,
    y0: 720,
    y1: 1150,
    note: "place, pressure, weather, economy",
  },
  {
    id: "specialization",
    number: "04",
    label: "20c specialization",
    years: "1900-1980",
    startYear: 1900,
    endYear: 1980,
    y0: 1150,
    y1: 1430,
    note: "clinical institution and economic memory",
  },
  {
    id: "modern",
    number: "05",
    label: "modern fragmentation",
    years: "1980-2026",
    startYear: 1980,
    endYear: 2026,
    y0: 1430,
    y1: 1585,
    note: "public discourse and open snapshots",
  },
];

const branchPlacements: Record<string, BranchPlacement> = {
  melancholy_melancholia: {
    id: "melancholy_melancholia",
    title: "melancholy / melancholia",
    subtitle: "older affective vocabulary",
    jointYear: 1375,
    x: 130,
    y: 304,
    width: 500,
    height: 190,
    cx: 380,
    cy: 399,
    innerRadius: 72,
    outerRadius: 232,
    startAngle: -178,
    endAngle: 8,
    side: "left",
    shape: "oval",
    labelX: 220,
    labelY: 350,
    labelAnchor: "start",
    sampleLimit: 4,
    motif: "affect",
  },
  astronomical: {
    id: "astronomical",
    title: "astronomical angle",
    subtitle: "measured lowering",
    jointYear: 1450,
    x: 1110,
    y: 320,
    width: 310,
    height: 250,
    cx: 1246,
    cy: 444,
    innerRadius: 64,
    outerRadius: 196,
    startAngle: 168,
    endAngle: 382,
    side: "right",
    shape: "gauge",
    labelX: 1496,
    labelY: 352,
    labelAnchor: "end",
    sampleLimit: 3,
    motif: "angle",
  },
  physical: {
    id: "physical",
    title: "lowering / pressure",
    subtitle: "material descent system",
    jointYear: 1610,
    x: 145,
    y: 700,
    width: 510,
    height: 240,
    cx: 400,
    cy: 820,
    innerRadius: 72,
    outerRadius: 250,
    startAngle: -6,
    endAngle: 188,
    side: "left",
    shape: "capsule",
    labelX: 232,
    labelY: 774,
    labelAnchor: "start",
    sampleLimit: 4,
    motif: "pressure",
  },
  emotional: {
    id: "emotional",
    title: "emotional low state",
    subtitle: "dejection and low spirits",
    jointYear: 1550,
    x: 980,
    y: 700,
    width: 610,
    height: 335,
    cx: 1218,
    cy: 935,
    innerRadius: 88,
    outerRadius: 296,
    startAngle: 0,
    endAngle: 180,
    side: "right",
    shape: "fan",
    labelX: 1518,
    labelY: 780,
    labelAnchor: "end",
    sampleLimit: 4,
    motif: "affect",
  },
  geographic: {
    id: "geographic",
    title: "hollow / low area",
    subtitle: "geographic basin",
    jointYear: 1760,
    x: 135,
    y: 1130,
    width: 470,
    height: 240,
    cx: 370,
    cy: 1250,
    innerRadius: 70,
    outerRadius: 220,
    startAngle: 8,
    endAngle: 184,
    side: "left",
    shape: "block",
    labelX: 178,
    labelY: 1172,
    labelAnchor: "start",
    sampleLimit: 4,
    motif: "basin",
  },
  meteorological: {
    id: "meteorological",
    title: "barometric low",
    subtitle: "weather pressure cell",
    jointYear: 1881,
    x: 350,
    y: 1500,
    width: 390,
    height: 210,
    cx: 598,
    cy: 1616,
    innerRadius: 66,
    outerRadius: 224,
    startAngle: 4,
    endAngle: 178,
    side: "left",
    shape: "capsule",
    labelX: 390,
    labelY: 1476,
    labelAnchor: "start",
    sampleLimit: 3,
    motif: "weather",
  },
  economic: {
    id: "economic",
    title: "economic downturn",
    subtitle: "business and crisis naming",
    jointYear: 1826,
    x: 1065,
    y: 1305,
    width: 520,
    height: 260,
    cx: 1298,
    cy: 1435,
    innerRadius: 72,
    outerRadius: 232,
    startAngle: 178,
    endAngle: 356,
    side: "right",
    shape: "ledger",
    labelX: 1500,
    labelY: 1268,
    labelAnchor: "end",
    sampleLimit: 4,
    motif: "ledger",
  },
  clinical: {
    id: "clinical",
    title: "clinical framing",
    subtitle: "diagnostic institution",
    jointYear: 1905,
    x: 1055,
    y: 1870,
    width: 540,
    height: 300,
    cx: 1220,
    cy: 2030,
    innerRadius: 78,
    outerRadius: 280,
    startAngle: 178,
    endAngle: 356,
    side: "right",
    shape: "matrix",
    labelX: 1504,
    labelY: 1832,
    labelAnchor: "end",
    sampleLimit: 4,
    motif: "clinical",
  },
  modern_public_discourse: {
    id: "modern_public_discourse",
    title: "public mental-health discourse",
    subtitle: "open modern snapshot",
    jointYear: 2012,
    x: 950,
    y: 2385,
    width: 610,
    height: 230,
    cx: 1205,
    cy: 2500,
    innerRadius: 86,
    outerRadius: 300,
    startAngle: 188,
    endAngle: 358,
    side: "right",
    shape: "block",
    labelX: 1495,
    labelY: 2345,
    labelAnchor: "end",
    sampleLimit: 3,
    motif: "public",
  },
};

const branchColorFallback: Record<string, string> = {
  physical: blue,
  geographic: green,
  meteorological: deepGreen,
  astronomical: rust,
  emotional: orange,
  melancholy_melancholia: deepBlue,
  clinical: wine,
  economic: ochre,
  modern_public_discourse: ink,
};

const senseBranchToBranch: Record<string, string> = {
  astronomical_angle: "astronomical",
  emotional_low_state: "emotional",
  physical_lowering_pressure: "physical",
  economic_downturn: "economic",
  meteorological_low_pressure: "meteorological",
  clinical_psychiatric_condition: "clinical",
  literary_melancholy_sadness_cluster: "melancholy_melancholia",
};

const mergedBranchEvidence: Record<string, string[]> = {};

export type SemanticRelationRoute = {
  id: string;
  source: string;
  target: string;
  label: string;
  period: string;
  strength: number;
  logic: string;
  caveat: string;
};

export function semanticRelationInspectorId(routeId: string) {
  return `depression-relation-${routeId}`;
}

export const semanticRelationRoutes: SemanticRelationRoute[] = [
  {
    id: "melancholy-to-emotional",
    source: "melancholy_melancholia",
    target: "emotional",
    label: "historical affective neighbor",
    period: "c.1300-1900",
    strength: 0.68,
    logic: "Melancholy and melancholia form an older affective vocabulary around the later emotional branch of depression.",
    caveat: "Neighbor relation, not a one-to-one synonym or diagnosis.",
  },
  {
    id: "lowering-to-emotional",
    source: "physical",
    target: "emotional",
    label: "downward-image transfer",
    period: "1550-1900",
    strength: 0.56,
    logic: "The image of loweredness helps connect material descent with affective low state.",
    caveat: "A semantic pressure line, not proof that one sense directly caused the other.",
  },
  {
    id: "lowering-to-angle",
    source: "physical",
    target: "astronomical",
    label: "measured descent",
    period: "1400-1700",
    strength: 0.48,
    logic: "Technical angle usage shares the lowering / depression structure with material descent.",
    caveat: "Technical sense remains a narrow evidence branch.",
  },
  {
    id: "lowering-to-basin",
    source: "physical",
    target: "geographic",
    label: "surface lowered into basin",
    period: "1700-1900",
    strength: 0.62,
    logic: "Geographic depression treats a surface or landform as a lowered hollow.",
    caveat: "Corpus evidence is partial and branch-tagged editorially.",
  },
  {
    id: "basin-to-weather",
    source: "geographic",
    target: "meteorological",
    label: "low field language",
    period: "1800-1900",
    strength: 0.42,
    logic: "Low-area and low-pressure language share environmental loweredness.",
    caveat: "Shown as conceptual adjacency, not a single historical transition.",
  },
  {
    id: "pressure-to-weather",
    source: "physical",
    target: "meteorological",
    label: "pressure system",
    period: "1800-1900",
    strength: 0.58,
    logic: "Barometric depression intensifies the pressure branch into weather language.",
    caveat: "Weather evidence is narrower than affective and clinical evidence.",
  },
  {
    id: "pressure-to-economic",
    source: "physical",
    target: "economic",
    label: "downturn image",
    period: "1826-1930",
    strength: 0.6,
    logic: "Economic depression uses lowered activity, value, or business as a public crisis branch.",
    caveat: "Frequency around the 1930s can be dominated by the named historical event.",
  },
  {
    id: "emotional-to-clinical",
    source: "emotional",
    target: "clinical",
    label: "medicalization path",
    period: "1905-1980",
    strength: 0.72,
    logic: "Ordinary affective language becomes increasingly institutionalized through clinical labels.",
    caveat: "Clinical depression should not be projected backward onto all earlier low-state uses.",
  },
  {
    id: "economic-to-clinical",
    source: "economic",
    target: "clinical",
    label: "public-word collision",
    period: "1930-1980",
    strength: 0.38,
    logic: "The same word becomes highly visible in economic crisis and clinical naming, creating a modern public ambiguity.",
    caveat: "Collision in public vocabulary, not semantic sameness.",
  },
  {
    id: "clinical-to-public",
    source: "clinical",
    target: "modern_public_discourse",
    label: "diagnosis enters public speech",
    period: "1980-2026",
    strength: 0.74,
    logic: "Clinical labels move into public mental-health discourse and open modern snapshots.",
    caveat: "Modern snapshots are not comparable to the full archival corpus.",
  },
];

function n(value: number, digits = 2) {
  return value.toFixed(digits);
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function pointer(event: ReactMouseEvent<SVGElement>) {
  return { x: event.clientX, y: event.clientY };
}

function branchInspectorId(branchId: string) {
  return `depression-branch-${branchId}`;
}

function frequencyInspectorId(seriesId: string) {
  return `depression-frequency-${seriesId}`;
}

function attestationInspectorId(recordId: string) {
  return `depression-attestation-${recordId}`;
}

function cleanTerm(term: string) {
  return term.replaceAll("\"", "").replace(/\s+/g, " ").trim();
}

function truncate(label: string, max = 28) {
  return label.length > max ? `${label.slice(0, max - 3)}...` : label;
}

function splitLabel(label: string, maxLength = 23) {
  const words = label.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxLength && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }

  if (current) lines.push(current);
  return lines;
}

function polar(cx: number, cy: number, radius: number, angleDegrees: number) {
  const angle = (angleDegrees * Math.PI) / 180;
  return {
    x: cx + Math.cos(angle) * radius,
    y: cy + Math.sin(angle) * radius,
  };
}

function arcPath(cx: number, cy: number, radius: number, startAngle: number, endAngle: number) {
  const start = polar(cx, cy, radius, startAngle);
  const end = polar(cx, cy, radius, endAngle);
  const largeArc = Math.abs(endAngle - startAngle) > 180 ? 1 : 0;
  return `M ${n(start.x)} ${n(start.y)} A ${n(radius)} ${n(radius)} 0 ${largeArc} 1 ${n(end.x)} ${n(end.y)}`;
}

function sectorPath(cx: number, cy: number, innerRadius: number, outerRadius: number, startAngle: number, endAngle: number) {
  const outerStart = polar(cx, cy, outerRadius, startAngle);
  const outerEnd = polar(cx, cy, outerRadius, endAngle);
  const innerEnd = polar(cx, cy, innerRadius, endAngle);
  const innerStart = polar(cx, cy, innerRadius, startAngle);
  const largeArc = Math.abs(endAngle - startAngle) > 180 ? 1 : 0;
  return [
    `M ${n(outerStart.x)} ${n(outerStart.y)}`,
    `A ${n(outerRadius)} ${n(outerRadius)} 0 ${largeArc} 1 ${n(outerEnd.x)} ${n(outerEnd.y)}`,
    `L ${n(innerEnd.x)} ${n(innerEnd.y)}`,
    `A ${n(innerRadius)} ${n(innerRadius)} 0 ${largeArc} 0 ${n(innerStart.x)} ${n(innerStart.y)}`,
    "Z",
  ].join(" ");
}

function roundedRectPath(x: number, y: number, width: number, height: number, radius: number) {
  const r = clamp(radius, 0, Math.min(width, height) / 2);
  return [
    `M ${n(x + r)} ${n(y)}`,
    `H ${n(x + width - r)}`,
    `Q ${n(x + width)} ${n(y)} ${n(x + width)} ${n(y + r)}`,
    `V ${n(y + height - r)}`,
    `Q ${n(x + width)} ${n(y + height)} ${n(x + width - r)} ${n(y + height)}`,
    `H ${n(x + r)}`,
    `Q ${n(x)} ${n(y + height)} ${n(x)} ${n(y + height - r)}`,
    `V ${n(y + r)}`,
    `Q ${n(x)} ${n(y)} ${n(x + r)} ${n(y)}`,
    "Z",
  ].join(" ");
}

function ellipsePath(cx: number, cy: number, rx: number, ry: number) {
  return [
    `M ${n(cx - rx)} ${n(cy)}`,
    `A ${n(rx)} ${n(ry)} 0 1 0 ${n(cx + rx)} ${n(cy)}`,
    `A ${n(rx)} ${n(ry)} 0 1 0 ${n(cx - rx)} ${n(cy)}`,
    "Z",
  ].join(" ");
}

function isFan(branch: BranchCell) {
  return branch.shape === "fan";
}

function chamberPath(branch: BranchCell) {
  if (branch.shape === "oval") {
    return ellipsePath(branch.x + branch.width / 2, branch.y + branch.height / 2, branch.width / 2, branch.height / 2);
  }
  if (branch.shape === "circle" || branch.shape === "gauge") {
    const r = Math.min(branch.width, branch.height) / 2;
    return ellipsePath(branch.x + branch.width / 2, branch.y + branch.height / 2, r, r);
  }
  if (branch.shape === "capsule") return roundedRectPath(branch.x, branch.y, branch.width, branch.height, branch.height / 2);
  if (branch.shape === "ledger") return roundedRectPath(branch.x, branch.y, branch.width, branch.height, 16);
  if (branch.shape === "matrix") return roundedRectPath(branch.x, branch.y, branch.width, branch.height, 22);
  return roundedRectPath(branch.x, branch.y, branch.width, branch.height, 34);
}

function visualPath(branch: BranchCell) {
  if (isFan(branch)) {
    return sectorPath(branch.cx, branch.cy, branch.innerRadius, branch.outerRadius, branch.startAngle, branch.endAngle);
  }

  return chamberPath(branch);
}

function visualCenter(branch: BranchCell) {
  if (isFan(branch)) return { x: branch.cx, y: branch.cy };
  return { x: branch.x + branch.width / 2, y: branch.y + branch.height / 2 };
}

function yForYear(year: number) {
  const phase =
    phases.find((item) => year >= item.startYear && year <= item.endYear) ??
    (year < phases[0].startYear ? phases[0] : phases[phases.length - 1]);
  const progress = clamp((year - phase.startYear) / Math.max(1, phase.endYear - phase.startYear), 0, 1);
  return phase.y0 + progress * (phase.y1 - phase.y0);
}

function spineXForYear(year: number) {
  if (year < 1550) return SPINE_X - 12;
  if (year < 1700) return SPINE_X + 22;
  if (year < 1900) return SPINE_X - 16;
  if (year < 1980) return SPINE_X + 20;
  return SPINE_X;
}

function averageFrequency(series: DepressionFrequencySeries | undefined, startYear: number, endYear: number) {
  if (!series) return 0;
  const points = series.points.filter((point) => point.year >= startYear && point.year <= endYear);
  if (!points.length) return 0;
  return points.reduce((sum, point) => sum + point.frequencyPerMillion, 0) / points.length;
}

function maxFrequency(series: DepressionFrequencySeries | undefined) {
  if (!series) return 0.0001;
  return Math.max(...series.points.map((point) => point.frequencyPerMillion), 0.0001);
}

function phaseFrequencyWidth(series: DepressionFrequencySeries | undefined, phase: Phase) {
  const max = maxFrequency(series);
  const avg = averageFrequency(series, phase.startYear, phase.endYear);
  const normalized = Math.sqrt(avg) / Math.sqrt(max);
  return clamp(30 + normalized * 110 + (phase.startYear >= 1900 ? 22 : 0), 34, 164);
}

function sampleTerms(records: DepressionEvidenceRecord[], branch: DepressionBranch, maxSamples: number) {
  const byTerm = new Map<string, EvidenceSample>();

  for (const record of records) {
    const label = cleanTerm(record.term);
    if (!label || label.toLowerCase() === "depression") continue;
    const key = label.toLowerCase();
    const existing = byTerm.get(key);
    if (existing) {
      existing.count += 1;
      if (record.displayPriority > existing.priority) {
        existing.priority = record.displayPriority;
        existing.evidenceId = record.id;
        existing.sourceLayer = record.sourceLayer;
      }
    } else {
      byTerm.set(key, {
        id: key,
        label,
        count: 1,
        priority: record.displayPriority,
        sourceLayer: record.sourceLayer,
        evidenceId: record.id,
      });
    }
  }

  for (const term of branch.supportingTerms.slice(0, 5)) {
    const label = cleanTerm(term);
    const key = label.toLowerCase();
    if (!label || label.toLowerCase() === "depression" || byTerm.has(key)) continue;
    byTerm.set(key, {
      id: key,
      label,
      count: 0,
      priority: 50,
      sourceLayer: "curated",
    });
  }

  return [...byTerm.values()]
    .sort((a, b) => b.priority - a.priority || b.count - a.count || a.label.localeCompare(b.label))
    .slice(0, maxSamples);
}

function countLayers(records: DepressionEvidenceRecord[]) {
  return records.reduce<Record<string, number>>((acc, record) => {
    acc[record.sourceLayer] = (acc[record.sourceLayer] ?? 0) + 1;
    return acc;
  }, {});
}

function layerShort(layer: string) {
  return layer
    .replace("archival_context", "archive")
    .replace("modern_snapshot", "modern")
    .replace("clinical_bibliography", "pubmed")
    .replace("clinical_vocabulary", "mesh")
    .replace("economic_context", "economic")
    .replace("attestation", "attest");
}

function marginNoteHeight(note: MarginNote) {
  return 82 + note.lines.length * 29;
}

function branchPort(branch: BranchCell) {
  if (!isFan(branch)) {
    return {
      x: branch.side === "left" ? branch.x + branch.width : branch.x,
      y: branch.y + branch.height / 2,
    };
  }

  const angle = branch.side === "left" ? 0 : 180;
  return polar(branch.cx, branch.cy, branch.outerRadius, angle);
}

function branchRoute(branch: BranchCell) {
  const port = branchPort(branch);
  const sx = branch.jointX + branch.sign * 18;
  const sy = branch.jointY;
  const dx = branch.sign * 150;
  return `M ${n(sx)} ${n(sy)} C ${n(sx + dx)} ${n(sy)} ${n(port.x - dx * 0.72)} ${n(port.y)} ${n(port.x)} ${n(port.y)}`;
}

function relationLanePath(source: BranchCell, target: BranchCell, index: number) {
  const sameSide = source.side === target.side;
  const sideSign = sameSide ? source.sign : index % 2 === 0 ? -1 : 1;
  const laneX = SPINE_X + sideSign * (76 + (index % 4) * 22);
  const startX = source.jointX + source.sign * 20;
  const endX = target.jointX + target.sign * 20;
  const startY = source.jointY;
  const endY = target.jointY;
  const tension = 36 + (index % 3) * 12;
  return `M ${n(startX)} ${n(startY)} C ${n(laneX)} ${n(startY + tension)} ${n(laneX)} ${n(endY - tension)} ${n(endX)} ${n(endY)}`;
}

function spineModules(series: DepressionFrequencySeries | undefined) {
  return phases.map((phase) => {
    const width = phaseFrequencyWidth(series, phase);
    const x = spineXForYear((phase.startYear + phase.endYear) / 2) - width / 2;
    const y = phase.y0 + 22;
    const height = phase.y1 - phase.y0 - 44;
    return { ...phase, x, y, width, height };
  });
}

function frequencyStrips(series: DepressionFrequencySeries | undefined) {
  if (!series) return [];
  const max = maxFrequency(series);
  return Array.from({ length: 56 }, (_, index) => {
    const year = 1500 + index * 10;
    const value = averageFrequency(series, year, year + 5);
    const normalized = Math.sqrt(value) / Math.sqrt(max);
    const y = yForYear(year);
    const centerX = spineXForYear(year);
    const width = clamp(10 + normalized * 94, 10, 104);
    return {
      year,
      y,
      x: centerX - width / 2,
      width,
      opacity: clamp(0.08 + normalized * 0.42, 0.08, 0.5),
    };
  }).filter((strip) => strip.year <= 2022);
}

function fanBands(branch: BranchCell) {
  const entries = Object.entries(branch.layerCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const max = Math.max(...entries.map(([, count]) => count), 1);
  const span = branch.endAngle - branch.startAngle;
  return entries.map(([layer, count], index) => {
    const radius = branch.innerRadius + 32 + index * 24;
    const end = branch.startAngle + span * clamp(0.22 + (count / max) * 0.72, 0.28, 0.94);
    return {
      layer,
      count,
      radius,
      width: index === 0 ? 12 : 8,
      path: arcPath(branch.cx, branch.cy, radius, branch.startAngle + 11, end - 8),
      endPoint: polar(branch.cx, branch.cy, radius, end - 8),
    };
  });
}

function fanDots(branch: BranchCell) {
  const count = Math.min(108, Math.max(20, Math.round(Math.sqrt(branch.evidenceCount + 1) * 6.2)));
  const angleSlots = branch.outerRadius > 330 ? 22 : branch.outerRadius > 280 ? 18 : 14;
  const ringStep = branch.outerRadius > 330 ? 14 : 15;
  const start = branch.startAngle + 22;
  const end = branch.endAngle - 22;
  const span = Math.max(18, end - start);
  return Array.from({ length: count }, (_, index) => {
    const col = index % angleSlots;
    const row = Math.floor(index / angleSlots);
    const angle = start + (col / Math.max(1, angleSlots - 1)) * span;
    const radius = branch.innerRadius + 70 + row * ringStep;
    const point = polar(branch.cx, branch.cy, Math.min(radius, branch.outerRadius - 24), angle);
    return { ...point, index, r: branch.outerRadius > 330 ? 2.7 : 2.9 };
  });
}

function chamberDots(branch: BranchCell) {
  const count = Math.min(34, Math.max(8, Math.round(Math.sqrt(branch.evidenceCount + 1) * 2.8)));
  const cols = branch.shape === "matrix" ? 12 : branch.shape === "ledger" ? 11 : 10;
  const gap = branch.shape === "matrix" ? 15 : 14;
  const dotOrigins: Record<string, { x: number; y: number }> = {
    melancholy_melancholia: { x: 0.34, y: 0.52 },
    physical: { x: 0.48, y: 0.42 },
    geographic: { x: 0.28, y: 0.58 },
    meteorological: { x: 0.42, y: 0.5 },
    economic: { x: 0.22, y: 0.42 },
    clinical: { x: 0.22, y: 0.44 },
    modern_public_discourse: { x: 0.2, y: 0.44 },
  };
  const origin = dotOrigins[branch.id] ?? { x: 0.19, y: 0.48 };
  const startX = branch.x + branch.width * origin.x;
  const startY = branch.y + branch.height * origin.y;
  return Array.from({ length: count }, (_, index) => ({
    x: startX + (index % cols) * gap,
    y: startY + Math.floor(index / cols) * gap,
    r: branch.shape === "matrix" ? 2.6 : 3,
    index,
  }));
}

function chamberBars(branch: BranchCell) {
  const entries = Object.entries(branch.layerCounts).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const max = Math.max(...entries.map(([, count]) => count), 1);
  return entries.map(([layer, count], index) => {
    const barOrigins: Record<string, { x: number; y: number }> = {
      physical: { x: 0.18, y: 0.7 },
      geographic: { x: 0.22, y: 0.72 },
      meteorological: { x: 0.32, y: 0.68 },
      economic: { x: 0.24, y: 0.66 },
      clinical: { x: 0.2, y: 0.7 },
      modern_public_discourse: { x: 0.2, y: 0.66 },
    };
    const origin = barOrigins[branch.id] ?? { x: 0.18, y: 0.7 };
    const x = branch.x + branch.width * origin.x;
    const y = branch.y + branch.height * origin.y + index * 15;
    return {
      layer,
      x,
      y,
      width: clamp((count / max) * branch.width * 0.24 + 28, 36, branch.width * 0.3),
    };
  });
}

function fanRibs(branch: BranchCell) {
  const count = branch.outerRadius > 330 ? 16 : 12;
  return Array.from({ length: count }, (_, index) => {
    const angle = branch.startAngle + ((index + 1) / (count + 1)) * (branch.endAngle - branch.startAngle);
    const inner = polar(branch.cx, branch.cy, branch.innerRadius + 8, angle);
    const outer = polar(branch.cx, branch.cy, branch.outerRadius - 8, angle);
    return { index, inner, outer };
  });
}

function sampleRail(branch: BranchCell, index: number) {
  const spacing = 21;
  const railOverrides: Record<string, { textX: number; textY: number; anchor: "start" | "end"; lineDirection: -1 | 1 }> = {
    melancholy_melancholia: { textX: 158, textY: 505, anchor: "start", lineDirection: 1 },
    physical: { textX: 174, textY: 910, anchor: "start", lineDirection: 1 },
    emotional: { textX: 1510, textY: 1076, anchor: "end", lineDirection: -1 },
    geographic: { textX: 166, textY: 1425, anchor: "start", lineDirection: 1 },
    meteorological: { textX: 388, textY: 1686, anchor: "start", lineDirection: 1 },
    astronomical: { textX: 1490, textY: 602, anchor: "end", lineDirection: -1 },
    economic: { textX: 1512, textY: 1600, anchor: "end", lineDirection: -1 },
    clinical: { textX: 1510, textY: 2202, anchor: "end", lineDirection: -1 },
    modern_public_discourse: { textX: 1490, textY: 2630, anchor: "end", lineDirection: -1 },
  };

  const override = railOverrides[branch.id];
  if (override) {
    const textY = override.textY + index * spacing;
    const lineLength = branch.id === "astronomical" || branch.id === "economic" ? 136 : 150;
    return {
      textX: override.textX,
      textY,
      lineX1: override.lineDirection === 1 ? override.textX + 24 : override.textX - lineLength,
      lineX2: override.lineDirection === 1 ? override.textX + lineLength : override.textX - 26,
      textAnchor: override.anchor,
    };
  }

  if (!isFan(branch)) {
    const textY = branch.y + branch.height + 26 + index * spacing;
    if (branch.side === "right") {
      const textX = branch.x + branch.width - 28;
      return {
        textX,
        textY,
        lineX1: textX - 176,
        lineX2: textX - 34,
        textAnchor: "end" as const,
      };
    }

    const textX = branch.x + 28;
    return {
      textX,
      textY,
      lineX1: textX + 30,
      lineX2: textX + 174,
      textAnchor: "start" as const,
    };
  }

  const lineY = branch.labelY + 88 + index * spacing;
  if (branch.labelAnchor === "end") {
    const textX = branch.cx + branch.outerRadius + 18;
    return {
      textX,
      textY: lineY,
      lineX1: branch.cx + branch.outerRadius - 72,
      lineX2: textX - 16,
      textAnchor: "start" as const,
    };
  }

  return {
    textX: branch.labelX,
    textY: lineY,
    lineX1: branch.labelX + 26,
    lineX2: branch.labelX + 174,
    textAnchor: "start" as const,
  };
}

function motifNode(branch: BranchCell) {
  if (!isFan(branch)) {
    return {
      x: branch.x + 58,
      y: branch.y + 62,
    };
  }

  const anchorAngle = branch.side === "left" ? 180 : 0;
  const point = polar(branch.cx, branch.cy, branch.innerRadius + 24, anchorAngle);
  return { x: point.x, y: point.y };
}

function attestationAnchors(records: DepressionPrehistoryRecord[], evidenceRecords: DepressionEvidenceRecord[], branches: BranchCell[]) {
  const branchById = new Map(branches.map((branch) => [branch.id, branch]));
  const candidates: AttestationAnchor[] = [];

  for (const record of records) {
    const branchId = senseBranchToBranch[record.senseBranch] ?? "clinical";
    const branch = branchById.get(branchId);
    if (!branch) continue;
    candidates.push({
      id: record.id,
      inspectorId: attestationInspectorId(record.id),
      branchId,
      label: truncate(record.normalizedForm || record.form, 18),
      dateLabel: record.dateLabel,
      year: record.yearApproximation,
      x: spineXForYear(record.yearApproximation) + branch.sign * 42,
      y: yForYear(record.yearApproximation),
      color: branch.color,
      side: branch.side,
    });
  }

  for (const record of evidenceRecords.filter((item) => item.sourceLayer === "attestation" && typeof item.year === "number")) {
    const branch = branchById.get(record.branchTag);
    if (!branch || record.year === null) continue;
    candidates.push({
      id: record.id,
      inspectorId: record.id,
      branchId: record.branchTag,
      label: truncate(cleanTerm(record.term), 18),
      dateLabel: String(record.year),
      year: record.year,
      x: spineXForYear(record.year) + branch.sign * 42,
      y: yForYear(record.year),
      color: branch.color,
      side: branch.side,
    });
  }

  const byPhase = new Map<string, AttestationAnchor[]>();
  for (const candidate of candidates.sort((a, b) => a.year - b.year)) {
    const phase = phases.find((item) => candidate.year >= item.startYear && candidate.year <= item.endYear)?.id ?? phases[phases.length - 1].id;
    const list = byPhase.get(phase) ?? [];
    if (list.length < 3 && !list.some((item) => item.branchId === candidate.branchId && item.dateLabel === candidate.dateLabel)) {
      list.push(candidate);
      byPhase.set(phase, list);
    }
  }

  return [...byPhase.values()].flatMap((list) =>
    list.map((item, index) => ({
      ...item,
      y: item.y + (index - (list.length - 1) / 2) * 18,
    })),
  );
}

function branchGlyph(branch: BranchCell) {
  const node = motifNode(branch);
  const color = branch.color;

  if (branch.motif === "angle") {
    return (
      <g opacity="0.76" fill="none" stroke={color}>
        <circle cx={n(node.x)} cy={n(node.y)} r="34" strokeWidth="3" />
        {Array.from({ length: 9 }, (_, index) => {
          const angle = branch.startAngle + 28 + index * 15;
          const inner = polar(node.x, node.y, 18, angle);
          const outer = polar(node.x, node.y, 58, angle);
          return <line key={`${branch.id}-glyph-${index}`} x1={n(inner.x)} y1={n(inner.y)} x2={n(outer.x)} y2={n(outer.y)} strokeWidth="1.4" strokeOpacity="0.45" />;
        })}
      </g>
    );
  }

  if (branch.motif === "clinical") {
    return (
      <g opacity="0.78" stroke={color} strokeWidth="4" strokeLinecap="square">
        <circle cx={n(node.x)} cy={n(node.y)} r="31" fill="none" />
        <line x1={n(node.x - 21)} x2={n(node.x + 21)} y1={n(node.y)} y2={n(node.y)} />
        <line x1={n(node.x)} x2={n(node.x)} y1={n(node.y - 21)} y2={n(node.y + 21)} />
      </g>
    );
  }

  if (branch.motif === "weather") {
    return (
      <g opacity="0.75" fill="none" stroke={color} strokeWidth="3">
        <circle cx={n(node.x)} cy={n(node.y)} r="13" />
        <circle cx={n(node.x)} cy={n(node.y)} r="27" strokeOpacity="0.58" />
        <circle cx={n(node.x)} cy={n(node.y)} r="41" strokeOpacity="0.34" />
      </g>
    );
  }

  return (
    <g opacity="0.78">
      <circle cx={n(node.x)} cy={n(node.y)} r="30" fill={paper} stroke={color} strokeWidth="4" />
      <circle cx={n(node.x)} cy={n(node.y)} r="8" fill={ink} />
    </g>
  );
}

export function DepressionSemanticPlate({
  frequency,
  prehistory,
  branches,
  evidence,
  activeInspectorId,
  onHover,
  onInspect,
}: DepressionSemanticPlateProps) {
  const [localActiveId, setLocalActiveId] = useState<string | null>(null);
  const activeId = activeInspectorId ?? localActiveId;
  const mainSeries = frequency.series.find((series) => series.id === "depression") ?? frequency.series[0];

  const branchCells = useMemo<BranchCell[]>(() => {
    return branches.branches
      .map((branch) => {
        const placement = branchPlacements[branch.id];
        if (!placement) return null;
        const mergedIds = mergedBranchEvidence[branch.id] ?? [branch.id];
        const records = evidence.evidence.filter((record) => mergedIds.includes(record.branchTag));
        const sign = placement.side === "left" ? -1 : 1;
        return {
          ...branch,
          ...placement,
          color: branch.color || branchColorFallback[branch.id] || ink,
          records,
          evidenceCount: records.length,
          layerCounts: countLayers(records),
          samples: sampleTerms(records, branch, placement.sampleLimit),
          jointX: spineXForYear(placement.jointYear),
          jointY: yForYear(placement.jointYear),
          sign,
        };
      })
      .filter((branch): branch is BranchCell => Boolean(branch));
  }, [branches.branches, evidence.evidence]);

  const anchors = attestationAnchors(prehistory.records, evidence.evidence, branchCells);
  const activeBranchId = activeId?.startsWith("depression-branch-")
    ? activeId.replace("depression-branch-", "")
    : evidence.evidence.find((record) => record.id === activeId)?.branchTag ??
      anchors.find((anchor) => anchor.inspectorId === activeId)?.branchId ??
      null;
  const hasFocus = Boolean(activeId);

  const rowYOverrides: Record<string, number> = {
    melancholy_melancholia: 316,
    astronomical: 330,
    emotional: 566,
    physical: 570,
    geographic: 868,
    economic: 950,
    meteorological: 1024,
    clinical: 1242,
    modern_public_discourse: 1510,
  };

  const branchTextLayouts: Record<
    string,
    {
      titleX?: number;
      titleYOffset?: number;
      subtitleYOffset?: number;
      recordsYOffset?: number;
      sampleStartYOffset?: number;
      sampleStep?: number;
      ruleWidth?: number;
      connectorYOffset?: number;
      connectorInset?: number;
    }
  > = {
    melancholy_melancholia: {
      titleX: 250,
      titleYOffset: -10,
      subtitleYOffset: 38,
      recordsYOffset: 66,
      sampleStartYOffset: 104,
      sampleStep: 24,
      ruleWidth: 270,
      connectorYOffset: -24,
      connectorInset: 40,
    },
    physical: {
      titleX: 260,
      titleYOffset: -10,
      subtitleYOffset: 38,
      recordsYOffset: 66,
      sampleStartYOffset: 100,
      sampleStep: 24,
      ruleWidth: 245,
      connectorYOffset: -18,
      connectorInset: 38,
    },
    geographic: {
      titleX: 250,
      titleYOffset: -10,
      subtitleYOffset: 38,
      recordsYOffset: 66,
      sampleStartYOffset: 105,
      sampleStep: 24,
      ruleWidth: 225,
      connectorYOffset: -18,
      connectorInset: 38,
    },
    meteorological: {
      titleX: 250,
      titleYOffset: -8,
      subtitleYOffset: 36,
      recordsYOffset: 64,
      sampleStartYOffset: 100,
      sampleStep: 24,
      ruleWidth: 218,
      connectorYOffset: -18,
      connectorInset: 38,
    },
    astronomical: {
      titleX: 1030,
      titleYOffset: -8,
      subtitleYOffset: 36,
      recordsYOffset: 62,
      sampleStartYOffset: 96,
      sampleStep: 24,
      ruleWidth: 220,
      connectorYOffset: -18,
      connectorInset: 42,
    },
    emotional: {
      titleX: 1060,
      titleYOffset: -14,
      subtitleYOffset: 42,
      recordsYOffset: 70,
      sampleStartYOffset: 110,
      sampleStep: 25,
      ruleWidth: 340,
      connectorYOffset: -24,
      connectorInset: 44,
    },
    economic: {
      titleX: 1065,
      titleYOffset: -12,
      subtitleYOffset: 40,
      recordsYOffset: 68,
      sampleStartYOffset: 108,
      sampleStep: 25,
      ruleWidth: 300,
      connectorYOffset: -22,
      connectorInset: 44,
    },
    clinical: {
      titleX: 1065,
      titleYOffset: -12,
      subtitleYOffset: 42,
      recordsYOffset: 72,
      sampleStartYOffset: 112,
      sampleStep: 26,
      ruleWidth: 280,
      connectorYOffset: -24,
      connectorInset: 46,
    },
    modern_public_discourse: {
      titleX: 1015,
      titleYOffset: -12,
      subtitleYOffset: 42,
      recordsYOffset: 72,
      sampleStartYOffset: 112,
      sampleStep: 26,
      ruleWidth: 410,
      connectorYOffset: -22,
      connectorInset: 46,
    },
  };

  const anchorLabelLayouts: Record<string, { x: number; y: number; anchor: "start" | "end" }> = {
    "melancholy_melancholia-1300": { x: SPINE_X - 132, y: yForYear(1300) - 26, anchor: "end" },
    "astronomical-1400": { x: SPINE_X + 120, y: yForYear(1400) - 34, anchor: "start" },
    "emotional-1425": { x: SPINE_X + 120, y: yForYear(1425) + 18, anchor: "start" },
    "melancholy_melancholia-1553": { x: SPINE_X - 128, y: yForYear(1553) - 24, anchor: "end" },
    "physical-1655": { x: SPINE_X - 136, y: yForYear(1655) + 24, anchor: "end" },
    "economic-1826": { x: SPINE_X - 136, y: yForYear(1826) - 24, anchor: "end" },
    "meteorological-1881": { x: SPINE_X - 166, y: yForYear(1881) - 32, anchor: "end" },
    "clinical-1905": { x: SPINE_X - 160, y: yForYear(1905) + 48, anchor: "end" },
    "economic-1930": { x: SPINE_X + 122, y: yForYear(1930) - 44, anchor: "start" },
  };

  const branchRows = [...branchCells]
    .map((branch) => ({
      branch,
      y: rowYOverrides[branch.id] ?? yForYear(branch.jointYear),
    }))
    .sort((a, b) => a.y - b.y);

  const keyAnchors = anchors
    .filter((anchor, index, list) => list.findIndex((item) => item.branchId === anchor.branchId && item.year === anchor.year) === index)
    .slice(0, 8);

  const handleLeave = () => {
    setLocalActiveId(null);
    onHover(null);
  };

  const handleHover = (inspectorId: string, event: ReactMouseEvent<SVGElement>) => {
    setLocalActiveId(inspectorId);
    onHover(inspectorId, pointer(event));
  };

  const handleInspect = (inspectorId: string, event: ReactMouseEvent<SVGElement>) => {
    event.stopPropagation();
    onInspect(inspectorId, pointer(event));
  };

  return (
    <div className="relative overflow-hidden bg-wheat py-2">
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="h-auto min-w-[1080px] w-full"
          role="img"
          aria-label="Historical semantic number line for depression"
          onMouseLeave={handleLeave}
        >
          <defs>
            <pattern id="depression-plate-grid" width={MODULE} height={MODULE} patternUnits="userSpaceOnUse">
              <path d={`M ${MODULE} 0 L 0 0 0 ${MODULE}`} fill="none" stroke={ink} strokeOpacity="0.035" strokeWidth="1" />
            </pattern>
          </defs>

          <rect width={WIDTH} height={HEIGHT} fill={paper} />
          <rect width={WIDTH} height={HEIGHT} fill="url(#depression-plate-grid)" />

          <g opacity="0.86">
            {phases.map((phase) => (
              <g key={phase.id}>
                <line x1="96" x2={n(WIDTH - 96)} y1={n(phase.y0)} y2={n(phase.y0)} stroke={ink} strokeOpacity="0.18" strokeWidth="1.1" />
                <text x="112" y={n(phase.y0 + 34)} fill={ink} opacity="0.78" fontFamily="monospace" fontSize="16" fontWeight="900" letterSpacing="1.8">
                  {phase.number} / {phase.label}
                </text>
                <text x="112" y={n(phase.y0 + 60)} fill={deepBlue} opacity="0.86" fontFamily="monospace" fontSize="14" fontWeight="900" letterSpacing="0.9">
                  {phase.years}
                </text>
                <text x="112" y={n(phase.y0 + 84)} fill={ink} opacity="0.56" fontFamily="monospace" fontSize="13" fontWeight="900" letterSpacing="0.3">
                  {phase.note}
                </text>
              </g>
            ))}
          </g>

          <g opacity="0.96">
            <text x="96" y="72" fill={deepBlue} fontFamily="monospace" fontSize="16" fontWeight="900" letterSpacing="3">
              CHART 01 / SEMANTIC NUMBER LINE
            </text>
            <text x="96" y="116" fill={ink} fontFamily="Helvetica Neue, Helvetica, Arial, sans-serif" fontSize="38" fontWeight="900">
              Depression as a historical semantic axis
            </text>
            <text x="98" y="150" fill={ink} opacity="0.58" fontFamily="Helvetica Neue, Helvetica, Arial, sans-serif" fontSize="18" fontWeight="800">
              a reduced timeline of attestation, sense branching, frequency, and evidence support
            </text>
            <text x={n(WIDTH - 96)} y="82" textAnchor="end" fill={ink} opacity="0.5" fontFamily="monospace" fontSize="15" fontWeight="900" letterSpacing="1.4">
              axis / dates / branches / evidence
            </text>
            <text x={n(WIDTH - 96)} y="108" textAnchor="end" fill={ink} opacity="0.42" fontFamily="monospace" fontSize="14" fontWeight="900" letterSpacing="0.8">
              visual marks reduced to source support
            </text>
          </g>

          <g
            className="cursor-crosshair"
            opacity={hasFocus && activeId !== frequencyInspectorId(mainSeries?.id ?? "depression") ? 0.64 : 1}
            onMouseEnter={(event) => mainSeries && handleHover(frequencyInspectorId(mainSeries.id), event)}
            onMouseMove={(event) => mainSeries && onHover(frequencyInspectorId(mainSeries.id), pointer(event))}
            onClick={(event) => mainSeries && handleInspect(frequencyInspectorId(mainSeries.id), event)}
          >
            <line x1={n(SPINE_X)} x2={n(SPINE_X)} y1={n(yForYear(1300))} y2={n(yForYear(2026))} stroke={ink} strokeOpacity="0.82" strokeWidth="3.2" />
            {[1300, 1400, 1550, 1700, 1826, 1881, 1900, 1930, 1980, 2012, 2026].map((year) => {
              const y = yForYear(year);
              return (
                <g key={`year-${year}`}>
                  <line x1={n(SPINE_X - 34)} x2={n(SPINE_X + 34)} y1={n(y)} y2={n(y)} stroke={ink} strokeOpacity="0.76" strokeWidth={year === 1300 || year === 2026 ? "3" : "1.7"} />
                  <text x={n(SPINE_X - 50)} y={n(y + 6)} textAnchor="end" fill={ink} opacity="0.66" fontFamily="monospace" fontSize="16" fontWeight="900" letterSpacing="0.9">
                    {year}
                  </text>
                </g>
              );
            })}
          </g>

          <g>
            {branchRows.map(({ branch, y }) => {
              const inspectorId = branchInspectorId(branch.id);
              const active = activeBranchId === branch.id || activeId === inspectorId;
              const dimmed = Boolean(hasFocus && activeBranchId && activeBranchId !== branch.id);
              const layout = branchTextLayouts[branch.id] ?? {};
              const titleX = layout.titleX ?? (branch.side === "left" ? 280 : 1030);
              const isMinorBranch = branch.id === "astronomical";
              const isCompactBranch = isMinorBranch || branch.id === "meteorological";
              const samples = branch.samples.slice(0, isCompactBranch ? 1 : branch.id === "modern_public_discourse" ? 2 : 2);
              const layers = Object.entries(branch.layerCounts).sort((a, b) => b[1] - a[1]).slice(0, 3);
              const sourceLine = layers.map(([layer]) => layerShort(layer)).join(" / ") || "curated";
              const titleY = y + (layout.titleYOffset ?? (isCompactBranch ? -6 : -12));
              const subtitleY = y + (layout.subtitleYOffset ?? (isCompactBranch ? 24 : 26));
              const recordsY = y + (layout.recordsYOffset ?? (isCompactBranch ? 47 : 50));
              const sampleStartY = y + (layout.sampleStartYOffset ?? (isCompactBranch ? 68 : 78));
              const sampleStep = layout.sampleStep ?? 22;
              const branchSign = branch.side === "left" ? -1 : 1;
              const connectorEnd =
                SPINE_X + branchSign * (branch.id === "melancholy_melancholia" ? 230 : branch.id === "meteorological" ? 150 : 180);
              const connectorY = branch.jointY + clamp((titleY - branch.jointY) * 0.32, -48, 48);
              const titleRuleY = titleY + 15;
              const titleRuleWidth = layout.ruleWidth ?? (isMinorBranch ? 150 : branch.side === "left" ? 220 : 245);

              return (
                <g
                  key={branch.id}
                  className="cursor-crosshair"
                  opacity={dimmed ? 0.58 : 1}
                  onMouseEnter={(event) => handleHover(inspectorId, event)}
                  onMouseMove={(event) => onHover(inspectorId, pointer(event))}
                  onClick={(event) => handleInspect(inspectorId, event)}
                >
                  <line
                    x1={n(SPINE_X)}
                    x2={n(connectorEnd)}
                    y1={n(branch.jointY)}
                    y2={n(connectorY)}
                    stroke={branch.color}
                    strokeOpacity={active ? 0.74 : 0.24}
                    strokeWidth={active ? "2.4" : "1.2"}
                    strokeLinecap="round"
                  />
                  <circle cx={n(SPINE_X)} cy={n(branch.jointY)} r={active ? "10" : "7"} fill={paper} stroke={branch.color} strokeWidth={active ? "3.2" : "2.2"} />
                  <circle cx={n(SPINE_X)} cy={n(branch.jointY)} r="2.6" fill={ink} />
                  <line
                    x1={n(titleX)}
                    x2={n(titleX + titleRuleWidth)}
                    y1={n(titleRuleY)}
                    y2={n(titleRuleY)}
                    stroke={branch.color}
                    strokeOpacity={active ? 0.62 : 0.22}
                    strokeWidth={active ? "2.4" : "1.5"}
                  />

                  <text
                    x={n(titleX)}
                    y={n(titleY)}
                    fill={ink}
                    fontFamily="Helvetica Neue, Helvetica, Arial, sans-serif"
                    fontSize={isCompactBranch ? "20" : "24"}
                    fontWeight="900"
                    paintOrder="stroke"
                    stroke={paper}
                    strokeWidth="5"
                    strokeLinejoin="round"
                  >
                    {branch.title}
                  </text>
                  <text
                    x={n(titleX)}
                    y={n(subtitleY)}
                    fill={branch.color}
                    fontFamily="monospace"
                    fontSize={isCompactBranch ? "13" : "14"}
                    fontWeight="900"
                    letterSpacing="0.9"
                    paintOrder="stroke"
                    stroke={paper}
                    strokeWidth="4"
                    strokeLinejoin="round"
                  >
                    {branch.subtitle}
                  </text>
                  <text
                    x={n(titleX)}
                    y={n(recordsY)}
                    fill={ink}
                    opacity="0.68"
                    fontFamily="monospace"
                    fontSize={isCompactBranch ? "13" : "15"}
                    fontWeight="900"
                    letterSpacing="0.9"
                    paintOrder="stroke"
                    stroke={paper}
                    strokeWidth="4"
                    strokeLinejoin="round"
                  >
                    records {branch.evidenceCount} / {sourceLine}
                  </text>

                  {samples.map((sample, index) => {
                    const sampleId = sample.evidenceId ?? inspectorId;
                    const activeSample = active || activeId === sampleId;
                    const sampleX = titleX;
                    const sampleY = sampleStartY + index * sampleStep;
                    return (
                      <g
                        key={`${branch.id}-sample-${sample.id}`}
                        opacity={hasFocus && !activeSample ? 0.62 : 0.96}
                        onMouseEnter={(event) => handleHover(sampleId, event)}
                        onMouseMove={(event) => onHover(sampleId, pointer(event))}
                        onClick={(event) => handleInspect(sampleId, event)}
                      >
                        <line
                          x1={n(sampleX)}
                          x2={n(sampleX + 126)}
                          y1={n(sampleY + 7)}
                          y2={n(sampleY + 7)}
                          stroke={branch.color}
                          strokeOpacity={index === 0 ? 0.28 : 0.16}
                          strokeWidth={index === 0 ? "1.6" : "1"}
                          strokeLinecap="round"
                        />
                        <text
                          x={n(sampleX)}
                          y={n(sampleY)}
                          fill={index === 0 ? branch.color : ink}
                          fontFamily="monospace"
                          fontSize="14"
                          fontWeight="900"
                          letterSpacing="0.45"
                          paintOrder="stroke"
                          stroke={paper}
                          strokeWidth="4"
                          strokeLinejoin="round"
                        >
                          {truncate(sample.label, 30)}
                          {sample.count > 1 ? ` x${sample.count}` : ""}
                        </text>
                      </g>
                    );
                  })}
                </g>
              );
            })}
          </g>

          <g>
            {keyAnchors.map((anchor, index) => {
              const active = activeBranchId === anchor.branchId || activeId === anchor.inspectorId;
              const dimmed = Boolean(hasFocus && activeBranchId && activeBranchId !== anchor.branchId);
              const layout = anchorLabelLayouts[`${anchor.branchId}-${anchor.year}`] ?? {
                x: index % 2 === 0 ? SPINE_X - 124 : SPINE_X + 124,
                y: anchor.y - 8,
                anchor: index % 2 === 0 ? ("end" as const) : ("start" as const),
              };
              return (
                <g
                  key={anchor.id}
                  className="cursor-crosshair"
                  opacity={dimmed ? 0.62 : 1}
                  onMouseEnter={(event) => handleHover(anchor.inspectorId, event)}
                  onMouseMove={(event) => onHover(anchor.inspectorId, pointer(event))}
                  onClick={(event) => handleInspect(anchor.inspectorId, event)}
                >
                  <line x1={n(SPINE_X - 10)} x2={n(SPINE_X + 10)} y1={n(anchor.y)} y2={n(anchor.y)} stroke={anchor.color} strokeOpacity="0.7" strokeWidth="1.6" />
                  <text
                    x={n(layout.x)}
                    y={n(layout.y)}
                    textAnchor={layout.anchor}
                    fill={ink}
                    fontFamily="monospace"
                    fontSize="12"
                    fontWeight="900"
                    letterSpacing="0.4"
                    paintOrder="stroke"
                    stroke={paper}
                    strokeWidth="4"
                    strokeLinejoin="round"
                  >
                    {anchor.dateLabel} / {truncate(anchor.label, 18)}
                  </text>
                </g>
              );
            })}
          </g>

          <g opacity="0.86">
            <rect x="96" y={n(HEIGHT - 116)} width={n(WIDTH - 192)} height="1.4" fill={ink} opacity="0.58" />
            {[
              ["axis", "historical number line", ink],
              ["colored rows", "semantic branch support", orange],
              ["small labels", "selected attestations only", silver],
            ].map(([label, description, color], index) => (
              <g key={label} transform={`translate(${n(150 + index * 460)} ${n(HEIGHT - 82)})`}>
                <rect x="-8" y="-15" width="16" height="16" rx="2" fill={color} stroke={ink} strokeWidth="1.1" />
                <text x="18" y="0" fill={ink} fontFamily="Helvetica Neue, Helvetica, Arial, sans-serif" fontSize="16" fontWeight="900">
                  {label}
                </text>
                <text x="18" y="25" fill={ink} opacity="0.52" fontFamily="monospace" fontSize="15" fontWeight="900" letterSpacing="0.6">
                  {description}
                </text>
              </g>
            ))}
          </g>
        </svg>
      </div>
    </div>
  );
}
