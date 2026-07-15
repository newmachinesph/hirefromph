"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, X, Check, ChevronDown } from "lucide-react";
import site from "@/data/site.json";
// Slim id→name map so the always-loaded header doesn't bundle the full
// tracks.json into every route. Keep in sync with data/tracks.json ids/names.
import trackNames from "@/data/track-names.json";
import { usePath } from "@/lib/path-context";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [explore, setExplore] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { hasPath, state, hydrated } = usePath();
  const exploreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close both menus whenever the route changes.
  useEffect(() => {
    setExplore(false);
    setOpen(false);
  }, [pathname]);

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
        <Link href="/" className="shrink-0" aria-label="DevUp home">
          <Logo markSize={32} />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {site.primaryNav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
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
              <div className="absolute right-0 top-[calc(100%+0.6rem)] w-[46rem] max-w-[calc(100vw-2rem)] rounded-2xl border border-line bg-paper-2 p-6 shadow-[var(--shadow-lg)]">
                <div className="grid grid-cols-2 gap-x-8 gap-y-6 xl:grid-cols-4">
                  {site.navGroups.map((group) => (
                    <div key={group.title}>
                      <h2 className="kicker text-coral">{group.title}</h2>
                      <div className="mt-3 flex flex-col gap-0.5">
                        {group.links.map((item) => {
                          const active = pathname === item.href;
                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              className={cn(
                                "rounded-lg px-2.5 py-1.5 text-sm transition-colors",
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
          {hydrated && hasPath && activeTrackName ? (
            <Link
              href="/path"
              className="hidden items-center gap-2 rounded-full border border-emerald/30 bg-emerald-tint px-3.5 py-2 text-sm font-medium text-emerald sm:inline-flex"
            >
              <Check size={15} />
              {activeTrackName}
            </Link>
          ) : (
            <Link
              href="/start"
              className="hidden rounded-full bg-coral px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-coral-deep hover:-translate-y-0.5 sm:inline-block"
            >
              Start here
            </Link>
          )}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={open}
            className="grid h-10 w-10 place-items-center rounded-full border border-line-strong bg-paper-2 text-ink lg:hidden"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-line bg-paper-2 lg:hidden">
          <nav className="container-x flex flex-col gap-6 py-6">
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
