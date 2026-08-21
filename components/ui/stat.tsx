"use client";

import { createContext, useContext, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Source, type SourceProps } from "./source";

export type StatProps = {
  value: ReactNode;
  label: ReactNode;
  sub?: ReactNode;
  /** Honesty doctrine: a number with a claim behind it ships its source. */
  source?: SourceProps;
  className?: string;
};

/** Tracks whether a `Stat` is already inside a `StatStrip`'s `<dl>`. */
const StatStripContext = createContext(false);

export function Stat({ value, label, sub, source, className }: StatProps) {
  const inStrip = useContext(StatStripContext);
  const body = (
    <div className={cn("flex flex-col gap-1", className)}>
      <dd className="font-display text-h3 tabular-nums text-ink">{value}</dd>
      <dt className="text-small font-medium text-ink-soft">{label}</dt>
      {sub && <p className="text-caption text-ink-faint">{sub}</p>}
      {source && <Source {...source} />}
    </div>
  );
  // Outside a StatStrip, dt/dd need their own dl ancestor to stay valid HTML.
  return inStrip ? body : <dl className="m-0">{body}</dl>;
}

/** A quiet inline row of structural facts. No cute labels, no invented counts. */
export function StatStrip({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <dl className={cn("flex flex-wrap gap-x-10 gap-y-6", className)}>
      <StatStripContext.Provider value={true}>{children}</StatStripContext.Provider>
    </dl>
  );
}
