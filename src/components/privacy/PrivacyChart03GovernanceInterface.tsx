"use client";

import { useMemo, useState } from "react";

type CountRow = {
  key?: string;
  term?: string;
  count: number;
};

export type PrivacyResearchExpansionDataset = {
  word: "privacy";
  layer_id: "research_expansion";
  status: string;
  intended_use: string;
  statistics: {
    public_dated_evidence_count: number;
    supplemental_phrase_frequency_count: number;
    platform_policy_document_count: number;
    wikipedia_reference_count: number;
    legal_institutional_count: number;
    news_discourse_count: number;
    news_attention_count: number;
    court_opinion_count: number;
    archive_metadata_count: number;
    publication_metadata_count: number;
    academic_transition_count: number;
    academic_institution_count: number;
    total_record_count: number;
  };
  aggregates: {
    policy_term_summary: CountRow[];
    gdelt_discourse_by_query: CountRow[];
    court_by_query: CountRow[];
    academic_by_query: CountRow[];
    publication_by_query: CountRow[];
  };
  strong_signals: string[];
  limitations: string[];
};

type PrivacyChart03GovernanceInterfaceProps = {
  dataset: PrivacyResearchExpansionDataset;
};

type BranchId = "legal" | "policy" | "platform" | "attention" | "technical";

type Branch = {
  id: BranchId;
  label: string;
  color: string;
};

type SemanticNode = {
  id: string;
  branch: BranchId;
  label: string;
  year: number;
  row: number;
  colShift: number;
  count: number;
  radius: number;
};

const WIDTH = 1560;
const HEIGHT = 650;
const GRID = {
  x: 138,
  y: 54,
  w: 1180,
  h: 430,
};
const YEAR_START = 1890;
const YEAR_END = 2026;
const INK = "#050510";
const WARM_WHITE = "#f3eee3";
const NODE_SCALE = 1.05;

const branches: Branch[] = [
  { id: "legal", label: "legal claim", color: "#F05A2E" },
  { id: "policy", label: "policy language", color: "#73AD95" },
  { id: "platform", label: "platform interface", color: "#F5B7CB" },
  { id: "attention", label: "public attention", color: "#76A8D6" },
  { id: "technical", label: "technical governance", color: "#F2CF36" },
];

