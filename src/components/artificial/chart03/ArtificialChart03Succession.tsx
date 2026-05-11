"use client";

import { useState, useMemo } from "react";
import {
  chart03HoverForTerm,
  chart03TermIndex,
  type Chart03HoverProps,
} from "@/components/artificial/chart03/chart03Shared";

const INK = "#111018";
const RULE = "rgba(17,16,24,0.46)";
const MUTED = "rgba(17,16,24,0.82)";
const DIM = "rgba(17,16,24,0.74)";
const RED = "#A1081F";
const RED_DIM = "rgba(126,4,22,0.86)";

const VW = 1100;
const VH = 690;
const TL_LEFT = 116;
const TL_RIGHT = 1038;
const AXIS_Y = 610;
const HEADER_LEFT = 34;
const HEADER_Y = 14;      // section header baseline
const SUCCESSION_FOOTER_Y = 648;

function yearToX(year: number): number {
  return TL_LEFT + ((year - 1800) / 219) * (TL_RIGHT - TL_LEFT);
}

// Four sensory track centres — compact enough for one viewport, with label lanes.
const TRACK_Y = { SIGHT: 118, SOUND: 254, LIGHT: 390, SCENE: 526 } as const;
type TrackKey = keyof typeof TRACK_Y;

// Per-track normalisation ceiling and max arc radius
const TRACK_CEIL: Record<TrackKey, number> = { SIGHT: 16.1, SOUND: 16.3, LIGHT: 21.9, SCENE: 4.2 };
const TRACK_RMAX: Record<TrackKey, number> = { SIGHT: 28, SOUND: 26, LIGHT: 30, SCENE: 20 };
const RMIN = 5;

function calcR(track: TrackKey, peak: number): number {
  const norm = Math.min(peak / TRACK_CEIL[track], 1);
  return RMIN + norm * (TRACK_RMAX[track] - RMIN);
}

type Term = {
  id: string;
  label: string;
  yearStart: number; // entry into use
  yearPeak: number;  // ngram peak — x-axis position of circle
  yearEnd: number;   // exit from common use
  peak: number;      // per-million frequency at peak
  track: TrackKey;
  note: string;      // tooltip line (≤48 chars)
};

const termLaneOffset: Partial<Record<string, number>> = {
  daguerreotype: 0,
  photograph: -22,
  photography: 22,
  "moving-picture": -20,
  television: 18,
  "motion-picture": -16,
  "digital-image": 0,
  phonograph: 0,
  gramophone: 18,
  "radio-broadcast": -20,
  "tape-recording": 18,
  "high-fidelity": -16,
  "sound-recording": 20,
  "gas-light": 0,
  limelight: -18,
  "arc-lamp": 16,
  "electric-light": 0,
  "neon-light": -18,
  fluorescent: 18,
  "stage-lighting": -16,
  panorama: 0,
  diorama: -18,
  stereoscope: 18,
  "magic-lantern": -14,
  cinema: 0,
  simulation: -20,
  "virtual-reality": 18,
};

const labelLaneOffset: Partial<Record<string, number>> = {
  daguerreotype: 28,
  phonograph: 30,
  photograph: -32,
  photography: 36,
  "moving-picture": 34,
  television: -32,
  "motion-picture": 34,
  "digital-image": 30,
  gramophone: 34,
  "radio-broadcast": -34,
  "tape-recording": -30,
  "high-fidelity": 34,
  "sound-recording": -36,
  limelight: -28,
  "arc-lamp": 34,
  "electric-light": 38,
  "neon-light": -28,
  fluorescent: 34,
  "stage-lighting": -30,
  diorama: -28,
  stereoscope: 34,
  "magic-lantern": -26,
  simulation: -34,
  "virtual-reality": 34,
};

