"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  DepressionAtmosphereLoop,
  atmosphereBridgeInspectorId,
  atmosphereBridges,
  atmosphereMarkerInspectorId,
  atmosphereMarkers,
  atmosphereSectorInspectorId,
  atmosphereSectors,
  type AtmosphereMarker,
  type BridgeLink,
  type SectorNode,
} from "@/components/DepressionAtmosphereLoop";
import {
  DepressionSemanticTranslationMap,
  translationCategoryInspectorId,
  translationCategoryStyles,
  translationEffectInspectorId,
  translationEffects,
  translationEvidencePoints,
  translationPointInspectorId,
  translationSystemInspectorId,
  translationSystems,
  type EvidenceCategory,
  type TranslationEffect,
  type TranslationEvidencePoint,
  type TranslationSystem,
} from "@/components/Depression_semantic_translation_map";
import {
  DepressionSemanticMachine,
  machineConnectors,
  machineConnectorInspectorId,
  machineGearInspectorId,
  machineGearNodes,
  machineOutputInspectorId,
  machineOutputNodes,
  machinePhases,
  machineRelationInspectorId,
  machineRelations,
  type GearConnector,
  type GearNode,
  type OutputNode,
} from "@/components/DepressionSemanticMachine";
import { DepressionSemanticPlate } from "@/components/DepressionSemanticPlate";
import {
  semanticRelationInspectorId,
  semanticRelationRoutes,
  type SemanticRelationRoute,
} from "@/components/DepressionSemanticPlate";
import { Nav } from "@/components/Nav";
import { PosterSection } from "@/components/PosterSection";
import type {
  DepressionBranchesFile,
  DepressionBranch,
  DepressionCoverageReport,
  DepressionEvidenceFile,
  DepressionEvidenceRecord,
  DepressionFrequencyFile,
  DepressionFrequencySeries,
  DepressionPrehistoryFile,
  DepressionPrehistoryRecord,
} from "@/types/depressionData";
import type { MachineRelation } from "@/types/depressionSemanticMachine";
import type { InspectorEntry } from "@/types/inspector";

type DepressionPosterProps = {
  frequency: DepressionFrequencyFile;
  prehistory: DepressionPrehistoryFile;
  branches: DepressionBranchesFile;
  evidence: DepressionEvidenceFile;
  coverage: DepressionCoverageReport;
};

type PointerPosition = { x: number; y: number };

function shortType(entry: InspectorEntry) {
  return `${entry.visualType} / ${entry.elementType}`
    .replace("Semantic Plate / ", "")
    .replace("Semantic Machine / ", "")
    .replace("semantic branch territory", "branch chamber")
    .replace("primary frequency plume", "frequency spine");
}

function valueLabel(entry: InspectorEntry) {
  if (entry.scoreValue !== undefined) return `${entry.scoreType ?? "value"}: ${entry.scoreValue}`;
  if (entry.evidenceCount) return `count: ${entry.evidenceCount}`;
  return entry.scoreType ?? "available evidence";
}

function closePinnedInspector(target: EventTarget | null) {
  if (!(target instanceof Element)) return true;
  return !target.closest(
    "[data-inspector-strip='true'], .cursor-crosshair, .cursor-grab, button, a, input, select, textarea",
  );
}

function DepressionAnnotationStrip({
  entry,
  pinned,
  onClose,
}: {
  entry?: InspectorEntry;
  pinned: boolean;
  onClose: () => void;
}) {
  if (!entry) return null;

  return (
    <div
      data-inspector-strip="true"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-ink bg-wheat px-4 py-3 text-ink shadow-[0_-4px_0_rgba(5,5,16,0.08)] sm:px-7 lg:px-10 xl:px-12"
    >
      <div className="mx-auto grid w-full max-w-[1960px] gap-3 font-mono text-[0.78rem] font-black uppercase leading-5 tracking-[0.08em] md:grid-cols-[minmax(12rem,1.1fr)_minmax(10rem,0.8fr)_minmax(10rem,0.9fr)_minmax(14rem,1.2fr)_auto] md:items-center">
        <div>
          <p className="text-nice">{pinned ? "selected" : "hover"}</p>
          <p className="mt-1 font-sans text-lg font-black normal-case leading-5 tracking-normal">
            {entry.title}
          </p>
        </div>
        <div>
          <p className="text-ink/42">type</p>
          <p>{shortType(entry)}</p>
        </div>
        <div>
          <p className="text-ink/42">era / value</p>
          <p>{entry.period} / {valueLabel(entry)}</p>
        </div>
        <div>
          <p className="text-ink/42">source / caveat</p>
          <p className="normal-case tracking-normal">
            {entry.sourceCorpus}; {entry.caveats[0] ?? "context-limited evidence"}
          </p>
        </div>
        {pinned ? (
          <button
            type="button"
            onClick={onClose}
            className="justify-self-start border border-ink px-3 py-2 text-[0.72rem] font-black uppercase tracking-[0.12em] transition hover:border-nice hover:text-nice md:justify-self-end"
          >
            close
          </button>
        ) : null}
      </div>
    </div>
  );
}

