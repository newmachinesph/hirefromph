import Link from "next/link";
import site from "@/data/site.json";
import { Logo } from "@/components/logo";

export function SiteFooter() {
  return (
    <footer className="relative z-[2] mt-24 border-t border-line bg-ink text-paper-2">
      <div className="container-x py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div className="max-w-sm">
            <Link href="/">
              <Logo
                markSize={34}
                onDark
                wordmark={
                  <span className="text-3xl">
                    Hire From <span className="text-signal-light">PH</span>
                  </span>
                }
              />
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-paper-2/70">
              {site.mission}
            </p>
            <p className="mt-6 kicker text-paper-2">{site.meaning}</p>
            <p className="mt-2 kicker text-paper-2/50">
              Open access · Always will be
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
                        className="text-sm text-paper-2/80 transition-colors hover:text-signal-light"
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

        <div className="mt-14 flex flex-col gap-6 border-t border-white/10 pt-8 md:flex-row md:items-center md:justify-start">
          <p className="max-w-xl text-xs leading-relaxed text-paper-2/50">
            Hire From PH is an independent, anonymous, non-commercial project. No names,
            no sales team, no agenda beyond leveling you up. Everything on this
            site is free, permanently.
          </p>
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
