"use client";

import {
  AnimatePresence,
  MotionConfig,
  motion,
  useInView,
  useReducedMotion,
} from "motion/react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from "react";
import styles from "./mobile-hub.module.css";

export type HubPalette = readonly [string, string, string];
export type HubAtmosphereScene =
  | "hero"
  | "semantic"
  | "trend"
  | "evidence"
  | "visibility"
  | "scatter"
  | "phrase"
  | "closing";

type CloudLayout = readonly [
  { x: number; y: number; scale: number; opacity: number },
  { x: number; y: number; scale: number; opacity: number },
  { x: number; y: number; scale: number; opacity: number },
];

type SceneDefinition = {
  palette: HubPalette;
  form: number;
  layout: CloudLayout;
};

type AtmosphereState = SceneDefinition & {
  scene: HubAtmosphereScene;
  pulseKey: number;
  pulseScene: HubAtmosphereScene | null;
};

type ActivateOptions = {
  scene: HubAtmosphereScene;
  palette?: HubPalette;
  form?: number;
  pulse?: boolean;
};

type HubAtmosphereActions = {
  activate: (options: ActivateOptions) => void;
};

export const MORPH_EASE = [0.22, 1, 0.36, 1] as const;
export const SOFT_EASE = [0.4, 0, 0.2, 1] as const;

export const CLOUD_FORMS = [
  "M18 103C-4 52 34 8 92 17C137 24 159 2 204 24C251 48 259 99 228 137C207 162 232 190 213 226C188 273 132 251 98 273C54 302 3 276 9 220C14 181-13 150 18 103Z",
  "M25 90C7 40 48 1 105 18C144 30 171 9 215 37C257 63 252 117 220 149C194 176 226 203 199 238C167 280 116 247 79 266C32 290-12 251 5 199C16 165-4 128 25 90Z",
  "M8 111C-12 59 24 13 83 14C128 14 151-5 196 20C246 48 267 96 236 138C216 166 242 193 218 230C191 272 137 259 103 278C57 304 4 279 12 224C17 187-17 156 8 111Z",
  "M31 106C2 58 35 9 94 12C136 14 163-4 207 28C250 59 252 110 217 141C187 168 220 196 198 234C174 276 119 249 84 270C36 300-8 266 6 212C15 176-1 139 31 106Z",
  "M14 94C-7 45 31 4 88 22C130 35 158 7 203 31C252 57 263 107 228 146C205 172 232 202 207 235C177 275 128 250 91 273C42 304-7 270 8 217C18 181-14 137 14 94Z",
  "M23 116C-5 68 23 15 82 16C124 17 154-3 199 25C246 54 258 104 225 140C198 169 232 196 212 232C187 277 128 255 96 274C49 302 0 277 8 221C13 184-9 153 23 116Z",
] as const;

export const HUB_SCENES: Record<HubAtmosphereScene, SceneDefinition> = {
  hero: {
    palette: ["#ef805f", "#7c88e3", "#e4bb59"],
    form: 0,
    layout: [
      { x: -92, y: 64, scale: 1.72, opacity: .96 },
      { x: 137, y: -58, scale: 1.92, opacity: .96 },
      { x: -62, y: 430, scale: 1.38, opacity: .82 },
    ],
  },
  semantic: {
    palette: ["#ef8464", "#9485dc", "#e4bd62"],
    form: 1,
    layout: [
      { x: -94, y: -38, scale: 1.55, opacity: .82 },
      { x: 134, y: 178, scale: 1.78, opacity: .9 },
      { x: -40, y: 510, scale: 1.2, opacity: .68 },
    ],
  },
  trend: {
    palette: ["#e8759a", "#7485e2", "#9fca78"],
    form: 2,
    layout: [
      { x: -104, y: 36, scale: 1.52, opacity: .8 },
      { x: 150, y: 244, scale: 1.72, opacity: .86 },
      { x: -34, y: 596, scale: 1.14, opacity: .62 },
    ],
  },
  evidence: {
    palette: ["#ef805f", "#7c88e3", "#e4bb59"],
    form: 3,
    layout: [
      { x: -110, y: 154, scale: 1.64, opacity: .92 },
      { x: 148, y: -54, scale: 1.8, opacity: .9 },
      { x: 16, y: 534, scale: 1.24, opacity: .72 },
    ],
  },
  visibility: {
    palette: ["#ee8665", "#8291e4", "#b4d87c"],
    form: 4,
    layout: [
      { x: -116, y: 360, scale: 1.58, opacity: .76 },
      { x: 142, y: 34, scale: 1.72, opacity: .86 },
      { x: 6, y: 640, scale: 1.12, opacity: .66 },
    ],
  },
  scatter: {
    palette: ["#dc86a4", "#7184df", "#92bd78"],
    form: 5,
    layout: [
      { x: -92, y: -72, scale: 1.5, opacity: .76 },
      { x: 152, y: 310, scale: 1.76, opacity: .84 },
      { x: -42, y: 614, scale: 1.22, opacity: .62 },
    ],
  },
  phrase: {
    palette: ["#ef805f", "#818be1", "#e9b964"],
    form: 2,
    layout: [
      { x: -108, y: 264, scale: 1.65, opacity: .86 },
      { x: 139, y: -34, scale: 1.74, opacity: .88 },
      { x: 22, y: 630, scale: 1.16, opacity: .64 },
    ],
  },
  closing: {
    palette: ["#ee8766", "#7c87dc", "#e6ba61"],
    form: 4,
    layout: [
      { x: -94, y: -42, scale: 1.58, opacity: .86 },
      { x: 138, y: 326, scale: 1.78, opacity: .9 },
      { x: -36, y: 650, scale: 1.2, opacity: .68 },
    ],
  },
};

