"use client";

import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import {
  chamberEdges,
  chamberNodes,
  chamberStateLabels,
  type ChamberState,
} from "@/components/artificial/chart01/chart01SemanticChamberData";
import {
  chamber,
  chamberNodePositions,
  chamberPlaneLabels,
  type Vec3,
} from "@/components/artificial/chart01/chart01SemanticChamberLayout";

type LabelPosition = {
  x: number;
  y: number;
  visible: boolean;
};

type SemanticArrow = {
  sourceId: string;
  targetId: string;
  label: string;
  id: string;
};

type ArrowLabel = {
  id: string;
  label: string;
  position: Vec3;
};

const stateOrder: ChamberState[] = [
  "resting",
  "word_family",
  "technical",
  "sense_boundary",
  "full_overlay",
];

const technicalArrows: SemanticArrow[] = [
  { id: "technical_arrow_1", sourceId: "artificial", targetId: "artificial_arguments", label: "1" },
  { id: "technical_arrow_2", sourceId: "artificial", targetId: "artificial_numbers", label: "2" },
  { id: "technical_arrow_3", sourceId: "artificial", targetId: "artificial_memory", label: "3" },
];

const stateVisibleLabels: Record<ChamberState, string[]> = {
  resting: ["artificial"],
  word_family: ["art", "artifice", "artificial", "artificer", "artificially"],
  technical: [
    "artificial",
    "made_by_art_skill",
    "artificial_arguments",
    "artificial_numbers",
    "artificial_memory",
    "artificial_day",
  ],
  sense_boundary: [
    "artificial",
    "made_by_art_skill",
    "contrivance_construction",
    "not_natural",
    "fake_not_genuine",
    "imitation_substitute",
    "affected_insincere",
    "guide_not_natural_not_fake",
  ],
  full_overlay: chamberNodes.filter((node) => node.visibility !== "notes_only").map((node) => node.id),
};

const labelAnchors: Partial<Record<string, [number, number]>> = {
  art: [-28, -22],
  artifice: [-24, -20],
  artificial: [0, -22],
  artificially: [18, -18],
  artificer: [-26, -18],
  artificial_arguments: [-30, -14],
  artificial_numbers: [4, -22],
  artificial_memory: [20, -14],
  artificial_day: [16, -16],
  made_by_art_skill: [-32, -14],
  contrivance_construction: [-36, -12],
  not_natural: [-8, -22],
  fake_not_genuine: [18, -14],
  imitation_substitute: [20, -12],
  affected_insincere: [16, -12],
  guide_not_natural_not_fake: [4, -20],
};

const labelFontSizes: Record<string, string> = {
  artificial: "0.86rem",
  art: "0.76rem",
  artifice: "0.76rem",
  artificer: "0.72rem",
  artificially: "0.72rem",
  artificial_arguments: "0.72rem",
  artificial_numbers: "0.72rem",
  artificial_memory: "0.72rem",
  made_by_art_skill: "0.72rem",
  contrivance_construction: "0.70rem",
  not_natural: "0.72rem",
  fake_not_genuine: "0.70rem",
  artificial_day: "0.68rem",
  imitation_substitute: "0.68rem",
  affected_insincere: "0.68rem",
  guide_not_natural_not_fake: "0.70rem",
};

const visualScale = {
  sphereMain: 0.085,
  sphereA: 0.06,
  sphereB: 0.045,
  sphereC: 0.03,
  shaftMain: 0.014,
  shaftSub: 0.009,
  shaftAnnot: 0.006,
  coneLen: 0.16,
  coneRadius: 0.055,
  coneSubLen: 0.12,
  coneSubRadius: 0.04,
} as const;

const layerColors = {
  wordFamily: 0x050510,
  technical: 0x2a2a3a,
  senseBoundary: 0x555568,
} as const;

const phaseColor = 0xa1081f;

const stateDescriptions: Record<ChamberState, string> = {
  resting: "\"artificial\" in its semantic space, before analysis.",
  word_family: "Left wall: the word family. \"artificial\" derives from \"artifice\" and \"art\".",
  technical: "Right wall: technical projections. Scholarly uses built on the root sense.",
  sense_boundary: "Back wall: semantic evolution. \"not natural\" is not the same as \"fake\".",
  full_overlay: "All three walls simultaneously. Depth marks semantic distance from the word.",
};

const planeDisplay: Record<string, string> = {
  word_family: "word family / left wall",
  technical_construction: "technical / right wall",
  sense_boundary: "sense boundary / back wall",
  guide: "guide",
};

const roleNotes: Partial<Record<string, string>> = {
  "central word": "the word under analysis",
  "skill / learned practice": "Latin ars - human skill",
  "origin sense": "the founding meaning of the word",
  "bridge sense": "links skill to construction",
  "distinct sense": "not the same as fake",
  "suspicious branch": "later semantic contamination",
};

const cameraPosition = new THREE.Vector3(0, 0, 9);

const nodesById = new Map(chamberNodes.map((node) => [node.id, node]));

function vector([x, y, z]: Vec3) {
  return new THREE.Vector3(x, y, z);
}

function lineMaterial(opacity: number, width = 1) {
  return new THREE.LineBasicMaterial({
    color: 0x050510,
    transparent: true,
    opacity,
    linewidth: width,
  });
}

function makeLine(points: Vec3[], opacity: number) {
  const geometry = new THREE.BufferGeometry().setFromPoints(points.map(vector));
  return new THREE.Line(geometry, lineMaterial(opacity));
}

function disposeMaterial(material: THREE.Material) {
  const materialWithTexture = material as THREE.Material & { map?: THREE.Texture };
  materialWithTexture.map?.dispose();
  material.dispose();
}

