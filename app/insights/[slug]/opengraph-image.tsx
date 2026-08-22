import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { getInsight, listInsights } from "@/lib/insights";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return listInsights().map((insight) => ({ slug: insight.slug }));
}

/** Typographic share card: kicker, title, author — white on the site's navy. */
export default async function InsightOgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const insight = getInsight(slug);
  const cabinetBold = await readFile(join(process.cwd(), "app/fonts/CabinetGrotesk-Bold.ttf"));
  const title = insight?.title ?? "Insights";
  const kicker = insight?.kicker ?? "Insights";
  const author = insight ? `${insight.author.name} · ${insight.author.role}` : "Hire From PH";
  const titleSize = title.length > 70 ? 54 : title.length > 48 ? 62 : 72;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "#0E1230",
          color: "#FFFFFF",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <svg width={56} height={56} viewBox="0 0 32 32" fill="none" style={{ display: "flex" }}>
            <rect x="6" y="3" width="4" height="26" rx="1" fill="#C9C8FF" />
            <rect x="22" y="3" width="4" height="26" rx="1" fill="#C9C8FF" />
            <rect x="10" y="5" width="12" height="4" fill="#FFFFFF" />
            <rect x="10" y="14" width="12" height="4" fill="#FFFFFF" />
            <rect x="10" y="23" width="12" height="4" fill="#FFFFFF" />
          </svg>
          <div style={{ display: "flex", fontSize: 26, letterSpacing: "0.14em", color: "#C9C8FF" }}>
            HIRE FROM PH · {kicker.toUpperCase()}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            fontFamily: "Cabinet Grotesk",
            fontSize: titleSize,
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            maxWidth: 1040,
          }}
        >
          {title}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26, color: "#D6D7EA" }}>
          <div style={{ display: "flex" }}>{author}</div>
          <div style={{ display: "flex" }}>hirefrom.ph/insights</div>
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: "Cabinet Grotesk", data: cabinetBold, weight: 700, style: "normal" }] },
  );
}
