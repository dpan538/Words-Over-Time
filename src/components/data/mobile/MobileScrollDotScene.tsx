"use client";

import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useRef, type ReactNode } from "react";

import {
  DOT_LAYOUTS,
  VISUAL_DOTS,
  type DotLayoutName,
  type DotPoint,
} from "./mobile-dot-layouts";

import styles from "./mobile-data.module.css";

const clamp01 = (value: number) =>
  Math.max(0, Math.min(1, value));

const smoothstep = (value: number) => {
  const p = clamp01(value);
  return p * p * (3 - 2 * p);
};

const scrollElastic = (value: number) => {
  const p = clamp01(value);

  if (p <= 0.8) {
    return 1.05 * smoothstep(p / 0.8);
  }

  return (
    1.05 -
    0.05 * smoothstep((p - 0.8) / 0.2)
  );
};

const lerp = (
  from: number,
  to: number,
  progress: number,
) => from + (to - from) * progress;

function MorphDot({
  index,
  progress,
  from,
  to,
}: {
  index: number;
  progress: MotionValue<number>;
  from: DotPoint;
  to: DotPoint;
}) {
  const localProgress = useTransform(() => {
    const raw = progress.get();

    const stagger =
      (index / (VISUAL_DOTS.length - 1)) *
      0.08;

    const shifted = clamp01(
      (raw - stagger) / (1 - stagger),
    );

    return scrollElastic(shifted);
  });

  const cx = useTransform(() =>
    lerp(from.x, to.x, localProgress.get()),
  );

  const cy = useTransform(() =>
    lerp(from.y, to.y, localProgress.get()),
  );

  const radius = useTransform(() =>
    Math.max(
      0.4,
      lerp(from.r, to.r, localProgress.get()),
    ),
  );

  const opacity = useTransform(() =>
    clamp01(
      lerp(
        from.opacity,
        to.opacity,
        smoothstep(
          clamp01(progress.get() * 1.1),
        ),
      ),
    ),
  );

  return (
    <motion.circle
      data-dot-id={VISUAL_DOTS[index].id}
      data-primary-dot
      cx={cx}
      cy={cy}
      r={radius}
      opacity={opacity}
      className={styles.primaryDot}
      vectorEffect="non-scaling-stroke"
    />
  );
}

export function MobileScrollDotScene({
  fromLayout,
  toLayout,
  children,
  className,
}: {
  fromLayout: DotLayoutName;
  toLayout: DotLayoutName;
  children?: ReactNode;
  className?: string;
}) {
  const sectionRef =
    useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 90%", "start 30%"],
  });

  const from = DOT_LAYOUTS[fromLayout];
  const to = DOT_LAYOUTS[toLayout];

  return (
    <section
      ref={sectionRef}
      className={`${styles.dotCardTrack} ${
        className ?? ""
      }`}
      data-from-layout={fromLayout}
      data-to-layout={toLayout}
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        className={styles.dotSceneSvg}
        aria-hidden="true"
      >
        <g className={styles.primaryDotLayer}>
          {VISUAL_DOTS.map((dot, index) => (
            <MorphDot
              key={dot.id}
              index={index}
              progress={scrollYProgress}
              from={from[index]}
              to={to[index]}
            />
          ))}
        </g>

        {children}
      </svg>
    </section>
  );
}
