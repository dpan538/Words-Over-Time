import analysisJson from "./generated/forever_analysis.json";
import figureContractsJson from "./generated/forever_figure_contract_registry.json";
import findingsJson from "./generated/forever_findings_registry.json";
import rawDataManifestJson from "./generated/forever_raw_data_manifest.json";
import type {
  ForeverAnalysisArtifact,
  ForeverFigureContractRegistry,
  ForeverFindingsRegistry,
  ForeverRawDataManifest,
} from "../types/foreverAnalysis";

// scripts/analyze_forever_raw.ts --check performs deterministic, byte-for-byte
// runtime validation before these generated JSON documents are consumed.
export const foreverAnalysis = analysisJson as unknown as ForeverAnalysisArtifact;
export const foreverRawDataManifest =
  rawDataManifestJson as unknown as ForeverRawDataManifest;
export const foreverFindingsRegistry =
  findingsJson as unknown as ForeverFindingsRegistry;
export const foreverFigureContractRegistry =
  figureContractsJson as unknown as ForeverFigureContractRegistry;
