"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, Check } from "lucide-react";
import site from "@/data/site.json";
import tracks from "@/data/tracks.json";
import { usePath } from "@/lib/path-context";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { hasPath, state, hydrated } = usePath();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const activeTrack = tracks.tracks.find((t) => t.id === state.track);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-line bg-paper/85 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="container-x flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-ink text-paper-2 font-display text-lg leading-none">
            D
          </span>
          <span className="font-display text-xl tracking-tight">
            Dev<span className="text-coral">Up</span>
          </span>
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
        </nav>

        <div className="flex items-center gap-2">
          {hydrated && hasPath && activeTrack ? (
            <Link
              href="/path"
              className="hidden items-center gap-2 rounded-full border border-emerald/30 bg-emerald-tint px-3.5 py-2 text-sm font-medium text-emerald sm:inline-flex"
            >
              <Check size={15} />
              {activeTrack.name}
            </Link>
          ) : (
            <Link
              href="/start"
              className="hidden rounded-full bg-coral px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-coral-deep hover:-translate-y-0.5 sm:inline-block"
            >
              Start free
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
        <div className="border-t border-line bg-paper-2 lg:hidden">
          <nav className="container-x grid grid-cols-2 gap-1 py-4">
            {site.nav.map((item) => {
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
          </nav>
        </div>
      )}
    </header>
  );
}