function frequencyInspectorId(seriesId: string) {
  return `depression-frequency-${seriesId}`;
}

function branchInspectorId(branchId: string) {
  return `depression-branch-${branchId}`;
}

function attestationInspectorId(recordId: string) {
  return `depression-attestation-${recordId}`;
}

function maxFrequency(series: DepressionFrequencySeries) {
  return Math.max(...series.points.map((point) => point.frequencyPerMillion), 0);
}

function branchSourceLabel(branchId: string) {
  if (branchId === "clinical") return "MeSH / PubMed / lexical sources";
  if (branchId === "economic") return "Ngram / Chronicling America / NBER";
  if (branchId === "modern_public_discourse") return "Wikinews / Wikipedia / NIMH / WHO";
  if (branchId === "melancholy_melancholia") return "Lexical sources / Gutenberg";
  return "Lexical sources / generated evidence";
}

function branchPeriod(branch: DepressionBranch) {
  return branch.periodOfImportance.replace("early modern onward", "early modern+");
}

function snippetPreview(record: DepressionEvidenceRecord) {
  if (!record.snippet) return record.caveat;
  return record.snippet.length > 170 ? `${record.snippet.slice(0, 167)}...` : record.snippet;
}

function machinePhaseSummary(node: GearNode) {
  return machinePhases
    .map((phase) => `${phase.label} ${Math.round(node.phaseEmphasis[phase.id] * 100)}%`)
    .join(" / ");
}

function machineSystemLabel(system: GearNode["system"]) {
  if (system === "internal") return "expert / institutional gear";
  if (system === "external") return "public / lived / social gear";
  if (system === "translator") return "translator / idler gear";
  return "central master gear";
}

function makeFrequencyEntry(series: DepressionFrequencySeries): InspectorEntry {
  return {
    id: frequencyInspectorId(series.id),
    title: series.label,
    visualType: "Semantic Plate",
    elementType: series.id === "depression" ? "primary frequency plume" : "control frequency trace",
    period: `${series.startYear}-${series.endYear}`,
    dataLayer: "computed",
    selectionReason:
      series.id === "depression"
        ? "Shown as the central vertical frequency field for the shared written form."
        : "Shown as a secondary comparison trace around the semantic spine.",
    evidenceCount: series.points.filter((point) => point.frequencyPerMillion > 0).length,
    scoreType: "max per million",
    scoreValue: Number(maxFrequency(series).toFixed(3)),
    sourceCorpus: series.source,
    coverageRange: `${series.startYear}-${series.endYear}`,
    relatedSnippetIds: [],
    rawInputs: [
      { label: "Query", value: series.query },
      { label: "Corpus", value: series.corpus },
      { label: "Smoothing", value: series.smoothing },
    ],
    derivedValues: [
      { label: "First nonzero Ngram year", value: series.firstNonZeroYear ?? "none" },
      { label: "Usability", value: series.usabilityStatus },
    ],
    curatedDecisions: [{ label: "Visual role", value: series.comparisonRole }],
    visualMapping:
      "Year is vertical position. Frequency controls distance from the central spine, forming a plume rather than a conventional x-y plot.",
    explanation: series.coverageNote,
    sources: [{ label: series.source, dateRange: `${series.startYear}-${series.endYear}` }],
    caveats: [series.semanticCaveat],
  };
}

function makeBranchEntry(branch: DepressionBranch, evidenceRecords: DepressionEvidenceRecord[]): InspectorEntry {
  const years = evidenceRecords.map((record) => record.year).filter((year): year is number => typeof year === "number");
  const earliest = years.length ? Math.min(...years) : "unknown";
  const latest = years.length ? Math.max(...years) : "unknown";
  return {
    id: branchInspectorId(branch.id),
    title: branch.label,
    visualType: "Semantic Plate",
    elementType: "semantic branch territory",
    period: branch.periodOfImportance,
    dataLayer: "curated",
    selectionReason: "Shown as a frozen editorial branch ID for the depression page.",
    evidenceCount: evidenceRecords.length,
    scoreType: "supporting evidence records",
    scoreValue: evidenceRecords.length,
    sourceCorpus: branchSourceLabel(branch.id),
    coverageRange: `${earliest}-${latest}`,
    relatedSnippetIds: evidenceRecords.slice(0, 8).map((record) => record.id),
    rawInputs: [
      { label: "Branch ID", value: branch.id },
      { label: "Tier", value: branch.tier },
      { label: "Supporting terms", value: branch.supportingTerms.join(", ") },
    ],
    derivedValues: [
      { label: "Evidence records", value: evidenceRecords.length },
      { label: "Coverage", value: `${earliest}-${latest}` },
    ],
    curatedDecisions: [
      { label: "Visual use", value: branch.visualUse },
      { label: "Role", value: branch.role },
    ],
    visualMapping:
      "Branch territories emerge from the vertical spine near the approximate period where that branch becomes visible in the current evidence model.",
    explanation: branch.caveat,
    sources: [{ label: branchSourceLabel(branch.id), dateRange: branchPeriod(branch) }],
    caveats: [branch.caveat, "Branch tags are editorial and confidence-aware, not automatic sense classification."],
  };
}

