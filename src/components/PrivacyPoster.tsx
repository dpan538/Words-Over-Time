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
import {
  PrivacyChart02GeoAttention,
  type PrivacyGeoAttentionDataset,
} from "@/components/privacy/PrivacyChart02GeoAttention";
import {
  PrivacyChart02ElevationDistribution,
  type PrivacyGeoElevationDataset,
} from "@/components/privacy/PrivacyChart02ElevationDistribution";
import {
  PrivacyChart02DemographicContext,
  type PrivacyGeoDemographicContextDataset,
} from "@/components/privacy/PrivacyChart02DemographicContext";
import {
  PrivacyChart03GovernanceInterface,
  type PrivacyResearchExpansionDataset,
} from "@/components/privacy/PrivacyChart03GovernanceInterface";
import { PanelProgress } from "@/components/PanelProgress";
import { PosterSection } from "@/components/PosterSection";

type PrivacyPosterProps = {
  semanticWeather: PrivacySemanticWeatherDataset;
  legalInjury: PrivacyLegalInjuryDataset;
  modernTransit: PrivacyModernTransitDataset;
  geoAttention: PrivacyGeoAttentionDataset;
  geoElevation: PrivacyGeoElevationDataset;
  geoDemographic: PrivacyGeoDemographicContextDataset;
  researchExpansion: PrivacyResearchExpansionDataset;
};

const privacyPanels = [
  { num: "01", label: "Semantic Formation", color: "#6C4FA3" },
  { num: "02", label: "World Signal", color: "#2f7891" },
  { num: "03", label: "Governance Interface", color: "#5FA66B" },
];

