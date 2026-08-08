"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

type DoubtCard = {
  id: string;
  label: string;
  evidence: string;
  source: string;
  doubt: string;
  color: string;
};

const doubtCards: DoubtCard[] = [
  {
    id: "postal",
    label: "postal permanence",
    evidence: "Forever Stamp / 2007",
    source: "USPS institutional product name",
    doubt: "Permanent validity is an administrative promise, not a timeless meaning.",
    color: "#F06B04",
  },
  {
    id: "chemical",
    label: "chemical persistence",
    evidence: "PFAS / forever chemicals",
    source: "EPA risk vocabulary",
    doubt: "Here forever names harm and persistence, not devotion or duration by choice.",
    color: "#A1081F",
  },
  {
    id: "digital",
    label: "digital retention",
    evidence: "online forever",
    source: "modern open-news context",
    doubt: "Persistence may be produced by platforms, caches, and archives rather than memory.",
    color: "#1570AC",
  },
  {
    id: "archive",
    label: "archival survival",
    evidence: "Gutenberg + Ngram trace",
    source: "book corpus survival",
    doubt: "What survives in print is not the same as what was most meaningful in speech.",
    color: "#FBB728",
  },
];

type CaptureBranch = {
  id: string;
  label: string;
  frame: string;
  source: string;
  reading: string;
  color: string;
  angle: number;
  strength: number;
  terms: string[];
};

const captureBranches: CaptureBranch[] = [
  {
    id: "stamp",
    label: "stamp",
    frame: "institutional promise",
    source: "USPS / forever stamp / 2007",
    reading: "forever as usable validity",
    color: "#F06B04",
    angle: 198,
    strength: 0.72,
    terms: ["stamp", "use", "promise", "valid", "postage", "rate", "mail", "issue", "price", "service", "forever", "product"],
  },
  {
    id: "chemical",
    label: "chemical",
    frame: "environmental warning",
    source: "EPA / PFAS / forever chemicals",
    reading: "forever as unwanted persistence",
    color: "#A1081F",
    angle: 224,
    strength: 0.9,
    terms: ["PFAS", "toxic", "water", "body", "persist", "risk", "soil", "chemical", "exposure", "health", "cleanup", "trace"],
  },
  {
    id: "archive",
    label: "archive",
    frame: "corpus survival",
    source: "Gutenberg + Ngram trace",
    reading: "forever as what survives in print",
    color: "#FBB728",
    angle: 252,
    strength: 0.6,
    terms: ["book", "trace", "print", "sample", "curve", "ngram", "archive", "scan", "library", "corpus", "survive", "frequency"],
  },
  {
    id: "online",
    label: "online",
    frame: "platform memory",
    source: "archives, caches, search traces",
    reading: "forever as difficult deletion",
    color: "#1570AC",
    angle: 286,
    strength: 0.82,
    terms: ["online", "cache", "share", "post", "profile", "delete", "search", "screen", "platform", "record", "copy", "upload"],
  },
  {
    id: "home",
    label: "home / young",
    frame: "affective commodity",
    source: "modern open-news snapshot",
    reading: "forever as repeated desire",
    color: "#E98B31",
    angle: 314,
    strength: 0.54,
    terms: ["home", "young", "love", "brand", "wish", "style", "shop", "trend", "song", "gift", "caption", "desire"],
  },
  {
    id: "memory",
    label: "memory",
    frame: "personal afterlife",
    source: "memorial and social phrases",
    reading: "forever as kept presence",
    color: "#2F7F3A",
    angle: 342,
    strength: 0.68,
    terms: ["memory", "remember", "miss", "always", "life", "remain", "gone", "tribute", "name", "story", "person", "afterlife"],
  },
];

function polarPoint(cx: number, cy: number, radius: number, angle: number) {
  const radians = (angle * Math.PI) / 180;
  return {
    x: Number((cx + Math.cos(radians) * radius).toFixed(3)),
    y: Number((cy + Math.sin(radians) * radius).toFixed(3)),
  };
}

function arcPath(cx: number, cy: number, radius: number, startAngle: number, endAngle: number) {
  const start = polarPoint(cx, cy, radius, startAngle);
  const end = polarPoint(cx, cy, radius, endAngle);
  const largeArc = Math.abs(endAngle - startAngle) > 180 ? 1 : 0;
  return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
}