function makeAttestationEntry(record: DepressionPrehistoryRecord): InspectorEntry {
  return {
    id: attestationInspectorId(record.id),
    title: `${record.form} / ${record.dateLabel}`,
    visualType: "Semantic Plate",
    elementType: record.evidenceType.replaceAll("-", " "),
    period: record.dateLabel,
    dataLayer: "curated",
    selectionReason: "Shown as a ring on the historical spine because it marks lexical or sense-history evidence.",
    evidenceCount: 1,
    scoreType: record.verificationStatus,
    sourceCorpus: record.sourceName,
    coverageRange: record.dateLabel,
    relatedSnippetIds: [],
    rawInputs: [
      { label: "Form", value: record.form },
      { label: "Approximate year", value: record.yearApproximation },
      { label: "Sense branch", value: record.senseBranch },
    ],
    derivedValues: [{ label: "Confidence", value: record.confidence }],
    curatedDecisions: [{ label: "Evidence type", value: record.evidenceType }],
    visualMapping: "Approximate year maps to vertical position. Ring style marks attestation or sense-history evidence.",
    explanation: record.caveat,
    sources: [{ label: record.sourceName, url: record.sourceUrl, dateRange: record.dateLabel }],
    caveats: [record.caveat],
  };
}

function makeEvidenceEntry(record: DepressionEvidenceRecord): InspectorEntry {
  return {
    id: record.id,
    title: record.term,
    visualType: "Semantic Plate",
    elementType: record.evidenceType.replaceAll("_", " "),
    period: record.year ? String(record.year) : "undated",
    dataLayer: record.sourceLayer === "attestation" ? "curated" : record.sourceLayer.includes("bibliography") ? "computed" : "raw",
    selectionReason: "Shown as one point inside a branch evidence field.",
    evidenceCount: 1,
    scoreType: record.sourceLayer,
    scoreValue: record.displayPriority,
    sourceCorpus: record.source,
    coverageRange: record.year ? String(record.year) : "undated",
    relatedSnippetIds: [record.id],
    rawInputs: [
      { label: "Term", value: record.term },
      { label: "Branch", value: record.branchTag },
      { label: "Source layer", value: record.sourceLayer },
    ],
    derivedValues: [
      { label: "Display priority", value: record.displayPriority },
      { label: "Confidence", value: record.confidence },
    ],
    curatedDecisions: [{ label: "Related role", value: record.relatedRole ?? "evidence record" }],
    visualMapping: "Year controls vertical placement. Branch tag controls the surrounding territory. Source layer controls the mark shape.",
    explanation: snippetPreview(record),
    sources: [{ label: record.source, url: record.sourceUrl, rightsStatus: record.rightsState }],
    caveats: [record.caveat],
  };
}

function makePlateRelationEntry(route: SemanticRelationRoute): InspectorEntry {
  return {
    id: semanticRelationInspectorId(route.id),
    title: route.label,
    visualType: "Semantic Plate",
    elementType: "semantic relation",
    period: route.period,
    dataLayer: "interpretive",
    selectionReason: "Shown as a dotted relation between two branch chambers in the historical-semantic plate.",
    evidenceCount: Math.round(route.strength * 100),
    scoreType: "relation weight",
    scoreValue: Number((route.strength * 100).toFixed(0)),
    sourceCorpus: "curated branch model / normalized evidence",
    coverageRange: route.period,
    relatedSnippetIds: [],
    rawInputs: [
      { label: "Source branch", value: route.source.replaceAll("_", " ") },
      { label: "Target branch", value: route.target.replaceAll("_", " ") },
    ],
    derivedValues: [{ label: "Relation strength", value: `${Math.round(route.strength * 100)}%` }],
    curatedDecisions: [{ label: "Relation logic", value: route.logic }],
    visualMapping:
      "Dotted curves mark semantic adjacency or transfer pressure. Stroke weight maps to the curated relation strength.",
    explanation: route.logic,
    sources: [{ label: "Editorial synthesis from branch evidence and lexical history", dateRange: route.period }],
    caveats: [route.caveat],
  };
}

function makeMachineGearEntry(node: GearNode): InspectorEntry {
  return {
    id: machineGearInspectorId(node.id),
    title: node.label,
    visualType: "Semantic Machine",
    elementType: machineSystemLabel(node.system),
    period: "1900-2026",
    dataLayer: "interpretive",
    selectionReason: "Shown as a functional subsystem in the modern semantic transmission machine.",
    evidenceCount: Math.round(node.weight * 100),
    scoreType: "semantic weight / teeth",
    scoreValue: node.teeth,
    sourceCorpus: "curated modern depression evidence layers",
    coverageRange: "1900-2026",
    relatedSnippetIds: [],
    rawInputs: [
      { label: "System", value: node.system },
      { label: "Texture", value: node.texture },
      { label: "Gear teeth", value: node.teeth },
    ],
    derivedValues: [
      { label: "Semantic weight", value: `${Math.round(node.weight * 100)}%` },
      { label: "Phase emphasis", value: machinePhaseSummary(node) },
    ],
    curatedDecisions: [
      { label: "Visual role", value: machineSystemLabel(node.system) },
      { label: "Transmission role", value: node.role },
    ],
    visualMapping:
      "Gear size maps to semantic weight. Teeth map to branching complexity. Ring segments map to modern phase emphasis.",
    explanation: node.role,
    sources: [{ label: "Clinical, modern context, public-health, and normalized evidence layers", dateRange: "1900-2026" }],
    caveats: [node.caveat ?? "interpretive system map, not direct causal proof"],
  };
}

