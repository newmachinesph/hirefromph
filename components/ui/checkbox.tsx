"use client";

import { useId, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useFieldControl } from "./field";

export type CheckboxProps = ComponentPropsWithoutRef<"input"> & { label: ReactNode };

export function Checkbox({
  label,
  className,
  id,
  "aria-describedby": describedBy,
  ...rest
}: CheckboxProps) {
  const field = useFieldControl();
  const ownId = useId();
  const controlId = id ?? field.id ?? ownId;
  return (
    <div className={cn("flex items-start gap-2.5", className)}>
      <input
        {...rest}
        type="checkbox"
        id={controlId}
        aria-describedby={describedBy ?? field.describedBy}
        className="mt-0.5 h-5 w-5 shrink-0 rounded-sm border border-control accent-primary disabled:cursor-not-allowed"
      />
      <label htmlFor={controlId} className="text-base text-ink">
        {label}
      </label>
    </div>
  );
}
