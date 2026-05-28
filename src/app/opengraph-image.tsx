import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site";

export const alt = "Words Over Time";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#f5ecd2",
          color: "#050510",
          padding: "56px 64px",
          border: "18px solid #050510",
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ fontSize: 30, fontWeight: 900, letterSpacing: 4, textTransform: "uppercase", color: "#006fb6" }}>
            Words Over Time
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {["#050510", "#d93621", "#f3b61f", "#006fb6", "#036c17", "#7e42b8"].map((color) => (
              <span key={color} style={{ width: 22, height: 92, background: color, border: "2px solid #050510" }} />
            ))}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontSize: 112, lineHeight: 0.88, fontWeight: 900, letterSpacing: -2 }}>word histories</div>
          <div style={{ fontSize: 112, lineHeight: 0.88, fontWeight: 900, letterSpacing: -2 }}>as visual evidence</div>
        </div>
        <div style={{ maxWidth: 960, fontSize: 32, lineHeight: 1.22, fontWeight: 800, color: "#2c2c38" }}>
          {siteConfig.description}
        </div>
      </div>
    ),
    size,
  );
}
