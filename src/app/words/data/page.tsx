import { DataPoster } from "@/components/DataPoster";
import crossPressuresDatasetJson from "@/data/generated/data_cross_pressures.json";
import datumRouteDatasetJson from "@/data/generated/data_datum_route.json";
import datasetJson from "@/data/generated/data_historical_index.json";
import socializedDatasetJson from "@/data/generated/data_socialized_generation.json";
import type { DataDatumRouteDataset } from "@/types/dataDatumRoute";
import type { DataCrossPressuresDataset } from "@/types/dataCrossPressures";
import type { DataHistoricalIndexDataset } from "@/types/dataHistoricalIndex";
import type { DataSocializedGenerationDataset } from "@/types/dataSocializedGeneration";

const dataset = datasetJson as DataHistoricalIndexDataset;
const socializedDataset = socializedDatasetJson as DataSocializedGenerationDataset;
const datumRouteDataset = datumRouteDatasetJson as DataDatumRouteDataset;
const crossPressuresDataset = crossPressuresDatasetJson as DataCrossPressuresDataset;

export default function DataPage() {
  return (
    <DataPoster
      dataset={dataset}
      socializedDataset={socializedDataset}
      datumRouteDataset={datumRouteDataset}
      crossPressuresDataset={crossPressuresDataset}
    />
  );
}