function makeTextSprite(text: string, color = "#050510", size = 64) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  canvas.width = 512;
  canvas.height = 160;
  if (context) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.font = `900 ${size}px monospace`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillStyle = color;
    context.fillText(text.toUpperCase(), canvas.width / 2, canvas.height / 2);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(1.7, 0.52, 1);
  return sprite;
}

function makeDashedLine(points: THREE.Vector3[], color = "#050510", opacity = 0.45) {
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineDashedMaterial({
    color,
    dashSize: 0.085,
    gapSize: 0.055,
    linewidth: 1,
    opacity,
    transparent: true,
  });
  const line = new THREE.Line(geometry, material);
  line.computeLineDistances();
  return line;
}

function latRing(radius: number, y: number) {
  return Array.from({ length: 180 }, (_, index) => {
    const angle = (index / 179) * Math.PI * 2;
    return new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
  });
}

function meridian(radius: number, angle: number) {
  return Array.from({ length: 140 }, (_, index) => {
    const phi = -Math.PI / 2 + (index / 139) * Math.PI;
    return new THREE.Vector3(
      Math.cos(phi) * Math.cos(angle) * radius,
      Math.sin(phi) * radius,
      Math.cos(phi) * Math.sin(angle) * radius,
    );
  });
}

function evidencePath(radius: number, offset: number, phase: number) {
  return Array.from({ length: 28 }, (_, index) => {
    const t = index / 27;
    const angle = t * Math.PI * 1.72 + phase;
    const y = Math.sin(t * Math.PI * 2 + phase) * 0.48 + offset;
    const rr = radius * (0.64 + Math.sin(t * Math.PI) * 0.34);
    return new THREE.Vector3(Math.cos(angle) * rr, y, Math.sin(angle) * rr);
  });
}

