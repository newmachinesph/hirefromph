"use client";

import { useId, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useFieldControl } from "./field";

export type RadioProps = ComponentPropsWithoutRef<"input"> & { label: ReactNode };

export function Radio({
  label,
  className,
  id,
  "aria-describedby": describedBy,
  ...rest
}: RadioProps) {
  const field = useFieldControl();
  const ownId = useId();
  const controlId = id ?? field.id ?? ownId;
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <input
        {...rest}
        type="radio"
        id={controlId}
        aria-describedby={describedBy ?? field.describedBy}
        className="h-5 w-5 shrink-0 border border-control accent-primary disabled:cursor-not-allowed"
      />
      <label
        htmlFor={controlId}
        className="flex min-h-11 cursor-pointer items-center py-2 text-base text-ink"
      >
        {label}
      </label>
    </div>
  );
}
