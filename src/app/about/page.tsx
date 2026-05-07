import Link from "next/link";
import { MetricCard } from "@/components/MetricCard";
import { Nav } from "@/components/Nav";
import { foreverMetrics } from "@/data/words";

const hybridModel = [
  "long-run book/corpus frequency data",
  "lexical or dictionary evidence for attestation",
  "verified scanned-book or public-domain snippets",
  "interpretive annotations",
];

const distinctions = [
  "earliest attested usage",
  "earliest detected in our corpus",
  "earliest scanned-book occurrence",
];

const cautions = [
  "OCR errors",
  "corpus bias",
  "spelling variants",
  "semantic drift",
  "licensing limits",
  "uncertainty in historical claims",
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-wheat text-ink">
      <div className="flex w-full max-w-[1440px] flex-col gap-16 px-5 py-5 sm:px-8 sm:py-7 lg:px-12">
        <Nav />

        <section className="max-w-6xl py-12 lg:py-16">
          <p className="text-base font-black uppercase tracking-[0.24em] text-fire sm:text-xl">
            about / methodology
          </p>
          <h1 className="mt-5 text-[clamp(4rem,14vw,11rem)] font-black leading-[0.82] tracking-normal">
            curated, not infinite.
          </h1>
          <p className="mt-8 max-w-4xl text-2xl font-bold leading-tight text-ink/80 sm:text-4xl">
            Words Over Time is a curated historical word-frequency
            visualization project. It is not a general search engine.
          </p>
        </section>

        <section className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <h2 className="text-4xl font-black leading-none sm:text-6xl">
              hybrid model
            </h2>
            <p className="mt-5 text-lg leading-8 text-ink/72">
              The project will combine several evidence types instead of
              pretending one chart can settle every historical claim.
            </p>
          </div>
          <ol className="grid gap-3">
            {hybridModel.map((item, index) => (
              <li
                key={item}
                className="flex gap-4 border border-ink/18 bg-ink p-4 text-wheat transition duration-200 hover:-translate-x-1 hover:border-blaze hover:bg-nice"
              >
                <span className="text-xl font-black text-sun">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-xl font-bold">{item}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {distinctions.map((item) => (
            <article
              key={item}
              className="border border-ink/18 bg-white/20 p-5 transition duration-200 hover:-translate-y-1 hover:border-nice hover:bg-white/40"
            >
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-nice">
                distinguishes
              </p>
              <h3 className="mt-4 text-2xl font-black leading-tight">{item}</h3>
            </article>
          ))}
        </section>

        <section className="grid gap-6 border-y border-ink/20 py-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h2 className="text-4xl font-black leading-none">
              normalized where possible
            </h2>
            <p className="mt-5 text-lg leading-8 text-ink/74">
              Frequency should be presented as normalized frequency rather than
              raw counts where the source permits it, so changes in corpus size
              do not masquerade as changes in usage.
            </p>
          </div>
          <div>
            <h2 className="text-4xl font-black leading-none">
              careful about uncertainty
            </h2>
            <div className="mt-5 flex flex-wrap gap-2">
              {cautions.map((item) => (
                <span
                  key={item}
                  className="border border-ink/20 px-3 py-2 text-sm font-bold uppercase tracking-[0.12em] text-ink/74 transition hover:-translate-y-0.5 hover:border-fire hover:text-fire"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section>
          <div className="mb-7 max-w-4xl">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-fire sm:text-base">
              analysis modules
            </p>
            <h2 className="mt-4 text-4xl font-black leading-none sm:text-6xl">
              what the archive will measure
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {foreverMetrics.map((metric) => (
              <MetricCard
                key={metric.title}
                title={metric.title}
                body={metric.body}
              />
            ))}
          </div>
        </section>

        <section className="bg-ink p-5 text-wheat sm:p-7">
          <p className="max-w-4xl text-2xl font-black leading-tight">
            The first complete demo word is{" "}
            <Link
              href="/words/forever"
              className="text-blaze underline decoration-blaze/60 underline-offset-4 transition hover:text-sun"
            >
              forever
            </Link>
            . Depression, privacy, data, artificial, and intelligence are
            planned for later.
          </p>
        </section>
      </div>
    </main>
  );
}
