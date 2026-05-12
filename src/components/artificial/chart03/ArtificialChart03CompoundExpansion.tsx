"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { Chart03HoverProps } from "./chart03Shared";

const INK = "#111018";
const RED = "#A1081F";
const WHEAT = "#F5ECD2";
const RULE = "#554F45";
const FAINT = "#918872";

const YEAR_MIN = 1800;
const YEAR_MAX = 2020;
const SCENE_HEIGHT = 8;

type Domain = "SENSE" | "MATERIAL" | "BIOLOGICAL" | "COGNITIVE" | "SOCIAL";

type Compound = {
  id: string;
  label: string;
  domain: Domain;
  yearStart: number;
  yearPeak: number;
  yearEnd: number;
  peak: number;
  note: string;
  angle: number;
  radialShift?: number;
};

const DOMAIN_META: Record<Domain, { label: string; note: string; angle: number; y: number; radius: number }> = {
  MATERIAL: { label: "MATERIAL", note: "stone / silk / rubber / fibre", angle: 230, y: 1.0, radius: 2.55 },
  SENSE: { label: "SENSE", note: "light / colour / flavour", angle: 308, y: 3.4, radius: 2.05 },
  BIOLOGICAL: { label: "BIOLOGICAL", note: "respiration / limb / heart", angle: 42, y: 4.7, radius: 1.8 },
  COGNITIVE: { label: "COGNITIVE", note: "language / intelligence / memory", angle: 108, y: 6.65, radius: 1.32 },
  SOCIAL: { label: "SOCIAL", note: "manner / behaviour / smile", angle: 172, y: 2.75, radius: 2.32 },
};

const COMPOUNDS: Compound[] = [
  { id: "artificial-light", label: "light", domain: "SENSE", yearStart: 1835, yearPeak: 1915, yearEnd: 1930, peak: 1.19, note: "sensory substitute; artificial illumination", angle: 312 },
  { id: "artificial-colour", label: "colour", domain: "SENSE", yearStart: 1875, yearPeak: 1912, yearEnd: 1972, peak: 0.39, note: "colour reproduction, dyes, print and film vocabulary", angle: 292, radialShift: 0.18 },
  { id: "artificial-flower", label: "flower", domain: "SENSE", yearStart: 1842, yearPeak: 1890, yearEnd: 1922, peak: 0.38, note: "decorative substitute; not yet strongly suspicious", angle: 334, radialShift: -0.1 },
  { id: "artificial-flavour", label: "flavour", domain: "SENSE", yearStart: 1960, yearPeak: 1995, yearEnd: 2020, peak: 0.1, note: "food-regulatory sense; substitute becomes suspect", angle: 276, radialShift: 0.08 },
  { id: "artificial-silk", label: "silk", domain: "MATERIAL", yearStart: 1890, yearPeak: 1929, yearEnd: 1978, peak: 4.65, note: "material imitation becomes industrial textile", angle: 228 },
  { id: "artificial-stone", label: "stone", domain: "MATERIAL", yearStart: 1868, yearPeak: 1872, yearEnd: 1938, peak: 1.14, note: "building material; artificial as engineered matter", angle: 250, radialShift: -0.14 },
  { id: "artificial-rubber", label: "rubber", domain: "MATERIAL", yearStart: 1942, yearPeak: 1962, yearEnd: 1988, peak: 0.1, note: "wartime and postwar material substitution", angle: 205, radialShift: 0.18 },
  { id: "artificial-fibre", label: "fibre", domain: "MATERIAL", yearStart: 1948, yearPeak: 1975, yearEnd: 2008, peak: 0.05, note: "synthetic textile vocabulary stabilizes", angle: 218, radialShift: -0.2 },
  { id: "artificial-respiration", label: "respiration", domain: "BIOLOGICAL", yearStart: 1878, yearPeak: 1890, yearEnd: 1958, peak: 0.9, note: "life support before the postwar bio-technical wave", angle: 24 },
  { id: "artificial-limb", label: "limb", domain: "BIOLOGICAL", yearStart: 1918, yearPeak: 1918, yearEnd: 1992, peak: 0.56, note: "prosthetic body; war medicine and rehabilitation", angle: 50, radialShift: -0.12 },
  { id: "artificial-insemination", label: "insemination", domain: "BIOLOGICAL", yearStart: 1948, yearPeak: 1953, yearEnd: 2008, peak: 1.09, note: "postwar reproductive technology enters public language", angle: 72, radialShift: 0.08 },
  { id: "artificial-heart", label: "heart", domain: "BIOLOGICAL", yearStart: 1980, yearPeak: 1986, yearEnd: 2020, peak: 0.37, note: "organ replacement becomes a modern artificial frontier", angle: 36, radialShift: 0.22 },
  { id: "artificial-language", label: "language", domain: "COGNITIVE", yearStart: 1906, yearPeak: 1945, yearEnd: 1988, peak: 0.1, note: "constructed systems before machine cognition dominates", angle: 92, radialShift: -0.08 },
  { id: "artificial-intelligence", label: "intelligence", domain: "COGNITIVE", yearStart: 1950, yearPeak: 2020, yearEnd: 2020, peak: 7.8, note: "cognitive ignition point; artificial becomes mind-like", angle: 118, radialShift: 0.12 },
  { id: "artificial-memory", label: "memory", domain: "COGNITIVE", yearStart: 1826, yearPeak: 1813, yearEnd: 1912, peak: 0.19, note: "older metaphorical cognition, before computing", angle: 135, radialShift: -0.22 },
  { id: "artificial-neural-network", label: "neural network", domain: "COGNITIVE", yearStart: 1988, yearPeak: 2020, yearEnd: 2020, peak: 0.79, note: "late cognitive technical vocabulary", angle: 78, radialShift: 0.16 },
  { id: "artificial-manner", label: "manner", domain: "SOCIAL", yearStart: 1805, yearPeak: 1832, yearEnd: 1892, peak: 0.05, note: "weak literary/social performance signal", angle: 160 },
  { id: "artificial-smile", label: "smile", domain: "SOCIAL", yearStart: 1878, yearPeak: 1915, yearEnd: 1965, peak: 0.04, note: "social performance turns toward inauthenticity", angle: 184, radialShift: 0.15 },
  { id: "artificial-behaviour", label: "behaviour", domain: "SOCIAL", yearStart: 1848, yearPeak: 1882, yearEnd: 1938, peak: 0.03, note: "moralized conduct; low-frequency term", angle: 196, radialShift: -0.1 },
];

