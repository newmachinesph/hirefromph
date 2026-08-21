"use client";

import { createContext, useContext, useState, type MouseEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type AccordionContextValue = {
  isOpen: (id: string) => boolean;
  toggle: (id: string, next: boolean) => void;
};

const AccordionContext = createContext<AccordionContextValue | null>(null);

function useAccordion(): AccordionContextValue {
  const ctx = useContext(AccordionContext);
  if (!ctx) throw new Error("AccordionItem must be used inside <Accordion>.");
  return ctx;
}

export type AccordionProps = {
  children: ReactNode;
  type?: "single" | "multiple";
  defaultOpen?: string | string[];
  className?: string;
};

export function Accordion({
  children,
  type = "single",
  defaultOpen,
  className,
}: AccordionProps) {
  const [open, setOpen] = useState<string[]>(() => {
    if (defaultOpen === undefined) return [];
    return Array.isArray(defaultOpen) ? defaultOpen : [defaultOpen];
  });

  const value: AccordionContextValue = {
    isOpen: (id) => open.includes(id),
    toggle: (id, next) =>
      setOpen((prev) => {
        if (!next) return prev.filter((x) => x !== id);
        if (type === "single") return [id];
        return prev.includes(id) ? prev : [...prev, id];
      }),
  };

  return (
    <AccordionContext.Provider value={value}>
      <div className={cn("border-t border-line", className)}>{children}</div>
    </AccordionContext.Provider>
  );
}

export function AccordionItem({
  id,
  title,
  children,
  className,
}: {
  id: string;
  title: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const { isOpen, toggle } = useAccordion();
  const open = isOpen(id);

  function onSummaryClick(event: MouseEvent<HTMLElement>) {
    // React owns `open` in both directions; the native toggle would race it.
    event.preventDefault();
    toggle(id, !open);
  }

  return (
    <details open={open} className={cn("border-b border-line", className)}>
      <summary
        onClick={onSummaryClick}
        className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-display text-h5 text-ink [&::-webkit-details-marker]:hidden"
      >
        <span>{title}</span>
        <span aria-hidden className="shrink-0 text-primary">
          {open ? "–" : "+"}
        </span>
      </summary>
      <div className="pb-5 text-body text-ink-soft">{children}</div>
    </details>
  );
}
