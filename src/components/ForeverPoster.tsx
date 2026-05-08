"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { EraSwitcher } from "@/components/EraSwitcher";
import { EvidenceArchive } from "@/components/EvidenceArchive";
import { FrequencyTimeline } from "@/components/FrequencyTimeline";
import { MiniInspectorMenu } from "@/components/MiniInspectorMenu";
import { Nav } from "@/components/Nav";
import { PanelProgress } from "@/components/PanelProgress";
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
  from: string;
  to: string;
};

function NarrativeBridge({ children, from, to }: NarrativeBridgeProps) {
  return (
    <div className="mb-10 mt-14 flex gap-5 sm:mb-12 sm:mt-16 lg:gap-8">
      <div className="flex flex-col items-center gap-1.5 pt-1">
        <span className="font-mono text-[0.62rem] font-black uppercase tracking-[0.16em] text-fire/70">
          {from}
        </span>
        <div className="w-px flex-1 bg-ink/14" />
        <span className="font-mono text-[0.62rem] font-black uppercase tracking-[0.16em] text-ink/38">
          {to}
        </span>
      </div>
      <p className="flex-1 text-[clamp(1.05rem,1.1vw,1.2rem)] font-normal leading-[1.6] text-ink/58 lg:max-w-4xl">
        {children}
      </p>
    </div>
  );
}

const foreverPanels = [
  { num: "01", label: "Frequency", color: "#F06B04" },
  { num: "02", label: "Influence", color: "#2C9FC7" },
  { num: "03", label: "Constellation", color: "#A1081F" },
  { num: "04", label: "Signal", color: "#1570AC" },
  { num: "05", label: "Archive", color: "#050510" },
];

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
              <p className="font-mono text-[0.82rem] font-black uppercase tracking-[0.18em] text-fire">
                Words Over Time / word page
              </p>
              <h1 className="mt-5 text-[clamp(5.6rem,18vw,19rem)] font-black leading-[0.72] tracking-normal text-blaze">
                forever
              </h1>
              <p className="mt-7 max-w-4xl text-[clamp(1.15rem,2.25vw,3rem)] font-black leading-[1.02] text-ink">
                A word traced through permanence, repetition, devotion, memory,
                and time.
              </p>
              <p className="mt-4 max-w-2xl font-mono text-[clamp(0.78rem,1.08vw,1rem)] font-black uppercase leading-6 tracking-[0.12em] text-ink/58">
                Five layers of evidence. One word. Frequency / influence /
                company / meaning / proof.
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
                  <dt className="border-r border-ink px-3 py-3 font-mono text-[0.74rem] font-black uppercase leading-5 tracking-[0.14em] text-fire">
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

        <PanelProgress panels={foreverPanels} />
        <EraSwitcher eras={dataset.eras} selectedEra={selectedEra} onChange={handleEraChange} />

        <div className="mt-10 min-w-0">
          <PosterSection
            eyebrow="01 / frequency field"
            title="Frequency field"
            intro="Four written forms of forever, tracked across three centuries of English print. The curve does not explain itself - but it is the starting point."
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
            from="01"
            to="02"
            children="Three hundred years of print compressed into a line. What it cannot tell you is why the line moves - what was being written, read, and repeated when forever rose or fell. The next layer asks that question."
          />

          <PosterSection
            eyebrow="02 / historical influence field"
            title="Historical influence field"
            intro="Six cultural forces mapped against the same curve: devotional print, romantic literature, memory and loss, media culture. None caused the frequency alone."
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
            from="02"
            to="03"
            children="Cultural pressure explains the broad shape of the curve. But pressure is not the same as usage. The constellation moves from the historical forces into the actual texts - the phrases forever was anchored to, the words it consistently attracted, the contexts it kept returning to."
          />

          <PosterSection
            eyebrow="03 / relational constellation"
            title="Relational constellation"
            intro="Phrases, collocates, and context anchors pulled from 200 years of Gutenberg texts and a 2024-2026 news snapshot. What forever tends to sit next to."
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
            from="03"
            to="04"
            children="Forty-eight text snippets and twenty-one collocate patterns give the word its companions. The signal field takes that material one step further - abstracting the attachments into six semantic categories and asking which ones have archival evidence, which have a modern equivalent, and where the record simply goes silent."
          />

          <PosterSection
            eyebrow="04 / context signal field"
            title="Context signal field"
            intro="Six semantic categories compressed into one field. Archival signal and modern snapshot held together - with the gap between them kept visible."
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
            from="04"
            to="05"
            children="The signal field shows the distribution. The archive shows the sources it was built from - and the gaps it was built around. Every mark in the panels above is traceable here: the snippet it came from, the corpus that produced it, the confidence level it was assigned."
          />

          <PosterSection
            eyebrow="05 / evidence archive"
            title="Evidence archive"
            intro="The actual source material: prehistory attestations from the 14th century, Ngram marks, Gutenberg snippets, and Wikinews captures. Every claim traceable."
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
            from="05"
            to="end"
            children="Permanence is what forever promises. What the data shows is something more unstable: a word that meant eternity in devotional contexts, loyalty in literary vows, loss in elegies, and excess in everyday speech - across the same three centuries, sometimes in the same decade. Not a stable definition. A record of use."
          />

          <div className="border-t border-ink/80 pb-12 pt-0">
            <div className="mt-8 flex flex-wrap gap-4 font-mono text-[0.8rem] font-black uppercase tracking-[0.13em]">
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
