import { DataCrossPressures } from "@/components/DataCrossPressures";
import { DataDatumRoute } from "@/components/DataDatumRoute";
import { DataHistoricalIndex } from "@/components/DataHistoricalIndex";
import { DataSocializedGeneration } from "@/components/DataSocializedGeneration";
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
  return (
    <div className="bg-wheat text-ink">
      <div className="mx-auto flex w-full max-w-[1960px] flex-col px-4 py-5 sm:px-7 lg:px-10 xl:px-12">
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

          <span id="data-meaning-over-time" className="block scroll-mt-6" aria-hidden="true" />
          <PosterSection
            id="chart-1-historical-index"
            eyebrow="01 / historical index"
            title={dataset.title}
            intro="Data has always been an infrastructural term. This chart reads that fact through a dual-panel timeline: long formation above, contemporary acceleration below. The split keeps recent density visible without letting it swallow four hundred years of systematic thinking about facts, evidence, and counted things."
          >
            <DataHistoricalIndex dataset={dataset} />
          </PosterSection>

          <span id="data-social-traces" className="block scroll-mt-6" aria-hidden="true" />
          <PosterSection
            id="chart-2-socialized-generation"
            eyebrow="02 / socialized generation"
            title={socializedDataset.title}
            intro="Data did not become social through AI alone. Before generative systems made data newly visible, a platform generation had already turned data into traces, profiles, public resources, private risks, and governed objects. This chart reads that generation at two scales: an outline from the 1990s to the 2020s, and an inner acceleration core from 2003 to 2013, the compressed decade in which nearly everything now permanent about social data began."
          >
            <DataSocializedGeneration dataset={socializedDataset} />
          </PosterSection>

          <span id="datum-and-data" className="block scroll-mt-6" aria-hidden="true" />
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

          <span id="data-governance-ai" className="block scroll-mt-6" aria-hidden="true" />
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

        </div>
      </div>
    </div>
  );
}
