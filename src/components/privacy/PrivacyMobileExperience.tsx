"use client";

import Link from "next/link";
import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

type MobilePeriod = {
  period_id: string;
  label: string;
  start_year: number;
  end_year: number;
  interpretation: string;
  data_basis: string;
};

type MobilePeriodScore = {
  period_id: string;
  track_id: string;
  normalized_score: number;
  evidence_count: number;
  top_terms: Array<{
    term: string;
    mean_frequency_per_million: number;
  }>;
  data_quality: string;
};

type MobileHotspot = {
  country: string;
  country_code: string;
  latitude: number;
  longitude: number;
  record_count: number;
  peak_year: number | null;
  density_score: number;
  density_class: string;
  top_queries: Array<{
    query: string;
    count: number;
  }>;
};

type MobileTerm = {
  term?: string;
  key?: string;
  count: number;
};

type PrivacyMobileExperienceProps = {
  periods: MobilePeriod[];
  periodScores: MobilePeriodScore[];
  hotspots: MobileHotspot[];
  geoStatistics: {
    source_total_records: number;
    map_country_count: number;
    map_city_point_count: number;
    radiation_link_count: number;
  };
  policyTerms: MobileTerm[];
  governanceRecordCount: number;
  governanceLimitation: string;
};

const chapters = [
  { code: "00", label: "Word dial", color: "#6F3AA6" },
  { code: "01", label: "Root cards", color: "#6F3AA6" },
  { code: "02", label: "Semantic stack", color: "#2F9F5F" },
  { code: "03", label: "Protected space", color: "#1570AC" },
  { code: "04", label: "Legal injury", color: "#E1B900" },
  { code: "05", label: "World signal", color: "#1570AC" },
  { code: "06", label: "Interface cards", color: "#2F9F5F" },
  { code: "07", label: "Privacy control", color: "#6F3AA6" },
] as const;

const cardColors = ["#6F3AA6", "#2F9F5F", "#1570AC", "#E1B900"];
const numberFormatter = new Intl.NumberFormat("en-US");
const tickMarks = Array.from({ length: 72 }, (_, index) => index);
const gridCells = Array.from({ length: 12 * 16 }, (_, index) => index);
const hotspotPositions: Record<string, { x: number; y: number }> = {
  US: { x: 22, y: 31 },
  CA: { x: 16, y: 17 },
  GB: { x: 47, y: 25 },
  NL: { x: 53, y: 14 },
  DE: { x: 61, y: 29 },
  CN: { x: 77, y: 34 },
  IN: { x: 67, y: 50 },
  BR: { x: 36, y: 67 },
  ZA: { x: 56, y: 76 },
  AU: { x: 85, y: 73 },
};

function clamp(value: number, minimum = 0, maximum = 1) {
  return Math.min(maximum, Math.max(minimum, value));
}

function formatNumber(value: number) {
  return numberFormatter.format(value);
}

function primaryScore(periodId: string, scores: MobilePeriodScore[]) {
  return scores
    .filter((score) => score.period_id === periodId)
    .sort((a, b) => b.normalized_score - a.normalized_score)[0];
}

function localProgress(progress: number, index: number) {
  return clamp(progress - index + 0.5);
}

function SceneFrame({
  progress,
  index,
  tone = "light",
  children,
}: {
  progress: number;
  index: number;
  tone?: "light" | "dark";
  children: ReactNode;
}) {
  const distance = progress - index;
  const translate = clamp(distance, -1.05, 1.05) * -100;
  const active = Math.abs(distance) <= 0.5;

  return (
    <section
      className={[
        "absolute inset-0 flex flex-col overflow-hidden px-5 pb-24 pt-[max(1.35rem,env(safe-area-inset-top))]",
        tone === "dark" ? "bg-ink text-wheat" : "bg-wheat text-ink",
      ].join(" ")}
      style={{
        display: Math.abs(distance) > 1.05 ? "none" : "flex",
        opacity: 1,
        transform: "translate3d(0," + translate + "svh,0)",
        pointerEvents: active ? "auto" : "none",
        zIndex: 1,
      }}
      aria-hidden={!active}
      inert={!active}
    >
      {children}
    </section>
  );
}

