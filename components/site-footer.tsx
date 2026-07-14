import Link from "next/link";
import site from "@/data/site.json";
import { Icon } from "@/components/icon";
import { ArrowUpRight } from "lucide-react";

const groups = [
  {
    title: "The Journey",
    links: [
      { label: "Start", href: "/start" },
      { label: "Get Hired", href: "/get-hired" },
      { label: "Deliver", href: "/deliver" },
      { label: "Level Up", href: "/level-up" },
    ],
  },
  {
    title: "Learn to build",
    links: [
      { label: "The Method", href: "/method" },
      { label: "Build Labs", href: "/build" },
      { label: "AI Leverage", href: "/prompts" },
      { label: "Learn Any Tool", href: "/tools" },
    ],
  },
  {
    title: "Grow",
    links: [
      { label: "30-Day Plan", href: "/plan" },
      { label: "Niches", href: "/niches" },
      { label: "Find Work", href: "/apply" },
      { label: "Languages", href: "/languages" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="relative z-[2] mt-24 border-t border-line bg-ink text-paper-2">
      <div className="container-x py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="max-w-sm">
            <Link href="/" className="font-display text-3xl tracking-tight">
              Dev<span className="text-coral">Up</span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-paper-2/70">
              {site.mission}
            </p>
            <p className="mt-6 kicker text-coral">{site.meaning}</p>
            <p className="mt-2 kicker text-paper-2/50">Free access · No paywall · No upsell</p>
          </div>

          {groups.map((g) => (
            <div key={g.title}>
              <h3 className="kicker text-paper-2/50">{g.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {g.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm text-paper-2/80 transition-colors hover:text-coral"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-6 border-t border-white/10 pt-8 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {site.socials.map((s) => (
              <a
                key={s.label}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 rounded-full border border-white/15 px-3.5 py-2 text-xs font-medium text-paper-2/80 transition-colors hover:border-coral hover:text-coral"
              >
                <Icon name={s.icon} size={14} />
                {s.handle}
                <ArrowUpRight size={12} className="opacity-0 transition-opacity group-hover:opacity-100" />
              </a>
            ))}
          </div>
          <a
            href={`mailto:${site.contact.email}`}
            className="text-sm text-paper-2/70 transition-colors hover:text-coral"
          >
            {site.contact.email}
          </a>
        </div>

        <p className="mt-8 text-xs text-paper-2/40">
          © 2026 {site.brand}. Built for Filipino online professionals. An independent, illustrative build — all content is placeholder.
        </p>
      </div>
    </footer>
  );
}
