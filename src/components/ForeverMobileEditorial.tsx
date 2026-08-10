import Link from "next/link";
import { MobileFrequencyStory } from "@/components/MobileFrequencyStory";
import type {
  ForeverGeneratedDataset,
  ForeverEraId,
  GeneratedCategory,
  GeneratedLedgerCell,
} from "@/types/foreverRealData";

type ForeverMobileEditorialProps = {
  dataset: ForeverGeneratedDataset;
};

const historicalPeriods: Array<{ id: ForeverEraId; label: string }> = [
  { id: "1800-1849", label: "1800–1849" },
  { id: "1850-1899", label: "1850–1899" },
  { id: "1900-1949", label: "1900–1949" },
  { id: "1950-1999", label: "1950–1999" },
  { id: "2000-2019", label: "2000–2019" },
];

function cellFor(
  ledger: GeneratedLedgerCell[],
  categoryId: string,
  eraId: ForeverEraId,
) {
  return ledger.find(
    (cell) => cell.categoryId === categoryId && cell.eraId === eraId,
  );
}

function historicalState(cell: GeneratedLedgerCell | undefined) {
  if (!cell) return "unavailable";
  if (
    cell.coverageStatus === "no-current-context-layer" ||
    cell.coverageStatus === "future-layer"
  ) {
    return "unavailable";
  }
  if (cell.evidenceStrength === "none") return "not observed";
  return cell.evidenceStrength;
}

function modernCategoryCounts(dataset: ForeverGeneratedDataset) {
  const counts = new Map<string, number>();
  for (const snippet of dataset.modernContext?.snippets ?? []) {
    for (const categoryId of snippet.categoryIds) {
      counts.set(categoryId, (counts.get(categoryId) ?? 0) + 1);
    }
  }
  return counts;
}

function categoryMark(category: GeneratedCategory) {
  return (
    <span
      aria-hidden="true"
      className="mt-[0.28rem] block h-2.5 w-2.5 flex-none"
      style={{ backgroundColor: category.color }}
    />
  );
}

