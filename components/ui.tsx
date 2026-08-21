/**
 * Compatibility shim for the 33 pre-overhaul pages.
 *
 * The real implementations live in `components/ui/` and `components/layout/`.
 * Everything below is a thin wrapper around them that keeps the old prop
 * shapes compiling. Phase 5 migrates the call sites and deletes this file —
 * do not add anything new here.
 */
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Badge, Button, Icon, type BadgeTone } from "@/components/ui/index";
import {
  PageHero as LayoutPageHero,
  SectionHeading as LayoutSectionHeading,
  type SectionHeadingProps,
} from "@/components/layout";

export * from "./ui/index";

/** @deprecated Use `Badge`. */
export function Pill({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <Badge tone={tone} variant="soft" className={className}>
      {children}
    </Badge>
  );
}

/** @deprecated Use `Button`. */
export function ButtonLink({
  href,
  children,
  variant = "primary",
  external,
  className,
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "ghost" | "outline";
  external?: boolean;
  className?: string;
}) {
  return (
    <Button
      href={href}
      external={external}
      variant={variant}
      size="md"
      className={className}
      iconEnd={<Icon name="arrow-right" size={16} />}
    >
      {children}
    </Button>
  );
}

/** @deprecated Use `Button variant="link"`. */
export function ArrowLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-1 text-small font-semibold text-ink transition-colors duration-150 ease-out hover:text-primary",
        className,
      )}
    >
      <span className="link-sweep">{children}</span>
      <Icon name="arrow-up-right" size={16} />
    </Link>
  );
}

/** @deprecated Import `SectionHeading` from `@/components/layout`. */
export function SectionHeading({
  kicker,
  title,
  lead,
  align = "left",
  className,
}: Pick<SectionHeadingProps, "kicker" | "title" | "lead" | "align" | "className">) {
  return (
    <LayoutSectionHeading
      kicker={kicker}
      title={title}
      lead={lead}
      align={align}
      className={className}
    />
  );
}

/**
 * @deprecated Import `PageHero` from `@/components/layout`.
 *
 * `titleWidth` and `backdrop` are accepted and ignored: headline width is now
 * the type scale's job, and the backdrops were the blur blobs §9 deletes.
 * The shim also renders its own `<section>` rhythm through the layout
 * component, so pages keep their spacing without passing anything new.
 */
export function PageHero({
  kicker,
  title,
  lead,
  titleWidth: _titleWidth,
  backdrop: _backdrop,
  className,
  children,
}: {
  kicker: string;
  title: ReactNode;
  lead?: ReactNode;
  titleWidth?: string;
  backdrop?: ReactNode;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <LayoutPageHero kicker={kicker} title={title} lead={lead} compact className={className}>
      {children}
    </LayoutPageHero>
  );
}

/** @deprecated Slop pattern (§9). Unused; deleted in Phase 5. */
export function Marquee({ items }: { items: string[] }) {
  const doubled = [...items, ...items];
  return (
    <div className="relative overflow-hidden border-y border-line bg-ink py-4 text-on-navy">
      <div className="marquee-track gap-10">
        {doubled.map((it, idx) => (
          <span
            key={idx}
            className="flex shrink-0 items-center gap-10 font-display text-lg tracking-tight"
          >
            {it}
            <span className="text-primary">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
