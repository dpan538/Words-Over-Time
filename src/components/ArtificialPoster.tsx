import { ArtificialChart01SemanticChamber } from "@/components/artificial/chart01/ArtificialChart01SemanticChamber";
import { ArtificialChart02PressureDiagram } from "@/components/artificial/chart02/ArtificialChart02PressureDiagram";
import { ArtificialChart03InteractiveSuite } from "@/components/artificial/chart03/ArtificialChart03InteractiveSuite";
import { ArtificialChart04APejorationOrbit } from "@/components/artificial/chart04/ArtificialChart04APejorationOrbit";
import { ArtificialChart04BSemanticAttractor } from "@/components/artificial/chart04/ArtificialChart04BSemanticAttractor";
import { ArtificialChart05HumanBoundary } from "@/components/artificial/chart05/ArtificialChart05HumanBoundary";
import { PosterSection } from "@/components/PosterSection";

const artificialPanels = [
  { num: "01", label: "Semantic Chamber", color: "#050510" },
  { num: "02", label: "Under Pressure", color: "#1570AC" },
  { num: "03", label: "Mechanical Reproduction", color: "#A1081F" },
  { num: "04", label: "Suspicion / Distance", color: "#036C17" },
  { num: "05", label: "Human Boundary", color: "#B15825" },
];

function ArtificialPanelProgress() {
  return (
    <div className="grid border-b border-ink md:grid-cols-5">
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
    <div className="bg-wheat text-ink">
      <div className="mx-auto flex w-full max-w-[1960px] flex-col px-4 py-5 sm:px-7 lg:px-10 xl:px-12">
        <ArtificialPanelProgress />

        <div className="mt-10 min-w-0">
          <div className="mb-10 grid gap-5 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10">
            <p className="font-mono text-[0.82rem] font-black uppercase leading-5 tracking-[0.16em] text-ink/45">
              entry note
            </p>
            <p className="max-w-[1040px] text-[1.08rem] leading-[1.55] text-ink/68">
              Five linked charts trace artificial from artifice before fake into manufactured perception, mechanical reproduction, suspicion, semantic distance, and finally the boundary where artificial enters bodies, voices, and cognition.
            </p>
          </div>

          <span id="original-meaning" className="block scroll-mt-6" aria-hidden="true" />
          <PosterSection
            id="chart-1-semantic-chamber"
            eyebrow="01 / semantic chamber"
            title="Artificial before fake"
            intro="A spatial reading of Chart 1, where three semantic planes keep word family, technical construction, and sense boundaries visible at once."
          >
            <ArtificialChart01SemanticChamber />
          </PosterSection>

          <span id="created-by-artificial-means" className="block scroll-mt-6" aria-hidden="true" />
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

          <PosterSection
            id="chart-4-artificial-suspicion"
            eyebrow="04 / artificial suspicion"
            title="Suspicion Orbit"
            intro="Artificial gathers negative charge through returning contexts: feigned emotion and affected manners later reappear through food trust, reformulation, and absence-claim language."
          >
            <ArtificialChart04APejorationOrbit />
          </PosterSection>

          <PosterSection
            id="chart-4-artificial-semantic-distance"
            eyebrow="04 / semantic distance"
            title="Semantic Attractor"
            intro="A semantic field for artificial as made, synthetic, simulated, realistic, and fake-adjacent without collapsing those relations into one synonym map: artificial stays closest to made and synthetic meanings, bends through simulation and realism, and only then drifts toward fake-adjacent uses."
          >
            <ArtificialChart04BSemanticAttractor />
          </PosterSection>

          <span id="artificial-before-ai" className="block scroll-mt-6" aria-hidden="true" />
          <PosterSection
            id="chart-5-artificial-human-boundary"
            eyebrow="05 / human boundary"
            title="Artificial Enters the Human"
            intro="A layered 3D stack: artificial starts outside the body as apparatus, then moves through support, replacement, reproduction, and finally human process, voice, and cognition."
          >
            <ArtificialChart05HumanBoundary />
          </PosterSection>
        </div>
      </div>
    </div>
  );
}
