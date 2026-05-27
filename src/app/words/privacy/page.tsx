import { PrivacyPoster } from "@/components/PrivacyPoster";
import semanticWeatherJson from "@/data/generated/privacy_pre_modern_semantic_weather.json";
import legalInjuryJson from "@/data/generated/privacy_legal_injury_matrix.json";
import modernTransitJson from "@/data/generated/privacy_modern_transit_system.json";
import type { PrivacySemanticWeatherDataset } from "@/components/privacy/PrivacyChart01SemanticWeather";
import type { PrivacyLegalInjuryDataset } from "@/components/privacy/PrivacyChart01LegalInjury";
import type { PrivacyModernTransitDataset } from "@/components/privacy/PrivacyChart01ModernTransit";

const semanticWeather = semanticWeatherJson as PrivacySemanticWeatherDataset;
const legalInjury = legalInjuryJson as unknown as PrivacyLegalInjuryDataset;
const modernTransit = modernTransitJson as unknown as PrivacyModernTransitDataset;

export default function PrivacyPage() {
  return <PrivacyPoster semanticWeather={semanticWeather} legalInjury={legalInjury} modernTransit={modernTransit} />;
}
