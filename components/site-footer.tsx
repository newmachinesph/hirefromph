import Link from "next/link";
import site from "@/data/site.json";

export function SiteFooter() {
  return (
    <footer className="relative z-[2] mt-24 border-t border-line bg-ink text-paper-2">
      <div className="container-x py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
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

          {site.navGroups.map((g) => (
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

        <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-8 md:flex-row md:items-center md:justify-between">
          <p className="max-w-xl text-xs leading-relaxed text-paper-2/50">
            DevUp is an independent, non-commercial project. It has no
            community group, no newsletter, and no social accounts — when those
            exist, they will be linked here and not before.
          </p>
          <a
            href={`mailto:${site.contact.email}`}
            className="text-sm text-paper-2/70 transition-colors hover:text-coral"
          >
            {site.contact.email}
          </a>
        </div>

        <p className="mt-8 text-xs text-paper-2/40">
          © 2026 {site.brand}. Built for Filipino online professionals. Pay
          figures and market data are cited to their sources — they are
          estimates, not promises.
        </p>
      </div>
    </footer>
  );
}
