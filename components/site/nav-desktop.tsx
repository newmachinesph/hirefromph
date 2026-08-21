"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { Icon } from "@/components/ui";
import { NAV, isLive, isMenu, type NavColumn, type NavLink, type NavMenu } from "@/lib/nav";
import { cn } from "@/lib/utils";

/** Longest a menu column may run before the group wraps into a second column. */
const MAX_LINKS_PER_COLUMN = 5;
const PANEL_WIDTH = ["w-[22rem]", "w-[36rem]", "w-[52rem]", "w-[66rem]"] as const;
const GRID_COLS = ["", "sm:grid-cols-2", "sm:grid-cols-3", "sm:grid-cols-4"] as const;

type NavPanelColumn = { title: string; part: number; links: NavLink[] };

/**
 * Lays a menu's groups out as columns of at most MAX_LINKS_PER_COLUMN live
 * links each, so one long group ("Build skills", nine pages) wraps into two
 * columns instead of one scroll-length list. Continuation columns keep the
 * group title only as an invisible spacer so the rows line up.
 */
export function splitColumns(groups: NavColumn[]): NavPanelColumn[] {
  return groups.flatMap((group) => {
    const live = group.links.filter(isLive);
    const parts = Math.max(1, Math.ceil(live.length / MAX_LINKS_PER_COLUMN));
    const size = Math.ceil(live.length / parts);
    return Array.from({ length: parts }, (_, part) => ({
      title: group.title,
      part,
      links: live.slice(part * size, (part + 1) * size),
    }));
  });
}

/** Marks the focusable rows inside an open panel, in visual order. */
const ITEM_SELECTOR = "a[data-nav-item]";

export function NavDesktop() {
  const pathname = usePathname();
  const [openLabel, setOpenLabel] = useState<string | null>(null);

  // A deliberate UI-reset-on-route-change: covers link clicks and browser
  // back/forward. Not derivable state, so the effect is the right tool.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setOpenLabel(null);
  }, [pathname]);
  /* eslint-enable react-hooks/set-state-in-effect */

  return (
    <nav aria-label="Primary" className="relative hidden items-center gap-1 lg:flex">
      {NAV.map((item) =>
        isMenu(item) ? (
          <NavDropdown
            key={item.label}
            item={item}
            pathname={pathname}
            open={openLabel === item.label}
            onOpenChange={(next) => setOpenLabel(next ? item.label : null)}
          />
        ) : (
          <Link
            key={item.label}
            href={item.href}
            aria-current={pathname === item.href ? "page" : undefined}
            className={cn(
              "relative inline-flex min-h-11 items-center rounded-pill px-3.5 py-2 text-base font-medium transition-colors duration-150",
              pathname === item.href ? "text-primary" : "text-ink-soft hover:text-ink",
            )}
          >
            {item.label}
            {pathname === item.href && <ActiveUnderline />}
          </Link>
        ),
      )}
    </nav>
  );
}

function ActiveUnderline() {
  return (
    <span
      aria-hidden
      className="absolute inset-x-3.5 -bottom-0.5 block h-0.5 rounded-pill bg-primary"
    />
  );
}

