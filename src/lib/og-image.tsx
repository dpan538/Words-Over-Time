import "server-only";

import { ImageResponse } from "next/og";
import {
  canonicalSocialPreview,
  type CanonicalSocialPreview,
} from "@/lib/machine/social-preview";
import type { CanonicalRoutePath } from "@/lib/machine/canonical-publication";

export const ogImageSize = {
  width: 1200,
  height: 630,
};

export function createSocialPreviewImage(preview: CanonicalSocialPreview) {
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
          padding: "48px 58px 44px",
          border: "18px solid #050510",
          fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 28,
          }}
        >
          <div
            style={{
              color: preview.accent,
              fontSize: 25,
              fontWeight: 900,
              letterSpacing: 3.4,
              textTransform: "uppercase",
            }}
          >
            {preview.eyebrow}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <span
              style={{
                display: "flex",
                width: 80,
                height: 12,
                background: preview.accent,
                border: "2px solid #050510",
              }}
            />
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 22,
            maxWidth: 1050,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 20,
              fontSize: 108,
              lineHeight: 0.9,
              fontWeight: 900,
              letterSpacing: -3.2,
              WebkitTextStroke: "1.35px #050510",
            }}
          >
            <span>{preview.imageTitle}</span>
            <span
              style={{
                color: preview.accent,
                WebkitTextStroke: `1.35px ${preview.accent}`,
              }}
            >
              /
            </span>
          </div>
          <div
            style={{
              display: "flex",
              width: 230,
              height: 9,
              background: preview.accent,
            }}
          />
          <div
            style={{
              display: "flex",
              maxWidth: 1010,
              color: "#2c2c38",
              fontSize: 35,
              lineHeight: 1.16,
              fontWeight: 700,
            }}
          >
            {preview.imageSupportingText}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: 18,
            borderTop: "3px solid #050510",
            fontSize: 21,
            lineHeight: 1,
            fontWeight: 900,
            letterSpacing: 1.2,
          }}
        >
          <span>{preview.author}</span>
          <span>{preview.domain}</span>
        </div>
      </div>
    ),
    ogImageSize,
  );
}

export function createCanonicalSocialImage(path: CanonicalRoutePath) {
  return createSocialPreviewImage(canonicalSocialPreview(path));
}
