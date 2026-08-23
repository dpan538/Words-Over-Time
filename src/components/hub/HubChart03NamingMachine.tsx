"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import * as THREE from "three";

export type HubChart03SupportType =
  | "frequency-supported"
  | "search-visible"
  | "institutional example"
  | "brand/platform example"
  | "sparse or caution";

export type HubChart03Node = {
  term: string;
  objectType: string;
  supportType: HubChart03SupportType;
  role: "primary" | "secondary" | "tertiary";
  alwaysLabel?: boolean;
  note: string;
};

export type HubChart03Family = {
  id: string;
  label: string;
  color: string;
  angle: number;
  importance: number;
  reach: number;
  supportSummary: string;
  nodes: HubChart03Node[];
};

export type HubChart03PatternCard = {
  patternId: string;
  label: string;
  frequencySupport: string;
  searchVisibilitySupport: string;
  chartRole: string;
  confidence: "high" | "medium" | "low";
  firstActivePeriod: string;
  modernStatus: string;
  examples: string[];
};

export type HubChart03NamingMachineData = {
  title: string;
  subtitle: string;
  hypothesisVerdict: string;
  strongestPattern: string;
  focus: string;
  sourceSummary: string;
  families: HubChart03Family[];
  patterns: HubChart03PatternCard[];
  cautions: string[];
};

type HubChart03NamingMachineProps = {
  data: HubChart03NamingMachineData;
};

type PositionedNode = HubChart03Node & {
  familyId: string;
  familyLabel: string;
  familyColor: string;
  angle: number;
  x: number;
  y: number;
  rayStartX: number;
  rayStartY: number;
  labelX: number;
  labelY: number;
  r: number;
  textAnchor: "start" | "middle" | "end";
};

type PositionedFamily = HubChart03Family & {
  endX: number;
  endY: number;
  labelX: number;
  labelY: number;
  textAnchor: "start" | "middle" | "end";
  nodesPositioned: PositionedNode[];
};

const WHEAT = "#F7F0DC";
const PANEL_BG = "#F3EBD5";
const INK = "#050510";
const AMETHYST = "#090817";
const TEAL = "#8FBFB3";
const CENTER_X = 590;
const CENTER_Y = 342;
const VIEWBOX_WIDTH = 1180;
const VIEWBOX_HEIGHT = 820;

const familyAngleOffsets = [0, -22, 22, -36, 36, -10, 10, -26, 26];
const nodeReachSteps = [1.14, 1, 1, 0.78, 0.78, 0.74, 0.74, 0.52, 0.52];

function polar(angle: number, radius: number) {
  const radians = (angle * Math.PI) / 180;
  return {
    x: Math.cos(radians) * radius,
    y: Math.sin(radians) * radius,
  };
}

