"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { EraSwitcher } from "@/components/EraSwitcher";
import { EvidenceArchive } from "@/components/EvidenceArchive";
import { FrequencyTimeline } from "@/components/FrequencyTimeline";
import { MiniInspectorMenu } from "@/components/MiniInspectorMenu";
import { Nav } from "@/components/Nav";
import { PosterSection } from "@/components/PosterSection";
import { RelationalConstellation } from "@/components/RelationalConstellation";
import { ContextSignalField } from "@/components/ContextSignalField";
import { VariantDriftField } from "@/components/VariantDriftField";
import type {
  ForeverEraId,
  ForeverGeneratedDataset,
} from "@/types/foreverRealData";
import type { InspectorEntry } from "@/types/inspector";
import type { SelectedItem, SelectedLayer } from "@/types/visualSelection";

type ForeverPosterProps = {
  dataset: ForeverGeneratedDataset;
};

type NarrativeBridgeProps = {
  children: string;
};

function NarrativeBridge({ children }: NarrativeBridgeProps) {
  return (
    <div className="mb-10 mt-12 w-full sm:mb-11 sm:mt-14 lg:mb-12 lg:mt-14">
      <p className="text-[clamp(1.08rem,1.04vw,1.18rem)] font-normal leading-[1.5] text-ink/66">
        {children}
      </p>
    </div>
  );
}

const culturalPressureAnchors = [
  {
    id: "pressure-attestation",
    title: "Spaced form prehistory",
    period: "late 14c.-1611",
    source: "Lexical sources",
    value: "attestation layer",
    caveat: "Attestation, not frequency.",
  },
  {
    id: "pressure-devotional-print",
    title: "Devotional print formulae",
    period: "1600s-1700s",
    source: "Lexical + Ngram",
    value: "for ever signal",
    caveat: "Cultural pressure, not causation.",
  },
  {
    id: "pressure-literary-vow",
    title: "Literary permanence",
    period: "1800-1899",
    source: "Gutenberg",
    value: "phrase evidence",
    caveat: "Seed corpus only.",
  },
  {
    id: "pressure-memory-loss",
    title: "Memory and loss",
    period: "1850-1930",
    source: "Gutenberg",
    value: "snippet support",
    caveat: "Archival evidence only.",
  },
  {
    id: "pressure-media-culture",
    title: "Media and pop title culture",
    period: "1950-2022",
    source: "Ngram",
    value: "frequency pressure",
    caveat: "Frequency lacks readable context.",
  },
  {
    id: "pressure-modern-snapshot",
    title: "Modern open-news context",
    period: "2024-2026",
    source: "Wikinews",
    value: "snapshot evidence",
    caveat: "Not comparable to Gutenberg.",
  },
];

const pressureCategoryIds: Record<string, string[]> = {
  "pressure-attestation": [],
  "pressure-devotional-print": ["eternity_religion"],
  "pressure-literary-vow": ["romance_vow", "permanence_duration"],
  "pressure-memory-loss": ["remembrance"],
  "pressure-media-culture": ["hyperbole_colloquial", "permanence_duration"],
  "pressure-modern-snapshot": ["digital_permanence", "hyperbole_colloquial"],
};

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function layerForEra(eraId: ForeverEraId): SelectedLayer {
  if (eraId === "recent" || eraId === "2000-2019") return "modern";
  if (eraId === "all") return null;
  return "archival";
}

