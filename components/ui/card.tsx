import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type CardPadding = "none" | "sm" | "md" | "lg";
export type CardMediaRatio = "16/9" | "4/3" | "3/2" | "1/1";

export type CardProps = {
  children: ReactNode;
  padding?: CardPadding;
  /** Hover affordance: border + background only. Never translate, shadow or scale. */
  interactive?: boolean;
  /** Renders the whole card as a link (implies `interactive`). */
  href?: string;
  as?: "div" | "article" | "li" | "section";
  /** Sitting on a `band` section: use the stronger hairline. */
  onBand?: boolean;
  /** Anchor id (e.g. a glossary term) — gets `scroll-mt` so the header never covers it. */
  id?: string;
  className?: string;
};

const PADDING: Record<CardPadding, string> = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-6 lg:p-8",
};

export function Card({
  children,
  padding = "md",
  interactive = false,
  href,
  as: Tag = "div",
  onBand = false,
  id,
  className,
}: CardProps) {
  const cls = cn(
    "flex flex-col overflow-hidden rounded-md bg-paper",
    onBand ? "border border-line-strong" : "border border-line",
    PADDING[padding],
    (interactive || href) &&
      "transition-colors duration-150 ease-out hover:border-ink hover:bg-band",
    id && "scroll-mt-24",
    className,
  );

  if (href) {
    return (
      <Link href={href} id={id} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <Tag id={id} className={cls}>
      {children}
    </Tag>
  );
}

const RATIO: Record<CardMediaRatio, string> = {
  "16/9": "aspect-[16/9]",
  "4/3": "aspect-[4/3]",
  "3/2": "aspect-[3/2]",
  "1/1": "aspect-square",
};

/** Flush media at the top of a `padding="none"` card. */
export function CardMedia({
  children,
  ratio = "16/9",
  className,
}: {
  children: ReactNode;
  ratio?: CardMediaRatio;
  className?: string;
}) {
  return (
    <div className={cn("w-full overflow-hidden bg-band", RATIO[ratio], className)}>
      {children}
    </div>
  );
}

export function CardBody({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("flex flex-1 flex-col gap-2 p-6", className)}>{children}</div>;
}

export function CardFooter({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mt-auto flex items-center gap-3 border-t border-line px-6 py-4",
        className,
      )}
    >
      {children}
    </div>
  );
}
