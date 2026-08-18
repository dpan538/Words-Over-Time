"use client";

import { useId, useState, type CSSProperties } from "react";
import type { HubFamilyId, HubMobileAnalysis } from "@/types/hubMobileAnalysis";
import { CLOUD_FORMS, useHubAtmosphereActions } from "./HubAtmosphere";
import styles from "./mobile-hub.module.css";

const SEMANTIC_BODY_PATH = [
  "M144 42",
  "C192 21 243 32 269 72",
  "C282 91 287 112 305 120",
  "C327 129 347 124 360 143",
  "C382 176 373 216 342 240",
  "C325 252 317 271 324 291",
  "C337 330 321 364 286 383",
  "C262 396 251 420 252 446",
  "C255 482 231 512 196 517",
  "C172 520 155 510 139 494",
  "C119 474 101 470 78 478",
  "C43 490 15 468 11 433",
  "C8 405 25 389 36 369",
  "C51 343 46 323 25 304",
  "C-4 279 -5 235 24 209",
  "C43 192 52 176 44 151",
  "C31 112 57 76 96 69",
  "C113 66 126 50 144 42 Z",
].join(" ");

const SEMANTIC_LABEL_POSITIONS: Record<HubFamilyId, { x: number; y: number }> = {
  mechanical_core: { x: 91, y: 126 },
  central_place: { x: 253, y: 101 },
  transport_routing: { x: 302, y: 230 },
  institutional_cluster: { x: 270, y: 362 },
  network_system: { x: 128, y: 429 },
  digital_platform: { x: 101, y: 278 },
};

const familySummaries: Record<HubFamilyId, string> = {
  mechanical_core: "Wheel-center phrases begin highest and finish lower.",
  central_place: "Place phrases become visible in 1940–59 and finish higher.",
  transport_routing: "Transport phrases become visible in 1940–59 around routes and distribution.",
  institutional_cluster: "Institutional phrases become visible in 1960–79 around organizations and places.",
  network_system: "Network phrases become visible in 1980–99 around connected-system nodes.",
  digital_platform: "Digital phrases become visible in 2000–19 around services, data, and platforms.",
};

export function OrganicSemanticField({ analysis }: { analysis: HubMobileAnalysis }) {
  const [activeId, setActiveId] = useState<HubFamilyId>(analysis.families[0].id);
  const { activate } = useHubAtmosphereActions();
  const uid = useId().replaceAll(":", "");
  const active = analysis.families.find((family) => family.id === activeId) ?? analysis.families[0];
  const periodById = new Map(analysis.periods.map((period) => [period.id, period]));

  const selectFamily = (familyId: HubFamilyId) => {
    const familyIndex = analysis.families.findIndex((family) => family.id === familyId);
    const family = analysis.families[familyIndex];
    setActiveId(familyId);
    activate({
      scene: "semantic",
      palette: [family.color, "#858fe4", "#edbd61"],
      form: familyIndex % CLOUD_FORMS.length,
      pulse: true,
    });
  };

  return (
    <div className={styles.semanticComposition} data-hub-organic-field>
      <div className={styles.semanticCloud}>
        <svg className={styles.semanticCloudSvg} viewBox="0 0 390 540" role="img" aria-label="One connected semantic field containing six selectable families. Its outline is navigational and does not encode quantity.">
          <defs>
            <mask id={`${uid}-body-mask`}>
              <rect width="390" height="540" fill="black" />
              <path d={SEMANTIC_BODY_PATH} fill="white" />
            </mask>
            <filter id={`${uid}-halo`} x="-30%" y="-30%" width="160%" height="160%" colorInterpolationFilters="sRGB">
              <feGaussianBlur stdDeviation="22" />
            </filter>
            <filter id={`${uid}-semantic-grain`} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
              <feTurbulence type="fractalNoise" baseFrequency=".68" numOctaves="3" seed="38" stitchTiles="stitch" />
              <feColorMatrix type="saturate" values="0" />
              <feComponentTransfer>
                <feFuncA type="table" tableValues="0 0.11" />
              </feComponentTransfer>
            </filter>
            {analysis.families.map((family) => (
              <radialGradient
                id={`${uid}-${family.id}`}
                key={family.id}
                gradientUnits="userSpaceOnUse"
                cx={SEMANTIC_LABEL_POSITIONS[family.id].x}
                cy={SEMANTIC_LABEL_POSITIONS[family.id].y}
                r="132"
              >
                <stop offset="0%" stopColor={family.color} stopOpacity="0.98" />
                <stop offset="40%" stopColor={family.color} stopOpacity="0.84" />
                <stop offset="76%" stopColor={family.color} stopOpacity="0.34" />
                <stop offset="100%" stopColor={family.color} stopOpacity="0.12" />
              </radialGradient>
            ))}
          </defs>
          <path d={SEMANTIC_BODY_PATH} fill="#997fe1" opacity="0.22" filter={`url(#${uid}-halo)`} />
          <g mask={`url(#${uid}-body-mask)`} className={styles.semanticColorBody}>
            <rect width="390" height="540" fill="#edced9" opacity="0.4" />
            {analysis.families.map((family) => {
              const position = SEMANTIC_LABEL_POSITIONS[family.id];
              return (
                <circle
                  key={family.id}
                  cx={position.x}
                  cy={position.y}
                  r="144"
                  fill={`url(#${uid}-${family.id})`}
                  opacity={activeId === family.id ? 1 : .86}
                  className={styles.semanticColorNode}
                />
              );
            })}
            <rect width="390" height="540" filter={`url(#${uid}-semantic-grain)`} className={styles.semanticCloudGrain} />
          </g>
        </svg>
        <div className={styles.semanticCloudLabels}>
          {analysis.families.map((family) => {
            const position = SEMANTIC_LABEL_POSITIONS[family.id];
            const period = periodById.get(family.firstVisiblePeriodId)!;
            return (
              <button
                key={family.id}
                type="button"
                style={{ "--x": `${(position.x / 390) * 100}%`, "--y": `${(position.y / 540) * 100}%` } as CSSProperties}
                aria-pressed={activeId === family.id}
                onClick={() => selectFamily(family.id)}
              >
                <strong>{family.label}</strong>
                <span>FIRST / {period.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div id="hub-semantic-readout" className={styles.semanticReadout} aria-live="polite">
        <p><span style={{ background: active.color }} />{active.label}</p>
        <strong>{periodById.get(active.firstVisiblePeriodId)!.label}</strong>
        <span>{familySummaries[active.id]}</span>
      </div>
      <p className={styles.semanticMeasure}>MEASURE / first period ≥ {analysis.thresholdPerMillion} occurrences per million. Shape is navigation, not scale.</p>
    </div>
  );
}
