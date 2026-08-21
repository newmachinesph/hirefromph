"use client";

import {
  useEffect,
  useId,
  useRef,
  useSyncExternalStore,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// SSR-safe "has this hydrated on the client yet" flag. Portals need a real
// `document`, which doesn't exist during server rendering; useSyncExternalStore
// renders `getServerSnapshot` on the first (server + hydration) pass and then
// flips to `getSnapshot` once mounted, with no subscription ever firing.
const subscribeNever = () => () => {};

const SIZES = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
} as const;

export type DialogProps = {
  open: boolean;
  onClose: () => void;
  /** Always required: it names the dialog for assistive technology. */
  title: string;
  /** Renders the title sr-only when the visual design has no header. */
  hideTitle?: boolean;
  description?: string;
  size?: keyof typeof SIZES;
  placement?: "center" | "top";
  /** Drop the header chrome and body padding (search palettes, media). */
  flush?: boolean;
  hideClose?: boolean;
  children: ReactNode;
  className?: string;
};

export function Dialog({
  open,
  onClose,
  title,
  hideTitle = false,
  description,
  size = "md",
  placement = "center",
  flush = false,
  hideClose = false,
  children,
  className,
}: DialogProps) {
  const baseId = useId();
  const titleId = `${baseId}-title`;
  const descId = `${baseId}-desc`;
  const panelRef = useRef<HTMLDivElement>(null);
  const returnTo = useRef<HTMLElement | null>(null);
  const mounted = useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );

  useEffect(() => {
    if (!open) return;
    returnTo.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const panel = panelRef.current;
    const first = panel?.querySelector<HTMLElement>(FOCUSABLE);
    (first ?? panel)?.focus({ preventScroll: true });

    return () => {
      document.body.style.overflow = previousOverflow;
      returnTo.current?.focus({ preventScroll: true });
    };
  }, [open]);

  function onKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      onClose();
      return;
    }
    if (event.key !== "Tab") return;

    const panel = panelRef.current;
    if (!panel) return;

    const focusable = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
      (element) => element.getAttribute("aria-hidden") !== "true",
    );

    if (focusable.length === 0) {
      event.preventDefault();
      panel.focus();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const focused = document.activeElement;

    if (event.shiftKey && (focused === first || !panel.contains(focused))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (focused === last || !panel.contains(focused))) {
      event.preventDefault();
      first.focus();
    }
  }

  if (!mounted || !open) return null;

  return createPortal(
    <div
      onKeyDown={onKeyDown}
      className={cn(
        "fixed inset-0 z-[110] flex justify-center p-4",
        placement === "top" ? "items-start pt-[12vh]" : "items-center",
      )}
    >
      <button
        type="button"
        aria-label={`Close ${title}`}
        onClick={onClose}
        className="absolute inset-0 bg-ink/40"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        className={cn(
          "relative z-10 w-full overflow-hidden rounded-lg border border-line bg-paper shadow-[var(--shadow-md)]",
          SIZES[size],
          className,
        )}
      >
        {!hideClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-pill text-ink-soft transition-colors duration-150 ease-out hover:bg-band hover:text-ink"
          >
            <span aria-hidden>✕</span>
          </button>
        )}

        <div
          className={cn(
            hideTitle || flush ? "sr-only" : "border-b border-line px-6 py-4 pr-14",
          )}
        >
          <h2 id={titleId} className="font-display text-h5 text-ink">
            {title}
          </h2>
          {description && (
            <p id={descId} className="mt-1 text-small text-ink-soft">
              {description}
            </p>
          )}
        </div>

        <div className={cn(flush ? "" : "px-6 py-5")}>{children}</div>
      </div>
    </div>,
    document.body,
  );
}
