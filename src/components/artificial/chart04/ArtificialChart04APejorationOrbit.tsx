"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const INK = "#050510";
const FIRE = "#A1081F";
const RULE = "#463F37";
const MUTED = "#746B5A";

type Anchor = {
  id: string;
  label: string;
  year: string;
  domain: string;
  note: string;
  position: THREE.Vector3;
  charge: number;
  color: string;
  kind: "primary";
};

type OrbitSpec = {
  id: string;
  label: string;
  domain: string;
  color: string;
  opacity: number;
  points: THREE.Vector3[];
};

type EvidenceNode = {
  id: string;
  label: string;
  year: string;
  domain: string;
  note: string;
  position: THREE.Vector3;
  color: string;
  charge: number;
  kind: "secondary";
};

type DirectionCue = {
  id: string;
  label: string;
  year: string;
  domain: string;
  note: string;
  position: THREE.Vector3;
  direction: THREE.Vector3;
  color: string;
  kind: "direction";
};

type HoverItem = Anchor | EvidenceNode | DirectionCue;

function ellipticalArcPoints({
  center = new THREE.Vector3(),
  radiusX,
  radiusY,
  start = 0,
  end = Math.PI * 2,
  zAmplitude = 0.18,
  zPhase = 0,
  samples = 96,
}: {
  center?: THREE.Vector3;
  radiusX: number;
  radiusY: number;
  start?: number;
  end?: number;
  zAmplitude?: number;
  zPhase?: number;
  samples?: number;
}) {
  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= samples; i += 1) {
    const t = i / samples;
    const angle = start + (end - start) * t;
    points.push(
      new THREE.Vector3(
        center.x + Math.cos(angle) * radiusX,
        center.y + Math.sin(angle) * radiusY,
        center.z + Math.sin(angle + zPhase) * zAmplitude,
      ),
    );
  }
  return points;
}

function lemniscatePoints({
  radiusX,
  radiusY,
  zAmplitude = 0.2,
  samples = 144,
  phase = 0,
}: {
  radiusX: number;
  radiusY: number;
  zAmplitude?: number;
  samples?: number;
  phase?: number;
}) {
  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= samples; i += 1) {
    const t = (i / samples) * Math.PI * 2 + phase;
    points.push(
      new THREE.Vector3(
        Math.sin(t) * radiusX,
        Math.sin(t * 2) * radiusY,
        Math.cos(t) * zAmplitude,
      ),
    );
  }
  return points;
}

const anchors: Anchor[] = [
  {
    id: "tears",
    label: "artificial tears",
    year: "1590s",
    domain: "false emotion",
    note: "early feigned-emotion charge",
    position: new THREE.Vector3(-2.9, 0.36, -0.72),
    charge: 3,
    color: FIRE,
    kind: "primary",
  },
  {
    id: "manners",
    label: "artificial manners",
    year: "1787",
    domain: "affected manners",
    note: "social performance and insincerity",
    position: new THREE.Vector3(-2.12, -0.54, 0.58),
    charge: 3,
    color: FIRE,
    kind: "primary",
  },
  {
    id: "webster",
    label: "not natural / not genuine",
    year: "1828",
    domain: "lexical split",
    note: "dictionary checkpoint keeps the senses apart",
    position: new THREE.Vector3(-0.86, 0.08, 0.82),
    charge: 2,
    color: INK,
    kind: "primary",
  },
  {
    id: "coloring",
    label: "artificial coloring",
    year: "1850s-1898",
    domain: "industrial synthetic",
    note: "synthetic dye and food-coloring bridge",
    position: new THREE.Vector3(0.54, -0.42, -0.75),
    charge: 2,
    color: INK,
    kind: "primary",
  },
  {
    id: "food",
    label: "artificially colored",
    year: "1904",
    domain: "processed consumer",
    note: "food trust / purity context",
    position: new THREE.Vector3(1.16, 0.46, 0.95),
    charge: 2,
    color: INK,
    kind: "primary",
  },
  {
    id: "flavoring",
    label: "no artificial flavoring",
    year: "1950",
    domain: "absence claim",
    note: "absence becomes an advertising asset",
    position: new THREE.Vector3(1.88, -0.24, -0.92),
    charge: 4,
    color: FIRE,
    kind: "primary",
  },
  {
    id: "sweetener",
    label: "artificial sweetener",
    year: "1969",
    domain: "additive scrutiny",
    note: "consumer/regulatory scrutiny context",
    position: new THREE.Vector3(2.26, 0.5, 1.05),
    charge: 3,
    color: FIRE,
    kind: "primary",
  },
  {
    id: "reformulation",
    label: "remove artificial",
    year: "2015",
    domain: "reformulation",
    note: "brands move away from artificial colors/flavors",
    position: new THREE.Vector3(3.08, -0.42, -0.76),
    charge: 4,
    color: FIRE,
    kind: "primary",
  },
  {
    id: "modern",
    label: "no artificial colors",
    year: "2025-26",
    domain: "modern absence",
    note: "FDA / brand / packaging cluster",
    position: new THREE.Vector3(3.55, 0.28, 0.9),
    charge: 4,
    color: FIRE,
    kind: "primary",
  },
];

