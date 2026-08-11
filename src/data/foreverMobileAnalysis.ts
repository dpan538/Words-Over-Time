import mobileAnalysisJson from "./generated/forever_mobile_analysis.json";
import type { ForeverMobileAnalysis } from "../types/foreverMobileAnalysis";

// scripts/build_forever_mobile_analysis.ts --check recomputes every rendered
// result from the retained fixed-release inputs before this artifact is used.
export const foreverMobileAnalysis = mobileAnalysisJson as unknown as ForeverMobileAnalysis;
