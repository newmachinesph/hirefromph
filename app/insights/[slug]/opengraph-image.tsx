import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { ASSET_ROOT, getInsight, listInsights } from "@/lib/insights";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return listInsights().map((insight) => ({ slug: insight.slug }));
}

/**
 * The share banner: the article's own hero photograph under a navy scrim,
 * the kicker, the title in the display face, and the site mark. Every
 * article therefore ships a custom card without anyone designing one.
 */
export default async function InsightOgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const insight = getInsight(slug);
  const cabinetBold = await readFile(join(process.cwd(), "app/fonts/CabinetGrotesk-Bold.ttf"));

  let photo: string | null = null;
  if (insight) {
    try {
      const file = await readFile(join(ASSET_ROOT, insight.slug, insight.hero.src));
      photo = `data:image/jpeg;base64,${file.toString("base64")}`;
    } catch {
      photo = null;
    }
  }

  const title = insight?.title ?? "Insights";
  const kicker = (insight?.kicker ?? "Insights").toUpperCase();
  const titleSize = title.length > 90 ? 50 : title.length > 64 ? 58 : 68;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "#0E1230",
          color: "#FFFFFF",
          fontFamily: "sans-serif",
        }}
      >
        {photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo}
            alt=""
            width={1200}
            height={630}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
        )}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(180deg, rgba(14,18,48,0.35) 0%, rgba(14,18,48,0.72) 55%, rgba(14,18,48,0.94) 100%)",
          }}
        />
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            padding: "56px 64px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <svg width={48} height={48} viewBox="0 0 32 32" fill="none" style={{ display: "flex" }}>
              <rect x="6" y="3" width="4" height="26" rx="1" fill="#C9C8FF" />
              <rect x="22" y="3" width="4" height="26" rx="1" fill="#C9C8FF" />
              <rect x="10" y="5" width="12" height="4" fill="#FFFFFF" />
              <rect x="10" y="14" width="12" height="4" fill="#FFFFFF" />
              <rect x="10" y="23" width="12" height="4" fill="#FFFFFF" />
            </svg>
            <div style={{ display: "flex", fontSize: 24, letterSpacing: "0.14em", color: "#C9C8FF" }}>
              HIRE FROM PH · {kicker}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div
              style={{
                display: "flex",
                fontFamily: "Cabinet Grotesk",
                fontSize: titleSize,
                lineHeight: 1.05,
                letterSpacing: "-0.02em",
                maxWidth: 1000,
              }}
            >
              {title}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, color: "#D6D7EA" }}>
              <div style={{ display: "flex" }}>{insight ? `${insight.minutes} min read · every figure linked to its source` : "Evidence-based essays"}</div>
              <div style={{ display: "flex" }}>learn.hirefrom.ph/insights</div>
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: "Cabinet Grotesk", data: cabinetBold, weight: 700, style: "normal" }] },
  );
}
