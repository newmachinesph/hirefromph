"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Accordion, AccordionItem, Button, Dialog, Icon } from "@/components/ui";
import { NAV, NAV_CTA, SECONDARY_LINKS, isLive, isMenu, type NavDirect, type NavLink } from "@/lib/nav";
import { cn } from "@/lib/utils";

/** 48px rows, one column (spec §6.2). */
const ROW = "flex min-h-12 items-center rounded-sm px-3 text-base transition-colors duration-150";

/**
 * `Dialog` only ships `placement: "center" | "top"` (Phase 1). Rather than
 * widen that union for a single caller, this pins the panel to the right
 * edge and stretches it full-height with `!`-important utilities, which
 * beat Dialog's own (non-important) position/size classes regardless of
 * class-list order since `cn` here is plain `clsx`, not `tailwind-merge`.
 * `--shadow-md` and the backdrop/focus-trap/Esc/scroll-lock behavior all
 * still come from `Dialog` untouched.
 */
const PANEL = "!fixed !inset-y-0 !right-0 !max-w-xs !rounded-none";

export function MobileDrawer() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setOpen(false);
  }, [pathname]);
  /* eslint-enable react-hooks/set-state-in-effect */

  function row(link: NavLink) {
    const active = pathname === link.href;
    return (
      <li key={link.href}>
        <Link
          href={link.href}
          aria-current={active ? "page" : undefined}
          className={cn(ROW, active ? "font-semibold text-primary" : "text-ink hover:bg-band")}
        >
          {link.label}
        </Link>
      </li>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        className="grid h-12 w-12 place-items-center rounded-pill border border-line text-ink transition-colors duration-150 hover:border-ink lg:hidden"
      >
        <Icon name="list" size={20} />
      </button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Menu"
        hideTitle
        flush
        className={PANEL}
      >
        <div className="flex h-full flex-col overflow-y-auto">
          <div className="grid border-b border-line p-4">
            <Button href={NAV_CTA.href} variant="primary" size="lg">
              {NAV_CTA.label}
            </Button>
          </div>

          <nav aria-label="Mobile" className="flex-1 p-2">
            <Accordion type="single">
              {NAV.filter(isMenu).map((item) => (
                <AccordionItem
                  key={item.label}
                  id={`drawer-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                  title={item.label}
                >
                  <ul className="flex flex-col">
                    {[
                      ...item.groups.flatMap((group) => group.links),
                      ...(item.footerLinks ?? []),
                    ]
                      .filter(isLive)
                      .map(row)}
                  </ul>
                </AccordionItem>
              ))}
            </Accordion>

            <ul className="mt-1 flex flex-col border-t border-line pt-1">
              {NAV.filter((item): item is NavDirect => !isMenu(item)).map(row)}
            </ul>
          </nav>

          <ul className="flex flex-col border-t border-line p-2">
            {SECONDARY_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(ROW, "text-ink-soft hover:bg-band hover:text-ink")}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Dialog>
    </>
  );
}
