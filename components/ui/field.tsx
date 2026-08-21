"use client";

import { createContext, useContext, useId, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type FieldContextValue = {
  /** The control's id. `undefined` in group mode — children keep their own. */
  id: string | undefined;
  describedBy: string | undefined;
  invalid: boolean;
  required: boolean;
};

const EMPTY: FieldContextValue = {
  id: undefined,
  describedBy: undefined,
  invalid: false,
  required: false,
};

const FieldContext = createContext<FieldContextValue | null>(null);

/** Controls read their wiring from here. Safe to call outside a `Field`. */
export function useFieldControl(): FieldContextValue {
  return useContext(FieldContext) ?? EMPTY;
}

/** Shared control chrome. `border-control` is the 3:1 UI-minimum grey. */
export const controlClass =
  "w-full min-h-11 rounded-sm border border-control bg-paper px-3 py-2 text-base text-ink transition-colors duration-150 ease-out placeholder:text-ink-faint hover:border-ink-faint focus:border-primary disabled:cursor-not-allowed disabled:bg-band disabled:text-ink-faint";

export type FieldProps = {
  label: ReactNode;
  children: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  hideLabel?: boolean;
  /** "group" renders fieldset/legend — use it for Radio and ChoiceCard sets. */
  as?: "field" | "group";
  className?: string;
};

export function Field({
  label,
  children,
  hint,
  error,
  required = false,
  hideLabel = false,
  as = "field",
  className,
}: FieldProps) {
  const base = useId();
  const controlId = `${base}-control`;
  const hintId = `${base}-hint`;
  const errorId = `${base}-error`;
  const describedBy =
    [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ") || undefined;

  const value: FieldContextValue = {
    id: as === "group" ? undefined : controlId,
    describedBy,
    invalid: Boolean(error),
    required,
  };

  const labelText = (
    <>
      {label}
      {required && (
        <span aria-hidden className="ml-1 text-coral">
          *
        </span>
      )}
    </>
  );

  const hintNode = hint ? (
    <p id={hintId} className="text-caption text-ink-faint">
      {hint}
    </p>
  ) : null;

  const errorNode = error ? (
    <p id={errorId} role="alert" className="text-caption text-coral">
      {error}
    </p>
  ) : null;

  if (as === "group") {
    return (
      <FieldContext.Provider value={value}>
        <fieldset
          className={cn("flex min-w-0 flex-col gap-1.5 border-0 p-0", className)}
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
        >
          <legend className={cn("text-small font-medium text-ink", hideLabel && "sr-only")}>
            {labelText}
          </legend>
          {hintNode}
          {children}
          {errorNode}
        </fieldset>
      </FieldContext.Provider>
    );
  }

  return (
    <FieldContext.Provider value={value}>
      <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
        <label
          htmlFor={controlId}
          className={cn("text-small font-medium text-ink", hideLabel && "sr-only")}
        >
          {labelText}
        </label>
        {hintNode}
        {children}
        {errorNode}
      </div>
    </FieldContext.Provider>
  );
}
