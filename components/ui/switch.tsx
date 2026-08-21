"use client";

import { useId, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useFieldControl } from "./field";

export type SwitchProps = {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: ReactNode;
  hideLabel?: boolean;
  disabled?: boolean;
  id?: string;
  className?: string;
};

export function Switch({
  checked,
  onChange,
  label,
  hideLabel = false,
  disabled = false,
  id,
  className,
}: SwitchProps) {
  const field = useFieldControl();
  const ownId = useId();
  const controlId = id ?? field.id ?? ownId;
  const labelId = `${controlId}-label`;

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <button
        type="button"
        role="switch"
        id={controlId}
        aria-checked={checked}
        aria-labelledby={labelId}
        aria-describedby={field.describedBy}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 items-center rounded-pill border transition-colors duration-150 ease-out",
          checked ? "border-primary bg-primary" : "border-control bg-band",
          disabled && "cursor-not-allowed opacity-50",
        )}
      >
        <span
          aria-hidden
          className={cn(
            "ml-0.5 h-5 w-5 rounded-pill bg-paper transition-transform duration-150 ease-out",
            checked && "translate-x-5",
          )}
        />
      </button>
      <span id={labelId} className={cn("text-base text-ink", hideLabel && "sr-only")}>
        {label}
      </span>
    </div>
  );
}
