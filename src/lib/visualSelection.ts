import type { ForeverEraId } from "@/types/foreverRealData";
import type { SelectedItem } from "@/types/visualSelection";

export type SelectionTarget = {
  id?: string;
  inspectorId?: string;
  label?: string;
  query?: string;
  phrase?: string;
  form?: string;
  kind?: string;
  layer?: string | null;
  eraId?: ForeverEraId | "all";
  categoryIds?: string[];
  snippetId?: string;
};

export type SelectionMatch = "none" | "active" | "related" | "unrelated";

export function normalizeSelectionText(value?: string) {
  return (value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function hasCategoryOverlap(a: string[] = [], b: string[] = []) {
  return a.some((item) => b.includes(item));
}

function textValuesForTarget(target: SelectionTarget) {
  return [target.label, target.query, target.phrase, target.form]
    .map(normalizeSelectionText)
    .filter(Boolean);
}

function textValuesForSelection(selection: SelectedItem) {
  return [selection.label, selection.query, selection.phrase, selection.form]
    .map(normalizeSelectionText)
    .filter(Boolean);
}

export function getSelectionMatch(
  selection: SelectedItem | null | undefined,
  target: SelectionTarget,
): SelectionMatch {
  if (!selection) return "none";

  const targetIds = [target.id, target.inspectorId].filter(Boolean);
  if (
    targetIds.includes(selection.id) ||
    targetIds.some((id) => selection.relatedInspectorIds.includes(id!))
  ) {
    return "active";
  }

  if (target.snippetId && selection.relatedSnippetIds.includes(target.snippetId)) {
    return "active";
  }

  if (selection.kind === "era") {
    if (selection.eraId && target.eraId === selection.eraId) return "active";
    if (selection.eraId === "recent" && target.layer === "modern") return "active";
    if (selection.layer && target.layer === selection.layer) return "related";
    return "unrelated";
  }

  const selectionText = textValuesForSelection(selection);
  const targetText = textValuesForTarget(target);
  if (selectionText.length && targetText.length) {
    const exactTextMatch = selectionText.some((source) =>
      targetText.some((candidate) => source === candidate),
    );
    if (exactTextMatch) return "active";

    const targetIsBaseForever = targetText.some((candidate) => candidate === "forever");
    const selectionMentionsForever = selectionText.some((source) =>
      source.split(" ").includes("forever"),
    );
    if (targetIsBaseForever && selectionMentionsForever) return "related";
  }

  const categoryMatch = hasCategoryOverlap(selection.categoryIds, target.categoryIds ?? []);
  if (categoryMatch) {
    return selection.kind === "category" && target.kind === "category" ? "active" : "related";
  }

  return "unrelated";
}

export function selectionOpacity(
  match: SelectionMatch,
  selected: SelectedItem | null | undefined,
  options: { active?: number; related?: number; unrelated?: number; none?: number } = {},
) {
  if (!selected || match === "none") return options.none ?? 1;
  if (match === "active") return options.active ?? 1;
  if (match === "related") return options.related ?? 0.62;
  return options.unrelated ?? 0.16;
}
