import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * DevUp vector mark, a coral badge with an upward arrow ("developing upwards").
 * Self-contained SVG, no external assets. Works on light and dark surfaces.
 */
export function LogoMark({
  size = 32,
  className,
  title,
}: {
  size?: number;
  className?: string;
  title?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {title ? <title>{title}</title> : null}
      <rect width="32" height="32" rx="0" fill="#0d9488" />
      <path d="M16 7 L24 15.5 H19 V25 H13 V15.5 H8 Z" fill="#fff" />
    </svg>
  );
}

/** Full lockup, mark plus the DevUp wordmark. */
export function Logo({
  className,
  markSize = 32,
  wordmark,
}: {
  className?: string;
  markSize?: number;
  wordmark?: ReactNode;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark size={markSize} />
      <span className="font-display text-xl leading-none tracking-tight">
        {wordmark ?? (
          <>
            Dev<span className="text-coral">Up</span>
          </>
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
