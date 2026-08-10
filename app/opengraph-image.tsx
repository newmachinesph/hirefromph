import { ImageResponse } from "next/og";

export const alt = "Hire From PH — Be the reason they hire from the Philippines.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
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
          background: "#F6F7F9",
          color: "#0F1115",
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
            background: "rgba(58,53,214,0.14)",
            display: "flex",
          }}
        />

        {/* brand row */}
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <svg
            width={82}
            height={82}
            viewBox="0 0 48 32"
            fill="none"
            style={{ display: "flex" }}
          >
            <path d="M0 0H11V4H4V28H11V32H0V0Z" fill="#3A35D6" />
            <path d="M48 0H37V4H44V28H37V32H48V0Z" fill="#3A35D6" />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M14 6H18.75A5.25 5.25 0 0 1 18.75 16.5H17V26H14V6ZM17 9V13.5H18.75A2.25 2.25 0 0 0 18.75 9H17Z"
              fill="#0F1115"
            />
            <path d="M26 6H29V14.5H32V6H35V26H32V17.5H29V26H26V6Z" fill="#0F1115" />
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
              <span>Hire From </span>
              <span style={{ color: "#3A35D6" }}>PH</span>
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 6,
                fontSize: 19,
                fontWeight: 600,
                letterSpacing: 5,
                color: "#464B57",
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
              fontSize: 76,
              fontWeight: 700,
              lineHeight: 1.02,
              letterSpacing: -2,
              maxWidth: 980,
            }}
          >
            Build the online career you&nbsp;
            <span style={{ color: "#3A35D6" }}>actually own.</span>
          </div>
          <div style={{ display: "flex", fontSize: 30, color: "#464B57" }}>
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
            color: "#676D7C",
          }}
        >
          <span style={{ color: "#3A35D6", fontWeight: 700 }}>Open, permanently</span>
          <span>·</span>
          <span>you build it, you own it</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