const labelXOffset: Partial<Record<string, { dx: number; anchor: "start" | "middle" | "end" }>> = {
  daguerreotype: { dx: -10, anchor: "end" },
  photograph: { dx: -16, anchor: "end" },
  photography: { dx: 16, anchor: "start" },
  "moving-picture": { dx: -8, anchor: "end" },
  television: { dx: -16, anchor: "end" },
  "motion-picture": { dx: 18, anchor: "start" },
  "digital-image": { dx: 12, anchor: "start" },
  phonograph: { dx: -14, anchor: "end" },
  gramophone: { dx: -18, anchor: "end" },
  "radio-broadcast": { dx: -16, anchor: "end" },
  "high-fidelity": { dx: 18, anchor: "start" },
  "sound-recording": { dx: 34, anchor: "start" },
  "electric-light": { dx: 18, anchor: "start" },
  simulation: { dx: -14, anchor: "end" },
  "virtual-reality": { dx: 12, anchor: "start" },
};

const outsideLabelIds = new Set([
  "photograph",
  "photography",
  "television",
  "motion-picture",
  "gramophone",
  "sound-recording",
  "electric-light",
]);

function termY(term: Pick<Term, "id" | "track">) {
  return TRACK_Y[term.track] + (termLaneOffset[term.id] ?? 0);
}

