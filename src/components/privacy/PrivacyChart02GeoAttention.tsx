"use client";

import { useMemo, useState } from "react";
import worldMapJson from "@/data/generated/world_countries_geojson.json";

type QueryCount = {
  query: string;
  count: number;
};

type CountryHotspot = {
  country: string;
  country_code: string;
  latitude: number;
  longitude: number;
  record_count: number;
  academic_records: number;
  news_records: number;
  weighted_score: number;
  top_queries: QueryCount[];
  peak_year: number | null;
  density_score: number;
  density_class: "very_high" | "high" | "medium" | "low" | "trace";
  dot_count: number;
};

type CityPoint = {
  city: string;
  region: string | null;
  country: string;
  country_code: string;
  latitude: number;
  longitude: number;
  record_count: number;
  elevation_meters: number | null;
  top_queries: QueryCount[];
};

type RadiationHub = {
  hub_id: string;
  label: string;
  country: string;
  lat: number;
  lon: number;
  region: string;
  source_basis: string;
  confidence: string;
};

type RadiationLink = {
  link_id: string;
  from_hub_id: string;
  from_label: string;
  from_latitude: number;
  from_longitude: number;
  to_country: string;
  to_country_code: string;
  to_latitude: number;
  to_longitude: number;
  weighted_score: number;
  density_score: number;
  route_basis: string;
  confidence: string;
  notes: string;
};

export type PrivacyGeoAttentionDataset = {
  word: "privacy";
  layer_id: "geo_attention_map";
  status: string;
  intended_use: string;
  title: string;
  description: string;
  statistics: {
    source_total_records: number;
    map_country_count: number;
    map_city_point_count: number;
    radiation_link_count: number;
    elevation_point_count: number;
    top_country: string;
    top_country_record_count: number;
    google_trends_available: boolean;
  };
  sources: Array<{
    source_id: string;
    source_type: string;
    status: string;
    notes: string;
  }>;
  country_hotspots: CountryHotspot[];
  city_points: CityPoint[];
  radiation_hubs: RadiationHub[];
  radiation_links: RadiationLink[];
  strong_signals: string[];
  limitations: string[];
};

type PrivacyChart02GeoAttentionProps = {
  dataset: PrivacyGeoAttentionDataset;
};

type Point = {
  x: number;
  y: number;
};

type VisualRadiationLink = {
  id: string;
  from: CountryHotspot;
  to: CountryHotspot;
  strength: number;
  tier: "primary" | "secondary";
};

type GeoJsonGeometry = {
  type: "Polygon" | "MultiPolygon";
  coordinates: number[][][] | number[][][][];
};

type GeoJsonFeature = {
  type: "Feature";
  properties: Record<string, string | number | null>;
  geometry: GeoJsonGeometry;
};

type WorldGeoJson = {
  type: "FeatureCollection";
  features: GeoJsonFeature[];
};

const MAP_WIDTH = 1680;
const MAP_HEIGHT = 620;
const MIN_LAT = -50;
const MAX_LAT = 78;
const BADGE_RADIUS = 5.8;
const INK = "#050510";
const PAPER = "#F7F0DC";
const HOTSPOT_COLORS = ["#1570AC", "#036C17", "#FBB728", "#A1081F"] as const;
const RADIATION_DOT = "#f27624";
const RADIATION_BADGE = "#1f6f80";

const HOTSPOT_LAND_POINTS: Record<string, Array<[number, number]>> = {
  US: [
    [-122.33, 47.61],
    [-121.49, 38.58],
    [-118.24, 34.05],
    [-112.07, 33.45],
    [-111.89, 40.76],
    [-104.99, 39.74],
    [-97.74, 30.27],
    [-96.8, 32.78],
    [-95.37, 29.76],
    [-94.58, 39.1],
    [-90.2, 38.63],
    [-87.63, 41.88],
    [-84.39, 33.75],
    [-83.05, 42.33],
    [-80.84, 35.23],
    [-77.04, 38.91],
    [-75.16, 39.95],
    [-74.01, 40.71],
  ],
  JP: [
    [141.35, 43.06],
    [140.87, 38.27],
    [139.76, 35.68],
    [138.57, 35.66],
    [136.91, 35.18],
    [135.5, 34.69],
    [134.69, 34.83],
    [132.46, 34.39],
    [130.4, 33.59],
    [130.56, 31.6],
    [127.68, 26.21],
  ],
};

