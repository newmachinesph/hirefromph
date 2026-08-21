import libraryData from "@/data/library.json";
import siteData from "@/data/site.json";
// Slim id -> name map. The header imports this module, so it must never reach
// data/tracks.json (70 KB); track-names.json is 1 KB.
import trackNames from "@/data/track-names.json";

/* ---------------------------------------------------------------- */
/*  Types                                                            */
/* ---------------------------------------------------------------- */

/** A link marked `pending` is authored in the IA but its route ships in a
 *  later phase (/practice, /glossary in Phase 6; /educators in Phase 7).
 *  Nothing renders it, the sitemap omits it, and scripts/verify-links.mjs
 *  skips it. Switching it on is deleting the key. */
export type NavLink = { label: string; href: string; desc?: string; pending?: boolean };
export type NavColumn = { title: string; links: NavLink[] };
export type NavMenu = { label: string; groups: NavColumn[]; footerLinks?: NavLink[] };
export type NavDirect = { label: string; href: string };
export type NavItem = NavMenu | NavDirect;
export type NavGroup = { title: string; up: NavLink; links: NavLink[] };

export type LibraryGroup = "path" | "learn" | "work" | "tools";
export type LibraryType = "guide" | "workshop" | "tool" | "data";
export type LibraryEntry = {
  label: string;
  href: string;
  group: LibraryGroup;
  type: LibraryType;
  stage?: number;
  desc: string;
  pending?: boolean;
};

export type Crumb = { label: string; href?: string };
export type NavNeighbours = { prev?: NavLink; next?: NavLink; up?: NavLink };
export type SearchItem = { label: string; href: string; group: string; desc?: string };

/* ---------------------------------------------------------------- */
/*  Data                                                             */
/* ---------------------------------------------------------------- */

export const NAV = siteData.nav as NavItem[];
export const NAV_GROUPS = siteData.navGroups as NavGroup[];
export const NAV_CTA = siteData.cta as NavLink;
export const LIBRARY = libraryData.entries as LibraryEntry[];

export const LIBRARY_GROUPS: LibraryGroup[] = ["path", "learn", "work", "tools"];
export const LIBRARY_TYPES: LibraryType[] = ["guide", "workshop", "tool", "data"];

export const GROUP_LABELS: Record<LibraryGroup, string> = {
  path: "The path",
  learn: "Learn",
  work: "Work",
  tools: "Tools",
};

export const TYPE_LABELS: Record<LibraryType, string> = {
  guide: "Guide",
  workshop: "Workshop",
  tool: "Tool",
  data: "Data",
};

export function isMenu(item: NavItem): item is NavMenu {
  return "groups" in item;
}

export function isLive(link: { pending?: boolean }): boolean {
  return link.pending !== true;
}

export const LIVE_LIBRARY: LibraryEntry[] = LIBRARY.filter(isLive);

/** Links for the bottom of the mobile drawer: the "More" bucket, minus the
 *  routes that already have their own top-level nav item. */
export const SECONDARY_LINKS: NavLink[] = (() => {
  const topLevel = new Set(
    NAV.filter((item): item is NavDirect => !isMenu(item)).map((item) => item.href),
  );
  const more = NAV_GROUPS.find((group) => group.title === "More");
  return (more?.links ?? []).filter((link) => isLive(link) && !topLevel.has(link.href));
})();

/** One flat index for the search palette: every live library page, the nav
 *  routes the library does not list, then every niche by name. */
export const SEARCH_INDEX: SearchItem[] = (() => {
  const libraryHrefs = new Set(LIVE_LIBRARY.map((entry) => entry.href));

  const fromLibrary: SearchItem[] = LIVE_LIBRARY.map((entry) => ({
    label: entry.label,
    href: entry.href,
    group: GROUP_LABELS[entry.group],
    desc: entry.desc,
  }));

  const fromNav: SearchItem[] = NAV_GROUPS.flatMap((group) =>
    group.links
      .filter((link) => isLive(link) && !libraryHrefs.has(link.href))
      .map((link) => ({ label: link.label, href: link.href, group: group.title })),
  );

  const fromNiches: SearchItem[] = Object.values(trackNames).map((name) => ({
    label: name,
    href: "/niches",
    group: "Niches",
  }));

  return [...fromLibrary, ...fromNav, ...fromNiches];
})();

/* ---------------------------------------------------------------- */
/*  Wayfinding                                                       */
/* ---------------------------------------------------------------- */

/**
 * Home > group > page. The group crumb links to the matching /library filter
 * when the route is in the library; routes outside it (/path, /privacy,
 * /library) get an unlinked bucket crumb from navGroups.
 */
export function getBreadcrumb(href: string): Crumb[] {
  if (href === "/") return [{ label: "Home" }];

  const home: Crumb = { label: "Home", href: "/" };

  const entry = LIBRARY.find((candidate) => candidate.href === href);
  if (entry) {
    return [
      home,
      { label: GROUP_LABELS[entry.group], href: `/library?group=${entry.group}` },
      { label: entry.label },
    ];
  }

  for (const group of NAV_GROUPS) {
    const link = group.links.find((candidate) => candidate.href === href);
    if (link) return [home, { label: group.title }, { label: link.label }];
  }

  return [home];
}

/**
 * Previous / next within the route's navGroups bucket, plus the bucket's
 * "up" target. Pending links are skipped so the arrows never point at a
 * route that does not exist yet. Feeds `PageFooterNav` from Phase 4 onward.
 */
export function findNavNeighbours(href: string): NavNeighbours {
  for (const group of NAV_GROUPS) {
    const live = group.links.filter(isLive);
    const index = live.findIndex((link) => link.href === href);
    if (index === -1) continue;
    return {
      prev: index > 0 ? live[index - 1] : undefined,
      next: index < live.length - 1 ? live[index + 1] : undefined,
      up: group.up,
    };
  }
  return {};
}