const countFrom = (rows: CountRow[] | undefined, name: string) => {
  const needle = name.toLowerCase();
  return rows?.find((row) => (row.key ?? row.term ?? "").toLowerCase() === needle)?.count ?? 0;
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const densityYearSlots: Record<number, number> = {
  1890: 0.07,
  1950: 0.2,
  1974: 0.32,
  1995: 0.47,
  2013: 0.62,
  2018: 0.74,
  2020: 0.84,
  2026: 0.94,
};

const yearToX = (year: number) => GRID.x + (densityYearSlots[year] ?? 0.5) * GRID.w;

const rowToY = (row: number) => GRID.y + row * (GRID.h / 7);

const polylinePath = (nodes: SemanticNode[]) =>
  nodes
    .map((node, index) => {
      const x = yearToX(node.year) + node.colShift;
      const y = rowToY(node.row);
      return `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");

const formatCount = (value: number) => value.toLocaleString();

export function PrivacyChart03GovernanceInterface({ dataset }: PrivacyChart03GovernanceInterfaceProps) {
  const [active, setActive] = useState<string | null>(null);

  const nodes = useMemo<SemanticNode[]>(() => {
    const policyTerms = dataset.aggregates.policy_term_summary;
    const courtTerms = dataset.aggregates.court_by_query;
    const academicTerms = dataset.aggregates.academic_by_query;
    const discourseTerms = dataset.aggregates.gdelt_discourse_by_query;
    const publicationTerms = dataset.aggregates.publication_by_query;

    return [
      {
        id: "right-to-privacy",
        branch: "legal",
        label: "right to privacy",
        year: 1890,
        row: 1,
        colShift: 0,
        count: countFrom(courtTerms, "right to privacy"),
        radius: 34,
      },
      {
        id: "privacy-act",
        branch: "legal",
        label: "privacy act",
        year: 1974,
        row: 5,
        colShift: -28,
        count: countFrom(courtTerms, "privacy act"),
        radius: 31,
      },
      {
        id: "breach-risk",
        branch: "legal",
        label: "breach risk",
        year: 2020,
        row: 4,
        colShift: 32,
        count: countFrom(publicationTerms, "data privacy"),
        radius: 30,
      },
      {
        id: "data-protection",
        branch: "policy",
        label: "data protection",
        year: 1974,
        row: 6,
        colShift: -64,
        count: countFrom(policyTerms, "data protection"),
        radius: 36,
      },
      {
        id: "privacy-policy-policy",
        branch: "policy",
        label: "privacy policy",
        year: 1995,
        row: 5,
        colShift: -18,
        count: countFrom(policyTerms, "privacy policy"),
        radius: 32,
      },
      {
        id: "privacy-controls",
        branch: "policy",
        label: "privacy controls",
        year: 2020,
        row: 3,
        colShift: -18,
        count: countFrom(policyTerms, "privacy controls"),
        radius: 30,
      },
      {
        id: "privacy-preserving",
        branch: "policy",
        label: "privacy preserving",
        year: 2026,
        row: 1,
        colShift: 24,
        count: countFrom(academicTerms, "privacy preserving"),
        radius: 32,
      },
      {
        id: "privacy-policy-platform",
        branch: "platform",
        label: "privacy policy",
        year: 1995,
        row: 3,
        colShift: -86,
        count: countFrom(policyTerms, "privacy policy"),
        radius: 31,
      },
      {
        id: "cookies",
        branch: "platform",
        label: "cookies",
        year: 2013,
        row: 3,
        colShift: -40,
        count: countFrom(policyTerms, "cookies"),
        radius: 34,
      },
      {
        id: "consent",
        branch: "platform",
        label: "consent",
        year: 2018,
        row: 2,
        colShift: 8,
        count: countFrom(policyTerms, "consent"),
        radius: 33,
      },
      {
        id: "surveillance",
        branch: "attention",
        label: "surveillance",
        year: 2013,
        row: 4,
        colShift: -36,
        count: countFrom(discourseTerms, "privacy and surveillance"),
        radius: 34,
      },
      {
        id: "settings",
        branch: "attention",
        label: "settings",
        year: 2020,
        row: 4,
        colShift: 74,
        count: countFrom(policyTerms, "privacy settings"),
        radius: 32,
      },
      {
        id: "informational-privacy",
        branch: "technical",
        label: "informational privacy",
        year: 1995,
        row: 5,
        colShift: 72,
        count: countFrom(academicTerms, "informational privacy"),
        radius: 30,
      },
      {
        id: "data-governance",
        branch: "technical",
        label: "data governance",
        year: 2020,
        row: 6,
        colShift: -6,
        count: countFrom(academicTerms, "data governance"),
        radius: 32,
      },
      {
        id: "ai-sensitive-data",
        branch: "technical",
        label: "AI-sensitive data",
        year: 2026,
        row: 5,
        colShift: -58,
        count: dataset.statistics.academic_transition_count,
        radius: 34,
      },
    ];
  }, [dataset]);

  const activeNode = nodes.find((node) => node.id === active) ?? null;
  const activeBranch = activeNode?.branch ?? null;
  const branchById = new Map(branches.map((branch) => [branch.id, branch]));
  const nodesByBranch = branches.map((branch) => ({
    branch,
    nodes: nodes.filter((node) => node.branch === branch.id).sort((a, b) => a.year - b.year),
  }));
  const years = [1890, 1950, 1974, 1995, 2013, 2018, 2020, 2026];

  return (
    <div className="relative overflow-hidden border-y border-ink/70 bg-[#f3eee3]">
      <div className="grid min-h-[7.6rem] gap-4 px-4 py-3 lg:grid-cols-[minmax(0,1fr)_21rem] lg:px-6">
        <div>
          <p className="font-mono text-[0.82rem] font-black uppercase leading-5 tracking-[0.16em] text-[#7E42B8]">
            hover a semantic node / same color means same branch
          </p>
          <p className="mt-2 max-w-[1040px] text-[1rem] font-bold leading-6 text-ink/68">
            Each circle is a recovered privacy term placed in a density-spaced year field. Black links connect terms inside the same semantic branch.
          </p>
        </div>
        <div className="h-[5.9rem] overflow-hidden border border-ink/20 bg-[#f3eee3]/88 p-3 font-mono text-[0.78rem] font-black uppercase leading-5 tracking-[0.1em] text-ink/76">
          <p className="h-5 truncate text-[#7E42B8]">{activeNode ? activeNode.label : "semantic time field"}</p>
          <p className="mt-2 min-h-10">
            {activeNode
              ? `${activeNode.year} / ${branchById.get(activeNode.branch)?.label} / ${formatCount(activeNode.count)} records`
              : `${dataset.statistics.total_record_count.toLocaleString()} records / ${nodes.length} semantic nodes`}
          </p>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label="Privacy semantic branches arranged over the 1890 to 2026 timeline"
        className="block w-full"
      >
        <rect width={WIDTH} height={HEIGHT} fill={WARM_WHITE} />

        <g opacity={0.64}>
          {Array.from({ length: 8 }).map((_, row) => (
            <line
              key={`row-${row}`}
              x1={GRID.x}
              x2={GRID.x + GRID.w}
              y1={rowToY(row)}
              y2={rowToY(row)}
              stroke={INK}
              strokeOpacity={0.16}
              strokeWidth={1}
            />
          ))}
          {years.map((year) => (
            <line
              key={`year-grid-${year}`}
              x1={yearToX(year)}
              x2={yearToX(year)}
              y1={GRID.y}
              y2={GRID.y + GRID.h}
              stroke={INK}
              strokeOpacity={0.17}
              strokeWidth={1}
            />
          ))}
          <rect x={GRID.x} y={GRID.y} width={GRID.w} height={GRID.h} fill="none" stroke={INK} strokeOpacity={0.16} />
        </g>

        <g>
          <line x1={GRID.x} x2={GRID.x + GRID.w} y1={GRID.y + GRID.h + 48} y2={GRID.y + GRID.h + 48} stroke={INK} strokeWidth={2.2} />
          {years.map((year) => (
            <g key={`tick-${year}`}>
              <line
                x1={yearToX(year)}
                x2={yearToX(year)}
                y1={GRID.y + GRID.h + 36}
                y2={GRID.y + GRID.h + 60}
                stroke={INK}
                strokeWidth={year === YEAR_START || year === YEAR_END ? 2 : 1.3}
                strokeOpacity={year === YEAR_START || year === YEAR_END ? 0.82 : 0.42}
              />
              <text
                x={yearToX(year)}
                y={GRID.y + GRID.h + 88}
                textAnchor="middle"
                fill={INK}
                fillOpacity={year === YEAR_START || year === YEAR_END ? 0.88 : 0.58}
                fontFamily="var(--font-geist-mono), monospace"
                fontSize={15}
                fontWeight={900}
              >
                {year}
              </text>
            </g>
          ))}
          <text
            x={GRID.x + GRID.w / 2}
            y={GRID.y + GRID.h + 18}
            textAnchor="middle"
            fill={INK}
            fillOpacity={0.78}
            fontFamily="var(--font-geist-mono), monospace"
            fontSize={17}
            fontWeight={900}
            letterSpacing={2.2}
          >
            DENSITY-SPACED TIME FIELD / 1890-2026
          </text>
        </g>

        <g>
          {nodesByBranch.map(({ branch, nodes: branchNodes }) => {
            const dimmed = activeBranch !== null && activeBranch !== branch.id;
            return (
              <path
                key={branch.id}
                d={polylinePath(branchNodes)}
                fill="none"
                stroke={INK}
                strokeWidth={activeBranch === branch.id ? 3 : 2}
                strokeOpacity={dimmed ? 0.1 : 0.76}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            );
          })}
        </g>

        <g>
          {nodes.map((node, index) => {
            const branch = branchById.get(node.branch);
            const x = yearToX(node.year) + node.colShift;
            const y = rowToY(node.row);
            const isActive = active === node.id;
            const dimmed = activeBranch !== null && activeBranch !== node.branch;
            const radius = (isActive ? node.radius * 1.12 : node.radius) * NODE_SCALE;

            return (
              <g
                key={node.id}
                className="cursor-crosshair outline-none focus:outline-none"
                onMouseEnter={() => setActive(node.id)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(node.id)}
                onBlur={() => setActive(null)}
              >
                <circle cx={x} cy={y} r={radius + 8} fill="transparent" />
                <circle
                  cx={x}
                  cy={y}
                  r={radius}
                  fill={branch?.color ?? "#999"}
                  fillOpacity={dimmed ? 0.24 : isActive ? 0.98 : 0.82}
                  stroke={INK}
                  strokeOpacity={isActive ? 0.72 : 0}
                  strokeWidth={2}
                />
                <text
                  x={x + radius + 12}
                  y={y + 5}
                  fill={INK}
                  fillOpacity={isActive ? 0.86 : dimmed ? 0.16 : 0.44}
                  fontFamily="var(--font-geist-mono), monospace"
                  fontSize={13}
                  fontWeight={900}
                >
                  {index + 1}
                </text>
              </g>
            );
          })}
        </g>

        <g>
          {branches.map((branch, index) => (
            <g key={branch.id} transform={`translate(${1352} ${96 + index * 48})`}>
              <circle r={16} fill={branch.color} fillOpacity={activeBranch === null || activeBranch === branch.id ? 0.9 : 0.26} />
              <text
                x={28}
                y={5}
                fill={INK}
                fillOpacity={activeBranch === null || activeBranch === branch.id ? 0.72 : 0.24}
                fontFamily="var(--font-geist-mono), monospace"
                fontSize={13}
                fontWeight={900}
                letterSpacing={1.1}
              >
                {branch.label}
              </text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}