function ForeverDoubtGlobe() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [hovered, setHovered] = useState<DoubtCard | null>(null);
  const [webglFailed, setWebglFailed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return undefined;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    } catch {
      setWebglFailed(true);
      return undefined;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0xfbf8ee, 0);
    setWebglFailed(false);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
    camera.position.set(0, 0.08, 6.4);

    const root = new THREE.Group();
    root.rotation.x = -0.12;
    const instrumentScale = { xz: 1.18, y: 0.7 };
    const mapInstrumentPoint = (point: THREE.Vector3) =>
      new THREE.Vector3(point.x * instrumentScale.xz, point.y * instrumentScale.y, point.z * instrumentScale.xz);
    const mapInstrumentPoints = (points: THREE.Vector3[]) => points.map(mapInstrumentPoint);
    scene.add(root);

    const raycaster = new THREE.Raycaster();
    raycaster.params.Line = { threshold: 0.08 };
    const pointer = new THREE.Vector2();
    const hoverTargets: THREE.Object3D[] = [];
    let dragging = false;
    let disposed = false;
    let previousX = 0;
    let userMoved = false;

    const shell = new THREE.Mesh(
      new THREE.SphereGeometry(2.08, 64, 20),
      new THREE.MeshBasicMaterial({ color: 0x050510, wireframe: true, transparent: true, opacity: 0.07 }),
    );
    shell.scale.set(instrumentScale.xz, instrumentScale.y, instrumentScale.xz);
    root.add(shell);

    [-1.2, -0.55, 0, 0.55, 1.2].forEach((y) => {
      const ringRadius = Math.sqrt(Math.max(0.01, 2.08 * 2.08 - y * y));
      root.add(makeDashedLine(mapInstrumentPoints(latRing(ringRadius, y)), "#050510", y === 0 ? 0.52 : 0.35));
    });

    Array.from({ length: 8 }).forEach((_, index) => {
      root.add(makeDashedLine(mapInstrumentPoints(meridian(2.08, (index / 8) * Math.PI * 2)), "#050510", 0.28));
    });

    const axisMaterial = new THREE.LineBasicMaterial({ color: 0x050510, transparent: true, opacity: 0.58 });
    [
      [new THREE.Vector3(0, -2.45 * instrumentScale.y, 0), new THREE.Vector3(0, 2.45 * instrumentScale.y, 0)],
      [new THREE.Vector3(-2.45 * instrumentScale.xz, 0, 0), new THREE.Vector3(2.45 * instrumentScale.xz, 0, 0)],
      [new THREE.Vector3(0, 0, -2.45 * instrumentScale.xz), new THREE.Vector3(0, 0, 2.45 * instrumentScale.xz)],
    ].forEach((points) => root.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), axisMaterial)));

    const nodeMaterial = new THREE.MeshBasicMaterial({ color: 0x050510 });
    const nodeGeometry = new THREE.SphereGeometry(0.032, 20, 14);
    const colorNodeGeometry = new THREE.BoxGeometry(0.105, 0.105, 0.105);

    doubtCards.forEach((card, cardIndex) => {
      const points = mapInstrumentPoints(evidencePath(1.98, [-0.62, -0.18, 0.26, 0.58][cardIndex], cardIndex * 1.25));
      root.add(makeDashedLine(points, "#050510", 0.32));
      points.forEach((point, index) => {
        const major = index % 7 === 0;
        const mesh = new THREE.Mesh(major ? colorNodeGeometry : nodeGeometry, major ? new THREE.MeshBasicMaterial({ color: card.color }) : nodeMaterial);
        mesh.position.copy(point);
        if (major) {
          mesh.userData.card = card;
          hoverTargets.push(mesh);
        }
        const scalar = major ? 1.25 : 0.82 + (index % 4) * 0.08;
        mesh.scale.setScalar(scalar);
        root.add(mesh);
      });
    });

    const a = makeTextSprite("A", "#050510", 78);
    a.position.copy(mapInstrumentPoint(new THREE.Vector3(-0.78, 0.1, 1.7)));
    root.add(a);
    const b = makeTextSprite("B", "#050510", 78);
    b.position.copy(mapInstrumentPoint(new THREE.Vector3(0.82, 0.1, 1.7)));
    root.add(b);
    const doubt = makeTextSprite("DOUBT", "#B75A2F", 42);
    doubt.position.copy(mapInstrumentPoint(new THREE.Vector3(0, -1.56, 1.75)));
    root.add(doubt);

    let frame = 0;
    const resize = () => {
      const bounds = wrap.getBoundingClientRect();
      const width = Math.max(320, Math.floor(bounds.width));
      const height = Math.max(560, Math.floor(bounds.height));
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    const updatePointer = (event: PointerEvent) => {
      const bounds = canvas.getBoundingClientRect();
      pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      pointer.y = -(((event.clientY - bounds.top) / bounds.height) * 2 - 1);
    };
    const onPointerDown = (event: PointerEvent) => {
      dragging = true;
      userMoved = true;
      previousX = event.clientX;
      setHovered(null);
      canvas.setPointerCapture?.(event.pointerId);
    };
    const onPointerMove = (event: PointerEvent) => {
      updatePointer(event);
      if (dragging) {
        const dx = event.clientX - previousX;
        root.rotation.y += dx * 0.006;
        root.rotation.x = -0.12;
        previousX = event.clientX;
        setHovered(null);
        return;
      }
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(hoverTargets, false)[0]?.object;
      if (!disposed) {
        setHovered((hit?.userData.card as DoubtCard | undefined) ?? null);
      }
    };
    const onPointerUp = (event: PointerEvent) => {
      dragging = false;
      if (canvas.hasPointerCapture?.(event.pointerId)) canvas.releasePointerCapture?.(event.pointerId);
    };
    const onPointerLeave = () => {
      dragging = false;
      if (!disposed) {
        setHovered(null);
      }
    };
    resize();
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointerleave", onPointerLeave);

    let animation = 0;
    const animate = () => {
      frame += 0.01;
      if (!dragging) {
        root.rotation.y += userMoved ? 0.0016 : 0.0048;
        root.rotation.x = -0.12;
        root.rotation.z = Math.sin(frame * 0.62) * 0.018;
      }
      renderer.render(scene, camera);
      animation = requestAnimationFrame(animate);
    };
    animate();
    window.addEventListener("resize", resize);

    return () => {
      disposed = true;
      cancelAnimationFrame(animation);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointerleave", onPointerLeave);
      root.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Line || object instanceof THREE.Sprite) {
          object.geometry?.dispose?.();
          if (Array.isArray(object.material)) object.material.forEach((material) => material.dispose());
          else object.material?.dispose?.();
        }
      });
      renderer.dispose();
    };
  }, []);

  return (
    <div ref={wrapRef} className="relative min-h-[680px] overflow-hidden bg-[#fbf8ee]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_48%,rgba(5,5,16,0.08),transparent_38%),linear-gradient(90deg,rgba(5,5,16,0.055)_1px,transparent_1px),linear-gradient(180deg,rgba(5,5,16,0.045)_1px,transparent_1px)] bg-[size:auto,44px_44px,44px_44px]" />
<canvas ref={canvasRef} className="absolute inset-0 h-full w-full cursor-ew-resize active:cursor-ew-resize" aria-label="Three dimensional evidence globe for forever" />
      {webglFailed ? (
        <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 border border-ink/20 bg-wheat/90 p-5 font-mono text-[0.85rem] font-black uppercase leading-6 tracking-[0.08em] text-ink/70">
          WebGL preview is unavailable in this browser state. The evidence cards below remain readable.
        </div>
      ) : null}
      <div className="pointer-events-none absolute left-6 top-6 max-w-[23rem]">
        <p className="font-mono text-[0.76rem] font-black uppercase tracking-[0.14em] text-fire">
          chart 02 / 3d evidence instrument
        </p>
        <p className="mt-3 font-mono text-[0.7rem] font-black uppercase leading-5 tracking-[0.08em] text-ink/60">
          A and B mark two possible readings.<br />Drag horizontally to turn the instrument.<br />Hover coloured blocks for evidence.
        </p>
      </div>
      {hovered ? (
        <div className="pointer-events-none absolute right-6 top-6 max-w-[24rem] border border-ink/25 bg-wheat/[0.92] p-4 shadow-[8px_8px_0_rgba(5,5,16,0.18)]">
          <p className="font-mono text-[0.76rem] font-black uppercase tracking-[0.12em] text-fire">hover evidence</p>
          <p className="mt-2 font-mono text-[1rem] font-black uppercase leading-6 tracking-[0.08em] text-ink">{hovered.evidence}</p>
          <p className="mt-2 font-mono text-[0.78rem] font-black uppercase leading-5 tracking-[0.08em] text-ink/60">{hovered.source}</p>
          <p className="mt-3 text-sm leading-6 text-ink/[0.68]">{hovered.doubt}</p>
        </div>
      ) : null}
    </div>
  );
}

