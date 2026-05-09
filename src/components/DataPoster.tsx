import Link from "next/link";
import { DataCrossPressures } from "@/components/DataCrossPressures";
import { DataDatumRoute } from "@/components/DataDatumRoute";
import { DataHistoricalIndex } from "@/components/DataHistoricalIndex";
import { DataSocializedGeneration } from "@/components/DataSocializedGeneration";
import { Nav } from "@/components/Nav";
import { PanelProgress } from "@/components/PanelProgress";
import { PosterSection } from "@/components/PosterSection";
import type { DataDatumRouteDataset } from "@/types/dataDatumRoute";
import type { DataCrossPressuresDataset } from "@/types/dataCrossPressures";
import type { DataHistoricalIndexDataset } from "@/types/dataHistoricalIndex";
import type { DataSocializedGenerationDataset } from "@/types/dataSocializedGeneration";

type DataPosterProps = {
  dataset: DataHistoricalIndexDataset;
  socializedDataset: DataSocializedGenerationDataset;
  datumRouteDataset: DataDatumRouteDataset;
  crossPressuresDataset: DataCrossPressuresDataset;
};

const dataPanels = [
  { num: "01", label: "Historical Index", color: "#1570AC" },
  { num: "02", label: "Socialized Data", color: "#A1081F" },
  { num: "03", label: "Grammatical Route", color: "#AE4202" },
  { num: "04", label: "Cross-Pressures", color: "#036C17" },
];

export function DataPoster({ dataset, socializedDataset, datumRouteDataset, crossPressuresDataset }: DataPosterProps) {
  const termCount = dataset.panels.reduce((count, panel) => count + panel.terms.length, 0);

  return (
    <main className="min-h-screen bg-wheat text-ink">
      <div className="mx-auto flex w-full max-w-[1960px] flex-col px-4 py-5 sm:px-7 lg:px-10 xl:px-12">
        <Nav />

        <section className="relative overflow-hidden border-y border-ink py-8 sm:py-10 lg:py-12">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(21,112,172,0.12)_1px,transparent_1px),linear-gradient(180deg,rgba(5,5,16,0.07)_1px,transparent_1px)] bg-[size:72px_72px]" />
          <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-end">
            <div>
              <p className="font-mono text-[0.82rem] font-black uppercase tracking-[0.18em] text-nice">
                Words Over Time / word page
              </p>
              <h1 className="mt-5 text-[clamp(5.6rem,18vw,19rem)] font-black leading-[0.72] tracking-normal text-nice">
                data
              </h1>
              <p className="mt-7 max-w-4xl text-[clamp(1.15rem,2.25vw,3rem)] font-black leading-[1.02] text-ink">
                A word that turns facts into infrastructure.
              </p>
              <p className="mt-4 max-w-3xl font-mono text-[clamp(0.78rem,1.08vw,1rem)] font-black uppercase leading-6 tracking-[0.12em] text-ink/58">
                Given facts / collected records / processing systems / platform traces / training material / contested ground.
              </p>
            </div>

            <dl className="grid border-y border-ink bg-wheat/74">
              {[
                ["ngram", `${dataset.coverage.startYear}-${dataset.coverage.frequencySourceEndYear}`],
                ["index", `${dataset.coverage.startYear}-${dataset.coverage.endYear}`],
                ["panels", String(dataset.panels.length)],
                ["stems", String(termCount)],
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

        <PanelProgress panels={dataPanels} />

        <div className="mt-10 min-w-0">
          <div className="mb-10 grid gap-5 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10">
            <p className="font-mono text-[0.82rem] font-black uppercase leading-5 tracking-[0.16em] text-nice">
              entry note
            </p>
            <p className="max-w-[1040px] text-[1.08rem] leading-[1.55] text-ink/68">
              Data begins as something given: facts, observations, premises for argument. It becomes something collected, stored, processed, mined, and used to train systems. This page traces that turn through four charts: a historical index, a platform-era social acceleration, a grammatical shift, and a map of contested pressures.
            </p>
          </div>

          <PosterSection
            id="chart-1-historical-index"
            eyebrow="01 / historical index"
            title={dataset.title}
            intro="Data has always been an infrastructural term. This chart reads that fact through a dual-panel timeline: long formation above, contemporary acceleration below. The split keeps recent density visible without letting it swallow four hundred years of systematic thinking about facts, evidence, and counted things."
          >
            <DataHistoricalIndex dataset={dataset} />
          </PosterSection>

          <PosterSection
            id="chart-2-socialized-generation"
            eyebrow="02 / socialized generation"
            title={socializedDataset.title}
            intro="Data did not become social through AI alone. Before generative systems made data newly visible, a platform generation had already turned data into traces, profiles, public resources, private risks, and governed objects. This chart reads that generation at two scales: an outline from the 1990s to the 2020s, and an inner acceleration core from 2003 to 2013, the compressed decade in which nearly everything now permanent about social data began."
          >
            <DataSocializedGeneration dataset={socializedDataset} />
          </PosterSection>

          <PosterSection
            id="chart-3-datum-route"
            eyebrow="03 / grammatical route"
            title={datumRouteDataset.metadata.title}
            intro="This chart follows a grammatical route. From datum as singular item to data as plural form, and from data are to data is, it traces how a language of countable facts became a language of mass infrastructure. The grammatical shift is not incidental: it records what the infrastructural turn felt like from the inside of language."
          >
            <DataDatumRoute dataset={datumRouteDataset} />
          </PosterSection>

          <p className="mb-0 mt-8 max-w-2xl font-mono text-[0.76rem] font-black uppercase leading-5 tracking-[0.14em] text-ink/38">
            once the grammar shifted, so did the stakes.
          </p>

          <PosterSection
            id="chart-4-cross-pressures"
            eyebrow="04 / cross-pressures"
            title={crossPressuresDataset.metadata.title}
            intro="Modern data is not pulled in only one direction. It can be attached to persons, bounded by control, mobilized as scientific evidence, and judged through ethical responsibility. These are not competing errors about what data really is. They are simultaneous functions that the word now carries, and this chart maps them as a field rather than a hierarchy."
          >
            <DataCrossPressures dataset={crossPressuresDataset} />
          </PosterSection>

          <div className="mt-12 border-t border-ink/60 pb-10 pt-10">
            <div className="grid gap-5 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10">
              <p className="font-mono text-[0.82rem] font-black uppercase leading-5 tracking-[0.16em] text-nice">
                synthesis
              </p>
              <p className="max-w-[1040px] text-[1.08rem] leading-[1.55] text-ink/68">
                The pressures mapped in this final chart do not resolve; that is the point. A word once used to record given facts now carries incompatible claims: personal attachment, institutional restriction, scientific mobilisation, ethical accountability. No single domain stabilises it. The cross-pressures field maps where the word now lives, and how thoroughly the three earlier histories have altered what it means to use it.
              </p>
            </div>
          </div>

          <div className="border-t border-ink/80 pb-12 pt-0">
            <div className="mt-8 flex flex-wrap gap-4 font-mono text-[0.8rem] font-black uppercase tracking-[0.13em]">
              <Link href="/" className="border-b border-ink pb-1 transition hover:border-nice hover:text-nice">
                Back home
              </Link>
              <Link href="/about" className="border-b border-ink pb-1 transition hover:border-nice hover:text-nice">
                About methodology
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
