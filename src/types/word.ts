export type WordStatus = "demo" | "coming-soon";

export type Word = {
  label: string;
  slug: string;
  status: WordStatus;
  href?: string;
};

export type Metric = {
  title: string;
  body: string;
};
