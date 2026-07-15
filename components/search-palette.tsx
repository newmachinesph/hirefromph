"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import site from "@/data/site.json";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

type Item = { label: string; href: string; group: string };

const ITEMS: Item[] = site.navGroups.flatMap((g) =>
  g.links.map((l) => ({ label: l.label, href: l.href, group: g.title })),
);

export function SearchPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Cmd/Ctrl+K toggles the palette from anywhere.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setQuery("");
        setActive(0);
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Focus the input when opened (open handlers do the state reset).
  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(id);
  }, [open]);

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return ITEMS;
    return ITEMS.filter(
      (it) =>
        it.label.toLowerCase().includes(term) ||
        it.group.toLowerCase().includes(term),
    );
  }, [query]);

  function go(item: Item | undefined) {
    if (!item) return;
    track("site_search_nav", { href: item.href });
    setOpen(false);
    router.push(item.href);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setQuery("");
          setActive(0);
          setOpen(true);
        }}
        aria-label="Search pages"
        title="Search (Ctrl K)"
        className="grid h-10 w-10 place-items-center rounded-full border border-line-strong bg-paper-2 text-ink-soft transition-colors hover:border-ink hover:text-ink"
      >
        <Search size={17} />
      </button>

      {open &&
        createPortal(
          <div className="fixed inset-0 z-[110] flex items-start justify-center p-4 pt-[12vh]">
          <button
            type="button"
            aria-label="Close search"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Search pages"
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-[var(--radius-lg)] border border-line bg-paper-2 shadow-[var(--shadow-lg)]"
          >
            <div className="flex items-center gap-3 border-b border-line px-4">
              <Search size={18} className="shrink-0 text-ink-faint" aria-hidden />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActive(0);
                }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setActive((i) => Math.min(i + 1, results.length - 1));
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setActive((i) => Math.max(i - 1, 0));
                  } else if (e.key === "Enter") {
                    e.preventDefault();
                    go(results[active]);
                  } else if (e.key === "Escape") {
                    setOpen(false);
                  }
                }}
                type="text"
                role="combobox"
                aria-expanded
                aria-controls="search-results"
                aria-autocomplete="list"
                aria-label="Search pages"
                placeholder="Search pages…"
                className="h-14 w-full bg-transparent text-base text-ink outline-none placeholder:text-ink-faint"
              />
              <kbd className="hidden shrink-0 rounded border border-line px-1.5 py-0.5 text-[11px] text-ink-faint sm:block">
                Esc
              </kbd>
            </div>
            <ul
              id="search-results"
              role="listbox"
              className="max-h-[50vh] overflow-y-auto p-2"
            >
              {results.length === 0 ? (
                <li className="px-3 py-6 text-center text-sm text-ink-faint">
                  No pages match “{query}”.
                </li>
              ) : (
                results.map((it, i) => (
                  <li key={it.href} role="option" aria-selected={i === active}>
                    <button
                      type="button"
                      onMouseEnter={() => setActive(i)}
                      onClick={() => go(it)}
                      className={cn(
                        "flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                        i === active
                          ? "bg-ink text-paper-2"
                          : "text-ink hover:bg-paper-3",
                      )}
                    >
                      <span className="font-medium">{it.label}</span>
                      <span
                        className={cn(
                          "text-xs",
                          i === active ? "text-paper-2/60" : "text-ink-faint",
                        )}
                      >
                        {it.group}
                      </span>
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>,
          document.body,
        )}
    </>
  );
}
