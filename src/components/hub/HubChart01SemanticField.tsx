"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent } from "react";
import * as THREE from "three";

export type HubChart01Query = {
  query: string;
  meanValue: number;
};

export type HubChart01PeriodSignal = {
  periodId: string;
  periodLabel: string;
  score: number;
  normalizedScore: number;
  rank: number;
  status?: string;
  mainQueries: HubChart01Query[];
};

export type HubChart01Layer = {
  id: string;
  layerNumber: string;
  label: string;
  semanticGroups: string[];
  periodHint: string;
  summary: string;
  color: string;
  accentColor: string;
  earlyScore: number;
  modernScore: number;
  peakScore: number;
  normalizedPeak: number;
  modernRank: number;
  modernStatus: string;
  queryLabels: HubChart01Query[];
  periods: HubChart01PeriodSignal[];
};

export type HubChart01Evidence = {
  label: string;
  value: string;
  note: string;
};

export type HubChart01FieldData = {
  title: string;
  subtitle: string;
  generatedAt: string;
  sourceSummary: string;
  layers: HubChart01Layer[];
  evidence: HubChart01Evidence[];
  cautions: string[];
};

type HubChart01SemanticFieldProps = {
  data: HubChart01FieldData;
};

const INK = "#050510";
const WHEAT = "#F5ECD2";
const AMETHYST = "#0D0630";
const TEAL = "#8BBEB2";
const SUN = "#FBB728";
const GRAPHITE = "#57534B";

function hexToNumber(hex: string) {
  return Number.parseInt(hex.replace("#", ""), 16);
}

function disposeMaterial(material: THREE.Material) {
  const materialWithMap = material as THREE.Material & { map?: THREE.Texture };
  materialWithMap.map?.dispose();
  material.dispose();
}

function disposeObject(object: THREE.Object3D) {
  object.traverse((child) => {
    const disposable = child as THREE.Object3D & {
      geometry?: THREE.BufferGeometry;
      material?: THREE.Material | THREE.Material[];
    };
    disposable.geometry?.dispose();
    if (Array.isArray(disposable.material)) {
      disposable.material.forEach(disposeMaterial);
    } else if (disposable.material) {
      disposeMaterial(disposable.material);
    }
  });
}

function ellipsePoints(radiusX: number, radiusY: number, segments = 128) {
  const points: THREE.Vector3[] = [];
  for (let index = 0; index <= segments; index += 1) {
    const angle = (index / segments) * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(angle) * radiusX, Math.sin(angle) * radiusY, 0));
  }
  return points;
}

function makeEllipseLine(radiusX: number, radiusY: number, color: string, opacity: number) {
  const geometry = new THREE.BufferGeometry().setFromPoints(ellipsePoints(radiusX, radiusY));
  const material = new THREE.LineBasicMaterial({
    color: hexToNumber(color),
    transparent: true,
    opacity,
  });
  return new THREE.Line(geometry, material);
}

function makeLine(points: THREE.Vector3[], color: string, opacity: number) {
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({
    color: hexToNumber(color),
    transparent: true,
    opacity,
  });
  return new THREE.Line(geometry, material);
}

function makeTube(curve: THREE.Curve<THREE.Vector3>, color: string, opacity: number, radius = 0.016) {
  const geometry = new THREE.TubeGeometry(curve, 140, radius, 8, false);
  const material = new THREE.MeshBasicMaterial({
    color: hexToNumber(color),
    transparent: true,
    opacity,
    depthWrite: false,
  });
  return new THREE.Mesh(geometry, material);
}

