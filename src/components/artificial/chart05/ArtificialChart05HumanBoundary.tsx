"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

const INK = "#050510";
const WHEAT = "#F5ECD2";
const SUPPORT = "#1570AC";
const REPLACE = "#B15825";
const CONTINUE = "#8F2D56";
const PROCESS = "#036C17";
const SPECULATIVE = "#FBB728";
const MUTED = "#746B5A";
const NODE_VISUAL_SCALE = 0.6;

type LayerKey = "apparatus" | "support" | "replacement" | "continuation" | "process";
type ShapeKind = "capsule" | "circle" | "oval" | "hexagon" | "rect" | "star";
type LinkStrength = "strong" | "medium" | "weak" | "speculative";

type HumanNode = {
  id: string;
  label: string;
  shortLabel: string;
  layer: LayerKey;
  shape: ShapeKind;
  color: string;
  position: [number, number, number];
  size: number;
  status: "core" | "bridge" | "background" | "edge";
  functionMode: "apparatus" | "support" | "replacement" | "continuation" | "simulation" | "speculative";
  evidence: string;
  summary: string;
};

type HumanLink = {
  id: string;
  from: string;
  to: string;
  strength: LinkStrength;
  color: string;
  summary: string;
};

type LayerSpec = {
  key: LayerKey;
  index: number;
  title: string;
  subtitle: string;
  color: string;
  y: number;
  width: number;
  depth: number;
  xOffset: number;
  zOffset: number;
};

const layers: LayerSpec[] = [
  {
    key: "apparatus",
    index: 1,
    title: "External apparatus",
    subtitle: "outside the body",
    color: MUTED,
    y: 0,
    width: 5.7,
    depth: 3.15,
    xOffset: -0.22,
    zOffset: 0.1,
  },
  {
    key: "support",
    index: 2,
    title: "Body support",
    subtitle: "keeps life going",
    color: SUPPORT,
    y: 0.9,
    width: 5.35,
    depth: 3,
    xOffset: 0.2,
    zOffset: -0.02,
  },
  {
    key: "replacement",
    index: 3,
    title: "Body replacement",
    subtitle: "restores function",
    color: REPLACE,
    y: 1.8,
    width: 5.15,
    depth: 2.9,
    xOffset: -0.08,
    zOffset: 0.08,
  },
  {
    key: "continuation",
    index: 4,
    title: "Life continuation",
    subtitle: "reproduction / gestation",
    color: CONTINUE,
    y: 2.7,
    width: 4.82,
    depth: 2.72,
    xOffset: 0.12,
    zOffset: -0.04,
  },
  {
    key: "process",
    index: 5,
    title: "Human process",
    subtitle: "language / voice / cognition",
    color: PROCESS,
    y: 3.6,
    width: 4.55,
    depth: 2.5,
    xOffset: -0.14,
    zOffset: 0.04,
  },
];