const secondaryEvidenceNodes: EvidenceNode[] = [
  { id: "smile", label: "artificial smile", year: "pre-1800 lead", domain: "false emotion", note: "Needs snippet hardening; useful as early social/emotional pejoration.", position: new THREE.Vector3(-3.34, 0.08, 0.64), color: FIRE, charge: 2, kind: "secondary" },
  { id: "sentiment", label: "artificial sentiment", year: "pre-1800 lead", domain: "false emotion", note: "Sparse phrase evidence; keep as review cue for false feeling language.", position: new THREE.Vector3(-2.72, 0.72, 1.08), color: FIRE, charge: 2, kind: "secondary" },
  { id: "passion", label: "artificial passion", year: "pre-1800 lead", domain: "false emotion", note: "Candidate early affective charge; needs manual snippet review.", position: new THREE.Vector3(-2.55, -0.12, -1.18), color: FIRE, charge: 2, kind: "secondary" },
  { id: "politeness", label: "artificial politeness", year: "18th-19th c.", domain: "affected manners", note: "Social performance cluster; weaker than manners but important for domain transfer.", position: new THREE.Vector3(-2.12, 0.48, -0.92), color: INK, charge: 1, kind: "secondary" },
  { id: "style", label: "artificial style", year: "19th c.", domain: "aesthetic style", note: "Aesthetic criticism bridge; not always negative, so marked lower charge.", position: new THREE.Vector3(-1.68, 0.88, 0.36), color: INK, charge: 1, kind: "secondary" },
  { id: "affected", label: "artificially affected", year: "pre-1800 lead", domain: "affected / insincere", note: "Direct bridge to affectedness; needs stronger lexical/snippet confirmation.", position: new THREE.Vector3(-1.28, -0.74, 1.02), color: FIRE, charge: 2, kind: "secondary" },
  { id: "imitation", label: "artificial imitation", year: "1800-1900", domain: "imitation substitute", note: "Useful Chart 4B bridge; artificial is fake-adjacent but not identical.", position: new THREE.Vector3(-0.52, 0.52, -1.08), color: INK, charge: 1, kind: "secondary" },
  { id: "genuine", label: "not genuine", year: "lexical checkpoint", domain: "fake / genuine boundary", note: "Needs dictionary distinction work before Chart 4B claims.", position: new THREE.Vector3(-0.22, -0.46, 0.96), color: INK, charge: 1, kind: "secondary" },
  { id: "colour", label: "artificial colour / color", year: "1850-1900", domain: "industrial synthetic", note: "Industrial and food-color bridge; stronger than broad synthetic alone.", position: new THREE.Vector3(0.72, 0.16, -1.18), color: INK, charge: 1, kind: "secondary" },
  { id: "adulterated", label: "adulterated / pure", year: "1850-1900 gap", domain: "food trust", note: "Still needs more representative 1850-1900 newspaper/advertising anchors.", position: new THREE.Vector3(0.96, -0.78, 0.78), color: FIRE, charge: 2, kind: "secondary" },
  { id: "flavor", label: "artificial flavor", year: "1900-1950", domain: "processed consumer", note: "Early packaging/food language anchor; needs decade continuity.", position: new THREE.Vector3(1.28, -0.12, 1.18), color: INK, charge: 1, kind: "secondary" },
  { id: "preservative", label: "artificial preservatives", year: "1950-2019", domain: "processed consumer", note: "Important modern avoidance term; source width still thin.", position: new THREE.Vector3(1.62, 0.78, -0.82), color: FIRE, charge: 2, kind: "secondary" },
  { id: "sweeteners", label: "artificial sweeteners", year: "1960s-2000s", domain: "additive scrutiny", note: "Consumer/regulatory bridge; useful but should avoid health-risk claims.", position: new THREE.Vector3(2.02, -0.62, 0.98), color: FIRE, charge: 2, kind: "secondary" },
  { id: "nothing", label: "nothing artificial", year: "late 20th-2026", domain: "absence claim", note: "Strong avoidance language; packaging/web evidence should be expanded.", position: new THREE.Vector3(2.44, 0.06, -1.2), color: FIRE, charge: 3, kind: "secondary" },
  { id: "clean-label", label: "clean label", year: "2000-2026", domain: "modern authenticity", note: "Not an artificial phrase by itself; needs consumer-culture framing.", position: new THREE.Vector3(2.88, 0.84, 0.66), color: FIRE, charge: 3, kind: "secondary" },
  { id: "free-from", label: "free from artificial", year: "2019-2026", domain: "absence claim", note: "Modern removal / exclusion language; high Chart 4A value.", position: new THREE.Vector3(3.16, -0.12, 1.2), color: FIRE, charge: 3, kind: "secondary" },
  { id: "real-ingredients", label: "real ingredients", year: "2010-2026", domain: "modern authenticity", note: "Comparator phrase: useful for later artificial vs real/genuine distance.", position: new THREE.Vector3(3.42, -0.72, -0.52), color: INK, charge: 1, kind: "secondary" },
  { id: "synthetic", label: "synthetic ingredients", year: "2019-2026", domain: "semantic distance", note: "Chart 4B bridge for artificial vs synthetic distinction.", position: new THREE.Vector3(3.72, 0.58, -0.84), color: INK, charge: 1, kind: "secondary" },
];

const directionCues: DirectionCue[] = [
  {
    id: "direction-reactivation",
    label: "reactivation path",
    year: "pre-1800 -> 2026",
    domain: "trajectory direction",
    note: "Old suspicion around false emotion and affectedness returns in consumer and absence-claim domains.",
    position: new THREE.Vector3(0.88, -0.18, 0.55),
    direction: new THREE.Vector3(1, 0.18, 0.18),
    color: FIRE,
    kind: "direction",
  },
  {
    id: "direction-transfer",
    label: "domain transfer",
    year: "1850-2019",
    domain: "trajectory direction",
    note: "The charge moves from social/aesthetic artificiality into industrial, processed, and packaging contexts.",
    position: new THREE.Vector3(-0.1, -0.48, -0.66),
    direction: new THREE.Vector3(1, -0.2, -0.1),
    color: INK,
    kind: "direction",
  },
  {
    id: "direction-absence",
    label: "absence acceleration",
    year: "1950 -> 2026",
    domain: "trajectory direction",
    note: "No-artificial claims turn artificial into something marketable by removal or exclusion.",
    position: new THREE.Vector3(2.7, 0.2, -0.22),
    direction: new THREE.Vector3(0.72, 0.2, 0.1),
    color: FIRE,
    kind: "direction",
  },
];

