"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from "react";
import relationsJson from "@/data/generated/depression_semantic_machine_relations.json";
import type {
  DepressionSemanticMachineRelations,
  MachineNodeKey,
  MachineRelation,
  MachineRelationType,
} from "@/types/depressionSemanticMachine";

type PointerPosition = { x: number; y: number };

export type PhaseId = "1900_1945" | "1945_1980" | "1980_2005" | "2005_2026";

export type GearNode = {
  id: MachineNodeKey;
  label: string;
  shortLabel: string;
  system: "internal" | "external" | "translator" | "center";
  subsystem: "lexical_clinical" | "measurement" | "lived_care" | "discourse_social" | "hinge";
  x: number;
  y: number;
  radius: number;
  teeth: number;
  weight: number;
  phaseEmphasis: Record<PhaseId, number>;
  texture: "dots" | "bars" | "strips" | "ticks";
  role: string;
  caveat?: string;
  color: string;
};

export type GearConnector = {
  id: string;
  source: MachineNodeKey;
  target: MachineNodeKey;
  strength: number;
  variant: "solid" | "dashed" | "thin";
  label?: string;
  logic: string;
  relationId?: string;
};

export type OutputNode = {
  id: string;
  label: string;
  strength: number;
  relatedGears: MachineNodeKey[];
};

type DepressionSemanticMachineProps = {
  activeInspectorId?: string;
  onHover: (inspectorId: string | null, position?: PointerPosition) => void;
  onInspect: (inspectorId: string, position?: PointerPosition) => void;
};

type ActiveState =
  | { kind: "gear"; id: MachineNodeKey }
  | { kind: "relation"; id: string }
  | { kind: "connector"; id: string }
  | { kind: "output"; id: string }
  | null;

type HighlightState = {
  gears: Set<MachineNodeKey>;
  relations: Set<string>;
  connectors: Set<string>;
  outputs: Set<string>;
};

type RelationCentroid = {
  source: { x: number; y: number };
  target: { x: number; y: number };
  all: { x: number; y: number };
};

const WIDTH = 1700;
const HEIGHT = 2080;

const ink = "#050510";
const paper = "#F5ECD2";
const labelPaper = "#FFF6D8";
const rose = "#9C2031";
const orange = "#F06B04";
const blue = "#1570AC";
const paleBlue = "#2C9FC7";
const charcoal = "#403E3B";
const warmGray = "#766C75";
const teal = "#0B7F73";
const green = "#036C17";
const violetGray = "#6E6476";
const ochre = "#D99A14";
const silver = "#A8A39A";

const subsystemFrames: [string, number, number, number, number, string, GearNode["subsystem"]][] = [
  ["lexical-clinical translation", 118, 198, 590, 545, rose, "lexical_clinical"],
  ["measurement + population recording", 118, 760, 810, 765, blue, "measurement"],
  ["discourse / awareness / social response", 980, 198, 602, 506, violetGray, "discourse_social"],
  ["lived recognition + care access", 970, 730, 612, 795, teal, "lived_care"],
];

const relationData = relationsJson as DepressionSemanticMachineRelations;
export const machineRelations = relationData.relations;
export const machineEvidenceRegistry = relationData.evidence_registry;

export const machinePhases: { id: PhaseId; label: string; note: string }[] = [
  { id: "1900_1945", label: "1900-1945", note: "early clinical naming" },
  { id: "1945_1980", label: "1945-1980", note: "institutional consolidation" },
  { id: "1980_2005", label: "1980-2005", note: "diagnostic/public expansion" },
  { id: "2005_2026", label: "2005-2026", note: "digital and public discourse" },
];