const terms: Term[] = [
  // ── SIGHT ──────────────────────────────────────────────────────────────
  { id: "daguerreotype",  label: "daguerreotype",  yearStart: 1839, yearPeak: 1845, yearEnd: 1862, peak: 3.8,  track: "SIGHT", note: "silver-on-metal image; first commercial photo" },
  { id: "photograph",    label: "photograph",     yearStart: 1839, yearPeak: 1868, yearEnd: 1900, peak: 15.4, track: "SIGHT", note: "dominant once paper processes displaced metal" },
  { id: "photography",   label: "photography",    yearStart: 1851, yearPeak: 1878, yearEnd: 1920, peak: 14.3, track: "SIGHT", note: "the practice; concurrent with 'photograph'" },
  { id: "moving-picture",label: "moving picture", yearStart: 1896, yearPeak: 1916, yearEnd: 1935, peak: 4.4,  track: "SIGHT", note: "early cinema term; BrE-dominant" },
  { id: "television",    label: "television",     yearStart: 1927, yearPeak: 1948, yearEnd: 1975, peak: 8.5,  track: "SIGHT", note: "broadcast transmission; rivals cinema c.1950" },
  { id: "motion-picture",label: "motion picture", yearStart: 1915, yearPeak: 1953, yearEnd: 1980, peak: 16.1, track: "SIGHT", note: "AmE standard; peak after Hollywood consolidation" },
  { id: "digital-image", label: "digital image",  yearStart: 1988, yearPeak: 1999, yearEnd: 2019, peak: 1.2,  track: "SIGHT", note: "sensor-captured record; post-analogue" },

  // ── SOUND ──────────────────────────────────────────────────────────────
  { id: "phonograph",      label: "phonograph",     yearStart: 1877, yearPeak: 1895, yearEnd: 1922, peak: 4.5,  track: "SOUND", note: "Edison cylinder; AmE after BrE shifts to gramophone" },
  { id: "gramophone",      label: "gramophone",     yearStart: 1907, yearPeak: 1932, yearEnd: 1955, peak: 6.1,  track: "SOUND", note: "BrE disc-player; trademark generalised" },
  { id: "radio-broadcast", label: "radio broadcast",yearStart: 1920, yearPeak: 1938, yearEnd: 1962, peak: 3.2,  track: "SOUND", note: "wireless audio; first truly mass sound medium" },
  { id: "tape-recording",  label: "tape recording", yearStart: 1945, yearPeak: 1958, yearEnd: 1982, peak: 1.8,  track: "SOUND", note: "magnetic tape; enables editing and re-recording" },
  { id: "high-fidelity",   label: "high fidelity",  yearStart: 1950, yearPeak: 1956, yearEnd: 1978, peak: 2.9,  track: "SOUND", note: "audiophile standard; abbreviates to hi-fi c.1955" },
  { id: "sound-recording", label: "sound recording",yearStart: 1958, yearPeak: 1983, yearEnd: 2019, peak: 16.3, track: "SOUND", note: "neutral term; dominant in legal and archival use" },

  // ── LIGHT ──────────────────────────────────────────────────────────────
  { id: "gas-light",      label: "gas light",       yearStart: 1820, yearPeak: 1848, yearEnd: 1892, peak: 1.1,  track: "LIGHT", note: "coal-gas; first widespread artificial illumination" },
  { id: "limelight",      label: "limelight",       yearStart: 1842, yearPeak: 1878, yearEnd: 1908, peak: 0.77, track: "LIGHT", note: "calcium oxide spotlight; pre-electric theatre" },
  { id: "arc-lamp",       label: "arc lamp",        yearStart: 1852, yearPeak: 1888, yearEnd: 1920, peak: 0.62, track: "LIGHT", note: "carbon-arc; streets and theatres before bulb" },
  { id: "electric-light", label: "electric light",  yearStart: 1882, yearPeak: 1897, yearEnd: 1945, peak: 21.9, track: "LIGHT", note: "incandescent bulb; highest-frequency term in field" },
  { id: "neon-light",     label: "neon light",      yearStart: 1923, yearPeak: 1940, yearEnd: 1968, peak: 0.45, track: "LIGHT", note: "gas discharge tube; metonym for urban modernity" },
  { id: "fluorescent",    label: "fluorescent",     yearStart: 1938, yearPeak: 1955, yearEnd: 1988, peak: 0.58, track: "LIGHT", note: "tube lighting; replaces incandescent in commerce" },
  { id: "stage-lighting", label: "stage lighting",  yearStart: 1924, yearPeak: 1935, yearEnd: 1975, peak: 0.38, track: "LIGHT", note: "theatre discipline; distinct from broadcast" },

  // ── SCENE ──────────────────────────────────────────────────────────────
  { id: "panorama",       label: "panorama",       yearStart: 1808, yearPeak: 1835, yearEnd: 1865, peak: 4.2,  track: "SCENE", note: "360° painted rotunda; first commercial immersive scene" },
  { id: "diorama",        label: "diorama",        yearStart: 1823, yearPeak: 1851, yearEnd: 1882, peak: 1.4,  track: "SCENE", note: "lit translucent scene; pioneered by Daguerre" },
  { id: "stereoscope",    label: "stereoscope",    yearStart: 1850, yearPeak: 1865, yearEnd: 1900, peak: 1.7,  track: "SCENE", note: "binocular depth illusion; ancestor of VR headset" },
  { id: "magic-lantern",  label: "magic lantern",  yearStart: 1860, yearPeak: 1880, yearEnd: 1915, peak: 0.67, track: "SCENE", note: "projected glass slide; lectures and entertainment" },
  { id: "cinema",         label: "cinema",         yearStart: 1910, yearPeak: 1935, yearEnd: 1972, peak: 3.6,  track: "SCENE", note: "BrE institution and venue; AmE uses 'movies'" },
  { id: "simulation",     label: "simulation",     yearStart: 1983, yearPeak: 1995, yearEnd: 2019, peak: 1.2,  track: "SCENE", note: "computer-modelled world; Baudrillard enters tech" },
  { id: "virtual-reality",label: "virtual reality",yearStart: 2010, yearPeak: 2019, yearEnd: 2019, peak: 2.5,  track: "SCENE", note: "HMD revival; arc from stereoscope to spatial VR" },
];

type CorpusBias = {
  t: number;
  label: string;
  family: "image" | "audio" | "light";
};

const corpusBiasByTermId: Partial<Record<string, CorpusBias>> = {
  photography: { t: 0.50, label: "photography", family: "image" },
  "motion-picture": { t: 0.82, label: "motion picture", family: "image" },
  gramophone: { t: 0.20, label: "gramophone", family: "audio" },
  "electric-light": { t: 0.50, label: "electric light", family: "light" },
  phonograph: { t: 0.80, label: "phonograph", family: "audio" },
};

type BiasOnlyMarker = {
  id: string;
  label: string;
  yearPeak: number;
  track: TrackKey;
  t: number;
  family: "image" | "audio" | "light" | "industrial";
};

