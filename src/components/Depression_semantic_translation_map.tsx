"use client";

import { useMemo, useState } from "react";

export type TranslationSystem =
  | "lived_experience"
  | "clinical_diagnosis"
  | "measurement_screening"
  | "public_health"
  | "public_discourse"
  | "self_description_help_seeking";

export type TranslationEffect =
  | "preserved"
  | "standardized"
  | "compressed"
  | "amplified"
  | "distorted"
  | "recirculated";

export type EvidenceCategory =
  | "experience"
  | "clinical"
  | "measurement"
  | "public_health"
  | "discourse"
  | "stigma_help_seeking";

export interface TranslationEvidencePoint {
  id: string;
  label: string;
  system: TranslationSystem;
  effect: TranslationEffect;
  category: EvidenceCategory;
  weight: number;
  description: string;
  defaultLabel?: boolean;
}

export interface TranslationConnection {
  id: string;
  sourceId: string;
  targetId: string;
  label: string;
  relation: string;
  strength: number;
  labelDx?: number;
  labelDy?: number;
}

type PointerPosition = { x: number; y: number };

type DepressionSemanticTranslationMapProps = {
  activeInspectorId?: string;
  onHover: (inspectorId: string | null, position?: PointerPosition) => void;
  onInspect: (inspectorId: string, position?: PointerPosition) => void;
};

type ActiveState =
  | { kind: "point"; id: string }
  | { kind: "system"; id: TranslationSystem }
  | { kind: "effect"; id: TranslationEffect }
  | { kind: "category"; id: EvidenceCategory }
  | null;

const WIDTH = 1700;
const HEIGHT = 900;
const ink = "#050510";
const paper = "#F5ECD2";
const labelPaper = "#FFF6D8";

export const translationSystems: { id: TranslationSystem; label: string; shortLabel: string }[] = [
  { id: "lived_experience", label: "Lived Experience", shortLabel: "lived" },
  { id: "clinical_diagnosis", label: "Clinical Diagnosis", shortLabel: "clinical" },
  { id: "measurement_screening", label: "Measurement / Screening", shortLabel: "measure" },
  { id: "public_health", label: "Public Health", shortLabel: "health" },
  { id: "public_discourse", label: "Public Discourse", shortLabel: "discourse" },
  { id: "self_description_help_seeking", label: "Self-description / Help-seeking", shortLabel: "self / help" },
];

export const translationEffects: { id: TranslationEffect; label: string; note: string }[] = [
  { id: "preserved", label: "Preserved", note: "carried forward" },
  { id: "standardized", label: "Standardized", note: "made regular" },
  { id: "compressed", label: "Compressed", note: "reduced or thinned" },
  { id: "amplified", label: "Amplified", note: "made louder or more legible" },
  { id: "distorted", label: "Distorted", note: "bent by social or institutional filters" },
  { id: "recirculated", label: "Recirculated", note: "fed back into another setting" },
];

export const translationCategoryStyles: Record<EvidenceCategory, { label: string; color: string }> = {
  experience: { label: "experience", color: "#006FB6" },
  clinical: { label: "clinical", color: "#9B2F67" },
  measurement: { label: "measurement", color: "#008B79" },
  public_health: { label: "public health", color: "#315F88" },
  discourse: { label: "discourse", color: "#C84F17" },
  stigma_help_seeking: { label: "stigma / help-seeking", color: "#5E4C8E" },
};