function yearToY(year: number): number {
  return ((year - YEAR_MIN) / (YEAR_MAX - YEAR_MIN)) * SCENE_HEIGHT;
}

function coneRadiusAtY(y: number): number {
  const t = y / SCENE_HEIGHT;
  return 3.05 - t * 1.75;
}

function compoundRadius(compound: Compound): number {
  return 0.075 + Math.sqrt(compound.peak) * 0.07;
}

function polarPoint(angleDeg: number, radius: number, y: number): THREE.Vector3 {
  const angle = (angleDeg / 180) * Math.PI;
  return new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
}

function pointFor(compound: Compound, year = compound.yearPeak): THREE.Vector3 {
  const y = yearToY(year);
  const baseRadius = coneRadiusAtY(y) * 0.78 + (compound.radialShift ?? 0);
  return polarPoint(compound.angle, baseRadius, y);
}

function makeLine(points: THREE.Vector3[], color = INK, opacity = 0.3, linewidth = 1) {
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({ color, transparent: true, opacity, linewidth });
  return new THREE.Line(geometry, material);
}

function makeRing(y: number, radius: number, color = INK, opacity = 0.28) {
  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= 144; i += 1) {
    const a = (i / 144) * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(a) * radius, y, Math.sin(a) * radius));
  }
  return makeLine(points, color, opacity);
}

function makeTextSprite(text: string, options: { size?: number; color?: string; opacity?: number; weight?: string } = {}) {
  const size = options.size ?? 42;
  const padding = 18;
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) return new THREE.Sprite();

  context.font = `${options.weight ?? "700"} ${size}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
  const metrics = context.measureText(text);
  canvas.width = Math.ceil(metrics.width + padding * 2);
  canvas.height = Math.ceil(size * 1.45 + padding * 2);

  context.font = `${options.weight ?? "700"} ${size}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
  context.fillStyle = options.color ?? INK;
  context.textBaseline = "middle";
  context.fillText(text, padding, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    opacity: options.opacity ?? 0.9,
    depthTest: false,
  });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(canvas.width / 165, canvas.height / 165, 1);
  return sprite;
}

