"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { getTerm } from "@/lib/glossary";

/**
 * An inline glossary term (spec §5.2b).
 *
 * The definition is always in the DOM in a visually hidden node that the
 * button points at with `aria-describedby`, so a screen reader hears it the
 * moment the term is focused, whether or not the popover is open. The popover
 * is the sighted equivalent of the same text.
 *
 * Use it on the *first* mention of a term on a page, not on every mention.
 */
export function Term({ id, children }: { id: string; children?: ReactNode }) {
  const baseId = useId();
  const term = getTerm(id);
  const [open, setOpen] = useState(false);
  const wrapper = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    function onPointerDown(event: PointerEvent) {
      if (!wrapper.current?.contains(event.target as Node)) setOpen(false);
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  // A term that is not in the glossary must never swallow the sentence.
  if (!term) return <>{children}</>;

  const descriptionId = `${baseId}-definition`;

  return (
    <span ref={wrapper} className="relative inline-block">
      <button
        type="button"
        aria-expanded={open}
        aria-describedby={descriptionId}
        onClick={() => setOpen(!open)}
        className="min-h-11 border-b border-dashed border-control text-inherit transition-colors duration-150 ease-out hover:border-primary hover:text-primary"
      >
        {children ?? term.term}
      </button>

      <span id={descriptionId} className="sr-only">
        {term.definition}
      </span>

      {open && (
        <span
          role="note"
          className="absolute left-0 top-full z-20 mt-2 flex w-72 max-w-[80vw] flex-col gap-2 rounded-md border border-line-strong bg-paper p-4 text-left"
        >
          <span className="text-small font-semibold text-ink">{term.term}</span>
          <span className="text-small leading-relaxed text-ink-soft">{term.definition}</span>
          {term.taglish && (
            <span className="text-caption leading-relaxed text-ink-faint">{term.taglish}</span>
          )}
          {term.href && (
            <Link
              href={term.href}
              className="text-caption font-medium text-primary underline underline-offset-2"
            >
              Where this is explained
            </Link>
          )}
        </span>
      )}
    </span>
  );
}
