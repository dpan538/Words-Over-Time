"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

const INK = "#050510";
const FIRE = "#A1081F";
const RUST = "#B15825";
const MUTED = "#746B5A";

type RelationKind = "core" | "overlap" | "bridge" | "drift" | "contrast" | "extension";

type SemanticNode = {
  id: string;
  label: string;
  shortLabel: string;
  basin: string;
  relation: RelationKind;
  position: THREE.Vector3;
  color: string;
  radius: number;
  confidence: "high" | "medium";
  evidence: string;
  summary: string;
};

type RelationPath = {
  id: string;
  label: string;
  kind: RelationKind;
  color: string;
  opacity: number;
  nodeIds: string[];
  summary: string;
};

const semanticNodes: SemanticNode[] = [
  {
    id: "artificial",
    label: "artificial",
    shortLabel: "artificial",
    basin: "mobile center",
    relation: "core",
    position: new THREE.Vector3(0, 0, 0),
    color: INK,
    radius: 0.16,
    confidence: "high",
    evidence: "Round 01-04 relation matrix",
    summary: "Central term: not a fixed point, but a mobile word moving through made, synthetic, simulated, realistic, and fake-adjacent uses.",
  },
  {
    id: "made-constructed",
    label: "made / constructed",
    shortLabel: "made",
    basin: "made / constructed",
    relation: "overlap",
    position: new THREE.Vector3(0.78, -0.36, -0.44),
    color: INK,
    radius: 0.105,
    confidence: "high",
    evidence: "Definition boundary table; visual position candidates",
    summary: "The safest home basin: artificial overlaps with built, constructed, and manufactured without implying deception.",
  },
  {
    id: "synthetic",
    label: "synthetic",
    shortLabel: "synthetic",
    basin: "material production",
    relation: "overlap",
    position: new THREE.Vector3(1.86, -0.04, 0.68),
    color: RUST,
    radius: 0.12,
    confidence: "high",
    evidence: "Dictionary sources; Headcount label distinction; round 02 update",
    summary: "Close material neighbor: synthetic shares non-natural production but is narrower and more chemical/material than artificial.",
  },
  {
    id: "imitation",
    label: "imitation / substitute",
    shortLabel: "imitation",
    basin: "copy / substitute",
    relation: "bridge",
    position: new THREE.Vector3(0.72, 0.68, -0.96),
    color: FIRE,
    radius: 0.1,
    confidence: "medium",
    evidence: "Definition boundary table; artificial substitute baseline",
    summary: "Copy branch: imitation can approach fake, but it can also be an open substitute rather than deception.",
  },
  {
    id: "simulated",
    label: "simulated",
    shortLabel: "simulated",
    basin: "model / representation",
    relation: "bridge",
    position: new THREE.Vector3(1.08, 1.02, 0.32),
    color: FIRE,
    radius: 0.105,
    confidence: "high",
    evidence: "FCC 24-17; PubMed simulated microgravity and maxillectomy models",
    summary: "Representation basin: simulation is a modeling operation inside the artificial field, not a synonym for fake.",
  },
  {
    id: "realistic",
    label: "realistic",
    shortLabel: "realistic",
    basin: "appearance bridge",
    relation: "bridge",
    position: new THREE.Vector3(-0.58, 1.08, 0.76),
    color: FIRE,
    radius: 0.115,
    confidence: "high",
    evidence: "University of Oregon artificial skin; PubMed/NIH skin models; PLOS voice study",
    summary: "Bridge term: artificial things can become realistic without becoming real.",
  },
  {
    id: "fake-not-genuine",
    label: "fake / not genuine",
    shortLabel: "fake",
    basin: "deceptive status",
    relation: "drift",
    position: new THREE.Vector3(-0.36, -1.06, -0.86),
    color: FIRE,
    radius: 0.125,
    confidence: "high",
    evidence: "UBC real/fake vs natural/artificial distinction; artificial but not fake sources",
    summary: "Strong drift target, not a synonym. Artificial can move toward fake-adjacent uses, while still remaining separable from fake.",
  },
  {
    id: "counterfeit-sham",
    label: "counterfeit / sham / false",
    shortLabel: "counterfeit",
    basin: "deceptive edge",
    relation: "drift",
    position: new THREE.Vector3(-1.14, -1.18, -0.28),
    color: FIRE,
    radius: 0.085,
    confidence: "high",
    evidence: "Definition boundary table",
    summary: "Sharper fake edge: counterfeit and sham imply pretense or deception more directly than artificial.",
  },
  {
    id: "natural-real",
    label: "natural / real",
    shortLabel: "natural / real",
    basin: "origin / actuality contrast",
    relation: "contrast",
    position: new THREE.Vector3(-2.06, 0.42, 0.18),
    color: MUTED,
    radius: 0.11,
    confidence: "high",
    evidence: "Definition boundary table; natural / real contrast status",
    summary: "Contrast field: natural and real oppose artificial in origin and actuality, but real must stay separate from realistic.",
  },
  {
    id: "genuine-authentic",
    label: "genuine / authentic",
    shortLabel: "genuine",
    basin: "provenance / sincerity contrast",
    relation: "contrast",
    position: new THREE.Vector3(-1.88, -0.54, 0.82),
    color: MUTED,
    radius: 0.105,
    confidence: "high",
    evidence: "Definition boundary table; artificial manners contrast; World-Architects authenticity source",
    summary: "Provenance contrast: genuine and authentic are not just natural; they mark origin, sincerity, and trust.",
  },
  {
    id: "voice-skin",
    label: "artificial voice / skin",
    shortLabel: "voice / skin",
    basin: "embodied bridge",
    relation: "extension",
    position: new THREE.Vector3(1.82, 0.78, 1.16),
    color: INK,
    radius: 0.085,
    confidence: "high",
    evidence: "FCC artificial voice; PLOS voice clones; PubMed/NIH artificial skin",
    summary: "Embodied bridge cases: voice and skin show artificial moving through simulation, realism, and material construction at once.",
  },
];