const BADGE_CLUSTER_PROFILES: Record<
  string,
  {
    spreadX: number;
    spreadY: number;
    shiftX?: number;
    shiftY?: number;
    columns?: number;
    max?: number;
    anchorLatitude?: number;
    anchorLongitude?: number;
  }
> = {
  US: { spreadX: 28, spreadY: 18, columns: 8, max: 30, anchorLatitude: 38.5, anchorLongitude: -98.6 },
  CA: { spreadX: 28, spreadY: 15, shiftY: 9, columns: 5, anchorLatitude: 55, anchorLongitude: -103 },
  GB: { spreadX: 5.2, spreadY: 7.2, shiftX: 0, shiftY: 4, columns: 4 },
  IE: { spreadX: 2.8, spreadY: 3.4, shiftX: -2, columns: 2 },
  DE: { spreadX: 6.4, spreadY: 6.2, columns: 4 },
  FR: { spreadX: 8.6, spreadY: 7.2, columns: 4 },
  NL: { spreadX: 2.8, spreadY: 3.2, columns: 3 },
  BE: { spreadX: 2.6, spreadY: 3, columns: 3 },
  CH: { spreadX: 3.2, spreadY: 3.4, columns: 3 },
  AT: { spreadX: 3.2, spreadY: 3.2, columns: 3 },
  DK: { spreadX: 2.8, spreadY: 3.4, columns: 3 },
  SE: { spreadX: 4.8, spreadY: 8.4, shiftY: 4, columns: 3 },
  FI: { spreadX: 4.8, spreadY: 7.4, shiftY: 3, columns: 3 },
  NO: { spreadX: 4.8, spreadY: 8.8, shiftY: 6, columns: 3 },
  ES: { spreadX: 7.6, spreadY: 6.4, columns: 3 },
  PT: { spreadX: 2.6, spreadY: 3.8, columns: 2 },
  IT: { spreadX: 5.2, spreadY: 8.2, shiftX: 1.5, columns: 3 },
  CN: { spreadX: 24, spreadY: 16, columns: 7, anchorLatitude: 34.8, anchorLongitude: 105 },
  TW: { spreadX: 2.1, spreadY: 3.4, shiftX: -2.5, columns: 2 },
  HK: { spreadX: 1.8, spreadY: 2.1, shiftX: -1.5, shiftY: 1, columns: 2, max: 8 },
  MO: { spreadX: 1.6, spreadY: 1.8, shiftX: -1.5, shiftY: 1, columns: 2, max: 6 },
  JP: { spreadX: 3.1, spreadY: 6.4, shiftX: -3.4, shiftY: 4, columns: 3 },
  KR: { spreadX: 2.8, spreadY: 3.4, shiftX: -2, columns: 3 },
  SG: { spreadX: 2.1, spreadY: 2.1, columns: 2, max: 8 },
  MY: { spreadX: 3.2, spreadY: 3.5, shiftX: 1, columns: 3 },
  PH: { spreadX: 2.9, spreadY: 4.8, shiftY: 3, columns: 3 },
  AU: { spreadX: 25, spreadY: 17, columns: 5, anchorLatitude: -26.4, anchorLongitude: 134.2 },
  NZ: { spreadX: 4.8, spreadY: 7.6, shiftX: -1.5, shiftY: -2, columns: 2 },
  BR: { spreadX: 24, spreadY: 19, columns: 4, anchorLatitude: -12.5, anchorLongitude: -52.8 },
  ZA: { spreadX: 12, spreadY: 8.5, columns: 3, anchorLatitude: -29.1, anchorLongitude: 24.4 },
  IN: { spreadX: 12, spreadY: 14, columns: 4, anchorLatitude: 22.4, anchorLongitude: 78.8 },
  RU: { spreadX: 34, spreadY: 13, columns: 5, anchorLatitude: 57.5, anchorLongitude: 75 },
  NG: { spreadX: 10.5, spreadY: 8.4, columns: 3, anchorLatitude: 9.2, anchorLongitude: 8.7 },
  KE: { spreadX: 7.6, spreadY: 7.2, columns: 3, anchorLatitude: 0.2, anchorLongitude: 37.8 },
  PK: { spreadX: 9.5, spreadY: 10, columns: 3, anchorLatitude: 30.4, anchorLongitude: 69.4 },
  BD: { spreadX: 3, spreadY: 3.6, columns: 3 },
  TH: { spreadX: 6.5, spreadY: 8.8, columns: 3, anchorLatitude: 15.3, anchorLongitude: 101 },
  VN: { spreadX: 4.6, spreadY: 10.5, columns: 2, anchorLatitude: 16.2, anchorLongitude: 107.7 },
};

