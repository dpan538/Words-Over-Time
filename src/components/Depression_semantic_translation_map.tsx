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
  experience: { label: "experience", color: "#1570AC" },
  clinical: { label: "clinical", color: "#7C345A" },
  measurement: { label: "measurement", color: "#0B7F73" },
  public_health: { label: "public health", color: "#596F82" },
  discourse: { label: "discourse", color: "#B05B2A" },
  stigma_help_seeking: { label: "stigma / help-seeking", color: "#6E6476" },
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

  const pointPositions = useMemo(() => {
    const groupIndex = new Map<string, number>();
    const positions = new Map<string, { x: number; y: number }>();

    translationEvidencePoints.forEach((point) => {
      const systemIndex = translationSystems.findIndex((system) => system.id === point.system);
      const effectIndex = translationEffects.findIndex((effect) => effect.id === point.effect);
      const groupKey = `${point.system}-${point.effect}`;
      const index = groupIndex.get(groupKey) ?? 0;
      groupIndex.set(groupKey, index + 1);
      const offset = pointOffsets[index % pointOffsets.length];
      positions.set(point.id, {
        x: chartLeft + systemIndex * colWidth + colWidth / 2 + offset.x,
        y: chartTop + effectIndex * rowHeight + rowHeight / 2 + offset.y,
      });
    });

    return positions;
  }, []);

  const pointById = useMemo(() => new Map(translationEvidencePoints.map((point) => [point.id, point])), []);
  const connectedIds = useMemo(() => {
    if (!active || active.kind !== "point") return new Set<string>();
    const ids = new Set<string>([active.id]);
    translationConnections.forEach((connection) => {
      if (connection.sourceId === active.id || connection.targetId === active.id) {
        ids.add(connection.sourceId);
        ids.add(connection.targetId);
      }
    });
    return ids;
  }, [active]);

  function activeMatches(point: TranslationEvidencePoint) {
    if (!active) return true;
    if (active.kind === "point") return connectedIds.has(point.id);
    if (active.kind === "system") return point.system === active.id;
    if (active.kind === "effect") return point.effect === active.id;
    if (active.kind === "category") return point.category === active.id;
    return true;
  }

  function setPoint(point: TranslationEvidencePoint) {
    setHovered({ kind: "point", id: point.id });
    onHover(translationPointInspectorId(point.id));
  }

  function clearActive() {
    setHovered(null);
    onHover(null);
  }

  return (
    <div className="relative bg-wheat py-0">
      <div className="depression-translation-scroll overflow-x-auto">
        <div className="relative min-w-[1160px] w-full">
          <svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            className="depression-translation-map h-auto w-full select-none"
            role="img"
            aria-label="Semantic translation matrix showing evidence fragments by system and translation effect"
            onMouseLeave={clearActive}
          >
            <defs>
              <pattern id="depression-translation-matrix-grid" width="58" height="58" patternUnits="userSpaceOnUse">
                <path d="M 58 0 L 0 0 0 58" fill="none" stroke={ink} strokeOpacity="0.026" strokeWidth="1" />
              </pattern>
            </defs>

            <rect width={WIDTH} height={HEIGHT} fill={paper} />
            <rect width={WIDTH} height={HEIGHT} fill="url(#depression-translation-matrix-grid)" />

            <g>
              {translationSystems.map((system, index) => {
                const x = chartLeft + index * colWidth;
                const activeColumn = active?.kind === "system" && active.id === system.id;
                return (
                  <g
                    key={system.id}
                    className="cursor-crosshair"
                    onMouseEnter={() => {
                      setHovered({ kind: "system", id: system.id });
                      onHover(translationSystemInspectorId(system.id));
                    }}
                    onClick={() => onInspect(translationSystemInspectorId(system.id))}
                  >
                    <rect x={x} y={chartTop - 78} width={colWidth} height={chartHeight + 98} fill={activeColumn ? ink : "transparent"} fillOpacity={activeColumn ? 0.035 : 0} />
                    <line x1={x} x2={x} y1={chartTop} y2={chartTop + chartHeight} stroke={ink} strokeOpacity="0.12" />
                    <text x={x + colWidth / 2} y={chartTop - 54} textAnchor="middle" fill={activeColumn ? ink : system.id === "public_discourse" ? "#B05B2A" : ink} opacity={activeColumn ? 0.94 : 0.78} fontFamily="monospace" fontSize="14" fontWeight="900" letterSpacing="1.1">
                      {String(index + 1).padStart(2, "0")} / {system.shortLabel.toUpperCase()}
                    </text>
                    {splitLabel(system.label, 18).map((line, lineIndex) => (
                      <text key={`${system.id}-${line}`} x={x + colWidth / 2} y={chartTop - 25 + lineIndex * 19} textAnchor="middle" fill={ink} opacity="0.86" fontFamily="Helvetica Neue, Helvetica, Arial, sans-serif" fontSize="16" fontWeight="900">
                        {line}
                      </text>
                    ))}
                  </g>
                );
              })}
              <line x1={chartLeft + chartWidth} x2={chartLeft + chartWidth} y1={chartTop} y2={chartTop + chartHeight} stroke={ink} strokeOpacity="0.12" />
            </g>

            <g>
              {translationEffects.map((effect, index) => {
                const y = chartTop + index * rowHeight;
                const activeRow = active?.kind === "effect" && active.id === effect.id;
                return (
                  <g
                    key={effect.id}
                    className="cursor-crosshair"
                    onMouseEnter={() => {
                      setHovered({ kind: "effect", id: effect.id });
                      onHover(translationEffectInspectorId(effect.id));
                    }}
                    onClick={() => onInspect(translationEffectInspectorId(effect.id))}
                  >
                    <rect x={chartLeft - 190} y={y} width={chartWidth + 190} height={rowHeight} fill={activeRow ? ink : "transparent"} fillOpacity={activeRow ? 0.035 : 0} />
                    <line x1={chartLeft} x2={chartLeft + chartWidth} y1={y} y2={y} stroke={ink} strokeOpacity="0.12" />
                    <text x={chartLeft - 24} y={y + 40} textAnchor="end" fill={activeRow ? ink : "#403E3B"} opacity={activeRow ? 0.94 : 0.82} fontFamily="Helvetica Neue, Helvetica, Arial, sans-serif" fontSize="20" fontWeight="900">
                      {effect.label}
                    </text>
                    <text x={chartLeft - 24} y={y + 66} textAnchor="end" fill={ink} opacity="0.52" fontFamily="monospace" fontSize="13" fontWeight="900" letterSpacing="0.45">
                      {effect.note}
                    </text>
                  </g>
                );
              })}
              <line x1={chartLeft} x2={chartLeft + chartWidth} y1={chartTop + chartHeight} y2={chartTop + chartHeight} stroke={ink} strokeOpacity="0.12" />
            </g>

            <g>
              {translationConnections.map((connection, index) => {
                const source = pointPositions.get(connection.sourceId);
                const target = pointPositions.get(connection.targetId);
                if (!source || !target) return null;
                const activeConnection =
                  active?.kind === "point" &&
                  (active.id === connection.sourceId || active.id === connection.targetId);
                const dimmed = Boolean(active && !activeConnection);
                const labelPoint = connectionLabelPoint(source, target, connection, index);
                return (
                  <g key={connection.id} opacity={dimmed ? 0.12 : 1}>
                    <path
                      d={connectionPath(source, target, index)}
                      fill="none"
                      stroke={ink}
                      strokeOpacity={activeConnection ? 0.42 : 0.18}
                      strokeWidth={n(activeConnection ? 1.6 + connection.strength * 1.7 : 1.1 + connection.strength)}
                      strokeDasharray="5 7"
                      strokeLinecap="round"
                    />
                    <text
                      x={n(labelPoint.x)}
                      y={n(labelPoint.y)}
                      textAnchor="middle"
                      fill={ink}
                      opacity={activeConnection ? 0.78 : 0.48}
                      fontFamily="monospace"
                      fontSize={activeConnection ? "12.5" : "11.8"}
                      fontWeight="900"
                      letterSpacing="0.35"
                      paintOrder="stroke"
                      stroke={paper}
                      strokeWidth="6"
                      strokeLinejoin="round"
                    >
                      {connection.label}
                    </text>
                  </g>
                );
              })}
            </g>

            <g>
              {translationEvidencePoints.map((point) => {
                const position = pointPositions.get(point.id);
                if (!position) return null;
                const category = translationCategoryStyles[point.category];
                const activePoint = active?.kind === "point" && active.id === point.id;
                const visible = activeMatches(point);
                const dimmed = Boolean(active && !visible);
                const showLabel = activePoint || (!active && point.defaultLabel);
                const radius = pointRadius(point);
                const labelOffset = labelOffsets[point.id] ?? { x: 0, y: -radius - 13, anchor: "middle" as const };
                const labelFontSize = activePoint ? 14 : 13;
                const labelBox = pointLabelBox(point.label, labelFontSize);
                const labelX = position.x + labelOffset.x;
                const labelY = position.y + labelOffset.y;
                return (
                  <g
                    key={point.id}
                    className="cursor-crosshair depression-translation-satellite"
                    opacity={dimmed ? 0.16 : activePoint ? 1 : active ? 0.84 : 0.78}
                    onMouseEnter={() => setPoint(point)}
                    onMouseMove={() => setPoint(point)}
                    onClick={() => onInspect(translationPointInspectorId(point.id))}
                  >
                    <circle cx={position.x} cy={position.y} r={radius + 9} fill="transparent" />
                    <circle
                      cx={position.x}
                      cy={position.y}
                      r={radius}
                      fill={category.color}
                      fillOpacity={activePoint ? 0.92 : 0.68}
                      stroke={activePoint ? ink : category.color}
                      strokeOpacity={activePoint ? 0.82 : 0.62}
                      strokeWidth={activePoint ? 2.3 : 1.1}
                    />
                    <circle cx={position.x} cy={position.y} r={Math.max(2.8, radius * 0.32)} fill={paper} fillOpacity={activePoint ? 0.88 : 0.54} />
                    {showLabel ? (
                      <g>
                        <rect
                          x={labelOffset.anchor === "end" ? labelX - labelBox.width : labelOffset.anchor === "start" ? labelX : labelX - labelBox.width / 2}
                          y={labelY - labelBox.height + 4}
                          width={labelBox.width}
                          height={labelBox.height}
                          rx="4"
                          fill={labelPaper}
                          fillOpacity={activePoint ? 0.9 : 0.76}
                          stroke={category.color}
                          strokeOpacity={activePoint ? 0.34 : 0.16}
                          strokeWidth="0.8"
                        />
                        <text
                          x={labelX}
                          y={labelY}
                          textAnchor={labelOffset.anchor ?? "middle"}
                          fill={ink}
                          opacity={activePoint ? 0.94 : 0.76}
                          fontFamily="monospace"
                          fontSize={labelFontSize}
                          fontWeight="900"
                          letterSpacing="0.2"
                        >
                          {point.label}
                        </text>
                      </g>
                    ) : null}
                  </g>
                );
              })}
            </g>

            <g transform="translate(278 758)">
              <line x1="0" x2="610" y1="0" y2="0" stroke={ink} strokeOpacity="0.24" strokeWidth="1.2" />
              <text x="0" y="30" fill={ink} opacity="0.68" fontFamily="monospace" fontSize="13" fontWeight="900" letterSpacing="0.45">
                <tspan x="0">Hover details appear in the fixed annotation strip at the bottom of the page.</tspan>
                <tspan x="0" dy="22">Matrix axes remain visible while the selected fragment is explained below.</tspan>
              </text>
            </g>

            <g transform="translate(1012 760)">
              <text x="0" y="0" fill={ink} opacity="0.62" fontFamily="monospace" fontSize="13" fontWeight="900" letterSpacing="1.2">
                CATEGORY
              </text>
              {(Object.keys(translationCategoryStyles) as EvidenceCategory[]).map((categoryId, index) => {
                const category = translationCategoryStyles[categoryId];
                const activeCategory = active?.kind === "category" && active.id === categoryId;
                const x = (index % 3) * 206;
                const y = 32 + Math.floor(index / 3) * 32;
                return (
                  <g
                    key={categoryId}
                    className="cursor-crosshair"
                    transform={`translate(${x} ${y})`}
                    opacity={active && !activeCategory ? 0.5 : 1}
                    onMouseEnter={() => {
                      setHovered({ kind: "category", id: categoryId });
                      onHover(translationCategoryInspectorId(categoryId));
                    }}
                    onClick={() => onInspect(translationCategoryInspectorId(categoryId))}
                  >
                    <circle cx="0" cy="-4" r={activeCategory ? 7 : 5.8} fill={category.color} fillOpacity="0.72" />
                    <text x="17" y="0" fill={ink} opacity={activeCategory ? 0.88 : 0.68} fontFamily="monospace" fontSize="13" fontWeight="900" letterSpacing="0.35">
                      {category.label.toUpperCase()}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>

        </div>
      </div>
    </div>
  );
}
