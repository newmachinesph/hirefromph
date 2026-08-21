import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type HeadingSize = "hero" | "display" | "h2" | "h3" | "h4" | "h5";

export type HeadingProps = {
  children: ReactNode;
  /** Document outline. Independent of `size`. */
  level?: HeadingLevel;
  /** Visual step on the type scale. Defaults to the level's natural size. */
  size?: HeadingSize;
  /**
   * Trailing copy segment. On `hero`/`display` it is rendered in `primary`
   * (spec §4.1 allows headline accent colouring only at those two sizes).
   * At smaller sizes the copy is still shown, just not coloured — dropping
   * an author's words silently would be worse than ignoring the styling.
   */
  accent?: string;
  balance?: boolean;
  tone?: "ink" | "inherit";
  id?: string;
  className?: string;
};

const SIZE: Record<HeadingSize, string> = {
  hero: "text-hero",
  display: "text-display",
  h2: "text-h2",
  h3: "text-h3",
  h4: "text-h4",
  h5: "text-h5",
};

const LEVEL_DEFAULT: Record<HeadingLevel, HeadingSize> = {
  1: "display",
  2: "h2",
  3: "h3",
  4: "h4",
  5: "h5",
  6: "h5",
};

export function Heading({
  children,
  level = 2,
  size,
  accent,
  balance = false,
  tone = "ink",
  id,
  className,
}: HeadingProps) {
  const Tag = `h${level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  const step = size ?? LEVEL_DEFAULT[level];
  const canColourAccent = step === "hero" || step === "display";

  return (
    <Tag
      id={id}
      className={cn(
        "font-display",
        SIZE[step],
        tone === "ink" && "text-ink",
        balance && "text-balance",
        className,
      )}
    >
      {children}
      {accent ? (
        <>
          {" "}
          <span className={canColourAccent ? "text-primary" : undefined}>{accent}</span>
        </>
      ) : null}
    </Tag>
  );
}