function disposeObject3D(object: THREE.Object3D) {
  object.traverse((child) => {
    const disposable = child as THREE.Object3D & {
      geometry?: THREE.BufferGeometry;
      material?: THREE.Material | THREE.Material[];
    };
    disposable.geometry?.dispose();
    const material = disposable.material;
    if (Array.isArray(material)) {
      material.forEach(disposeMaterial);
    } else if (material) {
      disposeMaterial(material);
    }
  });
}

function arrowsForState(activeState: ChamberState) {
  if (activeState === "technical") return technicalArrows;
  return [];
}

function labelsForArrows(arrows: SemanticArrow[]): ArrowLabel[] {
  return arrows.flatMap((arrow) => {
    const source = chamberNodePositions[arrow.sourceId];
    const target = chamberNodePositions[arrow.targetId];
    if (!source || !target) return [];
    const midpoint = vector(source).add(vector(target)).multiplyScalar(0.5);
    return [
      {
        id: arrow.id,
        label: arrow.label,
        position: [midpoint.x, midpoint.y + 0.18, midpoint.z],
      } satisfies ArrowLabel,
    ];
  });
}

function makeCylinder(
  container: THREE.Object3D,
  from: THREE.Vector3,
  to: THREE.Vector3,
  radius = 0.045,
  opacity = 1,
  color = 0x050510,
) {
  const direction = to.clone().sub(from);
  const length = direction.length();
  if (length < 0.01) return;

  const geometry = new THREE.CylinderGeometry(radius, radius, length, 8, 1);
  const material = new THREE.MeshLambertMaterial({
    color,
    transparent: opacity < 1,
    opacity,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.copy(from.clone().add(to).multiplyScalar(0.5));
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize());
  container.add(mesh);
}

function makeCone(
  container: THREE.Object3D,
  tip: THREE.Vector3,
  direction: THREE.Vector3,
  headLength = 0.26,
  headRadius = 0.09,
  opacity = 1,
  color = 0x050510,
) {
  const normalized = direction.clone().normalize();
  const geometry = new THREE.ConeGeometry(headRadius, headLength, 8);
  const material = new THREE.MeshLambertMaterial({
    color,
    transparent: opacity < 1,
    opacity,
  });
  const cone = new THREE.Mesh(geometry, material);
  cone.position.copy(tip.clone().sub(normalized.clone().multiplyScalar(headLength * 0.5)));
  cone.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normalized);
  container.add(cone);
}

function makeDirectedArrow(
  container: THREE.Object3D,
  fromId: string,
  toId: string,
  shaftRadius = 0.042,
  headLength = 0.26,
  headRadius = 0.09,
  opacity = 1,
  color = 0x050510,
): Vec3 | null {
  const from = chamberNodePositions[fromId];
  const to = chamberNodePositions[toId];
  if (!from || !to) return null;

  const source = vector(from);
  const target = vector(to);
  const direction = target.clone().sub(source).normalize();
  const cappedShaftRadius = Math.min(shaftRadius, 0.022);
  const cappedHeadLength = Math.min(headLength, 0.2);
  const cappedHeadRadius = Math.min(headRadius, 0.07);
  const shaftTip = target.clone().sub(direction.clone().multiplyScalar(cappedHeadLength));
  makeCylinder(container, source, shaftTip, cappedShaftRadius, opacity, color);
  makeCone(container, target, direction, cappedHeadLength, cappedHeadRadius, opacity, color);

  const midpoint = source.clone().add(target).multiplyScalar(0.5);
  return [midpoint.x, midpoint.y + 0.18, midpoint.z];
}