export const translationEvidencePoints: TranslationEvidencePoint[] = [
  {
    id: "private_distress",
    label: "private distress",
    system: "lived_experience",
    effect: "preserved",
    category: "experience",
    weight: 0.92,
    defaultLabel: true,
    description: "The private felt quality of depression before translation into formal systems.",
  },
  {
    id: "affect",
    label: "affect",
    system: "lived_experience",
    effect: "preserved",
    category: "experience",
    weight: 0.78,
    description: "Mood, heaviness, and felt low-state language.",
  },
  {
    id: "personal_context",
    label: "personal context",
    system: "lived_experience",
    effect: "preserved",
    category: "experience",
    weight: 0.86,
    defaultLabel: true,
    description: "Life history and setting remain most visible close to lived experience.",
  },
  {
    id: "ambiguity",
    label: "ambiguity",
    system: "lived_experience",
    effect: "compressed",
    category: "experience",
    weight: 0.72,
    description: "Unclear feeling becomes harder to carry once systems ask for stable names.",
  },
  {
    id: "lack_shared_naming",
    label: "lack of shared naming",
    system: "lived_experience",
    effect: "compressed",
    category: "experience",
    weight: 0.66,
    description: "Experience may exist before there is a useful shared label.",
  },
  {
    id: "classification",
    label: "classification",
    system: "clinical_diagnosis",
    effect: "standardized",
    category: "clinical",
    weight: 0.86,
    defaultLabel: true,
    description: "The word becomes a clinical category rather than only an experience.",
  },
  {
    id: "diagnostic_threshold",
    label: "diagnostic threshold",
    system: "clinical_diagnosis",
    effect: "standardized",
    category: "clinical",
    weight: 0.9,
    defaultLabel: true,
    description: "Duration, symptom count, and clinical criteria create a naming boundary.",
  },
  {
    id: "impairment",
    label: "impairment",
    system: "clinical_diagnosis",
    effect: "amplified",
    category: "clinical",
    weight: 0.78,
    description: "Functional difficulty helps make depression institutionally legible.",
  },
  {
    id: "clinical_naming",
    label: "clinical naming",
    system: "clinical_diagnosis",
    effect: "amplified",
    category: "clinical",
    weight: 0.82,
    description: "Naming can validate and route the experience into care systems.",
  },
  {
    id: "personal_narrative",
    label: "personal narrative",
    system: "clinical_diagnosis",
    effect: "compressed",
    category: "clinical",
    weight: 0.72,
    description: "The narrative of a life becomes less central than criteria and category.",
  },
  {
    id: "contextual_nuance",
    label: "contextual nuance",
    system: "clinical_diagnosis",
    effect: "compressed",
    category: "clinical",
    weight: 0.68,
    description: "Clinical translation can reduce contextual detail while increasing legibility.",
  },
  {
    id: "score",
    label: "score",
    system: "measurement_screening",
    effect: "standardized",
    category: "measurement",
    weight: 0.92,
    defaultLabel: true,
    description: "Experience becomes a numeric or banded score.",
  },
  {
    id: "itemization",
    label: "itemization",
    system: "measurement_screening",
    effect: "standardized",
    category: "measurement",
    weight: 0.82,
    description: "Symptoms are split into answerable items.",
  },
  {
    id: "comparability",
    label: "comparability",
    system: "measurement_screening",
    effect: "amplified",
    category: "measurement",
    weight: 0.82,
    defaultLabel: true,
    description: "Scores make unlike cases comparable across settings.",
  },
  {
    id: "repeatability",
    label: "repeatability",
    system: "measurement_screening",
    effect: "amplified",
    category: "measurement",
    weight: 0.78,
    description: "Measurement can be repeated across visits, studies, and populations.",
  },
  {
    id: "narrative_complexity",
    label: "narrative complexity",
    system: "measurement_screening",
    effect: "compressed",
    category: "measurement",
    weight: 0.76,
    description: "Scores preserve less of the story than open description does.",
  },
  {
    id: "open_ended_experience",
    label: "open-ended experience",
    system: "measurement_screening",
    effect: "compressed",
    category: "measurement",
    weight: 0.68,
    description: "Open experience is constrained by fixed response options.",
  },
  {
    id: "prevalence",
    label: "prevalence",
    system: "public_health",
    effect: "amplified",
    category: "public_health",
    weight: 0.94,
    defaultLabel: true,
    description: "The word becomes visible as population burden.",
  },
  {
    id: "population_trend",
    label: "population trend",
    system: "public_health",
    effect: "amplified",
    category: "public_health",
    weight: 0.86,
    description: "Repeated reporting makes change over time legible.",
  },
  {
    id: "policy_signal",
    label: "policy signal",
    system: "public_health",
    effect: "amplified",
    category: "public_health",
    weight: 0.84,
    description: "Aggregated depression becomes usable in policy and resource arguments.",
  },
  {
    id: "reporting_cycle",
    label: "reporting cycle",
    system: "public_health",
    effect: "standardized",
    category: "public_health",
    weight: 0.72,
    description: "Public-health reporting gives depression regular administrative form.",
  },
  {
    id: "individual_case_specificity",
    label: "individual case specificity",
    system: "public_health",
    effect: "compressed",
    category: "public_health",
    weight: 0.7,
    description: "The singular case becomes harder to see inside population scale.",
  },
  {
    id: "institutional_legibility",
    label: "institutional legibility",
    system: "public_health",
    effect: "standardized",
    category: "public_health",
    weight: 0.78,
    description: "The word becomes recordable and comparable across institutions.",
  },
  {
    id: "shared_language",
    label: "shared language",
    system: "public_discourse",
    effect: "amplified",
    category: "discourse",
    weight: 0.9,
    defaultLabel: true,
    description: "Public discourse makes depression easier to say and circulate.",
  },
  {
    id: "recognition_discourse",
    label: "recognition",
    system: "public_discourse",
    effect: "amplified",
    category: "discourse",
    weight: 0.82,
    description: "Public language increases recognizability.",
  },
  {
    id: "public_circulation",
    label: "public circulation",
    system: "public_discourse",
    effect: "amplified",
    category: "discourse",
    weight: 0.86,
    description: "Media and public talk move the word into wider social air.",
  },
  {
    id: "simplification",
    label: "simplification",
    system: "public_discourse",
    effect: "compressed",
    category: "discourse",
    weight: 0.72,
    description: "Public language often trades nuance for portability.",
  },
  {
    id: "stereotype_risk",
    label: "stereotype risk",
    system: "public_discourse",
    effect: "distorted",
    category: "discourse",
    weight: 0.82,
    defaultLabel: true,
    description: "Repeated public scripts can bend the meaning toward stigma.",
  },
  {
    id: "headline_phrase",
    label: "headline phrase",
    system: "public_discourse",
    effect: "distorted",
    category: "discourse",
    weight: 0.68,
    description: "Headline language can simplify, dramatize, or distort the term.",
  },
  {
    id: "self_recognition",
    label: "self-recognition",
    system: "self_description_help_seeking",
    effect: "preserved",
    category: "stigma_help_seeking",
    weight: 0.86,
    defaultLabel: true,
    description: "The public word can return as a person's own recognition.",
  },
  {
    id: "disclosure",
    label: "disclosure",
    system: "self_description_help_seeking",
    effect: "amplified",
    category: "stigma_help_seeking",
    weight: 0.78,
    description: "Naming can make a private condition more socially visible.",
  },
  {
    id: "action_pathway",
    label: "action pathway",
    system: "self_description_help_seeking",
    effect: "recirculated",
    category: "stigma_help_seeking",
    weight: 0.86,
    defaultLabel: true,
    description: "Self-description can loop into help-seeking and care navigation.",
  },
  {
    id: "hesitation",
    label: "hesitation",
    system: "self_description_help_seeking",
    effect: "distorted",
    category: "stigma_help_seeking",
    weight: 0.82,
    description: "Social risk can delay or reshape help-seeking.",
  },
  {
    id: "secrecy",
    label: "secrecy",
    system: "self_description_help_seeking",
    effect: "distorted",
    category: "stigma_help_seeking",
    weight: 0.74,
    description: "The word can be withheld when disclosure feels unsafe.",
  },
  {
    id: "stigma_drag",
    label: "stigma drag",
    system: "self_description_help_seeking",
    effect: "recirculated",
    category: "stigma_help_seeking",
    weight: 0.82,
    defaultLabel: true,
    description: "Stigma feeds back into hesitation and blocked action.",
  },
];

