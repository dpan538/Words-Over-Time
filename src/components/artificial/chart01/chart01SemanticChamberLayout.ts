export type Vec3 = [number, number, number];

export const chamber = {
  width: 10,
  height: 7,
  depth: 16,
};

export const chamberNodePositions: Record<string, Vec3> = {
  artificial: [0, 0, 0],
  art: [-3.8, 1.8, 1],
  artifice: [-3.4, 0.6, -1],
  artificer: [-3.0, -1.0, -2],
  artificially: [-3.6, -1.8, 0],
  artificial_arguments: [3.8, 1.8, 1],
  artificial_numbers: [3.4, 0.6, -1],
  artificial_memory: [3.0, -1.0, -2],
  artificial_day: [3.6, -1.8, 0],
  made_by_art_skill: [-2.8, 1.2, -7],
  contrivance_construction: [-1.2, 0.6, -7],
  not_natural: [0.8, 0.6, -7],
  fake_not_genuine: [2.6, 0.6, -7],
  imitation_substitute: [2.0, -0.8, -7],
  affected_insincere: [0.6, -1.8, -7],
  guide_not_natural_not_fake: [2.4, 2.0, -7],
  guide_contrivance_not_deception_only: [-1.4, 2.0, -7],
};

export const chamberPlaneLabels = [
  {
    id: "label_wall_left",
    label: "word family",
    position: [-5, 3.2, 6] satisfies Vec3,
  },
  {
    id: "label_wall_right",
    label: "technical construction",
    position: [5, 3.2, 6] satisfies Vec3,
  },
  {
    id: "label_wall_back",
    label: "sense boundary",
    position: [0, 3.2, -8] satisfies Vec3,
  },
];
