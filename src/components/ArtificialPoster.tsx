import Link from "next/link";
import { ArtificialChart01SemanticChamber } from "@/components/artificial/chart01/ArtificialChart01SemanticChamber";
import { ArtificialChart02PressureDiagram } from "@/components/artificial/chart02/ArtificialChart02PressureDiagram";
import { ArtificialChart03InteractiveSuite } from "@/components/artificial/chart03/ArtificialChart03InteractiveSuite";
import { Nav } from "@/components/Nav";
import { PosterSection } from "@/components/PosterSection";

const artificialPanels = [
  { num: "01", label: "Semantic Chamber", color: "#050510" },
  { num: "02", label: "Under Pressure", color: "#1570AC" },
  { num: "03", label: "Mechanical Reproduction", color: "#A1081F" },
  { num: "04", label: "Simulation", color: "#036C17" },
];

function ArtificialPanelProgress() {
  return (
    <div className="grid border-b border-ink md:grid-cols-4">
      {artificialPanels.map((panel, index) => (
        <div
          key={panel.num}
          className={`grid grid-cols-[4rem_1fr] border-ink ${
            index < artificialPanels.length - 1 ? "border-b md:border-b-0 md:border-r" : ""
          }`}
        >
          <div className="border-r border-ink px-3 py-3 font-mono text-[0.72rem] font-black uppercase tracking-[0.16em] text-ink/45">
            {panel.num}
          </div>
          <div className="px-3 py-3 font-mono text-[0.72rem] font-black uppercase leading-5 tracking-[0.12em]">
            {panel.label}
          </div>
        </div>
      ))}
    </div>
  );
}

export function ArtificialPoster() {
  return (
    <main className="min-h-screen bg-wheat text-ink">
      <div className="mx-auto flex w-full max-w-[1960px] flex-col px-4 py-5 sm:px-7 lg:px-10 xl:px-12">
        <Nav />

        <section className="relative overflow-hidden border-y border-ink py-8 sm:py-10 lg:py-12">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(5,5,16,0.09)_1px,transparent_1px),linear-gradient(180deg,rgba(5,5,16,0.07)_1px,transparent_1px)] bg-[size:72px_72px]" />
          <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-end">
            <div>
              <p className="font-mono text-[0.82rem] font-black uppercase tracking-[0.18em] text-ink/55">
                Words Over Time / word study
              </p>
              <h1 className="mt-5 text-[clamp(4.7rem,15.5vw,17rem)] font-black leading-[0.72] tracking-normal text-ink">
                artificial
              </h1>
              <p className="mt-7 max-w-5xl text-[clamp(1.12rem,2.15vw,2.8rem)] font-black leading-[1.02] text-ink">
                A word built from art, skill, making, rule, and suspicion.
              </p>
              <p className="mt-4 max-w-3xl font-mono text-[clamp(0.76rem,1.02vw,0.96rem)] font-black uppercase leading-6 tracking-[0.12em] text-ink/58">
                Art / artifice / artificer / technical construction / not natural / not fake.
              </p>
            </div>

            <dl className="grid border-y border-ink bg-wheat/74">
              {[
                ["status", "in progress"],
                ["chart 01", "semantic chamber"],
                ["mode", "static-first 3d"],
                ["scope", "pre-ai"],
              ].map(([label, value], index) => (
                <div
                  key={label}
                  className={`grid grid-cols-[7.25rem_1fr] border-ink ${
                    index < 3 ? "border-b" : ""
                  }`}
                >
                  <dt className="border-r border-ink px-3 py-3 font-mono text-[0.74rem] font-black uppercase leading-5 tracking-[0.14em] text-ink/48">
                    {label}
                  </dt>
                  <dd className="px-3 py-3 font-mono text-[0.8rem] font-black uppercase leading-5 tracking-[0.1em]">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <ArtificialPanelProgress />

        <div className="mt-10 min-w-0">
          <div className="mb-10 grid gap-5 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10">
            <p className="font-mono text-[0.82rem] font-black uppercase leading-5 tracking-[0.16em] text-ink/45">
              entry note
            </p>
            <p className="max-w-[1040px] text-[1.08rem] leading-[1.55] text-ink/68">
              The first chart uses a semantic chamber rather than a standard timeline: a static-first spatial apparatus for separating art, skill, contrivance, not-natural contrast, and the later burden of fakery.
            </p>
          </div>

          <PosterSection
            id="chart-1-semantic-chamber"
            eyebrow="01 / semantic chamber"
            title="Artificial before fake"
            intro="A spatial reading of Chart 1, where three semantic planes keep word family, technical construction, and sense boundaries visible at once."
          >
            <ArtificialChart01SemanticChamber />
          </PosterSection>

          <PosterSection
            id="chart-2-under-pressure"
            eyebrow="02 / under pressure"
            title="Artificial Under Pressure"
            intro="A single hover-state diagram: the resting view fixes the abstract pressure structure, and activation reveals the selected artificial reading in place."
          >
            <ArtificialChart02PressureDiagram />
          </PosterSection>

          <PosterSection
            id="chart-3-mechanical-reproduction"
            eyebrow="03 / mechanical reproduction — part i"
            title="In the Age of Mechanical Reproduction"
            intro="Part I maps the turn from artificial objects to reproducible experience: apparatus layers, manufactured senses, and authenticity pressure are read together against a burst-period timeline."
          >
            <ArtificialChart03InteractiveSuite />
          </PosterSection>

          <div className="mt-12 border-t border-ink/80 pb-12 pt-8">
            <div className="flex flex-wrap gap-4 font-mono text-[0.8rem] font-black uppercase tracking-[0.13em]">
              <Link href="/" className="border-b border-ink pb-1 transition hover:border-wine hover:text-wine">
                Back home
              </Link>
              <Link href="/about" className="border-b border-ink pb-1 transition hover:border-wine hover:text-wine">
                About methodology
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