export const translationConnections: TranslationConnection[] = [
  {
    id: "context_to_narrative",
    sourceId: "personal_context",
    targetId: "personal_narrative",
    label: "context narrows",
    relation: "context thins as it enters diagnostic form",
    strength: 0.58,
    labelDx: -16,
    labelDy: -18,
  },
  {
    id: "affect_to_threshold",
    sourceId: "affect",
    targetId: "diagnostic_threshold",
    label: "feeling becomes criteria",
    relation: "felt affect becomes bounded by criteria",
    strength: 0.62,
    labelDx: 2,
    labelDy: -28,
  },
  {
    id: "threshold_to_score",
    sourceId: "diagnostic_threshold",
    targetId: "score",
    label: "threshold becomes score",
    relation: "clinical boundaries meet scoring systems",
    strength: 0.72,
    labelDx: 0,
    labelDy: -24,
  },
  {
    id: "score_to_prevalence",
    sourceId: "score",
    targetId: "prevalence",
    label: "score aggregates",
    relation: "scores aggregate into prevalence",
    strength: 0.78,
    labelDx: -8,
    labelDy: -24,
  },
  {
    id: "prevalence_to_circulation",
    sourceId: "prevalence",
    targetId: "public_circulation",
    label: "report enters discourse",
    relation: "public-health signal enters discourse",
    strength: 0.7,
    labelDx: -4,
    labelDy: -28,
  },
  {
    id: "language_to_self",
    sourceId: "shared_language",
    targetId: "self_recognition",
    label: "language returns to self",
    relation: "shared language supports self-recognition",
    strength: 0.82,
    labelDx: 6,
    labelDy: -28,
  },
  {
    id: "stereotype_to_hesitation",
    sourceId: "stereotype_risk",
    targetId: "hesitation",
    label: "stigma slows disclosure",
    relation: "stereotype risk can slow disclosure or care",
    strength: 0.66,
    labelDx: -4,
    labelDy: -26,
  },
  {
    id: "stigma_to_action",
    sourceId: "stigma_drag",
    targetId: "action_pathway",
    label: "drag on action",
    relation: "stigma feeds back into action pathways",
    strength: 0.6,
    labelDx: 0,
    labelDy: -18,
  },
];

const chartLeft = 278;
const chartTop = 148;
const colWidth = 216;
const rowHeight = 98;
const chartWidth = colWidth * translationSystems.length;
const chartHeight = rowHeight * translationEffects.length;

const pointOffsets = [
  { x: -48, y: -18 },
  { x: 34, y: -20 },
  { x: -6, y: 18 },
  { x: 52, y: 24 },
  { x: -54, y: 28 },
  { x: 6, y: -34 },
];

