"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { EraSwitcher } from "@/components/EraSwitcher";
import { ContextualEvidenceBands } from "@/components/ContextualEvidenceBands";
import { EvidenceTimeline } from "@/components/EvidenceTimeline";
import { ForeverInspector } from "@/components/ForeverInspector";
import { FrequencyTimeline } from "@/components/FrequencyTimeline";
import { MethodNote } from "@/components/MethodNote";
import { Nav } from "@/components/Nav";
import { PhraseCollocateNetwork } from "@/components/PhraseCollocateNetwork";
import { PosterSection } from "@/components/PosterSection";
import { VariantFlowMap } from "@/components/VariantFlowMap";
import type {
  ForeverEraId,
  ForeverGeneratedDataset,
} from "@/types/foreverRealData";

type ForeverPosterProps = {
  dataset: ForeverGeneratedDataset;
};

export function ForeverPoster({ dataset }: ForeverPosterProps) {
  const [selectedEra, setSelectedEra] = useState<ForeverEraId>("all");
  const [hoveredInspectorId, setHoveredInspectorId] = useState<string | null>(null);
  const [pinnedInspectorId, setPinnedInspectorId] = useState<string | null>(null);
  const inspectorById = useMemo(
    () => new Map(dataset.inspectors.map((entry) => [entry.id, entry])),
    [dataset.inspectors],
  );
  const activeInspectorId = pinnedInspectorId ?? hoveredInspectorId ?? undefined;
  const activeEntry = activeInspectorId ? inspectorById.get(activeInspectorId) : undefined;
  const selectedEraNote = dataset.eras.find((era) => era.id === selectedEra)?.note;

  const handleHover = (inspectorId: string | null) => {
    if (!pinnedInspectorId) setHoveredInspectorId(inspectorId);
  };

  const handleInspect = (inspectorId: string) => {
    setPinnedInspectorId(inspectorId);
    setHoveredInspectorId(null);
  };

  const handleEraChange = (eraId: ForeverEraId) => {
    setSelectedEra(eraId);
    setPinnedInspectorId(null);
    setHoveredInspectorId(null);
  };

  return (
    <main className="min-h-screen bg-wheat text-ink">
      <div className="mx-auto flex w-full max-w-[1760px] flex-col px-4 py-5 sm:px-8 lg:px-12 xl:px-16">
        <Nav />

        <section className="relative overflow-hidden border-y border-ink py-8 sm:py-12 lg:py-16">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(5,5,16,0.09)_1px,transparent_1px),linear-gradient(180deg,rgba(5,5,16,0.07)_1px,transparent_1px)] bg-[size:72px_72px]" />
          <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_25rem] lg:items-end">
            <div>
              <p className="font-mono text-[0.68rem] font-black uppercase tracking-[0.22em] text-fire">
                Words Over Time / real-data demo
              </p>
              <h1 className="mt-5 text-[clamp(5.6rem,18vw,19rem)] font-black leading-[0.72] tracking-normal text-blaze">
                forever
              </h1>
              <p className="mt-8 max-w-4xl text-[clamp(1.45rem,3.1vw,4.25rem)] font-black leading-[0.98] text-ink">
                A word traced through permanence, repetition, devotion, memory,
                and time.
              </p>
            </div>

            <dl className="grid border border-ink bg-wheat/86">
              {[
                ["frequency source", "Google Books Ngram"],
                ["context source", "Project Gutenberg"],
                [
                  "real coverage",
                  `${dataset.coverage.ngramStartYear}-${dataset.coverage.ngramEndYear} / snippets ${dataset.coverage.gutenbergStartYear}-${dataset.coverage.gutenbergEndYear}`,
                ],
                ["recent layer", dataset.coverage.recentImplemented ? "implemented" : "not yet implemented"],
              ].map(([label, value], index) => (
                <div
                  key={label}
                  className={`grid grid-cols-[9.5rem_1fr] border-ink ${
                    index < 3 ? "border-b" : ""
                  }`}
                >
                  <dt className="border-r border-ink px-3 py-4 font-mono text-[0.64rem] font-black uppercase leading-4 tracking-[0.16em] text-fire">
                    {label}
                  </dt>
                  <dd className="px-3 py-4 text-sm font-black uppercase leading-5 tracking-[0.08em]">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <EraSwitcher eras={dataset.eras} selectedEra={selectedEra} onChange={handleEraChange} />
        <p className="mt-4 max-w-4xl font-mono text-[0.68rem] font-black uppercase leading-5 tracking-[0.16em] text-ink/58">
          selected era: {selectedEra} / {selectedEraNote}
        </p>

        <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_22rem] 2xl:grid-cols-[minmax(0,1fr)_25rem]">
          <div className="min-w-0">
            <PosterSection
              eyebrow="01 / main frequency timeline"
              title="real Ngram frequency traces"
              intro="Compares single-word forms and phrase series using Google Books Ngram yearly frequencies. Click any line to inspect smoothing, the per-million metric, source coverage, and why this is not earliest attestation."
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
              eyebrow="02 / variant flow map"
              title="forms into an editorial family"
              intro="A form aggregation diagram using mean Ngram frequency in the selected era. It shows contribution to an editorial family grouping, not direct historical transformation."
            >
              <VariantFlowMap
                flows={dataset.flows}
                selectedEra={selectedEra}
                activeInspectorId={activeInspectorId}
                onHover={handleHover}
                onInspect={handleInspect}
              />
            </PosterSection>

            <PosterSection
              eyebrow="03 / contextual evidence bands"
              title="context bands, not sense detection"
              intro="These bands summarize phrase, collocate, and snippet evidence. They are curated contextual signals, not automatic sense classification."
            >
              <ContextualEvidenceBands
                categories={dataset.categories}
                eras={dataset.eras}
                selectedEra={selectedEra}
                activeInspectorId={activeInspectorId}
                onHover={handleHover}
                onInspect={handleInspect}
              />
            </PosterSection>

            <PosterSection
              eyebrow="04 / phrase and collocate network"
              title="phrases first, collocates second"
              intro="Phrase nodes are visually primary. Filtered collocates appear only when they pass count, document-frequency, and interpretive-value checks."
            >
              <PhraseCollocateNetwork
                nodes={dataset.network.nodes}
                edges={dataset.network.edges}
                selectedEra={selectedEra}
                activeInspectorId={activeInspectorId}
                onHover={handleHover}
                onInspect={handleInspect}
              />
            </PosterSection>

            <PosterSection
              eyebrow="05 / evidence spine"
              title="dated proof, arranged over time"
              intro="Project Gutenberg snippets are shown as dated evidence nodes, grouped by evidence type. Click a node for quote, provenance, selected phrase, category support, and caveat."
            >
              <EvidenceTimeline
                snippets={dataset.snippets}
                selectedEra={selectedEra}
                activeInspectorId={activeInspectorId}
                onHover={handleHover}
                onInspect={handleInspect}
              />
            </PosterSection>

            <div className="pb-10">
              <MethodNote>
                This page uses real public data, but not full historical certainty.
                Frequency comes from Google Books Ngram through 2022. Context,
                snippets, phrases, and collocates come from a small Project
                Gutenberg public-domain seed through 1930. Contextual evidence
                bands are curated heuristics built from that evidence, not
                automatic sense classification.
              </MethodNote>
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

          <div className="order-first xl:order-none">
            <ForeverInspector
              entry={activeEntry}
              pinned={Boolean(pinnedInspectorId)}
              onClear={() => {
                setPinnedInspectorId(null);
                setHoveredInspectorId(null);
              }}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
