"use client";

import type {
  ForeverEraId,
  GeneratedFrequencySeries,
  GeneratedPrehistory,
} from "@/types/foreverRealData";

type VariantDriftFieldProps = {
  frequency: GeneratedFrequencySeries[];
  prehistory?: GeneratedPrehistory | null;
  selectedEra: ForeverEraId;
};

type PressureAnchor = {
  id: string;
  label: string;
  period: string;
  year: number;
  x: number;
  y: number;
  color: string;
  radius: number;
};

function n(value: number) {
  return Number(value.toFixed(3));
}

const pressureAnchors: PressureAnchor[] = [
  { id: "pressure-attestation", label: "Spaced form prehistory", period: "late 14c.-1611", year: 1375, x: 210, y: 214, color: "#1570AC", radius: 34 },
  { id: "pressure-devotional-print", label: "Devotional print formulae", period: "1600s-1700s", year: 1650, x: 482, y: 150, color: "#2C9FC7", radius: 44 },
  { id: "pressure-literary-vow", label: "Literary permanence", period: "1800-1899", year: 1860, x: 888, y: 170, color: "#A1081F", radius: 58 },
  { id: "pressure-memory-loss", label: "Memory and loss", period: "1850-1930", year: 1900, x: 1036, y: 608, color: "#036C17", radius: 50 },
  { id: "pressure-media-culture", label: "Media and pop title culture", period: "1950-2022", year: 1988, x: 1458, y: 196, color: "#FBB728", radius: 62 },
  { id: "pressure-modern-snapshot", label: "Modern open-news context", period: "2024-2026", year: 2025, x: 1668, y: 610, color: "#2C9FC7", radius: 48 },
];

const pressureCategoryIds: Record<string, string[]> = {
  "pressure-attestation": [],
  "pressure-devotional-print": ["eternity_religion"],
  "pressure-literary-vow": ["romance_vow", "permanence_duration"],
  "pressure-memory-loss": ["remembrance"],
  "pressure-media-culture": ["hyperbole_colloquial", "permanence_duration"],
  "pressure-modern-snapshot": ["digital_permanence", "hyperbole_colloquial"],
};

function wrapWords(label: string, maxChars = 17) {
  const words = label.split(" ");
  const lines: string[] = [];
  let current = "";
  words.forEach((word) => {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  });
  if (current) lines.push(current);
  return lines;
}

