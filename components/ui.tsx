import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/reveal";

export function Kicker({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={cn("kicker inline-flex items-center gap-2", className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-coral" />
      {children}
    </span>
  );
}

export function Pill({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: "neutral" | "coral" | "emerald" | "amber" | "indigo";
  className?: string;
}) {
  const tones: Record<string, string> = {
    neutral: "bg-paper-3 text-ink-soft border-line-strong",
    coral: "bg-coral-tint text-coral-deep border-coral/25",
    emerald: "bg-emerald-tint text-emerald border-emerald/25",
    amber: "bg-amber-tint text-amber-text border-amber/30",
    indigo: "bg-indigo-tint text-indigo border-indigo/25",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

type ButtonProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "ghost" | "outline";
  external?: boolean;
  className?: string;
};

export function ButtonLink({
  href,
  children,
  variant = "primary",
  external,
  className,
}: ButtonProps) {
  const base =
    "group inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all duration-300 will-change-transform";
  const variants: Record<string, string> = {
    primary:
      "bg-ink text-paper-2 hover:bg-coral hover:shadow-[var(--shadow-coral)] hover:-translate-y-0.5",
    outline:
      "border border-line-strong text-ink hover:border-ink hover:-translate-y-0.5 bg-paper-2",
    ghost: "text-ink hover:text-coral",
  };
  const inner = (
    <>
      {children}
      <ArrowRight
        size={16}
        className="transition-transform duration-300 group-hover:translate-x-1"
      />
    </>
  );
  const cls = cn(base, variants[variant], className);
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {inner}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {inner}
    </Link>
  );
}

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
        "group inline-flex items-center gap-1 text-sm font-semibold text-ink transition-colors hover:text-coral",
        className,
      )}
    >
      <span className="link-sweep">{children}</span>
      <ArrowUpRight
        size={16}
        className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
      />
    </Link>
  );
}

export function SectionHeading({
  kicker,
  title,
  lead,
  align = "left",
  className,
}: {
  kicker?: string;
  title: ReactNode;
  lead?: ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      {kicker && <Kicker>{kicker}</Kicker>}
      <h2 className="font-display text-[length:var(--text-h2)] leading-[var(--text-h2--line-height)] text-balance">
        {title}
      </h2>
      {lead && (
        <p
          className={cn(
            "text-[length:var(--text-lead)] leading-relaxed text-ink-soft",
            align === "center" ? "max-w-2xl" : "max-w-xl",
          )}
        >
          {lead}
        </p>
      )}
    </div>
  );
}

/**
 * Standard interior-page hero: kicker, headline, optional lead paragraph.
 * One place for headline size, top margin, and hero padding so pages stop
 * drifting. `titleWidth` stays per-page because it tracks headline length.
 */
export function PageHero({
  kicker,
  title,
  lead,
  titleWidth = "max-w-3xl",
  backdrop,
  className,
  children,
}: {
  kicker: string;
  title: ReactNode;
  lead?: ReactNode;
  /** Tailwind max-width class for the headline; varies with title length. */
  titleWidth?: string;
  /** Absolute-positioned decorative element(s) behind the hero. */
  backdrop?: ReactNode;
  className?: string;
  /** Extra hero content after the lead (buttons, quote, etc.). */
  children?: ReactNode;
}) {
  return (
    <section
      className={cn(
        "container-x pt-14 pb-10 lg:pt-20",
        backdrop && "relative",
        className,
      )}
    >
      {backdrop}
      <Reveal>
        <Kicker>{kicker}</Kicker>
      </Reveal>
      <Reveal i={1}>
        <h1
          className={cn(
            "mt-5 font-display text-[length:var(--text-display)] leading-[var(--text-display--line-height)] text-balance",
            titleWidth,
          )}
        >
          {title}
        </h1>
      </Reveal>
      {lead && (
        <Reveal i={2}>
          <p className="mt-6 max-w-2xl text-[length:var(--text-lead)] leading-relaxed text-ink-soft">
            {lead}
          </p>
        </Reveal>
      )}
      {children}
    </section>
  );
}

export function Marquee({ items }: { items: string[] }) {
  const doubled = [...items, ...items];
  return (
    <div className="relative overflow-hidden border-y border-line bg-ink py-4 text-paper-2">
      <div className="marquee-track gap-10">
        {doubled.map((it, idx) => (
          <span
            key={idx}
            className="flex shrink-0 items-center gap-10 font-display text-lg tracking-tight"
          >
            {it}
            <span className="text-coral">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