export function PrivacyPoster({
  semanticWeather,
  legalInjury,
  modernTransit,
  geoAttention,
  geoElevation,
  geoDemographic,
  researchExpansion,
}: PrivacyPosterProps) {
  return (
    <div className="min-h-screen bg-wheat text-ink">
      <div className="mx-auto flex w-full max-w-[1960px] flex-col px-4 py-5 sm:px-7 lg:px-10 xl:px-12">
        <PanelProgress panels={privacyPanels} className="pb-3 pt-4" />

        <div className="mt-7 min-w-0">
          <div className="mb-8 grid gap-5 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10">
            <p className="font-mono text-[0.82rem] font-black uppercase leading-5 tracking-[0.16em] text-privacy-violet/70">
              entry note
            </p>
            <p className="max-w-[1040px] text-[1.08rem] leading-[1.55] text-ink/74">
              Privacy does not begin as a digital panic, and it does not end as a single legal right. This page follows
              the word through an older semantic field of private life and secrecy, a legal and data-system transition,
              a geographic and demographic expansion of recovered signal, and a final interface layer where courts, regulators, platforms,
              public attention, and technical research braid the word into modern governance.
            </p>
          </div>

          <span id="etymology" className="block scroll-mt-6" aria-hidden="true" />
          <span id="privacy-seclusion" className="block scroll-mt-6" aria-hidden="true" />
          <PosterSection
            id="chart-1-semantic-weather"
            eyebrow="01 / semantic formation"
            title={semanticWeather.content_plan.chart01_title}
            intro={semanticWeather.content_plan.chart01_intro}
          >
            <div className="mb-6 grid gap-3 border-t border-ink/25 pt-5 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10">
              <p className="font-mono text-[0.82rem] font-black uppercase leading-5 tracking-[0.16em] text-privacy-violet">
                01A / semantic weather
              </p>
              <p className="max-w-[980px] font-mono text-[0.78rem] font-black uppercase leading-5 tracking-[0.12em] text-ink/52">
                1200-1890 / pre-rights semantic field
              </p>
            </div>
            <PrivacyChart01SemanticWeather dataset={semanticWeather} />

            <div id="legal-and-data-meaning" className="mt-16 scroll-mt-6 pt-10">
              <div className="mb-8 grid gap-5 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10">
                <p className="font-mono text-[0.82rem] font-black uppercase leading-5 tracking-[0.16em] text-privacy-violet">
                  01B / legal injury
                </p>
                <div>
                  <h3 className="max-w-[920px] text-[clamp(1.22rem,2vw,1.95rem)] font-black leading-[1.02] tracking-normal text-ink">
                    From Privacy to Legal Injury
                  </h3>
                  <p className="mt-2 max-w-[980px] text-[1.02rem] leading-[1.55] text-ink/74">
                    After 1890, privacy starts to become a legal object: not just seclusion or private life, but
                    a claim about publicity, likeness, intrusion, injury, and eventually rights language.
                  </p>
                </div>
              </div>
              <PrivacyChart01LegalInjury dataset={legalInjury} />
            </div>

            <div className="mt-16 pt-10">
              <div className="mb-1 grid gap-5 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10">
                <p className="font-mono text-[0.82rem] font-black uppercase leading-5 tracking-[0.16em] text-privacy-violet">
                  01C / modern transit
                </p>
                <div>
                  <h3 className="max-w-[940px] text-[clamp(1.22rem,2vw,1.95rem)] font-black leading-[1.02] tracking-normal text-ink">
                    From Legal Right to Data System
                  </h3>
                  <p className="mt-2 max-w-[1000px] text-[1.02rem] leading-[1.55] text-ink/74">
                    After 1950, privacy branches into routes: private life and rights, data protection,
                    platform interfaces, surveillance pressure, breach risk, identity, consent, and AI-era sensitive data.
                  </p>
                </div>
              </div>
              <PrivacyChart01ModernTransit dataset={modernTransit} />
            </div>
          </PosterSection>

          <span id="chart-2-world-signal" className="block scroll-mt-6" aria-hidden="true" />
          <PosterSection
            id="chart-2-geo-attention"
            eyebrow="02 / geographic attention"
            title="Privacy as a World Signal"
            intro="The next layer leaves the timeline and asks where privacy becomes visible: through country-level density, city and institution points, and high-probability paths between concentrated attention hubs."
          >
            <PrivacyChart02GeoAttention dataset={geoAttention} />

            <div className="mt-16 pt-10">
              <div className="mb-8 grid gap-5 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10">
                <p className="font-mono text-[0.98rem] font-black uppercase leading-6 tracking-[0.16em] text-privacy-violet">
                  02B / elevation signal
                </p>
                <div>
                  <h3 className="max-w-[940px] text-[clamp(1.22rem,2vw,1.95rem)] font-black leading-[1.02] tracking-normal text-ink">
                    Privacy Signal Against Altitude
                  </h3>
                  <p className="mt-2 max-w-[1000px] text-[1.02rem] leading-[1.55] text-ink/74">
                    The same recovered geo layer is folded by elevation: not to claim that altitude causes privacy
                    attention, but to test whether the signal gathers in low, coastal, institutional, or highland places.
                  </p>
                </div>
              </div>
              <PrivacyChart02ElevationDistribution dataset={geoElevation} />
            </div>

            <div className="mt-16 pt-10">
              <div className="mb-1 grid gap-5 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10">
                <p className="font-mono text-[0.98rem] font-black uppercase leading-6 tracking-[0.16em] text-privacy-violet">
                  02C / demographic context
                </p>
                <div>
                  <h3 className="max-w-[980px] text-[clamp(1.22rem,2vw,1.95rem)] font-black leading-[1.02] tracking-normal text-ink">
                    Privacy Signal, Population, and Life Expectancy
                  </h3>
                  <p className="mt-2 max-w-[1040px] text-[1.02rem] leading-[1.55] text-ink/74">
                    A macro field where population scale and life expectancy become spatial scaffolding; privacy
                    appears as recovered signal density, mesh, and motion rather than a single explanation.
                  </p>
                </div>
              </div>
              <PrivacyChart02DemographicContext dataset={geoDemographic} />
              <div className="grid gap-5 bg-wheat px-4 py-8 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10 lg:px-6">
                <p className="font-mono text-[0.82rem] font-black uppercase leading-5 tracking-[0.16em] text-privacy-violet">
                  observed relation
                </p>
                <p className="max-w-[1080px] text-[1.02rem] leading-[1.58] text-ink/74">
                  In the joined country records, population is plotted on a logarithmic x-axis and life expectancy on
                  the y-axis, while recovered privacy search frequency is expressed through node density, local mesh,
                  and per-million signal. Larger populations often produce larger absolute record counts, but the
                  per-million layer makes smaller countries visible when their privacy frequency is high relative to
                  population. Countries with similar life expectancy can still show different privacy densities, so the
                  field is read as a macro comparison between demographic scale, longevity context, and recovered word
                  frequency rather than as a single directional relationship.
                </p>
              </div>
            </div>
          </PosterSection>

          <span id="privacy-and-surveillance" className="block scroll-mt-6" aria-hidden="true" />
          <PosterSection
            id="chart-3-governance-interface"
            eyebrow="03 / governance interface"
            title="Privacy Becomes an Interface"
            intro="The final layer turns away from geography and gathers the unused research-expansion sources into a density-spaced semantic time field: same-color circles mark related privacy branches, and black connector lines show how those terms are sequenced across the 1890-2026 axis."
            className="mt-6 border-t border-ink/35 pt-10"
          >
            <PrivacyChart03GovernanceInterface dataset={researchExpansion} />
            <div className="grid gap-5 border-b border-ink/25 bg-[#fff8e6] px-4 py-7 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10 lg:px-6">
              <p className="font-mono text-[0.82rem] font-black uppercase leading-5 tracking-[0.16em] text-privacy-violet">
                semantic trace
              </p>
              <p className="max-w-[1080px] text-[1.02rem] leading-[1.58] text-ink/74">
                The circles do not measure time as equal distance. They group the years where the recovered data becomes
                dense, so the recent platform, policy, surveillance, and technical terms occupy more visual room than a
                linear 1890-2026 scale would allow. The branches show privacy moving from legal-right vocabulary into
                policy language, interface controls, public-risk language, and technical governance terms, while each
                node remains tied to a recovered record count rather than a purely decorative category.
              </p>
            </div>
          </PosterSection>

          <div className="mt-12 pb-8 pt-0">
            <div className="grid gap-5 border-b border-ink/80 py-8 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10">
              <p className="font-mono text-[0.82rem] font-black uppercase leading-5 tracking-[0.16em] text-privacy-violet">
                next boundary
              </p>
              <p className="max-w-[1040px] text-[1.08rem] leading-[1.55] text-ink/80">
                By the end of the page, privacy is no longer only a moral boundary or a legal injury. It has become
                an operating surface where forms, settings, policies, platforms, courts, archives, and technical systems
                keep translating older desires for protected life into rules. What remains open is where the next
                boundary will be drawn, and who gets to draw it.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