const nodesById = new Map(semanticNodes.map((node) => [node.id, node]));

const relationPaths: RelationPath[] = [
  {
    id: "core-made-synthetic",
    label: "made core",
    kind: "overlap",
    color: INK,
    opacity: 0.74,
    nodeIds: ["artificial", "made-constructed", "synthetic", "voice-skin"],
    summary: "Artificial remains close to made, constructed, manufactured, and synthetic material production.",
  },
  {
    id: "simulation-realism",
    label: "simulation / realism bridge",
    kind: "bridge",
    color: FIRE,
    opacity: 0.72,
    nodeIds: ["artificial", "simulated", "realistic", "natural-real"],
    summary: "Artificial can model or resemble the real; realistic is a bridge, not the same as real.",
  },
  {
    id: "imitation-fake-drift",
    label: "imitation / fake drift",
    kind: "drift",
    color: FIRE,
    opacity: 0.58,
    nodeIds: ["artificial", "imitation", "fake-not-genuine", "counterfeit-sham", "genuine-authentic"],
    summary: "The copy branch can drift toward fake and not-genuine uses without collapsing the whole word into fake.",
  },
  {
    id: "contrast-field",
    label: "natural / genuine contrast",
    kind: "contrast",
    color: MUTED,
    opacity: 0.48,
    nodeIds: ["natural-real", "genuine-authentic", "fake-not-genuine", "realistic"],
    summary: "Natural, real, genuine, and authentic form contrast fields rather than one interchangeable opposite.",
  },
];

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

function makeTextSprite(text: string, options: { size?: number; color?: string; opacity?: number; weight?: string } = {}) {
  const size = options.size ?? 34;
  const textureScale = 2.25;
  const renderSize = size * textureScale;
  const padding = 16 * textureScale;
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) return new THREE.Sprite();

  context.font = `${options.weight ?? "800"} ${renderSize}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
  const metrics = context.measureText(text);
  canvas.width = Math.ceil(metrics.width + padding * 2);
  canvas.height = Math.ceil(renderSize * 1.48 + padding * 2);

  context.font = `${options.weight ?? "800"} ${renderSize}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
  context.fillStyle = options.color ?? INK;
  context.textBaseline = "middle";
  context.fillText(text, padding, canvas.height / 2);

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
  sprite.scale.set(canvas.width / textureScale / 180, canvas.height / textureScale / 180, 1);
  return sprite;
}

