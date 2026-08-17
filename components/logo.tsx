import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Aspect of the bracket-PH mark: 48 wide × 32 tall. */
const MARK_RATIO = 48 / 32;

export function LogoMark({
  size = 32,
  className,
  title,
  onDark,
}: {
  size?: number;
  className?: string;
  title?: string;
  onDark?: boolean;
}) {
  const bracket = onDark ? "#FFFFFF" : "var(--signal)";
  const letters = onDark ? "#FFFFFF" : "var(--ink)";
  return (
    <svg
      width={Math.round(size * MARK_RATIO)}
      height={size}
      viewBox="0 0 48 32"
      fill="none"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title && <title>{title}</title>}
      <path d="M0 0H11V4H4V28H11V32H0V0Z" fill={bracket} />
      <path d="M48 0H37V4H44V28H37V32H48V0Z" fill={bracket} />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14 6H18.75A5.25 5.25 0 0 1 18.75 16.5H17V26H14V6ZM17 9V13.5H18.75A2.25 2.25 0 0 0 18.75 9H17Z"
        fill={letters}
      />
      <path d="M26 6H29V14.5H32V6H35V26H32V17.5H29V26H26V6Z" fill={letters} />
    </svg>
  );
}

/** Full lockup, mark plus the Hire From PH wordmark. */
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
  /** Show the "the standard, not the discount" sub-line under the wordmark. */
  showTagline?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark size={markSize} onDark={onDark} />
      <span className="inline-flex flex-col">
        <span className="font-display text-xl leading-none tracking-tight">
          {wordmark ?? (
            <>
              Hire From <span className="text-signal">PH</span>
            </>
          )}
        </span>
        {showTagline && (
          <span
            className={cn(
              "mt-1 hidden text-[0.5625rem] font-medium uppercase leading-none tracking-[0.2em] min-[400px]:block",
              onDark ? "text-paper-2/60" : "text-ink-soft",
            )}
          >
            the standard, not the discount
          </span>
        )}
      </span>
    </span>
  );
}

/** The lockup's bracket on its own, for pull-quotes and section rules. */
export function Bracket({ className }: { className?: string }) {
  return (
    <svg width="12" height="32" viewBox="0 0 12 32" fill="none" className={className} aria-hidden>
      <path d="M12 3H3v26h9v-3H6V6h6V3Z" fill="currentColor" />
    </svg>
  );
}
