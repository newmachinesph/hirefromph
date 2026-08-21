"use client";

import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useFieldControl } from "./field";

export type RangeProps = ComponentPropsWithoutRef<"input"> & { valueLabel?: ReactNode };

export function Range({
  valueLabel,
  className,
  id,
  "aria-describedby": describedBy,
  ...rest
}: RangeProps) {
  const field = useFieldControl();
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <input
        {...rest}
        type="range"
        id={id ?? field.id}
        aria-describedby={describedBy ?? field.describedBy}
        className="h-6 w-full accent-primary disabled:cursor-not-allowed"
      />
      {valueLabel !== undefined && (
        <span className="text-caption tabular-nums text-ink-faint">{valueLabel}</span>
      )}
    </div>
  );
}