const nodes: HumanNode[] = [
  {
    id: "apparatus",
    label: "artificial apparatus",
    shortLabel: "apparatus",
    layer: "apparatus",
    shape: "capsule",
    color: MUTED,
    position: [-1.58, 0, -0.66],
    size: 0.13,
    status: "background",
    functionMode: "apparatus",
    evidence: "Layer 1 background terms",
    summary: "External device/support language marks artificial before it enters the body itself.",
  },
  {
    id: "mechanical-respirator",
    label: "mechanical respirator",
    shortLabel: "respirator",
    layer: "apparatus",
    shape: "capsule",
    color: MUTED,
    position: [0.18, 0, -0.98],
    size: 0.14,
    status: "bridge",
    functionMode: "apparatus",
    evidence: "Drinker-Shaw artificial respiration apparatus; iron lung history",
    summary: "Apparatus and respirator evidence forms the base bridge from external machines into body support.",
  },
  {
    id: "iron-lung",
    label: "iron lung",
    shortLabel: "iron lung",
    layer: "apparatus",
    shape: "capsule",
    color: MUTED,
    position: [1.52, 0, -0.25],
    size: 0.13,
    status: "background",
    functionMode: "apparatus",
    evidence: "Britannica iron lung",
    summary: "Mechanical support around breathing keeps Layer 1 present but visually quiet.",
  },
  {
    id: "artificial-respiration",
    label: "artificial respiration",
    shortLabel: "respiration",
    layer: "support",
    shape: "circle",
    color: SUPPORT,
    position: [-1.52, 1.16, -0.72],
    size: 0.18,
    status: "core",
    functionMode: "support",
    evidence: "NCBI MeSH Respiration, Artificial",
    summary: "A core support term: artificial sustains breathing rather than replacing a body part.",
  },
  {
    id: "mechanical-ventilation",
    label: "mechanical ventilation",
    shortLabel: "ventilation",
    layer: "support",
    shape: "circle",
    color: SUPPORT,
    position: [-0.36, 1.16, -0.38],
    size: 0.16,
    status: "core",
    functionMode: "support",
    evidence: "MeSH entry term under artificial respiration",
    summary: "Modern support technology; a hard bridge from early artificial respiration to clinical life support.",
  },
  {
    id: "artificial-feeding",
    label: "artificial feeding",
    shortLabel: "feeding",
    layer: "support",
    shape: "circle",
    color: SUPPORT,
    position: [0.72, 1.16, 0.3],
    size: 0.15,
    status: "core",
    functionMode: "support",
    evidence: "NCBI MeSH Nutritional Support",
    summary: "Artificial sustains bodily intake through feeding/nutritional support.",
  },
  {
    id: "life-support",
    label: "life support",
    shortLabel: "life support",
    layer: "support",
    shape: "circle",
    color: SUPPORT,
    position: [1.62, 1.16, -0.58],
    size: 0.18,
    status: "core",
    functionMode: "support",
    evidence: "NCBI MeSH Life Support Care; Cleveland Clinic measures",
    summary: "The strongest support node: artificial keeps life going through component technologies.",
  },
  {
    id: "artificial-limb",
    label: "artificial limb",
    shortLabel: "limb",
    layer: "replacement",
    shape: "oval",
    color: REPLACE,
    position: [-1.72, 2.34, -0.46],
    size: 0.17,
    status: "core",
    functionMode: "replacement",
    evidence: "NCBI MeSH Artificial Limbs; MedlinePlus",
    summary: "Replacement starts with restored or substituted bodily function.",
  },
  {
    id: "prosthesis",
    label: "prosthesis",
    shortLabel: "prosthesis",
    layer: "replacement",
    shape: "oval",
    color: REPLACE,
    position: [-0.86, 2.34, 0.62],
    size: 0.15,
    status: "bridge",
    functionMode: "replacement",
    evidence: "Artificial limbs defined as prosthetic replacements",
    summary: "A relation bridge inside the replacement layer.",
  },
  {
    id: "artificial-heart",
    label: "artificial heart",
    shortLabel: "heart",
    layer: "replacement",
    shape: "oval",
    color: REPLACE,
    position: [0.36, 2.34, -0.76],
    size: 0.18,
    status: "core",
    functionMode: "replacement",
    evidence: "NCBI MeSH Heart, Artificial",
    summary: "Organ replacement: artificial duplicates and replaces heart function.",
  },
  {
    id: "artificial-kidney",
    label: "artificial kidney",
    shortLabel: "kidney",
    layer: "replacement",
    shape: "oval",
    color: REPLACE,
    position: [1.28, 2.34, 0.34],
    size: 0.16,
    status: "core",
    functionMode: "replacement",
    evidence: "NCBI MeSH Renal Dialysis / Kidney, Artificial indexing",
    summary: "Replacement/therapy context for failed organ function.",
  },
  {
    id: "artificial-organ",
    label: "artificial organ",
    shortLabel: "organ",
    layer: "replacement",
    shape: "oval",
    color: REPLACE,
    position: [1.82, 2.34, -0.72],
    size: 0.15,
    status: "core",
    functionMode: "replacement",
    evidence: "NLM Catalog: Artificial Organs",
    summary: "Field-level consolidation around organ replacement and support.",
  },
  {
    id: "artificial-insemination",
    label: "artificial insemination",
    shortLabel: "insemination",
    layer: "continuation",
    shape: "hexagon",
    color: CONTINUE,
    position: [-1.46, 3.52, -0.24],
    size: 0.17,
    status: "core",
    functionMode: "continuation",
    evidence: "NCBI MeSH Insemination, Artificial",
    summary: "Artificial intervenes in reproduction rather than only sustaining or replacing function.",
  },
  {
    id: "ivf",
    label: "in vitro fertilization",
    shortLabel: "IVF",
    layer: "continuation",
    shape: "hexagon",
    color: CONTINUE,
    position: [-0.22, 3.52, 0.54],
    size: 0.19,
    status: "core",
    functionMode: "continuation",
    evidence: "NCBI MeSH Fertilization in Vitro",
    summary: "The hard continuation node; test-tube baby sits as public-language variant.",
  },
  {
    id: "test-tube-baby",
    label: "test-tube baby",
    shortLabel: "test-tube",
    layer: "continuation",
    shape: "hexagon",
    color: CONTINUE,
    position: [0.76, 3.52, -0.48],
    size: 0.13,
    status: "bridge",
    functionMode: "continuation",
    evidence: "MeSH IVF entry terms; Britannica Louise Brown",
    summary: "A public-history marker for IVF, smaller than the technical process.",
  },
  {
    id: "artificial-womb",
    label: "artificial womb",
    shortLabel: "womb",
    layer: "continuation",
    shape: "hexagon",
    color: CONTINUE,
    position: [1.46, 3.52, 0.3],
    size: 0.15,
    status: "edge",
    functionMode: "continuation",
    evidence: "Nature Communications; PubMed systematic review",
    summary: "A continuation edge: preclinical fetal-support technology, not completed human gestation replacement.",
  },
  {
    id: "artificial-language",
    label: "artificial language",
    shortLabel: "language",
    layer: "process",
    shape: "rect",
    color: PROCESS,
    position: [-1.54, 4.7, -0.5],
    size: 0.16,
    status: "core",
    functionMode: "simulation",
    evidence: "Britannica Esperanto; Merriam-Webster artificial language",
    summary: "A non-AI process anchor: artificial enters symbolic human process before modern AI.",
  },
  {
    id: "artificial-life",
    label: "artificial life",
    shortLabel: "artificial life",
    layer: "process",
    shape: "rect",
    color: PROCESS,
    position: [-0.42, 4.7, 0.64],
    size: 0.17,
    status: "bridge",
    functionMode: "simulation",
    evidence: "Langton ALife; SEP Life; MIT Press Artificial Life",
    summary: "A split bridge: biological background, computational ALife, and philosophical boundary must stay separate.",
  },
  {
    id: "artificial-voice",
    label: "artificial voice",
    shortLabel: "voice",
    layer: "process",
    shape: "rect",
    color: PROCESS,
    position: [0.66, 4.7, -0.44],
    size: 0.15,
    status: "core",
    functionMode: "simulation",
    evidence: "FCC artificial / AI voice ruling",
    summary: "Artificial reaches human presence through voice and voice-cloning policy language.",
  },
  {
    id: "artificial-intelligence",
    label: "artificial intelligence",
    shortLabel: "AI",
    layer: "process",
    shape: "rect",
    color: PROCESS,
    position: [1.44, 4.7, 0.52],
    size: 0.16,
    status: "core",
    functionMode: "simulation",
    evidence: "Britannica Artificial Intelligence",
    summary: "A top-layer cognition node; it belongs to the final human-process layer rather than replacing the whole stack.",
  },
  {
    id: "neural-network",
    label: "artificial neural network",
    shortLabel: "neural net",
    layer: "process",
    shape: "rect",
    color: PROCESS,
    position: [1.94, 4.7, -0.34],
    size: 0.14,
    status: "core",
    functionMode: "simulation",
    evidence: "Britannica neural network",
    summary: "Cognitive/process modeling, visually downstream from artificial life and AI.",
  },
  {
    id: "consciousness",
    label: "artificial consciousness",
    shortLabel: "consciousness",
    layer: "process",
    shape: "star",
    color: SPECULATIVE,
    position: [2.22, 4.7, 0.92],
    size: 0.12,
    status: "edge",
    functionMode: "speculative",
    evidence: "PubMed artificial consciousness; speculative boundary",
    summary: "Speculative edge only; not an established core for this chart.",
  },
  {
    id: "companion",
    label: "artificial companion",
    shortLabel: "companion",
    layer: "process",
    shape: "star",
    color: SPECULATIVE,
    position: [2.54, 4.7, -0.84],
    size: 0.11,
    status: "edge",
    functionMode: "speculative",
    evidence: "Artificial companions review; AI companion context",
    summary: "Modern presence edge; useful but visually downgraded.",
  },
];

