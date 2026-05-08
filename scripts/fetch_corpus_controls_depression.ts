import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = path.join(process.cwd(), "src", "data", "generated");
const OUT_FILE = path.join(OUT_DIR, "depression_corpus_controls.json");

const controls = [
  {
    id: "google_ngram",
    name: "Google Books Ngram Viewer",
    status: "integrated",
    sourceRole: "long-span public frequency baseline",
    coverage: "1500-2022 in current generated frequency file",
    access: "public web endpoint",
    dataType: "yearly ngram frequency fractions",
    branchUse: ["all tracked terms, frequency only"],
    sourceUrl: "https://books.google.com/ngrams/",
    limitation:
      "Frequency only; no snippet context, no sense labels, and early years can be sparse or OCR-sensitive.",
  },
  {
    id: "htrc_extracted_features_2_5",
    name: "HathiTrust Research Center Extracted Features 2.5",
    status: "investigated_feasible_not_ingested",
    sourceRole: "large-scale corpus control for book-frequency and page-level counts",
    coverage: "18.7 million HathiTrust volumes in the April 2025 snapshot",
    access: "bulk JSON-LD extracted-feature files; full dataset is multi-terabyte",
    dataType: "page-level token/POS counts and volume metadata",
    branchUse: ["frequency control", "technical branch validation", "economic/clinical book-context validation"],
    sourceUrl: "https://htrc.atlassian.net/wiki/spaces/COM/pages/975306753/Extracted%2BFeatures%2Bv.2.5",
    limitation:
      "Operationally heavy. Best next step is targeted subset extraction or Bookworm-style aggregate access, not full download inside this prototype.",
  },
  {
    id: "hathitrust_bookworm",
    name: "HathiTrust + Bookworm",
    status: "investigated_feasible_not_ingested",
    sourceRole: "interactive aggregate trend control over HathiTrust",
    coverage: "documentation describes trends across 13.7 million HathiTrust works",
    access: "web visualization and Bookworm-style aggregate API pattern",
    dataType: "aggregate token trends and metadata facets",
    branchUse: ["frequency control", "term comparison sanity check"],
    sourceUrl: "https://htrc.atlassian.net/wiki/spaces/COM/pages/43288257/HathiTrust%2BBookworm",
    limitation:
      "Best suited to single-token trend checks. Phrases and sense branches still require separate context/evidence review.",
  },
  {
    id: "coha",
    name: "Corpus of Historical American English",
    status: "investigated_restricted_not_ingested",
    sourceRole: "balanced historical American English control corpus",
    coverage: "1820s-2010s; 475+ million words",
    access: "registered/licensed corpus access; downloads may require institutional or paid access",
    dataType: "genre-balanced historical text with word, lemma, POS, sources",
    branchUse: ["balanced collocate control", "phrase validation", "American-English diachronic check"],
    sourceUrl: "https://www.english-corpora.org/coha/",
    limitation:
      "Not integrated because local bulk data is not available in this workspace. Strongly recommended before public clinical/economic claims.",
  },
  {
    id: "earlyprint_eebo_tcp",
    name: "EarlyPrint / EEBO-TCP",
    status: "investigated_feasible_not_ingested",
    sourceRole: "pre-1700 context and attestation corpus",
    coverage: "1473-1700 early English print; EarlyPrint Lab describes 60,000+ documents and about 1.65B words",
    access: "downloadable corrected/annotated XML and metadata; dedicated ingestion needed",
    dataType: "early-print full text, metadata, linguistic annotation",
    branchUse: ["pre-1700 emotional", "astronomical", "physical", "melancholy/melancholia"],
    sourceUrl: "https://earlyprint.org/",
    limitation:
      "Not a quick API fetch. Needs a separate parser/search workflow and manual review for spelling/typography/OCR issues.",
  },
];

const generated = {
  generatedAt: new Date().toISOString(),
  layer: "corpus controls and feasibility",
  controls,
  recommendation:
    "Use Google Ngram now, add HathiTrust/Bookworm and COHA before locking public visual claims, and add EarlyPrint/EEBO-TCP before making pre-1700 context claims.",
};

await mkdir(OUT_DIR, { recursive: true });
await writeFile(OUT_FILE, `${JSON.stringify(generated, null, 2)}\n`);
console.log(`Wrote ${OUT_FILE}`);
