import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Ladder-H mark. The H of "Hire" drawn as a three-rung ladder:
 * you climb it yourself, then send it back down (the GIVE method).
 * Five rectangles on a 32×32 grid, so it survives 16 px and one colour.
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
  /** On the navy band: soft-violet rails, white rungs. */
  onDark?: boolean;
  /** Single colour (currentColor) for stamps, print, and favicons. */
  mono?: boolean;
}) {
  const rail = mono ? "currentColor" : onDark ? "var(--primary-soft)" : "var(--primary)";
  const rung = mono ? "currentColor" : onDark ? "#FFFFFF" : "var(--ink)";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title && <title>{title}</title>}
      <rect x="6" y="3" width="4" height="26" rx="1" fill={rail} />
      <rect x="22" y="3" width="4" height="26" rx="1" fill={rail} />
      <rect x="10" y="5" width="12" height="4" fill={rung} />
      <rect x="10" y="14" width="12" height="4" fill={rung} />
      <rect x="10" y="23" width="12" height="4" fill={rung} />
    </svg>
  );
}

/** Wide lockup: mark + "Hire From PH" wordmark in the display face. */
export function Logo({
  className,
  markSize = 30,
  wordmark,
  onDark,
  showTagline,
}: {
  className?: string;
  markSize?: number;
  wordmark?: ReactNode;
  onDark?: boolean;
  /** Show "the standard, not the discount" under the wordmark. */
  showTagline?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark size={markSize} onDark={onDark} />
      <span className="inline-flex flex-col">
        <span className="font-display text-[1.25rem] font-bold leading-none tracking-[-0.01em]">
          {wordmark ?? (
            <>
              Hire From{" "}
              <span className={onDark ? "text-primary-soft" : "text-primary"}>PH</span>
            </>
          )}
        </span>
        {showTagline && (
          <span
            className={cn(
              "mt-1 hidden text-[0.625rem] font-medium uppercase leading-none tracking-[0.08em] min-[400px]:block",
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

/** A single rail-and-rung glyph for pull-quotes and section rules. */
export function Bracket({ className }: { className?: string }) {
  return (
    <svg width="12" height="32" viewBox="0 0 12 32" fill="currentColor" className={className} aria-hidden>
      <rect x="0" y="2" width="4" height="28" rx="1" />
      <rect x="4" y="14" width="8" height="4" />
    </svg>
  );
}