function makeMachineConnectorEntry(connector: GearConnector): InspectorEntry {
  return {
    id: machineConnectorInspectorId(connector.id),
    title: connector.label ?? connector.id.replaceAll("_", " "),
    visualType: "Semantic Machine",
    elementType: `${connector.variant} semantic coupling`,
    period: "1900-2026",
    dataLayer: "interpretive",
    selectionReason: "Shown as a transmission path between semantic or institutional subsystems.",
    evidenceCount: Math.round(connector.strength * 100),
    scoreType: "transmission strength",
    scoreValue: Number((connector.strength * 100).toFixed(0)),
    sourceCorpus: "curated modern depression evidence layers",
    coverageRange: "1900-2026",
    relatedSnippetIds: [],
    rawInputs: [
      { label: "Source gear", value: connector.source.replaceAll("_", " ") },
      { label: "Target gear", value: connector.target.replaceAll("_", " ") },
      { label: "Connector variant", value: connector.variant },
    ],
    derivedValues: [{ label: "Strength", value: `${Math.round(connector.strength * 100)}%` }],
    curatedDecisions: [{ label: "Transmission logic", value: connector.logic }],
    visualMapping:
      "Connector thickness maps to transmission strength. Solid, dashed, and thin strokes distinguish primary, indirect, and contextual coupling.",
    explanation: connector.logic,
    sources: [{ label: "Interpretive synthesis from clinical, modern, and normalized depression evidence layers", dateRange: "1900-2026" }],
    caveats: ["interpretive system map, not direct causal proof"],
  };
}

function makeMachineRelationEntry(relation: MachineRelation): InspectorEntry {
  return {
    id: machineRelationInspectorId(relation.id),
    title: relation.id.replace(/^rel_/, "").replaceAll("_", " "),
    visualType: "Semantic Machine",
    elementType: relation.type.replaceAll("_", " "),
    period: "1900-2026",
    dataLayer: "interpretive",
    selectionReason: "Shown as a curated relation group in the semantic transmission machine.",
    evidenceCount: relation.evidence_refs.length,
    scoreType: "curated strength",
    scoreValue: Number((relation.strength_score * 100).toFixed(0)),
    sourceCorpus: relation.evidence_refs.join(" / "),
    coverageRange: "1900-2026",
    relatedSnippetIds: [],
    rawInputs: [
      { label: "Sources", value: relation.source_nodes.map((node) => node.replaceAll("_", " ")).join(", ") },
      { label: "Targets", value: relation.target_nodes.map((node) => node.replaceAll("_", " ")).join(", ") },
      { label: "Direction", value: relation.directionality_hint },
    ],
    derivedValues: [
      { label: "Relation type", value: relation.type },
      { label: "Curated strength", value: `${Math.round(relation.strength_score * 100)}%` },
    ],
    curatedDecisions: [
      { label: "Visual treatment", value: relation.suggested_visual_treatment },
      { label: "Motion behavior", value: relation.suggested_motion_behaviour },
    ],
    visualMapping:
      "Relation type controls connector form and motion propagation. Strength is curation confidence and visual prominence, not measured causal effect size.",
    explanation: relation.short_explanation,
    sources: relation.evidence_refs.map((ref) => ({ label: ref, dateRange: "curated relation evidence" })),
    caveats: ["interpretive system map, not direct causal proof"],
  };
}

function makeMachineOutputEntry(output: OutputNode): InspectorEntry {
  return {
    id: machineOutputInspectorId(output.id),
    title: output.label,
    visualType: "Semantic Machine",
    elementType: "machine output / social response",
    period: "1900-2026",
    dataLayer: "interpretive",
    selectionReason: "Shown as a social output produced by coupled semantic and institutional transmission.",
    evidenceCount: Math.round(output.strength * 100),
    scoreType: "output strength",
    scoreValue: Number((output.strength * 100).toFixed(0)),
    sourceCorpus: "curated modern depression evidence layers",
    coverageRange: "1900-2026",
    relatedSnippetIds: [],
    rawInputs: [{ label: "Related gears", value: output.relatedGears.map((gear) => gear.replaceAll("_", " ")).join(", ") }],
    derivedValues: [{ label: "Output strength", value: `${Math.round(output.strength * 100)}%` }],
    curatedDecisions: [{ label: "Visual role", value: "bottom output strip" }],
    visualMapping:
      "Output strip items show social effects rather than a timeline. Filled bars map to relative output strength.",
    explanation: "A social effect produced by coupled expert, public, lived, and institutional language.",
    sources: [{ label: "Interpretive synthesis from modern context and normalized evidence layers", dateRange: "1900-2026" }],
    caveats: ["interpretive system map, not direct causal proof"],
  };
}

