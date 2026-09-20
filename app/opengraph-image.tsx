import { BrandMark } from "@/components/site/brand-mark-og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "HireFromPH — Be the reason they hire from the Philippines.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const interBold = await readFile(join(process.cwd(), "app/fonts/Inter-Bold.woff"));

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
          background: "#043882",
          color: "#FFFFFF",
          fontFamily: "Inter",
        }}
      >
        {/* brand row */}
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <BrandMark size={82} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                fontSize: 44,
                fontWeight: 700,
                lineHeight: 1,
              }}
            >
              <span>HireFrom</span>
              <span style={{ color: "#FCC449" }}>PH</span>
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
              fontFamily: "Inter",
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
    { ...size, fonts: [{ name: "Inter", data: interBold, weight: 700, style: "normal" }] },
  );
}
