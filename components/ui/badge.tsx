import type { ReactNode } from "react";
import { ACCENT, isAccent, type Accent } from "@/lib/accent";
import { cn } from "@/lib/utils";

/** "neutral" plus every stage accent. Shared by Badge, Kicker and Callout. */
export type BadgeTone = "neutral" | Accent;
export type BadgeVariant = "soft" | "outline";

export type BadgeProps = {
  children: ReactNode;
  tone?: BadgeTone;
  variant?: BadgeVariant;
  className?: string;
};

const NEUTRAL: Record<BadgeVariant, string> = {
  soft: "bg-band text-ink-soft border-line-strong",
  outline: "bg-transparent text-ink-soft border-line-strong",
};

export function Badge({
  children,
  tone = "neutral",
  variant = "soft",
  className,
}: BadgeProps) {
  const a = isAccent(tone) ? ACCENT[tone] : undefined;
  const toneClass = a
    ? variant === "soft"
      ? a.soft
      : cn("bg-transparent", a.text, a.border)
    : NEUTRAL[variant];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-pill border px-3 py-1 text-caption font-medium",
        toneClass,
        className,
      )}
    >
      {children}
    </span>
  );
}