function laneLabel(lane: AtmosphereMarker["lane"]) {
  if (lane === "expert") return "expert trace";
  if (lane === "media") return "media circulation";
  return "lived uptake";
}

function sourceTypeLabel(sourceType: AtmosphereMarker["sourceType"]) {
  if (sourceType === "pubmed") return "PubMed / expert";
  if (sourceType === "news") return "news / media";
  if (sourceType === "archive") return "archive / historical public record";
  return "public / lived expression";
}

function makeAtmosphereSectorEntry(sector: SectorNode): InspectorEntry {
  const markers = atmosphereMarkers.filter((marker) => marker.sectorId === sector.id);
  const laneCounts = (["expert", "media", "lived"] as const)
    .map((lane) => `${laneLabel(lane)} ${markers.filter((marker) => marker.lane === lane).length}`)
    .join(" / ");

  return {
    id: atmosphereSectorInspectorId(sector.id),
    title: sector.label,
    visualType: "Social Atmosphere Loop",
    elementType: "semantic-social sector",
    period: "1900-2026",
    dataLayer: "interpretive",
    selectionReason: "Shown as one social domain where modern depression circulates beyond strict diagnosis.",
    evidenceCount: markers.length,
    scoreType: "generalization strength",
    scoreValue: Number((sector.generalization * 100).toFixed(0)),
    sourceCorpus: "curated modern depression evidence layers",
    coverageRange: "1900-2026",
    relatedSnippetIds: markers.map((marker) => marker.id),
    rawInputs: [
      { label: "Sector ID", value: sector.id },
      { label: "Filter group", value: sector.filterGroup },
      { label: "Keywords", value: sector.keywords.join(", ") },
    ],
    derivedValues: [
      { label: "Lane strengths", value: laneCounts },
      { label: "Semantic weight", value: `${Math.round(sector.weight * 100)}%` },
    ],
    curatedDecisions: [
      { label: "Visual role", value: "arc sector in a circulating social atmosphere ring" },
      { label: "Generalization role", value: sector.description },
    ],
    visualMapping:
      "Arc length maps to semantic relevance. Ring thickness maps to generalization strength. Three internal lanes show expert, media, and lived circulation.",
    explanation: sector.description,
    sources: [{ label: "Interpretive synthesis from clinical, modern, public, and economic evidence layers", dateRange: "1900-2026" }],
    caveats: ["generalization map, not prevalence measurement"],
  };
}

function makeAtmosphereMarkerEntry(marker: AtmosphereMarker): InspectorEntry {
  const sector = atmosphereSectors.find((item) => item.id === marker.sectorId);
  return {
    id: atmosphereMarkerInspectorId(marker.id),
    title: marker.phraseCluster[0] ?? marker.id.replaceAll("-", " "),
    visualType: "Social Atmosphere Loop",
    elementType: `${marker.kind} evidence aggregate`,
    period: "1900-2026",
    dataLayer: "interpretive",
    selectionReason: "Shown as a clustered evidence point inside one source lane, not as a single raw snippet.",
    evidenceCount: Math.round(marker.magnitude * 100),
    scoreType: "approximate density",
    scoreValue: Number((marker.magnitude * 100).toFixed(0)),
    sourceCorpus: sourceTypeLabel(marker.sourceType),
    coverageRange: "1900-2026",
    relatedSnippetIds: [marker.id],
    rawInputs: [
      { label: "Sector", value: sector?.label ?? marker.sectorId },
      { label: "Lane", value: laneLabel(marker.lane) },
      { label: "Phrase cluster", value: marker.phraseCluster.join(", ") },
    ],
    derivedValues: [
      { label: "Marker kind", value: marker.kind },
      { label: "Source type", value: sourceTypeLabel(marker.sourceType) },
      { label: "Approximate density", value: `${Math.round(marker.magnitude * 100)}%` },
    ],
    curatedDecisions: [{ label: "Visual role", value: "aggregate mark in the expert-media-lived diffusion path" }],
    visualMapping:
      "Lane controls radial position. Angle places the marker within its social domain. Marker size maps to approximate phrase-cluster density.",
    explanation:
      marker.phraseCluster.length > 1
        ? `${laneLabel(marker.lane)} cluster: ${marker.phraseCluster.join(", ")}.`
        : `${laneLabel(marker.lane)} cluster for ${sector?.label ?? "social atmosphere"}.`,
    sources: [{ label: sourceTypeLabel(marker.sourceType), dateRange: "1900-2026" }],
    caveats: ["aggregated phrase cluster, not a raw citation or prevalence count"],
  };
}

