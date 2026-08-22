import { describe, expect, it } from "vitest";
import {
  LIBRARY,
  LIVE_LIBRARY,
  NAV,
  NAV_CTA,
  NAV_GROUPS,
  SEARCH_INDEX,
  SECONDARY_LINKS,
  findNavNeighbours,
  getBreadcrumb,
  isLive,
  isMenu,
  type NavLink,
} from "@/lib/nav";

/** Every link a dropdown can show, flattened. */
function menuLinks(): NavLink[] {
  return NAV.flatMap((item) =>
    isMenu(item) ? [...item.groups.flatMap((g) => g.links), ...(item.footerLinks ?? [])] : [],
  );
}

describe("findNavNeighbours", () => {
  it("returns the previous and next stage for a stage page", () => {
    expect(findNavNeighbours("/deliver")).toEqual({
      prev: { label: "Get Hired", href: "/get-hired" },
      next: { label: "Level Up", href: "/level-up" },
      up: { label: "Your path", href: "/path" },
    });
  });

  it("returns the neighbours inside the Learn bucket for a learn page", () => {
    expect(findNavNeighbours("/learn")).toEqual({
      prev: { label: "AI-First", href: "/ai-first" },
      next: { label: "Micro-Tasks", href: "/tasks" },
      up: { label: "Browse the library", href: "/library?group=learn" },
    });
  });

  it("returns nothing for a route that is not in the nav", () => {
    expect(findNavNeighbours("/not-a-route")).toEqual({});
  });

  it("walks to the last live link in More and stops there", () => {
    // "For educators" shipped, so it is the last live link in More.
    expect(findNavNeighbours("/privacy").next).toEqual({ label: "For educators", href: "/educators" });
    expect(findNavNeighbours("/privacy").prev).toEqual({ label: "Insights", href: "/insights" });
    expect(findNavNeighbours("/educators").next).toBeUndefined();
  });

  it("skips links whose route ships in a later phase", () => {
    expect(isLive({ pending: true })).toBe(false);
    expect(isLive({})).toBe(true);
  });
});

describe("getBreadcrumb", () => {
  it("builds Home > group > page for a stage page", () => {
    expect(getBreadcrumb("/deliver")).toEqual([
      { label: "Home", href: "/" },
      { label: "The path", href: "/library?group=path" },
      { label: "Deliver" },
    ]);
  });

  it("builds Home > group > page for a learn page", () => {
    expect(getBreadcrumb("/method")).toEqual([
      { label: "Home", href: "/" },
      { label: "Learn", href: "/library?group=learn" },
      { label: "The Method" },
    ]);
  });

  it("links the dashboard crumb through the library now that /path is listed there", () => {
    expect(getBreadcrumb("/path")).toEqual([
      { label: "Home", href: "/" },
      { label: "The path", href: "/library?group=path" },
      { label: "Your dashboard" },
    ]);
  });

  it("falls back to the nav bucket for routes outside the library", () => {
    expect(getBreadcrumb("/privacy")).toEqual([
      { label: "Home", href: "/" },
      { label: "More" },
      { label: "Privacy" },
    ]);
  });

  it("names the same bucket as the footer 'up' link for every library entry", () => {
    // The breadcrumb reads the library group; PageFooterNav reads navGroups.
    // They only agree if every entry's group is its navGroups bucket.
    const bucket: Record<string, string> = { "The path": "path", Learn: "learn", Work: "work", More: "more" };
    const mismatched = LIBRARY.filter((entry) => {
      const group = NAV_GROUPS.find((g) => g.links.some((l) => l.href === entry.href));
      return !group || bucket[group.title] !== entry.group;
    });
    expect(mismatched.map((entry) => `${entry.href}: ${entry.group}`)).toEqual([]);
  });

  it("returns a single unlinked crumb for the homepage", () => {
    expect(getBreadcrumb("/")).toEqual([{ label: "Home" }]);
  });
});

describe("nav data", () => {
  it("has four top-level items ending in a direct link to /reality", () => {
    expect(NAV.map((i) => i.label)).toEqual(["Path", "Learn", "Work", "Reality Check"]);
    expect(NAV.filter((i) => !isMenu(i))).toEqual([{ label: "Reality Check", href: "/reality" }]);
  });

  it("points the header CTA at /start", () => {
    expect(NAV_CTA).toEqual({ label: "Find your path", href: "/start" });
  });

  it("lists every dropdown link in navGroups too", () => {
    const grouped = new Set(NAV_GROUPS.flatMap((g) => g.links.map((l) => l.href)));
    const missing = menuLinks()
      .map((l) => l.href)
      .filter((href) => !grouped.has(href));
    expect(missing).toEqual([]);
  });

  it("gives every dropdown link a 6-10 word description", () => {
    const bad = menuLinks().filter((l) => {
      const words = (l.desc ?? "").trim().split(/\s+/).filter(Boolean).length;
      return words < 6 || words > 10;
    });
    expect(bad.map((l) => l.href)).toEqual([]);
  });

  it("keeps the banned shell words out of nav descriptions", () => {
    const banned = /\b(actually|forever|genuinely|truly|virtual assistants?)\b/i;
    expect(menuLinks().filter((l) => banned.test(l.desc ?? "")).map((l) => l.href)).toEqual([]);
  });

  it("offers Library, Insights, Privacy and For educators as secondary links, without the pending ones", () => {
    expect(SECONDARY_LINKS.map((l) => l.href)).toEqual(["/library", "/insights", "/privacy", "/educators"]);
  });
});

describe("SEARCH_INDEX", () => {
  it("indexes the live library", () => {
    expect(SEARCH_INDEX.some((i) => i.href === "/method")).toBe(true);
    expect(LIVE_LIBRARY).toHaveLength(LIBRARY.filter(isLive).length);
  });

  it("indexes nav routes that the library does not list", () => {
    expect(SEARCH_INDEX.some((i) => i.href === "/privacy")).toBe(true);
    expect(SEARCH_INDEX.some((i) => i.href === "/library")).toBe(true);
  });

  it("lists the dashboard in the library, under The path", () => {
    const path = LIBRARY.find((entry) => entry.href === "/path");
    expect(path).toMatchObject({ label: "Your dashboard", group: "path", type: "tool" });
  });

  it("indexes every niche by name so it is findable from the palette", () => {
    expect(SEARCH_INDEX.some((i) => i.label === "Bookkeeping & Accounting" && i.href === "/niches")).toBe(true);
  });

  it("indexes /practice and /glossary now that they have shipped", () => {
    expect(SEARCH_INDEX.some((i) => i.href === "/practice")).toBe(true);
    expect(SEARCH_INDEX.some((i) => i.href === "/glossary")).toBe(true);
  });

  it("indexes /educators now that it has shipped", () => {
    expect(SEARCH_INDEX.some((i) => i.href === "/educators")).toBe(true);
  });

  it("every SEARCH_INDEX href is live: it never points at a pending library or nav route", () => {
    const pendingHrefs = new Set(
      [...LIBRARY, ...NAV_GROUPS.flatMap((group) => group.links)]
        .filter((link) => !isLive(link))
        .map((link) => link.href),
    );
    expect(SEARCH_INDEX.some((item) => pendingHrefs.has(item.href))).toBe(false);
  });

  it("lists each href once", () => {
    const nonNiche = SEARCH_INDEX.filter((i) => i.href !== "/niches").map((i) => i.href);
    expect(new Set(nonNiche).size).toBe(nonNiche.length);
  });
});
