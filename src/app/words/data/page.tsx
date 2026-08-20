import { DataPoster } from "@/components/DataPoster";
import { MobileDataStudy } from "@/components/data/mobile/MobileDataStudy";
import { JsonLd } from "@/components/JsonLd";
import { WordPageShell } from "@/components/WordPageShell";
import crossPressuresDatasetJson from "@/data/generated/data_cross_pressures.json";
import datumRouteDatasetJson from "@/data/generated/data_datum_route.json";
import datasetJson from "@/data/generated/data_historical_index.json";
import socializedDatasetJson from "@/data/generated/data_socialized_generation.json";
import { createPageMetadata, createRouteJsonLd } from "@/lib/site";
import type { DataDatumRouteDataset } from "@/types/dataDatumRoute";
import type { DataCrossPressuresDataset } from "@/types/dataCrossPressures";
import type { DataHistoricalIndexDataset } from "@/types/dataHistoricalIndex";
import type { DataSocializedGenerationDataset } from "@/types/dataSocializedGeneration";
import type { Viewport } from "next";

const dataset = datasetJson as DataHistoricalIndexDataset;
const socializedDataset = socializedDatasetJson as DataSocializedGenerationDataset;
const datumRouteDataset = datumRouteDatasetJson as DataDatumRouteDataset;
const crossPressuresDataset = crossPressuresDatasetJson as DataCrossPressuresDataset;

export const metadata = createPageMetadata("/words/data");
export const viewport: Viewport = {
  themeColor: [{ color: "#1570ac", media: "(max-width: 959px)" }],
  viewportFit: "cover",
};
const jsonLd = createRouteJsonLd("/words/data");

export default function DataPage() {
  return (
    <>
      <JsonLd data={jsonLd} />
      <div className="min-[960px]:hidden"><MobileDataStudy /></div>
      <div className="hidden min-[960px]:block">
        <WordPageShell path="/words/data">
          <DataPoster
            dataset={dataset}
            socializedDataset={socializedDataset}
            datumRouteDataset={datumRouteDataset}
            crossPressuresDataset={crossPressuresDataset}
          />
        </WordPageShell>
      </div>
    </>
  );
}
