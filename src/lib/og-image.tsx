import { ImageResponse } from "next/og";
import { siteConfig, type SiteRoute } from "@/lib/site";

export const ogImageSize = {
  width: 1200,
  height: 630,
};

type OgImageOptions = {
  title: string;
  eyebrow?: string;
  description: string;
  accent?: string;
  keywords?: string[];
};

const palette = ["#050510", "#d93621", "#f3b61f", "#006fb6", "#036c17", "#6f3aa6"];

export function createOgImage({ title, eyebrow = siteConfig.name, description, accent = "#006fb6", keywords = [] }: OgImageOptions) {
  const displayedKeywords = keywords.slice(0, 5);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#f7f0dc",
          color: "#050510",
          padding: "56px 64px",
          border: "18px solid #050510",
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 32 }}>
          <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: 4, textTransform: "uppercase", color: accent }}>
            {eyebrow}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {palette.map((color) => (
              <span key={color} style={{ width: 22, height: 92, background: color, border: "2px solid #050510" }} />
            ))}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: title.length > 18 ? 94 : 116, lineHeight: 0.9, fontWeight: 900, letterSpacing: 0 }}>
            {title}
          </div>
          {displayedKeywords.length > 0 ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              {displayedKeywords.map((keyword) => (
                <span
                  key={keyword}
                  style={{
                    border: "3px solid #050510",
                    background: "#fff8e6",
                    color: "#050510",
                    padding: "8px 12px",
                    fontSize: 22,
                    lineHeight: 1,
                    fontWeight: 900,
                    textTransform: "uppercase",
                  }}
                >
                  {keyword}
                </span>
              ))}
            </div>
          ) : null}
        </div>
        <div style={{ maxWidth: 980, fontSize: 31, lineHeight: 1.22, fontWeight: 800, color: "#2c2c38" }}>
          {description}
        </div>
      </div>
    ),
    ogImageSize,
  );
}

export function createRouteOgImage(route: SiteRoute) {
  return createOgImage({
    title: `${route.title.toLowerCase()}/`,
    eyebrow: `${siteConfig.name} / word study`,
    description: route.summary || route.description,
    accent: route.accent,
    keywords: route.keywords,
  });
}