const labelOffsets: Record<string, { x: number; y: number; anchor?: "start" | "middle" | "end" }> = {
  private_distress: { x: -6, y: -28, anchor: "middle" },
  personal_context: { x: 4, y: 34, anchor: "middle" },
  classification: { x: -14, y: -28, anchor: "end" },
  diagnostic_threshold: { x: 10, y: -30, anchor: "start" },
  score: { x: -14, y: -30, anchor: "end" },
  comparability: { x: -8, y: -30, anchor: "middle" },
  prevalence: { x: -8, y: -30, anchor: "middle" },
  shared_language: { x: 0, y: -30, anchor: "middle" },
  stereotype_risk: { x: 0, y: -30, anchor: "middle" },
  self_recognition: { x: 6, y: -32, anchor: "middle" },
  action_pathway: { x: -10, y: -30, anchor: "end" },
  stigma_drag: { x: 10, y: -30, anchor: "start" },
};

function n(value: number) {
  return Number(value.toFixed(2));
}

function systemLabel(id: TranslationSystem) {
  return translationSystems.find((system) => system.id === id)?.label ?? id;
}

function effectLabel(id: TranslationEffect) {
  return translationEffects.find((effect) => effect.id === id)?.label ?? id;
}

function pointRadius(point: TranslationEvidencePoint) {
  return 5.5 + point.weight * 7.2;
}

function splitLabel(label: string, maxLength: number) {
  const words = label.split(" ");
  const lines: string[] = [];
  let line = "";

  words.forEach((word) => {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxLength && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  });

  if (line) lines.push(line);
  return lines;
}

function connectionPath(source: { x: number; y: number }, target: { x: number; y: number }, index: number) {
  const midX = (source.x + target.x) / 2;
  const midY = (source.y + target.y) / 2;
  const dx = target.x - source.x;
  const dy = target.y - source.y;
  const bend = index % 2 === 0 ? 0.08 : -0.08;
  return `M ${n(source.x)} ${n(source.y)} Q ${n(midX - dy * bend)} ${n(midY + dx * bend)} ${n(target.x)} ${n(target.y)}`;
}

function connectionLabelPoint(source: { x: number; y: number }, target: { x: number; y: number }, connection: TranslationConnection, index: number) {
  const midX = (source.x + target.x) / 2;
  const midY = (source.y + target.y) / 2;
  const dx = target.x - source.x;
  const dy = target.y - source.y;
  const bend = index % 2 === 0 ? 0.08 : -0.08;
  return {
    x: midX - dy * bend * 0.42 + (connection.labelDx ?? 0),
    y: midY + dx * bend * 0.42 + (connection.labelDy ?? 0),
  };
}

function pointLabelBox(label: string, fontSize: number) {
  return {
    width: Math.min(176, Math.max(68, label.length * fontSize * 0.62 + 18)),
    height: fontSize + 10,
  };
}

export function translationPointInspectorId(pointId: string) {
  return `depression-translation-point-${pointId}`;
}

export function translationSystemInspectorId(systemId: TranslationSystem) {
  return `depression-translation-system-${systemId}`;
}

export function translationEffectInspectorId(effectId: TranslationEffect) {
  return `depression-translation-effect-${effectId}`;
}

export function translationCategoryInspectorId(categoryId: EvidenceCategory) {
  return `depression-translation-category-${categoryId}`;
}

function activeFromInspectorId(inspectorId?: string): ActiveState {
  if (!inspectorId) return null;
  const pointPrefix = "depression-translation-point-";
  const systemPrefix = "depression-translation-system-";
  const effectPrefix = "depression-translation-effect-";
  const categoryPrefix = "depression-translation-category-";

  if (inspectorId.startsWith(pointPrefix)) {
    return { kind: "point", id: inspectorId.slice(pointPrefix.length) };
  }
  if (inspectorId.startsWith(systemPrefix)) {
    return { kind: "system", id: inspectorId.slice(systemPrefix.length) as TranslationSystem };
  }
  if (inspectorId.startsWith(effectPrefix)) {
    return { kind: "effect", id: inspectorId.slice(effectPrefix.length) as TranslationEffect };
  }
  if (inspectorId.startsWith(categoryPrefix)) {
    return { kind: "category", id: inspectorId.slice(categoryPrefix.length) as EvidenceCategory };
  }
  return null;
}