function NavDropdown({
  item,
  pathname,
  open,
  onOpenChange,
}: {
  item: NavMenu;
  pathname: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const panelId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const footerLinks = (item.footerLinks ?? []).filter(isLive);
  const columns = splitColumns(item.groups);
  // Panels three columns and wider are centred under the whole nav (so they
  // never clip at the viewport edge); narrower ones hang from their trigger.
  const wide = columns.length >= 3;
  const active = [...item.groups.flatMap((group) => group.links), ...footerLinks].some(
    (link) => link.href === pathname,
  );

  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) {
        onOpenChange(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open, onOpenChange]);

  function close(returnFocus: boolean) {
    onOpenChange(false);
    if (returnFocus) triggerRef.current?.focus({ preventScroll: true });
  }

  function rows(): HTMLAnchorElement[] {
    return Array.from(panelRef.current?.querySelectorAll<HTMLAnchorElement>(ITEM_SELECTOR) ?? []);
  }

  function focusRow(index: number) {
    const list = rows();
    if (list.length === 0) return;
    list[((index % list.length) + list.length) % list.length]?.focus();
  }

  function onTriggerKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>) {
    if (event.key === "Escape" && open) {
      event.preventDefault();
      close(true);
      return;
    }
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    onOpenChange(true);
    const first = event.key === "ArrowDown" ? 0 : -1;
    window.requestAnimationFrame(() => focusRow(first));
  }

  function onPanelKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      close(true);
      return;
    }
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    const list = rows();
    const current = list.indexOf(document.activeElement as HTMLAnchorElement);
    focusRow(current === -1 ? 0 : current + (event.key === "ArrowDown" ? 1 : -1));
  }

  return (
    <div className={wide ? "static" : "relative"} ref={wrapRef}>
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-haspopup="true"
        onClick={() => onOpenChange(!open)}
        onKeyDown={onTriggerKeyDown}
        className={cn(
          "relative flex min-h-11 items-center gap-1 rounded-pill px-3.5 py-2 text-base font-medium transition-colors duration-150",
          active || open ? "text-primary" : "text-ink-soft hover:text-ink",
        )}
      >
        {item.label}
        <span
          aria-hidden
          className={cn("inline-flex transition-transform duration-150", open && "rotate-180")}
        >
          <Icon name="caret-down" size={14} />
        </span>
        {active && <ActiveUnderline />}
      </button>

      {open && (
        <div
          id={panelId}
          ref={panelRef}
          onKeyDown={onPanelKeyDown}
          className={cn(
            "absolute top-[calc(100%+0.75rem)] z-50 max-w-[calc(100vw-3rem)]",
            wide ? "left-1/2 -translate-x-1/2" : "left-0",
            "rounded-md border border-line bg-paper p-5 shadow-[var(--shadow-sm)]",
            PANEL_WIDTH[Math.min(columns.length, 4) - 1],
          )}
        >
          <div className={cn("grid gap-x-8 gap-y-6", GRID_COLS[Math.min(columns.length, 4) - 1])}>
            {columns.map((column) => (
              <div key={`${column.title}-${column.part}`} data-nav-column>
                <p
                  className={cn(
                    "text-kicker uppercase text-ink-faint",
                    column.part > 0 && "invisible",
                  )}
                  aria-hidden={column.part > 0 || undefined}
                >
                  {column.title}
                </p>
                <ul className="mt-3 flex flex-col gap-0.5">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        data-nav-item
                        href={link.href}
                        aria-current={pathname === link.href ? "page" : undefined}
                        className="flex min-h-11 items-center gap-3 rounded-sm px-3 py-2 transition-colors duration-150 hover:bg-band"
                      >
                        <span className="flex flex-col">
                          <span
                            className={cn(
                              "block text-base font-medium",
                              pathname === link.href ? "text-primary" : "text-ink",
                            )}
                          >
                            {link.label}
                          </span>
                          <span className="mt-0.5 block text-caption text-ink-faint">
                            {link.desc}
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {footerLinks.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">
              {footerLinks.map((link) => (
                <Link
                  key={link.href}
                  data-nav-item
                  href={link.href}
                  className="inline-flex min-h-11 items-center rounded-pill border border-line px-3 py-1.5 text-small font-medium text-ink-soft transition-colors duration-150 hover:border-ink hover:text-ink"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}

          <div className={cn(footerLinks.length > 0 ? "mt-3" : "mt-4 border-t border-line pt-4")}>
            <Link
              data-nav-item
              href="/library"
              className="inline-flex min-h-11 items-center gap-1.5 rounded-sm px-3 text-small font-semibold text-primary transition-colors duration-150 hover:text-primary-deep"
            >
              Browse everything in the library
              <span aria-hidden className="inline-flex">
                <Icon name="arrow-right" size={15} />
              </span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