function makeLine(points: THREE.Vector3[], color = INK, opacity = 0.42) {
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({ color, transparent: true, opacity });
  return new THREE.Line(geometry, material);
}

function makeCurveFromNodes(nodeIds: string[], lift = 0.26) {
  const points = nodeIds.flatMap((id, index) => {
    const node = nodesById.get(id);
    if (!node) return [];
    const offset = new THREE.Vector3(
      Math.sin(index * 1.7) * 0.2,
      Math.cos(index * 1.15) * 0.16,
      Math.sin(index * 0.88) * lift * 1.48,
    );
    return [node.position.clone().add(offset)];
  });
  return new THREE.CatmullRomCurve3(points, true, "centripetal", 0.48);
}

function makeLissajousLoop({
  center,
  radiusX,
  radiusY,
  radiusZ,
  phase = 0,
  samples = 320,
}: {
  center: THREE.Vector3;
  radiusX: number;
  radiusY: number;
  radiusZ: number;
  phase?: number;
  samples?: number;
}) {
  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= samples; i += 1) {
    const t = (i / samples) * Math.PI * 2;
    points.push(
      new THREE.Vector3(
        center.x + Math.sin(t + phase) * radiusX + Math.sin(t * 3.0 + phase) * radiusX * 0.1,
        center.y + Math.sin(t * 2.0 + phase * 0.4) * radiusY,
        center.z + Math.cos(t * 2.35 + phase) * radiusZ,
      ),
    );
  }
  return points;
}

function makeAttractorStrand({
  phase,
  scale = 1,
  color,
  opacity,
}: {
  phase: number;
  scale?: number;
  color: string;
  opacity: number;
}) {
  const points: THREE.Vector3[] = [];
  const samples = 620;
  for (let i = 0; i <= samples; i += 1) {
    const t = (i / samples) * Math.PI * 8 + phase;
    const envelope = 0.84 + Math.sin(t * 0.23) * 0.22;
    points.push(
      new THREE.Vector3(
        (Math.sin(t) * 1.45 + Math.sin(t * 0.5) * 1.1) * scale * envelope,
        (Math.sin(t * 1.65) * 0.78 + Math.cos(t * 0.33) * 0.28) * scale,
        (Math.cos(t * 1.18) * 1.22 + Math.sin(t * 0.42) * 0.72) * scale,
      ),
    );
  }
  return makeLine(points, color, opacity);
}

function makeOrbitShell({
  center,
  radiusX,
  radiusY,
  radiusZ,
  color,
  opacity,
  phase = 0,
}: {
  center: THREE.Vector3;
  radiusX: number;
  radiusY: number;
  radiusZ: number;
  color: string;
  opacity: number;
  phase?: number;
}) {
  const group = new THREE.Group();
  group.add(makeLine(makeLissajousLoop({ center, radiusX, radiusY, radiusZ, phase }), color, opacity));
  group.add(makeLine(makeLissajousLoop({ center, radiusX: radiusX * 0.78, radiusY: radiusY * 1.12, radiusZ: radiusZ * 0.72, phase: phase + 1.28 }), color, opacity * 0.62));
  group.add(makeLine(makeLissajousLoop({ center, radiusX: radiusX * 0.54, radiusY: radiusY * 0.76, radiusZ: radiusZ * 1.18, phase: phase + 2.2 }), color, opacity * 0.5));
  return group;
}

function makeEllipseLine(radiusX: number, radiusY: number, color: string, opacity: number, samples = 180) {
  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= samples; i += 1) {
    const t = (i / samples) * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(t) * radiusX, Math.sin(t) * radiusY, 0));
  }
  return makeLine(points, color, opacity);
}