const orbitSpecs: OrbitSpec[] = [
  {
    id: "early-split",
    label: "early split",
    domain: "lexical / emotional",
    color: INK,
    opacity: 0.78,
    points: ellipticalArcPoints({
      center: new THREE.Vector3(-2.24, 0.02, -0.02),
      radiusX: 1.55,
      radiusY: 0.88,
      zAmplitude: 0.92,
      zPhase: 0.4,
      samples: 132,
    }),
  },
  {
    id: "false-emotion",
    label: "false emotion",
    domain: "tears / smile / sentiment",
    color: FIRE,
    opacity: 0.76,
    points: lemniscatePoints({ radiusX: 3.05, radiusY: 0.72, zAmplitude: 1.18, phase: -0.18 }),
  },
  {
    id: "industrial-transfer",
    label: "domain transfer",
    domain: "food / synthetic / processed",
    color: INK,
    opacity: 0.62,
    points: ellipticalArcPoints({
      center: new THREE.Vector3(1.66, -0.04, 0.04),
      radiusX: 2.12,
      radiusY: 0.98,
      start: Math.PI * 1.12,
      end: Math.PI * 2.02,
      zAmplitude: 0.86,
      zPhase: -0.2,
      samples: 106,
    }),
  },
  {
    id: "absence-acceleration",
    label: "absence claim",
    domain: "no artificial / clean label",
    color: FIRE,
    opacity: 0.84,
    points: ellipticalArcPoints({
      center: new THREE.Vector3(2.68, 0.1, 0.02),
      radiusX: 1.25,
      radiusY: 0.78,
      zAmplitude: 1.06,
      zPhase: 1.1,
      samples: 126,
    }),
  },
  {
    id: "spiral-return",
    label: "spiral reactivation",
    domain: "old suspicion in new domains",
    color: INK,
    opacity: 0.46,
    points: lemniscatePoints({ radiusX: 3.55, radiusY: 1.04, zAmplitude: 1.38, phase: Math.PI * 0.5 }),
  },
];

const domainRows = [
  ["early split", "pre-1800", "tears / manners"],
  ["industrial bridge", "1850-1900", "coloring / adulteration"],
  ["consumer turn", "1900-2019", "flavoring / sweetener / removal"],
  ["absence field", "2019-2026", "no artificial / clean label"],
];

function makeTextSprite(text: string, options: { size?: number; color?: string; opacity?: number; weight?: string } = {}) {
  const size = options.size ?? 36;
  const padding = 16;
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) return new THREE.Sprite();
  context.font = `${options.weight ?? "800"} ${size}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
  const metrics = context.measureText(text);
  canvas.width = Math.ceil(metrics.width + padding * 2);
  canvas.height = Math.ceil(size * 1.5 + padding * 2);
  context.font = `${options.weight ?? "800"} ${size}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
  context.fillStyle = options.color ?? INK;
  context.textBaseline = "middle";
  context.fillText(text, padding, canvas.height / 2);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    opacity: options.opacity ?? 0.86,
    depthTest: false,
  });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(canvas.width / 190, canvas.height / 190, 1);
  return sprite;
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

function makeLine(points: THREE.Vector3[], color = INK, opacity = 0.5) {
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({ color, transparent: true, opacity });
  return new THREE.Line(geometry, material);
}

function makeDashedEllipse(radiusX: number, radiusY: number, z: number, color = INK, opacity = 0.22) {
  const group = new THREE.Group();
  const segments = 88;
  for (let i = 0; i < segments; i += 2) {
    const a0 = (i / segments) * Math.PI * 2;
    const a1 = ((i + 0.78) / segments) * Math.PI * 2;
    group.add(
      makeLine(
        [
          new THREE.Vector3(Math.cos(a0) * radiusX, Math.sin(a0) * radiusY, z),
          new THREE.Vector3(Math.cos(a1) * radiusX, Math.sin(a1) * radiusY, z),
        ],
        color,
        opacity,
      ),
    );
  }
  return group;
}

function makeEllipsePolyline({
  center = new THREE.Vector3(),
  radiusX,
  radiusY,
  z = 0,
  color = INK,
  opacity = 0.26,
  segments = 180,
}: {
  center?: THREE.Vector3;
  radiusX: number;
  radiusY: number;
  z?: number;
  color?: string;
  opacity?: number;
  segments?: number;
}) {
  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= segments; i += 1) {
    const angle = (i / segments) * Math.PI * 2;
    points.push(new THREE.Vector3(center.x + Math.cos(angle) * radiusX, center.y + Math.sin(angle) * radiusY, center.z + z));
  }
  return makeLine(points, color, opacity);
}

function makeTickRing({
  center = new THREE.Vector3(),
  radiusX,
  radiusY,
  count = 36,
  color = INK,
  opacity = 0.32,
}: {
  center?: THREE.Vector3;
  radiusX: number;
  radiusY: number;
  count?: number;
  color?: string;
  opacity?: number;
}) {
  const group = new THREE.Group();
  for (let i = 0; i < count; i += 1) {
    const angle = (i / count) * Math.PI * 2;
    const tickLength = i % 6 === 0 ? 0.16 : 0.08;
    const outer = new THREE.Vector3(center.x + Math.cos(angle) * radiusX, center.y + Math.sin(angle) * radiusY, center.z + 0.06);
    const inner = new THREE.Vector3(
      center.x + Math.cos(angle) * (radiusX - tickLength),
      center.y + Math.sin(angle) * (radiusY - tickLength * 0.58),
      center.z + 0.06,
    );
    group.add(makeLine([inner, outer], color, opacity));
  }
  return group;
}

function makeRadialSpokes({
  center = new THREE.Vector3(),
  radiusX,
  radiusY,
  count = 12,
  color = INK,
  opacity = 0.18,
}: {
  center?: THREE.Vector3;
  radiusX: number;
  radiusY: number;
  count?: number;
  color?: string;
  opacity?: number;
}) {
  const group = new THREE.Group();
  for (let i = 0; i < count; i += 1) {
    const angle = (i / count) * Math.PI * 2;
    group.add(
      makeLine(
        [
          center,
          new THREE.Vector3(center.x + Math.cos(angle) * radiusX, center.y + Math.sin(angle) * radiusY, center.z),
        ],
        color,
        opacity,
      ),
    );
  }
  return group;
}

function makeOrientedEllipse({
  center = new THREE.Vector3(),
  radiusX,
  radiusY,
  rotation = new THREE.Euler(),
  color = INK,
  opacity = 0.26,
  segments = 180,
}: {
  center?: THREE.Vector3;
  radiusX: number;
  radiusY: number;
  rotation?: THREE.Euler;
  color?: string;
  opacity?: number;
  segments?: number;
}) {
  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= segments; i += 1) {
    const angle = (i / segments) * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(angle) * radiusX, Math.sin(angle) * radiusY, 0));
  }
  const group = new THREE.Group();
  group.position.copy(center);
  group.rotation.copy(rotation);
  group.add(makeLine(points, color, opacity));
  return group;
}