export function ForeverInstitutionalDoubt() {
  return (
    <div className="overflow-hidden border border-ink/[0.18] bg-[#fbf8ee]">
      <div className="grid border-b border-ink/[0.18] lg:grid-cols-[22rem_1fr]">
        <div className="border-b border-ink/[0.18] p-6 lg:border-b-0 lg:border-r">
          <p className="font-mono text-[0.9rem] font-black uppercase tracking-[0.16em] text-fire">
            chart 02 / permanence under suspicion
          </p>
          <h3 className="mt-4 text-[clamp(1.9rem,2.9vw,3.6rem)] font-black leading-[0.95] text-ink">
            Evidence does not settle forever.
          </h3>
          <p className="mt-5 text-base leading-7 text-ink/[0.68]">
            A 3D evidence instrument tests institutional permanence without turning it into a final answer.
          </p>
        </div>
        <ForeverDoubtGlobe />
      </div>
      <div className="grid lg:grid-cols-4">
        {doubtCards.map((card, index) => (
          <article key={card.id} className={`min-h-[200px] border-ink/[0.18] p-5 ${index < 3 ? "border-b lg:border-b-0 lg:border-r" : ""}`}>
            <p className="font-mono text-[0.84rem] font-black uppercase tracking-[0.14em] text-fire">
              evidence {String(index + 1).padStart(2, "0")}
            </p>
            <p className="mt-4 font-mono text-[1rem] font-black uppercase leading-6 tracking-[0.08em] text-ink">
              {card.evidence}
            </p>
            <p className="mt-3 font-mono text-[0.82rem] font-black uppercase leading-5 tracking-[0.08em] text-ink/60">
              {card.source}
            </p>
            <p className="mt-4 text-base leading-7 text-ink/[0.68]">
              {card.doubt}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}

export function ForeverModernCaptureSupplement() {
  const [hoveredBandId, setHoveredBandId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const cx = 600;
  const cy = 710;
  const innerRadius = 78;
  const outerRadius = 530;
  const rings = [120, 168, 216, 264, 312, 360, 408, 456, 504, 552];
  const historicalBands = [
    {
      id: "devotional",
      label: "devotional permanence",
      dates: "1600s-1700s",
      evidence: "formulaic print + early Ngram trace",
      start: 192,
      end: 214,
      frequency: 0.84,
      search: 0.08,
      color: "#5BAACB",
    },
    {
      id: "literary",
      label: "literary vow",
      dates: "1800-1899",
      evidence: "romantic and narrative uses",
      start: 216,
      end: 238,
      frequency: 0.76,
      search: 0.16,
      color: "#A1081F",
    },
    {
      id: "memory",
      label: "memory and loss",
      dates: "1850-1930",
      evidence: "elegy, remains, remembered forever",
      start: 240,
      end: 262,
      frequency: 0.62,
      search: 0.2,
      color: "#2F7F3A",
    },
    {
      id: "archive",
      label: "archive survival",
      dates: "1900-2022",
      evidence: "Gutenberg + Google Ngram",
      start: 264,
      end: 286,
      frequency: 0.7,
      search: 0.32,
      color: "#FBB728",
    },
    {
      id: "stamp",
      label: "institutional validity",
      dates: "2007",
      evidence: "USPS Forever Stamp",
      start: 288,
      end: 310,
      frequency: 0.42,
      search: 0.76,
      color: "#F06B04",
    },
    {
      id: "chemical",
      label: "chemical persistence",
      dates: "2010s-2026",
      evidence: "PFAS / forever chemicals",
      start: 312,
      end: 334,
      frequency: 0.38,
      search: 0.92,
      color: "#A1081F",
    },
    {
      id: "platform",
      label: "platform retention",
      dates: "2000s-2026",
      evidence: "online forever / caches / archives",
      start: 336,
      end: 350,
      frequency: 0.52,
      search: 0.86,
      color: "#1570AC",
    },
  ];
  const rays = historicalBands.flatMap((band, bandIndex) =>
    Array.from({ length: 19 }, (_, lineIndex) => {
      const t = lineIndex / 18;
      const angle = band.start + (band.end - band.start) * t;
      const wave = Math.sin((lineIndex + 1) * 1.73 + bandIndex * 0.9) * 0.5 + Math.cos(lineIndex * 0.71) * 0.5;
      const frequencyEnd = 125 + band.frequency * 295 + wave * 42;
      const searchEnd = frequencyEnd + band.search * 116 + Math.abs(wave) * 28;
      return { ...band, angle, lineIndex, frequencyEnd, searchEnd };
    }),
  );
  const activeBand = historicalBands.find((band) => band.id === hoveredBandId) ?? null;
  const activeMiddle = activeBand ? (activeBand.start + activeBand.end) / 2 : 270;
  const activeInner = polarPoint(cx, cy, innerRadius + 10, activeMiddle);
  const activeOuter = polarPoint(cx, cy, outerRadius + 10, activeMiddle);
  const activeLabel = polarPoint(cx, cy, 610, activeMiddle);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="mt-6 overflow-hidden border border-ink/[0.18] bg-[#020204] text-wheat">
        <div className="relative flex min-h-[820px] items-center justify-center overflow-hidden">
          <p className="font-mono text-[0.72rem] font-black uppercase tracking-[0.18em] text-[#f3efe1]/50">
            preparing historical signal semicircle
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 overflow-hidden border border-ink/[0.18] bg-[#020204] text-wheat">
      <div className="relative min-h-[820px] overflow-hidden">
        <svg viewBox="0 0 1200 820" role="img" aria-label="Two layer historical meaning and signal-length semicircle for forever" className="relative z-10 h-full min-h-[820px] w-full bg-[#020204]">
          <defs>
            <filter id="captureGlow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <radialGradient id="captureCenterGlow" cx="50%" cy="86%" r="48%">
              <stop offset="0%" stopColor="#f3efe1" stopOpacity="0.22" />
              <stop offset="42%" stopColor="#f3efe1" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#f3efe1" stopOpacity="0" />
            </radialGradient>
          </defs>

          <rect width="1200" height="820" fill="#020204" />
          <circle cx={cx} cy={cy} r="430" fill="url(#captureCenterGlow)" />
          <circle cx={cx} cy={cy} r="46" fill="#f3efe1" opacity="0.98" />
          <circle cx={cx} cy={cy} r="76" fill="none" stroke="#f3efe1" strokeOpacity="0.82" strokeWidth="2" />
          <circle cx={cx} cy={cy} r="99" fill="none" stroke="#f3efe1" strokeOpacity="0.36" strokeDasharray="2 8" strokeWidth="1" />
          <text x={cx} y={cy + 8} textAnchor="middle" className="fill-[#020204] font-mono text-[1.02rem] font-black uppercase tracking-[0.15em]">
            forever
          </text>

          {rings.map((radius, index) => (
            <path
              key={radius}
              d={arcPath(cx, cy, radius, 190, 350)}
              fill="none"
              stroke="#f3efe1"
              strokeDasharray={index % 3 === 0 ? "1 7" : index % 3 === 1 ? "5 8" : "2 13"}
              strokeOpacity={0.12 + index * 0.025}
              strokeWidth={index === rings.length - 1 ? 1.1 : 0.72}
              className="capture-arc-draw"
              style={{ animationDelay: `${index * 0.05}s` }}
            />
          ))}

          {rays.map((ray, index) => {
            const start = polarPoint(cx, cy, innerRadius, ray.angle);
            const freq = polarPoint(cx, cy, ray.frequencyEnd, ray.angle);
            const search = polarPoint(cx, cy, Math.min(outerRadius, ray.searchEnd), ray.angle);
            const dot = polarPoint(cx, cy, ray.frequencyEnd + (ray.searchEnd - ray.frequencyEnd) * 0.48, ray.angle);
            const isActive = hoveredBandId === ray.id;
            return (
              <g key={`${ray.id}-${ray.lineIndex}`} onMouseEnter={() => setHoveredBandId(ray.id)} onMouseLeave={() => setHoveredBandId(null)}>
                <line
                  x1={start.x}
                  y1={start.y}
                  x2={freq.x}
                  y2={freq.y}
                  stroke="#f3efe1"
                  strokeOpacity={isActive ? 0.98 : index % 6 === 0 ? 0.82 : 0.46}
                  strokeWidth={isActive ? 1.55 : index % 9 === 0 ? 1.2 : 0.62}
                  className="capture-ray-draw"
                  style={{ animationDelay: `${0.12 + index * 0.008}s` }}
                />
                <line
                  x1={freq.x}
                  y1={freq.y}
                  x2={search.x}
                  y2={search.y}
                  stroke="#f3efe1"
                  strokeDasharray="2 7"
                  strokeOpacity={isActive ? 0.72 : 0.22 + ray.search * 0.26}
                  strokeWidth="0.8"
                  className="capture-ray-draw"
                  style={{ animationDelay: `${0.24 + index * 0.008}s` }}
                />
                <circle cx={dot.x} cy={dot.y} r={isActive ? 2.5 : index % 8 === 0 ? 2 : 1.05} fill="#f3efe1" opacity={isActive ? 0.95 : 0.3 + ray.search * 0.35} />
              </g>
            );
          })}

          {historicalBands.map((band, bandIndex) => {
            const middle = (band.start + band.end) / 2;
            const marker = polarPoint(cx, cy, 410 + band.search * 54, middle);
            const outerLabel = polarPoint(cx, cy, 582, middle);
            const arc = arcPath(cx, cy, 436 + band.frequency * 58, band.start, band.end);
            const hitArc = arcPath(cx, cy, 500, band.start - 1.4, band.end + 1.4);
            const divider = polarPoint(cx, cy, 560, band.start);
            const isActive = hoveredBandId === band.id;
            return (
              <g key={band.id} onMouseEnter={() => setHoveredBandId(band.id)} onMouseLeave={() => setHoveredBandId(null)} className="cursor-crosshair">
                <path d={hitArc} fill="none" stroke="transparent" strokeWidth="96" />
                <line x1={cx} y1={cy} x2={divider.x} y2={divider.y} stroke="#f3efe1" strokeOpacity="0.18" strokeWidth="0.8" />
                <path d={arc} fill="none" stroke={band.color} strokeOpacity={isActive ? 1 : 0.68} strokeWidth={isActive ? 6 : 3.6} className="capture-arc-draw" style={{ animationDelay: `${0.72 + bandIndex * 0.08}s` }} />
                <circle cx={marker.x} cy={marker.y} r={isActive ? 9 : 6} fill={band.color} filter="url(#captureGlow)" className="capture-node-pulse" />
                <circle cx={marker.x} cy={marker.y} r={isActive ? 21 : 15} fill="none" stroke="#f3efe1" strokeOpacity={isActive ? 0.86 : 0.5} strokeWidth="1.2" />
                <g transform={`translate(${outerLabel.x} ${outerLabel.y}) rotate(${middle - 180})`}>
                  <text className="fill-[#f3efe1] font-mono text-[0.64rem] font-black uppercase tracking-[0.15em]" opacity={isActive ? 1 : 0.82}>
                    {band.label}
                  </text>
                  <text y="17" className="fill-[#f3efe1] font-mono text-[0.46rem] font-black uppercase tracking-[0.13em]" opacity={isActive ? 0.84 : 0.42}>
                    {band.dates}
                  </text>
                </g>
              </g>
            );
          })}

          {activeBand ? (
            <g className="pointer-events-none">
              <line
                x1={activeInner.x}
                y1={activeInner.y}
                x2={activeOuter.x}
                y2={activeOuter.y}
                stroke="#f3efe1"
                strokeOpacity="0.95"
                strokeWidth="4"
              />
              <g transform={`translate(${activeOuter.x} ${activeOuter.y}) rotate(${activeMiddle - 180})`}>
                <rect x="-28" y="-108" width="56" height="120" fill="#f3efe1" opacity="0.92" />
                <rect x="-11" y="10" width="22" height="78" fill="#f3efe1" opacity="0.82" />
              </g>
              <g transform="translate(842 42)">
                <rect x="0" y="0" width="292" height="92" fill="#020204" stroke="#f3efe1" strokeOpacity="0.56" />
                <rect x="-14" y="14" width="9" height="62" fill="#f3efe1" opacity="0.9" />
                <text x="18" y="27" className="fill-[#f3efe1] font-mono text-[0.58rem] font-black uppercase tracking-[0.12em]">
                  {activeBand.label}
                </text>
                <text x="18" y="50" className="fill-[#f3efe1] font-mono text-[0.44rem] font-black uppercase tracking-[0.1em]" opacity="0.7">
                  {activeBand.dates} . {activeBand.evidence}
                </text>
                <text x="18" y="72" className="fill-[#f3efe1] font-mono text-[0.44rem] font-black uppercase tracking-[0.1em]" opacity="0.56">
                  freq {Math.round(activeBand.frequency * 100)} / public signal {Math.round(activeBand.search * 100)}
                </text>
              </g>
            </g>
          ) : null}

          {Array.from({ length: 33 }, (_, index) => {
            const angle = 193 + index * 4.8;
            const base = polarPoint(cx, cy, 106, angle);
            const high = polarPoint(cx, cy, 146 + (index % 7) * 15, angle);
            return (
              <g key={index}>
                <line
                  x1={base.x}
                  y1={base.y}
                  x2={high.x}
                  y2={high.y}
                  stroke="#f3efe1"
                  strokeOpacity={index % 4 === 0 ? 0.8 : 0.38}
                  strokeWidth={index % 4 === 0 ? 2 : 0.9}
                />
              </g>
            );
          })}

          <path d={arcPath(cx, cy, 574, 190, 350)} fill="none" stroke="#f3efe1" strokeOpacity="0.78" strokeWidth="1.2" />
          <path d="M 600 116 L 600 662" stroke="#f3efe1" strokeOpacity="0.22" strokeWidth="1" strokeDasharray="5 10" />
          <text x="70" y="60" className="fill-[#f3efe1] font-mono text-[1.16rem] font-black uppercase tracking-[0.18em]">
            03B . historical signal semicircle
          </text>
          <text x="70" y="94" className="fill-[#f3efe1] font-mono text-[0.5rem] font-black uppercase tracking-[0.14em]" opacity="0.58">
            outer layer: meaning in historical order / inner layer: line length from frequency + public search signal
          </text>
        </svg>
      </div>
      <div className="border-t border-wheat/[0.16] bg-[#020204] p-5">
        <p className="max-w-6xl font-mono text-[0.68rem] font-black uppercase leading-6 tracking-[0.1em] text-[#f3efe1]/60">
          Reading note . meanings move clockwise from devotional print to platform retention; solid ray length marks frequency, dotted extension marks public-search pressure. Hover a meaning band for the exact cue.
        </p>
      </div>
      <style>{`
        .capture-ray-draw {
          stroke-dasharray: 520;
          stroke-dashoffset: 520;
          animation: captureDraw 1.8s cubic-bezier(.22,.75,.2,1) forwards;
        }
        .capture-arc-draw {
          stroke-dasharray: 900;
          stroke-dashoffset: 900;
          animation: captureDraw 2.2s cubic-bezier(.22,.75,.2,1) forwards;
        }
        .capture-node-pulse {
          transform-origin: center;
          animation: capturePulse 2.8s ease-in-out infinite;
        }
        @keyframes captureDraw {
          to { stroke-dashoffset: 0; }
        }
        @keyframes capturePulse {
          0%, 100% { opacity: .72; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
