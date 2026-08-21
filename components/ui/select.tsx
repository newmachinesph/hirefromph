"use client";

import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";
import { controlClass, useFieldControl } from "./field";

export type SelectProps = ComponentPropsWithoutRef<"select">;

export function Select({
  className,
  id,
  required,
  children,
  "aria-describedby": describedBy,
  ...rest
}: SelectProps) {
  const field = useFieldControl();
  return (
    <select
      {...rest}
      id={id ?? field.id}
      required={required ?? field.required}
      aria-describedby={describedBy ?? field.describedBy}
      aria-invalid={field.invalid || undefined}
      className={cn(controlClass, "h-11", field.invalid && "border-coral", className)}
    >
      {children}
    </select>
  );
}
