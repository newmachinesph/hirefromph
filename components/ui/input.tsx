"use client";

import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";
import { controlClass, useFieldControl } from "./field";

export type InputProps = ComponentPropsWithoutRef<"input">;

export function Input({
  className,
  id,
  required,
  "aria-describedby": describedBy,
  ...rest
}: InputProps) {
  const field = useFieldControl();
  return (
    <input
      {...rest}
      id={id ?? field.id}
      required={required ?? field.required}
      aria-describedby={describedBy ?? field.describedBy}
      aria-invalid={field.invalid || undefined}
      className={cn(controlClass, field.invalid && "border-coral focus:border-coral", className)}
    />
  );
}