function textAnchorForAngle(angle: number): "start" | "middle" | "end" {
  const normalized = ((angle % 360) + 360) % 360;
  if (normalized > 76 && normalized < 104) return "middle";
  if (normalized > 256 && normalized < 284) return "middle";
  if (normalized > 90 && normalized < 270) return "end";
  return "start";
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function coord(value: number) {
  return Number(value.toFixed(3));
}

function boundedAnchor(x: number, fallback: "start" | "middle" | "end"): "start" | "middle" | "end" {
  if (x < 280) return "start";
  if (x > VIEWBOX_WIDTH - 280) return "end";
  return fallback;
}

function nodeRadius(role: HubChart03Node["role"]) {
  if (role === "primary") return 24;
  if (role === "secondary") return 17;
  return 11;
}

function bandWidth(role: HubChart03Node["role"], importance: number) {
  const base = role === "primary" ? 27 : role === "secondary" ? 17 : 9;
  return base + importance * 10;
}

function familyBandWidth(importance: number) {
  return 30 + importance * 36;
}

function familyOpacity(activeId: string | null, familyId: string) {
  if (!activeId) return 0.96;
  return activeId === familyId || activeId.startsWith(`${familyId}:`) ? 1 : 0.18;
}

function nodeOpacity(activeId: string | null, familyId: string, term: string) {
  if (!activeId) return 1;
  if (activeId === familyId || activeId === `${familyId}:${term}`) return 1;
  return 0.2;
}

function supportLabel(support: HubChart03SupportType) {
  return support.replace("-", " ");
}

function confidenceTone(confidence: "high" | "medium" | "low") {
  if (confidence === "high") return "text-hub-ruby";
  if (confidence === "medium") return "text-hub-space";
  return "text-ink/56";
}

function supportScale(value: string) {
  const normalized = value.toLowerCase();
  if (normalized.includes("strong") || normalized.includes("high")) return 1;
  if (normalized.includes("usable") || normalized.includes("visible") || normalized.includes("medium")) return 0.72;
  if (normalized.includes("unavailable") || normalized.includes("sparse") || normalized.includes("low")) return 0.34;
  return 0.56;
}

function patternColor(patternId: string) {
  if (patternId.includes("brand") || patternId.includes("compound")) return "#414B9E";
  if (patternId.includes("prefix") || patternId.includes("technical")) return "#852736";
  if (patternId.includes("platform") || patternId.includes("content")) return "#FBB728";
  if (patternId.includes("institutional")) return "#8BBEB2";
  return "#8BBEB2";
}

function chart03Vars(delay: number): CSSProperties {
  return { "--hub03-delay": `${delay}ms` } as CSSProperties;
}

function labelStrokeProps() {
  return {
    paintOrder: "stroke" as const,
    stroke: WHEAT,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 5,
  };
}

function visualFamilyColor(family: HubChart03Family) {
  const colors: Record<string, string> = {
    institutional_campus: "#78B8AA",
    platform_brand: "#4E58B8",
    content_knowledge: "#F2B735",
    technical_system: "#A23646",
    community_place: "#173C61",
  };
  return colors[family.id] ?? family.color;
}

function gradientColor(family: HubChart03Family) {
  if (family.id === "platform_brand") return "#A877B2";
  if (family.id === "technical_system") return "#D89042";
  if (family.id === "community_place") return "#6BA99F";
  if (family.id === "institutional_campus") return "#D9F09F";
  return TEAL;
}

function densityCloudColor(family: HubChart03Family) {
  const colors: Record<string, string> = {
    institutional_campus: "#3F9E94",
    platform_brand: "#2F3EA5",
    content_knowledge: "#E69400",
    technical_system: "#98243A",
    community_place: "#102D50",
  };
  return colors[family.id] ?? family.color;
}

function familyLabelOverride(id: string) {
  const labels: Record<string, { x: number; y: number; anchor: "start" | "middle" | "end" }> = {
    institutional_campus: { x: 276, y: 44, anchor: "middle" },
    platform_brand: { x: 1014, y: 48, anchor: "middle" },
    content_knowledge: { x: 948, y: 666, anchor: "middle" },
    technical_system: { x: 242, y: 792, anchor: "start" },
    community_place: { x: 146, y: 558, anchor: "start" },
  };
  return labels[id] ?? null;
}

function buildLayout(families: HubChart03Family[]): PositionedFamily[] {
  return families.map((family) => {
    const familyVector = polar(family.angle, family.reach + 96);
    const familyLabelVector = polar(family.angle, family.reach + 122);
    const familyLabelX = CENTER_X + familyLabelVector.x;
    const familyAnchor = boundedAnchor(familyLabelX, textAnchorForAngle(family.angle));
    const nodesPositioned = family.nodes.map((node, index) => {
      const nodeAngle = family.angle + familyAngleOffsets[index % familyAngleOffsets.length];
      const reach = family.reach * nodeReachSteps[index % nodeReachSteps.length] + (node.role === "primary" ? 30 : 0);
      const point = polar(nodeAngle, reach);
      const start = polar(nodeAngle, 32);
      const label = polar(nodeAngle, node.role === "primary" ? 44 : 34);
      const rawLabelX = CENTER_X + point.x + label.x;
      const anchor = boundedAnchor(rawLabelX, textAnchorForAngle(nodeAngle));
      return {
        ...node,
        familyId: family.id,
        familyLabel: family.label,
        familyColor: family.color,
        angle: nodeAngle,
        x: coord(CENTER_X + point.x),
        y: coord(CENTER_Y + point.y),
        rayStartX: coord(CENTER_X + start.x),
        rayStartY: coord(CENTER_Y + start.y),
        labelX: coord(clamp(rawLabelX, 112, VIEWBOX_WIDTH - 112)),
        labelY: coord(clamp(CENTER_Y + point.y + label.y + 5, 48, VIEWBOX_HEIGHT - 46)),
        r: nodeRadius(node.role),
        textAnchor: anchor,
      };
    });

    return {
      ...family,
      endX: coord(CENTER_X + familyVector.x),
      endY: coord(CENTER_Y + familyVector.y),
      labelX: familyLabelOverride(family.id)?.x ?? coord(clamp(familyLabelX, 112, VIEWBOX_WIDTH - 112)),
      labelY: familyLabelOverride(family.id)?.y ?? coord(clamp(CENTER_Y + familyLabelVector.y, 48, VIEWBOX_HEIGHT - 48)),
      textAnchor: familyLabelOverride(family.id)?.anchor ?? familyAnchor,
      nodesPositioned,
    };
  });
}

function selectedCopy(
  data: HubChart03NamingMachineData,
  activeId: string | null,
  families: PositionedFamily[],
) {
  if (!activeId) {
    return `X + HUB / ${data.hypothesisVerdict.toUpperCase()} / strongest pattern: ${data.strongestPattern.replaceAll("_", " ")}`;
  }
  const [familyId, term] = activeId.split(":");
  const family = families.find((item) => item.id === familyId);
  const node = family?.nodesPositioned.find((item) => item.term === term);
  if (family && node) {
    return `${node.term} / ${family.label} / ${node.objectType.replaceAll("_", " ")} / ${supportLabel(node.supportType)}`;
  }
  if (family) {
    return `${family.label} / ${family.nodes.length} naming examples / ${family.importance >= 0.78 ? "strong" : "usable"} support`;
  }
  return data.subtitle;
}

function familyKeyLabel(label: string) {
  return label
    .replace("Institutional / Campus", "institution")
    .replace("Platform / Brand", "platform")
    .replace("Content / Knowledge", "content")
    .replace("Technical / System", "technical")
    .replace("Community / Place", "community");
}

function familySupportValue(family: HubChart03Family) {
  return clamp(family.importance * 100, 18, 98);
}

function seededNoise(seed: number) {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

function NamingEvolutionField({
  families,
  activeId,
  setActiveId,
}: {
  families: PositionedFamily[];
  activeId: string | null;
  setActiveId: (value: string | null) => void;
}) {
  const [phase, setPhase] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const activeFamilyId = activeId?.split(":")[0] ?? null;

  useEffect(() => {
    if (isPaused) return;
    let frame = 0;
    let mounted = true;
    const animate = (time: number) => {
      if (!mounted) return;
      setPhase(time / 920);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => {
      mounted = false;
      cancelAnimationFrame(frame);
    };
  }, [isPaused]);

  const fieldFamilies = families.map((family, index) => {
    const presets = [
      { x: 192, y: 220, orbit: 124 },
      { x: 512, y: 168, orbit: 104 },
      { x: 448, y: 420, orbit: 132 },
      { x: 248, y: 410, orbit: 106 },
      { x: 136, y: 360, orbit: 92 },
    ];
    return {
      ...family,
      ...presets[index % presets.length],
      pulse: 1 + Math.sin(phase + index * 0.86) * 0.075,
    };
  });

  const activeFamily = activeFamilyId ? fieldFamilies.find((family) => family.id === activeFamilyId) : null;

  return (
    <section
      className="relative min-h-[41rem] overflow-hidden border border-ink/72 bg-[#efe4c8]"
      onPointerLeave={() => {
        setIsPaused(false);
        setActiveId(null);
      }}
      aria-label="Animated naming-family field"
    >
      <div className="flex min-h-[4.6rem] items-center justify-between gap-4 border-b border-ink/45 bg-[#efe4c8] px-4 py-3">
        <div>
          <p className="font-mono text-[0.9rem] font-black uppercase tracking-[0.15em] text-hub-ruby">
            {isPaused ? "hover paused" : "auto evolution"}
          </p>
          <p className="mt-1 text-[1.45rem] font-black leading-none text-ink">
            {activeFamily?.label ?? "Naming families breathe"}
          </p>
        </div>
        <p className="max-w-[18rem] text-right text-[0.86rem] leading-4 text-ink/62">
          Hover pauses the motion and reveals one naming family.
        </p>
      </div>
      <svg viewBox="0 0 720 620" className="block h-[36.8rem] w-full" role="img">
        <defs>
          <pattern id="hub-chart03-evolution-grid" width="52" height="52" patternUnits="userSpaceOnUse">
            <path d="M52 0H0V52" fill="none" stroke="rgba(5,5,16,0.055)" strokeWidth="1" />
          </pattern>
          <filter id="hub-chart03-soft-blur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" />
          </filter>
        </defs>
        <rect width="720" height="620" fill={PANEL_BG} />
        <rect width="720" height="620" fill="url(#hub-chart03-evolution-grid)" />
        <line x1="360" x2="360" y1="54" y2="566" stroke={INK} strokeOpacity="0.18" />
        <line x1="76" x2="644" y1="310" y2="310" stroke={INK} strokeOpacity="0.18" />

        <g className="font-mono text-[14px] font-black uppercase tracking-[0.14em]" fill={INK} opacity="0.48">
          <text x="360" y="44" textAnchor="middle">institutional pull</text>
          <text x="360" y="590" textAnchor="middle">documentation / service</text>
          <text x="34" y="314" textAnchor="middle" transform="rotate(-90 34 314)">staged</text>
          <text x="686" y="314" textAnchor="middle" transform="rotate(90 686 314)">spontaneous</text>
        </g>

        {fieldFamilies.map((family, familyIndex) => {
          const isActive = activeFamilyId === family.id;
          const dimmed = activeFamilyId && !isActive;
          const mainRadius = family.orbit * (0.7 + family.importance * 0.22) * family.pulse;
          const examples = family.nodesPositioned.slice(0, family.id === "platform_brand" ? 5 : 7);
          return (
            <g
              key={`evolution-${family.id}`}
              opacity={dimmed ? 0.18 : 1}
              className="transition-opacity duration-300"
              onPointerEnter={() => {
                setIsPaused(true);
                setActiveId(family.id);
              }}
            >
              <circle cx={family.x} cy={family.y} r={mainRadius + 22} fill={family.color} opacity="0.11" filter="url(#hub-chart03-soft-blur)" />
              {[0.28, 0.48, 0.68, 0.9].map((scale, ringIndex) => (
                <circle
                  key={`${family.id}-ring-${scale}`}
                  cx={family.x}
                  cy={family.y}
                  r={mainRadius * scale}
                  fill={family.color}
                  opacity={isActive ? 0.2 - ringIndex * 0.025 : 0.15 - ringIndex * 0.022}
                  stroke={family.color}
                  strokeOpacity={0.24}
                />
              ))}
              {examples.map((node, nodeIndex) => {
                const angle = (nodeIndex / Math.max(1, examples.length)) * Math.PI * 2 + familyIndex * 0.6 + Math.sin(phase * 0.28 + nodeIndex) * 0.08;
                const radius = mainRadius * (0.72 + (nodeIndex % 3) * 0.12);
                const x = family.x + Math.cos(angle) * radius;
                const y = family.y + Math.sin(angle) * radius;
                const isSensitive = node.term.toLowerCase() === "pornhub";
                return (
                  <g key={`${family.id}-field-node-${node.term}`}>
                    <line x1={family.x} y1={family.y} x2={x} y2={y} stroke={family.color} strokeOpacity={0.22} strokeWidth="1.1" />
                    <circle cx={x} cy={y} r={isSensitive ? 5 : node.r * 0.46 + 3} fill={family.color} stroke={WHEAT} strokeWidth="2" opacity={isSensitive ? 0.42 : 0.9} />
                    {(node.alwaysLabel || isActive) && !isSensitive ? (
                      <text
                        x={x + 11}
                        y={y + 4}
                        fill={INK}
                        {...labelStrokeProps()}
                        className="text-[14px] font-black"
                      >
                        {node.term}
                      </text>
                    ) : null}
                  </g>
                );
              })}
              <circle cx={family.x} cy={family.y} r={mainRadius + 44} fill="transparent" />
              <text
                x={family.x}
                y={family.y + mainRadius + 38}
                textAnchor="middle"
                fill={INK}
                className="font-mono text-[15px] font-black uppercase tracking-[0.14em]"
              >
                {familyKeyLabel(family.label)}
              </text>
            </g>
          );
        })}
      </svg>
    </section>
  );
}

function DensityCloud3D({
  families,
  activeId,
  setActiveId,
}: {
  families: PositionedFamily[];
  activeId: string | null;
  setActiveId: (value: string | null) => void;
}) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const activeFamilyRef = useRef<string | null>(null);
  const [hoverLabel, setHoverLabel] = useState<string>("Naming Density Field");
  const activeFamilyId = activeId?.split(":")[0] ?? null;
  const activeFamily = activeFamilyId ? families.find((family) => family.id === activeFamilyId) ?? null : null;
  const cloudTitle = activeFamily?.label ?? hoverLabel;

  useEffect(() => {
    activeFamilyRef.current = activeFamilyId;
  }, [activeFamilyId]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(PANEL_BG);

    const camera = new THREE.PerspectiveCamera(37, 1, 0.1, 1000);
    camera.position.set(0, 0.05, 5.7);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    mount.appendChild(renderer.domElement);

    const group = new THREE.Group();
    group.position.set(0, 0, 0);
    group.scale.setScalar(1.38);
    scene.add(group);

    const grid = new THREE.GridHelper(8.2, 18, 0x0d0630, 0x0d0630);
    grid.rotation.x = Math.PI / 2;
    grid.position.z = -1.15;
    const gridMaterial = grid.material as THREE.Material;
    gridMaterial.opacity = 0.06;
    gridMaterial.transparent = true;
    group.add(grid);

    const particleMeta: { familyId: string; label: string; color: string }[] = [];
    families.forEach((family, familyIndex) => {
      const angle = ((family.angle + 10) * Math.PI) / 180;
      const count = Math.round(580 + family.importance * 620);
      const positions = new Float32Array(count * 3);
      const colors = new Float32Array(count * 3);
      const color = new THREE.Color(densityCloudColor(family));
      const spreadMajor = 0.74 + family.importance * 0.46;
      const spreadMinor = 0.4 + family.reach / 1900;
      const zSpread = 0.48 + family.importance * 0.18;
      let meanX = 0;
      let meanY = 0;
      let meanZ = 0;

      for (let index = 0; index < count; index += 1) {
        const u1 = Math.max(0.001, seededNoise(index * 4 + familyIndex * 31));
        const u2 = Math.max(0.001, seededNoise(index * 7 + familyIndex * 47));
        const gaussianA = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        const gaussianB = Math.sqrt(-2 * Math.log(u1)) * Math.sin(2 * Math.PI * u2);
        const localX = gaussianA * spreadMajor * 0.46;
        const localY = gaussianB * spreadMinor * 0.52;
        const jitterZ = (seededNoise(index * 9 + familyIndex * 61) - 0.5) * zSpread;
        const rotatedX = Math.cos(angle) * localX - Math.sin(angle) * localY;
        const rotatedY = Math.sin(angle) * localX + Math.cos(angle) * localY;
        const x = rotatedX * 0.92;
        const y = rotatedY * 0.82;
        const z = jitterZ + (familyIndex - 2) * 0.045;
        positions[index * 3] = x;
        positions[index * 3 + 1] = y;
        positions[index * 3 + 2] = z;
        meanX += x;
        meanY += y;
        meanZ += z;
        colors[index * 3] = color.r;
        colors[index * 3 + 1] = color.g;
        colors[index * 3 + 2] = color.b;
      }
      meanX /= count;
      meanY /= count;
      meanZ /= count;
      for (let index = 0; index < count; index += 1) {
        positions[index * 3] -= meanX;
        positions[index * 3 + 1] -= meanY;
        positions[index * 3 + 2] -= meanZ;
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
      const material = new THREE.PointsMaterial({
        size: 0.077 + family.importance * 0.027,
        vertexColors: true,
        transparent: true,
        opacity: 0.72,
        depthWrite: false,
        blending: THREE.NormalBlending,
      });
      const points = new THREE.Points(geometry, material);
      points.frustumCulled = false;
      points.userData.familyId = family.id;
      points.userData.baseScale = 1 + family.importance * 0.05;
      points.userData.phase = familyIndex * 0.58;
      group.add(points);
      particleMeta.push({ familyId: family.id, label: family.label, color: densityCloudColor(family) });
    });

    let width = 0;
    let height = 0;
    const resize = () => {
      width = mount.clientWidth;
      height = mount.clientHeight;
      camera.aspect = width / Math.max(1, height);
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    resize();

    let dragging = false;
    let lastX = 0;
    let targetRotation = -0.06;
    let currentRotation = -0.06;
    const raycaster = new THREE.Raycaster();
    raycaster.params.Points = { threshold: 0.12 };
    const pointer = new THREE.Vector2();

    const setPointer = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const clampRotation = (value: number) => clamp(value, -0.42, 0.42);

    const handleMove = (event: PointerEvent) => {
      setPointer(event);
      if (dragging) {
        targetRotation = clampRotation(targetRotation + (event.clientX - lastX) * 0.0018);
        lastX = event.clientX;
        return;
      }
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(group.children, false);
      const hit = hits.find((item) => item.object.userData.familyId);
      if (hit) {
        const familyId = hit.object.userData.familyId as string;
        if (activeFamilyRef.current !== familyId) {
          const family = particleMeta.find((item) => item.familyId === familyId);
          setActiveId(familyId);
          setHoverLabel(family?.label ?? "density cluster");
        }
      }
    };

    const handleDown = (event: PointerEvent) => {
      dragging = true;
      lastX = event.clientX;
      renderer.domElement.setPointerCapture(event.pointerId);
    };
    const handleUp = (event: PointerEvent) => {
      dragging = false;
      renderer.domElement.releasePointerCapture(event.pointerId);
    };
    const handleLeave = () => {
      dragging = false;
      setActiveId(null);
      setHoverLabel("Naming Density Field");
    };

    renderer.domElement.addEventListener("pointermove", handleMove);
    renderer.domElement.addEventListener("pointerdown", handleDown);
    renderer.domElement.addEventListener("pointerup", handleUp);
    renderer.domElement.addEventListener("pointerleave", handleLeave);
    window.addEventListener("resize", resize);

    let frame = 0;
    const animate = () => {
      currentRotation += (targetRotation - currentRotation) * 0.08;
      const time = Date.now() * 0.001;
      group.rotation.y = currentRotation;
      group.rotation.x = -0.035;
      group.children.forEach((child) => {
        const familyId = child.userData.familyId as string | undefined;
        if (!familyId) return;
        const material = (child as THREE.Points | THREE.Mesh).material as THREE.Material & { opacity?: number };
        const currentActiveFamily = activeFamilyRef.current;
        const baseScale = Number(child.userData.baseScale ?? 1);
        const phase = Number(child.userData.phase ?? 0);
        const broadPulse = Math.sin(time * 0.82 + phase) * 0.075;
        const surfaceRipple = Math.sin(time * 1.58 + phase * 1.7) * 0.024;
        const breath = baseScale + broadPulse + surfaceRipple;
        child.scale.setScalar(breath);
        const targetOpacity = currentActiveFamily ? (currentActiveFamily === familyId ? 0.9 : 0.14) : 0.72;
        if (typeof material.opacity === "number") {
          material.opacity += (targetOpacity - material.opacity) * 0.08;
        }
      });
      renderer.render(scene, camera);
      frame = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      renderer.domElement.removeEventListener("pointermove", handleMove);
      renderer.domElement.removeEventListener("pointerdown", handleDown);
      renderer.domElement.removeEventListener("pointerup", handleUp);
      renderer.domElement.removeEventListener("pointerleave", handleLeave);
      renderer.dispose();
      group.children.forEach((child) => {
        if (child instanceof THREE.Mesh || child instanceof THREE.Points) {
          child.geometry.dispose();
          const material = child.material;
          if (Array.isArray(material)) material.forEach((item) => item.dispose());
          else material.dispose();
        }
      });
      mount.removeChild(renderer.domElement);
    };
  }, [families, setActiveId]);

  return (
    <section className="min-h-[41rem] overflow-hidden border border-ink/72 bg-[#efe4c8]" aria-label="3D naming-density cloud">
      <div className="flex min-h-[4.6rem] items-center justify-between gap-4 border-b border-ink/45 bg-[#efe4c8] px-4 py-3">
        <div>
          <p className="font-mono text-[0.9rem] font-black tracking-[0.15em] text-hub-ruby">3D Density Cloud</p>
          <p className="mt-1 text-[1.45rem] font-black leading-none text-ink">{cloudTitle}</p>
        </div>
        <p className="max-w-[18rem] text-right text-[0.86rem] leading-4 text-ink/62">
          Drag left-right to rotate. Label clicks isolate one particle family.
        </p>
      </div>
      <div className="relative h-[36.4rem]">
        <div ref={mountRef} className="absolute inset-0" />
      </div>
    </section>
  );
}

export function HubChart03NamingMachine({ data }: HubChart03NamingMachineProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [lockedFamilyId, setLockedFamilyId] = useState<string | null>(null);
  const families = useMemo(() => buildLayout(data.families), [data.families]);
  const resolvedActiveId = lockedFamilyId ?? activeId;
  const selected = selectedCopy(data, resolvedActiveId, families);
  const [activeFamilyId, activeTerm] = resolvedActiveId ? resolvedActiveId.split(":") : [null, null];
  const selectedFamily = activeFamilyId ? families.find((family) => family.id === activeFamilyId) ?? null : null;
  const selectedNode = selectedFamily && activeTerm ? selectedFamily.nodesPositioned.find((node) => node.term === activeTerm) ?? null : null;

  return (
    <div className="border border-ink/72 bg-wheat">
      <div className="grid border-b border-ink/52 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="min-w-0 px-4 py-3 sm:px-5">
          <p className="font-mono text-[0.92rem] font-black uppercase leading-5 tracking-[0.16em] text-hub-ruby">
            flat radial naming diagram / selected Chart 03 terms
          </p>
          <p className="mt-1 max-w-5xl text-[1.02rem] leading-6 text-ink/70">
            Hub became a modern naming shortcut: put a domain before it, and that domain starts to sound like a place of access, service, aggregation, or coordination.
          </p>
        </div>
        <dl className="grid border-t border-ink/52 lg:border-l lg:border-t-0">
          {[
            ["pattern", "X + hub"],
            ["families", String(data.families.length)],
            ["verdict", data.hypothesisVerdict],
          ].map(([label, value], index) => (
            <div key={label} className={`grid grid-cols-[6.3rem_1fr] ${index < 2 ? "border-b border-ink/52" : ""}`}>
              <dt className="border-r border-ink/52 px-3 py-3 font-mono text-[0.86rem] font-black uppercase tracking-[0.14em] text-hub-ruby">
                {label}
              </dt>
              <dd className="px-3 py-3 font-mono text-[0.92rem] font-black uppercase leading-5 tracking-[0.1em] text-hub-space">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="relative overflow-hidden">
        <svg
          viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
          role="img"
          aria-label="Hub Chart 03 radial naming machine diagram"
          className="block aspect-[1180/820] w-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <pattern id="hub-chart03-paper-grid" width="86" height="86" patternUnits="userSpaceOnUse">
              <path d="M 86 0 L 0 0 0 86" fill="none" stroke="rgba(13,6,48,0.04)" strokeWidth="1" />
            </pattern>
            <radialGradient id="hub-chart03-center-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={TEAL} stopOpacity="0.58" />
              <stop offset="46%" stopColor={TEAL} stopOpacity="0.2" />
              <stop offset="100%" stopColor={TEAL} stopOpacity="0" />
            </radialGradient>
            <radialGradient id="hub-chart03-page-wash" cx="54%" cy="44%" r="70%">
              <stop offset="0%" stopColor="#FFF9E7" stopOpacity="0.62" />
              <stop offset="58%" stopColor={WHEAT} stopOpacity="0.28" />
              <stop offset="100%" stopColor="#EDE2C6" stopOpacity="0.5" />
            </radialGradient>
            {families.map((family) => (
              <linearGradient
                key={family.id}
                id={`hub-chart03-gradient-${family.id}`}
                x1={CENTER_X}
                y1={CENTER_Y}
                x2={family.endX}
                y2={family.endY}
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor={visualFamilyColor(family)} stopOpacity="0.92" />
                <stop offset="58%" stopColor={visualFamilyColor(family)} stopOpacity="0.74" />
                <stop offset="100%" stopColor={gradientColor(family)} stopOpacity="0.62" />
              </linearGradient>
            ))}
          </defs>

          <rect width={VIEWBOX_WIDTH} height={VIEWBOX_HEIGHT} fill="url(#hub-chart03-page-wash)" />
          <rect width={VIEWBOX_WIDTH} height={VIEWBOX_HEIGHT} fill="url(#hub-chart03-paper-grid)" />
          <circle cx={CENTER_X} cy={CENTER_Y} r="192" fill="none" stroke={INK} strokeOpacity="0.13" strokeWidth="1.2" />
          <circle cx={CENTER_X} cy={CENTER_Y} r="86" fill="none" stroke={INK} strokeOpacity="0.13" strokeWidth="1" strokeDasharray="8 12" />
          <circle cx={CENTER_X} cy={CENTER_Y} r="128" fill="url(#hub-chart03-center-glow)" className="hub03-core-breathe" />

          <g>
            {families.map((family) => {
              const opacity = familyOpacity(resolvedActiveId, family.id);
              return (
                <g
                  key={family.id}
                  opacity={opacity}
                  className="hub03-family-ray cursor-pointer transition-opacity duration-200"
                  style={chart03Vars(families.findIndex((item) => item.id === family.id) * 220)}
                  onMouseEnter={() => setActiveId(family.id)}
                  onMouseLeave={() => setActiveId(null)}
                >
                  <line
                    x1={CENTER_X}
                    y1={CENTER_Y}
                    x2={family.endX}
                    y2={family.endY}
                    stroke={`url(#hub-chart03-gradient-${family.id})`}
                    strokeWidth={familyBandWidth(family.importance) * 0.9}
                    strokeLinecap="round"
                    strokeOpacity="0.78"
                  />
                </g>
              );
            })}
          </g>

          <g>
            {families.flatMap((family) =>
              family.nodesPositioned.map((node) => {
                const opacity = nodeOpacity(resolvedActiveId, family.id, node.term);
                const isActive = resolvedActiveId === family.id || resolvedActiveId === `${family.id}:${node.term}`;
                const showLabel = node.role === "primary" || resolvedActiveId === family.id || resolvedActiveId === `${family.id}:${node.term}`;
                return (
                  <g
                    key={`${family.id}-${node.term}`}
                    opacity={opacity}
                    className="hub03-node-cluster cursor-pointer transition-opacity duration-200"
                    style={chart03Vars((families.findIndex((item) => item.id === family.id) * 160) + node.r * 22)}
                    onMouseEnter={(event) => {
                      event.stopPropagation();
                      setActiveId(`${family.id}:${node.term}`);
                    }}
                    onMouseLeave={() => setActiveId(null)}
                  >
                    <title>{`${node.term} / ${node.familyLabel} / ${supportLabel(node.supportType)}`}</title>
                    <line
                      x1={node.rayStartX}
                      y1={node.rayStartY}
                      x2={node.x}
                      y2={node.y}
                      stroke={`url(#hub-chart03-gradient-${family.id})`}
                      strokeWidth={bandWidth(node.role, family.importance) * 0.86}
                      strokeLinecap="round"
                      strokeOpacity={isActive ? 0.9 : 0.72}
                      className="hub03-node-ray"
                      pathLength="1"
                    />
                    <line
                      x1={node.rayStartX}
                      y1={node.rayStartY}
                      x2={node.x}
                      y2={node.y}
                      stroke={INK}
                      strokeWidth="1"
                      strokeOpacity={isActive ? 0.34 : 0.18}
                    />
                    <circle cx={node.x} cy={node.y} r={node.r + 12} fill={WHEAT} opacity="0.88" />
                    <circle cx={node.x} cy={node.y} r={node.r + 10} fill="none" stroke={INK} strokeWidth="1.8" strokeOpacity="0.78" />
                    <circle cx={node.x} cy={node.y} r={node.r} fill={visualFamilyColor(family)} stroke={INK} strokeWidth="1.1" strokeOpacity="0.3" />
                    {showLabel ? (
                      <text
                        x={node.labelX}
                        y={node.labelY}
                        textAnchor={node.textAnchor}
                        fill={INK}
                        {...labelStrokeProps()}
                        className={`${node.role === "primary" ? "text-[23px]" : "text-[17px]"} font-black`}
                      >
                        {node.term}
                      </text>
                    ) : null}
                  </g>
                );
              }),
            )}
          </g>

          <g pointerEvents="none">
            {families.map((family) => (
              <text
                key={`family-label-${family.id}`}
                x={family.labelX}
                y={family.labelY}
                textAnchor={family.textAnchor}
                fill={INK}
                opacity={familyOpacity(resolvedActiveId, family.id)}
                {...labelStrokeProps()}
                className="font-mono text-[19px] font-black uppercase tracking-[0.14em]"
              >
                {family.label}
              </text>
            ))}
          </g>

          <g>
            <circle cx={CENTER_X} cy={CENTER_Y} r="54" fill={AMETHYST} className="hub03-core-breathe" />
            <circle cx={CENTER_X} cy={CENTER_Y} r="59" fill="none" stroke={WHEAT} strokeOpacity="0.82" strokeWidth="2" />
            <text x={CENTER_X} y={CENTER_Y - 5} textAnchor="middle" fill={WHEAT} className="text-[26px] font-black">
              X + HUB
            </text>
            <text x={CENTER_X} y={CENTER_Y + 22} textAnchor="middle" fill={WHEAT} className="font-mono text-[12px] font-black uppercase tracking-[0.17em]">
              naming core
            </text>
          </g>

        </svg>
      </div>

      <div className="grid gap-5 border-t border-ink/52 bg-[#eadfc1] p-5 xl:grid-cols-2">
        <NamingEvolutionField families={families} activeId={resolvedActiveId} setActiveId={setActiveId} />
        <DensityCloud3D families={families} activeId={resolvedActiveId} setActiveId={setActiveId} />
      </div>

      <div className="grid border-t border-ink/52 bg-wheat lg:grid-cols-[16rem_1fr]">
        <p className="border-b border-ink/52 px-4 py-4 font-mono text-[0.92rem] font-black uppercase tracking-[0.16em] text-hub-ruby lg:border-b-0 lg:border-r">
          isolate family
        </p>
        <div className="flex flex-wrap gap-2 px-4 py-3">
          {families.map((family) => {
            const isLocked = lockedFamilyId === family.id;
            return (
              <button
                type="button"
                key={`cloud-label-${family.id}`}
                onMouseEnter={() => setActiveId(family.id)}
                onMouseLeave={() => setActiveId(null)}
                onClick={() => setLockedFamilyId(isLocked ? null : family.id)}
                className={`border px-3 py-2 font-mono text-[0.78rem] font-black uppercase tracking-[0.13em] transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hub-space ${
                  isLocked ? "border-ink bg-ink text-wheat" : "border-ink/52 bg-[#efe4c8] text-ink hover:bg-[#e8dcc0]"
                }`}
                aria-pressed={isLocked}
              >
                <span className="mr-2 inline-block h-2 w-5 align-middle" style={{ backgroundColor: family.color }} />
                {familyKeyLabel(family.label)}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid border-t border-ink/52 bg-wheat lg:grid-cols-[16rem_1fr]">
        <p className="border-b border-ink/52 px-4 py-4 font-mono text-[0.92rem] font-black uppercase tracking-[0.16em] text-hub-ruby lg:border-b-0 lg:border-r">
          reading key
        </p>
        <p className="px-4 py-4 text-[1.02rem] leading-6 text-ink/70">
          Left shows naming families as a moving field; right shows the same families as overlapping density. No selected label means all five remain visible.
        </p>
      </div>

      <style jsx global>{`
        .hub03-family-ray,
        .hub03-node-cluster,
        .hub03-core-breathe {
          transform-box: fill-box;
          transform-origin: center;
        }

        .hub03-family-ray {
          animation: hub03-ray-breathe 6200ms ease-in-out var(--hub03-delay) infinite;
        }

        .hub03-node-cluster {
          animation: hub03-node-breathe 5200ms ease-in-out var(--hub03-delay) infinite;
        }

        .hub03-node-ray {
          stroke-dasharray: 1;
          stroke-dashoffset: 1;
          animation: hub03-line-draw 1800ms cubic-bezier(0.22, 1, 0.36, 1) var(--hub03-delay) forwards;
        }

        .hub03-core-breathe {
          animation: hub03-core-pulse 4600ms ease-in-out infinite;
        }

        @keyframes hub03-ray-breathe {
          0%, 100% { transform: scale(0.992); }
          48% { transform: scale(1.012); }
        }

        @keyframes hub03-node-breathe {
          0%, 100% { transform: translateY(0) scale(0.992); }
          50% { transform: translateY(-1.5px) scale(1.018); }
        }

        @keyframes hub03-line-draw {
          to { stroke-dashoffset: 0; }
        }

        @keyframes hub03-core-pulse {
          0%, 100% { transform: scale(0.98); opacity: 0.92; }
          50% { transform: scale(1.035); opacity: 1; }
        }

        @media (prefers-reduced-motion: reduce) {
          .hub03-family-ray,
          .hub03-node-cluster,
          .hub03-core-breathe,
          .hub03-node-ray {
            animation: none;
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </div>
  );
}