function makeDepthConnectors({
  center = new THREE.Vector3(),
  radiusX,
  radiusY,
  radiusZ,
  count = 18,
  color = INK,
  opacity = 0.12,
}: {
  center?: THREE.Vector3;
  radiusX: number;
  radiusY: number;
  radiusZ: number;
  count?: number;
  color?: string;
  opacity?: number;
}) {
  const group = new THREE.Group();
  for (let i = 0; i < count; i += 1) {
    const angle = (i / count) * Math.PI * 2;
    const x = center.x + Math.cos(angle) * radiusX;
    const y = center.y + Math.sin(angle) * radiusY;
    group.add(
      makeLine(
        [new THREE.Vector3(x, y, center.z - radiusZ), new THREE.Vector3(x, y, center.z + radiusZ)],
        color,
        opacity,
      ),
    );
  }
  return group;
}

function makeOrbitShell({
  center,
  radiusX,
  radiusY,
  radiusZ,
  color = INK,
  opacity = 0.2,
}: {
  center: THREE.Vector3;
  radiusX: number;
  radiusY: number;
  radiusZ: number;
  color?: string;
  opacity?: number;
}) {
  const group = new THREE.Group();
  group.add(makeOrientedEllipse({ center, radiusX, radiusY, color, opacity }));
  group.add(
    makeOrientedEllipse({
      center,
      radiusX,
      radiusY: radiusZ,
      rotation: new THREE.Euler(Math.PI / 2, 0, 0),
      color,
      opacity: opacity * 0.92,
    }),
  );
  group.add(
    makeOrientedEllipse({
      center,
      radiusX: radiusZ,
      radiusY,
      rotation: new THREE.Euler(0, Math.PI / 2, 0),
      color,
      opacity: opacity * 0.92,
    }),
  );
  group.add(
    makeOrientedEllipse({
      center,
      radiusX,
      radiusY: radiusZ * 0.72,
      rotation: new THREE.Euler(Math.PI / 2.6, 0.42, 0.22),
      color,
      opacity: opacity * 0.78,
    }),
  );
  group.add(
    makeOrientedEllipse({
      center,
      radiusX,
      radiusY: radiusZ * 0.72,
      rotation: new THREE.Euler(-Math.PI / 2.6, -0.38, -0.18),
      color,
      opacity: opacity * 0.72,
    }),
  );
  group.add(makeDepthConnectors({ center, radiusX, radiusY, radiusZ, color, opacity: opacity * 0.9 }));
  return group;
}

function makeArcConstellation({
  center,
  radiusX,
  radiusY,
  radiusZ,
  color = INK,
  opacity = 0.12,
}: {
  center: THREE.Vector3;
  radiusX: number;
  radiusY: number;
  radiusZ: number;
  color?: string;
  opacity?: number;
}) {
  const group = new THREE.Group();
  const rotations = [
    new THREE.Euler(0.18, 0.62, 0.16),
    new THREE.Euler(-0.34, -0.46, 0.82),
    new THREE.Euler(0.72, 0.22, -0.36),
    new THREE.Euler(-0.62, 0.74, -0.18),
    new THREE.Euler(0.42, -0.82, 0.48),
  ];
  rotations.forEach((rotation, index) => {
    group.add(
      makeOrientedEllipse({
        center: center.clone().add(new THREE.Vector3(index % 2 === 0 ? 0.08 : -0.08, (index - 2) * 0.04, (index - 2) * 0.12)),
        radiusX: radiusX * (1 - index * 0.035),
        radiusY: index % 2 === 0 ? radiusY : radiusZ,
        rotation,
        color,
        opacity: opacity * (1.12 - index * 0.08),
        segments: 220,
      }),
    );
  });
  return group;
}

function makeHelix({
  center = new THREE.Vector3(),
  radius = 0.62,
  height = 2.5,
  turns = 3,
  color = FIRE,
  opacity = 0.16,
  phase = 0,
}: {
  center?: THREE.Vector3;
  radius?: number;
  height?: number;
  turns?: number;
  color?: string;
  opacity?: number;
  phase?: number;
}) {
  const points: THREE.Vector3[] = [];
  const samples = 220;
  for (let i = 0; i <= samples; i += 1) {
    const t = i / samples;
    const angle = t * Math.PI * 2 * turns + phase;
    points.push(
      new THREE.Vector3(
        center.x + Math.cos(angle) * radius * (0.72 + t * 0.38),
        center.y + (t - 0.5) * height,
        center.z + Math.sin(angle) * radius,
      ),
    );
  }
  return makeLine(points, color, opacity);
}