function makeTextSprite(
  label: string,
  options: {
    color?: string;
    background?: string;
    fontSize?: number;
    fontWeight?: string;
    fontFamily?: string;
    align?: CanvasTextAlign;
    width?: number;
    height?: number;
    scale?: [number, number];
    uppercase?: boolean;
    opacity?: number;
  } = {},
) {
  const canvas = document.createElement("canvas");
  canvas.width = options.width ?? 640;
  canvas.height = options.height ?? 120;
  const context = canvas.getContext("2d");
  if (!context) return new THREE.Sprite();

  context.clearRect(0, 0, canvas.width, canvas.height);
  if (options.background) {
    context.fillStyle = options.background;
    context.fillRect(0, 0, canvas.width, canvas.height);
  }
  context.font = `${options.fontWeight ?? "800"} ${options.fontSize ?? 44}px ${
    options.fontFamily ?? "Helvetica Neue, Helvetica, Arial, sans-serif"
  }`;
  context.textAlign = options.align ?? "center";
  context.textBaseline = "middle";
  const text = options.uppercase === false ? label : label.toUpperCase();
  context.fillStyle = options.color ?? WHEAT;
  context.fillText(text, canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
    opacity: options.opacity ?? 1,
  });
  const sprite = new THREE.Sprite(material);
  const [scaleX, scaleY] = options.scale ?? [1.8, 0.34];
  sprite.scale.set(scaleX, scaleY, 1);
  return sprite;
}

function layerY(index: number, count: number) {
  return (index - (count - 1) / 2) * 1.12;
}

function layerX() {
  return 0;
}

function layerZ() {
  return 0;
}

function isSunLayer(layer: HubChart01Layer) {
  return layer.color.toLowerCase() === SUN.toLowerCase();
}

function queryLabelColor(layer: HubChart01Layer) {
  return isSunLayer(layer) ? WHEAT : SUN;
}