function disposeObject(object: THREE.Object3D) {
  object.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (mesh.geometry) mesh.geometry.dispose();
    const material = mesh.material;
    if (Array.isArray(material)) {
      material.forEach((item) => item.dispose());
    } else if (material) {
      material.dispose();
    }
  });
}

export function ArtificialChart03CompoundExpansion({ activeHover, onHover }: Chart03HoverProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const miniMountRef = useRef<HTMLDivElement | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [frontLabel, setFrontLabel] = useState("SENSE · artificial light");
  const activeId = hoveredId ?? activeHover?.termId ?? null;
  const activeCompound = useMemo(() => COMPOUNDS.find((compound) => compound.id === activeId), [activeId]);
  const activeIdRef = useRef<string | null>(activeId);
  const onHoverRef = useRef(onHover);

  useEffect(() => {
    activeIdRef.current = activeId;
    onHoverRef.current = onHover;
  }, [activeId, onHover]);

  useEffect(() => {
    if (!mountRef.current || !miniMountRef.current) return;
    const mountElement: HTMLDivElement = mountRef.current;
    const miniMountElement: HTMLDivElement = miniMountRef.current;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 80);
    camera.position.set(0, 4.35, 14.2);
    camera.lookAt(0, 4.2, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.className = "h-full w-full cursor-grab active:cursor-grabbing";
    mountElement.appendChild(renderer.domElement);

    const root = new THREE.Group();
    root.rotation.x = -0.1;
    root.rotation.y = -0.42;
    root.position.y = 0.72;
    root.scale.setScalar(0.855);
    scene.add(root);

    const miniScene = new THREE.Scene();
    const miniCamera = new THREE.OrthographicCamera(-2.45, 2.45, 2.45, -2.45, 0.1, 30);
    miniCamera.position.set(0, 8, 0);
    miniCamera.up.set(0, 0, -1);
    miniCamera.lookAt(0, 0, 0);
    const miniRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    miniRenderer.setClearColor(0x000000, 0);
    miniRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    miniRenderer.domElement.className = "h-full w-full";
    miniMountElement.appendChild(miniRenderer.domElement);
    const miniRoot = new THREE.Group();
    miniRoot.rotation.x = 0.76;
    miniRoot.rotation.y = root.rotation.y;
    miniScene.add(miniRoot);

    const markerMeshes: THREE.Mesh[] = [];
    const labelSprites = new Map<string, THREE.Sprite>();
    const markerMaterials = new Map<string, THREE.MeshBasicMaterial>();
    const markerScales = new Map<string, number>();
    const miniMarkerMaterials = new Map<string, THREE.MeshBasicMaterial>();
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    scene.add(new THREE.AmbientLight(0xffffff, 1));
    miniScene.add(new THREE.AmbientLight(0xffffff, 1));

    const basePlane = new THREE.Mesh(
      new THREE.PlaneGeometry(10.2, 10.2),
      new THREE.MeshBasicMaterial({ color: WHEAT, side: THREE.DoubleSide }),
    );
    basePlane.rotation.x = -Math.PI / 2;
    basePlane.position.y = -0.025;
    root.add(basePlane);

    const baseEdges = new THREE.Group();
    const baseCorners = [
      new THREE.Vector3(-5.1, -0.015, -5.1),
      new THREE.Vector3(5.1, -0.015, -5.1),
      new THREE.Vector3(5.1, -0.015, 5.1),
      new THREE.Vector3(-5.1, -0.015, 5.1),
      new THREE.Vector3(-5.1, -0.015, -5.1),
    ];
    baseEdges.add(makeLine(baseCorners, INK, 0.7));
    for (let i = -4; i <= 4; i += 2) {
      baseEdges.add(makeLine([new THREE.Vector3(i, -0.014, -5.1), new THREE.Vector3(i, -0.014, 5.1)], FAINT, 0.09));
      baseEdges.add(makeLine([new THREE.Vector3(-5.1, -0.014, i), new THREE.Vector3(5.1, -0.014, i)], FAINT, 0.09));
    }
    baseEdges.add(makeLine([new THREE.Vector3(-5.1, -0.012, -5.1), new THREE.Vector3(5.1, -0.012, 5.1)], FAINT, 0.12));
    baseEdges.add(makeLine([new THREE.Vector3(-5.1, -0.012, 5.1), new THREE.Vector3(5.1, -0.012, -5.1)], FAINT, 0.12));
    root.add(baseEdges);

    const cylinder = new THREE.Mesh(
      new THREE.CylinderGeometry(1.28, 3.08, SCENE_HEIGHT, 96, 1, true),
      new THREE.MeshBasicMaterial({ color: WHEAT, transparent: true, opacity: 0.045, side: THREE.DoubleSide }),
    );
    cylinder.position.y = SCENE_HEIGHT / 2;
    root.add(cylinder);
    root.add(new THREE.LineSegments(new THREE.EdgesGeometry(cylinder.geometry), new THREE.LineBasicMaterial({ color: INK, transparent: true, opacity: 0.14 })));

    root.add(makeRing(0, 3.05, INK, 0.66));
    root.add(makeRing(SCENE_HEIGHT, 1.3, INK, 0.66));
    root.add(makeLine([new THREE.Vector3(0, 0.02, 0), new THREE.Vector3(0, SCENE_HEIGHT + 0.5, 0)], INK, 0.88));

    for (let i = 0; i < 12; i += 1) {
      const angle = (i / 12) * Math.PI * 2;
      const bottom = new THREE.Vector3(Math.cos(angle) * 3.05, 0, Math.sin(angle) * 3.05);
      const top = new THREE.Vector3(Math.cos(angle) * 1.3, SCENE_HEIGHT, Math.sin(angle) * 1.3);
      root.add(makeLine([bottom, top], INK, i % 3 === 0 ? 0.26 : 0.11));
    }

    for (let i = 0; i < 18; i += 1) {
      const angle = (i / 18) * Math.PI * 2;
      const lower = polarPoint((angle / Math.PI) * 180, 1.25, 1.15 + (i % 3) * 0.18);
      const upper = polarPoint((angle / Math.PI) * 180 + 10, 1.75, 5.8 + (i % 2) * 0.35);
      root.add(makeLine([lower, upper], FAINT, 0.11));
    }

    for (const year of [1800, 1840, 1880, 1920, 1960, 2000, 2020]) {
      const y = yearToY(year);
      root.add(makeRing(y, coneRadiusAtY(y), RULE, year === 1960 ? 0.34 : 0.18));
      const label = makeTextSprite(String(year), { size: 22, color: INK, opacity: 0.56, weight: "600" });
      label.position.copy(polarPoint(18, coneRadiusAtY(y) + 0.46, y));
      root.add(label);
    }

    const postwar = new THREE.Mesh(
      new THREE.CylinderGeometry(coneRadiusAtY(yearToY(1950)) * 0.98, coneRadiusAtY(yearToY(1950)) * 1.04, yearToY(1960) - yearToY(1940), 96, 1, true),
      new THREE.MeshBasicMaterial({ color: RED, transparent: true, opacity: 0.06, side: THREE.DoubleSide }),
    );
    postwar.position.y = yearToY(1950);
    root.add(postwar);
    root.add(makeRing(yearToY(1950), coneRadiusAtY(yearToY(1950)) * 1.03, RED, 0.35));
    const postwarLabel = makeTextSprite("POSTWAR COMPOUND SURGE", { size: 18, color: RED, opacity: 0.84 });
    postwarLabel.position.copy(polarPoint(330, coneRadiusAtY(yearToY(1950)) * 1.16, yearToY(1950) + 0.13));
    root.add(postwarLabel);
    const postwarNote = makeTextSprite("1940-1960: biological, material, cognitive terms accelerate", {
      size: 16,
      color: RED,
      opacity: 0.70,
      weight: "600",
    });
    postwarNote.position.copy(polarPoint(330, coneRadiusAtY(yearToY(1950)) * 1.17, yearToY(1950) - 0.03));
    root.add(postwarNote);

    for (const meta of Object.values(DOMAIN_META)) {
      root.add(makeRing(meta.y, meta.radius, meta.label === "SENSE" ? RED : INK, meta.label === "SENSE" ? 0.34 : 0.24));
      const p = polarPoint(meta.angle, meta.radius + 0.38, meta.y);
      const label = makeTextSprite(meta.label, { size: 25, color: INK, opacity: 0.78 });
      label.position.copy(p);
      root.add(label);
      const note = makeTextSprite(meta.note, { size: 15, color: RULE, opacity: 0.58, weight: "500" });
      note.position.copy(polarPoint(meta.angle, meta.radius + 0.42, meta.y - 0.24));
      root.add(note);
    }

    const axisLabel = makeTextSprite("ARTIFICIAL", { size: 25, color: INK, opacity: 0.82 });
    axisLabel.position.set(0.34, 6.35, 0.1);
    root.add(axisLabel);

    const topLabel = makeTextSprite("COGNITIVE REGISTER", { size: 19, color: INK, opacity: 0.58 });
    topLabel.position.set(-1.35, SCENE_HEIGHT + 0.35, 0.1);
    root.add(topLabel);

    const baseLabel = makeTextSprite("MATERIAL SUBSTRATE", { size: 21, color: INK, opacity: 0.66 });
    baseLabel.position.set(-3.1, 0.12, 3.65);
    root.add(baseLabel);

    let ringIndex = 0;
    for (const domain of Object.keys(DOMAIN_META) as Domain[]) {
      const ringRadius = 0.72 + ringIndex * 0.34;
      miniRoot.add(makeRing(0, ringRadius, domain === "SENSE" ? RED : INK, domain === "SENSE" ? 0.42 : 0.25));
      ringIndex += 1;
    }

    for (const domain of Object.keys(DOMAIN_META) as Domain[]) {
      const terms = COMPOUNDS.filter((compound) => compound.domain === domain).sort((a, b) => a.yearPeak - b.yearPeak);
      for (let i = 0; i < terms.length - 1; i += 1) {
        const a = pointFor(terms[i]);
        const b = pointFor(terms[i + 1]);
        const mid = a.clone().lerp(b, 0.5);
        mid.y += 0.42;
        const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
        root.add(makeLine(curve.getPoints(32), INK, 0.22));
      }
    }

    for (const compound of COMPOUNDS) {
      const start = pointFor(compound, compound.yearStart);
      const peak = pointFor(compound);
      const end = pointFor(compound, compound.yearEnd);
      root.add(makeLine([start, peak, end], INK, 0.18));

      const material = new THREE.MeshBasicMaterial({ color: INK, transparent: true, opacity: 0.72 });
      const marker = new THREE.Mesh(new THREE.OctahedronGeometry(compoundRadius(compound), 0), material);
      marker.position.copy(peak);
      marker.userData = { compoundId: compound.id };
      markerMeshes.push(marker);
      markerMaterials.set(compound.id, material);
      markerScales.set(compound.id, 1);
      root.add(marker);

      const label = makeTextSprite(compound.label, { size: 25, color: INK, opacity: 0.72, weight: "600" });
      label.position.copy(peak.clone().add(new THREE.Vector3(0, compoundRadius(compound) + 0.2, 0)));
      const labelMaterial = label.material as THREE.SpriteMaterial;
      labelMaterial.opacity = 0;
      labelSprites.set(compound.id, label);
      root.add(label);

      const domainOrder = (Object.keys(DOMAIN_META) as Domain[]).indexOf(compound.domain);
      const miniRadius = 0.72 + domainOrder * 0.34;
      const miniPoint = polarPoint(compound.angle, miniRadius, 0.04);
      const miniMaterial = new THREE.MeshBasicMaterial({ color: INK, transparent: true, opacity: 0.54 });
      const miniMarker = new THREE.Mesh(new THREE.SphereGeometry(0.055 + Math.sqrt(compound.peak) * 0.018, 14, 10), miniMaterial);
      miniMarker.position.copy(miniPoint);
      miniMarkerMaterials.set(compound.id, miniMaterial);
      miniRoot.add(miniMarker);
    }

    function resize() {
      const rect = mountElement.getBoundingClientRect();
      renderer.setSize(rect.width, rect.height, false);
      camera.aspect = rect.width / rect.height;
      camera.updateProjectionMatrix();

      const miniRect = miniMountElement.getBoundingClientRect();
      miniRenderer.setSize(miniRect.width, miniRect.height, false);
      miniCamera.updateProjectionMatrix();
    }

    function updatePointer(event: PointerEvent) {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    }

    function updateHover(event: PointerEvent) {
      updatePointer(event);
      raycaster.setFromCamera(pointer, camera);
      const intersections = raycaster.intersectObjects(markerMeshes, false);
      const hit = intersections[0]?.object as THREE.Mesh | undefined;
      const compoundId = hit?.userData.compoundId as string | undefined;
      setHoveredId(compoundId ?? null);
      const compound = COMPOUNDS.find((item) => item.id === compoundId);
      onHoverRef.current?.(
        compound
          ? {
              termId: compound.id,
              label: `artificial ${compound.label}`,
              year: compound.yearPeak,
              role: compound.domain === "COGNITIVE" ? "simulation" : "concept",
              source: "compound-expansion",
            }
          : null,
      );
    }

    let dragging = false;
    let previousX = 0;
    let previousY = 0;

    function pointerDown(event: PointerEvent) {
      dragging = true;
      previousX = event.clientX;
      previousY = event.clientY;
      renderer.domElement.setPointerCapture(event.pointerId);
    }

    function pointerMove(event: PointerEvent) {
      if (dragging) {
        const dx = event.clientX - previousX;
        const dy = event.clientY - previousY;
        root.rotation.y += dx * 0.008;
        root.rotation.x = THREE.MathUtils.clamp(root.rotation.x + dy * 0.003, -0.55, 0.28);
        miniRoot.rotation.y = root.rotation.y;
        previousX = event.clientX;
        previousY = event.clientY;
      }
      updateHover(event);
    }

    function pointerUp(event: PointerEvent) {
      dragging = false;
      renderer.domElement.releasePointerCapture(event.pointerId);
    }

    renderer.domElement.addEventListener("pointerdown", pointerDown);
    renderer.domElement.addEventListener("pointermove", pointerMove);
    renderer.domElement.addEventListener("pointerup", pointerUp);
    renderer.domElement.addEventListener("pointerleave", () => {
      setHoveredId(null);
      onHoverRef.current?.(null);
    });
    window.addEventListener("resize", resize);
    resize();

    let frame = 0;
    let lastFrontId = "";
    function animate() {
      frame = requestAnimationFrame(animate);
      const selected = activeIdRef.current;
      miniRoot.rotation.y += (root.rotation.y - miniRoot.rotation.y) * 0.18;

      root.updateMatrixWorld();
      let frontCompound = COMPOUNDS[0];
      let frontScore = -Infinity;
      for (const compound of COMPOUNDS) {
        const world = pointFor(compound).clone().applyMatrix4(root.matrixWorld);
        const score = world.z + Math.sqrt(compound.peak) * 0.11;
        if (score > frontScore) {
          frontScore = score;
          frontCompound = compound;
        }
      }
      const visibleCompound = COMPOUNDS.find((compound) => compound.id === selected) ?? frontCompound;
      if (visibleCompound.id !== lastFrontId) {
        lastFrontId = visibleCompound.id;
        setFrontLabel(`${visibleCompound.domain} · artificial ${visibleCompound.label}`);
      }

      for (const [id, material] of markerMaterials) {
        const active = selected === id;
        const facing = visibleCompound.id === id;
        const dimmed = selected !== null && !active;
        material.color.set(active ? RED : INK);
        material.opacity = dimmed ? 0.14 : active ? 1 : facing ? 0.92 : 0.48;
      }
      for (const [id, material] of miniMarkerMaterials) {
        const active = selected === id;
        const facing = visibleCompound.id === id;
        material.color.set(active || facing ? RED : INK);
        material.opacity = active ? 1 : facing ? 0.88 : 0.34;
      }
      for (const [id, sprite] of labelSprites) {
        const material = sprite.material as THREE.SpriteMaterial;
        const active = selected === id;
        const facing = visibleCompound.id === id;
        material.opacity += ((active ? 1 : facing ? 0.82 : 0) - material.opacity) * 0.16;
      }
      for (const marker of markerMeshes) {
        const id = marker.userData.compoundId as string;
        const active = selected === id;
        const facing = visibleCompound.id === id;
        const target = active ? 1.85 : facing ? 1.38 : 1;
        const current = markerScales.get(id) ?? 1;
        const next = current + (target - current) * 0.15;
        markerScales.set(id, next);
        marker.scale.setScalar(next);
      }
      renderer.render(scene, camera);
      miniRenderer.render(miniScene, miniCamera);
    }
    animate();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      renderer.domElement.removeEventListener("pointerdown", pointerDown);
      renderer.domElement.removeEventListener("pointermove", pointerMove);
      renderer.domElement.removeEventListener("pointerup", pointerUp);
      renderer.dispose();
      miniRenderer.dispose();
      disposeObject(root);
      disposeObject(miniRoot);
      mountElement.replaceChildren();
      miniMountElement.replaceChildren();
    };
  }, []);

  return (
    <div className="w-full overflow-hidden border border-ink/55">
      <div className="grid border-b border-ink/50 px-6 py-5 sm:grid-cols-[4.5rem_minmax(0,1fr)] sm:gap-6">
        <p className="font-mono text-[0.78rem] font-bold leading-5 tracking-[0.13em] text-ink/70">{"{06}"}</p>
        <div>
          <h4 className="font-mono text-[1rem] font-black uppercase leading-none tracking-[0.16em] text-ink">Compound Expansion</h4>
          <p className="mt-2 font-mono text-[0.72rem] leading-relaxed tracking-[0.06em] text-ink/66">
            artificial as prefix field: material / sense / biological / cognitive / social
          </p>
        </div>
      </div>

      <div className="relative h-[min(78vw,820px)] min-h-[660px] bg-transparent">
        <div ref={mountRef} className="absolute inset-0" aria-label="Chart 06 Three.js compound expansion field" />

        <div className="pointer-events-none absolute left-6 top-6 max-w-[21rem] font-mono text-[0.72rem] leading-relaxed tracking-[0.05em] text-ink/64">
          vertical time: 1800-2020 · circle/diamond size approximates peak ngram frequency
        </div>

        <div className="absolute right-5 top-5 grid h-[22rem] w-[18rem] grid-rows-[17rem_5rem] border border-ink/45 bg-wheat/70">
          <div className="pointer-events-none absolute inset-0 opacity-45 [background-image:linear-gradient(135deg,rgba(17,16,24,0.10)_1px,transparent_1px),linear-gradient(45deg,rgba(17,16,24,0.06)_1px,transparent_1px)] [background-size:42px_42px]" />
          <div className="relative z-10 grid grid-rows-[3.6rem_minmax(0,1fr)]">
            <div className="pointer-events-none px-5 pt-4 font-mono text-[0.78rem] font-black uppercase tracking-[0.14em] text-ink/78">
              orbital index
            </div>
            <div className="flex items-center justify-center pb-5">
              <div ref={miniMountRef} className="h-[15.18rem] w-[15.18rem]" aria-label="Synchronized orbital overview for Chart 06" />
            </div>
          </div>
          <div className="pointer-events-none relative z-10 mx-5 border-t border-ink/45 pt-3 font-mono text-[0.84rem] font-bold uppercase leading-snug tracking-[0.08em] text-fire">
            {frontLabel}
          </div>
        </div>

        {activeCompound ? (
          <div className="pointer-events-none absolute right-5 top-[24.025rem] w-[18rem] border border-fire/75 bg-wheat/95 p-4 font-mono text-ink shadow-sm">
            <p className="text-[0.82rem] font-black uppercase tracking-[0.12em]">artificial {activeCompound.label}</p>
            <p className="mt-3 text-[0.74rem] tracking-[0.06em] text-ink/72">
              {activeCompound.domain.toLowerCase()} · peak c.{activeCompound.yearPeak} · {activeCompound.peak.toFixed(2)}/M
            </p>
            <p className="mt-3 text-[0.72rem] italic leading-relaxed tracking-[0.03em] text-ink/68">{activeCompound.note}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