const WORLD_MAP = worldMapJson as WorldGeoJson;

const RADIATION_CORRIDORS = [
  ["US", "CA", "primary"],
  ["US", "GB", "primary"],
  ["US", "DE", "primary"],
  ["US", "CN", "primary"],
  ["US", "AU", "primary"],
  ["GB", "DE", "primary"],
  ["GB", "NL", "secondary"],
  ["GB", "CA", "secondary"],
  ["DE", "CH", "secondary"],
  ["DE", "FR", "secondary"],
  ["DE", "IT", "secondary"],
  ["DE", "NL", "secondary"],
  ["CN", "IN", "primary"],
  ["CN", "TW", "secondary"],
  ["CN", "HK", "secondary"],
  ["CN", "JP", "secondary"],
  ["CN", "KR", "secondary"],
  ["CN", "SG", "secondary"],
  ["CN", "AU", "secondary"],
  ["CN", "GB", "secondary"],
  ["IN", "SG", "secondary"],
  ["IN", "AU", "secondary"],
  ["BR", "PT", "secondary"],
  ["ZA", "GB", "secondary"],
  ["NG", "GB", "secondary"],
  ["KE", "GB", "secondary"],
  ["SG", "AU", "primary"],
  ["SG", "PH", "secondary"],
  ["SG", "MY", "secondary"],
  ["AU", "NZ", "secondary"],
  ["IN", "GB", "secondary"],
  ["US", "BR", "secondary"],
] as const;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function project(longitude: number, latitude: number): Point {
  const x = 38 + ((longitude + 180) / 360) * (MAP_WIDTH - 76);
  const y = 18 + ((MAX_LAT - latitude) / (MAX_LAT - MIN_LAT)) * (MAP_HEIGHT - 36);
  return { x: clamp(x, 20, MAP_WIDTH - 20), y: clamp(y, 18, MAP_HEIGHT - 18) };
}

function hashString(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
}

