import { ImageResponse } from "next/og";

export const alt =
  "DevUp, Developing upwards. Build the online career you actually own. Free.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background: "#f1f6f4",
          color: "#0e1f1b",
          fontFamily: "sans-serif",
        }}
      >
        {/* corner glow */}
        <div
          style={{
            position: "absolute",
            top: -160,
            right: -120,
            width: 520,
            height: 520,
            borderRadius: 520,
            background: "rgba(13,148,136,0.14)",
            display: "flex",
          }}
        />

        {/* brand row */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 76,
              height: 76,
              borderRadius: 0,
              background: "#0d9488",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="46" height="46" viewBox="0 0 32 32" fill="none">
              <path d="M16 7 L24 15.5 H19 V25 H13 V15.5 H8 Z" fill="#fff" />
            </svg>
          </div>
          <div style={{ display: "flex", fontSize: 44, fontWeight: 700 }}>
            <span>Dev</span>
            <span style={{ color: "#0d9488" }}>Up</span>
          </div>
        </div>

        {/* headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              fontSize: 76,
              fontWeight: 700,
              lineHeight: 1.02,
              letterSpacing: -2,
              maxWidth: 980,
            }}
          >
            Build the online career you&nbsp;
            <span style={{ color: "#0d9488" }}>actually own.</span>
          </div>
          <div style={{ display: "flex", fontSize: 30, color: "#435551" }}>
            Free learning for Filipino online professionals. Real talk, real sources.
          </div>
        </div>

        {/* footer row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 24,
            color: "#798a84",
          }}
        >
          <span style={{ color: "#2f9e46", fontWeight: 700 }}>Developing upwards</span>
          <span>·</span>
          <span>Free, permanently</span>
          <span>·</span>
          <span>you build it, you own it</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
