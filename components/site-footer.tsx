import Link from "next/link";
import { Users } from "lucide-react";
import site from "@/data/site.json";
import { Logo, FacebookGlyph } from "@/components/logo";

export function SiteFooter() {
  return (
    <footer className="relative z-[2] mt-24 border-t border-line bg-ink text-paper-2">
      <div className="container-x py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div className="max-w-sm">
            <Link href="/" aria-label="DevUp home">
              <Logo
                markSize={34}
                wordmark={
                  <span className="text-3xl">
                    Dev<span className="text-coral">Up</span>
                  </span>
                }
              />
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-paper-2/70">
              {site.mission}
            </p>
            <p className="mt-6 kicker text-coral">{site.meaning}</p>
            <p className="mt-2 kicker text-paper-2/50">
              Open access · Always will be
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={site.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-paper-2 transition-colors hover:border-coral hover:text-coral"
              >
                <FacebookGlyph size={16} />
                Follow our Page
              </a>
              <a
                href={site.social.facebookGroup}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-coral px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-coral-deep hover:-translate-y-0.5"
              >
                <Users size={16} />
                Join our Group
              </a>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-paper-2/50">
              The group is where the surprises land. Free drops and bombs for
              members, walang catch.
            </p>
          </div>

          <nav aria-label="Footer" className="contents">
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
          </nav>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-8 md:flex-row md:items-center md:justify-between">
          <p className="max-w-xl text-xs leading-relaxed text-paper-2/50">
            DevUp is an independent, anonymous, non-commercial project. No names,
            no sales team, no agenda beyond leveling you up. Our only channel is
            our Facebook page, linked here, and everything on this site is free,
            permanently.
          </p>
          <a
            href={site.social.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-paper-2/70 transition-colors hover:text-coral"
          >
            <FacebookGlyph size={15} />
            facebook.com/devupph
          </a>
        </div>

        <p className="mt-8 text-xs text-paper-2/60">
          © 2026 {site.brand}. Built for Filipino online professionals. Pay
          figures and market data are cited to their sources. They are estimates,
          not promises.
        </p>
      </div>
    </footer>
  );
}