const HubAtmosphereStateContext = createContext<AtmosphereState | null>(null);
const HubAtmosphereActionsContext = createContext<HubAtmosphereActions | null>(null);

function safeId(value: string) {
  return value.replaceAll(":", "").replaceAll("_", "-");
}

export function HubAtmosphereProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AtmosphereState>(() => ({
    scene: "hero",
    ...HUB_SCENES.hero,
    pulseKey: 0,
    pulseScene: null,
  }));

  const activate = useCallback((options: ActivateOptions) => {
    setState((current) => {
      const defaults = HUB_SCENES[options.scene];
      const palette = options.palette ?? defaults.palette;
      const form = options.form ?? defaults.form;
      const shouldPulse = options.pulse === true;
      const unchanged = current.scene === options.scene
        && current.form === form
        && current.palette.every((color, index) => color === palette[index]);

      if (unchanged && !shouldPulse) return current;

      return {
        scene: options.scene,
        palette,
        form,
        layout: defaults.layout,
        pulseKey: shouldPulse ? current.pulseKey + 1 : current.pulseKey,
        pulseScene: shouldPulse ? options.scene : null,
      };
    });
  }, []);

  const actions = useMemo(() => ({ activate }), [activate]);

  return (
    <MotionConfig reducedMotion="user">
      <HubAtmosphereActionsContext.Provider value={actions}>
        <HubAtmosphereStateContext.Provider value={state}>
          {children}
        </HubAtmosphereStateContext.Provider>
      </HubAtmosphereActionsContext.Provider>
    </MotionConfig>
  );
}

export function useHubAtmosphere() {
  const state = useContext(HubAtmosphereStateContext);
  const actions = useContext(HubAtmosphereActionsContext);
  if (!state || !actions) throw new Error("useHubAtmosphere must be used within HubAtmosphereProvider");
  return { state, ...actions };
}

export function useHubAtmosphereActions() {
  const actions = useContext(HubAtmosphereActionsContext);
  if (!actions) throw new Error("useHubAtmosphereActions must be used within HubAtmosphereProvider");
  return actions;
}

export function useHubAtmosphereScene(
  scene: HubAtmosphereScene,
): RefObject<HTMLElement | null> {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, {
    amount: .08,
    margin: "-4% 0px -30% 0px",
  });
  const { activate } = useHubAtmosphereActions();

  useEffect(() => {
    if (!inView) return;
    activate({ scene, pulse: false });
  }, [activate, inView, scene]);

  return ref;
}

function toViewportWidthUnit(value: number) {
  return `${(value / 3.9).toFixed(4)}vw`;
}