export function DepressionSemanticTranslationMap({
  activeInspectorId,
  onHover,
  onInspect,
}: DepressionSemanticTranslationMapProps) {
  const [hovered, setHovered] = useState<ActiveState>(null);
  const active = activeFromInspectorId(activeInspectorId) ?? hovered;

  const layout = {
    width: 1760,
    height: 1260,
    chartLeft: 86,
    chartTop: 220,
    effectStart: 360,
    effectEnd: 1348,
    rowHeight: 132,
    summaryLeft: 1416,
    summaryCenter: 1588,
    summaryScale: 126,
  };
  const chartBottom = layout.chartTop + layout.rowHeight * translationSystems.length;
  const effectBandWidth = layout.effectEnd - layout.effectStart;
  const stableEffects = new Set<TranslationEffect>([
    "preserved",
    "standardized",
    "amplified",
  ]);

  const effectX = (effect: TranslationEffect) => {
    const index = translationEffects.findIndex((item) => item.id === effect);
    return layout.effectStart + (index / (translationEffects.length - 1)) * effectBandWidth;
  };

  const systemY = (system: TranslationSystem) => {
    const index = translationSystems.findIndex((item) => item.id === system);
    return layout.chartTop + index * layout.rowHeight + layout.rowHeight / 2;
  };

  const hashValue = (input: string) => {
    let hash = 0;
    for (let index = 0; index < input.length; index += 1) {
      hash = (hash * 31 + input.charCodeAt(index)) % 1000003;
    }
    return hash / 1000003;
  };

  const jitter = (key: string, scale: number) => (hashValue(key) - 0.5) * scale;
  const dotCount = (point: TranslationEvidencePoint) => Math.max(3, Math.round(point.weight * 7));

  const pointById = useMemo(
    () => new Map(translationEvidencePoints.map((point) => [point.id, point])),
    [],
  );

  const pointPositions = useMemo(() => {
    const groupIndex = new Map<string, number>();
    const positions = new Map<string, { x: number; y: number }>();

    translationEvidencePoints.forEach((point) => {
      const key = `${point.system}-${point.effect}`;
      const index = groupIndex.get(key) ?? 0;
      groupIndex.set(key, index + 1);
      const side = index % 2 === 0 ? -1 : 1;
      const stack = Math.floor(index / 2);

      positions.set(point.id, {
        x: effectX(point.effect) + side * (18 + stack * 10) + jitter(`${point.id}-x`, 26),
        y: systemY(point.system) + jitter(`${point.id}-y`, 34) + stack * 7,
      });
    });

    return positions;
  }, []);

  const systemSummaries = useMemo(
    () =>
      translationSystems.map((system, index) => {
        const points = translationEvidencePoints.filter((point) => point.system === system.id);
        const retainedWeight = points
          .filter((point) => stableEffects.has(point.effect))
          .reduce((sum, point) => sum + point.weight, 0);
        const alteredWeight = points
          .filter((point) => !stableEffects.has(point.effect))
          .reduce((sum, point) => sum + point.weight, 0);
        const totalWeight = Math.max(0.01, retainedWeight + alteredWeight);

        return {
          system,
          index,
          points,
          retainedWeight,
          alteredWeight,
          totalWeight,
          retainedShare: retainedWeight / totalWeight,
          alteredShare: alteredWeight / totalWeight,
        };
      }),
    [],
  );

  const coveredCells = useMemo(
    () =>
      new Set(
        translationEvidencePoints.map((point) => `${point.system}-${point.effect}`),
      ).size,
    [],
  );

  const connectedIds = useMemo(() => {
    if (!active || active.kind !== "point") return new Set<string>();
    const ids = new Set<string>([active.id]);
    translationConnections.forEach((connection) => {
      if (connection.sourceId === active.id) ids.add(connection.targetId);
      if (connection.targetId === active.id) ids.add(connection.sourceId);
    });
    return ids;
  }, [active]);

  const activeMatchesPoint = (point: TranslationEvidencePoint) => {
    if (!active) return true;
    if (active.kind === "point") return connectedIds.has(point.id);
    if (active.kind === "system") return point.system === active.id;
    if (active.kind === "effect") return point.effect === active.id;
    if (active.kind === "category") return point.category === active.id;
    return true;
  };

  const setPoint = (
    point: TranslationEvidencePoint,
    position?: { x: number; y: number },
  ) => {
    setHovered({ kind: "point", id: point.id });
    onHover?.(translationPointInspectorId(point.id), position);
  };

  const setSystem = (system: TranslationSystem, position?: { x: number; y: number }) => {
    setHovered({ kind: "system", id: system });
    onHover?.(translationSystemInspectorId(system), position);
  };

  const setEffect = (effect: TranslationEffect, position?: { x: number; y: number }) => {
    setHovered({ kind: "effect", id: effect });
    onHover?.(translationEffectInspectorId(effect), position);
  };

  const setCategory = (
    category: EvidenceCategory,
    position?: { x: number; y: number },
  ) => {
    setHovered({ kind: "category", id: category });
    onHover?.(translationCategoryInspectorId(category), position);
  };

  const clearActive = () => {
    setHovered(null);
    onHover?.(null);
  };

  const featuredDefaultLabels = new Set([
    "private distress",
    "diagnostic threshold",
    "score",
    "prevalence",
    "shared language",
    "stigma drag",
  ]);

  const selectedPoint =
    active?.kind === "point" ? translationEvidencePoints.find((point) => point.id === active.id) : null;
  const boundaryX = (effectX("compressed") + effectX("amplified")) / 2;

  return (
    <div className="relative overflow-x-auto border border-[#ddd4bd] bg-[#f7efd8]">
      <div className="min-w-[1180px]">
        <svg
          viewBox={`0 0 ${layout.width} ${layout.height}`}
          className="block h-auto w-full"
          role="img"
          aria-label="Depression semantic translation rain field"
          onMouseLeave={clearActive}
        >
          <defs>
            <pattern id="translation-rain-grid" width="44" height="44" patternUnits="userSpaceOnUse">
              <path d="M 44 0 L 0 0 0 44" fill="none" stroke="#cfc4aa" strokeWidth="1" opacity="0.5" />
            </pattern>
            <filter id="translation-dot-glow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <rect width={layout.width} height={layout.height} fill="#f7efd8" />
          <rect width={layout.width} height={layout.height} fill="url(#translation-rain-grid)" opacity="0.58" />

          <g transform="translate(72 58)">
          </g>

          <g>
            <line
              x1={boundaryX}
              x2={boundaryX}
              y1={layout.chartTop - 46}
              y2={chartBottom + 18}
              stroke="#050510"
              strokeWidth="2"
              opacity="0.52"
            />
            <text
              x={boundaryX + 12}
              y={layout.chartTop - 58}
              fill="#a94f28"
              fontSize="14"
              fontWeight="800"
              letterSpacing="3"
            >
              SYSTEM BOUNDARY
            </text>
          </g>

          {translationEffects.map((effect) => {
            const x = effectX(effect.id);
            const isActive = active?.kind === "effect" && active.id === effect.id;
            return (
              <g
                key={effect.id}
                className="cursor-crosshair"
                onMouseEnter={(event) => setEffect(effect.id, { x: event.clientX, y: event.clientY })}
                onMouseMove={(event) => onHover?.(translationEffectInspectorId(effect.id), { x: event.clientX, y: event.clientY })}
                onClick={(event) => {
                  event.stopPropagation();
                  onInspect?.(translationEffectInspectorId(effect.id), { x: event.clientX, y: event.clientY });
                }}
              >
                <line
                  x1={x}
                  x2={x}
                  y1={layout.chartTop - 18}
                  y2={chartBottom + 14}
                  stroke={isActive ? "#050510" : "#8a826f"}
                  strokeWidth={isActive ? 2.4 : 1}
                  opacity={isActive ? 0.75 : 0.28}
                />
                <text
                  x={x}
                  y={layout.chartTop - 118}
                  textAnchor="middle"
                  fill={isActive ? "#050510" : "#6b665b"}
                  fontSize="15"
                  fontWeight="900"
                  letterSpacing="2"
                >
                  {effect.label.toUpperCase()}
                </text>
                <text
                  x={x}
                  y={layout.chartTop - 84}
                  textAnchor="middle"
                  fill="#554f45"
                  fontSize="10"
                  fontWeight="900"
                  letterSpacing="1"
                >
                  {effect.note.toUpperCase()}
                </text>
              </g>
            );
          })}

          {systemSummaries.map((summary) => {
            const y = systemY(summary.system.id);
            const activeRow = active?.kind === "system" && active.id === summary.system.id;
            const retainedWidth = summary.retainedShare * layout.summaryScale;
            const alteredWidth = summary.alteredShare * layout.summaryScale;
            const rowOpacity = active && !activeRow && active.kind === "system" ? 0.22 : 1;

            return (
              <g
                key={summary.system.id}
                className="cursor-crosshair"
                opacity={rowOpacity}
                onMouseEnter={(event) => setSystem(summary.system.id, { x: event.clientX, y: event.clientY })}
                onMouseMove={(event) => onHover?.(translationSystemInspectorId(summary.system.id), { x: event.clientX, y: event.clientY })}
                onClick={(event) => {
                  event.stopPropagation();
                  onInspect?.(translationSystemInspectorId(summary.system.id), { x: event.clientX, y: event.clientY });
                }}
              >
                <rect
                  x={layout.chartLeft}
                  y={y - layout.rowHeight / 2 + 8}
                  width={layout.width - layout.chartLeft - 76}
                  height={layout.rowHeight - 16}
                  fill={activeRow ? "#fff8df" : "transparent"}
                  opacity="0.52"
                />
                <line x1={layout.chartLeft} x2={layout.width - 78} y1={y} y2={y} stroke="#756d60" strokeWidth="1.2" opacity="0.62" />
                <text x={layout.chartLeft} y={y - 10} fill="#050510" fontSize="24" fontWeight="900" letterSpacing="4">
                  {String(summary.index + 1).padStart(2, "0")}
                </text>
                <text x={layout.chartLeft + 54} y={y - 12} fill="#050510" fontSize="18" fontWeight="900" letterSpacing="3">
                  {summary.system.label.toUpperCase()}
                </text>
                <text x={layout.chartLeft + 54} y={y + 16} fill="#4d473d" fontSize="12" fontWeight="900" letterSpacing="2.4">
                  {summary.points.length} FRAGMENTS / {summary.system.shortLabel.toUpperCase()}
                </text>

                <line x1={layout.effectStart - 22} x2={layout.effectEnd + 24} y1={y} y2={y} stroke="#050510" strokeWidth="1.3" opacity="0.42" />
                <circle cx={layout.effectStart - 22} cy={y} r="4" fill="#050510" opacity="0.52" />
                <circle cx={layout.effectEnd + 24} cy={y} r="4" fill="#050510" opacity="0.52" />

                <line x1={layout.summaryCenter} x2={layout.summaryCenter} y1={y - 31} y2={y + 31} stroke="#050510" strokeWidth="1" opacity="0.48" />
                <rect
                  x={layout.summaryCenter - retainedWidth}
                  y={y - 17}
                  width={retainedWidth}
                  height="13"
                  fill="#0079B8"
                  opacity="0.88"
                  className="summary-bar-left"
                />
                <rect
                  x={layout.summaryCenter}
                  y={y + 5}
                  width={alteredWidth}
                  height="13"
                  fill="#C24C18"
                  opacity="0.84"
                  className="summary-bar-right"
                />
                <text x={layout.summaryLeft} y={y - 24} fill="#453f36" fontSize="12" fontWeight="900" letterSpacing="2">
                  KEPT
                </text>
                <text x={layout.summaryCenter + 78} y={y + 28} fill="#453f36" fontSize="12" fontWeight="900" letterSpacing="2">
                  BENT
                </text>
              </g>
            );
          })}

          {translationConnections.map((connection, index) => {
            const source = pointPositions.get(connection.sourceId);
            const target = pointPositions.get(connection.targetId);
            if (!source || !target) return null;
            const isActive = active?.kind === "point" && connectedIds.has(connection.sourceId) && connectedIds.has(connection.targetId);
            const sourcePoint = pointById.get(connection.sourceId);
            const categoryColor = sourcePoint
              ? translationCategoryStyles[sourcePoint.category].color
              : "#050510";
            return (
              <path
                key={connection.id}
                d={connectionPath(source, target, index)}
                fill="none"
                stroke={isActive ? categoryColor : "#050510"}
                strokeWidth={isActive ? 2.2 : 0.8}
                strokeDasharray={index % 2 === 0 ? "5 9" : "1 8"}
                opacity={isActive ? 0.58 : 0.14}
                pointerEvents="none"
              />
            );
          })}

          {translationEvidencePoints.map((point, pointIndex) => {
            const position = pointPositions.get(point.id);
            if (!position) return null;
            const category = translationCategoryStyles[point.category];
            const visible = activeMatchesPoint(point);
            const isActivePoint = active?.kind === "point" && active.id === point.id;
            const showLabel =
              isActivePoint ||
              (!active && point.defaultLabel && featuredDefaultLabels.has(point.label));
            const labelLines = splitLabel(point.label, 18).slice(0, 2);
            const labelWidth = Math.max(
              150,
              Math.min(380, Math.max(...labelLines.map((line) => line.length)) * 15 + 58),
            );
            const labelX = Math.min(layout.width - labelWidth - 86, position.x + 18);
            const labelY = position.y - 30;
            const microDots = Array.from({ length: dotCount(point) });

            return (
              <g
                key={point.id}
                className="cursor-crosshair"
                opacity={visible ? 1 : 0.14}
                onMouseEnter={(event) => setPoint(point, { x: event.clientX, y: event.clientY })}
                onMouseMove={(event) => onHover?.(translationPointInspectorId(point.id), { x: event.clientX, y: event.clientY })}
                onClick={(event) => {
                  event.stopPropagation();
                  onInspect?.(translationPointInspectorId(point.id), { x: event.clientX, y: event.clientY });
                }}
              >
                <circle cx={position.x} cy={position.y} r="30" fill="transparent" />
                {microDots.map((_, microIndex) => {
                  const dx = jitter(`${point.id}-dot-x-${microIndex}`, 38);
                  const dy = jitter(`${point.id}-dot-y-${microIndex}`, 24);
                  const radius = pointRadius(point) * (0.42 + hashValue(`${point.id}-r-${microIndex}`) * 0.42);
                  return (
                    <circle
                      key={`${point.id}-${microIndex}`}
                      cx={position.x + dx}
                      cy={position.y + dy}
                      r={radius}
                      fill={category.color}
                      opacity={isActivePoint ? 0.92 : 0.28 + point.weight * 0.42}
                      className="translation-breath-dot"
                      style={{ animationDelay: `${(pointIndex + microIndex) * 0.11}s` }}
                    />
                  );
                })}
                <circle
                  cx={position.x}
                  cy={position.y}
                  r={isActivePoint ? 22 : 14 + point.weight * 12}
                  fill={category.color}
                  opacity={isActivePoint ? 0.82 : 0.24}
                  filter={isActivePoint ? "url(#translation-dot-glow)" : undefined}
                />
                <circle
                  cx={position.x}
                  cy={position.y}
                  r={isActivePoint ? 28 : 18}
                  fill="none"
                  stroke={category.color}
                  strokeWidth={isActivePoint ? 3 : 1.2}
                  opacity={isActivePoint ? 0.92 : 0.35}
                />
                {showLabel && (
                  <g pointerEvents="none" className="translation-label-card">
                    <line x1={position.x} y1={position.y} x2={labelX + 14} y2={labelY + 22} stroke={category.color} strokeWidth="2" opacity="0.88" />
                    <rect
                      x={labelX}
                      y={labelY}
                      width={labelWidth}
                      height={labelLines.length > 1 ? 82 : 58}
                      fill="#fff6d8"
                      stroke={category.color}
                      strokeWidth="2"
                    />
                    {labelLines.map((line, lineIndex) => (
                      <text
                        key={line}
                        x={labelX + 14}
                        y={labelY + 27 + lineIndex * 22}
                        fill="#050510"
                        fontSize="15"
                        fontWeight="900"
                        letterSpacing="1.2"
                      >
                        {line.toUpperCase()}
                      </text>
                    ))}
                  </g>
                )}
              </g>
            );
          })}

          <g transform={`translate(${layout.chartLeft} ${chartBottom + 82})`}>
            <text x="0" y="0" fill="#a94f28" fontSize="16" fontWeight="900" letterSpacing="4">
              CATEGORY COLOUR KEY
            </text>
            {(Object.keys(translationCategoryStyles) as EvidenceCategory[]).map((categoryId, index) => {
              const style = translationCategoryStyles[categoryId];
              const x = (index % 3) * 360;
              const y = 42 + Math.floor(index / 3) * 42;
              const isActive = active?.kind === "category" && active.id === categoryId;
              return (
                <g
                  key={categoryId}
                  transform={`translate(${x} ${y})`}
                  className="cursor-crosshair"
                  onMouseEnter={(event) => setCategory(categoryId, { x: event.clientX, y: event.clientY })}
                  onMouseMove={(event) => onHover?.(translationCategoryInspectorId(categoryId), { x: event.clientX, y: event.clientY })}
                  onClick={(event) => {
                    event.stopPropagation();
                    onInspect?.(translationCategoryInspectorId(categoryId), { x: event.clientX, y: event.clientY });
                  }}
                >
                  <rect x="0" y="-14" width="30" height="14" fill={style.color} opacity={isActive ? 1 : 0.72} />
                  <text x="42" y="0" fill="#050510" fontSize="15" fontWeight="900" letterSpacing="2.2">
                    {style.label.toUpperCase()}
                  </text>
                </g>
              );
            })}
          </g>

          <g transform={`translate( 104)`}>
          </g>

          {selectedPoint && (
            <g transform={`translate(${layout.summaryLeft} ${chartBottom + 34})`} pointerEvents="none">
              <rect x="0" y="0" width="338" height="112" fill="#fff6d8" stroke={translationCategoryStyles[selectedPoint.category].color} strokeWidth="2" />
              <text x="20" y="32" fill="#050510" fontSize="19" fontWeight="900" letterSpacing="2">
                {selectedPoint.label.toUpperCase()}
              </text>
              <text x="20" y="61" fill="#453f36" fontSize="13" fontWeight="900" letterSpacing="2">
                {translationSystems.find((system) => system.id === selectedPoint.system)?.label.toUpperCase()}
              </text>
              <text x="20" y="88" fill="#453f36" fontSize="13" fontWeight="900" letterSpacing="2">
                {translationEffects.find((effect) => effect.id === selectedPoint.effect)?.label.toUpperCase()} / WEIGHT {n(selectedPoint.weight)}
              </text>
            </g>
          )}
        </svg>
        <style>{`
          .translation-breath-dot {
            transform-box: fill-box;
            transform-origin: center;
            animation: translation-breathe 4.8s ease-in-out infinite;
          }

          .summary-bar-left,
          .summary-bar-right {
            transform-box: fill-box;
            transform-origin: center left;
            animation: translation-bar-draw 1.15s ease-out both;
          }

          .mono-title,
          .mono-note {
            font-family: var(--font-mono), ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          }

          @keyframes translation-breathe {
            0%, 100% { transform: scale(0.84); opacity: 0.34; }
            48% { transform: scale(1.16); opacity: 0.76; }
          }

          @keyframes translation-bar-draw {
            from { transform: scaleX(0); opacity: 0.18; }
            to { transform: scaleX(1); }
          }

          @media (prefers-reduced-motion: reduce) {
            .translation-breath-dot,
            .summary-bar-left,
            .summary-bar-right {
              animation: none;
            }
          }
        `}</style>
      </div>
    </div>
  );
}