export function VariantDriftField({
  frequency,
  prehistory,
  selectedEra,
}: VariantDriftFieldProps) {
  const frequencySeriesCount = Math.max(1, frequency.length);
  const growthBase = { x: 480, y: 780 };
  const growthShoots = pressureAnchors.map((anchor, index) => {
    const spread = [-310, -210, -110, 35, 170, 300][index] ?? 0;
    const height = [230, 390, 500, 350, 310, 430][index] ?? 320;
    const tip = { x: growthBase.x + spread, y: growthBase.y - height };
    const controlA = { x: growthBase.x + spread * 0.12, y: growthBase.y - height * 0.42 };
    const controlB = { x: growthBase.x + spread * 0.72, y: growthBase.y - height * 0.94 };
    return {
      ...anchor,
      number: index + 1,
      tip,
      controlA,
      controlB,
      box: {
        x: Math.min(growthBase.x, tip.x) - 20,
        y: tip.y - 42,
        w: Math.abs(spread) + 56,
        h: height * 0.8,
      },
      delay: `${(index * 0.24).toFixed(2)}s`,
    };
  });

  const frequencyShoots = frequency.map((series, index) => {
    const spread = [-250, -86, 94, 260][index % 4];
    const height = [210, 275, 180, 235][index % 4];
    const tip = { x: growthBase.x + spread, y: growthBase.y - height };
    return {
      id: `variant-shoot-${series.id}`,
      label: series.label,
      color: series.color,
      tip,
      path: `M ${growthBase.x} ${growthBase.y} C ${n(growthBase.x + spread * 0.18)} ${n(growthBase.y - height * 0.35)}, ${n(growthBase.x + spread * 0.68)} ${n(growthBase.y - height * 0.82)}, ${n(tip.x)} ${n(tip.y)}`,
      delay: `${(index * 0.18).toFixed(2)}s`,
    };
  });

  const orbitLevels = [190, 312, 438, 564, 690, 810];
  const orbitNodes = pressureAnchors.flatMap((anchor, anchorIndex) =>
    Array.from({ length: 8 }).map((_, step) => {
      const level = orbitLevels[Math.min(orbitLevels.length - 1, anchorIndex)];
      const angle = (step / 8) * Math.PI * 2 + anchorIndex * 0.28;
      const rx = 108 + anchorIndex * 40;
      const ry = 25 + anchorIndex * 8;
      return {
        id: `${anchor.id}-orbit-${step}`,
        anchor,
        x: 480 + Math.cos(angle) * rx,
        y: level + Math.sin(angle) * ry,
        angle,
        label: ["SP", "DV", "LT", "MM", "MD", "NW"][anchorIndex] ?? anchor.label.slice(0, 2).toUpperCase(),
      };
    }),
  );

  const prehistorySeeds = (prehistory?.records ?? []).slice(0, 5);

  return (
    <div className="grid items-start gap-5 xl:grid-cols-2">
      <div className="relative overflow-hidden border border-ink/16 bg-[#fbf8ee]">
        <svg
          viewBox="0 0 960 1020"
          className="h-auto w-full"
          role="img"
          aria-label="Mathematical plant growth diagram for forever semantic evolution"
        >
          <defs>
            <pattern id="forever-growth-grid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#050510" strokeOpacity="0.045" />
            </pattern>
          </defs>
          <rect width="960" height="1020" fill="#fbf8ee" />
          <rect width="960" height="1020" fill="url(#forever-growth-grid)" />

          <text x="46" y="64" className="fill-ink font-mono text-[31px] font-black uppercase tracking-[0.11em]">
            01B / growth field
          </text>
          <text x="46" y="104" className="fill-fire font-mono text-[22px] font-black uppercase tracking-[0.13em]">
            forever / semantic shoots
          </text>

          <g transform="translate(548 54)">
            <text x="0" y="0" className="fill-ink font-mono text-[15px] font-black uppercase tracking-[0.1em]">Growth pathway</text>
            <text x="0" y="27" className="fill-ink/58 font-mono text-[13px] font-black uppercase tracking-[0.08em]">spelling / devotion / literature</text>
            <text x="0" y="49" className="fill-ink/58 font-mono text-[13px] font-black uppercase tracking-[0.08em]">memory / media / modern</text>
          </g>
          <g transform="translate(548 142)">
            <text x="0" y="0" className="fill-ink font-mono text-[15px] font-black uppercase tracking-[0.1em]">Reading rule</text>
            <text x="0" y="27" className="fill-ink/58 font-mono text-[13px] font-black uppercase tracking-[0.08em]">influence routes, not causal proof</text>
            <text x="0" y="49" className="fill-ink/58 font-mono text-[13px] font-black uppercase tracking-[0.08em]">attestation seeds: {prehistorySeeds.length}</text>
          </g>

          {frequencyShoots.map((shoot, index) => (
            <g key={shoot.id}>
              <path
                d={shoot.path}
                fill="none"
                stroke={shoot.color}
                strokeWidth="1.8"
                strokeOpacity="0.48"
                strokeLinecap="round"
                strokeDasharray="620"
                strokeDashoffset="0"
              >
                <animate attributeName="stroke-dashoffset" values="620;0;0" dur={`${5.8 + index * 0.24}s`} begin={shoot.delay} repeatCount="indefinite" />
              </path>
              <rect x={n(shoot.tip.x - 5)} y={n(shoot.tip.y - 5)} width="10" height="10" fill={shoot.color} opacity="0.82" />
              <text x={n(shoot.tip.x + 14)} y={n(shoot.tip.y + 4)} className="fill-ink/62 font-mono text-[12px] font-black uppercase tracking-[0.08em]">
                {shoot.label}
              </text>
            </g>
          ))}

          {growthShoots.map((shoot, index) => {
            const path = `M ${growthBase.x} ${growthBase.y} C ${n(shoot.controlA.x)} ${n(shoot.controlA.y)}, ${n(shoot.controlB.x)} ${n(shoot.controlB.y)}, ${n(shoot.tip.x)} ${n(shoot.tip.y)}`;
            return (
              <g
                key={shoot.id}
              >
                <rect
                  x={n(shoot.box.x)}
                  y={n(shoot.box.y)}
                  width={n(shoot.box.w)}
                  height={n(shoot.box.h)}
                  fill="none"
                  stroke={shoot.color}
                  strokeWidth="2.2"
                  strokeOpacity="0.58"
                />
                <path
                  d={path}
                  fill="none"
                  stroke="#050510"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeDasharray="900"
                  strokeDashoffset="0"
                >
                  <animate attributeName="stroke-dashoffset" values="900;0;0" dur={`${7.2 + index * 0.3}s`} begin={shoot.delay} repeatCount="indefinite" />
                </path>
                <rect x={n(shoot.tip.x - 6)} y={n(shoot.tip.y - 6)} width="12" height="12" fill={shoot.color} opacity="0.92">
                  <animate attributeName="opacity" values="0.46;1;0.62" dur={`${4.6 + index * 0.2}s`} begin={shoot.delay} repeatCount="indefinite" />
                </rect>
                <text x={n(shoot.tip.x + (shoot.tip.x < growthBase.x ? -26 : 26))} y={n(shoot.tip.y + 8)} textAnchor={shoot.tip.x < growthBase.x ? "end" : "start"} className="fill-ink font-mono text-[24px] font-normal">
                  {shoot.number}
                </text>
              </g>
            );
          })}

          <g transform="translate(62 860)">
            {growthShoots.map((shoot, index) => (
              <g key={`${shoot.id}-legend`} transform={`translate(${(index % 3) * 296} ${Math.floor(index / 3) * 58})`}>
                <rect width="270" height="45" fill="#fbf8ee" stroke="#050510" strokeOpacity="0.38" />
                <rect x="14" y="15" width="14" height="14" fill={shoot.color} />
                <text x="40" y="19" className="fill-ink font-mono text-[16px] font-black uppercase tracking-[0.08em]">
                  {shoot.number}. {wrapWords(shoot.label, 18)[0]}
                </text>
                <text x="40" y="35" className="fill-ink/58 font-mono text-[14px] font-black uppercase tracking-[0.07em]">
                  {shoot.period}
                </text>
              </g>
            ))}
          </g>
        </svg>
      </div>

      <div className="relative overflow-hidden border border-ink/20 bg-[#050510] text-wheat">
        <svg
          viewBox="0 0 960 1020"
          className="h-auto w-full"
          role="img"
          aria-label="Layered orbital recurrence instrument for forever"
        >
          <defs>
            <filter id="forever-orbit-grain">
              <feTurbulence type="fractalNoise" baseFrequency="0.86" numOctaves="2" stitchTiles="stitch" />
              <feColorMatrix type="saturate" values="0" />
              <feComponentTransfer>
                <feFuncA type="table" tableValues="0 0.16" />
              </feComponentTransfer>
            </filter>
          </defs>
          <rect width="960" height="1020" fill="#050510" />
          <rect width="960" height="1020" filter="url(#forever-orbit-grain)" opacity="0.72" />

          <text x="48" y="58" className="fill-wheat font-mono text-[28px] font-black uppercase tracking-[0.14em]">
            01C / recurrence instrument
          </text>
          <text x="48" y="98" className="fill-wheat/70 font-mono text-[16px] font-black uppercase tracking-[0.1em]">
            stacked semantic orbits / {selectedEra} / {frequencySeriesCount} frequency traces abstracted
          </text>

          <line x1="480" x2="480" y1="162" y2="900" stroke="#F5ECD2" strokeWidth="2" strokeOpacity="0.62" />
          <line x1="455" x2="455" y1="180" y2="888" stroke="#F5ECD2" strokeWidth="1" strokeOpacity="0.34" />
          <line x1="505" x2="505" y1="180" y2="888" stroke="#F5ECD2" strokeWidth="1" strokeOpacity="0.34" />
          {orbitLevels.map((level, index) => {
            const rx = 120 + index * 54;
            const ry = 28 + index * 10;
            return (
              <g key={level}>
                <ellipse cx="480" cy={level} rx={rx} ry={ry} fill="none" stroke="#F5ECD2" strokeWidth={index === 0 ? 1.4 : 1.8} strokeOpacity="0.78" strokeDasharray="1400" strokeDashoffset="0">
                  <animate attributeName="stroke-dashoffset" values="1400;0;0" dur="10s" begin={`${index * 0.7}s`} repeatCount="indefinite" />
                  <animate attributeName="rx" values={`${rx};${rx * 0.82};${rx}`} dur={`${8 + index * 0.45}s`} begin={`${index * 0.32}s`} repeatCount="indefinite" />
                  <animate attributeName="stroke-opacity" values="0.48;0.86;0.58" dur={`${8 + index * 0.45}s`} begin={`${index * 0.32}s`} repeatCount="indefinite" />
                </ellipse>
                <ellipse cx="480" cy={level + 34} rx={Math.max(42, rx - 82)} ry={Math.max(12, ry - 11)} fill="none" stroke="#F5ECD2" strokeWidth="1" strokeOpacity="0.48" strokeDasharray="8 10">
                  <animate attributeName="rx" values={`${Math.max(42, rx - 82)};${Math.max(28, (rx - 82) * 0.78)};${Math.max(42, rx - 82)}`} dur={`${8.4 + index * 0.4}s`} begin={`${index * 0.38}s`} repeatCount="indefinite" />
                </ellipse>
                <text x={n(480 + rx + 18)} y={level + 8} className="fill-wheat font-mono text-[18px] font-normal">
                  {index + 1}
                </text>
                <line x1={n(480 - rx)} x2={n(480 - rx)} y1={level} y2="900" stroke="#F5ECD2" strokeOpacity="0.22" strokeWidth="1" strokeDasharray="6 10" />
                <line x1={n(480 + rx)} x2={n(480 + rx)} y1={level} y2="900" stroke="#F5ECD2" strokeOpacity="0.22" strokeWidth="1" strokeDasharray="6 10" />
              </g>
            );
          })}

          <g transform="translate(56 150)">
            {pressureAnchors.map((anchor, index) => (
              <g key={`${anchor.id}-layer-key`} transform={`translate(0 ${index * 34})`}>
                <rect x="-1" y="-13" width="10" height="10" fill={anchor.color} />
                <text x="18" y="0" className="fill-wheat font-mono text-[17px] font-black uppercase tracking-[0.035em]">
                  {index + 1}. {wrapWords(anchor.label, 16)[0]}
                </text>
                <text x="18" y="18" className="fill-wheat/48 font-mono text-[12px] font-black uppercase tracking-[0.07em]">
                  {anchor.period}
                </text>
              </g>
            ))}
          </g>

          {orbitNodes.map((node, index) => {
            return (
              <g
                key={node.id}
              >
                <line x1={n(node.x)} x2={n(node.x)} y1={n(node.y)} y2={n(node.y + 110 + (index % 4) * 20)} stroke={node.anchor.color} strokeOpacity="0.34" strokeWidth="1" />
                <circle cx={n(node.x)} cy={n(node.y)} r="6" fill={node.anchor.color} stroke="#F5ECD2" strokeOpacity="0.76" strokeWidth="1" />
                <text x={n(node.x + 10)} y={n(node.y - 9)} fill={node.anchor.color} className="font-mono text-[14px] font-black">
                  {node.label}
                </text>
              </g>
            );
          })}

        </svg>
      </div>
    </div>
  );
}