function makeAtmosphereBridgeEntry(bridge: BridgeLink): InspectorEntry {
  const from = atmosphereSectors.find((sector) => sector.id === bridge.fromSector);
  const to = atmosphereSectors.find((sector) => sector.id === bridge.toSector);
  return {
    id: atmosphereBridgeInspectorId(bridge.id),
    title: `${from?.shortLabel ?? bridge.fromSector} -> ${to?.shortLabel ?? bridge.toSector}`,
    visualType: "Social Atmosphere Loop",
    elementType: "semantic circulation bridge",
    period: "1900-2026",
    dataLayer: "interpretive",
    selectionReason: "Shown as a circulation path between social domains, emphasizing diffusion rather than direct causality.",
    evidenceCount: Math.round(bridge.strength * 100),
    scoreType: "circulation strength",
    scoreValue: Number((bridge.strength * 100).toFixed(0)),
    sourceCorpus: "curated modern depression evidence layers",
    coverageRange: "1900-2026",
    relatedSnippetIds: [],
    rawInputs: [
      { label: "From sector", value: from?.label ?? bridge.fromSector },
      { label: "To sector", value: to?.label ?? bridge.toSector },
      { label: "Bridge label", value: bridge.label },
    ],
    derivedValues: [{ label: "Strength", value: `${Math.round(bridge.strength * 100)}%` }],
    curatedDecisions: [{ label: "Circulation logic", value: bridge.label }],
    visualMapping:
      "Bridge thickness maps to circulation strength. Curved paths imply semantic flow across sectors, not mechanical causation.",
    explanation: bridge.label,
    sources: [{ label: "Interpretive synthesis from modern context and normalized evidence layers", dateRange: "1900-2026" }],
    caveats: ["semantic circulation, not direct causal proof"],
  };
}

function translationSystemLabel(systemId: TranslationSystem) {
  return translationSystems.find((system) => system.id === systemId)?.label ?? systemId;
}

function translationEffectLabel(effectId: TranslationEffect) {
  return translationEffects.find((effect) => effect.id === effectId)?.label ?? effectId;
}

function makeTranslationPointEntry(point: TranslationEvidencePoint): InspectorEntry {
  return {
    id: translationPointInspectorId(point.id),
    title: point.label,
    visualType: "Semantic Translation Matrix",
    elementType: "semantic fragment point",
    period: "1900-2026",
    dataLayer: "interpretive",
    selectionReason:
      "Plotted as a curated semantic fragment by system, translation effect, evidence category, and salience.",
    evidenceCount: 1,
    scoreType: "salience weight",
    scoreValue: Number((point.weight * 100).toFixed(0)),
    sourceCorpus: "curated depression semantic synthesis",
    coverageRange: "1900-2026",
    relatedSnippetIds: [],
    rawInputs: [
      { label: "System", value: translationSystemLabel(point.system) },
      { label: "Translation effect", value: translationEffectLabel(point.effect) },
      { label: "Category", value: translationCategoryStyles[point.category].label },
    ],
    derivedValues: [{ label: "Point size", value: `${Math.round(point.weight * 100)}% salience` }],
    curatedDecisions: [{ label: "Fragment label", value: point.label }],
    visualMapping:
      "Horizontal position maps to translation system. Vertical position maps to translation effect. Color maps to category. Size maps to curated salience.",
    explanation: point.description,
    sources: [{ label: "Interpretive synthesis from depression evidence layers", dateRange: "1900-2026" }],
    caveats: ["Curated semantic placement, not a statistical embedding or causal estimate."],
  };
}

function makeTranslationSystemEntry(system: { id: TranslationSystem; label: string; shortLabel: string }): InspectorEntry {
  const points = translationEvidencePoints.filter((point) => point.system === system.id);
  return {
    id: translationSystemInspectorId(system.id),
    title: system.label,
    visualType: "Semantic Translation Matrix",
    elementType: "system column",
    period: "1900-2026",
    dataLayer: "interpretive",
    selectionReason: "Shown as one translation system through which the word depression becomes differently legible.",
    evidenceCount: points.length,
    scoreType: "fragments in column",
    scoreValue: points.length,
    sourceCorpus: "curated depression semantic synthesis",
    coverageRange: "1900-2026",
    relatedSnippetIds: [],
    rawInputs: [{ label: "System ID", value: system.id }],
    derivedValues: [{ label: "Fragments", value: points.map((point) => point.label).join(", ") }],
    curatedDecisions: [{ label: "Column role", value: system.shortLabel }],
    visualMapping: "Columns group semantic fragments by the system that translates the word.",
    explanation: "This column collects fragments assigned to the same translation system.",
    sources: [{ label: "Interpretive synthesis from depression evidence layers", dateRange: "1900-2026" }],
    caveats: ["Column order is interpretive, not a causal sequence."],
  };
}

function makeTranslationEffectEntry(effect: { id: TranslationEffect; label: string; note: string }): InspectorEntry {
  const points = translationEvidencePoints.filter((point) => point.effect === effect.id);
  return {
    id: translationEffectInspectorId(effect.id),
    title: effect.label,
    visualType: "Semantic Translation Matrix",
    elementType: "translation effect row",
    period: "1900-2026",
    dataLayer: "interpretive",
    selectionReason: "Shown as one kind of semantic change that can happen as depression moves between systems.",
    evidenceCount: points.length,
    scoreType: "fragments in row",
    scoreValue: points.length,
    sourceCorpus: "curated depression semantic synthesis",
    coverageRange: "1900-2026",
    relatedSnippetIds: [],
    rawInputs: [{ label: "Effect ID", value: effect.id }],
    derivedValues: [{ label: "Row note", value: effect.note }],
    curatedDecisions: [{ label: "Fragments", value: points.map((point) => point.label).join(", ") }],
    visualMapping: "Rows group fragments by translation effect: preserved, standardized, compressed, amplified, distorted, or recirculated.",
    explanation: effect.note,
    sources: [{ label: "Interpretive synthesis from depression evidence layers", dateRange: "1900-2026" }],
    caveats: ["Effect labels are interpretive categories, not mutually exclusive clinical classes."],
  };
}

