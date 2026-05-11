"use client";

import { useState } from "react";

const INK = "#111018";
const MUTED = "rgba(17,16,24,0.52)";
const DIM = "rgba(17,16,24,0.38)";
const RULE = "rgba(17,16,24,0.20)";
const FAINT = "rgba(17,16,24,0.12)";

const VW = 1100;
const VH = 390;

// ── Bar magnet body ────────────────────────────────────────────────────────────
// Centred horizontally; N pole = left (natural/original), S pole = right (artificial/copy)
const MAG_Y = 200;   // vertical centre of magnet
const MAG_H = 22;    // half-height of magnet body rectangle
const N_X = 308;     // x of N-pole tip
const S_X = 792;     // x of S-pole tip
const MID_X = (N_X + S_X) / 2; // 550 — shared control-point x for symmetric arcs

// ── Field-line definitions ─────────────────────────────────────────────────────
// Each field line is a CLOSED LOOP: upper bezier (N→S) + lower bezier (S→N).
// upCtrlY  < MAG_Y → arches above the magnet
// downCtrlY > MAG_Y → arches below the magnet
// The label appears at the apex of the upper arc.
type FieldLine = {
  id: string;
  label: string;
  upCtrlY: number;
  downCtrlY: number;
};

const fieldLines: FieldLine[] = [
  { id: "lifelike",      label: "lifelike",           upCtrlY: 118, downCtrlY: 284 },
  { id: "true-to-life",  label: "true to life",       upCtrlY:  62, downCtrlY: 342 },
  { id: "high-fidelity", label: "high fidelity",      upCtrlY:  12, downCtrlY: 392 },
];

// Quadratic bezier midpoint y at t = 0.5
function apexY(ctrlY: number): number {
  // y(0.5) = 0.25*MAG_Y + 0.5*ctrlY + 0.25*MAG_Y = 0.5*MAG_Y + 0.5*ctrlY
  return 0.5 * MAG_Y + 0.5 * ctrlY;
}

// ── Component ──────────────────────────────────────────────────────────────────
export function ArtificialChart03BarMagnet() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        style={{ display: "block", width: "100%", minWidth: 700 }}
        aria-label="Chart 07 — Bar Magnet: natural/original vs artificial/copy, quality-pressure words as field lines"
      >
        {/* ── Section header ──────────────────────────────────────────── */}
        <text
          x={46} y={14}
          fill={MUTED} fontSize={8} fontFamily="monospace" letterSpacing="0.08em"
          className="select-none"
        >
          {"{07}"}
        </text>
        <text
          x={78} y={14}
          fill={INK} fontSize={9.5} fontFamily="monospace" letterSpacing="0.13em" fontWeight="bold"
          className="select-none"
        >
          BAR MAGNET
        </text>
        <text
          x={78} y={23}
          fill={MUTED} fontSize={6.5} fontFamily="monospace" letterSpacing="0.05em"
          className="select-none"
        >
          N = natural / original · S = artificial / copy — quality-pressure words as closed field loops
        </text>

        {/* ── Field-line loops ─────────────────────────────────────────── */}
        {fieldLines.map((fl) => {
          const isHov = hovered === fl.id;
          const dimmed = hovered !== null && !isHov;
          const topY = apexY(fl.upCtrlY);
          const labelY = topY - 9;

          // Each loop: upper arc (N→S, going above) + lower arc (S→N, going below)
          const loopPath =
            `M ${N_X} ${MAG_Y}` +
            ` Q ${MID_X} ${fl.upCtrlY} ${S_X} ${MAG_Y}` +
            ` Q ${MID_X} ${fl.downCtrlY} ${N_X} ${MAG_Y} Z`;

          return (
            <g
              key={fl.id}
              onMouseEnter={() => setHovered(fl.id)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: "default" }}
              opacity={dimmed ? 0.14 : 1}
            >
              {/* closed loop path */}
              <path
                d={loopPath}
                fill={FAINT}
                stroke={INK}
                strokeWidth={isHov ? 1.1 : 0.55}
                opacity={isHov ? 0.88 : 0.52}
                style={{ transition: "opacity 0.18s, stroke-width 0.15s" }}
              />

              {/* label at upper apex */}
              <text
                x={MID_X}
                y={labelY}
                textAnchor="middle"
                fill={isHov ? INK : MUTED}
                fontSize={isHov ? 8.2 : 7.2}
                fontFamily="monospace"
                letterSpacing="0.08em"
                className="select-none"
                style={{ transition: "fill 0.18s" }}
              >
                {fl.label}
              </text>
            </g>
          );
        })}

        {/* ── Bar magnet body ──────────────────────────────────────────── */}
        {/* N half (left) */}
        <rect
          x={N_X}
          y={MAG_Y - MAG_H}
          width={(S_X - N_X) / 2}
          height={MAG_H * 2}
          fill="rgba(17,16,24,0.04)"
          stroke={INK}
          strokeWidth={1}
        />
        {/* S half (right) */}
        <rect
          x={MID_X}
          y={MAG_Y - MAG_H}
          width={(S_X - N_X) / 2}
          height={MAG_H * 2}
          fill="rgba(17,16,24,0.09)"
          stroke={INK}
          strokeWidth={1}
        />

        {/* N and S pole letters inside bar */}
        <text
          x={(N_X + MID_X) / 2}
          y={MAG_Y + 5}
          textAnchor="middle"
          fill={INK}
          fontSize={14}
          fontFamily="monospace"
          fontWeight="bold"
          className="select-none"
        >
          N
        </text>
        <text
          x={(S_X + MID_X) / 2}
          y={MAG_Y + 5}
          textAnchor="middle"
          fill={INK}
          fontSize={14}
          fontFamily="monospace"
          fontWeight="bold"
          className="select-none"
        >
          S
        </text>

        {/* ── Pole concept labels (above bar) ─────────────────────────── */}
        <text
          x={N_X}
          y={MAG_Y - MAG_H - 11}
          textAnchor="middle"
          fill={MUTED}
          fontSize={7}
          fontFamily="monospace"
          letterSpacing="0.10em"
          className="select-none"
        >
          NATURAL / ORIGINAL
        </text>
        <text
          x={S_X}
          y={MAG_Y - MAG_H - 11}
          textAnchor="middle"
          fill={MUTED}
          fontSize={7}
          fontFamily="monospace"
          letterSpacing="0.10em"
          className="select-none"
        >
          ARTIFICIAL / COPY
        </text>

        {/* ── Arrow heads on pole labels (directional indicators) ──────── */}
        <line
          x1={N_X - 38} y1={MAG_Y - MAG_H - 14}
          x2={S_X + 38} y2={MAG_Y - MAG_H - 14}
          stroke={RULE} strokeWidth={0.4}
        />
        <text
          x={MID_X} y={MAG_Y - MAG_H - 18}
          textAnchor="middle"
          fill={DIM}
          fontSize={6.2}
          fontFamily="monospace"
          letterSpacing="0.05em"
          className="select-none"
        >
          ← quality pressure →
        </text>

        {/* ── Footer ──────────────────────────────────────────────────── */}
        <line
          x1={36} y1={VH - 26} x2={VW - 36} y2={VH - 26}
          stroke={RULE} strokeWidth={0.4}
        />
        <text
          x={36} y={VH - 12}
          fill={DIM} fontSize={6.2} fontFamily="monospace" letterSpacing="0.05em"
          className="select-none"
        >
          field lines are quality-pressure terms — hover to isolate each loop
        </text>
      </svg>
    </div>
  );
}