function seededUnit(seed: number, index: number, salt: number) {
  const value = Math.sin((seed + index * 131 + salt * 977) * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

function ringPath(ring: number[][]) {
  return ring
    .map(([longitude, latitude], index) => {
      const point = project(longitude, latitude);
      return `${index === 0 ? "M" : "L"} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`;
    })
    .join(" ")
    .concat(" Z");
}

function featurePath(feature: GeoJsonFeature) {
  if (feature.geometry.type === "Polygon") {
    return (feature.geometry.coordinates as number[][][]).map((ring) => ringPath(ring)).join(" ");
  }

  return (feature.geometry.coordinates as number[][][][])
    .flatMap((polygon) => polygon.map((ring) => ringPath(ring)))
    .join(" ");
}

function featureName(feature: GeoJsonFeature) {
  return String(feature.properties.name ?? feature.properties.NAME ?? feature.properties.ADMIN ?? "");
}

function radiationPath(link: RadiationLink) {
  const start = project(link.from_longitude, link.from_latitude);
  const end = project(link.to_longitude, link.to_latitude);
  const midX = (start.x + end.x) / 2;
  const midY = (start.y + end.y) / 2;
  const distance = Math.hypot(end.x - start.x, end.y - start.y);
  const lift = Math.min(190, Math.max(46, distance * 0.22));
  const controlY = midY - lift;
  return `M ${start.x.toFixed(1)} ${start.y.toFixed(1)} Q ${midX.toFixed(1)} ${controlY.toFixed(1)} ${end.x.toFixed(1)} ${end.y.toFixed(1)}`;
}

function visualRadiationPath(link: VisualRadiationLink) {
  const start = project(link.from.longitude, link.from.latitude);
  const end = project(link.to.longitude, link.to.latitude);
  const midX = (start.x + end.x) / 2;
  const midY = (start.y + end.y) / 2;
  const distance = Math.hypot(end.x - start.x, end.y - start.y);
  const direction = start.x < end.x ? -1 : 1;
  const lift = Math.min(155, Math.max(24, distance * 0.18));
  const sidePush = link.tier === "primary" ? 28 * direction : -18 * direction;
  return `M ${start.x.toFixed(1)} ${start.y.toFixed(1)} Q ${(midX + sidePush).toFixed(1)} ${(midY - lift).toFixed(1)} ${end.x.toFixed(1)} ${end.y.toFixed(1)}`;
}

function topQueries(country: CountryHotspot) {
  return country.top_queries.slice(0, 3).map((item) => item.query).join(" / ");
}

function badgeCount(country: CountryHotspot, mode: "hotspot" | "radiation") {
  const cap = BADGE_CLUSTER_PROFILES[country.country_code]?.max;
  if (mode === "radiation") return Math.max(1, Math.min(4, Math.round(country.dot_count / 14)));
  return Math.max(2, Math.min(cap ?? 30, Math.round(country.dot_count * 0.68)));
}

function badgeOffsets(country: CountryHotspot, mode: "hotspot" | "radiation") {
  const count = badgeCount(country, mode);
  if (count <= 1) return [{ x: 0, y: 0, delay: 0 }];

  const seed = hashString(`${country.country_code}-${country.country}`);
  const profile =
    mode === "hotspot"
      ? (BADGE_CLUSTER_PROFILES[country.country_code] ?? {
          spreadX: 8.5,
          spreadY: 7.4,
          columns: Math.ceil(Math.sqrt(count)),
        })
      : { spreadX: 3.4, spreadY: 3.2, columns: Math.ceil(Math.sqrt(count)) };
  const columns = Math.max(2, Math.min(profile.columns ?? Math.ceil(Math.sqrt(count)), count));
  const rows = Math.ceil(count / columns);
  const xShift = profile.shiftX ?? 0;
  const yShift = profile.shiftY ?? 0;

  if (mode === "hotspot") {
    const landPoints = HOTSPOT_LAND_POINTS[country.country_code];
    if (landPoints?.length) {
      const center = hotspotClusterCenter(country);

      return Array.from({ length: count }, (_, index) => {
        const [longitude, latitude] = landPoints[(seed + index * 5) % landPoints.length];
        const point = project(longitude, latitude);
        const jitterX = (seededUnit(seed, index, 4) - 0.5) * BADGE_RADIUS * 2.1;
        const jitterY = (seededUnit(seed, index, 5) - 0.5) * BADGE_RADIUS * 2.1;

        return {
          x: point.x - center.x + jitterX,
          y: point.y - center.y + jitterY,
          delay: seededUnit(seed, index, 6) * 1.3,
        };
      });
    }

    const radiusX = profile.spreadX * Math.max(2.2, columns) * 0.72;
    const radiusY = profile.spreadY * Math.max(2.6, rows) * 0.86;

    return Array.from({ length: count }, (_, index) => {
      const angle = seededUnit(seed, index, 1) * Math.PI * 2;
      const distance = Math.sqrt(seededUnit(seed, index, 2));
      const drift = (seededUnit(seed, index, 3) - 0.5) * 0.34;
      const x = Math.cos(angle + drift) * radiusX * distance;
      const y = Math.sin(angle - drift) * radiusY * distance;

      return {
        x: x + xShift + (seededUnit(seed, index, 4) - 0.5) * BADGE_RADIUS * 1.7,
        y: y + yShift + (seededUnit(seed, index, 5) - 0.5) * BADGE_RADIUS * 1.7,
        delay: seededUnit(seed, index, 6) * 1.3,
      };
    });
  }

  return Array.from({ length: count }, (_, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);
    const jitterX = (((seed + index * 7) % 5) - 2) * 0.28;
    const jitterY = (((seed + index * 11) % 5) - 2) * 0.28;
    return {
      x: (column - (columns - 1) / 2) * profile.spreadX + xShift + jitterX,
      y: (row - (rows - 1) / 2) * profile.spreadY + yShift + jitterY,
      delay: ((seed + index * 13) % 17) * 0.07,
    };
  });
}

function hotspotClusterCenter(country: CountryHotspot) {
  const profile = BADGE_CLUSTER_PROFILES[country.country_code];
  return project(profile?.anchorLongitude ?? country.longitude, profile?.anchorLatitude ?? country.latitude);
}

function hotspotBadgeFill(country: CountryHotspot, index: number) {
  const seed = hashString(country.country_code);
  return HOTSPOT_COLORS[(seed + index) % HOTSPOT_COLORS.length];
}

export function PrivacyChart02GeoAttention({ dataset }: PrivacyChart02GeoAttentionProps) {
  const [mode, setMode] = useState<"hotspot" | "radiation">("hotspot");
  const [selectedCountry, setSelectedCountry] = useState<CountryHotspot>(dataset.country_hotspots[0]);
  const [selectedLink, setSelectedLink] = useState<RadiationLink>(dataset.radiation_links[0]);
  const [selectedCorridor, setSelectedCorridor] = useState<VisualRadiationLink | null>(null);

  const countries = useMemo(() => dataset.country_hotspots.slice(0, 72), [dataset.country_hotspots]);
  const cityPoints = useMemo(() => dataset.city_points.slice(0, 32), [dataset.city_points]);
  const radiationLinks = useMemo(() => dataset.radiation_links.slice(0, 34), [dataset.radiation_links]);
  const visualRadiationLinks = useMemo(() => {
    const byCode = new Map(dataset.country_hotspots.map((country) => [country.country_code, country]));

    return RADIATION_CORRIDORS.flatMap(([fromCode, toCode, tier]) => {
      const from = byCode.get(fromCode);
      const to = byCode.get(toCode);
      if (!from || !to) return [];

      return [
        {
          id: `${fromCode}-${toCode}`,
          from,
          to,
          strength: Math.sqrt(from.density_score * to.density_score),
          tier,
        },
      ];
    });
  }, [dataset.country_hotspots]);

  const activeHub = dataset.radiation_hubs.find((hub) => hub.hub_id === selectedLink.from_hub_id);
  const selectedCopy =
    mode === "hotspot"
      ? {
          eyebrow: "Hotspot density",
          title: selectedCountry.country,
          line1: `${selectedCountry.record_count.toLocaleString()} recovered records / peak ${selectedCountry.peak_year ?? "unknown"}`,
          line2: `${selectedCountry.academic_records.toLocaleString()} academic + ${selectedCountry.news_records.toLocaleString()} news signals`,
          line3: topQueries(selectedCountry),
        }
      : selectedCorridor
        ? {
            eyebrow: "Radiation corridor",
            title: `${selectedCorridor.from.country} -> ${selectedCorridor.to.country}`,
            line1: `${selectedCorridor.tier} path / ${selectedCorridor.to.record_count.toLocaleString()} destination records`,
            line2: "A high-probability relation between recovered hotspot clusters.",
            line3: "Connection strength is visual, not causal diffusion proof.",
          }
      : {
          eyebrow: "Radiation path",
          title: `${activeHub?.label ?? selectedLink.from_label} -> ${selectedLink.to_country}`,
          line1: `${selectedLink.confidence} confidence / density ${(selectedLink.density_score * 100).toFixed(1)}%`,
          line2: selectedLink.route_basis,
          line3: "Visual attention path, not a causal claim.",
        };

  return (
    <section className="border-y border-ink/75 py-7">
      <div className="mb-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-end">
        <div>
          <p className="font-mono text-[0.86rem] font-black uppercase leading-5 tracking-[0.18em] text-privacy-violet">
            02A / global geo attention
          </p>
          <h3 className="mt-3 max-w-[920px] text-[clamp(1.5rem,2.45vw,2.55rem)] font-black leading-[1.02] tracking-normal text-ink">
            Where privacy concentrates, then radiates.
          </h3>
          <p className="mt-3 max-w-[1120px] text-[1rem] font-bold leading-[1.48] text-ink/74">
            A flat world map from recovered country, city, news, and academic signals. Hotspot mode reads density;
            radiation mode reads high-probability paths from the strongest recovered hubs.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-3 font-mono text-[0.74rem] font-black uppercase leading-5 tracking-[0.12em] text-ink/72">
          <p>
            <span className="block text-privacy-violet">Countries</span>
            {dataset.statistics.map_country_count}
          </p>
          <p>
            <span className="block text-privacy-violet">City points</span>
            {dataset.statistics.map_city_point_count}
          </p>
          <p>
            <span className="block text-privacy-violet">Radiation links</span>
            {dataset.statistics.radiation_link_count}
          </p>
          <p>
            <span className="block text-privacy-violet">Elevation held</span>
            {dataset.statistics.elevation_point_count}
          </p>
          <div className="col-span-2 mt-1 flex items-center gap-3 border-t border-ink/20 pt-3">
            <span className="h-3.5 w-3.5 rounded-full bg-[#1f9a83]" />
            <span>Same-size dots / density by count</span>
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden border-y border-ink/45 bg-[#fff8e6]">
        <svg
          className="block h-[520px] w-full sm:h-[590px] xl:h-[660px]"
          viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
          role="img"
          aria-label="Global privacy attention map"
        >
          <rect width={MAP_WIDTH} height={MAP_HEIGHT} fill="#fff8e6" />

          {[-120, -60, 0, 60, 120].map((lon) => {
            const point = project(lon, 0);
            return (
              <line
                key={`lon-${lon}`}
                x1={point.x}
                x2={point.x}
                y1={18}
                y2={MAP_HEIGHT - 18}
                stroke={INK}
                strokeOpacity={0.09}
                strokeWidth={1}
              />
            );
          })}
          {[-45, 0, 45].map((lat) => {
            const point = project(0, lat);
            return (
              <line
                key={`lat-${lat}`}
                x1={38}
                x2={MAP_WIDTH - 38}
                y1={point.y}
                y2={point.y}
                stroke={INK}
                strokeOpacity={0.08}
                strokeWidth={1}
              />
            );
          })}

          <g>
            {WORLD_MAP.features
              .filter((feature) => featureName(feature).toLowerCase() !== "antarctica")
              .map((feature, index) => (
                <path
                  key={`${feature.properties.name ?? "country"}-${index}`}
                  d={featurePath(feature)}
                  fill="#fbfaf4"
                  stroke={INK}
                  strokeOpacity={0.34}
                  strokeWidth={0.95}
                  vectorEffect="non-scaling-stroke"
                />
            ))}
          </g>

          {[
            ["NORTH AMERICA", -103, 52],
            ["SOUTH AMERICA", -60, -24],
            ["EUROPE", 16, 54],
            ["AFRICA", 21, 5],
            ["ASIA", 88, 44],
            ["AUSTRALIA", 134, -25],
          ].map(([label, lon, lat]) => {
            const point = project(Number(lon), Number(lat));
            return (
              <text
                key={label}
                x={point.x}
                y={point.y}
                textAnchor="middle"
                className="select-none"
                fill={INK}
                fillOpacity={0.19}
                fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                fontSize={19}
                fontWeight={900}
                letterSpacing={8}
              >
                {label}
              </text>
            );
          })}

          {mode === "radiation" &&
            radiationLinks.map((link, index) => {
              const path = radiationPath(link);
              const end = project(link.to_longitude, link.to_latitude);
              return (
                <g
                  key={link.link_id}
                  onMouseEnter={() => {
                    setSelectedCorridor(null);
                    setSelectedLink(link);
                  }}
                >
                  <path
                    d={path}
                    fill="none"
                    stroke={INK}
                    strokeOpacity={0}
                    strokeWidth={15}
                    strokeLinecap="round"
                    pointerEvents="stroke"
                  />
                  <path
                    d={path}
                    fill="none"
                    stroke={INK}
                    strokeOpacity={0.12}
                    strokeWidth={0.85 + link.density_score * 2.4}
                    strokeLinecap="round"
                    pointerEvents="stroke"
                  />
                  <path
                    d={path}
                    fill="none"
                    stroke={INK}
                    strokeOpacity={0.22}
                    strokeWidth={0.35 + link.density_score * 1.4}
                    strokeLinecap="round"
                  />
                  <circle cx={end.x} cy={end.y} r={3.5 + link.density_score * 8} fill="none" stroke={INK} strokeOpacity={0.34} />
                  {index < 18 && (
                    <circle r={3.05} fill={RADIATION_DOT} opacity={0.84}>
                      <animateMotion dur={`${23 + (index % 6) * 1.8}s`} repeatCount="indefinite" path={path} begin={`${index * 0.7}s`} />
                    </circle>
                  )}
                </g>
              );
            })}

          {mode === "radiation" &&
            visualRadiationLinks.map((link, index) => {
              const path = visualRadiationPath(link);
              return (
                <g
                  key={link.id}
                  onMouseEnter={() => {
                    setSelectedCorridor(link);
                    setSelectedCountry(link.to);
                  }}
                >
                  <path
                    d={path}
                    fill="none"
                    stroke={INK}
                    strokeOpacity={0}
                    strokeWidth={18}
                    strokeLinecap="round"
                    pointerEvents="stroke"
                  />
                  <path
                    d={path}
                    fill="none"
                    stroke={INK}
                    strokeOpacity={link.tier === "primary" ? 0.42 : 0.28}
                    strokeWidth={link.tier === "primary" ? 1.25 + link.strength * 3.4 : 0.75 + link.strength * 2.1}
                    strokeLinecap="round"
                    pointerEvents="stroke"
                  />
                  {index < 18 && (
                    <circle r={3.15} fill={RADIATION_DOT} opacity={0.88}>
                      <animateMotion dur={`${25 + (index % 7) * 1.65}s`} repeatCount="indefinite" path={path} begin={`${index * 0.72}s`} />
                    </circle>
                  )}
                </g>
              );
            })}

          {mode === "radiation" &&
            dataset.radiation_hubs.map((hub) => {
              const point = project(hub.lon, hub.lat);
              return (
                <g key={hub.hub_id}>
                  <circle cx={point.x} cy={point.y} r={15} fill="#fff8e6" stroke={INK} strokeOpacity={0.78} strokeWidth={2} />
                  <circle cx={point.x} cy={point.y} r={7} fill={INK} />
                  <text
                    x={point.x + 18}
                    y={point.y - 18}
                    fill={INK}
                    fontFamily="Arial, Helvetica, sans-serif"
                    fontSize={17}
                    fontWeight={900}
                  >
                    {hub.country}
                  </text>
                </g>
              );
            })}

          {(mode === "hotspot" ? countries : dataset.country_hotspots.slice(0, 34)).map((country) => {
              const center = mode === "hotspot" ? hotspotClusterCenter(country) : project(country.longitude, country.latitude);
              const offsets = badgeOffsets(country, mode);
              const maxOffsetRadius = offsets.reduce((max, offset) => Math.max(max, Math.hypot(offset.x, offset.y)), 0);
              const hitRadius = mode === "hotspot" ? Math.max(18 + Math.sqrt(offsets.length) * 11, maxOffsetRadius + 18) : 22;
              return (
                <g
                  key={country.country_code}
                  onMouseEnter={() => {
                    setSelectedCorridor(null);
                    setSelectedCountry(country);
                  }}
                >
                  <circle cx={center.x} cy={center.y} r={hitRadius} fill="transparent" />
                  {offsets.map((offset, index) => (
                    <circle
                      key={`${country.country_code}-${index}`}
                      className="privacy-geo-badge"
                      cx={center.x + offset.x}
                      cy={center.y + offset.y}
                      r={BADGE_RADIUS}
                      fill={mode === "hotspot" ? hotspotBadgeFill(country, index) : RADIATION_BADGE}
                      fillOpacity={mode === "hotspot" ? 0.88 : 0.76}
                      stroke="none"
                      style={{
                        animationDelay: `${offset.delay}s`,
                        transformOrigin: `${center.x + offset.x}px ${center.y + offset.y}px`,
                      }}
                    />
                  ))}
                </g>
              );
            })}

          {mode === "radiation" && cityPoints.map((city, index) => {
            const point = project(city.longitude, city.latitude);
            const radius = 2.2;
            return (
              <circle
                key={`${city.country_code}-${city.city}-${index}`}
                cx={point.x}
                cy={point.y}
                r={radius}
                fill={PAPER}
                fillOpacity={0.74}
                stroke={INK}
                strokeOpacity={0.28}
                strokeWidth={1}
              />
            );
          })}

          <text
            x={52}
            y={MAP_HEIGHT - 38}
            fill={INK}
            fillOpacity={0.52}
            fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
            fontSize={14}
            fontWeight={900}
            letterSpacing={2}
          >
            FLAT PROJECTION / DENSITY IS RECOVERED SIGNAL, NOT SEARCH POPULATION SHARE
          </text>
        </svg>
      </div>

      <div className="mt-5 grid min-h-[156px] gap-5 lg:grid-cols-[23rem_minmax(0,1fr)] lg:items-start">
        <div className="flex gap-2">
          {[
            ["hotspot", "Hotspot map"],
            ["radiation", "Radiation map"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setMode(value as "hotspot" | "radiation")}
              className={`border px-4 py-3 font-mono text-[0.74rem] font-black uppercase leading-none tracking-[0.14em] transition ${
                mode === value
                  ? "border-privacy-violet bg-privacy-violet text-[#fff8e6]"
                  : "border-ink/65 text-ink hover:border-privacy-violet hover:text-privacy-violet"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="grid min-h-[132px] gap-5 overflow-hidden border-t border-ink/28 pt-5 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)]">
          <div>
            <p className="font-mono text-[0.78rem] font-black uppercase leading-5 tracking-[0.16em] text-privacy-violet">
              {selectedCopy.eyebrow}
            </p>
            <h4 className="mt-2 max-w-3xl text-[clamp(1.15rem,1.85vw,1.75rem)] font-black leading-[1.05] text-ink">
              {selectedCopy.title}
            </h4>
            <p className="mt-2 font-mono text-[0.76rem] font-black uppercase leading-5 tracking-[0.09em] text-ink/68">
              {selectedCopy.line1}
            </p>
          </div>

          <div className="text-[0.98rem] font-bold leading-[1.48] text-ink/68">
            <p>{selectedCopy.line2}</p>
            <p className="mt-2 font-mono text-[0.74rem] font-black uppercase leading-5 tracking-[0.1em] text-ink/54">
              {selectedCopy.line3}
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .privacy-geo-badge {
          animation: privacyGeoBadge 4.8s ease-in-out infinite;
        }

        @keyframes privacyGeoBadge {
          0%, 100% {
            transform: scale(0.97);
          }
          50% {
            transform: scale(1.08);
          }
        }
      `}</style>
    </section>
  );
}