function makeTranslationCategoryEntry(categoryId: EvidenceCategory): InspectorEntry {
  const category = translationCategoryStyles[categoryId];
  const points = translationEvidencePoints.filter((point) => point.category === categoryId);
  return {
    id: translationCategoryInspectorId(categoryId),
    title: category.label,
    visualType: "Semantic Translation Matrix",
    elementType: "evidence category color",
    period: "1900-2026",
    dataLayer: "interpretive",
    selectionReason: "Shown as the color family for a curated category of semantic fragments.",
    evidenceCount: points.length,
    scoreType: "colored fragments",
    scoreValue: points.length,
    sourceCorpus: "curated depression semantic synthesis",
    coverageRange: "1900-2026",
    relatedSnippetIds: [],
    rawInputs: [{ label: "Category ID", value: categoryId }],
    derivedValues: [{ label: "Color", value: category.color }],
    curatedDecisions: [{ label: "Fragments", value: points.map((point) => point.label).join(", ") }],
    visualMapping: "Color groups fragments by evidence category while position carries system and effect.",
    explanation: `This color marks ${category.label} fragments in the translation matrix.`,
    sources: [{ label: "Interpretive synthesis from depression evidence layers", dateRange: "1900-2026" }],
    caveats: ["Category color is a reading aid, not a statistical class assignment."],
  };
}

