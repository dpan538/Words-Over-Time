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
  memo,
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

type AtmosphereVisualState = SceneDefinition & {
  scene: HubAtmosphereScene;
  visualKey: string;
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
  return value.replaceAll(":", "").replaceAll("_", "-").replace(/[^a-zA-Z0-9-]/g, "");
}

function atmosphereVisualKey(state: SceneDefinition & { scene: HubAtmosphereScene }) {
  return `${state.scene}-${state.form}-${state.palette.join("-")}`;
}

function atmosphereVisualState(state: AtmosphereState): AtmosphereVisualState {
  return {
    scene: state.scene,
    palette: state.palette,
    form: state.form,
    layout: state.layout,
    visualKey: atmosphereVisualKey(state),
  };
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
    amount: .01,
    margin: "-28% 0px -64% 0px",
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

const AtmosphereCloudBank = memo(function AtmosphereCloudBank({
  bank,
  bankIndex,
  active,
  preparing,
  rootId,
  shouldReduceMotion,
}: {
  bank: AtmosphereVisualState;
  bankIndex: 0 | 1;
  active: boolean;
  preparing: boolean;
  rootId: string;
  shouldReduceMotion: boolean;
}) {
  const formIndex = bank.form % CLOUD_FORMS.length;

  return (
    <motion.div
      className={styles.atmosphereCloudBank}
      data-active={active}
      data-preparing={preparing}
      data-visual-key={bank.visualKey}
      initial={false}
      animate={{ opacity: preparing ? 0 : active ? 1 : 0 }}
      transition={{
        opacity: {
          duration: preparing || shouldReduceMotion ? 0 : active ? .46 : .34,
          ease: SOFT_EASE,
        },
      }}
    >
      {bank.palette.map((color, index) => {
        const targetPath = CLOUD_FORMS[(formIndex + index) % CLOUD_FORMS.length];
        const targetLayout = bank.layout[index];
        const coreColor = index === 0
          ? bank.palette[2]
          : index === 1
            ? "#a882df"
            : bank.palette[0];
        const filterPrefix = `${rootId}-bank-${bankIndex}-${safeId(bank.visualKey)}-${index}`;
        const innerFilterId = `${filterPrefix}-inner`;
        const bodyFilterId = `${filterPrefix}-body`;
        const haloFilterId = `${filterPrefix}-halo`;
        const bodyGradientId = `${filterPrefix}-body-fill`;
        const innerGradientId = `${filterPrefix}-inner-fill`;

        return (
          <div
            key={index}
            className={styles.atmosphereCloudPosition}
            style={{
              transform: `translate3d(${toViewportWidthUnit(targetLayout.x)}, ${toViewportWidthUnit(targetLayout.y)}, 0) scale(${targetLayout.scale})`,
            }}
          >
            <motion.div
              className={styles.atmosphereCloudDrift}
              animate={shouldReduceMotion || (!active && !preparing) ? undefined : {
                x: [0, 4 + index, -3, 0],
                y: [0, -4, 3 + index, 0],
              }}
              transition={shouldReduceMotion || (!active && !preparing) ? undefined : {
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
                  <filter id={innerFilterId} x="-45%" y="-45%" width="190%" height="190%" colorInterpolationFilters="sRGB">
                    <feGaussianBlur stdDeviation="13" />
                  </filter>
                  <filter id={bodyFilterId} x="-65%" y="-65%" width="230%" height="230%" colorInterpolationFilters="sRGB">
                    <feGaussianBlur stdDeviation="24" />
                  </filter>
                  <filter id={haloFilterId} x="-105%" y="-105%" width="310%" height="310%" colorInterpolationFilters="sRGB">
                    <feGaussianBlur stdDeviation="45" />
                  </filter>
                  <radialGradient
                    id={bodyGradientId}
                    gradientUnits="userSpaceOnUse"
                    cx={88 + index * 34}
                    cy={96 + index * 24}
                    r="226"
                  >
                    <stop offset="0" stopColor={color} stopOpacity=".96" />
                    <stop offset=".5" stopColor={color} stopOpacity=".72" />
                    <stop offset=".8" stopColor={coreColor} stopOpacity=".38" />
                    <stop offset="1" stopColor={color} stopOpacity=".22" />
                  </radialGradient>
                  <radialGradient
                    id={innerGradientId}
                    gradientUnits="userSpaceOnUse"
                    cx={126 + index * 18}
                    cy={118 + index * 29}
                    r="178"
                  >
                    <stop offset="0" stopColor={coreColor} stopOpacity="1" />
                    <stop offset=".42" stopColor={color} stopOpacity=".9" />
                    <stop offset=".76" stopColor={color} stopOpacity=".42" />
                    <stop offset="1" stopColor={color} stopOpacity=".18" />
                  </radialGradient>
                </defs>
                <path
                  d={targetPath}
                  fill={color}
                  opacity={targetLayout.opacity * .34}
                  filter={`url(#${haloFilterId})`}
                  className={styles.atmosphereHalo}
                />
                <path
                  d={targetPath}
                  fill={`url(#${bodyGradientId})`}
                  opacity={targetLayout.opacity * .64}
                  filter={`url(#${bodyFilterId})`}
                  className={styles.atmosphereBody}
                />
                <path
                  d={targetPath}
                  fill={`url(#${innerGradientId})`}
                  opacity={targetLayout.opacity * .82}
                  filter={`url(#${innerFilterId})`}
                  className={styles.atmosphereInner}
                />
              </svg>
            </motion.div>
          </div>
        );
      })}
    </motion.div>
  );
});

export function HubAtmosphereViewport() {
  const id = safeId(useId());
  const { state } = useHubAtmosphere();
  const shouldReduceMotion = Boolean(useReducedMotion());
  const formIndex = state.form % CLOUD_FORMS.length;
  const targetVisual = useMemo(() => atmosphereVisualState(state), [
    state.form,
    state.layout,
    state.palette,
    state.scene,
  ]);
  const [banks, setBanks] = useState<readonly [AtmosphereVisualState, AtmosphereVisualState]>(() => [
    targetVisual,
    targetVisual,
  ]);
  const [activeBank, setActiveBank] = useState<0 | 1>(0);
  const [preparingBank, setPreparingBank] = useState<0 | 1 | null>(null);
  const activeBankRef = useRef<0 | 1>(0);
  const settledVisualKeyRef = useRef(targetVisual.visualKey);
  const requestedVisualRef = useRef(targetVisual);
  const isPreparingRef = useRef(false);
  const isCrossfadingRef = useRef(false);
  const preparationFramesRef = useRef<number[]>([]);
  const crossfadeTimerRef = useRef<number | null>(null);
  const stageVisualRef = useRef<(visual: AtmosphereVisualState) => void>(() => undefined);

  const stageVisual = useCallback((visual: AtmosphereVisualState) => {
    requestedVisualRef.current = visual;

    if (settledVisualKeyRef.current === visual.visualKey && !isPreparingRef.current) return;
    if (isCrossfadingRef.current) return;

    if (isPreparingRef.current) {
      preparationFramesRef.current.forEach((frame) => window.cancelAnimationFrame(frame));
      preparationFramesRef.current = [];
      isPreparingRef.current = false;
    }

    preparationFramesRef.current.forEach((frame) => window.cancelAnimationFrame(frame));
    preparationFramesRef.current = [];

    const nextBank: 0 | 1 = activeBankRef.current === 0 ? 1 : 0;
    isPreparingRef.current = true;
    setPreparingBank(nextBank);
    setBanks((current) => {
      const next: [AtmosphereVisualState, AtmosphereVisualState] = [current[0], current[1]];
      next[nextBank] = visual;
      return next;
    });

    const reveal = () => {
      activeBankRef.current = nextBank;
      settledVisualKeyRef.current = visual.visualKey;
      isPreparingRef.current = false;
      setActiveBank(nextBank);
      setPreparingBank(null);
      preparationFramesRef.current = [];

      if (shouldReduceMotion) {
        const queued = requestedVisualRef.current;
        if (queued.visualKey !== settledVisualKeyRef.current) {
          window.queueMicrotask(() => stageVisualRef.current(queued));
        }
        return;
      }

      isCrossfadingRef.current = true;
      crossfadeTimerRef.current = window.setTimeout(() => {
        isCrossfadingRef.current = false;
        crossfadeTimerRef.current = null;
        const queued = requestedVisualRef.current;
        if (queued.visualKey !== settledVisualKeyRef.current) {
          stageVisualRef.current(queued);
        }
      }, 420);
    };

    if (shouldReduceMotion) {
      reveal();
      return;
    }

    const firstFrame = window.requestAnimationFrame(() => {
      const secondFrame = window.requestAnimationFrame(reveal);
      preparationFramesRef.current = [secondFrame];
    });
    preparationFramesRef.current = [firstFrame];
  }, [shouldReduceMotion]);

  useEffect(() => {
    stageVisualRef.current = stageVisual;
  }, [stageVisual]);

  useEffect(() => {
    stageVisual(targetVisual);
  }, [stageVisual, targetVisual]);

  useEffect(() => {
    return () => {
      preparationFramesRef.current.forEach((frame) => window.cancelAnimationFrame(frame));
      preparationFramesRef.current = [];
      if (crossfadeTimerRef.current !== null) {
        window.clearTimeout(crossfadeTimerRef.current);
        crossfadeTimerRef.current = null;
      }
    };
  }, []);

  return (
    <div
      className={styles.atmosphereViewport}
      data-hub-atmosphere
      data-scene={state.scene}
      data-pulse-key={state.pulseKey}
      aria-hidden="true"
    >
      <div className={styles.atmosphereCloudStack}>
        {banks.map((bank, bankIndex) => (
          <AtmosphereCloudBank
            key={bankIndex}
            bank={bank}
            bankIndex={bankIndex as 0 | 1}
            active={activeBank === bankIndex}
            preparing={preparingBank === bankIndex}
            rootId={id}
            shouldReduceMotion={shouldReduceMotion}
          />
        ))}
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
          <radialGradient id={`${id}-pulse-fill`} gradientUnits="userSpaceOnUse" cx="108" cy="120" r="205">
            <stop offset="0" stopColor={state.palette[0]} stopOpacity=".88" />
            <stop offset=".52" stopColor={state.palette[2]} stopOpacity=".52" />
            <stop offset="1" stopColor={state.palette[1]} stopOpacity=".18" />
          </radialGradient>
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
          <g transform={`translate(${state.layout[0].x} ${state.layout[0].y}) scale(${state.layout[0].scale * 1.08})`}>
            <motion.g
              key={state.pulseKey}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, .28, 0] }}
              transition={{ duration: .82, ease: SOFT_EASE, times: [0, .34, 1] }}
              className={styles.atmospherePulse}
            >
              <path
                d={CLOUD_FORMS[formIndex]}
                fill={`url(#${id}-pulse-fill)`}
                filter={`url(#${id}-pulse)`}
              />
            </motion.g>
          </g>
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
