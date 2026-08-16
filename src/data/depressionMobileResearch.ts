import depressionMobileResearchJson from "./generated/depression_mobile_research.json";
import type { DepressionMobileResearch } from "../types/depressionMobileResearch";

// scripts/build_depression_mobile_research.ts --check verifies that the
// rendered mobile study still derives from the retained depression sources.
export const depressionMobileResearch =
  depressionMobileResearchJson as unknown as DepressionMobileResearch;