function makeBasinWell({
  center,
  radiusX,
  radiusY,
  color,
  opacity,
  rotation,
}: {
  center: THREE.Vector3;
  radiusX: number;
  radiusY: number;
  color: string;
  opacity: number;
  rotation: THREE.Euler;
}) {
  const group = new THREE.Group();
  group.position.copy(center);
  group.rotation.copy(rotation);

  const fill = new THREE.Mesh(
    new THREE.CircleGeometry(1, 96),
    new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  );
  fill.scale.set(radiusX, radiusY, 1);
  group.add(fill);

  group.add(makeEllipseLine(radiusX, radiusY, color, opacity * 7.2));
  group.add(makeEllipseLine(radiusX * 0.72, radiusY * 0.72, color, opacity * 4.6));
  group.add(makeEllipseLine(radiusX * 0.44, radiusY * 0.44, color, opacity * 3.2));

  for (let i = 0; i < 6; i += 1) {
    const t = (i / 6) * Math.PI * 2;
    group.add(
      makeLine(
        [
          new THREE.Vector3(Math.cos(t) * radiusX * 0.18, Math.sin(t) * radiusY * 0.18, 0),
          new THREE.Vector3(Math.cos(t) * radiusX, Math.sin(t) * radiusY, 0),
        ],
        color,
        opacity * 2.4,
      ),
    );
  }

  return group;
}

function relationLabel(kind: RelationKind) {
  if (kind === "core") return "central term";
  if (kind === "overlap") return "near overlap";
  if (kind === "bridge") return "bridge basin";
  if (kind === "drift") return "drift target";
  if (kind === "contrast") return "contrast field";
  return "outer extension";
}

