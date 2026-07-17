import Image from "next/image";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Intrinsic pixels of public/devup-logo.png. */
const MARK_W = 271;
const MARK_H = 280;

/**
 * DevUp brand mark (the "DU" monogram with an upward arrow) from
 * public/devup-logo.png. `onDark` renders a white silhouette for dark surfaces,
 * where the mark's dark strokes would otherwise disappear.
 */
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
  return (
    <Image
      src="/devup-logo.png"
      width={Math.round((size * MARK_W) / MARK_H)}
      height={size}
      alt={title ?? ""}
      aria-hidden={title ? undefined : true}
      className={cn(onDark && "brightness-0 invert", className)}
    />
  );
}

/** Full lockup, mark plus the DevUp wordmark. */
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
  /** Show the "developing upwards" sub-line under the wordmark. */
  showTagline?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark size={markSize} onDark={onDark} />
      <span className="inline-flex flex-col">
        <span className="font-display text-xl leading-none tracking-tight">
          {wordmark ?? (
            <>
              Dev<span className="text-coral">Up</span>
            </>
          )}
        </span>
        {showTagline && (
          <span
            className={cn(
              "mt-1 text-[0.5625rem] font-medium uppercase leading-none tracking-[0.2em]",
              onDark ? "text-paper-2/60" : "text-ink-soft",
            )}
          >
            developing upwards
          </span>
        )}
      </span>
    </span>
  );
}

/** Facebook "f" glyph. Self-contained so we don't depend on brand icons in lucide. */
export function FacebookGlyph({
  size = 16,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.9h-2.34v7A9.96 9.96 0 0 0 22 12.06Z" />
    </svg>
  );
}