function makeSphereNode(
  container: THREE.Object3D,
  nodeId: string,
  radius = 0.13,
  opacity = 1,
  hoveredNodeId: string | null = null,
  color = 0x050510,
) {
  const position = chamberNodePositions[nodeId];
  if (!position) return;
  const maxRadius = nodeId === "artificial" ? 0.14 : 0.11;
  const visualRadius = Math.min(radius, maxRadius);
  const depthFade = 1 - Math.max(0, (6 - position[2]) / 14) * 0.45;
  const visualOpacity = Math.min(opacity, opacity * depthFade);
  const geometry = new THREE.SphereGeometry(
    nodeId === hoveredNodeId ? visualRadius * 1.35 : visualRadius,
    16,
    12,
  );
  const material = new THREE.MeshLambertMaterial({
    color,
    transparent: visualOpacity < 0.99,
    opacity: visualOpacity,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(...position);
  container.add(mesh);
}

function makeDriftArc(
  container: THREE.Object3D,
  fromId: string,
  toId: string,
  arcHeight = 1,
  opacity = 0.75,
) {
  const fromPoint = chamberNodePositions[fromId];
  const toPoint = chamberNodePositions[toId];
  if (!fromPoint || !toPoint) return;

  const from = vector(fromPoint);
  const to = vector(toPoint);
  const midpoint = from.clone().add(to).multiplyScalar(0.5);
  midpoint.y += arcHeight;
  const curve = new THREE.QuadraticBezierCurve3(from, midpoint, to);
  const points = curve.getPoints(80);

  for (let index = 0; index < points.length - 1; index += 5) {
    const segment = points.slice(index, Math.min(index + 3, points.length));
    if (segment.length < 2) break;
    const geometry = new THREE.BufferGeometry().setFromPoints(segment);
    const material = new THREE.LineBasicMaterial({
      color: 0x050510,
      transparent: true,
      opacity,
    });
    container.add(new THREE.Line(geometry, material));
  }
}

type WallFace = "left" | "right" | "back" | "floor";

function highlightWall(container: THREE.Object3D, face: WallFace | "all", opacity = 0.09) {
  const halfW = chamber.width / 2;
  const halfH = chamber.height / 2;
  const halfD = chamber.depth / 2;

  const addWall = (
    width: number,
    height: number,
    position: Vec3,
    rotation: Vec3,
    wallOpacity: number,
  ) => {
    const geometry = new THREE.PlaneGeometry(width, height);
    const material = new THREE.MeshBasicMaterial({
      color: 0xb8a878,
      transparent: true,
      opacity: wallOpacity,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const wall = new THREE.Mesh(geometry, material);
    wall.position.set(...position);
    wall.rotation.set(...rotation);
    container.add(wall);
  };

  if (face === "left" || face === "all") {
    addWall(chamber.depth, chamber.height, [-halfW, 0, 0], [0, Math.PI / 2, 0], face === "all" ? opacity * 0.6 : opacity);
  }
  if (face === "right" || face === "all") {
    addWall(chamber.depth, chamber.height, [halfW, 0, 0], [0, -Math.PI / 2, 0], face === "all" ? opacity * 0.6 : opacity);
  }
  if (face === "back" || face === "all") {
    addWall(chamber.width, chamber.height, [0, 0, -halfD], [0, 0, 0], face === "all" ? opacity * 0.6 : opacity);
  }
  if (face === "floor" || face === "all") {
    addWall(chamber.width, chamber.depth, [0, -halfH, 0], [Math.PI / 2, 0, 0], face === "all" ? opacity * 0.4 : opacity);
  }
}

function makePhaseContour(
  container: THREE.Object3D,
  width: number,
  height: number,
  position: Vec3,
  rotation: Vec3,
  opacity = 0.16,
) {
  const geometry = new THREE.PlaneGeometry(width, height);
  const edges = new THREE.EdgesGeometry(geometry);
  const material = new THREE.LineBasicMaterial({
    color: phaseColor,
    transparent: true,
    opacity,
  });
  const contour = new THREE.LineSegments(edges, material);
  contour.position.set(...position);
  contour.rotation.set(...rotation);
  container.add(contour);
}

function addPhaseSheets(container: THREE.Object3D, face: WallFace | "all", opacity = 0.12) {
  const halfW = chamber.width / 2;
  const halfH = chamber.height / 2;
  const halfD = chamber.depth / 2;
  const offsets = [-0.34, 0, 0.34];

  if (face === "left" || face === "all") {
    offsets.forEach((offset, index) => {
      makePhaseContour(
        container,
        chamber.depth * (0.72 + index * 0.08),
        chamber.height * (0.74 + index * 0.05),
        [-halfW + 0.03, offset * 1.2, offset * 2.8],
        [0, Math.PI / 2, 0],
        opacity * (0.9 - index * 0.16),
      );
    });
  }

  if (face === "right" || face === "all") {
    offsets.forEach((offset, index) => {
      makePhaseContour(
        container,
        chamber.depth * (0.72 + index * 0.08),
        chamber.height * (0.74 + index * 0.05),
        [halfW - 0.03, offset * 1.2, offset * 2.8],
        [0, -Math.PI / 2, 0],
        opacity * (0.9 - index * 0.16),
      );
    });
  }

  if (face === "back" || face === "all") {
    offsets.forEach((offset, index) => {
      makePhaseContour(
        container,
        chamber.width * (0.72 + index * 0.08),
        chamber.height * (0.74 + index * 0.05),
        [offset * 2.6, offset * 1.1, -halfD + 0.03],
        [0, 0, 0],
        opacity * (0.9 - index * 0.16),
      );
    });
  }

  if (face === "floor" || face === "all") {
    offsets.forEach((offset, index) => {
      makePhaseContour(
        container,
        chamber.width * (0.78 + index * 0.06),
        chamber.depth * (0.70 + index * 0.06),
        [offset * 2.5, -halfH + 0.03, offset * 2.1],
        [Math.PI / 2, 0, 0],
        opacity * (0.55 - index * 0.08),
      );
    });
  }
}

function addCentralPhaseRings(container: THREE.Object3D, opacity = 0.18) {
  const ringSpecs = [
    { radius: 0.82, tube: 0.006, rotation: [Math.PI / 2, 0, 0] as Vec3, spin: 0.0018 },
    { radius: 1.08, tube: 0.005, rotation: [Math.PI / 2.8, Math.PI / 8, 0] as Vec3, spin: -0.0012 },
    { radius: 1.34, tube: 0.004, rotation: [Math.PI / 2.25, -Math.PI / 10, 0] as Vec3, spin: 0.0009 },
  ];

  ringSpecs.forEach((spec, index) => {
    const geometry = new THREE.TorusGeometry(spec.radius, spec.tube, 6, 96);
    const material = new THREE.MeshBasicMaterial({
      color: phaseColor,
      transparent: true,
      opacity: opacity * (1 - index * 0.18),
      depthWrite: false,
    });
    const ring = new THREE.Mesh(geometry, material);
    ring.rotation.set(...spec.rotation);
    ring.userData.phaseSpin = spec.spin;
    container.add(ring);
  });
}

function addPhaseSweep(scene: THREE.Scene) {
  const halfH = chamber.height / 2;
  const geometry = new THREE.PlaneGeometry(chamber.width * 1.08, 0.03);
  const material = new THREE.MeshBasicMaterial({
    color: phaseColor,
    transparent: true,
    opacity: 0.18,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const sweep = new THREE.Mesh(geometry, material);
  sweep.position.set(0, -halfH + 0.35, -chamber.depth / 2 + 0.06);
  sweep.userData.phaseSweep = true;
  scene.add(sweep);
}

function addLighting(scene: THREE.Scene) {
  const ambientLight = new THREE.AmbientLight(0xe8dfc8, 0.9);
  scene.add(ambientLight);

  const keyLight = new THREE.PointLight(0xffffff, 2.8, 100);
  keyLight.position.set(8, 10, 14);
  scene.add(keyLight);

  const fillLight = new THREE.PointLight(0xd0c8b0, 0.7, 80);
  fillLight.position.set(-10, -4, -12);
  scene.add(fillLight);
}

function makeFloorText(
  container: THREE.Object3D,
  text: string,
  x: number,
  z: number,
  opacity = 0.28,
) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 80;
  const context = canvas.getContext("2d");
  if (!context) return;
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = `rgba(5,5,16,${opacity})`;
  context.font = "600 28px 'Courier New', monospace";
  context.textAlign = "center";
  context.fillText(text.toUpperCase(), canvas.width / 2, 52);

  const texture = new THREE.CanvasTexture(canvas);
  const geometry = new THREE.PlaneGeometry(7, 0.55);
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(x, -3.49, z);
  container.add(mesh);
}

function makeCeilingText(
  container: THREE.Object3D,
  text: string,
  x: number,
  z: number,
  opacity = 0.18,
) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 80;
  const context = canvas.getContext("2d");
  if (!context) return;
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = `rgba(5,5,16,${opacity})`;
  context.font = "500 24px 'Courier New', monospace";
  context.textAlign = "center";
  context.fillText(text.toUpperCase(), canvas.width / 2, 52);

  const texture = new THREE.CanvasTexture(canvas);
  const geometry = new THREE.PlaneGeometry(7, 0.55);
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.x = Math.PI / 2;
  mesh.position.set(x, 3.49, z);
  container.add(mesh);
}

function addOpenChamberWireframe(scene: THREE.Scene) {
  const halfW = chamber.width / 2;
  const halfH = chamber.height / 2;
  const halfD = chamber.depth / 2;

  const backFrame: Vec3[] = [
    [-halfW, -halfH, -halfD],
    [halfW, -halfH, -halfD],
    [halfW, halfH, -halfD],
    [-halfW, halfH, -halfD],
    [-halfW, -halfH, -halfD],
  ];
  scene.add(makeLine(backFrame, 0.5));

  const depthEdges: [Vec3, Vec3][] = [
    [[-halfW, -halfH, halfD], [-halfW, -halfH, -halfD]],
    [[halfW, -halfH, halfD], [halfW, -halfH, -halfD]],
    [[halfW, halfH, halfD], [halfW, halfH, -halfD]],
    [[-halfW, halfH, halfD], [-halfW, halfH, -halfD]],
  ];

  depthEdges.forEach(([front, back]) => {
    const segmentCount = 10;
    for (let index = 0; index < segmentCount; index += 1) {
      const t0 = index / segmentCount;
      const t1 = (index + 1) / segmentCount;
      const start: Vec3 = [
        front[0] + (back[0] - front[0]) * t0,
        front[1] + (back[1] - front[1]) * t0,
        front[2] + (back[2] - front[2]) * t0,
      ];
      const end: Vec3 = [
        front[0] + (back[0] - front[0]) * t1,
        front[1] + (back[1] - front[1]) * t1,
        front[2] + (back[2] - front[2]) * t1,
      ];
      scene.add(makeLine([start, end], 0.65 - t0 * 0.43));
    }
  });
}

function addSpeakerRingInward(
  scene: THREE.Scene,
  position: Vec3,
  inward: THREE.Vector3,
  opacity = 0.16,
) {
  const geometry = new THREE.RingGeometry(0.05, 0.088, 18);
  const material = new THREE.MeshBasicMaterial({
    color: 0x050510,
    transparent: true,
    opacity,
    side: THREE.FrontSide,
    depthWrite: false,
  });
  const ring = new THREE.Mesh(geometry, material);
  ring.position.set(...position);
  ring.lookAt(position[0] + inward.x, position[1] + inward.y, position[2] + inward.z);
  scene.add(ring);
}

function addChamberSpeakers(scene: THREE.Scene) {
  const halfW = chamber.width / 2;
  const halfH = chamber.height / 2;
  const halfD = chamber.depth / 2;
  const columns = 8;
  const rows = 5;
  const depthColumns = 6;
  const frontCutoff = halfD - 2;

  for (let column = 0; column < columns; column += 1) {
    for (let row = 0; row < rows; row += 1) {
      const x = -halfW + (halfW * 2 * (column + 0.5)) / columns;
      const y = -halfH + (halfH * 2 * (row + 0.5)) / rows;
      addSpeakerRingInward(scene, [x, y, -halfD], new THREE.Vector3(0, 0, 1), 0.22);
    }
  }

  for (let column = 0; column < depthColumns; column += 1) {
    for (let row = 0; row < rows; row += 1) {
      const z = -halfD + (halfD * 2 * (column + 0.5)) / depthColumns;
      if (z > frontCutoff) continue;
      const y = -halfH + (halfH * 2 * (row + 0.5)) / rows;
      addSpeakerRingInward(scene, [-halfW, y, z], new THREE.Vector3(1, 0, 0), 0.15);
      addSpeakerRingInward(scene, [halfW, y, z], new THREE.Vector3(-1, 0, 0), 0.15);
    }
  }

  for (let column = 0; column < columns; column += 1) {
    for (let depth = 0; depth < depthColumns; depth += 1) {
      const x = -halfW + (halfW * 2 * (column + 0.5)) / columns;
      const z = -halfD + (halfD * 2 * (depth + 0.5)) / depthColumns;
      if (z > frontCutoff) continue;
      addSpeakerRingInward(scene, [x, halfH, z], new THREE.Vector3(0, -1, 0), 0.12);
      addSpeakerRingInward(scene, [x, -halfH, z], new THREE.Vector3(0, 1, 0), 0.12);
    }
  }
}

function buildResting(group: THREE.Object3D) {
  addPhaseSheets(group, "all", 0.075);
  addCentralPhaseRings(group, 0.16);
  makeSphereNode(group, "artificial", visualScale.sphereMain, 1);
  makeFloorText(group, "a word and its semantic space", 0, -3, 0.25);
  makeFloorText(group, "1400s - present", 0, -5, 0.18);
  makeCeilingText(group, "word family  /  technical  /  sense boundary", 0, -2, 0.16);
}

function buildWordFamily(group: THREE.Object3D) {
  highlightWall(group, "left", 0.08);
  addPhaseSheets(group, "left", 0.16);
  addCentralPhaseRings(group, 0.10);
  makeSphereNode(group, "art", visualScale.sphereA, 1);
  makeSphereNode(group, "artifice", visualScale.sphereA, 1);
  makeSphereNode(group, "artificial", visualScale.sphereMain, 1);
  makeSphereNode(group, "artificer", visualScale.sphereB, 0.82);
  makeSphereNode(group, "artificially", visualScale.sphereB, 0.78);

  makeDirectedArrow(group, "art", "artifice", visualScale.shaftMain, visualScale.coneLen, visualScale.coneRadius, 1);
  makeDirectedArrow(group, "artifice", "artificial", visualScale.shaftMain, visualScale.coneLen, visualScale.coneRadius, 1);
  makeDirectedArrow(group, "art", "artificer", visualScale.shaftSub, visualScale.coneSubLen, visualScale.coneSubRadius, 0.72);
  makeDirectedArrow(group, "artificial", "artificially", visualScale.shaftSub, visualScale.coneSubLen, visualScale.coneSubRadius, 0.65);
}

function buildTechnical(group: THREE.Object3D) {
  highlightWall(group, "right", 0.08);
  addPhaseSheets(group, "right", 0.16);
  addCentralPhaseRings(group, 0.10);
  makeSphereNode(group, "made_by_art_skill", visualScale.sphereB, 0.5);
  makeSphereNode(group, "artificial", visualScale.sphereMain, 1);
  makeSphereNode(group, "artificial_arguments", visualScale.sphereA, 1);
  makeSphereNode(group, "artificial_numbers", visualScale.sphereA, 1);
  makeSphereNode(group, "artificial_memory", visualScale.sphereB, 0.88);
  makeSphereNode(group, "artificial_day", visualScale.sphereC, 0.42);

  makeDirectedArrow(group, "made_by_art_skill", "artificial", visualScale.shaftSub, visualScale.coneSubLen, visualScale.coneSubRadius, 0.45);
  makeDirectedArrow(group, "artificial", "artificial_arguments", visualScale.shaftMain, visualScale.coneLen, visualScale.coneRadius, 1);
  makeDirectedArrow(group, "artificial", "artificial_numbers", visualScale.shaftMain, visualScale.coneLen, visualScale.coneRadius, 1);
  makeDirectedArrow(group, "artificial", "artificial_memory", visualScale.shaftSub, visualScale.coneSubLen, visualScale.coneSubRadius, 0.82);
  makeDirectedArrow(group, "artificial", "artificial_day", visualScale.shaftAnnot, visualScale.coneSubLen, visualScale.coneSubRadius, 0.32);
}

function buildSenseBoundary(group: THREE.Object3D) {
  highlightWall(group, "back", 0.08);
  addPhaseSheets(group, "back", 0.16);
  addCentralPhaseRings(group, 0.10);
  makeSphereNode(group, "made_by_art_skill", visualScale.sphereA, 1);
  makeSphereNode(group, "contrivance_construction", visualScale.sphereA, 1);
  makeSphereNode(group, "not_natural", visualScale.sphereB, 0.85);
  makeSphereNode(group, "fake_not_genuine", visualScale.sphereB, 0.62);
  makeSphereNode(group, "imitation_substitute", visualScale.sphereC, 0.5);
  makeSphereNode(group, "affected_insincere", visualScale.sphereC, 0.38);
  makeSphereNode(group, "artificial", visualScale.sphereMain, 0.45);

  makeDirectedArrow(group, "artificial", "made_by_art_skill", visualScale.shaftSub, visualScale.coneSubLen, visualScale.coneSubRadius, 0.42);
  makeDirectedArrow(group, "made_by_art_skill", "contrivance_construction", visualScale.shaftMain, visualScale.coneLen, visualScale.coneRadius, 1);
  makeDirectedArrow(group, "contrivance_construction", "not_natural", visualScale.shaftMain, visualScale.coneLen, visualScale.coneRadius, 1);
  makeDriftArc(group, "not_natural", "fake_not_genuine", 1.2, 0.64);
  makeDirectedArrow(group, "not_natural", "imitation_substitute", visualScale.shaftSub, visualScale.coneSubLen, visualScale.coneSubRadius, 0.42);
  makeDirectedArrow(group, "contrivance_construction", "affected_insincere", visualScale.shaftAnnot, visualScale.coneSubLen, visualScale.coneSubRadius, 0.28);
}

function buildFullOverlay(group: THREE.Object3D) {
  addPhaseSheets(group, "all", 0.11);
  addCentralPhaseRings(group, 0.18);
  makeSphereNode(group, "made_by_art_skill", visualScale.sphereB, 0.38, null, layerColors.senseBoundary);
  makeSphereNode(group, "contrivance_construction", visualScale.sphereB, 0.35, null, layerColors.senseBoundary);
  makeSphereNode(group, "not_natural", visualScale.sphereB, 0.35, null, layerColors.senseBoundary);
  makeSphereNode(group, "fake_not_genuine", visualScale.sphereC, 0.25, null, layerColors.senseBoundary);
  makeCylinder(
    group,
    vector(chamberNodePositions.made_by_art_skill),
    vector(chamberNodePositions.contrivance_construction),
    0.008,
    0.3,
    layerColors.senseBoundary,
  );
  makeCylinder(
    group,
    vector(chamberNodePositions.contrivance_construction),
    vector(chamberNodePositions.not_natural),
    0.008,
    0.3,
    layerColors.senseBoundary,
  );
  makeDriftArc(group, "not_natural", "fake_not_genuine", 0.8, 0.2);

  makeSphereNode(group, "artificial_arguments", visualScale.sphereB, 0.65, null, layerColors.technical);
  makeSphereNode(group, "artificial_numbers", visualScale.sphereB, 0.6, null, layerColors.technical);
  makeSphereNode(group, "artificial_memory", visualScale.sphereC, 0.52, null, layerColors.technical);
  makeDirectedArrow(group, "artificial", "artificial_arguments", 0.011, 0.14, 0.05, 0.6, layerColors.technical);
  makeDirectedArrow(group, "artificial", "artificial_numbers", 0.011, 0.14, 0.05, 0.55, layerColors.technical);
  makeDirectedArrow(group, "artificial", "artificial_memory", 0.008, 0.12, 0.04, 0.45, layerColors.technical);

  makeSphereNode(group, "art", visualScale.sphereA, 1, null, layerColors.wordFamily);
  makeSphereNode(group, "artifice", visualScale.sphereA, 1, null, layerColors.wordFamily);
  makeSphereNode(group, "artificial", visualScale.sphereMain, 1, null, layerColors.wordFamily);
  makeSphereNode(group, "artificer", visualScale.sphereB, 0.72, null, layerColors.wordFamily);
  makeSphereNode(group, "artificially", visualScale.sphereB, 0.68, null, layerColors.wordFamily);
  makeDirectedArrow(group, "art", "artifice", visualScale.shaftMain, visualScale.coneLen, visualScale.coneRadius, 1, layerColors.wordFamily);
  makeDirectedArrow(group, "artifice", "artificial", visualScale.shaftMain, visualScale.coneLen, visualScale.coneRadius, 1, layerColors.wordFamily);
  makeDirectedArrow(group, "art", "artificer", visualScale.shaftSub, visualScale.coneSubLen, visualScale.coneSubRadius, 0.65, layerColors.wordFamily);
  makeDirectedArrow(group, "artificial", "artificially", visualScale.shaftSub, visualScale.coneSubLen, visualScale.coneSubRadius, 0.6, layerColors.wordFamily);
}

function addLeitnerChamber(scene: THREE.Scene) {
  addOpenChamberWireframe(scene);
  addChamberSpeakers(scene);
}

function projectPoint(
  point: Vec3,
  camera: THREE.Camera,
  width: number,
  height: number,
): LabelPosition {
  const projected = vector(point).project(camera);
  return {
    x: (projected.x * 0.5 + 0.5) * width,
    y: (-projected.y * 0.5 + 0.5) * height,
    visible: projected.z > -1 && projected.z < 1,
  };
}

export function ArtificialChart01SemanticChamber() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const semanticGroupRef = useRef<THREE.Group | null>(null);
  const rafRef = useRef<number>(0);
  const mouseRef = useRef({ targetX: 0, targetY: 0, active: false });
  const activeArrowLabelsRef = useRef<ArrowLabel[]>([]);
  const measureRef = useRef<() => void>(() => {});
  const [activeState, setActiveState] = useState<ChamberState>("resting");
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [labelPositions, setLabelPositions] = useState<Record<string, LabelPosition>>({});
  const [webglFailed, setWebglFailed] = useState(false);

  const activeArrowLabels = useMemo(() => labelsForArrows(arrowsForState(activeState)), [activeState]);
  const connectedNodeIds = useMemo(() => {
    if (!hoveredNodeId) return [];
    return Array.from(
      new Set(
        chamberEdges
          .filter((edge) => edge.source === hoveredNodeId || edge.target === hoveredNodeId)
          .map((edge) => (edge.source === hoveredNodeId ? edge.target : edge.source)),
      ),
    );
  }, [hoveredNodeId]);

  const measure = useCallback(() => {
    const wrap = wrapRef.current;
    const camera = cameraRef.current;
    if (!wrap || !camera) return;
    const rect = wrap.getBoundingClientRect();
    const positions: Record<string, LabelPosition> = {};
    chamberNodes.forEach((node) => {
      const point = chamberNodePositions[node.id];
      if (point) positions[node.id] = projectPoint(point, camera, rect.width, rect.height);
    });
    chamberPlaneLabels.forEach((label) => {
      positions[label.id] = projectPoint(label.position, camera, rect.width, rect.height);
    });
    activeArrowLabelsRef.current.forEach((label) => {
      positions[label.id] = projectPoint(label.position, camera, rect.width, rect.height);
    });
    setLabelPositions(positions);
  }, []);

  useEffect(() => {
    measureRef.current = measure;
  }, [measure]);

  useEffect(() => {
    activeArrowLabelsRef.current = activeArrowLabels;
    measure();
  }, [activeArrowLabels, measure]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: false,
      });
    } catch {
      setWebglFailed(true);
      return;
    }

    setWebglFailed(false);
    renderer.setClearColor(0xf5ecd2, 1);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xf5ecd2, 8, 32);
    const rect = wrap.getBoundingClientRect();
    const aspect = rect.width / Math.max(rect.height, 1);
    const camera = new THREE.PerspectiveCamera(65, aspect, 0.1, 200);
    camera.position.copy(cameraPosition);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;
    rendererRef.current = renderer;
    sceneRef.current = scene;

    try {
      renderer.setSize(rect.width, rect.height, false);
    } catch {
      setWebglFailed(true);
      renderer.dispose();
      return;
    }

    addLeitnerChamber(scene);
    addPhaseSweep(scene);
    addLighting(scene);

    let lastMeasureTime = 0;
    const tick = () => {
      rafRef.current = requestAnimationFrame(tick);
      const { targetX, targetY } = mouseRef.current;
      camera.position.x += (targetX - camera.position.x) * 0.16;
      camera.position.y += (targetY - camera.position.y) * 0.16;
      camera.position.z += (cameraPosition.z - camera.position.z) * 0.16;
      camera.lookAt(0, 0, 0);
      const time = performance.now() * 0.001;
      const halfH = chamber.height / 2;
      scene.traverse((object) => {
        const spin = object.userData.phaseSpin as number | undefined;
        if (spin) object.rotation.z += spin;
        if (object.userData.phaseSweep) {
          object.position.y = -halfH + 0.55 + ((time * 0.22) % 1) * (chamber.height - 1.1);
          const material = (object as THREE.Mesh).material as THREE.MeshBasicMaterial | undefined;
          if (material) material.opacity = 0.08 + Math.sin(time * 1.7) * 0.035 + 0.07;
        }
      });
      renderer.render(scene, camera);

      const now = performance.now();
      if (now - lastMeasureTime > 33) {
        measureRef.current();
        lastMeasureTime = now;
      }
    };
    tick();

    const resizeObserver = new ResizeObserver(() => {
      const nextRect = wrap.getBoundingClientRect();
      camera.aspect = nextRect.width / Math.max(nextRect.height, 1);
      camera.updateProjectionMatrix();
      renderer.setSize(nextRect.width, nextRect.height, false);
      measureRef.current();
    });
    resizeObserver.observe(wrap);

    const maxX = 1.4;
    const maxY = 0.8;
    const onMouseMove = (event: MouseEvent) => {
      const nextRect = wrap.getBoundingClientRect();
      mouseRef.current.targetX = ((event.clientX - nextRect.left) / nextRect.width - 0.5) * maxX * 2;
      mouseRef.current.targetY = -((event.clientY - nextRect.top) / nextRect.height - 0.5) * maxY * 2;
      mouseRef.current.active = true;
    };

    const onMouseLeave = () => {
      mouseRef.current.targetX = 0;
      mouseRef.current.targetY = 0;
      mouseRef.current.active = false;
    };

    wrap.addEventListener("mousemove", onMouseMove, { passive: true });
    wrap.addEventListener("mouseleave", onMouseLeave);

    return () => {
      cancelAnimationFrame(rafRef.current);
      resizeObserver.disconnect();
      wrap.removeEventListener("mousemove", onMouseMove);
      wrap.removeEventListener("mouseleave", onMouseLeave);
      if (rendererRef.current === renderer) rendererRef.current = null;
      if (sceneRef.current === scene) sceneRef.current = null;
      semanticGroupRef.current = null;
      disposeObject3D(scene);
      renderer.dispose();
    };
  }, [measure]);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    if (semanticGroupRef.current) {
      scene.remove(semanticGroupRef.current);
      disposeObject3D(semanticGroupRef.current);
    }

    const group = new THREE.Group();
    group.name = "semantic";

    switch (activeState) {
      case "word_family":
        buildWordFamily(group);
        break;
      case "technical":
        buildTechnical(group);
        break;
      case "sense_boundary":
        buildSenseBoundary(group);
        break;
      case "full_overlay":
        buildFullOverlay(group);
        break;
      case "resting":
      default:
        buildResting(group);
        break;
    }

    scene.add(group);
    semanticGroupRef.current = group;
    measure();
  }, [activeState, measure]);

  const visibleLabelIds = useMemo(() => new Set(stateVisibleLabels[activeState]), [activeState]);
  const visibleLabels = chamberNodes.filter((node) => visibleLabelIds.has(node.id));

  return (
    <section className="border-y border-ink bg-wheat">
      <div className="border-b border-ink px-6 py-4">
        <p className="font-mono text-[0.72rem] font-black uppercase tracking-[0.16em] text-ink/45">
          Chart 01
        </p>
        <h2 className="mt-1 text-2xl font-black leading-none">
          Semantic chamber
        </h2>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "minmax(0,1fr) 180px" }}>
        <div
          ref={wrapRef}
          className="relative overflow-hidden bg-[#f5ecd2]"
          style={{ height: "clamp(740px, 72vw, 960px)" }}
        >
          {webglFailed ? (
            <div className="absolute inset-0 grid place-items-center p-6 text-center font-mono text-sm font-black uppercase tracking-[0.12em] text-ink/55">
              WebGL is unavailable. The semantic chamber needs canvas support.
            </div>
          ) : null}
          <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

          {chamberPlaneLabels.map((plane) => {
            const position = labelPositions[plane.id];
            if (!position?.visible) return null;
            return (
              <span
                key={plane.id}
                className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 font-mono text-[0.66rem] font-black uppercase tracking-[0.18em] text-ink/34"
                style={{ left: position.x, top: position.y }}
              >
                {plane.label}
              </span>
            );
          })}

          {visibleLabels.map((node) => {
            const position = labelPositions[node.id];
            if (!position?.visible) return null;
            const [offsetX, offsetY] = labelAnchors[node.id] ?? [0, -18];
            const isHovered = hoveredNodeId === node.id;
            const isConnected = connectedNodeIds.includes(node.id);
            const isDimmed = hoveredNodeId !== null && !isHovered && !isConnected;
            const tickOpacity = isDimmed ? 0.08 : isHovered ? 0.7 : 0.32;
            return (
              <Fragment key={node.id}>
                <svg
                  className="pointer-events-none absolute inset-0 overflow-visible"
                  style={{ zIndex: 8 }}
                >
                  <line
                    x1={position.x}
                    y1={position.y}
                    x2={position.x + offsetX * 0.55}
                    y2={position.y + offsetY * 0.55}
                    stroke={`rgba(5,5,16,${tickOpacity})`}
                    strokeWidth="0.6"
                  />
                </svg>
                <button
                  type="button"
                  onMouseEnter={() => setHoveredNodeId(node.id)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                  onFocus={() => setHoveredNodeId(node.id)}
                  onBlur={() => setHoveredNodeId(null)}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 border-0 bg-transparent p-0 text-left leading-none transition ${
                    isHovered ? "z-20" : "z-10"
                  }`}
                  style={{
                    left: position.x + offsetX,
                    top: position.y + offsetY,
                    fontSize: labelFontSizes[node.id] ?? "0.70rem",
                    opacity: isDimmed ? 0.15 : 1,
                    fontFamily: node.plane === "guide" ? "monospace" : "sans-serif",
                    fontWeight: node.weight >= 4 ? 800 : 600,
                    color: "rgba(5,5,16,0.90)",
                    letterSpacing: node.plane === "guide" ? "0.09em" : "0",
                    textTransform: node.plane === "guide" ? "uppercase" : "none",
                    textShadow: "0 0 6px rgba(245,236,210,0.9)",
                  }}
                  title={`${node.role} / ${node.confidence}`}
                >
                  {node.label}
                </button>
              </Fragment>
            );
          })}

          {activeArrowLabels.map((arrowLabel) => {
            const position = labelPositions[arrowLabel.id];
            if (!position?.visible) return null;
            return (
              <span
                key={arrowLabel.id}
                className="pointer-events-none absolute z-30 -translate-x-1/2 -translate-y-1/2 border border-ink bg-wheat/92 px-1.5 py-0.5 font-mono text-[0.62rem] font-black uppercase leading-none tracking-[0.12em] text-ink"
                style={{ left: position.x, top: position.y }}
              >
                {arrowLabel.label}
              </span>
            );
          })}
        </div>

        <div className="flex flex-col border-l border-ink bg-wheat" style={{ width: 180 }}>
          {stateOrder.map((state) => (
            <button
              key={state}
              type="button"
              onClick={() => setActiveState(state)}
              className={`border-b border-ink/20 px-3 py-3 text-left font-mono text-[0.72rem] font-black uppercase tracking-[0.10em] transition ${
                activeState === state
                  ? "bg-ink text-wheat"
                  : "bg-wheat text-ink/55 hover:bg-ink/6 hover:text-ink"
              }`}
            >
              {chamberStateLabels[state]}
            </button>
          ))}

          <div className="border-b border-ink/20 px-3 py-3">
            <p className="font-mono text-[0.72rem] uppercase leading-5 tracking-[0.08em] text-ink/62">
              {stateDescriptions[activeState]}
            </p>
          </div>

          {hoveredNodeId ? (() => {
            const node = nodesById.get(hoveredNodeId);
            if (!node) return null;
            return (
              <div className="bg-wheat px-3 py-3">
                <p className="font-sans text-[0.98rem] font-black leading-tight text-ink">
                  {node.label}
                </p>
                <p className="mt-1 font-mono text-[0.72rem] font-black uppercase tracking-[0.09em] text-ink/62">
                  {planeDisplay[node.plane] ?? node.plane.replace(/_/g, " ")}
                </p>

                <div className="mt-2 border-t border-ink/15 pt-2">
                  <p className="mb-0.5 font-mono text-[0.67rem] uppercase tracking-[0.08em] text-ink/55">
                    role
                  </p>
                  <p className="font-sans text-[0.86rem] leading-snug text-ink/90">
                    {node.role}
                  </p>
                  {roleNotes[node.role] ? (
                    <p className="mt-1 font-mono text-[0.65rem] leading-snug text-ink/65">
                      {roleNotes[node.role]}
                    </p>
                  ) : null}
                </div>

                <div className="mt-2 border-t border-ink/15 pt-2">
                  <p className="font-mono text-[0.67rem] uppercase tracking-[0.08em] text-ink/60">
                    {node.confidence} confidence
                  </p>
                </div>

                {connectedNodeIds.length > 0 ? (
                  <div className="mt-2 border-t border-ink/15 pt-2">
                    <p className="mb-1 font-mono text-[0.67rem] uppercase tracking-[0.08em] text-ink/55">
                      connected
                    </p>
                    {connectedNodeIds.slice(0, 4).map((connectedId) => {
                      const connectedNode = nodesById.get(connectedId);
                      const edge = chamberEdges.find(
                        (item) =>
                          (item.source === hoveredNodeId && item.target === connectedId) ||
                          (item.target === hoveredNodeId && item.source === connectedId),
                      );
                      if (!connectedNode) return null;
                      return (
                        <div key={connectedId} className="mb-1">
                          <span className="font-sans text-[0.82rem] leading-tight text-ink/90">
                            {connectedNode.label}
                          </span>
                          {edge ? (
                            <span className="ml-1 font-mono text-[0.60rem] uppercase tracking-[0.06em] text-ink/55">
                              {edge.type.replace(/_/g, " ")}
                            </span>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          })() : (
            <div className="px-3 py-3">
              <p className="font-mono text-[0.70rem] uppercase tracking-[0.08em] text-ink/45">
                hover a node to inspect
              </p>
            </div>
          )}

          {/* ── Quality-pressure polarity strip ─────────────────── */}
          <div className="mt-auto border-t border-ink/20 px-3 py-3">
            <p className="mb-1.5 font-mono text-[0.62rem] font-black uppercase tracking-[0.09em] text-ink/45">
              quality pressure
            </p>
            {/* N – S axis with "artificial" dot */}
            <div className="flex items-center gap-1">
              <span className="font-mono text-[0.58rem] font-black leading-none text-ink/40">N</span>
              <div className="relative flex-1">
                <div className="h-px w-full bg-ink/22" />
                <span
                  className="absolute top-1/2 -translate-y-1/2 rounded-full bg-ink"
                  style={{ left: "62%", width: 7, height: 7, marginLeft: -3.5 }}
                />
              </div>
              <span className="font-mono text-[0.58rem] font-black leading-none text-ink/40">S</span>
            </div>
            <div className="mt-0.5 flex justify-between font-mono text-[0.54rem] uppercase tracking-[0.05em] text-ink/35">
              <span>natural</span>
              <span>copy</span>
            </div>
            {/* Field-pressure words */}
            <div className="mt-2 space-y-0.5 border-t border-ink/12 pt-1.5">
              {["lifelike", "true to life", "high fidelity"].map((w) => (
                <p key={w} className="font-mono text-[0.60rem] leading-[1.45] tracking-[0.06em] text-ink/48">
                  — {w}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
