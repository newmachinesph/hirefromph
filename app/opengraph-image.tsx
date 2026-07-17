import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt =
  "DevUp, Developing upwards. Build the online career you actually own.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const logo = await readFile(join(process.cwd(), "public", "devup-logo.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;
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
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} width={82} height={85} alt="" />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                fontSize: 44,
                fontWeight: 700,
                lineHeight: 1,
              }}
            >
              <span>Dev</span>
              <span style={{ color: "#0d9488" }}>Up</span>
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 6,
                fontSize: 19,
                fontWeight: 600,
                letterSpacing: 5,
                color: "#3a4a46",
              }}
            >
              DEVELOPING UPWARDS
            </div>
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
            Open learning for Filipino online professionals. Real talk, real sources.
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
          <span style={{ color: "#0d9488", fontWeight: 700 }}>Open, permanently</span>
          <span>·</span>
          <span>you build it, you own it</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
