export type WordStatus = "complete" | "coming-soon";

export type RightsStatus =
  | "public_domain"
  | "licensed"
  | "restricted"
  | "unknown"
  | "pending";

export type ConfidenceLabel = "low" | "medium" | "high" | "pending";

export type Source = {
  id: string;
  label: string;
  role:
    | "frequency_backbone"
    | "context_backbone"
    | "snippet_pool"
    | "research_only"
    | "contemporary_supplement";
  dateRange: string;
  corpusVersion: string;
  publicQuoteAllowed: boolean;
  rightsStatus: RightsStatus;
  notes: string;
};

export type Word = {
  id?: string;
  label: string;
  slug: string;
  status: WordStatus;
  href?: string;
  displayLemma?: string;
  subtitle?: string;
  forms?: WordForm[];
  sourceIds?: string[];
  editorialAnnotations?: string[];
  confidenceLabel?: ConfidenceLabel;
};

export type WordForm = {
  id: string;
  wordId: string;
  form: string;
  formType: "orthographic" | "phrase" | "family" | "case_variant";
  normalizationGroup: string;
  firstKnownPeriod?: string;
  rawCount?: number;
  sourceId?: string;
  corpusVersion?: string;
  selectedForDisplay: boolean;
  editorialAnnotation?: string;
  confidenceLabel: ConfidenceLabel;
};

export type YearlyFrequency = {
  id: string;
  wordId: string;
  year: number;
  rawCount: number;
  totalTokens: number;
  sourceId: string;
  corpusVersion: string;
  wordForm: string;
  phraseString?: string;
  frequencyPerMillion: number;
  smoothedFrequency: number;
  yearOverYearChange?: number;
  growthRate?: number;
  peakYear?: number;
  periodLabel?: string;
  editorialAnnotation?: string;
  confidenceLabel: ConfidenceLabel;
};

export type Evidence = {
  id: string;
  wordId: string;
  year?: number;
  periodLabel: string;
  sourceId: string;
  corpusVersion: string;
  wordForm: string;
  phraseString?: string;
  rawCount?: number;
  totalTokens?: number;
  publicationMetadata: {
    title?: string;
    author?: string;
    publisher?: string;
    publicationYear?: number;
    place?: string;
  };
  rightsStatus: RightsStatus;
  sourceStatus: "verified" | "pending" | "uncertain";
  note: string;
  editorialAnnotation?: string;
  confidenceLabel: ConfidenceLabel;
};

export type Snippet = {
  id: string;
  evidenceId: string;
  sourceId: string;
  wordId: string;
  periodLabel: string;
  year?: number;
  wordForm: string;
  phraseString?: string;
  snippetText: string;
  publicationMetadata: Evidence["publicationMetadata"];
  rightsStatus: RightsStatus;
  verified: boolean;
  selectedForDisplay: boolean;
  editorialAnnotation?: string;
  confidenceLabel: ConfidenceLabel;
};

export type PhraseAssociation = {
  id: string;
  wordId: string;
  periodLabel: string;
  phraseString: string;
  rawCount: number;
  sourceId: string;
  corpusVersion: string;
  phraseRank: number;
  associationScore?: number;
  logDiceScore?: number;
  selectedPhrase: boolean;
  evidenceIds?: string[];
  editorialAnnotation?: string;
  confidenceLabel: ConfidenceLabel;
};

export type CollocateAssociation = {
  id: string;
  wordId: string;
  periodLabel: string;
  collocate: string;
  partOfSpeech?: string;
  rawCount: number;
  sourceId: string;
  corpusVersion: string;
  collocateRank: number;
  associationScore: number;
  logDiceScore?: number;
  selectedCollocate: boolean;
  evidenceIds?: string[];
  editorialAnnotation?: string;
  confidenceLabel: ConfidenceLabel;
};

export type SemanticCategory = {
  id: string;
  label: string;
  description: string;
  color: string;
  chosenBy: "human" | "rule_plus_review" | "model_plus_review";
  selectedForDisplay: boolean;
  editorialAnnotation?: string;
  confidenceLabel: ConfidenceLabel;
};

export type SemanticCategoryScore = {
  id: string;
  wordId: string;
  categoryId: string;
  periodLabel: string;
  startYear: number;
  endYear: number;
  semanticCategoryScore: number;
  categoryShareByPeriod: number;
  sourceId: string;
  corpusVersion: string;
  derivedFrom: Array<"phrase" | "collocate" | "snippet" | "rule" | "model">;
  editorialAnnotation?: string;
  confidenceLabel: ConfidenceLabel;
};

export type Metric = {
  title: string;
  body: string;
};
