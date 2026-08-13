import { JsonLd } from "@/components/JsonLd";
import { PrivacyPoster } from "@/components/PrivacyPoster";
import { WordPageShell } from "@/components/WordPageShell";
import { MobilePrivacyStudy } from "@/components/privacy/mobile/MobilePrivacyStudy";
import { privacyMobileAnalysis } from "@/data/privacyMobileAnalysis";
import semanticWeatherJson from "@/data/generated/privacy_pre_modern_semantic_weather.json";
import legalInjuryJson from "@/data/generated/privacy_legal_injury_matrix.json";
import modernTransitJson from "@/data/generated/privacy_modern_transit_system.json";
import geoAttentionJson from "@/data/generated/privacy_geo_attention_map.json";
import geoElevationJson from "@/data/generated/privacy_geo_elevation_distribution.json";
import geoDemographicJson from "@/data/generated/privacy_geo_demographic_context.json";
import { createPageMetadata, createRouteJsonLd } from "@/lib/site";
import researchExpansionJson from "../../../../docs/research/privacy/processed/privacy_research_expansion_processed.json";
import type { PrivacySemanticWeatherDataset } from "@/components/privacy/PrivacyChart01SemanticWeather";
import type { PrivacyLegalInjuryDataset } from "@/components/privacy/PrivacyChart01LegalInjury";
import type { PrivacyModernTransitDataset } from "@/components/privacy/PrivacyChart01ModernTransit";
import type { PrivacyGeoAttentionDataset } from "@/components/privacy/PrivacyChart02GeoAttention";
import type { PrivacyGeoElevationDataset } from "@/components/privacy/PrivacyChart02ElevationDistribution";
import type { PrivacyGeoDemographicContextDataset } from "@/components/privacy/PrivacyChart02DemographicContext";
import type { PrivacyResearchExpansionDataset } from "@/components/privacy/PrivacyChart03GovernanceInterface";

// Keep the source files complete for research reproducibility while sending only
// fields consumed by the interactive charts across the Server/Client boundary.
const semanticWeather = {
  periods: semanticWeatherJson.periods,
  period_track_scores: semanticWeatherJson.period_track_scores,
  thresholds: semanticWeatherJson.thresholds,
  content_plan: semanticWeatherJson.content_plan,
} as unknown as PrivacySemanticWeatherDataset;

const legalInjury = {
  branches: legalInjuryJson.branches,
  matrix_nodes: legalInjuryJson.matrix_nodes,
  yearly_phrase_signal: legalInjuryJson.yearly_phrase_signal,
  scale: legalInjuryJson.scale,
} as unknown as PrivacyLegalInjuryDataset;

const modernTransit = {
  routes: modernTransitJson.routes,
  stations: modernTransitJson.stations,
  flow_metrics: modernTransitJson.flow_metrics,
} as unknown as PrivacyModernTransitDataset;

const geoAttention = {
  statistics: geoAttentionJson.statistics,
  country_hotspots: geoAttentionJson.country_hotspots,
  city_points: geoAttentionJson.city_points,
  radiation_hubs: geoAttentionJson.radiation_hubs,
  radiation_links: geoAttentionJson.radiation_links,
} as unknown as PrivacyGeoAttentionDataset;

const geoElevation = {
  statistics: geoElevationJson.statistics,
  points: geoElevationJson.points,
  bands: geoElevationJson.bands,
} as unknown as PrivacyGeoElevationDataset;

const geoDemographic = {
  statistics: geoDemographicJson.statistics,
  records: geoDemographicJson.records,
  network_nodes: geoDemographicJson.network_nodes,
  network_edges: geoDemographicJson.network_edges,
} as unknown as PrivacyGeoDemographicContextDataset;

const researchExpansion: PrivacyResearchExpansionDataset = {
  word: "privacy",
  layer_id: "research_expansion",
  status: researchExpansionJson.status,
  intended_use: researchExpansionJson.intended_use,
  statistics: researchExpansionJson.statistics,
  aggregates: researchExpansionJson.aggregates,
  strong_signals: researchExpansionJson.strong_signals,
  limitations: researchExpansionJson.limitations,
};

export const metadata = createPageMetadata("/words/privacy");
const jsonLd = createRouteJsonLd("/words/privacy");

export default function PrivacyPage() {
  return (
    <>
      <JsonLd data={jsonLd} />
      <WordPageShell path="/words/privacy">
        <MobilePrivacyStudy analysis={privacyMobileAnalysis} />
        <div className="hidden min-[960px]:block">
          <PrivacyPoster
            semanticWeather={semanticWeather}
            legalInjury={legalInjury}
            modernTransit={modernTransit}
            geoAttention={geoAttention}
            geoElevation={geoElevation}
            geoDemographic={geoDemographic}
            researchExpansion={researchExpansion}
          />
        </div>
      </WordPageShell>
    </>
  );
}
