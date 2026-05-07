import Link from "next/link";
import { Nav } from "@/components/Nav";
import { TimelinePlaceholder } from "@/components/TimelinePlaceholder";

const metadataItems = [
  ["Status", "demo word"],
  ["Time range", "1700 / 1800 - 2026 planned"],
  ["Data mode", "hybrid corpus model"],
  ["Current state", "sample structure"],
];

const evidenceItems = [
  ["Earliest attested usage", "to be verified"],
  ["Earliest detected in our corpus", "pending corpus check"],
  ["Earliest scanned-book occurrence", "pending scan verification"],
];

export default function ForeverPage() {
  return (
    <main className="min-h-screen bg-ink text-wheat">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-14 px-5 py-5 sm:px-8 sm:py-7">
        <Nav tone="light" />

        <section className="grid gap-8 py-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-sun">
              demo archive entry
            </p>
            <h1 className="mt-4 text-[clamp(5rem,18vw,17rem)] font-black leading-[0.78] tracking-normal text-blaze">
              forever
            </h1>
            <p className="mt-7 max-w-2xl text-2xl font-bold leading-tight text-wheat sm:text-4xl">
              A word traced through permanence, repetition, devotion, memory,
              and time.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {metadataItems.map(([label, value]) => (
              <article
                key={label}
                className="border border-wheat/18 bg-wheat/[0.04] p-4 transition duration-200 hover:-translate-y-0.5 hover:border-curious hover:bg-wheat/[0.08]"
              >
                <p className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-curious">
                  {label}
                </p>
                <p className="mt-2 text-lg font-black text-wheat">{value}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {evidenceItems.map(([label, value]) => (
            <article
              key={label}
              className="border border-wheat/20 bg-wheat p-5 text-ink transition duration-200 hover:-translate-y-0.5 hover:border-blaze hover:shadow-[6px_6px_0_#F06B04]"
            >
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-fire">
                {label}
              </p>
              <p className="mt-5 text-2xl font-black leading-none text-ink">
                {value}
              </p>
            </article>
          ))}
        </section>

        <TimelinePlaceholder />

        <section className="border-l-8 border-blaze bg-wheat p-5 text-ink sm:p-7">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-wine">
            method note
          </p>
          <p className="mt-4 max-w-4xl text-xl font-bold leading-8">
            This page currently uses placeholder data. The final version will
            separate dictionary attestation, corpus detection, scanned-book
            evidence, and recent monitor data.
          </p>
        </section>

        <div className="flex flex-wrap gap-4 pb-10 text-sm font-bold uppercase tracking-[0.16em]">
          <Link
            href="/"
            className="border-b border-wheat/35 pb-1 transition hover:border-blaze hover:text-sun"
          >
            Back home
          </Link>
          <Link
            href="/about"
            className="border-b border-wheat/35 pb-1 transition hover:border-blaze hover:text-sun"
          >
            About methodology
          </Link>
        </div>
      </div>
    </main>
  );
}
