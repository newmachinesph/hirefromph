"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useFieldControl } from "./field";

export type ChoiceCardProps = {
  name: string;
  value: string;
  label: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
};

/** A radio rendered as a card. Wrap a set in `Field as="group"`. */
export function ChoiceCard({
  name,
  value,
  label,
  description,
  icon,
  checked,
  defaultChecked,
  onChange,
  disabled = false,
  className,
}: ChoiceCardProps) {
  const field = useFieldControl();
  return (
    <label
      className={cn(
        "flex cursor-pointer gap-3 rounded-md border border-line bg-paper p-4 transition-colors duration-150 ease-out",
        "hover:border-ink hover:bg-band",
        "has-[:checked]:border-primary has-[:checked]:bg-primary-tint",
        "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary",
        disabled && "cursor-not-allowed opacity-60 hover:border-line hover:bg-paper",
        className,
      )}
    >
      <input
        type="radio"
        className="sr-only"
        name={name}
        value={value}
        checked={checked}
        defaultChecked={defaultChecked}
        disabled={disabled}
        aria-describedby={field.describedBy}
        onChange={(event) => onChange?.(event.target.value)}
      />
      {icon && <span className="shrink-0 text-primary">{icon}</span>}
      <span className="flex flex-col gap-1">
        <span className="text-base font-medium text-ink">{label}</span>
        {description && <span className="text-small text-ink-soft">{description}</span>}
      </span>
    </label>
  );
}