const biasOnlyMarkers: BiasOnlyMarker[] = [
  { id: "bias-cinematograph", label: "cinematograph", yearPeak: 1897, track: "SIGHT", t: 0.18, family: "image" },
  { id: "bias-photomechanical", label: "photomechanical", yearPeak: 1890, track: "SIGHT", t: 0.40, family: "industrial" },
  { id: "bias-halftone", label: "halftone", yearPeak: 1895, track: "SIGHT", t: 0.50, family: "industrial" },
  { id: "bias-mass-production", label: "mass production", yearPeak: 1930, track: "SCENE", t: 0.50, family: "industrial" },
];

const biasMarkerOffset: Record<string, { y: number; labelX: number; labelY: number; anchor: "start" | "end" }> = {
  "bias-cinematograph": { y: -74, labelX: 10, labelY: 4, anchor: "start" },
  "bias-photomechanical": { y: 50, labelX: 12, labelY: -12, anchor: "start" },
  "bias-halftone": { y: 86, labelX: -12, labelY: 6, anchor: "end" },
  "bias-mass-production": { y: 42, labelX: 10, labelY: 4, anchor: "start" },
};

function markerY(marker: BiasOnlyMarker) {
  return TRACK_Y[marker.track] + (biasMarkerOffset[marker.id]?.y ?? (marker.family === "industrial" ? 64 : -64));
}

function biasLabel(t: number): string {
  if (t < 0.26) return "strongly BrE";
  if (t < 0.42) return "BrE-leaning";
  if (t < 0.60) return "balanced";
  if (t < 0.76) return "AmE-leaning";
  return "strongly AmE";
}

type HoverCandidate = {
  id: string;
  termId: string;
  x: number;
  y: number;
  radius: number;
};

const trackSummaries: Record<TrackKey, string> = {
  SIGHT: "image -> motion -> digital",
  SOUND: "device -> recording -> fidelity",
  LIGHT: "illumination -> staging -> studio",
  SCENE: "spectacle -> cinema -> simulation",
};

const trackSummaryPosition: Record<TrackKey, { x: number; y: number; anchor: "start" | "middle" | "end" }> = {
  SIGHT: { x: VW - 14, y: TRACK_Y.SIGHT - 36, anchor: "end" },
  SOUND: { x: VW - 14, y: TRACK_Y.SOUND - 48, anchor: "end" },
  LIGHT: { x: VW - 14, y: TRACK_Y.LIGHT - 36, anchor: "end" },
  SCENE: { x: TL_LEFT + 408, y: TRACK_Y.SCENE - 54, anchor: "middle" },
};

