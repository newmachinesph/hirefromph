"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { CardGrid } from "@/components/layout";
import { Badge, Card, CardBody, EmptyState, Heading, Text } from "@/components/ui";
import {
  GROUP_LABELS,
  LIBRARY_GROUPS,
  LIBRARY_TYPES,
  LIVE_LIBRARY,
  TYPE_LABELS,
  type LibraryGroup,
  type LibraryType,
} from "@/lib/nav";
import { cn } from "@/lib/utils";

type GroupFilter = LibraryGroup | "all";
type TypeFilter = LibraryType | "all";

/** One accent per type so the badge row reads at a glance (spec §4.2). */
const TYPE_TONE: Record<LibraryType, "info" | "signal" | "verified" | "caution"> = {
  guide: "info",
  workshop: "signal",
  tool: "verified",
  data: "caution",
};

function asGroup(value: string | null): GroupFilter {
  return LIBRARY_GROUPS.includes(value as LibraryGroup) ? (value as LibraryGroup) : "all";
}

function asType(value: string | null): TypeFilter {
  return LIBRARY_TYPES.includes(value as LibraryType) ? (value as LibraryType) : "all";
}

const CHIP =
  "min-h-11 inline-flex items-center rounded-pill border px-3.5 py-2 text-small font-medium transition-colors duration-150";
const CHIP_ON = "border-primary bg-tint text-primary-deep";
const CHIP_OFF = "border-line text-ink-soft hover:border-ink hover:text-ink";

export function LibraryBrowser() {
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  // Local state keeps typing and chip clicks instant; the URL is a mirror so a
  // filtered view can be shared or bookmarked.
  const [group, setGroup] = useState<GroupFilter>(() => asGroup(params.get("group")));
  const [type, setType] = useState<TypeFilter>(() => asType(params.get("type")));
  const [query, setQuery] = useState(() => params.get("q") ?? "");

  function syncUrl(next: { group: GroupFilter; type: TypeFilter; query: string }) {
    const search = new URLSearchParams();
    if (next.group !== "all") search.set("group", next.group);
    if (next.type !== "all") search.set("type", next.type);
    if (next.query.trim()) search.set("q", next.query.trim());
    const qs = search.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  function pickGroup(next: GroupFilter) {
    setGroup(next);
    syncUrl({ group: next, type, query });
  }

  function pickType(next: TypeFilter) {
    setType(next);
    syncUrl({ group, type: next, query });
  }

  function setSearch(next: string) {
    setQuery(next);
    syncUrl({ group, type, query: next });
  }

  function clear() {
    setGroup("all");
    setType("all");
    setQuery("");
    syncUrl({ group: "all", type: "all", query: "" });
  }

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    return LIVE_LIBRARY.filter(
      (entry) =>
        (group === "all" || entry.group === group) &&
        (type === "all" || entry.type === type) &&
        (term === "" ||
          entry.label.toLowerCase().includes(term) ||
          entry.desc.toLowerCase().includes(term)),
    );
  }, [group, type, query]);

  const filtered = group !== "all" || type !== "all" || query.trim() !== "";

  return (
    <div>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-kicker uppercase text-ink-faint">Group</span>
          <button
            type="button"
            aria-pressed={group === "all"}
            onClick={() => pickGroup("all")}
            className={cn(CHIP, group === "all" ? CHIP_ON : CHIP_OFF)}
          >
            All groups
          </button>
          {LIBRARY_GROUPS.map((id) => (
            <button
              key={id}
              type="button"
              aria-pressed={group === id}
              onClick={() => pickGroup(id)}
              className={cn(CHIP, group === id ? CHIP_ON : CHIP_OFF)}
            >
              {GROUP_LABELS[id]}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-kicker uppercase text-ink-faint">Type</span>
          <button
            type="button"
            aria-pressed={type === "all"}
            onClick={() => pickType("all")}
            className={cn(CHIP, type === "all" ? CHIP_ON : CHIP_OFF)}
          >
            All types
          </button>
          {LIBRARY_TYPES.map((id) => (
            <button
              key={id}
              type="button"
              aria-pressed={type === id}
              onClick={() => pickType(id)}
              className={cn(CHIP, type === id ? CHIP_ON : CHIP_OFF)}
            >
              {TYPE_LABELS[id]}
            </button>
          ))}
        </div>

        <input
          type="search"
          value={query}
          onChange={(event) => setSearch(event.target.value)}
          aria-label="Search the library"
          placeholder="Search by name or description…"
          className="h-12 w-full max-w-md rounded-sm border border-control bg-paper px-4 text-base text-ink outline-none placeholder:text-ink-faint focus-visible:border-primary"
        />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3 border-b border-line pb-4">
        <Text size="small" tone="soft">
          {results.length} of {LIVE_LIBRARY.length} pages
        </Text>
        {filtered && (
          <button
            type="button"
            onClick={clear}
            className="rounded-sm text-small font-semibold text-primary transition-colors duration-150 hover:text-primary-deep"
          >
            Clear filters
          </button>
        )}
      </div>

      <div className="mt-8">
        {results.length === 0 ? (
          <EmptyState
            title="No pages match those filters."
            body="Clear a filter or try a shorter search term."
          />
        ) : (
          <CardGrid cols={3}>
            {results.map((entry) => (
              <Card key={entry.href} href={entry.href} interactive>
                <CardBody>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={TYPE_TONE[entry.type]} variant="soft">
                      {TYPE_LABELS[entry.type]}
                    </Badge>
                    {entry.stage !== undefined && (
                      <Badge tone="neutral" variant="outline">
                        Stage {entry.stage}
                      </Badge>
                    )}
                  </div>
                  <div className="mt-3">
                    <Heading level={2} size="h5">
                      {entry.label}
                    </Heading>
                  </div>
                  <div className="mt-2">
                    <Text size="small" tone="soft">
                      {entry.desc}
                    </Text>
                  </div>
                </CardBody>
              </Card>
            ))}
          </CardGrid>
        )}
      </div>
    </div>
  );
}