export const machineGearNodes: GearNode[] = [
  {
    id: "clinical_vocabulary_mesh_indexing",
    label: "controlled vocabulary / MeSH indexing",
    shortLabel: "controlled vocabulary",
    system: "translator",
    subsystem: "lexical_clinical",
    x: 420,
    y: 340,
    radius: 74,
    teeth: 18,
    weight: 0.76,
    phaseEmphasis: { "1900_1945": 0.24, "1945_1980": 0.56, "1980_2005": 0.94, "2005_2026": 0.86 },
    texture: "ticks",
    role: "Indexes depression terms across affective vocabulary, diagnostic names, entry terms, and biomedical retrieval.",
    color: rose,
  },
  {
    id: "clinical_psychiatry",
    label: "clinical psychiatry",
    shortLabel: "clinical psychiatry",
    system: "internal",
    subsystem: "lexical_clinical",
    x: 235,
    y: 565,
    radius: 94,
    teeth: 22,
    weight: 0.86,
    phaseEmphasis: { "1900_1945": 0.46, "1945_1980": 0.7, "1980_2005": 0.94, "2005_2026": 0.84 },
    texture: "ticks",
    role: "Stabilizes professional language, diagnostic practice, and care pathways.",
    color: rose,
  },
  {
    id: "diagnosis",
    label: "diagnostic thresholding",
    shortLabel: "diagnostic gate",
    system: "translator",
    subsystem: "lexical_clinical",
    x: 540,
    y: 575,
    radius: 92,
    teeth: 20,
    weight: 0.88,
    phaseEmphasis: { "1900_1945": 0.3, "1945_1980": 0.64, "1980_2005": 1, "2005_2026": 0.88 },
    texture: "bars",
    role: "Turns symptom clusters and impairment into a named clinical and institutional category.",
    color: rose,
  },
  {
    id: "depression",
    label: "depression",
    shortLabel: "depression",
    system: "center",
    subsystem: "hinge",
    x: 830,
    y: 760,
    radius: 132,
    teeth: 28,
    weight: 1,
    phaseEmphasis: { "1900_1945": 0.52, "1945_1980": 0.72, "1980_2005": 0.95, "2005_2026": 1 },
    texture: "dots",
    role: "A semantic hinge: important, but not the only collector or motion source.",
    caveat: "Motion travels only through explicit relation groups, not globally through this node.",
    color: ink,
  },
  {
    id: "symptoms",
    label: "symptoms",
    shortLabel: "symptoms",
    system: "translator",
    subsystem: "measurement",
    x: 420,
    y: 880,
    radius: 84,
    teeth: 18,
    weight: 0.82,
    phaseEmphasis: { "1900_1945": 0.28, "1945_1980": 0.58, "1980_2005": 0.88, "2005_2026": 0.92 },
    texture: "dots",
    role: "Portable descriptions of mood, interest, sleep, concentration, behavior, and distress.",
    color: orange,
  },
  {
    id: "psychology_behavior",
    label: "psychology / behavior",
    shortLabel: "psychology / behavior",
    system: "internal",
    subsystem: "lived_care",
    x: 245,
    y: 1045,
    radius: 86,
    teeth: 20,
    weight: 0.78,
    phaseEmphasis: { "1900_1945": 0.26, "1945_1980": 0.66, "1980_2005": 0.9, "2005_2026": 0.82 },
    texture: "bars",
    role: "Frames depression as cognition, behavior, routines, functioning, and measurable change.",
    color: orange,
  },
  {
    id: "phq9_screening",
    label: "PHQ-9 / symptom scoring",
    shortLabel: "symptom scoring",
    system: "translator",
    subsystem: "measurement",
    x: 590,
    y: 1135,
    radius: 74,
    teeth: 18,
    weight: 0.78,
    phaseEmphasis: { "1900_1945": 0.05, "1945_1980": 0.28, "1980_2005": 0.84, "2005_2026": 0.98 },
    texture: "ticks",
    role: "Translates symptoms into scored survey and screening items.",
    color: blue,
  },
  {
    id: "functional_difficulty",
    label: "functional difficulty",
    shortLabel: "functional difficulty",
    system: "translator",
    subsystem: "measurement",
    x: 815,
    y: 1220,
    radius: 72,
    teeth: 16,
    weight: 0.74,
    phaseEmphasis: { "1900_1945": 0.12, "1945_1980": 0.38, "1980_2005": 0.82, "2005_2026": 0.96 },
    texture: "bars",
    role: "Links symptom burden to impairment in work, home, relationships, and care intensity.",
    color: paleBlue,
  },
  {
    id: "public_health_records",
    label: "public health records",
    shortLabel: "population record",
    system: "internal",
    subsystem: "measurement",
    x: 435,
    y: 1335,
    radius: 86,
    teeth: 18,
    weight: 0.76,
    phaseEmphasis: { "1900_1945": 0.1, "1945_1980": 0.46, "1980_2005": 0.8, "2005_2026": 0.98 },
    texture: "strips",
    role: "Aggregates screening, records, prevalence, trends, and subgroup reporting.",
    color: blue,
  },
  {
    id: "prevalence",
    label: "prevalence",
    shortLabel: "prevalence",
    system: "translator",
    subsystem: "measurement",
    x: 690,
    y: 1440,
    radius: 68,
    teeth: 16,
    weight: 0.7,
    phaseEmphasis: { "1900_1945": 0.08, "1945_1980": 0.38, "1980_2005": 0.78, "2005_2026": 0.98 },
    texture: "strips",
    role: "Makes depression legible as a population statistic and public reporting object.",
    color: blue,
  },
  {
    id: "media_public_discourse",
    label: "media / public discourse",
    shortLabel: "media circulation",
    system: "external",
    subsystem: "discourse_social",
    x: 1295,
    y: 345,
    radius: 92,
    teeth: 18,
    weight: 0.78,
    phaseEmphasis: { "1900_1945": 0.12, "1945_1980": 0.4, "1980_2005": 0.76, "2005_2026": 1 },
    texture: "strips",
    role: "Circulates phrases, warnings, stereotypes, campaigns, testimony, and public scripts.",
    color: charcoal,
  },
  {
    id: "mental_health_awareness",
    label: "mental health awareness",
    shortLabel: "awareness",
    system: "translator",
    subsystem: "discourse_social",
    x: 1075,
    y: 560,
    radius: 72,
    teeth: 16,
    weight: 0.76,
    phaseEmphasis: { "1900_1945": 0.1, "1945_1980": 0.42, "1980_2005": 0.78, "2005_2026": 1 },
    texture: "dots",
    role: "Bridges public language, literacy, self-recognition, support, and help-seeking.",
    color: paleBlue,
  },
  {
    id: "stigma",
    label: "stigma",
    shortLabel: "stigma drag",
    system: "translator",
    subsystem: "discourse_social",
    x: 1460,
    y: 610,
    radius: 74,
    teeth: 16,
    weight: 0.82,
    phaseEmphasis: { "1900_1945": 0.18, "1945_1980": 0.5, "1980_2005": 0.82, "2005_2026": 0.96 },
    texture: "dots",
    role: "Acts as resistance around disclosure, self-description, and help-seeking.",
    color: violetGray,
  },
  {
    id: "self_description",
    label: "self-description",
    shortLabel: "self-description",
    system: "external",
    subsystem: "lived_care",
    x: 1255,
    y: 835,
    radius: 82,
    teeth: 18,
    weight: 0.84,
    phaseEmphasis: { "1900_1945": 0.2, "1945_1980": 0.46, "1980_2005": 0.78, "2005_2026": 1 },
    texture: "dots",
    role: "Lets people decide whether experience is stress, sadness, burnout, illness, or depression.",
    color: warmGray,
  },
  {
    id: "disclosure_secrecy",
    label: "disclosure / secrecy",
    shortLabel: "disclosure valve",
    system: "translator",
    subsystem: "lived_care",
    x: 1470,
    y: 960,
    radius: 64,
    teeth: 14,
    weight: 0.66,
    phaseEmphasis: { "1900_1945": 0.1, "1945_1980": 0.36, "1980_2005": 0.74, "2005_2026": 0.96 },
    texture: "ticks",
    role: "Conditions whether support and care pathways can be accessed or remain blocked.",
    color: warmGray,
  },
  {
    id: "help_seeking",
    label: "help-seeking",
    shortLabel: "help-seeking path",
    system: "external",
    subsystem: "lived_care",
    x: 1325,
    y: 1195,
    radius: 82,
    teeth: 18,
    weight: 0.82,
    phaseEmphasis: { "1900_1945": 0.12, "1945_1980": 0.46, "1980_2005": 0.78, "2005_2026": 0.96 },
    texture: "bars",
    role: "Moves from recognition and intention toward informal support, therapy, services, or other care.",
    color: teal,
  },
  {
    id: "treatment_medication",
    label: "treatment / medication",
    shortLabel: "medication path",
    system: "external",
    subsystem: "lived_care",
    x: 1035,
    y: 1215,
    radius: 76,
    teeth: 18,
    weight: 0.76,
    phaseEmphasis: { "1900_1945": 0.24, "1945_1980": 0.58, "1980_2005": 0.92, "2005_2026": 0.9 },
    texture: "bars",
    role: "One care route activated by clinical recognition, impairment, access, and institutional response.",
    color: green,
  },
  {
    id: "therapy_counseling",
    label: "therapy / counseling",
    shortLabel: "therapy path",
    system: "external",
    subsystem: "lived_care",
    x: 1115,
    y: 1430,
    radius: 72,
    teeth: 16,
    weight: 0.74,
    phaseEmphasis: { "1900_1945": 0.14, "1945_1980": 0.54, "1980_2005": 0.9, "2005_2026": 0.94 },
    texture: "ticks",
    role: "A parallel care route where meaning, disclosure, symptoms, and access meet practice.",
    color: green,
  },
  {
    id: "policy_social_response",
    label: "policy / social response",
    shortLabel: "social response",
    system: "external",
    subsystem: "discourse_social",
    x: 1460,
    y: 1395,
    radius: 80,
    teeth: 18,
    weight: 0.78,
    phaseEmphasis: { "1900_1945": 0.12, "1945_1980": 0.42, "1980_2005": 0.78, "2005_2026": 0.96 },
    texture: "strips",
    role: "Public programmes, support systems, policy, workplaces, schools, and civic response.",
    color: teal,
  },
];

export const machineOutputNodes: OutputNode[] = [
  {
    id: "diagnostic_recording",
    label: "diagnostic recording",
    strength: 0.9,
    relatedGears: ["clinical_vocabulary_mesh_indexing", "diagnosis", "public_health_records"],
  },
  {
    id: "screening_prevalence",
    label: "screening / prevalence",
    strength: 0.92,
    relatedGears: ["symptoms", "phq9_screening", "functional_difficulty", "prevalence"],
  },
  {
    id: "recognition_access",
    label: "recognition / access",
    strength: 0.86,
    relatedGears: ["self_description", "disclosure_secrecy", "help_seeking", "therapy_counseling"],
  },
  {
    id: "stigma_drag",
    label: "stigma drag",
    strength: 0.82,
    relatedGears: ["stigma", "help_seeking", "disclosure_secrecy", "self_description"],
  },
  {
    id: "policy_recirculation",
    label: "policy / discourse loop",
    strength: 0.78,
    relatedGears: ["policy_social_response", "media_public_discourse", "mental_health_awareness", "public_health_records"],
  },
];

