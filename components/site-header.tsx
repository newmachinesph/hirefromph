"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Menu, X, Check, ChevronDown } from "lucide-react";
import site from "@/data/site.json";
// Slim id→name map so the always-loaded header doesn't bundle the full
// tracks.json into every route. Keep in sync with data/tracks.json ids/names.
import trackNames from "@/data/track-names.json";
import { usePath } from "@/lib/path-context";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";
import { SearchPalette } from "@/components/search-palette";

// TODO(Phase 2 Task 8): site.nav replaces the old primaryNav; this file will
// be rebuilt against the full nav/groups tree and this shim removed.
type NavItem = (typeof site.nav)[number];
const primaryNav = site.nav.flatMap((item: NavItem) =>
  "href" in item && item.href ? [{ label: item.label, href: item.href }] : [],
);

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [explore, setExplore] = useState(false);
  const { hasPath, state, hydrated } = usePath();
  const exploreRef = useRef<HTMLDivElement>(null);

  // Track scroll position without a setState-in-effect (React 19 idiom).
  const scrolled = useSyncExternalStore(
    (cb) => {
      window.addEventListener("scroll", cb, { passive: true });
      return () => window.removeEventListener("scroll", cb);
    },
    () => window.scrollY > 12,
    () => false,
  );

  // Reset the transient menu UI on navigation — covers link clicks and browser
  // back/forward. A deliberate UI-reset-on-route-change effect, not derivable state.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setExplore(false);
    setOpen(false);
  }, [pathname]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Close the Explore mega-menu on outside click / Escape.
  useEffect(() => {
    if (!explore) return;
    const onClick = (e: MouseEvent) => {
      if (exploreRef.current && !exploreRef.current.contains(e.target as Node)) {
        setExplore(false);
      }
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setExplore(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [explore]);

  const activeTrackName = state.track
    ? (trackNames as Record<string, string>)[state.track]
    : undefined;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled || explore
          ? "border-b border-line bg-paper/85 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="container-x flex h-16 items-center justify-between gap-4">
        <Link href="/" className="shrink-0">
          <Logo markSize={32} showTagline />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
          {primaryNav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-ink text-paper-2"
                    : "text-ink-soft hover:bg-paper-3 hover:text-ink",
                )}
              >
                {item.label}
              </Link>
            );
          })}

          {/* Explore mega-menu — surfaces every page on desktop */}
          <div className="relative" ref={exploreRef}>
            <button
              type="button"
              onClick={() => setExplore((v) => !v)}
              aria-expanded={explore}
              aria-haspopup="true"
              className={cn(
                "flex items-center gap-1 rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
                explore
                  ? "bg-ink text-paper-2"
                  : "text-ink-soft hover:bg-paper-3 hover:text-ink",
              )}
            >
              Explore
              <ChevronDown
                size={15}
                className={cn("transition-transform", explore && "rotate-180")}
              />
            </button>

            {explore && (
              <div className="absolute right-0 top-[calc(100%+0.6rem)] w-[50rem] max-w-[calc(100vw-2rem)] rounded-2xl border border-line bg-paper-2 p-5 shadow-[var(--shadow-lg)]">
                {/* Primary: the journey, as a numbered stepper */}
                {site.navGroups
                  .filter((g) => "primary" in g && g.primary)
                  .map((group) => (
                    <div
                      key={group.title}
                      className="rounded-xl border border-signal/25 bg-signal-tint/40 p-4"
                    >
                      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                        <h2 className="kicker text-signal">{group.title}</h2>
                        {"desc" in group && typeof group.desc === "string" && group.desc && (
                          <p className="text-xs leading-snug text-ink-faint">
                            {group.desc}
                          </p>
                        )}
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5">
                        {group.links.map((item, idx) => {
                          const active = pathname === item.href;
                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              aria-current={active ? "page" : undefined}
                              className={cn(
                                "flex items-center gap-2.5 rounded-xl border px-3 py-2.5 transition-all hover:-translate-y-0.5 hover:border-signal hover:shadow-[var(--shadow-sm)]",
                                active
                                  ? "border-signal bg-paper-2"
                                  : "border-signal/15 bg-paper-2/70",
                              )}
                            >
                              <span
                                className={cn(
                                  "font-display text-lg leading-none",
                                  active ? "text-signal" : "text-signal/50",
                                )}
                              >
                                0{idx + 1}
                              </span>
                              <span className="text-sm font-medium leading-tight text-ink">
                                {item.label}
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                {/* Secondary: dip-in groups, long lists split to two columns */}
                <div className="mt-5 grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-3">
                  {site.navGroups
                    .filter((g) => !("primary" in g && g.primary))
                    .map((group) => (
                      <div key={group.title}>
                        <h2 className="kicker text-signal">{group.title}</h2>
                        {"desc" in group && typeof group.desc === "string" && group.desc && (
                          <p className="mt-1.5 text-xs leading-snug text-ink-faint">
                            {group.desc}
                          </p>
                        )}
                        <div className="mt-2.5 flex flex-col gap-0.5">
                          {group.links.map((item) => {
                            const active = pathname === item.href;
                            return (
                              <Link
                                key={item.href}
                                href={item.href}
                                aria-current={active ? "page" : undefined}
                                className={cn(
                                  "truncate rounded-lg px-2.5 py-1.5 text-sm transition-colors",
                                  active
                                    ? "bg-ink text-paper-2"
                                    : "text-ink-soft hover:bg-paper-3 hover:text-ink",
                                )}
                              >
                                {item.label}
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </nav>

        <div className="flex items-center gap-2">
          <SearchPalette />
          {hydrated && hasPath && activeTrackName ? (
            <Link
              href="/path"
              className="hidden items-center gap-2 rounded-full border border-verified/30 bg-verified-tint px-3.5 py-2 text-sm font-medium text-verified sm:inline-flex"
            >
              <Check size={15} />
              {activeTrackName}
            </Link>
          ) : (
            <Link
              href="/start"
              className="hidden rounded-full bg-signal px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-signal-deep hover:-translate-y-0.5 sm:inline-block"
            >
              Start here
            </Link>
          )}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={open}
            className="grid h-11 w-11 place-items-center rounded-full border border-line-strong bg-paper-2 text-ink lg:hidden"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-line bg-paper-2 lg:hidden">
          <nav aria-label="Mobile" className="container-x flex flex-col gap-6 py-6">
            {site.navGroups.map((group) => (
              <div key={group.title}>
                <h2 className="kicker">{group.title}</h2>
                <div className="mt-2 grid grid-cols-2 gap-1">
                  {group.links.map((item) => {
                    const active = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                          active
                            ? "bg-ink text-paper-2"
                            : "text-ink-soft hover:bg-paper-3",
                        )}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
