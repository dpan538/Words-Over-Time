"use client";

import type { MouseEvent as ReactMouseEvent } from "react";
import {
  atmosphereBridgeInspectorId,
  atmosphereBridges,
  atmosphereMarkerInspectorId,
  atmosphereMarkers,
  atmosphereSectorInspectorId,
  atmosphereSectors,
  type AtmosphereMarker,
  type BridgeLink,
  type SectorNode,
} from "@/components/DepressionAtmosphereLoop";

type PointerPosition = { x: number; y: number };

type DepressionLivingMethodMapProps = {
  activeInspectorId?: string;
  onHover: (inspectorId: string | null, position?: PointerPosition) => void;
  onInspect: (inspectorId: string, position?: PointerPosition) => void;
};

const WIDTH = 1700;
const HEIGHT = 1140;
const CX = 840;
const CY = 590;
const RING_R = 270;
const INNER_R = 148;
const OUTER_R = 360;
const ink = "#050510";
const paper = "#F5ECD2";

const featuredMarkerIds = new Set([
  "personal-clinical-low-mood",
  "personal-lived-heavy",
  "collective-media-gloom",
  "economic-news-recession",
  "burnout-media-work",
  "media-news-crisis",
  "media-lived-online-sadness",
  "response-expert-treatment",
  "response-lived-help",
]);

const methodLabels: Record<string, { label: string; sub: string }> = {
  personal_affect: { label: "felt low", sub: "body / mood" },
  collective_mood: { label: "shared climate", sub: "social weather" },
  economic_downturn: { label: "public downturn", sub: "market / crisis" },
  productivity_burnout: { label: "depleted capacity", sub: "work / fatigue" },
  media_cultural_discourse: { label: "circulating mood", sub: "media / culture" },
  response_coping_wellbeing: { label: "care route", sub: "help / support" },
};

function hashValue(input: string) {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) % 1000003;
  }
  return hash / 1000003;
}

function point(radius: number, angle: number) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return {
    x: CX + Math.cos(rad) * radius,
    y: CY + Math.sin(rad) * radius,
  };
}

function sectorMid(sector: SectorNode) {
  return (sector.startAngle + sector.endAngle) / 2;
}