// ── Component ────────────────────────────────────────────────────────────────
export function ArtificialChart03Succession({ activeHover, onHover }: Chart03HoverProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  const activeTermId = hovered ?? activeHover?.termId ?? null;
  const activeDomain = activeHover?.domain;

  // Group and sort terms by track for auto-generated succession arcs
  const sortedByTrack = useMemo(() => {
    const groups: Record<TrackKey, Term[]> = { SIGHT: [], SOUND: [], LIGHT: [], SCENE: [] };
    for (const t of terms) groups[t.track].push(t);
    for (const key of Object.keys(groups) as TrackKey[]) {
      groups[key].sort((a, b) => a.yearPeak - b.yearPeak);
    }
    return groups;
  }, []);

  const hoverCandidates = useMemo<HoverCandidate[]>(() => [
    ...terms.map((t) => ({
      id: t.id,
      termId: t.id,
      x: yearToX(t.yearPeak),
      y: termY(t),
      radius: Math.max(18, calcR(t.track, t.peak) + 8),
    })),
    ...biasOnlyMarkers.map((m) => ({
      id: m.id,
      termId: m.id.replace(/^bias-/, ""),
      x: yearToX(m.yearPeak),
      y: markerY(m),
      radius: 18,
    })),
  ], []);

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        style={{ display: "block", width: "100%", minWidth: 1160 }}
        aria-label="Chart 05 — Succession: four sensory tracks 1800–2019"
        onMouseMove={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          const x = ((event.clientX - rect.left) / rect.width) * VW;
          const y = ((event.clientY - rect.top) / rect.height) * VH;
          let bestId: string | null = null;
          let bestTermId: string | null = null;
          let bestDistance = Infinity;

          for (const candidate of hoverCandidates) {
            const dx = x - candidate.x;
            const dy = y - candidate.y;
            const distance = dx * dx + dy * dy;
            if (distance <= candidate.radius * candidate.radius && distance < bestDistance) {
              bestId = candidate.id;
              bestTermId = candidate.termId;
              bestDistance = distance;
            }
          }

          setHovered((prev) => (prev === bestId ? prev : bestId));
          onHover?.(bestTermId ? chart03HoverForTerm(bestTermId, "succession") : null);
        }}
        onMouseLeave={() => {
          setHovered(null);
          onHover?.(null);
        }}
      >
        {/* ── Section header ────────────────────────────────────── */}
        <text x={HEADER_LEFT} y={HEADER_Y} fill={MUTED} fontSize={10.2} fontFamily="monospace" letterSpacing="0.08em" className="select-none">
          {"{05}"}
        </text>
        <text x={HEADER_LEFT + 38} y={HEADER_Y} fill={INK} fontSize={12.8} fontFamily="monospace" letterSpacing="0.13em" fontWeight="bold" className="select-none">
          SUCCESSION
        </text>
        <text x={HEADER_LEFT + 38} y={HEADER_Y + 16} fill={MUTED} fontSize={9.6} fontFamily="monospace" letterSpacing="0.05em" className="select-none">
          four sensory tracks — technology succeeds technology, 1800 – 2019
        </text>

        {/* ── Track row dividers ──────────────────────────────── */}
        {[50, 186, 322, 458, 632].map((y) => (
          <line key={y} x1={0} y1={y} x2={VW} y2={y} stroke={RULE} strokeWidth={0.55} />
        ))}

        {/* ── Decade gridlines ────────────────────────────────── */}
        {[1825, 1850, 1875, 1900, 1925, 1950, 1975, 2000].map((yr) => (
          <line
            key={yr}
            x1={yearToX(yr)} y1={50}
            x2={yearToX(yr)} y2={AXIS_Y}
            stroke={RULE} strokeWidth={0.38}
            strokeDasharray="1 6"
          />
        ))}

        {/* ── Track labels ────────────────────────────────────── */}
        {(Object.entries(TRACK_Y) as [TrackKey, number][]).map(([name, cy]) => {
          const summary = trackSummaryPosition[name];
          return (
          <g key={name} opacity={activeDomain && activeDomain.toUpperCase() !== name ? 0.38 : 1}>
            <text
              x={TL_LEFT - 10}
              y={cy + 4}
              textAnchor="end"
              fill={activeDomain?.toUpperCase() === name ? INK : MUTED}
              fontSize={10.8}
              fontFamily="monospace"
              letterSpacing="0.10em"
              className="select-none"
            >
              {name}
            </text>
            <text
              x={summary.x}
              y={summary.y}
              textAnchor={summary.anchor}
              fill={activeDomain?.toUpperCase() === name ? INK : DIM}
              fontSize={8}
              fontFamily="monospace"
              letterSpacing="0.04em"
              className="select-none"
              opacity={0.72}
            >
              {trackSummaries[name]}
            </text>
          </g>
        );
        })}

        {/* ── Year-range bars (active period) ─────────────────── */}
        {terms.map((t) => {
          const cy = TRACK_Y[t.track];
          const y = termY(t);
          const x1 = yearToX(t.yearStart);
          const x2 = Math.min(yearToX(t.yearEnd), TL_RIGHT);
          const meta = chart03TermIndex[t.id];
          const isHov = activeTermId === t.id || Boolean(activeTermId && meta?.relatedTerms?.includes(activeTermId));
          const domainLinked = activeDomain?.toUpperCase() === t.track;
          const dimmed = activeTermId !== null || activeDomain ? !isHov && !domainLinked : false;
          return (
            <line
              key={`bar-${t.id}`}
              x1={x1} y1={y} x2={x2} y2={y}
              stroke={INK}
              strokeWidth={isHov ? 1.4 : 0.6}
                opacity={dimmed ? 0.12 : isHov ? 0.68 : 0.34}
              style={{ transition: "opacity 0.18s, stroke-width 0.15s" }}
              pointerEvents="none"
            />
          );
        })}

        {/* ── Succession arcs (auto, between consecutive peak-year terms) ── */}
        {(Object.keys(sortedByTrack) as TrackKey[]).flatMap((track) =>
          sortedByTrack[track].slice(0, -1).map((a, i) => {
            const b = sortedByTrack[track][i + 1];
            const ay = termY(a);
            const by = termY(b);
            const x1 = yearToX(a.yearPeak);
            const x2 = yearToX(b.yearPeak);
            const r1 = calcR(track, a.peak);
            const r2 = calcR(track, b.peak);
            const mx = (x1 + x2) / 2;
            const my = Math.min(ay, by) - Math.max(r1, r2) * 0.86 - 10;
            const dimA = activeTermId !== null && activeTermId !== a.id && activeTermId !== b.id;
            return (
              <path
                key={`arc-${a.id}-${b.id}`}
                d={`M ${(x1 + r1 * 0.55).toFixed(1)} ${ay} Q ${mx.toFixed(1)} ${my.toFixed(1)} ${(x2 - r2 * 0.55).toFixed(1)} ${by}`}
                fill="none"
                stroke={INK}
                strokeWidth={0.5}
                strokeDasharray="2 3"
                opacity={dimA ? 0.10 : 0.34}
                style={{ transition: "opacity 0.18s" }}
                pointerEvents="none"
              />
            );
          })
        )}

        {/* ── Term circles + labels + tooltips ────────────────── */}
        {terms.map((t) => {
          const cx = yearToX(t.yearPeak);
          const cy = termY(t);
          const r = calcR(t.track, t.peak);
          const meta = chart03TermIndex[t.id];
          const isPrimary = activeTermId === t.id;
          const isHov = isPrimary || Boolean(activeTermId && meta?.relatedTerms?.includes(activeTermId));
          const domainLinked = activeDomain?.toUpperCase() === t.track;
          const dimmed = activeTermId !== null || activeDomain ? !isHov && !domainLinked : false;
          const bias = corpusBiasByTermId[t.id];
          const biasX = bias ? cx + (bias.t - 0.5) * Math.max(r + 46, 62) : cx;
          const biasY = cy - r - 26;

          // Tooltip: show above for SCENE (near axis), below for the rest
          const showAbove = t.track === "SCENE";
          const tooltipH = bias ? 78 : 62;
          const tooltipW = 290;
          const tx = Math.min(
            Math.max(cx - tooltipW / 2, TL_LEFT - 8),
            VW - tooltipW - 16,
          );
          const tooltipAbove = t.track === "SCENE" || cy > VH * 0.52;
          const ty = tooltipAbove ? Math.max(60, cy - r - tooltipH - 18) : cy + r + 18;
          const labelY = cy + (labelLaneOffset[t.id] ?? (showAbove ? -r - 12 : r + 20));
          const labelPosition = labelXOffset[t.id] ?? { dx: 0, anchor: "middle" as const };
          const labelX = cx + labelPosition.dx;
          const useOutsideLabel = outsideLabelIds.has(t.id) || r < 12;

          return (
            <g
              key={t.id}
              style={{ cursor: "default" }}
            >
              {/* Hover halo */}
              {isHov && (
                <circle cx={cx} cy={cy} r={r + 5} fill="none" stroke={INK} strokeWidth={0.75} opacity={0.24} />
              )}

              {/* Circle ring */}
              <circle
                cx={cx} cy={cy} r={r}
                fill="rgba(245,236,210,0.72)"
                stroke={INK}
                strokeWidth={isHov ? 2 : 1}
                opacity={dimmed ? 0.22 : 0.90}
                style={{ transition: "opacity 0.18s, stroke-width 0.15s" }}
              />

              {/* Label inside circle (large enough) */}
              {r >= 12 && !useOutsideLabel && (
                <text
                  x={cx} y={cy + 3}
                  textAnchor="middle"
                  fill={INK}
                  fontSize={r >= 22 ? 11.2 : 9.4}
                  fontFamily="monospace"
                  letterSpacing="0.05em"
                  opacity={dimmed ? 0.18 : isHov ? 1 : 0.86}
                  style={{ transition: "opacity 0.18s" }}
                  className="select-none"
                >
                  {t.label}
                </text>
              )}

              {/* Centre dot for tiny circles */}
              {r < 8 && (
                <circle cx={cx} cy={cy} r={2.4} fill={INK} opacity={dimmed ? 0.22 : 0.74} />
              )}

              {/* Corpus-bias side mark: red dot position encodes BrE ← → AmE */}
              {bias && (
                <g pointerEvents="none">
                  <line
                    x1={cx}
                    y1={biasY}
                    x2={biasX}
                    y2={biasY}
                    stroke={RED_DIM}
                    strokeWidth={0.75}
                    opacity={dimmed ? 0.18 : isHov ? 1 : 0.72}
                  />
                  <circle
                    cx={biasX}
                    cy={biasY}
                    r={isHov ? 4.4 : 3.4}
                    fill={RED}
                    opacity={dimmed ? 0.20 : isHov ? 1 : 0.90}
                  />
                </g>
              )}

              {/* Small label outside ring for medium circles */}
              {r >= 8 && useOutsideLabel && !isHov && (
                <text
                  x={labelX}
                  y={labelY}
                  textAnchor={labelPosition.anchor}
                  fill={INK}
                  fontSize={9}
                  fontFamily="monospace"
                  letterSpacing="0.04em"
                  opacity={dimmed ? 0.18 : 0.82}
                  className="select-none"
                >
                  {t.label}
                </text>
              )}

              {/* Hover tooltip */}
              {isPrimary && (
                <g pointerEvents="none">
                  <rect
                    x={tx} y={ty}
                    width={tooltipW} height={tooltipH}
                    fill="rgba(245,236,210,0.97)"
                    stroke={INK} strokeWidth={0.75}
                    rx={1.5}
                  />
                  {/* Term name */}
                  <text x={tx + 12} y={ty + 18} fill={INK} fontSize={9.3} fontFamily="monospace" fontWeight="bold" letterSpacing="0.07em" className="select-none">
                    {t.label.toUpperCase()}
                  </text>
                  {/* Year range + peak */}
                  <text x={tx + 12} y={ty + 36} fill={DIM} fontSize={8.2} fontFamily="monospace" letterSpacing="0.05em" className="select-none">
                    {t.yearStart}–{t.yearEnd}  ·  {t.peak.toFixed(1)}/M  c.{t.yearPeak}
                  </text>
                  {/* Note */}
                  <text x={tx + 12} y={ty + 54} fill={MUTED} fontSize={8.3} fontFamily="monospace" fontStyle="italic" letterSpacing="0.04em" className="select-none">
                    {t.note}
                  </text>
                  {bias && (
                    <text x={tx + 12} y={ty + 70} fill={RED_DIM} fontSize={8.7} fontFamily="monospace" letterSpacing="0.05em" className="select-none">
                      corpus bias: {biasLabel(bias.t)} · {bias.family} term
                    </text>
                  )}
                </g>
              )}
            </g>
          );
        })}

        {/* Bias-only vocabulary from the removed 06 panel, integrated as a light overlay. */}
        {biasOnlyMarkers.map((m) => {
          const cx = yearToX(m.yearPeak);
          const cy = markerY(m);
          const termId = m.id.replace(/^bias-/, "");
          const isHov = activeTermId === m.id || activeTermId === termId;
          const dimmed = activeTermId !== null && !isHov;
          const offset = biasMarkerOffset[m.id] ?? { y: 0, labelX: 10, labelY: 4, anchor: "start" as const };
          const tooltipW = 238;
          const tooltipH = 48;
          const tx = Math.min(Math.max(cx - tooltipW / 2, TL_LEFT - 8), VW - tooltipW - 16);
          const ty = Math.max(60, cy - tooltipH - 16);
          return (
            <g
              key={m.id}
              style={{ cursor: "default" }}
            >
              <circle cx={cx} cy={cy} r={19} fill="transparent" />
              <path
                d={`M ${cx} ${cy - 6} L ${cx + 6} ${cy} L ${cx} ${cy + 6} L ${cx - 6} ${cy} Z`}
                fill={RED}
                opacity={dimmed ? 0.18 : isHov ? 1 : 0.90}
                pointerEvents="none"
              />
              <text
                x={cx + offset.labelX}
                y={cy + offset.labelY}
                textAnchor={offset.anchor}
                fill={isHov ? INK : RED_DIM}
                fontSize={isHov ? 9.4 : 8.6}
                fontFamily="monospace"
                letterSpacing="0.04em"
                className="select-none"
                pointerEvents="none"
              >
                {m.label}
              </text>
              {isHov && (
                <g pointerEvents="none">
                  <rect x={tx} y={ty} width={tooltipW} height={tooltipH} fill="rgba(245,236,210,0.97)" stroke={RED} strokeWidth={0.8} rx={1.5} />
                  <text x={tx + 12} y={ty + 18} fill={INK} fontSize={9.3} fontFamily="monospace" fontWeight="bold" letterSpacing="0.07em" className="select-none">
                    {m.label.toUpperCase()}
                  </text>
                  <text x={tx + 12} y={ty + 36} fill={RED_DIM} fontSize={8.7} fontFamily="monospace" letterSpacing="0.05em" className="select-none">
                    {m.family === "industrial" ? "material layer: image reproduction" : `corpus bias: ${biasLabel(m.t)} · ${m.family} term`}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* ── Time axis ───────────────────────────────────────── */}
        <line x1={TL_LEFT} y1={AXIS_Y} x2={TL_RIGHT} y2={AXIS_Y} stroke={RULE} strokeWidth={0.65} />
        {[1800, 1825, 1850, 1875, 1900, 1925, 1950, 1975, 2000, 2019].map((yr) => (
          <g key={yr}>
            <line
              x1={yearToX(yr)} y1={AXIS_Y - 3}
              x2={yearToX(yr)} y2={AXIS_Y + 3}
              stroke={RULE} strokeWidth={0.8}
            />
            <text
              x={yearToX(yr)} y={AXIS_Y + 11}
              textAnchor="middle"
              fill={MUTED} fontSize={9.4} fontFamily="monospace"
              className="select-none"
            >
              {yr}
            </text>
          </g>
        ))}

        {/* ── Footer note ─────────────────────────────────────── */}
        <text
          x={TL_LEFT} y={SUCCESSION_FOOTER_Y}
          fill={DIM} fontSize={9} fontFamily="monospace" letterSpacing="0.04em"
          className="select-none"
        >
          bar = active period  ·  circle area ∝ peak ngram frequency  ·  hover for detail
        </text>
        <g className="select-none">
          <circle cx={TL_RIGHT - 420} cy={SUCCESSION_FOOTER_Y} r={4} fill={RED} opacity={0.96} />
          <text x={TL_RIGHT - 404} y={SUCCESSION_FOOTER_Y + 4} fill={RED_DIM} fontSize={9} fontFamily="monospace" letterSpacing="0.04em">
            red side mark = BrE ← corpus bias → AmE
          </text>
        </g>
        <text
          x={TL_LEFT} y={VH - 10}
          fill={DIM} fontSize={9.4} fontFamily="monospace" letterSpacing="0.04em"
          className="select-none"
        >
          bias overlay: BrE / AmE positions approximate · red diamond = bias-only vocabulary
        </text>
      </svg>
    </div>
  );
}
