import artificialMobileResearchJson from "./generated/artificial_mobile_research.json";
import type { ArtificialMobileResearchArtifact } from "../types/artificialMobileResearch";

// scripts/build_artificial_mobile_research.ts --check performs deterministic,
// byte-for-byte validation before this research artifact is consumed.
export const artificialMobileResearch =
  artificialMobileResearchJson as unknown as ArtificialMobileResearchArtifact;
