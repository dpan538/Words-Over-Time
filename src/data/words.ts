import type { Metric, Word } from "@/types/word";

export const words: Word[] = [
  {
    label: "forever",
    slug: "forever",
    status: "demo",
    href: "/words/forever",
  },
  {
    label: "depression",
    slug: "depression",
    status: "coming-soon",
  },
  {
    label: "privacy",
    slug: "privacy",
    status: "coming-soon",
  },
  {
    label: "data",
    slug: "data",
    status: "coming-soon",
  },
  {
    label: "artificial",
    slug: "artificial",
    status: "coming-soon",
  },
  {
    label: "intelligence",
    slug: "intelligence",
    status: "coming-soon",
  },
];

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
