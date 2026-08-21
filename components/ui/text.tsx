import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type TextSize = "lead" | "body" | "base" | "small" | "caption";
export type TextTone = "ink" | "soft" | "faint" | "inherit";

export type TextProps = {
  children: ReactNode;
  size?: TextSize;
  tone?: TextTone;
  as?: "p" | "span" | "div" | "li";
  balance?: boolean;
  id?: string;
  className?: string;
};

const SIZE: Record<TextSize, string> = {
  lead: "text-lead",
  body: "text-body",
  base: "text-base",
  small: "text-small",
  caption: "text-caption",
};

const TONE: Record<TextTone, string> = {
  ink: "text-ink",
  soft: "text-ink-soft",
  faint: "text-ink-faint",
  inherit: "",
};

export function Text({
  children,
  size = "base",
  tone = "soft",
  as: Tag = "p",
  balance = false,
  id,
  className,
}: TextProps) {
  return (
    <Tag
      id={id}
      className={cn(SIZE[size], TONE[tone], balance && "text-balance", className)}
    >
      {children}
    </Tag>
  );
}
