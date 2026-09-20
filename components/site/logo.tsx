import type { ReactNode } from "react";
import site from "@/data/site.json";
import { cn } from "@/lib/utils";

/**
 * The HireFromPH mark: two bamboo culms — the H — joined by a golden bridge,
 * on a navy tile. Bamboo for the Philippines, the bridge for the connection
 * the product makes. Same paths as `public/brand/mark.svg`; inlined so it can
 * be sized and needs no request.
 */
export function LogoMark({
  size = 32,
  className,
  title,
  onDark,
  mono,
}: {
  size?: number;
  className?: string;
  title?: string;
  /** On the navy band: a faint ring so the tile keeps its edge. */
  onDark?: boolean;
  /** Single-color bamboo mark for printed learning materials. */
  mono?: boolean;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 256 256"
      fill="none"
      className={cn("shrink-0", className)}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title && <title>{title}</title>}
      <rect
        width="256"
        height="256"
        rx="56"
        fill={mono ? "none" : "var(--primary)"}
        stroke={onDark ? "rgb(255 255 255 / 0.35)" : undefined}
        strokeWidth={onDark ? 8 : undefined}
      />
      <g fill={mono ? "currentColor" : "#FEFBF5"}>
        <path d="M62 62h30c-3 9-3 20 0 30v6c-3 9-3 20 0 30v6c-3 9-3 20 0 30v6c-3 9-3 20 0 30H62c3-10 3-20 0-30v-6c3-10 3-20 0-30v-6c3-10 3-20 0-30v-6c3-10 3-20 0-30z" />
        <path d="M164 62h30c-3 9-3 20 0 30v6c-3 9-3 20 0 30v6c-3 9-3 20 0 30v6c-3 9-3 20 0 30h-30c3-10 3-20 0-30v-6c3-10 3-20 0-30v-6c3-10 3-20 0-30v-6c3-10 3-20 0-30z" />
      </g>
      <g stroke={mono ? "var(--paper)" : "var(--primary)"} strokeWidth="5" strokeLinecap="round">
        <path d="M62 98q15 4 30 0M62 134q15 4 30 0M62 170q15 4 30 0" />
        <path d="M164 98q15 4 30 0M164 134q15 4 30 0M164 170q15 4 30 0" />
      </g>
      <path d="M92 130c20-22 52-22 72 0v18c-20-20-52-20-72 0z" fill={mono ? "currentColor" : "var(--gold)"} />
      <g fill={mono ? "currentColor" : "var(--gold)"}>
        <path d="M60 86c-14-8-22-14-24-26 12 2 20 10 26 22z" />
        <path d="M60 110c-8-4-14-8-16-16 8 2 12 6 16 14z" />
        <path d="M196 86c14-8 22-14 24-26-12 2-20 10-26 22z" />
        <path d="M196 110c8-4 14-8 16-16-8 2-12 6-16 14z" />
      </g>
    </svg>
  );
}

/**
 * Wide lockup: mark plus the wordmark.
 *
 * The wordmark is read from `data/site.json` rather than written here, so
 * `brand` stays the one place the name lives.
 */
export function Logo({
  className,
  markSize = 32,
  wordmark,
  onDark,
  showTagline,
}: {
  className?: string;
  markSize?: number;
  wordmark?: ReactNode;
  onDark?: boolean;
  /** Show the tagline under the wordmark. */
  showTagline?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5 max-[360px]:gap-2", className)}>
      <LogoMark size={markSize} onDark={onDark} />
      <span className="inline-flex flex-col">
        <span className="font-sans text-[1.375rem] max-[360px]:text-base font-extrabold leading-none tracking-[-0.03em]">
          {wordmark ?? <Wordmark onDark={onDark} />}
        </span>
        {showTagline && (
          <span
            className={cn(
              "mt-1 hidden text-[0.6875rem] font-medium leading-none sm:block",
              onDark ? "text-on-navy/70" : "text-ink-faint",
            )}
          >
            the standard, not the discount
          </span>
        )}
      </span>
    </span>
  );
}

/**
 * The brand name with its trailing segment in navy: Hire From **PH**.
 *
 * Split on the accent rather than storing two fields, so `brand` stays the
 * one place the name lives and an accent that no longer matches simply
 * renders plain instead of dropping a word.
 */
function Wordmark({ onDark }: { onDark?: boolean }) {
  const { brand, wordmarkAccent } = site;
  const accent = wordmarkAccent && brand.endsWith(wordmarkAccent) ? wordmarkAccent : "";
  const lead = accent ? brand.slice(0, -accent.length) : brand;

  return (
    <>
      <span className={onDark ? "text-on-navy" : "text-ink"}>{lead}</span>
      {accent && <span className={onDark ? "text-gold" : "text-primary"}>{accent}</span>}
    </>
  );
}
