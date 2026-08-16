import type { Metadata } from "next";
import { PrivacyMobileExperience } from "@/components/privacy/PrivacyMobileExperience";
import semanticWeatherJson from "@/data/generated/privacy_pre_modern_semantic_weather.json";
import geoAttentionJson from "@/data/generated/privacy_geo_attention_map.json";
import researchExpansionJson from "../../../../../docs/research/privacy/processed/privacy_research_expansion_processed.json";

export const metadata: Metadata = {
  title: "Privacy Mobile Study Demo",
  description: "A mobile-first experimental prototype for the Privacy word study.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PrivacyMobileDemoPage() {
  return (
    <PrivacyMobileExperience
      periods={semanticWeatherJson.periods}
      periodScores={semanticWeatherJson.period_track_scores}
      hotspots={geoAttentionJson.country_hotspots}
      geoStatistics={geoAttentionJson.statistics}
      policyTerms={researchExpansionJson.aggregates.policy_term_summary}
      governanceRecordCount={researchExpansionJson.statistics.total_record_count}
      governanceLimitation={
        researchExpansionJson.limitations[2] ?? "Interface-language counts are source-bounded text scans."
      }
    />
  );
}