export function ForeverMobileEditorial({ dataset }: ForeverMobileEditorialProps) {
  const categories = dataset.categories.filter(
    (category) => category.id !== "digital_permanence",
  );
  const digitalCategory = dataset.categories.find(
    (category) => category.id === "digital_permanence",
  );
  const modernCounts = modernCategoryCounts(dataset);
  const archivalPhrases = dataset.phrases
    .filter((phrase) => phrase.eraId === "all" && phrase.displayEligible)
    .sort(
      (left, right) =>
        right.count - left.count ||
        right.documentFrequency - left.documentFrequency ||
        left.phrase.localeCompare(right.phrase),
    );
  const largestPhraseCount = Math.max(
    1,
    ...archivalPhrases.map((phrase) => phrase.count),
  );

  return (
    <div className="bg-paper-mobile px-5 pb-16 text-ink min-[960px]:hidden">
      <div className="mx-auto max-w-[42rem] space-y-16">
        <MobileFrequencyStory series={dataset.frequency} />

        <figure
          id="meaning-over-time"
          className="scroll-mt-6 border-t border-ink/70 pt-5"
          aria-labelledby="forever-meaning-matrix-title"
        >
          <p className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.13em] text-nice">
            02 / period × meaning matrix
          </p>
          <h2
            id="forever-meaning-matrix-title"
            className="mt-2 max-w-sm text-[1.75rem] font-bold leading-[1.02]"
          >
            Where does the current context record branch?
          </h2>
          <p className="mt-4 max-w-xl text-[0.94rem] font-medium leading-6 text-ink/76">
            The historical rows report only the current Project Gutenberg seed layer. A blank state names missing context coverage; it is not a zero and not evidence that a meaning did not exist.
          </p>

          <div className="mt-8">
            {historicalPeriods.map((period, periodIndex) => (
              <section
                key={period.id}
                className={`grid grid-cols-6 gap-x-3 py-5 ${periodIndex > 0 ? "border-t border-ink/18" : ""}`}
                aria-labelledby={`forever-period-${period.id}`}
              >
                <div className="col-span-2">
                  <h3
                    id={`forever-period-${period.id}`}
                    className="font-mono text-[0.68rem] font-semibold uppercase leading-5 tracking-[0.08em]"
                  >
                    {period.label}
                  </h3>
                  <p className="mt-1 font-mono text-[0.6rem] font-semibold uppercase leading-4 tracking-[0.04em] text-ink/60">
                    Gutenberg seed texts
                  </p>
                </div>
                <div className="col-span-4 grid grid-cols-2 gap-x-3 gap-y-3">
                  {categories.map((category) => {
                    const state = historicalState(
                      cellFor(dataset.ledger, category.id, period.id),
                    );
                    const unavailable = state === "unavailable";

                    return (
                      <div key={category.id} className={unavailable ? "text-ink/50" : "text-ink/82"}>
                        <div className="flex gap-2">
                          {categoryMark(category)}
                          <div className="min-w-0">
                            <p className="text-[0.7rem] font-medium leading-4">
                              {category.label}
                            </p>
                            <p className="mt-0.5 font-mono text-[0.56rem] font-medium uppercase leading-3 tracking-[0.03em]">
                              {unavailable ? "— unavailable" : state}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}

            <section
              className="grid grid-cols-6 gap-x-3 border-t border-ink/70 py-5"
              aria-labelledby="forever-period-modern"
            >
              <div className="col-span-2">
                <h3 id="forever-period-modern" className="font-mono text-[0.68rem] font-semibold uppercase leading-5 tracking-[0.08em]">
                  2024–2026
                </h3>
                <p className="mt-1 font-mono text-[0.6rem] font-semibold uppercase leading-4 tracking-[0.04em] text-ink/60">
                  Wikinews revision snapshot
                </p>
              </div>
              <div className="col-span-4 grid grid-cols-2 gap-x-3 gap-y-3">
                {[...categories, ...(digitalCategory ? [digitalCategory] : [])].map(
                  (category) => {
                    const count = modernCounts.get(category.id) ?? 0;
                    return (
                      <div key={category.id} className="flex gap-2 text-ink/82">
                        {categoryMark(category)}
                        <div className="min-w-0">
                          <p className="text-[0.7rem] font-medium leading-4">
                            {category.label}
                          </p>
                          <p className="mt-0.5 font-mono text-[0.56rem] font-medium uppercase leading-3 tracking-[0.03em]">
                            {count} tagged {count === 1 ? "snippet" : "snippets"}
                          </p>
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            </section>
          </div>

          <figcaption className="mt-3">
            <p className="max-w-xl text-[1rem] font-medium leading-[1.62] text-ink/84">
              The strongest selected historical coverage sits in 1850–1899, so a denser row there partly reflects the archive rather than a universal semantic peak. The modern layer is a separate open-news snapshot: its tagged snippets expose new persistence contexts, but they cannot extend the Gutenberg scale.
            </p>
            <p className="mt-4 max-w-xl font-mono text-[0.66rem] font-semibold uppercase leading-5 tracking-[0.06em] text-ink/64">
              Context / Project Gutenberg 1726–1930 + Wikinews revision snapshot 2024–2026 · Transform / curated category support shown by source period · Boundary / unlike corpora remain non-comparable; unavailable cells are not zero
            </p>
          </figcaption>
        </figure>

        <figure
          className="border-t border-ink/70 pt-5"
          aria-labelledby="forever-phrase-title"
        >
          <p className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.13em] text-nice">
            03 / ordered evidence strips
          </p>
          <h2 id="forever-phrase-title" className="mt-2 max-w-sm text-[1.75rem] font-bold leading-[1.02]">
            Which phrases recur in the selected archive?
          </h2>

          <div className="mt-8 space-y-5">
            {archivalPhrases.map((phrase) => (
              <div key={phrase.id}>
                <div className="flex items-end justify-between gap-4">
                  <p className="text-[1.05rem] font-medium leading-5">
                    {phrase.phrase}
                  </p>
                  <p className="text-right font-mono text-[0.62rem] font-semibold uppercase leading-4 tracking-[0.05em] text-ink/64">
                    {phrase.count} matches / {phrase.documentFrequency} texts
                  </p>
                </div>
                <div className="mt-2 h-2 w-full bg-ink/8" aria-hidden="true">
                  <span
                    className="block h-full bg-nice"
                    style={{ width: `${(phrase.count / largestPhraseCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 border-t border-ink/18 pt-5">
            <p className="font-mono text-[0.64rem] font-semibold uppercase tracking-[0.1em] text-ink/66">
              modern context / grouped, not ranked
            </p>
            <div className="mt-4 grid grid-cols-2 gap-x-5 gap-y-4">
              {[...categories, ...(digitalCategory ? [digitalCategory] : [])]
                .filter((category) => (modernCounts.get(category.id) ?? 0) > 0)
                .map((category) => (
                  <div key={category.id} className="flex gap-2">
                    {categoryMark(category)}
                    <div>
                      <p className="text-[0.78rem] font-medium leading-4">
                        {category.label}
                      </p>
                      <p className="mt-0.5 font-mono text-[0.58rem] font-semibold uppercase tracking-[0.03em] text-ink/62">
                        {modernCounts.get(category.id)} snapshot records
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <figcaption className="mt-8">
            <p className="max-w-xl text-[1rem] font-medium leading-[1.62] text-ink/84">
              Three phrases repeat across more than one text in the same selected Gutenberg seed corpus, so their match counts can share a scale here. Modern category rows sit apart and carry no bars: their source, capture rule, and time basis differ from the archival phrase counts.
            </p>
            <p className="mt-4 max-w-xl font-mono text-[0.66rem] font-semibold uppercase leading-5 tracking-[0.06em] text-ink/64">
              Variant + context / selected Gutenberg texts, repeated phrase matches · Modern context / Wikinews revision snapshot · Boundary / archival bars compare only the same source family and rule
            </p>
          </figcaption>
        </figure>

        <section
          id="evidence-archive"
          className="scroll-mt-6 border-t border-ink/70 pt-5"
          aria-labelledby="forever-source-register-title"
        >
          <p className="font-mono text-[0.68rem] font-semibold uppercase tracking-[0.13em] text-fire">
            source register
          </p>
          <h2 id="forever-source-register-title" className="mt-2 text-2xl font-bold leading-[1.05]">
            What each layer can support
          </h2>
          <dl className="mt-7">
            {[
              ["01 Signal", "Google Books Ngram, 1500–2022; public emphasis begins at 1700."],
              ["02 Attestation", "Secondary lexical leads place the spaced form in the late fourteenth century and the one-word form later; exact first use is not project-verified."],
              ["03 Variant", "forever, for ever, forevermore, and forever and ever remain separately measured forms."],
              ["04 Context", "Selected Project Gutenberg texts, 1726–1930, and a separate Wikinews revision snapshot, 2024–2026."],
              ["05 Boundary", "Frequency is not attestation. Sparse or absent context coverage cannot prove that a usage did not exist."],
              ["06 Rights", "Ngram attribution, public-domain source checks, Wikinews licensing, and source URLs remain attached to the archive."],
            ].map(([label, value], index) => (
              <div key={label} className={`grid grid-cols-6 gap-x-3 py-3 ${index > 0 ? "border-t border-ink/14" : ""}`}>
                <dt className="col-span-2 font-mono text-[0.62rem] font-semibold uppercase leading-5 tracking-[0.06em] text-ink/64">
                  {label}
                </dt>
                <dd className="col-span-4 text-[0.82rem] font-medium leading-5 text-ink/78">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
          <p id="origin" className="scroll-mt-6 mt-5 text-[0.75rem] font-medium leading-5 text-ink/66">
            Origin note: the attestation layer is a set of medium-confidence lexical leads, not a comparable pre-1700 corpus and not proof of an earliest surviving occurrence.
          </p>
          <details className="mt-6 border-t border-ink/18 pt-4">
            <summary className="min-h-11 cursor-pointer py-3 font-mono text-[0.66rem] font-semibold uppercase tracking-[0.08em] text-ink/72 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
              Extended source and rights note
            </summary>
            <div className="space-y-3 pb-3 text-[0.78rem] font-medium leading-5 text-ink/72">
              <p>{dataset.modernContext?.source.caveat}</p>
              <p>{dataset.modernContext?.source.licenseNote}</p>
              <p>
                Full project methodology, upstream attribution, calculation methods, and publication rights are recorded on the{" "}
                <Link href="/about" className="border-b border-ink/45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
                  About page
                </Link>
                .
              </p>
            </div>
          </details>
        </section>
      </div>
    </div>
  );
}
