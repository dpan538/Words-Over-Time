import type { ForeverEraId } from "@/types/foreverRealData";

export type SelectedLayer =
  | "prehistory"
  | "frequency"
  | "archival"
  | "modern"
  | "context"
  | "evidence"
  | "influence"
  | null;

export type SelectedItemKind =
  | "era"
  | "frequency"
  | "form"
  | "phrase"
  | "collocate"
  | "category"
  | "snippet"
  | "pressure"
  | "prehistory"
  | "unknown";

export type SelectedItem = {
  id: string;
  label: string;
  kind: SelectedItemKind;
  layer: SelectedLayer;
  eraId?: ForeverEraId | "all";
  categoryIds: string[];
  phrase?: string;
  form?: string;
  query?: string;
  relatedSnippetIds: string[];
  relatedInspectorIds: string[];
  sourceIds: string[];
};
