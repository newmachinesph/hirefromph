import { LIBRARY, type LibraryEntry } from "@/lib/nav";

/**
 * One-line descriptions for a route, taken from data/library.json so the
 * homepage cards and the stage pages' "Tools for this stage" never re-author
 * copy that already exists (spec §8.1.5, §8.2).
 */
const BY_HREF = new Map<string, LibraryEntry>(
  LIBRARY.map((entry) => [entry.href, entry]),
);

export function routeEntry(href: string): LibraryEntry | undefined {
  return BY_HREF.get(href);
}

export function routeDesc(href: string): string | undefined {
  return BY_HREF.get(href)?.desc;
}