export const machineConnectors: GearConnector[] = machineRelations.flatMap((relation) => {
  const variant = relation.type === "feedback_loop" ? "dashed" : relation.type === "many_to_many" ? "thin" : "solid";
  return relation.source_nodes.flatMap((source) =>
    relation.target_nodes.map((target) => ({
      id: `${relation.id}__${source}__${target}`,
      source,
      target,
      strength: relation.strength_score,
      variant,
      label: relationLabel(relation),
      logic: relation.short_explanation,
      relationId: relation.id,
    })),
  );
});

export function machineGearInspectorId(id: MachineNodeKey) {
  return `depression-machine-gear-${id}`;
}

export function machineConnectorInspectorId(id: string) {
  return `depression-machine-connector-${id}`;
}

export function machineRelationInspectorId(id: string) {
  return `depression-machine-relation-${id}`;
}

export function machineOutputInspectorId(id: string) {
  return `depression-machine-output-${id}`;
}

function n(value: number, digits = 2) {
  return Number(value.toFixed(digits));
}

function relationLabel(relation: MachineRelation) {
  const labels: Record<MachineRelationType, string> = {
    one_to_one: "bridge",
    one_to_many: "fan-out",
    many_to_one: "collector",
    many_to_many: "coupling",
    feedback_loop: "feedback",
  };
  return labels[relation.type];
}

function degreesToRadians(angle: number) {
  return (angle - 90) * (Math.PI / 180);
}

function polarPoint(cx: number, cy: number, radius: number, angle: number) {
  const radians = degreesToRadians(angle);
  return {
    x: cx + radius * Math.cos(radians),
    y: cy + radius * Math.sin(radians),
  };
}

function gearPath(cx: number, cy: number, radius: number, teeth: number, toothDepth: number): string {
  const points: string[] = [];
  const step = 360 / teeth;
  for (let index = 0; index < teeth; index += 1) {
    const angle = index * step;
    [
      { angle: angle - step * 0.48, radius },
      { angle: angle - step * 0.24, radius: radius + toothDepth },
      { angle: angle + step * 0.24, radius: radius + toothDepth },
      { angle: angle + step * 0.48, radius },
    ].forEach((anchor) => {
      const point = polarPoint(cx, cy, anchor.radius, anchor.angle);
      points.push(`${n(point.x)},${n(point.y)}`);
    });
  }
  return `M ${points.join(" L ")} Z`;
}