function SceneHeader({
  code,
  label,
  detail,
  color,
  dark = false,
}: {
  code: string;
  label: string;
  detail: string;
  color: string;
  dark?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 font-mono text-[0.7rem] font-black uppercase tracking-[0.12em]">
      <span style={{ color }}>{code} / {label}</span>
      <span className={["max-w-[11.5rem] text-right leading-[1.05rem]", dark ? "text-wheat/56" : "text-ink/55"].join(" ")}>
        {detail}
      </span>
    </div>
  );
}

function RadialTicks({
  progress,
  color,
  size = 278,
  children,
}: {
  progress: number;
  color: string;
  size?: number;
  children?: ReactNode;
}) {
  const radius = size / 2 - 13;

  return (
    <div
      className="relative grid shrink-0 place-items-center rounded-full"
      style={{
        width: size,
        height: size,
        background: "conic-gradient(" + color + " " + Math.round(progress * 100) + "%,rgba(5,5,16,0.09) 0)",
      }}
    >
      <div className="absolute inset-[7px] rounded-full bg-wheat" />
      {tickMarks.map((tick) => (
        <span
          key={tick}
          className="absolute left-1/2 top-1/2 block origin-center bg-ink"
          style={{
            width: tick % 6 === 0 ? 2 : 1,
            height: tick % 6 === 0 ? 11 : 6,
            opacity: tick / tickMarks.length <= progress ? 1 : 0.16,
            transform: "translate(-50%,-50%) rotate(" + tick * 5 + "deg) translateY(-" + radius + "px)",
          }}
        />
      ))}
      <div className="relative z-10 grid h-[68%] w-[68%] place-items-center rounded-full border-2 border-ink bg-wheat">
        {children}
      </div>
    </div>
  );
}

function MenuGlyph({ open }: { open: boolean }) {
  return (
    <span className="relative block h-5 w-5" aria-hidden="true">
      <span
        className={[
          "absolute left-1/2 top-1/2 h-[2px] w-5 bg-current transition duration-300",
          open ? "-translate-x-1/2 -translate-y-1/2 rotate-45" : "-translate-x-1/2 -translate-y-[5px]",
        ].join(" ")}
      />
      <span
        className={[
          "absolute left-1/2 top-1/2 h-[2px] bg-current transition duration-300",
          open ? "w-5 -translate-x-1/2 -translate-y-1/2 -rotate-45" : "w-3 -translate-x-1/2 translate-y-[3px]",
        ].join(" ")}
      />
    </span>
  );
}

