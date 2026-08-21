import Link from "next/link";
import { Container } from "@/components/layout";
import site from "@/data/site.json";
import { NAV_GROUPS, isLive } from "@/lib/nav";
import { Logo } from "./logo";

/** Shell copy. Phase 8 owns the final wording; the honesty rule does not move. */
const HONESTY =
  "Hire From PH is an independent, non-commercial project. Every page is free to read, and every figure carries its source.";

const COPYRIGHT =
  "Pay figures and market data are cited to their sources. They are estimates, not promises.";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line bg-band">
      <Container>
        <div className="grid gap-10 py-16 md:grid-cols-2 lg:grid-cols-[1.3fr_repeat(4,1fr)]">
          <div className="max-w-sm">
            <Link href="/" className="inline-flex rounded-md" aria-label="Hire From PH — home">
              <Logo markSize={32} />
            </Link>
            <p className="mt-5 text-small leading-relaxed text-ink-soft">{site.meaning}</p>
            <p className="mt-4 text-caption leading-relaxed text-ink-faint">{HONESTY}</p>
          </div>

          <nav aria-label="Footer" className="contents">
            {NAV_GROUPS.map((group) => (
              <div key={group.title}>
                <h2 className="text-kicker uppercase text-ink-faint">{group.title}</h2>
                <ul className="mt-4 space-y-2.5">
                  {group.links.filter(isLive).map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-small text-ink-soft transition-colors duration-150 hover:text-primary"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="border-t border-line py-8">
          <p className="text-caption text-ink-faint">
            © 2026 {site.brand}. {COPYRIGHT}
          </p>
        </div>
      </Container>
    </footer>
  );
}