const links: HumanLink[] = [
  {
    id: "apparatus-respiration",
    from: "mechanical-respirator",
    to: "artificial-respiration",
    strength: "strong",
    color: SUPPORT,
    summary: "External apparatus enters the body boundary through artificial respiration.",
  },
  {
    id: "iron-respiration",
    from: "iron-lung",
    to: "artificial-respiration",
    strength: "medium",
    color: SUPPORT,
    summary: "Respiratory apparatus supports the body without replacing an organ.",
  },
  {
    id: "resp-vent",
    from: "artificial-respiration",
    to: "mechanical-ventilation",
    strength: "strong",
    color: SUPPORT,
    summary: "MeSH links artificial respiration and mechanical ventilation.",
  },
  {
    id: "feeding-life",
    from: "artificial-feeding",
    to: "life-support",
    strength: "strong",
    color: SUPPORT,
    summary: "Artificial feeding/nutrition contributes to life-support logic.",
  },
  {
    id: "vent-life",
    from: "mechanical-ventilation",
    to: "life-support",
    strength: "strong",
    color: SUPPORT,
    summary: "Mechanical ventilation is a core life-support measure.",
  },
  {
    id: "life-heart",
    from: "life-support",
    to: "artificial-heart",
    strength: "medium",
    color: REPLACE,
    summary: "Support transitions toward replacement when artificial mechanisms duplicate organ function.",
  },
  {
    id: "life-kidney",
    from: "life-support",
    to: "artificial-kidney",
    strength: "medium",
    color: REPLACE,
    summary: "Support/replacement overlap around failed organ function.",
  },
  {
    id: "limb-prosthesis",
    from: "artificial-limb",
    to: "prosthesis",
    strength: "strong",
    color: REPLACE,
    summary: "Artificial limb and prosthesis form a hard replacement pair.",
  },
  {
    id: "heart-organ",
    from: "artificial-heart",
    to: "artificial-organ",
    strength: "strong",
    color: REPLACE,
    summary: "Artificial heart anchors the broader artificial organ layer.",
  },
  {
    id: "organ-womb",
    from: "artificial-organ",
    to: "artificial-womb",
    strength: "weak",
    color: CONTINUE,
    summary: "A weak conceptual bridge from organ replacement to gestational continuation.",
  },
  {
    id: "insemination-ivf",
    from: "artificial-insemination",
    to: "ivf",
    strength: "medium",
    color: CONTINUE,
    summary: "Both intervene in reproduction, but through different techniques.",
  },
  {
    id: "ivf-test",
    from: "ivf",
    to: "test-tube-baby",
    strength: "strong",
    color: CONTINUE,
    summary: "Test-tube baby is a public-language marker under IVF.",
  },
  {
    id: "ivf-womb",
    from: "ivf",
    to: "artificial-womb",
    strength: "weak",
    color: CONTINUE,
    summary: "Continuation extends toward gestational support, still preclinical.",
  },
  {
    id: "womb-life",
    from: "artificial-womb",
    to: "artificial-life",
    strength: "weak",
    color: PROCESS,
    summary: "Artificial womb and artificial life should remain distinct; this is a cautious bridge only.",
  },
  {
    id: "language-ai",
    from: "artificial-language",
    to: "artificial-intelligence",
    strength: "medium",
    color: PROCESS,
    summary: "Artificial language keeps the top layer from being only AI.",
  },
  {
    id: "life-ai",
    from: "artificial-life",
    to: "artificial-intelligence",
    strength: "medium",
    color: PROCESS,
    summary: "Computational ALife bridges life-process simulation toward cognition.",
  },
  {
    id: "life-neural",
    from: "artificial-life",
    to: "neural-network",
    strength: "medium",
    color: PROCESS,
    summary: "Artificial life and neural networks share process-modeling territory.",
  },
  {
    id: "voice-companion",
    from: "artificial-voice",
    to: "companion",
    strength: "weak",
    color: SPECULATIVE,
    summary: "Voice can support companion/presence systems, but this remains edge evidence.",
  },
  {
    id: "ai-consciousness",
    from: "artificial-intelligence",
    to: "consciousness",
    strength: "speculative",
    color: SPECULATIVE,
    summary: "Artificial consciousness is philosophical/speculative and should not become central.",
  },
  {
    id: "ai-neural",
    from: "artificial-intelligence",
    to: "neural-network",
    strength: "strong",
    color: PROCESS,
    summary: "Artificial neural networks are established cognitive-process models inside AI.",
  },
];

