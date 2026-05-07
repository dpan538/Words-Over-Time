"use client";

import { useState } from "react";
import { foreverMetrics } from "@/data/words";

type Cell = {
  id: string;
  kicker: string;
  title: string;
  body: string;
  detail?: string;
  col: number;
  row: number;
  kind: "claim" | "module" | "risk";
  color?: string;
  stroke?: string;
};

const claimCells: Cell[] = [
  {
    id: "claim-attested",
    kicker: "claim 01 / attested",
    title: "earliest attested usage",
    body: "dictionary / lexical record",
    detail:
      "A lexicographic claim about known usage. This can predate, postdate, or sit outside the selected corpus evidence.",
    col: 1,
    row: 2,
    kind: "claim",
  },
  {
    id: "claim-detected",
    kicker: "claim 02 / detected",
    title: "earliest detected in our corpus",
    body: "selected corpus run",
    detail:
      "The first point found inside the chosen frequency dataset. It is a corpus boundary, not a universal historical first.",
    col: 2,
    row: 2,
    kind: "claim",
  },
  {
    id: "claim-scanned",
    kicker: "claim 03 / scanned",
    title: "earliest scanned-book occurrence",
    body: "verified page image",
    detail:
      "A visible page-level occurrence that can be inspected as evidence, while OCR and scan quality remain part of the record.",
    col: 3,
    row: 2,
    kind: "claim",
  },
];

const moduleCells: Cell[] = foreverMetrics.map((metric, index) => {
  const positions = [
    { col: 4, row: 3, color: "bg-nice", stroke: "#1570AC" },
    { col: 5, row: 3, color: "bg-blaze", stroke: "#F06B04" },
    { col: 6, row: 3, color: "bg-sun", stroke: "#FBB728" },
    { col: 6, row: 3, color: "bg-sail", stroke: "#036C17" },
  ];
  const position = positions[index] ?? positions[0];
  const details = [
    "Later versions will compare normalized frequency across source families and flag corpus breaks instead of smoothing them away.",
    "The module will mark sustained rises, reversals, and periods where visibility departs from the long-run baseline.",
    "For forever, this module separates forever, for ever, and possible lexeme-family aggregation before charting.",
    "Snippet evidence will show context windows and confidence notes without treating OCR text as finished transcription.",
  ];

  return {
    id: `module-${index + 1}`,
    kicker: `module ${String(index + 1).padStart(2, "0")}`,
    title: metric.title,
    body: metric.body,
    detail: details[index],
    kind: "module",
    ...position,
  };
});

const riskCells: Cell[] = [
  {
    id: "risk-ocr",
    kicker: "OCR",
    title: "scan noise",
    body: "transcription errors, broken ligatures, page shadows, and false word boundaries",
    col: 1,
    row: 4,
    kind: "risk",
  },
  {
    id: "risk-bias",
    kicker: "BIAS",
    title: "corpus bias",
    body: "geography, genre, survival, digitization priorities, and collection imbalance",
    col: 2,
    row: 4,
    kind: "risk",
  },
  {
    id: "risk-var",
    kicker: "VAR",
    title: "variants",
    body: "spelling, spacing, compounds, inflection, and lexeme-family grouping rules",
    col: 3,
    row: 4,
    kind: "risk",
  },
  {
    id: "risk-drift",
    kicker: "DRIFT",
    title: "semantic drift",
    body: "meaning changes across long time ranges and genre-specific usage contexts",
    col: 4,
    row: 4,
    kind: "risk",
  },
  {
    id: "risk-lic",
    kicker: "LIC",
    title: "licensing",
    body: "snippet limits, facsimile permissions, public-domain boundaries, and source attribution",
    col: 5,
    row: 4,
    kind: "risk",
  },
];

const cells = [...claimCells, ...moduleCells, ...riskCells];

const relationships: Record<string, string[]> = {
  "module-1": ["claim-detected", "risk-bias", "risk-ocr", "risk-drift"],
  "module-2": ["claim-detected", "risk-bias", "risk-drift"],
  "module-3": ["claim-attested", "risk-var", "risk-drift"],
  "module-4": ["claim-scanned", "risk-ocr", "risk-lic", "risk-var"],
};

function centerFor(cell: Cell) {
  const yByRow: Record<number, number> = {
    2: 24,
    3: 58,
    4: 86,
  };

  return {
    x: ((cell.col - 0.5) / 6) * 100,
    y: yByRow[cell.row] ?? 58,
  };
}

