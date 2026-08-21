import type { ReactNode } from "react";
import { ACCENT, isAccent } from "@/lib/accent";
import { cn } from "@/lib/utils";
import type { BadgeTone } from "./badge";

export type KickerTone = BadgeTone;

/**
 * Section eyebrow: outlined pill, uppercase, Inter. No leading dot, no mono —
 * the dot-and-mono kicker is one of the slop tells this overhaul removes.
 */
export function Kicker({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: KickerTone;
  className?: string;
}) {
  const a = isAccent(tone) ? ACCENT[tone] : undefined;
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-pill border px-3 py-1 text-kicker uppercase",
        a ? cn(a.text, a.border) : "border-line-strong text-ink-faint",
        className,
      )}
    >
      {children}
    </span>
  );
}