export function ArtificialChart04BSemanticAttractor() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const selectedIdRef = useRef("artificial");
  const planeHintValueRef = useRef<string | null>(null);
  const sceneControlsRef = useRef<{ updateSelectedRing: (id: string) => void } | null>(null);
  const [selectedId, setSelectedId] = useState("artificial");
  const [planeHint, setPlaneHint] = useState<string | null>(null);
  const selectedNode = useMemo(
    () => semanticNodes.find((node) => node.id === selectedId) ?? semanticNodes[0],
    [selectedId],
  );

  useEffect(() => {
    selectedIdRef.current = selectedId;
    sceneControlsRef.current?.updateSelectedRing(selectedId);
  }, [selectedId]);

  useEffect(() => {
    if (!mountRef.current) return;
    const mountElement = mountRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(33, 1, 0.1, 80);
    camera.position.set(0, 0.18, 7.65);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.5));
    renderer.domElement.className = "h-full w-full cursor-grab active:cursor-grabbing";
    mountElement.appendChild(renderer.domElement);

    const root = new THREE.Group();
    root.rotation.x = -0.22;
    root.rotation.y = -0.52;
    root.rotation.z = 0.02;
    root.position.y = 0.03;
    root.scale.setScalar(1.04);
    scene.add(root);
    scene.add(new THREE.AmbientLight(0xffffff, 1));

    const raycaster = new THREE.Raycaster();
    raycaster.params.Points = { threshold: 0.05 };
    const pointer = new THREE.Vector2();
    const hitTargets: THREE.Object3D[] = [];
    const basinTargets: THREE.Object3D[] = [];
    const nodeByUuid = new Map<string, SemanticNode>();
    const nodeMeshes = new Map<string, THREE.Mesh>();
    const nodeMaterials = new Map<string, THREE.MeshBasicMaterial>();
    const setPlaneHintIfChanged = (next: string | null) => {
      if (planeHintValueRef.current === next) return;
      planeHintValueRef.current = next;
      setPlaneHint(next);
    };
    const addBasin = (basin: THREE.Group, hint: string) => {
      basin.traverse((child) => {
        const item = child as THREE.Mesh & { isMesh?: boolean };
        if (!item.isMesh) return;
        item.userData.basinHint = hint;
        basinTargets.push(item);
      });
      root.add(basin);
    };

    const activeRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.16, 0.006, 8, 72),
      new THREE.MeshBasicMaterial({ color: FIRE, transparent: true, opacity: 0.72, depthWrite: false }),
    );
    activeRing.visible = false;
    root.add(activeRing);

    const coreAxes = new THREE.Group();
    coreAxes.add(makeLine([new THREE.Vector3(-2.8, 0, 0), new THREE.Vector3(2.45, 0, 0)], INK, 0.56));
    coreAxes.add(makeLine([new THREE.Vector3(0, -1.6, 0), new THREE.Vector3(0, 1.54, 0)], INK, 0.46));
    coreAxes.add(makeLine([new THREE.Vector3(0, 0, -1.6), new THREE.Vector3(0, 0, 1.6)], FIRE, 0.42));
    coreAxes.add(makeLine([new THREE.Vector3(-2.4, -1.24, -1.0), new THREE.Vector3(2.2, 1.34, 1.0)], INK, 0.18));
    coreAxes.add(makeLine([new THREE.Vector3(-2.32, 1.2, 0.92), new THREE.Vector3(2.1, -1.12, -0.9)], FIRE, 0.18));
    coreAxes.add(makeLine([new THREE.Vector3(-2.62, 0.86, -0.78), new THREE.Vector3(2.18, -0.7, 0.78)], INK, 0.14));
    coreAxes.add(makeLine([new THREE.Vector3(-2.4, -0.9, 0.8), new THREE.Vector3(2.24, 0.94, -0.7)], INK, 0.14));
    coreAxes.add(makeLine([new THREE.Vector3(-2.24, 0.58, -1.24), new THREE.Vector3(2.34, 0.72, 1.24)], INK, 0.16));
    coreAxes.add(makeLine([new THREE.Vector3(-2.08, -0.62, 1.18), new THREE.Vector3(2.18, -0.54, -1.22)], FIRE, 0.14));
    root.add(coreAxes);

    addBasin(
      makeBasinWell({
        center: new THREE.Vector3(1.1, -0.2, 0.18),
        radiusX: 1.22,
        radiusY: 0.44,
        color: INK,
        opacity: 0.032,
        rotation: new THREE.Euler(0.18, -0.6, -0.1),
      }),
      "Black plane: made, constructed, and synthetic meanings sit closest to artificial.",
    );
    addBasin(
      makeBasinWell({
        center: new THREE.Vector3(0.48, 0.9, 0.38),
        radiusX: 1.18,
        radiusY: 0.36,
        color: FIRE,
        opacity: 0.036,
        rotation: new THREE.Euler(-0.24, 0.52, 0.34),
      }),
      "Red upper plane: simulation and realistic resemblance bridge artificial toward representation.",
    );
    addBasin(
      makeBasinWell({
        center: new THREE.Vector3(-0.78, -0.92, -0.48),
        radiusX: 0.92,
        radiusY: 0.34,
        color: FIRE,
        opacity: 0.032,
        rotation: new THREE.Euler(0.36, -0.36, -0.58),
      }),
      "Red lower plane: imitation and counterfeit form the fake-adjacent drift edge.",
    );
    addBasin(
      makeBasinWell({
        center: new THREE.Vector3(-1.98, -0.04, 0.46),
        radiusX: 0.72,
        radiusY: 0.34,
        color: MUTED,
        opacity: 0.034,
        rotation: new THREE.Euler(-0.14, 0.42, 0.18),
      }),
      "Grey plane: natural, real, genuine, and authentic are contrast fields, not synonyms.",
    );

    const artificialPosition = nodesById.get("artificial")?.position ?? new THREE.Vector3(0, 0, 0);
    for (const node of semanticNodes) {
      if (node.id === "artificial") continue;
      root.add(makeLine([artificialPosition, node.position], node.color, node.relation === "contrast" ? 0.12 : 0.16));
    }

    root.add(makeOrbitShell({ center: new THREE.Vector3(0.42, 0.02, 0.06), radiusX: 1.6, radiusY: 0.78, radiusZ: 1.48, color: INK, opacity: 0.34, phase: 0.2 }));
    root.add(makeOrbitShell({ center: new THREE.Vector3(0.55, 0.76, 0.42), radiusX: 1.52, radiusY: 0.56, radiusZ: 1.22, color: FIRE, opacity: 0.28, phase: 1.1 }));
    root.add(makeOrbitShell({ center: new THREE.Vector3(-0.62, -0.68, -0.46), radiusX: 1.1, radiusY: 0.58, radiusZ: 1.1, color: FIRE, opacity: 0.25, phase: 2.4 }));
    root.add(makeOrbitShell({ center: new THREE.Vector3(-1.86, -0.05, 0.46), radiusX: 0.7, radiusY: 0.74, radiusZ: 0.78, color: MUTED, opacity: 0.3, phase: 0.9 }));

    for (const strand of [
      makeAttractorStrand({ phase: 0.3, scale: 1.05, color: INK, opacity: 0.16 }),
      makeAttractorStrand({ phase: 1.8, scale: 0.94, color: INK, opacity: 0.11 }),
      makeAttractorStrand({ phase: 2.7, scale: 0.82, color: FIRE, opacity: 0.1 }),
      makeAttractorStrand({ phase: 4.2, scale: 0.72, color: MUTED, opacity: 0.08 }),
    ]) {
      root.add(strand);
    }

    for (const path of relationPaths) {
      const curve = makeCurveFromNodes(path.nodeIds, path.kind === "bridge" ? 0.78 : 0.42);
      const line = makeLine(curve.getPoints(280), path.color, path.opacity);
      root.add(line);
      const tube = new THREE.Mesh(
        new THREE.TubeGeometry(curve, 180, path.kind === "bridge" ? 0.01 : 0.007, 8, true),
        new THREE.MeshBasicMaterial({
          color: path.color,
          transparent: true,
          opacity: path.opacity * 0.1,
          depthWrite: false,
        }),
      );
      root.add(tube);
    }

    for (const path of relationPaths) {
      const pathNodes = path.nodeIds.map((id) => nodesById.get(id)).filter(Boolean) as SemanticNode[];
      for (let i = 0; i < pathNodes.length; i += 1) {
        const source = pathNodes[i];
        const target = pathNodes[(i + 1) % pathNodes.length];
        root.add(makeLine([source.position, target.position], path.color, path.kind === "contrast" ? 0.12 : 0.16));
      }
    }

    for (const node of semanticNodes) {
      const visualRadius = node.radius * 0.58;
      const geometry = new THREE.SphereGeometry(visualRadius, 24, 24);
      const material = new THREE.MeshBasicMaterial({
        color: node.color,
        transparent: true,
        opacity: node.relation === "contrast" ? 0.62 : 0.9,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.copy(node.position);
      root.add(mesh);
      hitTargets.push(mesh);
      nodeByUuid.set(mesh.uuid, node);
      nodeMeshes.set(node.id, mesh);
      nodeMaterials.set(node.id, material);

      const hit = new THREE.Mesh(
        new THREE.SphereGeometry(visualRadius + 0.055, 12, 12),
        new THREE.MeshBasicMaterial({ color: node.color, transparent: true, opacity: 0, depthWrite: false }),
      );
      hit.position.copy(node.position);
      root.add(hit);
      hitTargets.push(hit);
      nodeByUuid.set(hit.uuid, node);

      if (
        node.id === "artificial" ||
        node.id === "made-constructed" ||
        node.id === "synthetic" ||
        node.relation === "bridge" ||
        node.relation === "drift" ||
        node.relation === "contrast"
      ) {
        const label = makeTextSprite(node.shortLabel, {
          size: node.id === "artificial" ? 27 : 15,
          color: node.color,
          opacity: node.id === "artificial" ? 0.96 : 0.82,
          weight: "900",
        });
        label.position.copy(node.position.clone().add(new THREE.Vector3(node.position.x >= 0 ? 0.1 : -0.14, node.position.y >= 0 ? 0.12 : -0.12, 0.06)));
        root.add(label);
      }
    }

    const updateSelectedRing = (id: string) => {
      const node = nodesById.get(id);
      if (!node) {
        activeRing.visible = false;
        return;
      }
      activeRing.visible = true;
      activeRing.position.copy(node.position);
      activeRing.scale.setScalar(0.66 + node.radius * 1.6);
      const material = activeRing.material as THREE.MeshBasicMaterial;
      material.color.set(node.color);
      for (const [nodeId, materialItem] of nodeMaterials.entries()) {
        materialItem.opacity = nodeId === id ? 1 : nodesById.get(nodeId)?.relation === "contrast" ? 0.48 : 0.76;
      }
    };
    sceneControlsRef.current = { updateSelectedRing };
    updateSelectedRing(selectedIdRef.current);

    let width = 1;
    let height = 1;
    const resize = () => {
      const rect = mountElement.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      const narrow = width < 720;
      camera.position.z = narrow ? 11 : 8.35;
      root.scale.setScalar(narrow ? 0.86 : 1.1);
      root.position.y = narrow ? -0.08 : -0.1;
      camera.aspect = width / height;
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
    let targetRotationY = root.rotation.y;
    let targetRotationX = root.rotation.x;

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

    const hitBasin = () => {
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(basinTargets, false)[0];
      return (hit?.object.userData.basinHint as string | undefined) ?? null;
    };

    const pointerDown = (event: PointerEvent) => {
      dragging = true;
      pointerMoved = false;
      setPlaneHintIfChanged(null);
      previousX = event.clientX;
      previousY = event.clientY;
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
        if (Math.abs(dx) + Math.abs(dy) > 2) pointerMoved = true;
        targetRotationY += dx * 0.006;
        targetRotationX = THREE.MathUtils.clamp(targetRotationX + dy * 0.004, -0.76, 0.48);
        return;
      }
      const node = hitNode();
      if (node) {
        setPlaneHintIfChanged(null);
        renderer.domElement.style.cursor = "pointer";
        return;
      }
      const basinHint = hitBasin();
      setPlaneHintIfChanged(basinHint);
      renderer.domElement.style.cursor = basinHint ? "help" : "grab";
    };

    const pointerUp = (event: PointerEvent) => {
      updatePointer(event);
      if (!pointerMoved) {
        const node = hitNode();
        if (node) {
          setSelectedId(node.id);
          selectedIdRef.current = node.id;
          updateSelectedRing(node.id);
        }
      }
      dragging = false;
      if (renderer.domElement.hasPointerCapture(event.pointerId)) {
        renderer.domElement.releasePointerCapture(event.pointerId);
      }
    };

    const pointerLeave = () => {
      dragging = false;
      setPlaneHintIfChanged(null);
      renderer.domElement.style.cursor = "grab";
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

    let frame = 0;
    let raf = 0;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      if (!sceneVisible) return;
      frame += 0.01;
      root.rotation.y += (targetRotationY - root.rotation.y) * 0.08;
      root.rotation.x += (targetRotationX - root.rotation.x) * 0.08;
      activeRing.lookAt(camera.position);
      activeRing.rotation.z += 0.012;
      const activeNode = nodesById.get(selectedIdRef.current);
      if (activeNode) {
        const mesh = nodeMeshes.get(activeNode.id);
        if (mesh) mesh.scale.setScalar(1);
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
      sceneControlsRef.current = null;
      planeHintValueRef.current = null;
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
        <h2 className="mt-1 text-2xl font-black leading-none">Artificial semantic attractor field</h2>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-5">
          <p className="font-mono text-[0.62rem] font-black uppercase tracking-[0.16em] text-ink/58">
            semantic distance · attractor basins
          </p>
          <div className="flex flex-wrap items-center gap-5 font-mono text-[0.62rem] font-black uppercase tracking-[0.16em] text-ink">
            <span className="inline-flex items-center gap-2.5">
              <span className="h-3.5 w-3.5 rounded-full bg-ink" />
              overlap
            </span>
            <span className="inline-flex items-center gap-2.5">
              <span className="h-3.5 w-3.5 rounded-full bg-fire" />
              bridge / drift
            </span>
            <span className="inline-flex items-center gap-2.5">
              <span className="h-3.5 w-3.5 rounded-full border border-ink/55" />
              contrast
            </span>
          </div>
        </div>
      </div>

      <div className="grid border-b border-ink/80 lg:h-[800px] lg:grid-cols-[28rem_minmax(0,1fr)]">
        <aside className="grid min-h-[720px] grid-rows-[minmax(0,1fr)] border-b border-ink/60 bg-wheat/52 lg:min-h-0 lg:border-b-0 lg:border-r">
          <div className="grid h-full min-h-0 grid-rows-[18rem_minmax(0,1fr)] gap-4 px-6 py-5">
            <div
              className="h-full overflow-hidden border bg-wheat/88 p-4"
              style={{
                borderColor: selectedNode.color,
                boxShadow: `inset 0 0 0 1px ${selectedNode.color}22`,
              }}
            >
              <p
                className="font-mono text-[0.68rem] font-black uppercase tracking-[0.16em]"
                style={{ color: selectedNode.color }}
              >
                {relationLabel(selectedNode.relation)} · {selectedNode.confidence} confidence
              </p>
              <h3 className="mt-3 text-xl font-black leading-none text-ink">{selectedNode.label}</h3>
              <p className="mt-3 font-mono text-[0.72rem] font-black uppercase leading-5 tracking-[0.11em] text-ink/58">
                {selectedNode.basin}
              </p>
              <p
                className="mt-4 overflow-hidden text-sm leading-6 text-ink/70"
                style={{ display: "-webkit-box", WebkitBoxOrient: "vertical", WebkitLineClamp: 3 }}
              >
                {selectedNode.summary}
              </p>
              <p className="mt-4 border-t border-ink/25 pt-3 font-mono text-[0.56rem] font-black uppercase leading-4 tracking-[0.12em] text-ink/42">
                Evidence: {selectedNode.evidence}
              </p>
            </div>

            <div className="grid h-full min-h-0 grid-cols-2 grid-rows-6 gap-2.5">
              {semanticNodes.map((node) => (
                <button
                  key={node.id}
                  type="button"
                  onClick={() => setSelectedId(node.id)}
                  className="grid h-full min-h-0 grid-cols-[1.1rem_1fr] items-center gap-4 overflow-hidden border border-ink/18 bg-wheat/38 px-4 text-left font-mono text-[0.9rem] font-black uppercase leading-6 tracking-[0.1em] transition hover:border-ink/60"
                  style={{
                    borderColor: selectedId === node.id ? node.color : undefined,
                    color: selectedId === node.id ? node.color : undefined,
                  }}
                >
                  <span className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: node.color }} />
                  <span>{node.shortLabel}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        <div className="relative min-h-[720px] overflow-hidden lg:min-h-0">
          <div className="pointer-events-none absolute inset-0 opacity-[0.18] [background-image:linear-gradient(90deg,rgba(5,5,16,0.42)_1px,transparent_1px),linear-gradient(180deg,rgba(5,5,16,0.32)_1px,transparent_1px)] [background-size:54px_54px]" />
          <div ref={mountRef} className="absolute inset-0" aria-label="Artificial semantic attractor field" />
          <div className="pointer-events-none absolute left-5 top-5 max-w-[30rem] font-mono text-[0.68rem] font-black uppercase leading-relaxed tracking-[0.13em] text-ink/62">
            drag to rotate · click an anchor · hover only previews
          </div>
          <div
            className={`pointer-events-none absolute right-5 top-5 w-[17.5rem] border border-ink/24 bg-wheat/90 px-3 py-2 transition-opacity duration-150 ${
              planeHint ? "opacity-100" : "opacity-0"
            }`}
          >
            <p className="font-mono text-[0.68rem] font-black uppercase leading-[1.35] tracking-[0.13em] text-ink/64">
              colored plane
            </p>
            <p className="mt-1 text-xs leading-4 text-ink/66">
              {planeHint}
            </p>
          </div>
          <div className="pointer-events-none absolute bottom-5 left-5 right-5 grid gap-2 border border-ink/24 bg-wheat/82 p-3.5 font-mono text-ink/62 sm:grid-cols-3">
            <div>
              <p className="text-[0.72rem] font-black uppercase leading-5 tracking-[0.095em]">origin axis</p>
              <p className="mt-1 text-[0.62rem] font-black uppercase leading-4 tracking-[0.1em] text-ink/48">
                natural / real ↔ made / synthetic
              </p>
            </div>
            <div>
              <p className="text-[0.72rem] font-black uppercase leading-5 tracking-[0.095em]">status axis</p>
              <p className="mt-1 text-[0.62rem] font-black uppercase leading-4 tracking-[0.1em] text-ink/48">
                genuine/authentic ↔ fake edge
              </p>
            </div>
            <div>
              <p className="text-[0.72rem] font-black uppercase leading-5 tracking-[0.095em]">depth axis</p>
              <p className="mt-1 text-[0.62rem] font-black uppercase leading-4 tracking-[0.1em] text-ink/48">
                simulated ↔ realistic representation
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