function makeLayerDisc(
  layer: HubChart01Layer,
  index: number,
  count: number,
  isActive: boolean,
  isDimmed: boolean,
) {
  const group = new THREE.Group();
  const center = new THREE.Vector3(layerX(), layerY(index, count), layerZ());
  group.position.copy(center);
  group.rotation.x = -Math.PI / 2;
  group.rotation.z = 0;

  const displayBoost = [0.32, 0.08, 0.24, 0.02, 0.26][index] ?? 0;
  const radius = 0.82 + layer.normalizedPeak * 0.52 + displayBoost;
  const focus = isDimmed ? 0.07 : 1;
  const opacity = (isActive ? 0.66 : 0.31 + layer.normalizedPeak * 0.09) * focus;

  const washGeometry = new THREE.CircleGeometry(1, 128);
  const washMaterial = new THREE.MeshBasicMaterial({
    color: hexToNumber(layer.color),
    transparent: true,
    opacity: opacity * 0.36,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const wash = new THREE.Mesh(washGeometry, washMaterial);
  wash.scale.set(radius * 1.18, radius * 1.18, 1);
  wash.position.z = -0.02;
  group.add(wash);

  const geometry = new THREE.CircleGeometry(1, 128);
  const material = new THREE.MeshBasicMaterial({
    color: hexToNumber(layer.color),
    transparent: true,
    opacity,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const disc = new THREE.Mesh(geometry, material);
  disc.scale.set(radius, radius, 1);
  disc.userData = { layerId: layer.id, label: layer.label };
  group.add(disc);

  const lowerRim = makeEllipseLine(radius * 1.03, radius * 1.03, TEAL, (isActive ? 0.24 : 0.14) * focus);
  lowerRim.position.z = -0.075;
  group.add(lowerRim);

  const outline = makeEllipseLine(radius * 1.05, radius * 1.05, isActive ? SUN : TEAL, (isActive ? 0.62 : 0.22) * focus);
  outline.position.z = 0.075;
  group.add(outline);

  const inner = makeEllipseLine(radius * 0.26, radius * 0.26, SUN, (isActive ? 0.46 : 0.24) * focus);
  inner.position.z = 0.098;
  group.add(inner);

  const coreGeometry = new THREE.SphereGeometry(0.06 + layer.normalizedPeak * 0.1, 24, 24);
  const coreMaterial = new THREE.MeshBasicMaterial({
    color: hexToNumber(isActive && isSunLayer(layer) ? AMETHYST : isActive ? SUN : layer.accentColor),
    transparent: true,
    opacity: (isActive ? 0.95 : 0.78) * focus,
  });
  const core = new THREE.Mesh(coreGeometry, coreMaterial);
  core.position.set(0, 0, 0.035);
  core.userData = { layerId: layer.id, label: layer.label };
  group.add(core);

  return { group, center, radius };
}

function addMechanicalSpokes(group: THREE.Group, radius: number, opacityFactor: number) {
  for (let index = 0; index < 92; index += 1) {
    const angle = (index / 92) * Math.PI * 2;
    const lengthJitter = 0.76 + ((index * 19) % 31) / 100;
    const end = new THREE.Vector3(
      Math.cos(angle) * radius * lengthJitter,
      Math.sin(angle) * radius * (0.84 + ((index * 7) % 18) / 100),
      0.04,
    );
    group.add(makeLine(
      [new THREE.Vector3(0, 0, 0.055), end],
      index % 3 === 0 ? SUN : TEAL,
      (index % 3 === 0 ? 0.18 : 0.12) * opacityFactor,
    ));
  }
}

function addQueryParticles(
  group: THREE.Group,
  layer: HubChart01Layer,
  radius: number,
  hitTargets: THREE.Object3D[],
  isDimmed: boolean,
) {
  const queries = layer.queryLabels.slice(0, 7);
  const maxMean = Math.max(...queries.map((query) => query.meanValue), 0.000001);
  const focus = isDimmed ? 0.06 : 1;
  queries.forEach((query, index) => {
    const angle = -Math.PI * 0.82 + (index / Math.max(queries.length - 1, 1)) * Math.PI * 1.64;
    const jitter = index % 2 === 0 ? 0.08 : -0.05;
    const x = Math.cos(angle) * radius * (0.46 + jitter);
    const y = Math.sin(angle) * radius * (0.68 - jitter * 0.3);
    const normalized = Math.sqrt(query.meanValue / maxMean);
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.034 + normalized * 0.05, 18, 18),
      new THREE.MeshBasicMaterial({
        color: hexToNumber(layer.accentColor),
        transparent: true,
        opacity: (0.66 + normalized * 0.26) * focus,
      }),
    );
    sphere.position.set(x, y, 0.09);
    sphere.userData = { layerId: layer.id, label: query.query };
    group.add(sphere);
    hitTargets.push(sphere);

    const connector = makeLine([new THREE.Vector3(0, 0, 0.05), new THREE.Vector3(x, y, 0.072)], layer.accentColor, 0.16 * focus);
    group.add(connector);

    if (index < 4 && !isDimmed) {
      const label = makeTextSprite(query.query, {
        color: queryLabelColor(layer),
        fontSize: 44,
        fontFamily: "Georgia, Times New Roman, serif",
        fontWeight: "700",
        width: 720,
        height: 128,
        scale: [1.43, 0.25],
        uppercase: false,
      });
      label.position.set(x + (x > 0 ? 0.5 : -0.5), y + 0.12, 0.14);
      group.add(label);
    }
  });
}

function addRoutingCurves(group: THREE.Group, radius: number, color: string, opacityFactor: number) {
  const anchors = [
    [new THREE.Vector3(-radius * 0.78, -radius * 0.2, 0.09), new THREE.Vector3(0, radius * 0.42, 0.18), new THREE.Vector3(radius * 0.76, -radius * 0.1, 0.09)],
    [new THREE.Vector3(-radius * 0.48, radius * 0.55, 0.09), new THREE.Vector3(radius * 0.08, -radius * 0.36, 0.16), new THREE.Vector3(radius * 0.62, radius * 0.42, 0.09)],
  ];
  anchors.forEach(([from, mid, to], index) => {
    const curve = new THREE.QuadraticBezierCurve3(from, mid, to);
    group.add(makeTube(curve, color, (index === 0 ? 0.38 : 0.24) * opacityFactor, 0.008));
  });
}

function buildScene(
  scene: THREE.Scene,
  root: THREE.Group,
  data: HubChart01FieldData,
  activeLayerId: string | null,
  hitTargets: THREE.Object3D[],
) {
  const count = data.layers.length;
  const centers = data.layers.map((_, index) => new THREE.Vector3(layerX(), layerY(index, count), layerZ()));
  const hasSelection = activeLayerId !== null;

  const drawLayers = hasSelection
    ? [
        ...data.layers.map((layer, index) => ({ layer, index })).filter((item) => item.layer.id !== activeLayerId),
        ...data.layers.map((layer, index) => ({ layer, index })).filter((item) => item.layer.id === activeLayerId),
      ]
    : data.layers.map((layer, index) => ({ layer, index }));

  drawLayers.forEach(({ layer, index }) => {
    const isActive = layer.id === activeLayerId;
    const isDimmed = hasSelection && !isActive;
    const opacityFactor = isDimmed ? 0.06 : 1;
    const { group, center, radius } = makeLayerDisc(layer, index, count, isActive, isDimmed);
    centers[index] = center.clone();

    if (layer.id === "mechanical_core") {
      addMechanicalSpokes(group, radius, opacityFactor);
    }
    if (layer.id === "transport_routing" || layer.id === "network_system") {
      addRoutingCurves(group, radius, layer.accentColor, opacityFactor);
    }
    if (layer.id === "institutional_digital") {
      for (let dot = 0; dot < 38; dot += 1) {
        const angle = (dot / 38) * Math.PI * 2;
        const dist = 0.2 + ((dot * 17) % 100) / 100;
        const cloud = new THREE.Mesh(
          new THREE.SphereGeometry(0.012 + (dot % 5) * 0.003, 10, 10),
          new THREE.MeshBasicMaterial({
            color: hexToNumber(dot % 3 === 0 ? SUN : TEAL),
            transparent: true,
            opacity: (0.18 + (dot % 4) * 0.05) * opacityFactor,
          }),
        );
        cloud.position.set(Math.cos(angle) * radius * dist * 0.76, Math.sin(angle) * radius * dist, 0.08 + (dot % 3) * 0.018);
        group.add(cloud);
      }
    }

    addQueryParticles(group, layer, radius, hitTargets, isDimmed);

    const label = makeTextSprite(layer.layerNumber, {
      color: isActive ? SUN : WHEAT,
      fontSize: 48,
      fontFamily: "Georgia, Times New Roman, serif",
      fontWeight: "700",
      width: 420,
      height: 128,
      scale: [1.11, 0.34],
      uppercase: false,
      opacity: isDimmed ? 0 : 0.9,
    });
    label.position.set(-radius * 0.18, radius + 0.3, 0.15);
    group.add(label);

    const period = makeTextSprite(layer.periodHint, {
      color: index === 0 ? SUN : TEAL,
      fontSize: 36,
      fontFamily: "Georgia, Times New Roman, serif",
      fontWeight: "600",
      width: 760,
      height: 116,
      scale: [1.87, 0.29],
      uppercase: false,
      opacity: isDimmed ? 0 : 0.74,
    });
    period.position.set(radius * 0.46, -radius - 0.18, 0.14);
    group.add(period);

    root.add(group);
    hitTargets.push(group.children[0]);
  });

  const axisCurve = new THREE.LineCurve3(centers[0].clone(), centers[centers.length - 1].clone());
  root.add(makeTube(axisCurve, SUN, hasSelection ? 0.78 : 0.66, 0.018));

  scene.add(root);
}

function statusLabel(status: string) {
  return status
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(" ");
}

function peakPeriodLabel(layer: HubChart01Layer) {
  const peak = layer.periods.reduce<HubChart01PeriodSignal | null>((winner, period) => {
    if (!winner || period.score > winner.score) return period;
    return winner;
  }, null);
  return peak?.periodLabel ?? layer.periodHint;
}

function currentRoleText(layer: HubChart01Layer) {
  if (layer.id === "mechanical_core") return "Still present, less dominant";
  if (layer.id === "central_place") return "Metaphor bridge";
  if (layer.id === "transport_routing") return "Route and transfer layer";
  if (layer.id === "network_system") return "Technical node layer";
  if (layer.id === "institutional_digital") return "Most visible modern layer";
  return statusLabel(layer.modernStatus);
}

function overviewQueries(layers: HubChart01Layer[]) {
  return layers
    .flatMap((layer) => layer.queryLabels.slice(0, 2))
    .filter((query, index, queries) => queries.findIndex((item) => item.query === query.query) === index)
    .slice(0, 8);
}

export function HubChart01SemanticField({ data }: HubChart01SemanticFieldProps) {
  const [activeLayerId, setActiveLayerId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rootRef = useRef<THREE.Group | null>(null);
  const hitTargetsRef = useRef<THREE.Object3D[]>([]);
  const renderRef = useRef<(() => void) | null>(null);
  const dragRef = useRef({ active: false, lastX: 0 });
  const rotationRef = useRef({ y: -0.28 });

  const activeLayer = useMemo(
    () => data.layers.find((layer) => layer.id === activeLayerId) ?? null,
    [activeLayerId, data.layers],
  );
  const modernLeader = useMemo(
    () => data.layers.reduce<HubChart01Layer | null>((leader, layer) => {
      if (!leader || layer.modernRank < leader.modernRank) return layer;
      return leader;
    }, null),
    [data.layers],
  );
  const mechanicalLayer = data.layers.find((layer) => layer.id === "mechanical_core");
  const queryLabels = activeLayer ? activeLayer.queryLabels.slice(0, 6) : overviewQueries(data.layers);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    } catch {
      return undefined;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(hexToNumber(AMETHYST), 8, 18);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 80);
    camera.position.set(0, 5.55, 6.0);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    scene.add(new THREE.AmbientLight(0xffffff, 1.1));
    const root = new THREE.Group();
    root.scale.setScalar(0.76);
    root.position.set(0, -0.22, 0.05);
    root.rotation.y = rotationRef.current.y;
    rootRef.current = root;
    hitTargetsRef.current = [];
    buildScene(scene, root, data, activeLayerId, hitTargetsRef.current);

    const renderScene = () => {
      renderer.render(scene, camera);
    };
    renderRef.current = renderScene;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const width = Math.max(1, rect.width);
      const height = Math.max(1, rect.height);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderScene();
    };

    resize();
    window.addEventListener("resize", resize);
    renderScene();

    return () => {
      window.removeEventListener("resize", resize);
      disposeObject(scene);
      renderer.dispose();
      rendererRef.current = null;
      cameraRef.current = null;
      sceneRef.current = null;
      rootRef.current = null;
      hitTargetsRef.current = [];
      renderRef.current = null;
    };
  }, [activeLayerId, data]);

  const handlePointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
    dragRef.current = { active: true, lastX: event.clientX };
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLCanvasElement>) => {
    const root = rootRef.current;
    if (!dragRef.current.active || !root) return;
    const deltaX = event.clientX - dragRef.current.lastX;
    dragRef.current.lastX = event.clientX;
    rotationRef.current.y += deltaX * 0.005;
    root.rotation.y = rotationRef.current.y;
    renderRef.current?.();
  };

  const handlePointerEnd = (event: PointerEvent<HTMLCanvasElement>) => {
    dragRef.current.active = false;
    setIsDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <div className="grid items-stretch gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="relative min-h-[880px] overflow-hidden border border-hub-teal/50 bg-hub-amethyst">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_32%_18%,rgba(139,190,178,0.16),transparent_34%),linear-gradient(90deg,rgba(139,190,178,0.11)_1px,transparent_1px),linear-gradient(180deg,rgba(139,190,178,0.08)_1px,transparent_1px)] bg-[size:auto,96px_96px,96px_96px]" />
        <div className="pointer-events-none absolute left-4 top-4 z-10 border border-hub-teal/55 bg-hub-amethyst/82 px-3 py-2 font-mono text-[0.66rem] font-black uppercase tracking-[0.14em] text-sun">
          Static 3D field / drag left-right / select to isolate
        </div>
        <canvas
          ref={canvasRef}
          className={`absolute inset-0 h-full w-full touch-none ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
          aria-label="Five-layer semantic-frequency field for hub Chart 01"
          onPointerCancel={handlePointerEnd}
          onPointerDown={handlePointerDown}
          onPointerLeave={(event) => {
            if (dragRef.current.active) handlePointerEnd(event);
          }}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
        />
      </div>

      <aside className="grid content-start gap-4 text-ink">
        <div className="h-[25.5rem] border border-ink/40 bg-wheat px-4 py-4">
          <p className="font-mono text-[0.68rem] font-black uppercase tracking-[0.16em] text-hub-ruby">
            {activeLayer ? "selected semantic layer" : "semantic field overview"}
          </p>
          <h3 className="mt-3 text-[clamp(1.7rem,3vw,2.55rem)] font-black leading-none text-hub-amethyst">
            {activeLayer ? activeLayer.label : "All Semantic Layers"}
          </h3>
          <p className="mt-3 text-[0.95rem] leading-6 text-ink/70">
            {activeLayer
              ? activeLayer.summary
              : "No single layer is isolated. All five semantic circles stay clear so the full movement from wheel center to modern access point can be read together."}
          </p>
          <dl className="mt-5 grid grid-cols-2 border-y border-ink/30 text-[0.74rem] font-black uppercase tracking-[0.1em]">
            <div className="border-r border-ink/30 px-2 py-3">
              <dt className="text-hub-space">{activeLayer ? "Most visible in" : "View state"}</dt>
              <dd className="mt-1 text-hub-amethyst">
                {activeLayer ? peakPeriodLabel(activeLayer) : "All layers visible"}
              </dd>
            </div>
            <div className="px-2 py-3">
              <dt className="text-hub-space">{activeLayer ? "Current role" : "Modern center"}</dt>
              <dd className="mt-1 text-hub-amethyst">
                {activeLayer ? currentRoleText(activeLayer) : modernLeader?.label ?? "Institutional / Digital Hub"}
              </dd>
            </div>
            <div className="border-r border-t border-ink/30 px-2 py-3">
              <dt className="text-hub-space">{activeLayer ? "Recent role" : "Wheel sense"}</dt>
              <dd className="mt-1 text-hub-amethyst">
                {activeLayer
                  ? statusLabel(activeLayer.modernStatus)
                  : statusLabel(mechanicalLayer?.modernStatus ?? "present")}
              </dd>
            </div>
            <div className="border-t border-ink/30 px-2 py-3">
              <dt className="text-hub-space">{activeLayer ? "Terms shown" : "Layer count"}</dt>
              <dd className="mt-1 text-hub-amethyst">
                {activeLayer ? `${queryLabels.length} examples` : `${data.layers.length} circles`}
              </dd>
            </div>
          </dl>
        </div>

        <div className="grid gap-2">
          <button
            type="button"
            onClick={() => setActiveLayerId(null)}
            className={`grid grid-cols-[4.25rem_1fr] border px-0 py-0 text-left transition ${
              activeLayerId === null
                ? "border-hub-space bg-sun text-ink"
                : "border-ink/35 bg-wheat text-ink hover:border-hub-teal hover:bg-hub-teal/20"
            }`}
          >
            <span className="border-r border-current/28 px-3 py-2 font-mono text-[0.68rem] font-black uppercase tracking-[0.14em]">
              all
            </span>
            <span className="px-3 py-2 text-[0.88rem] font-black leading-5">
              All layers clear
            </span>
          </button>
          {data.layers.map((layer) => (
            <button
              key={layer.id}
              type="button"
              onClick={() => setActiveLayerId(activeLayerId === layer.id ? null : layer.id)}
              className={`grid grid-cols-[4.25rem_1fr] border px-0 py-0 text-left transition ${
                activeLayerId === layer.id
                  ? "border-hub-space bg-hub-teal text-ink"
                  : "border-ink/35 bg-wheat text-ink hover:border-hub-teal hover:bg-hub-teal/20"
              }`}
            >
              <span className="border-r border-current/28 px-3 py-2 font-mono text-[0.68rem] font-black uppercase tracking-[0.14em]">
                {layer.layerNumber}
              </span>
              <span className="px-3 py-2 text-[0.88rem] font-black leading-5">
                {layer.label}
              </span>
            </button>
          ))}
        </div>

        <div className="min-h-[11.5rem] border border-ink/35 bg-wheat px-4 py-4">
          <p className="font-mono text-[0.68rem] font-black uppercase tracking-[0.16em] text-hub-space">
            {activeLayer ? "main query examples" : "query examples across layers"}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {queryLabels.map((query) => (
              <span
                key={query.query}
                className="border border-hub-space/35 bg-[#E9F2E4] px-2 py-1 text-[0.72rem] font-black uppercase tracking-[0.1em] text-hub-amethyst"
              >
                {query.query}
              </span>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
