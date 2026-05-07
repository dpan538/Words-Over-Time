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

type ForeverPosterProps = {
  dataset: ForeverGeneratedDataset;
};

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

export function ForeverPoster({ dataset }: ForeverPosterProps) {
  const [selectedEra, setSelectedEra] = useState<ForeverEraId>("all");
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
    if (position) setMenuPosition(position);
  };

  const handleEraChange = (eraId: ForeverEraId) => {
    setSelectedEra(eraId);
    setPinnedInspectorId(null);
    setHoveredInspectorId(null);
    setMenuPosition(undefined);
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
              activeInspectorId={activeInspectorId}
              onHover={handleHover}
              onInspect={handleInspect}
            />
          </PosterSection>

          <PosterSection
            eyebrow="02 / historical influence field"
            title="Historical influence field"
          >
            <VariantDriftField
              frequency={dataset.frequency}
              prehistory={dataset.prehistory}
              selectedEra={selectedEra}
              activeInspectorId={activeInspectorId}
              onHover={handleHover}
              onInspect={handleInspect}
            />
          </PosterSection>

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
              activeInspectorId={activeInspectorId}
              onHover={handleHover}
              onInspect={handleInspect}
            />
          </PosterSection>

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
              activeInspectorId={activeInspectorId}
              onHover={handleHover}
              onInspect={handleInspect}
            />
          </PosterSection>

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
              activeInspectorId={activeInspectorId}
              highlightedSnippetIds={activeEntry?.relatedSnippetIds}
              onHover={handleHover}
              onInspect={handleInspect}
            />
          </PosterSection>

          <div className="border-t border-ink/80 pb-12 pt-8">
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
        }}
      />
    </main>
  );
}
