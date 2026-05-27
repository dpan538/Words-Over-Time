import Link from "next/link";
import {
  PrivacyChart01SemanticWeather,
  type PrivacySemanticWeatherDataset,
} from "@/components/privacy/PrivacyChart01SemanticWeather";
import {
  PrivacyChart01LegalInjury,
  type PrivacyLegalInjuryDataset,
} from "@/components/privacy/PrivacyChart01LegalInjury";
import {
  PrivacyChart01ModernTransit,
  type PrivacyModernTransitDataset,
} from "@/components/privacy/PrivacyChart01ModernTransit";
import { Nav } from "@/components/Nav";
import { PanelProgress } from "@/components/PanelProgress";
import { PosterSection } from "@/components/PosterSection";

type PrivacyPosterProps = {
  semanticWeather: PrivacySemanticWeatherDataset;
  legalInjury: PrivacyLegalInjuryDataset;
  modernTransit: PrivacyModernTransitDataset;
};

const privacyPanels = [
  { num: "01", label: "Semantic Weather", color: "#6C4FA3" },
  { num: "02", label: "Rights Threshold", color: "#DDBE24" },
  { num: "03", label: "Information Boundary", color: "#5FA66B" },
];

export function PrivacyPoster({ semanticWeather, legalInjury, modernTransit }: PrivacyPosterProps) {
  return (
    <main className="min-h-screen bg-[#e9dfc9] text-ink">
      <div className="mx-auto flex w-full max-w-[1960px] flex-col px-4 py-5 sm:px-7 lg:px-10 xl:px-12">
        <Nav />

        <section className="relative overflow-hidden border-y border-ink/72 py-10 sm:py-12 lg:py-14">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(5,5,16,0.075)_1px,transparent_1px),linear-gradient(180deg,rgba(5,5,16,0.065)_1px,transparent_1px)] bg-[size:86px_86px,86px_86px]" />
          <div className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-ink/10" />
          <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-center">
            <div>
              <p className="font-mono text-[0.82rem] font-black uppercase tracking-[0.18em] text-[#7E42B8]">
                Words Over Time / lexical study
              </p>
              <h1 className="mt-5 text-[clamp(5.15rem,14.2vw,14.2rem)] font-black leading-[0.9] tracking-normal text-[#7E42B8]">
                privacy
              </h1>
              <p className="mt-10 max-w-5xl text-[clamp(1.12rem,2.12vw,2.7rem)] font-black leading-[1.04] text-ink">
                A word that moved from seclusion to rights, then into information.
              </p>
              <p className="mt-4 max-w-3xl font-mono text-[clamp(0.76rem,1.02vw,0.96rem)] font-black uppercase leading-6 tracking-[0.12em] text-ink/70">
                Private life / secrecy / observation / intrusion / right to privacy / data boundary.
              </p>
            </div>

            <dl className="grid self-end border-y border-ink/72 bg-[#e9dfc9]/78 lg:self-center">
              {[
                ["study", "word history"],
                ["scope", "1200-1890"],
                ["chart 01", "semantic weather"],
                ["not", "site privacy policy"],
              ].map(([label, value], index) => (
                <div
                  key={label}
                  className={`grid grid-cols-[7.25rem_1fr] border-ink/72 ${
                    index < 3 ? "border-b" : ""
                  }`}
                >
                  <dt className="border-r border-ink/72 px-3 py-3 font-mono text-[0.74rem] font-black uppercase leading-5 tracking-[0.14em] text-privacy-violet/76">
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

        <PanelProgress panels={privacyPanels} className="pb-3 pt-4" />

        <div className="mt-7 min-w-0">
          <div className="mb-8 grid gap-5 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10">
            <p className="font-mono text-[0.82rem] font-black uppercase leading-5 tracking-[0.16em] text-privacy-violet/70">
              entry note
            </p>
            <p className="max-w-[1040px] text-[1.08rem] leading-[1.55] text-ink/68">
              Privacy does not begin as a digital panic. Before it becomes a civil right or an information boundary,
              it moves through older fields of private life, secrecy, withdrawal, and pressure from public exposure.
              This first chart keeps that early motion intentionally quiet.
            </p>
          </div>

          <PosterSection
            id="chart-1-semantic-weather"
            eyebrow="01 / semantic formation"
            title={semanticWeather.content_plan.chart01_title}
            intro={semanticWeather.content_plan.chart01_intro}
          >
            <div className="mb-6 grid gap-3 border-t border-ink/25 pt-5 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10">
              <p className="font-mono text-[0.82rem] font-black uppercase leading-5 tracking-[0.16em] text-[#7E42B8]">
                01A / semantic weather
              </p>
              <p className="max-w-[980px] font-mono text-[0.78rem] font-black uppercase leading-5 tracking-[0.12em] text-ink/52">
                1200-1890 / pre-rights semantic field
              </p>
            </div>
            <PrivacyChart01SemanticWeather dataset={semanticWeather} />

            <div className="mt-16 border-t border-ink/35 pt-10">
              <div className="mb-8 grid gap-5 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10">
                <p className="font-mono text-[0.82rem] font-black uppercase leading-5 tracking-[0.16em] text-[#7E42B8]">
                  01B / legal injury
                </p>
                <div>
                  <h3 className="max-w-[920px] text-[clamp(1.22rem,2vw,1.95rem)] font-black leading-[1.02] tracking-normal text-ink">
                    From Privacy to Legal Injury
                  </h3>
                  <p className="mt-2 max-w-[980px] text-[1.02rem] leading-[1.55] text-ink/68">
                    After 1890, privacy starts to become a legal object: not just seclusion or private life, but
                    a claim about publicity, likeness, intrusion, injury, and eventually rights language.
                  </p>
                </div>
              </div>
              <PrivacyChart01LegalInjury dataset={legalInjury} />
            </div>

            <div className="mt-16 border-t border-ink/35 pt-10">
              <div className="mb-8 grid gap-5 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10">
                <p className="font-mono text-[0.82rem] font-black uppercase leading-5 tracking-[0.16em] text-[#7E42B8]">
                  01C / modern transit
                </p>
                <div>
                  <h3 className="max-w-[940px] text-[clamp(1.22rem,2vw,1.95rem)] font-black leading-[1.02] tracking-normal text-ink">
                    From Legal Right to Data System
                  </h3>
                  <p className="mt-2 max-w-[1000px] text-[1.02rem] leading-[1.55] text-ink/68">
                    After 1950, privacy branches into routes: private life and rights, data protection,
                    platform interfaces, surveillance pressure, breach risk, identity, consent, and AI-era sensitive data.
                  </p>
                </div>
              </div>
              <PrivacyChart01ModernTransit dataset={modernTransit} />
            </div>
          </PosterSection>

          <div className="mt-12 border-t border-ink/80 pb-12 pt-0">
            <div className="mt-8 flex flex-wrap gap-4 font-mono text-[0.8rem] font-black uppercase tracking-[0.13em]">
              <Link href="/" className="border-b border-ink pb-1 transition hover:border-privacy-violet hover:text-privacy-violet">
                Back home
              </Link>
              <Link href="/about" className="border-b border-ink pb-1 transition hover:border-privacy-violet hover:text-privacy-violet">
                About methodology
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