function makeWireTorus({
  center = new THREE.Vector3(),
  radius = 1,
  tube = 0.035,
  scale = new THREE.Vector3(1, 1, 1),
  rotation = new THREE.Euler(),
  color = INK,
  opacity = 0.14,
}: {
  center?: THREE.Vector3;
  radius?: number;
  tube?: number;
  scale?: THREE.Vector3;
  rotation?: THREE.Euler;
  color?: string;
  opacity?: number;
}) {
  const geometry = new THREE.TorusGeometry(radius, tube, 8, 160);
  const material = new THREE.MeshBasicMaterial({
    color,
    wireframe: true,
    transparent: true,
    opacity,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.copy(center);
  mesh.rotation.copy(rotation);
  mesh.scale.copy(scale);
  return mesh;
}

function makeCoreAxes() {
  const group = new THREE.Group();
  group.add(makeLine([new THREE.Vector3(-4.18, 0, 0), new THREE.Vector3(4.18, 0, 0)], INK, 0.32));
  group.add(makeLine([new THREE.Vector3(0, -1.64, 0), new THREE.Vector3(0, 1.64, 0)], INK, 0.32));
  group.add(makeLine([new THREE.Vector3(0, 0, -1.72), new THREE.Vector3(0, 0, 1.72)], FIRE, 0.34));
  group.add(makeLine([new THREE.Vector3(-4.02, 0, -1.16), new THREE.Vector3(4.02, 0, 1.16)], INK, 0.12));
  group.add(makeLine([new THREE.Vector3(-4.02, 0, 1.16), new THREE.Vector3(4.02, 0, -1.16)], INK, 0.12));
  group.add(makeEllipsePolyline({ center: new THREE.Vector3(0, 0, 0), radiusX: 0.52, radiusY: 0.52, color: FIRE, opacity: 0.28 }));
  group.add(makeEllipsePolyline({ center: new THREE.Vector3(0, 0, -0.64), radiusX: 0.72, radiusY: 0.52, color: INK, opacity: 0.12 }));
  group.add(makeEllipsePolyline({ center: new THREE.Vector3(0, 0, 0.64), radiusX: 0.72, radiusY: 0.52, color: INK, opacity: 0.12 }));
  return group;
}

function makeCurve(spec: OrbitSpec) {
  const curve = new THREE.CatmullRomCurve3(spec.points, false, "centripetal", 0.52);
  const points = curve.getPoints(240);
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({
    color: spec.color,
    transparent: true,
    opacity: spec.opacity,
  });
  const line = new THREE.Line(geometry, material);
  return { line, curve };
}

function makeParticleCloud({
  count,
  center,
  radius,
  flattenY = 0.55,
  color = INK,
  opacity = 0.36,
  seed,
}: {
  count: number;
  center: THREE.Vector3;
  radius: THREE.Vector3;
  flattenY?: number;
  color?: string;
  opacity?: number;
  seed: number;
}) {
  const positions = new Float32Array(count * 3);
  let state = seed;
  const random = () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
  for (let i = 0; i < count; i += 1) {
    const theta = random() * Math.PI * 2;
    const r = Math.sqrt(random());
    const band = (random() - 0.5) * 0.26;
    positions[i * 3] = center.x + Math.cos(theta) * r * radius.x;
    positions[i * 3 + 1] = center.y + Math.sin(theta) * r * radius.y * flattenY + band;
    positions[i * 3 + 2] = center.z + (random() - 0.5) * radius.z;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({
    color,
    size: 0.028,
    transparent: true,
    opacity,
    depthWrite: false,
  });
  return new THREE.Points(geometry, material);
}

function makeArrowHead(position: THREE.Vector3, direction: THREE.Vector3, color = INK, opacity = 0.72) {
  const geometry = new THREE.ConeGeometry(0.055, 0.16, 12);
  const material = new THREE.MeshBasicMaterial({ color, transparent: true, opacity });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.copy(position);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize());
  return mesh;
}

export function ArtificialChart04APejorationOrbit() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [activeItem, setActiveItem] = useState<HoverItem | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const mountElement = mountRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 80);
    camera.position.set(0, 0.06, 9.6);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.className = "h-full w-full cursor-grab active:cursor-grabbing";
    mountElement.appendChild(renderer.domElement);

    const root = new THREE.Group();
    root.rotation.x = -0.12;
    root.rotation.y = -0.24;
    root.position.y = 0.02;
    root.scale.setScalar(0.9);
    scene.add(root);
    scene.add(new THREE.AmbientLight(0xffffff, 1));

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const hitTargets: THREE.Object3D[] = [];
    const itemByUuid = new Map<string, HoverItem>();
    const movingLights: Array<{ mesh: THREE.Mesh; curve: THREE.CatmullRomCurve3; speed: number; offset: number }> = [];

    const activeRingMaterial = new THREE.MeshBasicMaterial({
      color: FIRE,
      transparent: true,
      opacity: 0.86,
      depthWrite: false,
    });
    const activeRing = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.012, 8, 56), activeRingMaterial);
    activeRing.visible = false;
    root.add(activeRing);

    const addHitTarget = (item: HoverItem, radius = 0.16) => {
      const hitGeometry = new THREE.SphereGeometry(radius, 12, 12);
      const hitMaterial = new THREE.MeshBasicMaterial({
        color: item.color,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      });
      const target = new THREE.Mesh(hitGeometry, hitMaterial);
      target.position.copy(item.position);
      root.add(target);
      hitTargets.push(target);
      itemByUuid.set(target.uuid, item);
    };

    const setHoveredItem = (item: HoverItem | null) => {
      setActiveItem((current) => (current?.id === item?.id ? current : item));
      if (!item) {
        activeRing.visible = false;
        return;
      }
      const charge = "charge" in item ? item.charge : 3;
      activeRing.visible = true;
      activeRing.position.copy(item.position);
      activeRingMaterial.color.set(item.color);
      activeRing.scale.setScalar(item.kind === "direction" ? 1.45 : 0.86 + charge * 0.18);
    };

    root.add(makeParticleCloud({ count: 980, center: new THREE.Vector3(-2.45, 0, -0.1), radius: new THREE.Vector3(1.55, 1.35, 1.18), opacity: 0.38, seed: 14 }));
    root.add(
      makeParticleCloud({
        count: 980,
        center: new THREE.Vector3(2.65, 0.02, 0.05),
        radius: new THREE.Vector3(1.55, 1.28, 1.28),
        color: INK,
        opacity: 0.38,
        seed: 41,
      }),
    );
    root.add(
      makeParticleCloud({
        count: 280,
        center: new THREE.Vector3(0.03, 0, 0.08),
        radius: new THREE.Vector3(0.26, 1.45, 1.22),
        flattenY: 1,
        color: FIRE,
        opacity: 0.42,
        seed: 63,
      }),
    );

    const structure = new THREE.Group();
    const leftCenter = new THREE.Vector3(-2.42, 0.02, -0.18);
    const rightCenter = new THREE.Vector3(2.62, 0.02, -0.16);
    structure.add(makeCoreAxes());
    structure.add(makeWireTorus({
      center: new THREE.Vector3(0.12, 0, 0),
      radius: 2.42,
      tube: 0.012,
      scale: new THREE.Vector3(1.7, 0.48, 0.68),
      rotation: new THREE.Euler(0.32, 0.72, 0.08),
      color: INK,
      opacity: 0.1,
    }));
    structure.add(makeWireTorus({
      center: new THREE.Vector3(0.08, 0.02, 0),
      radius: 2.26,
      tube: 0.012,
      scale: new THREE.Vector3(1.72, 0.42, 0.78),
      rotation: new THREE.Euler(-0.38, -0.78, 0.36),
      color: INK,
      opacity: 0.08,
    }));
    structure.add(makeWireTorus({
      center: new THREE.Vector3(0.16, 0.02, 0.08),
      radius: 1.86,
      tube: 0.011,
      scale: new THREE.Vector3(1.82, 0.36, 0.88),
      rotation: new THREE.Euler(0.68, -0.28, -0.5),
      color: FIRE,
      opacity: 0.1,
    }));
    structure.add(makeOrbitShell({ center: new THREE.Vector3(0, 0, 0), radiusX: 3.52, radiusY: 1.08, radiusZ: 1.32, color: INK, opacity: 0.1 }));
    structure.add(makeOrbitShell({ center: leftCenter, radiusX: 1.76, radiusY: 0.96, radiusZ: 1.08, color: INK, opacity: 0.28 }));
    structure.add(makeOrbitShell({ center: rightCenter, radiusX: 1.84, radiusY: 1.0, radiusZ: 1.18, color: INK, opacity: 0.28 }));
    structure.add(makeOrbitShell({ center: new THREE.Vector3(0, 0, 0), radiusX: 0.62, radiusY: 1.02, radiusZ: 1.18, color: FIRE, opacity: 0.26 }));
    structure.add(makeArcConstellation({ center: leftCenter, radiusX: 1.96, radiusY: 0.78, radiusZ: 1.34, color: INK, opacity: 0.15 }));
    structure.add(makeArcConstellation({ center: rightCenter, radiusX: 2.02, radiusY: 0.82, radiusZ: 1.42, color: INK, opacity: 0.15 }));
    structure.add(makeArcConstellation({ center: new THREE.Vector3(0.06, 0.02, 0.02), radiusX: 0.9, radiusY: 0.72, radiusZ: 1.42, color: FIRE, opacity: 0.12 }));
    structure.add(makeHelix({ center: new THREE.Vector3(-0.08, 0, 0), radius: 0.42, height: 2.82, turns: 3.4, color: FIRE, opacity: 0.2 }));
    structure.add(makeHelix({ center: new THREE.Vector3(0.1, 0, 0), radius: 0.58, height: 2.62, turns: 2.7, color: INK, opacity: 0.12, phase: Math.PI * 0.65 }));
    structure.add(makeEllipsePolyline({ center: leftCenter, radiusX: 1.78, radiusY: 0.98, opacity: 0.26 }));
    structure.add(makeEllipsePolyline({ center: leftCenter, radiusX: 1.18, radiusY: 0.66, opacity: 0.2 }));
    structure.add(makeEllipsePolyline({ center: rightCenter, radiusX: 1.86, radiusY: 1.02, opacity: 0.26 }));
    structure.add(makeEllipsePolyline({ center: rightCenter, radiusX: 1.18, radiusY: 0.66, opacity: 0.2 }));
    structure.add(makeTickRing({ center: leftCenter, radiusX: 1.78, radiusY: 0.98, count: 42, opacity: 0.32 }));
    structure.add(makeTickRing({ center: rightCenter, radiusX: 1.86, radiusY: 1.02, count: 48, opacity: 0.32 }));
    structure.add(makeRadialSpokes({ center: leftCenter, radiusX: 1.72, radiusY: 0.94, count: 10, opacity: 0.14 }));
    structure.add(makeRadialSpokes({ center: rightCenter, radiusX: 1.8, radiusY: 0.98, count: 10, opacity: 0.14 }));
    structure.add(makeEllipsePolyline({ center: new THREE.Vector3(0, 0, 0.04), radiusX: 0.54, radiusY: 0.42, color: FIRE, opacity: 0.36 }));
    structure.add(makeEllipsePolyline({ center: new THREE.Vector3(0, 0, -0.02), radiusX: 0.28, radiusY: 0.92, color: FIRE, opacity: 0.26 }));
    structure.add(makeEllipsePolyline({ center: new THREE.Vector3(0, 0, -0.82), radiusX: 0.72, radiusY: 0.52, color: FIRE, opacity: 0.16 }));
    structure.add(makeEllipsePolyline({ center: new THREE.Vector3(0, 0, 0.82), radiusX: 0.72, radiusY: 0.52, color: FIRE, opacity: 0.16 }));
    for (const x of [-3.45, -2.42, -1.18, 0, 1.42, 2.62, 3.58]) {
      structure.add(makeLine([new THREE.Vector3(x, -1.18, -0.36), new THREE.Vector3(x, 1.18, -0.36)], INK, x === 0 ? 0.26 : 0.14));
      structure.add(makeLine([new THREE.Vector3(x, -1.02, 0.72), new THREE.Vector3(x, 1.02, 0.72)], INK, x === 0 ? 0.16 : 0.08));
    }
    for (const y of [-0.8, -0.4, 0.4, 0.8]) {
      structure.add(makeLine([new THREE.Vector3(-4.02, y, -0.38), new THREE.Vector3(4.02, y, -0.38)], INK, 0.11));
    }
    structure.add(makeLine([new THREE.Vector3(-3.82, 0.86, -0.32), new THREE.Vector3(3.82, -0.86, -0.32)], INK, 0.16));
    structure.add(makeLine([new THREE.Vector3(-3.82, -0.86, -0.32), new THREE.Vector3(3.82, 0.86, -0.32)], INK, 0.16));
    root.add(structure);

    const evidenceGroup = new THREE.Group();
    for (const node of secondaryEvidenceNodes) {
      const geometry = new THREE.SphereGeometry(0.025 + node.charge * 0.009, 14, 14);
      const material = new THREE.MeshBasicMaterial({
        color: node.color,
        transparent: true,
        opacity: node.color === FIRE ? 0.76 : 0.66,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.copy(node.position);
      evidenceGroup.add(mesh);
      evidenceGroup.add(makeLine([new THREE.Vector3(0, 0, node.position.z * 0.24), node.position], node.color, 0.16));
      evidenceGroup.add(makeLine([new THREE.Vector3(node.position.x, 0, node.position.z), node.position], node.color, 0.1));
      addHitTarget(node, 0.14);
    }
    root.add(evidenceGroup);

    for (const cue of directionCues) {
      const arrow = makeArrowHead(cue.position, cue.direction, cue.color, 0.76);
      arrow.scale.setScalar(1.25);
      root.add(arrow);
      root.add(
        makeLine(
          [cue.position.clone().sub(cue.direction.clone().normalize().multiplyScalar(0.42)), cue.position],
          cue.color,
          cue.color === FIRE ? 0.46 : 0.34,
        ),
      );
      addHitTarget(cue, 0.2);
    }

    const leftHalo = makeDashedEllipse(1.7, 1.12, -0.32, INK, 0.34);
    leftHalo.position.x = -2.48;
    root.add(leftHalo);
    const rightHalo = makeDashedEllipse(1.72, 1.16, -0.28, INK, 0.32);
    rightHalo.position.x = 2.62;
    root.add(rightHalo);

    root.add(makeLine([new THREE.Vector3(0, -1.34, 0), new THREE.Vector3(0, 1.36, 0)], INK, 0.62));
    root.add(makeLine([new THREE.Vector3(-3.95, 0, 0), new THREE.Vector3(3.95, 0, 0)], INK, 0.28));
    root.add(makeLine([new THREE.Vector3(-0.18, -1.32, 0.02), new THREE.Vector3(0.18, 1.32, -0.02)], FIRE, 0.44));

    for (const spec of orbitSpecs) {
      const { line, curve } = makeCurve(spec);
      const tube = new THREE.Mesh(
        new THREE.TubeGeometry(curve, 180, spec.color === FIRE ? 0.012 : 0.009, 8, false),
        new THREE.MeshBasicMaterial({
          color: spec.color,
          transparent: true,
          opacity: spec.color === FIRE ? 0.22 : 0.14,
          depthWrite: false,
        }),
      );
      root.add(tube);
      root.add(line);
      const markerGeometry = new THREE.SphereGeometry(spec.id === "absence-acceleration" ? 0.045 : 0.035, 16, 16);
      const markerMaterial = new THREE.MeshBasicMaterial({
        color: spec.color,
        transparent: true,
        opacity: spec.id === "absence-acceleration" ? 0.88 : 0.66,
      });
      const marker = new THREE.Mesh(markerGeometry, markerMaterial);
      root.add(marker);
      movingLights.push({ mesh: marker, curve, speed: spec.id === "absence-acceleration" ? 0.11 : 0.07, offset: movingLights.length * 0.17 });

      const last = spec.points[spec.points.length - 1];
      const prev = spec.points[Math.max(0, spec.points.length - 2)];
      const direction = last.clone().sub(prev);
      root.add(makeArrowHead(last, direction, spec.color, Math.min(0.82, spec.opacity + 0.08)));
      addHitTarget(
        {
          id: `orbit-${spec.id}`,
          label: `${spec.label} direction`,
          year: "trajectory cue",
          domain: spec.domain,
          note:
            spec.id === "absence-acceleration"
              ? "Direction cue for the late absence-claim loop: artificial becomes something named by removal."
              : spec.id === "spiral-return"
                ? "Direction cue for possible spiral reactivation across old and new suspicion domains."
                : "Direction cue for movement between evidence domains; it is not a frequency claim.",
          position: last,
          direction,
          color: spec.color,
          kind: "direction",
        },
        0.18,
      );
    }

    const core = new THREE.Mesh(
      new THREE.SphereGeometry(0.115, 28, 28),
      new THREE.MeshBasicMaterial({ color: FIRE, transparent: true, opacity: 0.92 }),
    );
    root.add(core);
    const coreHalo = makeDashedEllipse(0.42, 0.34, 0.02, FIRE, 0.48);
    root.add(coreHalo);
    const coreLabel = makeTextSprite("ARTIFICIAL", { size: 28, color: INK, opacity: 0.82 });
    coreLabel.position.set(0.42, -0.34, 0.24);
    root.add(coreLabel);

    for (const anchor of anchors) {
      const geometry = new THREE.SphereGeometry(0.054 + anchor.charge * 0.012, 18, 18);
      const material = new THREE.MeshBasicMaterial({
        color: anchor.color,
        transparent: true,
        opacity: 0.9,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.copy(anchor.position);
      root.add(mesh);
      addHitTarget(anchor, 0.18);

      root.add(makeLine([new THREE.Vector3(0, 0, anchor.position.z * 0.2), anchor.position], anchor.color, 0.34));
      root.add(makeLine([new THREE.Vector3(anchor.position.x, 0, anchor.position.z), anchor.position], anchor.color, 0.14));
      if (anchor.id === "tears" || anchor.id === "flavoring" || anchor.id === "modern") {
        const label = makeTextSprite(`${anchor.year} ${anchor.label}`, {
          size: 15,
          color: anchor.color,
          opacity: 0.72,
          weight: "800",
        });
        label.position.copy(anchor.position.clone().add(new THREE.Vector3(anchor.position.x > 0 ? 0.08 : -0.16, 0.16, 0.1)));
        root.add(label);
      }
    }

    const periodLabels = [
      ["pre-1800", -3.28, -1.34],
      ["1850-1900", 0.35, -1.36],
      ["1950-2019", 2.25, -1.36],
      ["2019-2026", 3.48, -1.2],
    ] as const;
    for (const [text, x, y] of periodLabels) {
      const sprite = makeTextSprite(text, { size: 15, color: MUTED, opacity: 0.62, weight: "700" });
      sprite.position.set(x, y, 0.18);
      root.add(sprite);
    }

    let width = 1;
    let height = 1;
    const resize = () => {
      const rect = mountElement.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mountElement);

    let dragging = false;
    let previousX = 0;
    let previousY = 0;
    let targetRotationY = root.rotation.y;
    let targetRotationX = root.rotation.x;

    const updatePointer = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const pointerDown = (event: PointerEvent) => {
      dragging = true;
      previousX = event.clientX;
      previousY = event.clientY;
      renderer.domElement.setPointerCapture(event.pointerId);
    };

    const pointerMove = (event: PointerEvent) => {
      updatePointer(event);
      if (dragging) {
        const dx = event.clientX - previousX;
        const dy = event.clientY - previousY;
        previousX = event.clientX;
        previousY = event.clientY;
        targetRotationY += dx * 0.006;
        targetRotationX = THREE.MathUtils.clamp(targetRotationX + dy * 0.003, -0.44, 0.28);
        return;
      }
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(hitTargets, false)[0];
      const nextItem = hit ? itemByUuid.get(hit.object.uuid) ?? null : null;
      setHoveredItem(nextItem);
    };

    const pointerUp = (event: PointerEvent) => {
      dragging = false;
      if (renderer.domElement.hasPointerCapture(event.pointerId)) {
        renderer.domElement.releasePointerCapture(event.pointerId);
      }
    };

    const pointerLeave = () => {
      dragging = false;
      setHoveredItem(null);
    };

    let sceneVisible = true;
    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        sceneVisible = entry.isIntersecting;
      },
      { threshold: 0.05 },
    );
    visibilityObserver.observe(mountElement);

    renderer.domElement.addEventListener("pointerdown", pointerDown);
    renderer.domElement.addEventListener("pointermove", pointerMove);
    renderer.domElement.addEventListener("pointerup", pointerUp);
    renderer.domElement.addEventListener("pointerleave", pointerLeave);

    let frame = 0;
    let raf = 0;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      if (!sceneVisible) return;
      frame += 0.01;
      root.rotation.y += (targetRotationY - root.rotation.y) * 0.08;
      root.rotation.x += (targetRotationX - root.rotation.x) * 0.08;
      core.scale.setScalar(1 + Math.sin(frame * 2.4) * 0.08);
      coreHalo.rotation.z += 0.0025;
      leftHalo.rotation.z += 0.001;
      rightHalo.rotation.z -= 0.0011;
      for (const light of movingLights) {
        const t = (frame * light.speed + light.offset) % 1;
        light.mesh.position.copy(light.curve.getPoint(t));
      }
      if (activeRing.visible) activeRing.lookAt(camera.position);
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
      mountElement.replaceChildren();
    };
  }, []);

  return (
    <section className="border-b border-ink bg-wheat">
      <div className="border-b border-ink px-6 py-4">
        <p className="font-mono text-[0.72rem] font-black uppercase tracking-[0.16em] text-ink/45">
          Chart 04
        </p>
        <h2 className="mt-1 text-2xl font-black leading-none">Suspicion orbit field</h2>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-6">
          <p className="font-mono text-[0.62rem] font-black uppercase tracking-[0.16em] text-ink/58">
            Chart 4A · pejoration trajectory
          </p>
          <div className="flex flex-wrap items-center gap-5 font-mono text-[0.62rem] font-black uppercase tracking-[0.16em] text-ink">
            <span className="inline-flex items-center gap-2.5">
              <span className="h-3.5 w-3.5 rounded-full border border-ink" />
              reactivation path
            </span>
            <span className="inline-flex items-center gap-2.5">
              <span className="h-3.5 w-3.5 rounded-full bg-fire" />
              high charge
            </span>
          </div>
        </div>
      </div>

      <div className="grid min-h-[820px] border-b border-ink/80 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="relative min-h-[680px] overflow-hidden border-b border-ink/60 bg-transparent lg:border-b-0 lg:border-r">
          <div className="pointer-events-none absolute inset-0 opacity-[0.18] [background-image:linear-gradient(90deg,rgba(5,5,16,0.42)_1px,transparent_1px),linear-gradient(180deg,rgba(5,5,16,0.32)_1px,transparent_1px)] [background-size:54px_54px]" />
          <div ref={mountRef} className="absolute inset-0" aria-label="Chart 04A Three.js suspicion orbit field" />
          <div className="pointer-events-none absolute left-5 top-5 max-w-[24rem] font-mono text-[0.68rem] font-black uppercase leading-relaxed tracking-[0.13em] text-ink/62">
            drag to rotate · dots mark evidence anchors · frequency is background signal only
          </div>
          <div className="pointer-events-none absolute bottom-5 left-5 right-5 grid gap-2 font-mono text-[0.58rem] font-black uppercase tracking-[0.14em] text-ink/54 sm:grid-cols-4">
            {domainRows.map(([domain, period, terms]) => (
              <div key={domain} className="border border-ink/35 bg-wheat/64 px-3 py-2">
                <p className="text-ink/80">{domain}</p>
                <p className="mt-1 text-ink/46">{period}</p>
                <p className="mt-1 text-ink/58">{terms}</p>
              </div>
            ))}
          </div>
        </div>

        <aside className="grid grid-rows-[auto_minmax(0,1fr)_auto] bg-wheat/52">
          <div className="border-b border-ink/60 px-5 py-4">
            <p className="font-mono text-[0.72rem] font-black uppercase tracking-[0.16em] text-ink/48">
              trajectory read
            </p>
            <p className="mt-3 font-mono text-[0.82rem] font-black uppercase leading-5 tracking-[0.12em] text-ink">
              early split · domain transfer · cautious spiral
            </p>
          </div>

          <div className="px-5 py-5">
            {activeItem ? (
              <div
                className="border bg-wheat/88 p-4"
                style={{ borderColor: activeItem.color, boxShadow: `inset 0 0 0 1px ${activeItem.color}22` }}
              >
                <p
                  className="font-mono text-[0.68rem] font-black uppercase tracking-[0.16em]"
                  style={{ color: activeItem.color }}
                >
                  {activeItem.year}
                  {"charge" in activeItem ? ` · charge ${activeItem.charge}` : " · direction"}
                </p>
                <h3 className="mt-3 text-xl font-black leading-none text-ink">{activeItem.label}</h3>
                <p className="mt-3 font-mono text-[0.72rem] font-black uppercase leading-5 tracking-[0.11em] text-ink/58">
                  {activeItem.domain}
                </p>
                <p className="mt-4 text-sm leading-6 text-ink/68">{activeItem.note}</p>
              </div>
            ) : (
              <div className="border border-ink/35 bg-wheat/54 p-4">
                <p className="font-mono text-[0.68rem] font-black uppercase tracking-[0.16em] text-ink/46">
                  hover an anchor
                </p>
                <p className="mt-3 text-sm leading-6 text-ink/62">
                  Hover any dot or arrow for term, period, domain, and direction.
                </p>
                <p className="mt-4 font-mono text-[0.58rem] font-black uppercase leading-4 tracking-[0.12em] text-ink/40">
                  red = high charge · black = structure / distance
                </p>
              </div>
            )}
          </div>

          <div className="border-t border-ink/60 px-5 py-4 font-mono text-[0.62rem] font-black uppercase leading-5 tracking-[0.14em] text-ink/52">
            evidence status: OED / direct Johnson still pending · absence claims ready · 1850-1900 mostly filled
          </div>
        </aside>
      </div>
    </section>
  );
}