const nodeById = new Map(nodes.map((node) => [node.id, node]));

function layerByKey(key: LayerKey) {
  return layers.find((layer) => layer.key === key) ?? layers[0];
}

function nodePosition(node: HumanNode) {
  const layer = layerByKey(node.layer);
  return new THREE.Vector3(node.position[0], layer.y + 0.045, node.position[2]);
}

function disposeMaterial(material: THREE.Material) {
  const materialWithMap = material as THREE.Material & { map?: THREE.Texture };
  materialWithMap.map?.dispose();
  material.dispose();
}

function disposeObject(object: THREE.Object3D) {
  object.traverse((child) => {
    const item = child as THREE.Object3D & {
      geometry?: THREE.BufferGeometry;
      material?: THREE.Material | THREE.Material[];
    };
    item.geometry?.dispose();
    if (Array.isArray(item.material)) item.material.forEach(disposeMaterial);
    else if (item.material) disposeMaterial(item.material);
  });
}

function dashedRectanglePoints(width: number, depth: number, y: number, xOffset: number, zOffset: number) {
  const x = width / 2;
  const z = depth / 2;
  return [
    new THREE.Vector3(-x + xOffset, y, -z + zOffset),
    new THREE.Vector3(x + xOffset, y, -z + zOffset),
    new THREE.Vector3(x + xOffset, y, z + zOffset),
    new THREE.Vector3(-x + xOffset, y, z + zOffset),
    new THREE.Vector3(-x + xOffset, y, -z + zOffset),
  ];
}

function makeLine(points: THREE.Vector3[], color = INK, opacity = 0.45, dashed = false) {
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  if (dashed) {
    const material = new THREE.LineDashedMaterial({
      color,
      transparent: true,
      opacity,
      dashSize: 0.08,
      gapSize: 0.055,
    });
    const line = new THREE.Line(geometry, material);
    line.computeLineDistances();
    return line;
  }
  return new THREE.Line(
    geometry,
    new THREE.LineBasicMaterial({ color, transparent: true, opacity }),
  );
}

function makeTubeLine(points: THREE.Vector3[], color = INK, opacity = 0.5, radius = 0.006) {
  const curve = new THREE.CatmullRomCurve3(points, false, "centripetal", 0.32);
  const geometry = new THREE.TubeGeometry(curve, Math.max(12, points.length * 16), radius, 6, false);
  return new THREE.Mesh(
    geometry,
    new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity,
      depthWrite: false,
      depthTest: false,
    }),
  );
}

function makeTextSprite(
  text: string,
  options: { size?: number; color?: string; opacity?: number; weight?: string; align?: CanvasTextAlign } = {},
) {
  const size = options.size ?? 28;
  const scale = 2;
  const renderSize = size * scale;
  const padding = 18 * scale;
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) return new THREE.Sprite();
  context.font = `${options.weight ?? "900"} ${renderSize}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
  const metrics = context.measureText(text);
  canvas.width = Math.ceil(metrics.width + padding * 2);
  canvas.height = Math.ceil(renderSize * 1.55 + padding * 2);
  context.font = `${options.weight ?? "900"} ${renderSize}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
  context.fillStyle = options.color ?? INK;
  context.textAlign = options.align ?? "left";
  context.textBaseline = "middle";
  context.fillText(text, options.align === "center" ? canvas.width / 2 : padding, canvas.height / 2);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.generateMipmaps = false;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.anisotropy = 4;
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    opacity: options.opacity ?? 0.9,
    depthTest: false,
  });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(canvas.width / scale / 170, canvas.height / scale / 170, 1);
  return sprite;
}

