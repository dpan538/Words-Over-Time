"use client";

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { useInView, useReducedMotion } from "motion/react";
import { CANVAS_DRIFT_RATE, motionMilliseconds } from "./ArtificialMotionTiming";
import styles from "./mobile-artificial.module.css";

type SectionEntrance<T extends HTMLElement> = {
  entered: boolean;
  inView: boolean;
  reduced: boolean;
  ref: RefObject<T | null>;
};

function useHydratedReducedMotion() {
  const requested = Boolean(useReducedMotion());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => setHydrated(true), []);

  return hydrated && requested;
}

export function useArtificialEntrance<T extends HTMLElement>(): SectionEntrance<T> {
  const ref = useRef<T | null>(null);
  const inView = useInView(ref, { amount: .24, margin: "0px 0px -8% 0px" });
  const reduced = useHydratedReducedMotion();
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    if (inView) setSeen(true);
  }, [inView]);

  return { ref, inView, reduced, entered: reduced || seen };
}

type NebulaAnchor = { x: number; y: number };

type NebulaCanvasProps = {
  activeAnchor?: number;
  anchors: readonly NebulaAnchor[];
  circular?: boolean;
  count: number;
  entered: boolean;
  inView: boolean;
  seed: number;
};

type Particle = {
  accent: boolean;
  anchor: number;
  angle: number;
  depth: number;
  distance: number;
  drift: number;
  opacity: number;
  phase: number;
  radius: number;
  speed: number;
};

function mulberry32(seed: number) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let next = value;
    next = Math.imul(next ^ next >>> 15, next | 1);
    next ^= next + Math.imul(next ^ next >>> 7, next | 61);
    return ((next ^ next >>> 14) >>> 0) / 4294967296;
  };
}

export function NebulaCanvas({ activeAnchor = -1, anchors, circular = false, count, entered, inView, seed }: NebulaCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const entranceProgressRef = useRef(0);
  const anchorsRef = useRef(anchors);
  const activeAnchorRef = useRef(activeAnchor);
  anchorsRef.current = anchors;
  activeAnchorRef.current = activeAnchor;
  const reduced = useHydratedReducedMotion();
  const particles = useMemo(() => {
    const random = mulberry32(seed);
    return Array.from({ length: count }, (_, index): Particle => {
      const depth = index % 3;
      return {
        accent: random() < .65,
        anchor: Math.floor(random() * Math.max(anchors.length, 1)),
        angle: random() * Math.PI * 2,
        depth,
        distance: .014 + random() * (.065 + depth * .03),
        drift: .003 + random() * .009,
        opacity: .045 + random() * (.105 + depth * .065),
        phase: random() * Math.PI * 2,
        radius: index % 31 === 0 ? 3.35 : .6 + random() * (1.2 + depth * .4),
        speed: .000025 + random() * .000035,
      };
    });
  }, [anchors.length, count, seed]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let frame = 0;
    let resizeFrame = 0;
    let width = 1;
    let height = 1;
    let entranceStart = 0;
    const startingEntrance = entranceProgressRef.current;
    let pageVisible = document.visibilityState !== "hidden";

    const makeGlowSprite = (red: number, green: number, blue: number) => {
      const sprite = document.createElement("canvas");
      const size = 64;
      sprite.width = size;
      sprite.height = size;
      const spriteContext = sprite.getContext("2d");
      if (!spriteContext) return sprite;
      const gradient = spriteContext.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      gradient.addColorStop(0, `rgba(${red},${green},${blue},1)`);
      gradient.addColorStop(.32, `rgba(${red},${green},${blue},.42)`);
      gradient.addColorStop(1, `rgba(${red},${green},${blue},0)`);
      spriteContext.fillStyle = gradient;
      spriteContext.fillRect(0, 0, size, size);
      return sprite;
    };

    const neutralSprites = [
      makeGlowSprite(172, 178, 188),
      makeGlowSprite(224, 227, 232),
      makeGlowSprite(255, 255, 255),
    ];
    const accentSprite = makeGlowSprite(255, 49, 95);

    const resize = () => {
      width = Math.max(1, canvas.clientWidth);
      height = Math.max(1, canvas.clientHeight);
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      const context = canvas.getContext("2d");
      context?.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const draw = (time: number) => {
      const context = canvas.getContext("2d");
      if (!context) return;
      context.clearRect(0, 0, width, height);
      const anchorsNow = anchorsRef.current;
      if (!entered || anchorsNow.length === 0) return;
      const entrance = reduced ? 1 : Math.min(1, startingEntrance + Math.max(0, (time - entranceStart) / motionMilliseconds(900)));
      entranceProgressRef.current = entrance;
      context.save();
      if (circular) {
        context.beginPath();
        context.arc(width / 2, height / 2, Math.min(width, height) * .46, 0, Math.PI * 2);
        context.clip();
      }
      context.globalCompositeOperation = "lighter";
      for (const particle of particles) {
        const anchor = anchorsNow[particle.anchor % anchorsNow.length] ?? anchorsNow[0];
        const driftTime = reduced ? 0 : time * particle.speed * CANVAS_DRIFT_RATE;
        const distance = particle.distance * (1 + Math.sin(particle.phase + driftTime * 3) * .12);
        const angle = particle.angle + driftTime;
        const x = (anchor.x + Math.cos(angle) * distance) * width;
        const y = (anchor.y + Math.sin(angle) * distance * .72) * height;
        const active = particle.anchor === activeAnchorRef.current ? 1.42 : 1;
        const pulse = reduced ? 1 : .82 + Math.sin(particle.phase + time * particle.speed * 8 * CANVAS_DRIFT_RATE) * .18;
        const alpha = particle.opacity * entrance * active * pulse;
        const radius = particle.radius * (1 + particle.depth * .14);
        const isAccent = particle.accent && particle.anchor === activeAnchorRef.current;
        const sprite = isAccent ? accentSprite : neutralSprites[particle.depth] ?? neutralSprites[2];
        const glowRadius = radius * 3.2;
        context.globalAlpha = alpha;
        context.drawImage(sprite, x - glowRadius, y - glowRadius, glowRadius * 2, glowRadius * 2);
      }
      context.globalAlpha = 1;
      context.restore();
    };

    const tick = (time: number) => {
      frame = 0;
      draw(time);
      if (!reduced && inView && pageVisible) frame = window.requestAnimationFrame(tick);
    };

    const start = () => {
      if (!frame && !reduced && inView && pageVisible) frame = window.requestAnimationFrame(tick);
    };

    const handleVisibility = () => {
      pageVisible = document.visibilityState !== "hidden";
      if (!pageVisible && frame) {
        window.cancelAnimationFrame(frame);
        frame = 0;
      } else start();
    };

    resize();
    entranceStart = performance.now();
    draw(entranceStart);
    start();
    const observer = new ResizeObserver(() => {
      if (resizeFrame) window.cancelAnimationFrame(resizeFrame);
      resizeFrame = window.requestAnimationFrame(() => {
        resizeFrame = 0;
        resize();
        draw(performance.now());
      });
    });
    observer.observe(canvas);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
      if (frame) window.cancelAnimationFrame(frame);
      if (resizeFrame) window.cancelAnimationFrame(resizeFrame);
    };
  }, [circular, entered, inView, particles, reduced]);

  return <canvas ref={canvasRef} className={styles.nebulaCanvas} aria-hidden="true" />;
}
