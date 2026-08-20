export const DOT_COUNT = 94;

export type DotPoint = {
  x: number;
  y: number;
  r: number;
  opacity: number;
};

export type DotLayoutName =
  | "scatter"
  | "mass"
  | "cut"
  | "packaged"
  | "named"
  | "ruled"
  | "made";

export const VISUAL_DOTS = Array.from(
  { length: DOT_COUNT },
  (_, index) => ({
    id: `data-dot-${String(index + 1).padStart(2, "0")}`,
    index,
  }),
);

const point = (
  x: number,
  y: number,
  r = 1.25,
  opacity = 1,
): DotPoint => ({
  x,
  y,
  r,
  opacity,
});

const countForGroup = (
  total: number,
  groups: number,
  group: number,
) =>
  Math.floor(total / groups) +
  (group < total % groups ? 1 : 0);

export const scatterLayout: DotPoint[] =
  VISUAL_DOTS.map(({ index }) => {
    const x =
      10 + (((index * 37) % 97) / 96) * 80;

    const y =
      10 + (((index * 53) % 89) / 88) * 80;

    return point(x, y, 1.05, 0.48);
  });

export const massLayout: DotPoint[] =
  VISUAL_DOTS.map(({ index }) => {
    const row = Math.floor(index / 10);
    const column = index % 10;

    const rowCount = row === 9 ? 4 : 10;
    const spacingX = 7.515;
    const spacingY = 7.335;

    const startX =
      50 - ((rowCount - 1) * spacingX) / 2;

    return point(
      startX + column * spacingX,
      11.5 + row * spacingY,
      2.55,
      1,
    );
  });

const CUT_DIRECTIONS = [
  { x: -1, y: 0 },
  { x: 0, y: -1 },
  { x: 1, y: 0 },
  { x: 0, y: 1 },
] as const;

export const cutLayout: DotPoint[] =
  VISUAL_DOTS.map(({ index }) => {
    const arm = index % 4;
    const slot = Math.floor(index / 4);
    const direction = CUT_DIRECTIONS[arm];

    const distance = 9 + slot * 1.36;
    const perpendicular =
      ((slot % 3) - 1) * 1.15;

    const px = -direction.y;
    const py = direction.x;

    return point(
      50 +
        direction.x * distance +
        px * perpendicular,
      50 +
        direction.y * distance +
        py * perpendicular,
      slot % 6 === 0 ? 1.75 : 1.15,
      1,
    );
  });

const PACKAGE_CENTERS = [
  { x: 28, y: 28 },
  { x: 72, y: 28 },
  { x: 28, y: 72 },
  { x: 72, y: 72 },
] as const;

const GOLDEN_ANGLE = 2.399963229728653;

export const packagedLayout: DotPoint[] =
  VISUAL_DOTS.map(({ index }) => {
    const group = index % 4;
    const slot = Math.floor(index / 4);
    const center = PACKAGE_CENTERS[group];

    const angle =
      slot * GOLDEN_ANGLE + group * 0.42;

    const radius =
      slot === 0 ? 0 : 2.35 * Math.sqrt(slot);

    return point(
      center.x + Math.cos(angle) * radius,
      center.y + Math.sin(angle) * radius,
      slot % 7 === 0
        ? 2.75
        : slot % 4 === 0
          ? 1.75
          : 1.05,
      1,
    );
  });

const NAMED_COLUMNS = [14, 32, 50, 68, 86];

export const namedLayout: DotPoint[] =
  VISUAL_DOTS.map(({ index }) => {
    const column = index % 5;
    const slot = Math.floor(index / 5);

    const groupCount = countForGroup(
      DOT_COUNT,
      5,
      column,
    );

    const y =
      groupCount <= 1
        ? 50
        : 10 +
          (slot / (groupCount - 1)) * 80;

    return point(
      NAMED_COLUMNS[column],
      y,
      slot % 6 === 0 ? 1.9 : 1.15,
      1,
    );
  });

const RULED_RADII = [14, 23, 32, 41];

export const ruledLayout: DotPoint[] =
  VISUAL_DOTS.map(({ index }) => {
    const ring = index % 4;
    const slot = Math.floor(index / 4);

    const ringCount = countForGroup(
      DOT_COUNT,
      4,
      ring,
    );

    const angle =
      -Math.PI / 2 +
      (slot / ringCount) * Math.PI * 2;

    const radius = RULED_RADII[ring];

    return point(
      50 + Math.cos(angle) * radius,
      50 + Math.sin(angle) * radius,
      slot === 0 ? 2.3 : 1.1,
      ring === 0 ? 1 : 0.82,
    );
  });

const MADE_LANES = [22, 41, 60, 79];

export const madeLayout: DotPoint[] =
  VISUAL_DOTS.map(({ index }) => {
    const lane = index % 4;
    const slot = Math.floor(index / 4);

    const laneCount = countForGroup(
      DOT_COUNT,
      4,
      lane,
    );

    const x =
      laneCount <= 1
        ? 50
        : 9 +
          (slot / (laneCount - 1)) * 82;

    const wave =
      Math.sin(slot * 0.72 + lane * 0.8) *
      1.35;

    return point(
      x,
      MADE_LANES[lane] + wave,
      slot % 6 === 0 ? 2.25 : 1.05,
      1,
    );
  });

export const DOT_LAYOUTS: Record<
  DotLayoutName,
  DotPoint[]
> = {
  scatter: scatterLayout,
  mass: massLayout,
  cut: cutLayout,
  packaged: packagedLayout,
  named: namedLayout,
  ruled: ruledLayout,
  made: madeLayout,
};