function sectorPath(startAngle: number, endAngle: number, radius: number) {
  const start = point(radius, startAngle);
  const end = point(radius, endAngle);
  const largeArc = Math.abs(endAngle - startAngle) > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

function bridgePath(bridge: BridgeLink) {
  const from = atmosphereSectors.find((sector) => sector.id === bridge.fromSector);
  const to = atmosphereSectors.find((sector) => sector.id === bridge.toSector);
  if (!from || !to) return "";
  const a = point(RING_R - 28, sectorMid(from));
  const b = point(RING_R - 28, sectorMid(to));
  const c1 = point(INNER_R + bridge.strength * 42, sectorMid(from) + 12);
  const c2 = point(INNER_R + bridge.strength * 42, sectorMid(to) - 12);
  return `M ${a.x} ${a.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${b.x} ${b.y}`;
}

function pointer(event: ReactMouseEvent<SVGElement>): PointerPosition {
  return { x: event.clientX, y: event.clientY };
}

function markerRadius(marker: AtmosphereMarker) {
  if (marker.lane === "expert") return RING_R - 106;
  if (marker.lane === "media") return RING_R + 8;
  return RING_R + 112;
}

function markerLabel(marker: AtmosphereMarker) {
  return marker.phraseCluster[0] ?? marker.id.replaceAll("-", " ");
}

function labelAnchor(x: number) {
  if (x < CX - 80) return "end";
  if (x > CX + 80) return "start";
  return "middle";
}

export function DepressionLivingMethodMap({
  activeInspectorId,
  onHover,
  onInspect,
}: DepressionLivingMethodMapProps) {
  const activeSector = activeInspectorId?.startsWith("depression-atmosphere-sector-")
    ? activeInspectorId.replace("depression-atmosphere-sector-", "")
    : null;
  const activeMarker = activeInspectorId?.startsWith("depression-atmosphere-marker-")
    ? activeInspectorId.replace("depression-atmosphere-marker-", "")
    : null;
  const activeBridge = activeInspectorId?.startsWith("depression-atmosphere-bridge-")
    ? activeInspectorId.replace("depression-atmosphere-bridge-", "")
    : null;

  return (
    <div className="mt-10 overflow-x-auto bg-wheat">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="block h-auto w-full min-w-[1120px]"
        role="img"
        aria-label="Chart 03B depression as a living method"
        onMouseLeave={() => onHover(null)}
      >
        <defs>
          <pattern id="living-method-grid" width="52" height="52" patternUnits="userSpaceOnUse">
            <path d="M 52 0 L 0 0 0 52" fill="none" stroke="#d8cfb8" strokeWidth="1" opacity="0.44" />
          </pattern>
          <pattern id="living-method-diagonal" width="28" height="28" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="28" stroke="#d8cfb8" strokeWidth="1" opacity="0.28" />
          </pattern>
          <filter id="living-soft-glow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="16" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {atmosphereSectors.map((sector) => (
            <radialGradient key={sector.id} id={`living-gradient-${sector.id}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={sector.color} stopOpacity="0.7" />
              <stop offset="62%" stopColor={sector.color} stopOpacity="0.34" />
              <stop offset="100%" stopColor={sector.color} stopOpacity="0" />
            </radialGradient>
          ))}
        </defs>

        <rect width={WIDTH} height={HEIGHT} fill={paper} />
        <rect width={WIDTH} height={HEIGHT} fill="url(#living-method-grid)" opacity="0.84" />
        <rect x="92" y="130" width={WIDTH - 184} height={HEIGHT - 244} fill="url(#living-method-diagonal)" opacity="0.16" />

        <g transform="translate(72 92)">
          <text fill="#a94f28" fontSize="28" fontWeight="900" letterSpacing="8">
            03B / DEPRESSION AS A LIVING METHOD
          </text>
          <text y="38" fill="#3f3a32" fontSize="14" fontWeight="900" letterSpacing="3">
            A SOCIAL ATMOSPHERE TEACHES ROUTES FOR READING, SHARING, MEASURING, AND RESPONDING.
          </text>
        </g>

        <circle cx={CX} cy={CY} r={OUTER_R} fill="none" stroke={ink} strokeDasharray="2 10" strokeWidth="2" opacity="0.5" />
        <circle cx={CX} cy={CY} r={RING_R} fill="none" stroke={ink} strokeDasharray="8 10" strokeWidth="1.8" opacity="0.44" />
        <circle cx={CX} cy={CY} r={INNER_R} fill="none" stroke={ink} strokeDasharray="2 8" strokeWidth="1.4" opacity="0.22" />

        {atmosphereBridges.map((bridge) => {
          const active = activeBridge === bridge.id;
          return (
            <path
              key={bridge.id}
              d={bridgePath(bridge)}
              fill="none"
              stroke={active ? ink : "#353535"}
              strokeWidth={active ? 2.8 : 1.4 + bridge.strength}
              strokeDasharray={active ? "" : "8 10"}
              opacity={active ? 0.78 : 0.35}
              className="cursor-crosshair"
              onMouseEnter={(event) => onHover(atmosphereBridgeInspectorId(bridge.id), pointer(event))}
              onMouseMove={(event) => onHover(atmosphereBridgeInspectorId(bridge.id), pointer(event))}
              onClick={(event) => {
                event.stopPropagation();
                onInspect(atmosphereBridgeInspectorId(bridge.id), pointer(event));
              }}
            />
          );
        })}

        {atmosphereSectors.map((sector) => {
          const mid = sectorMid(sector);
          const node = point(RING_R, mid);
          const label = point(OUTER_R + 82, mid);
          const textAnchor = labelAnchor(label.x);
          const active = activeSector === sector.id;
          const dimmed = activeInspectorId && !active && !activeMarker && !activeBridge;
          const method = methodLabels[sector.id] ?? { label: sector.shortLabel, sub: sector.filterGroup };

          return (
            <g key={sector.id} opacity={dimmed ? 0.28 : 1}>
              <path
                d={sectorPath(sector.startAngle, sector.endAngle, RING_R)}
                fill="none"
                stroke={sector.color}
                strokeWidth={active ? 7 : 4.4}
                opacity={active ? 0.92 : 0.58}
              />
              <circle cx={node.x} cy={node.y} r={84 + sector.generalization * 30} fill={`url(#living-gradient-${sector.id})`} filter="url(#living-soft-glow)" />
              <line x1={CX} y1={CY} x2={node.x} y2={node.y} stroke={sector.color} strokeWidth="1.6" strokeDasharray="7 9" opacity="0.52" />
              <g
                className="cursor-crosshair living-method-node"
                onMouseEnter={(event) => onHover(atmosphereSectorInspectorId(sector.id), pointer(event))}
                onMouseMove={(event) => onHover(atmosphereSectorInspectorId(sector.id), pointer(event))}
                onClick={(event) => {
                  event.stopPropagation();
                  onInspect(atmosphereSectorInspectorId(sector.id), pointer(event));
                }}
              >
                <circle cx={node.x} cy={node.y} r={28 + sector.weight * 12} fill={sector.color} opacity="0.94" />
                <circle cx={node.x} cy={node.y} r={47} fill="none" stroke={sector.color} strokeWidth="2" opacity="0.64" />
                <circle cx={node.x} cy={node.y} r="62" fill="transparent" />
              </g>
              <text
                x={label.x}
                y={label.y - 12}
                textAnchor={textAnchor}
                fill={ink}
                fontSize="19"
                fontWeight="900"
                letterSpacing="3"
              >
                {method.label.toUpperCase()}
              </text>
              <text
                x={label.x}
                y={label.y + 15}
                textAnchor={textAnchor}
                fill="#4e483d"
                fontSize="12"
                fontWeight="900"
                letterSpacing="2"
              >
                {method.sub.toUpperCase()}
              </text>
            </g>
          );
        })}

        {atmosphereMarkers
          .filter((marker) => featuredMarkerIds.has(marker.id) || activeMarker === marker.id || activeSector === marker.sectorId)
          .map((marker, index) => {
          const sector = atmosphereSectors.find((item) => item.id === marker.sectorId);
          if (!sector) return null;
          const radius = markerRadius(marker) + (hashValue(marker.id) - 0.5) * 92;
          const pos = point(radius, marker.angle + (hashValue(`${marker.id}-angle`) - 0.5) * 13);
          const active = activeMarker === marker.id;
          const sectorActive = activeSector === marker.sectorId;
          const dimmed = activeInspectorId && !active && !sectorActive && !activeBridge;
          const label = markerLabel(marker);
          const anchor = labelAnchor(pos.x);

          return (
            <g
              key={marker.id}
              className="cursor-crosshair living-method-marker"
              opacity={dimmed ? 0.22 : 1}
              onMouseEnter={(event) => onHover(atmosphereMarkerInspectorId(marker.id), pointer(event))}
              onMouseMove={(event) => onHover(atmosphereMarkerInspectorId(marker.id), pointer(event))}
              onClick={(event) => {
                event.stopPropagation();
                onInspect(atmosphereMarkerInspectorId(marker.id), pointer(event));
              }}
            >
              <circle cx={pos.x} cy={pos.y} r={34 + marker.magnitude * 20} fill={`url(#living-gradient-${sector.id})`} filter="url(#living-soft-glow)" className="living-method-cloud" style={{ animationDelay: `${index * 0.18}s` }} />
              <line x1={CX} y1={CY} x2={pos.x} y2={pos.y} stroke={sector.color} strokeWidth="1" strokeDasharray="2 8" opacity="0.26" />
              <circle cx={pos.x} cy={pos.y} r={9 + marker.magnitude * 8} fill={sector.color} opacity="0.9" />
              <circle cx={pos.x} cy={pos.y} r={active ? 29 : 20} fill="none" stroke={ink} strokeWidth={active ? 2.2 : 1.2} opacity={active ? 0.82 : 0.45} />
              <circle cx={pos.x} cy={pos.y} r="34" fill="transparent" />
              <text
                x={pos.x + (anchor === "end" ? -32 : anchor === "start" ? 32 : 0)}
                y={pos.y - 18}
                textAnchor={anchor}
                fill={ink}
                fontSize={active ? 14 : 10}
                fontWeight="900"
                letterSpacing="1.6"
                opacity={active ? 0.96 : marker.magnitude > 0.78 ? 0.76 : 0}
              >
                {label.toUpperCase()}
              </text>
            </g>
          );
        })}

        <g>
          <circle cx={CX} cy={CY} r="92" fill={ink} opacity="0.94" />
          <circle cx={CX} cy={CY} r="124" fill="none" stroke={ink} strokeWidth="2" opacity="0.42" />
          <text x={CX} y={CY - 3} textAnchor="middle" fill="#fff8e4" fontSize="23" fontWeight="900" letterSpacing="4">
            DEPRESSION
          </text>
          <text x={CX} y={CY + 34} textAnchor="middle" fill="#fff8e4" fontSize="11" fontWeight="900" letterSpacing="3" opacity="0.84">
            LIVING METHOD
          </text>
        </g>

        <style>{`
          .living-method-cloud {
            transform-box: fill-box;
            transform-origin: center;
            animation: living-cloud-pulse 5.6s ease-in-out infinite;
          }

          .living-method-node circle:nth-child(2) {
            animation: living-ring-breathe 4.8s ease-in-out infinite;
            transform-box: fill-box;
            transform-origin: center;
          }

          @keyframes living-cloud-pulse {
            0%, 100% { transform: scale(0.9); opacity: 0.72; }
            50% { transform: scale(1.14); opacity: 1; }
          }

          @keyframes living-ring-breathe {
            0%, 100% { transform: scale(0.9); opacity: 0.38; }
            50% { transform: scale(1.12); opacity: 0.68; }
          }

          @media (prefers-reduced-motion: reduce) {
            .living-method-cloud,
            .living-method-node circle:nth-child(2) {
              animation: none;
            }
          }
        `}</style>
      </svg>
    </div>
  );
}