export function HubAtmosphereViewport() {
  const id = safeId(useId());
  const { state } = useHubAtmosphere();
  const shouldReduceMotion = Boolean(useReducedMotion());
  const formIndex = state.form % CLOUD_FORMS.length;

  return (
    <div
      className={styles.atmosphereViewport}
      data-hub-atmosphere
      data-scene={state.scene}
      data-pulse-key={state.pulseKey}
      aria-hidden="true"
    >
      <div className={styles.atmosphereCloudStack}>
        {state.palette.map((color, index) => {
          const targetPath = CLOUD_FORMS[(formIndex + index) % CLOUD_FORMS.length];
          const targetLayout = state.layout[index];
          const innerFilterId = `${id}-inner-${index}`;
          const bodyFilterId = `${id}-body-${index}`;
          const haloFilterId = `${id}-halo-${index}`;
          const fillTransition = {
            fill: { duration: shouldReduceMotion ? .08 : .62, ease: SOFT_EASE },
            opacity: { duration: shouldReduceMotion ? .08 : .62, ease: SOFT_EASE },
          };

          return (
            <motion.div
              key={index}
              className={styles.atmosphereCloudPosition}
              initial={false}
              animate={{
                x: toViewportWidthUnit(targetLayout.x),
                y: toViewportWidthUnit(targetLayout.y),
                scale: targetLayout.scale,
              }}
              transition={{
                x: { duration: shouldReduceMotion ? 0 : .92, ease: MORPH_EASE },
                y: { duration: shouldReduceMotion ? 0 : .92, ease: MORPH_EASE },
                scale: { duration: shouldReduceMotion ? 0 : .92, ease: MORPH_EASE },
              }}
            >
              <motion.div
                className={styles.atmosphereCloudDrift}
                animate={shouldReduceMotion ? undefined : {
                  x: [0, 4 + index, -3, 0],
                  y: [0, -4, 3 + index, 0],
                }}
                transition={shouldReduceMotion ? undefined : {
                  duration: 23 + index * 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <svg
                  className={styles.atmosphereCloudSvg}
                  viewBox="-110 -110 500 520"
                  preserveAspectRatio="xMidYMid meet"
                  focusable="false"
                >
                  <defs>
                    <filter id={innerFilterId} x="-30%" y="-30%" width="160%" height="160%" colorInterpolationFilters="sRGB">
                      <feGaussianBlur stdDeviation="13" />
                    </filter>
                    <filter id={bodyFilterId} x="-55%" y="-55%" width="210%" height="210%" colorInterpolationFilters="sRGB">
                      <feGaussianBlur stdDeviation="24" />
                    </filter>
                    <filter id={haloFilterId} x="-90%" y="-90%" width="280%" height="280%" colorInterpolationFilters="sRGB">
                      <feGaussianBlur stdDeviation="45" />
                    </filter>
                  </defs>
                  <motion.path
                    initial={false}
                    d={targetPath}
                    filter={`url(#${haloFilterId})`}
                    animate={{ fill: color, opacity: targetLayout.opacity * .28 }}
                    transition={fillTransition}
                    className={styles.atmosphereHalo}
                  />
                  <motion.path
                    initial={false}
                    d={targetPath}
                    filter={`url(#${bodyFilterId})`}
                    animate={{ fill: color, opacity: targetLayout.opacity * .54 }}
                    transition={fillTransition}
                    className={styles.atmosphereBody}
                  />
                  <motion.path
                    initial={false}
                    d={targetPath}
                    filter={`url(#${innerFilterId})`}
                    animate={{ fill: color, opacity: targetLayout.opacity * .72 }}
                    transition={fillTransition}
                    className={styles.atmosphereInner}
                  />
                </svg>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      <svg className={styles.atmosphereOverlaySvg} viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice" focusable="false">
        <defs>
          <filter id={`${id}-grain`} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency=".71" numOctaves="3" seed="67" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
            <feComponentTransfer>
              <feFuncA type="table" tableValues="0 .1" />
            </feComponentTransfer>
          </filter>
          <filter id={`${id}-pulse`} x="-55%" y="-55%" width="210%" height="210%" colorInterpolationFilters="sRGB">
            <feGaussianBlur stdDeviation="24" />
          </filter>
          <linearGradient id={`${id}-line`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={state.palette[0]} stopOpacity="0" />
            <stop offset=".45" stopColor={state.palette[2]} stopOpacity=".34" />
            <stop offset="1" stopColor={state.palette[1]} stopOpacity="0" />
          </linearGradient>
        </defs>

        <motion.path
          d="M-50 625C45 555 96 698 190 625C267 565 329 620 446 548"
          fill="none"
          stroke={`url(#${id}-line)`}
          strokeWidth="1.2"
          strokeDasharray="20 30"
          animate={shouldReduceMotion ? undefined : { strokeDashoffset: [0, -100] }}
          transition={shouldReduceMotion ? undefined : { duration: 15, repeat: Infinity, ease: "linear" }}
          className={styles.atmosphereLine}
        />

        {state.pulseScene === state.scene && state.pulseKey > 0 && !shouldReduceMotion ? (
          <motion.path
            key={state.pulseKey}
            d={CLOUD_FORMS[formIndex]}
            fill={state.palette[0]}
            filter={`url(#${id}-pulse)`}
            initial={{
              x: state.layout[0].x,
              y: state.layout[0].y,
              scale: state.layout[0].scale * .64,
              opacity: 0,
            }}
            animate={{
              scale: [state.layout[0].scale * .64, state.layout[0].scale, state.layout[0].scale * 1.28],
              opacity: [0, .34, 0],
            }}
            transition={{ duration: 1.15, ease: SOFT_EASE, times: [0, .36, 1] }}
            className={styles.atmospherePulse}
          />
        ) : null}

        <rect width="390" height="844" filter={`url(#${id}-grain)`} className={styles.atmosphereGrain} />
      </svg>
    </div>
  );
}

export function LinkedCardPulse({
  active,
  itemKey,
  palette,
}: {
  active: boolean;
  itemKey: string;
  palette: HubPalette;
}) {
  const { state } = useHubAtmosphere();
  const shouldReduceMotion = Boolean(useReducedMotion());

  return (
    <AnimatePresence initial={false} mode="wait">
      {active && state.pulseScene === "evidence" && !shouldReduceMotion && state.pulseKey > 0 ? (
        <motion.div
          key={`${itemKey}-${state.pulseKey}`}
          className={styles.cardDiffusionPulse}
          style={{
            "--pulse-a": palette[0],
            "--pulse-b": palette[1],
          } as CSSProperties}
          initial={{ scale: .64, opacity: 0 }}
          animate={{ scale: [.64, .98, 1.18], opacity: [0, .48, 0] }}
          exit={{ opacity: 0, transition: { duration: .06 } }}
          transition={{ duration: 1.45, ease: SOFT_EASE, times: [0, .38, 1] }}
        />
      ) : null}
    </AnimatePresence>
  );
}
