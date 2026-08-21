"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, Icon } from "@/components/ui";
import { track } from "@/lib/analytics";
import { SEARCH_INDEX, type SearchItem } from "@/lib/nav";
import { cn } from "@/lib/utils";

function matches(item: SearchItem, term: string) {
  return (
    item.label.toLowerCase().includes(term) ||
    item.group.toLowerCase().includes(term) ||
    (item.desc ?? "").toLowerCase().includes(term)
  );
}

export function SearchPalette() {
  const router = useRouter();
  const listboxId = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Ctrl/Cmd+K opens the palette from anywhere.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "k") return;
      event.preventDefault();
      setQuery("");
      setActive(0);
      setOpen(true);
      track("site_search_open", { source: "shortcut" });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Dialog puts focus in the panel; the combobox is where typing should land.
  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(id);
  }, [open]);

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return SEARCH_INDEX;
    return SEARCH_INDEX.filter((item) => matches(item, term));
  }, [query]);

  const optionId = (index: number) => `${listboxId}-option-${index}`;
  const activeOptionId = results[active] ? optionId(active) : undefined;

  function go(index: number) {
    const item = results[index];
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
          track("site_search_open", { source: "button" });
        }}
        aria-label="Search pages"
        title="Search (Ctrl K)"
        className="grid h-12 w-12 place-items-center rounded-pill border border-line text-ink-soft transition-colors duration-150 hover:border-ink hover:text-ink"
      >
        <Icon name="search" size={18} />
      </button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Search pages"
        hideTitle
        placement="top"
        flush
        hideClose
      >
        <div className="flex items-center gap-3 border-b border-line px-4">
          <span aria-hidden className="inline-flex shrink-0 text-ink-faint">
            <Icon name="search" size={18} />
          </span>
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded
            aria-controls={listboxId}
            aria-autocomplete="list"
            aria-activedescendant={activeOptionId}
            aria-label="Search pages"
            placeholder="Search pages…"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
            }}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") {
                event.preventDefault();
                setActive((index) => Math.min(index + 1, results.length - 1));
              } else if (event.key === "ArrowUp") {
                event.preventDefault();
                setActive((index) => Math.max(index - 1, 0));
              } else if (event.key === "Enter") {
                event.preventDefault();
                go(active);
              }
            }}
            data-bare-focus
            className="h-14 w-full bg-transparent text-base text-ink outline-none placeholder:text-ink-faint"
          />
          <kbd className="hidden shrink-0 rounded-sm border border-line px-1.5 py-0.5 text-caption text-ink-faint sm:block">
            Esc
          </kbd>
        </div>

        <ul id={listboxId} role="listbox" aria-label="Pages" className="max-h-[50vh] overflow-y-auto p-2">
          {results.length === 0 ? (
            <li className="px-3 py-6 text-center text-small text-ink-faint">
              No pages match “{query}”.
            </li>
          ) : (
            results.map((item, index) => (
              <li key={`${item.href}-${item.label}`} role="none">
                <button
                  id={optionId(index)}
                  type="button"
                  role="option"
                  aria-selected={index === active}
                  onMouseEnter={() => setActive(index)}
                  onFocus={() => setActive(index)}
                  onClick={() => go(index)}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 rounded-sm px-3 py-2.5 text-left text-small transition-colors duration-150",
                    index === active ? "bg-tint text-primary-deep" : "text-ink hover:bg-band",
                  )}
                >
                  <span className="font-medium">{item.label}</span>
                  <span
                    className={cn(
                      "shrink-0 text-caption",
                      index === active ? "text-primary-deep" : "text-ink-faint",
                    )}
                  >
                    {item.group}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      </Dialog>
    </>
  );
}
