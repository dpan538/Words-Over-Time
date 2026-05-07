export type FlowLink = {
  id: string;
  source: string;
  target: string;
  value: number;
  periodLabel: string;
  color: string;
  relation: "variant_aggregation" | "phrase_expansion" | "family_grouping";
  editorialAnnotation?: string;
};

export type NetworkNodeGroup =
  | "word"
  | "variant"
  | "phrase"
  | "collocate"
  | "contextual_category";

export type NetworkNode = {
  id: string;
  label: string;
  group: NetworkNodeGroup;
  x: number;
  y: number;
  radius: number;
  color: string;
  periodLabel?: string;
  categoryColor?: string;
  editorialAnnotation?: string;
};

export type NetworkEdge = {
  id: string;
  source: string;
  target: string;
  weight: number;
  relation:
    | "co_occurrence"
    | "category_assignment"
    | "variant_relation"
    | "phrase_relation";
  color: string;
  periodLabel?: string;
  associationScore?: number;
  logDiceScore?: number;
  editorialAnnotation?: string;
};