export function PrivacyMobileExperience({
  periods,
  periodScores,
  hotspots,
  geoStatistics,
  policyTerms,
  governanceRecordCount,
  governanceLimitation,
}: PrivacyMobileExperienceProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const scrollFrameRef = useRef(0);
  const [progress, setProgress] = useState(0);
  const [activeChapter, setActiveChapter] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [flippedTerm, setFlippedTerm] = useState<number | null>(null);
  const [selectedHotspot, setSelectedHotspot] = useState(0);

  const visiblePeriods = periods.slice(0, 4);
  const visibleTerms = policyTerms.slice(0, 4);
  const visibleHotspots = hotspots.slice(0, 10);
  const activeHotspot = visibleHotspots[selectedHotspot] ?? visibleHotspots[0];

  useEffect(() => {
    const updateProgress = () => {
      scrollFrameRef.current = 0;
      const root = rootRef.current;
      if (!root) return;
      const rect = root.getBoundingClientRect();
      const scrollable = Math.max(1, root.offsetHeight - window.innerHeight);
      const next = clamp(-rect.top / scrollable) * (chapters.length - 1);
      setProgress((current) => (Math.abs(current - next) > 0.002 ? next : current));
      setActiveChapter(Math.max(0, Math.min(chapters.length - 1, Math.round(next))));
    };

    const scheduleUpdate = () => {
      if (scrollFrameRef.current) return;
      scrollFrameRef.current = window.requestAnimationFrame(updateProgress);
    };

    updateProgress();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate, { passive: true });
    return () => {
      if (scrollFrameRef.current) window.cancelAnimationFrame(scrollFrameRef.current);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, []);

  const goToChapter = (index: number) => {
    const root = rootRef.current;
    if (!root) return;
    const rootTop = window.scrollY + root.getBoundingClientRect().top;
    const scrollable = root.offsetHeight - window.innerHeight;
    window.scrollTo({
      top: rootTop + scrollable * (index / (chapters.length - 1)),
      behavior: "smooth",
    });
    setMenuOpen(false);
  };

  const rootLocal = localProgress(progress, 1);
  const stackLocal = localProgress(progress, 2);
  const boundaryLocal = localProgress(progress, 3);
  const legalLocal = localProgress(progress, 4);
  const worldLocal = localProgress(progress, 5);
  const interfaceLocal = localProgress(progress, 6);
  const controlLocal = localProgress(progress, 7);
  const activeScene = chapters[activeChapter] ?? chapters[0];

  return (
    <div ref={rootRef} className="relative h-[800svh] bg-wheat md:hidden">
      <div className="sticky top-0 h-[100svh] overflow-hidden bg-wheat">
        <SceneFrame progress={progress} index={0}>
          <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(circle,rgba(5,5,16,0.18)_1px,transparent_1px)] [background-size:18px_18px]" />
          <SceneHeader code="00" label="word dial" detail="scroll to wind the history" color="#6F3AA6" />

          <div className="relative mt-5 flex items-baseline justify-between border-b-2 border-ink pb-3">
            <h1 className="text-[2.6rem] font-black lowercase leading-none tracking-[-0.065em]">privacy</h1>
            <span className="font-mono text-[0.7rem] font-black uppercase tracking-[0.11em] text-privacy-violet">1200—2026</span>
          </div>

          <div className="relative my-auto grid place-items-center">
            <RadialTicks progress={clamp(progress + 0.18)} color="#6F3AA6">
              <div className="text-center">
                <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-ink font-mono text-[0.7rem] font-black uppercase tracking-[0.1em] text-wheat">
                  scroll
                </span>
                <p className="mt-4 max-w-[9rem] text-[0.88rem] font-bold leading-[1.05]">wind the word through time</p>
              </div>
            </RadialTicks>
            <div className="absolute -bottom-7 grid w-full grid-cols-3 gap-2">
              {["seclusion", "right", "interface"].map((term) => (
                <span key={term} className="grid min-h-12 place-items-center whitespace-nowrap rounded-full border-2 border-ink bg-wheat px-2 font-mono text-[0.75rem] font-black uppercase tracking-[0.04em]">
                  {term}
                </span>
              ))}
            </div>
          </div>

          <div className="relative grid grid-cols-[1fr_auto] items-end gap-4 border-t-2 border-ink pt-3">
            <p className="max-w-[16rem] text-[0.9rem] font-bold leading-[1.28]">
              One word; eight visual states. The page advances only through ordinary vertical scrolling.
            </p>
            <span className="whitespace-nowrap font-mono text-[0.68rem] font-black uppercase tracking-[0.1em] text-privacy-violet">↓ begin</span>
          </div>
        </SceneFrame>

        <SceneFrame progress={progress} index={1}>
          <SceneHeader code="01" label="root cards" detail="early meanings separate as you scroll" color="#6F3AA6" />
          <div className="mt-5 border-y-2 border-ink py-3">
            <p className="font-mono text-[0.68rem] font-black uppercase tracking-[0.1em] text-ink/60">before a legal right</p>
          </div>

          <div className="relative my-auto h-[31rem] max-h-[62svh] [perspective:900px]">
            {visiblePeriods.map((period, index) => {
              const score = primaryScore(period.period_id, periodScores);
              const spread = (index - 1.5) * 66 * rootLocal;
              const rotation = (index - 1.5) * 4 * rootLocal;
              return (
                <article
                  key={period.period_id}
                  className="absolute inset-x-0 top-1/2 h-[15rem] -translate-y-1/2 overflow-hidden rounded-[2rem] border-2 border-ink bg-wheat p-5 shadow-[7px_7px_0_#050510] transition-none"
                  style={{
                    transform: "translate3d(0,calc(-50% + " + spread + "px),0) rotate(" + rotation + "deg) scale(" + (1 - index * 0.025) + ")",
                    zIndex: visiblePeriods.length - index,
                    backgroundImage: "repeating-linear-gradient(" + (95 + index * 8) + "deg,transparent 0 14px,rgba(5,5,16,0.06) 14px 15px)",
                  }}
                >
                  <div className="flex items-start justify-between font-mono text-[0.7rem] font-black uppercase tracking-[0.08em]">
                    <span>{period.start_year}—{period.end_year}</span>
                    <span style={{ color: cardColors[index] }}>{String(index + 1).padStart(2, "0")}</span>
                  </div>
                  <p className="mt-10 max-w-[15rem] text-[1.75rem] font-black leading-[0.9] tracking-[-0.055em]">{period.label}</p>
                  <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between border-t border-ink pt-3">
                    <span className="max-w-[13rem] text-[0.78rem] font-bold leading-4">{score?.top_terms.slice(0, 2).map((term) => term.term).join(" / ")}</span>
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: cardColors[index] }} />
                  </div>
                </article>
              );
            })}
          </div>

          <p className="font-mono text-[0.7rem] font-black uppercase tracking-[0.08em] text-ink/58">
            stacked evidence → distinct semantic climates
          </p>
        </SceneFrame>

        <SceneFrame progress={progress} index={2} tone="dark">
          <SceneHeader code="02" label="semantic stack" detail="the word accumulates new surfaces" color="#64C487" dark />

          <div className="my-auto flex flex-col gap-1">
            {visiblePeriods.map((period, index) => {
              const score = primaryScore(period.period_id, periodScores);
              const color = cardColors[index];
              const shift = (index % 2 === 0 ? -1 : 1) * (1 - stackLocal) * 54;
              return (
                <div
                  key={period.period_id}
                  className={[
                    "relative min-h-[8.1rem] overflow-hidden rounded-[1.9rem] border-2 border-wheat px-4 py-3",
                    index === 3 ? "text-ink" : "text-wheat",
                  ].join(" ")}
                  style={{
                    backgroundColor: color,
                    transform: "translateX(" + shift + "px) rotate(" + ((index - 1.5) * (1 - stackLocal) * 2.4) + "deg)",
                  }}
                >
                  <span className={[
                    "font-mono text-[0.7rem] font-black uppercase tracking-[0.08em]",
                    index === 3 ? "text-ink/65" : "text-wheat/72",
                  ].join(" ")}>{period.start_year}</span>
                  <p className="mt-3 max-w-[15rem] text-[1.45rem] font-black leading-[0.9] tracking-[-0.045em]">{period.label}</p>
                  <div className="absolute bottom-3 right-4 text-right">
                    <span className="block text-[1.25rem] font-black">{Math.round((score?.normalized_score ?? 0) * 100)}</span>
                    <span className={[
                      "font-mono text-[0.68rem] font-black uppercase tracking-[0.06em]",
                      index === 3 ? "text-ink/60" : "text-wheat/68",
                    ].join(" ")}>signal</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-4 border-y border-wheat/65 py-3 font-mono text-center text-[0.7rem] font-black uppercase tracking-[0.05em] text-wheat/70">
            <span>root</span><span>secret</span><span>injury</span><span>right</span>
          </div>
        </SceneFrame>

        <SceneFrame progress={progress} index={3}>
          <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(5,5,16,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(5,5,16,0.18)_1px,transparent_1px)] [background-size:42px_42px]" />
          <SceneHeader code="03" label="protected space" detail="the boundary expands into a social claim" color="#1570AC" />

          <div className="relative my-auto grid h-[30rem] max-h-[62svh] place-items-center">
            <div
              className="absolute rounded-full border-2 border-ink bg-nice transition-none"
              style={{
                width: (112 + boundaryLocal * 178) + "px",
                height: (112 + boundaryLocal * 178) + "px",
                boxShadow: "0 0 0 " + (8 + boundaryLocal * 36) + "px rgba(21,112,172,0.12)",
              }}
            />
            {[0, 1, 2, 3].map((ring) => (
              <div
                key={ring}
                className="absolute rounded-full border border-ink/30"
                style={{
                  width: (150 + ring * 48 + boundaryLocal * ring * 14) + "px",
                  height: (150 + ring * 48 + boundaryLocal * ring * 14) + "px",
                  opacity: 0.75 - ring * 0.12,
                }}
              />
            ))}
            <div className="relative z-10 grid h-20 w-20 place-items-center rounded-full border-2 border-ink bg-wheat text-center">
              <span className="font-mono text-[0.7rem] font-black uppercase leading-3.5 tracking-[0.06em]">private<br />space</span>
            </div>
            {["body", "home", "letters", "reputation"].map((label, index) => (
              <span
                key={label}
                className="absolute grid min-h-12 min-w-20 place-items-center whitespace-nowrap rounded-full border-2 border-ink bg-wheat px-3 font-mono text-[0.7rem] font-black uppercase tracking-[0.04em]"
                style={{
                  left: index % 2 === 0 ? "2%" : "auto",
                  right: index % 2 === 1 ? "2%" : "auto",
                  top: (16 + index * 20) + "%",
                  transform: "translateX(" + (index % 2 === 0 ? boundaryLocal * 18 : boundaryLocal * -18) + "px)",
                }}
              >
                {label}
              </span>
            ))}
          </div>

          <div className="relative grid grid-cols-2 border-y-2 border-ink">
            <div className="border-r-2 border-ink p-3">
              <span className="font-mono text-[0.7rem] font-black uppercase tracking-[0.06em] text-ink/55">inside</span>
              <p className="mt-2 text-[0.86rem] font-bold leading-[1.2]">seclusion becomes protected life</p>
            </div>
            <div className="p-3">
              <span className="font-mono text-[0.7rem] font-black uppercase tracking-[0.06em] text-nice">outside</span>
              <p className="mt-2 text-[0.86rem] font-bold leading-[1.2]">intrusion becomes legible injury</p>
            </div>
          </div>
        </SceneFrame>

        <SceneFrame progress={progress} index={4}>
          <SceneHeader code="04" label="legal injury" detail="events lock into a public timeline" color="#B59400" />

          <div className="my-auto space-y-3">
            {[
              ["1890", "The right to be let alone", "#6F3AA6"],
              ["1965", "Privacy enters constitutional space", "#2F9F5F"],
              ["1980", "Information systems change the object", "#1570AC"],
              ["2018", "Data protection becomes interface", "#E1B900"],
            ].map(([year, label, color], index) => (
              <div
                key={year}
                className="relative grid min-h-[7.1rem] grid-cols-[4.4rem_1fr] overflow-hidden rounded-[1.8rem] border-2 border-ink bg-wheat shadow-[5px_5px_0_#050510]"
                style={{
                  transform: "translateX(" + ((index % 2 === 0 ? -1 : 1) * (1 - legalLocal) * 58) + "px)",
                  opacity: 0.35 + clamp(legalLocal * 1.6 - index * 0.12) * 0.65,
                }}
              >
                <span className="grid place-items-center border-r-2 border-ink text-[1.2rem] font-black [writing-mode:vertical-rl]" style={{ backgroundColor: color }}>
                  {year}
                </span>
                <span className="self-end p-4 text-[1.06rem] font-black leading-[0.98] tracking-[-0.025em]">{label}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between border-t-2 border-ink pt-3">
            <p className="max-w-[17rem] text-[0.84rem] font-bold leading-[1.2]">Scroll motion turns isolated legal moments into a continuous institutional layer.</p>
            <span className="h-9 w-9 rounded-full border-2 border-ink bg-[#E1B900]" />
          </div>
        </SceneFrame>

        <SceneFrame progress={progress} index={5}>
          <SceneHeader code="05" label="world signal" detail={formatNumber(geoStatistics.source_total_records) + " recovered records"} color="#1570AC" />

          <div className="relative my-auto h-[31rem] max-h-[62svh] overflow-hidden rounded-[2.2rem] border-2 border-ink bg-[#E8EEE6]">
            <div className="absolute inset-0 grid grid-cols-12 grid-rows-16 gap-[7px] p-3 opacity-40" aria-hidden="true">
              {gridCells.map((cell) => <span key={cell} className="rounded-full bg-ink/20" />)}
            </div>
            <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-ink/35" />
            <div className="absolute inset-y-0 left-1/2 border-l border-dashed border-ink/35" />

            {visibleHotspots.map((hotspot, index) => {
              const fallbackX = clamp((hotspot.longitude + 180) / 360, 0.08, 0.92) * 100;
              const fallbackY = clamp((90 - hotspot.latitude) / 180, 0.1, 0.88) * 100;
              const position = hotspotPositions[hotspot.country_code] ?? { x: fallbackX, y: fallbackY };
              const selected = selectedHotspot === index;
              const scale = 0.4 + worldLocal * (0.6 + hotspot.density_score * 0.8);
              return (
                <button
                  key={hotspot.country_code}
                  type="button"
                  aria-label={"Inspect " + hotspot.country}
                  onClick={() => setSelectedHotspot(index)}
                  className="absolute grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full touch-manipulation focus-visible:outline focus-visible:outline-2 focus-visible:outline-nice"
                  style={{ left: position.x + "%", top: position.y + "%", zIndex: selected ? 20 : 10 }}
                >
                  <span
                    className="pointer-events-none absolute rounded-full border border-nice/55 bg-nice/15 transition"
                    style={{ width: 24 + hotspot.density_score * 42, height: 24 + hotspot.density_score * 42, transform: "scale(" + scale + ")" }}
                  />
                  <span className={["pointer-events-none relative h-2.5 w-2.5 rounded-full border border-ink", selected ? "bg-ink" : "bg-nice"].join(" ")} />
                </button>
              );
            })}

            <div className="absolute inset-x-3 bottom-3 rounded-[1.4rem] border-2 border-ink bg-wheat p-3">
              <div className="flex items-start justify-between gap-3">
                <p className="text-[0.95rem] font-black">{activeHotspot?.country}</p>
                <span className="font-mono text-[0.68rem] font-black text-nice">{formatNumber(activeHotspot?.record_count ?? 0)}</span>
              </div>
              <p className="mt-2 line-clamp-2 font-mono text-[0.68rem] font-black uppercase leading-4 tracking-[0.04em] text-ink/58">
                recovered attention · peak {activeHotspot?.peak_year ?? "n/a"} · {activeHotspot?.density_class.replaceAll("_", " ")}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 border-y-2 border-ink">
            {[
              [geoStatistics.map_country_count, "countries"],
              [geoStatistics.map_city_point_count, "cities"],
              [geoStatistics.radiation_link_count, "links"],
            ].map(([value, label], index) => (
              <div key={label} className={["p-3", index < 2 ? "border-r-2 border-ink" : ""].join(" ")}>
                <span className="text-[1.25rem] font-black text-nice">{value}</span>
                <span className="mt-1 block font-mono text-[0.7rem] font-black uppercase tracking-[0.04em]">{label}</span>
              </div>
            ))}
          </div>
        </SceneFrame>

        <SceneFrame progress={progress} index={6} tone="dark">
          <SceneHeader code="06" label="interface cards" detail={formatNumber(governanceRecordCount) + " governance records"} color="#64C487" dark />

          <div className="my-auto grid grid-cols-2 gap-3 [perspective:1000px]">
            {visibleTerms.map((term, index) => {
              const label = term.term ?? term.key ?? "privacy term";
              const flipped = flippedTerm === index;
              const color = cardColors[index];
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => setFlippedTerm(flipped ? null : index)}
                  className="relative h-[13rem] min-w-0 touch-manipulation rounded-[2rem] text-left outline-none [transform-style:preserve-3d] focus-visible:ring-2 focus-visible:ring-wheat"
                  style={{
                    transform: "translateY(" + ((index % 2) * (1 - interfaceLocal) * 28) + "px) rotateY(" + (flipped ? 180 : 0) + "deg)",
                    transition: "transform 520ms cubic-bezier(.2,.75,.2,1)",
                  }}
                  aria-pressed={flipped}
                >
                  <span
                    className={[
                      "absolute inset-0 flex flex-col justify-between rounded-[2rem] border-2 border-wheat p-4 [backface-visibility:hidden]",
                      index === 3 ? "text-ink" : "text-wheat",
                    ].join(" ")}
                    style={{
                      backgroundColor: color,
                      backgroundImage: "repeating-linear-gradient(125deg,transparent 0 19px,rgba(247,240,220,0.13) 19px 20px)",
                    }}
                  >
                    <span className={[
                      "font-mono text-[0.7rem] font-black uppercase tracking-[0.06em]",
                      index === 3 ? "text-ink/65" : "text-wheat/72",
                    ].join(" ")}>tap to flip / {String(index + 1).padStart(2, "0")}</span>
                    <span className="max-w-[8rem] text-[1.25rem] font-black leading-[0.92] tracking-[-0.04em]">{label}</span>
                    <span className="text-3xl font-black">↗</span>
                  </span>
                  <span
                    className="absolute inset-0 flex flex-col justify-between rounded-[2rem] border-2 border-wheat bg-wheat p-4 text-ink [backface-visibility:hidden]"
                    style={{ transform: "rotateY(180deg)" }}
                  >
                    <span className="font-mono text-[0.7rem] font-black uppercase tracking-[0.06em] text-ink/58">source-bounded scan</span>
                    <span className="text-[2.5rem] font-black leading-none" style={{ color }}>{formatNumber(term.count)}</span>
                    <span className="font-mono text-[0.68rem] font-black uppercase leading-4 tracking-[0.04em] text-ink/65">text hits · tap to return</span>
                  </span>
                </button>
              );
            })}
          </div>

          <p className="border-t border-wheat/45 pt-3 font-mono text-[0.68rem] font-black uppercase leading-4 tracking-[0.04em] text-wheat/58">
            {governanceLimitation}
          </p>
        </SceneFrame>

        <SceneFrame progress={progress} index={7}>
          <SceneHeader code="07" label="privacy control" detail="the word ends as an adjustable interface" color="#6F3AA6" />

          <div className="relative my-auto grid place-items-center">
            <RadialTicks progress={controlLocal} color="#6F3AA6" size={292}>
              <div className="text-center">
                <span className="font-mono text-[0.7rem] font-black uppercase tracking-[0.06em] text-ink/58">boundary</span>
                <p className="mt-2 text-[2rem] font-black leading-none tracking-[-0.06em]">{Math.round(100 - controlLocal * 46)}</p>
                <span className="font-mono text-[0.7rem] font-black uppercase tracking-[0.06em] text-privacy-violet">% retained</span>
              </div>
            </RadialTicks>

            <div className="absolute -bottom-8 grid w-full grid-cols-4 gap-2">
              {["body", "home", "data", "choice"].map((label, index) => (
                <div
                  key={label}
                  className="grid aspect-square place-items-center rounded-[1.15rem] border-2 border-ink font-mono text-[0.7rem] font-black uppercase tracking-[0.04em]"
                  style={{
                    backgroundColor: cardColors[index],
                    transform: "translateY(" + ((1 - controlLocal) * (index % 2 === 0 ? 20 : -20)) + "px)",
                  }}
                >
                  {label}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.8rem] border-2 border-ink bg-wheat p-4 shadow-[5px_5px_0_#050510]">
            <p className="font-mono text-[0.7rem] font-black uppercase tracking-[0.06em] text-privacy-violet">final state / still negotiable</p>
            <p className="mt-3 text-[0.98rem] font-bold leading-[1.28]">
              Privacy is not disappearance. It is the power to decide what crosses the boundary.
            </p>
          </div>
        </SceneFrame>

        <div className="pointer-events-none fixed right-0 top-0 z-40 h-[3px] bg-privacy-violet" style={{ width: ((progress / (chapters.length - 1)) * 100) + "%" }} />

        <div className="pointer-events-none fixed bottom-[max(1.35rem,env(safe-area-inset-bottom))] left-5 z-40 flex items-center gap-2 font-mono text-[0.7rem] font-black uppercase tracking-[0.06em]" style={{ color: activeScene.color }}>
          <span>{activeScene.code}</span>
          <span className="h-px w-6 bg-current" />
          <span>{activeScene.label}</span>
        </div>

        <button
          type="button"
          aria-label={menuOpen ? "Close scene menu" : "Open scene menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
          className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-5 z-[70] grid h-14 w-14 touch-manipulation place-items-center rounded-full border-2 border-ink bg-wheat text-ink shadow-[4px_4px_0_#050510] transition active:translate-x-1 active:translate-y-1 active:shadow-none"
        >
          <MenuGlyph open={menuOpen} />
        </button>

        <div
          className={[
            "fixed inset-0 z-[60] flex flex-col bg-ink px-5 pb-24 pt-[max(1.4rem,env(safe-area-inset-top))] text-wheat transition duration-500",
            menuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
          ].join(" ")}
          aria-hidden={!menuOpen}
          aria-label="Privacy scene menu"
          aria-modal="true"
          inert={!menuOpen}
          role="dialog"
        >
          <div className="flex justify-between font-mono text-[0.7rem] font-black uppercase tracking-[0.07em] text-wheat/62">
            <span>Privacy / scroll route</span>
            <span>8 states</span>
          </div>
          <nav className="my-auto grid grid-cols-2 gap-3" aria-label="Privacy scroll scenes">
            {chapters.map((chapter, index) => (
              <button
                key={chapter.code}
                type="button"
                onClick={() => goToChapter(index)}
                className={[
                  "relative min-h-[7.5rem] min-w-0 touch-manipulation overflow-hidden rounded-[1.8rem] border-2 border-wheat p-4 text-left",
                  index === 4 ? "text-ink" : "text-wheat",
                ].join(" ")}
                style={{ backgroundColor: chapter.color, opacity: activeChapter === index ? 1 : 0.72 }}
              >
                <span className="font-mono text-[0.7rem] font-black">{chapter.code}</span>
                <span className="absolute bottom-4 left-4 whitespace-nowrap text-[1rem] font-black leading-none">{chapter.label}</span>
              </button>
            ))}
          </nav>
          <div className="flex min-h-12 items-center gap-6 whitespace-nowrap font-mono text-[0.68rem] font-black uppercase tracking-[0.09em] text-wheat/68">
            <Link href="/">Home</Link>
            <Link href="/words">All words</Link>
            <Link href="/about">Method</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
