import type { Metric, Word } from "@/types/word";

export type PublishedStudyId =
  | "study-data"
  | "study-hub"
  | "study-privacy"
  | "study-forever"
  | "study-artificial"
  | "study-depression";

export type PlannedStudyId = "study-intelligence";
export type StudyId = PublishedStudyId | PlannedStudyId;

export type PublishedStudyRegistryEntry = Word & {
  studyId: PublishedStudyId;
  status: "complete";
  href: `/words/${string}`;
};

export type PlannedStudyRegistryEntry = Word & {
  studyId: PlannedStudyId;
  status: "coming-soon";
  href: null;
};

export type StudyRegistryEntry =
  | PublishedStudyRegistryEntry
  | PlannedStudyRegistryEntry;

export const words: StudyRegistryEntry[] = [
  {
    studyId: "study-data",
    label: "data",
    slug: "data",
    status: "complete",
    href: "/words/data",
    hoverLabel: "social count",
  },
  {
    studyId: "study-hub",
    label: "hub",
    slug: "hub",
    status: "complete",
    href: "/words/hub",
    hoverLabel: "center moved",
  },
  {
    studyId: "study-privacy",
    label: "privacy",
    slug: "privacy",
    status: "complete",
    href: "/words/privacy",
    hoverLabel: "private weather",
  },
  {
    studyId: "study-forever",
    label: "forever",
    slug: "forever",
    status: "complete",
    href: "/words/forever",
    hoverLabel: "long promise",
  },
  {
    studyId: "study-artificial",
    label: "artificial",
    slug: "artificial",
    status: "complete",
    href: "/words/artificial",
    hoverLabel: "made meaning",
  },
  {
    studyId: "study-intelligence",
    label: "intelligence",
    slug: "intelligence",
    status: "coming-soon",
    href: null,
  },
  {
    studyId: "study-depression",
    label: "depression",
    slug: "depression",
    status: "complete",
    href: "/words/depression",
    hoverLabel: "double crisis",
  },
];

const studiesById = new Map(words.map((study) => [study.studyId, study]));

function studyById(studyId: StudyId): StudyRegistryEntry {
  const study = studiesById.get(studyId);

  if (!study) {
    throw new Error(`Missing canonical study registry entry: ${studyId}`);
  }

  return study;
}

export function publishedStudyById(
  studyId: PublishedStudyId,
): PublishedStudyRegistryEntry {
  const study = studyById(studyId);

  if (study.status !== "complete" || !study.href) {
    throw new Error(`Published study is missing its canonical route: ${studyId}`);
  }

  return study;
}

export function plannedStudyById(
  studyId: PlannedStudyId,
): PlannedStudyRegistryEntry {
  const study = studyById(studyId);

  if (study.status !== "coming-soon" || study.href !== null) {
    throw new Error(`Planned study must remain route-less: ${studyId}`);
  }

  return study;
}

export const foreverMetrics: Metric[] = [
  {
    title: "Long-term frequency",
    body: "A normalized frequency view will track how often forever appears across selected long-run corpora, with source boundaries stated clearly.",
  },
  {
    title: "Burst / decline detection",
    body: "The finished analysis will flag sustained rises, reversals, and periods where the word becomes unusually visible against the baseline.",
  },
  {
    title: "Variant policy",
    body: "Forever will later be compared with for ever, with a separate note on whether a lexeme-family aggregation is appropriate.",
  },
  {
    title: "Context snippets",
    body: "Verified snippets will show usage contexts without treating OCR text or unverified scans as final evidence.",
  },
];
