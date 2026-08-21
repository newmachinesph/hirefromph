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
      {/* dt precedes dd in the DOM (valid dl); flex order keeps the value on top. */}
      <dt className="order-2 text-small font-medium text-ink-soft">{label}</dt>
      <dd className="order-1 font-display text-h3 tabular-nums text-ink">{value}</dd>
      {sub && <dd className="order-3 text-caption text-ink-soft">{sub}</dd>}
      {source && (
        <dd className="order-4">
          <Source {...source} />
        </dd>
      )}
    </div>
  );
  // Every Stat owns its dl so wrappers (Card, grid items) can never break the
  // dl > dt/dd contract; the strip just lays the dls out.
  void inStrip;
  return <dl className="m-0">{body}</dl>;
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
    <div className={cn("grid grid-cols-2 gap-x-8 gap-y-6 lg:grid-flow-col lg:auto-cols-fr", className)}>
      <StatStripContext.Provider value={true}>{children}</StatStripContext.Provider>
    </div>
  );
}