function makeHexagonShape() {
  const shape = new THREE.Shape();
  const radius = 1;
  for (let i = 0; i < 6; i += 1) {
    const angle = Math.PI / 6 + (i / 6) * Math.PI * 2;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  return shape;
}

function makeStarShape() {
  const shape = new THREE.Shape();
  for (let i = 0; i < 10; i += 1) {
    const radius = i % 2 === 0 ? 1 : 0.42;
    const angle = -Math.PI / 2 + (i / 10) * Math.PI * 2;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  return shape;
}

function makeCapsuleShape() {
  const shape = new THREE.Shape();
  const radius = 0.42;
  const width = 1.5;
  shape.absarc(-width / 2, 0, radius, Math.PI / 2, (Math.PI * 3) / 2, false);
  shape.absarc(width / 2, 0, radius, (Math.PI * 3) / 2, Math.PI / 2, false);
  shape.closePath();
  return shape;
}

function makeNodeMesh(node: HumanNode) {
  let geometry: THREE.BufferGeometry;
  if (node.shape === "circle") {
    geometry = new THREE.CircleGeometry(1, 42);
  } else if (node.shape === "oval") {
    geometry = new THREE.CircleGeometry(1, 48);
    geometry.scale(1.42, 0.72, 1);
  } else if (node.shape === "hexagon") {
    geometry = new THREE.ShapeGeometry(makeHexagonShape());
  } else if (node.shape === "rect") {
    geometry = new THREE.PlaneGeometry(1.65, 0.82);
  } else if (node.shape === "star") {
    geometry = new THREE.ShapeGeometry(makeStarShape());
  } else {
    geometry = new THREE.ShapeGeometry(makeCapsuleShape());
  }

  const material = new THREE.MeshBasicMaterial({
    color: node.color,
    transparent: true,
    opacity: node.status === "background" ? 0.72 : node.status === "edge" ? 0.78 : 0.92,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.scale.setScalar(node.size * NODE_VISUAL_SCALE);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.copy(nodePosition(node));
  return mesh;
}

function makeNodeOutline(node: HumanNode) {
  const radius = node.size * NODE_VISUAL_SCALE * (node.shape === "rect" ? 1.24 : 1.1);
  const group = new THREE.Group();
  group.position.copy(nodePosition(node));
  group.rotation.x = -Math.PI / 2;

  const ring =
    node.shape === "hexagon"
      ? new THREE.LineLoop(
          new THREE.BufferGeometry().setFromPoints(
            Array.from({ length: 6 }, (_, index) => {
              const angle = Math.PI / 6 + (index / 6) * Math.PI * 2;
              return new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
            }),
          ),
          new THREE.LineBasicMaterial({ color: node.color, transparent: true, opacity: 0.8 }),
        )
      : new THREE.LineLoop(
          new THREE.BufferGeometry().setFromPoints(
            Array.from({ length: 72 }, (_, index) => {
              const angle = (index / 72) * Math.PI * 2;
              return new THREE.Vector3(
                Math.cos(angle) * radius * (node.shape === "oval" ? 1.42 : node.shape === "rect" ? 1.45 : 1),
                Math.sin(angle) * radius * (node.shape === "oval" ? 0.72 : node.shape === "rect" ? 0.72 : 1),
                0,
              );
            }),
          ),
          new THREE.LineBasicMaterial({ color: node.color, transparent: true, opacity: 0.62 }),
        );
  group.add(ring);
  return group;
}

function makeCurvedLink(from: HumanNode, to: HumanNode, strength: LinkStrength, color: string) {
  const start = nodePosition(from);
  const end = nodePosition(to);
  const mid = start.clone().lerp(end, 0.5);
  const layerDistance = Math.abs(end.y - start.y);
  mid.y += 0.12 + layerDistance * 0.1;
  mid.x += Math.sin(start.x + end.z) * 0.18;
  mid.z += Math.cos(start.z - end.x) * 0.16;
  const curve = new THREE.CatmullRomCurve3([start, mid, end], false, "centripetal", 0.48);
  const opacity =
    strength === "strong" ? 0.58 : strength === "medium" ? 0.46 : strength === "weak" ? 0.3 : 0.3;
  if (strength === "weak" || strength === "speculative") {
    return makeLine(curve.getPoints(80), color, opacity, true);
  }
  return makeTubeLine(curve.getPoints(52), color, opacity, strength === "strong" ? 0.008 : 0.006);
}

function makeLayerInheritanceLink(from: HumanNode, to: HumanNode) {
  const start = nodePosition(from);
  const end = nodePosition(to);
  return makeTubeLine([start, end], INK, 0.96, 0.008);
}

function shapeLabel(shape: ShapeKind) {
  if (shape === "circle") return "body support";
  if (shape === "oval") return "body replacement";
  if (shape === "hexagon") return "life continuation";
  if (shape === "rect") return "human process";
  if (shape === "star") return "speculative edge";
  return "external apparatus";
}

function LegendShape({
  shape,
  color,
}: {
  shape: ShapeKind;
  color: string;
}) {
  const common = { backgroundColor: color };
  if (shape === "circle") return <span className="h-3.5 w-3.5 rounded-full" style={common} />;
  if (shape === "oval") return <span className="h-3 w-5 rounded-full" style={common} />;
  if (shape === "hexagon") {
    return <span className="h-3.5 w-3.5 rotate-45" style={common} />;
  }
  if (shape === "rect") return <span className="h-3 w-5" style={common} />;
  if (shape === "star") return <span className="text-base leading-none" style={{ color }}>✦</span>;
  return <span className="h-3 w-6 rounded-full" style={common} />;
}

export function ArtificialChart05HumanBoundary() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const selectedIdRef = useRef("life-support");
  const hoveredIdRef = useRef<string | null>(null);
  const sceneControlsRef = useRef<{ updateSelectedRing: () => void } | null>(null);
  const [selectedId, setSelectedId] = useState("life-support");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const selectedNode = useMemo(
    () => nodeById.get(selectedId) ?? nodeById.get("life-support") ?? nodes[0],
    [selectedId],
  );
  const activeNode = useMemo(() => {
    if (hoveredId) return nodeById.get(hoveredId) ?? selectedNode;
    return selectedNode;
  }, [hoveredId, selectedNode]);

  useEffect(() => {
    selectedIdRef.current = selectedId;
    sceneControlsRef.current?.updateSelectedRing();
  }, [selectedId]);

  useEffect(() => {
    if (!mountRef.current) return;
    const mountElement = mountRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-6, 6, 3, -3, 0.1, 80);
    camera.position.set(4.55, 5.55, 9.2);
    camera.lookAt(-0.15, 1.1, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.2));
    renderer.domElement.className = "h-full w-full cursor-ew-resize";
    mountElement.appendChild(renderer.domElement);

    const root = new THREE.Group();
    root.rotation.x = -0.06;
    root.rotation.y = -0.18;
    root.position.x = -1.52;
    root.position.y = -2.02;
    scene.add(root);
    scene.add(new THREE.AmbientLight(0xffffff, 1));

    const hitTargets: THREE.Object3D[] = [];
    const nodeByUuid = new Map<string, HumanNode>();
    const nodeMeshes = new Map<string, THREE.Object3D>();
    const nodeBaseScales = new Map<string, THREE.Vector3>();
    const billboardObjects: THREE.Object3D[] = [];
    const selectedRing = new THREE.Group();
    root.add(selectedRing);

    const updateSelectedRing = () => {
      selectedRing.clear();
      const selected = nodeById.get(selectedIdRef.current);
      if (!selected) return;
      const outline = makeNodeOutline(selected);
      outline.scale.setScalar(1.55);
      selectedRing.add(outline);
    };
    sceneControlsRef.current = { updateSelectedRing };

    for (const layer of layers) {
      const layerGroup = new THREE.Group();
      const planeGeometry = new THREE.PlaneGeometry(layer.width, layer.depth);
      const planeMaterial = new THREE.MeshBasicMaterial({
        color: layer.color,
        transparent: true,
        opacity: 0.012,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const plane = new THREE.Mesh(planeGeometry, planeMaterial);
      plane.rotation.x = -Math.PI / 2;
      plane.position.set(layer.xOffset, layer.y, layer.zOffset);
      layerGroup.add(plane);

      layerGroup.add(
        makeLine(
          dashedRectanglePoints(layer.width, layer.depth, layer.y + 0.006, layer.xOffset, layer.zOffset),
          INK,
          0.46,
          true,
        ),
      );

      for (let ix = -2; ix <= 2; ix += 1) {
        const x = layer.xOffset + (ix * layer.width) / 5;
        layerGroup.add(
          makeLine(
            [
              new THREE.Vector3(x, layer.y + 0.005, layer.zOffset - layer.depth / 2),
              new THREE.Vector3(x, layer.y + 0.005, layer.zOffset + layer.depth / 2),
            ],
            INK,
            0.08,
          ),
        );
      }
      for (let iz = -1; iz <= 1; iz += 1) {
        const z = layer.zOffset + (iz * layer.depth) / 3;
        layerGroup.add(
          makeLine(
            [
              new THREE.Vector3(layer.xOffset - layer.width / 2, layer.y + 0.005, z),
              new THREE.Vector3(layer.xOffset + layer.width / 2, layer.y + 0.005, z),
            ],
            INK,
            0.08,
          ),
        );
      }

      const labelX = layer.xOffset - layer.width / 2 - 0.72;
      const labelZ = layer.zOffset - layer.depth / 2 - 0.34;
      const title = makeTextSprite(`${layer.index} · ${layer.title}`, {
        size: 16,
        color: layer.color,
        opacity: 0.84,
        weight: "900",
      });
      title.position.set(labelX, layer.y + 0.055, labelZ);
      title.rotation.y = 0;
      layerGroup.add(title);

      const subtitle = makeTextSprite(layer.subtitle, {
        size: 10,
        color: INK,
        opacity: 0.45,
        weight: "900",
      });
      subtitle.position.set(labelX + 0.03, layer.y + 0.058, labelZ + 0.32);
      layerGroup.add(subtitle);
      root.add(layerGroup);
    }

    for (const link of links) {
      const from = nodeById.get(link.from);
      const to = nodeById.get(link.to);
      if (!from || !to) continue;
      if (from.layer === to.layer) root.add(makeCurvedLink(from, to, link.strength, link.color));
      else root.add(makeLayerInheritanceLink(from, to));
    }

    for (const node of nodes) {
      const mesh = makeNodeMesh(node);
      root.add(mesh);
      nodeMeshes.set(node.id, mesh);
      nodeBaseScales.set(node.id, mesh.scale.clone());
      billboardObjects.push(mesh);

      const outline = makeNodeOutline(node);
      outline.visible = node.status !== "background";
      root.add(outline);
      billboardObjects.push(outline);

      const hit = new THREE.Mesh(
        new THREE.SphereGeometry(Math.max(0.1, node.size * 0.9), 12, 12),
        new THREE.MeshBasicMaterial({ color: node.color, transparent: true, opacity: 0, depthWrite: false }),
      );
      hit.position.copy(nodePosition(node));
      root.add(hit);
      hitTargets.push(hit);
      nodeByUuid.set(hit.uuid, node);

      if (node.status !== "background" && node.status !== "edge") {
        const label = makeTextSprite(node.shortLabel, {
          size: 13,
          color: node.color,
          opacity: 0.78,
          weight: "900",
        });
        const position = nodePosition(node);
        label.position.set(position.x + 0.09, position.y + 0.07, position.z + 0.12);
        root.add(label);
      }
    }

    updateSelectedRing();

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const updatePointer = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };
    const hitNode = () => {
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(hitTargets, false)[0];
      return hit ? nodeByUuid.get(hit.object.uuid) ?? null : null;
    };
    const setHoveredIfChanged = (node: HumanNode | null) => {
      const nextId = node?.id ?? null;
      if (hoveredIdRef.current === nextId) return;
      hoveredIdRef.current = nextId;
      setHoveredId(nextId);
    };

    let width = 1;
    let height = 1;
    const resize = () => {
      const rect = mountElement.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      const narrow = width < 760;
      camera.position.set(narrow ? 4.9 : 4.55, narrow ? 5.35 : 5.55, narrow ? 11.1 : 9.2);
      camera.lookAt(-0.15, 1.1, 0);
      root.position.x = narrow ? -0.52 : -1.52;
      root.scale.setScalar(narrow ? 1.05 : 1.21);
      const aspect = width / height;
      const frustumHeight = narrow ? 6.8 : 5.7;
      camera.left = (-frustumHeight * aspect) / 2;
      camera.right = (frustumHeight * aspect) / 2;
      camera.top = frustumHeight / 2;
      camera.bottom = -frustumHeight / 2;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mountElement);

    let dragging = false;
    let pointerMoved = false;
    let previousX = 0;
    let previousY = 0;
    let targetRotationX = root.rotation.x;
    let targetRotationY = root.rotation.y;

    const pointerDown = (event: PointerEvent) => {
      dragging = true;
      pointerMoved = false;
      previousX = event.clientX;
      previousY = event.clientY;
      setHoveredIfChanged(null);
      renderer.domElement.setPointerCapture(event.pointerId);
      updatePointer(event);
    };

    const pointerMove = (event: PointerEvent) => {
      updatePointer(event);
      if (dragging) {
        const dx = event.clientX - previousX;
        const dy = event.clientY - previousY;
        previousX = event.clientX;
        previousY = event.clientY;
        if (Math.abs(dx) > 2 || Math.abs(dy) > 2) pointerMoved = true;
        targetRotationY += dx * 0.006;
        targetRotationX = THREE.MathUtils.clamp(targetRotationX + dy * 0.002, -0.16, 0.1);
        return;
      }
      const node = hitNode();
      setHoveredIfChanged(node);
      renderer.domElement.style.cursor = node ? "pointer" : "ew-resize";
    };

    const pointerUp = (event: PointerEvent) => {
      updatePointer(event);
      if (!pointerMoved) {
        const node = hitNode();
        if (node) {
          selectedIdRef.current = node.id;
          setSelectedId(node.id);
          updateSelectedRing();
        }
      }
      dragging = false;
      if (renderer.domElement.hasPointerCapture(event.pointerId)) {
        renderer.domElement.releasePointerCapture(event.pointerId);
      }
    };

    const pointerLeave = () => {
      dragging = false;
      setHoveredIfChanged(null);
      renderer.domElement.style.cursor = "ew-resize";
    };

    renderer.domElement.addEventListener("pointerdown", pointerDown);
    renderer.domElement.addEventListener("pointermove", pointerMove);
    renderer.domElement.addEventListener("pointerup", pointerUp);
    renderer.domElement.addEventListener("pointerleave", pointerLeave);

    let sceneVisible = true;
    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        sceneVisible = entry.isIntersecting;
      },
      { threshold: 0.05 },
    );
    visibilityObserver.observe(mountElement);

    let raf = 0;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      if (!sceneVisible) return;
      root.rotation.x += (targetRotationX - root.rotation.x) * 0.08;
      root.rotation.y += (targetRotationY - root.rotation.y) * 0.08;
      selectedRing.rotation.set(0, 0, 0);
      for (const object of billboardObjects) {
        object.lookAt(camera.position);
      }
      for (const object of selectedRing.children) {
        object.lookAt(camera.position);
      }
      for (const [nodeId, object] of nodeMeshes.entries()) {
        const baseScale = nodeBaseScales.get(nodeId);
        if (!baseScale) continue;
        const selectedScale = nodeId === selectedIdRef.current ? 1.18 : 1;
        object.scale.lerp(baseScale.clone().multiplyScalar(selectedScale), 0.08);
      }
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      visibilityObserver.disconnect();
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener("pointerdown", pointerDown);
      renderer.domElement.removeEventListener("pointermove", pointerMove);
      renderer.domElement.removeEventListener("pointerup", pointerUp);
      renderer.domElement.removeEventListener("pointerleave", pointerLeave);
      renderer.dispose();
      renderer.forceContextLoss();
      disposeObject(root);
      sceneControlsRef.current = null;
      mountElement.replaceChildren();
    };
  }, []);

  const activeLayer = layerByKey(activeNode.layer);

  return (
    <section className="border-b border-ink bg-wheat">
      <div className="border-b border-ink px-6 py-4">
        <p className="font-mono text-[0.72rem] font-black uppercase tracking-[0.16em] text-ink/45">
          Chart 05
        </p>
        <h2 className="mt-1 text-2xl font-black leading-none">Artificial human boundary stack</h2>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-5">
          <p className="font-mono text-[0.62rem] font-black uppercase tracking-[0.16em] text-ink/58">
            layered continuation · support before cognition
          </p>
          <div className="flex flex-wrap items-center gap-5 font-mono text-[0.62rem] font-black uppercase tracking-[0.16em] text-ink">
            <span>horizontal drag + slight pitch</span>
            <span>click node</span>
            <span>right legend reads shape</span>
          </div>
        </div>
      </div>

      <div className="relative border-b border-ink/80">
        <div className="pointer-events-none absolute inset-0 opacity-[0.18] [background-image:linear-gradient(90deg,rgba(5,5,16,0.42)_1px,transparent_1px),linear-gradient(180deg,rgba(5,5,16,0.32)_1px,transparent_1px)] [background-size:62px_62px]" />
        <div className="relative h-[760px] overflow-hidden sm:h-[790px] lg:h-[820px]">
          <div ref={mountRef} className="absolute inset-0" aria-label="Artificial human boundary layered 3D chart" />
          <div className="pointer-events-none absolute left-6 top-6 max-w-[34rem] font-mono text-[0.72rem] font-black uppercase leading-relaxed tracking-[0.14em] text-ink/64">
            drag to rotate · vertical pitch is limited · click / hover a shape to read evidence
          </div>
          <div
            className="pointer-events-none absolute right-5 top-5 w-[25rem] max-w-[calc(100%-2.5rem)] border bg-wheat/92 p-5"
            style={{
              borderColor: activeNode.color,
              boxShadow: `inset 0 0 0 1px ${activeNode.color}22`,
            }}
          >
            <p
              className="font-mono text-[0.68rem] font-black uppercase tracking-[0.16em]"
              style={{ color: activeNode.color }}
            >
              Evidence node · layer {activeLayer.index} · {shapeLabel(activeNode.shape)}
            </p>
            <h4 className="mt-3 text-2xl font-black leading-none text-ink">{activeNode.label}</h4>
            <p className="mt-3 font-mono text-[0.72rem] font-black uppercase leading-5 tracking-[0.11em] text-ink/58">
              mode: {activeNode.functionMode} · role: {activeNode.status}
            </p>
            <p className="mt-4 text-[0.98rem] leading-7 text-ink/70">
              <span className="font-mono text-[0.62rem] font-black uppercase tracking-[0.12em] text-ink/48">
                What this shows:
              </span>{" "}
              {activeNode.summary}
            </p>
            <p className="mt-5 border-t border-ink/25 pt-3 font-mono text-[0.58rem] font-black uppercase leading-4 tracking-[0.12em] text-ink/46">
              Source anchor: {activeNode.evidence}
            </p>
          </div>
          <div className="pointer-events-none absolute bottom-5 right-5 w-[17rem] border border-ink bg-wheat/92 p-3.5">
            <p className="font-mono text-[0.64rem] font-black uppercase tracking-[0.16em] text-ink/62">
              layer / shape key
            </p>
            <div className="mt-3 grid gap-2.5 font-mono text-[0.62rem] font-black uppercase leading-4 tracking-[0.12em] text-ink">
              {[
                ["capsule", MUTED, "external apparatus"],
                ["circle", SUPPORT, "body support"],
                ["oval", REPLACE, "body replacement"],
                ["hexagon", CONTINUE, "life continuation"],
                ["rect", PROCESS, "human process"],
                ["star", SPECULATIVE, "speculative edge"],
              ].map(([shape, color, label]) => (
                <div key={label} className="grid grid-cols-[2rem_1fr] items-center gap-2">
                  <LegendShape shape={shape as ShapeKind} color={color} />
                  <span>{label}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 border-t border-ink/30 pt-3 font-mono text-[0.56rem] font-black uppercase leading-4 tracking-[0.12em] text-ink/48">
              dark point-to-point lines = layer inheritance / colored curves = same-layer relation
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
