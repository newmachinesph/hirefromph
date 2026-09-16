import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Hire From PH — Be the reason they hire from the Philippines.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const cabinetBold = await readFile(join(process.cwd(), "app/fonts/CabinetGrotesk-Bold.ttf"));

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
          background: "#4B4EF6",
          color: "#FFFFFF",
          fontFamily: "sans-serif",
        }}
      >
        {/* brand row */}
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <svg width={82} height={82} viewBox="0 0 32 32" fill="none" style={{ display: "flex" }}>
            <rect x="6" y="3" width="4" height="26" rx="1" fill="#FFFFFF" />
            <rect x="22" y="3" width="4" height="26" rx="1" fill="#FFFFFF" />
            <rect x="10" y="5" width="12" height="4" fill="#FFFFFF" />
            <rect x="10" y="14" width="12" height="4" fill="#FFFFFF" />
            <rect x="10" y="23" width="12" height="4" fill="#FFFFFF" />
          </svg>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                fontSize: 44,
                fontWeight: 700,
                lineHeight: 1,
              }}
            >
              <span>Hire From PH</span>
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 6,
                fontSize: 19,
                fontWeight: 600,
                letterSpacing: 5,
                color: "rgba(255,255,255,0.75)",
              }}
            >
              THE STANDARD, NOT THE DISCOUNT
            </div>
          </div>
        </div>

        {/* headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              fontFamily: "Cabinet Grotesk",
              fontSize: 68,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: -1,
              maxWidth: 1020,
            }}
          >
            Be the reason they hire from the Philippines.
          </div>
        </div>

        {/* footer row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 24,
            color: "rgba(255,255,255,0.85)",
          }}
        >
          <span style={{ fontWeight: 700 }}>learn.hirefrom.ph</span>
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: "Cabinet Grotesk", data: cabinetBold, weight: 700, style: "normal" }] },
  );
}