export function DepressionPoster({
  frequency,
  prehistory,
  branches,
  evidence,
  coverage,
}: DepressionPosterProps) {
  const [hoveredInspectorId, setHoveredInspectorId] = useState<string | null>(null);
  const [pinnedInspectorId, setPinnedInspectorId] = useState<string | null>(null);

  const inspectorById = useMemo(() => {
    const entries = [
      ...frequency.series.map(makeFrequencyEntry),
      ...branches.branches.map((branch) =>
        makeBranchEntry(
          branch,
          evidence.evidence.filter((record) => record.branchTag === branch.id),
        ),
      ),
      ...prehistory.records.map(makeAttestationEntry),
      ...evidence.evidence.map(makeEvidenceEntry),
      ...semanticRelationRoutes.map(makePlateRelationEntry),
      ...machineGearNodes.map(makeMachineGearEntry),
      ...machineRelations.map(makeMachineRelationEntry),
      ...machineConnectors.map(makeMachineConnectorEntry),
      ...machineOutputNodes.map(makeMachineOutputEntry),
      ...atmosphereSectors.map(makeAtmosphereSectorEntry),
      ...atmosphereMarkers.map(makeAtmosphereMarkerEntry),
      ...atmosphereBridges.map(makeAtmosphereBridgeEntry),
      ...translationEvidencePoints.map(makeTranslationPointEntry),
      ...translationSystems.map(makeTranslationSystemEntry),
      ...translationEffects.map(makeTranslationEffectEntry),
      ...(Object.keys(translationCategoryStyles) as EvidenceCategory[]).map(makeTranslationCategoryEntry),
    ];
    return new Map(entries.map((entry) => [entry.id, entry]));
  }, [branches.branches, evidence.evidence, frequency.series, prehistory.records]);

  const activeInspectorId = pinnedInspectorId ?? hoveredInspectorId ?? undefined;
  const activeEntry = activeInspectorId ? inspectorById.get(activeInspectorId) : undefined;

  const handleHover = (inspectorId: string | null, position?: PointerPosition) => {
    if (pinnedInspectorId) return;
    setHoveredInspectorId(inspectorId);
  };

  const handleInspect = (inspectorId: string, position?: PointerPosition) => {
    setPinnedInspectorId(inspectorId);
    setHoveredInspectorId(null);
  };

  return (
    <main
      className="min-h-screen bg-wheat text-ink"
      onPointerDownCapture={(event) => {
        if (!pinnedInspectorId) return;
        if (closePinnedInspector(event.target)) {
          setPinnedInspectorId(null);
          setHoveredInspectorId(null);
        }
      }}
    >
      <div className="mx-auto flex w-full max-w-[1960px] flex-col px-4 py-5 sm:px-7 lg:px-10 xl:px-12">
        <Nav />

        <section className="relative overflow-hidden border-y border-ink py-8 sm:py-10 lg:py-12">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(5,5,16,0.09)_1px,transparent_1px),linear-gradient(180deg,rgba(5,5,16,0.07)_1px,transparent_1px)] bg-[size:72px_72px]" />
          <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end">
            <div>
              <div className="flex items-center gap-5">
                <p className="font-mono text-[0.82rem] font-black uppercase tracking-[0.18em] text-nice">
                  Words Over Time / word page
                </p>
              </div>
              <h1 className="mt-6 max-w-[72rem] text-[clamp(4.4rem,12.2vw,13.2rem)] font-black leading-[0.76] tracking-normal text-nice">
                depression
              </h1>
              <p className="mt-14 max-w-6xl text-[clamp(1.15rem,2.2vw,2.85rem)] font-black leading-[1.04] text-ink">
                A record of how one word branches through seven centuries,
                from loweredness and melancholy to economy, diagnosis, and
                public discourse.
              </p>
            </div>

            <dl className="grid border-y border-ink bg-wheat/74">
              {[
                ["ngram", `${frequency.source.startYear}-${frequency.source.endYear}`],
                ["lexical", `${prehistory.coverage.earliestApproximateYear}-${prehistory.coverage.latestApproximateYear}`],
                ["archive", `${coverage.layerCoverage.archivalContext.coverage.startYear}-${coverage.layerCoverage.archivalContext.coverage.endYear}`],
                ["modern", `${coverage.layerCoverage.modernContext.coverage.startYear}-${coverage.layerCoverage.modernContext.coverage.endYear}`],
              ].map(([label, value], index) => (
                <div
                  key={label}
                  className={`grid grid-cols-[7.25rem_1fr] border-ink ${
                    index < 3 ? "border-b" : ""
                  }`}
                >
                  <dt className="border-r border-ink px-3 py-3 font-mono text-[0.74rem] font-black uppercase leading-5 tracking-[0.14em] text-nice">
                    {label}
                  </dt>
                  <dd className="px-3 py-3 font-mono text-[0.8rem] font-black uppercase leading-5 tracking-[0.1em]">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <div className="mt-10 min-w-0">
          <PosterSection
            eyebrow="01 / HISTORICAL SEMANTIC PLATE"
            title="Geometric semantic anatomy"
            intro="The spine runs from c.1300 to the present. Branches mark where a sense of the word first becomes visible in the evidence. Width reflects corpus frequency, not importance."
          >
            <DepressionSemanticPlate
              frequency={frequency}
              prehistory={prehistory}
              branches={branches}
              evidence={evidence}
              activeInspectorId={activeInspectorId}
              onHover={handleHover}
              onInspect={handleInspect}
            />
          </PosterSection>

          <PosterSection
            eyebrow="02 / MODERN SEMANTIC MACHINE"
            title="Depression as a semantic machine"
            intro="Each gear is a subsystem through which depression passes in modern usage. Gear size maps to semantic weight. Motion travels only through explicit relation groups; the center is a hinge, not the engine."
          >
            <DepressionSemanticMachine
              activeInspectorId={activeInspectorId}
              onHover={handleHover}
              onInspect={handleInspect}
            />
          </PosterSection>

          <div className="pb-0 pt-8 sm:pt-10">
            <p className="max-w-[1040px] text-[1.08rem] leading-[1.55] text-ink/68">
              The machine shows how the word is held in place. But depression
              also keeps moving, outward into social life, loosened from any
              single system. The next loop maps that diffusion: through affect,
              economy, burnout, media, and care.
            </p>
          </div>

          <div id="chart-03">
            <PosterSection
              eyebrow="03 / SOCIAL ATMOSPHERE LOOP"
              title="Depression as a social atmosphere"
            >
              <DepressionAtmosphereLoop
                activeInspectorId={activeInspectorId}
                onHover={handleHover}
                onInspect={handleInspect}
              />
            </PosterSection>
          </div>

          <div className="pb-0 pt-8 sm:pt-10">
            <p className="max-w-[1040px] text-[1.08rem] leading-[1.55] text-ink/68">
              Each domain reshapes what the word can do. What stays intact in
              lived experience gets compressed in clinical measurement,
              amplified in public health reporting, or distorted by the time it
              reaches media circulation. The matrix records those changes.
            </p>
          </div>

          <div id="chart-04">
            <PosterSection
              eyebrow="04 / SEMANTIC TRANSLATION"
              title="What changes when depression moves between systems?"
              intro="Each point is a piece of the word, placed by the system it passed through and what happened to it there. Where fragments gather, the word is most stable. Where they thin out or distort, something is lost or bent."
            >
              <DepressionSemanticTranslationMap
                activeInspectorId={activeInspectorId}
                onHover={handleHover}
                onInspect={handleInspect}
              />
            </PosterSection>
          </div>

          <div className="pb-8 pt-10 sm:pt-12">
            <div className="mt-4 flex flex-wrap gap-4 border-t border-ink/80 pt-4 font-mono text-[0.8rem] font-black uppercase tracking-[0.13em]">
              <Link href="/" className="border-b border-ink pb-1 transition hover:border-blaze hover:text-blaze">
                Back home
              </Link>
              <Link href="/about" className="border-b border-ink pb-1 transition hover:border-blaze hover:text-blaze">
                About methodology
              </Link>
            </div>
          </div>
        </div>
      </div>

      <DepressionAnnotationStrip
        entry={activeEntry}
        pinned={Boolean(pinnedInspectorId)}
        onClose={() => {
          setPinnedInspectorId(null);
          setHoveredInspectorId(null);
        }}
      />
    </main>
  );
}
