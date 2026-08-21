"use client";

import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";
import { controlClass, useFieldControl } from "./field";

export type TextareaProps = ComponentPropsWithoutRef<"textarea">;

export function Textarea({
  className,
  id,
  required,
  rows = 4,
  "aria-describedby": describedBy,
  ...rest
}: TextareaProps) {
  const field = useFieldControl();
  return (
    <textarea
      {...rest}
      rows={rows}
      id={id ?? field.id}
      required={required ?? field.required}
      aria-describedby={describedBy ?? field.describedBy}
      aria-invalid={field.invalid || undefined}
      className={cn(
        controlClass,
        "min-h-28 resize-y",
        field.invalid && "border-coral focus:border-coral",
        className,
      )}
    />
  );
}