function phaseArcPath(cx: number, cy: number, innerRadius: number, outerRadius: number, startAngle: number, endAngle: number) {
  const outerStart = polarPoint(cx, cy, outerRadius, startAngle);
  const outerEnd = polarPoint(cx, cy, outerRadius, endAngle);
  const innerEnd = polarPoint(cx, cy, innerRadius, endAngle);
  const innerStart = polarPoint(cx, cy, innerRadius, startAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return [
    `M ${n(outerStart.x)} ${n(outerStart.y)}`,
    `A ${n(outerRadius)} ${n(outerRadius)} 0 ${largeArc} 1 ${n(outerEnd.x)} ${n(outerEnd.y)}`,
    `L ${n(innerEnd.x)} ${n(innerEnd.y)}`,
    `A ${n(innerRadius)} ${n(innerRadius)} 0 ${largeArc} 0 ${n(innerStart.x)} ${n(innerStart.y)}`,
    "Z",
  ].join(" ");
}

function connectorPath(source: GearNode, target: GearNode, bendFactor = 0.12) {
  const dx = target.x - source.x;
  const dy = target.y - source.y;
  const distance = Math.max(Math.hypot(dx, dy), 1);
  const sourceR = source.radius + 22;
  const targetR = target.radius + 22;
  const start = { x: source.x + (dx / distance) * sourceR, y: source.y + (dy / distance) * sourceR };
  const end = { x: target.x - (dx / distance) * targetR, y: target.y - (dy / distance) * targetR };
  const mid = { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 };
  const bend = Math.min(72, Math.max(18, distance * bendFactor));
  const sign = source.y < target.y ? 1 : -1;
  const control = {
    x: mid.x - (dy / distance) * bend * sign,
    y: mid.y + (dx / distance) * bend * sign,
  };
  return `M ${n(start.x)} ${n(start.y)} Q ${n(control.x)} ${n(control.y)} ${n(end.x)} ${n(end.y)}`;
}

function splitLabel(label: string, max = 16) {
  const words = label.split(" ");
  const lines: string[] = [];
  let current = "";
  words.forEach((word) => {
    const next = current ? `${current} ${word}` : word;
    if (next.length > max && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  });
  if (current) lines.push(current);
  return lines.slice(0, 4);
}

function pointer(event: { clientX: number; clientY: number }): PointerPosition {
  return { x: event.clientX, y: event.clientY };
}

function pointerAngle(event: ReactPointerEvent<SVGGElement>, node: GearNode) {
  const svg = event.currentTarget.ownerSVGElement;
  const rect = svg?.getBoundingClientRect();
  if (!rect) return 0;
  const svgX = ((event.clientX - rect.left) / rect.width) * WIDTH;
  const svgY = ((event.clientY - rect.top) / rect.height) * HEIGHT;
  return (Math.atan2(svgY - node.y, svgX - node.x) * 180) / Math.PI;
}

function activeFromInspectorId(inspectorId?: string): ActiveState {
  if (!inspectorId) return null;
  if (inspectorId.startsWith("depression-machine-gear-")) {
    return { kind: "gear", id: inspectorId.replace("depression-machine-gear-", "") as MachineNodeKey };
  }
  if (inspectorId.startsWith("depression-machine-relation-")) {
    return { kind: "relation", id: inspectorId.replace("depression-machine-relation-", "") };
  }
  if (inspectorId.startsWith("depression-machine-connector-")) {
    return { kind: "connector", id: inspectorId.replace("depression-machine-connector-", "") };
  }
  if (inspectorId.startsWith("depression-machine-output-")) {
    return { kind: "output", id: inspectorId.replace("depression-machine-output-", "") };
  }
  return null;
}

function buildHighlights(active: ActiveState): HighlightState {
  const gears = new Set<MachineNodeKey>();
  const relations = new Set<string>();
  const connectors = new Set<string>();
  const outputs = new Set<string>();

  if (!active) return { gears, relations, connectors, outputs };

  if (active.kind === "gear") {
    gears.add(active.id);
    machineRelations.forEach((relation) => {
      if (relation.source_nodes.includes(active.id) || relation.target_nodes.includes(active.id)) {
        relations.add(relation.id);
        relation.source_nodes.forEach((id) => gears.add(id));
        relation.target_nodes.forEach((id) => gears.add(id));
      }
    });
    machineOutputNodes.forEach((output) => {
      if (output.relatedGears.includes(active.id)) outputs.add(output.id);
    });
  }

  if (active.kind === "relation") {
    const relation = machineRelations.find((item) => item.id === active.id);
    if (relation) {
      relations.add(relation.id);
      relation.source_nodes.forEach((id) => gears.add(id));
      relation.target_nodes.forEach((id) => gears.add(id));
    }
  }

  if (active.kind === "connector") {
    const connector = machineConnectors.find((item) => item.id === active.id);
    if (connector) {
      connectors.add(connector.id);
      if (connector.relationId) relations.add(connector.relationId);
      gears.add(connector.source);
      gears.add(connector.target);
    }
  }

  if (active.kind === "output") {
    const output = machineOutputNodes.find((item) => item.id === active.id);
    if (output) {
      outputs.add(output.id);
      output.relatedGears.forEach((id) => gears.add(id));
      machineRelations.forEach((relation) => {
        const connected = [...relation.source_nodes, ...relation.target_nodes].some((id) => output.relatedGears.includes(id));
        if (connected) relations.add(relation.id);
      });
    }
  }

  machineConnectors.forEach((connector) => {
    if (connector.relationId && relations.has(connector.relationId)) connectors.add(connector.id);
  });

  return { gears, relations, connectors, outputs };
}

function relationCentroid(relation: MachineRelation, gearById: Map<MachineNodeKey, GearNode>): RelationCentroid {
  const sourceNodes = relation.source_nodes.map((id) => gearById.get(id)).filter((node): node is GearNode => Boolean(node));
  const targetNodes = relation.target_nodes.map((id) => gearById.get(id)).filter((node): node is GearNode => Boolean(node));
  const average = (nodes: GearNode[]) => ({
    x: nodes.reduce((sum, node) => sum + node.x, 0) / Math.max(nodes.length, 1),
    y: nodes.reduce((sum, node) => sum + node.y, 0) / Math.max(nodes.length, 1),
  });
  const allNodes = [...sourceNodes, ...targetNodes];
  return { source: average(sourceNodes), target: average(targetNodes), all: average(allNodes) };
}

function relationColor(relation: MachineRelation) {
  if (relation.type === "one_to_one") return ink;
  if (relation.type === "one_to_many") return orange;
  if (relation.type === "many_to_one") return rose;
  if (relation.type === "many_to_many") return paleBlue;
  return teal;
}

function relationDash(relation: MachineRelation) {
  if (relation.type === "feedback_loop") return "13 13";
  if (relation.type === "many_to_many") return "4 14";
  if (relation.type === "many_to_one") return "2 9";
  return undefined;
}

function renderDotTexture(node: GearNode, active: boolean) {
  const count = Math.round(10 + node.weight * 18);
  const maxRadius = node.radius * 0.48;
  return Array.from({ length: count }, (_, index) => {
    const angle = index * 137.5;
    const radius = maxRadius * Math.sqrt((index + 0.5) / count);
    const point = polarPoint(node.x, node.y, radius, angle);
    return <circle key={`${node.id}-dot-${index}`} cx={n(point.x)} cy={n(point.y)} r="3.1" fill={node.color} fillOpacity={active ? 0.58 : 0.34} />;
  });
}

function renderBarTexture(node: GearNode, active: boolean) {
  const rows = node.radius < 70 ? 4 : 6;
  const rowGap = node.radius * 0.13;
  return Array.from({ length: rows }, (_, index) => {
    const y = node.y - ((rows - 1) * rowGap) / 2 + index * rowGap;
    const width = node.radius * (0.48 + ((index * 17 + node.teeth) % 31) / 70);
    return <rect key={`${node.id}-bar-${index}`} x={n(node.x - width / 2)} y={n(y - 3)} width={n(width)} height="7" rx="1" fill={node.color} fillOpacity={active ? 0.64 : 0.38} />;
  });
}

function renderStripTexture(node: GearNode, active: boolean) {
  const strips = node.radius < 70 ? 5 : 7;
  const gap = node.radius * 0.15;
  const height = node.radius * 0.72;
  return Array.from({ length: strips }, (_, index) => {
    const x = node.x - ((strips - 1) * gap) / 2 + index * gap;
    const stripHeight = height * (0.42 + ((index * 19 + node.teeth) % 37) / 90);
    return <rect key={`${node.id}-strip-${index}`} x={n(x - 3)} y={n(node.y - stripHeight / 2)} width="7" height={n(stripHeight)} rx="1" fill={node.color} fillOpacity={active ? 0.58 : 0.34} />;
  });
}

function renderTickTexture(node: GearNode, active: boolean) {
  const ticks = node.radius < 70 ? 13 : 20;
  const inner = node.radius * 0.32;
  const outer = node.radius * 0.58;
  return Array.from({ length: ticks }, (_, index) => {
    const angle = (360 / ticks) * index;
    const start = polarPoint(node.x, node.y, inner, angle);
    const end = polarPoint(node.x, node.y, outer + (index % 4) * 3, angle);
    return <line key={`${node.id}-tick-${index}`} x1={n(start.x)} y1={n(start.y)} x2={n(end.x)} y2={n(end.y)} stroke={node.color} strokeOpacity={active ? 0.62 : 0.36} strokeWidth="1.6" />;
  });
}

function renderTexture(node: GearNode, active: boolean) {
  if (node.texture === "dots") return renderDotTexture(node, active);
  if (node.texture === "bars") return renderBarTexture(node, active);
  if (node.texture === "strips") return renderStripTexture(node, active);
  return renderTickTexture(node, active);
}

function relationForceFromNode(relation: MachineRelation, sourceId: MachineNodeKey, delta: number) {
  const updates = new Map<MachineNodeKey, number>();
  const sourceSide = relation.source_nodes.includes(sourceId);
  const targetSide = relation.target_nodes.includes(sourceId);
  const score = relation.strength_score;
  const add = (id: MachineNodeKey, value: number) => updates.set(id, (updates.get(id) ?? 0) + value);

  if (!sourceSide && !targetSide) return updates;

  if (relation.type === "one_to_one") {
    const targets = sourceSide ? relation.target_nodes : relation.source_nodes;
    targets.forEach((id) => add(id, -delta * score * 0.86));
    return updates;
  }

  if (relation.type === "one_to_many") {
    if (sourceSide) {
      const normalized = 0.78 / Math.max(relation.target_nodes.length, 1);
      relation.target_nodes.forEach((id, index) => add(id, delta * score * (normalized + index * 0.035)));
    }
    if (targetSide) {
      relation.source_nodes.forEach((id) => add(id, delta * score * 0.38));
    }
    return updates;
  }

  if (relation.type === "many_to_one") {
    if (sourceSide) {
      relation.target_nodes.forEach((id) => add(id, delta * score * 0.42));
      relation.source_nodes.filter((id) => id !== sourceId).forEach((id) => add(id, delta * score * 0.18));
    }
    if (targetSide) {
      relation.source_nodes.forEach((id) => add(id, -delta * score * 0.54));
    }
    return updates;
  }

  if (relation.type === "many_to_many") {
    const targets = sourceSide ? relation.target_nodes : relation.source_nodes;
    const sameSide = sourceSide ? relation.source_nodes : relation.target_nodes;
    targets.forEach((id) => add(id, delta * score * 0.46));
    sameSide.filter((id) => id !== sourceId).forEach((id) => add(id, delta * score * 0.22));
    return updates;
  }

  const targets = sourceSide ? relation.target_nodes : relation.source_nodes;
  targets.forEach((id) => add(id, delta * score * 0.28));
  return updates;
}

function computePropagatedRotations(sourceId: MachineNodeKey, delta: number, base: Record<string, number>) {
  const updates: Record<string, number> = { [sourceId]: (base[sourceId] ?? 0) + delta };
  const direct = new Map<MachineNodeKey, number>();

  machineRelations.forEach((relation) => {
    relationForceFromNode(relation, sourceId, delta).forEach((value, id) => {
      const adjusted = relation.id === "rel_stigma_helpseeking_drag" && sourceId === "stigma" ? value * -0.42 : value;
      direct.set(id, (direct.get(id) ?? 0) + adjusted);
    });
  });

  direct.forEach((value, id) => {
    updates[id] = (base[id] ?? 0) + value;
  });

  direct.forEach((value, id) => {
    machineRelations.forEach((relation) => {
      if (relation.source_nodes.includes(id) || relation.target_nodes.includes(id)) {
        relationForceFromNode(relation, id, value * 0.34).forEach((secondValue, secondId) => {
          if (secondId === sourceId || direct.has(secondId)) return;
          updates[secondId] = (base[secondId] ?? 0) + secondValue;
        });
      }
    });
  });

  return updates;
}

function activeInfo(active: ActiveState) {
  if (!active) return null;
  if (active.kind === "gear") {
    const node = machineGearNodes.find((gear) => gear.id === active.id);
    if (!node) return null;
    return {
      label: node.shortLabel,
      type: `${node.subsystem.replaceAll("_", " ")} / ${node.system} node`,
      role: node.role,
      detail: node.caveat ?? "semantic transmission node",
    };
  }
  if (active.kind === "relation") {
    const relation = machineRelations.find((item) => item.id === active.id);
    if (!relation) return null;
    return {
      label: relationLabel(relation),
      type: `${relation.type.replaceAll("_", " ")} / curated transmission path`,
      role: relation.short_explanation,
      detail: relation.evidence_refs.join(" / "),
    };
  }
  if (active.kind === "output") {
    const output = machineOutputNodes.find((item) => item.id === active.id);
    if (!output) return null;
    return {
      label: output.label,
      type: "machine output / social effect",
      role: "A social or institutional output produced by explicit relation groups, not a global center broadcast.",
      detail: output.relatedGears.map((gear) => gear.replaceAll("_", " ")).join(" / "),
    };
  }
  const connector = machineConnectors.find((item) => item.id === active.id);
  if (!connector) return null;
  return {
    label: connector.label ?? "relation connector",
    type: "connector / curated transmission path",
    role: connector.logic,
    detail: connector.relationId ?? "flat connector",
  };
}

export function DepressionSemanticMachine({ activeInspectorId, onHover, onInspect }: DepressionSemanticMachineProps) {
  const [localActiveId, setLocalActiveId] = useState<string | null>(null);
  const [gearRotations, setGearRotations] = useState<Record<string, number>>({});
  const [draggingGearId, setDraggingGearId] = useState<MachineNodeKey | null>(null);
  const [scrollRotation, setScrollRotation] = useState(0);
  const [introHint, setIntroHint] = useState(true);
  const [pulsingFeedbackIds, setPulsingFeedbackIds] = useState<Set<string>>(() => new Set());
  const gearById = useMemo(() => new Map(machineGearNodes.map((gear) => [gear.id, gear])), []);
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const gearDragRef = useRef({
    active: false,
    moved: false,
    id: "" as MachineNodeKey | "",
    startAngle: 0,
    startRotations: {} as Record<string, number>,
    lastDelta: 0,
  });
  const suppressClickRef = useRef(false);
  const activeId = activeInspectorId ?? localActiveId ?? undefined;
  const active = activeFromInspectorId(activeId);
  const hasFocus = Boolean(active);
  const highlights = useMemo(() => buildHighlights(active), [active]);
  const info = activeInfo(active) ?? {
    label: "turn a relation node",
    type: "relation-driven motion",
    role: "Drag a gear: only explicit relation groups transmit motion. Depression is a hinge, not a global motor.",
    detail: "direct bridge / branch / collector / coupling / feedback",
  };

  useEffect(() => {
    if (!introHint) return undefined;
    const timeout = window.setTimeout(() => setIntroHint(false), 3600);
    return () => window.clearTimeout(timeout);
  }, [introHint]);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motionQuery.matches) return undefined;

    let frame = 0;
    const updateScrollRotation = () => {
      frame = 0;
      const rect = sectionRef.current?.getBoundingClientRect();
      if (!rect) return;
      const viewportHeight = Math.max(window.innerHeight, 1);
      if (rect.bottom < 0 || rect.top > viewportHeight) return;
      const progress = Math.min(1, Math.max(0, (viewportHeight - rect.top) / (viewportHeight + rect.height)));
      setScrollRotation(Number(((progress - 0.5) * 56).toFixed(3)));
    };
    const requestUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updateScrollRotation);
    };

    updateScrollRotation();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, []);

  const handleMouseLeave = () => {
    if (gearDragRef.current.active) return;
    setLocalActiveId(null);
    onHover(null);
  };

  const handleHover = (inspectorId: string, event: ReactMouseEvent<SVGElement>) => {
    if (gearDragRef.current.moved) return;
    setLocalActiveId(inspectorId);
    onHover(inspectorId, pointer(event));
  };

  const handleInspect = (inspectorId: string, event: ReactMouseEvent<SVGElement>) => {
    event.stopPropagation();
    if (suppressClickRef.current || gearDragRef.current.moved) return;
    onInspect(inspectorId, pointer(event));
  };

  const handleGearPointerDown = (node: GearNode, inspectorId: string, event: ReactPointerEvent<SVGGElement>) => {
    event.stopPropagation();
    setIntroHint(false);
    setDraggingGearId(node.id);
    setLocalActiveId(inspectorId);
    onHover(inspectorId, pointer(event));
    gearDragRef.current = {
      active: true,
      moved: false,
      id: node.id,
      startAngle: pointerAngle(event, node),
      startRotations: { ...gearRotations },
      lastDelta: 0,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleGearPointerMove = (node: GearNode, event: ReactPointerEvent<SVGGElement>) => {
    if (!gearDragRef.current.active || gearDragRef.current.id !== node.id) return;
    event.stopPropagation();
    const delta = pointerAngle(event, node) - gearDragRef.current.startAngle;
    if (Math.abs(delta) <= 1.4) return;
    gearDragRef.current.moved = true;
    gearDragRef.current.lastDelta = delta;
    suppressClickRef.current = true;
    setGearRotations(computePropagatedRotations(node.id, delta, gearDragRef.current.startRotations));
    onHover(machineGearInspectorId(node.id), pointer(event));
    event.preventDefault();
  };

  const handleGearPointerEnd = (event: ReactPointerEvent<SVGGElement>) => {
    event.stopPropagation();
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    const moved = gearDragRef.current.moved;
    const sourceId = gearDragRef.current.id;
    const lastDelta = gearDragRef.current.lastDelta;
    gearDragRef.current.active = false;
    gearDragRef.current.moved = false;
    gearDragRef.current.id = "";
    setDraggingGearId(null);

    if (moved && sourceId) {
      const feedbackRelations = machineRelations.filter(
        (relation) => relation.type === "feedback_loop" && (relation.source_nodes.includes(sourceId) || relation.target_nodes.includes(sourceId)),
      );
      feedbackRelations.forEach((relation, index) => {
        window.setTimeout(() => {
          setPulsingFeedbackIds((current) => {
            const next = new Set(current);
            next.add(relation.id);
            return next;
          });
          setGearRotations((current) => {
            const next = { ...current };
            relationForceFromNode(relation, sourceId, lastDelta).forEach((value, id) => {
              next[id] = (next[id] ?? 0) + value * (0.38 - index * 0.04);
            });
            return next;
          });
          window.setTimeout(() => {
            setPulsingFeedbackIds((current) => {
              const next = new Set(current);
              next.delete(relation.id);
              return next;
            });
          }, 900);
        }, 420 + index * 180);
      });
      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 0);
    }
  };

  return (
    <div ref={sectionRef} className="relative overflow-hidden bg-wheat py-2">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="depression-machine h-auto w-full select-none"
        role="img"
        aria-label="Modern semantic transmission machine for depression"
        onMouseLeave={handleMouseLeave}
      >
        <defs>
          <pattern id="depression-machine-grid" width="52" height="52" patternUnits="userSpaceOnUse">
            <path d="M 52 0 L 0 0 0 52" fill="none" stroke={ink} strokeOpacity="0.045" strokeWidth="1" />
          </pattern>
          <pattern id="depression-machine-diagonal" width="24" height="24" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" x2="0" y1="0" y2="24" stroke={ink} strokeOpacity="0.026" strokeWidth="7" />
          </pattern>
        </defs>

        <rect width={WIDTH} height={HEIGHT} fill={paper} />
        <rect width={WIDTH} height={HEIGHT} fill="url(#depression-machine-grid)" />
        <rect x="84" y="156" width={WIDTH - 168} height="1414" fill="url(#depression-machine-diagonal)" opacity="0.42" />

        <g opacity="0.94">
          <text x="96" y="78" fill={orange} fontFamily="monospace" fontSize="18" fontWeight="900" letterSpacing="3.4">
            CHART 02 / MODERN SEMANTIC MACHINE
          </text>
          <text x="96" y="126" fill={ink} fontFamily="Helvetica Neue, Helvetica, Arial, sans-serif" fontSize="42" fontWeight="900">
            Depression as a semantic transmission machine
          </text>
          <text x={WIDTH - 96} y="84" textAnchor="end" fill={ink} opacity="0.58" fontFamily="monospace" fontSize="15" fontWeight="900" letterSpacing="1.4">
            relation groups / collectors / delayed feedback
          </text>
          <text x={WIDTH - 96} y="111" textAnchor="end" fill={ink} opacity="0.52" fontFamily="monospace" fontSize="14" fontWeight="900" letterSpacing="0.9">
            line weight = curated prominence, not causation
          </text>
        </g>

        <g opacity="0.9">
          {subsystemFrames.map(([label, x, y, width, height, color]) => (
            <g key={label as string}>
              <rect x={x as number} y={y as number} width={width as number} height={height as number} fill={color as string} fillOpacity="0.045" stroke={ink} strokeOpacity="0.18" strokeWidth="1.2" />
            </g>
          ))}
        </g>

        <g>
          {machineRelations
            .filter((relation) => relation.type === "many_to_many")
            .map((relation) => {
              const centroid = relationCentroid(relation, gearById);
              const nodes = [...relation.source_nodes, ...relation.target_nodes].map((id) => gearById.get(id)).filter((node): node is GearNode => Boolean(node));
              const minX = Math.min(...nodes.map((node) => node.x - node.radius)) - 28;
              const maxX = Math.max(...nodes.map((node) => node.x + node.radius)) + 28;
              const minY = Math.min(...nodes.map((node) => node.y - node.radius)) - 28;
              const maxY = Math.max(...nodes.map((node) => node.y + node.radius)) + 28;
              const activeRelation = highlights.relations.has(relation.id);
              return (
                <g
                  key={relation.id}
                  className="cursor-crosshair"
                  opacity={hasFocus && !activeRelation ? 0.2 : 1}
                  onMouseEnter={(event) => handleHover(machineRelationInspectorId(relation.id), event)}
                  onMouseMove={(event) => onHover(machineRelationInspectorId(relation.id), pointer(event))}
                  onClick={(event) => handleInspect(machineRelationInspectorId(relation.id), event)}
                >
                  <rect
                    x={n(minX)}
                    y={n(minY)}
                    width={n(maxX - minX)}
                    height={n(maxY - minY)}
                    rx="34"
                    fill={relationColor(relation)}
                    fillOpacity={activeRelation ? 0.16 : 0.032}
                    stroke={relationColor(relation)}
                    strokeOpacity={activeRelation ? 0.68 : 0.11}
                    strokeWidth={activeRelation ? 2.8 : 1.1}
                    strokeDasharray="8 12"
                  />
                </g>
              );
            })}
        </g>

        <g>
          {machineRelations.map((relation) => {
            const activeRelation = highlights.relations.has(relation.id);
            const pulsingRelation = pulsingFeedbackIds.has(relation.id);
            const relationEmphasis = activeRelation || pulsingRelation;
            const dimmed = hasFocus && !relationEmphasis;
            const color = relationColor(relation);
            const centroid = relationCentroid(relation, gearById);
            const strokeWidth = 1.8 + relation.strength_score * (relation.type === "one_to_one" ? 5.2 : 4.1);
            const dash = relationDash(relation);

            if (relation.type === "many_to_many") return null;

            return (
              <g
                key={relation.id}
                className="cursor-crosshair"
                opacity={dimmed ? 0.18 : 1}
                onMouseEnter={(event) => handleHover(machineRelationInspectorId(relation.id), event)}
                onMouseMove={(event) => onHover(machineRelationInspectorId(relation.id), pointer(event))}
                onClick={(event) => handleInspect(machineRelationInspectorId(relation.id), event)}
              >
                {relation.type === "one_to_many" ? (
                  <>
                    {relation.source_nodes.map((sourceId) => {
                      const source = gearById.get(sourceId);
                      if (!source) return null;
                      return (
                        <path
                          key={`${relation.id}-trunk-${sourceId}`}
                          d={`M ${source.x} ${source.y} Q ${centroid.all.x} ${centroid.all.y} ${centroid.target.x} ${centroid.target.y}`}
                          fill="none"
                          stroke={color}
                          strokeOpacity={relationEmphasis ? 0.92 : 0.16}
                          strokeWidth={n(relationEmphasis ? strokeWidth + 2.4 : Math.max(1.3, strokeWidth * 0.42))}
                          strokeLinecap="round"
                        />
                      );
                    })}
                    {relation.target_nodes.map((targetId) => {
                      const target = gearById.get(targetId);
                      if (!target) return null;
                      return (
                        <path
                          key={`${relation.id}-branch-${targetId}`}
                          d={`M ${centroid.target.x} ${centroid.target.y} Q ${centroid.all.x} ${centroid.all.y} ${target.x} ${target.y}`}
                          fill="none"
                          stroke={color}
                          strokeOpacity={relationEmphasis ? 0.84 : 0.12}
                          strokeWidth={n(relationEmphasis ? strokeWidth * 0.68 : Math.max(1, strokeWidth * 0.24))}
                          strokeLinecap="round"
                        />
                      );
                    })}
                  </>
                ) : null}

                {relation.type === "many_to_one" ? (
                  <>
                    {relation.source_nodes.map((sourceId) => {
                      const source = gearById.get(sourceId);
                      if (!source) return null;
                      return (
                        <path
                          key={`${relation.id}-collector-in-${sourceId}`}
                          d={`M ${source.x} ${source.y} Q ${centroid.source.x} ${centroid.source.y} ${centroid.target.x} ${centroid.target.y}`}
                          fill="none"
                          stroke={color}
                          strokeOpacity={relationEmphasis ? 0.92 : 0.16}
                          strokeWidth={n(relationEmphasis ? strokeWidth + 0.8 : Math.max(1.2, strokeWidth * 0.32))}
                          strokeDasharray={dash}
                          strokeLinecap="round"
                        />
                      );
                    })}
                    {relation.target_nodes.map((targetId) => {
                      const target = gearById.get(targetId);
                      if (!target) return null;
                      return <circle key={`${relation.id}-collector-${targetId}`} cx={target.x} cy={target.y} r={target.radius + 18} fill="none" stroke={color} strokeOpacity={relationEmphasis ? 0.82 : 0.13} strokeWidth={relationEmphasis ? 5.8 : 2.4} strokeDasharray="10 8" />;
                    })}
                  </>
                ) : null}

                {relation.type === "one_to_one" || relation.type === "feedback_loop" ? (
                  relation.source_nodes.flatMap((sourceId) =>
                    relation.target_nodes.map((targetId) => {
                      const source = gearById.get(sourceId);
                      const target = gearById.get(targetId);
                      if (!source || !target) return null;
                      return (
                        <path
                          key={`${relation.id}-${sourceId}-${targetId}`}
                          className={relation.type === "feedback_loop" && pulsingRelation ? "depression-machine-feedback-pulse" : undefined}
                          d={connectorPath(source, target, relation.type === "feedback_loop" ? 0.24 : 0.08)}
                          fill="none"
                          stroke={color}
                          strokeOpacity={relationEmphasis ? 0.94 : relation.type === "feedback_loop" ? 0.15 : 0.19}
                          strokeWidth={n(relationEmphasis ? (relation.type === "feedback_loop" ? strokeWidth : strokeWidth + 0.8) : Math.max(1.2, strokeWidth * 0.34))}
                          strokeDasharray={dash}
                          strokeLinecap="round"
                        />
                      );
                    }),
                  )
                ) : null}

              </g>
            );
          })}
        </g>

        <g>
          {machineGearNodes.map((node, nodeIndex) => {
            const inspectorId = machineGearInspectorId(node.id);
            const highlighted = highlights.gears.has(node.id);
            const activeGear = active?.kind === "gear" && active.id === node.id;
            const dragging = draggingGearId === node.id;
            const dimmed = hasFocus && !highlighted;
            const toothDepth = node.system === "center" ? 15 : node.radius < 70 ? 7 : 10;
            const phaseRingInner = node.radius + toothDepth + 8;
            const phaseRingOuter = phaseRingInner + (node.system === "center" ? 17 : 12);
            const scrollDrift = scrollRotation * (nodeIndex % 2 ? 1.14 : -1.14) * (node.id === "depression" ? 0.72 : 1);
            const rotation = (gearRotations[node.id] ?? 0) + (nodeIndex % 2 ? 1.5 : -1.6) + scrollDrift;
            const phaseArcOffset = scrollDrift * 0.44;
            const labelMax = node.id === "depression" ? 16 : node.radius < 90 ? 13 : 14;
            const labelLines = splitLabel(node.shortLabel, labelMax);
            const isDarkHub = node.id === "depression";
            const showIntroHint = introHint && node.id === "depression";
            const labelFontSize = node.id === "depression" ? 23 : node.radius < 72 ? 12 : 15;
            const labelLineHeight = node.radius < 72 ? 15 : 18;
            const longestLabel = Math.max(...labelLines.map((line) => line.length), 1);
            const labelPlateWidth = Math.max(node.radius * 1.26, longestLabel * labelFontSize * 0.68 + 32);
            const labelPlateHeight = Math.max(42, labelLines.length * labelLineHeight + 22);
            const labelTextOffset = labelFontSize * 0.08;

            return (
              <g
                key={node.id}
                className={`depression-machine-gear cursor-grab active:cursor-grabbing${showIntroHint ? " depression-machine-gear-intro" : ""}`}
                style={showIntroHint ? { transformOrigin: `${node.x}px ${node.y}px` } : undefined}
                opacity={dimmed ? 0.3 : 1}
                onMouseEnter={(event) => handleHover(inspectorId, event)}
                onMouseMove={(event) => onHover(inspectorId, pointer(event))}
                onPointerDown={(event) => handleGearPointerDown(node, inspectorId, event)}
                onPointerMove={(event) => handleGearPointerMove(node, event)}
                onPointerUp={handleGearPointerEnd}
                onPointerCancel={handleGearPointerEnd}
                onClick={(event) => handleInspect(inspectorId, event)}
              >
                <circle cx={node.x} cy={node.y} r={node.radius + toothDepth + 48} fill="transparent" />
                {showIntroHint ? (
                  <circle
                    className="depression-machine-intro-ring"
                    cx={node.x}
                    cy={node.y}
                    r={node.radius + toothDepth + 34}
                    fill="none"
                    stroke={orange}
                    strokeWidth="5"
                    strokeOpacity="0.62"
                    pointerEvents="none"
                  />
                ) : null}
                <g transform={`rotate(${rotation} ${node.x} ${node.y})`}>
                  <path
                    d={gearPath(node.x, node.y, node.radius, node.teeth, toothDepth)}
                    fill={isDarkHub ? ink : paper}
                    fillOpacity={isDarkHub ? 0.98 : 0.97}
                    stroke={node.color}
                    strokeOpacity={activeGear || highlighted ? 1 : 0.78}
                    strokeWidth={dragging ? 5.2 : node.radius < 72 ? 2.8 : 3.3}
                  />
                  <circle cx={node.x} cy={node.y} r={n(node.radius * 0.76)} fill={isDarkHub ? paper : labelPaper} fillOpacity={isDarkHub ? (highlighted ? 0.2 : 0.13) : highlighted ? 0.88 : 0.76} stroke={ink} strokeOpacity={highlighted ? 0.38 : 0.24} strokeWidth="1.4" />
                  <g>{renderTexture(node, activeGear || highlighted)}</g>
                </g>
                <g pointerEvents="none">
                  {machinePhases.map((phase, index) => {
                    const start = -96 + index * 90 + 3 + phaseArcOffset;
                    const end = start + 84;
                    const emphasis = node.phaseEmphasis[phase.id];
                    return (
                      <path
                        key={`${node.id}-${phase.id}`}
                        d={phaseArcPath(node.x, node.y, phaseRingInner, phaseRingOuter + emphasis * 4, start, end)}
                        fill={index === 0 ? silver : index === 1 ? paleBlue : index === 2 ? orange : node.color}
                        fillOpacity={0.2 + emphasis * (highlighted ? 0.68 : 0.34)}
                        stroke={ink}
                        strokeOpacity="0.14"
                        strokeWidth="0.9"
                      />
                    );
                  })}
                </g>

                <rect
                  x={n(node.x - labelPlateWidth / 2)}
                  y={n(node.y - labelPlateHeight / 2)}
                  width={n(labelPlateWidth)}
                  height={n(labelPlateHeight)}
                  rx={node.radius < 72 ? 9 : 13}
                  fill={labelPaper}
                  fillOpacity={isDarkHub ? 0.99 : highlighted ? 0.96 : 0.88}
                  stroke={node.color}
                  strokeOpacity={highlighted ? 1 : 0.38}
                  strokeWidth={highlighted ? 2.6 : 1.2}
                />
                <text
                  x={node.x}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  alignmentBaseline="middle"
                  fill={ink}
                  fontFamily={node.radius < 72 ? "monospace" : "Helvetica Neue, Helvetica, Arial, sans-serif"}
                  fontSize={labelFontSize}
                  fontWeight="900"
                  letterSpacing={node.radius < 72 ? 0.35 : 0}
                >
                  {labelLines.map((line, index) => (
                    <tspan
                      key={`${node.id}-label-${index}`}
                      x={node.x}
                      y={n(node.y + (index - (labelLines.length - 1) / 2) * labelLineHeight + labelTextOffset)}
                      dominantBaseline="middle"
                      alignmentBaseline="middle"
                    >
                      {line}
                    </tspan>
                  ))}
                </text>
                <text x={node.x} y={n(node.y + node.radius + toothDepth + 35)} textAnchor="middle" fill={node.color} opacity="0.92" fontFamily="monospace" fontSize="12" fontWeight="900" letterSpacing="1">
                  W{Math.round(node.weight * 100)} / T{node.teeth}
                </text>
                {dragging ? (
                  <text x={node.x} y={n(node.y - node.radius - toothDepth - 40)} textAnchor="middle" fill={orange} fontFamily="monospace" fontSize="12" fontWeight="900" letterSpacing="1.1">
                    relation-driven transmission
                  </text>
                ) : null}
              </g>
            );
          })}
        </g>

        <g pointerEvents="none">
          {subsystemFrames.map(([label, x, y, width, , color, subsystem]) => {
            const labelText = label.toUpperCase();
            const labelWidth = Math.min(width - 36, labelText.length * 11 + 26);
            const subsystemActive = machineGearNodes.some((node) => node.subsystem === subsystem && highlights.gears.has(node.id));
            return (
              <g key={`${label}-label`}>
                {subsystemActive ? (
                  <rect
                    x={x + 15}
                    y={y + 20}
                    width={n(labelWidth)}
                    height="31"
                    fill={paper}
                    fillOpacity="0.84"
                    stroke={color}
                    strokeOpacity="0.18"
                    strokeWidth="1"
                  />
                ) : null}
                <text x={x + 28} y={y + 41} fill={color} fontFamily="monospace" fontSize="15" fontWeight="900" letterSpacing="2">
                  {labelText}
                </text>
              </g>
            );
          })}
        </g>

        <g opacity="0.96">
          <rect x="96" y="1590" width={WIDTH - 192} height="184" fill={paper} fillOpacity="0.96" stroke={ink} strokeOpacity="0.76" strokeWidth="1.8" />
          <rect x="96" y="1590" width={WIDTH - 192} height="11" fill={orange} fillOpacity="0.92" />
          <text x="124" y="1638" fill={orange} fontFamily="monospace" fontSize="14" fontWeight="900" letterSpacing="2.3">
            ACTIVE RELATION
          </text>
          {splitLabel(info.label, 26).slice(0, 2).map((line, index) => (
            <text key={`active-label-${index}`} x="124" y={1680 + index * 30} fill={ink} fontFamily="Helvetica Neue, Helvetica, Arial, sans-serif" fontSize="27" fontWeight="900">
              {line}
            </text>
          ))}
          <text x="498" y="1638" fill={ink} opacity="0.66" fontFamily="monospace" fontSize="13" fontWeight="900" letterSpacing="1">
            {info.type}
          </text>
          {splitLabel(info.role, 58).slice(0, 3).map((line, index) => (
            <text key={`active-role-${index}`} x="498" y={1675 + index * 22} fill={ink} opacity="0.84" fontFamily="Helvetica Neue, Helvetica, Arial, sans-serif" fontSize="17" fontWeight="800">
              {line}
            </text>
          ))}
          {splitLabel(info.detail, 34).slice(0, 3).map((line, index) => (
            <text key={`active-detail-${index}`} x="1228" y={1660 + index * 24} fill={blue} fontFamily="monospace" fontSize="14" fontWeight="900" letterSpacing="0.8">
              {line}
            </text>
          ))}
          <text x="1228" y="1736" fill={ink} opacity="0.66" fontFamily="monospace" fontSize="12" fontWeight="900" letterSpacing="0.7">
            <tspan x="1228">lines are semantic transmission,</tspan>
            <tspan x="1228" dy="18">
              not causal effect size
            </tspan>
          </text>
        </g>

        <g opacity="0.96">
          <rect x="96" y="1822" width={WIDTH - 192} height="98" fill={paper} fillOpacity="0.9" stroke={ink} strokeOpacity="0.64" strokeWidth="1.6" />
          <text x="124" y="1862" fill={ink} fontFamily="monospace" fontSize="16" fontWeight="900" letterSpacing="2.2">
            OUTPUT BAND / SOCIAL + INSTITUTIONAL EFFECTS
          </text>
          {machineOutputNodes.map((output, index) => {
            const width = 270;
            const gap = 24;
            const x = 124 + index * (width + gap);
            const y = 1880;
            const inspectorId = machineOutputInspectorId(output.id);
            const highlighted = highlights.outputs.has(output.id);
            return (
              <g
                key={output.id}
                className="cursor-crosshair"
                opacity={hasFocus && !highlighted ? 0.3 : 1}
                onMouseEnter={(event) => handleHover(inspectorId, event)}
                onMouseMove={(event) => onHover(inspectorId, pointer(event))}
                onClick={(event) => handleInspect(inspectorId, event)}
              >
                <rect x={x} y={y} width={width} height="34" fill={highlighted ? orange : ink} fillOpacity={highlighted ? 0.92 : 0.18 + output.strength * 0.14} stroke={highlighted ? orange : ink} strokeOpacity={highlighted ? 1 : 0.46} strokeWidth={highlighted ? 2.8 : 1.4} />
                <rect x={x} y={y + 42} width={n(width * output.strength)} height="8" fill={highlighted ? orange : blue} fillOpacity={highlighted ? 0.96 : 0.68} />
                <text x={x + 13} y={y + 23} fill={highlighted ? paper : ink} fontFamily="Helvetica Neue, Helvetica, Arial, sans-serif" fontSize="15" fontWeight="900">
                  {output.label}
                </text>
              </g>
            );
          })}
        </g>

        <g opacity="0.88">
          {[
            ["bridge", "direct link", ink, undefined, "M -8 -6 L 58 -6"],
            ["fan-out", "branches outward", orange, undefined, "M -8 -6 L 30 -6 M 30 -6 L 58 -16 M 30 -6 L 58 4"],
            ["collector", "inputs gather", rose, "2 7", "M -8 -6 Q 22 -22 58 -6 M -8 6 Q 22 22 58 -6"],
            ["coupling", "mutual exchange", paleBlue, "5 9", "M -8 -6 C 8 -22 42 10 58 -6"],
            ["feedback", "delayed return", teal, "13 9", "M -8 -6 C 6 -28 52 -28 58 -6"],
          ].map(([label, detail, color, dash, path], index) => (
            <g key={label} transform={`translate(${124 + index * 302} 2004)`}>
              <path d={path as string} fill="none" stroke={color as string} strokeOpacity="0.78" strokeWidth="4" strokeLinecap="round" strokeDasharray={dash as string | undefined} />
              <text x="76" y="0" fill={ink} fontFamily="Helvetica Neue, Helvetica, Arial, sans-serif" fontSize="16" fontWeight="900">
                {label}
              </text>
              <text x="76" y="24" fill={ink} opacity="0.68" fontFamily="monospace" fontSize="13" fontWeight="900" letterSpacing="0.8">
                {detail}
              </text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}