function findCell(id: string) {
  return cells.find((cell) => cell.id === id);
}

export function ConstraintGrid() {
  const [activeModule, setActiveModule] = useState("module-1");
  const [isInteracting, setIsInteracting] = useState(false);
  const activeCell = findCell(activeModule);
  const activeModuleCell = moduleCells.find((cell) => cell.id === activeModule);
  const relatedIds = relationships[activeModule] ?? [];
  const relatedCells = relatedIds
    .map((id) => findCell(id))
    .filter((cell): cell is Cell => Boolean(cell));
  const activeClaim = relatedCells.find((cell) => cell.kind === "claim");
  const activeRisks = relatedCells.filter((cell) => cell.kind === "risk");
  const activeStroke = activeModuleCell?.stroke ?? "#1570AC";

  return (
    <section className="py-0">
      <div
        className="relative min-h-[68rem] overflow-hidden border border-ink/55 bg-wheat/55"
        onMouseLeave={() => setIsInteracting(false)}
      >
        <div className="absolute inset-0 grid grid-cols-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <span
              key={index}
              className="border-r border-ink/18 last:border-r-0"
            />
          ))}
        </div>
        <div className="absolute inset-0 grid grid-rows-[3rem_22rem_27rem_16rem]">
          {Array.from({ length: 4 }).map((_, index) => (
            <span
              key={index}
              className="border-b border-ink/18 last:border-b-0"
            />
          ))}
        </div>

        <div className="absolute left-0 right-0 top-0 z-20 grid grid-cols-6 border-b border-ink/35 font-mono text-[0.68rem] uppercase tracking-[0.12em] text-ink/64">
          {["claim", "claim", "claim", "module", "module", "module"].map(
            (label, index) => (
              <span key={`${label}-${index}`} className="px-3 py-3">
                {String(index + 1).padStart(2, "0")} / {label}
              </span>
            ),
          )}
        </div>

        {activeCell ? (
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className={`pointer-events-none absolute inset-0 z-10 h-full w-full transition duration-200 ${
              isInteracting ? "opacity-100" : "opacity-0"
            }`}
            aria-hidden="true"
          >
            {relatedIds.map((id) => {
              const target = findCell(id);
              if (!target) return null;

              const start = centerFor(activeCell);
              const end = centerFor(target);

              return (
                <g key={`${activeCell.id}-${id}`}>
                  <line
                    x1={start.x}
                    y1={start.y}
                    x2={end.x}
                    y2={start.y}
                    stroke={activeStroke}
                    strokeWidth="0.24"
                    vectorEffect="non-scaling-stroke"
                  />
                  <line
                    x1={end.x}
                    y1={start.y}
                    x2={end.x}
                    y2={end.y}
                    stroke={activeStroke}
                    strokeWidth="0.16"
                    strokeDasharray="1.4 1.2"
                    vectorEffect="non-scaling-stroke"
                  />
                </g>
              );
            })}
          </svg>
        ) : null}

        <div className="absolute inset-x-0 top-[3rem] grid grid-cols-6">
          {claimCells.map((cell) => {
            const related = isInteracting && relatedIds.includes(cell.id);

            return (
              <article
                key={cell.id}
                className={`relative min-h-[22rem] border-r border-ink/18 px-4 py-5 transition duration-200 ${
                  related ? "bg-white/30" : ""
                }`}
                style={{ gridColumn: cell.col }}
              >
                <span
                  className={`absolute right-3 top-3 h-3 w-3 rounded-full border border-ink ${
                    related ? "bg-blaze" : "bg-wheat"
                  }`}
                />
                <p className="font-mono text-[0.72rem] font-medium uppercase tracking-[0.16em] text-fire">
                  {cell.kicker}
                </p>
                <p className="mt-5 font-mono text-[0.74rem] uppercase leading-5 tracking-[0.13em] text-ink/66">
                  source / {cell.body}
                </p>
                <h3 className="mt-5 text-[clamp(1.25rem,1.7vw,1.75rem)] font-bold leading-[1]">
                  {cell.title}
                </h3>
                <p
                  className={`mt-4 text-[0.82rem] font-bold leading-5 transition duration-200 ${
                    related ? "text-ink/82" : "text-ink/66"
                  }`}
                >
                  {cell.detail}
                </p>
              </article>
            );
          })}
          <div className="col-span-3 grid grid-cols-3">
            {moduleCells.slice(0, 3).map((cell) => {
              const active = isInteracting && activeModule === cell.id;

              return (
                <button
                  key={cell.id}
                  type="button"
                  onMouseEnter={() => {
                    setActiveModule(cell.id);
                    setIsInteracting(true);
                  }}
                  onFocus={() => {
                    setActiveModule(cell.id);
                    setIsInteracting(true);
                  }}
                  onClick={() => {
                    setActiveModule(cell.id);
                    setIsInteracting(true);
                  }}
                  className={`relative min-h-[22rem] border-r border-ink/18 px-4 py-5 text-left transition duration-200 last:border-r-0 ${
                    active ? "bg-white/25" : "hover:bg-white/12"
                  }`}
                >
                  <span className={`absolute right-3 top-3 h-4 w-4 border border-ink ${cell.color}`} />
                  <p className="font-mono text-[0.72rem] font-medium uppercase tracking-[0.16em] text-fire">
                    {cell.kicker}
                  </p>
                  <h3 className="mt-5 text-[clamp(1.25rem,1.7vw,1.75rem)] font-bold leading-[1]">
                    {cell.title}
                  </h3>
                  <p
                    className={`mt-4 text-[0.82rem] font-bold leading-5 transition duration-200 ${
                      active ? "text-ink/84" : "text-ink/70"
                    }`}
                  >
                    {cell.body}
                  </p>
                  <p
                    className={`mt-3 text-[0.76rem] font-bold leading-5 transition duration-200 ${
                      active ? "text-ink/72" : "text-ink/58"
                    }`}
                  >
                    {cell.detail}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="absolute inset-x-0 top-[25rem] grid grid-cols-6 border-t border-ink/18">
          <div className="col-span-3 min-h-[27rem] px-4 py-5">
            <p className="font-mono text-[0.72rem] font-medium uppercase tracking-[0.16em] text-fire">
              relationship notes
            </p>
            <p className="mt-5 max-w-xl text-sm font-bold leading-6 text-ink/70">
              The first three columns describe claim language. The last three
              columns describe planned instruments. A module interaction draws
              only the relevant cross-column routes.
            </p>
            <p className="mt-5 max-w-xl text-sm font-bold leading-6 text-ink/62">
              Each selected route should read as a small audit trail: source
              type, output label, uncertainty limit, and the future analysis
              module that will test the claim.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-4">
              {riskCells.slice(0, 3).map((cell) => {
                const related = relatedIds.includes(cell.id);

                return (
                  <div
                    key={cell.id}
                    className={`transition duration-200 ${
                      related && isInteracting ? "text-ink" : "text-ink/62"
                    }`}
                  >
                    <p className="font-mono text-[0.72rem] font-medium uppercase tracking-[0.14em] text-fire">
                      {cell.kicker}
                    </p>
                    <p className="mt-2 text-[0.78rem] font-bold leading-4">
                      {cell.title}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="col-span-3 grid grid-cols-3">
            <div className="relative col-span-2 min-h-[27rem] border-l border-ink/18 px-4 py-5">
              <p className="font-mono text-[0.72rem] font-medium uppercase tracking-[0.16em] text-fire">
                route field
              </p>
              <div className="relative mt-8 h-56">
                <span className="absolute left-0 top-9 h-px w-[82%] bg-ink/20" />
                <span className="absolute left-[28%] top-9 h-24 border-l border-dashed border-ink/25" />
                <span className="absolute left-[28%] top-[8.25rem] h-px w-[52%] bg-ink/16" />
                <span className="absolute left-[62%] top-[8.25rem] h-16 border-l border-dashed border-ink/22" />
                <span className="absolute left-[6%] top-7 h-4 w-4 rounded-full border border-ink/45 bg-wheat" />
                <span className="absolute left-[25%] top-[7.75rem] h-4 w-4 border border-ink/35 bg-wheat" />
                <span className="absolute left-[58%] top-[7.75rem] h-4 w-4 rounded-full border border-ink/35 bg-wheat" />

                <div
                  className={`absolute left-[6%] top-9 h-0.5 w-[58%] transition duration-200 ${
                    isInteracting ? "opacity-100" : "opacity-0"
                  }`}
                  style={{ backgroundColor: activeStroke }}
                />
                <div
                  className={`absolute left-[63%] top-9 h-[5.25rem] border-l-2 border-dashed transition duration-200 ${
                    isInteracting ? "opacity-100" : "opacity-0"
                  }`}
                  style={{ borderColor: activeStroke }}
                />
                <div
                  className={`absolute left-[28%] top-[8.25rem] h-0.5 w-[36%] transition duration-200 ${
                    isInteracting ? "opacity-100" : "opacity-0"
                  }`}
                  style={{ backgroundColor: activeStroke }}
                />

                <p className="absolute left-[6%] top-0 font-mono text-[0.68rem] uppercase tracking-[0.12em] text-ink/58">
                  module
                </p>
                <p className="absolute left-[31%] top-[5.8rem] font-mono text-[0.68rem] uppercase tracking-[0.12em] text-ink/58">
                  claim
                </p>
                <p className="absolute left-[66%] top-[5.8rem] font-mono text-[0.68rem] uppercase tracking-[0.12em] text-ink/58">
                  risk
                </p>
                <p className="absolute bottom-2 left-[28%] right-6 text-[0.82rem] font-bold leading-5 text-ink/62">
                  {isInteracting && activeModuleCell ? (
                    <>
                      <span style={{ color: activeStroke }}>
                        {activeModuleCell.title}
                      </span>{" "}
                      connects to {activeClaim?.title ?? "claim language"} and{" "}
                      {activeRisks.map((cell) => cell.kicker).join(" / ")}.
                    </>
                  ) : (
                    "Hover a module to expose the audit route without filling the whole grid."
                  )}
                </p>
              </div>
            </div>

            <button
              type="button"
              onMouseEnter={() => {
                setActiveModule("module-4");
                setIsInteracting(true);
              }}
              onFocus={() => {
                setActiveModule("module-4");
                setIsInteracting(true);
              }}
              onClick={() => {
                setActiveModule("module-4");
                setIsInteracting(true);
              }}
              className={`relative col-start-3 min-h-[27rem] border-l border-ink/18 px-4 py-5 text-left transition duration-200 ${
                isInteracting && activeModule === "module-4" ? "bg-white/25" : "hover:bg-white/12"
              }`}
            >
              <span className="absolute h-4 w-4 border border-ink bg-sail" />
              <p className="mt-8 font-mono text-[0.72rem] font-medium uppercase tracking-[0.16em] text-fire">
                {moduleCells[3].kicker}
              </p>
              <h3 className="mt-5 text-[clamp(1.25rem,1.7vw,1.75rem)] font-bold leading-[1]">
                {moduleCells[3].title}
              </h3>
              <p
                className={`mt-4 text-[0.82rem] font-bold leading-5 transition duration-200 ${
                  isInteracting && activeModule === "module-4"
                    ? "text-ink/84"
                    : "text-ink/70"
                }`}
              >
                {moduleCells[3].body}
              </p>
              <p
                className={`mt-3 text-[0.76rem] font-bold leading-5 transition duration-200 ${
                  isInteracting && activeModule === "module-4"
                    ? "text-ink/72"
                    : "text-ink/58"
                }`}
              >
                {moduleCells[3].detail}
              </p>
            </button>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 grid min-h-[16rem] grid-cols-6 border-t border-ink/18">
          {riskCells.map((cell) => {
            const related = isInteracting && relatedIds.includes(cell.id);

            return (
              <article
                key={cell.id}
                className={`border-r border-ink/18 px-4 py-4 transition duration-200 last:border-r-0 ${
              related ? "bg-white/25" : ""
                }`}
              >
                <p className="font-mono text-[0.72rem] font-medium uppercase tracking-[0.14em] text-fire">
                  {cell.kicker}
                </p>
                <h3 className="mt-3 text-[0.95rem] font-bold leading-4">
                  {cell.title}
                </h3>
                <p
                  className={`mt-2 text-[0.82rem] font-bold leading-5 transition duration-200 ${
                    related ? "text-ink/80" : "text-ink/62"
                  }`}
                >
                  {cell.body}
                </p>
              </article>
            );
          })}
          <article className="px-4 py-4">
            <p className="font-mono text-[0.72rem] font-medium uppercase tracking-[0.14em] text-fire">
              active
            </p>
            <p className="mt-3 text-[0.78rem] font-bold uppercase tracking-[0.12em] text-ink/68">
              {activeModuleCell?.title}
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
