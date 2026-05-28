"use client";

import { type CSSProperties, useMemo, useState } from "react";

type ModernTransitRoute = {
  route_id: string;
  label: string;
  color: string;
  station_count: number;
  transfer_count: number;
  max_particle_density: number;
};

type ModernTransitStation = {
  station_id: string;
  year: number;
  label: string;
  route_ids: string[];
  description: string;
  confidence: string;
  evidence_strength: number;
  needs_manual_review: boolean;
  transfer: boolean;
};

type ModernFlowMetric = {
  route_id: string;
  period_label: string;
  particle_density: number;
};

export type PrivacyModernTransitDataset = {
  word: "privacy";
  layer_id: "modern_transit_system";
  title: string;
  year_range: [number, number];
  routes: ModernTransitRoute[];
  stations: ModernTransitStation[];
  flow_metrics: {
    by_route_period: ModernFlowMetric[];
  };
};

type PrivacyChart01ModernTransitProps = {
  dataset: PrivacyModernTransitDataset;
};

type Point = {
  x: number;
  y: number;
};

type LabelPosition = Point & {
  anchor: "start" | "middle" | "end";
  lines?: string[];
};

const INK = "#050510";
const PAPER = "#F7F0DC";
const VIOLET = "#6F3AA6";
const MONO_STYLE = { fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" };
const SANS_STYLE = { fontFamily: "Arial, Helvetica, sans-serif" };
const ROUTE_CODE_STYLE: CSSProperties = {
  ...SANS_STYLE,
  textRendering: "geometricPrecision",
  WebkitFontSmoothing: "antialiased",
};
const MAP_WIDTH = 1600;
const MAP_HEIGHT = 1680;

const ROUTE_CODES: Record<string, string> = {
  rights_personhood: "R",
  information_data_protection: "D",
  internet_platform_interface: "P",
  surveillance_security_tension: "S",
  breach_risk_compliance: "B",
  identity_consent_advertising: "I",
  ai_biometrics_sensitive_data: "A",
};

const ROUTE_KEY_LABELS: Record<string, string> = {
  rights_personhood: "RIGHTS / PERSONHOOD",
  information_data_protection: "DATA PROTECTION",
  internet_platform_interface: "PLATFORM INTERFACE",
  surveillance_security_tension: "SURVEILLANCE / SECURITY",
  breach_risk_compliance: "BREACH / RISK",
  identity_consent_advertising: "IDENTITY / CONSENT",
  ai_biometrics_sensitive_data: "AI / BIOMETRICS",
};

const STATION_POINTS: Record<string, Point> = {
  echr_article_8_1950: { x: 210, y: 300 },
  griswold_1965: { x: 360, y: 300 },
  katz_1967: { x: 500, y: 460 },
  hew_fipps_1973: { x: 210, y: 560 },
  privacy_act_1974: { x: 360, y: 560 },
  oecd_guidelines_1980: { x: 520, y: 560 },
  convention_108_1981: { x: 660, y: 460 },
  ecpa_1986: { x: 790, y: 700 },
  eu_directive_1995: { x: 880, y: 560 },
  hipaa_1996: { x: 880, y: 830 },
  coppa_1998: { x: 520, y: 960 },
  patriot_act_2001: { x: 660, y: 830 },
  eprivacy_directive_2002: { x: 1050, y: 700 },
  california_breach_2003: { x: 1050, y: 1140 },
  ftc_privacy_report_2012: { x: 1160, y: 700 },
  snowden_2013: { x: 1160, y: 1320 },
  gdpr_adoption_2016: { x: 1260, y: 1140 },
  cambridge_analytica_2018: { x: 1360, y: 700 },
  gdpr_applies_2018: { x: 1260, y: 560 },
  ccpa_2018_2020: { x: 1360, y: 1140 },
  china_pipl_2021: { x: 1450, y: 560 },
  state_privacy_2023: { x: 1490, y: 1140 },
  eu_ai_act_2024: { x: 1490, y: 330 },
};

const LABEL_POSITIONS: Record<string, LabelPosition> = {
  echr_article_8_1950: { x: 190, y: 245, anchor: "start", lines: ["ECHR", "Article 8"] },
  griswold_1965: { x: 390, y: 285, anchor: "start", lines: ["Griswold"] },
  katz_1967: { x: 528, y: 422, anchor: "start", lines: ["Reasonable", "expectation"] },
  hew_fipps_1973: { x: 210, y: 650, anchor: "middle", lines: ["Fair information", "practices"] },
  privacy_act_1974: { x: 360, y: 468, anchor: "middle", lines: ["Privacy Act"] },
  oecd_guidelines_1980: { x: 520, y: 650, anchor: "middle", lines: ["OECD", "guidelines"] },
  convention_108_1981: { x: 690, y: 422, anchor: "start", lines: ["Convention 108"] },
  ecpa_1986: { x: 815, y: 772, anchor: "start", lines: ["Electronic", "communications"] },
  eu_directive_1995: { x: 880, y: 510, anchor: "middle", lines: ["EU data", "directive"] },
  hipaa_1996: { x: 852, y: 902, anchor: "end", lines: ["Health", "privacy"] },
  coppa_1998: { x: 520, y: 1042, anchor: "middle", lines: ["Children", "online"] },
  patriot_act_2001: { x: 640, y: 902, anchor: "end", lines: ["Security", "turn"] },
  eprivacy_directive_2002: { x: 1018, y: 612, anchor: "end", lines: ["ePrivacy", "cookies"] },
  california_breach_2003: { x: 1050, y: 1224, anchor: "middle", lines: ["Breach", "notice"] },
  ftc_privacy_report_2012: { x: 1192, y: 608, anchor: "start", lines: ["Privacy", "framework"] },
  snowden_2013: { x: 1190, y: 1412, anchor: "start", lines: ["Mass", "surveillance"] },
  gdpr_adoption_2016: { x: 1220, y: 1262, anchor: "end", lines: ["GDPR", "adopted"] },
  cambridge_analytica_2018: { x: 1392, y: 774, anchor: "start", lines: ["Platform", "profiling"] },
  gdpr_applies_2018: { x: 1228, y: 452, anchor: "end", lines: ["GDPR", "applies"] },
  ccpa_2018_2020: { x: 1342, y: 1262, anchor: "end", lines: ["Consumer", "rights"] },
  china_pipl_2021: { x: 1398, y: 636, anchor: "end", lines: ["PIPL"] },
  state_privacy_2023: { x: 1488, y: 1262, anchor: "end", lines: ["State privacy", "wave"] },
  eu_ai_act_2024: { x: 1458, y: 238, anchor: "end", lines: ["AI +", "biometrics"] },
};

const ROUTE_PATHS: Record<string, string[]> = {
  rights_personhood: [
    "M 110 300 H 360 V 460 H 660 H 720",
  ],
  information_data_protection: [
    "M 110 560 H 210 H 360 H 520 H 880 H 1260 H 1450 H 1515",
    "M 520 560 H 580 V 460 H 660",
    "M 880 560 V 700 H 1050",
    "M 880 560 V 830",
    "M 1260 560 V 1140 H 1490",
    "M 1450 560 H 1490 V 330",
  ],
  internet_platform_interface: [
    "M 110 960 H 520 H 790 V 700 H 1050 H 1160 H 1360 H 1450 V 560",
    "M 1360 700 H 1490 V 1140 H 1520 V 960 H 1540",
  ],
  surveillance_security_tension: [
    "M 110 700 H 790 V 1320 H 1160 V 330 H 1490 H 1540",
    "M 500 460 V 700",
    "M 660 700 V 830",
  ],
  breach_risk_compliance: [
    "M 110 1140 H 1050 H 1260 H 1360 H 1490 H 1540",
    "M 360 560 V 1140",
    "M 880 830 V 1140",
    "M 1160 700 V 1140",
    "M 1260 560 V 1140",
  ],
  identity_consent_advertising: [
    "M 110 1040 H 520 V 960 H 790 V 700 H 1160",
    "M 1160 700 H 1360",
    "M 1160 700 V 1140 H 1360 H 1510 V 1040 H 1540",
  ],
  ai_biometrics_sensitive_data: [
    "M 110 830 H 880 V 560 H 1260 H 1465 V 330 H 1490 H 1540",
  ],
};

const ROUTE_STARTS: Record<string, Point> = {
  rights_personhood: { x: 110, y: 300 },
  information_data_protection: { x: 110, y: 560 },
  internet_platform_interface: { x: 110, y: 960 },
  surveillance_security_tension: { x: 110, y: 700 },
  breach_risk_compliance: { x: 110, y: 1140 },
  identity_consent_advertising: { x: 110, y: 1040 },
  ai_biometrics_sensitive_data: { x: 110, y: 830 },
};

const ROUTE_ENDS: Record<string, Point> = {
  rights_personhood: { x: 720, y: 460 },
  information_data_protection: { x: 1515, y: 560 },
  internet_platform_interface: { x: 1540, y: 960 },
  surveillance_security_tension: { x: 1540, y: 330 },
  breach_risk_compliance: { x: 1540, y: 1140 },
  identity_consent_advertising: { x: 1540, y: 1040 },
  ai_biometrics_sensitive_data: { x: 1540, y: 330 },
};

function routeFlow(dataset: PrivacyModernTransitDataset, routeId: string) {
  const rows = dataset.flow_metrics.by_route_period.filter((row) => row.route_id === routeId);
  return Math.max(...rows.map((row) => row.particle_density), 0.2);
}

function routePeak(dataset: PrivacyModernTransitDataset, routeId: string) {
  return dataset.flow_metrics.by_route_period
    .filter((row) => row.route_id === routeId)
    .sort((a, b) => b.particle_density - a.particle_density)[0];
}

function splitStationLabel(station: ModernTransitStation) {
  return LABEL_POSITIONS[station.station_id]?.lines ?? [station.label];
}

function stationPoint(station: ModernTransitStation) {
  return STATION_POINTS[station.station_id] ?? { x: 100, y: 100 };
}

export function PrivacyChart01ModernTransit({ dataset }: PrivacyChart01ModernTransitProps) {
  const [activeStationId, setActiveStationId] = useState("gdpr_applies_2018");
  const routeById = useMemo(() => new Map(dataset.routes.map((route) => [route.route_id, route])), [dataset.routes]);
  const activeStation = dataset.stations.find((station) => station.station_id === activeStationId) ?? dataset.stations[0];

  return (
    <div className="min-w-0">
      <svg
        viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
        role="img"
        aria-label="Privacy subway map from 1950 to 2026"
        className="h-auto w-full overflow-visible"
      >
        <rect x="0" y="0" width={MAP_WIDTH} height={MAP_HEIGHT} fill="transparent" />

        <g transform="translate(56 70)">
          <text
            x="0"
            y="0"
            style={MONO_STYLE}
            fontSize="18"
            fontWeight="900"
            letterSpacing="4"
            fill={VIOLET}
          >
            PRIVACY TRANSIT MAP / 1950-2026
          </text>
          <text
            x="0"
            y="44"
            style={SANS_STYLE}
            fontSize="18"
            fontWeight="700"
            fill={INK}
            fillOpacity="0.58"
          >
            Semantic routes, transfer stations, and moving signals after privacy becomes a legal and data system.
          </text>
        </g>

        <g transform="translate(1036 54)">
          {dataset.routes.map((route, index) => {
            const x = (index % 2) * 270;
            const y = Math.floor(index / 2) * 54;
            const code = ROUTE_CODES[route.route_id];
            return (
              <g key={`legend-${route.route_id}`} transform={`translate(${x} ${y})`}>
                <circle cx="0" cy="0" r="17" fill={route.color} />
                <text
                  x="0"
                  y="0"
                  textAnchor="middle"
                  dominantBaseline="central"
                  style={ROUTE_CODE_STYLE}
                  fontSize="18"
                  fontWeight="800"
                  fill={PAPER}
                >
                  {code}
                </text>
                <text x="30" y="-4" style={MONO_STYLE} fontSize="11" fontWeight="900" letterSpacing="1.2" fill={INK} fillOpacity="0.88">
                  {ROUTE_KEY_LABELS[route.route_id]}
                </text>
                <text x="30" y="15" style={MONO_STYLE} fontSize="10.5" fontWeight="900" letterSpacing="1.1" fill={INK} fillOpacity="0.66">
                  {route.station_count} STOPS
                </text>
              </g>
            );
          })}
        </g>

        <g transform="translate(0 58)">
        <g>
          {[1950, 1970, 1990, 2010, 2026].map((year, index) => {
            const x = 170 + index * 340;
            return (
              <g key={year}>
                <line x1={x} y1="226" x2={x} y2="1400" stroke={INK} strokeWidth="1" strokeOpacity="0.2" />
                <text
                  x={x}
                  y="204"
                  textAnchor="middle"
                  style={MONO_STYLE}
                  fontSize="24"
                  fontWeight="900"
                  letterSpacing="2"
                  fill={INK}
                  fillOpacity="0.42"
                >
                  {year}
                </text>
              </g>
            );
          })}
        </g>

        <g>
          {dataset.routes.map((route) => {
            const paths = ROUTE_PATHS[route.route_id] ?? [];
            const flow = routeFlow(dataset, route.route_id);
            const width = 11 + flow * 13;
            return (
              <g key={`route-${route.route_id}`}>
                {paths.map((path, segmentIndex) => (
                  <g key={`${route.route_id}-segment-${segmentIndex}`}>
                    <path
                      d={path}
                      fill="none"
                      stroke={INK}
                      strokeOpacity="0.16"
                      strokeWidth={width + 9}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d={path}
                      fill="none"
                      stroke={route.color}
                      strokeWidth={width}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {[0, 1].slice(0, flow > 0.62 && segmentIndex < 2 ? 2 : 1).map((particle) => (
                      <circle
                        key={`${route.route_id}-${segmentIndex}-${particle}`}
                        r={4.1 + flow * 1.3}
                        fill={PAPER}
                        stroke={route.color}
                        strokeWidth="3"
                      >
                        <animateMotion
                          dur={`${24 + segmentIndex * 3.5 + particle * 4.5 - flow * 3}s`}
                          repeatCount="indefinite"
                          path={path}
                          begin={`${segmentIndex * 1.7 + particle * 6.2}s`}
                        />
                      </circle>
                    ))}
                  </g>
                ))}
              </g>
            );
          })}
        </g>

        <g>
          {dataset.routes.map((route) => {
            const start = ROUTE_STARTS[route.route_id];
            const end = ROUTE_ENDS[route.route_id];
            const code = ROUTE_CODES[route.route_id];
            return (
              <g key={`terminal-${route.route_id}`}>
                <circle cx={start.x} cy={start.y} r="17" fill={route.color} />
                <text
                  x={start.x}
                  y={start.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  style={ROUTE_CODE_STYLE}
                  fontSize="18"
                  fontWeight="800"
                  fill={PAPER}
                >
                  {code}
                </text>
                <circle cx={end.x} cy={end.y} r="17" fill={route.color} />
                <text
                  x={end.x}
                  y={end.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  style={ROUTE_CODE_STYLE}
                  fontSize="18"
                  fontWeight="800"
                  fill={PAPER}
                >
                  {code}
                </text>
              </g>
            );
          })}
        </g>

        <g>
          {dataset.stations.map((station) => {
            const point = stationPoint(station);
            const active = station.station_id === activeStation?.station_id;
            const firstRoute = routeById.get(station.route_ids[0]);
            return (
              <g
                key={station.station_id}
                tabIndex={0}
                role="button"
                aria-label={`${station.year} ${station.label}`}
                className="cursor-pointer outline-none"
                onMouseEnter={() => setActiveStationId(station.station_id)}
                onFocus={() => setActiveStationId(station.station_id)}
              >
                <circle cx={point.x} cy={point.y} r={station.transfer ? 31 : 25} fill="transparent" />
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={station.transfer ? 13.8 : 9.8}
                  fill={PAPER}
                  stroke={INK}
                  strokeOpacity={active ? 0.95 : 0.68}
                  strokeWidth={active ? 3.2 : 2.2}
                />
                {station.transfer ? (
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="5.8"
                    fill={firstRoute?.color ?? VIOLET}
                    fillOpacity={active ? 1 : 0.8}
                  />
                ) : null}
              </g>
            );
          })}
        </g>

        <g pointerEvents="none">
          {dataset.stations.map((station) => {
            const point = STATION_POINTS[station.station_id];
            const label = LABEL_POSITIONS[station.station_id];
            if (!point || !label) return null;
            const active = station.station_id === activeStation?.station_id;
            const lines = splitStationLabel(station);
            return (
              <g key={`label-${station.station_id}`}>
                <line
                  x1={point.x}
                  y1={point.y}
                  x2={label.x}
                  y2={label.y - 9}
                  stroke={INK}
                  strokeOpacity={active ? 0.46 : 0.22}
                  strokeWidth={active ? 1.8 : 1}
                />
                <text
                  x={label.x}
                  y={label.y}
                  textAnchor={label.anchor}
                  style={SANS_STYLE}
                  fontSize={active ? 20 : 16}
                  fontWeight={active ? 900 : 800}
                  fill={INK}
                  fillOpacity={active ? 0.94 : 0.78}
                >
                  {lines.map((line, index) => (
                    <tspan key={`${station.station_id}-${line}`} x={label.x} dy={index === 0 ? 0 : 18}>
                      {line}
                    </tspan>
                  ))}
                </text>
                {station.transfer ? (
                  <text
                    x={label.x}
                    y={label.y + 42}
                    textAnchor={label.anchor}
                    style={MONO_STYLE}
                    fontSize="12"
                    fontWeight="900"
                    letterSpacing="1.2"
                    fill={VIOLET}
                    fillOpacity={active ? 0.96 : 0.76}
                  >
                    {station.year}
                  </text>
                ) : null}
              </g>
            );
          })}
        </g>
        </g>

        <g transform="translate(56 1560)">
          <rect x="0" y="-4" width="430" height="72" fill={PAPER} fillOpacity="0.72" />
          <text
            x="0"
            y="18"
            style={MONO_STYLE}
            fontSize="12"
            fontWeight="900"
            letterSpacing="2"
            fill={VIOLET}
          >
            SELECTED STATION
          </text>
          <text x="0" y="48" style={SANS_STYLE} fontSize="24" fontWeight="900" fill={INK}>
            {activeStation?.label}
          </text>
          <text
            x="0"
            y="70"
            style={MONO_STYLE}
            fontSize="11"
            fontWeight="900"
            letterSpacing="1"
            fill={INK}
            fillOpacity="0.58"
          >
            {activeStation?.year} / {activeStation?.transfer ? "transfer station" : "single-line station"}
          </text>
        </g>

        <g transform="translate(640 1620)">
          <text
            x="0"
            y="0"
            style={MONO_STYLE}
            fontSize="11"
            fontWeight="900"
            letterSpacing="1.4"
            fill={INK}
            fillOpacity="0.52"
          >
            STOPS = DATED ANCHORS / TRANSFERS = SHARED MEANINGS / MOVING DOTS = MODERN PRESSURE
          </text>
        </g>
      </svg>
    </div>
  );
}
