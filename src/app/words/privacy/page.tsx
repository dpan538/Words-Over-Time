import { PrivacyPoster } from "@/components/PrivacyPoster";
import semanticWeatherJson from "@/data/generated/privacy_pre_modern_semantic_weather.json";
import legalInjuryJson from "@/data/generated/privacy_legal_injury_matrix.json";
import modernTransitJson from "@/data/generated/privacy_modern_transit_system.json";
import geoAttentionJson from "@/data/generated/privacy_geo_attention_map.json";
import geoElevationJson from "@/data/generated/privacy_geo_elevation_distribution.json";
import geoDemographicJson from "@/data/generated/privacy_geo_demographic_context.json";
import researchExpansionJson from "../../../../docs/research/privacy/processed/privacy_research_expansion_processed.json";
import type { PrivacySemanticWeatherDataset } from "@/components/privacy/PrivacyChart01SemanticWeather";
import type { PrivacyLegalInjuryDataset } from "@/components/privacy/PrivacyChart01LegalInjury";
import type { PrivacyModernTransitDataset } from "@/components/privacy/PrivacyChart01ModernTransit";
import type { PrivacyGeoAttentionDataset } from "@/components/privacy/PrivacyChart02GeoAttention";
import type { PrivacyGeoElevationDataset } from "@/components/privacy/PrivacyChart02ElevationDistribution";
import type { PrivacyGeoDemographicContextDataset } from "@/components/privacy/PrivacyChart02DemographicContext";
import type { PrivacyResearchExpansionDataset } from "@/components/privacy/PrivacyChart03GovernanceInterface";

const semanticWeather = semanticWeatherJson as PrivacySemanticWeatherDataset;
const legalInjury = legalInjuryJson as unknown as PrivacyLegalInjuryDataset;
const modernTransit = modernTransitJson as unknown as PrivacyModernTransitDataset;
const geoAttention = geoAttentionJson as unknown as PrivacyGeoAttentionDataset;
const geoElevation = geoElevationJson as unknown as PrivacyGeoElevationDataset;
const geoDemographic = geoDemographicJson as unknown as PrivacyGeoDemographicContextDataset;
const researchExpansion = researchExpansionJson as unknown as PrivacyResearchExpansionDataset;

export default function PrivacyPage() {
  return (
    <PrivacyPoster
      semanticWeather={semanticWeather}
      legalInjury={legalInjury}
      modernTransit={modernTransit}
      geoAttention={geoAttention}
      geoElevation={geoElevation}
      geoDemographic={geoDemographic}
      researchExpansion={researchExpansion}
    />
  );
}