export function ForeverPoster({ dataset }: ForeverPosterProps) {
  const [selectedEra, setSelectedEra] = useState<ForeverEraId>("all");
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);
  const [selectedLayer, setSelectedLayer] = useState<SelectedLayer>(null);
  const [hoveredInspectorId, setHoveredInspectorId] = useState<string | null>(null);
  const [pinnedInspectorId, setPinnedInspectorId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | undefined>();
  const generatedInspectors = useMemo<InspectorEntry[]>(() => {
    const prehistoryEntries =
      dataset.prehistory?.records.map((record) => ({
        id: record.id,
        title: record.form,
        visualType: "Evidence Atlas",
        elementType: record.evidenceType.replaceAll("-", " "),
        period: record.dateLabel,
        dataLayer: "curated" as const,
        selectionReason: "Shown as a separated lexical/prehistory marker, not as corpus frequency.",
        evidenceCount: 1,
        scoreType: record.verificationStatus,
        sourceCorpus: record.sourceName,
        coverageRange: record.dateLabel,
        relatedSnippetIds: [],
        rawInputs: [
          { label: "Form", value: record.form },
          { label: "Approximate year", value: record.yearApproximation },
          { label: "Source category", value: record.sourceCategory },
        ],
        derivedValues: [{ label: "Confidence", value: record.confidence }],
        curatedDecisions: [{ label: "Evidence label", value: record.evidenceType }],
        visualMapping: "Marker position maps to approximate attestation date. Marker shape indicates lexical-source evidence.",
        explanation: record.caveat,
        sources: [{ label: record.sourceName, url: record.sourceUrl, dateRange: record.dateLabel }],
        caveats: [record.caveat],
      })) ?? [];

    const modernSnippetEntries =
      dataset.modernContext?.snippets.map((snippet) => ({
        id: snippet.id,
        title: snippet.title,
        visualType: "Modern Snapshot",
        elementType: "open news snippet",
        period: String(snippet.year),
        dataLayer: "raw" as const,
        selectionReason: "Shown as separated modern open-news context, not merged with Gutenberg.",
        evidenceCount: 1,
        scoreType: snippet.evidenceType,
        sourceCorpus: snippet.sourceCorpus,
        coverageRange: String(snippet.year),
        relatedSnippetIds: [snippet.id],
        rawInputs: [
          { label: "Query", value: snippet.query },
          { label: "Quote", value: snippet.quote },
          { label: "Date basis", value: snippet.dateBasis ?? "Wikinews API timestamp" },
        ],
        derivedValues: [{ label: "Category tags", value: snippet.categoryIds.join(", ") || "none" }],
        curatedDecisions: [{ label: "Layer", value: "modern snapshot" }],
        visualMapping: "Modern marks are grouped separately from archival context and positioned in the 2024-2026 snapshot zone.",
        explanation: snippet.caveat,
        sources: [{ label: snippet.source, url: snippet.sourceUrl, rightsStatus: snippet.rightsStatus }],
        caveats: [snippet.caveat],
      })) ?? [];

    const modernPhraseEntries =
      dataset.modernContext?.phrases.map((phrase) => ({
        id: phrase.id,
        title: phrase.phrase,
        visualType: "Modern Snapshot",
        elementType: "phrase mark",
        period: `${dataset.coverage.modernContextStartYear ?? 2024}-${dataset.coverage.modernContextEndYear ?? 2026}`,
        dataLayer: "computed" as const,
        selectionReason: "Shown only within the modern snapshot cluster.",
        evidenceCount: phrase.count,
        documentFrequency: phrase.documentFrequency,
        scoreType: "snippet count",
        scoreValue: phrase.count,
        sourceCorpus: phrase.sourceCorpus,
        coverageRange: `${dataset.coverage.modernContextStartYear ?? 2024}-${dataset.coverage.modernContextEndYear ?? 2026}`,
        relatedSnippetIds: phrase.relatedSnippetIds,
        rawInputs: [
          { label: "Phrase", value: phrase.phrase },
          { label: "Snippet count", value: phrase.count },
        ],
        derivedValues: [{ label: "Document frequency", value: phrase.documentFrequency }],
        curatedDecisions: [{ label: "Layer", value: "modern snapshot only" }],
        visualMapping: "Phrase mark size maps to snippet support inside the Wikinews snapshot.",
        explanation: phrase.caveat,
        sources: [{ label: "Wikinews", url: dataset.modernContext?.source.url }],
        caveats: [phrase.caveat],
      })) ?? [];

    const modernCollocateEntries =
      dataset.modernContext?.collocates.map((collocate) => ({
        id: collocate.id,
        title: collocate.token,
        visualType: "Modern Snapshot",
        elementType: "collocate mark",
        period: `${dataset.coverage.modernContextStartYear ?? 2024}-${dataset.coverage.modernContextEndYear ?? 2026}`,
        dataLayer: "computed" as const,
        selectionReason: "Shown as exploratory modern open-news context.",
        evidenceCount: collocate.count,
        documentFrequency: collocate.documentFrequency,
        scoreType: "token count in search snippets",
        scoreValue: collocate.count,
        sourceCorpus: collocate.sourceCorpus,
        coverageRange: `${dataset.coverage.modernContextStartYear ?? 2024}-${dataset.coverage.modernContextEndYear ?? 2026}`,
        relatedSnippetIds: collocate.relatedSnippetIds,
        rawInputs: [
          { label: "Token", value: collocate.token },
          { label: "Count", value: collocate.count },
        ],
        derivedValues: [{ label: "Document frequency", value: collocate.documentFrequency }],
        curatedDecisions: [{ label: "Layer", value: "modern snapshot only" }],
        visualMapping: "Small support marks map to exploratory collocate counts in Wikinews snippets.",
        explanation: collocate.caveat,
        sources: [{ label: "Wikinews", url: dataset.modernContext?.source.url }],
        caveats: [collocate.caveat],
      })) ?? [];

    const pressureEntries = culturalPressureAnchors.map((anchor) => ({
      id: anchor.id,
      title: anchor.title,
      visualType: "Historical Influence Field",
      elementType: "cultural pressure anchor",
      period: anchor.period,
      dataLayer: "interpretive" as const,
      selectionReason: "Shown as an interpretive historical/cultural anchor around the frequency field.",
      evidenceCount: 1,
      scoreType: anchor.value,
      sourceCorpus: anchor.source,
      coverageRange: anchor.period,
      relatedSnippetIds: [],
      rawInputs: [
        { label: "Anchor", value: anchor.title },
        { label: "Period", value: anchor.period },
      ],
      derivedValues: [{ label: "Visible value", value: anchor.value }],
      curatedDecisions: [{ label: "Layer", value: "interpretive pressure map" }],
      visualMapping: "Anchor position maps to approximate historical period. Links point toward local frequency pressure.",
      explanation: anchor.caveat,
      sources: [{ label: anchor.source }],
      caveats: [anchor.caveat],
    }));

    return [
      ...prehistoryEntries,
      ...modernSnippetEntries,
      ...modernPhraseEntries,
      ...modernCollocateEntries,
      ...pressureEntries,
    ];
  }, [dataset]);

  const inspectorById = useMemo(
    () => new Map([...dataset.inspectors, ...generatedInspectors].map((entry) => [entry.id, entry])),
    [dataset.inspectors, generatedInspectors],
  );
  const selectionById = useMemo(() => {
    const map = new Map<string, SelectedItem>();
    const put = (item: SelectedItem) => map.set(item.id, item);

    dataset.frequency.forEach((series) => {
      const phraseLike = series.query.includes(" ");
      put({
        id: series.inspectorId,
        label: series.label,
        kind: phraseLike ? "phrase" : "form",
        layer: "frequency",
        eraId: "all",
        categoryIds: [],
        phrase: phraseLike ? series.query : undefined,
        form: phraseLike ? undefined : series.query,
        query: series.query,
        relatedSnippetIds: [],
        relatedInspectorIds: [series.inspectorId],
        sourceIds: ["google-ngram"],
      });
    });

    dataset.phrases.forEach((phrase) => {
      const matchingFrequency = dataset.frequency.find(
        (series) => series.query.toLowerCase() === phrase.phrase.toLowerCase(),
      );
      put({
        id: phrase.inspectorId,
        label: phrase.phrase,
        kind: "phrase",
        layer: "archival",
        eraId: phrase.eraId,
        categoryIds: phrase.categoryIds,
        phrase: phrase.phrase,
        query: phrase.phrase,
        relatedSnippetIds: phrase.relatedSnippetIds,
        relatedInspectorIds: unique([phrase.inspectorId, matchingFrequency?.inspectorId ?? ""]),
        sourceIds: ["project-gutenberg"],
      });
    });

    dataset.collocates.forEach((collocate) => {
      put({
        id: collocate.inspectorId,
        label: collocate.token,
        kind: "collocate",
        layer: "archival",
        eraId: collocate.eraId,
        categoryIds: collocate.categoryIds,
        relatedSnippetIds: collocate.relatedSnippetIds,
        relatedInspectorIds: [collocate.inspectorId],
        sourceIds: ["project-gutenberg"],
      });
    });

    dataset.snippets.forEach((snippet) => {
      const matchingFrequency = dataset.frequency.find(
        (series) => series.query.toLowerCase() === snippet.phrase.toLowerCase(),
      );
      put({
        id: snippet.inspectorId,
        label: snippet.phrase || snippet.title,
        kind: "snippet",
        layer: "archival",
        eraId: snippet.eraId,
        categoryIds: snippet.categoryIds,
        phrase: snippet.phrase,
        query: snippet.phrase,
        relatedSnippetIds: [snippet.id],
        relatedInspectorIds: unique([snippet.inspectorId, matchingFrequency?.inspectorId ?? ""]),
        sourceIds: ["project-gutenberg"],
      });
    });

    dataset.categories.forEach((category) => {
      const relatedSnippetIds = unique([
        ...dataset.phrases
          .filter((phrase) => phrase.categoryIds.includes(category.id))
          .flatMap((phrase) => phrase.relatedSnippetIds),
        ...dataset.collocates
          .filter((collocate) => collocate.categoryIds.includes(category.id))
          .flatMap((collocate) => collocate.relatedSnippetIds),
        ...dataset.snippets
          .filter((snippet) => snippet.categoryIds.includes(category.id))
          .map((snippet) => snippet.id),
      ]);
      const categoryInspectorIds = [
        `inspect-category-${category.id}-all`,
        ...category.eraScores.map((score) => score.inspectorId),
        ...dataset.ledger
          .filter((cell) => cell.categoryId === category.id)
          .map((cell) => cell.inspectorId),
      ];
      unique(categoryInspectorIds).forEach((id) => {
        put({
          id,
          label: category.label,
          kind: "category",
          layer: "context",
          eraId: id.endsWith("-recent") ? "recent" : "all",
          categoryIds: [category.id],
          relatedSnippetIds,
          relatedInspectorIds: unique(categoryInspectorIds),
          sourceIds: ["project-gutenberg", "wikinews"],
        });
      });
    });

    dataset.prehistory?.records.forEach((record) => {
      put({
        id: record.id,
        label: record.form,
        kind: "prehistory",
        layer: "prehistory",
        categoryIds: [],
        form: record.normalizedForm || record.form,
        query: record.normalizedForm || record.form,
        relatedSnippetIds: [],
        relatedInspectorIds: [record.id],
        sourceIds: [record.sourceName],
      });
    });

    dataset.modernContext?.phrases.forEach((phrase) => {
      const matchingFrequency = dataset.frequency.find(
        (series) => series.query.toLowerCase() === phrase.phrase.toLowerCase(),
      );
      put({
        id: phrase.id,
        label: phrase.phrase,
        kind: "phrase",
        layer: "modern",
        eraId: "recent",
        categoryIds: phrase.categoryIds,
        phrase: phrase.phrase,
        query: phrase.phrase,
        relatedSnippetIds: phrase.relatedSnippetIds,
        relatedInspectorIds: unique([phrase.id, matchingFrequency?.inspectorId ?? ""]),
        sourceIds: ["wikinews"],
      });
    });

    dataset.modernContext?.collocates.forEach((collocate) => {
      put({
        id: collocate.id,
        label: collocate.token,
        kind: "collocate",
        layer: "modern",
        eraId: "recent",
        categoryIds: collocate.categoryIds,
        relatedSnippetIds: collocate.relatedSnippetIds,
        relatedInspectorIds: [collocate.id],
        sourceIds: ["wikinews"],
      });
    });

    dataset.modernContext?.snippets.forEach((snippet) => {
      const matchingFrequency = dataset.frequency.find(
        (series) => series.query.toLowerCase() === snippet.query.toLowerCase(),
      );
      put({
        id: snippet.id,
        label: snippet.query,
        kind: "snippet",
        layer: "modern",
        eraId: "recent",
        categoryIds: snippet.categoryIds,
        phrase: snippet.query,
        query: snippet.query,
        relatedSnippetIds: [snippet.id],
        relatedInspectorIds: unique([snippet.id, matchingFrequency?.inspectorId ?? ""]),
        sourceIds: ["wikinews"],
      });
    });

    culturalPressureAnchors.forEach((anchor) => {
      put({
        id: anchor.id,
        label: anchor.title,
        kind: "pressure",
        layer: "influence",
        categoryIds: pressureCategoryIds[anchor.id] ?? [],
        query: anchor.value,
        relatedSnippetIds: [],
        relatedInspectorIds: [anchor.id],
        sourceIds: [anchor.source],
      });
    });

    dataset.atlas.nodes.forEach((node) => {
      const categoryIds =
        node.column === "contextual_category"
          ? [node.id.replace(/^category-/, "").replaceAll("-", "_")]
          : [];
      put({
        id: node.inspectorId,
        label: node.label,
        kind:
          node.column === "form"
            ? "form"
            : node.column === "phrase"
              ? "phrase"
              : node.column === "collocate"
                ? "collocate"
                : "category",
        layer: node.sourceCorpus.toLowerCase().includes("wikinews") ? "modern" : "archival",
        eraId: node.eraId === "all" ? "all" : node.eraId,
        categoryIds,
        phrase: node.column === "phrase" ? node.label : undefined,
        form: node.column === "form" ? node.label : undefined,
        query: node.label,
        relatedSnippetIds: node.relatedSnippetIds,
        relatedInspectorIds: [node.inspectorId],
        sourceIds: [node.sourceCorpus],
      });
    });

    return map;
  }, [dataset]);
  const activeInspectorId = pinnedInspectorId ?? hoveredInspectorId ?? undefined;
  const activeEntry = activeInspectorId ? inspectorById.get(activeInspectorId) : undefined;

  const handleHover = (inspectorId: string | null, position?: { x: number; y: number }) => {
    if (pinnedInspectorId) return;
    setHoveredInspectorId(inspectorId);
    if (position) setMenuPosition(position);
  };

  const handleInspect = (inspectorId: string, position?: { x: number; y: number }) => {
    setPinnedInspectorId(inspectorId);
    setHoveredInspectorId(null);
    const nextSelection = selectionById.get(inspectorId) ?? null;
    setSelectedItem(nextSelection);
    setSelectedLayer(nextSelection?.layer ?? null);
    if (position) setMenuPosition(position);
  };

  const handleEraChange = (eraId: ForeverEraId) => {
    setSelectedEra(eraId);
    setPinnedInspectorId(null);
    setHoveredInspectorId(null);
    setMenuPosition(undefined);
    if (eraId === "all") {
      setSelectedItem(null);
      setSelectedLayer(null);
      return;
    }
    const era = dataset.eras.find((item) => item.id === eraId);
    const layer = layerForEra(eraId);
    setSelectedItem({
      id: `era-${eraId}`,
      label: era?.label ?? eraId,
      kind: "era",
      layer,
      eraId,
      categoryIds: [],
      relatedSnippetIds: [],
      relatedInspectorIds: [],
      sourceIds: layer === "modern" ? ["wikinews"] : ["project-gutenberg"],
    });
    setSelectedLayer(layer);
  };

  return (
    <main className="min-h-screen bg-wheat text-ink">
      <div className="mx-auto flex w-full max-w-[1960px] flex-col px-4 py-5 sm:px-7 lg:px-10 xl:px-12">
        <Nav />

        <section className="relative overflow-hidden border-y border-ink py-8 sm:py-10 lg:py-12">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(5,5,16,0.09)_1px,transparent_1px),linear-gradient(180deg,rgba(5,5,16,0.07)_1px,transparent_1px)] bg-[size:72px_72px]" />
          <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-end">
            <div>
              <p className="font-mono text-[0.68rem] font-black uppercase tracking-[0.22em] text-fire">
                Words Over Time / real-data demo
              </p>
              <h1 className="mt-5 text-[clamp(5.6rem,18vw,19rem)] font-black leading-[0.72] tracking-normal text-blaze">
                forever
              </h1>
              <p className="mt-7 max-w-4xl text-[clamp(1.15rem,2.25vw,3rem)] font-black leading-[1.02] text-ink">
                A word traced through permanence, repetition, devotion, memory,
                and time.
              </p>
            </div>

            <dl className="grid border-y border-ink bg-wheat/74">
              {[
                ["ngram", `${dataset.coverage.ngramStartYear}-${dataset.coverage.ngramEndYear}`],
                ["archive", `${dataset.coverage.gutenbergStartYear}-${dataset.coverage.gutenbergEndYear}`],
                ["modern", dataset.coverage.recentImplemented ? `${dataset.coverage.modernContextStartYear}-${dataset.coverage.modernContextEndYear}` : "needed"],
              ].map(([label, value], index) => (
                <div
                  key={label}
                  className={`grid grid-cols-[7.25rem_1fr] border-ink ${
                    index < 2 ? "border-b" : ""
                  }`}
                >
                  <dt className="border-r border-ink px-3 py-3 font-mono text-[0.58rem] font-black uppercase leading-4 tracking-[0.16em] text-fire">
                    {label}
                  </dt>
                  <dd className="px-3 py-3 font-mono text-[0.62rem] font-black uppercase leading-4 tracking-[0.12em]">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <EraSwitcher eras={dataset.eras} selectedEra={selectedEra} onChange={handleEraChange} />

        <div className="mt-10 min-w-0">
          <PosterSection
            eyebrow="01 / frequency field"
            title="Frequency field"
          >
            <FrequencyTimeline
              series={dataset.frequency}
              eras={dataset.eras}
              selectedEra={selectedEra}
              selectedItem={selectedItem}
              selectedLayer={selectedLayer}
              activeInspectorId={activeInspectorId}
              onHover={handleHover}
              onInspect={handleInspect}
            />
          </PosterSection>

          <NarrativeBridge
            children="Frequency gives the surface trace: which form rises, falls, or persists in print; the next layer asks what kinds of historical pressure gather around that curve."
          />

          <PosterSection
            eyebrow="02 / historical influence field"
            title="Historical influence field"
          >
            <VariantDriftField
              frequency={dataset.frequency}
              prehistory={dataset.prehistory}
              selectedEra={selectedEra}
              selectedItem={selectedItem}
              selectedLayer={selectedLayer}
              activeInspectorId={activeInspectorId}
              onHover={handleHover}
              onInspect={handleInspect}
            />
          </PosterSection>

          <NarrativeBridge
            children="The influence field treats the curve as a cultural trace, drawing in devotional print, literary permanence, memory, media, and modern open-news context before the next map moves closer to the word's immediate attachments."
          />

          <PosterSection
            eyebrow="03 / relational constellation"
            title="Relational constellation"
          >
            <RelationalConstellation
              phrases={dataset.phrases}
              collocates={dataset.collocates}
              categories={dataset.categories}
              snippets={dataset.snippets}
              modernContext={dataset.modernContext}
              selectedEra={selectedEra}
              selectedItem={selectedItem}
              selectedLayer={selectedLayer}
              activeInspectorId={activeInspectorId}
              onHover={handleHover}
              onInspect={handleInspect}
            />
          </PosterSection>

          <NarrativeBridge
            children="The constellation turns forever into a network of repeated attachments, where forms, phrases, collocates, and contextual anchors begin to cluster without pretending to fix the word's meaning."
          />

          <PosterSection
            eyebrow="04 / context signal field"
            title="Context signal field"
          >
            <ContextSignalField
              ledger={dataset.ledger}
              categories={dataset.categories}
              eras={dataset.eras}
              modernContext={dataset.modernContext}
              selectedEra={selectedEra}
              selectedItem={selectedItem}
              selectedLayer={selectedLayer}
              activeInspectorId={activeInspectorId}
              onHover={handleHover}
              onInspect={handleInspect}
            />
          </PosterSection>

          <NarrativeBridge
            children="The sphere compresses available context into one abstract semantic object, holding archival signals, modern snapshot signals, and a visible gap where comparable evidence is still missing."
          />

          <PosterSection
            eyebrow="05 / evidence archive"
            title="Evidence archive"
          >
            <EvidenceArchive
              snippets={dataset.snippets}
              phrases={dataset.phrases}
              collocates={dataset.collocates}
              ledger={dataset.ledger}
              eras={dataset.eras}
              prehistory={dataset.prehistory}
              frequency={dataset.frequency}
              modernContext={dataset.modernContext}
              selectedEra={selectedEra}
              selectedItem={selectedItem}
              selectedLayer={selectedLayer}
              activeInspectorId={activeInspectorId}
              highlightedSnippetIds={unique([
                ...(activeEntry?.relatedSnippetIds ?? []),
                ...(selectedItem?.relatedSnippetIds ?? []),
              ])}
              onHover={handleHover}
              onInspect={handleInspect}
            />
          </PosterSection>

          <NarrativeBridge
            children="Taken together, these panels do not define forever once and for all; they show what the available data allows us to see across form, frequency, context, evidence, and absence."
          />

          <div className="border-t border-ink/80 pb-12 pt-0">
            <div className="mt-8 flex flex-wrap gap-4 font-mono text-[0.68rem] font-black uppercase tracking-[0.16em]">
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

      <MiniInspectorMenu
        entry={activeEntry}
        position={menuPosition}
        pinned={Boolean(pinnedInspectorId)}
        onClose={() => {
          setPinnedInspectorId(null);
          setHoveredInspectorId(null);
          setMenuPosition(undefined);
          setSelectedItem(null);
          setSelectedLayer(null);
        }}
      />
    </main>
  );
}
